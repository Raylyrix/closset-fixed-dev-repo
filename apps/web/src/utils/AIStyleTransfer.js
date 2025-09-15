/**
 * AI Style Transfer System
 * Advanced style transfer for embroidery pattern generation
 */
export class AIStyleTransfer {
    constructor() {
        this.styleProfiles = [];
        this.transferHistory = [];
        this.isProcessing = false;
        this.transferCallbacks = [];
        this.progressCallbacks = [];
        this.initializeStyleProfiles();
    }
    // Initialize predefined style profiles
    initializeStyleProfiles() {
        this.styleProfiles = [
            {
                id: 'traditional_embroidery',
                name: 'Traditional Embroidery',
                description: 'Classic hand-embroidered style with rich colors and intricate details',
                category: 'traditional',
                characteristics: {
                    colorPalette: ['#8B0000', '#006400', '#000080', '#FFD700', '#800080', '#FF6347'],
                    stitchTypes: ['satin', 'backstitch', 'french-knot', 'chain', 'cross-stitch'],
                    density: 0.8,
                    complexity: 0.9,
                    symmetry: 0.7,
                    texture: 0.8
                },
                examples: ['floral', 'geometric', 'folk-art'],
                popularity: 0.9
            },
            {
                id: 'modern_minimalist',
                name: 'Modern Minimalist',
                description: 'Clean, simple designs with minimal colors and geometric shapes',
                category: 'minimalist',
                characteristics: {
                    colorPalette: ['#000000', '#FFFFFF', '#808080', '#FF6B6B', '#4ECDC4'],
                    stitchTypes: ['running', 'backstitch', 'satin'],
                    density: 0.3,
                    complexity: 0.2,
                    symmetry: 0.9,
                    texture: 0.1
                },
                examples: ['geometric', 'line-art', 'abstract'],
                popularity: 0.7
            },
            {
                id: 'artistic_watercolor',
                name: 'Artistic Watercolor',
                description: 'Soft, flowing designs inspired by watercolor paintings',
                category: 'artistic',
                characteristics: {
                    colorPalette: ['#FFB6C1', '#87CEEB', '#98FB98', '#DDA0DD', '#F0E68C', '#FFA07A'],
                    stitchTypes: ['satin', 'fill', 'feather', 'lazy-daisy'],
                    density: 0.6,
                    complexity: 0.7,
                    symmetry: 0.4,
                    texture: 0.9
                },
                examples: ['floral', 'landscape', 'abstract'],
                popularity: 0.8
            },
            {
                id: 'vintage_victorian',
                name: 'Vintage Victorian',
                description: 'Ornate, detailed designs from the Victorian era',
                category: 'vintage',
                characteristics: {
                    colorPalette: ['#8B4513', '#654321', '#C0C0C0', '#FFD700', '#8B0000', '#000080'],
                    stitchTypes: ['bullion', 'french-knot', 'satin', 'chain', 'feather'],
                    density: 0.9,
                    complexity: 0.95,
                    symmetry: 0.8,
                    texture: 0.9
                },
                examples: ['ornate', 'floral', 'geometric'],
                popularity: 0.6
            },
            {
                id: 'contemporary_abstract',
                name: 'Contemporary Abstract',
                description: 'Bold, modern abstract designs with vibrant colors',
                category: 'modern',
                characteristics: {
                    colorPalette: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'],
                    stitchTypes: ['satin', 'fill', 'running', 'backstitch'],
                    density: 0.7,
                    complexity: 0.8,
                    symmetry: 0.3,
                    texture: 0.6
                },
                examples: ['abstract', 'geometric', 'modern'],
                popularity: 0.7
            },
            {
                id: 'folk_ethnic',
                name: 'Folk Ethnic',
                description: 'Traditional ethnic patterns with cultural significance',
                category: 'traditional',
                characteristics: {
                    colorPalette: ['#FF4500', '#32CD32', '#1E90FF', '#FFD700', '#8B008B', '#FF1493'],
                    stitchTypes: ['cross-stitch', 'backstitch', 'satin', 'chain'],
                    density: 0.8,
                    complexity: 0.7,
                    symmetry: 0.6,
                    texture: 0.7
                },
                examples: ['ethnic', 'folk', 'cultural'],
                popularity: 0.8
            }
        ];
    }
    // Get available style profiles
    getStyleProfiles() {
        return [...this.styleProfiles];
    }
    // Get style profile by ID
    getStyleProfile(id) {
        return this.styleProfiles.find(profile => profile.id === id);
    }
    // Apply style transfer to pattern
    async applyStyleTransfer(request) {
        if (this.isProcessing) {
            throw new Error('Style transfer already in progress');
        }
        this.isProcessing = true;
        const startTime = Date.now();
        try {
            const styleProfile = this.getStyleProfile(request.targetStyle);
            if (!styleProfile) {
                throw new Error(`Style profile not found: ${request.targetStyle}`);
            }
            console.log(`🎨 Applying style transfer: ${styleProfile.name}`);
            // Simulate processing with progress updates
            await this.simulateProcessing();
            const transformedPattern = await this.transformPattern(request.sourcePattern, styleProfile, request.intensity, request.preserveElements, request.enhanceElements, request.constraints);
            const result = {
                id: `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                originalPattern: request.sourcePattern,
                transformedPattern,
                styleProfile,
                confidence: this.calculateConfidence(transformedPattern, styleProfile),
                changes: this.calculateChanges(request.sourcePattern, transformedPattern),
                metadata: {
                    processingTime: Date.now() - startTime,
                    algorithm: 'AI Style Transfer v2.0',
                    version: '2.0.0'
                }
            };
            this.transferHistory.push(result);
            // Notify callbacks
            this.transferCallbacks.forEach(callback => {
                try {
                    callback(result);
                }
                catch (error) {
                    console.error('Error in style transfer callback:', error);
                }
            });
            console.log(`✅ Style transfer completed: ${styleProfile.name}`);
            return result;
        }
        catch (error) {
            console.error('Style transfer failed:', error);
            throw error;
        }
        finally {
            this.isProcessing = false;
        }
    }
    // Simulate processing with progress updates
    async simulateProcessing() {
        const steps = 10;
        for (let i = 0; i <= steps; i++) {
            const progress = (i / steps) * 100;
            // Notify progress callbacks
            this.progressCallbacks.forEach(callback => {
                try {
                    callback(progress);
                }
                catch (error) {
                    console.error('Error in progress callback:', error);
                }
            });
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    // Transform pattern according to style profile
    async transformPattern(sourcePattern, styleProfile, intensity, preserveElements, enhanceElements, constraints) {
        const transformedPattern = JSON.parse(JSON.stringify(sourcePattern)); // Deep clone
        // Transform colors
        if (!preserveElements.includes('colors')) {
            transformedPattern.stitches = transformedPattern.stitches.map((stitch) => ({
                ...stitch,
                color: this.transformColor(stitch.color, styleProfile, intensity)
            }));
        }
        // Transform stitch types
        if (!preserveElements.includes('stitchTypes')) {
            transformedPattern.stitches = transformedPattern.stitches.map((stitch) => ({
                ...stitch,
                type: this.transformStitchType(stitch.type, styleProfile, intensity)
            }));
        }
        // Transform density
        if (!preserveElements.includes('density')) {
            transformedPattern.stitches = transformedPattern.stitches.map((stitch) => ({
                ...stitch,
                thickness: this.transformDensity(stitch.thickness, styleProfile, intensity)
            }));
        }
        // Apply style-specific transformations
        transformedPattern.metadata = {
            ...transformedPattern.metadata,
            style: styleProfile.name,
            intensity,
            transformedAt: Date.now()
        };
        return transformedPattern;
    }
    // Transform color according to style
    transformColor(originalColor, styleProfile, intensity) {
        // Simple color transformation based on style palette
        const styleColors = styleProfile.characteristics.colorPalette;
        const randomColor = styleColors[Math.floor(Math.random() * styleColors.length)];
        // Blend original color with style color based on intensity
        return this.blendColors(originalColor, randomColor, intensity);
    }
    // Transform stitch type according to style
    transformStitchType(originalType, styleProfile, intensity) {
        const styleStitches = styleProfile.characteristics.stitchTypes;
        // If original type is in style stitches, keep it with some probability
        if (styleStitches.includes(originalType) && Math.random() > intensity) {
            return originalType;
        }
        // Otherwise, choose a random style stitch
        return styleStitches[Math.floor(Math.random() * styleStitches.length)];
    }
    // Transform density according to style
    transformDensity(originalDensity, styleProfile, intensity) {
        const targetDensity = styleProfile.characteristics.density;
        return originalDensity + (targetDensity - originalDensity) * intensity;
    }
    // Blend two colors
    blendColors(color1, color2, ratio) {
        // Simple color blending (in real implementation, would use proper color math)
        return Math.random() > ratio ? color1 : color2;
    }
    // Calculate confidence score
    calculateConfidence(transformedPattern, styleProfile) {
        // Simulate confidence calculation based on how well the pattern matches the style
        let confidence = 0.5;
        // Check color alignment
        const colors = new Set(transformedPattern.stitches.map((s) => s.color));
        const styleColors = new Set(styleProfile.characteristics.colorPalette);
        const colorAlignment = Array.from(colors).filter(c => styleColors.has(c)).length / colors.size;
        confidence += colorAlignment * 0.3;
        // Check stitch type alignment
        const stitchTypes = new Set(transformedPattern.stitches.map((s) => s.type));
        const styleStitches = new Set(styleProfile.characteristics.stitchTypes);
        const stitchAlignment = Array.from(stitchTypes).filter(s => styleStitches.has(s)).length / stitchTypes.size;
        confidence += stitchAlignment * 0.2;
        return Math.min(confidence, 1);
    }
    // Calculate changes made during transformation
    calculateChanges(originalPattern, transformedPattern) {
        const originalStitches = originalPattern.stitches || [];
        const transformedStitches = transformedPattern.stitches || [];
        let colorChanges = 0;
        let stitchChanges = 0;
        let densityChanges = 0;
        let structuralChanges = 0;
        for (let i = 0; i < Math.min(originalStitches.length, transformedStitches.length); i++) {
            const original = originalStitches[i];
            const transformed = transformedStitches[i];
            if (original.color !== transformed.color)
                colorChanges++;
            if (original.type !== transformed.type)
                stitchChanges++;
            if (Math.abs(original.thickness - transformed.thickness) > 0.1)
                densityChanges++;
            if (JSON.stringify(original.points) !== JSON.stringify(transformed.points))
                structuralChanges++;
        }
        return {
            colorChanges,
            stitchChanges,
            densityChanges,
            structuralChanges
        };
    }
    // Get transfer history
    getTransferHistory() {
        return [...this.transferHistory];
    }
    // Get recent transfers
    getRecentTransfers(limit = 10) {
        return this.transferHistory.slice(-limit);
    }
    // Subscribe to transfer results
    onTransferComplete(callback) {
        this.transferCallbacks.push(callback);
        return () => {
            const index = this.transferCallbacks.indexOf(callback);
            if (index > -1) {
                this.transferCallbacks.splice(index, 1);
            }
        };
    }
    // Subscribe to progress updates
    onProgressUpdate(callback) {
        this.progressCallbacks.push(callback);
        return () => {
            const index = this.progressCallbacks.indexOf(callback);
            if (index > -1) {
                this.progressCallbacks.splice(index, 1);
            }
        };
    }
    // Check if currently processing
    isCurrentlyProcessing() {
        return this.isProcessing;
    }
    // Create custom style profile
    createCustomStyleProfile(profile) {
        const customProfile = {
            ...profile,
            id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        this.styleProfiles.push(customProfile);
        return customProfile;
    }
    // Clear transfer history
    clearHistory() {
        this.transferHistory = [];
    }
    // Cleanup
    destroy() {
        this.transferCallbacks = [];
        this.progressCallbacks = [];
        this.clearHistory();
        this.isProcessing = false;
    }
}
// Singleton instance
export const aiStyleTransfer = new AIStyleTransfer();
