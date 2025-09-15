/**
 * Ultra-Realistic Satin Stitch System
 * Implements hyper-realistic satin stitch rendering with 3D texture, lighting, and material properties
 */
import { performanceMonitor } from '../utils/PerformanceMonitor';
import { centralizedErrorHandler, ErrorCategory, ErrorSeverity } from '../utils/CentralizedErrorHandler';
export class UltraRealisticSatinStitch {
    /**
     * Generate ultra-realistic satin stitches with 3D texture and lighting
     */
    static generateUltraRealisticSatin(geometry, material, lighting, properties3D) {
        try {
            const startTime = performance.now();
            console.log('🎨 Generating ultra-realistic satin stitches...', {
                geometry: geometry,
                material: material,
                properties3D: properties3D
            });
            // Generate base satin pattern
            const basePattern = this.generateBaseSatinPattern(geometry, properties3D);
            // Apply 3D height and padding
            const paddedPattern = this.apply3DPadding(basePattern, properties3D);
            // Generate detailed stitch geometry
            const detailedStitches = this.generateDetailedStitchGeometry(paddedPattern, material, properties3D);
            // Apply material properties and lighting
            const realisticStitches = this.applyMaterialAndLighting(detailedStitches, material, lighting, properties3D);
            // Generate underlay for raised effect
            const underlayStitches = this.generateUnderlayStitches(geometry, properties3D);
            // Combine all stitches
            const finalStitches = [...underlayStitches, ...realisticStitches];
            // Track performance
            const duration = performance.now() - startTime;
            performanceMonitor.trackMetric('ultra_realistic_satin_generation', duration, 'ms', 'embroidery', 'UltraRealisticSatinStitch');
            console.log(`✅ Generated ${finalStitches.length} ultra-realistic satin stitches in ${duration.toFixed(2)}ms`);
            return finalStitches;
        }
        catch (error) {
            centralizedErrorHandler.handleError(error, { component: 'UltraRealisticSatinStitch', function: 'generateUltraRealisticSatin' }, ErrorSeverity.HIGH, ErrorCategory.EMBROIDERY);
            return [];
        }
    }
    /**
     * Generate base satin pattern with proper rail and rung geometry
     */
    static generateBaseSatinPattern(geometry, properties3D) {
        const patterns = [];
        // Ensure we have exactly 2 rails
        if (geometry.rails.length < 2) {
            throw new Error('Satin stitch requires exactly 2 rails');
        }
        const rail1 = geometry.rails[0];
        const rail2 = geometry.rails[1];
        // Calculate stitch density and spacing
        const totalLength = this.calculateDistance(rail1, rail2);
        const stitchCount = Math.max(2, Math.ceil(totalLength * properties3D.stitchDensity));
        const stitchSpacing = totalLength / stitchCount;
        // Generate rungs if not provided
        const rungs = geometry.rungs.length > 0 ? geometry.rungs : this.generateRungs(rail1, rail2, stitchCount);
        // Generate satin stitches between rails
        for (let i = 0; i < rungs.length; i++) {
            const rung = rungs[i];
            const t = i / Math.max(1, rungs.length - 1);
            // Calculate zigzag pattern
            const zigzagOffset = this.calculateZigzagOffset(t, properties3D.zigzagAmplitude, properties3D.zigzagFrequency);
            // Find intersection points with rails
            const intersection1 = this.findRailIntersection(rung, rail1, rail2, 0);
            const intersection2 = this.findRailIntersection(rung, rail1, rail2, 1);
            if (intersection1 && intersection2) {
                // Generate satin line with zigzag pattern
                const satinLine = this.generateSatinLineWithZigzag(intersection1, intersection2, zigzagOffset, properties3D);
                if (satinLine && satinLine.points.length > 1) {
                    patterns.push(satinLine);
                }
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
                return {
                    x: point.x + twistOffset.x,
                    y: point.y + twistOffset.y,
                    z: point.z + twistOffset.z,
                    twist: twistAngle,
                    threadThickness: material.threadThickness
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
                const lighting = this.calculatePointLighting(point, lighting, material);
                return {
                    ...point,
                    lighting: lighting
                };
            });
            // Generate material properties
            const materialProps = this.generateMaterialProperties(material, stitch);
            // Create advanced stitch with all properties
            const advancedStitch = {
                id: `ultra_satin_${index}_${Date.now()}`,
                type: 'satin',
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
                    weave: 'satin',
                    stretch: 0.1,
                    thickness: 0.5,
                    roughness: 0.3,
                    normalMap: 'satin_normal'
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
    static generateUnderlayStitches(geometry, properties3D) {
        const underlayStitches = [];
        // Generate padding underlay
        const paddingStitches = this.generatePaddingUnderlay(geometry, properties3D);
        underlayStitches.push(...paddingStitches);
        // Generate contour underlay
        const contourStitches = this.generateContourUnderlay(geometry, properties3D);
        underlayStitches.push(...contourStitches);
        return underlayStitches;
    }
    // Helper methods
    static generateRungs(rail1, rail2, count) {
        const rungs = [];
        for (let i = 0; i < count; i++) {
            const t = i / Math.max(1, count - 1);
            const rung = {
                x: rail1.x + t * (rail2.x - rail1.x),
                y: rail1.y + t * (rail2.y - rail1.y),
                z: rail1.z + t * (rail2.z - rail1.z)
            };
            rungs.push(rung);
        }
        return rungs;
    }
    static calculateZigzagOffset(t, amplitude, frequency) {
        return Math.sin(t * Math.PI * 2 * frequency) * amplitude;
    }
    static findRailIntersection(rung, rail1, rail2, railIndex) {
        // Simplified intersection calculation
        // In a full implementation, this would use proper line-line intersection
        const targetRail = railIndex === 0 ? rail1 : rail2;
        return {
            x: rung.x,
            y: rung.y,
            z: rung.z
        };
    }
    static generateSatinLineWithZigzag(start, end, zigzagOffset, properties3D) {
        const points = [];
        const segmentCount = Math.max(2, Math.ceil(this.calculateDistance(start, end) * properties3D.stitchDensity));
        for (let i = 0; i <= segmentCount; i++) {
            const t = i / segmentCount;
            const point = {
                x: start.x + t * (end.x - start.x) + zigzagOffset * Math.sin(t * Math.PI),
                y: start.y + t * (end.y - start.y),
                z: start.z + t * (end.z - start.z)
            };
            points.push(point);
        }
        return { points };
    }
    static calculatePointLighting(point, lighting, material) {
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
        // Calculate final lighting
        const totalLighting = ambient + diffuse + specular;
        return {
            ambient,
            diffuse,
            specular,
            total: Math.min(1, totalLighting)
        };
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
        let baseColor = '#FF69B4'; // Default pink
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
        return `satin_normal_${material.threadType}_${material.roughness}`;
    }
    static generateAmbientOcclusion(stitch) {
        return `satin_ao_${stitch.points.length}`;
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
    static generatePaddingUnderlay(geometry, properties3D) {
        // Generate padding stitches for raised effect
        const paddingStitches = [];
        // This would generate actual padding stitches
        // For now, return empty array as placeholder
        return paddingStitches;
    }
    static generateContourUnderlay(geometry, properties3D) {
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
UltraRealisticSatinStitch.PIXELS_PER_MM = 3.7795275591; // 96 DPI
UltraRealisticSatinStitch.MAX_STITCH_LENGTH = 8.0; // mm
UltraRealisticSatinStitch.MIN_STITCH_LENGTH = 0.5; // mm
export default UltraRealisticSatinStitch;
