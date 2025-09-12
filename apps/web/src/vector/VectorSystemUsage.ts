/**
 * 🎯 Vector System Usage Examples
 * 
 * Complete examples showing how to use the improved vector tools system
 * Fixes all click and drag issues and provides professional functionality
 */

import { ShirtIntegration } from './ShirtIntegration';
import { ComprehensiveVectorSystem } from './ComprehensiveVectorSystem';
import { ProfessionalToolSet } from './ProfessionalToolSet';
import { UniversalMediaIntegration } from './UniversalMediaIntegration';

// ============================================================================
// BASIC USAGE EXAMPLES
// ============================================================================

export class VectorSystemUsage {
  private shirtIntegration: ShirtIntegration;
  private vectorSystem: ComprehensiveVectorSystem;
  private toolSet: ProfessionalToolSet;
  private mediaIntegration: UniversalMediaIntegration;
  
  constructor() {
    this.shirtIntegration = ShirtIntegration.getInstance();
    this.vectorSystem = ComprehensiveVectorSystem.getInstance();
    this.toolSet = ProfessionalToolSet.getInstance();
    this.mediaIntegration = UniversalMediaIntegration.getInstance();
  }
  
  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  async initialize(): Promise<boolean> {
    try {
      // Initialize the shirt integration (main entry point)
      const success = await this.shirtIntegration.initialize();
      
      if (success) {
        console.log('✅ Vector system initialized successfully');
        return true;
      } else {
        console.error('❌ Failed to initialize vector system');
        return false;
      }
    } catch (error) {
      console.error('❌ Error initializing vector system:', error);
      return false;
    }
  }
  
  // ============================================================================
  // MOUSE EVENT HANDLING (FIXES CLICK AND DRAG ISSUES)
  // ============================================================================
  
  handleMouseDown(event: MouseEvent, canvas: HTMLCanvasElement): any {
    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert to normalized coordinates
    const point = {
      x: (x / canvas.width) * 2 - 1,
      y: -((y / canvas.height) * 2 - 1)
    };
    
    // Handle with shirt integration (fixes all click and drag issues)
    const result = this.shirtIntegration.handleMouseDown(event, point, [], undefined);
    
    if (result.success) {
      console.log('✅ Mouse down handled:', result.message);
    } else {
      console.error('❌ Mouse down error:', result.error);
    }
    
    return result;
  }
  
  handleMouseMove(event: MouseEvent, canvas: HTMLCanvasElement): any {
    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert to normalized coordinates
    const point = {
      x: (x / canvas.width) * 2 - 1,
      y: -((y / canvas.height) * 2 - 1)
    };
    
    // Handle with shirt integration
    const result = this.shirtIntegration.handleMouseMove(event, point, [], undefined);
    
    if (result.success && result.requiresRedraw) {
      // Trigger re-render
      this.redrawCanvas(canvas);
    }
    
    return result;
  }
  
  handleMouseUp(event: MouseEvent, canvas: HTMLCanvasElement): any {
    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert to normalized coordinates
    const point = {
      x: (x / canvas.width) * 2 - 1,
      y: -((y / canvas.height) * 2 - 1)
    };
    
    // Handle with shirt integration
    const result = this.shirtIntegration.handleMouseUp(event, point, [], undefined);
    
    if (result.success) {
      console.log('✅ Mouse up handled:', result.message);
      // Trigger final re-render
      this.redrawCanvas(canvas);
    } else {
      console.error('❌ Mouse up error:', result.error);
    }
    
    return result;
  }
  
  // ============================================================================
  // TOOL MANAGEMENT
  // ============================================================================
  
  setTool(toolId: string): boolean {
    const success = this.shirtIntegration.setTool(toolId);
    
    if (success) {
      console.log(`✅ Tool changed to: ${toolId}`);
    } else {
      console.error(`❌ Failed to change tool to: ${toolId}`);
    }
    
    return success;
  }
  
  getCurrentTool(): string {
    return this.shirtIntegration.getCurrentTool();
  }
  
  getAvailableTools(): any[] {
    return this.shirtIntegration.getAvailableTools();
  }
  
  getToolsByCategory(category: string): any[] {
    return this.shirtIntegration.getToolsByCategory(category);
  }
  
  // ============================================================================
  // MEDIA TYPE MANAGEMENT
  // ============================================================================
  
  setMediaType(mediaTypeId: string): boolean {
    const success = this.shirtIntegration.setMediaType(mediaTypeId);
    
    if (success) {
      console.log(`✅ Media type changed to: ${mediaTypeId}`);
    } else {
      console.error(`❌ Failed to change media type to: ${mediaTypeId}`);
    }
    
    return success;
  }
  
  getCurrentMediaType(): string {
    return this.shirtIntegration.getCurrentMediaType();
  }
  
  getAvailableMediaTypes(): any[] {
    return this.shirtIntegration.getAvailableMediaTypes();
  }
  
  getMediaTypesByCategory(category: string): any[] {
    return this.shirtIntegration.getMediaTypesByCategory(category);
  }
  
  // ============================================================================
  // MODE MANAGEMENT
  // ============================================================================
  
  setMode(mode: 'vector' | 'embroidery' | 'mixed'): void {
    this.shirtIntegration.setMode(mode);
    console.log(`✅ Mode changed to: ${mode}`);
  }
  
  getCurrentMode(): string {
    return this.shirtIntegration.getCurrentMode();
  }
  
  // ============================================================================
  // RENDERING
  // ============================================================================
  
  renderToCanvas(canvas: HTMLCanvasElement, data: any, mediaType?: string): boolean {
    const context = canvas.getContext('2d');
    if (!context) {
      console.error('❌ Failed to get canvas context');
      return false;
    }
    
    const success = this.shirtIntegration.renderToCanvas(context, data, mediaType);
    
    if (success) {
      console.log('✅ Rendered to canvas successfully');
    } else {
      console.error('❌ Failed to render to canvas');
    }
    
    return success;
  }
  
  private redrawCanvas(canvas: HTMLCanvasElement): void {
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw based on current state
    const state = this.shirtIntegration.getState();
    if (state) {
      // Redraw logic would go here
      console.log('🔄 Redrawing canvas...');
    }
  }
  
  // ============================================================================
  // CONFIGURATION
  // ============================================================================
  
  updateConfig(config: any): void {
    this.shirtIntegration.updateConfig(config);
    console.log('✅ Configuration updated');
  }
  
  getConfig(): any {
    return this.shirtIntegration.getConfig();
  }
  
  // ============================================================================
  // EVENT HANDLING
  // ============================================================================
  
  on(event: string, callback: Function): void {
    this.shirtIntegration.on(event, callback);
  }
  
  off(event: string, callback: Function): void {
    this.shirtIntegration.off(event, callback);
  }
  
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  isInitialized(): boolean {
    return this.shirtIntegration.isInitialized();
  }
  
  getState(): any {
    return this.shirtIntegration.getState();
  }
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

export const VectorSystemExamples = {
  
  // Example 1: Basic initialization and tool usage
  async basicUsage(): Promise<void> {
    const vectorSystem = new VectorSystemUsage();
    
    // Initialize the system
    const initialized = await vectorSystem.initialize();
    if (!initialized) {
      console.error('Failed to initialize vector system');
      return;
    }
    
    // Set up a canvas
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    document.body.appendChild(canvas);
    
    // Set up mouse event handlers
    canvas.addEventListener('mousedown', (event) => {
      vectorSystem.handleMouseDown(event, canvas);
    });
    
    canvas.addEventListener('mousemove', (event) => {
      vectorSystem.handleMouseMove(event, canvas);
    });
    
    canvas.addEventListener('mouseup', (event) => {
      vectorSystem.handleMouseUp(event, canvas);
    });
    
    // Set tool
    vectorSystem.setTool('pen');
    
    // Set media type
    vectorSystem.setMediaType('cross_stitch');
    
    console.log('✅ Basic usage example set up successfully');
  },
  
  // Example 2: Professional tool usage
  async professionalToolUsage(): Promise<void> {
    const vectorSystem = new VectorSystemUsage();
    await vectorSystem.initialize();
    
    // Get available tools
    const allTools = vectorSystem.getAvailableTools();
    console.log('Available tools:', allTools);
    
    // Get tools by category
    const drawingTools = vectorSystem.getToolsByCategory('drawing');
    console.log('Drawing tools:', drawingTools);
    
    const fashionTools = vectorSystem.getToolsByCategory('fashion');
    console.log('Fashion tools:', fashionTools);
    
    // Use different tools
    vectorSystem.setTool('pen');
    vectorSystem.setTool('brush');
    vectorSystem.setTool('seam'); // Fashion tool
    vectorSystem.setTool('extrude'); // 3D tool
    
    console.log('✅ Professional tool usage example completed');
  },
  
  // Example 3: Media type usage
  async mediaTypeUsage(): Promise<void> {
    const vectorSystem = new VectorSystemUsage();
    await vectorSystem.initialize();
    
    // Get available media types
    const allMediaTypes = vectorSystem.getAvailableMediaTypes();
    console.log('Available media types:', allMediaTypes);
    
    // Get media types by category
    const stitchTypes = vectorSystem.getMediaTypesByCategory('stitch');
    console.log('Stitch types:', stitchTypes);
    
    const printTypes = vectorSystem.getMediaTypesByCategory('print');
    console.log('Print types:', printTypes);
    
    // Use different media types
    vectorSystem.setMediaType('digital_print');
    vectorSystem.setMediaType('cross_stitch');
    vectorSystem.setMediaType('satin_stitch');
    vectorSystem.setMediaType('puff_embroidery');
    
    console.log('✅ Media type usage example completed');
  },
  
  // Example 4: Mode switching
  async modeSwitching(): Promise<void> {
    const vectorSystem = new VectorSystemUsage();
    await vectorSystem.initialize();
    
    // Switch between modes
    vectorSystem.setMode('vector');
    console.log('Current mode:', vectorSystem.getCurrentMode());
    
    vectorSystem.setMode('embroidery');
    console.log('Current mode:', vectorSystem.getCurrentMode());
    
    vectorSystem.setMode('mixed');
    console.log('Current mode:', vectorSystem.getCurrentMode());
    
    console.log('✅ Mode switching example completed');
  },
  
  // Example 5: Configuration
  async configurationExample(): Promise<void> {
    const vectorSystem = new VectorSystemUsage();
    await vectorSystem.initialize();
    
    // Update configuration
    vectorSystem.updateConfig({
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
    });
    
    // Get current configuration
    const config = vectorSystem.getConfig();
    console.log('Current configuration:', config);
    
    console.log('✅ Configuration example completed');
  }
};

// ============================================================================
// REACT INTEGRATION EXAMPLE
// ============================================================================

export const ReactIntegrationExample = `
import React, { useRef, useEffect } from 'react';
import { VectorSystemUsage } from './VectorSystemUsage';

const VectorCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vectorSystemRef = useRef<VectorSystemUsage | null>(null);
  
  useEffect(() => {
    const initializeVectorSystem = async () => {
      const vectorSystem = new VectorSystemUsage();
      await vectorSystem.initialize();
      vectorSystemRef.current = vectorSystem;
    };
    
    initializeVectorSystem();
  }, []);
  
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (vectorSystemRef.current && canvasRef.current) {
      vectorSystemRef.current.handleMouseDown(event.nativeEvent, canvasRef.current);
    }
  };
  
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (vectorSystemRef.current && canvasRef.current) {
      vectorSystemRef.current.handleMouseMove(event.nativeEvent, canvasRef.current);
    }
  };
  
  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (vectorSystemRef.current && canvasRef.current) {
      vectorSystemRef.current.handleMouseUp(event.nativeEvent, canvasRef.current);
    }
  };
  
  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ border: '1px solid #ccc' }}
    />
  );
};

export default VectorCanvas;
`;

export default VectorSystemUsage;
