import React, { useEffect, useRef } from 'react';
import { useApp } from '../App';

interface GridOverlayProps {
  canvasRef?: React.RefObject<HTMLCanvasElement>;
}

export const GridOverlay: React.FC<GridOverlayProps> = ({ canvasRef }) => {
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    showGrid,
    gridSize,
    gridColor,
    gridOpacity,
    showRulers,
    rulerUnits,
    scale,
    showGuides,
    guideColor,
    snapToGrid,
    snapDistance
  } = useApp();

  // Helper function to convert units
  const convertUnits = (value: number, fromUnit: string, toUnit: string): number => {
    const conversions: {[key: string]: {[key: string]: number}} = {
      'px': { 'mm': 0.264583, 'in': 0.0104167 },
      'mm': { 'px': 3.779527559, 'in': 0.0393701 },
      'in': { 'px': 96, 'mm': 25.4 }
    };
    
    if (fromUnit === toUnit) return value;
    return value * (conversions[fromUnit]?.[toUnit] || 1);
  };

  // Draw grid
  const drawGrid = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (!showGrid) return;
    
    ctx.save();
    ctx.strokeStyle = gridColor;
    ctx.globalAlpha = gridOpacity;
    ctx.lineWidth = 1;
    
    const scaledGridSize = gridSize * scale;
    const startX = 0;
    const startY = 0;
    const endX = canvas.width;
    const endY = canvas.height;
    
    // Draw vertical lines
    for (let x = startX; x <= endX; x += scaledGridSize) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = startY; y <= endY; y += scaledGridSize) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }
    
    ctx.restore();
  };

  // Draw rulers
  const drawRulers = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (!showRulers) return;
    
    ctx.save();
    ctx.fillStyle = '#666666';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    
    const scaledGridSize = gridSize * scale;
    const rulerHeight = 20;
    
    // Top ruler
    ctx.fillRect(0, 0, canvas.width, rulerHeight);
    ctx.fillStyle = '#FFFFFF';
    
    for (let x = 0; x <= canvas.width; x += scaledGridSize) {
      const value = Math.round(x / scale);
      const displayValue = Math.round(convertUnits(value, 'px', rulerUnits));
      ctx.fillText(displayValue.toString(), x, 15);
    }
    
    // Left ruler
    ctx.fillStyle = '#666666';
    ctx.fillRect(0, rulerHeight, rulerHeight, canvas.height - rulerHeight);
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    
    for (let y = rulerHeight; y <= canvas.height; y += scaledGridSize) {
      const value = Math.round((y - rulerHeight) / scale);
      const displayValue = Math.round(convertUnits(value, 'px', rulerUnits));
      ctx.save();
      ctx.translate(10, y);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(displayValue.toString(), 0, 0);
      ctx.restore();
    }
    
    ctx.restore();
  };

  // Draw guides
  const drawGuides = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (!showGuides) return;
    
    ctx.save();
    ctx.strokeStyle = guideColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.globalAlpha = 0.7;
    
    // Vertical guide at center
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    
    // Horizontal guide at center
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    
    ctx.restore();
  };

  // Snap to grid function
  const snapToGridPoint = (x: number, y: number): {x: number, y: number} => {
    if (!snapToGrid) return {x, y};
    
    const scaledGridSize = gridSize * scale;
    const snappedX = Math.round(x / scaledGridSize) * scaledGridSize;
    const snappedY = Math.round(y / scaledGridSize) * scaledGridSize;
    
    // Check if point is within snap distance
    const distance = Math.sqrt((x - snappedX) ** 2 + (y - snappedY) ** 2);
    if (distance <= snapDistance) {
      return {x: snappedX, y: snappedY};
    }
    
    return {x, y};
  };

  // Update overlay when settings change
  useEffect(() => {
    const overlay = overlayRef.current;
    const container = containerRef.current;
    
    if (!overlay || !container) return;

    const rect = container.getBoundingClientRect();
    overlay.width = rect.width;
    overlay.height = rect.height;
    
    const ctx = overlay.getContext('2d');
    if (!ctx) return;

    // Clear overlay
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    
    // Draw grid and rulers
    drawRulers(ctx, overlay);
    drawGrid(ctx, overlay);
    drawGuides(ctx, overlay);
  }, [showGrid, gridSize, gridColor, gridOpacity, showRulers, rulerUnits, scale, showGuides, guideColor]);

  // Expose snap function globally
  useEffect(() => {
    (window as any).snapToGridPoint = snapToGridPoint;
    return () => {
      delete (window as any).snapToGridPoint;
    };
  }, [snapToGrid, gridSize, scale, snapDistance]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    >
      <canvas
        ref={overlayRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};
