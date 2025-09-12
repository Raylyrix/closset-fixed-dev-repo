/**
 * 🎯 Comprehensive Vector System
 * 
 * Master system that integrates all vector tools and fixes all issues:
 * - Click and drag functionality
 * - Precise anchor points
 * - Universal media compatibility
 * - Professional tool set
 * - Seamless embroidery integration
 */

import { AdvancedVectorTools } from './AdvancedVectorTools';
import { UniversalMediaIntegration } from './UniversalMediaIntegration';
import { VectorEmbroideryIntegration } from './VectorEmbroideryIntegration';
import { ProfessionalToolSet } from './ProfessionalToolSet';
import { VectorState, VectorPath, VectorPoint } from './VectorStateManager';

export interface SystemState {
  isActive: boolean;
  currentMode: 'vector' | 'embroidery' | 'mixed';
  currentTool: string;
  currentMediaType: string;
  precision: number;
  snapEnabled: boolean;
  gridEnabled: boolean;
  guidesEnabled: boolean;
  selection: {
    selectedPaths: string[];
    selectedPoints: string[];
  };
  dragState: {
    isDragging: boolean;
    startPoint: VectorPoint | null;
    currentPoint: VectorPoint | null;
    dragType: string | null;
    targetId: string | null;
  };
}

export interface SystemConfig {
  enableClickAndDrag: boolean;
  enablePreciseAnchors: boolean;
  enableUniversalMedia: boolean;
  enableRealTimePreview: boolean;
  enableUndoRedo: boolean;
  enableProfessionalTools: boolean;
  precision: number;
  snapTolerance: number;
  gridSize: number;
  showGrid: boolean;
  showGuides: boolean;
  showRulers: boolean;
  performanceMode: 'high' | 'balanced' | 'quality';
}

export class ComprehensiveVectorSystem {
  private static instance: ComprehensiveVectorSystem;
  
  private state: SystemState;
  private config: SystemConfig;
  
  // Core systems
  private vectorTools: AdvancedVectorTools;
  private mediaIntegration: UniversalMediaIntegration;
  private embroideryIntegration: VectorEmbroideryIntegration;
  private toolSet: ProfessionalToolSet;
  
  // Event system
  private eventListeners: Map<string, Function[]> = new Map();
  
  // Performance optimization
  private lastUpdateTime: number = 0;
  private updateThrottle: number = 16; // 60fps
  private renderQueue: any[] = [];
  private isRendering: boolean = false;
  
  constructor() {
    this.initializeState();
    this.initializeConfig();
    this.initializeSystems();
    this.setupEventHandlers();
    this.startRenderLoop();
  }
  
  static getInstance(): ComprehensiveVectorSystem {
    if (!ComprehensiveVectorSystem.instance) {
      ComprehensiveVectorSystem.instance = new ComprehensiveVectorSystem();
    }
    return ComprehensiveVectorSystem.instance;
  }
  
  private initializeState(): void {
    this.state = {
      isActive: false,
      currentMode: 'vector',
      currentTool: 'pen',
      currentMediaType: 'digital_print',
      precision: 0.1,
      snapEnabled: true,
      gridEnabled: true,
      guidesEnabled: true,
      selection: {
        selectedPaths: [],
        selectedPoints: []
      },
      dragState: {
        isDragging: false,
        startPoint: null,
        currentPoint: null,
        dragType: null,
        targetId: null
      }
    };
  }
  
  private initializeConfig(): void {
    this.config = {
      enableClickAndDrag: true,
      enablePreciseAnchors: true,
      enableUniversalMedia: true,
      enableRealTimePreview: true,
      enableUndoRedo: true,
      enableProfessionalTools: true,
      precision: 0.1,
      snapTolerance: 5,
      gridSize: 20,
      showGrid: true,
      showGuides: true,
      showRulers: true,
      performanceMode: 'balanced'
    };
  }
  
  private initializeSystems(): void {
    this.vectorTools = AdvancedVectorTools.getInstance();
    this.mediaIntegration = UniversalMediaIntegration.getInstance();
    this.embroideryIntegration = VectorEmbroideryIntegration.getInstance();
    this.toolSet = ProfessionalToolSet.getInstance();
  }
  
  private setupEventHandlers(): void {
    // Vector tools events
    this.vectorTools.on('tool:changed', (data) => {
      this.state.currentTool = data.tool;
      this.emit('tool:changed', data);
    });
    
    // Media integration events
    this.mediaIntegration.on('mediaType:changed', (data) => {
      this.state.currentMediaType = data.mediaType.id;
      this.emit('mediaType:changed', data);
    });
    
    // Embroidery integration events
    this.embroideryIntegration.on('mode:changed', (data) => {
      this.state.currentMode = data.mode as 'vector' | 'embroidery' | 'mixed';
      this.emit('mode:changed', data);
    });
  }
  
  private startRenderLoop(): void {
    const render = () => {
      if (this.isRendering) {
        requestAnimationFrame(render);
        return;
      }
      
      this.isRendering = true;
      
      try {
        this.processRenderQueue();
      } catch (error) {
        console.error('Error in render loop:', error);
      } finally {
        this.isRendering = false;
        requestAnimationFrame(render);
      }
    };
    
    requestAnimationFrame(render);
  }
  
  private processRenderQueue(): void {
    if (this.renderQueue.length === 0) {
      return;
    }
    
    const now = performance.now();
    if (now - this.lastUpdateTime < this.updateThrottle) {
      return;
    }
    
    const renderTasks = this.renderQueue.splice(0, 10); // Process up to 10 tasks per frame
    
    for (const task of renderTasks) {
      try {
        this.executeRenderTask(task);
      } catch (error) {
        console.error('Error executing render task:', error);
      }
    }
    
    this.lastUpdateTime = now;
  }
  
  private executeRenderTask(task: any): void {
    // Execute render task based on type
    switch (task.type) {
      case 'render':
        this.renderToCanvas(task.context, task.data, task.mediaType);
        break;
      case 'update':
        this.updateDisplay(task.data);
        break;
      case 'clear':
        this.clearCanvas(task.context);
        break;
    }
  }
  
  // ============================================================================
  // MAIN SYSTEM METHODS
  // ============================================================================
  
  activate(): void {
    this.state.isActive = true;
    this.emit('system:activated', { state: this.state });
  }
  
  deactivate(): void {
    this.state.isActive = false;
    this.emit('system:deactivated', { state: this.state });
  }
  
  setMode(mode: 'vector' | 'embroidery' | 'mixed'): void {
    this.state.currentMode = mode;
    
    switch (mode) {
      case 'vector':
        this.embroideryIntegration.activateVectorMode();
        break;
      case 'embroidery':
        this.embroideryIntegration.activateEmbroideryMode();
        break;
      case 'mixed':
        this.embroideryIntegration.activateVectorMode();
        break;
    }
    
    this.emit('mode:changed', { mode, state: this.state });
  }
  
  setTool(toolId: string): boolean {
    if (!this.toolSet.setActiveTool(toolId)) {
      return false;
    }
    
    this.state.currentTool = toolId;
    this.vectorTools.setTool(toolId as any);
    
    this.emit('tool:changed', { tool: toolId, state: this.state });
    return true;
  }
  
  setMediaType(mediaTypeId: string): boolean {
    const success = this.mediaIntegration.setActiveMediaType(mediaTypeId);
    if (success) {
      this.state.currentMediaType = mediaTypeId;
      this.emit('mediaType:changed', { mediaTypeId, state: this.state });
    }
    return success;
  }
  
  // ============================================================================
  // MOUSE EVENT HANDLING (FIXES CLICK AND DRAG ISSUES)
  // ============================================================================
  
  handleMouseDown(event: MouseEvent, point: VectorPoint, shapes: VectorPath[], currentPath?: VectorPath): any {
    if (!this.state.isActive) {
      return { success: false, error: 'System not active' };
    }
    
    try {
      // Apply precision to point
      const precisePoint = this.applyPrecision(point);
      
      // Update drag state
      this.state.dragState.isDragging = true;
      this.state.dragState.startPoint = precisePoint;
      this.state.dragState.currentPoint = precisePoint;
      
      let result;
      
      if (this.state.currentMode === 'vector') {
        // Handle vector tools
        result = this.vectorTools.handleMouseDown(event, precisePoint, shapes, currentPath);
        
        if (result.success) {
          this.state.dragState.dragType = this.getDragTypeFromTool(this.state.currentTool);
          this.state.dragState.targetId = result.data?.path?.id || null;
        }
      } else if (this.state.currentMode === 'embroidery') {
        // Handle embroidery tools
        result = this.embroideryIntegration.handleMouseDown(event, precisePoint, shapes, currentPath);
        
        if (result.success) {
          this.state.dragState.dragType = 'draw';
          this.state.dragState.targetId = result.data?.path?.id || null;
        }
      } else {
        // Handle mixed mode
        result = this.handleMixedModeMouseDown(event, precisePoint, shapes, currentPath);
      }
      
      this.emit('mouse:down', { event, point: precisePoint, result });
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: `Mouse down error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  handleMouseMove(event: MouseEvent, point: VectorPoint, shapes: VectorPath[], currentPath?: VectorPath): any {
    if (!this.state.isActive || !this.state.dragState.isDragging) {
      return { success: true };
    }
    
    try {
      // Apply precision to point
      const precisePoint = this.applyPrecision(point);
      
      // Update drag state
      this.state.dragState.currentPoint = precisePoint;
      
      let result;
      
      if (this.state.currentMode === 'vector') {
        // Handle vector tools
        result = this.vectorTools.handleMouseMove(event, precisePoint, shapes, currentPath);
      } else if (this.state.currentMode === 'embroidery') {
        // Handle embroidery tools
        result = this.embroideryIntegration.handleMouseMove(event, precisePoint, shapes, currentPath);
      } else {
        // Handle mixed mode
        result = this.handleMixedModeMouseMove(event, precisePoint, shapes, currentPath);
      }
      
      // Queue render task for real-time preview
      if (this.config.enableRealTimePreview && result.requiresRedraw) {
        this.queueRenderTask({
          type: 'render',
          context: event.target as CanvasRenderingContext2D,
          data: result.data,
          mediaType: this.state.currentMediaType
        });
      }
      
      this.emit('mouse:move', { event, point: precisePoint, result });
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: `Mouse move error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  handleMouseUp(event: MouseEvent, point: VectorPoint, shapes: VectorPath[], currentPath?: VectorPath): any {
    if (!this.state.isActive || !this.state.dragState.isDragging) {
      return { success: true };
    }
    
    try {
      // Apply precision to point
      const precisePoint = this.applyPrecision(point);
      
      let result;
      
      if (this.state.currentMode === 'vector') {
        // Handle vector tools
        result = this.vectorTools.handleMouseUp(event, precisePoint, shapes, currentPath);
      } else if (this.state.currentMode === 'embroidery') {
        // Handle embroidery tools
        result = this.embroideryIntegration.handleMouseUp(event, precisePoint, shapes, currentPath);
      } else {
        // Handle mixed mode
        result = this.handleMixedModeMouseUp(event, precisePoint, shapes, currentPath);
      }
      
      // Reset drag state
      this.state.dragState.isDragging = false;
      this.state.dragState.startPoint = null;
      this.state.dragState.currentPoint = null;
      this.state.dragState.dragType = null;
      this.state.dragState.targetId = null;
      
      this.emit('mouse:up', { event, point: precisePoint, result });
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: `Mouse up error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  // ============================================================================
  // MIXED MODE HANDLING
  // ============================================================================
  
  private handleMixedModeMouseDown(event: MouseEvent, point: VectorPoint, shapes: VectorPath[], currentPath?: VectorPath): any {
    // In mixed mode, determine which system to use based on tool
    const tool = this.toolSet.getActiveTool();
    if (!tool) {
      return { success: false, error: 'No active tool' };
    }
    
    // Use vector tools for drawing tools, embroidery for stitch tools
    if (this.isDrawingTool(tool.id)) {
      return this.vectorTools.handleMouseDown(event, point, shapes, currentPath);
    } else if (this.isStitchTool(tool.id)) {
      return this.embroideryIntegration.handleMouseDown(event, point, shapes, currentPath);
    } else {
      return this.vectorTools.handleMouseDown(event, point, shapes, currentPath);
    }
  }
  
  private handleMixedModeMouseMove(event: MouseEvent, point: VectorPoint, shapes: VectorPath[], currentPath?: VectorPath): any {
    const tool = this.toolSet.getActiveTool();
    if (!tool) {
      return { success: true };
    }
    
    if (this.isDrawingTool(tool.id)) {
      return this.vectorTools.handleMouseMove(event, point, shapes, currentPath);
    } else if (this.isStitchTool(tool.id)) {
      return this.embroideryIntegration.handleMouseMove(event, point, shapes, currentPath);
    } else {
      return this.vectorTools.handleMouseMove(event, point, shapes, currentPath);
    }
  }
  
  private handleMixedModeMouseUp(event: MouseEvent, point: VectorPoint, shapes: VectorPath[], currentPath?: VectorPath): any {
    const tool = this.toolSet.getActiveTool();
    if (!tool) {
      return { success: true };
    }
    
    if (this.isDrawingTool(tool.id)) {
      return this.vectorTools.handleMouseUp(event, point, shapes, currentPath);
    } else if (this.isStitchTool(tool.id)) {
      return this.embroideryIntegration.handleMouseUp(event, point, shapes, currentPath);
    } else {
      return this.vectorTools.handleMouseUp(event, point, shapes, currentPath);
    }
  }
  
  private isDrawingTool(toolId: string): boolean {
    const drawingTools = ['pen', 'pencil', 'brush', 'airbrush', 'rectangle', 'ellipse', 'line', 'polygon', 'star'];
    return drawingTools.includes(toolId);
  }
  
  private isStitchTool(toolId: string): boolean {
    const stitchTools = ['cross_stitch', 'satin_stitch', 'chain_stitch', 'fill_stitch', 'back_stitch'];
    return stitchTools.includes(toolId);
  }
  
  // ============================================================================
  // PRECISION AND SNAPPING (FIXES ANCHOR POINT PRECISION)
  // ============================================================================
  
  private applyPrecision(point: VectorPoint): VectorPoint {
    if (!this.config.enablePreciseAnchors) {
      return point;
    }
    
    let precisePoint = { ...point };
    
    // Apply grid snapping
    if (this.state.snapEnabled && this.state.gridEnabled) {
      precisePoint = this.snapToGrid(precisePoint);
    }
    
    // Apply precision rounding
    const precision = this.config.precision;
    precisePoint.x = Math.round(precisePoint.x / precision) * precision;
    precisePoint.y = Math.round(precisePoint.y / precision) * precision;
    
    return precisePoint;
  }
  
  private snapToGrid(point: VectorPoint): VectorPoint {
    const gridSize = this.config.gridSize;
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize
    };
  }
  
  // ============================================================================
  // RENDERING SYSTEM
  // ============================================================================
  
  private queueRenderTask(task: any): void {
    this.renderQueue.push(task);
  }
  
  private renderToCanvas(context: CanvasRenderingContext2D, data: any, mediaType: string): void {
    this.mediaIntegration.render(context, data, mediaType);
  }
  
  private updateDisplay(data: any): void {
    // Update display with new data
    this.emit('display:updated', { data });
  }
  
  private clearCanvas(context: CanvasRenderingContext2D): void {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  }
  
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  private getDragTypeFromTool(toolId: string): string | null {
    const dragTypes: Record<string, string> = {
      'pen': 'draw',
      'pencil': 'draw',
      'brush': 'draw',
      'airbrush': 'draw',
      'select': 'move',
      'lasso': 'select',
      'magic_wand': 'select',
      'rectangle': 'draw',
      'ellipse': 'draw',
      'line': 'draw',
      'polygon': 'draw',
      'star': 'draw',
      'text': 'draw',
      'blur': 'draw',
      'sharpen': 'draw',
      'smudge': 'draw',
      'dodge': 'draw',
      'burn': 'draw'
    };
    
    return dragTypes[toolId] || null;
  }
  
  // ============================================================================
  // CONFIGURATION
  // ============================================================================
  
  updateConfig(config: Partial<SystemConfig>): void {
    this.config = { ...this.config, ...config };
    this.emit('config:updated', { config: this.config });
  }
  
  getConfig(): SystemConfig {
    return { ...this.config };
  }
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  getState(): SystemState {
    return { ...this.state };
  }
  
  // ============================================================================
  // TOOL MANAGEMENT
  // ============================================================================
  
  getAvailableTools(): any[] {
    return this.toolSet.getAllTools();
  }
  
  getToolsByCategory(category: string): any[] {
    return this.toolSet.getToolsByCategory(category);
  }
  
  getActiveTool(): any {
    return this.toolSet.getActiveTool();
  }
  
  updateToolConfig(toolId: string, config: any): boolean {
    return this.toolSet.updateToolConfig(toolId, config);
  }
  
  // ============================================================================
  // MEDIA MANAGEMENT
  // ============================================================================
  
  getAvailableMediaTypes(): any[] {
    return this.mediaIntegration.getAllMediaTypes();
  }
  
  getMediaTypesByCategory(category: string): any[] {
    return this.mediaIntegration.getMediaTypesByCategory(category);
  }
  
  // ============================================================================
  // EVENT SYSTEM
  // ============================================================================
  
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }
  
  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ComprehensiveVectorSystem event listener for ${event}:`, error);
        }
      });
    }
  }
}

export default ComprehensiveVectorSystem;
