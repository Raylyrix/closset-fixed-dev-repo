export type VectorPoint = {
  x: number;
  y: number;
  type: 'corner' | 'smooth' | 'symmetric' | 'auto';
  controlIn?: { x: number; y: number };
  controlOut?: { x: number; y: number };
  selected?: boolean;
  locked?: boolean;
};

export type VectorPath = {
  id: string;
  points: VectorPoint[];
  closed: boolean;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  fill: boolean;
  stroke: boolean;
};

export type VectorShape = {
  id: string;
  type: 'path';
  path: VectorPath;
  bounds: { x: number; y: number; width: number; height: number };
  tool?: string; // Store the tool used to create this shape
};

export type VectorTool = 
  | 'pen' 
  | 'pathSelection' 
  | 'addAnchor' 
  | 'removeAnchor' 
  | 'convertAnchor' 
  | 'curvature' 
  | 'pathOperations' 
  | 'shapeBuilder'
  | 'marqueeRect'
  | 'marqueeEllipse'
  | 'lasso'
  | 'polygonLasso'
  | 'magneticLasso'
  | 'magicWand'
  | 'transform'
  | 'scale'
  | 'rotate'
  | 'skew'
  | 'perspective';

export type VectorState = {
  shapes: VectorShape[];
  selected: string[];
  currentPath: VectorPath | null;
  tool: VectorTool;
};

const listeners = new Set<() => void>();

const state: VectorState = {
  shapes: [],
  selected: [],
  currentPath: null,
  tool: 'pen',
};

export const vectorStore = {
  getState(): VectorState { return { ...state }; },
  set<K extends keyof VectorState>(key: K, value: VectorState[K]) {
    // Validate input
    if (key === 'shapes' && !Array.isArray(value)) {
      console.error('Invalid shapes value:', value);
      return;
    }
    if (key === 'selected' && !Array.isArray(value)) {
      console.error('Invalid selected value:', value);
      return;
    }
    if (key === 'tool' && !['pen', 'pathSelection', 'addAnchor', 'removeAnchor', 'convertAnchor', 'curvature', 'pathOperations', 'shapeBuilder'].includes(value as string)) {
      console.error('Invalid tool value:', value);
      return;
    }
    
    // Create new state object to avoid mutation issues
    const newState = { ...state, [key]: value };
    Object.assign(state, newState);
    
    // Notify listeners
    listeners.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.error('Error in vector store listener:', error);
      }
    });
  },
  setAll(next: Partial<VectorState>) {
    // Validate all values
    const validatedNext = { ...next };
    if (validatedNext.shapes && !Array.isArray(validatedNext.shapes)) {
      console.error('Invalid shapes in setAll:', validatedNext.shapes);
      delete validatedNext.shapes;
    }
    if (validatedNext.selected && !Array.isArray(validatedNext.selected)) {
      console.error('Invalid selected in setAll:', validatedNext.selected);
      delete validatedNext.selected;
    }
    
    Object.assign(state, validatedNext);
    listeners.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.error('Error in vector store listener:', error);
      }
    });
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  // Add cleanup method
  cleanup() {
    listeners.clear();
  }
};
