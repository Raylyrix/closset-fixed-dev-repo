/**
 * AI-Powered Performance Manager for Closset
 * Intelligently manages memory, CPU, and rendering performance
 */
class AIPerformanceManager {
    constructor() {
        this.memoryThreshold = 0.9; // 90% memory threshold
        this.cpuThreshold = 0.8; // 80% CPU threshold
        this.frameRateThreshold = 20; // Minimum acceptable FPS
        this.isMonitoring = false;
        this.performanceHistory = [];
        this.optimizationStrategies = new Map();
        this.memoryCleanupQueue = [];
        this.initializeOptimizationStrategies();
        this.startMonitoring();
    }
    initializeOptimizationStrategies() {
        // Memory optimization strategies
        this.optimizationStrategies.set('memory', {
            high: () => this.aggressiveMemoryCleanup(),
            medium: () => this.moderateMemoryCleanup(),
            low: () => this.lightMemoryCleanup()
        });
        // CPU optimization strategies
        this.optimizationStrategies.set('cpu', {
            high: () => this.reduceSimulationQuality(0.5),
            medium: () => this.reduceSimulationQuality(0.7),
            low: () => this.reduceSimulationQuality(0.9)
        });
        // Rendering optimization strategies - Disabled aggressive quality reduction
        this.optimizationStrategies.set('rendering', {
            high: () => this.reduceRenderingQuality(0.9), // Keep high quality
            medium: () => this.reduceRenderingQuality(0.95), // Keep high quality
            low: () => this.reduceRenderingQuality(0.98) // Keep high quality
        });
    }
    startMonitoring() {
        if (this.isMonitoring)
            return;
        this.isMonitoring = true;
        this.monitorInterval = setInterval(() => {
            this.analyzePerformance();
        }, 10000); // Check every 10 seconds
        // Monitor memory less frequently
        this.memoryInterval = setInterval(() => {
            this.checkMemoryUsage();
        }, 30000); // Check every 30 seconds
    }
    stopMonitoring() {
        this.isMonitoring = false;
        if (this.monitorInterval)
            clearInterval(this.monitorInterval);
        if (this.memoryInterval)
            clearInterval(this.memoryInterval);
    }
    async analyzePerformance() {
        try {
            const performance = await this.getPerformanceMetrics();
            this.performanceHistory.push({
                timestamp: Date.now(),
                ...performance
            });
            // Keep only last 60 seconds of history
            this.performanceHistory = this.performanceHistory.slice(-60);
            // AI-driven optimization decisions
            this.makeOptimizationDecisions(performance);
        }
        catch (error) {
            console.warn('Performance monitoring error:', error);
        }
    }
    async getPerformanceMetrics() {
        const memory = await this.getMemoryUsage();
        const cpu = await this.getCPUUsage();
        const frameRate = this.getFrameRate();
        return { memory, cpu, frameRate };
    }
    async getMemoryUsage() {
        const perf = performance;
        if (perf && perf.memory) {
            const used = perf.memory.usedJSHeapSize;
            const total = perf.memory.totalJSHeapSize;
            return total ? used / total : 0;
        }
        return 0;
    }
    async getCPUUsage() {
        // Estimate CPU usage based on frame timing
        const entries = performance.getEntriesByType('measure');
        const recentEntries = entries.filter(entry => Date.now() - entry.startTime < 1000);
        if (recentEntries.length === 0)
            return 0;
        const totalTime = recentEntries.reduce((sum, entry) => sum + entry.duration, 0);
        return Math.min(totalTime / 1000, 1); // Normalize to 0-1
    }
    getFrameRate() {
        // Simple FPS estimation
        const now = performance.now();
        if (!this.lastFrameTime) {
            this.lastFrameTime = now;
            return 60;
        }
        const delta = now - this.lastFrameTime;
        this.lastFrameTime = now;
        return Math.min(1000 / delta, 60);
    }
    makeOptimizationDecisions(metrics) {
        const { memory, cpu, frameRate } = metrics;
        // Memory optimization
        if (memory > this.memoryThreshold) {
            const severity = memory > 0.95 ? 'high' : memory > 0.85 ? 'medium' : 'low';
            this.optimizationStrategies.get('memory')?.[severity]();
            this.logOptimization('memory', severity, memory);
        }
        // CPU optimization
        if (cpu > this.cpuThreshold) {
            const severity = cpu > 0.9 ? 'high' : cpu > 0.8 ? 'medium' : 'low';
            this.optimizationStrategies.get('cpu')?.[severity]();
            this.logOptimization('cpu', severity, cpu);
        }
        // Rendering optimization
        if (frameRate < this.frameRateThreshold) {
            const severity = frameRate < 15 ? 'high' : frameRate < 25 ? 'medium' : 'low';
            this.optimizationStrategies.get('rendering')?.[severity]();
            this.logOptimization('rendering', severity, frameRate);
        }
    }
    async checkMemoryUsage() {
        const memory = await this.getMemoryUsage();
        if (memory > 0.98) {
            // Critical memory usage - immediate cleanup
            await this.emergencyMemoryCleanup();
        }
        else if (memory > 0.90) {
            // High memory usage - moderate cleanup
            this.moderateMemoryCleanup();
        }
        else if (memory > 0.85) {
            // Moderate memory usage - light cleanup
            this.lightMemoryCleanup();
        }
    }
    aggressiveMemoryCleanup() {
        console.log('🧹 AI Performance: Aggressive memory cleanup');
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
        // Clear texture cache
        this.clearTextureCache();
        // Clear unused layers
        this.clearUnusedLayers();
        // Clear performance history
        this.performanceHistory = this.performanceHistory.slice(-10);
    }
    moderateMemoryCleanup() {
        console.log('🧹 AI Performance: Moderate memory cleanup');
        // Clear texture cache
        this.clearTextureCache();
        // Clear old performance data
        this.performanceHistory = this.performanceHistory.slice(-30);
    }
    lightMemoryCleanup() {
        console.log('🧹 AI Performance: Light memory cleanup');
        // Clear only very old data
        this.performanceHistory = this.performanceHistory.slice(-50);
    }
    async emergencyMemoryCleanup() {
        console.warn('🚨 AI Performance: Emergency memory cleanup');
        // Force garbage collection
        if (window.gc) {
            window.gc();
        }
        // Clear all caches
        this.clearTextureCache();
        this.clearUnusedLayers();
        // Clear performance history
        this.performanceHistory = [];
        // Dispatch cleanup event
        window.dispatchEvent(new CustomEvent('emergencyMemoryCleanup'));
    }
    clearTextureCache() {
        // This will be called by the texture manager
        window.dispatchEvent(new CustomEvent('clearTextureCache'));
    }
    clearUnusedLayers() {
        // This will be called by the layer manager
        window.dispatchEvent(new CustomEvent('clearUnusedLayers'));
    }
    reduceSimulationQuality(factor) {
        console.log(`🎯 AI Performance: Reducing simulation quality to ${factor * 100}%`);
        window.dispatchEvent(new CustomEvent('reduceSimulationQuality', {
            detail: { factor }
        }));
    }
    reduceRenderingQuality(factor) {
        console.log(`🎨 AI Performance: Reducing rendering quality to ${factor * 100}%`);
        window.dispatchEvent(new CustomEvent('reduceRenderingQuality', {
            detail: { factor }
        }));
    }
    logOptimization(type, severity, value) {
        console.log(`🤖 AI Performance: ${type} optimization (${severity}) - Value: ${(value * 100).toFixed(1)}%`);
    }
    getPerformanceReport() {
        const recent = this.performanceHistory.slice(-10);
        if (recent.length === 0)
            return null;
        const avgMemory = recent.reduce((sum, entry) => sum + entry.memory, 0) / recent.length;
        const avgCPU = recent.reduce((sum, entry) => sum + entry.cpu, 0) / recent.length;
        const avgFPS = recent.reduce((sum, entry) => sum + entry.frameRate, 0) / recent.length;
        return {
            memory: avgMemory,
            cpu: avgCPU,
            frameRate: avgFPS,
            status: this.getPerformanceStatus(avgMemory, avgCPU, avgFPS)
        };
    }
    getPerformanceStatus(memory, cpu, fps) {
        if (memory > 0.9 || cpu > 0.9 || fps < 15)
            return 'critical';
        if (memory > 0.8 || cpu > 0.8 || fps < 25)
            return 'warning';
        if (memory > 0.7 || cpu > 0.7 || fps < 35)
            return 'moderate';
        return 'good';
    }
}
// Export singleton instance
export const aiPerformanceManager = new AIPerformanceManager();
export default aiPerformanceManager;
