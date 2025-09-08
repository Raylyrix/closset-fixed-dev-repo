import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../App';

interface AdvancedSelectionProps {
  active: boolean;
}

interface SelectionPoint {
  x: number;
  y: number;
}

interface SelectionArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

type SelectionType = 'magicWand' | 'lasso' | 'polygonalLasso' | 'magneticLasso' | 'quickSelection' | 'rectangular' | 'elliptical';

export function AdvancedSelection({ active }: AdvancedSelectionProps) {
  // Console log removed

  const {
    composedCanvas,
    activeTool,
    brushColor,
    brushSize,
    layers,
    activeLayerId,
    commit
  } = useApp();

  // Selection state
  const [selectionType, setSelectionType] = useState<SelectionType>('rectangular');
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionPoints, setSelectionPoints] = useState<SelectionPoint[]>([]);
  const [selectionArea, setSelectionArea] = useState<SelectionArea | null>(null);
  const [selectionMask, setSelectionMask] = useState<HTMLCanvasElement | null>(null);
  const [tolerance, setTolerance] = useState(32);
  const [feather, setFeather] = useState(0);
  const [antiAliasing, setAntiAliasing] = useState(true);
  const [contiguous, setContiguous] = useState(true);

  // Refs
  const selectionCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<SelectionPoint | null>(null);

  // Initialize selection canvas
  useEffect(() => {
    if (!active || !composedCanvas) {
      // Console log removed
      return;
    }

    console.log('🎯 AdvancedSelection: Initializing selection canvas', {
      composedCanvasSize: `${composedCanvas.width}x${composedCanvas.height}`
    });

    // Create selection canvas
    const selectionCanvas = document.createElement('canvas');
    selectionCanvas.width = composedCanvas.width;
    selectionCanvas.height = composedCanvas.height;
    // Note: We'll use the canvas directly in functions rather than storing in ref

    // Create preview canvas
    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = composedCanvas.width;
    previewCanvas.height = composedCanvas.height;
    // Note: We'll use the canvas directly in functions rather than storing in ref

    // Console log removed
  }, [active, composedCanvas]);

  // Magic Wand selection
  const performMagicWandSelection = useCallback((x: number, y: number) => {
    if (!composedCanvas || !selectionCanvasRef.current) {
      // Console log removed
      return;
    }

    // Console log removed

    const sourceCtx = composedCanvas.getContext('2d')!;
    const selectionCtx = selectionCanvasRef.current.getContext('2d')!;

    // Get the color at the clicked point
    const imageData = sourceCtx.getImageData(x, y, 1, 1);
    const targetColor = {
      r: imageData.data[0],
      g: imageData.data[1],
      b: imageData.data[2],
      a: imageData.data[3]
    };

    // Console log removed

    // Clear previous selection
    selectionCtx.clearRect(0, 0, composedCanvas.width, composedCanvas.height);

    // Get full image data
    const fullImageData = sourceCtx.getImageData(0, 0, composedCanvas.width, composedCanvas.height);
    const selectionData = selectionCtx.createImageData(composedCanvas.width, composedCanvas.height);

    // Flood fill algorithm
    const visited = new Set<string>();
    const stack: SelectionPoint[] = [{ x, y }];

    while (stack.length > 0) {
      const current = stack.pop()!;
      const key = `${current.x},${current.y}`;

      if (visited.has(key)) continue;
      if (current.x < 0 || current.x >= composedCanvas.width || 
          current.y < 0 || current.y >= composedCanvas.height) continue;

      visited.add(key);

      const pixelIndex = (current.y * composedCanvas.width + current.x) * 4;
      const pixelColor = {
        r: fullImageData.data[pixelIndex],
        g: fullImageData.data[pixelIndex + 1],
        b: fullImageData.data[pixelIndex + 2],
        a: fullImageData.data[pixelIndex + 3]
      };

      // Check if color is within tolerance
      const colorDistance = Math.sqrt(
        Math.pow(pixelColor.r - targetColor.r, 2) +
        Math.pow(pixelColor.g - targetColor.g, 2) +
        Math.pow(pixelColor.b - targetColor.b, 2) +
        Math.pow(pixelColor.a - targetColor.a, 2)
      );

      if (colorDistance <= tolerance) {
        // Mark as selected
        selectionData.data[pixelIndex] = 255;
        selectionData.data[pixelIndex + 1] = 255;
        selectionData.data[pixelIndex + 2] = 255;
        selectionData.data[pixelIndex + 3] = 255;

        // Add neighbors to stack
        if (contiguous) {
          stack.push(
            { x: current.x + 1, y: current.y },
            { x: current.x - 1, y: current.y },
            { x: current.x, y: current.y + 1 },
            { x: current.x, y: current.y - 1 }
          );
        }
      }
    }

    // Apply selection mask
    selectionCtx.putImageData(selectionData, 0, 0);
    setSelectionMask(selectionCanvasRef.current);

    console.log('🎯 AdvancedSelection: Magic wand selection completed', {
      selectedPixels: visited.size,
      tolerance,
      contiguous
    });
  }, [composedCanvas, tolerance, contiguous]);

  // Lasso selection
  const performLassoSelection = useCallback((points: SelectionPoint[]) => {
    if (!composedCanvas || !selectionCanvasRef.current || points.length < 3) {
      // Console log removed
      return;
    }

    // Console log removed

    const selectionCtx = selectionCanvasRef.current.getContext('2d')!;
    selectionCtx.clearRect(0, 0, composedCanvas.width, composedCanvas.height);

    // Draw lasso path
    selectionCtx.beginPath();
    selectionCtx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      selectionCtx.lineTo(points[i].x, points[i].y);
    }
    
    selectionCtx.closePath();

    // Fill the selection
    selectionCtx.fillStyle = 'white';
    selectionCtx.fill();

    setSelectionMask(selectionCanvasRef.current);

    // Console log removed
  }, [composedCanvas]);

  // Rectangular selection
  const performRectangularSelection = useCallback((area: SelectionArea) => {
    if (!composedCanvas || !selectionCanvasRef.current) {
      // Console log removed
      return;
    }

    // Console log removed

    const selectionCtx = selectionCanvasRef.current.getContext('2d')!;
    selectionCtx.clearRect(0, 0, composedCanvas.width, composedCanvas.height);

    // Draw rectangle
    selectionCtx.fillStyle = 'white';
    selectionCtx.fillRect(area.x, area.y, area.width, area.height);

    setSelectionMask(selectionCanvasRef.current);

    // Console log removed
  }, [composedCanvas]);

  // Elliptical selection
  const performEllipticalSelection = useCallback((area: SelectionArea) => {
    if (!composedCanvas || !selectionCanvasRef.current) {
      // Console log removed
      return;
    }

    // Console log removed

    const selectionCtx = selectionCanvasRef.current.getContext('2d')!;
    selectionCtx.clearRect(0, 0, composedCanvas.width, composedCanvas.height);

    // Draw ellipse
    selectionCtx.beginPath();
    const centerX = area.x + area.width / 2;
    const centerY = area.y + area.height / 2;
    const radiusX = area.width / 2;
    const radiusY = area.height / 2;
    
    selectionCtx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    selectionCtx.fillStyle = 'white';
    selectionCtx.fill();

    setSelectionMask(selectionCanvasRef.current);

    // Console log removed
  }, [composedCanvas]);

  // Quick selection (AI-powered)
  const performQuickSelection = useCallback((x: number, y: number) => {
    if (!composedCanvas || !selectionCanvasRef.current) {
      // Console log removed
      return;
    }

    // Console log removed

    // For now, use an enhanced magic wand with better edge detection
    // In a real implementation, this would use AI/ML for object detection
    const sourceCtx = composedCanvas.getContext('2d')!;
    const selectionCtx = selectionCanvasRef.current.getContext('2d')!;

    // Get image data
    const imageData = sourceCtx.getImageData(0, 0, composedCanvas.width, composedCanvas.height);
    const selectionData = selectionCtx.createImageData(composedCanvas.width, composedCanvas.height);

    // Enhanced edge detection using Sobel operator
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let y = 1; y < composedCanvas.height - 1; y++) {
      for (let x = 1; x < composedCanvas.width - 1; x++) {
        let gx = 0, gy = 0;

        // Apply Sobel operators
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixelIndex = ((y + ky) * composedCanvas.width + (x + kx)) * 4;
            const gray = (imageData.data[pixelIndex] + imageData.data[pixelIndex + 1] + imageData.data[pixelIndex + 2]) / 3;
            
            const kernelIndex = (ky + 1) * 3 + (kx + 1);
            gx += gray * sobelX[kernelIndex];
            gy += gray * sobelY[kernelIndex];
          }
        }

        const magnitude = Math.sqrt(gx * gx + gy * gy);
        const pixelIndex = (y * composedCanvas.width + x) * 4;

        // Threshold for edge detection
        if (magnitude > 50) {
          selectionData.data[pixelIndex] = 255;
          selectionData.data[pixelIndex + 1] = 255;
          selectionData.data[pixelIndex + 2] = 255;
          selectionData.data[pixelIndex + 3] = 255;
        }
      }
    }

    selectionCtx.putImageData(selectionData, 0, 0);
    setSelectionMask(selectionCanvasRef.current);

    // Console log removed
  }, [composedCanvas]);

  // Apply selection to active layer
  const applySelectionToLayer = useCallback(() => {
    if (!selectionMask || !activeLayerId || !layers) {
      // Console log removed
      return;
    }

    // Console log removed

    const activeLayer = layers.find(l => l.id === activeLayerId);
    if (!activeLayer) {
      // Console log removed
      return;
    }

    // Set the selection mask on the active layer
    activeLayer.mask = selectionMask;
    
    // Trigger recomposition
    if (composedCanvas) {
      const ctx = composedCanvas.getContext('2d')!;
      ctx.clearRect(0, 0, composedCanvas.width, composedCanvas.height);
      
      // Redraw layers with mask
      layers.forEach(layer => {
        if (!layer.visible) return;
        
        ctx.drawImage(layer.canvas, 0, 0);
        
        if (layer.mask) {
          ctx.globalCompositeOperation = 'destination-in';
          ctx.drawImage(layer.mask, 0, 0);
          ctx.globalCompositeOperation = 'source-over';
        }
      });
    }

    // Console log removed
  }, [selectionMask, activeLayerId, layers, composedCanvas]);

  // Clear selection
  const clearSelection = useCallback(() => {
    // Console log removed

    setSelectionPoints([]);
    setSelectionArea(null);
    setSelectionMask(null);
    setIsSelecting(false);

    if (selectionCanvasRef.current) {
      const ctx = selectionCanvasRef.current.getContext('2d')!;
      ctx.clearRect(0, 0, selectionCanvasRef.current.width, selectionCanvasRef.current.height);
    }

    // Console log removed
  }, []);

  // Handle mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!active || !composedCanvas) return;

    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Console log removed

    setIsSelecting(true);
    isDrawingRef.current = true;
    lastPointRef.current = { x, y };

    switch (selectionType) {
      case 'magicWand':
        performMagicWandSelection(x, y);
        break;
      case 'quickSelection':
        performQuickSelection(x, y);
        break;
      case 'rectangular':
        setSelectionArea({ x, y, width: 0, height: 0 });
        break;
      case 'elliptical':
        setSelectionArea({ x, y, width: 0, height: 0 });
        break;
      case 'lasso':
      case 'polygonalLasso':
      case 'magneticLasso':
        setSelectionPoints([{ x, y }]);
        break;
    }
  }, [active, composedCanvas, selectionType, performMagicWandSelection, performQuickSelection]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isSelecting || !isDrawingRef.current) return;

    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Console log removed

    switch (selectionType) {
      case 'rectangular':
        if (selectionArea && lastPointRef.current) {
          const newArea = {
            x: Math.min(lastPointRef.current.x, x),
            y: Math.min(lastPointRef.current.y, y),
            width: Math.abs(x - lastPointRef.current.x),
            height: Math.abs(y - lastPointRef.current.y)
          };
          setSelectionArea(newArea);
        }
        break;
      case 'elliptical':
        if (selectionArea && lastPointRef.current) {
          const newArea = {
            x: Math.min(lastPointRef.current.x, x),
            y: Math.min(lastPointRef.current.y, y),
            width: Math.abs(x - lastPointRef.current.x),
            height: Math.abs(y - lastPointRef.current.y)
          };
          setSelectionArea(newArea);
        }
        break;
      case 'lasso':
      case 'magneticLasso':
        if (selectionPoints.length > 0) {
          setSelectionPoints(prev => [...prev, { x, y }]);
        }
        break;
    }
  }, [isSelecting, selectionType, selectionArea, selectionPoints]);

  const handleMouseUp = useCallback(() => {
    if (!isSelecting) return;

    // Console log removed

    isDrawingRef.current = false;

    switch (selectionType) {
      case 'rectangular':
        if (selectionArea) {
          performRectangularSelection(selectionArea);
        }
        break;
      case 'elliptical':
        if (selectionArea) {
          performEllipticalSelection(selectionArea);
        }
        break;
      case 'polygonalLasso':
        // Continue adding points until double-click
        break;
      case 'lasso':
      case 'magneticLasso':
        if (selectionPoints.length > 2) {
          performLassoSelection(selectionPoints);
        }
        break;
    }

    setIsSelecting(false);
  }, [isSelecting, selectionType, selectionArea, selectionPoints, performRectangularSelection, performEllipticalSelection, performLassoSelection]);

  // Update preview when selection changes
  useEffect(() => {
    if (!previewCanvasRef.current || !composedCanvas) return;

    // Console log removed

    const previewCtx = previewCanvasRef.current.getContext('2d')!;
    previewCtx.clearRect(0, 0, composedCanvas.width, composedCanvas.height);

    // Draw original image
    previewCtx.drawImage(composedCanvas, 0, 0);

    // Draw selection overlay
    if (selectionMask) {
      previewCtx.globalAlpha = 0.5;
      previewCtx.globalCompositeOperation = 'multiply';
      previewCtx.drawImage(selectionMask, 0, 0);
      previewCtx.globalCompositeOperation = 'source-over';
      previewCtx.globalAlpha = 1;
    }

    // Console log removed
  }, [selectionMask, composedCanvas]);

  if (!active) {
    // Console log removed
    return null;
  }

  // Console log removed

  return (
    <div className="advanced-selection" style={{
      border: '2px solid #3B82F6',
      borderRadius: '8px',
      padding: '12px',
      background: 'rgba(59, 130, 246, 0.1)',
      boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)',
      marginTop: '12px'
    }}>
      <div className="selection-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <h4 style={{ margin: 0, color: '#3B82F6', fontSize: '16px' }}>
          🎯 Advanced Selection
        </h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn"
            onClick={applySelectionToLayer}
            disabled={!selectionMask}
            style={{
              background: selectionMask ? '#10B981' : '#6B7280',
              color: 'white',
              fontSize: '12px',
              padding: '6px 12px'
            }}
          >
            Apply
          </button>
          <button
            className="btn"
            onClick={clearSelection}
            style={{
              background: '#EF4444',
              color: 'white',
              fontSize: '12px',
              padding: '6px 12px'
            }}
          >
            Clear
          </button>
          <button
            className="btn"
            onClick={() => useApp.getState().setTool('brush')}
            style={{
              background: '#6B7280',
              color: 'white',
              fontSize: '12px',
              padding: '6px 12px'
            }}
            title="Close Advanced Selection"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Selection Tools */}
      <div className="selection-tools" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        marginBottom: '12px'
      }}>
        {[
          { id: 'rectangular', label: 'Rect', icon: '⬜' },
          { id: 'elliptical', label: 'Ellipse', icon: '⭕' },
          { id: 'magicWand', label: 'Magic', icon: '🪄' },
          { id: 'lasso', label: 'Lasso', icon: '🪝' },
          { id: 'polygonalLasso', label: 'Poly', icon: '📐' },
          { id: 'quickSelection', label: 'Quick', icon: '⚡' }
        ].map(tool => (
          <button
            key={tool.id}
            className={`btn ${selectionType === tool.id ? 'active' : ''}`}
            onClick={() => {
              // Console log removed
              setSelectionType(tool.id as SelectionType);
              clearSelection();
            }}
            style={{
              fontSize: '10px',
              padding: '8px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span style={{ fontSize: '16px' }}>{tool.icon}</span>
            <span>{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Selection Settings */}
      <div className="selection-settings" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '12px'
      }}>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#3B82F6' }}>
            Tolerance: {tolerance}
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={tolerance}
            onChange={(e) => {
              // Console log removed
              setTolerance(parseInt(e.target.value));
            }}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#3B82F6' }}>
            Feather: {feather}px
          </label>
          <input
            type="range"
            min="0"
            max="20"
            value={feather}
            onChange={(e) => {
              // Console log removed
              setFeather(parseInt(e.target.value));
            }}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="antiAliasing"
            checked={antiAliasing}
            onChange={(e) => {
              // Console log removed
              setAntiAliasing(e.target.checked);
            }}
          />
          <label htmlFor="antiAliasing" style={{ fontSize: '12px', color: '#3B82F6' }}>
            Anti-aliasing
          </label>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="contiguous"
            checked={contiguous}
            onChange={(e) => {
              // Console log removed
              setContiguous(e.target.checked);
            }}
          />
          <label htmlFor="contiguous" style={{ fontSize: '12px', color: '#3B82F6' }}>
            Contiguous
          </label>
        </div>
      </div>

      {/* Selection Preview */}
      {selectionMask && (
        <div className="selection-preview" style={{
          border: '1px solid #3B82F6',
          borderRadius: '4px',
          padding: '8px',
          background: 'white',
          marginBottom: '12px'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#3B82F6', marginBottom: '8px' }}>
            Selection Preview
          </div>
          <canvas
            ref={previewCanvasRef}
            width={composedCanvas?.width || 400}
            height={composedCanvas?.height || 400}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{
              width: '100%',
              height: 'auto',
              maxWidth: '300px',
              cursor: 'crosshair',
              border: '1px solid #E5E7EB'
            }}
          />
        </div>
      )}

      {/* Instructions */}
      <div style={{ fontSize: '12px', color: '#6B7280', textAlign: 'center' }}>
        {selectionType === 'magicWand' && 'Click on an area to select similar colors'}
        {selectionType === 'quickSelection' && 'Click and drag to select objects'}
        {selectionType === 'rectangular' && 'Click and drag to create rectangular selection'}
        {selectionType === 'elliptical' && 'Click and drag to create elliptical selection'}
        {selectionType === 'lasso' && 'Click and drag to draw freehand selection'}
        {selectionType === 'polygonalLasso' && 'Click to add points, double-click to finish'}
        {selectionType === 'magneticLasso' && 'Click and drag along edges for magnetic selection'}
      </div>
    </div>
  );
}
