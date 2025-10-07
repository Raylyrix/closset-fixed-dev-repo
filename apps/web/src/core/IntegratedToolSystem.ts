// Integrated Tool System - The Ultimate Solution
// Unifies all tool types with advanced capabilities

import { UniversalToolSystem } from './ToolSystem';
import { AdvancedStitchSystem } from './AdvancedStitchSystem';
import { AIToolEnhancement } from './AIToolEnhancement';
import { PerformanceOptimizationManager } from './PerformanceOptimization';

export interface IntegratedToolConfig {
  id: string;
  name: string;
  version: string;
  
  // Tool capabilities
  toolTypes: string[];
  stitchTypes: string[];
  paintTypes: string[];
  printTypes: string[];
  
  // Performance settings
  performanceProfile: string;
  optimizationLevel: number;
  realTimeOptimization: boolean;
  
  // AI settings
  aiEnabled: boolean;
  learningEnabled: boolean;
  suggestionEnabled: boolean;
  
  // Quality settings
  quality: 'draft' | 'normal' | 'high' | 'ultra' | '4k';
  antiAliasing: boolean;
  superSampling: number;
  
  // User preferences
  userPreferences: UserPreferences;
  constraints: DesignConstraints;
}

// Local fallback type for queued render operations
type RenderJob = {
  id: string;
  pathId: string;
  priority: number;
};

export interface UnifiedTool {
  id: string;
  name: string;
  category: 'paint' | 'stitch' | 'print' | 'effect' | 'vector' | 'ai';
  subcategory: string;
  
  // Core properties
  enabled: boolean;
  visible: boolean;
  locked: boolean;
  
  // Rendering
  renderer: ToolRenderer;
  parameters: ToolParameter[];
  variations: ToolVariation[];
  
  // Performance
  performance: PerformanceProfile;
  optimization: OptimizationSettings;
  
  // AI capabilities
  aiCapable: boolean;
  learningEnabled: boolean;
  suggestionEnabled: boolean;
  
  // Integration
  compatibleTools: string[];
  conflictingTools: string[];
  dependencies: string[];
}

export interface ToolRenderer {
  id: string;
  name: string;
  version: string;
  
  // Rendering methods
  render(
    ctx: CanvasRenderingContext2D,
    path: UnifiedPath,
    config: UnifiedConfig,
    options: RenderOptions
  ): Promise<RenderResult>;
  
  renderPreview(
    ctx: CanvasRenderingContext2D,
    path: UnifiedPath,
    config: UnifiedConfig,
    quality: PreviewQuality
  ): void;
  
  renderThumbnail(
    ctx: CanvasRenderingContext2D,
    path: UnifiedPath,
    config: UnifiedConfig
  ): void;
  
  // Optimization
  canOptimize(path: UnifiedPath, config: UnifiedConfig): boolean;
  optimize(path: UnifiedPath, config: UnifiedConfig): UnifiedPath;
  
  // Validation
  validateConfig(config: UnifiedConfig): ValidationResult;
  validatePath(path: UnifiedPath): ValidationResult;
  
  // AI/ML
  suggestParameters(path: UnifiedPath, context: DesignContext): ParameterSuggestion[];
  learnFromUsage(usage: UsageData): void;
}

export interface UnifiedPath {
  id: string;
  points: UnifiedPoint[];
  closed: boolean;
  smooth: boolean;
  
  // Path properties
  length: number;
  complexity: number;
  boundingBox: BoundingBox;
  
  // Tool information
  tools: UnifiedTool[];
  renderOrder: number[];
  
  // Performance
  cached: boolean;
  optimized: boolean;
  renderTime: number;
  
  // Metadata
  created: Date;
  modified: Date;
  author: string;
  version: number;
}

export interface UnifiedPoint {
  x: number;
  y: number;
  z?: number; // 3D support
  
  // Point properties
  type: 'corner' | 'smooth' | 'symmetric' | 'auto';
  selected: boolean;
  locked: boolean;
  visible: boolean;
  
  // Control points
  controlIn?: { x: number; y: number; z?: number };
  controlOut?: { x: number; y: number; z?: number };
  
  // Tool-specific data
  toolData: Record<string, any>;
}

export interface UnifiedConfig {
  id: string;
  name: string;
  type: string;
  version: string;
  
  // Core properties
  enabled: boolean;
  visible: boolean;
  locked: boolean;
  
  // Rendering properties
  opacity: number;
  blendMode: GlobalCompositeOperation;
  quality: 'draft' | 'normal' | 'high' | 'ultra' | '4k';
  
  // Tool-specific properties
  properties: Record<string, any>;
  
  // Performance
  optimizationLevel: number;
  cacheEnabled: boolean;
  parallelRendering: boolean;
  
  // AI/ML
  aiEnabled: boolean;
  learningEnabled: boolean;
  suggestionEnabled: boolean;
}

export interface ToolParameter {
  id: string;
  name: string;
  type: 'number' | 'color' | 'boolean' | 'enum' | 'range' | 'text' | 'file';
  defaultValue: any;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  description: string;
  affects: string[];
  category: string;
  priority: number;
}

export interface ToolVariation {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  preview: string;
  useCases: string[];
  popularity: number;
  rating: number;
}

export interface PerformanceProfile {
  id: string;
  name: string;
  description: string;
  
  // Performance targets
  targets: PerformanceTarget[];
  
  // Optimization strategy
  strategy: OptimizationStrategy;
  priority: 'performance' | 'quality' | 'balanced' | 'battery';
  
  // Constraints
  constraints: PerformanceConstraints;
  
  // Status
  active: boolean;
  lastOptimized: Date;
  effectiveness: number;
}

export interface OptimizationSettings {
  level: number;
  realTime: boolean;
  adaptive: boolean;
  learning: boolean;
  parameters: Record<string, any>;
}

export interface DesignContext {
  fabricType: string;
  designStyle: string;
  complexity: number;
  userSkill: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  preferences: UserPreferences;
  constraints: DesignConstraints;
  
  // Real-time context
  currentDesign: DesignState;
  recentActions: Action[];
  designGoals: DesignGoal[];
}

export interface UserPreferences {
  preferredTools: string[];
  preferredStitchTypes: string[];
  preferredPaintTypes: string[];
  colorPalette: string[];
  complexityLevel: number;
  performanceMode: 'quality' | 'balanced' | 'speed';
  aiAssistance: boolean;
  learningEnabled: boolean;
}

export interface DesignConstraints {
  maxComplexity: number;
  maxRenderTime: number;
  maxMemoryUsage: number;
  supportedToolTypes: string[];
  qualityRequirements: QualityRequirements;
}

export interface QualityRequirements {
  minimumResolution: number;
  antiAliasing: boolean;
  colorAccuracy: number;
  detailLevel: number;
}

// Integrated Tool System Manager
export class IntegratedToolSystem {
  private static instance: IntegratedToolSystem;
  
  // Core systems
  private universalToolSystem!: UniversalToolSystem;
  private stitchSystem!: AdvancedStitchSystem;
  private aiEnhancement!: AIToolEnhancement;
  private performanceManager!: PerformanceOptimizationManager;
  
  // Unified tool registry
  private unifiedTools: Map<string, UnifiedTool> = new Map();
  private toolRenderers: Map<string, ToolRenderer> = new Map();
  
  // Configuration
  private config!: IntegratedToolConfig;
  
  // State management
  private currentDesign!: DesignState;
  private designHistory: DesignState[] = [];
  private undoStack: Action[] = [];
  private redoStack: Action[] = [];
  
  // Performance
  private performanceCache: Map<string, any> = new Map();
  private renderQueue: RenderJob[] = [];
  private isRendering: boolean = false;
  
  // Event system
  private eventListeners: Map<string, Function[]> = new Map();
  
  private constructor() {
    this.initializeCoreSystems();
    this.initializeUnifiedTools();
    this.initializeConfiguration();
    this.setupEventSystem();
  }
  
  public static getInstance(): IntegratedToolSystem {
    if (!IntegratedToolSystem.instance) {
      IntegratedToolSystem.instance = new IntegratedToolSystem();
    }
    return IntegratedToolSystem.instance;
  }
  
  // Tool Management
  public registerTool(tool: UnifiedTool): boolean {
    try {
      // Validate tool
      const validation = this.validateTool(tool);
      if (!validation.valid) {
        console.error('Invalid tool:', validation.errors);
        return false;
      }
      
      // Register tool
      this.unifiedTools.set(tool.id, tool);
      this.toolRenderers.set(tool.id, tool.renderer);
      
      // Register with core systems
      this.registerWithCoreSystems(tool);
      
      // Emit event
      this.emit('toolRegistered', { tool });
      
      console.log(`✅ Unified tool registered: ${tool.name}`);
      return true;
      
    } catch (error) {
      console.error('Error registering tool:', error);
      return false;
    }
  }
  
  public unregisterTool(toolId: string): boolean {
    try {
      const tool = this.unifiedTools.get(toolId);
      if (!tool) {
        console.error('Tool not found:', toolId);
        return false;
      }
      
      // Unregister from core systems
      this.unregisterFromCoreSystems(tool);
      
      // Remove from registries
      this.unifiedTools.delete(toolId);
      this.toolRenderers.delete(toolId);
      
      // Emit event
      this.emit('toolUnregistered', { toolId });
      
      console.log(`✅ Tool unregistered: ${toolId}`);
      return true;
      
    } catch (error) {
      console.error('Error unregistering tool:', error);
      return false;
    }
  }
  
  // Universal Rendering
  public async renderPath(
    ctx: CanvasRenderingContext2D,
    path: UnifiedPath,
    config: UnifiedConfig,
    options: RenderOptions = {}
  ): Promise<RenderResult> {
    try {
      // Validate inputs
      const validation = this.validateRenderInputs(path, config);
      if (!validation.valid) {
        return { success: false, error: validation.errors.join(', ') };
      }
      
      // Check cache
      const cacheKey = this.generateCacheKey(path, config, options);
      if (options.useCache && this.performanceCache.has(cacheKey)) {
        const cached = this.performanceCache.get(cacheKey);
        this.applyCachedRender(ctx, cached);
        return { success: true, cached: true };
      }
      
      // Sort tools by render order
      const sortedTools = this.sortToolsByRenderOrder(path.tools);
      
      // Render each tool
      const renderResults: RenderResult[] = [];
      for (const tool of sortedTools) {
        const renderer = this.toolRenderers.get(tool.id);
        if (!renderer) {
          console.warn(`Renderer not found for tool: ${tool.id}`);
          continue;
        }
        
        // Apply optimizations
        const optimizedPath = this.optimizePathForTool(path, tool, renderer);
        
        // Render tool
        const result = await renderer.render(ctx, optimizedPath, config, options);
        renderResults.push(result);
      }
      
      // Cache result
      if (options.useCache && renderResults.every(r => r.success)) {
        this.cacheRenderResult(cacheKey, renderResults);
      }
      
      return {
        success: true,
        results: renderResults,
        cached: false
      };
      
    } catch (error) {
      console.error('Error in universal rendering:', error);
      const msg = (error as any)?.message ?? String(error);
      return { success: false, error: msg };
    }
  }
  
  // Real-time Preview
  public createPreviewController(
    path: UnifiedPath,
    config: UnifiedConfig,
    quality: any = 'normal'
  ): PreviewController {
    return new PreviewController(path, config, this);
  }
  
  // AI-Powered Suggestions
  public async suggestTools(
    context: DesignContext,
    currentDesign: DesignState
  ): Promise<ToolSuggestion[]> {
    try {
      // Get AI suggestions
      const aiSuggestions = await this.aiEnhancement.suggestTools(context, currentDesign);
      
      // Convert to unified format
      const unifiedSuggestions = aiSuggestions.map(suggestion => ({
        id: suggestion.id,
        toolType: suggestion.toolType,
        confidence: suggestion.confidence,
        reasoning: suggestion.reasoning,
        preview: suggestion.preview,
        parameters: suggestion.parameters,
        alternatives: suggestion.alternatives
      }));
      
      return unifiedSuggestions;
      
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      return [];
    }
  }
  
  // Tool Composition
  public composeTools(toolIds: string[]): ComposedTool | null {
    try {
      // Get tools
      const tools = toolIds.map(id => this.unifiedTools.get(id)).filter(Boolean) as UnifiedTool[];
      
      if (tools.length === 0) {
        console.error('No valid tools found for composition');
        return null;
      }
      
      // Check for conflicts
      const conflicts = this.checkToolConflicts(tools);
      if (conflicts.length > 0) {
        console.error('Tool composition conflicts:', conflicts);
        return null;
      }
      
      // Create composed tool
      const composedTool: ComposedTool = {
        id: `composed_${Date.now()}`,
        name: `Composed Tool (${tools.length} tools)`,
        tools: tools,
        renderOrder: this.calculateOptimalRenderOrder(tools),
        properties: this.mergeToolProperties(tools)
      };
      
      return composedTool;
      
    } catch (error) {
      console.error('Error composing tools:', error);
      return null;
    }
  }
  
  // Performance Optimization
  public async optimizePerformance(
    design: DesignState,
    targets: PerformanceTargets
  ): Promise<PerformanceOptimization> {
    try {
      // Cast to any to tolerate differing manager interfaces
      return await (this.performanceManager as any).optimizePerformance(design, targets);
    } catch (error) {
      console.error('Error optimizing performance:', error);
      throw error;
    }
  }
  
  // Learning and Adaptation
  public async learnFromUsage(usage: UsageData): Promise<void> {
    try {
      // Learn from usage across all systems (relaxed signatures)
      if ((this.aiEnhancement as any)?.learnFromUsage) {
        await (this.aiEnhancement as any).learnFromUsage(usage);
      }
      if ((this.performanceManager as any)?.learnFromUsage) {
        (this.performanceManager as any).learnFromUsage(usage);
      }
      
      // Update tool preferences
      this.updateToolPreferences(usage);
      
    } catch (error) {
      console.error('Error learning from usage:', error);
    }
  }
  
  // Configuration Management
  public updateConfig(newConfig: Partial<IntegratedToolConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.applyConfiguration();
  }
  
  public getConfig(): IntegratedToolConfig {
    return { ...this.config };
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
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }
  
  // Initialize core systems
  private initializeCoreSystems(): void {
    this.universalToolSystem = UniversalToolSystem.getInstance();
    this.stitchSystem = AdvancedStitchSystem.getInstance();
    this.aiEnhancement = AIToolEnhancement.getInstance();
    this.performanceManager = PerformanceOptimizationManager.getInstance();
  }
  
  // Initialize unified tools
  private initializeUnifiedTools(): void {
    // Register built-in tools
    this.registerBuiltInTools();
  }
  
  // Initialize configuration
  private initializeConfiguration(): void {
    this.config = {
      id: 'default',
      name: 'Default Configuration',
      version: '1.0.0',
      toolTypes: ['paint', 'stitch', 'print', 'effect', 'vector', 'ai'],
      stitchTypes: ['cross-stitch', 'satin', 'chain', 'fill'],
      paintTypes: ['brush', 'airbrush', 'watercolor', 'oil'],
      printTypes: ['puff-print', 'vinyl', 'sublimation'],
      performanceProfile: 'balanced',
      optimizationLevel: 5,
      realTimeOptimization: true,
      aiEnabled: true,
      learningEnabled: true,
      suggestionEnabled: true,
      quality: 'high',
      antiAliasing: true,
      superSampling: 2,
      userPreferences: {
        preferredTools: [],
        preferredStitchTypes: [],
        preferredPaintTypes: [],
        colorPalette: [],
        complexityLevel: 5,
        performanceMode: 'balanced',
        aiAssistance: true,
        learningEnabled: true
      },
      constraints: {
        maxComplexity: 10,
        maxRenderTime: 1000,
        maxMemoryUsage: 1000,
        supportedToolTypes: ['paint', 'stitch', 'print', 'effect', 'vector', 'ai'],
        qualityRequirements: {
          minimumResolution: 1920,
          antiAliasing: true,
          colorAccuracy: 0.95,
          detailLevel: 0.8
        }
      }
    };
  }
  
  // Setup event system
  private setupEventSystem(): void {
    // Listen to core system events
    this.universalToolSystem.on('toolRegistered', (data: any) => {
      this.emit('toolRegistered', data);
    });
    
    if ((this.stitchSystem as any)?.on) {
      (this.stitchSystem as any).on('stitchRegistered', (data: any) => {
        this.emit('stitchRegistered', data);
      });
    }
    
    if ((this.aiEnhancement as any)?.on) {
      (this.aiEnhancement as any).on('suggestionGenerated', (data: any) => {
        this.emit('suggestionGenerated', data);
      });
    }
    
    if ((this.performanceManager as any)?.on) {
      (this.performanceManager as any).on('optimizationApplied', (data: any) => {
        this.emit('optimizationApplied', data);
      });
    }
  }
  
  // Register built-in tools
  private registerBuiltInTools(): void {
    // Register paint tools
    this.registerPaintTools();
    
    // Register stitch tools
    this.registerStitchTools();
    
    // Register print tools
    this.registerPrintTools();
    
    // Register effect tools
    this.registerEffectTools();
    
    // Register vector tools
    this.registerVectorTools();
    
    // Register AI tools
    this.registerAITools();
  }
  
  private registerPaintTools(): void {
    // Implement paint tool registration
  }
  
  private registerStitchTools(): void {
    // Implement stitch tool registration
  }
  
  private registerPrintTools(): void {
    // Implement print tool registration
  }
  
  private registerEffectTools(): void {
    // Implement effect tool registration
  }
  
  private registerVectorTools(): void {
    // Implement vector tool registration
  }
  
  private registerAITools(): void {
    // Implement AI tool registration
  }
  
  // Validation methods
  private validateTool(tool: UnifiedTool): ValidationResult {
    // Implement tool validation
    return { valid: true, errors: [], warnings: [], suggestions: [] };
  }
  
  private validateRenderInputs(path: UnifiedPath, config: UnifiedConfig): ValidationResult {
    // Implement render input validation
    return { valid: true, errors: [], warnings: [], suggestions: [] };
  }
  
  // Helper methods
  private registerWithCoreSystems(tool: UnifiedTool): void {
    // Register with appropriate core systems
  }
  
  private unregisterFromCoreSystems(tool: UnifiedTool): void {
    // Unregister from core systems
  }
  
  private sortToolsByRenderOrder(tools: UnifiedTool[]): UnifiedTool[] {
    // Fallback: preserve insertion order (no explicit render order on UnifiedTool)
    return [...tools];
  }
  
  private optimizePathForTool(path: UnifiedPath, tool: UnifiedTool, renderer: ToolRenderer, cfg?: UnifiedConfig): UnifiedPath {
    const config = (cfg || (tool as unknown as UnifiedConfig));
    if (!renderer.canOptimize(path, config)) {
      return path;
    }
    
    return renderer.optimize(path, config);
  }
  
  private generateCacheKey(path: UnifiedPath, config: UnifiedConfig, options: RenderOptions): string {
    // Implement cache key generation
    return '';
  }
  
  private applyCachedRender(ctx: CanvasRenderingContext2D, cached: any): void {
    // Implement cached render application
  }
  
  private cacheRenderResult(key: string, results: RenderResult[]): void {
    // Implement cache result storage
  }
  
  private checkToolConflicts(tools: UnifiedTool[]): string[] {
    // Implement tool conflict checking
    return [];
  }
  
  private calculateOptimalRenderOrder(tools: UnifiedTool[]): number[] {
    // Implement optimal render order calculation
    return [];
  }
  
  private mergeToolProperties(tools: UnifiedTool[]): Record<string, any> {
    // Implement tool property merging
    return {};
  }
  
  private updateToolPreferences(usage: UsageData): void {
    // Implement tool preference updates
  }
  
  private applyConfiguration(): void {
    // Apply current configuration
  }
}

// Supporting interfaces
export interface RenderOptions {
  useCache?: boolean;
  quality?: 'draft' | 'normal' | 'high' | 'ultra' | '4k';
  optimize?: boolean;
  realTime?: boolean;
  parallel?: boolean;
}

export interface RenderResult {
  success: boolean;
  renderTime?: number;
  cached?: boolean;
  error?: string;
  results?: RenderResult[];
}

export interface PreviewQuality {
  resolution: number;
  antiAliasing: boolean;
  superSampling: number;
  realTime: boolean;
}

export interface ToolSuggestion {
  id: string;
  toolType: string;
  confidence: number;
  reasoning: string;
  preview: string;
  parameters: Record<string, any>;
  alternatives: ToolSuggestion[];
}

export interface ComposedTool {
  id: string;
  name: string;
  tools: UnifiedTool[];
  renderOrder: number[];
  properties: Record<string, any>;
}

export interface PerformanceTargets {
  maxRenderTime: number;
  maxMemoryUsage: number;
  targetQuality: number;
  targetFPS: number;
}

export interface PerformanceOptimization {
  optimizations: Optimization[];
  expectedImprovement: number;
  implementation: string;
}

export interface Optimization {
  type: string;
  description: string;
  impact: number;
  implementation: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface ParameterSuggestion {
  parameter: string;
  value: any;
  confidence: number;
  reasoning: string;
}

export interface UsageData {
  timestamp: Date;
  action: string;
  performance: PerformanceMetrics;
  userSatisfaction: number;
}

export interface DesignState {
  id: string;
  name: string;
  elements: DesignElement[];
  tools: ToolUsage[];
  parameters: Record<string, any>;
  quality: number;
  complexity: number;
  progress: number;
}

export interface DesignElement {
  id: string;
  type: string;
  properties: Record<string, any>;
  position: Position;
  size: Size;
  rotation: number;
  opacity: number;
  visible: boolean;
}

export interface ToolUsage {
  toolId: string;
  usageCount: number;
  lastUsed: Date;
  effectiveness: number;
  userSatisfaction: number;
}

export interface Action {
  id: string;
  type: string;
  timestamp: Date;
  parameters: Record<string, any>;
  result: ActionResult;
  userSatisfaction: number;
}

export interface ActionResult {
  success: boolean;
  quality: number;
  performance: PerformanceMetrics;
  userFeedback: UserFeedback;
}

export interface UserFeedback {
  designId: string;
  rating: number;
  comments: string;
  suggestions: string[];
  timestamp: Date;
}

export interface DesignGoal {
  id: string;
  description: string;
  priority: number;
  deadline?: Date;
  requirements: Requirement[];
  progress: number;
}

export interface Requirement {
  type: 'technical' | 'aesthetic' | 'performance' | 'constraint';
  description: string;
  weight: number;
  satisfied: boolean;
}

export interface Position {
  x: number;
  y: number;
  z?: number;
}

export interface Size {
  width: number;
  height: number;
  depth?: number;
}

export interface BoundingBox {
  min: Position;
  max: Position;
  width: number;
  height: number;
  depth?: number;
}

export interface PerformanceMetrics {
  renderTime: number;
  frameRate: number;
  memoryUsage: number;
  cpuUsage: number;
  gpuUsage: number;
}

export interface PerformanceTarget {
  id: string;
  name: string;
  category: string;
  target: number;
  threshold: number;
  current: number;
  trend: 'improving' | 'stable' | 'degrading';
}

export interface OptimizationStrategy {
  type: 'aggressive' | 'conservative' | 'adaptive' | 'custom';
  parameters: Record<string, any>;
  rules: OptimizationRule[];
  learningEnabled: boolean;
  adaptationRate: number;
  historyWeight: number;
}

export interface OptimizationRule {
  id: string;
  condition: string;
  action: string;
  priority: number;
  enabled: boolean;
}

export interface PerformanceConstraints {
  maxMemoryUsage: number;
  maxCpuUsage: number;
  maxGpuUsage: number;
  minFrameRate: number;
  maxLatency: number;
  minQuality: number;
  maxCompression: number;
  minResolution: number;
  maxPowerUsage: number;
  batteryOptimization: boolean;
}

// Preview Controller
export class PreviewController {
  private path: UnifiedPath;
  private config: UnifiedConfig;
  private system: IntegratedToolSystem;
  private isActive: boolean = false;
  private previewCanvas: HTMLCanvasElement;
  private animationFrame: number | null = null;
  
  constructor(
    path: UnifiedPath,
    config: UnifiedConfig,
    system: IntegratedToolSystem
  ) {
    this.path = path;
    this.config = config;
    this.system = system;
    this.previewCanvas = document.createElement('canvas');
  }
  
  public start(): void {
    this.isActive = true;
    this.renderLoop();
  }
  
  public stop(): void {
    this.isActive = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
  
  public updatePath(newPath: UnifiedPath): void {
    this.path = newPath;
  }
  
  public updateConfig(newConfig: UnifiedConfig): void {
    this.config = newConfig;
  }
  
  private renderLoop(): void {
    if (!this.isActive) return;
    
    // Render preview
    const ctx = this.previewCanvas.getContext('2d')!;
    this.system.renderPath(ctx, this.path, this.config, { realTime: true });
    
    // Continue loop
    this.animationFrame = requestAnimationFrame(() => this.renderLoop());
  }
}

