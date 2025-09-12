/**
 * 📊 Performance Monitor - Production Analytics
 *
 * Comprehensive performance monitoring for production:
 * - Real-time performance metrics
 * - User interaction tracking
 * - Error rate monitoring
 * - Memory usage tracking
 * - Custom event tracking
 */
export class PerformanceMonitor {
    constructor() {
        this.config = {
            enableMetrics: true,
            enableUserTracking: true,
            enableErrorTracking: true,
            enableMemoryTracking: true,
            sampleRate: 1.0,
            maxMetricsHistory: 1000,
            reportingInterval: 30000, // 30 seconds
            enableRealTimeReporting: false
        };
        this.metrics = [];
        this.userInteractions = [];
        this.errors = [];
        this.observers = new Map();
        this.reportingTimer = null;
        // Performance tracking
        this.renderStartTime = 0;
        this.interactionStartTime = 0;
        this.lastMemoryCheck = 0;
        // Event listeners
        this.eventListeners = new Map();
        this.initializeObservers();
        this.startReporting();
    }
    static getInstance() {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }
    /**
     * Configure the performance monitor
     */
    configure(config) {
        this.config = { ...this.config, ...config };
        if (this.config.enableRealTimeReporting) {
            this.startReporting();
        }
        else {
            this.stopReporting();
        }
    }
    /**
     * Start tracking render performance
     */
    startRenderTracking(componentName) {
        if (!this.config.enableMetrics)
            return;
        this.renderStartTime = performance.now();
        console.log(`🎨 Starting render tracking for ${componentName}`);
    }
    /**
     * End tracking render performance
     */
    endRenderTracking(componentName) {
        if (!this.renderStartTime || !this.config.enableMetrics)
            return;
        const renderTime = performance.now() - this.renderStartTime;
        this.recordMetric({
            renderTime,
            memoryUsage: this.getCurrentMemoryUsage(),
            errorCount: this.errors.length,
            userInteractions: this.userInteractions.length,
            timestamp: Date.now()
        });
        console.log(`🎨 Render completed for ${componentName} in ${renderTime.toFixed(2)}ms`);
        this.renderStartTime = 0;
    }
    /**
     * Track user interaction
     */
    trackUserInteraction(type, target, metadata) {
        if (!this.config.enableUserTracking || Math.random() > this.config.sampleRate)
            return;
        const interaction = {
            type,
            target,
            timestamp: Date.now(),
            metadata
        };
        this.userInteractions.push(interaction);
        // Keep only recent interactions
        if (this.userInteractions.length > this.config.maxMetricsHistory) {
            this.userInteractions = this.userInteractions.slice(-this.config.maxMetricsHistory);
        }
        console.log(`👆 User interaction tracked: ${type} on ${target}`);
    }
    /**
     * Track error
     */
    trackError(error, component, severity = 'medium', metadata) {
        if (!this.config.enableErrorTracking)
            return;
        const errorEvent = {
            message: error.message,
            stack: error.stack,
            component,
            timestamp: Date.now(),
            severity,
            metadata
        };
        this.errors.push(errorEvent);
        // Keep only recent errors
        if (this.errors.length > this.config.maxMetricsHistory) {
            this.errors = this.errors.slice(-this.config.maxMetricsHistory);
        }
        console.error(`🚨 Error tracked: ${error.message}`, errorEvent);
        // Report critical errors immediately
        if (severity === 'critical') {
            this.reportMetrics();
        }
    }
    /**
     * Track custom event
     */
    trackCustomEvent(eventName, data) {
        if (Math.random() > this.config.sampleRate)
            return;
        this.trackUserInteraction('custom', eventName, data);
    }
    /**
     * Get current performance metrics
     */
    getMetrics() {
        const current = this.metrics[this.metrics.length - 1] || null;
        const average = this.metrics.length > 0 ? {
            renderTime: this.metrics.reduce((sum, m) => sum + m.renderTime, 0) / this.metrics.length,
            memoryUsage: this.metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / this.metrics.length,
            errorCount: this.errors.length,
            userInteractions: this.userInteractions.length
        } : {};
        return {
            current,
            average,
            history: [...this.metrics]
        };
    }
    /**
     * Get user interaction statistics
     */
    getUserInteractionStats() {
        const byType = {};
        const byTarget = {};
        this.userInteractions.forEach(interaction => {
            byType[interaction.type] = (byType[interaction.type] || 0) + 1;
            byTarget[interaction.target] = (byTarget[interaction.target] || 0) + 1;
        });
        return {
            total: this.userInteractions.length,
            byType,
            byTarget,
            recent: this.userInteractions.slice(-50) // Last 50 interactions
        };
    }
    /**
     * Get error statistics
     */
    getErrorStats() {
        const bySeverity = {};
        const byComponent = {};
        this.errors.forEach(error => {
            bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
            if (error.component) {
                byComponent[error.component] = (byComponent[error.component] || 0) + 1;
            }
        });
        return {
            total: this.errors.length,
            bySeverity,
            byComponent,
            recent: this.errors.slice(-20) // Last 20 errors
        };
    }
    /**
     * Initialize performance observers
     */
    initializeObservers() {
        if (typeof window === 'undefined')
            return;
        // Long task observer
        if ('PerformanceObserver' in window) {
            try {
                const longTaskObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (entry.duration > 50) { // Tasks longer than 50ms
                            console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`);
                            this.trackCustomEvent('long_task', {
                                duration: entry.duration,
                                startTime: entry.startTime
                            });
                        }
                    });
                });
                longTaskObserver.observe({ entryTypes: ['longtask'] });
                this.observers.set('longtask', longTaskObserver);
            }
            catch (error) {
                console.warn('Long task observer not supported:', error);
            }
        }
        // Memory observer
        if (this.config.enableMemoryTracking && 'memory' in performance) {
            this.startMemoryMonitoring();
        }
    }
    /**
     * Start memory monitoring
     */
    startMemoryMonitoring() {
        const checkMemory = () => {
            const memory = performance.memory;
            if (memory) {
                const memoryUsage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
                if (memoryUsage > 80) {
                    console.warn(`⚠️ High memory usage: ${memoryUsage.toFixed(1)}%`);
                    this.trackCustomEvent('high_memory_usage', {
                        used: memory.usedJSHeapSize,
                        total: memory.totalJSHeapSize,
                        limit: memory.jsHeapSizeLimit,
                        percentage: memoryUsage
                    });
                }
            }
        };
        // Check memory every 30 seconds
        const memoryInterval = setInterval(checkMemory, 30000);
        this.eventListeners.set('memory', () => clearInterval(memoryInterval));
    }
    /**
     * Get current memory usage
     */
    getCurrentMemoryUsage() {
        if (typeof window === 'undefined' || !('memory' in performance))
            return 0;
        const memory = performance.memory;
        return memory ? (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100 : 0;
    }
    /**
     * Record performance metric
     */
    recordMetric(metric) {
        this.metrics.push(metric);
        // Keep only recent metrics
        if (this.metrics.length > this.config.maxMetricsHistory) {
            this.metrics = this.metrics.slice(-this.config.maxMetricsHistory);
        }
    }
    /**
     * Start reporting
     */
    startReporting() {
        if (this.reportingTimer)
            return;
        this.reportingTimer = window.setInterval(() => {
            this.reportMetrics();
        }, this.config.reportingInterval);
    }
    /**
     * Stop reporting
     */
    stopReporting() {
        if (this.reportingTimer) {
            clearInterval(this.reportingTimer);
            this.reportingTimer = null;
        }
    }
    /**
     * Report metrics to external service
     */
    reportMetrics() {
        const metrics = this.getMetrics();
        const userStats = this.getUserInteractionStats();
        const errorStats = this.getErrorStats();
        const report = {
            timestamp: Date.now(),
            metrics,
            userInteractions: userStats,
            errors: errorStats,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        console.log('📊 Performance report:', report);
        // In production, send to your analytics service
        // Example: Google Analytics, Mixpanel, Custom API
        if (process.env.NODE_ENV === 'production') {
            this.sendToAnalyticsService(report);
        }
    }
    /**
     * Send data to analytics service
     */
    sendToAnalyticsService(data) {
        try {
            // Example implementation - replace with your analytics service
            fetch('/api/analytics/performance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            }).catch(error => {
                console.warn('Failed to send analytics data:', error);
            });
        }
        catch (error) {
            console.warn('Analytics service unavailable:', error);
        }
    }
    /**
     * Clean up resources
     */
    destroy() {
        this.stopReporting();
        // Clean up observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        // Clean up event listeners
        this.eventListeners.forEach(cleanup => cleanup());
        this.eventListeners.clear();
        // Clear data
        this.metrics = [];
        this.userInteractions = [];
        this.errors = [];
    }
}
// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();
// React hook for easy integration
export const usePerformanceMonitor = () => {
    const monitor = performanceMonitor;
    return {
        startRenderTracking: monitor.startRenderTracking.bind(monitor),
        endRenderTracking: monitor.endRenderTracking.bind(monitor),
        trackUserInteraction: monitor.trackUserInteraction.bind(monitor),
        trackError: monitor.trackError.bind(monitor),
        trackCustomEvent: monitor.trackCustomEvent.bind(monitor),
        getMetrics: monitor.getMetrics.bind(monitor),
        getUserInteractionStats: monitor.getUserInteractionStats.bind(monitor),
        getErrorStats: monitor.getErrorStats.bind(monitor)
    };
};
export default PerformanceMonitor;
