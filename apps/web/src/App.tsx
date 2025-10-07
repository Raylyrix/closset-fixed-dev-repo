import { useEffect, useState, useRef, useMemo } from 'react';
import { create } from 'zustand';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, GizmoHelper, GizmoViewport, Grid, Html } from '@react-three/drei';
import * as THREE from 'three';
import localforage from 'localforage';
import LZString from 'lz-string';
import { aiPerformanceManager } from './utils/AIPerformanceManager';
import { canvasPool } from './utils/CanvasPool';
import { performanceOptimizer } from './utils/PerformanceOptimizer';
import ShirtRefactored from './components/ShirtRefactored'; // Use new refactored component
import { RightPanel } from './components/RightPanelNew.tsx'; // Use new UI component
// PERFORMANCE FIX: Removed Brush3DIntegration import to prevent conflicts with existing painting system
import { LeftPanel } from './components/LeftPanel';
import { Section } from './components/Section';
import { CustomSelect } from './components/CustomSelect';
import { ModelManager } from './components/ModelManager';
import { BackgroundManager } from './components/BackgroundManager';
import { BackgroundScene } from './components/BackgroundScene';
import { CursorOverlay } from './components/CursorOverlay';
import { MainLayout } from './components/MainLayout.tsx';
import { ResponsiveLayout } from './components/ResponsiveLayout';
import { ToolRouter } from './components/ToolRouter';
import { TransformGizmo } from './components/TransformGizmo';
import { EmbroideryStitch, EmbroideryPattern } from './services/embroideryService';
import { handleRenderingError, handleCanvasError, ErrorCategory, ErrorSeverity } from './utils/CentralizedErrorHandler';
import { vectorStore } from './vector/vectorState';
import { puffVectorEngine, PuffVectorEngineState } from './vector/PuffVectorEngine';
import { renderStitchType } from './utils/stitchRendering';
import VectorEditorOverlay from './vector/VectorEditorOverlay';
import { AdvancedPuffPrintTool } from './components/AdvancedPuffPrintTool';
import { AdvancedPuffPrintManager } from './components/AdvancedPuffPrintManager';
import { AdvancedPuff3DSystem } from './utils/AdvancedPuff3DSystem';
import { AdvancedUVSystem } from './utils/AdvancedUVSystem';
import { AdvancedPuffGenerator } from './utils/AdvancedPuffGenerator';
import { AdvancedPuffErrorHandler } from './utils/AdvancedPuffErrorHandler';
import './styles/AdvancedPuffPrint.css';
import { Project as AdvProject, Layer as AdvLayer, createDefaultStyles, createDefaultTransform } from './types/layers';
import { history } from './utils/history';

// Import new domain stores for state management
import { useModelStore, useToolStore, useLayerStore, useProjectStore } from './stores/domainStores';

const cloneProject = (proj: AdvProject | null): AdvProject | null => {
  if (!proj) return null;
  return JSON.parse(JSON.stringify(proj)) as AdvProject;
};

type Tool =
  | 'brush' | 'eraser' | 'fill' | 'picker' | 'smudge' | 'blur' | 'select' | 'transform' | 'move' | 'text'
  | 'decals' | 'layers' | 'puffPrint' | 'patternMaker' | 'advancedSelection' | 'vectorTools' | 'aiAssistant'
  | 'printExport' | 'cloudSync' | 'layerEffects' | 'colorGrading' | 'animation' | 'templates' | 'batch'
  | 'advancedBrush' | 'meshDeformation' | 'proceduralGenerator' | '3dPainting' | 'smartFill'
  | 'line' | 'rect' | 'ellipse' | 'gradient' | 'moveText' | 'selectText' | 'undo' | 'redo' | 'embroidery' | 'vector' | 'shapes';

type Layer = { id: string; name: string; visible: boolean; canvas: HTMLCanvasElement; history: ImageData[]; future: ImageData[]; lockTransparent?: boolean; mask?: HTMLCanvasElement | null; order: number; displacementCanvas?: HTMLCanvasElement };

// Vector path types (UV-native)
type VectorHandle = { u: number; v: number } | null;
type VectorAnchor = {
  u: number;
  v: number;
  inHandle: VectorHandle;
  outHandle: VectorHandle;
  world?: [number, number, number];
  curveControl?: boolean; // if true, this anchor acts as a control point to curve its neighboring segment(s)
};
type VectorPath = {
  id: string;
  points: VectorAnchor[];
  closed: boolean;
};

type Decal = { id: string; name: string; image: ImageBitmap; width: number; height: number; u: number; v: number; scale: number; rotation: number; opacity: number; blendMode: GlobalCompositeOperation; layerId?: string };

type TextElement = { 
  id: string; 
  text: string; 
  x: number; 
  y: number; 
  u: number; 
  v: number; 
  fontSize: number; 
  fontFamily: string; 
  bold: boolean; 
  italic: boolean; 
  underline: boolean;
  strikethrough: boolean;
  align: CanvasTextAlign; 
  color: string; 
  opacity: number; 
  rotation: number; 
  letterSpacing: number;
  lineHeight: number;
  shadow: { blur: number; offsetX: number; offsetY: number; color: string };
  gradient?: { type: 'linear' | 'radial'; colors: string[]; stops: number[] };
  outline?: { width: number; color: string };
  glow?: { blur: number; color: string };
  textCase: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  layerId?: string; 
  
  // Additional text properties
  textShadow?: boolean;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowColor?: string;
  gradientStartColor?: string;
  gradientEndColor?: string;
  gradientDirection?: string;
  gradientMidColor?: string;
  outlineWidth?: number;
  outlineColor?: string;
  glowIntensity?: number;
  glowColor?: string;
  uppercase?: boolean;
  lowercase?: boolean;
  capitalize?: boolean;
};

type SelectionTransform = {
  x: number; y: number; cx: number; cy: number; 
  width: number; height: number;
  rotation: number; scale: number;
  skewX: number; skewY: number;
};

type CheckpointMeta = { id: string; name: string; timestamp: number; size: number; createdAt: number; sizeBytes: number };

// Undo/Redo System Types
interface AppStateSnapshot {
  id: string;
  timestamp: number;
  action: string;
  state: Partial<AppState>;
  layerData?: Array<{
    id: string;
    name: string;
    visible: boolean;
    opacity: number;
    canvasData?: string; // Base64 encoded canvas data
  }>;
  puffCanvasData?: string; // Base64 encoded puff canvas data
  composedCanvasData?: string; // Base64 encoded composed canvas data
}

interface AppState {
  // Undo/Redo System
  history: AppStateSnapshot[];
  historyIndex: number;
  maxHistorySize: number;
  saveState: (action?: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
  
  // Tools
  activeTool: Tool;
  setTool: (tool: Tool) => void;
  vectorMode: boolean;
  setVectorMode: (enabled: boolean) => void;
  showAnchorPoints: boolean;
  setShowAnchorPoints: (enabled: boolean) => void;
  showPuffVectorPrompt: boolean;
  puffVectorPromptMessage: string;
  setPuffVectorPrompt: (visible: boolean, message?: string) => void;
  
  // Brush settings
  brushColor: string;
  brushSize: number;
  brushOpacity: number;
  brushHardness: number;
  brushSpacing: number;
  brushShape: 'round' | 'square' | 'diamond' | 'triangle' | 'airbrush' | 'calligraphy';
  brushRotation: number;
  brushDynamics: boolean;
  brushSymmetry: boolean;
  symmetryAngle: number;
  blendMode: GlobalCompositeOperation;
  cursorAngle: number;
  brushFlow: number;
  brushSmoothing: number;
  usePressureSize: boolean;
  usePressureOpacity: boolean;
  strokeColor: string;
  strokeWidth: number;
  strokeEnabled: boolean;
  
  // Brush stroke tracking for layer management
  brushStrokes: Array<{
    id: string;
    layerId: string;
    points: Array<{x: number, y: number}>;
    color: string;
    size: number;
    opacity: number;
    timestamp: number;
  }>;
  
  // Symmetry settings
  symmetryX: boolean;
  symmetryY: boolean;
  symmetryZ: boolean;
  
  // Fill settings
  fillTolerance: number;
  fillGrow: number;
  fillAntiAlias: boolean;
  fillContiguous: boolean;
  
  // Fabric/Model settings
  roughness: number;
  metalness: number;
  fabric: string;
  fabricPreset: string;
  modelUrl: string | null;
  modelPosition: [number, number, number];
  modelRotation: [number, number, number];
  modelScale: number;
  modelChoice: 'tshirt' | 'sphere' | 'custom';
  modelType: string | null;
  modelScene: THREE.Group | null;
  modelBoundsHeight: number;
  modelMinDimension: number;
  
  // Imported images state
  importedImages: Array<{
    id: string;
    name: string;
    dataUrl: string;
    x: number;
    y: number;
    width: number;
    height: number;
    visible: boolean;
    opacity: number;
  }>;
  selectedImageId: string | null;
  
  // Shape settings
  shapeMode: 'fill' | 'stroke' | 'both';
  shapeStrokeWidth: number;
  shapeType: string;
  shapeSize: number;
  shapeOpacity: number;
  shapeColor: string;
  shapeRotation: number;
  shapePositionX: number;
  shapePositionY: number;
  shapeElements: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    opacity: number;
    color: string;
    rotation: number;
    positionX: number;
    positionY: number;
    gradient: any;
  }>;
  clearShapes: () => void;
  
  // Puff Print settings
  puffBrushSize: number;
  puffBrushOpacity: number;
  puffHeight: number;
  puffSoftness: number;
  puffOpacity: number;
  puffCurvature: number;
  puffShape: 'cube' | 'sphere' | 'cylinder' | 'pipe';
  puffColor: string;
  puffCanvas: HTMLCanvasElement | null;
  displacementCanvas: HTMLCanvasElement | null;
  normalCanvas: HTMLCanvasElement | null;
  
  // Embroidery settings
  embroideryStitches: EmbroideryStitch[];
  embroideryPattern: EmbroideryPattern | null;
  embroideryThreadType: 'cotton' | 'polyester' | 'silk' | 'metallic' | 'glow';
  embroideryThickness: number;
  embroideryOpacity: number;
  embroideryColor: string;
  embroideryStitchType: 'satin' | 'fill' | 'outline' | 'cross-stitch' | 'cross' | 'chain' | 'backstitch' | 
    'running' | 'running-stitch' | 'zigzag' | 'split' | 'fill_tatami' | 'seed' | 'french-knot' | 'french_knot' | 
    'couching' | 'blanket' | 'herringbone' | 'feather' | 'long_short_satin' | 'bullion';
  embroideryPatternDescription: string;
  embroideryAIEnabled: boolean;
  embroideryThreadColor: string;
  embroideryThreadThickness: number;
  embroiderySpacing: number;
  embroideryDensity: number;
  embroideryCanvas: HTMLCanvasElement | null;
  embroideryAngle: number;
  embroideryScale: number;
  currentEmbroideryPath: {x: number, y: number}[]; // UV coordinates (0-1 range)
  lastEmbroideryPoint: {x: number, y: number} | null; // Track last point for continuous drawing
  
  // Vector tool settings (using existing VectorPath system)
  vectorStrokeColor: string;
  vectorStrokeWidth: number;
  vectorFillColor: string;
  vectorFill: boolean;
  setVectorStrokeColor: (color: string) => void;
  setVectorStrokeWidth: (width: number) => void;
  setVectorFillColor: (color: string) => void;
  setVectorFill: (fill: boolean) => void;
  
  // Vector editing state
  selectedAnchor: { pathId: string; anchorIndex: number } | null;
  vectorEditMode: 'pen' | 'select' | 'move' | 'curve';
  setSelectedAnchor: (anchor: { pathId: string; anchorIndex: number } | null) => void;
  setVectorEditMode: (mode: 'pen' | 'select' | 'move' | 'curve') => void;
  moveAnchor: (pathId: string, anchorIndex: number, newU: number, newV: number) => void;
  addCurveHandle: (pathId: string, anchorIndex: number, handleType: 'in' | 'out', u: number, v: number) => void;
  
  // Layers
  layers: Layer[];
  activeLayerId: string | null;
  composedCanvas: HTMLCanvasElement | null;
  composedVersion: number;
  baseTexture: HTMLImageElement | null;
  
  // Decals
  decals: Decal[];
  activeDecalId: string | null;
  
  // Text
  textSize: number;
  textFont: string;
  textColor: string;
  textBold: boolean;
  textItalic: boolean;
  textAlign: CanvasTextAlign;
  lastText: string;
  
  // Selection & Transform
  layerTransform: SelectionTransform | null;
  
  // Background
  backgroundScene: 'studio' | 'sky' | 'city' | 'forest' | 'space' | 'gradient';
  backgroundIntensity: number;
  backgroundRotation: number;
  
  // Text elements
  textElements: TextElement[];
  activeTextId: string | null;
  hoveredTextId: string | null;
  
  // Shape elements
  activeShapeId: string | null;
  hoveredShapeId: string | null;
  
  // Panel states
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  modelManagerOpen: boolean;
  backgroundManagerOpen: boolean;
  
  // Universal Grid & Scale settings
  showGrid: boolean;
  gridSize: number;
  gridColor: string;
  gridOpacity: number;
  showRulers: boolean;
  rulerUnits: 'px' | 'mm' | 'in';
  scale: number;
  showGuides: boolean;
  guideColor: string;
  snapToGrid: boolean;
  snapDistance: number;
  showMeasurements: boolean;
  measurementUnits: 'px' | 'mm' | 'in';
  
  // Controls
  controlsEnabled: boolean;
  controlsTarget: [number, number, number];
  controlsDistance: number;
  clickingOnModel: boolean;

  // Vector paths (UV-native)
  vectorPaths: VectorPath[];
  activePathId: string | null;
  puffVectorHistory: PuffVectorEngineState[];
  puffVectorFuture: PuffVectorEngineState[];

  
  // Methods
  setActiveTool: (tool: Tool) => void;
  setBrushColor: (color: string) => void;
  setBrushSize: (size: number) => void;
  setBrushOpacity: (opacity: number) => void;
  setBrushHardness: (hardness: number) => void;
  setBrushSpacing: (spacing: number) => void;
  setBrushShape: (shape: 'round' | 'square' | 'diamond' | 'triangle') => void;
  setBrushRotation: (rotation: number) => void;
  setBrushDynamics: (dynamics: boolean) => void;
  setBrushSymmetry: (symmetry: boolean) => void;
  setSymmetryX: (symmetry: boolean) => void;
  setSymmetryY: (symmetry: boolean) => void;
  setSymmetryZ: (symmetry: boolean) => void;
  setSymmetryAngle: (angle: number) => void;
  setBlendMode: (mode: GlobalCompositeOperation) => void;
  setCursorAngle: (angle: number) => void;
  setFillTolerance: (tolerance: number) => void;
  setFillGrow: (grow: number) => void;
  setFillAntiAlias: (antiAlias: boolean) => void;
  setFillContiguous: (contiguous: boolean) => void;
  setStrokeColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setStrokeEnabled: (enabled: boolean) => void;
  setRoughness: (roughness: number) => void;
  setMetalness: (metalness: number) => void;
  setFabric: (fabric: string) => void;
  setModelUrl: (url: string | null) => void;
  setModelPosition: (position: [number, number, number]) => void;
  setModelRotation: (rotation: [number, number, number]) => void;
  setModelScale: (scale: number) => void;
  setActiveLayerId: (id: string | null) => void;
  setActiveDecalId: (id: string | null) => void;
  setTextSize: (size: number) => void;
  setTextFont: (font: string) => void;
  setTextColor: (color: string) => void;
  setTextBold: (bold: boolean) => void;
  setTextItalic: (italic: boolean) => void;
  setTextAlign: (align: CanvasTextAlign) => void;
  setLastText: (text: string) => void;
  setBackgroundScene: (scene: 'studio' | 'sky' | 'city' | 'forest' | 'space' | 'gradient') => void;
  setBackgroundIntensity: (intensity: number) => void;
  setBackgroundRotation: (rotation: number) => void;
  setActiveTextId: (id: string | null) => void;
  setActiveShapeId: (id: string | null) => void;
  setLeftPanelOpen: (open: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
  setModelManagerOpen: (open: boolean) => void;
  openModelManager: () => void;
  closeModelManager: () => void;
  setControlsEnabled: (enabled: boolean) => void;
  setControlsTarget: (target: [number, number, number]) => void;
  setControlsDistance: (distance: number) => void;
  setClickingOnModel: (clicking: boolean) => void;
  // Vector methods
  startVectorPath: () => string;
  insertVectorAnchorAt: (pathId: string, insertIndex: number, uv: { u: number; v: number }) => void;
  addVectorAnchor: (uv: { u: number; v: number }) => void;
  moveVectorAnchor: (uv: { u: number; v: number }) => void;
  setAnchorProps: (pathId: string, anchorIndex: number, patch: Partial<VectorAnchor>) => void;
  // Multi-select support
  selectedAnchors?: Array<{ pathId: string; anchorIndex: number }>;
  setSelectedAnchors: (sels: Array<{ pathId: string; anchorIndex: number }>) => void;
  addSelectedAnchor: (sel: { pathId: string; anchorIndex: number }) => void;
  removeSelectedAnchor: (sel: { pathId: string; anchorIndex: number }) => void;
  clearSelectedAnchors: () => void;
  deleteSelectedAnchors: () => void;
  moveSelectedAnchorsBy: (du: number, dv: number) => void;
  setAnchorHandle: (which: 'in' | 'out', uv: { u: number; v: number }) => void;
  toggleActivePathClosed: () => void;
  setAnchorWorld: (world: [number, number, number]) => void;
  finishVectorPath: () => void;
  cancelVectorPath: () => void;
  clearVectorPaths: () => void;
  recordPuffHistory: (snapshot?: PuffVectorEngineState) => void;
  restorePuffHistoryBackward: () => boolean;
  restorePuffHistoryForward: () => boolean;
  clearPuffHistory: () => void;
  
  // Grid & Scale setters
  setShowGrid: (show: boolean) => void;
  setGridSize: (size: number) => void;
  setGridColor: (color: string) => void;
  setGridOpacity: (opacity: number) => void;
  setShowRulers: (show: boolean) => void;
  setRulerUnits: (units: 'px' | 'mm' | 'in') => void;
  setScale: (scale: number) => void;
  setShowGuides: (show: boolean) => void;
  setGuideColor: (color: string) => void;
  setSnapToGrid: (snap: boolean) => void;
  setSnapDistance: (distance: number) => void;
  setShowMeasurements: (show: boolean) => void;
  setMeasurementUnits: (units: 'px' | 'mm' | 'in') => void;
  
  // Puff Print setters
  setPuffBrushSize: (size: number) => void;
  setPuffBrushOpacity: (opacity: number) => void;
  setPuffHeight: (height: number) => void;
  setPuffSoftness: (softness: number) => void;
  setPuffOpacity: (opacity: number) => void;
  setPuffCurvature: (curvature: number) => void;
  setPuffShape: (shape: 'cube' | 'sphere' | 'cylinder' | 'pipe') => void;
  setPuffColor: (color: string) => void;
  
  // Embroidery setters
  setEmbroideryStitches: (stitches: EmbroideryStitch[]) => void;
  setEmbroideryPattern: (pattern: EmbroideryPattern | null) => void;
  setEmbroideryThreadType: (type: 'cotton' | 'polyester' | 'silk' | 'metallic' | 'glow') => void;
  setEmbroideryThickness: (thickness: number) => void;
  setEmbroideryOpacity: (opacity: number) => void;
  setEmbroideryColor: (color: string) => void;
  setEmbroideryStitchType: (type: 'satin' | 'fill' | 'outline' | 'cross-stitch' | 'cross' | 'chain' | 'backstitch' | 
    'running' | 'running-stitch' | 'zigzag' | 'split' | 'fill_tatami' | 'seed' | 'french-knot' | 'french_knot' | 
    'couching' | 'blanket' | 'herringbone' | 'feather' | 'long_short_satin' | 'bullion') => void;
  setEmbroideryPatternDescription: (description: string) => void;
  setEmbroideryAIEnabled: (enabled: boolean) => void;
  setEmbroideryThreadColor: (color: string) => void;
  setEmbroideryThreadThickness: (thickness: number) => void;
  setEmbroiderySpacing: (spacing: number) => void;
  setEmbroideryDensity: (density: number) => void;
  setEmbroideryAngle: (angle: number) => void;
  setEmbroideryScale: (scale: number) => void;
  setCurrentEmbroideryPath: (path: {x: number, y: number}[]) => void;
  
  // Additional missing methods
  selectTextElement: (id: string | null) => void;
  removeTextElement: (id: string) => void;
  setModelChoice: (choice: 'tshirt' | 'sphere' | 'custom') => void;
  setModelType: (type: string | null) => void;
  setModelBoundsHeight: (height: number) => void;
  setModelMinDimension: (dimension: number) => void;
  setFrame: (target: [number, number, number], distance: number) => void;
  resetModelTransform: () => void;
  setLastHitUV: (uv: { u: number; v: number }) => void;
  setHoveredTextId: (id: string | null) => void;
  openBackgroundManager: () => void;
  closeBackgroundManager: () => void;
  snapshot: () => void;
  selectLayerForTransform: (layerId: string) => void;
  updateLayerTransform: (patch: Partial<SelectionTransform>) => void;
  applyLayerTransform: () => void;
  cancelLayerTransform: () => void;
  addDecal: (image: ImageBitmap, name?: string) => string;
  updateDecal: (id: string, patch: Partial<Decal>) => void;
  deleteDecal: (id: string) => void;
  addTextElement: (text: string, uv: { u: number; v: number }, layerId?: string) => string;
  updateTextElement: (id: string, patch: Partial<TextElement>) => void;
  deleteTextElement: (id: string) => void;
  addShapeElement: (shape: any) => string;
  updateShapeElement: (id: string, patch: any) => void;
  deleteShapeElement: (id: string) => void;
  duplicateShapeElement: (id: string) => string | null;
  addLayer?: (name?: string) => string;
  deleteLayer?: (id: string) => void;
  reorderLayers?: (from: number, to: number) => void;
  mergeDown?: (id: string) => void;
  selectActiveLayerContent?: () => void;
  saveCheckpoint: (name?: string) => Promise<CheckpointMeta>;
  loadCheckpoint: (id: string) => Promise<void>;
  listCheckpoints: () => Promise<CheckpointMeta[]>;
  deleteCheckpoint: (id: string) => Promise<void>;
  initCanvases: (w: number, h: number) => void;
  getActiveLayer: () => Layer | null;
  getOrCreateActiveLayer: (toolType: string) => Layer | null;
  getLayerNameForTool: (toolType: string) => string;
  createToolLayer: (toolType: string, options?: any) => string;
  toggleLayerVisibility: (layerId: string) => void;
  setLayerOpacity: (layerId: string, opacity: number) => void;
  setLayerBlendMode: (layerId: string, blendMode: string) => void;
  moveLayerUp: (layerId: string) => void;
  moveLayerDown: (layerId: string) => void;
  duplicateLayer: (layerId: string) => string;
  composeLayers: () => void;
  composeDisplacementMaps: () => HTMLCanvasElement | null;
  commit: () => void;
  setBaseTexture: (texture: HTMLImageElement | null) => void;
  generateBaseLayer: () => void;
  addDecalFromFile: (file: File) => Promise<string>;
  forceRerender: () => void;

  // Phase 1: Advanced Layer System (scaffold)
  project: AdvProject | null;
  selectedLayerV2: string | null;
  setProject: (p: AdvProject | null) => void;
  addLayerV2: (layer: AdvLayer, index?: number) => void;
  updateLayerV2: (id: string, patch: Partial<AdvLayer>) => void;
  reorderLayersV2: (from: number, to: number) => void;
  selectLayerV2: (id: string | null) => void;

  // Phase 2: Image layer operations (v2)
  addImageV2: (fileOrUrl: File | string) => Promise<string>;
  replaceImageV2: (layerId: string, fileOrUrl: File | string) => Promise<void>;
  setImagePropsV2: (layerId: string, patch: Partial<{ opacity: number; blendMode: GlobalCompositeOperation; transform: Partial<{ x: number; y: number; scaleX: number; scaleY: number; rotation: number; skewX?: number; skewY?: number; }> }>) => void;
  setClipMaskV2: (layerId: string, maskLayerId: string | null) => void;
  convertToSmartV2: (layerId: string) => void;
  rasterizeV2: (layerId: string) => void;
  
  // Browser caching methods
  saveProjectState: () => Promise<boolean>;
  loadProjectState: () => Promise<boolean>;
  clearProjectState: () => Promise<boolean>;
  
  // Imported image management methods
  addImportedImage: (image: any) => void;
  updateImportedImage: (id: string, updates: any) => void;
  removeImportedImage: (id: string) => void;
  
  // Layer management methods
  setLayers: (layers: Layer[]) => void;
  setComposedCanvas: (canvas: HTMLCanvasElement | null) => void;
}

export const useApp = create<AppState>((set, get) => ({
  // Undo/Redo System - Default state
  history: [],
  historyIndex: -1,
  maxHistorySize: 50,
  
  // Undo/Redo System - Methods
  saveState: (action = 'Unknown Action') => {
    const state = get();
    console.log('💾 SaveState called with action:', action);
    const timestamp = Date.now();
    const snapshotId = `snapshot_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create snapshot of current state
    const snapshot: AppStateSnapshot = {
      id: snapshotId,
      timestamp,
      action,
      state: {
        // Tool settings
        activeTool: state.activeTool,
        brushColor: state.brushColor,
        brushSize: state.brushSize,
        brushOpacity: state.brushOpacity,
        brushHardness: state.brushHardness,
        brushSpacing: state.brushSpacing,
        brushShape: state.brushShape,
        brushRotation: state.brushRotation,
        brushDynamics: state.brushDynamics,
        brushFlow: state.brushFlow,
        blendMode: state.blendMode,
        cursorAngle: state.cursorAngle,
        usePressureSize: state.usePressureSize,
        usePressureOpacity: state.usePressureOpacity,
        
        // Symmetry settings
        symmetryX: state.symmetryX,
        symmetryY: state.symmetryY,
        symmetryZ: state.symmetryZ,
        
        // Fill settings
        fillTolerance: state.fillTolerance,
        fillGrow: state.fillGrow,
        fillAntiAlias: state.fillAntiAlias,
        fillContiguous: state.fillContiguous,
        
        // Puff settings
        puffBrushSize: state.puffBrushSize,
        puffBrushOpacity: state.puffBrushOpacity,
        puffHeight: state.puffHeight,
        puffSoftness: state.puffSoftness,
        puffOpacity: state.puffOpacity,
        puffCurvature: state.puffCurvature,
        puffShape: state.puffShape,
        puffColor: state.puffColor,
        
        // Embroidery settings
        embroideryStitchType: state.embroideryStitchType,
        embroiderySpacing: state.embroiderySpacing,
        embroideryDensity: state.embroideryDensity,
        embroideryThreadColor: state.embroideryThreadColor,
        embroideryThreadThickness: state.embroideryThreadThickness,
        
        // Layer settings
        activeLayerId: state.activeLayerId,
        
        // Text settings
        textSize: state.textSize,
        textFont: state.textFont,
        textColor: state.textColor,
        textBold: state.textBold,
        textItalic: state.textItalic,
        textAlign: state.textAlign,
        activeTextId: state.activeTextId,
        
        // Panel states
        leftPanelOpen: state.leftPanelOpen,
        rightPanelOpen: state.rightPanelOpen,
        modelManagerOpen: state.modelManagerOpen,
        backgroundManagerOpen: state.backgroundManagerOpen,
        
        // Background settings
        backgroundScene: state.backgroundScene,
        backgroundIntensity: state.backgroundIntensity,
        backgroundRotation: state.backgroundRotation,
        
        // Model settings
        modelPosition: state.modelPosition,
        modelRotation: state.modelRotation,
        modelScale: state.modelScale,
        
        // Material settings
        roughness: state.roughness,
        metalness: state.metalness,
        fabric: state.fabric,
      },
      layerData: state.layers.map(layer => ({
        id: layer.id,
        name: layer.name,
        visible: layer.visible,
        opacity: 1, // Default opacity since Layer type doesn't have opacity property
        canvasData: layer.canvas ? layer.canvas.toDataURL() : undefined
      })),
      puffCanvasData: state.puffCanvas ? state.puffCanvas.toDataURL() : undefined,
      composedCanvasData: state.composedCanvas ? state.composedCanvas.toDataURL() : undefined
    };
    
    // Add to history
    const newHistory = [...state.history.slice(0, state.historyIndex + 1), snapshot];
    const trimmedHistory = newHistory.slice(-state.maxHistorySize);
    
    set({
      history: trimmedHistory,
      historyIndex: trimmedHistory.length - 1
    });
    
    console.log(`💾 State saved: ${action} (History: ${trimmedHistory.length}/${state.maxHistorySize})`);
  },
  
  undo: () => {
    const state = get();
    console.log('🔄 Undo called - History length:', state.history.length, 'Current index:', state.historyIndex);
    
    if (state.historyIndex <= 0) {
      console.log('❌ Cannot undo - no history available');
      return;
    }
    
    const targetIndex = state.historyIndex - 1;
    const snapshot = state.history[targetIndex];
    console.log('🔄 Undo target snapshot:', snapshot ? snapshot.action : 'none');
    
    if (snapshot) {
      // Restore state
      set({
        ...state,
        ...snapshot.state,
        historyIndex: targetIndex
      });
      
      // Restore layer canvases
      if (snapshot.layerData) {
        const restoredLayers = state.layers.map(layer => {
          const layerSnapshot = snapshot.layerData!.find(l => l.id === layer.id);
          if (layerSnapshot && layerSnapshot.canvasData) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx?.drawImage(img, 0, 0);
            };
            img.src = layerSnapshot.canvasData;
            return { ...layer, canvas };
          }
          return layer;
        });
        
        set({ layers: restoredLayers });
      }
      
      // Restore puff canvas
      if (snapshot.puffCanvasData && state.puffCanvas) {
        const img = new Image();
        img.onload = () => {
          const ctx = state.puffCanvas!.getContext('2d');
          ctx?.clearRect(0, 0, state.puffCanvas!.width, state.puffCanvas!.height);
          ctx?.drawImage(img, 0, 0);
        };
        img.src = snapshot.puffCanvasData;
      }
      
      // Restore composed canvas
      if (snapshot.composedCanvasData && state.composedCanvas) {
        const img = new Image();
        img.onload = () => {
          const ctx = state.composedCanvas!.getContext('2d');
          ctx?.clearRect(0, 0, state.composedCanvas!.width, state.composedCanvas!.height);
          ctx?.drawImage(img, 0, 0);
        };
        img.src = snapshot.composedCanvasData;
      }
      
      console.log(`↩️ Undo: ${snapshot.action}`);
      
      // Force comprehensive restoration after undo
      setTimeout(() => {
        const currentState = get();
        
        // Force composition update
        currentState.composeLayers();
        console.log('🔄 Forced composition update after undo');
        
        // Force displacement map updates for puff print effects
        if (currentState.puffCanvas) {
          // Trigger displacement map recreation
          const event = new CustomEvent('updateDisplacementMaps', {
            detail: { source: 'undo-restoration' }
          });
          window.dispatchEvent(event);
          console.log('🔄 Triggered displacement map update after undo');
        }
        
        // Force embroidery path updates if needed
        if (currentState.currentEmbroideryPath && currentState.currentEmbroideryPath.length > 0) {
          const embroideryEvent = new CustomEvent('updateEmbroideryPaths', {
            detail: { source: 'undo-restoration' }
          });
          window.dispatchEvent(embroideryEvent);
          console.log('🔄 Triggered embroidery path update after undo');
        }
        
        // Force texture updates on the 3D model
        const textureEvent = new CustomEvent('forceTextureUpdate', {
          detail: { source: 'undo-restoration' }
        });
        window.dispatchEvent(textureEvent);
        console.log('🔄 Triggered forced texture update after undo');
        
      }, 100);
    }
  },
  
  redo: () => {
    const state = get();
    if (state.historyIndex >= state.history.length - 1) return;
    
    const targetIndex = state.historyIndex + 1;
    const snapshot = state.history[targetIndex];
    
    if (snapshot) {
      // Restore state
      set({
        ...state,
        ...snapshot.state,
        historyIndex: targetIndex
      });
      
      // Restore layer canvases
      if (snapshot.layerData) {
        const restoredLayers = state.layers.map(layer => {
          const layerSnapshot = snapshot.layerData!.find(l => l.id === layer.id);
          if (layerSnapshot && layerSnapshot.canvasData) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx?.drawImage(img, 0, 0);
            };
            img.src = layerSnapshot.canvasData;
            return { ...layer, canvas };
          }
          return layer;
        });
        
        set({ layers: restoredLayers });
      }
      
      // Restore puff canvas
      if (snapshot.puffCanvasData && state.puffCanvas) {
        const img = new Image();
        img.onload = () => {
          const ctx = state.puffCanvas!.getContext('2d');
          ctx?.clearRect(0, 0, state.puffCanvas!.width, state.puffCanvas!.height);
          ctx?.drawImage(img, 0, 0);
        };
        img.src = snapshot.puffCanvasData;
      }
      
      // Restore composed canvas
      if (snapshot.composedCanvasData && state.composedCanvas) {
        const img = new Image();
        img.onload = () => {
          const ctx = state.composedCanvas!.getContext('2d');
          ctx?.clearRect(0, 0, state.composedCanvas!.width, state.composedCanvas!.height);
          ctx?.drawImage(img, 0, 0);
        };
        img.src = snapshot.composedCanvasData;
      }
      
      console.log(`↪️ Redo: ${snapshot.action}`);
      
      // Force comprehensive restoration after redo
      setTimeout(() => {
        const currentState = get();
        
        // Force composition update
        currentState.composeLayers();
        console.log('🔄 Forced composition update after redo');
        
        // Force displacement map updates for puff print effects
        if (currentState.puffCanvas) {
          // Trigger displacement map recreation
          const event = new CustomEvent('updateDisplacementMaps', {
            detail: { source: 'redo-restoration' }
          });
          window.dispatchEvent(event);
          console.log('🔄 Triggered displacement map update after redo');
        }
        
        // Force embroidery path updates if needed
        if (currentState.currentEmbroideryPath && currentState.currentEmbroideryPath.length > 0) {
          const embroideryEvent = new CustomEvent('updateEmbroideryPaths', {
            detail: { source: 'redo-restoration' }
          });
          window.dispatchEvent(embroideryEvent);
          console.log('🔄 Triggered embroidery path update after redo');
        }
        
        // Force texture updates on the 3D model
        const textureEvent = new CustomEvent('forceTextureUpdate', {
          detail: { source: 'redo-restoration' }
        });
        window.dispatchEvent(textureEvent);
        console.log('🔄 Triggered forced texture update after redo');
        
      }, 100);
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
  
  clearHistory: () => {
    set({
      history: [],
      historyIndex: -1
    });
    console.log('🗑️ History cleared');
  },
  
  // Default state
  activeTool: 'brush',
  setTool: (tool: Tool) => {
    // Allow all tools to work with vector mode
    const currentTool = get().activeTool;
    set({ activeTool: tool });
    
    // Save state for undo/redo when switching tools
    if (currentTool !== tool) {
      get().saveState(`Switch to ${tool} tool`);
    }
  },
  vectorMode: false,
  setVectorMode: (enabled: boolean) => {
    // Allow vector mode with all tools including puff print and embroidery
    set({ vectorMode: enabled });
  },
  showAnchorPoints: false,
  setShowAnchorPoints: (enabled: boolean) => set({ showAnchorPoints: enabled }),
  showPuffVectorPrompt: false,
  puffVectorPromptMessage: 'Vector paths on puff tools COMING SOON..',
  setPuffVectorPrompt: (visible: boolean, message?: string) => {
    set({
      showPuffVectorPrompt: visible,
      puffVectorPromptMessage: message ?? get().puffVectorPromptMessage
    });
  },
  brushColor: '#ff3366',
  brushSize: 50,
  brushOpacity: 1,
  brushHardness: 1,
  brushSpacing: 0.05,
  brushShape: 'round',
  brushRotation: 0,
  brushDynamics: false,
  brushSymmetry: false,
  symmetryAngle: 0,
  blendMode: 'source-over',
  cursorAngle: 0,
  brushFlow: 1,
  brushSmoothing: 0.5,
  usePressureSize: false,
  usePressureOpacity: false,
  strokeColor: '#000000',
  strokeWidth: 2,
  strokeEnabled: false,
  
  // Brush stroke tracking
  brushStrokes: [],
  symmetryX: false,
  symmetryY: false,
  symmetryZ: false,
  fillTolerance: 32,
  fillGrow: 0,
  fillAntiAlias: true,
  fillContiguous: true,
  roughness: 0.8,
  metalness: 0,
  fabric: 'cotton',
  fabricPreset: 'cotton',
  modelUrl: '/models/shirt.glb',
  modelPosition: [0, 0, 0],
  modelRotation: [0, 0, 0],
  modelScale: 1,
  modelChoice: 'tshirt',
  modelType: 'glb',
  modelScene: null,
  modelBoundsHeight: 0,
  modelMinDimension: 0,
  
  // Imported images initial state
  importedImages: [],
  selectedImageId: null,
  shapeMode: 'fill',
  shapeStrokeWidth: 2,
  shapeType: 'rectangle',
  shapeSize: 50,
  shapeOpacity: 1,
  shapeColor: '#ff69b4',
  shapeRotation: 0,
  shapePositionX: 50,
  shapePositionY: 50,
  
  // Puff Print defaults
  puffBrushSize: 20,
  puffBrushOpacity: 1.0,
  puffHeight: 2.0,
  puffSoftness: 0.5,
  puffOpacity: 0.8,
  puffCurvature: 0.8,
  puffShape: 'sphere',
  puffColor: '#ff69b4',
  puffCanvas: null,
  displacementCanvas: null,
  normalCanvas: null,
  
  // Embroidery defaults
  embroideryStitches: [],
  embroideryPattern: null,
  embroideryThreadType: 'cotton',
  embroideryThickness: 3,
  embroideryOpacity: 1.0,
  embroideryColor: '#ff69b4',
  embroideryStitchType: 'satin',
  embroideryPatternDescription: '',
  embroideryAIEnabled: true,
  embroideryThreadColor: '#ff69b4',
  embroideryThreadThickness: 0.5,
  embroiderySpacing: 2.0,
  embroideryDensity: 1.0,
  embroideryCanvas: null,
  embroideryAngle: 0,
  embroideryScale: 1.0,
  currentEmbroideryPath: [],
  lastEmbroideryPoint: null,
  
  // Vector tool initial state
  vectorStrokeColor: '#000000',
  vectorStrokeWidth: 2,
  vectorFillColor: '#ffffff',
  vectorFill: false,
  
  layers: [],
  activeLayerId: null,
  composedCanvas: null,
  composedVersion: 0,
  baseTexture: null,
  decals: [],
  activeDecalId: null,
  textSize: 48,
  textFont: 'Arial',
  textColor: '#FFFFFF',
  textBold: false,
  textItalic: false,
  textAlign: 'left',
  lastText: '',
  layerTransform: null,
  backgroundScene: 'studio',
  backgroundIntensity: 1,
  backgroundRotation: 0,
  textElements: [],
  activeTextId: null,
  hoveredTextId: null,
  shapeElements: [],
  activeShapeId: null,
  hoveredShapeId: null,
  leftPanelOpen: true,
  rightPanelOpen: true,
  modelManagerOpen: false,
  backgroundManagerOpen: false,
  
  // Universal Grid & Scale defaults
  showGrid: true,
  gridSize: 20,
  gridColor: '#333333',
  gridOpacity: 0.3,
  showRulers: true,
  rulerUnits: 'px',
  scale: 1.0,
  showGuides: false,
  guideColor: '#FF0000',
  snapToGrid: true,
  snapDistance: 5,
  showMeasurements: false,
  measurementUnits: 'px',
  
  controlsEnabled: true,
  controlsTarget: [0, 0, 0],
  controlsDistance: 2,
  clickingOnModel: false,

  // Phase 1: Advanced Layer System defaults
  project: null,
  selectedLayerV2: null,

  // Vector paths state
  vectorPaths: [],
  activePathId: null,
  selectedAnchor: null,
  vectorEditMode: 'pen',
  puffVectorHistory: [puffVectorEngine.getStateSnapshot()],
  puffVectorFuture: [],


  // Methods
  setActiveTool: (tool) => set({ activeTool: tool }),
  setBrushColor: (color) => set({ brushColor: color }),
  setBrushSize: (size) => set({ brushSize: size }),
  setBrushOpacity: (opacity) => set({ brushOpacity: opacity }),
  setBrushHardness: (hardness) => set({ brushHardness: hardness }),
  setBrushSpacing: (spacing) => set({ brushSpacing: spacing }),
  setBrushShape: (shape) => set({ brushShape: shape }),
  setBrushRotation: (rotation) => set({ brushRotation: rotation }),
  setBrushDynamics: (dynamics) => set({ brushDynamics: dynamics }),
  setBrushSymmetry: (symmetry) => set({ brushSymmetry: symmetry }),
  setSymmetryX: (symmetry) => set({ symmetryX: symmetry }),
  setSymmetryY: (symmetry) => set({ symmetryY: symmetry }),
  setSymmetryZ: (symmetry) => set({ symmetryZ: symmetry }),
  setSymmetryAngle: (angle) => set({ symmetryAngle: angle }),
  setBlendMode: (mode) => set({ blendMode: mode }),
  setCursorAngle: (angle) => set({ cursorAngle: angle }),
  setStrokeColor: (color) => set({ strokeColor: color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  setStrokeEnabled: (enabled) => set({ strokeEnabled: enabled }),
  setFillTolerance: (tolerance) => set({ fillTolerance: tolerance }),
  setFillGrow: (grow) => set({ fillGrow: grow }),
  setFillAntiAlias: (antiAlias) => set({ fillAntiAlias: antiAlias }),
  setFillContiguous: (contiguous) => set({ fillContiguous: contiguous }),
  setRoughness: (roughness) => set({ roughness: roughness }),
  setMetalness: (metalness) => set({ metalness: metalness }),
  setFabric: (fabric) => set({ fabric: fabric }),
  setModelUrl: (url) => set({ modelUrl: url }),
  setModelPosition: (position) => set({ modelPosition: position }),
  setModelRotation: (rotation) => set({ modelRotation: rotation }),
  setModelScale: (scale) => set({ modelScale: scale }),
  setActiveLayerId: (id) => set({ activeLayerId: id }),
  setActiveDecalId: (id) => set({ activeDecalId: id }),
  setTextSize: (size) => set({ textSize: size }),
  setTextFont: (font) => set({ textFont: font }),
  setTextColor: (color) => set({ textColor: color }),
  setTextBold: (bold) => set({ textBold: bold }),
  setTextItalic: (italic) => set({ textItalic: italic }),
  setTextAlign: (align) => set({ textAlign: align }),
  setLastText: (text) => set({ lastText: text }),
  setBackgroundScene: (scene) => set({ backgroundScene: scene }),
  setBackgroundIntensity: (intensity) => set({ backgroundIntensity: intensity }),
  setBackgroundRotation: (rotation) => set({ backgroundRotation: rotation }),
  setActiveTextId: (id) => set({ activeTextId: id }),
  setActiveShapeId: (id) => set({ activeShapeId: id }),
  setLeftPanelOpen: (open) => set({ leftPanelOpen: open }),
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
  setModelManagerOpen: (open) => set({ modelManagerOpen: open }),
  openModelManager: () => set({ modelManagerOpen: true }),
  closeModelManager: () => set({ modelManagerOpen: false }),
  setControlsEnabled: (enabled) => set({ controlsEnabled: enabled }),
  setControlsTarget: (target) => set({ controlsTarget: target }),
  setControlsDistance: (distance) => set({ controlsDistance: distance }),
  setClickingOnModel: (clicking: boolean) => set({ clickingOnModel: clicking }),

  // Vector editing setters
  setSelectedAnchor: (anchor) => set({ selectedAnchor: anchor }),
  setVectorEditMode: (mode) => set({ vectorEditMode: mode }),
  moveAnchor: (pathId, anchorIndex, newU, newV) => {
    set(state => ({
      vectorPaths: state.vectorPaths.map(path => 
        path.id === pathId 
          ? {
              ...path,
              points: path.points.map((point, index) => 
                index === anchorIndex 
                  ? { ...point, u: newU, v: newV }
                  : point
              )
            }
          : path
      )
    }));
  },
  addCurveHandle: (pathId, anchorIndex, handleType, u, v) => {
    set(state => ({
      vectorPaths: state.vectorPaths.map(path => 
        path.id === pathId 
          ? {
              ...path,
              points: path.points.map((point, index) => 
                index === anchorIndex 
                  ? {
                      ...point,
                      [handleType === 'in' ? 'inHandle' : 'outHandle']: { u, v }
                    }
                  : point
              )
            }
          : path
      )
    }));
  },

  // Phase 1: Advanced Layer System methods (scaffold)
  setProject: (p) => set({ project: p }),
  addLayerV2: (layer, index) => {
    set(state => {
      const proj: AdvProject = state.project ?? { layerOrder: [], layers: {}, assets: { images: {}, canvases: {}, smart: {} }, selection: { ids: [] }, version: 1 } as AdvProject;
      if (!proj.layers[layer.id]) {
        const order = proj.layerOrder.slice();
        if (typeof index === 'number' && index >= 0 && index <= order.length) order.splice(index, 0, layer.id); else order.push(layer.id);
        const layers = { ...proj.layers, [layer.id]: layer } as any;
        return { project: { ...proj, layers, layerOrder: order } } as any;
      }
      return { project: proj } as any;
    });
  },
  updateLayerV2: (id, patch) => {
    set(state => {
      const proj = state.project; if (!proj || !proj.layers[id]) return {} as any;
      const updated = { ...(proj.layers[id] as any), ...patch } as AdvLayer;
      return { project: { ...proj, layers: { ...proj.layers, [id]: updated } } } as any;
    });
  },
  reorderLayersV2: (from, to) => {
    set(state => {
      const proj = state.project; if (!proj) return {} as any;
      const order = proj.layerOrder.slice();
      const fromIdx = Math.max(0, Math.min(from, order.length - 1));
      const [moved] = order.splice(fromIdx, 1);
      const toIdx = Math.max(0, Math.min(to, order.length));
      order.splice(toIdx, 0, moved);
      return { project: { ...proj, layerOrder: order } } as any;
    });
  },
  selectLayerV2: (id) => set({ selectedLayerV2: id }),

  // Vector methods
  startVectorPath: () => {
    const id = Math.random().toString(36).slice(2);
    set(state => ({ vectorPaths: [...state.vectorPaths, { id, points: [], closed: false }], activePathId: id }));

// Debug helpers (non-production): allow inspecting state from DevTools
try {
  const w: any = window as any;
  if (!w.__appGet) {
    w.__appGet = () => useApp.getState();
    w.__getEmbroideryStitches = () => useApp.getState().embroideryStitches;
    w.__getActiveTool = () => useApp.getState().activeTool;
  }
} catch {}
    return id;
  },
  insertVectorAnchorAt: (pathId: string, insertIndex: number, { u, v }: { u: number; v: number; }) => {
    set(state => ({
      vectorPaths: state.vectorPaths.map(p => {
        if (p.id !== pathId) return p;
        const pts = p.points.slice();
        const idx = Math.min(Math.max(0, insertIndex), pts.length);
        pts.splice(idx, 0, { u, v, inHandle: null, outHandle: null, curveControl: false });
        return { ...p, points: pts };
      })
    }));
    // Update selection to the inserted point and set active path
    set(state => ({ selectedAnchor: { pathId, anchorIndex: insertIndex }, selectedAnchors: [{ pathId, anchorIndex: insertIndex }], activePathId: pathId }));
    get().composeLayers();
  },
  setAnchorProps: (pathId: string, anchorIndex: number, patch: Partial<VectorAnchor>) => {
    set(state => ({
      vectorPaths: state.vectorPaths.map(p => {
        if (p.id !== pathId) return p;
        const pts = p.points.slice();
        if (!pts[anchorIndex]) return p;
        pts[anchorIndex] = { ...pts[anchorIndex], ...patch };
        return { ...p, points: pts };
      })
    }));
    get().composeLayers();
  },
  setAnchorWorld: (world) => {
    const sel = get().selectedAnchor;
    if (!sel) return;
    if (process.env.NODE_ENV !== 'production') console.log('[Vector] setAnchorWorld', { sel, world });
    set(state => ({
      vectorPaths: state.vectorPaths.map(p => {
        if (p.id !== sel.pathId) return p;
        const pts = p.points.slice();
        if (!pts[sel.anchorIndex]) return p;
        pts[sel.anchorIndex] = { ...pts[sel.anchorIndex], world };
        return { ...p, points: pts };
      })
    }));
  },
  setSelectedAnchors: (sels) => set({ selectedAnchors: sels, selectedAnchor: sels[0] ?? null }),
  addSelectedAnchor: (sel) => set(state => {
    const list = state.selectedAnchors || [];
    const exists = list.some(x => x.pathId === sel.pathId && x.anchorIndex === sel.anchorIndex);
    return exists ? {} as any : { selectedAnchors: [...list, sel], selectedAnchor: sel };
  }),
  removeSelectedAnchor: (sel) => set(state => ({
    selectedAnchors: (state.selectedAnchors || []).filter(x => !(x.pathId === sel.pathId && x.anchorIndex === sel.anchorIndex)),
    selectedAnchor: null
  })),
  clearSelectedAnchors: () => set({ selectedAnchors: [], selectedAnchor: null }),
  deleteSelectedAnchors: () => {
    const sels = get().selectedAnchors || (get().selectedAnchor ? [get().selectedAnchor!] : []);
    if (!sels.length) return;
    set(state => ({
      vectorPaths: state.vectorPaths.map(p => {
        const mine = sels.filter(s => s.pathId === p.id).map(s => s.anchorIndex);
        if (!mine.length) return p;
        const keep = p.points.filter((_, idx) => !mine.includes(idx));
        return { ...p, points: keep };
      }),
      selectedAnchors: [],
      selectedAnchor: null
    }));
    get().composeLayers();
  },
  moveSelectedAnchorsBy: (du, dv) => {
    const sels = get().selectedAnchors || (get().selectedAnchor ? [get().selectedAnchor!] : []);
    if (!sels.length) return;
    set(state => ({
      vectorPaths: state.vectorPaths.map(p => {
        const mine = sels.filter(s => s.pathId === p.id).map(s => s.anchorIndex);
        if (!mine.length) return p;
        const pts = p.points.map((pt, idx) => mine.includes(idx) ? { ...pt, u: Math.min(1, Math.max(0, pt.u + du)), v: Math.min(1, Math.max(0, pt.v + dv)) } : pt);
        return { ...p, points: pts };
      })
    }));
    get().composeLayers();
  },
  setAnchorHandle: (which, { u, v }) => {
    const sel = get().selectedAnchor;
    if (!sel) return;
    set(state => ({
      vectorPaths: state.vectorPaths.map(p => {
        if (p.id !== sel.pathId) return p;
        const pts = p.points.slice();
        if (!pts[sel.anchorIndex]) return p;
        const a = { ...pts[sel.anchorIndex] };
        const cu = Math.min(1, Math.max(0, u));
        const cv = Math.min(1, Math.max(0, v));
        if (which === 'in') a.inHandle = { u: cu, v: cv };
        if (which === 'out') a.outHandle = { u: cu, v: cv };
        pts[sel.anchorIndex] = a;
        return { ...p, points: pts };
      })
    }));
    get().composeLayers();
  },
  toggleActivePathClosed: () => {
    const { activePathId } = get();
    if (!activePathId) return;
    if (process.env.NODE_ENV !== 'production') console.log('[Vector] toggleActivePathClosed', activePathId);
    set(state => ({
      vectorPaths: state.vectorPaths.map(p => p.id === activePathId ? { ...p, closed: !p.closed } : p)
    }));
    get().composeLayers();
  },
  addVectorAnchor: ({ u, v }) => {
    let { activePathId, vectorPaths, selectedAnchor } = get();
    // Ensure active path exists
    if (!activePathId) {
      activePathId = get().startVectorPath();
      vectorPaths = get().vectorPaths;
    }
    const targetId = selectedAnchor && selectedAnchor.pathId ? selectedAnchor.pathId : activePathId!;
    if (process.env.NODE_ENV !== 'production') console.log('[Vector] addVectorAnchor', { targetId, uv: { u, v } });
    set(state => ({
      vectorPaths: state.vectorPaths.map(p => {
        if (p.id !== targetId) return p;
        const pts = p.points.slice();
        if (state.selectedAnchor && state.selectedAnchor.pathId === p.id) {
          const insertAt = Math.min(Math.max(0, state.selectedAnchor.anchorIndex + 1), pts.length);
          pts.splice(insertAt, 0, { u, v, inHandle: null, outHandle: null, curveControl: false });
          return { ...p, points: pts };
        } else {
          return { ...p, points: [...pts, { u, v, inHandle: null, outHandle: null, curveControl: false }] };
        }
      }),
    }));
    // Update selection to the newly inserted point
    const pNow = get().vectorPaths.find(p => p.id === targetId)!;
    let newIndex = pNow.points.length - 1;
    if (get().selectedAnchor && get().selectedAnchor!.pathId === targetId) {
      newIndex = Math.min(get().selectedAnchor!.anchorIndex + 1, pNow.points.length - 1);
    }
    set({ selectedAnchor: { pathId: targetId, anchorIndex: newIndex }, selectedAnchors: [{ pathId: targetId, anchorIndex: newIndex }], activePathId: targetId });
    get().composeLayers();
  },
  moveVectorAnchor: ({ u, v }) => {
    const sel = get().selectedAnchor;
    if (!sel) return;
    if (process.env.NODE_ENV !== 'production') console.log('[Vector] moveVectorAnchor', { sel, uv: { u, v } });
    set(state => ({
      vectorPaths: state.vectorPaths.map(p => {
        if (p.id !== sel.pathId) return p;
        const pts = p.points.slice();
        if (!pts[sel.anchorIndex]) return p;
        pts[sel.anchorIndex] = { ...pts[sel.anchorIndex], u, v };
        return { ...p, points: pts };
      })
    }));
    get().composeLayers();
  },
  finishVectorPath: () => {
    const appState: any = get();
    const { activePathId, vectorPaths, composedCanvas, activeTool } = appState;
    if (!activePathId) return;
    const path = vectorPaths.find((p: any) => p.id === activePathId);
    if (process.env.NODE_ENV !== 'production') console.log('[Vector] finishVectorPath', { activeTool, pathPoints: path?.points.length });
    if (!path || path.points.length < 2 || !composedCanvas) {
      set({ activePathId: null, selectedAnchor: null });
      get().composeLayers();
      return;
    }

    // Sample UV path into canvas pixel coords
    const sampled: { x: number; y: number }[] = [];
    const W = composedCanvas.width, H = composedCanvas.height;
    const stepsBase = 24;
    const getPt = (i: number) => path.points[(i + path.points.length) % path.points.length];
    const segCount = path.closed ? path.points.length : path.points.length - 1;
    for (let i = 0; i < segCount; i++) {
      const a = getPt(i);
      const b = getPt(i + 1);
      const hasOut = !!a?.outHandle;
      const hasIn = !!b?.inHandle;
      for (let s = 0; s <= stepsBase; s++) {
        const t = s / stepsBase;
        let u: number, v: number;
        if (hasOut && hasIn) {
          const h1 = a.outHandle!;
          const h2 = b.inHandle!;
          const mt = 1 - t;
          u = mt*mt*mt*a.u + 3*mt*mt*t*h1.u + 3*mt*t*t*h2.u + t*t*t*b.u;
          v = mt*mt*mt*a.v + 3*mt*mt*t*h1.v + 3*mt*t*t*h2.v + t*t*t*b.v;
        } else if (hasOut || hasIn) {
          const h1 = hasOut ? a.outHandle! : { u: a.u, v: a.v };
          const h2 = hasIn ? b.inHandle! : { u: b.u, v: b.v };
          const mt = 1 - t;
          u = mt*mt*mt*a.u + 3*mt*mt*t*h1.u + 3*mt*t*t*h2.u + t*t*t*b.u;
          v = mt*mt*mt*a.v + 3*mt*mt*t*h1.v + 3*mt*t*t*h2.v + t*t*t*b.v;
        } else if (a?.curveControl || b?.curveControl) {
          const p0 = getPt(i - 1);
          const p3 = getPt(i + 2);
          const t2 = t * t, t3 = t2 * t;
          u = 0.5 * ((2 * a.u) + (-p0.u + b.u) * t + (2 * p0.u - 5 * a.u + 4 * b.u - p3.u) * t2 + (-p0.u + 3 * a.u - 3 * b.u + p3.u) * t3);
          v = 0.5 * ((2 * a.v) + (-p0.v + b.v) * t + (2 * p0.v - 5 * a.v + 4 * b.v - p3.v) * t2 + (-p0.v + 3 * a.v - 3 * b.v + p3.v) * t3);
        } else {
          u = a.u + (b.u - a.u) * t;
          v = a.v + (b.v - a.v) * t;
        }
        sampled.push({ x: Math.round(u * W), y: Math.round(v * H) });
      }
    }

    const puffBridge = typeof ((window as any).__applyPuffFromVector) === 'function'
      ? (window as any).__applyPuffFromVector as (pts: Array<{ x: number; y: number }>, opts: { width?: number; opacity?: number; color?: string }) => void
      : undefined;

    const uvPoints = path.points.map((pt: any) => ({
      u: pt.u,
      v: pt.v,
      inHandle: pt.inHandle ? { u: pt.inHandle.u, v: pt.inHandle.v } : null,
      outHandle: pt.outHandle ? { u: pt.outHandle.u, v: pt.outHandle.v } : null,
    }));

    const paintToLayerFallback = () => {
      const layer = typeof appState.getActiveLayer === 'function' ? appState.getActiveLayer() : null;
      if (layer) {
        const ctx = layer.canvas.getContext('2d', { willReadFrequently: true })!;
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = appState.brushOpacity;
        ctx.globalCompositeOperation = appState.blendMode;
        ctx.strokeStyle = appState.brushColor;
        ctx.lineWidth = appState.brushSize;
        ctx.beginPath();
        if (sampled.length) {
          ctx.moveTo(sampled[0].x, sampled[0].y);
          for (let i = 1; i < sampled.length; i++) ctx.lineTo(sampled[i].x, sampled[i].y);
        }
        ctx.stroke();
        ctx.restore();
      }
    };

    if (activeTool === 'embroidery') {
      const stitchType = appState.embroideryStitchType || 'satin';
      const color = appState.embroideryColor || '#ff69b4';
      const thickness = appState.embroideryThickness ?? 2;
      const opacity = appState.embroideryOpacity ?? 1.0;
      const density = appState.embroideryDensity ?? 1.0;
      const stitch = {
        id: `stitch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        type: stitchType,
        color,
        thickness,
        opacity,
        density,
        points: sampled,
        createdFromVector: true
      } as any;
      const prev = appState.embroideryStitches || [];
      set({ embroideryStitches: [...prev, stitch] });
    } else {
      paintToLayerFallback();
    }

    // Clear selection and schedule compose
    set({ activePathId: null, selectedAnchor: null });
    try {
      const raf = requestAnimationFrame(() => { get().composeLayers(); });
      setTimeout(() => {
        get().composeLayers();
        setTimeout(() => get().composeLayers(), 100);
      }, 0);
    } catch {
      get().composeLayers();
    }
  },
  cancelVectorPath: () => {
    const { activePathId } = get();
    if (!activePathId) return;
    set(state => ({ vectorPaths: state.vectorPaths.filter(p => p.id !== activePathId), activePathId: null, selectedAnchor: null }));
    get().composeLayers();
  },
  clearVectorPaths: () => {
    set({ vectorPaths: [], activePathId: null, selectedAnchor: null });
    puffVectorEngine.clear();
    get().clearPuffHistory();
    get().composeLayers();
  },

  recordPuffHistory: (snapshot) => {
    const snap = snapshot || puffVectorEngine.getStateSnapshot();
    set(state => {
      const merged = [...state.puffVectorHistory, snap];
      const limit = 50;
      const trimmed = merged.length > limit ? merged.slice(merged.length - limit) : merged;
      return { puffVectorHistory: trimmed, puffVectorFuture: [] };
    });
  },
  restorePuffHistoryBackward: () => {
    const state = get();
    if (state.puffVectorHistory.length <= 1) return false;
    const history = state.puffVectorHistory.slice(0, state.puffVectorHistory.length - 1);
    const current = state.puffVectorHistory[state.puffVectorHistory.length - 1];
    const previous = history[history.length - 1];
    const future = [current, ...state.puffVectorFuture];
    puffVectorEngine.replaceState(previous);
    try { window.dispatchEvent(new Event('puff-updated')); } catch {}
    set({ puffVectorHistory: history, puffVectorFuture: future });
    return true;
  },
  restorePuffHistoryForward: () => {
    const state = get();
    if (!state.puffVectorFuture.length) return false;
    const [next, ...rest] = state.puffVectorFuture;
    const history = [...state.puffVectorHistory, next];
    puffVectorEngine.replaceState(next);
    try { window.dispatchEvent(new Event('puff-updated')); } catch {}
    set({ puffVectorHistory: history, puffVectorFuture: rest });
    return true;
  },
  clearPuffHistory: () => {
    const snap = puffVectorEngine.getStateSnapshot();
    set({ puffVectorHistory: [snap], puffVectorFuture: [] });
  },
  
  // Grid & Scale setters
  setShowGrid: (show) => set({ showGrid: show }),
  setGridSize: (size) => set({ gridSize: size }),
  setGridColor: (color) => set({ gridColor: color }),
  setGridOpacity: (opacity) => set({ gridOpacity: opacity }),
  setShowRulers: (show) => set({ showRulers: show }),
  setRulerUnits: (units) => set({ rulerUnits: units }),
  setScale: (scale) => set({ scale: scale }),
  setShowGuides: (show) => set({ showGuides: show }),
  setGuideColor: (color) => set({ guideColor: color }),
  setSnapToGrid: (snap) => set({ snapToGrid: snap }),
  setSnapDistance: (distance) => set({ snapDistance: distance }),
  setShowMeasurements: (show) => set({ showMeasurements: show }),
  setMeasurementUnits: (units) => set({ measurementUnits: units }),

  
  // Puff Print setters
  setPuffBrushSize: (size) => set({ puffBrushSize: size }),
  setPuffBrushOpacity: (opacity) => set({ puffBrushOpacity: opacity }),
  setPuffHeight: (height) => set({ puffHeight: height }),
  setPuffSoftness: (softness: number) => set({ puffSoftness: softness }),
  setPuffOpacity: (opacity: number) => set({ puffOpacity: opacity }),
  setPuffCurvature: (curvature) => set({ puffCurvature: curvature }),
  setPuffShape: (shape) => set({ puffShape: shape }),
  setPuffColor: (color) => set({ puffColor: color }),
  
  // Embroidery setters
  setEmbroideryStitches: (stitches) => set({ embroideryStitches: stitches }),
  setEmbroideryPattern: (pattern) => set({ embroideryPattern: pattern }),
  setEmbroideryThreadType: (type) => set({ embroideryThreadType: type }),
  setEmbroideryThickness: (thickness) => set({ embroideryThickness: thickness }),
  setEmbroideryOpacity: (opacity) => set({ embroideryOpacity: opacity }),
  setEmbroideryColor: (color) => {
    // Validate hex color format
    if (color && typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color)) {
      set({ embroideryColor: color });
    } else {
      console.warn('Invalid embroidery color provided:', color, 'Using default color');
      set({ embroideryColor: '#ff69b4' });
    }
  },
  setEmbroideryStitchType: (type) => set({ embroideryStitchType: type }),
  setEmbroideryPatternDescription: (description) => set({ embroideryPatternDescription: description }),
  setEmbroideryAIEnabled: (enabled) => set({ embroideryAIEnabled: enabled }),
  setEmbroideryThreadColor: (color: string) => set({ embroideryThreadColor: color }),
  setEmbroideryThreadThickness: (thickness: number) => set({ embroideryThreadThickness: thickness }),
  setEmbroiderySpacing: (spacing: number) => set({ embroiderySpacing: spacing }),
  setEmbroideryDensity: (density: number) => set({ embroideryDensity: density }),
  setEmbroideryAngle: (angle: number) => set({ embroideryAngle: angle }),
  setEmbroideryScale: (scale: number) => set({ embroideryScale: scale }),
  setCurrentEmbroideryPath: (path: {x: number, y: number}[]) => set({ currentEmbroideryPath: path }),
  
  // Vector tool setters
  setVectorStrokeColor: (color: string) => set({ vectorStrokeColor: color }),
  setVectorStrokeWidth: (width: number) => set({ vectorStrokeWidth: width }),
  setVectorFillColor: (color: string) => set({ vectorFillColor: color }),
  setVectorFill: (fill: boolean) => set({ vectorFill: fill }),
  

  selectLayerForTransform: (layerId: string) => {
    const layer = get().layers.find(l => l.id === layerId);
    const composed = get().composedCanvas;
    if (!layer || !composed) return;
    set({ layerTransform: { x: 100, y: 100, cx: 200, cy: 200, width: 200, height: 200, rotation: 0, scale: 1, skewX: 0, skewY: 0 } });
  },

  updateLayerTransform: (patch: Partial<SelectionTransform>) => {
    const current = get().layerTransform;
    if (!current) return;
    set({ layerTransform: { ...current, ...patch } });
  },

  applyLayerTransform: () => {
    set({ layerTransform: null });
  },

  cancelLayerTransform: () => {
    set({ layerTransform: null });
  },

  addDecal: (image: ImageBitmap, name?: string) => {
    const id = Math.random().toString(36).slice(2);
    const composed = get().composedCanvas;
    const w = image.width; const h = image.height;
    const scale = composed ? Math.min(composed.width, composed.height) * 0.25 / Math.max(w, h) : 0.25;
    const decal: Decal = {
      id, name: name || `Decal ${id.slice(0, 4)}`, image, width: w, height: h,
      u: 0.5, v: 0.5, scale, rotation: 0, opacity: 1, blendMode: 'source-over',
      layerId: get().activeLayerId || undefined
    };
    set(state => ({ decals: [...state.decals, decal] }));
    return id;
  },

  updateDecal: (id: string, patch: Partial<Decal>) => {
    set(state => ({ decals: state.decals.map(d => d.id === id ? { ...d, ...patch } : d) }));
    get().composeLayers();
  },

  deleteDecal: (id: string) => {
    set(state => ({ decals: state.decals.filter(d => d.id !== id) }));
    get().composeLayers();
  },

  addTextElement: (text: string, uv: { u: number; v: number }, layerId?: string) => {
    const id = Math.random().toString(36).slice(2);
    const state = get();
    
    // Ensure we have a valid layer ID
    let targetLayerId = layerId || state.activeLayerId || 'paint';
    
    // If the target layer doesn't exist, create a default paint layer
    if (!state.layers.find(l => l.id === targetLayerId)) {
      console.log('🎨 Creating default paint layer for text element');
      const paint = document.createElement('canvas');
      paint.width = 2048;
      paint.height = 2048;
      const paintCtx = paint.getContext('2d', { willReadFrequently: true });
      if (paintCtx) {
        paintCtx.imageSmoothingEnabled = true;
        paintCtx.imageSmoothingQuality = 'high';
      }
      // Create displacement canvas for the paint layer
      const paintDisplacementCanvas = document.createElement('canvas');
      paintDisplacementCanvas.width = paint.width;
      paintDisplacementCanvas.height = paint.height;
      const paintDispCtx = paintDisplacementCanvas.getContext('2d', { willReadFrequently: true })!;
      paintDispCtx.imageSmoothingEnabled = true;
      paintDispCtx.imageSmoothingQuality = 'high';
      // Fill with neutral gray (no displacement)
      paintDispCtx.fillStyle = 'rgb(128, 128, 128)';
      paintDispCtx.fillRect(0, 0, paint.width, paint.height);
      
      const newLayer = { id: 'paint', name: 'Paint', visible: true, canvas: paint, history: [], future: [], order: 0, displacementCanvas: paintDisplacementCanvas };
      set(state => ({ 
        layers: [...state.layers, newLayer], 
        activeLayerId: 'paint' 
      }));
      targetLayerId = 'paint';
    }
    
    const textElement: TextElement = {
      id, text, x: 0, y: 0, u: uv.u, v: uv.v,
      fontSize: state.textSize, fontFamily: state.textFont,
      bold: state.textBold, italic: state.textItalic,
      underline: false, strikethrough: false,
      align: state.textAlign, color: state.textColor,
      opacity: 1, rotation: 0, letterSpacing: 0, lineHeight: 1.2,
      shadow: { blur: 0, offsetX: 0, offsetY: 0, color: '#000000' },
      textCase: 'none',
      layerId: targetLayerId
    };
    
    console.log('🎨 Creating text element with layerId:', targetLayerId);
    console.log('🎨 Text element details:', textElement);
    set(state => ({ textElements: [...state.textElements, textElement] }));
    console.log('🎨 Text elements after addition:', get().textElements);
    get().composeLayers();
    
    // Force texture update to show the new text immediately
    setTimeout(() => {
      const textureEvent = new CustomEvent('forceTextureUpdate', {
        detail: { source: 'text-addition', textId: id }
      });
      window.dispatchEvent(textureEvent);
    }, 50);
    
    return id;
  },

  // Phase 2: Image layer operations (v2) - with history integration
  addImageV2: async (fileOrUrl: File | string) => {
    const oldProject = cloneProject(get().project);
    const result = await (async () => {
    const projInit = () => ({ layerOrder: [], layers: {}, assets: { images: {}, canvases: {}, smart: {} }, selection: { ids: [] }, version: 1 } as AdvProject);
    const id = Math.random().toString(36).slice(2);
    let imageKey = Math.random().toString(36).slice(2);
    let w = 1024, h = 1024, src: string = '';
    try {
      if (typeof fileOrUrl === 'string') {
        src = fileOrUrl;
        // Best-effort to get dimensions
        const img = new Image();
        const dim = await new Promise<{ w: number; h: number }>((resolve) => { img.onload = () => resolve({ w: img.naturalWidth||w, h: img.naturalHeight||h }); img.src = src; });
        w = dim.w || w; h = dim.h || h;
      } else {
        const bmp = await createImageBitmap(fileOrUrl);
        w = bmp.width; h = bmp.height;
        src = URL.createObjectURL(fileOrUrl);
      }
    } catch {}
    set(state => {
      const proj = state.project ?? projInit();
      proj.assets.images[imageKey] = src;
      const layer: AdvLayer = {
        id,
        name: `Image ${id.slice(0,4)}`,
        visible: true,
        locked: false,
        transform: createDefaultTransform(),
        styles: createDefaultStyles(),
        type: 'image',
        imageId: imageKey,
        naturalSize: { w, h },
      } as any;
      return { project: { ...proj, layers: { ...proj.layers, [id]: layer }, layerOrder: [...proj.layerOrder, id] } } as any;
    });
      return id;
    })();
    
    // Add to history
    const newProject = cloneProject(get().project);
    if (JSON.stringify(newProject) !== JSON.stringify(oldProject)) {
      history.push({
        label: 'Add Image Layer',
        apply: () => set({ project: cloneProject(newProject) }),
        revert: () => set({ project: cloneProject(oldProject) })
      });
    }
    
    return result;
  },

  replaceImageV2: async (layerId: string, fileOrUrl: File | string) => {
    let imageKey = Math.random().toString(36).slice(2);
    let src = '';
    try {
      if (typeof fileOrUrl === 'string') src = fileOrUrl; else src = URL.createObjectURL(fileOrUrl);
    } catch {}
    set(state => {
      const proj = state.project; if (!proj || !proj.layers[layerId]) return {} as any;
      proj.assets.images[imageKey] = src;
      const layer = proj.layers[layerId] as any;
      const patched = { ...layer, imageId: imageKey };
      return { project: { ...proj, layers: { ...proj.layers, [layerId]: patched } } } as any;
    });
  },
  setImagePropsV2: (layerId, patch) => {
    const oldProject = cloneProject(get().project);
    let changed = false;
    set(state => {
      const proj = state.project; if (!proj || !proj.layers[layerId]) return {} as any;
      const layer = proj.layers[layerId] as any;
      const styles = { ...layer.styles };
      if (patch.blendMode) styles.blendMode = patch.blendMode;
      const transform = { ...layer.transform, ...(patch.transform || {}) };
      const hasOpacityChange = patch.opacity != null;
      const updated = {
        ...layer,
        transform,
        styles,
        ...(hasOpacityChange ? { transform: { ...transform, opacity: patch.opacity } } : {})
      };
      changed = JSON.stringify(updated) !== JSON.stringify(layer);
      if (!changed) return {} as any;
      return { project: { ...proj, layers: { ...proj.layers, [layerId]: updated } } } as any;
    });
    if (!changed) return;
    const newProject = cloneProject(get().project);
    if (JSON.stringify(newProject) !== JSON.stringify(oldProject)) {
      history.push({
        label: 'Update Image Properties',
        apply: () => set({ project: cloneProject(newProject) }),
        revert: () => set({ project: cloneProject(oldProject) })
      });
    }
  },
  setClipMaskV2: (layerId, maskLayerId) => {
    const oldProject = cloneProject(get().project);
    let changed = false;
    set(state => {
      const proj = state.project; if (!proj || !proj.layers[layerId]) return {} as any;
      const layer = proj.layers[layerId] as any;
      const currentMask = layer.mask?.layerId ?? null;
      const nextMask = maskLayerId ?? null;
      if (currentMask === nextMask) return {} as any;
      changed = true;
      const updated: any = { ...layer, mask: nextMask ? { layerId: nextMask, mode: 'clip' } : undefined };
      return { project: { ...proj, layers: { ...proj.layers, [layerId]: updated } } } as any;
    });
    if (!changed) return;
    const newProject = cloneProject(get().project);
    if (JSON.stringify(newProject) !== JSON.stringify(oldProject)) {
      history.push({
        label: 'Set Clip Mask',
        apply: () => set({ project: cloneProject(newProject) }),
        revert: () => set({ project: cloneProject(oldProject) })
      });
    }
  },
  convertToSmartV2: (layerId) => {
    set(state => {
      const proj = state.project; if (!proj || !proj.layers[layerId]) return {} as any;
      const srcId = 'smart_' + Math.random().toString(36).slice(2);
      const layer = proj.layers[layerId] as any;
      const updated = { ...layer, isSmartObject: true, sourceRef: srcId };
      proj.assets.smart[srcId] = { snapshot: undefined };
      return { project: { ...proj, layers: { ...proj.layers, [layerId]: updated } } } as any;
    });
  },
  rasterizeV2: (layerId) => {
    // Placeholder: marking as rasterized; full implementation renders to a bitmap and replaces content
    set(state => {
      const proj = state.project; if (!proj || !proj.layers[layerId]) return {} as any;
      const layer = proj.layers[layerId] as any;
      const updated = { ...layer, rasterized: true };
      return { project: { ...proj, layers: { ...proj.layers, [layerId]: updated } } } as any;
    });
  },

  updateTextElement: (id: string, patch: Partial<TextElement>) => {
    console.log('🎨 updateTextElement called with:', { id, patch });
    set(state => ({ textElements: state.textElements.map(t => t.id === id ? { ...t, ...patch } : t) }));
    console.log('🎨 Text element updated in store');
  },

  deleteTextElement: (id: string) => {
    set(state => ({ textElements: state.textElements.filter(t => t.id !== id) }));
    get().composeLayers();
  },

  // Shape management functions
  updateShapeElement: (id: string, patch: any) => {
    console.log('🔷 updateShapeElement called with:', { id, patch });
    set(state => ({ shapeElements: state.shapeElements.map(s => s.id === id ? { ...s, ...patch } : s) }));
    console.log('🔷 Shape element updated in store');
    get().composeLayers();
  },

  deleteShapeElement: (id: string) => {
    set(state => ({ shapeElements: state.shapeElements.filter(s => s.id !== id) }));
    get().composeLayers();
  },

  duplicateShapeElement: (id: string) => {
    const shape = get().shapeElements.find(s => s.id === id);
    if (shape) {
      const newId = Math.random().toString(36).slice(2);
      const duplicatedShape = {
        ...shape,
        id: newId,
        name: `${shape.name || 'Shape'} Copy`,
        positionX: shape.positionX + 5, // Offset slightly
        positionY: shape.positionY + 5
      };
      set(state => ({ shapeElements: [...state.shapeElements, duplicatedShape] }));
      get().composeLayers();
      return newId;
    }
    return null;
  },

  // Shape management
  addShapeElement: (shape: any) => {
    const id = Math.random().toString(36).slice(2);
    const newShape = {
      id,
      name: `Shape ${get().shapeElements.length + 1}`,
      ...shape
    };
    set(state => ({ 
      shapeElements: [...state.shapeElements, newShape],
      activeShapeId: id 
    }));
    get().composeLayers();
    return id;
  },

  clearShapes: () => {
    set(state => ({ shapeElements: [] }));
    get().composeLayers();
  },

  // Layer management
  addLayer: (name) => {
    const composed = get().composedCanvas;
    const width = composed?.width || 2048;
    const height = composed?.height || 2048;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    // Optimize canvas for frequent readback operations
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, width, height);
    const id = Math.random().toString(36).slice(2);
    const layerName = name || `Layer ${id.slice(0, 4)}`;
    // Create displacement canvas for puff effects
    const displacementCanvas = document.createElement('canvas');
    displacementCanvas.width = width;
    displacementCanvas.height = height;
    const dispCtx = displacementCanvas.getContext('2d', { willReadFrequently: true })!;
    dispCtx.imageSmoothingEnabled = true;
    dispCtx.imageSmoothingQuality = 'high';
    // Fill with neutral gray (no displacement)
    dispCtx.fillStyle = 'rgb(128, 128, 128)';
    dispCtx.fillRect(0, 0, width, height);
    
    const layer: Layer = { id, name: layerName, visible: true, canvas, history: [], future: [], order: get().layers.length, displacementCanvas };
    set(state => ({ layers: [...state.layers, layer], activeLayerId: id }));
    
    // Force composition and visual update
    get().composeLayers();
    
    // Trigger immediate visual update on 3D model
    setTimeout(() => {
      const textureEvent = new CustomEvent('forceTextureUpdate', {
        detail: { source: 'layer-creation', layerId: id }
      });
      window.dispatchEvent(textureEvent);
      console.log('🔄 Triggered texture update after layer creation');
    }, 50);
    
    // Save state for undo/redo
    get().saveState(`Add Layer: ${layerName}`);
    
    return id;
  },

  deleteLayer: (id: string) => {
    const state = get();
    const layerToDelete = state.layers.find(l => l.id === id);
    if (!layerToDelete) return;
    
    const layerName = layerToDelete.name;
    const layerToolType = (layerToDelete as any).toolType || 'general';
    const remainingLayers = state.layers.filter(l => l.id !== id);
    const newActiveLayerId = remainingLayers.length > 0 ? remainingLayers[0].id : null;
    
    // Clean up tool-specific data based on layer type
    console.log(`🧹 Cleaning up tool-specific data for ${layerToolType} layer:`, id);
    
    if (layerToolType === 'puffPrint') {
      // Clear puff print displacement and normal maps
      const puffCanvas = get().puffCanvas;
      if (puffCanvas) {
        const ctx = puffCanvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, puffCanvas.width, puffCanvas.height);
          console.log('🧹 Cleared puff canvas for deleted layer');
        }
      }
      
      // Trigger displacement map recreation
      setTimeout(() => {
        const event = new CustomEvent('updateDisplacementMaps', {
          detail: { source: 'layer-deletion', layerId: id }
        });
        window.dispatchEvent(event);
        console.log('🧹 Triggered displacement map update after layer deletion');
      }, 100);
    }
    
    if (layerToolType === 'embroidery') {
      // Clear embroidery stitches that belong to this layer
      const currentEmbroideryStitches = get().embroideryStitches || [];
      const remainingStitches = currentEmbroideryStitches.filter((stitch: any) => 
        stitch.layerId !== id
      );
      
      if (remainingStitches.length !== currentEmbroideryStitches.length) {
        set({ embroideryStitches: remainingStitches });
        console.log(`🧹 Removed ${currentEmbroideryStitches.length - remainingStitches.length} embroidery stitches from deleted layer`);
        
        // Trigger embroidery update
        setTimeout(() => {
          const event = new CustomEvent('updateEmbroideryPaths', {
            detail: { source: 'layer-deletion', layerId: id }
          });
          window.dispatchEvent(event);
          console.log('🧹 Triggered embroidery update after layer deletion');
        }, 100);
      }
    }
    
    // Clear any decals that belong to this layer
    const decals = get().decals || [];
    const remainingDecals = decals.filter(d => d.layerId !== id);
    if (remainingDecals.length !== decals.length) {
      set({ decals: remainingDecals });
      console.log(`🧹 Removed ${decals.length - remainingDecals.length} decals from deleted layer`);
    }
    
    // Clear any text elements that belong to this layer
    const textElements = get().textElements || [];
    const remainingTextElements = textElements.filter(te => te.layerId !== id);
    if (remainingTextElements.length !== textElements.length) {
      set({ textElements: remainingTextElements });
      console.log(`🧹 Removed ${textElements.length - remainingTextElements.length} text elements from deleted layer`);
    }
    
    // Clear any brush strokes that belong to this layer
    const brushStrokes = get().brushStrokes || [];
    const remainingBrushStrokes = brushStrokes.filter(stroke => stroke.layerId !== id);
    if (remainingBrushStrokes.length !== brushStrokes.length) {
      set({ brushStrokes: remainingBrushStrokes });
      console.log(`🧹 Removed ${brushStrokes.length - remainingBrushStrokes.length} brush strokes from deleted layer`);
    }
    
    set({
      layers: remainingLayers,
      activeLayerId: newActiveLayerId
    });
    
    // Force composition and visual update
    get().composeLayers();
    
    // Trigger immediate visual update on 3D model
    setTimeout(() => {
      const textureEvent = new CustomEvent('forceTextureUpdate', {
        detail: { source: 'layer-deletion', layerId: id }
      });
      window.dispatchEvent(textureEvent);
      console.log('🔄 Triggered texture update after layer deletion');
    }, 50);
    
    // Save state for undo/redo
    get().saveState(`Delete Layer: ${layerName} (${layerToolType})`);
    
    console.log(`🎨 Successfully deleted ${layerToolType} layer: ${layerName}`);
  },

  initCanvases: (w = 4096, h = 4096) => {
    // PERFORMANCE FIX: Prevent multiple canvas initializations
    const currentState = get();
    if (currentState.composedCanvas && 
        currentState.composedCanvas.width === w && 
        currentState.composedCanvas.height === h) {
      console.log('🎨 Canvases already initialized with correct size:', w, 'x', h);
      return;
    }
    
    console.log('🎨 Initializing device-optimized canvases with size:', w, 'x', h);
    
    const base = document.createElement('canvas');
    base.width = w; base.height = h;
    // PERFORMANCE FIX: Use device-optimized canvas context settings
    const baseCtx = base.getContext('2d', performanceOptimizer.getOptimalCanvasContextOptions());
    if (baseCtx) {
      baseCtx.imageSmoothingEnabled = true;
      baseCtx.imageSmoothingQuality = 'high';
      baseCtx.lineCap = 'round';
      baseCtx.lineJoin = 'round';
    }
    
    const composed = document.createElement('canvas');
    composed.width = w; composed.height = h;
    // PERFORMANCE FIX: Use high-quality canvas context settings for better color preservation
    const composedCtx = composed.getContext('2d', { 
      willReadFrequently: true,
      alpha: true,
      desynchronized: false
    });
    if (composedCtx) {
      composedCtx.imageSmoothingEnabled = true;
      composedCtx.imageSmoothingQuality = 'high';
      composedCtx.lineCap = 'round';
      composedCtx.lineJoin = 'round';
    }
    
    const paint = document.createElement('canvas');
    paint.width = w; paint.height = h;
    // Optimize paint canvas for frequent readback operations with high quality
    const paintCtx = paint.getContext('2d', { 
      willReadFrequently: true,
      alpha: true,
      desynchronized: false
    });
    if (paintCtx) {
      paintCtx.imageSmoothingEnabled = true;
      paintCtx.imageSmoothingQuality = 'high';
      paintCtx.lineCap = 'round';
      paintCtx.lineJoin = 'round';
    }
    // Create displacement canvas for the paint layer
    const paintDisplacementCanvas = document.createElement('canvas');
    paintDisplacementCanvas.width = paint.width;
    paintDisplacementCanvas.height = paint.height;
    const paintDispCtx = paintDisplacementCanvas.getContext('2d', { willReadFrequently: true })!;
    paintDispCtx.imageSmoothingEnabled = true;
    paintDispCtx.imageSmoothingQuality = 'high';
    // Fill with neutral gray (no displacement)
    paintDispCtx.fillStyle = 'rgb(128, 128, 128)';
    paintDispCtx.fillRect(0, 0, paint.width, paint.height);
    
    const layers = [
      { id: 'paint', name: 'Paint', visible: true, canvas: paint, history: [], future: [], order: 0, displacementCanvas: paintDisplacementCanvas }
    ];
    console.log('🎨 High-quality canvases initialized with size:', w, 'x', h);
    set({ layers, activeLayerId: 'paint', composedCanvas: composed });
    console.log('🎨 ComposedCanvas set, current store state:', {
      modelScene: !!get().modelScene,
      composedCanvas: !!get().composedCanvas
    });
    get().composeLayers();
  },

  // Imported image management methods
  addImportedImage: (image: any) => {
    console.log('📷 Adding imported image:', image.name);
    set(state => ({ importedImages: [...state.importedImages, image] }));
    get().composeLayers();
  },

  updateImportedImage: (id: string, updates: any) => {
    console.log('📷 Updating imported image:', id, updates);
    set(state => ({
      importedImages: state.importedImages.map(img =>
        img.id === id ? { ...img, ...updates } : img
      )
    }));
    get().composeLayers();
  },

  removeImportedImage: (id: string) => {
    console.log('📷 Removing imported image:', id);
    set(state => ({ 
      importedImages: state.importedImages.filter(img => img.id !== id),
      selectedImageId: state.selectedImageId === id ? null : state.selectedImageId
    }));
    get().composeLayers();
  },

  // Layer management methods
  setLayers: (layers: Layer[]) => {
    console.log('🎨 Setting layers:', layers.length);
    set({ layers });
    get().composeLayers();
  },

  setComposedCanvas: (canvas: HTMLCanvasElement | null) => {
    console.log('🎨 Setting composed canvas:', !!canvas);
    set({ composedCanvas: canvas });
  },

  selectImportedImage: (id: string) => {
    console.log('📷 Selecting imported image:', id);
    set({ selectedImageId: id });
  },

  getActiveLayer: () => {
    const { layers, activeLayerId } = get();
    return layers.find(l => l.id === activeLayerId) || null;
  },

  // Enhanced layer management for all tools
  getOrCreateActiveLayer: (toolType: string) => {
    const { layers, activeLayerId, activeTool } = get();
    
    // If we have an active layer, check if it's suitable for the current tool
    if (activeLayerId) {
      const activeLayer = layers.find(l => l.id === activeLayerId);
      if (activeLayer && activeLayer.visible) {
        return activeLayer;
      }
    }

    // Create a new layer for the tool if none exists or current one is hidden
    const layerName = get().getLayerNameForTool(toolType);
    const addLayerFunc = get().addLayer;
    if (!addLayerFunc) return null;
    const layerId = addLayerFunc(layerName);
    
    // Set the new layer as active
    set({ activeLayerId: layerId });
    
    console.log(`🎨 Created new layer "${layerName}" for tool: ${toolType}`);
    return get().layers.find(l => l.id === layerId) || null;
  },

  getLayerNameForTool: (toolType: string) => {
    const baseName = toolType.charAt(0).toUpperCase() + toolType.slice(1);
    const { layers } = get();
    
    // Check if a layer with this name already exists
    let counter = 1;
    let layerName = baseName;
    
    while (layers.some(l => l.name === layerName)) {
      layerName = `${baseName} ${counter}`;
      counter++;
    }
    
    return layerName;
  },

  // Enhanced layer operations with tool integration
  createToolLayer: (toolType: string, options?: any) => {
    const layerName = get().getLayerNameForTool(toolType);
    const addLayerFunc = get().addLayer;
    if (!addLayerFunc) return '';
    const layerId = addLayerFunc(layerName);
    
    // Set layer properties based on tool type
    const updatedLayers = get().layers.map(l => {
      if (l.id === layerId) {
        return {
          ...l,
          toolType: toolType,
          blendMode: options?.blendMode || 'normal',
          opacity: options?.opacity || 1.0,
          visible: true,
          locked: false,
          order: get().layers.length - 1 // Set order to be at the end
        };
      }
      return l;
    });
    
    set({ layers: updatedLayers, activeLayerId: layerId });
    
    console.log(`🎨 Created tool-specific layer "${layerName}" for ${toolType}`);
    return layerId;
  },

  // Layer management functions
  toggleLayerVisibility: (layerId: string) => {
    const updatedLayers = get().layers.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    );
    set({ layers: updatedLayers });
    
    // Force composition and visual update
    get().composeLayers();
    
    // Also update displacement maps for puff effects
    get().composeDisplacementMaps();
    
    // Trigger immediate visual update on 3D model
    setTimeout(() => {
      const textureEvent = new CustomEvent('forceTextureUpdate', {
        detail: { source: 'layer-visibility', layerId }
      });
      window.dispatchEvent(textureEvent);
      console.log('🔄 Triggered texture update after layer visibility change');
    }, 50);
    
    console.log(`🎨 Toggled visibility for layer: ${layerId}`);
  },

  setLayerOpacity: (layerId: string, opacity: number) => {
    const updatedLayers = get().layers.map(layer => 
      layer.id === layerId ? { ...layer, opacity: Math.max(0, Math.min(1, opacity)) } : layer
    );
    set({ layers: updatedLayers });
    
    // Force composition and visual update
    get().composeLayers();
    
    // Also update displacement maps for puff effects
    get().composeDisplacementMaps();
    
    // Trigger immediate visual update on 3D model
    setTimeout(() => {
      const textureEvent = new CustomEvent('forceTextureUpdate', {
        detail: { source: 'layer-opacity', layerId }
      });
      window.dispatchEvent(textureEvent);
      console.log('🔄 Triggered texture update after layer opacity change');
    }, 50);
    
    console.log(`🎨 Set opacity for layer ${layerId}: ${opacity}`);
  },

  setLayerBlendMode: (layerId: string, blendMode: string) => {
    const updatedLayers = get().layers.map(layer => 
      layer.id === layerId ? { ...layer, blendMode } : layer
    );
    set({ layers: updatedLayers });
    
    // Force composition and visual update
    get().composeLayers();
    
    // Also update displacement maps for puff effects
    get().composeDisplacementMaps();
    
    // Trigger immediate visual update on 3D model
    setTimeout(() => {
      const textureEvent = new CustomEvent('forceTextureUpdate', {
        detail: { source: 'layer-blendmode', layerId }
      });
      window.dispatchEvent(textureEvent);
      console.log('🔄 Triggered texture update after layer blend mode change');
    }, 50);
    
    console.log(`🎨 Set blend mode for layer ${layerId}: ${blendMode}`);
  },

  moveLayerUp: (layerId: string) => {
    console.log('🎨 moveLayerUp called for layerId:', layerId);
    const { layers } = get();
    console.log('🎨 Current layers before move:', layers.map(l => ({ id: l.id, name: l.name, order: l.order })));
    
    const layerIndex = layers.findIndex(l => l.id === layerId);
    if (layerIndex > 0) {
      const newLayers = [...layers];
      [newLayers[layerIndex], newLayers[layerIndex - 1]] = [newLayers[layerIndex - 1], newLayers[layerIndex]];
      
      // Update order property
      const updatedLayers = newLayers.map((layer, index) => ({
        ...layer,
        order: index
      }));
      
      console.log('🎨 Updated layers after move:', updatedLayers.map(l => ({ id: l.id, name: l.name, order: l.order })));
      
      set({ layers: updatedLayers });
      
      // Force composition and visual update
      console.log('🎨 Calling composeLayers()');
      get().composeLayers();
      
      // Also update displacement maps for puff effects
      get().composeDisplacementMaps();
      
      // Trigger immediate visual update on 3D model
      setTimeout(() => {
        const textureEvent = new CustomEvent('forceTextureUpdate', {
          detail: { source: 'layer-reorder', layerId }
        });
        window.dispatchEvent(textureEvent);
        console.log('🔄 Triggered texture update after layer reorder');
      }, 50);
      
      console.log(`🎨 Moved layer ${layerId} up`);
    } else {
      console.log('🎨 Cannot move layer up - already at top or not found');
    }
  },

  moveLayerDown: (layerId: string) => {
    console.log('🎨 moveLayerDown called for layerId:', layerId);
    const { layers } = get();
    console.log('🎨 Current layers before move:', layers.map(l => ({ id: l.id, name: l.name, order: l.order })));
    
    const layerIndex = layers.findIndex(l => l.id === layerId);
    if (layerIndex < layers.length - 1) {
      const newLayers = [...layers];
      [newLayers[layerIndex], newLayers[layerIndex + 1]] = [newLayers[layerIndex + 1], newLayers[layerIndex]];
      
      // Update order property
      const updatedLayers = newLayers.map((layer, index) => ({
        ...layer,
        order: index
      }));
      
      console.log('🎨 Updated layers after move:', updatedLayers.map(l => ({ id: l.id, name: l.name, order: l.order })));
      set({ layers: updatedLayers });
      
      // Force composition and visual update
      get().composeLayers();
      
      // Also update displacement maps for puff effects
      get().composeDisplacementMaps();
      
      // Trigger immediate visual update on 3D model
      setTimeout(() => {
        const textureEvent = new CustomEvent('forceTextureUpdate', {
          detail: { source: 'layer-reorder', layerId }
        });
        window.dispatchEvent(textureEvent);
        console.log('🔄 Triggered texture update after layer reorder');
      }, 50);
      
      console.log(`🎨 Moved layer ${layerId} down`);
    }
  },

  duplicateLayer: (layerId: string) => {
    const { layers } = get();
    const layerToDuplicate = layers.find(l => l.id === layerId);
    if (!layerToDuplicate) return '';

    const newLayerName = `${layerToDuplicate.name} Copy`;
    const addLayerFunc = get().addLayer;
    if (!addLayerFunc) return '';
    const newLayerId = addLayerFunc(newLayerName);
    
    // Copy layer properties and canvas content
    const updatedLayers = get().layers.map(layer => {
      if (layer.id === newLayerId) {
        // Create a new displacement canvas for the duplicated layer
        const newDisplacementCanvas = document.createElement('canvas');
        newDisplacementCanvas.width = layerToDuplicate.canvas.width;
        newDisplacementCanvas.height = layerToDuplicate.canvas.height;
        const newDispCtx = newDisplacementCanvas.getContext('2d', { willReadFrequently: true })!;
        newDispCtx.imageSmoothingEnabled = true;
        newDispCtx.imageSmoothingQuality = 'high';
        
        // Copy displacement data if the original layer has a displacement canvas
        if (layerToDuplicate.displacementCanvas) {
          newDispCtx.drawImage(layerToDuplicate.displacementCanvas, 0, 0);
        } else {
          // Fill with neutral gray if no displacement canvas exists
          newDispCtx.fillStyle = 'rgb(128, 128, 128)';
          newDispCtx.fillRect(0, 0, newDisplacementCanvas.width, newDisplacementCanvas.height);
        }
        
        return {
          ...layer,
          ...layerToDuplicate,
          id: newLayerId,
          name: newLayerName,
          order: layers.length,
          displacementCanvas: newDisplacementCanvas
        };
      }
      return layer;
    });
    
    // Copy canvas content
    const newLayer = updatedLayers.find(l => l.id === newLayerId);
    if (newLayer && layerToDuplicate.canvas && newLayer.canvas) {
      const sourceCtx = layerToDuplicate.canvas.getContext('2d');
      const targetCtx = newLayer.canvas.getContext('2d');
      if (sourceCtx && targetCtx) {
        targetCtx.clearRect(0, 0, newLayer.canvas.width, newLayer.canvas.height);
        targetCtx.drawImage(layerToDuplicate.canvas, 0, 0);
      }
    }
    
    set({ layers: updatedLayers, activeLayerId: newLayerId });
    
    // Force composition and visual update
    get().composeLayers();
    
    // Trigger immediate visual update on 3D model
    setTimeout(() => {
      const textureEvent = new CustomEvent('forceTextureUpdate', {
        detail: { source: 'layer-duplication', layerId: newLayerId }
      });
      window.dispatchEvent(textureEvent);
      console.log('🔄 Triggered texture update after layer duplication');
    }, 50);
    
    console.log(`🎨 Duplicated layer: ${layerId} -> ${newLayerId}`);
    return newLayerId;
  },

  composeLayers: () => {
    try {
      let { layers, composedCanvas, decals, textElements, activeLayerId, baseTexture, activeTool, vectorPaths, vectorMode } = get();
      
      // PERFORMANCE: Reduced debug logging - only log occasionally
      if (Math.random() < 0.01) { // Only 1% of the time
        console.log('🎨 Composing layers:', layers.length, 'layers');
      }
      
      if (!composedCanvas) {
        console.warn('No composed canvas available for layer composition - getting from pool');
        // PERFORMANCE FIX: Use device-optimized canvas size
        const optimalSize = performanceOptimizer.getOptimalCanvasSize();
        const newComposedCanvas = canvasPool.getCanvas(optimalSize);
        useApp.setState({ composedCanvas: newComposedCanvas });
        // Update the local variable to use the new canvas
        composedCanvas = newComposedCanvas;
      }
      
      // Determine embroidery count early, used in logging and exit condition
      const embroideryCount = ((get() as any).embroideryStitches || []).length;

      // PERFORMANCE: Reduced logging frequency
      if (Math.random() < 0.005) { // Only 0.5% of the time
        console.log('🎨 Composing layers', {
          layersCount: layers.length,
          textElementsCount: textElements.length,
          composedCanvasSize: `${composedCanvas.width}x${composedCanvas.height}`,
          activeTool,
          embroideryCount
        });
      }
    
      // Early exit if no content to compose (but DO consider embroidery stitches and imported images as content)
      const importedImagesCount = get().importedImages?.length || 0;
      if (layers.length === 0 && decals.length === 0 && textElements.length === 0 && !baseTexture && embroideryCount === 0 && importedImagesCount === 0) {
        return;
      }
    
      // PERFORMANCE FIX: Use high-quality canvas context settings for better color preservation
      const ctx = composedCanvas.getContext('2d', { 
        willReadFrequently: true,
        alpha: true,
        desynchronized: false
      })!;
      
      // Enable high-quality rendering with color preservation
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Optimize for color vibrancy
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;
      
    // Always clear the composed canvas to ensure erasure is properly reflected
    // PERFORMANCE: Reduced logging
    if (Math.random() < 0.01) {
      console.log('🎨 Clearing composed canvas for fresh composition');
    }
    ctx.clearRect(0, 0, composedCanvas.width, composedCanvas.height);
    
    // Draw base texture if available
    if (baseTexture) {
      // PERFORMANCE: Reduced logging
      if (Math.random() < 0.01) {
        console.log('🎨 Drawing base texture');
      }
      
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      
      // Preserve original texture quality by drawing at original size
      // Center the texture on the canvas
      const centerX = (composedCanvas.width - baseTexture.width) / 2;
      const centerY = (composedCanvas.height - baseTexture.height) / 2;
      
      ctx.drawImage(baseTexture, centerX, centerY, baseTexture.width, baseTexture.height);
      // PERFORMANCE: Reduced logging
      if (Math.random() < 0.01) {
        console.log('🎨 Base texture drawn at original resolution');
      }
    }
    
    // Draw paint layers on top (WITHOUT clearing the base!)
    // Ensure all layers have an order property (migration for existing layers)
    const layersWithOrder = layers.map((layer, index) => ({
      ...layer,
      order: (layer as any).order !== undefined ? (layer as any).order : index
    }));
    
    // Sort layers by order for proper layering
    const sortedLayers = [...layersWithOrder].sort((a, b) => {
      return a.order - b.order;
    });
    
    // PERFORMANCE: Only log layer composition occasionally
    if (Math.random() < 0.1) { // Only 10% of the time
      console.log('🎨 composeLayers - sorted layers by order:', sortedLayers.map(l => ({ 
        id: l.id, 
        name: l.name, 
        order: (l as any).order,
        visible: l.visible 
      })));
    }

    for (const layer of sortedLayers) {
      if (!layer.visible) continue;
        
        ctx.save();
        
        // Apply layer-specific properties
        const layerOpacity = (layer as any).opacity || 1.0;
        const layerBlendMode = (layer as any).blendMode || 'source-over';
        const layerToolType = (layer as any).toolType;
        
        ctx.globalAlpha = layerOpacity;
        ctx.globalCompositeOperation = layerBlendMode;
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Apply tool-specific rendering if needed
        if (layerToolType === 'puffPrint') {
          // Special handling for puff print layers
          ctx.globalCompositeOperation = 'source-over';
        } else if (layerToolType === 'embroidery') {
          // Special handling for embroidery layers
          ctx.globalCompositeOperation = 'source-over';
        }
        
        ctx.drawImage(layer.canvas, 0, 0);
        
        // Draw decals for this layer
      for (const d of get().decals) {
        if (d.layerId !== layer.id) continue;
        const x = Math.round(d.u * composedCanvas.width);
        const y = Math.round(d.v * composedCanvas.height);
        const w = Math.round(d.width * d.scale);
        const h = Math.round(d.height * d.scale);
        ctx.save();
        ctx.globalAlpha = d.opacity;
        ctx.globalCompositeOperation = d.blendMode;
          ctx.translate(x + w/2, y + h/2);
        ctx.rotate(d.rotation);
          ctx.drawImage(d.image, -w/2, -h/2, w, h);
        ctx.restore();
    }
    
      // Note: vector paths preview is rendered in 3D overlay (Shirt.tsx) to avoid painting into model texture.

      // Draw text elements for this layer
      console.log('🎨 Processing text elements for layer:', layer.id, 'Total text elements:', textElements.length);
      for (const textEl of textElements) {
        if (textEl.layerId !== layer.id) continue;
        try {
          const x = Math.round(textEl.u * composedCanvas.width);
          // Fix UV coordinate conversion - flip Y axis for proper texture mapping
          const y = Math.round((1 - textEl.v) * composedCanvas.height);
          // PERFORMANCE: Reduced logging
          if (Math.random() < 0.005) {
            console.log('🎨 Text positioning - UV:', textEl.u, textEl.v, 'Canvas:', x, y);
          }
          
          ctx.save();
          
          // Apply text transformations
          ctx.translate(x, y);
          ctx.rotate(textEl.rotation);
          ctx.globalAlpha = textEl.opacity;
          
          // Configure font
          let font = '';
          if (textEl.bold) font += 'bold ';
          if (textEl.italic) font += 'italic ';
          font += `${textEl.fontSize}px ${textEl.fontFamily}`;
          ctx.font = font;
          ctx.textAlign = textEl.align;
          ctx.textBaseline = 'top';
          
          // Apply text case transformation
          let displayText = textEl.text;
          switch (textEl.textCase) {
            case 'uppercase': displayText = displayText.toUpperCase(); break;
            case 'lowercase': displayText = displayText.toLowerCase(); break;
            case 'capitalize': displayText = displayText.replace(/\b\w/g, l => l.toUpperCase()); break;
          }
          
          // Draw shadow if enabled
          if (textEl.shadow && textEl.shadow.blur > 0) {
            ctx.shadowColor = textEl.shadow.color;
            ctx.shadowBlur = textEl.shadow.blur;
            ctx.shadowOffsetX = textEl.shadow.offsetX;
            ctx.shadowOffsetY = textEl.shadow.offsetY;
          }
          
          // Handle multiline text
            const lines = displayText.split('\n');
          const lineHeight = textEl.fontSize * textEl.lineHeight;
          
              lines.forEach((line, index) => {
            const yPos = index * lineHeight;
            
            // Apply letter spacing if specified
            if (textEl.letterSpacing && textEl.letterSpacing !== 0) {
              ctx.letterSpacing = `${textEl.letterSpacing}px`;
            }
            
            // Draw outline if enabled
            if (textEl.outline && textEl.outline.width > 0) {
              ctx.strokeStyle = textEl.outline.color;
              ctx.lineWidth = textEl.outline.width;
              ctx.strokeText(line, 0, yPos);
            }
            
            // Draw main text
            // Check if gradient mode is active for text from UI
            const gradientSettings = (window as any).getGradientSettings ? (window as any).getGradientSettings() : null;
            const isTextGradientMode = gradientSettings && gradientSettings.text && gradientSettings.text.mode === 'gradient';
            
            if (isTextGradientMode && gradientSettings) {
              const grad = gradientSettings.text;
              const textWidth = ctx.measureText(line).width;
              let textGradient;
              
              if (grad.type === 'linear') {
                const angleRad = (grad.angle * Math.PI) / 180;
                const x1 = -Math.cos(angleRad) * textWidth / 2;
                const y1 = -Math.sin(angleRad) * textEl.fontSize / 2;
                const x2 = Math.cos(angleRad) * textWidth / 2;
                const y2 = Math.sin(angleRad) * textEl.fontSize / 2;
                textGradient = ctx.createLinearGradient(x1, y1, x2, y2);
              } else {
                textGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(textWidth, textEl.fontSize) / 2);
              }
              
              grad.stops.forEach((stop: any) => {
                textGradient.addColorStop(stop.position / 100, stop.color);
              });
              
              ctx.fillStyle = textGradient;
            } else if (textEl.gradient) {
              // Create gradient from textEl properties
              const gradient = textEl.gradient.type === 'linear' 
                ? ctx.createLinearGradient(0, 0, ctx.measureText(line).width, 0)
                : ctx.createRadialGradient(0, 0, 0, 0, 0, textEl.fontSize);
              
              textEl.gradient.colors.forEach((color, i) => {
                const stop = textEl.gradient!.stops[i] || (i / (textEl.gradient!.colors.length - 1));
                gradient.addColorStop(stop, color);
              });
              
              ctx.fillStyle = gradient;
            } else {
              ctx.fillStyle = textEl.color;
            }
            
          console.log('🎨 Drawing text element:', textEl.text, 'at UV:', textEl.u, textEl.v, 'Canvas pos:', x, y, 'Font:', ctx.font, 'Color:', ctx.fillStyle);
            ctx.fillText(line, 0, yPos);
            console.log('🎨 Text line drawn successfully');
            
            
            // Draw decorations
          if (textEl.underline || textEl.strikethrough) {
              const metrics = ctx.measureText(line);
            const textWidth = metrics.width;
            
              ctx.strokeStyle = textEl.color;
              ctx.lineWidth = Math.max(1, textEl.fontSize * 0.05);
            
            if (textEl.underline) {
                const underlineY = yPos + textEl.fontSize * 0.9;
              ctx.beginPath();
                ctx.moveTo(0, underlineY);
                ctx.lineTo(textWidth, underlineY);
              ctx.stroke();
            }
            
            if (textEl.strikethrough) {
                const strikeY = yPos + textEl.fontSize * 0.5;
              ctx.beginPath();
                ctx.moveTo(0, strikeY);
                ctx.lineTo(textWidth, strikeY);
              ctx.stroke();
            }
          }
          });
          
          ctx.restore();
        } catch (error) {
          console.error('Error drawing text element:', error);
        }
          }
          
          ctx.restore();
    }
    
    // Draw shape elements
    const shapeElements = get().shapeElements || [];
    console.log('🔷 Drawing shape elements:', shapeElements.length);
    for (const shapeEl of shapeElements) {
      try {
        ctx.save();
        
        // Convert position percentages to canvas coordinates
        const x = Math.round((shapeEl.positionX / 100) * composedCanvas.width);
        const y = Math.round((shapeEl.positionY / 100) * composedCanvas.height);
        
        // Set opacity
        ctx.globalAlpha = shapeEl.opacity;
        
        // Set rotation
        ctx.translate(x, y);
        ctx.rotate((shapeEl.rotation * Math.PI) / 180);
        
        // Set color or gradient
        if (shapeEl.gradient) {
          // Create gradient based on shape type and size
          const size = shapeEl.size;
          let gradient;
          
          if (shapeEl.gradient.type === 'linear') {
            const angleRad = (shapeEl.gradient.angle * Math.PI) / 180;
            gradient = ctx.createLinearGradient(
              -size/2, -size/2,
              size/2, size/2
            );
          } else {
            gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size/2);
          }
          
          shapeEl.gradient.stops.forEach((stop: any) => {
            gradient.addColorStop(stop.position / 100, stop.color);
          });
          
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = shapeEl.color;
        }
        
        // Draw shape based on type
        ctx.beginPath();
        
        switch (shapeEl.type) {
          case 'rectangle':
            ctx.rect(-shapeEl.size/2, -shapeEl.size/2, shapeEl.size, shapeEl.size);
            break;
          case 'circle':
            ctx.arc(0, 0, shapeEl.size/2, 0, 2 * Math.PI);
            break;
          case 'triangle':
            ctx.moveTo(0, -shapeEl.size/2);
            ctx.lineTo(-shapeEl.size/2, shapeEl.size/2);
            ctx.lineTo(shapeEl.size/2, shapeEl.size/2);
            ctx.closePath();
            break;
          case 'star':
            // Draw 5-pointed star
            const spikes = 5;
            const outerRadius = shapeEl.size/2;
            const innerRadius = outerRadius * 0.4;
            for (let i = 0; i < spikes * 2; i++) {
              const angle = (i * Math.PI) / spikes;
              const radius = i % 2 === 0 ? outerRadius : innerRadius;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }
            ctx.closePath();
            break;
          case 'heart':
            // Draw heart shape
            const heartSize = shapeEl.size/2;
            ctx.moveTo(0, heartSize * 0.3);
            ctx.bezierCurveTo(-heartSize * 0.5, -heartSize * 0.3, -heartSize, heartSize * 0.2, 0, heartSize);
            ctx.bezierCurveTo(heartSize, heartSize * 0.2, heartSize * 0.5, -heartSize * 0.3, 0, heartSize * 0.3);
            break;
          case 'diamond':
            ctx.moveTo(0, -shapeEl.size/2);
            ctx.lineTo(shapeEl.size/2, 0);
            ctx.lineTo(0, shapeEl.size/2);
            ctx.lineTo(-shapeEl.size/2, 0);
            ctx.closePath();
            break;
          default:
            // Default to rectangle
            ctx.rect(-shapeEl.size/2, -shapeEl.size/2, shapeEl.size, shapeEl.size);
        }
        
        ctx.fill();
        console.log('🔷 Drew shape element:', shapeEl.type, 'at', x, y, 'size:', shapeEl.size);
        
        ctx.restore();
      } catch (error) {
        console.error('🔷 Error drawing shape element:', error);
      }
    }
    
    // Draw imported images
    const importedImages = get().importedImages || [];
    console.log('📷 Drawing imported images:', importedImages.length);
    for (const img of importedImages) {
      if (!img.visible) continue;
      
      try {
        // Load image from data URL
        const image = new Image();
        image.src = img.dataUrl;
        
        // Only draw if image is loaded
        if (image.complete && image.naturalWidth > 0) {
          ctx.save();
          ctx.globalAlpha = img.opacity;
          ctx.globalCompositeOperation = 'source-over';
          
          // Draw image at specified position and size
          ctx.drawImage(image, img.x, img.y, img.width, img.height);
          console.log('📷 Drew imported image:', img.name, 'at', img.x, img.y, img.width, img.height);
          
          ctx.restore();
        }
      } catch (error) {
        console.error('📷 Error drawing imported image:', img.name, error);
      }
    }
    
    // Render v2 Project image layers (beta)
    try {
      const proj = (get() as any).project as AdvProject | null;
      if (proj && proj.layerOrder && proj.layerOrder.length) {
        const cacheKey = '__imgCache';
        const w: any = window as any;
        if (!w[cacheKey]) w[cacheKey] = new Map<string, HTMLImageElement>();
        const imgCache: Map<string, HTMLImageElement> = w[cacheKey];

        for (const lid of proj.layerOrder) {
          const L = proj.layers[lid] as any;
          if (!L?.visible) continue;
          if (L.type === 'image' && L.imageId) {
            const src = proj.assets.images[L.imageId];
            if (!src) continue;
            let img = imgCache.get(L.imageId);
            const draw = () => {
              ctx.save();
              const t = L.transform || { x:0, y:0, scaleX:1, scaleY:1, rotation:0, opacity:1 };
              const styles = L.styles || {};
              const stroke = styles.stroke;
              const dropShadow = styles.dropShadow;
              const glow = styles.glow;

              ctx.globalAlpha = t.opacity ?? 1;
              ctx.globalCompositeOperation = (styles.blendMode || 'source-over');

              const iw = L.naturalSize?.w || (img ? img.naturalWidth : 1) || 1;
              const ih = L.naturalSize?.h || (img ? img.naturalHeight : 1) || 1;

              ctx.translate((t.x||0) + iw/2, (t.y||0) + ih/2);
              if (t.rotation) ctx.rotate(t.rotation);
              ctx.scale(t.scaleX || 1, t.scaleY || 1);

              if (dropShadow?.enabled) {
                ctx.shadowColor = dropShadow.color;
                ctx.shadowBlur = dropShadow.blur ?? 0;
                ctx.shadowOffsetX = dropShadow.dx ?? 0;
                ctx.shadowOffsetY = dropShadow.dy ?? 0;
              } else {
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
              }

              ctx.drawImage(img!, -iw/2, -ih/2, iw, ih);

              // Reset shadow so it does not affect following passes
              ctx.shadowColor = 'transparent';
              ctx.shadowBlur = 0;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;

              if (glow?.enabled) {
                ctx.save();
                ctx.globalCompositeOperation = 'lighter';
                ctx.globalAlpha = glow.opacity ?? 0.75;
                ctx.shadowColor = glow.color;
                ctx.shadowBlur = glow.size ?? 15;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.drawImage(img!, -iw/2, -ih/2, iw, ih);
                ctx.restore();
              }

              if (stroke?.enabled && stroke.width > 0) {
                ctx.save();
                const width = stroke.width;
                const align = stroke.align || 'center';
                let inset = 0;
                if (align === 'inside') inset = width / 2;
                else if (align === 'outside') inset = -width / 2;

                ctx.lineWidth = width;
                ctx.strokeStyle = stroke.color;
                ctx.lineJoin = stroke.join || 'miter';
                ctx.lineCap = stroke.cap || 'butt';
                ctx.globalCompositeOperation = styles.blendMode || 'source-over';

                const rectX = -iw/2 + inset;
                const rectY = -ih/2 + inset;
                const rectW = iw - inset * 2;
                const rectH = ih - inset * 2;

                ctx.strokeRect(rectX, rectY, rectW, rectH);
                ctx.restore();
              }

              ctx.restore();
            };
            if (!img) {
              img = new Image();
              img.onload = () => { try { get().composeLayers(); } catch {} };
              img.src = src;
              imgCache.set(L.imageId, img);
            }
            if (img.complete && img.naturalWidth > 0) draw();
          }
        }
      }
    } catch (e) {
      console.warn('[Compose v2] image render failed:', e);
    }

    // Draw embroidery stitches on top so they persist across compositions
    try {
      const stitches: any[] = (get() as any).embroideryStitches || [];
      if (stitches.length) {
        for (const stitch of stitches) {
          if (!stitch?.points || stitch.points.length === 0) continue;
          const cfg = {
            type: stitch.type || (get() as any).embroideryStitchType || 'satin',
            color: stitch.color || (get() as any).embroideryColor || '#ff69b4',
            thickness: stitch.thickness ?? (get() as any).embroideryThickness ?? 2,
            opacity: stitch.opacity ?? (get() as any).embroideryOpacity ?? 1.0
          } as any;
          try {
            renderStitchType(ctx, stitch.points, cfg);
          } catch (err) {
            console.warn('[Compose] embroidery render failed, fallback line', err);
            ctx.save();
            ctx.strokeStyle = cfg.color;
            ctx.lineWidth = cfg.thickness;
            ctx.globalAlpha = cfg.opacity;
            ctx.beginPath();
            ctx.moveTo(stitch.points[0].x, stitch.points[0].y);
            for (let i = 1; i < stitch.points.length; i++) ctx.lineTo(stitch.points[i].x, stitch.points[i].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    } catch (e) {
      console.error('[Compose] Error drawing embroidery stitches:', e);
    }

    // CRITICAL FIX: Update the composedCanvas in the store after composition
    set(state => ({ 
      composedCanvas: composedCanvas,
      composedVersion: state.composedVersion + 1 
    }));
    console.log('🎨 Layer composition complete', { version: get().composedVersion });
    
    // DEBUG: Check if canvas has content after composition
    const debugCtx = composedCanvas.getContext('2d');
    if (debugCtx) {
      const imageData = debugCtx.getImageData(1024, 1024, 1, 1); // Sample center pixel
      const [r, g, b, a] = imageData.data;
      console.log('🎨 DEBUG: After composition - center pixel color (RGBA):', r, g, b, a);
    }
    } catch (error) {
      handleCanvasError(
        error as Error,
        { component: 'App', function: 'composeLayers' }
      );
    }
  },

  composeDisplacementMaps: () => {
    try {
      const { layers } = get();
      
      // PERFORMANCE: Reduced debug logging
      if (Math.random() < 0.01) {
        console.log('🎨 Composing displacement maps:', layers.length, 'layers');
      }
      
      if (layers.length === 0) return null;
      
      // Create composed displacement canvas
      const composedDisplacementCanvas = document.createElement('canvas');
      const width = 2048; // Standard displacement map size
      const height = 2048;
      composedDisplacementCanvas.width = width;
      composedDisplacementCanvas.height = height;
      
      const ctx = composedDisplacementCanvas.getContext('2d', { willReadFrequently: true })!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Clear canvas and fill with neutral gray (no displacement)
      ctx.fillStyle = 'rgb(128, 128, 128)';
      ctx.fillRect(0, 0, width, height);
      
      // Ensure all layers have an order property (migration for existing layers)
      const layersWithOrder = layers.map((layer, index) => ({
        ...layer,
        order: (layer as any).order !== undefined ? (layer as any).order : index
      }));
      
      // Sort layers by order for proper layering
      const sortedLayers = [...layersWithOrder].sort((a, b) => {
        return a.order - b.order;
      });
      
      // PERFORMANCE: Only log layer composition occasionally
      if (Math.random() < 0.1) {
        console.log('🎨 composeDisplacementMaps - sorted layers by order:', sortedLayers.map(l => ({ 
          id: l.id, 
          name: l.name, 
          order: l.order,
          visible: l.visible,
          hasDisplacementCanvas: !!l.displacementCanvas
        })));
      }
      
      // Draw displacement layers
      for (const layer of sortedLayers) {
        if (!layer.visible || !layer.displacementCanvas) continue;
        
        ctx.save();
        
        // Apply layer-specific properties
        const layerOpacity = (layer as any).opacity || 1.0;
        const layerBlendMode = (layer as any).blendMode || 'source-over';
        const layerToolType = (layer as any).toolType;
        
        ctx.globalAlpha = layerOpacity;
        ctx.globalCompositeOperation = layerBlendMode;
        
        // For displacement maps, we typically want additive blending
        if (layerToolType === 'puffPrint') {
          ctx.globalCompositeOperation = 'source-over';
        }
        
        // Scale the displacement canvas to match the composed canvas size
        ctx.drawImage(layer.displacementCanvas, 0, 0, width, height);
        
        ctx.restore();
      }
      
      console.log('🎨 Displacement maps composition complete');
      return composedDisplacementCanvas;
      
    } catch (error) {
      console.error('🎨 Error composing displacement maps:', error);
      return null;
    }
  },

  commit: () => {
    const layer = get().getActiveLayer();
    if (!layer) return;
    const current = layer.canvas.getContext('2d')!.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
    layer.history.push(current);
    layer.future = [];
    if (layer.history.length > 50) layer.history.shift();
  },

  forceRerender: () => {
    try {
      console.log('Force rerendering...');
      const { composedCanvas } = get();
      if (composedCanvas) {
        get().composeLayers();
      }
    } catch (error) {
      handleRenderingError(
        error as Error,
        { component: 'App', function: 'forceRerender' }
      );
    }
  },

  setBaseTexture: (texture) => set({ baseTexture: texture }),
  generateBaseLayer: () => {
    console.log('🎨 ===== GENERATE BASE LAYER DEBUG =====');
    const { modelScene, composedCanvas } = get();
    console.log('🎨 ModelScene exists:', !!modelScene);
    console.log('🎨 ComposedCanvas exists:', !!composedCanvas);
    
    if (!modelScene || !composedCanvas) {
      console.log('🎨 Cannot generate base layer: missing modelScene or composedCanvas');
      return;
    }

    console.log('🎨 Generating base layer from model...');
    
    // Create a base texture for the model
    const ctx = composedCanvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, composedCanvas.width, composedCanvas.height);
    
    // Try to extract texture from the model
    let modelTexture: THREE.Texture | null = null;
    modelScene.traverse((child: any) => {
      if (child.isMesh && child.material && child.material.map && !modelTexture) {
        modelTexture = child.material.map;
        console.log('🎨 Found model texture:', modelTexture?.name || 'unnamed');
        console.log('🎨 Texture details:', {
          type: modelTexture?.type,
          format: modelTexture?.format,
          hasImage: !!(modelTexture as any).image,
          hasSource: !!(modelTexture as any).source,
          imageType: typeof (modelTexture as any).image,
          imageConstructor: (modelTexture as any).image?.constructor?.name
        });
      }
    });
    
    if (modelTexture) {
      // Try different ways to extract the texture image
      let textureImage: HTMLImageElement | HTMLCanvasElement | ImageBitmap | null = null;
      
      // Method 1: Direct image property
      if ((modelTexture as any).image) {
        textureImage = (modelTexture as any).image;
        console.log('🎨 Using direct image property');
      }
      // Method 2: Source data
      else if ((modelTexture as any).source?.data) {
        textureImage = (modelTexture as any).source.data;
        console.log('🎨 Using source data');
      }
      // Method 3: Try to convert texture to canvas
      else {
        console.log('🎨 Attempting to convert texture to canvas');
        try {
          // Create a temporary canvas to render the texture
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = (modelTexture as any).image?.width || 2048;
          tempCanvas.height = (modelTexture as any).image?.height || 2048;
          const tempCtx = tempCanvas.getContext('2d');
          
          if (tempCtx && (modelTexture as any).image) {
            tempCtx.drawImage((modelTexture as any).image, 0, 0);
            textureImage = tempCanvas;
            console.log('🎨 Successfully converted texture to canvas');
          }
        } catch (error) {
          console.log('🎨 Failed to convert texture:', error);
        }
      }
      
      if (textureImage) {
        try {
          console.log('🎨 Drawing texture to base layer');
          console.log('🎨 Original texture size:', textureImage.width, 'x', textureImage.height);
          console.log('🎨 Canvas size:', composedCanvas.width, 'x', composedCanvas.height);
          
          // Preserve original texture quality by drawing at original size
          // Center the texture on the canvas
          const centerX = (composedCanvas.width - textureImage.width) / 2;
          const centerY = (composedCanvas.height - textureImage.height) / 2;
          
          ctx.drawImage(textureImage, centerX, centerY, textureImage.width, textureImage.height);
          console.log('🎨 Successfully drew model texture as base layer at original resolution');
        } catch (error) {
          console.log('🎨 Failed to draw texture, using fallback:', error);
          // Fallback to white background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, composedCanvas.width, composedCanvas.height);
        }
      } else {
        // Fallback to white background if no texture found
        console.log('🎨 No usable texture found, using white background');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, composedCanvas.width, composedCanvas.height);
      }
    } else {
      // Fallback to white background if no texture found
      console.log('🎨 No model texture found, using white background');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, composedCanvas.width, composedCanvas.height);
    }
    
    // Create an image from the canvas
    const image = new Image();
    image.onload = () => {
      console.log('Base texture generated successfully');
      get().setBaseTexture(image);
      get().composeLayers(); // Trigger layer composition
    };
    image.src = composedCanvas.toDataURL();
  },

  addDecalFromFile: async (file: File) => {
    const image = await createImageBitmap(file);
    const id = Math.random().toString(36).slice(2);
    const composed = get().composedCanvas;
    const w = image.width; const h = image.height;
    const scale = composed ? Math.min(composed.width, composed.height) * 0.25 / Math.max(w, h) : 0.25;
    const decal: Decal = {
      id, name: file.name.replace(/\.[^/.]+$/, '') || `Decal ${id.slice(0, 4)}`, image, width: w, height: h,
      u: 0.5, v: 0.5, scale, rotation: 0, opacity: 1, blendMode: 'source-over',
      layerId: get().activeLayerId || undefined
    };
    set(state => ({ decals: [...state.decals, decal] }));
    get().composeLayers();
    return id;
  },

  // Checkpoint system
  saveCheckpoint: async (name?: string) => {
    const state = get();
    const id = Math.random().toString(36).slice(2);
    const checkpoint = {
      id,
      name: name || `Checkpoint ${new Date().toLocaleTimeString()}`,
      timestamp: Date.now(),
      modelUrl: state.modelUrl,
      modelPosition: state.modelPosition,
      modelRotation: state.modelRotation,
      modelScale: state.modelScale,
      backgroundScene: state.backgroundScene,
      backgroundIntensity: state.backgroundIntensity,
      backgroundRotation: state.backgroundRotation,
      textElements: state.textElements,
      decals: []
    };
    
    const layerEntries: { id: string; name: string; visible: boolean; width: number; height: number; key: string }[] = [];
    let totalBytes = 0;
    const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> => new Promise((resolve) => canvas.toBlob(b => resolve(b || new Blob()), 'image/png'));
    for (let i = 0; i < state.layers.length; i++) {
      const l = state.layers[i];
      const blob = await canvasToBlob(l.canvas);
      totalBytes += blob.size;
      const key = `checkpoint-${id}-layer-${i}`;
      await localforage.setItem(key, blob);
      layerEntries.push({ id: l.id, name: l.name, visible: l.visible, width: l.canvas.width, height: l.canvas.height, key });
    }
    
    (checkpoint as any).layers = layerEntries;
    const compressedData = LZString.compress(JSON.stringify(checkpoint));
    await localforage.setItem(`checkpoint-${id}`, compressedData);
    const meta: CheckpointMeta = { 
      id, 
      name: checkpoint.name, 
      timestamp: checkpoint.timestamp, 
      size: totalBytes,
      createdAt: checkpoint.timestamp,
      sizeBytes: totalBytes
    };
    return meta;
  },

  loadCheckpoint: async (id: string) => {
    const compressed = await localforage.getItem<string>(`checkpoint-${id}`);
    if (!compressed) throw new Error('Checkpoint not found');
    const data = JSON.parse(LZString.decompress(compressed) || '{}');
    
    const layers: Layer[] = [];
    for (const lp of data.layers || []) {
      const blob = await localforage.getItem<Blob>(lp.key);
      if (!blob) continue;
      const canvas = document.createElement('canvas');
      canvas.width = lp.width; canvas.height = lp.height;
        const ctx = canvas.getContext('2d')!;
      const img = new Image();
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = URL.createObjectURL(blob);
      });
      ctx.drawImage(img, 0, 0);
      // Create displacement canvas for the loaded layer
      const layerDisplacementCanvas = document.createElement('canvas');
      layerDisplacementCanvas.width = canvas.width;
      layerDisplacementCanvas.height = canvas.height;
      const layerDispCtx = layerDisplacementCanvas.getContext('2d', { willReadFrequently: true })!;
      layerDispCtx.imageSmoothingEnabled = true;
      layerDispCtx.imageSmoothingQuality = 'high';
      // Fill with neutral gray (no displacement)
      layerDispCtx.fillStyle = 'rgb(128, 128, 128)';
      layerDispCtx.fillRect(0, 0, canvas.width, canvas.height);
      
      layers.push({ id: lp.id, name: lp.name, visible: lp.visible, canvas, history: [], future: [], order: layers.length, displacementCanvas: layerDisplacementCanvas });
    }
    const composedCanvas = document.createElement('canvas');
    const base = layers[0];
    composedCanvas.width = base?.canvas.width || 4096; composedCanvas.height = base?.canvas.height || 4096;
    useApp.setState({
      modelUrl: data.modelUrl || null,
      modelPosition: data.modelPosition || [0, 0, 0],
      modelRotation: data.modelRotation || [0, 0, 0],
      modelScale: data.modelScale || 1,
      backgroundScene: data.backgroundScene || 'studio',
      backgroundIntensity: data.backgroundIntensity || 1,
      backgroundRotation: data.backgroundRotation || 0,
      textElements: data.textElements || [],
      layers,
      activeLayerId: layers[0]?.id || null,
      composedCanvas,
      decals: [],
    } as Partial<AppState>);
    get().composeLayers();
  },

  listCheckpoints: async () => {
    const keys = await localforage.keys();
    const checkpointKeys = keys.filter(k => k.startsWith('checkpoint-') && !k.includes('-layer-'));
    const metas: CheckpointMeta[] = [];
    for (const key of checkpointKeys) {
      try {
        const compressed = await localforage.getItem<string>(key);
        if (!compressed) continue;
        const data = JSON.parse(LZString.decompress(compressed) || '{}');
        metas.push({ 
          id: data.id, 
          name: data.name, 
          timestamp: data.timestamp, 
          size: 0,
          createdAt: data.timestamp,
          sizeBytes: 0
        });
      } catch (e) { }
    }
    return metas.sort((a, b) => b.timestamp - a.timestamp);
  },

  deleteCheckpoint: async (id: string) => {
    await localforage.removeItem(`checkpoint-${id}`);
    const keys = await localforage.keys();
    const layerKeys = keys.filter(k => k.startsWith(`checkpoint-${id}-layer-`));
    for (const key of layerKeys) {
      await localforage.removeItem(key);
    }
  },

  // Browser caching functions for project state persistence
  saveProjectState: async () => {
    const state = get();
    console.log('💾 Saving project state to browser cache...');
    
    try {
      // Helper function to convert canvas to blob
      const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> => 
        new Promise((resolve) => canvas.toBlob(b => resolve(b || new Blob()), 'image/png'));
      
      // Save layer canvases as blobs
      const layerData = [];
      for (let i = 0; i < state.layers.length; i++) {
        const layer = state.layers[i];
        const blob = await canvasToBlob(layer.canvas);
        const key = `project-layer-${layer.id}`;
        await localforage.setItem(key, blob);
        layerData.push({
          id: layer.id,
          name: layer.name,
          visible: layer.visible,
          width: layer.canvas.width,
          height: layer.canvas.height,
          key
        });
      }

      // Save puff and displacement canvases
      const puffCanvas = state.puffCanvas;
      const displacementCanvas = state.displacementCanvas;
      const normalCanvas = state.normalCanvas;
      
      if (puffCanvas) {
        const puffBlob = await canvasToBlob(puffCanvas);
        await localforage.setItem('project-puff-canvas', puffBlob);
      }
      
      if (displacementCanvas) {
        const dispBlob = await canvasToBlob(displacementCanvas);
        await localforage.setItem('project-displacement-canvas', dispBlob);
      }
      
      if (normalCanvas) {
        const normalBlob = await canvasToBlob(normalCanvas);
        await localforage.setItem('project-normal-canvas', normalBlob);
      }

      // Create project state object (exclude canvases and functions)
      const projectState = {
        // Tool settings
        activeTool: state.activeTool,
        brushColor: state.brushColor,
        brushSize: state.brushSize,
        brushOpacity: state.brushOpacity,
        brushHardness: state.brushHardness,
        brushSpacing: state.brushSpacing,
        brushShape: state.brushShape,
        brushRotation: state.brushRotation,
        brushDynamics: state.brushDynamics,
        brushFlow: state.brushFlow,
        blendMode: state.blendMode,
        
        // Fill settings
        fillTolerance: state.fillTolerance,
        fillGrow: state.fillGrow,
        fillAntiAlias: state.fillAntiAlias,
        fillContiguous: state.fillContiguous,
        
        // Stroke settings
        strokeColor: state.strokeColor,
        strokeWidth: state.strokeWidth,
        strokeEnabled: state.strokeEnabled,
        
        // Material settings
        roughness: state.roughness,
        metalness: state.metalness,
        fabric: state.fabric,
        
        // Model settings
        modelUrl: state.modelUrl,
        modelPosition: state.modelPosition,
        modelRotation: state.modelRotation,
        modelScale: state.modelScale,
        modelChoice: state.modelChoice,
        modelType: state.modelType,
        modelBoundsHeight: state.modelBoundsHeight,
        modelMinDimension: state.modelMinDimension,
        
        // Layer settings
        activeLayerId: state.activeLayerId,
        layers: layerData,
        
        // Text settings
        textSize: state.textSize,
        textFont: state.textFont,
        textColor: state.textColor,
        textBold: state.textBold,
        textItalic: state.textItalic,
        textAlign: state.textAlign,
        lastText: state.lastText,
        activeTextId: state.activeTextId,
        textElements: state.textElements,
        
        // Background settings
        backgroundScene: state.backgroundScene,
        backgroundIntensity: state.backgroundIntensity,
        backgroundRotation: state.backgroundRotation,
        
        // UI settings
        leftPanelOpen: state.leftPanelOpen,
        rightPanelOpen: state.rightPanelOpen,
        modelManagerOpen: state.modelManagerOpen,
        
        // Camera settings
        controlsEnabled: state.controlsEnabled,
        controlsTarget: state.controlsTarget,
        controlsDistance: state.controlsDistance,
        
        // Vector settings
        vectorPaths: state.vectorPaths,
        activePathId: state.activePathId,
        vectorMode: state.vectorMode,
        puffVectorHistory: state.puffVectorHistory,
        puffVectorFuture: state.puffVectorFuture,
        
        // Puff settings
        puffBrushSize: state.puffBrushSize,
        puffBrushOpacity: state.puffBrushOpacity,
        puffColor: state.puffColor,
        puffHeight: state.puffHeight,
        puffCurvature: state.puffCurvature,
        
        // Embroidery settings
        embroideryStitches: state.embroideryStitches,
        embroideryPattern: state.embroideryPattern,
        embroideryThreadType: state.embroideryThreadType,
        embroideryThickness: state.embroideryThickness,
        embroideryOpacity: state.embroideryOpacity,
        embroideryColor: state.embroideryColor,
        embroideryStitchType: state.embroideryStitchType,
        embroideryPatternDescription: state.embroideryPatternDescription,
        embroideryAIEnabled: state.embroideryAIEnabled,
        embroideryThreadColor: state.embroideryThreadColor,
        embroideryThreadThickness: state.embroideryThreadThickness,
        embroiderySpacing: state.embroiderySpacing,
        embroideryDensity: state.embroideryDensity,
        embroideryCanvas: state.embroideryCanvas,
        embroideryAngle: state.embroideryAngle,
        embroideryScale: state.embroideryScale,
        currentEmbroideryPath: state.currentEmbroideryPath,
        lastEmbroideryPoint: state.lastEmbroideryPoint,
        
        // Grid settings
        showGrid: state.showGrid,
        gridSize: state.gridSize,
        gridColor: state.gridColor,
        gridOpacity: state.gridOpacity,
        showRulers: state.showRulers,
        rulerUnits: state.rulerUnits,
        scale: state.scale,
        showGuides: state.showGuides,
        guideColor: state.guideColor,
        snapToGrid: state.snapToGrid,
        
        // Symmetry settings
        brushSymmetry: state.brushSymmetry,
        symmetryX: state.symmetryX,
        symmetryY: state.symmetryY,
        symmetryZ: state.symmetryZ,
        symmetryAngle: state.symmetryAngle,
        
        // Timestamp
        savedAt: Date.now()
      };

      // Compress and save the project state
      const compressedData = LZString.compress(JSON.stringify(projectState));
      await localforage.setItem('project-state', compressedData);
      
      console.log('💾 Project state saved successfully');
      return true;
    } catch (error) {
      console.error('💾 Failed to save project state:', error);
      return false;
    }
  },

  loadProjectState: async () => {
    console.log('💾 Loading project state from browser cache...');
    
    try {
      const compressed = await localforage.getItem<string>('project-state');
      if (!compressed) {
        console.log('💾 No saved project state found');
        return false;
      }

      const projectState = JSON.parse(LZString.decompress(compressed) || '{}');
      
      // Load layer canvases
      const layers: Layer[] = [];
      for (const layerData of projectState.layers || []) {
        const blob = await localforage.getItem<Blob>(layerData.key);
        if (!blob) continue;
        
        const canvas = document.createElement('canvas');
        canvas.width = layerData.width;
        canvas.height = layerData.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.onload = () => ctx.drawImage(img, 0, 0);
          img.src = URL.createObjectURL(blob);
        }
        
        // Create displacement canvas for the loaded layer
        const layerDisplacementCanvas = document.createElement('canvas');
        layerDisplacementCanvas.width = canvas.width;
        layerDisplacementCanvas.height = canvas.height;
        const layerDispCtx = layerDisplacementCanvas.getContext('2d', { willReadFrequently: true })!;
        layerDispCtx.imageSmoothingEnabled = true;
        layerDispCtx.imageSmoothingQuality = 'high';
        // Fill with neutral gray (no displacement)
        layerDispCtx.fillStyle = 'rgb(128, 128, 128)';
        layerDispCtx.fillRect(0, 0, canvas.width, canvas.height);
        
        layers.push({
          id: layerData.id,
          name: layerData.name,
          visible: layerData.visible,
          canvas,
          history: [],
          future: [],
          order: layers.length,
          displacementCanvas: layerDisplacementCanvas
        });
      }

      // Load puff and displacement canvases
      let puffCanvas = null;
      let displacementCanvas = null;
      let normalCanvas = null;
      
      const puffBlob = await localforage.getItem<Blob>('project-puff-canvas');
      if (puffBlob) {
        puffCanvas = document.createElement('canvas');
        puffCanvas.width = 2048;
        puffCanvas.height = 2048;
        const puffCtx = puffCanvas.getContext('2d');
        if (puffCtx) {
          const puffImg = new Image();
          puffImg.onload = () => puffCtx.drawImage(puffImg, 0, 0);
          puffImg.src = URL.createObjectURL(puffBlob);
        }
      }
      
      const dispBlob = await localforage.getItem<Blob>('project-displacement-canvas');
      if (dispBlob) {
        displacementCanvas = document.createElement('canvas');
        displacementCanvas.width = 2048;
        displacementCanvas.height = 2048;
        const dispCtx = displacementCanvas.getContext('2d');
        if (dispCtx) {
          const dispImg = new Image();
          dispImg.onload = () => dispCtx.drawImage(dispImg, 0, 0);
          dispImg.src = URL.createObjectURL(dispBlob);
        }
      }
      
      const normalBlob = await localforage.getItem<Blob>('project-normal-canvas');
      if (normalBlob) {
        normalCanvas = document.createElement('canvas');
        normalCanvas.width = 2048;
        normalCanvas.height = 2048;
        const normalCtx = normalCanvas.getContext('2d');
        if (normalCtx) {
          const normalImg = new Image();
          normalImg.onload = () => normalCtx.drawImage(normalImg, 0, 0);
          normalImg.src = URL.createObjectURL(normalBlob);
        }
      }

      // Update the state with loaded data
      set({
        // Tool settings
        activeTool: projectState.activeTool || 'brush',
        brushColor: projectState.brushColor || '#000000',
        brushSize: projectState.brushSize || 20,
        brushOpacity: projectState.brushOpacity || 1,
        brushHardness: projectState.brushHardness || 1,
        brushSpacing: projectState.brushSpacing || 0.25,
        brushShape: projectState.brushShape || 'round',
        brushRotation: projectState.brushRotation || 0,
        brushDynamics: projectState.brushDynamics || false,
        brushFlow: projectState.brushFlow || 1,
        blendMode: projectState.blendMode || 'source-over',
        
        // Fill settings
        fillTolerance: projectState.fillTolerance || 30,
        fillGrow: projectState.fillGrow || 0,
        fillAntiAlias: projectState.fillAntiAlias || true,
        fillContiguous: projectState.fillContiguous || true,
        
        // Stroke settings
        strokeColor: projectState.strokeColor || '#000000',
        strokeWidth: projectState.strokeWidth || 2,
        strokeEnabled: projectState.strokeEnabled || false,
        
        // Material settings
        roughness: projectState.roughness || 0.7,
        metalness: projectState.metalness || 0,
        fabric: projectState.fabric || 'cotton',
        
        // Model settings
        modelUrl: projectState.modelUrl || '/models/shirt.glb',
        modelPosition: projectState.modelPosition || [0, 0, 0],
        modelRotation: projectState.modelRotation || [0, 0, 0],
        modelScale: projectState.modelScale || 1,
        modelChoice: projectState.modelChoice || 'tshirt',
        modelType: projectState.modelType || 'glb',
        modelBoundsHeight: projectState.modelBoundsHeight || 0,
        modelMinDimension: projectState.modelMinDimension || 0,
        
        // Layer settings
        activeLayerId: projectState.activeLayerId || null,
        layers: layers,
        
        // Text settings
        textSize: projectState.textSize || 24,
        textFont: projectState.textFont || 'Arial',
        textColor: projectState.textColor || '#000000',
        textBold: projectState.textBold || false,
        textItalic: projectState.textItalic || false,
        textAlign: projectState.textAlign || 'left',
        lastText: projectState.lastText || '',
        activeTextId: projectState.activeTextId || null,
        textElements: projectState.textElements || [],
        
        // Background settings
        backgroundScene: projectState.backgroundScene || 'studio',
        backgroundIntensity: projectState.backgroundIntensity || 1,
        backgroundRotation: projectState.backgroundRotation || 0,
        
        // UI settings
        leftPanelOpen: projectState.leftPanelOpen || true,
        rightPanelOpen: projectState.rightPanelOpen || true,
        modelManagerOpen: projectState.modelManagerOpen || false,
        
        // Camera settings
        controlsEnabled: projectState.controlsEnabled !== undefined ? projectState.controlsEnabled : true,
        controlsTarget: projectState.controlsTarget || [0, 0, 0],
        controlsDistance: projectState.controlsDistance || 5,
        
        // Vector settings
        vectorPaths: projectState.vectorPaths || [],
        activePathId: projectState.activePathId || null,
        vectorMode: projectState.vectorMode || false,
        puffVectorHistory: projectState.puffVectorHistory || [],
        puffVectorFuture: projectState.puffVectorFuture || [],
        
        // Puff settings
        puffBrushSize: projectState.puffBrushSize || 20,
        puffBrushOpacity: projectState.puffBrushOpacity || 1,
        puffColor: projectState.puffColor || '#ff69b4',
        puffHeight: projectState.puffHeight || 2,
        puffCurvature: projectState.puffCurvature || 0.5,
        
        // Embroidery settings
        embroideryStitches: projectState.embroideryStitches || [],
        embroideryPattern: projectState.embroideryPattern || null,
        embroideryThreadType: projectState.embroideryThreadType || 'cotton',
        embroideryThickness: projectState.embroideryThickness || 3,
        embroideryOpacity: projectState.embroideryOpacity || 1.0,
        embroideryColor: projectState.embroideryColor || '#ff69b4',
        embroideryStitchType: projectState.embroideryStitchType || 'satin',
        embroideryPatternDescription: projectState.embroideryPatternDescription || '',
        embroideryAIEnabled: projectState.embroideryAIEnabled !== undefined ? projectState.embroideryAIEnabled : true,
        embroideryThreadColor: projectState.embroideryThreadColor || '#ff69b4',
        embroideryThreadThickness: projectState.embroideryThreadThickness || 0.5,
        embroiderySpacing: projectState.embroiderySpacing || 2.0,
        embroideryDensity: projectState.embroideryDensity || 1.0,
        embroideryCanvas: projectState.embroideryCanvas || null,
        embroideryAngle: projectState.embroideryAngle || 0,
        embroideryScale: projectState.embroideryScale || 1.0,
        currentEmbroideryPath: projectState.currentEmbroideryPath || [],
        lastEmbroideryPoint: projectState.lastEmbroideryPoint || null,
        
        // Grid settings
        showGrid: projectState.showGrid || false,
        gridSize: projectState.gridSize || 50,
        gridColor: projectState.gridColor || '#cccccc',
        gridOpacity: projectState.gridOpacity || 0.5,
        showRulers: projectState.showRulers || false,
        rulerUnits: projectState.rulerUnits || 'px',
        scale: projectState.scale || 1,
        showGuides: projectState.showGuides || false,
        guideColor: projectState.guideColor || '#ff0000',
        snapToGrid: projectState.snapToGrid || false,
        
        // Symmetry settings
        brushSymmetry: projectState.brushSymmetry || false,
        symmetryX: projectState.symmetryX || false,
        symmetryY: projectState.symmetryY || false,
        symmetryZ: projectState.symmetryZ || false,
        symmetryAngle: projectState.symmetryAngle || 0,
        
        // Canvas settings
        puffCanvas: puffCanvas,
        displacementCanvas: displacementCanvas,
        normalCanvas: normalCanvas
      });

      console.log('💾 Project state loaded successfully');
      
      // Trigger layer composition after loading
      setTimeout(() => {
        get().composeLayers();
      }, 100);
      
      return true;
    } catch (error) {
      console.error('💾 Failed to load project state:', error);
      return false;
    }
  },

  clearProjectState: async () => {
    console.log('💾 Clearing project state from browser cache...');
    
    try {
      // Remove main project state
      await localforage.removeItem('project-state');
      
      // Remove layer canvases
      const keys = await localforage.keys();
      const projectKeys = keys.filter(k => k.startsWith('project-'));
      for (const key of projectKeys) {
        await localforage.removeItem(key);
      }
      
      console.log('💾 Project state cleared successfully');
      return true;
    } catch (error) {
      console.error('💾 Failed to clear project state:', error);
      return false;
    }
  },

  // Additional missing methods
  selectTextElement: (id: string | null) => set({ activeTextId: id }),
  removeTextElement: (id: string) => {
    set(state => ({ textElements: state.textElements.filter(t => t.id !== id) }));
    get().composeLayers();
  },
  setModelChoice: (choice: 'tshirt' | 'sphere' | 'custom') => set({ modelChoice: choice }),
  setModelType: (type: string | null) => set({ modelType: type }),
  setModelBoundsHeight: (height: number) => set({ modelBoundsHeight: height }),
  setModelMinDimension: (dimension: number) => set({ modelMinDimension: dimension }),
  setFrame: (target: [number, number, number], distance: number) => {
    set({ controlsTarget: target, controlsDistance: distance });
  },
  resetModelTransform: () => {
    set({ 
      modelPosition: [0, 0, 0], 
      modelRotation: [0, 0, 0], 
      modelScale: 1 
    });
  },
  setLastHitUV: (uv: { u: number; v: number }) => {
    // This would typically store the last hit UV coordinates
    console.log('Last hit UV:', uv);
  },
  setHoveredTextId: (id: string | null) => set({ hoveredTextId: id }),
  openBackgroundManager: () => set({ backgroundManagerOpen: true }),
  closeBackgroundManager: () => set({ backgroundManagerOpen: false }),
  snapshot: () => {
    // This would typically take a snapshot of the current state
    console.log('Taking snapshot...');
  }
}));

export function App() {
  const composedCanvas = useApp(s => s.composedCanvas);
  const activeTool = useApp(s => s.activeTool);
  const vectorMode = useApp(s => s.vectorMode);
  const showPuffVectorPrompt = useApp(s => s.showPuffVectorPrompt);
  const puffVectorPromptMessage = useApp(s => s.puffVectorPromptMessage);
  const setPuffVectorPrompt = useApp(s => s.setPuffVectorPrompt);
  const setTool = useApp(s => s.setTool);
  const setVectorMode = useApp(s => s.setVectorMode);
  const drawingActive = vectorMode || [
    'brush','eraser','fill','picker','smudge','blur','select','transform','move','puffPrint','embroidery',
    'line','rect','ellipse','text','moveText','gradient','vectorTools','advancedSelection',
    'advancedBrush','meshDeformation','3dPainting','smartFill'
  ].includes(activeTool as any);
  const wrapRef = useRef<HTMLDivElement>(null);
  const controlsTarget = useApp(s => s.controlsTarget);
  const controlsDistance = useApp(s => s.controlsDistance);
  const cameraView = useApp(s => (s as any).cameraView || null);
  const controlsRef = useRef<any>(null);
  const decals = useApp(s => s.decals);
  const activeDecalId = useApp(s => s.activeDecalId);
  const clickingOnModel = useApp(s => s.clickingOnModel);
  const setClickingOnModel = useApp(s => s.setClickingOnModel);

  // Expose vector store globally for debugging/console access
  useEffect(() => {
    try { (window as any).vectorStore = vectorStore; } catch {}
  }, []);


  const handleClosePuffPrompt = () => setPuffVectorPrompt(false);
  const handleSwitchToPuff = () => {
    setVectorMode(false);
    setPuffVectorPrompt(false);
    setTool('puffPrint');
  };

  // Initialize canvases
  useEffect(() => {
    useApp.getState().initCanvases(2048, 2048);
  }, []);

  // Initialize AI Performance Manager
  useEffect(() => {
    console.log('🤖 Initializing AI Performance Manager...');
    
    // Make AI Performance Manager available globally for debugging
    (window as any).aiPerformanceManager = aiPerformanceManager;
    
    // Set up performance event listeners
    const handleClearTextureCache = () => {
      console.log('🧹 Clearing texture cache...');
      // This will be handled by the texture manager
    };

    const handleClearUnusedLayers = () => {
      console.log('🧹 Clearing unused layers...');
      // This will be handled by the layer manager
    };

    const handleEmergencyMemoryCleanup = () => {
      console.log('🚨 Emergency memory cleanup triggered');
      // Force garbage collection if available
      if ((window as any).gc) {
        (window as any).gc();
      }
    };

    window.addEventListener('clearTextureCache', handleClearTextureCache);
    window.addEventListener('clearUnusedLayers', handleClearUnusedLayers);
    window.addEventListener('emergencyMemoryCleanup', handleEmergencyMemoryCleanup);

    return () => {
      window.removeEventListener('clearTextureCache', handleClearTextureCache);
      window.removeEventListener('clearUnusedLayers', handleClearUnusedLayers);
      window.removeEventListener('emergencyMemoryCleanup', handleEmergencyMemoryCleanup);
    };
  }, []);

  // Automatic project state caching
  useEffect(() => {
    // Load saved project state on app initialization
    const loadSavedState = async () => {
      console.log('💾 Loading saved project state on app initialization...');
      const success = await useApp.getState().loadProjectState();
      if (success) {
        console.log('💾 Project state loaded successfully on startup');
      } else {
        console.log('💾 No saved project state found, starting fresh');
      }
    };

    loadSavedState();
  }, []);

  // Auto-save project state on significant changes
  useEffect(() => {
    const saveState = async () => {
      // Debounce saves to avoid excessive storage writes
      const timeoutId = setTimeout(async () => {
        console.log('💾 Auto-saving project state...');
        await useApp.getState().saveProjectState();
      }, 2000); // Save 2 seconds after last change

      return () => clearTimeout(timeoutId);
    };

    // Save when layers change
    const unsubscribe = useApp.subscribe((state) => {
      // Trigger save when layers change
      saveState();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // PERFORMANCE FIX: Removed redundant auto-save triggers to prevent excessive saving
  // Auto-save is now handled by the main debounced effect above

  // Save state before page unload
  useEffect(() => {
    const handleBeforeUnload = async () => {
      console.log('💾 Saving project state before page unload...');
      await useApp.getState().saveProjectState();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Handle model click detection
  useEffect(() => {
    const handleModelClick = () => {
      setClickingOnModel(true);
    };
    
    const handleModelClickEnd = () => {
      setClickingOnModel(false);
    };

    // Listen for custom events from the Shirt component
    window.addEventListener('modelClick', handleModelClick);
    window.addEventListener('modelClickEnd', handleModelClickEnd);
    window.addEventListener('mouseup', handleModelClickEnd);
    window.addEventListener('mouseleave', handleModelClickEnd);

    return () => {
      window.removeEventListener('modelClick', handleModelClick);
      window.removeEventListener('modelClickEnd', handleModelClickEnd);
      window.removeEventListener('mouseup', handleModelClickEnd);
      window.removeEventListener('mouseleave', handleModelClickEnd);
    };
  }, [setClickingOnModel]);

  // Camera view effect
  useEffect(() => {
    // Guarded: avoid touching controls ref to prevent drei null checks during re-render
    if (!cameraView) return;
    // If needed later, switch camera view via an in-canvas helper using useThree()
  }, [cameraView, controlsTarget, controlsDistance]);

  return (
    <>
      <ResponsiveLayout>
        <div ref={wrapRef} className={`canvas-wrap ${drawingActive ? 'drawing' : ''}`}>
          <Canvas 
            shadows 
            camera={{ position: [0.6, 0.9, 1.6], fov: 45 }} 
            dpr={[1,2]} 
            gl={{ powerPreference: 'high-performance', antialias: true }}
            onPointerDown={(e) => {
              // Handle clicks outside the model for camera controls
              const activeTool = useApp.getState().activeTool;
              const continuousDrawingTools = ['brush', 'eraser', 'puffPrint', 'embroidery', 'fill'];
              
              if (continuousDrawingTools.includes(activeTool)) {
                // For Canvas-level events, we assume clicks are outside the model
                // since the ShirtRenderer handles clicks on the model
                console.log('🎨 Canvas: Click detected - enabling controls for camera movement with tool:', activeTool);
                console.log('🎨 Canvas: Current controlsEnabled state before enabling:', useApp.getState().controlsEnabled);
                
                // Force immediate state update
                useApp.setState({ controlsEnabled: true });
                
                // Also call the setter function for consistency
                useApp.getState().setControlsEnabled(true);
                
                // Signal to ShirtRefactored that user manually enabled controls
                // This prevents the useEffect from overriding the manual control enabling
                window.dispatchEvent(new CustomEvent('userManuallyEnabledControls', {
                  detail: { tool: activeTool, enabled: true }
                }));
                
                console.log('🎨 Canvas: Controls enabled, new state:', useApp.getState().controlsEnabled);
                console.log('🎨 Canvas: Manual control flag set for tool:', activeTool);
                
                // Force OrbitControls to re-evaluate by triggering a small delay
                setTimeout(() => {
                  console.log('🎨 Canvas: After delay - controlsEnabled state:', useApp.getState().controlsEnabled);
                }, 10);
              }
            }}
          >
            <color attach="background" args={[0.06,0.07,0.09]} />
            <ShirtRefactored
              showDebugInfo={process.env.NODE_ENV === 'development'}
              enableBrushPainting={true}
            />
            <Grid position={[0,0,0]} infiniteGrid={false} args={[50, 50]} cellSize={0.1} cellThickness={0.6} sectionSize={1} sectionThickness={1.4} sectionColor="#64748b" cellColor="#334155" fadeDistance={0} />
            <axesHelper args={[2]} />
            <Html position={[0,0,0]} center style={{ pointerEvents: 'none' }}>
              <div style={{ width: 12, height: 12, borderRadius: 999, background: '#eab308', boxShadow: '0 0 8px rgba(234,179,8,0.9), 0 0 1px #000 inset' }} />
            </Html>
            <BackgroundScene
              backgroundType={useApp(s => s.backgroundScene)}
              intensity={useApp(s => s.backgroundIntensity)}
              rotation={useApp(s => s.backgroundRotation)}
            />
            <OrbitControls
              key={`orbit-controls-${useApp(s => s.controlsEnabled)}`} // PERFORMANCE FIX: Only re-render when controlsEnabled changes
              // Enhanced orbital controls that work properly with all tools
              enablePan={useApp(s => s.controlsEnabled)}
              enableZoom={true} // Always enable zoom - users need to zoom while drawing
              enableRotate={useApp(s => s.controlsEnabled)}
              zoomToCursor={true}
              enabled={true} // Always enabled - we'll control behavior via mouse buttons
              minDistance={useApp(s=> {
                const h = (s as any).modelBoundsHeight || (s.controlsDistance ?? 1);
                const scale = (s as any).modelScale || 1;
                const minDim = (s as any).modelMinDimension || h * 0.1;
                return Math.max(0.1, Math.min(h * scale * 0.1, minDim * scale * 0.1));
              })}
              maxDistance={useApp(s=> Math.max(5, (s.controlsDistance ?? 1) * 100))}
              target={[0, 0, 0]}
              dampingFactor={0.05}
              enableDamping={true}
              screenSpacePanning={false}
              mouseButtons={useMemo(() => {
                const controlsEnabled = useApp.getState().controlsEnabled;
                return {
                  LEFT: controlsEnabled ? THREE.MOUSE.ROTATE : undefined,
                  MIDDLE: THREE.MOUSE.DOLLY, // Always allow zoom with middle mouse
                  RIGHT: controlsEnabled ? THREE.MOUSE.PAN : THREE.MOUSE.DOLLY
                };
              }, [useApp(s => s.controlsEnabled)])}
              touches={useMemo(() => {
                const controlsEnabled = useApp.getState().controlsEnabled;
                return {
                  ONE: controlsEnabled ? THREE.TOUCH.ROTATE : THREE.TOUCH.DOLLY_PAN,
                  TWO: THREE.TOUCH.DOLLY_PAN
                };
              }, [useApp(s => s.controlsEnabled)])}
            />
            <GizmoHelper alignment="bottom-right" margin={[60,60]}>
              <GizmoViewport axisColors={["#ef4444","#22c55e","#60a5fa"]} labelColor="#e5e7eb" />
            </GizmoHelper>
          </Canvas>
          {useApp(s => s.vectorMode) && (
            <VectorEditorOverlay wrapRef={wrapRef} />
          )}
          {useApp(s => s.selectedLayerV2) && (
            <TransformGizmo 
              layerId={useApp.getState().selectedLayerV2!} 
              onTransformChange={(transform: any) => {
                const { selectedLayerV2, updateLayerV2 } = useApp.getState();
                if (selectedLayerV2) {
                  updateLayerV2(selectedLayerV2, { transform: { ...transform } });
                }
              }}
            />
          )}
          <CursorManager wrapRef={wrapRef} drawingActive={drawingActive} />
          <ToolRouter active={true} />
          <AdvancedPuffPrintTool
            active={useApp(s => s.activeTool === 'puffPrint')}
            onError={(error) => console.error('Puff Print Error:', error)}
          />
          <AdvancedPuffPrintManager />
                </div>
      </ResponsiveLayout>

      <ModelManager 
          isOpen={useApp(s => s.modelManagerOpen)} 
          onClose={useApp(s => s.closeModelManager)} 
        />
      <BackgroundManager />

      {/* Removed puff vector prompt - puff print and embroidery now work with vector paths */}
      {false && showPuffVectorPrompt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.78)', backdropFilter: 'blur(6px)', zIndex: 999999999 }}>
          <div style={{ maxWidth: 420, margin: '12vh auto 0', background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', borderRadius: '18px', padding: '32px 28px', boxShadow: '0 40px 80px rgba(15, 23, 42, 0.55)', border: '1px solid rgba(148, 163, 184, 0.22)', position: 'relative' }}>
            <button
              onClick={handleClosePuffPrompt}
              aria-label="Close puff/vector prompt"
              style={{ position: 'absolute', top: 18, right: 18, background: 'rgba(148, 163, 184, 0.12)', border: '1px solid rgba(148, 163, 184, 0.28)', color: '#cbd5f5', width: 32, height: 32, borderRadius: '8px', cursor: 'pointer', fontSize: 16, fontWeight: 600 }}
            >
              ×
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                <div style={{ width: 56, height: 56, borderRadius: '20px', background: 'linear-gradient(135deg, #f97316 0%, #facc15 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a', fontSize: 28, fontWeight: 700, boxShadow: '0 18px 35px rgba(250, 204, 21, 0.35)' }}>
                  ⚠️
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#e2e8f0' }}>Vector paths & puff print</h2>
                  <p style={{ margin: '10px 0 0', fontSize: 15, lineHeight: 1.6, color: '#cbd5f5' }}>{puffVectorPromptMessage}</p>
                </div>
              </div>
              <ul style={{ margin: '0 0 8px', paddingLeft: 22, color: '#94a3b8', fontSize: 14, lineHeight: 1.6 }}>
                <li>Vector mode is designed for precise path editing on the overlay.</li>
                <li>Puff print brushes render directly to the garment texture.</li>
                <li>Switch tools or exit vector mode before returning to puff print.</li>
              </ul>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <button
                  onClick={handleSwitchToPuff}
                  style={{ flex: '1 1 180px', padding: '12px 18px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)', color: '#ffffff', fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 18px 40px rgba(236, 72, 153, 0.35)' }}
                >
                  Switch to Puff Brush
                </button>
                <button
                  onClick={handleClosePuffPrompt}
                  style={{ flex: '1 1 170px', padding: '12px 18px', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.35)', background: 'rgba(148, 163, 184, 0.12)', color: '#e2e8f0', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                >
                  Keep Editing Vectors
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CursorManager({ wrapRef, drawingActive }: { wrapRef: React.RefObject<HTMLDivElement>; drawingActive: boolean }) {
  const tool = useApp(s => s.activeTool);
  const vectorMode = useApp(s => s.vectorMode);
  const brushSize = useApp(s => s.brushSize);
  const puffBrushSize = useApp(s => s.puffBrushSize);
  const textSize = useApp(s => s.textSize);
  const shapeSize = useApp(s => s.shapeSize);
  const shape = useApp(s => s.brushShape);
  const angle = useApp(s => s.cursorAngle);
  const [pos, setPos] = useState<{x:number;y:number}>({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  // Track current vector subtool from the vector store
  const [vectorTool, setVectorTool] = useState<string>(vectorStore.getState().tool);
  useEffect(() => {
    const unsub = vectorStore.subscribe(state => setVectorTool(state.tool));
    return () => unsub();
  }, []);
  
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setVisible(true);
    };
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(drawingActive);
    
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('mouseenter', onEnter);
    
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('mouseenter', onEnter);
    };
  }, [wrapRef, drawingActive, tool, vectorMode, vectorTool]);
  
  useEffect(() => { 
    if (!drawingActive) setVisible(false); 
  }, [drawingActive]);
  
  // Determine the correct size based on the active tool
  const getToolSize = () => {
    switch (tool) {
      case 'brush':
      case 'eraser':
      case 'smudge':
      case 'blur':
      case 'fill':
        return brushSize;
      case 'puffPrint':
        return puffBrushSize;
      case 'text':
        return textSize;
      case 'shapes':
        return shapeSize;
      case 'embroidery':
        return brushSize; // Use brush size for embroidery
      default:
        return brushSize;
    }
  };

  const size = getToolSize();

  // When vector mode is enabled, reflect the current vector subtool in the overlay
  const overlayTool = vectorMode ? (vectorTool as any) : (tool as any);
  return <CursorOverlay x={pos.x} y={pos.y} visible={visible} tool={overlayTool} size={size} shape={shape} angle={angle} />;
}

export default App;
