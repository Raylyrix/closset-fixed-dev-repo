import { useEffect, useState, useRef } from 'react';
import { create } from 'zustand';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, GizmoHelper, GizmoViewport, Grid, Html } from '@react-three/drei';
import * as THREE from 'three';
import localforage from 'localforage';
import LZString from 'lz-string';
import { Shirt } from './three/Shirt';
import { Toolbar } from './components/Toolbar';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { Section } from './components/Section';
import { CustomSelect } from './components/CustomSelect';
import { ModelManager } from './components/ModelManager';
import { BackgroundManager } from './components/BackgroundManager';
import { BackgroundScene } from './components/BackgroundScene';
import { CursorOverlay } from './components/CursorOverlay';
import { MainLayout } from './components/MainLayout';
import { ToolRouter } from './components/ToolRouter';
import { EmbroideryStitch, EmbroideryPattern } from './services/embroideryService';

type Tool =
  | 'brush' | 'eraser' | 'fill' | 'picker' | 'smudge' | 'blur' | 'select' | 'transform' | 'move' | 'text'
  | 'decals' | 'layers' | 'puffPrint' | 'patternMaker' | 'advancedSelection' | 'vectorTools' | 'aiAssistant'
  | 'printExport' | 'cloudSync' | 'layerEffects' | 'colorGrading' | 'animation' | 'templates' | 'batch'
  | 'advancedBrush' | 'meshDeformation' | 'proceduralGenerator' | '3dPainting' | 'smartFill'
  | 'line' | 'rect' | 'ellipse' | 'gradient' | 'moveText' | 'selectText' | 'undo' | 'redo' | 'embroidery';

type Layer = { id: string; name: string; visible: boolean; canvas: HTMLCanvasElement; history: ImageData[]; future: ImageData[]; lockTransparent?: boolean; mask?: HTMLCanvasElement | null };

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

interface AppState {
  // Tools
  activeTool: Tool;
  setTool: (tool: Tool) => void;
  vectorMode: boolean;
  setVectorMode: (enabled: boolean) => void;
  
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
  modelType: string;
  modelScene: THREE.Group | null;
  modelBoundsHeight: number;
  modelMinDimension: number;
  
  // Shape settings
  shapeMode: 'fill' | 'stroke' | 'both';
  shapeStrokeWidth: number;
  
  // Puff Print settings
  puffBrushSize: number;
  puffBrushOpacity: number;
  puffHeight: number;
  puffCurvature: number;
  puffShape: 'cube' | 'sphere' | 'cylinder' | 'pipe';
  puffColor: string;
  
  // Embroidery settings
  embroideryStitches: EmbroideryStitch[];
  embroideryPattern: EmbroideryPattern | null;
  embroideryThreadType: 'cotton' | 'polyester' | 'silk' | 'metallic' | 'glow';
  embroideryThickness: number;
  embroideryOpacity: number;
  embroideryColor: string;
  embroideryStitchType: 'satin' | 'fill' | 'outline' | 'cross-stitch' | 'chain' | 'backstitch';
  embroideryPatternDescription: string;
  embroideryAIEnabled: boolean;
  
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
  setSymmetryAngle: (angle: number) => void;
  setBlendMode: (mode: GlobalCompositeOperation) => void;
  setCursorAngle: (angle: number) => void;
  setFillTolerance: (tolerance: number) => void;
  setFillGrow: (grow: number) => void;
  setFillAntiAlias: (antiAlias: boolean) => void;
  setFillContiguous: (contiguous: boolean) => void;
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
  setLeftPanelOpen: (open: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
  setModelManagerOpen: (open: boolean) => void;
  openModelManager: () => void;
  closeModelManager: () => void;
  setControlsEnabled: (enabled: boolean) => void;
  setControlsTarget: (target: [number, number, number]) => void;
  setControlsDistance: (distance: number) => void;
  
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
  setEmbroideryStitchType: (type: 'satin' | 'fill' | 'outline' | 'cross-stitch' | 'chain' | 'backstitch') => void;
  setEmbroideryPatternDescription: (description: string) => void;
  setEmbroideryAIEnabled: (enabled: boolean) => void;
  
  undo: () => void;
  redo: () => void;
  
  // Additional missing methods
  selectTextElement: (id: string | null) => void;
  removeTextElement: (id: string) => void;
  setModelChoice: (choice: 'tshirt' | 'sphere') => void;
  setModelType: (type: string) => void;
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
  addLayer?: (name?: string) => string;
  deleteLayer?: (id: string) => void;
  duplicateLayer?: (id: string) => string;
  reorderLayers?: (from: number, to: number) => void;
  mergeDown?: (id: string) => void;
  selectActiveLayerContent?: () => void;
  saveCheckpoint: (name?: string) => Promise<CheckpointMeta>;
  loadCheckpoint: (id: string) => Promise<void>;
  listCheckpoints: () => Promise<CheckpointMeta[]>;
  deleteCheckpoint: (id: string) => Promise<void>;
  initCanvases: (w: number, h: number) => void;
  getActiveLayer: () => Layer | null;
  composeLayers: () => void;
  commit: () => void;
  setBaseTexture: (texture: HTMLImageElement | null) => void;
  generateBaseLayer: () => void;
  addDecalFromFile: (file: File) => Promise<string>;
  forceRerender: () => void;
}

export const useApp = create<AppState>((set, get) => ({
  // Default state
  activeTool: 'brush',
  setTool: (tool: Tool) => set({ activeTool: tool }),
  vectorMode: false,
  setVectorMode: (enabled: boolean) => set({ vectorMode: enabled }),
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
  modelUrl: null,
  modelPosition: [0, 0, 0],
  modelRotation: [0, 0, 0],
  modelScale: 1,
  modelChoice: 'tshirt',
  modelType: 'tshirt',
  modelScene: null,
  modelBoundsHeight: 0,
  modelMinDimension: 0,
  shapeMode: 'fill',
  shapeStrokeWidth: 2,
  
  // Puff Print defaults
  puffBrushSize: 20,
  puffBrushOpacity: 1.0,
  puffHeight: 2.0,
  puffCurvature: 0.8,
  puffShape: 'sphere',
  puffColor: '#ff69b4',
  
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
  layers: [],
  activeLayerId: null,
  composedCanvas: null,
  composedVersion: 0,
  baseTexture: null,
  decals: [],
  activeDecalId: null,
  textSize: 24,
  textFont: 'Arial',
  textColor: '#000000',
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
  setSymmetryAngle: (angle) => set({ symmetryAngle: angle }),
  setBlendMode: (mode) => set({ blendMode: mode }),
  setCursorAngle: (angle) => set({ cursorAngle: angle }),
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
  setLeftPanelOpen: (open) => set({ leftPanelOpen: open }),
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
  setModelManagerOpen: (open) => set({ modelManagerOpen: open }),
  openModelManager: () => set({ modelManagerOpen: true }),
  closeModelManager: () => set({ modelManagerOpen: false }),
  setControlsEnabled: (enabled) => set({ controlsEnabled: enabled }),
  setControlsTarget: (target) => set({ controlsTarget: target }),
  setControlsDistance: (distance) => set({ controlsDistance: distance }),
  
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
  setPuffCurvature: (curvature) => set({ puffCurvature: curvature }),
  setPuffShape: (shape) => set({ puffShape: shape }),
  setPuffColor: (color) => set({ puffColor: color }),
  
  // Embroidery setters
  setEmbroideryStitches: (stitches) => set({ embroideryStitches: stitches }),
  setEmbroideryPattern: (pattern) => set({ embroideryPattern: pattern }),
  setEmbroideryThreadType: (type) => set({ embroideryThreadType: type }),
  setEmbroideryThickness: (thickness) => set({ embroideryThickness: thickness }),
  setEmbroideryOpacity: (opacity) => set({ embroideryOpacity: opacity }),
  setEmbroideryColor: (color) => set({ embroideryColor: color }),
  setEmbroideryStitchType: (type) => set({ embroideryStitchType: type }),
  setEmbroideryPatternDescription: (description) => set({ embroideryPatternDescription: description }),
  setEmbroideryAIEnabled: (enabled) => set({ embroideryAIEnabled: enabled }),
  
  undo: () => {
    const layer = get().getActiveLayer();
    if (!layer || layer.history.length === 0) return;
    const current = layer.canvas.getContext('2d')!.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
    layer.future.unshift(current);
    const prev = layer.history.pop()!;
    layer.canvas.getContext('2d')!.putImageData(prev, 0, 0);
    get().composeLayers();
  },
  
  redo: () => {
    const layer = get().getActiveLayer();
    if (!layer || layer.future.length === 0) return;
    const current = layer.canvas.getContext('2d')!.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
    layer.history.push(current);
    const next = layer.future.shift()!;
    layer.canvas.getContext('2d')!.putImageData(next, 0, 0);
    get().composeLayers();
  },

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
    const textElement: TextElement = {
      id, text, x: 0, y: 0, u: uv.u, v: uv.v,
      fontSize: get().textSize, fontFamily: get().textFont,
      bold: get().textBold, italic: get().textItalic,
      underline: false, strikethrough: false,
      align: get().textAlign, color: get().textColor,
      opacity: 1, rotation: 0, letterSpacing: 0, lineHeight: 1.2,
      shadow: { blur: 0, offsetX: 0, offsetY: 0, color: '#000000' },
      textCase: 'none',
      layerId: get().activeLayerId || undefined
    };
    set(state => ({ textElements: [...state.textElements, textElement] }));
    get().composeLayers();
    return id;
  },

  updateTextElement: (id: string, patch: Partial<TextElement>) => {
    set(state => ({ textElements: state.textElements.map(t => t.id === id ? { ...t, ...patch } : t) }));
    get().composeLayers();
  },

  deleteTextElement: (id: string) => {
    set(state => ({ textElements: state.textElements.filter(t => t.id !== id) }));
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
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, width, height);
    const id = Math.random().toString(36).slice(2);
    const layer: Layer = { id, name: name || `Layer ${id.slice(0, 4)}`, visible: true, canvas, history: [], future: [] };
    set(state => ({ layers: [...state.layers, layer], activeLayerId: id }));
    return id;
  },

  initCanvases: (w, h) => {
    const base = document.createElement('canvas');
    base.width = w; base.height = h;
    const composed = document.createElement('canvas');
    composed.width = w; composed.height = h;
    const paint = document.createElement('canvas');
    paint.width = w; paint.height = h;
    const layers = [
      { id: 'paint', name: 'Paint', visible: true, canvas: paint, history: [], future: [] }
    ];
    console.log('App: Initializing canvases with size:', w, 'x', h);
    set({ layers, activeLayerId: 'paint', composedCanvas: composed });
    console.log('App: composedCanvas set, current store state:', {
      modelScene: !!get().modelScene,
      composedCanvas: !!get().composedCanvas
    });
    get().composeLayers();
  },

  getActiveLayer: () => {
    const { layers, activeLayerId } = get();
    return layers.find(l => l.id === activeLayerId) || null;
  },

  composeLayers: () => {
    try {
      const { layers, composedCanvas, decals, textElements, activeLayerId, baseTexture, activeTool } = get();
      if (!composedCanvas) {
        console.warn('No composed canvas available for layer composition');
        return;
      }
      
      console.log('🎨 Composing layers', {
        layersCount: layers.length,
        textElementsCount: textElements.length,
        composedCanvasSize: `${composedCanvas.width}x${composedCanvas.height}`,
        activeTool
      });
    
      // Early exit if no content to compose
      if (layers.length === 0 && decals.length === 0 && textElements.length === 0 && !baseTexture) {
        return;
      }
    
      const ctx = composedCanvas.getContext('2d', { 
        willReadFrequently: true,
        alpha: true,
        desynchronized: false
      })!;
      
      // Enable high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
    ctx.clearRect(0, 0, composedCanvas.width, composedCanvas.height);
    
    // Draw base texture first (bottom layer)
    if (baseTexture) {
      console.log('Drawing base texture to composed canvas');
      ctx.drawImage(baseTexture, 0, 0, composedCanvas.width, composedCanvas.height);
    } else {
      console.log('No base texture available');
    }
    
      // Draw layers and their associated elements
    for (const layer of layers) {
      if (!layer.visible) continue;
        
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
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
    
      // Draw text elements for this layer
      for (const textEl of textElements) {
        if (textEl.layerId !== layer.id) continue;
        try {
          const x = Math.round(textEl.u * composedCanvas.width);
          const y = Math.round(textEl.v * composedCanvas.height);
          
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
            
            // Draw outline if enabled
            if (textEl.outline && textEl.outline.width > 0) {
              ctx.strokeStyle = textEl.outline.color;
              ctx.lineWidth = textEl.outline.width;
              ctx.strokeText(line, 0, yPos);
            }
            
            // Draw main text
            if (textEl.gradient) {
              // Create gradient
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
            
            ctx.fillText(line, 0, yPos);
            
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
    
    // Increment version to trigger re-render
    set(state => ({ composedVersion: state.composedVersion + 1 }));
    console.log('🎨 Layer composition complete', { version: get().composedVersion });
    } catch (error) {
      console.error('🎨 Error in composeLayers:', error);
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
      console.error('Error in forceRerender:', error);
    }
  },

  setBaseTexture: (texture) => set({ baseTexture: texture }),
  generateBaseLayer: () => {
    const { modelScene, composedCanvas } = get();
    if (!modelScene || !composedCanvas) {
      console.log('Cannot generate base layer: missing modelScene or composedCanvas');
      return;
    }

    console.log('Generating base layer from model...');
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
      layers.push({ id: lp.id, name: lp.name, visible: lp.visible, canvas, history: [], future: [] });
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

  // Additional missing methods
  selectTextElement: (id: string | null) => set({ activeTextId: id }),
  removeTextElement: (id: string) => {
    set(state => ({ textElements: state.textElements.filter(t => t.id !== id) }));
    get().composeLayers();
  },
  setModelChoice: (choice: 'tshirt' | 'sphere') => set({ modelChoice: choice }),
  setModelType: (type: string) => set({ modelType: type }),
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
  const drawingActive = ['brush','eraser','fill','picker','smudge','blur','select','transform','move','puffPrint'].includes(activeTool as any);
  const wrapRef = useRef<HTMLDivElement>(null);
  const controlsTarget = useApp(s => s.controlsTarget);
  const controlsDistance = useApp(s => s.controlsDistance);
  const cameraView = useApp(s => (s as any).cameraView || null);
  const controlsRef = useRef<any>(null);
  const decals = useApp(s => s.decals);
  const activeDecalId = useApp(s => s.activeDecalId);

  // Initialize canvases
  useEffect(() => {
    useApp.getState().initCanvases(2048, 2048);
  }, []);

  // Camera view effect
  useEffect(() => {
    if (!cameraView || !controlsRef.current) return;
    const controls = controlsRef.current;
    
    // Set camera position and target based on view
    switch (cameraView) {
      case 'front':
        controls.object.position.set(0, 0, controlsDistance);
        controls.target.set(...controlsTarget);
        break;
      case 'back':
        controls.object.position.set(0, 0, -controlsDistance);
        controls.target.set(...controlsTarget);
        break;
      case 'left':
        controls.object.position.set(-controlsDistance, 0, 0);
        controls.target.set(...controlsTarget);
        break;
      case 'right':
        controls.object.position.set(controlsDistance, 0, 0);
        controls.target.set(...controlsTarget);
        break;
      case 'top':
        controls.object.position.set(0, controlsDistance, 0);
        controls.target.set(...controlsTarget);
        break;
      case 'bottom':
        controls.object.position.set(0, -controlsDistance, 0);
        controls.target.set(...controlsTarget);
        break;
    }
    
    controls.update();
    useApp.setState({ cameraView: null } as any);
  }, [cameraView, controlsTarget, controlsDistance]);

  return (
    <>
      <MainLayout>
        <div ref={wrapRef} className={`canvas-wrap ${drawingActive ? 'drawing' : ''}`}>
          <Canvas shadows camera={{ position: [0.6, 0.9, 1.6], fov: 45 }} dpr={[1,2]} gl={{ powerPreference: 'high-performance', antialias: true }}>
            <color attach="background" args={[0.06,0.07,0.09]} />
            <group position={useApp(s=>s.modelPosition)} rotation={useApp(s=>s.modelRotation)} scale={useApp(s=>s.modelScale)}>
              <Shirt />
            </group>
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
              ref={controlsRef}
              enablePan
              enableZoom
              zoomToCursor
              enabled={useApp(s => s.controlsEnabled)}
              minDistance={useApp(s=> {
                const h = (s as any).modelBoundsHeight || (s.controlsDistance ?? 1);
                const scale = (s as any).modelScale || 1;
                const minDim = (s as any).modelMinDimension || h * 0.1;
                return Math.max(0.001, Math.min(h * scale * 0.001, minDim * scale * 0.01));
              })}
              maxDistance={useApp(s=> Math.max(2, (s.controlsDistance ?? 1) * 8))}
            />
            <GizmoHelper alignment="bottom-right" margin={[60,60]}>
              <GizmoViewport axisColors={["#ef4444","#22c55e","#60a5fa"]} labelColor="#e5e7eb" />
            </GizmoHelper>
          </Canvas>
          <CursorManager wrapRef={wrapRef} drawingActive={drawingActive} />
          <ToolRouter active={true} />
                </div>
      </MainLayout>
      
              <ModelManager 
          isOpen={useApp(s => s.modelManagerOpen)} 
          onClose={useApp(s => s.closeModelManager)} 
        />
        <BackgroundManager />
    </>
  );
}

function CursorManager({ wrapRef, drawingActive }: { wrapRef: React.RefObject<HTMLDivElement>; drawingActive: boolean }) {
  const tool = useApp(s => s.activeTool);
  const size = useApp(s => s.brushSize);
  const shape = useApp(s => s.brushShape);
  const angle = useApp(s => s.cursorAngle);
  const [pos, setPos] = useState<{x:number;y:number}>({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  
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
  }, [wrapRef, drawingActive, tool]);
  
  useEffect(() => { 
    if (!drawingActive) setVisible(false); 
  }, [drawingActive]);
  
  return <CursorOverlay x={pos.x} y={pos.y} visible={visible} tool={tool as any} size={size} shape={shape} angle={angle} />;
}
