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
  fillOpacity?: number;
  strokeOpacity?: number;
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

type VectorTool = 'pen' | 'pathSelection' | 'addAnchor' | 'removeAnchor' | 'convertAnchor' | 'curvature' | 'pathOperations' | 'shapeBuilder';

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

  // Vector state - use only vector store state

  // Get current state from vector store
  const [vectorState, setVectorState] = useState(vectorStore.getState());
  const vectorTool = vectorState.tool;
  const currentPath = vectorState.currentPath;
  const vectorShapes = vectorState.shapes;
  const selectedShapes = vectorState.selected;

  // Subscribe to vector store changes
  useEffect(() => {
    const unsubscribe = vectorStore.subscribe(() => {
      setVectorState(vectorStore.getState());
    });
    return unsubscribe;
  }, []);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const [showGrid, setShowGrid] = useState(false);
  const [defaultFillType, setDefaultFillType] = useState<FillType>('solid');
  const [defaultGradient, setDefaultGradient] = useState({ type: 'linear' as const, color1: '#FF6B6B', color2: '#4F46E5', angle: 0 });
  const [defaultStrokeJoin, setDefaultStrokeJoin] = useState<CanvasLineJoin>('round');
  const [defaultStrokeCap, setDefaultStrokeCap] = useState<CanvasLineCap>('round');
  const [defaultStrokeColor, setDefaultStrokeColor] = useState<string>(brushColor);
  const [defaultStrokeWidth, setDefaultStrokeWidth] = useState<number>(brushSize);
  const [defaultStrokeEnabled, setDefaultStrokeEnabled] = useState<boolean>(true);
  const [defaultFillColor, setDefaultFillColor] = useState<string>(brushColor);
  const [defaultFillOpacity, setDefaultFillOpacity] = useState<number>(1.0);
  const [defaultStrokeOpacity, setDefaultStrokeOpacity] = useState<number>(1.0);
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

  // Refs for canvas rendering
  const [vectorCanvas, setVectorCanvas] = useState<HTMLCanvasElement | null>(null);
  const [previewCanvas, setPreviewCanvas] = useState<HTMLCanvasElement | null>(null);

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
    const newPath: VectorPath = {
      id: `path_${Date.now()}`,
      points: [startPoint],
      closed: false,
      fillColor: defaultFillColor,
      strokeColor: defaultStrokeColor,
      strokeWidth: Math.max(1, Math.round(defaultStrokeWidth)),
      fill: defaultFillType !== 'none',
      stroke: defaultStrokeEnabled,
      fillType: defaultFillType,
      fillOpacity: defaultFillOpacity,
      strokeOpacity: defaultStrokeOpacity,
      gradient: defaultFillType !== 'solid' ? { ...defaultGradient } : undefined,
      imageFill: defaultFillType === 'image' && imageFillState.src ? { src: imageFillState.src, img: imageFillState.img, scale: imageFillState.scale, offsetX: imageFillState.offsetX, offsetY: imageFillState.offsetY } : undefined,
      strokeJoin: defaultStrokeJoin,
      strokeCap: defaultStrokeCap
    };

    // Update vector store
    vectorStore.setState({ currentPath: newPath });
    console.log('VectorTools: Created new path:', newPath.id);
    return newPath;
  }, [defaultFillColor, defaultFillType, defaultGradient, defaultStrokeColor, defaultStrokeWidth, defaultStrokeEnabled, defaultFillOpacity, defaultStrokeOpacity, defaultStrokeJoin, defaultStrokeCap, imageFillState]);

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

    vectorStore.setState({ currentPath: updatedPath });
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

    // Update vector store directly
    const currentShapes = vectorStore.getState().shapes;
    vectorStore.setAll({
      shapes: [...currentShapes, shape],
      currentPath: null,
      selected: [shape.id]
    });
    console.log('VectorTools: Completed shape:', shape.id, 'Total shapes:', currentShapes.length + 1);
  }, [currentPath]);

  // Apply fill/stroke settings to selected shapes and update current path
  const applySettingsToSelected = useCallback(() => {
    const currentShapes = vectorStore.getState().shapes;
    const currentPath = vectorStore.getState().currentPath;
    
    // Update selected shapes
    if (selectedShapes.length > 0) {
      const updatedShapes = currentShapes.map(shape => {
        if (selectedShapes.includes(shape.id)) {
          const updatedPath = {
            ...shape.path,
            fillColor: defaultFillColor,
            strokeColor: defaultStrokeColor,
            strokeWidth: defaultStrokeWidth,
            fill: defaultFillType !== 'none',
            stroke: defaultStrokeEnabled,
            fillType: defaultFillType,
            fillOpacity: defaultFillOpacity,
            strokeOpacity: defaultStrokeOpacity,
            gradient: defaultFillType !== 'solid' ? { ...defaultGradient } : undefined,
            strokeJoin: defaultStrokeJoin,
            strokeCap: defaultStrokeCap
          };
          return { ...shape, path: updatedPath };
        }
        return shape;
      });
      
      vectorStore.setState({ shapes: updatedShapes });
      console.log('Applied settings to selected shapes:', selectedShapes.length);
    }
    
    // Update current path if it exists
    if (currentPath) {
      const updatedCurrentPath = {
        ...currentPath,
        fillColor: defaultFillColor,
        strokeColor: defaultStrokeColor,
        strokeWidth: defaultStrokeWidth,
        fill: defaultFillType !== 'none',
        stroke: defaultStrokeEnabled,
        fillType: defaultFillType,
        fillOpacity: defaultFillOpacity,
        strokeOpacity: defaultStrokeOpacity,
        gradient: defaultFillType !== 'solid' ? { ...defaultGradient } : undefined,
        strokeJoin: defaultStrokeJoin,
        strokeCap: defaultStrokeCap
      };
      vectorStore.setState({ currentPath: updatedCurrentPath });
      console.log('Updated current path with new settings');
    }
  }, [selectedShapes, defaultFillColor, defaultStrokeColor, defaultStrokeWidth, defaultFillType, defaultStrokeEnabled, defaultFillOpacity, defaultStrokeOpacity, defaultGradient, defaultStrokeJoin, defaultStrokeCap]);

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

    // Get current state from vector store
    const currentState = vectorStore.getState();
    const currentShapes = currentState.shapes;
    const currentSelected = currentState.selected;

    // Draw all shapes
    currentShapes.forEach(shape => {
      const isSelected = currentSelected.includes(shape.id);
      
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

  // Path operations (simplified without paper.js)
  const performPathOperation = useCallback((operation: keyof typeof pathOperations) => {
    if (selectedShapes.length < 2) {
      console.log('Need at least 2 shapes for path operations');
      return;
    }
    
    // For now, just combine the shapes into a single shape
    // This is a simplified implementation without complex boolean operations
    const shapes = vectorStore.getState().shapes;
    const s1 = shapes.find(s => s.id === selectedShapes[0]);
    const s2 = shapes.find(s => s.id === selectedShapes[1]);
    if (!s1 || !s2) return;

    // Create a combined shape by merging points
    const combinedPoints = [...s1.path.points, ...s2.path.points];
    const combinedPath: VectorPath = {
      id: `path_${Date.now()}`,
      points: combinedPoints,
      closed: false,
      fillColor: s1.path.fillColor,
      strokeColor: s1.path.strokeColor,
      strokeWidth: s1.path.strokeWidth,
      fill: s1.path.fill,
      stroke: s1.path.stroke,
      fillType: s1.path.fillType,
      fillOpacity: s1.path.fillOpacity,
      strokeOpacity: s1.path.strokeOpacity,
      gradient: s1.path.gradient,
      strokeJoin: s1.path.strokeJoin,
      strokeCap: s1.path.strokeCap
    };
    
    const combinedShape: VectorShape = {
      id: `shape_${Date.now()}`,
      type: 'path',
      path: combinedPath,
      bounds: calculatePathBounds(combinedPath)
    };

    // Update vector store
    const updatedShapes = shapes.filter(s => !selectedShapes.includes(s.id));
    vectorStore.setAll({
      shapes: [...updatedShapes, combinedShape],
      selected: [combinedShape.id],
      currentPath: null
    });
    
    console.log(`Path operation ${operation} completed`);
  }, [selectedShapes, calculatePathBounds]);

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

  // Mouse events are handled by VectorOverlay component
  // This component only provides the UI controls

  // Mouse events are handled by VectorOverlay component

  // Render shapes when they change
  useEffect(() => {
    renderVectorShapes();
  }, [renderVectorShapes]);

  // Re-render when vector store changes
  useEffect(() => {
    const unsubscribe = vectorStore.subscribe(() => {
      renderVectorShapes();
    });
    return unsubscribe;
  }, [renderVectorShapes]);

  // Update current path when settings change
  useEffect(() => {
    const currentPath = vectorStore.getState().currentPath;
    if (currentPath) {
      const updatedCurrentPath = {
        ...currentPath,
        fillColor: defaultFillColor,
        strokeColor: defaultStrokeColor,
        strokeWidth: defaultStrokeWidth,
        fill: defaultFillType !== 'none',
        stroke: defaultStrokeEnabled,
        fillType: defaultFillType,
        fillOpacity: defaultFillOpacity,
        strokeOpacity: defaultStrokeOpacity,
        gradient: defaultFillType !== 'solid' ? { ...defaultGradient } : undefined,
        strokeJoin: defaultStrokeJoin,
        strokeCap: defaultStrokeCap
      };
      vectorStore.setState({ currentPath: updatedCurrentPath });
      
      // Trigger re-render by calling the 3D canvas render function
      // This will update the vector rendering on the 3D model
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('vectorSettingsChanged'));
      }
    }
  }, [defaultFillColor, defaultStrokeColor, defaultStrokeWidth, defaultFillType, defaultStrokeEnabled, defaultFillOpacity, defaultStrokeOpacity, defaultGradient, defaultStrokeJoin, defaultStrokeCap]);

  if (!active) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '20px',
      width: '300px',
      background: 'linear-gradient(135deg, rgb(30, 41, 59) 0%, rgb(15, 23, 42) 100%)',
      border: '2px solid rgb(139, 92, 246)',
      borderRadius: '12px',
      padding: '16px',
      color: 'white',
      zIndex: 1000,
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(168, 85, 247) 100%)',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '16px',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>🎨 Vector Tools</h3>
      </div>

      {/* Tool Selection */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ marginBottom: '8px', fontWeight: 500, color: '#E2E8F0' }}>Tool</div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(['pen', 'pathSelection', 'addAnchor', 'removeAnchor', 'convertAnchor', 'curvature'] as VectorTool[]).map(tool => (
            <button
              key={tool}
              className={`btn ${vectorTool === tool ? 'active' : ''}`}
              onClick={() => {
                vectorStore.setState({ tool: tool });
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                background: vectorTool === tool ? 'rgb(139, 92, 246)' : 'rgba(139, 92, 246, 0.1)',
                color: 'white',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {tool.charAt(0).toUpperCase() + tool.slice(1).replace(/([A-Z])/g, ' $1')}
            </button>
          ))}
        </div>
      </div>


      {/* Fill & Stroke Controls */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ marginBottom: '12px', fontWeight: 500, color: '#E2E8F0' }}>Fill & Stroke</div>
        
        {/* Fill Controls */}
        <div style={{ 
          background: 'rgba(139, 92, 246, 0.1)', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '12px',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={defaultFillType !== 'none'}
              onChange={(e) => {
                setDefaultFillType(e.target.checked ? 'solid' : 'none');
                applySettingsToSelected();
              }}
              style={{ marginRight: '8px' }}
            />
            <span style={{ fontWeight: 500 }}>Fill</span>
          </div>
          
          {defaultFillType !== 'none' && (
            <>
              <div style={{ marginBottom: '8px' }}>
                <div style={{ marginBottom: '4px', fontSize: '12px', color: '#CBD5E1' }}>Fill Type</div>
                <select
                  value={defaultFillType}
                  onChange={(e) => {
                    setDefaultFillType(e.target.value as FillType);
                    applySettingsToSelected();
                  }}
                  style={{
                    width: '100%',
                    padding: '6px',
                    borderRadius: '4px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: 'white'
                  }}
                >
                  <option value="solid">Solid Color</option>
                  <option value="linear">Linear Gradient</option>
                  <option value="radial">Radial Gradient</option>
                  <option value="image">Image Fill</option>
                </select>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <div style={{ marginBottom: '4px', fontSize: '12px', color: '#CBD5E1' }}>Fill Color</div>
                <input
                  type="color"
                  value={defaultFillType === 'solid' ? defaultFillColor : defaultGradient.color1}
                  onChange={(e) => {
                    if (defaultFillType === 'solid') {
                      setDefaultFillColor(e.target.value);
                    } else {
                      setDefaultGradient(prev => ({ ...prev, color1: e.target.value }));
                    }
                    applySettingsToSelected();
                  }}
                  style={{
                    width: '100%',
                    height: '32px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <div style={{ marginBottom: '4px', fontSize: '12px', color: '#CBD5E1' }}>Fill Opacity: {Math.round(defaultFillOpacity * 100)}%</div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={defaultFillOpacity}
                  onChange={(e) => {
                    setDefaultFillOpacity(Number(e.target.value));
                    applySettingsToSelected();
                  }}
                  style={{ width: '100%' }}
                />
              </div>

              {(defaultFillType === 'linear' || defaultFillType === 'radial') && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ marginBottom: '4px', fontSize: '12px', color: '#CBD5E1' }}>Gradient Color 2</div>
                  <input
                    type="color"
                    value={defaultGradient.color2}
                    onChange={(e) => setDefaultGradient(prev => ({ ...prev, color2: e.target.value }))}
                    style={{
                      width: '100%',
                      height: '32px',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              )}

              {defaultFillType === 'linear' && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ marginBottom: '4px', fontSize: '12px', color: '#CBD5E1' }}>Angle: {defaultGradient.angle}°</div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={defaultGradient.angle}
                    onChange={(e) => setDefaultGradient(prev => ({ ...prev, angle: Number(e.target.value) }))}
                    style={{ width: '100%' }}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Stroke Controls */}
        <div style={{ 
          background: 'rgba(139, 92, 246, 0.1)', 
          padding: '12px', 
          borderRadius: '8px',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={defaultStrokeEnabled}
              onChange={(e) => {
                setDefaultStrokeEnabled(e.target.checked);
                applySettingsToSelected();
              }}
              style={{ marginRight: '8px' }}
            />
            <span style={{ fontWeight: 500 }}>Stroke</span>
          </div>
          
          {defaultStrokeEnabled && (
            <>
              <div style={{ marginBottom: '8px' }}>
                <div style={{ marginBottom: '4px', fontSize: '12px', color: '#CBD5E1' }}>Stroke Color</div>
                <input
                  type="color"
                  value={defaultStrokeColor}
                  onChange={(e) => {
                    setDefaultStrokeColor(e.target.value);
                    applySettingsToSelected();
                  }}
                  style={{
                    width: '100%',
                    height: '32px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <div style={{ marginBottom: '4px', fontSize: '12px', color: '#CBD5E1' }}>Stroke Width: {defaultStrokeWidth}px</div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={defaultStrokeWidth}
                  onChange={(e) => {
                    setDefaultStrokeWidth(Number(e.target.value));
                    applySettingsToSelected();
                  }}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <div style={{ marginBottom: '4px', fontSize: '12px', color: '#CBD5E1' }}>Stroke Opacity: {Math.round(defaultStrokeOpacity * 100)}%</div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={defaultStrokeOpacity}
                  onChange={(e) => {
                    setDefaultStrokeOpacity(Number(e.target.value));
                    applySettingsToSelected();
                  }}
                  style={{ width: '100%' }}
                />
              </div>
            </>
          )}

          <div style={{ marginBottom: '8px' }}>
            <div style={{ marginBottom: '4px', fontSize: '12px', color: '#CBD5E1' }}>Line Join</div>
            <select
              value={defaultStrokeJoin}
              onChange={(e) => {
                setDefaultStrokeJoin(e.target.value as CanvasLineJoin);
                applySettingsToSelected();
              }}
              style={{
                width: '100%',
                padding: '6px',
                borderRadius: '4px',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                background: 'rgba(15, 23, 42, 0.8)',
                color: 'white'
              }}
            >
              <option value="round">Round</option>
              <option value="bevel">Bevel</option>
              <option value="miter">Miter</option>
            </select>
          </div>

          <div>
            <div style={{ marginBottom: '4px', fontSize: '12px', color: '#CBD5E1' }}>Line Cap</div>
            <select
              value={defaultStrokeCap}
              onChange={(e) => {
                setDefaultStrokeCap(e.target.value as CanvasLineCap);
                applySettingsToSelected();
              }}
              style={{
                width: '100%',
                padding: '6px',
                borderRadius: '4px',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                background: 'rgba(15, 23, 42, 0.8)',
                color: 'white'
              }}
            >
              <option value="round">Round</option>
              <option value="butt">Butt</option>
              <option value="square">Square</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
        {selectedShapes.length > 0 && (
          <button
            onClick={applySettingsToSelected}
            style={{
              width: '100%',
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              background: 'rgba(34, 197, 94, 0.1)',
              color: '#86EFAC',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Apply to Selected ({selectedShapes.length})
          </button>
        )}
        
        <button
          onClick={() => {
            // Trigger the clear event - all clearing logic is handled in the event listener
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('clearActiveLayer'));
            }
            
            console.log('🧹 Clear All button clicked');
          }}
          style={{
            width: '100%',
            padding: '8px 16px',
            borderRadius: '6px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#FCA5A5',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Clear All
        </button>
      </div>
    </div>
  );
}

