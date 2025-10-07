// @ts-nocheck
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../App';
import { embroideryAI, type EmbroideryStitch, type EmbroideryPattern } from '../services/embroideryService';
import { embroideryBackend, type EmbroideryPlan, type GenerateFromPointsRequest } from '../services/embroideryBackendService';
import * as THREE from 'three';

// Import advanced embroidery systems
import { AdvancedEmbroideryEngine } from '../embroidery/AdvancedEmbroideryEngine';
import { InkStitchIntegration } from '../embroidery/InkStitchIntegration';
import { HDTextureSystem } from '../embroidery/HDTextureSystem';
import { RealisticLightingSystem } from '../embroidery/RealisticLightingSystem';
import { UltraRealisticSatinStitch, SatinStitchGeometry, SatinStitchMaterial, SatinStitchLighting, SatinStitch3DProperties } from '../embroidery/UltraRealisticSatinStitch';
import { SatinStitchShaders } from '../embroidery/SatinStitchShaders';
import { UltraRealisticFillStitch, FillStitchGeometry, FillStitchMaterial, FillStitchLighting, FillStitch3DProperties } from '../embroidery/UltraRealisticFillStitch';
import { UltraRealisticCrossStitch, CrossStitchGeometry, CrossStitchMaterial, CrossStitchLighting, CrossStitch3DProperties } from '../embroidery/UltraRealisticCrossStitch';
import { UltraRealisticOutlineStitch, OutlineStitchGeometry, OutlineStitchPattern, OutlineStitchMaterial, OutlineStitchLighting, OutlineStitch3DProperties } from '../embroidery/UltraRealisticOutlineStitch';
import { UltraRealisticChainStitch, ChainStitchGeometry, ChainStitchPattern, ChainStitchMaterial, ChainStitchLighting, ChainStitch3DProperties } from '../embroidery/UltraRealisticChainStitch';
import { UltraRealisticBackstitch, BackstitchGeometry, BackstitchPattern, BackstitchMaterial, BackstitchLighting, Backstitch3DProperties } from '../embroidery/UltraRealisticBackstitch';
import { UltraRealisticFrenchKnot, FrenchKnotGeometry, FrenchKnotPattern, FrenchKnotMaterial, FrenchKnotLighting, FrenchKnot3DProperties } from '../embroidery/UltraRealisticFrenchKnot';
import { UltraRealisticBullion, BullionGeometry, BullionPattern, BullionMaterial, BullionLighting, Bullion3DProperties } from '../embroidery/UltraRealisticBullion';
import { UltraRealisticLazyDaisy, LazyDaisyGeometry, LazyDaisyPattern, LazyDaisyMaterial, LazyDaisyLighting, LazyDaisy3DProperties } from '../embroidery/UltraRealisticLazyDaisy';
import { UltraRealisticFeather, FeatherGeometry, FeatherPattern, FeatherMaterial, FeatherLighting, Feather3DProperties } from '../embroidery/UltraRealisticFeather';
import { renderStitchType } from '../utils/SimpleStitchRenderer';
import { generateStitchPattern, type StitchPoint, type StitchConfig } from '../utils/StitchGenerator';
import EnhancedEmbroideryManager from '../utils/EnhancedEmbroideryManager';
import EnhancedStitchGenerator from '../utils/EnhancedStitchGenerator';
import { enhancedStitchRenderer } from '../utils/EnhancedStitchRenderer';
import { advancedMemoryManager } from '../utils/AdvancedMemoryManager';
import { advancedPerformanceMonitor } from '../utils/AdvancedPerformanceMonitor';
import { advancedUndoRedoSystem } from '../utils/AdvancedUndoRedoSystem';

interface EmbroideryToolProps {
  active?: boolean;
}

const EmbroideryTool: React.FC<EmbroideryToolProps> = ({ active = true }) => {
  const {
    embroideryStitches,
    setEmbroideryStitches,
    embroideryPattern,
    setEmbroideryPattern,
    embroideryThreadType,
    setEmbroideryThreadType,
    embroideryThickness,
    setEmbroideryThickness,
    embroideryOpacity,
    setEmbroideryOpacity,
    embroideryColor,
    setEmbroideryColor,
    embroideryStitchType,
    setEmbroideryStitchType,
    embroideryPatternDescription,
    setEmbroideryPatternDescription,
    embroideryAIEnabled,
    setEmbroideryAIEnabled,
    composedCanvas
  } = useApp();

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStitch, setCurrentStitch] = useState<EmbroideryStitch | null>(null);
  const [showPatterns, setShowPatterns] = useState(false);
  const [generatedPatterns, setGeneratedPatterns] = useState<EmbroideryPattern[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [underlayType, setUnderlayType] = useState<'none' | 'center' | 'contour' | 'zigzag'>('center');
  const [threadPalette, setThreadPalette] = useState<string[]>(['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']);
  const [showPatternLibrary, setShowPatternLibrary] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [stitchDirection, setStitchDirection] = useState<'horizontal' | 'vertical' | 'diagonal' | 'perpendicular'>('horizontal');
  const [stitchSpacing, setStitchSpacing] = useState(0.5);
  const [stitchDensity, setStitchDensity] = useState(1.0);
  const [performanceMode, setPerformanceMode] = useState(false);
  const [threadTexture, setThreadTexture] = useState('smooth');
  const [lightingDirection, setLightingDirection] = useState('top-left');
  const [fabricType, setFabricType] = useState('cotton');
  
  // Enhanced managers
  const [enhancedManager, setEnhancedManager] = useState<EnhancedEmbroideryManager | null>(null);
  const [enhancedGenerator, setEnhancedGenerator] = useState<EnhancedStitchGenerator | null>(null);
  const [useEnhancedMode, setUseEnhancedMode] = useState(true);
  
  // Advanced system states
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [memoryStats, setMemoryStats] = useState<any>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [showPerformancePanel, setShowPerformancePanel] = useState(false);
  const [enableAdvancedRendering, setEnableAdvancedRendering] = useState(true);
  const [enableAntiAliasing, setEnableAntiAliasing] = useState(true);
  const [enableCaching, setEnableCaching] = useState(true);
  const [enableLOD, setEnableLOD] = useState(true);
  
  // Use global grid settings
  const {
    showGrid,
    gridSize,
    gridColor,
    gridOpacity,
    showRulers,
    rulerUnits,
    scale,
    showGuides,
    guideColor,
    snapToGrid,
    snapDistance,
    showMeasurements,
    measurementUnits
  } = useApp();
  
  // Backend integration state
  const [backendConnected, setBackendConnected] = useState(false);
  const [backendHealth, setBackendHealth] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'dst' | 'pes' | 'exp'>('dst');
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
  const [renderQuality, setRenderQuality] = useState<'low' | 'medium' | 'high' | 'ultra'>('high');
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
  const [threadMaterial, setThreadMaterial] = useState<'cotton' | 'polyester' | 'silk' | 'metallic' | 'glow' | 'variegated'>('cotton');
  const [fabricWeave, setFabricWeave] = useState<'plain' | 'twill' | 'satin' | 'basket' | 'jersey'>('plain');
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

  // Safe number formatter for UI
  const fmt = (v: number | undefined | null, digits = 1) => {
    return (typeof v === 'number' && isFinite(v)) ? v.toFixed(digits) : (0).toFixed(digits);
  };
  const [selectedThreadCategory, setSelectedThreadCategory] = useState('metallic');
  const [aiDesignMode, setAiDesignMode] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState<any[]>([]);
  const [fabricPhysics, setFabricPhysics] = useState({
    tension: 0.5,
    stretch: 0.3,
    drape: 0.7,
    thickness: 0.2
  });
  const [realTimeCollaboration, setRealTimeCollaboration] = useState(false);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [arVrMode, setArVrMode] = useState(false);
  const [mlOptimization, setMlOptimization] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [stitchComplexity, setStitchComplexity] = useState('beginner');
  
  // Ultra-realistic stitch state variables
  const [fillMaterial, setFillMaterial] = useState<FillStitchMaterial>({
    threadType: 'cotton',
    sheen: 0.3,
    roughness: 0.4,
    metallic: false,
    glowIntensity: 0.0,
    variegationPattern: 'none',
    threadTwist: 0.5,
    threadThickness: 0.2,
    color: '#FF69B4'
  });
  
  const [fillLighting, setFillLighting] = useState<FillStitchLighting>({
    ambientIntensity: 0.4,
    directionalIntensity: 0.8,
    lightDirection: { x: 0.5, y: 0.5, z: 1.0 },
    shadowSoftness: 0.5,
    highlightIntensity: 0.6,
    rimLighting: true,
    rimIntensity: 0.3
  });
  
  const [fill3DProperties, setFill3DProperties] = useState<FillStitch3DProperties>({
    height: 0.3,
    padding: 0.1,
    compression: 0.2,
    tension: 0.5,
    stitchDensity: 2.0,
    underlayType: 'center',
    underlayDensity: 1.5,
    stitchOverlap: 0.1,
    stitchVariation: 0.05
  });
  // Local UI-only fill angle for ultra-realistic fill controls (pattern angle)
  const [fillAngle, setFillAngle] = useState<number>(0);
  
  const [crossStitchMaterial, setCrossStitchMaterial] = useState<CrossStitchMaterial>({
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
  
  const [crossStitchLighting, setCrossStitchLighting] = useState<CrossStitchLighting>({
    ambientIntensity: 0.4,
    directionalIntensity: 0.8,
    lightDirection: { x: 0.5, y: 0.5, z: 1.0 },
    shadowSoftness: 0.5,
    highlightIntensity: 0.6,
    rimLighting: true,
    rimIntensity: 0.3,
    fabricShading: true
  });
  
  const [crossStitch3DProperties, setCrossStitch3DProperties] = useState<CrossStitch3DProperties>({
    height: 0.2,
    padding: 0.05,
    compression: 0.1,
    tension: 0.4,
    stitchDensity: 3.0,
    underlayType: 'center',
    underlayDensity: 2.0,
    stitchOverlap: 0.0,
    stitchVariation: 0.02,
    fabricWeave: 'aida',
    fabricCount: 14
  });
  // Local UI-only cross-stitch controls not present in CrossStitch3DProperties
  const [crossSize, setCrossSize] = useState<number>(0.5);
  const [crossAngle, setCrossAngle] = useState<number>(0);
  
  const [outlineMaterial, setOutlineMaterial] = useState<OutlineStitchMaterial>({
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
  
  const [outlineLighting, setOutlineLighting] = useState<OutlineStitchLighting>({
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
  
  const [outline3DProperties, setOutline3DProperties] = useState<OutlineStitch3DProperties>({
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
  
  const [chainMaterial, setChainMaterial] = useState<ChainStitchMaterial>({
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
  
  const [chainLighting, setChainLighting] = useState<ChainStitchLighting>({
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
  
  const [chain3DProperties, setChain3DProperties] = useState<ChainStitch3DProperties>({
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
  const [designLayers, setDesignLayers] = useState<any[]>([]);
  const [currentLayer, setCurrentLayer] = useState(0);
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [performanceStats, setPerformanceStats] = useState({
    renderTime: 0,
    stitchCount: 0,
    memoryUsage: 0
  });

  // Advanced embroidery system refs
  const advancedEngineRef = useRef<AdvancedEmbroideryEngine | null>(null);
  const inkStitchRef = useRef<InkStitchIntegration | null>(null);
  const textureSystemRef = useRef<HDTextureSystem | null>(null);
  const lightingSystemRef = useRef<RealisticLightingSystem | null>(null);
  const ultraRealisticSatinRef = useRef<UltraRealisticSatinStitch | null>(null);
  
  // Performance optimization refs
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRenderTimeRef = useRef<number>(0);
  const frameRequestRef = useRef<number | null>(null);
  const performanceModeRef = useRef<boolean>(false);
  
  // Ultra-realistic satin stitch state
  const [satinMaterial, setSatinMaterial] = useState<SatinStitchMaterial>({
    threadType: 'silk',
    sheen: 0.8,
    roughness: 0.2,
    metallic: false,
    glowIntensity: 0.0,
    variegationPattern: 'none',
    threadTwist: 2.0,
    threadThickness: 0.3
  });
  
  const [satinLighting, setSatinLighting] = useState<SatinStitchLighting>({
    ambientIntensity: 0.3,
    directionalIntensity: 0.7,
    lightDirection: { x: 0.5, y: 0.5, z: 1.0 },
    shadowSoftness: 0.5,
    highlightIntensity: 1.0
  });
  
  const [satin3DProperties, setSatin3DProperties] = useState<SatinStitch3DProperties>({
    height: 0.5,
    padding: 0.2,
    compression: 0.1,
    tension: 1.0,
    stitchDensity: 8.0,
    zigzagAmplitude: 0.3,
    zigzagFrequency: 2.0
  });

  // Backstitch state
  const [backstitchMaterial, setBackstitchMaterial] = useState<BackstitchMaterial>({
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

  const [backstitchLighting, setBackstitchLighting] = useState<BackstitchLighting>({
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

  const [backstitch3DProperties, setBackstitch3DProperties] = useState<Backstitch3DProperties>({
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
  const [frenchKnotMaterial, setFrenchKnotMaterial] = useState<FrenchKnotMaterial>({
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

  const [frenchKnotLighting, setFrenchKnotLighting] = useState<FrenchKnotLighting>({
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

  const [frenchKnot3DProperties, setFrenchKnot3DProperties] = useState<FrenchKnot3DProperties>({
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
  const [bullionMaterial, setBullionMaterial] = useState<BullionMaterial>({
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

  const [bullionLighting, setBullionLighting] = useState<BullionLighting>({
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

  const [bullion3DProperties, setBullion3DProperties] = useState<Bullion3DProperties>({
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
  const [lazyDaisyMaterial, setLazyDaisyMaterial] = useState<LazyDaisyMaterial>({
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

  const [lazyDaisyLighting, setLazyDaisyLighting] = useState<LazyDaisyLighting>({
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

  const [lazyDaisy3DProperties, setLazyDaisy3DProperties] = useState<LazyDaisy3DProperties>({
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
  const [featherMaterial, setFeatherMaterial] = useState<FeatherMaterial>({
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

  const [featherLighting, setFeatherLighting] = useState<FeatherLighting>({
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

  const [feather3DProperties, setFeather3DProperties] = useState<Feather3DProperties>({
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
  const debounce = useCallback((func: Function, delay: number) => {
    return (...args: any[]) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => func(...args), delay);
    };
  }, []);

  const throttle = useCallback((func: Function, limit: number) => {
    let inThrottle: boolean;
    return (...args: any[]) => {
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
      memoryUsage: (performance as any).memory ? Math.round(((performance as any).memory.usedJSHeapSize) / 1024 / 1024) : 0
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
    } else if (stats.renderTime < 8 && performanceModeRef.current) {
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

  // Initialize enhanced managers
  useEffect(() => {
    if (composedCanvas) {
      const manager = new EnhancedEmbroideryManager(composedCanvas);
      const generator = new EnhancedStitchGenerator(true); // Enable AI
      
      setEnhancedManager(manager);
      setEnhancedGenerator(generator);
      
      // Set performance mode
      manager.setPerformanceMode(performanceMode);
      
      console.log('🚀 Enhanced Embroidery Managers initialized');
    }
  }, [composedCanvas, performanceMode]);

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
          quality: renderQuality as 'low' | 'medium' | 'high' | 'ultra',
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
      } else {
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
      
        } catch (error) {
      console.error('❌ Failed to initialize advanced systems:', error);
    }
  };

  // Optimized draw stitches with debouncing and performance monitoring
  const drawStitches = useCallback(() => {
    // Cancel previous frame request
    if (frameRequestRef.current) {
      cancelAnimationFrame(frameRequestRef.current);
    }
    
    // Use requestAnimationFrame for smooth rendering
    frameRequestRef.current = requestAnimationFrame(() => {
      const startTime = performance.now();
      console.log('🎨 Drawing stitches on main canvas...');
      updatePerformanceStats();
      
      if (useEnhancedMode && enhancedManager) {
        // Use enhanced manager for better performance and persistence
        enhancedManager.redrawAll();
        
        // Render current stitch being drawn with enhanced renderer
        if (currentStitch && currentStitch.points && currentStitch.points.length > 0) {
          const ctx = composedCanvas?.getContext('2d');
          if (ctx && enableAdvancedRendering) {
            enhancedStitchRenderer.renderStitch(
              currentStitch.points,
              {
                type: currentStitch.type,
                color: currentStitch.color,
                thickness: currentStitch.thickness,
                opacity: currentStitch.opacity,
                threadType: currentStitch.threadType,
                quality: renderQuality,
                antiAliasing: enableAntiAliasing,
                shadow: true,
                highlight: true
              },
              {
                canvas: composedCanvas!,
                context: ctx,
                enableCaching: enableCaching,
                enableLOD: enableLOD
              }
            );
          } else if (ctx) {
            renderStitch(ctx, currentStitch);
          }
        }
      } else {
        // Fallback to original rendering
        if (composedCanvas) {
          const ctx = composedCanvas.getContext('2d');
          if (ctx) {
            // Clear canvas
            ctx.clearRect(0, 0, composedCanvas.width, composedCanvas.height);
            
            // Render all stitches with enhanced renderer if enabled
            embroideryStitches.forEach(stitch => {
              if (stitch.points && stitch.points.length > 0) {
                if (enableAdvancedRendering) {
                  enhancedStitchRenderer.renderStitch(
                    stitch.points,
                    {
                      type: stitch.type,
                      color: stitch.color,
                      thickness: stitch.thickness,
                      opacity: stitch.opacity,
                      threadType: stitch.threadType,
                      quality: renderQuality,
                      antiAliasing: enableAntiAliasing,
                      shadow: true,
                      highlight: true
                    },
                    {
                      canvas: composedCanvas,
                      context: ctx,
                      enableCaching: enableCaching,
                      enableLOD: enableLOD
                    }
                  );
                } else {
                  renderStitch(ctx, stitch);
                }
              }
            });
            
            // Render current stitch being drawn
            if (currentStitch && currentStitch.points && currentStitch.points.length > 0) {
              if (enableAdvancedRendering) {
                enhancedStitchRenderer.renderStitch(
                  currentStitch.points,
                  {
                    type: currentStitch.type,
                    color: currentStitch.color,
                    thickness: currentStitch.thickness,
                    opacity: currentStitch.opacity,
                    threadType: currentStitch.threadType,
                    quality: renderQuality,
                    antiAliasing: enableAntiAliasing,
                    shadow: true,
                    highlight: true
                  },
                  {
                    canvas: composedCanvas,
                    context: ctx,
                    enableCaching: enableCaching,
                    enableLOD: enableLOD
                  }
                );
              } else {
                renderStitch(ctx, currentStitch);
              }
            }
          }
        }
      }
      
      // Record performance metrics
      const renderTime = performance.now() - startTime;
      advancedPerformanceMonitor.recordFrameEnd(startTime);
      advancedPerformanceMonitor.recordRenderTime(renderTime);
      advancedPerformanceMonitor.updateStitchCount(embroideryStitches.length);
      
      // Update performance metrics state
      setPerformanceMetrics(advancedPerformanceMonitor.getMetrics());
      setMemoryStats(advancedMemoryManager.getMemoryStats());
    });
  }, [updatePerformanceStats, composedCanvas, embroideryStitches, currentStitch, useEnhancedMode, enhancedManager]);

  // Render a single stitch
  const renderStitch = useCallback((ctx: CanvasRenderingContext2D, stitch: EmbroideryStitch) => {
    if (!stitch.points || stitch.points.length === 0) return;

    const config: StitchConfig = {
      type: stitch.type,
      color: stitch.color,
      thickness: stitch.thickness,
      opacity: stitch.opacity
    };

    try {
      renderStitchType(ctx, stitch.points, config);
        } catch (error) {
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
  const debouncedDrawStitches = useMemo(
    () => debounce(drawStitches, 16), // ~60fps
    [drawStitches, debounce]
  );

  // Advanced pattern generation for complex designs
  const generateComplexPattern = (patternType: string, complexity: number = 5) => {
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
  const optimizeComplexStitchPath = (stitches: EmbroideryStitch[]) => {
    console.log('🔧 Optimizing complex stitch path...');
    
    // Group stitches by color and type
    const groupedStitches = new Map<string, EmbroideryStitch[]>();
    
    stitches.forEach(stitch => {
      const key = `${stitch.color}_${stitch.type}`;
      if (!groupedStitches.has(key)) {
        groupedStitches.set(key, []);
      }
      groupedStitches.get(key)!.push(stitch);
    });
    
    // Optimize each group
    const optimizedStitches: EmbroideryStitch[] = [];
    
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
  const getStitchCenter = (stitch: EmbroideryStitch) => {
    if (stitch.points.length === 0) return { x: 0, y: 0 };
    
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
  const recognizePattern = (stitches: EmbroideryStitch[]) => {
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
          const angle = calculateAngle(points[i-1], points[i], points[i+1]);
          angles.push(angle);
        }
        
        const avgAngle = angles.reduce((a, b) => a + b, 0) / angles.length;
        if (Math.abs(avgAngle - 90) < 15) patterns.geometric++;
        else if (Math.abs(avgAngle - 60) < 15) patterns.geometric++;
        else if (Math.abs(avgAngle - 120) < 15) patterns.geometric++;
        else patterns.organic++;
      }
      
      // Analyze text patterns
      if (stitch.type === 'satin' && points.length > 2) {
        const isLinear = points.every((point, i) => {
          if (i === 0) return true;
          const prev = points[i-1];
          const slope = Math.abs((point.y - prev.y) / (point.x - prev.x));
          return slope < 0.5 || slope > 2;
        });
        if (isLinear) patterns.text++;
      }
    });
    
    return patterns;
  };

  // Calculate angle between three points
  const calculateAngle = (p1: {x: number, y: number}, p2: {x: number, y: number}, p3: {x: number, y: number}) => {
    const a = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    const b = Math.sqrt(Math.pow(p3.x - p2.x, 2) + Math.pow(p3.y - p2.y, 2));
    const c = Math.sqrt(Math.pow(p3.x - p1.x, 2) + Math.pow(p3.y - p1.y, 2));
    
    return Math.acos((a * a + b * b - c * c) / (2 * a * b)) * (180 / Math.PI);
  };

  const drawStitch = (ctx: CanvasRenderingContext2D, stitch: EmbroideryStitch, rect: DOMRect, isPreview = false) => {
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
          } else {
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
          } else {
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
        const fillLines: {x1: number, y1: number, x2: number, y2: number, index: number}[] = [];
        
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
        } else {
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
          } else {
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
          } else {
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
          } else {
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
          ctx.ellipse(midX + 0.4, midY + 0.4, linkWidth/2, linkHeight/2, angle, 0, Math.PI * 2);
          ctx.stroke();
          
          // Draw main chain link
          ctx.strokeStyle = adjustedColor;
          ctx.lineWidth = threadThickness;
          ctx.globalAlpha = 1;
          
          ctx.beginPath();
          ctx.ellipse(midX, midY, linkWidth/2, linkHeight/2, angle, 0, Math.PI * 2);
          ctx.stroke();
          
          // Draw inner oval for chain link hole
          ctx.beginPath();
          ctx.ellipse(midX, midY, linkWidth/3, linkHeight/3, angle, 0, Math.PI * 2);
          ctx.stroke();
          
          // Add chain link highlight for 3D effect
          ctx.strokeStyle = highlightColor;
          ctx.lineWidth = threadThickness * 0.6;
          ctx.globalAlpha = 0.8;
          
          ctx.beginPath();
          ctx.ellipse(midX - 0.2, midY - 0.2, linkWidth/2.2, linkHeight/2.2, angle, 0, Math.PI * 2);
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
          ctx.arc(midX + Math.cos(angle) * linkWidth/2, midY + Math.sin(angle) * linkWidth/2, dotSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(midX - Math.cos(angle) * linkWidth/2, midY - Math.sin(angle) * linkWidth/2, dotSize, 0, Math.PI * 2);
          ctx.fill();
          
          // Add subtle thread shine highlights
          ctx.fillStyle = highlightColor;
          ctx.globalAlpha = 0.6;
          const shineSize = dotSize * 0.5;
          ctx.beginPath();
          ctx.arc(midX + Math.cos(angle) * linkWidth/2 - shineSize * 0.3, midY + Math.sin(angle) * linkWidth/2 - shineSize * 0.3, shineSize, 0, Math.PI * 2);
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
        if (points.length < 2) return;
        
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
          const segmentLength = Math.sqrt(
            Math.pow(points[i].x - points[i-1].x, 2) + 
            Math.pow(points[i].y - points[i-1].y, 2)
          );
          
          if (segmentLength > 2) {
            // Break long segments into smaller parts for texture
            const numSegments = Math.max(2, Math.floor(segmentLength / 3));
            for (let j = 1; j <= numSegments; j++) {
              const t = j / numSegments;
              const x = points[i-1].x + t * (points[i].x - points[i-1].x);
              const y = points[i-1].y + t * (points[i].y - points[i-1].y);
              
              // Add tiny random variations to simulate thread texture
              const variation = (Math.random() - 0.5) * 0.2;
              const perpX = -(points[i].y - points[i-1].y) / segmentLength * variation;
              const perpY = (points[i].x - points[i-1].x) / segmentLength * variation;
              
              ctx.lineTo(x + perpX, y + perpY);
            }
          } else {
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
          const segmentLength = Math.sqrt(
            Math.pow(points[i].x - points[i-1].x, 2) + 
            Math.pow(points[i].y - points[i-1].y, 2)
          );
          
          if (segmentLength > 2) {
            const numSegments = Math.max(2, Math.floor(segmentLength / 3));
            for (let j = 1; j <= numSegments; j++) {
              const t = j / numSegments;
              const x = points[i-1].x + t * (points[i].x - points[i-1].x);
              const y = points[i-1].y + t * (points[i].y - points[i-1].y);
              
              const variation = (Math.random() - 0.5) * 0.1;
              const perpX = -(points[i].y - points[i-1].y) / segmentLength * variation;
              const perpY = (points[i].x - points[i-1].x) / segmentLength * variation;
              
              ctx.lineTo(x + perpX - 0.1, y + perpY - 0.1);
            }
          } else {
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
            const gradient = ctx.createRadialGradient(
              point.x - knotSize * 0.3, point.y - knotSize * 0.3, 0,
              point.x, point.y, knotSize
            );
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
          } else {
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
          } else {
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

  const getLineIntersections = (points: { x: number; y: number }[], y: number): number[] => {
    const intersections: number[] = [];
    
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
  const adjustBrightness = (color: string, amount: number): string => {
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
    } catch (error) {
      console.error('Failed to connect to backend:', error);
      setBackendConnected(false);
      setBackendHealth(null);
    }
  };

  const generateProfessionalStitches = async (stitches: EmbroideryStitch[]) => {
    if (!backendConnected) {
      console.warn('Backend not connected, using local rendering only');
      return;
    }

    try {
      // Convert stitches to backend format
      const backendPoints = embroideryBackend.convertStitchesToBackendFormat(stitches);
      
      // Create request for professional stitch generation
      const request: GenerateFromPointsRequest = {
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
    } catch (error) {
      console.error('Failed to generate professional stitches:', error);
    }
  };

  // AI-Powered Design Features
  const generateAIDesign = async (description: string) => {
    if (!aiDesignMode) return;
    
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
    } catch (error) {
      console.error('AI design generation failed:', error);
    }
  };

  const optimizeStitchPath = async () => {
    if (!mlOptimization) return;
    
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
    } catch (error) {
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
    } catch (error) {
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
      } else if (data.type === 'collaborator_joined') {
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

  const addDesignLayer = (layerName: string) => {
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

  const removeDesignLayer = (layerId: number) => {
    // Save current state before removing layer
    saveToUndoStack('remove_layer');
    
    setDesignLayers(prev => prev.filter(layer => layer.id !== layerId));
    
    // Adjust current layer if needed
    if (currentLayer >= designLayers.length - 1) {
      setCurrentLayer(Math.max(0, designLayers.length - 2));
    }
  };

  const toggleLayerVisibility = (layerId: number) => {
    // Save current state before toggling visibility
    saveToUndoStack('toggle_layer_visibility');
    
    setDesignLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const toggleLayerLock = (layerId: number) => {
    // Save current state before toggling lock
    saveToUndoStack('toggle_layer_lock');
    
    setDesignLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
    ));
  };

  const renameLayer = (layerId: number, newName: string) => {
    // Save current state before renaming
    saveToUndoStack('rename_layer');
    
    setDesignLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, name: newName } : layer
    ));
  };

  // Helper function to save current state to undo stack
  const saveToUndoStack = (action: string = 'action') => {
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
    const handleKeyDown = (event: KeyboardEvent) => {
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
            } else {
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
      } else if (fabricType === 'denim') {
        enhancedStitch.thickness = stitch.thickness * 1.2; // Thicker for denim
      } else if (fabricType === 'linen') {
        enhancedStitch.thickness = stitch.thickness * 1.1; // Slightly thicker for linen
      }
      
      // Adjust opacity based on thread texture
      if (threadTexture === 'metallic') {
        enhancedStitch.opacity = Math.min(1.0, stitch.opacity * 1.2);
      } else if (threadTexture === 'matte') {
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
      } else if (fabricType === 'silk') {
        // Silk needs lighter touch
        optimizedStitch.thickness = stitch.thickness * stitchDensity * 0.7;
      } else if (fabricType === 'denim') {
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
    } catch (error) {
      console.error('Failed to export embroidery file:', error);
      alert('Failed to export embroidery file. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const importEmbroideryFile = async (file: File) => {
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
    } catch (error) {
      console.error('Failed to import embroidery file:', error);
      alert('Failed to import embroidery file. Please check the file format.');
    }
  };

  // Handle mouse events
  // Mouse events are handled by the main canvas, not this tool panel



  // Generate pattern with AI
  const generatePattern = async () => {
    if (!embroideryPatternDescription.trim()) {
      console.warn('⚠️ No pattern description provided');
      return;
    }

    // Save current state before generating pattern
    saveToUndoStack('generate_pattern');

    console.log('🤖 AI GENERATING PATTERN:', embroideryPatternDescription);
    setIsGenerating(true);
    
    try {
      // Generate base pattern with AI
      let patterns = generateAIPattern(embroideryPatternDescription, embroideryStitchType, embroideryColor);
      
      // Enhance with InkStitch algorithms if available
      if (inkStitchRef.current && enableAdvancedStitches) {
        console.log('🧵 Applying InkStitch optimization...');
        patterns = await inkStitchRef.current.optimizePattern(patterns, {
          stitchType: embroideryStitchType,
          density: stitchDensity,
          threadType: threadMaterial,
          fabricType: fabricWeave,
          enableOptimization: stitchOptimization,
          enableJumpStitchMinimization: jumpStitchMinimization
        });
      }
      
      if (patterns && patterns.length > 0) {
        console.log(`✅ ADVANCED PATTERN GENERATED: ${patterns.length} stitches`);
        setEmbroideryStitches(patterns);
        
        // Apply advanced rendering if WebGL is enabled
        if (advancedEngineRef.current && enableWebGL) {
          console.log('🎨 Rendering with advanced WebGL engine...');
          await advancedEngineRef.current.renderPattern(patterns);
        } else {
        drawStitches();
        }
      } else {
        console.warn('⚠️ Advanced pattern generation produced no stitches');
      }
    } catch (error) {
      console.error('❌ Error generating advanced pattern:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate ultra-realistic satin stitch
  const generateUltraRealisticSatin = useCallback(() => {
    console.log('🌟 Generating ultra-realistic satin stitch...');
    
    try {
      // Create sample geometry for satin stitch
      const geometry: SatinStitchGeometry = {
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
      const satinStitches = UltraRealisticSatinStitch.generateUltraRealisticSatin(
        geometry,
        satinMaterial,
        satinLighting,
        satin3DProperties
      );
      
      console.log(`✅ Generated ${satinStitches.length} ultra-realistic satin stitches`);
      
      // Update stitches
      setEmbroideryStitches([...(embroideryStitches as any), ...satinStitches]);
      
    } catch (error) {
      console.error('❌ Error generating ultra-realistic satin:', error);
    }
  }, [satinMaterial, satinLighting, satin3DProperties]);

  const generateUltraRealisticFill = useCallback(() => {
    console.log('🎨 Generating ultra-realistic fill stitch...');
    
    try {
      // Create sample geometry for fill stitch (matches FillStitchGeometry)
      const shape = [
        { x: 100, y: 100, z: 0 },
        { x: 200, y: 100, z: 0 },
        { x: 200, y: 200, z: 0 },
        { x: 100, y: 200, z: 0 }
      ];
      const bounds = { minX: 100, minY: 100, maxX: 200, maxY: 200 };
      const width = bounds.maxX - bounds.minX;
      const height = bounds.maxY - bounds.minY;
      const geometry: FillStitchGeometry = {
        shape,
        bounds,
        area: width * height,
        perimeter: 2 * (width + height)
      };
      const pattern = {
        type: 'parallel',
        angle: 45,
        spacing: 5,
        offset: 0,
        density: 2,
        direction: 'diagonal',
        complexity: 5
      } as const;
      
      // Generate ultra-realistic fill stitches
      const fillStitches = UltraRealisticFillStitch.generateUltraRealisticFill(
        geometry,
        pattern as any,
        fillMaterial,
        fillLighting,
        fill3DProperties
      );
      
      console.log(`✅ Generated ${fillStitches.length} ultra-realistic fill stitches`);
      
      // Update stitches
      setEmbroideryStitches([...(embroideryStitches as any), ...fillStitches]);
      
    } catch (error) {
      console.error('❌ Error generating ultra-realistic fill:', error);
    }
  }, [fillMaterial, fillLighting, fill3DProperties]);

  const generateUltraRealisticCrossStitch = useCallback(() => {
    console.log('🎨 Generating ultra-realistic cross-stitch...');
    
    try {
      // Create sample geometry for cross-stitch (matches CrossStitchGeometry)
      const cellSize = 10;
      const rows = 4;
      const cols = 4;
      const originX = 100;
      const originY = 100;
      const grid: { x: number; y: number; z: number }[][] = [];
      for (let r = 0; r < rows; r++) {
        const row: { x: number; y: number; z: number }[] = [];
        for (let c = 0; c < cols; c++) {
          row.push({ x: originX + c * cellSize + cellSize / 2, y: originY + r * cellSize + cellSize / 2, z: 0 });
        }
        grid.push(row);
      }
      const geometry: CrossStitchGeometry = {
        grid,
        cellSize,
        width: cols * cellSize,
        height: rows * cellSize,
        bounds: { minX: originX, minY: originY, maxX: originX + cols * cellSize, maxY: originY + rows * cellSize }
      };
      const pattern = {
        type: 'full',
        direction: 'normal',
        density: 14,
        complexity: 5,
        symmetry: true
      } as const;
      
      // Generate ultra-realistic cross-stitches
      const crossStitches = UltraRealisticCrossStitch.generateUltraRealisticCrossStitch(
        geometry,
        pattern as any,
        crossStitchMaterial,
        crossStitchLighting,
        crossStitch3DProperties
      );
      
      console.log(`✅ Generated ${crossStitches.length} ultra-realistic cross-stitches`);
      
      // Update stitches
      setEmbroideryStitches([...(embroideryStitches as any), ...crossStitches]);
      
    } catch (error) {
      console.error('❌ Error generating ultra-realistic cross-stitch:', error);
    }
  }, [crossStitchMaterial, crossStitchLighting, crossStitch3DProperties]);

  const generateUltraRealisticOutline = useCallback(() => {
    console.log('📏 Generating ultra-realistic outline stitch...');
    
    try {
      // Create sample geometry for outline stitch
      const geometry: OutlineStitchGeometry = {
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
      } as const;
      
      // Generate ultra-realistic outline stitches
      const outlineStitches = UltraRealisticOutlineStitch.generateUltraRealisticOutline(
        geometry,
        pattern as any,
        outlineMaterial,
        outlineLighting,
        outline3DProperties
      );
      
      console.log(`✅ Generated ${outlineStitches.length} ultra-realistic outline stitches`);
      
      // Update stitches
      setEmbroideryStitches([...(embroideryStitches as any), ...outlineStitches]);
      
    } catch (error) {
      console.error('❌ Error generating ultra-realistic outline:', error);
    }
  }, [outlineMaterial, outlineLighting, outline3DProperties]);

  const generateUltraRealisticChain = useCallback(() => {
    console.log('🔗 Generating ultra-realistic chain stitch...');
    
    try {
      // Create sample geometry for chain stitch
      const geometry: ChainStitchGeometry = {
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
      
      const pattern: ChainStitchPattern = {
        type: 'single',
        direction: 'forward',
        density: 2.0,
        complexity: 5,
        symmetry: true,
        curveHandling: 'smooth'
      };
      
      // Generate ultra-realistic chain stitches
      const chainStitches = UltraRealisticChainStitch.generateUltraRealisticChain(
        geometry,
        pattern,
        chainMaterial,
        chainLighting,
        chain3DProperties
      );
      
      console.log(`✅ Generated ${chainStitches.length} ultra-realistic chain stitches`);
      
      // Update stitches
      setEmbroideryStitches(prev => [...prev, ...chainStitches]);
      
    } catch (error) {
      console.error('❌ Error generating ultra-realistic chain:', error);
    }
  }, [chainMaterial, chainLighting, chain3DProperties]);

  // Generate ultra-realistic backstitch
  const generateUltraRealisticBackstitch = useCallback(() => {
    console.log('↩️ Generating ultra-realistic backstitch...');
    
    try {
      const geometry: BackstitchGeometry = {
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

      const pattern: BackstitchPattern = {
        type: 'single',
        direction: 'forward',
        density: 6,
        complexity: 5,
        symmetry: true,
        curveHandling: 'smooth'
      };

      const backstitches = UltraRealisticBackstitch.generateUltraRealisticBackstitch(
        geometry,
        pattern,
        backstitchMaterial,
        backstitchLighting,
        backstitch3DProperties
      );

      setEmbroideryStitches(prev => [...prev, ...backstitches]);
      
    } catch (error) {
      console.error('❌ Error generating ultra-realistic backstitch:', error);
    }
  }, [backstitchMaterial, backstitchLighting, backstitch3DProperties]);

  // Generate ultra-realistic French knot
  const generateUltraRealisticFrenchKnot = useCallback(() => {
    console.log('🎯 Generating ultra-realistic French knot...');
    
    try {
      const geometry: FrenchKnotGeometry = {
        position: { x: 150, y: 150, z: 0 },
        size: 8,
        bounds: { minX: 142, minY: 142, maxX: 158, maxY: 158 },
        knotCount: 1
      };

      const pattern: FrenchKnotPattern = {
        type: 'single',
        direction: 'clockwise',
        density: 10,
        complexity: 8,
        symmetry: true,
        spacing: 2
      };

      const frenchKnots = UltraRealisticFrenchKnot.generateUltraRealisticFrenchKnot(
        geometry,
        pattern,
        frenchKnotMaterial,
        frenchKnotLighting,
        frenchKnot3DProperties
      );

      setEmbroideryStitches(prev => [...prev, ...frenchKnots]);
      
    } catch (error) {
      console.error('❌ Error generating ultra-realistic French knot:', error);
    }
  }, [frenchKnotMaterial, frenchKnotLighting, frenchKnot3DProperties]);

  // Generate ultra-realistic bullion
  const generateUltraRealisticBullion = useCallback(() => {
    console.log('🌀 Generating ultra-realistic bullion...');
    
    try {
      const geometry: BullionGeometry = {
        path: [
          { x: 100, y: 100, z: 0 },
          { x: 200, y: 100, z: 0 }
        ],
        width: 20,
        length: 100,
        bounds: { minX: 100, minY: 100, maxX: 200, maxY: 100 },
        isClosed: false
      };

      const pattern: BullionPattern = {
        type: 'single',
        direction: 'forward',
        density: 8,
        complexity: 6,
        symmetry: true,
        curveHandling: 'smooth'
      };

      const bullions = UltraRealisticBullion.generateUltraRealisticBullion(
        geometry,
        pattern,
        bullionMaterial,
        bullionLighting,
        bullion3DProperties
      );

      setEmbroideryStitches(prev => [...prev, ...bullions]);
      
    } catch (error) {
      console.error('❌ Error generating ultra-realistic bullion:', error);
    }
  }, [bullionMaterial, bullionLighting, bullion3DProperties]);

  // Generate ultra-realistic lazy daisy
  const generateUltraRealisticLazyDaisy = useCallback(() => {
    console.log('🌸 Generating ultra-realistic lazy daisy...');
    
    try {
      const geometry: LazyDaisyGeometry = {
        position: { x: 150, y: 150, z: 0 },
        size: 20,
        bounds: { minX: 130, minY: 130, maxX: 170, maxY: 170 },
        petalCount: 5,
        petalAngle: 0
      };

      const pattern: LazyDaisyPattern = {
        type: 'single',
        direction: 'clockwise',
        density: 7,
        complexity: 6,
        symmetry: true,
        spacing: 3
      };

      const lazyDaisies = UltraRealisticLazyDaisy.generateUltraRealisticLazyDaisy(
        geometry,
        pattern,
        lazyDaisyMaterial,
        lazyDaisyLighting,
        lazyDaisy3DProperties
      );

      setEmbroideryStitches(prev => [...prev, ...lazyDaisies]);
      
    } catch (error) {
      console.error('❌ Error generating ultra-realistic lazy daisy:', error);
    }
  }, [lazyDaisyMaterial, lazyDaisyLighting, lazyDaisy3DProperties]);

  // Generate ultra-realistic feather
  const generateUltraRealisticFeather = useCallback(() => {
    console.log('🪶 Generating ultra-realistic feather...');
    
    try {
      const geometry: FeatherGeometry = {
        path: [
          { x: 100, y: 100, z: 0 },
          { x: 200, y: 100, z: 0 }
        ],
        width: 30,
        length: 100,
        bounds: { minX: 100, minY: 100, maxX: 200, maxY: 100 },
        isClosed: false
      };

      const pattern: FeatherPattern = {
        type: 'single',
        direction: 'forward',
        density: 5,
        complexity: 5,
        symmetry: true,
        curveHandling: 'smooth'
      };

      const feathers = UltraRealisticFeather.generateUltraRealisticFeather(
        geometry,
        pattern,
        featherMaterial,
        featherLighting,
        feather3DProperties
      );

      setEmbroideryStitches(prev => [...prev, ...feathers]);
      
    } catch (error) {
      console.error('❌ Error generating ultra-realistic feather:', error);
    }
  }, [featherMaterial, featherLighting, feather3DProperties]);

  // AI Pattern Generation Function
  const generateAIPattern = (description: string, stitchType: string, color: string) => {
    console.log('🧠 AI PATTERN GENERATOR:', { description, stitchType, color });
    
    const patterns: EmbroideryStitch[] = [];
    const description_lower = description.toLowerCase();
    
    // Generate patterns based on description keywords
    if (description_lower.includes('flower') || description_lower.includes('rose')) {
      patterns.push(...generateFlowerPattern(stitchType, color));
    } else if (description_lower.includes('heart')) {
      patterns.push(...generateHeartPattern(stitchType, color));
    } else if (description_lower.includes('star')) {
      patterns.push(...generateStarPattern(stitchType, color));
    } else if (description_lower.includes('circle') || description_lower.includes('round')) {
      patterns.push(...generateCirclePattern(stitchType, color));
    } else if (description_lower.includes('square') || description_lower.includes('rectangle')) {
      patterns.push(...generateSquarePattern(stitchType, color));
    } else if (description_lower.includes('line') || description_lower.includes('straight')) {
      patterns.push(...generateLinePattern(stitchType, color));
    } else {
      // Default abstract pattern
      patterns.push(...generateAbstractPattern(stitchType, color));
    }
    
    return patterns;
  };

  // Pattern generation helpers
  const generateFlowerPattern = (stitchType: string, color: string) => {
    const patterns: EmbroideryStitch[] = [];
    const centerX = 0.5;
    const centerY = 0.5;
    const radius = 0.1;
    
    // Center
    patterns.push({
      id: `ai_flower_center_${Date.now()}`,
      type: stitchType as any,
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
        type: stitchType as any,
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

  const generateHeartPattern = (stitchType: string, color: string) => {
    const patterns: EmbroideryStitch[] = [];
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
      type: stitchType as any,
      points: heartPoints,
      color: color,
      threadType: embroideryThreadType,
      thickness: embroideryThickness,
      opacity: embroideryOpacity
    });
    
    return patterns;
  };

  const generateStarPattern = (stitchType: string, color: string) => {
    const patterns: EmbroideryStitch[] = [];
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
      type: stitchType as any,
      points: starPoints,
      color: color,
      threadType: embroideryThreadType,
      thickness: embroideryThickness,
      opacity: embroideryOpacity
    });
    
    return patterns;
  };

  const generateCirclePattern = (stitchType: string, color: string) => {
    const patterns: EmbroideryStitch[] = [];
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
      type: stitchType as any,
      points: circlePoints,
      color: color,
      threadType: embroideryThreadType,
      thickness: embroideryThickness,
      opacity: embroideryOpacity
    });
    
    return patterns;
  };

  const generateSquarePattern = (stitchType: string, color: string) => {
    const patterns: EmbroideryStitch[] = [];
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
      type: stitchType as any,
      points: squarePoints,
      color: color,
      threadType: embroideryThreadType,
      thickness: embroideryThickness,
      opacity: embroideryOpacity
    });
    
    return patterns;
  };

  const generateLinePattern = (stitchType: string, color: string) => {
    const patterns: EmbroideryStitch[] = [];
    
    patterns.push({
      id: `ai_line_${Date.now()}`,
      type: stitchType as any,
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

  const generateAbstractPattern = (stitchType: string, color: string) => {
    const patterns: EmbroideryStitch[] = [];
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
        type: stitchType as any,
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
      } else {
        console.warn('⚠️ ML optimization produced no stitches');
      }
    } catch (error) {
      console.error('❌ Error optimizing with ML:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  // ML Optimization Algorithm
  const optimizeStitchPathML = (stitches: EmbroideryStitch[]) => {
    console.log('🧠 ML OPTIMIZER:', { stitchCount: stitches.length });
    
    // Sort stitches by distance to minimize thread jumps
    const optimized = [...stitches].sort((a, b) => {
      if (a.points.length === 0 || b.points.length === 0) return 0;
      
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
    if (embroideryStitches.length === 0) return;

    try {
      const analysis = await embroideryAI.analyzePattern(
        embroideryStitches,
        { width: 400, height: 400 }
      );
      
      setAiAnalysis(analysis);
      setShowAnalysis(true);
    } catch (error) {
      console.error('Error analyzing pattern:', error);
    }
  };

  // Suggest thread colors
  const suggestColors = async () => {
    try {
      const colors = await embroideryAI.suggestThreadColors(embroideryColor);
      // You could show these in a color picker or palette
      // Console log removed
    } catch (error) {
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
  const generateSatinStitchPoints = (points: {x: number, y: number}[], density: number = 0.5) => {
    if (points.length < 2) return points;
    
    const stitchPoints: {x: number, y: number}[] = [];
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
  const generateSatinFillStitches = (points: {x: number, y: number}[], density: number = 0.5) => {
    if (points.length < 3) return [points];
    
    // Calculate bounding box
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));
    
    const baseSpacing = 0.010; // Balanced spacing for performance and quality
    const densityMultiplier = 0.6 + (density * 0.4); // 0.6 to 1.0 range for balanced density
    const stitchSpacing = baseSpacing * densityMultiplier;
    const stitchLines: {x: number, y: number}[][] = [];
    const maxLines = 40; // Reduced for better performance
    const maxPointsPerLine = 20; // Reduced for better performance
    
    // Determine stitch direction based on user setting and shape
    const width = maxX - minX;
    const height = maxY - minY;
    
    let isHorizontal = false;
    if (stitchDirection === 'horizontal') {
      isHorizontal = true;
    } else if (stitchDirection === 'vertical') {
      isHorizontal = false;
    } else if (stitchDirection === 'diagonal') {
      // Use diagonal direction
      const angle = Math.atan2(height, width);
      return generateDiagonalSatinStitches(points, density, angle);
    } else if (stitchDirection === 'perpendicular') {
      // Use perpendicular to the main axis
      isHorizontal = height > width;
    } else {
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
    } else {
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
  const getVerticalIntersections = (points: {x: number, y: number}[], x: number) => {
    const intersections: number[] = [];
    
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
  const generateDiagonalSatinStitches = (points: {x: number, y: number}[], density: number, angle: number) => {
    const stitchLines: {x: number, y: number}[][] = [];
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
      const linePoints: {x: number, y: number}[] = [];
      
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
  const getLineIntersectionsAdvanced = (points: {x: number, y: number}[], y: number, startX?: number, endX?: number, endY?: number) => {
    const intersections: number[] = [];
    
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
    } else {
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
  const drawStitchOnModel = (stitch: EmbroideryStitch) => {
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

    if (stitch.points.length < 2) return;

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
      gradientStartX = 0; gradientStartY = 0; gradientEndX = composedCanvas.width; gradientEndY = composedCanvas.height;
    } else if (lightingDirection === 'top-right') {
      gradientStartX = composedCanvas.width; gradientStartY = 0; gradientEndX = 0; gradientEndY = composedCanvas.height;
    } else if (lightingDirection === 'bottom-left') {
      gradientStartX = 0; gradientStartY = composedCanvas.height; gradientEndX = composedCanvas.width; gradientEndY = 0;
    } else if (lightingDirection === 'bottom-right') {
      gradientStartX = composedCanvas.width; gradientStartY = composedCanvas.height; gradientEndX = 0; gradientEndY = 0;
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
    } else if (fabricType === 'denim') {
      // Denim has more texture
      ctx.globalCompositeOperation = 'multiply';
    } else if (fabricType === 'linen') {
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
          const gradient = ctx.createLinearGradient(
            points[0].x, points[0].y,
            points[points.length - 1].x, points[points.length - 1].y
          );
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
            if (linePoints.length < 2) return;
            
            // Create gradient for each line based on lighting
            const start = linePoints[0];
            const end = linePoints[linePoints.length - 1];
            const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
            
            // Calculate lighting effect
            const lightAngle = lightingDirection === 'top-left' ? -Math.PI/4 : 
                             lightingDirection === 'top-right' ? Math.PI/4 :
                             lightingDirection === 'bottom-left' ? -3*Math.PI/4 : 3*Math.PI/4;
            
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
              } else {
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
                } else {
                  ctx.lineTo(curr.x, curr.y);
                }
              }
              ctx.stroke();
            }
          });
        } else {
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
            const distance = Math.sqrt(
              Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
            );
            
            if (distance > 0.005) { // Balanced spacing for performance
              if (next) {
                const cp1x = prev.x + (curr.x - prev.x) / 3;
                const cp1y = prev.y + (curr.y - prev.y) / 3;
                const cp2x = curr.x - (next.x - curr.x) / 3;
                const cp2y = curr.y - (next.y - curr.y) / 3;
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
              } else {
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
            const distance = Math.sqrt(
              Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
            );
            
            if (distance > 0.005 && next) { // Balanced spacing for performance
              const angle = Math.atan2(curr.y - prev.y, curr.x - prev.x);
              const perpX = Math.cos(angle + Math.PI/2) * offset;
              const perpY = Math.sin(angle + Math.PI/2) * offset;
              
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
        const fillLines: {x1: number, y1: number, x2: number, y2: number, index: number}[] = [];
        
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
        } else {
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
          } else {
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
          } else {
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
          } else {
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
          ctx.ellipse(midX + 0.4, midY + 0.4, linkWidth/2, linkHeight/2, angle, 0, Math.PI * 2);
          ctx.stroke();
          
          // Draw main chain link
          ctx.strokeStyle = adjustedColor;
          ctx.lineWidth = threadThickness;
          ctx.globalAlpha = 1;
      
      ctx.beginPath();
          ctx.ellipse(midX, midY, linkWidth/2, linkHeight/2, angle, 0, Math.PI * 2);
      ctx.stroke();
      
          // Draw inner oval for chain link hole
      ctx.beginPath();
          ctx.ellipse(midX, midY, linkWidth/3, linkHeight/3, angle, 0, Math.PI * 2);
        ctx.stroke();
          
          // Add chain link highlight for 3D effect
          ctx.strokeStyle = highlightColor;
          ctx.lineWidth = threadThickness * 0.6;
          ctx.globalAlpha = 0.8;
          
          ctx.beginPath();
          ctx.ellipse(midX - 0.2, midY - 0.2, linkWidth/2.2, linkHeight/2.2, angle, 0, Math.PI * 2);
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
          ctx.arc(midX + Math.cos(angle) * linkWidth/2, midY + Math.sin(angle) * linkWidth/2, dotSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(midX - Math.cos(angle) * linkWidth/2, midY - Math.sin(angle) * linkWidth/2, dotSize, 0, Math.PI * 2);
          ctx.fill();
          
          // Add subtle thread shine highlights
          ctx.fillStyle = highlightColor;
          ctx.globalAlpha = 0.6;
          const shineSize = dotSize * 0.5;
          ctx.beginPath();
          ctx.arc(midX + Math.cos(angle) * linkWidth/2 - shineSize * 0.3, midY + Math.sin(angle) * linkWidth/2 - shineSize * 0.3, shineSize, 0, Math.PI * 2);
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
        if (points.length < 2) return;
        
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
          const segmentLength = Math.sqrt(
            Math.pow(points[i].x - points[i-1].x, 2) + 
            Math.pow(points[i].y - points[i-1].y, 2)
          );
          
          if (segmentLength > 2) {
            // Break long segments into smaller parts for texture
            const numSegments = Math.max(2, Math.floor(segmentLength / 3));
            for (let j = 1; j <= numSegments; j++) {
              const t = j / numSegments;
              const x = points[i-1].x + t * (points[i].x - points[i-1].x);
              const y = points[i-1].y + t * (points[i].y - points[i-1].y);
              
              // Add tiny random variations to simulate thread texture
              const variation = (Math.random() - 0.5) * 0.2;
              const perpX = -(points[i].y - points[i-1].y) / segmentLength * variation;
              const perpY = (points[i].x - points[i-1].x) / segmentLength * variation;
              
              ctx.lineTo(x + perpX, y + perpY);
            }
          } else {
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
          const segmentLength = Math.sqrt(
            Math.pow(points[i].x - points[i-1].x, 2) + 
            Math.pow(points[i].y - points[i-1].y, 2)
          );
          
          if (segmentLength > 2) {
            const numSegments = Math.max(2, Math.floor(segmentLength / 3));
            for (let j = 1; j <= numSegments; j++) {
              const t = j / numSegments;
              const x = points[i-1].x + t * (points[i].x - points[i-1].x);
              const y = points[i-1].y + t * (points[i].y - points[i-1].y);
              
              const variation = (Math.random() - 0.5) * 0.1;
              const perpX = -(points[i].y - points[i-1].y) / segmentLength * variation;
              const perpY = (points[i].x - points[i-1].x) / segmentLength * variation;
              
              ctx.lineTo(x + perpX - 0.1, y + perpY - 0.1);
            }
        } else {
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
            const gradient = ctx.createRadialGradient(
              point.x - knotSize * 0.3, point.y - knotSize * 0.3, 0,
              point.x, point.y, knotSize
            );
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
          const perpAngle = angle + Math.PI/2;
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
      } else {
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

  // Listen for Apply Tool events
  useEffect(() => {
    console.log('🎨 EmbroideryTool: Setting up Apply Tool event listeners');

    const handleApplyEmbroideryEffects = () => {
      console.log('🎨 EmbroideryTool: Apply Tool - Applying embroidery effects to texture maps');
      if (composedCanvas) {
        // Force texture update for embroidery effects
        const textureUpdateEvent = new CustomEvent('embroideryTextureUpdate');
        window.dispatchEvent(textureUpdateEvent);
      }
    };

    const handleForceModelTextureUpdate = () => {
      console.log('🎨 EmbroideryTool: Apply Tool - Force model texture update');
      if (composedCanvas) {
        // Force texture update for embroidery effects
        const textureUpdateEvent = new CustomEvent('embroideryTextureUpdate');
        window.dispatchEvent(textureUpdateEvent);
      }
    };

    document.addEventListener('applyEmbroideryEffects', handleApplyEmbroideryEffects);
    document.addEventListener('forceModelTextureUpdate', handleForceModelTextureUpdate);

    return () => {
      document.removeEventListener('applyEmbroideryEffects', handleApplyEmbroideryEffects);
      document.removeEventListener('forceModelTextureUpdate', handleForceModelTextureUpdate);
    };
  }, [composedCanvas]);

  // Listen for embroidery events from 3D canvas
  useEffect(() => {
    const handleEmbroideryStart = (e: CustomEvent) => {
      const { u, v } = e.detail;
      setIsDrawing(true);
      console.log('🧵 Starting embroidery with stitch type:', embroideryStitchType, 'Type of:', typeof embroideryStitchType);
      
      if (useEnhancedMode && enhancedGenerator) {
        // Use enhanced generator
        const config: StitchGenerationConfig = {
          type: embroideryStitchType,
          color: embroideryColor,
          thickness: embroideryThickness,
          opacity: embroideryOpacity,
          threadType: embroideryThreadType,
          quality: 'high'
        };

        const newStitch = enhancedGenerator.generateStitchFromInput(
          [{ x: u, y: v, pressure: 0.5, timestamp: Date.now() }],
          config
        );
        setCurrentStitch(newStitch);
      } else {
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

    const handleEmbroideryMove = (e: CustomEvent) => {
      if (!isDrawing || !currentStitch) return;
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
      if (!isDrawing || !currentStitch) return;
      setIsDrawing(false);
      
      // Save state before adding stitch for undo functionality
      const newStitches = useEnhancedMode && enhancedManager 
        ? [...enhancedManager.getAllStitches(), currentStitch]
        : [...embroideryStitches, currentStitch];
      
      advancedUndoRedoSystem.saveState(newStitches, 'add_stitch', `Added ${currentStitch.type} stitch`);
      
      if (useEnhancedMode && enhancedManager) {
        // Use enhanced manager for better persistence
        const stitchId = enhancedManager.addStitch(currentStitch);
        const allStitches = enhancedManager.getAllStitches();
        setEmbroideryStitches(allStitches);
        console.log('✅ Stitch added to enhanced manager:', stitchId);
      } else {
        // Fallback to original method
        setEmbroideryStitches([...embroideryStitches, currentStitch]);
      }
      
      // Update undo/redo state
      setCanUndo(advancedUndoRedoSystem.canUndo());
      setCanRedo(advancedUndoRedoSystem.canRedo());
      
      setCurrentStitch(null);
    };

    

    window.addEventListener('embroideryStart', handleEmbroideryStart as EventListener);
    window.addEventListener('embroideryMove', handleEmbroideryMove as EventListener);
    window.addEventListener('embroideryEnd', handleEmbroideryEnd);

    return () => {
      window.removeEventListener('embroideryStart', handleEmbroideryStart as EventListener);
      window.removeEventListener('embroideryMove', handleEmbroideryMove as EventListener);
      window.removeEventListener('embroideryEnd', handleEmbroideryEnd);
    };
  }, [isDrawing, currentStitch, embroideryStitchType, embroideryColor, embroideryThreadType, embroideryThickness, embroideryOpacity, setEmbroideryStitches, composedCanvas]);

  // Undo/Redo handlers (component scope)
  const handleUndo = useCallback(() => {
    const stitches = advancedUndoRedoSystem.undo();
    if (stitches) {
      setEmbroideryStitches(stitches);
      setCanUndo(advancedUndoRedoSystem.canUndo());
      setCanRedo(advancedUndoRedoSystem.canRedo());
      console.log('↩️ Undo performed');
    }
  }, []);

  const handleRedo = useCallback(() => {
    const stitches = advancedUndoRedoSystem.redo();
    if (stitches) {
      setEmbroideryStitches(stitches);
      setCanUndo(advancedUndoRedoSystem.canUndo());
      setCanRedo(advancedUndoRedoSystem.canRedo());
      console.log('↪️ Redo performed');
    }
  }, []);


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
    // Disable backend checks by default to avoid network errors in local testing
    const ENABLE_BACKEND = false;
    if (!ENABLE_BACKEND) return;
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
        } catch (error) {
          console.warn('Error disposing advanced engine:', error);
        }
      }
      
      if (textureSystemRef.current) {
        try {
          textureSystemRef.current.dispose();
        } catch (error) {
          console.warn('Error disposing texture system:', error);
        }
      }
      
      if (lightingSystemRef.current) {
        try {
          lightingSystemRef.current.dispose();
        } catch (error) {
          console.warn('Error disposing lighting system:', error);
        }
      }
    };
  }, []);

  return (
    <>
      <style>
        {`
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
        `}
      </style>
      <div className="embroidery-tool-panel" style={{
        background: 'transparent', // Remove background since parent has it
      color: 'white',
      height: '100%',
        width: '100%',
        overflow: 'hidden',
        padding: '0',
        display: 'flex',
        flexDirection: 'column'
    }}>
      <div className="tool-header" style={{
        background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
        color: 'white',
        padding: '16px',
        textAlign: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>🧵 Embroidery Tool</h3>
        <div className="tool-status" style={{ marginTop: '4px', display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
          <span className={`status-indicator ${isDrawing ? 'drawing' : 'idle'}`} style={{
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            background: isDrawing ? '#10B981' : '#6B7280',
            color: 'white'
          }}>
            {isDrawing ? 'Drawing' : 'Ready'}
          </span>
          <span style={{ fontSize: '11px', opacity: 0.8 }}>
            {embroideryStitches.length} stitches
          </span>
          <span style={{ fontSize: '10px', opacity: 0.7, color: enable4K ? '#10B981' : '#6B7280' }}>
            {enable4K ? '4K HD' : 'HD'}
          </span>
          {embroideryAIEnabled && (
            <span style={{ fontSize: '10px', opacity: 0.7 }}>
              🤖 AI
            </span>
          )}
      </div>

      {/* 4K HD Quality Control Panel */}
      <div className="quality-control-panel" style={{
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '12px',
        borderBottom: '1px solid #334155',
        marginBottom: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#8B5CF6' }}>🎨 4K HD Quality</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {['low', 'medium', 'high', 'ultra'].map((quality) => (
              <button
                key={quality}
                onClick={() => setRenderQuality(quality as any)}
                style={{
                  padding: '2px 6px',
                  fontSize: '10px',
                  borderRadius: '4px',
                  background: renderQuality === quality ? '#8B5CF6' : '#374151',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {quality}
              </button>
            ))}
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="checkbox"
              checked={enable4K}
              onChange={(e) => setEnable4K(e.target.checked)}
              style={{ accentColor: '#8B5CF6' }}
            />
            4K Resolution
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="checkbox"
              checked={enableWebGL}
              onChange={(e) => setEnableWebGL(e.target.checked)}
              style={{ accentColor: '#8B5CF6' }}
            />
            WebGL2
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="checkbox"
              checked={enablePBR}
              onChange={(e) => setEnablePBR(e.target.checked)}
              style={{ accentColor: '#8B5CF6' }}
            />
            PBR Materials
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="checkbox"
              checked={enableShadows}
              onChange={(e) => setEnableShadows(e.target.checked)}
              style={{ accentColor: '#8B5CF6' }}
            />
            Shadows
          </label>
        </div>
      </div>

        {/* Quick AI Actions */}
        <div style={{ marginTop: '8px', display: 'flex', gap: '4px', justifyContent: 'center' }}>
          <button
            onClick={generatePattern}
            disabled={isGenerating || !embroideryPatternDescription.trim()}
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              background: isGenerating ? '#6B7280' : '#8B5CF6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              opacity: isGenerating ? 0.6 : 1
            }}
          >
            {isGenerating ? 'Generating...' : '🤖 Generate'}
          </button>
          <button
            onClick={analyzePattern}
            disabled={embroideryStitches.length === 0}
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              background: embroideryStitches.length === 0 ? '#6B7280' : '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: embroideryStitches.length === 0 ? 'not-allowed' : 'pointer',
              opacity: embroideryStitches.length === 0 ? 0.6 : 1
            }}
          >
            🔍 Analyze
          </button>
        </div>
      </div>

      <div className="embroidery-controls" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '16px',
        overflowY: 'auto',
        overflowX: 'hidden',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Pattern Description */}
        <div className="control-group" style={{
          background: 'rgba(139, 92, 246, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#E2E8F0'
          }}>Pattern Description</label>
          <textarea
            value={embroideryPatternDescription}
            onChange={(e) => setEmbroideryPatternDescription(e.target.value)}
            placeholder="Describe the embroidery pattern you want to create..."
            rows={3}
          />
          <button 
            onClick={generatePattern}
            disabled={isGenerating || !embroideryPatternDescription.trim()}
            className="generate-btn"
          >
            {isGenerating ? 'Generating...' : 'Generate Pattern'}
          </button>
        </div>

        {/* Stitch Type */}
        <div className="control-group" style={{
          background: 'rgba(139, 92, 246, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#E2E8F0'
          }}>Stitch Type</label>
        <select
            value={embroideryStitchType}
            onChange={(e) => {
              const newType = e.target.value;
              console.log(`🔄 STITCH TYPE CHANGED: ${embroideryStitchType} → ${newType}`);
              setEmbroideryStitchType(newType as any);
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #475569',
              background: '#1E293B',
              color: '#E2E8F0',
              fontSize: '14px'
            }}
          >
            {advancedStitchTypes.map((stitchType) => (
              <option key={stitchType} value={stitchType}>
                {stitchType === 'satin' && '🧵 Satin Stitch'}
                {stitchType === 'fill' && '🟦 Fill Stitch'}
                {stitchType === 'outline' && '📏 Outline Stitch'}
                {stitchType === 'cross-stitch' && '❌ Cross Stitch'}
                {stitchType === 'chain' && '⛓️ Chain Stitch'}
                {stitchType === 'backstitch' && '↩️ Back Stitch'}
                {stitchType === 'french-knot' && '🎯 French Knot'}
                {stitchType === 'bullion' && '🌀 Bullion Stitch'}
                {stitchType === 'lazy-daisy' && '🌸 Lazy Daisy'}
                {stitchType === 'feather' && '🪶 Feather Stitch'}
                {stitchType === 'couching' && '🎀 Couching'}
                {stitchType === 'appliqué' && '🎨 Appliqué'}
                {stitchType === 'seed' && '🌱 Seed Stitch'}
                {stitchType === 'stem' && '🌿 Stem Stitch'}
                {stitchType === 'metallic' && '✨ Metallic Thread'}
                {stitchType === 'glow-thread' && '🌟 Glow Thread'}
                {stitchType === 'variegated' && '🌈 Variegated'}
                {stitchType === 'gradient' && '🎨 Gradient'}
                {!['satin', 'fill', 'outline', 'cross-stitch', 'chain', 'backstitch', 'french-knot', 'bullion', 'lazy-daisy', 'feather', 'couching', 'appliqué', 'seed', 'stem', 'metallic', 'glow-thread', 'variegated', 'gradient'].includes(stitchType) && 
                  `🧵 ${stitchType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
              </option>
            ))}
        </select>
      </div>

        {/* Thread Type */}
        <div className="control-group">
          <label>Thread Type & Material</label>
          <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
        <select
            value={embroideryThreadType}
            onChange={(e) => setEmbroideryThreadType(e.target.value as any)}
              style={{ marginBottom: '4px' }}
        >
          <option value="cotton">Cotton</option>
          <option value="polyester">Polyester</option>
          <option value="silk">Silk</option>
          <option value="metallic">Metallic</option>
          <option value="glow">Glow-in-Dark</option>
              <option value="variegated">Variegated</option>
        </select>
            
            {/* Advanced Material Properties */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '11px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="checkbox"
                  checked={enablePBR}
                  onChange={(e) => setEnablePBR(e.target.checked)}
                  style={{ accentColor: '#8B5CF6' }}
                />
                PBR Materials
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="checkbox"
                  checked={enableNormalMapping}
                  onChange={(e) => setEnableNormalMapping(e.target.checked)}
                  style={{ accentColor: '#8B5CF6' }}
                />
                Normal Maps
              </label>
            </div>
          </div>
      </div>

        {/* Color */}
        <div className="control-group">
          <label>Thread Color</label>
          <div className="color-input-group">
            <input 
              type="color"
              value={embroideryColor}
              onChange={(e) => setEmbroideryColor(e.target.value)}
            />
            <button onClick={suggestColors} className="suggest-btn">
              Suggest Colors
            </button>
        </div>
        </div>
        
        {/* Thickness */}
        <div className="control-group">
          <label>Thread Thickness: {embroideryThickness}px</label>
            <input 
            type="range" 
            min="1"
            max="10"
            value={embroideryThickness}
            onChange={(e) => setEmbroideryThickness(Number(e.target.value))}
          />
        </div>
        
        {/* Opacity */}
        <div className="control-group" style={{
          background: 'rgba(139, 92, 246, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#E2E8F0'
          }}>Opacity: {Math.round(embroideryOpacity * 100)}%</label>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            value={embroideryOpacity}
            onChange={(e) => setEmbroideryOpacity(Number(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#8B5CF6'
            }}
          />
        </div>
        
        {/* Stitch Density */}
        <div className="control-group" style={{
          background: 'rgba(139, 92, 246, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#E2E8F0'
          }}>Stitch Density: {Math.round(stitchDensity * 100)}%</label>
          <input 
            type="range" 
          min="0.2"
            max="0.8" 
            step="0.1" 
          value={stitchDensity}
            onChange={(e) => setStitchDensity(Number(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#8B5CF6'
            }}
          />
          <small style={{ color: '#F59E0B', fontSize: '12px', fontWeight: '500' }}>
            ⚠️ High density may cause lag - use 20%-60% for best performance
          </small>
        </div>

        {/* Performance Mode Toggle */}
        <div className="control-group" style={{
          background: 'rgba(139, 92, 246, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontWeight: '500',
            color: '#E2E8F0'
          }}>
            <input 
              type="checkbox" 
              checked={performanceMode}
              onChange={(e) => setPerformanceMode(e.target.checked)}
              style={{ accentColor: '#8B5CF6' }}
            />
            🚀 Performance Mode (Reduces quality for better speed)
          </label>
      </div>

        {/* Stitch Direction */}
        <div className="control-group" style={{
          background: 'rgba(139, 92, 246, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#E2E8F0'
          }}>Stitch Direction</label>
          <select 
            value={stitchDirection}
            onChange={(e) => setStitchDirection(e.target.value as any)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              background: 'rgba(15, 23, 42, 0.8)',
              color: '#E2E8F0',
              fontSize: '14px'
            }}
          >
            <option value="diagonal">Diagonal</option>
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
            <option value="perpendicular">Perpendicular</option>
          </select>
        </div>

        {/* Underlay Type */}
        <div className="control-group" style={{
          background: 'rgba(139, 92, 246, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#E2E8F0'
          }}>Underlay Type</label>
          <select
            value={underlayType}
            onChange={(e) => setUnderlayType(e.target.value as any)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #475569',
              background: '#1E293B',
              color: '#E2E8F0',
              fontSize: '14px'
            }}
          >
            <option value="none">🚫 None</option>
            <option value="center">🎯 Center</option>
            <option value="contour">🔄 Contour</option>
            <option value="zigzag">⚡ Zigzag</option>
          </select>
      </div>

        {/* Thread Palette */}
        <div className="control-group" style={{
          background: 'rgba(139, 92, 246, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#E2E8F0'
          }}>Thread Palette</label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginBottom: '8px'
          }}>
            {threadPalette.map((color, index) => (
            <button
                key={index}
                onClick={() => setEmbroideryColor(color)}
              style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  border: embroideryColor === color ? '3px solid #8B5CF6' : '2px solid #475569',
                  background: color,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title={`Select ${color}`}
              />
            ))}
          </div>
          <button
            onClick={() => {
              const newColor = prompt('Enter hex color (e.g., #FF0000):');
              if (newColor && /^#[0-9A-F]{6}$/i.test(newColor)) {
                setThreadPalette([...threadPalette, newColor]);
              }
            }}
            style={{
              width: '100%',
                padding: '8px',
              borderRadius: '6px',
              border: '1px solid #475569',
              background: '#1E293B',
              color: '#E2E8F0',
                cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            + Add Color
            </button>
        </div>

        {/* AI Controls */}
        <div className="control-group">
          <label>
        <input
              type="checkbox"
              checked={embroideryAIEnabled}
              onChange={(e) => setEmbroideryAIEnabled(e.target.checked)}
            />
            Enable AI Analysis
          </label>
      </div>

        {/* Stitch Direction */}
        <div className="control-group" style={{
          background: 'rgba(139, 92, 246, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#E2E8F0'
          }}>Stitch Direction</label>
          <select
            value={stitchDirection}
            onChange={(e) => setStitchDirection(e.target.value as any)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #475569',
              background: '#1E293B',
              color: '#E2E8F0',
              fontSize: '14px'
            }}
          >
            <option value="horizontal">↔️ Horizontal</option>
            <option value="vertical">↕️ Vertical</option>
            <option value="diagonal">↗️ Diagonal</option>
            <option value="radial">⚡ Radial</option>
          </select>
        </div>

        {/* Stitch Spacing */}
        <div className="control-group" style={{
          background: 'rgba(139, 92, 246, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#E2E8F0'
          }}>Stitch Spacing: {stitchSpacing}px</label>
        <input
          type="range"
          min="0.1"
            max="2"
          step="0.1"
            value={stitchSpacing}
            onChange={(e) => setStitchSpacing(Number(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#8B5CF6'
            }}
        />
      </div>

        {/* Professional Stitch Controls */}
        <div className="control-group" style={{
          background: 'rgba(34, 197, 94, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          marginBottom: '12px'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#22C55E'
          }}>Professional Controls</label>
          
          {/* Stitch Density */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', color: '#22C55E' }}>Stitch Density: {stitchDensity}x</label>
        <input
          type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={stitchDensity}
              onChange={(e) => setStitchDensity(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#22C55E'
              }}
            />
          </div>
          
          {/* Thread Texture */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', color: '#22C55E' }}>Thread Texture:</label>
            <select
              value={threadTexture}
              onChange={(e) => setThreadTexture(e.target.value)}
              style={{
                width: '100%',
                padding: '4px',
                borderRadius: '4px',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                backgroundColor: 'rgba(34, 197, 94, 0.05)',
                color: '#22C55E'
              }}
            >
              <option value="smooth">Smooth</option>
              <option value="textured">Textured</option>
              <option value="metallic">Metallic</option>
              <option value="matte">Matte</option>
            </select>
          </div>
          
          {/* Lighting Direction */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', color: '#22C55E' }}>Lighting:</label>
            <select
              value={lightingDirection}
              onChange={(e) => setLightingDirection(e.target.value)}
              style={{
                width: '100%',
                padding: '4px',
                borderRadius: '4px',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                backgroundColor: 'rgba(34, 197, 94, 0.05)',
                color: '#22C55E'
              }}
            >
              <option value="top-left">Top Left</option>
              <option value="top-right">Top Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-right">Bottom Right</option>
            </select>
          </div>
          
          {/* Fabric Type */}
          <div>
            <label style={{ fontSize: '12px', color: '#22C55E' }}>Fabric Type:</label>
            <select
              value={fabricType}
              onChange={(e) => setFabricType(e.target.value)}
              style={{
                width: '100%',
                padding: '4px',
                borderRadius: '4px',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                backgroundColor: 'rgba(34, 197, 94, 0.05)',
                color: '#22C55E'
              }}
            >
              <option value="cotton">Cotton</option>
              <option value="silk">Silk</option>
              <option value="denim">Denim</option>
              <option value="linen">Linen</option>
              <option value="polyester">Polyester</option>
            </select>
          </div>

        {/* Enhanced Mode Toggle */}
        <div>
          <label style={{ fontSize: '12px', color: '#22C55E', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={useEnhancedMode}
              onChange={(e) => setUseEnhancedMode(e.target.checked)}
              style={{ margin: 0 }}
            />
            Enhanced Mode (Better Performance & Persistence)
          </label>
        </div>

        {/* Advanced Rendering Controls */}
        <div className="control-group" style={{
          background: 'rgba(59, 130, 246, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          marginTop: '12px'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#E2E8F0',
            fontSize: '14px'
          }}>Advanced Rendering</label>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="checkbox"
                checked={enableAdvancedRendering}
                onChange={(e) => setEnableAdvancedRendering(e.target.checked)}
                style={{ accentColor: '#3B82F6' }}
              />
              Advanced Rendering
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="checkbox"
                checked={enableAntiAliasing}
                onChange={(e) => setEnableAntiAliasing(e.target.checked)}
                style={{ accentColor: '#3B82F6' }}
              />
              Anti-Aliasing
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="checkbox"
                checked={enableCaching}
                onChange={(e) => setEnableCaching(e.target.checked)}
                style={{ accentColor: '#3B82F6' }}
              />
              Caching
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="checkbox"
                checked={enableLOD}
                onChange={(e) => setEnableLOD(e.target.checked)}
                style={{ accentColor: '#3B82F6' }}
              />
              Level of Detail
            </label>
          </div>
        </div>

        {/* Undo/Redo Controls */}
        <div className="control-group" style={{
          background: 'rgba(16, 185, 129, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          marginTop: '12px'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#E2E8F0',
            fontSize: '14px'
          }}>History</label>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #10B981',
                background: canUndo ? '#10B981' : '#374151',
                color: canUndo ? '#FFFFFF' : '#6B7280',
                cursor: canUndo ? 'pointer' : 'not-allowed',
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              ↩️ Undo
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #10B981',
                background: canRedo ? '#10B981' : '#374151',
                color: canRedo ? '#FFFFFF' : '#6B7280',
                cursor: canRedo ? 'pointer' : 'not-allowed',
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              ↪️ Redo
            </button>
          </div>
        </div>

        {/* Performance Panel Toggle */}
        <div className="control-group" style={{
          background: 'rgba(245, 158, 11, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          marginTop: '12px'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#E2E8F0',
            fontSize: '14px'
          }}>Performance</label>
          
          <button
            onClick={() => setShowPerformancePanel(!showPerformancePanel)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #F59E0B',
              background: '#1E293B',
              color: '#E2E8F0',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            {showPerformancePanel ? 'Hide' : 'Show'} Performance Panel
          </button>
        </div>
      </div>

      {/* Performance Panel */}
      {showPerformancePanel && (
        <div className="control-group" style={{
          background: 'rgba(245, 158, 11, 0.1)',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          marginTop: '12px'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '12px', 
            fontWeight: '600',
            color: '#F59E0B',
            fontSize: '16px'
          }}>Performance Metrics</label>
          
          {performanceMetrics && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
              <div>
                <div style={{ color: '#E2E8F0', fontWeight: '500' }}>FPS</div>
                <div style={{ color: (performanceMetrics?.fps ?? 0) > 30 ? '#10B981' : '#EF4444', fontSize: '18px', fontWeight: '600' }}>
                  {fmt(performanceMetrics?.fps, 1)}
                </div>
              </div>
              <div>
                <div style={{ color: '#E2E8F0', fontWeight: '500' }}>Frame Time</div>
                <div style={{ color: (performanceMetrics?.frameTime ?? Infinity) < 33 ? '#10B981' : '#EF4444', fontSize: '18px', fontWeight: '600' }}>
                  {fmt(performanceMetrics?.frameTime, 1)}ms
                </div>
              </div>
              <div>
                <div style={{ color: '#E2E8F0', fontWeight: '500' }}>Render Time</div>
                <div style={{ color: (performanceMetrics?.renderTime ?? Infinity) < 16 ? '#10B981' : '#EF4444', fontSize: '18px', fontWeight: '600' }}>
                  {fmt(performanceMetrics?.renderTime, 1)}ms
                </div>
              </div>
              <div>
                <div style={{ color: '#E2E8F0', fontWeight: '500' }}>Stitch Count</div>
                <div style={{ color: '#3B82F6', fontSize: '18px', fontWeight: '600' }}>
                  {performanceMetrics?.stitchCount ?? 0}
                </div>
              </div>
            </div>
          )}
          
          {memoryStats && (
            <div style={{ marginTop: '12px', fontSize: '12px' }}>
              <div style={{ color: '#E2E8F0', fontWeight: '500', marginBottom: '8px' }}>Memory Usage</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <div style={{ color: '#9CA3AF' }}>Used</div>
                  <div style={{ color: '#F59E0B', fontWeight: '600' }}>
                    {fmt(memoryStats?.usedMemory ? (memoryStats.usedMemory / 1024 / 1024) : 0, 1)}MB
                  </div>
                </div>
                <div>
                  <div style={{ color: '#9CA3AF' }}>Available</div>
                  <div style={{ color: '#10B981', fontWeight: '600' }}>
                    {(memoryStats.freeMemory / 1024 / 1024).toFixed(1)}MB
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <button
              onClick={() => advancedMemoryManager.forceGarbageCollection()}
              style={{
                flex: 1,
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #F59E0B',
                background: '#1E293B',
                color: '#F59E0B',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '500'
              }}
            >
              🧹 Force GC
            </button>
            <button
              onClick={() => {
                const stats = advancedPerformanceMonitor.getStatistics();
                console.log('Performance Statistics:', stats);
              }}
              style={{
                flex: 1,
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #F59E0B',
                background: '#1E293B',
                color: '#F59E0B',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '500'
              }}
            >
              📊 Export Stats
            </button>
          </div>
        </div>
      )}

      {/* Pattern Library */}
        <div className="control-group" style={{
          background: 'rgba(139, 92, 246, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#E2E8F0'
          }}>Pattern Library</label>
          <button
            onClick={() => setShowPatternLibrary(!showPatternLibrary)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #475569',
              background: '#1E293B',
              color: '#E2E8F0',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {showPatternLibrary ? 'Hide' : 'Show'} Patterns
          </button>
          
          {showPatternLibrary && (
            <div style={{
              marginTop: '8px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px'
            }}>
              {embroideryPatterns.map((pattern) => (
            <button
              key={pattern.id}
                  onClick={() => {
                    setSelectedPattern(pattern.id);
                    setEmbroideryStitchType(pattern.type as any);
                  }}
              style={{
                padding: '8px',
                    borderRadius: '6px',
                    border: selectedPattern === pattern.id ? '2px solid #8B5CF6' : '1px solid #475569',
                    background: selectedPattern === pattern.id ? 'rgba(139, 92, 246, 0.2)' : '#1E293B',
                    color: '#E2E8F0',
                cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {pattern.name}
            </button>
          ))}
        </div>
          )}
      </div>

        {/* Performance Stats */}
        <div className="control-group" style={{
          background: 'rgba(255, 193, 7, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 193, 7, 0.3)',
          marginBottom: '12px'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#FFC107'
          }}>⚡ Performance Stats</label>
          <div style={{ fontSize: '11px', color: '#B0BEC5' }}>
            <div>Render Time: {performanceStats.renderTime}ms</div>
            <div>Stitch Count: {performanceStats.stitchCount}</div>
            <div>Memory: {performanceStats.memoryUsage}MB</div>
            <div style={{ 
              marginTop: '4px', 
              padding: '4px', 
              background: performanceModeRef.current ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 255, 0, 0.2)',
              borderRadius: '4px',
              fontSize: '10px'
            }}>
              {performanceModeRef.current ? '🔧 Performance Mode' : '✅ Normal Mode'}
            </div>
          </div>
        </div>

        {/* Ultra-Realistic Satin Stitch Controls */}
        <div className="control-group" style={{
          background: 'rgba(255, 20, 147, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 20, 147, 0.3)',
          marginBottom: '12px'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#FF1493'
          }}>🌟 Ultra-Realistic Satin Stitch</label>
          
          {/* Material Properties */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '11px', color: '#FF1493', display: 'block', marginBottom: '4px' }}>Thread Type:</label>
            <select 
              value={satinMaterial.threadType} 
              onChange={(e) => setSatinMaterial(prev => ({ ...prev, threadType: e.target.value as any }))}
              style={{ width: '100%', padding: '4px', fontSize: '11px', borderRadius: '4px', border: '1px solid #FF1493' }}
            >
              <option value="cotton">Cotton</option>
              <option value="polyester">Polyester</option>
              <option value="silk">Silk</option>
              <option value="metallic">Metallic</option>
              <option value="glow">Glow</option>
              <option value="variegated">Variegated</option>
            </select>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#FF1493' }}>Sheen:</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={satinMaterial.sheen} 
                onChange={(e) => setSatinMaterial(prev => ({ ...prev, sheen: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '9px', color: '#FF1493' }}>{satinMaterial.sheen.toFixed(1)}</span>
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#FF1493' }}>Roughness:</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={satinMaterial.roughness} 
                onChange={(e) => setSatinMaterial(prev => ({ ...prev, roughness: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '9px', color: '#FF1493' }}>{satinMaterial.roughness.toFixed(1)}</span>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#FF1493' }}>Height:</label>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="0.1" 
                value={satin3DProperties.height} 
                onChange={(e) => setSatin3DProperties(prev => ({ ...prev, height: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '9px', color: '#FF1493' }}>{satin3DProperties.height.toFixed(1)}mm</span>
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#FF1493' }}>Density:</label>
              <input 
                type="range" 
                min="2" 
                max="20" 
                step="1" 
                value={satin3DProperties.stitchDensity} 
                onChange={(e) => setSatin3DProperties(prev => ({ ...prev, stitchDensity: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '9px', color: '#FF1493' }}>{satin3DProperties.stitchDensity}/mm</span>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#FF1493' }}>Zigzag Amp:</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={satin3DProperties.zigzagAmplitude} 
                onChange={(e) => setSatin3DProperties(prev => ({ ...prev, zigzagAmplitude: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '9px', color: '#FF1493' }}>{satin3DProperties.zigzagAmplitude.toFixed(1)}</span>
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#FF1493' }}>Zigzag Freq:</label>
              <input 
                type="range" 
                min="0.5" 
                max="5" 
                step="0.5" 
                value={satin3DProperties.zigzagFrequency} 
                onChange={(e) => setSatin3DProperties(prev => ({ ...prev, zigzagFrequency: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '9px', color: '#FF1493' }}>{satin3DProperties.zigzagFrequency.toFixed(1)}</span>
            </div>
          </div>
          
          <button 
            onClick={generateUltraRealisticSatin}
            style={{
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
            }}
          >
            🌟 Generate Ultra-Realistic Satin
          </button>
        </div>

        {/* Ultra-Realistic Fill Stitch Controls */}
        <div className="control-group" style={{
          background: 'rgba(0, 150, 255, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(0, 150, 255, 0.3)',
          marginBottom: '12px'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#0096FF'
          }}>🎨 Ultra-Realistic Fill Stitch</label>
          
          {/* Material Properties */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '11px', color: '#0096FF', display: 'block', marginBottom: '4px' }}>Thread Type:</label>
            <select 
              value={fillMaterial.threadType} 
              onChange={(e) => setFillMaterial(prev => ({ ...prev, threadType: e.target.value as any }))}
              style={{ width: '100%', padding: '4px', fontSize: '11px', borderRadius: '4px', border: '1px solid #0096FF' }}
            >
              <option value="cotton">Cotton</option>
              <option value="polyester">Polyester</option>
              <option value="silk">Silk</option>
              <option value="metallic">Metallic</option>
              <option value="glow">Glow</option>
              <option value="variegated">Variegated</option>
            </select>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#0096FF' }}>Sheen:</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={fillMaterial.sheen} 
                onChange={(e) => setFillMaterial(prev => ({ ...prev, sheen: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '9px', color: '#0096FF' }}>{fillMaterial.sheen.toFixed(1)}</span>
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#0096FF' }}>Roughness:</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={fillMaterial.roughness} 
                onChange={(e) => setFillMaterial(prev => ({ ...prev, roughness: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '9px', color: '#0096FF' }}>{fillMaterial.roughness.toFixed(1)}</span>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#0096FF' }}>Height:</label>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="0.1" 
                value={fill3DProperties.height} 
                onChange={(e) => setFill3DProperties(prev => ({ ...prev, height: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '9px', color: '#0096FF' }}>{fill3DProperties.height.toFixed(1)}mm</span>
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#0096FF' }}>Density:</label>
              <input 
                type="range" 
                min="1" 
                max="10" 
                step="0.5" 
                value={fill3DProperties.stitchDensity} 
                onChange={(e) => setFill3DProperties(prev => ({ ...prev, stitchDensity: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '9px', color: '#0096FF' }}>{fmt(fill3DProperties.stitchDensity, 1)}/mm</span>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#0096FF' }}>Fill Density:</label>
              <input 
                type="range" 
                min="0.5" 
                max="5" 
                step="0.1" 
                value={fill3DProperties.stitchDensity} 
                onChange={(e) => setFill3DProperties(prev => ({ ...prev, stitchDensity: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '9px', color: '#0096FF' }}>{fmt(fill3DProperties.stitchDensity, 1)}</span>
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#0096FF' }}>Fill Angle:</label>
              <input 
                type="range" 
                min="0" 
                max="180" 
                step="15" 
                value={fillAngle} 
                onChange={(e) => setFillAngle(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '9px', color: '#0096FF' }}>{fillAngle}°</span>
            </div>
          </div>
          
          <button 
            onClick={generateUltraRealisticFill}
            style={{
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
            }}
          >
            🎨 Generate Ultra-Realistic Fill
          </button>
        </div>

        {/* Ultra-Realistic Cross-Stitch Controls */}
        <div className="control-group" style={{
          background: 'rgba(255, 165, 0, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 165, 0, 0.3)',
          marginBottom: '12px'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#FFA500'
          }}>❌ Ultra-Realistic Cross-Stitch</label>
          
          {/* Material Properties */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '11px', color: '#FFA500', display: 'block', marginBottom: '4px' }}>Thread Type:</label>
            <select 
              value={crossStitchMaterial.threadType} 
              onChange={(e) => setCrossStitchMaterial(prev => ({ ...prev, threadType: e.target.value as any }))}
              style={{ width: '100%', padding: '4px', fontSize: '11px', borderRadius: '4px', border: '1px solid #FFA500' }}
            >
              <option value="cotton">Cotton</option>
              <option value="polyester">Polyester</option>
              <option value="silk">Silk</option>
              <option value="metallic">Metallic</option>
              <option value="glow">Glow</option>
              <option value="variegated">Variegated</option>
            </select>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#FFA500' }}>Sheen:</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={crossStitchMaterial.sheen} 
                onChange={(e) => setCrossStitchMaterial(prev => ({ ...prev, sheen: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '9px', color: '#FFA500' }}>{crossStitchMaterial.sheen.toFixed(1)}</span>
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#FFA500' }}>Roughness:</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={crossStitchMaterial.roughness} 
                onChange={(e) => setCrossStitchMaterial(prev => ({ ...prev, roughness: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '9px', color: '#FFA500' }}>{crossStitchMaterial.roughness.toFixed(1)}</span>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#FFA500' }}>Height:</label>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="0.1" 
                value={crossStitch3DProperties.height} 
                onChange={(e) => setCrossStitch3DProperties(prev => ({ ...prev, height: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '9px', color: '#FFA500' }}>{crossStitch3DProperties.height.toFixed(1)}mm</span>
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#FFA500' }}>Density:</label>
              <input 
                type="range" 
                min="1" 
                max="10" 
                step="0.5" 
                value={crossStitch3DProperties.stitchDensity} 
                onChange={(e) => setCrossStitch3DProperties(prev => ({ ...prev, stitchDensity: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '9px', color: '#FFA500' }}>{fmt(crossStitch3DProperties.stitchDensity, 1)}/mm</span>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#FFA500' }}>Cross Size:</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={crossSize} 
                onChange={(e) => setCrossSize(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '9px', color: '#FFA500' }}>{fmt(crossSize, 1)}</span>
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#FFA500' }}>Cross Angle:</label>
              <input 
                type="range" 
                min="0" 
                max="180" 
                step="15" 
                value={crossAngle} 
                onChange={(e) => setCrossAngle(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '9px', color: '#FFA500' }}>{crossAngle}°</span>
            </div>
          </div>
          
          <button 
            onClick={generateUltraRealisticCrossStitch}
            style={{
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
            }}
          >
            ❌ Generate Ultra-Realistic Cross-Stitch
          </button>
        </div>

        {/* Ultra-Realistic Outline Stitch Controls */}
        <div className="control-group" style={{
          background: 'rgba(50, 205, 50, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(50, 205, 50, 0.3)',
          marginBottom: '12px'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#32CD32'
          }}>📏 Ultra-Realistic Outline Stitch</label>
          
          {/* Material Properties */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '11px', color: '#32CD32', display: 'block', marginBottom: '4px' }}>Thread Type:</label>
            <select 
              value={outlineMaterial.threadType} 
              onChange={(e) => setOutlineMaterial(prev => ({ ...prev, threadType: e.target.value as any }))}
              style={{ width: '100%', padding: '4px', fontSize: '11px', borderRadius: '4px', border: '1px solid #32CD32' }}
            >
              <option value="cotton">Cotton</option>
              <option value="polyester">Polyester</option>
              <option value="silk">Silk</option>
              <option value="metallic">Metallic</option>
              <option value="glow">Glow</option>
              <option value="variegated">Variegated</option>
            </select>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#32CD32' }}>Sheen:</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={outlineMaterial.sheen} 
                onChange={(e) => setOutlineMaterial(prev => ({ ...prev, sheen: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '9px', color: '#32CD32' }}>{outlineMaterial.sheen.toFixed(1)}</span>
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#32CD32' }}>Roughness:</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={outlineMaterial.roughness} 
                onChange={(e) => setOutlineMaterial(prev => ({ ...prev, roughness: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '9px', color: '#32CD32' }}>{outlineMaterial.roughness.toFixed(1)}</span>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#32CD32' }}>Height:</label>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="0.1" 
                value={outline3DProperties.height} 
                onChange={(e) => setOutline3DProperties(prev => ({ ...prev, height: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '9px', color: '#32CD32' }}>{outline3DProperties.height.toFixed(1)}mm</span>
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#32CD32' }}>Density:</label>
              <input 
                type="range" 
                min="1" 
                max="10" 
                step="0.5" 
                value={outline3DProperties.stitchDensity} 
                onChange={(e) => setOutline3DProperties(prev => ({ ...prev, stitchDensity: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '9px', color: '#32CD32' }}>{outline3DProperties.stitchDensity.toFixed(1)}/mm</span>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#32CD32' }}>Edge Sharpness:</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={outline3DProperties.edgeSharpness} 
                onChange={(e) => setOutline3DProperties(prev => ({ ...prev, edgeSharpness: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '9px', color: '#32CD32' }}>{outline3DProperties.edgeSharpness.toFixed(1)}</span>
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#32CD32' }}>Curve Smoothing:</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={outline3DProperties.curveSmoothing} 
                onChange={(e) => setOutline3DProperties(prev => ({ ...prev, curveSmoothing: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '9px', color: '#32CD32' }}>{outline3DProperties.curveSmoothing.toFixed(1)}</span>
            </div>
          </div>
          
          <button 
            onClick={generateUltraRealisticOutline}
            style={{
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
            }}
          >
            📏 Generate Ultra-Realistic Outline
          </button>
        </div>

        {/* Ultra-Realistic Chain Stitch Controls */}
        <div className="control-group" style={{
          background: 'rgba(138, 43, 226, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(138, 43, 226, 0.3)',
          marginBottom: '12px'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#8A2BE2'
          }}>🔗 Ultra-Realistic Chain Stitch</label>
          
          {/* Material Properties */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '11px', color: '#8A2BE2', display: 'block', marginBottom: '4px' }}>Thread Type:</label>
            <select 
              value={chainMaterial.threadType} 
              onChange={(e) => setChainMaterial(prev => ({ ...prev, threadType: e.target.value as any }))}
              style={{ width: '100%', padding: '4px', fontSize: '11px', borderRadius: '4px', border: '1px solid #8A2BE2' }}
            >
              <option value="cotton">Cotton</option>
              <option value="polyester">Polyester</option>
              <option value="silk">Silk</option>
              <option value="metallic">Metallic</option>
              <option value="glow">Glow</option>
              <option value="variegated">Variegated</option>
            </select>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#8A2BE2' }}>Sheen:</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={chainMaterial.sheen} 
                onChange={(e) => setChainMaterial(prev => ({ ...prev, sheen: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '9px', color: '#8A2BE2' }}>{chainMaterial.sheen.toFixed(1)}</span>
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#8A2BE2' }}>Roughness:</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={chainMaterial.roughness} 
                onChange={(e) => setChainMaterial(prev => ({ ...prev, roughness: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '9px', color: '#8A2BE2' }}>{chainMaterial.roughness.toFixed(1)}</span>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#8A2BE2' }}>Height:</label>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="0.1" 
                value={chain3DProperties.height} 
                onChange={(e) => setChain3DProperties(prev => ({ ...prev, height: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '9px', color: '#8A2BE2' }}>{chain3DProperties.height.toFixed(1)}mm</span>
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#8A2BE2' }}>Density:</label>
              <input 
                type="range" 
                min="1" 
                max="10" 
                step="0.5" 
                value={chain3DProperties.stitchDensity} 
                onChange={(e) => setChain3DProperties(prev => ({ ...prev, stitchDensity: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '9px', color: '#8A2BE2' }}>{chain3DProperties.stitchDensity.toFixed(1)}/mm</span>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#8A2BE2' }}>Loop Size:</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={chain3DProperties.loopSize} 
                onChange={(e) => setChain3DProperties(prev => ({ ...prev, loopSize: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '9px', color: '#8A2BE2' }}>{chain3DProperties.loopSize.toFixed(1)}</span>
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#8A2BE2' }}>Loop Tightness:</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={chain3DProperties.loopTightness} 
                onChange={(e) => setChain3DProperties(prev => ({ ...prev, loopTightness: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '9px', color: '#8A2BE2' }}>{chain3DProperties.loopTightness.toFixed(1)}</span>
            </div>
          </div>
          
          <button 
            onClick={generateUltraRealisticChain}
            style={{
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
            }}
          >
            🔗 Generate Ultra-Realistic Chain
          </button>
        </div>

        {/* Ultra-Realistic Backstitch Controls */}
        <div className="control-group" style={{
          background: 'rgba(255, 99, 71, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 99, 71, 0.3)',
          marginBottom: '12px'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#FF6347'
          }}>↩️ Ultra-Realistic Backstitch</label>
          
          <button 
            onClick={generateUltraRealisticBackstitch}
            style={{
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
            }}
          >
            ↩️ Generate Ultra-Realistic Backstitch
          </button>
        </div>

        {/* Ultra-Realistic French Knot Controls */}
        <div className="control-group" style={{
          background: 'rgba(255, 215, 0, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          marginBottom: '12px'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#FFD700'
          }}>🎯 Ultra-Realistic French Knot</label>
          
          <button 
            onClick={generateUltraRealisticFrenchKnot}
            style={{
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
            }}
          >
            🎯 Generate Ultra-Realistic French Knot
          </button>
        </div>

        {/* Ultra-Realistic Bullion Controls */}
        <div className="control-group" style={{
          background: 'rgba(147, 112, 219, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(147, 112, 219, 0.3)',
          marginBottom: '12px'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#9370DB'
          }}>🌀 Ultra-Realistic Bullion</label>
          
          <button 
            onClick={generateUltraRealisticBullion}
            style={{
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
            }}
          >
            🌀 Generate Ultra-Realistic Bullion
          </button>
        </div>

        {/* Ultra-Realistic Lazy Daisy Controls */}
        <div className="control-group" style={{
          background: 'rgba(255, 192, 203, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 192, 203, 0.3)',
          marginBottom: '12px'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#FFC0CB'
          }}>🌸 Ultra-Realistic Lazy Daisy</label>
          
          <button 
            onClick={generateUltraRealisticLazyDaisy}
            style={{
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
            }}
          >
            🌸 Generate Ultra-Realistic Lazy Daisy
          </button>
        </div>

        {/* Ultra-Realistic Feather Controls */}
        <div className="control-group" style={{
          background: 'rgba(173, 216, 230, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(173, 216, 230, 0.3)',
          marginBottom: '12px'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#ADD8E6'
          }}>🪶 Ultra-Realistic Feather</label>
          
          <button 
            onClick={generateUltraRealisticFeather}
            style={{
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
            }}
          >
            🪶 Generate Ultra-Realistic Feather
          </button>
        </div>

        {/* Advanced Complex Design Tools */}
        <div className="control-group" style={{
          background: 'rgba(0, 150, 255, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(0, 150, 255, 0.3)',
          marginBottom: '12px'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#0096FF'
          }}>🎨 Complex Design Tools</label>
          
          {/* Pattern Generation Controls */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '6px', 
            marginBottom: '8px',
            fontSize: '11px'
          }}>
            <button
              onClick={() => {
                const patterns = generateComplexPattern('geometric', 8);
                console.log('Generated geometric pattern with', patterns.length, 'points');
              }}
              style={{
                padding: '6px 8px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: '500'
              }}
            >
              🔷 Geometric
            </button>
            <button
              onClick={() => {
                const patterns = generateComplexPattern('organic', 10);
                console.log('Generated organic pattern with', patterns.length, 'points');
              }}
              style={{
                padding: '6px 8px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: '500'
              }}
            >
              🌿 Organic
            </button>
            <button
              onClick={() => {
                const patterns = generateComplexPattern('floral', 12);
                console.log('Generated floral pattern with', patterns.length, 'points');
              }}
              style={{
                padding: '6px 8px',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: '500'
              }}
            >
              🌸 Floral
            </button>
            <button
              onClick={() => {
                const patterns = generateComplexPattern('abstract', 15);
                console.log('Generated abstract pattern with', patterns.length, 'points');
              }}
              style={{
                padding: '6px 8px',
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: '500'
              }}
            >
              🎭 Abstract
            </button>
          </div>
          
          {/* Pattern Recognition */}
          <button
            onClick={() => {
              const patterns = recognizePattern(embroideryStitches);
              console.log('Pattern recognition results:', patterns);
              alert(`Pattern Analysis:\nGeometric: ${patterns.geometric}\nOrganic: ${patterns.organic}\nText: ${patterns.text}\nFloral: ${patterns.floral}\nAbstract: ${patterns.abstract}`);
            }}
            style={{
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
            }}
          >
            🔍 Analyze Pattern
          </button>
          
          {/* Path Optimization */}
          <button
            onClick={() => {
              const optimized = optimizeComplexStitchPath(embroideryStitches);
              setEmbroideryStitches(optimized);
              console.log('Optimized stitch path for', optimized.length, 'stitches');
            }}
            style={{
              width: '100%',
              padding: '8px',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500'
            }}
          >
            🔧 Optimize Path
          </button>
        </div>

        {/* Revolutionary Advanced Stitch Types with InkStitch Integration */}
        <div className="control-group" style={{
          background: 'rgba(255, 0, 150, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 0, 150, 0.3)',
          marginBottom: '12px'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#FF0096'
          }}>🚀 Advanced Stitch Types (InkStitch Enhanced)</label>
          
          {/* InkStitch Optimization Controls */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '6px', 
            marginBottom: '8px',
            fontSize: '11px'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="checkbox"
                checked={stitchOptimization}
                onChange={(e) => setStitchOptimization(e.target.checked)}
                style={{ accentColor: '#FF0096' }}
              />
              Stitch Optimization
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="checkbox"
                checked={jumpStitchMinimization}
                onChange={(e) => setJumpStitchMinimization(e.target.checked)}
                style={{ accentColor: '#FF0096' }}
              />
              Jump Minimization
            </label>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px',
            marginBottom: '8px'
          }}>
            {advancedStitchTypes.slice(6).map((stitchType) => (
              <button
                key={stitchType}
                onClick={() => {
                  console.log(`🚀 ADVANCED STITCH SELECTED: ${stitchType}`);
                  setSelectedAdvancedStitch(stitchType);
                  setEmbroideryStitchType(stitchType as any);
                }}
                style={{
                  padding: '6px 8px',
                  fontSize: '10px',
                borderRadius: '4px',
                  border: selectedAdvancedStitch === stitchType ? '2px solid #FF0096' : '1px solid #475569',
                  background: selectedAdvancedStitch === stitchType ? 'rgba(255, 0, 150, 0.2)' : '#1E293B',
                  color: '#E2E8F0',
                cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {stitchType.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

        {/* Revolutionary Thread Library */}
        <div className="control-group" style={{
          background: 'rgba(0, 255, 255, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          marginBottom: '12px'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#00FFFF'
          }}>🌈 Revolutionary Thread Library</label>
          
          <div style={{ marginBottom: '8px' }}>
            <select
              value={selectedThreadCategory}
              onChange={(e) => setSelectedThreadCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '6px',
                borderRadius: '4px',
                border: '1px solid rgba(0, 255, 255, 0.3)',
                background: 'rgba(0, 255, 255, 0.05)',
                color: '#00FFFF'
              }}
            >
              <option value="metallic">✨ Metallic Threads</option>
              <option value="variegated">🎨 Variegated Threads</option>
              <option value="glow">🌟 Glow-in-Dark Threads</option>
              <option value="specialty">💎 Specialty Threads</option>
            </select>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '4px'
          }}>
            {threadLibrary[selectedThreadCategory as keyof typeof threadLibrary].map((color, index) => (
              <button
                key={index}
                onClick={() => setEmbroideryColor(color)}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: embroideryColor === color ? '2px solid #00FFFF' : '1px solid #475569',
                  background: color,
                  cursor: 'pointer'
                }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* AI-Powered Design Features */}
        <div className="control-group" style={{
          background: 'rgba(255, 165, 0, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 165, 0, 0.3)',
          marginBottom: '12px'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#FFA500'
          }}>🤖 AI-Powered Features</label>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <button
              onClick={() => setAiDesignMode(!aiDesignMode)}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 165, 0, 0.3)',
                background: aiDesignMode ? 'rgba(255, 165, 0, 0.2)' : '#1E293B',
                color: '#FFA500',
                cursor: 'pointer'
              }}
            >
              {aiDesignMode ? '🤖 AI Mode ON' : '🤖 AI Mode OFF'}
            </button>
            
            <button
              onClick={() => {
                setMlOptimization(!mlOptimization);
                if (!mlOptimization) {
                  optimizeWithML();
                }
              }}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 165, 0, 0.3)',
                background: mlOptimization ? 'rgba(255, 165, 0, 0.2)' : '#1E293B',
                color: '#FFA500',
                cursor: 'pointer'
              }}
            >
              {isOptimizing ? '🧠 Optimizing...' : mlOptimization ? '🧠 ML ON' : '🧠 ML OFF'}
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            <button
              onClick={() => generateAIDesign('Create a beautiful floral pattern')}
                style={{
                  padding: '4px 8px',
                fontSize: '10px',
                  borderRadius: '4px',
                border: '1px solid rgba(255, 165, 0, 0.3)',
                background: '#1E293B',
                color: '#FFA500',
                cursor: 'pointer'
              }}
            >
              🌸 AI Design
            </button>
            
            <button
              onClick={optimizeStitchPath}
              style={{
                padding: '4px 8px',
                  fontSize: '10px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 165, 0, 0.3)',
                background: '#1E293B',
                color: '#FFA500',
                cursor: 'pointer'
              }}
            >
              ⚡ Optimize
            </button>
            
            <button
              onClick={suggestThreadColors}
              style={{
                padding: '4px 8px',
                fontSize: '10px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 165, 0, 0.3)',
                background: '#1E293B',
                color: '#FFA500',
                cursor: 'pointer'
              }}
            >
              🎨 Suggest Colors
            </button>
          </div>
          
          <div style={{ fontSize: '9px', color: '#32CD32', marginTop: '4px', opacity: 0.8 }}>
            ⌨️ Shortcuts: Ctrl+Z (Undo) | Ctrl+Y (Redo) | Ctrl+Shift+Z (Redo)
          </div>
        </div>

        {/* Real-time Collaboration & AR/VR */}
        <div className="control-group" style={{
          background: 'rgba(138, 43, 226, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(138, 43, 226, 0.3)',
          marginBottom: '12px'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#8A2BE2'
          }}>🌐 Next-Gen Features</label>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <button
              onClick={enableRealTimeCollaboration}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                borderRadius: '4px',
                border: '1px solid rgba(138, 43, 226, 0.3)',
                background: realTimeCollaboration ? 'rgba(138, 43, 226, 0.2)' : '#1E293B',
                color: '#8A2BE2',
                cursor: 'pointer'
              }}
            >
              {realTimeCollaboration ? '👥 Collaborating' : '👥 Start Collab'}
            </button>
            
            <button
              onClick={enableARVRMode}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                borderRadius: '4px',
                border: '1px solid rgba(138, 43, 226, 0.3)',
                background: arVrMode ? 'rgba(138, 43, 226, 0.2)' : '#1E293B',
                color: '#8A2BE2',
                cursor: 'pointer'
              }}
            >
              {arVrMode ? '🥽 AR/VR ON' : '🥽 AR/VR OFF'}
            </button>
          </div>
          
          {collaborators.length > 0 && (
            <div style={{ fontSize: '10px', color: '#8A2BE2', marginTop: '4px' }}>
              Collaborators: {collaborators.length}
            </div>
          )}
        </div>

        {/* Layer Management & Undo/Redo */}
        <div className="control-group" style={{
          background: 'rgba(50, 205, 50, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(50, 205, 50, 0.3)',
          marginBottom: '12px'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#32CD32'
          }}>📚 Professional Tools</label>
          
          <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
            <button
              onClick={undoAction}
              disabled={undoStack.length === 0}
              title={`Undo (Ctrl+Z) - ${undoStack.length} actions available`}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                borderRadius: '4px',
                border: '1px solid rgba(50, 205, 50, 0.3)',
                background: undoStack.length === 0 ? '#6B7280' : '#1E293B',
                color: undoStack.length === 0 ? '#9CA3AF' : '#32CD32',
                cursor: undoStack.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              ↶ Undo ({undoStack.length})
            </button>
            
            <button
              onClick={redoAction}
              disabled={redoStack.length === 0}
              title={`Redo (Ctrl+Y or Ctrl+Shift+Z) - ${redoStack.length} actions available`}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                borderRadius: '4px',
                border: '1px solid rgba(50, 205, 50, 0.3)',
                background: redoStack.length === 0 ? '#6B7280' : '#1E293B',
                color: redoStack.length === 0 ? '#9CA3AF' : '#32CD32',
                cursor: redoStack.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              ↷ Redo ({redoStack.length})
            </button>
            
            <button
              onClick={() => addDesignLayer(`Layer ${designLayers.length + 1}`)}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                borderRadius: '4px',
                border: '1px solid rgba(50, 205, 50, 0.3)',
                background: '#1E293B',
                color: '#32CD32',
                cursor: 'pointer'
              }}
            >
              ➕ Add Layer
            </button>
            
            <button
              onClick={enhanceStitchQuality}
              disabled={embroideryStitches.length === 0}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                borderRadius: '4px',
                border: '1px solid rgba(50, 205, 50, 0.3)',
                background: embroideryStitches.length === 0 ? '#6B7280' : '#1E293B',
                color: embroideryStitches.length === 0 ? '#9CA3AF' : '#32CD32',
                cursor: embroideryStitches.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              ✨ Enhance Quality
            </button>
            
            <button
              onClick={optimizeForFabric}
              disabled={embroideryStitches.length === 0}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                borderRadius: '4px',
                border: '1px solid rgba(50, 205, 50, 0.3)',
                background: embroideryStitches.length === 0 ? '#6B7280' : '#1E293B',
                color: embroideryStitches.length === 0 ? '#9CA3AF' : '#32CD32',
                cursor: embroideryStitches.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              🎯 Optimize Fabric
            </button>
          </div>
          
          {designLayers.length > 0 && (
            <div style={{ fontSize: '10px', color: '#32CD32' }}>
              Layers: {designLayers.length} | Current: {currentLayer + 1}
            </div>
          )}
        </div>

        {/* Performance Monitoring */}
        <div className="control-group" style={{
          background: 'rgba(255, 140, 0, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 140, 0, 0.3)',
          marginBottom: '12px'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#FF8C00'
          }}>⚡ Performance Monitor</label>
          
          <div style={{ fontSize: '10px', color: '#FF8C00', lineHeight: '1.4' }}>
            <div>Render Time: {performanceStats.renderTime}ms</div>
            <div>Stitch Count: {performanceStats.stitchCount}</div>
            <div>Memory Usage: {performanceStats.memoryUsage}MB</div>
            <div style={{ 
              marginTop: '4px', 
              padding: '2px 4px', 
              background: performanceStats.renderTime > 16 ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 255, 0, 0.2)',
              borderRadius: '3px',
              fontSize: '9px'
            }}>
              {performanceStats.renderTime > 16 ? '⚠️ Slow Rendering' : '✅ Good Performance'}
            </div>
          </div>
        </div>


        {/* Action Buttons */}
        <div className="action-buttons">
          <button onClick={analyzePattern} disabled={embroideryStitches.length === 0}>
            Analyze Pattern
          </button>
          <button onClick={clearStitches} className="clear-btn">
            Clear All
          </button>
        </div>
      </div>

      {/* Canvas Controls - No Canvas Rendering */}
      <div className="canvas-controls" style={{
        background: 'rgba(139, 92, 246, 0.1)',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        marginBottom: '12px'
      }}>
        <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <div>
            <h4 style={{ margin: 0, color: '#E2E8F0', fontSize: '16px' }}>
              🎨 Embroidery Controls ({embroideryStitches.length} stitches)
            </h4>
            <p style={{ margin: '4px 0 0 0', color: '#94A3B8', fontSize: '12px' }}>
              Current: {embroideryStitchType} • {embroideryColor} • {embroideryThickness}px
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                // Simulate embroidery by applying stitches to 3D model
                if (embroideryStitches.length > 0) {
                  embroideryStitches.forEach(stitch => {
                    drawStitchOnModel(stitch);
                  });
                  // Trigger texture update
                  window.dispatchEvent(new CustomEvent('embroideryTextureUpdate'));
                }
                console.log('Simulating embroidery...');
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #8B5CF6',
                background: 'rgba(139, 92, 246, 0.2)',
                color: '#8B5CF6',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ▶️ Simulate
            </button>
            <button
              onClick={() => {
                // Export pattern
                console.log('Exporting pattern...');
                // Export functionality will be handled by the main canvas
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #10B981',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#10B981',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              💾 Export
            </button>
            <button
              onClick={() => {
                // Clear stitches
                if (useEnhancedMode && enhancedManager) {
                  enhancedManager.clearAll();
                setEmbroideryStitches([]);
                  console.log('Clearing all stitches with enhanced manager...');
                } else {
                  setEmbroideryStitches([]);
                  console.log('Clearing all stitches...');
                }
                // Clear functionality will be handled by the main canvas
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #EF4444',
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#EF4444',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🗑️ Clear
            </button>
              </div>
          </div>
          <div style={{
          fontSize: '12px',
          color: '#94A3B8',
          textAlign: 'center',
          padding: '8px',
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '6px'
        }}>
          Use the main canvas to draw embroidery stitches on the 3D model
        </div>
      </div>

      {/* Backend Integration Controls */}
      <div className="control-group" style={{
        background: 'rgba(34, 197, 94, 0.1)',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid rgba(34, 197, 94, 0.3)',
        marginBottom: '12px'
      }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: '500',
          color: '#22C55E'
        }}>Backend Integration</label>
        
        {/* Connection Status */}
        <div style={{ marginBottom: '8px', fontSize: '12px' }}>
          <span style={{ color: backendConnected ? '#22C55E' : '#EF4444' }}>
            {backendConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
          {backendHealth && (
            <div style={{ marginTop: '4px', fontSize: '10px', color: '#94A3B8' }}>
              InkStitch: {backendHealth.inkscape?.found ? '✅' : '❌'}
              PyEmbroidery: {backendHealth.pyembroidery ? '✅' : '❌'}
        </div>
      )}
        </div>

        {/* Export Options */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <button
            onClick={() => setShowExportOptions(!showExportOptions)}
            style={{
              flex: 1,
              padding: '6px 8px',
              borderRadius: '4px',
              border: '1px solid #475569',
              background: '#1E293B',
              color: '#E2E8F0',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Export Options
          </button>
          <button
            onClick={checkBackendConnection}
            style={{
              padding: '6px 8px',
              borderRadius: '4px',
              border: '1px solid #475569',
              background: '#1E293B',
              color: '#E2E8F0',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🔄
          </button>
        </div>

        {/* Export Format Selection */}
        {showExportOptions && (
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '4px', display: 'block' }}>
              Format:
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'dst' | 'pes' | 'exp')}
              style={{
                width: '100%',
                padding: '4px 6px',
                borderRadius: '4px',
                border: '1px solid #475569',
                background: '#1E293B',
                color: '#E2E8F0',
                fontSize: '11px'
              }}
            >
              <option value="dst">DST (Tajima)</option>
              <option value="pes">PES (Brother)</option>
              <option value="exp">EXP (Melco)</option>
            </select>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={exportEmbroideryFile}
            disabled={!backendConnected || isExporting || embroideryStitches.length === 0}
            style={{
              flex: 1,
              padding: '6px 8px',
              borderRadius: '4px',
              border: '1px solid #475569',
              background: backendConnected && embroideryStitches.length > 0 ? '#22C55E' : '#374151',
              color: '#FFFFFF',
              cursor: backendConnected && embroideryStitches.length > 0 ? 'pointer' : 'not-allowed',
              fontSize: '11px',
              opacity: backendConnected && embroideryStitches.length > 0 ? 1 : 0.5
            }}
          >
            {isExporting ? 'Exporting...' : 'Export File'}
          </button>
          <button
            onClick={() => generateProfessionalStitches(embroideryStitches)}
            disabled={!backendConnected || embroideryStitches.length === 0}
            style={{
              flex: 1,
              padding: '6px 8px',
              borderRadius: '4px',
              border: '1px solid #475569',
              background: backendConnected && embroideryStitches.length > 0 ? '#3B82F6' : '#374151',
              color: '#FFFFFF',
              cursor: backendConnected && embroideryStitches.length > 0 ? 'pointer' : 'not-allowed',
              fontSize: '11px',
              opacity: backendConnected && embroideryStitches.length > 0 ? 1 : 0.5
            }}
          >
            Optimize
          </button>
      </div>

        {/* File Import */}
        <div style={{ marginTop: '8px' }}>
          <input
            type="file"
            accept=".dst,.pes,.exp,.jef,.vp3"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importEmbroideryFile(file);
            }}
            style={{ display: 'none' }}
            id="import-embroidery"
          />
          <label
            htmlFor="import-embroidery"
            style={{
              display: 'block',
              padding: '6px 8px',
              borderRadius: '4px',
              border: '1px solid #475569',
              background: '#1E293B',
              color: '#E2E8F0',
              cursor: 'pointer',
              fontSize: '11px',
              textAlign: 'center'
            }}
          >
            Import File
          </label>
        </div>
      </div>

      {/* AI Analysis Modal */}
      {showAnalysis && aiAnalysis && (
        <div className="analysis-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>AI Pattern Analysis</h3>
              <button onClick={() => setShowAnalysis(false)}>×</button>
      </div>
            <div className="analysis-content">
              <div className="analysis-section">
                <h4>Density Analysis</h4>
                <p>Level: {aiAnalysis.density?.level}</p>
                <p>Value: {aiAnalysis.density?.value}</p>
              </div>
              <div className="analysis-section">
                <h4>Complexity</h4>
                <p>Overall: {aiAnalysis.complexity?.overall}</p>
                <p>Stitch Variety: {aiAnalysis.complexity?.stitchVariety}</p>
              </div>
              <div className="analysis-section">
                <h4>Thread Analysis</h4>
                <p>Total Threads: {Object.values(aiAnalysis.threadTypes || {}).reduce((sum: number, t: any) => sum + (t.count || 0), 0)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default EmbroideryTool;
