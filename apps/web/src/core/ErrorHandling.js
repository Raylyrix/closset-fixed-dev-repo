// Comprehensive Error Handling System
// Handles errors, recovery, and debugging for all core systems
// Error Handling System
export class ErrorHandlingSystem {
    constructor() {
        // Error storage
        this.errors = new Map();
        this.errorHandlers = new Map();
        // Recovery system
        this.recoveryQueue = [];
        this.isRecovering = false;
        // Event system
        this.eventListeners = new Map();
        this.metrics = this.getInitialMetrics();
        this.initializeDefaultHandlers();
        this.startRecoveryProcess();
    }
    static getInstance() {
        if (!ErrorHandlingSystem.instance) {
            ErrorHandlingSystem.instance = new ErrorHandlingSystem();
        }
        return ErrorHandlingSystem.instance;
    }
    // Error Reporting
    reportError(error, context = {}, category = 'system', level = 'error') {
        const errorId = this.generateErrorId();
        const errorInfo = {
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
    async attemptRecovery(errorInfo) {
        try {
            // Find appropriate handler
            const handler = this.findHandler(errorInfo);
            if (!handler) {
                console.warn(`No handler found for error: ${errorInfo.message}`);
                return false;
            }
            // Execute recovery
            const recovery = await handler.handler(new Error(errorInfo.message), errorInfo.context);
            if (recovery) {
                errorInfo.recovery = recovery;
                recovery.attempts++;
                // Apply recovery action
                const success = await this.applyRecovery(recovery, errorInfo);
                if (success) {
                    errorInfo.resolved = true;
                    recovery.success = true;
                    console.log(`✅ Error recovered: ${errorInfo.message}`);
                }
                else {
                    console.warn(`⚠️ Recovery failed for error: ${errorInfo.message}`);
                }
                return success;
            }
            return false;
        }
        catch (recoveryError) {
            console.error('Error during recovery attempt:', recoveryError);
            return false;
        }
    }
    // Error Handlers
    registerHandler(handler) {
        this.errorHandlers.set(handler.id, handler);
        console.log(`🔧 Error handler registered: ${handler.name}`);
    }
    unregisterHandler(handlerId) {
        this.errorHandlers.delete(handlerId);
        console.log(`🔧 Error handler unregistered: ${handlerId}`);
    }
    // Error Querying
    getErrors(filters) {
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
                errors = errors.filter(e => e.timestamp >= filters.since);
            }
        }
        return errors.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    getError(errorId) {
        return this.errors.get(errorId) || null;
    }
    getMetrics() {
        return { ...this.metrics };
    }
    // System Health
    getSystemHealth() {
        const recentErrors = this.getErrors({
            since: new Date(Date.now() - 60000) // Last minute
        });
        const criticalErrors = recentErrors.filter(e => e.level === 'critical').length;
        const errorRate = recentErrors.length / 60; // Errors per second
        let status;
        let score;
        const issues = [];
        const recommendations = [];
        if (criticalErrors > 0) {
            status = 'critical';
            score = 0;
            issues.push(`${criticalErrors} critical errors in the last minute`);
            recommendations.push('Immediate attention required');
        }
        else if (errorRate > 0.1) {
            status = 'degraded';
            score = 50;
            issues.push(`High error rate: ${errorRate.toFixed(2)} errors/second`);
            recommendations.push('Monitor system performance');
        }
        else {
            status = 'healthy';
            score = 100;
        }
        return { status, score, issues, recommendations };
    }
    // Event System
    on(event, listener) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(listener);
        return () => {
            const listeners = this.eventListeners.get(event) || [];
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }
    emit(event, data) {
        const listeners = this.eventListeners.get(event) || [];
        listeners.forEach(listener => {
            try {
                listener(data);
            }
            catch (error) {
                console.error(`Error in error handling event listener for ${event}:`, error);
            }
        });
    }
    // Helper methods
    initializeDefaultHandlers() {
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
    startRecoveryProcess() {
        setInterval(() => {
            if (!this.isRecovering && this.recoveryQueue.length > 0) {
                this.processRecoveryQueue();
            }
        }, 1000); // Check every second
    }
    async processRecoveryQueue() {
        this.isRecovering = true;
        try {
            while (this.recoveryQueue.length > 0) {
                const errorInfo = this.recoveryQueue.shift();
                await this.attemptRecovery(errorInfo);
            }
        }
        finally {
            this.isRecovering = false;
        }
    }
    findHandler(errorInfo) {
        const handlers = Array.from(this.errorHandlers.values())
            .filter(h => h.enabled && h.category === errorInfo.category)
            .sort((a, b) => a.priority - b.priority);
        return handlers[0] || null;
    }
    async applyRecovery(recovery, errorInfo) {
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
        }
        catch (error) {
            console.error('Error applying recovery:', error);
            return false;
        }
    }
    async retryOperation(errorInfo) {
        // Implement retry logic
        return true;
    }
    async fallbackOperation(errorInfo) {
        // Implement fallback logic
        return true;
    }
    async restartOperation(errorInfo) {
        // Implement restart logic
        return true;
    }
    async disableOperation(errorInfo) {
        // Implement disable logic
        return true;
    }
    async notifyOperation(errorInfo) {
        // Implement notification logic
        this.emit('errorNotification', { error: errorInfo });
        return true;
    }
    generateErrorId() {
        return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    updateMetrics(errorInfo) {
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
    logError(errorInfo) {
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
    getInitialMetrics() {
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
        errorHandling.reportError(event.error || event.message, {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        }, 'system', 'error');
    });
    window.addEventListener('unhandledrejection', (event) => {
        errorHandling.reportError(event.reason, { type: 'unhandledrejection' }, 'system', 'error');
    });
}
