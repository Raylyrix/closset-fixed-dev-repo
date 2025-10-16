/**
 * Layer System Bridge
 * Connects the existing App store with the new Advanced Layer System
 */

import { useApp } from '../App';
import { useAdvancedLayerStoreV2, type AdvancedLayer } from '../core/AdvancedLayerSystemV2';

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
      this.advancedStore = useAdvancedLayerStoreV2.getState();
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
      // Check if layer already exists in advanced layers (array, not Map)
      const existingLayer = advancedLayers.find((l: any) => l.id === layer.id);
      if (!existingLayer) {
        const layerId = createLayer('paint', layer.name);

        // Copy canvas content
        const advancedLayer = advancedLayers.find((l: any) => l.id === layerId);
        if (advancedLayer && layer.canvas) {
          const ctx = advancedLayer.content.canvas?.getContext('2d');
          if (ctx) {
            ctx.drawImage(layer.canvas, 0, 0);
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
    const legacyLayers = advancedLayers.map((layer: any) => ({
      id: layer.id,
      name: layer.name,
      visible: layer.visible,
      canvas: layer.content.canvas,
      displacementCanvas: null,
      history: [],
      future: [],
      order: layer.order,
      toolType: layer.type,
      opacity: layer.opacity,
      blendMode: layer.blendMode
    }));

    // Update App store
    useApp.setState({
      layers: legacyLayers,
      activeLayerId: this.advancedStore.activeLayerId,
      composedCanvas: composedCanvas
    });
  }

  /**
   * Get or create active layer for drawing
   */
  getOrCreateActiveLayer(toolType: string): any {
    this.initializeStores();
    const { layers, activeLayerId, createLayer } = this.advancedStore;
    
    // Check if we have an active layer
    if (activeLayerId) {
      const activeLayer = layers.find((l: AdvancedLayer) => l.id === activeLayerId);
      if (activeLayer && activeLayer.visible) {
        // Convert advanced layer to legacy format for compatibility
        return {
          id: activeLayer.id,
          name: activeLayer.name,
          type: activeLayer.type,
          visible: activeLayer.visible,
          opacity: activeLayer.opacity,
          blendMode: activeLayer.blendMode,
          order: activeLayer.order,
          toolType: activeLayer.type,
          canvas: activeLayer.content.canvas || document.createElement('canvas'),
          displacementCanvas: null
        };
      }
    }
    
    // Create a new layer if none exists or current one is hidden
    const layerName = `${toolType.charAt(0).toUpperCase() + toolType.slice(1)} Layer`;
    const layerId = createLayer(toolType as any, layerName);
    
    // Set the new layer as active
    useAdvancedLayerStoreV2.setState({ activeLayerId: layerId });
    
    // Return the newly created layer in legacy format
    const newLayer = layers.find((l: AdvancedLayer) => l.id === layerId);
    if (newLayer) {
      return {
        id: newLayer.id,
        name: newLayer.name,
        type: newLayer.type,
        visible: newLayer.visible,
        opacity: newLayer.opacity,
        blendMode: newLayer.blendMode,
        order: newLayer.order,
        toolType: newLayer.type,
        canvas: newLayer.content.canvas || document.createElement('canvas'),
        displacementCanvas: null
      };
    }
    
    return null;
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
