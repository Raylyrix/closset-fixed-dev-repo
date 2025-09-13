/**
 * Advanced Embroidery Tool
 * 4K HD realistic embroidery tool with InkStitch integration
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../App';
import AdvancedEmbroideryEngine, { 
  AdvancedStitch, 
  ThreadProperties, 
  FabricProperties, 
  RenderingContext,
  RenderOptions 
} from '../embroidery/AdvancedEmbroideryEngine';
import InkStitchIntegration, { 
  FillStitchParams, 
  SatinStitchParams, 
  ContourFillParams,
  TartanFillParams 
} from '../embroidery/InkStitchIntegration';
import HDTextureSystem, { 
  ThreadTextureData, 
  FabricTextureData, 
  NormalMapData 
} from '../embroidery/HDTextureSystem';
import RealisticLightingSystem, { 
  Light, 
  Material, 
  LightingContext 
} from '../embroidery/RealisticLightingSystem';
import { performanceMonitor } from '../utils/PerformanceMonitor';
import { memoryManager } from '../utils/MemoryManager';
import { centralizedErrorHandler, ErrorCategory, ErrorSeverity } from '../utils/CentralizedErrorHandler';

interface AdvancedEmbroideryToolProps {
  onStitchAdd?: (stitch: AdvancedStitch) => void;
  onPatternComplete?: (stitches: AdvancedStitch[]) => void;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  enableRealTimePreview?: boolean;
  enableShadows?: boolean;
  enableLighting?: boolean;
}

const AdvancedEmbroideryTool: React.FC<AdvancedEmbroideryToolProps> = ({
  onStitchAdd,
  onPatternComplete,
  quality = 'high',
  enableRealTimePreview = true,
  enableShadows = true,
  enableLighting = true
}) => {
  const { 
    layers, 
    addLayer, 
    composedCanvas,
    setComposedCanvas
  } = useApp();

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<AdvancedEmbroideryEngine | null>(null);
  const textureSystemRef = useRef<HDTextureSystem | null>(null);
  const lightingSystemRef = useRef<RealisticLightingSystem | null>(null);

  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentStitches, setCurrentStitches] = useState<AdvancedStitch[]>([]);
  const [selectedThread, setSelectedThread] = useState<ThreadProperties>({
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
  const [selectedFabric, setSelectedFabric] = useState<FabricProperties>({
    type: 'cotton',
    color: '#ffffff',
    weave: 'plain',
    stretch: 0.1,
    thickness: 0.5,
    roughness: 0.5,
    normalMap: 'cotton_normal'
  });
  const [renderOptions, setRenderOptions] = useState<RenderOptions>({
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
  const [currentPattern, setCurrentPattern] = useState<AdvancedStitch[]>([]);
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

    } catch (error) {
      centralizedErrorHandler.handleError(
        error as Error,
        { component: 'AdvancedEmbroideryTool', function: 'initializeSystems' },
        ErrorSeverity.HIGH,
        ErrorCategory.RENDERING
      );
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
    if (!textureSystemRef.current) return;

    try {
      // Load thread textures
      const threadTypes: ThreadProperties['type'][] = ['cotton', 'polyester', 'silk', 'metallic', 'glow', 'variegated'];
      for (const type of threadTypes) {
        const threadData: ThreadTextureData = {
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
      const fabricTypes: FabricProperties['type'][] = ['cotton', 'denim', 'silk', 'leather', 'canvas', 'knit'];
      for (const type of fabricTypes) {
        const fabricData: FabricTextureData = {
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
        const normalData: NormalMapData = {
          materialType,
          height: 0.1,
          strength: 1.0,
          resolution: renderOptions.resolution
        };
        await textureSystemRef.current.generateNormalMap(normalData);
      }

    } catch (error) {
      centralizedErrorHandler.handleError(
        error as Error,
        { component: 'AdvancedEmbroideryTool', function: 'loadDefaultTextures' },
        ErrorSeverity.MEDIUM,
        ErrorCategory.RENDERING
      );
    }
  };

  const renderPattern = useCallback(async () => {
    if (!engineRef.current || !lightingSystemRef.current || currentStitches.length === 0) {
      return;
    }

    try {
      const startTime = performance.now();

      // Create rendering context
      const context: RenderingContext = {
        gl: canvasRef.current!.getContext('webgl2')!,
        program: engineRef.current['program']!,
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

    } catch (error) {
      centralizedErrorHandler.handleError(
        error as Error,
        { component: 'AdvancedEmbroideryTool', function: 'renderPattern' },
        ErrorSeverity.MEDIUM,
        ErrorCategory.RENDERING
      );
    }
  }, [currentStitches, engineRef.current, lightingSystemRef.current]);

  const generateFillStitch = async (shape: any) => {
    try {
      const params: FillStitchParams = {
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

    } catch (error) {
      centralizedErrorHandler.handleError(
        error as Error,
        { component: 'AdvancedEmbroideryTool', function: 'generateFillStitch' },
        ErrorSeverity.MEDIUM,
        ErrorCategory.EMBROIDERY
      );
    }
  };

  const generateSatinStitch = async (rails: any[], rungs: any[]) => {
    try {
      const params: SatinStitchParams = {
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

    } catch (error) {
      centralizedErrorHandler.handleError(
        error as Error,
        { component: 'AdvancedEmbroideryTool', function: 'generateSatinStitch' },
        ErrorSeverity.MEDIUM,
        ErrorCategory.EMBROIDERY
      );
    }
  };

  const generateContourFill = async (shape: any) => {
    try {
      const params: ContourFillParams = {
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

    } catch (error) {
      centralizedErrorHandler.handleError(
        error as Error,
        { component: 'AdvancedEmbroideryTool', function: 'generateContourFill' },
        ErrorSeverity.MEDIUM,
        ErrorCategory.EMBROIDERY
      );
    }
  };

  const generateTartanFill = async (shape: any) => {
    try {
      const params: TartanFillParams = {
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

    } catch (error) {
      centralizedErrorHandler.handleError(
        error as Error,
        { component: 'AdvancedEmbroideryTool', function: 'generateTartanFill' },
        ErrorSeverity.MEDIUM,
        ErrorCategory.EMBROIDERY
      );
    }
  };

  const optimizeStitches = () => {
    try {
      const optimized = InkStitchIntegration.optimizeStitchPlacement(currentStitches);
      setCurrentStitches(optimized);
      
      console.log(`🧵 Optimized ${optimized.length} stitches`);
      
    } catch (error) {
      centralizedErrorHandler.handleError(
        error as Error,
        { component: 'AdvancedEmbroideryTool', function: 'optimizeStitches' },
        ErrorSeverity.LOW,
        ErrorCategory.EMBROIDERY
      );
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

    } catch (error) {
      centralizedErrorHandler.handleError(
        error as Error,
        { component: 'AdvancedEmbroideryTool', function: 'exportPattern' },
        ErrorSeverity.LOW,
        ErrorCategory.EMBROIDERY
      );
    }
  };

  if (!isInitialized) {
    return (
      <div className="advanced-embroidery-tool">
        <div className="loading">
          <div className="spinner"></div>
          <p>Initializing Advanced Embroidery Tool...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="advanced-embroidery-tool">
      <div className="tool-header">
        <h3>🧵 Advanced Embroidery Tool</h3>
        <div className="performance-metrics">
          <span>FPS: {Math.round(performanceMetrics.fps)}</span>
          <span>Memory: {Math.round(performanceMetrics.memoryUsage)}MB</span>
          <span>Stitches: {performanceMetrics.stitchCount}</span>
        </div>
      </div>

      <div className="tool-content">
        {/* Canvas */}
        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            style={{ border: '1px solid #ccc', borderRadius: '8px' }}
          />
        </div>

        {/* Controls */}
        <div className="controls">
          <div className="control-group">
            <label>Thread Type:</label>
            <select
              value={selectedThread.type}
              onChange={(e) => setSelectedThread(prev => ({ ...prev, type: e.target.value as any }))}
            >
              <option value="cotton">Cotton</option>
              <option value="polyester">Polyester</option>
              <option value="silk">Silk</option>
              <option value="metallic">Metallic</option>
              <option value="glow">Glow</option>
              <option value="variegated">Variegated</option>
            </select>
          </div>

          <div className="control-group">
            <label>Thread Color:</label>
            <input
              type="color"
              value={selectedThread.color}
              onChange={(e) => setSelectedThread(prev => ({ ...prev, color: e.target.value }))}
            />
          </div>

          <div className="control-group">
            <label>Thread Thickness:</label>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={selectedThread.thickness}
              onChange={(e) => setSelectedThread(prev => ({ ...prev, thickness: parseFloat(e.target.value) }))}
            />
            <span>{selectedThread.thickness}mm</span>
          </div>

          <div className="control-group">
            <label>Fabric Type:</label>
            <select
              value={selectedFabric.type}
              onChange={(e) => setSelectedFabric(prev => ({ ...prev, type: e.target.value as any }))}
            >
              <option value="cotton">Cotton</option>
              <option value="denim">Denim</option>
              <option value="silk">Silk</option>
              <option value="leather">Leather</option>
              <option value="canvas">Canvas</option>
              <option value="knit">Knit</option>
            </select>
          </div>

          <div className="control-group">
            <label>Quality:</label>
            <select
              value={quality}
              onChange={(e) => setRenderOptions(prev => ({ ...prev, quality: e.target.value as any }))}
            >
              <option value="low">Low (1024px)</option>
              <option value="medium">Medium (2048px)</option>
              <option value="high">High (4096px)</option>
              <option value="ultra">Ultra (8192px)</option>
            </select>
          </div>
        </div>

        {/* Stitch Generation Buttons */}
        <div className="stitch-buttons">
          <button onClick={() => generateFillStitch({})} className="stitch-btn">
            Generate Fill Stitch
          </button>
          <button onClick={() => generateSatinStitch([], [])} className="stitch-btn">
            Generate Satin Stitch
          </button>
          <button onClick={() => generateContourFill({})} className="stitch-btn">
            Generate Contour Fill
          </button>
          <button onClick={() => generateTartanFill({})} className="stitch-btn">
            Generate Tartan Fill
          </button>
        </div>

        {/* Pattern Controls */}
        <div className="pattern-controls">
          <button onClick={optimizeStitches} className="control-btn">
            Optimize Stitches
          </button>
          <button onClick={clearStitches} className="control-btn">
            Clear Pattern
          </button>
          <button onClick={exportPattern} className="control-btn">
            Export Pattern
          </button>
        </div>

        {/* Advanced Settings */}
        <div className="advanced-settings">
          <h4>Advanced Settings</h4>
          <div className="setting-group">
            <label>
              <input
                type="checkbox"
                checked={renderOptions.enableShadows}
                onChange={(e) => setRenderOptions(prev => ({ ...prev, enableShadows: e.target.checked }))}
              />
              Enable Shadows
            </label>
          </div>
          <div className="setting-group">
            <label>
              <input
                type="checkbox"
                checked={renderOptions.enableLighting}
                onChange={(e) => setRenderOptions(prev => ({ ...prev, enableLighting: e.target.checked }))}
              />
              Enable Advanced Lighting
            </label>
          </div>
          <div className="setting-group">
            <label>
              <input
                type="checkbox"
                checked={renderOptions.enableNormalMaps}
                onChange={(e) => setRenderOptions(prev => ({ ...prev, enableNormalMaps: e.target.checked }))}
              />
              Enable Normal Maps
            </label>
          </div>
          <div className="setting-group">
            <label>
              <input
                type="checkbox"
                checked={renderOptions.enableAO}
                onChange={(e) => setRenderOptions(prev => ({ ...prev, enableAO: e.target.checked }))}
              />
              Enable Ambient Occlusion
            </label>
          </div>
        </div>
      </div>

      <style>{`
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
      `}</style>
    </div>
  );
};

export default AdvancedEmbroideryTool;
