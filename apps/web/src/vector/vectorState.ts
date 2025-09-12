// Import types from VectorStateManager to avoid conflicts
import { VectorPoint, VectorPath, VectorShape, VectorTool, BoundingBox } from './VectorStateManager';

// Re-export types for backward compatibility
export type { VectorPoint, VectorPath, VectorShape, VectorTool, BoundingBox };

// Vector State Interface
export interface VectorState {
  shapes: VectorShape[];
  currentPath: VectorPath | null;
  selected: string[];
  tool: VectorTool;
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
}

// Vector Actions
export type VectorAction = 
  | { type: 'ADD_SHAPE'; payload: VectorShape }
  | { type: 'UPDATE_SHAPE'; payload: { id: string; shape: VectorShape } }
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
}));

// Helper functions
export const vectorActions = {
  addShape: (shape: VectorShape) => {
    const state = vectorStore.getState();
    const newShapes = [...state.shapes, shape];
    vectorStore.setState({ shapes: newShapes });
  },
  
  updateShape: (id: string, shape: VectorShape) => {
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
    });
  }
};

