/**
 * Enhanced Embroidery Manager
 * Advanced stitch management with persistence, layering, and performance optimization
 */
import { StitchCatalog } from '../embroidery/StitchCatalog';
export class EnhancedEmbroideryManager {
    constructor(canvas) {
        this.stitches = [];
        this.layers = [];
        this.currentLayerId = '';
        this.canvas = null;
        this.ctx = null;
        this.renderQueue = [];
        this.isRendering = false;
        this.performanceMode = false;
        this.maxStitchesPerFrame = 50;
        this.stitchCache = new Map();
        this.layerCache = new Map();
        if (canvas) {
            this.setCanvas(canvas);
        }
        this.initializeDefaultLayer();
    }
    setCanvas(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        if (this.ctx) {
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';
        }
    }
    initializeDefaultLayer() {
        const defaultLayer = {
            id: 'default',
            name: 'Default Layer',
            visible: true,
            locked: false,
            opacity: 1.0,
            order: 0,
            stitches: []
        };
        this.layers = [defaultLayer];
        this.currentLayerId = 'default';
    }
    // Stitch Management
    addStitch(stitch) {
        let newStitch = {
            ...stitch,
            id: `stitch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            layer: this.getCurrentLayer().id,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            metadata: undefined
        };
        // Compute metadata using the fully constructed stitch
        newStitch = { ...newStitch, metadata: this.calculateStitchMetadata(newStitch) };
        this.stitches.push(newStitch);
        this.getCurrentLayer().stitches.push(newStitch);
        // Add to render queue
        this.addToRenderQueue(newStitch);
        return newStitch.id;
    }
    updateStitch(id, updates) {
        const stitchIndex = this.stitches.findIndex(s => s.id === id);
        if (stitchIndex === -1)
            return false;
        this.stitches[stitchIndex] = {
            ...this.stitches[stitchIndex],
            ...updates,
            updatedAt: Date.now(),
            metadata: updates.points ? this.calculateStitchMetadata(this.stitches[stitchIndex]) : this.stitches[stitchIndex].metadata
        };
        // Update in layer
        const layer = this.layers.find(l => l.id === this.stitches[stitchIndex].layer);
        if (layer) {
            const layerStitchIndex = layer.stitches.findIndex(s => s.id === id);
            if (layerStitchIndex !== -1) {
                layer.stitches[layerStitchIndex] = this.stitches[stitchIndex];
            }
        }
        this.addToRenderQueue(this.stitches[stitchIndex]);
        return true;
    }
    removeStitch(id) {
        const stitchIndex = this.stitches.findIndex(s => s.id === id);
        if (stitchIndex === -1)
            return false;
        const stitch = this.stitches[stitchIndex];
        this.stitches.splice(stitchIndex, 1);
        // Remove from layer
        const layer = this.layers.find(l => l.id === stitch.layer);
        if (layer) {
            const layerStitchIndex = layer.stitches.findIndex(s => s.id === id);
            if (layerStitchIndex !== -1) {
                layer.stitches.splice(layerStitchIndex, 1);
            }
        }
        // Clear from cache
        this.stitchCache.delete(id);
        this.redrawAll();
        return true;
    }
    getStitch(id) {
        return this.stitches.find(s => s.id === id) || null;
    }
    getAllStitches() {
        return [...this.stitches];
    }
    getStitchesByType(type) {
        return this.stitches.filter(s => s.type === type);
    }
    getStitchesByLayer(layerId) {
        const layer = this.layers.find(l => l.id === layerId);
        return layer ? [...layer.stitches] : [];
    }
    // Layer Management
    createLayer(name, order) {
        const newLayer = {
            id: `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            visible: true,
            locked: false,
            opacity: 1.0,
            order: order ?? this.layers.length,
            stitches: []
        };
        this.layers.push(newLayer);
        this.layers.sort((a, b) => a.order - b.order);
        return newLayer.id;
    }
    setCurrentLayer(layerId) {
        const layer = this.layers.find(l => l.id === layerId);
        if (!layer)
            return false;
        this.currentLayerId = layerId;
        return true;
    }
    getCurrentLayer() {
        return this.layers.find(l => l.id === this.currentLayerId) || this.layers[0];
    }
    getAllLayers() {
        return [...this.layers];
    }
    updateLayer(layerId, updates) {
        const layerIndex = this.layers.findIndex(l => l.id === layerId);
        if (layerIndex === -1)
            return false;
        this.layers[layerIndex] = { ...this.layers[layerIndex], ...updates };
        // Clear layer cache
        this.layerCache.delete(layerId);
        this.redrawAll();
        return true;
    }
    removeLayer(layerId) {
        if (this.layers.length <= 1)
            return false; // Don't remove the last layer
        const layerIndex = this.layers.findIndex(l => l.id === layerId);
        if (layerIndex === -1)
            return false;
        // Move stitches to default layer
        const layer = this.layers[layerIndex];
        const defaultLayer = this.layers.find(l => l.id === 'default') || this.layers[0];
        layer.stitches.forEach(stitch => {
            stitch.layer = defaultLayer.id;
            defaultLayer.stitches.push(stitch);
        });
        this.layers.splice(layerIndex, 1);
        this.layerCache.delete(layerId);
        this.redrawAll();
        return true;
    }
    // Rendering
    addToRenderQueue(stitch) {
        if (!this.renderQueue.find(s => s.id === stitch.id)) {
            this.renderQueue.push(stitch);
        }
        if (!this.isRendering) {
            this.processRenderQueue();
        }
    }
    async processRenderQueue() {
        if (this.isRendering || !this.ctx || this.renderQueue.length === 0)
            return;
        this.isRendering = true;
        const startTime = performance.now();
        try {
            // Process stitches in batches for performance
            const batchSize = this.performanceMode ? this.maxStitchesPerFrame : 100;
            const batch = this.renderQueue.splice(0, batchSize);
            for (const stitch of batch) {
                if (stitch.visible) {
                    await this.renderStitch(stitch);
                }
            }
            // Continue processing if there are more stitches
            if (this.renderQueue.length > 0) {
                const elapsed = performance.now() - startTime;
                const delay = Math.max(0, 16 - elapsed); // Target 60fps
                setTimeout(() => this.processRenderQueue(), delay);
            }
        }
        finally {
            this.isRendering = false;
        }
    }
    async renderStitch(stitch) {
        if (!this.ctx || !stitch.points || stitch.points.length === 0)
            return;
        // Check if stitch is cached
        const cacheKey = `${stitch.id}_${stitch.updatedAt}`;
        if (this.stitchCache.has(cacheKey)) {
            const cached = this.stitchCache.get(cacheKey);
            if (cached) {
                // Apply cached stitch
                this.ctx.putImageData(cached, 0, 0);
                return;
            }
        }
        // Render stitch
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.globalAlpha = stitch.opacity;
        this.ctx.strokeStyle = stitch.color;
        this.ctx.lineWidth = stitch.thickness;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        // Apply thread type effects
        this.applyThreadTypeEffects(stitch);
        // Render based on stitch type
        this.renderStitchByType(stitch);
        this.ctx.restore();
        // Cache the rendered stitch
        if (this.canvas) {
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            this.stitchCache.set(cacheKey, imageData);
        }
    }
    renderStitchByType(stitch) {
        const points = stitch.points;
        switch (stitch.type) {
            case 'cross-stitch':
                this.renderCrossStitch(points);
                break;
            case 'satin':
                this.renderSatinStitch(points);
                break;
            case 'chain':
                this.renderChainStitch(points);
                break;
            case 'fill':
                this.renderFillStitch(points);
                break;
            case 'bullion':
                this.renderBullionStitch(points);
                break;
            case 'feather':
                this.renderFeatherStitch(points);
                break;
            case 'backstitch':
                this.renderBackstitch(points);
                break;
            case 'french-knot':
                this.renderFrenchKnot(points);
                break;
            case 'running-stitch':
                this.renderRunningStitch(points);
                break;
            default:
                this.renderBasicStitch(points);
                break;
        }
    }
    renderCrossStitch(points) {
        const size = Math.max(4, this.ctx.lineWidth * 2);
        for (const point of points) {
            const halfSize = size / 2;
            this.ctx.beginPath();
            this.ctx.moveTo(point.x - halfSize, point.y - halfSize);
            this.ctx.lineTo(point.x + halfSize, point.y + halfSize);
            this.ctx.moveTo(point.x + halfSize, point.y - halfSize);
            this.ctx.lineTo(point.x - halfSize, point.y + halfSize);
            this.ctx.stroke();
        }
    }
    renderSatinStitch(points) {
        if (points.length < 2)
            return;
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.stroke();
    }
    renderChainStitch(points) {
        for (const point of points) {
            const radius = this.ctx.lineWidth * 0.5;
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    renderFillStitch(points) {
        if (points.length < 3)
            return;
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
    renderBullionStitch(points) {
        for (const point of points) {
            const radius = this.ctx.lineWidth * 1.5;
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    renderFeatherStitch(points) {
        for (let i = 0; i < points.length - 1; i++) {
            const curr = points[i];
            const next = points[i + 1];
            // Main line
            this.ctx.beginPath();
            this.ctx.moveTo(curr.x, curr.y);
            this.ctx.lineTo(next.x, next.y);
            this.ctx.stroke();
            // Branches
            const angle = Math.atan2(next.y - curr.y, next.x - curr.x);
            const branchLength = this.ctx.lineWidth * 2;
            this.ctx.beginPath();
            this.ctx.moveTo(curr.x, curr.y);
            this.ctx.lineTo(curr.x + Math.cos(angle + Math.PI / 4) * branchLength, curr.y + Math.sin(angle + Math.PI / 4) * branchLength);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(curr.x, curr.y);
            this.ctx.lineTo(curr.x + Math.cos(angle - Math.PI / 4) * branchLength, curr.y + Math.sin(angle - Math.PI / 4) * branchLength);
            this.ctx.stroke();
        }
    }
    renderBackstitch(points) {
        if (points.length < 2)
            return;
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.stroke();
    }
    renderFrenchKnot(points) {
        for (const point of points) {
            const radius = this.ctx.lineWidth * 1.5;
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    renderRunningStitch(points) {
        if (points.length < 2)
            return;
        this.ctx.setLineDash([this.ctx.lineWidth * 2, this.ctx.lineWidth]);
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    renderBasicStitch(points) {
        if (points.length < 2)
            return;
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.stroke();
    }
    applyThreadTypeEffects(stitch) {
        switch (stitch.threadType) {
            case 'metallic':
                this.ctx.shadowColor = '#FFD700';
                this.ctx.shadowBlur = 2;
                break;
            case 'glow':
                this.ctx.shadowColor = stitch.color;
                this.ctx.shadowBlur = 5;
                break;
            case 'variegated':
                // Create gradient effect
                const gradient = this.ctx.createLinearGradient(0, 0, 100, 100);
                gradient.addColorStop(0, stitch.color);
                gradient.addColorStop(0.5, this.adjustBrightness(stitch.color, 20));
                gradient.addColorStop(1, this.adjustBrightness(stitch.color, -20));
                this.ctx.strokeStyle = gradient;
                break;
        }
    }
    adjustBrightness(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    calculateStitchMetadata(stitch) {
        const points = stitch.points;
        if (!points || points.length === 0)
            return {};
        let length = 0;
        for (let i = 1; i < points.length; i++) {
            const dx = points[i].x - points[i - 1].x;
            const dy = points[i].y - points[i - 1].y;
            length += Math.sqrt(dx * dx + dy * dy);
        }
        // Calculate area for fill stitches
        let area = 0;
        if (stitch.type === 'fill' && points.length >= 3) {
            for (let i = 0; i < points.length; i++) {
                const j = (i + 1) % points.length;
                area += points[i].x * points[j].y;
                area -= points[j].x * points[i].y;
            }
            area = Math.abs(area) / 2;
        }
        const baseMeta = {
            stitchCount: points.length,
            length,
            area,
            complexity: this.calculateComplexity(stitch),
            quality: this.calculateQuality(stitch)
        };
        // Enrich with catalog defaults if available
        const def = StitchCatalog[stitch.type];
        if (def) {
            baseMeta.catalogId = def.id;
            baseMeta.appearance = { ...def.appearance };
            baseMeta.behavior = { ...def.behavior };
        }
        return baseMeta;
    }
    calculateComplexity(stitch) {
        // Simple complexity calculation based on stitch type and point count
        const baseComplexity = {
            'cross-stitch': 2,
            'satin': 1,
            'chain': 1.5,
            'fill': 3,
            'bullion': 2.5,
            'feather': 2,
            'backstitch': 1,
            'french-knot': 1.5,
            'running-stitch': 0.5
        };
        const typeComplexity = baseComplexity[stitch.type] || 1;
        const pointComplexity = Math.log(stitch.points.length + 1);
        return typeComplexity * pointComplexity;
    }
    calculateQuality(stitch) {
        // Quality calculation based on stitch properties
        let quality = 1.0;
        // Penalize very thin or very thick stitches
        if (stitch.thickness < 0.5 || stitch.thickness > 10) {
            quality *= 0.8;
        }
        // Penalize very low opacity
        if (stitch.opacity < 0.3) {
            quality *= 0.7;
        }
        // Reward good point density
        if (stitch.points.length > 2) {
            const meta = this.calculateStitchMetadata(stitch) || {};
            const avgDistance = (meta.length ?? 0) / stitch.points.length;
            if (avgDistance > 0.1 && avgDistance < 5) {
                quality *= 1.1;
            }
        }
        return Math.min(1.0, quality);
    }
    // Rendering Control
    redrawAll() {
        if (!this.ctx || !this.canvas)
            return;
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Render all visible layers in order
        const sortedLayers = this.layers
            .filter(layer => layer.visible)
            .sort((a, b) => a.order - b.order);
        for (const layer of sortedLayers) {
            this.ctx.save();
            this.ctx.globalAlpha = layer.opacity;
            for (const stitch of layer.stitches) {
                if (stitch.visible) {
                    this.renderStitch(stitch);
                }
            }
            this.ctx.restore();
        }
    }
    clearAll() {
        this.stitches = [];
        this.layers.forEach(layer => layer.stitches = []);
        this.renderQueue = [];
        this.stitchCache.clear();
        this.layerCache.clear();
        this.redrawAll();
    }
    // Performance Management
    setPerformanceMode(enabled) {
        this.performanceMode = enabled;
        this.maxStitchesPerFrame = enabled ? 25 : 100;
    }
    // Export/Import
    exportProject() {
        return {
            id: `project_${Date.now()}`,
            name: 'Embroidery Project',
            layers: this.layers.map(layer => ({ ...layer })),
            settings: {
                canvasWidth: this.canvas?.width || 800,
                canvasHeight: this.canvas?.height || 600,
                gridSize: 20,
                snapToGrid: false,
                showGrid: true,
                showRulers: true
            },
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
    }
    importProject(project) {
        this.layers = project.layers.map(layer => ({ ...layer }));
        this.stitches = [];
        this.layers.forEach(layer => {
            this.stitches.push(...layer.stitches);
        });
        this.redrawAll();
    }
    // Statistics
    getStatistics() {
        const totalStitches = this.stitches.length;
        const stitchesByType = this.stitches.reduce((acc, stitch) => {
            acc[stitch.type] = (acc[stitch.type] || 0) + 1;
            return acc;
        }, {});
        const totalLength = this.stitches.reduce((sum, stitch) => {
            return sum + (stitch.metadata?.length || 0);
        }, 0);
        const averageQuality = this.stitches.reduce((sum, stitch) => {
            return sum + (stitch.metadata?.quality || 0);
        }, 0) / Math.max(1, totalStitches);
        return {
            totalStitches,
            stitchesByType,
            totalLength,
            averageQuality,
            layerCount: this.layers.length,
            visibleStitches: this.stitches.filter(s => s.visible).length
        };
    }
}
export default EnhancedEmbroideryManager;
