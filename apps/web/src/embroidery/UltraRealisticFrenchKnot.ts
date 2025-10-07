/**
 * Ultra-Realistic French Knot System
 * Implements hyper-realistic French knot rendering with 3D texture, lighting, and material properties
 */

import { AdvancedStitch, ThreadProperties, FabricProperties } from './AdvancedEmbroideryEngine';
import { performanceMonitor } from '../utils/PerformanceMonitor';
import { centralizedErrorHandler, ErrorCategory, ErrorSeverity } from '../utils/CentralizedErrorHandler';

export interface FrenchKnotGeometry {
  position: { x: number; y: number; z: number };
  size: number; // Diameter of the knot
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
}

export interface FrenchKnotPattern {
  type: 'single' | 'double' | 'triple' | 'bullion' | 'colonial' | 'padded' | 'wrapped' | 'heavy';
  direction: 'clockwise' | 'counterclockwise' | 'mixed';
  density: number; // Knots per mm
  complexity: number; // 1-10, affects pattern detail
  symmetry: boolean; // Whether to maintain symmetry
  spacing: number; // Spacing between knots
}

export interface FrenchKnotMaterial {
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

export interface FrenchKnotLighting {
  ambientIntensity: number;
  directionalIntensity: number;
  lightDirection: { x: number; y: number; z: number };
  shadowSoftness: number;
  highlightIntensity: number;
  rimLighting: boolean;
  rimIntensity: number;
  knotHighlighting: boolean; // Whether to highlight knot texture
  knotIntensity: number;
}

export interface FrenchKnot3DProperties {
  height: number; // Raised height of the knot
  padding: number; // Underlay padding for raised effect
  compression: number; // How much the knot compresses the fabric
  tension: number; // Thread tension affecting shape
  stitchDensity: number; // Stitches per mm
  underlayType: 'none' | 'center' | 'contour' | 'parallel';
  underlayDensity: number;
  stitchOverlap: number; // How much stitches overlap (0-1)
  stitchVariation: number; // Random variation in stitch placement (0-1)
  curveSmoothing: number; // How much to smooth curves (0-1)
  knotSize: number; // Size of the knot (0-1)
  knotTightness: number; // How tight the knot is (0-1)
  knotWraps: number; // Number of wraps around the needle
  knotTexture: number; // Texture detail of the knot (0-1)
}

export class UltraRealisticFrenchKnot {
  private static readonly PIXELS_PER_MM = 3.7795275591; // 96 DPI
  private static readonly MAX_KNOT_SIZE = 5.0; // mm
  private static readonly MIN_KNOT_SIZE = 0.5; // mm

  /**
   * Generate ultra-realistic French knots with 3D texture and lighting
   */
  static generateUltraRealisticFrenchKnot(
    geometry: FrenchKnotGeometry,
    pattern: FrenchKnotPattern,
    material: FrenchKnotMaterial,
    lighting: FrenchKnotLighting,
    properties3D: FrenchKnot3DProperties
  ): AdvancedStitch[] {
    try {
      const startTime = performance.now();
      
      console.log('🎯 Generating ultra-realistic French knots...', {
        geometry: geometry,
        pattern: pattern,
        material: material,
        properties3D: properties3D
      });

      // Generate base French knot pattern
      const basePattern = this.generateBaseFrenchKnotPattern(geometry, pattern, properties3D);
      
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
      performanceMonitor.trackMetric('ultra_realistic_french_knot_generation', duration, 'ms', 'embroidery', 'UltraRealisticFrenchKnot');
      
      console.log(`✅ Generated ${finalStitches.length} ultra-realistic French knots in ${duration.toFixed(2)}ms`);
      
      return finalStitches;
      
    } catch (error) {
      centralizedErrorHandler.handleError(
        error as Error,
        { component: 'UltraRealisticFrenchKnot', function: 'generateUltraRealisticFrenchKnot' },
        ErrorSeverity.HIGH,
        ErrorCategory.EMBROIDERY
      );
      return [];
    }
  }

  /**
   * Generate base French knot pattern based on pattern type
   */
  private static generateBaseFrenchKnotPattern(
    geometry: FrenchKnotGeometry,
    pattern: FrenchKnotPattern,
    properties3D: FrenchKnot3DProperties
  ): any[] {
    const patterns: any[] = [];
    
    switch (pattern.type) {
      case 'single':
        patterns.push(...this.generateSingleFrenchKnot(geometry, pattern, properties3D));
        break;
      case 'double':
        patterns.push(...this.generateDoubleFrenchKnot(geometry, pattern, properties3D));
        break;
      case 'triple':
        patterns.push(...this.generateTripleFrenchKnot(geometry, pattern, properties3D));
        break;
      case 'bullion':
        patterns.push(...this.generateBullionFrenchKnot(geometry, pattern, properties3D));
        break;
      case 'colonial':
        patterns.push(...this.generateColonialFrenchKnot(geometry, pattern, properties3D));
        break;
      case 'padded':
        patterns.push(...this.generatePaddedFrenchKnot(geometry, pattern, properties3D));
        break;
      case 'wrapped':
        patterns.push(...this.generateWrappedFrenchKnot(geometry, pattern, properties3D));
        break;
      case 'heavy':
        patterns.push(...this.generateHeavyFrenchKnot(geometry, pattern, properties3D));
        break;
      default:
        patterns.push(...this.generateSingleFrenchKnot(geometry, pattern, properties3D));
    }
    
    return patterns;
  }

  /**
   * Generate single French knot pattern
   */
  private static generateSingleFrenchKnot(
    geometry: FrenchKnotGeometry,
    pattern: FrenchKnotPattern,
    properties3D: FrenchKnot3DProperties
  ): any[] {
    const patterns: any[] = [];
    const position = geometry.position;
    const knotSize = geometry.size * properties3D.knotSize;
    const wraps = Math.max(1, Math.floor(properties3D.knotWraps));
    
    // Generate knot points in a spiral pattern
    const points: any[] = [];
    const centerX = position.x;
    const centerY = position.y;
    const centerZ = position.z;
    
    for (let i = 0; i < wraps * 8; i++) {
      const angle = (i / (wraps * 8)) * Math.PI * 2;
      const radius = (i / (wraps * 8)) * knotSize * 0.5;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const z = centerZ + (i / (wraps * 8)) * properties3D.height;
      
      points.push({ x, y, z, angle, radius });
    }
    
    patterns.push({
      points: points,
      type: 'single_french_knot',
      index: 0,
      center: { x: centerX, y: centerY, z: centerZ },
      size: knotSize,
      wraps: wraps
    });
    
    return patterns;
  }

  /**
   * Generate double French knot pattern
   */
  private static generateDoubleFrenchKnot(
    geometry: FrenchKnotGeometry,
    pattern: FrenchKnotPattern,
    properties3D: FrenchKnot3DProperties
  ): any[] {
    const patterns: any[] = [];
    const position = geometry.position;
    const knotSize = geometry.size * properties3D.knotSize;
    const wraps = Math.max(2, Math.floor(properties3D.knotWraps));
    
    // Generate two overlapping knots
    for (let knot = 0; knot < 2; knot++) {
      const points: any[] = [];
      const centerX = position.x + (knot - 0.5) * knotSize * 0.3;
      const centerY = position.y + (knot - 0.5) * knotSize * 0.3;
      const centerZ = position.z;
      
      for (let i = 0; i < wraps * 8; i++) {
        const angle = (i / (wraps * 8)) * Math.PI * 2;
        const radius = (i / (wraps * 8)) * knotSize * 0.4;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const z = centerZ + (i / (wraps * 8)) * properties3D.height;
        
        points.push({ x, y, z, angle, radius });
      }
      
      patterns.push({
        points: points,
        type: 'double_french_knot',
        index: knot,
        center: { x: centerX, y: centerY, z: centerZ },
        size: knotSize,
        wraps: wraps
      });
    }
    
    return patterns;
  }

  /**
   * Generate triple French knot pattern
   */
  private static generateTripleFrenchKnot(
    geometry: FrenchKnotGeometry,
    pattern: FrenchKnotPattern,
    properties3D: FrenchKnot3DProperties
  ): any[] {
    const patterns: any[] = [];
    const position = geometry.position;
    const knotSize = geometry.size * properties3D.knotSize;
    const wraps = Math.max(3, Math.floor(properties3D.knotWraps));
    
    // Generate three overlapping knots
    for (let knot = 0; knot < 3; knot++) {
      const points: any[] = [];
      const angle = (knot / 3) * Math.PI * 2;
      const centerX = position.x + Math.cos(angle) * knotSize * 0.2;
      const centerY = position.y + Math.sin(angle) * knotSize * 0.2;
      const centerZ = position.z;
      
      for (let i = 0; i < wraps * 6; i++) {
        const wrapAngle = (i / (wraps * 6)) * Math.PI * 2;
        const radius = (i / (wraps * 6)) * knotSize * 0.3;
        const x = centerX + Math.cos(wrapAngle) * radius;
        const y = centerY + Math.sin(wrapAngle) * radius;
        const z = centerZ + (i / (wraps * 6)) * properties3D.height;
        
        points.push({ x, y, z, angle: wrapAngle, radius });
      }
      
      patterns.push({
        points: points,
        type: 'triple_french_knot',
        index: knot,
        center: { x: centerX, y: centerY, z: centerZ },
        size: knotSize,
        wraps: wraps
      });
    }
    
    return patterns;
  }

  /**
   * Generate bullion French knot pattern
   */
  private static generateBullionFrenchKnot(
    geometry: FrenchKnotGeometry,
    pattern: FrenchKnotPattern,
    properties3D: FrenchKnot3DProperties
  ): any[] {
    const patterns: any[] = [];
    const position = geometry.position;
    const knotSize = geometry.size * properties3D.knotSize;
    const wraps = Math.max(5, Math.floor(properties3D.knotWraps * 2));
    
    // Generate elongated bullion knot
    const points: any[] = [];
    const centerX = position.x;
    const centerY = position.y;
    const centerZ = position.z;
    
    for (let i = 0; i < wraps * 12; i++) {
      const angle = (i / (wraps * 12)) * Math.PI * 2;
      const radius = (i / (wraps * 12)) * knotSize * 0.6;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const z = centerZ + (i / (wraps * 12)) * properties3D.height * 1.5;
      
      points.push({ x, y, z, angle, radius });
    }
    
    patterns.push({
      points: points,
      type: 'bullion_french_knot',
      index: 0,
      center: { x: centerX, y: centerY, z: centerZ },
      size: knotSize,
      wraps: wraps
    });
    
    return patterns;
  }

  /**
   * Generate colonial French knot pattern
   */
  private static generateColonialFrenchKnot(
    geometry: FrenchKnotGeometry,
    pattern: FrenchKnotPattern,
    properties3D: FrenchKnot3DProperties
  ): any[] {
    const patterns: any[] = [];
    const position = geometry.position;
    const knotSize = geometry.size * properties3D.knotSize;
    const wraps = Math.max(2, Math.floor(properties3D.knotWraps));
    
    // Generate colonial knot with distinctive shape
    const points: any[] = [];
    const centerX = position.x;
    const centerY = position.y;
    const centerZ = position.z;
    
    for (let i = 0; i < wraps * 10; i++) {
      const angle = (i / (wraps * 10)) * Math.PI * 2;
      const radius = (i / (wraps * 10)) * knotSize * 0.5;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const z = centerZ + (i / (wraps * 10)) * properties3D.height * 0.8;
      
      points.push({ x, y, z, angle, radius });
    }
    
    patterns.push({
      points: points,
      type: 'colonial_french_knot',
      index: 0,
      center: { x: centerX, y: centerY, z: centerZ },
      size: knotSize,
      wraps: wraps
    });
    
    return patterns;
  }

  /**
   * Generate padded French knot pattern
   */
  private static generatePaddedFrenchKnot(
    geometry: FrenchKnotGeometry,
    pattern: FrenchKnotPattern,
    properties3D: FrenchKnot3DProperties
  ): any[] {
    const patterns: any[] = [];
    const position = geometry.position;
    const knotSize = geometry.size * properties3D.knotSize;
    const wraps = Math.max(3, Math.floor(properties3D.knotWraps));
    
    // Generate padded knot with extra height
    const points: any[] = [];
    const centerX = position.x;
    const centerY = position.y;
    const centerZ = position.z;
    
    for (let i = 0; i < wraps * 8; i++) {
      const angle = (i / (wraps * 8)) * Math.PI * 2;
      const radius = (i / (wraps * 8)) * knotSize * 0.4;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const z = centerZ + (i / (wraps * 8)) * properties3D.height * 1.2;
      
      points.push({ x, y, z, angle, radius });
    }
    
    patterns.push({
      points: points,
      type: 'padded_french_knot',
      index: 0,
      center: { x: centerX, y: centerY, z: centerZ },
      size: knotSize,
      wraps: wraps
    });
    
    return patterns;
  }

  /**
   * Generate wrapped French knot pattern
   */
  private static generateWrappedFrenchKnot(
    geometry: FrenchKnotGeometry,
    pattern: FrenchKnotPattern,
    properties3D: FrenchKnot3DProperties
  ): any[] {
    const patterns: any[] = [];
    const position = geometry.position;
    const knotSize = geometry.size * properties3D.knotSize;
    const wraps = Math.max(4, Math.floor(properties3D.knotWraps * 1.5));
    
    // Generate wrapped knot with extra wraps
    const points: any[] = [];
    const centerX = position.x;
    const centerY = position.y;
    const centerZ = position.z;
    
    for (let i = 0; i < wraps * 10; i++) {
      const angle = (i / (wraps * 10)) * Math.PI * 2;
      const radius = (i / (wraps * 10)) * knotSize * 0.5;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const z = centerZ + (i / (wraps * 10)) * properties3D.height;
      
      points.push({ x, y, z, angle, radius });
    }
    
    patterns.push({
      points: points,
      type: 'wrapped_french_knot',
      index: 0,
      center: { x: centerX, y: centerY, z: centerZ },
      size: knotSize,
      wraps: wraps
    });
    
    return patterns;
  }

  /**
   * Generate heavy French knot pattern
   */
  private static generateHeavyFrenchKnot(
    geometry: FrenchKnotGeometry,
    pattern: FrenchKnotPattern,
    properties3D: FrenchKnot3DProperties
  ): any[] {
    const patterns: any[] = [];
    const position = geometry.position;
    const knotSize = geometry.size * properties3D.knotSize;
    const wraps = Math.max(6, Math.floor(properties3D.knotWraps * 2));
    
    // Generate heavy knot with many wraps
    const points: any[] = [];
    const centerX = position.x;
    const centerY = position.y;
    const centerZ = position.z;
    
    for (let i = 0; i < wraps * 12; i++) {
      const angle = (i / (wraps * 12)) * Math.PI * 2;
      const radius = (i / (wraps * 12)) * knotSize * 0.6;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const z = centerZ + (i / (wraps * 12)) * properties3D.height * 1.3;
      
      points.push({ x, y, z, angle, radius });
    }
    
    patterns.push({
      points: points,
      type: 'heavy_french_knot',
      index: 0,
      center: { x: centerX, y: centerY, z: centerZ },
      size: knotSize,
      wraps: wraps,
      thickness: 2.0 // Thicker than normal
    });
    
    return patterns;
  }

  /**
   * Apply 3D padding and height to create raised effect
   */
  private static apply3DPadding(pattern: any[], properties3D: FrenchKnot3DProperties): any[] {
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
    material: FrenchKnotMaterial,
    properties3D: FrenchKnot3DProperties
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
    material: FrenchKnotMaterial,
    lighting: FrenchKnotLighting,
    properties3D: FrenchKnot3DProperties
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
        id: `ultra_french_knot_${index}_${Date.now()}`,
        type: 'french-knot',
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

  /**
   * Generate underlay stitches for raised effect
   */
  private static generateUnderlayStitches(
    geometry: FrenchKnotGeometry,
    pattern: FrenchKnotPattern,
    properties3D: FrenchKnot3DProperties
  ): AdvancedStitch[] {
    const underlayStitches: AdvancedStitch[] = [];
    
    if (properties3D.underlayType === 'none') {
      return underlayStitches;
    }
    
    // Generate padding underlay
    const paddingStitches = this.generatePaddingUnderlay(geometry, pattern, properties3D);
    underlayStitches.push(...paddingStitches);
    
    // Generate contour underlay
    const contourStitches = this.generateContourUnderlay(geometry, pattern, properties3D);
    underlayStitches.push(...contourStitches);
    
    return underlayStitches;
  }

  // Helper methods for material and lighting

  private static calculatePointLighting(
    point: any, 
    lighting: FrenchKnotLighting, 
    material: FrenchKnotMaterial,
    properties3D: FrenchKnot3DProperties
  ): any {
    // Calculate normal vector for the point
    const normal = this.calculatePointNormal(point);
    
    // Calculate light direction
    const lightDir = this.normalizeVector(lighting.lightDirection);
    
    // Calculate diffuse lighting
    const diffuse = Math.max(0, this.dotProduct(normal, lightDir)) * lighting.directionalIntensity;
    
    // Calculate ambient lighting
    const ambient = lighting.ambientIntensity;
    
    // Calculate specular lighting (for sheen)
    const viewDir = { x: 0, y: 0, z: 1 }; // Assuming view from above
    const reflectDir = this.reflectVector(lightDir, normal);
    const specular = Math.pow(Math.max(0, this.dotProduct(viewDir, reflectDir)), 32) * material.sheen * lighting.highlightIntensity;
    
    // Calculate rim lighting
    let rimLighting = 0;
    if (lighting.rimLighting) {
      const rimFactor = 1 - Math.abs(this.dotProduct(normal, viewDir));
      rimLighting = rimFactor * lighting.rimIntensity;
    }
    
    // Calculate knot highlighting
    let knotHighlighting = 0;
    if (lighting.knotHighlighting) {
      knotHighlighting = this.calculateKnotHighlighting(point, properties3D);
    }
    
    // Calculate final lighting
    const totalLighting = ambient + diffuse + specular + rimLighting + knotHighlighting;
    
    return {
      ambient,
      diffuse,
      specular,
      rimLighting,
      knotHighlighting,
      total: Math.min(1, totalLighting)
    };
  }

  private static calculateKnotHighlighting(point: any, properties3D: FrenchKnot3DProperties): number {
    // Calculate knot highlighting based on knot properties
    const knotFactor = properties3D.knotSize * properties3D.knotTightness * properties3D.knotTexture;
    return knotFactor * 0.4; // Subtle effect
  }

  private static generateMaterialProperties(material: FrenchKnotMaterial, stitch: any): any {
    return {
      albedo: this.calculateThreadColor(material, stitch),
      normal: this.generateNormalMap(material),
      roughness: material.roughness,
      metallic: material.metallic ? 1.0 : 0.0,
      emission: material.glowIntensity > 0 ? this.calculateThreadColor(material, stitch) : '#000000',
      ao: this.generateAmbientOcclusion(stitch),
      height: material.threadThickness * 0.1,
      sheen: material.sheen,
      variegation: material.variegationPattern
    };
  }

  private static calculateThreadColor(material: FrenchKnotMaterial, stitch: any): string {
    // Base color calculation with variegation
    let baseColor = material.color || '#FF69B4'; // Default pink
    
    // Apply variegation pattern
    if (material.variegationPattern) {
      const variegationFactor = this.calculateVariegationFactor(stitch, material.variegationPattern);
      baseColor = this.applyVariegation(baseColor, variegationFactor);
    }
    
    return baseColor;
  }

  private static calculateVariegationFactor(stitch: any, pattern: string): number {
    // Calculate variegation based on position and pattern
    const centerX = stitch.points.reduce((sum: number, p: any) => sum + p.x, 0) / stitch.points.length;
    const centerY = stitch.points.reduce((sum: number, p: any) => sum + p.y, 0) / stitch.points.length;
    
    // Simple noise-based variegation
    const noise = Math.sin(centerX * 0.1) * Math.cos(centerY * 0.1);
    return (noise + 1) / 2; // Normalize to 0-1
  }

  private static applyVariegation(baseColor: string, factor: number): string {
    // Apply color variation based on factor
    // This is a simplified implementation
    return baseColor;
  }

  private static generateNormalMap(material: FrenchKnotMaterial): string {
    return `french_knot_normal_${material.threadType}_${material.roughness}`;
  }

  private static generateAmbientOcclusion(stitch: any): string {
    return `french_knot_ao_${stitch.points.length}`;
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

  private static calculateShadowOffset(stitch: any, lighting: FrenchKnotLighting): { x: number; y: number; z: number } {
    const lightDir = this.normalizeVector(lighting.lightDirection);
    const shadowLength = 0.5; // mm
    
    return {
      x: -lightDir.x * shadowLength,
      y: -lightDir.y * shadowLength,
      z: -lightDir.z * shadowLength
    };
  }

  private static calculateStitchNormal(stitch: any): { x: number; y: number; z: number } {
    if (stitch.points.length < 3) return { x: 0, y: 0, z: 1 };
    
    // Calculate normal from first three points
    const p1 = stitch.points[0];
    const p2 = stitch.points[1];
    const p3 = stitch.points[2];
    
    const v1 = { x: p2.x - p1.x, y: p2.y - p1.y, z: p2.z - p1.z };
    const v2 = { x: p3.x - p1.x, y: p3.y - p1.y, z: p3.z - p1.z };
    
    const normal = this.crossProduct(v1, v2);
    return this.normalizeVector(normal);
  }

  private static generateUVCoordinates(stitch: any): { u: number; v: number }[] {
    return stitch.points.map((_: any, index: number) => ({
      u: index / Math.max(1, stitch.points.length - 1),
      v: 0.5
    }));
  }

  private static generatePaddingUnderlay(
    geometry: FrenchKnotGeometry,
    pattern: FrenchKnotPattern,
    properties3D: FrenchKnot3DProperties
  ): AdvancedStitch[] {
    // Generate padding stitches for raised effect
    const paddingStitches: AdvancedStitch[] = [];
    
    // This would generate actual padding stitches
    // For now, return empty array as placeholder
    
    return paddingStitches;
  }

  private static generateContourUnderlay(
    geometry: FrenchKnotGeometry,
    pattern: FrenchKnotPattern,
    properties3D: FrenchKnot3DProperties
  ): AdvancedStitch[] {
    // Generate contour underlay stitches
    const contourStitches: AdvancedStitch[] = [];
    
    // This would generate actual contour stitches
    // For now, return empty array as placeholder
    
    return contourStitches;
  }

  // Mathematical helper functions

  private static calculateDistance(p1: any, p2: any): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = (p2.z || 0) - (p1.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  private static calculatePointNormal(point: any): { x: number; y: number; z: number } {
    // Simplified normal calculation
    return { x: 0, y: 0, z: 1 };
  }

  private static normalizeVector(v: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
    const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    if (length === 0) return { x: 0, y: 0, z: 1 };
    
    return {
      x: v.x / length,
      y: v.y / length,
      z: v.z / length
    };
  }

  private static dotProduct(v1: { x: number; y: number; z: number }, v2: { x: number; y: number; z: number }): number {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  }

  private static crossProduct(v1: { x: number; y: number; z: number }, v2: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
    return {
      x: v1.y * v2.z - v1.z * v2.y,
      y: v1.z * v2.x - v1.x * v2.z,
      z: v1.x * v2.y - v1.y * v2.x
    };
  }

  private static reflectVector(incident: { x: number; y: number; z: number }, normal: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
    const dot = this.dotProduct(incident, normal);
    return {
      x: incident.x - 2 * dot * normal.x,
      y: incident.y - 2 * dot * normal.y,
      z: incident.z - 2 * dot * normal.z
    };
  }
}

export default UltraRealisticFrenchKnot;


























