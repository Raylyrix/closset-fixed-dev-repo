import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '../App';

interface AdvancedBrushSystemProps {
  active: boolean;
}

interface BrushPreset {
  id: string;
  name: string;
  type: 'paint' | 'ink' | 'watercolor' | 'oil' | 'digital' | 'custom';
  dynamics: BrushDynamics;
  texture: BrushTexture;
  color: string;
}

interface BrushDynamics {
  sizeVariation: number;
  opacityVariation: number;
  flowVariation: number;
  angleVariation: number;
  spacingVariation: number;
  pressureSensitivity: boolean;
  tiltSensitivity: boolean;
  velocitySensitivity: boolean;
  randomize: boolean;
}

interface BrushTexture {
  pattern: string;
  scale: number;
  rotation: number;
  opacity: number;
  blendMode: GlobalCompositeOperation;
  noise: number;
  grain: number;
}

export function AdvancedBrushSystem({ active }: AdvancedBrushSystemProps) {
  // Console log removed

  const [brushPresets, setBrushPresets] = useState<BrushPreset[]>([
    {
      id: 'realistic_paint',
      name: 'Realistic Paint',
      type: 'paint',
      dynamics: {
        sizeVariation: 0.3,
        opacityVariation: 0.4,
        flowVariation: 0.2,
        angleVariation: 0.1,
        spacingVariation: 0.15,
        pressureSensitivity: true,
        tiltSensitivity: true,
        velocitySensitivity: true,
        randomize: false
      },
      texture: {
        pattern: 'canvas',
        scale: 1.0,
        rotation: 0,
        opacity: 0.8,
        blendMode: 'multiply',
        noise: 0.1,
        grain: 0.2
      },
      color: '#ff3366'
    },
    {
      id: 'watercolor_brush',
      name: 'Watercolor',
      type: 'watercolor',
      dynamics: {
        sizeVariation: 0.5,
        opacityVariation: 0.6,
        flowVariation: 0.4,
        angleVariation: 0.2,
        spacingVariation: 0.3,
        pressureSensitivity: true,
        tiltSensitivity: false,
        velocitySensitivity: true,
        randomize: true
      },
      texture: {
        pattern: 'watercolor',
        scale: 1.2,
        rotation: 0,
        opacity: 0.7,
        blendMode: 'soft-light',
        noise: 0.3,
        grain: 0.4
      },
      color: '#ff3366'
    },
    {
      id: 'ink_pen',
      name: 'Ink Pen',
      type: 'ink',
      dynamics: {
        sizeVariation: 0.1,
        opacityVariation: 0.05,
        flowVariation: 0.1,
        angleVariation: 0.3,
        spacingVariation: 0.05,
        pressureSensitivity: true,
        tiltSensitivity: true,
        velocitySensitivity: false,
        randomize: false
      },
      texture: {
        pattern: 'smooth',
        scale: 1.0,
        rotation: 0,
        opacity: 1.0,
        blendMode: 'source-over',
        noise: 0.02,
        grain: 0.0
      },
      color: '#000000'
    }
  ]);

  const [selectedPreset, setSelectedPreset] = useState<string>('realistic_paint');
  const [customDynamics, setCustomDynamics] = useState<BrushDynamics>(brushPresets[0].dynamics);
  const [customTexture, setCustomTexture] = useState<BrushTexture>(brushPresets[0].texture);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const [brushPath, setBrushPath] = useState<{ x: number; y: number; pressure: number; tilt: number }[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const currentPreset = brushPresets.find(p => p.id === selectedPreset) || brushPresets[0];

  const updateBrushPreset = useCallback((presetId: string, updates: Partial<BrushPreset>) => {
    // Console log removed
    setBrushPresets(prev => prev.map(preset => 
      preset.id === presetId ? { ...preset, ...updates } : preset
    ));
  }, []);

  const createCustomBrush = useCallback(() => {
    // Console log removed
    const newPreset: BrushPreset = {
      id: `custom_${Date.now()}`,
      name: 'Custom Brush',
      type: 'custom',
      dynamics: customDynamics,
      texture: customTexture,
      color: '#ff3366'
    };
    setBrushPresets(prev => [...prev, newPreset]);
    setSelectedPreset(newPreset.id);
  }, [customDynamics, customTexture]);

  const applyBrushStroke = useCallback((ctx: CanvasRenderingContext2D, points: typeof brushPath) => {
    // Console log removed
    
    if (points.length < 2) return;

    const preset = currentPreset;
    const dynamics = preset.dynamics;
    const texture = preset.texture;

    ctx.save();
    ctx.globalCompositeOperation = texture.blendMode;

    // Create brush texture
    const textureCanvas = document.createElement('canvas');
    const textureCtx = textureCanvas.getContext('2d')!;
    textureCanvas.width = 64;
    textureCanvas.height = 64;

    // Generate texture based on pattern
    switch (texture.pattern) {
      case 'canvas':
        generateCanvasTexture(textureCtx, texture);
        break;
      case 'watercolor':
        generateWatercolorTexture(textureCtx, texture);
        break;
      case 'smooth':
        generateSmoothTexture(textureCtx, texture);
        break;
    }

    // Draw brush strokes with dynamics
    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currentPoint = points[i];
      
      const pressure = currentPoint.pressure;
      const velocity = Math.sqrt(
        Math.pow(currentPoint.x - prevPoint.x, 2) + 
        Math.pow(currentPoint.y - prevPoint.y, 2)
      );

      // Calculate dynamic properties
      let size = 20 * pressure * (1 + (dynamics.sizeVariation * (Math.random() - 0.5)));
      let opacity = pressure * (1 + (dynamics.opacityVariation * (Math.random() - 0.5)));
      const flow = pressure * (1 + (dynamics.flowVariation * (Math.random() - 0.5)));
      const angle = Math.atan2(currentPoint.y - prevPoint.y, currentPoint.x - prevPoint.x) + 
                   (dynamics.angleVariation * (Math.random() - 0.5));

      // Apply velocity sensitivity
      if (dynamics.velocitySensitivity) {
        const velocityFactor = Math.min(1, velocity / 10);
        const sizeMultiplier = 1 - (velocityFactor * 0.3);
        const opacityMultiplier = 1 - (velocityFactor * 0.2);
        size *= sizeMultiplier;
        opacity *= opacityMultiplier;
      }

      // Draw brush stroke
      ctx.save();
      ctx.globalAlpha = opacity * texture.opacity;
      ctx.translate(currentPoint.x, currentPoint.y);
      ctx.rotate(angle);
      ctx.scale(size / 64, size / 64);
      
      // Apply texture
      ctx.drawImage(textureCanvas, -32, -32);
      
      ctx.restore();
    }

    ctx.restore();
  }, [currentPreset]);

  const generateCanvasTexture = (ctx: CanvasRenderingContext2D, texture: BrushTexture) => {
    // Console log removed
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 64, 64);
    
    // Add canvas weave pattern
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 64; i += 4) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 64);
      ctx.stroke();
    }
    for (let i = 0; i < 64; i += 4) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(64, i);
      ctx.stroke();
    }
  };

  const generateWatercolorTexture = (ctx: CanvasRenderingContext2D, texture: BrushTexture) => {
    // Console log removed
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 64, 64);
    
    // Add watercolor bleeding effect
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 64;
      const y = Math.random() * 64;
      const radius = Math.random() * 15 + 5;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(0, 0, 0, ${Math.random() * 0.3})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const generateSmoothTexture = (ctx: CanvasRenderingContext2D, texture: BrushTexture) => {
    // Console log removed
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 64, 64);
    
    // Add subtle noise
    const imageData = ctx.getImageData(0, 0, 64, 64);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * texture.noise * 255;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    
    ctx.putImageData(imageData, 0, 0);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    // Console log removed
    setIsDrawing(true);
    setBrushPath([]);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setLastPoint({ x, y });
    setBrushPath([{ x, y, pressure: 1, tilt: 0 }]);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setBrushPath(prev => [...prev, { x, y, pressure: 1, tilt: 0 }]);
    
    // Apply brush stroke in real-time
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d')!;
      applyBrushStroke(ctx, [...brushPath, { x, y, pressure: 1, tilt: 0 }]);
    }
  }, [isDrawing, brushPath, applyBrushStroke]);

  const handleMouseUp = useCallback(() => {
    // Console log removed
    setIsDrawing(false);
    setLastPoint(null);
  }, []);

  if (!active) {
    // Console log removed
    return null;
  }

  console.log('🎨 AdvancedBrushSystem: Rendering component', { 
    presetsCount: brushPresets.length,
    selectedPreset,
    isDrawing
  });

  return (
    <div className="advanced-brush-system">
      <div className="brush-header">
        <h4 style={{ margin: 0, color: '#3B82F6', fontSize: '18px' }}>
          🎨 Advanced Brush System
        </h4>
        <div className="tool-controls">
          <button
            onClick={createCustomBrush}
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
          + Custom
        </button>
        <button
          onClick={() => useApp.getState().setTool('brush')}
          style={{
            padding: '6px 12px',
            background: '#EF4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
          title="Close Advanced Brush"
        >
          ✕ Close
        </button>
        </div>
      </div>

      {/* Brush Presets */}
      <div className="brush-presets" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#3B82F6', marginBottom: '8px' }}>
          Brush Presets
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '8px'
        }}>
          {brushPresets.map(preset => (
            <button
              key={preset.id}
              className={`preset-btn ${selectedPreset === preset.id ? 'active' : ''}`}
              onClick={() => setSelectedPreset(preset.id)}
              style={{
                padding: '8px',
                background: selectedPreset === preset.id ? '#3B82F6' : 'rgba(59, 130, 246, 0.2)',
                color: selectedPreset === preset.id ? '#FFFFFF' : '#93C5FD',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '16px', marginBottom: '4px' }}>
                {preset.type === 'paint' ? '🎨' : 
                 preset.type === 'watercolor' ? '💧' : 
                 preset.type === 'ink' ? '✒️' : 
                 preset.type === 'oil' ? '🖼️' : '🖌️'}
              </div>
              <div>{preset.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Brush Dynamics */}
      <div className="brush-dynamics" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#3B82F6', marginBottom: '8px' }}>
          Brush Dynamics
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px'
        }}>
          <div>
            <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
              Size Variation
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={customDynamics.sizeVariation}
              onChange={(e) => setCustomDynamics(prev => ({ ...prev, sizeVariation: parseFloat(e.target.value) }))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
              Opacity Variation
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={customDynamics.opacityVariation}
              onChange={(e) => setCustomDynamics(prev => ({ ...prev, opacityVariation: parseFloat(e.target.value) }))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
              Flow Variation
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={customDynamics.flowVariation}
              onChange={(e) => setCustomDynamics(prev => ({ ...prev, flowVariation: parseFloat(e.target.value) }))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
              Angle Variation
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={customDynamics.angleVariation}
              onChange={(e) => setCustomDynamics(prev => ({ ...prev, angleVariation: parseFloat(e.target.value) }))}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Sensitivity Controls */}
      <div className="sensitivity-controls" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#3B82F6', marginBottom: '8px' }}>
          Sensitivity
        </div>
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#D1D5DB' }}>
            <input
              type="checkbox"
              checked={customDynamics.pressureSensitivity}
              onChange={(e) => setCustomDynamics(prev => ({ ...prev, pressureSensitivity: e.target.checked }))}
            />
            Pressure
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#D1D5DB' }}>
            <input
              type="checkbox"
              checked={customDynamics.tiltSensitivity}
              onChange={(e) => setCustomDynamics(prev => ({ ...prev, tiltSensitivity: e.target.checked }))}
            />
            Tilt
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#D1D5DB' }}>
            <input
              type="checkbox"
              checked={customDynamics.velocitySensitivity}
              onChange={(e) => setCustomDynamics(prev => ({ ...prev, velocitySensitivity: e.target.checked }))}
            />
            Velocity
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#D1D5DB' }}>
            <input
              type="checkbox"
              checked={customDynamics.randomize}
              onChange={(e) => setCustomDynamics(prev => ({ ...prev, randomize: e.target.checked }))}
            />
            Randomize
          </label>
        </div>
      </div>

      {/* Brush Preview */}
      <div className="brush-preview" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#3B82F6', marginBottom: '8px' }}>
          Brush Preview
        </div>
        <canvas
          ref={previewCanvasRef}
          width={200}
          height={100}
          style={{
            width: '100%',
            height: '100px',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '4px',
            background: '#1F2937',
            cursor: 'crosshair'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </div>

      {/* Texture Settings */}
      <div className="texture-settings">
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#3B82F6', marginBottom: '8px' }}>
          Texture Settings
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px'
        }}>
          <div>
            <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
              Pattern
            </label>
            <select
              value={customTexture.pattern}
              onChange={(e) => setCustomTexture(prev => ({ ...prev, pattern: e.target.value }))}
              style={{
                width: '100%',
                padding: '4px',
                background: '#374151',
                color: '#F9FAFB',
                border: '1px solid #4B5563',
                borderRadius: '4px',
                fontSize: '11px'
              }}
            >
              <option value="canvas">Canvas</option>
              <option value="watercolor">Watercolor</option>
              <option value="smooth">Smooth</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
              Scale
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={customTexture.scale}
              onChange={(e) => setCustomTexture(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
              Noise
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={customTexture.noise}
              onChange={(e) => setCustomTexture(prev => ({ ...prev, noise: parseFloat(e.target.value) }))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
              Grain
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={customTexture.grain}
              onChange={(e) => setCustomTexture(prev => ({ ...prev, grain: parseFloat(e.target.value) }))}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Hidden canvas for actual drawing */}
      <canvas
        ref={canvasRef}
        width={2048}
        height={2048}
        style={{ display: 'none' }}
      />
    </div>
  );
}
