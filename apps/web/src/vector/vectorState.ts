// Import types from VectorStateManager to avoid conflicts
import { VectorPoint, VectorPath, VectorTool, BoundingBox } from './VectorStateManager';

// Re-export types for backward compatibility
export type { VectorPoint, VectorPath, VectorTool, BoundingBox };

// Vector State Interface
export interface VectorState {
  shapes: VectorPath[];
  currentPath: VectorPath | null;
  selected: string[];
  tool: VectorTool;
  // Anchor currently being dragged (UV anchor selection)
  draggingAnchor?: { shapeId: string; pointIndex: number } | null;
  isDrawing: boolean;
  isEditing: boolean;
  showAnchors: boolean;
  showHandles: boolean;
  snapToGrid: boolean;
  gridSize: number;
  zoom: number;
  pan: { x: number; y: number };
  history: VectorState[];
  historyIndex: number;
  maxHistorySize: number;
  // Preview and ops
  previewShape?: VectorPath | null;
  booleanOp?: 'union' | 'intersect' | 'difference' | 'exclusion' | null;
  offsetConfig?: { radius: number; join: 'miter' | 'round' | 'bevel'; miterLimit: number } | null;
  simplifyTolerance?: number | null;
}

// Vector Actions
export type VectorAction = 
  | { type: 'ADD_SHAPE'; payload: VectorPath }
  | { type: 'UPDATE_SHAPE'; payload: { id: string; shape: VectorPath } }
  | { type: 'REMOVE_SHAPE'; payload: string }
  | { type: 'SET_CURRENT_PATH'; payload: VectorPath | null }
  | { type: 'SET_TOOL'; payload: VectorTool }
  | { type: 'SET_SELECTED'; payload: string[] }
  | { type: 'SET_DRAWING'; payload: boolean }
  | { type: 'SET_EDITING'; payload: boolean }
  | { type: 'SET_SHOW_ANCHORS'; payload: boolean }
  | { type: 'SET_SHOW_HANDLES'; payload: boolean }
  | { type: 'SET_SNAP_TO_GRID'; payload: boolean }
  | { type: 'SET_GRID_SIZE'; payload: number }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_PAN'; payload: { x: number; y: number } }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'RESET_STATE' };

// Create the store using Zustand
import { create } from 'zustand';

export const vectorStore = create<VectorState>((set, get) => ({
  shapes: [],
  currentPath: null,
  selected: [],
  tool: 'pen',
  draggingAnchor: null,
  isDrawing: false,
  isEditing: false,
  showAnchors: true,
  showHandles: true,
  snapToGrid: false,
  gridSize: 10,
  zoom: 1,
  pan: { x: 0, y: 0 },
  history: [],
  historyIndex: -1,
  maxHistorySize: 50,
  previewShape: null,
  booleanOp: null,
  offsetConfig: null,
  simplifyTolerance: null,
}));

// Helper functions
export const vectorActions = {
  addShape: (shape: VectorPath) => {
    const state = vectorStore.getState();
    const newShapes = [...state.shapes, shape];
    vectorStore.setState({ shapes: newShapes });
  },
  
  updateShape: (id: string, shape: VectorPath) => {
    const state = vectorStore.getState();
    const newShapes = state.shapes.map(s => s.id === id ? shape : s);
    vectorStore.setState({ shapes: newShapes });
  },
  
  removeShape: (id: string) => {
    const state = vectorStore.getState();
    const newShapes = state.shapes.filter(s => s.id !== id);
    vectorStore.setState({ shapes: newShapes });
  },
  
  setCurrentPath: (path: VectorPath | null) => {
    vectorStore.setState({ currentPath: path });
  },
  
  setTool: (tool: VectorTool) => {
    vectorStore.setState({ tool });
  },
  
  setSelected: (selected: string[]) => {
    vectorStore.setState({ selected });
  },
  
  setDrawing: (isDrawing: boolean) => {
    vectorStore.setState({ isDrawing });
  },
  
  setEditing: (isEditing: boolean) => {
    vectorStore.setState({ isEditing });
  },
  
  setShowAnchors: (showAnchors: boolean) => {
    vectorStore.setState({ showAnchors });
  },
  
  setShowHandles: (showHandles: boolean) => {
    vectorStore.setState({ showHandles });
  },
  
  setSnapToGrid: (snapToGrid: boolean) => {
    vectorStore.setState({ snapToGrid });
  },
  
  setGridSize: (gridSize: number) => {
    vectorStore.setState({ gridSize });
  },
  
  setZoom: (zoom: number) => {
    vectorStore.setState({ zoom });
  },
  
  setPan: (pan: { x: number; y: number }) => {
    vectorStore.setState({ pan });
  },
  
  undo: () => {
    const state = vectorStore.getState();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      const newState = state.history[newIndex];
      vectorStore.setState({ ...newState, historyIndex: newIndex });
    }
  },
  
  redo: () => {
    const state = vectorStore.getState();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      const newState = state.history[newIndex];
      vectorStore.setState({ ...newState, historyIndex: newIndex });
    }
  },
  
  clearHistory: () => {
    vectorStore.setState({ history: [], historyIndex: -1 });
  },
  
  resetState: () => {
    vectorStore.setState({
      shapes: [],
      currentPath: null,
      selected: [],
      tool: 'pen',
      draggingAnchor: null,
      isDrawing: false,
      isEditing: false,
      showAnchors: true,
      showHandles: true,
      snapToGrid: false,
      gridSize: 10,
      zoom: 1,
      pan: { x: 0, y: 0 },
      history: [],
      historyIndex: -1,
      previewShape: null,
      booleanOp: null,
      offsetConfig: null,
      simplifyTolerance: null,
    });
  },
  // Preview ops
  setBooleanOp: (op: 'union' | 'intersect' | 'difference' | 'exclusion' | null) => {
    vectorStore.setState({ booleanOp: op });
  },
  setOffsetConfig: (cfg: { radius: number; join: 'miter' | 'round' | 'bevel'; miterLimit: number } | null) => {
    vectorStore.setState({ offsetConfig: cfg });
  },
  setSimplifyTolerance: (tol: number | null) => {
    vectorStore.setState({ simplifyTolerance: tol });
  },
  setPreviewShape: (shape: VectorPath | null) => {
    vectorStore.setState({ previewShape: shape });
  },
  applyPreview: () => {
    const state = vectorStore.getState();
    if (!state.previewShape) return;
    // Replace selected shapes with preview result
    const remaining = state.shapes.filter(s => !state.selected.includes(s.id));
    const merged = [...remaining, state.previewShape];
    vectorStore.setState({ shapes: merged, previewShape: null, booleanOp: null });
  },
  clearPreview: () => {
    vectorStore.setState({ previewShape: null });
  },
  setDraggingAnchor: (payload: { shapeId: string; pointIndex: number } | null) => {
    vectorStore.setState({ draggingAnchor: payload });
  }
} as any;
