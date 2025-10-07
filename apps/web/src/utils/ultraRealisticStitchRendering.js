// Ultra-Realistic 4K Stitch Rendering System
// Advanced algorithms for photorealistic embroidery simulation
export class UltraRealisticStitchRenderer {
    constructor() {
        this.threadMaterials = new Map();
        this.noiseCache = new Map();
        this.gradientCache = new Map();
        this.performanceMetrics = new Map();
        this.initializeThreadMaterials();
    }
    static getInstance() {
        if (!UltraRealisticStitchRenderer.instance) {
            UltraRealisticStitchRenderer.instance = new UltraRealisticStitchRenderer();
        }
        return UltraRealisticStitchRenderer.instance;
    }
    initializeThreadMaterials() {
        const materials = [
            {
                name: 'cotton',
                baseColor: { r: 0.9, g: 0.9, b: 0.85 },
                roughness: 0.8,
                metallic: 0.0,
                sheen: 0.1,
                transmission: 0.0,
                thickness: 1.0,
                weight: 1.0,
                twist: 0.3,
                fuzziness: 0.4
            },
            {
                name: 'silk',
                baseColor: { r: 0.95, g: 0.95, b: 0.9 },
                roughness: 0.1,
                metallic: 0.0,
                sheen: 0.9,
                transmission: 0.1,
                thickness: 0.8,
                weight: 0.8,
                twist: 0.1,
                fuzziness: 0.1
            },
            {
                name: 'wool',
                baseColor: { r: 0.85, g: 0.85, b: 0.8 },
                roughness: 0.9,
                metallic: 0.0,
                sheen: 0.05,
                transmission: 0.0,
                thickness: 1.5,
                weight: 1.2,
                twist: 0.5,
                fuzziness: 0.8
            },
            {
                name: 'synthetic',
                baseColor: { r: 0.9, g: 0.9, b: 0.9 },
                roughness: 0.3,
                metallic: 0.0,
                sheen: 0.7,
                transmission: 0.05,
                thickness: 0.9,
                weight: 0.9,
                twist: 0.2,
                fuzziness: 0.2
            },
            {
                name: 'metallic',
                baseColor: { r: 0.8, g: 0.8, b: 0.9 },
                roughness: 0.1,
                metallic: 1.0,
                sheen: 0.95,
                transmission: 0.0,
                thickness: 0.7,
                weight: 1.1,
                twist: 0.0,
                fuzziness: 0.0
            },
            {
                name: 'glow',
                baseColor: { r: 1.0, g: 1.0, b: 1.0 },
                roughness: 0.2,
                metallic: 0.0,
                sheen: 0.8,
                transmission: 0.3,
                thickness: 0.8,
                weight: 0.8,
                twist: 0.1,
                fuzziness: 0.1
            }
        ];
        materials.forEach(material => {
            this.threadMaterials.set(material.name, material);
        });
    }
    renderUltraCrossStitch(ctx, points, config) {
        if (points.length < 2)
            return;
        const startTime = performance.now();
        ctx.save();
        try {
            // Set up 4K rendering context
            this.setup4KContext(ctx, config);
            // Get thread material properties
            const material = this.getThreadMaterial(config.threadType || 'cotton');
            // Calculate stitch distribution with ultra-precision
            const stitchData = this.calculateUltraStitchDistribution(points, config, material);
            // Render each stitch with photorealistic quality
            for (let i = 0; i < stitchData.length; i++) {
                const stitch = stitchData[i];
                this.renderUltraCrossStitchSingle(ctx, stitch, config, material);
            }
        }
        catch (error) {
            console.error('Error in ultra cross-stitch rendering:', error);
        }
        finally {
            ctx.restore();
            this.trackPerformance('ultra-cross-stitch', performance.now() - startTime);
        }
    }
    renderUltraSatinStitch(ctx, points, config) {
        if (points.length < 2)
            return;
        const startTime = performance.now();
        ctx.save();
        try {
            this.setup4KContext(ctx, config);
            const material = this.getThreadMaterial(config.threadType || 'silk');
            // Create ultra-smooth satin with thread simulation
            this.renderUltraSatinWithThreadSimulation(ctx, points, config, material);
        }
        catch (error) {
            console.error('Error in ultra satin-stitch rendering:', error);
        }
        finally {
            ctx.restore();
            this.trackPerformance('ultra-satin-stitch', performance.now() - startTime);
        }
    }
    renderUltraChainStitch(ctx, points, config) {
        if (points.length < 2)
            return;
        const startTime = performance.now();
        ctx.save();
        try {
            this.setup4KContext(ctx, config);
            const material = this.getThreadMaterial(config.threadType || 'cotton');
            // Render chain with ultra-realistic link simulation
            this.renderUltraChainWithLinkSimulation(ctx, points, config, material);
        }
        catch (error) {
            console.error('Error in ultra chain-stitch rendering:', error);
        }
        finally {
            ctx.restore();
            this.trackPerformance('ultra-chain-stitch', performance.now() - startTime);
        }
    }
    renderUltraFillStitch(ctx, points, config) {
        if (points.length < 3)
            return;
        const startTime = performance.now();
        ctx.save();
        try {
            this.setup4KContext(ctx, config);
            const material = this.getThreadMaterial(config.threadType || 'cotton');
            // Create ultra-dense fill with thread direction simulation
            this.renderUltraFillWithDirectionSimulation(ctx, points, config, material);
        }
        catch (error) {
            console.error('Error in ultra fill-stitch rendering:', error);
        }
        finally {
            ctx.restore();
            this.trackPerformance('ultra-fill-stitch', performance.now() - startTime);
        }
    }
    setup4KContext(ctx, config) {
        // Enable high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        // Set up anti-aliasing
        if (config.antiAliasing !== false) {
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
        // Set up global composite operation
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = config.opacity || 1.0;
    }
    getThreadMaterial(threadType) {
        return this.threadMaterials.get(threadType) || this.threadMaterials.get('cotton');
    }
    calculateUltraStitchDistribution(points, config, material) {
        const stitches = [];
        const density = config.stitchDensity || 0.8;
        const tension = config.stitchTension || 0.5;
        const variation = config.stitchVariation || 0.1;
        // Calculate total path length with ultra-precision
        let totalLength = 0;
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            totalLength += Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
        }
        // Calculate ultra-precise stitch spacing
        const baseSpacing = config.thickness * 0.8;
        const tensionFactor = 1 + (tension * 0.4);
        const densityFactor = 1 + (density * 0.8);
        const materialFactor = 1 + (material.thickness * 0.3);
        const stitchSpacing = baseSpacing * tensionFactor / densityFactor / materialFactor;
        const numStitches = Math.max(1, Math.ceil(totalLength / stitchSpacing));
        // Distribute stitches with ultra-precision and variation
        let currentDistance = 0;
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const segmentLength = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
            const segmentStitches = Math.ceil((segmentLength / totalLength) * numStitches);
            for (let j = 0; j < segmentStitches; j++) {
                const t = j / segmentStitches;
                const baseX = p1.x + (p2.x - p1.x) * t;
                const baseY = p1.y + (p2.y - p1.y) * t;
                // Add ultra-precise variation
                const variationX = this.getNoise(baseX, baseY) * variation * 2;
                const variationY = this.getNoise(baseY, baseX) * variation * 2;
                stitches.push({
                    x: baseX + variationX,
                    y: baseY + variationY,
                    size: config.thickness * (1 + this.getNoise(baseX, baseY) * 0.1),
                    angle: this.calculateUltraStitchAngle(p1, p2, config.stitchAngle || 0),
                    tension: tension,
                    material: material,
                    threadWear: config.threadWear || 0,
                    colorBleeding: config.colorBleeding || 0
                });
            }
        }
        return stitches;
    }
    renderUltraCrossStitchSingle(ctx, stitch, config, material) {
        const { x, y, size, angle, tension, material: mat, threadWear, colorBleeding } = stitch;
        // Calculate ultra-realistic colors with material properties
        const baseColor = this.parseColor(config.color);
        const threadColor = this.calculateThreadColor(baseColor, mat, x, y, threadWear, colorBleeding);
        const shadowColor = this.calculateShadowColor(threadColor, mat, tension);
        const highlightColor = this.calculateHighlightColor(threadColor, mat, angle);
        // Calculate lighting effects
        const lighting = this.calculateLighting(x, y, size, angle, config, mat);
        // Render shadow with ultra-precision
        ctx.strokeStyle = this.colorToString(shadowColor);
        ctx.lineWidth = size * 0.9;
        ctx.globalAlpha = lighting.shadow * 0.6;
        this.drawUltraCrossStitch(ctx, x + 0.8, y + 0.8, size, angle, mat);
        // Render main stitch with material properties
        ctx.strokeStyle = this.colorToString(threadColor);
        ctx.lineWidth = size * 0.7;
        ctx.globalAlpha = lighting.diffuse;
        this.drawUltraCrossStitch(ctx, x, y, size, angle, mat);
        // Render highlight with sheen
        ctx.strokeStyle = this.colorToString(highlightColor);
        ctx.lineWidth = size * 0.2;
        ctx.globalAlpha = lighting.specular * mat.sheen;
        this.drawUltraCrossStitch(ctx, x - size * 0.15, y - size * 0.15, size * 0.9, angle, mat);
        // Render thread texture if enabled
        if (config.threadTexture !== false) {
            this.renderThreadTexture(ctx, x, y, size, angle, mat, threadColor);
        }
    }
    drawUltraCrossStitch(ctx, x, y, size, angle, material) {
        const rad = (angle * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        // Apply thread twist
        const twistFactor = 1 + material.twist * 0.2;
        const twistedSize = size * twistFactor;
        ctx.beginPath();
        // First diagonal with thread twist
        ctx.moveTo(x - twistedSize * cos, y - twistedSize * sin);
        ctx.lineTo(x + twistedSize * cos, y + twistedSize * sin);
        // Second diagonal with thread twist
        ctx.moveTo(x - twistedSize * sin, y + twistedSize * cos);
        ctx.lineTo(x + twistedSize * sin, y - twistedSize * cos);
        ctx.stroke();
    }
    renderUltraSatinWithThreadSimulation(ctx, points, config, material) {
        // Create ultra-smooth gradient based on material properties
        const gradient = this.createUltraGradient(ctx, points, config, material);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = config.thickness * (1 + material.thickness * 0.3);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // Draw ultra-smooth satin curve with thread simulation
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            const curr = points[i];
            const prev = points[i - 1];
            const next = points[i + 1];
            if (next) {
                // Ultra-smooth curve with material-based tension
                const tension = config.stitchTension || 0.5;
                const materialTension = tension * (1 + material.weight * 0.2);
                const cp1x = prev.x + (curr.x - prev.x) * (0.5 + materialTension * 0.3);
                const cp1y = prev.y + (curr.y - prev.y) * (0.5 + materialTension * 0.3);
                const cp2x = curr.x - (next.x - curr.x) * (0.5 + materialTension * 0.3);
                const cp2y = curr.y - (next.y - curr.y) * (0.5 + materialTension * 0.3);
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
            }
            else {
                ctx.lineTo(curr.x, curr.y);
            }
        }
        ctx.stroke();
        // Add thread texture overlay
        if (config.threadTexture !== false) {
            this.renderSatinThreadTexture(ctx, points, config, material);
        }
    }
    renderUltraChainWithLinkSimulation(ctx, points, config, material) {
        const baseColor = this.parseColor(config.color);
        const linkSize = config.thickness * (1 + material.thickness * 0.4);
        for (let i = 0; i < points.length - 1; i++) {
            const curr = points[i];
            const next = points[i + 1];
            // Calculate ultra-precise link spacing
            const distance = Math.sqrt((next.x - curr.x) ** 2 + (next.y - curr.y) ** 2);
            const linkSpacing = Math.max(1, linkSize * 0.9);
            const numLinks = Math.max(1, Math.ceil(distance / linkSpacing));
            for (let j = 0; j <= numLinks; j++) {
                const t = j / numLinks;
                const linkX = curr.x + (next.x - curr.x) * t;
                const linkY = curr.y + (next.y - curr.y) * t;
                // Add ultra-precise variation
                const variation = this.getUltraVariation(material, linkX, linkY);
                const finalX = linkX + variation.x;
                const finalY = linkY + variation.y;
                // Render ultra-realistic chain link
                this.renderUltraChainLink(ctx, finalX, finalY, linkSize, baseColor, material, config);
            }
        }
    }
    renderUltraFillWithDirectionSimulation(ctx, points, config, material) {
        const baseColor = this.parseColor(config.color);
        const direction = config.stitchAngle || 0;
        const density = config.stitchDensity || 0.8;
        // Create ultra-precise clipping path
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        ctx.clip();
        // Calculate ultra-dense fill area bounds
        const minX = Math.min(...points.map(p => p.x));
        const maxX = Math.max(...points.map(p => p.x));
        const minY = Math.min(...points.map(p => p.y));
        const maxY = Math.max(...points.map(p => p.y));
        // Calculate ultra-precise line spacing
        const lineSpacing = Math.max(0.5, config.thickness * (1 + material.thickness * 0.3) / density);
        const numLines = Math.ceil((maxY - minY) / lineSpacing);
        // Render ultra-dense fill lines with material simulation
        for (let i = 0; i < numLines; i++) {
            const y = minY + (i * lineSpacing);
            // Calculate ultra-precise line angle with material properties
            const angleVariation = this.getNoise(y * 0.01, i * 0.01) * 15;
            const materialVariation = material.twist * 5;
            const lineAngle = direction + angleVariation + materialVariation;
            // Calculate ultra-precise line endpoints
            const rad = (lineAngle * Math.PI) / 180;
            const length = maxX - minX;
            const startX = minX;
            const startY = y;
            const endX = minX + length * Math.cos(rad);
            const endY = y + length * Math.sin(rad);
            // Add ultra-precise variation
            const variation = this.getUltraVariation(material, startX, startY);
            const threadColor = this.calculateThreadColor(baseColor, material, startX, startY, 0, 0);
            ctx.strokeStyle = this.colorToString(threadColor);
            ctx.lineWidth = config.thickness * (1 + variation.size);
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(startX + variation.x, startY + variation.y);
            ctx.lineTo(endX + variation.x, endY + variation.y);
            ctx.stroke();
        }
    }
    createUltraGradient(ctx, points, config, material) {
        const gradient = ctx.createLinearGradient(points[0].x, points[0].y, points[points.length - 1].x, points[points.length - 1].y);
        const baseColor = this.parseColor(config.color);
        const lightColor = this.lightenColor(baseColor, 0.4 + material.sheen * 0.3);
        const darkColor = this.darkenColor(baseColor, 0.3);
        const midColor = this.calculateThreadColor(baseColor, material, 0, 0, 0, 0);
        gradient.addColorStop(0, this.colorToString(lightColor));
        gradient.addColorStop(0.3, this.colorToString(midColor));
        gradient.addColorStop(0.7, this.colorToString(midColor));
        gradient.addColorStop(1, this.colorToString(darkColor));
        return gradient;
    }
    renderUltraChainLink(ctx, x, y, size, baseColor, material, config) {
        const threadColor = this.calculateThreadColor(baseColor, material, x, y, 0, 0);
        const shadowColor = this.calculateShadowColor(threadColor, material, 0.5);
        const highlightColor = this.calculateHighlightColor(threadColor, material, 0);
        // Calculate lighting
        const lighting = this.calculateLighting(x, y, size, 0, config, material);
        // Shadow
        ctx.fillStyle = this.colorToString(shadowColor);
        ctx.globalAlpha = lighting.shadow * 0.7;
        ctx.beginPath();
        ctx.arc(x + 1, y + 1, size * 0.7, 0, Math.PI * 2);
        ctx.fill();
        // Main link
        ctx.fillStyle = this.colorToString(threadColor);
        ctx.globalAlpha = lighting.diffuse;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
        ctx.fill();
        // Highlight
        ctx.fillStyle = this.colorToString(highlightColor);
        ctx.globalAlpha = lighting.specular * material.sheen;
        ctx.beginPath();
        ctx.arc(x - size * 0.25, y - size * 0.25, size * 0.25, 0, Math.PI * 2);
        ctx.fill();
    }
    renderThreadTexture(ctx, x, y, size, angle, material, color) {
        if (material.fuzziness < 0.1)
            return;
        const fuzziness = material.fuzziness * size * 0.1;
        const numFuzz = Math.floor(fuzziness * 5);
        for (let i = 0; i < numFuzz; i++) {
            const fuzzX = x + (Math.random() - 0.5) * fuzziness;
            const fuzzY = y + (Math.random() - 0.5) * fuzziness;
            const fuzzSize = Math.random() * fuzziness * 0.5;
            ctx.fillStyle = this.colorToString(color);
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(fuzzX, fuzzY, fuzzSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    renderSatinThreadTexture(ctx, points, config, material) {
        if (material.fuzziness < 0.1)
            return;
        const fuzziness = material.fuzziness * config.thickness * 0.05;
        const numFuzz = Math.floor(fuzziness * 10);
        for (let i = 0; i < numFuzz; i++) {
            const t = Math.random();
            const p1 = points[Math.floor(t * (points.length - 1))];
            const p2 = points[Math.floor(t * (points.length - 1)) + 1];
            if (p1 && p2) {
                const fuzzX = p1.x + (p2.x - p1.x) * t + (Math.random() - 0.5) * fuzziness;
                const fuzzY = p1.y + (p2.y - p1.y) * t + (Math.random() - 0.5) * fuzziness;
                const fuzzSize = Math.random() * fuzziness * 0.3;
                ctx.fillStyle = config.color;
                ctx.globalAlpha = 0.2;
                ctx.beginPath();
                ctx.arc(fuzzX, fuzzY, fuzzSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    calculateUltraStitchAngle(p1, p2, direction) {
        const baseAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
        return (baseAngle + direction) % 360;
    }
    getUltraVariation(material, x, y) {
        const roughness = material.roughness;
        const twist = material.twist;
        const noiseX = this.getNoise(x * 0.1, y * 0.1) * roughness * 2;
        const noiseY = this.getNoise(y * 0.1, x * 0.1) * roughness * 2;
        const sizeVariation = this.getNoise(x * 0.05, y * 0.05) * twist * 0.2;
        return {
            x: noiseX,
            y: noiseY,
            size: sizeVariation
        };
    }
    calculateThreadColor(baseColor, material, x, y, wear, bleeding) {
        const variation = this.getNoise(x * 0.1, y * 0.1) * 0.1;
        const wearEffect = wear * 0.2;
        const bleedingEffect = bleeding * 0.1;
        return {
            r: Math.max(0, Math.min(255, baseColor.r + variation * 50 - wearEffect * 30 + bleedingEffect * 20)),
            g: Math.max(0, Math.min(255, baseColor.g + variation * 50 - wearEffect * 30 + bleedingEffect * 20)),
            b: Math.max(0, Math.min(255, baseColor.b + variation * 50 - wearEffect * 30 + bleedingEffect * 20))
        };
    }
    calculateShadowColor(color, material, tension) {
        const shadowFactor = 0.3 + tension * 0.2 + material.roughness * 0.1;
        return {
            r: color.r * shadowFactor,
            g: color.g * shadowFactor,
            b: color.b * shadowFactor
        };
    }
    calculateHighlightColor(color, material, angle) {
        const highlightFactor = 0.3 + material.sheen * 0.4;
        const angleFactor = Math.cos(angle * Math.PI / 180) * 0.1;
        return {
            r: Math.min(255, color.r + (255 - color.r) * (highlightFactor + angleFactor)),
            g: Math.min(255, color.g + (255 - color.g) * (highlightFactor + angleFactor)),
            b: Math.min(255, color.b + (255 - color.b) * (highlightFactor + angleFactor))
        };
    }
    calculateLighting(x, y, size, angle, config, material) {
        const lightDir = config.lightDirection || { x: 0.5, y: 0.5, z: 1 };
        const ambient = config.ambientLight || 0.3;
        const diffuse = config.diffuseLight || 0.7;
        const specular = config.specularLight || 0.5;
        // Calculate surface normal
        const normal = { x: Math.cos(angle * Math.PI / 180), y: Math.sin(angle * Math.PI / 180), z: 0 };
        // Calculate lighting components
        const lightDot = normal.x * lightDir.x + normal.y * lightDir.y + normal.z * lightDir.z;
        const diffuseLight = Math.max(0, lightDot) * diffuse;
        const specularLight = Math.pow(Math.max(0, lightDot), 32) * specular * material.sheen;
        const shadow = Math.max(0, 1 - lightDot) * (config.shadowIntensity || 0.3);
        return {
            ambient,
            diffuse: ambient + diffuseLight,
            specular: specularLight,
            shadow
        };
    }
    getNoise(x, y) {
        const key = `${x.toFixed(2)}_${y.toFixed(2)}`;
        if (this.noiseCache.has(key)) {
            return this.noiseCache.get(key);
        }
        // Simple noise function
        const noise = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 0.5 + 0.5;
        this.noiseCache.set(key, noise);
        // Limit cache size
        if (this.noiseCache.size > 1000) {
            const firstKey = this.noiseCache.keys().next().value;
            if (typeof firstKey === 'string') {
                this.noiseCache.delete(firstKey);
            }
        }
        return noise;
    }
    parseColor(color) {
        const hex = color.replace('#', '');
        return {
            r: parseInt(hex.substr(0, 2), 16),
            g: parseInt(hex.substr(2, 2), 16),
            b: parseInt(hex.substr(4, 2), 16)
        };
    }
    colorToString(color) {
        return `rgb(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)})`;
    }
    lightenColor(color, amount) {
        return {
            r: color.r + (255 - color.r) * amount,
            g: color.g + (255 - color.g) * amount,
            b: color.b + (255 - color.b) * amount
        };
    }
    darkenColor(color, amount) {
        return {
            r: color.r * (1 - amount),
            g: color.g * (1 - amount),
            b: color.b * (1 - amount)
        };
    }
    trackPerformance(operation, duration) {
        if (!this.performanceMetrics.has(operation)) {
            this.performanceMetrics.set(operation, []);
        }
        const metrics = this.performanceMetrics.get(operation);
        metrics.push(duration);
        if (metrics.length > 100) {
            metrics.shift();
        }
    }
    getPerformanceMetrics() {
        return this.performanceMetrics;
    }
    clearCache() {
        this.noiseCache.clear();
        this.gradientCache.clear();
    }
}
export const ultraRealisticStitchRenderer = UltraRealisticStitchRenderer.getInstance();
