/**
 * Performance Monitoring System
 * Tracks and analyzes application performance metrics
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = [];
        this.maxMetrics = 1000;
        this.isMonitoring = false;
    }
    /**
     * Start performance monitoring
     */
    startMonitoring() {
        if (this.isMonitoring)
            return;
        this.isMonitoring = true;
        console.log('🚀 Performance monitoring started');
    }
    /**
     * Stop performance monitoring
     */
    stopMonitoring() {
        this.isMonitoring = false;
        console.log('⏹️ Performance monitoring stopped');
    }
    /**
     * Track a custom metric
     */
    trackMetric(name, value, unit = 'ms', category = 'custom', component) {
        const metric = {
            id: this.generateMetricId(),
            name,
            value,
            unit,
            timestamp: Date.now(),
            category,
            component
        };
        this.metrics.push(metric);
        this.cleanupOldMetrics();
    }
    /**
     * Track render time for a component
     */
    trackRenderTime(component, renderTime) {
        this.trackMetric('render_time', renderTime, 'ms', 'rendering', component);
    }
    /**
     * Track memory usage
     */
    trackMemoryUsage(component) {
        if ('memory' in performance) {
            const memory = performance.memory;
            if (memory) {
                this.trackMetric('memory_used', memory.usedJSHeapSize, 'bytes', 'memory', component);
            }
        }
    }
    /**
     * Get performance statistics for a specific metric
     */
    getMetricStats(metricName, component) {
        let filteredMetrics = this.metrics.filter(m => m.name === metricName);
        if (component) {
            filteredMetrics = filteredMetrics.filter(m => m.component === component);
        }
        if (filteredMetrics.length === 0)
            return null;
        const values = filteredMetrics.map(m => m.value).sort((a, b) => a - b);
        return {
            average: values.reduce((sum, val) => sum + val, 0) / values.length,
            min: values[0],
            max: values[values.length - 1],
            count: values.length
        };
    }
    /**
     * Get all metrics
     */
    getAllMetrics() {
        return [...this.metrics];
    }
    /**
     * Clear all metrics
     */
    clearMetrics() {
        this.metrics = [];
    }
    generateMetricId() {
        return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    cleanupOldMetrics() {
        if (this.metrics.length > this.maxMetrics) {
            this.metrics = this.metrics.slice(-this.maxMetrics);
        }
    }
}
// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();
// Export convenience functions
export const trackMetric = (name, value, unit, category, component) => performanceMonitor.trackMetric(name, value, unit, category, component);
export const trackRenderTime = (component, renderTime) => performanceMonitor.trackRenderTime(component, renderTime);
export const trackMemoryUsage = (component) => performanceMonitor.trackMemoryUsage(component);
export default performanceMonitor;
