/**
 * Unified Layer Manager
 * 
 * Core layer management system that replaces the fragmented layer systems.
 * Provides a single source of truth for all layer operations.
 */

import { 
  UnifiedLayer, 
  UnifiedLayerState, 
  UnifiedLayerActions, 
  LayerType, 
  ToolType,
  BrushStroke,
  EmbroideryStitch,
  PuffData,
  VectorPath,
  LayerGroup
} from './types/UnifiedLayerTypes';
import { CanvasManager } from './CanvasManager';

export class UnifiedLayerManager implements UnifiedLayerActions {
  private state: UnifiedLayerState;
  private canvasManager: CanvasManager;
  private listeners: Set<(state: UnifiedLayerState) => void> = new Set();
  
  constructor(canvasManager: CanvasManager) {
    this.canvasManager = canvasManager;
    this.state = this.createInitialState();
  }
  
  /**
   * Create initial state
   */
  private createInitialState(): UnifiedLayerState {
    return {
      layers: new Map(),
      layerOrder: [],
      activeLayerId: null,
      selectedLayerIds: [],
      groups: new Map(),
      composedCanvas: null,
      displacementCanvas: null,
      normalCanvas: null,
      needsComposition: true,
      expandedGroups: new Set(),
      layerPanelWidth: 280,
      showLayerEffects: false
    };
  }
  
  /**
   * Get current state
   */
  getState(): UnifiedLayerState {
    return { ...this.state };
  }
  
  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: UnifiedLayerState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  /**
   * Notify listeners of state changes
   */
  private notifyListeners(): void {
    const currentState = this.getState();
    this.listeners.forEach(listener => {
      try {
        listener(currentState);
      } catch (error) {
        console.error('Error in layer state listener:', error);
      }
    });
  }
  
  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Create a new layer
   */
  createLayer(type: LayerType, name?: string, toolType?: ToolType): UnifiedLayer {
    const id = this.generateId();
    const canvas = this.canvasManager.createCanvas(id, this.canvasManager.getComposedCanvas().width, this.canvasManager.getComposedCanvas().height);
    
    const layer: UnifiedLayer = {
      id,
      name: name || `${type} Layer`,
      type,
      toolType,
      canvas,
      isDirty: false,
      visible: true,
      opacity: 1.0,
      blendMode: 'source-over',
      order: this.state.layerOrder.length,
      toolData: {},
      createdAt: new Date(),
      modifiedAt: new Date(),
      locked: false,
      effects: []
    };
    
    // Add to state
    this.state.layers.set(id, layer);
    this.state.layerOrder.push(id);
    this.state.activeLayerId = id;
    this.state.needsComposition = true;
    
    console.log(`🎨 UnifiedLayerManager: Created layer ${id} (${type})`);
    this.notifyListeners();
    
    return layer;
  }
  
  /**
   * Delete a layer
   */
  deleteLayer(id: string): void {
    const layer = this.state.layers.get(id);
    if (!layer) {
      console.warn(`🎨 UnifiedLayerManager: Layer ${id} not found`);
      return;
    }
    
    // Clean up tool data
    this.cleanupToolData(id);
    
    // Remove from state
    this.state.layers.delete(id);
    this.state.layerOrder = this.state.layerOrder.filter(layerId => layerId !== id);
    this.state.selectedLayerIds = this.state.selectedLayerIds.filter(layerId => layerId !== id);
    
    // Update active layer if needed
    if (this.state.activeLayerId === id) {
      this.state.activeLayerId = this.state.layerOrder.length > 0 ? this.state.layerOrder[0] : null;
    }
    
    // Remove canvas
    this.canvasManager.removeCanvas(id);
    
    // Update layer orders
    this.updateLayerOrders();
    this.state.needsComposition = true;
    
    console.log(`🎨 UnifiedLayerManager: Deleted layer ${id}`);
    this.notifyListeners();
  }
  
  /**
   * Duplicate a layer
   */
  duplicateLayer(id: string): UnifiedLayer {
    const originalLayer = this.state.layers.get(id);
    if (!originalLayer) {
      throw new Error(`Layer ${id} not found`);
    }
    
    const newId = this.generateId();
    const newCanvas = this.canvasManager.createCanvas(newId, originalLayer.canvas.width, originalLayer.canvas.height);
    
    // Copy canvas content
    const ctx = newCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(originalLayer.canvas, 0, 0);
    }
    
    const duplicatedLayer: UnifiedLayer = {
      ...originalLayer,
      id: newId,
      name: `${originalLayer.name} Copy`,
      canvas: newCanvas,
      order: this.state.layerOrder.length,
      createdAt: new Date(),
      modifiedAt: new Date(),
      toolData: this.deepCopyToolData(originalLayer.toolData)
    };
    
    // Add to state
    this.state.layers.set(newId, duplicatedLayer);
    this.state.layerOrder.push(newId);
    this.state.activeLayerId = newId;
    this.state.needsComposition = true;
    
    console.log(`🎨 UnifiedLayerManager: Duplicated layer ${id} -> ${newId}`);
    this.notifyListeners();
    
    return duplicatedLayer;
  }
  
  /**
   * Deep copy tool data
   */
  private deepCopyToolData(toolData: any): any {
    if (!toolData) return {};
    
    return {
      brushStrokes: toolData.brushStrokes?.map((stroke: any) => ({ ...stroke })) || [],
      embroideryStitches: toolData.embroideryStitches?.map((stitch: any) => ({ ...stitch })) || [],
      puffData: toolData.puffData?.map((puff: any) => ({ ...puff })) || [],
      vectorPaths: toolData.vectorPaths?.map((path: any) => ({ ...path })) || []
    };
  }
  
  /**
   * Rename a layer
   */
  renameLayer(id: string, name: string): void {
    const layer = this.state.layers.get(id);
    if (!layer) return;
    
    layer.name = name;
    layer.modifiedAt = new Date();
    
    console.log(`🎨 UnifiedLayerManager: Renamed layer ${id} to ${name}`);
    this.notifyListeners();
  }
  
  /**
   * Set layer visibility
   */
  setLayerVisible(id: string, visible: boolean): void {
    const layer = this.state.layers.get(id);
    if (!layer) return;
    
    layer.visible = visible;
    layer.modifiedAt = new Date();
    this.state.needsComposition = true;
    
    console.log(`🎨 UnifiedLayerManager: Set layer ${id} visibility to ${visible}`);
    this.notifyListeners();
  }
  
  /**
   * Set layer opacity
   */
  setLayerOpacity(id: string, opacity: number): void {
    const layer = this.state.layers.get(id);
    if (!layer) return;
    
    layer.opacity = Math.max(0, Math.min(1, opacity));
    layer.modifiedAt = new Date();
    this.state.needsComposition = true;
    
    console.log(`🎨 UnifiedLayerManager: Set layer ${id} opacity to ${opacity}`);
    this.notifyListeners();
  }
  
  /**
   * Set layer blend mode
   */
  setLayerBlendMode(id: string, blendMode: GlobalCompositeOperation): void {
    const layer = this.state.layers.get(id);
    if (!layer) return;
    
    layer.blendMode = blendMode;
    layer.modifiedAt = new Date();
    this.state.needsComposition = true;
    
    console.log(`🎨 UnifiedLayerManager: Set layer ${id} blend mode to ${blendMode}`);
    this.notifyListeners();
  }
  
  /**
   * Set active layer
   */
  setActiveLayer(id: string): void {
    if (!this.state.layers.has(id)) {
      console.warn(`🎨 UnifiedLayerManager: Layer ${id} not found`);
      return;
    }
    
    this.state.activeLayerId = id;
    
    console.log(`🎨 UnifiedLayerManager: Set active layer to ${id}`);
    this.notifyListeners();
  }
  
  /**
   * Get active layer
   */
  getActiveLayer(): UnifiedLayer | null {
    if (!this.state.activeLayerId) return null;
    return this.state.layers.get(this.state.activeLayerId) || null;
  }
  
  /**
   * Get or create tool layer
   */
  getOrCreateToolLayer(toolType: ToolType): UnifiedLayer {
    // Look for existing layer of this tool type
    for (const layer of this.state.layers.values()) {
      if (layer.toolType === toolType && layer.visible) {
        this.state.activeLayerId = layer.id;
        return layer;
      }
    }
    
    // Create new layer for this tool type
    const layerType: LayerType = toolType === 'vector' ? 'vector' : 'raster';
    return this.createLayer(layerType, `${toolType} Layer`, toolType);
  }
  
  /**
   * Get target layer for tool
   */
  getTargetLayer(toolType: ToolType): UnifiedLayer | null {
    return this.getOrCreateToolLayer(toolType);
  }
  
  /**
   * Clean up tool data for a layer
   */
  cleanupToolData(layerId: string): void {
    const layer = this.state.layers.get(layerId);
    if (!layer) return;
    
    // Clear tool data
    layer.toolData = {};
    
    // Clear canvas
    const ctx = layer.canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
    }
    
    layer.modifiedAt = new Date();
    this.state.needsComposition = true;
    
    console.log(`🎨 UnifiedLayerManager: Cleaned up tool data for layer ${layerId}`);
  }
  
  /**
   * Move layer to new index
   */
  moveLayer(id: string, newIndex: number): void {
    const currentIndex = this.state.layerOrder.indexOf(id);
    if (currentIndex === -1) return;
    
    // Remove from current position
    this.state.layerOrder.splice(currentIndex, 1);
    
    // Insert at new position
    this.state.layerOrder.splice(newIndex, 0, id);
    
    // Update layer orders
    this.updateLayerOrders();
    this.state.needsComposition = true;
    
    console.log(`🎨 UnifiedLayerManager: Moved layer ${id} to index ${newIndex}`);
    this.notifyListeners();
  }
  
  /**
   * Move layer up
   */
  moveLayerUp(id: string): void {
    const currentIndex = this.state.layerOrder.indexOf(id);
    if (currentIndex < this.state.layerOrder.length - 1) {
      this.moveLayer(id, currentIndex + 1);
    }
  }
  
  /**
   * Move layer down
   */
  moveLayerDown(id: string): void {
    const currentIndex = this.state.layerOrder.indexOf(id);
    if (currentIndex > 0) {
      this.moveLayer(id, currentIndex - 1);
    }
  }
  
  /**
   * Bring layer to front
   */
  bringToFront(id: string): void {
    this.moveLayer(id, this.state.layerOrder.length - 1);
  }
  
  /**
   * Send layer to back
   */
  sendToBack(id: string): void {
    this.moveLayer(id, 0);
  }
  
  /**
   * Update layer orders
   */
  private updateLayerOrders(): void {
    this.state.layerOrder.forEach((layerId, index) => {
      const layer = this.state.layers.get(layerId);
      if (layer) {
        layer.order = index;
      }
    });
  }
  
  /**
   * Compose layers
   */
  composeLayers(): HTMLCanvasElement {
    const layers = Array.from(this.state.layers.values());
    const composedCanvas = this.canvasManager.composeLayers(layers);
    
    this.state.composedCanvas = composedCanvas;
    this.state.needsComposition = false;
    
    return composedCanvas;
  }
  
  /**
   * Update displacement maps
   */
  updateDisplacementMaps(): void {
    const layers = Array.from(this.state.layers.values());
    const displacementCanvas = this.canvasManager.createDisplacementMap(layers);
    const normalCanvas = this.canvasManager.createNormalMap(displacementCanvas);
    
    this.state.displacementCanvas = displacementCanvas;
    this.state.normalCanvas = normalCanvas;
    
    console.log('🎨 UnifiedLayerManager: Updated displacement maps');
  }
  
  /**
   * Invalidate composition
   */
  invalidateComposition(): void {
    this.state.needsComposition = true;
  }
  
  /**
   * Select layer
   */
  selectLayer(id: string): void {
    this.state.selectedLayerIds = [id];
    this.notifyListeners();
  }
  
  /**
   * Select multiple layers
   */
  selectMultipleLayers(ids: string[]): void {
    this.state.selectedLayerIds = ids;
    this.notifyListeners();
  }
  
  /**
   * Clear selection
   */
  clearSelection(): void {
    this.state.selectedLayerIds = [];
    this.notifyListeners();
  }
  
  /**
   * Create group
   */
  createGroup(name: string, layerIds: string[]): string {
    const id = this.generateId();
    const group: LayerGroup = {
      id,
      name,
      layerIds,
      visible: true,
      opacity: 1.0,
      blendMode: 'source-over',
      expanded: true,
      order: this.state.layerOrder.length
    };
    
    this.state.groups.set(id, group);
    
    console.log(`🎨 UnifiedLayerManager: Created group ${id} with ${layerIds.length} layers`);
    this.notifyListeners();
    
    return id;
  }
  
  /**
   * Add layer to group
   */
  addToGroup(groupId: string, layerId: string): void {
    const group = this.state.groups.get(groupId);
    if (!group) return;
    
    if (!group.layerIds.includes(layerId)) {
      group.layerIds.push(layerId);
      console.log(`🎨 UnifiedLayerManager: Added layer ${layerId} to group ${groupId}`);
      this.notifyListeners();
    }
  }
  
  /**
   * Remove layer from group
   */
  removeFromGroup(layerId: string): void {
    for (const group of this.state.groups.values()) {
      const index = group.layerIds.indexOf(layerId);
      if (index !== -1) {
        group.layerIds.splice(index, 1);
        console.log(`🎨 UnifiedLayerManager: Removed layer ${layerId} from group ${group.id}`);
        this.notifyListeners();
        break;
      }
    }
  }
  
  /**
   * Delete group
   */
  deleteGroup(groupId: string): void {
    this.state.groups.delete(groupId);
    console.log(`🎨 UnifiedLayerManager: Deleted group ${groupId}`);
    this.notifyListeners();
  }
  
  /**
   * Toggle group expanded
   */
  toggleGroupExpanded(groupId: string): void {
    if (this.state.expandedGroups.has(groupId)) {
      this.state.expandedGroups.delete(groupId);
    } else {
      this.state.expandedGroups.add(groupId);
    }
    
    console.log(`🎨 UnifiedLayerManager: Toggled group ${groupId} expanded`);
    this.notifyListeners();
  }
  
  /**
   * Add effect to layer
   */
  addEffect(layerId: string, effect: any): void {
    const layer = this.state.layers.get(layerId);
    if (!layer) return;
    
    if (!layer.effects) {
      layer.effects = [];
    }
    
    layer.effects.push(effect);
    layer.modifiedAt = new Date();
    this.state.needsComposition = true;
    
    console.log(`🎨 UnifiedLayerManager: Added effect to layer ${layerId}`);
    this.notifyListeners();
  }
  
  /**
   * Remove effect from layer
   */
  removeEffect(layerId: string, effectId: string): void {
    const layer = this.state.layers.get(layerId);
    if (!layer || !layer.effects) return;
    
    layer.effects = layer.effects.filter(effect => effect.id !== effectId);
    layer.modifiedAt = new Date();
    this.state.needsComposition = true;
    
    console.log(`🎨 UnifiedLayerManager: Removed effect from layer ${layerId}`);
    this.notifyListeners();
  }
  
  /**
   * Update effect
   */
  updateEffect(layerId: string, effectId: string, settings: any): void {
    const layer = this.state.layers.get(layerId);
    if (!layer || !layer.effects) return;
    
    const effect = layer.effects.find(e => e.id === effectId);
    if (effect) {
      effect.settings = { ...effect.settings, ...settings };
      layer.modifiedAt = new Date();
      this.state.needsComposition = true;
      
      console.log(`🎨 UnifiedLayerManager: Updated effect on layer ${layerId}`);
      this.notifyListeners();
    }
  }
  
  /**
   * Get all layers
   */
  getAllLayers(): UnifiedLayer[] {
    return Array.from(this.state.layers.values());
  }
  
  /**
   * Get layers by tool type
   */
  getLayersByToolType(toolType: ToolType): UnifiedLayer[] {
    return Array.from(this.state.layers.values()).filter(layer => layer.toolType === toolType);
  }
  
  /**
   * Get layer by ID
   */
  getLayer(id: string): UnifiedLayer | null {
    return this.state.layers.get(id) || null;
  }
  
  /**
   * Check if layer exists
   */
  hasLayer(id: string): boolean {
    return this.state.layers.has(id);
  }
  
  /**
   * Get layer count
   */
  getLayerCount(): number {
    return this.state.layers.size;
  }
  
  /**
   * Clear all layers
   */
  clearAllLayers(): void {
    // Clean up all canvases
    for (const layerId of this.state.layers.keys()) {
      this.canvasManager.removeCanvas(layerId);
    }
    
    // Reset state
    this.state.layers.clear();
    this.state.layerOrder = [];
    this.state.activeLayerId = null;
    this.state.selectedLayerIds = [];
    this.state.needsComposition = true;
    
    console.log('🎨 UnifiedLayerManager: Cleared all layers');
    this.notifyListeners();
  }
}

