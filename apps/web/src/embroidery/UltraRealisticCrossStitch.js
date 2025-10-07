/**
 * Ultra-Realistic Cross-Stitch System
 * Implements hyper-realistic cross-stitch rendering with proper X patterns, 3D texture, and lighting
 */
import { performanceMonitor } from '../utils/PerformanceMonitor';
import { centralizedErrorHandler, ErrorCategory, ErrorSeverity } from '../utils/CentralizedErrorHandler';
export class UltraRealisticCrossStitch {
    /**
     * Generate ultra-realistic cross-stitches with proper X patterns and 3D texture
     */
    static generateUltraRealisticCrossStitch(geometry, pattern, material, lighting, properties3D) {
        try {
            const startTime = performance.now();
            console.log('❌ Generating ultra-realistic cross-stitches...', {
                geometry: geometry,
                pattern: pattern,
                material: material,
                properties3D: properties3D
            });
            // Generate base cross-stitch pattern
            const basePattern = this.generateBaseCrossStitchPattern(geometry, pattern, properties3D);
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
            performanceMonitor.trackMetric('ultra_realistic_cross_stitch_generation', duration, 'ms', 'embroidery', 'UltraRealisticCrossStitch');
            console.log(`✅ Generated ${finalStitches.length} ultra-realistic cross-stitches in ${duration.toFixed(2)}ms`);
            return finalStitches;
        }
        catch (error) {
            centralizedErrorHandler.handleError(error, { component: 'UltraRealisticCrossStitch', function: 'generateUltraRealisticCrossStitch' }, ErrorSeverity.HIGH, ErrorCategory.EMBROIDERY);
            return [];
        }
    }
    /**
     * Generate base cross-stitch pattern with proper X formation
     */
    static generateBaseCrossStitchPattern(geometry, pattern, properties3D) {
        const patterns = [];
        const cellSize = geometry.cellSize;
        // Generate cross-stitches for each grid cell
        for (let row = 0; row < geometry.grid.length; row++) {
            for (let col = 0; col < geometry.grid[row].length; col++) {
                const cell = geometry.grid[row][col];
                // Generate cross-stitch for this cell
                const crossStitch = this.generateCrossStitchForCell(cell, cellSize, pattern, properties3D, row, col);
                if (crossStitch && crossStitch.points.length > 0) {
                    patterns.push(crossStitch);
                }
            }
        }
        return patterns;
    }
    /**
     * Generate cross-stitch for a single cell
     */
    static generateCrossStitchForCell(cell, cellSize, pattern, properties3D, row, col) {
        const halfSize = cellSize / 2;
        const quarterSize = cellSize / 4;
        // Calculate cell corners
        const topLeft = { x: cell.x - halfSize, y: cell.y - halfSize, z: cell.z };
        const topRight = { x: cell.x + halfSize, y: cell.y - halfSize, z: cell.z };
        const bottomLeft = { x: cell.x - halfSize, y: cell.y + halfSize, z: cell.z };
        const bottomRight = { x: cell.x + halfSize, y: cell.y + halfSize, z: cell.z };
        // Generate cross-stitch based on pattern type
        switch (pattern.type) {
            case 'full':
                return this.generateFullCrossStitch(topLeft, topRight, bottomLeft, bottomRight, pattern, properties3D);
            case 'half':
                return this.generateHalfCrossStitch(topLeft, topRight, bottomLeft, bottomRight, pattern, properties3D);
            case 'quarter':
                return this.generateQuarterCrossStitch(topLeft, topRight, bottomLeft, bottomRight, pattern, properties3D);
            case 'three-quarter':
                return this.generateThreeQuarterCrossStitch(topLeft, topRight, bottomLeft, bottomRight, pattern, properties3D);
            case 'backstitch':
                return this.generateBackstitch(topLeft, topRight, bottomLeft, bottomRight, pattern, properties3D);
            case 'french-knot':
                return this.generateFrenchKnot(cell, cellSize, pattern, properties3D);
            default:
                return this.generateFullCrossStitch(topLeft, topRight, bottomLeft, bottomRight, pattern, properties3D);
        }
    }
    /**
     * Generate full cross-stitch (complete X)
     */
    static generateFullCrossStitch(topLeft, topRight, bottomLeft, bottomRight, pattern, properties3D) {
        const points = [];
        // First leg: top-left to bottom-right
        const firstLeg = this.generateStitchLeg(topLeft, bottomRight, pattern, properties3D);
        points.push(...firstLeg);
        // Second leg: top-right to bottom-left
        const secondLeg = this.generateStitchLeg(topRight, bottomLeft, pattern, properties3D);
        points.push(...secondLeg);
        return {
            points,
            type: 'full',
            cell: { topLeft, topRight, bottomLeft, bottomRight }
        };
    }
    /**
     * Generate half cross-stitch (single diagonal)
     */
    static generateHalfCrossStitch(topLeft, topRight, bottomLeft, bottomRight, pattern, properties3D) {
        const points = [];
        // Single diagonal based on direction
        if (pattern.direction === 'diagonal' || Math.random() > 0.5) {
            // Top-left to bottom-right
            const leg = this.generateStitchLeg(topLeft, bottomRight, pattern, properties3D);
            points.push(...leg);
        }
        else {
            // Top-right to bottom-left
            const leg = this.generateStitchLeg(topRight, bottomLeft, pattern, properties3D);
            points.push(...leg);
        }
        return {
            points,
            type: 'half',
            cell: { topLeft, topRight, bottomLeft, bottomRight }
        };
    }
    /**
     * Generate quarter cross-stitch (single corner)
     */
    static generateQuarterCrossStitch(topLeft, topRight, bottomLeft, bottomRight, pattern, properties3D) {
        const points = [];
        // Single corner stitch
        const center = {
            x: (topLeft.x + topRight.x + bottomLeft.x + bottomRight.x) / 4,
            y: (topLeft.y + topRight.y + bottomLeft.y + bottomRight.y) / 4,
            z: (topLeft.z + topRight.z + bottomLeft.z + bottomRight.z) / 4
        };
        // Choose random corner
        const corners = [topLeft, topRight, bottomLeft, bottomRight];
        const corner = corners[Math.floor(Math.random() * corners.length)];
        const leg = this.generateStitchLeg(center, corner, pattern, properties3D);
        points.push(...leg);
        return {
            points,
            type: 'quarter',
            cell: { topLeft, topRight, bottomLeft, bottomRight }
        };
    }
    /**
     * Generate three-quarter cross-stitch (3/4 of X)
     */
    static generateThreeQuarterCrossStitch(topLeft, topRight, bottomLeft, bottomRight, pattern, properties3D) {
        const points = [];
        // Generate 3 out of 4 legs
        const legs = [
            { start: topLeft, end: bottomRight },
            { start: topRight, end: bottomLeft },
            { start: topLeft, end: topRight },
            { start: bottomLeft, end: bottomRight }
        ];
        // Randomly select 3 legs
        const selectedLegs = legs.sort(() => Math.random() - 0.5).slice(0, 3);
        for (const leg of selectedLegs) {
            const legPoints = this.generateStitchLeg(leg.start, leg.end, pattern, properties3D);
            points.push(...legPoints);
        }
        return {
            points,
            type: 'three-quarter',
            cell: { topLeft, topRight, bottomLeft, bottomRight }
        };
    }
    /**
     * Generate backstitch (outline)
     */
    static generateBackstitch(topLeft, topRight, bottomLeft, bottomRight, pattern, properties3D) {
        const points = [];
        // Generate outline around the cell
        const outline = [topLeft, topRight, bottomRight, bottomLeft, topLeft];
        for (let i = 0; i < outline.length - 1; i++) {
            const leg = this.generateStitchLeg(outline[i], outline[i + 1], pattern, properties3D);
            points.push(...leg);
        }
        return {
            points,
            type: 'backstitch',
            cell: { topLeft, topRight, bottomLeft, bottomRight }
        };
    }
    /**
     * Generate French knot
     */
    static generateFrenchKnot(cell, cellSize, pattern, properties3D) {
        const points = [];
        const knotSize = cellSize * 0.3;
        const turns = 3 + Math.floor(Math.random() * 3); // 3-5 turns
        // Generate spiral for French knot
        for (let i = 0; i < turns * 8; i++) {
            const angle = (i / (turns * 8)) * Math.PI * 2 * turns;
            const radius = (i / (turns * 8)) * knotSize;
            const x = cell.x + Math.cos(angle) * radius;
            const y = cell.y + Math.sin(angle) * radius;
            const z = cell.z + (i / (turns * 8)) * properties3D.height;
            points.push({ x, y, z });
        }
        return {
            points,
            type: 'french-knot',
            cell: cell
        };
    }
    /**
     * Generate a single stitch leg
     */
    static generateStitchLeg(start, end, pattern, properties3D) {
        const points = [];
        const distance = this.calculateDistance(start, end);
        const segmentCount = Math.max(2, Math.ceil(distance * properties3D.stitchDensity));
        for (let i = 0; i <= segmentCount; i++) {
            const t = i / segmentCount;
            const x = start.x + t * (end.x - start.x);
            const y = start.y + t * (end.y - start.y);
            const z = start.z + t * (end.z - start.z);
            // Add slight variation for realism
            const variation = (Math.random() - 0.5) * properties3D.stitchVariation * 0.1;
            const angle = Math.atan2(end.y - start.y, end.x - start.x);
            const variationX = variation * Math.cos(angle + Math.PI / 2);
            const variationY = variation * Math.sin(angle + Math.PI / 2);
            points.push({
                x: x + variationX,
                y: y + variationY,
                z: z + variation * 0.1
            });
        }
        return points;
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
                id: `ultra_cross_stitch_${index}_${Date.now()}`,
                type: 'cross-stitch',
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
                    weave: this.mapFabricWeave(properties3D.fabricWeave),
                    stretch: 0.1,
                    thickness: 0.5,
                    roughness: 0.3,
                    normalMap: `${properties3D.fabricWeave}_normal`
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
        // Calculate fabric shading
        let fabricShading = 0;
        if (lighting.fabricShading) {
            fabricShading = this.calculateFabricShading(point, properties3D);
        }
        // Calculate final lighting
        const totalLighting = ambient + diffuse + specular + rimLighting + fabricShading;
        return {
            ambient,
            diffuse,
            specular,
            rimLighting,
            fabricShading,
            total: Math.min(1, totalLighting)
        };
    }
    static calculateFabricShading(point, properties3D) {
        // Calculate shading based on fabric weave
        const weavePattern = this.getFabricWeavePattern(properties3D.fabricWeave, properties3D.fabricCount);
        const x = point.x;
        const y = point.y;
        // Sample weave pattern
        const weaveX = (x * weavePattern.frequency) % 1;
        const weaveY = (y * weavePattern.frequency) % 1;
        const weaveValue = Math.sin(weaveX * Math.PI * 2) * Math.cos(weaveY * Math.PI * 2);
        return weaveValue * 0.1; // Subtle effect
    }
    static getFabricWeavePattern(weave, count) {
        switch (weave) {
            case 'aida':
                return { frequency: count / 10, amplitude: 0.1 };
            case 'evenweave':
                return { frequency: count / 8, amplitude: 0.05 };
            case 'linen':
                return { frequency: count / 6, amplitude: 0.15 };
            case 'canvas':
                return { frequency: count / 12, amplitude: 0.08 };
            default:
                return { frequency: 1, amplitude: 0.1 };
        }
    }
    // Map cross-stitch fabric weave names to allowed fabric weave literal union
    static mapFabricWeave(weave) {
        switch (weave) {
            case 'aida':
                return 'basket';
            case 'evenweave':
                return 'plain';
            case 'linen':
                return 'plain';
            case 'canvas':
                return 'basket';
            default:
                return 'plain';
        }
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
        return `cross_stitch_normal_${material.threadType}_${material.roughness}`;
    }
    static generateAmbientOcclusion(stitch) {
        return `cross_stitch_ao_${stitch.points.length}`;
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
UltraRealisticCrossStitch.PIXELS_PER_MM = 3.7795275591; // 96 DPI
UltraRealisticCrossStitch.MAX_STITCH_LENGTH = 8.0; // mm
UltraRealisticCrossStitch.MIN_STITCH_LENGTH = 0.5; // mm
export default UltraRealisticCrossStitch;
