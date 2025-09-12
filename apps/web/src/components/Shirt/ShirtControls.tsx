/**
 * 🎯 Shirt Controls Component
 * 
 * Provides UI controls for the shirt component
 * Extracted from Shirt.js for better separation of concerns
 */

import React from 'react';
import { Html } from '@react-three/drei';

interface ShirtControlsProps {
  showAnchorPoints: boolean;
  showGrid: boolean;
  showGuides: boolean;
  snapToGrid: boolean;
  snapToPoints: boolean;
  toolSettings: {
    precision: number;
    snapTolerance: number;
    gridSize: number;
    showRulers: boolean;
  };
  onToggleAnchorPoints: (show: boolean) => void;
  onToggleGrid: (show: boolean) => void;
  onToggleGuides: (show: boolean) => void;
  onToggleSnapToGrid: (snap: boolean) => void;
  onToggleSnapToPoints: (snap: boolean) => void;
  onUpdateToolSettings: (settings: any) => void;
}

export const ShirtControls: React.FC<ShirtControlsProps> = ({
  showAnchorPoints,
  showGrid,
  showGuides,
  snapToGrid,
  snapToPoints,
  toolSettings,
  onToggleAnchorPoints,
  onToggleGrid,
  onToggleGuides,
  onToggleSnapToGrid,
  onToggleSnapToPoints,
  onUpdateToolSettings
}) => {
  const controlStyle: React.CSSProperties = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    padding: '10px',
    borderRadius: '5px',
    fontSize: '12px',
    minWidth: '200px'
  };

  const buttonStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: 'white',
    padding: '5px 10px',
    margin: '2px',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '11px'
  };

  const activeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: 'rgba(0, 255, 0, 0.3)',
    border: '1px solid rgba(0, 255, 0, 0.5)'
  };

  return (
    <Html>
      <div style={controlStyle}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Shirt Controls</h4>
        
        {/* Display Controls */}
        <div style={{ marginBottom: '10px' }}>
          <h5 style={{ margin: '0 0 5px 0', fontSize: '12px' }}>Display</h5>
          <button
            style={showAnchorPoints ? activeButtonStyle : buttonStyle}
            onClick={() => onToggleAnchorPoints(!showAnchorPoints)}
          >
            {showAnchorPoints ? '✓' : '○'} Anchor Points
          </button>
          <button
            style={showGrid ? activeButtonStyle : buttonStyle}
            onClick={() => onToggleGrid(!showGrid)}
          >
            {showGrid ? '✓' : '○'} Grid
          </button>
          <button
            style={showGuides ? activeButtonStyle : buttonStyle}
            onClick={() => onToggleGuides(!showGuides)}
          >
            {showGuides ? '✓' : '○'} Guides
          </button>
        </div>
        
        {/* Snap Controls */}
        <div style={{ marginBottom: '10px' }}>
          <h5 style={{ margin: '0 0 5px 0', fontSize: '12px' }}>Snapping</h5>
          <button
            style={snapToGrid ? activeButtonStyle : buttonStyle}
            onClick={() => onToggleSnapToGrid(!snapToGrid)}
          >
            {snapToGrid ? '✓' : '○'} Snap to Grid
          </button>
          <button
            style={snapToPoints ? activeButtonStyle : buttonStyle}
            onClick={() => onToggleSnapToPoints(!snapToPoints)}
          >
            {snapToPoints ? '✓' : '○'} Snap to Points
          </button>
        </div>
        
        {/* Tool Settings */}
        <div style={{ marginBottom: '10px' }}>
          <h5 style={{ margin: '0 0 5px 0', fontSize: '12px' }}>Tool Settings</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <label style={{ fontSize: '10px', minWidth: '60px' }}>Precision:</label>
              <input
                type="number"
                value={toolSettings.precision}
                onChange={(e) => onUpdateToolSettings({ precision: parseFloat(e.target.value) })}
                style={{
                  width: '60px',
                  padding: '2px',
                  fontSize: '10px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  borderRadius: '2px'
                }}
                step="0.1"
                min="0.01"
                max="1"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <label style={{ fontSize: '10px', minWidth: '60px' }}>Grid Size:</label>
              <input
                type="number"
                value={toolSettings.gridSize}
                onChange={(e) => onUpdateToolSettings({ gridSize: parseInt(e.target.value) })}
                style={{
                  width: '60px',
                  padding: '2px',
                  fontSize: '10px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  borderRadius: '2px'
                }}
                min="5"
                max="100"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <label style={{ fontSize: '10px', minWidth: '60px' }}>Tolerance:</label>
              <input
                type="number"
                value={toolSettings.snapTolerance}
                onChange={(e) => onUpdateToolSettings({ snapTolerance: parseInt(e.target.value) })}
                style={{
                  width: '60px',
                  padding: '2px',
                  fontSize: '10px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  borderRadius: '2px'
                }}
                min="1"
                max="50"
              />
            </div>
          </div>
        </div>
        
        {/* Status */}
        <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.7)' }}>
          <div>Grid: {showGrid ? 'ON' : 'OFF'}</div>
          <div>Guides: {showGuides ? 'ON' : 'OFF'}</div>
          <div>Snap: {snapToGrid ? 'Grid' : snapToPoints ? 'Points' : 'OFF'}</div>
        </div>
      </div>
    </Html>
  );
};

export default ShirtControls;
