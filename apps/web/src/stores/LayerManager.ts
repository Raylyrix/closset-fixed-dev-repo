/**
 * Industry-Standard Layer Manager Store
 * Complete layer management system with professional features
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  Layer, 
  LayerType, 
  BlendMode, 
  LayerSystemState, 
  LayerSystemActions,
  RasterLayer,
  VectorLayer,
  TextLayer,
  GroupLayer,
  PuffLayer,
  EmbroideryLayer,
  LayerHistory,
  LayerGroup
} from '../types/LayerSystem';

// Helper function to convert BlendMode to GlobalCompositeOperation
const blendModeToGlobalCompositeOperation = (blendMode: BlendMode): GlobalCompositeOperation => {
  const mapping: Record<BlendMode, GlobalCompositeOperation> = {
    'normal': 'source-over',
    'multiply': 'multiply',
    'screen': 'screen',
    'overlay': 'overlay',
    'soft-light': 'soft-light',
    'hard-light': 'hard-light',
    'color-dodge': 'color-dodge',
    'color-burn': 'color-burn',
    'darken': 'darken',
    'lighten': 'lighten',
    'difference': 'difference',
    'exclusion': 'exclusion',
    'hue': 'hue',
    'saturation': 'saturation',
    'color': 'color',
    'luminosity': 'luminosity'
  };
  return mapping[blendMode] || 'source-over';
};

const generateId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const createDefaultTransform = () => ({
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
  skewX: 0,
  skewY: 0
});

const createDefaultLayer = (type: LayerType, name?: string, options?: Partial<Layer>): Layer => {
  const id = generateId();
  const now = new Date();
  
  const baseLayer = {
    id,
    name: name || `${type.charAt(0).toUpperCase() + type.slice(1)} Layer`,
    type,
    visible: true,
    locked: false,
    opacity: 1.0,
    blendMode: 'normal' as BlendMode,
    order: 0,
    transform: createDefaultTransform(),
    effects: [],
    createdAt: now,
    modifiedAt: now,
    ...options
  };

  switch (type) {
    case 'raster':
      const canvas = document.createElement('canvas');
      canvas.width = 4096;  // High-quality resolution
      canvas.height = 4096;
      const ctx = canvas.getContext('2d', { 
        willReadFrequently: true,
        alpha: true,
        desynchronized: false
      })!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      return {
        ...baseLayer,
        canvas,
        brushHistory: []
      } as RasterLayer;

    case 'vector':
      return {
        ...baseLayer,
        paths: []
      } as VectorLayer;

    case 'text':
      return {
        ...baseLayer,
        content: 'Text Layer',
        fontFamily: 'Arial',
        fontSize: 24,
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#000000',
        alignment: 'left' as const,
        lineHeight: 1.2
      } as TextLayer;

    case 'group':
      return {
        ...baseLayer,
        children: [],
        expanded: true
      } as GroupLayer;

    case 'puff':
      const puffCanvas = document.createElement('canvas');
      const displacementCanvas = document.createElement('canvas');
      puffCanvas.width = displacementCanvas.width = 4096;  // High-quality resolution
      puffCanvas.height = displacementCanvas.height = 4096;
      
      return {
        ...baseLayer,
        canvas: puffCanvas,
        displacementCanvas,
        height: 0.1,
        curvature: 0.5,
        shape: 'round' as const,
        color: '#ffffff'
      } as PuffLayer;

    case 'embroidery':
      return {
        ...baseLayer,
        stitches: []
      } as EmbroideryLayer;

    default:
      return baseLayer as Layer;
  }
};

export const useLayerManager = create<LayerSystemState & LayerSystemActions>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    layers: new Map(),
    layerOrder: [],
    activeLayerId: null,
    selectedLayerIds: [],
    groups: new Map(),
    history: [],
    historyIndex: -1,
    composedCanvas: null,
    needsComposition: true,
    expandedGroups: new Set(),
    layerPanelWidth: 280,
    showLayerEffects: false,

    // Layer CRUD Operations
    createLayer: (type: LayerType, name?: string, options?: Partial<Layer>) => {
      const layer = createDefaultLayer(type, name, options);
      const state = get();
      
      // Set order to be at the top
      layer.order = state.layerOrder.length;
      
      // Add to history
      const historyEntry: LayerHistory = {
        id: generateId(),
        timestamp: new Date(),
        action: 'create',
        layerId: layer.id,
        data: { type, name, options }
      };

      set(state => ({
        layers: new Map([...state.layers, [layer.id, layer]]),
        layerOrder: [layer.id, ...state.layerOrder],
        activeLayerId: layer.id,
        history: [...state.history.slice(0, state.historyIndex + 1), historyEntry],
        historyIndex: state.historyIndex + 1,
        needsComposition: true
      }));

      return layer.id;
    },

    deleteLayer: (id: string) => {
      const state = get();
      const layer = state.layers.get(id);
      if (!layer) return;

      // Don't delete if it's the only layer
      if (state.layers.size <= 1) return;

      // Remove from groups
      const updatedGroups = new Map(state.groups);
      updatedGroups.forEach(group => {
        if (group.layers.includes(id)) {
          group.layers = group.layers.filter(layerId => layerId !== id);
        }
      });

      // Add to history
      const historyEntry: LayerHistory = {
        id: generateId(),
        timestamp: new Date(),
        action: 'delete',
        layerId: id,
        data: layer
      };

      set(state => ({
        layers: new Map([...state.layers].filter(([key]) => key !== id)),
        layerOrder: state.layerOrder.filter(layerId => layerId !== id),
        groups: updatedGroups,
        activeLayerId: state.activeLayerId === id ? state.layerOrder[0] || null : state.activeLayerId,
        selectedLayerIds: state.selectedLayerIds.filter(layerId => layerId !== id),
        history: [...state.history.slice(0, state.historyIndex + 1), historyEntry],
        historyIndex: state.historyIndex + 1,
        needsComposition: true
      }));
    },

    duplicateLayer: (id: string) => {
      const state = get();
      const originalLayer = state.layers.get(id);
      if (!originalLayer) return '';

      const duplicatedLayer = {
        ...originalLayer,
        id: generateId(),
        name: `${originalLayer.name} Copy`,
        order: state.layerOrder.length,
        createdAt: new Date(),
        modifiedAt: new Date()
      };

      // Deep clone canvas if it exists
      if (duplicatedLayer.canvas) {
        const newCanvas = document.createElement('canvas');
        newCanvas.width = duplicatedLayer.canvas.width;
        newCanvas.height = duplicatedLayer.canvas.height;
        const ctx = newCanvas.getContext('2d')!;
        ctx.drawImage(duplicatedLayer.canvas, 0, 0);
        duplicatedLayer.canvas = newCanvas;
      }

      // Deep clone displacement canvas for puff layers
      if ('displacementCanvas' in duplicatedLayer && duplicatedLayer.displacementCanvas) {
        const newDisplacementCanvas = document.createElement('canvas');
        newDisplacementCanvas.width = duplicatedLayer.displacementCanvas.width;
        newDisplacementCanvas.height = duplicatedLayer.displacementCanvas.height;
        const ctx = newDisplacementCanvas.getContext('2d')!;
        ctx.drawImage(duplicatedLayer.displacementCanvas, 0, 0);
        duplicatedLayer.displacementCanvas = newDisplacementCanvas;
      }

      set(state => ({
        layers: new Map([...state.layers, [duplicatedLayer.id, duplicatedLayer]]),
        layerOrder: [...state.layerOrder, duplicatedLayer.id],
        activeLayerId: duplicatedLayer.id,
        needsComposition: true
      }));

      return duplicatedLayer.id;
    },

    renameLayer: (id: string, name: string) => {
      const state = get();
      const layer = state.layers.get(id);
      if (!layer) return;

      const updatedLayer = { ...layer, name, modifiedAt: new Date() };
      
      set(state => ({
        layers: new Map([...state.layers, [id, updatedLayer]]),
        needsComposition: true
      }));
    },

    // Layer Properties
    setLayerVisible: (id: string, visible: boolean) => {
      const state = get();
      const layer = state.layers.get(id);
      if (!layer) return;

      const updatedLayer = { ...layer, visible, modifiedAt: new Date() };
      
      set(state => ({
        layers: new Map([...state.layers, [id, updatedLayer]]),
        needsComposition: true
      }));
    },

    setLayerLocked: (id: string, locked: boolean) => {
      const state = get();
      const layer = state.layers.get(id);
      if (!layer) return;

      const updatedLayer = { ...layer, locked, modifiedAt: new Date() };
      
      set(state => ({
        layers: new Map([...state.layers, [id, updatedLayer]])
      }));
    },

    setLayerOpacity: (id: string, opacity: number) => {
      const state = get();
      const layer = state.layers.get(id);
      if (!layer) return;

      const updatedLayer = { ...layer, opacity: Math.max(0, Math.min(1, opacity)), modifiedAt: new Date() };
      
      set(state => ({
        layers: new Map([...state.layers, [id, updatedLayer]]),
        needsComposition: true
      }));
    },

    setLayerBlendMode: (id: string, blendMode: BlendMode) => {
      const state = get();
      const layer = state.layers.get(id);
      if (!layer) return;

      const updatedLayer = { ...layer, blendMode, modifiedAt: new Date() };
      
      set(state => ({
        layers: new Map([...state.layers, [id, updatedLayer]]),
        needsComposition: true
      }));
    },

    setActiveLayer: (id: string) => {
      set({ activeLayerId: id });
    },

    // Layer Ordering
    moveLayer: (id: string, newIndex: number) => {
      const state = get();
      const currentIndex = state.layerOrder.indexOf(id);
      if (currentIndex === -1) return;

      const newOrder = [...state.layerOrder];
      newOrder.splice(currentIndex, 1);
      newOrder.splice(newIndex, 0, id);

      // Update layer orders
      const updatedLayers = new Map(state.layers);
      newOrder.forEach((layerId, index) => {
        const layer = updatedLayers.get(layerId);
        if (layer) {
          updatedLayers.set(layerId, { ...layer, order: index, modifiedAt: new Date() });
        }
      });

      set({
        layerOrder: newOrder,
        layers: updatedLayers,
        needsComposition: true
      });
    },

    moveLayerUp: (id: string) => {
      const state = get();
      const currentIndex = state.layerOrder.indexOf(id);
      if (currentIndex < state.layerOrder.length - 1) {
        get().moveLayer(id, currentIndex + 1);
      }
    },

    moveLayerDown: (id: string) => {
      const state = get();
      const currentIndex = state.layerOrder.indexOf(id);
      if (currentIndex > 0) {
        get().moveLayer(id, currentIndex - 1);
      }
    },

    bringToFront: (id: string) => {
      get().moveLayer(id, 0);
    },

    sendToBack: (id: string) => {
      const state = get();
      get().moveLayer(id, state.layerOrder.length - 1);
    },

    // Groups
    createGroup: (name: string, layerIds: string[]) => {
      const groupId = generateId();
      const group: LayerGroup = {
        id: groupId,
        name,
        layers: layerIds,
        expanded: true,
        visible: true,
        locked: false,
        opacity: 1.0,
        blendMode: 'normal'
      };

      set(state => ({
        groups: new Map([...state.groups, [groupId, group]]),
        expandedGroups: new Set([...state.expandedGroups, groupId])
      }));

      return groupId;
    },

    addToGroup: (groupId: string, layerId: string) => {
      const state = get();
      const group = state.groups.get(groupId);
      if (!group) return;

      const updatedGroup = { ...group, layers: [...group.layers, layerId] };
      
      set(state => ({
        groups: new Map([...state.groups, [groupId, updatedGroup]])
      }));
    },

    removeFromGroup: (layerId: string) => {
      const state = get();
      const updatedGroups = new Map(state.groups);
      
      updatedGroups.forEach(group => {
        if (group.layers.includes(layerId)) {
          const updatedGroup = { ...group, layers: group.layers.filter(id => id !== layerId) };
          updatedGroups.set(group.id, updatedGroup);
        }
      });

      set({ groups: updatedGroups });
    },

    deleteGroup: (groupId: string) => {
      const state = get();
      const group = state.groups.get(groupId);
      if (!group) return;

      // Remove all layers from the group
      group.layers.forEach(layerId => {
        get().removeFromGroup(layerId);
      });

      set(state => ({
        groups: new Map([...state.groups].filter(([key]) => key !== groupId)),
        expandedGroups: new Set([...state.expandedGroups].filter(id => id !== groupId))
      }));
    },

    toggleGroupExpanded: (groupId: string) => {
      const state = get();
      const newExpandedGroups = new Set(state.expandedGroups);
      
      if (newExpandedGroups.has(groupId)) {
        newExpandedGroups.delete(groupId);
      } else {
        newExpandedGroups.add(groupId);
      }

      set({ expandedGroups: newExpandedGroups });
    },

    // Effects
    addEffect: (layerId: string, effect: any) => {
      const state = get();
      const layer = state.layers.get(layerId);
      if (!layer) return;

      const updatedLayer = { 
        ...layer, 
        effects: [...layer.effects, effect],
        modifiedAt: new Date()
      };
      
      set(state => ({
        layers: new Map([...state.layers, [layerId, updatedLayer]]),
        needsComposition: true
      }));
    },

    removeEffect: (layerId: string, effectId: string) => {
      const state = get();
      const layer = state.layers.get(layerId);
      if (!layer) return;

      const updatedLayer = { 
        ...layer, 
        effects: layer.effects.filter(effect => effect.id !== effectId),
        modifiedAt: new Date()
      };
      
      set(state => ({
        layers: new Map([...state.layers, [layerId, updatedLayer]]),
        needsComposition: true
      }));
    },

    updateEffect: (layerId: string, effectId: string, settings: any) => {
      const state = get();
      const layer = state.layers.get(layerId);
      if (!layer) return;

      const updatedLayer = { 
        ...layer, 
        effects: layer.effects.map(effect => 
          effect.id === effectId ? { ...effect, ...settings } : effect
        ),
        modifiedAt: new Date()
      };
      
      set(state => ({
        layers: new Map([...state.layers, [layerId, updatedLayer]]),
        needsComposition: true
      }));
    },

    // History
    undo: () => {
      const state = get();
      if (state.historyIndex > 0) {
        set({ historyIndex: state.historyIndex - 1 });
      }
    },

    redo: () => {
      const state = get();
      if (state.historyIndex < state.history.length - 1) {
        set({ historyIndex: state.historyIndex + 1 });
      }
    },

    canUndo: () => {
      const state = get();
      return state.historyIndex > 0;
    },

    canRedo: () => {
      const state = get();
      return state.historyIndex < state.history.length - 1;
    },

    // Composition
    composeLayers: () => {
      const state = get();
      if (!state.needsComposition) return;

      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 2048;
      const ctx = canvas.getContext('2d')!;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw layers in order (bottom to top)
      const orderedLayers = state.layerOrder
        .map(id => state.layers.get(id))
        .filter(layer => layer && layer.visible) as Layer[];

      orderedLayers.forEach(layer => {
        if (layer.canvas) {
          ctx.save();
          ctx.globalAlpha = layer.opacity;
          ctx.globalCompositeOperation = blendModeToGlobalCompositeOperation(layer.blendMode);
          ctx.drawImage(layer.canvas, 0, 0);
          ctx.restore();
        }
      });

      set({ 
        composedCanvas: canvas, 
        needsComposition: false 
      });
    },

    invalidateComposition: () => {
      set({ needsComposition: true });
    },

    // Selection
    selectLayer: (id: string) => {
      set({ selectedLayerIds: [id], activeLayerId: id });
    },

    selectMultipleLayers: (ids: string[]) => {
      set({ selectedLayerIds: ids });
    },

    clearSelection: () => {
      set({ selectedLayerIds: [] });
    },

    // Bulk operations
    mergeLayers: (layerIds: string[]) => {
      const state = get();
      const layersToMerge = layerIds
        .map(id => state.layers.get(id))
        .filter(layer => layer && layer.canvas) as Layer[];

      if (layersToMerge.length === 0) return null as any;

      const mergedCanvas = document.createElement('canvas');
      mergedCanvas.width = 2048;
      mergedCanvas.height = 2048;
      const ctx = mergedCanvas.getContext('2d')!;

      layersToMerge.forEach(layer => {
        if (layer.canvas) {
          ctx.drawImage(layer.canvas, 0, 0);
        }
      });

      const mergedLayer = createDefaultLayer('raster', 'Merged Layer', {
        canvas: mergedCanvas
      }) as RasterLayer;

      // Remove merged layers and add new one
      layerIds.forEach(id => get().deleteLayer(id));
      get().createLayer('raster', 'Merged Layer', { canvas: mergedCanvas });

      return mergedLayer;
    },

    flattenLayers: () => {
      const state = get();
      const allLayerIds = Array.from(state.layers.keys());
      get().mergeLayers(allLayerIds);
    },

    rasterizeLayer: (id: string) => {
      const state = get();
      const layer = state.layers.get(id);
      if (!layer || layer.type === 'raster') return;

      // Convert non-raster layer to raster
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 2048;
      
      // This would need specific implementation for each layer type
      // For now, just create a blank raster layer
      const rasterLayer = createDefaultLayer('raster', `${layer.name} (Rasterized)`, {
        canvas
      }) as RasterLayer;

      get().deleteLayer(id);
      get().createLayer('raster', rasterLayer.name, { canvas });
    }
  }))
);

// Initialize with a default layer
useLayerManager.getState().createLayer('raster', 'Background');


