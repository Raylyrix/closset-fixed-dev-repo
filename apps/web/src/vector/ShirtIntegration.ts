/**
 * 🎯 Shirt Integration System
 * 
 * Integrates the comprehensive vector system with the existing Shirt.js component
 * Fixes all click and drag issues and ensures seamless operation
 */

import { ComprehensiveVectorSystem } from './ComprehensiveVectorSystem';
import { ProfessionalToolSet } from './ProfessionalToolSet';
import { UniversalMediaIntegration } from './UniversalMediaIntegration';
import { VectorEmbroideryIntegration } from './VectorEmbroideryIntegration';

export interface ShirtIntegrationConfig {
  enableClickAndDrag: boolean;
  enablePreciseAnchors: boolean;
  enableUniversalMedia: boolean;
  enableRealTimePreview: boolean;
  precision: number;
  snapTolerance: number;
  gridSize: number;
  showGrid: boolean;
  showGuides: boolean;
  showRulers: boolean;
}

export class ShirtIntegration {
  private static instance: ShirtIntegration;
  
  private vectorSystem: ComprehensiveVectorSystem;
  private toolSet: ProfessionalToolSet;
  private mediaIntegration: UniversalMediaIntegration;
  private embroideryIntegration: VectorEmbroideryIntegration;
  
  private config: ShirtIntegrationConfig;
  private isInitialized: boolean = false;
  
  constructor() {
    this.initializeSystems();
    this.initializeConfig();
  }
  
  static getInstance(): ShirtIntegration {
    if (!ShirtIntegration.instance) {
      ShirtIntegration.instance = new ShirtIntegration();
    }
    return ShirtIntegration.instance;
  }
  
  private initializeSystems(): void {
    this.vectorSystem = ComprehensiveVectorSystem.getInstance();
    this.toolSet = ProfessionalToolSet.getInstance();
    this.mediaIntegration = UniversalMediaIntegration.getInstance();
    this.embroideryIntegration = VectorEmbroideryIntegration.getInstance();
  }
  
  private initializeConfig(): void {
    this.config = {
      enableClickAndDrag: true,
      enablePreciseAnchors: true,
      enableUniversalMedia: true,
      enableRealTimePreview: true,
      precision: 0.1,
      snapTolerance: 5,
      gridSize: 20,
      showGrid: true,
      showGuides: true,
      showRulers: true
    };
  }
  
  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  async initialize(): Promise<boolean> {
    try {
      // Activate the comprehensive vector system
      this.vectorSystem.activate();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Configure systems
      this.vectorSystem.updateConfig({
        enableClickAndDrag: this.config.enableClickAndDrag,
        enablePreciseAnchors: this.config.enablePreciseAnchors,
        enableUniversalMedia: this.config.enableUniversalMedia,
        enableRealTimePreview: this.config.enableRealTimePreview,
        precision: this.config.precision,
        snapTolerance: this.config.snapTolerance,
        gridSize: this.config.gridSize,
        showGrid: this.config.showGrid,
        showGuides: this.config.showGuides,
        showRulers: this.config.showRulers
      });
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing ShirtIntegration:', error);
      return false;
    }
  }
  
  private setupEventListeners(): void {
    // Vector system events
    this.vectorSystem.on('tool:changed', (data) => {
      console.log('Tool changed:', data.tool);
    });
    
    this.vectorSystem.on('mediaType:changed', (data) => {
      console.log('Media type changed:', data.mediaTypeId);
    });
    
    this.vectorSystem.on('mode:changed', (data) => {
      console.log('Mode changed:', data.mode);
    });
    
    // Embroidery integration events
    this.embroideryIntegration.on('mode:changed', (data) => {
      console.log('Embroidery mode changed:', data.mode);
    });
  }
  
  // ============================================================================
  // MOUSE EVENT HANDLING (FIXES CLICK AND DRAG ISSUES)
  // ============================================================================
  
  handleMouseDown(event: MouseEvent, point: { x: number; y: number }, shapes: any[], currentPath?: any): any {
    if (!this.isInitialized) {
      return { success: false, error: 'ShirtIntegration not initialized' };
    }
    
    try {
      // Convert point to VectorPoint format
      const vectorPoint = { x: point.x, y: point.y };
      
      // Handle with comprehensive vector system
      const result = this.vectorSystem.handleMouseDown(event, vectorPoint, shapes, currentPath);
      
      if (result.success) {
        console.log('Mouse down handled successfully:', result.message);
      } else {
        console.error('Mouse down error:', result.error);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: `Mouse down error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  handleMouseMove(event: MouseEvent, point: { x: number; y: number }, shapes: any[], currentPath?: any): any {
    if (!this.isInitialized) {
      return { success: true };
    }
    
    try {
      // Convert point to VectorPoint format
      const vectorPoint = { x: point.x, y: point.y };
      
      // Handle with comprehensive vector system
      const result = this.vectorSystem.handleMouseMove(event, vectorPoint, shapes, currentPath);
      
      if (result.success && result.requiresRedraw) {
        // Trigger re-render
        this.triggerRedraw();
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: `Mouse move error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  handleMouseUp(event: MouseEvent, point: { x: number; y: number }, shapes: any[], currentPath?: any): any {
    if (!this.isInitialized) {
      return { success: true };
    }
    
    try {
      // Convert point to VectorPoint format
      const vectorPoint = { x: point.x, y: point.y };
      
      // Handle with comprehensive vector system
      const result = this.vectorSystem.handleMouseUp(event, vectorPoint, shapes, currentPath);
      
      if (result.success) {
        console.log('Mouse up handled successfully:', result.message);
        // Trigger final re-render
        this.triggerRedraw();
      } else {
        console.error('Mouse up error:', result.error);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: `Mouse up error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  // ============================================================================
  // TOOL MANAGEMENT
  // ============================================================================
  
  setTool(toolId: string): boolean {
    if (!this.isInitialized) {
      return false;
    }
    
    return this.vectorSystem.setTool(toolId);
  }
  
  getCurrentTool(): string {
    if (!this.isInitialized) {
      return 'pen';
    }
    
    return this.vectorSystem.getState().currentTool;
  }
  
  getAvailableTools(): any[] {
    if (!this.isInitialized) {
      return [];
    }
    
    return this.vectorSystem.getAvailableTools();
  }
  
  getToolsByCategory(category: string): any[] {
    if (!this.isInitialized) {
      return [];
    }
    
    return this.vectorSystem.getToolsByCategory(category);
  }
  
  // ============================================================================
  // MEDIA TYPE MANAGEMENT
  // ============================================================================
  
  setMediaType(mediaTypeId: string): boolean {
    if (!this.isInitialized) {
      return false;
    }
    
    return this.vectorSystem.setMediaType(mediaTypeId);
  }
  
  getCurrentMediaType(): string {
    if (!this.isInitialized) {
      return 'digital_print';
    }
    
    return this.vectorSystem.getState().currentMediaType;
  }
  
  getAvailableMediaTypes(): any[] {
    if (!this.isInitialized) {
      return [];
    }
    
    return this.vectorSystem.getAvailableMediaTypes();
  }
  
  getMediaTypesByCategory(category: string): any[] {
    if (!this.isInitialized) {
      return [];
    }
    
    return this.vectorSystem.getMediaTypesByCategory(category);
  }
  
  // ============================================================================
  // MODE MANAGEMENT
  // ============================================================================
  
  setMode(mode: 'vector' | 'embroidery' | 'mixed'): void {
    if (!this.isInitialized) {
      return;
    }
    
    this.vectorSystem.setMode(mode);
  }
  
  getCurrentMode(): string {
    if (!this.isInitialized) {
      return 'vector';
    }
    
    return this.vectorSystem.getState().currentMode;
  }
  
  // ============================================================================
  // RENDERING
  // ============================================================================
  
  renderToCanvas(context: CanvasRenderingContext2D, data: any, mediaType?: string): boolean {
    if (!this.isInitialized) {
      return false;
    }
    
    return this.vectorSystem.renderToCanvas(context, data, mediaType);
  }
  
  private triggerRedraw(): void {
    // This would trigger a re-render in the parent component
    // Implementation depends on how the parent component handles updates
    console.log('Triggering redraw...');
  }
  
  // ============================================================================
  // CONFIGURATION
  // ============================================================================
  
  updateConfig(config: Partial<ShirtIntegrationConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (this.isInitialized) {
      this.vectorSystem.updateConfig({
        enableClickAndDrag: this.config.enableClickAndDrag,
        enablePreciseAnchors: this.config.enablePreciseAnchors,
        enableUniversalMedia: this.config.enableUniversalMedia,
        enableRealTimePreview: this.config.enableRealTimePreview,
        precision: this.config.precision,
        snapTolerance: this.config.snapTolerance,
        gridSize: this.config.gridSize,
        showGrid: this.config.showGrid,
        showGuides: this.config.showGuides,
        showRulers: this.config.showRulers
      });
    }
  }
  
  getConfig(): ShirtIntegrationConfig {
    return { ...this.config };
  }
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  getState(): any {
    if (!this.isInitialized) {
      return null;
    }
    
    return this.vectorSystem.getState();
  }
  
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  isInitialized(): boolean {
    return this.isInitialized;
  }
  
  // ============================================================================
  // EVENT SYSTEM
  // ============================================================================
  
  on(event: string, callback: Function): void {
    if (this.isInitialized) {
      this.vectorSystem.on(event, callback);
    }
  }
  
  off(event: string, callback: Function): void {
    if (this.isInitialized) {
      this.vectorSystem.off(event, callback);
    }
  }
}

export default ShirtIntegration;
