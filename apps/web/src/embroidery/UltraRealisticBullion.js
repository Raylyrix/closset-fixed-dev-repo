/**
 * Ultra-Realistic Bullion Stitch System
 * Implements hyper-realistic bullion stitch rendering with 3D texture, lighting, and material properties
 */
import { performanceMonitor } from '../utils/PerformanceMonitor';
import { centralizedErrorHandler, ErrorCategory, ErrorSeverity } from '../utils/CentralizedErrorHandler';
export class UltraRealisticBullion {
    /**
     * Generate ultra-realistic bullion stitches with 3D texture and lighting
     */
    static generateUltraRealisticBullion(geometry, pattern, material, lighting, properties3D) {
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
        }
        catch (error) {
            centralizedErrorHandler.handleError(error, { component: 'UltraRealisticBullion', function: 'generateUltraRealisticBullion' }, ErrorSeverity.HIGH, ErrorCategory.EMBROIDERY);
            return [];
        }
    }
    /**
     * Generate base bullion pattern based on pattern type
     */
    static generateBaseBullionPattern(geometry, pattern, properties3D) {
        const patterns = [];
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
    static generateWrappedBullion(geometry, pattern, properties3D) {
        // Use spiral as a visually similar fallback
        return this.generateSpiralBullion(geometry, pattern, properties3D);
    }
    /**
     * Wrapper: Generate padded bullion pattern (maps to double bullion for now)
     */
    static generatePaddedBullion(geometry, pattern, properties3D) {
        return this.generateDoubleBullion(geometry, pattern, properties3D);
    }
    /**
     * Wrapper: Generate heavy bullion pattern (maps to triple bullion for now)
     */
    static generateHeavyBullion(geometry, pattern, properties3D) {
        return this.generateTripleBullion(geometry, pattern, properties3D);
    }
    /**
     * Wrapper: Generate decorative bullion pattern (maps to double + spiral)
     */
    static generateDecorativeBullion(geometry, pattern, properties3D) {
        const a = this.generateDoubleBullion(geometry, pattern, properties3D);
        const b = this.generateSpiralBullion(geometry, pattern, properties3D);
        return [...a, ...b];
    }
    /**
     * Generate single bullion pattern
     */
    static generateSingleBullion(geometry, pattern, properties3D) {
        const patterns = [];
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
                const bullionPoints = this.generateBullionSpiral({ x, y, z }, bullionLength, properties3D.bullionWraps, properties3D.bullionTightness);
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
    static generateBullionSpiral(center, length, wraps, tightness) {
        const points = [];
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
    static generateDoubleBullion(geometry, pattern, properties3D) {
        const patterns = [];
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
    static generateTripleBullion(geometry, pattern, properties3D) {
        const patterns = [];
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
    static generateSpiralBullion(geometry, pattern, properties3D) {
        const patterns = [];
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
                const spiralPoints = this.generateSpiralBullionPoints({ x, y, z }, bullionLength, properties3D.bullionWraps, properties3D.bullionTightness);
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
    static generateSpiralBullionPoints(center, length, wraps, tightness) {
        const points = [];
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
    static apply3DPadding(pattern, properties3D) {
        return pattern.map(stitch => {
            const paddedPoints = stitch.points.map((point) => ({
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
    static generateDetailedStitchGeometry(pattern, material, properties3D) {
        return pattern.map(stitch => {
            const detailedPoints = stitch.points.map((point, index) => {
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
    static applyMaterialAndLighting(stitches, material, lighting, properties3D) {
        return stitches.map((stitch, index) => {
            // Calculate lighting for each point
            const litPoints = stitch.points.map((point) => {
                const pointLighting = this.calculatePointLighting(point, lighting, material, properties3D);
                return {
                    ...point,
                    lighting: pointLighting
                };
            });
            // Generate material properties
            const materialProps = this.generateMaterialProperties(material, stitch);
            // Create advanced stitch with all properties
            const advancedStitch = {
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
    static calculatePointLighting(point, lighting, material, properties3D) {
        // Simplified lighting calculation
        return {
            ambient: lighting.ambientIntensity,
            diffuse: lighting.directionalIntensity,
            specular: material.sheen * lighting.highlightIntensity,
            total: Math.min(1, lighting.ambientIntensity + lighting.directionalIntensity)
        };
    }
    static generateMaterialProperties(material, stitch) {
        return {
            albedo: material.color || '#FF69B4',
            normal: `bullion_normal_${material.threadType}`,
            roughness: material.roughness,
            metallic: material.metallic ? 1.0 : 0.0,
            emission: material.glowIntensity > 0 ? material.color : '#000000',
            sheen: material.sheen
        };
    }
    static calculateThreadColor(material, stitch) {
        return material.color || '#FF69B4';
    }
    static calculateStitchDirection(stitch) {
        if (stitch.points.length < 2)
            return 0;
        const start = stitch.points[0];
        const end = stitch.points[stitch.points.length - 1];
        return Math.atan2(end.y - start.y, end.x - start.x);
    }
    static calculateStitchLength(stitch) {
        let length = 0;
        for (let i = 0; i < stitch.points.length - 1; i++) {
            length += this.calculateDistance(stitch.points[i], stitch.points[i + 1]);
        }
        return length;
    }
    static calculateShadowOffset(stitch, lighting) {
        return { x: 0, y: 0, z: 0 };
    }
    static calculateStitchNormal(stitch) {
        return { x: 0, y: 0, z: 1 };
    }
    static generateUVCoordinates(stitch) {
        return stitch.points.map((_, index) => ({
            u: index / Math.max(1, stitch.points.length - 1),
            v: 0.5
        }));
    }
    static generateUnderlayStitches(geometry, pattern, properties3D) {
        return [];
    }
    static calculateDistance(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dz = (p2.z || 0) - (p1.z || 0);
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
}
UltraRealisticBullion.PIXELS_PER_MM = 3.7795275591; // 96 DPI
UltraRealisticBullion.MAX_BULLION_LENGTH = 12.0; // mm
UltraRealisticBullion.MIN_BULLION_LENGTH = 1.0; // mm
export default UltraRealisticBullion;
