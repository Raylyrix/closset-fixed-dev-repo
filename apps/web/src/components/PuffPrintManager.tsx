import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useApp } from '../App';
import * as THREE from 'three';


interface PuffPrintLayer {
  id: string;
  name: string;
  canvas: HTMLCanvasElement;
  material: THREE.Material | null;
  visible: boolean;
  locked: boolean;
}

export function PuffPrintManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [puffLayers, setPuffLayers] = useState<PuffPrintLayer[]>([]);
  const [activePuffLayerId, setActivePuffLayerId] = useState<string | null>(null);
  const [puffSettings, setPuffSettings] = useState({
    intensity: 1.0,
    color: '#ffffff',
    opacity: 1.0,
    normalStrength: 0.8,
    edgeSoftness: 0.03
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const puffCanvasRef = useRef<HTMLCanvasElement>(null);

  const {
    modelScene,
    composedCanvas,
    activeTool,
    setTool,
    brushColor,
    brushSize,
    brushOpacity,
    brushShape,
    brushHardness,
    brushFlow,
    brushSpacing,
    brushSmoothing,
    usePressureSize,
    usePressureOpacity,
    symmetryY,
    symmetryZ,
    snapshot,
    commit
  } = useApp();

  // Initialize puff print system
  useEffect(() => {
    if (!isOpen) return;

    // Activate the puff print tool when manager opens
    setTool('puffPrint');

    // Create default puff layer if none exists
    if (puffLayers.length === 0) {
      createPuffLayer('Puff Print 1');
    }

    // Initialize globals so overlay picks up correct values
    try {
      const w: any = window as any;
      w.__puffColor = puffSettings.color;
      w.__puffOpacity = puffSettings.opacity;
      w.__puffIntensity = puffSettings.intensity;
    } catch {}
  }, [isOpen, setTool]);

  // Create a new puff print layer
  const createPuffLayer = (name: string) => {
    const canvas = document.createElement('canvas');
    if (composedCanvas) {
      canvas.width = composedCanvas.width;
      canvas.height = composedCanvas.height;
    } else {
      canvas.width = 1024;
      canvas.height = 1024;
    }

    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const layer: PuffPrintLayer = {
      id: `puff-${Date.now()}`,
      name,
      canvas,
      material: null, // We don't need the material anymore
      visible: true,
      locked: false
    };

    setPuffLayers(prev => [...prev, layer]);
    setActivePuffLayerId(layer.id);
    try { (window as any).__puffCanvas = canvas; window.dispatchEvent(new Event('puff-updated')); } catch {}
  };

  // Allow vector system to push a path into the active puff layer and auto-apply it
  useEffect(() => {
    function applyPathToActivePuff(sampled: Array<{ x: number; y: number }>, opts?: { color?: string; width?: number; opacity?: number; mode?: GlobalCompositeOperation }) {
      try { console.log('[PuffManager] __applyPuffFromVector', { points: sampled?.length || 0, width: opts?.width, opacity: opts?.opacity }); } catch {}
      const layer = activePuffLayerId ? puffLayers.find(l => l.id === activePuffLayerId) : null;
      if (!layer) return;
      const ctx = layer.canvas.getContext('2d');
      if (!ctx) return;
      ctx.save();
      ctx.globalAlpha = typeof opts?.opacity === 'number' ? opts.opacity : 1;
      ctx.globalCompositeOperation = opts?.mode || 'source-over';
      // IMPORTANT: Puff canvas is a HEIGHT MASK. Always draw the mask in white so the red channel is high.
      // The visible color is applied by the shader via puffColor uniform.
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(1, opts?.width || 4);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (sampled.length) {
        ctx.beginPath();
        ctx.moveTo(sampled[0].x, sampled[0].y);
        for (let i = 1; i < sampled.length; i++) ctx.lineTo(sampled[i].x, sampled[i].y);
        ctx.stroke();
        // Stamp small circles to ensure visibility for short/straight paths
        const r = Math.max(1, (opts?.width || 4) * 0.5);
        for (let i = 0; i < sampled.length; i += Math.max(1, Math.floor(sampled.length / 12))) {
          const p = sampled[i];
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
      }
      ctx.restore();
      // Mirror to global so overlay can find it even if manager closes
      try { (window as any).__puffCanvas = layer.canvas; } catch {}
      // Immediately apply to the model so user sees result
      applyPuffPrint();
      try { window.dispatchEvent(new Event('puff-updated')); } catch {}
    }
    (window as any).__applyPuffFromVector = applyPathToActivePuff;
    (window as any).__getActivePuffCanvas = () => {
      const layer = activePuffLayerId ? puffLayers.find(l => l.id === activePuffLayerId) : null;
      return layer?.canvas || null;
    };
    // Keep global mirror in sync when dependencies change
    try {
      const layer = activePuffLayerId ? puffLayers.find(l => l.id === activePuffLayerId) : null;
      if (layer?.canvas) {
        (window as any).__puffCanvas = layer.canvas;
        window.dispatchEvent(new Event('puff-updated'));
      }
    } catch {}
    return () => {
      try { delete (window as any).__applyPuffFromVector; } catch {}
      try { delete (window as any).__getActivePuffCanvas; } catch {}
    };
  }, [activePuffLayerId, puffLayers, composedCanvas, puffSettings.color]);

  // Delete a puff print layer
  const deletePuffLayer = (id: string) => {
    setPuffLayers(prev => prev.filter(layer => layer.id !== id));
    if (activePuffLayerId === id) {
      setActivePuffLayerId(puffLayers[0]?.id || null);
    }
  };

  // Toggle layer visibility
  const toggleLayerVisibility = (id: string) => {
    setPuffLayers(prev => prev.map(layer => 
      layer.id === id ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  // Toggle layer lock
  const toggleLayerLock = (id: string) => {
    setPuffLayers(prev => prev.map(layer => 
      layer.id === id ? { ...layer, locked: !layer.locked } : layer
    ));
  };

  // Update puff settings
  const updatePuffSettings = (key: string, value: number | string) => {
    setPuffSettings(prev => ({ ...prev, [key]: value }));
    // Expose for debugging/other systems
    try {
      const w: any = window as any;
      if (key === 'intensity') w.__puffIntensity = value;
      if (key === 'opacity') w.__puffOpacity = value;
      if (key === 'color') w.__puffColor = value;
      if (key === 'normalStrength') w.__puffNormalStrength = value;
      if (key === 'edgeSoftness') w.__puffEdgeSoftness = value;
    } catch {}
    // Propagate to materials that support uniforms
    try {
      if (modelScene) {
        modelScene.traverse((child: any) => {
          const mat: any = child?.material;
          if (!mat) return;
          const setUniform = (m: any) => {
            if (m?.uniforms) {
              if (key === 'intensity' && m.uniforms.puffIntensity) m.uniforms.puffIntensity.value = value as number;
              if (key === 'opacity' && m.uniforms.puffOpacity) m.uniforms.puffOpacity.value = value as number;
              if (key === 'color' && m.uniforms.puffColor) try { m.uniforms.puffColor.value = new THREE.Color(value as string); } catch {}
              if (key === 'normalStrength' && m.uniforms.normalStrength) m.uniforms.normalStrength.value = value as number;
              if (key === 'edgeSoftness' && m.uniforms.edgeSoftness) m.uniforms.edgeSoftness.value = value as number;
              m.needsUpdate = true;
            }
          };
          if (Array.isArray(mat)) mat.forEach(setUniform); else setUniform(mat);
        });
      }
    } catch {}
  };

  // Apply puff print to model
  const applyPuffPrint = () => {
    if (!modelScene || !activePuffLayerId) return;

    const layer = puffLayers.find(l => l.id === activePuffLayerId);
    if (!layer) return;

    // Apply the puff canvas to the model's texture
    if (layer.canvas && composedCanvas) {
      // Create a temporary canvas to blend the puff effects
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = composedCanvas.width;
      tempCanvas.height = composedCanvas.height;
      const tempCtx = tempCanvas.getContext('2d')!;

      // Draw the base composed canvas
      tempCtx.drawImage(composedCanvas, 0, 0);

      // Blend the puff effects on top
      tempCtx.globalCompositeOperation = 'multiply';
      tempCtx.drawImage(layer.canvas, 0, 0);

      // Apply the blended result to the model
      modelScene.traverse((child: any) => {
        if (child.isMesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat: any) => {
              if (mat.map) {
                mat.map.image = tempCanvas;
                // Quality filters for smoother sampling
                mat.map.generateMipmaps = true;
                mat.map.minFilter = THREE.LinearMipmapLinearFilter;
                mat.map.magFilter = THREE.LinearFilter;
                mat.map.needsUpdate = true;
              }
            });
          } else {
            if (child.material.map) {
              child.material.map.image = tempCanvas;
              child.material.map.generateMipmaps = true;
              child.material.map.minFilter = THREE.LinearMipmapLinearFilter;
              child.material.map.magFilter = THREE.LinearFilter;
              child.material.map.needsUpdate = true;
            }
          }
          child.material.needsUpdate = true;
        }
      });
      // Also propagate shader-specific uniforms after applying
      modelScene.traverse((child: any) => {
        const mats: any[] = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((m: any) => {
          if (m?.uniforms) {
            if (m.uniforms.normalStrength) m.uniforms.normalStrength.value = puffSettings.normalStrength;
            if (m.uniforms.edgeSoftness) m.uniforms.edgeSoftness.value = puffSettings.edgeSoftness;
            m.needsUpdate = true;
          }
        });
      });
    }
  };

  // Clear puff print
  const clearPuffPrint = () => {
    if (!modelScene || !composedCanvas) return;

    // Simply restore the original composed canvas to the model
    modelScene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat: any) => {
            if (mat.map) {
              mat.map.image = composedCanvas;
              mat.map.needsUpdate = true;
            }
          });
        } else {
          if (child.material.map) {
            child.material.map.image = composedCanvas;
            child.material.map.needsUpdate = true;
          }
        }
        child.material.needsUpdate = true;
      }
    });
  };

  // Export puff print
  const exportPuffPrint = () => {
    if (!activePuffLayerId) return;

    const layer = puffLayers.find(l => l.id === activePuffLayerId);
    if (!layer) return;

    const link = document.createElement('a');
    link.download = `${layer.name}.png`;
    link.href = layer.canvas.toDataURL();
    link.click();
  };

  // Export puff map for a layer
  const exportPuffMap = (layerId: string) => {
    const layer = puffLayers.find(l => l.id === layerId);
    if (!layer) return;

    const link = document.createElement('a');
    link.download = `${layer.name}_puff.png`;
    link.href = layer.canvas.toDataURL();
    link.click();
  };



  if (!isOpen) {
    return (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button 
          className={`btn ${activeTool === 'puffPrint' ? 'active' : ''}`}
          onClick={() => setTool('puffPrint')}
          title="Activate Puff Print Tool"
        >
          🎨
        </button>
        <button 
          className="btn" 
          onClick={() => setIsOpen(true)}
          title="Open Puff Print Manager"
        >
          Puff Print
        </button>
      </div>
    );
  }

  // Render the modal at document body level to avoid overflow issues
  return ReactDOM.createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="puff-print-backdrop" 
        onClick={() => setIsOpen(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 99998,
          backdropFilter: 'blur(4px)'
        }}
      />
      <div className="puff-print-manager">
      <div className="puff-print-header">
        <h3>Puff Print Manager</h3>
        <button className="btn" onClick={() => setIsOpen(false)}>×</button>
      </div>

      <div className="puff-print-content">
        {/* Layer Management */}
        <div className="puff-layers-section">
          <div className="section-header">
            <h4>Puff Print Layers</h4>
            <button className="btn" onClick={() => createPuffLayer(`Puff Print ${puffLayers.length + 1}`)}>
              + Add Layer
            </button>
          </div>
          
          <div className="puff-layers-list">
            {puffLayers.map(layer => (
              <div key={layer.id} className={`puff-layer-item ${activePuffLayerId === layer.id ? 'active' : ''}`}>
                <div className="layer-info">
                  <input
                    type="text"
                    value={layer.name}
                    onChange={(e) => {
                      setPuffLayers(prev => prev.map(l => 
                        l.id === layer.id ? { ...l, name: e.target.value } : l
                      ));
                    }}
                    className="layer-name-input"
                  />
                  <div className="layer-controls">
                    <button 
                      className={`btn ${layer.visible ? 'active' : ''}`}
                      onClick={() => toggleLayerVisibility(layer.id)}
                      title={layer.visible ? 'Hide' : 'Show'}
                    >
                      👁
                    </button>
                    <button 
                      className={`btn ${layer.locked ? 'active' : ''}`}
                      onClick={() => toggleLayerLock(layer.id)}
                      title={layer.locked ? 'Unlock' : 'Lock'}
                    >
                      🔒
                    </button>
                    <button 
                      className="btn"
                      onClick={() => exportPuffMap(layer.id)}
                      title="Export Puff Map"
                    >
                      💾
                    </button>
                    <button 
                      className="btn delete-btn"
                      onClick={() => deletePuffLayer(layer.id)}
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                </div>
                <button 
                  className="btn select-btn"
                  onClick={() => setActivePuffLayerId(layer.id)}
                >
                  {activePuffLayerId === layer.id ? 'Active' : 'Select'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Puff Settings */}
        {activePuffLayerId && (
          <div className="puff-settings-section">
            <h4>Puff Print Settings</h4>
            
            <div className="setting-group">
              <label>Intensity</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={puffSettings.intensity}
                onChange={(e) => updatePuffSettings('intensity', parseFloat(e.target.value))}
              />
              <span>{puffSettings.intensity}</span>
            </div>



            <div className="setting-group">
              <label>Color</label>
              <input
                type="color"
                value={puffSettings.color}
                onChange={(e) => updatePuffSettings('color', e.target.value)}
              />
            </div>

            <div className="setting-group">
              <label>Opacity</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={puffSettings.opacity}
                onChange={(e) => updatePuffSettings('opacity', parseFloat(e.target.value))}
              />
              <span>{puffSettings.opacity}</span>
            </div>

            <div className="setting-group">
              <label>Normal Strength</label>
              <input
                type="range"
                min={0}
                max={2}
                step={0.05}
                value={puffSettings.normalStrength}
                onChange={(e) => updatePuffSettings('normalStrength', parseFloat(e.target.value))}
              />
              <span>{puffSettings.normalStrength.toFixed(2)}</span>
            </div>

            <div className="setting-group">
              <label>Edge Softness</label>
              <input
                type="range"
                min={0}
                max={0.1}
                step={0.005}
                value={puffSettings.edgeSoftness}
                onChange={(e) => updatePuffSettings('edgeSoftness', parseFloat(e.target.value))}
              />
              <span>{puffSettings.edgeSoftness.toFixed(3)}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="puff-actions">
          <button className="btn" onClick={applyPuffPrint}>
            Apply Puff Print
          </button>
          <button className="btn" onClick={clearPuffPrint}>
            Clear Puff Print
          </button>
          <button className="btn" onClick={exportPuffPrint}>
            Export Puff Map
          </button>
          {activePuffLayerId && (
                            <button className="btn" onClick={() => exportPuffMap(activePuffLayerId)}>
                  Export Puff Map
                </button>
          )}
                 </div>
       </div>
     </div>
     </>,
     document.body
   );
 }
