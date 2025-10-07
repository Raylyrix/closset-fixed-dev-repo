import { useCallback, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { BrushPoint, BrushSettings, UVCoordinate } from '../types/app';

interface BrushEngineState {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  brushCache: Map<string, HTMLCanvasElement>;
  strokeCache: Map<string, BrushPoint[]>;
}

interface BrushEngineAPI {
  renderBrushStroke: (points: BrushPoint[], settings: BrushSettings, targetCtx?: CanvasRenderingContext2D) => void;
  createBrushStamp: (settings: BrushSettings) => HTMLCanvasElement;
  calculateBrushDynamics: (point: BrushPoint, settings: BrushSettings, index: number) => {
    size: number;
    opacity: number;
    angle: number;
    spacing: number;
  };
  getBrushCacheKey: (settings: BrushSettings) => string;
  clearCache: () => void;
  dispose: () => void;
}

/**
 * useBrushEngine - Custom hook for advanced brush rendering logic
 * Handles all brush-related calculations and rendering operations
 */
export function useBrushEngine(canvas?: HTMLCanvasElement): BrushEngineAPI {
  const stateRef = useRef<BrushEngineState | null>(null);

  // Initialize brush engine state
  const initializeEngine = useCallback(() => {
    if (stateRef.current) return stateRef.current;

    const targetCanvas = canvas || document.createElement('canvas');
    targetCanvas.width = 2048;
    targetCanvas.height = 2048;

    const ctx = targetCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }

    stateRef.current = {
      canvas: targetCanvas,
      ctx,
      brushCache: new Map(),
      strokeCache: new Map()
    };

    return stateRef.current;
  }, [canvas]);

  /**
   * Calculate dynamic brush properties based on input and settings
   */
  const calculateBrushDynamics = useCallback((point: BrushPoint, settings: BrushSettings, index: number) => {
    let size = settings.size;
    let opacity = settings.opacity;
    let angle = settings.angle;
    let spacing = settings.spacing;

    // Apply pressure dynamics
    if (settings.dynamics.sizePressure && point.pressure !== undefined) {
      size *= point.pressure;
    }

    if (settings.dynamics.opacityPressure && point.pressure !== undefined) {
      opacity *= point.pressure;
    }

    if (settings.dynamics.anglePressure && point.pressure !== undefined) {
      angle += (point.pressure - 1) * 45; // Pressure affects angle
    }

    // Apply velocity dynamics
    if (settings.dynamics.velocitySize && point.velocity > 0) {
      const velocityFactor = Math.max(0.1, 1 - point.velocity * 0.01);
      size *= velocityFactor;
    }

    // Ensure reasonable bounds
    size = Math.max(0.5, Math.min(size, 500));
    opacity = Math.max(0, Math.min(opacity, 1));
    spacing = Math.max(0.01, Math.min(spacing, 1));

    return { size, opacity, angle, spacing };
  }, []);

  /**
   * Create a brush stamp based on current settings
   */
  const createBrushStamp = useCallback((settings: BrushSettings): HTMLCanvasElement => {
    const state = initializeEngine();
    const cacheKey = getBrushCacheKey(settings);

    // Check cache first
    if (state.brushCache.has(cacheKey)) {
      return state.brushCache.get(cacheKey)!;
    }

    // Create new brush stamp
    const stampSize = Math.ceil(settings.size * 2);
    const stampCanvas = document.createElement('canvas');
    stampCanvas.width = stampSize;
    stampCanvas.height = stampSize;
    const stampCtx = stampCanvas.getContext('2d')!;

    const centerX = stampSize / 2;
    const centerY = stampSize / 2;
    const radius = settings.size;

    // Create radial gradient for brush falloff
    const gradient = stampCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${settings.opacity})`);
    gradient.addColorStop(settings.hardness, `rgba(255, 255, 255, ${settings.opacity * 0.8})`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    stampCtx.fillStyle = gradient;
    stampCtx.fillRect(0, 0, stampSize, stampSize);

    // Apply shape modifications
    applyShapeToStamp(stampCtx, settings, stampSize);

    // Apply texture if enabled
    if (settings.texture.enabled && settings.texture.pattern) {
      applyTextureToStamp(stampCtx, settings.texture, stampSize);
    }

    // Cache the result
    state.brushCache.set(cacheKey, stampCanvas);

    return stampCanvas;
  }, [initializeEngine]);

  /**
   * Apply shape-specific modifications to brush stamp
   */
  const applyShapeToStamp = useCallback((ctx: CanvasRenderingContext2D, settings: BrushSettings, size: number) => {
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = settings.size;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const normalizedDistance = distance / radius;

        if (normalizedDistance > 1) {
          // Outside radius - make transparent
          const index = (y * size + x) * 4;
          data[index + 3] = 0; // Alpha
          continue;
        }

        let alpha = data[(y * size + x) * 4 + 3];

        // Apply shape-specific falloff
        switch (settings.shape) {
          case 'square':
            // Sharp edges
            alpha *= normalizedDistance <= 1 ? 1 : 0;
            break;

          case 'diamond':
            // Diamond shape using rotated coordinates
            const rotatedX = Math.abs(dx + dy) / Math.SQRT2;
            const rotatedY = Math.abs(dx - dy) / Math.SQRT2;
            const diamondDist = Math.max(rotatedX, rotatedY) / radius;
            alpha *= diamondDist <= 1 ? 1 : 0;
            break;

          case 'triangle':
            // Triangular shape
            const angle = Math.atan2(dy, dx);
            const segment = Math.floor((angle + Math.PI) / (Math.PI * 2) * 3);
            const baseAngle = segment * Math.PI * 2 / 3;
            const relativeAngle = Math.abs(angle - baseAngle);
            const triangleDist = distance * Math.cos(relativeAngle) / radius;
            alpha *= triangleDist <= 1 ? 1 : 0;
            break;

          case 'airbrush':
            // Soft, random falloff
            const noise = (Math.sin(x * 0.1) + Math.sin(y * 0.1)) * 0.1;
            alpha *= Math.exp(-normalizedDistance * normalizedDistance * (1 + noise));
            break;

          case 'calligraphy':
            // Elliptical with angle
            const angleRad = (settings.angle * Math.PI) / 180;
            const cos = Math.cos(angleRad);
            const sin = Math.sin(angleRad);
            const rotatedDx = dx * cos - dy * sin;
            const rotatedDy = dx * sin + dy * cos;
            const ellipseDist = Math.sqrt(rotatedDx * rotatedDx + rotatedDy * rotatedDy * 2) / radius;
            alpha *= ellipseDist <= 1 ? 1 : 0;
            break;

          default: // 'round'
            // Standard round brush with hardness
            const hardness = settings.hardness;
            if (normalizedDistance > hardness) {
              const falloff = 1 - (normalizedDistance - hardness) / (1 - hardness);
              alpha *= Math.max(0, falloff);
            }
            break;
        }

        // Update alpha channel
        data[(y * size + x) * 4 + 3] = Math.floor(alpha);
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, []);

  /**
   * Apply texture pattern to brush stamp
   */
  const applyTextureToStamp = useCallback((ctx: CanvasRenderingContext2D, texture: BrushSettings['texture'], size: number) => {
    if (!texture.pattern) return;

    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const index = (y * size + x) * 4;
        const alpha = data[index + 3] / 255;

        if (alpha > 0) {
          // Generate texture value based on pattern
          let textureValue = 1;

          switch (texture.pattern) {
            case 'noise':
              textureValue = (Math.sin(x * texture.scale * 0.1) + Math.sin(y * texture.scale * 0.1)) * 0.5 + 0.5;
              break;
            case 'dots':
              const dotX = Math.sin(x * texture.scale * 0.05) * 0.5 + 0.5;
              const dotY = Math.sin(y * texture.scale * 0.05) * 0.5 + 0.5;
              textureValue = dotX * dotY;
              break;
            case 'stripes':
              textureValue = Math.sin((x + y) * texture.scale * 0.02) * 0.5 + 0.5;
              break;
            default:
              textureValue = 1;
          }

          // Apply texture rotation
          if (texture.rotation !== 0) {
            const angle = (texture.rotation * Math.PI) / 180;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const centerX = size / 2;
            const centerY = size / 2;
            const dx = x - centerX;
            const dy = y - centerY;
            const rotatedX = dx * cos - dy * sin + centerX;
            const rotatedY = dx * sin + dy * cos + centerY;

            // Recalculate texture value at rotated position
            textureValue = (Math.sin(rotatedX * texture.scale * 0.1) + Math.sin(rotatedY * texture.scale * 0.1)) * 0.5 + 0.5;
          }

          // Blend texture with alpha
          const blendedAlpha = alpha * (textureValue * texture.opacity + (1 - texture.opacity));
          data[index + 3] = Math.floor(blendedAlpha * 255);
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, []);

  /**
   * Generate cache key for brush settings
   */
  const getBrushCacheKey = useCallback((settings: BrushSettings): string => {
    return `${settings.size}-${settings.opacity}-${settings.hardness}-${settings.shape}-${settings.angle}-${JSON.stringify(settings.texture)}`;
  }, []);

  /**
   * Render a complete brush stroke
   */
  const renderBrushStroke = useCallback((points: BrushPoint[], settings: BrushSettings, targetCtx?: CanvasRenderingContext2D) => {
    if (points.length === 0) return;

    const ctx = targetCtx || initializeEngine().ctx;

    // Save context state
    ctx.save();

    // Set blend mode
    ctx.globalCompositeOperation = settings.blendMode;

    // Process each point in the stroke
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const dynamics = calculateBrushDynamics(point, settings, i);

      // Create or get brush stamp
      const brushStamp = createBrushStamp({
        ...settings,
        size: dynamics.size,
        opacity: dynamics.opacity,
        angle: dynamics.angle
      });

      // Position and draw the stamp
      const x = point.x - brushStamp.width / 2;
      const y = point.y - brushStamp.height / 2;

      // Apply rotation if needed
      if (dynamics.angle !== 0) {
        ctx.save();
        ctx.translate(x + brushStamp.width / 2, y + brushStamp.height / 2);
        ctx.rotate((dynamics.angle * Math.PI) / 180);
        ctx.drawImage(brushStamp, -brushStamp.width / 2, -brushStamp.height / 2);
        ctx.restore();
      } else {
        ctx.drawImage(brushStamp, x, y);
      }
    }

    // Restore context state
    ctx.restore();
  }, [initializeEngine, calculateBrushDynamics, createBrushStamp]);

  /**
   * Clear all caches
   */
  const clearCache = useCallback(() => {
    if (stateRef.current) {
      stateRef.current.brushCache.clear();
      stateRef.current.strokeCache.clear();
    }
  }, []);

  /**
   * Dispose of resources
   */
  const dispose = useCallback(() => {
    clearCache();
    stateRef.current = null;
  }, [clearCache]);

  // Return the API
  return useMemo(() => ({
    renderBrushStroke,
    createBrushStamp,
    calculateBrushDynamics,
    getBrushCacheKey,
    clearCache,
    dispose
  }), [renderBrushStroke, createBrushStamp, calculateBrushDynamics, getBrushCacheKey, clearCache, dispose]);
}
