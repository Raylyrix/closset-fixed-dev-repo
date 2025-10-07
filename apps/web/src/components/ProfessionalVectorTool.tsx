/**
 * Clean Vector Tool - Modern, User-Friendly Vector Drawing Interface
 * 
 * Features:
 * - Simple, intuitive design
 * - Essential tools only
 * - Clean color scheme
 * - Easy to use
 */

import React, { useState } from 'react';
import { useApp } from '../App';

export function ProfessionalVectorTool() {
  const {
    vectorPaths,
    activePathId,
    vectorStrokeColor,
    vectorStrokeWidth,
    vectorFillColor,
    vectorFill,
    setVectorStrokeColor,
    setVectorStrokeWidth,
    setVectorFillColor,
    setVectorFill,
    clearVectorPaths,
    selectedAnchor,
    vectorEditMode,
    setSelectedAnchor,
    setVectorEditMode
  } = useApp(state => ({
    vectorPaths: state.vectorPaths,
    activePathId: state.activePathId,
    vectorStrokeColor: state.vectorStrokeColor,
    vectorStrokeWidth: state.vectorStrokeWidth,
    vectorFillColor: state.vectorFillColor,
    vectorFill: state.vectorFill,
    setVectorStrokeColor: state.setVectorStrokeColor,
    setVectorStrokeWidth: state.setVectorStrokeWidth,
    setVectorFillColor: state.setVectorFillColor,
    setVectorFill: state.setVectorFill,
    clearVectorPaths: state.clearVectorPaths,
    selectedAnchor: state.selectedAnchor,
    vectorEditMode: state.vectorEditMode,
    setSelectedAnchor: state.setSelectedAnchor,
    setVectorEditMode: state.setVectorEditMode
  }));

  const [isMinimized, setIsMinimized] = useState(false);

  const activePath = vectorPaths.find(p => p.id === activePathId);

  const completePath = () => {
    if (activePath && activePath.points.length >= 2) {
      useApp.setState({ activePathId: null });
    }
  };

  const clearAll = () => {
    useApp.getState().clearVectorPaths();
  };

  const tools = [
    { id: 'pen', name: 'Pen', icon: '✏️', desc: 'Add anchors' },
    { id: 'select', name: 'Select', icon: '👆', desc: 'Select anchors' },
    { id: 'move', name: 'Move', icon: '↔️', desc: 'Move anchors' },
    { id: 'curve', name: 'Curve', icon: '〰️', desc: 'Edit curves' }
  ];

  if (isMinimized) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        borderRadius: '12px',
        padding: '12px 16px',
        color: 'white',
        cursor: 'pointer',
        zIndex: 1000,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s ease'
      }}
      onClick={() => setIsMinimized(false)}
      >
        <span style={{ fontSize: '16px' }}>✏️</span>
        <span style={{ fontWeight: '600' }}>Vector Tools</span>
        {activePath && (
          <span style={{ 
            fontSize: '11px', 
            opacity: 0.8,
            background: 'rgba(255,255,255,0.2)',
            padding: '2px 6px',
            borderRadius: '10px'
          }}>
            {activePath.points.length}
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '280px',
      maxHeight: '80vh',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '16px',
      color: '#2d3748',
      overflow: 'hidden',
      zIndex: 1000,
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h3 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ✏️ Vector Tools
          </h3>
          <p style={{
            margin: '2px 0 0 0',
            fontSize: '11px',
            opacity: 0.9
          }}>
            Draw on 3D model
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => useApp.getState().setTool('brush')}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              padding: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
            title="Exit Vector Tools"
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            ✕
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              padding: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
            title="Minimize"
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            −
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        fontSize: '14px'
      }}>
        
        {/* Tool Selection */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '13px',
            fontWeight: '600',
            color: '#4a5568',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Tools
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {tools.map(tool => (
              <button
                key={tool.id}
                onClick={() => setVectorEditMode(tool.id as any)}
                style={{
                  background: vectorEditMode === tool.id ? '#667eea' : '#f7fafc',
                  border: vectorEditMode === tool.id ? 'none' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  color: vectorEditMode === tool.id ? 'white' : '#4a5568',
                  padding: '12px 8px',
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
                  if (vectorEditMode !== tool.id) {
                    e.currentTarget.style.background = '#edf2f7';
                  }
                }}
                onMouseLeave={(e) => {
                  if (vectorEditMode !== tool.id) {
                    e.currentTarget.style.background = '#f7fafc';
                  }
                }}
              >
                <span style={{ fontSize: '16px' }}>{tool.icon}</span>
                <span>{tool.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stroke Settings */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '13px',
            fontWeight: '600',
            color: '#4a5568',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Stroke
          </h4>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              color: '#718096',
              marginBottom: '6px'
            }}>
              Color
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="color"
                value={vectorStrokeColor}
                onChange={(e) => setVectorStrokeColor(e.target.value)}
                style={{
                  width: '32px',
                  height: '32px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: 'none'
                }}
              />
              <input
                type="text"
                value={vectorStrokeColor}
                onChange={(e) => setVectorStrokeColor(e.target.value)}
                style={{
                  background: '#f7fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  color: '#4a5568',
                  padding: '8px 12px',
                  fontSize: '12px',
                  flex: 1,
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              color: '#718096',
              marginBottom: '6px'
            }}>
              Width: {vectorStrokeWidth}px
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={vectorStrokeWidth}
              onChange={(e) => setVectorStrokeWidth(parseInt(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#667eea'
              }}
            />
          </div>
        </div>

        {/* Fill Settings */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '13px',
            fontWeight: '600',
            color: '#4a5568',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Fill
          </h4>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <input
              type="checkbox"
              checked={vectorFill}
              onChange={(e) => setVectorFill(e.target.checked)}
              style={{ accentColor: '#667eea' }}
            />
            <label style={{
              fontSize: '12px',
              fontWeight: '500',
              color: '#4a5568',
              cursor: 'pointer'
            }}>
              Enable Fill
            </label>
          </div>

          {vectorFill && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '500',
                color: '#718096',
                marginBottom: '6px'
              }}>
                Fill Color
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={vectorFillColor}
                  onChange={(e) => setVectorFillColor(e.target.value)}
                  style={{
                    width: '32px',
                    height: '32px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: 'none'
                  }}
                />
                <input
                  type="text"
                  value={vectorFillColor}
                  onChange={(e) => setVectorFillColor(e.target.value)}
                  style={{
                    background: '#f7fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    color: '#4a5568',
                    padding: '8px 12px',
                    fontSize: '12px',
                    flex: 1,
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Status */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '13px',
            fontWeight: '600',
            color: '#4a5568',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Status
          </h4>
          
          <div style={{
            background: '#f7fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '12px'
          }}>
            <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>
              Active Tool: <strong style={{ color: '#4a5568' }}>{vectorEditMode}</strong>
            </div>
            <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>
              Paths: <strong style={{ color: '#4a5568' }}>{vectorPaths.length}</strong>
            </div>
            {activePath && (
              <div style={{ fontSize: '12px', color: '#718096' }}>
                Active Path: <strong style={{ color: '#4a5568' }}>{activePath.points.length} anchors</strong>
              </div>
            )}
            {selectedAnchor && (
              <div style={{ fontSize: '12px', color: '#718096' }}>
                Selected: <strong style={{ color: '#4a5568' }}>Anchor {selectedAnchor.anchorIndex}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '13px',
            fontWeight: '600',
            color: '#4a5568',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Actions
          </h4>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {activePath && (
              <button
                onClick={completePath}
                style={{
                  background: '#48bb78',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  padding: '10px 16px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  flex: 1,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#38a169'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#48bb78'}
              >
                ✓ Complete
              </button>
            )}
            <button
              onClick={clearAll}
              disabled={vectorPaths.length === 0}
              style={{
                background: vectorPaths.length === 0 ? '#e2e8f0' : '#f56565',
                border: 'none',
                borderRadius: '8px',
                color: vectorPaths.length === 0 ? '#a0aec0' : 'white',
                padding: '10px 16px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: vectorPaths.length === 0 ? 'not-allowed' : 'pointer',
                flex: 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (vectorPaths.length > 0) {
                  e.currentTarget.style.background = '#e53e3e';
                }
              }}
              onMouseLeave={(e) => {
                if (vectorPaths.length > 0) {
                  e.currentTarget.style.background = '#f56565';
                }
              }}
            >
              🗑️ Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfessionalVectorTool;