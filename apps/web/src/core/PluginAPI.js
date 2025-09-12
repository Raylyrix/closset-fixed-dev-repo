// Plugin API System
// Internal plugin system for extending functionality without touching core code
// Plugin Manager
export class PluginManager {
    constructor() {
        this.plugins = new Map();
        this.activePlugins = new Set();
        this.pluginHooks = new Map();
        // Event system
        this.eventListeners = new Map();
        this.initializeBuiltInPlugins();
    }
    static getInstance() {
        if (!PluginManager.instance) {
            PluginManager.instance = new PluginManager();
        }
        return PluginManager.instance;
    }
    // Plugin Management
    async installPlugin(plugin) {
        try {
            // Validate plugin
            const validation = this.validatePlugin(plugin);
            if (!validation.valid) {
                console.error('Invalid plugin:', validation.errors);
                return false;
            }
            // Check for conflicts
            const conflicts = this.checkPluginConflicts(plugin);
            if (conflicts.length > 0) {
                console.error('Plugin conflicts:', conflicts);
                return false;
            }
            // Install plugin
            this.plugins.set(plugin.id, plugin);
            // Run installation hook
            if (plugin.onInstall) {
                await plugin.onInstall();
            }
            // Emit event
            this.emit('pluginInstalled', { plugin });
            return true;
        }
        catch (error) {
            console.error('Error installing plugin:', error);
            return false;
        }
    }
    async uninstallPlugin(pluginId) {
        try {
            const plugin = this.plugins.get(pluginId);
            if (!plugin) {
                console.error('Plugin not found:', pluginId);
                return false;
            }
            // Disable plugin if active
            if (this.activePlugins.has(pluginId)) {
                await this.disablePlugin(pluginId);
            }
            // Run uninstallation hook
            if (plugin.onUninstall) {
                await plugin.onUninstall();
            }
            // Remove plugin
            this.plugins.delete(pluginId);
            // Emit event
            this.emit('pluginUninstalled', { pluginId });
            return true;
        }
        catch (error) {
            console.error('Error uninstalling plugin:', error);
            return false;
        }
    }
    async enablePlugin(pluginId) {
        try {
            const plugin = this.plugins.get(pluginId);
            if (!plugin) {
                console.error('Plugin not found:', pluginId);
                return false;
            }
            // Check dependencies
            const missingDeps = this.checkDependencies(plugin);
            if (missingDeps.length > 0) {
                console.error('Missing dependencies:', missingDeps);
                return false;
            }
            // Enable plugin
            this.activePlugins.add(pluginId);
            // Run enable hook
            if (plugin.onEnable) {
                await plugin.onEnable();
            }
            // Emit event
            this.emit('pluginEnabled', { plugin });
            return true;
        }
        catch (error) {
            console.error('Error enabling plugin:', error);
            return false;
        }
    }
    async disablePlugin(pluginId) {
        try {
            const plugin = this.plugins.get(pluginId);
            if (!plugin) {
                console.error('Plugin not found:', pluginId);
                return false;
            }
            // Disable plugin
            this.activePlugins.delete(pluginId);
            // Run disable hook
            if (plugin.onDisable) {
                await plugin.onDisable();
            }
            // Emit event
            this.emit('pluginDisabled', { plugin });
            return true;
        }
        catch (error) {
            console.error('Error disabling plugin:', error);
            return false;
        }
    }
    // Plugin Execution
    async executePlugin(pluginId, method, ...args) {
        try {
            const plugin = this.plugins.get(pluginId);
            if (!plugin) {
                throw new Error(`Plugin not found: ${pluginId}`);
            }
            if (!this.activePlugins.has(pluginId)) {
                throw new Error(`Plugin not enabled: ${pluginId}`);
            }
            // Execute plugin method
            const result = await this.executePluginMethod(plugin, method, args);
            return result;
        }
        catch (error) {
            console.error(`Error executing plugin ${pluginId}.${method}:`, error);
            throw error;
        }
    }
    // Plugin Hooks
    registerHook(event, pluginId, callback) {
        if (!this.pluginHooks.has(event)) {
            this.pluginHooks.set(event, []);
        }
        this.pluginHooks.get(event).push({
            pluginId,
            callback
        });
    }
    unregisterHook(event, pluginId) {
        const hooks = this.pluginHooks.get(event);
        if (hooks) {
            const index = hooks.findIndex(hook => hook.pluginId === pluginId);
            if (index !== -1) {
                hooks.splice(index, 1);
            }
        }
    }
    async triggerHook(event, ...args) {
        const hooks = this.pluginHooks.get(event) || [];
        const results = [];
        for (const hook of hooks) {
            try {
                if (this.activePlugins.has(hook.pluginId)) {
                    const result = await hook.callback(...args);
                    results.push(result);
                }
            }
            catch (error) {
                console.error(`Error in plugin hook ${hook.pluginId}:`, error);
            }
        }
        return results;
    }
    // Plugin Discovery
    getPlugins(category) {
        const plugins = Array.from(this.plugins.values());
        if (category) {
            return plugins.filter(plugin => plugin.category === category);
        }
        return plugins;
    }
    getActivePlugins() {
        return Array.from(this.activePlugins)
            .map(id => this.plugins.get(id))
            .filter(Boolean);
    }
    getPlugin(pluginId) {
        return this.plugins.get(pluginId) || null;
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
                console.error(`Error in plugin event listener for ${event}:`, error);
            }
        });
    }
    // Helper methods
    initializeBuiltInPlugins() {
        // Initialize built-in plugins
        this.installBuiltInPlugins();
    }
    async installBuiltInPlugins() {
        // Install built-in plugins
        const builtInPlugins = [
            this.createBrushPlugin(),
            this.createEraserPlugin(),
            this.createFillPlugin(),
            this.createTextPlugin(),
            this.createVectorPlugin(),
            this.createStitchPlugin(),
            this.createPrintPlugin()
        ];
        for (const plugin of builtInPlugins) {
            await this.installPlugin(plugin);
            await this.enablePlugin(plugin.id);
        }
    }
    createBrushPlugin() {
        return {
            id: 'builtin_brush',
            name: 'Brush Tool',
            version: '1.0.0',
            description: 'Built-in brush tool for painting',
            author: 'System',
            category: 'tool',
            dependencies: [],
            conflicts: [],
            capabilities: [
                {
                    id: 'painting',
                    name: 'Painting',
                    type: 'tool',
                    description: 'Paint on canvas with various brush styles',
                    parameters: [
                        {
                            id: 'size',
                            name: 'Brush Size',
                            type: 'range',
                            defaultValue: 10,
                            min: 1,
                            max: 100,
                            step: 1,
                            description: 'Size of the brush'
                        },
                        {
                            id: 'opacity',
                            name: 'Opacity',
                            type: 'range',
                            defaultValue: 1,
                            min: 0,
                            max: 1,
                            step: 0.01,
                            description: 'Opacity of the brush'
                        }
                    ],
                    enabled: true
                }
            ],
            tool: {
                name: 'Brush',
                icon: 'brush',
                category: 'painting',
                onActivate: () => {
                    console.log('Brush tool activated');
                },
                onDeactivate: () => {
                    console.log('Brush tool deactivated');
                },
                getSettings: () => ({}),
                updateSettings: (settings) => {
                    console.log('Brush settings updated:', settings);
                }
            }
        };
    }
    createEraserPlugin() {
        return {
            id: 'builtin_eraser',
            name: 'Eraser Tool',
            version: '1.0.0',
            description: 'Built-in eraser tool',
            author: 'System',
            category: 'tool',
            dependencies: [],
            conflicts: [],
            capabilities: [],
            tool: {
                name: 'Eraser',
                icon: 'eraser',
                category: 'editing',
                getSettings: () => ({}),
                updateSettings: (settings) => { }
            }
        };
    }
    createFillPlugin() {
        return {
            id: 'builtin_fill',
            name: 'Fill Tool',
            version: '1.0.0',
            description: 'Built-in fill tool',
            author: 'System',
            category: 'tool',
            dependencies: [],
            conflicts: [],
            capabilities: [],
            tool: {
                name: 'Fill',
                icon: 'fill',
                category: 'editing',
                getSettings: () => ({}),
                updateSettings: (settings) => { }
            }
        };
    }
    createTextPlugin() {
        return {
            id: 'builtin_text',
            name: 'Text Tool',
            version: '1.0.0',
            description: 'Built-in text tool',
            author: 'System',
            category: 'tool',
            dependencies: [],
            conflicts: [],
            capabilities: [],
            tool: {
                name: 'Text',
                icon: 'text',
                category: 'text',
                getSettings: () => ({}),
                updateSettings: (settings) => { }
            }
        };
    }
    createVectorPlugin() {
        return {
            id: 'builtin_vector',
            name: 'Vector Tools',
            version: '1.0.0',
            description: 'Built-in vector tools',
            author: 'System',
            category: 'tool',
            dependencies: [],
            conflicts: [],
            capabilities: [],
            tool: {
                name: 'Vector',
                icon: 'vector',
                category: 'vector',
                getSettings: () => ({}),
                updateSettings: (settings) => { }
            }
        };
    }
    createStitchPlugin() {
        return {
            id: 'builtin_stitch',
            name: 'Stitch Tools',
            version: '1.0.0',
            description: 'Built-in stitch tools',
            author: 'System',
            category: 'stitch',
            dependencies: [],
            conflicts: [],
            capabilities: [],
            stitch: {
                name: 'Stitch',
                type: 'basic',
                category: 'embroidery',
                render: async (ctx, path, config) => {
                    // Basic stitch rendering
                },
                calculateStitches: (path, config) => {
                    return [];
                },
                getSettings: () => ({}),
                updateSettings: (settings) => { }
            }
        };
    }
    createPrintPlugin() {
        return {
            id: 'builtin_print',
            name: 'Print Tools',
            version: '1.0.0',
            description: 'Built-in print tools',
            author: 'System',
            category: 'print',
            dependencies: [],
            conflicts: [],
            capabilities: [],
            print: {
                name: 'Print',
                type: 'basic',
                category: 'printing',
                render: async (ctx, data, config) => {
                    // Basic print rendering
                },
                preview: (ctx, data, config) => {
                    // Basic print preview
                },
                getSettings: () => ({}),
                updateSettings: (settings) => { }
            }
        };
    }
    validatePlugin(plugin) {
        const errors = [];
        if (!plugin.id)
            errors.push('Plugin ID is required');
        if (!plugin.name)
            errors.push('Plugin name is required');
        if (!plugin.version)
            errors.push('Plugin version is required');
        if (!plugin.author)
            errors.push('Plugin author is required');
        if (!plugin.category)
            errors.push('Plugin category is required');
        return {
            valid: errors.length === 0,
            errors,
            warnings: []
        };
    }
    checkPluginConflicts(plugin) {
        const conflicts = [];
        for (const conflict of plugin.conflicts) {
            if (this.activePlugins.has(conflict)) {
                conflicts.push(conflict);
            }
        }
        return conflicts;
    }
    checkDependencies(plugin) {
        const missing = [];
        for (const dep of plugin.dependencies) {
            if (!this.plugins.has(dep) || !this.activePlugins.has(dep)) {
                missing.push(dep);
            }
        }
        return missing;
    }
    async executePluginMethod(plugin, method, args) {
        // Execute plugin method based on type
        if (plugin.tool && method in plugin.tool) {
            return plugin.tool[method](...args);
        }
        if (plugin.effect && method in plugin.effect) {
            return plugin.effect[method](...args);
        }
        if (plugin.stitch && method in plugin.stitch) {
            return plugin.stitch[method](...args);
        }
        if (plugin.print && method in plugin.print) {
            return plugin.print[method](...args);
        }
        if (plugin.utility && method in plugin.utility) {
            return plugin.utility[method](...args);
        }
        throw new Error(`Method ${method} not found in plugin ${plugin.id}`);
    }
}
// Export plugin manager instance
export const pluginManager = PluginManager.getInstance();
