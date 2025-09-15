import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Enhanced Embroidery Tool
 * Advanced embroidery tool with persistent stitches, layering, and AI features
 */
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../store/useApp';
import EnhancedEmbroideryManager from '../utils/EnhancedEmbroideryManager';
import EnhancedStitchGenerator from '../utils/EnhancedStitchGenerator';
const EnhancedEmbroideryTool = ({ active = true }) => {
    // Global state
    const { embroideryStitches, setEmbroideryStitches, embroideryStitchType, setEmbroideryStitchType, embroideryColor, setEmbroideryColor, embroideryThickness, setEmbroideryThickness, embroideryOpacity, setEmbroideryOpacity, embroideryThreadType, setEmbroideryThreadType, composedCanvas } = useApp();
    // Local state
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentStitch, setCurrentStitch] = useState(null);
    const [selectedStitches, setSelectedStitches] = useState([]);
    const [showLayers, setShowLayers] = useState(false);
    const [showPatterns, setShowPatterns] = useState(false);
    const [showAI, setShowAI] = useState(false);
    const [aiDescription, setAiDescription] = useState('');
    const [performanceMode, setPerformanceMode] = useState(false);
    const [showStatistics, setShowStatistics] = useState(false);
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    // Refs
    const managerRef = useRef(null);
    const generatorRef = useRef(null);
    const frameRequestRef = useRef(null);
    // Initialize managers
    useEffect(() => {
        if (composedCanvas) {
            managerRef.current = new EnhancedEmbroideryManager(composedCanvas);
            generatorRef.current = new EnhancedStitchGenerator(true); // Enable AI
            // Set performance mode
            managerRef.current.setPerformanceMode(performanceMode);
        }
    }, [composedCanvas, performanceMode]);
    // Save state for undo
    const saveState = useCallback(() => {
        if (managerRef.current) {
            const currentStitches = managerRef.current.getAllStitches();
            setUndoStack(prev => [...prev.slice(-9), currentStitches]); // Keep last 10 states
            setRedoStack([]); // Clear redo when new action is performed
        }
    }, []);
    // Undo functionality
    const undo = useCallback(() => {
        if (undoStack.length > 0 && managerRef.current) {
            const previousState = undoStack[undoStack.length - 1];
            setRedoStack(prev => [...prev, managerRef.current.getAllStitches()]);
            setUndoStack(prev => prev.slice(0, -1));
            // Restore previous state
            managerRef.current.clearAll();
            previousState.forEach(stitch => {
                managerRef.current.addStitch(stitch);
            });
            // Update global state
            setEmbroideryStitches(previousState);
        }
    }, [undoStack, setEmbroideryStitches]);
    // Redo functionality
    const redo = useCallback(() => {
        if (redoStack.length > 0 && managerRef.current) {
            const nextState = redoStack[redoStack.length - 1];
            setUndoStack(prev => [...prev, managerRef.current.getAllStitches()]);
            setRedoStack(prev => prev.slice(0, -1));
            // Restore next state
            managerRef.current.clearAll();
            nextState.forEach(stitch => {
                managerRef.current.addStitch(stitch);
            });
            // Update global state
            setEmbroideryStitches(nextState);
        }
    }, [redoStack, setEmbroideryStitches]);
    // Drawing handlers
    const handleStartDrawing = useCallback((e) => {
        if (!managerRef.current || !generatorRef.current)
            return;
        const { u, v } = e.detail;
        setIsDrawing(true);
        const config = {
            type: embroideryStitchType,
            color: embroideryColor,
            thickness: embroideryThickness,
            opacity: embroideryOpacity,
            threadType: embroideryThreadType,
            quality: 'high'
        };
        const initialStitch = generatorRef.current.generateStitchFromInput([{ x: u, y: v, pressure: 0.5, timestamp: Date.now() }], config);
        setCurrentStitch(initialStitch);
        saveState();
    }, [embroideryStitchType, embroideryColor, embroideryThickness, embroideryOpacity, embroideryThreadType, saveState]);
    const handleMoveDrawing = useCallback((e) => {
        if (!isDrawing || !currentStitch || !generatorRef.current)
            return;
        const { u, v } = e.detail;
        // Throttle move events
        const now = Date.now();
        if (currentStitch.metadata && now - currentStitch.metadata.lastMoveTime < 32) {
            return;
        }
        const newPoints = [...currentStitch.points, { x: u, y: v, pressure: 0.5, timestamp: now }];
        const config = {
            type: embroideryStitchType,
            color: embroideryColor,
            thickness: embroideryThickness,
            opacity: embroideryOpacity,
            threadType: embroideryThreadType,
            quality: 'high'
        };
        const updatedStitch = generatorRef.current.generateStitchFromInput(newPoints, config);
        setCurrentStitch(updatedStitch);
    }, [isDrawing, currentStitch, embroideryStitchType, embroideryColor, embroideryThickness, embroideryOpacity, embroideryThreadType]);
    const handleEndDrawing = useCallback(() => {
        if (!isDrawing || !currentStitch || !managerRef.current)
            return;
        setIsDrawing(false);
        // Add stitch to manager
        const stitchId = managerRef.current.addStitch(currentStitch);
        // Update global state
        const allStitches = managerRef.current.getAllStitches();
        setEmbroideryStitches(allStitches);
        setCurrentStitch(null);
    }, [isDrawing, currentStitch, setEmbroideryStitches]);
    // Pattern generation
    const generatePattern = useCallback((patternId) => {
        if (!managerRef.current || !generatorRef.current)
            return;
        const centerX = composedCanvas?.width ? composedCanvas.width / 2 : 400;
        const centerY = composedCanvas?.height ? composedCanvas.height / 2 : 300;
        const config = {
            color: embroideryColor,
            thickness: embroideryThickness,
            opacity: embroideryOpacity,
            threadType: embroideryThreadType
        };
        const stitch = generatorRef.current.generatePatternStitch(patternId, centerX, centerY, 1.0, config);
        if (stitch) {
            saveState();
            const stitchId = managerRef.current.addStitch(stitch);
            const allStitches = managerRef.current.getAllStitches();
            setEmbroideryStitches(allStitches);
        }
    }, [composedCanvas, embroideryColor, embroideryThickness, embroideryOpacity, embroideryThreadType, setEmbroideryStitches, saveState]);
    // AI generation
    const generateAIStitch = useCallback(() => {
        if (!managerRef.current || !generatorRef.current || !aiDescription.trim())
            return;
        const bounds = {
            x: 100,
            y: 100,
            width: composedCanvas?.width ? composedCanvas.width - 200 : 600,
            height: composedCanvas?.height ? composedCanvas.height - 200 : 400
        };
        const config = {
            color: embroideryColor,
            thickness: embroideryThickness,
            opacity: embroideryOpacity,
            threadType: embroideryThreadType
        };
        saveState();
        const stitches = generatorRef.current.generateAIStitch(aiDescription, bounds, config);
        stitches.forEach(stitch => {
            managerRef.current.addStitch(stitch);
        });
        const allStitches = managerRef.current.getAllStitches();
        setEmbroideryStitches(allStitches);
        setAiDescription('');
    }, [aiDescription, composedCanvas, embroideryColor, embroideryThickness, embroideryOpacity, embroideryThreadType, setEmbroideryStitches, saveState]);
    // Layer management
    const createLayer = useCallback((name) => {
        if (!managerRef.current)
            return;
        const layerId = managerRef.current.createLayer(name);
        console.log('Created layer:', layerId);
    }, []);
    const switchLayer = useCallback((layerId) => {
        if (!managerRef.current)
            return;
        managerRef.current.setCurrentLayer(layerId);
    }, []);
    // Stitch management
    const deleteSelectedStitches = useCallback(() => {
        if (!managerRef.current || selectedStitches.length === 0)
            return;
        saveState();
        selectedStitches.forEach(stitchId => {
            managerRef.current.removeStitch(stitchId);
        });
        const allStitches = managerRef.current.getAllStitches();
        setEmbroideryStitches(allStitches);
        setSelectedStitches([]);
    }, [selectedStitches, setEmbroideryStitches, saveState]);
    const clearAllStitches = useCallback(() => {
        if (!managerRef.current)
            return;
        saveState();
        managerRef.current.clearAll();
        setEmbroideryStitches([]);
        setSelectedStitches([]);
    }, [setEmbroideryStitches, saveState]);
    // Event listeners
    useEffect(() => {
        window.addEventListener('embroideryStart', handleStartDrawing);
        window.addEventListener('embroideryMove', handleMoveDrawing);
        window.addEventListener('embroideryEnd', handleEndDrawing);
        return () => {
            window.removeEventListener('embroideryStart', handleStartDrawing);
            window.removeEventListener('embroideryMove', handleMoveDrawing);
            window.removeEventListener('embroideryEnd', handleEndDrawing);
        };
    }, [handleStartDrawing, handleMoveDrawing, handleEndDrawing]);
    // Statistics
    const statistics = useMemo(() => {
        if (!managerRef.current)
            return null;
        return managerRef.current.getStatistics();
    }, [embroideryStitches]);
    // Available patterns
    const availablePatterns = useMemo(() => {
        if (!generatorRef.current)
            return [];
        return generatorRef.current.getAvailablePatterns();
    }, []);
    // Available layers
    const availableLayers = useMemo(() => {
        if (!managerRef.current)
            return [];
        return managerRef.current.getAllLayers();
    }, [embroideryStitches]);
    if (!active)
        return null;
    return (_jsxs("div", { className: "enhanced-embroidery-tool", children: [_jsxs("div", { className: "tool-header", children: [_jsx("h3", { children: "Enhanced Embroidery Tool" }), _jsxs("div", { className: "tool-actions", children: [_jsx("button", { onClick: undo, disabled: undoStack.length === 0, title: "Undo", children: "\u21B6" }), _jsx("button", { onClick: redo, disabled: redoStack.length === 0, title: "Redo", children: "\u21B7" }), _jsx("button", { onClick: clearAllStitches, title: "Clear All", children: "\uD83D\uDDD1\uFE0F" })] })] }), _jsxs("div", { className: "control-section", children: [_jsx("h4", { children: "Stitch Settings" }), _jsxs("div", { className: "control-group", children: [_jsx("label", { children: "Stitch Type:" }), _jsxs("select", { value: embroideryStitchType, onChange: (e) => setEmbroideryStitchType(e.target.value), children: [_jsx("option", { value: "satin", children: "Satin" }), _jsx("option", { value: "cross-stitch", children: "Cross Stitch" }), _jsx("option", { value: "chain", children: "Chain" }), _jsx("option", { value: "fill", children: "Fill" }), _jsx("option", { value: "bullion", children: "Bullion" }), _jsx("option", { value: "feather", children: "Feather" }), _jsx("option", { value: "backstitch", children: "Backstitch" }), _jsx("option", { value: "french-knot", children: "French Knot" }), _jsx("option", { value: "running-stitch", children: "Running Stitch" })] })] }), _jsxs("div", { className: "control-group", children: [_jsx("label", { children: "Color:" }), _jsx("input", { type: "color", value: embroideryColor, onChange: (e) => setEmbroideryColor(e.target.value) })] }), _jsxs("div", { className: "control-group", children: [_jsx("label", { children: "Thickness:" }), _jsx("input", { type: "range", min: "0.5", max: "10", step: "0.1", value: embroideryThickness, onChange: (e) => setEmbroideryThickness(parseFloat(e.target.value)) }), _jsx("span", { children: embroideryThickness.toFixed(1) })] }), _jsxs("div", { className: "control-group", children: [_jsx("label", { children: "Opacity:" }), _jsx("input", { type: "range", min: "0.1", max: "1", step: "0.1", value: embroideryOpacity, onChange: (e) => setEmbroideryOpacity(parseFloat(e.target.value)) }), _jsxs("span", { children: [Math.round(embroideryOpacity * 100), "%"] })] }), _jsxs("div", { className: "control-group", children: [_jsx("label", { children: "Thread Type:" }), _jsxs("select", { value: embroideryThreadType, onChange: (e) => setEmbroideryThreadType(e.target.value), children: [_jsx("option", { value: "cotton", children: "Cotton" }), _jsx("option", { value: "silk", children: "Silk" }), _jsx("option", { value: "polyester", children: "Polyester" }), _jsx("option", { value: "metallic", children: "Metallic" }), _jsx("option", { value: "glow", children: "Glow" }), _jsx("option", { value: "variegated", children: "Variegated" })] })] })] }), _jsxs("div", { className: "control-section", children: [_jsxs("div", { className: "section-header", children: [_jsx("h4", { children: "Pattern Library" }), _jsx("button", { onClick: () => setShowPatterns(!showPatterns), className: "toggle-btn", children: showPatterns ? '−' : '+' })] }), showPatterns && (_jsx("div", { className: "pattern-grid", children: availablePatterns.map(pattern => (_jsxs("div", { className: "pattern-item", onClick: () => generatePattern(pattern.id), title: pattern.description, children: [_jsx("div", { className: "pattern-preview", children: pattern.name }), _jsxs("div", { className: "pattern-info", children: [_jsx("span", { className: "pattern-type", children: pattern.type }), _jsx("span", { className: "pattern-complexity", children: '★'.repeat(pattern.complexity) })] })] }, pattern.id))) }))] }), _jsxs("div", { className: "control-section", children: [_jsxs("div", { className: "section-header", children: [_jsx("h4", { children: "AI Generation" }), _jsx("button", { onClick: () => setShowAI(!showAI), className: "toggle-btn", children: showAI ? '−' : '+' })] }), showAI && (_jsxs("div", { className: "ai-controls", children: [_jsx("textarea", { placeholder: "Describe the embroidery pattern you want to create...", value: aiDescription, onChange: (e) => setAiDescription(e.target.value), rows: 3 }), _jsx("button", { onClick: generateAIStitch, disabled: !aiDescription.trim(), className: "ai-generate-btn", children: "\uD83E\uDD16 Generate Pattern" })] }))] }), _jsxs("div", { className: "control-section", children: [_jsxs("div", { className: "section-header", children: [_jsx("h4", { children: "Layers" }), _jsx("button", { onClick: () => setShowLayers(!showLayers), className: "toggle-btn", children: showLayers ? '−' : '+' })] }), showLayers && (_jsxs("div", { className: "layer-controls", children: [_jsx("div", { className: "layer-list", children: availableLayers.map(layer => (_jsxs("div", { className: "layer-item", children: [_jsx("input", { type: "radio", name: "currentLayer", checked: layer.id === managerRef.current?.getCurrentLayer().id, onChange: () => switchLayer(layer.id) }), _jsx("span", { className: "layer-name", children: layer.name }), _jsxs("span", { className: "layer-count", children: ["(", layer.stitches.length, ")"] })] }, layer.id))) }), _jsx("div", { className: "layer-actions", children: _jsx("input", { type: "text", placeholder: "New layer name", onKeyPress: (e) => {
                                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                            createLayer(e.currentTarget.value.trim());
                                            e.currentTarget.value = '';
                                        }
                                    } }) })] }))] }), selectedStitches.length > 0 && (_jsxs("div", { className: "control-section", children: [_jsxs("h4", { children: ["Selected Stitches (", selectedStitches.length, ")"] }), _jsx("div", { className: "selection-actions", children: _jsx("button", { onClick: deleteSelectedStitches, className: "danger-btn", children: "Delete Selected" }) })] })), _jsxs("div", { className: "control-section", children: [_jsxs("div", { className: "section-header", children: [_jsx("h4", { children: "Performance & Stats" }), _jsx("button", { onClick: () => setShowStatistics(!showStatistics), className: "toggle-btn", children: showStatistics ? '−' : '+' })] }), showStatistics && statistics && (_jsxs("div", { className: "statistics", children: [_jsxs("div", { className: "stat-item", children: [_jsx("span", { children: "Total Stitches:" }), _jsx("span", { children: statistics.totalStitches })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { children: "Visible Stitches:" }), _jsx("span", { children: statistics.visibleStitches })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { children: "Layers:" }), _jsx("span", { children: statistics.layerCount })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { children: "Total Length:" }), _jsxs("span", { children: [statistics.totalLength.toFixed(1), "px"] })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { children: "Avg Quality:" }), _jsxs("span", { children: [(statistics.averageQuality * 100).toFixed(1), "%"] })] }), _jsx("div", { className: "performance-controls", children: _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: performanceMode, onChange: (e) => setPerformanceMode(e.target.checked) }), "Performance Mode"] }) })] }))] }), statistics && statistics.stitchesByType && Object.keys(statistics.stitchesByType).length > 0 && (_jsxs("div", { className: "control-section", children: [_jsx("h4", { children: "Stitch Types" }), _jsx("div", { className: "stitch-breakdown", children: Object.entries(statistics.stitchesByType).map(([type, count]) => (_jsxs("div", { className: "stitch-type-item", children: [_jsx("span", { className: "stitch-type-name", children: type }), _jsx("span", { className: "stitch-type-count", children: count })] }, type))) })] })), _jsx("style", { jsx: true, children: `
        .enhanced-embroidery-tool {
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
          max-height: 80vh;
          overflow-y: auto;
        }

        .tool-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e9ecef;
        }

        .tool-header h3 {
          margin: 0;
          color: #495057;
        }

        .tool-actions {
          display: flex;
          gap: 8px;
        }

        .tool-actions button {
          padding: 6px 12px;
          border: 1px solid #dee2e6;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .tool-actions button:hover:not(:disabled) {
          background: #e9ecef;
        }

        .tool-actions button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .control-section {
          margin-bottom: 20px;
          background: white;
          border-radius: 6px;
          padding: 16px;
          border: 1px solid #e9ecef;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .section-header h4 {
          margin: 0;
          color: #495057;
        }

        .toggle-btn {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #6c757d;
        }

        .control-group {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          gap: 12px;
        }

        .control-group label {
          min-width: 80px;
          font-weight: 500;
          color: #495057;
        }

        .control-group input,
        .control-group select {
          flex: 1;
          padding: 6px 8px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
        }

        .pattern-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 12px;
        }

        .pattern-item {
          border: 1px solid #dee2e6;
          border-radius: 6px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.2s;
          background: white;
        }

        .pattern-item:hover {
          border-color: #007bff;
          box-shadow: 0 2px 4px rgba(0,123,255,0.1);
        }

        .pattern-preview {
          font-weight: 500;
          margin-bottom: 8px;
          color: #495057;
        }

        .pattern-info {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #6c757d;
        }

        .ai-controls {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ai-controls textarea {
          padding: 8px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
          resize: vertical;
        }

        .ai-generate-btn {
          padding: 10px 16px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .ai-generate-btn:hover:not(:disabled) {
          background: #0056b3;
        }

        .ai-generate-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .layer-controls {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .layer-list {
          max-height: 200px;
          overflow-y: auto;
        }

        .layer-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
        }

        .layer-item:hover {
          background: #f8f9fa;
        }

        .layer-name {
          flex: 1;
          font-weight: 500;
        }

        .layer-count {
          color: #6c757d;
          font-size: 12px;
        }

        .layer-actions input {
          width: 100%;
          padding: 6px 8px;
          border: 1px solid #ced4da;
          border-radius: 4px;
        }

        .selection-actions {
          display: flex;
          gap: 8px;
        }

        .danger-btn {
          padding: 8px 16px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .danger-btn:hover {
          background: #c82333;
        }

        .statistics {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          border-bottom: 1px solid #f8f9fa;
        }

        .stat-item:last-child {
          border-bottom: none;
        }

        .performance-controls {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e9ecef;
        }

        .performance-controls label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .stitch-breakdown {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .stitch-type-item {
          display: flex;
          justify-content: space-between;
          padding: 6px 8px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .stitch-type-name {
          font-weight: 500;
          text-transform: capitalize;
        }

        .stitch-type-count {
          color: #6c757d;
          font-size: 14px;
        }
      ` })] }));
};
export default EnhancedEmbroideryTool;
