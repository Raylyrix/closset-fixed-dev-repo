/**
 * Ultra-Realistic Fill Stitch System
 * Implements hyper-realistic fill stitch rendering with 3D texture, lighting, and material properties
 */
import { performanceMonitor } from '../utils/PerformanceMonitor';
import { centralizedErrorHandler, ErrorCategory, ErrorSeverity } from '../utils/CentralizedErrorHandler';
export class UltraRealisticFillStitch {
    /**
     * Generate ultra-realistic fill stitches with 3D texture and lighting
     */
    static generateUltraRealisticFill(geometry, pattern, material, lighting, properties3D) {
        try {
            const startTime = performance.now();
            console.log('🎨 Generating ultra-realistic fill stitches...', {
                geometry: geometry,
                pattern: pattern,
                material: material,
                properties3D: properties3D
            });
            // Generate base fill pattern
            const basePattern = this.generateBaseFillPattern(geometry, pattern, properties3D);
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
            performanceMonitor.trackMetric('ultra_realistic_fill_generation', duration, 'ms', 'embroidery', 'UltraRealisticFillStitch');
            console.log(`✅ Generated ${finalStitches.length} ultra-realistic fill stitches in ${duration.toFixed(2)}ms`);
            return finalStitches;
        }
        catch (error) {
            centralizedErrorHandler.handleError(error, { component: 'UltraRealisticFillStitch', function: 'generateUltraRealisticFill' }, ErrorSeverity.HIGH, ErrorCategory.EMBROIDERY);
            return [];
        }
    }
    /**
     * Generate base fill pattern based on pattern type
     */
    static generateBaseFillPattern(geometry, pattern, properties3D) {
        const patterns = [];
        switch (pattern.type) {
            case 'parallel':
                patterns.push(...this.generateParallelFill(geometry, pattern, properties3D));
                break;
            case 'zigzag':
                patterns.push(...this.generateZigzagFill(geometry, pattern, properties3D));
                break;
            case 'spiral':
                patterns.push(...this.generateSpiralFill(geometry, pattern, properties3D));
                break;
            case 'radial':
                patterns.push(...this.generateRadialFill(geometry, pattern, properties3D));
                break;
            case 'meander':
                patterns.push(...this.generateMeanderFill(geometry, pattern, properties3D));
                break;
            case 'contour':
                patterns.push(...this.generateContourFill(geometry, pattern, properties3D));
                break;
            default:
                patterns.push(...this.generateParallelFill(geometry, pattern, properties3D));
        }
        return patterns;
    }
    /**
     * Generate parallel fill pattern
     */
    static generateParallelFill(geometry, pattern, properties3D) {
        const patterns = [];
        const angle = pattern.angle * Math.PI / 180;
        const spacing = pattern.spacing;
        const bounds = geometry.bounds;
        // Calculate line count
        const width = bounds.maxX - bounds.minX;
        const height = bounds.maxY - bounds.minY;
        const diagonal = Math.sqrt(width * width + height * height);
        const lineCount = Math.ceil(diagonal / spacing);
        // Generate parallel lines
        for (let i = 0; i < lineCount; i++) {
            const offset = i * spacing;
            const line = this.generateLineAtOffset(bounds, offset, angle, pattern, properties3D);
            if (line && line.points.length > 1) {
                patterns.push(line);
            }
        }
        return patterns;
    }
    /**
     * Generate zigzag fill pattern
     */
    static generateZigzagFill(geometry, pattern, properties3D) {
        const patterns = [];
        const bounds = geometry.bounds;
        const spacing = pattern.spacing;
        const zigzagAmplitude = spacing * 0.3;
        // Generate zigzag lines
        let y = bounds.minY;
        while (y < bounds.maxY) {
            const line = this.generateZigzagLine(bounds, y, spacing, zigzagAmplitude, pattern, properties3D);
            if (line && line.points.length > 1) {
                patterns.push(line);
            }
            y += spacing;
        }
        return patterns;
    }
    /**
     * Generate spiral fill pattern
     */
    static generateSpiralFill(geometry, pattern, properties3D) {
        const patterns = [];
        const bounds = geometry.bounds;
        const centerX = (bounds.minX + bounds.maxX) / 2;
        const centerY = (bounds.minY + bounds.maxY) / 2;
        const maxRadius = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) / 2;
        const spacing = pattern.spacing;
        // Generate spiral
        const spiral = this.generateSpiral(centerX, centerY, maxRadius, spacing, pattern, properties3D);
        if (spiral && spiral.points.length > 1) {
            patterns.push(spiral);
        }
        return patterns;
    }
    /**
     * Generate radial fill pattern
     */
    static generateRadialFill(geometry, pattern, properties3D) {
        const patterns = [];
        const bounds = geometry.bounds;
        const centerX = (bounds.minX + bounds.maxX) / 2;
        const centerY = (bounds.minY + bounds.maxY) / 2;
        const maxRadius = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) / 2;
        const angleStep = 360 / pattern.density;
        // Generate radial lines
        for (let angle = 0; angle < 360; angle += angleStep) {
            const line = this.generateRadialLine(centerX, centerY, maxRadius, angle, pattern, properties3D);
            if (line && line.points.length > 1) {
                patterns.push(line);
            }
        }
        return patterns;
    }
    /**
     * Generate meander fill pattern
     */
    static generateMeanderFill(geometry, pattern, properties3D) {
        const patterns = [];
        const bounds = geometry.bounds;
        const spacing = pattern.spacing;
        // Generate meander lines (organic, flowing pattern)
        let y = bounds.minY;
        while (y < bounds.maxY) {
            const line = this.generateMeanderLine(bounds, y, spacing, pattern, properties3D);
            if (line && line.points.length > 1) {
                patterns.push(line);
            }
            y += spacing;
        }
        return patterns;
    }
    /**
     * Generate contour fill pattern
     */
    static generateContourFill(geometry, pattern, properties3D) {
        const patterns = [];
        const bounds = geometry.bounds;
        const spacing = pattern.spacing;
        // Generate contour lines by offsetting the shape boundary
        let offset = spacing;
        const maxOffset = Math.min(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) / 4;
        while (offset < maxOffset) {
            const contour = this.generateContourLine(geometry.shape, offset, pattern, properties3D);
            if (contour && contour.points.length > 1) {
                patterns.push(contour);
            }
            offset += spacing;
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
                id: `ultra_fill_${index}_${Date.now()}`,
                type: 'fill',
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
    // Helper methods for pattern generation
    static generateLineAtOffset(bounds, offset, angle, pattern, properties3D) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const centerX = (bounds.minX + bounds.maxX) / 2;
        const centerY = (bounds.minY + bounds.maxY) / 2;
        const length = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) * 1.5;
        const startX = centerX - cos * length / 2 + sin * offset;
        const startY = centerY - sin * length / 2 - cos * offset;
        const endX = centerX + cos * length / 2 + sin * offset;
        const endY = centerY + sin * length / 2 - cos * offset;
        // Generate points along the line
        const points = [];
        const segmentCount = Math.max(2, Math.ceil(length * properties3D.stitchDensity));
        for (let i = 0; i <= segmentCount; i++) {
            const t = i / segmentCount;
            const x = startX + t * (endX - startX);
            const y = startY + t * (endY - startY);
            points.push({ x, y, z: 0 });
        }
        return { points };
    }
    static generateZigzagLine(bounds, y, spacing, amplitude, pattern, properties3D) {
        const points = [];
        const width = bounds.maxX - bounds.minX;
        const segments = Math.ceil(width / spacing);
        for (let i = 0; i <= segments; i++) {
            const x = bounds.minX + (i / segments) * width;
            const zigzagOffset = Math.sin((i / segments) * Math.PI * 4) * amplitude;
            points.push({ x, y: y + zigzagOffset, z: 0 });
        }
        return { points };
    }
    static generateSpiral(centerX, centerY, maxRadius, spacing, pattern, properties3D) {
        const points = [];
        const turns = 8;
        const pointsPerTurn = Math.ceil(maxRadius / spacing);
        for (let i = 0; i < pointsPerTurn * turns; i++) {
            const t = i / (pointsPerTurn * turns);
            const angle = t * Math.PI * 2 * turns;
            const radius = t * maxRadius;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            points.push({ x, y, z: 0 });
        }
        return { points };
    }
    static generateRadialLine(centerX, centerY, maxRadius, angle, pattern, properties3D) {
        const points = [];
        const angleRad = angle * Math.PI / 180;
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);
        const segments = Math.ceil(maxRadius * properties3D.stitchDensity);
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const radius = t * maxRadius;
            const x = centerX + cos * radius;
            const y = centerY + sin * radius;
            points.push({ x, y, z: 0 });
        }
        return { points };
    }
    static generateMeanderLine(bounds, y, spacing, pattern, properties3D) {
        const points = [];
        const width = bounds.maxX - bounds.minX;
        const segments = Math.ceil(width / spacing);
        for (let i = 0; i <= segments; i++) {
            const x = bounds.minX + (i / segments) * width;
            const meanderOffset = Math.sin((i / segments) * Math.PI * 2) * spacing * 0.3;
            points.push({ x, y: y + meanderOffset, z: 0 });
        }
        return { points };
    }
    static generateContourLine(shape, offset, pattern, properties3D) {
        // Simplified contour generation
        // In a full implementation, this would use proper polygon offset algorithms
        const points = [];
        for (let i = 0; i < shape.length; i++) {
            const point = shape[i];
            const nextPoint = shape[(i + 1) % shape.length];
            // Calculate offset point
            const dx = nextPoint.x - point.x;
            const dy = nextPoint.y - point.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            if (length > 0) {
                const nx = -dy / length;
                const ny = dx / length;
                const offsetPoint = {
                    x: point.x + nx * offset,
                    y: point.y + ny * offset,
                    z: point.z
                };
                points.push(offsetPoint);
            }
        }
        return { points };
    }
    // Material and lighting helper methods
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
        // Calculate rim lighting
        let rimLighting = 0;
        if (lighting.rimLighting) {
            const rimFactor = 1 - Math.abs(this.dotProduct(normal, viewDir));
            rimLighting = rimFactor * lighting.rimIntensity;
        }
        // Calculate final lighting
        const totalLighting = ambient + diffuse + specular + rimLighting;
        return {
            ambient,
            diffuse,
            specular,
            rimLighting,
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
        return `fill_normal_${material.threadType}_${material.roughness}`;
    }
    static generateAmbientOcclusion(stitch) {
        return `fill_ao_${stitch.points.length}`;
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
UltraRealisticFillStitch.PIXELS_PER_MM = 3.7795275591; // 96 DPI
UltraRealisticFillStitch.MAX_STITCH_LENGTH = 8.0; // mm
UltraRealisticFillStitch.MIN_STITCH_LENGTH = 0.5; // mm
export default UltraRealisticFillStitch;
