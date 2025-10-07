/**
 * Layer Persistence Manager
 * Ensures layers are properly saved and loaded across page refreshes
 */

import { useApp } from '../App';

export class LayerPersistenceManager {
  private static instance: LayerPersistenceManager;
  private isInitialized = false;
  private loadAttempts = 0;
  private maxLoadAttempts = 3;

  static getInstance(): LayerPersistenceManager {
    if (!LayerPersistenceManager.instance) {
      LayerPersistenceManager.instance = new LayerPersistenceManager();
    }
    return LayerPersistenceManager.instance;
  }

  /**
   * Initialize layer persistence
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    console.log('🎨 LayerPersistenceManager: Initializing...');
    
    // Wait a bit for the app to fully initialize
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Check if layers need to be loaded
    await this.ensureLayersLoaded();
    
    this.isInitialized = true;
    console.log('🎨 LayerPersistenceManager: Initialized successfully');
  }

  /**
   * Ensure layers are loaded from storage
   */
  async ensureLayersLoaded(): Promise<boolean> {
    const appState = useApp.getState();
    const currentLayers = appState.layers;
    
    console.log('🎨 LayerPersistenceManager: Current layers count:', currentLayers.length);
    
    // If we have layers, we're good
    if (currentLayers.length > 0) {
      console.log('🎨 LayerPersistenceManager: Layers already loaded');
      return true;
    }
    
    // Try to load from storage
    if (this.loadAttempts < this.maxLoadAttempts) {
      this.loadAttempts++;
      console.log(`🎨 LayerPersistenceManager: Attempting to load layers (attempt ${this.loadAttempts}/${this.maxLoadAttempts})`);
      
      try {
        const success = await appState.loadProjectState();
        if (success) {
          console.log('🎨 LayerPersistenceManager: Layers loaded successfully from storage');
          return true;
        } else {
          console.log('🎨 LayerPersistenceManager: No saved layers found in storage');
          return false;
        }
      } catch (error) {
        console.error('🎨 LayerPersistenceManager: Error loading layers:', error);
        return false;
      }
    } else {
      console.log('🎨 LayerPersistenceManager: Max load attempts reached, giving up');
      return false;
    }
  }

  /**
   * Save layers to storage
   */
  async saveLayers(): Promise<boolean> {
    try {
      const appState = useApp.getState();
      const success = await appState.saveProjectState();
      if (success) {
        console.log('🎨 LayerPersistenceManager: Layers saved successfully');
      } else {
        console.log('🎨 LayerPersistenceManager: Failed to save layers');
      }
      return success;
    } catch (error) {
      console.error('🎨 LayerPersistenceManager: Error saving layers:', error);
      return false;
    }
  }

  /**
   * Check if layers are properly persisted
   */
  async checkPersistence(): Promise<{
    hasLayers: boolean;
    layerCount: number;
    layerNames: string[];
  }> {
    const appState = useApp.getState();
    const layers = appState.layers;
    
    return {
      hasLayers: layers.length > 0,
      layerCount: layers.length,
      layerNames: layers.map(l => l.name)
    };
  }

  /**
   * Force reload layers from storage
   */
  async forceReload(): Promise<boolean> {
    console.log('🎨 LayerPersistenceManager: Force reloading layers...');
    this.loadAttempts = 0; // Reset attempts
    return await this.ensureLayersLoaded();
  }

  /**
   * Clear all saved layers
   */
  async clearSavedLayers(): Promise<boolean> {
    try {
      const appState = useApp.getState();
      const success = await appState.clearProjectState();
      if (success) {
        console.log('🎨 LayerPersistenceManager: Saved layers cleared');
      }
      return success;
    } catch (error) {
      console.error('🎨 LayerPersistenceManager: Error clearing layers:', error);
      return false;
    }
  }
}

// Export singleton instance
export const layerPersistenceManager = LayerPersistenceManager.getInstance();
