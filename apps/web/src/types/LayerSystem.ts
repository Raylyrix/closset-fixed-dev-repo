/**
 * Industry-Standard Layer System Types
 * Comprehensive layer management for professional design applications
 */

export type LayerType = 
  | 'raster'      // Paint/brush layers
  | 'vector'       // Vector graphics
  | 'text'         // Text layers
  | 'group'        // Layer groups
  | 'smart'        // Smart objects
  | 'adjustment'   // Adjustment layers
  | 'effect'       // Effect layers
  | 'mask'         // Mask layers
  | 'puff'         // Puff print layers
  | 'embroidery';  // Embroidery layers

export type BlendMode = 
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'soft-light'
  | 'hard-light'
  | 'color-dodge'
  | 'color-burn'
  | 'darken'
  | 'lighten'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

export type LayerMask = {
  id: string;
  enabled: boolean;
  inverted: boolean;
  canvas: HTMLCanvasElement;
};

export type LayerEffect = {
  id: string;
  type: 'drop-shadow' | 'inner-shadow' | 'outer-glow' | 'inner-glow' | 'bevel' | 'emboss' | 'stroke';
  enabled: boolean;
  settings: Record<string, any>;
};

export type LayerTransform = {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  skewX: number;
  skewY: number;
};

export interface BaseLayer {
  // Core Properties
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: BlendMode;
  
  // Ordering & Grouping
  order: number;
  parentGroupId?: string;
  
  // Content
  canvas?: HTMLCanvasElement;
  content?: any; // Type-specific content
  
  // Visual Properties
  transform: LayerTransform;
  mask?: LayerMask;
  effects: LayerEffect[];
  
  // Metadata
  createdAt: Date;
  modifiedAt: Date;
  createdBy?: string;
  modifiedBy?: string;
  
  // Tool-specific properties
  toolSettings?: Record<string, any>;
}

export interface RasterLayer extends BaseLayer {
  type: 'raster';
  canvas: HTMLCanvasElement;
  brushHistory: Array<{
    id: string;
    timestamp: Date;
    operation: 'stroke' | 'fill' | 'erase';
    data: any;
  }>;
}

export interface VectorLayer extends BaseLayer {
  type: 'vector';
  paths: Array<{
    id: string;
    points: Array<{ x: number; y: number; type: 'corner' | 'smooth' }>;
    closed: boolean;
    strokeColor: string;
    fillColor: string;
    strokeWidth: number;
  }>;
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  color: string;
  alignment: 'left' | 'center' | 'right';
  lineHeight: number;
}

export interface GroupLayer extends BaseLayer {
  type: 'group';
  children: string[]; // Layer IDs
  expanded: boolean;
}

export interface PuffLayer extends BaseLayer {
  type: 'puff';
  canvas: HTMLCanvasElement;
  displacementCanvas: HTMLCanvasElement;
  height: number;
  curvature: number;
  shape: 'round' | 'square' | 'diamond';
  color: string;
}

export interface EmbroideryLayer extends BaseLayer {
  type: 'embroidery';
  stitches: Array<{
    id: string;
    type: 'satin' | 'fill' | 'outline' | 'cross-stitch';
    points: Array<{ x: number; y: number }>;
    threadColor: string;
    thickness: number;
  }>;
}

export type Layer = 
  | RasterLayer 
  | VectorLayer 
  | TextLayer 
  | GroupLayer 
  | PuffLayer 
  | EmbroideryLayer;

export interface LayerGroup {
  id: string;
  name: string;
  layers: string[];
  expanded: boolean;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: BlendMode;
}

export interface LayerHistory {
  id: string;
  timestamp: Date;
  action: 'create' | 'delete' | 'modify' | 'reorder' | 'group' | 'ungroup';
  layerId: string;
  data: any;
}

export interface LayerSystemState {
  // Core layer management
  layers: Map<string, Layer>;
  layerOrder: string[];
  activeLayerId: string | null;
  selectedLayerIds: string[];
  
  // Groups
  groups: Map<string, LayerGroup>;
  
  // History
  history: LayerHistory[];
  historyIndex: number;
  
  // Composition
  composedCanvas: HTMLCanvasElement | null;
  needsComposition: boolean;
  
  // UI State
  expandedGroups: Set<string>;
  layerPanelWidth: number;
  showLayerEffects: boolean;
}

export interface LayerSystemActions {
  // Layer CRUD
  createLayer: (type: LayerType, name?: string, options?: Partial<Layer>) => string;
  deleteLayer: (id: string) => void;
  duplicateLayer: (id: string) => string;
  renameLayer: (id: string, name: string) => void;
  
  // Layer properties
  setLayerVisible: (id: string, visible: boolean) => void;
  setLayerLocked: (id: string, locked: boolean) => void;
  setLayerOpacity: (id: string, opacity: number) => void;
  setLayerBlendMode: (id: string, blendMode: BlendMode) => void;
  setActiveLayer: (id: string) => void;
  
  // Layer ordering
  moveLayer: (id: string, newIndex: number) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  
  // Groups
  createGroup: (name: string, layerIds: string[]) => string;
  addToGroup: (groupId: string, layerId: string) => void;
  removeFromGroup: (layerId: string) => void;
  deleteGroup: (groupId: string) => void;
  toggleGroupExpanded: (groupId: string) => void;
  
  // Effects
  addEffect: (layerId: string, effect: LayerEffect) => void;
  removeEffect: (layerId: string, effectId: string) => void;
  updateEffect: (layerId: string, effectId: string, settings: any) => void;
  
  // History
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Composition
  composeLayers: () => void;
  invalidateComposition: () => void;
  
  // Selection
  selectLayer: (id: string) => void;
  selectMultipleLayers: (ids: string[]) => void;
  clearSelection: () => void;
  
  // Bulk operations
  mergeLayers: (layerIds: string[]) => Layer;
  flattenLayers: () => void;
  rasterizeLayer: (id: string) => void;
}




