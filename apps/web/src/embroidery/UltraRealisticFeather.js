/**
 * Ultra-Realistic Feather Stitch System
 * Implements hyper-realistic feather stitch rendering with 3D texture, lighting, and material properties
 */
import { performanceMonitor } from '../utils/PerformanceMonitor';
import { centralizedErrorHandler, ErrorCategory, ErrorSeverity } from '../utils/CentralizedErrorHandler';
export class UltraRealisticFeather {
    /**
     * Generate ultra-realistic feather stitches with 3D texture and lighting
     */
    static generateUltraRealisticFeather(geometry, pattern, material, lighting, properties3D) {
        try {
            const startTime = performance.now();
            console.log('🪶 Generating ultra-realistic feather stitches...', {
                geometry: geometry,
                pattern: pattern,
                material: material,
                properties3D: properties3D
            });
            // Generate base feather pattern
            const basePattern = this.generateBaseFeatherPattern(geometry, pattern, properties3D);
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
            performanceMonitor.trackMetric('ultra_realistic_feather_generation', duration, 'ms', 'embroidery', 'UltraRealisticFeather');
            console.log(`✅ Generated ${finalStitches.length} ultra-realistic feather stitches in ${duration.toFixed(2)}ms`);
            return finalStitches;
        }
        catch (error) {
            centralizedErrorHandler.handleError(error, { component: 'UltraRealisticFeather', function: 'generateUltraRealisticFeather' }, ErrorSeverity.HIGH, ErrorCategory.EMBROIDERY);
            return [];
        }
    }
    /**
     * Generate base feather pattern based on pattern type
     */
    static generateBaseFeatherPattern(geometry, pattern, properties3D) {
        const patterns = [];
        switch (pattern.type) {
            case 'single':
                patterns.push(...this.generateSingleFeather(geometry, pattern, properties3D));
                break;
            case 'double':
                patterns.push(...this.generateDoubleFeather(geometry, pattern, properties3D));
                break;
            case 'triple':
                patterns.push(...this.generateTripleFeather(geometry, pattern, properties3D));
                break;
            case 'open':
                patterns.push(...this.generateOpenFeather(geometry, pattern, properties3D));
                break;
            case 'closed':
                patterns.push(...this.generateClosedFeather(geometry, pattern, properties3D));
                break;
            case 'zigzag':
                patterns.push(...this.generateZigzagFeather(geometry, pattern, properties3D));
                break;
            case 'curved':
                patterns.push(...this.generateCurvedFeather(geometry, pattern, properties3D));
                break;
            case 'decorative':
                patterns.push(...this.generateDecorativeFeather(geometry, pattern, properties3D));
                break;
            default:
                patterns.push(...this.generateSingleFeather(geometry, pattern, properties3D));
        }
        return patterns;
    }
    /**
     * Generate single feather pattern
     */
    static generateSingleFeather(geometry, pattern, properties3D) {
        const patterns = [];
        const path = geometry.path;
        const spacing = 1.0 / pattern.density; // mm between stitches
        const featherLength = properties3D.featherLength * this.MAX_FEATHER_LENGTH;
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
                // Generate feather segments
                const featherPoints = this.generateFeatherSegments({ x, y, z }, featherLength, properties3D.featherAngle, properties3D.featherCurve, properties3D.featherSpacing);
                patterns.push({
                    points: featherPoints,
                    type: 'single_feather',
                    index: i * stitchCount + j,
                    center: { x, y, z },
                    length: featherLength
                });
            }
        }
        return patterns;
    }
    /**
     * Generate feather segments
     */
    static generateFeatherSegments(center, length, angle, curve, spacing) {
        const points = [];
        const segments = 3; // Number of feather segments
        for (let i = 0; i < segments; i++) {
            const segmentAngle = angle + (i - 1) * 30; // 30 degrees between segments
            const segmentLength = length * (1 - i * 0.2); // Decreasing length
            const segmentX = center.x + Math.cos(segmentAngle * Math.PI / 180) * segmentLength;
            const segmentY = center.y + Math.sin(segmentAngle * Math.PI / 180) * segmentLength;
            const segmentZ = center.z + curve * Math.sin(i * Math.PI / segments);
            points.push({
                x: segmentX,
                y: segmentY,
                z: segmentZ,
                angle: segmentAngle,
                length: segmentLength,
                segment: i
            });
        }
        return points;
    }
    /**
     * Generate double feather pattern
     */
    static generateDoubleFeather(geometry, pattern, properties3D) {
        const patterns = [];
        const path = geometry.path;
        const spacing = 1.0 / pattern.density;
        const featherLength = properties3D.featherLength * this.MAX_FEATHER_LENGTH;
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
                // Generate two parallel feather sets
                const offset = 0.3; // mm offset
                const angle = Math.atan2(end.y - start.y, end.x - start.x);
                const perpAngle = angle + Math.PI / 2;
                const center1 = { x, y, z };
                const center2 = {
                    x: x + Math.cos(perpAngle) * offset,
                    y: y + Math.sin(perpAngle) * offset,
                    z: z
                };
                const feather1 = this.generateFeatherSegments(center1, featherLength, properties3D.featherAngle, properties3D.featherCurve, properties3D.featherSpacing);
                const feather2 = this.generateFeatherSegments(center2, featherLength, properties3D.featherAngle, properties3D.featherCurve, properties3D.featherSpacing);
                patterns.push({
                    points: feather1,
                    type: 'double_feather_1',
                    index: i * stitchCount + j,
                    center: center1,
                    length: featherLength
                });
                patterns.push({
                    points: feather2,
                    type: 'double_feather_2',
                    index: i * stitchCount + j,
                    center: center2,
                    length: featherLength
                });
            }
        }
        return patterns;
    }
    /**
     * Generate triple feather pattern
     */
    static generateTripleFeather(geometry, pattern, properties3D) {
        const patterns = [];
        const path = geometry.path;
        const spacing = 1.0 / pattern.density;
        const featherLength = properties3D.featherLength * this.MAX_FEATHER_LENGTH;
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
                // Generate three feather sets in triangular formation
                const offset = 0.4; // mm offset
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
                    const feather = this.generateFeatherSegments(center, featherLength, properties3D.featherAngle, properties3D.featherCurve, properties3D.featherSpacing);
                    patterns.push({
                        points: feather,
                        type: `triple_feather_${index + 1}`,
                        index: i * stitchCount + j,
                        center: center,
                        length: featherLength
                    });
                });
            }
        }
        return patterns;
    }
    /**
     * Generate open feather pattern
     */
    static generateOpenFeather(geometry, pattern, properties3D) {
        const patterns = [];
        const path = geometry.path;
        const spacing = 1.0 / pattern.density;
        const featherLength = properties3D.featherLength * this.MAX_FEATHER_LENGTH;
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
                // Generate open feather with wider spacing
                const featherPoints = this.generateFeatherSegments({ x, y, z }, featherLength, properties3D.featherAngle, properties3D.featherCurve, properties3D.featherSpacing * 1.5);
                patterns.push({
                    points: featherPoints,
                    type: 'open_feather',
                    index: i * stitchCount + j,
                    center: { x, y, z },
                    length: featherLength
                });
            }
        }
        return patterns;
    }
    /**
     * Generate closed feather pattern
     */
    static generateClosedFeather(geometry, pattern, properties3D) {
        const patterns = [];
        const path = geometry.path;
        const spacing = 1.0 / pattern.density;
        const featherLength = properties3D.featherLength * this.MAX_FEATHER_LENGTH;
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
                // Generate closed feather with tighter spacing
                const featherPoints = this.generateFeatherSegments({ x, y, z }, featherLength, properties3D.featherAngle, properties3D.featherCurve, properties3D.featherSpacing * 0.7);
                patterns.push({
                    points: featherPoints,
                    type: 'closed_feather',
                    index: i * stitchCount + j,
                    center: { x, y, z },
                    length: featherLength
                });
            }
        }
        return patterns;
    }
    /**
     * Generate zigzag feather pattern
     */
    static generateZigzagFeather(geometry, pattern, properties3D) {
        const patterns = [];
        const path = geometry.path;
        const spacing = 1.0 / pattern.density;
        const featherLength = properties3D.featherLength * this.MAX_FEATHER_LENGTH;
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
                // Generate zigzag feather with alternating angles
                const zigzagAngle = properties3D.featherAngle + (j % 2 === 0 ? 30 : -30);
                const featherPoints = this.generateFeatherSegments({ x, y, z }, featherLength, zigzagAngle, properties3D.featherCurve, properties3D.featherSpacing);
                patterns.push({
                    points: featherPoints,
                    type: 'zigzag_feather',
                    index: i * stitchCount + j,
                    center: { x, y, z },
                    length: featherLength
                });
            }
        }
        return patterns;
    }
    /**
     * Generate curved feather pattern
     */
    static generateCurvedFeather(geometry, pattern, properties3D) {
        const patterns = [];
        const path = geometry.path;
        const spacing = 1.0 / pattern.density;
        const featherLength = properties3D.featherLength * this.MAX_FEATHER_LENGTH;
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
                // Generate curved feather with enhanced curvature
                const curvedAngle = properties3D.featherAngle + Math.sin(t * Math.PI) * 45;
                const featherPoints = this.generateFeatherSegments({ x, y, z }, featherLength, curvedAngle, properties3D.featherCurve * 1.5, properties3D.featherSpacing);
                patterns.push({
                    points: featherPoints,
                    type: 'curved_feather',
                    index: i * stitchCount + j,
                    center: { x, y, z },
                    length: featherLength
                });
            }
        }
        return patterns;
    }
    /**
     * Generate decorative feather pattern
     */
    static generateDecorativeFeather(geometry, pattern, properties3D) {
        const patterns = [];
        const path = geometry.path;
        const spacing = 1.0 / pattern.density;
        const featherLength = properties3D.featherLength * this.MAX_FEATHER_LENGTH;
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
                // Generate decorative feather with varying angles and lengths
                const decorativeAngle = properties3D.featherAngle + Math.sin(j * Math.PI / 4) * 30;
                const decorativeLength = featherLength * (0.8 + Math.cos(j * Math.PI / 3) * 0.4);
                const featherPoints = this.generateFeatherSegments({ x, y, z }, decorativeLength, decorativeAngle, properties3D.featherCurve, properties3D.featherSpacing);
                patterns.push({
                    points: featherPoints,
                    type: 'decorative_feather',
                    index: i * stitchCount + j,
                    center: { x, y, z },
                    length: decorativeLength
                });
            }
        }
        return patterns;
    }
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
                const lighting = this.calculatePointLighting(point, lighting, material, properties3D);
                return {
                    ...point,
                    lighting: lighting
                };
            });
            // Generate material properties
            const materialProps = this.generateMaterialProperties(material, stitch);
            // Create advanced stitch with all properties
            const advancedStitch = {
                id: `ultra_feather_${index}_${Date.now()}`,
                type: 'feather',
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
            normal: `feather_normal_${material.threadType}`,
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
UltraRealisticFeather.PIXELS_PER_MM = 3.7795275591; // 96 DPI
UltraRealisticFeather.MAX_FEATHER_LENGTH = 6.0; // mm
UltraRealisticFeather.MIN_FEATHER_LENGTH = 1.0; // mm
export default UltraRealisticFeather;
