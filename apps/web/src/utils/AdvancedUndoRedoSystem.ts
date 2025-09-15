/**
 * Advanced Undo/Redo System for Embroidery Tool
 * Provides comprehensive history management with memory optimization
 */

import { EmbroideryStitch } from '../services/embroideryService';
import { advancedMemoryManager } from './AdvancedMemoryManager';

export interface HistoryState {
  id: string;
  timestamp: number;
  action: string;
  stitches: EmbroideryStitch[];
  metadata?: {
    description?: string;
    stitchCount?: number;
    memoryUsage?: number;
  };
}

export interface UndoRedoOptions {
  maxHistorySize?: number;
  enableCompression?: boolean;
  enableMemoryOptimization?: boolean;
  autoSaveInterval?: number;
}

export class AdvancedUndoRedoSystem {
  private static instance: AdvancedUndoRedoSystem;
  private history: HistoryState[] = [];
  private currentIndex = -1;
  private maxHistorySize = 50;
  private enableCompression = true;
  private enableMemoryOptimization = true;
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private isCompressing = false;
  private compressionThreshold = 10; // Compress when history exceeds this size

  private constructor(options: UndoRedoOptions = {}) {
    this.maxHistorySize = options.maxHistorySize || 50;
    this.enableCompression = options.enableCompression !== false;
    this.enableMemoryOptimization = options.enableMemoryOptimization !== false;
    
    if (options.autoSaveInterval) {
      this.startAutoSave(options.autoSaveInterval);
    }
  }

  public static getInstance(options?: UndoRedoOptions): AdvancedUndoRedoSystem {
    if (!AdvancedUndoRedoSystem.instance) {
      AdvancedUndoRedoSystem.instance = new AdvancedUndoRedoSystem(options);
    }
    return AdvancedUndoRedoSystem.instance;
  }

  /**
   * Save current state to history
   */
  public saveState(
    stitches: EmbroideryStitch[],
    action: string,
    description?: string
  ): void {
    // Remove any states after current index (when branching from history)
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Create new state
    const state: HistoryState = {
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
  public undo(): EmbroideryStitch[] | null {
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
  public redo(): EmbroideryStitch[] | null {
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
  public canUndo(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Check if redo is available
   */
  public canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get current state
   */
  public getCurrentState(): HistoryState | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex];
    }
    return null;
  }

  /**
   * Get history list
   */
  public getHistory(): HistoryState[] {
    return [...this.history];
  }

  /**
   * Clear all history
   */
  public clearHistory(): void {
    this.history = [];
    this.currentIndex = -1;
    console.log('🗑️ History cleared');
  }

  /**
   * Jump to specific state
   */
  public jumpToState(index: number): EmbroideryStitch[] | null {
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
  public getStatistics(): {
    totalStates: number;
    currentIndex: number;
    canUndo: boolean;
    canRedo: boolean;
    memoryUsage: number;
    oldestState: number;
    newestState: number;
  } {
    const memoryUsage = this.history.reduce((sum, state) => 
      sum + (state.metadata?.memoryUsage || 0), 0
    );

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
  public exportHistory(): string {
    return JSON.stringify({
      history: this.history,
      currentIndex: this.currentIndex,
      timestamp: Date.now()
    }, null, 2);
  }

  /**
   * Import history from JSON
   */
  public importHistory(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.history && Array.isArray(data.history)) {
        this.history = data.history;
        this.currentIndex = data.currentIndex || -1;
        console.log(`📥 Imported ${this.history.length} history states`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Failed to import history:', error);
      return false;
    }
  }

  /**
   * Compress history to save memory
   */
  private compressHistory(): void {
    if (this.isCompressing) return;
    
    this.isCompressing = true;
    console.log('🗜️ Compressing history...');

    try {
      // Keep every 3rd state and the most recent 10 states
      const keepIndices = new Set<number>();
      
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
      this.currentIndex = compressedHistory.findIndex(state => 
        state.timestamp === this.history[oldIndex]?.timestamp
      );
      
      this.history = compressedHistory;
      
      console.log(`🗜️ Compressed history: ${this.history.length} states (was ${this.history.length + keepIndices.size - compressedHistory.length})`);
    } finally {
      this.isCompressing = false;
    }
  }

  /**
   * Optimize stitches for memory efficiency
   */
  private optimizeStitches(stitches: EmbroideryStitch[]): EmbroideryStitch[] {
    return stitches.map(stitch => ({
      ...stitch,
      points: stitch.points.map(point => ({
        x: Math.round(point.x * 100) / 100, // Round to 2 decimal places
        y: Math.round(point.y * 100) / 100,
        pressure: point.pressure ? Math.round(point.pressure * 100) / 100 : undefined,
        timestamp: point.timestamp
      }))
    }));
  }

  /**
   * Restore stitches from optimized format
   */
  private restoreStitches(stitches: EmbroideryStitch[]): EmbroideryStitch[] {
    return stitches.map(stitch => ({
      ...stitch,
      points: stitch.points.map(point => ({
        x: point.x,
        y: point.y,
        pressure: point.pressure,
        timestamp: point.timestamp
      }))
    }));
  }

  /**
   * Calculate memory usage of stitches
   */
  private calculateMemoryUsage(stitches: EmbroideryStitch[]): number {
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
  private generateId(): string {
    return `state_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Start auto-save functionality
   */
  private startAutoSave(interval: number): void {
    this.autoSaveInterval = setInterval(() => {
      if (this.history.length > 0) {
        this.saveToLocalStorage();
      }
    }, interval);
  }

  /**
   * Save to local storage
   */
  private saveToLocalStorage(): void {
    try {
      const data = this.exportHistory();
      localStorage.setItem('embroidery_history', data);
    } catch (error) {
      console.warn('⚠️ Failed to save history to localStorage:', error);
    }
  }

  /**
   * Load from local storage
   */
  public loadFromLocalStorage(): boolean {
    try {
      const data = localStorage.getItem('embroidery_history');
      if (data) {
        return this.importHistory(data);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load history from localStorage:', error);
    }
    return false;
  }

  /**
   * Dispose of the system
   */
  public dispose(): void {
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

