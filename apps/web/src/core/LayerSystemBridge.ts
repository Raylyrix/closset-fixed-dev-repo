/**
 * Layer System Bridge
 * Connects the existing App store with the new Advanced Layer System
 */

import { useApp } from '../App';
import { useAdvancedLayerStore, type AdvancedLayer } from '../core/AdvancedLayerSystem';

export class LayerSystemBridge {
  private static instance: LayerSystemBridge;
  private appStore: any;
  private advancedStore: any;

  constructor() {
    // Don't initialize stores in constructor to avoid circular dependency
    this.appStore = null;
    this.advancedStore = null;
  }

  static getInstance(): LayerSystemBridge {
    if (!LayerSystemBridge.instance) {
      LayerSystemBridge.instance = new LayerSystemBridge();
    }
    return LayerSystemBridge.instance;
  }

  private initializeStores(): void {
    if (!this.appStore) {
      this.appStore = useApp.getState();
    }
    if (!this.advancedStore) {
      this.advancedStore = useAdvancedLayerStore.getState();
    }
  }

  /**
   * Sync existing layers from App store to Advanced Layer System
   */
  syncExistingLayers(): void {
    this.initializeStores();
    const { layers } = this.appStore;
    const { createLayer, layers: advancedLayers } = this.advancedStore;

    // Convert existing layers to advanced layers
    layers.forEach((layer: any) => {
      if (!advancedLayers.has(layer.id)) {
        const layerId = createLayer('pixel', layer.name, {
          id: layer.id,
          visible: layer.visible,
          opacity: (layer as any).opacity || 1.0,
          blendMode: (layer as any).blendMode || 'normal',
          order: layer.order || 0,
          toolType: (layer as any).toolType || 'general',
          canvas: layer.canvas,
          displacementCanvas: layer.displacementCanvas
        });

        // Copy canvas content
        const advancedLayer = advancedLayers.get(layerId);
        if (advancedLayer && layer.canvas) {
          const ctx = advancedLayer.canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(layer.canvas, 0, 0);
          }
        }

        if (advancedLayer && layer.displacementCanvas) {
          const dispCtx = advancedLayer.displacementCanvas?.getContext('2d');
          if (dispCtx) {
            dispCtx.drawImage(layer.displacementCanvas, 0, 0);
          }
        }
      }
    });
  }

  /**
   * Sync advanced layers back to App store
   */
  syncToAppStore(): void {
    this.initializeStores();
    const { layers: advancedLayers, layerOrder, composedCanvas } = this.advancedStore;
    const { set } = this.appStore;

    // Convert advanced layers back to legacy format
    const legacyLayers = Array.from(advancedLayers.values()).map((layer: any) => ({
      id: layer.id,
      name: layer.name,
      visible: layer.visible,
      canvas: layer.canvas,
      displacementCanvas: layer.displacementCanvas,
      history: layer.history,
      future: layer.future,
      order: layer.order,
      toolType: layer.toolType,
      opacity: layer.opacity,
      blendMode: layer.blendMode
    }));

    // Update App store
    set({
      layers: legacyLayers,
      activeLayerId: this.advancedStore.activeLayerId,
      composedCanvas: composedCanvas
    });
  }

  /**
   * Get or create active layer for drawing
   */
  getOrCreateActiveLayer(toolType: string): AdvancedLayer | null {
    this.initializeStores();
    const { getActiveLayer, createLayer } = this.advancedStore;
    
    let activeLayer = getActiveLayer();
    
    if (!activeLayer || !activeLayer.visible) {
      const layerId = createLayer('pixel', `${toolType.charAt(0).toUpperCase() + toolType.slice(1)} Layer`, {
        toolType
      });
      activeLayer = this.advancedStore.getLayer(layerId);
    }

    return activeLayer;
  }

  /**
   * Update layer composition
   */
  updateComposition(): void {
    this.initializeStores();
    const { composeLayers, composeDisplacementMaps } = this.advancedStore;
    
    // Compose layers in advanced system
    composeLayers();
    composeDisplacementMaps();
    
    // Sync back to App store
    this.syncToAppStore();
  }

  /**
   * Handle layer operations
   */
  handleLayerOperation(operation: string, layerId: string, ...args: any[]): void {
    this.initializeStores();
    const {
      toggleLayerVisibility,
      setLayerOpacity,
      setLayerBlendMode,
      moveLayerUp,
      moveLayerDown,
      deleteLayer,
      duplicateLayer,
      renameLayer
    } = this.advancedStore;

    switch (operation) {
      case 'toggleVisibility':
        toggleLayerVisibility(layerId);
        break;
      case 'setOpacity':
        setLayerOpacity(layerId, args[0]);
        break;
      case 'setBlendMode':
        setLayerBlendMode(layerId, args[0]);
        break;
      case 'moveUp':
        moveLayerUp(layerId);
        break;
      case 'moveDown':
        moveLayerDown(layerId);
        break;
      case 'delete':
        deleteLayer(layerId);
        break;
      case 'duplicate':
        duplicateLayer(layerId);
        break;
      case 'rename':
        renameLayer(layerId, args[0]);
        break;
    }

    // Update composition and sync
    this.updateComposition();
  }

  /**
   * Initialize the bridge
   */
  initialize(): void {
    this.initializeStores();
    // Sync existing layers
    this.syncExistingLayers();
    
    // Set up composition updates
    this.updateComposition();
    
    console.log('🎨 Layer System Bridge initialized');
  }
}

// Export singleton instance
export const layerBridge = LayerSystemBridge.getInstance();
