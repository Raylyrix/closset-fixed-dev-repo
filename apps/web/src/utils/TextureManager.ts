/**
 * TextureManager - Prevents Three.js memory leaks by managing texture lifecycle
 * Optimized for both low-end and high-end devices with adaptive quality
 */

import * as THREE from 'three';

interface TextureConfig {
  wrapS?: THREE.Wrapping;
  wrapT?: THREE.Wrapping;
  minFilter?: THREE.TextureFilter;
  magFilter?: THREE.TextureFilter;
  generateMipmaps?: boolean;
  anisotropy?: number;
  format?: THREE.PixelFormat;
  premultiplyAlpha?: boolean;
  flipY?: boolean;
  colorSpace?: THREE.ColorSpace;
}

interface DeviceCapabilities {
  isLowEnd: boolean;
  maxTextureSize: number;
  maxAnisotropy: number;
  supportsHighQuality: boolean;
}

class TextureManager {
  private textures: Map<string, THREE.Texture> = new Map();
  private textureConfigs: Map<string, TextureConfig> = new Map();
  private deviceCapabilities: DeviceCapabilities;
  private memoryUsage: number = 0;
  private maxMemoryMB: number = 256; // 256MB limit for low-end devices

  constructor() {
    this.deviceCapabilities = this.detectDeviceCapabilities();
    console.log('🧠 TextureManager initialized for device:', this.deviceCapabilities);
  }

  private detectDeviceCapabilities(): DeviceCapabilities {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    
    if (!gl) {
      return {
        isLowEnd: true,
        maxTextureSize: 1024,
        maxAnisotropy: 1,
        supportsHighQuality: false
      };
    }

    // PERFORMANCE FIX: Safe WebGL parameter detection to prevent INVALID_ENUM errors
    let maxTextureSize = 1024;
    let maxAnisotropy = 1;
    
    try {
      // Safe access to MAX_TEXTURE_SIZE
      if (gl && typeof gl.getParameter === 'function') {
        maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 1024;
      }
    } catch (error) {
      console.warn('🧠 Failed to get MAX_TEXTURE_SIZE:', error);
      maxTextureSize = 1024;
    }
    
    // Check if anisotropy extension is available before accessing its parameters
    try {
      if (gl && typeof gl.getExtension === 'function') {
        const ext = gl.getExtension('EXT_texture_filter_anisotropic') || 
                    gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic') || 
                    gl.getExtension('MOZ_EXT_texture_filter_anisotropic');
        
        if (ext && ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT && typeof gl.getParameter === 'function') {
          maxAnisotropy = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT) || 1;
        } else {
          console.log('🧠 Anisotropy extension not available, using default value');
          maxAnisotropy = 1;
        }
      }
    } catch (error) {
      console.warn('🧠 Failed to get anisotropy settings:', error);
      maxAnisotropy = 1;
    }
    
    // Detect low-end devices
    const isLowEnd = this.isLowEndDevice(maxTextureSize, maxAnisotropy);
    
    return {
      isLowEnd,
      maxTextureSize,
      maxAnisotropy: Math.min(maxAnisotropy, 16),
      supportsHighQuality: !isLowEnd && maxTextureSize >= 2048
    };
  }

  private isLowEndDevice(maxTextureSize: number, maxAnisotropy: number): boolean {
    // Low-end device detection based on WebGL capabilities
    const hasLimitedTextureSize = maxTextureSize < 2048;
    const hasLimitedAnisotropy = maxAnisotropy < 4;
    const hasLimitedMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory <= 2;
    const hasSlowConnection = (navigator as any).connection && 
      ((navigator as any).connection.effectiveType === 'slow-2g' || 
       (navigator as any).connection.effectiveType === '2g');

    return hasLimitedTextureSize || hasLimitedAnisotropy || hasLimitedMemory || hasSlowConnection;
  }

  private getOptimalConfig(): TextureConfig {
    const { isLowEnd, maxAnisotropy, supportsHighQuality } = this.deviceCapabilities;

    if (isLowEnd) {
      // Optimized for low-end devices
      return {
        wrapS: THREE.RepeatWrapping,
        wrapT: THREE.RepeatWrapping,
        minFilter: THREE.LinearFilter, // No mipmaps for memory
        magFilter: THREE.LinearFilter,
        generateMipmaps: false, // Disable mipmaps to save memory
        anisotropy: 1, // Minimal anisotropy
        format: THREE.RGBAFormat,
        premultiplyAlpha: false,
        flipY: false,
        colorSpace: THREE.SRGBColorSpace
      };
    } else {
      // High-quality settings for high-end devices
      return {
        wrapS: THREE.RepeatWrapping,
        wrapT: THREE.RepeatWrapping,
        minFilter: THREE.LinearMipmapLinearFilter,
        magFilter: THREE.LinearFilter,
        generateMipmaps: true,
        anisotropy: Math.min(maxAnisotropy, 16),
        format: THREE.RGBAFormat,
        premultiplyAlpha: false,
        flipY: false,
        colorSpace: THREE.SRGBColorSpace
      };
    }
  }

  private calculateTextureMemoryUsage(texture: THREE.Texture): number {
    if (!texture.image) return 0;
    
    const { width, height } = texture.image;
    const bytesPerPixel = 4; // RGBA
    const baseMemory = width * height * bytesPerPixel;
    
    // Add mipmap memory if enabled
    const mipmapMemory = texture.generateMipmaps ? baseMemory * 0.33 : 0;
    
    return (baseMemory + mipmapMemory) / (1024 * 1024); // Convert to MB
  }

  private shouldDisposeOldTexture(): boolean {
    const memoryUsageMB = this.memoryUsage;
    const { isLowEnd } = this.deviceCapabilities;
    const limit = isLowEnd ? this.maxMemoryMB * 0.5 : this.maxMemoryMB; // 50% limit for low-end
    
    return memoryUsageMB > limit;
  }

  updateTexture(key: string, canvas: HTMLCanvasElement, customConfig?: Partial<TextureConfig>): THREE.Texture {
    console.log('🧠 TextureManager: Updating texture', key, 'for device:', this.deviceCapabilities.isLowEnd ? 'low-end' : 'high-end');
    
    // PERFORMANCE FIX: Update existing texture instead of recreating
    let texture = this.textures.get(key);
    
    if (texture) {
      // Update existing texture
      texture.image = canvas;
      texture.needsUpdate = true;
      console.log('🧠 TextureManager: Updated existing texture', key);
    } else {
      // Only create new texture if it doesn't exist
      console.log('🧠 TextureManager: Creating new texture', key);
      
      // Check if we need to dispose some textures to free memory
      if (this.shouldDisposeOldTexture()) {
        this.cleanupOldTextures();
      }

      // Create new texture
      texture = new THREE.CanvasTexture(canvas);
      const config = { ...this.getOptimalConfig(), ...customConfig };
      
      // Apply configuration
      Object.assign(texture, config);
      texture.needsUpdate = true;

      // Store texture and config
      this.textures.set(key, texture);
      this.textureConfigs.set(key, config);
      
      // Update memory usage
      const memoryUsage = this.calculateTextureMemoryUsage(texture);
      this.memoryUsage += memoryUsage;
      
      console.log('🧠 Texture created:', {
        key,
        size: `${canvas.width}x${canvas.height}`,
        memoryUsage: `${memoryUsage.toFixed(2)}MB`,
        totalMemory: `${this.memoryUsage.toFixed(2)}MB`,
        config: config
      });
    }
    
    return texture;
  }

  private cleanupOldTextures(): void {
    const { isLowEnd } = this.deviceCapabilities;
    const targetReduction = isLowEnd ? 0.7 : 0.5; // Reduce to 70% for low-end, 50% for high-end
    
    const texturesToRemove: string[] = [];
    let currentMemory = this.memoryUsage;
    const targetMemory = this.maxMemoryMB * targetReduction;

    // Remove oldest textures until we're under target
    for (const [key, texture] of this.textures) {
      if (currentMemory <= targetMemory) break;
      
      const memoryUsage = this.calculateTextureMemoryUsage(texture);
      currentMemory -= memoryUsage;
      texturesToRemove.push(key);
    }

    // Dispose removed textures
    texturesToRemove.forEach(key => this.disposeTexture(key));
    
    console.log('🧠 TextureManager: Cleaned up', texturesToRemove.length, 'textures, memory reduced to', `${currentMemory.toFixed(2)}MB`);
  }

  disposeTexture(key: string): void {
    const texture = this.textures.get(key);
    if (texture) {
      const memoryUsage = this.calculateTextureMemoryUsage(texture);
      texture.dispose();
      this.memoryUsage -= memoryUsage;
      this.textures.delete(key);
      this.textureConfigs.delete(key);
      
      console.log('🧠 TextureManager: Disposed texture', key, `freed ${memoryUsage.toFixed(2)}MB`);
    }
  }

  disposeAll(): void {
    console.log('🧠 TextureManager: Disposing all textures');
    
    for (const [key, texture] of this.textures) {
      texture.dispose();
    }
    
    this.textures.clear();
    this.textureConfigs.clear();
    this.memoryUsage = 0;
    
    console.log('🧠 TextureManager: All textures disposed, memory freed');
  }

  getTexture(key: string): THREE.Texture | undefined {
    return this.textures.get(key);
  }

  getMemoryUsage(): { used: number; limit: number; percentage: number } {
    const percentage = (this.memoryUsage / this.maxMemoryMB) * 100;
    return {
      used: this.memoryUsage,
      limit: this.maxMemoryMB,
      percentage: Math.min(percentage, 100)
    };
  }

  getDeviceInfo(): DeviceCapabilities {
    return { ...this.deviceCapabilities };
  }

  // Force cleanup for low memory situations
  emergencyCleanup(): void {
    console.log('🧠 TextureManager: Emergency cleanup triggered');
    this.disposeAll();
  }
}

// Export singleton instance
export const textureManager = new TextureManager();

// Export types for use in other files
export type { TextureConfig, DeviceCapabilities };
export default textureManager;

