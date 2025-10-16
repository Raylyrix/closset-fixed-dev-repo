/**
 * 🎯 Universal Selection Box (Marquee Selection)
 * 
 * Drag-to-select multiple elements with visual feedback
 */

import React from 'react';
import { useUniversalSelection } from '../../stores/UniversalSelectionStore';

interface SelectionBoxProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export function SelectionBox({ canvasRef }: SelectionBoxProps) {
  const { 
    selectionBox, 
    isSelecting 
  } = useUniversalSelection();

  // Don't render if not selecting or no selection box
  if (!isSelecting || !selectionBox) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: selectionBox.x,
        top: selectionBox.y,
        width: selectionBox.width,
        height: selectionBox.height,
        border: '2px dashed #007acc',
        backgroundColor: 'rgba(0, 122, 204, 0.1)',
        pointerEvents: 'none',
        zIndex: 999,
        borderRadius: '2px'
      }}
    >
      {/* Selection box fill */}
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 122, 204, 0.05)',
          borderRadius: '2px'
        }}
      />
      
      {/* Corner indicators */}
      <div
        style={{
          position: 'absolute',
          top: '-4px',
          left: '-4px',
          width: '8px',
          height: '8px',
          backgroundColor: '#007acc',
          borderRadius: '50%',
          border: '2px solid #ffffff'
        }}
      />
      
      <div
        style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          width: '8px',
          height: '8px',
          backgroundColor: '#007acc',
          borderRadius: '50%',
          border: '2px solid #ffffff'
        }}
      />
      
      <div
        style={{
          position: 'absolute',
          bottom: '-4px',
          left: '-4px',
          width: '8px',
          height: '8px',
          backgroundColor: '#007acc',
          borderRadius: '50%',
          border: '2px solid #ffffff'
        }}
      />
      
      <div
        style={{
          position: 'absolute',
          bottom: '-4px',
          right: '-4px',
          width: '8px',
          height: '8px',
          backgroundColor: '#007acc',
          borderRadius: '50%',
          border: '2px solid #ffffff'
        }}
      />
    </div>
  );
}
