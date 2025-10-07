import { getHardwareProfile } from './HardwareProfiler';
import * as THREE from 'three';

/**
 * Performance Orchestrator - Dynamically adjusts rendering parameters based on hardware tier
 */
export class PerformanceOrchestrator {
  constructor() {
    this.currentTier = 'medium';
    this.textureMaxOverride = null;
    this.settings = {
      low: {
        maxTextureSize: 1024,
        anisotropy: 2,
        generateMipmaps: false,
        debounceDelay: 64,
        vectorRenderDelay: 100,
        maxVectorPoints: 500,
        enableShadows: false,
        antialias: false
      },
      medium: {
        maxTextureSize: 2048,
        anisotropy: 8,
        generateMipmaps: true,
        debounceDelay: 32,
        vectorRenderDelay: 50,
        maxVectorPoints: 1000,
        enableShadows: true,
        antialias: true
      },
      high: {
        maxTextureSize: 4096,
        anisotropy: 16,
        generateMipmaps: true,
        debounceDelay: 16,
        vectorRenderDelay: 16,
        maxVectorPoints: 2000,
        enableShadows: true,
        antialias: true
      }
    };
  }

  async initialize() {
    try {
      const profile = await getHardwareProfile();
      this.currentTier = profile?.tier || 'medium';
      console.log('PerformanceOrchestrator: Initialized with tier:', this.currentTier);
      return this.currentTier;
    } catch (e) {
      console.warn('PerformanceOrchestrator: Falling back to medium tier due to profiler error', e);
      this.currentTier = 'medium';
      return this.currentTier;
    }
  }

  getSettings() {
    return this.settings[this.currentTier];
  }

  getTextureSettings() {
    const settings = this.getSettings();
    return {
      maxSize: this.textureMaxOverride ?? settings.maxTextureSize,
      anisotropy: settings.anisotropy,
      generateMipmaps: settings.generateMipmaps
    };
  }

  getDebounceSettings() {
    const settings = this.getSettings();
    return {
      composeDelay: settings.debounceDelay,
      vectorRenderDelay: settings.vectorRenderDelay
    };
  }

  getVectorSettings() {
    const settings = this.getSettings();
    return {
      maxPoints: settings.maxVectorPoints,
      renderDelay: settings.vectorRenderDelay
    };
  }

  getRenderSettings() {
    const settings = this.getSettings();
    return {
      enableShadows: settings.enableShadows,
      antialias: settings.antialias
    };
  }

  // Allow runtime override for texture max dimension based on alerts
  setTextureMaxOverride(size) {
    if (typeof size === 'number' && size > 0) {
      this.textureMaxOverride = size;
      console.log('PerformanceOrchestrator: texture max override set to', size);
    }
  }

  clearTextureMaxOverride() {
    this.textureMaxOverride = null;
    console.log('PerformanceOrchestrator: texture max override cleared');
  }

  // Adaptive texture creation based on hardware tier
  createOptimizedTexture(canvas, renderer) {
    const settings = this.getTextureSettings();
    const texture = new THREE.CanvasTexture(canvas);
    
    texture.anisotropy = Math.min(settings.anisotropy, renderer.capabilities.getMaxAnisotropy());
    texture.generateMipmaps = settings.generateMipmaps;
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    
    if (settings.generateMipmaps) {
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
    } else {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
    }
    
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    
    return texture;
  }

  // Monitor performance and adjust tier if needed
  monitorPerformance(frameTime) {
    if (frameTime > 33 && this.currentTier === 'high') {
      this.currentTier = 'medium';
      console.log('PerformanceOrchestrator: Downgraded to medium tier due to poor performance');
    } else if (frameTime > 50 && this.currentTier === 'medium') {
      this.currentTier = 'low';
      console.log('PerformanceOrchestrator: Downgraded to low tier due to poor performance');
    }
  }
}

// Global instance
export const performanceOrchestrator = new PerformanceOrchestrator();
