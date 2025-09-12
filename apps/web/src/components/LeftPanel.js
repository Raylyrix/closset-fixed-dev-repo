import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useApp } from '../App';
import { Section } from './Section';
import { CustomSelect } from './CustomSelect';
import { upscalePng } from '../api';
import { exportMeshAsGLB } from '../exporters';
export function LeftPanel() {
    const layers = useApp(s => s.layers);
    const activeLayerId = useApp(s => s.activeLayerId);
    const composedCanvas = useApp(s => s.composedCanvas);
    const modelChoice = useApp(s => s.modelChoice);
    const [downloading, setDownloading] = useState(false);
    useEffect(() => {
        useApp.getState().composeLayers();
    }, [layers.length]);
    const onDownload = async () => {
        if (!composedCanvas)
            return;
        setDownloading(true);
        try {
            const blob = await new Promise((resolve) => composedCanvas.toBlob(b => resolve(b), 'image/png'));
            const up = await upscalePng(blob, 2).catch(() => blob);
            const url = URL.createObjectURL(up);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'closset-texture-upscaled.png';
            a.click();
            URL.revokeObjectURL(url);
        }
        finally {
            setDownloading(false);
        }
    };
    const decals = useApp((s) => s.decals || []);
    const activeDecalId = useApp((s) => s.activeDecalId || null);
    const addDecalFromFile = useApp.getState().addDecalFromFile;
    const selectDecal = useApp.getState().selectDecal;
    const updateDecal = useApp.getState().updateDecal;
    const removeDecal = useApp.getState().removeDecal;
    const addLayer = useApp.getState().addLayer;
    const nudgeModel = useApp.getState().nudgeModel;
    const rotateModel = useApp.getState().rotateModel;
    const resetModelTransform = useApp.getState().resetModelTransform;
    const setModelScale = useApp.getState().setModelScale;
    const modelScale = useApp(s => s.modelScale || 1);
    const modelBoundsHeight = useApp(s => s.modelBoundsHeight || null);
    const snapModelToOrigin = useApp.getState().snapModelToOrigin;
    const snapModelRotation90 = useApp.getState().snapModelRotation90;
    const setCameraView = useApp.getState().setCameraView;
    const toggleLayerVisibility = useApp.getState().toggleLayerVisibility;
    const setActiveLayerLock = useApp.getState().setActiveLayerLock;
    // selection UI removed
    return (_jsxs("div", { children: [_jsxs(Section, { title: "Model Choice", children: [_jsxs("div", { style: { display: 'flex', gap: 8, marginBottom: 8 }, children: [_jsx("button", { className: `btn ${modelChoice === 'tshirt' ? 'active' : ''}`, onClick: () => useApp.getState().setModelChoice('tshirt'), children: "T\u2011Shirt" }), _jsx("button", { className: `btn ${modelChoice === 'sphere' ? 'active' : ''}`, onClick: () => useApp.getState().setModelChoice('sphere'), children: "Sphere" })] }), _jsx("button", { className: "btn", onClick: () => useApp.getState().openModelManager(), children: "Manage Models" }), modelChoice === 'custom' && (_jsx("div", { style: { marginTop: 8, fontSize: '12px', color: 'var(--muted)' }, children: "Custom model loaded" })), modelChoice === 'custom' && (_jsx("button", { className: "btn", onClick: () => useApp.getState().generateBaseLayer(), style: { marginTop: 8 }, children: "Generate Base Layer" }))] }), _jsx(Section, { title: "Background Scene", defaultOpen: false, children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' }, children: [_jsxs("div", { style: { fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }, children: ["Current: ", useApp(s => s.backgroundScene)] }), _jsx("button", { className: "btn", onClick: () => useApp.getState().openBackgroundManager(), children: "Change Background" }), _jsxs("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' }, children: [_jsx("label", { style: { fontSize: '12px', color: 'var(--muted)' }, children: "Intensity:" }), _jsx("input", { type: "range", min: "0.1", max: "2", step: "0.1", value: useApp(s => s.backgroundIntensity), onChange: (e) => useApp.getState().setBackgroundIntensity(parseFloat(e.target.value)), style: { flex: 1 } })] }), _jsxs("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' }, children: [_jsx("label", { style: { fontSize: '12px', color: 'var(--muted)' }, children: "Rotation:" }), _jsx("input", { type: "range", min: "0", max: "6.28", step: "0.1", value: useApp(s => s.backgroundRotation), onChange: (e) => useApp.getState().setBackgroundRotation(parseFloat(e.target.value)), style: { flex: 1 } })] }), _jsxs("div", { style: { fontSize: '11px', color: 'var(--muted)', marginTop: '8px', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }, children: [_jsx("strong", { children: "\uD83D\uDCA1 Pro Tip:" }), " Use HDR (.hdr) files for professional lighting quality. Default scenes use industry-standard HDR environment maps."] })] }) }), _jsxs(Section, { title: "Layers", children: [_jsx("div", { style: { display: 'flex', gap: 8, marginBottom: 8 }, children: _jsx("button", { className: "btn", onClick: () => addLayer && addLayer(), children: "+ Add Layer" }) }), _jsx("div", { children: layers.map(l => (_jsxs("div", { style: { display: 'grid', gridTemplateColumns: '36px 1fr', alignItems: 'center', gap: 8, marginBottom: 8 }, children: [_jsx("button", { className: "btn", "aria-label": l.visible ? 'Hide layer' : 'Show layer', title: l.visible ? 'Hide layer' : 'Show layer', onClick: () => toggleLayerVisibility && toggleLayerVisibility(l.id), style: { padding: 6, width: 36 }, children: l.visible ? (_jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "#67e8f9", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" }), _jsx("circle", { cx: "12", cy: "12", r: "3" })] })) : (_jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "#94a3b8", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.06-6.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-3.23 4.49" }), _jsx("line", { x1: "1", y1: "1", x2: "23", y2: "23" })] })) }), _jsxs("div", { style: { display: 'grid', gap: 6 }, children: [_jsx("button", { className: `btn ${activeLayerId === l.id ? 'active' : ''}`, onClick: () => { useApp.setState({ activeLayerId: l.id }); useApp.getState().selectLayerForTransform(l.id); }, children: l.name }), activeLayerId === l.id && (_jsx("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }, children: _jsx("button", { className: "btn", onClick: () => setActiveLayerLock(!l.lockTransparent), children: l.lockTransparent ? 'Unlock Alpha' : 'Lock Alpha' }) }))] })] }, l.id))) })] }), _jsxs(Section, { title: "Export", children: [_jsx("button", { className: "btn", onClick: onDownload, disabled: downloading, children: downloading ? 'Exporting…' : 'Export Texture PNG' }), _jsx("div", { style: { marginTop: 8 }, children: _jsx("button", { className: "btn", onClick: async () => {
                                const textureCanvas = useApp.getState().composedCanvas;
                                if (!textureCanvas)
                                    return;
                                await exportMeshAsGLB(textureCanvas);
                            }, children: "Export GLB" }) })] }), _jsxs(Section, { title: "Decals (Images)", children: [_jsx("input", { type: "file", accept: "image/*", onChange: async (e) => {
                            const f = e.target.files?.[0];
                            if (!f || !addDecalFromFile)
                                return;
                            await addDecalFromFile(f, undefined, activeLayerId);
                        } }), _jsx("div", { style: { marginTop: 8, display: 'grid', gap: 6 }, children: decals.filter((d) => d.layerId === activeLayerId).map((d) => (_jsxs("div", { style: { display: 'flex', gap: 6, alignItems: 'center' }, children: [_jsx("button", { className: `btn ${activeDecalId === d.id ? 'active' : ''}`, onClick: () => selectDecal && selectDecal(d.id), children: d.name }), _jsx("input", { type: "range", min: 0.1, max: 2, step: 0.05, value: d.scale, onChange: (e) => updateDecal && updateDecal(d.id, { scale: Number(e.target.value) }) }), _jsx("input", { type: "range", min: 0, max: 1, step: 0.05, value: d.opacity, onChange: (e) => updateDecal && updateDecal(d.id, { opacity: Number(e.target.value) }) }), _jsx("button", { className: "btn", onClick: () => removeDecal && removeDecal(d.id), children: "Remove" })] }, d.id))) })] }), _jsxs(Section, { title: "Navigate Model", children: [_jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }, children: [_jsx("button", { className: "btn", onClick: () => nudgeModel('x', -0.05), children: "X-" }), _jsx("button", { className: "btn", onClick: () => nudgeModel('x', +0.05), children: "X+" }), _jsx("button", { className: "btn", onClick: () => rotateModel('x', 15), children: "Rot X" }), _jsx("button", { className: "btn", onClick: () => nudgeModel('y', -0.05), children: "Y-" }), _jsx("button", { className: "btn", onClick: () => nudgeModel('y', +0.05), children: "Y+" }), _jsx("button", { className: "btn", onClick: () => rotateModel('y', 15), children: "Rot Y" }), _jsx("button", { className: "btn", onClick: () => nudgeModel('z', -0.05), children: "Z-" }), _jsx("button", { className: "btn", onClick: () => nudgeModel('z', +0.05), children: "Z+" }), _jsx("button", { className: "btn", onClick: () => rotateModel('z', 15), children: "Rot Z" })] }), _jsxs("div", { style: { marginTop: 6, display: 'flex', gap: 8 }, children: [_jsx("button", { className: "btn", onClick: () => resetModelTransform(), children: "Reset" }), _jsx("button", { className: "btn", onClick: () => snapModelToOrigin(), children: "Snap Origin" }), _jsx("button", { className: "btn", onClick: () => snapModelRotation90(), children: "Snap Rot 90\u00B0" })] }), _jsx("div", { style: { marginTop: 8, display: 'flex', gap: 8 }, children: _jsx(CustomSelect, { value: "", placeholder: "Camera View\u2026", onChange: (v) => setCameraView(v), options: [
                                { value: 'front', label: 'Front' },
                                { value: 'back', label: 'Back' },
                                { value: 'left', label: 'Left' },
                                { value: 'right', label: 'Right' },
                                { value: 'top', label: 'Top' },
                                { value: 'bottom', label: 'Bottom' },
                            ] }) }), _jsxs("div", { style: { marginTop: 8 }, children: [_jsxs("div", { className: "label", children: ["Model Scale (", modelScale.toFixed(2), "\u00D7)"] }), _jsx("input", { type: "range", min: 0.25, max: 2, step: 0.05, value: modelScale, onChange: (e) => setModelScale && setModelScale(Number(e.target.value)) }), modelBoundsHeight && (_jsxs("div", { className: "label", children: ["Model Height \u2248 ", (modelBoundsHeight * modelScale).toFixed(2), " m"] }))] })] })] }));
}
