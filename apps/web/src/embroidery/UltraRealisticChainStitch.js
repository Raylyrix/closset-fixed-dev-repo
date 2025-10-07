/**
 * Ultra-Realistic Chain Stitch System
 * Implements hyper-realistic chain stitch rendering with 3D texture, lighting, and material properties
 */
import { performanceMonitor } from '../utils/PerformanceMonitor';
import { centralizedErrorHandler, ErrorCategory, ErrorSeverity } from '../utils/CentralizedErrorHandler';
export class UltraRealisticChainStitch {
    /**
     * Generate ultra-realistic chain stitches with 3D texture and lighting
     */
    static generateUltraRealisticChain(geometry, pattern, material, lighting, properties3D) {
        try {
            const startTime = performance.now();
            console.log('🔗 Generating ultra-realistic chain stitches...', {
                geometry: geometry,
                pattern: pattern,
                material: material,
                properties3D: properties3D
            });
            // Generate base chain pattern
            const basePattern = this.generateBaseChainPattern(geometry, pattern, properties3D);
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
            performanceMonitor.trackMetric('ultra_realistic_chain_generation', duration, 'ms', 'embroidery', 'UltraRealisticChainStitch');
            console.log(`✅ Generated ${finalStitches.length} ultra-realistic chain stitches in ${duration.toFixed(2)}ms`);
            return finalStitches;
        }
        catch (error) {
            centralizedErrorHandler.handleError(error, { component: 'UltraRealisticChainStitch', function: 'generateUltraRealisticChain' }, ErrorSeverity.HIGH, ErrorCategory.EMBROIDERY);
            return [];
        }
    }
    /**
     * Generate base chain pattern based on pattern type
     */
    static generateBaseChainPattern(geometry, pattern, properties3D) {
        const patterns = [];
        switch (pattern.type) {
            case 'single':
                patterns.push(...this.generateSingleChain(geometry, pattern, properties3D));
                break;
            case 'double':
                patterns.push(...this.generateDoubleChain(geometry, pattern, properties3D));
                break;
            case 'triple':
                patterns.push(...this.generateTripleChain(geometry, pattern, properties3D));
                break;
            case 'lazy_daisy':
                patterns.push(...this.generateLazyDaisy(geometry, pattern, properties3D));
                break;
            case 'detached':
                patterns.push(...this.generateDetachedChain(geometry, pattern, properties3D));
                break;
            case 'twisted':
                patterns.push(...this.generateTwistedChain(geometry, pattern, properties3D));
                break;
            case 'cable':
                patterns.push(...this.generateCableChain(geometry, pattern, properties3D));
                break;
            case 'heavy':
                patterns.push(...this.generateHeavyChain(geometry, pattern, properties3D));
                break;
            default:
                patterns.push(...this.generateSingleChain(geometry, pattern, properties3D));
        }
        return patterns;
    }
    /**
     * Generate single chain stitch pattern
     */
    static generateSingleChain(geometry, pattern, properties3D) {
        const patterns = [];
        const path = geometry.path;
        const spacing = 1.0 / pattern.density; // mm between stitches
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
                // Chain stitch has a loop
                const loopSize = properties3D.loopSize * 0.3; // mm
                const angle = Math.atan2(end.y - start.y, end.x - start.x);
                const loopX = x + Math.cos(angle + Math.PI / 2) * loopSize;
                const loopY = y + Math.sin(angle + Math.PI / 2) * loopSize;
                patterns.push({
                    points: [
                        { x, y, z },
                        { x: loopX, y: loopY, z },
                        { x, y, z }
                    ],
                    type: 'single_chain',
                    index: i * stitchCount + j
                });
            }
        }
        return patterns;
    }
    /**
     * Generate double chain stitch pattern
     */
    static generateDoubleChain(geometry, pattern, properties3D) {
        const patterns = [];
        const path = geometry.path;
        const spacing = 1.0 / pattern.density; // mm between stitches
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
                // Double chain has two loops
                const loopSize = properties3D.loopSize * 0.3; // mm
                const angle = Math.atan2(end.y - start.y, end.x - start.x);
                const loop1X = x + Math.cos(angle + Math.PI / 2) * loopSize;
                const loop1Y = y + Math.sin(angle + Math.PI / 2) * loopSize;
                const loop2X = x + Math.cos(angle - Math.PI / 2) * loopSize;
                const loop2Y = y + Math.sin(angle - Math.PI / 2) * loopSize;
                patterns.push({
                    points: [
                        { x, y, z },
                        { x: loop1X, y: loop1Y, z },
                        { x, y, z },
                        { x: loop2X, y: loop2Y, z },
                        { x, y, z }
                    ],
                    type: 'double_chain',
                    index: i * stitchCount + j
                });
            }
        }
        return patterns;
    }
    /**
     * Generate triple chain stitch pattern
     */
    static generateTripleChain(geometry, pattern, properties3D) {
        const patterns = [];
        const path = geometry.path;
        const spacing = 1.0 / pattern.density; // mm between stitches
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
                // Triple chain has three loops
                const loopSize = properties3D.loopSize * 0.3; // mm
                const angle = Math.atan2(end.y - start.y, end.x - start.x);
                const loop1X = x + Math.cos(angle + Math.PI / 2) * loopSize;
                const loop1Y = y + Math.sin(angle + Math.PI / 2) * loopSize;
                const loop2X = x + Math.cos(angle) * loopSize;
                const loop2Y = y + Math.sin(angle) * loopSize;
                const loop3X = x + Math.cos(angle - Math.PI / 2) * loopSize;
                const loop3Y = y + Math.sin(angle - Math.PI / 2) * loopSize;
                patterns.push({
                    points: [
                        { x, y, z },
                        { x: loop1X, y: loop1Y, z },
                        { x, y, z },
                        { x: loop2X, y: loop2Y, z },
                        { x, y, z },
                        { x: loop3X, y: loop3Y, z },
                        { x, y, z }
                    ],
                    type: 'triple_chain',
                    index: i * stitchCount + j
                });
            }
        }
        return patterns;
    }
    /**
     * Generate lazy daisy stitch pattern
     */
    static generateLazyDaisy(geometry, pattern, properties3D) {
        const patterns = [];
        const path = geometry.path;
        const spacing = 1.0 / pattern.density; // mm between stitches
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
                // Lazy daisy has a petal shape
                const petalSize = properties3D.loopSize * 0.4; // mm
                const angle = Math.atan2(end.y - start.y, end.x - start.x);
                const petalX = x + Math.cos(angle + Math.PI / 3) * petalSize;
                const petalY = y + Math.sin(angle + Math.PI / 3) * petalSize;
                patterns.push({
                    points: [
                        { x, y, z },
                        { x: petalX, y: petalY, z },
                        { x, y, z }
                    ],
                    type: 'lazy_daisy',
                    index: i * stitchCount + j
                });
            }
        }
        return patterns;
    }
    /**
     * Generate detached chain stitch pattern
     */
    static generateDetachedChain(geometry, pattern, properties3D) {
        const patterns = [];
        const path = geometry.path;
        const spacing = 1.0 / pattern.density; // mm between stitches
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
                // Detached chain has a loop that doesn't connect to the next stitch
                const loopSize = properties3D.loopSize * 0.3; // mm
                const angle = Math.atan2(end.y - start.y, end.x - start.x);
                const loopX = x + Math.cos(angle + Math.PI / 2) * loopSize;
                const loopY = y + Math.sin(angle + Math.PI / 2) * loopSize;
                patterns.push({
                    points: [
                        { x, y, z },
                        { x: loopX, y: loopY, z },
                        { x, y, z }
                    ],
                    type: 'detached_chain',
                    index: i * stitchCount + j,
                    detached: true
                });
            }
        }
        return patterns;
    }
    /**
     * Generate twisted chain stitch pattern
     */
    static generateTwistedChain(geometry, pattern, properties3D) {
        const patterns = [];
        const path = geometry.path;
        const spacing = 1.0 / pattern.density; // mm between stitches
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
                // Twisted chain has a spiral loop
                const loopSize = properties3D.loopSize * 0.3; // mm
                const angle = Math.atan2(end.y - start.y, end.x - start.x);
                const twistAngle = angle + (j * Math.PI / 4); // Spiral effect
                const loopX = x + Math.cos(twistAngle) * loopSize;
                const loopY = y + Math.sin(twistAngle) * loopSize;
                patterns.push({
                    points: [
                        { x, y, z },
                        { x: loopX, y: loopY, z },
                        { x, y, z }
                    ],
                    type: 'twisted_chain',
                    index: i * stitchCount + j
                });
            }
        }
        return patterns;
    }
    /**
     * Generate cable chain stitch pattern
     */
    static generateCableChain(geometry, pattern, properties3D) {
        const patterns = [];
        const path = geometry.path;
        const spacing = 1.0 / pattern.density; // mm between stitches
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
                // Cable chain has interlocking loops
                const loopSize = properties3D.loopSize * 0.3; // mm
                const angle = Math.atan2(end.y - start.y, end.x - start.x);
                const loop1X = x + Math.cos(angle + Math.PI / 2) * loopSize;
                const loop1Y = y + Math.sin(angle + Math.PI / 2) * loopSize;
                const loop2X = x + Math.cos(angle - Math.PI / 2) * loopSize;
                const loop2Y = y + Math.sin(angle - Math.PI / 2) * loopSize;
                patterns.push({
                    points: [
                        { x, y, z },
                        { x: loop1X, y: loop1Y, z },
                        { x, y, z },
                        { x: loop2X, y: loop2Y, z },
                        { x, y, z }
                    ],
                    type: 'cable_chain',
                    index: i * stitchCount + j
                });
            }
        }
        return patterns;
    }
    /**
     * Generate heavy chain stitch pattern
     */
    static generateHeavyChain(geometry, pattern, properties3D) {
        const patterns = [];
        const path = geometry.path;
        const spacing = 1.0 / pattern.density; // mm between stitches
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
                // Heavy chain has thick, dense loops
                const loopSize = properties3D.loopSize * 0.5; // mm
                const angle = Math.atan2(end.y - start.y, end.x - start.x);
                const loopX = x + Math.cos(angle + Math.PI / 2) * loopSize;
                const loopY = y + Math.sin(angle + Math.PI / 2) * loopSize;
                patterns.push({
                    points: [
                        { x, y, z },
                        { x: loopX, y: loopY, z },
                        { x, y, z }
                    ],
                    type: 'heavy_chain',
                    index: i * stitchCount + j,
                    thickness: 2.0 // Thicker than normal
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
                id: `ultra_chain_${index}_${Date.now()}`,
                type: 'chain',
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
        // Calculate loop highlighting
        let loopHighlighting = 0;
        if (lighting.loopHighlighting) {
            loopHighlighting = this.calculateLoopHighlighting(point, properties3D);
        }
        // Calculate final lighting
        const totalLighting = ambient + diffuse + specular + rimLighting + loopHighlighting;
        return {
            ambient,
            diffuse,
            specular,
            rimLighting,
            loopHighlighting,
            total: Math.min(1, totalLighting)
        };
    }
    static calculateLoopHighlighting(point, properties3D) {
        // Calculate loop highlighting based on loop size and tightness
        const loopFactor = properties3D.loopSize * properties3D.loopTightness;
        return loopFactor * 0.3; // Subtle effect
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
        return `chain_normal_${material.threadType}_${material.roughness}`;
    }
    static generateAmbientOcclusion(stitch) {
        return `chain_ao_${stitch.points.length}`;
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
UltraRealisticChainStitch.PIXELS_PER_MM = 3.7795275591; // 96 DPI
UltraRealisticChainStitch.MAX_STITCH_LENGTH = 8.0; // mm
UltraRealisticChainStitch.MIN_STITCH_LENGTH = 0.5; // mm
export default UltraRealisticChainStitch;
