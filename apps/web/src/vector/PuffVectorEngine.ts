export type VectorTool =
  | 'pen'
  | 'pathSelection'
  | 'addAnchor'
  | 'removeAnchor'
  | 'convertAnchor'
  | 'curvature'
  | 'pathOperations'
  | 'shapeBuilder'
  | 'select'
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'text'
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

export interface VectorUVPoint {
  u: number;
  v: number;
  inHandle?: { u: number; v: number } | null;
  outHandle?: { u: number; v: number } | null;
}

export interface VectorWorldPoint {
  x: number;
  y: number;
}

export interface VectorPathDraft {
  id: string;
  points: VectorUVPoint[];
  closed: boolean;
  tool: VectorTool;
  createdAt: number;
}

export interface VectorShape extends VectorPathDraft {
  worldPoints: VectorWorldPoint[];
  bounds: { x: number; y: number; width: number; height: number };
}

export interface PuffCommitOptions {
  width?: number;
  opacity?: number;
  color?: string;
}

export interface PuffVectorEngineState {
  tool: VectorTool;
  shapes: VectorShape[];
  draft: VectorPathDraft | null;
}

type EngineEvent =
  | 'state:changed'
  | 'shape:added'
  | 'shape:updated'
  | 'shape:removed'
  | 'draft:changed'
  | 'tool:changed';

const DEFAULT_WIDTH = 4;
const DEFAULT_OPACITY = 1;
const CANVAS_ID = '__puffCanvas';

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function ensureCanvas(width: number, height: number): HTMLCanvasElement {
  const w: any = window as any;
  let canvas: HTMLCanvasElement | null = w[CANVAS_ID] || null;
  if (!canvas) {
    canvas = document.createElement('canvas');
    w[CANVAS_ID] = canvas;
  }
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  return canvas;
}

function boundsFromPoints(points: VectorWorldPoint[]) {
  if (!points.length) return { x: 0, y: 0, width: 0, height: 0 };
  let minX = points[0].x;
  let minY = points[0].y;
  let maxX = points[0].x;
  let maxY = points[0].y;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export class PuffVectorEngine {
  private listeners = new Map<EngineEvent, Set<(...args: any[]) => void>>();
  private state: PuffVectorEngineState = {
    tool: 'pen',
    shapes: [],
    draft: null,
  };

  subscribe(listener: (state: PuffVectorEngineState) => void): () => void {
    const handler = () => listener(this.getState());
    this.on('state:changed', handler);
    return () => {
      this.off('state:changed', handler);
    };
  }

  on(event: EngineEvent, listener: (...args: any[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => this.off(event, listener);
  }

  off(event: EngineEvent, listener: (...args: any[]) => void) {
    const set = this.listeners.get(event);
    if (!set) return;
    set.delete(listener);
    if (set.size === 0) this.listeners.delete(event);
  }

  private emit(event: EngineEvent, payload?: any) {
    const set = this.listeners.get(event);
    if (set) {
      for (const listener of Array.from(set)) {
        try {
          listener(payload);
        } catch (err) {
          console.error('[PuffVectorEngine] listener error', err);
        }
      }
    }
    if (event !== 'state:changed') {
      const stateListeners = this.listeners.get('state:changed');
      if (stateListeners) {
        const snapshot = this.getState();
        for (const listener of Array.from(stateListeners)) {
          try {
            listener(snapshot);
          } catch (err) {
            console.error('[PuffVectorEngine] state listener error', err);
          }
        }
      }
    }
  }

  getState(): PuffVectorEngineState {
    return {
      tool: this.state.tool,
      shapes: [...this.state.shapes],
      draft: this.state.draft ? { ...this.state.draft, points: [...this.state.draft.points] } : null,
    };
  }

  getStateSnapshot(): PuffVectorEngineState {
    const shapes = this.state.shapes.map(shape => ({
      ...shape,
      points: shape.points.map(p => ({ ...p })),
      worldPoints: shape.worldPoints.map(pt => ({ ...pt })),
      bounds: { ...shape.bounds },
    }));
    const draft = this.state.draft
      ? { ...this.state.draft, points: this.state.draft.points.map(p => ({ ...p })) }
      : null;
    return {
      tool: this.state.tool,
      shapes,
      draft,
    };
  }

  replaceState(next: PuffVectorEngineState) {
    this.state = {
      tool: next.tool,
      shapes: next.shapes.map(shape => ({
        ...shape,
        points: shape.points.map(p => ({ ...p })),
        worldPoints: shape.worldPoints.map(pt => ({ ...pt })),
        bounds: { ...shape.bounds },
      })),
      draft: next.draft
        ? { ...next.draft, points: next.draft.points.map(p => ({ ...p })) }
        : null,
    };
    this.emit('state:changed');
  }

  setTool(tool: VectorTool) {
    if (this.state.tool === tool) return;
    this.state = { ...this.state, tool };
    this.emit('tool:changed');
  }

  startPath(uv: { u: number; v: number }, toolOverride?: VectorTool) {
    const tool = toolOverride || this.state.tool;
    const draft: VectorPathDraft = {
      id: `draft_${Date.now().toString(36)}`,
      points: [{ u: clamp01(uv.u), v: clamp01(uv.v), inHandle: null, outHandle: null }],
      closed: false,
      tool,
      createdAt: Date.now(),
    };
    this.state = { ...this.state, draft };
    this.emit('draft:changed');
  }

  addPoint(uv: { u: number; v: number }) {
    if (!this.state.draft) return;
    const points = [...this.state.draft.points, { u: clamp01(uv.u), v: clamp01(uv.v), inHandle: null, outHandle: null }];
    this.state = { ...this.state, draft: { ...this.state.draft, points } };
    this.emit('draft:changed');
  }

  updatePoint(index: number, uv: { u: number; v: number }) {
    if (!this.state.draft) return;
    if (index < 0 || index >= this.state.draft.points.length) return;
    const points = this.state.draft.points.slice();
    points[index] = { ...points[index], u: clamp01(uv.u), v: clamp01(uv.v) };
    this.state = { ...this.state, draft: { ...this.state.draft, points } };
    this.emit('draft:changed');
  }

  closeDraft() {
    if (!this.state.draft) return;
    this.state = { ...this.state, draft: { ...this.state.draft, closed: true } };
    this.emit('draft:changed');
  }

  cancelDraft() {
    if (!this.state.draft) return;
    this.state = { ...this.state, draft: null };
    this.emit('draft:changed');
  }

  commitDraft(options: PuffCommitOptions & { composedCanvas: HTMLCanvasElement | null; applyBridge?: (points: VectorWorldPoint[], opts: PuffCommitOptions) => void }) {
    const { draft } = this.state;
    if (!draft || draft.points.length < 2) {
      this.cancelDraft();
      return;
    }
    const { composedCanvas, applyBridge, width, opacity, color } = options;
    const world = this.sampleDraftWorld(draft, composedCanvas);
    const shape: VectorShape = {
      ...draft,
      worldPoints: world,
      bounds: boundsFromPoints(world),
    };

    this.state = {
      ...this.state,
      shapes: [...this.state.shapes, shape],
      draft: null,
    };
    this.emit('shape:added', shape);
    this.emit('draft:changed');
    this.writeToPuffCanvas(world, {
      width,
      opacity,
      color,
      composedCanvas,
      applyBridge,
    });
    this.emit('state:changed');
  }

  removeShape(id: string) {
    const before = this.state.shapes.length;
    const shapes = this.state.shapes.filter((s) => s.id !== id);
    if (shapes.length === before) return;
    this.state = { ...this.state, shapes };
    this.emit('shape:removed', id);
  }

  clear() {
    this.state = { ...this.state, shapes: [], draft: null };
    this.emit('state:changed');
  }

  commitFromUV(config: {
    id?: string;
    points: VectorUVPoint[];
    closed?: boolean;
    tool?: VectorTool;
    composedCanvas: HTMLCanvasElement | null;
    applyBridge?: (points: VectorWorldPoint[], opts: PuffCommitOptions) => void;
    options?: PuffCommitOptions;
  }) {
    if (!config || !config.points || config.points.length < 2) return;

    const draft: VectorPathDraft = {
      id: config.id || `path_${Date.now().toString(36)}`,
      points: config.points.map((p) => ({
        u: clamp01(p.u),
        v: clamp01(p.v),
        inHandle: p.inHandle ? { u: clamp01(p.inHandle.u), v: clamp01(p.inHandle.v) } : null,
        outHandle: p.outHandle ? { u: clamp01(p.outHandle.u), v: clamp01(p.outHandle.v) } : null,
      })),
      closed: !!config.closed,
      tool: config.tool || this.state.tool,
      createdAt: Date.now(),
    };

    const world = this.sampleDraftWorld(draft, config.composedCanvas);
    const shape: VectorShape = {
      ...draft,
      id: draft.id,
      worldPoints: world,
      bounds: boundsFromPoints(world),
    };

    this.state = {
      ...this.state,
      shapes: [...this.state.shapes, shape],
    };
    this.emit('shape:added', shape);

    this.writeToPuffCanvas(world, {
      width: config.options?.width,
      opacity: config.options?.opacity,
      color: config.options?.color,
      composedCanvas: config.composedCanvas,
      applyBridge: config.applyBridge,
    });
    this.emit('state:changed');
  }

  private sampleDraftWorld(draft: VectorPathDraft, composedCanvas: HTMLCanvasElement | null): VectorWorldPoint[] {
    if (!composedCanvas) {
      return draft.points.map((p) => ({ x: p.u, y: p.v }));
    }
    const steps = Math.max(12, draft.points.length * 16);
    const pts: VectorWorldPoint[] = [];
    const getPoint = (idx: number) => draft.points[(idx + draft.points.length) % draft.points.length];
    const segCount = draft.closed ? draft.points.length : draft.points.length - 1;
    const width = composedCanvas.width;
    const height = composedCanvas.height;

    for (let i = 0; i < segCount; i++) {
      const a = getPoint(i);
      const b = getPoint(i + 1);
      const hasOut = !!a?.outHandle;
      const hasIn = !!b?.inHandle;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        let u: number;
        let v: number;
        if (hasOut && hasIn) {
          const h1 = a.outHandle!;
          const h2 = b.inHandle!;
          const mt = 1 - t;
          u = mt * mt * mt * a.u + 3 * mt * mt * t * h1.u + 3 * mt * t * t * h2.u + t * t * t * b.u;
          v = mt * mt * mt * a.v + 3 * mt * mt * t * h1.v + 3 * mt * t * t * h2.v + t * t * t * b.v;
        } else {
          u = a.u + (b.u - a.u) * t;
          v = a.v + (b.v - a.v) * t;
        }
        pts.push({ x: Math.round(u * width), y: Math.round((1 - v) * height) });
      }
    }

    return pts;
  }

  private writeToPuffCanvas(points: VectorWorldPoint[], opts: PuffCommitOptions & { composedCanvas: HTMLCanvasElement | null; applyBridge?: (points: VectorWorldPoint[], opts: PuffCommitOptions) => void }) {
    const { composedCanvas, applyBridge } = opts;
    if (!composedCanvas || !points.length) return;

    const brushWidth = Math.max(1, Math.round(opts.width || DEFAULT_WIDTH));
    const brushOpacity = typeof opts.opacity === 'number' ? opts.opacity : DEFAULT_OPACITY;

    if (typeof applyBridge === 'function') {
      applyBridge(points, { width: brushWidth, opacity: brushOpacity, color: opts.color });
      try { window.dispatchEvent(new Event('puff-updated')); } catch {}
      return;
    }

    const canvas = ensureCanvas(composedCanvas.width, composedCanvas.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = brushOpacity;
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = opts.color || '#ffffff';
    ctx.lineWidth = brushWidth;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.restore();

    try { window.dispatchEvent(new Event('puff-updated')); } catch {}
  }
}

export const puffVectorEngine = new PuffVectorEngine();
