import * as THREE from 'three';

export interface BrushPoint {
  x: number;
  y: number;
  pressure: number;
  tiltX: number;
  tiltY: number;
  velocity: number;
  timestamp: number;
  distance: number;
}

export interface BrushDynamics {
  size: {
    base: number;
    variation: number;
    pressureCurve: number[];
    velocityCurve: number[];
    tiltCurve: number[];
  };
  opacity: {
    base: number;
    variation: number;
    pressureCurve: number[];
    velocityCurve: number[];
    tiltCurve: number[];
  };
  flow: {
    base: number;
    variation: number;
    pressureCurve: number[];
    velocityCurve: number[];
  };
  angle: {
    base: number;
    variation: number;
    followVelocity: boolean;
    followTilt: boolean;
    random: boolean;
  };
  spacing: {
    base: number;
    variation: number;
    pressureCurve: number[];
    velocityCurve: number[];
  };
  scattering: {
    amount: number;
    count: number;
  };
}

export interface BrushShape {
  type: 'circle' | 'square' | 'diamond' | 'triangle' | 'star' | 'custom';
  hardness: number;
  roundness: number;
  angle: number;
  scale: number;
  aspectRatio: number;
}

export interface BrushTexture {
  pattern: 'solid' | 'noise' | 'bristles' | 'canvas' | 'paper' | 'watercolor' | 'custom';
  scale: number;
  rotation: number;
  opacity: number;
  blendMode: GlobalCompositeOperation;
  noise: {
    type: 'perlin' | 'simplex' | 'value';
    frequency: number;
    octaves: number;
    persistence: number;
    lacunarity: number;
  };
  bristles?: {
    count: number;
    length: number;
    thickness: number;
    randomness: number;
  };
}

export interface BrushSettings {
  dynamics: BrushDynamics;
  shape: BrushShape;
  texture: BrushTexture;
  color: {
    primary: string;
    secondary?: string;
    gradient?: {
      type: 'linear' | 'radial' | 'conic';
      stops: Array<{ position: number; color: string; opacity: number }>;
      angle: number;
    };
  };
  blendMode: GlobalCompositeOperation;
  stabilization: {
    enabled: boolean;
    delay: number;
    quality: number;
  };
  wetMedia: {
    enabled: boolean;
    flow: number;
    drying: number;
    blending: number;
    absorption: number;
  };
}

export interface BrushStroke {
  points: BrushPoint[];
  settings: BrushSettings;
  timestamp: number;
  id: string;
}

export class BrushEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private brushCache = new Map<string, HTMLCanvasElement>();
  private strokeCache = new Map<string, BrushStroke>();
  private lastPoint: BrushPoint | null = null;
  private currentStroke: BrushStroke | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    if (!this.ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }
  }

  // Core brush rendering method
  public renderBrushStroke(
    points: BrushPoint[],
    settings: BrushSettings,
    targetCtx?: CanvasRenderingContext2D
  ): void {
    const ctx = targetCtx || this.ctx;

    ctx.save();
    ctx.globalCompositeOperation = settings.blendMode;

    // Process points with stabilization if enabled
    const processedPoints = settings.stabilization.enabled
      ? this.stabilizePoints(points, settings.stabilization)
      : points;

    // Render stroke segments
    for (let i = 1; i < processedPoints.length; i++) {
      const prevPoint = processedPoints[i - 1];
      const currentPoint = processedPoints[i];

      this.renderBrushSegment(ctx, prevPoint, currentPoint, settings);
    }

    ctx.restore();
  }

  private renderBrushSegment(
    ctx: CanvasRenderingContext2D,
    prevPoint: BrushPoint,
    currentPoint: BrushPoint,
    settings: BrushSettings
  ): void {
    const distance = Math.sqrt(
      Math.pow(currentPoint.x - prevPoint.x, 2) +
      Math.pow(currentPoint.y - prevPoint.y, 2)
    );

    if (distance === 0) return;

    // Calculate dynamic properties
    const dynamics = this.calculateDynamics(prevPoint, currentPoint, settings.dynamics);

    // Generate brush stamps along the segment
    const steps = Math.max(1, Math.floor(distance / dynamics.spacing));
    for (let step = 0; step <= steps; step++) {
      const t = step / steps;
      const interpolatedPoint = this.interpolatePoint(prevPoint, currentPoint, t);

      // Apply scattering
      const scatteredPoints = this.applyScattering(interpolatedPoint, dynamics.scattering);

      for (const point of scatteredPoints) {
        this.renderBrushStamp(ctx, point, dynamics, settings);
      }
    }
  }

  private calculateDynamics(prevPoint: BrushPoint, currentPoint: BrushPoint, dynamics: BrushDynamics) {
    const velocity = currentPoint.velocity;
    const pressure = currentPoint.pressure;
    const tilt = Math.sqrt(currentPoint.tiltX ** 2 + currentPoint.tiltY ** 2);

    // Calculate dynamic size
    const sizeMultiplier = this.evaluateCurve(dynamics.size.pressureCurve, pressure) *
                          this.evaluateCurve(dynamics.size.velocityCurve, velocity) *
                          this.evaluateCurve(dynamics.size.tiltCurve, tilt);
    const size = dynamics.size.base * (1 + dynamics.size.variation * (Math.random() - 0.5)) * sizeMultiplier;

    // Calculate dynamic opacity
    const opacityMultiplier = this.evaluateCurve(dynamics.opacity.pressureCurve, pressure) *
                             this.evaluateCurve(dynamics.opacity.velocityCurve, velocity) *
                             this.evaluateCurve(dynamics.opacity.tiltCurve, tilt);
    const opacity = dynamics.opacity.base * (1 + dynamics.opacity.variation * (Math.random() - 0.5)) * opacityMultiplier;

    // Calculate dynamic flow
    const flowMultiplier = this.evaluateCurve(dynamics.flow.pressureCurve, pressure) *
                          this.evaluateCurve(dynamics.flow.velocityCurve, velocity);
    const flow = dynamics.flow.base * (1 + dynamics.flow.variation * (Math.random() - 0.5)) * flowMultiplier;

    // Calculate dynamic angle
    let angle = dynamics.angle.base;
    if (dynamics.angle.followVelocity) {
      angle += Math.atan2(currentPoint.y - prevPoint.y, currentPoint.x - prevPoint.x);
    }
    if (dynamics.angle.followTilt) {
      angle += Math.atan2(currentPoint.tiltY, currentPoint.tiltX);
    }
    if (dynamics.angle.random) {
      angle += dynamics.angle.variation * (Math.random() - 0.5);
    }

    // Calculate dynamic spacing
    const spacingMultiplier = this.evaluateCurve(dynamics.spacing.pressureCurve, pressure) *
                             this.evaluateCurve(dynamics.spacing.velocityCurve, velocity);
    const spacing = dynamics.spacing.base * (1 + dynamics.spacing.variation * (Math.random() - 0.5)) * spacingMultiplier;

    return {
      size,
      opacity,
      flow,
      angle,
      spacing,
      scattering: dynamics.scattering
    };
  }

  private interpolatePoint(point1: BrushPoint, point2: BrushPoint, t: number): BrushPoint {
    return {
      x: point1.x + (point2.x - point1.x) * t,
      y: point1.y + (point2.y - point1.y) * t,
      pressure: point1.pressure + (point2.pressure - point1.pressure) * t,
      tiltX: point1.tiltX + (point2.tiltX - point1.tiltX) * t,
      tiltY: point1.tiltY + (point2.tiltY - point1.tiltY) * t,
      velocity: point1.velocity + (point2.velocity - point1.velocity) * t,
      timestamp: point1.timestamp + (point2.timestamp - point1.timestamp) * t,
      distance: point1.distance + (point2.distance - point1.distance) * t
    };
  }

  private applyScattering(point: BrushPoint, scattering: { amount: number; count: number }): BrushPoint[] {
    if (scattering.amount === 0 || scattering.count <= 1) {
      return [point];
    }

    const points: BrushPoint[] = [point];
    for (let i = 1; i < scattering.count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * scattering.amount;
      points.push({
        ...point,
        x: point.x + Math.cos(angle) * distance,
        y: point.y + Math.sin(angle) * distance
      });
    }

    return points;
  }

  private renderBrushStamp(
    ctx: CanvasRenderingContext2D,
    point: BrushPoint,
    dynamics: any,
    settings: BrushSettings
  ): void {
    const brushCanvas = this.getBrushStamp(settings.shape, settings.texture, dynamics.size);

    ctx.save();
    ctx.globalAlpha = dynamics.opacity;
    ctx.translate(point.x, point.y);
    ctx.rotate(dynamics.angle);
    ctx.drawImage(brushCanvas, -dynamics.size / 2, -dynamics.size / 2, dynamics.size, dynamics.size);
    ctx.restore();
  }

  private getBrushStamp(shape: BrushShape, texture: BrushTexture, size: number): HTMLCanvasElement {
    const key = `${shape.type}-${shape.hardness}-${shape.roundness}-${texture.pattern}-${size}`;

    if (this.brushCache.has(key)) {
      return this.brushCache.get(key)!;
    }

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Generate base shape
    this.generateShapeMask(ctx, shape, size);

    // Apply texture
    this.applyTexture(ctx, texture, size);

    this.brushCache.set(key, canvas);
    return canvas;
  }

  private generateShapeMask(ctx: CanvasRenderingContext2D, shape: BrushShape, size: number): void {
    const center = size / 2;
    const radius = size / 2;

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';

    // Create shape mask
    ctx.beginPath();
    switch (shape.type) {
      case 'circle':
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        break;
      case 'square':
        ctx.rect(0, 0, size, size);
        break;
      case 'diamond':
        ctx.moveTo(center, 0);
        ctx.lineTo(size, center);
        ctx.lineTo(center, size);
        ctx.lineTo(0, center);
        ctx.closePath();
        break;
      case 'triangle':
        ctx.moveTo(center, 0);
        ctx.lineTo(size, size);
        ctx.lineTo(0, size);
        ctx.closePath();
        break;
      case 'star':
        this.drawStar(ctx, center, center, 5, radius, radius * 0.5);
        break;
      default:
        ctx.arc(center, center, radius, 0, Math.PI * 2);
    }

    // Apply hardness (soft edges)
    if (shape.hardness < 1) {
      const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius);
      const softRadius = radius * shape.hardness;
      gradient.addColorStop(0, 'rgba(0,0,0,1)');
      gradient.addColorStop(softRadius / radius, 'rgba(0,0,0,1)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = 'black';
    }

    ctx.fill();
    ctx.restore();
  }

  private applyTexture(ctx: CanvasRenderingContext2D, texture: BrushTexture, size: number): void {
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const alpha = data[idx + 3] / 255;

        if (alpha > 0) {
          let textureValue = 1;

          switch (texture.pattern) {
            case 'noise':
              textureValue = this.generateNoise(x / size, y / size, texture.noise);
              break;
            case 'bristles':
              if (texture.bristles) {
                textureValue = this.generateBristles(x, y, size, texture.bristles);
              }
              break;
            case 'canvas':
              textureValue = this.generateCanvasTexture(x, y, size);
              break;
            case 'paper':
              textureValue = this.generatePaperTexture(x, y, size);
              break;
            default:
              textureValue = 1;
          }

          // Apply texture opacity and blending
          const finalAlpha = alpha * texture.opacity * textureValue;
          data[idx + 3] = Math.floor(finalAlpha * 255);
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  private generateNoise(u: number, v: number, noise: BrushTexture['noise']): number {
    let value = 0;
    let amplitude = 1;
    let frequency = noise.frequency;

    for (let i = 0; i < noise.octaves; i++) {
      value += this.perlinNoise(u * frequency, v * frequency) * amplitude;
      amplitude *= noise.persistence;
      frequency *= noise.lacunarity;
    }

    return (value + 1) / 2; // Normalize to 0-1
  }

  private perlinNoise(x: number, y: number): number {
    // Simple Perlin noise implementation
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  }

  private generateBristles(x: number, y: number, size: number, bristles: NonNullable<BrushTexture['bristles']>): number {
    const centerX = size / 2;
    const centerY = size / 2;
    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    const angle = Math.atan2(y - centerY, x - centerX);

    // Simulate bristle pattern
    const bristleIndex = Math.floor(angle / (Math.PI * 2) * bristles.count);
    const bristleOffset = (bristles.randomness * (Math.sin(bristleIndex * 0.1) - 0.5));
    const bristleDistance = Math.abs(distance - bristles.length / 2 + bristleOffset);

    return Math.max(0, 1 - bristleDistance / bristles.thickness);
  }

  private generateCanvasTexture(x: number, y: number, size: number): number {
    // Simulate canvas weave pattern
    const weaveSize = size / 16;
    const weaveX = (x % weaveSize) / weaveSize;
    const weaveY = (y % weaveSize) / weaveSize;

    const thread1 = Math.abs(weaveX - 0.5) < 0.1 ? 0.8 : 1.0;
    const thread2 = Math.abs(weaveY - 0.5) < 0.1 ? 0.8 : 1.0;

    return Math.min(thread1, thread2);
  }

  private generatePaperTexture(x: number, y: number, size: number): number {
    // Simulate paper texture with subtle noise
    const noise1 = Math.sin(x * 0.1) * Math.cos(y * 0.1);
    const noise2 = Math.sin(x * 0.05 + y * 0.07) * 0.5;
    return 0.8 + (noise1 + noise2) * 0.2;
  }

  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number): void {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  }

  private evaluateCurve(curve: number[], input: number): number {
    if (curve.length === 0) return 1;
    if (curve.length === 1) return curve[0];

    const clampedInput = Math.max(0, Math.min(1, input));
    const index = clampedInput * (curve.length - 1);
    const lowerIndex = Math.floor(index);
    const upperIndex = Math.ceil(index);
    const t = index - lowerIndex;

    if (lowerIndex === upperIndex) return curve[lowerIndex];

    return curve[lowerIndex] * (1 - t) + curve[upperIndex] * t;
  }

  private stabilizePoints(points: BrushPoint[], stabilization: BrushSettings['stabilization']): BrushPoint[] {
    if (!stabilization.enabled || points.length < 3) return points;

    const stabilized: BrushPoint[] = [];
    const windowSize = Math.max(2, Math.floor(stabilization.delay * points.length));

    for (let i = 0; i < points.length; i++) {
      const start = Math.max(0, i - windowSize);
      const end = Math.min(points.length - 1, i + windowSize);

      let sumX = 0, sumY = 0, count = 0;
      for (let j = start; j <= end; j++) {
        sumX += points[j].x;
        sumY += points[j].y;
        count++;
      }

      stabilized.push({
        ...points[i],
        x: sumX / count,
        y: sumY / count
      });
    }

    return stabilized;
  }

  // Public API methods
  public startStroke(settings: BrushSettings): string {
    const strokeId = `stroke-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.currentStroke = {
      id: strokeId,
      points: [],
      settings,
      timestamp: Date.now()
    };
    this.lastPoint = null;
    return strokeId;
  }

  public addPoint(point: BrushPoint): void {
    if (!this.currentStroke) return;

    // Calculate distance from last point
    if (this.lastPoint) {
      point.distance = Math.sqrt(
        Math.pow(point.x - this.lastPoint.x, 2) +
        Math.pow(point.y - this.lastPoint.y, 2)
      );
    } else {
      point.distance = 0;
    }

    this.currentStroke.points.push(point);
    this.lastPoint = point;
  }

  public endStroke(): BrushStroke | null {
    if (!this.currentStroke) return null;

    const stroke = { ...this.currentStroke };
    this.strokeCache.set(stroke.id, stroke);

    // Render the complete stroke
    this.renderBrushStroke(stroke.points, stroke.settings);

    this.currentStroke = null;
    this.lastPoint = null;

    return stroke;
  }

  public getStroke(strokeId: string): BrushStroke | null {
    return this.strokeCache.get(strokeId) || null;
  }

  public clearCache(): void {
    this.brushCache.clear();
    this.strokeCache.clear();
  }

  public dispose(): void {
    this.clearCache();
  }
}
