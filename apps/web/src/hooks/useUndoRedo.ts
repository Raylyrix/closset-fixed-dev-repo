import { useEffect } from 'react';
import { useApp } from '../App';

/**
 * Hook to handle undo/redo keyboard shortcuts
 * Listens for Ctrl+Z (undo) and Ctrl+Y/Ctrl+Shift+Z (redo)
 */
export const useUndoRedo = () => {
  const { undo, redo, canUndo, canRedo } = useApp();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl key (or Cmd on Mac)
      const isCtrlPressed = event.ctrlKey || event.metaKey;
      
      if (isCtrlPressed) {
        console.log('⌨️ Ctrl key detected with key:', event.key);
        switch (event.key.toLowerCase()) {
          case 'z':
            if (event.shiftKey) {
              // Ctrl+Shift+Z = Redo
              console.log('⌨️ Ctrl+Shift+Z detected');
              event.preventDefault();
              if (canRedo()) {
                redo();
                console.log('🔄 Redo triggered via Ctrl+Shift+Z');
              } else {
                console.log('❌ Cannot redo - no redo available');
              }
            } else {
              // Ctrl+Z = Undo
              console.log('⌨️ Ctrl+Z detected');
              event.preventDefault();
              if (canUndo()) {
                undo();
                console.log('↩️ Undo triggered via Ctrl+Z');
              } else {
                console.log('❌ Cannot undo - no undo available');
              }
            }
            break;
          case 'y':
            // Ctrl+Y = Redo (alternative)
            console.log('⌨️ Ctrl+Y detected');
            event.preventDefault();
            if (canRedo()) {
              redo();
              console.log('🔄 Redo triggered via Ctrl+Y');
            } else {
              console.log('❌ Cannot redo - no redo available');
            }
            break;
        }
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo, canUndo, canRedo]);

  return {
    undo,
    redo,
    canUndo,
    canRedo
  };
};
