import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '../App';

interface MeshDeformationToolProps {
  active: boolean;
}

interface ControlPoint {
  id: string;
  x: number;
  y: number;
  type: 'corner' | 'edge' | 'center';
  locked: boolean;
}

interface DeformationMode {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface WarpSettings {
  strength: number;
  smoothness: number;
  preserveAspect: boolean;
  lockEdges: boolean;
  symmetry: boolean;
  symmetryAxis: 'x' | 'y' | 'both';
}

export function MeshDeformationTool({ active }: MeshDeformationToolProps) {
  // Console log removed

  const [deformationMode, setDeformationMode] = useState<string>('freeform');
  const [controlPoints, setControlPoints] = useState<ControlPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [warpSettings, setWarpSettings] = useState<WarpSettings>({
    strength: 0.5,
    smoothness: 0.7,
    preserveAspect: true,
    lockEdges: false,
    symmetry: false,
    symmetryAxis: 'x'
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const meshCanvasRef = useRef<HTMLCanvasElement>(null);

  const deformationModes: DeformationMode[] = [
    {
      id: 'freeform',
      name: 'Freeform',
      description: 'Free deformation with control points',
      icon: '🎯'
    },
    {
      id: 'liquify',
      name: 'Liquify',
      description: 'Liquid-like deformation effects',
      icon: '🌊'
    },
    {
      id: 'perspective',
      name: 'Perspective',
      description: 'Perspective transformation',
      icon: '📐'
    },
    {
      id: 'bulge',
      name: 'Bulge',
      description: 'Bulge and pinch effects',
      icon: '🔍'
    },
    {
      id: 'twist',
      name: 'Twist',
      description: 'Twist and spiral effects',
      icon: '🌀'
    },
    {
      id: 'wave',
      name: 'Wave',
      description: 'Wave and ripple effects',
      icon: '🌊'
    }
  ];

  const initializeControlPoints = useCallback(() => {
    // Console log removed
    const points: ControlPoint[] = [
      { id: 'tl', x: 0.1, y: 0.1, type: 'corner', locked: false },
      { id: 'tr', x: 0.9, y: 0.1, type: 'corner', locked: false },
      { id: 'bl', x: 0.1, y: 0.9, type: 'corner', locked: false },
      { id: 'br', x: 0.9, y: 0.9, type: 'corner', locked: false },
      { id: 't', x: 0.5, y: 0.1, type: 'edge', locked: false },
      { id: 'b', x: 0.5, y: 0.9, type: 'edge', locked: false },
      { id: 'l', x: 0.1, y: 0.5, type: 'edge', locked: false },
      { id: 'r', x: 0.9, y: 0.5, type: 'edge', locked: false },
      { id: 'c', x: 0.5, y: 0.5, type: 'center', locked: false }
    ];
    setControlPoints(points);
  }, []);

  const applyDeformation = useCallback((sourceCanvas: HTMLCanvasElement, targetCanvas: HTMLCanvasElement) => {
    // Console log removed
    
    const sourceCtx = sourceCanvas.getContext('2d')!;
    const targetCtx = targetCanvas.getContext('2d')!;
    
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;
    
    targetCtx.clearRect(0, 0, width, height);
    
    const sourceImageData = sourceCtx.getImageData(0, 0, width, height);
    const targetImageData = targetCtx.createImageData(width, height);
    
    // Create mesh grid
    const gridSize = 20;
    const meshWidth = Math.ceil(width / gridSize);
    const meshHeight = Math.ceil(height / gridSize);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const sourceX = x / width;
        const sourceY = y / height;
        
        let targetX = x;
        let targetY = y;
        
        // Apply deformation based on mode
        switch (deformationMode) {
          case 'freeform':
            ({ targetX, targetY } = applyFreeformDeformation(x, y, sourceX, sourceY, width, height));
            break;
          case 'liquify':
            ({ targetX, targetY } = applyLiquifyDeformation(x, y, sourceX, sourceY, width, height));
            break;
          case 'perspective':
            ({ targetX, targetY } = applyPerspectiveDeformation(x, y, sourceX, sourceY, width, height));
            break;
          case 'bulge':
            ({ targetX, targetY } = applyBulgeDeformation(x, y, sourceX, sourceY, width, height));
            break;
          case 'twist':
            ({ targetX, targetY } = applyTwistDeformation(x, y, sourceX, sourceY, width, height));
            break;
          case 'wave':
            ({ targetX, targetY } = applyWaveDeformation(x, y, sourceX, sourceY, width, height));
            break;
        }
        
        // Sample source pixel
        const sourceIndex = (Math.floor(targetY) * width + Math.floor(targetX)) * 4;
        if (sourceIndex >= 0 && sourceIndex < sourceImageData.data.length - 3) {
          const targetIndex = (y * width + x) * 4;
          targetImageData.data[targetIndex] = sourceImageData.data[sourceIndex];
          targetImageData.data[targetIndex + 1] = sourceImageData.data[sourceIndex + 1];
          targetImageData.data[targetIndex + 2] = sourceImageData.data[sourceIndex + 2];
          targetImageData.data[targetIndex + 3] = sourceImageData.data[sourceIndex + 3];
        }
      }
    }
    
    targetCtx.putImageData(targetImageData, 0, 0);
  }, [deformationMode, controlPoints, warpSettings]);

  const applyFreeformDeformation = (x: number, y: number, sourceX: number, sourceY: number, width: number, height: number) => {
    // Bilinear interpolation between control points
    const tl = controlPoints.find(p => p.id === 'tl')!;
    const tr = controlPoints.find(p => p.id === 'tr')!;
    const bl = controlPoints.find(p => p.id === 'bl')!;
    const br = controlPoints.find(p => p.id === 'br')!;
    
    const topX = tl.x + (tr.x - tl.x) * sourceX;
    const topY = tl.y + (tr.y - tl.y) * sourceX;
    const bottomX = bl.x + (br.x - bl.x) * sourceX;
    const bottomY = bl.y + (br.y - bl.y) * sourceX;
    
    const targetX = (topX + (bottomX - topX) * sourceY) * width;
    const targetY = (topY + (bottomY - topY) * sourceY) * height;
    
    return { targetX, targetY };
  };

  const applyLiquifyDeformation = (x: number, y: number, sourceX: number, sourceY: number, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
    
    const normalizedDistance = distance / maxDistance;
    const strength = warpSettings.strength * (1 - normalizedDistance);
    
    const angle = Math.atan2(y - centerY, x - centerX);
    const offsetX = Math.cos(angle) * strength * 50;
    const offsetY = Math.sin(angle) * strength * 50;
    
    return { targetX: x + offsetX, targetY: y + offsetY };
  };

  const applyPerspectiveDeformation = (x: number, y: number, sourceX: number, sourceY: number, width: number, height: number) => {
    const tl = controlPoints.find(p => p.id === 'tl')!;
    const tr = controlPoints.find(p => p.id === 'tr')!;
    const bl = controlPoints.find(p => p.id === 'bl')!;
    const br = controlPoints.find(p => p.id === 'br')!;
    
    // Perspective transformation matrix
    const matrix = calculatePerspectiveMatrix(
      tl.x * width, tl.y * height,
      tr.x * width, tr.y * height,
      bl.x * width, bl.y * height,
      br.x * width, br.y * height
    );
    
    const targetX = (matrix[0] * x + matrix[1] * y + matrix[2]) / (matrix[6] * x + matrix[7] * y + matrix[8]);
    const targetY = (matrix[3] * x + matrix[4] * y + matrix[5]) / (matrix[6] * x + matrix[7] * y + matrix[8]);
    
    return { targetX, targetY };
  };

  const applyBulgeDeformation = (x: number, y: number, sourceX: number, sourceY: number, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
    
    const normalizedDistance = distance / maxDistance;
    const bulgeFactor = 1 + warpSettings.strength * Math.cos(normalizedDistance * Math.PI);
    
    const angle = Math.atan2(y - centerY, x - centerX);
    const newDistance = distance * bulgeFactor;
    
    const targetX = centerX + Math.cos(angle) * newDistance;
    const targetY = centerY + Math.sin(angle) * newDistance;
    
    return { targetX, targetY };
  };

  const applyTwistDeformation = (x: number, y: number, sourceX: number, sourceY: number, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
    
    const normalizedDistance = distance / maxDistance;
    const twistAngle = warpSettings.strength * normalizedDistance * Math.PI * 2;
    
    const angle = Math.atan2(y - centerY, x - centerX);
    const newAngle = angle + twistAngle;
    
    const targetX = centerX + Math.cos(newAngle) * distance;
    const targetY = centerY + Math.sin(newAngle) * distance;
    
    return { targetX, targetY };
  };

  const applyWaveDeformation = (x: number, y: number, sourceX: number, sourceY: number, width: number, height: number) => {
    const waveFrequency = 0.02;
    const waveAmplitude = warpSettings.strength * 50;
    
    const waveX = Math.sin(y * waveFrequency) * waveAmplitude;
    const waveY = Math.sin(x * waveFrequency) * waveAmplitude;
    
    return { targetX: x + waveX, targetY: y + waveY };
  };

  const calculatePerspectiveMatrix = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) => {
    // Simplified perspective transformation matrix calculation
    return [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ];
  };

  const handleControlPointDrag = useCallback((pointId: string, newX: number, newY: number) => {
    // Console log removed
    
    setControlPoints(prev => prev.map(point => {
      if (point.id === pointId) {
        return { ...point, x: newX, y: newY };
      }
      return point;
    }));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    // Find closest control point
    let closestPoint: ControlPoint | null = null;
    let minDistance = Infinity;
    
    controlPoints.forEach(point => {
      const distance = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2);
      if (distance < minDistance && distance < 0.05) {
        minDistance = distance;
        closestPoint = point;
      }
    });
    
    if (closestPoint) {
      setSelectedPoint(closestPoint.id);
      setIsDragging(true);
    }
  }, [controlPoints]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedPoint) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    handleControlPointDrag(selectedPoint, x, y);
  }, [isDragging, selectedPoint, handleControlPointDrag]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setSelectedPoint(null);
  }, []);

  useEffect(() => {
    if (active) {
      initializeControlPoints();
    }
  }, [active, initializeControlPoints]);

  if (!active) {
    // Console log removed
    return null;
  }

  console.log('🔧 MeshDeformationTool: Rendering component', { 
    deformationMode,
    controlPointsCount: controlPoints.length,
    selectedPoint,
    isDragging
  });

  return (
    <div className="mesh-deformation-tool">
      <div className="tool-header">
        <h4 style={{ margin: 0, color: '#10B981', fontSize: '18px' }}>
          🔧 Mesh Deformation Tool
        </h4>
        <div className="tool-controls">
          <button
            onClick={initializeControlPoints}
          style={{
            padding: '6px 12px',
            background: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Reset
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
          title="Close Mesh Deformation"
        >
          ✕ Close
        </button>
        </div>
      </div>

      {/* Deformation Modes */}
      <div className="deformation-modes" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#10B981', marginBottom: '8px' }}>
          Deformation Modes
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px'
        }}>
          {deformationModes.map(mode => (
            <button
              key={mode.id}
              className={`mode-btn ${deformationMode === mode.id ? 'active' : ''}`}
              onClick={() => setDeformationMode(mode.id)}
              style={{
                padding: '8px',
                background: deformationMode === mode.id ? '#10B981' : 'rgba(16, 185, 129, 0.2)',
                color: deformationMode === mode.id ? '#FFFFFF' : '#6EE7B7',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '16px', marginBottom: '4px' }}>{mode.icon}</div>
              <div>{mode.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Warp Settings */}
      <div className="warp-settings" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#10B981', marginBottom: '8px' }}>
          Warp Settings
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px'
        }}>
          <div>
            <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
              Strength
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={warpSettings.strength}
              onChange={(e) => setWarpSettings(prev => ({ ...prev, strength: parseFloat(e.target.value) }))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
              Smoothness
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={warpSettings.smoothness}
              onChange={(e) => setWarpSettings(prev => ({ ...prev, smoothness: parseFloat(e.target.value) }))}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Control Point Settings */}
      <div className="control-point-settings" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#10B981', marginBottom: '8px' }}>
          Control Points
        </div>
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#D1D5DB' }}>
            <input
              type="checkbox"
              checked={warpSettings.preserveAspect}
              onChange={(e) => setWarpSettings(prev => ({ ...prev, preserveAspect: e.target.checked }))}
            />
            Preserve Aspect
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#D1D5DB' }}>
            <input
              type="checkbox"
              checked={warpSettings.lockEdges}
              onChange={(e) => setWarpSettings(prev => ({ ...prev, lockEdges: e.target.checked }))}
            />
            Lock Edges
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#D1D5DB' }}>
            <input
              type="checkbox"
              checked={warpSettings.symmetry}
              onChange={(e) => setWarpSettings(prev => ({ ...prev, symmetry: e.target.checked }))}
            />
            Symmetry
          </label>
        </div>
      </div>

      {/* Deformation Preview */}
      <div className="deformation-preview" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#10B981', marginBottom: '8px' }}>
          Deformation Preview
        </div>
        <div style={{ position: 'relative' }}>
          <canvas
            ref={previewCanvasRef}
            width={300}
            height={200}
            style={{
              width: '100%',
              height: '200px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '4px',
              background: '#1F2937',
              cursor: 'crosshair'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
          
          {/* Render control points */}
          {controlPoints.map(point => (
            <div
              key={point.id}
              style={{
                position: 'absolute',
                left: `${point.x * 100}%`,
                top: `${point.y * 100}%`,
                width: '12px',
                height: '12px',
                background: selectedPoint === point.id ? '#10B981' : '#6EE7B7',
                border: '2px solid #FFFFFF',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                cursor: 'move',
                zIndex: 10
              }}
            />
          ))}
        </div>
      </div>

      {/* Hidden canvases for processing */}
      <canvas ref={canvasRef} width={2048} height={2048} style={{ display: 'none' }} />
      <canvas ref={meshCanvasRef} width={2048} height={2048} style={{ display: 'none' }} />
    </div>
  );
}
