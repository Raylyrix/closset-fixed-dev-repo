import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useApp } from '../App';
import { vectorStore } from '../vector/vectorState';

export function VectorOverlay() {
  const { composedCanvas, activeTool } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [shapes, setShapes] = useState(vectorStore.getState().shapes);
  const [selected, setSelected] = useState(vectorStore.getState().selected);
  const [currentPath, setCurrentPath] = useState(vectorStore.getState().currentPath);
  const [tool, setTool] = useState(vectorStore.getState().tool);

  const [isDown, setIsDown] = useState(false);
  const draggingPointRef = useRef<{ shapeId: string; index: number } | null>(null);
  const draggingBoundsRef = useRef<{ shapeId: string; startX: number; startY: number; startBounds: {x:number;y:number;width:number;height:number} } | null>(null);

  // subscribe to store
  useEffect(() => {
    const unsub = vectorStore.subscribe(() => {
      const st = vectorStore.getState();
      setShapes(st.shapes);
      setSelected(st.selected);
      setCurrentPath(st.currentPath);
      setTool(st.tool);
    });
    return () => { unsub(); };
  }, []);

  // helpers
  const getCtx = () => canvasRef.current?.getContext('2d') || null;

  const canvasSize = useMemo(() => {
    if (!containerRef.current) return { w: 0, h: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return { w: Math.floor(rect.width), h: Math.floor(rect.height) };
  }, [containerRef.current]);

  // draw all
  const draw = useCallback(() => {
    const ctx = getCtx();
    if (!ctx || !canvasRef.current) return;
    const { width, height } = canvasRef.current;
    ctx.clearRect(0, 0, width, height);

    // grid (subtle)
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    for (let x=0; x<width; x+=20) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,height); ctx.stroke(); }
    for (let y=0; y<height; y+=20) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(width,y); ctx.stroke(); }
    ctx.restore();

    const drawBezier = (pts: any[]) => {
      if (pts.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i=1;i<pts.length;i++){
        const cur = pts[i];
        const prev = pts[i-1];
        if (cur.controlIn || prev.controlOut){
          const cp1x = prev.controlOut ? prev.x + prev.controlOut.x : prev.x;
          const cp1y = prev.controlOut ? prev.y + prev.controlOut.y : prev.y;
          const cp2x = cur.controlIn ? cur.x + cur.controlIn.x : cur.x;
          const cp2y = cur.controlIn ? cur.y + cur.controlIn.y : cur.y;
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, cur.x, cur.y);
        } else {
          ctx.lineTo(cur.x, cur.y);
        }
      }
    };

    shapes.forEach((shape) => {
      // path
      drawBezier(shape.path.points);
      
      // Set opacity for fill
      if (shape.path.fill) { 
        ctx.save();
        ctx.globalAlpha = shape.path.fillOpacity || 1.0;
        ctx.fillStyle = shape.path.fillColor; 
        ctx.fill(); 
        ctx.restore();
      }
      
      // Set opacity for stroke
      if (shape.path.stroke) { 
        ctx.save();
        ctx.globalAlpha = shape.path.strokeOpacity || 1.0;
        ctx.strokeStyle = shape.path.strokeColor; 
        ctx.lineWidth = shape.path.strokeWidth;
        ctx.lineJoin = shape.path.strokeJoin || 'round';
        ctx.lineCap = shape.path.strokeCap || 'round';
        ctx.stroke(); 
        ctx.restore();
      }

      // selection box + anchors if selected
      if (selected.includes(shape.id)){
        const b = shape.bounds; ctx.save();
        ctx.setLineDash([5,5]); ctx.strokeStyle = '#3B82F6'; ctx.lineWidth = 1.5;
        ctx.strokeRect(b.x-2, b.y-2, b.width+4, b.height+4);
        ctx.setLineDash([]);
        // anchors
        shape.path.points.forEach((p,i)=>{
          ctx.fillStyle = i===0 ? '#10B981' : '#3B82F6';
          ctx.beginPath(); ctx.arc(p.x,p.y,4,0,Math.PI*2); ctx.fill();
          if (p.controlIn){
            ctx.strokeStyle = '#9CA3AF'; ctx.setLineDash([2,2]);
            ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x+p.controlIn.x,p.y+p.controlIn.y); ctx.stroke(); ctx.setLineDash([]);
            ctx.beginPath(); ctx.arc(p.x+p.controlIn.x,p.y+p.controlIn.y,3,0,Math.PI*2); ctx.fillStyle = '#9CA3AF'; ctx.fill();
          }
          if (p.controlOut){
            ctx.strokeStyle = '#9CA3AF'; ctx.setLineDash([2,2]);
            ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x+p.controlOut.x,p.y+p.controlOut.y); ctx.stroke(); ctx.setLineDash([]);
            ctx.beginPath(); ctx.arc(p.x+p.controlOut.x,p.y+p.controlOut.y,3,0,Math.PI*2); ctx.fillStyle = '#9CA3AF'; ctx.fill();
          }
        });
        ctx.restore();
      }
    });

    if (currentPath && currentPath.points.length){
      drawBezier(currentPath.points);
      
      // Set opacity for fill
      if (currentPath.fill){ 
        ctx.save();
        ctx.globalAlpha = currentPath.fillOpacity || 1.0;
        ctx.fillStyle = currentPath.fillColor; 
        ctx.fill(); 
        ctx.restore();
      }
      
      // Set opacity for stroke
      if (currentPath.stroke){ 
        ctx.save();
        ctx.globalAlpha = currentPath.strokeOpacity || 1.0;
        ctx.strokeStyle = currentPath.strokeColor; 
        ctx.lineWidth = currentPath.strokeWidth;
        ctx.lineJoin = currentPath.strokeJoin || 'round';
        ctx.lineCap = currentPath.strokeCap || 'round';
        ctx.stroke(); 
        ctx.restore();
      }
      
      currentPath.points.forEach((p,i)=>{
        ctx.fillStyle = i===0 ? '#10B981' : '#3B82F6';
        ctx.beginPath(); ctx.arc(p.x,p.y,4,0,Math.PI*2); ctx.fill();
      });
    }
  }, [shapes, selected, currentPath]);

  useEffect(() => { draw(); }, [draw]);

  // resize canvas to container
  useEffect(() => {
    const el = canvasRef.current;
    if (!el || !containerRef.current) return;
    const ro = new ResizeObserver(() => {
      const rect = containerRef.current!.getBoundingClientRect();
      el.width = Math.floor(rect.width);
      el.height = Math.floor(rect.height);
      draw();
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [draw]);

  // coordinate mapping (screen -> overlay)
  const toOverlay = (ev: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
  };

  const hitPoint = (pt:{x:number;y:number}, s:any): number | null => {
    for(let i=0;i<s.path.points.length;i++){
      const p = s.path.points[i]; const dx=pt.x-p.x; const dy=pt.y-p.y; if (dx*dx+dy*dy<8*8) return i;
    }
    return null;
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (activeTool !== 'vectorTools') return;
    setIsDown(true);
    const pos = toOverlay(e);
    if (tool === 'pen') {
      const st = vectorStore.getState();
      if (!st.currentPath){
        const path = { id: `path_${Date.now()}`, points:[{ x: pos.x, y: pos.y, type:'corner' as const }], closed:false, fill:true, stroke:true, fillColor:'#ffffff', strokeColor:'#000000', strokeWidth:2 };
        vectorStore.setState({ currentPath: path });
      } else {
        const cp = { ...st.currentPath, points: [...st.currentPath.points, { x: pos.x, y: pos.y, type:'corner' as const }] };
        vectorStore.setState({ currentPath: cp });
      }
      return;
    }
    // selection
    const st = vectorStore.getState();
    const clicked = [...st.shapes].reverse().find(s => pos.x>=s.bounds.x && pos.x<=s.bounds.x+s.bounds.width && pos.y>=s.bounds.y && pos.y<=s.bounds.y+s.bounds.height);
    if (clicked){
      vectorStore.setState({ selected: [clicked.id] });
      const idx = hitPoint(pos, clicked);
      if (idx !== null) {
        draggingPointRef.current = { shapeId: clicked.id, index: idx };
      } else {
        draggingBoundsRef.current = { shapeId: clicked.id, startX: pos.x, startY: pos.y, startBounds: { ...clicked.bounds } };
      }
    } else {
      vectorStore.setState({ selected: [] });
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDown) return;
    const pos = toOverlay(e);
    const st = vectorStore.getState();
    if (tool === 'pen') return; // preview can be added later

    if (draggingPointRef.current){
      const { shapeId, index } = draggingPointRef.current;
      const shapesUpd = st.shapes.map(s => {
        if (s.id !== shapeId) return s;
        const pts = [...s.path.points];
        pts[index] = { ...pts[index], x: pos.x, y: pos.y };
        const path = { ...s.path, points: pts };
        const b = boundsFromPoints(pts);
        return { ...s, path, bounds: b };
      });
      vectorStore.setState({ shapes: shapesUpd });
    } else if (draggingBoundsRef.current){
      const { shapeId, startX, startY, startBounds } = draggingBoundsRef.current;
      const dx = pos.x - startX; const dy = pos.y - startY;
      const shapesUpd = st.shapes.map(s => {
        if (s.id !== shapeId) return s;
        const scaleX = (startBounds.width + dx) / Math.max(1, startBounds.width);
        const scaleY = (startBounds.height + dy) / Math.max(1, startBounds.height);
        const cx = startBounds.x; const cy = startBounds.y;
        const pts = s.path.points.map(p => ({ ...p, x: cx + (p.x - cx)*scaleX, y: cy + (p.y - cy)*scaleY }));
        const path = { ...s.path, points: pts };
        return { ...s, path, bounds: boundsFromPoints(pts) };
      });
      vectorStore.setState({ shapes: shapesUpd });
    }
  };

  const onMouseUp = () => {
    setIsDown(false);
    draggingPointRef.current = null;
    draggingBoundsRef.current = null;
  };

  const onDoubleClick = () => {
    const st = vectorStore.getState();
    if (tool === 'pen' && st.currentPath && st.currentPath.points.length>=3){
      const path = { ...st.currentPath, closed: true };
      const b = boundsFromPoints(path.points);
      const shape = { id: `shape_${Date.now()}`, type: 'path' as const, path, bounds: b };
      vectorStore.setAll({ currentPath: null, shapes: [...st.shapes, shape], selected: [shape.id] });
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <canvas
        ref={canvasRef}
        width={canvasSize.w}
        height={canvasSize.h}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onDoubleClick={onDoubleClick}
      />
    </div>
  );
}

function boundsFromPoints(pts: {x:number;y:number}[]){
  if (!pts.length) return { x:0,y:0,width:0,height:0 };
  let minX=pts[0].x, minY=pts[0].y, maxX=pts[0].x, maxY=pts[0].y;
  for (const p of pts){ minX=Math.min(minX,p.x); minY=Math.min(minY,p.y); maxX=Math.max(maxX,p.x); maxY=Math.max(maxY,p.y); }
  return { x:minX, y:minY, width:maxX-minX, height:maxY-minY };
}
