/**
 * Embroidery Tool - Integrated with 3D Model Painting
 * Configure embroidery settings - drawing happens directly on the 3D model
 */

import React, { useState } from 'react';
import { useApp } from '../App';

interface EmbroideryToolProps {
  onStitchAdd?: (stitch: any) => void;
  onPatternComplete?: (pattern: any) => void;
}

interface StitchTypeInfo {
  type: 'satin' | 'fill' | 'outline' | 'cross-stitch' | 'cross' | 'chain' | 'backstitch' | 
    'running' | 'running-stitch' | 'zigzag' | 'split' | 'fill_tatami' | 'seed' | 'french-knot' | 'french_knot' | 
    'couching' | 'blanket' | 'herringbone' | 'feather' | 'long_short_satin' | 'bullion';
  name: string;
  description: string;
  icon: string;
}

/**
 * Clean Embroidery Settings Panel
 */
export function SimpleEmbroideryTool({ onStitchAdd, onPatternComplete }: EmbroideryToolProps) {
  const [showInstructions, setShowInstructions] = useState(true);

  // Stitch type definitions (all types from StitchCatalog.js)
  const stitchTypes: StitchTypeInfo[] = [
    { type: 'satin', name: 'Satin', description: 'Smooth parallel fill', icon: '∥' },
    { type: 'fill', name: 'Fill', description: 'Dense area coverage', icon: '▉' },
    { type: 'fill_tatami', name: 'Tatami Fill', description: 'Traditional Japanese fill', icon: '◫' },
    { type: 'long_short_satin', name: 'Long & Short', description: 'Blended satin fill', icon: '≋' },
    { type: 'running', name: 'Running', description: 'Basic running stitch', icon: '⋯' },
    { type: 'backstitch', name: 'Backstitch', description: 'Strong outline stitch', icon: '↔' },
    { type: 'outline', name: 'Outline', description: 'Single line outlines', icon: '━' },
    { type: 'cross', name: 'Cross', description: 'Traditional cross stitch', icon: '✕' },
    { type: 'chain', name: 'Chain', description: 'Looped chain stitches', icon: '○' },
    { type: 'split', name: 'Split', description: 'Split thread stitch', icon: '⊢' },
    { type: 'zigzag', name: 'Zig-Zag', description: 'Zigzag pattern', icon: '〰' },
    { type: 'french_knot', name: 'French Knot', description: 'Raised decorative knot', icon: '●' },
    { type: 'seed', name: 'Seed', description: 'Random seed filling', icon: '∴' },
    { type: 'couching', name: 'Couching', description: 'Laid thread couching', icon: '⊡' },
    { type: 'blanket', name: 'Blanket', description: 'Blanket edge stitch', icon: '⊏' },
    { type: 'herringbone', name: 'Herringbone', description: 'Crossed diagonal', icon: '⋈' },
    { type: 'feather', name: 'Feather', description: 'Branching feather stitch', icon: '⋔' },
    { type: 'bullion', name: 'Bullion', description: 'Wrapped coil stitch', icon: '⊙' }
  ];

  // Get embroidery settings from useApp store
  const {
    embroideryStitchType = 'satin',
    embroideryThreadColor = '#ff0000',
    embroideryThreadThickness = 0.5,
    embroiderySpacing = 2.0,
    embroideryDensity = 1.0,
    embroideryAngle = 0,
    embroideryScale = 1.0,
    setEmbroideryStitches,
    setEmbroideryStitchType,
    setEmbroideryThreadColor,
    setEmbroideryThreadThickness,
    setEmbroiderySpacing,
    setEmbroideryDensity,
    setEmbroideryAngle,
    setEmbroideryScale
  } = useApp(state => ({
    embroideryStitchType: state.embroideryStitchType,
    embroideryThreadColor: state.embroideryThreadColor,
    embroideryThreadThickness: state.embroideryThreadThickness,
    embroiderySpacing: state.embroiderySpacing,
    embroideryDensity: state.embroideryDensity,
    embroideryAngle: state.embroideryAngle,
    embroideryScale: state.embroideryScale,
    setEmbroideryStitches: state.setEmbroideryStitches,
    setEmbroideryStitchType: state.setEmbroideryStitchType,
    setEmbroideryThreadColor: state.setEmbroideryThreadColor,
    setEmbroideryThreadThickness: state.setEmbroideryThreadThickness,
    setEmbroiderySpacing: state.setEmbroiderySpacing,
    setEmbroideryDensity: state.setEmbroideryDensity,
    setEmbroideryAngle: state.setEmbroideryAngle,
    setEmbroideryScale: state.setEmbroideryScale
  }));

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#1a1a1a',
      color: 'white'
    }}>

      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderBottom: '2px solid #4a5568'
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🧵 Embroidery Tool
        </h2>
        <p style={{
          margin: '4px 0 0 0',
          fontSize: '12px',
          opacity: 0.8
        }}>
          Configure embroidery settings - drawing happens directly on the 3D model
        </p>
      </div>

      {/* Instructions */}
      {showInstructions && (
        <div style={{
          padding: '16px 20px',
          background: 'rgba(102, 126, 234, 0.1)',
          borderBottom: '1px solid #4a5568'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '24px' }}>💡</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                How to use Embroidery Tool
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                Select the embroidery tool, then click and drag directly on the 3D model to create embroidery stitches.
                The stitches will appear as 3D threads on the model surface.
              </div>
            </div>
            <button
              onClick={() => setShowInstructions(false)}
              style={{
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
                marginLeft: 'auto'
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto'
      }}>

        {/* Stitch Type Selection */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#e2e8f0' }}>
            Stitch Type
          </h3>
          <div style={{ display: 'grid', gap: '8px' }}>
            {stitchTypes.map((stitch) => (
              <button
                key={stitch.type}
                onClick={() => {
                  if (setEmbroideryStitchType) {
                    setEmbroideryStitchType(stitch.type);
                  }
                  console.log('Selected stitch type:', stitch.type);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px',
                  background: embroideryStitchType === stitch.type ? '#667eea' : '#4a5568',
                  border: '1px solid #718096',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '16px' }}>{stitch.icon}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{stitch.name}</div>
                  <div style={{ fontSize: '10px', opacity: 0.7 }}>{stitch.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Thread Settings */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#e2e8f0' }}>
            Thread Settings
          </h3>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#a0aec0' }}>
              Color
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="color"
                value={embroideryThreadColor}
                onChange={(e) => {
                  if (setEmbroideryThreadColor) {
                    setEmbroideryThreadColor(e.target.value);
                  }
                  console.log('Thread color changed:', e.target.value);
                }}
                style={{
                  width: '40px',
                  height: '32px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                {embroideryThreadColor.toUpperCase()}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#a0aec0' }}>
              Thickness: {embroideryThreadThickness.toFixed(1)}mm
            </label>
            <input
              type="range"
              min={0.1}
              max={2}
              step={0.1}
              value={embroideryThreadThickness}
              onChange={(e) => {
                if (setEmbroideryThreadThickness) {
                  setEmbroideryThreadThickness(Number(e.target.value));
                }
                console.log('Thread thickness changed:', e.target.value);
              }}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#a0aec0' }}>
              Spacing: {embroiderySpacing.toFixed(1)}mm
            </label>
            <input
              type="range"
              min={0.5}
              max={10}
              step={0.1}
              value={embroiderySpacing}
              onChange={(e) => {
                if (setEmbroiderySpacing) {
                  setEmbroiderySpacing(Number(e.target.value));
                }
                console.log('Spacing changed:', e.target.value);
              }}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Pattern Settings */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#e2e8f0' }}>
            Pattern Settings
          </h3>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#a0aec0' }}>
              Density: {Math.round(embroideryDensity * 100)}%
            </label>
            <input
              type="range"
              min={0.1}
              max={2}
              step={0.1}
              value={embroideryDensity}
              onChange={(e) => {
                if (setEmbroideryDensity) {
                  setEmbroideryDensity(Number(e.target.value));
                }
                console.log('Density changed:', e.target.value);
              }}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#a0aec0' }}>
              Angle: {embroideryAngle}°
            </label>
            <input
              type="range"
              min={-180}
              max={180}
              step={5}
              value={embroideryAngle}
              onChange={(e) => {
                if (setEmbroideryAngle) {
                  setEmbroideryAngle(Number(e.target.value));
                }
                console.log('Angle changed:', e.target.value);
              }}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#a0aec0' }}>
              Scale: {embroideryScale.toFixed(1)}x
            </label>
            <input
              type="range"
              min={0.1}
              max={3}
              step={0.1}
              value={embroideryScale}
              onChange={(e) => {
                if (setEmbroideryScale) {
                  setEmbroideryScale(Number(e.target.value));
                }
                console.log('Scale changed:', e.target.value);
              }}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#e2e8f0' }}>
            Actions
          </h3>

          <button
            onClick={() => {
              // Clear all stitches from store
              if (setEmbroideryStitches) {
                setEmbroideryStitches([]);
              }
              console.log('Cleared all embroidery stitches');
            }}
            style={{
              width: '100%',
              padding: '10px',
              background: '#e53e3e',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              marginBottom: '8px'
            }}
          >
            🗑️ Clear All Stitches
          </button>
        </div>

        {/* Info */}
        <div style={{
          background: '#1a202c',
          padding: '12px',
          borderRadius: '6px',
          fontSize: '11px'
        }}>
          <div style={{ color: '#a0aec0', marginBottom: '4px' }}>How it works</div>
          <div>• Click and drag on the 3D model to draw embroidery paths</div>
          <div>• Stitches are automatically converted to 3D threads</div>
          <div>• Threads follow the model surface contours</div>
          <div>• Adjust settings to control thread appearance</div>
        </div>
      </div>
    </div>
  );
}

export default SimpleEmbroideryTool;