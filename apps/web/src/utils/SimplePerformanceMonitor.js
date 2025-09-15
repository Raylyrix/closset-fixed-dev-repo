/**
 * Simple Performance Monitor
 * Basic performance tracking and alerting
 */
export class SimplePerformanceMonitor {
    constructor() {
        this.metrics = [];
        this.alerts = [];
        this.isMonitoring = false;
        this.monitoringInterval = null;
        this.alertCallbacks = [];
        this.maxMetricsHistory = 100;
        this.startMonitoring();
    }
    startMonitoring(intervalMs = 1000) {
        if (this.isMonitoring)
            return;
        this.isMonitoring = true;
        this.monitoringInterval = setInterval(() => {
            this.collectMetrics();
            this.checkThresholds();
        }, intervalMs);
    }
    stopMonitoring() {
        if (!this.isMonitoring)
            return;
        this.isMonitoring = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }
    collectMetrics() {
        const metrics = {
            fps: this.calculateFPS(),
            renderTime: this.getLastRenderTime(),
            memoryUsage: this.getMemoryUsage(),
            stitchCount: 0, // Will be set by the caller
            timestamp: Date.now()
        };
        this.metrics.push(metrics);
        // Keep only recent metrics
        if (this.metrics.length > this.maxMetricsHistory) {
            this.metrics.shift();
        }
    }
    calculateFPS() {
        if (this.metrics.length < 2)
            return 60;
        const recent = this.metrics.slice(-10);
        const avgFrameTime = recent.reduce((sum, m) => sum + (1000 / m.fps), 0) / recent.length;
        return Math.round(1000 / avgFrameTime);
    }
    getLastRenderTime() {
        const lastMetric = this.metrics[this.metrics.length - 1];
        return lastMetric?.renderTime || 0;
    }
    getMemoryUsage() {
        if ('memory' in performance) {
            const memory = performance.memory;
            return Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100);
        }
        return 0;
    }
    checkThresholds() {
        const current = this.metrics[this.metrics.length - 1];
        if (!current)
            return;
        // Check FPS
        if (current.fps < 30) {
            this.createAlert('FPS', 'HIGH', `Low FPS detected: ${current.fps}`);
        }
        // Check render time
        if (current.renderTime > 50) {
            this.createAlert('RENDER_TIME', 'HIGH', `High render time: ${current.renderTime}ms`);
        }
        // Check memory usage
        if (current.memoryUsage > 80) {
            this.createAlert('MEMORY', 'CRITICAL', `High memory usage: ${current.memoryUsage}%`);
        }
    }
    createAlert(type, severity, message) {
        const alert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            severity,
            message,
            timestamp: Date.now()
        };
        this.alerts.push(alert);
        // Notify callbacks
        this.alertCallbacks.forEach(callback => {
            try {
                callback(alert);
            }
            catch (error) {
                console.error('Error in alert callback:', error);
            }
        });
        console.warn(`⚠️ Performance Alert [${severity}]: ${message}`);
    }
    onAlert(callback) {
        this.alertCallbacks.push(callback);
        return () => {
            const index = this.alertCallbacks.indexOf(callback);
            if (index > -1) {
                this.alertCallbacks.splice(index, 1);
            }
        };
    }
    getCurrentMetrics() {
        return this.metrics[this.metrics.length - 1] || null;
    }
    getActiveAlerts() {
        return this.alerts.filter(alert => Date.now() - alert.timestamp < 30000 // Alerts from last 30 seconds
        );
    }
    updateStitchCount(count) {
        if (this.metrics.length > 0) {
            this.metrics[this.metrics.length - 1].stitchCount = count;
        }
    }
    updateRenderTime(time) {
        if (this.metrics.length > 0) {
            this.metrics[this.metrics.length - 1].renderTime = time;
        }
    }
    destroy() {
        this.stopMonitoring();
        this.alertCallbacks = [];
        this.metrics = [];
        this.alerts = [];
    }
}
export const simplePerformanceMonitor = new SimplePerformanceMonitor();
