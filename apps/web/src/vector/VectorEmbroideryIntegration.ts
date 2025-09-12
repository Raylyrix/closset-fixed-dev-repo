/**
 * 🎯 Vector-Embroidery Integration System
 * 
 * Fixes click and drag issues and ensures seamless integration between
 * vector tools and embroidery system with all media types
 */

import { AdvancedVectorTools } from './AdvancedVectorTools';
import { UniversalMediaIntegration } from './UniversalMediaIntegration';
import { VectorState, VectorPath, VectorPoint } from './VectorStateManager';

export interface IntegrationState {
  isActive: boolean;
  currentTool: string;
  currentMediaType: string;
  vectorMode: boolean;
  embroideryMode: boolean;
  dragState: {
    isDragging: boolean;
    startPoint: VectorPoint | null;
    currentPoint: VectorPoint | null;
    dragType: 'draw' | 'move' | 'scale' | 'rotate' | null;
    targetId: string | null;
  };
  selection: {
    selectedPaths: string[];
    selectedPoints: string[];
  };
}

export interface IntegrationConfig {
  enableClickAndDrag: boolean;
  enablePreciseAnchors: boolean;
  enableUniversalMedia: boolean;
  enableRealTimePreview: boolean;
  enableUndoRedo: boolean;
  precision: number;
  snapTolerance: number;
}

export class VectorEmbroideryIntegration {
  private static instance: VectorEmbroideryIntegration;
  
  private state: IntegrationState;
  private config: IntegrationConfig;
  private vectorTools: AdvancedVectorTools;
  private mediaIntegration: UniversalMediaIntegration;
  
  // Event system
  private eventListeners: Map<string, Function[]> = new Map();
  
  // Performance optimization
  private lastUpdateTime: number = 0;
  private updateThrottle: number = 16; // 60fps
  
  constructor() {
    this.initializeState();
    this.initializeConfig();
    this.initializeSystems();
    this.setupEventHandlers();
  }
  
  static getInstance(): VectorEmbroideryIntegration {
    if (!VectorEmbroideryIntegration.instance) {
      VectorEmbroideryIntegration.instance = new VectorEmbroideryIntegration();
    }
    return VectorEmbroideryIntegration.instance;
  }
  
  private initializeState(): void {
    this.state = {
      isActive: false,
      currentTool: 'pen',
      currentMediaType: 'digital_print',
      vectorMode: false,
      embroideryMode: false,
      dragState: {
        isDragging: false,
        startPoint: null,
        currentPoint: null,
        dragType: null,
        targetId: null
      },
      selection: {
        selectedPaths: [],
        selectedPoints: []
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
      precision: 0.1,
      snapTolerance: 5
    };
  }
  
  private initializeSystems(): void {
    this.vectorTools = AdvancedVectorTools.getInstance();
    this.mediaIntegration = UniversalMediaIntegration.getInstance();
  }
  
  private setupEventHandlers(): void {
    // Listen for vector tool changes
    this.vectorTools.on('tool:changed', (data) => {
      this.state.currentTool = data.tool;
      this.emit('tool:changed', data);
    });
    
    // Listen for media type changes
    this.mediaIntegration.on('mediaType:changed', (data) => {
      this.state.currentMediaType = data.mediaType.id;
      this.emit('mediaType:changed', data);
    });
  }
  
  // ============================================================================
  // MAIN INTEGRATION METHODS
  // ============================================================================
  
  activateVectorMode(): void {
    this.state.vectorMode = true;
    this.state.embroideryMode = false;
    this.state.isActive = true;
    
    this.emit('mode:changed', { mode: 'vector', active: true });
  }
  
  activateEmbroideryMode(): void {
    this.state.vectorMode = false;
    this.state.embroideryMode = true;
    this.state.isActive = true;
    
    this.emit('mode:changed', { mode: 'embroidery', active: true });
  }
  
  deactivate(): void {
    this.state.vectorMode = false;
    this.state.embroideryMode = false;
    this.state.isActive = false;
    
    this.emit('mode:changed', { mode: 'none', active: false });
  }
  
  // ============================================================================
  // CLICK AND DRAG HANDLING
  // ============================================================================
  
  handleMouseDown(event: MouseEvent, point: VectorPoint, shapes: VectorPath[], currentPath?: VectorPath): any {
    if (!this.state.isActive) {
      return { success: false, error: 'Integration not active' };
    }
    
    try {
      // Update drag state
      this.state.dragState.isDragging = true;
      this.state.dragState.startPoint = point;
      this.state.dragState.currentPoint = point;
      
      let result;
      
      if (this.state.vectorMode) {
        // Handle vector tool
        result = this.vectorTools.handleMouseDown(event, point, shapes, currentPath);
        
        if (result.success) {
          this.state.dragState.dragType = this.getDragTypeFromTool(this.state.currentTool);
          this.state.dragState.targetId = result.data?.path?.id || null;
        }
      } else if (this.state.embroideryMode) {
        // Handle embroidery tool
        result = this.handleEmbroideryMouseDown(event, point, shapes, currentPath);
      } else {
        result = { success: false, error: 'No active mode' };
      }
      
      this.emit('mouse:down', { event, point, result });
      
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
      // Update drag state
      this.state.dragState.currentPoint = point;
      
      let result;
      
      if (this.state.vectorMode) {
        // Handle vector tool move
        result = this.vectorTools.handleMouseMove(event, point, shapes, currentPath);
      } else if (this.state.embroideryMode) {
        // Handle embroidery tool move
        result = this.handleEmbroideryMouseMove(event, point, shapes, currentPath);
      } else {
        result = { success: true };
      }
      
      this.emit('mouse:move', { event, point, result });
      
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
      let result;
      
      if (this.state.vectorMode) {
        // Handle vector tool up
        result = this.vectorTools.handleMouseUp(event, point, shapes, currentPath);
      } else if (this.state.embroideryMode) {
        // Handle embroidery tool up
        result = this.handleEmbroideryMouseUp(event, point, shapes, currentPath);
      } else {
        result = { success: true };
      }
      
      // Reset drag state
      this.state.dragState.isDragging = false;
      this.state.dragState.startPoint = null;
      this.state.dragState.currentPoint = null;
      this.state.dragState.dragType = null;
      this.state.dragState.targetId = null;
      
      this.emit('mouse:up', { event, point, result });
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: `Mouse up error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  // ============================================================================
  // EMBROIDERY HANDLING
  // ============================================================================
  
  private handleEmbroideryMouseDown(event: MouseEvent, point: VectorPoint, shapes: VectorPath[], currentPath?: VectorPath): any {
    // Convert point to embroidery format
    const embroideryPoint = this.convertPointToEmbroidery(point);
    
    if (!currentPath) {
      // Start new embroidery path
      const newPath: VectorPath = {
        id: `embroidery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        points: [embroideryPoint],
        type: 'embroidery',
        closed: false,
        style: {
          stroke: '#ff69b4',
          strokeWidth: 3,
          fill: 'none',
          opacity: 1
        },
        embroideryType: this.state.currentMediaType
      };
      
      this.state.dragState.dragType = 'draw';
      this.state.dragState.targetId = newPath.id;
      
      return {
        success: true,
        message: 'Started new embroidery path',
        data: { action: 'startPath', path: newPath },
        requiresRedraw: true
      };
    } else {
      // Add point to existing embroidery path
      const updatedPath = {
        ...currentPath,
        points: [...currentPath.points, embroideryPoint]
      };
      
      this.state.dragState.dragType = 'draw';
      this.state.dragState.targetId = updatedPath.id;
      
      return {
        success: true,
        message: 'Added point to embroidery path',
        data: { action: 'addPoint', path: updatedPath },
        requiresRedraw: true
      };
    }
  }
  
  private handleEmbroideryMouseMove(event: MouseEvent, point: VectorPoint, shapes: VectorPath[], currentPath?: VectorPath): any {
    if (this.state.dragState.dragType === 'draw' && this.state.dragState.targetId) {
      // Update embroidery path with new point
      const embroideryPoint = this.convertPointToEmbroidery(point);
      
      if (currentPath) {
        const updatedPath = {
          ...currentPath,
          points: [...currentPath.points, embroideryPoint]
        };
        
        return {
          success: true,
          message: 'Updated embroidery path',
          data: { action: 'updatePath', path: updatedPath },
          requiresRedraw: true
        };
      }
    }
    
    return { success: true };
  }
  
  private handleEmbroideryMouseUp(event: MouseEvent, point: VectorPoint, shapes: VectorPath[], currentPath?: VectorPath): any {
    // Complete embroidery path
    return {
      success: true,
      message: 'Completed embroidery path',
      data: { action: 'completePath', path: currentPath },
      requiresRedraw: true
    };
  }
  
  // ============================================================================
  // PRECISION AND ANCHOR HANDLING
  // ============================================================================
  
  private convertPointToEmbroidery(point: VectorPoint): VectorPoint {
    // Apply precision and snapping for embroidery
    let convertedPoint = { ...point };
    
    if (this.config.enablePreciseAnchors) {
      convertedPoint = this.applyPrecision(convertedPoint);
    }
    
    return convertedPoint;
  }
  
  private applyPrecision(point: VectorPoint): VectorPoint {
    // Apply precision based on configuration
    const precision = this.config.precision;
    
    return {
      x: Math.round(point.x / precision) * precision,
      y: Math.round(point.y / precision) * precision
    };
  }
  
  // ============================================================================
  // MEDIA TYPE HANDLING
  // ============================================================================
  
  setMediaType(mediaTypeId: string): boolean {
    const success = this.mediaIntegration.setActiveMediaType(mediaTypeId);
    if (success) {
      this.state.currentMediaType = mediaTypeId;
      this.emit('mediaType:changed', { mediaTypeId });
    }
    return success;
  }
  
  getAvailableMediaTypes(): any[] {
    return this.mediaIntegration.getAllMediaTypes();
  }
  
  getMediaTypesByCategory(category: string): any[] {
    return this.mediaIntegration.getMediaTypesByCategory(category);
  }
  
  // ============================================================================
  // RENDERING
  // ============================================================================
  
  render(context: CanvasRenderingContext2D, data: any, mediaTypeId?: string): boolean {
    if (!this.state.isActive) {
      return false;
    }
    
    const mediaType = mediaTypeId || this.state.currentMediaType;
    return this.mediaIntegration.render(context, data, mediaType);
  }
  
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  private getDragTypeFromTool(tool: string): 'draw' | 'move' | 'scale' | 'rotate' | null {
    const dragTypes: Record<string, 'draw' | 'move' | 'scale' | 'rotate' | null> = {
      'pen': 'draw',
      'pencil': 'draw',
      'brush': 'draw',
      'select': 'move',
      'pathSelection': 'move',
      'rectangle': 'draw',
      'ellipse': 'draw',
      'line': 'draw',
      'polygon': 'draw',
      'star': 'draw',
      'text': 'draw',
      'gradient': 'draw',
      'eraser': 'draw',
      'clone': 'draw',
      'heal': 'draw',
      'blur': 'draw',
      'sharpen': 'draw',
      'smudge': 'draw',
      'dodge': 'draw',
      'burn': 'draw',
      'sponge': 'draw'
    };
    
    return dragTypes[tool] || null;
  }
  
  // ============================================================================
  // CONFIGURATION
  // ============================================================================
  
  updateConfig(config: Partial<IntegrationConfig>): void {
    this.config = { ...this.config, ...config };
    this.emit('config:updated', { config: this.config });
  }
  
  getConfig(): IntegrationConfig {
    return { ...this.config };
  }
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  getState(): IntegrationState {
    return { ...this.state };
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
          console.error(`Error in VectorEmbroideryIntegration event listener for ${event}:`, error);
        }
      });
    }
  }
}

export default VectorEmbroideryIntegration;
