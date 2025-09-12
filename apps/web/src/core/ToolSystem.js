// Revolutionary Universal Tool System Architecture
// Extensible, performant, and user-friendly tool framework
// Universal Tool System Manager
export class UniversalToolSystem {
    constructor() {
        this.renderers = new Map();
        this.toolConfigs = new Map();
        this.performanceCache = new Map();
        this.eventListeners = new Map();
        // Performance monitoring
        this.performanceMetrics = new Map();
        this.maxCacheSize = 1000;
        this.optimizationThreshold = 0.8;
        this.initializeCoreTools();
        this.setupPerformanceMonitoring();
    }
    static getInstance() {
        if (!UniversalToolSystem.instance) {
            UniversalToolSystem.instance = new UniversalToolSystem();
        }
        return UniversalToolSystem.instance;
    }
    // Tool Registration System
    registerTool(renderer) {
        try {
            // Validate renderer
            const validation = this.validateRenderer(renderer);
            if (!validation.valid) {
                console.error('Invalid tool renderer:', validation.errors);
                return false;
            }
            // Check for conflicts
            const conflicts = this.checkToolConflicts(renderer);
            if (conflicts.length > 0) {
                console.warn('Tool conflicts detected:', conflicts);
                // Auto-resolve conflicts or ask user
                this.resolveConflicts(renderer, conflicts);
            }
            // Register tool
            this.renderers.set(renderer.id, renderer);
            // Initialize default config
            const defaultConfig = this.createDefaultConfig(renderer);
            this.toolConfigs.set(renderer.id, defaultConfig);
            // Emit registration event
            this.emit('toolRegistered', { renderer, config: defaultConfig });
            console.log(`✅ Tool registered: ${renderer.name} v${renderer.version}`);
            return true;
        }
        catch (error) {
            console.error('Error registering tool:', error);
            return false;
        }
    }
    // Universal Rendering Pipeline
    renderPath(ctx, path, mode = 'final', options = {}) {
        const startTime = performance.now();
        try {
            // Validate inputs
            const validation = this.validateRenderInputs(ctx, path, mode);
            if (!validation.valid) {
                return { success: false, error: validation.errors.join(', ') };
            }
            // Check cache first
            const cacheKey = this.generateCacheKey(path, mode, options);
            if (options.useCache && this.performanceCache.has(cacheKey)) {
                const cached = this.performanceCache.get(cacheKey);
                this.applyCachedRender(ctx, cached);
                return { success: true, cached: true, renderTime: 0 };
            }
            // Sort tools by render order
            const sortedTools = this.sortToolsByRenderOrder(path.tools);
            // Render each tool
            const renderResults = [];
            for (const toolConfig of sortedTools) {
                const renderer = this.renderers.get(toolConfig.type);
                if (!renderer) {
                    console.warn(`Renderer not found for tool: ${toolConfig.type}`);
                    continue;
                }
                // Apply tool-specific optimizations
                const optimizedPath = this.optimizePathForTool(path, toolConfig, renderer);
                // Render based on mode
                let renderResult;
                switch (mode) {
                    case 'preview':
                        renderResult = this.renderPreview(ctx, optimizedPath, toolConfig, renderer);
                        break;
                    case 'final':
                        renderResult = this.renderFinal(ctx, optimizedPath, toolConfig, renderer);
                        break;
                    case 'thumbnail':
                        renderResult = this.renderThumbnail(ctx, optimizedPath, toolConfig, renderer);
                        break;
                }
                renderResults.push(renderResult);
            }
            // Cache result if enabled
            if (options.useCache && renderResults.every(r => r.success)) {
                this.cacheRenderResult(cacheKey, renderResults);
            }
            // Track performance
            const renderTime = performance.now() - startTime;
            this.trackPerformance('renderPath', renderTime);
            return {
                success: true,
                renderTime,
                results: renderResults,
                cached: false
            };
        }
        catch (error) {
            console.error('Error in universal rendering:', error);
            return { success: false, error: error.message };
        }
    }
    // Real-time Preview System
    enableRealTimePreview(path, config) {
        const renderer = this.renderers.get(config.type);
        if (!renderer || !renderer.supportsRealTimePreview()) {
            throw new Error(`Tool ${config.type} does not support real-time preview`);
        }
        return new PreviewController(path, config, renderer, this);
    }
    // Tool Composition System
    composeTools(tools) {
        // Check for conflicts
        const conflicts = this.checkToolCompositionConflicts(tools);
        if (conflicts.length > 0) {
            throw new Error(`Tool composition conflicts: ${conflicts.join(', ')}`);
        }
        // Create composed tool
        const composedTool = {
            id: `composed_${Date.now()}`,
            name: `Composed Tool (${tools.length} tools)`,
            tools: tools,
            renderOrder: this.calculateOptimalRenderOrder(tools),
            properties: this.mergeToolProperties(tools)
        };
        return composedTool;
    }
    // AI-Powered Tool Suggestions
    suggestTools(path, context) {
        const suggestions = [];
        // Analyze path characteristics
        const analysis = this.analyzePath(path);
        // Get compatible tools
        const compatibleTools = this.getCompatibleTools(analysis);
        // Rank by relevance
        const rankedTools = this.rankToolsByRelevance(compatibleTools, analysis, context);
        // Generate suggestions
        for (const tool of rankedTools) {
            suggestions.push({
                tool,
                confidence: tool.relevance,
                reasoning: tool.reasoning,
                preview: this.generateToolPreview(path, tool.config)
            });
        }
        return suggestions;
    }
    // Performance Optimization
    optimizePathForTool(path, config, renderer) {
        if (!renderer.canOptimize(path, config)) {
            return path;
        }
        return renderer.optimize(path, config);
    }
    // Cache Management
    generateCacheKey(path, mode, options) {
        const pathHash = this.hashPath(path);
        const optionsHash = this.hashOptions(options);
        return `${pathHash}_${mode}_${optionsHash}`;
    }
    cacheRenderResult(key, results) {
        if (this.performanceCache.size >= this.maxCacheSize) {
            this.evictOldestCacheEntries();
        }
        this.performanceCache.set(key, results);
    }
    // Event System
    emit(event, data) {
        const listeners = this.eventListeners.get(event) || [];
        listeners.forEach(listener => {
            try {
                listener(data);
            }
            catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        });
    }
    on(event, listener) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(listener);
        // Return unsubscribe function
        return () => {
            const listeners = this.eventListeners.get(event) || [];
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }
    // Initialize core tools
    initializeCoreTools() {
        // Register built-in tools
        this.registerTool(new BrushToolRenderer());
        this.registerTool(new EmbroideryToolRenderer());
        this.registerTool(new PuffPrintToolRenderer());
        this.registerTool(new VectorToolRenderer());
        this.registerTool(new AIToolRenderer());
    }
    // Performance monitoring
    setupPerformanceMonitoring() {
        setInterval(() => {
            this.analyzePerformance();
            this.optimizeCache();
        }, 5000); // Every 5 seconds
    }
    trackPerformance(operation, time) {
        if (!this.performanceMetrics.has(operation)) {
            this.performanceMetrics.set(operation, []);
        }
        const metrics = this.performanceMetrics.get(operation);
        metrics.push(time);
        // Keep only last 100 measurements
        if (metrics.length > 100) {
            metrics.shift();
        }
    }
    analyzePerformance() {
        for (const [operation, times] of this.performanceMetrics) {
            const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
            const maxTime = Math.max(...times);
            if (avgTime > 100) { // 100ms threshold
                console.warn(`Performance issue detected in ${operation}: avg ${avgTime.toFixed(2)}ms, max ${maxTime.toFixed(2)}ms`);
            }
        }
    }
}
// Preview Controller for real-time preview
export class PreviewController {
    constructor(path, config, renderer, system) {
        this.isActive = false;
        this.animationFrame = null;
        this.path = path;
        this.config = config;
        this.renderer = renderer;
        this.system = system;
        this.previewCanvas = document.createElement('canvas');
    }
    start() {
        this.isActive = true;
        this.renderLoop();
    }
    stop() {
        this.isActive = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
    updatePath(newPath) {
        this.path = newPath;
    }
    updateConfig(newConfig) {
        this.config = newConfig;
    }
    renderLoop() {
        if (!this.isActive)
            return;
        // Render preview
        const ctx = this.previewCanvas.getContext('2d');
        this.renderer.renderPreview(ctx, this.path, this.config);
        // Continue loop
        this.animationFrame = requestAnimationFrame(() => this.renderLoop());
    }
}
