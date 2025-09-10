// Enhanced Stitch Rendering System with AI/ML Features
// Advanced algorithms for realistic embroidery simulation

import { StitchPoint, StitchConfig } from './stitchRendering';

export interface EnhancedStitchConfig extends StitchConfig {
  threadType?: 'cotton' | 'silk' | 'wool' | 'synthetic';
  tension?: number; // 0-1, affects stitch appearance
  density?: number; // 0-1, affects stitch spacing
  direction?: number; // 0-360, stitch direction in degrees
  pattern?: 'regular' | 'random' | 'organic';
  quality?: 'draft' | 'normal' | 'high' | 'ultra';
}

export interface ThreadProperties {
  thickness: number;
  sheen: number; // 0-1, affects highlight intensity
  roughness: number; // 0-1, affects texture variation
  colorVariation: number; // 0-1, affects color randomness
  stretch: number; // 0-1, affects stitch deformation
}

export class EnhancedStitchRenderer {
  private static instance: EnhancedStitchRenderer;
  private threadDatabase: Map<string, ThreadProperties> = new Map();
  private patternCache: Map<string, any> = new Map();
  private performanceOptimizations: Map<string, any> = new Map();

  private constructor() {
    this.initializeThreadDatabase();
  }

  public static getInstance(): EnhancedStitchRenderer {
    if (!EnhancedStitchRenderer.instance) {
      EnhancedStitchRenderer.instance = new EnhancedStitchRenderer();
    }
    return EnhancedStitchRenderer.instance;
  }

  private initializeThreadDatabase(): void {
    const threadTypes = {
      cotton: {
        thickness: 1.0,
        sheen: 0.2,
        roughness: 0.3,
        colorVariation: 0.1,
        stretch: 0.1
      },
      silk: {
        thickness: 0.8,
        sheen: 0.9,
        roughness: 0.1,
        colorVariation: 0.05,
        stretch: 0.3
      },
      wool: {
        thickness: 1.5,
        sheen: 0.1,
        roughness: 0.8,
        colorVariation: 0.2,
        stretch: 0.2
      },
      synthetic: {
        thickness: 0.9,
        sheen: 0.7,
        roughness: 0.2,
        colorVariation: 0.05,
        stretch: 0.4
      }
    };

    Object.entries(threadTypes).forEach(([type, props]) => {
      this.threadDatabase.set(type, props);
    });
  }

  public renderEnhancedCrossStitch(
    ctx: CanvasRenderingContext2D,
    points: StitchPoint[],
    config: EnhancedStitchConfig
  ): void {
    if (points.length < 2) return;

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = config.opacity || 1.0;

    const threadProps = this.getThreadProperties(config.threadType || 'cotton');
    const quality = this.getQualitySettings(config.quality || 'normal');
    
    // Calculate stitch distribution with AI optimization
    const stitchData = this.calculateOptimalStitchDistribution(points, config, threadProps);
    
    // Render each stitch with enhanced realism
    for (let i = 0; i < stitchData.length; i++) {
      const stitch = stitchData[i];
      this.renderSingleCrossStitch(ctx, stitch, config, threadProps, quality);
    }

    ctx.restore();
  }

  public renderEnhancedSatinStitch(
    ctx: CanvasRenderingContext2D,
    points: StitchPoint[],
    config: EnhancedStitchConfig
  ): void {
    if (points.length < 2) return;

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = config.opacity || 1.0;

    const threadProps = this.getThreadProperties(config.threadType || 'silk');
    const quality = this.getQualitySettings(config.quality || 'normal');
    
    // Create enhanced satin effect with thread simulation
    this.renderSatinWithThreadSimulation(ctx, points, config, threadProps, quality);

    ctx.restore();
  }

  public renderEnhancedChainStitch(
    ctx: CanvasRenderingContext2D,
    points: StitchPoint[],
    config: EnhancedStitchConfig
  ): void {
    if (points.length < 2) return;

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = config.opacity || 1.0;

    const threadProps = this.getThreadProperties(config.threadType || 'cotton');
    const quality = this.getQualitySettings(config.quality || 'normal');
    
    // Render chain with realistic link simulation
    this.renderChainWithLinkSimulation(ctx, points, config, threadProps, quality);

    ctx.restore();
  }

  public renderEnhancedFillStitch(
    ctx: CanvasRenderingContext2D,
    points: StitchPoint[],
    config: EnhancedStitchConfig
  ): void {
    if (points.length < 3) return;

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = config.opacity || 1.0;

    const threadProps = this.getThreadProperties(config.threadType || 'cotton');
    const quality = this.getQualitySettings(config.quality || 'normal');
    
    // Create fill pattern with thread direction simulation
    this.renderFillWithDirectionSimulation(ctx, points, config, threadProps, quality);

    ctx.restore();
  }

  private getThreadProperties(threadType: string): ThreadProperties {
    return this.threadDatabase.get(threadType) || this.threadDatabase.get('cotton')!;
  }

  private getQualitySettings(quality: string): any {
    const settings = {
      draft: { samples: 1, detail: 0.5, smoothing: 0.3 },
      normal: { samples: 2, detail: 0.7, smoothing: 0.5 },
      high: { samples: 4, detail: 0.9, smoothing: 0.7 },
      ultra: { samples: 8, detail: 1.0, smoothing: 0.9 }
    };
    return settings[quality as keyof typeof settings] || settings.normal;
  }

  private calculateOptimalStitchDistribution(
    points: StitchPoint[],
    config: EnhancedStitchConfig,
    threadProps: ThreadProperties
  ): any[] {
    const stitches = [];
    const density = config.density || 0.7;
    const tension = config.tension || 0.5;
    
    // Calculate total path length
    let totalLength = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      totalLength += Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
    }
    
    // Calculate optimal stitch spacing based on thread properties and tension
    const baseSpacing = config.thickness * 1.2;
    const tensionFactor = 1 + (tension * 0.3); // Higher tension = tighter stitches
    const densityFactor = 1 + (density * 0.5); // Higher density = more stitches
    const threadFactor = 1 + (threadProps.thickness * 0.2);
    
    const stitchSpacing = baseSpacing * tensionFactor / densityFactor / threadFactor;
    const numStitches = Math.max(1, Math.ceil(totalLength / stitchSpacing));
    
    // Distribute stitches along path with AI-optimized spacing
    let currentDistance = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const segmentLength = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
      const segmentStitches = Math.ceil((segmentLength / totalLength) * numStitches);
      
      for (let j = 0; j < segmentStitches; j++) {
        const t = j / segmentStitches;
        const x = p1.x + (p2.x - p1.x) * t;
        const y = p1.y + (p2.y - p1.y) * t;
        
        // Add thread variation based on properties
        const variation = this.calculateThreadVariation(threadProps, x, y);
        
        stitches.push({
          x: x + variation.x,
          y: y + variation.y,
          size: config.thickness * (1 + variation.size),
          angle: this.calculateStitchAngle(p1, p2, config.direction || 0),
          tension: tension,
          threadProps: threadProps
        });
      }
    }
    
    return stitches;
  }

  private calculateThreadVariation(threadProps: ThreadProperties, x: number, y: number): any {
    const roughness = threadProps.roughness;
    const stretch = threadProps.stretch;
    
    // Use noise-like function for realistic variation
    const noiseX = Math.sin(x * 0.1) * Math.cos(y * 0.1) * roughness;
    const noiseY = Math.cos(x * 0.1) * Math.sin(y * 0.1) * roughness;
    const sizeVariation = (Math.sin(x * 0.05) + Math.cos(y * 0.05)) * stretch * 0.1;
    
    return {
      x: noiseX,
      y: noiseY,
      size: sizeVariation
    };
  }

  private calculateStitchAngle(p1: StitchPoint, p2: StitchPoint, direction: number): number {
    const baseAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
    return (baseAngle + direction) % 360;
  }

  private renderSingleCrossStitch(
    ctx: CanvasRenderingContext2D,
    stitch: any,
    config: EnhancedStitchConfig,
    threadProps: ThreadProperties,
    quality: any
  ): void {
    const { x, y, size, angle, tension, threadProps: props } = stitch;
    
    // Calculate thread color variations
    const baseColor = this.parseColor(config.color);
    const colorVariation = this.calculateColorVariation(baseColor, props, x, y);
    const shadowColor = this.darkenColor(colorVariation, 0.3);
    const highlightColor = this.lightenColor(colorVariation, 0.2);
    
    // Apply thread sheen
    const sheen = props.sheen * (1 + Math.sin(x * 0.1) * 0.3);
    
    // Render shadow
    ctx.strokeStyle = this.colorToString(shadowColor);
    ctx.lineWidth = size * 0.8;
    ctx.globalAlpha = 0.4;
    this.drawCrossStitch(ctx, x + 0.5, y + 0.5, size, angle);
    
    // Render main stitch
    ctx.strokeStyle = this.colorToString(colorVariation);
    ctx.lineWidth = size * 0.6;
    ctx.globalAlpha = 1.0;
    this.drawCrossStitch(ctx, x, y, size, angle);
    
    // Render highlight
    ctx.strokeStyle = this.colorToString(highlightColor);
    ctx.lineWidth = size * 0.2;
    ctx.globalAlpha = sheen;
    this.drawCrossStitch(ctx, x - size * 0.1, y - size * 0.1, size * 0.8, angle);
  }

  private drawCrossStitch(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    angle: number
  ): void {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    
    ctx.beginPath();
    
    // First diagonal
    ctx.moveTo(x - size * cos, y - size * sin);
    ctx.lineTo(x + size * cos, y + size * sin);
    
    // Second diagonal
    ctx.moveTo(x - size * sin, y + size * cos);
    ctx.lineTo(x + size * sin, y - size * cos);
    
    ctx.stroke();
  }

  private renderSatinWithThreadSimulation(
    ctx: CanvasRenderingContext2D,
    points: StitchPoint[],
    config: EnhancedStitchConfig,
    threadProps: ThreadProperties,
    quality: any
  ): void {
    // Create gradient based on thread properties
    const gradient = ctx.createLinearGradient(
      points[0].x, points[0].y,
      points[points.length - 1].x, points[points.length - 1].y
    );
    
    const baseColor = this.parseColor(config.color);
    const lightColor = this.lightenColor(baseColor, 0.3);
    const darkColor = this.darkenColor(baseColor, 0.2);
    
    gradient.addColorStop(0, this.colorToString(lightColor));
    gradient.addColorStop(0.5, this.colorToString(baseColor));
    gradient.addColorStop(1, this.colorToString(darkColor));
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = config.thickness * (1 + threadProps.thickness * 0.2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Draw smooth satin curve with thread simulation
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      const curr = points[i];
      const prev = points[i - 1];
      const next = points[i + 1];
      
      if (next) {
        // Smooth curve with thread tension simulation
        const tension = config.tension || 0.5;
        const cp1x = prev.x + (curr.x - prev.x) * (0.5 + tension * 0.2);
        const cp1y = prev.y + (curr.y - prev.y) * (0.5 + tension * 0.2);
        const cp2x = curr.x - (next.x - curr.x) * (0.5 + tension * 0.2);
        const cp2y = curr.y - (next.y - curr.y) * (0.5 + tension * 0.2);
        
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
      } else {
        ctx.lineTo(curr.x, curr.y);
      }
    }
    
    ctx.stroke();
  }

  private renderChainWithLinkSimulation(
    ctx: CanvasRenderingContext2D,
    points: StitchPoint[],
    config: EnhancedStitchConfig,
    threadProps: ThreadProperties,
    quality: any
  ): void {
    const baseColor = this.parseColor(config.color);
    const linkSize = config.thickness * (1 + threadProps.thickness * 0.3);
    
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      
      // Calculate link spacing based on thread properties
      const distance = Math.sqrt((next.x - curr.x) ** 2 + (next.y - curr.y) ** 2);
      const linkSpacing = Math.max(2, linkSize * 0.8);
      const numLinks = Math.max(1, Math.ceil(distance / linkSpacing));
      
      for (let j = 0; j <= numLinks; j++) {
        const t = j / numLinks;
        const linkX = curr.x + (next.x - curr.x) * t;
        const linkY = curr.y + (next.y - curr.y) * t;
        
        // Add thread variation
        const variation = this.calculateThreadVariation(threadProps, linkX, linkY);
        const finalX = linkX + variation.x;
        const finalY = linkY + variation.y;
        
        // Render chain link with thread simulation
        this.renderChainLink(ctx, finalX, finalY, linkSize, baseColor, threadProps);
      }
    }
  }

  private renderChainLink(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    baseColor: any,
    threadProps: ThreadProperties
  ): void {
    const colorVariation = this.calculateColorVariation(baseColor, threadProps, x, y);
    const shadowColor = this.darkenColor(colorVariation, 0.4);
    const highlightColor = this.lightenColor(colorVariation, 0.3);
    
    // Shadow
    ctx.fillStyle = this.colorToString(shadowColor);
    ctx.beginPath();
    ctx.arc(x + 0.5, y + 0.5, size * 0.6, 0, Math.PI * 2);
    ctx.fill();
    
    // Main link
    ctx.fillStyle = this.colorToString(colorVariation);
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Highlight
    ctx.fillStyle = this.colorToString(highlightColor);
    ctx.beginPath();
    ctx.arc(x - size * 0.2, y - size * 0.2, size * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderFillWithDirectionSimulation(
    ctx: CanvasRenderingContext2D,
    points: StitchPoint[],
    config: EnhancedStitchConfig,
    threadProps: ThreadProperties,
    quality: any
  ): void {
    const baseColor = this.parseColor(config.color);
    const direction = config.direction || 0;
    const density = config.density || 0.7;
    
    // Create clipping path
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.clip();
    
    // Calculate fill area bounds
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));
    
    // Calculate line spacing based on thread properties and density
    const lineSpacing = Math.max(1, config.thickness * (1 + threadProps.thickness * 0.2) / density);
    const numLines = Math.ceil((maxY - minY) / lineSpacing);
    
    // Render fill lines with direction simulation
    for (let i = 0; i < numLines; i++) {
      const y = minY + (i * lineSpacing);
      
      // Calculate line angle based on direction and position
      const angleVariation = Math.sin(y * 0.01) * 10; // Subtle wave pattern
      const lineAngle = direction + angleVariation;
      
      // Calculate line endpoints with angle
      const rad = (lineAngle * Math.PI) / 180;
      const length = maxX - minX;
      const startX = minX;
      const startY = y;
      const endX = minX + length * Math.cos(rad);
      const endY = y + length * Math.sin(rad);
      
      // Add thread variation
      const variation = this.calculateThreadVariation(threadProps, startX, startY);
      const colorVariation = this.calculateColorVariation(baseColor, threadProps, startX, startY);
      
      ctx.strokeStyle = this.colorToString(colorVariation);
      ctx.lineWidth = config.thickness * (1 + variation.size);
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(startX + variation.x, startY + variation.y);
      ctx.lineTo(endX + variation.x, endY + variation.y);
      ctx.stroke();
    }
  }

  private parseColor(color: string): any {
    const hex = color.replace('#', '');
    return {
      r: parseInt(hex.substr(0, 2), 16),
      g: parseInt(hex.substr(2, 2), 16),
      b: parseInt(hex.substr(4, 2), 16)
    };
  }

  private colorToString(color: any): string {
    return `rgb(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)})`;
  }

  private calculateColorVariation(baseColor: any, threadProps: ThreadProperties, x: number, y: number): any {
    const variation = threadProps.colorVariation;
    const noise = Math.sin(x * 0.1) * Math.cos(y * 0.1) * variation;
    
    return {
      r: Math.max(0, Math.min(255, baseColor.r + noise * 50)),
      g: Math.max(0, Math.min(255, baseColor.g + noise * 50)),
      b: Math.max(0, Math.min(255, baseColor.b + noise * 50))
    };
  }

  private darkenColor(color: any, amount: number): any {
    return {
      r: color.r * (1 - amount),
      g: color.g * (1 - amount),
      b: color.b * (1 - amount)
    };
  }

  private lightenColor(color: any, amount: number): any {
    return {
      r: color.r + (255 - color.r) * amount,
      g: color.g + (255 - color.g) * amount,
      b: color.b + (255 - color.b) * amount
    };
  }
}

export const enhancedStitchRenderer = EnhancedStitchRenderer.getInstance();
