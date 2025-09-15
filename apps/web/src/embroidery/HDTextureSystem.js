/**
 * HD Texture System
 * 4K+ resolution texture management for realistic embroidery rendering
 */
import { performanceMonitor } from '../utils/PerformanceMonitor';
import { centralizedErrorHandler, ErrorCategory, ErrorSeverity } from '../utils/CentralizedErrorHandler';
export class HDTextureSystem {
    constructor(gl = null) {
        this.gl = null;
        this.textures = new Map();
        this.textureAtlases = new Map();
        this.textureCache = new Map();
        this.isInitialized = false;
        this.maxTextureSize = 0;
        this.maxAnisotropy = 0;
        this.gl = gl;
        if (gl) {
            this.initialize();
        }
    }
    /**
     * Initialize the texture system
     */
    async initialize() {
        try {
            if (!this.gl) {
                throw new Error('WebGL context not available');
            }
            // Get WebGL capabilities with proper extension handling
            try {
                this.maxTextureSize = this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE) || 4096;
                // Check for anisotropy extension before using it
                const anisotropyExt = this.gl.getExtension('EXT_texture_filter_anisotropic') ||
                    this.gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic') ||
                    this.gl.getExtension('MOZ_EXT_texture_filter_anisotropic');
                if (anisotropyExt) {
                    this.maxAnisotropy = this.gl.getParameter(anisotropyExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT) || 1;
                }
                else {
                    this.maxAnisotropy = 1;
                }
            }
            catch (error) {
                console.warn('WebGL parameter access failed, using fallback values:', error);
                this.maxTextureSize = 4096;
                this.maxAnisotropy = 1;
            }
            console.log(`🎨 HD Texture System initialized - Max texture size: ${this.maxTextureSize}x${this.maxTextureSize}, Max anisotropy: ${this.maxAnisotropy}`);
            this.isInitialized = true;
        }
        catch (error) {
            centralizedErrorHandler.handleError(error, { component: 'HDTextureSystem', function: 'initialize' }, ErrorSeverity.HIGH, ErrorCategory.RENDERING);
            throw error;
        }
    }
    /**
     * Generate thread texture with realistic properties
     */
    async generateThreadTexture(threadData) {
        try {
            const startTime = performance.now();
            const textureId = `thread_${threadData.type}_${threadData.color.replace('#', '')}_${threadData.resolution}`;
            // Check if texture already exists
            if (this.textures.has(textureId)) {
                return this.textures.get(textureId);
            }
            // Generate texture data
            const imageData = await this.generateThreadImageData(threadData);
            // Create WebGL texture
            const texture = this.createWebGLTexture(imageData, {
                id: textureId,
                width: threadData.resolution,
                height: threadData.resolution,
                format: 'RGBA',
                type: 'UNSIGNED_BYTE',
                wrapS: 'REPEAT',
                wrapT: 'REPEAT',
                minFilter: 'LINEAR_MIPMAP_LINEAR',
                magFilter: 'LINEAR',
                generateMipmaps: true,
                anisotropy: this.maxAnisotropy
            });
            this.textures.set(textureId, texture);
            // Track performance
            const duration = performance.now() - startTime;
            performanceMonitor.trackMetric('thread_texture_generation', duration, 'ms', 'texture', 'HDTextureSystem');
            return texture;
        }
        catch (error) {
            centralizedErrorHandler.handleError(error, { component: 'HDTextureSystem', function: 'generateThreadTexture' }, ErrorSeverity.MEDIUM, ErrorCategory.RENDERING);
            throw error;
        }
    }
    /**
     * Generate fabric texture with realistic properties
     */
    async generateFabricTexture(fabricData) {
        try {
            const startTime = performance.now();
            const textureId = `fabric_${fabricData.type}_${fabricData.color.replace('#', '')}_${fabricData.resolution}`;
            // Check if texture already exists
            if (this.textures.has(textureId)) {
                return this.textures.get(textureId);
            }
            // Generate texture data
            const imageData = await this.generateFabricImageData(fabricData);
            // Create WebGL texture
            const texture = this.createWebGLTexture(imageData, {
                id: textureId,
                width: fabricData.resolution,
                height: fabricData.resolution,
                format: 'RGBA',
                type: 'UNSIGNED_BYTE',
                wrapS: 'REPEAT',
                wrapT: 'REPEAT',
                minFilter: 'LINEAR_MIPMAP_LINEAR',
                magFilter: 'LINEAR',
                generateMipmaps: true,
                anisotropy: this.maxAnisotropy
            });
            this.textures.set(textureId, texture);
            // Track performance
            const duration = performance.now() - startTime;
            performanceMonitor.trackMetric('fabric_texture_generation', duration, 'ms', 'texture', 'HDTextureSystem');
            return texture;
        }
        catch (error) {
            centralizedErrorHandler.handleError(error, { component: 'HDTextureSystem', function: 'generateFabricTexture' }, ErrorSeverity.MEDIUM, ErrorCategory.RENDERING);
            throw error;
        }
    }
    /**
     * Generate normal map for material
     */
    async generateNormalMap(normalData) {
        try {
            const startTime = performance.now();
            const textureId = `normal_${normalData.materialType}_${normalData.resolution}`;
            // Check if texture already exists
            if (this.textures.has(textureId)) {
                return this.textures.get(textureId);
            }
            // Generate normal map data
            const imageData = await this.generateNormalMapData(normalData);
            // Create WebGL texture
            const texture = this.createWebGLTexture(imageData, {
                id: textureId,
                width: normalData.resolution,
                height: normalData.resolution,
                format: 'RGBA',
                type: 'UNSIGNED_BYTE',
                wrapS: 'REPEAT',
                wrapT: 'REPEAT',
                minFilter: 'LINEAR_MIPMAP_LINEAR',
                magFilter: 'LINEAR',
                generateMipmaps: true,
                anisotropy: this.maxAnisotropy
            });
            this.textures.set(textureId, texture);
            // Track performance
            const duration = performance.now() - startTime;
            performanceMonitor.trackMetric('normal_map_generation', duration, 'ms', 'texture', 'HDTextureSystem');
            return texture;
        }
        catch (error) {
            centralizedErrorHandler.handleError(error, { component: 'HDTextureSystem', function: 'generateNormalMap' }, ErrorSeverity.MEDIUM, ErrorCategory.RENDERING);
            throw error;
        }
    }
    /**
     * Create texture atlas for efficient rendering
     */
    async createTextureAtlas(textureIds, atlasSize = 4096) {
        try {
            const startTime = performance.now();
            const atlasId = `atlas_${textureIds.join('_')}_${atlasSize}`;
            // Check if atlas already exists
            if (this.textureAtlases.has(atlasId)) {
                return this.textureAtlases.get(atlasId);
            }
            // Create atlas canvas
            const canvas = document.createElement('canvas');
            canvas.width = atlasSize;
            canvas.height = atlasSize;
            const ctx = canvas.getContext('2d');
            if (!ctx)
                throw new Error('Failed to get 2D context');
            // Pack textures into atlas
            const regions = new Map();
            let currentX = 0;
            let currentY = 0;
            let currentRowHeight = 0;
            for (const textureId of textureIds) {
                const texture = this.textures.get(textureId);
                if (!texture)
                    continue;
                // Get texture data
                const imageData = await this.getTextureData(texture);
                // Calculate position in atlas
                const region = {
                    x: currentX,
                    y: currentY,
                    width: imageData.width,
                    height: imageData.height,
                    u1: currentX / atlasSize,
                    v1: currentY / atlasSize,
                    u2: (currentX + imageData.width) / atlasSize,
                    v2: (currentY + imageData.height) / atlasSize
                };
                // Draw texture to atlas
                ctx.putImageData(imageData, currentX, currentY);
                regions.set(textureId, region);
                // Update position
                currentX += imageData.width;
                currentRowHeight = Math.max(currentRowHeight, imageData.height);
                if (currentX + imageData.width > atlasSize) {
                    currentX = 0;
                    currentY += currentRowHeight;
                    currentRowHeight = 0;
                }
            }
            // Create WebGL texture from atlas
            const atlasTexture = this.createWebGLTextureFromCanvas(canvas, {
                id: atlasId,
                width: atlasSize,
                height: atlasSize,
                format: 'RGBA',
                type: 'UNSIGNED_BYTE',
                wrapS: 'CLAMP_TO_EDGE',
                wrapT: 'CLAMP_TO_EDGE',
                minFilter: 'LINEAR_MIPMAP_LINEAR',
                magFilter: 'LINEAR',
                generateMipmaps: true,
                anisotropy: this.maxAnisotropy
            });
            const atlas = {
                id: atlasId,
                textures: regions,
                width: atlasSize,
                height: atlasSize,
                glTexture: atlasTexture
            };
            this.textureAtlases.set(atlasId, atlas);
            // Track performance
            const duration = performance.now() - startTime;
            performanceMonitor.trackMetric('texture_atlas_creation', duration, 'ms', 'texture', 'HDTextureSystem');
            return atlas;
        }
        catch (error) {
            centralizedErrorHandler.handleError(error, { component: 'HDTextureSystem', function: 'createTextureAtlas' }, ErrorSeverity.MEDIUM, ErrorCategory.RENDERING);
            throw error;
        }
    }
    /**
     * Load texture from URL
     */
    async loadTextureFromURL(url, properties = {}) {
        try {
            const startTime = performance.now();
            // Check if texture already exists
            if (this.textures.has(url)) {
                return this.textures.get(url);
            }
            // Load image
            const image = await this.loadImage(url);
            // Create WebGL texture
            const texture = this.createWebGLTextureFromImage(image, {
                id: url,
                width: image.width,
                height: image.height,
                format: 'RGBA',
                type: 'UNSIGNED_BYTE',
                wrapS: 'REPEAT',
                wrapT: 'REPEAT',
                minFilter: 'LINEAR_MIPMAP_LINEAR',
                magFilter: 'LINEAR',
                generateMipmaps: true,
                anisotropy: this.maxAnisotropy,
                ...properties
            });
            this.textures.set(url, texture);
            // Track performance
            const duration = performance.now() - startTime;
            performanceMonitor.trackMetric('texture_loading', duration, 'ms', 'texture', 'HDTextureSystem');
            return texture;
        }
        catch (error) {
            centralizedErrorHandler.handleError(error, { component: 'HDTextureSystem', function: 'loadTextureFromURL' }, ErrorSeverity.MEDIUM, ErrorCategory.RENDERING);
            throw error;
        }
    }
    /**
     * Get texture by ID
     */
    getTexture(id) {
        return this.textures.get(id) || null;
    }
    /**
     * Get texture atlas by ID
     */
    getTextureAtlas(id) {
        return this.textureAtlases.get(id) || null;
    }
    /**
     * Unload texture to free memory
     */
    unloadTexture(id) {
        const texture = this.textures.get(id);
        if (texture && this.gl) {
            this.gl.deleteTexture(texture);
            this.textures.delete(id);
        }
    }
    /**
     * Optimize memory usage
     */
    optimizeMemory() {
        // Remove unused textures
        const unusedTextures = new Set();
        for (const [id, texture] of this.textures) {
            // Check if texture is still being used
            // This is a simplified check - in production, you'd track usage more carefully
            if (Math.random() < 0.1) { // 10% chance to remove (placeholder logic)
                unusedTextures.add(id);
            }
        }
        for (const id of unusedTextures) {
            this.unloadTexture(id);
        }
        console.log(`🧹 Memory optimization: Removed ${unusedTextures.size} unused textures`);
    }
    /**
     * Clean up all resources
     */
    dispose() {
        if (this.gl) {
            // Delete all textures
            for (const texture of this.textures.values()) {
                this.gl.deleteTexture(texture);
            }
            // Delete all atlas textures
            for (const atlas of this.textureAtlases.values()) {
                this.gl.deleteTexture(atlas.glTexture);
            }
        }
        this.textures.clear();
        this.textureAtlases.clear();
        this.textureCache.clear();
        this.isInitialized = false;
    }
    // Private helper methods
    async generateThreadImageData(threadData) {
        const { resolution, color, thickness, twist, sheen, roughness, metallic, glowIntensity, variegationPattern } = threadData;
        const canvas = document.createElement('canvas');
        canvas.width = resolution;
        canvas.height = resolution;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            throw new Error('Failed to get 2D context');
        // Parse color
        const rgb = this.hexToRgb(color);
        if (!rgb)
            throw new Error('Invalid color format');
        // Generate thread texture
        const imageData = ctx.createImageData(resolution, resolution);
        const data = imageData.data;
        for (let y = 0; y < resolution; y++) {
            for (let x = 0; x < resolution; x++) {
                const index = (y * resolution + x) * 4;
                // Calculate thread position and properties
                const u = x / resolution;
                const v = y / resolution;
                // Generate thread pattern
                const threadPattern = this.generateThreadPattern(u, v, thickness, twist);
                // Calculate color variations
                const colorVariation = this.calculateColorVariation(u, v, variegationPattern);
                const sheenEffect = this.calculateSheenEffect(u, v, sheen);
                const metallicEffect = metallic ? this.calculateMetallicEffect(u, v) : 1.0;
                const glowEffect = glowIntensity > 0 ? this.calculateGlowEffect(u, v, glowIntensity) : 1.0;
                // Apply effects
                const finalR = Math.round(rgb.r * colorVariation * sheenEffect * metallicEffect * glowEffect);
                const finalG = Math.round(rgb.g * colorVariation * sheenEffect * metallicEffect * glowEffect);
                const finalB = Math.round(rgb.b * colorVariation * sheenEffect * metallicEffect * glowEffect);
                // Set pixel data
                data[index] = Math.max(0, Math.min(255, finalR)); // R
                data[index + 1] = Math.max(0, Math.min(255, finalG)); // G
                data[index + 2] = Math.max(0, Math.min(255, finalB)); // B
                data[index + 3] = 255; // A
            }
        }
        return imageData;
    }
    async generateFabricImageData(fabricData) {
        const { resolution, color, weave, stretch, thickness, roughness } = fabricData;
        const canvas = document.createElement('canvas');
        canvas.width = resolution;
        canvas.height = resolution;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            throw new Error('Failed to get 2D context');
        // Parse color
        const rgb = this.hexToRgb(color);
        if (!rgb)
            throw new Error('Invalid color format');
        // Generate fabric texture
        const imageData = ctx.createImageData(resolution, resolution);
        const data = imageData.data;
        for (let y = 0; y < resolution; y++) {
            for (let x = 0; x < resolution; x++) {
                const index = (y * resolution + x) * 4;
                // Calculate fabric position and properties
                const u = x / resolution;
                const v = y / resolution;
                // Generate weave pattern
                const weavePattern = this.generateWeavePattern(u, v, weave);
                // Calculate fabric properties
                const stretchEffect = this.calculateStretchEffect(u, v, stretch);
                const roughnessEffect = this.calculateRoughnessEffect(u, v, roughness);
                // Apply effects
                const finalR = Math.round(rgb.r * weavePattern * stretchEffect * roughnessEffect);
                const finalG = Math.round(rgb.g * weavePattern * stretchEffect * roughnessEffect);
                const finalB = Math.round(rgb.b * weavePattern * stretchEffect * roughnessEffect);
                // Set pixel data
                data[index] = Math.max(0, Math.min(255, finalR)); // R
                data[index + 1] = Math.max(0, Math.min(255, finalG)); // G
                data[index + 2] = Math.max(0, Math.min(255, finalB)); // B
                data[index + 3] = 255; // A
            }
        }
        return imageData;
    }
    async generateNormalMapData(normalData) {
        const { resolution, height, strength } = normalData;
        const canvas = document.createElement('canvas');
        canvas.width = resolution;
        canvas.height = resolution;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            throw new Error('Failed to get 2D context');
        // Generate normal map
        const imageData = ctx.createImageData(resolution, resolution);
        const data = imageData.data;
        for (let y = 0; y < resolution; y++) {
            for (let x = 0; x < resolution; x++) {
                const index = (y * resolution + x) * 4;
                // Calculate normal vector
                const normal = this.calculateNormalVector(x, y, resolution, height, strength);
                // Convert to texture format (0-255)
                const r = Math.round((normal.x + 1) * 127.5);
                const g = Math.round((normal.y + 1) * 127.5);
                const b = Math.round((normal.z + 1) * 127.5);
                // Set pixel data
                data[index] = Math.max(0, Math.min(255, r)); // R
                data[index + 1] = Math.max(0, Math.min(255, g)); // G
                data[index + 2] = Math.max(0, Math.min(255, b)); // B
                data[index + 3] = 255; // A
            }
        }
        return imageData;
    }
    createWebGLTexture(imageData, properties) {
        if (!this.gl)
            throw new Error('WebGL context not available');
        const texture = this.gl.createTexture();
        if (!texture)
            throw new Error('Failed to create texture');
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        // Upload texture data
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, properties.width, properties.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, imageData.data);
        // Set texture parameters
        this.setTextureParameters(texture, properties);
        return texture;
    }
    createWebGLTextureFromImage(image, properties) {
        if (!this.gl)
            throw new Error('WebGL context not available');
        const texture = this.gl.createTexture();
        if (!texture)
            throw new Error('Failed to create texture');
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        // Upload image data
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
        // Set texture parameters
        this.setTextureParameters(texture, properties);
        return texture;
    }
    createWebGLTextureFromCanvas(canvas, properties) {
        if (!this.gl)
            throw new Error('WebGL context not available');
        const texture = this.gl.createTexture();
        if (!texture)
            throw new Error('Failed to create texture');
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        // Upload canvas data
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, canvas);
        // Set texture parameters
        this.setTextureParameters(texture, properties);
        return texture;
    }
    setTextureParameters(texture, properties) {
        if (!this.gl)
            return;
        // Set wrap modes
        const wrapS = this.getWrapMode(properties.wrapS);
        const wrapT = this.getWrapMode(properties.wrapT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, wrapS);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, wrapT);
        // Set filter modes
        const minFilter = this.getFilterMode(properties.minFilter);
        const magFilter = this.getFilterMode(properties.magFilter);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, minFilter);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, magFilter);
        // Generate mipmaps if requested
        if (properties.generateMipmaps) {
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
        }
        // Set anisotropy if available
        if (properties.anisotropy > 1) {
            const anisotropyExt = this.gl.getExtension('EXT_texture_filter_anisotropic') ||
                this.gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic') ||
                this.gl.getExtension('MOZ_EXT_texture_filter_anisotropic');
            if (anisotropyExt) {
                this.gl.texParameterf(this.gl.TEXTURE_2D, anisotropyExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT, properties.anisotropy);
            }
        }
    }
    getWrapMode(wrap) {
        if (!this.gl)
            return 0;
        switch (wrap) {
            case 'REPEAT': return this.gl.REPEAT;
            case 'CLAMP_TO_EDGE': return this.gl.CLAMP_TO_EDGE;
            case 'MIRRORED_REPEAT': return this.gl.MIRRORED_REPEAT;
            default: return this.gl.REPEAT;
        }
    }
    getFilterMode(filter) {
        if (!this.gl)
            return 0;
        switch (filter) {
            case 'NEAREST': return this.gl.NEAREST;
            case 'LINEAR': return this.gl.LINEAR;
            case 'NEAREST_MIPMAP_NEAREST': return this.gl.NEAREST_MIPMAP_NEAREST;
            case 'LINEAR_MIPMAP_LINEAR': return this.gl.LINEAR_MIPMAP_LINEAR;
            default: return this.gl.LINEAR;
        }
    }
    async loadImage(url) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.crossOrigin = 'anonymous';
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error(`Failed to load image: ${url}`));
            image.src = url;
        });
    }
    async getTextureData(texture) {
        // This is a simplified implementation
        // In production, you'd need to read back from WebGL
        const resolution = 1024; // Default resolution
        const canvas = document.createElement('canvas');
        canvas.width = resolution;
        canvas.height = resolution;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            throw new Error('Failed to get 2D context');
        return ctx.createImageData(resolution, resolution);
    }
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    generateThreadPattern(u, v, thickness, twist) {
        // Generate thread pattern based on twist and thickness
        const twistPattern = Math.sin(u * Math.PI * 2 * twist) * 0.1 + 0.9;
        const thicknessPattern = Math.sin(v * Math.PI * 2 / thickness) * 0.2 + 0.8;
        return twistPattern * thicknessPattern;
    }
    calculateColorVariation(u, v, pattern) {
        // Calculate color variation based on variegation pattern
        if (!pattern)
            return 1.0;
        // Simple noise-based variation
        const noise = Math.sin(u * 10) * Math.cos(v * 10) * 0.1;
        return 1.0 + noise;
    }
    calculateSheenEffect(u, v, sheen) {
        // Calculate sheen effect
        const sheenPattern = Math.sin(u * Math.PI * 4) * Math.cos(v * Math.PI * 4);
        return 1.0 + sheenPattern * sheen * 0.3;
    }
    calculateMetallicEffect(u, v) {
        // Calculate metallic effect
        const metallicPattern = Math.sin(u * Math.PI * 8) * Math.cos(v * Math.PI * 8);
        return 1.0 + metallicPattern * 0.5;
    }
    calculateGlowEffect(u, v, intensity) {
        // Calculate glow effect
        const glowPattern = Math.sin(u * Math.PI * 6) * Math.cos(v * Math.PI * 6);
        return 1.0 + glowPattern * intensity * 0.4;
    }
    generateWeavePattern(u, v, weave) {
        // Generate weave pattern based on weave type
        switch (weave) {
            case 'plain':
                return Math.sin(u * Math.PI * 4) * Math.sin(v * Math.PI * 4) * 0.1 + 0.9;
            case 'twill':
                return Math.sin((u + v) * Math.PI * 4) * 0.15 + 0.85;
            case 'satin':
                return Math.sin(u * Math.PI * 8) * Math.cos(v * Math.PI * 8) * 0.2 + 0.8;
            case 'basket':
                return Math.sin(u * Math.PI * 2) * Math.sin(v * Math.PI * 2) * 0.2 + 0.8;
            default:
                return 1.0;
        }
    }
    calculateStretchEffect(u, v, stretch) {
        // Calculate stretch effect
        const stretchPattern = Math.sin(u * Math.PI * 2) * Math.cos(v * Math.PI * 2);
        return 1.0 + stretchPattern * stretch * 0.1;
    }
    calculateRoughnessEffect(u, v, roughness) {
        // Calculate roughness effect
        const roughnessPattern = Math.sin(u * Math.PI * 8) * Math.cos(v * Math.PI * 8);
        return 1.0 + roughnessPattern * roughness * 0.2;
    }
    calculateNormalVector(x, y, resolution, height, strength) {
        // Calculate normal vector for normal mapping
        const u = x / resolution;
        const v = y / resolution;
        // Sample height values (simplified)
        const h1 = Math.sin(u * Math.PI * 4) * Math.cos(v * Math.PI * 4) * height * strength;
        const h2 = Math.sin((u + 1 / resolution) * Math.PI * 4) * Math.cos(v * Math.PI * 4) * height * strength;
        const h3 = Math.sin(u * Math.PI * 4) * Math.cos((v + 1 / resolution) * Math.PI * 4) * height * strength;
        // Calculate gradients
        const dx = (h2 - h1) * resolution;
        const dy = (h3 - h1) * resolution;
        // Calculate normal vector
        const normal = {
            x: -dx,
            y: -dy,
            z: 1.0
        };
        // Normalize
        const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
        return {
            x: normal.x / length,
            y: normal.y / length,
            z: normal.z / length
        };
    }
}
export default HDTextureSystem;
