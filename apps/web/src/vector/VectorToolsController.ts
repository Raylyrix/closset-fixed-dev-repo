import { vectorStore } from './vectorState';

export type UV = { u: number; v: number };

function newId() {
  return Math.random().toString(36).slice(2);
}

export const VectorToolsController = {
  // Replace or append shape by id
  _upsert(shapes: any[], shape: any) {
    const idx = shapes.findIndex(s => s.id === shape.id);
    if (idx >= 0) {
      const next = [...shapes];
      next[idx] = shape;
      return next;
    }
    return [...shapes, shape];
  },

  pointerDown(uv: UV, e: PointerEvent | any) {
    console.log('[VectorTools] pointerDown', { uv, tool: vectorStore.getState().tool });
    const state = vectorStore.getState() as any;
    const tool = state.tool || 'pen';

    // Try selecting an existing anchor first (works for any tool)
    {
      const tol = 0.02; // ~2% of UV space
      type Hit = { shapeIndex: number; pointIndex: number; shapeId: string; dist: number };
      let best: Hit | null = null;
      state.shapes.forEach((shape: any, si: number) => {
        (shape.points || []).forEach((pt: any, pi: number) => {
          const dx = uv.u - (pt.x ?? 0);
          const dy = uv.v - (pt.y ?? 0);
          const d2 = dx * dx + dy * dy;
          if (d2 <= tol * tol && (!best || d2 < best.dist)) best = { shapeIndex: si, pointIndex: pi, shapeId: shape.id, dist: d2 };
        });
      });
      if (best) {
        const hit = best as Hit;
        const shapes = [...state.shapes];
        const shape = { ...shapes[hit.shapeIndex] };
        const pts = [...shape.points];
        // mark only this as selected
        for (let i = 0; i < pts.length; i++) pts[i] = { ...pts[i], selected: i === hit.pointIndex };
        shapes[hit.shapeIndex] = { ...shape, points: pts };
        vectorStore.setState({ shapes, selected: [shape.id], draggingAnchor: { shapeId: hit.shapeId, pointIndex: hit.pointIndex } });
        console.log('[VectorTools] anchor:selected', hit);
        return;
      }
    }

    if (tool === 'pen') {
      // Begin or continue current path
      let path = state.currentPath;
      if (!path) {
        path = {
          id: newId(),
          points: [],
          closed: false,
          type: 'path',
          fill: false,
          stroke: true,
          fillColor: 'rgba(255,255,255,0.2)',
          strokeColor: '#ffffff',
          strokeWidth: 2,
          fillOpacity: 0.2,
          strokeOpacity: 1,
          strokeJoin: 'round',
          strokeCap: 'round',
          bounds: { x: 0, y: 0, width: 0, height: 0 },
        };
        vectorStore.setState({ currentPath: path, shapes: this._upsert(state.shapes, path) });
      }
      const pts = [...path.points];
      pts.push({ x: uv.u, y: uv.v, type: 'smooth' });
      const updated = { ...path, points: pts };
      const nextShapes = this._upsert(vectorStore.getState().shapes, updated);
      vectorStore.setState({ currentPath: updated, shapes: nextShapes });
      console.log('[VectorTools] pen:add anchor', { totalPoints: updated.points.length, shapes: vectorStore.getState().shapes.length });
    }

    if (tool === 'curvature') {
      // Find nearest anchor across all shapes (in UV space) within tolerance
      const tol = 0.02; // ~2% of model size
      type Nearest = { shapeIndex: number; pointIndex: number; dist: number };
      let best: Nearest | null = null;
      state.shapes.forEach((shape: any, si: number) => {
        (shape.points || []).forEach((pt: any, pi: number) => {
          const dx = uv.u - (pt.x ?? 0);
          const dy = uv.v - (pt.y ?? 0);
          const d2 = dx * dx + dy * dy;
          if (d2 <= tol * tol && (!best || d2 < best.dist)) {
            best = { shapeIndex: si, pointIndex: pi, dist: d2 };
          }
        });
      });
      if (!best) return;
      const { shapeIndex, pointIndex } = best as Nearest;
      const shapes = [...state.shapes];
      const shape = { ...shapes[shapeIndex] };
      const pts = [...shape.points];
      const curr = { ...pts[pointIndex] } as any;
      // Mark selection
      curr.selected = true;
      // Set symmetric handles pointing toward pointer
      const vx = uv.u - (curr.x ?? 0);
      const vy = uv.v - (curr.y ?? 0);
      curr.controlOut = { x: vx, y: vy };
      curr.controlIn = { x: -vx, y: -vy };
      pts[pointIndex] = curr;
      shapes[shapeIndex] = { ...shape, points: pts };
      vectorStore.setState({ shapes, selected: [shape.id] });
      console.log('[VectorTools] curvature:select anchor', { shapeId: shape.id, pointIndex });
    }
  },

  pointerMove(uv: UV, e: PointerEvent | any) {
    if (!uv) return;
    const state = vectorStore.getState() as any;
    const tool = state.tool || 'pen';

    // If dragging an anchor, move it in UV space
    if (state.draggingAnchor) {
      const { shapeId, pointIndex } = state.draggingAnchor;
      const shapes = [...state.shapes];
      const si = shapes.findIndex((s: any) => s.id === shapeId);
      if (si >= 0) {
        const shape = { ...shapes[si] };
        const pts = [...shape.points];
        const curr = { ...(pts[pointIndex] || {}) } as any;
        curr.x = uv.u; curr.y = uv.v;
        pts[pointIndex] = curr;
        shapes[si] = { ...shape, points: pts };
        vectorStore.setState({ shapes });
        try { window.dispatchEvent(new CustomEvent('vectorChanged')); } catch {}
      }
      return;
    }

    if (tool === 'pen' && state.currentPath) {
      // While dragging, set controlOut of the last point
      const path = state.currentPath;
      if (!path.points.length) return;
      const pts = [...path.points];
      const i = pts.length - 1;
      const anchor = pts[i];
      const dx = uv.u - (anchor.x ?? 0);
      const dy = uv.v - (anchor.y ?? 0);
      pts[i] = { ...anchor, controlOut: { x: dx, y: dy } };
      const updated = { ...path, points: pts };
      const nextShapes = this._upsert(vectorStore.getState().shapes, updated);
      vectorStore.setState({ currentPath: updated, shapes: nextShapes });
    }

    if (tool === 'curvature') {
      // Adjust the handles of the selected anchor (first selected shape/point we find)
      const shapes = [...state.shapes];
      for (let si = 0; si < shapes.length; si++) {
        const shape = shapes[si];
        const pts = [...shape.points];
        const pi = pts.findIndex((p: any) => p.selected);
        if (pi >= 0) {
          const curr = { ...pts[pi] } as any;
          const vx = uv.u - (curr.x ?? 0);
          const vy = uv.v - (curr.y ?? 0);
          curr.controlOut = { x: vx, y: vy };
          curr.controlIn = { x: -vx, y: -vy };
          pts[pi] = curr;
          shapes[si] = { ...shape, points: pts };
          vectorStore.setState({ shapes });
          break;
        }
      }
    }
  },

  pointerUp(uv: UV, e: PointerEvent | any) {
    console.log('[VectorTools] pointerUp', { uv, tool: vectorStore.getState().tool });
    const state = vectorStore.getState() as any;
    const tool = state.tool || 'pen';

    if (tool === 'pen' && state.currentPath) {
      // On release, set symmetric controlIn for continuity if there is a previous point
      const path = state.currentPath;
      const pts = [...path.points];
      const i = pts.length - 1;
      if (i > 0) {
        const prev = pts[i - 1];
        const curr = pts[i];
        if (prev.controlOut) {
          // Mirror previous controlOut to current controlIn
          const mirror = { x: (prev.x ?? 0) + (prev.x ?? 0) - (prev.x + prev.controlOut.x), y: (prev.y ?? 0) + (prev.y ?? 0) - (prev.y + prev.controlOut.y) };
          pts[i] = { ...curr, controlIn: { x: mirror.x - (curr.x ?? 0), y: mirror.y - (curr.y ?? 0) } };
        }
      }
      const updated = { ...path, points: pts };
      vectorStore.setState({ currentPath: updated, shapes: state.shapes.map((s: any) => (s.id === updated.id ? updated : s)) });
    }

    if (tool === 'curvature') {
      // Leave handles as set; optionally deselect on mouse up
      // Keep selection for further adjustments
    }
    // Clear dragging state on any pointer up
    if (state.draggingAnchor) {
      vectorStore.setState({ draggingAnchor: null });
    }
    try { window.dispatchEvent(new CustomEvent('vectorChanged')); } catch {}
  },
};
