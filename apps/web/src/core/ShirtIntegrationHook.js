// Shirt Integration Hook
// React hook for integrating core systems with Shirt component
import { useEffect, useRef, useState } from 'react';
import { integrationManager } from './IntegrationScript';
import { systemIntegration } from './SystemIntegration';
import { errorHandling } from './ErrorHandling';
// React Hook for Shirt Integration
export function useShirtIntegration(options = {}) {
    const [state, setState] = useState({
        isInitialized: false,
        isInitializing: false,
        error: null,
        systems: {
            universalTools: false,
            advancedStitches: false,
            aiOptimization: false,
            pluginSystem: false,
            errorHandling: false,
            testing: false
        },
        performance: {
            fps: 60,
            memoryUsage: 0,
            optimizationScore: 0
        },
        quality: {
            currentQuality: 'high',
            hyperrealisticEnabled: false,
            realTimeOptimization: false
        }
    });
    const isInitializedRef = useRef(false);
    const performanceIntervalRef = useRef(null);
    // Initialize integration
    useEffect(() => {
        if (isInitializedRef.current)
            return;
        const initializeIntegration = async () => {
            try {
                setState(prev => ({ ...prev, isInitializing: true, error: null }));
                // Initialize integration
                const result = await integrationManager.integrate({
                    enableUniversalTools: options.enableUniversalTools ?? true,
                    enableAdvancedStitches: options.enableAdvancedStitches ?? true,
                    enableAIOptimization: options.enableAIOptimization ?? true,
                    enablePluginSystem: options.enablePluginSystem ?? true,
                    renderingQuality: options.renderingQuality ?? 'high',
                    hyperrealisticRendering: options.hyperrealisticRendering ?? false,
                    realTimeOptimization: options.realTimeOptimization ?? true,
                    maxMemoryUsage: options.maxMemoryUsage ?? 512,
                    targetFPS: options.targetFPS ?? 60,
                    optimizationLevel: options.optimizationLevel ?? 'high',
                    aiLearningEnabled: options.aiLearningEnabled ?? true,
                    aiOptimizationEnabled: options.aiOptimizationEnabled ?? true,
                    aiQualityEnhancement: options.aiQualityEnhancement ?? true,
                    debugMode: options.debugMode ?? process.env.NODE_ENV === 'development',
                    verboseLogging: options.verboseLogging ?? process.env.NODE_ENV === 'development'
                });
                if (result.success) {
                    setState(prev => ({
                        ...prev,
                        isInitialized: true,
                        isInitializing: false,
                        systems: result.systems,
                        error: null
                    }));
                    isInitializedRef.current = true;
                    if (options.debugMode) {
                        console.log('✅ Shirt Integration initialized successfully');
                    }
                }
                else {
                    throw new Error('Integration failed');
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                setState(prev => ({
                    ...prev,
                    isInitialized: false,
                    isInitializing: false,
                    error: errorMessage
                }));
                console.error('❌ Shirt Integration failed:', errorMessage);
            }
        };
        initializeIntegration();
    }, []);
    // Start performance monitoring
    useEffect(() => {
        if (!state.isInitialized)
            return;
        const startPerformanceMonitoring = () => {
            performanceIntervalRef.current = setInterval(() => {
                try {
                    const metrics = systemIntegration.getPerformanceMetrics();
                    const status = systemIntegration.getStatus();
                    setState(prev => ({
                        ...prev,
                        performance: {
                            fps: metrics.fps || 60,
                            memoryUsage: metrics.memoryUsage || 0,
                            optimizationScore: metrics.optimizationScore || 0
                        },
                        quality: {
                            currentQuality: status.quality.currentQuality,
                            hyperrealisticEnabled: status.quality.hyperrealisticEnabled,
                            realTimeOptimization: status.quality.realTimeOptimization
                        }
                    }));
                }
                catch (error) {
                    console.error('Error updating performance metrics:', error);
                }
            }, 1000); // Update every second
        };
        startPerformanceMonitoring();
        return () => {
            if (performanceIntervalRef.current) {
                clearInterval(performanceIntervalRef.current);
            }
        };
    }, [state.isInitialized]);
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
            await systemIntegration.setRenderingQuality(quality);
            setState(prev => ({
                ...prev,
                quality: { ...prev.quality, currentQuality: quality }
            }));
        }
        catch (error) {
            console.error('Error setting rendering quality:', error);
        }
    };
    const enableHyperrealisticRendering = async () => {
        try {
            await systemIntegration.enableHyperrealisticRendering();
            setState(prev => ({
                ...prev,
                quality: { ...prev.quality, hyperrealisticEnabled: true }
            }));
        }
        catch (error) {
            console.error('Error enabling hyperrealistic rendering:', error);
        }
    };
    const disableHyperrealisticRendering = async () => {
        try {
            await systemIntegration.disableHyperrealisticRendering();
            setState(prev => ({
                ...prev,
                quality: { ...prev.quality, hyperrealisticEnabled: false }
            }));
        }
        catch (error) {
            console.error('Error disabling hyperrealistic rendering:', error);
        }
    };
    const optimizePerformance = async () => {
        try {
            await systemIntegration.optimizePerformance();
        }
        catch (error) {
            console.error('Error optimizing performance:', error);
        }
    };
    const getSystemHealth = () => {
        return errorHandling.getSystemHealth();
    };
    const getIntegrationResult = () => {
        return integrationManager.getResult();
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
        getIntegrationResult
    };
}
// Export hook
export default useShirtIntegration;
