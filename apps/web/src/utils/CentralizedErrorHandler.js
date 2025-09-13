/**
 * Centralized Error Handling System
 * Provides consistent error handling across the entire application
 */
export var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["LOW"] = "low";
    ErrorSeverity["MEDIUM"] = "medium";
    ErrorSeverity["HIGH"] = "high";
    ErrorSeverity["CRITICAL"] = "critical";
})(ErrorSeverity || (ErrorSeverity = {}));
export var ErrorCategory;
(function (ErrorCategory) {
    ErrorCategory["RENDERING"] = "rendering";
    ErrorCategory["USER_INPUT"] = "user_input";
    ErrorCategory["NETWORK"] = "network";
    ErrorCategory["FILE_OPERATION"] = "file_operation";
    ErrorCategory["STATE_MANAGEMENT"] = "state_management";
    ErrorCategory["THREE_JS"] = "three_js";
    ErrorCategory["CANVAS"] = "canvas";
    ErrorCategory["VECTOR_TOOLS"] = "vector_tools";
    ErrorCategory["EMBROIDERY"] = "embroidery";
    ErrorCategory["UNKNOWN"] = "unknown";
})(ErrorCategory || (ErrorCategory = {}));
class CentralizedErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 1000;
        this.errorListeners = [];
    }
    /**
     * Handle any error with proper categorization and user-friendly messaging
     */
    handleError(error, context = {}, severity = ErrorSeverity.MEDIUM, category = ErrorCategory.UNKNOWN) {
        const appError = this.createAppError(error, context, severity, category);
        // Log the error
        this.logError(appError);
        // Notify listeners
        this.notifyListeners(appError);
        // Show user-friendly message if needed
        if (severity === ErrorSeverity.HIGH || severity === ErrorSeverity.CRITICAL) {
            this.showUserMessage(appError);
        }
        return appError;
    }
    /**
     * Handle rendering errors specifically
     */
    handleRenderingError(error, context = {}) {
        return this.handleError(error, context, ErrorSeverity.HIGH, ErrorCategory.RENDERING);
    }
    /**
     * Handle user input errors
     */
    handleUserInputError(error, context = {}) {
        return this.handleError(error, context, ErrorSeverity.LOW, ErrorCategory.USER_INPUT);
    }
    /**
     * Handle network errors
     */
    handleNetworkError(error, context = {}) {
        return this.handleError(error, context, ErrorSeverity.MEDIUM, ErrorCategory.NETWORK);
    }
    /**
     * Handle file operation errors
     */
    handleFileError(error, context = {}) {
        return this.handleError(error, context, ErrorSeverity.MEDIUM, ErrorCategory.FILE_OPERATION);
    }
    /**
     * Handle Three.js specific errors
     */
    handleThreeJSError(error, context = {}) {
        return this.handleError(error, context, ErrorSeverity.HIGH, ErrorCategory.THREE_JS);
    }
    /**
     * Handle canvas operation errors
     */
    handleCanvasError(error, context = {}) {
        return this.handleError(error, context, ErrorSeverity.MEDIUM, ErrorCategory.CANVAS);
    }
    /**
     * Handle vector tools errors
     */
    handleVectorToolsError(error, context = {}) {
        return this.handleError(error, context, ErrorSeverity.MEDIUM, ErrorCategory.VECTOR_TOOLS);
    }
    /**
     * Handle embroidery system errors
     */
    handleEmbroideryError(error, context = {}) {
        return this.handleError(error, context, ErrorSeverity.MEDIUM, ErrorCategory.EMBROIDERY);
    }
    createAppError(error, context, severity, category) {
        const fullContext = {
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            ...context
        };
        return {
            id: this.generateErrorId(),
            message: error.message,
            originalError: error,
            severity,
            category,
            context: fullContext,
            stack: error.stack,
            isRecoverable: this.isRecoverable(error, category),
            userMessage: this.generateUserMessage(error, category, severity),
            suggestedAction: this.generateSuggestedAction(error, category)
        };
    }
    generateErrorId() {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    isRecoverable(error, category) {
        // Define which errors are recoverable based on category and error type
        const recoverableCategories = [
            ErrorCategory.USER_INPUT,
            ErrorCategory.NETWORK,
            ErrorCategory.FILE_OPERATION
        ];
        const recoverableErrorTypes = [
            'TypeError',
            'ReferenceError',
            'NetworkError'
        ];
        return recoverableCategories.includes(category) ||
            recoverableErrorTypes.some(type => error.name.includes(type));
    }
    generateUserMessage(error, category, severity) {
        const messages = {
            [ErrorCategory.RENDERING]: {
                [ErrorSeverity.LOW]: "A minor rendering issue occurred. The application will continue to work normally.",
                [ErrorSeverity.MEDIUM]: "A rendering issue occurred. Some features may not display correctly.",
                [ErrorSeverity.HIGH]: "A serious rendering error occurred. Please refresh the page.",
                [ErrorSeverity.CRITICAL]: "A critical rendering error occurred. The application may not function properly."
            },
            [ErrorCategory.USER_INPUT]: {
                [ErrorSeverity.LOW]: "Please check your input and try again.",
                [ErrorSeverity.MEDIUM]: "There was an issue with your input. Please verify the format and try again.",
                [ErrorSeverity.HIGH]: "Invalid input detected. Please check your data and try again.",
                [ErrorSeverity.CRITICAL]: "Critical input error. Please refresh and try again."
            },
            [ErrorCategory.NETWORK]: {
                [ErrorSeverity.LOW]: "Network connection is slow. Please wait a moment.",
                [ErrorSeverity.MEDIUM]: "Network error occurred. Please check your connection.",
                [ErrorSeverity.HIGH]: "Unable to connect to the server. Please check your internet connection.",
                [ErrorSeverity.CRITICAL]: "Critical network failure. Please refresh the page."
            },
            [ErrorCategory.FILE_OPERATION]: {
                [ErrorSeverity.LOW]: "File operation completed with minor issues.",
                [ErrorSeverity.MEDIUM]: "File operation failed. Please try again.",
                [ErrorSeverity.HIGH]: "Unable to process file. Please check file format and try again.",
                [ErrorSeverity.CRITICAL]: "Critical file error. Please refresh and try again."
            },
            [ErrorCategory.THREE_JS]: {
                [ErrorSeverity.LOW]: "3D rendering issue occurred. Some 3D features may not work properly.",
                [ErrorSeverity.MEDIUM]: "3D rendering error. Please try refreshing the 3D view.",
                [ErrorSeverity.HIGH]: "3D system error. Please refresh the page to restore 3D functionality.",
                [ErrorSeverity.CRITICAL]: "Critical 3D error. The 3D system is not available."
            },
            [ErrorCategory.CANVAS]: {
                [ErrorSeverity.LOW]: "Canvas operation completed with minor issues.",
                [ErrorSeverity.MEDIUM]: "Canvas error occurred. Some drawing features may not work.",
                [ErrorSeverity.HIGH]: "Canvas system error. Please refresh to restore drawing functionality.",
                [ErrorSeverity.CRITICAL]: "Critical canvas error. Drawing features are not available."
            },
            [ErrorCategory.VECTOR_TOOLS]: {
                [ErrorSeverity.LOW]: "Vector tool issue occurred. Some tools may not work properly.",
                [ErrorSeverity.MEDIUM]: "Vector tools error. Please try using different tools.",
                [ErrorSeverity.HIGH]: "Vector system error. Please refresh to restore vector functionality.",
                [ErrorSeverity.CRITICAL]: "Critical vector error. Vector tools are not available."
            },
            [ErrorCategory.EMBROIDERY]: {
                [ErrorSeverity.LOW]: "Embroidery feature issue occurred. Some features may not work properly.",
                [ErrorSeverity.MEDIUM]: "Embroidery system error. Please try different embroidery settings.",
                [ErrorSeverity.HIGH]: "Embroidery system error. Please refresh to restore embroidery functionality.",
                [ErrorSeverity.CRITICAL]: "Critical embroidery error. Embroidery features are not available."
            }
        };
        return messages[category]?.[severity] || "An unexpected error occurred. Please try again.";
    }
    generateSuggestedAction(error, category) {
        const actions = {
            [ErrorCategory.RENDERING]: "Try refreshing the page or reducing the complexity of your design.",
            [ErrorCategory.USER_INPUT]: "Check your input format and try again.",
            [ErrorCategory.NETWORK]: "Check your internet connection and try again.",
            [ErrorCategory.FILE_OPERATION]: "Try using a different file format or check file permissions.",
            [ErrorCategory.THREE_JS]: "Try refreshing the page or updating your browser.",
            [ErrorCategory.CANVAS]: "Try clearing the canvas and starting over.",
            [ErrorCategory.VECTOR_TOOLS]: "Try using different vector tools or simplifying your design.",
            [ErrorCategory.EMBROIDERY]: "Try adjusting embroidery settings or using different stitch types."
        };
        return actions[category];
    }
    logError(error) {
        this.errorLog.push(error);
        // Keep log size manageable
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog = this.errorLog.slice(-this.maxLogSize);
        }
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('🚨 Error Handler:', {
                id: error.id,
                message: error.message,
                severity: error.severity,
                category: error.category,
                context: error.context,
                stack: error.stack
            });
        }
    }
    notifyListeners(error) {
        this.errorListeners.forEach(listener => {
            try {
                listener(error);
            }
            catch (listenerError) {
                console.error('Error in error listener:', listenerError);
            }
        });
    }
    showUserMessage(error) {
        // In a real application, this would show a user-friendly notification
        // For now, we'll use console.warn for high/critical errors
        if (error.severity === ErrorSeverity.HIGH || error.severity === ErrorSeverity.CRITICAL) {
            console.warn('🚨 User Notification:', error.userMessage);
            if (error.suggestedAction) {
                console.warn('💡 Suggested Action:', error.suggestedAction);
            }
        }
    }
    /**
     * Add error listener
     */
    addErrorListener(listener) {
        this.errorListeners.push(listener);
    }
    /**
     * Remove error listener
     */
    removeErrorListener(listener) {
        const index = this.errorListeners.indexOf(listener);
        if (index > -1) {
            this.errorListeners.splice(index, 1);
        }
    }
    /**
     * Get error statistics
     */
    getErrorStats() {
        const bySeverity = Object.values(ErrorSeverity).reduce((acc, severity) => {
            acc[severity] = this.errorLog.filter(e => e.severity === severity).length;
            return acc;
        }, {});
        const byCategory = Object.values(ErrorCategory).reduce((acc, category) => {
            acc[category] = this.errorLog.filter(e => e.category === category).length;
            return acc;
        }, {});
        return {
            total: this.errorLog.length,
            bySeverity,
            byCategory,
            recent: this.errorLog.slice(-10) // Last 10 errors
        };
    }
    /**
     * Clear error log
     */
    clearErrorLog() {
        this.errorLog = [];
    }
    /**
     * Get all errors
     */
    getAllErrors() {
        return [...this.errorLog];
    }
    /**
     * Get errors by category
     */
    getErrorsByCategory(category) {
        return this.errorLog.filter(error => error.category === category);
    }
    /**
     * Get errors by severity
     */
    getErrorsBySeverity(severity) {
        return this.errorLog.filter(error => error.severity === severity);
    }
}
// Export singleton instance
export const centralizedErrorHandler = new CentralizedErrorHandler();
// Export convenience functions
export const handleError = (error, context, severity, category) => centralizedErrorHandler.handleError(error, context, severity, category);
export const handleRenderingError = (error, context) => centralizedErrorHandler.handleRenderingError(error, context);
export const handleUserInputError = (error, context) => centralizedErrorHandler.handleUserInputError(error, context);
export const handleNetworkError = (error, context) => centralizedErrorHandler.handleNetworkError(error, context);
export const handleFileError = (error, context) => centralizedErrorHandler.handleFileError(error, context);
export const handleThreeJSError = (error, context) => centralizedErrorHandler.handleThreeJSError(error, context);
export const handleCanvasError = (error, context) => centralizedErrorHandler.handleCanvasError(error, context);
export const handleVectorToolsError = (error, context) => centralizedErrorHandler.handleVectorToolsError(error, context);
export const handleEmbroideryError = (error, context) => centralizedErrorHandler.handleEmbroideryError(error, context);
export default centralizedErrorHandler;
