import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '../App';
import { BrushEngine, BrushSettings, BrushPoint } from '../utils/BrushEngine';
import { StrokeSmoothing, WetMediaSimulator } from '../utils/StrokeSmoothing';
import { brushPresetManager, BrushPreset } from '../utils/BrushPresets';

interface AdvancedBrushSystemProps {
  active: boolean;
}

export function AdvancedBrushSystem({ active }: AdvancedBrushSystemProps) {
  // Initialize with presets from the manager
  const [brushPresets, setBrushPresets] = useState<BrushPreset[]>(() =>
    brushPresetManager.getAllPresets()
  );
  const [selectedPresetId, setSelectedPresetId] = useState<string>('hard_round');
  const [currentSettings, setCurrentSettings] = useState<BrushSettings | null>(null);

  // Brush engine and utilities
  const brushEngineRef = useRef<BrushEngine | null>(null);
  const strokeSmoothingRef = useRef<StrokeSmoothing | null>(null);
  const wetMediaRef = useRef<WetMediaSimulator | null>(null);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStrokeId, setCurrentStrokeId] = useState<string | null>(null);
  const [lastPoint, setLastPoint] = useState<BrushPoint | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<'presets' | 'dynamics' | 'texture' | 'preview'>('presets');
  const [customSettings, setCustomSettings] = useState<BrushSettings | null>(null);

  // Canvas refs
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);

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
        setCustomSettings({ ...preset.settings });
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
      setCustomSettings({ ...preset.settings });
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
      pressure: 1, // TODO: Get from Pointer Events API
      tiltX: 0,   // TODO: Get from Pointer Events API
      tiltY: 0,   // TODO: Get from Pointer Events API
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
      pressure: 1, // TODO: Get from Pointer Events API
      tiltX: 0,   // TODO: Get from Pointer Events API
      tiltY: 0,   // TODO: Get from Pointer Events API
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
        currentSettings.stabilization
            ? { ...currentSettings.stabilization, adaptive: true }
            : { enabled: false, delay: 5, quality: 0.5, adaptive: true }
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
    if (!customSettings) return;

    const newPreset: BrushPreset = {
      id: `custom-${Date.now()}`,
      name: 'Custom Brush',
      category: 'custom',
      description: 'User-created custom brush',
      settings: customSettings,
      tags: ['custom'],
      createdAt: Date.now(),
      modifiedAt: Date.now()
    };

    brushPresetManager.addPreset(newPreset);
    setBrushPresets(brushPresetManager.getAllPresets());
    setSelectedPresetId(newPreset.id);
  }, [customSettings]);

  // Update custom settings
  const updateCustomSettings = useCallback((updates: Partial<BrushSettings>) => {
    setCustomSettings(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const selectedPreset = brushPresets.find(p => p.id === selectedPresetId);

  if (!active) {
    return null;
  }

  return (
    <div className="advanced-brush-system" style={{ padding: '16px', background: '#1F2937', color: '#F9FAFB', minHeight: '600px' }}>
      <div className="brush-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ margin: 0, color: '#3B82F6', fontSize: '18px' }}>
          🎨 Advanced Brush System
        </h4>
        <div className="tool-controls" style={{ display: 'flex', gap: '8px' }}>
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

      {/* Tab Navigation */}
      <div className="tab-navigation" style={{ display: 'flex', marginBottom: '16px', borderBottom: '1px solid #374151' }}>
        {(['presets', 'dynamics', 'texture', 'preview'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              background: activeTab === tab ? '#3B82F6' : 'transparent',
              color: activeTab === tab ? '#FFFFFF' : '#9CA3AF',
              border: 'none',
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer',
              fontSize: '12px',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'presets' && (
          <div className="presets-tab">
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
                    {preset.category === 'artistic' ? '🎨' :
                     preset.category === 'digital' ? '🖥️' :
                     preset.category === 'natural' ? '🌿' :
                     preset.category === 'specialty' ? '⭐' : '🖌️'}
                  </div>
                  <div>{preset.name}</div>
                  <div style={{ fontSize: '9px', opacity: 0.7, marginTop: '2px' }}>
                    {preset.category}
                  </div>
                </button>
              ))}
            </div>
            {selectedPreset && (
              <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '4px' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#3B82F6' }}>
                  {selectedPreset.name}
                </div>
                <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '4px' }}>
                  {selectedPreset.description}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'dynamics' && customSettings && (
          <div className="dynamics-tab">
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#3B82F6', marginBottom: '12px' }}>
              Brush Dynamics
            </div>

            {/* Size Dynamics */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px' }}>Size</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
                    Base: {customSettings.dynamics.size.base.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="0.5"
                    value={customSettings.dynamics.size.base}
                    onChange={(e) => updateCustomSettings({
                      dynamics: {
                        ...customSettings.dynamics,
                        size: {
                          ...customSettings.dynamics.size,
                          base: parseFloat(e.target.value)
                        }
                      }
                    })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
                    Variation: {customSettings.dynamics.size.variation.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={customSettings.dynamics.size.variation}
                    onChange={(e) => updateCustomSettings({
                      dynamics: {
                        ...customSettings.dynamics,
                        size: {
                          ...customSettings.dynamics.size,
                          variation: parseFloat(e.target.value)
                        }
                      }
                    })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>

            {/* Opacity Dynamics */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px' }}>Opacity</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
                    Base: {customSettings.dynamics.opacity.base.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.01"
                    value={customSettings.dynamics.opacity.base}
                    onChange={(e) => updateCustomSettings({
                      dynamics: {
                        ...customSettings.dynamics,
                        opacity: {
                          ...customSettings.dynamics.opacity,
                          base: parseFloat(e.target.value)
                        }
                      }
                    })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
                    Variation: {customSettings.dynamics.opacity.variation.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={customSettings.dynamics.opacity.variation}
                    onChange={(e) => updateCustomSettings({
                      dynamics: {
                        ...customSettings.dynamics,
                        opacity: {
                          ...customSettings.dynamics.opacity,
                          variation: parseFloat(e.target.value)
                        }
                      }
                    })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>

            {/* Flow Dynamics */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px' }}>Flow</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
                    Base: {customSettings.dynamics.flow.base.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="2"
                    step="0.01"
                    value={customSettings.dynamics.flow.base}
                    onChange={(e) => updateCustomSettings({
                      dynamics: {
                        ...customSettings.dynamics,
                        flow: {
                          ...customSettings.dynamics.flow,
                          base: parseFloat(e.target.value)
                        }
                      }
                    })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
                    Variation: {customSettings.dynamics.flow.variation.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={customSettings.dynamics.flow.variation}
                    onChange={(e) => updateCustomSettings({
                      dynamics: {
                        ...customSettings.dynamics,
                        flow: {
                          ...customSettings.dynamics.flow,
                          variation: parseFloat(e.target.value)
                        }
                      }
                    })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>

            {/* Stabilization */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px' }}>Stabilization</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="checkbox"
                  checked={customSettings.stabilization.enabled}
                  onChange={(e) => updateCustomSettings({
                    stabilization: {
                      ...customSettings.stabilization,
                      enabled: e.target.checked
                    }
                  })}
                />
                <span style={{ fontSize: '10px', color: '#D1D5DB' }}>Enable Stabilization</span>
              </div>
              {customSettings.stabilization.enabled && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
                      Delay: {customSettings.stabilization.delay}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="1"
                      value={customSettings.stabilization.delay}
                      onChange={(e) => updateCustomSettings({
                        stabilization: {
                          ...customSettings.stabilization,
                          delay: parseInt(e.target.value)
                        }
                      })}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
                      Quality: {customSettings.stabilization.quality.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.01"
                      value={customSettings.stabilization.quality}
                      onChange={(e) => updateCustomSettings({
                        stabilization: {
                          ...customSettings.stabilization,
                          quality: parseFloat(e.target.value)
                        }
                      })}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'texture' && customSettings && (
          <div className="texture-tab">
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#3B82F6', marginBottom: '12px' }}>
              Brush Texture & Shape
            </div>

            {/* Shape Settings */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px' }}>Shape</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
                    Type
                  </label>
                  <select
                    value={customSettings.shape.type}
                    onChange={(e) => updateCustomSettings({
                      shape: {
                        ...customSettings.shape,
                        type: e.target.value as any
                      }
                    })}
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
                    <option value="circle">Circle</option>
                    <option value="square">Square</option>
                    <option value="diamond">Diamond</option>
                    <option value="triangle">Triangle</option>
                    <option value="star">Star</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
                    Hardness: {customSettings.shape.hardness.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={customSettings.shape.hardness}
                    onChange={(e) => updateCustomSettings({
                      shape: {
                        ...customSettings.shape,
                        hardness: parseFloat(e.target.value)
                      }
                    })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>

            {/* Texture Settings */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px' }}>Texture</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
                    Pattern
                  </label>
                  <select
                    value={customSettings.texture.pattern}
                    onChange={(e) => updateCustomSettings({
                      texture: {
                        ...customSettings.texture,
                        pattern: e.target.value as any
                      }
                    })}
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
                    <option value="solid">Solid</option>
                    <option value="noise">Noise</option>
                    <option value="bristles">Bristles</option>
                    <option value="canvas">Canvas</option>
                    <option value="paper">Paper</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
                    Scale: {customSettings.texture.scale.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={customSettings.texture.scale}
                    onChange={(e) => updateCustomSettings({
                      texture: {
                        ...customSettings.texture,
                        scale: parseFloat(e.target.value)
                      }
                    })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>

            {/* Blend Mode */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px' }}>Blend Mode</div>
              <select
                value={customSettings.blendMode}
                onChange={(e) => updateCustomSettings({
                  blendMode: e.target.value as GlobalCompositeOperation
                })}
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
                <option value="source-over">Normal</option>
                <option value="multiply">Multiply</option>
                <option value="screen">Screen</option>
                <option value="overlay">Overlay</option>
                <option value="soft-light">Soft Light</option>
                <option value="hard-light">Hard Light</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="preview-tab">
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#3B82F6', marginBottom: '8px' }}>
              Brush Preview
            </div>
            <canvas
              ref={previewCanvasRef}
              width={300}
              height={200}
              style={{
                width: '100%',
                height: '200px',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '4px',
                background: '#111827',
                cursor: 'crosshair'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            />
            <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '8px' }}>
              {isDrawing ? 'Drawing...' : 'Click and drag to test brush'}
            </div>
            <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px' }}>
              Current brush: {selectedPreset?.name} | Status: {currentSettings ? 'Ready' : 'Loading...'}
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas for main drawing */}
      <canvas
        ref={mainCanvasRef}
        width={2048}
        height={2048}
        style={{ display: 'none' }}
      />
    </div>
  );
}
