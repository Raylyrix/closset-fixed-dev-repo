import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * 🎯 Enhanced Vector Canvas Component
 *
 * React component that integrates all vector tools and fixes click and drag issues
 * Provides seamless integration between vector tools and embroidery system
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ComprehensiveVectorSystem } from '../vector/ComprehensiveVectorSystem';
import { ProfessionalToolSet } from '../vector/ProfessionalToolSet';
import { UniversalMediaIntegration } from '../vector/UniversalMediaIntegration';
export const EnhancedVectorCanvas = ({ width = 800, height = 600, onToolChange, onMediaTypeChange, onPathCreated, onPathUpdated, onPathDeleted, className = '', style = {} }) => {
    const canvasRef = useRef(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [currentTool, setCurrentTool] = useState('pen');
    const [currentMediaType, setCurrentMediaType] = useState('digital_print');
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(null);
    // System instances
    const vectorSystem = ComprehensiveVectorSystem.getInstance();
    const toolSet = ProfessionalToolSet.getInstance();
    const mediaIntegration = UniversalMediaIntegration.getInstance();
    // Initialize systems
    useEffect(() => {
        const initializeSystems = async () => {
            try {
                // Activate the comprehensive vector system
                vectorSystem.activate();
                // Set up event listeners
                vectorSystem.on('tool:changed', (data) => {
                    setCurrentTool(data.tool);
                    onToolChange?.(data.tool);
                });
                vectorSystem.on('mediaType:changed', (data) => {
                    setCurrentMediaType(data.mediaTypeId);
                    onMediaTypeChange?.(data.mediaTypeId);
                });
                vectorSystem.on('path:created', (data) => {
                    onPathCreated?.(data.path);
                });
                vectorSystem.on('path:updated', (data) => {
                    onPathUpdated?.(data.path);
                });
                vectorSystem.on('path:deleted', (data) => {
                    onPathDeleted?.(data.pathId);
                });
                setIsInitialized(true);
            }
            catch (error) {
                console.error('Error initializing vector systems:', error);
            }
        };
        initializeSystems();
    }, [vectorSystem, onToolChange, onMediaTypeChange, onPathCreated, onPathUpdated, onPathDeleted]);
    // Handle mouse events
    const handleMouseDown = useCallback((event) => {
        if (!isInitialized || !canvasRef.current)
            return;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        // Convert to normalized coordinates
        const point = {
            x: (x / canvas.width) * 2 - 1,
            y: -((y / canvas.height) * 2 - 1)
        };
        // Set drag state
        setIsDragging(true);
        setDragStart({ x, y });
        // Handle with vector system
        const result = vectorSystem.handleMouseDown(event.nativeEvent, point, [], undefined);
        if (result.success) {
            console.log('Mouse down handled:', result.message);
        }
        else {
            console.error('Mouse down error:', result.error);
        }
    }, [isInitialized, vectorSystem]);
    const handleMouseMove = useCallback((event) => {
        if (!isInitialized || !canvasRef.current || !isDragging)
            return;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        // Convert to normalized coordinates
        const point = {
            x: (x / canvas.width) * 2 - 1,
            y: -((y / canvas.height) * 2 - 1)
        };
        // Handle with vector system
        const result = vectorSystem.handleMouseMove(event.nativeEvent, point, [], undefined);
        if (result.success && result.requiresRedraw) {
            // Trigger re-render
            redrawCanvas();
        }
    }, [isInitialized, vectorSystem, isDragging]);
    const handleMouseUp = useCallback((event) => {
        if (!isInitialized || !canvasRef.current || !isDragging)
            return;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        // Convert to normalized coordinates
        const point = {
            x: (x / canvas.width) * 2 - 1,
            y: -((y / canvas.height) * 2 - 1)
        };
        // Reset drag state
        setIsDragging(false);
        setDragStart(null);
        // Handle with vector system
        const result = vectorSystem.handleMouseUp(event.nativeEvent, point, [], undefined);
        if (result.success) {
            console.log('Mouse up handled:', result.message);
            // Trigger final re-render
            redrawCanvas();
        }
        else {
            console.error('Mouse up error:', result.error);
        }
    }, [isInitialized, vectorSystem, isDragging]);
    // Redraw canvas
    const redrawCanvas = useCallback(() => {
        if (!canvasRef.current)
            return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Redraw based on current tool and media type
        // This would integrate with the actual rendering system
        drawCurrentTool(ctx);
    }, [currentTool, currentMediaType]);
    // Draw current tool
    const drawCurrentTool = useCallback((ctx) => {
        const tool = toolSet.getActiveTool();
        if (!tool)
            return;
        // Set up drawing context based on tool
        ctx.strokeStyle = tool.config.color;
        ctx.lineWidth = tool.config.size;
        ctx.globalAlpha = tool.config.opacity;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // Draw based on tool type
        switch (tool.id) {
            case 'pen':
            case 'pencil':
            case 'brush':
                // Draw path preview
                if (isDragging && dragStart) {
                    ctx.beginPath();
                    ctx.moveTo(dragStart.x, dragStart.y);
                    ctx.lineTo(ctx.canvas.width / 2, ctx.canvas.height / 2);
                    ctx.stroke();
                }
                break;
            case 'rectangle':
                // Draw rectangle preview
                if (isDragging && dragStart) {
                    const currentX = ctx.canvas.width / 2;
                    const currentY = ctx.canvas.height / 2;
                    const width = currentX - dragStart.x;
                    const height = currentY - dragStart.y;
                    ctx.strokeRect(dragStart.x, dragStart.y, width, height);
                }
                break;
            case 'ellipse':
                // Draw ellipse preview
                if (isDragging && dragStart) {
                    const currentX = ctx.canvas.width / 2;
                    const currentY = ctx.canvas.height / 2;
                    const centerX = (dragStart.x + currentX) / 2;
                    const centerY = (dragStart.y + currentY) / 2;
                    const radiusX = Math.abs(currentX - dragStart.x) / 2;
                    const radiusY = Math.abs(currentY - dragStart.y) / 2;
                    ctx.beginPath();
                    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
                    ctx.stroke();
                }
                break;
        }
    }, [toolSet, isDragging, dragStart]);
    // Handle tool change
    const handleToolChange = useCallback((toolId) => {
        const success = vectorSystem.setTool(toolId);
        if (success) {
            setCurrentTool(toolId);
            onToolChange?.(toolId);
        }
    }, [vectorSystem, onToolChange]);
    // Handle media type change
    const handleMediaTypeChange = useCallback((mediaTypeId) => {
        const success = vectorSystem.setMediaType(mediaTypeId);
        if (success) {
            setCurrentMediaType(mediaTypeId);
            onMediaTypeChange?.(mediaTypeId);
        }
    }, [vectorSystem, onMediaTypeChange]);
    // Get available tools
    const getAvailableTools = useCallback(() => {
        return toolSet.getAllTools();
    }, [toolSet]);
    // Get available media types
    const getAvailableMediaTypes = useCallback(() => {
        return mediaIntegration.getAllMediaTypes();
    }, [mediaIntegration]);
    // Expose methods for parent components
    React.useImperativeHandle(React.forwardRef(() => null), () => ({
        setTool: handleToolChange,
        setMediaType: handleMediaTypeChange,
        getAvailableTools,
        getAvailableMediaTypes,
        redraw: redrawCanvas
    }));
    return (_jsxs("div", { className: `enhanced-vector-canvas ${className}`, style: style, children: [_jsx("canvas", { ref: canvasRef, width: width, height: height, onMouseDown: handleMouseDown, onMouseMove: handleMouseMove, onMouseUp: handleMouseUp, style: {
                    cursor: isDragging ? 'crosshair' : 'default',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                } }), isInitialized && (_jsxs("div", { style: {
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    fontSize: '12px'
                }, children: ["Tool: ", currentTool, " | Media: ", currentMediaType, isDragging && ' | Dragging'] }))] }));
};
export default EnhancedVectorCanvas;
