import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useRef } from 'react';
import { useApp } from '../App';
import { CustomSelect } from './CustomSelect';
import { PuffPrintManager } from './PuffPrintManager';
const tools = [
    { id: 'brush', label: 'Brush' },
    { id: 'eraser', label: 'Eraser' },
    { id: 'smudge', label: 'Smudge' },
    { id: 'blur', label: 'Blur' },
    { id: 'fill', label: 'Fill' },
    { id: 'gradient', label: 'Gradient' },
    { id: 'picker', label: 'Picker' },
    { id: 'line', label: 'Line' },
    { id: 'rect', label: 'Rect' },
    { id: 'ellipse', label: 'Ellipse' },
    { id: 'text', label: 'Text' },
    { id: 'moveText', label: 'Move Text' },
    { id: 'transform', label: 'Transform' },
    { id: 'move', label: 'Move' },
    { id: 'puffPrint', label: 'Puff Print' },
    { id: 'patternMaker', label: 'Pattern Maker' },
    { id: 'embroidery', label: 'Embroidery' },
    { id: 'advancedSelection', label: 'Selection' },
    { id: 'vectorTools', label: 'Vector' },
    { id: 'aiAssistant', label: 'AI Assistant' },
    { id: 'printExport', label: 'Export' },
    { id: 'cloudSync', label: 'Cloud' },
    { id: 'layerEffects', label: 'Effects' },
    { id: 'colorGrading', label: 'Color' },
    { id: 'animation', label: 'Animation' },
    { id: 'templates', label: 'Templates' },
    { id: 'batch', label: 'Batch' },
    { id: 'advancedBrush', label: 'Advanced Brush' },
    { id: 'meshDeformation', label: 'Mesh Deform' },
    { id: 'proceduralGenerator', label: 'Procedural' },
    { id: '3dPainting', label: '3D Paint' },
    { id: 'smartFill', label: 'Smart Fill' },
    { id: 'undo', label: 'Undo' },
    { id: 'redo', label: 'Redo' }
];
export function Toolbar() {
    const activeTool = useApp(s => s.activeTool);
    const setTool = useApp(s => s.setTool);
    const undo = useApp(s => s.undo);
    const redo = useApp(s => s.redo);
    const saveCheckpoint = useApp(s => s.saveCheckpoint);
    const listCheckpoints = useApp(s => s.listCheckpoints);
    const loadCheckpoint = useApp(s => s.loadCheckpoint);
    const deleteCheckpoint = useApp(s => s.deleteCheckpoint);
    const openModelManager = useApp(s => s.openModelManager);
    const openBackgroundManager = useApp(s => s.openBackgroundManager);
    const [checkpoints, setCheckpoints] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [saving, setSaving] = useState(false);
    const scrollContainerRef = useRef(null);
    const refresh = async () => {
        const list = await listCheckpoints();
        setCheckpoints(list);
        if (list.length && !selectedId)
            setSelectedId(list[0].id);
    };
    useEffect(() => { refresh(); }, []);
    const handleToolClick = (toolId) => {
        setTool(toolId);
    };
    return (_jsx("div", { className: "toolbar-container", children: _jsx("div", { className: "toolbar-scroll-container", ref: scrollContainerRef, children: _jsxs("div", { className: "toolbar-content", children: [_jsx("div", { className: "toolbar-group", children: tools.slice(0, 6).map(t => (_jsx("button", { className: `btn ${activeTool === t.id ? 'active' : ''}`, onClick: () => handleToolClick(t.id), type: "button", children: t.label }, t.id))) }), _jsx("div", { className: "toolbar-group", children: tools.slice(6, 12).map(t => (_jsx("button", { className: `btn ${activeTool === t.id ? 'active' : ''}`, onClick: () => handleToolClick(t.id), type: "button", children: t.label }, t.id))) }), _jsx("div", { className: "toolbar-group", children: tools.slice(12, 16).map(t => (_jsx("button", { className: `btn ${activeTool === t.id ? 'active' : ''}`, onClick: () => handleToolClick(t.id), type: "button", children: t.label }, t.id))) }), _jsxs("div", { className: "toolbar-group", children: [_jsx("button", { className: "btn", onClick: () => undo(), type: "button", children: "Undo" }), _jsx("button", { className: "btn", onClick: () => redo(), type: "button", children: "Redo" })] }), _jsxs("div", { className: "toolbar-group", children: [_jsx("button", { className: "btn", onClick: openModelManager, type: "button", children: "Models" }), _jsx("button", { className: "btn", onClick: openBackgroundManager, type: "button", children: "Backgrounds" }), _jsx(PuffPrintManager, {})] }), _jsxs("div", { className: "toolbar-group", children: [_jsx("button", { className: "btn", onClick: async () => {
                                    try {
                                        setSaving(true);
                                        const name = window.prompt('Checkpoint name?', `Checkpoint ${new Date().toLocaleString()}`) || undefined;
                                        await saveCheckpoint(name);
                                        await refresh();
                                    }
                                    finally {
                                        setSaving(false);
                                    }
                                }, disabled: saving, type: "button", children: saving ? 'Saving…' : 'Save' }), _jsx(CustomSelect, { value: selectedId, placeholder: checkpoints.length ? 'Select checkpoint…' : 'No checkpoints yet', onChange: (v) => setSelectedId(v), minWidth: 220, options: checkpoints.map(cp => ({ value: cp.id, label: cp.name })) }), _jsx("button", { className: "btn", onClick: async () => {
                                    if (!selectedId)
                                        return;
                                    await loadCheckpoint(selectedId);
                                }, disabled: !selectedId, type: "button", children: "Load" }), _jsx("button", { className: "btn", onClick: async () => {
                                    if (!selectedId)
                                        return;
                                    await deleteCheckpoint(selectedId);
                                    setSelectedId('');
                                    await refresh();
                                }, disabled: !selectedId, type: "button", children: "Delete" })] })] }) }) }));
}
