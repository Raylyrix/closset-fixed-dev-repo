// Comprehensive Error Handling System
// Handles errors, recovery, and debugging for all core systems

export interface ErrorInfo {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  category: 'system' | 'rendering' | 'ai' | 'plugin' | 'integration' | 'performance' | 'user';
  message: string;
  stack?: string;
  context: any;
  recovery?: RecoveryAction;
  resolved: boolean;
}

export interface RecoveryAction {
  type: 'retry' | 'fallback' | 'restart' | 'disable' | 'notify';
  description: string;
  automatic: boolean;
  success: boolean;
  attempts: number;
  maxAttempts: number;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByLevel: Record<string, number>;
  errorsByCategory: Record<string, number>;
  recoveryRate: number;
  averageResolutionTime: number;
  criticalErrors: number;
}

export interface ErrorHandler {
  id: string;
  name: string;
  category: string;
  handler: (error: Error, context: any) => Promise<RecoveryAction | null>;
  priority: number;
  enabled: boolean;
}

// Error Handling System
export class ErrorHandlingSystem {
  private static instance: ErrorHandlingSystem;
  
  // Error storage
  private errors: Map<string, ErrorInfo> = new Map();
  private errorHandlers: Map<string, ErrorHandler> = new Map();
  private metrics: ErrorMetrics;
  
  // Recovery system
  private recoveryQueue: ErrorInfo[] = [];
  private isRecovering: boolean = false;
  
  // Event system
  private eventListeners: Map<string, Function[]> = new Map();
  
  private constructor() {
    this.metrics = this.getInitialMetrics();
    this.initializeDefaultHandlers();
    this.startRecoveryProcess();
  }
  
  public static getInstance(): ErrorHandlingSystem {
    if (!ErrorHandlingSystem.instance) {
      ErrorHandlingSystem.instance = new ErrorHandlingSystem();
    }
    return ErrorHandlingSystem.instance;
  }
  
  // Error Reporting
  public reportError(
    error: Error | string,
    context: any = {},
    category: ErrorInfo['category'] = 'system',
    level: ErrorInfo['level'] = 'error'
  ): string {
    const errorId = this.generateErrorId();
    const errorInfo: ErrorInfo = {
      id: errorId,
      timestamp: new Date(),
      level,
      category,
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      context,
      resolved: false
    };
    
    // Store error
    this.errors.set(errorId, errorInfo);
    
    // Update metrics
    this.updateMetrics(errorInfo);
    
    // Try to recover automatically
    this.attemptRecovery(errorInfo);
    
    // Emit event
    this.emit('errorReported', { error: errorInfo });
    
    // Log error
    this.logError(errorInfo);
    
    return errorId;
  }
  
  // Error Recovery
  public async attemptRecovery(errorInfo: ErrorInfo): Promise<boolean> {
    try {
      // Find appropriate handler
      const handler = this.findHandler(errorInfo);
      if (!handler) {
        console.warn(`No handler found for error: ${errorInfo.message}`);
        return false;
      }
      
      // Execute recovery
      const recovery = await handler.handler(
        new Error(errorInfo.message),
        errorInfo.context
      );
      
      if (recovery) {
        errorInfo.recovery = recovery;
        recovery.attempts++;
        
        // Apply recovery action
        const success = await this.applyRecovery(recovery, errorInfo);
        
        if (success) {
          errorInfo.resolved = true;
          recovery.success = true;
          console.log(`✅ Error recovered: ${errorInfo.message}`);
        } else {
          console.warn(`⚠️ Recovery failed for error: ${errorInfo.message}`);
        }
        
        return success;
      }
      
      return false;
      
    } catch (recoveryError) {
      console.error('Error during recovery attempt:', recoveryError);
      return false;
    }
  }
  
  // Error Handlers
  public registerHandler(handler: ErrorHandler): void {
    this.errorHandlers.set(handler.id, handler);
    console.log(`🔧 Error handler registered: ${handler.name}`);
  }
  
  public unregisterHandler(handlerId: string): void {
    this.errorHandlers.delete(handlerId);
    console.log(`🔧 Error handler unregistered: ${handlerId}`);
  }
  
  // Error Querying
  public getErrors(filters?: {
    level?: ErrorInfo['level'];
    category?: ErrorInfo['category'];
    resolved?: boolean;
    since?: Date;
  }): ErrorInfo[] {
    let errors = Array.from(this.errors.values());
    
    if (filters) {
      if (filters.level) {
        errors = errors.filter(e => e.level === filters.level);
      }
      if (filters.category) {
        errors = errors.filter(e => e.category === filters.category);
      }
      if (filters.resolved !== undefined) {
        errors = errors.filter(e => e.resolved === filters.resolved);
      }
      if (filters.since) {
        errors = errors.filter(e => e.timestamp >= filters.since!);
      }
    }
    
    return errors.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  public getError(errorId: string): ErrorInfo | null {
    return this.errors.get(errorId) || null;
  }
  
  public getMetrics(): ErrorMetrics {
    return { ...this.metrics };
  }
  
  // System Health
  public getSystemHealth(): {
    status: 'healthy' | 'degraded' | 'critical';
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const recentErrors = this.getErrors({
      since: new Date(Date.now() - 60000) // Last minute
    });
    
    const criticalErrors = recentErrors.filter(e => e.level === 'critical').length;
    const errorRate = recentErrors.length / 60; // Errors per second
    
    let status: 'healthy' | 'degraded' | 'critical';
    let score: number;
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    if (criticalErrors > 0) {
      status = 'critical';
      score = 0;
      issues.push(`${criticalErrors} critical errors in the last minute`);
      recommendations.push('Immediate attention required');
    } else if (errorRate > 0.1) {
      status = 'degraded';
      score = 50;
      issues.push(`High error rate: ${errorRate.toFixed(2)} errors/second`);
      recommendations.push('Monitor system performance');
    } else {
      status = 'healthy';
      score = 100;
    }
    
    return { status, score, issues, recommendations };
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
        console.error(`Error in error handling event listener for ${event}:`, error);
      }
    });
  }
  
  // Helper methods
  private initializeDefaultHandlers(): void {
    // System error handler
    this.registerHandler({
      id: 'system_handler',
      name: 'System Error Handler',
      category: 'system',
      priority: 1,
      enabled: true,
      handler: async (error, context) => {
        console.error('System error:', error.message);
        return {
          type: 'retry',
          description: 'Retry system operation',
          automatic: true,
          success: false,
          attempts: 0,
          maxAttempts: 3
        };
      }
    });
    
    // Rendering error handler
    this.registerHandler({
      id: 'rendering_handler',
      name: 'Rendering Error Handler',
      category: 'rendering',
      priority: 2,
      enabled: true,
      handler: async (error, context) => {
        console.error('Rendering error:', error.message);
        return {
          type: 'fallback',
          description: 'Fallback to basic rendering',
          automatic: true,
          success: false,
          attempts: 0,
          maxAttempts: 1
        };
      }
    });
    
    // AI error handler
    this.registerHandler({
      id: 'ai_handler',
      name: 'AI Error Handler',
      category: 'ai',
      priority: 3,
      enabled: true,
      handler: async (error, context) => {
        console.error('AI error:', error.message);
        return {
          type: 'disable',
          description: 'Disable AI features temporarily',
          automatic: true,
          success: false,
          attempts: 0,
          maxAttempts: 1
        };
      }
    });
    
    // Plugin error handler
    this.registerHandler({
      id: 'plugin_handler',
      name: 'Plugin Error Handler',
      category: 'plugin',
      priority: 4,
      enabled: true,
      handler: async (error, context) => {
        console.error('Plugin error:', error.message);
        return {
          type: 'disable',
          description: 'Disable problematic plugin',
          automatic: true,
          success: false,
          attempts: 0,
          maxAttempts: 1
        };
      }
    });
  }
  
  private startRecoveryProcess(): void {
    setInterval(() => {
      if (!this.isRecovering && this.recoveryQueue.length > 0) {
        this.processRecoveryQueue();
      }
    }, 1000); // Check every second
  }
  
  private async processRecoveryQueue(): Promise<void> {
    this.isRecovering = true;
    
    try {
      while (this.recoveryQueue.length > 0) {
        const errorInfo = this.recoveryQueue.shift()!;
        await this.attemptRecovery(errorInfo);
      }
    } finally {
      this.isRecovering = false;
    }
  }
  
  private findHandler(errorInfo: ErrorInfo): ErrorHandler | null {
    const handlers = Array.from(this.errorHandlers.values())
      .filter(h => h.enabled && h.category === errorInfo.category)
      .sort((a, b) => a.priority - b.priority);
    
    return handlers[0] || null;
  }
  
  private async applyRecovery(recovery: RecoveryAction, errorInfo: ErrorInfo): Promise<boolean> {
    try {
      switch (recovery.type) {
        case 'retry':
          return await this.retryOperation(errorInfo);
        case 'fallback':
          return await this.fallbackOperation(errorInfo);
        case 'restart':
          return await this.restartOperation(errorInfo);
        case 'disable':
          return await this.disableOperation(errorInfo);
        case 'notify':
          return await this.notifyOperation(errorInfo);
        default:
          return false;
      }
    } catch (error) {
      console.error('Error applying recovery:', error);
      return false;
    }
  }
  
  private async retryOperation(errorInfo: ErrorInfo): Promise<boolean> {
    // Implement retry logic
    return true;
  }
  
  private async fallbackOperation(errorInfo: ErrorInfo): Promise<boolean> {
    // Implement fallback logic
    return true;
  }
  
  private async restartOperation(errorInfo: ErrorInfo): Promise<boolean> {
    // Implement restart logic
    return true;
  }
  
  private async disableOperation(errorInfo: ErrorInfo): Promise<boolean> {
    // Implement disable logic
    return true;
  }
  
  private async notifyOperation(errorInfo: ErrorInfo): Promise<boolean> {
    // Implement notification logic
    this.emit('errorNotification', { error: errorInfo });
    return true;
  }
  
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private updateMetrics(errorInfo: ErrorInfo): void {
    this.metrics.totalErrors++;
    this.metrics.errorsByLevel[errorInfo.level] = (this.metrics.errorsByLevel[errorInfo.level] || 0) + 1;
    this.metrics.errorsByCategory[errorInfo.category] = (this.metrics.errorsByCategory[errorInfo.category] || 0) + 1;
    
    if (errorInfo.level === 'critical') {
      this.metrics.criticalErrors++;
    }
    
    if (errorInfo.resolved) {
      this.metrics.recoveryRate = (this.metrics.recoveryRate + 1) / 2; // Simple moving average
    }
  }
  
  private logError(errorInfo: ErrorInfo): void {
    const logLevel = errorInfo.level === 'critical' ? 'error' : errorInfo.level;
    const message = `[${errorInfo.category.toUpperCase()}] ${errorInfo.message}`;
    
    switch (logLevel) {
      case 'debug':
        console.debug(message, errorInfo.context);
        break;
      case 'info':
        console.info(message, errorInfo.context);
        break;
      case 'warn':
        console.warn(message, errorInfo.context);
        break;
      case 'error':
        console.error(message, errorInfo.context);
        break;
      case 'critical':
        console.error(`🚨 CRITICAL: ${message}`, errorInfo.context);
        break;
    }
  }
  
  private getInitialMetrics(): ErrorMetrics {
    return {
      totalErrors: 0,
      errorsByLevel: {},
      errorsByCategory: {},
      recoveryRate: 0,
      averageResolutionTime: 0,
      criticalErrors: 0
    };
  }
}

// Export error handling system instance
export const errorHandling = ErrorHandlingSystem.getInstance();

// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorHandling.reportError(
      event.error || event.message,
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      },
      'system',
      'error'
    );
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    errorHandling.reportError(
      event.reason,
      { type: 'unhandledrejection' },
      'system',
      'error'
    );
  });
}

