// Phase 1: Advanced layer system types (scaffold)

export type Transform = {
  x: number; y: number; scaleX: number; scaleY: number; rotation: number; skewX?: number; skewY?: number; opacity: number;
};

export type StrokeStyle = { enabled: boolean; color: string; width: number; align: 'inside'|'center'|'outside'; join: 'miter'|'round'|'bevel'; cap: 'butt'|'round'|'square' };
export type ShadowStyle = { enabled: boolean; color: string; blur: number; dx: number; dy: number; spread?: number };
export type GlowStyle = { enabled: boolean; color: string; size: number; opacity: number; inner?: boolean };

export type LayerStyles = {
  stroke?: StrokeStyle;
  innerShadow?: ShadowStyle;
  dropShadow?: ShadowStyle;
  glow?: GlowStyle;
  blendMode: GlobalCompositeOperation;
};

export type MaskRef = { layerId: string; mode: 'clip'|'layerMask' };

export type BaseLayer = {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  transform: Transform;
  styles: LayerStyles;
  mask?: MaskRef;
  children?: string[];
  type: 'group'|'vector'|'image'|'brush'|'text'|'smart';
  isSmartObject?: boolean;
  sourceRef?: string;
};

export type VectorAnchor = { x: number; y: number; in?: { x: number; y: number } | null; out?: { x: number; y: number } | null };
export type VectorPath = { anchors: VectorAnchor[]; closed: boolean };

export type VectorShape = {
  kind: 'path'|'rect'|'ellipse'|'polygon'|'star';
  fill: { type: 'solid'|'gradient'|'pattern'; color?: string; gradient?: any; pattern?: string };
  path?: VectorPath;
  // rect/ellipse fast params can be added here later
};

export type VectorLayer = BaseLayer & { type: 'vector'; shapes: VectorShape[]; booleanOp?: 'union'|'subtract'|'intersect'|'exclude' };
export type ImageLayer = BaseLayer & { type: 'image'; imageId: string; naturalSize: { w: number; h: number }; rasterized?: boolean };
export type BrushLayer = BaseLayer & { type: 'brush'; backingCanvasId: string; pressure?: boolean };
export type TextLayer = BaseLayer & { type: 'text'; text: string; font: string; size: number; color: string; onPath?: string };
export type GroupLayer = BaseLayer & { type: 'group'; children: string[] };

export type Layer = VectorLayer | ImageLayer | BrushLayer | TextLayer | GroupLayer;

export type Project = {
  layerOrder: string[];
  layers: Record<string, Layer>;
  assets: {
    images: Record<string, string>; // url or key for IndexedDB; resolve elsewhere
    canvases: Record<string, string>; // keys to retrieve canvases from cache
    smart: Record<string, { snapshot?: string; }>; // future: nested projects
  };
  selection: { ids: string[] };
  version: number;
};

export const createDefaultTransform = (): Transform => ({ x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1 });
export const createDefaultStyles = (): LayerStyles => ({ blendMode: 'source-over' });
