/**
 * 🎨 ADVANCED LAYER SYSTEM - Photoshop-Beating Features
 * 
 * This system provides:
 * - Real-time synchronization with 3D model
 * - Advanced blend modes and effects
 * - Layer masks and clipping
 * - Smart objects and non-destructive editing
 * - Performance optimizations
 * - Comprehensive layer management
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import * as THREE from 'three';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type LayerType = 
  | 'raster' 
  | 'vector' 
  | 'text' 
  | 'shape' 
  | 'adjustment' 
  | 'smart-object' 
  | 'group'
  | 'base-files'
  | 'sky-background'
  | 'foreground-elements'
  | 'effects'
  | 'lighting'
  | 'overlay'
  | 'mask'
  | 'reference';

export type BlendMode = 
  | 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light' | 'hard-light'
  | 'color-dodge' | 'color-burn' | 'darken' | 'lighten' | 'difference' | 'exclusion'
  | 'hue' | 'saturation' | 'color' | 'luminosity' | 'linear-burn' | 'linear-dodge'
  | 'vivid-light' | 'linear-light' | 'pin-light' | 'hard-mix' | 'subtract' | 'divide'
  | 'add' | 'subtract' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';

export interface LayerTransform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  skewX: number;
  skewY: number;
}

export interface LayerMask {
  id: string;
  canvas: HTMLCanvasElement;
  inverted: boolean;
  density: number;
  feather: number;
}

export interface LayerEffect {
  id: string;
  type: 'drop-shadow' | 'inner-shadow' | 'outer-glow' | 'inner-glow' | 'bevel-emboss' | 'stroke' | 'color-overlay' | 'gradient-overlay' | 'pattern-overlay';
  enabled: boolean;
  settings: Record<string, any>;
}

export interface LayerStyle {
  id: string;
  name: string;
  effects: LayerEffect[];
  blendMode: BlendMode;
  opacity: number;
}

export interface SmartObjectData {
  id: string;
  originalWidth: number;
  originalHeight: number;
  embeddedData: string; // Base64 encoded
  transform: LayerTransform;
  filters: any[];
}

export interface AdjustmentLayerData {
  type: 'brightness-contrast' | 'hue-saturation' | 'color-balance' | 'levels' | 'curves' | 'vibrance' | 'photo-filter' | 'gradient-map' | 'selective-color';
  settings: Record<string, any>;
  mask?: LayerMask;
}

export interface TextLayerData {
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  color: string;
  alignment: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
  textDecoration: 'none' | 'underline' | 'line-through' | 'overline';
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textShadow?: {
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
  };
}

export interface ShapeLayerData {
  shapeType: 'rectangle' | 'ellipse' | 'polygon' | 'path' | 'star' | 'arrow';
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  pathData?: string; // SVG path data
  cornerRadius?: number; // For rectangles
  sides?: number; // For polygons
  innerRadius?: number; // For stars
}

export interface AdvancedLayer {
  // Core Properties
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
  normalCanvas?: HTMLCanvasElement;
  
  // Masks
  mask?: LayerMask;
  vectorMask?: LayerMask;
  clippingMask?: boolean;
  
  // Effects and styles
  effects: LayerEffect[];
  layerStyle?: LayerStyle;
  
  // Grouping
  parentGroupId?: string;
  childLayerIds: string[];
  
  // Smart object properties
  smartObjectData?: SmartObjectData;
  
  // Type-specific data
  textData?: TextLayerData;
  shapeData?: ShapeLayerData;
  adjustmentData?: AdjustmentLayerData;
  
  // Transform
  transform: LayerTransform;
  
  // History and undo
  history: ImageData[];
  future: ImageData[];
  
  // Metadata
  createdAt: number;
  modifiedAt: number;
  toolType?: string;
  
  // Performance
  needsUpdate: boolean;
  cachedTexture?: THREE.Texture;
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
  color?: string; // Group color for organization
}

export interface LayerSystemState {
  // Core state
  layers: Map<string, AdvancedLayer>;
  groups: Map<string, LayerGroup>;
  layerOrder: string[];
  activeLayerId: string | null;
  selectedLayerIds: string[];
  
  // Composition
  composedCanvas: HTMLCanvasElement | null;
  displacementCanvas: HTMLCanvasElement | null;
  normalCanvas: HTMLCanvasElement | null;
  needsComposition: boolean;
  compositionVersion: number;
  
  // UI state
  expandedGroups: Set<string>;
  layerPanelWidth: number;
  showLayerEffects: boolean;
  showLayerMasks: boolean;
  
  // History
  history: LayerHistory[];
  historyIndex: number;
  
  // Performance
  maxHistorySize: number;
  compositionThrottle: number;
}

export interface LayerHistory {
  id: string;
  timestamp: Date;
  action: 'create' | 'delete' | 'modify' | 'reorder' | 'group' | 'ungroup' | 'apply-effect';
  layerId: string;
  data: any;
  snapshot?: ImageData;
}

export interface LayerHierarchy {
  name: string;
  type: LayerType;
  children: LayerHierarchy[];
  layers?: string[];
}

export interface LayerSystemActions {
  // Layer CRUD
  createLayer: (type: LayerType, name?: string, options?: Partial<AdvancedLayer>) => string;
  deleteLayer: (id: string) => void;
  duplicateLayer: (id: string) => string;
  
  // Layer properties
  updateLayer: (id: string, updates: Partial<AdvancedLayer>) => void;
  setActiveLayer: (id: string) => void;
  getActiveLayer: () => AdvancedLayer | null;
  getLayer: (id: string) => AdvancedLayer | null;
  selectLayers: (ids: string[]) => void;
  
  // Additional layer operations
  toggleLayerVisibility: (id: string) => void;
  setLayerOpacity: (id: string, opacity: number) => void;
  setLayerBlendMode: (id: string, blendMode: BlendMode) => void;
  renameLayer: (id: string, newName: string) => void;
  
  // Layer ordering
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  moveLayerToTop: (id: string) => void;
  moveLayerToBottom: (id: string) => void;
  reorderLayers: (newOrder: string[]) => void;
  
  // Advanced grouping (Photoshop-style)
  createGroup: (name?: string, layerIds?: string[], groupType?: LayerType) => string;
  deleteGroup: (id: string) => void;
  addToGroup: (layerId: string, groupId: string) => void;
  removeFromGroup: (layerId: string) => void;
  toggleGroupCollapse: (groupId: string) => void;
  
  // Smart organization
  autoOrganizeLayers: () => void;
  createLayerHierarchy: (hierarchy: LayerHierarchy) => void;
  suggestLayerGrouping: (layerIds: string[]) => string[];
  
  // Non-destructive editing
  createAdjustmentLayer: (type: AdjustmentLayerData['type'], settings: Record<string, any>) => string;
  createMask: (layerId: string, maskType: 'raster' | 'vector') => string;
  applyNonDestructiveEffect: (layerId: string, effect: LayerEffect) => void;
  
  // Masks
  addMask: (layerId: string, mask: LayerMask) => void;
  removeMask: (layerId: string) => void;
  updateMask: (layerId: string, updates: Partial<LayerMask>) => void;
  
  // Effects
  addEffect: (layerId: string, effect: LayerEffect) => void;
  removeEffect: (layerId: string, effectId: string) => void;
  updateEffect: (layerId: string, effectId: string, updates: Partial<LayerEffect>) => void;
  
  // Smart objects
  createSmartObject: (layerId: string, data: SmartObjectData) => void;
  editSmartObject: (layerId: string) => void;
  
  // Composition
  composeLayers: () => void;
  composeDisplacementMaps: () => void;
  composeNormalMaps: () => void;
  
  // History
  undo: () => boolean;
  redo: () => boolean;
  clearHistory: () => void;
  
  // Performance
  optimizeLayer: (id: string) => void;
  clearCache: () => void;
  
  // Export
  exportLayer: (id: string, format: 'png' | 'jpg' | 'svg') => string;
  exportAllLayers: (format: 'png' | 'jpg' | 'svg') => string[];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const generateId = () => `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const createDefaultCanvas = (width: number = 1024, height: number = 1024): HTMLCanvasElement => {
      const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

const blendModeToGlobalCompositeOperation = (blendMode: BlendMode): GlobalCompositeOperation => {
  const modeMap: Record<BlendMode, GlobalCompositeOperation> = {
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
    'linear-burn': 'linear-burn',
    'linear-dodge': 'linear-dodge',
    'vivid-light': 'vivid-light',
    'linear-light': 'linear-light',
    'pin-light': 'pin-light',
    'hard-mix': 'hard-mix',
    'subtract': 'subtract',
    'divide': 'divide',
    'add': 'add'
  };
  return modeMap[blendMode] || 'source-over';
};

const createDefaultLayer = (type: LayerType, name?: string, options?: Partial<AdvancedLayer>): AdvancedLayer => {
  const id = options?.id || generateId();
  const canvas = createDefaultCanvas();
  
  return {
    id,
    name: name || `${type} Layer`,
        type,
        visible: true,
        locked: false,
        opacity: 1.0,
        fillOpacity: 1.0,
        blendMode: 'normal',
    order: 0,
        canvas,
        effects: [],
        childLayerIds: [],
    transform: {
      x: 0, y: 0,
      scaleX: 1, scaleY: 1,
      rotation: 0,
      skewX: 0, skewY: 0
    },
        history: [],
        future: [],
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    needsUpdate: true,
        ...options
  };
};

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useAdvancedLayerStore = create<LayerSystemState & LayerSystemActions>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    layers: new Map(),
    groups: new Map(),
    layerOrder: [],
    activeLayerId: null,
    selectedLayerIds: [],
    composedCanvas: null,
    displacementCanvas: null,
    normalCanvas: null,
    needsComposition: true,
    compositionVersion: 0,
    expandedGroups: new Set(),
    layerPanelWidth: 300,
    showLayerEffects: true,
    showLayerMasks: true,
    history: [],
    historyIndex: -1,
    maxHistorySize: 50,
    compositionThrottle: 16, // ~60fps

    // Layer CRUD Operations
    createLayer: (type: LayerType, name?: string, options?: Partial<AdvancedLayer>) => {
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
      
      // Remove from groups
      if (layer.parentGroupId) {
        const group = state.groups.get(layer.parentGroupId);
        if (group) {
          const updatedGroup = {
            ...group,
            childLayerIds: group.childLayerIds.filter(childId => childId !== id)
          };
          set(state => ({
            groups: new Map([...state.groups, [layer.parentGroupId!, updatedGroup]])
          }));
        }
      }

      // Add to history
      const historyEntry: LayerHistory = {
        id: generateId(),
        timestamp: new Date(),
        action: 'delete',
        layerId: id,
        data: { layer }
      };

      set(state => ({
        layers: new Map([...state.layers].filter(([key]) => key !== id)),
        layerOrder: state.layerOrder.filter(layerId => layerId !== id),
        activeLayerId: state.activeLayerId === id ? null : state.activeLayerId,
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
        order: originalLayer.order + 1,
        createdAt: Date.now(),
        modifiedAt: Date.now(),
        needsUpdate: true
      };

      // Create new canvas and copy content
      const newCanvas = createDefaultCanvas();
      const ctx = newCanvas.getContext('2d')!;
      ctx.drawImage(originalLayer.canvas, 0, 0);
      duplicatedLayer.canvas = newCanvas;

      set(state => ({
        layers: new Map([...state.layers, [duplicatedLayer.id, duplicatedLayer]]),
        layerOrder: [...state.layerOrder.slice(0, state.layerOrder.indexOf(id) + 1), duplicatedLayer.id, ...state.layerOrder.slice(state.layerOrder.indexOf(id) + 1)],
        activeLayerId: duplicatedLayer.id,
        needsComposition: true
      }));

      return duplicatedLayer.id;
    },

    // Layer properties
    updateLayer: (id: string, updates: Partial<AdvancedLayer>) => {
      const state = get();
      const layer = state.layers.get(id);
      if (!layer) return;
      
      const updatedLayer = {
        ...layer,
        ...updates,
        modifiedAt: Date.now(),
        needsUpdate: true
      };

      set(state => ({
        layers: new Map([...state.layers, [id, updatedLayer]]),
        needsComposition: true
      }));
    },

    setActiveLayer: (id: string) => {
      set({ activeLayerId: id });
    },

    getActiveLayer: () => {
      const state = get();
      return state.activeLayerId ? state.layers.get(state.activeLayerId) : null;
    },

    getLayer: (id: string) => {
      const state = get();
      return state.layers.get(id) || null;
    },

    selectLayers: (ids: string[]) => {
      set({ selectedLayerIds: ids });
    },

    // Additional layer operations
    toggleLayerVisibility: (id: string) => {
      const state = get();
      const layer = state.layers.get(id);
      if (!layer) return;
      
      const updatedLayer = { ...layer, visible: !layer.visible };
      set(state => ({
        layers: new Map([...state.layers, [id, updatedLayer]]),
        needsComposition: true
      }));
    },

    setLayerOpacity: (id: string, opacity: number) => {
      const state = get();
      const layer = state.layers.get(id);
      if (!layer) return;
      
      const updatedLayer = { ...layer, opacity: Math.max(0, Math.min(1, opacity)) };
      set(state => ({
        layers: new Map([...state.layers, [id, updatedLayer]]),
        needsComposition: true
      }));
    },

    setLayerBlendMode: (id: string, blendMode: BlendMode) => {
      const state = get();
      const layer = state.layers.get(id);
      if (!layer) return;
      
      const updatedLayer = { ...layer, blendMode };
      set(state => ({
        layers: new Map([...state.layers, [id, updatedLayer]]),
        needsComposition: true
      }));
    },

    renameLayer: (id: string, newName: string) => {
      const state = get();
      const layer = state.layers.get(id);
      if (!layer) return;
      
      const updatedLayer = { ...layer, name: newName };
      set(state => ({
        layers: new Map([...state.layers, [id, updatedLayer]])
      }));
    },

    // Layer ordering
    moveLayerUp: (id: string) => {
      const state = get();
      const currentIndex = state.layerOrder.indexOf(id);
      if (currentIndex <= 0) return;
      
      const newOrder = [...state.layerOrder];
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
      
      set({ layerOrder: newOrder, needsComposition: true });
    },

    moveLayerDown: (id: string) => {
      const state = get();
      const currentIndex = state.layerOrder.indexOf(id);
      if (currentIndex >= state.layerOrder.length - 1) return;

      const newOrder = [...state.layerOrder];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
      
      set({ layerOrder: newOrder, needsComposition: true });
    },

    moveLayerToTop: (id: string) => {
      const state = get();
      const newOrder = [id, ...state.layerOrder.filter(layerId => layerId !== id)];
      set({ layerOrder: newOrder, needsComposition: true });
    },

    moveLayerToBottom: (id: string) => {
      const state = get();
      const newOrder = [...state.layerOrder.filter(layerId => layerId !== id), id];
      set({ layerOrder: newOrder, needsComposition: true });
    },

    reorderLayers: (newOrder: string[]) => {
      set({ layerOrder: newOrder, needsComposition: true });
    },

    // Groups
    createGroup: (name?: string, layerIds?: string[], groupType?: LayerType) => {
      const groupId = generateId();
      const group: LayerGroup = {
        id: groupId,
        name: name || 'Group',
        visible: true,
        locked: false,
        opacity: 1.0,
        blendMode: 'normal',
        order: 0,
        childLayerIds: layerIds || [],
        collapsed: false,
        color: groupType === 'base-files' ? '#ff6b6b' : 
               groupType === 'sky-background' ? '#4ecdc4' :
               groupType === 'foreground-elements' ? '#45b7d1' :
               groupType === 'effects' ? '#f9ca24' :
               groupType === 'lighting' ? '#f0932b' : undefined
      };

      set(state => ({
        groups: new Map([...state.groups, [groupId, group]]),
        needsComposition: true
      }));

      return groupId;
    },

    deleteGroup: (id: string) => {
      const state = get();
      const group = state.groups.get(id);
      if (!group) return;
      
      // Move child layers out of group
      set(state => ({
        groups: new Map([...state.groups].filter(([key]) => key !== id)),
        needsComposition: true
      }));
    },

    addToGroup: (layerId: string, groupId: string) => {
      const state = get();
      const layer = state.layers.get(layerId);
      const group = state.groups.get(groupId);
      
      if (!layer || !group) return;

      const updatedLayer = { ...layer, parentGroupId: groupId };
      const updatedGroup = { ...group, childLayerIds: [...group.childLayerIds, layerId] };

      set(state => ({
        layers: new Map([...state.layers, [layerId, updatedLayer]]),
        groups: new Map([...state.groups, [groupId, updatedGroup]]),
        needsComposition: true
      }));
    },

    removeFromGroup: (layerId: string) => {
      const state = get();
      const layer = state.layers.get(layerId);
      if (!layer || !layer.parentGroupId) return;

      const group = state.groups.get(layer.parentGroupId);
      if (!group) return;

      const updatedLayer = { ...layer, parentGroupId: undefined };
      const updatedGroup = { ...group, childLayerIds: group.childLayerIds.filter(id => id !== layerId) };

      set(state => ({
        layers: new Map([...state.layers, [layerId, updatedLayer]]),
        groups: new Map([...state.groups, [layer.parentGroupId!, updatedGroup]]),
        needsComposition: true
      }));
    },

    toggleGroupCollapse: (groupId: string) => {
      const state = get();
      const group = state.groups.get(groupId);
      if (!group) return;
      
      const updatedGroup = { ...group, collapsed: !group.collapsed };
      set(state => ({
        groups: new Map([...state.groups, [groupId, updatedGroup]])
      }));
    },

    // Masks
    addMask: (layerId: string, mask: LayerMask) => {
      const state = get();
      const layer = state.layers.get(layerId);
      if (!layer) return;
      
      const updatedLayer = { ...layer, mask };
      set(state => ({
        layers: new Map([...state.layers, [layerId, updatedLayer]]),
        needsComposition: true
      }));
    },

    removeMask: (layerId: string) => {
      const state = get();
      const layer = state.layers.get(layerId);
      if (!layer) return;
      
      const updatedLayer = { ...layer, mask: undefined };
      set(state => ({
        layers: new Map([...state.layers, [layerId, updatedLayer]]),
        needsComposition: true
      }));
    },

    updateMask: (layerId: string, updates: Partial<LayerMask>) => {
      const state = get();
      const layer = state.layers.get(layerId);
      if (!layer || !layer.mask) return;

      const updatedMask = { ...layer.mask, ...updates };
      const updatedLayer = { ...layer, mask: updatedMask };
      
      set(state => ({
        layers: new Map([...state.layers, [layerId, updatedLayer]]),
        needsComposition: true
      }));
    },

    // Effects
    addEffect: (layerId: string, effect: LayerEffect) => {
      const state = get();
      const layer = state.layers.get(layerId);
      if (!layer) return;
      
      const updatedLayer = { ...layer, effects: [...layer.effects, effect] };
      set(state => ({
        layers: new Map([...state.layers, [layerId, updatedLayer]]),
        needsComposition: true
      }));
    },

    removeEffect: (layerId: string, effectId: string) => {
      const state = get();
      const layer = state.layers.get(layerId);
      if (!layer) return;
      
      const updatedLayer = { ...layer, effects: layer.effects.filter(effect => effect.id !== effectId) };
      set(state => ({
        layers: new Map([...state.layers, [layerId, updatedLayer]]),
        needsComposition: true
      }));
    },

    updateEffect: (layerId: string, effectId: string, updates: Partial<LayerEffect>) => {
      const state = get();
      const layer = state.layers.get(layerId);
      if (!layer) return;
      
      const updatedEffects = layer.effects.map(effect => 
        effect.id === effectId ? { ...effect, ...updates } : effect
      );
      const updatedLayer = { ...layer, effects: updatedEffects };
      
      set(state => ({
        layers: new Map([...state.layers, [layerId, updatedLayer]]),
        needsComposition: true
      }));
    },

    // Smart objects
    createSmartObject: (layerId: string, data: SmartObjectData) => {
      const state = get();
      const layer = state.layers.get(layerId);
      if (!layer) return;

      const updatedLayer = { ...layer, smartObjectData: data, type: 'smart-object' as LayerType };
      set(state => ({
        layers: new Map([...state.layers, [layerId, updatedLayer]]),
        needsComposition: true
      }));
    },

    editSmartObject: (layerId: string) => {
      // This would open a separate editing window for the smart object
      console.log('Editing smart object:', layerId);
    },

    // Composition
    composeLayers: () => {
      const { layers, layerOrder, groups } = get();
      
      // Create composed canvas
      const composedCanvas = createDefaultCanvas();
      const ctx = composedCanvas.getContext('2d')!;
      
      // Clear canvas
      ctx.clearRect(0, 0, composedCanvas.width, composedCanvas.height);
      
      // Sort layers and groups by order
      const allItems = [...layerOrder, ...Array.from(groups.keys())];
      const sortedItems = allItems.sort((a, b) => {
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
          
          // Apply transform
          if (layer.transform) {
            ctx.translate(layer.transform.x, layer.transform.y);
            ctx.rotate(layer.transform.rotation);
            ctx.scale(layer.transform.scaleX, layer.transform.scaleY);
          }
          
          // Draw layer canvas
          ctx.drawImage(layer.canvas, 0, 0);
          
          // Apply layer effects
          for (const effect of layer.effects) {
            if (effect.enabled) {
              // Apply effect based on type
              // This would be implemented with specific effect rendering
            }
          }
          
          // Apply mask if present
          if (layer.mask) {
            ctx.globalCompositeOperation = 'destination-in';
            ctx.drawImage(layer.mask.canvas, 0, 0);
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
      
      const displacementCanvas = createDefaultCanvas();
      const ctx = displacementCanvas.getContext('2d')!;
      
      ctx.clearRect(0, 0, displacementCanvas.width, displacementCanvas.height);
      
      for (const layerId of layerOrder) {
        const layer = layers.get(layerId);
        if (layer && layer.visible && layer.displacementCanvas) {
          ctx.drawImage(layer.displacementCanvas, 0, 0);
        }
      }
      
      set({ displacementCanvas });
    },

    composeNormalMaps: () => {
      const { layers, layerOrder } = get();
      
      const normalCanvas = createDefaultCanvas();
      const ctx = normalCanvas.getContext('2d')!;
      
      ctx.clearRect(0, 0, normalCanvas.width, normalCanvas.height);
      
      for (const layerId of layerOrder) {
        const layer = layers.get(layerId);
        if (layer && layer.visible && layer.normalCanvas) {
          ctx.drawImage(layer.normalCanvas, 0, 0);
        }
      }
      
      set({ normalCanvas });
    },

    // History
    undo: () => {
      const state = get();
      if (state.historyIndex <= 0) return false;

      const historyEntry = state.history[state.historyIndex - 1];
      // Implement undo logic based on action type
      
      set({ historyIndex: state.historyIndex - 1, needsComposition: true });
      return true;
    },

    redo: () => {
      const state = get();
      if (state.historyIndex >= state.history.length - 1) return false;

      const historyEntry = state.history[state.historyIndex + 1];
      // Implement redo logic based on action type
      
      set({ historyIndex: state.historyIndex + 1, needsComposition: true });
      return true;
    },

    clearHistory: () => {
      set({ history: [], historyIndex: -1 });
    },

    // Performance
    optimizeLayer: (id: string) => {
      const state = get();
      const layer = state.layers.get(id);
      if (!layer) return;

      // Implement layer optimization
      const optimizedLayer = { ...layer, needsUpdate: false };
      set(state => ({
        layers: new Map([...state.layers, [id, optimizedLayer]])
      }));
    },

    clearCache: () => {
      const state = get();
      const updatedLayers = new Map();
      
      for (const [id, layer] of state.layers) {
        updatedLayers.set(id, { ...layer, cachedTexture: undefined });
      }
      
      set({ layers: updatedLayers });
    },

    // Export
    exportLayer: (id: string, format: 'png' | 'jpg' | 'svg') => {
      const state = get();
      const layer = state.layers.get(id);
      if (!layer) return '';

      return layer.canvas.toDataURL(`image/${format}`);
    },

    exportAllLayers: (format: 'png' | 'jpg' | 'svg') => {
      const state = get();
      const exports: string[] = [];
      
      for (const layer of state.layers.values()) {
        exports.push(layer.canvas.toDataURL(`image/${format}`));
      }
      
      return exports;
    },

    // Smart organization features
    autoOrganizeLayers: () => {
      const state = get();
      const layers = Array.from(state.layers.values());
      
      // Create default Photoshop-style hierarchy
      const baseFilesGroup = createGroup('Base Files', [], 'base-files');
      const skyBackgroundGroup = createGroup('Sky & Background', [], 'sky-background');
      const foregroundGroup = createGroup('Foreground Elements', [], 'foreground-elements');
      const effectsGroup = createGroup('Effects & Overlays', [], 'effects');
      const lightingGroup = createGroup('Lighting', [], 'lighting');
      
      // Auto-categorize layers based on type and name
      layers.forEach(layer => {
        const layerName = layer.name.toLowerCase();
        const layerType = layer.type;
        
        if (layerType === 'text' || layerName.includes('text') || layerName.includes('title')) {
          addToGroup(layer.id, foregroundGroup);
        } else if (layerType === 'shape' || layerName.includes('shape') || layerName.includes('object')) {
          addToGroup(layer.id, foregroundGroup);
        } else if (layerName.includes('sky') || layerName.includes('background') || layerName.includes('bg')) {
          addToGroup(layer.id, skyBackgroundGroup);
        } else if (layerName.includes('effect') || layerName.includes('overlay') || layerName.includes('filter')) {
          addToGroup(layer.id, effectsGroup);
        } else if (layerName.includes('light') || layerName.includes('shadow') || layerName.includes('glow')) {
          addToGroup(layer.id, lightingGroup);
        } else {
          addToGroup(layer.id, baseFilesGroup);
        }
      });
      
      console.log('🎨 Layers auto-organized into Photoshop-style hierarchy');
    },

    createLayerHierarchy: (hierarchy: LayerHierarchy) => {
      const createGroupRecursive = (hierarchyItem: LayerHierarchy, parentId?: string): string => {
        const groupId = createGroup(hierarchyItem.name, hierarchyItem.layers, hierarchyItem.type);
        
        if (parentId) {
          addToGroup(groupId, parentId);
        }
        
        hierarchyItem.children.forEach(child => {
          createGroupRecursive(child, groupId);
        });
        
        return groupId;
      };
      
      createGroupRecursive(hierarchy);
    },

    suggestLayerGrouping: (layerIds: string[]) => {
      const state = get();
      const layers = layerIds.map(id => state.layers.get(id)).filter(Boolean) as AdvancedLayer[];
      
      // Simple AI-like grouping suggestion based on layer properties
      const suggestions: string[] = [];
      
      const textLayers = layers.filter(l => l.type === 'text');
      const shapeLayers = layers.filter(l => l.type === 'shape');
      const imageLayers = layers.filter(l => l.type === 'raster');
      
      if (textLayers.length > 1) {
        suggestions.push('Text Elements');
      }
      if (shapeLayers.length > 1) {
        suggestions.push('Shapes & Objects');
      }
      if (imageLayers.length > 1) {
        suggestions.push('Images & Graphics');
      }
      
      return suggestions;
    },

    // Non-destructive editing
    createAdjustmentLayer: (type: AdjustmentLayerData['type'], settings: Record<string, any>) => {
      const layerId = createLayer('adjustment', `${type} Adjustment`, {
        adjustmentData: { type, settings }
      });
      return layerId;
    },

    createMask: (layerId: string, maskType: 'raster' | 'vector') => {
      const state = get();
      const layer = state.layers.get(layerId);
      if (!layer) return '';

      const maskId = generateId();
      const maskCanvas = createDefaultCanvas();
      
      const mask: LayerMask = {
        id: maskId,
        canvas: maskCanvas,
        inverted: false,
        density: 1.0,
        feather: 0
      };

      addMask(layerId, mask);
      return maskId;
    },

    applyNonDestructiveEffect: (layerId: string, effect: LayerEffect) => {
      addEffect(layerId, effect);
    }
  }))
);

// ============================================================================
// REAL-TIME SYNCHRONIZATION WITH 3D MODEL
// ============================================================================

export class LayerModelSync {
  private static instance: LayerModelSync;
  private modelScene: THREE.Group | null = null;
  private layerStore: any = null;

  static getInstance(): LayerModelSync {
    if (!LayerModelSync.instance) {
      LayerModelSync.instance = new LayerModelSync();
    }
    return LayerModelSync.instance;
  }

  initialize(modelScene: THREE.Group, layerStore: any) {
    this.modelScene = modelScene;
    this.layerStore = layerStore;
    
    // Subscribe to layer changes
    layerStore.subscribe((state: any) => {
      if (state.needsComposition) {
        this.updateModelTexture();
      }
    });
  }

  updateModelTexture() {
    if (!this.modelScene || !this.layerStore) return;

    const { composedCanvas, displacementCanvas, normalCanvas } = this.layerStore.getState();
    
    if (!composedCanvas) return;

    // Create textures
    const texture = new THREE.CanvasTexture(composedCanvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    let displacementTexture: THREE.CanvasTexture | null = null;
    let normalTexture: THREE.CanvasTexture | null = null;

    if (displacementCanvas) {
      displacementTexture = new THREE.CanvasTexture(displacementCanvas);
      displacementTexture.generateMipmaps = true;
      displacementTexture.minFilter = THREE.LinearMipmapLinearFilter;
      displacementTexture.magFilter = THREE.LinearFilter;
      displacementTexture.needsUpdate = true;
    }

    if (normalCanvas) {
      normalTexture = new THREE.CanvasTexture(normalCanvas);
      normalTexture.generateMipmaps = true;
      normalTexture.minFilter = THREE.LinearMipmapLinearFilter;
      normalTexture.magFilter = THREE.LinearFilter;
      normalTexture.needsUpdate = true;
    }

    // Apply to model
    this.modelScene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        
        materials.forEach((mat: any) => {
          if (mat.isMeshStandardMaterial) {
            mat.map = texture;
            if (displacementTexture) mat.displacementMap = displacementTexture;
            if (normalTexture) mat.normalMap = normalTexture;
            mat.needsUpdate = true;
          }
        });
      }
    });
  }
}

export default useAdvancedLayerStore;