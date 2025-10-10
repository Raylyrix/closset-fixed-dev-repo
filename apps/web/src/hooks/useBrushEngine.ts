import { useCallback, useRef, useMemo, useEffect } from 'react';
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
    const stampSize = Math.ceil(settings.size * 2); // Increased size for better detail
    const stampCanvas = document.createElement('canvas');
    stampCanvas.width = stampSize;
    stampCanvas.height = stampSize;
    const stampCtx = stampCanvas.getContext('2d')!;

    const centerX = stampSize / 2;
    const centerY = stampSize / 2;
    const radius = settings.size;

    // Clear canvas
    stampCtx.clearRect(0, 0, stampSize, stampSize);

    // Create brush-specific stamp based on shape
    createBrushSpecificStamp(stampCtx, settings, stampSize, centerX, centerY, radius);

    // Cache the result
    state.brushCache.set(cacheKey, stampCanvas);

    return stampCanvas;
  }, [initializeEngine]);

  /**
   * Create brush-specific stamp with unique characteristics for each type
   */
  const createBrushSpecificStamp = useCallback((
    ctx: CanvasRenderingContext2D, 
    settings: BrushSettings, 
    size: number, 
    centerX: number, 
    centerY: number, 
    radius: number
  ) => {
    // Get image data for pixel manipulation
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;
    
    // Create unique patterns for each brush type
    switch (settings.shape) {
      case 'round':
        createRoundBrush(data, size, centerX, centerY, radius, settings);
        break;
      case 'square':
        createSquareBrush(data, size, centerX, centerY, radius, settings);
        break;
      case 'diamond':
        createDiamondBrush(data, size, centerX, centerY, radius, settings);
        break;
      case 'triangle':
        createTriangleBrush(data, size, centerX, centerY, radius, settings);
        break;
      case 'airbrush':
        createAirbrushBrush(data, size, centerX, centerY, radius, settings);
        break;
      case 'spray':
        createSprayBrush(data, size, centerX, centerY, radius, settings);
        break;
      case 'texture':
        createTextureBrush(data, size, centerX, centerY, radius, settings);
        break;
      case 'watercolor':
        createWatercolorBrush(data, size, centerX, centerY, radius, settings);
        break;
      case 'oil':
        createOilBrush(data, size, centerX, centerY, radius, settings);
        break;
      case 'acrylic':
        createAcrylicBrush(data, size, centerX, centerY, radius, settings);
        break;
      case 'gouache':
        createGouacheBrush(data, size, centerX, centerY, radius, settings);
        break;
      case 'ink':
        createInkBrush(data, size, centerX, centerY, radius, settings);
        break;
      case 'pencil':
        createPencilBrush(data, size, centerX, centerY, radius, settings);
        break;
      case 'charcoal':
        createCharcoalBrush(data, size, centerX, centerY, radius, settings);
        break;
      case 'pastel':
        createPastelBrush(data, size, centerX, centerY, radius, settings);
        break;
      case 'chalk':
        createChalkBrush(data, size, centerX, centerY, radius, settings);
        break;
      case 'marker':
        createMarkerBrush(data, size, centerX, centerY, radius, settings);
        break;
      case 'highlighter':
        createHighlighterBrush(data, size, centerX, centerY, radius, settings);
        break;
      case 'calligraphy':
        createCalligraphyBrush(data, size, centerX, centerY, radius, settings);
        break;
      case 'stencil':
        createStencilBrush(data, size, centerX, centerY, radius, settings);
        break;
      case 'stamp':
        createStampBrush(data, size, centerX, centerY, radius, settings);
        break;
      case 'blur':
        createBlurBrush(data, size, centerX, centerY, radius, settings);
        break;
      case 'smudge':
        createSmudgeBrush(data, size, centerX, centerY, radius, settings);
        break;
      default:
        createRoundBrush(data, size, centerX, centerY, radius, settings);
    }
    
    // Put the image data back to canvas
    ctx.putImageData(imageData, 0, 0);
  }, []);

  // Individual brush creation functions with unique characteristics
  const createRoundBrush = (data: Uint8ClampedArray, size: number, centerX: number, centerY: number, radius: number, settings: BrushSettings) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const normalizedDistance = distance / radius;
        
        if (normalizedDistance > 1) continue;
        
        const index = (y * size + x) * 4;
        const hardness = settings.hardness;
        let alpha = settings.opacity * 255;
        
        if (normalizedDistance > hardness) {
          const falloff = 1 - (normalizedDistance - hardness) / (1 - hardness);
          alpha *= Math.max(0, falloff);
        }
        
        // Parse brush color and apply it
        const color = settings.color || '#000000';
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        data[index] = r;     // R
        data[index + 1] = g; // G
        data[index + 2] = b; // B
        data[index + 3] = alpha; // A
      }
    }
  };

  const createSquareBrush = (data: Uint8ClampedArray, size: number, centerX: number, centerY: number, radius: number, settings: BrushSettings) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = Math.abs(x - centerX);
        const dy = Math.abs(y - centerY);
        const maxDist = Math.max(dx, dy);
        const normalizedDistance = maxDist / radius;
        
        if (normalizedDistance > 1) continue;
        
        const index = (y * size + x) * 4;
        const alpha = settings.opacity * 255;
        
        // Parse brush color and apply it
        const color = settings.color || '#000000';
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = alpha;
      }
    }
  };

  const createDiamondBrush = (data: Uint8ClampedArray, size: number, centerX: number, centerY: number, radius: number, settings: BrushSettings) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const diamondDist = (Math.abs(dx) + Math.abs(dy)) / Math.SQRT2;
        const normalizedDistance = diamondDist / radius;
        
        if (normalizedDistance > 1) continue;
        
        const index = (y * size + x) * 4;
        const alpha = settings.opacity * 255;
        
        // Parse brush color and apply it
        const color = settings.color || '#000000';
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = alpha;
      }
    }
  };

  const createTriangleBrush = (data: Uint8ClampedArray, size: number, centerX: number, centerY: number, radius: number, settings: BrushSettings) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const angle = Math.atan2(dy, dx);
        const segment = Math.floor((angle + Math.PI) / (Math.PI * 2) * 3);
        const baseAngle = segment * Math.PI * 2 / 3;
        const relativeAngle = Math.abs(angle - baseAngle);
        const triangleDist = Math.sqrt(dx * dx + dy * dy) * Math.cos(relativeAngle);
        const normalizedDistance = triangleDist / radius;
        
        if (normalizedDistance > 1) continue;
        
        const index = (y * size + x) * 4;
        const alpha = settings.opacity * 255;
        
        // Parse brush color and apply it
        const color = settings.color || '#000000';
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = alpha;
      }
    }
  };

  const createAirbrushBrush = (data: Uint8ClampedArray, size: number, centerX: number, centerY: number, radius: number, settings: BrushSettings) => {
    // Create realistic airbrush with pressure variations and nozzle patterns
    const nozzleCount = Math.floor(radius / 3) + 1; // Multiple nozzles for larger brushes
    const pressureVariation = 0.3; // Simulate pressure variations
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const normalizedDistance = distance / radius;
        
        if (normalizedDistance > 1) continue;
        
        const index = (y * size + x) * 4;
        
        // Create multiple nozzle pattern
        let totalAlpha = 0;
        for (let nozzle = 0; nozzle < nozzleCount; nozzle++) {
          const nozzleAngle = (nozzle / nozzleCount) * Math.PI * 2;
          const nozzleDistance = (nozzle % 2 === 0) ? 0 : radius * 0.3; // Alternating pattern
          
          const nozzleX = centerX + Math.cos(nozzleAngle) * nozzleDistance;
          const nozzleY = centerY + Math.sin(nozzleAngle) * nozzleDistance;
          
          const nozzleDx = x - nozzleX;
          const nozzleDy = y - nozzleY;
          const nozzleDist = Math.sqrt(nozzleDx * nozzleDx + nozzleDy * nozzleDy);
          const nozzleNormDist = nozzleDist / (radius * 0.7);
          
          if (nozzleNormDist <= 1) {
            // Add pressure variation and turbulence
            const pressure = 0.7 + Math.sin(x * 0.2 + y * 0.15 + nozzle) * pressureVariation;
            const turbulence = Math.sin(x * 0.1) * Math.cos(y * 0.1) + Math.sin(x * 0.05) * Math.sin(y * 0.05);
            const turbulenceFactor = 1 + turbulence * 0.2;
            
            const nozzleAlpha = settings.opacity * 255 * pressure * turbulenceFactor * 
                               Math.exp(-nozzleNormDist * nozzleNormDist * 1.5);
            totalAlpha += nozzleAlpha;
          }
        }
        
        // Add some random speckles for realistic airbrush texture
        const speckleChance = Math.random();
        if (speckleChance < 0.1) { // 10% chance of speckle
          const speckleIntensity = Math.random() * 0.5 + 0.5;
          totalAlpha += settings.opacity * 255 * speckleIntensity * 0.3;
        }
        
        // Parse brush color and apply it
        const color = settings.color || '#000000';
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = Math.max(0, Math.min(255, totalAlpha / nozzleCount));
      }
    }
  };

  const createSprayBrush = (data: Uint8ClampedArray, size: number, centerX: number, centerY: number, radius: number, settings: BrushSettings) => {
    // Create realistic spray can effect with scattered particles
    const particleCount = Math.floor(radius * radius * 0.3); // More particles for larger brushes
    
    for (let i = 0; i < particleCount; i++) {
      // Generate random position within spray area
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;
      const sprayX = centerX + Math.cos(angle) * distance;
      const sprayY = centerY + Math.sin(angle) * distance;
      
      // Add some randomness to particle size
      const particleSize = Math.random() * 3 + 1;
      const particleOpacity = Math.random() * 0.8 + 0.2;
      
      // Create individual particle
      for (let py = Math.floor(sprayY - particleSize); py <= Math.floor(sprayY + particleSize); py++) {
        for (let px = Math.floor(sprayX - particleSize); px <= Math.floor(sprayX + particleSize); px++) {
          if (px < 0 || px >= size || py < 0 || py >= size) continue;
          
          const particleDx = px - sprayX;
          const particleDy = py - sprayY;
          const particleDist = Math.sqrt(particleDx * particleDx + particleDy * particleDy);
          
          if (particleDist <= particleSize) {
            const index = (py * size + px) * 4;
            const falloff = 1 - (particleDist / particleSize);
            const alpha = settings.opacity * 255 * particleOpacity * falloff;
            
            // Parse brush color and apply it
            const color = settings.color || '#000000';
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            
            data[index] = r;
            data[index + 1] = g;
            data[index + 2] = b;
            data[index + 3] = Math.max(0, Math.min(255, alpha));
          }
        }
      }
    }
    
    // Add some overspray particles outside the main area
    for (let i = 0; i < particleCount * 0.2; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = radius + Math.random() * radius * 0.5; // Overspray area
      const sprayX = centerX + Math.cos(angle) * distance;
      const sprayY = centerY + Math.sin(angle) * distance;
      
      if (sprayX >= 0 && sprayX < size && sprayY >= 0 && sprayY < size) {
        const index = (Math.floor(sprayY) * size + Math.floor(sprayX)) * 4;
        const alpha = settings.opacity * 255 * 0.1 * Math.random();
        
        // Parse brush color and apply it
        const color = settings.color || '#000000';
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = Math.max(0, Math.min(255, alpha));
      }
    }
  };

  const createTextureBrush = (data: Uint8ClampedArray, size: number, centerX: number, centerY: number, radius: number, settings: BrushSettings) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const normalizedDistance = distance / radius;
        
        if (normalizedDistance > 1) continue;
        
        const index = (y * size + x) * 4;
        // Add canvas-like grain
        const textureNoise = Math.sin(x * 0.2) * Math.cos(y * 0.2) + Math.sin(x * 0.5) * Math.sin(y * 0.5);
        const textureFactor = 0.8 + textureNoise * 0.4;
        const alpha = settings.opacity * 255 * textureFactor * Math.exp(-normalizedDistance * normalizedDistance);
        
        // Parse brush color and apply it
        const color = settings.color || '#000000';
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = Math.max(0, Math.min(255, alpha));
      }
    }
  };

  const createWatercolorBrush = (data: Uint8ClampedArray, size: number, centerX: number, centerY: number, radius: number, settings: BrushSettings) => {
    // Create realistic watercolor with water flow and bleeding effects
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const normalizedDistance = distance / radius;
        
        if (normalizedDistance > 1.2) continue; // Allow some bleeding outside
        
        const index = (y * size + x) * 4;
        
        // Create water flow patterns
        const flowX = Math.sin(x * 0.05) * Math.cos(y * 0.03);
        const flowY = Math.cos(x * 0.03) * Math.sin(y * 0.05);
        const flowMagnitude = Math.sqrt(flowX * flowX + flowY * flowY);
        
        // Create bleeding effect - color spreads more in certain directions
        const bleedingFactor = 1 + flowMagnitude * 0.4;
        const waterSaturation = Math.sin(x * 0.08) * Math.cos(y * 0.08) + 
                               Math.sin(x * 0.15) * Math.sin(y * 0.15);
        
        // Watercolor has variable opacity based on water content
        const waterContent = 0.6 + waterSaturation * 0.4;
        const baseAlpha = settings.opacity * 255 * waterContent;
        
        // Create soft, organic falloff with bleeding
        let alpha = baseAlpha;
        if (normalizedDistance <= 0.8) {
          // Core area - full opacity
          alpha = baseAlpha;
        } else if (normalizedDistance <= 1.0) {
          // Transition area - gradual falloff
          const falloff = 1 - (normalizedDistance - 0.8) / 0.2;
          alpha = baseAlpha * falloff;
        } else {
          // Bleeding area - very soft, directional
          const bleedDistance = normalizedDistance - 1.0;
          const bleedAlpha = baseAlpha * 0.3 * bleedingFactor * Math.exp(-bleedDistance * 5);
          alpha = bleedAlpha;
        }
        
        // Add some paper texture variation
        const paperTexture = Math.sin(x * 0.2) * Math.cos(y * 0.2);
        const textureVariation = 0.9 + paperTexture * 0.2;
        alpha *= textureVariation;
        
        // Parse brush color and apply it
        const color = settings.color || '#000000';
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = Math.max(0, Math.min(255, alpha));
      }
    }
  };

  const createOilBrush = (data: Uint8ClampedArray, size: number, centerX: number, centerY: number, radius: number, settings: BrushSettings) => {
    // Create realistic oil paint with thick, rich texture and brush stroke patterns
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const normalizedDistance = distance / radius;
        
        if (normalizedDistance > 1) continue;
        
        const index = (y * size + x) * 4;
        
        // Create brush stroke patterns (oil paint shows brush marks)
        const strokeAngle = Math.atan2(dy, dx);
        const strokePattern = Math.sin(strokeAngle * 8 + x * 0.1 + y * 0.1);
        const strokeVariation = 0.85 + strokePattern * 0.3;
        
        // Create thick paint texture with impasto effect
        const paintThickness = Math.sin(x * 0.03) * Math.cos(y * 0.03) + 
                              Math.sin(x * 0.07) * Math.sin(y * 0.07);
        const thicknessVariation = 0.8 + paintThickness * 0.4;
        
        // Oil paint has rich, opaque coverage with some texture variation
        const baseOpacity = settings.opacity * 255 * thicknessVariation * strokeVariation;
        
        // Create smooth falloff with slight texture
        let alpha = baseOpacity;
        if (normalizedDistance <= 0.7) {
          // Core area - full rich coverage
          alpha = baseOpacity;
        } else {
          // Edge area - gradual falloff with paint texture
          const falloff = 1 - (normalizedDistance - 0.7) / 0.3;
          const edgeTexture = Math.sin(x * 0.1) * Math.cos(y * 0.1);
          const textureFactor = 0.9 + edgeTexture * 0.2;
          alpha = baseOpacity * falloff * textureFactor;
        }
        
        // Add some random paint globules for realistic texture
        const globuleChance = Math.random();
        if (globuleChance < 0.05) { // 5% chance of paint globule
          const globuleIntensity = Math.random() * 0.3 + 0.7;
          alpha += settings.opacity * 255 * globuleIntensity * 0.2;
        }
        
        // Parse brush color and apply it
        const color = settings.color || '#000000';
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = Math.max(0, Math.min(255, alpha));
      }
    }
  };

  const createAcrylicBrush = (data: Uint8ClampedArray, size: number, centerX: number, centerY: number, radius: number, settings: BrushSettings) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const normalizedDistance = distance / radius;
        
        if (normalizedDistance > 1) continue;
        
        const index = (y * size + x) * 4;
        // Quick-drying acrylic with slight texture
        const acrylicTexture = Math.sin(x * 0.12) * Math.cos(y * 0.12);
        const textureFactor = 0.85 + acrylicTexture * 0.3;
        const alpha = settings.opacity * 255 * textureFactor * Math.exp(-normalizedDistance * normalizedDistance * 0.9);
        
        // Parse brush color and apply it
        const color = settings.color || '#000000';
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = Math.max(0, Math.min(255, alpha));
      }
    }
  };

  const createGouacheBrush = (data: Uint8ClampedArray, size: number, centerX: number, centerY: number, radius: number, settings: BrushSettings) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const normalizedDistance = distance / radius;
        
        if (normalizedDistance > 1) continue;
        
        const index = (y * size + x) * 4;
        // Matte gouache with flat coverage
        const alpha = settings.opacity * 255 * Math.exp(-normalizedDistance * normalizedDistance * 0.7);
        
        // Parse brush color and apply it
        const color = settings.color || '#000000';
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = Math.max(0, Math.min(255, alpha));
      }
    }
  };

  const createInkBrush = (data: Uint8ClampedArray, size: number, centerX: number, centerY: number, radius: number, settings: BrushSettings) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const normalizedDistance = distance / radius;
        
        if (normalizedDistance > 1) continue;
        
        const index = (y * size + x) * 4;
        // Sharp, precise ink brush
        const alpha = settings.opacity * 255 * Math.exp(-normalizedDistance * normalizedDistance * 3);
        
        // Parse brush color and apply it
        const color = settings.color || '#000000';
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = Math.max(0, Math.min(255, alpha));
      }
    }
  };

  const createPencilBrush = (data: Uint8ClampedArray, size: number, centerX: number, centerY: number, radius: number, settings: BrushSettings) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const normalizedDistance = distance / radius;
        
        if (normalizedDistance > 1) continue;
        
        const index = (y * size + x) * 4;
        // Pencil with graphite texture
        const pencilGrain = Math.sin(x * 0.4) * Math.cos(y * 0.4) + Math.sin(x * 0.8) * Math.sin(y * 0.8);
        const grainFactor = 0.7 + pencilGrain * 0.3;
        const alpha = settings.opacity * 255 * grainFactor * Math.exp(-normalizedDistance * normalizedDistance * 2);
        
        // Parse brush color and apply it
        const color = settings.color || '#000000';
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = Math.max(0, Math.min(255, alpha));
      }
    }
  };

  const createCharcoalBrush = (data: Uint8ClampedArray, size: number, centerX: number, centerY: number, radius: number, settings: BrushSettings) => {
    // Create realistic charcoal with rough, grainy texture and irregular coverage
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const normalizedDistance = distance / radius;
        
        if (normalizedDistance > 1) continue;
        
        const index = (y * size + x) * 4;
        
        // Create multiple layers of charcoal grain
        let totalAlpha = 0;
        const grainLayers = 3;
        
        for (let layer = 0; layer < grainLayers; layer++) {
          const layerScale = Math.pow(2, layer); // Different grain sizes
          const grainFreq = 0.1 * layerScale;
          
          // Create rough charcoal texture
          const grain1 = Math.sin(x * grainFreq) * Math.cos(y * grainFreq);
          const grain2 = Math.sin(x * grainFreq * 1.7) * Math.sin(y * grainFreq * 1.3);
          const grain3 = Math.sin(x * grainFreq * 2.3) * Math.cos(y * grainFreq * 0.7);
          
          const combinedGrain = (grain1 + grain2 + grain3) / 3;
          const grainIntensity = 0.6 + combinedGrain * 0.4;
          
          // Charcoal has irregular coverage - some areas are dense, others sparse
          const coverage = Math.sin(x * 0.05 + layer) * Math.cos(y * 0.05 + layer);
          const coverageVariation = 0.7 + coverage * 0.6;
          
          const layerAlpha = settings.opacity * 255 * grainIntensity * coverageVariation * 
                           Math.exp(-normalizedDistance * normalizedDistance * (1.2 + layer * 0.3));
          
          totalAlpha += layerAlpha / grainLayers;
        }
        
        // Add some random charcoal particles for realistic texture
        const particleChance = Math.random();
        if (particleChance < 0.15) { // 15% chance of charcoal particle
          const particleSize = Math.random() * 2 + 1;
          const particleIntensity = Math.random() * 0.8 + 0.2;
          
          // Check if this pixel is within a particle
          const particleX = Math.floor(x / particleSize) * particleSize;
          const particleY = Math.floor(y / particleSize) * particleSize;
          const particleDx = x - particleX - particleSize/2;
          const particleDy = y - particleY - particleSize/2;
          const particleDist = Math.sqrt(particleDx * particleDx + particleDy * particleDy);
          
          if (particleDist <= particleSize/2) {
            const particleAlpha = settings.opacity * 255 * particleIntensity * 
                                (1 - particleDist / (particleSize/2));
            totalAlpha += particleAlpha * 0.3;
          }
        }
        
        // Parse brush color and apply it
        const color = settings.color || '#000000';
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = Math.max(0, Math.min(255, totalAlpha));
      }
    }
  };

  const createPastelBrush = (data: Uint8ClampedArray, size: number, centerX: number, centerY: number, radius: number, settings: BrushSettings) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const normalizedDistance = distance / radius;
        
        if (normalizedDistance > 1) continue;
        
        const index = (y * size + x) * 4;
        // Soft pastel with chalky texture
        const pastelChalk = Math.sin(x * 0.15) * Math.cos(y * 0.15);
        const chalkFactor = 0.75 + pastelChalk * 0.5;
        const alpha = settings.opacity * 255 * chalkFactor * Math.exp(-normalizedDistance * normalizedDistance * 0.6);
        
        // Parse brush color and apply it
        const color = settings.color || '#000000';
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = Math.max(0, Math.min(255, alpha));
      }
    }
  };

  const createChalkBrush = (data: Uint8ClampedArray, size: number, centerX: number, centerY: number, radius: number, settings: BrushSettings) => {
    // Create realistic chalk with powdery, dusty texture and irregular coverage
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const normalizedDistance = distance / radius;
        
        if (normalizedDistance > 1.1) continue; // Allow some dust particles outside
        
        const index = (y * size + x) * 4;
        
        // Create powdery chalk texture with multiple grain sizes
        let totalAlpha = 0;
        const dustLayers = 4;
        
        for (let layer = 0; layer < dustLayers; layer++) {
          const layerScale = Math.pow(1.5, layer); // Different dust particle sizes
          const dustFreq = 0.15 * layerScale;
          
          // Create chalk dust patterns
          const dust1 = Math.sin(x * dustFreq) * Math.cos(y * dustFreq);
          const dust2 = Math.sin(x * dustFreq * 1.3) * Math.sin(y * dustFreq * 0.8);
          const dust3 = Math.sin(x * dustFreq * 0.7) * Math.cos(y * dustFreq * 1.4);
          
          const combinedDust = (dust1 + dust2 + dust3) / 3;
          const dustIntensity = 0.4 + combinedDust * 0.6;
          
          // Chalk has very irregular coverage - lots of gaps and clumps
          const coverage = Math.sin(x * 0.08 + layer) * Math.cos(y * 0.08 + layer);
          const coverageVariation = 0.3 + coverage * 0.7;
          
          const layerAlpha = settings.opacity * 255 * dustIntensity * coverageVariation * 
                           Math.exp(-normalizedDistance * normalizedDistance * (0.4 + layer * 0.2));
          
          totalAlpha += layerAlpha / dustLayers;
        }
        
        // Add random chalk dust particles
        const dustChance = Math.random();
        if (dustChance < 0.25) { // 25% chance of dust particle
          const dustSize = Math.random() * 4 + 2;
          const dustIntensity = Math.random() * 0.6 + 0.4;
          
          // Create individual dust particles
          const dustX = Math.floor(x / dustSize) * dustSize;
          const dustY = Math.floor(y / dustSize) * dustSize;
          const dustDx = x - dustX - dustSize/2;
          const dustDy = y - dustY - dustSize/2;
          const dustDist = Math.sqrt(dustDx * dustDx + dustDy * dustDy);
          
          if (dustDist <= dustSize/2) {
            const dustAlpha = settings.opacity * 255 * dustIntensity * 
                            (1 - dustDist / (dustSize/2)) * 0.8;
            totalAlpha += dustAlpha;
          }
        }
        
        // Add some chalk streaks for realistic texture
        const streakChance = Math.random();
        if (streakChance < 0.1) { // 10% chance of chalk streak
          const streakIntensity = Math.random() * 0.4 + 0.6;
          totalAlpha += settings.opacity * 255 * streakIntensity * 0.2;
        }
        
        // Parse brush color and apply it
        const color = settings.color || '#000000';
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = Math.max(0, Math.min(255, totalAlpha));
      }
    }
  };

  const createMarkerBrush = (data: Uint8ClampedArray, size: number, centerX: number, centerY: number, radius: number, settings: BrushSettings) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const normalizedDistance = distance / radius;
        
        if (normalizedDistance > 1) continue;
        
        const index = (y * size + x) * 4;
        // Marker with smooth, even coverage
        const alpha = settings.opacity * 255 * Math.exp(-normalizedDistance * normalizedDistance * 1.2);
        
        // Parse brush color and apply it
        const color = settings.color || '#000000';
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = Math.max(0, Math.min(255, alpha));
      }
    }
  };

  const createHighlighterBrush = (data: Uint8ClampedArray, size: number, centerX: number, centerY: number, radius: number, settings: BrushSettings) => {
    // Create realistic highlighter with translucent, glowing effect and smooth coverage
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const normalizedDistance = distance / radius;
        
        if (normalizedDistance > 1) continue;
        
        const index = (y * size + x) * 4;
        
        // Highlighter has very low base opacity (translucent)
        const baseOpacity = settings.opacity * 255 * 0.3; // 30% of normal opacity
        
        // Create smooth, even coverage with slight glow variation
        const glowVariation = Math.sin(x * 0.08) * Math.cos(y * 0.08);
        const glowFactor = 0.9 + glowVariation * 0.2;
        
        // Highlighter has very soft, even falloff
        const alpha = baseOpacity * glowFactor * Math.exp(-normalizedDistance * normalizedDistance * 0.5);
        
        // Add some subtle streaks for realistic highlighter texture
        const streakPattern = Math.sin(x * 0.15 + y * 0.1);
        const streakFactor = 1 + streakPattern * 0.1;
        
        const finalAlpha = alpha * streakFactor;
        
        // Parse brush color and apply it
        const color = settings.color || '#000000';
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = Math.max(0, Math.min(255, finalAlpha));
      }
    }
  };

  const createCalligraphyBrush = (data: Uint8ClampedArray, size: number, centerX: number, centerY: number, radius: number, settings: BrushSettings) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const angleRad = (settings.angle * Math.PI) / 180;
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);
        const rotatedDx = dx * cos - dy * sin;
        const rotatedDy = dx * sin + dy * cos;
        const ellipseDist = Math.sqrt(rotatedDx * rotatedDx + rotatedDy * rotatedDy * 2) / radius;
        
        if (ellipseDist > 1) continue;
        
        const index = (y * size + x) * 4;
        const alpha = settings.opacity * 255;
        
        // Parse brush color and apply it
        const color = settings.color || '#000000';
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = alpha;
      }
    }
  };

  const createStencilBrush = (data: Uint8ClampedArray, size: number, centerX: number, centerY: number, radius: number, settings: BrushSettings) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = Math.abs(x - centerX);
        const dy = Math.abs(y - centerY);
        const maxDist = Math.max(dx, dy);
        const normalizedDistance = maxDist / radius;
        
        if (normalizedDistance > 0.95) continue;
        
        const index = (y * size + x) * 4;
        const alpha = settings.opacity * 255;
        
        // Parse brush color and apply it
        const color = settings.color || '#000000';
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = alpha;
      }
    }
  };

  const createStampBrush = (data: Uint8ClampedArray, size: number, centerX: number, centerY: number, radius: number, settings: BrushSettings) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const normalizedDistance = distance / radius;
        
        if (normalizedDistance > 0.9) continue;
        
        const index = (y * size + x) * 4;
        const alpha = settings.opacity * 255;
        
        // Parse brush color and apply it
        const color = settings.color || '#000000';
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = alpha;
      }
    }
  };

  const createBlurBrush = (data: Uint8ClampedArray, size: number, centerX: number, centerY: number, radius: number, settings: BrushSettings) => {
    // Create realistic blur effect with very soft, diffused edges
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const normalizedDistance = distance / radius;
        
        if (normalizedDistance > 1.5) continue; // Extended blur area
        
        const index = (y * size + x) * 4;
        
        // Blur has very soft, gradual falloff
        let alpha = 0;
        
        if (normalizedDistance <= 0.5) {
          // Core area - moderate opacity
          alpha = settings.opacity * 255 * 0.8;
        } else if (normalizedDistance <= 1.0) {
          // Transition area - gradual falloff
          const falloff = 1 - (normalizedDistance - 0.5) / 0.5;
          alpha = settings.opacity * 255 * 0.8 * falloff;
        } else {
          // Extended blur area - very soft diffusion
          const blurDistance = normalizedDistance - 1.0;
          alpha = settings.opacity * 255 * 0.3 * Math.exp(-blurDistance * 2);
        }
        
        // Add some subtle variation for realistic blur texture
        const blurVariation = Math.sin(x * 0.05) * Math.cos(y * 0.05);
        const variationFactor = 0.95 + blurVariation * 0.1;
        
        const finalAlpha = alpha * variationFactor;
        
        // Parse brush color and apply it
        const color = settings.color || '#000000';
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = Math.max(0, Math.min(255, finalAlpha));
      }
    }
  };

  const createSmudgeBrush = (data: Uint8ClampedArray, size: number, centerX: number, centerY: number, radius: number, settings: BrushSettings) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const normalizedDistance = distance / radius;
        
        if (normalizedDistance > 1) continue;
        
        const index = (y * size + x) * 4;
        // Smudge with directional texture
        const smudgeDirection = Math.sin(x * 0.2 + y * 0.1) * Math.cos(x * 0.1 - y * 0.2);
        const directionFactor = 0.8 + smudgeDirection * 0.4;
        const alpha = settings.opacity * 255 * directionFactor * Math.exp(-normalizedDistance * normalizedDistance * 0.7);
        
        // Parse brush color and apply it
        const color = settings.color || '#000000';
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = Math.max(0, Math.min(255, alpha));
      }
    }
  };

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
            // Soft, random falloff with airbrush texture
            const noise = (Math.sin(x * 0.1) + Math.sin(y * 0.1) + Math.sin(x * 0.05) * Math.sin(y * 0.05)) * 0.15;
            alpha *= Math.exp(-normalizedDistance * normalizedDistance * (1 + noise));
            break;

          case 'spray':
            // Random spray pattern with scattered dots
            const sprayNoise = Math.sin(x * 0.3) * Math.cos(y * 0.3) + Math.sin(x * 0.7) * Math.sin(y * 0.7);
            const sprayPattern = sprayNoise > 0.3 ? 1 : 0;
            alpha *= sprayPattern * Math.exp(-normalizedDistance * normalizedDistance * 2);
            break;

          case 'texture':
            // Textured brush with canvas-like grain
            const textureNoise = Math.sin(x * 0.2) * Math.cos(y * 0.2) + Math.sin(x * 0.5) * Math.sin(y * 0.5);
            alpha *= (0.8 + textureNoise * 0.4) * Math.exp(-normalizedDistance * normalizedDistance);
            break;

          case 'watercolor':
            // Soft, flowing watercolor effect
            const watercolorFlow = Math.sin(x * 0.08) * Math.cos(y * 0.08) + Math.sin(x * 0.15) * Math.sin(y * 0.15);
            alpha *= Math.exp(-normalizedDistance * normalizedDistance * (1 + watercolorFlow * 0.3));
            break;

          case 'oil':
            // Rich, thick oil paint effect
            const oilThickness = Math.sin(x * 0.05) * Math.cos(y * 0.05);
            alpha *= (0.9 + oilThickness * 0.2) * Math.exp(-normalizedDistance * normalizedDistance * 0.8);
            break;

          case 'acrylic':
            // Quick-drying acrylic with slight texture
            const acrylicTexture = Math.sin(x * 0.12) * Math.cos(y * 0.12);
            alpha *= (0.85 + acrylicTexture * 0.3) * Math.exp(-normalizedDistance * normalizedDistance * 0.9);
            break;

          case 'gouache':
            // Matte gouache with flat coverage
            alpha *= Math.exp(-normalizedDistance * normalizedDistance * 0.7);
            break;

          case 'ink':
            // Sharp, precise ink brush
            const inkPrecision = Math.exp(-normalizedDistance * normalizedDistance * 3);
            alpha *= inkPrecision;
            break;

          case 'pencil':
            // Pencil with graphite texture
            const pencilGrain = Math.sin(x * 0.4) * Math.cos(y * 0.4) + Math.sin(x * 0.8) * Math.sin(y * 0.8);
            alpha *= (0.7 + pencilGrain * 0.3) * Math.exp(-normalizedDistance * normalizedDistance * 2);
            break;

          case 'charcoal':
            // Charcoal with rough texture
            const charcoalRoughness = Math.sin(x * 0.25) * Math.cos(y * 0.25) + Math.sin(x * 0.6) * Math.sin(y * 0.6);
            alpha *= (0.8 + charcoalRoughness * 0.4) * Math.exp(-normalizedDistance * normalizedDistance * 1.5);
            break;

          case 'pastel':
            // Soft pastel with chalky texture
            const pastelChalk = Math.sin(x * 0.15) * Math.cos(y * 0.15);
            alpha *= (0.75 + pastelChalk * 0.5) * Math.exp(-normalizedDistance * normalizedDistance * 0.6);
            break;

          case 'chalk':
            // Chalk with powdery texture
            const chalkPowder = Math.sin(x * 0.3) * Math.cos(y * 0.3) + Math.sin(x * 0.6) * Math.sin(y * 0.6);
            alpha *= (0.6 + chalkPowder * 0.8) * Math.exp(-normalizedDistance * normalizedDistance * 0.5);
            break;

          case 'marker':
            // Marker with smooth, even coverage
            alpha *= Math.exp(-normalizedDistance * normalizedDistance * 1.2);
            break;

          case 'highlighter':
            // Translucent highlighter effect
            const highlighterGlow = Math.sin(x * 0.1) * Math.cos(y * 0.1);
            alpha *= (0.4 + highlighterGlow * 0.2) * Math.exp(-normalizedDistance * normalizedDistance * 0.8);
            break;

          case 'calligraphy':
            // Elliptical with angle for calligraphy
            const angleRad = (settings.angle * Math.PI) / 180;
            const cos = Math.cos(angleRad);
            const sin = Math.sin(angleRad);
            const rotatedDx = dx * cos - dy * sin;
            const rotatedDy = dx * sin + dy * cos;
            const ellipseDist = Math.sqrt(rotatedDx * rotatedDx + rotatedDy * rotatedDy * 2) / radius;
            alpha *= ellipseDist <= 1 ? 1 : 0;
            break;

          case 'stencil':
            // Sharp stencil edges with slight bleed
            const stencilDist = Math.max(Math.abs(dx), Math.abs(dy)) / radius;
            alpha *= stencilDist <= 0.95 ? 1 : Math.max(0, 1 - (stencilDist - 0.95) * 20);
            break;

          case 'stamp':
            // Even stamp coverage with slight edge softening
            const stampDist = normalizedDistance;
            alpha *= stampDist <= 0.9 ? 1 : Math.max(0, 1 - (stampDist - 0.9) * 10);
            break;

          case 'blur':
            // Blur effect with soft edges
            alpha *= Math.exp(-normalizedDistance * normalizedDistance * 0.3);
            break;

          case 'smudge':
            // Smudge with directional texture
            const smudgeDirection = Math.sin(x * 0.2 + y * 0.1) * Math.cos(x * 0.1 - y * 0.2);
            alpha *= (0.8 + smudgeDirection * 0.4) * Math.exp(-normalizedDistance * normalizedDistance * 0.7);
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

      // Position and draw the stamp - FIXED: Consistent positioning for both rotated and non-rotated stamps
      // Always translate to the point position first, then apply rotation and draw centered
      if (dynamics.angle !== 0) {
        ctx.save();
        ctx.translate(point.x, point.y);
        ctx.rotate((dynamics.angle * Math.PI) / 180);
        ctx.drawImage(brushStamp, -brushStamp.width / 2, -brushStamp.height / 2);
        ctx.restore();
      } else {
        // Non-rotated: draw centered at point
        ctx.drawImage(brushStamp, point.x - brushStamp.width / 2, point.y - brushStamp.height / 2);
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
  const brushEngineAPI = useMemo(() => ({
    renderBrushStroke,
    createBrushStamp,
    calculateBrushDynamics,
    getBrushCacheKey,
    clearCache,
    dispose
  }), [renderBrushStroke, createBrushStamp, calculateBrushDynamics, getBrushCacheKey, clearCache, dispose]);

  // Expose brush engine globally for use in other components
  useEffect(() => {
    (window as any).__brushEngine = brushEngineAPI;
    return () => {
      delete (window as any).__brushEngine;
    };
  }, [brushEngineAPI]);

  return brushEngineAPI;
}
