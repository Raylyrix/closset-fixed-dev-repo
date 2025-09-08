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
    opacity: 1.0
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
  };

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
                mat.map.needsUpdate = true;
              }
            });
          } else {
            if (child.material.map) {
              child.material.map.image = tempCanvas;
              child.material.map.needsUpdate = true;
            }
          }
          child.material.needsUpdate = true;
        }
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
