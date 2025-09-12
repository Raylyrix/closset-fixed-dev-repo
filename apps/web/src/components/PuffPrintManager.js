import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useApp } from '../App';
export function PuffPrintManager() {
    const [isOpen, setIsOpen] = useState(false);
    const [puffLayers, setPuffLayers] = useState([]);
    const [activePuffLayerId, setActivePuffLayerId] = useState(null);
    const [puffSettings, setPuffSettings] = useState({
        intensity: 1.0,
        color: '#ffffff',
        opacity: 1.0
    });
    const canvasRef = useRef(null);
    const puffCanvasRef = useRef(null);
    const { modelScene, composedCanvas, activeTool, setTool, brushColor, brushSize, brushOpacity, brushShape, brushHardness, brushFlow, brushSpacing, brushSmoothing, usePressureSize, usePressureOpacity, symmetryY, symmetryZ, snapshot, commit } = useApp();
    // Initialize puff print system
    useEffect(() => {
        if (!isOpen)
            return;
        // Activate the puff print tool when manager opens
        setTool('puffPrint');
        // Create default puff layer if none exists
        if (puffLayers.length === 0) {
            createPuffLayer('Puff Print 1');
        }
    }, [isOpen, setTool]);
    // Create a new puff print layer
    const createPuffLayer = (name) => {
        const canvas = document.createElement('canvas');
        if (composedCanvas) {
            canvas.width = composedCanvas.width;
            canvas.height = composedCanvas.height;
        }
        else {
            canvas.width = 1024;
            canvas.height = 1024;
        }
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const layer = {
            id: `puff-${Date.now()}`,
            name,
            canvas,
            material: null, // We don't need the material anymore
            visible: true,
            locked: false
        };
        setPuffLayers(prev => [...prev, layer]);
        setActivePuffLayerId(layer.id);
    };
    // Delete a puff print layer
    const deletePuffLayer = (id) => {
        setPuffLayers(prev => prev.filter(layer => layer.id !== id));
        if (activePuffLayerId === id) {
            setActivePuffLayerId(puffLayers[0]?.id || null);
        }
    };
    // Toggle layer visibility
    const toggleLayerVisibility = (id) => {
        setPuffLayers(prev => prev.map(layer => layer.id === id ? { ...layer, visible: !layer.visible } : layer));
    };
    // Toggle layer lock
    const toggleLayerLock = (id) => {
        setPuffLayers(prev => prev.map(layer => layer.id === id ? { ...layer, locked: !layer.locked } : layer));
    };
    // Update puff settings
    const updatePuffSettings = (key, value) => {
        setPuffSettings(prev => ({ ...prev, [key]: value }));
    };
    // Apply puff print to model
    const applyPuffPrint = () => {
        if (!modelScene || !activePuffLayerId)
            return;
        const layer = puffLayers.find(l => l.id === activePuffLayerId);
        if (!layer)
            return;
        // Apply the puff canvas to the model's texture
        if (layer.canvas && composedCanvas) {
            // Create a temporary canvas to blend the puff effects
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = composedCanvas.width;
            tempCanvas.height = composedCanvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            // Draw the base composed canvas
            tempCtx.drawImage(composedCanvas, 0, 0);
            // Blend the puff effects on top
            tempCtx.globalCompositeOperation = 'multiply';
            tempCtx.drawImage(layer.canvas, 0, 0);
            // Apply the blended result to the model
            modelScene.traverse((child) => {
                if (child.isMesh && child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach((mat) => {
                            if (mat.map) {
                                mat.map.image = tempCanvas;
                                mat.map.needsUpdate = true;
                            }
                        });
                    }
                    else {
                        if (child.material.map) {
                            child.material.map.image = tempCanvas;
                            child.material.map.needsUpdate = true;
                        }
                    }
                    child.material.needsUpdate = true;
                }
            });
        }
    };
    // Clear puff print
    const clearPuffPrint = () => {
        if (!modelScene || !composedCanvas)
            return;
        // Simply restore the original composed canvas to the model
        modelScene.traverse((child) => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach((mat) => {
                        if (mat.map) {
                            mat.map.image = composedCanvas;
                            mat.map.needsUpdate = true;
                        }
                    });
                }
                else {
                    if (child.material.map) {
                        child.material.map.image = composedCanvas;
                        child.material.map.needsUpdate = true;
                    }
                }
                child.material.needsUpdate = true;
            }
        });
    };
    // Export puff print
    const exportPuffPrint = () => {
        if (!activePuffLayerId)
            return;
        const layer = puffLayers.find(l => l.id === activePuffLayerId);
        if (!layer)
            return;
        const link = document.createElement('a');
        link.download = `${layer.name}.png`;
        link.href = layer.canvas.toDataURL();
        link.click();
    };
    // Export puff map for a layer
    const exportPuffMap = (layerId) => {
        const layer = puffLayers.find(l => l.id === layerId);
        if (!layer)
            return;
        const link = document.createElement('a');
        link.download = `${layer.name}_puff.png`;
        link.href = layer.canvas.toDataURL();
        link.click();
    };
    if (!isOpen) {
        return (_jsxs("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' }, children: [_jsx("button", { className: `btn ${activeTool === 'puffPrint' ? 'active' : ''}`, onClick: () => setTool('puffPrint'), title: "Activate Puff Print Tool", children: "\uD83C\uDFA8" }), _jsx("button", { className: "btn", onClick: () => setIsOpen(true), title: "Open Puff Print Manager", children: "Puff Print" })] }));
    }
    // Render the modal at document body level to avoid overflow issues
    return ReactDOM.createPortal(_jsxs(_Fragment, { children: [_jsx("div", { className: "puff-print-backdrop", onClick: () => setIsOpen(false), style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 99998,
                    backdropFilter: 'blur(4px)'
                } }), _jsxs("div", { className: "puff-print-manager", children: [_jsxs("div", { className: "puff-print-header", children: [_jsx("h3", { children: "Puff Print Manager" }), _jsx("button", { className: "btn", onClick: () => setIsOpen(false), children: "\u00D7" })] }), _jsxs("div", { className: "puff-print-content", children: [_jsxs("div", { className: "puff-layers-section", children: [_jsxs("div", { className: "section-header", children: [_jsx("h4", { children: "Puff Print Layers" }), _jsx("button", { className: "btn", onClick: () => createPuffLayer(`Puff Print ${puffLayers.length + 1}`), children: "+ Add Layer" })] }), _jsx("div", { className: "puff-layers-list", children: puffLayers.map(layer => (_jsxs("div", { className: `puff-layer-item ${activePuffLayerId === layer.id ? 'active' : ''}`, children: [_jsxs("div", { className: "layer-info", children: [_jsx("input", { type: "text", value: layer.name, onChange: (e) => {
                                                                setPuffLayers(prev => prev.map(l => l.id === layer.id ? { ...l, name: e.target.value } : l));
                                                            }, className: "layer-name-input" }), _jsxs("div", { className: "layer-controls", children: [_jsx("button", { className: `btn ${layer.visible ? 'active' : ''}`, onClick: () => toggleLayerVisibility(layer.id), title: layer.visible ? 'Hide' : 'Show', children: "\uD83D\uDC41" }), _jsx("button", { className: `btn ${layer.locked ? 'active' : ''}`, onClick: () => toggleLayerLock(layer.id), title: layer.locked ? 'Unlock' : 'Lock', children: "\uD83D\uDD12" }), _jsx("button", { className: "btn", onClick: () => exportPuffMap(layer.id), title: "Export Puff Map", children: "\uD83D\uDCBE" }), _jsx("button", { className: "btn delete-btn", onClick: () => deletePuffLayer(layer.id), title: "Delete", children: "\uD83D\uDDD1" })] })] }), _jsx("button", { className: "btn select-btn", onClick: () => setActivePuffLayerId(layer.id), children: activePuffLayerId === layer.id ? 'Active' : 'Select' })] }, layer.id))) })] }), activePuffLayerId && (_jsxs("div", { className: "puff-settings-section", children: [_jsx("h4", { children: "Puff Print Settings" }), _jsxs("div", { className: "setting-group", children: [_jsx("label", { children: "Intensity" }), _jsx("input", { type: "range", min: "0", max: "2", step: "0.1", value: puffSettings.intensity, onChange: (e) => updatePuffSettings('intensity', parseFloat(e.target.value)) }), _jsx("span", { children: puffSettings.intensity })] }), _jsxs("div", { className: "setting-group", children: [_jsx("label", { children: "Color" }), _jsx("input", { type: "color", value: puffSettings.color, onChange: (e) => updatePuffSettings('color', e.target.value) })] }), _jsxs("div", { className: "setting-group", children: [_jsx("label", { children: "Opacity" }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.1", value: puffSettings.opacity, onChange: (e) => updatePuffSettings('opacity', parseFloat(e.target.value)) }), _jsx("span", { children: puffSettings.opacity })] })] })), _jsxs("div", { className: "puff-actions", children: [_jsx("button", { className: "btn", onClick: applyPuffPrint, children: "Apply Puff Print" }), _jsx("button", { className: "btn", onClick: clearPuffPrint, children: "Clear Puff Print" }), _jsx("button", { className: "btn", onClick: exportPuffPrint, children: "Export Puff Map" }), activePuffLayerId && (_jsx("button", { className: "btn", onClick: () => exportPuffMap(activePuffLayerId), children: "Export Puff Map" }))] })] })] })] }), document.body);
}
