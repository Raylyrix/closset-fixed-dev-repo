/**
 * Performance Optimized Renderer
 * Fixes critical performance issues with async rendering and batching
 */
export class PerformanceOptimizedRenderer {
    constructor() {
        this.renderQueue = [];
        this.isProcessing = false;
        this.stats = {
            jobsProcessed: 0,
            averageRenderTime: 0,
            queueLength: 0,
            isProcessing: false,
            lastRenderTime: 0
        };
        this.renderTimes = [];
        this.maxRenderTimeHistory = 100;
        this.batchSize = 50;
        this.maxQueueSize = 1000;
        this.processingTimeout = null;
    }
    // Add render job to queue
    addRenderJob(job) {
        const renderJob = {
            ...job,
            id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now()
        };
        // Check queue size limit
        if (this.renderQueue.length >= this.maxQueueSize) {
            // Remove oldest low priority jobs
            this.renderQueue = this.renderQueue
                .filter(job => job.priority !== 'LOW')
                .sort((a, b) => a.timestamp - b.timestamp);
        }
        this.renderQueue.push(renderJob);
        this.renderQueue.sort((a, b) => {
            const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
        this.updateStats();
        this.processQueue();
        return renderJob.id;
    }
    // Process render queue
    async processQueue() {
        if (this.isProcessing || this.renderQueue.length === 0)
            return;
        this.isProcessing = true;
        this.stats.isProcessing = true;
        try {
            while (this.renderQueue.length > 0) {
                const batch = this.renderQueue.splice(0, this.batchSize);
                await this.processBatch(batch);
                // Yield control to prevent blocking
                await this.yieldControl();
            }
        }
        finally {
            this.isProcessing = false;
            this.stats.isProcessing = false;
            this.updateStats();
        }
    }
    // Process a batch of render jobs
    async processBatch(batch) {
        const startTime = performance.now();
        try {
            // Process jobs in parallel using Promise.allSettled
            const promises = batch.map(job => this.processRenderJob(job));
            const results = await Promise.allSettled(promises);
            // Handle results
            results.forEach((result, index) => {
                const job = batch[index];
                if (result.status === 'fulfilled' && job.callback) {
                    job.callback(result.value);
                }
                else if (result.status === 'rejected') {
                    console.error(`Render job ${job.id} failed:`, result.reason);
                }
            });
        }
        catch (error) {
            console.error('Batch processing error:', error);
        }
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        this.updateRenderTime(renderTime);
        this.stats.jobsProcessed += batch.length;
    }
    // Process individual render job
    async processRenderJob(job) {
        // Simulate async rendering work
        return new Promise((resolve) => {
            // Use requestIdleCallback if available, otherwise setTimeout
            const scheduleWork = (callback) => {
                if ('requestIdleCallback' in window) {
                    requestIdleCallback(callback, { timeout: 16 });
                }
                else {
                    setTimeout(callback, 0);
                }
            };
            scheduleWork(() => {
                // Perform actual rendering work here
                const result = this.performRendering(job);
                resolve(result);
            });
        });
    }
    // Perform actual rendering (to be implemented by specific renderers)
    performRendering(job) {
        // This would be implemented by the specific renderer
        // For now, just return the job data
        return {
            jobId: job.id,
            stitchCount: job.stitches.length,
            timestamp: Date.now()
        };
    }
    // Yield control to prevent blocking
    yieldControl() {
        return new Promise(resolve => {
            if ('scheduler' in window && 'postTask' in window.scheduler) {
                window.scheduler.postTask(() => resolve(), { priority: 'user-blocking' });
            }
            else if ('requestIdleCallback' in window) {
                requestIdleCallback(() => resolve(), { timeout: 16 });
            }
            else {
                setTimeout(resolve, 0);
            }
        });
    }
    // Update render time statistics
    updateRenderTime(renderTime) {
        this.renderTimes.push(renderTime);
        // Keep only recent render times
        if (this.renderTimes.length > this.maxRenderTimeHistory) {
            this.renderTimes.shift();
        }
        // Calculate average
        this.stats.averageRenderTime = this.renderTimes.reduce((sum, time) => sum + time, 0) / this.renderTimes.length;
        this.stats.lastRenderTime = renderTime;
    }
    // Update statistics
    updateStats() {
        this.stats.queueLength = this.renderQueue.length;
    }
    // Get current statistics
    getStats() {
        return { ...this.stats };
    }
    // Clear queue
    clearQueue() {
        this.renderQueue = [];
        this.updateStats();
    }
    // Cancel specific job
    cancelJob(jobId) {
        const index = this.renderQueue.findIndex(job => job.id === jobId);
        if (index !== -1) {
            this.renderQueue.splice(index, 1);
            this.updateStats();
            return true;
        }
        return false;
    }
    // Configuration
    setBatchSize(size) {
        this.batchSize = Math.max(1, size);
    }
    setMaxQueueSize(size) {
        this.maxQueueSize = Math.max(10, size);
    }
    // Cleanup
    destroy() {
        this.clearQueue();
        if (this.processingTimeout) {
            clearTimeout(this.processingTimeout);
        }
    }
}
// Web Worker for heavy rendering operations
export class RenderingWorker {
    constructor() {
        this.worker = null;
        this.isSupported = false;
        this.initializeWorker();
    }
    initializeWorker() {
        try {
            // Create a simple worker for rendering operations
            const workerCode = `
        self.onmessage = function(e) {
          const { jobId, stitches, operation } = e.data;
          
          try {
            let result;
            
            switch (operation) {
              case 'renderStitches':
                result = renderStitches(stitches);
                break;
              case 'processPattern':
                result = processPattern(stitches);
                break;
              default:
                result = { error: 'Unknown operation' };
            }
            
            self.postMessage({
              jobId,
              result,
              success: true
            });
          } catch (error) {
            self.postMessage({
              jobId,
              error: error.message,
              success: false
            });
          }
        };
        
        function renderStitches(stitches) {
          // Simulate heavy rendering work
          const start = performance.now();
          
          // Process stitches
          const processed = stitches.map(stitch => ({
            ...stitch,
            processed: true,
            renderTime: performance.now() - start
          }));
          
          return {
            processedStitches: processed,
            totalTime: performance.now() - start
          };
        }
        
        function processPattern(stitches) {
          // Simulate pattern processing
          const start = performance.now();
          
          // Analyze pattern
          const analysis = {
            complexity: stitches.length,
            estimatedTime: stitches.length * 0.1,
            quality: 'high'
          };
          
          return {
            analysis,
            totalTime: performance.now() - start
          };
        }
      `;
            const blob = new Blob([workerCode], { type: 'application/javascript' });
            this.worker = new Worker(URL.createObjectURL(blob));
            this.isSupported = true;
        }
        catch (error) {
            console.warn('Web Worker not supported, falling back to main thread');
            this.isSupported = false;
        }
    }
    // Process rendering job in worker
    async processJob(job, operation) {
        if (!this.isSupported || !this.worker) {
            // Fallback to main thread
            return this.processJobMainThread(job, operation);
        }
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Worker job timeout'));
            }, 10000); // 10 second timeout
            const handleMessage = (e) => {
                if (e.data.jobId === job.id) {
                    clearTimeout(timeout);
                    this.worker.removeEventListener('message', handleMessage);
                    if (e.data.success) {
                        resolve(e.data.result);
                    }
                    else {
                        reject(new Error(e.data.error));
                    }
                }
            };
            this.worker.addEventListener('message', handleMessage);
            this.worker.postMessage({
                jobId: job.id,
                stitches: job.stitches,
                operation
            });
        });
    }
    // Fallback processing on main thread
    async processJobMainThread(job, operation) {
        // Use requestIdleCallback to avoid blocking
        return new Promise((resolve) => {
            const process = () => {
                // Simulate processing
                const result = {
                    jobId: job.id,
                    stitchCount: job.stitches.length,
                    operation,
                    timestamp: Date.now()
                };
                resolve(result);
            };
            if ('requestIdleCallback' in window) {
                requestIdleCallback(process, { timeout: 16 });
            }
            else {
                setTimeout(process, 0);
            }
        });
    }
    // Cleanup
    destroy() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }
}
// Singleton instances
export const performanceRenderer = new PerformanceOptimizedRenderer();
export const renderingWorker = new RenderingWorker();
