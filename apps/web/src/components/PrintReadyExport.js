import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../App';
export function PrintReadyExport({ active }) {
    // Console log removed
    const { composedCanvas, activeTool, brushColor, brushSize, layers, activeLayerId, textElements, decals, commit } = useApp();
    // Export state
    const [selectedFormat, setSelectedFormat] = useState('png');
    const [exportPreset, setExportPreset] = useState('high_quality');
    const [printSpecs, setPrintSpecs] = useState({
        width: 8,
        height: 10,
        resolution: 300,
        colorMode: 'RGB',
        bleed: 0.125,
        safeArea: 0.25,
        colorProfile: 'sRGB'
    });
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [exportHistory, setExportHistory] = useState([]);
    // Export formats
    const exportFormats = [
        {
            id: 'png',
            name: 'PNG',
            extension: '.png',
            description: 'High-quality raster image with transparency',
            category: 'print',
            settings: { resolution: 300, compression: 0, quality: 100 }
        },
        {
            id: 'jpg',
            name: 'JPEG',
            extension: '.jpg',
            description: 'Compressed image format for web and print',
            category: 'print',
            settings: { resolution: 300, compression: 85, quality: 85 }
        },
        {
            id: 'pdf',
            name: 'PDF',
            extension: '.pdf',
            description: 'Print-ready PDF with vector elements',
            category: 'print',
            settings: { resolution: 300, colorProfile: 'CMYK', quality: 100 }
        },
        {
            id: 'svg',
            name: 'SVG',
            extension: '.svg',
            description: 'Scalable vector graphics',
            category: 'vector',
            settings: { resolution: 0, quality: 100 }
        },
        {
            id: 'eps',
            name: 'EPS',
            extension: '.eps',
            description: 'Encapsulated PostScript for professional printing',
            category: 'print',
            settings: { resolution: 300, colorProfile: 'CMYK', quality: 100 }
        },
        {
            id: 'ai',
            name: 'AI',
            extension: '.ai',
            description: 'Adobe Illustrator format',
            category: 'vector',
            settings: { resolution: 0, quality: 100 }
        },
        {
            id: 'dst',
            name: 'DST',
            extension: '.dst',
            description: 'Embroidery file format',
            category: 'embroidery',
            settings: { resolution: 300, quality: 100 }
        },
        {
            id: 'pes',
            name: 'PES',
            extension: '.pes',
            description: 'Brother embroidery format',
            category: 'embroidery',
            settings: { resolution: 300, quality: 100 }
        },
        {
            id: 'obj',
            name: 'OBJ',
            extension: '.obj',
            description: '3D model format',
            category: '3d',
            settings: { resolution: 300, quality: 100 }
        }
    ];
    // Export presets
    const exportPresets = [
        {
            id: 'high_quality',
            name: 'High Quality Print',
            description: '300 DPI, CMYK, with bleed',
            format: 'pdf',
            settings: { resolution: 300, colorMode: 'CMYK', bleed: 0.125 },
            category: 'print'
        },
        {
            id: 'web_optimized',
            name: 'Web Optimized',
            description: '72 DPI, RGB, compressed',
            format: 'jpg',
            settings: { resolution: 72, colorMode: 'RGB', compression: 80 },
            category: 'digital'
        },
        {
            id: 'vector_editable',
            name: 'Vector Editable',
            description: 'Scalable vector format',
            format: 'svg',
            settings: { resolution: 0, colorMode: 'RGB' },
            category: 'vector'
        },
        {
            id: 'embroidery_ready',
            name: 'Embroidery Ready',
            description: 'Optimized for embroidery machines',
            format: 'dst',
            settings: { resolution: 300, colorMode: 'RGB', maxColors: 15 },
            category: 'embroidery'
        },
        {
            id: '3d_printable',
            name: '3D Printable',
            description: 'Ready for 3D printing',
            format: 'obj',
            settings: { resolution: 300, colorMode: 'RGB' },
            category: '3d'
        }
    ];
    // Refs
    const exportCanvasRef = useRef(null);
    const downloadLinkRef = useRef(null);
    // Initialize export canvas
    useEffect(() => {
        if (!active || !composedCanvas) {
            // Console log removed
            return;
        }
        console.log('🖨️ PrintReadyExport: Initializing export canvas', {
            composedCanvasSize: `${composedCanvas.width}x${composedCanvas.height}`
        });
        // Create export canvas
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = composedCanvas.width;
        exportCanvas.height = composedCanvas.height;
        exportCanvasRef.current = exportCanvas;
        // Console log removed
    }, [active, composedCanvas]);
    // Calculate export dimensions
    const calculateExportDimensions = useCallback((format) => {
        if (!composedCanvas)
            return { width: 0, height: 0 };
        const baseWidth = composedCanvas.width;
        const baseHeight = composedCanvas.height;
        const dpi = format.settings.resolution || 72;
        const baseDpi = 72; // Assuming base canvas is 72 DPI
        const scaleFactor = dpi / baseDpi;
        const width = Math.round(baseWidth * scaleFactor);
        const height = Math.round(baseHeight * scaleFactor);
        console.log('🖨️ PrintReadyExport: Calculated export dimensions', {
            baseWidth,
            baseHeight,
            dpi,
            scaleFactor,
            width,
            height
        });
        return { width, height };
    }, [composedCanvas]);
    // Prepare canvas for export
    const prepareExportCanvas = useCallback((format) => {
        if (!composedCanvas || !exportCanvasRef.current) {
            // Console log removed
            return null;
        }
        // Console log removed
        const { width, height } = calculateExportDimensions(format);
        const exportCanvas = exportCanvasRef.current;
        const exportCtx = exportCanvas.getContext('2d');
        // Resize canvas
        exportCanvas.width = width;
        exportCanvas.height = height;
        // Set up canvas for high-quality rendering
        exportCtx.imageSmoothingEnabled = true;
        exportCtx.imageSmoothingQuality = 'high';
        // Draw composed canvas scaled up
        exportCtx.drawImage(composedCanvas, 0, 0, width, height);
        // Apply color profile if needed
        if (format.settings.colorProfile === 'CMYK') {
            // Console log removed
            // In a real implementation, this would convert RGB to CMYK
            // For now, we'll just log it
        }
        // Console log removed
        return exportCanvas;
    }, [composedCanvas, calculateExportDimensions]);
    // Export to PNG
    const exportToPNG = useCallback(async (canvas, settings) => {
        // Console log removed
        return new Promise((resolve) => {
            const dataURL = canvas.toDataURL('image/png', settings.quality / 100);
            resolve(dataURL);
        });
    }, []);
    // Export to JPEG
    const exportToJPEG = useCallback(async (canvas, settings) => {
        // Console log removed
        return new Promise((resolve) => {
            const dataURL = canvas.toDataURL('image/jpeg', settings.quality / 100);
            resolve(dataURL);
        });
    }, []);
    // Export to SVG
    const exportToSVG = useCallback(async (canvas, settings) => {
        // Console log removed
        // Convert canvas to SVG
        const svgString = `
      <svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">
        <image href="${canvas.toDataURL()}" width="${canvas.width}" height="${canvas.height}"/>
      </svg>
    `;
        return `data:image/svg+xml;base64,${btoa(svgString)}`;
    }, []);
    // Export to PDF
    const exportToPDF = useCallback(async (canvas, settings) => {
        // Console log removed
        // In a real implementation, this would use a PDF library like jsPDF
        // For now, we'll return a data URL
        const dataURL = canvas.toDataURL('image/png', 1.0);
        return dataURL;
    }, []);
    // Export to embroidery format
    const exportToEmbroidery = useCallback(async (canvas, settings) => {
        // Console log removed
        // In a real implementation, this would convert the design to embroidery stitches
        // For now, we'll return a placeholder
        const dataURL = canvas.toDataURL('image/png', 1.0);
        return dataURL;
    }, []);
    // Export to 3D format
    const exportTo3D = useCallback(async (canvas, settings) => {
        // Console log removed
        // In a real implementation, this would generate 3D geometry
        // For now, we'll return a placeholder
        const dataURL = canvas.toDataURL('image/png', 1.0);
        return dataURL;
    }, []);
    // Main export function
    const performExport = useCallback(async () => {
        if (!composedCanvas) {
            // Console log removed
            return;
        }
        // Console log removed
        setIsExporting(true);
        setExportProgress(0);
        try {
            const format = exportFormats.find(f => f.id === selectedFormat);
            const preset = exportPresets.find(p => p.id === exportPreset);
            if (!format) {
                throw new Error('Export format not found');
            }
            // Merge format and preset settings
            const exportSettings = {
                ...format.settings,
                ...(preset?.settings || {})
            };
            // Console log removed
            // Prepare canvas
            setExportProgress(20);
            const exportCanvas = prepareExportCanvas(format);
            if (!exportCanvas) {
                throw new Error('Failed to prepare export canvas');
            }
            // Export based on format
            setExportProgress(50);
            let dataURL;
            switch (format.id) {
                case 'png':
                    dataURL = await exportToPNG(exportCanvas, exportSettings);
                    break;
                case 'jpg':
                    dataURL = await exportToJPEG(exportCanvas, exportSettings);
                    break;
                case 'svg':
                    dataURL = await exportToSVG(exportCanvas, exportSettings);
                    break;
                case 'pdf':
                    dataURL = await exportToPDF(exportCanvas, exportSettings);
                    break;
                case 'dst':
                case 'pes':
                    dataURL = await exportToEmbroidery(exportCanvas, exportSettings);
                    break;
                case 'obj':
                    dataURL = await exportTo3D(exportCanvas, exportSettings);
                    break;
                default:
                    dataURL = await exportToPNG(exportCanvas, exportSettings);
            }
            // Download file
            setExportProgress(80);
            const link = document.createElement('a');
            link.download = `design-export-${Date.now()}${format.extension}`;
            link.href = dataURL;
            link.click();
            // Update export history
            const exportRecord = {
                id: `export_${Date.now()}`,
                format: format.name,
                preset: preset?.name || 'Custom',
                timestamp: new Date().toISOString(),
                size: dataURL.length,
                settings: exportSettings
            };
            setExportHistory(prev => [exportRecord, ...prev.slice(0, 9)]); // Keep last 10 exports
            setExportProgress(100);
            // Console log removed
        }
        catch (error) {
            console.error('🖨️ PrintReadyExport: Export failed', error);
        }
        finally {
            setIsExporting(false);
            setTimeout(() => setExportProgress(0), 1000);
        }
    }, [composedCanvas, selectedFormat, exportPreset, exportFormats, exportPresets, prepareExportCanvas, exportToPNG, exportToJPEG, exportToSVG, exportToPDF, exportToEmbroidery, exportTo3D]);
    // Batch export
    const performBatchExport = useCallback(async () => {
        if (!composedCanvas) {
            // Console log removed
            return;
        }
        // Console log removed
        const formatsToExport = ['png', 'jpg', 'pdf', 'svg'];
        let completed = 0;
        for (const formatId of formatsToExport) {
            try {
                const format = exportFormats.find(f => f.id === formatId);
                if (!format)
                    continue;
                const exportCanvas = prepareExportCanvas(format);
                if (!exportCanvas)
                    continue;
                let dataURL;
                switch (formatId) {
                    case 'png':
                        dataURL = await exportToPNG(exportCanvas, format.settings);
                        break;
                    case 'jpg':
                        dataURL = await exportToJPEG(exportCanvas, format.settings);
                        break;
                    case 'pdf':
                        dataURL = await exportToPDF(exportCanvas, format.settings);
                        break;
                    case 'svg':
                        dataURL = await exportToSVG(exportCanvas, format.settings);
                        break;
                    default:
                        continue;
                }
                // Download file
                const link = document.createElement('a');
                link.download = `design-export-${formatId}-${Date.now()}${format.extension}`;
                link.href = dataURL;
                link.click();
                completed++;
                // Console log removed
            }
            catch (error) {
                console.error('🖨️ PrintReadyExport: Batch export error for format', formatId, error);
            }
        }
        // Console log removed
    }, [composedCanvas, exportFormats, prepareExportCanvas, exportToPNG, exportToJPEG, exportToPDF, exportToSVG]);
    // Update print specs
    const updatePrintSpecs = useCallback((newSpecs) => {
        // Console log removed
        setPrintSpecs(prev => ({ ...prev, ...newSpecs }));
    }, []);
    if (!active) {
        // Console log removed
        return null;
    }
    console.log('🖨️ PrintReadyExport: Rendering component', {
        selectedFormat,
        exportPreset,
        isExporting,
        exportHistoryCount: exportHistory.length
    });
    return (_jsxs("div", { className: "print-ready-export", style: {
            border: '2px solid #F59E0B',
            borderRadius: '8px',
            padding: '12px',
            background: 'rgba(245, 158, 11, 0.1)',
            boxShadow: '0 0 10px rgba(245, 158, 11, 0.3)',
            marginTop: '12px'
        }, children: [_jsxs("div", { className: "export-header", style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                }, children: [_jsx("h4", { style: { margin: 0, color: '#F59E0B', fontSize: '16px' }, children: "\uD83D\uDDA8\uFE0F Print-Ready Export" }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx("button", { className: "btn", onClick: performExport, disabled: isExporting, style: {
                                    background: isExporting ? '#6B7280' : '#F59E0B',
                                    color: 'white',
                                    fontSize: '12px',
                                    padding: '6px 12px'
                                }, children: isExporting ? 'Exporting...' : 'Export' }), _jsx("button", { className: "btn", onClick: performBatchExport, disabled: isExporting, style: {
                                    background: '#10B981',
                                    color: 'white',
                                    fontSize: '12px',
                                    padding: '6px 12px'
                                }, children: "Batch" }), _jsx("button", { className: "btn", onClick: () => useApp.getState().setTool('brush'), style: {
                                    background: '#6B7280',
                                    color: 'white',
                                    fontSize: '12px',
                                    padding: '6px 12px'
                                }, title: "Close Print Export", children: "\u2715 Close" })] })] }), isExporting && (_jsxs("div", { className: "export-progress", style: {
                    marginBottom: '12px',
                    padding: '8px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    borderRadius: '4px'
                }, children: [_jsxs("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '4px' }, children: ["Exporting... ", exportProgress, "%"] }), _jsx("div", { style: {
                            width: '100%',
                            height: '4px',
                            background: '#E5E7EB',
                            borderRadius: '2px',
                            overflow: 'hidden'
                        }, children: _jsx("div", { style: {
                                width: `${exportProgress}%`,
                                height: '100%',
                                background: '#F59E0B',
                                transition: 'width 0.3s ease'
                            } }) })] })), _jsxs("div", { className: "export-formats", style: {
                    marginBottom: '12px'
                }, children: [_jsx("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '8px' }, children: "Export Format" }), _jsx("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '8px'
                        }, children: exportFormats.map(format => (_jsxs("button", { className: `btn ${selectedFormat === format.id ? 'active' : ''}`, onClick: () => {
                                // Console log removed
                                setSelectedFormat(format.id);
                            }, style: {
                                fontSize: '10px',
                                padding: '8px 4px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px'
                            }, children: [_jsx("span", { style: { fontSize: '14px' }, children: format.extension }), _jsx("span", { children: format.name })] }, format.id))) })] }), _jsxs("div", { className: "export-presets", style: {
                    marginBottom: '12px'
                }, children: [_jsx("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '8px' }, children: "Export Presets" }), _jsx("select", { value: exportPreset, onChange: (e) => {
                            // Console log removed
                            setExportPreset(e.target.value);
                        }, style: {
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #F59E0B',
                            borderRadius: '4px',
                            fontSize: '12px'
                        }, children: exportPresets.map(preset => (_jsxs("option", { value: preset.id, children: [preset.name, " - ", preset.description] }, preset.id))) })] }), _jsxs("div", { className: "print-specs", style: {
                    marginBottom: '12px'
                }, children: [_jsx("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '8px' }, children: "Print Specifications" }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '12px'
                        }, children: [_jsxs("div", { children: [_jsxs("label", { style: { fontSize: '11px', color: '#F59E0B' }, children: ["Width (inches): ", printSpecs.width, "\""] }), _jsx("input", { type: "range", min: "1", max: "24", step: "0.5", value: printSpecs.width, onChange: (e) => updatePrintSpecs({ width: parseFloat(e.target.value) }), style: { width: '100%' } })] }), _jsxs("div", { children: [_jsxs("label", { style: { fontSize: '11px', color: '#F59E0B' }, children: ["Height (inches): ", printSpecs.height, "\""] }), _jsx("input", { type: "range", min: "1", max: "24", step: "0.5", value: printSpecs.height, onChange: (e) => updatePrintSpecs({ height: parseFloat(e.target.value) }), style: { width: '100%' } })] }), _jsxs("div", { children: [_jsxs("label", { style: { fontSize: '11px', color: '#F59E0B' }, children: ["Resolution: ", printSpecs.resolution, " DPI"] }), _jsx("input", { type: "range", min: "72", max: "600", step: "72", value: printSpecs.resolution, onChange: (e) => updatePrintSpecs({ resolution: parseInt(e.target.value) }), style: { width: '100%' } })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: '11px', color: '#F59E0B' }, children: "Color Mode" }), _jsxs("select", { value: printSpecs.colorMode, onChange: (e) => updatePrintSpecs({ colorMode: e.target.value }), style: { width: '100%', padding: '4px', border: '1px solid #F59E0B', borderRadius: '4px' }, children: [_jsx("option", { value: "RGB", children: "RGB" }), _jsx("option", { value: "CMYK", children: "CMYK" })] })] })] })] }), exportHistory.length > 0 && (_jsxs("div", { className: "export-history", style: {
                    marginBottom: '12px'
                }, children: [_jsx("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '8px' }, children: "Recent Exports" }), _jsx("div", { style: { maxHeight: '120px', overflowY: 'auto' }, children: exportHistory.map(record => (_jsxs("div", { style: {
                                padding: '6px',
                                marginBottom: '4px',
                                background: 'rgba(245, 158, 11, 0.1)',
                                borderRadius: '4px',
                                fontSize: '10px',
                                color: '#6B7280'
                            }, children: [_jsxs("div", { style: { fontWeight: 'bold', color: '#F59E0B' }, children: [record.format, " - ", record.preset] }), _jsxs("div", { children: [new Date(record.timestamp).toLocaleString(), " \u2022 ", Math.round(record.size / 1024), "KB"] })] }, record.id))) })] })), _jsx("div", { style: { fontSize: '12px', color: '#6B7280', textAlign: 'center' }, children: "Select format and preset, then click Export to download your design" })] }));
}
