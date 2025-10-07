import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Shirt } from '../three/Shirt';
import { AdvancedBrushSystem } from './AdvancedBrushSystemV2';
import { BrushEngine, BrushPoint } from '../utils/BrushEngine';
import { brushPresetManager } from '../utils/BrushPresets';

export function BrushSystemDemo() {
  const [activeTool, setActiveTool] = useState<'brush' | 'advancedBrush' | 'view'>('view');
  const [currentBrushSettings, setCurrentBrushSettings] = useState(
    brushPresetManager.getPreset('hard_round')?.settings || null
  );
  const [brushHistory, setBrushHistory] = useState<Array<{
    id: string;
    points: BrushPoint[];
    settings: any;
    timestamp: number;
  }>>([]);

  const [modelMesh, setModelMesh] = useState<any>(null);

  const handleBrushStroke = (points: BrushPoint[], settings: any) => {
    const stroke = {
      id: `stroke-${Date.now()}`,
      points,
      settings,
      timestamp: Date.now()
    };

    setBrushHistory(prev => [...prev, stroke]);
    console.log('Brush stroke recorded:', stroke);
  };

  const clearHistory = () => {
    setBrushHistory([]);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      {/* 3D Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{ background: '#111827' }}
        >
          <Environment preset="studio" />

          <Shirt />

          {/* Brush 3D Integration - TODO: Enable when Shirt component exposes mesh reference */}
        </Canvas>

        {/* Tool Selector */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(31, 41, 55, 0.9)',
          borderRadius: '8px',
          padding: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button
              onClick={() => setActiveTool('view')}
              style={{
                padding: '8px 16px',
                background: activeTool === 'view' ? '#3B82F6' : '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              👁️ View
            </button>
            <button
              onClick={() => setActiveTool('brush')}
              style={{
                padding: '8px 16px',
                background: activeTool === 'brush' ? '#10B981' : '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🎨 Brush
            </button>
            <button
              onClick={() => setActiveTool('advancedBrush')}
              style={{
                padding: '8px 16px',
                background: activeTool === 'advancedBrush' ? '#8B5CF6' : '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ⚡ Advanced
            </button>
          </div>

          {/* Brush Status */}
          {activeTool === 'brush' && (
            <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
              <div>Mode: 3D UV Painting</div>
              <div>Strokes: {brushHistory.length}</div>
              <button
                onClick={clearHistory}
                style={{
                  marginTop: '8px',
                  padding: '4px 8px',
                  background: '#EF4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '10px'
                }}
              >
                Clear History
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          background: 'rgba(31, 41, 55, 0.9)',
          borderRadius: '8px',
          padding: '12px',
          backdropFilter: 'blur(10px)',
          maxWidth: '300px'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#3B82F6', fontSize: '14px' }}>
            🎨 Advanced Brush System Demo
          </h4>
          <div style={{ fontSize: '11px', color: '#9CA3AF', lineHeight: '1.4' }}>
            {activeTool === 'view' && (
              <>
                <strong>View Mode:</strong> Rotate, zoom, and pan the 3D model.<br/>
                Switch to Brush mode to start painting on the surface.
              </>
            )}
            {activeTool === 'brush' && (
              <>
                <strong>Brush Mode:</strong> Click and drag on the 3D model to paint.<br/>
                The brush strokes are applied to UV coordinates and rendered in real-time.
              </>
            )}
            {activeTool === 'advancedBrush' && (
              <>
                <strong>Advanced Brush:</strong> Access the full brush customization panel.<br/>
                Modify dynamics, textures, and create custom brushes.
              </>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Brush Panel */}
      {activeTool === 'advancedBrush' && (
        <div style={{
          width: '400px',
          borderLeft: '1px solid #374151',
          background: '#1F2937'
        }}>
          <AdvancedBrushSystem active={true} />
        </div>
      )}
    </div>
  );
}

// Hook for using the brush system in other components
export function useBrushSystem() {
  const [currentBrush, setCurrentBrush] = useState(
    brushPresetManager.getPreset('hard_round')?.settings || null
  );
  const [brushEngine, setBrushEngine] = useState<BrushEngine | null>(null);

  useEffect(() => {
    // Initialize brush engine
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const engine = new BrushEngine(canvas);
    setBrushEngine(engine);

    return () => {
      engine.dispose();
    };
  }, []);

  const selectBrush = (brushId: string) => {
    const preset = brushPresetManager.getPreset(brushId);
    if (preset) {
      setCurrentBrush(preset.settings);
    }
  };

  const applyBrushStroke = (points: BrushPoint[]) => {
    if (brushEngine && currentBrush) {
      brushEngine.renderBrushStroke(points, currentBrush);
    }
  };

  return {
    currentBrush,
    brushEngine,
    selectBrush,
    applyBrushStroke,
    availablePresets: brushPresetManager.getAllPresets()
  };
}
