/**
 * Advanced Layer System - Photoshop-level functionality
 * Provides comprehensive layer management with advanced features
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type BlendMode = 
  | 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light' | 'hard-light'
  | 'color-dodge' | 'color-burn' | 'darken' | 'lighten' | 'difference' | 'exclusion'
  | 'hue' | 'saturation' | 'color' | 'luminosity' | 'linear-burn' | 'linear-dodge'
  | 'vivid-light' | 'linear-light' | 'pin-light' | 'hard-mix' | 'subtract' | 'divide';

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
    'luminosity': 'luminosity',
    'linear-burn': 'multiply', // Fallback to multiply
    'linear-dodge': 'screen', // Fallback to screen
    'vivid-light': 'overlay', // Fallback to overlay
    'linear-light': 'overlay', // Fallback to overlay
    'pin-light': 'difference', // Fallback to difference
    'hard-mix': 'multiply', // Fallback to multiply
    'subtract': 'difference', // Fallback to difference
    'divide': 'multiply' // Fallback to multiply
  };
  return mapping[blendMode] || 'source-over';
};

export type LayerType = 
  | 'pixel' | 'smart-object' | 'text' | 'shape' | 'adjustment' | 'group' | 'background';

export type LayerEffectType = 
  | 'drop-shadow' | 'inner-shadow' | 'outer-glow' | 'inner-glow' 
  | 'bevel-emboss' | 'stroke' | 'color-overlay' | 'gradient-overlay'
  | 'pattern-overlay' | 'satin' | 'contour';

export interface LayerEffect {
  id: string;
  type: LayerEffectType;
  enabled: boolean;
  settings: Record<string, any>;
}

export interface LayerMask {
  id: string;
  type: 'raster' | 'vector';
  canvas: HTMLCanvasElement;
  inverted: boolean;
  density: number;
  feather: number;
}

export interface LayerStyle {
  id: string;
  name: string;
  effects: LayerEffect[];
  blendMode: BlendMode;
  opacity: number;
}

export interface AdvancedLayer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  opacity: number;
  fillOpacity: number;
  blendMode: BlendMode;
  order: number;
  
  // Canvas and content
  canvas: HTMLCanvasElement;
  displacementCanvas?: HTMLCanvasElement;
  
  // Masks
  mask?: LayerMask;
  vectorMask?: LayerMask;
  
  // Effects and styles
  effects: LayerEffect[];
  layerStyle?: LayerStyle;
  
  // Grouping
  parentGroupId?: string;
  childLayerIds: string[];
  
  // Smart object properties
  smartObjectData?: {
    originalWidth: number;
    originalHeight: number;
    embeddedData: string; // Base64 encoded
  };
  
  // Text layer properties
  textProperties?: {
    content: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    fontStyle: string;
    color: string;
    alignment: 'left' | 'center' | 'right';
    lineHeight: number;
    letterSpacing: number;
  };
  
  // Shape layer properties
  shapeProperties?: {
    shapeType: 'rectangle' | 'ellipse' | 'polygon' | 'path';
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    pathData?: string; // SVG path data
  };
  
  // Adjustment layer properties
  adjustmentProperties?: {
    adjustmentType: 'brightness-contrast' | 'hue-saturation' | 'color-balance' 
                   | 'levels' | 'curves' | 'vibrance' | 'photo-filter' | 'gradient-map';
    settings: Record<string, any>;
  };
  
  // History and undo
  history: ImageData[];
  future: ImageData[];
  
  // Metadata
  createdAt: number;
  modifiedAt: number;
  toolType?: string; // For compatibility with existing system
}

export interface LayerGroup {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: BlendMode;
  order: number;
  childLayerIds: string[];
  collapsed: boolean;
  createdAt: number;
  modifiedAt: number;
}

export interface LayerSelection {
  layerIds: string[];
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// ============================================================================
// STORE STATE
// ============================================================================

interface AdvancedLayerState {
  // Core layer data
  layers: Map<string, AdvancedLayer>;
  groups: Map<string, LayerGroup>;
  layerOrder: string[];
  
  // Active state
  activeLayerId: string | null;
  activeGroupId: string | null;
  selection: LayerSelection;
  
  // Canvas management
  composedCanvas: HTMLCanvasElement | null;
  composedDisplacementCanvas: HTMLCanvasElement | null;
  
  // Layer styles and presets
  layerStyles: Map<string, LayerStyle>;
  customPresets: Map<string, LayerStyle>;
  
  // History
  history: LayerStateSnapshot[];
  historyIndex: number;
  maxHistorySize: number;
  
  // Performance
  needsComposition: boolean;
  compositionVersion: number;
}

interface LayerStateSnapshot {
  layers: Map<string, AdvancedLayer>;
  groups: Map<string, LayerGroup>;
  layerOrder: string[];
  activeLayerId: string | null;
  timestamp: number;
  action: string;
}

// ============================================================================
// ACTIONS INTERFACE
// ============================================================================

interface AdvancedLayerActions {
  // Core layer management
  createLayer: (type: LayerType, name?: string, options?: Partial<AdvancedLayer>) => string;
  deleteLayer: (id: string) => void;
  duplicateLayer: (id: string) => string;
  renameLayer: (id: string, name: string) => void;
  
  // Layer properties
  setLayerOpacity: (id: string, opacity: number) => void;
  setLayerBlendMode: (id: string, blendMode: BlendMode) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  
  // Layer ordering
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  moveLayerToTop: (id: string) => void;
  moveLayerToBottom: (id: string) => void;
  reorderLayers: (newOrder: string[]) => void;
  
  // Layer groups
  createGroup: (name?: string, layerIds?: string[]) => string;
  deleteGroup: (id: string) => void;
  addLayersToGroup: (groupId: string, layerIds: string[]) => void;
  removeLayersFromGroup: (layerIds: string[]) => void;
  toggleGroupCollapse: (id: string) => void;
  renameGroup: (id: string, name: string) => void;
  toggleGroupVisibility: (id: string) => void;
  selectGroup: (id: string) => void;
  
  // Layer effects
  addLayerEffect: (layerId: string, effect: LayerEffect) => void;
  removeLayerEffect: (layerId: string, effectId: string) => void;
  updateLayerEffect: (layerId: string, effectId: string, settings: Record<string, any>) => void;
  toggleLayerEffect: (layerId: string, effectId: string) => void;
  
  // Layer masks
  addLayerMask: (layerId: string, mask: LayerMask) => void;
  removeLayerMask: (layerId: string) => void;
  updateLayerMask: (layerId: string, maskUpdates: Partial<LayerMask>) => void;
  
  // Layer styles
  applyLayerStyle: (layerId: string, styleId: string) => void;
  createLayerStyle: (style: LayerStyle) => string;
  deleteLayerStyle: (styleId: string) => void;
  
  // Selection
  selectLayer: (id: string) => void;
  selectMultipleLayers: (ids: string[]) => void;
  clearSelection: () => void;
  
  // Composition
  composeLayers: () => void;
  composeDisplacementMaps: () => void;
  
  // History
  saveState: (action: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Utility
  getLayer: (id: string) => AdvancedLayer | undefined;
  getActiveLayer: () => AdvancedLayer | null;
  getLayerOrder: () => string[];
  exportLayerAsImage: (id: string) => HTMLCanvasElement | null;
  mergeLayers: (layerIds: string[]) => string;
  flattenLayers: () => void;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useAdvancedLayerStore = create<AdvancedLayerState & AdvancedLayerActions>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    layers: new Map(),
    groups: new Map(),
    layerOrder: [],
    activeLayerId: null,
    activeGroupId: null,
    selection: { layerIds: [] },
    composedCanvas: null,
    composedDisplacementCanvas: null,
    layerStyles: new Map(),
    customPresets: new Map(),
    history: [],
    historyIndex: -1,
    maxHistorySize: 50,
    needsComposition: false,
    compositionVersion: 0,

    // Core layer management
    createLayer: (type: LayerType, name?: string, options?: Partial<AdvancedLayer>) => {
      const id = `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = Date.now();
      
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 2048;
      
      // Create displacement canvas for 3D effects
      const displacementCanvas = document.createElement('canvas');
      displacementCanvas.width = 2048;
      displacementCanvas.height = 2048;
      const dispCtx = displacementCanvas.getContext('2d');
      if (dispCtx) {
        dispCtx.fillStyle = 'rgb(128, 128, 128)'; // Neutral gray
        dispCtx.fillRect(0, 0, 2048, 2048);
      }
      
      const layer: AdvancedLayer = {
        id,
        name: name || `${type.charAt(0).toUpperCase() + type.slice(1)} Layer`,
        type,
        visible: true,
        locked: false,
        opacity: 1.0,
        fillOpacity: 1.0,
        blendMode: 'normal',
        order: get().layerOrder.length,
        canvas,
        displacementCanvas,
        effects: [],
        childLayerIds: [],
        history: [],
        future: [],
        createdAt: timestamp,
        modifiedAt: timestamp,
        ...options
      };
      
      set(state => {
        const newLayers = new Map(state.layers);
        newLayers.set(id, layer);
        return {
          layers: newLayers,
          layerOrder: [...state.layerOrder, id],
          activeLayerId: id,
          needsComposition: true
        };
      });
      
      get().saveState(`Create ${type} layer: ${layer.name}`);
      return id;
    },

    deleteLayer: (id: string) => {
      const layer = get().layers.get(id);
      if (!layer) return;
      
      set(state => {
        const newLayers = new Map(state.layers);
        newLayers.delete(id);
        
        const newOrder = state.layerOrder.filter(layerId => layerId !== id);
        
        return {
          layers: newLayers,
          layerOrder: newOrder,
          activeLayerId: state.activeLayerId === id ? (newOrder[0] || null) : state.activeLayerId,
          needsComposition: true
        };
      });
      
      get().saveState(`Delete layer: ${layer.name}`);
    },

    duplicateLayer: (id: string) => {
      const originalLayer = get().layers.get(id);
      if (!originalLayer) return '';
      
      const newId = get().createLayer(originalLayer.type, `${originalLayer.name} Copy`);
      const newLayer = get().layers.get(newId);
      
      if (newLayer) {
        // Copy canvas content
        const ctx = newLayer.canvas.getContext('2d');
        const dispCtx = newLayer.displacementCanvas?.getContext('2d');
        
        if (ctx) ctx.drawImage(originalLayer.canvas, 0, 0);
        if (dispCtx && originalLayer.displacementCanvas) {
          dispCtx.drawImage(originalLayer.displacementCanvas, 0, 0);
        }
        
        // Copy other properties
        Object.assign(newLayer, {
          opacity: originalLayer.opacity,
          blendMode: originalLayer.blendMode,
          effects: [...originalLayer.effects],
          mask: originalLayer.mask ? { ...originalLayer.mask } : undefined,
          textProperties: originalLayer.textProperties ? { ...originalLayer.textProperties } : undefined,
          shapeProperties: originalLayer.shapeProperties ? { ...originalLayer.shapeProperties } : undefined,
          adjustmentProperties: originalLayer.adjustmentProperties ? { ...originalLayer.adjustmentProperties } : undefined
        });
      }
      
      get().saveState(`Duplicate layer: ${originalLayer.name}`);
      return newId;
    },

    renameLayer: (id: string, name: string) => {
      const layer = get().layers.get(id);
      if (!layer) return;
      
      set(state => {
        const newLayers = new Map(state.layers);
        const updatedLayer = { ...layer, name, modifiedAt: Date.now() };
        newLayers.set(id, updatedLayer);
        return { layers: newLayers };
      });
      
      get().saveState(`Rename layer: ${name}`);
    },

    // Layer properties
    setLayerOpacity: (id: string, opacity: number) => {
      const layer = get().layers.get(id);
      if (!layer) return;
      
      set(state => {
        const newLayers = new Map(state.layers);
        const updatedLayer = { ...layer, opacity: Math.max(0, Math.min(1, opacity)), modifiedAt: Date.now() };
        newLayers.set(id, updatedLayer);
        return { layers: newLayers, needsComposition: true };
      });
    },

    setLayerBlendMode: (id: string, blendMode: BlendMode) => {
      const layer = get().layers.get(id);
      if (!layer) return;
      
      set(state => {
        const newLayers = new Map(state.layers);
        const updatedLayer = { ...layer, blendMode, modifiedAt: Date.now() };
        newLayers.set(id, updatedLayer);
        return { layers: newLayers, needsComposition: true };
      });
    },

    toggleLayerVisibility: (id: string) => {
      const layer = get().layers.get(id);
      if (!layer) return;
      
      set(state => {
        const newLayers = new Map(state.layers);
        const updatedLayer = { ...layer, visible: !layer.visible, modifiedAt: Date.now() };
        newLayers.set(id, updatedLayer);
        return { layers: newLayers, needsComposition: true };
      });
    },

    toggleLayerLock: (id: string) => {
      const layer = get().layers.get(id);
      if (!layer) return;
      
      set(state => {
        const newLayers = new Map(state.layers);
        const updatedLayer = { ...layer, locked: !layer.locked, modifiedAt: Date.now() };
        newLayers.set(id, updatedLayer);
        return { layers: newLayers };
      });
    },

    // Layer ordering
    moveLayerUp: (id: string) => {
      const { layerOrder } = get();
      const currentIndex = layerOrder.indexOf(id);
      if (currentIndex <= 0) return;
      
      const newOrder = [...layerOrder];
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
      
      set({ layerOrder: newOrder, needsComposition: true });
      get().saveState(`Move layer up: ${id}`);
    },

    moveLayerDown: (id: string) => {
      const { layerOrder } = get();
      const currentIndex = layerOrder.indexOf(id);
      if (currentIndex >= layerOrder.length - 1) return;
      
      const newOrder = [...layerOrder];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
      
      set({ layerOrder: newOrder, needsComposition: true });
      get().saveState(`Move layer down: ${id}`);
    },

    moveLayerToTop: (id: string) => {
      const { layerOrder } = get();
      const newOrder = layerOrder.filter(layerId => layerId !== id);
      newOrder.push(id);
      
      set({ layerOrder: newOrder, needsComposition: true });
      get().saveState(`Move layer to top: ${id}`);
    },

    moveLayerToBottom: (id: string) => {
      const { layerOrder } = get();
      const newOrder = layerOrder.filter(layerId => layerId !== id);
      newOrder.unshift(id);
      
      set({ layerOrder: newOrder, needsComposition: true });
      get().saveState(`Move layer to bottom: ${id}`);
    },

    reorderLayers: (newOrder: string[]) => {
      set({ layerOrder: newOrder, needsComposition: true });
      get().saveState('Reorder layers');
    },

    // Layer groups
    createGroup: (name?: string, layerIds?: string[]) => {
      const id = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = Date.now();
      
      const group: LayerGroup = {
        id,
        name: name || 'Group',
        visible: true,
        locked: false,
        opacity: 1.0,
        blendMode: 'normal',
        order: get().layerOrder.length,
        childLayerIds: layerIds || [],
        collapsed: false,
        createdAt: timestamp,
        modifiedAt: timestamp
      };
      
      set(state => {
        const newGroups = new Map(state.groups);
        newGroups.set(id, group);
        return {
          groups: newGroups,
          layerOrder: [...state.layerOrder, id],
          activeGroupId: id
        };
      });
      
      get().saveState(`Create group: ${group.name}`);
      return id;
    },

    deleteGroup: (id: string) => {
      const group = get().groups.get(id);
      if (!group) return;
      
      set(state => {
        const newGroups = new Map(state.groups);
        newGroups.delete(id);
        
        const newOrder = state.layerOrder.filter(groupId => groupId !== id);
        
        return {
          groups: newGroups,
          layerOrder: newOrder,
          activeGroupId: state.activeGroupId === id ? null : state.activeGroupId
        };
      });
      
      get().saveState(`Delete group: ${group.name}`);
    },

    addLayersToGroup: (groupId: string, layerIds: string[]) => {
      const group = get().groups.get(groupId);
      if (!group) return;
      
      set(state => {
        const newGroups = new Map(state.groups);
        const updatedGroup = { 
          ...group, 
          childLayerIds: [...group.childLayerIds, ...layerIds],
          modifiedAt: Date.now()
        };
        newGroups.set(groupId, updatedGroup);
        return { groups: newGroups };
      });
    },

    removeLayersFromGroup: (layerIds: string[]) => {
      set(state => {
        const newGroups = new Map(state.groups);
        
        for (const [groupId, group] of newGroups) {
          const updatedGroup = {
            ...group,
            childLayerIds: group.childLayerIds.filter(id => !layerIds.includes(id)),
            modifiedAt: Date.now()
          };
          newGroups.set(groupId, updatedGroup);
        }
        
        return { groups: newGroups };
      });
    },

    toggleGroupCollapse: (id: string) => {
      const group = get().groups.get(id);
      if (!group) return;
      
      set(state => {
        const newGroups = new Map(state.groups);
        const updatedGroup = { ...group, collapsed: !group.collapsed, modifiedAt: Date.now() };
        newGroups.set(id, updatedGroup);
        return { groups: newGroups };
      });
    },

    renameGroup: (id: string, name: string) => {
      const group = get().groups.get(id);
      if (!group) return;
      
      set(state => {
        const newGroups = new Map(state.groups);
        const updatedGroup = { ...group, name, modifiedAt: Date.now() };
        newGroups.set(id, updatedGroup);
        return { groups: newGroups };
      });
    },

    toggleGroupVisibility: (id: string) => {
      const group = get().groups.get(id);
      if (!group) return;
      
      set(state => {
        const newGroups = new Map(state.groups);
        const updatedGroup = { ...group, visible: !group.visible, modifiedAt: Date.now() };
        newGroups.set(id, updatedGroup);
        return { groups: newGroups };
      });
    },

    selectGroup: (id: string) => {
      set({ activeGroupId: id });
    },

    // Layer effects
    addLayerEffect: (layerId: string, effect: LayerEffect) => {
      const layer = get().layers.get(layerId);
      if (!layer) return;
      
      set(state => {
        const newLayers = new Map(state.layers);
        const updatedLayer = { 
          ...layer, 
          effects: [...layer.effects, effect],
          modifiedAt: Date.now()
        };
        newLayers.set(layerId, updatedLayer);
        return { layers: newLayers, needsComposition: true };
      });
    },

    removeLayerEffect: (layerId: string, effectId: string) => {
      const layer = get().layers.get(layerId);
      if (!layer) return;
      
      set(state => {
        const newLayers = new Map(state.layers);
        const updatedLayer = { 
          ...layer, 
          effects: layer.effects.filter(effect => effect.id !== effectId),
          modifiedAt: Date.now()
        };
        newLayers.set(layerId, updatedLayer);
        return { layers: newLayers, needsComposition: true };
      });
    },

    updateLayerEffect: (layerId: string, effectId: string, settings: Record<string, any>) => {
      const layer = get().layers.get(layerId);
      if (!layer) return;
      
      set(state => {
        const newLayers = new Map(state.layers);
        const updatedLayer = { 
          ...layer, 
          effects: layer.effects.map(effect => 
            effect.id === effectId 
              ? { ...effect, settings: { ...effect.settings, ...settings } }
              : effect
          ),
          modifiedAt: Date.now()
        };
        newLayers.set(layerId, updatedLayer);
        return { layers: newLayers, needsComposition: true };
      });
    },

    toggleLayerEffect: (layerId: string, effectId: string) => {
      const layer = get().layers.get(layerId);
      if (!layer) return;
      
      set(state => {
        const newLayers = new Map(state.layers);
        const updatedLayer = { 
          ...layer, 
          effects: layer.effects.map(effect => 
            effect.id === effectId 
              ? { ...effect, enabled: !effect.enabled }
              : effect
          ),
          modifiedAt: Date.now()
        };
        newLayers.set(layerId, updatedLayer);
        return { layers: newLayers, needsComposition: true };
      });
    },

    // Layer masks
    addLayerMask: (layerId: string, mask: LayerMask) => {
      const layer = get().layers.get(layerId);
      if (!layer) return;
      
      set(state => {
        const newLayers = new Map(state.layers);
        const updatedLayer = { ...layer, mask, modifiedAt: Date.now() };
        newLayers.set(layerId, updatedLayer);
        return { layers: newLayers, needsComposition: true };
      });
    },

    removeLayerMask: (layerId: string) => {
      const layer = get().layers.get(layerId);
      if (!layer) return;
      
      set(state => {
        const newLayers = new Map(state.layers);
        const updatedLayer = { ...layer, mask: undefined, modifiedAt: Date.now() };
        newLayers.set(layerId, updatedLayer);
        return { layers: newLayers, needsComposition: true };
      });
    },

    updateLayerMask: (layerId: string, maskUpdates: Partial<LayerMask>) => {
      const layer = get().layers.get(layerId);
      if (!layer || !layer.mask) return;
      
      set(state => {
        const newLayers = new Map(state.layers);
        const updatedLayer = { 
          ...layer, 
          mask: { 
            ...layer.mask, 
            ...maskUpdates,
            id: layer.mask?.id || `mask-${Date.now()}`,
            type: layer.mask?.type || 'raster',
            canvas: layer.mask?.canvas || document.createElement('canvas'),
            inverted: layer.mask?.inverted || false,
            density: layer.mask?.density || 1,
            feather: layer.mask?.feather || 0
          },
          modifiedAt: Date.now()
        };
        newLayers.set(layerId, updatedLayer);
        return { layers: newLayers, needsComposition: true };
      });
    },

    // Layer styles
    applyLayerStyle: (layerId: string, styleId: string) => {
      const layer = get().layers.get(layerId);
      const style = get().layerStyles.get(styleId);
      if (!layer || !style) return;
      
      set(state => {
        const newLayers = new Map(state.layers);
        const updatedLayer = { 
          ...layer, 
          layerStyle: style,
          effects: [...style.effects],
          blendMode: style.blendMode,
          opacity: style.opacity,
          modifiedAt: Date.now()
        };
        newLayers.set(layerId, updatedLayer);
        return { layers: newLayers, needsComposition: true };
      });
    },

    createLayerStyle: (style: LayerStyle) => {
      const id = `style-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      set(state => {
        const newStyles = new Map(state.layerStyles);
        newStyles.set(id, { ...style, id });
        return { layerStyles: newStyles };
      });
      
      return id;
    },

    deleteLayerStyle: (styleId: string) => {
      set(state => {
        const newStyles = new Map(state.layerStyles);
        newStyles.delete(styleId);
        return { layerStyles: newStyles };
      });
    },

    // Selection
    selectLayer: (id: string) => {
      set({ 
        activeLayerId: id,
        selection: { layerIds: [id] }
      });
    },

    selectMultipleLayers: (ids: string[]) => {
      set({ 
        activeLayerId: ids[ids.length - 1] || null,
        selection: { layerIds: ids }
      });
    },

    clearSelection: () => {
      set({ 
        activeLayerId: null,
        selection: { layerIds: [] }
      });
    },

    // Composition
    composeLayers: () => {
      const { layers, layerOrder, groups } = get();
      
      // Create composed canvas
      const composedCanvas = document.createElement('canvas');
      composedCanvas.width = 2048;
      composedCanvas.height = 2048;
      const ctx = composedCanvas.getContext('2d');
      
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, 2048, 2048);
      
      // Sort layers by order
      const sortedItems = [...layerOrder].sort((a, b) => {
        const layerA = layers.get(a);
        const groupA = groups.get(a);
        const layerB = layers.get(b);
        const groupB = groups.get(b);
        
        const orderA = layerA?.order ?? groupA?.order ?? 0;
        const orderB = layerB?.order ?? groupB?.order ?? 0;
        
        return orderA - orderB;
      });
      
      // Draw layers
      for (const itemId of sortedItems) {
        const layer = layers.get(itemId);
        const group = groups.get(itemId);
        
        if (layer && layer.visible) {
          ctx.save();
          
          // Apply layer properties
          ctx.globalAlpha = layer.opacity;
          ctx.globalCompositeOperation = blendModeToGlobalCompositeOperation(layer.blendMode);
          
          // Draw layer canvas
          ctx.drawImage(layer.canvas, 0, 0);
          
          // Apply layer effects
          for (const effect of layer.effects) {
            if (effect.enabled) {
              // Apply effect based on type
              // This would be implemented with specific effect rendering
            }
          }
          
          ctx.restore();
        } else if (group && group.visible && !group.collapsed) {
          // Draw group layers
          for (const childId of group.childLayerIds) {
            const childLayer = layers.get(childId);
            if (childLayer && childLayer.visible) {
              ctx.save();
              ctx.globalAlpha = childLayer.opacity * group.opacity;
              ctx.globalCompositeOperation = blendModeToGlobalCompositeOperation(childLayer.blendMode);
              ctx.drawImage(childLayer.canvas, 0, 0);
              ctx.restore();
            }
          }
        }
      }
      
      set({ 
        composedCanvas,
        needsComposition: false,
        compositionVersion: get().compositionVersion + 1
      });
    },

    composeDisplacementMaps: () => {
      const { layers, layerOrder } = get();
      
      const composedDisplacementCanvas = document.createElement('canvas');
      composedDisplacementCanvas.width = 2048;
      composedDisplacementCanvas.height = 2048;
      const ctx = composedDisplacementCanvas.getContext('2d');
      
      if (!ctx) return;
      
      // Clear with neutral gray
      ctx.fillStyle = 'rgb(128, 128, 128)';
      ctx.fillRect(0, 0, 2048, 2048);
      
      // Draw displacement layers
      for (const layerId of layerOrder) {
        const layer = layers.get(layerId);
        if (layer && layer.visible && layer.displacementCanvas) {
          ctx.save();
          ctx.globalAlpha = layer.opacity;
          ctx.globalCompositeOperation = 'source-over';
          ctx.drawImage(layer.displacementCanvas, 0, 0);
          ctx.restore();
        }
      }
      
      set({ composedDisplacementCanvas });
    },

    // History
    saveState: (action: string) => {
      const { layers, groups, layerOrder, activeLayerId, history, historyIndex, maxHistorySize } = get();
      
      const snapshot: LayerStateSnapshot = {
        layers: new Map(layers),
        groups: new Map(groups),
        layerOrder: [...layerOrder],
        activeLayerId,
        timestamp: Date.now(),
        action
      };
      
      // Remove any future history if we're not at the end
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(snapshot);
      
      // Trim history if too long
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
      }
      
      set({
        history: newHistory,
        historyIndex: newHistory.length - 1
      });
    },

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex <= 0) return;
      
      const snapshot = history[historyIndex - 1];
      
      set({
        layers: new Map(snapshot.layers),
        groups: new Map(snapshot.groups),
        layerOrder: [...snapshot.layerOrder],
        activeLayerId: snapshot.activeLayerId,
        historyIndex: historyIndex - 1,
        needsComposition: true
      });
      
      get().composeLayers();
    },

    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex >= history.length - 1) return;
      
      const snapshot = history[historyIndex + 1];
      
      set({
        layers: new Map(snapshot.layers),
        groups: new Map(snapshot.groups),
        layerOrder: [...snapshot.layerOrder],
        activeLayerId: snapshot.activeLayerId,
        historyIndex: historyIndex + 1,
        needsComposition: true
      });
      
      get().composeLayers();
    },

    canUndo: () => get().historyIndex > 0,
    canRedo: () => get().historyIndex < get().history.length - 1,

    // Utility
    getLayer: (id: string) => get().layers.get(id),
    getActiveLayer: () => {
      const { activeLayerId, layers } = get();
      return activeLayerId ? layers.get(activeLayerId) || null : null;
    },
    getLayerOrder: () => get().layerOrder,
    
    exportLayerAsImage: (id: string) => {
      const layer = get().layers.get(id);
      if (!layer) return null;
      
      const canvas = document.createElement('canvas');
      canvas.width = layer.canvas.width;
      canvas.height = layer.canvas.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return null;
      
      ctx.drawImage(layer.canvas, 0, 0);
      return canvas;
    },

    mergeLayers: (layerIds: string[]) => {
      const { layers } = get();
      const layersToMerge = layerIds.map(id => layers.get(id)).filter(Boolean) as AdvancedLayer[];
      
      if (layersToMerge.length < 2) return '';
      
      // Create new merged layer
      const mergedId = get().createLayer('pixel', 'Merged Layer');
      const mergedLayer = get().layers.get(mergedId);
      
      if (mergedLayer) {
        const ctx = mergedLayer.canvas.getContext('2d');
        if (ctx) {
          // Draw all layers to merged layer
          for (const layer of layersToMerge) {
            ctx.save();
            ctx.globalAlpha = layer.opacity;
            ctx.globalCompositeOperation = blendModeToGlobalCompositeOperation(layer.blendMode);
            ctx.drawImage(layer.canvas, 0, 0);
            ctx.restore();
          }
        }
        
        // Delete original layers
        for (const id of layerIds) {
          get().deleteLayer(id);
        }
      }
      
      get().saveState(`Merge ${layerIds.length} layers`);
      return mergedId;
    },

    flattenLayers: () => {
      const { layers, layerOrder } = get();
      
      // Create flattened layer
      const flattenedId = get().createLayer('pixel', 'Flattened Image');
      const flattenedLayer = get().layers.get(flattenedId);
      
      if (flattenedLayer) {
        const ctx = flattenedLayer.canvas.getContext('2d');
        if (ctx) {
          // Draw all visible layers
          for (const layerId of layerOrder) {
            const layer = layers.get(layerId);
            if (layer && layer.visible) {
              ctx.save();
              ctx.globalAlpha = layer.opacity;
              ctx.globalCompositeOperation = blendModeToGlobalCompositeOperation(layer.blendMode);
              ctx.drawImage(layer.canvas, 0, 0);
              ctx.restore();
            }
          }
        }
        
        // Delete all other layers
        for (const layerId of layerOrder) {
          if (layerId !== flattenedId) {
            get().deleteLayer(layerId);
          }
        }
      }
      
      get().saveState('Flatten layers');
    }
  }))
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const LayerUtils = {
  // Create default layer effects
  createDropShadow: (): LayerEffect => ({
    id: `effect-${Date.now()}`,
    type: 'drop-shadow',
    enabled: true,
    settings: {
      color: '#000000',
      opacity: 0.75,
      angle: 135,
      distance: 5,
      spread: 0,
      size: 5
    }
  }),

  createInnerShadow: (): LayerEffect => ({
    id: `effect-${Date.now()}`,
    type: 'inner-shadow',
    enabled: true,
    settings: {
      color: '#000000',
      opacity: 0.75,
      angle: 135,
      distance: 5,
      choke: 0,
      size: 5
    }
  }),

  createOuterGlow: (): LayerEffect => ({
    id: `effect-${Date.now()}`,
    type: 'outer-glow',
    enabled: true,
    settings: {
      color: '#ffff00',
      opacity: 0.75,
      technique: 'softer',
      spread: 0,
      size: 10
    }
  }),

  createInnerGlow: (): LayerEffect => ({
    id: `effect-${Date.now()}`,
    type: 'inner-glow',
    enabled: true,
    settings: {
      color: '#ffff00',
      opacity: 0.75,
      technique: 'softer',
      choke: 0,
      size: 10
    }
  }),

  createBevelEmboss: (): LayerEffect => ({
    id: `effect-${Date.now()}`,
    type: 'bevel-emboss',
    enabled: true,
    settings: {
      style: 'inner-bevel',
      technique: 'smooth',
      depth: 100,
      direction: 'up',
      size: 5,
      soften: 0,
      angle: 135,
      altitude: 30,
      highlightColor: '#ffffff',
      highlightOpacity: 0.75,
      shadowColor: '#000000',
      shadowOpacity: 0.75
    }
  }),

  // Create layer masks
  createRasterMask: (canvas: HTMLCanvasElement): LayerMask => ({
    id: `mask-${Date.now()}`,
    type: 'raster',
    canvas,
    inverted: false,
    density: 1.0,
    feather: 0
  }),

  createVectorMask: (canvas: HTMLCanvasElement): LayerMask => ({
    id: `mask-${Date.now()}`,
    type: 'vector',
    canvas,
    inverted: false,
    density: 1.0,
    feather: 0
  }),

  // Blend mode utilities
  getBlendModes: (): { value: BlendMode; label: string; category: string }[] => [
    { value: 'normal', label: 'Normal', category: 'Normal' },
    { value: 'multiply', label: 'Multiply', category: 'Darken' },
    { value: 'screen', label: 'Screen', category: 'Lighten' },
    { value: 'overlay', label: 'Overlay', category: 'Overlay' },
    { value: 'soft-light', label: 'Soft Light', category: 'Overlay' },
    { value: 'hard-light', label: 'Hard Light', category: 'Overlay' },
    { value: 'color-dodge', label: 'Color Dodge', category: 'Lighten' },
    { value: 'color-burn', label: 'Color Burn', category: 'Darken' },
    { value: 'darken', label: 'Darken', category: 'Darken' },
    { value: 'lighten', label: 'Lighten', category: 'Lighten' },
    { value: 'difference', label: 'Difference', category: 'Difference' },
    { value: 'exclusion', label: 'Exclusion', category: 'Difference' },
    { value: 'hue', label: 'Hue', category: 'HSL' },
    { value: 'saturation', label: 'Saturation', category: 'HSL' },
    { value: 'color', label: 'Color', category: 'HSL' },
    { value: 'luminosity', label: 'Luminosity', category: 'HSL' }
  ]
};
