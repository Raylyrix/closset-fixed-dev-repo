import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useApp } from '../App';

interface PuffLayer {
  id: string;
  name: string;
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture | null;
  material: THREE.MeshStandardMaterial | null;
  visible: boolean;
  opacity: number;
  blendMode: 'normal' | 'multiply' | 'overlay' | 'screen' | 'add' | 'subtract';
  height: number;
  curvature: number;
  color: string;
  pattern: string | null;
  patternScale: number;
  patternRotation: number;
  mask: HTMLCanvasElement | null;
}

interface PuffBrush {
  size: number;
  opacity: number;
  hardness: number;
  shape: 'round' | 'square' | 'diamond' | 'triangle' | 'airbrush' | 'calligraphy';
  flow: number;
  spacing: number;
  rotation: number;
  pattern: string | null;
  patternScale: number;
  patternRotation: number;
  pressureSize: boolean;
  pressureOpacity: boolean;
}

interface PuffPattern {
  id: string;
  name: string;
  preview: string;
  category: 'basic' | 'textile' | 'geometric' | 'organic' | 'custom';
  render: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) => void;
}

export function AdvancedPuffPrintManager() {
  const { modelScene, composedCanvas, setTool } = useApp();

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [layers, setLayers] = useState<PuffLayer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [brush, setBrush] = useState<PuffBrush>({
    size: 50,
    opacity: 1.0,
    hardness: 0.8,
    shape: 'round',
    flow: 1.0,
    spacing: 0.1,
    rotation: 0,
    pattern: null,
    patternScale: 1.0,
    patternRotation: 0,
    pressureSize: true,
    pressureOpacity: false
  });

  const [showPreview, setShowPreview] = useState(true);
  const [previewQuality, setPreviewQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [symmetryEnabled, setSymmetryEnabled] = useState(false);
  const [symmetryAxis, setSymmetryAxis] = useState<'x' | 'y' | 'z'>('x');
  const [symmetryCount, setSymmetryCount] = useState(2);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Built-in patterns
  const patterns: PuffPattern[] = [
    {
      id: 'solid',
      name: 'Solid',
      category: 'basic',
      preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNmZmYiLz4KPC9zdmc+',
      render: (ctx, x, y, size) => {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    {
      id: 'dots',
      name: 'Dots',
      category: 'textile',
      preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMyIgZmlsbD0iI2ZmZiIvPgo8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIzIiBmaWxsPSIjZmYiLz4KPC9zdmc+',
      render: (ctx, x, y, size) => {
        const dotSize = size * 0.1;
        for (let i = 0; i < 5; i++) {
          for (let j = 0; j < 5; j++) {
            if ((i + j) % 2 === 0) {
              ctx.fillStyle = '#fff';
              ctx.beginPath();
              ctx.arc(x + (i - 2) * size * 0.3, y + (j - 2) * size * 0.3, dotSize, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }
    },
    {
      id: 'hexagon',
      name: 'Hexagon',
      category: 'geometric',
      preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBvbHlnb24gcG9pbnRzPSIyMCwxMCAzMCwyMCAzMCwzMCAyMCw0MCAxMCwzMCAxMCwyMCAyMCwxMCIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4=',
      render: (ctx, x, y, size) => {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const px = x + Math.cos(angle) * size;
          const py = y + Math.sin(angle) * size;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      }
    },
    {
      id: 'wave',
      name: 'Wave',
      category: 'organic',
      preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDIwQzE1IDEwIDI1IDEwIDMwIDIwQzI1IDMwIDE1IDMwIDEwIDIwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPgo8L3N2Zz4=',
      render: (ctx, x, y, size) => {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = size * 0.1;
        ctx.beginPath();
        for (let i = 0; i <= 40; i++) {
          const px = x - size + (i / 40) * size * 2;
          const py = y + Math.sin(i * 0.5) * size * 0.3;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    }
  ];

  // Initialize manager
  useEffect(() => {
    if (!isOpen) return;

    setTool('puffPrint');

    // Create default layer if none exists
    if (layers.length === 0) {
      createLayer('Puff Layer 1');
    }
  }, [isOpen, setTool, layers.length]);

  // Create a new layer
  const createLayer = useCallback((name: string) => {
    if (!composedCanvas) return;

    const canvas = document.createElement('canvas');
    canvas.width = composedCanvas.width;
    canvas.height = composedCanvas.height;

    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const layer: PuffLayer = {
      id: `puff-layer-${Date.now()}`,
      name,
      canvas,
      texture,
      material: null,
      visible: true,
      opacity: 1.0,
      blendMode: 'normal',
      height: 1.0,
      curvature: 0.5,
      color: '#ffffff',
      pattern: null,
      patternScale: 1.0,
      patternRotation: 0,
      mask: null
    };

    setLayers(prev => [...prev, layer]);
    setActiveLayerId(layer.id);
  }, [composedCanvas]);

  // Update layer properties
  const updateLayer = useCallback((layerId: string, updates: Partial<PuffLayer>) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, ...updates } : layer
    ));
  }, []);

  // Delete layer
  const deleteLayer = useCallback((layerId: string) => {
    setLayers(prev => prev.filter(layer => layer.id !== layerId));
    if (activeLayerId === layerId) {
      const remainingLayers = layers.filter(layer => layer.id !== layerId);
      setActiveLayerId(remainingLayers.length > 0 ? remainingLayers[0].id : null);
    }
  }, [activeLayerId, layers]);

  // Duplicate layer
  const duplicateLayer = useCallback((layerId: string) => {
    const layerToDuplicate = layers.find(l => l.id === layerId);
    if (!layerToDuplicate) return;

    const newLayer: PuffLayer = {
      ...layerToDuplicate,
      id: `puff-layer-${Date.now()}`,
      name: `${layerToDuplicate.name} Copy`,
      canvas: layerToDuplicate.canvas.cloneNode() as HTMLCanvasElement
    };

    setLayers(prev => [...prev, newLayer]);
  }, [layers]);

  // Export layer as image
  const exportLayer = useCallback((layerId: string, format: 'png' | 'jpg' = 'png') => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;

    const link = document.createElement('a');
    link.download = `${layer.name}.${format}`;
    link.href = layer.canvas.toDataURL(`image/${format}`);
    link.click();
  }, [layers]);

  // Import pattern
  const importPattern = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const newPattern: PuffPattern = {
          id: `custom-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          category: 'custom',
          preview: e.target?.result as string,
          render: (ctx, x, y, size) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.drawImage(img, -size, -size, size * 2, size * 2);
            ctx.restore();
          }
        };
        // Add to patterns array
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  // Apply symmetry
  const applySymmetry = useCallback((x: number, y: number) => {
    if (!symmetryEnabled) return [x, y];

    const points: [number, number][] = [[x, y]];
    const centerX = composedCanvas!.width / 2;
    const centerY = composedCanvas!.height / 2;

    for (let i = 1; i < symmetryCount; i++) {
      switch (symmetryAxis) {
        case 'x':
          points.push([composedCanvas!.width - x, y]);
          break;
        case 'y':
          points.push([x, composedCanvas!.height - y]);
          break;
        case 'z':
          points.push([x, y]);
          // Z-axis symmetry would require 3D transformation
          break;
      }
    }

    return points;
  }, [symmetryEnabled, symmetryAxis, symmetryCount, composedCanvas]);

  return (
    <div className={`puff-print-manager ${isOpen ? 'open' : ''}`}>
      <div className="manager-header">
        <h3>Puff Print Studio</h3>
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? '×' : '☰'}
        </button>
      </div>

      {isOpen && (
        <div className="manager-content">
          {/* Layers Panel */}
          <div className="layers-panel">
            <h4>Layers</h4>
            <div className="layers-list">
              {layers.map(layer => (
                <div
                  key={layer.id}
                  className={`layer-item ${activeLayerId === layer.id ? 'active' : ''}`}
                  onClick={() => setActiveLayerId(layer.id)}
                >
                  <div className="layer-visibility">
                    <button onClick={(e) => {
                      e.stopPropagation();
                      updateLayer(layer.id, { visible: !layer.visible });
                    }}>
                      {layer.visible ? '👁' : '👁‍🗨'}
                    </button>
                  </div>
                  <div className="layer-info">
                    <div className="layer-name">{layer.name}</div>
                    <div className="layer-controls">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={layer.opacity}
                        onChange={(e) => updateLayer(layer.id, { opacity: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="layer-actions">
                    <button onClick={() => duplicateLayer(layer.id)}>📋</button>
                    <button onClick={() => exportLayer(layer.id)}>💾</button>
                    <button onClick={() => deleteLayer(layer.id)}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
            <button className="add-layer-btn" onClick={() => createLayer(`Puff Layer ${layers.length + 1}`)}>
              + Add Layer
            </button>
          </div>

          {/* Brush Settings */}
          <div className="brush-panel">
            <h4>Brush Settings</h4>
            <div className="control-group">
              <label>Size: {brush.size}</label>
              <input
                type="range"
                min="1"
                max="200"
                value={brush.size}
                onChange={(e) => setBrush(prev => ({ ...prev, size: parseInt(e.target.value) }))}
              />
            </div>
            <div className="control-group">
              <label>Opacity: {brush.opacity}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={brush.opacity}
                onChange={(e) => setBrush(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="control-group">
              <label>Shape:</label>
              <select
                value={brush.shape}
                onChange={(e) => setBrush(prev => ({ ...prev, shape: e.target.value as any }))}
              >
                <option value="round">Round</option>
                <option value="square">Square</option>
                <option value="diamond">Diamond</option>
                <option value="triangle">Triangle</option>
                <option value="airbrush">Airbrush</option>
                <option value="calligraphy">Calligraphy</option>
              </select>
            </div>
            <div className="control-group">
              <label>Flow: {brush.flow}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={brush.flow}
                onChange={(e) => setBrush(prev => ({ ...prev, flow: parseFloat(e.target.value) }))}
              />
            </div>
          </div>

          {/* Patterns Panel */}
          <div className="patterns-panel">
            <h4>Patterns</h4>
            <div className="patterns-grid">
              {patterns.map(pattern => (
                <div
                  key={pattern.id}
                  className={`pattern-item ${brush.pattern === pattern.id ? 'active' : ''}`}
                  onClick={() => setBrush(prev => ({ ...prev, pattern: pattern.id }))}
                >
                  <img src={pattern.preview} alt={pattern.name} />
                  <div className="pattern-name">{pattern.name}</div>
                </div>
              ))}
            </div>
            <div className="pattern-controls">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && importPattern(e.target.files[0])}
              />
              <button onClick={() => fileInputRef.current?.click()}>
                Import Pattern
              </button>
            </div>
          </div>

          {/* Symmetry Panel */}
          <div className="symmetry-panel">
            <h4>Symmetry</h4>
            <div className="control-group">
              <label>
                <input
                  type="checkbox"
                  checked={symmetryEnabled}
                  onChange={(e) => setSymmetryEnabled(e.target.checked)}
                />
                Enable Symmetry
              </label>
            </div>
            {symmetryEnabled && (
              <>
                <div className="control-group">
                  <label>Axis:</label>
                  <select
                    value={symmetryAxis}
                    onChange={(e) => setSymmetryAxis(e.target.value as any)}
                  >
                    <option value="x">X Axis</option>
                    <option value="y">Y Axis</option>
                    <option value="z">Z Axis</option>
                  </select>
                </div>
                <div className="control-group">
                  <label>Count: {symmetryCount}</label>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    value={symmetryCount}
                    onChange={(e) => setSymmetryCount(parseInt(e.target.value))}
                  />
                </div>
              </>
            )}
          </div>

          {/* Preview Panel */}
          <div className="preview-panel">
            <h4>Preview</h4>
            <div className="control-group">
              <label>
                <input
                  type="checkbox"
                  checked={showPreview}
                  onChange={(e) => setShowPreview(e.target.checked)}
                />
                Show Preview
              </label>
            </div>
            <div className="control-group">
              <label>Quality:</label>
              <select
                value={previewQuality}
                onChange={(e) => setPreviewQuality(e.target.value as any)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <canvas
              ref={previewCanvasRef}
              style={{
                width: '100%',
                height: '200px',
                border: '1px solid #ccc',
                display: showPreview ? 'block' : 'none'
              }}
            />
          </div>

          {/* Advanced Settings */}
          <div className="advanced-panel">
            <h4>Advanced</h4>
            <div className="control-group">
              <label>
                <input
                  type="checkbox"
                  checked={autoUpdate}
                  onChange={(e) => setAutoUpdate(e.target.checked)}
                />
                Auto Update
              </label>
            </div>
            <button className="apply-btn" onClick={() => {
              // Apply all layers to the 3D model
              layers.forEach(layer => {
                if (layer.visible && layer.canvas) {
                  // Update 3D materials with layer data
                }
              });
            }}>
              Apply to Model
            </button>
            <button className="export-btn" onClick={() => {
              // Export all layers as texture maps
              layers.forEach(layer => exportLayer(layer.id));
            }}>
              Export All Maps
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
