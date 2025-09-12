/**
 * 🎯 Comprehensive Error Handler
 * 
 * Centralized error handling system for the entire application
 * Provides consistent error handling, logging, and user feedback
 */

export interface ErrorContext {
  component: string;
  function: string;
  userId?: string;
  sessionId?: string;
  timestamp: number;
  userAgent: string;
  url: string;
  additionalData?: any;
}

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'rendering' | 'user_interaction' | 'data_processing' | 'network' | 'validation' | 'unknown';
  resolved: boolean;
  createdAt: number;
  resolvedAt?: number;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorReports: Map<string, ErrorReport> = new Map();
  private errorListeners: Set<(error: ErrorReport) => void> = new Set();
  private maxReports: number = 1000;
  private isDevelopment: boolean = process.env.NODE_ENV === 'development';
  
  private constructor() {
    this.setupGlobalErrorHandlers();
  }
  
  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }
  
  private setupGlobalErrorHandlers(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.handleError(new Error(event.message), {
        component: 'global',
        function: 'window_error',
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(new Error(event.reason), {
        component: 'global',
        function: 'unhandled_rejection',
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    });
  }
  
  /**
   * Handle an error with context
   */
  handleError(error: Error, context: Partial<ErrorContext> = {}): string {
    const errorId = this.generateErrorId();
    const fullContext: ErrorContext = {
      component: 'unknown',
      function: 'unknown',
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...context
    };
    
    const errorReport: ErrorReport = {
      id: errorId,
      message: error.message,
      stack: error.stack,
      context: fullContext,
      severity: this.determineSeverity(error, fullContext),
      category: this.categorizeError(error, fullContext),
      resolved: false,
      createdAt: Date.now()
    };
    
    // Store error report
    this.errorReports.set(errorId, errorReport);
    
    // Cleanup old reports if needed
    this.cleanupOldReports();
    
    // Log error
    this.logError(errorReport);
    
    // Notify listeners
    this.notifyListeners(errorReport);
    
    // Show user-friendly message if critical
    if (errorReport.severity === 'critical') {
      this.showUserFriendlyMessage(errorReport);
    }
    
    return errorId;
  }
  
  /**
   * Handle async errors
   */
  async handleAsyncError<T>(
    asyncFn: () => Promise<T>,
    context: Partial<ErrorContext> = {}
  ): Promise<T | null> {
    try {
      return await asyncFn();
    } catch (error) {
      this.handleError(error as Error, context);
      return null;
    }
  }
  
  /**
   * Wrap a function with error handling
   */
  wrapFunction<T extends (...args: any[]) => any>(
    fn: T,
    context: Partial<ErrorContext> = {}
  ): T {
    return ((...args: Parameters<T>) => {
      try {
        return fn(...args);
      } catch (error) {
        this.handleError(error as Error, {
          ...context,
          function: fn.name || 'anonymous'
        });
        throw error; // Re-throw to maintain original behavior
      }
    }) as T;
  }
  
  /**
   * Wrap an async function with error handling
   */
  wrapAsyncFunction<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    context: Partial<ErrorContext> = {}
  ): T {
    return ((...args: Parameters<T>) => {
      return this.handleAsyncError(() => fn(...args), {
        ...context,
        function: fn.name || 'anonymous'
      });
    }) as T;
  }
  
  /**
   * Get error report by ID
   */
  getErrorReport(errorId: string): ErrorReport | undefined {
    return this.errorReports.get(errorId);
  }
  
  /**
   * Get all error reports
   */
  getAllErrorReports(): ErrorReport[] {
    return Array.from(this.errorReports.values());
  }
  
  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorReport['severity']): ErrorReport[] {
    return this.getAllErrorReports().filter(error => error.severity === severity);
  }
  
  /**
   * Get errors by category
   */
  getErrorsByCategory(category: ErrorReport['category']): ErrorReport[] {
    return this.getAllErrorReports().filter(error => error.category === category);
  }
  
  /**
   * Get unresolved errors
   */
  getUnresolvedErrors(): ErrorReport[] {
    return this.getAllErrorReports().filter(error => !error.resolved);
  }
  
  /**
   * Mark error as resolved
   */
  resolveError(errorId: string): boolean {
    const error = this.errorReports.get(errorId);
    if (error) {
      error.resolved = true;
      error.resolvedAt = Date.now();
      return true;
    }
    return false;
  }
  
  /**
   * Clear all errors
   */
  clearAllErrors(): void {
    this.errorReports.clear();
  }
  
  /**
   * Clear resolved errors
   */
  clearResolvedErrors(): void {
    for (const [id, error] of this.errorReports.entries()) {
      if (error.resolved) {
        this.errorReports.delete(id);
      }
    }
  }
  
  /**
   * Add error listener
   */
  addErrorListener(listener: (error: ErrorReport) => void): void {
    this.errorListeners.add(listener);
  }
  
  /**
   * Remove error listener
   */
  removeErrorListener(listener: (error: ErrorReport) => void): void {
    this.errorListeners.delete(listener);
  }
  
  /**
   * Generate error statistics
   */
  getErrorStatistics(): {
    total: number;
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
    resolved: number;
    unresolved: number;
    recent: number;
  } {
    const errors = this.getAllErrorReports();
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    return {
      total: errors.length,
      bySeverity: errors.reduce((acc, error) => {
        acc[error.severity] = (acc[error.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byCategory: errors.reduce((acc, error) => {
        acc[error.category] = (acc[error.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      resolved: errors.filter(e => e.resolved).length,
      unresolved: errors.filter(e => !e.resolved).length,
      recent: errors.filter(e => e.createdAt > oneHourAgo).length
    };
  }
  
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private determineSeverity(error: Error, context: ErrorContext): ErrorReport['severity'] {
    // Critical errors that break functionality
    if (error.message.includes('Cannot read properties') ||
        error.message.includes('Cannot read property') ||
        error.message.includes('is not a function') ||
        error.message.includes('Cannot access before initialization')) {
      return 'critical';
    }
    
    // High severity errors that affect user experience
    if (error.message.includes('rendering') ||
        error.message.includes('canvas') ||
        error.message.includes('texture') ||
        context.component === 'ShirtRenderer') {
      return 'high';
    }
    
    // Medium severity errors
    if (error.message.includes('validation') ||
        error.message.includes('format') ||
        context.component === 'VectorTools') {
      return 'medium';
    }
    
    // Low severity errors
    return 'low';
  }
  
  private categorizeError(error: Error, context: ErrorContext): ErrorReport['category'] {
    if (error.message.includes('render') || error.message.includes('canvas')) {
      return 'rendering';
    }
    
    if (error.message.includes('click') || error.message.includes('mouse') || error.message.includes('pointer')) {
      return 'user_interaction';
    }
    
    if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('API')) {
      return 'network';
    }
    
    if (error.message.includes('validation') || error.message.includes('format') || error.message.includes('invalid')) {
      return 'validation';
    }
    
    if (error.message.includes('process') || error.message.includes('data') || error.message.includes('transform')) {
      return 'data_processing';
    }
    
    return 'unknown';
  }
  
  private logError(errorReport: ErrorReport): void {
    const { id, message, severity, category, context } = errorReport;
    
    const logMessage = `[${severity.toUpperCase()}] ${category} error in ${context.component}.${context.function}: ${message}`;
    
    if (this.isDevelopment) {
      console.error(logMessage, {
        errorId: id,
        context,
        stack: errorReport.stack
      });
    } else {
      // In production, log to external service
      this.logToExternalService(errorReport);
    }
  }
  
  private logToExternalService(errorReport: ErrorReport): void {
    // TODO: Implement external logging service (e.g., Sentry, LogRocket, etc.)
    console.warn('External logging not implemented yet');
  }
  
  private showUserFriendlyMessage(errorReport: ErrorReport): void {
    const message = this.getUserFriendlyMessage(errorReport);
    
    // Create error notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff4444;
      color: white;
      padding: 15px;
      border-radius: 5px;
      z-index: 10000;
      max-width: 300px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;
    
    notification.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px;">Something went wrong</div>
      <div style="font-size: 14px;">${message}</div>
      <button onclick="this.parentElement.remove()" style="
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        padding: 5px 10px;
        border-radius: 3px;
        cursor: pointer;
        margin-top: 10px;
      ">Dismiss</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }
  
  private getUserFriendlyMessage(errorReport: ErrorReport): string {
    switch (errorReport.category) {
      case 'rendering':
        return 'There was a problem rendering the design. Please try refreshing the page.';
      case 'user_interaction':
        return 'There was a problem with your interaction. Please try again.';
      case 'network':
        return 'There was a problem connecting to the server. Please check your internet connection.';
      case 'validation':
        return 'There was a problem with the data. Please check your input and try again.';
      case 'data_processing':
        return 'There was a problem processing your data. Please try again.';
      default:
        return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
    }
  }
  
  private notifyListeners(errorReport: ErrorReport): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(errorReport);
      } catch (error) {
        console.error('Error in error listener:', error);
      }
    });
  }
  
  private cleanupOldReports(): void {
    if (this.errorReports.size > this.maxReports) {
      const sortedErrors = Array.from(this.errorReports.values())
        .sort((a, b) => a.createdAt - b.createdAt);
      
      const toRemove = sortedErrors.slice(0, this.errorReports.size - this.maxReports);
      toRemove.forEach(error => {
        this.errorReports.delete(error.id);
      });
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Export convenience functions
export const handleError = (error: Error, context?: Partial<ErrorContext>) => 
  errorHandler.handleError(error, context);

export const handleAsyncError = <T>(
  asyncFn: () => Promise<T>,
  context?: Partial<ErrorContext>
) => errorHandler.handleAsyncError(asyncFn, context);

export const wrapFunction = <T extends (...args: any[]) => any>(
  fn: T,
  context?: Partial<ErrorContext>
) => errorHandler.wrapFunction(fn, context);

export const wrapAsyncFunction = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: Partial<ErrorContext>
) => errorHandler.wrapAsyncFunction(fn, context);

export default ErrorHandler;
