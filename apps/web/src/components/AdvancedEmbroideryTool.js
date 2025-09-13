import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Advanced Embroidery Tool
 * 4K HD realistic embroidery tool with InkStitch integration
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../App';
import AdvancedEmbroideryEngine from '../embroidery/AdvancedEmbroideryEngine';
import InkStitchIntegration from '../embroidery/InkStitchIntegration';
import HDTextureSystem from '../embroidery/HDTextureSystem';
import RealisticLightingSystem from '../embroidery/RealisticLightingSystem';
import { performanceMonitor } from '../utils/PerformanceMonitor';
import { centralizedErrorHandler, ErrorCategory, ErrorSeverity } from '../utils/CentralizedErrorHandler';
const AdvancedEmbroideryTool = ({ onStitchAdd, onPatternComplete, quality = 'high', enableRealTimePreview = true, enableShadows = true, enableLighting = true }) => {
    const { selectedTool, setSelectedTool, layers, addLayer, updateLayer, canvasRef, composedCanvas, setComposedCanvas } = useApp();
    // Refs
    const canvasRef = useRef(null);
    const engineRef = useRef(null);
    const textureSystemRef = useRef(null);
    const lightingSystemRef = useRef(null);
    // State
    const [isInitialized, setIsInitialized] = useState(false);
    const [currentStitches, setCurrentStitches] = useState([]);
    const [selectedThread, setSelectedThread] = useState({
        type: 'cotton',
        color: '#ff0000',
        thickness: 0.5,
        twist: 0.5,
        sheen: 0.3,
        roughness: 0.7,
        metallic: false,
        glowIntensity: 0,
        variegationPattern: ''
    });
    const [selectedFabric, setSelectedFabric] = useState({
        type: 'cotton',
        color: '#ffffff',
        weave: 'plain',
        stretch: 0.1,
        thickness: 0.5,
        roughness: 0.5,
        normalMap: 'cotton_normal'
    });
    const [renderOptions, setRenderOptions] = useState({
        resolution: quality === 'ultra' ? 8192 : quality === 'high' ? 4096 : quality === 'medium' ? 2048 : 1024,
        quality,
        enableShadows,
        enableLighting,
        enableTextures: true,
        enableNormalMaps: true,
        enableAO: true,
        lodLevel: 0
    });
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPattern, setCurrentPattern] = useState([]);
    const [performanceMetrics, setPerformanceMetrics] = useState({
        fps: 0,
        memoryUsage: 0,
        renderTime: 0,
        stitchCount: 0
    });
    // Initialize systems
    useEffect(() => {
        initializeSystems();
        return () => cleanup();
    }, []);
    // Performance monitoring
    useEffect(() => {
        const unsubscribe = performanceMonitor.subscribe((metrics) => {
            setPerformanceMetrics(prev => ({
                ...prev,
                fps: metrics.fps,
                memoryUsage: metrics.memoryUsage,
                renderTime: metrics.renderTime,
                stitchCount: currentStitches.length
            }));
        });
        return unsubscribe;
    }, [currentStitches.length]);
    // Real-time preview
    useEffect(() => {
        if (enableRealTimePreview && isInitialized && currentStitches.length > 0) {
            renderPattern();
        }
    }, [currentStitches, enableRealTimePreview, isInitialized]);
    const initializeSystems = async () => {
        try {
            if (!canvasRef.current) {
                throw new Error('Canvas ref not available');
            }
            // Initialize embroidery engine
            const engine = new AdvancedEmbroideryEngine(canvasRef.current, renderOptions);
            await engine.initialize();
            engineRef.current = engine;
            // Initialize texture system
            const gl = canvasRef.current.getContext('webgl2');
            if (!gl) {
                throw new Error('WebGL2 not supported');
            }
            const textureSystem = new HDTextureSystem(gl);
            textureSystemRef.current = textureSystem;
            // Initialize lighting system
            const lightingSystem = new RealisticLightingSystem(gl);
            lightingSystemRef.current = lightingSystem;
            // Load default textures
            await loadDefaultTextures();
            setIsInitialized(true);
            console.log('🎨 Advanced Embroidery Tool initialized successfully');
        }
        catch (error) {
            centralizedErrorHandler.handleError(error, { component: 'AdvancedEmbroideryTool', function: 'initializeSystems' }, ErrorSeverity.HIGH, ErrorCategory.RENDERING);
        }
    };
    const cleanup = () => {
        if (engineRef.current) {
            engineRef.current.dispose();
        }
        if (textureSystemRef.current) {
            textureSystemRef.current.dispose();
        }
        if (lightingSystemRef.current) {
            lightingSystemRef.current.dispose();
        }
    };
    const loadDefaultTextures = async () => {
        if (!textureSystemRef.current)
            return;
        try {
            // Load thread textures
            const threadTypes = ['cotton', 'polyester', 'silk', 'metallic', 'glow', 'variegated'];
            for (const type of threadTypes) {
                const threadData = {
                    type,
                    color: selectedThread.color,
                    thickness: selectedThread.thickness,
                    twist: selectedThread.twist,
                    sheen: selectedThread.sheen,
                    roughness: selectedThread.roughness,
                    metallic: selectedThread.metallic,
                    glowIntensity: selectedThread.glowIntensity,
                    variegationPattern: selectedThread.variegationPattern,
                    resolution: renderOptions.resolution
                };
                await textureSystemRef.current.generateThreadTexture(threadData);
            }
            // Load fabric textures
            const fabricTypes = ['cotton', 'denim', 'silk', 'leather', 'canvas', 'knit'];
            for (const type of fabricTypes) {
                const fabricData = {
                    type,
                    color: selectedFabric.color,
                    weave: selectedFabric.weave,
                    stretch: selectedFabric.stretch,
                    thickness: selectedFabric.thickness,
                    roughness: selectedFabric.roughness,
                    resolution: renderOptions.resolution
                };
                await textureSystemRef.current.generateFabricTexture(fabricData);
            }
            // Load normal maps
            const materialTypes = ['cotton', 'polyester', 'silk', 'metallic'];
            for (const materialType of materialTypes) {
                const normalData = {
                    materialType,
                    height: 0.1,
                    strength: 1.0,
                    resolution: renderOptions.resolution
                };
                await textureSystemRef.current.generateNormalMap(normalData);
            }
        }
        catch (error) {
            centralizedErrorHandler.handleError(error, { component: 'AdvancedEmbroideryTool', function: 'loadDefaultTextures' }, ErrorSeverity.MEDIUM, ErrorCategory.RENDERING);
        }
    };
    const renderPattern = useCallback(async () => {
        if (!engineRef.current || !lightingSystemRef.current || currentStitches.length === 0) {
            return;
        }
        try {
            const startTime = performance.now();
            // Create rendering context
            const context = {
                gl: canvasRef.current.getContext('webgl2'),
                program: engineRef.current['program'],
                viewMatrix: new Float32Array(16),
                projectionMatrix: new Float32Array(16),
                modelMatrix: new Float32Array(16),
                lightPosition: new Float32Array([0, 0, 10]),
                lightColor: new Float32Array([1, 1, 1]),
                cameraPosition: new Float32Array([0, 0, 5]),
                time: Date.now() / 1000
            };
            // Set up matrices (simplified)
            context.viewMatrix.set([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
            context.projectionMatrix.set([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
            context.modelMatrix.set([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
            // Render the pattern
            engineRef.current.renderPattern(currentStitches, context);
            // Track performance
            const duration = performance.now() - startTime;
            performanceMonitor.trackMetric('pattern_render', duration, 'ms', 'rendering', 'AdvancedEmbroideryTool');
        }
        catch (error) {
            centralizedErrorHandler.handleError(error, { component: 'AdvancedEmbroideryTool', function: 'renderPattern' }, ErrorSeverity.MEDIUM, ErrorCategory.RENDERING);
        }
    }, [currentStitches, engineRef.current, lightingSystemRef.current]);
    const generateFillStitch = async (shape) => {
        try {
            const params = {
                thread: selectedThread,
                density: 1.0,
                angle: 0,
                offset: 0,
                underlay: true,
                underlayDensity: 2.0,
                underlayAngle: 90,
                expand: 0,
                inset: 0
            };
            const stitches = InkStitchIntegration.generateFillStitch(shape, params);
            setCurrentStitches(prev => [...prev, ...stitches]);
            if (onPatternComplete) {
                onPatternComplete(stitches);
            }
        }
        catch (error) {
            centralizedErrorHandler.handleError(error, { component: 'AdvancedEmbroideryTool', function: 'generateFillStitch' }, ErrorSeverity.MEDIUM, ErrorCategory.EMBROIDERY);
        }
    };
    const generateSatinStitch = async (rails, rungs) => {
        try {
            const params = {
                thread: selectedThread,
                density: 1.0,
                angle: 0,
                width: 2.0,
                underlay: true,
                underlayDensity: 2.0,
                underlayAngle: 90,
                rungSpacing: 1.0,
                zigzagSpacing: 0.5
            };
            const stitches = InkStitchIntegration.generateSatinColumn(rails, rungs, params);
            setCurrentStitches(prev => [...prev, ...stitches]);
            if (onPatternComplete) {
                onPatternComplete(stitches);
            }
        }
        catch (error) {
            centralizedErrorHandler.handleError(error, { component: 'AdvancedEmbroideryTool', function: 'generateSatinStitch' }, ErrorSeverity.MEDIUM, ErrorCategory.EMBROIDERY);
        }
    };
    const generateContourFill = async (shape) => {
        try {
            const params = {
                thread: selectedThread,
                density: 1.0,
                angle: 0,
                offset: 0,
                contourSpacing: 1.0,
                skipLast: false
            };
            const stitches = InkStitchIntegration.generateContourFill(shape, params);
            setCurrentStitches(prev => [...prev, ...stitches]);
            if (onPatternComplete) {
                onPatternComplete(stitches);
            }
        }
        catch (error) {
            centralizedErrorHandler.handleError(error, { component: 'AdvancedEmbroideryTool', function: 'generateContourFill' }, ErrorSeverity.MEDIUM, ErrorCategory.EMBROIDERY);
        }
    };
    const generateTartanFill = async (shape) => {
        try {
            const params = {
                thread: selectedThread,
                density: 1.0,
                angle: 0,
                offset: 0,
                tartanPattern: 'classic',
                stripeWidth: 2.0,
                stripeSpacing: 4.0
            };
            const stitches = InkStitchIntegration.generateTartanFill(shape, params);
            setCurrentStitches(prev => [...prev, ...stitches]);
            if (onPatternComplete) {
                onPatternComplete(stitches);
            }
        }
        catch (error) {
            centralizedErrorHandler.handleError(error, { component: 'AdvancedEmbroideryTool', function: 'generateTartanFill' }, ErrorSeverity.MEDIUM, ErrorCategory.EMBROIDERY);
        }
    };
    const optimizeStitches = () => {
        try {
            const optimized = InkStitchIntegration.optimizeStitchPlacement(currentStitches);
            setCurrentStitches(optimized);
            console.log(`🧵 Optimized ${optimized.length} stitches`);
        }
        catch (error) {
            centralizedErrorHandler.handleError(error, { component: 'AdvancedEmbroideryTool', function: 'optimizeStitches' }, ErrorSeverity.LOW, ErrorCategory.EMBROIDERY);
        }
    };
    const clearStitches = () => {
        setCurrentStitches([]);
        setCurrentPattern([]);
    };
    const exportPattern = () => {
        try {
            const patternData = {
                stitches: currentStitches,
                thread: selectedThread,
                fabric: selectedFabric,
                settings: renderOptions,
                timestamp: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(patternData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `embroidery_pattern_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
        catch (error) {
            centralizedErrorHandler.handleError(error, { component: 'AdvancedEmbroideryTool', function: 'exportPattern' }, ErrorSeverity.LOW, ErrorCategory.EMBROIDERY);
        }
    };
    if (!isInitialized) {
        return (_jsx("div", { className: "advanced-embroidery-tool", children: _jsxs("div", { className: "loading", children: [_jsx("div", { className: "spinner" }), _jsx("p", { children: "Initializing Advanced Embroidery Tool..." })] }) }));
    }
    return (_jsxs("div", { className: "advanced-embroidery-tool", children: [_jsxs("div", { className: "tool-header", children: [_jsx("h3", { children: "\uD83E\uDDF5 Advanced Embroidery Tool" }), _jsxs("div", { className: "performance-metrics", children: [_jsxs("span", { children: ["FPS: ", Math.round(performanceMetrics.fps)] }), _jsxs("span", { children: ["Memory: ", Math.round(performanceMetrics.memoryUsage), "MB"] }), _jsxs("span", { children: ["Stitches: ", performanceMetrics.stitchCount] })] })] }), _jsxs("div", { className: "tool-content", children: [_jsx("div", { className: "canvas-container", children: _jsx("canvas", { ref: canvasRef, width: 800, height: 600, style: { border: '1px solid #ccc', borderRadius: '8px' } }) }), _jsxs("div", { className: "controls", children: [_jsxs("div", { className: "control-group", children: [_jsx("label", { children: "Thread Type:" }), _jsxs("select", { value: selectedThread.type, onChange: (e) => setSelectedThread(prev => ({ ...prev, type: e.target.value })), children: [_jsx("option", { value: "cotton", children: "Cotton" }), _jsx("option", { value: "polyester", children: "Polyester" }), _jsx("option", { value: "silk", children: "Silk" }), _jsx("option", { value: "metallic", children: "Metallic" }), _jsx("option", { value: "glow", children: "Glow" }), _jsx("option", { value: "variegated", children: "Variegated" })] })] }), _jsxs("div", { className: "control-group", children: [_jsx("label", { children: "Thread Color:" }), _jsx("input", { type: "color", value: selectedThread.color, onChange: (e) => setSelectedThread(prev => ({ ...prev, color: e.target.value })) })] }), _jsxs("div", { className: "control-group", children: [_jsx("label", { children: "Thread Thickness:" }), _jsx("input", { type: "range", min: "0.1", max: "2.0", step: "0.1", value: selectedThread.thickness, onChange: (e) => setSelectedThread(prev => ({ ...prev, thickness: parseFloat(e.target.value) })) }), _jsxs("span", { children: [selectedThread.thickness, "mm"] })] }), _jsxs("div", { className: "control-group", children: [_jsx("label", { children: "Fabric Type:" }), _jsxs("select", { value: selectedFabric.type, onChange: (e) => setSelectedFabric(prev => ({ ...prev, type: e.target.value })), children: [_jsx("option", { value: "cotton", children: "Cotton" }), _jsx("option", { value: "denim", children: "Denim" }), _jsx("option", { value: "silk", children: "Silk" }), _jsx("option", { value: "leather", children: "Leather" }), _jsx("option", { value: "canvas", children: "Canvas" }), _jsx("option", { value: "knit", children: "Knit" })] })] }), _jsxs("div", { className: "control-group", children: [_jsx("label", { children: "Quality:" }), _jsxs("select", { value: quality, onChange: (e) => setRenderOptions(prev => ({ ...prev, quality: e.target.value })), children: [_jsx("option", { value: "low", children: "Low (1024px)" }), _jsx("option", { value: "medium", children: "Medium (2048px)" }), _jsx("option", { value: "high", children: "High (4096px)" }), _jsx("option", { value: "ultra", children: "Ultra (8192px)" })] })] })] }), _jsxs("div", { className: "stitch-buttons", children: [_jsx("button", { onClick: () => generateFillStitch({}), className: "stitch-btn", children: "Generate Fill Stitch" }), _jsx("button", { onClick: () => generateSatinStitch([], []), className: "stitch-btn", children: "Generate Satin Stitch" }), _jsx("button", { onClick: () => generateContourFill({}), className: "stitch-btn", children: "Generate Contour Fill" }), _jsx("button", { onClick: () => generateTartanFill({}), className: "stitch-btn", children: "Generate Tartan Fill" })] }), _jsxs("div", { className: "pattern-controls", children: [_jsx("button", { onClick: optimizeStitches, className: "control-btn", children: "Optimize Stitches" }), _jsx("button", { onClick: clearStitches, className: "control-btn", children: "Clear Pattern" }), _jsx("button", { onClick: exportPattern, className: "control-btn", children: "Export Pattern" })] }), _jsxs("div", { className: "advanced-settings", children: [_jsx("h4", { children: "Advanced Settings" }), _jsx("div", { className: "setting-group", children: _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: renderOptions.enableShadows, onChange: (e) => setRenderOptions(prev => ({ ...prev, enableShadows: e.target.checked })) }), "Enable Shadows"] }) }), _jsx("div", { className: "setting-group", children: _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: renderOptions.enableLighting, onChange: (e) => setRenderOptions(prev => ({ ...prev, enableLighting: e.target.checked })) }), "Enable Advanced Lighting"] }) }), _jsx("div", { className: "setting-group", children: _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: renderOptions.enableNormalMaps, onChange: (e) => setRenderOptions(prev => ({ ...prev, enableNormalMaps: e.target.checked })) }), "Enable Normal Maps"] }) }), _jsx("div", { className: "setting-group", children: _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: renderOptions.enableAO, onChange: (e) => setRenderOptions(prev => ({ ...prev, enableAO: e.target.checked })) }), "Enable Ambient Occlusion"] }) })] })] }), _jsx("style", { jsx: true, children: `
        .advanced-embroidery-tool {
          padding: 20px;
          background: #1a1a1a;
          color: white;
          border-radius: 12px;
          margin: 20px 0;
        }

        .tool-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #333;
        }

        .tool-header h3 {
          margin: 0;
          color: #ff6b6b;
        }

        .performance-metrics {
          display: flex;
          gap: 15px;
          font-size: 12px;
          color: #888;
        }

        .canvas-container {
          margin-bottom: 20px;
          text-align: center;
        }

        .controls {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .control-group label {
          font-size: 12px;
          color: #ccc;
          font-weight: 500;
        }

        .control-group input,
        .control-group select {
          padding: 8px;
          border: 1px solid #444;
          border-radius: 4px;
          background: #2a2a2a;
          color: white;
          font-size: 14px;
        }

        .control-group input[type="range"] {
          padding: 0;
        }

        .stitch-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 10px;
          margin-bottom: 20px;
        }

        .stitch-btn {
          padding: 12px 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .stitch-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .pattern-controls {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .control-btn {
          padding: 10px 16px;
          background: #444;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .control-btn:hover {
          background: #555;
          transform: translateY(-1px);
        }

        .advanced-settings {
          background: #2a2a2a;
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
        }

        .advanced-settings h4 {
          margin: 0 0 15px 0;
          color: #ff6b6b;
        }

        .setting-group {
          margin-bottom: 10px;
        }

        .setting-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
        }

        .setting-group input[type="checkbox"] {
          width: 16px;
          height: 16px;
        }

        .loading {
          text-align: center;
          padding: 40px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #333;
          border-top: 4px solid #ff6b6b;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      ` })] }));
};
export default AdvancedEmbroideryTool;
