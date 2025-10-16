import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Layer Types
export type LayerType = 'paint' | 'puff' | 'vector' | 'text' | 'image' | 'embroidery' | 'adjustment' | 'group';

// Blend Modes (Photoshop-like)
export type BlendMode = 
  | 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light' | 'hard-light'
  | 'color-dodge' | 'color-burn' | 'darken' | 'lighten' | 'difference' | 'exclusion'
  | 'hue' | 'saturation' | 'color' | 'luminosity';

// Transform properties
export interface LayerTransform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  skewX: number;
  skewY: number;
}

// Layer effects
export interface LayerEffect {
  id: string;
  type: 'blur' | 'sharpen' | 'brightness' | 'contrast' | 'saturation' | 'hue' | 'drop-shadow' | 'inner-glow' | 'outer-glow';
  enabled: boolean;
  properties: Record<string, any>;
}

// Layer mask
export interface LayerMask {
  id: string;
  canvas: HTMLCanvasElement;
  enabled: boolean;
  inverted: boolean;
}

// Brush stroke interface
export interface BrushStroke {
  id: string;
  layerId: string;
  points: { x: number; y: number }[];
  color: string;
  size: number;
  opacity: number;
  timestamp: number;
}

// Text element interface
export interface TextElement {
  id: string;
  layerId: string;
  text: string;
  x: number;
  y: number;
  u: number;
  v: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  opacity: number;
  timestamp: number;
}

// Layer content (varies by type)
export interface LayerContent {
  canvas?: HTMLCanvasElement; // For paint layers
  text?: string; // For text layers
  imageData?: ImageData; // For image layers
  vectorData?: any; // For vector layers
  puffData?: any; // For puff layers
  embroideryData?: any; // For embroidery layers
  brushStrokes?: BrushStroke[]; // For paint layers
  textElements?: TextElement[]; // For text layers
}

// Main Layer interface
export interface AdvancedLayer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  opacity: number;
  blendMode: BlendMode;
  locked: boolean;
  effects: LayerEffect[];
  mask?: LayerMask;
  transform: LayerTransform;
  content: LayerContent;
  createdAt: Date;
  updatedAt: Date;
  groupId?: string;
  order: number; // For z-index management
  selected: boolean; // For selection state
  bounds?: { x: number; y: number; width: number; height: number }; // For selection bounds
}

// Layer Group
export interface LayerGroup {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  blendMode: BlendMode;
  locked: boolean;
  collapsed: boolean;
  layerIds: string[];
  createdAt: Date;
  order: number;
}

// Store state
interface AdvancedLayerStoreV2 {
  // Core data
  layers: AdvancedLayer[];
  groups: LayerGroup[];
  layerOrder: string[]; // Ordered list of layer IDs (top to bottom)
  
  // Selection state
  selectedLayerIds: string[];
  activeLayerId: string | null;
  
  // UI state
  showLayerPanel: boolean;
  autoGrouping: boolean;
  
  // Actions
  createLayer: (type: LayerType, name?: string) => string;
  deleteLayer: (id: string) => void;
  duplicateLayer: (id: string) => string;
  renameLayer: (id: string, name: string) => void;
  
  // Selection
  selectLayer: (id: string, multi?: boolean) => void;
  selectLayers: (ids: string[]) => void;
  clearSelection: () => void;
  setActiveLayer: (id: string) => void;
  
  // Properties
  setLayerVisibility: (id: string, visible: boolean) => void;
  setLayerOpacity: (id: string, opacity: number) => void;
  setLayerBlendMode: (id: string, blendMode: BlendMode) => void;
  setLayerLocked: (id: string, locked: boolean) => void;
  
  // Ordering
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  moveLayerToTop: (id: string) => void;
  moveLayerToBottom: (id: string) => void;
  reorderLayers: (newOrder: string[]) => void;
  
  // Groups
  createGroup: (name?: string) => string;
  deleteGroup: (id: string) => void;
  addToGroup: (layerId: string, groupId: string) => void;
  removeFromGroup: (layerId: string) => void;
  toggleGroupCollapse: (id: string) => void;
  
  // Effects
  addEffect: (layerId: string, effect: LayerEffect) => void;
  removeEffect: (layerId: string, effectId: string) => void;
  updateEffect: (layerId: string, effectId: string, properties: Record<string, any>) => void;
  
  // Masks
  addMask: (layerId: string, mask: LayerMask) => void;
  removeMask: (layerId: string) => void;
  updateMask: (layerId: string, maskData: Partial<LayerMask>) => void;
  toggleMaskEnabled: (layerId: string) => void;
  toggleMaskInverted: (layerId: string) => void;
  
  // Auto-grouping
  enableAutoGrouping: () => void;
  disableAutoGrouping: () => void;
  autoGroupLayers: () => void;
  
  // Smart naming
  generateLayerName: (type: LayerType) => string;
  
  // Content management
  updateLayerContent: (id: string, content: Partial<LayerContent>) => void;
  getLayerBounds: (id: string) => { x: number; y: number; width: number; height: number } | null;
  
  // Brush strokes
  addBrushStroke: (layerId: string, stroke: BrushStroke) => void;
  removeBrushStroke: (layerId: string, strokeId: string) => void;
  getBrushStrokes: (layerId: string) => BrushStroke[];
  
  // Text elements
  addTextElement: (layerId: string, textElement: TextElement) => void;
  removeTextElement: (layerId: string, textElementId: string) => void;
  getTextElements: (layerId: string) => TextElement[];
  
  // Layer composition
  composeLayers: () => HTMLCanvasElement | null;
}

// Helper functions
const generateLayerName = (type: LayerType, existingLayers: AdvancedLayer[]): string => {
  const typeNames = {
    paint: 'Paint Layer',
    puff: 'Puff Layer',
    vector: 'Vector Layer',
    text: 'Text Layer',
    image: 'Image Layer',
    embroidery: 'Embroidery Layer',
    adjustment: 'Adjustment Layer',
    group: 'Group'
  };
  
  const baseName = typeNames[type];
  const existingNames = existingLayers
    .filter(layer => layer.name.startsWith(baseName))
    .map(layer => layer.name);
  
  if (existingNames.length === 0) {
    return baseName;
  }
  
  // Find the next available number
  let counter = 1;
  while (existingNames.includes(`${baseName} ${counter}`)) {
    counter++;
  }
  
  return `${baseName} ${counter}`;
};

const createDefaultTransform = (): LayerTransform => ({
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
  skewX: 0,
  skewY: 0
});

const createDefaultContent = (type: LayerType): LayerContent => {
  switch (type) {
    case 'paint':
      // CRITICAL FIX: Create actual canvas for paint layers with correct size
      const canvas = document.createElement('canvas');
      canvas.width = 1536; // Match composed canvas size
      canvas.height = 1536; // Match composed canvas size
      return { canvas };
    case 'text':
      return { text: '' };
    case 'image':
      return { imageData: undefined };
    case 'vector':
      return { vectorData: null };
    case 'puff':
      return { puffData: null };
    case 'embroidery':
      return { embroideryData: null };
    case 'adjustment':
      return {};
    default:
      return {};
  }
};

// Create the store
export const useAdvancedLayerStoreV2 = create<AdvancedLayerStoreV2>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    layers: [],
    groups: [],
    layerOrder: [],
    selectedLayerIds: [],
    activeLayerId: null,
    showLayerPanel: true,
    autoGrouping: true,
    
    // Layer creation
    createLayer: (type: LayerType, name?: string) => {
      const state = get();
      const layerName = name || generateLayerName(type, state.layers);
      const newOrder = state.layerOrder.length;
      
      const newLayer: AdvancedLayer = {
        id: `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: layerName,
        type,
        visible: true,
        opacity: 1.0,
        blendMode: 'normal',
        locked: false,
        effects: [],
        transform: createDefaultTransform(),
        content: createDefaultContent(type),
        createdAt: new Date(),
        updatedAt: new Date(),
        order: newOrder,
        selected: false
      };
      
      set(state => ({
        layers: [...state.layers, newLayer],
        layerOrder: [...state.layerOrder, newLayer.id],
        activeLayerId: newLayer.id,
        selectedLayerIds: [newLayer.id]
      }));
      
      console.log(`🎨 Created new ${type} layer: ${layerName}`, newLayer);
      return newLayer.id;
    },
    
    // Layer deletion
    deleteLayer: (id: string) => {
      set(state => ({
        layers: state.layers.filter(layer => layer.id !== id),
        layerOrder: state.layerOrder.filter(layerId => layerId !== id),
        selectedLayerIds: state.selectedLayerIds.filter(layerId => layerId !== id),
        activeLayerId: state.activeLayerId === id ? null : state.activeLayerId
      }));
      
      console.log(`🗑️ Deleted layer: ${id}`);
    },
    
    // Layer duplication
    duplicateLayer: (id: string) => {
      const state = get();
      const originalLayer = state.layers.find(layer => layer.id === id);
      if (!originalLayer) return '';
      
      const duplicatedLayer: AdvancedLayer = {
        ...originalLayer,
        id: `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `${originalLayer.name} Copy`,
        createdAt: new Date(),
        updatedAt: new Date(),
        order: state.layerOrder.length,
        selected: false
      };
      
      set(state => ({
        layers: [...state.layers, duplicatedLayer],
        layerOrder: [...state.layerOrder, duplicatedLayer.id]
      }));
      
      console.log(`📋 Duplicated layer: ${originalLayer.name} -> ${duplicatedLayer.name}`);
      return duplicatedLayer.id;
    },
    
    // Layer renaming
    renameLayer: (id: string, name: string) => {
      set(state => ({
        layers: state.layers.map(layer =>
          layer.id === id ? { ...layer, name, updatedAt: new Date() } : layer
        )
      }));
      
      console.log(`✏️ Renamed layer ${id} to: ${name}`);
    },
    
    // Selection
    selectLayer: (id: string, multi: boolean = false) => {
      set(state => {
        const newSelectedIds = multi 
          ? [...state.selectedLayerIds, id]
          : [id];
        
        return {
          selectedLayerIds: newSelectedIds,
          activeLayerId: id,
          layers: state.layers.map(layer => ({
            ...layer,
            selected: newSelectedIds.includes(layer.id)
          }))
        };
      });
      
      console.log(`🎯 Selected layer: ${id}`);
    },
    
    selectLayers: (ids: string[]) => {
      set(state => ({
        selectedLayerIds: ids,
        activeLayerId: ids[0] || null,
        layers: state.layers.map(layer => ({
          ...layer,
          selected: ids.includes(layer.id)
        }))
      }));
      
      console.log(`🎯 Selected multiple layers:`, ids);
    },
    
    clearSelection: () => {
      set(state => ({
        selectedLayerIds: [],
        activeLayerId: null,
        layers: state.layers.map(layer => ({ ...layer, selected: false }))
      }));
      
      console.log(`🎯 Cleared layer selection`);
    },
    
    setActiveLayer: (id: string) => {
      set(state => ({
        activeLayerId: id,
        layers: state.layers.map(layer => ({
          ...layer,
          selected: layer.id === id
        }))
      }));
      
      console.log(`🎯 Set active layer: ${id}`);
    },
    
    // Properties
    setLayerVisibility: (id: string, visible: boolean) => {
      set(state => ({
        layers: state.layers.map(layer =>
          layer.id === id ? { ...layer, visible, updatedAt: new Date() } : layer
        )
      }));
      
      console.log(`👁️ Set layer ${id} visibility: ${visible}`);
    },
    
    setLayerOpacity: (id: string, opacity: number) => {
      set(state => ({
        layers: state.layers.map(layer =>
          layer.id === id ? { ...layer, opacity, updatedAt: new Date() } : layer
        )
      }));
      
      console.log(`🔍 Set layer ${id} opacity: ${opacity}`);
    },
    
    setLayerBlendMode: (id: string, blendMode: BlendMode) => {
      set(state => ({
        layers: state.layers.map(layer =>
          layer.id === id ? { ...layer, blendMode, updatedAt: new Date() } : layer
        )
      }));
      
      console.log(`🎨 Set layer ${id} blend mode: ${blendMode}`);
    },
    
    setLayerLocked: (id: string, locked: boolean) => {
      set(state => ({
        layers: state.layers.map(layer =>
          layer.id === id ? { ...layer, locked, updatedAt: new Date() } : layer
        )
      }));
      
      console.log(`🔒 Set layer ${id} locked: ${locked}`);
    },
    
    // Ordering
    moveLayerUp: (id: string) => {
      set(state => {
        const currentIndex = state.layerOrder.indexOf(id);
        if (currentIndex <= 0) return state;
        
        const newOrder = [...state.layerOrder];
        [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
        
        return {
          layerOrder: newOrder,
          layers: state.layers.map((layer, index) => ({
            ...layer,
            order: newOrder.indexOf(layer.id)
          }))
        };
      });
      
      console.log(`⬆️ Moved layer ${id} up`);
    },
    
    moveLayerDown: (id: string) => {
      set(state => {
        const currentIndex = state.layerOrder.indexOf(id);
        if (currentIndex >= state.layerOrder.length - 1) return state;
        
        const newOrder = [...state.layerOrder];
        [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
        
        return {
          layerOrder: newOrder,
          layers: state.layers.map((layer, index) => ({
            ...layer,
            order: newOrder.indexOf(layer.id)
          }))
        };
      });
      
      console.log(`⬇️ Moved layer ${id} down`);
    },
    
    moveLayerToTop: (id: string) => {
      set(state => {
        const newOrder = state.layerOrder.filter(layerId => layerId !== id);
        newOrder.unshift(id);
        
        return {
          layerOrder: newOrder,
          layers: state.layers.map((layer, index) => ({
            ...layer,
            order: newOrder.indexOf(layer.id)
          }))
        };
      });
      
      console.log(`🔝 Moved layer ${id} to top`);
    },
    
    moveLayerToBottom: (id: string) => {
      set(state => {
        const newOrder = state.layerOrder.filter(layerId => layerId !== id);
        newOrder.push(id);
        
        return {
          layerOrder: newOrder,
          layers: state.layers.map((layer, index) => ({
            ...layer,
            order: newOrder.indexOf(layer.id)
          }))
        };
      });
      
      console.log(`🔻 Moved layer ${id} to bottom`);
    },
    
    reorderLayers: (newOrder: string[]) => {
      set(state => ({
        layerOrder: newOrder,
        layers: state.layers.map(layer => ({
          ...layer,
          order: newOrder.indexOf(layer.id)
        }))
      }));
      
      console.log(`🔄 Reordered layers:`, newOrder);
    },
    
    // Groups (simplified for now)
    createGroup: (name?: string) => {
      const state = get();
      const groupName = name || generateLayerName('group', state.layers);
      const newGroup: LayerGroup = {
        id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: groupName,
        visible: true,
        opacity: 1.0,
        blendMode: 'normal',
        locked: false,
        collapsed: false,
        layerIds: [],
        createdAt: new Date(),
        order: state.layerOrder.length
      };
      
      set(state => ({
        groups: [...state.groups, newGroup]
      }));
      
      console.log(`📁 Created group: ${groupName}`);
      return newGroup.id;
    },
    
    deleteGroup: (id: string) => {
      set(state => ({
        groups: state.groups.filter(group => group.id !== id)
      }));
      
      console.log(`🗑️ Deleted group: ${id}`);
    },
    
    addToGroup: (layerId: string, groupId: string) => {
      set(state => ({
        groups: state.groups.map(group =>
          group.id === groupId
            ? { ...group, layerIds: [...group.layerIds, layerId] }
            : group
        ),
        layers: state.layers.map(layer =>
          layer.id === layerId ? { ...layer, groupId } : layer
        )
      }));
      
      console.log(`➕ Added layer ${layerId} to group ${groupId}`);
    },
    
    removeFromGroup: (layerId: string) => {
      set(state => ({
        groups: state.groups.map(group => ({
          ...group,
          layerIds: group.layerIds.filter(id => id !== layerId)
        })),
        layers: state.layers.map(layer =>
          layer.id === layerId ? { ...layer, groupId: undefined } : layer
        )
      }));
      
      console.log(`➖ Removed layer ${layerId} from group`);
    },
    
    toggleGroupCollapse: (id: string) => {
      set(state => ({
        groups: state.groups.map(group =>
          group.id === id ? { ...group, collapsed: !group.collapsed } : group
        )
      }));
      
      console.log(`📁 Toggled group ${id} collapse`);
    },
    
    // Effects (simplified for now)
    addEffect: (layerId: string, effect: LayerEffect) => {
      set(state => ({
        layers: state.layers.map(layer =>
          layer.id === layerId
            ? { ...layer, effects: [...layer.effects, effect], updatedAt: new Date() }
            : layer
        )
      }));
      
      console.log(`✨ Added effect ${effect.type} to layer ${layerId}`);
    },
    
    removeEffect: (layerId: string, effectId: string) => {
      set(state => ({
        layers: state.layers.map(layer =>
          layer.id === layerId
            ? { ...layer, effects: layer.effects.filter(effect => effect.id !== effectId), updatedAt: new Date() }
            : layer
        )
      }));
      
      console.log(`🗑️ Removed effect ${effectId} from layer ${layerId}`);
    },
    
    updateEffect: (layerId: string, effectId: string, properties: Record<string, any>) => {
      set(state => ({
        layers: state.layers.map(layer =>
          layer.id === layerId
            ? {
                ...layer,
                effects: layer.effects.map(effect =>
                  effect.id === effectId ? { ...effect, properties: { ...effect.properties, ...properties } } : effect
                ),
                updatedAt: new Date()
              }
            : layer
        )
      }));
      
      console.log(`🔧 Updated effect ${effectId} on layer ${layerId}`);
    },
    
    // Masks
    addMask: (layerId: string, mask: LayerMask) => {
      set(state => ({
        layers: state.layers.map(layer =>
          layer.id === layerId
            ? { ...layer, mask, updatedAt: new Date() }
            : layer
        )
      }));
      
      console.log(`🎭 Added mask to layer ${layerId}`);
    },
    
    removeMask: (layerId: string) => {
      set(state => ({
        layers: state.layers.map(layer =>
          layer.id === layerId
            ? { ...layer, mask: undefined, updatedAt: new Date() }
            : layer
        )
      }));
      
      console.log(`🗑️ Removed mask from layer ${layerId}`);
    },
    
    updateMask: (layerId: string, maskData: Partial<LayerMask>) => {
      set(state => ({
        layers: state.layers.map(layer =>
          layer.id === layerId && layer.mask
            ? { 
                ...layer, 
                mask: { ...layer.mask, ...maskData }, 
                updatedAt: new Date() 
              }
            : layer
        )
      }));
      
      console.log(`🔧 Updated mask on layer ${layerId}`);
    },
    
    toggleMaskEnabled: (layerId: string) => {
      set(state => ({
        layers: state.layers.map(layer =>
          layer.id === layerId && layer.mask
            ? { 
                ...layer, 
                mask: { ...layer.mask, enabled: !layer.mask.enabled }, 
                updatedAt: new Date() 
              }
            : layer
        )
      }));
      
      console.log(`🎭 Toggled mask enabled on layer ${layerId}`);
    },
    
    toggleMaskInverted: (layerId: string) => {
      set(state => ({
        layers: state.layers.map(layer =>
          layer.id === layerId && layer.mask
            ? { 
                ...layer, 
                mask: { ...layer.mask, inverted: !layer.mask.inverted }, 
                updatedAt: new Date() 
              }
            : layer
        )
      }));
      
      console.log(`🎭 Toggled mask inverted on layer ${layerId}`);
    },
    
    // Auto-grouping
    enableAutoGrouping: () => {
      set({ autoGrouping: true });
      console.log(`🤖 Enabled auto-grouping`);
    },
    
    disableAutoGrouping: () => {
      set({ autoGrouping: false });
      console.log(`🤖 Disabled auto-grouping`);
    },
    
    autoGroupLayers: () => {
      const state = get();
      if (!state.autoGrouping) return;
      
      // Group layers by type
      const layersByType = state.layers.reduce((acc, layer) => {
        if (!acc[layer.type]) acc[layer.type] = [];
        acc[layer.type].push(layer);
        return acc;
      }, {} as Record<LayerType, AdvancedLayer[]>);
      
      // Create groups for types with multiple layers
      Object.entries(layersByType).forEach(([type, layers]) => {
        if (layers.length > 1) {
          const groupId = get().createGroup(`${type.charAt(0).toUpperCase() + type.slice(1)} Group`);
          layers.forEach(layer => {
            get().addToGroup(layer.id, groupId);
          });
        }
      });
      
      console.log(`🤖 Auto-grouped layers by type`);
    },
    
    // Smart naming
    generateLayerName: (type: LayerType) => {
      const state = get();
      return generateLayerName(type, state.layers);
    },
    
    // Content management
    updateLayerContent: (id: string, content: Partial<LayerContent>) => {
      set(state => ({
        layers: state.layers.map(layer =>
          layer.id === id
            ? { ...layer, content: { ...layer.content, ...content }, updatedAt: new Date() }
            : layer
        )
      }));
      
      console.log(`📝 Updated layer ${id} content`);
    },
    
    getLayerBounds: (id: string) => {
      const state = get();
      const layer = state.layers.find(layer => layer.id === id);
      return layer?.bounds || null;
    },
    
    // Brush strokes
    addBrushStroke: (layerId: string, stroke: BrushStroke) => {
      set(state => ({
        layers: state.layers.map(layer =>
          layer.id === layerId
            ? {
                ...layer,
                content: {
                  ...layer.content,
                  brushStrokes: [...(layer.content.brushStrokes || []), stroke]
                },
                updatedAt: new Date()
              }
            : layer
        )
      }));
      
      console.log(`🖌️ Added brush stroke to layer ${layerId}`);
    },
    
    removeBrushStroke: (layerId: string, strokeId: string) => {
      set(state => ({
        layers: state.layers.map(layer =>
          layer.id === layerId
            ? {
                ...layer,
                content: {
                  ...layer.content,
                  brushStrokes: (layer.content.brushStrokes || []).filter(stroke => stroke.id !== strokeId)
                },
                updatedAt: new Date()
              }
            : layer
        )
      }));
      
      console.log(`🗑️ Removed brush stroke ${strokeId} from layer ${layerId}`);
    },
    
    getBrushStrokes: (layerId: string) => {
      const state = get();
      const layer = state.layers.find(layer => layer.id === layerId);
      return layer?.content.brushStrokes || [];
    },
    
    // Text elements
    addTextElement: (layerId: string, textElement: TextElement) => {
      set(state => ({
        layers: state.layers.map(layer =>
          layer.id === layerId
            ? {
                ...layer,
                content: {
                  ...layer.content,
                  textElements: [...(layer.content.textElements || []), textElement]
                },
                updatedAt: new Date()
              }
            : layer
        )
      }));
      
      console.log(`📝 Added text element to layer ${layerId}`);
    },
    
    removeTextElement: (layerId: string, textElementId: string) => {
      set(state => ({
        layers: state.layers.map(layer =>
          layer.id === layerId
            ? {
                ...layer,
                content: {
                  ...layer.content,
                  textElements: (layer.content.textElements || []).filter(text => text.id !== textElementId)
                },
                updatedAt: new Date()
              }
            : layer
        )
      }));
      
      console.log(`🗑️ Removed text element ${textElementId} from layer ${layerId}`);
    },
    
    getTextElements: (layerId: string) => {
      const state = get();
      const layer = state.layers.find(layer => layer.id === layerId);
      return layer?.content.textElements || [];
    },
    
    // Layer composition
    composeLayers: () => {
      const state = get();
      const composedCanvas = document.createElement('canvas');
      composedCanvas.width = 1536;
      composedCanvas.height = 1536;
      const ctx = composedCanvas.getContext('2d');
      
      if (!ctx) return null;
      
      // Sort layers by order
      const sortedLayers = [...state.layers].sort((a, b) => a.order - b.order);
      
      for (const layer of sortedLayers) {
        if (!layer.visible) continue;
        
        ctx.save();
        ctx.globalAlpha = layer.opacity;
        ctx.globalCompositeOperation = layer.blendMode === 'normal' ? 'source-over' : 'source-over';
        
        // Draw layer canvas if it exists
        if (layer.content.canvas) {
          ctx.drawImage(layer.content.canvas, 0, 0);
        }
        
        // Draw brush strokes
        const brushStrokes = layer.content.brushStrokes || [];
        for (const stroke of brushStrokes) {
          if (stroke.points && stroke.points.length > 0) {
            ctx.save();
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.size;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.globalAlpha = stroke.opacity;
            
            ctx.beginPath();
            for (let i = 0; i < stroke.points.length; i++) {
              const point = stroke.points[i];
              if (i === 0) {
                ctx.moveTo(point.x, point.y);
              } else {
                ctx.lineTo(point.x, point.y);
              }
            }
            ctx.stroke();
            ctx.restore();
          }
        }
        
        // Draw text elements
        const textElements = layer.content.textElements || [];
        for (const textEl of textElements) {
          ctx.save();
          ctx.font = `${textEl.fontSize}px ${textEl.fontFamily}`;
          ctx.fillStyle = textEl.color;
          ctx.globalAlpha = textEl.opacity;
          ctx.fillText(textEl.text, textEl.x, textEl.y);
          ctx.restore();
        }
        
        ctx.restore();
      }
      
      console.log('🎨 Composed layers using V2 system');
      return composedCanvas;
    }
  }))
);

// Export types
export type { AdvancedLayer, LayerGroup, LayerEffect, LayerMask, LayerTransform, LayerContent, BrushStroke, TextElement };
