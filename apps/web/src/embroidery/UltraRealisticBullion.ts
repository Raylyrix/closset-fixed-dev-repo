/**
 * Ultra-Realistic Bullion Stitch System
 * Implements hyper-realistic bullion stitch rendering with 3D texture, lighting, and material properties
 */

import { AdvancedStitch, ThreadProperties, FabricProperties } from './AdvancedEmbroideryEngine';
import { performanceMonitor } from '../utils/PerformanceMonitor';
import { centralizedErrorHandler, ErrorCategory, ErrorSeverity } from '../utils/CentralizedErrorHandler';

export interface BullionGeometry {
  path: { x: number; y: number; z: number }[];
  width: number;
  length: number;
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
  isClosed: boolean;
}

export interface BullionPattern {
  type: 'single' | 'double' | 'triple' | 'spiral' | 'wrapped' | 'padded' | 'heavy' | 'decorative';
  direction: 'forward' | 'backward' | 'bidirectional';
  density: number; // Stitches per mm
  complexity: number; // 1-10, affects pattern detail
  symmetry: boolean; // Whether to maintain symmetry
  curveHandling: 'linear' | 'smooth' | 'bezier'; // How to handle curves
}

export interface BullionMaterial {
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

export interface BullionLighting {
  ambientIntensity: number;
  directionalIntensity: number;
  lightDirection: { x: number; y: number; z: number };
  shadowSoftness: number;
  highlightIntensity: number;
  rimLighting: boolean;
  rimIntensity: number;
  stitchHighlighting: boolean; // Whether to highlight individual stitches
  stitchIntensity: number;
}

export interface Bullion3DProperties {
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
  bullionLength: number; // Length of bullion segments (0-1)
  bullionSpacing: number; // Spacing between bullions (0-1)
  bullionWraps: number; // Number of wraps around the needle
  bullionTightness: number; // How tight the bullion is (0-1)
}

export class UltraRealisticBullion {
  private static readonly PIXELS_PER_MM = 3.7795275591; // 96 DPI
  private static readonly MAX_BULLION_LENGTH = 12.0; // mm
  private static readonly MIN_BULLION_LENGTH = 1.0; // mm

  /**
   * Generate ultra-realistic bullion stitches with 3D texture and lighting
   */
  static generateUltraRealisticBullion(
    geometry: BullionGeometry,
    pattern: BullionPattern,
    material: BullionMaterial,
    lighting: BullionLighting,
    properties3D: Bullion3DProperties
  ): AdvancedStitch[] {
    try {
      const startTime = performance.now();
      
      console.log('🌾 Generating ultra-realistic bullion stitches...', {
        geometry: geometry,
        pattern: pattern,
        material: material,
        properties3D: properties3D
      });

      // Generate base bullion pattern
      const basePattern = this.generateBaseBullionPattern(geometry, pattern, properties3D);
      
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
      performanceMonitor.trackMetric('ultra_realistic_bullion_generation', duration, 'ms', 'embroidery', 'UltraRealisticBullion');
      
      console.log(`✅ Generated ${finalStitches.length} ultra-realistic bullion stitches in ${duration.toFixed(2)}ms`);
      
      return finalStitches;
      
    } catch (error) {
      centralizedErrorHandler.handleError(
        error as Error,
        { component: 'UltraRealisticBullion', function: 'generateUltraRealisticBullion' },
        ErrorSeverity.HIGH,
        ErrorCategory.EMBROIDERY
      );
      return [];
    }
  }

  /**
   * Generate base bullion pattern based on pattern type
   */
  private static generateBaseBullionPattern(
    geometry: BullionGeometry,
    pattern: BullionPattern,
    properties3D: Bullion3DProperties
  ): any[] {
    const patterns: any[] = [];
    
    switch (pattern.type) {
      case 'single':
        patterns.push(...this.generateSingleBullion(geometry, pattern, properties3D));
        break;
      case 'double':
        patterns.push(...this.generateDoubleBullion(geometry, pattern, properties3D));
        break;
      case 'triple':
        patterns.push(...this.generateTripleBullion(geometry, pattern, properties3D));
        break;
      case 'spiral':
        patterns.push(...this.generateSpiralBullion(geometry, pattern, properties3D));
        break;
      case 'wrapped':
        patterns.push(...this.generateWrappedBullion(geometry, pattern, properties3D));
        break;
      case 'padded':
        patterns.push(...this.generatePaddedBullion(geometry, pattern, properties3D));
        break;
      case 'heavy':
        patterns.push(...this.generateHeavyBullion(geometry, pattern, properties3D));
        break;
      case 'decorative':
        patterns.push(...this.generateDecorativeBullion(geometry, pattern, properties3D));
        break;
      default:
        patterns.push(...this.generateSingleBullion(geometry, pattern, properties3D));
    }
    
    return patterns;
  }

  /**
   * Wrapper: Generate wrapped bullion pattern (maps to spiral pattern for now)
   */
  private static generateWrappedBullion(
    geometry: BullionGeometry,
    pattern: BullionPattern,
    properties3D: Bullion3DProperties
  ): any[] {
    // Use spiral as a visually similar fallback
    return this.generateSpiralBullion(geometry, pattern, properties3D);
  }

  /**
   * Wrapper: Generate padded bullion pattern (maps to double bullion for now)
   */
  private static generatePaddedBullion(
    geometry: BullionGeometry,
    pattern: BullionPattern,
    properties3D: Bullion3DProperties
  ): any[] {
    return this.generateDoubleBullion(geometry, pattern, properties3D);
  }

  /**
   * Wrapper: Generate heavy bullion pattern (maps to triple bullion for now)
   */
  private static generateHeavyBullion(
    geometry: BullionGeometry,
    pattern: BullionPattern,
    properties3D: Bullion3DProperties
  ): any[] {
    return this.generateTripleBullion(geometry, pattern, properties3D);
  }

  /**
   * Wrapper: Generate decorative bullion pattern (maps to double + spiral)
   */
  private static generateDecorativeBullion(
    geometry: BullionGeometry,
    pattern: BullionPattern,
    properties3D: Bullion3DProperties
  ): any[] {
    const a = this.generateDoubleBullion(geometry, pattern, properties3D);
    const b = this.generateSpiralBullion(geometry, pattern, properties3D);
    return [...a, ...b];
  }

  /**
   * Generate single bullion pattern
   */
  private static generateSingleBullion(
    geometry: BullionGeometry,
    pattern: BullionPattern,
    properties3D: Bullion3DProperties
  ): any[] {
    const patterns: any[] = [];
    const path = geometry.path;
    const spacing = 1.0 / pattern.density; // mm between stitches
    const bullionLength = properties3D.bullionLength * this.MAX_BULLION_LENGTH;
    
    for (let i = 0; i < path.length - 1; i++) {
      const start = path[i];
      const end = path[i + 1];
      const distance = this.calculateDistance(start, end);
      const stitchCount = Math.ceil(distance / spacing);
      
      for (let j = 0; j < stitchCount; j++) {
        const t = j / Math.max(1, stitchCount - 1);
        const x = start.x + t * (end.x - start.x);
        const y = start.y + t * (end.y - start.y);
        const z = start.z + t * (end.z - start.z);
        
        // Generate bullion spiral
        const bullionPoints = this.generateBullionSpiral(
          { x, y, z },
          bullionLength,
          properties3D.bullionWraps,
          properties3D.bullionTightness
        );
        
        patterns.push({
          points: bullionPoints,
          type: 'single_bullion',
          index: i * stitchCount + j,
          center: { x, y, z },
          length: bullionLength,
          wraps: properties3D.bullionWraps
        });
      }
    }
    
    return patterns;
  }

  /**
   * Generate bullion spiral points
   */
  private static generateBullionSpiral(
    center: { x: number; y: number; z: number },
    length: number,
    wraps: number,
    tightness: number
  ): any[] {
    const points: any[] = [];
    const segments = Math.max(8, wraps * 4);
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI * 2 * wraps;
      const radius = (t * length * tightness) / (Math.PI * 2 * wraps);
      const height = t * length * (1 - tightness);
      
      const x = center.x + Math.cos(angle) * radius;
      const y = center.y + Math.sin(angle) * radius;
      const z = center.z + height;
      
      points.push({
        x, y, z,
        angle,
        radius,
        height,
        t
      });
    }
    
    return points;
  }

  /**
   * Generate double bullion pattern
   */
  private static generateDoubleBullion(
    geometry: BullionGeometry,
    pattern: BullionPattern,
    properties3D: Bullion3DProperties
  ): any[] {
    const patterns: any[] = [];
    const path = geometry.path;
    const spacing = 1.0 / pattern.density;
    const bullionLength = properties3D.bullionLength * this.MAX_BULLION_LENGTH;
    
    for (let i = 0; i < path.length - 1; i++) {
      const start = path[i];
      const end = path[i + 1];
      const distance = this.calculateDistance(start, end);
      const stitchCount = Math.ceil(distance / spacing);
      
      for (let j = 0; j < stitchCount; j++) {
        const t = j / Math.max(1, stitchCount - 1);
        const x = start.x + t * (end.x - start.x);
        const y = start.y + t * (end.y - start.y);
        const z = start.z + t * (end.z - start.z);
        
        // Generate two parallel bullions
        const offset = 0.2; // mm offset
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const perpAngle = angle + Math.PI / 2;
        
        const center1 = { x, y, z };
        const center2 = {
          x: x + Math.cos(perpAngle) * offset,
          y: y + Math.sin(perpAngle) * offset,
          z: z
        };
        
        const bullion1 = this.generateBullionSpiral(center1, bullionLength, properties3D.bullionWraps, properties3D.bullionTightness);
        const bullion2 = this.generateBullionSpiral(center2, bullionLength, properties3D.bullionWraps, properties3D.bullionTightness);
        
        patterns.push({
          points: bullion1,
          type: 'double_bullion_1',
          index: i * stitchCount + j,
          center: center1,
          length: bullionLength,
          wraps: properties3D.bullionWraps
        });
        
        patterns.push({
          points: bullion2,
          type: 'double_bullion_2',
          index: i * stitchCount + j,
          center: center2,
          length: bullionLength,
          wraps: properties3D.bullionWraps
        });
      }
    }
    
    return patterns;
  }

  /**
   * Generate triple bullion pattern
   */
  private static generateTripleBullion(
    geometry: BullionGeometry,
    pattern: BullionPattern,
    properties3D: Bullion3DProperties
  ): any[] {
    const patterns: any[] = [];
    const path = geometry.path;
    const spacing = 1.0 / pattern.density;
    const bullionLength = properties3D.bullionLength * this.MAX_BULLION_LENGTH;
    
    for (let i = 0; i < path.length - 1; i++) {
      const start = path[i];
      const end = path[i + 1];
      const distance = this.calculateDistance(start, end);
      const stitchCount = Math.ceil(distance / spacing);
      
      for (let j = 0; j < stitchCount; j++) {
        const t = j / Math.max(1, stitchCount - 1);
        const x = start.x + t * (end.x - start.x);
        const y = start.y + t * (end.y - start.y);
        const z = start.z + t * (end.z - start.z);
        
        // Generate three bullions in triangular formation
        const offset = 0.3; // mm offset
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        
        const centers = [
          { x, y, z },
          {
            x: x + Math.cos(angle + Math.PI / 3) * offset,
            y: y + Math.sin(angle + Math.PI / 3) * offset,
            z: z
          },
          {
            x: x + Math.cos(angle - Math.PI / 3) * offset,
            y: y + Math.sin(angle - Math.PI / 3) * offset,
            z: z
          }
        ];
        
        centers.forEach((center, index) => {
          const bullion = this.generateBullionSpiral(center, bullionLength, properties3D.bullionWraps, properties3D.bullionTightness);
          patterns.push({
            points: bullion,
            type: `triple_bullion_${index + 1}`,
            index: i * stitchCount + j,
            center: center,
            length: bullionLength,
            wraps: properties3D.bullionWraps
          });
        });
      }
    }
    
    return patterns;
  }

  /**
   * Generate spiral bullion pattern
   */
  private static generateSpiralBullion(
    geometry: BullionGeometry,
    pattern: BullionPattern,
    properties3D: Bullion3DProperties
  ): any[] {
    const patterns: any[] = [];
    const path = geometry.path;
    const spacing = 1.0 / pattern.density;
    const bullionLength = properties3D.bullionLength * this.MAX_BULLION_LENGTH;
    
    for (let i = 0; i < path.length - 1; i++) {
      const start = path[i];
      const end = path[i + 1];
      const distance = this.calculateDistance(start, end);
      const stitchCount = Math.ceil(distance / spacing);
      
      for (let j = 0; j < stitchCount; j++) {
        const t = j / Math.max(1, stitchCount - 1);
        const x = start.x + t * (end.x - start.x);
        const y = start.y + t * (end.y - start.y);
        const z = start.z + t * (end.z - start.z);
        
        // Generate spiral bullion with increasing radius
        const spiralPoints = this.generateSpiralBullionPoints(
          { x, y, z },
          bullionLength,
          properties3D.bullionWraps,
          properties3D.bullionTightness
        );
        
        patterns.push({
          points: spiralPoints,
          type: 'spiral_bullion',
          index: i * stitchCount + j,
          center: { x, y, z },
          length: bullionLength,
          wraps: properties3D.bullionWraps
        });
      }
    }
    
    return patterns;
  }

  /**
   * Generate spiral bullion points with increasing radius
   */
  private static generateSpiralBullionPoints(
    center: { x: number; y: number; z: number },
    length: number,
    wraps: number,
    tightness: number
  ): any[] {
    const points: any[] = [];
    const segments = Math.max(12, wraps * 6);
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI * 2 * wraps;
      const radius = (t * length * tightness) / (Math.PI * 2 * wraps) * (1 + t * 0.5); // Increasing radius
      const height = t * length * (1 - tightness);
      
      const x = center.x + Math.cos(angle) * radius;
      const y = center.y + Math.sin(angle) * radius;
      const z = center.z + height;
      
      points.push({
        x, y, z,
        angle,
        radius,
        height,
        t
      });
    }
    
    return points;
  }

  // Additional pattern generation methods would go here...
  // (wrapped, padded, heavy, decorative bullion patterns)

  /**
   * Apply 3D padding and height to create raised effect
   */
  private static apply3DPadding(pattern: any[], properties3D: Bullion3DProperties): any[] {
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
    material: BullionMaterial,
    properties3D: Bullion3DProperties
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
    material: BullionMaterial,
    lighting: BullionLighting,
    properties3D: Bullion3DProperties
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
        id: `ultra_bullion_${index}_${Date.now()}`,
        type: 'bullion',
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
  private static calculatePointLighting(point: any, lighting: BullionLighting, material: BullionMaterial, properties3D: Bullion3DProperties): any {
    // Simplified lighting calculation
    return {
      ambient: lighting.ambientIntensity,
      diffuse: lighting.directionalIntensity,
      specular: material.sheen * lighting.highlightIntensity,
      total: Math.min(1, lighting.ambientIntensity + lighting.directionalIntensity)
    };
  }

  private static generateMaterialProperties(material: BullionMaterial, stitch: any): any {
    return {
      albedo: material.color || '#FF69B4',
      normal: `bullion_normal_${material.threadType}`,
      roughness: material.roughness,
      metallic: material.metallic ? 1.0 : 0.0,
      emission: material.glowIntensity > 0 ? material.color : '#000000',
      sheen: material.sheen
    };
  }

  private static calculateThreadColor(material: BullionMaterial, stitch: any): string {
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

  private static calculateShadowOffset(stitch: any, lighting: BullionLighting): { x: number; y: number; z: number } {
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

  private static generateUnderlayStitches(geometry: BullionGeometry, pattern: BullionPattern, properties3D: Bullion3DProperties): AdvancedStitch[] {
    return [];
  }

  private static calculateDistance(p1: any, p2: any): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = (p2.z || 0) - (p1.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}

export default UltraRealisticBullion;