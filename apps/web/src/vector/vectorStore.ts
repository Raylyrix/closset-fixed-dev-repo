// Minimal vectorStore shim to satisfy UI imports. Replace with real store as needed.
export type VectorUIState = {
  showGrid: boolean;
  showGuides: boolean;
  zoom: number;
  // Common vector fields used across UI/integration
  shapes: any[];
  currentPath: any | null;
  selected: string[];
  tool?: string;
};

const state: VectorUIState = {
  showGrid: true,
  showGuides: true,
  zoom: 1,
  shapes: [],
  currentPath: null,
  selected: [],
};

const listeners: Set<() => void> = new Set();

export const vectorStore = {
  getState(): VectorUIState {
    return { ...state };
  },
  setState(partial: Partial<VectorUIState> | ((s: VectorUIState) => Partial<VectorUIState>)) {
    const update = typeof partial === 'function' ? partial({ ...state }) : partial;
    Object.assign(state, update);
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
