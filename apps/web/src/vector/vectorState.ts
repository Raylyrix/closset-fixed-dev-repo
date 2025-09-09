export type VectorPoint = {
  x: number;
  y: number;
  type: 'corner' | 'smooth' | 'symmetric';
  controlIn?: { x: number; y: number };
  controlOut?: { x: number; y: number };
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
};

export type VectorTool = 'pen' | 'pathSelection' | 'addAnchor' | 'removeAnchor' | 'convertAnchor' | 'curvature' | 'pathOperations' | 'shapeBuilder';

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
  getState(): VectorState { return state; },
  set<K extends keyof VectorState>(key: K, value: VectorState[K]) {
    // @ts-expect-error intentional mutation for simple store
    state[key] = value;
    listeners.forEach(fn => fn());
  },
  setAll(next: Partial<VectorState>) {
    Object.assign(state, next);
    listeners.forEach(fn => fn());
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }
};
