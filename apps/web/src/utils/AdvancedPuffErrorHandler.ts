export enum PuffErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RENDERING_ERROR = 'RENDERING_ERROR',
  TEXTURE_ERROR = 'TEXTURE_ERROR',
  MATERIAL_ERROR = 'MATERIAL_ERROR',
  GEOMETRY_ERROR = 'GEOMETRY_ERROR',
  UV_ERROR = 'UV_ERROR',
  MEMORY_ERROR = 'MEMORY_ERROR',
  PERFORMANCE_ERROR = 'PERFORMANCE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export enum PuffErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface PuffError {
  id: string;
  type: PuffErrorType;
  severity: PuffErrorSeverity;
  message: string;
  details: any;
  timestamp: number;
  context: {
    component: string;
    operation: string;
    parameters?: any;
    userAgent?: string;
    modelInfo?: any;
  };
  resolution?: {
    automatic: boolean;
    suggestions: string[];
    recoveryActions: (() => void)[];
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: PuffError[];
  warnings: PuffError[];
  performanceMetrics: {
    memoryUsage: number;
    renderTime: number;
    textureMemory: number;
    geometryCount: number;
  };
}

export class AdvancedPuffErrorHandler {
  private errors: PuffError[] = [];
  private errorListeners: ((error: PuffError) => void)[] = [];
  private validationCache = new Map<string, ValidationResult>();
  private performanceMonitor = new PerformanceMonitor();

  // Add error listener
  public addErrorListener(listener: (error: PuffError) => void): void {
    this.errorListeners.push(listener);
  }

  // Remove error listener
  public removeErrorListener(listener: (error: PuffError) => void): void {
    const index = this.errorListeners.indexOf(listener);
    if (index > -1) {
      this.errorListeners.splice(index, 1);
    }
  }

  // Report an error
  public reportError(
    type: PuffErrorType,
    severity: PuffErrorSeverity,
    message: string,
    details: any = {},
    context: PuffError['context']
  ): PuffError {
    const error: PuffError = {
      id: `puff-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      message,
      details,
      timestamp: Date.now(),
      context,
      resolution: this.getErrorResolution(type, severity, details)
    };

    this.errors.push(error);
    this.notifyListeners(error);

    // Log to console based on severity
    switch (severity) {
      case PuffErrorSeverity.LOW:
        console.warn(`[PuffPrint ${type}] ${message}`, details);
        break;
      case PuffErrorSeverity.MEDIUM:
        console.error(`[PuffPrint ${type}] ${message}`, details);
        break;
      case PuffErrorSeverity.HIGH:
      case PuffErrorSeverity.CRITICAL:
        console.error(`[PuffPrint ${type} CRITICAL] ${message}`, details);
        this.handleCriticalError(error);
        break;
    }

    return error;
  }

  // Get resolution suggestions for errors
  private getErrorResolution(type: PuffErrorType, severity: PuffErrorSeverity, details: any): PuffError['resolution'] {
    const suggestions: string[] = [];
    const recoveryActions: (() => void)[] = [];

    switch (type) {
      case PuffErrorType.VALIDATION_ERROR:
        suggestions.push('Check UV mapping and model geometry');
        suggestions.push('Verify texture dimensions and formats');
        suggestions.push('Ensure model has proper materials');
        recoveryActions.push(() => this.validateSystem());
        break;

      case PuffErrorType.TEXTURE_ERROR:
        suggestions.push('Check texture memory usage');
        suggestions.push('Reduce texture resolution if needed');
        suggestions.push('Clear texture cache');
        recoveryActions.push(() => this.clearTextureCache());
        break;

      case PuffErrorType.MATERIAL_ERROR:
        suggestions.push('Check material properties');
        suggestions.push('Verify shader compatibility');
        suggestions.push('Reset material to defaults');
        recoveryActions.push(() => this.resetMaterials());
        break;

      case PuffErrorType.GEOMETRY_ERROR:
        suggestions.push('Check mesh topology');
        suggestions.push('Verify vertex data integrity');
        suggestions.push('Reduce geometry complexity');
        recoveryActions.push(() => this.optimizeGeometry());
        break;

      case PuffErrorType.UV_ERROR:
        suggestions.push('Fix UV coordinate mapping');
        suggestions.push('Check for overlapping UVs');
        suggestions.push('Regenerate UV layout');
        recoveryActions.push(() => this.regenerateUVs());
        break;

      case PuffErrorType.MEMORY_ERROR:
        suggestions.push('Reduce texture resolution');
        suggestions.push('Close other applications');
        suggestions.push('Clear browser cache');
        recoveryActions.push(() => this.freeMemory());
        break;

      case PuffErrorType.PERFORMANCE_ERROR:
        suggestions.push('Reduce puff layer count');
        suggestions.push('Lower texture resolution');
        suggestions.push('Disable real-time preview');
        recoveryActions.push(() => this.optimizePerformance());
        break;
    }

    return {
      automatic: severity === PuffErrorSeverity.LOW,
      suggestions,
      recoveryActions
    };
  }

  // Handle critical errors
  private handleCriticalError(error: PuffError): void {
    // Attempt automatic recovery
    if (error.resolution?.automatic) {
      error.resolution.recoveryActions.forEach(action => {
        try {
          action();
        } catch (recoveryError) {
          console.error('Recovery action failed:', recoveryError);
        }
      });
    }

    // If critical error persists, show user-friendly message
    if (error.severity === PuffErrorSeverity.CRITICAL) {
      this.showErrorDialog(error);
    }
  }

  // Show error dialog to user
  private showErrorDialog(error: PuffError): void {
    // This would integrate with the UI system to show a modal dialog
    console.log('Showing error dialog:', error.message);

    // For now, just log the error details
    console.error('Critical Puff Print Error:', {
      message: error.message,
      type: error.type,
      suggestions: error.resolution?.suggestions,
      context: error.context
    });
  }

  // Validate the entire puff print system
  public validateSystem(): ValidationResult {
    const cacheKey = 'system-validation';

    if (this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey)!;
    }

    const errors: PuffError[] = [];
    const warnings: PuffError[] = [];
    const metrics = this.performanceMonitor.getMetrics();

    try {
      // Validate WebGL context
      if (!this.isWebGLSupported()) {
        errors.push(this.reportError(
          PuffErrorType.RENDERING_ERROR,
          PuffErrorSeverity.HIGH,
          'WebGL not supported',
          { webgl: false },
          { component: 'PuffValidator', operation: 'webgl_check' }
        ));
      }

      // Validate memory
      if (metrics.memoryUsage > 0.8) {
        warnings.push(this.reportError(
          PuffErrorType.MEMORY_ERROR,
          PuffErrorSeverity.MEDIUM,
          'High memory usage detected',
          { memoryUsage: metrics.memoryUsage },
          { component: 'PuffValidator', operation: 'memory_check' }
        ));
      }

      // Validate texture memory
      if (metrics.textureMemory > 100 * 1024 * 1024) { // 100MB
        warnings.push(this.reportError(
          PuffErrorType.TEXTURE_ERROR,
          PuffErrorSeverity.MEDIUM,
          'High texture memory usage',
          { textureMemory: metrics.textureMemory },
          { component: 'PuffValidator', operation: 'texture_check' }
        ));
      }

      // Validate geometry count
      if (metrics.geometryCount > 10000) {
        warnings.push(this.reportError(
          PuffErrorType.GEOMETRY_ERROR,
          PuffErrorSeverity.LOW,
          'High geometry count may impact performance',
          { geometryCount: metrics.geometryCount },
          { component: 'PuffValidator', operation: 'geometry_check' }
        ));
      }

      // Validate render time
      if (metrics.renderTime > 100) { // 100ms
        warnings.push(this.reportError(
          PuffErrorType.PERFORMANCE_ERROR,
          PuffErrorSeverity.LOW,
          'Slow render performance detected',
          { renderTime: metrics.renderTime },
          { component: 'PuffValidator', operation: 'performance_check' }
        ));
      }

    } catch (validationError) {
      errors.push(this.reportError(
        PuffErrorType.VALIDATION_ERROR,
        PuffErrorSeverity.HIGH,
        'Validation system error',
        { validationError: validationError instanceof Error ? validationError.message : String(validationError) },
        { component: 'PuffValidator', operation: 'validation_system' }
      ));
    }

    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
      performanceMetrics: metrics
    };

    this.validationCache.set(cacheKey, result);
    return result;
  }

  // Check WebGL support
  private isWebGLSupported(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  }

  // Recovery actions
  private clearTextureCache(): void {
    // Clear texture cache
    console.log('Clearing texture cache...');
  }

  private resetMaterials(): void {
    // Reset all materials to defaults
    console.log('Resetting materials...');
  }

  private optimizeGeometry(): void {
    // Optimize geometry for better performance
    console.log('Optimizing geometry...');
  }

  private regenerateUVs(): void {
    // Regenerate UV mappings
    console.log('Regenerating UVs...');
  }

  private freeMemory(): void {
    // Force garbage collection and free memory
    console.log('Freeing memory...');
    if ('gc' in window) {
      (window as any).gc();
    }
  }

  private optimizePerformance(): void {
    // Optimize performance settings
    console.log('Optimizing performance...');
  }

  // Notify error listeners
  private notifyListeners(error: PuffError): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (listenerError) {
        console.error('Error listener failed:', listenerError);
      }
    });
  }

  // Get all errors
  public getErrors(): PuffError[] {
    return [...this.errors];
  }

  // Get errors by type
  public getErrorsByType(type: PuffErrorType): PuffError[] {
    return this.errors.filter(error => error.type === type);
  }

  // Get errors by severity
  public getErrorsBySeverity(severity: PuffErrorSeverity): PuffError[] {
    return this.errors.filter(error => error.severity === severity);
  }

  // Clear errors
  public clearErrors(): void {
    this.errors = [];
  }

  // Clear validation cache
  public clearValidationCache(): void {
    this.validationCache.clear();
  }

  // Dispose of resources
  public dispose(): void {
    this.errors = [];
    this.errorListeners = [];
    this.validationCache.clear();
    this.performanceMonitor.dispose();
  }
}

// Performance monitoring utility
class PerformanceMonitor {
  private metrics = {
    memoryUsage: 0,
    renderTime: 0,
    textureMemory: 0,
    geometryCount: 0
  };

  private updateInterval: number | null = null;

  constructor() {
    this.startMonitoring();
  }

  private startMonitoring(): void {
    this.updateInterval = window.setInterval(() => {
      this.updateMetrics();
    }, 5000); // Update every 5 seconds
  }

  private updateMetrics(): void {
    // Memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    }

    // Estimate texture memory
    this.metrics.textureMemory = this.estimateTextureMemory();

    // Update other metrics as needed
    this.metrics.renderTime = this.estimateRenderTime();
    this.metrics.geometryCount = this.estimateGeometryCount();
  }

  private estimateTextureMemory(): number {
    // Estimate based on active textures and their sizes
    return 50 * 1024 * 1024; // 50MB placeholder
  }

  private estimateRenderTime(): number {
    // Estimate based on scene complexity
    return 16; // 16ms placeholder (60fps)
  }

  private estimateGeometryCount(): number {
    // Count active geometries
    return 1000; // Placeholder
  }

  public getMetrics() {
    return { ...this.metrics };
  }

  public dispose(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}
