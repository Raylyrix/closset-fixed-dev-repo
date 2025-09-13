/**
 * 🎯 Shirt Events Hook
 *
 * Handles all mouse and pointer events for the shirt component
 * Extracted from Shirt.js for better separation of concerns
 */
import { useCallback, useRef, useState } from 'react';
import { useApp } from '../../../App';
import { vectorStore } from '../../../vector/vectorState';
import { performanceMonitor } from '../../../utils/PerformanceMonitor';
export const useShirtEvents = () => {
    const activeTool = useApp(s => s.activeTool);
    const vectorMode = useApp(s => s.vectorMode);
    const brushColor = useApp(s => s.brushColor);
    const brushSize = useApp(s => s.brushSize);
    const brushOpacity = useApp(s => s.brushOpacity);
    const getActiveLayer = useApp(s => s.getActiveLayer);
    const composeLayers = useApp(s => s.composeLayers);
    // Event state
    const [isPainting, setIsPainting] = useState(false);
    const [currentPath, setCurrentPath] = useState(null);
    const [selectedAnchor, setSelectedAnchor] = useState(null);
    const [draggingAnchor, setDraggingAnchor] = useState(null);
    const [draggingControl, setDraggingControl] = useState(null);
    // Performance tracking
    const lastEventTimeRef = useRef(0);
    const eventThrottleRef = useRef(null);
    // Throttle events for performance
    const throttleEvent = useCallback((fn, delay = 16) => {
        if (eventThrottleRef.current) {
            clearTimeout(eventThrottleRef.current);
        }
        eventThrottleRef.current = window.setTimeout(fn, delay);
    }, []);
    // Convert UV to canvas coordinates
    const uvToCanvasCoordinates = useCallback((uv, canvas) => {
        const x = Math.round(uv.x * canvas.width);
        const y = Math.round(uv.y * canvas.height);
        return { x, y };
    }, []);
    // Validate and correct coordinates
    const validateAndCorrectCoordinates = useCallback((uv, canvas) => {
        // Clamp UV coordinates to valid range
        const correctedUV = {
            x: Math.max(0, Math.min(1, uv.x)),
            y: Math.max(0, Math.min(1, uv.y))
        };
        return correctedUV;
    }, []);
    // Handle mouse down
    const handleMouseDown = useCallback((event) => {
        if (!event.uv)
            return;
        const layer = getActiveLayer();
        if (!layer)
            return;
        const canvas = layer.canvas;
        const validatedUV = validateAndCorrectCoordinates(event.uv, canvas);
        const coords = uvToCanvasCoordinates(validatedUV, canvas);
        try {
            if (vectorMode) {
                handleVectorMouseDown(event, coords, canvas);
            }
            else {
                handleBrushMouseDown(event, coords, canvas);
            }
        }
        catch (error) {
            console.error('❌ Error in mouse down:', error);
            performanceMonitor.trackError('mouse_down', error);
        }
    }, [vectorMode, getActiveLayer, validateAndCorrectCoordinates, uvToCanvasCoordinates]);
    // Handle vector mouse down
    const handleVectorMouseDown = useCallback((event, coords, canvas) => {
        const { shapes } = vectorStore.getState();
        if (activeTool === 'pen') {
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
        }
        else if (activeTool === 'select') {
            // Handle selection
            handleSelection(event, coords, shapes);
        }
    }, [activeTool]);
    // Handle brush mouse down
    const handleBrushMouseDown = useCallback((event, coords, canvas) => {
        setIsPainting(true);
        // Start brush stroke
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        ctx.strokeStyle = brushColor;
        ctx.lineWidth = brushSize;
        ctx.globalAlpha = brushOpacity;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
        console.log('🎨 Brush tool - Started stroke');
    }, [brushColor, brushSize, brushOpacity]);
    // Handle mouse move
    const handleMouseMove = useCallback((event) => {
        if (!event.uv || !isPainting)
            return;
        const layer = getActiveLayer();
        if (!layer)
            return;
        const canvas = layer.canvas;
        const validatedUV = validateAndCorrectCoordinates(event.uv, canvas);
        const coords = uvToCanvasCoordinates(validatedUV, canvas);
        throttleEvent(() => {
            try {
                if (vectorMode) {
                    handleVectorMouseMove(event, coords, canvas);
                }
                else {
                    handleBrushMouseMove(event, coords, canvas);
                }
            }
            catch (error) {
                console.error('❌ Error in mouse move:', error);
                performanceMonitor.trackError('mouse_move', error);
            }
        });
    }, [isPainting, vectorMode, getActiveLayer, validateAndCorrectCoordinates, uvToCanvasCoordinates, throttleEvent]);
    // Handle vector mouse move
    const handleVectorMouseMove = useCallback((event, coords, canvas) => {
        if (activeTool === 'pen' && currentPath) {
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
    const handleBrushMouseMove = useCallback((event, coords, canvas) => {
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
    }, []);
    // Handle mouse up
    const handleMouseUp = useCallback((event) => {
        if (!isPainting)
            return;
        try {
            if (vectorMode) {
                handleVectorMouseUp(event);
            }
            else {
                handleBrushMouseUp(event);
            }
        }
        catch (error) {
            console.error('❌ Error in mouse up:', error);
            performanceMonitor.trackError('mouse_up', error);
        }
        finally {
            setIsPainting(false);
        }
    }, [isPainting, vectorMode]);
    // Handle vector mouse up
    const handleVectorMouseUp = useCallback((event) => {
        if (activeTool === 'pen' && currentPath) {
            // Commit path
            const { shapes } = vectorStore.getState();
            const newShape = {
                id: `shape_${Date.now()}`,
                type: 'path',
                path: currentPath,
                tool: activeTool,
                bounds: calculateBounds(currentPath.points)
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
    }, [activeTool, currentPath, composeLayers]);
    // Handle brush mouse up
    const handleBrushMouseUp = useCallback((event) => {
        // Brush stroke completed
        composeLayers();
        console.log('✅ Brush stroke completed');
    }, [composeLayers]);
    // Handle selection
    const handleSelection = useCallback((event, coords, shapes) => {
        // Find shape at coordinates
        const selectedShape = shapes.find(shape => {
            if (!shape || !shape.path || !shape.path.points)
                return false;
            return shape.path.points.some((point) => {
                const distance = Math.sqrt(Math.pow(point.x - coords.x, 2) + Math.pow(point.y - coords.y, 2));
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
    const calculateBounds = useCallback((points) => {
        if (points.length === 0)
            return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
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
