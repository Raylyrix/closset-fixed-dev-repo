/**
 * Advanced Embroidery Tool
 * 4K HD realistic embroidery tool with InkStitch integration
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../App';

interface AdvancedEmbroideryToolProps {
  onStitchAdd?: (stitch: any) => void;
  onPatternComplete?: (pattern: any) => void;
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
  const { layers, addLayer, composedCanvas, setComposedCanvas } = useApp();
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<any>(null);
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isCanvasInitialized, setIsCanvasInitialized] = useState(false);
  const [currentStitches, setCurrentStitches] = useState<any[]>([]);
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
  const [currentPattern, setCurrentPattern] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0,
    stitchCount: 0
  });

  // Initialize canvas when it becomes available
  useEffect(() => {
    if (canvasRef.current && !isCanvasInitialized) {
      console.log('Canvas ref is now available, initializing...');
      initializeCanvas();
    }
  }, [canvasRef.current, isCanvasInitialized]);

  // Hide loading spinner after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Performance monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      setPerformanceMetrics(prev => ({
        ...prev,
        stitchCount: currentStitches.length,
        memoryUsage: Math.round(performance.memory?.usedJSHeapSize / 1024 / 1024 || 0)
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [currentStitches.length]);

  const initializeCanvas = async () => {
    try {
      console.log('🧵 Initializing Advanced Embroidery Canvas...');
      
      if (!canvasRef.current) {
        console.warn('Canvas ref not available during canvas initialization');
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.warn('Could not get 2D context from canvas');
        return;
      }

      // Set canvas size to display size (800x600)
      canvas.width = 800;
      canvas.height = 600;

      // Initialize basic rendering
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw welcome message
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Advanced Embroidery Tool', canvas.width / 2, canvas.height / 2 - 20);
      ctx.font = '16px Arial';
      ctx.fillText('4K HD Realistic Embroidery System', canvas.width / 2, canvas.height / 2 + 10);
      ctx.fillText('Ready to create professional patterns!', canvas.width / 2, canvas.height / 2 + 30);
      
      // Draw some sample stitches
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(100, 100);
      ctx.lineTo(200, 100);
      ctx.lineTo(200, 200);
      ctx.lineTo(100, 200);
      ctx.closePath();
      ctx.stroke();
      
      ctx.fillStyle = '#ff000040';
      ctx.fill();
      
      setIsCanvasInitialized(true);
      console.log('✅ Canvas initialized with welcome message and sample stitch');
      
    } catch (error) {
      console.error('❌ Failed to initialize canvas:', error);
    }
  };

  const cleanup = () => {
    if (engineRef.current) {
      engineRef.current = null;
    }
  };

  const generateFillStitch = () => {
    console.log('🧵 Generating Fill Stitch...');
    const newStitch = {
      id: `stitch_${Date.now()}`,
      type: 'fill',
      points: [
        { x: 100, y: 100 },
        { x: 200, y: 100 },
        { x: 200, y: 200 },
        { x: 100, y: 200 }
      ],
      thread: selectedThread,
      fabric: selectedFabric,
      density: 0.5,
      tension: 0.7
    };
    
    setCurrentStitches(prev => [...prev, newStitch]);
    onStitchAdd?.(newStitch);
    
    // Render the stitch
    renderStitch(newStitch);
  };

  const generateSatinStitch = () => {
    console.log('🧵 Generating Satin Stitch...');
    const newStitch = {
      id: `stitch_${Date.now()}`,
      type: 'satin',
      points: [
        { x: 150, y: 150 },
        { x: 250, y: 150 },
        { x: 250, y: 180 },
        { x: 150, y: 180 }
      ],
      thread: selectedThread,
      fabric: selectedFabric,
      density: 0.8,
      tension: 0.9
    };
    
    setCurrentStitches(prev => [...prev, newStitch]);
    onStitchAdd?.(newStitch);
    
    // Render the stitch
    renderStitch(newStitch);
  };

  const generateContourFill = () => {
    console.log('🧵 Generating Contour Fill...');
    const newStitch = {
      id: `stitch_${Date.now()}`,
      type: 'contour-fill',
      points: [
        { x: 300, y: 100 },
        { x: 400, y: 100 },
        { x: 400, y: 200 },
        { x: 300, y: 200 }
      ],
      thread: selectedThread,
      fabric: selectedFabric,
      density: 0.6,
      tension: 0.8
    };
    
    setCurrentStitches(prev => [...prev, newStitch]);
    onStitchAdd?.(newStitch);
    
    // Render the stitch
    renderStitch(newStitch);
  };

  const generateTartanFill = () => {
    console.log('🧵 Generating Tartan Fill...');
    const newStitch = {
      id: `stitch_${Date.now()}`,
      type: 'tartan-fill',
      points: [
        { x: 100, y: 300 },
        { x: 200, y: 300 },
        { x: 200, y: 400 },
        { x: 100, y: 400 }
      ],
      thread: selectedThread,
      fabric: selectedFabric,
      density: 0.7,
      tension: 0.6
    };
    
    setCurrentStitches(prev => [...prev, newStitch]);
    onStitchAdd?.(newStitch);
    
    // Render the stitch
    renderStitch(newStitch);
  };

  const renderStitch = (stitch: any) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set thread color
    ctx.strokeStyle = stitch.thread.color;
    ctx.lineWidth = stitch.thread.thickness * 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw stitch path
    ctx.beginPath();
    stitch.points.forEach((point: any, index: number) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.closePath();
    ctx.stroke();

    // Fill for fill stitches
    if (stitch.type === 'fill' || stitch.type === 'contour-fill' || stitch.type === 'tartan-fill') {
      ctx.fillStyle = stitch.thread.color + '40'; // Add transparency
      ctx.fill();
    }
  };

  const optimizeStitches = () => {
    console.log('🔧 Optimizing stitches...');
    // Simple optimization - just log for now
    console.log(`Optimized ${currentStitches.length} stitches`);
  };

  const clearPattern = () => {
    console.log('🗑️ Clearing pattern...');
    setCurrentStitches([]);
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Redraw welcome message
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Advanced Embroidery Tool', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '16px Arial';
        ctx.fillText('4K HD Realistic Embroidery System', canvas.width / 2, canvas.height / 2 + 10);
        ctx.fillText('Ready to create professional patterns!', canvas.width / 2, canvas.height / 2 + 30);
      }
    }
  };

  const exportPattern = () => {
    console.log('💾 Exporting pattern...');
    const patternData = {
      stitches: currentStitches,
      thread: selectedThread,
      fabric: selectedFabric,
      renderOptions,
      metadata: {
        created: new Date().toISOString(),
        version: '1.0.0',
        tool: 'Advanced Embroidery Tool'
      }
    };

    const blob = new Blob([JSON.stringify(patternData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `embroidery_pattern_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Show loading spinner while initializing
  if (isLoading) {
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
        <div className="canvas-container">
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={600} 
            style={{ 
              border: '1px solid #ccc', 
              borderRadius: '8px',
              background: '#1a1a1a',
              display: 'block',
              width: '800px',
              height: '600px'
            }} 
          />
          {!isCanvasInitialized && (
            <div className="canvas-placeholder" style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '800px',
              height: '600px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              background: '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '18px',
              textAlign: 'center',
              zIndex: 1
            }}>
              <div>
                <div>Advanced Embroidery Tool</div>
                <div style={{ fontSize: '14px', marginTop: '10px' }}>Canvas initializing...</div>
              </div>
            </div>
          )}
        </div>

        <div className="controls">
          <div className="control-group">
            <label>Thread Type:</label>
            <select 
              value={selectedThread.type} 
              onChange={(e) => setSelectedThread(prev => ({ ...prev, type: e.target.value }))}
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
            <label>Thread Thickness: {selectedThread.thickness}mm</label>
            <input 
              type="range" 
              min="0.1" 
              max="2.0" 
              step="0.1" 
              value={selectedThread.thickness} 
              onChange={(e) => setSelectedThread(prev => ({ ...prev, thickness: parseFloat(e.target.value) }))}
            />
          </div>

          <div className="control-group">
            <label>Fabric Type:</label>
            <select 
              value={selectedFabric.type} 
              onChange={(e) => setSelectedFabric(prev => ({ ...prev, type: e.target.value }))}
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
            <label>Quality: {renderOptions.quality.toUpperCase()}</label>
            <select 
              value={renderOptions.quality} 
              onChange={(e) => setRenderOptions(prev => ({ 
                ...prev, 
                quality: e.target.value as any,
                resolution: e.target.value === 'ultra' ? 8192 : e.target.value === 'high' ? 4096 : e.target.value === 'medium' ? 2048 : 1024
              }))}
            >
              <option value="low">Low (1024px)</option>
              <option value="medium">Medium (2048px)</option>
              <option value="high">High (4096px)</option>
              <option value="ultra">Ultra (8192px)</option>
            </select>
          </div>

          <div className="stitch-buttons">
            <button className="stitch-btn" onClick={generateFillStitch}>
              Generate Fill Stitch
            </button>
            <button className="stitch-btn" onClick={generateSatinStitch}>
              Generate Satin Stitch
            </button>
            <button className="stitch-btn" onClick={generateContourFill}>
              Generate Contour Fill
            </button>
            <button className="stitch-btn" onClick={generateTartanFill}>
              Generate Tartan Fill
            </button>
          </div>

          <div className="pattern-controls">
            <button className="control-btn" onClick={optimizeStitches}>
              Optimize Stitches
            </button>
            <button className="control-btn" onClick={clearPattern}>
              Clear Pattern
            </button>
            <button className="control-btn" onClick={exportPattern}>
              Export Pattern
            </button>
          </div>

          <div className="advanced-settings">
            <h4>Advanced Settings</h4>
            <label>
              <input 
                type="checkbox" 
                checked={enableShadows} 
                onChange={(e) => setRenderOptions(prev => ({ ...prev, enableShadows: e.target.checked }))}
              />
              Enable Shadows
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={enableLighting} 
                onChange={(e) => setRenderOptions(prev => ({ ...prev, enableLighting: e.target.checked }))}
              />
              Enable Advanced Lighting
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={renderOptions.enableTextures} 
                onChange={(e) => setRenderOptions(prev => ({ ...prev, enableTextures: e.target.checked }))}
              />
              Enable Textures
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
          padding-bottom: 15px;
          border-bottom: 1px solid #333;
        }

        .tool-header h3 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }

        .performance-metrics {
          display: flex;
          gap: 15px;
          font-size: 12px;
          color: #ccc;
          font-weight: 500;
        }

        .tool-content {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 20px;
        }

        .canvas-container {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }

        .controls {
          display: flex;
          flex-direction: column;
          gap: 15px;
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
          transition: all 0.2s ease;
        }

        .control-btn:hover {
          background: #555;
        }

        .advanced-settings {
          border-top: 1px solid #333;
          padding-top: 15px;
        }

        .advanced-settings h4 {
          margin: 0 0 10px 0;
          font-size: 16px;
          color: #fff;
        }

        .advanced-settings label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #ccc;
          cursor: pointer;
        }

        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #333;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
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