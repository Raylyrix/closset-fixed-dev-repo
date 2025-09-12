// Create the store using Zustand
import { create } from 'zustand';
export const vectorStore = create((set, get) => ({
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
    addShape: (shape) => {
        const state = vectorStore.getState();
        const newShapes = [...state.shapes, shape];
        vectorStore.setState({ shapes: newShapes });
    },
    updateShape: (id, shape) => {
        const state = vectorStore.getState();
        const newShapes = state.shapes.map(s => s.id === id ? shape : s);
        vectorStore.setState({ shapes: newShapes });
    },
    removeShape: (id) => {
        const state = vectorStore.getState();
        const newShapes = state.shapes.filter(s => s.id !== id);
        vectorStore.setState({ shapes: newShapes });
    },
    setCurrentPath: (path) => {
        vectorStore.setState({ currentPath: path });
    },
    setTool: (tool) => {
        vectorStore.setState({ tool });
    },
    setSelected: (selected) => {
        vectorStore.setState({ selected });
    },
    setDrawing: (isDrawing) => {
        vectorStore.setState({ isDrawing });
    },
    setEditing: (isEditing) => {
        vectorStore.setState({ isEditing });
    },
    setShowAnchors: (showAnchors) => {
        vectorStore.setState({ showAnchors });
    },
    setShowHandles: (showHandles) => {
        vectorStore.setState({ showHandles });
    },
    setSnapToGrid: (snapToGrid) => {
        vectorStore.setState({ snapToGrid });
    },
    setGridSize: (gridSize) => {
        vectorStore.setState({ gridSize });
    },
    setZoom: (zoom) => {
        vectorStore.setState({ zoom });
    },
    setPan: (pan) => {
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
