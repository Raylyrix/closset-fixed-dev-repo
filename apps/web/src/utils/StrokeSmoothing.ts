import { BrushPoint } from './BrushEngine';

export interface SmoothingOptions {
  method: 'movingAverage' | 'gaussian' | 'spline' | 'bezier';
  strength: number;
  preservePressure: boolean;
  preserveVelocity: boolean;
}

export interface StabilizationOptions {
  enabled: boolean;
  delay: number; // Number of points to look ahead/behind
  quality: number; // 0-1, higher values = smoother but more latency
  adaptive: boolean; // Adjust based on stroke speed
}

export class StrokeSmoothing {
  private buffer: BrushPoint[] = [];
  private maxBufferSize = 20;

  /**
   * Apply smoothing to a stroke
   */
  public smoothStroke(points: BrushPoint[], options: SmoothingOptions): BrushPoint[] {
    if (points.length < 3) return points;

    switch (options.method) {
      case 'movingAverage':
        return this.applyMovingAverage(points, options);
      case 'gaussian':
        return this.applyGaussianBlur(points, options);
      case 'spline':
        return this.applySplineInterpolation(points, options);
      case 'bezier':
        return this.applyBezierSmoothing(points, options);
      default:
        return points;
    }
  }

  /**
   * Stabilize stroke in real-time
   */
  public stabilizePoint(
    currentPoint: BrushPoint,
    recentPoints: BrushPoint[],
    options: StabilizationOptions
  ): BrushPoint {
    if (!options.enabled || recentPoints.length < 2) {
      return currentPoint;
    }

    const windowSize = Math.max(2, Math.floor(options.delay));
    const relevantPoints = [...recentPoints.slice(-windowSize), currentPoint];

    // Adaptive stabilization based on velocity
    let adaptiveWindow = windowSize;
    if (options.adaptive) {
      const avgVelocity = relevantPoints.reduce((sum, p) => sum + p.velocity, 0) / relevantPoints.length;
      if (avgVelocity > 500) { // Fast strokes need less stabilization
        adaptiveWindow = Math.max(2, Math.floor(windowSize * 0.5));
      } else if (avgVelocity < 100) { // Slow strokes can have more stabilization
        adaptiveWindow = Math.min(windowSize * 2, relevantPoints.length);
      }
    }

    const points = relevantPoints.slice(-adaptiveWindow);
    const weights = this.generateWeights(points.length, options.quality);

    let smoothedX = 0, smoothedY = 0, totalWeight = 0;

    points.forEach((point, index) => {
      const weight = weights[index];
      smoothedX += point.x * weight;
      smoothedY += point.y * weight;
      totalWeight += weight;
    });

    return {
      ...currentPoint,
      x: smoothedX / totalWeight,
      y: smoothedY / totalWeight
    };
  }

  /**
   * Moving average smoothing
   */
  private applyMovingAverage(points: BrushPoint[], options: SmoothingOptions): BrushPoint[] {
    const windowSize = Math.max(3, Math.floor(options.strength * 10));
    const smoothed: BrushPoint[] = [];

    for (let i = 0; i < points.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(points.length - 1, i + Math.floor(windowSize / 2));

      let sumX = 0, sumY = 0, sumPressure = 0, sumVelocity = 0, count = 0;

      for (let j = start; j <= end; j++) {
        sumX += points[j].x;
        sumY += points[j].y;
        if (options.preservePressure) sumPressure += points[j].pressure;
        if (options.preserveVelocity) sumVelocity += points[j].velocity;
        count++;
      }

      smoothed.push({
        ...points[i],
        x: sumX / count,
        y: sumY / count,
        pressure: options.preservePressure ? sumPressure / count : points[i].pressure,
        velocity: options.preserveVelocity ? sumVelocity / count : points[i].velocity
      });
    }

    return smoothed;
  }

  /**
   * Gaussian blur smoothing
   */
  private applyGaussianBlur(points: BrushPoint[], options: SmoothingOptions): BrushPoint[] {
    const sigma = options.strength * 2;
    const kernelSize = Math.max(3, Math.floor(sigma * 3));
    const kernel = this.generateGaussianKernel(kernelSize, sigma);

    const smoothed: BrushPoint[] = [];

    for (let i = 0; i < points.length; i++) {
      let sumX = 0, sumY = 0, sumPressure = 0, sumVelocity = 0, totalWeight = 0;

      for (let j = 0; j < kernel.length; j++) {
        const idx = i + j - Math.floor(kernel.length / 2);
        if (idx >= 0 && idx < points.length) {
          const weight = kernel[j];
          sumX += points[idx].x * weight;
          sumY += points[idx].y * weight;
          if (options.preservePressure) sumPressure += points[idx].pressure * weight;
          if (options.preserveVelocity) sumVelocity += points[idx].velocity * weight;
          totalWeight += weight;
        }
      }

      smoothed.push({
        ...points[i],
        x: sumX / totalWeight,
        y: sumY / totalWeight,
        pressure: options.preservePressure ? sumPressure / totalWeight : points[i].pressure,
        velocity: options.preserveVelocity ? sumVelocity / totalWeight : points[i].velocity
      });
    }

    return smoothed;
  }

  /**
   * Cubic spline interpolation
   */
  private applySplineInterpolation(points: BrushPoint[], options: SmoothingOptions): BrushPoint[] {
    if (points.length < 4) return points;

    const smoothed: BrushPoint[] = [];
    const tension = 1 - options.strength; // Lower tension = smoother curve

    // Add control points at start and end for better interpolation
    const extendedPoints = [
      this.extrapolatePoint(points[0], points[1], -1),
      ...points,
      this.extrapolatePoint(points[points.length - 1], points[points.length - 2], 1)
    ];

    for (let i = 1; i < extendedPoints.length - 2; i++) {
      const p0 = extendedPoints[i - 1];
      const p1 = extendedPoints[i];
      const p2 = extendedPoints[i + 1];
      const p3 = extendedPoints[i + 2];

      // Catmull-Rom spline interpolation
      for (let t = 0; t < 1; t += 0.1) {
        const tt = t * t;
        const ttt = tt * t;

        const x = 0.5 * (
          (2 * p1.x) +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * tt +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * ttt
        );

        const y = 0.5 * (
          (2 * p1.y) +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * tt +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * ttt
        );

        smoothed.push({
          ...p1,
          x,
          y,
          pressure: this.interpolateValue(p0.pressure, p1.pressure, p2.pressure, p3.pressure, t),
          velocity: this.interpolateValue(p0.velocity, p1.velocity, p2.velocity, p3.velocity, t)
        });
      }
    }

    return smoothed;
  }

  /**
   * Bezier curve smoothing
   */
  private applyBezierSmoothing(points: BrushPoint[], options: SmoothingOptions): BrushPoint[] {
    if (points.length < 3) return points;

    const smoothed: BrushPoint[] = [];
    const smoothness = options.strength;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i < points.length - 2 ? points[i + 2] : points[i + 1];

      // Calculate control points
      const cp1x = p1.x + (p2.x - p0.x) * smoothness * 0.5;
      const cp1y = p1.y + (p2.y - p0.y) * smoothness * 0.5;
      const cp2x = p2.x - (p3.x - p1.x) * smoothness * 0.5;
      const cp2y = p2.y - (p3.y - p1.y) * smoothness * 0.5;

      // Interpolate along the curve
      for (let t = 0; t <= 1; t += 0.1) {
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;

        const x = uuu * p1.x + 3 * uu * t * cp1x + 3 * u * tt * cp2x + ttt * p2.x;
        const y = uuu * p1.y + 3 * uu * t * cp1y + 3 * u * tt * cp2y + ttt * p2.y;

        smoothed.push({
          ...p1,
          x,
          y,
          pressure: p1.pressure * u + p2.pressure * t,
          velocity: p1.velocity * u + p2.velocity * t
        });
      }
    }

    return smoothed;
  }

  private extrapolatePoint(p1: BrushPoint, p2: BrushPoint, direction: number): BrushPoint {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return {
      ...p1,
      x: p1.x - dx * direction,
      y: p1.y - dy * direction
    };
  }

  private interpolateValue(v0: number, v1: number, v2: number, v3: number, t: number): number {
    const tt = t * t;
    const ttt = tt * t;
    return 0.5 * (
      (2 * v1) +
      (-v0 + v2) * t +
      (2 * v0 - 5 * v1 + 4 * v2 - v3) * tt +
      (-v0 + 3 * v1 - 3 * v2 + v3) * ttt
    );
  }

  private generateGaussianKernel(size: number, sigma: number): number[] {
    const kernel: number[] = [];
    const center = Math.floor(size / 2);
    let sum = 0;

    for (let i = 0; i < size; i++) {
      const x = i - center;
      const value = Math.exp(-(x * x) / (2 * sigma * sigma));
      kernel.push(value);
      sum += value;
    }

    // Normalize
    return kernel.map(v => v / sum);
  }

  private generateWeights(length: number, quality: number): number[] {
    const weights: number[] = [];
    const center = length / 2;

    for (let i = 0; i < length; i++) {
      const distance = Math.abs(i - center) / center;
      const weight = Math.pow(1 - distance, quality * 2);
      weights.push(weight);
    }

    return weights;
  }
}

export class WetMediaSimulator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private wetnessMap!: Float32Array;
  private pigmentMap!: Float32Array;
  private flowMap!: Float32Array;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.initializeMaps();
  }

  private initializeMaps(): void {
    const size = this.canvas.width * this.canvas.height;
    this.wetnessMap = new Float32Array(size);
    this.pigmentMap = new Float32Array(size);
    this.flowMap = new Float32Array(size);
  }

  /**
   * Simulate wet media behavior for a brush stroke
   */
  public applyWetMedia(
    points: BrushPoint[],
    settings: {
      flow: number;
      drying: number;
      blending: number;
      absorption: number;
    }
  ): void {
    // Update wetness and pigment maps
    this.updateWetness(points, settings);
    this.updatePigment(points, settings);
    this.simulateFlow(settings);

    // Render the wet media effect
    this.renderWetMedia();
  }

  private updateWetness(points: BrushPoint[], settings: any): void {
    points.forEach(point => {
      const index = this.getMapIndex(point.x, point.y);
      if (index >= 0) {
        const radius = 10 * point.pressure;
        this.applyBrushToMap(this.wetnessMap, point.x, point.y, radius, settings.flow);
      }
    });
  }

  private updatePigment(points: BrushPoint[], settings: any): void {
    points.forEach(point => {
      const index = this.getMapIndex(point.x, point.y);
      if (index >= 0) {
        const radius = 8 * point.pressure;
        this.applyBrushToMap(this.pigmentMap, point.x, point.y, radius, 1.0);
      }
    });
  }

  private applyBrushToMap(
    map: Float32Array,
    centerX: number,
    centerY: number,
    radius: number,
    intensity: number
  ): void {
    const startX = Math.max(0, Math.floor(centerX - radius));
    const endX = Math.min(this.canvas.width, Math.floor(centerX + radius));
    const startY = Math.max(0, Math.floor(centerY - radius));
    const endY = Math.min(this.canvas.height, Math.floor(centerY + radius));

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= radius) {
          const falloff = 1 - (distance / radius);
          const index = y * this.canvas.width + x;
          map[index] = Math.min(1, map[index] + intensity * falloff);
        }
      }
    }
  }

  private simulateFlow(settings: any): void {
    const newFlowMap = new Float32Array(this.flowMap.length);

    for (let y = 1; y < this.canvas.height - 1; y++) {
      for (let x = 1; x < this.canvas.width - 1; x++) {
        const index = y * this.canvas.width + x;
        const wetness = this.wetnessMap[index];
        const pigment = this.pigmentMap[index];

        if (wetness > 0.1 && pigment > 0.1) {
          // Simple flow simulation - pigment flows to neighboring wet areas
          const neighbors = [
            this.wetnessMap[(y - 1) * this.canvas.width + x],
            this.wetnessMap[y * this.canvas.width + (x + 1)],
            this.wetnessMap[(y + 1) * this.canvas.width + x],
            this.wetnessMap[y * this.canvas.width + (x - 1)]
          ];

          const avgWetness = neighbors.reduce((sum, w) => sum + w, 0) / neighbors.length;
          const flowAmount = (wetness - avgWetness) * settings.blending * 0.1;

          newFlowMap[index] = Math.max(0, flowAmount);
        }
      }
    }

    this.flowMap = newFlowMap;
  }

  private renderWetMedia(): void {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;

    for (let i = 0; i < this.wetnessMap.length; i++) {
      const wetness = this.wetnessMap[i];
      const pigment = this.pigmentMap[i];
      const flow = this.flowMap[i];

      if (wetness > 0 || pigment > 0) {
        const r = Math.floor(pigment * 255);
        const g = Math.floor(flow * 255);
        const b = Math.floor(wetness * 255);
        const a = Math.floor((wetness + pigment) * 127.5);

        data[i * 4] = r;
        data[i * 4 + 1] = g;
        data[i * 4 + 2] = b;
        data[i * 4 + 3] = a;
      }
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  private getMapIndex(x: number, y: number): number {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    if (ix < 0 || ix >= this.canvas.width || iy < 0 || iy >= this.canvas.height) {
      return -1;
    }
    return iy * this.canvas.width + ix;
  }

  /**
   * Update drying simulation over time
   */
  public updateDrying(deltaTime: number, dryingRate: number): void {
    for (let i = 0; i < this.wetnessMap.length; i++) {
      this.wetnessMap[i] = Math.max(0, this.wetnessMap[i] - dryingRate * deltaTime);
    }
  }

  public dispose(): void {
    // Clean up resources
  }
}
