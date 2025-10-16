// Comprehensive TypeScript interfaces for ClOSSET
// This provides type safety across all components and systems

import * as THREE from 'three';

// ============================================================================
// CORE GEOMETRY & RENDERING TYPES
// ============================================================================

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Bounds {
  min: Vector3D;
  max: Vector3D;
}

export interface Transform {
  position: Vector3D;
  rotation: Vector3D;
  scale: Vector3D;
}

export interface UVCoordinate {
  x: number;
  y: number;
}

// ============================================================================
// BRUSH & PAINTING SYSTEM TYPES
// ============================================================================

export interface BrushPoint {
  x: number;
  y: number;
  pressure: number;
  tiltX: number;
  tiltY: number;
  velocity: number;
  timestamp: number;
  distance: number;
  uv?: UVCoordinate;
  worldPosition?: THREE.Vector3; // Use THREE.Vector3 instead of Vector3D
}

export interface BrushDynamics {
  sizePressure: boolean;
  opacityPressure: boolean;
  anglePressure: boolean;
  spacingPressure: boolean;
  velocitySize: boolean;
  velocityOpacity: boolean;
}

export interface BrushTexture {
  enabled: boolean;
  pattern: string | null;
  scale: number;
  rotation: number;
  opacity: number;
  blendMode: GlobalCompositeOperation;
}

export interface BrushSettings {
  // Basic Properties
  size: number;
  opacity: number;
  hardness: number;
  flow: number;
  spacing: number;
  angle: number;
  roundness: number;
  color: string; // Add missing color property

  // Advanced Properties
  dynamics: BrushDynamics;
  texture: BrushTexture;
  shape: 'round' | 'square' | 'diamond' | 'triangle' | 'airbrush' | 'calligraphy' | 'spray' | 'texture' | 'watercolor' | 'oil' | 'charcoal' | 'pencil' | 'marker' | 'highlighter' | 'chalk' | 'ink' | 'pastel' | 'acrylic' | 'gouache' | 'stencil' | 'stamp' | 'blur' | 'smudge';
  blendMode: GlobalCompositeOperation;

  // Puff-specific (for 3D)
  height?: number;
  curvature?: number;
  pattern?: string;
  patternScale?: number;
  patternRotation?: number;
  symmetry?: {
    enabled: boolean;
    axis: 'x' | 'y' | 'z';
    count: number;
  };
}

export interface BrushStroke {
  id: string;
  points: BrushPoint[];
  settings: BrushSettings;
  timestamp: number;
  layerId?: string;
  tool: 'brush' | 'eraser' | 'puff';
}

// ============================================================================
// UV MAPPING & 3D INTEGRATION TYPES
// ============================================================================

export interface UVPoint {
  worldPosition: THREE.Vector3;
  uv: THREE.Vector2;
  normal?: THREE.Vector3;
  tangent?: THREE.Vector3;
  barycentric?: THREE.Vector3;
}

// ============================================================================
// POINTER & INTERACTION TYPES
// ============================================================================

export interface PointerEvent extends Event {
  type: 'down' | 'move' | 'up' | 'enter' | 'leave';
  position: Vector2D;
  uv?: UVCoordinate;
  worldPosition?: Vector3D;
  pressure: number;
  tiltX: number;
  tiltY: number;
  buttons: number;
  button: number; // Add this property
  target: EventTarget | null; // Add this property
  clientX: number; // Add this property
  clientY: number; // Add this property
  modifiers: {
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
    meta: boolean;
  };
  timestamp: number;
}

// ============================================================================
// MODEL & GEOMETRY TYPES
// ============================================================================

export interface MeshGeometry {
  vertices: THREE.Vector3[];
  normals: THREE.Vector3[];
  uvs: THREE.Vector2[];
  indices: number[];
  bounds: Bounds;
  tangents?: THREE.Vector3[];
  colors?: THREE.Color[];
}

export interface ModelData {
  url: string | null;
  scene: THREE.Object3D | null;
  meshes: THREE.Mesh[];
  geometry: MeshGeometry;
  uvMap: UVPoint[];
  bounds: Bounds;
  scale: number;
  position: Vector3D;
  rotation: Vector3D;
  type: 'gltf' | 'obj' | 'fbx' | 'dae' | 'ply';
  loaded: boolean;
  error?: string;
}

// ============================================================================
// TEXTURE & MATERIAL TYPES
// ============================================================================

export interface TextureData {
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
  width: number;
  height: number;
  format: THREE.PixelFormat;
  type: THREE.TextureDataType;
  needsUpdate: boolean;
}

export interface MaterialData {
  baseMaterial: THREE.Material | THREE.Material[];
  puffMaterial?: THREE.MeshStandardMaterial;
  displacementMap?: TextureData;
  normalMap?: TextureData;
  roughnessMap?: TextureData;
  metallicMap?: TextureData;
  aoMap?: TextureData;
  emissiveMap?: TextureData;
  opacity?: number;
  transparent?: boolean;
  side: THREE.Side;
}

// ============================================================================
// TOOL SYSTEM TYPES
// ============================================================================

export type ToolType =
  | 'select'
  | 'brush'
  | 'eraser'
  | 'text'
  | 'vector'
  | 'move'
  | 'rotate'
  | 'scale'
  | 'zoom'
  | 'pan'
  | 'eyedropper'
  | 'fill'
  | 'gradient'
  | 'shape'
  | 'shapes'
  | 'puff'
  | 'embroidery'
  | 'clone'
  | 'blur'
  | 'sharpen'
  | 'smudge';

export interface ToolState {
  activeTool: ToolType;
  previousTool: ToolType;
  cursor: string;
  options: Record<string, any>;
  constraints?: {
    axis?: 'x' | 'y' | 'z';
    snap?: boolean;
    gridSize?: number;
  };
}
