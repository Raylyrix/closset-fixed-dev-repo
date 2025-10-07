/**
 * Canvas Manager
 * 
 * Centralized canvas management for the unified layer system.
 * Handles canvas creation, pooling, cleanup, and composition.
 */

import { UnifiedLayer } from './types/UnifiedLayerTypes';

export class CanvasManager {
  private canvases: Map<string, HTMLCanvasElement> = new Map();
  private composedCanvas: HTMLCanvasElement | null = null;
  private displacementCanvas: HTMLCanvasElement | null = null;
  private normalCanvas: HTMLCanvasElement | null = null;
  private canvasPool: HTMLCanvasElement[] = [];
  
  // Canvas dimensions
  private defaultWidth = 4096;
  private defaultHeight = 4096;
  
  constructor(width = 4096, height = 4096) {
    this.defaultWidth = width;
    this.defaultHeight = height;
    this.initializeComposedCanvas();
  }
  
  /**
   * Initialize the composed canvas
   */
  private initializeComposedCanvas(): void {
    if (!this.composedCanvas) {
      this.composedCanvas = this.createCanvas('composed', this.defaultWidth, this.defaultHeight);
    }
  }
  
  /**
   * Create a new canvas or get one from the pool
   */
  createCanvas(id: string, width: number, height: number): HTMLCanvasElement {
    // Check if canvas already exists
    if (this.canvases.has(id)) {
      const existingCanvas = this.canvases.get(id)!;
      // Resize if dimensions changed
      if (existingCanvas.width !== width || existingCanvas.height !== height) {
        existingCanvas.width = width;
        existingCanvas.height = height;
      }
      return existingCanvas;
    }
    
    // Try to reuse from pool
    let canvas: HTMLCanvasElement;
    const poolIndex = this.canvasPool.findIndex(c => c.width === width && c.height === height);
    
    if (poolIndex !== -1) {
      canvas = this.canvasPool.splice(poolIndex, 1)[0];
    } else {
      canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
    }
    
    // Clear the canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
    }
    
    this.canvases.set(id, canvas);
    console.log(`🎨 CanvasManager: Created canvas ${id} (${width}x${height})`);
    
    return canvas;
  }
  
  /**
   * Get an existing canvas
   */
  getCanvas(id: string): HTMLCanvasElement | null {
    return this.canvases.get(id) || null;
  }
  
  /**
   * Remove a canvas and return it to the pool
   */
  removeCanvas(id: string): void {
    const canvas = this.canvases.get(id);
    if (canvas) {
      this.canvases.delete(id);
      this.canvasPool.push(canvas);
      console.log(`🎨 CanvasManager: Removed canvas ${id} to pool`);
    }
  }
  
  /**
   * Get the composed canvas
   */
  getComposedCanvas(): HTMLCanvasElement {
    if (!this.composedCanvas) {
      this.initializeComposedCanvas();
    }
    return this.composedCanvas!;
  }
  
  /**
   * Get or create displacement canvas
   */
  getDisplacementCanvas(): HTMLCanvasElement {
    if (!this.displacementCanvas) {
      this.displacementCanvas = this.createCanvas('displacement', this.defaultWidth, this.defaultHeight);
    }
    return this.displacementCanvas;
  }
  
  /**
   * Get or create normal canvas
   */
  getNormalCanvas(): HTMLCanvasElement {
    if (!this.normalCanvas) {
      this.normalCanvas = this.createCanvas('normal', this.defaultWidth, this.defaultHeight);
    }
    return this.normalCanvas;
  }
  
  /**
   * Compose layers into the composed canvas
   */
  composeLayers(layers: UnifiedLayer[]): HTMLCanvasElement {
    const composedCanvas = this.getComposedCanvas();
    const ctx = composedCanvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get 2D context for composed canvas');
    }
    
    // Clear the composed canvas
    ctx.clearRect(0, 0, composedCanvas.width, composedCanvas.height);
    
    // Sort layers by order
    const sortedLayers = [...layers].sort((a, b) => a.order - b.order);
    
    // Draw each visible layer
    for (const layer of sortedLayers) {
      if (!layer.visible || !layer.canvas) continue;
      
      ctx.save();
      
      // Apply layer properties
      ctx.globalAlpha = layer.opacity;
      ctx.globalCompositeOperation = layer.blendMode;
      
      // Draw layer canvas
      ctx.drawImage(layer.canvas, 0, 0);
      
      ctx.restore();
    }
    
    console.log(`🎨 CanvasManager: Composed ${sortedLayers.length} layers`);
    return composedCanvas;
  }
  
  /**
   * Create displacement map from puff print layers
   */
  createDisplacementMap(layers: UnifiedLayer[]): HTMLCanvasElement {
    const displacementCanvas = this.getDisplacementCanvas();
    const ctx = displacementCanvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get 2D context for displacement canvas');
    }
    
    // Clear displacement canvas
    ctx.clearRect(0, 0, displacementCanvas.width, displacementCanvas.height);
    
    // Fill with neutral gray (no displacement)
    ctx.fillStyle = 'rgb(128, 128, 128)';
    ctx.fillRect(0, 0, displacementCanvas.width, displacementCanvas.height);
    
    // Process puff print layers
    const puffLayers = layers.filter(layer => 
      layer.visible && 
      layer.toolType === 'puffPrint' && 
      layer.toolData.puffData && 
      layer.toolData.puffData.length > 0
    );
    
    for (const layer of puffLayers) {
      if (!layer.toolData.puffData) continue;
      
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = layer.opacity;
      
      // Draw puff data as displacement
      for (const puff of layer.toolData.puffData) {
        const intensity = Math.min(255, 128 + (puff.height * 127));
        ctx.fillStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
        ctx.beginPath();
        ctx.arc(puff.x, puff.y, puff.size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    }
    
    console.log(`🎨 CanvasManager: Created displacement map from ${puffLayers.length} puff layers`);
    return displacementCanvas;
  }
  
  /**
   * Create normal map from displacement data
   */
  createNormalMap(displacementCanvas: HTMLCanvasElement): HTMLCanvasElement {
    const normalCanvas = this.getNormalCanvas();
    const ctx = normalCanvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get 2D context for normal canvas');
    }
    
    // Clear normal canvas
    ctx.clearRect(0, 0, normalCanvas.width, normalCanvas.height);
    
    // Get displacement image data
    const dispCtx = displacementCanvas.getContext('2d');
    if (!dispCtx) {
      throw new Error('Failed to get 2D context for displacement canvas');
    }
    
    const imageData = dispCtx.getImageData(0, 0, displacementCanvas.width, displacementCanvas.height);
    const normalImageData = ctx.createImageData(normalCanvas.width, normalCanvas.height);
    
    // Convert displacement to normal map
    for (let y = 0; y < displacementCanvas.height; y++) {
      for (let x = 0; x < displacementCanvas.width; x++) {
        const idx = (y * displacementCanvas.width + x) * 4;
        
        // Get surrounding displacement values
        const getDisplacement = (dx: number, dy: number): number => {
          const nx = Math.max(0, Math.min(displacementCanvas.width - 1, x + dx));
          const ny = Math.max(0, Math.min(displacementCanvas.height - 1, y + dy));
          const nidx = (ny * displacementCanvas.width + nx) * 4;
          return imageData.data[nidx]; // Use red channel as displacement
        };
        
        // Calculate gradients
        const dx = (getDisplacement(1, 0) - getDisplacement(-1, 0)) / 255.0;
        const dy = (getDisplacement(0, 1) - getDisplacement(0, -1)) / 255.0;
        
        // Calculate normal vector
        const normal = {
          x: -dx,
          y: -dy,
          z: 1.0
        };
        
        // Normalize
        const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
        if (length > 0) {
          normal.x /= length;
          normal.y /= length;
          normal.z /= length;
        }
        
        // Convert to RGB (normal maps use RGB for XYZ)
        const normalIdx = (y * normalCanvas.width + x) * 4;
        normalImageData.data[normalIdx] = Math.floor((normal.x + 1) * 127.5);     // R
        normalImageData.data[normalIdx + 1] = Math.floor((normal.y + 1) * 127.5); // G
        normalImageData.data[normalIdx + 2] = Math.floor((normal.z + 1) * 127.5); // B
        normalImageData.data[normalIdx + 3] = 255; // A
      }
    }
    
    ctx.putImageData(normalImageData, 0, 0);
    
    console.log('🎨 CanvasManager: Created normal map from displacement');
    return normalCanvas;
  }
  
  /**
   * Update canvas dimensions
   */
  updateDimensions(width: number, height: number): void {
    this.defaultWidth = width;
    this.defaultHeight = height;
    
    // Update all existing canvases
    for (const [id, canvas] of this.canvases) {
      canvas.width = width;
      canvas.height = height;
      
      // Clear the canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
      }
    }
    
    console.log(`🎨 CanvasManager: Updated dimensions to ${width}x${height}`);
  }
  
  /**
   * Get canvas statistics
   */
  getStats(): {
    activeCanvases: number;
    pooledCanvases: number;
    totalMemory: number;
  } {
    const activeCanvases = this.canvases.size;
    const pooledCanvases = this.canvasPool.length;
    const totalMemory = (activeCanvases + pooledCanvases) * this.defaultWidth * this.defaultHeight * 4; // RGBA
    
    return {
      activeCanvases,
      pooledCanvases,
      totalMemory
    };
  }
  
  /**
   * Cleanup all canvases and return to pool
   */
  cleanup(): void {
    // Move all active canvases to pool
    for (const [id, canvas] of this.canvases) {
      this.canvasPool.push(canvas);
    }
    
    this.canvases.clear();
    
    // Clear composed canvases
    this.composedCanvas = null;
    this.displacementCanvas = null;
    this.normalCanvas = null;
    
    console.log(`🎨 CanvasManager: Cleaned up ${this.canvasPool.length} canvases`);
  }
  
  /**
   * Clear the canvas pool
   */
  clearPool(): void {
    this.canvasPool = [];
    console.log('🎨 CanvasManager: Cleared canvas pool');
  }
}

