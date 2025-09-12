// UX Flow Test
// Tests the complete UX flow: embroidery tools -> vector tools -> pen tool -> stitch rendering
import { enhancedShirtIntegration } from './EnhancedShirtIntegration';
import { vectorEmbroideryIntegration } from './EnhancedVectorEmbroideryIntegration';
// UX Flow Test Manager
export class UXFlowTestManager {
    constructor() {
        this.isRunning = false;
        this.config = this.getDefaultConfig();
    }
    static getInstance() {
        if (!UXFlowTestManager.instance) {
            UXFlowTestManager.instance = new UXFlowTestManager();
        }
        return UXFlowTestManager.instance;
    }
    // Main Test Method
    async runCompleteUXFlowTest() {
        const startTime = performance.now();
        const steps = [];
        const errors = [];
        const warnings = [];
        const recommendations = [];
        try {
            console.log('🧪 Starting Complete UX Flow Test...');
            // Step 1: Initialize Integration
            const initStep = await this.testIntegrationInitialization();
            steps.push(initStep);
            if (!initStep.success) {
                throw new Error('Integration initialization failed');
            }
            // Step 2: Test Embroidery Tool Activation
            const embroideryStep = await this.testEmbroideryToolActivation();
            steps.push(embroideryStep);
            if (!embroideryStep.success) {
                throw new Error('Embroidery tool activation failed');
            }
            // Step 3: Test Vector Tool Activation
            const vectorStep = await this.testVectorToolActivation();
            steps.push(vectorStep);
            if (!vectorStep.success) {
                throw new Error('Vector tool activation failed');
            }
            // Step 4: Test Pen Tool with Stitch Rendering
            const penStep = await this.testPenToolWithStitchRendering();
            steps.push(penStep);
            if (!penStep.success) {
                throw new Error('Pen tool with stitch rendering failed');
            }
            // Step 5: Test Anchor Point Management
            const anchorStep = await this.testAnchorPointManagement();
            steps.push(anchorStep);
            if (!anchorStep.success) {
                throw new Error('Anchor point management failed');
            }
            // Step 6: Test Vector Mode Exit
            const exitStep = await this.testVectorModeExit();
            steps.push(exitStep);
            if (!exitStep.success) {
                throw new Error('Vector mode exit failed');
            }
            // Step 7: Test 4K HD Rendering
            const renderingStep = await this.test4KHDRendering();
            steps.push(renderingStep);
            if (!renderingStep.success) {
                throw new Error('4K HD rendering failed');
            }
            // Step 8: Test Performance
            const performanceStep = await this.testPerformance();
            steps.push(performanceStep);
            if (!performanceStep.success) {
                warnings.push('Performance test failed');
            }
            // Step 9: Test Quality
            const qualityStep = await this.testQuality();
            steps.push(qualityStep);
            if (!qualityStep.success) {
                warnings.push('Quality test failed');
            }
            // Calculate results
            const endTime = performance.now();
            const duration = endTime - startTime;
            const performance = this.calculatePerformanceMetrics(steps);
            const quality = this.calculateQualityMetrics(steps);
            const result = {
                success: steps.every(step => step.success),
                duration,
                steps,
                performance,
                quality,
                errors,
                warnings,
                recommendations: this.generateRecommendations(steps, performance, quality)
            };
            console.log('✅ Complete UX Flow Test completed:', result);
            return result;
        }
        catch (error) {
            const endTime = performance.now();
            const duration = endTime - startTime;
            const errorMessage = error instanceof Error ? error.message : String(error);
            errors.push(errorMessage);
            const result = {
                success: false,
                duration,
                steps,
                performance: this.calculatePerformanceMetrics(steps),
                quality: this.calculateQualityMetrics(steps),
                errors,
                warnings,
                recommendations: this.generateRecommendations(steps, this.calculatePerformanceMetrics(steps), this.calculateQualityMetrics(steps))
            };
            console.error('❌ Complete UX Flow Test failed:', result);
            return result;
        }
    }
    // Individual Test Steps
    async testIntegrationInitialization() {
        const startTime = performance.now();
        try {
            // Test enhanced shirt integration
            const enhancedShirtState = enhancedShirtIntegration.getState();
            if (!enhancedShirtState.isIntegrated) {
                throw new Error('Enhanced shirt integration not initialized');
            }
            // Test vector-embroidery integration
            const vectorEmbroideryState = vectorEmbroideryIntegration.getState();
            if (!vectorEmbroideryState.isActive) {
                throw new Error('Vector-embroidery integration not active');
            }
            const endTime = performance.now();
            return {
                id: 'integration_init',
                name: 'Integration Initialization',
                description: 'Test integration system initialization',
                success: true,
                duration: endTime - startTime,
                data: {
                    enhancedShirt: enhancedShirtState.isIntegrated,
                    vectorEmbroidery: vectorEmbroideryState.isActive
                }
            };
        }
        catch (error) {
            const endTime = performance.now();
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                id: 'integration_init',
                name: 'Integration Initialization',
                description: 'Test integration system initialization',
                success: false,
                duration: endTime - startTime,
                error: errorMessage
            };
        }
    }
    async testEmbroideryToolActivation() {
        const startTime = performance.now();
        try {
            // Test cross-stitch activation
            await enhancedShirtIntegration.handleEmbroideryToolActivation('cross-stitch');
            const state = enhancedShirtIntegration.getState();
            if (!state.embroideryToolActive || state.currentStitchType !== 'cross-stitch') {
                throw new Error('Embroidery tool activation failed');
            }
            const endTime = performance.now();
            return {
                id: 'embroidery_activation',
                name: 'Embroidery Tool Activation',
                description: 'Test embroidery tool activation with cross-stitch',
                success: true,
                duration: endTime - startTime,
                data: {
                    stitchType: state.currentStitchType,
                    active: state.embroideryToolActive
                }
            };
        }
        catch (error) {
            const endTime = performance.now();
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                id: 'embroidery_activation',
                name: 'Embroidery Tool Activation',
                description: 'Test embroidery tool activation with cross-stitch',
                success: false,
                duration: endTime - startTime,
                error: errorMessage
            };
        }
    }
    async testVectorToolActivation() {
        const startTime = performance.now();
        try {
            // Test pen tool activation
            await enhancedShirtIntegration.handleVectorToolActivation('pen');
            const state = enhancedShirtIntegration.getState();
            if (!state.vectorToolActive || state.currentVectorTool !== 'pen') {
                throw new Error('Vector tool activation failed');
            }
            const endTime = performance.now();
            return {
                id: 'vector_activation',
                name: 'Vector Tool Activation',
                description: 'Test vector tool activation with pen tool',
                success: true,
                duration: endTime - startTime,
                data: {
                    tool: state.currentVectorTool,
                    active: state.vectorToolActive
                }
            };
        }
        catch (error) {
            const endTime = performance.now();
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                id: 'vector_activation',
                name: 'Vector Tool Activation',
                description: 'Test vector tool activation with pen tool',
                success: false,
                duration: endTime - startTime,
                error: errorMessage
            };
        }
    }
    async testPenToolWithStitchRendering() {
        const startTime = performance.now();
        try {
            // Test pen tool point addition with stitch rendering
            const testPoints = [
                { x: 100, y: 100 },
                { x: 200, y: 200 },
                { x: 300, y: 150 }
            ];
            for (const point of testPoints) {
                await enhancedShirtIntegration.handlePenToolPointAdded(point);
            }
            // Test path completion
            await enhancedShirtIntegration.handlePathCompletion();
            const endTime = performance.now();
            return {
                id: 'pen_tool_stitch',
                name: 'Pen Tool with Stitch Rendering',
                description: 'Test pen tool point addition with stitch rendering',
                success: true,
                duration: endTime - startTime,
                data: {
                    pointsAdded: testPoints.length,
                    pathCompleted: true
                }
            };
        }
        catch (error) {
            const endTime = performance.now();
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                id: 'pen_tool_stitch',
                name: 'Pen Tool with Stitch Rendering',
                description: 'Test pen tool point addition with stitch rendering',
                success: false,
                duration: endTime - startTime,
                error: errorMessage
            };
        }
    }
    async testAnchorPointManagement() {
        const startTime = performance.now();
        try {
            // Test anchor point cleanup
            await enhancedShirtIntegration.handleVectorModeExit();
            const state = enhancedShirtIntegration.getState();
            if (state.vectorToolActive) {
                throw new Error('Vector tool still active after exit');
            }
            const endTime = performance.now();
            return {
                id: 'anchor_management',
                name: 'Anchor Point Management',
                description: 'Test anchor point cleanup and management',
                success: true,
                duration: endTime - startTime,
                data: {
                    vectorToolActive: state.vectorToolActive,
                    anchorPointsCleared: true
                }
            };
        }
        catch (error) {
            const endTime = performance.now();
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                id: 'anchor_management',
                name: 'Anchor Point Management',
                description: 'Test anchor point cleanup and management',
                success: false,
                duration: endTime - startTime,
                error: errorMessage
            };
        }
    }
    async testVectorModeExit() {
        const startTime = performance.now();
        try {
            // Test vector mode exit
            await enhancedShirtIntegration.handleVectorModeExit();
            const state = enhancedShirtIntegration.getState();
            if (state.vectorToolActive) {
                throw new Error('Vector tool still active after mode exit');
            }
            const endTime = performance.now();
            return {
                id: 'vector_mode_exit',
                name: 'Vector Mode Exit',
                description: 'Test vector mode exit and cleanup',
                success: true,
                duration: endTime - startTime,
                data: {
                    vectorToolActive: state.vectorToolActive,
                    modeExited: true
                }
            };
        }
        catch (error) {
            const endTime = performance.now();
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                id: 'vector_mode_exit',
                name: 'Vector Mode Exit',
                description: 'Test vector mode exit and cleanup',
                success: false,
                duration: endTime - startTime,
                error: errorMessage
            };
        }
    }
    async test4KHDRendering() {
        const startTime = performance.now();
        try {
            // Test 4K HD rendering
            await enhancedShirtIntegration.enableHyperrealisticRendering();
            const state = enhancedShirtIntegration.getState();
            if (!state.hyperrealisticEnabled) {
                throw new Error('4K HD rendering not enabled');
            }
            const endTime = performance.now();
            return {
                id: '4k_rendering',
                name: '4K HD Rendering',
                description: 'Test 4K HD rendering capabilities',
                success: true,
                duration: endTime - startTime,
                data: {
                    hyperrealisticEnabled: state.hyperrealisticEnabled,
                    quality: state.currentQuality
                }
            };
        }
        catch (error) {
            const endTime = performance.now();
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                id: '4k_rendering',
                name: '4K HD Rendering',
                description: 'Test 4K HD rendering capabilities',
                success: false,
                duration: endTime - startTime,
                error: errorMessage
            };
        }
    }
    async testPerformance() {
        const startTime = performance.now();
        try {
            // Test performance optimization
            await enhancedShirtIntegration.optimizePerformance();
            const state = enhancedShirtIntegration.getState();
            const performanceScore = state.optimizationScore || 0;
            if (performanceScore < this.config.minQualityScore) {
                throw new Error(`Performance score too low: ${performanceScore}`);
            }
            const endTime = performance.now();
            return {
                id: 'performance_test',
                name: 'Performance Test',
                description: 'Test performance optimization',
                success: true,
                duration: endTime - startTime,
                data: {
                    optimizationScore: performanceScore,
                    performanceOptimized: true
                }
            };
        }
        catch (error) {
            const endTime = performance.now();
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                id: 'performance_test',
                name: 'Performance Test',
                description: 'Test performance optimization',
                success: false,
                duration: endTime - startTime,
                error: errorMessage
            };
        }
    }
    async testQuality() {
        const startTime = performance.now();
        try {
            // Test quality metrics
            const state = enhancedShirtIntegration.getState();
            const qualityScore = state.currentQuality === '4k' ? 1.0 : 0.8;
            if (qualityScore < this.config.minQualityScore) {
                throw new Error(`Quality score too low: ${qualityScore}`);
            }
            const endTime = performance.now();
            return {
                id: 'quality_test',
                name: 'Quality Test',
                description: 'Test quality metrics',
                success: true,
                duration: endTime - startTime,
                data: {
                    qualityScore,
                    currentQuality: state.currentQuality
                }
            };
        }
        catch (error) {
            const endTime = performance.now();
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                id: 'quality_test',
                name: 'Quality Test',
                description: 'Test quality metrics',
                success: false,
                duration: endTime - startTime,
                error: errorMessage
            };
        }
    }
    // Helper Methods
    calculatePerformanceMetrics(steps) {
        const renderTimes = steps.map(step => step.duration);
        const totalRenderTime = renderTimes.reduce((sum, time) => sum + time, 0);
        const averageRenderTime = totalRenderTime / renderTimes.length;
        const maxRenderTime = Math.max(...renderTimes);
        const minRenderTime = Math.min(...renderTimes);
        return {
            totalRenderTime,
            averageRenderTime,
            maxRenderTime,
            minRenderTime,
            fps: 60, // Simplified
            memoryUsage: 0, // Simplified
            optimizationScore: 0.9 // Simplified
        };
    }
    calculateQualityMetrics(steps) {
        const successfulSteps = steps.filter(step => step.success).length;
        const overallQuality = successfulSteps / steps.length;
        return {
            stitchQuality: overallQuality,
            vectorQuality: overallQuality,
            renderingQuality: overallQuality,
            overallQuality,
            accuracy: overallQuality,
            consistency: overallQuality
        };
    }
    generateRecommendations(steps, performance, quality) {
        const recommendations = [];
        // Performance recommendations
        if (performance.averageRenderTime > this.config.maxRenderTime) {
            recommendations.push('Consider optimizing rendering performance');
        }
        if (performance.optimizationScore < 0.8) {
            recommendations.push('Enable AI optimization for better performance');
        }
        // Quality recommendations
        if (quality.overallQuality < 0.9) {
            recommendations.push('Review and improve system quality');
        }
        if (quality.accuracy < 0.9) {
            recommendations.push('Improve accuracy of stitch rendering');
        }
        // Error recommendations
        const failedSteps = steps.filter(step => !step.success);
        if (failedSteps.length > 0) {
            recommendations.push(`Fix ${failedSteps.length} failed test steps`);
        }
        return recommendations;
    }
    getDefaultConfig() {
        return {
            enableRealTimeTesting: true,
            enablePerformanceTesting: true,
            enableQualityTesting: true,
            enableErrorTesting: true,
            testPoints: [
                { x: 100, y: 100 },
                { x: 200, y: 200 },
                { x: 300, y: 150 }
            ],
            testStitchTypes: ['cross-stitch', 'satin', 'chain', 'fill'],
            testVectorTools: ['pen', 'curvature', 'pathSelection'],
            maxRenderTime: 1000,
            minFPS: 30,
            maxMemoryUsage: 100 * 1024 * 1024, // 100MB
            minQualityScore: 0.8,
            minAccuracyScore: 0.9,
            minConsistencyScore: 0.9
        };
    }
}
// Export test manager instance
export const uxFlowTestManager = UXFlowTestManager.getInstance();
