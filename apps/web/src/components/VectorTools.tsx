import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../App';
import { vectorStore } from '../vector/vectorState';

interface VectorToolsProps {
  active: boolean;
}

interface VectorPoint {
  x: number;
  y: number;
  type: 'corner' | 'smooth' | 'symmetric';
  controlIn?: { x: number; y: number };
  controlOut?: { x: number; y: number };
}

type FillType = 'solid' | 'linear' | 'radial' | 'image';

interface VectorPath {
  id: string;
  points: VectorPoint[];
  closed: boolean;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  fill: boolean;
  stroke: boolean;
  fillType?: FillType;
  gradient?: {
    type: 'linear' | 'radial';
    color1: string;
    color2: string;
    angle?: number; // for linear
  };
  imageFill?: {
    src: string;
    img?: HTMLImageElement;
    scale: number; // 1=natural
    offsetX: number;
    offsetY: number;
  };
  strokeJoin?: CanvasLineJoin;
  strokeCap?: CanvasLineCap;
}

interface VectorShape {
  id: string;
  type: 'path' | 'rectangle' | 'ellipse' | 'polygon' | 'star';
  path: VectorPath;
  bounds: { x: number; y: number; width: number; height: number };
}

type VectorTool = 'pen' | 'pathSelection' | 'addAnchor' | 'removeAnchor' | 'convertAnchor' | 'pathOperations' | 'shapeBuilder';

export function VectorTools({ active }: VectorToolsProps) {
  // Console log removed

  const {
    composedCanvas,
    activeTool,
    brushColor,
    brushSize,
    layers,
    activeLayerId,
    commit
  } = useApp();

  // Vector state
  const [vectorTool, setVectorTool] = useState<VectorTool>('pen');
  const [currentPath, setCurrentPath] = useState<VectorPath | null>(null);
  const [vectorShapes, setVectorShapes] = useState<VectorShape[]>([]);
  const [selectedShapes, setSelectedShapes] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const [showGrid, setShowGrid] = useState(false);
  const [defaultFillType, setDefaultFillType] = useState<FillType>('solid');
  const [defaultGradient, setDefaultGradient] = useState({ type: 'linear' as const, color1: '#FF6B6B', color2: '#4F46E5', angle: 0 });
  const [defaultStrokeJoin, setDefaultStrokeJoin] = useState<CanvasLineJoin>('round');
  const [defaultStrokeCap, setDefaultStrokeCap] = useState<CanvasLineCap>('round');
  const [imageFillState, setImageFillState] = useState<{ src: string | null; img?: HTMLImageElement; scale: number; offsetX: number; offsetY: number }>({ src: null, img: undefined, scale: 1, offsetX: 0, offsetY: 0 });

  // Path operation state
  const [pathOperations, setPathOperations] = useState<{
    union: boolean;
    intersection: boolean;
    difference: boolean;
    exclusion: boolean;
  }>({
    union: false,
    intersection: false,
    difference: false,
    exclusion: false
  });

  // Refs
  const [vectorCanvas, setVectorCanvas] = useState<HTMLCanvasElement | null>(null);
  const [previewCanvas, setPreviewCanvas] = useState<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<VectorPoint | null>(null);
  const draggingPointRef = useRef<{ shapeId: string; index: number } | null>(null);
  const draggingBoundsRef = useRef<{ shapeId: string; edge: 'left'|'right'|'top'|'bottom'|'corner'; startX: number; startY: number; startBounds: VectorShape['bounds'] } | null>(null);
  const draggingHandleRef = useRef<{ shapeId: string; index: number; which: 'in'|'out'; start: { x:number; y:number } } | null>(null);

  // Initialize vector canvas
  useEffect(() => {
    if (!active || !composedCanvas) {
      // Console log removed
      return;
    }

    console.log('🔧 VectorTools: Initializing vector canvas', {
      composedCanvasSize: `${composedCanvas.width}x${composedCanvas.height}`
    });

    // Create vector canvas
    const v = document.createElement('canvas');
    v.width = composedCanvas.width;
    v.height = composedCanvas.height;
    setVectorCanvas(v);

    // Create preview canvas
    const p = document.createElement('canvas');
    p.width = composedCanvas.width;
    p.height = composedCanvas.height;
    setPreviewCanvas(p);

    // Console log removed
  }, [active, composedCanvas]);

  // Snap to grid function
  const snapToGridPoint = useCallback((x: number, y: number): { x: number; y: number } => {
    if (!snapToGrid) return { x, y };

    const snappedX = Math.round(x / gridSize) * gridSize;
    const snappedY = Math.round(y / gridSize) * gridSize;

    // Console log removed
    return { x: snappedX, y: snappedY };
  }, [snapToGrid, gridSize]);

  // Create new path
  const createNewPath = useCallback((startPoint: VectorPoint): VectorPath => {
    // Console log removed

    const newPath: VectorPath = {
      id: `path_${Date.now()}`,
      points: [startPoint],
      closed: false,
      fillColor: brushColor,
      strokeColor: brushColor,
      strokeWidth: Math.max(1, Math.round(brushSize)),
      fill: true,
      stroke: true,
      fillType: defaultFillType,
      gradient: defaultFillType !== 'solid' ? { ...defaultGradient } : undefined,
      imageFill: defaultFillType === 'image' && imageFillState.src ? { src: imageFillState.src, img: imageFillState.img, scale: imageFillState.scale, offsetX: imageFillState.offsetX, offsetY: imageFillState.offsetY } : undefined,
      strokeJoin: defaultStrokeJoin,
      strokeCap: defaultStrokeCap
    };

    // Console log removed
    return newPath;
  }, [brushColor, brushSize]);

  // Add point to current path
  const addPointToPath = useCallback((point: VectorPoint) => {
    if (!currentPath) {
      // Console log removed
      return;
    }

    // Console log removed

    const updatedPath = {
      ...currentPath,
      points: [...currentPath.points, point]
    };

    setCurrentPath(updatedPath);
    // Console log removed
  }, [currentPath]);

  // Close current path
  const closeCurrentPath = useCallback(() => {
    if (!currentPath || currentPath.points.length < 3) {
      // Console log removed
      return;
    }

    // Console log removed

    const closedPath = {
      ...currentPath,
      closed: true
    };

    // Add to shapes
    const bounds = calculatePathBounds(closedPath);
    const shape: VectorShape = {
      id: `shape_${Date.now()}`,
      type: 'path',
      path: closedPath,
      bounds
    };

    setVectorShapes(prev => [...prev, shape]);
    setCurrentPath(null);

    // Console log removed
  }, [currentPath]);

  // Calculate path bounds
  const calculatePathBounds = useCallback((path: VectorPath): { x: number; y: number; width: number; height: number } => {
    if (path.points.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    let minX = path.points[0].x;
    let maxX = path.points[0].x;
    let minY = path.points[0].y;
    let maxY = path.points[0].y;

    path.points.forEach(point => {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }, []);

  // Draw Bezier curve
  const drawBezierCurve = useCallback((ctx: CanvasRenderingContext2D, points: VectorPoint[]) => {
    if (points.length < 2) return;

    // Console log removed

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      const current = points[i];
      const previous = points[i - 1];

      if (current.type === 'smooth' || current.type === 'symmetric') {
        // Use control points for smooth curves
        const cp1x = previous.controlOut ? previous.x + previous.controlOut.x : previous.x;
        const cp1y = previous.controlOut ? previous.y + previous.controlOut.y : previous.y;
        const cp2x = current.controlIn ? current.x + current.controlIn.x : current.x;
        const cp2y = current.controlIn ? current.y + current.controlIn.y : current.y;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, current.x, current.y);
      } else {
        // Straight line
        ctx.lineTo(current.x, current.y);
      }
    }

    if (points.length > 2 && points[0].x === points[points.length - 1].x && points[0].y === points[points.length - 1].y) {
      ctx.closePath();
    }
  }, []);

  // Render vector shapes
  const renderVectorShapes = useCallback(() => {
    if (!vectorCanvas || !previewCanvas) return;

    // Console log removed

    const vectorCtx = vectorCanvas.getContext('2d')!;
    const previewCtx = previewCanvas.getContext('2d')!;

    // Clear canvases
    vectorCtx.clearRect(0, 0, vectorCanvas.width, vectorCanvas.height);
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    // Draw grid if enabled
    if (showGrid) {
      drawGrid(vectorCtx);
      drawGrid(previewCtx);
    }

    // Draw all shapes
    vectorShapes.forEach(shape => {
      const isSelected = selectedShapes.includes(shape.id);
      
      vectorCtx.save();
      previewCtx.save();

      // Set styles (fill)
      if (shape.path.fill) {
        const fillStyle = getFillStyle(vectorCtx, shape);
        vectorCtx.fillStyle = fillStyle;
        // preview uses same simple style
        previewCtx.fillStyle = fillStyle as any;
      }
      if (shape.path.stroke) {
        vectorCtx.strokeStyle = shape.path.strokeColor;
        vectorCtx.lineWidth = shape.path.strokeWidth;
        vectorCtx.lineJoin = shape.path.strokeJoin || 'round';
        vectorCtx.lineCap = shape.path.strokeCap || 'round';
        previewCtx.strokeStyle = shape.path.strokeColor;
        previewCtx.lineWidth = shape.path.strokeWidth;
      }

      // Draw path
      drawBezierCurve(vectorCtx, shape.path.points);
      drawBezierCurve(previewCtx, shape.path.points);

      if (shape.path.fill) {
        vectorCtx.fill();
        previewCtx.fill();
      }
      if (shape.path.stroke) {
        vectorCtx.stroke();
        previewCtx.stroke();
      }

      // Draw selection outline & handles
      if (isSelected) {
        vectorCtx.strokeStyle = '#3B82F6';
        vectorCtx.lineWidth = 2;
        vectorCtx.setLineDash([5, 5]);
        vectorCtx.strokeRect(shape.bounds.x - 2, shape.bounds.y - 2, shape.bounds.width + 4, shape.bounds.height + 4);
        vectorCtx.setLineDash([]);

        // Draw resize handles (corners)
        const hs = 6;
        const corners = [
          { x: shape.bounds.x, y: shape.bounds.y },
          { x: shape.bounds.x + shape.bounds.width, y: shape.bounds.y },
          { x: shape.bounds.x, y: shape.bounds.y + shape.bounds.height },
          { x: shape.bounds.x + shape.bounds.width, y: shape.bounds.y + shape.bounds.height }
        ];
        vectorCtx.fillStyle = '#3B82F6';
        corners.forEach(c => { vectorCtx.fillRect(c.x - hs/2, c.y - hs/2, hs, hs); });
      }

      vectorCtx.restore();
      previewCtx.restore();
    });

    // Draw current path being created
    if (currentPath && currentPath.points.length > 0) {
      vectorCtx.save();
      previewCtx.save();

      if (currentPath.fill) {
        const tempShape: VectorShape = { id: 'temp', type: 'path', path: currentPath, bounds: calculatePathBounds(currentPath) };
        const fillStyle = getFillStyle(vectorCtx, tempShape);
        vectorCtx.fillStyle = fillStyle;
        previewCtx.fillStyle = fillStyle as any;
      }
      if (currentPath.stroke) {
        vectorCtx.strokeStyle = currentPath.strokeColor;
        vectorCtx.lineWidth = currentPath.strokeWidth;
        vectorCtx.lineJoin = currentPath.strokeJoin || 'round';
        vectorCtx.lineCap = currentPath.strokeCap || 'round';
        previewCtx.strokeStyle = currentPath.strokeColor;
        previewCtx.lineWidth = currentPath.strokeWidth;
      }

      drawBezierCurve(vectorCtx, currentPath.points);
      drawBezierCurve(previewCtx, currentPath.points);

      if (currentPath.fill) {
        vectorCtx.fill();
        previewCtx.fill();
      }
      if (currentPath.stroke) {
        vectorCtx.stroke();
        previewCtx.stroke();
      }

      // Draw control points
      currentPath.points.forEach((point, index) => {
        if (point.controlIn || point.controlOut) {
          vectorCtx.strokeStyle = '#6B7280';
          vectorCtx.lineWidth = 1;
          vectorCtx.setLineDash([2, 2]);

          if (point.controlIn) {
            vectorCtx.beginPath();
            vectorCtx.moveTo(point.x, point.y);
            vectorCtx.lineTo(point.x + point.controlIn.x, point.y + point.controlIn.y);
            vectorCtx.stroke();
          }

          if (point.controlOut) {
            vectorCtx.beginPath();
            vectorCtx.moveTo(point.x, point.y);
            vectorCtx.lineTo(point.x + point.controlOut.x, point.y + point.controlOut.y);
            vectorCtx.stroke();
          }

          vectorCtx.setLineDash([]);
        }

        // Draw anchor point
        vectorCtx.fillStyle = index === 0 ? '#10B981' : '#3B82F6';
        vectorCtx.beginPath();
        vectorCtx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        vectorCtx.fill();

        // Draw handle points
        const hs = 3;
        if (point.controlIn) {
          vectorCtx.fillStyle = '#9CA3AF';
          vectorCtx.beginPath();
          vectorCtx.arc(point.x + point.controlIn.x, point.y + point.controlIn.y, hs, 0, 2*Math.PI);
          vectorCtx.fill();
        }
        if (point.controlOut) {
          vectorCtx.fillStyle = '#9CA3AF';
          vectorCtx.beginPath();
          vectorCtx.arc(point.x + point.controlOut.x, point.y + point.controlOut.y, hs, 0, 2*Math.PI);
          vectorCtx.fill();
        }
      });

      vectorCtx.restore();
      previewCtx.restore();
    }

    // Console log removed
  }, [vectorShapes, selectedShapes, currentPath, showGrid, drawBezierCurve, vectorCanvas, previewCanvas]);

  // Build fill style for a shape
  const getFillStyle = (ctx: CanvasRenderingContext2D, shape: VectorShape): string | CanvasGradient | CanvasPattern => {
    const p = shape.path;
    if (p.fillType === 'linear' && p.gradient) {
      const b = shape.bounds;
      const angle = (p.gradient.angle || 0) * Math.PI / 180;
      const cx = b.x + b.width / 2;
      const cy = b.y + b.height / 2;
      const dx = Math.cos(angle) * b.width/2;
      const dy = Math.sin(angle) * b.height/2;
      const grad = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
      grad.addColorStop(0, p.gradient.color1);
      grad.addColorStop(1, p.gradient.color2);
      return grad;
    }
    if (p.fillType === 'radial' && p.gradient) {
      const b = shape.bounds;
      const cx = b.x + b.width / 2;
      const cy = b.y + b.height / 2;
      const r = Math.max(b.width, b.height) / 2;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, p.gradient.color1);
      grad.addColorStop(1, p.gradient.color2);
      return grad;
    }
    if (p.fillType === 'image' && p.imageFill?.img) {
      const pattern = ctx.createPattern(p.imageFill.img, 'repeat');
      // CanvasPattern transformation not widely supported; we'll simulate via drawImage when applying to composed
      // For preview, pattern is acceptable.
      return pattern as CanvasPattern;
    }
    return p.fillColor;
  };

  // Draw grid
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!composedCanvas) return;

    // Console log removed

    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.setLineDash([1, 1]);

    // Vertical lines
    for (let x = 0; x < composedCanvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, composedCanvas.height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < composedCanvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(composedCanvas.width, y);
      ctx.stroke();
    }

    ctx.setLineDash([]);
  }, [composedCanvas, gridSize]);

  // Path operations using paper.js
  const performPathOperation = useCallback(async (operation: keyof typeof pathOperations) => {
    if (selectedShapes.length < 2) {
      // Console log removed
      return;
    }
    const paper = await import('paper');
    paper.setup(document.createElement('canvas'));

    const toPaper = (shape: VectorShape) => {
      const path = new paper.Path();
      shape.path.points.forEach((pt, i) => {
        const seg = new paper.Segment(new paper.Point(pt.x, pt.y));
        if (pt.controlIn) seg.handleIn = new paper.Point(pt.controlIn.x, pt.controlIn.y);
        if (pt.controlOut) seg.handleOut = new paper.Point(pt.controlOut.x, pt.controlOut.y);
        path.add(seg);
      });
      if (shape.path.closed) path.closed = true; else path.closed = false;
      return path;
    };

    const fromPaper = (p: any): VectorShape => {
      const pts: VectorPoint[] = p.segments.map((seg: any) => ({
        x: seg.point.x,
        y: seg.point.y,
        type: 'smooth',
        controlIn: seg.handleIn && (seg.handleIn.x !== 0 || seg.handleIn.y !== 0) ? { x: seg.handleIn.x, y: seg.handleIn.y } : undefined,
        controlOut: seg.handleOut && (seg.handleOut.x !== 0 || seg.handleOut.y !== 0) ? { x: seg.handleOut.x, y: seg.handleOut.y } : undefined,
      }));
      const path: VectorPath = {
        id: `path_${Date.now()}`,
        points: pts,
        closed: p.closed,
        fillColor: '#ffffff',
        strokeColor: '#000000',
        strokeWidth: 1,
        fill: true,
        stroke: false,
      };
      return { id: `shape_${Date.now()}`, type: 'path', path, bounds: calculatePathBounds(path) };
    };

    const s1 = vectorShapes.find(s => s.id === selectedShapes[0]);
    const s2 = vectorShapes.find(s => s.id === selectedShapes[1]);
    if (!s1 || !s2) return;

    const p1 = toPaper(s1);
    const p2 = toPaper(s2);
    let result: any = null;
    switch (operation) {
      case 'union': result = p1.unite(p2); break;
      case 'difference': result = p1.subtract(p2); break;
      case 'intersection': result = p1.intersect(p2); break;
      case 'exclusion': result = p1.exclude(p2); break;
    }
    if (!result) return;
    const resShape = fromPaper(result);
    setVectorShapes(prev => [ ...prev.filter(s => !selectedShapes.includes(s.id)), resShape ]);
    setSelectedShapes([resShape.id]);
  }, [selectedShapes, vectorShapes]);

  // Apply vector shapes to design
  const applyVectorShapes = useCallback(() => {
    if (!vectorCanvas || !composedCanvas || !commit) {
      // Console log removed
      return;
    }

    // Console log removed

    // Draw vector shapes on composed canvas
    const composedCtx = composedCanvas.getContext('2d')!;
    composedCtx.drawImage(vectorCanvas, 0, 0);

    // Commit changes
    commit();

    // Console log removed
  }, [vectorCanvas, composedCanvas, commit]);

  // Handle mouse events
  const hitTestPoint = (pt: {x:number;y:number}, shape: VectorShape): number | null => {
    for (let i=0;i<shape.path.points.length;i++){
      const p = shape.path.points[i];
      const dx = pt.x - p.x;
      const dy = pt.y - p.y;
      if (dx*dx + dy*dy < 8*8) return i;
    }
    return null;
  };

  const hitTestHandle = (pt: {x:number;y:number}, shape: VectorShape): { index:number; which:'in'|'out' } | null => {
    for (let i=0;i<shape.path.points.length;i++){
      const p = shape.path.points[i];
      const hin = p.controlIn ? { x: p.x + p.controlIn.x, y: p.y + p.controlIn.y } : null;
      const hout = p.controlOut ? { x: p.x + p.controlOut.x, y: p.y + p.controlOut.y } : null;
      if (hin) {
        const dx = pt.x - hin.x; const dy = pt.y - hin.y;
        if (dx*dx + dy*dy < 7*7) return { index: i, which: 'in' };
      }
      if (hout) {
        const dx = pt.x - hout.x; const dy = pt.y - hout.y;
        if (dx*dx + dy*dy < 7*7) return { index: i, which: 'out' };
      }
    }
    return null;
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!active || !composedCanvas) return;

    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = (e.clientX - rect.left) * (composedCanvas.width / rect.width);
    const y = (e.clientY - rect.top) * (composedCanvas.height / rect.height);
    const snappedPoint = snapToGridPoint(x, y);

    // Console log removed

    setIsDrawing(true);
    isDrawingRef.current = true;

    switch (vectorTool) {
      case 'pen':
        const newPoint: VectorPoint = {
          x: snappedPoint.x,
          y: snappedPoint.y,
          type: 'corner'
        };

        if (!currentPath) {
          const newPath = createNewPath(newPoint);
          setCurrentPath(newPath);
        } else {
          addPointToPath(newPoint);
        }
        break;

      case 'pathSelection': {
        // Select shape and possibly start dragging a point or bounds
        const clickedShape = [...vectorShapes].reverse().find(shape => (
          snappedPoint.x >= shape.bounds.x &&
          snappedPoint.x <= shape.bounds.x + shape.bounds.width &&
          snappedPoint.y >= shape.bounds.y &&
          snappedPoint.y <= shape.bounds.y + shape.bounds.height
        ));
        if (clickedShape) {
          // select
          if (e.ctrlKey || e.metaKey) {
            setSelectedShapes(prev => prev.includes(clickedShape.id) ? prev.filter(id => id !== clickedShape.id) : [...prev, clickedShape.id]);
          } else {
            setSelectedShapes([clickedShape.id]);
          }

          // test handle hit first
          const handleHit = hitTestHandle(snappedPoint, clickedShape);
          if (handleHit) {
            draggingHandleRef.current = { shapeId: clickedShape.id, index: handleHit.index, which: handleHit.which, start: snappedPoint };
          } else {
            // test anchor hit
            const hitIndex = hitTestPoint(snappedPoint, clickedShape);
            if (hitIndex !== null) {
              draggingPointRef.current = { shapeId: clickedShape.id, index: hitIndex };
            } else {
              // test bounds handle (corners)
              const b = clickedShape.bounds;
              const hs = 8;
              const near = (x:number,y:number)=> Math.abs(snappedPoint.x - x) <= hs && Math.abs(snappedPoint.y - y) <= hs;
              if (near(b.x, b.y) || near(b.x+b.width, b.y) || near(b.x, b.y+b.height) || near(b.x+b.width, b.y+b.height)) {
                draggingBoundsRef.current = { shapeId: clickedShape.id, edge: 'corner', startX: snappedPoint.x, startY: snappedPoint.y, startBounds: { ...b } };
              }
            }
          }
        } else {
          setSelectedShapes([]);
        }
        break; }

      case 'convertAnchor': {
        const clickedShape = [...vectorShapes].reverse().find(shape => (
          snappedPoint.x >= shape.bounds.x &&
          snappedPoint.x <= shape.bounds.x + shape.bounds.width &&
          snappedPoint.y >= shape.bounds.y &&
          snappedPoint.y <= shape.bounds.y + shape.bounds.height
        ));
        if (clickedShape) {
          const idx = hitTestPoint(snappedPoint, clickedShape);
          if (idx !== null) {
            setVectorShapes(prev => prev.map(s => {
              if (s.id !== clickedShape.id) return s;
              const pts = [...s.path.points];
              const cur = pts[idx];
              // toggle type
              const nextType = cur.type === 'corner' ? 'smooth' : cur.type === 'smooth' ? 'symmetric' : 'corner';
              let controlIn = cur.controlIn;
              let controlOut = cur.controlOut;
              if (nextType === 'corner') { controlIn = undefined; controlOut = undefined; }
              if (nextType === 'smooth' || nextType === 'symmetric') {
                controlIn = controlIn || { x: -20, y: 0 };
                controlOut = controlOut || { x: 20, y: 0 };
                if (nextType === 'symmetric') {
                  controlIn = { x: -Math.abs(controlOut!.x), y: -Math.abs(controlOut!.y) };
                }
              }
              pts[idx] = { ...cur, type: nextType, controlIn, controlOut };
              const newPath = { ...s.path, points: pts };
              return { ...s, path: newPath, bounds: calculatePathBounds(newPath) };
            }));
          }
        }
        break; }
    }
  }, [active, composedCanvas, snapToGridPoint, vectorTool, currentPath, createNewPath, addPointToPath, vectorShapes]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !isDrawingRef.current) return;

    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = (e.clientX - rect.left) * (composedCanvas!.width / rect.width);
    const y = (e.clientY - rect.top) * (composedCanvas!.height / rect.height);
    const snappedPoint = snapToGridPoint(x, y);

    // Console log removed

    // Update preview for current path or drag operations
    if (currentPath && vectorTool === 'pen') {
      // This would update a preview point in a real implementation
    }
    // Dragging point / handle / bounds
    if (vectorTool === 'pathSelection') {
      if (draggingPointRef.current) {
        const { shapeId, index } = draggingPointRef.current;
        setVectorShapes(prev => prev.map(s => {
          if (s.id !== shapeId) return s;
          const pts = [...s.path.points];
          pts[index] = { ...pts[index], x: snappedPoint.x, y: snappedPoint.y };
          const newPath = { ...s.path, points: pts };
          return { ...s, path: newPath, bounds: calculatePathBounds(newPath) };
        }));
      } else if (draggingHandleRef.current) {
        const { shapeId, index, which } = draggingHandleRef.current;
        setVectorShapes(prev => prev.map(s => {
          if (s.id !== shapeId) return s;
          const pts = [...s.path.points];
          const p = { ...pts[index] };
          const dx = snappedPoint.x - p.x;
          const dy = snappedPoint.y - p.y;
          if (which === 'in') {
            p.controlIn = { x: dx, y: dy };
            if (!e.altKey && p.type === 'symmetric') {
              p.controlOut = { x: -dx, y: -dy };
            }
          } else {
            p.controlOut = { x: dx, y: dy };
            if (!e.altKey && p.type === 'symmetric') {
              p.controlIn = { x: -dx, y: -dy };
            }
          }
          // Shift to constrain angle to 45deg steps
          if (e.shiftKey) {
            const handle = which === 'in' ? p.controlIn! : p.controlOut!;
            const angle = Math.atan2(handle.y, handle.x);
            const step = Math.PI / 4;
            const snappedAngle = Math.round(angle / step) * step;
            const len = Math.hypot(handle.x, handle.y);
            const nx = Math.cos(snappedAngle) * len;
            const ny = Math.sin(snappedAngle) * len;
            if (which === 'in') p.controlIn = { x: nx, y: ny }; else p.controlOut = { x: nx, y: ny };
          }
          pts[index] = p;
          const newPath = { ...s.path, points: pts };
          return { ...s, path: newPath, bounds: calculatePathBounds(newPath) };
        }));
      } else if (draggingBoundsRef.current) {
        const { shapeId, startX, startY, startBounds } = draggingBoundsRef.current;
        const dx = snappedPoint.x - startX;
        const dy = snappedPoint.y - startY;
        setVectorShapes(prev => prev.map(s => {
          if (s.id !== shapeId) return s;
          const scaleX = (startBounds.width + dx) / Math.max(1, startBounds.width);
          const scaleY = (startBounds.height + dy) / Math.max(1, startBounds.height);
          const cx = startBounds.x;
          const cy = startBounds.y;
          const pts = s.path.points.map(p => ({
            ...p,
            x: cx + (p.x - cx) * scaleX,
            y: cy + (p.y - cy) * scaleY
          }));
          const newPath = { ...s.path, points: pts };
          return { ...s, path: newPath, bounds: calculatePathBounds(newPath) };
        }));
      }
    }
  }, [isDrawing, composedCanvas, snapToGridPoint, currentPath, vectorTool]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing) return;

    // Console log removed

    isDrawingRef.current = false;
    setIsDrawing(false);
    draggingPointRef.current = null;
    draggingBoundsRef.current = null;
    draggingHandleRef.current = null;
  }, [isDrawing]);

  const handleDoubleClick = useCallback(() => {
    if (vectorTool === 'pen' && currentPath) {
      // Console log removed
      closeCurrentPath();
    }
  }, [vectorTool, currentPath, closeCurrentPath]);

  // Render shapes when they change
  useEffect(() => {
    renderVectorShapes();
    // sync to global store for 3D editing
    vectorStore.setAll({
      shapes: vectorShapes as any,
      selected: selectedShapes,
      currentPath,
      tool: vectorTool,
    });
  }, [renderVectorShapes]);

  if (!active) {
    // Console log removed
    return null;
  }

  // Headless mode: don't render popup UI; interactions happen directly on 3D Shirt
  // Console log removed
  return null;
}

