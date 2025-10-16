import React, { useState } from 'react';
import { useApp } from '../App';
import { vectorStore } from '../vector/vectorState';

interface VectorToolbarProps {
  isVisible: boolean;
  onClose: () => void;
}

const VectorToolbar: React.FC<VectorToolbarProps> = ({ isVisible, onClose }) => {
  const { activeTool, setActiveTool, vectorMode, setVectorMode } = useApp();
  const [selectedVectorTool, setSelectedVectorTool] = useState<string>('pen');
  
  // Sync with vector store state
  React.useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = vectorStore.subscribe(() => {
      if (!isMounted) return;
      
      try {
        const state = vectorStore.getState();
        setSelectedVectorTool(state.tool);
      } catch (error) {
        console.error('Error syncing vector tool state:', error);
      }
    });
    
    // Set initial tool
    try {
      const state = vectorStore.getState();
      setSelectedVectorTool(state.tool);
    } catch (error) {
      console.error('Error setting initial vector tool:', error);
    }
    
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleVectorToolSelect = (toolId: string) => {
    setSelectedVectorTool(toolId);
    // Update the vector store with the selected tool
    vectorStore.setState({ tool: toolId as any });
    // Ensure vector mode is active when selecting vector tools
    if (!vectorMode) {
      setVectorMode(true);
      setActiveTool('vectorTools');
    }
    console.log(`🎨 Vector tool selected: ${toolId}, vectorMode: ${vectorMode}`);
  };

  const handleClearAll = () => {
    try {
      vectorStore.setState({ shapes: [], selected: [], currentPath: null });
      // Dispatch event to clear the canvas
      window.dispatchEvent(new CustomEvent('clearActiveLayer'));
      console.log('🎨 Vector shapes cleared');
    } catch (error) {
      console.error('Error clearing vector shapes:', error);
    }
  };

  const handleEmergencyClear = () => {
    try {
      const cleared = useApp.getState().emergencyClearVectorPaths();
      if (cleared) {
        console.log('🚨 Emergency vector cleanup performed');
        // Also clear the vector store
        vectorStore.setState({ shapes: [], selected: [], currentPath: null });
        window.dispatchEvent(new CustomEvent('clearActiveLayer'));
      } else {
        console.log('ℹ️ No emergency cleanup needed');
      }
    } catch (error) {
      console.error('Error in emergency cleanup:', error);
    }
  };

  const handleApplyToolToPaths = () => {
    const appState = useApp.getState();
    const currentTool = appState.activeTool;
    const vectorPaths = appState.vectorPaths || [];
    
    console.log('🎨 VectorToolbar: handleApplyToolToPaths called', { 
      currentTool, 
      vectorPathsCount: vectorPaths.length,
      vectorMode: appState.vectorMode 
    });
    
    if (!vectorPaths.length) {
      console.log('⚠️ No vector paths to apply tool to');
      return;
    }
    
    if (currentTool === 'brush' || currentTool === 'puffPrint' || currentTool === 'embroidery') {
      console.log(`🎨 Applying ${currentTool} to ${vectorPaths.length} vector path(s)`);
      
      const layer = appState.getActiveLayer();
      if (!layer || !layer.canvas) {
        console.log('⚠️ No active layer or canvas');
        return;
      }
      
      const ctx = layer.canvas.getContext('2d');
      if (!ctx) return;
      
      // Apply tool to each vector path
      vectorPaths.forEach((path: any) => {
        console.log(`🎨 Applying ${currentTool} to path:`, path.id, 'with', path.points.length, 'points');
        
        // Sample points along the path for smooth painting
        const sampledPoints = samplePathPoints(path.points, 2);
        
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0; // Ensure full opacity for vector tools
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        if (currentTool === 'brush') {
          // Apply brush along path
          console.log('🎨 Brush color:', appState.brushColor, 'Size:', appState.brushSize);
          ctx.strokeStyle = appState.brushColor;
          ctx.lineWidth = appState.brushSize;
          ctx.beginPath();
          sampledPoints.forEach((point: any, index: number) => {
            const x = point.u * layer.canvas.width;
            const y = point.v * layer.canvas.height;
            if (index === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          });
          ctx.stroke();
          console.log('🎨 Stroke applied with color:', ctx.strokeStyle);
        } else if (currentTool === 'embroidery') {
          // Apply embroidery stitches along path
          const stitchType = appState.embroideryStitchType || 'satin';
          const color = appState.embroideryColor || appState.brushColor;
          const thickness = appState.embroideryThickness || 2;
          
          ctx.strokeStyle = color;
          ctx.fillStyle = color;
          ctx.lineWidth = thickness;
          ctx.shadowColor = color;
          ctx.shadowBlur = 2;
          
          ctx.beginPath();
          sampledPoints.forEach((point: any, index: number) => {
            const x = point.u * layer.canvas.width;
            const y = point.v * layer.canvas.height;
            if (index === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          });
          ctx.stroke();
        } else if (currentTool === 'puffPrint') {
          // ========== SMOOTH VECTOR PUFF PRINT ==========
          console.log('🎨 Vector puff print - ultra-smooth displacement');
          
          const puffBrushSize = appState.puffBrushSize || 20;
          const puffColor = appState.puffColor || '#ff69b4';
          const puffHeight = appState.puffHeight || 1.0;
          const puffSoftness = appState.puffSoftness || 0.8;
          
          const activeLayer = appState.layers.find((l: any) => l.id === appState.activeLayerId);
          if (!activeLayer?.canvas || !activeLayer?.displacementCanvas) {
            console.log('⚠️ No active layer or displacement canvas');
            return;
          }
          
          const layerCtx = activeLayer.canvas.getContext('2d', { willReadFrequently: true });
          const dispCtx = activeLayer.displacementCanvas.getContext('2d', { willReadFrequently: true });
          
          if (!layerCtx || !dispCtx) return;
          
          const puffRadius = puffBrushSize / 2;
          const centerHeight = Math.floor(255 * puffHeight);
          
          sampledPoints.forEach((point: any) => {
            const x = Math.round(point.u * activeLayer.canvas.width);
            const y = Math.round(point.v * activeLayer.canvas.height);
            
            // STEP 1: Draw puff color
            layerCtx.globalCompositeOperation = 'source-over';
            layerCtx.globalAlpha = 1.0;
            layerCtx.fillStyle = puffColor;
            layerCtx.beginPath();
            layerCtx.arc(x, y, puffRadius, 0, Math.PI * 2);
            layerCtx.fill();
            
            // STEP 2: Draw ultra-smooth displacement with lighten blend
            dispCtx.globalCompositeOperation = 'lighten'; // Prevents spikes
            
            const grad = dispCtx.createRadialGradient(x, y, 0, x, y, puffRadius);
            
            // 12-stop cosine gradient for perfect smoothness
            const stops = 12;
            for (let i = 0; i <= stops; i++) {
              const t = i / stops;
              const cosValue = Math.cos((1 - t) * Math.PI / 2);
              const height = Math.floor(centerHeight * cosValue * puffSoftness);
              grad.addColorStop(t, `rgb(${height}, ${height}, ${height})`);
            }
            grad.addColorStop(1, 'rgb(0, 0, 0)');
            
            dispCtx.fillStyle = grad;
            dispCtx.beginPath();
            dispCtx.arc(x, y, puffRadius, 0, Math.PI * 2);
            dispCtx.fill();
            
            dispCtx.globalCompositeOperation = 'source-over'; // Reset
          });
          
          console.log('✅ Vector puff print - smooth displacement applied');
        }
        
        ctx.restore();
      });
      
      // Trigger composition and updates
      setTimeout(() => {
        console.log('🎨 Composing layers after vector tool application');
        appState.composeLayers();
        
        if (currentTool === 'puffPrint') {
          console.log('🎨 Vector puff - triggering 3D displacement application');
          // Trigger texture update
          window.dispatchEvent(new CustomEvent('forceModelTextureUpdate'));
          
          // Compose displacement maps
          const composedDisp = appState.composeDisplacementMaps();
          
          // Apply displacement to model (same as regular puff print)
          if (composedDisp) {
            window.dispatchEvent(new CustomEvent('applyPuffDisplacement', { 
              detail: { displacementCanvas: composedDisp } 
            }));
          }
        }
      }, 100);
    }
  };
  
  // Helper function to sample points along path
  const samplePathPoints = (points: any[], spacing: number = 2) => {
    if (!points || points.length < 2) return points;
    
    const sampled = [points[0]];
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const du = p2.u - p1.u;
      const dv = p2.v - p1.v;
      const dist = Math.sqrt(du * du + dv * dv);
      const steps = Math.max(1, Math.floor(dist * 1000 / spacing));
      
      for (let j = 1; j <= steps; j++) {
        const t = j / steps;
        sampled.push({
          u: p1.u + du * t,
          v: p1.v + dv * t
        });
      }
    }
    return sampled;
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '320px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '16px',
      padding: '20px',
      color: '#2d3748',
      zIndex: 1000,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>✏️</span>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#2d3748' }}>Vector Tools</h3>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            color: '#718096',
            padding: '4px',
            borderRadius: '4px'
          }}
        >
          ×
        </button>
      </div>

      {/* Essential Tools Only */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {[
          { id: 'pen', name: 'Pen', icon: '✏️' },
          { id: 'pathSelection', name: 'Select', icon: '↖️' },
          { id: 'addAnchor', name: 'Add Point', icon: '➕' },
          { id: 'removeAnchor', name: 'Remove', icon: '➖' },
          { id: 'convertAnchor', name: 'Convert', icon: '🔄' },
          { id: 'curvature', name: 'Curve', icon: '🌊' }
        ].map((tool) => (
          <button
            key={tool.id}
            onClick={() => handleVectorToolSelect(tool.id)}
            style={{
              padding: '12px 8px',
              borderRadius: '8px',
              background: selectedVectorTool === tool.id ? '#667eea' : '#f7fafc',
              border: selectedVectorTool === tool.id ? 'none' : '1px solid #e2e8f0',
              color: selectedVectorTool === tool.id ? 'white' : '#4a5568',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (selectedVectorTool !== tool.id) {
                e.currentTarget.style.background = '#edf2f7';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedVectorTool !== tool.id) {
                e.currentTarget.style.background = '#f7fafc';
              }
            }}
          >
            <span style={{ fontSize: '16px' }}>{tool.icon}</span>
            <span>{tool.name}</span>
          </button>
        ))}
      </div>

      {/* Status and Instructions */}
      <div style={{
        padding: '8px 12px',
        background: vectorMode ? '#f0fff4' : '#fef5e7',
        borderRadius: '8px',
        fontSize: '11px',
        color: vectorMode ? '#22543d' : '#744210',
        textAlign: 'center'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
          {vectorMode ? '✓ Vector Mode Active' : '⚠ Vector Mode Inactive'}
        </div>
        {vectorMode && (
          <div style={{ fontSize: '10px', opacity: 0.8, lineHeight: '1.4' }}>
            1. Draw vector paths (Brush/Puff/Embroidery act as pen tools in vector mode)<br/>
            2. Click "✨ Apply Tool" to paint along paths
          </div>
        )}
      </div>

      {/* Essential Actions */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        borderTop: '1px solid #e2e8f0',
        paddingTop: '12px'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              const { showGrid, setShowGrid } = useApp.getState();
              setShowGrid(!showGrid);
            }}
            style={{
              padding: '8px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              background: useApp.getState().showGrid ? '#667eea' : 'white',
              color: useApp.getState().showGrid ? 'white' : '#4a5568',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            📐 Grid
          </button>
          
          <button
            onClick={() => {
              const { showRulers, setShowRulers } = useApp.getState();
              setShowRulers(!showRulers);
            }}
            style={{
              padding: '8px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              background: useApp.getState().showRulers ? '#667eea' : 'white',
              color: useApp.getState().showRulers ? 'white' : '#4a5568',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            📏 Rulers
          </button>
          
          <button
            onClick={() => {
              const { showAnchorPoints, setShowAnchorPoints } = useApp.getState();
              setShowAnchorPoints(!showAnchorPoints);
              console.log('🎯 Toggle anchor points:', !showAnchorPoints);
            }}
            style={{
              padding: '8px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              background: useApp.getState().showAnchorPoints ? '#FFFFFF' : 'white',
              color: useApp.getState().showAnchorPoints ? '#000000' : '#4a5568',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            🎯 Anchors
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleApplyToolToPaths}
            style={{
              padding: '8px 12px',
              border: '1px solid #667eea',
              borderRadius: '8px',
              background: '#667eea',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            ✨ Apply Tool
          </button>
          
          <button
            onClick={handleClearAll}
            style={{
              padding: '8px 12px',
              border: '1px solid #fed7d7',
              borderRadius: '8px',
              background: '#fed7d7',
              color: '#c53030',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            🗑️ Clear
          </button>
          
          <button
            onClick={handleEmergencyClear}
            style={{
              padding: '8px 12px',
              border: '1px solid #fbb6ce',
              borderRadius: '8px',
              background: '#fbb6ce',
              color: '#97266d',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            title="Emergency cleanup for too many anchor points"
          >
            🚨 Emergency Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default VectorToolbar;