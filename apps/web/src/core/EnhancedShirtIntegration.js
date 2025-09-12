// Enhanced Shirt Component Integration
// Provides seamless integration between embroidery tools and vector tools with 4K HD rendering
import { useApp } from '../App';
import { vectorStore } from '../vector/vectorState';
import { vectorEmbroideryIntegration } from './EnhancedVectorEmbroideryIntegration';
import { AIOptimizationSystem } from './AIOptimizationSystem';
// Enhanced Shirt Integration Manager
export class EnhancedShirtIntegration {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.renderCache = new Map();
        // Event system
        this.eventListeners = new Map();
        this.config = this.getDefaultConfig();
        this.state = this.getInitialState();
        this.aiOptimization = AIOptimizationSystem.getInstance();
        this.performanceMonitor = new PerformanceMonitor();
    }
    static getInstance() {
        if (!EnhancedShirtIntegration.instance) {
            EnhancedShirtIntegration.instance = new EnhancedShirtIntegration();
        }
        return EnhancedShirtIntegration.instance;
    }
    // Main Integration Methods
    async initialize(canvas) {
        try {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            if (!this.ctx) {
                throw new Error('Failed to get 2D context');
            }
            // Initialize vector-embroidery integration
            if (this.config.enableEmbroideryVectorIntegration) {
                await vectorEmbroideryIntegration.initialize(canvas);
            }
            // Initialize AI optimization
            if (this.config.enableAIOptimization) {
                await this.initializeAIOptimization();
            }
            // Setup 4K rendering
            if (this.config.enable4KHDRendering) {
                this.setup4KHDRendering();
            }
            this.state.isIntegrated = true;
            console.log('✅ Enhanced Shirt Integration initialized');
            return true;
        }
        catch (error) {
            console.error('❌ Enhanced Shirt Integration initialization failed:', error);
            return false;
        }
    }
    // Embroidery Tool Integration
    async handleEmbroideryToolActivation(stitchType) {
        try {
            this.state.embroideryToolActive = true;
            this.state.currentStitchType = stitchType;
            // Update app state
            useApp.setState({
                activeTool: 'embroidery',
                embroideryStitchType: stitchType
            });
            // Setup embroidery tool for vector integration
            if (this.config.enableEmbroideryVectorIntegration) {
                await this.setupEmbroideryForVectorIntegration(stitchType);
            }
            // Emit embroidery tool activated event
            this.emit('embroideryToolActivated', { stitchType });
        }
        catch (error) {
            console.error('Error handling embroidery tool activation:', error);
        }
    }
    // Vector Tool Integration
    async handleVectorToolActivation(tool) {
        try {
            this.state.vectorToolActive = true;
            this.state.currentVectorTool = tool;
            // Update vector store
            vectorStore.setState({ tool: tool });
            // Setup vector tool for embroidery integration
            if (this.config.enableEmbroideryVectorIntegration) {
                await this.setupVectorForEmbroideryIntegration(tool);
            }
            // Emit vector tool activated event
            this.emit('vectorToolActivated', { tool });
        }
        catch (error) {
            console.error('Error handling vector tool activation:', error);
        }
    }
    // Pen Tool with Stitch Rendering
    async handlePenToolPointAdded(point) {
        try {
            const st = vectorStore.getState();
            const currentPath = st.currentPath;
            if (!currentPath) {
                // Start new path
                const newPath = {
                    id: `path_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    points: [point],
                    closed: false,
                    fill: true,
                    stroke: true,
                    fillColor: useApp.getState().brushColor || '#000000',
                    strokeColor: useApp.getState().brushColor || '#000000',
                    strokeWidth: 3,
                    fillOpacity: 1.0,
                    strokeOpacity: 1.0,
                    strokeJoin: 'round',
                    strokeCap: 'round',
                    tool: 'pen'
                };
                vectorStore.setState({ currentPath: newPath });
                // Render real-time preview if enabled
                if (this.config.enableRealTimeStitchRendering) {
                    await this.renderRealTimeStitchPreview(newPath);
                }
            }
            else {
                // Add point to existing path
                const updatedPath = {
                    ...currentPath,
                    points: [...currentPath.points, point]
                };
                vectorStore.setState({ currentPath: updatedPath });
                // Render real-time preview if enabled
                if (this.config.enableRealTimeStitchRendering) {
                    await this.renderRealTimeStitchPreview(updatedPath);
                }
            }
            // Emit point added event
            this.emit('penToolPointAdded', { point, path: currentPath });
        }
        catch (error) {
            console.error('Error handling pen tool point addition:', error);
        }
    }
    // Path Completion with Stitch Rendering
    async handlePathCompletion() {
        try {
            const st = vectorStore.getState();
            const currentPath = st.currentPath;
            if (!currentPath || currentPath.points.length < 2) {
                console.warn('No valid path to complete');
                return;
            }
            // Convert path to embroidery stitches
            const stitches = await this.convertPathToStitches(currentPath);
            // Render stitches immediately
            await this.renderStitches(stitches);
            // Store stitches in app state
            this.storeStitches(stitches);
            // Clear current path
            vectorStore.setState({ currentPath: null });
            // Emit path completed event
            this.emit('pathCompleted', { path: currentPath, stitches });
        }
        catch (error) {
            console.error('Error handling path completion:', error);
        }
    }
    // Vector Mode Exit with Anchor Point Cleanup
    async handleVectorModeExit() {
        try {
            // Complete any remaining paths
            await this.handlePathCompletion();
            // Clear anchor points
            await this.clearAnchorPoints();
            // Clear vector store
            vectorStore.setState({ selected: [] });
            vectorStore.setState({ currentPath: null });
            // Reset states
            this.state.vectorToolActive = false;
            this.state.currentVectorTool = '';
            // Emit mode exit event
            this.emit('vectorModeExited', {});
        }
        catch (error) {
            console.error('Error handling vector mode exit:', error);
        }
    }
    // Real-time Stitch Preview
    async renderRealTimeStitchPreview(path) {
        if (!this.config.enableRealTimeStitchRendering || !this.ctx)
            return;
        try {
            // Clear previous preview
            this.clearPreview();
            // Generate preview stitches
            const previewStitches = await this.generatePreviewStitches(path);
            // Render preview with lower quality for performance
            await this.renderPreviewStitches(previewStitches);
        }
        catch (error) {
            console.error('Error rendering real-time stitch preview:', error);
        }
    }
    async generatePreviewStitches(path) {
        const stitches = [];
        if (path.points && path.points.length >= 2) {
            const stitch = {
                id: `preview_${Date.now()}`,
                type: this.state.currentStitchType,
                points: path.points,
                color: useApp.getState().embroideryColor || '#ff69b4',
                thickness: useApp.getState().embroideryThickness || 3,
                opacity: 0.5 // Lower opacity for preview
            };
            stitches.push(stitch);
        }
        return stitches;
    }
    async renderPreviewStitches(stitches) {
        if (!this.ctx)
            return;
        // Save context state
        this.ctx.save();
        try {
            // Set preview rendering mode
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.globalAlpha = 0.5;
            // Render preview stitches
            for (const stitch of stitches) {
                await this.renderSingleStitch(stitch, true); // true for preview mode
            }
        }
        finally {
            this.ctx.restore();
        }
    }
    // Stitch Rendering Methods
    async renderStitches(stitches) {
        if (!this.ctx)
            return;
        try {
            this.state.isRendering = true;
            // Setup 4K rendering context
            if (this.config.enable4KHDRendering) {
                this.setup4KHDRendering();
            }
            // Render each stitch
            for (const stitch of stitches) {
                await this.renderSingleStitch(stitch, false);
            }
            // Apply post-processing for 4K quality
            if (this.config.enable4KHDRendering) {
                await this.apply4KPostProcessing();
            }
            this.state.lastRenderTime = performance.now();
        }
        catch (error) {
            console.error('Error rendering stitches:', error);
        }
        finally {
            this.state.isRendering = false;
        }
    }
    async renderSingleStitch(stitch, isPreview = false) {
        if (!this.ctx)
            return;
        // Save context state
        this.ctx.save();
        try {
            // Apply 4K rendering settings
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            // Set opacity for preview
            if (isPreview) {
                this.ctx.globalAlpha = 0.5;
            }
            else {
                this.ctx.globalAlpha = stitch.opacity || 1.0;
            }
            // Render stitch based on type
            switch (stitch.type) {
                case 'cross-stitch':
                    await this.renderCrossStitch4K(stitch);
                    break;
                case 'satin':
                    await this.renderSatinStitch4K(stitch);
                    break;
                case 'chain':
                    await this.renderChainStitch4K(stitch);
                    break;
                case 'fill':
                    await this.renderFillStitch4K(stitch);
                    break;
                default:
                    await this.renderOutlineStitch4K(stitch);
            }
        }
        finally {
            this.ctx.restore();
        }
    }
    // 4K HD Stitch Rendering Methods
    async renderCrossStitch4K(stitch) {
        if (!this.ctx)
            return;
        const points = stitch.points || [];
        if (points.length < 2)
            return;
        // Calculate 4K super-sampling
        const superSampling = this.config.renderingQuality === '4k' ? 4 : 2;
        const scaledThickness = (stitch.thickness || 3) * superSampling;
        const scaledSpacing = Math.max(4, scaledThickness * 1.2);
        // Set up rendering context
        this.ctx.strokeStyle = stitch.color || '#ff69b4';
        this.ctx.lineWidth = 1;
        // Render cross-stitches with 4K quality
        for (let i = 0; i < points.length - 1; i++) {
            const point = points[i];
            const nextPoint = points[i + 1];
            const dx = nextPoint.x - point.x;
            const dy = nextPoint.y - point.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const numStitches = Math.ceil(distance / scaledSpacing);
            for (let j = 0; j < numStitches; j++) {
                const t = j / numStitches;
                const x = point.x + dx * t;
                const y = point.y + dy * t;
                // Render cross-stitch with 4K quality
                this.renderCrossStitchAt(x, y, scaledThickness);
            }
        }
    }
    renderCrossStitchAt(x, y, thickness) {
        if (!this.ctx)
            return;
        const size = thickness / 2;
        // Render cross-stitch (X pattern)
        this.ctx.beginPath();
        this.ctx.moveTo(x - size, y - size);
        this.ctx.lineTo(x + size, y + size);
        this.ctx.moveTo(x + size, y - size);
        this.ctx.lineTo(x - size, y + size);
        this.ctx.stroke();
    }
    async renderSatinStitch4K(stitch) {
        if (!this.ctx)
            return;
        const points = stitch.points || [];
        if (points.length < 2)
            return;
        // Set up rendering context
        this.ctx.strokeStyle = stitch.color || '#ff69b4';
        this.ctx.lineWidth = stitch.thickness || 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        // Render satin stitch with 4K quality
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.stroke();
    }
    async renderChainStitch4K(stitch) {
        if (!this.ctx)
            return;
        const points = stitch.points || [];
        if (points.length < 2)
            return;
        // Set up rendering context
        this.ctx.strokeStyle = stitch.color || '#ff69b4';
        this.ctx.lineWidth = stitch.thickness || 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        // Render chain stitch with 4K quality
        for (let i = 0; i < points.length - 1; i++) {
            const point = points[i];
            const nextPoint = points[i + 1];
            // Calculate chain loop
            const dx = nextPoint.x - point.x;
            const dy = nextPoint.y - point.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const loopSize = Math.min(distance / 2, (stitch.thickness || 3) * 2);
            // Render chain loop
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, loopSize, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }
    async renderFillStitch4K(stitch) {
        if (!this.ctx)
            return;
        const points = stitch.points || [];
        if (points.length < 3)
            return;
        // Set up rendering context
        this.ctx.fillStyle = stitch.color || '#ff69b4';
        // Render fill stitch with 4K quality
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
    async renderOutlineStitch4K(stitch) {
        if (!this.ctx)
            return;
        const points = stitch.points || [];
        if (points.length < 2)
            return;
        // Set up rendering context
        this.ctx.strokeStyle = stitch.color || '#ff69b4';
        this.ctx.lineWidth = stitch.thickness || 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        // Render outline stitch with 4K quality
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.stroke();
    }
    // Anchor Point Management
    async clearAnchorPoints() {
        try {
            // Clear anchor points from canvas
            if (this.ctx && this.canvas) {
                // Clear the entire canvas to remove anchor points
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
            // Clear anchor points from state
            this.state.anchorPoints = [];
            // Clear vector store selection
            vectorStore.setState({ selected: [] });
        }
        catch (error) {
            console.error('Error clearing anchor points:', error);
        }
    }
    // Utility Methods
    async convertPathToStitches(path) {
        const stitches = [];
        if (path.points && path.points.length >= 2) {
            const stitch = {
                id: `stitch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: this.state.currentStitchType,
                points: path.points,
                color: useApp.getState().embroideryColor || '#ff69b4',
                thickness: useApp.getState().embroideryThickness || 3,
                opacity: useApp.getState().embroideryOpacity || 1.0,
                createdFromVector: true,
                originalPathId: path.id
            };
            stitches.push(stitch);
        }
        return stitches;
    }
    storeStitches(stitches) {
        try {
            const appState = useApp.getState();
            const currentStitches = appState.embroideryStitches || [];
            const updatedStitches = [...currentStitches, ...stitches];
            useApp.setState({ embroideryStitches: updatedStitches });
        }
        catch (error) {
            console.error('Error storing stitches:', error);
        }
    }
    clearPreview() {
        if (!this.ctx || !this.canvas)
            return;
        // Clear only the preview area (implement based on your needs)
        // This is a simplified version
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    setup4KHDRendering() {
        if (!this.canvas || !this.ctx)
            return;
        // Setup 4K rendering context
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        // Set canvas size for 4K rendering
        this.canvas.width = rect.width * dpr * 4; // 4K super-sampling
        this.canvas.height = rect.height * dpr * 4;
        // Scale context for 4K rendering
        this.ctx.scale(dpr * 4, dpr * 4);
        // Enable high-quality rendering
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
    }
    async apply4KPostProcessing() {
        if (!this.ctx || !this.canvas)
            return;
        // Apply 4K post-processing effects
        // This could include sharpening, color correction, etc.
    }
    async initializeAIOptimization() {
        try {
            // Initialize AI optimization for enhanced shirt integration
            await this.aiOptimization.optimizeRendering(this.getRenderingQualityConfig(), this.getRenderingContext());
        }
        catch (error) {
            console.error('Error initializing AI optimization:', error);
        }
    }
    async setupEmbroideryForVectorIntegration(stitchType) {
        // Setup embroidery tool for vector integration
        // This would configure the embroidery tool to work with vector tools
    }
    async setupVectorForEmbroideryIntegration(tool) {
        // Setup vector tool for embroidery integration
        // This would configure the vector tool to work with embroidery tools
    }
    getRenderingQualityConfig() {
        return {
            width: this.canvas?.width || 1920,
            height: this.canvas?.height || 1080,
            dpi: 300,
            superSampling: this.config.renderingQuality === '4k' ? 4 : 2,
            antiAliasing: true,
            textureQuality: this.config.renderingQuality,
            shadowQuality: this.config.renderingQuality,
            lightingQuality: this.config.renderingQuality,
            materialDetail: 0.9,
            threadDetail: 0.95,
            fabricDetail: 0.9,
            printDetail: 0.85,
            realismLevel: 'hyperrealistic',
            physicsSimulation: true,
            dynamicLighting: true,
            materialInteraction: true
        };
    }
    getRenderingContext() {
        return {
            canvas: this.canvas,
            elements: [],
            settings: this.getRenderingQualityConfig(),
            user: {
                id: 'user',
                preferences: {
                    quality: this.config.renderingQuality,
                    performance: 'balanced',
                    realism: 'hyperrealistic'
                },
                skillLevel: 'intermediate',
                usagePatterns: []
            }
        };
    }
    // Event System
    on(event, listener) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(listener);
        return () => {
            const listeners = this.eventListeners.get(event) || [];
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }
    emit(event, data) {
        const listeners = this.eventListeners.get(event) || [];
        listeners.forEach(listener => {
            try {
                listener(data);
            }
            catch (error) {
                console.error(`Error in enhanced shirt event listener for ${event}:`, error);
            }
        });
    }
    // Configuration Methods
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    getConfig() {
        return { ...this.config };
    }
    getState() {
        return { ...this.state };
    }
    // Helper Methods
    getDefaultConfig() {
        return {
            enableEmbroideryVectorIntegration: true,
            enableRealTimeStitchRendering: true,
            enable4KHDRendering: true,
            enableAIOptimization: true,
            enableAnchorPointCleanup: true,
            enableCurvatureTools: true,
            enableAdvancedVectorTools: true,
            enablePhotoshopLikeBehavior: true,
            enablePerformanceOptimization: true,
            enableMemoryOptimization: true,
            enableRenderCaching: true,
            renderingQuality: '4k',
            stitchQuality: 'hyperrealistic',
            vectorQuality: 'studio'
        };
    }
    getInitialState() {
        return {
            embroideryToolActive: false,
            vectorToolActive: false,
            currentStitchType: 'cross-stitch',
            currentVectorTool: 'pen',
            isRendering: false,
            isPreviewing: false,
            lastRenderTime: 0,
            isIntegrated: false,
            isOptimized: false,
            performanceMetrics: {}
        };
    }
}
// Performance Monitor
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
    }
    startMonitoring() {
        // Start performance monitoring
    }
    stopMonitoring() {
        // Stop performance monitoring
    }
    getMetrics() {
        return this.metrics;
    }
}
// Export integration instance
export const enhancedShirtIntegration = EnhancedShirtIntegration.getInstance();
