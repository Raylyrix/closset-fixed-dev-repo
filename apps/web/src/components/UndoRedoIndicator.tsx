import React from 'react';
import { useApp } from '../App';

/**
 * Undo/Redo Status Indicator Component
 * Shows the current undo/redo state and available actions
 */
export const UndoRedoIndicator: React.FC = () => {
  const { canUndo, canRedo, history, historyIndex } = useApp();

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 1000,
      pointerEvents: 'none'
    }}>
      <div style={{ marginBottom: '4px' }}>
        <span style={{ color: canUndo() ? '#4CAF50' : '#666' }}>
          ↩️ Undo {canUndo() ? '(Ctrl+Z)' : ''}
        </span>
      </div>
      <div>
        <span style={{ color: canRedo() ? '#4CAF50' : '#666' }}>
          ↪️ Redo {canRedo() ? '(Ctrl+Y)' : ''}
        </span>
      </div>
      <div style={{ marginTop: '4px', fontSize: '10px', color: '#999' }}>
        History: {historyIndex + 1}/{history.length}
      </div>
    </div>
  );
};

