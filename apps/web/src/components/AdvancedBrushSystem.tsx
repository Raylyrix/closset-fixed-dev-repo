import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '../App';
import { BrushEngine, BrushSettings, BrushPoint } from '../utils/BrushEngine';
import { StrokeSmoothing, WetMediaSimulator } from '../utils/StrokeSmoothing';
import { brushPresetManager, BrushPreset } from '../utils/BrushPresets';

interface AdvancedBrushSystemProps {
  active: boolean;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const hexToRgba = (hex: string, alpha: number) => {
  let normalized = hex.replace('#', '').trim();
  if (normalized.length === 3) {
    normalized = normalized.split('').map(char => char + char).join('');
  }
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export function AdvancedBrushSystem({ active }: AdvancedBrushSystemProps) {
  // Initialize with presets from the manager
  const [brushPresets, setBrushPresets] = useState<BrushPreset[]>(() =>
    brushPresetManager.getAllPresets()
  );
  const [selectedPresetId, setSelectedPresetId] = useState<string>('hard_round');
  const [currentSettings, setCurrentSettings] = useState<BrushSettings | null>(null);

  // Missing state variables
  const [customDynamics, setCustomDynamics] = useState({
    sizeVariation: 0.5,
    opacityVariation: 0.3,
    flowVariation: 0.2,
    angleVariation: 0.1,
    pressureSensitivity: true,
    tiltSensitivity: false,
    velocitySensitivity: true,
    randomize: false
  });

  const [customTexture, setCustomTexture] = useState({
    pattern: 'canvas',
    scale: 1.0,
    noise: 0.1,
    grain: 0.05
  });

  // Brush engine and utilities
  const brushEngineRef = useRef<BrushEngine | null>(null);
  const strokeSmoothingRef = useRef<StrokeSmoothing | null>(null);
  const wetMediaRef = useRef<WetMediaSimulator | null>(null);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStrokeId, setCurrentStrokeId] = useState<string | null>(null);
  const [lastPoint, setLastPoint] = useState<BrushPoint | null>(null);

  // Canvas refs
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize engines
  useEffect(() => {
    if (previewCanvasRef.current) {
      brushEngineRef.current = new BrushEngine(previewCanvasRef.current);
      strokeSmoothingRef.current = new StrokeSmoothing();
      wetMediaRef.current = new WetMediaSimulator(previewCanvasRef.current);

      // Load current preset settings
      const preset = brushPresetManager.getPreset(selectedPresetId);
      if (preset) {
        setCurrentSettings(preset.settings);
      }
    }

    return () => {
      brushEngineRef.current?.dispose();
      wetMediaRef.current?.dispose();
    };
  }, []);

  // Update settings when preset changes
  useEffect(() => {
    const preset = brushPresetManager.getPreset(selectedPresetId);
    if (preset) {
      setCurrentSettings(preset.settings);
    }
  }, [selectedPresetId]);

  // Handle mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentSettings || !brushEngineRef.current) return;

    setIsDrawing(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const point: BrushPoint = {
      x,
      y,
      pressure: 1, // TODO: Get from pressure API
      tiltX: 0,   // TODO: Get from tilt API
      tiltY: 0,   // TODO: Get from tilt API
      velocity: 0,
      timestamp: Date.now(),
      distance: 0
    };

    setLastPoint(point);
    const strokeId = brushEngineRef.current.startStroke(currentSettings);
    setCurrentStrokeId(strokeId);
    brushEngineRef.current.addPoint(point);
  }, [currentSettings]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentSettings || !brushEngineRef.current || !lastPoint) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const currentTime = Date.now();
    const dx = x - lastPoint.x;
    const dy = y - lastPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const timeDelta = currentTime - lastPoint.timestamp;
    const velocity = timeDelta > 0 ? distance / timeDelta : 0;

    const point: BrushPoint = {
      x,
      y,
      pressure: 1, // TODO: Get from pressure API
      tiltX: 0,   // TODO: Get from tilt API
      tiltY: 0,   // TODO: Get from tilt API
      velocity,
      timestamp: currentTime,
      distance
    };

    // Apply stroke smoothing if enabled
    let processedPoint = point;
    if (strokeSmoothingRef.current && currentSettings.stabilization.enabled) {
      const recentPoints = [lastPoint, point];
      processedPoint = strokeSmoothingRef.current.stabilizePoint(
        point,
        recentPoints,
        { ...currentSettings.stabilization, adaptive: true }
      );
    }

    brushEngineRef.current.addPoint(processedPoint);
    setLastPoint(point);
  }, [isDrawing, currentSettings, lastPoint]);

  const handleMouseUp = useCallback(() => {
    if (!brushEngineRef.current) return;

    setIsDrawing(false);
    brushEngineRef.current.endStroke();
    setCurrentStrokeId(null);
    setLastPoint(null);
  }, []);

  // Update preset
  const updateBrushPreset = useCallback((presetId: string, updates: Partial<BrushPreset>) => {
    brushPresetManager.updatePreset(presetId, updates);
    setBrushPresets(brushPresetManager.getAllPresets());
  }, []);

  // Create custom brush
  const createCustomBrush = useCallback(() => {
    if (!currentSettings) return;

    const newPreset: BrushPreset = {
      id: `custom-${Date.now()}`,
      name: 'Custom Brush',
      category: 'custom',
      description: 'User-created custom brush',
      settings: currentSettings,
      tags: ['custom'],
      createdAt: Date.now(),
      modifiedAt: Date.now()
    };

    brushPresetManager.addPreset(newPreset);
    setBrushPresets(brushPresetManager.getAllPresets());
    setSelectedPresetId(newPreset.id);
  }, [currentSettings]);

  const selectedPreset = brushPresets.find(p => p.id === selectedPresetId) || brushPresets[0];

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
              className={`preset-btn ${selectedPresetId === preset.id ? 'active' : ''}`}
              onClick={() => setSelectedPresetId(preset.id)}
              style={{
                padding: '8px',
                background: selectedPresetId === preset.id ? '#3B82F6' : 'rgba(59, 130, 246, 0.2)',
                color: selectedPresetId === preset.id ? '#FFFFFF' : '#93C5FD',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '16px', marginBottom: '4px' }}>
                🖌️
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
