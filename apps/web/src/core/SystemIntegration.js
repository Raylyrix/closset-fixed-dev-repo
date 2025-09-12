// System Integration
// Connects all core systems with existing codebase
import { ShirtIntegration } from './ShirtIntegration';
import { PluginManager } from './PluginAPI';
import { AIOptimizationSystem } from './AIOptimizationSystem';
import { UniversalToolSystem } from './ToolSystem';
import { AdvancedStitchSystem } from './AdvancedStitchSystem';
// System Integration Manager
export class SystemIntegration {
    constructor() {
        this.isInitialized = false;
        // Event system
        this.eventListeners = new Map();
        this.config = this.getDefaultConfig();
        this.status = this.getInitialStatus();
        // Initialize core systems
        this.shirtIntegration = ShirtIntegration.getInstance();
        this.pluginManager = PluginManager.getInstance();
        this.aiOptimization = AIOptimizationSystem.getInstance();
        this.universalToolSystem = UniversalToolSystem.getInstance();
        this.stitchSystem = AdvancedStitchSystem.getInstance();
    }
    static getInstance() {
        if (!SystemIntegration.instance) {
            SystemIntegration.instance = new SystemIntegration();
        }
        return SystemIntegration.instance;
    }
    // Initialization
    async initialize(config) {
        try {
            console.log('🚀 Initializing System Integration...');
            // Update config
            if (config) {
                this.config = { ...this.config, ...config };
            }
            // Initialize Shirt Integration
            if (this.config.enableUniversalTools || this.config.enableAdvancedStitches || this.config.enableAIOptimization) {
                console.log('📐 Initializing Shirt Integration...');
                await this.shirtIntegration.initialize({
                    enableUniversalTools: this.config.enableUniversalTools,
                    enableAdvancedStitches: this.config.enableAdvancedStitches,
                    enableAIOptimization: this.config.enableAIOptimization,
                    enablePerformanceOptimization: true,
                    renderingQuality: this.config.renderingQuality,
                    hyperrealisticRendering: this.config.hyperrealisticRendering,
                    realTimeOptimization: this.config.realTimeOptimization,
                    maxMemoryUsage: this.config.maxMemoryUsage,
                    targetFPS: this.config.targetFPS,
                    optimizationLevel: this.config.optimizationLevel,
                    aiLearningEnabled: this.config.aiLearningEnabled,
                    aiOptimizationEnabled: this.config.aiOptimizationEnabled,
                    aiQualityEnhancement: this.config.aiQualityEnhancement
                });
            }
            // Initialize Plugin System
            if (this.config.enablePluginSystem) {
                console.log('🔌 Initializing Plugin System...');
                // Plugin system is already initialized in constructor
                this.status.systems.pluginSystem = true;
            }
            // Setup event listeners
            this.setupEventListeners();
            // Start monitoring
            if (this.config.enablePerformanceMonitoring) {
                this.startPerformanceMonitoring();
            }
            this.isInitialized = true;
            this.status.isInitialized = true;
            console.log('✅ System Integration initialized successfully');
            // Emit event
            this.emit('integrationInitialized', { config: this.config, status: this.status });
            return true;
        }
        catch (error) {
            console.error('❌ Error initializing System Integration:', error);
            return false;
        }
    }
    // System Management
    async enableSystem(system) {
        try {
            switch (system) {
                case 'universalTools':
                    if (this.config.enableUniversalTools) {
                        this.status.systems.universalTools = true;
                        console.log('✅ Universal Tools enabled');
                    }
                    break;
                case 'advancedStitches':
                    if (this.config.enableAdvancedStitches) {
                        this.status.systems.advancedStitches = true;
                        console.log('✅ Advanced Stitches enabled');
                    }
                    break;
                case 'aiOptimization':
                    if (this.config.enableAIOptimization) {
                        this.status.systems.aiOptimization = true;
                        console.log('✅ AI Optimization enabled');
                    }
                    break;
                case 'pluginSystem':
                    if (this.config.enablePluginSystem) {
                        this.status.systems.pluginSystem = true;
                        console.log('✅ Plugin System enabled');
                    }
                    break;
            }
            this.emit('systemEnabled', { system, status: this.status });
            return true;
        }
        catch (error) {
            console.error(`Error enabling system ${system}:`, error);
            return false;
        }
    }
    async disableSystem(system) {
        try {
            switch (system) {
                case 'universalTools':
                    this.status.systems.universalTools = false;
                    console.log('❌ Universal Tools disabled');
                    break;
                case 'advancedStitches':
                    this.status.systems.advancedStitches = false;
                    console.log('❌ Advanced Stitches disabled');
                    break;
                case 'aiOptimization':
                    this.status.systems.aiOptimization = false;
                    console.log('❌ AI Optimization disabled');
                    break;
                case 'pluginSystem':
                    this.status.systems.pluginSystem = false;
                    console.log('❌ Plugin System disabled');
                    break;
            }
            this.emit('systemDisabled', { system, status: this.status });
            return true;
        }
        catch (error) {
            console.error(`Error disabling system ${system}:`, error);
            return false;
        }
    }
    // Quality Management
    async setRenderingQuality(quality) {
        try {
            this.config.renderingQuality = quality;
            this.status.quality.currentQuality = quality;
            // Update Shirt Integration
            await this.shirtIntegration.initialize({
                renderingQuality: quality,
                hyperrealisticRendering: this.config.hyperrealisticRendering,
                realTimeOptimization: this.config.realTimeOptimization
            });
            console.log(`🎨 Rendering quality set to: ${quality}`);
            this.emit('qualityChanged', { quality, status: this.status });
        }
        catch (error) {
            console.error('Error setting rendering quality:', error);
        }
    }
    async enableHyperrealisticRendering() {
        try {
            this.config.hyperrealisticRendering = true;
            this.status.quality.hyperrealisticEnabled = true;
            // Update Shirt Integration
            await this.shirtIntegration.initialize({
                hyperrealisticRendering: true,
                renderingQuality: this.config.renderingQuality,
                realTimeOptimization: this.config.realTimeOptimization
            });
            console.log('🎭 Hyperrealistic rendering enabled');
            this.emit('hyperrealisticEnabled', { status: this.status });
        }
        catch (error) {
            console.error('Error enabling hyperrealistic rendering:', error);
        }
    }
    async disableHyperrealisticRendering() {
        try {
            this.config.hyperrealisticRendering = false;
            this.status.quality.hyperrealisticEnabled = false;
            // Update Shirt Integration
            await this.shirtIntegration.initialize({
                hyperrealisticRendering: false,
                renderingQuality: this.config.renderingQuality,
                realTimeOptimization: this.config.realTimeOptimization
            });
            console.log('🎭 Hyperrealistic rendering disabled');
            this.emit('hyperrealisticDisabled', { status: this.status });
        }
        catch (error) {
            console.error('Error disabling hyperrealistic rendering:', error);
        }
    }
    // Performance Management
    getPerformanceMetrics() {
        if (this.status.systems.aiOptimization) {
            return this.aiOptimization.getCurrentMetrics();
        }
        return {
            fps: 60,
            memoryUsage: 0,
            optimizationScore: 0
        };
    }
    async optimizePerformance() {
        try {
            if (this.status.systems.aiOptimization) {
                // Perform AI optimization
                const result = await this.aiOptimization.optimizeRendering(this.getRenderingQualityConfig(), this.getRenderingContext());
                if (result.success) {
                    console.log('⚡ Performance optimized successfully');
                    this.emit('performanceOptimized', { result });
                }
            }
        }
        catch (error) {
            console.error('Error optimizing performance:', error);
        }
    }
    // Plugin Management
    async installPlugin(plugin) {
        try {
            if (!this.status.systems.pluginSystem) {
                console.error('Plugin system not enabled');
                return false;
            }
            const success = await this.pluginManager.installPlugin(plugin);
            if (success) {
                console.log(`🔌 Plugin installed: ${plugin.name}`);
                this.emit('pluginInstalled', { plugin });
            }
            return success;
        }
        catch (error) {
            console.error('Error installing plugin:', error);
            return false;
        }
    }
    async enablePlugin(pluginId) {
        try {
            if (!this.status.systems.pluginSystem) {
                console.error('Plugin system not enabled');
                return false;
            }
            const success = await this.pluginManager.enablePlugin(pluginId);
            if (success) {
                console.log(`🔌 Plugin enabled: ${pluginId}`);
                this.emit('pluginEnabled', { pluginId });
            }
            return success;
        }
        catch (error) {
            console.error('Error enabling plugin:', error);
            return false;
        }
    }
    // Status and Information
    getStatus() {
        return { ...this.status };
    }
    getConfig() {
        return { ...this.config };
    }
    isSystemEnabled(system) {
        return this.status.systems[system];
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
                console.error(`Error in system integration event listener for ${event}:`, error);
            }
        });
    }
    // Helper methods
    setupEventListeners() {
        // Setup event listeners for system integration
        this.shirtIntegration.on('integrationInitialized', (data) => {
            console.log('📐 Shirt Integration initialized:', data);
        });
        this.pluginManager.on('pluginInstalled', (data) => {
            console.log('🔌 Plugin installed:', data);
        });
        this.aiOptimization.on('metricsUpdated', (data) => {
            this.updatePerformanceMetrics(data.metrics);
        });
    }
    startPerformanceMonitoring() {
        setInterval(() => {
            this.updatePerformanceMetrics();
        }, 1000); // Every second
    }
    updatePerformanceMetrics(metrics) {
        if (metrics) {
            this.status.performance = {
                currentFPS: metrics.fps || 60,
                memoryUsage: metrics.memoryUsage || 0,
                optimizationScore: metrics.optimizationScore || 0
            };
        }
        else {
            const currentMetrics = this.getPerformanceMetrics();
            this.status.performance = {
                currentFPS: currentMetrics.fps || 60,
                memoryUsage: currentMetrics.memoryUsage || 0,
                optimizationScore: currentMetrics.optimizationScore || 0
            };
        }
        this.emit('metricsUpdated', { metrics: this.status.performance });
    }
    getRenderingQualityConfig() {
        return {
            width: 1920,
            height: 1080,
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
            realismLevel: this.config.hyperrealisticRendering ? 'hyperrealistic' : 'enhanced',
            physicsSimulation: this.config.hyperrealisticRendering,
            dynamicLighting: this.config.hyperrealisticRendering,
            materialInteraction: this.config.hyperrealisticRendering
        };
    }
    getRenderingContext() {
        return {
            canvas: null, // Would be populated from actual context
            elements: [],
            settings: this.getRenderingQualityConfig(),
            user: {
                id: 'user',
                preferences: {
                    quality: this.config.renderingQuality,
                    performance: 'balanced',
                    realism: this.config.hyperrealisticRendering ? 'hyperrealistic' : 'enhanced'
                },
                skillLevel: 'intermediate',
                usagePatterns: []
            }
        };
    }
    getDefaultConfig() {
        return {
            enableUniversalTools: true,
            enableAdvancedStitches: true,
            enableAIOptimization: true,
            enablePluginSystem: true,
            renderingQuality: 'high',
            hyperrealisticRendering: false,
            realTimeOptimization: true,
            maxMemoryUsage: 512,
            targetFPS: 60,
            optimizationLevel: 'high',
            aiLearningEnabled: true,
            aiOptimizationEnabled: true,
            aiQualityEnhancement: true,
            preserveExistingFunctionality: true,
            enableGradualMigration: true,
            enablePerformanceMonitoring: true
        };
    }
    getInitialStatus() {
        return {
            isInitialized: false,
            systems: {
                universalTools: false,
                advancedStitches: false,
                aiOptimization: false,
                pluginSystem: false
            },
            performance: {
                currentFPS: 60,
                memoryUsage: 0,
                optimizationScore: 0
            },
            quality: {
                currentQuality: 'high',
                hyperrealisticEnabled: false,
                realTimeOptimization: false
            }
        };
    }
}
// Export system integration instance
export const systemIntegration = SystemIntegration.getInstance();
// Auto-initialize when imported
if (typeof window !== 'undefined') {
    // Initialize system integration when the module is loaded
    systemIntegration.initialize().then(success => {
        if (success) {
            console.log('🎉 System Integration auto-initialized successfully');
        }
        else {
            console.error('❌ System Integration auto-initialization failed');
        }
    });
}
