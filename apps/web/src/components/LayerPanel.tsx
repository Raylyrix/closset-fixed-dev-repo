/**
 * Professional Layer Panel Component
 * Industry-standard layer management with drag-drop, grouping, and effects
 */

import React, { useState, useRef, useCallback } from 'react';
import { useLayerManager } from '../stores/LayerManager';
import { Layer, LayerType, BlendMode } from '../types/LayerSystem';

interface LayerPanelProps {
  className?: string;
}

export function LayerPanel({ className }: LayerPanelProps) {
  const {
    layers,
    layerOrder,
    activeLayerId,
    selectedLayerIds,
    groups,
    expandedGroups,
    createLayer,
    deleteLayer,
    duplicateLayer,
    renameLayer,
    setLayerVisible,
    setLayerLocked,
    setLayerOpacity,
    setLayerBlendMode,
    setActiveLayer,
    moveLayer,
    moveLayerUp,
    moveLayerDown,
    bringToFront,
    sendToBack,
    createGroup,
    addToGroup,
    removeFromGroup,
    deleteGroup,
    toggleGroupExpanded,
    selectLayer,
    selectMultipleLayers,
    clearSelection,
    mergeLayers,
    flattenLayers,
    rasterizeLayer
  } = useLayerManager();

  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);
  const [dragOverLayerId, setDragOverLayerId] = useState<string | null>(null);
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showLayerMenu, setShowLayerMenu] = useState<string | null>(null);
  const [showBlendModeMenu, setShowBlendModeMenu] = useState<string | null>(null);
  const [showOpacitySlider, setShowOpacitySlider] = useState<string | null>(null);

  const dragRef = useRef<HTMLDivElement>(null);

  const blendModes: BlendMode[] = [
    'normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light',
    'color-dodge', 'color-burn', 'darken', 'lighten', 'difference', 'exclusion',
    'hue', 'saturation', 'color', 'luminosity'
  ];

  const getLayerIcon = (type: LayerType) => {
    switch (type) {
      case 'raster': return '🖌️';
      case 'vector': return '📐';
      case 'text': return '📝';
      case 'group': return '📁';
      case 'smart': return '🧠';
      case 'adjustment': return '🎛️';
      case 'effect': return '✨';
      case 'mask': return '🎭';
      case 'puff': return '☁️';
      case 'embroidery': return '🧵';
      default: return '📄';
    }
  };

  const handleDragStart = (e: React.DragEvent, layerId: string) => {
    setDraggedLayerId(layerId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', layerId);
  };

  const handleDragOver = (e: React.DragEvent, layerId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverLayerId(layerId);
  };

  const handleDragLeave = () => {
    setDragOverLayerId(null);
  };

  const handleDrop = (e: React.DragEvent, targetLayerId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    
    if (draggedId && draggedId !== targetLayerId) {
      const targetIndex = layerOrder.indexOf(targetLayerId);
      moveLayer(draggedId, targetIndex);
    }
    
    setDraggedLayerId(null);
    setDragOverLayerId(null);
  };

  const handleLayerClick = (e: React.MouseEvent, layerId: string) => {
    if (e.ctrlKey || e.metaKey) {
      // Multi-select
      if (selectedLayerIds.includes(layerId)) {
        selectMultipleLayers(selectedLayerIds.filter(id => id !== layerId));
      } else {
        selectMultipleLayers([...selectedLayerIds, layerId]);
      }
    } else {
      // Single select
      selectLayer(layerId);
    }
    setActiveLayer(layerId);
  };

  const handleLayerDoubleClick = (layerId: string) => {
    const layer = layers.get(layerId);
    if (layer) {
      setEditingLayerId(layerId);
      setEditingName(layer.name);
    }
  };

  const handleRenameSubmit = () => {
    if (editingLayerId && editingName.trim()) {
      renameLayer(editingLayerId, editingName.trim());
    }
    setEditingLayerId(null);
    setEditingName('');
  };

  const handleRenameCancel = () => {
    setEditingLayerId(null);
    setEditingName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      handleRenameCancel();
    }
  };

  const handleLayerMenu = (e: React.MouseEvent, layerId: string) => {
    e.stopPropagation();
    setShowLayerMenu(showLayerMenu === layerId ? null : layerId);
  };

  const handleOpacityChange = (layerId: string, opacity: number) => {
    setLayerOpacity(layerId, opacity / 100);
  };

  const renderLayerItem = (layerId: string) => {
    const layer = layers.get(layerId);
    if (!layer) return null;

    const isActive = activeLayerId === layerId;
    const isSelected = selectedLayerIds.includes(layerId);
    const isDragging = draggedLayerId === layerId;
    const isDragOver = dragOverLayerId === layerId;
    const isEditing = editingLayerId === layerId;

    return (
      <div
        key={layerId}
        ref={dragRef}
        draggable
        onDragStart={(e) => handleDragStart(e, layerId)}
        onDragOver={(e) => handleDragOver(e, layerId)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, layerId)}
        onClick={(e) => handleLayerClick(e, layerId)}
        onDoubleClick={() => handleLayerDoubleClick(layerId)}
        style={{
          padding: '8px 12px',
          background: isActive 
            ? '#000000' 
            : isSelected 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'transparent',
          border: isActive ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
          borderRadius: '6px',
          marginBottom: '2px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          opacity: isDragging ? 0.5 : 1,
          transform: isDragOver ? 'translateY(2px)' : 'translateY(0)',
          boxShadow: isDragOver ? '0 4px 12px rgba(0, 0, 0, 0.3)' : 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          position: 'relative'
        }}
      >
        {/* Layer Icon */}
        <div style={{
          fontSize: '16px',
          opacity: layer.visible ? 1 : 0.5,
          filter: layer.locked ? 'grayscale(100%)' : 'none'
        }}>
          {getLayerIcon(layer.type)}
        </div>

        {/* Layer Name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {isEditing ? (
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleKeyDown}
              autoFocus
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                padding: '4px 8px',
                color: '#ffffff',
                fontSize: '12px',
                width: '100%',
                outline: 'none'
              }}
            />
          ) : (
            <div style={{
              fontSize: '12px',
              fontWeight: isActive ? '600' : '400',
              color: isActive ? '#ffffff' : '#a0aec0',
              opacity: layer.visible ? 1 : 0.5,
              textDecoration: layer.locked ? 'line-through' : 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {layer.name}
            </div>
          )}
        </div>

        {/* Layer Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Visibility Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLayerVisible(layerId, !layer.visible);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: layer.visible ? '#FFFFFF' : '#6b7280',
              cursor: 'pointer',
              padding: '2px',
              borderRadius: '2px',
              fontSize: '12px'
            }}
            title={layer.visible ? 'Hide Layer' : 'Show Layer'}
          >
            {layer.visible ? '👁️' : '🙈'}
          </button>

          {/* Lock Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLayerLocked(layerId, !layer.locked);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: layer.locked ? '#FFFFFF' : '#6b7280',
              cursor: 'pointer',
              padding: '2px',
              borderRadius: '2px',
              fontSize: '12px'
            }}
            title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
          >
            {layer.locked ? '🔒' : '🔓'}
          </button>

          {/* Opacity Control */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowOpacitySlider(showOpacitySlider === layerId ? null : layerId);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#a0aec0',
                cursor: 'pointer',
                padding: '2px',
                borderRadius: '2px',
                fontSize: '10px',
                minWidth: '24px'
              }}
              title={`Opacity: ${Math.round(layer.opacity * 100)}%`}
            >
              {Math.round(layer.opacity * 100)}%
            </button>
            
            {showOpacitySlider === layerId && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                background: 'rgba(0, 0, 0, 0.9)',
                border: '1px solid #333',
                borderRadius: '4px',
                padding: '8px',
                zIndex: 1000,
                minWidth: '120px'
              }}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={layer.opacity * 100}
                  onChange={(e) => handleOpacityChange(layerId, parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            )}
          </div>

          {/* Blend Mode */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowBlendModeMenu(showBlendModeMenu === layerId ? null : layerId);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#a0aec0',
                cursor: 'pointer',
                padding: '2px 4px',
                borderRadius: '2px',
                fontSize: '10px',
                minWidth: '40px'
              }}
              title={`Blend Mode: ${layer.blendMode}`}
            >
              {layer.blendMode}
            </button>
            
            {showBlendModeMenu === layerId && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                background: 'rgba(0, 0, 0, 0.9)',
                border: '1px solid #333',
                borderRadius: '4px',
                padding: '4px',
                zIndex: 1000,
                minWidth: '120px',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {blendModes.map(mode => (
                  <button
                    key={mode}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLayerBlendMode(layerId, mode);
                      setShowBlendModeMenu(null);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      background: mode === layer.blendMode ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                      border: 'none',
                      color: '#a0aec0',
                      padding: '4px 8px',
                      textAlign: 'left',
                      fontSize: '10px',
                      cursor: 'pointer',
                      borderRadius: '2px'
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Layer Menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={(e) => handleLayerMenu(e, layerId)}
              style={{
                background: 'none',
                border: 'none',
                color: '#a0aec0',
                cursor: 'pointer',
                padding: '2px',
                borderRadius: '2px',
                fontSize: '12px'
              }}
              title="Layer Options"
            >
              ⋮
            </button>
            
            {showLayerMenu === layerId && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                background: 'rgba(0, 0, 0, 0.9)',
                border: '1px solid #333',
                borderRadius: '4px',
                padding: '4px',
                zIndex: 1000,
                minWidth: '140px'
              }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateLayer(layerId);
                    setShowLayerMenu(null);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: '#a0aec0',
                    padding: '6px 8px',
                    textAlign: 'left',
                    fontSize: '11px',
                    cursor: 'pointer',
                    borderRadius: '2px'
                  }}
                >
                  📋 Duplicate Layer
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveLayerUp(layerId);
                    setShowLayerMenu(null);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: '#a0aec0',
                    padding: '6px 8px',
                    textAlign: 'left',
                    fontSize: '11px',
                    cursor: 'pointer',
                    borderRadius: '2px'
                  }}
                >
                  ⬆️ Move Up
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveLayerDown(layerId);
                    setShowLayerMenu(null);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: '#a0aec0',
                    padding: '6px 8px',
                    textAlign: 'left',
                    fontSize: '11px',
                    cursor: 'pointer',
                    borderRadius: '2px'
                  }}
                >
                  ⬇️ Move Down
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    rasterizeLayer(layerId);
                    setShowLayerMenu(null);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: '#a0aec0',
                    padding: '6px 8px',
                    textAlign: 'left',
                    fontSize: '11px',
                    cursor: 'pointer',
                    borderRadius: '2px'
                  }}
                >
                  🖼️ Rasterize
                </button>
                <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '4px 0' }} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteLayer(layerId);
                    setShowLayerMenu(null);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '6px 8px',
                    textAlign: 'left',
                    fontSize: '11px',
                    cursor: 'pointer',
                    borderRadius: '2px'
                  }}
                >
                  🗑️ Delete Layer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={className} style={{
      width: '100%',
      height: '100%',
      background: '#000000',
      borderLeft: '1px solid rgba(99, 102, 241, 0.3)',
      display: 'flex',
      flexDirection: 'column',
      fontSize: '11px',
      boxShadow: '-2px 0 20px rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(10px)'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px',
        borderBottom: '1px solid rgba(99, 102, 241, 0.3)',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          fontSize: '11px',
          color: '#a0aec0',
          fontWeight: '700',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
        }}>
          🎨 Layers
        </div>
        
        {/* Layer Actions */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
          <button
            onClick={() => createLayer('raster', 'New Layer')}
            style={{
              padding: '6px 10px',
              fontSize: '10px',
              fontWeight: '600',
              background: '#000000',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(255, 255, 255, 0.2)'
            }}
            title="Add New Layer"
          >
            + Layer
          </button>
          
          <button
            onClick={() => createLayer('group', 'New Group')}
            style={{
              padding: '6px 10px',
              fontSize: '10px',
              fontWeight: '600',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            title="Add New Group"
          >
            📁 Group
          </button>
        </div>
      </div>

      {/* Layer List */}
      <div style={{
        flex: 1,
        padding: '8px',
        overflowY: 'auto',
        background: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(10px)'
      }}>
        {layerOrder.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '12px',
            padding: '20px',
            fontStyle: 'italic'
          }}>
            No layers yet. Create your first layer!
          </div>
        ) : (
          layerOrder.map(layerId => renderLayerItem(layerId))
        )}
      </div>

      {/* Footer Actions */}
      <div style={{
        padding: '8px',
        borderTop: '1px solid rgba(99, 102, 241, 0.3)',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => {
              if (selectedLayerIds.length > 1) {
                mergeLayers(selectedLayerIds);
                clearSelection();
              }
            }}
            disabled={selectedLayerIds.length < 2}
            style={{
              flex: 1,
              padding: '6px 8px',
              fontSize: '10px',
              fontWeight: '600',
              background: selectedLayerIds.length >= 2 
                ? '#000000' 
                : 'rgba(255, 255, 255, 0.05)',
              color: selectedLayerIds.length >= 2 ? '#FFFFFF' : '#6b7280',
              border: 'none',
              borderRadius: '4px',
              cursor: selectedLayerIds.length >= 2 ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease'
            }}
            title="Merge Selected Layers"
          >
            🔗 Merge
          </button>
          
          <button
            onClick={() => flattenLayers()}
            style={{
              flex: 1,
              padding: '6px 8px',
              fontSize: '10px',
              fontWeight: '600',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            title="Flatten All Layers"
          >
            📄 Flatten
          </button>
        </div>
      </div>
    </div>
  );
}
