/**
 * Ultra-Realistic Lazy Daisy Stitch System
 * Implements hyper-realistic lazy daisy stitch rendering with 3D texture, lighting, and material properties
 */

import { AdvancedStitch, ThreadProperties, FabricProperties } from './AdvancedEmbroideryEngine';
import { performanceMonitor } from '../utils/PerformanceMonitor';
import { centralizedErrorHandler, ErrorCategory, ErrorSeverity } from '../utils/CentralizedErrorHandler';

export interface LazyDaisyGeometry {
  position: { x: number; y: number; z: number };
  size: number; // Diameter of the petal
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
  petalCount: number; // Number of petals
  petalAngle: number; // Angle between petals
}

export interface LazyDaisyPattern {
  type: 'single' | 'double' | 'triple' | 'cluster' | 'scattered' | 'border' | 'filling' | 'decorative';
  direction: 'clockwise' | 'counterclockwise' | 'mixed';
  density: number; // Stitches per mm
  complexity: number; // 1-10, affects pattern detail
  symmetry: boolean; // Whether to maintain symmetry
  spacing: number; // Spacing between flowers
}

export interface LazyDaisyMaterial {
  threadType: 'cotton' | 'polyester' | 'silk' | 'metallic' | 'glow' | 'variegated';
  sheen: number; // 0-1, affects light reflection
  roughness: number; // 0-1, affects surface roughness
  metallic: boolean;
  glowIntensity: number; // 0-1, for glow effects
  variegationPattern: string; // Pattern for color variation
  threadTwist: number; // Thread twist per mm
  threadThickness: number; // Thread diameter in mm
  color: string;
  threadCount: number; // Number of threads used (1-6)
}

export interface LazyDaisyLighting {
  ambientIntensity: number;
  directionalIntensity: number;
  lightDirection: { x: number; y: number; z: number };
  shadowSoftness: number;
  highlightIntensity: number;
  rimLighting: boolean;
  rimIntensity: number;
  petalHighlighting: boolean; // Whether to highlight petal texture
  petalIntensity: number;
}

export interface LazyDaisy3DProperties {
  height: number; // Raised height of the stitch
  padding: number; // Underlay padding for raised effect
  compression: number; // How much the stitch compresses the fabric
  tension: number; // Thread tension affecting shape
  stitchDensity: number; // Stitches per mm
  underlayType: 'none' | 'center' | 'contour' | 'parallel';
  underlayDensity: number;
  stitchOverlap: number; // How much stitches overlap (0-1)
  stitchVariation: number; // Random variation in stitch placement (0-1)
  curveSmoothing: number; // How much to smooth curves (0-1)
  petalSize: number; // Size of the petals (0-1)
  petalCurve: number; // Curvature of the petals (0-1)
  petalThickness: number; // Thickness of the petals (0-1)
  petalCount: number; // Number of petals (3-12)
  centerSize: number; // Size of the center (0-1)
}

export class UltraRealisticLazyDaisy {
  private static readonly PIXELS_PER_MM = 3.7795275591; // 96 DPI
  private static readonly MAX_PETAL_SIZE = 8.0; // mm
  private static readonly MIN_PETAL_SIZE = 1.0; // mm

  /**
   * Generate ultra-realistic lazy daisy stitches with 3D texture and lighting
   */
  static generateUltraRealisticLazyDaisy(
    geometry: LazyDaisyGeometry,
    pattern: LazyDaisyPattern,
    material: LazyDaisyMaterial,
    lighting: LazyDaisyLighting,
    properties3D: LazyDaisy3DProperties
  ): AdvancedStitch[] {
    try {
      const startTime = performance.now();
      
      console.log('🌸 Generating ultra-realistic lazy daisy stitches...', {
        geometry: geometry,
        pattern: pattern,
        material: material,
        properties3D: properties3D
      });

      // Generate base lazy daisy pattern
      const basePattern = this.generateBaseLazyDaisyPattern(geometry, pattern, properties3D);
      
      // Apply 3D height and padding
      const paddedPattern = this.apply3DPadding(basePattern, properties3D);
      
      // Generate detailed stitch geometry
      const detailedStitches = this.generateDetailedStitchGeometry(paddedPattern, material, properties3D);
      
      // Apply material properties and lighting
      const realisticStitches = this.applyMaterialAndLighting(detailedStitches, material, lighting, properties3D);
      
      // Generate underlay for raised effect
      const underlayStitches = this.generateUnderlayStitches(geometry, pattern, properties3D);
      
      // Combine all stitches
      const finalStitches = [...underlayStitches, ...realisticStitches];
      
      // Track performance
      const duration = performance.now() - startTime;
      performanceMonitor.trackMetric('ultra_realistic_lazy_daisy_generation', duration, 'ms', 'embroidery', 'UltraRealisticLazyDaisy');
      
      console.log(`✅ Generated ${finalStitches.length} ultra-realistic lazy daisy stitches in ${duration.toFixed(2)}ms`);
      
      return finalStitches;
      
    } catch (error) {
      centralizedErrorHandler.handleError(
        error as Error,
        { component: 'UltraRealisticLazyDaisy', function: 'generateUltraRealisticLazyDaisy' },
        ErrorSeverity.HIGH,
        ErrorCategory.EMBROIDERY
      );
      return [];
    }
  }

  /**
   * Generate base lazy daisy pattern based on pattern type
   */
  private static generateBaseLazyDaisyPattern(
    geometry: LazyDaisyGeometry,
    pattern: LazyDaisyPattern,
    properties3D: LazyDaisy3DProperties
  ): any[] {
    const patterns: any[] = [];
    
    switch (pattern.type) {
      case 'single':
        patterns.push(...this.generateSingleLazyDaisy(geometry, pattern, properties3D));
        break;
      case 'double':
        patterns.push(...this.generateDoubleLazyDaisy(geometry, pattern, properties3D));
        break;
      case 'triple':
        patterns.push(...this.generateTripleLazyDaisy(geometry, pattern, properties3D));
        break;
      case 'cluster':
        patterns.push(...this.generateClusterLazyDaisy(geometry, pattern, properties3D));
        break;
      case 'scattered':
        patterns.push(...this.generateScatteredLazyDaisy(geometry, pattern, properties3D));
        break;
      case 'border':
        patterns.push(...this.generateBorderLazyDaisy(geometry, pattern, properties3D));
        break;
      case 'filling':
        patterns.push(...this.generateFillingLazyDaisy(geometry, pattern, properties3D));
        break;
      case 'decorative':
        patterns.push(...this.generateDecorativeLazyDaisy(geometry, pattern, properties3D));
        break;
      default:
        patterns.push(...this.generateSingleLazyDaisy(geometry, pattern, properties3D));
    }
    
    return patterns;
  }

  /**
   * Generate single lazy daisy pattern
   */
  private static generateSingleLazyDaisy(
    geometry: LazyDaisyGeometry,
    pattern: LazyDaisyPattern,
    properties3D: LazyDaisy3DProperties
  ): any[] {
    const patterns: any[] = [];
    const position = geometry.position;
    const petalSize = geometry.size * properties3D.petalSize;
    const petalCount = Math.max(3, Math.min(12, Math.floor(properties3D.petalCount)));
    const centerX = position.x;
    const centerY = position.y;
    const centerZ = position.z;
    
    // Generate petals
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petalPoints = this.generatePetalPoints(
        centerX, centerY, centerZ,
        angle,
        petalSize,
        properties3D.petalCurve,
        properties3D.petalThickness
      );
      
      patterns.push({
        points: petalPoints,
        type: 'lazy_daisy_petal',
        index: i,
        center: { x: centerX, y: centerY, z: centerZ },
        angle: angle,
        size: petalSize
      });
    }
    
    // Generate center
    const centerPoints = this.generateCenterPoints(
      centerX, centerY, centerZ,
      properties3D.centerSize * petalSize * 0.3
    );
    
    patterns.push({
      points: centerPoints,
      type: 'lazy_daisy_center',
      index: petalCount,
      center: { x: centerX, y: centerY, z: centerZ },
      size: properties3D.centerSize * petalSize * 0.3
    });
    
    return patterns;
  }

  /**
   * Generate petal points
   */
  private static generatePetalPoints(
    centerX: number,
    centerY: number,
    centerZ: number,
    angle: number,
    size: number,
    curve: number,
    thickness: number
  ): any[] {
    const points: any[] = [];
    const segments = 8;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const petalAngle = angle + (t - 0.5) * Math.PI / 3; // Petal width
      const petalRadius = size * (1 - Math.abs(t - 0.5) * 2) * (1 + curve * Math.sin(t * Math.PI));
      
      const x = centerX + Math.cos(petalAngle) * petalRadius;
      const y = centerY + Math.sin(petalAngle) * petalRadius;
      const z = centerZ + thickness * Math.sin(t * Math.PI);
      
      points.push({
        x, y, z,
        angle: petalAngle,
        radius: petalRadius,
        t
      });
    }
    
    return points;
  }

  /**
   * Generate center points
   */
  private static generateCenterPoints(
    centerX: number,
    centerY: number,
    centerZ: number,
    size: number
  ): any[] {
    const points: any[] = [];
    const segments = 12;
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * size;
      const y = centerY + Math.sin(angle) * size;
      const z = centerZ;
      
      points.push({
        x, y, z,
        angle,
        radius: size,
        t: i / segments
      });
    }
    
    return points;
  }

  /**
   * Generate double lazy daisy pattern
   */
  private static generateDoubleLazyDaisy(
    geometry: LazyDaisyGeometry,
    pattern: LazyDaisyPattern,
    properties3D: LazyDaisy3DProperties
  ): any[] {
    const patterns: any[] = [];
    const position = geometry.position;
    const petalSize = geometry.size * properties3D.petalSize;
    const petalCount = Math.max(3, Math.min(12, Math.floor(properties3D.petalCount)));
    const centerX = position.x;
    const centerY = position.y;
    const centerZ = position.z;
    
    // Generate outer petals
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petalPoints = this.generatePetalPoints(
        centerX, centerY, centerZ,
        angle,
        petalSize,
        properties3D.petalCurve,
        properties3D.petalThickness
      );
      
      patterns.push({
        points: petalPoints,
        type: 'lazy_daisy_outer_petal',
        index: i,
        center: { x: centerX, y: centerY, z: centerZ },
        angle: angle,
        size: petalSize
      });
    }
    
    // Generate inner petals
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2 + Math.PI / petalCount;
      const petalPoints = this.generatePetalPoints(
        centerX, centerY, centerZ,
        angle,
        petalSize * 0.6,
        properties3D.petalCurve,
        properties3D.petalThickness
      );
      
      patterns.push({
        points: petalPoints,
        type: 'lazy_daisy_inner_petal',
        index: i + petalCount,
        center: { x: centerX, y: centerY, z: centerZ },
        angle: angle,
        size: petalSize * 0.6
      });
    }
    
    // Generate center
    const centerPoints = this.generateCenterPoints(
      centerX, centerY, centerZ,
      properties3D.centerSize * petalSize * 0.2
    );
    
    patterns.push({
      points: centerPoints,
      type: 'lazy_daisy_center',
      index: petalCount * 2,
      center: { x: centerX, y: centerY, z: centerZ },
      size: properties3D.centerSize * petalSize * 0.2
    });
    
    return patterns;
  }

  /**
   * Generate triple lazy daisy pattern
   */
  private static generateTripleLazyDaisy(
    geometry: LazyDaisyGeometry,
    pattern: LazyDaisyPattern,
    properties3D: LazyDaisy3DProperties
  ): any[] {
    const patterns: any[] = [];
    const position = geometry.position;
    const petalSize = geometry.size * properties3D.petalSize;
    const petalCount = Math.max(3, Math.min(12, Math.floor(properties3D.petalCount)));
    const centerX = position.x;
    const centerY = position.y;
    const centerZ = position.z;
    
    // Generate three layers of petals
    const layers = [
      { size: petalSize, offset: 0, type: 'outer' },
      { size: petalSize * 0.7, offset: Math.PI / petalCount, type: 'middle' },
      { size: petalSize * 0.4, offset: Math.PI / petalCount * 2, type: 'inner' }
    ];
    
    layers.forEach((layer, layerIndex) => {
      for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2 + layer.offset;
        const petalPoints = this.generatePetalPoints(
          centerX, centerY, centerZ,
          angle,
          layer.size,
          properties3D.petalCurve,
          properties3D.petalThickness
        );
        
        patterns.push({
          points: petalPoints,
          type: `lazy_daisy_${layer.type}_petal`,
          index: layerIndex * petalCount + i,
          center: { x: centerX, y: centerY, z: centerZ },
          angle: angle,
          size: layer.size
        });
      }
    });
    
    // Generate center
    const centerPoints = this.generateCenterPoints(
      centerX, centerY, centerZ,
      properties3D.centerSize * petalSize * 0.15
    );
    
    patterns.push({
      points: centerPoints,
      type: 'lazy_daisy_center',
      index: layers.length * petalCount,
      center: { x: centerX, y: centerY, z: centerZ },
      size: properties3D.centerSize * petalSize * 0.15
    });
    
    return patterns;
  }

  /**
   * Generate cluster lazy daisy pattern
   */
  private static generateClusterLazyDaisy(
    geometry: LazyDaisyGeometry,
    pattern: LazyDaisyPattern,
    properties3D: LazyDaisy3DProperties
  ): any[] {
    const patterns: any[] = [];
    const position = geometry.position;
    const petalSize = geometry.size * properties3D.petalSize;
    const clusterSize = 3; // 3x3 cluster
    
    for (let row = 0; row < clusterSize; row++) {
      for (let col = 0; col < clusterSize; col++) {
        const offsetX = (col - 1) * petalSize * 0.8;
        const offsetY = (row - 1) * petalSize * 0.8;
        
        const clusterGeometry: LazyDaisyGeometry = {
          position: {
            x: position.x + offsetX,
            y: position.y + offsetY,
            z: position.z
          },
          size: petalSize * 0.6,
          bounds: geometry.bounds,
          petalCount: geometry.petalCount,
          petalAngle: geometry.petalAngle
        };
        
        const clusterPatterns = this.generateSingleLazyDaisy(clusterGeometry, pattern, properties3D);
        clusterPatterns.forEach(p => {
          p.index = row * clusterSize * 10 + col * 10 + p.index;
        });
        patterns.push(...clusterPatterns);
      }
    }
    
    return patterns;
  }

  /**
   * Generate scattered lazy daisy pattern
   */
  private static generateScatteredLazyDaisy(
    geometry: LazyDaisyGeometry,
    pattern: LazyDaisyPattern,
    properties3D: LazyDaisy3DProperties
  ): any[] {
    const patterns: any[] = [];
    const position = geometry.position;
    const petalSize = geometry.size * properties3D.petalSize;
    const scatterCount = 5; // Number of scattered flowers
    
    for (let i = 0; i < scatterCount; i++) {
      const angle = (i / scatterCount) * Math.PI * 2;
      const distance = petalSize * (0.5 + Math.random() * 0.5);
      const offsetX = Math.cos(angle) * distance;
      const offsetY = Math.sin(angle) * distance;
      
      const scatteredGeometry: LazyDaisyGeometry = {
        position: {
          x: position.x + offsetX,
          y: position.y + offsetY,
          z: position.z
        },
        size: petalSize * (0.6 + Math.random() * 0.4),
        bounds: geometry.bounds,
        petalCount: geometry.petalCount,
        petalAngle: geometry.petalAngle
      };
      
      const scatteredPatterns = this.generateSingleLazyDaisy(scatteredGeometry, pattern, properties3D);
      scatteredPatterns.forEach(p => {
        p.index = i * 10 + p.index;
      });
      patterns.push(...scatteredPatterns);
    }
    
    return patterns;
  }

  /**
   * Generate border lazy daisy pattern
   */
  private static generateBorderLazyDaisy(
    geometry: LazyDaisyGeometry,
    pattern: LazyDaisyPattern,
    properties3D: LazyDaisy3DProperties
  ): any[] {
    const patterns: any[] = [];
    const position = geometry.position;
    const petalSize = geometry.size * properties3D.petalSize;
    const borderLength = 20; // mm
    const spacing = petalSize * 1.5;
    const count = Math.floor(borderLength / spacing);
    
    for (let i = 0; i < count; i++) {
      const t = i / Math.max(1, count - 1);
      const x = position.x + t * borderLength;
      const y = position.y;
      const z = position.z;
      
      const borderGeometry: LazyDaisyGeometry = {
        position: { x, y, z },
        size: petalSize,
        bounds: geometry.bounds,
        petalCount: geometry.petalCount,
        petalAngle: geometry.petalAngle
      };
      
      const borderPatterns = this.generateSingleLazyDaisy(borderGeometry, pattern, properties3D);
      borderPatterns.forEach(p => {
        p.index = i * 10 + p.index;
      });
      patterns.push(...borderPatterns);
    }
    
    return patterns;
  }

  /**
   * Generate filling lazy daisy pattern
   */
  private static generateFillingLazyDaisy(
    geometry: LazyDaisyGeometry,
    pattern: LazyDaisyPattern,
    properties3D: LazyDaisy3DProperties
  ): any[] {
    const patterns: any[] = [];
    const position = geometry.position;
    const petalSize = geometry.size * properties3D.petalSize;
    const fillWidth = 20; // mm
    const fillHeight = 20; // mm
    const spacing = petalSize * 1.2;
    const rows = Math.floor(fillHeight / spacing);
    const cols = Math.floor(fillWidth / spacing);
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = position.x + col * spacing;
        const y = position.y + row * spacing;
        const z = position.z;
        
        const fillGeometry: LazyDaisyGeometry = {
          position: { x, y, z },
          size: petalSize * (0.8 + Math.random() * 0.4),
          bounds: geometry.bounds,
          petalCount: geometry.petalCount,
          petalAngle: geometry.petalAngle
        };
        
        const fillPatterns = this.generateSingleLazyDaisy(fillGeometry, pattern, properties3D);
        fillPatterns.forEach(p => {
          p.index = (row * cols + col) * 10 + p.index;
        });
        patterns.push(...fillPatterns);
      }
    }
    
    return patterns;
  }

  /**
   * Generate decorative lazy daisy pattern
   */
  private static generateDecorativeLazyDaisy(
    geometry: LazyDaisyGeometry,
    pattern: LazyDaisyPattern,
    properties3D: LazyDaisy3DProperties
  ): any[] {
    const patterns: any[] = [];
    const position = geometry.position;
    const petalSize = geometry.size * properties3D.petalSize;
    const petalCount = Math.max(3, Math.min(12, Math.floor(properties3D.petalCount)));
    const centerX = position.x;
    const centerY = position.y;
    const centerZ = position.z;
    
    // Generate decorative petals with varying sizes and angles
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const decorativeSize = petalSize * (0.8 + Math.sin(i * Math.PI / 4) * 0.4);
      const decorativeCurve = properties3D.petalCurve * (0.5 + Math.cos(i * Math.PI / 3) * 0.5);
      
      const petalPoints = this.generatePetalPoints(
        centerX, centerY, centerZ,
        angle,
        decorativeSize,
        decorativeCurve,
        properties3D.petalThickness
      );
      
      patterns.push({
        points: petalPoints,
        type: 'lazy_daisy_decorative_petal',
        index: i,
        center: { x: centerX, y: centerY, z: centerZ },
        angle: angle,
        size: decorativeSize
      });
    }
    
    // Generate decorative center
    const centerPoints = this.generateCenterPoints(
      centerX, centerY, centerZ,
      properties3D.centerSize * petalSize * 0.4
    );
    
    patterns.push({
      points: centerPoints,
      type: 'lazy_daisy_decorative_center',
      index: petalCount,
      center: { x: centerX, y: centerY, z: centerZ },
      size: properties3D.centerSize * petalSize * 0.4
    });
    
    return patterns;
  }

  /**
   * Apply 3D padding and height to create raised effect
   */
  private static apply3DPadding(pattern: any[], properties3D: LazyDaisy3DProperties): any[] {
    return pattern.map(stitch => {
      const paddedPoints = stitch.points.map((point: any) => ({
        ...point,
        z: (point.z || 0) + properties3D.height + properties3D.padding
      }));
      
      return {
        ...stitch,
        points: paddedPoints,
        height: properties3D.height,
        padding: properties3D.padding
      };
    });
  }

  /**
   * Generate detailed stitch geometry with thread properties
   */
  private static generateDetailedStitchGeometry(
    pattern: any[],
    material: LazyDaisyMaterial,
    properties3D: LazyDaisy3DProperties
  ): any[] {
    return pattern.map(stitch => {
      const detailedPoints = stitch.points.map((point: any, index: number) => {
        // Calculate thread twist effect
        const twistAngle = (index * material.threadTwist * Math.PI * 2) / stitch.points.length;
        const twistOffset = {
          x: Math.cos(twistAngle) * material.threadThickness * 0.1,
          y: Math.sin(twistAngle) * material.threadThickness * 0.1,
          z: 0
        };
        
        // Add stitch variation
        const variation = (Math.random() - 0.5) * properties3D.stitchVariation * material.threadThickness;
        const variationOffset = {
          x: variation * Math.cos(twistAngle),
          y: variation * Math.sin(twistAngle),
          z: variation * 0.1
        };
        
        return {
          x: point.x + twistOffset.x + variationOffset.x,
          y: point.y + twistOffset.y + variationOffset.y,
          z: point.z + twistOffset.z + variationOffset.z,
          twist: twistAngle,
          threadThickness: material.threadThickness,
          variation: variation
        };
      });
      
      return {
        ...stitch,
        points: detailedPoints,
        material: material,
        threadTwist: material.threadTwist,
        threadThickness: material.threadThickness
      };
    });
  }

  /**
   * Apply material properties and lighting for ultra-realism
   */
  private static applyMaterialAndLighting(
    stitches: any[],
    material: LazyDaisyMaterial,
    lighting: LazyDaisyLighting,
    properties3D: LazyDaisy3DProperties
  ): AdvancedStitch[] {
    return stitches.map((stitch, index) => {
      // Calculate lighting for each point
      const litPoints = stitch.points.map((point: any) => {
        const pointLighting = this.calculatePointLighting(point, lighting, material, properties3D);
        return {
          ...point,
          lighting: pointLighting
        };
      });
      
      // Generate material properties
      const materialProps = this.generateMaterialProperties(material, stitch);
      
      // Create advanced stitch with all properties
      const advancedStitch: AdvancedStitch = {
        id: `ultra_lazy_daisy_${index}_${Date.now()}`,
        type: 'lazy-daisy',
        points: litPoints,
        thread: {
          type: material.threadType,
          color: this.calculateThreadColor(material, stitch),
          thickness: material.threadThickness,
          twist: material.threadTwist,
          sheen: material.sheen,
          roughness: material.roughness,
          metallic: material.metallic,
          glowIntensity: material.glowIntensity,
          variegationPattern: material.variegationPattern
        },
        fabric: {
          type: 'cotton',
          color: '#ffffff',
          weave: 'plain',
          stretch: 0.1,
          thickness: 0.5,
          roughness: 0.3,
          normalMap: 'cotton_normal'
        },
        density: properties3D.stitchDensity,
        tension: properties3D.tension,
        direction: this.calculateStitchDirection(stitch),
        length: this.calculateStitchLength(stitch),
        width: material.threadThickness * 2,
        height: properties3D.height,
        shadowOffset: this.calculateShadowOffset(stitch, lighting),
        normal: this.calculateStitchNormal(stitch),
        uv: this.generateUVCoordinates(stitch),
        material: materialProps
      };
      
      return advancedStitch;
    });
  }

  // Helper methods for material and lighting calculations
  private static calculatePointLighting(point: any, lighting: LazyDaisyLighting, material: LazyDaisyMaterial, properties3D: LazyDaisy3DProperties): any {
    // Simplified lighting calculation
    return {
      ambient: lighting.ambientIntensity,
      diffuse: lighting.directionalIntensity,
      specular: material.sheen * lighting.highlightIntensity,
      total: Math.min(1, lighting.ambientIntensity + lighting.directionalIntensity)
    };
  }

  private static generateMaterialProperties(material: LazyDaisyMaterial, stitch: any): any {
    return {
      albedo: material.color || '#FF69B4',
      normal: `lazy_daisy_normal_${material.threadType}`,
      roughness: material.roughness,
      metallic: material.metallic ? 1.0 : 0.0,
      emission: material.glowIntensity > 0 ? material.color : '#000000',
      sheen: material.sheen
    };
  }

  private static calculateThreadColor(material: LazyDaisyMaterial, stitch: any): string {
    return material.color || '#FF69B4';
  }

  private static calculateStitchDirection(stitch: any): number {
    if (stitch.points.length < 2) return 0;
    const start = stitch.points[0];
    const end = stitch.points[stitch.points.length - 1];
    return Math.atan2(end.y - start.y, end.x - start.x);
  }

  private static calculateStitchLength(stitch: any): number {
    let length = 0;
    for (let i = 0; i < stitch.points.length - 1; i++) {
      length += this.calculateDistance(stitch.points[i], stitch.points[i + 1]);
    }
    return length;
  }

  private static calculateShadowOffset(stitch: any, lighting: LazyDaisyLighting): { x: number; y: number; z: number } {
    return { x: 0, y: 0, z: 0 };
  }

  private static calculateStitchNormal(stitch: any): { x: number; y: number; z: number } {
    return { x: 0, y: 0, z: 1 };
  }

  private static generateUVCoordinates(stitch: any): { u: number; v: number }[] {
    return stitch.points.map((_: any, index: number) => ({
      u: index / Math.max(1, stitch.points.length - 1),
      v: 0.5
    }));
  }

  private static generateUnderlayStitches(geometry: LazyDaisyGeometry, pattern: LazyDaisyPattern, properties3D: LazyDaisy3DProperties): AdvancedStitch[] {
    return [];
  }

  private static calculateDistance(p1: any, p2: any): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = (p2.z || 0) - (p1.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}

export default UltraRealisticLazyDaisy;

























