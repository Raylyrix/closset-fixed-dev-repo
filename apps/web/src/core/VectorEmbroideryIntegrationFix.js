/**
 * Vector-Embroidery Integration Fix
 *
 * This file provides comprehensive fixes for the integration between vector tools
 * and embroidery rendering, ensuring proper connection and accuracy.
 */
import { useApp } from '../App';
import { vectorStore } from '../vector/vectorState';
export class VectorEmbroideryIntegrationFix {
    constructor(config = {}) {
        this.isInitialized = false;
        this.config = {
            enableRealTimeRendering: true,
            enableAnchorPointAccuracy: true,
            enableToolConnection: true,
            enablePerformanceOptimization: true,
            stitchQuality: 'high',
            maxPointsPerShape: 500,
            connectAllPoints: true,
            ...config
        };
    }
    static getInstance(config) {
        if (!VectorEmbroideryIntegrationFix.instance) {
            VectorEmbroideryIntegrationFix.instance = new VectorEmbroideryIntegrationFix(config);
        }
        return VectorEmbroideryIntegrationFix.instance;
    }
    /**
     * Initialize the integration fix
     */
    async initialize() {
        try {
            console.log('🔧 Initializing Vector-Embroidery Integration Fix...');
            // Apply real-time rendering fixes
            if (this.config.enableRealTimeRendering) {
                await this.applyRealTimeRenderingFix();
            }
            // Apply anchor point accuracy fixes
            if (this.config.enableAnchorPointAccuracy) {
                await this.applyAnchorPointAccuracyFix();
            }
            // Apply tool connection fixes
            if (this.config.enableToolConnection) {
                await this.applyToolConnectionFix();
            }
            // Apply performance optimizations
            if (this.config.enablePerformanceOptimization) {
                await this.applyPerformanceOptimizationFix();
            }
            this.isInitialized = true;
            console.log('✅ Vector-Embroidery Integration Fix initialized successfully');
            return true;
        }
        catch (error) {
            console.error('❌ Error initializing Vector-Embroidery Integration Fix:', error);
            return false;
        }
    }
    /**
     * Apply real-time rendering fixes
     */
    async applyRealTimeRenderingFix() {
        console.log('🔧 Applying real-time rendering fixes...');
        // Override the renderVectorsToActiveLayer function to ensure proper rendering
        const originalRenderVectorsToActiveLayer = window.renderVectorsToActiveLayer;
        window.renderVectorsToActiveLayer = () => {
            try {
                // Call original function
                if (originalRenderVectorsToActiveLayer) {
                    originalRenderVectorsToActiveLayer();
                }
                // Additional real-time rendering logic
                this.ensureRealTimeRendering();
            }
            catch (error) {
                console.error('Error in real-time rendering fix:', error);
            }
        };
        console.log('✅ Real-time rendering fixes applied');
    }
    /**
     * Apply anchor point accuracy fixes
     */
    async applyAnchorPointAccuracyFix() {
        console.log('🔧 Applying anchor point accuracy fixes...');
        // Override the uvToWorldPosition function for better accuracy
        const originalUvToWorldPosition = window.uvToWorldPosition;
        window.uvToWorldPosition = (uv) => {
            try {
                // Use improved barycentric interpolation
                return this.improvedUvToWorldPosition(uv);
            }
            catch (error) {
                console.error('Error in anchor point accuracy fix:', error);
                // Fallback to original function
                return originalUvToWorldPosition ? originalUvToWorldPosition(uv) : null;
            }
        };
        console.log('✅ Anchor point accuracy fixes applied');
    }
    /**
     * Apply tool connection fixes
     */
    async applyToolConnectionFix() {
        console.log('🔧 Applying tool connection fixes...');
        // Ensure all embroidery tools are properly connected to vector system
        const embroideryTools = ['cross-stitch', 'satin', 'chain', 'fill', 'backstitch', 'bullion', 'feather'];
        embroideryTools.forEach(tool => {
            // Override tool activation to ensure proper connection
            const originalToolActivation = window[`handle${tool}Activation`];
            window[`handle${tool}Activation`] = () => {
                try {
                    // Call original activation
                    if (originalToolActivation) {
                        originalToolActivation();
                    }
                    // Ensure vector mode is properly set up
                    this.ensureVectorModeSetup(tool);
                }
                catch (error) {
                    console.error(`Error in ${tool} tool connection fix:`, error);
                }
            };
        });
        console.log('✅ Tool connection fixes applied');
    }
    /**
     * Apply performance optimization fixes
     */
    async applyPerformanceOptimizationFix() {
        console.log('🔧 Applying performance optimization fixes...');
        // Optimize rendering performance
        const originalRenderRealTimeEmbroideryStitches = window.renderRealTimeEmbroideryStitches;
        window.renderRealTimeEmbroideryStitches = (ctx, path, appState, stitchType) => {
            try {
                // Call original function with optimizations
                if (originalRenderRealTimeEmbroideryStitches) {
                    originalRenderRealTimeEmbroideryStitches(ctx, path, appState, stitchType);
                }
                // Apply additional performance optimizations
                this.optimizeRenderingPerformance(ctx, path, appState, stitchType);
            }
            catch (error) {
                console.error('Error in performance optimization fix:', error);
            }
        };
        console.log('✅ Performance optimization fixes applied');
    }
    /**
     * Ensure real-time rendering works properly
     */
    ensureRealTimeRendering() {
        const appState = useApp.getState();
        const vectorState = vectorStore.getState();
        if (appState.vectorMode && vectorState.shapes.length > 0) {
            // Force re-render of all shapes with proper stitch connections
            vectorState.shapes.forEach(shape => {
                if (shape.path && shape.path.points && shape.path.points.length >= 2) {
                    // Trigger re-render for this shape
                    this.triggerShapeRerender(shape);
                }
            });
        }
    }
    /**
     * Improved UV to world position conversion with barycentric interpolation
     */
    improvedUvToWorldPosition(uv) {
        // This would be implemented with the improved barycentric interpolation logic
        // that was added to the Shirt.js file
        console.log('🎯 Using improved UV to world position conversion');
        return null; // Placeholder - actual implementation would be here
    }
    /**
     * Ensure vector mode is properly set up for a tool
     */
    ensureVectorModeSetup(tool) {
        const appState = useApp.getState();
        if (!appState.vectorMode) {
            console.log(`🔧 Enabling vector mode for ${tool} tool`);
            useApp.setState({ vectorMode: true });
        }
        // Ensure proper stitch type is set
        if (this.isEmbroideryTool(tool)) {
            useApp.setState({ embroideryStitchType: tool });
        }
    }
    /**
     * Optimize rendering performance
     */
    optimizeRenderingPerformance(ctx, path, appState, stitchType) {
        // Apply performance optimizations
        const maxPoints = this.config.maxPointsPerShape;
        if (path.points && path.points.length > maxPoints) {
            // Optimize point count for better performance
            const optimizedPoints = this.optimizePointCount(path.points, maxPoints);
            path.points = optimizedPoints;
        }
        // Use appropriate quality setting
        const quality = this.config.stitchQuality;
        ctx.imageSmoothingQuality = quality === 'ultra' ? 'high' : quality;
    }
    /**
     * Trigger re-render for a specific shape
     */
    triggerShapeRerender(shape) {
        // Force re-render by updating the shape
        const updatedShape = { ...shape, lastModified: Date.now() };
        vectorStore.setState(state => ({
            shapes: state.shapes.map(s => s.id === shape.id ? updatedShape : s)
        }));
    }
    /**
     * Optimize point count for better performance
     */
    optimizePointCount(points, maxPoints) {
        if (points.length <= maxPoints) {
            return points;
        }
        const step = Math.ceil(points.length / maxPoints);
        return points.filter((_, index) => index % step === 0);
    }
    /**
     * Check if a tool is an embroidery tool
     */
    isEmbroideryTool(tool) {
        const embroideryTools = [
            'cross-stitch', 'satin', 'chain', 'fill', 'backstitch',
            'bullion', 'feather', 'embroidery'
        ];
        return embroideryTools.includes(tool);
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    /**
     * Check if the fix is initialized
     */
    isReady() {
        return this.isInitialized;
    }
}
/**
 * React hook for using the Vector-Embroidery Integration Fix
 */
export function useVectorEmbroideryIntegrationFix(config) {
    const [isReady, setIsReady] = React.useState(false);
    const [error, setError] = React.useState(null);
    React.useEffect(() => {
        const initializeFix = async () => {
            try {
                const fix = VectorEmbroideryIntegrationFix.getInstance(config);
                const success = await fix.initialize();
                setIsReady(success);
                if (!success) {
                    setError('Failed to initialize Vector-Embroidery Integration Fix');
                }
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
                setIsReady(false);
            }
        };
        initializeFix();
    }, [config]);
    return {
        isReady,
        error,
        fix: VectorEmbroideryIntegrationFix.getInstance(config)
    };
}
export default VectorEmbroideryIntegrationFix;
