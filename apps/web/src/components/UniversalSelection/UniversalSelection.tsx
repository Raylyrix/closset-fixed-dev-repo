/**
 * 🎯 Universal Selection Component
 * 
 * Main component that integrates all selection functionality:
 * - Selection handles
 * - Context menu
 * - Selection box (marquee)
 * - Keyboard shortcuts
 * - Mouse interactions
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useUniversalSelection } from '../../stores/UniversalSelectionStore';
import { SelectionHandles } from './SelectionHandles';
import { ContextMenu } from './ContextMenu';
import { SelectionBox } from './SelectionBox';
import { UniversalElement, SelectionMode } from '../../types/UniversalSelection';

interface UniversalSelectionProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onElementSelect?: (element: UniversalElement) => void;
  onElementDeselect?: (elementId: string) => void;
  onSelectionChange?: (elements: UniversalElement[]) => void;
}

export function UniversalSelection({ 
  canvasRef, 
  onElementSelect,
  onElementDeselect,
  onSelectionChange 
}: UniversalSelectionProps) {
  const {
    selectedElements,
    selectedIds,
    hoveredElementId,
    selectionBox,
    isSelecting,
    selectionMode,
    multiSelectEnabled,
    selectElement,
    selectElements,
    deselectElement,
    deselectAll,
    toggleElement,
    startSelectionBox,
    updateSelectionBox,
    endSelectionBox,
    hitTest,
    hitTestMultiple,
    getSelectedElements
  } = useUniversalSelection();

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    elements: UniversalElement[];
  }>({
    visible: false,
    x: 0,
    y: 0,
    elements: []
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle mouse down events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDragging(true);
    setDragStart({ x, y });

    // Check if clicking on an element
    const clickedElement = hitTest(x, y);
    
    if (clickedElement) {
      // Handle element selection
      if (e.ctrlKey || e.metaKey) {
        // Toggle selection with Ctrl/Cmd
        toggleElement(clickedElement.id);
      } else if (e.shiftKey && selectedIds.size > 0) {
        // Add to selection with Shift
        selectElement(clickedElement.id, 'add');
      } else {
        // Replace selection
        selectElement(clickedElement.id, 'replace');
      }
      
      onElementSelect?.(clickedElement);
    } else {
      // Clicked on empty space - start selection box
      if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
        deselectAll();
      }
      startSelectionBox(x, y);
    }
  }, [
    canvasRef, 
    hitTest, 
    toggleElement, 
    selectElement, 
    selectedIds.size,
    deselectAll,
    startSelectionBox,
    onElementSelect
  ]);

  // Handle mouse move events
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isSelecting) {
      // Update selection box
      updateSelectionBox(x, y);
    }
  }, [isDragging, canvasRef, isSelecting, updateSelectionBox]);

  // Handle mouse up events
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    setIsDragging(false);

    if (isSelecting) {
      endSelectionBox();
    }
  }, [isDragging, isSelecting, endSelectionBox]);

  // Handle context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedElement = hitTest(x, y);
    const selectedElements = getSelectedElements();

    if (clickedElement && !selectedIds.has(clickedElement.id)) {
      // Select the clicked element if it's not already selected
      selectElement(clickedElement.id, 'replace');
    }

    // Show context menu with current selection
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      elements: getSelectedElements()
    });
  }, [
    canvasRef,
    hitTest,
    selectedIds,
    selectElement,
    getSelectedElements
  ]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default browser shortcuts when canvas is focused
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'a':
            e.preventDefault();
            // Select all elements
            console.log('Select all');
            break;
          case 'c':
            e.preventDefault();
            // Copy selected elements
            console.log('Copy elements');
            break;
          case 'v':
            e.preventDefault();
            // Paste elements
            console.log('Paste elements');
            break;
          case 'd':
            e.preventDefault();
            // Duplicate selected elements
            console.log('Duplicate elements');
            break;
          case 'g':
            e.preventDefault();
            // Group selected elements
            if (e.shiftKey) {
              console.log('Ungroup elements');
            } else {
              console.log('Group elements');
            }
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              console.log('Redo');
            } else {
              console.log('Undo');
            }
            break;
        }
      }

      // Delete key
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        const selectedElements = getSelectedElements();
        for (const element of selectedElements) {
          deselectElement(element.id);
        }
      }

      // Escape key
      if (e.key === 'Escape') {
        deselectAll();
        setContextMenu(prev => ({ ...prev, visible: false }));
      }

      // Arrow keys for nudging
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const selectedElements = getSelectedElements();
        if (selectedElements.length > 0) {
          const nudgeDistance = e.shiftKey ? 10 : 1;
          let deltaX = 0;
          let deltaY = 0;

          switch (e.key) {
            case 'ArrowUp':
              deltaY = -nudgeDistance;
              break;
            case 'ArrowDown':
              deltaY = nudgeDistance;
              break;
            case 'ArrowLeft':
              deltaX = -nudgeDistance;
              break;
            case 'ArrowRight':
              deltaX = nudgeDistance;
              break;
          }

          // Apply nudge to selected elements
          for (const element of selectedElements) {
            // This would update the element position
            console.log(`Nudge ${element.id} by ${deltaX}, ${deltaY}`);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [getSelectedElements, deselectElement, deselectAll]);

  // Notify parent of selection changes
  useEffect(() => {
    const selectedElements = getSelectedElements();
    onSelectionChange?.(selectedElements);
  }, [selectedIds, getSelectedElements, onSelectionChange]);

  // Close context menu when selection changes
  useEffect(() => {
    if (contextMenu.visible) {
      setContextMenu(prev => ({
        ...prev,
        visible: false
      }));
    }
  }, [selectedIds]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
    >
      {/* Selection Box */}
      <SelectionBox canvasRef={canvasRef} />

      {/* Selection Handles */}
      <SelectionHandles
        canvasRef={canvasRef}
        onTransformStart={(type, x, y) => {
          console.log('Transform start:', type, x, y);
        }}
        onTransformUpdate={(x, y) => {
          console.log('Transform update:', x, y);
        }}
        onTransformEnd={() => {
          console.log('Transform end');
        }}
      />

      {/* Context Menu */}
      <ContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        elements={contextMenu.elements}
        onClose={() => setContextMenu(prev => ({ ...prev, visible: false }))}
      />

      {/* Selection Info Overlay */}
      {(() => {
        const selectedCount = selectedIds.size;
        if (selectedCount === 0) return null;

        return (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: '#ffffff',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              pointerEvents: 'none',
              zIndex: 1000
            }}
          >
            {selectedCount} element{selectedCount !== 1 ? 's' : ''} selected
          </div>
        );
      })()}
    </div>
  );
}
