/**
 * Layer Integration Service
 * Connects the new layer system with existing tools (brush, puff, embroidery, vector)
 */

import { useLayerManager } from '../stores/LayerManager';
import { useApp } from '../App';
import { LayerType } from '../types/LayerSystem';

export class LayerIntegrationService {
  private static instance: LayerIntegrationService;
  private layerManager: ReturnType<typeof useLayerManager>;
  private appStore: ReturnType<typeof useApp>;

  private constructor() {
    this.layerManager = useLayerManager.getState();
    this.appStore = useApp.getState();
  }

  public static getInstance(): LayerIntegrationService {
    if (!LayerIntegrationService.instance) {
      LayerIntegrationService.instance = new LayerIntegrationService();
    }
    return LayerIntegrationService.instance;
  }

  /**
   * Get the active layer for the current tool
   */
  public getActiveLayerForTool(tool: string) {
    const { activeLayerId, layers } = this.layerManager as any;
    
    if (!activeLayerId) {
      // Create a default layer for the tool if none exists
      return this.createLayerForTool(tool);
    }

    const layer = layers.get(activeLayerId);
    if (!layer) {
      return this.createLayerForTool(tool);
    }

    // Check if the layer type matches the tool
    const expectedType = this.getLayerTypeForTool(tool);
    if (layer.type !== expectedType) {
      // Create a new layer of the correct type
      return this.createLayerForTool(tool);
    }

    return layer;
  }

  /**
   * Create a new layer for a specific tool
   */
  public createLayerForTool(tool: string) {
    const layerType = this.getLayerTypeForTool(tool);
    const layerName = this.getDefaultLayerName(tool);
    
    return (this.layerManager as any).createLayer(layerType, layerName);
  }

  /**
   * Get the appropriate layer type for a tool
   */
  private getLayerTypeForTool(tool: string): LayerType {
    switch (tool) {
      case 'brush':
      case 'eraser':
        return 'raster';
      case 'puffPrint':
        return 'puff';
      case 'embroidery':
        return 'embroidery';
      case 'vector':
        return 'vector';
      case 'text':
        return 'text';
      default:
        return 'raster';
    }
  }

  /**
   * Get default layer name for a tool
   */
  private getDefaultLayerName(tool: string): string {
    switch (tool) {
      case 'brush':
        return 'Paint Layer';
      case 'eraser':
        return 'Eraser Layer';
      case 'puffPrint':
        return 'Puff Print Layer';
      case 'embroidery':
        return 'Embroidery Layer';
      case 'vector':
        return 'Vector Layer';
      case 'text':
        return 'Text Layer';
      default:
        return 'New Layer';
    }
  }

  /**
   * Paint on the active layer for brush tool
   */
  public paintOnActiveLayer(uv: { u: number; v: number }, brushData: {
    color: string;
    size: number;
    opacity: number;
    shape: string;
    pressure?: number;
  }) {
    const layer = this.getActiveLayerForTool('brush');
    const { layers } = this.layerManager as any;
    const rasterLayer = layers.get(layer);
    
    if (!rasterLayer || rasterLayer.type !== 'raster' || !rasterLayer.canvas) {
      console.warn('No valid raster layer found for painting');
      return;
    }

    const canvas = rasterLayer.canvas;
    const ctx = canvas.getContext('2d')!;
    
    const x = Math.round(uv.u * canvas.width);
    const y = Math.round(uv.v * canvas.height);
    const size = brushData.pressure ? brushData.size * brushData.pressure : brushData.size;
    const opacity = brushData.pressure ? brushData.opacity * brushData.pressure : brushData.opacity;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = brushData.color;
    
    // Apply brush shape
    switch (brushData.shape) {
      case 'round':
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'square':
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
        break;
      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(x, y - size / 2);
        ctx.lineTo(x + size / 2, y);
        ctx.lineTo(x, y + size / 2);
        ctx.lineTo(x - size / 2, y);
        ctx.closePath();
        ctx.fill();
        break;
    }
    
    ctx.restore();

    // Add to brush history
    const brushHistoryEntry = {
      id: Math.random().toString(36).slice(2),
      timestamp: new Date(),
      operation: 'stroke' as const,
      data: { uv, brushData }
    };

    const updatedLayer = {
      ...rasterLayer,
      brushHistory: [...rasterLayer.brushHistory, brushHistoryEntry],
      modifiedAt: new Date()
    };

    (this.layerManager as any).layers.set(layer, updatedLayer);
    (this.layerManager as any).invalidateComposition();
  }

  /**
   * Apply puff print to the active layer
   */
  public applyPuffPrint(uv: { u: number; v: number }, puffData: {
    height: number;
    curvature: number;
    shape: 'round' | 'square' | 'diamond';
    color: string;
    size: number;
    opacity: number;
  }) {
    const layer = this.getActiveLayerForTool('puffPrint');
    const { layers } = this.layerManager as any;
    const puffLayer = layers.get(layer);
    
    if (!puffLayer || puffLayer.type !== 'puff') {
      console.warn('No valid puff layer found for puff printing');
      return;
    }

    const canvas = puffLayer.canvas;
    const displacementCanvas = puffLayer.displacementCanvas;
    
    if (!canvas || !displacementCanvas) {
      console.warn('Puff layer missing canvas or displacement canvas');
      return;
    }

    const x = Math.round(uv.u * canvas.width);
    const y = Math.round(uv.v * canvas.height);

    // Apply puff texture
    const ctx = canvas.getContext('2d')!;
    ctx.save();
    ctx.globalAlpha = puffData.opacity;
    ctx.fillStyle = puffData.color;
    
    // Create puff shape
    switch (puffData.shape) {
      case 'round':
        ctx.beginPath();
        ctx.arc(x, y, puffData.size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'square':
        ctx.fillRect(x - puffData.size / 2, y - puffData.size / 2, puffData.size, puffData.size);
        break;
      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(x, y - puffData.size / 2);
        ctx.lineTo(x + puffData.size / 2, y);
        ctx.lineTo(x, y + puffData.size / 2);
        ctx.lineTo(x - puffData.size / 2, y);
        ctx.closePath();
        ctx.fill();
        break;
    }
    ctx.restore();

    // Apply displacement map
    const displacementCtx = displacementCanvas.getContext('2d')!;
    displacementCtx.save();
    displacementCtx.globalAlpha = puffData.opacity;
    
    // Create displacement based on height
    const displacementValue = Math.round(puffData.height * 255);
    displacementCtx.fillStyle = `rgb(${displacementValue}, ${displacementValue}, ${displacementValue})`;
    
    switch (puffData.shape) {
      case 'round':
        displacementCtx.beginPath();
        displacementCtx.arc(x, y, puffData.size / 2, 0, Math.PI * 2);
        displacementCtx.fill();
        break;
      case 'square':
        displacementCtx.fillRect(x - puffData.size / 2, y - puffData.size / 2, puffData.size, puffData.size);
        break;
      case 'diamond':
        displacementCtx.beginPath();
        displacementCtx.moveTo(x, y - puffData.size / 2);
        displacementCtx.lineTo(x + puffData.size / 2, y);
        displacementCtx.lineTo(x, y + puffData.size / 2);
        displacementCtx.lineTo(x - puffData.size / 2, y);
        displacementCtx.closePath();
        displacementCtx.fill();
        break;
    }
    displacementCtx.restore();

    // Update layer properties
    const updatedLayer = {
      ...puffLayer,
      height: puffData.height,
      curvature: puffData.curvature,
      shape: puffData.shape,
      color: puffData.color,
      modifiedAt: new Date()
    };

    (this.layerManager as any).layers.set(layer, updatedLayer);
    (this.layerManager as any).invalidateComposition();
  }

  /**
   * Add embroidery stitch to the active layer
   */
  public addEmbroideryStitch(uv: { u: number; v: number }, stitchData: {
    type: 'satin' | 'fill' | 'outline' | 'cross-stitch';
    threadColor: string;
    thickness: number;
    points: Array<{ x: number; y: number }>;
  }) {
    const layer = this.getActiveLayerForTool('embroidery');
    const { layers } = this.layerManager as any;
    const embroideryLayer = layers.get(layer);
    
    if (!embroideryLayer || embroideryLayer.type !== 'embroidery') {
      console.warn('No valid embroidery layer found for embroidery');
      return;
    }

    const newStitch = {
      id: Math.random().toString(36).slice(2),
      type: stitchData.type,
      points: stitchData.points,
      threadColor: stitchData.threadColor,
      thickness: stitchData.thickness
    };

    const updatedLayer = {
      ...embroideryLayer,
      stitches: [...embroideryLayer.stitches, newStitch],
      modifiedAt: new Date()
    };

    (this.layerManager as any).layers.set(layer, updatedLayer);
    (this.layerManager as any).invalidateComposition();
  }

  /**
   * Add vector path to the active layer
   */
  public addVectorPath(points: Array<{ x: number; y: number; type: 'corner' | 'smooth' }>, pathData: {
    strokeColor: string;
    fillColor: string;
    strokeWidth: number;
    closed: boolean;
  }) {
    const layer = this.getActiveLayerForTool('vector');
    const { layers } = this.layerManager as any;
    const vectorLayer = layers.get(layer);
    
    if (!vectorLayer || vectorLayer.type !== 'vector') {
      console.warn('No valid vector layer found for vector drawing');
      return;
    }

    const newPath = {
      id: Math.random().toString(36).slice(2),
      points,
      closed: pathData.closed,
      strokeColor: pathData.strokeColor,
      fillColor: pathData.fillColor,
      strokeWidth: pathData.strokeWidth
    };

    const updatedLayer = {
      ...vectorLayer,
      paths: [...vectorLayer.paths, newPath],
      modifiedAt: new Date()
    };

    (this.layerManager as any).layers.set(layer, updatedLayer);
    (this.layerManager as any).invalidateComposition();
  }

  /**
   * Add text to the active layer
   */
  public addText(text: string, position: { x: number; y: number }, textData: {
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    fontStyle: string;
    color: string;
    alignment: 'left' | 'center' | 'right';
  }) {
    const layer = this.getActiveLayerForTool('text');
    const { layers } = this.layerManager as any;
    const textLayer = layers.get(layer);
    
    if (!textLayer || textLayer.type !== 'text') {
      console.warn('No valid text layer found for text');
      return;
    }

    const updatedLayer = {
      ...textLayer,
      content: text,
      fontFamily: textData.fontFamily,
      fontSize: textData.fontSize,
      fontWeight: textData.fontWeight,
      fontStyle: textData.fontStyle,
      color: textData.color,
      alignment: textData.alignment,
      transform: {
        ...textLayer.transform,
        x: position.x,
        y: position.y
      },
      modifiedAt: new Date()
    };

    (this.layerManager as any).layers.set(layer, updatedLayer);
    (this.layerManager as any).invalidateComposition();
  }

  /**
   * Get canvas for tool-specific operations
   */
  public getCanvasForTool(tool: string): HTMLCanvasElement | null {
    const layer = this.getActiveLayerForTool(tool);
    const { layers } = this.layerManager as any;
    const layerData = layers.get(layer);
    
    if (!layerData) return null;

    switch (layerData.type) {
      case 'raster':
      case 'puff':
        return layerData.canvas || null;
      default:
        return null;
    }
  }

  /**
   * Get displacement canvas for puff print
   */
  public getDisplacementCanvasForPuff(): HTMLCanvasElement | null {
    const layer = this.getActiveLayerForTool('puffPrint');
    const { layers } = this.layerManager as any;
    const puffLayer = layers.get(layer);
    
    if (puffLayer && puffLayer.type === 'puff' && 'displacementCanvas' in puffLayer) {
      return puffLayer.displacementCanvas || null;
    }
    
    return null;
  }

  /**
   * Compose all layers and return the final canvas
   */
  public composeAllLayers(): HTMLCanvasElement | null {
    (this.layerManager as any).composeLayers();
    return (this.layerManager as any).composedCanvas;
  }

  /**
   * Sync layer system with existing app state
   */
  public syncWithAppState() {
    // This method can be used to sync the new layer system with existing app state
    // For now, we'll keep them separate but this provides a bridge if needed
  }
}

// Export singleton instance
export const layerIntegration = LayerIntegrationService.getInstance();




