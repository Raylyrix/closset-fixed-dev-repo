// Plugin API System
// Internal plugin system for extending functionality without touching core code

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  
  // Plugin metadata
  author: string;
  category: 'tool' | 'effect' | 'stitch' | 'print' | 'utility' | 'custom';
  dependencies: string[];
  conflicts: string[];
  
  // Plugin capabilities
  capabilities: PluginCapability[];
  
  // Plugin lifecycle
  onInstall?: () => Promise<void>;
  onUninstall?: () => Promise<void>;
  onEnable?: () => Promise<void>;
  onDisable?: () => Promise<void>;
  onUpdate?: (oldVersion: string, newVersion: string) => Promise<void>;
  
  // Plugin functionality
  renderer?: PluginRenderer;
  tool?: PluginTool;
  effect?: PluginEffect;
  stitch?: PluginStitch;
  print?: PluginPrint;
  utility?: PluginUtility;
}

export interface PluginCapability {
  id: string;
  name: string;
  type: 'rendering' | 'tool' | 'effect' | 'stitch' | 'print' | 'utility';
  description: string;
  parameters: PluginParameter[];
  enabled: boolean;
}

export interface PluginParameter {
  id: string;
  name: string;
  type: 'number' | 'string' | 'boolean' | 'color' | 'enum' | 'range';
  defaultValue: any;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  description: string;
}

export interface PluginRenderer {
  // Rendering methods
  render(
    ctx: CanvasRenderingContext2D,
    data: any,
    config: PluginConfig
  ): Promise<RenderResult>;
  
  renderPreview(
    ctx: CanvasRenderingContext2D,
    data: any,
    config: PluginConfig
  ): void;
  
  // Optimization
  canOptimize(data: any, config: PluginConfig): boolean;
  optimize(data: any, config: PluginConfig): any;
  
  // Validation
  validateConfig(config: PluginConfig): ValidationResult;
  validateData(data: any): ValidationResult;
}

export interface PluginTool {
  // Tool properties
  name: string;
  icon: string;
  category: string;
  
  // Tool methods
  onActivate?(): void;
  onDeactivate?(): void;
  onMouseDown?(event: MouseEvent): void;
  onMouseMove?(event: MouseEvent): void;
  onMouseUp?(event: MouseEvent): void;
  onKeyDown?(event: KeyboardEvent): void;
  onKeyUp?(event: KeyboardEvent): void;
  
  // Tool settings
  getSettings(): PluginSettings;
  updateSettings(settings: PluginSettings): void;
}

export interface PluginEffect {
  // Effect properties
  name: string;
  category: string;
  
  // Effect methods
  apply(
    canvas: HTMLCanvasElement,
    config: PluginConfig
  ): Promise<HTMLCanvasElement>;
  
  preview(
    canvas: HTMLCanvasElement,
    config: PluginConfig
  ): Promise<HTMLCanvasElement>;
  
  // Effect settings
  getSettings(): PluginSettings;
  updateSettings(settings: PluginSettings): void;
}

export interface PluginStitch {
  // Stitch properties
  name: string;
  type: string;
  category: string;
  
  // Stitch methods
  render(
    ctx: CanvasRenderingContext2D,
    path: StitchPath,
    config: StitchConfig
  ): Promise<void>;
  
  calculateStitches(
    path: StitchPath,
    config: StitchConfig
  ): StitchPoint[];
  
  // Stitch settings
  getSettings(): StitchSettings;
  updateSettings(settings: StitchSettings): void;
}

export interface PluginPrint {
  // Print properties
  name: string;
  type: string;
  category: string;
  
  // Print methods
  render(
    ctx: CanvasRenderingContext2D,
    data: PrintData,
    config: PrintConfig
  ): Promise<void>;
  
  preview(
    ctx: CanvasRenderingContext2D,
    data: PrintData,
    config: PrintConfig
  ): void;
  
  // Print settings
  getSettings(): PrintSettings;
  updateSettings(settings: PrintSettings): void;
}

export interface PluginUtility {
  // Utility methods
  process(data: any, config: PluginConfig): Promise<any>;
  validate(data: any): ValidationResult;
  optimize(data: any): any;
  
  // Utility settings
  getSettings(): PluginSettings;
  updateSettings(settings: PluginSettings): void;
}

export interface PluginConfig {
  id: string;
  name: string;
  parameters: Record<string, any>;
  enabled: boolean;
  visible: boolean;
  priority: number;
}

export interface PluginSettings {
  [key: string]: any;
}

export interface StitchPath {
  id: string;
  points: StitchPoint[];
  closed: boolean;
  smooth: boolean;
}

export interface StitchPoint {
  x: number;
  y: number;
  type: 'corner' | 'smooth' | 'symmetric';
  controlIn?: { x: number; y: number };
  controlOut?: { x: number; y: number };
}

export interface StitchConfig {
  type: string;
  color: string;
  thickness: number;
  opacity: number;
  density: number;
  tension: number;
}

export interface StitchSettings {
  [key: string]: any;
}

export interface PrintData {
  id: string;
  type: string;
  data: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  opacity: number;
}

export interface PrintConfig {
  type: string;
  quality: string;
  resolution: number;
  colorSpace: string;
  compression: number;
}

export interface PrintSettings {
  [key: string]: any;
}

export interface RenderResult {
  success: boolean;
  data?: any;
  error?: string;
  renderTime?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Plugin Manager
export class PluginManager {
  private static instance: PluginManager;
  private plugins: Map<string, Plugin> = new Map();
  private activePlugins: Set<string> = new Set();
  private pluginHooks: Map<string, PluginHook[]> = new Map();
  
  // Event system
  private eventListeners: Map<string, Function[]> = new Map();
  
  private constructor() {
    this.initializeBuiltInPlugins();
  }
  
  public static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }
  
  // Plugin Management
  public async installPlugin(plugin: Plugin): Promise<boolean> {
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
      
    } catch (error) {
      console.error('Error installing plugin:', error);
      return false;
    }
  }
  
  public async uninstallPlugin(pluginId: string): Promise<boolean> {
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
      
    } catch (error) {
      console.error('Error uninstalling plugin:', error);
      return false;
    }
  }
  
  public async enablePlugin(pluginId: string): Promise<boolean> {
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
      
    } catch (error) {
      console.error('Error enabling plugin:', error);
      return false;
    }
  }
  
  public async disablePlugin(pluginId: string): Promise<boolean> {
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
      
    } catch (error) {
      console.error('Error disabling plugin:', error);
      return false;
    }
  }
  
  // Plugin Execution
  public async executePlugin(
    pluginId: string,
    method: string,
    ...args: any[]
  ): Promise<any> {
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
      
    } catch (error) {
      console.error(`Error executing plugin ${pluginId}.${method}:`, error);
      throw error;
    }
  }
  
  // Plugin Hooks
  public registerHook(event: string, pluginId: string, callback: Function): void {
    if (!this.pluginHooks.has(event)) {
      this.pluginHooks.set(event, []);
    }
    
    this.pluginHooks.get(event)!.push({
      pluginId,
      callback
    });
  }
  
  public unregisterHook(event: string, pluginId: string): void {
    const hooks = this.pluginHooks.get(event);
    if (hooks) {
      const index = hooks.findIndex(hook => hook.pluginId === pluginId);
      if (index !== -1) {
        hooks.splice(index, 1);
      }
    }
  }
  
  public async triggerHook(event: string, ...args: any[]): Promise<any[]> {
    const hooks = this.pluginHooks.get(event) || [];
    const results: any[] = [];
    
    for (const hook of hooks) {
      try {
        if (this.activePlugins.has(hook.pluginId)) {
          const result = await hook.callback(...args);
          results.push(result);
        }
      } catch (error) {
        console.error(`Error in plugin hook ${hook.pluginId}:`, error);
      }
    }
    
    return results;
  }
  
  // Plugin Discovery
  public getPlugins(category?: string): Plugin[] {
    const plugins = Array.from(this.plugins.values());
    
    if (category) {
      return plugins.filter(plugin => plugin.category === category);
    }
    
    return plugins;
  }
  
  public getActivePlugins(): Plugin[] {
    return Array.from(this.activePlugins)
      .map(id => this.plugins.get(id))
      .filter(Boolean) as Plugin[];
  }
  
  public getPlugin(pluginId: string): Plugin | null {
    return this.plugins.get(pluginId) || null;
  }
  
  // Event System
  public on(event: string, listener: Function): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
    
    return () => {
      const listeners = this.eventListeners.get(event) || [];
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }
  
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in plugin event listener for ${event}:`, error);
      }
    });
  }
  
  // Helper methods
  private initializeBuiltInPlugins(): void {
    // Initialize built-in plugins
    this.installBuiltInPlugins();
  }
  
  private async installBuiltInPlugins(): Promise<void> {
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
  
  private createBrushPlugin(): Plugin {
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
  
  private createEraserPlugin(): Plugin {
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
        updateSettings: (settings) => {}
      }
    };
  }
  
  private createFillPlugin(): Plugin {
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
        updateSettings: (settings) => {}
      }
    };
  }
  
  private createTextPlugin(): Plugin {
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
        updateSettings: (settings) => {}
      }
    };
  }
  
  private createVectorPlugin(): Plugin {
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
        updateSettings: (settings) => {}
      }
    };
  }
  
  private createStitchPlugin(): Plugin {
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
        updateSettings: (settings) => {}
      }
    };
  }
  
  private createPrintPlugin(): Plugin {
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
        updateSettings: (settings) => {}
      }
    };
  }
  
  private validatePlugin(plugin: Plugin): ValidationResult {
    const errors: string[] = [];
    
    if (!plugin.id) errors.push('Plugin ID is required');
    if (!plugin.name) errors.push('Plugin name is required');
    if (!plugin.version) errors.push('Plugin version is required');
    if (!plugin.author) errors.push('Plugin author is required');
    if (!plugin.category) errors.push('Plugin category is required');
    
    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  }
  
  private checkPluginConflicts(plugin: Plugin): string[] {
    const conflicts: string[] = [];
    
    for (const conflict of plugin.conflicts) {
      if (this.activePlugins.has(conflict)) {
        conflicts.push(conflict);
      }
    }
    
    return conflicts;
  }
  
  private checkDependencies(plugin: Plugin): string[] {
    const missing: string[] = [];
    
    for (const dep of plugin.dependencies) {
      if (!this.plugins.has(dep) || !this.activePlugins.has(dep)) {
        missing.push(dep);
      }
    }
    
    return missing;
  }
  
  private async executePluginMethod(
    plugin: Plugin,
    method: string,
    args: any[]
  ): Promise<any> {
    // Execute plugin method based on type
    if (plugin.tool && method in plugin.tool) {
      return (plugin.tool as any)[method](...args);
    }
    
    if (plugin.effect && method in plugin.effect) {
      return (plugin.effect as any)[method](...args);
    }
    
    if (plugin.stitch && method in plugin.stitch) {
      return (plugin.stitch as any)[method](...args);
    }
    
    if (plugin.print && method in plugin.print) {
      return (plugin.print as any)[method](...args);
    }
    
    if (plugin.utility && method in plugin.utility) {
      return (plugin.utility as any)[method](...args);
    }
    
    throw new Error(`Method ${method} not found in plugin ${plugin.id}`);
  }
}

// Supporting interfaces
export interface PluginHook {
  pluginId: string;
  callback: Function;
}

// Export plugin manager instance
export const pluginManager = PluginManager.getInstance();

