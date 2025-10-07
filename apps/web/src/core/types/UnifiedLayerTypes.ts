/**
 * Unified Layer System Types
 * 
 * This file defines the core types for the new unified layer system
 * that will replace the fragmented layer systems currently in use.
 */

export type LayerType = 'raster' | 'vector' | 'text' | 'image' | 'group';
export type ToolType = 'brush' | 'puffPrint' | 'embroidery' | 'vector' | 'eraser' | 'fill' | 'general';

export interface BrushStroke {
  id: string;
  layerId: string;
  points: Array<{x: number, y: number}>;
  color: string;
  size: number;
  opacity: number;
  hardness: number;
  flow: number;
  spacing: number;
  shape: 'round' | 'square' | 'diamond' | 'triangle' | 'airbrush' | 'calligraphy';
  blendMode: GlobalCompositeOperation;
  timestamp: number;
}

export interface EmbroideryStitch {
  id: string;
  layerId: string;
  type: string;
  color: string;
  threadType: string;
  thickness: number;
  opacity: number;
  points: Array<{x: number, y: number}>;
  timestamp: number;
}

export interface PuffData {
  id: string;
  layerId: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
  height: number;
  curvature: number;
  timestamp: number;
}

export interface VectorPath {
  id: string;
  layerId: string;
  points: Array<{
    u: number;
    v: number;
    inHandle?: {u: number, v: number};
    outHandle?: {u: number, v: number};
  }>;
  closed: boolean;
  timestamp: number;
}

export interface ToolData {
  brushStrokes?: BrushStroke[];
  embroideryStitches?: EmbroideryStitch[];
  puffData?: PuffData[];
  vectorPaths?: VectorPath[];
}

export interface UnifiedLayer {
  // Core Properties
  id: string;
  name: string;
  type: LayerType;
  toolType?: ToolType;
  
  // Canvas Management
  canvas: HTMLCanvasElement;
  isDirty: boolean;
  
  // Visual Properties
  visible: boolean;
  opacity: number;
  blendMode: GlobalCompositeOperation;
  order: number;
  
  // Tool-specific data
  toolData: ToolData;
  
  // Metadata
  createdAt: Date;
  modifiedAt: Date;
  
  // Optional properties
  locked?: boolean;
  mask?: HTMLCanvasElement | null;
  effects?: LayerEffect[];
}

export interface LayerEffect {
  id: string;
  type: string;
  settings: Record<string, any>;
  enabled: boolean;
}

export interface LayerGroup {
  id: string;
  name: string;
  layerIds: string[];
  visible: boolean;
  opacity: number;
  blendMode: GlobalCompositeOperation;
  expanded: boolean;
  order: number;
}

export interface UnifiedLayerState {
  // Core layer management
  layers: Map<string, UnifiedLayer>;
  layerOrder: string[];
  activeLayerId: string | null;
  selectedLayerIds: string[];
  
  // Groups
  groups: Map<string, LayerGroup>;
  
  // Canvas management
  composedCanvas: HTMLCanvasElement | null;
  displacementCanvas: HTMLCanvasElement | null;
  normalCanvas: HTMLCanvasElement | null;
  needsComposition: boolean;
  
  // UI State
  expandedGroups: Set<string>;
  layerPanelWidth: number;
  showLayerEffects: boolean;
}

export interface UnifiedLayerActions {
  // Layer CRUD
  createLayer: (type: LayerType, name?: string, toolType?: ToolType) => UnifiedLayer;
  deleteLayer: (id: string) => void;
  duplicateLayer: (id: string) => UnifiedLayer;
  renameLayer: (id: string, name: string) => void;
  
  // Layer properties
  setLayerVisible: (id: string, visible: boolean) => void;
  setLayerOpacity: (id: string, opacity: number) => void;
  setLayerBlendMode: (id: string, blendMode: GlobalCompositeOperation) => void;
  setActiveLayer: (id: string) => void;
  
  // Layer ordering
  moveLayer: (id: string, newIndex: number) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  
  // Tool integration
  getOrCreateToolLayer: (toolType: ToolType) => UnifiedLayer;
  getTargetLayer: (toolType: ToolType) => UnifiedLayer | null;
  cleanupToolData: (layerId: string) => void;
  
  // Composition
  composeLayers: () => HTMLCanvasElement;
  updateDisplacementMaps: () => void;
  invalidateComposition: () => void;
  
  // Selection
  selectLayer: (id: string) => void;
  selectMultipleLayers: (ids: string[]) => void;
  clearSelection: () => void;
  
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
}

export interface LayerMigrationData {
  // Data from App.tsx layers
  appLayers: Array<{
    id: string;
    name: string;
    visible: boolean;
    canvas: HTMLCanvasElement;
    history: ImageData[];
    future: ImageData[];
  }>;
  
  // Data from LayerSystem.ts
  layerSystemLayers: Map<string, any>;
  
  // Data from domainStores
  domainLayers: Array<any>;
  
  // Current state
  activeLayerId: string | null;
  layerOrder: string[];
}

