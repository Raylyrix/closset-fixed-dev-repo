import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Advanced Vector Settings Panel
// Provides comprehensive control over vector tool features and stitch rendering
import { useState, useEffect } from 'react';
import { useApp } from '../App';
import { vectorToolManager } from '../utils/vectorToolManager';
const VectorSettingsPanel = ({ isVisible, onClose }) => {
    const { embroideryStitchType, embroideryColor, embroideryThickness, embroideryOpacity } = useApp();
    // Enhanced stitch settings
    const [threadType, setThreadType] = useState('cotton');
    const [tension, setTension] = useState(0.5);
    const [density, setDensity] = useState(0.7);
    const [direction, setDirection] = useState(0);
    const [pattern, setPattern] = useState('regular');
    const [quality, setQuality] = useState('high');
    // Performance settings
    const [enableCaching, setEnableCaching] = useState(true);
    const [enableOptimization, setEnableOptimization] = useState(true);
    const [maxCacheSize, setMaxCacheSize] = useState(100);
    // AI/ML settings
    const [enableAI, setEnableAI] = useState(true);
    const [autoOptimize, setAutoOptimize] = useState(true);
    const [smartSpacing, setSmartSpacing] = useState(true);
    // Performance metrics
    const [performanceMetrics, setPerformanceMetrics] = useState(new Map());
    useEffect(() => {
        if (isVisible) {
            // Load performance metrics
            const metrics = vectorToolManager.getPerformanceMetrics();
            setPerformanceMetrics(metrics);
        }
    }, [isVisible]);
    const handleThreadTypeChange = (type) => {
        setThreadType(type);
        // Update global settings if needed
    };
    const handleTensionChange = (value) => {
        setTension(value);
    };
    const handleDensityChange = (value) => {
        setDensity(value);
    };
    const handleDirectionChange = (value) => {
        setDirection(value);
    };
    const handleQualityChange = (value) => {
        setQuality(value);
    };
    const clearCache = () => {
        vectorToolManager.clearCache();
        console.log('Vector tool cache cleared');
    };
    const clearPerformanceMetrics = () => {
        vectorToolManager.clearPerformanceMetrics();
        setPerformanceMetrics(new Map());
        console.log('Performance metrics cleared');
    };
    const getAveragePerformance = (tool) => {
        const metrics = performanceMetrics.get(tool) || [];
        if (metrics.length === 0)
            return 0;
        return metrics.reduce((sum, time) => sum + time, 0) / metrics.length;
    };
    if (!isVisible)
        return null;
    return (_jsxs("div", { style: {
            position: 'fixed',
            top: '60px',
            right: '20px',
            width: '350px',
            maxHeight: '80vh',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '20px',
            color: 'white',
            zIndex: 10002,
            overflowY: 'auto',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }, children: [_jsx("h3", { style: { margin: 0, fontSize: '18px', fontWeight: '600' }, children: "Vector Settings" }), _jsx("button", { onClick: onClose, style: {
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            fontSize: '20px',
                            cursor: 'pointer',
                            padding: '5px'
                        }, children: "\u2715" })] }), _jsxs("div", { style: { marginBottom: '25px' }, children: [_jsx("h4", { style: { margin: '0 0 15px 0', fontSize: '14px', fontWeight: '600', color: '#94a3b8' }, children: "Thread Properties" }), _jsxs("div", { style: { marginBottom: '15px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '5px', fontSize: '12px' }, children: "Thread Type" }), _jsxs("select", { value: threadType, onChange: (e) => handleThreadTypeChange(e.target.value), style: {
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: '6px',
                                    border: '1px solid #475569',
                                    background: '#1e293b',
                                    color: 'white',
                                    fontSize: '12px'
                                }, children: [_jsx("option", { value: "cotton", children: "Cotton" }), _jsx("option", { value: "silk", children: "Silk" }), _jsx("option", { value: "wool", children: "Wool" }), _jsx("option", { value: "synthetic", children: "Synthetic" })] })] }), _jsxs("div", { style: { marginBottom: '15px' }, children: [_jsxs("label", { style: { display: 'block', marginBottom: '5px', fontSize: '12px' }, children: ["Tension: ", tension.toFixed(2)] }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.01", value: tension, onChange: (e) => handleTensionChange(parseFloat(e.target.value)), style: { width: '100%' } })] }), _jsxs("div", { style: { marginBottom: '15px' }, children: [_jsxs("label", { style: { display: 'block', marginBottom: '5px', fontSize: '12px' }, children: ["Density: ", density.toFixed(2)] }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.01", value: density, onChange: (e) => handleDensityChange(parseFloat(e.target.value)), style: { width: '100%' } })] }), _jsxs("div", { style: { marginBottom: '15px' }, children: [_jsxs("label", { style: { display: 'block', marginBottom: '5px', fontSize: '12px' }, children: ["Direction: ", direction, "\u00B0"] }), _jsx("input", { type: "range", min: "0", max: "360", step: "1", value: direction, onChange: (e) => handleDirectionChange(parseInt(e.target.value)), style: { width: '100%' } })] })] }), _jsxs("div", { style: { marginBottom: '25px' }, children: [_jsx("h4", { style: { margin: '0 0 15px 0', fontSize: '14px', fontWeight: '600', color: '#94a3b8' }, children: "Rendering Quality" }), _jsxs("div", { style: { marginBottom: '15px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '5px', fontSize: '12px' }, children: "Quality Level" }), _jsxs("select", { value: quality, onChange: (e) => handleQualityChange(e.target.value), style: {
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: '6px',
                                    border: '1px solid #475569',
                                    background: '#1e293b',
                                    color: 'white',
                                    fontSize: '12px'
                                }, children: [_jsx("option", { value: "draft", children: "Draft (Fast)" }), _jsx("option", { value: "normal", children: "Normal" }), _jsx("option", { value: "high", children: "High Quality" }), _jsx("option", { value: "ultra", children: "Ultra (Slow)" })] })] }), _jsx("div", { style: { marginBottom: '15px' }, children: _jsxs("label", { style: { display: 'flex', alignItems: 'center', fontSize: '12px' }, children: [_jsx("input", { type: "checkbox", checked: enableCaching, onChange: (e) => setEnableCaching(e.target.checked), style: { marginRight: '8px' } }), "Enable Rendering Cache"] }) }), _jsx("div", { style: { marginBottom: '15px' }, children: _jsxs("label", { style: { display: 'flex', alignItems: 'center', fontSize: '12px' }, children: [_jsx("input", { type: "checkbox", checked: enableOptimization, onChange: (e) => setEnableOptimization(e.target.checked), style: { marginRight: '8px' } }), "Enable Performance Optimization"] }) })] }), _jsxs("div", { style: { marginBottom: '25px' }, children: [_jsx("h4", { style: { margin: '0 0 15px 0', fontSize: '14px', fontWeight: '600', color: '#94a3b8' }, children: "AI/ML Features" }), _jsx("div", { style: { marginBottom: '15px' }, children: _jsxs("label", { style: { display: 'flex', alignItems: 'center', fontSize: '12px' }, children: [_jsx("input", { type: "checkbox", checked: enableAI, onChange: (e) => setEnableAI(e.target.checked), style: { marginRight: '8px' } }), "Enable AI-Powered Rendering"] }) }), _jsx("div", { style: { marginBottom: '15px' }, children: _jsxs("label", { style: { display: 'flex', alignItems: 'center', fontSize: '12px' }, children: [_jsx("input", { type: "checkbox", checked: autoOptimize, onChange: (e) => setAutoOptimize(e.target.checked), style: { marginRight: '8px' } }), "Auto-Optimize Paths"] }) }), _jsx("div", { style: { marginBottom: '15px' }, children: _jsxs("label", { style: { display: 'flex', alignItems: 'center', fontSize: '12px' }, children: [_jsx("input", { type: "checkbox", checked: smartSpacing, onChange: (e) => setSmartSpacing(e.target.checked), style: { marginRight: '8px' } }), "Smart Stitch Spacing"] }) })] }), _jsxs("div", { style: { marginBottom: '25px' }, children: [_jsx("h4", { style: { margin: '0 0 15px 0', fontSize: '14px', fontWeight: '600', color: '#94a3b8' }, children: "Performance Metrics" }), Array.from(performanceMetrics.entries()).map(([tool, metrics]) => (_jsx("div", { style: { marginBottom: '10px', fontSize: '11px' }, children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [_jsxs("span", { style: { textTransform: 'capitalize' }, children: [tool, ":"] }), _jsxs("span", { children: [getAveragePerformance(tool).toFixed(2), "ms avg"] })] }) }, tool))), _jsxs("div", { style: { display: 'flex', gap: '10px', marginTop: '15px' }, children: [_jsx("button", { onClick: clearCache, style: {
                                    padding: '6px 12px',
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '6px',
                                    color: 'white',
                                    fontSize: '11px',
                                    cursor: 'pointer'
                                }, children: "Clear Cache" }), _jsx("button", { onClick: clearPerformanceMetrics, style: {
                                    padding: '6px 12px',
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    borderRadius: '6px',
                                    color: 'white',
                                    fontSize: '11px',
                                    cursor: 'pointer'
                                }, children: "Clear Metrics" })] })] }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("h4", { style: { margin: '0 0 15px 0', fontSize: '14px', fontWeight: '600', color: '#94a3b8' }, children: "Current Settings" }), _jsxs("div", { style: { fontSize: '11px', lineHeight: '1.4' }, children: [_jsxs("div", { children: ["Thread: ", threadType] }), _jsxs("div", { children: ["Tension: ", (tension * 100).toFixed(0), "%"] }), _jsxs("div", { children: ["Density: ", (density * 100).toFixed(0), "%"] }), _jsxs("div", { children: ["Direction: ", direction, "\u00B0"] }), _jsxs("div", { children: ["Quality: ", quality] }), _jsxs("div", { children: ["AI: ", enableAI ? 'ON' : 'OFF'] })] })] })] }));
};
export default VectorSettingsPanel;
