/**
 * 🎯 Comprehensive Error Handler
 *
 * Centralized error handling system for the entire application
 * Provides consistent error handling, logging, and user feedback
 */
export class ErrorHandler {
    constructor() {
        this.errorReports = new Map();
        this.errorListeners = new Set();
        this.maxReports = 1000;
        this.isDevelopment = process.env.NODE_ENV === 'development';
        this.setupGlobalErrorHandlers();
    }
    static getInstance() {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }
    setupGlobalErrorHandlers() {
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
    handleError(error, context = {}) {
        const errorId = this.generateErrorId();
        const fullContext = {
            component: 'unknown',
            function: 'unknown',
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            ...context
        };
        const errorReport = {
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
    async handleAsyncError(asyncFn, context = {}) {
        try {
            return await asyncFn();
        }
        catch (error) {
            this.handleError(error, context);
            return null;
        }
    }
    /**
     * Wrap a function with error handling
     */
    wrapFunction(fn, context = {}) {
        return ((...args) => {
            try {
                return fn(...args);
            }
            catch (error) {
                this.handleError(error, {
                    ...context,
                    function: fn.name || 'anonymous'
                });
                throw error; // Re-throw to maintain original behavior
            }
        });
    }
    /**
     * Wrap an async function with error handling
     */
    wrapAsyncFunction(fn, context = {}) {
        return ((...args) => {
            return this.handleAsyncError(() => fn(...args), {
                ...context,
                function: fn.name || 'anonymous'
            });
        });
    }
    /**
     * Get error report by ID
     */
    getErrorReport(errorId) {
        return this.errorReports.get(errorId);
    }
    /**
     * Get all error reports
     */
    getAllErrorReports() {
        return Array.from(this.errorReports.values());
    }
    /**
     * Get errors by severity
     */
    getErrorsBySeverity(severity) {
        return this.getAllErrorReports().filter(error => error.severity === severity);
    }
    /**
     * Get errors by category
     */
    getErrorsByCategory(category) {
        return this.getAllErrorReports().filter(error => error.category === category);
    }
    /**
     * Get unresolved errors
     */
    getUnresolvedErrors() {
        return this.getAllErrorReports().filter(error => !error.resolved);
    }
    /**
     * Mark error as resolved
     */
    resolveError(errorId) {
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
    clearAllErrors() {
        this.errorReports.clear();
    }
    /**
     * Clear resolved errors
     */
    clearResolvedErrors() {
        for (const [id, error] of this.errorReports.entries()) {
            if (error.resolved) {
                this.errorReports.delete(id);
            }
        }
    }
    /**
     * Add error listener
     */
    addErrorListener(listener) {
        this.errorListeners.add(listener);
    }
    /**
     * Remove error listener
     */
    removeErrorListener(listener) {
        this.errorListeners.delete(listener);
    }
    /**
     * Generate error statistics
     */
    getErrorStatistics() {
        const errors = this.getAllErrorReports();
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        return {
            total: errors.length,
            bySeverity: errors.reduce((acc, error) => {
                acc[error.severity] = (acc[error.severity] || 0) + 1;
                return acc;
            }, {}),
            byCategory: errors.reduce((acc, error) => {
                acc[error.category] = (acc[error.category] || 0) + 1;
                return acc;
            }, {}),
            resolved: errors.filter(e => e.resolved).length,
            unresolved: errors.filter(e => !e.resolved).length,
            recent: errors.filter(e => e.createdAt > oneHourAgo).length
        };
    }
    generateErrorId() {
        return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    determineSeverity(error, context) {
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
    categorizeError(error, context) {
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
    logError(errorReport) {
        const { id, message, severity, category, context } = errorReport;
        const logMessage = `[${severity.toUpperCase()}] ${category} error in ${context.component}.${context.function}: ${message}`;
        if (this.isDevelopment) {
            console.error(logMessage, {
                errorId: id,
                context,
                stack: errorReport.stack
            });
        }
        else {
            // In production, log to external service
            this.logToExternalService(errorReport);
        }
    }
    logToExternalService(errorReport) {
        // TODO: Implement external logging service (e.g., Sentry, LogRocket, etc.)
        console.warn('External logging not implemented yet');
    }
    showUserFriendlyMessage(errorReport) {
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
    getUserFriendlyMessage(errorReport) {
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
    notifyListeners(errorReport) {
        this.errorListeners.forEach(listener => {
            try {
                listener(errorReport);
            }
            catch (error) {
                console.error('Error in error listener:', error);
            }
        });
    }
    cleanupOldReports() {
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
export const handleError = (error, context) => errorHandler.handleError(error, context);
export const handleAsyncError = (asyncFn, context) => errorHandler.handleAsyncError(asyncFn, context);
export const wrapFunction = (fn, context) => errorHandler.wrapFunction(fn, context);
export const wrapAsyncFunction = (fn, context) => errorHandler.wrapAsyncFunction(fn, context);
export default ErrorHandler;
