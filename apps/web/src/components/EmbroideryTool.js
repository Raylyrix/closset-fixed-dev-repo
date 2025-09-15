import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../App';
import { embroideryAI } from '../services/embroideryService';
import { embroideryBackend } from '../services/embroideryBackendService';
// Import advanced embroidery systems
import { AdvancedEmbroideryEngine } from '../embroidery/AdvancedEmbroideryEngine';
import { InkStitchIntegration } from '../embroidery/InkStitchIntegration';
import { HDTextureSystem } from '../embroidery/HDTextureSystem';
import { RealisticLightingSystem } from '../embroidery/RealisticLightingSystem';
import { UltraRealisticSatinStitch } from '../embroidery/UltraRealisticSatinStitch';
import { UltraRealisticFillStitch } from '../embroidery/UltraRealisticFillStitch';
import { UltraRealisticCrossStitch } from '../embroidery/UltraRealisticCrossStitch';
import { UltraRealisticOutlineStitch } from '../embroidery/UltraRealisticOutlineStitch';
import { UltraRealisticChainStitch } from '../embroidery/UltraRealisticChainStitch';
import { UltraRealisticBackstitch } from '../embroidery/UltraRealisticBackstitch';
import { UltraRealisticFrenchKnot } from '../embroidery/UltraRealisticFrenchKnot';
import { UltraRealisticBullion } from '../embroidery/UltraRealisticBullion';
import { UltraRealisticLazyDaisy } from '../embroidery/UltraRealisticLazyDaisy';
import { UltraRealisticFeather } from '../embroidery/UltraRealisticFeather';
import { renderStitchType } from '../utils/SimpleStitchRenderer';
import EnhancedEmbroideryManager from '../utils/EnhancedEmbroideryManager';
import EnhancedStitchGenerator from '../utils/EnhancedStitchGenerator';
import { enhancedMemoryManager } from '../utils/EnhancedMemoryManager';
import { simpleErrorHandler } from '../utils/SimpleErrorHandler';
import { simplePerformanceMonitor } from '../utils/SimplePerformanceMonitor';
import TestRunner from './TestRunner';
// Removed non-existent imports to fix compilation errors
const EmbroideryTool = ({ active = true }) => {
    const { embroideryStitches, setEmbroideryStitches, embroideryPattern, setEmbroideryPattern, embroideryThreadType, setEmbroideryThreadType, embroideryThickness, setEmbroideryThickness, embroideryOpacity, setEmbroideryOpacity, embroideryColor, setEmbroideryColor, embroideryStitchType, setEmbroideryStitchType, embroideryPatternDescription, setEmbroideryPatternDescription, embroideryAIEnabled, setEmbroideryAIEnabled, composedCanvas } = useApp();
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentStitch, setCurrentStitch] = useState(null);
    const [showPatterns, setShowPatterns] = useState(false);
    const [generatedPatterns, setGeneratedPatterns] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [underlayType, setUnderlayType] = useState('center');
    const [threadPalette, setThreadPalette] = useState(['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']);
    const [showPatternLibrary, setShowPatternLibrary] = useState(false);
    const [selectedPattern, setSelectedPattern] = useState(null);
    const [stitchDirection, setStitchDirection] = useState('horizontal');
    const [stitchSpacing, setStitchSpacing] = useState(0.5);
    const [stitchDensity, setStitchDensity] = useState(1.0);
    const [performanceMode, setPerformanceMode] = useState(false);
    const [threadTexture, setThreadTexture] = useState('smooth');
    const [lightingDirection, setLightingDirection] = useState('top-left');
    const [fabricType, setFabricType] = useState('cotton');
    // Enhanced managers
    const [enhancedManager, setEnhancedManager] = useState(null);
    const [enhancedGenerator, setEnhancedGenerator] = useState(null);
    const [useEnhancedMode, setUseEnhancedMode] = useState(true);
    // AI System
    const [aiSystem, setAiSystem] = useState(null);
    const [aiPatterns, setAiPatterns] = useState([]);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [aiQualityAnalysis, setAiQualityAnalysis] = useState(null);
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [aiConfidence, setAiConfidence] = useState(0);
    // Quality Analysis
    const [qualityIssues, setQualityIssues] = useState([]);
    const [qualitySuggestions, setQualitySuggestions] = useState([]);
    const [qualitySummary, setQualitySummary] = useState({
        averageQuality: 0,
        totalIssues: 0,
        criticalIssues: 0,
        totalSuggestions: 0
    });
    // Intelligent Optimization
    const [optimizationSuggestions, setOptimizationSuggestions] = useState([]);
    const [appliedOptimizations, setAppliedOptimizations] = useState([]);
    const [patternAnalysis, setPatternAnalysis] = useState(null);
    const [isOptimizing, setIsOptimizing] = useState(false);
    // AI Style Transfer
    const [styleProfiles, setStyleProfiles] = useState([]);
    const [selectedStyle, setSelectedStyle] = useState('traditional_embroidery');
    const [styleIntensity, setStyleIntensity] = useState(0.7);
    const [isStyleTransferring, setIsStyleTransferring] = useState(false);
    const [styleTransferProgress, setStyleTransferProgress] = useState(0);
    const [styleTransferResults, setStyleTransferResults] = useState([]);
    // Microservices Architecture
    const [servicesStatus, setServicesStatus] = useState({});
    const [eventHistory, setEventHistory] = useState([]);
    const [pluginsStatus, setPluginsStatus] = useState({});
    const [apiGatewayStatus, setApiGatewayStatus] = useState({ status: 'unknown' });
    // Removed non-existent service references
    // Advanced Features
    const [wasmStatus, setWasmStatus] = useState({});
    const [threeDRenderer, setThreeDRenderer] = useState(null);
    const [physicsEngine, setPhysicsEngine] = useState(null);
    const [enable3D, setEnable3D] = useState(false);
    const [enablePhysics, setEnablePhysics] = useState(false);
    const [enableWASM, setEnableWASM] = useState(true);
    // Cloud Integration
    const [cloudStatus, setCloudStatus] = useState({});
    const [enableCloud, setEnableCloud] = useState(true);
    const [cloudPatterns, setCloudPatterns] = useState([]);
    const [cloudSyncStatus, setCloudSyncStatus] = useState({});
    // AR/VR
    const [arVrRenderer, setArVrRenderer] = useState(null);
    const [enableARVR, setEnableARVR] = useState(false);
    const [arVrSession, setArVrSession] = useState(null);
    // Machine Learning
    const [mlSystem, setMlSystem] = useState(null);
    const [enableML, setEnableML] = useState(true);
    const [mlPredictions, setMlPredictions] = useState([]);
    const [mlModels, setMlModels] = useState([]);
    // Security
    const [securityFramework, setSecurityFramework] = useState(null);
    const [enableSecurity, setEnableSecurity] = useState(true);
    const [securityThreats, setSecurityThreats] = useState([]);
    const [complianceReports, setComplianceReports] = useState([]);
    // Memory management and performance
    const [memoryStats, setMemoryStats] = useState({
        used: 0,
        total: 0,
        percentage: 0,
        isHealthy: true,
        cacheEntries: 0,
        cacheSize: 0
    });
    const [performanceStats, setPerformanceStats] = useState({
        renderTime: 0,
        stitchCount: 0,
        memoryUsage: 0,
        fps: 0,
        frameDrops: 0
    });
    const [errorCount, setErrorCount] = useState(0);
    const [lastError, setLastError] = useState(null);
    // Use global grid settings
    const { showGrid, gridSize, gridColor, gridOpacity, showRulers, rulerUnits, scale, showGuides, guideColor, snapToGrid, snapDistance, showMeasurements, measurementUnits } = useApp();
    // Backend integration state
    const [backendConnected, setBackendConnected] = useState(false);
    const [backendHealth, setBackendHealth] = useState(null);
    const [isExporting, setIsExporting] = useState(false);
    const [exportFormat, setExportFormat] = useState('dst');
    const [showExportOptions, setShowExportOptions] = useState(false);
    // Enhanced 4K HD embroidery features
    const [advancedStitchTypes, setAdvancedStitchTypes] = useState([
        'satin', 'fill', 'outline', 'cross-stitch', 'chain', 'backstitch',
        'french-knot', 'bullion', 'lazy-daisy', 'feather', 'couching', 'appliqué',
        'seed', 'stem', 'split', 'brick', 'long-short', 'fishbone', 'herringbone',
        'satin-ribbon', 'metallic', 'glow-thread', 'variegated', 'gradient',
        'running-stitch', 'back-stitch', 'blanket-stitch', 'feather-stitch', 'herringbone-stitch'
    ]);
    // Advanced rendering settings
    const [renderQuality, setRenderQuality] = useState('high');
    const [enable4K, setEnable4K] = useState(true);
    const [enableWebGL, setEnableWebGL] = useState(true);
    const [enablePBR, setEnablePBR] = useState(true);
    const [enableShadows, setEnableShadows] = useState(true);
    const [enableLighting, setEnableLighting] = useState(true);
    const [enableAdvancedStitches, setEnableAdvancedStitches] = useState(true);
    const [enableRealTimePreview, setEnableRealTimePreview] = useState(true);
    const [enableMemoryOptimization, setEnableMemoryOptimization] = useState(true);
    const [enableGPUAcceleration, setEnableGPUAcceleration] = useState(true);
    // Advanced stitch generation settings
    const [stitchOptimization, setStitchOptimization] = useState(true);
    const [jumpStitchMinimization, setJumpStitchMinimization] = useState(true);
    const [realTimePatternGeneration, setRealTimePatternGeneration] = useState(true);
    // Advanced material settings
    const [threadMaterial, setThreadMaterial] = useState('cotton');
    const [fabricWeave, setFabricWeave] = useState('plain');
    const [enableNormalMapping, setEnableNormalMapping] = useState(true);
    const [enableAnisotropicFiltering, setEnableAnisotropicFiltering] = useState(true);
    // Advanced lighting settings
    const [ambientLightIntensity, setAmbientLightIntensity] = useState(0.4);
    const [directionalLightIntensity, setDirectionalLightIntensity] = useState(0.8);
    const [enableGlobalIllumination, setEnableGlobalIllumination] = useState(true);
    const [enableAmbientOcclusion, setEnableAmbientOcclusion] = useState(true);
    const [enableToneMapping, setEnableToneMapping] = useState(true);
    const [gammaCorrection, setGammaCorrection] = useState(2.2);
    const [selectedAdvancedStitch, setSelectedAdvancedStitch] = useState('french-knot');
    const [threadLibrary, setThreadLibrary] = useState({
        metallic: ['#FFD700', '#C0C0C0', '#CD7F32', '#B87333', '#E6E6FA'],
        variegated: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
        glow: ['#00FF00', '#FF00FF', '#00FFFF', '#FFFF00', '#FF4500'],
        specialty: ['#8B4513', '#2F4F4F', '#800080', '#FF1493', '#00CED1']
    });
    const [selectedThreadCategory, setSelectedThreadCategory] = useState('metallic');
    const [aiDesignMode, setAiDesignMode] = useState(false);
    const [smartSuggestions, setSmartSuggestions] = useState([]);
    const [fabricPhysics, setFabricPhysics] = useState({
        tension: 0.5,
        stretch: 0.3,
        drape: 0.7,
        thickness: 0.2
    });
    const [realTimeCollaboration, setRealTimeCollaboration] = useState(false);
    const [collaborators, setCollaborators] = useState([]);
    const [arVrMode, setArVrMode] = useState(false);
    const [mlOptimization, setMlOptimization] = useState(false);
    const [stitchComplexity, setStitchComplexity] = useState('beginner');
    // Ultra-realistic stitch state variables
    const [fillMaterial, setFillMaterial] = useState({
        threadType: 'cotton',
        sheen: 0.3,
        roughness: 0.4,
        metallic: false,
        glowIntensity: 0.0,
        variegationPattern: 'none',
        threadTwist: 0.5,
        threadThickness: 0.2,
        color: '#FF69B4',
        threadCount: 1
    });
    const [fillLighting, setFillLighting] = useState({
        ambientIntensity: 0.4,
        directionalIntensity: 0.8,
        lightDirection: { x: 0.5, y: 0.5, z: 1.0 },
        shadowSoftness: 0.5,
        highlightIntensity: 0.6,
        rimLighting: true,
        rimIntensity: 0.3,
        fillHighlighting: true,
        fillIntensity: 0.4
    });
    const [fill3DProperties, setFill3DProperties] = useState({
        height: 0.3,
        padding: 0.1,
        compression: 0.2,
        tension: 0.5,
        stitchDensity: 2.0,
        underlayType: 'center',
        underlayDensity: 1.5,
        stitchOverlap: 0.1,
        stitchVariation: 0.05,
        curveSmoothing: 0.8,
        fillDensity: 0.7,
        fillAngle: 45,
        fillSpacing: 0.3
    });
    const [crossStitchMaterial, setCrossStitchMaterial] = useState({
        threadType: 'cotton',
        sheen: 0.2,
        roughness: 0.3,
        metallic: false,
        glowIntensity: 0.0,
        variegationPattern: 'none',
        threadTwist: 0.3,
        threadThickness: 0.15,
        color: '#FF69B4',
        threadCount: 1
    });
    const [crossStitchLighting, setCrossStitchLighting] = useState({
        ambientIntensity: 0.4,
        directionalIntensity: 0.8,
        lightDirection: { x: 0.5, y: 0.5, z: 1.0 },
        shadowSoftness: 0.5,
        highlightIntensity: 0.6,
        rimLighting: true,
        rimIntensity: 0.3,
        crossHighlighting: true,
        crossIntensity: 0.4
    });
    const [crossStitch3DProperties, setCrossStitch3DProperties] = useState({
        height: 0.2,
        padding: 0.05,
        compression: 0.1,
        tension: 0.4,
        stitchDensity: 3.0,
        underlayType: 'center',
        underlayDensity: 2.0,
        stitchOverlap: 0.0,
        stitchVariation: 0.02,
        curveSmoothing: 0.9,
        crossSize: 0.5,
        crossAngle: 0,
        crossSpacing: 0.4
    });
    const [outlineMaterial, setOutlineMaterial] = useState({
        threadType: 'cotton',
        sheen: 0.4,
        roughness: 0.3,
        metallic: false,
        glowIntensity: 0.0,
        variegationPattern: 'none',
        threadTwist: 0.4,
        threadThickness: 0.18,
        color: '#FF69B4',
        threadCount: 1
    });
    const [outlineLighting, setOutlineLighting] = useState({
        ambientIntensity: 0.4,
        directionalIntensity: 0.8,
        lightDirection: { x: 0.5, y: 0.5, z: 1.0 },
        shadowSoftness: 0.5,
        highlightIntensity: 0.6,
        rimLighting: true,
        rimIntensity: 0.3,
        edgeHighlighting: true,
        edgeIntensity: 0.4
    });
    const [outline3DProperties, setOutline3DProperties] = useState({
        height: 0.25,
        padding: 0.08,
        compression: 0.15,
        tension: 0.45,
        stitchDensity: 2.5,
        underlayType: 'center',
        underlayDensity: 1.8,
        stitchOverlap: 0.05,
        stitchVariation: 0.03,
        curveSmoothing: 0.85,
        edgeSharpness: 0.8
    });
    const [chainMaterial, setChainMaterial] = useState({
        threadType: 'cotton',
        sheen: 0.5,
        roughness: 0.2,
        metallic: false,
        glowIntensity: 0.0,
        variegationPattern: 'none',
        threadTwist: 0.6,
        threadThickness: 0.22,
        color: '#FF69B4',
        threadCount: 1
    });
    const [chainLighting, setChainLighting] = useState({
        ambientIntensity: 0.4,
        directionalIntensity: 0.8,
        lightDirection: { x: 0.5, y: 0.5, z: 1.0 },
        shadowSoftness: 0.5,
        highlightIntensity: 0.6,
        rimLighting: true,
        rimIntensity: 0.3,
        loopHighlighting: true,
        loopIntensity: 0.4
    });
    const [chain3DProperties, setChain3DProperties] = useState({
        height: 0.35,
        padding: 0.12,
        compression: 0.25,
        tension: 0.55,
        stitchDensity: 2.2,
        underlayType: 'center',
        underlayDensity: 1.6,
        stitchOverlap: 0.08,
        stitchVariation: 0.04,
        curveSmoothing: 0.75,
        loopSize: 0.6,
        loopTightness: 0.7
    });
    const [designLayers, setDesignLayers] = useState([]);
    const [currentLayer, setCurrentLayer] = useState(0);
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    // Advanced embroidery system refs
    const advancedEngineRef = useRef(null);
    const inkStitchRef = useRef(null);
    const textureSystemRef = useRef(null);
    const lightingSystemRef = useRef(null);
    const ultraRealisticSatinRef = useRef(null);
    // Performance optimization refs
    const debounceTimeoutRef = useRef(null);
    const lastRenderTimeRef = useRef(0);
    const frameRequestRef = useRef(null);
    const performanceModeRef = useRef(false);
    // Ultra-realistic satin stitch state
    const [satinMaterial, setSatinMaterial] = useState({
        threadType: 'silk',
        sheen: 0.8,
        roughness: 0.2,
        metallic: false,
        glowIntensity: 0.0,
        variegationPattern: 'none',
        threadTwist: 2.0,
        threadThickness: 0.3
    });
    const [satinLighting, setSatinLighting] = useState({
        ambientIntensity: 0.3,
        directionalIntensity: 0.7,
        lightDirection: { x: 0.5, y: 0.5, z: 1.0 },
        shadowSoftness: 0.5,
        highlightIntensity: 1.0
    });
    const [satin3DProperties, setSatin3DProperties] = useState({
        height: 0.5,
        padding: 0.2,
        compression: 0.1,
        tension: 1.0,
        stitchDensity: 8.0,
        zigzagAmplitude: 0.3,
        zigzagFrequency: 2.0
    });
    // Backstitch state
    const [backstitchMaterial, setBackstitchMaterial] = useState({
        threadType: 'cotton',
        sheen: 0.3,
        roughness: 0.4,
        metallic: false,
        glowIntensity: 0,
        variegationPattern: '',
        threadTwist: 2.5,
        threadThickness: 0.2,
        color: '#FF69B4',
        threadCount: 2
    });
    const [backstitchLighting, setBackstitchLighting] = useState({
        ambientIntensity: 0.4,
        directionalIntensity: 0.6,
        lightDirection: { x: 0.5, y: 0.5, z: 1 },
        shadowSoftness: 0.5,
        highlightIntensity: 0.8,
        rimLighting: true,
        rimIntensity: 0.3,
        stitchHighlighting: true,
        stitchIntensity: 0.4
    });
    const [backstitch3DProperties, setBackstitch3DProperties] = useState({
        height: 0.4,
        padding: 0.15,
        compression: 0.25,
        tension: 0.6,
        stitchDensity: 6,
        underlayType: 'contour',
        underlayDensity: 3,
        stitchOverlap: 0.2,
        stitchVariation: 0.05,
        curveSmoothing: 0.7,
        backstitchLength: 0.5,
        backstitchSpacing: 0.3,
        backstitchAngle: 30,
        backstitchTightness: 0.8,
        backstitchTexture: 0.6
    });
    // French Knot state
    const [frenchKnotMaterial, setFrenchKnotMaterial] = useState({
        threadType: 'cotton',
        sheen: 0.4,
        roughness: 0.3,
        metallic: false,
        glowIntensity: 0,
        variegationPattern: '',
        threadTwist: 3.0,
        threadThickness: 0.25,
        color: '#FF69B4',
        threadCount: 3
    });
    const [frenchKnotLighting, setFrenchKnotLighting] = useState({
        ambientIntensity: 0.3,
        directionalIntensity: 0.7,
        lightDirection: { x: 0.3, y: 0.3, z: 1 },
        shadowSoftness: 0.6,
        highlightIntensity: 0.9,
        rimLighting: true,
        rimIntensity: 0.4,
        knotHighlighting: true,
        knotIntensity: 0.5
    });
    const [frenchKnot3DProperties, setFrenchKnot3DProperties] = useState({
        height: 0.8,
        padding: 0.3,
        compression: 0.4,
        tension: 0.8,
        stitchDensity: 10,
        underlayType: 'center',
        underlayDensity: 5,
        stitchOverlap: 0.4,
        stitchVariation: 0.08,
        curveSmoothing: 0.9,
        knotSize: 0.7,
        knotTightness: 0.8,
        knotWraps: 4,
        knotTexture: 0.9
    });
    // Bullion state
    const [bullionMaterial, setBullionMaterial] = useState({
        threadType: 'cotton',
        sheen: 0.5,
        roughness: 0.2,
        metallic: false,
        glowIntensity: 0,
        variegationPattern: '',
        threadTwist: 2.8,
        threadThickness: 0.3,
        color: '#FF69B4',
        threadCount: 4
    });
    const [bullionLighting, setBullionLighting] = useState({
        ambientIntensity: 0.35,
        directionalIntensity: 0.65,
        lightDirection: { x: 0.4, y: 0.4, z: 1 },
        shadowSoftness: 0.7,
        highlightIntensity: 0.85,
        rimLighting: true,
        rimIntensity: 0.35,
        stitchHighlighting: true,
        stitchIntensity: 0.45
    });
    const [bullion3DProperties, setBullion3DProperties] = useState({
        height: 1.0,
        padding: 0.4,
        compression: 0.5,
        tension: 0.9,
        stitchDensity: 12,
        underlayType: 'center',
        underlayDensity: 6,
        stitchOverlap: 0.5,
        stitchVariation: 0.1,
        curveSmoothing: 0.95,
        bullionLength: 0.8,
        bullionSpacing: 0.2,
        bullionWraps: 6,
        bullionTightness: 0.9
    });
    // Lazy Daisy state
    const [lazyDaisyMaterial, setLazyDaisyMaterial] = useState({
        threadType: 'cotton',
        sheen: 0.35,
        roughness: 0.35,
        metallic: false,
        glowIntensity: 0,
        variegationPattern: '',
        threadTwist: 2.2,
        threadThickness: 0.22,
        color: '#FF69B4',
        threadCount: 2
    });
    const [lazyDaisyLighting, setLazyDaisyLighting] = useState({
        ambientIntensity: 0.45,
        directionalIntensity: 0.55,
        lightDirection: { x: 0.6, y: 0.6, z: 1 },
        shadowSoftness: 0.4,
        highlightIntensity: 0.75,
        rimLighting: true,
        rimIntensity: 0.25,
        petalHighlighting: true,
        petalIntensity: 0.3
    });
    const [lazyDaisy3DProperties, setLazyDaisy3DProperties] = useState({
        height: 0.6,
        padding: 0.25,
        compression: 0.3,
        tension: 0.65,
        stitchDensity: 7,
        underlayType: 'center',
        underlayDensity: 4,
        stitchOverlap: 0.25,
        stitchVariation: 0.06,
        curveSmoothing: 0.8,
        petalSize: 0.8,
        petalCurve: 0.7,
        petalThickness: 0.6,
        petalCount: 5,
        centerSize: 0.3
    });
    // Feather state
    const [featherMaterial, setFeatherMaterial] = useState({
        threadType: 'cotton',
        sheen: 0.4,
        roughness: 0.3,
        metallic: false,
        glowIntensity: 0,
        variegationPattern: '',
        threadTwist: 2.0,
        threadThickness: 0.18,
        color: '#FF69B4',
        threadCount: 2
    });
    const [featherLighting, setFeatherLighting] = useState({
        ambientIntensity: 0.4,
        directionalIntensity: 0.6,
        lightDirection: { x: 0.5, y: 0.5, z: 1 },
        shadowSoftness: 0.5,
        highlightIntensity: 0.8,
        rimLighting: true,
        rimIntensity: 0.3,
        stitchHighlighting: true,
        stitchIntensity: 0.4
    });
    const [feather3DProperties, setFeather3DProperties] = useState({
        height: 0.5,
        padding: 0.2,
        compression: 0.25,
        tension: 0.6,
        stitchDensity: 5,
        underlayType: 'contour',
        underlayDensity: 3,
        stitchOverlap: 0.2,
        stitchVariation: 0.05,
        curveSmoothing: 0.7,
        featherLength: 0.6,
        featherSpacing: 0.4,
        featherAngle: 45,
        featherCurve: 0.6
    });
    // Predefined embroidery patterns
    const embroideryPatterns = [
        { id: 'flower', name: 'Flower', type: 'satin', points: [] },
        { id: 'heart', name: 'Heart', type: 'fill', points: [] },
        { id: 'star', name: 'Star', type: 'cross-stitch', points: [] },
        { id: 'leaf', name: 'Leaf', type: 'chain', points: [] },
        { id: 'circle', name: 'Circle', type: 'outline', points: [] },
        { id: 'zigzag', name: 'Zigzag', type: 'backstitch', points: [] }
    ];
    if (!active) {
        return null;
    }
    // Performance optimization utilities
    const debounce = useCallback((func, delay) => {
        return (...args) => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
            debounceTimeoutRef.current = setTimeout(() => func(...args), delay);
        };
    }, []);
    const throttle = useCallback((func, limit) => {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }, []);
    // Performance monitoring
    const updatePerformanceStats = useCallback(() => {
        const now = performance.now();
        const renderTime = now - lastRenderTimeRef.current;
        lastRenderTimeRef.current = now;
        setPerformanceStats(prev => ({
            ...prev,
            renderTime: Math.round(renderTime * 100) / 100,
            stitchCount: embroideryStitches.length,
            memoryUsage: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 0
        }));
    }, [embroideryStitches.length]);
    // Auto-adjust quality based on performance
    const adjustQualityForPerformance = useCallback(() => {
        const stats = performanceStats;
        if (stats.renderTime > 16.67) { // More than 60fps
            if (renderQuality !== 'low') {
                console.log('🔧 Performance: Reducing quality for better performance');
                setRenderQuality('low');
                setEnable4K(false);
                setEnablePBR(false);
                setEnableShadows(false);
                performanceModeRef.current = true;
            }
        }
        else if (stats.renderTime < 8 && performanceModeRef.current) {
            console.log('🔧 Performance: Increasing quality - performance is good');
            setRenderQuality('high');
            setEnable4K(true);
            setEnablePBR(true);
            setEnableShadows(true);
            performanceModeRef.current = false;
        }
    }, [performanceStats, renderQuality]);
    // Initialize advanced embroidery systems with performance optimization
    useEffect(() => {
        console.log('🚀 Initializing Advanced Embroidery Systems...');
        initializeAdvancedSystems();
    }, [renderQuality, enable4K, enableWebGL, enablePBR, enableShadows, enableLighting]);
    // Initialize enhanced managers with memory management and AI
    useEffect(() => {
        const initializeAll = async () => {
            if (composedCanvas) {
                try {
                    const manager = new EnhancedEmbroideryManager(composedCanvas);
                    const generator = new EnhancedStitchGenerator(true); // Enable AI
                    // Removed non-existent AI system
                    setEnhancedManager(manager);
                    setEnhancedGenerator(generator);
                    setAiSystem(ai);
                    // Set performance mode
                    manager.setPerformanceMode(performanceMode);
                    // Initialize memory management
                    enhancedMemoryManager.setMaxCacheSize(50 * 1024 * 1024); // 50MB
                    enhancedMemoryManager.setMaxCacheEntries(1000);
                    enhancedMemoryManager.setCacheTTL(5 * 60 * 1000); // 5 minutes
                    // Initialize style profiles
                    // Removed non-existent style transfer
                    // Removed non-existent service initializations
                    console.log('🚀 Enhanced Embroidery Managers and AI System initialized');
                }
                catch (error) {
                    simpleErrorHandler.handleError(error, 'EmbroideryTool', 'CRITICAL');
                    setLastError('Failed to initialize enhanced managers and AI system');
                    setErrorCount(prev => prev + 1);
                }
            }
        };
        initializeAll();
    }, [composedCanvas, performanceMode]);
    // Memory monitoring
    useEffect(() => {
        const monitorMemory = () => {
            try {
                const stats = enhancedMemoryManager.getMemoryStats();
                setMemoryStats(stats);
                // Check if memory usage is too high
                if (stats.percentage > 80) {
                    console.warn('⚠️ High memory usage detected:', stats.percentage + '%');
                    // Trigger cleanup
                    enhancedMemoryManager.clearExpiredEntries();
                }
            }
            catch (error) {
                simpleErrorHandler.handleError(error, 'EmbroideryTool', 'MEDIUM');
            }
        };
        // Monitor memory every 5 seconds
        const interval = setInterval(monitorMemory, 5000);
        monitorMemory(); // Initial check
        return () => clearInterval(interval);
    }, []);
    // Performance monitoring with alerts
    useEffect(() => {
        let lastTime = performance.now();
        let frameCount = 0;
        let frameDrops = 0;
        const monitorPerformance = () => {
            const currentTime = performance.now();
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;
            frameCount++;
            const fps = 1000 / deltaTime;
            // Count frame drops (FPS < 30)
            if (fps < 30) {
                frameDrops++;
            }
            // Update performance monitor
            simplePerformanceMonitor.updateStitchCount(embroideryStitches.length);
            simplePerformanceMonitor.updateRenderTime(deltaTime);
            setPerformanceStats(prev => ({
                ...prev,
                fps: Math.round(fps),
                frameDrops,
                stitchCount: embroideryStitches.length,
                memoryUsage: memoryStats.used
            }));
            // Reset frame drops counter every second
            if (frameCount % 60 === 0) {
                frameDrops = 0;
            }
        };
        const interval = setInterval(monitorPerformance, 16); // ~60 FPS
        return () => clearInterval(interval);
    }, [embroideryStitches.length, memoryStats.used]);
    // Performance alert handling
    useEffect(() => {
        const unsubscribe = simplePerformanceMonitor.onAlert((alert) => {
            console.warn(`🚨 Performance Alert: ${alert.message}`);
            setLastError(`Performance: ${alert.message}`);
            setErrorCount(prev => prev + 1);
        });
        return unsubscribe;
    }, []);
    // Removed non-existent quality analyzer monitoring
    // Removed non-existent optimization monitoring
    // Removed non-existent style transfer monitoring
    // Removed non-existent microservices monitoring
    // Removed non-existent microservices initialization
    // Removed non-existent event subscriptions
    // Removed non-existent advanced features initialization
    // Removed non-existent advanced features monitoring
    // Removed non-existent cloud integration
    // Removed non-existent AR/VR initialization
    const initializeARVR = async () => {
        try {
            console.log('🥽 Initializing AR/VR...');
            if (enableARVR && composedCanvas) {
                const renderer = new ARVRRenderer({
                    mode: 'ar',
                    device: 'mobile',
                    tracking: 'hand',
                    quality: 'high',
                    enableHaptics: true,
                    enableSpatialAudio: true,
                    enableHandTracking: true,
                    enableEyeTracking: false
                });
                await renderer.initialize(composedCanvas);
                setArVrRenderer(renderer);
                // Set up AR/VR event listeners
                renderer.on('sessionStarted', (session) => {
                    setArVrSession(session);
                    console.log('🥽 AR/VR session started:', session);
                });
                renderer.on('sessionEnded', (session) => {
                    setArVrSession(null);
                    console.log('🥽 AR/VR session ended:', session);
                });
                renderer.on('interaction', (interaction) => {
                    console.log('🥽 AR/VR interaction:', interaction);
                });
            }
            console.log('✅ AR/VR initialized');
        }
        catch (error) {
            console.error('❌ Failed to initialize AR/VR:', error);
            throw error;
        }
    };
    // Initialize machine learning
    const initializeMachineLearning = async () => {
        try {
            console.log('🤖 Initializing machine learning...');
            if (enableML) {
                await advancedMLSystem.initialize();
                setMlSystem(advancedMLSystem);
                setMlModels(advancedMLSystem.getAllModels());
                // Set up ML event listeners
                advancedMLSystem.on('prediction', (prediction) => {
                    setMlPredictions(prev => [...prev, prediction]);
                    console.log('🤖 ML prediction:', prediction);
                });
                advancedMLSystem.on('trainingCompleted', (session) => {
                    console.log('🤖 ML training completed:', session);
                });
            }
            console.log('✅ Machine learning initialized');
        }
        catch (error) {
            console.error('❌ Failed to initialize machine learning:', error);
            throw error;
        }
    };
    // Initialize security framework
    const initializeSecurityFramework = async () => {
        try {
            console.log('🔒 Initializing security framework...');
            if (enableSecurity) {
                await enterpriseSecurityFramework.initialize();
                setSecurityFramework(enterpriseSecurityFramework);
                // Set up security event listeners
                enterpriseSecurityFramework.on('threatDetected', (threat) => {
                    setSecurityThreats(prev => [...prev, threat]);
                    console.log('🚨 Security threat detected:', threat);
                });
                enterpriseSecurityFramework.on('complianceReport', (report) => {
                    setComplianceReports(prev => [...prev, report]);
                    console.log('📋 Compliance report generated:', report);
                });
                enterpriseSecurityFramework.on('auditLog', (log) => {
                    console.log('📊 Security audit log:', log);
                });
            }
            console.log('✅ Security framework initialized');
        }
        catch (error) {
            console.error('❌ Failed to initialize security framework:', error);
            throw error;
        }
    };
    // Analyze pattern for optimization
    const analyzePatternForOptimization = async () => {
        try {
            const analysis = await intelligentOptimizer.analyzePattern(embroideryStitches);
            setPatternAnalysis(analysis);
            setOptimizationSuggestions(analysis.suggestions);
            console.log(`📊 Pattern analysis completed. Score: ${analysis.score}/100`);
        }
        catch (error) {
            console.error('Error analyzing pattern for optimization:', error);
        }
    };
    // Apply optimization suggestion
    const applyOptimization = async (suggestionId) => {
        setIsOptimizing(true);
        try {
            const result = await intelligentOptimizer.applyOptimization(suggestionId);
            if (result.success) {
                console.log(`✅ Optimization applied successfully: ${result.suggestion.title}`);
                // Refresh pattern analysis
                await analyzePatternForOptimization();
            }
            else {
                console.error(`❌ Optimization failed: ${result.error}`);
                setLastError(`Optimization failed: ${result.error}`);
                setErrorCount(prev => prev + 1);
            }
        }
        catch (error) {
            console.error('Error applying optimization:', error);
            setLastError(`Optimization error: ${error.message}`);
            setErrorCount(prev => prev + 1);
        }
        finally {
            setIsOptimizing(false);
        }
    };
    // Apply style transfer
    const applyStyleTransfer = async () => {
        if (embroideryStitches.length === 0) {
            console.warn('No stitches to apply style transfer to');
            return;
        }
        setIsStyleTransferring(true);
        setStyleTransferProgress(0);
        try {
            const request = {
                sourcePattern: {
                    stitches: embroideryStitches,
                    metadata: {
                        originalStyle: 'default',
                        createdAt: Date.now()
                    }
                },
                targetStyle: selectedStyle,
                intensity: styleIntensity,
                preserveElements: ['structure'], // Preserve basic structure
                enhanceElements: ['colors', 'texture'],
                constraints: {
                    maxColors: 8,
                    maxStitches: 1000,
                    complexity: stitchDensity > 1.5 ? 'high' : stitchDensity > 1.0 ? 'medium' : 'low'
                }
            };
            const result = await aiStyleTransfer.applyStyleTransfer(request);
            if (result.transformedPattern && result.transformedPattern.stitches) {
                // Convert transformed pattern back to embroidery stitches
                const transformedStitches = convertAIPatternsToStitches(result.transformedPattern);
                setEmbroideryStitches(transformedStitches);
                setStyleTransferResults(prev => [...prev, result]);
                console.log(`✅ Style transfer completed: ${result.styleProfile.name}`);
                console.log(`🎯 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
                // Redraw with new style
                drawStitches();
            }
        }
        catch (error) {
            console.error('Style transfer failed:', error);
            setLastError(`Style transfer failed: ${error.message}`);
            setErrorCount(prev => prev + 1);
        }
        finally {
            setIsStyleTransferring(false);
            setStyleTransferProgress(0);
        }
    };
    // Global error handling
    useEffect(() => {
        const handleGlobalError = (event) => {
            simpleErrorHandler.handleError(new Error(event.message), 'Global', 'CRITICAL');
            setLastError(`Global Error: ${event.message}`);
            setErrorCount(prev => prev + 1);
        };
        const handleUnhandledRejection = (event) => {
            simpleErrorHandler.handleError(new Error(event.reason), 'Global', 'HIGH');
            setLastError(`Unhandled Promise: ${event.reason}`);
            setErrorCount(prev => prev + 1);
        };
        window.addEventListener('error', handleGlobalError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);
        return () => {
            window.removeEventListener('error', handleGlobalError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, []);
    // Error boundary for rendering errors
    const handleRenderError = useCallback((error, errorInfo) => {
        simpleErrorHandler.handleError(error, 'EmbroideryTool', 'HIGH');
        setLastError(`Render Error: ${error.message}`);
        setErrorCount(prev => prev + 1);
    }, []);
    // Error recovery functions
    const recoverFromError = useCallback(() => {
        try {
            // Clear error state
            setLastError(null);
            setErrorCount(0);
            // Clear caches to free memory
            enhancedMemoryManager.clearAllCaches();
            // Redraw stitches
            drawStitches();
            console.log('✅ Error recovery completed');
        }
        catch (error) {
            console.error('❌ Error recovery failed:', error);
        }
    }, []);
    const resetToSafeState = useCallback(() => {
        try {
            // Clear all state
            setEmbroideryStitches([]);
            setCurrentStitch(null);
            setLastError(null);
            setErrorCount(0);
            // Clear caches
            enhancedMemoryManager.clearAllCaches();
            // Reset performance mode
            setPerformanceMode(false);
            console.log('✅ Reset to safe state completed');
        }
        catch (error) {
            console.error('❌ Reset to safe state failed:', error);
        }
    }, []);
    // User-friendly error messages
    const getErrorMessage = useCallback((error) => {
        if (error.includes('memory')) {
            return 'Memory usage is too high. Try reducing the number of stitches or enabling performance mode.';
        }
        if (error.includes('render')) {
            return 'Rendering failed. The canvas may need to be refreshed.';
        }
        if (error.includes('performance')) {
            return 'Performance is degraded. Try enabling performance mode or reducing complexity.';
        }
        if (error.includes('canvas')) {
            return 'Canvas error detected. Try refreshing the page.';
        }
        return error;
    }, []);
    // Initialize advanced embroidery systems
    const initializeAdvancedSystems = async () => {
        try {
            console.log('🚀 Initializing Advanced Embroidery Systems...');
            // Initialize Advanced Embroidery Engine
            if (enableWebGL) {
                // Create a temporary canvas for WebGL context
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = renderQuality === 'ultra' ? 8192 : renderQuality === 'high' ? 4096 : renderQuality === 'medium' ? 2048 : 1024;
                tempCanvas.height = renderQuality === 'ultra' ? 8192 : renderQuality === 'high' ? 4096 : renderQuality === 'medium' ? 2048 : 1024;
                advancedEngineRef.current = new AdvancedEmbroideryEngine(tempCanvas, {
                    resolution: renderQuality === 'ultra' ? 8192 : renderQuality === 'high' ? 4096 : renderQuality === 'medium' ? 2048 : 1024,
                    quality: renderQuality,
                    enableShadows,
                    enableLighting,
                    enableMemoryOptimization,
                    enableGPUAcceleration
                });
                await advancedEngineRef.current.initialize();
                console.log('✅ Advanced Embroidery Engine initialized');
            }
            // Initialize InkStitch Integration
            inkStitchRef.current = new InkStitchIntegration({
                enableOptimization: stitchOptimization,
                enableJumpStitchMinimization: jumpStitchMinimization,
                enableRealTimeGeneration: realTimePatternGeneration,
                stitchDensity
            });
            console.log('✅ InkStitch Integration initialized');
            // Initialize HD Texture System
            const webglContext = advancedEngineRef.current?.getWebGLContext();
            if (webglContext) {
                textureSystemRef.current = new HDTextureSystem(webglContext);
            }
            else {
                console.warn('⚠️ WebGL context not available, HD Texture System will use fallback mode');
                textureSystemRef.current = new HDTextureSystem(null);
            }
            console.log('✅ HD Texture System initialized');
            // Initialize Realistic Lighting System
            lightingSystemRef.current = new RealisticLightingSystem({
                ambientIntensity: ambientLightIntensity,
                directionalIntensity: directionalLightIntensity,
                enableGlobalIllumination,
                enableAmbientOcclusion,
                enableToneMapping,
                gammaCorrection
            });
            console.log('✅ Realistic Lighting System initialized');
            console.log('🎉 All Advanced Embroidery Systems initialized successfully!');
        }
        catch (error) {
            console.error('❌ Failed to initialize advanced systems:', error);
        }
    };
    // Optimized draw stitches with memory management and performance monitoring
    const drawStitches = useCallback(() => {
        // Cancel previous frame request
        if (frameRequestRef.current) {
            cancelAnimationFrame(frameRequestRef.current);
        }
        const startTime = performance.now();
        // Use requestAnimationFrame for smooth rendering
        frameRequestRef.current = requestAnimationFrame(() => {
            try {
                console.log('🎨 Drawing stitches on main canvas...');
                updatePerformanceStats();
                if (useEnhancedMode && enhancedManager) {
                    // Use enhanced manager for better performance and persistence
                    enhancedManager.redrawAll();
                    // Render current stitch being drawn with caching
                    if (currentStitch && currentStitch.points && currentStitch.points.length > 0) {
                        const ctx = composedCanvas?.getContext('2d');
                        if (ctx) {
                            const cacheKey = `current_stitch_${currentStitch.id}`;
                            const cached = enhancedMemoryManager.getStitchCache(cacheKey);
                            if (cached) {
                                ctx.putImageData(cached, 0, 0);
                            }
                            else {
                                renderStitch(ctx, currentStitch);
                                // Cache the rendered stitch
                                if (composedCanvas) {
                                    const imageData = ctx.getImageData(0, 0, composedCanvas.width, composedCanvas.height);
                                    enhancedMemoryManager.setStitchCache(cacheKey, imageData);
                                }
                            }
                        }
                    }
                }
                else {
                    // Fallback to original rendering with memory management
                    if (composedCanvas) {
                        const ctx = composedCanvas.getContext('2d');
                        if (ctx) {
                            // Clear canvas
                            ctx.clearRect(0, 0, composedCanvas.width, composedCanvas.height);
                            // Render all stitches with caching
                            embroideryStitches.forEach(stitch => {
                                if (stitch.points && stitch.points.length > 0) {
                                    const cacheKey = `stitch_${stitch.id}`;
                                    const cached = enhancedMemoryManager.getStitchCache(cacheKey);
                                    if (cached) {
                                        ctx.putImageData(cached, 0, 0);
                                    }
                                    else {
                                        renderStitch(ctx, stitch);
                                        // Cache the rendered stitch
                                        const imageData = ctx.getImageData(0, 0, composedCanvas.width, composedCanvas.height);
                                        enhancedMemoryManager.setStitchCache(cacheKey, imageData);
                                    }
                                }
                            });
                            // Render current stitch being drawn
                            if (currentStitch && currentStitch.points && currentStitch.points.length > 0) {
                                renderStitch(ctx, currentStitch);
                            }
                        }
                    }
                }
                // Update performance stats
                const renderTime = performance.now() - startTime;
                setPerformanceStats(prev => ({
                    ...prev,
                    renderTime: Math.round(renderTime * 100) / 100
                }));
            }
            catch (error) {
                simpleErrorHandler.handleError(error, 'EmbroideryTool', 'HIGH');
                setLastError('Rendering failed: ' + error.message);
                setErrorCount(prev => prev + 1);
            }
        });
    }, [updatePerformanceStats, composedCanvas, embroideryStitches, currentStitch, useEnhancedMode, enhancedManager]);
    // Render a single stitch
    const renderStitch = useCallback((ctx, stitch) => {
        if (!stitch.points || stitch.points.length === 0)
            return;
        const config = {
            type: stitch.type,
            color: stitch.color,
            thickness: stitch.thickness,
            opacity: stitch.opacity
        };
        try {
            renderStitchType(ctx, stitch.points, config);
        }
        catch (error) {
            console.error(`Error rendering ${stitch.type} stitch:`, error);
            // Fallback to basic line rendering
            ctx.save();
            ctx.strokeStyle = stitch.color;
            ctx.lineWidth = stitch.thickness;
            ctx.globalAlpha = stitch.opacity;
            ctx.beginPath();
            ctx.moveTo(stitch.points[0].x, stitch.points[0].y);
            for (let i = 1; i < stitch.points.length; i++) {
                ctx.lineTo(stitch.points[i].x, stitch.points[i].y);
            }
            ctx.stroke();
            ctx.restore();
        }
    }, []);
    // Debounced version of drawStitches for frequent updates
    const debouncedDrawStitches = useMemo(() => debounce(drawStitches, 16), // ~60fps
    [drawStitches, debounce]);
    // Advanced pattern generation for complex designs
    const generateComplexPattern = (patternType, complexity = 5) => {
        console.log(`🎨 Generating complex ${patternType} pattern with complexity ${complexity}`);
        const patterns = [];
        const basePoints = 20;
        const pointCount = basePoints * complexity;
        for (let i = 0; i < pointCount; i++) {
            const angle = (i / pointCount) * Math.PI * 2;
            const radius = 50 + Math.sin(angle * 3) * 20 + Math.cos(angle * 5) * 10;
            const x = 200 + Math.cos(angle) * radius;
            const y = 200 + Math.sin(angle) * radius;
            patterns.push({
                x: x + (Math.random() - 0.5) * 10,
                y: y + (Math.random() - 0.5) * 10,
                pressure: 0.5 + Math.random() * 0.5
            });
        }
        return patterns;
    };
    // Advanced stitch path optimization for complex designs
    const optimizeComplexStitchPath = (stitches) => {
        console.log('🔧 Optimizing complex stitch path...');
        // Group stitches by color and type
        const groupedStitches = new Map();
        stitches.forEach(stitch => {
            const key = `${stitch.color}_${stitch.type}`;
            if (!groupedStitches.has(key)) {
                groupedStitches.set(key, []);
            }
            groupedStitches.get(key).push(stitch);
        });
        // Optimize each group
        const optimizedStitches = [];
        groupedStitches.forEach(group => {
            // Sort by distance to minimize jumps
            const sortedGroup = group.sort((a, b) => {
                const aCenter = getStitchCenter(a);
                const bCenter = getStitchCenter(b);
                return Math.sqrt(aCenter.x * aCenter.x + aCenter.y * aCenter.y) -
                    Math.sqrt(bCenter.x * bCenter.x + bCenter.y * bCenter.y);
            });
            optimizedStitches.push(...sortedGroup);
        });
        return optimizedStitches;
    };
    // Get center point of a stitch
    const getStitchCenter = (stitch) => {
        if (stitch.points.length === 0)
            return { x: 0, y: 0 };
        const sum = stitch.points.reduce((acc, point) => ({
            x: acc.x + point.x,
            y: acc.y + point.y
        }), { x: 0, y: 0 });
        return {
            x: sum.x / stitch.points.length,
            y: sum.y / stitch.points.length
        };
    };
    // Advanced pattern recognition for complex designs
    const recognizePattern = (stitches) => {
        console.log('🔍 Recognizing pattern in complex design...');
        const patterns = {
            geometric: 0,
            organic: 0,
            text: 0,
            floral: 0,
            abstract: 0
        };
        stitches.forEach(stitch => {
            const center = getStitchCenter(stitch);
            const points = stitch.points;
            // Analyze geometric patterns
            if (points.length > 3) {
                const angles = [];
                for (let i = 1; i < points.length - 1; i++) {
                    const angle = calculateAngle(points[i - 1], points[i], points[i + 1]);
                    angles.push(angle);
                }
                const avgAngle = angles.reduce((a, b) => a + b, 0) / angles.length;
                if (Math.abs(avgAngle - 90) < 15)
                    patterns.geometric++;
                else if (Math.abs(avgAngle - 60) < 15)
                    patterns.geometric++;
                else if (Math.abs(avgAngle - 120) < 15)
                    patterns.geometric++;
                else
                    patterns.organic++;
            }
            // Analyze text patterns
            if (stitch.type === 'satin' && points.length > 2) {
                const isLinear = points.every((point, i) => {
                    if (i === 0)
                        return true;
                    const prev = points[i - 1];
                    const slope = Math.abs((point.y - prev.y) / (point.x - prev.x));
                    return slope < 0.5 || slope > 2;
                });
                if (isLinear)
                    patterns.text++;
            }
        });
        return patterns;
    };
    // Calculate angle between three points
    const calculateAngle = (p1, p2, p3) => {
        const a = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        const b = Math.sqrt(Math.pow(p3.x - p2.x, 2) + Math.pow(p3.y - p2.y, 2));
        const c = Math.sqrt(Math.pow(p3.x - p1.x, 2) + Math.pow(p3.y - p1.y, 2));
        return Math.acos((a * a + b * b - c * c) / (2 * a * b)) * (180 / Math.PI);
    };
    const drawStitch = (ctx, stitch, rect, isPreview = false) => {
        console.log(`🎨 DRAWING STITCH:`, {
            type: stitch.type,
            points: stitch.points.length,
            color: stitch.color,
            thickness: stitch.thickness,
            opacity: stitch.opacity,
            isPreview,
            rect: { width: rect.width, height: rect.height }
        });
        if (stitch.points.length < 2) {
            console.warn(`⚠️ STITCH SKIPPED: Not enough points (${stitch.points.length})`);
            return;
        }
        ctx.save();
        ctx.globalAlpha = isPreview ? 0.5 : stitch.opacity;
        // Convert UV coordinates to canvas coordinates
        const points = stitch.points.map(p => ({
            x: p.x * rect.width,
            y: p.y * rect.height
        }));
        // Create hyperrealistic thread appearance based on stitch type
        const baseColor = stitch.color;
        const darkerColor = adjustBrightness(baseColor, -30);
        const lighterColor = adjustBrightness(baseColor, 30);
        const highlightColor = adjustBrightness(baseColor, 50);
        // Set up high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // Create dynamic gradient based on stitch direction
        const startPoint = points[0];
        const endPoint = points[points.length - 1];
        const gradient = ctx.createLinearGradient(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
        gradient.addColorStop(0, lighterColor);
        gradient.addColorStop(0.3, baseColor);
        gradient.addColorStop(0.7, baseColor);
        gradient.addColorStop(1, darkerColor);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = stitch.thickness * qualityScale;
        // Add realistic shadow based on lighting direction
        const shadowIntensity = lightingDirection === 'top' ? 0.4 : lightingDirection === 'bottom' ? 0.6 : 0.5;
        ctx.shadowColor = `rgba(0, 0, 0, ${shadowIntensity})`;
        ctx.shadowBlur = Math.max(3, stitch.thickness * 0.8);
        ctx.shadowOffsetX = lightingDirection === 'left' ? 3 : lightingDirection === 'right' ? -3 : 2;
        ctx.shadowOffsetY = lightingDirection === 'top' ? 3 : lightingDirection === 'bottom' ? -3 : 2;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        console.log(`🔀 SWITCHING TO STITCH TYPE: ${stitch.type}`);
        switch (stitch.type) {
            case 'satin':
                console.log(`🧵 RENDERING SATIN STITCH with ${points.length} points`);
                // Smooth curve for satin stitch with hyperrealistic rendering
                for (let i = 1; i < points.length; i++) {
                    const prev = points[i - 1];
                    const curr = points[i];
                    const next = points[i + 1];
                    if (next) {
                        const cp1x = prev.x + (curr.x - prev.x) / 3;
                        const cp1y = prev.y + (curr.y - prev.y) / 3;
                        const cp2x = curr.x - (next.x - curr.x) / 3;
                        const cp2y = curr.y - (next.y - curr.y) / 3;
                        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
                    }
                    else {
                        ctx.lineTo(curr.x, curr.y);
                    }
                }
                ctx.stroke();
                // Add satin-specific highlights for 3D effect
                ctx.strokeStyle = adjustBrightness(stitch.color, 25);
                ctx.lineWidth = stitch.thickness * 0.4;
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.globalAlpha = 0.8;
                ctx.beginPath();
                ctx.moveTo(points[0].x - 0.5, points[0].y - 0.5);
                for (let i = 1; i < points.length; i++) {
                    const prev = points[i - 1];
                    const curr = points[i];
                    const next = points[i + 1];
                    if (next) {
                        const cp1x = prev.x + (curr.x - prev.x) / 3;
                        const cp1y = prev.y + (curr.y - prev.y) / 3;
                        const cp2x = curr.x - (next.x - curr.x) / 3;
                        const cp2y = curr.y - (next.y - curr.y) / 3;
                        ctx.bezierCurveTo(cp1x - 0.5, cp1y - 0.5, cp2x - 0.5, cp2y - 0.5, curr.x - 0.5, curr.y - 0.5);
                    }
                    else {
                        ctx.lineTo(curr.x - 0.5, curr.y - 0.5);
                    }
                }
                ctx.stroke();
                // Reset alpha for other effects
                ctx.globalAlpha = 1;
                break;
            case 'fill':
                console.log(`🟦 RENDERING FILL STITCH with ${points.length} points`);
                // Calculate bounding box
                const minX = Math.min(...points.map(p => p.x));
                const maxX = Math.max(...points.map(p => p.x));
                const minY = Math.min(...points.map(p => p.y));
                const maxY = Math.max(...points.map(p => p.y));
                // Determine fill direction based on shape
                const width = maxX - minX;
                const height = maxY - minY;
                const isHorizontal = width > height;
                // Calculate realistic thread spacing - much tighter for embroidery look
                const threadThickness = Math.max(0.5, stitch.thickness * 0.3); // Much thinner threads
                const baseSpacing = threadThickness * 0.8; // Tighter spacing
                const maxLines = 80; // More lines for realistic coverage
                // Generate fill lines
                const fillLines = [];
                if (isHorizontal) {
                    // Horizontal fill lines
                    const totalLines = Math.min(maxLines, Math.floor(height / baseSpacing));
                    for (let i = 0; i < totalLines; i++) {
                        const y = minY + (i * height) / totalLines;
                        const intersections = getLineIntersections(points, y);
                        for (let j = 0; j < intersections.length; j += 2) {
                            if (intersections[j + 1]) {
                                fillLines.push({
                                    x1: intersections[j],
                                    y1: y,
                                    x2: intersections[j + 1],
                                    y2: y,
                                    index: i
                                });
                            }
                        }
                    }
                }
                else {
                    // Vertical fill lines
                    const totalLines = Math.min(maxLines, Math.floor(width / baseSpacing));
                    for (let i = 0; i < totalLines; i++) {
                        const x = minX + (i * width) / totalLines;
                        const intersections = getVerticalIntersections(points, x);
                        for (let j = 0; j < intersections.length; j += 2) {
                            if (intersections[j + 1]) {
                                fillLines.push({
                                    x1: x,
                                    y1: intersections[j],
                                    x2: x,
                                    y2: intersections[j + 1],
                                    index: i
                                });
                            }
                        }
                    }
                }
                // Render fill lines as hyperrealistic embroidered threads
                fillLines.forEach((line) => {
                    const isEvenRow = line.index % 2 === 0;
                    const baseColor = stitch.color;
                    // Create hyperrealistic thread appearance with complex variations
                    const threadVariation = (Math.sin(line.index * 0.3) * 8) + (Math.random() * 6 - 3);
                    const threadTwist = Math.sin(line.index * 0.7) * 3;
                    const adjustedColor = adjustBrightness(baseColor, threadVariation + threadTwist);
                    // Calculate thread position for 3D effects
                    const lineLength = Math.sqrt((line.x2 - line.x1) ** 2 + (line.y2 - line.y1) ** 2);
                    const numSegments = Math.max(5, Math.floor(lineLength / 1.5)); // More segments for detail
                    // Create thread shadow (darker, slightly offset)
                    ctx.strokeStyle = adjustBrightness(adjustedColor, -30);
                    ctx.lineWidth = threadThickness * 1.4;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.globalAlpha = 0.6;
                    ctx.beginPath();
                    if (isEvenRow) {
                        ctx.moveTo(line.x1 + 0.3, line.y1 + 0.3);
                        for (let i = 1; i <= numSegments; i++) {
                            const t = i / numSegments;
                            const x = line.x1 + t * (line.x2 - line.x1) + 0.3;
                            const y = line.y1 + t * (line.y2 - line.y1) + 0.3;
                            // Add thread twist variations
                            const twist = Math.sin(t * Math.PI * 2 + line.index * 0.5) * 0.2;
                            const perpX = -(line.y2 - line.y1) / lineLength * twist;
                            const perpY = (line.x2 - line.x1) / lineLength * twist;
                            ctx.lineTo(x + perpX, y + perpY);
                        }
                    }
                    else {
                        ctx.moveTo(line.x2 + 0.3, line.y2 + 0.3);
                        for (let i = 1; i <= numSegments; i++) {
                            const t = i / numSegments;
                            const x = line.x2 - t * (line.x2 - line.x1) + 0.3;
                            const y = line.y2 - t * (line.y2 - line.y1) + 0.3;
                            // Add thread twist variations
                            const twist = Math.sin(t * Math.PI * 2 + line.index * 0.5) * 0.2;
                            const perpX = (line.y2 - line.y1) / lineLength * twist;
                            const perpY = -(line.x2 - line.x1) / lineLength * twist;
                            ctx.lineTo(x + perpX, y + perpY);
                        }
                    }
                    ctx.stroke();
                    // Create thread highlight (brighter, on top)
                    ctx.strokeStyle = adjustBrightness(adjustedColor, 20);
                    ctx.lineWidth = threadThickness * 0.7;
                    ctx.globalAlpha = 0.9;
                    ctx.beginPath();
                    if (isEvenRow) {
                        ctx.moveTo(line.x1, line.y1);
                        for (let i = 1; i <= numSegments; i++) {
                            const t = i / numSegments;
                            const x = line.x1 + t * (line.x2 - line.x1);
                            const y = line.y1 + t * (line.y2 - line.y1);
                            // Add thread fiber texture
                            const fiberVariation = Math.sin(t * Math.PI * 4 + line.index * 0.3) * 0.15;
                            const randomVariation = (Math.random() - 0.5) * 0.2;
                            const totalVariation = fiberVariation + randomVariation;
                            const perpX = -(line.y2 - line.y1) / lineLength * totalVariation;
                            const perpY = (line.x2 - line.x1) / lineLength * totalVariation;
                            ctx.lineTo(x + perpX, y + perpY);
                        }
                    }
                    else {
                        ctx.moveTo(line.x2, line.y2);
                        for (let i = 1; i <= numSegments; i++) {
                            const t = i / numSegments;
                            const x = line.x2 - t * (line.x2 - line.x1);
                            const y = line.y2 - t * (line.y2 - line.y1);
                            // Add thread fiber texture
                            const fiberVariation = Math.sin(t * Math.PI * 4 + line.index * 0.3) * 0.15;
                            const randomVariation = (Math.random() - 0.5) * 0.2;
                            const totalVariation = fiberVariation + randomVariation;
                            const perpX = (line.y2 - line.y1) / lineLength * totalVariation;
                            const perpY = -(line.x2 - line.x1) / lineLength * totalVariation;
                            ctx.lineTo(x + perpX, y + perpY);
                        }
                    }
                    ctx.stroke();
                    // Create main thread (base color)
                    ctx.strokeStyle = adjustedColor;
                    ctx.lineWidth = threadThickness;
                    ctx.globalAlpha = 1;
                    ctx.beginPath();
                    if (isEvenRow) {
                        ctx.moveTo(line.x1, line.y1);
                        for (let i = 1; i <= numSegments; i++) {
                            const t = i / numSegments;
                            const x = line.x1 + t * (line.x2 - line.x1);
                            const y = line.y1 + t * (line.y2 - line.y1);
                            // Add realistic thread texture
                            const fiberVariation = Math.sin(t * Math.PI * 3 + line.index * 0.4) * 0.1;
                            const randomVariation = (Math.random() - 0.5) * 0.15;
                            const totalVariation = fiberVariation + randomVariation;
                            const perpX = -(line.y2 - line.y1) / lineLength * totalVariation;
                            const perpY = (line.x2 - line.x1) / lineLength * totalVariation;
                            ctx.lineTo(x + perpX, y + perpY);
                        }
                    }
                    else {
                        ctx.moveTo(line.x2, line.y2);
                        for (let i = 1; i <= numSegments; i++) {
                            const t = i / numSegments;
                            const x = line.x2 - t * (line.x2 - line.x1);
                            const y = line.y2 - t * (line.y2 - line.y1);
                            // Add realistic thread texture
                            const fiberVariation = Math.sin(t * Math.PI * 3 + line.index * 0.4) * 0.1;
                            const randomVariation = (Math.random() - 0.5) * 0.15;
                            const totalVariation = fiberVariation + randomVariation;
                            const perpX = (line.y2 - line.y1) / lineLength * totalVariation;
                            const perpY = -(line.x2 - line.x1) / lineLength * totalVariation;
                            ctx.lineTo(x + perpX, y + perpY);
                        }
                    }
                    ctx.stroke();
                });
                break;
            case 'cross-stitch':
                console.log(`❌ RENDERING HYPERREALISTIC CROSS-STITCH with ${points.length} points`);
                // Draw hyperrealistic cross-stitch with professional embroidery quality
                points.forEach((point, i) => {
                    if (i % 2 === 0 && points[i + 1]) {
                        const next = points[i + 1];
                        const size = stitch.thickness * 2.0;
                        const threadThickness = Math.max(0.8, stitch.thickness * 0.4);
                        // Create realistic thread color variations
                        const threadVariation = (Math.sin(i * 0.5) * 8) + (Math.random() * 4 - 2);
                        const adjustedColor = adjustBrightness(baseColor, threadVariation);
                        const shadowColor = adjustBrightness(adjustedColor, -20);
                        const highlightColor = adjustBrightness(adjustedColor, 12);
                        // Draw cross-stitch shadow (offset slightly)
                        ctx.strokeStyle = shadowColor;
                        ctx.lineWidth = threadThickness * 1.3;
                        ctx.lineCap = 'round';
                        ctx.lineJoin = 'round';
                        ctx.globalAlpha = 0.6;
                        ctx.shadowBlur = 0;
                        ctx.shadowOffsetX = 0;
                        ctx.shadowOffsetY = 0;
                        ctx.beginPath();
                        ctx.moveTo(point.x - size + 0.5, point.y - size + 0.5);
                        ctx.lineTo(point.x + size + 0.5, point.y + size + 0.5);
                        ctx.moveTo(point.x - size + 0.5, point.y + size + 0.5);
                        ctx.lineTo(point.x + size + 0.5, point.y - size + 0.5);
                        ctx.stroke();
                        // Draw main cross-stitch threads
                        ctx.strokeStyle = adjustedColor;
                        ctx.lineWidth = threadThickness;
                        ctx.globalAlpha = 1;
                        // First diagonal (bottom-left to top-right)
                        ctx.beginPath();
                        ctx.moveTo(point.x - size, point.y - size);
                        ctx.lineTo(point.x + size, point.y + size);
                        ctx.stroke();
                        // Second diagonal (top-left to bottom-right)
                        ctx.beginPath();
                        ctx.moveTo(point.x - size, point.y + size);
                        ctx.lineTo(point.x + size, point.y - size);
                        ctx.stroke();
                        // Add thread highlights for 3D effect
                        ctx.strokeStyle = highlightColor;
                        ctx.lineWidth = threadThickness * 0.5;
                        ctx.globalAlpha = 0.7;
                        // Highlight first diagonal
                        ctx.beginPath();
                        ctx.moveTo(point.x - size + 0.3, point.y - size + 0.3);
                        ctx.lineTo(point.x + size - 0.3, point.y + size - 0.3);
                        ctx.stroke();
                        // Highlight second diagonal
                        ctx.beginPath();
                        ctx.moveTo(point.x - size + 0.3, point.y + size - 0.3);
                        ctx.lineTo(point.x + size - 0.3, point.y - size + 0.3);
                        ctx.stroke();
                        // Add realistic thread texture dots at intersections
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = adjustedColor;
                        const dotSize = threadThickness * 0.8;
                        // Center intersection dot
                        ctx.beginPath();
                        ctx.arc(point.x, point.y, dotSize * 0.6, 0, Math.PI * 2);
                        ctx.fill();
                        // Corner dots for thread ends
                        const cornerDotSize = threadThickness * 0.5;
                        ctx.beginPath();
                        ctx.arc(point.x - size, point.y - size, cornerDotSize, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.beginPath();
                        ctx.arc(point.x + size, point.y + size, cornerDotSize, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.beginPath();
                        ctx.arc(point.x - size, point.y + size, cornerDotSize, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.beginPath();
                        ctx.arc(point.x + size, point.y - size, cornerDotSize, 0, Math.PI * 2);
                        ctx.fill();
                        // Add subtle thread shine highlights
                        ctx.fillStyle = highlightColor;
                        ctx.globalAlpha = 0.6;
                        const shineSize = cornerDotSize * 0.4;
                        ctx.beginPath();
                        ctx.arc(point.x - size - shineSize * 0.5, point.y - size - shineSize * 0.5, shineSize, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.beginPath();
                        ctx.arc(point.x + size + shineSize * 0.5, point.y + size + shineSize * 0.5, shineSize, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.beginPath();
                        ctx.arc(point.x - size - shineSize * 0.5, point.y + size + shineSize * 0.5, shineSize, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.beginPath();
                        ctx.arc(point.x + size + shineSize * 0.5, point.y - size - shineSize * 0.5, shineSize, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });
                break;
            case 'chain':
                console.log(`⛓️ RENDERING HYPERREALISTIC CHAIN STITCH with ${points.length} points`);
                // Chain stitch pattern - draw connected oval links with professional embroidery quality
                for (let i = 0; i < points.length - 1; i++) {
                    const curr = points[i];
                    const next = points[i + 1];
                    const midX = (curr.x + next.x) / 2;
                    const midY = (curr.y + next.y) / 2;
                    // Calculate link dimensions
                    const linkWidth = stitch.thickness * 2.5;
                    const linkHeight = stitch.thickness * 1.5;
                    const threadThickness = Math.max(0.8, stitch.thickness * 0.5);
                    // Create realistic thread color variations
                    const threadVariation = (Math.sin(i * 0.7) * 6) + (Math.random() * 3 - 1.5);
                    const adjustedColor = adjustBrightness(baseColor, threadVariation);
                    const shadowColor = adjustBrightness(adjustedColor, -18);
                    const highlightColor = adjustBrightness(adjustedColor, 10);
                    // Calculate link angle for proper orientation
                    const angle = Math.atan2(next.y - curr.y, next.x - curr.x);
                    // Draw chain link shadow (offset slightly)
                    ctx.strokeStyle = shadowColor;
                    ctx.lineWidth = threadThickness * 1.4;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.globalAlpha = 0.5;
                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                    ctx.beginPath();
                    ctx.ellipse(midX + 0.4, midY + 0.4, linkWidth / 2, linkHeight / 2, angle, 0, Math.PI * 2);
                    ctx.stroke();
                    // Draw main chain link
                    ctx.strokeStyle = adjustedColor;
                    ctx.lineWidth = threadThickness;
                    ctx.globalAlpha = 1;
                    ctx.beginPath();
                    ctx.ellipse(midX, midY, linkWidth / 2, linkHeight / 2, angle, 0, Math.PI * 2);
                    ctx.stroke();
                    // Draw inner oval for chain link hole
                    ctx.beginPath();
                    ctx.ellipse(midX, midY, linkWidth / 3, linkHeight / 3, angle, 0, Math.PI * 2);
                    ctx.stroke();
                    // Add chain link highlight for 3D effect
                    ctx.strokeStyle = highlightColor;
                    ctx.lineWidth = threadThickness * 0.6;
                    ctx.globalAlpha = 0.8;
                    ctx.beginPath();
                    ctx.ellipse(midX - 0.2, midY - 0.2, linkWidth / 2.2, linkHeight / 2.2, angle, 0, Math.PI * 2);
                    ctx.stroke();
                    // Add connecting thread between links
                    if (i < points.length - 2) {
                        const nextNext = points[i + 2];
                        const connectionX = (next.x + nextNext.x) / 2;
                        const connectionY = (next.y + nextNext.y) / 2;
                        // Draw connection shadow
                        ctx.strokeStyle = shadowColor;
                        ctx.lineWidth = threadThickness * 0.8;
                        ctx.globalAlpha = 0.3;
                        ctx.beginPath();
                        ctx.moveTo(next.x + 0.2, next.y + 0.2);
                        ctx.lineTo(connectionX + 0.2, connectionY + 0.2);
                        ctx.stroke();
                        // Draw main connection thread
                        ctx.strokeStyle = adjustedColor;
                        ctx.lineWidth = threadThickness * 0.6;
                        ctx.globalAlpha = 1;
                        ctx.beginPath();
                        ctx.moveTo(next.x, next.y);
                        ctx.lineTo(connectionX, connectionY);
                        ctx.stroke();
                        // Add connection highlight
                        ctx.strokeStyle = highlightColor;
                        ctx.lineWidth = threadThickness * 0.3;
                        ctx.globalAlpha = 0.7;
                        ctx.beginPath();
                        ctx.moveTo(next.x - 0.1, next.y - 0.1);
                        ctx.lineTo(connectionX - 0.1, connectionY - 0.1);
                        ctx.stroke();
                    }
                    // Add realistic thread texture dots at key points
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = adjustedColor;
                    const dotSize = threadThickness * 0.4;
                    // Top and bottom of chain link
                    ctx.beginPath();
                    ctx.arc(midX + Math.cos(angle) * linkWidth / 2, midY + Math.sin(angle) * linkWidth / 2, dotSize, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(midX - Math.cos(angle) * linkWidth / 2, midY - Math.sin(angle) * linkWidth / 2, dotSize, 0, Math.PI * 2);
                    ctx.fill();
                    // Add subtle thread shine highlights
                    ctx.fillStyle = highlightColor;
                    ctx.globalAlpha = 0.6;
                    const shineSize = dotSize * 0.5;
                    ctx.beginPath();
                    ctx.arc(midX + Math.cos(angle) * linkWidth / 2 - shineSize * 0.3, midY + Math.sin(angle) * linkWidth / 2 - shineSize * 0.3, shineSize, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
            case 'backstitch':
                console.log(`📏 RENDERING HYPERREALISTIC BACKSTITCH with ${points.length} points`);
                // Draw hyperrealistic backstitch with professional embroidery quality
                const backstitchThreadThickness = Math.max(0.8, stitch.thickness * 0.6);
                // Create realistic thread color variations
                const backstitchThreadVariation = 0.1 + Math.random() * 0.2;
                const backstitchAdjustedColor = adjustBrightness(stitch.color, (Math.random() - 0.5) * 20 * backstitchThreadVariation);
                const backstitchShadowColor = adjustBrightness(backstitchAdjustedColor, -25);
                const backstitchHighlightColor = adjustBrightness(backstitchAdjustedColor, 20);
                // Draw each backstitch segment with realistic thread appearance
                for (let i = 0; i < points.length - 1; i++) {
                    const curr = points[i];
                    const next = points[i + 1];
                    // Calculate segment direction and perpendicular
                    const dx = next.x - curr.x;
                    const dy = next.y - curr.y;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    const perpX = -dy / length * 0.3;
                    const perpY = dx / length * 0.3;
                    // Shadow layer
                    ctx.strokeStyle = backstitchShadowColor;
                    ctx.lineWidth = backstitchThreadThickness * 1.2;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.globalAlpha = 0.4;
                    ctx.shadowBlur = 0;
                    ctx.beginPath();
                    ctx.moveTo(curr.x + perpX, curr.y + perpY);
                    ctx.lineTo(next.x + perpX, next.y + perpY);
                    ctx.stroke();
                    // Main thread
                    ctx.strokeStyle = backstitchAdjustedColor;
                    ctx.lineWidth = backstitchThreadThickness;
                    ctx.globalAlpha = 1;
                    ctx.beginPath();
                    ctx.moveTo(curr.x, curr.y);
                    ctx.lineTo(next.x, next.y);
                    ctx.stroke();
                    // Highlight layer
                    ctx.strokeStyle = backstitchHighlightColor;
                    ctx.lineWidth = backstitchThreadThickness * 0.5;
                    ctx.globalAlpha = 0.7;
                    ctx.beginPath();
                    ctx.moveTo(curr.x - perpX * 0.3, curr.y - perpY * 0.3);
                    ctx.lineTo(next.x - perpX * 0.3, next.y - perpY * 0.3);
                    ctx.stroke();
                    // Add thread texture dots
                    const dotSize = backstitchThreadThickness * 0.3;
                    ctx.fillStyle = backstitchHighlightColor;
                    ctx.globalAlpha = 0.8;
                    ctx.beginPath();
                    ctx.arc(curr.x, curr.y, dotSize, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
            case 'outline':
                console.log(`📏 RENDERING HYPERREALISTIC OUTLINE STITCH with ${points.length} points`);
                // Draw hyperrealistic outline stitch with professional embroidery quality
                if (points.length < 2)
                    return;
                const outlineThreadThickness = Math.max(0.8, stitch.thickness * 0.6);
                // Create realistic thread color variations
                const threadVariation = (Math.sin(points.length * 0.3) * 5) + (Math.random() * 3 - 1.5);
                const adjustedColor = adjustBrightness(baseColor, threadVariation);
                const shadowColor = adjustBrightness(adjustedColor, -15);
                const highlightColor = adjustBrightness(adjustedColor, 8);
                // Draw outline shadow (offset slightly)
                ctx.strokeStyle = shadowColor;
                ctx.lineWidth = outlineThreadThickness * 1.3;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.globalAlpha = 0.5;
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.beginPath();
                ctx.moveTo(points[0].x + 0.3, points[0].y + 0.3);
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x + 0.3, points[i].y + 0.3);
                }
                ctx.stroke();
                // Draw main outline thread
                ctx.strokeStyle = adjustedColor;
                ctx.lineWidth = outlineThreadThickness;
                ctx.globalAlpha = 1;
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    // Add subtle thread texture variations
                    const segmentLength = Math.sqrt(Math.pow(points[i].x - points[i - 1].x, 2) +
                        Math.pow(points[i].y - points[i - 1].y, 2));
                    if (segmentLength > 2) {
                        // Break long segments into smaller parts for texture
                        const numSegments = Math.max(2, Math.floor(segmentLength / 3));
                        for (let j = 1; j <= numSegments; j++) {
                            const t = j / numSegments;
                            const x = points[i - 1].x + t * (points[i].x - points[i - 1].x);
                            const y = points[i - 1].y + t * (points[i].y - points[i - 1].y);
                            // Add tiny random variations to simulate thread texture
                            const variation = (Math.random() - 0.5) * 0.2;
                            const perpX = -(points[i].y - points[i - 1].y) / segmentLength * variation;
                            const perpY = (points[i].x - points[i - 1].x) / segmentLength * variation;
                            ctx.lineTo(x + perpX, y + perpY);
                        }
                    }
                    else {
                        ctx.lineTo(points[i].x, points[i].y);
                    }
                }
                ctx.stroke();
                // Add thread highlight for 3D effect
                ctx.strokeStyle = highlightColor;
                ctx.lineWidth = outlineThreadThickness * 0.6;
                ctx.globalAlpha = 0.8;
                ctx.beginPath();
                ctx.moveTo(points[0].x - 0.1, points[0].y - 0.1);
                for (let i = 1; i < points.length; i++) {
                    const segmentLength = Math.sqrt(Math.pow(points[i].x - points[i - 1].x, 2) +
                        Math.pow(points[i].y - points[i - 1].y, 2));
                    if (segmentLength > 2) {
                        const numSegments = Math.max(2, Math.floor(segmentLength / 3));
                        for (let j = 1; j <= numSegments; j++) {
                            const t = j / numSegments;
                            const x = points[i - 1].x + t * (points[i].x - points[i - 1].x);
                            const y = points[i - 1].y + t * (points[i].y - points[i - 1].y);
                            const variation = (Math.random() - 0.5) * 0.1;
                            const perpX = -(points[i].y - points[i - 1].y) / segmentLength * variation;
                            const perpY = (points[i].x - points[i - 1].x) / segmentLength * variation;
                            ctx.lineTo(x + perpX - 0.1, y + perpY - 0.1);
                        }
                    }
                    else {
                        ctx.lineTo(points[i].x - 0.1, points[i].y - 0.1);
                    }
                }
                ctx.stroke();
                // Add realistic thread texture dots at key points
                ctx.globalAlpha = 1;
                ctx.fillStyle = adjustedColor;
                const dotSize = outlineThreadThickness * 0.3;
                // Add dots at start and end points
                ctx.beginPath();
                ctx.arc(points[0].x, points[0].y, dotSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(points[points.length - 1].x, points[points.length - 1].y, dotSize, 0, Math.PI * 2);
                ctx.fill();
                // Add subtle thread shine highlights
                ctx.fillStyle = highlightColor;
                ctx.globalAlpha = 0.6;
                const shineSize = dotSize * 0.6;
                ctx.beginPath();
                ctx.arc(points[0].x - shineSize * 0.3, points[0].y - shineSize * 0.3, shineSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(points[points.length - 1].x - shineSize * 0.3, points[points.length - 1].y - shineSize * 0.3, shineSize, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'french-knot':
                console.log(`🎯 RENDERING HYPERREALISTIC FRENCH KNOTS with ${points.length} points`);
                // Draw hyperrealistic French knots with professional embroidery quality
                const knotThreadThickness = Math.max(0.6, stitch.thickness * 0.4);
                points.forEach((point, i) => {
                    if (i % 3 === 0) {
                        // Create realistic thread color variations
                        const threadVariation = 0.1 + Math.random() * 0.2;
                        const adjustedColor = adjustBrightness(stitch.color, (Math.random() - 0.5) * 15 * threadVariation);
                        const shadowColor = adjustBrightness(adjustedColor, -30);
                        const highlightColor = adjustBrightness(adjustedColor, 25);
                        const knotSize = stitch.thickness * 2.5;
                        const innerSize = knotSize * 0.6;
                        const coreSize = knotSize * 0.3;
                        // Shadow layer
                        ctx.fillStyle = shadowColor;
                        ctx.globalAlpha = 0.4;
                        ctx.beginPath();
                        ctx.arc(point.x + 0.3, point.y + 0.3, knotSize, 0, Math.PI * 2);
                        ctx.fill();
                        // Main knot body with gradient
                        const gradient = ctx.createRadialGradient(point.x - knotSize * 0.3, point.y - knotSize * 0.3, 0, point.x, point.y, knotSize);
                        gradient.addColorStop(0, highlightColor);
                        gradient.addColorStop(0.7, adjustedColor);
                        gradient.addColorStop(1, shadowColor);
                        ctx.fillStyle = gradient;
                        ctx.globalAlpha = 1;
                        ctx.beginPath();
                        ctx.arc(point.x, point.y, knotSize, 0, Math.PI * 2);
                        ctx.fill();
                        // Inner knot layer
                        ctx.fillStyle = adjustBrightness(adjustedColor, 10);
                        ctx.globalAlpha = 0.8;
                        ctx.beginPath();
                        ctx.arc(point.x, point.y, innerSize, 0, Math.PI * 2);
                        ctx.fill();
                        // Core highlight
                        ctx.fillStyle = highlightColor;
                        ctx.globalAlpha = 0.9;
                        ctx.beginPath();
                        ctx.arc(point.x - knotSize * 0.2, point.y - knotSize * 0.2, coreSize, 0, Math.PI * 2);
                        ctx.fill();
                        // Thread texture lines
                        ctx.strokeStyle = highlightColor;
                        ctx.lineWidth = knotThreadThickness * 0.3;
                        ctx.globalAlpha = 0.6;
                        for (let j = 0; j < 4; j++) {
                            const angle = (j * Math.PI * 2) / 4;
                            const startX = point.x + Math.cos(angle) * innerSize;
                            const startY = point.y + Math.sin(angle) * innerSize;
                            const endX = point.x + Math.cos(angle) * knotSize * 0.8;
                            const endY = point.y + Math.sin(angle) * knotSize * 0.8;
                            ctx.beginPath();
                            ctx.moveTo(startX, startY);
                            ctx.lineTo(endX, endY);
                            ctx.stroke();
                        }
                        // Shine highlight
                        ctx.fillStyle = adjustBrightness(highlightColor, 20);
                        ctx.globalAlpha = 0.7;
                        const shineSize = coreSize * 0.4;
                        ctx.beginPath();
                        ctx.arc(point.x - knotSize * 0.3, point.y - knotSize * 0.3, shineSize, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });
                break;
            case 'bullion':
                console.log(`🌾 RENDERING HYPERREALISTIC BULLION STITCH with ${points.length} points`);
                // Draw hyperrealistic bullion stitch with professional embroidery quality
                const bullionThreadThickness = Math.max(0.8, stitch.thickness * 0.5);
                for (let i = 0; i < points.length - 1; i++) {
                    const start = points[i];
                    const end = points[i + 1];
                    const distance = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
                    const twists = Math.max(5, Math.floor(distance / (stitch.thickness * 1.2)));
                    // Create realistic thread color variations
                    const threadVariation = 0.1 + Math.random() * 0.2;
                    const adjustedColor = adjustBrightness(stitch.color, (Math.random() - 0.5) * 15 * threadVariation);
                    const shadowColor = adjustBrightness(adjustedColor, -25);
                    const highlightColor = adjustBrightness(adjustedColor, 20);
                    // Create gradient for rope effect
                    const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
                    gradient.addColorStop(0, shadowColor);
                    gradient.addColorStop(0.3, adjustedColor);
                    gradient.addColorStop(0.7, adjustedColor);
                    gradient.addColorStop(1, highlightColor);
                    for (let t = 0; t < twists; t++) {
                        const progress = t / twists;
                        const x = start.x + (end.x - start.x) * progress;
                        const y = start.y + (end.y - start.y) * progress;
                        const offset = Math.sin(progress * Math.PI * 8) * stitch.thickness * 0.5;
                        const perpOffset = Math.cos(progress * Math.PI * 8) * stitch.thickness * 0.3;
                        const segmentSize = stitch.thickness * 0.6;
                        const innerSize = segmentSize * 0.6;
                        // Shadow layer
                        ctx.fillStyle = shadowColor;
                        ctx.globalAlpha = 0.4;
                        ctx.beginPath();
                        ctx.arc(x + offset + 0.2, y + perpOffset + 0.2, segmentSize, 0, Math.PI * 2);
                        ctx.fill();
                        // Main rope segment with gradient
                        ctx.fillStyle = gradient;
                        ctx.globalAlpha = 1;
                        ctx.beginPath();
                        ctx.arc(x + offset, y + perpOffset, segmentSize, 0, Math.PI * 2);
                        ctx.fill();
                        // Inner rope highlight
                        ctx.fillStyle = highlightColor;
                        ctx.globalAlpha = 0.8;
                        ctx.beginPath();
                        ctx.arc(x + offset - segmentSize * 0.2, y + perpOffset - segmentSize * 0.2, innerSize, 0, Math.PI * 2);
                        ctx.fill();
                        // Thread twist lines
                        ctx.strokeStyle = highlightColor;
                        ctx.lineWidth = bullionThreadThickness * 0.2;
                        ctx.globalAlpha = 0.6;
                        for (let j = 0; j < 3; j++) {
                            const angle = (j * Math.PI * 2) / 3 + progress * Math.PI * 4;
                            const lineStartX = x + offset + Math.cos(angle) * segmentSize * 0.3;
                            const lineStartY = y + perpOffset + Math.sin(angle) * segmentSize * 0.3;
                            const lineEndX = x + offset + Math.cos(angle) * segmentSize * 0.8;
                            const lineEndY = y + perpOffset + Math.sin(angle) * segmentSize * 0.8;
                            ctx.beginPath();
                            ctx.moveTo(lineStartX, lineStartY);
                            ctx.lineTo(lineEndX, lineEndY);
                            ctx.stroke();
                        }
                        // Shine highlight
                        ctx.fillStyle = adjustBrightness(highlightColor, 15);
                        ctx.globalAlpha = 0.7;
                        const shineSize = innerSize * 0.4;
                        ctx.beginPath();
                        ctx.arc(x + offset - segmentSize * 0.3, y + perpOffset - segmentSize * 0.3, shineSize, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                break;
            case 'lazy-daisy':
                // Lazy daisy - petal-like stitches with realistic appearance
                for (let i = 0; i < points.length - 1; i += 2) {
                    const center = points[i];
                    const petal = points[i + 1];
                    if (petal) {
                        const angle = Math.atan2(petal.y - center.y, petal.x - center.x);
                        const petalLength = Math.sqrt((petal.x - center.x) ** 2 + (petal.y - center.y) ** 2);
                        // Create gradient for petal effect
                        const gradient = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, petalLength);
                        gradient.addColorStop(0, adjustBrightness(stitch.color, 20));
                        gradient.addColorStop(0.7, stitch.color);
                        gradient.addColorStop(1, adjustBrightness(stitch.color, -10));
                        ctx.fillStyle = gradient;
                        ctx.beginPath();
                        ctx.ellipse(center.x, center.y, petalLength, stitch.thickness * 0.6, angle, 0, Math.PI * 2);
                        ctx.fill();
                        // Add petal outline for definition
                        ctx.strokeStyle = adjustBrightness(stitch.color, -30);
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.ellipse(center.x, center.y, petalLength, stitch.thickness * 0.6, angle, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                }
                break;
            case 'feather':
                // Feather stitch - zigzag pattern with realistic appearance
                for (let i = 0; i < points.length - 2; i += 2) {
                    const start = points[i];
                    const middle = points[i + 1];
                    const end = points[i + 2];
                    if (middle && end) {
                        // Create gradient for feather effect
                        const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
                        gradient.addColorStop(0, adjustBrightness(stitch.color, 10));
                        gradient.addColorStop(0.5, stitch.color);
                        gradient.addColorStop(1, adjustBrightness(stitch.color, -10));
                        ctx.strokeStyle = gradient;
                        ctx.lineWidth = stitch.thickness;
                        ctx.lineCap = 'round';
                        ctx.lineJoin = 'round';
                        ctx.beginPath();
                        ctx.moveTo(start.x, start.y);
                        ctx.lineTo(middle.x, middle.y);
                        ctx.lineTo(end.x, end.y);
                        ctx.stroke();
                        // Add small decorative elements
                        ctx.fillStyle = stitch.color;
                        ctx.beginPath();
                        ctx.arc(middle.x, middle.y, stitch.thickness * 0.3, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                break;
            case 'couching':
                // Couching - decorative thread laid down and stitched over
                for (let i = 0; i < points.length - 1; i++) {
                    const start = points[i];
                    const end = points[i + 1];
                    // Main thread
                    ctx.beginPath();
                    ctx.moveTo(start.x, start.y);
                    ctx.lineTo(end.x, end.y);
                    ctx.stroke();
                    // Couching stitches perpendicular to main thread
                    const midX = (start.x + end.x) / 2;
                    const midY = (start.y + end.y) / 2;
                    const perpAngle = Math.atan2(end.y - start.y, end.x - start.x) + Math.PI / 2;
                    const couchingLength = stitch.thickness * 3;
                    ctx.beginPath();
                    ctx.moveTo(midX + Math.cos(perpAngle) * couchingLength, midY + Math.sin(perpAngle) * couchingLength);
                    ctx.lineTo(midX - Math.cos(perpAngle) * couchingLength, midY - Math.sin(perpAngle) * couchingLength);
                    ctx.stroke();
                }
                break;
            case 'seed':
                // Seed stitch - small random dots
                points.forEach((point, i) => {
                    if (i % 2 === 0) {
                        const offsetX = (Math.random() - 0.5) * stitch.thickness;
                        const offsetY = (Math.random() - 0.5) * stitch.thickness;
                        ctx.beginPath();
                        ctx.arc(point.x + offsetX, point.y + offsetY, stitch.thickness * 0.3, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });
                break;
            case 'stem':
                // Stem stitch - twisted line with overlapping
                for (let i = 0; i < points.length - 1; i++) {
                    const start = points[i];
                    const end = points[i + 1];
                    const midX = (start.x + end.x) / 2;
                    const midY = (start.y + end.y) / 2;
                    ctx.beginPath();
                    ctx.moveTo(start.x, start.y);
                    ctx.quadraticCurveTo(midX, midY, end.x, end.y);
                    ctx.stroke();
                }
                break;
            case 'metallic':
                // Metallic thread with shimmer effect
                const metallicGradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
                metallicGradient.addColorStop(0, '#FFD700');
                metallicGradient.addColorStop(0.3, '#FFA500');
                metallicGradient.addColorStop(0.7, '#FFD700');
                metallicGradient.addColorStop(1, '#B8860B');
                ctx.strokeStyle = metallicGradient;
                ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
                ctx.shadowBlur = 4;
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
                break;
            case 'glow-thread':
                // Glow-in-the-dark thread effect
                ctx.strokeStyle = stitch.color;
                ctx.shadowColor = stitch.color;
                ctx.shadowBlur = 8;
                ctx.lineWidth = stitch.thickness * 1.5;
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
                break;
            case 'variegated':
                // Variegated thread with color changes
                for (let i = 0; i < points.length - 1; i++) {
                    const progress = i / (points.length - 1);
                    const hue = (progress * 360) % 360;
                    const color = `hsl(${hue}, 70%, 50%)`;
                    ctx.strokeStyle = color;
                    ctx.beginPath();
                    ctx.moveTo(points[i].x, points[i].y);
                    ctx.lineTo(points[i + 1].x, points[i + 1].y);
                    ctx.stroke();
                }
                break;
            case 'gradient':
                // Gradient thread effect
                const gradient = ctx.createLinearGradient(points[0].x, points[0].y, points[points.length - 1].x, points[points.length - 1].y);
                gradient.addColorStop(0, adjustBrightness(stitch.color, -30));
                gradient.addColorStop(0.5, stitch.color);
                gradient.addColorStop(1, adjustBrightness(stitch.color, 30));
                ctx.strokeStyle = gradient;
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
                break;
            case 'brick':
                // Brick stitch - offset rectangular pattern
                const brickHeight = stitch.thickness * 2;
                const brickWidth = stitch.thickness * 3;
                for (let i = 0; i < points.length - 1; i++) {
                    const start = points[i];
                    const end = points[i + 1];
                    const isEvenRow = Math.floor(i / 2) % 2 === 0;
                    const offset = isEvenRow ? 0 : brickWidth / 2;
                    ctx.fillStyle = stitch.color;
                    ctx.fillRect(start.x + offset, start.y, brickWidth, brickHeight);
                    // Add brick texture
                    ctx.strokeStyle = adjustBrightness(stitch.color, -20);
                    ctx.lineWidth = 1;
                    ctx.strokeRect(start.x + offset, start.y, brickWidth, brickHeight);
                }
                break;
            case 'fishbone':
                // Fishbone stitch - V-shaped pattern
                for (let i = 0; i < points.length - 2; i += 2) {
                    const center = points[i];
                    const left = points[i + 1];
                    const right = points[i + 2];
                    if (left && right) {
                        // Left branch
                        ctx.beginPath();
                        ctx.moveTo(center.x, center.y);
                        ctx.lineTo(left.x, left.y);
                        ctx.stroke();
                        // Right branch
                        ctx.beginPath();
                        ctx.moveTo(center.x, center.y);
                        ctx.lineTo(right.x, right.y);
                        ctx.stroke();
                        // Center line
                        ctx.beginPath();
                        ctx.moveTo(center.x, center.y);
                        ctx.lineTo(center.x, center.y + stitch.thickness * 2);
                        ctx.stroke();
                    }
                }
                break;
            case 'herringbone':
                // Herringbone stitch - chevron pattern
                for (let i = 0; i < points.length - 3; i += 2) {
                    const start = points[i];
                    const peak = points[i + 1];
                    const end = points[i + 2];
                    if (peak && end) {
                        // Create chevron pattern
                        ctx.beginPath();
                        ctx.moveTo(start.x, start.y);
                        ctx.lineTo(peak.x, peak.y);
                        ctx.lineTo(end.x, end.y);
                        ctx.stroke();
                        // Add parallel line for herringbone effect
                        const offset = stitch.thickness * 0.5;
                        ctx.beginPath();
                        ctx.moveTo(start.x + offset, start.y);
                        ctx.lineTo(peak.x + offset, peak.y);
                        ctx.lineTo(end.x + offset, end.y);
                        ctx.stroke();
                    }
                }
                break;
            case 'long-short':
                // Long-short stitch - alternating length pattern
                for (let i = 0; i < points.length - 1; i++) {
                    const start = points[i];
                    const end = points[i + 1];
                    const isLong = i % 2 === 0;
                    const length = isLong ? stitch.thickness * 3 : stitch.thickness * 1.5;
                    const angle = Math.atan2(end.y - start.y, end.x - start.x);
                    const actualEnd = {
                        x: start.x + Math.cos(angle) * length,
                        y: start.y + Math.sin(angle) * length
                    };
                    ctx.beginPath();
                    ctx.moveTo(start.x, start.y);
                    ctx.lineTo(actualEnd.x, actualEnd.y);
                    ctx.stroke();
                }
                break;
            case 'split':
                // Split stitch - overlapping pattern
                for (let i = 0; i < points.length - 1; i++) {
                    const start = points[i];
                    const end = points[i + 1];
                    const midX = (start.x + end.x) / 2;
                    const midY = (start.y + end.y) / 2;
                    // First half
                    ctx.beginPath();
                    ctx.moveTo(start.x, start.y);
                    ctx.lineTo(midX, midY);
                    ctx.stroke();
                    // Second half with slight offset
                    const offset = stitch.thickness * 0.3;
                    ctx.beginPath();
                    ctx.moveTo(midX + offset, midY + offset);
                    ctx.lineTo(end.x, end.y);
                    ctx.stroke();
                }
                break;
            case 'appliqué':
                // Appliqué stitch - decorative edge stitching
                for (let i = 0; i < points.length - 1; i++) {
                    const start = points[i];
                    const end = points[i + 1];
                    // Draw decorative zigzag pattern
                    const midX = (start.x + end.x) / 2;
                    const midY = (start.y + end.y) / 2;
                    const offset = stitch.thickness * 0.5;
                    ctx.beginPath();
                    ctx.moveTo(start.x, start.y);
                    ctx.lineTo(midX + offset, midY - offset);
                    ctx.lineTo(end.x, end.y);
                    ctx.stroke();
                    // Add decorative dots
                    ctx.fillStyle = stitch.color;
                    ctx.beginPath();
                    ctx.arc(midX + offset, midY - offset, stitch.thickness * 0.2, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
            case 'satin-ribbon':
                // Satin ribbon stitch - wide satin with ribbon effect
                for (let i = 1; i < points.length; i++) {
                    const prev = points[i - 1];
                    const curr = points[i];
                    const next = points[i + 1];
                    if (next) {
                        const cp1x = prev.x + (curr.x - prev.x) / 3;
                        const cp1y = prev.y + (curr.y - prev.y) / 3;
                        const cp2x = curr.x - (next.x - curr.x) / 3;
                        const cp2y = curr.y - (next.y - curr.y) / 3;
                        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
                    }
                    else {
                        ctx.lineTo(curr.x, curr.y);
                    }
                }
                ctx.stroke();
                // Add ribbon-like highlights
                ctx.strokeStyle = adjustBrightness(stitch.color, 40);
                ctx.lineWidth = stitch.thickness * 0.2;
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    const prev = points[i - 1];
                    const curr = points[i];
                    const next = points[i + 1];
                    if (next) {
                        const cp1x = prev.x + (curr.x - prev.x) / 3;
                        const cp1y = prev.y + (curr.y - prev.y) / 3;
                        const cp2x = curr.x - (next.x - curr.x) / 3;
                        const cp2y = curr.y - (next.y - curr.y) / 3;
                        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
                    }
                    else {
                        ctx.lineTo(curr.x, curr.y);
                    }
                }
                ctx.stroke();
                break;
            default:
                console.warn(`⚠️ UNKNOWN STITCH TYPE: ${stitch.type} - Using default line drawing`);
                // Default line drawing for unknown types
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
                console.log(`📏 Drawing default line with ${points.length} points`);
                ctx.stroke();
        }
        // Reset composite operation
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
        console.log(`✅ STITCH RENDERED: ${stitch.type} completed successfully`);
    };
    const getLineIntersections = (points, y) => {
        const intersections = [];
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            if ((p1.y <= y && p2.y >= y) || (p1.y >= y && p2.y <= y)) {
                const x = p1.x + (p2.x - p1.x) * (y - p1.y) / (p2.y - p1.y);
                intersections.push(x);
            }
        }
        return intersections.sort((a, b) => a - b);
    };
    // Helper function to adjust color brightness
    const adjustBrightness = (color, amount) => {
        // Validate input
        if (!color || typeof color !== 'string') {
            console.warn('Invalid color input in EmbroideryTool adjustBrightness:', color);
            return '#ff69b4'; // Default fallback
        }
        // Ensure color starts with #
        const cleanColor = color.startsWith('#') ? color : `#${color}`;
        // Validate hex format (must be 6 characters after #)
        if (cleanColor.length !== 7) {
            console.warn('Invalid hex color format in EmbroideryTool adjustBrightness:', cleanColor);
            return '#ff69b4'; // Default fallback
        }
        // Convert hex to RGB
        const hex = cleanColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        // Validate parsed values
        if (isNaN(r) || isNaN(g) || isNaN(b)) {
            console.warn('Failed to parse hex color in EmbroideryTool adjustBrightness:', cleanColor);
            return '#ff69b4'; // Default fallback
        }
        // CRITICAL FIX: Round all RGB values to integers before hex conversion
        const newR = Math.round(Math.max(0, Math.min(255, r + amount)));
        const newG = Math.round(Math.max(0, Math.min(255, g + amount)));
        const newB = Math.round(Math.max(0, Math.min(255, b + amount)));
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    };
    // Backend integration functions
    const checkBackendConnection = async () => {
        try {
            const health = await embroideryBackend.checkHealth();
            const inkStitchHealth = await embroideryBackend.checkInkStitchHealth();
            setBackendConnected(health);
            setBackendHealth(inkStitchHealth);
            console.log('Backend connection status:', health);
            console.log('InkStitch health:', inkStitchHealth);
        }
        catch (error) {
            console.error('Failed to connect to backend:', error);
            setBackendConnected(false);
            setBackendHealth(null);
        }
    };
    const generateProfessionalStitches = async (stitches) => {
        if (!backendConnected) {
            console.warn('Backend not connected, using local rendering only');
            return;
        }
        try {
            // Convert stitches to backend format
            const backendPoints = embroideryBackend.convertStitchesToBackendFormat(stitches);
            // Create request for professional stitch generation
            const request = {
                points: stitches.flatMap(s => s.points),
                canvas_width: 800,
                canvas_height: 600,
                strategy: 'satin', // Use satin for professional look
                density: stitchDensity,
                width_mm: embroideryThickness * 0.1, // Convert thickness to mm
                passes: 2,
                stitch_len_mm: 2.5,
                mm_per_px: 0.26
            };
            const plan = await embroideryBackend.generateFromPoints(request);
            // Convert back to frontend format and update stitches
            const professionalStitches = embroideryBackend.convertBackendToFrontendFormat(plan);
            setEmbroideryStitches(professionalStitches);
            console.log('Generated professional stitches:', professionalStitches.length);
        }
        catch (error) {
            console.error('Failed to generate professional stitches:', error);
        }
    };
    // AI-Powered Design Features
    const generateAIDesign = async (description) => {
        if (!aiDesignMode)
            return;
        try {
            const response = await fetch('http://localhost:8000/ai/generate-design', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description,
                    fabricType,
                    stitchComplexity,
                    threadCategory: selectedThreadCategory
                })
            });
            const aiDesign = await response.json();
            setSmartSuggestions(aiDesign.suggestions || []);
            // Apply AI-generated stitches
            if (aiDesign.stitches) {
                setEmbroideryStitches(aiDesign.stitches);
            }
        }
        catch (error) {
            console.error('AI design generation failed:', error);
        }
    };
    const optimizeStitchPath = async () => {
        if (!mlOptimization)
            return;
        try {
            const response = await fetch('http://localhost:8000/ai/optimize-path', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stitches: embroideryStitches,
                    fabricPhysics,
                    optimizationType: 'efficiency'
                })
            });
            const optimized = await response.json();
            setEmbroideryStitches(optimized.stitches);
        }
        catch (error) {
            console.error('Path optimization failed:', error);
        }
    };
    const suggestThreadColors = async () => {
        try {
            const response = await fetch('http://localhost:8000/ai/suggest-colors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentStitches: embroideryStitches,
                    fabricType,
                    designStyle: 'professional'
                })
            });
            const suggestions = await response.json();
            setSmartSuggestions(suggestions.colors || []);
        }
        catch (error) {
            console.error('Color suggestion failed:', error);
        }
    };
    const enableRealTimeCollaboration = () => {
        setRealTimeCollaboration(true);
        // Initialize WebSocket connection for real-time collaboration
        const ws = new WebSocket('ws://localhost:8000/collaborate');
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'stitch_update') {
                setEmbroideryStitches(data.stitches);
            }
            else if (data.type === 'collaborator_joined') {
                setCollaborators(prev => [...prev, data.collaborator]);
            }
        };
    };
    const enableARVRMode = () => {
        setArVrMode(true);
        // Initialize AR/VR capabilities
        if (navigator.xr) {
            navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
                if (supported) {
                    console.log('VR mode available');
                }
            });
        }
    };
    const addDesignLayer = (layerName) => {
        // Save current state before adding layer
        saveToUndoStack('add_layer');
        const newLayer = {
            id: Date.now(),
            name: layerName,
            stitches: [],
            visible: true,
            locked: false
        };
        setDesignLayers(prev => [...prev, newLayer]);
    };
    const removeDesignLayer = (layerId) => {
        // Save current state before removing layer
        saveToUndoStack('remove_layer');
        setDesignLayers(prev => prev.filter(layer => layer.id !== layerId));
        // Adjust current layer if needed
        if (currentLayer >= designLayers.length - 1) {
            setCurrentLayer(Math.max(0, designLayers.length - 2));
        }
    };
    const toggleLayerVisibility = (layerId) => {
        // Save current state before toggling visibility
        saveToUndoStack('toggle_layer_visibility');
        setDesignLayers(prev => prev.map(layer => layer.id === layerId ? { ...layer, visible: !layer.visible } : layer));
    };
    const toggleLayerLock = (layerId) => {
        // Save current state before toggling lock
        saveToUndoStack('toggle_layer_lock');
        setDesignLayers(prev => prev.map(layer => layer.id === layerId ? { ...layer, locked: !layer.locked } : layer));
    };
    const renameLayer = (layerId, newName) => {
        // Save current state before renaming
        saveToUndoStack('rename_layer');
        setDesignLayers(prev => prev.map(layer => layer.id === layerId ? { ...layer, name: newName } : layer));
    };
    // Helper function to save current state to undo stack
    const saveToUndoStack = (action = 'action') => {
        setUndoStack(prev => [...prev, {
                stitches: [...embroideryStitches],
                layers: [...designLayers],
                currentLayer: currentLayer,
                action: action,
                timestamp: Date.now()
            }]);
        // Clear redo stack when new action is performed
        setRedoStack([]);
        console.log(`💾 SAVED TO UNDO STACK: ${action} (${embroideryStitches.length} stitches, ${designLayers.length} layers)`);
    };
    const undoAction = () => {
        if (undoStack.length > 0) {
            const lastState = undoStack[undoStack.length - 1];
            setRedoStack(prev => [...prev, {
                    stitches: embroideryStitches,
                    layers: designLayers,
                    currentLayer: currentLayer
                }]);
            // Restore state
            if (lastState.stitches !== undefined) {
                setEmbroideryStitches(lastState.stitches);
            }
            if (lastState.layers !== undefined) {
                setDesignLayers(lastState.layers);
            }
            if (lastState.currentLayer !== undefined) {
                setCurrentLayer(lastState.currentLayer);
            }
            setUndoStack(prev => prev.slice(0, -1));
            console.log('↶ UNDO: Restored previous state');
        }
    };
    const redoAction = () => {
        if (redoStack.length > 0) {
            const nextState = redoStack[redoStack.length - 1];
            setUndoStack(prev => [...prev, {
                    stitches: embroideryStitches,
                    layers: designLayers,
                    currentLayer: currentLayer
                }]);
            // Restore state
            if (nextState.stitches !== undefined) {
                setEmbroideryStitches(nextState.stitches);
            }
            if (nextState.layers !== undefined) {
                setDesignLayers(nextState.layers);
            }
            if (nextState.currentLayer !== undefined) {
                setCurrentLayer(nextState.currentLayer);
            }
            setRedoStack(prev => prev.slice(0, -1));
            console.log('🔄 REDO: Restored next state');
        }
    };
    // Keyboard shortcuts for undo/redo
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Check if Ctrl (or Cmd on Mac) is pressed
            const isCtrlPressed = event.ctrlKey || event.metaKey;
            if (isCtrlPressed) {
                switch (event.key.toLowerCase()) {
                    case 'z':
                        event.preventDefault();
                        if (event.shiftKey) {
                            // Ctrl+Shift+Z for redo
                            console.log('🔄 REDO ACTION triggered via Ctrl+Shift+Z', { redoStackLength: redoStack.length });
                            redoAction();
                        }
                        else {
                            // Ctrl+Z for undo
                            console.log('↶ UNDO ACTION triggered via Ctrl+Z', { undoStackLength: undoStack.length });
                            undoAction();
                        }
                        break;
                    case 'y':
                        event.preventDefault();
                        // Ctrl+Y for redo
                        console.log('🔄 REDO ACTION triggered via Ctrl+Y', { redoStackLength: redoStack.length });
                        redoAction();
                        break;
                }
            }
        };
        // Add event listener
        document.addEventListener('keydown', handleKeyDown);
        // Cleanup
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [undoStack, redoStack, embroideryStitches, designLayers, currentLayer, undoAction, redoAction]);
    const enhanceStitchQuality = () => {
        // Save current state before enhancing quality
        saveToUndoStack('enhance_quality');
        // Enhance stitch quality based on fabric type and thread texture
        const enhancedStitches = embroideryStitches.map(stitch => {
            let enhancedStitch = { ...stitch };
            // Adjust thickness based on fabric type
            if (fabricType === 'silk') {
                enhancedStitch.thickness = stitch.thickness * 0.8; // Thinner for silk
            }
            else if (fabricType === 'denim') {
                enhancedStitch.thickness = stitch.thickness * 1.2; // Thicker for denim
            }
            else if (fabricType === 'linen') {
                enhancedStitch.thickness = stitch.thickness * 1.1; // Slightly thicker for linen
            }
            // Adjust opacity based on thread texture
            if (threadTexture === 'metallic') {
                enhancedStitch.opacity = Math.min(1.0, stitch.opacity * 1.2);
            }
            else if (threadTexture === 'matte') {
                enhancedStitch.opacity = stitch.opacity * 0.9;
            }
            return enhancedStitch;
        });
        setEmbroideryStitches(enhancedStitches);
        drawStitches();
    };
    const optimizeForFabric = () => {
        // Save current state before fabric optimization
        saveToUndoStack('fabric_optimize');
        // Optimize stitches for specific fabric characteristics
        const optimizedStitches = embroideryStitches.map(stitch => {
            let optimizedStitch = { ...stitch };
            // Adjust stitch density based on fabric
            if (fabricType === 'cotton') {
                // Cotton can handle dense stitching
                optimizedStitch.thickness = stitch.thickness * stitchDensity;
            }
            else if (fabricType === 'silk') {
                // Silk needs lighter touch
                optimizedStitch.thickness = stitch.thickness * stitchDensity * 0.7;
            }
            else if (fabricType === 'denim') {
                // Denim can handle heavy stitching
                optimizedStitch.thickness = stitch.thickness * stitchDensity * 1.3;
            }
            return optimizedStitch;
        });
        setEmbroideryStitches(optimizedStitches);
        drawStitches();
    };
    const exportEmbroideryFile = async () => {
        if (!backendConnected) {
            alert('Backend service not available. Please start the AI service.');
            return;
        }
        if (embroideryStitches.length === 0) {
            alert('No stitches to export. Please create some embroidery first.');
            return;
        }
        setIsExporting(true);
        try {
            const backendPoints = embroideryBackend.convertStitchesToBackendFormat(embroideryStitches);
            const exportData = await embroideryBackend.exportFromPoints(backendPoints, exportFormat);
            embroideryBackend.downloadFile(exportData);
            console.log(`Exported embroidery file: ${exportData.filename}`);
        }
        catch (error) {
            console.error('Failed to export embroidery file:', error);
            alert('Failed to export embroidery file. Please try again.');
        }
        finally {
            setIsExporting(false);
        }
    };
    const importEmbroideryFile = async (file) => {
        if (!backendConnected) {
            alert('Backend service not available. Please start the AI service.');
            return;
        }
        // Save current state before importing
        saveToUndoStack('import_file');
        try {
            const plan = await embroideryBackend.parseMachineFile(file);
            const importedStitches = embroideryBackend.convertBackendToFrontendFormat(plan);
            setEmbroideryStitches(importedStitches);
            console.log('Imported embroidery file:', importedStitches.length, 'stitches');
        }
        catch (error) {
            console.error('Failed to import embroidery file:', error);
            alert('Failed to import embroidery file. Please check the file format.');
        }
    };
    // Handle mouse events
    // Mouse events are handled by the main canvas, not this tool panel
    // Enhanced AI pattern generation
    const generateAIPattern = async () => {
        if (!embroideryPatternDescription.trim()) {
            console.warn('⚠️ No pattern description provided');
            return;
        }
        if (!aiSystem) {
            console.warn('⚠️ AI System not initialized');
            return;
        }
        // Save current state before generating pattern
        saveToUndoStack('generate_pattern');
        console.log('🤖 ADVANCED AI GENERATING PATTERN:', embroideryPatternDescription);
        setIsAiGenerating(true);
        setAiConfidence(0);
        try {
            // Create AI pattern request
            const aiRequest = {
                description: embroideryPatternDescription,
                style: 'realistic',
                complexity: stitchDensity > 1.5 ? 'complex' : stitchDensity > 1.0 ? 'medium' : 'simple',
                colors: [embroideryColor, ...threadPalette.slice(0, 3)],
                stitchTypes: [embroideryStitchType],
                size: { width: 200, height: 200 },
                constraints: {
                    maxStitches: 1000,
                    maxColors: 8,
                    threadTypes: [embroideryThreadType]
                }
            };
            // Generate pattern with AI
            const aiResponse = await aiSystem.generatePattern(aiRequest);
            if (aiResponse.patterns && aiResponse.patterns.length > 0) {
                console.log(`✅ AI PATTERN GENERATED: ${aiResponse.patterns.length} patterns`);
                console.log(`🎯 AI Confidence: ${(aiResponse.metadata.confidence * 100).toFixed(1)}%`);
                setAiPatterns(aiResponse.patterns);
                setAiSuggestions(aiResponse.suggestions);
                setAiConfidence(aiResponse.metadata.confidence);
                // Convert AI patterns to embroidery stitches
                const embroideryStitches = convertAIPatternsToStitches(aiResponse.patterns[0]);
                if (embroideryStitches.length > 0) {
                    setEmbroideryStitches(embroideryStitches);
                    // Apply advanced rendering if WebGL is enabled
                    if (advancedEngineRef.current && enableWebGL) {
                        console.log('🎨 Rendering with advanced WebGL engine...');
                        await advancedEngineRef.current.renderPattern(embroideryStitches);
                    }
                    else {
                        drawStitches();
                    }
                }
            }
            else {
                console.warn('⚠️ AI pattern generation produced no patterns');
            }
        }
        catch (error) {
            simpleErrorHandler.handleError(error, 'EmbroideryTool', 'HIGH');
            setLastError(`AI pattern generation failed: ${error.message}`);
            setErrorCount(prev => prev + 1);
            console.error('❌ Error generating AI pattern:', error);
        }
        finally {
            setIsAiGenerating(false);
        }
    };
    // Convert AI patterns to embroidery stitches
    const convertAIPatternsToStitches = (pattern) => {
        if (!pattern.stitches)
            return [];
        return pattern.stitches.map((aiStitch) => ({
            id: aiStitch.id,
            type: aiStitch.type,
            points: aiStitch.points.map((p) => ({ x: p.x, y: p.y })),
            color: aiStitch.color,
            threadType: aiStitch.threadType,
            thickness: aiStitch.thickness,
            opacity: aiStitch.opacity,
            layer: aiStitch.layer,
            createdAt: Date.now(),
            updatedAt: Date.now()
        }));
    };
    // Generate pattern with AI (legacy function for compatibility)
    const generatePattern = async () => {
        await generateAIPattern();
    };
    // Generate ultra-realistic satin stitch
    const generateUltraRealisticSatin = useCallback(() => {
        console.log('🌟 Generating ultra-realistic satin stitch...');
        try {
            // Create sample geometry for satin stitch
            const geometry = {
                rails: [
                    { x: 100, y: 100, z: 0 },
                    { x: 200, y: 100, z: 0 }
                ],
                rungs: [
                    { x: 150, y: 100, z: 0 },
                    { x: 150, y: 120, z: 0 },
                    { x: 150, y: 140, z: 0 },
                    { x: 150, y: 160, z: 0 },
                    { x: 150, y: 180, z: 0 }
                ],
                width: 100,
                length: 80,
                angle: 0
            };
            // Generate ultra-realistic satin stitches
            const satinStitches = UltraRealisticSatinStitch.generateUltraRealisticSatin(geometry, satinMaterial, satinLighting, satin3DProperties);
            console.log(`✅ Generated ${satinStitches.length} ultra-realistic satin stitches`);
            // Update stitches
            setEmbroideryStitches(prev => [...prev, ...satinStitches]);
        }
        catch (error) {
            console.error('❌ Error generating ultra-realistic satin:', error);
        }
    }, [satinMaterial, satinLighting, satin3DProperties]);
    const generateUltraRealisticFill = useCallback(() => {
        console.log('🎨 Generating ultra-realistic fill stitch...');
        try {
            // Create sample geometry for fill stitch
            const geometry = {
                path: [
                    { x: 100, y: 100, z: 0 },
                    { x: 200, y: 100, z: 0 },
                    { x: 200, y: 200, z: 0 },
                    { x: 100, y: 200, z: 0 },
                    { x: 100, y: 100, z: 0 }
                ],
                width: 100,
                length: 100,
                bounds: { minX: 100, minY: 100, maxX: 200, maxY: 200 },
                isClosed: true
            };
            // Generate ultra-realistic fill stitches
            const fillStitches = UltraRealisticFillStitch.generateUltraRealisticFill(geometry, fillMaterial, fillLighting, fill3DProperties);
            console.log(`✅ Generated ${fillStitches.length} ultra-realistic fill stitches`);
            // Update stitches
            setEmbroideryStitches(prev => [...prev, ...fillStitches]);
        }
        catch (error) {
            console.error('❌ Error generating ultra-realistic fill:', error);
        }
    }, [fillMaterial, fillLighting, fill3DProperties]);
    const generateUltraRealisticCrossStitch = useCallback(() => {
        console.log('❌ Generating ultra-realistic cross-stitch...');
        try {
            // Create sample geometry for cross-stitch
            const geometry = {
                path: [
                    { x: 100, y: 100, z: 0 },
                    { x: 150, y: 100, z: 0 },
                    { x: 150, y: 150, z: 0 },
                    { x: 100, y: 150, z: 0 }
                ],
                width: 50,
                length: 50,
                bounds: { minX: 100, minY: 100, maxX: 150, maxY: 150 },
                isClosed: true
            };
            // Generate ultra-realistic cross-stitches
            const crossStitches = UltraRealisticCrossStitch.generateUltraRealisticCrossStitch(geometry, crossStitchMaterial, crossStitchLighting, crossStitch3DProperties);
            console.log(`✅ Generated ${crossStitches.length} ultra-realistic cross-stitches`);
            // Update stitches
            setEmbroideryStitches(prev => [...prev, ...crossStitches]);
        }
        catch (error) {
            console.error('❌ Error generating ultra-realistic cross-stitch:', error);
        }
    }, [crossStitchMaterial, crossStitchLighting, crossStitch3DProperties]);
    const generateUltraRealisticOutline = useCallback(() => {
        console.log('📏 Generating ultra-realistic outline stitch...');
        try {
            // Create sample geometry for outline stitch
            const geometry = {
                path: [
                    { x: 100, y: 100, z: 0 },
                    { x: 200, y: 100, z: 0 },
                    { x: 200, y: 200, z: 0 },
                    { x: 100, y: 200, z: 0 }
                ],
                width: 100,
                length: 100,
                bounds: { minX: 100, minY: 100, maxX: 200, maxY: 200 },
                isClosed: false
            };
            const pattern = {
                type: 'running',
                direction: 'forward',
                density: 2.0,
                complexity: 5,
                symmetry: true,
                curveHandling: 'smooth'
            };
            // Generate ultra-realistic outline stitches
            const outlineStitches = UltraRealisticOutlineStitch.generateUltraRealisticOutline(geometry, pattern, outlineMaterial, outlineLighting, outline3DProperties);
            console.log(`✅ Generated ${outlineStitches.length} ultra-realistic outline stitches`);
            // Update stitches
            setEmbroideryStitches(prev => [...prev, ...outlineStitches]);
        }
        catch (error) {
            console.error('❌ Error generating ultra-realistic outline:', error);
        }
    }, [outlineMaterial, outlineLighting, outline3DProperties]);
    const generateUltraRealisticChain = useCallback(() => {
        console.log('🔗 Generating ultra-realistic chain stitch...');
        try {
            // Create sample geometry for chain stitch
            const geometry = {
                path: [
                    { x: 100, y: 100, z: 0 },
                    { x: 200, y: 100, z: 0 },
                    { x: 200, y: 200, z: 0 },
                    { x: 100, y: 200, z: 0 }
                ],
                width: 100,
                length: 100,
                bounds: { minX: 100, minY: 100, maxX: 200, maxY: 200 },
                isClosed: false
            };
            const pattern = {
                type: 'single',
                direction: 'forward',
                density: 2.0,
                complexity: 5,
                symmetry: true,
                curveHandling: 'smooth'
            };
            // Generate ultra-realistic chain stitches
            const chainStitches = UltraRealisticChainStitch.generateUltraRealisticChain(geometry, pattern, chainMaterial, chainLighting, chain3DProperties);
            console.log(`✅ Generated ${chainStitches.length} ultra-realistic chain stitches`);
            // Update stitches
            setEmbroideryStitches(prev => [...prev, ...chainStitches]);
        }
        catch (error) {
            console.error('❌ Error generating ultra-realistic chain:', error);
        }
    }, [chainMaterial, chainLighting, chain3DProperties]);
    // Generate ultra-realistic backstitch
    const generateUltraRealisticBackstitch = useCallback(() => {
        console.log('↩️ Generating ultra-realistic backstitch...');
        try {
            const geometry = {
                path: [
                    { x: 100, y: 100, z: 0 },
                    { x: 150, y: 100, z: 0 },
                    { x: 200, y: 100, z: 0 },
                    { x: 200, y: 150, z: 0 },
                    { x: 200, y: 200, z: 0 }
                ],
                width: 50,
                length: 100,
                bounds: { minX: 100, minY: 100, maxX: 200, maxY: 200 },
                isClosed: false
            };
            const pattern = {
                type: 'single',
                direction: 'forward',
                density: 6,
                complexity: 5,
                symmetry: true,
                curveHandling: 'smooth'
            };
            const backstitches = UltraRealisticBackstitch.generateUltraRealisticBackstitch(geometry, pattern, backstitchMaterial, backstitchLighting, backstitch3DProperties);
            setEmbroideryStitches(prev => [...prev, ...backstitches]);
        }
        catch (error) {
            console.error('❌ Error generating ultra-realistic backstitch:', error);
        }
    }, [backstitchMaterial, backstitchLighting, backstitch3DProperties]);
    // Generate ultra-realistic French knot
    const generateUltraRealisticFrenchKnot = useCallback(() => {
        console.log('🎯 Generating ultra-realistic French knot...');
        try {
            const geometry = {
                position: { x: 150, y: 150, z: 0 },
                size: 8,
                bounds: { minX: 142, minY: 142, maxX: 158, maxY: 158 },
                knotCount: 1
            };
            const pattern = {
                type: 'single',
                direction: 'clockwise',
                density: 10,
                complexity: 8,
                symmetry: true,
                spacing: 2
            };
            const frenchKnots = UltraRealisticFrenchKnot.generateUltraRealisticFrenchKnot(geometry, pattern, frenchKnotMaterial, frenchKnotLighting, frenchKnot3DProperties);
            setEmbroideryStitches(prev => [...prev, ...frenchKnots]);
        }
        catch (error) {
            console.error('❌ Error generating ultra-realistic French knot:', error);
        }
    }, [frenchKnotMaterial, frenchKnotLighting, frenchKnot3DProperties]);
    // Generate ultra-realistic bullion
    const generateUltraRealisticBullion = useCallback(() => {
        console.log('🌀 Generating ultra-realistic bullion...');
        try {
            const geometry = {
                path: [
                    { x: 100, y: 100, z: 0 },
                    { x: 200, y: 100, z: 0 }
                ],
                width: 20,
                length: 100,
                bounds: { minX: 100, minY: 100, maxX: 200, maxY: 100 },
                isClosed: false
            };
            const pattern = {
                type: 'single',
                direction: 'forward',
                density: 8,
                complexity: 6,
                symmetry: true,
                curveHandling: 'smooth'
            };
            const bullions = UltraRealisticBullion.generateUltraRealisticBullion(geometry, pattern, bullionMaterial, bullionLighting, bullion3DProperties);
            setEmbroideryStitches(prev => [...prev, ...bullions]);
        }
        catch (error) {
            console.error('❌ Error generating ultra-realistic bullion:', error);
        }
    }, [bullionMaterial, bullionLighting, bullion3DProperties]);
    // Generate ultra-realistic lazy daisy
    const generateUltraRealisticLazyDaisy = useCallback(() => {
        console.log('🌸 Generating ultra-realistic lazy daisy...');
        try {
            const geometry = {
                position: { x: 150, y: 150, z: 0 },
                size: 20,
                bounds: { minX: 130, minY: 130, maxX: 170, maxY: 170 },
                petalCount: 5,
                petalAngle: 0
            };
            const pattern = {
                type: 'single',
                direction: 'clockwise',
                density: 7,
                complexity: 6,
                symmetry: true,
                spacing: 3
            };
            const lazyDaisies = UltraRealisticLazyDaisy.generateUltraRealisticLazyDaisy(geometry, pattern, lazyDaisyMaterial, lazyDaisyLighting, lazyDaisy3DProperties);
            setEmbroideryStitches(prev => [...prev, ...lazyDaisies]);
        }
        catch (error) {
            console.error('❌ Error generating ultra-realistic lazy daisy:', error);
        }
    }, [lazyDaisyMaterial, lazyDaisyLighting, lazyDaisy3DProperties]);
    // Generate ultra-realistic feather
    const generateUltraRealisticFeather = useCallback(() => {
        console.log('🪶 Generating ultra-realistic feather...');
        try {
            const geometry = {
                path: [
                    { x: 100, y: 100, z: 0 },
                    { x: 200, y: 100, z: 0 }
                ],
                width: 30,
                length: 100,
                bounds: { minX: 100, minY: 100, maxX: 200, maxY: 100 },
                isClosed: false
            };
            const pattern = {
                type: 'single',
                direction: 'forward',
                density: 5,
                complexity: 5,
                symmetry: true,
                curveHandling: 'smooth'
            };
            const feathers = UltraRealisticFeather.generateUltraRealisticFeather(geometry, pattern, featherMaterial, featherLighting, feather3DProperties);
            setEmbroideryStitches(prev => [...prev, ...feathers]);
        }
        catch (error) {
            console.error('❌ Error generating ultra-realistic feather:', error);
        }
    }, [featherMaterial, featherLighting, feather3DProperties]);
    // AI Pattern Generation Function (Keyword-based)
    const generateKeywordPattern = (description, stitchType, color) => {
        console.log('🧠 AI PATTERN GENERATOR:', { description, stitchType, color });
        const patterns = [];
        const description_lower = description.toLowerCase();
        // Generate patterns based on description keywords
        if (description_lower.includes('flower') || description_lower.includes('rose')) {
            patterns.push(...generateFlowerPattern(stitchType, color));
        }
        else if (description_lower.includes('heart')) {
            patterns.push(...generateHeartPattern(stitchType, color));
        }
        else if (description_lower.includes('star')) {
            patterns.push(...generateStarPattern(stitchType, color));
        }
        else if (description_lower.includes('circle') || description_lower.includes('round')) {
            patterns.push(...generateCirclePattern(stitchType, color));
        }
        else if (description_lower.includes('square') || description_lower.includes('rectangle')) {
            patterns.push(...generateSquarePattern(stitchType, color));
        }
        else if (description_lower.includes('line') || description_lower.includes('straight')) {
            patterns.push(...generateLinePattern(stitchType, color));
        }
        else {
            // Default abstract pattern
            patterns.push(...generateAbstractPattern(stitchType, color));
        }
        return patterns;
    };
    // Pattern generation helpers
    const generateFlowerPattern = (stitchType, color) => {
        const patterns = [];
        const centerX = 0.5;
        const centerY = 0.5;
        const radius = 0.1;
        // Center
        patterns.push({
            id: `ai_flower_center_${Date.now()}`,
            type: stitchType,
            points: [
                { x: centerX, y: centerY },
                { x: centerX + radius * 0.3, y: centerY + radius * 0.3 }
            ],
            color: color,
            threadType: embroideryThreadType,
            thickness: embroideryThickness,
            opacity: embroideryOpacity
        });
        // Petals
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            const petalX = centerX + Math.cos(angle) * radius;
            const petalY = centerY + Math.sin(angle) * radius;
            patterns.push({
                id: `ai_flower_petal_${i}_${Date.now()}`,
                type: stitchType,
                points: [
                    { x: centerX, y: centerY },
                    { x: petalX, y: petalY }
                ],
                color: color,
                threadType: embroideryThreadType,
                thickness: embroideryThickness * 0.8,
                opacity: embroideryOpacity
            });
        }
        return patterns;
    };
    const generateHeartPattern = (stitchType, color) => {
        const patterns = [];
        const centerX = 0.5;
        const centerY = 0.5;
        const size = 0.15;
        // Heart shape points
        const heartPoints = [
            { x: centerX, y: centerY + size * 0.3 },
            { x: centerX - size * 0.5, y: centerY - size * 0.2 },
            { x: centerX - size * 0.2, y: centerY - size * 0.4 },
            { x: centerX, y: centerY - size * 0.3 },
            { x: centerX + size * 0.2, y: centerY - size * 0.4 },
            { x: centerX + size * 0.5, y: centerY - size * 0.2 },
            { x: centerX, y: centerY + size * 0.3 }
        ];
        patterns.push({
            id: `ai_heart_${Date.now()}`,
            type: stitchType,
            points: heartPoints,
            color: color,
            threadType: embroideryThreadType,
            thickness: embroideryThickness,
            opacity: embroideryOpacity
        });
        return patterns;
    };
    const generateStarPattern = (stitchType, color) => {
        const patterns = [];
        const centerX = 0.5;
        const centerY = 0.5;
        const radius = 0.12;
        // 5-pointed star
        const starPoints = [];
        for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI) / 5;
            const r = i % 2 === 0 ? radius : radius * 0.4;
            starPoints.push({
                x: centerX + Math.cos(angle) * r,
                y: centerY + Math.sin(angle) * r
            });
        }
        patterns.push({
            id: `ai_star_${Date.now()}`,
            type: stitchType,
            points: starPoints,
            color: color,
            threadType: embroideryThreadType,
            thickness: embroideryThickness,
            opacity: embroideryOpacity
        });
        return patterns;
    };
    const generateCirclePattern = (stitchType, color) => {
        const patterns = [];
        const centerX = 0.5;
        const centerY = 0.5;
        const radius = 0.1;
        const points = 16;
        const circlePoints = [];
        for (let i = 0; i <= points; i++) {
            const angle = (i * Math.PI * 2) / points;
            circlePoints.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
            });
        }
        patterns.push({
            id: `ai_circle_${Date.now()}`,
            type: stitchType,
            points: circlePoints,
            color: color,
            threadType: embroideryThreadType,
            thickness: embroideryThickness,
            opacity: embroideryOpacity
        });
        return patterns;
    };
    const generateSquarePattern = (stitchType, color) => {
        const patterns = [];
        const centerX = 0.5;
        const centerY = 0.5;
        const size = 0.12;
        const squarePoints = [
            { x: centerX - size, y: centerY - size },
            { x: centerX + size, y: centerY - size },
            { x: centerX + size, y: centerY + size },
            { x: centerX - size, y: centerY + size },
            { x: centerX - size, y: centerY - size }
        ];
        patterns.push({
            id: `ai_square_${Date.now()}`,
            type: stitchType,
            points: squarePoints,
            color: color,
            threadType: embroideryThreadType,
            thickness: embroideryThickness,
            opacity: embroideryOpacity
        });
        return patterns;
    };
    const generateLinePattern = (stitchType, color) => {
        const patterns = [];
        patterns.push({
            id: `ai_line_${Date.now()}`,
            type: stitchType,
            points: [
                { x: 0.3, y: 0.5 },
                { x: 0.7, y: 0.5 }
            ],
            color: color,
            threadType: embroideryThreadType,
            thickness: embroideryThickness,
            opacity: embroideryOpacity
        });
        return patterns;
    };
    const generateAbstractPattern = (stitchType, color) => {
        const patterns = [];
        const centerX = 0.5;
        const centerY = 0.5;
        // Random abstract pattern
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            const radius = 0.08 + Math.random() * 0.04;
            const endX = centerX + Math.cos(angle) * radius;
            const endY = centerY + Math.sin(angle) * radius;
            patterns.push({
                id: `ai_abstract_${i}_${Date.now()}`,
                type: stitchType,
                points: [
                    { x: centerX, y: centerY },
                    { x: endX, y: endY }
                ],
                color: color,
                threadType: embroideryThreadType,
                thickness: embroideryThickness * (0.8 + Math.random() * 0.4),
                opacity: embroideryOpacity
            });
        }
        return patterns;
    };
    // ML Optimization Function
    const optimizeWithML = async () => {
        if (embroideryStitches.length === 0) {
            console.warn('⚠️ No stitches to optimize');
            return;
        }
        // Save current state before ML optimization
        saveToUndoStack('ml_optimize');
        console.log('🤖 ML OPTIMIZING STITCHES:', embroideryStitches.length);
        setIsOptimizing(true);
        try {
            // Simulate ML optimization
            const optimizedStitches = optimizeStitchPathML(embroideryStitches);
            if (optimizedStitches && optimizedStitches.length > 0) {
                console.log(`✅ ML OPTIMIZED ${optimizedStitches.length} stitches`);
                setEmbroideryStitches(optimizedStitches);
                drawStitches();
            }
            else {
                console.warn('⚠️ ML optimization produced no stitches');
            }
        }
        catch (error) {
            console.error('❌ Error optimizing with ML:', error);
        }
        finally {
            setIsOptimizing(false);
        }
    };
    // ML Optimization Algorithm
    const optimizeStitchPathML = (stitches) => {
        console.log('🧠 ML OPTIMIZER:', { stitchCount: stitches.length });
        // Sort stitches by distance to minimize thread jumps
        const optimized = [...stitches].sort((a, b) => {
            if (a.points.length === 0 || b.points.length === 0)
                return 0;
            const aEnd = a.points[a.points.length - 1];
            const bEnd = b.points[b.points.length - 1];
            // Simple distance-based sorting
            const aDistance = Math.sqrt(aEnd.x ** 2 + aEnd.y ** 2);
            const bDistance = Math.sqrt(bEnd.x ** 2 + bEnd.y ** 2);
            return aDistance - bDistance;
        });
        // Add optimization metadata
        optimized.forEach((stitch, index) => {
            stitch.id = `optimized_${index}_${stitch.id}`;
        });
        console.log(`🔧 ML OPTIMIZATION COMPLETE: Reordered ${optimized.length} stitches`);
        return optimized;
    };
    // Analyze pattern with AI
    const analyzePattern = async () => {
        if (embroideryStitches.length === 0)
            return;
        try {
            const analysis = await embroideryAI.analyzePattern(embroideryStitches, { width: 400, height: 400 });
            setAiAnalysis(analysis);
            setShowAnalysis(true);
        }
        catch (error) {
            console.error('Error analyzing pattern:', error);
        }
    };
    // Suggest thread colors
    const suggestColors = async () => {
        try {
            const colors = await embroideryAI.suggestThreadColors(embroideryColor);
            // You could show these in a color picker or palette
            // Console log removed
        }
        catch (error) {
            console.error('Error suggesting colors:', error);
        }
    };
    // Clear all stitches
    const clearStitches = () => {
        // Save current state before clearing
        saveToUndoStack('clear_stitches');
        setEmbroideryStitches([]);
        setCurrentStitch(null);
        drawStitches();
        // Clear the composed canvas as well
        if (composedCanvas) {
            const ctx = composedCanvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, composedCanvas.width, composedCanvas.height);
            }
        }
    };
    // Generate consistent stitch points for satin stitch (optimized)
    const generateSatinStitchPoints = (points, density = 0.5) => {
        if (points.length < 2)
            return points;
        const stitchPoints = [];
        const baseSpacing = performanceMode ? 0.015 : 0.008; // Performance mode uses less dense spacing
        const densityMultiplier = performanceMode ? 0.7 + (density * 0.3) : 0.5 + (density * 0.5);
        const stitchSpacing = baseSpacing * densityMultiplier;
        const maxStitchesPerSegment = performanceMode ? 15 : 25; // Performance mode uses fewer stitches
        for (let i = 0; i < points.length - 1; i++) {
            const start = points[i];
            const end = points[i + 1];
            const distance = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
            // Calculate consistent number of stitches
            const numStitches = Math.min(maxStitchesPerSegment, Math.max(2, Math.floor(distance / stitchSpacing)));
            // Generate evenly spaced points
            for (let j = 0; j <= numStitches; j++) {
                const t = j / numStitches;
                stitchPoints.push({
                    x: start.x + (end.x - start.x) * t,
                    y: start.y + (end.y - start.y) * t
                });
            }
        }
        return stitchPoints;
    };
    // Generate parallel satin stitches for realistic fill (optimized)
    const generateSatinFillStitches = (points, density = 0.5) => {
        if (points.length < 3)
            return [points];
        // Calculate bounding box
        const minX = Math.min(...points.map(p => p.x));
        const maxX = Math.max(...points.map(p => p.x));
        const minY = Math.min(...points.map(p => p.y));
        const maxY = Math.max(...points.map(p => p.y));
        const baseSpacing = 0.010; // Balanced spacing for performance and quality
        const densityMultiplier = 0.6 + (density * 0.4); // 0.6 to 1.0 range for balanced density
        const stitchSpacing = baseSpacing * densityMultiplier;
        const stitchLines = [];
        const maxLines = 40; // Reduced for better performance
        const maxPointsPerLine = 20; // Reduced for better performance
        // Determine stitch direction based on user setting and shape
        const width = maxX - minX;
        const height = maxY - minY;
        let isHorizontal = false;
        if (stitchDirection === 'horizontal') {
            isHorizontal = true;
        }
        else if (stitchDirection === 'vertical') {
            isHorizontal = false;
        }
        else if (stitchDirection === 'diagonal') {
            // Use diagonal direction
            const angle = Math.atan2(height, width);
            return generateDiagonalSatinStitches(points, density, angle);
        }
        else if (stitchDirection === 'perpendicular') {
            // Use perpendicular to the main axis
            isHorizontal = height > width;
        }
        else {
            // Default: use shape-based direction
            isHorizontal = width > height;
        }
        if (isHorizontal) {
            // Horizontal satin stitches with consistent spacing
            const totalLines = Math.min(maxLines, Math.floor((maxY - minY) / stitchSpacing));
            for (let i = 0; i < totalLines; i++) {
                const y = minY + (i * (maxY - minY)) / totalLines;
                const intersections = getLineIntersections(points, y);
                for (let j = 0; j < intersections.length; j += 2) {
                    if (intersections[j + 1]) {
                        const startX = intersections[j];
                        const endX = intersections[j + 1];
                        const linePoints = [];
                        const lineLength = endX - startX;
                        const pointsCount = Math.min(maxPointsPerLine, Math.max(3, Math.floor(lineLength / stitchSpacing)));
                        // Generate consistent points along the line
                        for (let k = 0; k <= pointsCount; k++) {
                            const t = k / pointsCount;
                            linePoints.push({
                                x: startX + t * lineLength,
                                y: y
                            });
                        }
                        if (linePoints.length > 1) {
                            stitchLines.push(linePoints);
                        }
                    }
                }
            }
        }
        else {
            // Vertical satin stitches with consistent spacing
            const totalLines = Math.min(maxLines, Math.floor((maxX - minX) / stitchSpacing));
            for (let i = 0; i < totalLines; i++) {
                const x = minX + (i * (maxX - minX)) / totalLines;
                const intersections = getVerticalIntersections(points, x);
                for (let j = 0; j < intersections.length; j += 2) {
                    if (intersections[j + 1]) {
                        const startY = intersections[j];
                        const endY = intersections[j + 1];
                        const linePoints = [];
                        const lineLength = endY - startY;
                        const pointsCount = Math.min(maxPointsPerLine, Math.max(3, Math.floor(lineLength / stitchSpacing)));
                        // Generate consistent points along the line
                        for (let k = 0; k <= pointsCount; k++) {
                            const t = k / pointsCount;
                            linePoints.push({
                                x: x,
                                y: startY + t * lineLength
                            });
                        }
                        if (linePoints.length > 1) {
                            stitchLines.push(linePoints);
                        }
                    }
                }
            }
        }
        return stitchLines;
    };
    // Helper function for vertical line intersections
    const getVerticalIntersections = (points, x) => {
        const intersections = [];
        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            if ((p1.x <= x && p2.x >= x) || (p1.x >= x && p2.x <= x)) {
                if (p1.x !== p2.x) {
                    const t = (x - p1.x) / (p2.x - p1.x);
                    const y = p1.y + t * (p2.y - p1.y);
                    intersections.push(y);
                }
            }
        }
        return intersections.sort((a, b) => a - b);
    };
    // Generate diagonal satin stitches (optimized)
    const generateDiagonalSatinStitches = (points, density, angle) => {
        const stitchLines = [];
        const baseSpacing = 0.012; // Balanced spacing for performance and quality
        const densityMultiplier = 0.6 + (density * 0.4); // 0.6 to 1.0 range for balanced density
        const stitchSpacing = baseSpacing * densityMultiplier;
        const maxLines = 30; // Reduced for better performance
        const maxPointsPerLine = 20; // Reduced for better performance
        // Calculate bounding box
        const minX = Math.min(...points.map(p => p.x));
        const maxX = Math.max(...points.map(p => p.x));
        const minY = Math.min(...points.map(p => p.y));
        const maxY = Math.max(...points.map(p => p.y));
        // Calculate diagonal line parameters
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);
        const diagonalLength = Math.sqrt((maxX - minX) ** 2 + (maxY - minY) ** 2);
        // Generate diagonal lines with limits
        const totalLines = Math.min(maxLines, Math.floor((2 * diagonalLength) / stitchSpacing));
        for (let i = 0; i < totalLines; i++) {
            const offset = -diagonalLength + (i * (2 * diagonalLength)) / totalLines;
            const linePoints = [];
            // Calculate line start and end points
            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;
            const startX = centerX + offset * cosAngle - diagonalLength * sinAngle;
            const startY = centerY + offset * sinAngle + diagonalLength * cosAngle;
            const endX = centerX + offset * cosAngle + diagonalLength * sinAngle;
            const endY = centerY + offset * sinAngle - diagonalLength * cosAngle;
            // Find intersections with shape
            const intersections = getLineIntersectionsAdvanced(points, startY, startX, endX, endY);
            for (let j = 0; j < intersections.length; j += 2) {
                if (intersections[j + 1]) {
                    const t1 = intersections[j];
                    const t2 = intersections[j + 1];
                    const lineLength = t2 - t1;
                    const pointsCount = Math.min(maxPointsPerLine, Math.max(5, Math.floor(lineLength / (stitchSpacing * 0.5))));
                    // Generate consistent points along the diagonal line
                    for (let k = 0; k <= pointsCount; k++) {
                        const t = t1 + (k / pointsCount) * lineLength;
                        const x = startX + t * (endX - startX);
                        const y = startY + t * (endY - startY);
                        linePoints.push({ x, y });
                    }
                }
            }
            if (linePoints.length > 1) {
                stitchLines.push(linePoints);
            }
        }
        return stitchLines;
    };
    // Helper function for line intersections with arbitrary line
    const getLineIntersectionsAdvanced = (points, y, startX, endX, endY) => {
        const intersections = [];
        if (startX !== undefined && endX !== undefined && endY !== undefined) {
            // Diagonal line intersection
            for (let i = 0; i < points.length; i++) {
                const p1 = points[i];
                const p2 = points[(i + 1) % points.length];
                // Check if line segments intersect
                const denom = (endX - startX) * (p2.y - p1.y) - (endY - y) * (p2.x - p1.x);
                if (Math.abs(denom) > 1e-10) {
                    const t1 = ((p1.x - startX) * (endY - y) - (p1.y - y) * (endX - startX)) / denom;
                    const t2 = ((p1.x - startX) * (p2.y - p1.y) - (p1.y - y) * (p2.x - p1.x)) / denom;
                    if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
                        intersections.push(t2);
                    }
                }
            }
        }
        else {
            // Horizontal line intersection (original function)
            for (let i = 0; i < points.length; i++) {
                const p1 = points[i];
                const p2 = points[(i + 1) % points.length];
                if ((p1.y <= y && p2.y >= y) || (p1.y >= y && p2.y <= y)) {
                    if (p1.y !== p2.y) {
                        const t = (y - p1.y) / (p2.y - p1.y);
                        const x = p1.x + t * (p2.x - p1.x);
                        intersections.push(x);
                    }
                }
            }
        }
        return intersections.sort((a, b) => a - b);
    };
    // Draw stitch on 3D model texture
    const drawStitchOnModel = (stitch) => {
        // Get the composed canvas from the Zustand store
        if (!composedCanvas) {
            console.warn('No composed canvas available for embroidery drawing.');
            return;
        }
        const ctx = composedCanvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
            console.error('Could not get 2D context from composed canvas.');
            return;
        }
        if (stitch.points.length < 2)
            return;
        // Debug logging (can be removed in production)
        console.log('🧵 Drawing stitch on model:', {
            type: stitch.type,
            points: stitch.points.length,
            color: stitch.color,
            thickness: stitch.thickness,
            opacity: stitch.opacity
        });
        ctx.save();
        ctx.globalAlpha = stitch.opacity;
        // Create hyperrealistic gradient for thread texture based on fabric type
        const gradient = ctx.createLinearGradient(0, 0, composedCanvas.width, composedCanvas.height);
        const baseColor = stitch.color;
        const darkerColor = adjustBrightness(baseColor, -30);
        const lighterColor = adjustBrightness(baseColor, 30);
        // Adjust gradient based on lighting direction
        let gradientStartX = 0, gradientStartY = 0, gradientEndX = composedCanvas.width, gradientEndY = composedCanvas.height;
        if (lightingDirection === 'top-left') {
            gradientStartX = 0;
            gradientStartY = 0;
            gradientEndX = composedCanvas.width;
            gradientEndY = composedCanvas.height;
        }
        else if (lightingDirection === 'top-right') {
            gradientStartX = composedCanvas.width;
            gradientStartY = 0;
            gradientEndX = 0;
            gradientEndY = composedCanvas.height;
        }
        else if (lightingDirection === 'bottom-left') {
            gradientStartX = 0;
            gradientStartY = composedCanvas.height;
            gradientEndX = composedCanvas.width;
            gradientEndY = 0;
        }
        else if (lightingDirection === 'bottom-right') {
            gradientStartX = composedCanvas.width;
            gradientStartY = composedCanvas.height;
            gradientEndX = 0;
            gradientEndY = 0;
        }
        const threadGradient = ctx.createLinearGradient(gradientStartX, gradientStartY, gradientEndX, gradientEndY);
        threadGradient.addColorStop(0, lighterColor);
        threadGradient.addColorStop(0.5, baseColor);
        threadGradient.addColorStop(1, darkerColor);
        ctx.strokeStyle = threadGradient;
        ctx.lineWidth = stitch.thickness * stitchDensity;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // Enable high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        // Add shadow for depth and realism based on fabric type
        const shadowIntensity = fabricType === 'silk' ? 0.2 : fabricType === 'denim' ? 0.4 : 0.3;
        ctx.shadowColor = `rgba(0, 0, 0, ${shadowIntensity})`;
        ctx.shadowBlur = fabricType === 'silk' ? 1 : fabricType === 'denim' ? 3 : 2;
        ctx.shadowOffsetX = lightingDirection.includes('right') ? 1 : -1;
        ctx.shadowOffsetY = lightingDirection.includes('bottom') ? 1 : -1;
        // Add fabric-specific effects
        if (fabricType === 'silk') {
            // Silk has subtle shimmer
            ctx.globalCompositeOperation = 'overlay';
        }
        else if (fabricType === 'denim') {
            // Denim has more texture
            ctx.globalCompositeOperation = 'multiply';
        }
        else if (fabricType === 'linen') {
            // Linen has natural texture
            ctx.globalCompositeOperation = 'soft-light';
        }
        // Convert UV coordinates to canvas coordinates
        const canvasWidth = composedCanvas.width;
        const canvasHeight = composedCanvas.height;
        const points = stitch.points.map(p => ({
            x: p.x * canvasWidth,
            y: (1 - p.y) * canvasHeight // Flip Y coordinate for 3D model
        }));
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        console.log('🧵 Rendering stitch type:', stitch.type, 'Type check:', typeof stitch.type);
        switch (stitch.type) {
            case 'satin':
                console.log('🧵 SATIN CASE EXECUTING - drawing professional satin stitch with', points.length, 'points');
                // Safety check to prevent memory issues
                if (points.length > 200) {
                    console.warn('Too many points for satin stitch, using simplified version');
                    // Simple satin stitch fallback with better quality
                    ctx.lineWidth = stitch.thickness * 2;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    // Create gradient for simple satin
                    const gradient = ctx.createLinearGradient(points[0].x, points[0].y, points[points.length - 1].x, points[points.length - 1].y);
                    const baseColor = stitch.color;
                    const highlightColor = adjustBrightness(baseColor, 20);
                    const shadowColor = adjustBrightness(baseColor, -15);
                    gradient.addColorStop(0, highlightColor);
                    gradient.addColorStop(0.5, baseColor);
                    gradient.addColorStop(1, shadowColor);
                    ctx.strokeStyle = gradient;
                    ctx.beginPath();
                    ctx.moveTo(points[0].x, points[0].y);
                    for (let i = 1; i < points.length; i++) {
                        ctx.lineTo(points[i].x, points[i].y);
                    }
                    ctx.stroke();
                    break;
                }
                // Generate consistent stitch points based on density
                const satinPoints = generateSatinStitchPoints(points, stitchDensity);
                // Determine if this is a fill area or outline
                const isFillArea = points.length > 2 &&
                    Math.abs(points[0].x - points[points.length - 1].x) < 0.01 &&
                    Math.abs(points[0].y - points[points.length - 1].y) < 0.01;
                if (isFillArea) {
                    // Generate parallel satin stitches for fill
                    const stitchLines = generateSatinFillStitches(points, stitchDensity);
                    ctx.lineWidth = stitch.thickness * 0.8;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    stitchLines.forEach((linePoints, lineIndex) => {
                        if (linePoints.length < 2)
                            return;
                        // Create gradient for each line based on lighting
                        const start = linePoints[0];
                        const end = linePoints[linePoints.length - 1];
                        const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
                        // Calculate lighting effect
                        const lightAngle = lightingDirection === 'top-left' ? -Math.PI / 4 :
                            lightingDirection === 'top-right' ? Math.PI / 4 :
                                lightingDirection === 'bottom-left' ? -3 * Math.PI / 4 : 3 * Math.PI / 4;
                        const lineAngle = Math.atan2(end.y - start.y, end.x - start.x);
                        const lightEffect = Math.cos(lineAngle - lightAngle);
                        const baseColor = stitch.color;
                        const highlightColor = adjustBrightness(baseColor, 20 + lightEffect * 15);
                        const shadowColor = adjustBrightness(baseColor, -20 - lightEffect * 15);
                        gradient.addColorStop(0, highlightColor);
                        gradient.addColorStop(0.5, baseColor);
                        gradient.addColorStop(1, shadowColor);
                        ctx.strokeStyle = gradient;
                        // Draw the satin line
                        ctx.beginPath();
                        ctx.moveTo(linePoints[0].x, linePoints[0].y);
                        for (let i = 1; i < linePoints.length; i++) {
                            const curr = linePoints[i];
                            const prev = linePoints[i - 1];
                            const next = linePoints[i + 1];
                            if (next) {
                                // Smooth curve for satin effect
                                const cp1x = prev.x + (curr.x - prev.x) / 3;
                                const cp1y = prev.y + (curr.y - prev.y) / 3;
                                const cp2x = curr.x - (next.x - curr.x) / 3;
                                const cp2y = curr.y - (next.y - curr.y) / 3;
                                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
                            }
                            else {
                                ctx.lineTo(curr.x, curr.y);
                            }
                        }
                        ctx.stroke();
                        // Add subtle highlight line for 3D effect
                        if (lightEffect > 0.3) {
                            ctx.strokeStyle = adjustBrightness(baseColor, 30);
                            ctx.lineWidth = stitch.thickness * 0.2;
                            ctx.beginPath();
                            ctx.moveTo(linePoints[0].x, linePoints[0].y);
                            for (let i = 1; i < linePoints.length; i++) {
                                const curr = linePoints[i];
                                const prev = linePoints[i - 1];
                                const next = linePoints[i + 1];
                                if (next) {
                                    const cp1x = prev.x + (curr.x - prev.x) / 3;
                                    const cp1y = prev.y + (curr.y - prev.y) / 3;
                                    const cp2x = curr.x - (next.x - curr.x) / 3;
                                    const cp2y = curr.y - (next.y - curr.y) / 3;
                                    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
                                }
                                else {
                                    ctx.lineTo(curr.x, curr.y);
                                }
                            }
                            ctx.stroke();
                        }
                    });
                }
                else {
                    // Outline satin stitch
                    ctx.lineWidth = stitch.thickness * 1.2;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    // Create gradient for outline
                    const start = satinPoints[0];
                    const end = satinPoints[satinPoints.length - 1];
                    const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
                    const baseColor = stitch.color;
                    const highlightColor = adjustBrightness(baseColor, 25);
                    const shadowColor = adjustBrightness(baseColor, -15);
                    gradient.addColorStop(0, highlightColor);
                    gradient.addColorStop(0.5, baseColor);
                    gradient.addColorStop(1, shadowColor);
                    ctx.strokeStyle = gradient;
                    // Draw main satin line with consistent spacing
                    ctx.beginPath();
                    ctx.moveTo(satinPoints[0].x, satinPoints[0].y);
                    for (let i = 1; i < satinPoints.length; i++) {
                        const curr = satinPoints[i];
                        const prev = satinPoints[i - 1];
                        const next = satinPoints[i + 1];
                        // Check distance to ensure consistent spacing
                        const distance = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));
                        if (distance > 0.005) { // Balanced spacing for performance
                            if (next) {
                                const cp1x = prev.x + (curr.x - prev.x) / 3;
                                const cp1y = prev.y + (curr.y - prev.y) / 3;
                                const cp2x = curr.x - (next.x - curr.x) / 3;
                                const cp2y = curr.y - (next.y - curr.y) / 3;
                                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
                            }
                            else {
                                ctx.lineTo(curr.x, curr.y);
                            }
                        }
                    }
                    ctx.stroke();
                    // Add parallel lines for depth with consistent spacing
                    const offset = stitch.thickness * 0.3;
                    for (let i = 1; i < satinPoints.length; i++) {
                        const curr = satinPoints[i];
                        const prev = satinPoints[i - 1];
                        const next = satinPoints[i + 1];
                        // Check distance to ensure consistent spacing
                        const distance = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));
                        if (distance > 0.005 && next) { // Balanced spacing for performance
                            const angle = Math.atan2(curr.y - prev.y, curr.x - prev.x);
                            const perpX = Math.cos(angle + Math.PI / 2) * offset;
                            const perpY = Math.sin(angle + Math.PI / 2) * offset;
                            // Top parallel line
                            ctx.strokeStyle = adjustBrightness(baseColor, 15);
                            ctx.lineWidth = stitch.thickness * 0.4;
                            ctx.beginPath();
                            ctx.moveTo(prev.x + perpX, prev.y + perpY);
                            ctx.lineTo(curr.x + perpX, curr.y + perpY);
                            ctx.stroke();
                            // Bottom parallel line
                            ctx.strokeStyle = adjustBrightness(baseColor, -10);
                            ctx.beginPath();
                            ctx.moveTo(prev.x - perpX, prev.y - perpY);
                            ctx.lineTo(curr.x - perpX, curr.y - perpY);
                            ctx.stroke();
                        }
                    }
                }
                break;
            case 'fill':
                console.log('🧵 FILL CASE EXECUTING - drawing professional fill stitch with', points.length, 'points');
                // Safety check for performance
                if (points.length > 200) {
                    console.warn('Too many points for fill stitch, using simplified version');
                    // Simple fill fallback
                    ctx.fillStyle = stitch.color;
                    ctx.beginPath();
                    ctx.moveTo(points[0].x, points[0].y);
                    for (let i = 1; i < points.length; i++) {
                        ctx.lineTo(points[i].x, points[i].y);
                    }
                    ctx.closePath();
                    ctx.fill();
                    break;
                }
                // Calculate bounding box
                const minX = Math.min(...points.map(p => p.x));
                const maxX = Math.max(...points.map(p => p.x));
                const minY = Math.min(...points.map(p => p.y));
                const maxY = Math.max(...points.map(p => p.y));
                // Determine fill direction based on shape
                const width = maxX - minX;
                const height = maxY - minY;
                const isHorizontal = width > height;
                // Calculate realistic thread spacing - much tighter for embroidery look
                const threadThickness = Math.max(0.5, stitch.thickness * 0.3); // Much thinner threads
                const baseSpacing = performanceMode ? threadThickness * 1.2 : threadThickness * 0.8; // Tighter spacing
                const maxLines = performanceMode ? 60 : 100; // More lines for realistic coverage
                // Generate fill lines
                const fillLines = [];
                if (isHorizontal) {
                    // Horizontal fill lines
                    const totalLines = Math.min(maxLines, Math.floor(height / baseSpacing));
                    for (let i = 0; i < totalLines; i++) {
                        const y = minY + (i * height) / totalLines;
                        const intersections = getLineIntersections(points, y);
                        for (let j = 0; j < intersections.length; j += 2) {
                            if (intersections[j + 1]) {
                                fillLines.push({
                                    x1: intersections[j],
                                    y1: y,
                                    x2: intersections[j + 1],
                                    y2: y,
                                    index: i
                                });
                            }
                        }
                    }
                }
                else {
                    // Vertical fill lines
                    const totalLines = Math.min(maxLines, Math.floor(width / baseSpacing));
                    for (let i = 0; i < totalLines; i++) {
                        const x = minX + (i * width) / totalLines;
                        const intersections = getVerticalIntersections(points, x);
                        for (let j = 0; j < intersections.length; j += 2) {
                            if (intersections[j + 1]) {
                                fillLines.push({
                                    x1: x,
                                    y1: intersections[j],
                                    x2: x,
                                    y2: intersections[j + 1],
                                    index: i
                                });
                            }
                        }
                    }
                }
                // Render fill lines as hyperrealistic embroidered threads
                fillLines.forEach((line, lineIndex) => {
                    const isEvenRow = line.index % 2 === 0;
                    const baseColor = stitch.color;
                    // Create hyperrealistic thread appearance with complex variations
                    const threadVariation = (Math.sin(line.index * 0.3) * 8) + (Math.random() * 6 - 3);
                    const threadTwist = Math.sin(line.index * 0.7) * 3;
                    const adjustedColor = adjustBrightness(baseColor, threadVariation + threadTwist);
                    // Calculate thread position for 3D effects
                    const lineLength = Math.sqrt((line.x2 - line.x1) ** 2 + (line.y2 - line.y1) ** 2);
                    const numSegments = Math.max(5, Math.floor(lineLength / 1.5)); // More segments for detail
                    // Create thread shadow (darker, slightly offset)
                    ctx.strokeStyle = adjustBrightness(adjustedColor, -30);
                    ctx.lineWidth = threadThickness * 1.4;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.globalAlpha = 0.6;
                    ctx.beginPath();
                    if (isEvenRow) {
                        ctx.moveTo(line.x1 + 0.3, line.y1 + 0.3);
                        for (let i = 1; i <= numSegments; i++) {
                            const t = i / numSegments;
                            const x = line.x1 + t * (line.x2 - line.x1) + 0.3;
                            const y = line.y1 + t * (line.y2 - line.y1) + 0.3;
                            // Add thread twist variations
                            const twist = Math.sin(t * Math.PI * 2 + line.index * 0.5) * 0.2;
                            const perpX = -(line.y2 - line.y1) / lineLength * twist;
                            const perpY = (line.x2 - line.x1) / lineLength * twist;
                            ctx.lineTo(x + perpX, y + perpY);
                        }
                    }
                    else {
                        ctx.moveTo(line.x2 + 0.3, line.y2 + 0.3);
                        for (let i = 1; i <= numSegments; i++) {
                            const t = i / numSegments;
                            const x = line.x2 - t * (line.x2 - line.x1) + 0.3;
                            const y = line.y2 - t * (line.y2 - line.y1) + 0.3;
                            // Add thread twist variations
                            const twist = Math.sin(t * Math.PI * 2 + line.index * 0.5) * 0.2;
                            const perpX = (line.y2 - line.y1) / lineLength * twist;
                            const perpY = -(line.x2 - line.x1) / lineLength * twist;
                            ctx.lineTo(x + perpX, y + perpY);
                        }
                    }
                    ctx.stroke();
                    // Create thread highlight (brighter, on top)
                    ctx.strokeStyle = adjustBrightness(adjustedColor, 20);
                    ctx.lineWidth = threadThickness * 0.7;
                    ctx.globalAlpha = 0.9;
                    ctx.beginPath();
                    if (isEvenRow) {
                        ctx.moveTo(line.x1, line.y1);
                        for (let i = 1; i <= numSegments; i++) {
                            const t = i / numSegments;
                            const x = line.x1 + t * (line.x2 - line.x1);
                            const y = line.y1 + t * (line.y2 - line.y1);
                            // Add thread fiber texture
                            const fiberVariation = Math.sin(t * Math.PI * 4 + line.index * 0.3) * 0.15;
                            const randomVariation = (Math.random() - 0.5) * 0.2;
                            const totalVariation = fiberVariation + randomVariation;
                            const perpX = -(line.y2 - line.y1) / lineLength * totalVariation;
                            const perpY = (line.x2 - line.x1) / lineLength * totalVariation;
                            ctx.lineTo(x + perpX, y + perpY);
                        }
                    }
                    else {
                        ctx.moveTo(line.x2, line.y2);
                        for (let i = 1; i <= numSegments; i++) {
                            const t = i / numSegments;
                            const x = line.x2 - t * (line.x2 - line.x1);
                            const y = line.y2 - t * (line.y2 - line.y1);
                            // Add thread fiber texture
                            const fiberVariation = Math.sin(t * Math.PI * 4 + line.index * 0.3) * 0.15;
                            const randomVariation = (Math.random() - 0.5) * 0.2;
                            const totalVariation = fiberVariation + randomVariation;
                            const perpX = (line.y2 - line.y1) / lineLength * totalVariation;
                            const perpY = -(line.x2 - line.x1) / lineLength * totalVariation;
                            ctx.lineTo(x + perpX, y + perpY);
                        }
                    }
                    ctx.stroke();
                    // Create main thread (base color)
                    ctx.strokeStyle = adjustedColor;
                    ctx.lineWidth = threadThickness;
                    ctx.globalAlpha = 1;
                    ctx.beginPath();
                    if (isEvenRow) {
                        ctx.moveTo(line.x1, line.y1);
                        for (let i = 1; i <= numSegments; i++) {
                            const t = i / numSegments;
                            const x = line.x1 + t * (line.x2 - line.x1);
                            const y = line.y1 + t * (line.y2 - line.y1);
                            // Add realistic thread texture
                            const fiberVariation = Math.sin(t * Math.PI * 3 + line.index * 0.4) * 0.1;
                            const randomVariation = (Math.random() - 0.5) * 0.15;
                            const totalVariation = fiberVariation + randomVariation;
                            const perpX = -(line.y2 - line.y1) / lineLength * totalVariation;
                            const perpY = (line.x2 - line.x1) / lineLength * totalVariation;
                            ctx.lineTo(x + perpX, y + perpY);
                        }
                    }
                    else {
                        ctx.moveTo(line.x2, line.y2);
                        for (let i = 1; i <= numSegments; i++) {
                            const t = i / numSegments;
                            const x = line.x2 - t * (line.x2 - line.x1);
                            const y = line.y2 - t * (line.y2 - line.y1);
                            // Add realistic thread texture
                            const fiberVariation = Math.sin(t * Math.PI * 3 + line.index * 0.4) * 0.1;
                            const randomVariation = (Math.random() - 0.5) * 0.15;
                            const totalVariation = fiberVariation + randomVariation;
                            const perpX = (line.y2 - line.y1) / lineLength * totalVariation;
                            const perpY = -(line.x2 - line.x1) / lineLength * totalVariation;
                            ctx.lineTo(x + perpX, y + perpY);
                        }
                    }
                    ctx.stroke();
                });
                // No texture overlay - let the individual threads create the texture naturally
                break;
            case 'cross-stitch':
                console.log('🧵 HYPERREALISTIC CROSS-STITCH CASE EXECUTING - drawing professional X patterns');
                // Draw hyperrealistic cross-stitch with professional embroidery quality
                points.forEach((point, i) => {
                    if (i % 2 === 0 && points[i + 1]) {
                        const next = points[i + 1];
                        const size = stitch.thickness * 2.0;
                        const threadThickness = Math.max(0.8, stitch.thickness * 0.4);
                        // Create realistic thread color variations
                        const threadVariation = (Math.sin(i * 0.5) * 8) + (Math.random() * 4 - 2);
                        const adjustedColor = adjustBrightness(stitch.color, threadVariation);
                        const shadowColor = adjustBrightness(adjustedColor, -20);
                        const highlightColor = adjustBrightness(adjustedColor, 12);
                        // Draw cross-stitch shadow (offset slightly)
                        ctx.strokeStyle = shadowColor;
                        ctx.lineWidth = threadThickness * 1.3;
                        ctx.lineCap = 'round';
                        ctx.lineJoin = 'round';
                        ctx.globalAlpha = 0.6;
                        ctx.shadowBlur = 0;
                        ctx.shadowOffsetX = 0;
                        ctx.shadowOffsetY = 0;
                        ctx.beginPath();
                        ctx.moveTo(point.x - size + 0.5, point.y - size + 0.5);
                        ctx.lineTo(point.x + size + 0.5, point.y + size + 0.5);
                        ctx.moveTo(point.x - size + 0.5, point.y + size + 0.5);
                        ctx.lineTo(point.x + size + 0.5, point.y - size + 0.5);
                        ctx.stroke();
                        // Draw main cross-stitch threads
                        ctx.strokeStyle = adjustedColor;
                        ctx.lineWidth = threadThickness;
                        ctx.globalAlpha = 1;
                        // First diagonal (bottom-left to top-right)
                        ctx.beginPath();
                        ctx.moveTo(point.x - size, point.y - size);
                        ctx.lineTo(point.x + size, point.y + size);
                        ctx.stroke();
                        // Second diagonal (top-left to bottom-right)
                        ctx.beginPath();
                        ctx.moveTo(point.x - size, point.y + size);
                        ctx.lineTo(point.x + size, point.y - size);
                        ctx.stroke();
                        // Add thread highlights for 3D effect
                        ctx.strokeStyle = highlightColor;
                        ctx.lineWidth = threadThickness * 0.5;
                        ctx.globalAlpha = 0.7;
                        // Highlight first diagonal
                        ctx.beginPath();
                        ctx.moveTo(point.x - size + 0.3, point.y - size + 0.3);
                        ctx.lineTo(point.x + size - 0.3, point.y + size - 0.3);
                        ctx.stroke();
                        // Highlight second diagonal
                        ctx.beginPath();
                        ctx.moveTo(point.x - size + 0.3, point.y + size - 0.3);
                        ctx.lineTo(point.x + size - 0.3, point.y - size + 0.3);
                        ctx.stroke();
                        // Add realistic thread texture dots at intersections
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = adjustedColor;
                        const dotSize = threadThickness * 0.8;
                        // Center intersection dot
                        ctx.beginPath();
                        ctx.arc(point.x, point.y, dotSize * 0.6, 0, Math.PI * 2);
                        ctx.fill();
                        // Corner dots for thread ends
                        const cornerDotSize = threadThickness * 0.5;
                        ctx.beginPath();
                        ctx.arc(point.x - size, point.y - size, cornerDotSize, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.beginPath();
                        ctx.arc(point.x + size, point.y + size, cornerDotSize, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.beginPath();
                        ctx.arc(point.x - size, point.y + size, cornerDotSize, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.beginPath();
                        ctx.arc(point.x + size, point.y - size, cornerDotSize, 0, Math.PI * 2);
                        ctx.fill();
                        // Add subtle thread shine highlights
                        ctx.fillStyle = highlightColor;
                        ctx.globalAlpha = 0.6;
                        const shineSize = cornerDotSize * 0.4;
                        ctx.beginPath();
                        ctx.arc(point.x - size - shineSize * 0.5, point.y - size - shineSize * 0.5, shineSize, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.beginPath();
                        ctx.arc(point.x + size + shineSize * 0.5, point.y + size + shineSize * 0.5, shineSize, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.beginPath();
                        ctx.arc(point.x - size - shineSize * 0.5, point.y + size + shineSize * 0.5, shineSize, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.beginPath();
                        ctx.arc(point.x + size + shineSize * 0.5, point.y - size - shineSize * 0.5, shineSize, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });
                break;
            case 'chain':
                console.log('🧵 HYPERREALISTIC CHAIN CASE EXECUTING - drawing professional chain links');
                // Chain stitch pattern - draw connected oval links with professional embroidery quality
                for (let i = 0; i < points.length - 1; i++) {
                    const curr = points[i];
                    const next = points[i + 1];
                    const midX = (curr.x + next.x) / 2;
                    const midY = (curr.y + next.y) / 2;
                    // Calculate link dimensions
                    const linkWidth = stitch.thickness * 2.5;
                    const linkHeight = stitch.thickness * 1.5;
                    const threadThickness = Math.max(0.8, stitch.thickness * 0.5);
                    // Create realistic thread color variations
                    const threadVariation = (Math.sin(i * 0.7) * 6) + (Math.random() * 3 - 1.5);
                    const adjustedColor = adjustBrightness(stitch.color, threadVariation);
                    const shadowColor = adjustBrightness(adjustedColor, -18);
                    const highlightColor = adjustBrightness(adjustedColor, 10);
                    // Calculate link angle for proper orientation
                    const angle = Math.atan2(next.y - curr.y, next.x - curr.x);
                    // Draw chain link shadow (offset slightly)
                    ctx.strokeStyle = shadowColor;
                    ctx.lineWidth = threadThickness * 1.4;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.globalAlpha = 0.5;
                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                    ctx.beginPath();
                    ctx.ellipse(midX + 0.4, midY + 0.4, linkWidth / 2, linkHeight / 2, angle, 0, Math.PI * 2);
                    ctx.stroke();
                    // Draw main chain link
                    ctx.strokeStyle = adjustedColor;
                    ctx.lineWidth = threadThickness;
                    ctx.globalAlpha = 1;
                    ctx.beginPath();
                    ctx.ellipse(midX, midY, linkWidth / 2, linkHeight / 2, angle, 0, Math.PI * 2);
                    ctx.stroke();
                    // Draw inner oval for chain link hole
                    ctx.beginPath();
                    ctx.ellipse(midX, midY, linkWidth / 3, linkHeight / 3, angle, 0, Math.PI * 2);
                    ctx.stroke();
                    // Add chain link highlight for 3D effect
                    ctx.strokeStyle = highlightColor;
                    ctx.lineWidth = threadThickness * 0.6;
                    ctx.globalAlpha = 0.8;
                    ctx.beginPath();
                    ctx.ellipse(midX - 0.2, midY - 0.2, linkWidth / 2.2, linkHeight / 2.2, angle, 0, Math.PI * 2);
                    ctx.stroke();
                    // Add connecting thread between links
                    if (i < points.length - 2) {
                        const nextNext = points[i + 2];
                        const connectionX = (next.x + nextNext.x) / 2;
                        const connectionY = (next.y + nextNext.y) / 2;
                        // Draw connection shadow
                        ctx.strokeStyle = shadowColor;
                        ctx.lineWidth = threadThickness * 0.8;
                        ctx.globalAlpha = 0.3;
                        ctx.beginPath();
                        ctx.moveTo(next.x + 0.2, next.y + 0.2);
                        ctx.lineTo(connectionX + 0.2, connectionY + 0.2);
                        ctx.stroke();
                        // Draw main connection thread
                        ctx.strokeStyle = adjustedColor;
                        ctx.lineWidth = threadThickness * 0.6;
                        ctx.globalAlpha = 1;
                        ctx.beginPath();
                        ctx.moveTo(next.x, next.y);
                        ctx.lineTo(connectionX, connectionY);
                        ctx.stroke();
                        // Add connection highlight
                        ctx.strokeStyle = highlightColor;
                        ctx.lineWidth = threadThickness * 0.3;
                        ctx.globalAlpha = 0.7;
                        ctx.beginPath();
                        ctx.moveTo(next.x - 0.1, next.y - 0.1);
                        ctx.lineTo(connectionX - 0.1, connectionY - 0.1);
                        ctx.stroke();
                    }
                    // Add realistic thread texture dots at key points
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = adjustedColor;
                    const dotSize = threadThickness * 0.4;
                    // Top and bottom of chain link
                    ctx.beginPath();
                    ctx.arc(midX + Math.cos(angle) * linkWidth / 2, midY + Math.sin(angle) * linkWidth / 2, dotSize, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(midX - Math.cos(angle) * linkWidth / 2, midY - Math.sin(angle) * linkWidth / 2, dotSize, 0, Math.PI * 2);
                    ctx.fill();
                    // Add subtle thread shine highlights
                    ctx.fillStyle = highlightColor;
                    ctx.globalAlpha = 0.6;
                    const shineSize = dotSize * 0.5;
                    ctx.beginPath();
                    ctx.arc(midX + Math.cos(angle) * linkWidth / 2 - shineSize * 0.3, midY + Math.sin(angle) * linkWidth / 2 - shineSize * 0.3, shineSize, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
            case 'backstitch':
                console.log('🧵 HYPERREALISTIC BACKSTITCH CASE EXECUTING - drawing professional backstitch segments');
                // Draw hyperrealistic backstitch with professional embroidery quality
                const backstitchThreadThickness = Math.max(0.8, stitch.thickness * 0.6);
                // Create realistic thread color variations
                const backstitchThreadVariation = 0.1 + Math.random() * 0.2;
                const backstitchAdjustedColor = adjustBrightness(stitch.color, (Math.random() - 0.5) * 20 * backstitchThreadVariation);
                const backstitchShadowColor = adjustBrightness(backstitchAdjustedColor, -25);
                const backstitchHighlightColor = adjustBrightness(backstitchAdjustedColor, 20);
                // Draw each backstitch segment with realistic thread appearance
                for (let i = 0; i < points.length - 1; i++) {
                    const curr = points[i];
                    const next = points[i + 1];
                    // Calculate segment direction and perpendicular
                    const dx = next.x - curr.x;
                    const dy = next.y - curr.y;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    const perpX = -dy / length * 0.3;
                    const perpY = dx / length * 0.3;
                    // Shadow layer
                    ctx.strokeStyle = backstitchShadowColor;
                    ctx.lineWidth = backstitchThreadThickness * 1.2;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.globalAlpha = 0.4;
                    ctx.shadowBlur = 0;
                    ctx.beginPath();
                    ctx.moveTo(curr.x + perpX, curr.y + perpY);
                    ctx.lineTo(next.x + perpX, next.y + perpY);
                    ctx.stroke();
                    // Main thread
                    ctx.strokeStyle = backstitchAdjustedColor;
                    ctx.lineWidth = backstitchThreadThickness;
                    ctx.globalAlpha = 1;
                    ctx.beginPath();
                    ctx.moveTo(curr.x, curr.y);
                    ctx.lineTo(next.x, next.y);
                    ctx.stroke();
                    // Highlight layer
                    ctx.strokeStyle = backstitchHighlightColor;
                    ctx.lineWidth = backstitchThreadThickness * 0.5;
                    ctx.globalAlpha = 0.7;
                    ctx.beginPath();
                    ctx.moveTo(curr.x - perpX * 0.3, curr.y - perpY * 0.3);
                    ctx.lineTo(next.x - perpX * 0.3, next.y - perpY * 0.3);
                    ctx.stroke();
                    // Add thread texture dots
                    const dotSize = backstitchThreadThickness * 0.3;
                    ctx.fillStyle = backstitchHighlightColor;
                    ctx.globalAlpha = 0.8;
                    ctx.beginPath();
                    ctx.arc(curr.x, curr.y, dotSize, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
            case 'outline':
                console.log('🧵 HYPERREALISTIC OUTLINE CASE EXECUTING - drawing professional outline lines');
                // Draw hyperrealistic outline stitch with professional embroidery quality
                if (points.length < 2)
                    return;
                const outlineThreadThickness = Math.max(0.8, stitch.thickness * 0.6);
                // Create realistic thread color variations
                const threadVariation = (Math.sin(points.length * 0.3) * 5) + (Math.random() * 3 - 1.5);
                const adjustedColor = adjustBrightness(stitch.color, threadVariation);
                const shadowColor = adjustBrightness(adjustedColor, -15);
                const highlightColor = adjustBrightness(adjustedColor, 8);
                // Draw outline shadow (offset slightly)
                ctx.strokeStyle = shadowColor;
                ctx.lineWidth = outlineThreadThickness * 1.3;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.globalAlpha = 0.5;
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.beginPath();
                ctx.moveTo(points[0].x + 0.3, points[0].y + 0.3);
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x + 0.3, points[i].y + 0.3);
                }
                ctx.stroke();
                // Draw main outline thread
                ctx.strokeStyle = adjustedColor;
                ctx.lineWidth = outlineThreadThickness;
                ctx.globalAlpha = 1;
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    // Add subtle thread texture variations
                    const segmentLength = Math.sqrt(Math.pow(points[i].x - points[i - 1].x, 2) +
                        Math.pow(points[i].y - points[i - 1].y, 2));
                    if (segmentLength > 2) {
                        // Break long segments into smaller parts for texture
                        const numSegments = Math.max(2, Math.floor(segmentLength / 3));
                        for (let j = 1; j <= numSegments; j++) {
                            const t = j / numSegments;
                            const x = points[i - 1].x + t * (points[i].x - points[i - 1].x);
                            const y = points[i - 1].y + t * (points[i].y - points[i - 1].y);
                            // Add tiny random variations to simulate thread texture
                            const variation = (Math.random() - 0.5) * 0.2;
                            const perpX = -(points[i].y - points[i - 1].y) / segmentLength * variation;
                            const perpY = (points[i].x - points[i - 1].x) / segmentLength * variation;
                            ctx.lineTo(x + perpX, y + perpY);
                        }
                    }
                    else {
                        ctx.lineTo(points[i].x, points[i].y);
                    }
                }
                ctx.stroke();
                // Add thread highlight for 3D effect
                ctx.strokeStyle = highlightColor;
                ctx.lineWidth = outlineThreadThickness * 0.6;
                ctx.globalAlpha = 0.8;
                ctx.beginPath();
                ctx.moveTo(points[0].x - 0.1, points[0].y - 0.1);
                for (let i = 1; i < points.length; i++) {
                    const segmentLength = Math.sqrt(Math.pow(points[i].x - points[i - 1].x, 2) +
                        Math.pow(points[i].y - points[i - 1].y, 2));
                    if (segmentLength > 2) {
                        const numSegments = Math.max(2, Math.floor(segmentLength / 3));
                        for (let j = 1; j <= numSegments; j++) {
                            const t = j / numSegments;
                            const x = points[i - 1].x + t * (points[i].x - points[i - 1].x);
                            const y = points[i - 1].y + t * (points[i].y - points[i - 1].y);
                            const variation = (Math.random() - 0.5) * 0.1;
                            const perpX = -(points[i].y - points[i - 1].y) / segmentLength * variation;
                            const perpY = (points[i].x - points[i - 1].x) / segmentLength * variation;
                            ctx.lineTo(x + perpX - 0.1, y + perpY - 0.1);
                        }
                    }
                    else {
                        ctx.lineTo(points[i].x - 0.1, points[i].y - 0.1);
                    }
                }
                ctx.stroke();
                // Add realistic thread texture dots at key points
                ctx.globalAlpha = 1;
                ctx.fillStyle = adjustedColor;
                const dotSize = outlineThreadThickness * 0.3;
                // Add dots at start and end points
                ctx.beginPath();
                ctx.arc(points[0].x, points[0].y, dotSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(points[points.length - 1].x, points[points.length - 1].y, dotSize, 0, Math.PI * 2);
                ctx.fill();
                // Add subtle thread shine highlights
                ctx.fillStyle = highlightColor;
                ctx.globalAlpha = 0.6;
                const shineSize = dotSize * 0.6;
                ctx.beginPath();
                ctx.arc(points[0].x - shineSize * 0.3, points[0].y - shineSize * 0.3, shineSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(points[points.length - 1].x - shineSize * 0.3, points[points.length - 1].y - shineSize * 0.3, shineSize, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'french-knot':
                console.log('🧵 HYPERREALISTIC FRENCH-KNOT CASE EXECUTING - drawing professional circular knots');
                // Draw hyperrealistic French knots with professional embroidery quality
                const knotThreadThickness = Math.max(0.6, stitch.thickness * 0.4);
                points.forEach((point, i) => {
                    if (i % 3 === 0) {
                        // Create realistic thread color variations
                        const threadVariation = 0.1 + Math.random() * 0.2;
                        const adjustedColor = adjustBrightness(stitch.color, (Math.random() - 0.5) * 15 * threadVariation);
                        const shadowColor = adjustBrightness(adjustedColor, -30);
                        const highlightColor = adjustBrightness(adjustedColor, 25);
                        const knotSize = stitch.thickness * 2.5;
                        const innerSize = knotSize * 0.6;
                        const coreSize = knotSize * 0.3;
                        // Shadow layer
                        ctx.fillStyle = shadowColor;
                        ctx.globalAlpha = 0.4;
                        ctx.beginPath();
                        ctx.arc(point.x + 0.3, point.y + 0.3, knotSize, 0, Math.PI * 2);
                        ctx.fill();
                        // Main knot body with gradient
                        const gradient = ctx.createRadialGradient(point.x - knotSize * 0.3, point.y - knotSize * 0.3, 0, point.x, point.y, knotSize);
                        gradient.addColorStop(0, highlightColor);
                        gradient.addColorStop(0.7, adjustedColor);
                        gradient.addColorStop(1, shadowColor);
                        ctx.fillStyle = gradient;
                        ctx.globalAlpha = 1;
                        ctx.beginPath();
                        ctx.arc(point.x, point.y, knotSize, 0, Math.PI * 2);
                        ctx.fill();
                        // Inner knot layer
                        ctx.fillStyle = adjustBrightness(adjustedColor, 10);
                        ctx.globalAlpha = 0.8;
                        ctx.beginPath();
                        ctx.arc(point.x, point.y, innerSize, 0, Math.PI * 2);
                        ctx.fill();
                        // Core highlight
                        ctx.fillStyle = highlightColor;
                        ctx.globalAlpha = 0.9;
                        ctx.beginPath();
                        ctx.arc(point.x - knotSize * 0.2, point.y - knotSize * 0.2, coreSize, 0, Math.PI * 2);
                        ctx.fill();
                        // Thread texture lines
                        ctx.strokeStyle = highlightColor;
                        ctx.lineWidth = knotThreadThickness * 0.3;
                        ctx.globalAlpha = 0.6;
                        for (let j = 0; j < 4; j++) {
                            const angle = (j * Math.PI * 2) / 4;
                            const startX = point.x + Math.cos(angle) * innerSize;
                            const startY = point.y + Math.sin(angle) * innerSize;
                            const endX = point.x + Math.cos(angle) * knotSize * 0.8;
                            const endY = point.y + Math.sin(angle) * knotSize * 0.8;
                            ctx.beginPath();
                            ctx.moveTo(startX, startY);
                            ctx.lineTo(endX, endY);
                            ctx.stroke();
                        }
                        // Shine highlight
                        ctx.fillStyle = adjustBrightness(highlightColor, 20);
                        ctx.globalAlpha = 0.7;
                        const shineSize = coreSize * 0.4;
                        ctx.beginPath();
                        ctx.arc(point.x - knotSize * 0.3, point.y - knotSize * 0.3, shineSize, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });
                break;
            case 'bullion':
                console.log('🧵 HYPERREALISTIC BULLION CASE EXECUTING - drawing professional twisted rope');
                // Draw hyperrealistic bullion stitch with professional embroidery quality
                const bullionThreadThickness = Math.max(0.8, stitch.thickness * 0.5);
                for (let i = 0; i < points.length - 1; i++) {
                    const start = points[i];
                    const end = points[i + 1];
                    const distance = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
                    const twists = Math.max(5, Math.floor(distance / (stitch.thickness * 1.2)));
                    // Create realistic thread color variations
                    const threadVariation = 0.1 + Math.random() * 0.2;
                    const adjustedColor = adjustBrightness(stitch.color, (Math.random() - 0.5) * 15 * threadVariation);
                    const shadowColor = adjustBrightness(adjustedColor, -25);
                    const highlightColor = adjustBrightness(adjustedColor, 20);
                    // Create gradient for rope effect
                    const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
                    gradient.addColorStop(0, shadowColor);
                    gradient.addColorStop(0.3, adjustedColor);
                    gradient.addColorStop(0.7, adjustedColor);
                    gradient.addColorStop(1, highlightColor);
                    for (let t = 0; t < twists; t++) {
                        const progress = t / twists;
                        const x = start.x + (end.x - start.x) * progress;
                        const y = start.y + (end.y - start.y) * progress;
                        const offset = Math.sin(progress * Math.PI * 8) * stitch.thickness * 0.5;
                        const perpOffset = Math.cos(progress * Math.PI * 8) * stitch.thickness * 0.3;
                        const segmentSize = stitch.thickness * 0.6;
                        const innerSize = segmentSize * 0.6;
                        // Shadow layer
                        ctx.fillStyle = shadowColor;
                        ctx.globalAlpha = 0.4;
                        ctx.beginPath();
                        ctx.arc(x + offset + 0.2, y + perpOffset + 0.2, segmentSize, 0, Math.PI * 2);
                        ctx.fill();
                        // Main rope segment with gradient
                        ctx.fillStyle = gradient;
                        ctx.globalAlpha = 1;
                        ctx.beginPath();
                        ctx.arc(x + offset, y + perpOffset, segmentSize, 0, Math.PI * 2);
                        ctx.fill();
                        // Inner rope highlight
                        ctx.fillStyle = highlightColor;
                        ctx.globalAlpha = 0.8;
                        ctx.beginPath();
                        ctx.arc(x + offset - segmentSize * 0.2, y + perpOffset - segmentSize * 0.2, innerSize, 0, Math.PI * 2);
                        ctx.fill();
                        // Thread twist lines
                        ctx.strokeStyle = highlightColor;
                        ctx.lineWidth = bullionThreadThickness * 0.2;
                        ctx.globalAlpha = 0.6;
                        for (let j = 0; j < 3; j++) {
                            const angle = (j * Math.PI * 2) / 3 + progress * Math.PI * 4;
                            const lineStartX = x + offset + Math.cos(angle) * segmentSize * 0.3;
                            const lineStartY = y + perpOffset + Math.sin(angle) * segmentSize * 0.3;
                            const lineEndX = x + offset + Math.cos(angle) * segmentSize * 0.8;
                            const lineEndY = y + perpOffset + Math.sin(angle) * segmentSize * 0.8;
                            ctx.beginPath();
                            ctx.moveTo(lineStartX, lineStartY);
                            ctx.lineTo(lineEndX, lineEndY);
                            ctx.stroke();
                        }
                        // Shine highlight
                        ctx.fillStyle = adjustBrightness(highlightColor, 15);
                        ctx.globalAlpha = 0.7;
                        const shineSize = innerSize * 0.4;
                        ctx.beginPath();
                        ctx.arc(x + offset - segmentSize * 0.3, y + perpOffset - segmentSize * 0.3, shineSize, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                break;
            case 'lazy-daisy':
                console.log('🧵 LAZY-DAISY CASE EXECUTING - drawing petal stitches');
                points.forEach((point, i) => {
                    if (i % 2 === 0 && points[i + 1]) {
                        const next = points[i + 1];
                        const size = stitch.thickness * 2;
                        const angle = Math.atan2(next.y - point.y, next.x - point.x);
                        // Draw petal shape with multiple ellipses
                        ctx.beginPath();
                        ctx.ellipse(point.x, point.y, size, size * 0.4, angle, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.beginPath();
                        ctx.ellipse(point.x, point.y, size * 0.6, size * 0.2, angle, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                });
                break;
            case 'feather':
                console.log('🧵 FEATHER CASE EXECUTING - drawing zigzag pattern');
                for (let i = 0; i < points.length - 1; i += 2) {
                    if (points[i + 1]) {
                        const curr = points[i];
                        const next = points[i + 1];
                        const midX = (curr.x + next.x) / 2;
                        const midY = (curr.y + next.y) / 2;
                        // Draw zigzag pattern with multiple lines
                        ctx.beginPath();
                        ctx.moveTo(curr.x, curr.y);
                        ctx.lineTo(midX, midY + stitch.thickness);
                        ctx.lineTo(next.x, next.y);
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(curr.x, curr.y);
                        ctx.lineTo(midX, midY - stitch.thickness);
                        ctx.lineTo(next.x, next.y);
                        ctx.stroke();
                    }
                }
                break;
            case 'couching':
                console.log('🧵 COUCHING CASE EXECUTING - drawing decorative overlay');
                for (let i = 0; i < points.length - 1; i++) {
                    const curr = points[i];
                    const next = points[i + 1];
                    // Draw main thread
                    ctx.beginPath();
                    ctx.moveTo(curr.x, curr.y);
                    ctx.lineTo(next.x, next.y);
                    ctx.stroke();
                    // Draw couching stitches perpendicular to main thread
                    const angle = Math.atan2(next.y - curr.y, next.x - curr.x);
                    const perpAngle = angle + Math.PI / 2;
                    const spacing = stitch.thickness * 2;
                    for (let j = 0; j < 3; j++) {
                        const t = (j + 1) / 4;
                        const x = curr.x + (next.x - curr.x) * t;
                        const y = curr.y + (next.y - curr.y) * t;
                        const offset = (j - 1) * spacing;
                        ctx.beginPath();
                        ctx.moveTo(x + Math.cos(perpAngle) * offset, y + Math.sin(perpAngle) * offset);
                        ctx.lineTo(x - Math.cos(perpAngle) * offset, y - Math.sin(perpAngle) * offset);
                        ctx.stroke();
                    }
                }
                break;
            case 'seed':
                console.log('🧵 SEED CASE EXECUTING - drawing random dots');
                points.forEach((point, i) => {
                    const size = stitch.thickness * 1.5;
                    // Draw multiple small dots for seed effect
                    for (let j = 0; j < 5; j++) {
                        const offsetX = (Math.random() - 0.5) * size * 2;
                        const offsetY = (Math.random() - 0.5) * size * 2;
                        const dotSize = size * (0.2 + Math.random() * 0.3);
                        ctx.beginPath();
                        ctx.arc(point.x + offsetX, point.y + offsetY, dotSize, 0, Math.PI * 2);
                        ctx.fill();
                        // Add stroke for visibility
                        ctx.beginPath();
                        ctx.arc(point.x + offsetX, point.y + offsetY, dotSize, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                });
                break;
            case 'stem':
                console.log('🧵 STEM CASE EXECUTING - drawing twisted line');
                for (let i = 1; i < points.length; i++) {
                    const prev = points[i - 1];
                    const curr = points[i];
                    ctx.beginPath();
                    ctx.moveTo(prev.x, prev.y);
                    ctx.lineTo(curr.x, curr.y);
                    ctx.stroke();
                }
                break;
            case 'metallic':
                console.log('🧵 METALLIC CASE EXECUTING - drawing shimmer effect');
                for (let i = 1; i < points.length; i++) {
                    const prev = points[i - 1];
                    const curr = points[i];
                    ctx.beginPath();
                    ctx.moveTo(prev.x, prev.y);
                    ctx.lineTo(curr.x, curr.y);
                    ctx.stroke();
                }
                break;
            case 'glow-thread':
                console.log('🧵 GLOW-THREAD CASE EXECUTING - drawing glow effect');
                for (let i = 1; i < points.length; i++) {
                    const prev = points[i - 1];
                    const curr = points[i];
                    ctx.beginPath();
                    ctx.moveTo(prev.x, prev.y);
                    ctx.lineTo(curr.x, curr.y);
                    ctx.stroke();
                }
                break;
            case 'variegated':
                console.log('🧵 VARIEGATED CASE EXECUTING - drawing color changes');
                for (let i = 1; i < points.length; i++) {
                    const prev = points[i - 1];
                    const curr = points[i];
                    ctx.beginPath();
                    ctx.moveTo(prev.x, prev.y);
                    ctx.lineTo(curr.x, curr.y);
                    ctx.stroke();
                }
                break;
            case 'gradient':
                console.log('🧵 GRADIENT CASE EXECUTING - drawing gradient effect');
                for (let i = 1; i < points.length; i++) {
                    const prev = points[i - 1];
                    const curr = points[i];
                    ctx.beginPath();
                    ctx.moveTo(prev.x, prev.y);
                    ctx.lineTo(curr.x, curr.y);
                    ctx.stroke();
                }
                break;
            case 'brick':
                console.log('🧵 BRICK CASE EXECUTING - drawing offset rectangles');
                for (let i = 0; i < points.length - 1; i += 2) {
                    if (points[i + 1]) {
                        const curr = points[i];
                        const next = points[i + 1];
                        const width = Math.abs(next.x - curr.x);
                        const height = stitch.thickness * 2;
                        const offset = (i / 2) % 2 === 0 ? 0 : height / 2;
                        // Draw brick with offset pattern
                        ctx.fillRect(curr.x, curr.y - height / 2 + offset, width, height);
                        ctx.strokeRect(curr.x, curr.y - height / 2 + offset, width, height);
                    }
                }
                break;
            case 'fishbone':
                console.log('🧵 FISHBONE CASE EXECUTING - drawing V patterns');
                for (let i = 0; i < points.length - 2; i += 3) {
                    if (points[i + 1] && points[i + 2]) {
                        const curr = points[i];
                        const left = points[i + 1];
                        const right = points[i + 2];
                        // Draw fishbone pattern with multiple V shapes
                        ctx.beginPath();
                        ctx.moveTo(curr.x, curr.y);
                        ctx.lineTo(left.x, left.y);
                        ctx.moveTo(curr.x, curr.y);
                        ctx.lineTo(right.x, right.y);
                        ctx.stroke();
                        // Add center line
                        const midLeftX = (curr.x + left.x) / 2;
                        const midLeftY = (curr.y + left.y) / 2;
                        const midRightX = (curr.x + right.x) / 2;
                        const midRightY = (curr.y + right.y) / 2;
                        ctx.beginPath();
                        ctx.moveTo(midLeftX, midLeftY);
                        ctx.lineTo(midRightX, midRightY);
                        ctx.stroke();
                    }
                }
                break;
            case 'herringbone':
                console.log('🧵 HERRINGBONE CASE EXECUTING - drawing chevron pattern');
                for (let i = 0; i < points.length - 1; i++) {
                    const curr = points[i];
                    const next = points[i + 1];
                    ctx.beginPath();
                    ctx.moveTo(curr.x, curr.y);
                    ctx.lineTo(next.x, next.y);
                    ctx.stroke();
                }
                break;
            case 'long-short':
                console.log('🧵 LONG-SHORT CASE EXECUTING - drawing alternating lengths');
                for (let i = 0; i < points.length - 1; i++) {
                    const curr = points[i];
                    const next = points[i + 1];
                    const length = Math.sqrt((next.x - curr.x) ** 2 + (next.y - curr.y) ** 2);
                    const isLong = i % 2 === 0;
                    const factor = isLong ? 1 : 0.6;
                    const endX = curr.x + (next.x - curr.x) * factor;
                    const endY = curr.y + (next.y - curr.y) * factor;
                    ctx.beginPath();
                    ctx.moveTo(curr.x, curr.y);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                }
                break;
            case 'split':
                console.log('🧵 SPLIT CASE EXECUTING - drawing overlapping pattern');
                for (let i = 1; i < points.length; i++) {
                    const prev = points[i - 1];
                    const curr = points[i];
                    ctx.beginPath();
                    ctx.moveTo(prev.x, prev.y);
                    ctx.lineTo(curr.x, curr.y);
                    ctx.stroke();
                }
                break;
            case 'appliqué':
                console.log('🧵 APPLIQUÉ CASE EXECUTING - drawing decorative edge');
                for (let i = 1; i < points.length; i++) {
                    const prev = points[i - 1];
                    const curr = points[i];
                    ctx.beginPath();
                    ctx.moveTo(prev.x, prev.y);
                    ctx.lineTo(curr.x, curr.y);
                    ctx.stroke();
                }
                break;
            case 'satin-ribbon':
                console.log('🧵 SATIN-RIBBON CASE EXECUTING - drawing wide satin with ribbon effect');
                for (let i = 1; i < points.length; i++) {
                    const prev = points[i - 1];
                    const curr = points[i];
                    const next = points[i + 1];
                    if (next) {
                        const cp1x = prev.x + (curr.x - prev.x) / 3;
                        const cp1y = prev.y + (curr.y - prev.y) / 3;
                        const cp2x = curr.x - (next.x - curr.x) / 3;
                        const cp2y = curr.y - (next.y - curr.y) / 3;
                        ctx.beginPath();
                        ctx.moveTo(prev.x, prev.y);
                        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
                        ctx.stroke();
                    }
                    else {
                        ctx.beginPath();
                        ctx.moveTo(prev.x, prev.y);
                        ctx.lineTo(curr.x, curr.y);
                        ctx.stroke();
                    }
                }
                break;
            default:
                console.log('🧵 Using DEFAULT case for stitch type:', stitch.type);
                // Default line drawing for unknown types
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
                ctx.stroke();
        }
        // Reset composite operation
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
        // Dispatch custom event to signal texture update
        const textureUpdateEvent = new CustomEvent('embroideryTextureUpdate');
        window.dispatchEvent(textureUpdateEvent);
    };
    // Listen for embroidery events from 3D canvas
    useEffect(() => {
        const handleEmbroideryStart = (e) => {
            const { u, v } = e.detail;
            setIsDrawing(true);
            console.log('🧵 Starting embroidery with stitch type:', embroideryStitchType, 'Type of:', typeof embroideryStitchType);
            if (useEnhancedMode && enhancedGenerator) {
                // Use enhanced generator
                const config = {
                    type: embroideryStitchType,
                    color: embroideryColor,
                    thickness: embroideryThickness,
                    opacity: embroideryOpacity,
                    threadType: embroideryThreadType,
                    quality: 'high'
                };
                const newStitch = enhancedGenerator.generateStitchFromInput([{ x: u, y: v, pressure: 0.5, timestamp: Date.now() }], config);
                setCurrentStitch(newStitch);
            }
            else {
                // Fallback to original method
                const newStitch = {
                    id: `stitch_${Date.now()}`,
                    type: embroideryStitchType,
                    points: [{ x: u, y: v }],
                    color: embroideryColor,
                    threadType: embroideryThreadType,
                    thickness: embroideryThickness,
                    opacity: embroideryOpacity
                };
                console.log('🧵 Created stitch object:', newStitch);
                setCurrentStitch(newStitch);
            }
        };
        const handleEmbroideryMove = (e) => {
            if (!isDrawing || !currentStitch)
                return;
            const { u, v } = e.detail;
            // Throttle move events to prevent excessive calculations
            const now = Date.now();
            if (currentStitch.lastMoveTime && now - currentStitch.lastMoveTime < 32) { // ~30fps for better performance
                return;
            }
            const newStitch = {
                ...currentStitch,
                points: [...currentStitch.points, { x: u, y: v }],
                lastMoveTime: now
            };
            setCurrentStitch(newStitch);
            console.log('🧵 Move event - stitch type:', newStitch.type, 'points:', newStitch.points.length);
            // Draw the current stitch on the 3D model
            drawStitchOnModel(newStitch);
        };
        const handleEmbroideryEnd = () => {
            if (!isDrawing || !currentStitch)
                return;
            setIsDrawing(false);
            if (useEnhancedMode && enhancedManager) {
                // Use enhanced manager for better persistence
                const stitchId = enhancedManager.addStitch(currentStitch);
                const allStitches = enhancedManager.getAllStitches();
                setEmbroideryStitches(allStitches);
                console.log('✅ Stitch added to enhanced manager:', stitchId);
            }
            else {
                // Fallback to original method
                setEmbroideryStitches([...embroideryStitches, currentStitch]);
            }
            setCurrentStitch(null);
        };
        window.addEventListener('embroideryStart', handleEmbroideryStart);
        window.addEventListener('embroideryMove', handleEmbroideryMove);
        window.addEventListener('embroideryEnd', handleEmbroideryEnd);
        return () => {
            window.removeEventListener('embroideryStart', handleEmbroideryStart);
            window.removeEventListener('embroideryMove', handleEmbroideryMove);
            window.removeEventListener('embroideryEnd', handleEmbroideryEnd);
        };
    }, [isDrawing, currentStitch, embroideryStitchType, embroideryColor, embroideryThreadType, embroideryThickness, embroideryOpacity, setEmbroideryStitches, composedCanvas]);
    // Redraw when stitches change (optimized with debouncing)
    useEffect(() => {
        debouncedDrawStitches();
    }, [embroideryStitches, currentStitch, debouncedDrawStitches]);
    // Performance monitoring effect
    useEffect(() => {
        adjustQualityForPerformance();
    }, [adjustQualityForPerformance]);
    // Debug stitch type changes
    useEffect(() => {
        console.log('🧵 Current stitch type:', embroideryStitchType);
    }, [embroideryStitchType]);
    // Check backend connection on mount
    useEffect(() => {
        checkBackendConnection();
    }, []);
    // Cleanup effect to prevent memory leaks
    useEffect(() => {
        return () => {
            // Cancel any pending frame requests
            if (frameRequestRef.current) {
                cancelAnimationFrame(frameRequestRef.current);
            }
            // Clear debounce timeout
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
            // Dispose of advanced systems
            if (advancedEngineRef.current) {
                try {
                    advancedEngineRef.current.dispose();
                }
                catch (error) {
                    console.warn('Error disposing advanced engine:', error);
                }
            }
            if (textureSystemRef.current) {
                try {
                    textureSystemRef.current.dispose();
                }
                catch (error) {
                    console.warn('Error disposing texture system:', error);
                }
            }
            if (lightingSystemRef.current) {
                try {
                    lightingSystemRef.current.dispose();
                }
                catch (error) {
                    console.warn('Error disposing lighting system:', error);
                }
            }
        };
    }, []);
    return (_jsxs(_Fragment, { children: [_jsx("style", { children: `
          .embroidery-controls::-webkit-scrollbar {
            width: 6px;
          }
          .embroidery-controls::-webkit-scrollbar-track {
            background: #1E293B;
          }
          .embroidery-controls::-webkit-scrollbar-thumb {
            background: #475569;
            border-radius: 3px;
          }
          .embroidery-controls::-webkit-scrollbar-thumb:hover {
            background: #64748B;
          }
        ` }), _jsxs("div", { className: "embroidery-tool-panel", style: {
                    background: 'transparent', // Remove background since parent has it
                    color: 'white',
                    height: '100%',
                    width: '100%',
                    overflow: 'hidden',
                    padding: '0',
                    display: 'flex',
                    flexDirection: 'column'
                }, children: [_jsxs("div", { className: "tool-header", style: {
                            background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
                            color: 'white',
                            padding: '16px',
                            textAlign: 'center',
                            position: 'sticky',
                            top: 0,
                            zIndex: 10
                        }, children: [_jsx("h3", { style: { margin: 0, fontSize: '18px', fontWeight: '600' }, children: "\uD83E\uDDF5 Embroidery Tool" }), _jsxs("div", { className: "tool-status", style: { marginTop: '4px', display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }, children: [_jsx("span", { className: `status-indicator ${isDrawing ? 'drawing' : 'idle'}`, style: {
                                            padding: '4px 8px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            background: isDrawing ? '#10B981' : '#6B7280',
                                            color: 'white'
                                        }, children: isDrawing ? 'Drawing' : 'Ready' }), _jsxs("span", { style: { fontSize: '11px', opacity: 0.8 }, children: [embroideryStitches.length, " stitches"] }), _jsx("span", { style: { fontSize: '10px', opacity: 0.7, color: enable4K ? '#10B981' : '#6B7280' }, children: enable4K ? '4K HD' : 'HD' }), embroideryAIEnabled && (_jsx("span", { style: { fontSize: '10px', opacity: 0.7 }, children: "\uD83E\uDD16 AI" }))] }), _jsxs("div", { className: "quality-control-panel", style: {
                                    background: 'rgba(0, 0, 0, 0.3)',
                                    padding: '12px',
                                    borderBottom: '1px solid #334155',
                                    marginBottom: '8px'
                                }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }, children: [_jsx("span", { style: { fontSize: '12px', fontWeight: '600', color: '#8B5CF6' }, children: "\uD83C\uDFA8 4K HD Quality" }), _jsx("div", { style: { display: 'flex', gap: '4px' }, children: ['low', 'medium', 'high', 'ultra'].map((quality) => (_jsx("button", { onClick: () => setRenderQuality(quality), style: {
                                                        padding: '2px 6px',
                                                        fontSize: '10px',
                                                        borderRadius: '4px',
                                                        background: renderQuality === quality ? '#8B5CF6' : '#374151',
                                                        color: 'white',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        textTransform: 'capitalize'
                                                    }, children: quality }, quality))) })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }, children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '4px' }, children: [_jsx("input", { type: "checkbox", checked: enable4K, onChange: (e) => setEnable4K(e.target.checked), style: { accentColor: '#8B5CF6' } }), "4K Resolution"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '4px' }, children: [_jsx("input", { type: "checkbox", checked: enableWebGL, onChange: (e) => setEnableWebGL(e.target.checked), style: { accentColor: '#8B5CF6' } }), "WebGL2"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '4px' }, children: [_jsx("input", { type: "checkbox", checked: enablePBR, onChange: (e) => setEnablePBR(e.target.checked), style: { accentColor: '#8B5CF6' } }), "PBR Materials"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '4px' }, children: [_jsx("input", { type: "checkbox", checked: enableShadows, onChange: (e) => setEnableShadows(e.target.checked), style: { accentColor: '#8B5CF6' } }), "Shadows"] })] })] }), _jsxs("div", { style: { marginTop: '8px', display: 'flex', gap: '4px', justifyContent: 'center' }, children: [_jsx("button", { onClick: generateAIPattern, disabled: isAiGenerating || !embroideryPatternDescription.trim(), style: {
                                            padding: '4px 8px',
                                            fontSize: '10px',
                                            background: isAiGenerating ? '#6B7280' : '#22c55e',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: isAiGenerating ? 'not-allowed' : 'pointer',
                                            opacity: isAiGenerating ? 0.6 : 1
                                        }, children: isAiGenerating ? 'AI Generating...' : '🤖 AI Generate' }), _jsx("button", { onClick: analyzePattern, disabled: embroideryStitches.length === 0, style: {
                                            padding: '4px 8px',
                                            fontSize: '10px',
                                            background: embroideryStitches.length === 0 ? '#6B7280' : '#10B981',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: embroideryStitches.length === 0 ? 'not-allowed' : 'pointer',
                                            opacity: embroideryStitches.length === 0 ? 0.6 : 1
                                        }, children: "\uD83D\uDD0D Analyze" })] })] }), _jsxs("div", { className: "embroidery-controls", style: {
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            padding: '16px',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            maxWidth: '100%',
                            boxSizing: 'border-box'
                        }, children: [_jsxs("div", { className: "control-group", style: {
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(139, 92, 246, 0.3)'
                                }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '500',
                                            color: '#E2E8F0'
                                        }, children: "Pattern Description" }), _jsx("textarea", { value: embroideryPatternDescription, onChange: (e) => setEmbroideryPatternDescription(e.target.value), placeholder: "Describe the embroidery pattern you want to create...", rows: 3 }), _jsx("button", { onClick: generateAIPattern, disabled: isAiGenerating || !embroideryPatternDescription.trim(), className: "generate-btn", children: isAiGenerating ? 'AI Generating...' : '🤖 Generate with AI' })] }), _jsxs("div", { className: "control-group", style: {
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(139, 92, 246, 0.3)'
                                }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '500',
                                            color: '#E2E8F0'
                                        }, children: "Stitch Type" }), _jsx("select", { value: embroideryStitchType, onChange: (e) => {
                                            const newType = e.target.value;
                                            console.log(`🔄 STITCH TYPE CHANGED: ${embroideryStitchType} → ${newType}`);
                                            setEmbroideryStitchType(newType);
                                        }, style: {
                                            width: '100%',
                                            padding: '8px 12px',
                                            borderRadius: '6px',
                                            border: '1px solid #475569',
                                            background: '#1E293B',
                                            color: '#E2E8F0',
                                            fontSize: '14px'
                                        }, children: advancedStitchTypes.map((stitchType) => (_jsxs("option", { value: stitchType, children: [stitchType === 'satin' && '🧵 Satin Stitch', stitchType === 'fill' && '🟦 Fill Stitch', stitchType === 'outline' && '📏 Outline Stitch', stitchType === 'cross-stitch' && '❌ Cross Stitch', stitchType === 'chain' && '⛓️ Chain Stitch', stitchType === 'backstitch' && '↩️ Back Stitch', stitchType === 'french-knot' && '🎯 French Knot', stitchType === 'bullion' && '🌀 Bullion Stitch', stitchType === 'lazy-daisy' && '🌸 Lazy Daisy', stitchType === 'feather' && '🪶 Feather Stitch', stitchType === 'couching' && '🎀 Couching', stitchType === 'appliqué' && '🎨 Appliqué', stitchType === 'seed' && '🌱 Seed Stitch', stitchType === 'stem' && '🌿 Stem Stitch', stitchType === 'metallic' && '✨ Metallic Thread', stitchType === 'glow-thread' && '🌟 Glow Thread', stitchType === 'variegated' && '🌈 Variegated', stitchType === 'gradient' && '🎨 Gradient', !['satin', 'fill', 'outline', 'cross-stitch', 'chain', 'backstitch', 'french-knot', 'bullion', 'lazy-daisy', 'feather', 'couching', 'appliqué', 'seed', 'stem', 'metallic', 'glow-thread', 'variegated', 'gradient'].includes(stitchType) &&
                                                    `🧵 ${stitchType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`] }, stitchType))) })] }), _jsxs("div", { className: "control-group", children: [_jsx("label", { children: "Thread Type & Material" }), _jsxs("div", { style: { display: 'flex', gap: '8px', flexDirection: 'column' }, children: [_jsxs("select", { value: embroideryThreadType, onChange: (e) => setEmbroideryThreadType(e.target.value), style: { marginBottom: '4px' }, children: [_jsx("option", { value: "cotton", children: "Cotton" }), _jsx("option", { value: "polyester", children: "Polyester" }), _jsx("option", { value: "silk", children: "Silk" }), _jsx("option", { value: "metallic", children: "Metallic" }), _jsx("option", { value: "glow", children: "Glow-in-Dark" }), _jsx("option", { value: "variegated", children: "Variegated" })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '11px' }, children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '4px' }, children: [_jsx("input", { type: "checkbox", checked: enablePBR, onChange: (e) => setEnablePBR(e.target.checked), style: { accentColor: '#8B5CF6' } }), "PBR Materials"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '4px' }, children: [_jsx("input", { type: "checkbox", checked: enableNormalMapping, onChange: (e) => setEnableNormalMapping(e.target.checked), style: { accentColor: '#8B5CF6' } }), "Normal Maps"] })] })] })] }), _jsxs("div", { className: "control-group", children: [_jsx("label", { children: "Thread Color" }), _jsxs("div", { className: "color-input-group", children: [_jsx("input", { type: "color", value: embroideryColor, onChange: (e) => setEmbroideryColor(e.target.value) }), _jsx("button", { onClick: suggestColors, className: "suggest-btn", children: "Suggest Colors" })] })] }), _jsxs("div", { className: "control-group", children: [_jsxs("label", { children: ["Thread Thickness: ", embroideryThickness, "px"] }), _jsx("input", { type: "range", min: "1", max: "10", value: embroideryThickness, onChange: (e) => setEmbroideryThickness(Number(e.target.value)) })] }), _jsxs("div", { className: "control-group", style: {
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(139, 92, 246, 0.3)'
                                }, children: [_jsxs("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '500',
                                            color: '#E2E8F0'
                                        }, children: ["Opacity: ", Math.round(embroideryOpacity * 100), "%"] }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.1", value: embroideryOpacity, onChange: (e) => setEmbroideryOpacity(Number(e.target.value)), style: {
                                            width: '100%',
                                            accentColor: '#8B5CF6'
                                        } })] }), _jsxs("div", { className: "control-group", style: {
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(139, 92, 246, 0.3)'
                                }, children: [_jsxs("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '500',
                                            color: '#E2E8F0'
                                        }, children: ["Stitch Density: ", Math.round(stitchDensity * 100), "%"] }), _jsx("input", { type: "range", min: "0.2", max: "0.8", step: "0.1", value: stitchDensity, onChange: (e) => setStitchDensity(Number(e.target.value)), style: {
                                            width: '100%',
                                            accentColor: '#8B5CF6'
                                        } }), _jsx("small", { style: { color: '#F59E0B', fontSize: '12px', fontWeight: '500' }, children: "\u26A0\uFE0F High density may cause lag - use 20%-60% for best performance" })] }), _jsx("div", { className: "control-group", style: {
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(139, 92, 246, 0.3)'
                                }, children: _jsxs("label", { style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontWeight: '500',
                                        color: '#E2E8F0'
                                    }, children: [_jsx("input", { type: "checkbox", checked: performanceMode, onChange: (e) => setPerformanceMode(e.target.checked), style: { accentColor: '#8B5CF6' } }), "\uD83D\uDE80 Performance Mode (Reduces quality for better speed)"] }) }), _jsxs("div", { className: "control-group", style: {
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(139, 92, 246, 0.3)'
                                }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '500',
                                            color: '#E2E8F0'
                                        }, children: "Stitch Direction" }), _jsxs("select", { value: stitchDirection, onChange: (e) => setStitchDirection(e.target.value), style: {
                                            width: '100%',
                                            padding: '8px',
                                            borderRadius: '4px',
                                            border: '1px solid rgba(139, 92, 246, 0.3)',
                                            background: 'rgba(15, 23, 42, 0.8)',
                                            color: '#E2E8F0',
                                            fontSize: '14px'
                                        }, children: [_jsx("option", { value: "diagonal", children: "Diagonal" }), _jsx("option", { value: "horizontal", children: "Horizontal" }), _jsx("option", { value: "vertical", children: "Vertical" }), _jsx("option", { value: "perpendicular", children: "Perpendicular" })] })] }), _jsxs("div", { className: "control-group", style: {
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(139, 92, 246, 0.3)'
                                }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '500',
                                            color: '#E2E8F0'
                                        }, children: "Underlay Type" }), _jsxs("select", { value: underlayType, onChange: (e) => setUnderlayType(e.target.value), style: {
                                            width: '100%',
                                            padding: '8px 12px',
                                            borderRadius: '6px',
                                            border: '1px solid #475569',
                                            background: '#1E293B',
                                            color: '#E2E8F0',
                                            fontSize: '14px'
                                        }, children: [_jsx("option", { value: "none", children: "\uD83D\uDEAB None" }), _jsx("option", { value: "center", children: "\uD83C\uDFAF Center" }), _jsx("option", { value: "contour", children: "\uD83D\uDD04 Contour" }), _jsx("option", { value: "zigzag", children: "\u26A1 Zigzag" })] })] }), _jsxs("div", { className: "control-group", style: {
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(139, 92, 246, 0.3)'
                                }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '500',
                                            color: '#E2E8F0'
                                        }, children: "Thread Palette" }), _jsx("div", { style: {
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(3, 1fr)',
                                            gap: '8px',
                                            marginBottom: '8px'
                                        }, children: threadPalette.map((color, index) => (_jsx("button", { onClick: () => setEmbroideryColor(color), style: {
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '8px',
                                                border: embroideryColor === color ? '3px solid #8B5CF6' : '2px solid #475569',
                                                background: color,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }, title: `Select ${color}` }, index))) }), _jsx("button", { onClick: () => {
                                            const newColor = prompt('Enter hex color (e.g., #FF0000):');
                                            if (newColor && /^#[0-9A-F]{6}$/i.test(newColor)) {
                                                setThreadPalette([...threadPalette, newColor]);
                                            }
                                        }, style: {
                                            width: '100%',
                                            padding: '8px',
                                            borderRadius: '6px',
                                            border: '1px solid #475569',
                                            background: '#1E293B',
                                            color: '#E2E8F0',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }, children: "+ Add Color" })] }), _jsx("div", { className: "control-group", children: _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: embroideryAIEnabled, onChange: (e) => setEmbroideryAIEnabled(e.target.checked) }), "Enable AI Analysis"] }) }), _jsxs("div", { className: "control-group", style: {
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(139, 92, 246, 0.3)'
                                }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '500',
                                            color: '#E2E8F0'
                                        }, children: "Stitch Direction" }), _jsxs("select", { value: stitchDirection, onChange: (e) => setStitchDirection(e.target.value), style: {
                                            width: '100%',
                                            padding: '8px 12px',
                                            borderRadius: '6px',
                                            border: '1px solid #475569',
                                            background: '#1E293B',
                                            color: '#E2E8F0',
                                            fontSize: '14px'
                                        }, children: [_jsx("option", { value: "horizontal", children: "\u2194\uFE0F Horizontal" }), _jsx("option", { value: "vertical", children: "\u2195\uFE0F Vertical" }), _jsx("option", { value: "diagonal", children: "\u2197\uFE0F Diagonal" }), _jsx("option", { value: "radial", children: "\u26A1 Radial" })] })] }), _jsxs("div", { className: "control-group", style: {
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(139, 92, 246, 0.3)'
                                }, children: [_jsxs("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '500',
                                            color: '#E2E8F0'
                                        }, children: ["Stitch Spacing: ", stitchSpacing, "px"] }), _jsx("input", { type: "range", min: "0.1", max: "2", step: "0.1", value: stitchSpacing, onChange: (e) => setStitchSpacing(Number(e.target.value)), style: {
                                            width: '100%',
                                            accentColor: '#8B5CF6'
                                        } })] }), _jsxs("div", { className: "control-group", style: {
                                    background: 'rgba(34, 197, 94, 0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                    marginBottom: '12px'
                                }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '500',
                                            color: '#22C55E'
                                        }, children: "Professional Controls" }), _jsxs("div", { style: { marginBottom: '8px' }, children: [_jsxs("label", { style: { fontSize: '12px', color: '#22C55E' }, children: ["Stitch Density: ", stitchDensity, "x"] }), _jsx("input", { type: "range", min: "0.5", max: "2.0", step: "0.1", value: stitchDensity, onChange: (e) => setStitchDensity(Number(e.target.value)), style: {
                                                    width: '100%',
                                                    accentColor: '#22C55E'
                                                } })] }), _jsxs("div", { style: { marginBottom: '8px' }, children: [_jsx("label", { style: { fontSize: '12px', color: '#22C55E' }, children: "Thread Texture:" }), _jsxs("select", { value: threadTexture, onChange: (e) => setThreadTexture(e.target.value), style: {
                                                    width: '100%',
                                                    padding: '4px',
                                                    borderRadius: '4px',
                                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                                    backgroundColor: 'rgba(34, 197, 94, 0.05)',
                                                    color: '#22C55E'
                                                }, children: [_jsx("option", { value: "smooth", children: "Smooth" }), _jsx("option", { value: "textured", children: "Textured" }), _jsx("option", { value: "metallic", children: "Metallic" }), _jsx("option", { value: "matte", children: "Matte" })] })] }), _jsxs("div", { style: { marginBottom: '8px' }, children: [_jsx("label", { style: { fontSize: '12px', color: '#22C55E' }, children: "Lighting:" }), _jsxs("select", { value: lightingDirection, onChange: (e) => setLightingDirection(e.target.value), style: {
                                                    width: '100%',
                                                    padding: '4px',
                                                    borderRadius: '4px',
                                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                                    backgroundColor: 'rgba(34, 197, 94, 0.05)',
                                                    color: '#22C55E'
                                                }, children: [_jsx("option", { value: "top-left", children: "Top Left" }), _jsx("option", { value: "top-right", children: "Top Right" }), _jsx("option", { value: "bottom-left", children: "Bottom Left" }), _jsx("option", { value: "bottom-right", children: "Bottom Right" })] })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: '12px', color: '#22C55E' }, children: "Fabric Type:" }), _jsxs("select", { value: fabricType, onChange: (e) => setFabricType(e.target.value), style: {
                                                    width: '100%',
                                                    padding: '4px',
                                                    borderRadius: '4px',
                                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                                    backgroundColor: 'rgba(34, 197, 94, 0.05)',
                                                    color: '#22C55E'
                                                }, children: [_jsx("option", { value: "cotton", children: "Cotton" }), _jsx("option", { value: "silk", children: "Silk" }), _jsx("option", { value: "denim", children: "Denim" }), _jsx("option", { value: "linen", children: "Linen" }), _jsx("option", { value: "polyester", children: "Polyester" })] })] }), _jsx("div", { children: _jsxs("label", { style: { fontSize: '12px', color: '#22C55E', display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("input", { type: "checkbox", checked: useEnhancedMode, onChange: (e) => setUseEnhancedMode(e.target.checked), style: { margin: 0 } }), "Enhanced Mode (Better Performance & Persistence)"] }) }), _jsxs("div", { style: {
                                            marginTop: '10px',
                                            padding: '8px',
                                            backgroundColor: memoryStats.isHealthy ? '#f0f9ff' : '#fef2f2',
                                            border: `1px solid ${memoryStats.isHealthy ? '#0ea5e9' : '#ef4444'}`,
                                            borderRadius: '4px',
                                            fontSize: '11px'
                                        }, children: [_jsx("div", { style: { fontWeight: 'bold', marginBottom: '4px', color: memoryStats.isHealthy ? '#0369a1' : '#dc2626' }, children: "Memory Management" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }, children: [_jsxs("div", { children: ["Usage: ", memoryStats.percentage.toFixed(1), "%"] }), _jsxs("div", { children: ["Cache: ", memoryStats.cacheEntries, " entries"] }), _jsxs("div", { children: ["Size: ", (memoryStats.cacheSize / 1024 / 1024).toFixed(1), "MB"] }), _jsxs("div", { children: ["Status: ", memoryStats.isHealthy ? '✅ Healthy' : '⚠️ High Usage'] })] }), _jsxs("div", { style: { marginTop: '4px', display: 'flex', gap: '4px' }, children: [_jsx("button", { onClick: () => enhancedMemoryManager.clearExpiredEntries(), style: {
                                                            fontSize: '10px',
                                                            padding: '2px 6px',
                                                            backgroundColor: '#3b82f6',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '2px',
                                                            cursor: 'pointer'
                                                        }, children: "Clear Expired" }), _jsx("button", { onClick: () => enhancedMemoryManager.clearAllCaches(), style: {
                                                            fontSize: '10px',
                                                            padding: '2px 6px',
                                                            backgroundColor: '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '2px',
                                                            cursor: 'pointer'
                                                        }, children: "Clear All" })] })] }), _jsxs("div", { style: {
                                            marginTop: '10px',
                                            padding: '8px',
                                            backgroundColor: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '4px',
                                            fontSize: '11px'
                                        }, children: [_jsx("div", { style: { fontWeight: 'bold', marginBottom: '4px', color: '#475569' }, children: "Performance Stats" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }, children: [_jsxs("div", { children: ["FPS: ", performanceStats.fps] }), _jsxs("div", { children: ["Render: ", performanceStats.renderTime, "ms"] }), _jsxs("div", { children: ["Stitches: ", performanceStats.stitchCount] }), _jsxs("div", { children: ["Drops: ", performanceStats.frameDrops] })] })] }), (() => {
                                        const activeAlerts = simplePerformanceMonitor.getActiveAlerts();
                                        return activeAlerts.length > 0 && (_jsxs("div", { style: {
                                                marginTop: '10px',
                                                padding: '8px',
                                                backgroundColor: '#fef2f2',
                                                border: '1px solid #ef4444',
                                                borderRadius: '4px',
                                                fontSize: '11px'
                                            }, children: [_jsx("div", { style: { fontWeight: 'bold', marginBottom: '4px', color: '#dc2626' }, children: "Performance Alerts" }), activeAlerts.map(alert => (_jsxs("div", { style: {
                                                        marginBottom: '2px',
                                                        padding: '2px 4px',
                                                        backgroundColor: alert.severity === 'CRITICAL' ? '#fecaca' : '#fef3c7',
                                                        borderRadius: '2px',
                                                        fontSize: '10px'
                                                    }, children: [_jsxs("span", { style: { fontWeight: 'bold' }, children: ["[", alert.severity, "]"] }), " ", alert.message] }, alert.id)))] }));
                                    })(), errorCount > 0 && (_jsxs("div", { style: {
                                            marginTop: '10px',
                                            padding: '8px',
                                            backgroundColor: '#fef2f2',
                                            border: '1px solid #ef4444',
                                            borderRadius: '4px',
                                            fontSize: '11px'
                                        }, children: [_jsx("div", { style: { fontWeight: 'bold', marginBottom: '4px', color: '#dc2626' }, children: "Error Status" }), _jsxs("div", { children: ["Errors: ", errorCount] }), lastError && (_jsxs("div", { style: { color: '#dc2626', marginTop: '2px', marginBottom: '4px' }, children: ["Last: ", getErrorMessage(lastError)] })), _jsxs("div", { style: { display: 'flex', gap: '4px', marginTop: '4px' }, children: [_jsx("button", { onClick: recoverFromError, style: {
                                                            fontSize: '10px',
                                                            padding: '2px 6px',
                                                            backgroundColor: '#3b82f6',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '2px',
                                                            cursor: 'pointer'
                                                        }, children: "Recover" }), _jsx("button", { onClick: resetToSafeState, style: {
                                                            fontSize: '10px',
                                                            padding: '2px 6px',
                                                            backgroundColor: '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '2px',
                                                            cursor: 'pointer'
                                                        }, children: "Reset" })] })] })), _jsxs("div", { style: {
                                            marginTop: '10px',
                                            padding: '8px',
                                            backgroundColor: '#f0fdf4',
                                            border: '1px solid #22c55e',
                                            borderRadius: '4px',
                                            fontSize: '11px'
                                        }, children: [_jsx("div", { style: { fontWeight: 'bold', marginBottom: '4px', color: '#15803d' }, children: "AI Pattern Generation" }), _jsx("div", { style: { marginBottom: '8px', color: '#166534' }, children: "Advanced AI-powered pattern generation and optimization" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '8px' }, children: [_jsxs("div", { children: ["Confidence: ", (aiConfidence * 100).toFixed(1), "%"] }), _jsxs("div", { children: ["Patterns: ", aiPatterns.length] }), _jsxs("div", { children: ["Suggestions: ", aiSuggestions.length] }), _jsxs("div", { children: ["Status: ", isAiGenerating ? '🔄 Generating...' : '✅ Ready'] })] }), aiSuggestions.length > 0 && (_jsxs("div", { style: { marginTop: '4px' }, children: [_jsx("div", { style: { fontWeight: 'bold', marginBottom: '2px' }, children: "AI Suggestions:" }), aiSuggestions.slice(0, 3).map((suggestion, index) => (_jsxs("div", { style: { fontSize: '10px', color: '#166534', marginBottom: '1px' }, children: ["\u2022 ", suggestion] }, index)))] }))] }), _jsxs("div", { style: {
                                            marginTop: '10px',
                                            padding: '8px',
                                            backgroundColor: qualitySummary.criticalIssues > 0 ? '#fef2f2' : '#f8fafc',
                                            border: `1px solid ${qualitySummary.criticalIssues > 0 ? '#ef4444' : '#e2e8f0'}`,
                                            borderRadius: '4px',
                                            fontSize: '11px'
                                        }, children: [_jsx("div", { style: { fontWeight: 'bold', marginBottom: '4px', color: qualitySummary.criticalIssues > 0 ? '#dc2626' : '#374151' }, children: "Real-time Quality Analysis" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '8px' }, children: [_jsxs("div", { children: ["Quality: ", (qualitySummary.averageQuality * 100).toFixed(1), "%"] }), _jsxs("div", { children: ["Issues: ", qualitySummary.totalIssues] }), _jsxs("div", { children: ["Critical: ", qualitySummary.criticalIssues] }), _jsxs("div", { children: ["Suggestions: ", qualitySummary.totalSuggestions] })] }), qualityIssues.length > 0 && (_jsxs("div", { style: { marginTop: '4px' }, children: [_jsx("div", { style: { fontWeight: 'bold', marginBottom: '2px' }, children: "Quality Issues:" }), qualityIssues.slice(0, 3).map((issue, index) => (_jsxs("div", { style: {
                                                            fontSize: '10px',
                                                            color: issue.severity === 'critical' ? '#dc2626' : '#ea580c',
                                                            marginBottom: '1px',
                                                            padding: '2px 4px',
                                                            backgroundColor: issue.severity === 'critical' ? '#fecaca' : '#fed7aa',
                                                            borderRadius: '2px'
                                                        }, children: ["[", issue.severity.toUpperCase(), "] ", issue.description] }, index)))] }))] }), _jsxs("div", { style: {
                                            marginTop: '10px',
                                            padding: '8px',
                                            backgroundColor: patternAnalysis?.score < 70 ? '#fef3c7' : '#f0f9ff',
                                            border: `1px solid ${patternAnalysis?.score < 70 ? '#f59e0b' : '#0ea5e9'}`,
                                            borderRadius: '4px',
                                            fontSize: '11px'
                                        }, children: [_jsx("div", { style: { fontWeight: 'bold', marginBottom: '4px', color: patternAnalysis?.score < 70 ? '#d97706' : '#0369a1' }, children: "Intelligent Optimization" }), patternAnalysis && (_jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '8px' }, children: [_jsxs("div", { children: ["Score: ", patternAnalysis.score, "/100"] }), _jsxs("div", { children: ["Complexity: ", (patternAnalysis.complexity * 100).toFixed(1), "%"] }), _jsxs("div", { children: ["Efficiency: ", (patternAnalysis.efficiency * 100).toFixed(1), "%"] }), _jsxs("div", { children: ["Quality: ", (patternAnalysis.quality * 100).toFixed(1), "%"] })] })), optimizationSuggestions.length > 0 && (_jsxs("div", { style: { marginTop: '4px' }, children: [_jsx("div", { style: { fontWeight: 'bold', marginBottom: '2px' }, children: "Optimization Suggestions:" }), optimizationSuggestions.slice(0, 3).map((suggestion, index) => (_jsxs("div", { style: {
                                                            fontSize: '10px',
                                                            color: '#374151',
                                                            marginBottom: '2px',
                                                            padding: '2px 4px',
                                                            backgroundColor: '#ffffff',
                                                            border: '1px solid #e5e7eb',
                                                            borderRadius: '2px',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center'
                                                        }, children: [_jsx("span", { children: suggestion.title }), _jsx("button", { onClick: () => applyOptimization(suggestion.id), disabled: isOptimizing, style: {
                                                                    fontSize: '9px',
                                                                    padding: '1px 4px',
                                                                    backgroundColor: isOptimizing ? '#9ca3af' : '#3b82f6',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '2px',
                                                                    cursor: isOptimizing ? 'not-allowed' : 'pointer'
                                                                }, children: isOptimizing ? 'Applying...' : 'Apply' })] }, index)))] }))] }), _jsxs("div", { style: {
                                            marginTop: '10px',
                                            padding: '8px',
                                            backgroundColor: '#faf5ff',
                                            border: '1px solid #a855f7',
                                            borderRadius: '4px',
                                            fontSize: '11px'
                                        }, children: [_jsx("div", { style: { fontWeight: 'bold', marginBottom: '4px', color: '#7c3aed' }, children: "AI Style Transfer" }), _jsxs("div", { style: { marginBottom: '8px' }, children: [_jsxs("div", { style: { marginBottom: '4px' }, children: [_jsx("label", { style: { fontSize: '10px', color: '#6b7280' }, children: "Style:" }), _jsx("select", { value: selectedStyle, onChange: (e) => setSelectedStyle(e.target.value), style: {
                                                                    fontSize: '10px',
                                                                    padding: '2px 4px',
                                                                    marginLeft: '4px',
                                                                    border: '1px solid #d1d5db',
                                                                    borderRadius: '2px',
                                                                    backgroundColor: '#ffffff'
                                                                }, children: styleProfiles.map(profile => (_jsx("option", { value: profile.id, children: profile.name }, profile.id))) })] }), _jsxs("div", { style: { marginBottom: '4px' }, children: [_jsxs("label", { style: { fontSize: '10px', color: '#6b7280' }, children: ["Intensity: ", (styleIntensity * 100).toFixed(0), "%"] }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.1", value: styleIntensity, onChange: (e) => setStyleIntensity(parseFloat(e.target.value)), style: { width: '100%', marginTop: '2px' } })] })] }), _jsx("button", { onClick: applyStyleTransfer, disabled: isStyleTransferring || embroideryStitches.length === 0, style: {
                                                    fontSize: '10px',
                                                    padding: '4px 8px',
                                                    backgroundColor: isStyleTransferring ? '#9ca3af' : '#a855f7',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '2px',
                                                    cursor: isStyleTransferring ? 'not-allowed' : 'pointer',
                                                    width: '100%'
                                                }, children: isStyleTransferring ? `🔄 Transferring... ${styleTransferProgress.toFixed(0)}%` : '🎨 Apply Style Transfer' }), styleTransferResults.length > 0 && (_jsxs("div", { style: { marginTop: '4px', fontSize: '10px', color: '#6b7280' }, children: ["Last: ", styleTransferResults[styleTransferResults.length - 1].styleProfile.name] }))] }), _jsxs("div", { style: {
                                            marginTop: '10px',
                                            padding: '8px',
                                            backgroundColor: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '4px',
                                            fontSize: '11px'
                                        }, children: [_jsx("div", { style: { fontWeight: 'bold', marginBottom: '4px', color: '#374151' }, children: "Microservices Architecture" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '8px' }, children: [_jsxs("div", { children: ["Services: ", Object.keys(servicesStatus).length] }), _jsxs("div", { children: ["Plugins: ", pluginsStatus.pluginsEnabled || 0] }), _jsxs("div", { children: ["Events: ", eventHistory.length] }), _jsxs("div", { children: ["Gateway: ", apiGatewayStatus.status || 'unknown'] })] }), Object.entries(servicesStatus).map(([service, status]) => (_jsxs("div", { style: {
                                                    fontSize: '10px',
                                                    color: status.status === 'healthy' ? '#059669' : status.status === 'degraded' ? '#d97706' : '#dc2626',
                                                    marginBottom: '1px',
                                                    padding: '2px 4px',
                                                    backgroundColor: status.status === 'healthy' ? '#d1fae5' : status.status === 'degraded' ? '#fef3c7' : '#fecaca',
                                                    borderRadius: '2px'
                                                }, children: [service, ": ", status.status] }, service)))] }), _jsxs("div", { style: {
                                            marginTop: '10px',
                                            padding: '8px',
                                            backgroundColor: '#fefce8',
                                            border: '1px solid #eab308',
                                            borderRadius: '4px',
                                            fontSize: '11px'
                                        }, children: [_jsx("div", { style: { fontWeight: 'bold', marginBottom: '4px', color: '#a16207' }, children: "Event Bus" }), _jsx("div", { style: { marginBottom: '8px', color: '#713f12' }, children: "Real-time event processing and communication" }), eventHistory.length > 0 && (_jsxs("div", { style: { marginTop: '4px' }, children: [_jsx("div", { style: { fontWeight: 'bold', marginBottom: '2px' }, children: "Recent Events:" }), eventHistory.slice(0, 3).map((event, index) => (_jsxs("div", { style: {
                                                            fontSize: '10px',
                                                            color: '#713f12',
                                                            marginBottom: '1px',
                                                            padding: '2px 4px',
                                                            backgroundColor: '#ffffff',
                                                            borderRadius: '2px',
                                                            border: '1px solid #eab308'
                                                        }, children: [event.type, " - ", new Date(event.timestamp).toLocaleTimeString()] }, index)))] }))] }), _jsxs("div", { style: {
                                            marginTop: '10px',
                                            padding: '8px',
                                            backgroundColor: '#f0fdf4',
                                            border: '1px solid #22c55e',
                                            borderRadius: '4px',
                                            fontSize: '11px'
                                        }, children: [_jsx("div", { style: { fontWeight: 'bold', marginBottom: '4px', color: '#15803d' }, children: "Plugin System" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '8px' }, children: [_jsxs("div", { children: ["Loaded: ", pluginsStatus.pluginsLoaded || 0] }), _jsxs("div", { children: ["Enabled: ", pluginsStatus.pluginsEnabled || 0] }), _jsxs("div", { children: ["Status: ", pluginsStatus.status || 'unknown'] }), _jsxs("div", { children: ["Initialized: ", pluginsStatus.systemInitialized ? '✅' : '❌'] })] })] }), _jsxs("div", { style: {
                                            marginTop: '10px',
                                            padding: '8px',
                                            backgroundColor: wasmStatus.available ? '#f0f9ff' : '#fef2f2',
                                            border: `1px solid ${wasmStatus.available ? '#0ea5e9' : '#ef4444'}`,
                                            borderRadius: '4px',
                                            fontSize: '11px'
                                        }, children: [_jsx("div", { style: { fontWeight: 'bold', marginBottom: '4px', color: wasmStatus.available ? '#0369a1' : '#dc2626' }, children: "WebAssembly Calculator" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '8px' }, children: [_jsxs("div", { children: ["Available: ", wasmStatus.available ? '✅' : '❌'] }), _jsxs("div", { children: ["Calculations: ", wasmStatus.performance?.calculationCount || 0] }), _jsxs("div", { children: ["Avg Time: ", wasmStatus.performance?.averageTime?.toFixed(2) || 0, "ms"] }), _jsxs("div", { children: ["Memory: ", wasmStatus.performance?.memoryUsage || 0, "%"] })] }), _jsx("div", { style: { marginTop: '4px' }, children: _jsxs("label", { style: { fontSize: '10px', color: '#6b7280' }, children: [_jsx("input", { type: "checkbox", checked: enableWASM, onChange: (e) => setEnableWASM(e.target.checked), style: { marginRight: '4px' } }), "Enable WebAssembly"] }) })] }), _jsxs("div", { style: {
                                            marginTop: '10px',
                                            padding: '8px',
                                            backgroundColor: enable3D ? '#fefce8' : '#f8fafc',
                                            border: `1px solid ${enable3D ? '#eab308' : '#e2e8f0'}`,
                                            borderRadius: '4px',
                                            fontSize: '11px'
                                        }, children: [_jsx("div", { style: { fontWeight: 'bold', marginBottom: '4px', color: enable3D ? '#a16207' : '#374151' }, children: "3D Visualization" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '8px' }, children: [_jsxs("div", { children: ["Renderer: ", threeDRenderer ? '✅' : '❌'] }), _jsxs("div", { children: ["Physics: ", enablePhysics ? '✅' : '❌'] }), _jsxs("div", { children: ["FPS: ", threeDRenderer?.getPerformanceStats()?.fps || 0] }), _jsxs("div", { children: ["Memory: ", threeDRenderer?.getPerformanceStats()?.memoryUsage || 0, "%"] })] }), _jsxs("div", { style: { marginTop: '4px' }, children: [_jsxs("label", { style: { fontSize: '10px', color: '#6b7280', marginRight: '8px' }, children: [_jsx("input", { type: "checkbox", checked: enable3D, onChange: (e) => setEnable3D(e.target.checked), style: { marginRight: '4px' } }), "3D Mode"] }), _jsxs("label", { style: { fontSize: '10px', color: '#6b7280' }, children: [_jsx("input", { type: "checkbox", checked: enablePhysics, onChange: (e) => setEnablePhysics(e.target.checked), style: { marginRight: '4px' } }), "Physics"] })] })] }), _jsxs("div", { style: {
                                            marginTop: '10px',
                                            padding: '8px',
                                            backgroundColor: cloudStatus.available ? '#f0f9ff' : '#fef2f2',
                                            border: `1px solid ${cloudStatus.available ? '#0ea5e9' : '#ef4444'}`,
                                            borderRadius: '4px',
                                            fontSize: '11px'
                                        }, children: [_jsx("div", { style: { fontWeight: 'bold', marginBottom: '4px', color: cloudStatus.available ? '#0369a1' : '#dc2626' }, children: "Cloud Integration" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '8px' }, children: [_jsxs("div", { children: ["Status: ", cloudStatus.available ? '✅' : '❌'] }), _jsxs("div", { children: ["Provider: ", cloudStatus.provider || 'none'] }), _jsxs("div", { children: ["Patterns: ", cloudPatterns.length] }), _jsxs("div", { children: ["Sync: ", cloudSyncStatus.isOnline ? '✅' : '❌'] })] }), _jsx("div", { style: { marginTop: '4px' }, children: _jsxs("label", { style: { fontSize: '10px', color: '#6b7280' }, children: [_jsx("input", { type: "checkbox", checked: enableCloud, onChange: (e) => setEnableCloud(e.target.checked), style: { marginRight: '4px' } }), "Enable Cloud"] }) })] }), _jsxs("div", { style: {
                                            marginTop: '10px',
                                            padding: '8px',
                                            backgroundColor: enableARVR ? '#f0fdf4' : '#f8fafc',
                                            border: `1px solid ${enableARVR ? '#22c55e' : '#e2e8f0'}`,
                                            borderRadius: '4px',
                                            fontSize: '11px'
                                        }, children: [_jsx("div", { style: { fontWeight: 'bold', marginBottom: '4px', color: enableARVR ? '#15803d' : '#374151' }, children: "AR/VR Visualization" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '8px' }, children: [_jsxs("div", { children: ["Renderer: ", arVrRenderer ? '✅' : '❌'] }), _jsxs("div", { children: ["Session: ", arVrSession ? '✅' : '❌'] }), _jsxs("div", { children: ["Mode: ", arVrRenderer?.config?.mode || 'none'] }), _jsxs("div", { children: ["Tracking: ", arVrRenderer?.config?.tracking || 'none'] })] }), _jsx("div", { style: { marginTop: '4px' }, children: _jsxs("label", { style: { fontSize: '10px', color: '#6b7280' }, children: [_jsx("input", { type: "checkbox", checked: enableARVR, onChange: (e) => setEnableARVR(e.target.checked), style: { marginRight: '4px' } }), "Enable AR/VR"] }) })] }), _jsxs("div", { style: {
                                            marginTop: '10px',
                                            padding: '8px',
                                            backgroundColor: enableML ? '#fefce8' : '#f8fafc',
                                            border: `1px solid ${enableML ? '#eab308' : '#e2e8f0'}`,
                                            borderRadius: '4px',
                                            fontSize: '11px'
                                        }, children: [_jsx("div", { style: { fontWeight: 'bold', marginBottom: '4px', color: enableML ? '#a16207' : '#374151' }, children: "Machine Learning" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '8px' }, children: [_jsxs("div", { children: ["System: ", mlSystem ? '✅' : '❌'] }), _jsxs("div", { children: ["Models: ", mlModels.length] }), _jsxs("div", { children: ["Predictions: ", mlPredictions.length] }), _jsxs("div", { children: ["Status: ", mlSystem ? 'active' : 'inactive'] })] }), _jsx("div", { style: { marginTop: '4px' }, children: _jsxs("label", { style: { fontSize: '10px', color: '#6b7280' }, children: [_jsx("input", { type: "checkbox", checked: enableML, onChange: (e) => setEnableML(e.target.checked), style: { marginRight: '4px' } }), "Enable ML"] }) })] }), _jsxs("div", { style: {
                                            marginTop: '10px',
                                            padding: '8px',
                                            backgroundColor: enableSecurity ? '#fef2f2' : '#f8fafc',
                                            border: `1px solid ${enableSecurity ? '#ef4444' : '#e2e8f0'}`,
                                            borderRadius: '4px',
                                            fontSize: '11px'
                                        }, children: [_jsx("div", { style: { fontWeight: 'bold', marginBottom: '4px', color: enableSecurity ? '#dc2626' : '#374151' }, children: "Security Framework" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '8px' }, children: [_jsxs("div", { children: ["Framework: ", securityFramework ? '✅' : '❌'] }), _jsxs("div", { children: ["Threats: ", securityThreats.length] }), _jsxs("div", { children: ["Compliance: ", complianceReports.length] }), _jsxs("div", { children: ["Status: ", securityFramework ? 'active' : 'inactive'] })] }), _jsx("div", { style: { marginTop: '4px' }, children: _jsxs("label", { style: { fontSize: '10px', color: '#6b7280' }, children: [_jsx("input", { type: "checkbox", checked: enableSecurity, onChange: (e) => setEnableSecurity(e.target.checked), style: { marginRight: '4px' } }), "Enable Security"] }) })] }), _jsxs("div", { style: {
                                            marginTop: '10px',
                                            padding: '8px',
                                            backgroundColor: '#f0f9ff',
                                            border: '1px solid #0ea5e9',
                                            borderRadius: '4px',
                                            fontSize: '11px'
                                        }, children: [_jsx("div", { style: { fontWeight: 'bold', marginBottom: '4px', color: '#0369a1' }, children: "Testing & Quality Assurance" }), _jsx("div", { style: { marginBottom: '8px', color: '#0c4a6e' }, children: "Run automated tests to verify system health and performance" }), _jsx(TestRunner, { onTestComplete: (report) => {
                                                    console.log('🧪 Test execution completed:', report);
                                                    if (report.failed > 0) {
                                                        setLastError(`${report.failed} tests failed`);
                                                        setErrorCount(prev => prev + 1);
                                                    }
                                                } })] })] }), _jsxs("div", { className: "control-group", style: {
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(139, 92, 246, 0.3)'
                                }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '500',
                                            color: '#E2E8F0'
                                        }, children: "Pattern Library" }), _jsxs("button", { onClick: () => setShowPatternLibrary(!showPatternLibrary), style: {
                                            width: '100%',
                                            padding: '8px 12px',
                                            borderRadius: '6px',
                                            border: '1px solid #475569',
                                            background: '#1E293B',
                                            color: '#E2E8F0',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }, children: [showPatternLibrary ? 'Hide' : 'Show', " Patterns"] }), showPatternLibrary && (_jsx("div", { style: {
                                            marginTop: '8px',
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(2, 1fr)',
                                            gap: '8px'
                                        }, children: embroideryPatterns.map((pattern) => (_jsx("button", { onClick: () => {
                                                setSelectedPattern(pattern.id);
                                                setEmbroideryStitchType(pattern.type);
                                            }, style: {
                                                padding: '8px',
                                                borderRadius: '6px',
                                                border: selectedPattern === pattern.id ? '2px solid #8B5CF6' : '1px solid #475569',
                                                background: selectedPattern === pattern.id ? 'rgba(139, 92, 246, 0.2)' : '#1E293B',
                                                color: '#E2E8F0',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }, children: pattern.name }, pattern.id))) }))] }), _jsxs("div", { className: "control-group", style: {
                                    background: 'rgba(255, 193, 7, 0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 193, 7, 0.3)',
                                    marginBottom: '12px'
                                }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '500',
                                            color: '#FFC107'
                                        }, children: "\u26A1 Performance Stats" }), _jsxs("div", { style: { fontSize: '11px', color: '#B0BEC5' }, children: [_jsxs("div", { children: ["Render Time: ", performanceStats.renderTime, "ms"] }), _jsxs("div", { children: ["Stitch Count: ", performanceStats.stitchCount] }), _jsxs("div", { children: ["Memory: ", performanceStats.memoryUsage, "MB"] }), _jsx("div", { style: {
                                                    marginTop: '4px',
                                                    padding: '4px',
                                                    background: performanceModeRef.current ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 255, 0, 0.2)',
                                                    borderRadius: '4px',
                                                    fontSize: '10px'
                                                }, children: performanceModeRef.current ? '🔧 Performance Mode' : '✅ Normal Mode' })] })] }), _jsxs("div", { className: "control-group", style: {
                                    background: 'rgba(255, 20, 147, 0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 20, 147, 0.3)',
                                    marginBottom: '12px'
                                }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '500',
                                            color: '#FF1493'
                                        }, children: "\uD83C\uDF1F Ultra-Realistic Satin Stitch" }), _jsxs("div", { style: { marginBottom: '8px' }, children: [_jsx("label", { style: { fontSize: '11px', color: '#FF1493', display: 'block', marginBottom: '4px' }, children: "Thread Type:" }), _jsxs("select", { value: satinMaterial.threadType, onChange: (e) => setSatinMaterial(prev => ({ ...prev, threadType: e.target.value })), style: { width: '100%', padding: '4px', fontSize: '11px', borderRadius: '4px', border: '1px solid #FF1493' }, children: [_jsx("option", { value: "cotton", children: "Cotton" }), _jsx("option", { value: "polyester", children: "Polyester" }), _jsx("option", { value: "silk", children: "Silk" }), _jsx("option", { value: "metallic", children: "Metallic" }), _jsx("option", { value: "glow", children: "Glow" }), _jsx("option", { value: "variegated", children: "Variegated" })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontSize: '10px', color: '#FF1493' }, children: "Sheen:" }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.1", value: satinMaterial.sheen, onChange: (e) => setSatinMaterial(prev => ({ ...prev, sheen: parseFloat(e.target.value) })), style: { width: '100%' } }), _jsx("span", { style: { fontSize: '9px', color: '#FF1493' }, children: satinMaterial.sheen.toFixed(1) })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: '10px', color: '#FF1493' }, children: "Roughness:" }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.1", value: satinMaterial.roughness, onChange: (e) => setSatinMaterial(prev => ({ ...prev, roughness: parseFloat(e.target.value) })), style: { width: '100%' } }), _jsx("span", { style: { fontSize: '9px', color: '#FF1493' }, children: satinMaterial.roughness.toFixed(1) })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontSize: '10px', color: '#FF1493' }, children: "Height:" }), _jsx("input", { type: "range", min: "0", max: "2", step: "0.1", value: satin3DProperties.height, onChange: (e) => setSatin3DProperties(prev => ({ ...prev, height: parseFloat(e.target.value) })), style: { width: '100%' } }), _jsxs("span", { style: { fontSize: '9px', color: '#FF1493' }, children: [satin3DProperties.height.toFixed(1), "mm"] })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: '10px', color: '#FF1493' }, children: "Density:" }), _jsx("input", { type: "range", min: "2", max: "20", step: "1", value: satin3DProperties.stitchDensity, onChange: (e) => setSatin3DProperties(prev => ({ ...prev, stitchDensity: parseFloat(e.target.value) })), style: { width: '100%' } }), _jsxs("span", { style: { fontSize: '9px', color: '#FF1493' }, children: [satin3DProperties.stitchDensity, "/mm"] })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontSize: '10px', color: '#FF1493' }, children: "Zigzag Amp:" }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.1", value: satin3DProperties.zigzagAmplitude, onChange: (e) => setSatin3DProperties(prev => ({ ...prev, zigzagAmplitude: parseFloat(e.target.value) })), style: { width: '100%' } }), _jsx("span", { style: { fontSize: '9px', color: '#FF1493' }, children: satin3DProperties.zigzagAmplitude.toFixed(1) })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: '10px', color: '#FF1493' }, children: "Zigzag Freq:" }), _jsx("input", { type: "range", min: "0.5", max: "5", step: "0.5", value: satin3DProperties.zigzagFrequency, onChange: (e) => setSatin3DProperties(prev => ({ ...prev, zigzagFrequency: parseFloat(e.target.value) })), style: { width: '100%' } }), _jsx("span", { style: { fontSize: '9px', color: '#FF1493' }, children: satin3DProperties.zigzagFrequency.toFixed(1) })] })] }), _jsx("button", { onClick: generateUltraRealisticSatin, style: {
                                            width: '100%',
                                            padding: '8px',
                                            fontSize: '11px',
                                            background: 'linear-gradient(135deg, #FF1493, #FF69B4)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            boxShadow: '0 2px 4px rgba(255, 20, 147, 0.3)'
                                        }, children: "\uD83C\uDF1F Generate Ultra-Realistic Satin" })] }), _jsxs("div", { className: "control-group", style: {
                                    background: 'rgba(0, 150, 255, 0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(0, 150, 255, 0.3)',
                                    marginBottom: '12px'
                                }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '500',
                                            color: '#0096FF'
                                        }, children: "\uD83C\uDFA8 Ultra-Realistic Fill Stitch" }), _jsxs("div", { style: { marginBottom: '8px' }, children: [_jsx("label", { style: { fontSize: '11px', color: '#0096FF', display: 'block', marginBottom: '4px' }, children: "Thread Type:" }), _jsxs("select", { value: fillMaterial.threadType, onChange: (e) => setFillMaterial(prev => ({ ...prev, threadType: e.target.value })), style: { width: '100%', padding: '4px', fontSize: '11px', borderRadius: '4px', border: '1px solid #0096FF' }, children: [_jsx("option", { value: "cotton", children: "Cotton" }), _jsx("option", { value: "polyester", children: "Polyester" }), _jsx("option", { value: "silk", children: "Silk" }), _jsx("option", { value: "metallic", children: "Metallic" }), _jsx("option", { value: "glow", children: "Glow" }), _jsx("option", { value: "variegated", children: "Variegated" })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontSize: '10px', color: '#0096FF' }, children: "Sheen:" }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.1", value: fillMaterial.sheen, onChange: (e) => setFillMaterial(prev => ({ ...prev, sheen: parseFloat(e.target.value) })), style: { width: '100%' } }), _jsx("span", { style: { fontSize: '9px', color: '#0096FF' }, children: fillMaterial.sheen.toFixed(1) })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: '10px', color: '#0096FF' }, children: "Roughness:" }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.1", value: fillMaterial.roughness, onChange: (e) => setFillMaterial(prev => ({ ...prev, roughness: parseFloat(e.target.value) })), style: { width: '100%' } }), _jsx("span", { style: { fontSize: '9px', color: '#0096FF' }, children: fillMaterial.roughness.toFixed(1) })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontSize: '10px', color: '#0096FF' }, children: "Height:" }), _jsx("input", { type: "range", min: "0", max: "2", step: "0.1", value: fill3DProperties.height, onChange: (e) => setFill3DProperties(prev => ({ ...prev, height: parseFloat(e.target.value) })), style: { width: '100%' } }), _jsxs("span", { style: { fontSize: '9px', color: '#0096FF' }, children: [fill3DProperties.height.toFixed(1), "mm"] })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: '10px', color: '#0096FF' }, children: "Density:" }), _jsx("input", { type: "range", min: "1", max: "10", step: "0.5", value: fill3DProperties.stitchDensity, onChange: (e) => setFill3DProperties(prev => ({ ...prev, stitchDensity: parseFloat(e.target.value) })), style: { width: '100%' } }), _jsxs("span", { style: { fontSize: '9px', color: '#0096FF' }, children: [fill3DProperties.stitchDensity.toFixed(1), "/mm"] })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontSize: '10px', color: '#0096FF' }, children: "Fill Density:" }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.1", value: fill3DProperties.fillDensity, onChange: (e) => setFill3DProperties(prev => ({ ...prev, fillDensity: parseFloat(e.target.value) })), style: { width: '100%' } }), _jsx("span", { style: { fontSize: '9px', color: '#0096FF' }, children: fill3DProperties.fillDensity.toFixed(1) })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: '10px', color: '#0096FF' }, children: "Fill Angle:" }), _jsx("input", { type: "range", min: "0", max: "180", step: "15", value: fill3DProperties.fillAngle, onChange: (e) => setFill3DProperties(prev => ({ ...prev, fillAngle: parseFloat(e.target.value) })), style: { width: '100%' } }), _jsxs("span", { style: { fontSize: '9px', color: '#0096FF' }, children: [fill3DProperties.fillAngle, "\u00B0"] })] })] }), _jsx("button", { onClick: generateUltraRealisticFill, style: {
                                            width: '100%',
                                            padding: '8px',
                                            fontSize: '11px',
                                            background: 'linear-gradient(135deg, #0096FF, #00BFFF)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            boxShadow: '0 2px 4px rgba(0, 150, 255, 0.3)'
                                        }, children: "\uD83C\uDFA8 Generate Ultra-Realistic Fill" })] }), _jsxs("div", { className: "control-group", style: {
                                    background: 'rgba(255, 165, 0, 0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 165, 0, 0.3)',
                                    marginBottom: '12px'
                                }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '500',
                                            color: '#FFA500'
                                        }, children: "\u274C Ultra-Realistic Cross-Stitch" }), _jsxs("div", { style: { marginBottom: '8px' }, children: [_jsx("label", { style: { fontSize: '11px', color: '#FFA500', display: 'block', marginBottom: '4px' }, children: "Thread Type:" }), _jsxs("select", { value: crossStitchMaterial.threadType, onChange: (e) => setCrossStitchMaterial(prev => ({ ...prev, threadType: e.target.value })), style: { width: '100%', padding: '4px', fontSize: '11px', borderRadius: '4px', border: '1px solid #FFA500' }, children: [_jsx("option", { value: "cotton", children: "Cotton" }), _jsx("option", { value: "polyester", children: "Polyester" }), _jsx("option", { value: "silk", children: "Silk" }), _jsx("option", { value: "metallic", children: "Metallic" }), _jsx("option", { value: "glow", children: "Glow" }), _jsx("option", { value: "variegated", children: "Variegated" })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontSize: '10px', color: '#FFA500' }, children: "Sheen:" }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.1", value: crossStitchMaterial.sheen, onChange: (e) => setCrossStitchMaterial(prev => ({ ...prev, sheen: parseFloat(e.target.value) })), style: { width: '100%' } }), _jsx("span", { style: { fontSize: '9px', color: '#FFA500' }, children: crossStitchMaterial.sheen.toFixed(1) })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: '10px', color: '#FFA500' }, children: "Roughness:" }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.1", value: crossStitchMaterial.roughness, onChange: (e) => setCrossStitchMaterial(prev => ({ ...prev, roughness: parseFloat(e.target.value) })), style: { width: '100%' } }), _jsx("span", { style: { fontSize: '9px', color: '#FFA500' }, children: crossStitchMaterial.roughness.toFixed(1) })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontSize: '10px', color: '#FFA500' }, children: "Height:" }), _jsx("input", { type: "range", min: "0", max: "2", step: "0.1", value: crossStitch3DProperties.height, onChange: (e) => setCrossStitch3DProperties(prev => ({ ...prev, height: parseFloat(e.target.value) })), style: { width: '100%' } }), _jsxs("span", { style: { fontSize: '9px', color: '#FFA500' }, children: [crossStitch3DProperties.height.toFixed(1), "mm"] })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: '10px', color: '#FFA500' }, children: "Density:" }), _jsx("input", { type: "range", min: "1", max: "10", step: "0.5", value: crossStitch3DProperties.stitchDensity, onChange: (e) => setCrossStitch3DProperties(prev => ({ ...prev, stitchDensity: parseFloat(e.target.value) })), style: { width: '100%' } }), _jsxs("span", { style: { fontSize: '9px', color: '#FFA500' }, children: [crossStitch3DProperties.stitchDensity.toFixed(1), "/mm"] })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontSize: '10px', color: '#FFA500' }, children: "Cross Size:" }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.1", value: crossStitch3DProperties.crossSize, onChange: (e) => setCrossStitch3DProperties(prev => ({ ...prev, crossSize: parseFloat(e.target.value) })), style: { width: '100%' } }), _jsx("span", { style: { fontSize: '9px', color: '#FFA500' }, children: crossStitch3DProperties.crossSize.toFixed(1) })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: '10px', color: '#FFA500' }, children: "Cross Angle:" }), _jsx("input", { type: "range", min: "0", max: "180", step: "15", value: crossStitch3DProperties.crossAngle, onChange: (e) => setCrossStitch3DProperties(prev => ({ ...prev, crossAngle: parseFloat(e.target.value) })), style: { width: '100%' } }), _jsxs("span", { style: { fontSize: '9px', color: '#FFA500' }, children: [crossStitch3DProperties.crossAngle, "\u00B0"] })] })] }), _jsx("button", { onClick: generateUltraRealisticCrossStitch, style: {
                                            width: '100%',
                                            padding: '8px',
                                            fontSize: '11px',
                                            background: 'linear-gradient(135deg, #FFA500, #FFD700)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            boxShadow: '0 2px 4px rgba(255, 165, 0, 0.3)'
                                        }, children: "\u274C Generate Ultra-Realistic Cross-Stitch" })] }), _jsxs("div", { className: "control-group", style: {
                                    background: 'rgba(50, 205, 50, 0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(50, 205, 50, 0.3)',
                                    marginBottom: '12px'
                                }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '500',
                                            color: '#32CD32'
                                        }, children: "\uD83D\uDCCF Ultra-Realistic Outline Stitch" }), _jsxs("div", { style: { marginBottom: '8px' }, children: [_jsx("label", { style: { fontSize: '11px', color: '#32CD32', display: 'block', marginBottom: '4px' }, children: "Thread Type:" }), _jsxs("select", { value: outlineMaterial.threadType, onChange: (e) => setOutlineMaterial(prev => ({ ...prev, threadType: e.target.value })), style: { width: '100%', padding: '4px', fontSize: '11px', borderRadius: '4px', border: '1px solid #32CD32' }, children: [_jsx("option", { value: "cotton", children: "Cotton" }), _jsx("option", { value: "polyester", children: "Polyester" }), _jsx("option", { value: "silk", children: "Silk" }), _jsx("option", { value: "metallic", children: "Metallic" }), _jsx("option", { value: "glow", children: "Glow" }), _jsx("option", { value: "variegated", children: "Variegated" })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontSize: '10px', color: '#32CD32' }, children: "Sheen:" }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.1", value: outlineMaterial.sheen, onChange: (e) => setOutlineMaterial(prev => ({ ...prev, sheen: parseFloat(e.target.value) })), style: { width: '100%' } }), _jsx("span", { style: { fontSize: '9px', color: '#32CD32' }, children: outlineMaterial.sheen.toFixed(1) })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: '10px', color: '#32CD32' }, children: "Roughness:" }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.1", value: outlineMaterial.roughness, onChange: (e) => setOutlineMaterial(prev => ({ ...prev, roughness: parseFloat(e.target.value) })), style: { width: '100%' } }), _jsx("span", { style: { fontSize: '9px', color: '#32CD32' }, children: outlineMaterial.roughness.toFixed(1) })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontSize: '10px', color: '#32CD32' }, children: "Height:" }), _jsx("input", { type: "range", min: "0", max: "2", step: "0.1", value: outline3DProperties.height, onChange: (e) => setOutline3DProperties(prev => ({ ...prev, height: parseFloat(e.target.value) })), style: { width: '100%' } }), _jsxs("span", { style: { fontSize: '9px', color: '#32CD32' }, children: [outline3DProperties.height.toFixed(1), "mm"] })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: '10px', color: '#32CD32' }, children: "Density:" }), _jsx("input", { type: "range", min: "1", max: "10", step: "0.5", value: outline3DProperties.stitchDensity, onChange: (e) => setOutline3DProperties(prev => ({ ...prev, stitchDensity: parseFloat(e.target.value) })), style: { width: '100%' } }), _jsxs("span", { style: { fontSize: '9px', color: '#32CD32' }, children: [outline3DProperties.stitchDensity.toFixed(1), "/mm"] })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontSize: '10px', color: '#32CD32' }, children: "Edge Sharpness:" }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.1", value: outline3DProperties.edgeSharpness, onChange: (e) => setOutline3DProperties(prev => ({ ...prev, edgeSharpness: parseFloat(e.target.value) })), style: { width: '100%' } }), _jsx("span", { style: { fontSize: '9px', color: '#32CD32' }, children: outline3DProperties.edgeSharpness.toFixed(1) })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: '10px', color: '#32CD32' }, children: "Curve Smoothing:" }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.1", value: outline3DProperties.curveSmoothing, onChange: (e) => setOutline3DProperties(prev => ({ ...prev, curveSmoothing: parseFloat(e.target.value) })), style: { width: '100%' } }), _jsx("span", { style: { fontSize: '9px', color: '#32CD32' }, children: outline3DProperties.curveSmoothing.toFixed(1) })] })] }), _jsx("button", { onClick: generateUltraRealisticOutline, style: {
                                            width: '100%',
                                            padding: '8px',
                                            fontSize: '11px',
                                            background: 'linear-gradient(135deg, #32CD32, #00FF7F)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            boxShadow: '0 2px 4px rgba(50, 205, 50, 0.3)'
                                        }, children: "\uD83D\uDCCF Generate Ultra-Realistic Outline" })] }), _jsxs("div", { className: "control-group", style: {
                                    background: 'rgba(138, 43, 226, 0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(138, 43, 226, 0.3)',
                                    marginBottom: '12px'
                                }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '500',
                                            color: '#8A2BE2'
                                        }, children: "\uD83D\uDD17 Ultra-Realistic Chain Stitch" }), _jsxs("div", { style: { marginBottom: '8px' }, children: [_jsx("label", { style: { fontSize: '11px', color: '#8A2BE2', display: 'block', marginBottom: '4px' }, children: "Thread Type:" }), _jsxs("select", { value: chainMaterial.threadType, onChange: (e) => setChainMaterial(prev => ({ ...prev, threadType: e.target.value })), style: { width: '100%', padding: '4px', fontSize: '11px', borderRadius: '4px', border: '1px solid #8A2BE2' }, children: [_jsx("option", { value: "cotton", children: "Cotton" }), _jsx("option", { value: "polyester", children: "Polyester" }), _jsx("option", { value: "silk", children: "Silk" }), _jsx("option", { value: "metallic", children: "Metallic" }), _jsx("option", { value: "glow", children: "Glow" }), _jsx("option", { value: "variegated", children: "Variegated" })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontSize: '10px', color: '#8A2BE2' }, children: "Sheen:" }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.1", value: chainMaterial.sheen, onChange: (e) => setChainMaterial(prev => ({ ...prev, sheen: parseFloat(e.target.value) })), style: { width: '100%' } }), _jsx("span", { style: { fontSize: '9px', color: '#8A2BE2' }, children: chainMaterial.sheen.toFixed(1) })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: '10px', color: '#8A2BE2' }, children: "Roughness:" }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.1", value: chainMaterial.roughness, onChange: (e) => setChainMaterial(prev => ({ ...prev, roughness: parseFloat(e.target.value) })), style: { width: '100%' } }), _jsx("span", { style: { fontSize: '9px', color: '#8A2BE2' }, children: chainMaterial.roughness.toFixed(1) })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontSize: '10px', color: '#8A2BE2' }, children: "Height:" }), _jsx("input", { type: "range", min: "0", max: "2", step: "0.1", value: chain3DProperties.height, onChange: (e) => setChain3DProperties(prev => ({ ...prev, height: parseFloat(e.target.value) })), style: { width: '100%' } }), _jsxs("span", { style: { fontSize: '9px', color: '#8A2BE2' }, children: [chain3DProperties.height.toFixed(1), "mm"] })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: '10px', color: '#8A2BE2' }, children: "Density:" }), _jsx("input", { type: "range", min: "1", max: "10", step: "0.5", value: chain3DProperties.stitchDensity, onChange: (e) => setChain3DProperties(prev => ({ ...prev, stitchDensity: parseFloat(e.target.value) })), style: { width: '100%' } }), _jsxs("span", { style: { fontSize: '9px', color: '#8A2BE2' }, children: [chain3DProperties.stitchDensity.toFixed(1), "/mm"] })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontSize: '10px', color: '#8A2BE2' }, children: "Loop Size:" }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.1", value: chain3DProperties.loopSize, onChange: (e) => setChain3DProperties(prev => ({ ...prev, loopSize: parseFloat(e.target.value) })), style: { width: '100%' } }), _jsx("span", { style: { fontSize: '9px', color: '#8A2BE2' }, children: chain3DProperties.loopSize.toFixed(1) })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: '10px', color: '#8A2BE2' }, children: "Loop Tightness:" }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.1", value: chain3DProperties.loopTightness, onChange: (e) => setChain3DProperties(prev => ({ ...prev, loopTightness: parseFloat(e.target.value) })), style: { width: '100%' } }), _jsx("span", { style: { fontSize: '9px', color: '#8A2BE2' }, children: chain3DProperties.loopTightness.toFixed(1) })] })] }), _jsx("button", { onClick: generateUltraRealisticChain, style: {
                                            width: '100%',
                                            padding: '8px',
                                            fontSize: '11px',
                                            background: 'linear-gradient(135deg, #8A2BE2, #9370DB)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            boxShadow: '0 2px 4px rgba(138, 43, 226, 0.3)'
                                        }, children: "\uD83D\uDD17 Generate Ultra-Realistic Chain" })] }), _jsxs("div", { className: "control-group", style: {
                                    background: 'rgba(255, 99, 71, 0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 99, 71, 0.3)',
                                    marginBottom: '12px'
                                }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: '#FF6347'
                                        }, children: "\u21A9\uFE0F Ultra-Realistic Backstitch" }), _jsx("button", { onClick: generateUltraRealisticBackstitch, style: {
                                            width: '100%',
                                            padding: '8px',
                                            fontSize: '11px',
                                            background: 'linear-gradient(135deg, #FF6347, #FF7F50)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            boxShadow: '0 2px 4px rgba(255, 99, 71, 0.3)'
                                        }, children: "\u21A9\uFE0F Generate Ultra-Realistic Backstitch" })] }), _jsxs("div", { className: "control-group", style: {
                                    background: 'rgba(255, 215, 0, 0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 215, 0, 0.3)',
                                    marginBottom: '12px'
                                }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: '#FFD700'
                                        }, children: "\uD83C\uDFAF Ultra-Realistic French Knot" }), _jsx("button", { onClick: generateUltraRealisticFrenchKnot, style: {
                                            width: '100%',
                                            padding: '8px',
                                            fontSize: '11px',
                                            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            boxShadow: '0 2px 4px rgba(255, 215, 0, 0.3)'
                                        }, children: "\uD83C\uDFAF Generate Ultra-Realistic French Knot" })] }), _jsxs("div", { className: "control-group", style: {
                                    background: 'rgba(147, 112, 219, 0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(147, 112, 219, 0.3)',
                                    marginBottom: '12px'
                                }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: '#9370DB'
                                        }, children: "\uD83C\uDF00 Ultra-Realistic Bullion" }), _jsx("button", { onClick: generateUltraRealisticBullion, style: {
                                            width: '100%',
                                            padding: '8px',
                                            fontSize: '11px',
                                            background: 'linear-gradient(135deg, #9370DB, #8A2BE2)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            boxShadow: '0 2px 4px rgba(147, 112, 219, 0.3)'
                                        }, children: "\uD83C\uDF00 Generate Ultra-Realistic Bullion" })] }), _jsxs("div", { className: "control-group", style: {
                                    background: 'rgba(255, 192, 203, 0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 192, 203, 0.3)',
                                    marginBottom: '12px'
                                }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: '#FFC0CB'
                                        }, children: "\uD83C\uDF38 Ultra-Realistic Lazy Daisy" }), _jsx("button", { onClick: generateUltraRealisticLazyDaisy, style: {
                                            width: '100%',
                                            padding: '8px',
                                            fontSize: '11px',
                                            background: 'linear-gradient(135deg, #FFC0CB, #FFB6C1)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            boxShadow: '0 2px 4px rgba(255, 192, 203, 0.3)'
                                        }, children: "\uD83C\uDF38 Generate Ultra-Realistic Lazy Daisy" })] }), _jsxs("div", { className: "control-group", style: {
                                    background: 'rgba(173, 216, 230, 0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(173, 216, 230, 0.3)',
                                    marginBottom: '12px'
                                }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: '#ADD8E6'
                                        }, children: "\uD83E\uDEB6 Ultra-Realistic Feather" }), _jsx("button", { onClick: generateUltraRealisticFeather, style: {
                                            width: '100%',
                                            padding: '8px',
                                            fontSize: '11px',
                                            background: 'linear-gradient(135deg, #ADD8E6, #87CEEB)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            boxShadow: '0 2px 4px rgba(173, 216, 230, 0.3)'
                                        }, children: "\uD83E\uDEB6 Generate Ultra-Realistic Feather" })] }), _jsxs("div", { className: "control-group", style: {
                                    background: 'rgba(0, 150, 255, 0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(0, 150, 255, 0.3)',
                                    marginBottom: '12px'
                                }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '500',
                                            color: '#0096FF'
                                        }, children: "\uD83C\uDFA8 Complex Design Tools" }), _jsxs("div", { style: {
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '6px',
                                            marginBottom: '8px',
                                            fontSize: '11px'
                                        }, children: [_jsx("button", { onClick: () => {
                                                    const patterns = generateComplexPattern('geometric', 8);
                                                    console.log('Generated geometric pattern with', patterns.length, 'points');
                                                }, style: {
                                                    padding: '6px 8px',
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '10px',
                                                    fontWeight: '500'
                                                }, children: "\uD83D\uDD37 Geometric" }), _jsx("button", { onClick: () => {
                                                    const patterns = generateComplexPattern('organic', 10);
                                                    console.log('Generated organic pattern with', patterns.length, 'points');
                                                }, style: {
                                                    padding: '6px 8px',
                                                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '10px',
                                                    fontWeight: '500'
                                                }, children: "\uD83C\uDF3F Organic" }), _jsx("button", { onClick: () => {
                                                    const patterns = generateComplexPattern('floral', 12);
                                                    console.log('Generated floral pattern with', patterns.length, 'points');
                                                }, style: {
                                                    padding: '6px 8px',
                                                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '10px',
                                                    fontWeight: '500'
                                                }, children: "\uD83C\uDF38 Floral" }), _jsx("button", { onClick: () => {
                                                    const patterns = generateComplexPattern('abstract', 15);
                                                    console.log('Generated abstract pattern with', patterns.length, 'points');
                                                }, style: {
                                                    padding: '6px 8px',
                                                    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '10px',
                                                    fontWeight: '500'
                                                }, children: "\uD83C\uDFAD Abstract" })] }), _jsx("button", { onClick: () => {
                                            const patterns = recognizePattern(embroideryStitches);
                                            console.log('Pattern recognition results:', patterns);
                                            alert(`Pattern Analysis:\nGeometric: ${patterns.geometric}\nOrganic: ${patterns.organic}\nText: ${patterns.text}\nFloral: ${patterns.floral}\nAbstract: ${patterns.abstract}`);
                                        }, style: {
                                            width: '100%',
                                            padding: '8px',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '11px',
                                            fontWeight: '500',
                                            marginBottom: '8px'
                                        }, children: "\uD83D\uDD0D Analyze Pattern" }), _jsx("button", { onClick: () => {
                                            const optimized = optimizeComplexStitchPath(embroideryStitches);
                                            setEmbroideryStitches(optimized);
                                            console.log('Optimized stitch path for', optimized.length, 'stitches');
                                        }, style: {
                                            width: '100%',
                                            padding: '8px',
                                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '11px',
                                            fontWeight: '500'
                                        }, children: "\uD83D\uDD27 Optimize Path" })] }), _jsxs("div", { className: "control-group", style: {
                                    background: 'rgba(255, 0, 150, 0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 0, 150, 0.3)',
                                    marginBottom: '12px'
                                }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '500',
                                            color: '#FF0096'
                                        }, children: "\uD83D\uDE80 Advanced Stitch Types (InkStitch Enhanced)" }), _jsxs("div", { style: {
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '6px',
                                            marginBottom: '8px',
                                            fontSize: '11px'
                                        }, children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '4px' }, children: [_jsx("input", { type: "checkbox", checked: stitchOptimization, onChange: (e) => setStitchOptimization(e.target.checked), style: { accentColor: '#FF0096' } }), "Stitch Optimization"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '4px' }, children: [_jsx("input", { type: "checkbox", checked: jumpStitchMinimization, onChange: (e) => setJumpStitchMinimization(e.target.checked), style: { accentColor: '#FF0096' } }), "Jump Minimization"] })] }), _jsx("div", { style: {
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(3, 1fr)',
                                            gap: '6px',
                                            marginBottom: '8px'
                                        }, children: advancedStitchTypes.slice(6).map((stitchType) => (_jsx("button", { onClick: () => {
                                                console.log(`🚀 ADVANCED STITCH SELECTED: ${stitchType}`);
                                                setSelectedAdvancedStitch(stitchType);
                                                setEmbroideryStitchType(stitchType);
                                            }, style: {
                                                padding: '6px 8px',
                                                fontSize: '10px',
                                                borderRadius: '4px',
                                                border: selectedAdvancedStitch === stitchType ? '2px solid #FF0096' : '1px solid #475569',
                                                background: selectedAdvancedStitch === stitchType ? 'rgba(255, 0, 150, 0.2)' : '#1E293B',
                                                color: '#E2E8F0',
                                                cursor: 'pointer',
                                                textTransform: 'capitalize'
                                            }, children: stitchType.replace('-', ' ') }, stitchType))) })] }), _jsxs("div", { className: "control-group", style: {
                                    background: 'rgba(0, 255, 255, 0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(0, 255, 255, 0.3)',
                                    marginBottom: '12px'
                                }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '500',
                                            color: '#00FFFF'
                                        }, children: "\uD83C\uDF08 Revolutionary Thread Library" }), _jsx("div", { style: { marginBottom: '8px' }, children: _jsxs("select", { value: selectedThreadCategory, onChange: (e) => setSelectedThreadCategory(e.target.value), style: {
                                                width: '100%',
                                                padding: '6px',
                                                borderRadius: '4px',
                                                border: '1px solid rgba(0, 255, 255, 0.3)',
                                                background: 'rgba(0, 255, 255, 0.05)',
                                                color: '#00FFFF'
                                            }, children: [_jsx("option", { value: "metallic", children: "\u2728 Metallic Threads" }), _jsx("option", { value: "variegated", children: "\uD83C\uDFA8 Variegated Threads" }), _jsx("option", { value: "glow", children: "\uD83C\uDF1F Glow-in-Dark Threads" }), _jsx("option", { value: "specialty", children: "\uD83D\uDC8E Specialty Threads" })] }) }), _jsx("div", { style: {
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(5, 1fr)',
                                            gap: '4px'
                                        }, children: threadLibrary[selectedThreadCategory].map((color, index) => (_jsx("button", { onClick: () => setEmbroideryColor(color), style: {
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                border: embroideryColor === color ? '2px solid #00FFFF' : '1px solid #475569',
                                                background: color,
                                                cursor: 'pointer'
                                            }, title: color }, index))) })] }), _jsxs("div", { className: "control-group", style: {
                                    background: 'rgba(255, 165, 0, 0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 165, 0, 0.3)',
                                    marginBottom: '12px'
                                }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '500',
                                            color: '#FFA500'
                                        }, children: "\uD83E\uDD16 AI-Powered Features" }), _jsxs("div", { style: { display: 'flex', gap: '8px', marginBottom: '8px' }, children: [_jsx("button", { onClick: () => setAiDesignMode(!aiDesignMode), style: {
                                                    padding: '6px 12px',
                                                    fontSize: '11px',
                                                    borderRadius: '4px',
                                                    border: '1px solid rgba(255, 165, 0, 0.3)',
                                                    background: aiDesignMode ? 'rgba(255, 165, 0, 0.2)' : '#1E293B',
                                                    color: '#FFA500',
                                                    cursor: 'pointer'
                                                }, children: aiDesignMode ? '🤖 AI Mode ON' : '🤖 AI Mode OFF' }), _jsx("button", { onClick: () => {
                                                    setMlOptimization(!mlOptimization);
                                                    if (!mlOptimization) {
                                                        optimizeWithML();
                                                    }
                                                }, style: {
                                                    padding: '6px 12px',
                                                    fontSize: '11px',
                                                    borderRadius: '4px',
                                                    border: '1px solid rgba(255, 165, 0, 0.3)',
                                                    background: mlOptimization ? 'rgba(255, 165, 0, 0.2)' : '#1E293B',
                                                    color: '#FFA500',
                                                    cursor: 'pointer'
                                                }, children: isOptimizing ? '🧠 Optimizing...' : mlOptimization ? '🧠 ML ON' : '🧠 ML OFF' })] }), _jsxs("div", { style: { display: 'flex', gap: '4px', flexWrap: 'wrap' }, children: [_jsx("button", { onClick: () => generateAIDesign('Create a beautiful floral pattern'), style: {
                                                    padding: '4px 8px',
                                                    fontSize: '10px',
                                                    borderRadius: '4px',
                                                    border: '1px solid rgba(255, 165, 0, 0.3)',
                                                    background: '#1E293B',
                                                    color: '#FFA500',
                                                    cursor: 'pointer'
                                                }, children: "\uD83C\uDF38 AI Design" }), _jsx("button", { onClick: optimizeStitchPath, style: {
                                                    padding: '4px 8px',
                                                    fontSize: '10px',
                                                    borderRadius: '4px',
                                                    border: '1px solid rgba(255, 165, 0, 0.3)',
                                                    background: '#1E293B',
                                                    color: '#FFA500',
                                                    cursor: 'pointer'
                                                }, children: "\u26A1 Optimize" }), _jsx("button", { onClick: suggestThreadColors, style: {
                                                    padding: '4px 8px',
                                                    fontSize: '10px',
                                                    borderRadius: '4px',
                                                    border: '1px solid rgba(255, 165, 0, 0.3)',
                                                    background: '#1E293B',
                                                    color: '#FFA500',
                                                    cursor: 'pointer'
                                                }, children: "\uD83C\uDFA8 Suggest Colors" })] }), _jsx("div", { style: { fontSize: '9px', color: '#32CD32', marginTop: '4px', opacity: 0.8 }, children: "\u2328\uFE0F Shortcuts: Ctrl+Z (Undo) | Ctrl+Y (Redo) | Ctrl+Shift+Z (Redo)" })] }), _jsxs("div", { className: "control-group", style: {
                                    background: 'rgba(138, 43, 226, 0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(138, 43, 226, 0.3)',
                                    marginBottom: '12px'
                                }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '500',
                                            color: '#8A2BE2'
                                        }, children: "\uD83C\uDF10 Next-Gen Features" }), _jsxs("div", { style: { display: 'flex', gap: '8px', marginBottom: '8px' }, children: [_jsx("button", { onClick: enableRealTimeCollaboration, style: {
                                                    padding: '6px 12px',
                                                    fontSize: '11px',
                                                    borderRadius: '4px',
                                                    border: '1px solid rgba(138, 43, 226, 0.3)',
                                                    background: realTimeCollaboration ? 'rgba(138, 43, 226, 0.2)' : '#1E293B',
                                                    color: '#8A2BE2',
                                                    cursor: 'pointer'
                                                }, children: realTimeCollaboration ? '👥 Collaborating' : '👥 Start Collab' }), _jsx("button", { onClick: enableARVRMode, style: {
                                                    padding: '6px 12px',
                                                    fontSize: '11px',
                                                    borderRadius: '4px',
                                                    border: '1px solid rgba(138, 43, 226, 0.3)',
                                                    background: arVrMode ? 'rgba(138, 43, 226, 0.2)' : '#1E293B',
                                                    color: '#8A2BE2',
                                                    cursor: 'pointer'
                                                }, children: arVrMode ? '🥽 AR/VR ON' : '🥽 AR/VR OFF' })] }), collaborators.length > 0 && (_jsxs("div", { style: { fontSize: '10px', color: '#8A2BE2', marginTop: '4px' }, children: ["Collaborators: ", collaborators.length] }))] }), _jsxs("div", { className: "control-group", style: {
                                    background: 'rgba(50, 205, 50, 0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(50, 205, 50, 0.3)',
                                    marginBottom: '12px'
                                }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '500',
                                            color: '#32CD32'
                                        }, children: "\uD83D\uDCDA Professional Tools" }), _jsxs("div", { style: { display: 'flex', gap: '4px', marginBottom: '8px' }, children: [_jsxs("button", { onClick: undoAction, disabled: undoStack.length === 0, title: `Undo (Ctrl+Z) - ${undoStack.length} actions available`, style: {
                                                    padding: '6px 12px',
                                                    fontSize: '11px',
                                                    borderRadius: '4px',
                                                    border: '1px solid rgba(50, 205, 50, 0.3)',
                                                    background: undoStack.length === 0 ? '#6B7280' : '#1E293B',
                                                    color: undoStack.length === 0 ? '#9CA3AF' : '#32CD32',
                                                    cursor: undoStack.length === 0 ? 'not-allowed' : 'pointer'
                                                }, children: ["\u21B6 Undo (", undoStack.length, ")"] }), _jsxs("button", { onClick: redoAction, disabled: redoStack.length === 0, title: `Redo (Ctrl+Y or Ctrl+Shift+Z) - ${redoStack.length} actions available`, style: {
                                                    padding: '6px 12px',
                                                    fontSize: '11px',
                                                    borderRadius: '4px',
                                                    border: '1px solid rgba(50, 205, 50, 0.3)',
                                                    background: redoStack.length === 0 ? '#6B7280' : '#1E293B',
                                                    color: redoStack.length === 0 ? '#9CA3AF' : '#32CD32',
                                                    cursor: redoStack.length === 0 ? 'not-allowed' : 'pointer'
                                                }, children: ["\u21B7 Redo (", redoStack.length, ")"] }), _jsx("button", { onClick: () => addDesignLayer(`Layer ${designLayers.length + 1}`), style: {
                                                    padding: '6px 12px',
                                                    fontSize: '11px',
                                                    borderRadius: '4px',
                                                    border: '1px solid rgba(50, 205, 50, 0.3)',
                                                    background: '#1E293B',
                                                    color: '#32CD32',
                                                    cursor: 'pointer'
                                                }, children: "\u2795 Add Layer" }), _jsx("button", { onClick: enhanceStitchQuality, disabled: embroideryStitches.length === 0, style: {
                                                    padding: '6px 12px',
                                                    fontSize: '11px',
                                                    borderRadius: '4px',
                                                    border: '1px solid rgba(50, 205, 50, 0.3)',
                                                    background: embroideryStitches.length === 0 ? '#6B7280' : '#1E293B',
                                                    color: embroideryStitches.length === 0 ? '#9CA3AF' : '#32CD32',
                                                    cursor: embroideryStitches.length === 0 ? 'not-allowed' : 'pointer'
                                                }, children: "\u2728 Enhance Quality" }), _jsx("button", { onClick: optimizeForFabric, disabled: embroideryStitches.length === 0, style: {
                                                    padding: '6px 12px',
                                                    fontSize: '11px',
                                                    borderRadius: '4px',
                                                    border: '1px solid rgba(50, 205, 50, 0.3)',
                                                    background: embroideryStitches.length === 0 ? '#6B7280' : '#1E293B',
                                                    color: embroideryStitches.length === 0 ? '#9CA3AF' : '#32CD32',
                                                    cursor: embroideryStitches.length === 0 ? 'not-allowed' : 'pointer'
                                                }, children: "\uD83C\uDFAF Optimize Fabric" })] }), designLayers.length > 0 && (_jsxs("div", { style: { fontSize: '10px', color: '#32CD32' }, children: ["Layers: ", designLayers.length, " | Current: ", currentLayer + 1] }))] }), _jsxs("div", { className: "control-group", style: {
                                    background: 'rgba(255, 140, 0, 0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 140, 0, 0.3)',
                                    marginBottom: '12px'
                                }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '500',
                                            color: '#FF8C00'
                                        }, children: "\u26A1 Performance Monitor" }), _jsxs("div", { style: { fontSize: '10px', color: '#FF8C00', lineHeight: '1.4' }, children: [_jsxs("div", { children: ["Render Time: ", performanceStats.renderTime, "ms"] }), _jsxs("div", { children: ["Stitch Count: ", performanceStats.stitchCount] }), _jsxs("div", { children: ["Memory Usage: ", performanceStats.memoryUsage, "MB"] }), _jsx("div", { style: {
                                                    marginTop: '4px',
                                                    padding: '2px 4px',
                                                    background: performanceStats.renderTime > 16 ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 255, 0, 0.2)',
                                                    borderRadius: '3px',
                                                    fontSize: '9px'
                                                }, children: performanceStats.renderTime > 16 ? '⚠️ Slow Rendering' : '✅ Good Performance' })] })] }), _jsxs("div", { className: "action-buttons", children: [_jsx("button", { onClick: analyzePattern, disabled: embroideryStitches.length === 0, children: "Analyze Pattern" }), _jsx("button", { onClick: clearStitches, className: "clear-btn", children: "Clear All" })] })] }), _jsxs("div", { className: "canvas-controls", style: {
                            background: 'rgba(139, 92, 246, 0.1)',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            marginBottom: '12px'
                        }, children: [_jsxs("div", { style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '12px'
                                }, children: [_jsxs("div", { children: [_jsxs("h4", { style: { margin: 0, color: '#E2E8F0', fontSize: '16px' }, children: ["\uD83C\uDFA8 Embroidery Controls (", embroideryStitches.length, " stitches)"] }), _jsxs("p", { style: { margin: '4px 0 0 0', color: '#94A3B8', fontSize: '12px' }, children: ["Current: ", embroideryStitchType, " \u2022 ", embroideryColor, " \u2022 ", embroideryThickness, "px"] })] }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx("button", { onClick: () => {
                                                    // Simulate embroidery by applying stitches to 3D model
                                                    if (embroideryStitches.length > 0) {
                                                        embroideryStitches.forEach(stitch => {
                                                            drawStitchOnModel(stitch);
                                                        });
                                                        // Trigger texture update
                                                        window.dispatchEvent(new CustomEvent('embroideryTextureUpdate'));
                                                    }
                                                    console.log('Simulating embroidery...');
                                                }, style: {
                                                    padding: '6px 12px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #8B5CF6',
                                                    background: 'rgba(139, 92, 246, 0.2)',
                                                    color: '#8B5CF6',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }, children: "\u25B6\uFE0F Simulate" }), _jsx("button", { onClick: () => {
                                                    // Export pattern
                                                    console.log('Exporting pattern...');
                                                    // Export functionality will be handled by the main canvas
                                                }, style: {
                                                    padding: '6px 12px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #10B981',
                                                    background: 'rgba(16, 185, 129, 0.2)',
                                                    color: '#10B981',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }, children: "\uD83D\uDCBE Export" }), _jsx("button", { onClick: () => {
                                                    // Clear stitches
                                                    if (useEnhancedMode && enhancedManager) {
                                                        enhancedManager.clearAll();
                                                        setEmbroideryStitches([]);
                                                        console.log('Clearing all stitches with enhanced manager...');
                                                    }
                                                    else {
                                                        setEmbroideryStitches([]);
                                                        console.log('Clearing all stitches...');
                                                    }
                                                    // Clear functionality will be handled by the main canvas
                                                }, style: {
                                                    padding: '6px 12px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #EF4444',
                                                    background: 'rgba(239, 68, 68, 0.2)',
                                                    color: '#EF4444',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }, children: "\uD83D\uDDD1\uFE0F Clear" })] })] }), _jsx("div", { style: {
                                    fontSize: '12px',
                                    color: '#94A3B8',
                                    textAlign: 'center',
                                    padding: '8px',
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    borderRadius: '6px'
                                }, children: "Use the main canvas to draw embroidery stitches on the 3D model" })] }), _jsxs("div", { className: "control-group", style: {
                            background: 'rgba(34, 197, 94, 0.1)',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            marginBottom: '12px'
                        }, children: [_jsx("label", { style: {
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '500',
                                    color: '#22C55E'
                                }, children: "Backend Integration" }), _jsxs("div", { style: { marginBottom: '8px', fontSize: '12px' }, children: [_jsx("span", { style: { color: backendConnected ? '#22C55E' : '#EF4444' }, children: backendConnected ? '🟢 Connected' : '🔴 Disconnected' }), backendHealth && (_jsxs("div", { style: { marginTop: '4px', fontSize: '10px', color: '#94A3B8' }, children: ["InkStitch: ", backendHealth.inkscape?.found ? '✅' : '❌', "PyEmbroidery: ", backendHealth.pyembroidery ? '✅' : '❌'] }))] }), _jsxs("div", { style: { display: 'flex', gap: '8px', marginBottom: '8px' }, children: [_jsx("button", { onClick: () => setShowExportOptions(!showExportOptions), style: {
                                            flex: 1,
                                            padding: '6px 8px',
                                            borderRadius: '4px',
                                            border: '1px solid #475569',
                                            background: '#1E293B',
                                            color: '#E2E8F0',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }, children: "Export Options" }), _jsx("button", { onClick: checkBackendConnection, style: {
                                            padding: '6px 8px',
                                            borderRadius: '4px',
                                            border: '1px solid #475569',
                                            background: '#1E293B',
                                            color: '#E2E8F0',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }, children: "\uD83D\uDD04" })] }), showExportOptions && (_jsxs("div", { style: { marginBottom: '8px' }, children: [_jsx("label", { style: { fontSize: '11px', color: '#94A3B8', marginBottom: '4px', display: 'block' }, children: "Format:" }), _jsxs("select", { value: exportFormat, onChange: (e) => setExportFormat(e.target.value), style: {
                                            width: '100%',
                                            padding: '4px 6px',
                                            borderRadius: '4px',
                                            border: '1px solid #475569',
                                            background: '#1E293B',
                                            color: '#E2E8F0',
                                            fontSize: '11px'
                                        }, children: [_jsx("option", { value: "dst", children: "DST (Tajima)" }), _jsx("option", { value: "pes", children: "PES (Brother)" }), _jsx("option", { value: "exp", children: "EXP (Melco)" })] })] })), _jsxs("div", { style: { display: 'flex', gap: '4px' }, children: [_jsx("button", { onClick: exportEmbroideryFile, disabled: !backendConnected || isExporting || embroideryStitches.length === 0, style: {
                                            flex: 1,
                                            padding: '6px 8px',
                                            borderRadius: '4px',
                                            border: '1px solid #475569',
                                            background: backendConnected && embroideryStitches.length > 0 ? '#22C55E' : '#374151',
                                            color: '#FFFFFF',
                                            cursor: backendConnected && embroideryStitches.length > 0 ? 'pointer' : 'not-allowed',
                                            fontSize: '11px',
                                            opacity: backendConnected && embroideryStitches.length > 0 ? 1 : 0.5
                                        }, children: isExporting ? 'Exporting...' : 'Export File' }), _jsx("button", { onClick: () => generateProfessionalStitches(embroideryStitches), disabled: !backendConnected || embroideryStitches.length === 0, style: {
                                            flex: 1,
                                            padding: '6px 8px',
                                            borderRadius: '4px',
                                            border: '1px solid #475569',
                                            background: backendConnected && embroideryStitches.length > 0 ? '#3B82F6' : '#374151',
                                            color: '#FFFFFF',
                                            cursor: backendConnected && embroideryStitches.length > 0 ? 'pointer' : 'not-allowed',
                                            fontSize: '11px',
                                            opacity: backendConnected && embroideryStitches.length > 0 ? 1 : 0.5
                                        }, children: "Optimize" })] }), _jsxs("div", { style: { marginTop: '8px' }, children: [_jsx("input", { type: "file", accept: ".dst,.pes,.exp,.jef,.vp3", onChange: (e) => {
                                            const file = e.target.files?.[0];
                                            if (file)
                                                importEmbroideryFile(file);
                                        }, style: { display: 'none' }, id: "import-embroidery" }), _jsx("label", { htmlFor: "import-embroidery", style: {
                                            display: 'block',
                                            padding: '6px 8px',
                                            borderRadius: '4px',
                                            border: '1px solid #475569',
                                            background: '#1E293B',
                                            color: '#E2E8F0',
                                            cursor: 'pointer',
                                            fontSize: '11px',
                                            textAlign: 'center'
                                        }, children: "Import File" })] })] }), showAnalysis && aiAnalysis && (_jsx("div", { className: "analysis-modal", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("h3", { children: "AI Pattern Analysis" }), _jsx("button", { onClick: () => setShowAnalysis(false), children: "\u00D7" })] }), _jsxs("div", { className: "analysis-content", children: [_jsxs("div", { className: "analysis-section", children: [_jsx("h4", { children: "Density Analysis" }), _jsxs("p", { children: ["Level: ", aiAnalysis.density?.level] }), _jsxs("p", { children: ["Value: ", aiAnalysis.density?.value] })] }), _jsxs("div", { className: "analysis-section", children: [_jsx("h4", { children: "Complexity" }), _jsxs("p", { children: ["Overall: ", aiAnalysis.complexity?.overall] }), _jsxs("p", { children: ["Stitch Variety: ", aiAnalysis.complexity?.stitchVariety] })] }), _jsxs("div", { className: "analysis-section", children: [_jsx("h4", { children: "Thread Analysis" }), _jsxs("p", { children: ["Total Threads: ", Object.values(aiAnalysis.threadTypes || {}).reduce((sum, t) => sum + (t.count || 0), 0)] })] })] })] }) }))] })] }));
};
export default EmbroideryTool;
