/**
 * Simple Error Handler
 * Fixes critical error handling issues
 */
export var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["LOW"] = "LOW";
    ErrorSeverity["MEDIUM"] = "MEDIUM";
    ErrorSeverity["HIGH"] = "HIGH";
    ErrorSeverity["CRITICAL"] = "CRITICAL";
})(ErrorSeverity || (ErrorSeverity = {}));
export class SimpleErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100;
    }
    handleError(error, component, severity = ErrorSeverity.MEDIUM) {
        const errorInfo = {
            id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            message: error.message,
            severity,
            component,
            timestamp: Date.now(),
            resolved: false
        };
        this.errors.push(errorInfo);
        // Keep only recent errors
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }
        // Log error
        console.error(`[${severity}] ${component}: ${error.message}`, error);
        // Show user notification for high severity errors
        if (severity === ErrorSeverity.HIGH || severity === ErrorSeverity.CRITICAL) {
            this.showUserNotification(errorInfo);
        }
        return errorInfo.id;
    }
    showUserNotification(errorInfo) {
        // Simple notification - in a real app, this would show a proper UI notification
        const notification = document.createElement('div');
        notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${errorInfo.severity === ErrorSeverity.CRITICAL ? '#dc3545' : '#ffc107'};
      color: white;
      padding: 12px 16px;
      border-radius: 4px;
      z-index: 10000;
      max-width: 300px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
        notification.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 4px;">
        ${errorInfo.severity === ErrorSeverity.CRITICAL ? 'Critical Error' : 'Error'}
      </div>
      <div style="font-size: 14px;">
        ${errorInfo.message}
      </div>
      <div style="font-size: 12px; margin-top: 4px; opacity: 0.8;">
        ${errorInfo.component}
      </div>
    `;
        document.body.appendChild(notification);
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
    getErrors() {
        return [...this.errors];
    }
    clearErrors() {
        this.errors = [];
    }
}
export const simpleErrorHandler = new SimpleErrorHandler();
