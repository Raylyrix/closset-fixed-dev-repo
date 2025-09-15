/**
 * Plugin System - Extensible plugin architecture
 * Handles plugin loading, management, and lifecycle
 */
export class PluginSystem {
    constructor(config = {}) {
        this.plugins = new Map();
        this.loadedPlugins = new Map();
        this.isInitialized = false;
        this.systemHealth = 'healthy';
        this.config = {
            maxPlugins: config.maxPlugins || 50,
            pluginTimeout: config.pluginTimeout || 10000,
            enableSandbox: config.enableSandbox || true,
            allowFileAccess: config.allowFileAccess || false,
            allowNetworkAccess: config.allowNetworkAccess || false,
            pluginDirectory: config.pluginDirectory || '/plugins',
            ...config
        };
        this.pluginAPI = this.createPluginAPI();
    }
    // Initialize plugin system
    async initialize() {
        try {
            console.log('🔌 Initializing plugin system...');
            // Load built-in plugins
            await this.loadBuiltInPlugins();
            // Load external plugins
            await this.loadExternalPlugins();
            this.isInitialized = true;
            this.systemHealth = 'healthy';
            console.log('✅ Plugin system initialized');
            return true;
        }
        catch (error) {
            console.error('❌ Failed to initialize plugin system:', error);
            this.systemHealth = 'unhealthy';
            return false;
        }
    }
    // Load plugin
    async loadPlugin(manifest) {
        try {
            // Check if plugin already loaded
            if (this.plugins.has(manifest.id)) {
                console.warn(`Plugin ${manifest.id} already loaded`);
                return false;
            }
            // Check dependencies
            if (manifest.dependencies) {
                for (const dep of manifest.dependencies) {
                    if (!this.plugins.has(dep) || !this.plugins.get(dep)?.enabled) {
                        throw new Error(`Dependency ${dep} not found or not enabled`);
                    }
                }
            }
            // Create plugin instance
            const plugin = {
                id: manifest.id,
                name: manifest.name,
                version: manifest.version,
                description: manifest.description,
                author: manifest.author,
                dependencies: manifest.dependencies || [],
                permissions: manifest.permissions || [],
                enabled: false,
                metadata: manifest.metadata
            };
            // Load plugin code
            const pluginInstance = await this.loadPluginCode(manifest.main);
            plugin.instance = pluginInstance;
            plugin.enabled = true;
            // Initialize plugin
            if (pluginInstance.init) {
                await this.safeExecute(() => pluginInstance.init(this.pluginAPI), manifest.id);
            }
            // Register plugin
            this.plugins.set(manifest.id, plugin);
            this.loadedPlugins.set(manifest.id, pluginInstance);
            console.log(`✅ Plugin loaded: ${manifest.name} v${manifest.version}`);
            return true;
        }
        catch (error) {
            console.error(`❌ Failed to load plugin ${manifest.id}:`, error);
            return false;
        }
    }
    // Unload plugin
    async unloadPlugin(pluginId) {
        try {
            const plugin = this.plugins.get(pluginId);
            if (!plugin) {
                console.warn(`Plugin ${pluginId} not found`);
                return false;
            }
            // Check if other plugins depend on this one
            const dependents = this.getDependents(pluginId);
            if (dependents.length > 0) {
                throw new Error(`Cannot unload plugin ${pluginId}: ${dependents.join(', ')} depend on it`);
            }
            // Cleanup plugin
            if (plugin.instance && plugin.instance.destroy) {
                await this.safeExecute(() => plugin.instance.destroy(), pluginId);
            }
            // Remove plugin
            this.plugins.delete(pluginId);
            this.loadedPlugins.delete(pluginId);
            console.log(`✅ Plugin unloaded: ${plugin.name}`);
            return true;
        }
        catch (error) {
            console.error(`❌ Failed to unload plugin ${pluginId}:`, error);
            return false;
        }
    }
    // Enable plugin
    async enablePlugin(pluginId) {
        try {
            const plugin = this.plugins.get(pluginId);
            if (!plugin) {
                throw new Error(`Plugin ${pluginId} not found`);
            }
            if (plugin.enabled) {
                console.warn(`Plugin ${pluginId} already enabled`);
                return true;
            }
            // Check dependencies
            for (const dep of plugin.dependencies) {
                const depPlugin = this.plugins.get(dep);
                if (!depPlugin || !depPlugin.enabled) {
                    throw new Error(`Dependency ${dep} not available`);
                }
            }
            // Enable plugin
            plugin.enabled = true;
            // Initialize if not already done
            if (plugin.instance && plugin.instance.init && !this.loadedPlugins.has(pluginId)) {
                await this.safeExecute(() => plugin.instance.init(this.pluginAPI), pluginId);
                this.loadedPlugins.set(pluginId, plugin.instance);
            }
            console.log(`✅ Plugin enabled: ${plugin.name}`);
            return true;
        }
        catch (error) {
            console.error(`❌ Failed to enable plugin ${pluginId}:`, error);
            return false;
        }
    }
    // Disable plugin
    async disablePlugin(pluginId) {
        try {
            const plugin = this.plugins.get(pluginId);
            if (!plugin) {
                throw new Error(`Plugin ${pluginId} not found`);
            }
            if (!plugin.enabled) {
                console.warn(`Plugin ${pluginId} already disabled`);
                return true;
            }
            // Check dependents
            const dependents = this.getDependents(pluginId);
            if (dependents.length > 0) {
                throw new Error(`Cannot disable plugin ${pluginId}: ${dependents.join(', ')} depend on it`);
            }
            // Disable plugin
            plugin.enabled = false;
            console.log(`✅ Plugin disabled: ${plugin.name}`);
            return true;
        }
        catch (error) {
            console.error(`❌ Failed to disable plugin ${pluginId}:`, error);
            return false;
        }
    }
    // Get plugin
    getPlugin(pluginId) {
        return this.plugins.get(pluginId);
    }
    // Get all plugins
    getAllPlugins() {
        return Array.from(this.plugins.values());
    }
    // Get enabled plugins
    getEnabledPlugins() {
        return Array.from(this.plugins.values()).filter(plugin => plugin.enabled);
    }
    // Load built-in plugins
    async loadBuiltInPlugins() {
        const builtInPlugins = [
            {
                id: 'stitch-analyzer',
                name: 'Stitch Analyzer',
                version: '1.0.0',
                description: 'Analyzes stitch patterns and provides insights',
                author: 'System',
                main: 'builtin://stitch-analyzer',
                metadata: {
                    category: 'analysis',
                    tags: ['stitch', 'analysis', 'quality'],
                    minVersion: '1.0.0',
                    maxVersion: '2.0.0',
                    apiVersion: '1.0.0'
                }
            },
            {
                id: 'pattern-optimizer',
                name: 'Pattern Optimizer',
                version: '1.0.0',
                description: 'Optimizes patterns for better performance',
                author: 'System',
                main: 'builtin://pattern-optimizer',
                metadata: {
                    category: 'optimization',
                    tags: ['pattern', 'optimization', 'performance'],
                    minVersion: '1.0.0',
                    maxVersion: '2.0.0',
                    apiVersion: '1.0.0'
                }
            }
        ];
        for (const manifest of builtInPlugins) {
            await this.loadPlugin(manifest);
        }
    }
    // Load external plugins
    async loadExternalPlugins() {
        try {
            // In a real implementation, this would load plugins from a directory
            // or plugin registry
            console.log('📁 Loading external plugins...');
        }
        catch (error) {
            console.error('❌ Failed to load external plugins:', error);
        }
    }
    // Load plugin code
    async loadPluginCode(main) {
        if (main.startsWith('builtin://')) {
            return this.loadBuiltInPlugin(main);
        }
        // Load external plugin code
        // In a real implementation, this would fetch and execute plugin code
        throw new Error('External plugin loading not implemented');
    }
    // Load built-in plugin
    loadBuiltInPlugin(main) {
        const pluginId = main.replace('builtin://', '');
        switch (pluginId) {
            case 'stitch-analyzer':
                return {
                    init: (api) => {
                        console.log('🔍 Stitch Analyzer plugin initialized');
                    },
                    destroy: () => {
                        console.log('🔍 Stitch Analyzer plugin destroyed');
                    }
                };
            case 'pattern-optimizer':
                return {
                    init: (api) => {
                        console.log('⚡ Pattern Optimizer plugin initialized');
                    },
                    destroy: () => {
                        console.log('⚡ Pattern Optimizer plugin destroyed');
                    }
                };
            default:
                throw new Error(`Unknown built-in plugin: ${pluginId}`);
        }
    }
    // Get dependents
    getDependents(pluginId) {
        const dependents = [];
        for (const plugin of this.plugins.values()) {
            if (plugin.dependencies.includes(pluginId)) {
                dependents.push(plugin.id);
            }
        }
        return dependents;
    }
    // Safe execution with timeout
    async safeExecute(fn, pluginId) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Plugin ${pluginId} execution timeout`));
            }, this.config.pluginTimeout);
            try {
                const result = fn();
                if (result instanceof Promise) {
                    result
                        .then(resolve)
                        .catch(reject)
                        .finally(() => clearTimeout(timeout));
                }
                else {
                    clearTimeout(timeout);
                    resolve(result);
                }
            }
            catch (error) {
                clearTimeout(timeout);
                reject(error);
            }
        });
    }
    // Create plugin API
    createPluginAPI() {
        return {
            on: (event, handler) => {
                // Implementation would use event bus
                return 'subscription_id';
            },
            off: (subscriptionId) => {
                // Implementation would use event bus
                return true;
            },
            emit: (event, data) => {
                // Implementation would use event bus
                console.log(`Plugin emitted event: ${event}`, data);
            },
            addMenuItem: (menu, item) => {
                console.log(`Plugin added menu item to ${menu}:`, item);
            },
            removeMenuItem: (menu, itemId) => {
                console.log(`Plugin removed menu item ${itemId} from ${menu}`);
            },
            addToolbarButton: (button) => {
                console.log('Plugin added toolbar button:', button);
            },
            removeToolbarButton: (buttonId) => {
                console.log(`Plugin removed toolbar button: ${buttonId}`);
            },
            getCanvas: () => {
                // Implementation would return actual canvas
                return null;
            },
            addOverlay: (overlay) => {
                console.log('Plugin added overlay:', overlay);
            },
            removeOverlay: (overlayId) => {
                console.log(`Plugin removed overlay: ${overlayId}`);
            },
            getStitches: () => {
                // Implementation would return actual stitches
                return [];
            },
            setStitches: (stitches) => {
                console.log('Plugin set stitches:', stitches.length);
            },
            addStitch: (stitch) => {
                console.log('Plugin added stitch:', stitch);
            },
            removeStitch: (stitchId) => {
                console.log(`Plugin removed stitch: ${stitchId}`);
            },
            setStorage: (key, value) => {
                localStorage.setItem(`plugin_${key}`, JSON.stringify(value));
            },
            getStorage: (key) => {
                const value = localStorage.getItem(`plugin_${key}`);
                return value ? JSON.parse(value) : null;
            },
            removeStorage: (key) => {
                localStorage.removeItem(`plugin_${key}`);
            },
            log: (message, level = 'info') => {
                console[level](`[Plugin] ${message}`);
            },
            showNotification: (message, type = 'info') => {
                console.log(`[Plugin Notification] ${type.toUpperCase()}: ${message}`);
            }
        };
    }
    // Health check
    async healthCheck() {
        try {
            const health = {
                status: this.systemHealth,
                pluginsLoaded: this.plugins.size,
                pluginsEnabled: this.getEnabledPlugins().length,
                systemInitialized: this.isInitialized
            };
            return health;
        }
        catch (error) {
            console.error('❌ Plugin system health check failed:', error);
            throw error;
        }
    }
    // Cleanup
    destroy() {
        // Unload all plugins
        for (const pluginId of this.plugins.keys()) {
            this.unloadPlugin(pluginId);
        }
        this.plugins.clear();
        this.loadedPlugins.clear();
        this.isInitialized = false;
    }
}
// Singleton instance
export const pluginSystem = new PluginSystem();
