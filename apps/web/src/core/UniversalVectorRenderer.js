/**
 * Universal Vector Renderer System
 *
 * This system provides a protocol for connecting vector tools with any type of
 * stitch, print, brush, texture, or image. It automatically detects and renders
 * the appropriate type based on the active tool or stitch type.
 *
 * PROTOCOL FOR ADDING NEW TYPES:
 * 1. Register your renderer in the RENDERER_REGISTRY
 * 2. Implement the RendererInterface
 * 3. The system will automatically connect it to vector tools
 */
/**
 * Universal Vector Renderer Class
 */
export class UniversalVectorRenderer {
    constructor() {
        this.renderers = new Map();
        this.fallbackRenderer = null;
        this.initializeDefaultRenderers();
    }
    /**
     * Register a new renderer
     */
    registerRenderer(renderer) {
        this.renderers.set(renderer.id, renderer);
        console.log(`🎨 Registered renderer: ${renderer.name} (${renderer.category})`);
    }
    /**
     * Unregister a renderer
     */
    unregisterRenderer(id) {
        this.renderers.delete(id);
        console.log(`🗑️ Unregistered renderer: ${id}`);
    }
    /**
     * Set fallback renderer for unknown types
     */
    setFallbackRenderer(renderer) {
        this.fallbackRenderer = renderer;
    }
    /**
     * Find the best renderer for a given tool/type
     */
    findRenderer(tool, config) {
        // First, try to find by exact tool match
        for (const renderer of this.renderers.values()) {
            if (renderer.canHandle(tool, config)) {
                return renderer;
            }
        }
        // Then try to find by config type
        if (config?.type) {
            for (const renderer of this.renderers.values()) {
                if (renderer.canHandle(config.type, config)) {
                    return renderer;
                }
            }
        }
        // Return fallback if available
        return this.fallbackRenderer;
    }
    /**
     * Render using the appropriate renderer
     */
    render(ctx, points, tool, config, options = {}) {
        console.log(`🎨 UniversalVectorRenderer.render called with config.color="${config.color}"`);
        // Validate the color first
        if (config.color && typeof config.color === 'string' && /^#[0-9a-f]{6}$/i.test(config.color)) {
            console.log(`✅ UniversalVectorRenderer color is valid: ${config.color}`);
        }
        else {
            console.error(`❌ UniversalVectorRenderer color is INVALID: "${config.color}"`);
        }
        const renderer = this.findRenderer(tool, config);
        if (!renderer) {
            console.warn(`⚠️ No renderer found for tool: ${tool}, type: ${config.type}`);
            return false;
        }
        // Validate configuration
        if (!renderer.validateConfig(config)) {
            console.warn(`⚠️ Invalid config for renderer: ${renderer.name}`);
            return false;
        }
        try {
            renderer.render(ctx, points, config, options);
            return true;
        }
        catch (error) {
            console.error(`❌ Error rendering with ${renderer.name}:`, error);
            return false;
        }
    }
    /**
     * Get all available renderers
     */
    getAvailableRenderers() {
        return Array.from(this.renderers.values());
    }
    /**
     * Get renderers by category
     */
    getRenderersByCategory(category) {
        return Array.from(this.renderers.values()).filter(r => r.category === category);
    }
    /**
     * Initialize default renderers
     */
    initializeDefaultRenderers() {
        // Register all default renderers
        this.registerRenderer(new CrossStitchRenderer());
        this.registerRenderer(new SatinStitchRenderer());
        this.registerRenderer(new ChainStitchRenderer());
        this.registerRenderer(new FillStitchRenderer());
        this.registerRenderer(new BackStitchRenderer());
        this.registerRenderer(new FrenchKnotRenderer());
        this.registerRenderer(new RunningStitchRenderer());
        this.registerRenderer(new BlanketStitchRenderer());
        this.registerRenderer(new FeatherStitchRenderer());
        this.registerRenderer(new HerringboneStitchRenderer());
        // Register additional advanced stitch renderers
        this.registerRenderer(new BullionStitchRenderer());
        this.registerRenderer(new LazyDaisyStitchRenderer());
        this.registerRenderer(new CouchingStitchRenderer());
        this.registerRenderer(new AppliqueStitchRenderer());
        this.registerRenderer(new SeedStitchRenderer());
        this.registerRenderer(new StemStitchRenderer());
        this.registerRenderer(new SplitStitchRenderer());
        this.registerRenderer(new BrickStitchRenderer());
        this.registerRenderer(new LongShortStitchRenderer());
        this.registerRenderer(new FishboneStitchRenderer());
        this.registerRenderer(new SatinRibbonStitchRenderer());
        this.registerRenderer(new MetallicStitchRenderer());
        this.registerRenderer(new GlowThreadStitchRenderer());
        this.registerRenderer(new VariegatedStitchRenderer());
        this.registerRenderer(new GradientStitchRenderer());
        // Set fallback renderer
        this.setFallbackRenderer(new SatinStitchRenderer());
    }
}
/**
 * Cross-Stitch Renderer Implementation
 */
class CrossStitchRenderer {
    constructor() {
        this.id = 'cross-stitch';
        this.name = 'Cross Stitch';
        this.category = 'stitch';
    }
    canHandle(tool, config) {
        return tool === 'cross-stitch' || tool === 'crossstitch' ||
            config?.type === 'cross-stitch' || config?.type === 'crossstitch';
    }
    render(ctx, points, config, options = {}) {
        if (points.length < 2)
            return;
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = config.opacity || 1.0;
        // Calculate stitch distribution
        const totalLength = this.calculatePathLength(points);
        const stitchSpacing = Math.max(4, config.thickness * 1.2);
        const totalStitches = Math.max(1, Math.ceil(totalLength / stitchSpacing));
        // IMPROVED: Ensure all points are connected when connectAllPoints is true
        if (options.connectAllPoints) {
            // Render stitches between every pair of consecutive points
            for (let i = 0; i < points.length - 1; i++) {
                const point = points[i];
                const nextPoint = points[i + 1];
                const segmentLength = this.calculateDistance(point, nextPoint);
                const segmentStitches = Math.max(1, Math.ceil(segmentLength / stitchSpacing));
                for (let j = 0; j < segmentStitches; j++) {
                    const t = j / segmentStitches;
                    const stitchX = point.x + (nextPoint.x - point.x) * t;
                    const stitchY = point.y + (nextPoint.y - point.y) * t;
                    this.drawCrossStitch(ctx, stitchX, stitchY, config, i * 100 + j);
                }
            }
        }
        else {
            // Original distribution logic
            let currentDistance = 0;
            let stitchIndex = 0;
            for (let i = 0; i < points.length - 1; i++) {
                const point = points[i];
                const nextPoint = points[i + 1];
                const segmentLength = this.calculateDistance(point, nextPoint);
                const segmentStitches = Math.ceil((segmentLength / totalLength) * totalStitches);
                for (let j = 0; j < segmentStitches; j++) {
                    const t = j / segmentStitches;
                    const stitchX = point.x + (nextPoint.x - point.x) * t;
                    const stitchY = point.y + (nextPoint.y - point.y) * t;
                    this.drawCrossStitch(ctx, stitchX, stitchY, config, stitchIndex);
                    stitchIndex++;
                }
            }
        }
        ctx.restore();
    }
    drawCrossStitch(ctx, x, y, config, index) {
        const size = config.thickness * 1.8;
        const threadThickness = Math.max(0.6, config.thickness * 0.3);
        // Create thread color variations
        const threadVariation = (Math.sin(index * 0.3) * 5) + (Math.random() * 3 - 1.5);
        const adjustedColor = this.adjustBrightness(config.color, threadVariation);
        const shadowColor = this.adjustBrightness(adjustedColor, -15);
        const highlightColor = this.adjustBrightness(adjustedColor, 8);
        // Draw shadow
        ctx.strokeStyle = shadowColor;
        ctx.lineWidth = threadThickness * 1.2;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(x - size + 0.3, y - size + 0.3);
        ctx.lineTo(x + size + 0.3, y + size + 0.3);
        ctx.moveTo(x - size + 0.3, y + size + 0.3);
        ctx.lineTo(x + size + 0.3, y - size + 0.3);
        ctx.stroke();
        // Draw main cross-stitch
        ctx.strokeStyle = adjustedColor;
        ctx.lineWidth = threadThickness;
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        ctx.moveTo(x - size, y - size);
        ctx.lineTo(x + size, y + size);
        ctx.moveTo(x - size, y + size);
        ctx.lineTo(x + size, y - size);
        ctx.stroke();
        // Draw highlight
        ctx.strokeStyle = highlightColor;
        ctx.lineWidth = threadThickness * 0.5;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.moveTo(x - size * 0.7, y - size * 0.7);
        ctx.lineTo(x + size * 0.7, y + size * 0.7);
        ctx.moveTo(x - size * 0.7, y + size * 0.7);
        ctx.lineTo(x + size * 0.7, y - size * 0.7);
        ctx.stroke();
    }
    calculatePathLength(points) {
        let total = 0;
        for (let i = 0; i < points.length - 1; i++) {
            total += this.calculateDistance(points[i], points[i + 1]);
        }
        return total;
    }
    calculateDistance(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    adjustBrightness(color, amount) {
        // Validate input
        if (!color || typeof color !== 'string') {
            console.warn('Invalid color input in UniversalVectorRenderer adjustBrightness:', color);
            return '#ff69b4'; // Default fallback
        }
        // Ensure color starts with #
        const cleanColor = color.startsWith('#') ? color : `#${color}`;
        // Validate hex format (must be 6 characters after #)
        if (cleanColor.length !== 7) {
            console.warn('Invalid hex color format in UniversalVectorRenderer adjustBrightness:', cleanColor);
            return '#ff69b4'; // Default fallback
        }
        // Convert hex to RGB
        const hex = cleanColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        // Validate parsed values
        if (isNaN(r) || isNaN(g) || isNaN(b)) {
            console.warn('Failed to parse hex color in UniversalVectorRenderer adjustBrightness:', cleanColor);
            return '#ff69b4'; // Default fallback
        }
        // CRITICAL FIX: Round all RGB values to integers before hex conversion
        const newR = Math.round(Math.max(0, Math.min(255, r + amount)));
        const newG = Math.round(Math.max(0, Math.min(255, g + amount)));
        const newB = Math.round(Math.max(0, Math.min(255, b + amount)));
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
    getDefaultConfig() {
        return {
            type: 'cross-stitch',
            color: '#ff69b4',
            thickness: 3,
            opacity: 1.0
        };
    }
    validateConfig(config) {
        return !!(config.type && config.color && typeof config.thickness === 'number');
    }
}
/**
 * Satin Stitch Renderer Implementation
 */
class SatinStitchRenderer {
    constructor() {
        this.id = 'satin';
        this.name = 'Satin Stitch';
        this.category = 'stitch';
    }
    canHandle(tool, config) {
        return tool === 'satin' || config?.type === 'satin' || tool === 'embroidery';
    }
    render(ctx, points, config, options = {}) {
        if (points.length < 2)
            return;
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = config.opacity || 1.0;
        ctx.strokeStyle = config.color;
        ctx.lineWidth = config.thickness;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
        ctx.restore();
    }
    getDefaultConfig() {
        return {
            type: 'satin',
            color: '#ff69b4',
            thickness: 3,
            opacity: 1.0
        };
    }
    validateConfig(config) {
        return !!(config.type && config.color && typeof config.thickness === 'number');
    }
}
/**
 * Chain Stitch Renderer Implementation
 */
class ChainStitchRenderer {
    constructor() {
        this.id = 'chain';
        this.name = 'Chain Stitch';
        this.category = 'stitch';
    }
    canHandle(tool, config) {
        return tool === 'chain' || config?.type === 'chain';
    }
    render(ctx, points, config, options = {}) {
        if (points.length < 2)
            return;
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = config.opacity || 1.0;
        ctx.strokeStyle = config.color;
        ctx.lineWidth = config.thickness;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // IMPROVED: Ensure all points are connected when connectAllPoints is true
        if (options.connectAllPoints) {
            // Draw chain loops between every pair of consecutive points
            for (let i = 0; i < points.length - 1; i++) {
                const current = points[i];
                const next = points[i + 1];
                // Calculate chain loop
                const dx = next.x - current.x;
                const dy = next.y - current.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const loopSize = Math.min(distance * 0.3, config.thickness * 2);
                const midX = (current.x + next.x) / 2;
                const midY = (current.y + next.y) / 2;
                // Draw chain loop
                ctx.beginPath();
                ctx.arc(midX, midY, loopSize / 2, 0, Math.PI * 2);
                ctx.stroke();
                // Draw connecting line if distance is significant
                if (distance > config.thickness) {
                    ctx.beginPath();
                    ctx.moveTo(current.x, current.y);
                    ctx.lineTo(next.x, next.y);
                    ctx.stroke();
                }
            }
        }
        else {
            // Original chain loop logic
            for (let i = 0; i < points.length - 1; i++) {
                const current = points[i];
                const next = points[i + 1];
                // Calculate chain loop
                const dx = next.x - current.x;
                const dy = next.y - current.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const loopSize = Math.min(distance * 0.3, config.thickness * 2);
                const midX = (current.x + next.x) / 2;
                const midY = (current.y + next.y) / 2;
                // Draw chain loop
                ctx.beginPath();
                ctx.arc(midX, midY, loopSize / 2, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        ctx.restore();
    }
    getDefaultConfig() {
        return {
            type: 'chain',
            color: '#ff69b4',
            thickness: 3,
            opacity: 1.0
        };
    }
    validateConfig(config) {
        return !!(config.type && config.color && typeof config.thickness === 'number');
    }
}
/**
 * Fill Stitch Renderer Implementation
 */
class FillStitchRenderer {
    constructor() {
        this.id = 'fill';
        this.name = 'Fill Stitch';
        this.category = 'stitch';
    }
    canHandle(tool, config) {
        return tool === 'fill' || config?.type === 'fill';
    }
    render(ctx, points, config, options = {}) {
        if (points.length < 3)
            return;
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = config.opacity || 1.0;
        ctx.fillStyle = config.color;
        // Create path for fill
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
    getDefaultConfig() {
        return {
            type: 'fill',
            color: '#ff69b4',
            thickness: 3,
            opacity: 1.0
        };
    }
    validateConfig(config) {
        return !!(config.type && config.color && typeof config.thickness === 'number');
    }
}
// Additional stitch renderers...
class BackStitchRenderer {
    constructor() {
        this.id = 'back-stitch';
        this.name = 'Back Stitch';
        this.category = 'stitch';
    }
    canHandle(tool, config) {
        return tool === 'back-stitch' || tool === 'backstitch' ||
            config?.type === 'back-stitch' || config?.type === 'backstitch';
    }
    render(ctx, points, config) {
        // Implementation for back stitch
        ctx.save();
        ctx.strokeStyle = config.color;
        ctx.lineWidth = config.thickness;
        ctx.lineCap = 'round';
        ctx.globalAlpha = config.opacity || 1.0;
        for (let i = 0; i < points.length - 1; i++) {
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[i + 1].x, points[i + 1].y);
            ctx.stroke();
        }
        ctx.restore();
    }
    getDefaultConfig() {
        return { type: 'back-stitch', color: '#ff69b4', thickness: 3, opacity: 1.0 };
    }
    validateConfig(config) {
        return !!(config.type && config.color && typeof config.thickness === 'number');
    }
}
class FrenchKnotRenderer {
    constructor() {
        this.id = 'french-knot';
        this.name = 'French Knot';
        this.category = 'stitch';
    }
    canHandle(tool, config) {
        return tool === 'french-knot' || config?.type === 'french-knot';
    }
    render(ctx, points, config) {
        ctx.save();
        ctx.fillStyle = config.color;
        ctx.globalAlpha = config.opacity || 1.0;
        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, config.thickness / 2, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }
    getDefaultConfig() {
        return { type: 'french-knot', color: '#ff69b4', thickness: 3, opacity: 1.0 };
    }
    validateConfig(config) {
        return !!(config.type && config.color && typeof config.thickness === 'number');
    }
}
class RunningStitchRenderer {
    constructor() {
        this.id = 'running-stitch';
        this.name = 'Running Stitch';
        this.category = 'stitch';
    }
    canHandle(tool, config) {
        return tool === 'running-stitch' || tool === 'runningstitch' ||
            config?.type === 'running-stitch' || config?.type === 'runningstitch';
    }
    render(ctx, points, config) {
        ctx.save();
        ctx.strokeStyle = config.color;
        ctx.lineWidth = config.thickness;
        ctx.lineCap = 'round';
        ctx.globalAlpha = config.opacity || 1.0;
        ctx.setLineDash([config.thickness * 2, config.thickness]);
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
        ctx.restore();
    }
    getDefaultConfig() {
        return { type: 'running-stitch', color: '#ff69b4', thickness: 3, opacity: 1.0 };
    }
    validateConfig(config) {
        return !!(config.type && config.color && typeof config.thickness === 'number');
    }
}
class BlanketStitchRenderer {
    constructor() {
        this.id = 'blanket-stitch';
        this.name = 'Blanket Stitch';
        this.category = 'stitch';
    }
    canHandle(tool, config) {
        return tool === 'blanket-stitch' || tool === 'blanketstitch' ||
            config?.type === 'blanket-stitch' || config?.type === 'blanketstitch';
    }
    render(ctx, points, config) {
        // Implementation for blanket stitch
        ctx.save();
        ctx.strokeStyle = config.color;
        ctx.lineWidth = config.thickness;
        ctx.lineCap = 'round';
        ctx.globalAlpha = config.opacity || 1.0;
        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];
            // Draw blanket stitch pattern
            ctx.beginPath();
            ctx.moveTo(current.x, current.y);
            ctx.lineTo(next.x, next.y);
            ctx.stroke();
        }
        ctx.restore();
    }
    getDefaultConfig() {
        return { type: 'blanket-stitch', color: '#ff69b4', thickness: 3, opacity: 1.0 };
    }
    validateConfig(config) {
        return !!(config.type && config.color && typeof config.thickness === 'number');
    }
}
class FeatherStitchRenderer {
    constructor() {
        this.id = 'feather-stitch';
        this.name = 'Feather Stitch';
        this.category = 'stitch';
    }
    canHandle(tool, config) {
        return tool === 'feather-stitch' || config?.type === 'feather-stitch';
    }
    render(ctx, points, config) {
        // Implementation for feather stitch
        ctx.save();
        ctx.strokeStyle = config.color;
        ctx.lineWidth = config.thickness;
        ctx.lineCap = 'round';
        ctx.globalAlpha = config.opacity || 1.0;
        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];
            // Draw feather stitch pattern
            ctx.beginPath();
            ctx.moveTo(current.x, current.y);
            ctx.lineTo(next.x, next.y);
            ctx.stroke();
        }
        ctx.restore();
    }
    getDefaultConfig() {
        return { type: 'feather-stitch', color: '#ff69b4', thickness: 3, opacity: 1.0 };
    }
    validateConfig(config) {
        return !!(config.type && config.color && typeof config.thickness === 'number');
    }
}
class HerringboneStitchRenderer {
    constructor() {
        this.id = 'herringbone-stitch';
        this.name = 'Herringbone Stitch';
        this.category = 'stitch';
    }
    canHandle(tool, config) {
        return tool === 'herringbone-stitch' || tool === 'herringbonestitch' ||
            config?.type === 'herringbone-stitch' || config?.type === 'herringbonestitch';
    }
    render(ctx, points, config) {
        // Implementation for herringbone stitch
        ctx.save();
        ctx.strokeStyle = config.color;
        ctx.lineWidth = config.thickness;
        ctx.lineCap = 'round';
        ctx.globalAlpha = config.opacity || 1.0;
        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];
            // Draw herringbone stitch pattern
            ctx.beginPath();
            ctx.moveTo(current.x, current.y);
            ctx.lineTo(next.x, next.y);
            ctx.stroke();
        }
        ctx.restore();
    }
    getDefaultConfig() {
        return { type: 'herringbone-stitch', color: '#ff69b4', thickness: 3, opacity: 1.0 };
    }
    validateConfig(config) {
        return !!(config.type && config.color && typeof config.thickness === 'number');
    }
}
// Additional Advanced Stitch Renderers
class BullionStitchRenderer {
    constructor() {
        this.id = 'bullion';
        this.name = 'Bullion Stitch';
        this.category = 'stitch';
    }
    canHandle(tool, config) {
        return tool === 'bullion' || config?.type === 'bullion';
    }
    render(ctx, points, config) {
        ctx.save();
        ctx.strokeStyle = config.color;
        ctx.lineWidth = config.thickness;
        ctx.globalAlpha = config.opacity || 1.0;
        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, config.thickness / 2, 0, Math.PI * 2);
            ctx.stroke();
        });
        ctx.restore();
    }
    getDefaultConfig() {
        return { type: 'bullion', color: '#ff69b4', thickness: 3, opacity: 1.0 };
    }
    validateConfig(config) {
        return !!(config.type && config.color && typeof config.thickness === 'number');
    }
}
class LazyDaisyStitchRenderer {
    constructor() {
        this.id = 'lazy-daisy';
        this.name = 'Lazy Daisy Stitch';
        this.category = 'stitch';
    }
    canHandle(tool, config) {
        return tool === 'lazy-daisy' || config?.type === 'lazy-daisy';
    }
    render(ctx, points, config) {
        ctx.save();
        ctx.strokeStyle = config.color;
        ctx.lineWidth = config.thickness;
        ctx.globalAlpha = config.opacity || 1.0;
        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];
            ctx.beginPath();
            ctx.moveTo(current.x, current.y);
            ctx.lineTo(next.x, next.y);
            ctx.stroke();
        }
        ctx.restore();
    }
    getDefaultConfig() {
        return { type: 'lazy-daisy', color: '#ff69b4', thickness: 3, opacity: 1.0 };
    }
    validateConfig(config) {
        return !!(config.type && config.color && typeof config.thickness === 'number');
    }
}
class CouchingStitchRenderer {
    constructor() {
        this.id = 'couching';
        this.name = 'Couching Stitch';
        this.category = 'stitch';
    }
    canHandle(tool, config) {
        return tool === 'couching' || config?.type === 'couching';
    }
    render(ctx, points, config) {
        ctx.save();
        ctx.strokeStyle = config.color;
        ctx.lineWidth = config.thickness;
        ctx.globalAlpha = config.opacity || 1.0;
        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];
            ctx.beginPath();
            ctx.moveTo(current.x, current.y);
            ctx.lineTo(next.x, next.y);
            ctx.stroke();
        }
        ctx.restore();
    }
    getDefaultConfig() {
        return { type: 'couching', color: '#ff69b4', thickness: 3, opacity: 1.0 };
    }
    validateConfig(config) {
        return !!(config.type && config.color && typeof config.thickness === 'number');
    }
}
class AppliqueStitchRenderer {
    constructor() {
        this.id = 'appliqué';
        this.name = 'Appliqué Stitch';
        this.category = 'stitch';
    }
    canHandle(tool, config) {
        return tool === 'appliqué' || config?.type === 'appliqué';
    }
    render(ctx, points, config) {
        ctx.save();
        ctx.strokeStyle = config.color;
        ctx.lineWidth = config.thickness;
        ctx.globalAlpha = config.opacity || 1.0;
        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];
            ctx.beginPath();
            ctx.moveTo(current.x, current.y);
            ctx.lineTo(next.x, next.y);
            ctx.stroke();
        }
        ctx.restore();
    }
    getDefaultConfig() {
        return { type: 'appliqué', color: '#ff69b4', thickness: 3, opacity: 1.0 };
    }
    validateConfig(config) {
        return !!(config.type && config.color && typeof config.thickness === 'number');
    }
}
class SeedStitchRenderer {
    constructor() {
        this.id = 'seed';
        this.name = 'Seed Stitch';
        this.category = 'stitch';
    }
    canHandle(tool, config) {
        return tool === 'seed' || config?.type === 'seed';
    }
    render(ctx, points, config) {
        ctx.save();
        ctx.fillStyle = config.color;
        ctx.globalAlpha = config.opacity || 1.0;
        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, config.thickness / 4, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }
    getDefaultConfig() {
        return { type: 'seed', color: '#ff69b4', thickness: 3, opacity: 1.0 };
    }
    validateConfig(config) {
        return !!(config.type && config.color && typeof config.thickness === 'number');
    }
}
class StemStitchRenderer {
    constructor() {
        this.id = 'stem';
        this.name = 'Stem Stitch';
        this.category = 'stitch';
    }
    canHandle(tool, config) {
        return tool === 'stem' || config?.type === 'stem';
    }
    render(ctx, points, config) {
        ctx.save();
        ctx.strokeStyle = config.color;
        ctx.lineWidth = config.thickness;
        ctx.globalAlpha = config.opacity || 1.0;
        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];
            ctx.beginPath();
            ctx.moveTo(current.x, current.y);
            ctx.lineTo(next.x, next.y);
            ctx.stroke();
        }
        ctx.restore();
    }
    getDefaultConfig() {
        return { type: 'stem', color: '#ff69b4', thickness: 3, opacity: 1.0 };
    }
    validateConfig(config) {
        return !!(config.type && config.color && typeof config.thickness === 'number');
    }
}
class SplitStitchRenderer {
    constructor() {
        this.id = 'split';
        this.name = 'Split Stitch';
        this.category = 'stitch';
    }
    canHandle(tool, config) {
        return tool === 'split' || config?.type === 'split';
    }
    render(ctx, points, config) {
        ctx.save();
        ctx.strokeStyle = config.color;
        ctx.lineWidth = config.thickness;
        ctx.globalAlpha = config.opacity || 1.0;
        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];
            ctx.beginPath();
            ctx.moveTo(current.x, current.y);
            ctx.lineTo(next.x, next.y);
            ctx.stroke();
        }
        ctx.restore();
    }
    getDefaultConfig() {
        return { type: 'split', color: '#ff69b4', thickness: 3, opacity: 1.0 };
    }
    validateConfig(config) {
        return !!(config.type && config.color && typeof config.thickness === 'number');
    }
}
class BrickStitchRenderer {
    constructor() {
        this.id = 'brick';
        this.name = 'Brick Stitch';
        this.category = 'stitch';
    }
    canHandle(tool, config) {
        return tool === 'brick' || config?.type === 'brick';
    }
    render(ctx, points, config) {
        ctx.save();
        ctx.strokeStyle = config.color;
        ctx.lineWidth = config.thickness;
        ctx.globalAlpha = config.opacity || 1.0;
        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];
            ctx.beginPath();
            ctx.moveTo(current.x, current.y);
            ctx.lineTo(next.x, next.y);
            ctx.stroke();
        }
        ctx.restore();
    }
    getDefaultConfig() {
        return { type: 'brick', color: '#ff69b4', thickness: 3, opacity: 1.0 };
    }
    validateConfig(config) {
        return !!(config.type && config.color && typeof config.thickness === 'number');
    }
}
class LongShortStitchRenderer {
    constructor() {
        this.id = 'long-short';
        this.name = 'Long Short Stitch';
        this.category = 'stitch';
    }
    canHandle(tool, config) {
        return tool === 'long-short' || config?.type === 'long-short';
    }
    render(ctx, points, config) {
        ctx.save();
        ctx.strokeStyle = config.color;
        ctx.lineWidth = config.thickness;
        ctx.globalAlpha = config.opacity || 1.0;
        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];
            ctx.beginPath();
            ctx.moveTo(current.x, current.y);
            ctx.lineTo(next.x, next.y);
            ctx.stroke();
        }
        ctx.restore();
    }
    getDefaultConfig() {
        return { type: 'long-short', color: '#ff69b4', thickness: 3, opacity: 1.0 };
    }
    validateConfig(config) {
        return !!(config.type && config.color && typeof config.thickness === 'number');
    }
}
class FishboneStitchRenderer {
    constructor() {
        this.id = 'fishbone';
        this.name = 'Fishbone Stitch';
        this.category = 'stitch';
    }
    canHandle(tool, config) {
        return tool === 'fishbone' || config?.type === 'fishbone';
    }
    render(ctx, points, config) {
        ctx.save();
        ctx.strokeStyle = config.color;
        ctx.lineWidth = config.thickness;
        ctx.globalAlpha = config.opacity || 1.0;
        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];
            ctx.beginPath();
            ctx.moveTo(current.x, current.y);
            ctx.lineTo(next.x, next.y);
            ctx.stroke();
        }
        ctx.restore();
    }
    getDefaultConfig() {
        return { type: 'fishbone', color: '#ff69b4', thickness: 3, opacity: 1.0 };
    }
    validateConfig(config) {
        return !!(config.type && config.color && typeof config.thickness === 'number');
    }
}
class SatinRibbonStitchRenderer {
    constructor() {
        this.id = 'satin-ribbon';
        this.name = 'Satin Ribbon Stitch';
        this.category = 'stitch';
    }
    canHandle(tool, config) {
        return tool === 'satin-ribbon' || config?.type === 'satin-ribbon';
    }
    render(ctx, points, config) {
        ctx.save();
        ctx.strokeStyle = config.color;
        ctx.lineWidth = config.thickness * 1.5;
        ctx.globalAlpha = config.opacity || 1.0;
        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];
            ctx.beginPath();
            ctx.moveTo(current.x, current.y);
            ctx.lineTo(next.x, next.y);
            ctx.stroke();
        }
        ctx.restore();
    }
    getDefaultConfig() {
        return { type: 'satin-ribbon', color: '#ff69b4', thickness: 3, opacity: 1.0 };
    }
    validateConfig(config) {
        return !!(config.type && config.color && typeof config.thickness === 'number');
    }
}
class MetallicStitchRenderer {
    constructor() {
        this.id = 'metallic';
        this.name = 'Metallic Stitch';
        this.category = 'stitch';
    }
    canHandle(tool, config) {
        return tool === 'metallic' || config?.type === 'metallic';
    }
    render(ctx, points, config) {
        ctx.save();
        ctx.strokeStyle = config.color;
        ctx.lineWidth = config.thickness;
        ctx.globalAlpha = config.opacity || 1.0;
        ctx.shadowColor = config.color;
        ctx.shadowBlur = 2;
        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];
            ctx.beginPath();
            ctx.moveTo(current.x, current.y);
            ctx.lineTo(next.x, next.y);
            ctx.stroke();
        }
        ctx.restore();
    }
    getDefaultConfig() {
        return { type: 'metallic', color: '#ff69b4', thickness: 3, opacity: 1.0 };
    }
    validateConfig(config) {
        return !!(config.type && config.color && typeof config.thickness === 'number');
    }
}
class GlowThreadStitchRenderer {
    constructor() {
        this.id = 'glow-thread';
        this.name = 'Glow Thread Stitch';
        this.category = 'stitch';
    }
    canHandle(tool, config) {
        return tool === 'glow-thread' || config?.type === 'glow-thread';
    }
    render(ctx, points, config) {
        ctx.save();
        ctx.strokeStyle = config.color;
        ctx.lineWidth = config.thickness;
        ctx.globalAlpha = config.opacity || 1.0;
        ctx.shadowColor = config.color;
        ctx.shadowBlur = 5;
        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];
            ctx.beginPath();
            ctx.moveTo(current.x, current.y);
            ctx.lineTo(next.x, next.y);
            ctx.stroke();
        }
        ctx.restore();
    }
    getDefaultConfig() {
        return { type: 'glow-thread', color: '#ff69b4', thickness: 3, opacity: 1.0 };
    }
    validateConfig(config) {
        return !!(config.type && config.color && typeof config.thickness === 'number');
    }
}
class VariegatedStitchRenderer {
    constructor() {
        this.id = 'variegated';
        this.name = 'Variegated Stitch';
        this.category = 'stitch';
    }
    canHandle(tool, config) {
        return tool === 'variegated' || config?.type === 'variegated';
    }
    render(ctx, points, config) {
        ctx.save();
        ctx.strokeStyle = config.color;
        ctx.lineWidth = config.thickness;
        ctx.globalAlpha = config.opacity || 1.0;
        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];
            // Create color variation
            const variation = Math.sin(i * 0.5) * 50;
            const variedColor = this.adjustBrightness(config.color, variation);
            ctx.strokeStyle = variedColor;
            ctx.beginPath();
            ctx.moveTo(current.x, current.y);
            ctx.lineTo(next.x, next.y);
            ctx.stroke();
        }
        ctx.restore();
    }
    adjustBrightness(color, amount) {
        if (!color || typeof color !== 'string')
            return '#ff69b4';
        const cleanColor = color.startsWith('#') ? color : `#${color}`;
        if (cleanColor.length !== 7)
            return '#ff69b4';
        const hex = cleanColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        if (isNaN(r) || isNaN(g) || isNaN(b))
            return '#ff69b4';
        // CRITICAL FIX: Round all RGB values to integers before hex conversion
        const newR = Math.round(Math.max(0, Math.min(255, r + amount)));
        const newG = Math.round(Math.max(0, Math.min(255, g + amount)));
        const newB = Math.round(Math.max(0, Math.min(255, b + amount)));
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
    getDefaultConfig() {
        return { type: 'variegated', color: '#ff69b4', thickness: 3, opacity: 1.0 };
    }
    validateConfig(config) {
        return !!(config.type && config.color && typeof config.thickness === 'number');
    }
}
class GradientStitchRenderer {
    constructor() {
        this.id = 'gradient';
        this.name = 'Gradient Stitch';
        this.category = 'stitch';
    }
    canHandle(tool, config) {
        return tool === 'gradient' || config?.type === 'gradient';
    }
    render(ctx, points, config) {
        ctx.save();
        ctx.lineWidth = config.thickness;
        ctx.globalAlpha = config.opacity || 1.0;
        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];
            // Create gradient effect
            const gradient = ctx.createLinearGradient(current.x, current.y, next.x, next.y);
            gradient.addColorStop(0, config.color);
            gradient.addColorStop(1, this.adjustBrightness(config.color, -50));
            ctx.strokeStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(current.x, current.y);
            ctx.lineTo(next.x, next.y);
            ctx.stroke();
        }
        ctx.restore();
    }
    adjustBrightness(color, amount) {
        if (!color || typeof color !== 'string')
            return '#ff69b4';
        const cleanColor = color.startsWith('#') ? color : `#${color}`;
        if (cleanColor.length !== 7)
            return '#ff69b4';
        const hex = cleanColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        if (isNaN(r) || isNaN(g) || isNaN(b))
            return '#ff69b4';
        // CRITICAL FIX: Round all RGB values to integers before hex conversion
        const newR = Math.round(Math.max(0, Math.min(255, r + amount)));
        const newG = Math.round(Math.max(0, Math.min(255, g + amount)));
        const newB = Math.round(Math.max(0, Math.min(255, b + amount)));
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
    getDefaultConfig() {
        return { type: 'gradient', color: '#ff69b4', thickness: 3, opacity: 1.0 };
    }
    validateConfig(config) {
        return !!(config.type && config.color && typeof config.thickness === 'number');
    }
}
// Export the universal renderer instance
export const universalVectorRenderer = new UniversalVectorRenderer();
