/**
 * 🎯 Universal Media Integration System
 * 
 * Universal system that works with all media types:
 * - Print (digital, screen, offset, etc.)
 * - Stitches (embroidery, cross-stitch, satin, etc.)
 * - Colors (RGB, CMYK, Pantone, etc.)
 * - Puffs (3D effects, embossing, etc.)
 * - Brushes (paint, digital, texture, etc.)
 * - Textures (fabric, leather, metal, etc.)
 */

export interface MediaType {
  id: string;
  name: string;
  category: 'print' | 'stitch' | 'color' | 'puff' | 'brush' | 'texture' | 'effect';
  properties: MediaProperties;
  renderer: MediaRenderer;
  converter: MediaConverter;
}

export interface MediaProperties {
  colorSpace: 'RGB' | 'CMYK' | 'LAB' | 'HSV' | 'Pantone';
  opacity: number;
  blendMode: string;
  resolution: number;
  units: 'px' | 'mm' | 'inch' | 'pt';
  [key: string]: any;
}

export interface MediaRenderer {
  render(context: CanvasRenderingContext2D, data: any, properties: MediaProperties): void;
  preview(context: CanvasRenderingContext2D, data: any, properties: MediaProperties): void;
  validate(data: any): boolean;
}

export interface MediaConverter {
  convert(from: MediaType, to: MediaType, data: any): any;
  canConvert(from: MediaType, to: MediaType): boolean;
}

export class UniversalMediaIntegration {
  private static instance: UniversalMediaIntegration;
  
  private mediaTypes: Map<string, MediaType> = new Map();
  private activeMediaType: MediaType | null = null;
  private renderers: Map<string, MediaRenderer> = new Map();
  private converters: Map<string, MediaConverter> = new Map();
  
  // Event system
  private eventListeners: Map<string, Function[]> = new Map();
  
  constructor() {
    this.initializeMediaTypes();
  }
  
  static getInstance(): UniversalMediaIntegration {
    if (!UniversalMediaIntegration.instance) {
      UniversalMediaIntegration.instance = new UniversalMediaIntegration();
    }
    return UniversalMediaIntegration.instance;
  }
  
  private initializeMediaTypes(): void {
    // Print media types
    this.registerMediaType({
      id: 'digital_print',
      name: 'Digital Print',
      category: 'print',
      properties: {
        colorSpace: 'RGB',
        opacity: 1.0,
        blendMode: 'normal',
        resolution: 300,
        units: 'px'
      },
      renderer: new DigitalPrintRenderer(),
      converter: new DigitalPrintConverter()
    });
    
    // Stitch media types
    this.registerMediaType({
      id: 'cross_stitch',
      name: 'Cross Stitch',
      category: 'stitch',
      properties: {
        colorSpace: 'RGB',
        opacity: 1.0,
        blendMode: 'normal',
        resolution: 72,
        units: 'px',
        stitchType: 'cross',
        threadCount: 14
      },
      renderer: new CrossStitchRenderer(),
      converter: new CrossStitchConverter()
    });
    
    this.registerMediaType({
      id: 'satin_stitch',
      name: 'Satin Stitch',
      category: 'stitch',
      properties: {
        colorSpace: 'RGB',
        opacity: 1.0,
        blendMode: 'normal',
        resolution: 72,
        units: 'px',
        stitchType: 'satin',
        density: 0.5
      },
      renderer: new SatinStitchRenderer(),
      converter: new SatinStitchConverter()
    });
    
    // Color media types
    this.registerMediaType({
      id: 'rgb_color',
      name: 'RGB Color',
      category: 'color',
      properties: {
        colorSpace: 'RGB',
        opacity: 1.0,
        blendMode: 'normal',
        resolution: 72,
        units: 'px'
      },
      renderer: new RGBColorRenderer(),
      converter: new RGBColorConverter()
    });
    
    this.registerMediaType({
      id: 'cmyk_color',
      name: 'CMYK Color',
      category: 'color',
      properties: {
        colorSpace: 'CMYK',
        opacity: 1.0,
        blendMode: 'normal',
        resolution: 300,
        units: 'px'
      },
      renderer: new CMYKColorRenderer(),
      converter: new CMYKColorConverter()
    });
    
    // Puff media types
    this.registerMediaType({
      id: 'puff_embroidery',
      name: 'Puff Embroidery',
      category: 'puff',
      properties: {
        colorSpace: 'RGB',
        opacity: 1.0,
        blendMode: 'normal',
        resolution: 72,
        units: 'px',
        puffHeight: 2.0,
        puffDensity: 0.8
      },
      renderer: new PuffEmbroideryRenderer(),
      converter: new PuffEmbroideryConverter()
    });
    
    // Brush media types
    this.registerMediaType({
      id: 'paint_brush',
      name: 'Paint Brush',
      category: 'brush',
      properties: {
        colorSpace: 'RGB',
        opacity: 1.0,
        blendMode: 'normal',
        resolution: 72,
        units: 'px',
        brushSize: 10,
        brushHardness: 0.5
      },
      renderer: new PaintBrushRenderer(),
      converter: new PaintBrushConverter()
    });
  }
  
  registerMediaType(mediaType: MediaType): void {
    this.mediaTypes.set(mediaType.id, mediaType);
    this.renderers.set(mediaType.id, mediaType.renderer);
    this.converters.set(mediaType.id, mediaType.converter);
    
    this.emit('mediaType:registered', { mediaType });
  }
  
  setActiveMediaType(mediaTypeId: string): boolean {
    const mediaType = this.mediaTypes.get(mediaTypeId);
    if (!mediaType) {
      return false;
    }
    
    this.activeMediaType = mediaType;
    this.emit('mediaType:changed', { mediaType });
    
    return true;
  }
  
  getActiveMediaType(): MediaType | null {
    return this.activeMediaType;
  }
  
  getAllMediaTypes(): MediaType[] {
    return Array.from(this.mediaTypes.values());
  }
  
  getMediaTypesByCategory(category: string): MediaType[] {
    return Array.from(this.mediaTypes.values()).filter(mt => mt.category === category);
  }
  
  render(context: CanvasRenderingContext2D, data: any, mediaTypeId?: string): boolean {
    const mediaType = mediaTypeId ? this.mediaTypes.get(mediaTypeId) : this.activeMediaType;
    if (!mediaType) {
      return false;
    }
    
    const renderer = this.renderers.get(mediaType.id);
    if (!renderer) {
      return false;
    }
    
    try {
      renderer.render(context, data, mediaType.properties);
      return true;
    } catch (error) {
      console.error(`Error rendering ${mediaType.name}:`, error);
      return false;
    }
  }
  
  convert(data: any, fromMediaTypeId: string, toMediaTypeId: string): any {
    const fromMediaType = this.mediaTypes.get(fromMediaTypeId);
    const toMediaType = this.mediaTypes.get(toMediaTypeId);
    
    if (!fromMediaType || !toMediaType) {
      return null;
    }
    
    const converter = this.converters.get(fromMediaType.id);
    if (!converter || !converter.canConvert(fromMediaType, toMediaType)) {
      return null;
    }
    
    try {
      return converter.convert(fromMediaType, toMediaType, data);
    } catch (error) {
      console.error(`Error converting from ${fromMediaType.name} to ${toMediaType.name}:`, error);
      return null;
    }
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
          console.error(`Error in UniversalMediaIntegration event listener for ${event}:`, error);
        }
      });
    }
  }
}

// ============================================================================
// RENDERER IMPLEMENTATIONS
// ============================================================================

class DigitalPrintRenderer implements MediaRenderer {
  render(context: CanvasRenderingContext2D, data: any, properties: MediaProperties): void {
    context.save();
    context.globalAlpha = properties.opacity;
    context.globalCompositeOperation = properties.blendMode;
    
    // Render digital print
    if (data.paths) {
      data.paths.forEach((path: any) => {
        this.renderPath(context, path, properties);
      });
    }
    
    context.restore();
  }
  
  preview(context: CanvasRenderingContext2D, data: any, properties: MediaProperties): void {
    // Simplified preview for digital print
    this.render(context, data, properties);
  }
  
  validate(data: any): boolean {
    return data && data.paths && Array.isArray(data.paths);
  }
  
  private renderPath(context: CanvasRenderingContext2D, path: any, properties: MediaProperties): void {
    if (!path.points || path.points.length === 0) return;
    
    context.beginPath();
    context.moveTo(path.points[0].x, path.points[0].y);
    
    for (let i = 1; i < path.points.length; i++) {
      context.lineTo(path.points[i].x, path.points[i].y);
    }
    
    if (path.closed) {
      context.closePath();
    }
    
    context.strokeStyle = path.style?.stroke || '#000000';
    context.lineWidth = path.style?.strokeWidth || 2;
    context.stroke();
  }
}

class CrossStitchRenderer implements MediaRenderer {
  render(context: CanvasRenderingContext2D, data: any, properties: MediaProperties): void {
    context.save();
    context.globalAlpha = properties.opacity;
    
    if (data.paths) {
      data.paths.forEach((path: any) => {
        this.renderCrossStitchPath(context, path, properties);
      });
    }
    
    context.restore();
  }
  
  preview(context: CanvasRenderingContext2D, data: any, properties: MediaProperties): void {
    // Simplified preview for cross stitch
    this.render(context, data, properties);
  }
  
  validate(data: any): boolean {
    return data && data.paths && Array.isArray(data.paths);
  }
  
  private renderCrossStitchPath(context: CanvasRenderingContext2D, path: any, properties: MediaProperties): void {
    if (!path.points || path.points.length === 0) return;
    
    const threadCount = properties.threadCount || 14;
    const stitchSize = 1 / threadCount;
    
    for (let i = 0; i < path.points.length - 1; i++) {
      const start = path.points[i];
      const end = path.points[i + 1];
      
      this.renderCrossStitch(context, start, end, stitchSize, path.style?.stroke || '#000000');
    }
  }
  
  private renderCrossStitch(context: CanvasRenderingContext2D, start: any, end: any, size: number, color: string): void {
    context.strokeStyle = color;
    context.lineWidth = size;
    
    // Draw X pattern
    context.beginPath();
    context.moveTo(start.x - size/2, start.y - size/2);
    context.lineTo(start.x + size/2, start.y + size/2);
    context.moveTo(start.x + size/2, start.y - size/2);
    context.lineTo(start.x - size/2, start.y + size/2);
    context.stroke();
  }
}

class SatinStitchRenderer implements MediaRenderer {
  render(context: CanvasRenderingContext2D, data: any, properties: MediaProperties): void {
    context.save();
    context.globalAlpha = properties.opacity;
    
    if (data.paths) {
      data.paths.forEach((path: any) => {
        this.renderSatinStitchPath(context, path, properties);
      });
    }
    
    context.restore();
  }
  
  preview(context: CanvasRenderingContext2D, data: any, properties: MediaProperties): void {
    this.render(context, data, properties);
  }
  
  validate(data: any): boolean {
    return data && data.paths && Array.isArray(data.paths);
  }
  
  private renderSatinStitchPath(context: CanvasRenderingContext2D, path: any, properties: MediaProperties): void {
    if (!path.points || path.points.length === 0) return;
    
    const density = properties.density || 0.5;
    const stitchWidth = 2 * density;
    
    context.strokeStyle = path.style?.stroke || '#000000';
    context.lineWidth = stitchWidth;
    context.lineCap = 'round';
    
    context.beginPath();
    context.moveTo(path.points[0].x, path.points[0].y);
    
    for (let i = 1; i < path.points.length; i++) {
      context.lineTo(path.points[i].x, path.points[i].y);
    }
    
    context.stroke();
  }
}

class RGBColorRenderer implements MediaRenderer {
  render(context: CanvasRenderingContext2D, data: any, properties: MediaProperties): void {
    context.save();
    context.globalAlpha = properties.opacity;
    
    if (data.color) {
      context.fillStyle = data.color;
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    }
    
    context.restore();
  }
  
  preview(context: CanvasRenderingContext2D, data: any, properties: MediaProperties): void {
    this.render(context, data, properties);
  }
  
  validate(data: any): boolean {
    return data && data.color;
  }
}

class CMYKColorRenderer implements MediaRenderer {
  render(context: CanvasRenderingContext2D, data: any, properties: MediaProperties): void {
    context.save();
    context.globalAlpha = properties.opacity;
    
    if (data.cmyk) {
      const rgb = this.cmykToRgb(data.cmyk);
      context.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    }
    
    context.restore();
  }
  
  preview(context: CanvasRenderingContext2D, data: any, properties: MediaProperties): void {
    this.render(context, data, properties);
  }
  
  validate(data: any): boolean {
    return data && data.cmyk;
  }
  
  private cmykToRgb(cmyk: any): { r: number; g: number; b: number } {
    const c = cmyk.c / 100;
    const m = cmyk.m / 100;
    const y = cmyk.y / 100;
    const k = cmyk.k / 100;
    
    const r = Math.round(255 * (1 - c) * (1 - k));
    const g = Math.round(255 * (1 - m) * (1 - k));
    const b = Math.round(255 * (1 - y) * (1 - k));
    
    return { r, g, b };
  }
}

class PuffEmbroideryRenderer implements MediaRenderer {
  render(context: CanvasRenderingContext2D, data: any, properties: MediaProperties): void {
    context.save();
    context.globalAlpha = properties.opacity;
    
    if (data.paths) {
      data.paths.forEach((path: any) => {
        this.renderPuffEmbroideryPath(context, path, properties);
      });
    }
    
    context.restore();
  }
  
  preview(context: CanvasRenderingContext2D, data: any, properties: MediaProperties): void {
    this.render(context, data, properties);
  }
  
  validate(data: any): boolean {
    return data && data.paths && Array.isArray(data.paths);
  }
  
  private renderPuffEmbroideryPath(context: CanvasRenderingContext2D, path: any, properties: MediaProperties): void {
    if (!path.points || path.points.length === 0) return;
    
    const puffHeight = properties.puffHeight || 2.0;
    const puffDensity = properties.puffDensity || 0.8;
    
    // Render base stitch
    context.strokeStyle = path.style?.stroke || '#000000';
    context.lineWidth = 2;
    context.lineCap = 'round';
    
    context.beginPath();
    context.moveTo(path.points[0].x, path.points[0].y);
    
    for (let i = 1; i < path.points.length; i++) {
      context.lineTo(path.points[i].x, path.points[i].y);
    }
    
    context.stroke();
    
    // Add puff effect (simplified)
    context.shadowColor = path.style?.stroke || '#000000';
    context.shadowBlur = puffHeight * 2;
    context.shadowOffsetX = puffHeight;
    context.shadowOffsetY = puffHeight;
    
    context.stroke();
  }
}

class PaintBrushRenderer implements MediaRenderer {
  render(context: CanvasRenderingContext2D, data: any, properties: MediaProperties): void {
    context.save();
    context.globalAlpha = properties.opacity;
    
    if (data.strokes) {
      data.strokes.forEach((stroke: any) => {
        this.renderBrushStroke(context, stroke, properties);
      });
    }
    
    context.restore();
  }
  
  preview(context: CanvasRenderingContext2D, data: any, properties: MediaProperties): void {
    this.render(context, data, properties);
  }
  
  validate(data: any): boolean {
    return data && data.strokes && Array.isArray(data.strokes);
  }
  
  private renderBrushStroke(context: CanvasRenderingContext2D, stroke: any, properties: MediaProperties): void {
    if (!stroke.points || stroke.points.length === 0) return;
    
    const brushSize = properties.brushSize || 10;
    const brushHardness = properties.brushHardness || 0.5;
    
    context.strokeStyle = stroke.color || '#000000';
    context.lineWidth = brushSize;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    
    context.beginPath();
    context.moveTo(stroke.points[0].x, stroke.points[0].y);
    
    for (let i = 1; i < stroke.points.length; i++) {
      context.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    
    context.stroke();
  }
}

// ============================================================================
// CONVERTER IMPLEMENTATIONS
// ============================================================================

class DigitalPrintConverter implements MediaConverter {
  convert(from: MediaType, to: MediaType, data: any): any {
    // Convert to digital print format
    return data;
  }
  
  canConvert(from: MediaType, to: MediaType): boolean {
    return to.category === 'print';
  }
}

class CrossStitchConverter implements MediaConverter {
  convert(from: MediaType, to: MediaType, data: any): any {
    // Convert to cross stitch format
    return data;
  }
  
  canConvert(from: MediaType, to: MediaType): boolean {
    return to.category === 'stitch';
  }
}

class SatinStitchConverter implements MediaConverter {
  convert(from: MediaType, to: MediaType, data: any): any {
    // Convert to satin stitch format
    return data;
  }
  
  canConvert(from: MediaType, to: MediaType): boolean {
    return to.category === 'stitch';
  }
}

class RGBColorConverter implements MediaConverter {
  convert(from: MediaType, to: MediaType, data: any): any {
    // Convert to RGB color format
    return data;
  }
  
  canConvert(from: MediaType, to: MediaType): boolean {
    return to.category === 'color';
  }
}

class CMYKColorConverter implements MediaConverter {
  convert(from: MediaType, to: MediaType, data: any): any {
    // Convert to CMYK color format
    return data;
  }
  
  canConvert(from: MediaType, to: MediaType): boolean {
    return to.category === 'color';
  }
}

class PuffEmbroideryConverter implements MediaConverter {
  convert(from: MediaType, to: MediaType, data: any): any {
    // Convert to puff embroidery format
    return data;
  }
  
  canConvert(from: MediaType, to: MediaType): boolean {
    return to.category === 'puff';
  }
}

class PaintBrushConverter implements MediaConverter {
  convert(from: MediaType, to: MediaType, data: any): any {
    // Convert to paint brush format
    return data;
  }
  
  canConvert(from: MediaType, to: MediaType): boolean {
    return to.category === 'brush';
  }
}

export default UniversalMediaIntegration;
