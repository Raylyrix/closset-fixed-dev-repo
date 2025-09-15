/**
 * Ultra-Realistic Lazy Daisy Stitch System
 * Implements hyper-realistic lazy daisy stitch rendering with 3D texture, lighting, and material properties
 */
import { performanceMonitor } from '../utils/PerformanceMonitor';
import { centralizedErrorHandler, ErrorCategory, ErrorSeverity } from '../utils/CentralizedErrorHandler';
export class UltraRealisticLazyDaisy {
    /**
     * Generate ultra-realistic lazy daisy stitches with 3D texture and lighting
     */
    static generateUltraRealisticLazyDaisy(geometry, pattern, material, lighting, properties3D) {
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
        }
        catch (error) {
            centralizedErrorHandler.handleError(error, { component: 'UltraRealisticLazyDaisy', function: 'generateUltraRealisticLazyDaisy' }, ErrorSeverity.HIGH, ErrorCategory.EMBROIDERY);
            return [];
        }
    }
    /**
     * Generate base lazy daisy pattern based on pattern type
     */
    static generateBaseLazyDaisyPattern(geometry, pattern, properties3D) {
        const patterns = [];
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
    static generateSingleLazyDaisy(geometry, pattern, properties3D) {
        const patterns = [];
        const position = geometry.position;
        const petalSize = geometry.size * properties3D.petalSize;
        const petalCount = Math.max(3, Math.min(12, Math.floor(properties3D.petalCount)));
        const centerX = position.x;
        const centerY = position.y;
        const centerZ = position.z;
        // Generate petals
        for (let i = 0; i < petalCount; i++) {
            const angle = (i / petalCount) * Math.PI * 2;
            const petalPoints = this.generatePetalPoints(centerX, centerY, centerZ, angle, petalSize, properties3D.petalCurve, properties3D.petalThickness);
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
        const centerPoints = this.generateCenterPoints(centerX, centerY, centerZ, properties3D.centerSize * petalSize * 0.3);
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
    static generatePetalPoints(centerX, centerY, centerZ, angle, size, curve, thickness) {
        const points = [];
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
    static generateCenterPoints(centerX, centerY, centerZ, size) {
        const points = [];
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
    static generateDoubleLazyDaisy(geometry, pattern, properties3D) {
        const patterns = [];
        const position = geometry.position;
        const petalSize = geometry.size * properties3D.petalSize;
        const petalCount = Math.max(3, Math.min(12, Math.floor(properties3D.petalCount)));
        const centerX = position.x;
        const centerY = position.y;
        const centerZ = position.z;
        // Generate outer petals
        for (let i = 0; i < petalCount; i++) {
            const angle = (i / petalCount) * Math.PI * 2;
            const petalPoints = this.generatePetalPoints(centerX, centerY, centerZ, angle, petalSize, properties3D.petalCurve, properties3D.petalThickness);
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
            const petalPoints = this.generatePetalPoints(centerX, centerY, centerZ, angle, petalSize * 0.6, properties3D.petalCurve, properties3D.petalThickness);
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
        const centerPoints = this.generateCenterPoints(centerX, centerY, centerZ, properties3D.centerSize * petalSize * 0.2);
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
    static generateTripleLazyDaisy(geometry, pattern, properties3D) {
        const patterns = [];
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
                const petalPoints = this.generatePetalPoints(centerX, centerY, centerZ, angle, layer.size, properties3D.petalCurve, properties3D.petalThickness);
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
        const centerPoints = this.generateCenterPoints(centerX, centerY, centerZ, properties3D.centerSize * petalSize * 0.15);
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
    static generateClusterLazyDaisy(geometry, pattern, properties3D) {
        const patterns = [];
        const position = geometry.position;
        const petalSize = geometry.size * properties3D.petalSize;
        const clusterSize = 3; // 3x3 cluster
        for (let row = 0; row < clusterSize; row++) {
            for (let col = 0; col < clusterSize; col++) {
                const offsetX = (col - 1) * petalSize * 0.8;
                const offsetY = (row - 1) * petalSize * 0.8;
                const clusterGeometry = {
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
    static generateScatteredLazyDaisy(geometry, pattern, properties3D) {
        const patterns = [];
        const position = geometry.position;
        const petalSize = geometry.size * properties3D.petalSize;
        const scatterCount = 5; // Number of scattered flowers
        for (let i = 0; i < scatterCount; i++) {
            const angle = (i / scatterCount) * Math.PI * 2;
            const distance = petalSize * (0.5 + Math.random() * 0.5);
            const offsetX = Math.cos(angle) * distance;
            const offsetY = Math.sin(angle) * distance;
            const scatteredGeometry = {
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
    static generateBorderLazyDaisy(geometry, pattern, properties3D) {
        const patterns = [];
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
            const borderGeometry = {
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
    static generateFillingLazyDaisy(geometry, pattern, properties3D) {
        const patterns = [];
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
                const fillGeometry = {
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
    static generateDecorativeLazyDaisy(geometry, pattern, properties3D) {
        const patterns = [];
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
            const petalPoints = this.generatePetalPoints(centerX, centerY, centerZ, angle, decorativeSize, decorativeCurve, properties3D.petalThickness);
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
        const centerPoints = this.generateCenterPoints(centerX, centerY, centerZ, properties3D.centerSize * petalSize * 0.4);
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
            normal: `lazy_daisy_normal_${material.threadType}`,
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
UltraRealisticLazyDaisy.PIXELS_PER_MM = 3.7795275591; // 96 DPI
UltraRealisticLazyDaisy.MAX_PETAL_SIZE = 8.0; // mm
UltraRealisticLazyDaisy.MIN_PETAL_SIZE = 1.0; // mm
export default UltraRealisticLazyDaisy;
