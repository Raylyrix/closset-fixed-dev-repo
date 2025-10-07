import React, { useEffect, useMemo, useRef, useState } from 'react';
import { vectorStore } from './vectorState';

// Utility: map uv [0..1] to screen px using the wrap element size
function uvToScreen(uv: { u: number; v: number }, wrap: HTMLElement | null) {
  if (!wrap) return { x: 0, y: 0 };
  const rect = wrap.getBoundingClientRect();
  return { x: uv.u * rect.width, y: uv.v * rect.height };
}

// Clamp helper
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

// Main overlay component that renders anchors/handles as SVG on top of WebGL canvas
export default function VectorEditorOverlay({ wrapRef }: { wrapRef: React.RefObject<HTMLDivElement> }) {
  const [state, setState] = useState(vectorStore.getState());
  const [drag, setDrag] = useState<
    | null
    | { type: 'anchor'; shapeId: string; pointIndex: number }
    | { type: 'handle-in' | 'handle-out'; shapeId: string; pointIndex: number }
  >(null);

  useEffect(() => {
    const unsub = vectorStore.subscribe(setState);
    return () => unsub();
  }, []);

  const wrapEl = wrapRef.current;
  const showAnchors = state.showAnchors !== false;
  const showHandles = state.showHandles !== false;

  // Mouse move handling for dragging anchors/handles
  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!drag || !wrapEl) return;
      const rect = wrapEl.getBoundingClientRect();
      const u = clamp((e.clientX - rect.left) / rect.width, 0, 1);
      const v = clamp((e.clientY - rect.top) / rect.height, 0, 1);

      const s = vectorStore.getState();
      const shapes = s.shapes.map(shape => {
        if (shape.id !== drag.shapeId) return shape;
        const pts = [...shape.points];
        const pt = { ...pts[drag.pointIndex] } as any;
        // We store uv in x/y fields (0..1 domain) to avoid type churn
        if (drag.type === 'anchor') {
          pt.x = u; pt.y = v;
        } else if (drag.type === 'handle-in') {
          // controlIn is relative vector in uv space
          const dx = u - (pt.x ?? 0);
          const dy = v - (pt.y ?? 0);
          pt.controlIn = { x: dx, y: dy };
        } else if (drag.type === 'handle-out') {
          const dx = u - (pt.x ?? 0);
          const dy = v - (pt.y ?? 0);
          pt.controlOut = { x: dx, y: dy };
        }
        pts[drag.pointIndex] = pt;
        return { ...shape, points: pts } as any;
      });
      vectorStore.setState({ shapes });
    }
    function onUp() {
      if (drag) setDrag(null);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mouseleave', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mouseleave', onUp);
    };
  }, [drag, wrapEl]);

  const onAnchorMouseDown = (shapeId: string, pointIndex: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setDrag({ type: 'anchor', shapeId, pointIndex });
  };

  const onHandleMouseDown = (type: 'handle-in' | 'handle-out', shapeId: string, pointIndex: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setDrag({ type, shapeId, pointIndex });
  };

  // Render shapes as paths (preview only) and anchors/handles as circles/lines
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20 }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        {state.shapes.map(shape => {
          // Build path d using cubic Bézier between consecutive points if controlOut/controlIn present
          const d = (() => {
            const pts = shape.points as any[];
            if (!pts || pts.length === 0) return '';
            const parts: string[] = [];
            const first = uvToScreen({ u: pts[0].x, v: pts[0].y }, wrapEl);
            parts.push(`M ${first.x} ${first.y}`);
            for (let i = 1; i < pts.length; i++) {
              const p0 = pts[i - 1];
              const p1 = pts[i];
              const p0pos = uvToScreen({ u: p0.x, v: p0.y }, wrapEl);
              const p1pos = uvToScreen({ u: p1.x, v: p1.y }, wrapEl);
              const c0 = p0.controlOut ? uvToScreen({ u: p0.x + p0.controlOut.x, v: p0.y + p0.controlOut.y }, wrapEl) : p0pos;
              const c1 = p1.controlIn ? uvToScreen({ u: p1.x + p1.controlIn.x, v: p1.y + p1.controlIn.y }, wrapEl) : p1pos;
              parts.push(`C ${c0.x} ${c0.y}, ${c1.x} ${c1.y}, ${p1pos.x} ${p1pos.y}`);
            }
            if (shape.closed && pts.length > 2) {
              const plast = pts[pts.length - 1];
              const pfirst = pts[0];
              const plastPos = uvToScreen({ u: plast.x, v: plast.y }, wrapEl);
              const pfirstPos = uvToScreen({ u: pfirst.x, v: pfirst.y }, wrapEl);
              const c0 = plast.controlOut ? uvToScreen({ u: plast.x + plast.controlOut.x, v: plast.y + plast.controlOut.y }, wrapEl) : plastPos;
              const c1 = pfirst.controlIn ? uvToScreen({ u: pfirst.x + pfirst.controlIn.x, v: pfirst.y + pfirst.controlIn.y }, wrapEl) : pfirstPos;
              parts.push(`C ${c0.x} ${c0.y}, ${c1.x} ${c1.y}, ${pfirstPos.x} ${pfirstPos.y} Z`);
            }
            return parts.join(' ');
          })();

          return (
            <g key={shape.id} style={{ pointerEvents: 'none' }}>
              {/* Preview stroke/fill */}
              <path d={d} fill={shape.fill ? shape.fillColor : 'transparent'} fillOpacity={shape.fillOpacity ?? 0.2}
                    stroke={shape.stroke ? shape.strokeColor : 'rgba(255,255,255,0.9)'} strokeOpacity={shape.strokeOpacity ?? 0.9}
                    strokeWidth={Math.max(1, shape.strokeWidth || 2)} />

              {/* Handles */}
              {showHandles && (shape.points as any[]).map((pt, idx) => {
                const p = uvToScreen({ u: pt.x, v: pt.y }, wrapEl);
                const elements: React.ReactNode[] = [];
                if (pt.controlIn) {
                  const h = uvToScreen({ u: pt.x + pt.controlIn.x, v: pt.y + pt.controlIn.y }, wrapEl);
                  elements.push(
                    <g key={`hi-${idx}`} style={{ pointerEvents: 'auto' }}>
                      <line x1={p.x} y1={p.y} x2={h.x} y2={h.y} stroke="#38bdf8" strokeDasharray="4 2" />
                      <circle cx={h.x} cy={h.y} r={6} fill="#0ea5e9" stroke="#e2e8f0" strokeWidth={1}
                        onMouseDown={onHandleMouseDown('handle-in', shape.id, idx)} />
                    </g>
                  );
                }
                if (pt.controlOut) {
                  const h = uvToScreen({ u: pt.x + pt.controlOut.x, v: pt.y + pt.controlOut.y }, wrapEl);
                  elements.push(
                    <g key={`ho-${idx}`} style={{ pointerEvents: 'auto' }}>
                      <line x1={p.x} y1={p.y} x2={h.x} y2={h.y} stroke="#38bdf8" strokeDasharray="4 2" />
                      <circle cx={h.x} cy={h.y} r={6} fill="#FFFFFF" stroke="#e2e8f0" strokeWidth={1}
                        onMouseDown={onHandleMouseDown('handle-out', shape.id, idx)} />
                    </g>
                  );
                }
                return <g key={idx}>{elements}</g>;
              })}

              {/* Anchors */}
              {showAnchors && (shape.points as any[]).map((pt, idx) => {
                const p = uvToScreen({ u: pt.x, v: pt.y }, wrapEl);
                const selected = !!pt.selected;
                return (
                  <circle key={`a-${idx}`} cx={p.x} cy={p.y} r={selected ? 7 : 6}
                          fill={selected ? '#f59e0b' : '#eab308'} stroke="#111827" strokeWidth={1}
                          style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                          onMouseDown={onAnchorMouseDown(shape.id, idx)} />
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
