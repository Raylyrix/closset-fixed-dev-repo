/**
 * 🎯 Shirt Overlay Component
 * 
 * Provides overlay elements for the shirt component
 * Extracted from Shirt.js for better separation of concerns
 */

import React from 'react';
import { Html } from '@react-three/drei';

interface ShirtOverlayProps {
  showGrid: boolean;
  showGuides: boolean;
  gridSize: number;
  canvasWidth: number;
  canvasHeight: number;
}

export const ShirtOverlay: React.FC<ShirtOverlayProps> = ({
  showGrid,
  showGuides,
  gridSize,
  canvasWidth,
  canvasHeight
}) => {
  if (!showGrid && !showGuides) {
    return null;
  }

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 1
  };

  const gridStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: showGrid ? `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)` : 'none',
    backgroundSize: `${gridSize}px ${gridSize}px`,
    pointerEvents: 'none'
  };

  const guideStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none'
  };

  const centerLineStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: 0,
    width: '100%',
    height: '1px',
    background: 'rgba(255, 0, 0, 0.5)',
    transform: 'translateY(-50%)'
  };

  const verticalCenterLineStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: '1px',
    height: '100%',
    background: 'rgba(255, 0, 0, 0.5)',
    transform: 'translateX(-50%)'
  };

  return (
    <div style={overlayStyle}>
      {/* Grid Overlay */}
      {showGrid && (
        <div style={gridStyle} />
      )}
      
      {/* Guide Lines */}
      {showGuides && (
        <div style={guideStyle}>
          <div style={centerLineStyle} />
          <div style={verticalCenterLineStyle} />
        </div>
      )}
    </div>
  );
};

export default ShirtOverlay;
