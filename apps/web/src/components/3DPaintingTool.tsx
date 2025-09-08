import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '../App';

interface ThreeDPaintingToolProps {
  active: boolean;
}

interface Brush3D {
  id: string;
  name: string;
  type: 'paint' | 'sculpt' | 'smooth' | 'inflate' | 'deflate' | 'flatten';
  size: number;
  strength: number;
  falloff: number;
  color: string;
  opacity: number;
}

interface SculptMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  operation: 'add' | 'subtract' | 'smooth' | 'flatten' | 'inflate' | 'deflate';
}

interface PaintStroke {
  id: string;
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
  opacity: number;
  timestamp: number;
}

interface SculptOperation {
  id: string;
  x: number;
  y: number;
  z: number;
  size: number;
  strength: number;
  mode: string;
  timestamp: number;
}

export function ThreeDPaintingTool({ active }: ThreeDPaintingToolProps) {
  // Console log removed

  const [currentBrush, setCurrentBrush] = useState<Brush3D>({
    id: 'paint_brush',
    name: 'Paint Brush',
    type: 'paint',
    size: 20,
    strength: 0.5,
    falloff: 0.8,
    color: '#ff3366',
    opacity: 1.0
  });

  const [sculptMode, setSculptMode] = useState<string>('add');
  const [isPainting, setIsPainting] = useState(false);
  const [isSculpting, setIsSculpting] = useState(false);
  const [paintStrokes, setPaintStrokes] = useState<PaintStroke[]>([]);
  const [sculptOperations, setSculptOperations] = useState<SculptOperation[]>([]);
  const [depthMap, setDepthMap] = useState<Float32Array | null>(null);
  const [normalMap, setNormalMap] = useState<Float32Array | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const depthCanvasRef = useRef<HTMLCanvasElement>(null);
  const normalCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const sculptModes: SculptMode[] = [
    {
      id: 'add',
      name: 'Add',
      description: 'Add material to the surface',
      icon: '➕',
      operation: 'add'
    },
    {
      id: 'subtract',
      name: 'Subtract',
      description: 'Remove material from the surface',
      icon: '➖',
      operation: 'subtract'
    },
    {
      id: 'smooth',
      name: 'Smooth',
      description: 'Smooth the surface',
      icon: '🌊',
      operation: 'smooth'
    },
    {
      id: 'flatten',
      name: 'Flatten',
      description: 'Flatten the surface to a plane',
      icon: '📐',
      operation: 'flatten'
    },
    {
      id: 'inflate',
      name: 'Inflate',
      description: 'Inflate the surface outward',
      icon: '🎈',
      operation: 'inflate'
    },
    {
      id: 'deflate',
      name: 'Deflate',
      description: 'Deflate the surface inward',
      icon: '🔽',
      operation: 'deflate'
    }
  ];

  const brushes3D: Brush3D[] = [
    {
      id: 'paint_brush',
      name: 'Paint Brush',
      type: 'paint',
      size: 20,
      strength: 0.5,
      falloff: 0.8,
      color: '#ff3366',
      opacity: 1.0
    },
    {
      id: 'sculpt_brush',
      name: 'Sculpt Brush',
      type: 'sculpt',
      size: 30,
      strength: 0.7,
      falloff: 0.6,
      color: '#ff3366',
      opacity: 1.0
    },
    {
      id: 'smooth_brush',
      name: 'Smooth Brush',
      type: 'smooth',
      size: 40,
      strength: 0.3,
      falloff: 0.9,
      color: '#ff3366',
      opacity: 1.0
    },
    {
      id: 'inflate_brush',
      name: 'Inflate Brush',
      type: 'inflate',
      size: 25,
      strength: 0.6,
      falloff: 0.7,
      color: '#ff3366',
      opacity: 1.0
    }
  ];

  const initializeDepthMap = useCallback(() => {
    // Console log removed
    const canvas = depthCanvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;
    const depthData = new Float32Array(width * height);
    
    // Initialize with flat surface
    for (let i = 0; i < depthData.length; i++) {
      depthData[i] = 0.5; // Mid-depth
    }
    
    setDepthMap(depthData);
  }, []);

  const updateDepthMap = useCallback((x: number, y: number, operation: SculptOperation) => {
    // Console log removed
    
    if (!depthMap) return;

    const canvas = depthCanvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;
    const newDepthMap = new Float32Array(depthMap);

    const radius = operation.size;
    const strength = operation.strength;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > radius) continue;

        const pixelX = Math.floor(x + dx);
        const pixelY = Math.floor(y + dy);
        
        if (pixelX < 0 || pixelX >= width || pixelY < 0 || pixelY >= height) continue;

        const index = pixelY * width + pixelX;
        const falloff = 1 - (distance / radius);
        const effect = strength * falloff;

        switch (operation.mode) {
          case 'add':
            newDepthMap[index] = Math.min(1, newDepthMap[index] + effect);
            break;
          case 'subtract':
            newDepthMap[index] = Math.max(0, newDepthMap[index] - effect);
            break;
          case 'smooth':
            // Average with surrounding pixels
            let sum = 0;
            let count = 0;
            for (let sy = -2; sy <= 2; sy++) {
              for (let sx = -2; sx <= 2; sx++) {
                const sx2 = pixelX + sx;
                const sy2 = pixelY + sy;
                if (sx2 >= 0 && sx2 < width && sy2 >= 0 && sy2 < height) {
                  sum += newDepthMap[sy2 * width + sx2];
                  count++;
                }
              }
            }
            newDepthMap[index] = sum / count;
            break;
          case 'flatten':
            newDepthMap[index] = 0.5;
            break;
          case 'inflate':
            newDepthMap[index] = Math.min(1, newDepthMap[index] + effect * 0.5);
            break;
          case 'deflate':
            newDepthMap[index] = Math.max(0, newDepthMap[index] - effect * 0.5);
            break;
        }
      }
    }

    setDepthMap(newDepthMap);
    updateNormalMap(newDepthMap, width, height);
  }, [depthMap]);

  const updateNormalMap = useCallback((depthData: Float32Array, width: number, height: number) => {
    // Console log removed
    
    const normalData = new Float32Array(width * height * 3);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        const normalIndex = index * 3;
        
        // Calculate gradients
        const left = x > 0 ? depthData[y * width + (x - 1)] : depthData[index];
        const right = x < width - 1 ? depthData[y * width + (x + 1)] : depthData[index];
        const top = y > 0 ? depthData[(y - 1) * width + x] : depthData[index];
        const bottom = y < height - 1 ? depthData[(y + 1) * width + x] : depthData[index];
        
        const dx = (right - left) * 0.5;
        const dy = (bottom - top) * 0.5;
        
        // Calculate normal vector
        const normalX = -dx;
        const normalY = -dy;
        const normalZ = 1.0;
        
        // Normalize
        const length = Math.sqrt(normalX * normalX + normalY * normalY + normalZ * normalZ);
        normalData[normalIndex] = normalX / length;
        normalData[normalIndex + 1] = normalY / length;
        normalData[normalIndex + 2] = normalZ / length;
      }
    }
    
    setNormalMap(normalData);
  }, []);

  const render3DPreview = useCallback(() => {
    // Console log removed
    
    const canvas = previewCanvasRef.current;
    if (!canvas || !depthMap) return;

    const ctx = canvas.getContext('2d')!;
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Render depth map as height field
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const depthIndex = Math.floor((y / height) * Math.sqrt(depthMap.length));
        const depth = depthMap[depthIndex] || 0.5;
        
        const index = (y * width + x) * 4;
        const intensity = Math.floor(depth * 255);
        
        data[index] = intensity;     // R
        data[index + 1] = intensity; // G
        data[index + 2] = intensity; // B
        data[index + 3] = 255;       // A
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Render paint strokes
    paintStrokes.forEach(stroke => {
      const x = stroke.x * width;
      const y = stroke.y * height;
      const size = stroke.size;
      
      ctx.save();
      ctx.globalAlpha = stroke.opacity;
      ctx.fillStyle = stroke.color;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }, [depthMap, paintStrokes]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    if (currentBrush.type === 'paint') {
      setIsPainting(true);
      const newStroke: PaintStroke = {
        id: `stroke_${Date.now()}`,
        x,
        y,
        z: depthMap ? depthMap[Math.floor(y * Math.sqrt(depthMap.length))] : 0.5,
        size: currentBrush.size,
        color: currentBrush.color,
        opacity: currentBrush.opacity,
        timestamp: Date.now()
      };
      setPaintStrokes(prev => [...prev, newStroke]);
    } else {
      setIsSculpting(true);
      const newOperation: SculptOperation = {
        id: `sculpt_${Date.now()}`,
        x,
        y,
        z: depthMap ? depthMap[Math.floor(y * Math.sqrt(depthMap.length))] : 0.5,
        size: currentBrush.size,
        strength: currentBrush.strength,
        mode: sculptMode,
        timestamp: Date.now()
      };
      setSculptOperations(prev => [...prev, newOperation]);
      updateDepthMap(x, y, newOperation);
    }
  }, [currentBrush, depthMap, sculptMode, updateDepthMap]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    if (isPainting && currentBrush.type === 'paint') {
      const newStroke: PaintStroke = {
        id: `stroke_${Date.now()}`,
        x,
        y,
        z: depthMap ? depthMap[Math.floor(y * Math.sqrt(depthMap.length))] : 0.5,
        size: currentBrush.size,
        color: currentBrush.color,
        opacity: currentBrush.opacity,
        timestamp: Date.now()
      };
      setPaintStrokes(prev => [...prev, newStroke]);
    } else if (isSculpting) {
      const newOperation: SculptOperation = {
        id: `sculpt_${Date.now()}`,
        x,
        y,
        z: depthMap ? depthMap[Math.floor(y * Math.sqrt(depthMap.length))] : 0.5,
        size: currentBrush.size,
        strength: currentBrush.strength,
        mode: sculptMode,
        timestamp: Date.now()
      };
      setSculptOperations(prev => [...prev, newOperation]);
      updateDepthMap(x, y, newOperation);
    }
  }, [isPainting, isSculpting, currentBrush, depthMap, sculptMode, updateDepthMap]);

  const handleMouseUp = useCallback(() => {
    setIsPainting(false);
    setIsSculpting(false);
  }, []);

  const clearAll = useCallback(() => {
    // Console log removed
    setPaintStrokes([]);
    setSculptOperations([]);
    initializeDepthMap();
  }, [initializeDepthMap]);

  const export3DModel = useCallback(() => {
    // Console log removed
    // Implementation for exporting 3D model
  }, []);

  useEffect(() => {
    if (active) {
      initializeDepthMap();
    }
  }, [active, initializeDepthMap]);

  useEffect(() => {
    render3DPreview();
  }, [render3DPreview]);

  if (!active) {
    // Console log removed
    return null;
  }

  console.log('🎨 3DPaintingTool: Rendering component', { 
    currentBrush: currentBrush.name,
    sculptMode,
    isPainting,
    isSculpting,
    paintStrokesCount: paintStrokes.length,
    sculptOperationsCount: sculptOperations.length
  });

  return (
    <div className="3d-painting-tool">
      <div className="tool-header">
        <h4 style={{ margin: 0, color: '#F59E0B', fontSize: '18px' }}>
          🎨 3D Painting & Sculpting
        </h4>
        <div className="tool-controls">
          <button
            onClick={clearAll}
            style={{
              padding: '6px 12px',
              background: '#EF4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
          <button
            onClick={export3DModel}
            style={{
              padding: '6px 12px',
              background: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Export
          </button>
          <button
            onClick={() => useApp.getState().setTool('brush')}
            style={{
              padding: '6px 12px',
              background: '#6B7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
            title="Close 3D Painting"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* 3D Brushes */}
      <div className="3d-brushes" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '8px' }}>
          3D Brushes
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: '8px'
        }}>
          {brushes3D.map(brush => (
            <button
              key={brush.id}
              className={`brush-btn ${currentBrush.id === brush.id ? 'active' : ''}`}
              onClick={() => setCurrentBrush(brush)}
              style={{
                padding: '8px',
                background: currentBrush.id === brush.id ? '#F59E0B' : 'rgba(245, 158, 11, 0.2)',
                color: currentBrush.id === brush.id ? '#FFFFFF' : '#FCD34D',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '16px', marginBottom: '4px' }}>
                {brush.type === 'paint' ? '🎨' : 
                 brush.type === 'sculpt' ? '🔨' : 
                 brush.type === 'smooth' ? '🌊' : 
                 brush.type === 'inflate' ? '🎈' : '🔽'}
              </div>
              <div>{brush.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Sculpt Modes */}
      <div className="sculpt-modes" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '8px' }}>
          Sculpt Modes
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '6px'
        }}>
          {sculptModes.map(mode => (
            <button
              key={mode.id}
              className={`mode-btn ${sculptMode === mode.id ? 'active' : ''}`}
              onClick={() => setSculptMode(mode.id)}
              style={{
                padding: '6px',
                background: sculptMode === mode.id ? '#F59E0B' : 'rgba(245, 158, 11, 0.2)',
                color: sculptMode === mode.id ? '#FFFFFF' : '#FCD34D',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '4px',
                fontSize: '10px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '14px', marginBottom: '2px' }}>{mode.icon}</div>
              <div>{mode.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Brush Settings */}
      <div className="brush-settings" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '8px' }}>
          Brush Settings
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px'
        }}>
          <div>
            <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
              Size
            </label>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={currentBrush.size}
              onChange={(e) => setCurrentBrush(prev => ({ ...prev, size: parseInt(e.target.value) }))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
              Strength
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={currentBrush.strength}
              onChange={(e) => setCurrentBrush(prev => ({ ...prev, strength: parseFloat(e.target.value) }))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
              Falloff
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={currentBrush.falloff}
              onChange={(e) => setCurrentBrush(prev => ({ ...prev, falloff: parseFloat(e.target.value) }))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
              Opacity
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={currentBrush.opacity}
              onChange={(e) => setCurrentBrush(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* 3D Preview */}
      <div className="3d-preview" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '8px' }}>
          3D Preview
        </div>
        <canvas
          ref={previewCanvasRef}
          width={300}
          height={200}
          style={{
            width: '100%',
            height: '200px',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '4px',
            background: '#1F2937',
            cursor: 'crosshair'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </div>

      {/* Statistics */}
      <div className="statistics" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '8px' }}>
          Statistics
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          fontSize: '11px',
          color: '#D1D5DB'
        }}>
          <div>Paint Strokes: {paintStrokes.length}</div>
          <div>Sculpt Operations: {sculptOperations.length}</div>
          <div>Depth Map: {depthMap ? 'Ready' : 'Not initialized'}</div>
          <div>Normal Map: {normalMap ? 'Ready' : 'Not ready'}</div>
        </div>
      </div>

      {/* Hidden canvases for processing */}
      <canvas ref={canvasRef} width={512} height={512} style={{ display: 'none' }} />
      <canvas ref={depthCanvasRef} width={512} height={512} style={{ display: 'none' }} />
      <canvas ref={normalCanvasRef} width={512} height={512} style={{ display: 'none' }} />
    </div>
  );
}
