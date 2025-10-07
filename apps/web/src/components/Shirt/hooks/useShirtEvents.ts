/**
 * 🎯 Shirt Events Hook
 * 
 * Handles all mouse and pointer events for the shirt component
 * Extracted from Shirt.js for better separation of concerns
 */

import { useCallback, useRef, useState } from 'react';
import { useApp } from '../../../App';
import { vectorStore } from '../../../vector/vectorState';
import { VectorPath } from '../../../vector/VectorStateManager';
import { performanceMonitor } from '../../../utils/PerformanceMonitor';

export const useShirtEvents = () => {
  const activeTool = useApp(s => s.activeTool);
  const vectorMode = useApp(s => s.vectorMode);
  const brushColor = useApp(s => s.brushColor);
  const brushSize = useApp(s => s.brushSize);
  const brushOpacity = useApp(s => s.brushOpacity);
  const strokeEnabled = useApp(s => s.strokeEnabled);
  const strokeColor = useApp(s => s.strokeColor);
  const strokeWidth = useApp(s => s.strokeWidth);
  const getActiveLayer = useApp(s => s.getActiveLayer);
  const composeLayers = useApp(s => s.composeLayers);
  
  // Event state
  const [isPainting, setIsPainting] = useState(false);
  const [currentPath, setCurrentPath] = useState<any>(null);
  const [selectedAnchor, setSelectedAnchor] = useState<any>(null);
  const [draggingAnchor, setDraggingAnchor] = useState<any>(null);
  const [draggingControl, setDraggingControl] = useState<any>(null);
  
  // Performance tracking
  const lastEventTimeRef = useRef<number>(0);
  const eventThrottleRef = useRef<number | null>(null);
  
  // Throttle events for performance
  const throttleEvent = useCallback((fn: () => void, delay: number = 16) => {
    if (eventThrottleRef.current) {
      clearTimeout(eventThrottleRef.current);
    }
    
    eventThrottleRef.current = window.setTimeout(fn, delay);
  }, []);
  
  // Convert UV to canvas coordinates
  const uvToCanvasCoordinates = useCallback((uv: { x: number; y: number }, canvas: HTMLCanvasElement) => {
    const x = Math.round(uv.x * canvas.width);
    const y = Math.round(uv.y * canvas.height);
    return { x, y };
  }, []);
  
  // Validate and correct coordinates
  const validateAndCorrectCoordinates = useCallback((uv: { x: number; y: number }, canvas: HTMLCanvasElement) => {
    // Clamp UV coordinates to valid range
    const correctedUV = {
      x: Math.max(0, Math.min(1, uv.x)),
      y: Math.max(0, Math.min(1, uv.y))
    };
    
    return correctedUV;
  }, []);
  
  // Handle mouse down
  const handleMouseDown = useCallback((event: any) => {
    if (!event.uv) return;
    
    const layer = getActiveLayer();
    if (!layer) return;
    
    const canvas = layer.canvas;
    const validatedUV = validateAndCorrectCoordinates(event.uv, canvas);
    const coords = uvToCanvasCoordinates(validatedUV, canvas);
    
    try {
      if (vectorMode) {
        handleVectorMouseDown(event, coords, canvas);
      } else {
        handleBrushMouseDown(event, coords, canvas);
      }
    } catch (error) {
      console.error('❌ Error in mouse down:', error);
      performanceMonitor.trackError(error as Error, 'useShirtEvents', 'high', { phase: 'mouse_down' });
    }
  }, [vectorMode, getActiveLayer, validateAndCorrectCoordinates, uvToCanvasCoordinates]);
  
  // Handle vector mouse down
  const handleVectorMouseDown = useCallback((event: any, coords: { x: number; y: number }, canvas: HTMLCanvasElement) => {
    const { shapes } = vectorStore.getState();
    
    if (String(activeTool) === 'pen') {
      // Start new path
      const newPath = {
        points: [{
          x: coords.x,
          y: coords.y,
          anchor: true,
          controlIn: null,
          controlOut: null
        }],
        closed: false
      };
      
      setCurrentPath(newPath);
      setIsPainting(true);
      
      console.log('🎯 Pen tool - Started new path');
      
    } else if (activeTool === 'select') {
      // Handle selection
      handleSelection(event, coords, shapes);
    }
  }, [activeTool]);
  
  // Handle brush mouse down
  const handleBrushMouseDown = useCallback((event: any, coords: { x: number; y: number }, canvas: HTMLCanvasElement) => {
    setIsPainting(true);
    
    // Start brush stroke
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (strokeEnabled && strokeWidth > 0) {
      ctx.save();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = Math.max(1, brushSize + strokeWidth * 2);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = brushOpacity;
      // Render initial dot with arc so outline is visible without movement
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, Math.max(1, brushSize / 2 + strokeWidth), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.globalAlpha = brushOpacity;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Fill dot for initial click
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, Math.max(1, brushSize / 2), 0, Math.PI * 2);
    ctx.stroke();
    // Start path for subsequent movement
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    
    console.log('🎨 Brush tool - Started stroke');
  }, [brushColor, brushSize, brushOpacity, strokeColor, strokeEnabled, strokeWidth]);
  
  // Handle mouse move
  const handleMouseMove = useCallback((event: any) => {
    if (!event.uv || !isPainting) return;
    
    const layer = getActiveLayer();
    if (!layer) return;
    
    const canvas = layer.canvas;
    const validatedUV = validateAndCorrectCoordinates(event.uv, canvas);
    const coords = uvToCanvasCoordinates(validatedUV, canvas);
    
    throttleEvent(() => {
      try {
        if (vectorMode) {
          handleVectorMouseMove(event, coords, canvas);
        } else {
          handleBrushMouseMove(event, coords, canvas);
        }
      } catch (error) {
        console.error('❌ Error in mouse move:', error);
        performanceMonitor.trackError(error as Error, 'useShirtEvents', 'medium', { phase: 'mouse_move' });
      }
    });
  }, [isPainting, vectorMode, getActiveLayer, validateAndCorrectCoordinates, uvToCanvasCoordinates, throttleEvent]);
  
  // Handle vector mouse move
  const handleVectorMouseMove = useCallback((event: any, coords: { x: number; y: number }, canvas: HTMLCanvasElement) => {
    if (String(activeTool) === 'pen' && currentPath) {
      // Add point to current path
      const newPoint = {
        x: coords.x,
        y: coords.y,
        anchor: true,
        controlIn: null,
        controlOut: null
      };
      
      const updatedPath = {
        ...currentPath,
        points: [...currentPath.points, newPoint]
      };
      
      setCurrentPath(updatedPath);
      
      // Render preview
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = brushColor;
        ctx.lineWidth = brushSize;
        ctx.globalAlpha = brushOpacity;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(currentPath.points[currentPath.points.length - 2].x, currentPath.points[currentPath.points.length - 2].y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      }
    }
  }, [activeTool, currentPath, brushColor, brushSize, brushOpacity]);
  
  // Handle brush mouse move
  const handleBrushMouseMove = useCallback((event: any, coords: { x: number; y: number }, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineTo(coords.x, coords.y);
    
    if (strokeEnabled && strokeWidth > 0) {
      ctx.save();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = Math.max(1, brushSize + strokeWidth * 2);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = brushOpacity;
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = brushOpacity;
    ctx.stroke();
    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  }, [brushColor, brushSize, brushOpacity, strokeColor, strokeEnabled, strokeWidth]);
  
  // Handle mouse up
  const handleMouseUp = useCallback((event: any) => {
    if (!isPainting) return;
    
    try {
      if (vectorMode) {
        handleVectorMouseUp(event);
      } else {
        handleBrushMouseUp(event);
      }
    } catch (error) {
      console.error('❌ Error in mouse up:', error);
      performanceMonitor.trackError(error as Error, 'useShirtEvents', 'medium', { phase: 'mouse_up' });
    } finally {
      setIsPainting(false);
    }
  }, [isPainting, vectorMode]);
  
  // Handle vector mouse up
  const handleVectorMouseUp = useCallback((event: any) => {
    if (String(activeTool) === 'pen' && currentPath) {
      // Commit path into a proper VectorPath
      const { shapes } = vectorStore.getState();
      const bounds = calculateBounds(currentPath.points);
      const newShape: VectorPath = {
        id: `shape_${Date.now()}`,
        points: currentPath.points,
        closed: false,
        type: 'path',
        style: {},
        fill: false,
        stroke: true,
        fillColor: '#00000000',
        strokeColor: brushColor,
        strokeWidth: brushSize,
        fillOpacity: 0,
        strokeOpacity: brushOpacity,
        strokeJoin: 'round',
        strokeCap: 'round',
        bounds: { x: bounds.minX, y: bounds.minY, width: bounds.maxX - bounds.minX, height: bounds.maxY - bounds.minY },
      };
      
      vectorStore.setState({
        shapes: [...shapes, newShape],
        currentPath: null
      });
      setCurrentPath(null);
      // Re-render
      composeLayers();
      console.log('✅ Path committed');
    }
  }, [activeTool, currentPath, composeLayers, brushColor, brushSize, brushOpacity]);
  
  // Handle brush mouse up
  const handleBrushMouseUp = useCallback((event: any) => {
    // Brush stroke completed
    composeLayers();
    console.log('✅ Brush stroke completed');
  }, [composeLayers]);
  
  // Handle selection
  const handleSelection = useCallback((event: any, coords: { x: number; y: number }, shapes: any[]) => {
    // Find shape at coordinates
    const selectedShape = shapes.find(shape => {
      if (!shape || !shape.path || !shape.path.points) return false;
      
      return shape.path.points.some((point: any) => {
        const distance = Math.sqrt(
          Math.pow(point.x - coords.x, 2) + Math.pow(point.y - coords.y, 2)
        );
        return distance < 10; // 10 pixel tolerance
      });
    });
    
    if (selectedShape) {
      vectorStore.setState({
        selected: [selectedShape.id]
      });
      console.log('✅ Shape selected:', selectedShape.id);
    }
  }, []);
  
  // Calculate bounds
  const calculateBounds = useCallback((points: any[]) => {
    if (points.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    
    let minX = points[0].x;
    let minY = points[0].y;
    let maxX = points[0].x;
    let maxY = points[0].y;
    
    points.forEach(point => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });
    
    return { minX, minY, maxX, maxY };
  }, []);
  
  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isPainting,
    currentPath,
    selectedAnchor,
    setSelectedAnchor,
    draggingAnchor,
    setDraggingAnchor,
    draggingControl,
    setDraggingControl
  };
};

export default useShirtEvents;
