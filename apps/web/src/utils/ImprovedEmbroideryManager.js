/**
 * Improved Embroidery Manager
 * Fixes all critical issues identified in the analysis
 */
import { enhancedMemoryManager } from './EnhancedMemoryManager';
import { performanceRenderer, renderingWorker } from './PerformanceOptimizedRenderer';
import { stateSynchronizer } from './StateSynchronizer';
export class ImprovedEmbroideryManager {
    constructor(canvas) {
        this.stitches = [];
        this.layers = [];
        this.currentLayerId = '';
        this.canvas = null;
        this.ctx = null;
        this.offscreenCanvas = null;
        this.offscreenCtx = null;
        this.renderOptions = {
            quality: 'high',
            enableCaching: true,
            enableBatching: true,
            maxStitchesPerFrame: 50
        };
        this.isRendering = false;
        this.dirtyRegions = new Set();
        this.lastRenderTime = 0;
        this.frameRequestId = null;
        this.resizeObserver = null;
        this.contextLossHandler = null;
        if (canvas) {
            this.setCanvas(canvas);
        }
        this.initializeDefaultLayer();
        this.setupContextLossHandling();
        this.setupResizeHandling();
    }
    setCanvas(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', {
            willReadFrequently: true,
            alpha: true,
            desynchronized: true
        });
        if (this.ctx) {
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';
        }
        // Setup offscreen canvas for better performance
        this.setupOffscreenCanvas();
    }
    setupOffscreenCanvas() {
        if (!this.canvas)
            return;
        try {
            // Use OffscreenCanvas if available
            if ('OffscreenCanvas' in window) {
                this.offscreenCanvas = new OffscreenCanvas(this.canvas.width, this.canvas.height);
                this.offscreenCtx = this.offscreenCanvas.getContext('2d');
            }
        }
        catch (error) {
            console.warn('OffscreenCanvas not supported, using main canvas');
        }
    }
    setupContextLossHandling() {
        this.contextLossHandler = () => {
            console.warn('Canvas context lost, attempting recovery...');
            this.recoverContext();
        };
        if (this.canvas) {
            this.canvas.addEventListener('webglcontextlost', this.contextLossHandler);
            this.canvas.addEventListener('webglcontextrestored', () => {
                console.log('Canvas context restored');
                this.redrawAll();
            });
        }
    }
    setupResizeHandling() {
        if (!this.canvas)
            return;
        this.resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                this.handleCanvasResize(width, height);
            }
        });
        this.resizeObserver.observe(this.canvas);
    }
    handleCanvasResize(width, height) {
        if (!this.canvas)
            return;
        // Update canvas size
        this.canvas.width = width;
        this.canvas.height = height;
        // Update offscreen canvas
        if (this.offscreenCanvas) {
            this.offscreenCanvas.width = width;
            this.offscreenCanvas.height = height;
        }
        // Mark all regions as dirty for redraw
        this.markAllRegionsDirty();
        this.redrawAll();
    }
    recoverContext() {
        if (!this.canvas)
            return;
        // Recreate context
        this.ctx = this.canvas.getContext('2d', {
            willReadFrequently: true,
            alpha: true,
            desynchronized: true
        });
        if (this.ctx) {
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';
        }
        // Redraw everything
        this.redrawAll();
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
    // Stitch Management with State Synchronization
    addStitch(stitch) {
        const newStitch = {
            ...stitch,
            id: `stitch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            layer: this.getCurrentLayer().id,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            metadata: this.calculateStitchMetadata(stitch)
        };
        // Add to local state
        this.stitches.push(newStitch);
        this.getCurrentLayer().stitches.push(newStitch);
        // Record operation for synchronization
        stateSynchronizer.addOperation({
            type: 'ADD',
            data: newStitch,
            source: 'ENHANCED_MANAGER'
        });
        // Mark region as dirty
        this.markStitchRegionDirty(newStitch);
        // Schedule render
        this.scheduleRender();
        return newStitch.id;
    }
    updateStitch(id, updates) {
        const stitchIndex = this.stitches.findIndex(s => s.id === id);
        if (stitchIndex === -1)
            return false;
        const oldStitch = this.stitches[stitchIndex];
        const updatedStitch = {
            ...this.stitches[stitchIndex],
            ...updates,
            updatedAt: Date.now(),
            metadata: updates.points ? this.calculateStitchMetadata(this.stitches[stitchIndex]) : this.stitches[stitchIndex].metadata
        };
        this.stitches[stitchIndex] = updatedStitch;
        // Update in layer
        const layer = this.layers.find(l => l.id === updatedStitch.layer);
        if (layer) {
            const layerStitchIndex = layer.stitches.findIndex(s => s.id === id);
            if (layerStitchIndex !== -1) {
                layer.stitches[layerStitchIndex] = updatedStitch;
            }
        }
        // Record operation
        stateSynchronizer.addOperation({
            type: 'UPDATE',
            data: { id, updates, oldStitch },
            source: 'ENHANCED_MANAGER'
        });
        // Mark regions as dirty
        this.markStitchRegionDirty(oldStitch);
        this.markStitchRegionDirty(updatedStitch);
        // Schedule render
        this.scheduleRender();
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
        // Record operation
        stateSynchronizer.addOperation({
            type: 'DELETE',
            data: { id, stitch },
            source: 'ENHANCED_MANAGER'
        });
        // Clear from cache
        enhancedMemoryManager.clearStitchCache?.(id);
        // Mark region as dirty
        this.markStitchRegionDirty(stitch);
        // Schedule render
        this.scheduleRender();
        return true;
    }
    // Performance-optimized rendering
    scheduleRender() {
        if (this.frameRequestId) {
            cancelAnimationFrame(this.frameRequestId);
        }
        this.frameRequestId = requestAnimationFrame(() => {
            this.performRender();
        });
    }
    async performRender() {
        if (this.isRendering)
            return;
        this.isRendering = true;
        const startTime = performance.now();
        try {
            if (this.renderOptions.enableBatching) {
                await this.renderBatched();
            }
            else {
                await this.renderImmediate();
            }
        }
        catch (error) {
            console.error('Render error:', error);
        }
        finally {
            this.isRendering = false;
            this.lastRenderTime = performance.now() - startTime;
        }
    }
    async renderBatched() {
        if (!this.ctx || !this.canvas)
            return;
        // Use performance renderer for batching
        const job = {
            stitches: this.getVisibleStitches(),
            priority: 'HIGH',
            callback: (result) => {
                console.log('Batch render completed:', result);
            }
        };
        await performanceRenderer.addRenderJob(job);
    }
    async renderImmediate() {
        if (!this.ctx || !this.canvas)
            return;
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Render visible layers in order
        const sortedLayers = this.layers
            .filter(layer => layer.visible)
            .sort((a, b) => a.order - b.order);
        for (const layer of sortedLayers) {
            this.ctx.save();
            this.ctx.globalAlpha = layer.opacity;
            for (const stitch of layer.stitches) {
                if (stitch.visible) {
                    await this.renderStitch(stitch);
                }
            }
            this.ctx.restore();
        }
    }
    async renderStitch(stitch) {
        if (!this.ctx || !stitch.points || stitch.points.length === 0)
            return;
        // Check cache first
        if (this.renderOptions.enableCaching) {
            const cached = enhancedMemoryManager.getStitchCache?.(stitch.id);
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
        if (this.renderOptions.enableCaching && this.canvas) {
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            enhancedMemoryManager.setStitchCache?.(stitch.id, imageData);
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
    // Individual stitch rendering methods (simplified for brevity)
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
    // Utility methods
    getCurrentLayer() {
        return this.layers.find(l => l.id === this.currentLayerId) || this.layers[0];
    }
    getVisibleStitches() {
        return this.stitches.filter(stitch => stitch.visible);
    }
    markStitchRegionDirty(stitch) {
        // Mark the region around the stitch as dirty for incremental rendering
        const regionId = `stitch_${stitch.id}`;
        this.dirtyRegions.add(regionId);
    }
    markAllRegionsDirty() {
        this.dirtyRegions.clear();
        this.stitches.forEach(stitch => this.markStitchRegionDirty(stitch));
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
        return {
            stitchCount: points.length,
            length,
            complexity: this.calculateComplexity(stitch),
            quality: this.calculateQuality(stitch)
        };
    }
    calculateComplexity(stitch) {
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
        let quality = 1.0;
        if (stitch.thickness < 0.5 || stitch.thickness > 10) {
            quality *= 0.8;
        }
        if (stitch.opacity < 0.3) {
            quality *= 0.7;
        }
        return Math.min(1.0, quality);
    }
    // Public API methods
    getAllStitches() {
        return [...this.stitches];
    }
    getStitch(id) {
        return this.stitches.find(s => s.id === id) || null;
    }
    getAllLayers() {
        return [...this.layers];
    }
    setCurrentLayer(layerId) {
        const layer = this.layers.find(l => l.id === layerId);
        if (!layer)
            return false;
        this.currentLayerId = layerId;
        return true;
    }
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
    clearAll() {
        this.stitches = [];
        this.layers.forEach(layer => layer.stitches = []);
        this.dirtyRegions.clear();
        // Record operation
        stateSynchronizer.addOperation({
            type: 'CLEAR',
            data: {},
            source: 'ENHANCED_MANAGER'
        });
        // Clear caches
        enhancedMemoryManager.clearAllCaches();
        // Schedule render
        this.scheduleRender();
    }
    redrawAll() {
        this.markAllRegionsDirty();
        this.scheduleRender();
    }
    // Configuration
    setRenderOptions(options) {
        this.renderOptions = { ...this.renderOptions, ...options };
    }
    getRenderOptions() {
        return { ...this.renderOptions };
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
            visibleStitches: this.stitches.filter(s => s.visible).length,
            lastRenderTime: this.lastRenderTime,
            dirtyRegions: this.dirtyRegions.size
        };
    }
    // Cleanup
    destroy() {
        if (this.frameRequestId) {
            cancelAnimationFrame(this.frameRequestId);
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        if (this.contextLossHandler && this.canvas) {
            this.canvas.removeEventListener('webglcontextlost', this.contextLossHandler);
        }
        enhancedMemoryManager.destroy();
        performanceRenderer.destroy();
        renderingWorker.destroy();
        stateSynchronizer.destroy();
    }
}
export default ImprovedEmbroideryManager;
