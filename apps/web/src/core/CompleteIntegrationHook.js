// Complete Integration Hook
// Provides complete integration between embroidery tools, vector tools, and 4K HD rendering
import { useEffect, useRef, useState } from 'react';
import { useApp } from '../App';
import { vectorStore } from '../vector/vectorState';
import { enhancedShirtIntegration } from './EnhancedShirtIntegration';
import { vectorEmbroideryIntegration } from './EnhancedVectorEmbroideryIntegration';
import { AIOptimizationSystem } from './AIOptimizationSystem';
// Complete Integration Hook
export function useCompleteIntegration(config) {
    const [state, setState] = useState({
        isInitialized: false,
        isActive: false,
        error: null,
        embroideryToolActive: false,
        vectorToolActive: false,
        currentStitchType: 'cross-stitch',
        currentVectorTool: 'pen',
        isRendering: false,
        isPreviewing: false,
        lastRenderTime: 0,
        performanceMetrics: {},
        optimizationScore: 0,
        currentQuality: 'high',
        hyperrealisticEnabled: false,
        realTimeOptimization: false
    });
    const canvasRef = useRef(null);
    const isInitializedRef = useRef(false);
    const performanceIntervalRef = useRef(null);
    // App state
    const activeTool = useApp(s => s.activeTool);
    const vectorMode = useApp(s => s.vectorMode);
    const embroideryStitchType = useApp(s => s.embroideryStitchType);
    const embroideryColor = useApp(s => s.embroideryColor);
    const embroideryThickness = useApp(s => s.embroideryThickness);
    const embroideryOpacity = useApp(s => s.embroideryOpacity);
    // Initialize integration
    useEffect(() => {
        if (isInitializedRef.current)
            return;
        const initializeIntegration = async () => {
            try {
                setState(prev => ({ ...prev, isInitialized: false, error: null }));
                // Get canvas from the app
                const canvas = document.querySelector('canvas');
                if (!canvas) {
                    throw new Error('Canvas not found');
                }
                canvasRef.current = canvas;
                // Initialize enhanced shirt integration
                const success = await enhancedShirtIntegration.initialize(canvas);
                if (!success) {
                    throw new Error('Enhanced shirt integration failed');
                }
                // Initialize vector-embroidery integration
                const vectorSuccess = await vectorEmbroideryIntegration.initialize(canvas);
                if (!vectorSuccess) {
                    throw new Error('Vector-embroidery integration failed');
                }
                // Start performance monitoring
                startPerformanceMonitoring();
                setState(prev => ({
                    ...prev,
                    isInitialized: true,
                    isActive: true,
                    error: null
                }));
                console.log('✅ Complete Integration initialized successfully');
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                setState(prev => ({
                    ...prev,
                    isInitialized: false,
                    isActive: false,
                    error: errorMessage
                }));
                console.error('❌ Complete Integration initialization failed:', errorMessage);
            }
        };
        initializeIntegration();
    }, []);
    // Handle tool changes
    useEffect(() => {
        if (!state.isInitialized)
            return;
        const handleToolChange = async () => {
            try {
                // Handle embroidery tool activation
                if (activeTool === 'embroidery' || activeTool === 'cross-stitch' ||
                    activeTool === 'satin' || activeTool === 'chain' || activeTool === 'fill') {
                    await enhancedShirtIntegration.handleEmbroideryToolActivation(activeTool);
                    setState(prev => ({
                        ...prev,
                        embroideryToolActive: true,
                        currentStitchType: activeTool
                    }));
                }
                else {
                    setState(prev => ({
                        ...prev,
                        embroideryToolActive: false
                    }));
                }
                // Handle vector tool activation
                if (vectorMode && (activeTool === 'pen' || activeTool === 'curvature' ||
                    activeTool === 'pathSelection' || activeTool === 'addAnchor' ||
                    activeTool === 'removeAnchor' || activeTool === 'convertAnchor')) {
                    await enhancedShirtIntegration.handleVectorToolActivation(activeTool);
                    setState(prev => ({
                        ...prev,
                        vectorToolActive: true,
                        currentVectorTool: activeTool
                    }));
                }
                else {
                    setState(prev => ({
                        ...prev,
                        vectorToolActive: false
                    }));
                }
            }
            catch (error) {
                console.error('Error handling tool change:', error);
            }
        };
        handleToolChange();
    }, [activeTool, vectorMode, state.isInitialized]);
    // Handle vector mode changes
    useEffect(() => {
        if (!state.isInitialized)
            return;
        const handleVectorModeChange = async () => {
            try {
                if (!vectorMode) {
                    // Vector mode disabled - cleanup and convert paths to stitches
                    await enhancedShirtIntegration.handleVectorModeExit();
                    setState(prev => ({
                        ...prev,
                        vectorToolActive: false,
                        currentVectorTool: ''
                    }));
                }
            }
            catch (error) {
                console.error('Error handling vector mode change:', error);
            }
        };
        handleVectorModeChange();
    }, [vectorMode, state.isInitialized]);
    // Handle vector store changes
    useEffect(() => {
        if (!state.isInitialized || !vectorMode)
            return;
        const handleVectorStoreChange = async () => {
            try {
                const st = vectorStore.getState();
                const currentPath = st.currentPath;
                if (currentPath && currentPath.points && currentPath.points.length > 0) {
                    // Handle pen tool point addition
                    if (activeTool === 'pen') {
                        const lastPoint = currentPath.points[currentPath.points.length - 1];
                        await enhancedShirtIntegration.handlePenToolPointAdded(lastPoint);
                    }
                    // Handle path completion
                    if (currentPath.closed || currentPath.points.length >= 2) {
                        await enhancedShirtIntegration.handlePathCompletion();
                    }
                }
            }
            catch (error) {
                console.error('Error handling vector store change:', error);
            }
        };
        // Listen to vector store changes
        const unsubscribe = vectorStore.subscribe(handleVectorStoreChange);
        return () => {
            unsubscribe();
        };
    }, [vectorMode, activeTool, state.isInitialized]);
    // Performance monitoring
    const startPerformanceMonitoring = () => {
        if (performanceIntervalRef.current) {
            clearInterval(performanceIntervalRef.current);
        }
        performanceIntervalRef.current = setInterval(() => {
            try {
                // Get performance metrics
                const metrics = enhancedShirtIntegration.getState();
                const aiOptimization = AIOptimizationSystem.getInstance();
                const optimizationScore = aiOptimization.getOptimizationScore();
                setState(prev => ({
                    ...prev,
                    performanceMetrics: metrics,
                    optimizationScore
                }));
            }
            catch (error) {
                console.error('Error updating performance metrics:', error);
            }
        }, 1000); // Update every second
    };
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (performanceIntervalRef.current) {
                clearInterval(performanceIntervalRef.current);
            }
        };
    }, []);
    // Public methods
    const setRenderingQuality = async (quality) => {
        try {
            // Update integration config
            enhancedShirtIntegration.updateConfig({ renderingQuality: quality });
            vectorEmbroideryIntegration.updateConfig({ quality });
            setState(prev => ({
                ...prev,
                currentQuality: quality
            }));
        }
        catch (error) {
            console.error('Error setting rendering quality:', error);
        }
    };
    const enableHyperrealisticRendering = async () => {
        try {
            // Update integration config
            enhancedShirtIntegration.updateConfig({
                renderingQuality: '4k',
                stitchQuality: 'hyperrealistic'
            });
            vectorEmbroideryIntegration.updateConfig({
                quality: '4k',
                superSampling: 4
            });
            setState(prev => ({
                ...prev,
                hyperrealisticEnabled: true,
                currentQuality: '4k'
            }));
        }
        catch (error) {
            console.error('Error enabling hyperrealistic rendering:', error);
        }
    };
    const disableHyperrealisticRendering = async () => {
        try {
            // Update integration config
            enhancedShirtIntegration.updateConfig({
                renderingQuality: 'high',
                stitchQuality: 'photorealistic'
            });
            vectorEmbroideryIntegration.updateConfig({
                quality: 'high',
                superSampling: 2
            });
            setState(prev => ({
                ...prev,
                hyperrealisticEnabled: false,
                currentQuality: 'high'
            }));
        }
        catch (error) {
            console.error('Error disabling hyperrealistic rendering:', error);
        }
    };
    const optimizePerformance = async () => {
        try {
            const aiOptimization = AIOptimizationSystem.getInstance();
            await aiOptimization.optimizeMemory();
            setState(prev => ({
                ...prev,
                realTimeOptimization: true
            }));
        }
        catch (error) {
            console.error('Error optimizing performance:', error);
        }
    };
    const getSystemHealth = () => {
        try {
            const aiOptimization = AIOptimizationSystem.getInstance();
            return aiOptimization.getCurrentMetrics();
        }
        catch (error) {
            console.error('Error getting system health:', error);
            return null;
        }
    };
    const getIntegrationStatus = () => {
        return {
            isInitialized: state.isInitialized,
            isActive: state.isActive,
            error: state.error,
            systems: {
                enhancedShirt: enhancedShirtIntegration.getState().isIntegrated,
                vectorEmbroidery: vectorEmbroideryIntegration.getState().isActive,
                aiOptimization: true
            },
            performance: {
                optimizationScore: state.optimizationScore,
                lastRenderTime: state.lastRenderTime,
                isRendering: state.isRendering
            },
            quality: {
                currentQuality: state.currentQuality,
                hyperrealisticEnabled: state.hyperrealisticEnabled,
                realTimeOptimization: state.realTimeOptimization
            }
        };
    };
    return {
        // State
        ...state,
        // Methods
        setRenderingQuality,
        enableHyperrealisticRendering,
        disableHyperrealisticRendering,
        optimizePerformance,
        getSystemHealth,
        getIntegrationStatus
    };
}
// Export hook
export default useCompleteIntegration;
