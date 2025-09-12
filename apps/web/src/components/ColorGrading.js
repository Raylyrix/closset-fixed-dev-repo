import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../App';
export function ColorGrading({ active }) {
    // Console log removed
    const { composedCanvas, activeTool, brushColor, brushSize, layers, activeLayerId, commit } = useApp();
    // Color grading state
    const [adjustments, setAdjustments] = useState({
        brightness: 0,
        contrast: 0,
        saturation: 0,
        vibrance: 0,
        hue: 0,
        temperature: 0,
        tint: 0,
        exposure: 0,
        highlights: 0,
        shadows: 0,
        whites: 0,
        blacks: 0
    });
    const [colorCurves, setColorCurves] = useState([]);
    const [activeCurve, setActiveCurve] = useState(null);
    const [histogramData, setHistogramData] = useState(null);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [previewCanvas, setPreviewCanvas] = useState(null);
    const [originalCanvas, setOriginalCanvas] = useState(null);
    // Color lookup tables
    const [colorLookups, setColorLookups] = useState([
        {
            id: 'vintage',
            name: 'Vintage',
            description: 'Warm, nostalgic look',
            category: 'Vintage',
            preview: 'vintage_preview.png',
            adjustments: {
                brightness: -10,
                contrast: 15,
                saturation: -20,
                vibrance: 10,
                hue: 0,
                temperature: 15,
                tint: 5,
                exposure: -5,
                highlights: -20,
                shadows: 10,
                whites: -10,
                blacks: 5
            }
        },
        {
            id: 'dramatic',
            name: 'Dramatic',
            description: 'High contrast, cinematic look',
            category: 'Cinematic',
            preview: 'dramatic_preview.png',
            adjustments: {
                brightness: 5,
                contrast: 30,
                saturation: 10,
                vibrance: 15,
                hue: 0,
                temperature: -5,
                tint: 0,
                exposure: 10,
                highlights: -30,
                shadows: 20,
                whites: -20,
                blacks: -10
            }
        },
        {
            id: 'cool',
            name: 'Cool',
            description: 'Cool, blue-tinted look',
            category: 'Cool',
            preview: 'cool_preview.png',
            adjustments: {
                brightness: 0,
                contrast: 5,
                saturation: -5,
                vibrance: 0,
                hue: 0,
                temperature: -20,
                tint: -10,
                exposure: 0,
                highlights: 0,
                shadows: 0,
                whites: 0,
                blacks: 0
            }
        },
        {
            id: 'warm',
            name: 'Warm',
            description: 'Warm, orange-tinted look',
            category: 'Warm',
            preview: 'warm_preview.png',
            adjustments: {
                brightness: 5,
                contrast: 5,
                saturation: 10,
                vibrance: 5,
                hue: 0,
                temperature: 20,
                tint: 10,
                exposure: 5,
                highlights: 0,
                shadows: 0,
                whites: 0,
                blacks: 0
            }
        }
    ]);
    // Refs
    const gradingCanvasRef = useRef(null);
    const histogramCanvasRef = useRef(null);
    // Initialize color grading canvas
    useEffect(() => {
        if (!active || !composedCanvas) {
            // Console log removed
            return;
        }
        console.log('🎨 ColorGrading: Initializing color grading canvas', {
            composedCanvasSize: `${composedCanvas.width}x${composedCanvas.height}`
        });
        // Create grading canvas
        const gradingCanvas = document.createElement('canvas');
        gradingCanvas.width = composedCanvas.width;
        gradingCanvas.height = composedCanvas.height;
        gradingCanvasRef.current = gradingCanvas;
        // Create preview canvas
        const previewCanvas = document.createElement('canvas');
        previewCanvas.width = composedCanvas.width;
        previewCanvas.height = composedCanvas.height;
        setPreviewCanvas(previewCanvas);
        // Store original canvas
        const originalCanvas = document.createElement('canvas');
        originalCanvas.width = composedCanvas.width;
        originalCanvas.height = composedCanvas.height;
        const originalCtx = originalCanvas.getContext('2d');
        originalCtx.drawImage(composedCanvas, 0, 0);
        setOriginalCanvas(originalCanvas);
        // Generate histogram
        generateHistogram(composedCanvas);
        // Console log removed
    }, [active, composedCanvas]);
    // Generate histogram data
    const generateHistogram = useCallback((canvas) => {
        // Console log removed
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const histogram = {
            red: new Array(256).fill(0),
            green: new Array(256).fill(0),
            blue: new Array(256).fill(0),
            luminance: new Array(256).fill(0)
        };
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            if (a > 0) {
                histogram.red[r]++;
                histogram.green[g]++;
                histogram.blue[b]++;
                // Calculate luminance
                const luminance = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
                histogram.luminance[luminance]++;
            }
        }
        setHistogramData(histogram);
        // Console log removed
    }, []);
    // Apply color adjustments
    const applyColorAdjustments = useCallback((imageData, adjustments) => {
        // Console log removed
        const data = new Uint8ClampedArray(imageData.data);
        const width = imageData.width;
        const height = imageData.height;
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];
            let a = data[i + 3];
            if (a === 0)
                continue;
            // Apply brightness
            if (adjustments.brightness !== 0) {
                r = Math.max(0, Math.min(255, r + adjustments.brightness));
                g = Math.max(0, Math.min(255, g + adjustments.brightness));
                b = Math.max(0, Math.min(255, b + adjustments.brightness));
            }
            // Apply contrast
            if (adjustments.contrast !== 0) {
                const factor = (259 * (adjustments.contrast + 255)) / (255 * (259 - adjustments.contrast));
                r = Math.max(0, Math.min(255, factor * (r - 128) + 128));
                g = Math.max(0, Math.min(255, factor * (g - 128) + 128));
                b = Math.max(0, Math.min(255, factor * (b - 128) + 128));
            }
            // Apply saturation
            if (adjustments.saturation !== 0) {
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                const factor = 1 + adjustments.saturation / 100;
                r = Math.max(0, Math.min(255, gray + factor * (r - gray)));
                g = Math.max(0, Math.min(255, gray + factor * (g - gray)));
                b = Math.max(0, Math.min(255, gray + factor * (b - gray)));
            }
            // Apply vibrance (selective saturation)
            if (adjustments.vibrance !== 0) {
                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                const saturation = max === 0 ? 0 : (max - min) / max;
                if (saturation < 0.5) { // Only boost less saturated colors
                    const factor = 1 + adjustments.vibrance / 100;
                    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                    r = Math.max(0, Math.min(255, gray + factor * (r - gray)));
                    g = Math.max(0, Math.min(255, gray + factor * (g - gray)));
                    b = Math.max(0, Math.min(255, gray + factor * (b - gray)));
                }
            }
            // Apply hue shift
            if (adjustments.hue !== 0) {
                const hsv = rgbToHsv(r, g, b);
                hsv.h = (hsv.h + adjustments.hue) % 360;
                const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
                r = rgb.r;
                g = rgb.g;
                b = rgb.b;
            }
            // Apply temperature (blue/amber)
            if (adjustments.temperature !== 0) {
                const factor = adjustments.temperature / 100;
                if (factor > 0) {
                    // Warm (more red, less blue)
                    r = Math.max(0, Math.min(255, r + factor * 20));
                    b = Math.max(0, Math.min(255, b - factor * 20));
                }
                else {
                    // Cool (more blue, less red)
                    r = Math.max(0, Math.min(255, r + factor * 20));
                    b = Math.max(0, Math.min(255, b - factor * 20));
                }
            }
            // Apply tint (green/magenta)
            if (adjustments.tint !== 0) {
                const factor = adjustments.tint / 100;
                if (factor > 0) {
                    // Magenta (more red and blue, less green)
                    r = Math.max(0, Math.min(255, r + factor * 10));
                    g = Math.max(0, Math.min(255, g - factor * 10));
                    b = Math.max(0, Math.min(255, b + factor * 10));
                }
                else {
                    // Green (more green, less red and blue)
                    r = Math.max(0, Math.min(255, r + factor * 10));
                    g = Math.max(0, Math.min(255, g - factor * 10));
                    b = Math.max(0, Math.min(255, b + factor * 10));
                }
            }
            // Apply exposure
            if (adjustments.exposure !== 0) {
                const factor = Math.pow(2, adjustments.exposure / 100);
                r = Math.max(0, Math.min(255, r * factor));
                g = Math.max(0, Math.min(255, g * factor));
                b = Math.max(0, Math.min(255, b * factor));
            }
            // Apply highlights
            if (adjustments.highlights !== 0) {
                const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
                if (luminance > 128) {
                    const factor = 1 + adjustments.highlights / 100;
                    r = Math.max(0, Math.min(255, r * factor));
                    g = Math.max(0, Math.min(255, g * factor));
                    b = Math.max(0, Math.min(255, b * factor));
                }
            }
            // Apply shadows
            if (adjustments.shadows !== 0) {
                const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
                if (luminance < 128) {
                    const factor = 1 + adjustments.shadows / 100;
                    r = Math.max(0, Math.min(255, r * factor));
                    g = Math.max(0, Math.min(255, g * factor));
                    b = Math.max(0, Math.min(255, b * factor));
                }
            }
            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
        }
        return new ImageData(data, width, height);
    }, []);
    // RGB to HSV conversion
    const rgbToHsv = useCallback((r, g, b) => {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;
        let h = 0;
        if (diff !== 0) {
            if (max === r)
                h = ((g - b) / diff) % 6;
            else if (max === g)
                h = (b - r) / diff + 2;
            else
                h = (r - g) / diff + 4;
        }
        h = (h * 60 + 360) % 360;
        const s = max === 0 ? 0 : diff / max;
        const v = max;
        return { h, s, v };
    }, []);
    // HSV to RGB conversion
    const hsvToRgb = useCallback((h, s, v) => {
        const c = v * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = v - c;
        let r = 0, g = 0, b = 0;
        if (h < 60) {
            r = c;
            g = x;
            b = 0;
        }
        else if (h < 120) {
            r = x;
            g = c;
            b = 0;
        }
        else if (h < 180) {
            r = 0;
            g = c;
            b = x;
        }
        else if (h < 240) {
            r = 0;
            g = x;
            b = c;
        }
        else if (h < 300) {
            r = x;
            g = 0;
            b = c;
        }
        else {
            r = c;
            g = 0;
            b = x;
        }
        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255)
        };
    }, []);
    // Render color grading preview
    const renderColorGradingPreview = useCallback(() => {
        if (!previewCanvas || !originalCanvas || !gradingCanvasRef.current) {
            // Console log removed
            return;
        }
        // Console log removed
        const previewCtx = previewCanvas.getContext('2d');
        const gradingCtx = gradingCanvasRef.current.getContext('2d');
        // Clear canvases
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        gradingCtx.clearRect(0, 0, gradingCanvasRef.current.width, gradingCanvasRef.current.height);
        // Draw original image
        gradingCtx.drawImage(originalCanvas, 0, 0);
        // Apply color adjustments
        const imageData = gradingCtx.getImageData(0, 0, gradingCanvasRef.current.width, gradingCanvasRef.current.height);
        const adjustedData = applyColorAdjustments(imageData, adjustments);
        gradingCtx.putImageData(adjustedData, 0, 0);
        // Draw final result to preview
        previewCtx.drawImage(gradingCanvasRef.current, 0, 0);
        // Console log removed
    }, [previewCanvas, originalCanvas, adjustments, applyColorAdjustments]);
    // Apply color lookup
    const applyColorLookup = useCallback((lookup) => {
        // Console log removed
        setAdjustments(lookup.adjustments);
        // Console log removed
    }, []);
    // Reset adjustments
    const resetAdjustments = useCallback(() => {
        // Console log removed
        setAdjustments({
            brightness: 0,
            contrast: 0,
            saturation: 0,
            vibrance: 0,
            hue: 0,
            temperature: 0,
            tint: 0,
            exposure: 0,
            highlights: 0,
            shadows: 0,
            whites: 0,
            blacks: 0
        });
        // Console log removed
    }, []);
    // Apply color grading to design
    const applyColorGradingToDesign = useCallback(() => {
        if (!previewCanvas || !composedCanvas || !commit) {
            // Console log removed
            return;
        }
        // Console log removed
        // Draw color graded result to composed canvas
        const composedCtx = composedCanvas.getContext('2d');
        composedCtx.clearRect(0, 0, composedCanvas.width, composedCanvas.height);
        composedCtx.drawImage(previewCanvas, 0, 0);
        // Commit changes
        commit();
        // Console log removed
    }, [previewCanvas, composedCanvas, commit]);
    // Render histogram
    const renderHistogram = useCallback(() => {
        if (!histogramCanvasRef.current || !histogramData)
            return;
        // Console log removed
        const canvas = histogramCanvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);
        // Find max value for scaling
        const maxValue = Math.max(...histogramData.red, ...histogramData.green, ...histogramData.blue, ...histogramData.luminance);
        // Draw histogram bars
        const barWidth = width / 256;
        // Red channel
        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
        for (let i = 0; i < 256; i++) {
            const barHeight = (histogramData.red[i] / maxValue) * height;
            ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight);
        }
        // Green channel
        ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
        for (let i = 0; i < 256; i++) {
            const barHeight = (histogramData.green[i] / maxValue) * height;
            ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight);
        }
        // Blue channel
        ctx.fillStyle = 'rgba(0, 0, 255, 0.7)';
        for (let i = 0; i < 256; i++) {
            const barHeight = (histogramData.blue[i] / maxValue) * height;
            ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight);
        }
        // Luminance
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 256; i++) {
            const barHeight = (histogramData.luminance[i] / maxValue) * height;
            ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight);
        }
        // Console log removed
    }, [histogramData]);
    // Render preview when adjustments change
    useEffect(() => {
        if (isPreviewMode) {
            renderColorGradingPreview();
        }
    }, [isPreviewMode, renderColorGradingPreview, adjustments]);
    // Render histogram when data changes
    useEffect(() => {
        renderHistogram();
    }, [renderHistogram, histogramData]);
    if (!active) {
        // Console log removed
        return null;
    }
    console.log('🎨 ColorGrading: Rendering component', {
        isPreviewMode,
        adjustmentsCount: Object.values(adjustments).filter(v => v !== 0).length
    });
    return (_jsxs("div", { className: "color-grading", style: {
            border: '2px solid #F59E0B',
            borderRadius: '8px',
            padding: '12px',
            background: 'rgba(245, 158, 11, 0.1)',
            boxShadow: '0 0 10px rgba(245, 158, 11, 0.3)',
            marginTop: '12px'
        }, children: [_jsxs("div", { className: "grading-header", style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                }, children: [_jsx("h4", { style: { margin: 0, color: '#F59E0B', fontSize: '16px' }, children: "\uD83C\uDFA8 Color Grading" }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx("button", { className: "btn", onClick: () => setIsPreviewMode(!isPreviewMode), style: {
                                    background: isPreviewMode ? '#F59E0B' : '#6B7280',
                                    color: 'white',
                                    fontSize: '12px',
                                    padding: '6px 12px'
                                }, children: isPreviewMode ? 'Exit Preview' : 'Preview' }), _jsx("button", { className: "btn", onClick: applyColorGradingToDesign, style: {
                                    background: '#10B981',
                                    color: 'white',
                                    fontSize: '12px',
                                    padding: '6px 12px'
                                }, children: "Apply" }), _jsx("button", { className: "btn", onClick: () => useApp.getState().setTool('brush'), style: {
                                    background: '#6B7280',
                                    color: 'white',
                                    fontSize: '12px',
                                    padding: '6px 12px'
                                }, title: "Close Color Grading", children: "\u2715 Close" })] })] }), _jsxs("div", { className: "color-lookups", style: {
                    marginBottom: '12px'
                }, children: [_jsx("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '8px' }, children: "Color Lookups" }), _jsx("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '8px'
                        }, children: colorLookups.map(lookup => (_jsxs("button", { className: "btn", onClick: () => applyColorLookup(lookup), style: {
                                fontSize: '10px',
                                padding: '8px 4px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px'
                            }, children: [_jsx("span", { style: { fontSize: '16px' }, children: "\uD83C\uDFA8" }), _jsx("span", { children: lookup.name })] }, lookup.id))) })] }), _jsxs("div", { className: "basic-adjustments", style: {
                    marginBottom: '12px'
                }, children: [_jsx("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '8px' }, children: "Basic Adjustments" }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '12px'
                        }, children: [_jsxs("div", { children: [_jsxs("label", { style: { fontSize: '10px', color: '#F59E0B' }, children: ["Brightness: ", adjustments.brightness] }), _jsx("input", { type: "range", min: "-100", max: "100", value: adjustments.brightness, onChange: (e) => setAdjustments(prev => ({ ...prev, brightness: parseInt(e.target.value) })), style: { width: '100%' } })] }), _jsxs("div", { children: [_jsxs("label", { style: { fontSize: '10px', color: '#F59E0B' }, children: ["Contrast: ", adjustments.contrast] }), _jsx("input", { type: "range", min: "-100", max: "100", value: adjustments.contrast, onChange: (e) => setAdjustments(prev => ({ ...prev, contrast: parseInt(e.target.value) })), style: { width: '100%' } })] }), _jsxs("div", { children: [_jsxs("label", { style: { fontSize: '10px', color: '#F59E0B' }, children: ["Saturation: ", adjustments.saturation] }), _jsx("input", { type: "range", min: "-100", max: "100", value: adjustments.saturation, onChange: (e) => setAdjustments(prev => ({ ...prev, saturation: parseInt(e.target.value) })), style: { width: '100%' } })] }), _jsxs("div", { children: [_jsxs("label", { style: { fontSize: '10px', color: '#F59E0B' }, children: ["Vibrance: ", adjustments.vibrance] }), _jsx("input", { type: "range", min: "-100", max: "100", value: adjustments.vibrance, onChange: (e) => setAdjustments(prev => ({ ...prev, vibrance: parseInt(e.target.value) })), style: { width: '100%' } })] })] })] }), _jsxs("div", { className: "color-adjustments", style: {
                    marginBottom: '12px'
                }, children: [_jsx("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '8px' }, children: "Color Adjustments" }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '12px'
                        }, children: [_jsxs("div", { children: [_jsxs("label", { style: { fontSize: '10px', color: '#F59E0B' }, children: ["Hue: ", adjustments.hue, "\u00B0"] }), _jsx("input", { type: "range", min: "-180", max: "180", value: adjustments.hue, onChange: (e) => setAdjustments(prev => ({ ...prev, hue: parseInt(e.target.value) })), style: { width: '100%' } })] }), _jsxs("div", { children: [_jsxs("label", { style: { fontSize: '10px', color: '#F59E0B' }, children: ["Temperature: ", adjustments.temperature] }), _jsx("input", { type: "range", min: "-100", max: "100", value: adjustments.temperature, onChange: (e) => setAdjustments(prev => ({ ...prev, temperature: parseInt(e.target.value) })), style: { width: '100%' } })] }), _jsxs("div", { children: [_jsxs("label", { style: { fontSize: '10px', color: '#F59E0B' }, children: ["Tint: ", adjustments.tint] }), _jsx("input", { type: "range", min: "-100", max: "100", value: adjustments.tint, onChange: (e) => setAdjustments(prev => ({ ...prev, tint: parseInt(e.target.value) })), style: { width: '100%' } })] }), _jsxs("div", { children: [_jsxs("label", { style: { fontSize: '10px', color: '#F59E0B' }, children: ["Exposure: ", adjustments.exposure] }), _jsx("input", { type: "range", min: "-100", max: "100", value: adjustments.exposure, onChange: (e) => setAdjustments(prev => ({ ...prev, exposure: parseInt(e.target.value) })), style: { width: '100%' } })] })] })] }), _jsxs("div", { className: "tone-adjustments", style: {
                    marginBottom: '12px'
                }, children: [_jsx("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '8px' }, children: "Tone Adjustments" }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '12px'
                        }, children: [_jsxs("div", { children: [_jsxs("label", { style: { fontSize: '10px', color: '#F59E0B' }, children: ["Highlights: ", adjustments.highlights] }), _jsx("input", { type: "range", min: "-100", max: "100", value: adjustments.highlights, onChange: (e) => setAdjustments(prev => ({ ...prev, highlights: parseInt(e.target.value) })), style: { width: '100%' } })] }), _jsxs("div", { children: [_jsxs("label", { style: { fontSize: '10px', color: '#F59E0B' }, children: ["Shadows: ", adjustments.shadows] }), _jsx("input", { type: "range", min: "-100", max: "100", value: adjustments.shadows, onChange: (e) => setAdjustments(prev => ({ ...prev, shadows: parseInt(e.target.value) })), style: { width: '100%' } })] }), _jsxs("div", { children: [_jsxs("label", { style: { fontSize: '10px', color: '#F59E0B' }, children: ["Whites: ", adjustments.whites] }), _jsx("input", { type: "range", min: "-100", max: "100", value: adjustments.whites, onChange: (e) => setAdjustments(prev => ({ ...prev, whites: parseInt(e.target.value) })), style: { width: '100%' } })] }), _jsxs("div", { children: [_jsxs("label", { style: { fontSize: '10px', color: '#F59E0B' }, children: ["Blacks: ", adjustments.blacks] }), _jsx("input", { type: "range", min: "-100", max: "100", value: adjustments.blacks, onChange: (e) => setAdjustments(prev => ({ ...prev, blacks: parseInt(e.target.value) })), style: { width: '100%' } })] })] })] }), histogramData && (_jsxs("div", { className: "histogram", style: {
                    marginBottom: '12px'
                }, children: [_jsx("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '8px' }, children: "Histogram" }), _jsx("canvas", { ref: histogramCanvasRef, width: 256, height: 100, style: {
                            width: '100%',
                            height: '100px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '4px'
                        } })] })), isPreviewMode && previewCanvas && (_jsxs("div", { className: "grading-preview", style: {
                    border: '1px solid #F59E0B',
                    borderRadius: '4px',
                    padding: '8px',
                    background: 'white',
                    marginBottom: '12px'
                }, children: [_jsx("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '8px' }, children: "Color Grading Preview" }), _jsx("canvas", { width: previewCanvas.width, height: previewCanvas.height, style: {
                            width: '100%',
                            height: 'auto',
                            maxWidth: '300px',
                            border: '1px solid #E5E7EB'
                        } })] })), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx("button", { className: "btn", onClick: resetAdjustments, style: {
                            background: '#6B7280',
                            color: 'white',
                            fontSize: '12px',
                            padding: '8px 16px',
                            flex: 1
                        }, children: "Reset" }), _jsx("button", { className: "btn", onClick: applyColorGradingToDesign, style: {
                            background: '#10B981',
                            color: 'white',
                            fontSize: '12px',
                            padding: '8px 16px',
                            flex: 1
                        }, children: "Apply" })] }), _jsx("div", { style: { fontSize: '12px', color: '#6B7280', textAlign: 'center', marginTop: '8px' }, children: "Professional color grading and adjustment tools" })] }));
}
