/**
 * 🎨 ADVANCED LAYER EFFECTS SYSTEM
 * 
 * Provides Photoshop-level layer effects including:
 * - Drop Shadow & Inner Shadow
 * - Outer Glow & Inner Glow
 * - Bevel & Emboss
 * - Stroke
 * - Color Overlay
 * - Gradient Overlay
 * - Pattern Overlay
 * - Advanced blend modes
 */

import * as THREE from 'three';

// ============================================================================
// EFFECT TYPES & INTERFACES
// ============================================================================

export interface DropShadowEffect {
  id: string;
  type: 'drop-shadow';
  enabled: boolean;
  settings: {
    color: string;
    opacity: number;
    angle: number;
    distance: number;
    spread: number;
    size: number;
    noise: number;
    antiAlias: boolean;
  };
}

export interface InnerShadowEffect {
  id: string;
  type: 'inner-shadow';
  enabled: boolean;
  settings: {
    color: string;
    opacity: number;
    angle: number;
    distance: number;
    choke: number;
    size: number;
    noise: number;
    antiAlias: boolean;
  };
}

export interface OuterGlowEffect {
  id: string;
  type: 'outer-glow';
  enabled: boolean;
  settings: {
    color: string;
    opacity: number;
    technique: 'softer' | 'precise';
    spread: number;
    size: number;
    noise: number;
    antiAlias: boolean;
  };
}

export interface InnerGlowEffect {
  id: string;
  type: 'inner-glow';
  enabled: boolean;
  settings: {
    color: string;
    opacity: number;
    technique: 'softer' | 'precise';
    choke: number;
    size: number;
    noise: number;
    antiAlias: boolean;
  };
}

export interface BevelEmbossEffect {
  id: string;
  type: 'bevel-emboss';
  enabled: boolean;
  settings: {
    style: 'outer-bevel' | 'inner-bevel' | 'emboss' | 'pillow-emboss';
    technique: 'smooth' | 'chisel-hard' | 'chisel-soft';
    depth: number;
    direction: 'up' | 'down';
    size: number;
    soften: number;
    angle: number;
    altitude: number;
    highlightMode: string;
    highlightOpacity: number;
    highlightColor: string;
    shadowMode: string;
    shadowOpacity: number;
    shadowColor: string;
  };
}

export interface StrokeEffect {
  id: string;
  type: 'stroke';
  enabled: boolean;
  settings: {
    size: number;
    position: 'inside' | 'center' | 'outside';
    blendMode: string;
    opacity: number;
    fillType: 'color' | 'gradient' | 'pattern';
    color?: string;
    gradient?: GradientData;
    pattern?: PatternData;
  };
}

export interface ColorOverlayEffect {
  id: string;
  type: 'color-overlay';
  enabled: boolean;
  settings: {
    color: string;
    blendMode: string;
    opacity: number;
  };
}

export interface GradientOverlayEffect {
  id: string;
  type: 'gradient-overlay';
  enabled: boolean;
  settings: {
    gradient: GradientData;
    blendMode: string;
    opacity: number;
    style: 'linear' | 'radial' | 'angle' | 'reflected' | 'diamond';
    angle: number;
    scale: number;
    reverse: boolean;
    alignWithLayer: boolean;
  };
}

export interface PatternOverlayEffect {
  id: string;
  type: 'pattern-overlay';
  enabled: boolean;
  settings: {
    pattern: PatternData;
    blendMode: string;
    opacity: number;
    scale: number;
    linkWithLayer: boolean;
  };
}

export interface GradientData {
  type: 'linear' | 'radial' | 'conic';
  stops: Array<{
    color: string;
    position: number;
    opacity: number;
  }>;
  angle?: number;
  centerX?: number;
  centerY?: number;
}

export interface PatternData {
  id: string;
  name: string;
  image: HTMLImageElement;
  width: number;
  height: number;
}

export type LayerEffect = 
  | DropShadowEffect 
  | InnerShadowEffect 
  | OuterGlowEffect 
  | InnerGlowEffect 
  | BevelEmbossEffect 
  | StrokeEffect 
  | ColorOverlayEffect 
  | GradientOverlayEffect 
  | PatternOverlayEffect;

// ============================================================================
// EFFECT RENDERER CLASS
// ============================================================================

export class LayerEffectRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private tempCanvas: HTMLCanvasElement;
  private tempCtx: CanvasRenderingContext2D;

  constructor(width: number = 1024, height: number = 1024) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d')!;

    this.tempCanvas = document.createElement('canvas');
    this.tempCanvas.width = width;
    this.tempCanvas.height = height;
    this.tempCtx = this.tempCanvas.getContext('2d')!;
  }

  /**
   * Render all effects for a layer
   */
  renderEffects(sourceCanvas: HTMLCanvasElement, effects: LayerEffect[]): HTMLCanvasElement {
    // Clear the result canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Start with the source layer
    this.ctx.drawImage(sourceCanvas, 0, 0);

    // Apply effects in order
    for (const effect of effects) {
      if (!effect.enabled) continue;

      switch (effect.type) {
        case 'drop-shadow':
          this.renderDropShadow(effect);
          break;
        case 'inner-shadow':
          this.renderInnerShadow(effect);
          break;
        case 'outer-glow':
          this.renderOuterGlow(effect);
          break;
        case 'inner-glow':
          this.renderInnerGlow(effect);
          break;
        case 'bevel-emboss':
          this.renderBevelEmboss(effect);
          break;
        case 'stroke':
          this.renderStroke(effect);
          break;
        case 'color-overlay':
          this.renderColorOverlay(effect);
          break;
        case 'gradient-overlay':
          this.renderGradientOverlay(effect);
          break;
        case 'pattern-overlay':
          this.renderPatternOverlay(effect);
          break;
      }
    }

    return this.canvas;
  }

  /**
   * Render Drop Shadow Effect
   */
  private renderDropShadow(effect: DropShadowEffect): void {
    const { color, opacity, angle, distance, spread, size, noise } = effect.settings;
    
    // Calculate shadow offset
    const radians = (angle * Math.PI) / 180;
    const offsetX = Math.cos(radians) * distance;
    const offsetY = Math.sin(radians) * distance;

    // Create shadow layer
    this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
    this.tempCtx.save();
    
    // Apply shadow color and opacity
    this.tempCtx.globalAlpha = opacity;
    this.tempCtx.fillStyle = color;
    
    // Create shadow shape
    this.tempCtx.translate(offsetX, offsetY);
    this.tempCtx.drawImage(this.canvas, 0, 0);
    
    // Apply blur for size
    if (size > 0) {
      this.tempCtx.filter = `blur(${size}px)`;
      this.tempCtx.drawImage(this.tempCanvas, 0, 0);
    }
    
    this.tempCtx.restore();

    // Composite shadow behind original
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'destination-over';
    this.ctx.drawImage(this.tempCanvas, 0, 0);
    this.ctx.restore();
  }

  /**
   * Render Inner Shadow Effect
   */
  private renderInnerShadow(effect: InnerShadowEffect): void {
    const { color, opacity, angle, distance, choke, size } = effect.settings;
    
    // Calculate shadow offset
    const radians = (angle * Math.PI) / 180;
    const offsetX = Math.cos(radians) * distance;
    const offsetY = Math.sin(radians) * distance;

    // Create inner shadow
    this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
    this.tempCtx.save();
    
    this.tempCtx.globalAlpha = opacity;
    this.tempCtx.fillStyle = color;
    
    // Create inner shadow shape
    this.tempCtx.translate(offsetX, offsetY);
    this.tempCtx.drawImage(this.canvas, 0, 0);
    
    // Apply blur
    if (size > 0) {
      this.tempCtx.filter = `blur(${size}px)`;
      this.tempCtx.drawImage(this.tempCanvas, 0, 0);
    }
    
    this.tempCtx.restore();

    // Composite inner shadow
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'multiply';
    this.ctx.drawImage(this.tempCanvas, 0, 0);
    this.ctx.restore();
  }

  /**
   * Render Outer Glow Effect
   */
  private renderOuterGlow(effect: OuterGlowEffect): void {
    const { color, opacity, technique, spread, size } = effect.settings;
    
    // Create glow layer
    this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
    this.tempCtx.save();
    
    this.tempCtx.globalAlpha = opacity;
    this.tempCtx.fillStyle = color;
    
    // Create glow shape
    this.tempCtx.drawImage(this.canvas, 0, 0);
    
    // Apply blur for glow
    if (size > 0) {
      this.tempCtx.filter = `blur(${size}px)`;
      this.tempCtx.drawImage(this.tempCanvas, 0, 0);
    }
    
    this.tempCtx.restore();

    // Composite glow behind original
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'screen';
    this.ctx.drawImage(this.tempCanvas, 0, 0);
    this.ctx.restore();
  }

  /**
   * Render Inner Glow Effect
   */
  private renderInnerGlow(effect: InnerGlowEffect): void {
    const { color, opacity, technique, choke, size } = effect.settings;
    
    // Create inner glow
    this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
    this.tempCtx.save();
    
    this.tempCtx.globalAlpha = opacity;
    this.tempCtx.fillStyle = color;
    
    // Create inner glow shape
    this.tempCtx.drawImage(this.canvas, 0, 0);
    
    // Apply blur
    if (size > 0) {
      this.tempCtx.filter = `blur(${size}px)`;
      this.tempCtx.drawImage(this.tempCanvas, 0, 0);
    }
    
    this.tempCtx.restore();

    // Composite inner glow
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'screen';
    this.ctx.drawImage(this.tempCanvas, 0, 0);
    this.ctx.restore();
  }

  /**
   * Render Bevel & Emboss Effect
   */
  private renderBevelEmboss(effect: BevelEmbossEffect): void {
    const { 
      style, technique, depth, direction, size, soften, angle, altitude,
      highlightMode, highlightOpacity, highlightColor,
      shadowMode, shadowOpacity, shadowColor
    } = effect.settings;

    // This is a complex effect that requires multiple passes
    // For now, we'll create a simplified version
    
    this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
    this.tempCtx.save();
    
    // Create highlight
    this.tempCtx.globalAlpha = highlightOpacity;
    this.tempCtx.fillStyle = highlightColor;
    this.tempCtx.drawImage(this.canvas, 0, 0);
    
    // Apply highlight blend mode
    this.tempCtx.globalCompositeOperation = highlightMode as GlobalCompositeOperation;
    this.tempCtx.drawImage(this.tempCanvas, 0, 0);
    
    this.tempCtx.restore();

    // Create shadow
    this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
    this.tempCtx.save();
    
    this.tempCtx.globalAlpha = shadowOpacity;
    this.tempCtx.fillStyle = shadowColor;
    this.tempCtx.drawImage(this.canvas, 0, 0);
    
    // Apply shadow blend mode
    this.tempCtx.globalCompositeOperation = shadowMode as GlobalCompositeOperation;
    this.tempCtx.drawImage(this.tempCanvas, 0, 0);
    
    this.tempCtx.restore();
  }

  /**
   * Render Stroke Effect
   */
  private renderStroke(effect: StrokeEffect): void {
    const { size, position, blendMode, opacity, fillType, color, gradient, pattern } = effect.settings;
    
    if (size <= 0) return;

    this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
    this.tempCtx.save();
    
    this.tempCtx.globalAlpha = opacity;
    this.tempCtx.lineWidth = size;
    this.tempCtx.lineCap = 'round';
    this.tempCtx.lineJoin = 'round';
    
    // Set stroke style based on fill type
    if (fillType === 'color' && color) {
      this.tempCtx.strokeStyle = color;
    } else if (fillType === 'gradient' && gradient) {
      const gradientObj = this.createGradient(gradient);
      this.tempCtx.strokeStyle = gradientObj;
    } else if (fillType === 'pattern' && pattern) {
      const patternObj = this.tempCtx.createPattern(pattern.image, 'repeat');
      this.tempCtx.strokeStyle = patternObj!;
    }
    
    // Draw stroke
    this.tempCtx.strokeRect(size / 2, size / 2, this.canvas.width - size, this.canvas.height - size);
    
    this.tempCtx.restore();

    // Composite stroke
    this.ctx.save();
    this.ctx.globalCompositeOperation = blendMode as GlobalCompositeOperation;
    this.ctx.drawImage(this.tempCanvas, 0, 0);
    this.ctx.restore();
  }

  /**
   * Render Color Overlay Effect
   */
  private renderColorOverlay(effect: ColorOverlayEffect): void {
    const { color, blendMode, opacity } = effect.settings;
    
    this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
    this.tempCtx.save();
    
    this.tempCtx.globalAlpha = opacity;
    this.tempCtx.fillStyle = color;
    this.tempCtx.fillRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
    
    this.tempCtx.restore();

    // Composite color overlay
    this.ctx.save();
    this.ctx.globalCompositeOperation = blendMode as GlobalCompositeOperation;
    this.ctx.drawImage(this.tempCanvas, 0, 0);
    this.ctx.restore();
  }

  /**
   * Render Gradient Overlay Effect
   */
  private renderGradientOverlay(effect: GradientOverlayEffect): void {
    const { gradient, blendMode, opacity, style, angle, scale } = effect.settings;
    
    this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
    this.tempCtx.save();
    
    this.tempCtx.globalAlpha = opacity;
    
    const gradientObj = this.createGradient(gradient);
    this.tempCtx.fillStyle = gradientObj;
    this.tempCtx.fillRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
    
    this.tempCtx.restore();

    // Composite gradient overlay
    this.ctx.save();
    this.ctx.globalCompositeOperation = blendMode as GlobalCompositeOperation;
    this.ctx.drawImage(this.tempCanvas, 0, 0);
    this.ctx.restore();
  }

  /**
   * Render Pattern Overlay Effect
   */
  private renderPatternOverlay(effect: PatternOverlayEffect): void {
    const { pattern, blendMode, opacity, scale } = effect.settings;
    
    this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
    this.tempCtx.save();
    
    this.tempCtx.globalAlpha = opacity;
    this.tempCtx.scale(scale, scale);
    
    const patternObj = this.tempCtx.createPattern(pattern.image, 'repeat');
    this.tempCtx.fillStyle = patternObj!;
    this.tempCtx.fillRect(0, 0, this.tempCanvas.width / scale, this.tempCanvas.height / scale);
    
    this.tempCtx.restore();

    // Composite pattern overlay
    this.ctx.save();
    this.ctx.globalCompositeOperation = blendMode as GlobalCompositeOperation;
    this.ctx.drawImage(this.tempCanvas, 0, 0);
    this.ctx.restore();
  }

  /**
   * Create gradient object from gradient data
   */
  private createGradient(gradientData: GradientData): CanvasGradient {
    const { type, stops, angle, centerX, centerY } = gradientData;
    
    let gradient: CanvasGradient;
    
    if (type === 'linear') {
      const radians = ((angle || 0) * Math.PI) / 180;
      const x1 = Math.cos(radians) * -500;
      const y1 = Math.sin(radians) * -500;
      const x2 = Math.cos(radians) * 500;
      const y2 = Math.sin(radians) * 500;
      
      gradient = this.tempCtx.createLinearGradient(x1, y1, x2, y2);
    } else if (type === 'radial') {
      const centerXVal = centerX || this.tempCanvas.width / 2;
      const centerYVal = centerY || this.tempCanvas.height / 2;
      const radius = Math.min(this.tempCanvas.width, this.tempCanvas.height) / 2;
      
      gradient = this.tempCtx.createRadialGradient(centerXVal, centerYVal, 0, centerXVal, centerYVal, radius);
    } else {
      // Conic gradient (not natively supported, use linear as fallback)
      gradient = this.tempCtx.createLinearGradient(0, 0, this.tempCanvas.width, 0);
    }
    
    // Add color stops
    for (const stop of stops) {
      gradient.addColorStop(stop.position, `rgba(${this.hexToRgb(stop.color)}, ${stop.opacity})`);
    }
    
    return gradient;
  }

  /**
   * Convert hex color to RGB
   */
  private hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0, 0, 0';
    
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    
    return `${r}, ${g}, ${b}`;
  }

  /**
   * Resize canvas
   */
  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.tempCanvas.width = width;
    this.tempCanvas.height = height;
  }

  /**
   * Get the result canvas
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.canvas.remove();
    this.tempCanvas.remove();
  }
}

// ============================================================================
// BLEND MODE UTILITIES
// ============================================================================

export class BlendModeRenderer {
  /**
   * Apply blend mode to two canvases
   */
  static applyBlendMode(
    baseCanvas: HTMLCanvasElement,
    overlayCanvas: HTMLCanvasElement,
    blendMode: string,
    opacity: number = 1.0
  ): HTMLCanvasElement {
    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = baseCanvas.width;
    resultCanvas.height = baseCanvas.height;
    const ctx = resultCanvas.getContext('2d')!;

    // Draw base layer
    ctx.drawImage(baseCanvas, 0, 0);

    // Apply blend mode
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.globalCompositeOperation = blendMode as GlobalCompositeOperation;
    ctx.drawImage(overlayCanvas, 0, 0);
    ctx.restore();

    return resultCanvas;
  }

  /**
   * Get available blend modes
   */
  static getAvailableBlendModes(): string[] {
    return [
      'normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light',
      'color-dodge', 'color-burn', 'darken', 'lighten', 'difference', 'exclusion',
      'hue', 'saturation', 'color', 'luminosity', 'linear-burn', 'linear-dodge',
      'vivid-light', 'linear-light', 'pin-light', 'hard-mix', 'subtract', 'divide'
    ];
  }
}

// ============================================================================
// EFFECT PRESETS
// ============================================================================

export class EffectPresets {
  /**
   * Get default effect presets
   */
  static getPresets(): Record<string, LayerEffect[]> {
    return {
      'drop-shadow-basic': [{
        id: 'drop-shadow-1',
        type: 'drop-shadow',
        enabled: true,
        settings: {
          color: '#000000',
          opacity: 0.75,
          angle: 135,
          distance: 5,
          spread: 0,
          size: 5,
          noise: 0,
          antiAlias: true
        }
      }] as LayerEffect[],

      'glow-basic': [{
        id: 'outer-glow-1',
        type: 'outer-glow',
        enabled: true,
        settings: {
          color: '#ffffff',
          opacity: 0.8,
          technique: 'softer',
          spread: 0,
          size: 10,
          noise: 0,
          antiAlias: true
        }
      }] as LayerEffect[],

      'bevel-emboss-basic': [{
        id: 'bevel-emboss-1',
        type: 'bevel-emboss',
        enabled: true,
        settings: {
          style: 'outer-bevel',
          technique: 'smooth',
          depth: 100,
          direction: 'up',
          size: 5,
          soften: 0,
          angle: 120,
          altitude: 30,
          highlightMode: 'screen',
          highlightOpacity: 0.75,
          highlightColor: '#ffffff',
          shadowMode: 'multiply',
          shadowOpacity: 0.75,
          shadowColor: '#000000'
        }
      }] as LayerEffect[],

      'stroke-basic': [{
        id: 'stroke-1',
        type: 'stroke',
        enabled: true,
        settings: {
          size: 2,
          position: 'outside',
          blendMode: 'normal',
          opacity: 1.0,
          fillType: 'color',
          color: '#000000'
        }
      }] as LayerEffect[]
    };
  }

  /**
   * Apply preset to layer
   */
  static applyPreset(presetName: string): LayerEffect[] {
    const presets = this.getPresets();
    return presets[presetName] || [];
  }
}

export default LayerEffectRenderer;


