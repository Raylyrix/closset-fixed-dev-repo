/**
 * Realistic Lighting System
 * Advanced lighting and shadow system for 4K HD embroidery rendering
 */

import { performanceMonitor } from '../utils/PerformanceMonitor';
import { centralizedErrorHandler, ErrorCategory, ErrorSeverity } from '../utils/CentralizedErrorHandler';

export interface Light {
  id: string;
  type: 'ambient' | 'directional' | 'point' | 'spot';
  position: { x: number; y: number; z: number };
  direction?: { x: number; y: number; z: number };
  color: { r: number; g: number; b: number };
  intensity: number;
  range?: number;
  angle?: number;
  penumbra?: number;
  decay?: number;
  castShadow: boolean;
  shadowBias: number;
  shadowRadius: number;
  shadowMapSize: number;
}

export interface Material {
  id: string;
  albedo: { r: number; g: number; b: number };
  normal: { x: number; y: number; z: number };
  roughness: number;
  metallic: number;
  emission: { r: number; g: number; b: number };
  ao: number;
  height: number;
  ior: number; // Index of refraction
  transmission: number;
  thickness: number;
}

export interface ShadowMap {
  texture: WebGLTexture;
  matrix: Float32Array;
  bias: number;
  radius: number;
}

export interface LightingContext {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  viewMatrix: Float32Array;
  projectionMatrix: Float32Array;
  modelMatrix: Float32Array;
  cameraPosition: { x: number; y: number; z: number };
  time: number;
  ambientOcclusion: boolean;
  globalIllumination: boolean;
  toneMapping: boolean;
  exposure: number;
  gamma: number;
}

export interface LightingResult {
  diffuse: { r: number; g: number; b: number };
  specular: { r: number; g: number; b: number };
  ambient: { r: number; g: number; b: number };
  emission: { r: number; g: number; b: number };
  ao: number;
  shadow: number;
  final: { r: number; g: number; b: number };
}

export class RealisticLightingSystem {
  private gl: WebGL2RenderingContext | null = null;
  private shadowMaps: Map<string, ShadowMap> = new Map();
  private shadowFramebuffers: Map<string, WebGLFramebuffer> = new Map();
  private shadowTextures: Map<string, WebGLTexture> = new Map();
  private isInitialized = false;
  private shadowMapSize = 2048;
  private maxLights = 8;

  constructor(gl: WebGL2RenderingContext | null = null) {
    this.gl = gl;
    if (gl) {
      this.initialize();
    }
  }

  /**
   * Initialize the lighting system
   */
  private async initialize(): Promise<void> {
    try {
      if (!this.gl) {
        throw new Error('WebGL context not available');
      }

      // Check for required extensions
      this.checkExtensions();

      console.log('💡 Realistic Lighting System initialized successfully');

      this.isInitialized = true;

    } catch (error) {
      centralizedErrorHandler.handleError(
        error as Error,
        { component: 'RealisticLightingSystem', function: 'initialize' },
        ErrorSeverity.HIGH,
        ErrorCategory.RENDERING
      );
      throw error;
    }
  }

  /**
   * Calculate lighting for a point
   */
  calculateLighting(
    position: { x: number; y: number; z: number },
    normal: { x: number; y: number; z: number },
    material: Material,
    lights: Light[],
    context: LightingContext
  ): LightingResult {
    try {
      const startTime = performance.now();

      // Initialize result
      const result: LightingResult = {
        diffuse: { r: 0, g: 0, b: 0 },
        specular: { r: 0, g: 0, b: 0 },
        ambient: { r: 0, g: 0, b: 0 },
        emission: { r: 0, g: 0, b: 0 },
        ao: 1.0,
        shadow: 1.0,
        final: { r: 0, g: 0, b: 0 }
      };

      // Calculate ambient lighting
      result.ambient = this.calculateAmbientLighting(material, lights);

      // Calculate emission
      result.emission = this.calculateEmission(material);

      // Calculate lighting from each light
      for (const light of lights) {
        const lightResult = this.calculateLightContribution(
          position,
          normal,
          material,
          light,
          context
        );

        // Add to diffuse
        result.diffuse.r += lightResult.diffuse.r;
        result.diffuse.g += lightResult.diffuse.g;
        result.diffuse.b += lightResult.diffuse.b;

        // Add to specular
        result.specular.r += lightResult.specular.r;
        result.specular.g += lightResult.specular.g;
        result.specular.b += lightResult.specular.b;
      }

      // Calculate ambient occlusion
      if (context.ambientOcclusion) {
        result.ao = this.calculateAmbientOcclusion(position, normal, context);
      }

      // Calculate shadows
      result.shadow = this.calculateShadows(position, lights, context);

      // Combine all lighting components
      result.final = this.combineLighting(result, material, context);

      // Track performance
      const duration = performance.now() - startTime;
      performanceMonitor.trackMetric('lighting_calculation', duration, 'ms', 'lighting', 'RealisticLightingSystem');

      return result;

    } catch (error) {
      centralizedErrorHandler.handleError(
        error as Error,
        { component: 'RealisticLightingSystem', function: 'calculateLighting' },
        ErrorSeverity.MEDIUM,
        ErrorCategory.RENDERING
      );
      return this.getDefaultLightingResult();
    }
  }

  /**
   * Generate shadow map for a light
   */
  async generateShadowMap(light: Light, scene: any[]): Promise<ShadowMap> {
    try {
      const startTime = performance.now();

      if (!this.gl) {
        throw new Error('WebGL context not available');
      }

      // Check if shadow map already exists
      if (this.shadowMaps.has(light.id)) {
        return this.shadowMaps.get(light.id)!;
      }

      // Create shadow map texture
      const shadowTexture = this.createShadowTexture(light.shadowMapSize);
      const shadowFramebuffer = this.createShadowFramebuffer(shadowTexture);

      // Set up shadow map rendering
      this.setupShadowMapRendering(light, shadowFramebuffer);

      // Render scene from light's perspective
      await this.renderShadowMap(light, scene, shadowFramebuffer);

      // Create shadow map object
      const shadowMap: ShadowMap = {
        texture: shadowTexture,
        matrix: this.calculateShadowMatrix(light),
        bias: light.shadowBias,
        radius: light.shadowRadius
      };

      this.shadowMaps.set(light.id, shadowMap);
      this.shadowFramebuffers.set(light.id, shadowFramebuffer);
      this.shadowTextures.set(light.id, shadowTexture);

      // Track performance
      const duration = performance.now() - startTime;
      performanceMonitor.trackMetric('shadow_map_generation', duration, 'ms', 'lighting', 'RealisticLightingSystem');

      return shadowMap;

    } catch (error) {
      centralizedErrorHandler.handleError(
        error as Error,
        { component: 'RealisticLightingSystem', function: 'generateShadowMap' },
        ErrorSeverity.MEDIUM,
        ErrorCategory.RENDERING
      );
      throw error;
    }
  }

  /**
   * Calculate global illumination
   */
  calculateGlobalIllumination(
    position: { x: number; y: number; z: number },
    normal: { x: number; y: number; z: number },
    material: Material,
    context: LightingContext
  ): { r: number; g: number; b: number } {
    try {
      // Simplified global illumination calculation
      // In a full implementation, this would use more sophisticated algorithms
      
      const gi = {
        r: material.albedo.r * 0.1,
        g: material.albedo.g * 0.1,
        b: material.albedo.b * 0.1
      };

      return gi;

    } catch (error) {
      centralizedErrorHandler.handleError(
        error as Error,
        { component: 'RealisticLightingSystem', function: 'calculateGlobalIllumination' },
        ErrorSeverity.LOW,
        ErrorCategory.RENDERING
      );
      return { r: 0, g: 0, b: 0 };
    }
  }

  /**
   * Apply tone mapping
   */
  applyToneMapping(color: { r: number; g: number; b: number }, exposure: number, gamma: number): { r: number; g: number; b: number } {
    // Apply exposure
    let r = color.r * exposure;
    let g = color.g * exposure;
    let b = color.b * exposure;

    // Apply tone mapping (Reinhard)
    r = r / (1.0 + r);
    g = g / (1.0 + g);
    b = b / (1.0 + b);

    // Apply gamma correction
    r = Math.pow(r, 1.0 / gamma);
    g = Math.pow(g, 1.0 / gamma);
    b = Math.pow(b, 1.0 / gamma);

    // Clamp to [0, 1]
    r = Math.max(0, Math.min(1, r));
    g = Math.max(0, Math.min(1, g));
    b = Math.max(0, Math.min(1, b));

    return { r, g, b };
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.gl) {
      // Delete shadow maps
      for (const shadowMap of this.shadowMaps.values()) {
        this.gl.deleteTexture(shadowMap.texture);
      }

      // Delete shadow framebuffers
      for (const framebuffer of this.shadowFramebuffers.values()) {
        this.gl.deleteFramebuffer(framebuffer);
      }

      // Delete shadow textures
      for (const texture of this.shadowTextures.values()) {
        this.gl.deleteTexture(texture);
      }
    }

    this.shadowMaps.clear();
    this.shadowFramebuffers.clear();
    this.shadowTextures.clear();
    this.isInitialized = false;
  }

  // Private helper methods

  private checkExtensions(): void {
    if (!this.gl || !this.gl.getExtension) return;

    // Check for required extensions
    const requiredExtensions = [
      'OES_texture_float',
      'OES_texture_half_float',
      'EXT_texture_filter_anisotropic',
      'WEBGL_depth_texture'
    ];

    for (const extension of requiredExtensions) {
      try {
        if (!this.gl.getExtension(extension)) {
          console.warn(`Extension ${extension} not available`);
        }
      } catch (error) {
        console.warn(`Error checking extension ${extension}:`, error);
      }
    }
  }

  private calculateAmbientLighting(material: Material, lights: Light[]): { r: number; g: number; b: number } {
    // Find ambient light
    const ambientLight = lights.find(light => light.type === 'ambient');
    if (!ambientLight) {
      return { r: 0.1, g: 0.1, b: 0.1 }; // Default ambient
    }

    return {
      r: material.albedo.r * ambientLight.color.r * ambientLight.intensity,
      g: material.albedo.g * ambientLight.color.g * ambientLight.intensity,
      b: material.albedo.b * ambientLight.color.b * ambientLight.intensity
    };
  }

  private calculateEmission(material: Material): { r: number; g: number; b: number } {
    return {
      r: material.emission.r,
      g: material.emission.g,
      b: material.emission.b
    };
  }

  private calculateLightContribution(
    position: { x: number; y: number; z: number },
    normal: { x: number; y: number; z: number },
    material: Material,
    light: Light,
    context: LightingContext
  ): { diffuse: { r: number; g: number; b: number }; specular: { r: number; g: number; b: number } } {
    const result = {
      diffuse: { r: 0, g: 0, b: 0 },
      specular: { r: 0, g: 0, b: 0 }
    };

    // Calculate light direction and distance
    const lightDir = this.calculateLightDirection(position, light);
    const lightDistance = this.calculateLightDistance(position, light);
    const lightIntensity = this.calculateLightIntensity(light, lightDistance);

    // Calculate diffuse lighting
    const NdotL = Math.max(0, this.dotProduct(normal, lightDir));
    result.diffuse = {
      r: material.albedo.r * light.color.r * lightIntensity * NdotL,
      g: material.albedo.g * light.color.g * lightIntensity * NdotL,
      b: material.albedo.b * light.color.b * lightIntensity * NdotL
    };

    // Calculate specular lighting
    if (material.metallic > 0 || material.roughness < 1.0) {
      const viewDir = this.calculateViewDirection(position, context.cameraPosition);
      const halfDir = this.normalize(this.add(lightDir, viewDir));
      const NdotH = Math.max(0, this.dotProduct(normal, halfDir));
      
      const specular = this.calculateSpecular(NdotH, material.roughness, material.metallic);
      result.specular = {
        r: light.color.r * lightIntensity * specular,
        g: light.color.g * lightIntensity * specular,
        b: light.color.b * lightIntensity * specular
      };
    }

    return result;
  }

  private calculateLightDirection(
    position: { x: number; y: number; z: number },
    light: Light
  ): { x: number; y: number; z: number } {
    switch (light.type) {
      case 'directional':
        return this.normalize(light.direction!);
      case 'point':
      case 'spot':
        return this.normalize({
          x: light.position.x - position.x,
          y: light.position.y - position.y,
          z: light.position.z - position.z
        });
      default:
        return { x: 0, y: 0, z: 1 };
    }
  }

  private calculateLightDistance(
    position: { x: number; y: number; z: number },
    light: Light
  ): number {
    if (light.type === 'directional') {
      return 1.0; // Infinite distance
    }

    const dx = light.position.x - position.x;
    const dy = light.position.y - position.y;
    const dz = light.position.z - position.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  private calculateLightIntensity(light: Light, distance: number): number {
    let intensity = light.intensity;

    if (light.type === 'point' || light.type === 'spot') {
      // Apply distance attenuation
      if (light.range && distance > light.range) {
        return 0.0;
      }

      if (light.decay) {
        intensity /= Math.pow(distance, light.decay);
      }
    }

    if (light.type === 'spot') {
      // Apply spot light cone
      const lightDir = this.normalize(light.direction!);
      const spotDir = this.normalize({
        x: light.position.x - light.position.x,
        y: light.position.y - light.position.y,
        z: light.position.z - light.position.z
      });

      const cosAngle = this.dotProduct(lightDir, spotDir);
      const cosCone = Math.cos(light.angle!);
      const cosPenumbra = Math.cos(light.angle! + light.penumbra!);

      if (cosAngle < cosCone) {
        return 0.0;
      }

      if (cosAngle < cosPenumbra) {
        intensity *= (cosAngle - cosCone) / (cosPenumbra - cosCone);
      }
    }

    return intensity;
  }

  private calculateViewDirection(
    position: { x: number; y: number; z: number },
    cameraPosition: { x: number; y: number; z: number }
  ): { x: number; y: number; z: number } {
    return this.normalize({
      x: cameraPosition.x - position.x,
      y: cameraPosition.y - position.y,
      z: cameraPosition.z - position.z
    });
  }

  private calculateSpecular(NdotH: number, roughness: number, metallic: number): number {
    // Simplified specular calculation
    const specularPower = Math.pow(2, (1.0 - roughness) * 10.0);
    const specular = Math.pow(NdotH, specularPower);
    return specular * (1.0 - metallic) + metallic;
  }

  private calculateAmbientOcclusion(
    position: { x: number; y: number; z: number },
    normal: { x: number; y: number; z: number },
    context: LightingContext
  ): number {
    // Simplified ambient occlusion calculation
    // In a full implementation, this would use more sophisticated algorithms
    return 1.0;
  }

  private calculateShadows(
    position: { x: number; y: number; z: number },
    lights: Light[],
    context: LightingContext
  ): number {
    let shadowFactor = 1.0;

    for (const light of lights) {
      if (!light.castShadow) continue;

      const shadowMap = this.shadowMaps.get(light.id);
      if (!shadowMap) continue;

      // Calculate shadow factor
      const shadow = this.sampleShadowMap(position, shadowMap, light);
      shadowFactor *= shadow;
    }

    return shadowFactor;
  }

  private sampleShadowMap(
    position: { x: number; y: number; z: number },
    shadowMap: ShadowMap,
    light: Light
  ): number {
    // Simplified shadow sampling
    // In a full implementation, this would sample the actual shadow map
    return 1.0;
  }

  private combineLighting(
    result: LightingResult,
    material: Material,
    context: LightingContext
  ): { r: number; g: number; b: number } {
    // Combine all lighting components
    let r = result.ambient.r + result.diffuse.r + result.specular.r + result.emission.r;
    let g = result.ambient.g + result.diffuse.g + result.specular.g + result.emission.g;
    let b = result.ambient.b + result.diffuse.b + result.specular.b + result.emission.b;

    // Apply ambient occlusion
    r *= result.ao;
    g *= result.ao;
    b *= result.ao;

    // Apply shadows
    r *= result.shadow;
    g *= result.shadow;
    b *= result.shadow;

    // Apply global illumination
    if (context.globalIllumination) {
      const gi = this.calculateGlobalIllumination(
        { x: 0, y: 0, z: 0 }, // Position would be passed in
        { x: 0, y: 0, z: 1 }, // Normal would be passed in
        material,
        context
      );
      r += gi.r;
      g += gi.g;
      b += gi.b;
    }

    // Apply tone mapping
    if (context.toneMapping) {
      const toneMapped = this.applyToneMapping({ r, g, b }, context.exposure, context.gamma);
      r = toneMapped.r;
      g = toneMapped.g;
      b = toneMapped.b;
    }

    return { r, g, b };
  }

  private createShadowTexture(size: number): WebGLTexture {
    if (!this.gl) throw new Error('WebGL context not available');

    const texture = this.gl.createTexture();
    if (!texture) throw new Error('Failed to create shadow texture');

    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.DEPTH_COMPONENT24,
      size,
      size,
      0,
      this.gl.DEPTH_COMPONENT,
      this.gl.UNSIGNED_INT,
      null
    );

    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

    return texture;
  }

  private createShadowFramebuffer(shadowTexture: WebGLTexture): WebGLFramebuffer {
    if (!this.gl) throw new Error('WebGL context not available');

    const framebuffer = this.gl.createFramebuffer();
    if (!framebuffer) throw new Error('Failed to create shadow framebuffer');

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
    this.gl.framebufferTexture2D(
      this.gl.FRAMEBUFFER,
      this.gl.DEPTH_ATTACHMENT,
      this.gl.TEXTURE_2D,
      shadowTexture,
      0
    );

    return framebuffer;
  }

  private setupShadowMapRendering(light: Light, framebuffer: WebGLFramebuffer): void {
    if (!this.gl) return;

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
    this.gl.viewport(0, 0, light.shadowMapSize, light.shadowMapSize);
    this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
  }

  private async renderShadowMap(light: Light, scene: any[], framebuffer: WebGLFramebuffer): Promise<void> {
    // This would render the scene from the light's perspective
    // For now, it's a placeholder
    console.log('Rendering shadow map for light:', light.id);
  }

  private calculateShadowMatrix(light: Light): Float32Array {
    // Calculate shadow matrix for the light
    // This is a simplified implementation
    const matrix = new Float32Array(16);
    matrix[0] = 1; matrix[5] = 1; matrix[10] = 1; matrix[15] = 1;
    return matrix;
  }

  private getDefaultLightingResult(): LightingResult {
    return {
      diffuse: { r: 0, g: 0, b: 0 },
      specular: { r: 0, g: 0, b: 0 },
      ambient: { r: 0.1, g: 0.1, b: 0.1 },
      emission: { r: 0, g: 0, b: 0 },
      ao: 1.0,
      shadow: 1.0,
      final: { r: 0.1, g: 0.1, b: 0.1 }
    };
  }

  // Vector math utilities
  private normalize(v: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
    const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    if (length === 0) return { x: 0, y: 0, z: 0 };
    return { x: v.x / length, y: v.y / length, z: v.z / length };
  }

  private dotProduct(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  private add(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
  }
}

export default RealisticLightingSystem;
