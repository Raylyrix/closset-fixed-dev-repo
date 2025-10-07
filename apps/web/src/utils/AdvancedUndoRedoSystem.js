/**
 * Advanced Undo/Redo System for Embroidery Tool
 * Provides comprehensive history management with memory optimization
 */
export class AdvancedUndoRedoSystem {
    constructor(options = {}) {
        this.history = [];
        this.currentIndex = -1;
        this.maxHistorySize = 50;
        this.enableCompression = true;
        this.enableMemoryOptimization = true;
        this.autoSaveInterval = null;
        this.isCompressing = false;
        this.compressionThreshold = 10; // Compress when history exceeds this size
        this.maxHistorySize = options.maxHistorySize || 50;
        this.enableCompression = options.enableCompression !== false;
        this.enableMemoryOptimization = options.enableMemoryOptimization !== false;
        if (options.autoSaveInterval) {
            this.startAutoSave(options.autoSaveInterval);
        }
    }
    static getInstance(options) {
        if (!AdvancedUndoRedoSystem.instance) {
            AdvancedUndoRedoSystem.instance = new AdvancedUndoRedoSystem(options);
        }
        return AdvancedUndoRedoSystem.instance;
    }
    /**
     * Save current state to history
     */
    saveState(stitches, action, description) {
        // Remove any states after current index (when branching from history)
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }
        // Create new state
        const state = {
            id: this.generateId(),
            timestamp: Date.now(),
            action,
            stitches: this.enableMemoryOptimization
                ? this.optimizeStitches(stitches)
                : [...stitches],
            metadata: {
                description,
                stitchCount: stitches.length,
                memoryUsage: this.calculateMemoryUsage(stitches)
            }
        };
        // Add to history
        this.history.push(state);
        this.currentIndex = this.history.length - 1;
        // Compress history if needed
        if (this.enableCompression && this.history.length > this.compressionThreshold) {
            this.compressHistory();
        }
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
            this.currentIndex--;
        }
        console.log(`💾 Saved state: ${action} (${stitches.length} stitches)`);
    }
    /**
     * Undo last action
     */
    undo() {
        if (this.currentIndex <= 0) {
            console.log('⚠️ Nothing to undo');
            return null;
        }
        this.currentIndex--;
        const state = this.history[this.currentIndex];
        console.log(`↩️ Undoing: ${state.action}`);
        return this.restoreStitches(state.stitches);
    }
    /**
     * Redo next action
     */
    redo() {
        if (this.currentIndex >= this.history.length - 1) {
            console.log('⚠️ Nothing to redo');
            return null;
        }
        this.currentIndex++;
        const state = this.history[this.currentIndex];
        console.log(`↪️ Redoing: ${state.action}`);
        return this.restoreStitches(state.stitches);
    }
    /**
     * Check if undo is available
     */
    canUndo() {
        return this.currentIndex > 0;
    }
    /**
     * Check if redo is available
     */
    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }
    /**
     * Get current state
     */
    getCurrentState() {
        if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
            return this.history[this.currentIndex];
        }
        return null;
    }
    /**
     * Get history list
     */
    getHistory() {
        return [...this.history];
    }
    /**
     * Clear all history
     */
    clearHistory() {
        this.history = [];
        this.currentIndex = -1;
        console.log('🗑️ History cleared');
    }
    /**
     * Jump to specific state
     */
    jumpToState(index) {
        if (index < 0 || index >= this.history.length) {
            console.log('⚠️ Invalid state index');
            return null;
        }
        this.currentIndex = index;
        const state = this.history[index];
        console.log(`⏭️ Jumping to: ${state.action}`);
        return this.restoreStitches(state.stitches);
    }
    /**
     * Get history statistics
     */
    getStatistics() {
        const memoryUsage = this.history.reduce((sum, state) => sum + (state.metadata?.memoryUsage || 0), 0);
        return {
            totalStates: this.history.length,
            currentIndex: this.currentIndex,
            canUndo: this.canUndo(),
            canRedo: this.canRedo(),
            memoryUsage,
            oldestState: this.history.length > 0 ? this.history[0].timestamp : 0,
            newestState: this.history.length > 0 ? this.history[this.history.length - 1].timestamp : 0
        };
    }
    /**
     * Export history to JSON
     */
    exportHistory() {
        return JSON.stringify({
            history: this.history,
            currentIndex: this.currentIndex,
            timestamp: Date.now()
        }, null, 2);
    }
    /**
     * Import history from JSON
     */
    importHistory(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.history && Array.isArray(data.history)) {
                this.history = data.history;
                this.currentIndex = data.currentIndex || -1;
                console.log(`📥 Imported ${this.history.length} history states`);
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('❌ Failed to import history:', error);
            return false;
        }
    }
    /**
     * Compress history to save memory
     */
    compressHistory() {
        if (this.isCompressing)
            return;
        this.isCompressing = true;
        console.log('🗜️ Compressing history...');
        try {
            // Keep every 3rd state and the most recent 10 states
            const keepIndices = new Set();
            // Always keep the first and last states
            if (this.history.length > 0) {
                keepIndices.add(0);
                keepIndices.add(this.history.length - 1);
            }
            // Keep every 3rd state
            for (let i = 2; i < this.history.length - 1; i += 3) {
                keepIndices.add(i);
            }
            // Keep the most recent 10 states
            const recentStart = Math.max(0, this.history.length - 10);
            for (let i = recentStart; i < this.history.length; i++) {
                keepIndices.add(i);
            }
            // Filter history
            const compressedHistory = this.history.filter((_, index) => keepIndices.has(index));
            // Update current index
            const oldIndex = this.currentIndex;
            this.currentIndex = compressedHistory.findIndex(state => state.timestamp === this.history[oldIndex]?.timestamp);
            this.history = compressedHistory;
            console.log(`🗜️ Compressed history: ${this.history.length} states (was ${this.history.length + keepIndices.size - compressedHistory.length})`);
        }
        finally {
            this.isCompressing = false;
        }
    }
    /**
     * Optimize stitches for memory efficiency
     */
    optimizeStitches(stitches) {
        return stitches.map(stitch => ({
            ...stitch,
            points: stitch.points.map(point => ({
                x: Math.round(point.x * 100) / 100, // Round to 2 decimal places
                y: Math.round(point.y * 100) / 100
            }))
        }));
    }
    /**
     * Restore stitches from optimized format
     */
    restoreStitches(stitches) {
        return stitches.map(stitch => ({
            ...stitch,
            points: stitch.points.map(point => ({
                x: point.x,
                y: point.y
            }))
        }));
    }
    /**
     * Calculate memory usage of stitches
     */
    calculateMemoryUsage(stitches) {
        let totalSize = 0;
        for (const stitch of stitches) {
            // Rough estimate of memory usage
            totalSize += JSON.stringify(stitch).length * 2; // UTF-16 encoding
        }
        return totalSize;
    }
    /**
     * Generate unique ID for state
     */
    generateId() {
        return `state_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Start auto-save functionality
     */
    startAutoSave(interval) {
        this.autoSaveInterval = setInterval(() => {
            if (this.history.length > 0) {
                this.saveToLocalStorage();
            }
        }, interval);
    }
    /**
     * Save to local storage
     */
    saveToLocalStorage() {
        try {
            const data = this.exportHistory();
            localStorage.setItem('embroidery_history', data);
        }
        catch (error) {
            console.warn('⚠️ Failed to save history to localStorage:', error);
        }
    }
    /**
     * Load from local storage
     */
    loadFromLocalStorage() {
        try {
            const data = localStorage.getItem('embroidery_history');
            if (data) {
                return this.importHistory(data);
            }
        }
        catch (error) {
            console.warn('⚠️ Failed to load history from localStorage:', error);
        }
        return false;
    }
    /**
     * Dispose of the system
     */
    dispose() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
        this.clearHistory();
    }
}
// Export singleton instance
export const advancedUndoRedoSystem = AdvancedUndoRedoSystem.getInstance({
    maxHistorySize: 50,
    enableCompression: true,
    enableMemoryOptimization: true,
    autoSaveInterval: 30000 // Auto-save every 30 seconds
});
