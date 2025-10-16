/**
 * 🎯 Universal Selection System Types
 * 
 * Comprehensive selection system that works with all element types:
 * - Text, Images, Shapes, Brush Strokes, Embroidery, Puff Print
 * - Multi-selection support
 * - Transform operations
 * - Context menu actions
 * - Keyboard shortcuts
 */

export type SelectableElementType = 
  | 'text'
  | 'image' 
  | 'shape'
  | 'vector'
  | 'brush_stroke'
  | 'embroidery'
  | 'puff_print'
  | 'group';

export type SelectionMode = 'replace' | 'add' | 'subtract' | 'intersect' | 'toggle';

export type TransformType = 'move' | 'scale' | 'rotate' | 'skew' | null;

export interface UniversalElement {
  id: string;
  type: SelectableElementType;
  bounds: BoundingBox;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  groupId?: string;
  data: any; // Element-specific data
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  centerX?: number;
  centerY?: number;
}

export interface SelectionState {
  // Core selection
  selectedElements: Map<string, UniversalElement>;
  selectedIds: Set<string>;
  activeElementId: string | null;
  
  // Selection modes
  selectionMode: SelectionMode;
  multiSelectEnabled: boolean;
  
  // Transform state
  isTransforming: boolean;
  transformType: TransformType;
  transformOrigin: { x: number; y: number } | null;
  transformStart: { x: number; y: number } | null;
  
  // Selection box (marquee selection)
  selectionBox: BoundingBox | null;
  isSelecting: boolean;
  selectionBoxStart: { x: number; y: number } | null;
  
  // Hover state
  hoveredElementId: string | null;
  
  // Group management
  groups: Map<string, string[]>; // groupId -> elementIds[]
}

export interface SelectionTransform {
  translateX: number;
  translateY: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  skewX: number;
  skewY: number;
}

export interface SelectionAction {
  id: string;
  label: string;
  icon: string;
  shortcut?: string;
  enabled: boolean;
  action: () => void;
}

export interface ContextMenuAction extends SelectionAction {
  category: 'edit' | 'transform' | 'arrange' | 'group' | 'delete';
  separator?: boolean;
}

// Element-specific interfaces
export interface TextElementData {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  bold: boolean;
  italic: boolean;
  align: CanvasTextAlign;
  baseline: CanvasTextBaseline;
  stroke?: string;
  strokeWidth?: number;
}

export interface ImageElementData {
  src: string;
  width: number;
  height: number;
  opacity: number;
  blendMode: GlobalCompositeOperation;
}

export interface ShapeElementData {
  shapeType: 'line' | 'rect' | 'ellipse' | 'polygon';
  points: { x: number; y: number }[];
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
}

export interface VectorElementData {
  path: string; // SVG path data
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
}

export interface BrushStrokeData {
  points: { x: number; y: number; pressure?: number }[];
  color: string;
  size: number;
  opacity: number;
  hardness: number;
  blendMode: GlobalCompositeOperation;
}

export interface EmbroideryData {
  stitches: { x: number; y: number; type: string }[];
  threadColor: string;
  threadThickness: number;
  stitchType: string;
  density: number;
}

export interface PuffPrintData {
  height: number;
  softness: number;
  color: string;
  opacity: number;
  geometry: { x: number; y: number; height: number }[];
}

// Selection utilities
export interface SelectionUtilities {
  // Bounds calculation
  calculateBounds: (elements: UniversalElement[]) => BoundingBox;
  getElementBounds: (element: UniversalElement) => BoundingBox;
  
  // Hit testing
  hitTest: (element: UniversalElement, x: number, y: number) => boolean;
  hitTestMultiple: (elements: UniversalElement[], x: number, y: number) => UniversalElement[];
  
  // Transform utilities
  applyTransform: (element: UniversalElement, transform: SelectionTransform) => UniversalElement;
  calculateTransformOrigin: (elements: UniversalElement[]) => { x: number; y: number };
  
  // Group utilities
  createGroup: (elementIds: string[]) => string;
  ungroup: (groupId: string) => string[];
  getGroupElements: (groupId: string) => UniversalElement[];
}

// Selection events
export interface SelectionEvents {
  onSelectionChanged: (selectedIds: string[]) => void;
  onElementSelected: (element: UniversalElement) => void;
  onElementDeselected: (elementId: string) => void;
  onTransformStart: (elements: UniversalElement[], transformType: TransformType) => void;
  onTransformUpdate: (elements: UniversalElement[], transform: SelectionTransform) => void;
  onTransformEnd: (elements: UniversalElement[], transform: SelectionTransform) => void;
  onContextMenu: (elements: UniversalElement[], x: number, y: number) => void;
}
