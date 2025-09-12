// Integration Script
// Main script to integrate all core systems with existing codebase

import { systemIntegration } from './SystemIntegration';
import { errorHandling } from './ErrorHandling';
import { testingFramework } from './TestingFramework';
import { registerCoreSystemTests } from './CoreSystemTests';

export interface IntegrationOptions {
  // Core systems
  enableUniversalTools: boolean;
  enableAdvancedStitches: boolean;
  enableAIOptimization: boolean;
  enablePluginSystem: boolean;
  
  // Quality settings
  renderingQuality: 'draft' | 'normal' | 'high' | 'ultra' | '4k';
  hyperrealisticRendering: boolean;
  realTimeOptimization: boolean;
  
  // Performance settings
  maxMemoryUsage: number;
  targetFPS: number;
  optimizationLevel: 'low' | 'medium' | 'high' | 'ultra';
  
  // AI settings
  aiLearningEnabled: boolean;
  aiOptimizationEnabled: boolean;
  aiQualityEnhancement: boolean;
  
  // Integration settings
  preserveExistingFunctionality: boolean;
  enableGradualMigration: boolean;
  enablePerformanceMonitoring: boolean;
  enableErrorHandling: boolean;
  enableTesting: boolean;
  
  // Debug settings
  debugMode: boolean;
  verboseLogging: boolean;
  enableMetrics: boolean;
}

export interface IntegrationResult {
  success: boolean;
  duration: number;
  systems: {
    universalTools: boolean;
    advancedStitches: boolean;
    aiOptimization: boolean;
    pluginSystem: boolean;
    errorHandling: boolean;
    testing: boolean;
  };
  errors: string[];
  warnings: string[];
  recommendations: string[];
  metrics: any;
}

// Integration Manager
export class IntegrationManager {
  private static instance: IntegrationManager;
  private isInitialized: boolean = false;
  private options: IntegrationOptions;
  private result: IntegrationResult | null = null;
  
  // Event system
  private eventListeners: Map<string, Function[]> = new Map();
  
  private constructor() {
    this.options = this.getDefaultOptions();
  }
  
  public static getInstance(): IntegrationManager {
    if (!IntegrationManager.instance) {
      IntegrationManager.instance = new IntegrationManager();
    }
    return IntegrationManager.instance;
  }
  
  // Main Integration Method
  public async integrate(options?: Partial<IntegrationOptions>): Promise<IntegrationResult> {
    const startTime = performance.now();
    
    try {
      console.log('🚀 Starting Core Systems Integration...');
      
      // Update options
      if (options) {
        this.options = { ...this.options, ...options };
      }
      
      // Initialize result
      this.result = {
        success: false,
        duration: 0,
        systems: {
          universalTools: false,
          advancedStitches: false,
          aiOptimization: false,
          pluginSystem: false,
          errorHandling: false,
          testing: false
        },
        errors: [],
        warnings: [],
        recommendations: [],
        metrics: {}
      };
      
      // Step 1: Initialize Error Handling
      if (this.options.enableErrorHandling) {
        await this.initializeErrorHandling();
      }
      
      // Step 2: Initialize Core Systems
      await this.initializeCoreSystems();
      
      // Step 3: Initialize Testing Framework
      if (this.options.enableTesting) {
        await this.initializeTesting();
      }
      
      // Step 4: Run Integration Tests
      if (this.options.enableTesting) {
        await this.runIntegrationTests();
      }
      
      // Step 5: Start Performance Monitoring
      if (this.options.enablePerformanceMonitoring) {
        await this.startPerformanceMonitoring();
      }
      
      // Step 6: Finalize Integration
      await this.finalizeIntegration();
      
      const endTime = performance.now();
      this.result.duration = endTime - startTime;
      this.result.success = true;
      
      console.log('✅ Core Systems Integration completed successfully');
      
      // Emit success event
      this.emit('integrationCompleted', { result: this.result });
      
      return this.result;
      
    } catch (error) {
      const endTime = performance.now();
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      console.error('❌ Core Systems Integration failed:', errorMessage);
      
      if (this.result) {
        this.result.duration = endTime - startTime;
        this.result.success = false;
        this.result.errors.push(errorMessage);
      }
      
      // Emit error event
      this.emit('integrationFailed', { error: errorMessage, result: this.result });
      
      throw error;
    }
  }
  
  // System Initialization
  private async initializeErrorHandling(): Promise<void> {
    try {
      console.log('🔧 Initializing Error Handling System...');
      
      // Error handling is already initialized as a singleton
      this.result!.systems.errorHandling = true;
      
      console.log('✅ Error Handling System initialized');
      
    } catch (error) {
      const errorMessage = `Error handling initialization failed: ${error}`;
      console.error(errorMessage);
      this.result!.errors.push(errorMessage);
      throw error;
    }
  }
  
  private async initializeCoreSystems(): Promise<void> {
    try {
      console.log('🔧 Initializing Core Systems...');
      
      // Initialize system integration
      const success = await systemIntegration.initialize({
        enableUniversalTools: this.options.enableUniversalTools,
        enableAdvancedStitches: this.options.enableAdvancedStitches,
        enableAIOptimization: this.options.enableAIOptimization,
        enablePluginSystem: this.options.enablePluginSystem,
        renderingQuality: this.options.renderingQuality,
        hyperrealisticRendering: this.options.hyperrealisticRendering,
        realTimeOptimization: this.options.realTimeOptimization,
        maxMemoryUsage: this.options.maxMemoryUsage,
        targetFPS: this.options.targetFPS,
        optimizationLevel: this.options.optimizationLevel,
        aiLearningEnabled: this.options.aiLearningEnabled,
        aiOptimizationEnabled: this.options.aiOptimizationEnabled,
        aiQualityEnhancement: this.options.aiQualityEnhancement
      });
      
      if (!success) {
        throw new Error('System integration initialization failed');
      }
      
      // Update system status
      const status = systemIntegration.getStatus();
      this.result!.systems.universalTools = status.systems.universalTools;
      this.result!.systems.advancedStitches = status.systems.advancedStitches;
      this.result!.systems.aiOptimization = status.systems.aiOptimization;
      this.result!.systems.pluginSystem = status.systems.pluginSystem;
      
      console.log('✅ Core Systems initialized');
      
    } catch (error) {
      const errorMessage = `Core systems initialization failed: ${error}`;
      console.error(errorMessage);
      this.result!.errors.push(errorMessage);
      throw error;
    }
  }
  
  private async initializeTesting(): Promise<void> {
    try {
      console.log('🧪 Initializing Testing Framework...');
      
      // Register test cases
      registerCoreSystemTests();
      
      this.result!.systems.testing = true;
      
      console.log('✅ Testing Framework initialized');
      
    } catch (error) {
      const errorMessage = `Testing framework initialization failed: ${error}`;
      console.error(errorMessage);
      this.result!.errors.push(errorMessage);
      throw error;
    }
  }
  
  private async runIntegrationTests(): Promise<void> {
    try {
      console.log('🧪 Running Integration Tests...');
      
      // Run all test suites
      const reports = await testingFramework.runAllTests();
      
      // Analyze test results
      const totalTests = reports.reduce((sum, report) => sum + report.totalTests, 0);
      const passedTests = reports.reduce((sum, report) => sum + report.passedTests, 0);
      const failedTests = reports.reduce((sum, report) => sum + report.failedTests, 0);
      
      console.log(`📊 Test Results: ${passedTests}/${totalTests} passed, ${failedTests} failed`);
      
      if (failedTests > 0) {
        const warning = `${failedTests} tests failed during integration`;
        this.result!.warnings.push(warning);
        console.warn(`⚠️ ${warning}`);
      }
      
      // Store test metrics
      this.result!.metrics.tests = {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        reports
      };
      
    } catch (error) {
      const errorMessage = `Integration tests failed: ${error}`;
      console.error(errorMessage);
      this.result!.errors.push(errorMessage);
      // Don't throw here, tests are not critical for basic functionality
    }
  }
  
  private async startPerformanceMonitoring(): Promise<void> {
    try {
      console.log('📊 Starting Performance Monitoring...');
      
      // Performance monitoring is handled by the system integration
      // Just verify it's working
      const metrics = systemIntegration.getPerformanceMetrics();
      
      if (metrics) {
        this.result!.metrics.performance = metrics;
        console.log('✅ Performance Monitoring started');
      } else {
        console.warn('⚠️ Performance monitoring not available');
      }
      
    } catch (error) {
      const errorMessage = `Performance monitoring failed: ${error}`;
      console.error(errorMessage);
      this.result!.warnings.push(errorMessage);
      // Don't throw here, monitoring is not critical for basic functionality
    }
  }
  
  private async finalizeIntegration(): Promise<void> {
    try {
      console.log('🔧 Finalizing Integration...');
      
      // Generate recommendations
      this.generateRecommendations();
      
      // Log final status
      console.log('📋 Integration Summary:');
      console.log(`  - Universal Tools: ${this.result!.systems.universalTools ? '✅' : '❌'}`);
      console.log(`  - Advanced Stitches: ${this.result!.systems.advancedStitches ? '✅' : '❌'}`);
      console.log(`  - AI Optimization: ${this.result!.systems.aiOptimization ? '✅' : '❌'}`);
      console.log(`  - Plugin System: ${this.result!.systems.pluginSystem ? '✅' : '❌'}`);
      console.log(`  - Error Handling: ${this.result!.systems.errorHandling ? '✅' : '❌'}`);
      console.log(`  - Testing: ${this.result!.systems.testing ? '✅' : '❌'}`);
      
      console.log('✅ Integration finalized');
      
    } catch (error) {
      const errorMessage = `Integration finalization failed: ${error}`;
      console.error(errorMessage);
      this.result!.errors.push(errorMessage);
      throw error;
    }
  }
  
  // Helper Methods
  private generateRecommendations(): void {
    const recommendations: string[] = [];
    
    // Check system status
    if (!this.result!.systems.universalTools) {
      recommendations.push('Enable Universal Tools for enhanced functionality');
    }
    
    if (!this.result!.systems.advancedStitches) {
      recommendations.push('Enable Advanced Stitches for better embroidery quality');
    }
    
    if (!this.result!.systems.aiOptimization) {
      recommendations.push('Enable AI Optimization for better performance');
    }
    
    if (!this.result!.systems.pluginSystem) {
      recommendations.push('Enable Plugin System for extensibility');
    }
    
    // Check for errors
    if (this.result!.errors.length > 0) {
      recommendations.push('Review and fix integration errors');
    }
    
    // Check for warnings
    if (this.result!.warnings.length > 0) {
      recommendations.push('Address integration warnings');
    }
    
    this.result!.recommendations = recommendations;
  }
  
  private getDefaultOptions(): IntegrationOptions {
    return {
      enableUniversalTools: true,
      enableAdvancedStitches: true,
      enableAIOptimization: true,
      enablePluginSystem: true,
      renderingQuality: 'high',
      hyperrealisticRendering: false,
      realTimeOptimization: true,
      maxMemoryUsage: 512,
      targetFPS: 60,
      optimizationLevel: 'high',
      aiLearningEnabled: true,
      aiOptimizationEnabled: true,
      aiQualityEnhancement: true,
      preserveExistingFunctionality: true,
      enableGradualMigration: true,
      enablePerformanceMonitoring: true,
      enableErrorHandling: true,
      enableTesting: true,
      debugMode: process.env.NODE_ENV === 'development',
      verboseLogging: process.env.NODE_ENV === 'development',
      enableMetrics: true
    };
  }
  
  // Public Methods
  public getResult(): IntegrationResult | null {
    return this.result;
  }
  
  public getOptions(): IntegrationOptions {
    return { ...this.options };
  }
  
  public isSystemInitialized(): boolean {
    return this.isInitialized;
  }
  
  // Event System
  public on(event: string, listener: Function): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
    
    return () => {
      const listeners = this.eventListeners.get(event) || [];
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }
  
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in integration event listener for ${event}:`, error);
      }
    });
  }
}

// Export integration manager instance
export const integrationManager = IntegrationManager.getInstance();

// Auto-integrate when module is loaded (in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Auto-integrate with default options
  integrationManager.integrate().then(result => {
    if (result.success) {
      console.log('🎉 Auto-integration completed successfully');
    } else {
      console.error('❌ Auto-integration failed');
    }
  }).catch(error => {
    console.error('❌ Auto-integration error:', error);
  });
}

