import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../App';
export function PatternMaker({ active }) {
    // Console log removed
    const { composedCanvas, activeTool, brushColor, brushSize, brushOpacity, layers, activeLayerId, commit } = useApp();
    // Pattern state
    const [patternSettings, setPatternSettings] = useState({
        tileWidth: 256,
        tileHeight: 256,
        offsetX: 0,
        offsetY: 0,
        repeatType: 'basic',
        seamless: true,
        previewSize: 512
    });
    const [isCreatingPattern, setIsCreatingPattern] = useState(false);
    const [patternTiles, setPatternTiles] = useState([]);
    const [previewCanvas, setPreviewCanvas] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(null);
    // Refs
    const patternCanvasRef = useRef(null);
    const previewCanvasRef = useRef(null);
    const tileCanvasRef = useRef(null);
    // Initialize pattern canvas
    useEffect(() => {
        if (!active || !composedCanvas) {
            // Console log removed
            return;
        }
        console.log('🎨 PatternMaker: Initializing pattern canvas', {
            composedCanvasSize: `${composedCanvas.width}x${composedCanvas.height}`,
            tileSize: `${patternSettings.tileWidth}x${patternSettings.tileHeight}`
        });
        // Create pattern tile canvas
        const tileCanvas = document.createElement('canvas');
        tileCanvas.width = patternSettings.tileWidth;
        tileCanvas.height = patternSettings.tileHeight;
        tileCanvasRef.current = tileCanvas;
        // Create preview canvas
        const previewCanvas = document.createElement('canvas');
        previewCanvas.width = patternSettings.previewSize;
        previewCanvas.height = patternSettings.previewSize;
        setPreviewCanvas(previewCanvas);
        // Console log removed
    }, [active, composedCanvas, patternSettings.tileWidth, patternSettings.tileHeight, patternSettings.previewSize]);
    // Create seamless pattern tile
    const createSeamlessTile = useCallback((sourceCanvas) => {
        console.log('🎨 PatternMaker: Creating seamless tile', {
            sourceSize: `${sourceCanvas.width}x${sourceCanvas.height}`,
            tileSize: `${patternSettings.tileWidth}x${patternSettings.tileHeight}`
        });
        const tileCanvas = document.createElement('canvas');
        tileCanvas.width = patternSettings.tileWidth;
        tileCanvas.height = patternSettings.tileHeight;
        const ctx = tileCanvas.getContext('2d');
        // Calculate scaling factor
        const scaleX = patternSettings.tileWidth / sourceCanvas.width;
        const scaleY = patternSettings.tileHeight / sourceCanvas.height;
        const scale = Math.min(scaleX, scaleY);
        // Console log removed
        // Draw scaled source to tile
        ctx.save();
        ctx.scale(scale, scale);
        ctx.drawImage(sourceCanvas, 0, 0);
        ctx.restore();
        // Create seamless edges using offset method
        if (patternSettings.seamless) {
            // Console log removed
            // Copy edges to opposite sides for seamless tiling
            const halfWidth = Math.floor(patternSettings.tileWidth / 2);
            const halfHeight = Math.floor(patternSettings.tileHeight / 2);
            // Copy top edge to bottom
            const topEdge = ctx.getImageData(0, 0, patternSettings.tileWidth, halfHeight);
            ctx.putImageData(topEdge, 0, halfHeight);
            // Copy left edge to right
            const leftEdge = ctx.getImageData(0, 0, halfWidth, patternSettings.tileHeight);
            ctx.putImageData(leftEdge, halfWidth, 0);
            // Copy corners for perfect tiling
            const topLeft = ctx.getImageData(0, 0, halfWidth, halfHeight);
            ctx.putImageData(topLeft, halfWidth, halfHeight);
        }
        // Console log removed
        return tileCanvas;
    }, [patternSettings.tileWidth, patternSettings.tileHeight, patternSettings.seamless]);
    // Generate pattern preview
    const generatePatternPreview = useCallback(() => {
        if (!previewCanvas || !tileCanvasRef.current) {
            // Console log removed
            return;
        }
        console.log('🎨 PatternMaker: Generating pattern preview', {
            repeatType: patternSettings.repeatType,
            previewSize: patternSettings.previewSize
        });
        const ctx = previewCanvas.getContext('2d');
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        const tileWidth = patternSettings.tileWidth;
        const tileHeight = patternSettings.tileHeight;
        const offsetX = patternSettings.offsetX;
        const offsetY = patternSettings.offsetY;
        // Calculate number of tiles needed
        const tilesX = Math.ceil(previewCanvas.width / tileWidth) + 2;
        const tilesY = Math.ceil(previewCanvas.height / tileHeight) + 2;
        // Console log removed
        for (let y = 0; y < tilesY; y++) {
            for (let x = 0; x < tilesX; x++) {
                let drawX = x * tileWidth;
                let drawY = y * tileHeight;
                // Apply pattern-specific offsets
                switch (patternSettings.repeatType) {
                    case 'basic':
                        // No offset
                        break;
                    case 'brick':
                        // Offset every other row
                        if (y % 2 === 1) {
                            drawX += tileWidth / 2;
                        }
                        break;
                    case 'herringbone':
                        // Herringbone pattern
                        if (y % 2 === 1) {
                            drawX += tileWidth / 2;
                        }
                        if (x % 2 === 1) {
                            drawY += tileHeight / 2;
                        }
                        break;
                    case 'hexagon':
                        // Hexagonal tiling
                        const hexOffsetX = (y % 2) * (tileWidth * 0.75);
                        const hexOffsetY = y * (tileHeight * 0.866);
                        drawX = x * tileWidth + hexOffsetX;
                        drawY = hexOffsetY;
                        break;
                    case 'diamond':
                        // Diamond pattern
                        const diamondOffsetX = (y % 2) * (tileWidth / 2);
                        const diamondOffsetY = y * (tileHeight / 2);
                        drawX = x * tileWidth + diamondOffsetX;
                        drawY = diamondOffsetY;
                        break;
                }
                // Apply manual offsets
                drawX += offsetX;
                drawY += offsetY;
                // Draw tile
                ctx.drawImage(tileCanvasRef.current, drawX, drawY);
            }
        }
        // Console log removed
    }, [previewCanvas, patternSettings, tileCanvasRef.current]);
    // Start pattern creation
    const startPatternCreation = useCallback(() => {
        if (!composedCanvas || !activeLayerId) {
            console.log('🎨 PatternMaker: Cannot start pattern creation - missing requirements', {
                hasComposedCanvas: !!composedCanvas,
                activeLayerId
            });
            return;
        }
        console.log('🎨 PatternMaker: Starting pattern creation', {
            activeLayerId,
            composedCanvasSize: `${composedCanvas.width}x${composedCanvas.height}`
        });
        setIsCreatingPattern(true);
        // Create pattern tile from current design
        const seamlessTile = createSeamlessTile(composedCanvas);
        tileCanvasRef.current = seamlessTile;
        // Generate initial preview
        generatePatternPreview();
        // Console log removed
    }, [composedCanvas, activeLayerId, createSeamlessTile, generatePatternPreview]);
    // Apply pattern to design
    const applyPattern = useCallback(() => {
        if (!previewCanvas || !composedCanvas || !commit) {
            // Console log removed
            return;
        }
        // Console log removed
        // Create a new canvas with the pattern
        const newCanvas = document.createElement('canvas');
        newCanvas.width = composedCanvas.width;
        newCanvas.height = composedCanvas.height;
        const ctx = newCanvas.getContext('2d');
        // Calculate pattern scaling
        const scaleX = composedCanvas.width / previewCanvas.width;
        const scaleY = composedCanvas.height / previewCanvas.height;
        const scale = Math.min(scaleX, scaleY);
        // Console log removed
        // Draw scaled pattern
        ctx.save();
        ctx.scale(scale, scale);
        ctx.drawImage(previewCanvas, 0, 0);
        ctx.restore();
        // Update the composed canvas
        const composedCtx = composedCanvas.getContext('2d');
        composedCtx.clearRect(0, 0, composedCanvas.width, composedCanvas.height);
        composedCtx.drawImage(newCanvas, 0, 0);
        // Commit changes
        commit();
        // Console log removed
    }, [previewCanvas, composedCanvas, commit]);
    // Handle pattern settings change
    const updatePatternSettings = useCallback((newSettings) => {
        // Console log removed
        setPatternSettings(prev => {
            const updated = { ...prev, ...newSettings };
            // Console log removed
            return updated;
        });
    }, []);
    // Regenerate preview when settings change
    useEffect(() => {
        if (isCreatingPattern && previewCanvas) {
            // Console log removed
            generatePatternPreview();
        }
    }, [patternSettings, isCreatingPattern, generatePatternPreview, previewCanvas]);
    // Handle mouse events for pattern manipulation
    const handleMouseDown = useCallback((e) => {
        if (!isCreatingPattern)
            return;
        // Console log removed
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    }, [isCreatingPattern]);
    const handleMouseMove = useCallback((e) => {
        if (!isDragging || !dragStart)
            return;
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        // Console log removed
        // Update offset based on drag
        updatePatternSettings({
            offsetX: patternSettings.offsetX + deltaX * 0.5,
            offsetY: patternSettings.offsetY + deltaY * 0.5
        });
        setDragStart({ x: e.clientX, y: e.clientY });
    }, [isDragging, dragStart, patternSettings.offsetX, patternSettings.offsetY, updatePatternSettings]);
    const handleMouseUp = useCallback(() => {
        if (!isDragging)
            return;
        // Console log removed
        setIsDragging(false);
        setDragStart(null);
    }, [isDragging]);
    // Export pattern
    const exportPattern = useCallback(() => {
        if (!previewCanvas) {
            // Console log removed
            return;
        }
        // Console log removed
        const link = document.createElement('a');
        link.download = `pattern-${patternSettings.repeatType}-${Date.now()}.png`;
        link.href = previewCanvas.toDataURL('image/png');
        link.click();
        // Console log removed
    }, [previewCanvas, patternSettings.repeatType]);
    if (!active) {
        // Console log removed
        return null;
    }
    // Console log removed
    return (_jsxs("div", { className: "pattern-maker", style: {
            border: '2px solid #8B5CF6',
            borderRadius: '8px',
            padding: '12px',
            background: 'rgba(139, 92, 246, 0.1)',
            boxShadow: '0 0 10px rgba(139, 92, 246, 0.3)',
            marginTop: '12px'
        }, children: [_jsxs("div", { className: "pattern-header", style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                }, children: [_jsx("h4", { style: { margin: 0, color: '#8B5CF6', fontSize: '16px' }, children: "\uD83C\uDFA8 Pattern Maker" }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx("button", { className: "btn", onClick: startPatternCreation, disabled: isCreatingPattern, style: {
                                    background: isCreatingPattern ? '#6B7280' : '#8B5CF6',
                                    color: 'white',
                                    fontSize: '12px',
                                    padding: '6px 12px'
                                }, children: isCreatingPattern ? 'Creating...' : 'Create Pattern' }), isCreatingPattern && (_jsx("button", { className: "btn", onClick: exportPattern, style: {
                                    background: '#10B981',
                                    color: 'white',
                                    fontSize: '12px',
                                    padding: '6px 12px'
                                }, children: "Export" })), _jsx("button", { className: "btn", onClick: () => useApp.getState().setTool('brush'), style: {
                                    background: '#6B7280',
                                    color: 'white',
                                    fontSize: '12px',
                                    padding: '6px 12px'
                                }, title: "Close Pattern Maker", children: "\u2715 Close" })] })] }), isCreatingPattern && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "pattern-settings", style: {
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '12px',
                            marginBottom: '12px'
                        }, children: [_jsxs("div", { children: [_jsxs("label", { style: { fontSize: '12px', fontWeight: 'bold', color: '#8B5CF6' }, children: ["Tile Width: ", patternSettings.tileWidth, "px"] }), _jsx("input", { type: "range", min: "64", max: "512", step: "32", value: patternSettings.tileWidth, onChange: (e) => updatePatternSettings({ tileWidth: parseInt(e.target.value) }), style: { width: '100%' } })] }), _jsxs("div", { children: [_jsxs("label", { style: { fontSize: '12px', fontWeight: 'bold', color: '#8B5CF6' }, children: ["Tile Height: ", patternSettings.tileHeight, "px"] }), _jsx("input", { type: "range", min: "64", max: "512", step: "32", value: patternSettings.tileHeight, onChange: (e) => updatePatternSettings({ tileHeight: parseInt(e.target.value) }), style: { width: '100%' } })] }), _jsxs("div", { children: [_jsxs("label", { style: { fontSize: '12px', fontWeight: 'bold', color: '#8B5CF6' }, children: ["Offset X: ", Math.round(patternSettings.offsetX), "px"] }), _jsx("input", { type: "range", min: "-100", max: "100", step: "1", value: patternSettings.offsetX, onChange: (e) => updatePatternSettings({ offsetX: parseInt(e.target.value) }), style: { width: '100%' } })] }), _jsxs("div", { children: [_jsxs("label", { style: { fontSize: '12px', fontWeight: 'bold', color: '#8B5CF6' }, children: ["Offset Y: ", Math.round(patternSettings.offsetY), "px"] }), _jsx("input", { type: "range", min: "-100", max: "100", step: "1", value: patternSettings.offsetY, onChange: (e) => updatePatternSettings({ offsetY: parseInt(e.target.value) }), style: { width: '100%' } })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: '12px', fontWeight: 'bold', color: '#8B5CF6' }, children: "Repeat Type" }), _jsxs("select", { value: patternSettings.repeatType, onChange: (e) => updatePatternSettings({ repeatType: e.target.value }), style: { width: '100%', padding: '4px', border: '1px solid #8B5CF6', borderRadius: '4px' }, children: [_jsx("option", { value: "basic", children: "Basic" }), _jsx("option", { value: "brick", children: "Brick" }), _jsx("option", { value: "herringbone", children: "Herringbone" }), _jsx("option", { value: "hexagon", children: "Hexagon" }), _jsx("option", { value: "diamond", children: "Diamond" })] })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("input", { type: "checkbox", id: "seamless", checked: patternSettings.seamless, onChange: (e) => updatePatternSettings({ seamless: e.target.checked }) }), _jsx("label", { htmlFor: "seamless", style: { fontSize: '12px', color: '#8B5CF6' }, children: "Seamless" })] })] }), _jsxs("div", { className: "pattern-preview", style: {
                            border: '1px solid #8B5CF6',
                            borderRadius: '4px',
                            padding: '8px',
                            background: 'white',
                            marginBottom: '12px'
                        }, children: [_jsx("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#8B5CF6', marginBottom: '8px' }, children: "Pattern Preview" }), _jsx("canvas", { ref: previewCanvasRef, width: patternSettings.previewSize, height: patternSettings.previewSize, onMouseDown: handleMouseDown, onMouseMove: handleMouseMove, onMouseUp: handleMouseUp, onMouseLeave: handleMouseUp, style: {
                                    width: '100%',
                                    height: 'auto',
                                    maxWidth: '300px',
                                    cursor: isDragging ? 'grabbing' : 'grab',
                                    border: '1px solid #E5E7EB'
                                } }), _jsx("div", { style: { fontSize: '10px', color: '#6B7280', marginTop: '4px' }, children: "Drag to adjust pattern offset" })] }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx("button", { className: "btn", onClick: applyPattern, style: {
                                    background: '#8B5CF6',
                                    color: 'white',
                                    fontSize: '12px',
                                    padding: '8px 16px',
                                    flex: 1
                                }, children: "Apply Pattern" }), _jsx("button", { className: "btn", onClick: () => setIsCreatingPattern(false), style: {
                                    background: '#6B7280',
                                    color: 'white',
                                    fontSize: '12px',
                                    padding: '8px 16px'
                                }, children: "Cancel" })] })] })), !isCreatingPattern && (_jsx("div", { style: { fontSize: '12px', color: '#6B7280', textAlign: 'center', padding: '20px' }, children: "Click \"Create Pattern\" to start making repeating patterns from your current design" }))] }));
}
