/**
 * Ultra-Realistic French Knot System
 * Implements hyper-realistic French knot rendering with 3D texture, lighting, and material properties
 */
import { performanceMonitor } from '../utils/PerformanceMonitor';
import { centralizedErrorHandler, ErrorCategory, ErrorSeverity } from '../utils/CentralizedErrorHandler';
export class UltraRealisticFrenchKnot {
    /**
     * Generate ultra-realistic French knots with 3D texture and lighting
     */
    static generateUltraRealisticFrenchKnot(geometry, pattern, material, lighting, properties3D) {
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
        }
        catch (error) {
            centralizedErrorHandler.handleError(error, { component: 'UltraRealisticFrenchKnot', function: 'generateUltraRealisticFrenchKnot' }, ErrorSeverity.HIGH, ErrorCategory.EMBROIDERY);
            return [];
        }
    }
    /**
     * Generate base French knot pattern based on pattern type
     */
    static generateBaseFrenchKnotPattern(geometry, pattern, properties3D) {
        const patterns = [];
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
    static generateSingleFrenchKnot(geometry, pattern, properties3D) {
        const patterns = [];
        const position = geometry.position;
        const knotSize = geometry.size * properties3D.knotSize;
        const wraps = Math.max(1, Math.floor(properties3D.knotWraps));
        // Generate knot points in a spiral pattern
        const points = [];
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
    static generateDoubleFrenchKnot(geometry, pattern, properties3D) {
        const patterns = [];
        const position = geometry.position;
        const knotSize = geometry.size * properties3D.knotSize;
        const wraps = Math.max(2, Math.floor(properties3D.knotWraps));
        // Generate two overlapping knots
        for (let knot = 0; knot < 2; knot++) {
            const points = [];
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
    static generateTripleFrenchKnot(geometry, pattern, properties3D) {
        const patterns = [];
        const position = geometry.position;
        const knotSize = geometry.size * properties3D.knotSize;
        const wraps = Math.max(3, Math.floor(properties3D.knotWraps));
        // Generate three overlapping knots
        for (let knot = 0; knot < 3; knot++) {
            const points = [];
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
    static generateBullionFrenchKnot(geometry, pattern, properties3D) {
        const patterns = [];
        const position = geometry.position;
        const knotSize = geometry.size * properties3D.knotSize;
        const wraps = Math.max(5, Math.floor(properties3D.knotWraps * 2));
        // Generate elongated bullion knot
        const points = [];
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
    static generateColonialFrenchKnot(geometry, pattern, properties3D) {
        const patterns = [];
        const position = geometry.position;
        const knotSize = geometry.size * properties3D.knotSize;
        const wraps = Math.max(2, Math.floor(properties3D.knotWraps));
        // Generate colonial knot with distinctive shape
        const points = [];
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
    static generatePaddedFrenchKnot(geometry, pattern, properties3D) {
        const patterns = [];
        const position = geometry.position;
        const knotSize = geometry.size * properties3D.knotSize;
        const wraps = Math.max(3, Math.floor(properties3D.knotWraps));
        // Generate padded knot with extra height
        const points = [];
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
    static generateWrappedFrenchKnot(geometry, pattern, properties3D) {
        const patterns = [];
        const position = geometry.position;
        const knotSize = geometry.size * properties3D.knotSize;
        const wraps = Math.max(4, Math.floor(properties3D.knotWraps * 1.5));
        // Generate wrapped knot with extra wraps
        const points = [];
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
    static generateHeavyFrenchKnot(geometry, pattern, properties3D) {
        const patterns = [];
        const position = geometry.position;
        const knotSize = geometry.size * properties3D.knotSize;
        const wraps = Math.max(6, Math.floor(properties3D.knotWraps * 2));
        // Generate heavy knot with many wraps
        const points = [];
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
    static generateUnderlayStitches(geometry, pattern, properties3D) {
        const underlayStitches = [];
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
    static calculatePointLighting(point, lighting, material, properties3D) {
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
    static calculateKnotHighlighting(point, properties3D) {
        // Calculate knot highlighting based on knot properties
        const knotFactor = properties3D.knotSize * properties3D.knotTightness * properties3D.knotTexture;
        return knotFactor * 0.4; // Subtle effect
    }
    static generateMaterialProperties(material, stitch) {
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
    static calculateThreadColor(material, stitch) {
        // Base color calculation with variegation
        let baseColor = material.color || '#FF69B4'; // Default pink
        // Apply variegation pattern
        if (material.variegationPattern) {
            const variegationFactor = this.calculateVariegationFactor(stitch, material.variegationPattern);
            baseColor = this.applyVariegation(baseColor, variegationFactor);
        }
        return baseColor;
    }
    static calculateVariegationFactor(stitch, pattern) {
        // Calculate variegation based on position and pattern
        const centerX = stitch.points.reduce((sum, p) => sum + p.x, 0) / stitch.points.length;
        const centerY = stitch.points.reduce((sum, p) => sum + p.y, 0) / stitch.points.length;
        // Simple noise-based variegation
        const noise = Math.sin(centerX * 0.1) * Math.cos(centerY * 0.1);
        return (noise + 1) / 2; // Normalize to 0-1
    }
    static applyVariegation(baseColor, factor) {
        // Apply color variation based on factor
        // This is a simplified implementation
        return baseColor;
    }
    static generateNormalMap(material) {
        return `french_knot_normal_${material.threadType}_${material.roughness}`;
    }
    static generateAmbientOcclusion(stitch) {
        return `french_knot_ao_${stitch.points.length}`;
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
        const lightDir = this.normalizeVector(lighting.lightDirection);
        const shadowLength = 0.5; // mm
        return {
            x: -lightDir.x * shadowLength,
            y: -lightDir.y * shadowLength,
            z: -lightDir.z * shadowLength
        };
    }
    static calculateStitchNormal(stitch) {
        if (stitch.points.length < 3)
            return { x: 0, y: 0, z: 1 };
        // Calculate normal from first three points
        const p1 = stitch.points[0];
        const p2 = stitch.points[1];
        const p3 = stitch.points[2];
        const v1 = { x: p2.x - p1.x, y: p2.y - p1.y, z: p2.z - p1.z };
        const v2 = { x: p3.x - p1.x, y: p3.y - p1.y, z: p3.z - p1.z };
        const normal = this.crossProduct(v1, v2);
        return this.normalizeVector(normal);
    }
    static generateUVCoordinates(stitch) {
        return stitch.points.map((_, index) => ({
            u: index / Math.max(1, stitch.points.length - 1),
            v: 0.5
        }));
    }
    static generatePaddingUnderlay(geometry, pattern, properties3D) {
        // Generate padding stitches for raised effect
        const paddingStitches = [];
        // This would generate actual padding stitches
        // For now, return empty array as placeholder
        return paddingStitches;
    }
    static generateContourUnderlay(geometry, pattern, properties3D) {
        // Generate contour underlay stitches
        const contourStitches = [];
        // This would generate actual contour stitches
        // For now, return empty array as placeholder
        return contourStitches;
    }
    // Mathematical helper functions
    static calculateDistance(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dz = (p2.z || 0) - (p1.z || 0);
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    static calculatePointNormal(point) {
        // Simplified normal calculation
        return { x: 0, y: 0, z: 1 };
    }
    static normalizeVector(v) {
        const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        if (length === 0)
            return { x: 0, y: 0, z: 1 };
        return {
            x: v.x / length,
            y: v.y / length,
            z: v.z / length
        };
    }
    static dotProduct(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }
    static crossProduct(v1, v2) {
        return {
            x: v1.y * v2.z - v1.z * v2.y,
            y: v1.z * v2.x - v1.x * v2.z,
            z: v1.x * v2.y - v1.y * v2.x
        };
    }
    static reflectVector(incident, normal) {
        const dot = this.dotProduct(incident, normal);
        return {
            x: incident.x - 2 * dot * normal.x,
            y: incident.y - 2 * dot * normal.y,
            z: incident.z - 2 * dot * normal.z
        };
    }
}
UltraRealisticFrenchKnot.PIXELS_PER_MM = 3.7795275591; // 96 DPI
UltraRealisticFrenchKnot.MAX_KNOT_SIZE = 5.0; // mm
UltraRealisticFrenchKnot.MIN_KNOT_SIZE = 0.5; // mm
export default UltraRealisticFrenchKnot;
