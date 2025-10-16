/**
 * 🎯 Universal Selection Handles Component
 * 
 * Renders selection handles, transform controls, and visual feedback
 * for selected elements across all element types
 */

import React, { useRef, useEffect, useState } from 'react';
import { useUniversalSelection } from '../../stores/UniversalSelectionStore';
import { UniversalElement, TransformType } from '../../types/UniversalSelection';

interface SelectionHandlesProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onTransformStart?: (type: TransformType, x: number, y: number) => void;
  onTransformUpdate?: (x: number, y: number) => void;
  onTransformEnd?: () => void;
}

interface HandlePosition {
  x: number;
  y: number;
  type: 'corner' | 'edge' | 'rotation';
  cursor: string;
  anchor: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | 'rotation';
}

export function SelectionHandles({ 
  canvasRef, 
  onTransformStart, 
  onTransformUpdate, 
  onTransformEnd 
}: SelectionHandlesProps) {
  const { 
    selectedElements, 
    selectedIds, 
    isTransforming, 
    transformType,
    getSelectedElements,
    getSelectionBounds,
    startTransform,
    updateTransform,
    endTransform
  } = useUniversalSelection();

  const [handles, setHandles] = useState<HandlePosition[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragHandle, setDragHandle] = useState<string | null>(null);

  // Update handles when selection changes
  useEffect(() => {
    const selectedElements = getSelectedElements();
    if (selectedElements.length === 0) {
      setHandles([]);
      return;
    }

    const bounds = getSelectionBounds();
    if (!bounds) {
      setHandles([]);
      return;
    }

    const newHandles: HandlePosition[] = [];

    // Corner handles
    newHandles.push(
      { x: bounds.x, y: bounds.y, type: 'corner', cursor: 'nw-resize', anchor: 'nw' },
      { x: bounds.x + bounds.width, y: bounds.y, type: 'corner', cursor: 'ne-resize', anchor: 'ne' },
      { x: bounds.x, y: bounds.y + bounds.height, type: 'corner', cursor: 'sw-resize', anchor: 'sw' },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height, type: 'corner', cursor: 'se-resize', anchor: 'se' }
    );

    // Edge handles
    newHandles.push(
      { x: bounds.x + bounds.width / 2, y: bounds.y, type: 'edge', cursor: 'n-resize', anchor: 'n' },
      { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height, type: 'edge', cursor: 's-resize', anchor: 's' },
      { x: bounds.x, y: bounds.y + bounds.height / 2, type: 'edge', cursor: 'w-resize', anchor: 'w' },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2, type: 'edge', cursor: 'e-resize', anchor: 'e' }
    );

    // Rotation handle (above the selection)
    const rotationHandleY = bounds.y - 30;
    newHandles.push({
      x: bounds.x + bounds.width / 2,
      y: rotationHandleY,
      type: 'rotation',
      cursor: 'grab',
      anchor: 'rotation'
    });

    setHandles(newHandles);
  }, [selectedElements, selectedIds, isTransforming]);

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent, handle: HandlePosition) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragHandle(handle.anchor);

    // Set cursor based on handle type
    document.body.style.cursor = handle.cursor;

    // Determine transform type
    let transformType: TransformType = null;
    if (handle.type === 'rotation') {
      transformType = 'rotate';
    } else if (handle.type === 'corner' || handle.type === 'edge') {
      transformType = 'scale';
    }

    if (transformType) {
      startTransform(transformType, e.clientX, e.clientY);
      onTransformStart?.(transformType, e.clientX, e.clientY);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragHandle) return;

    updateTransform(e.clientX, e.clientY);
    onTransformUpdate?.(e.clientX, e.clientY);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;

    setIsDragging(false);
    setDragHandle(null);
    document.body.style.cursor = 'default';

    endTransform();
    onTransformEnd?.();
  };

  // Add event listeners for mouse events
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!dragHandle) return;
      updateTransform(e.clientX, e.clientY);
      onTransformUpdate?.(e.clientX, e.clientY);
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;
      setIsDragging(false);
      setDragHandle(null);
      document.body.style.cursor = 'default';
      endTransform();
      onTransformEnd?.();
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragHandle, updateTransform, endTransform, onTransformUpdate, onTransformEnd]);

  // Don't render if no selection
  if (handles.length === 0) return null;

  return (
    <div
      className="selection-handles-overlay"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000
      }}
    >
      {/* Selection outline */}
      {(() => {
        const bounds = getSelectionBounds();
        if (!bounds) return null;

        return (
          <div
            style={{
              position: 'absolute',
              left: bounds.x,
              top: bounds.y,
              width: bounds.width,
              height: bounds.height,
              border: '2px solid #007acc',
              borderRadius: '2px',
              pointerEvents: 'none',
              boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.3)'
            }}
          />
        );
      })()}

      {/* Rotation handle connecting line */}
      {(() => {
        const bounds = getSelectionBounds();
        if (!bounds) return null;

        return (
          <div
            style={{
              position: 'absolute',
              left: bounds.x + bounds.width / 2,
              top: bounds.y + bounds.height,
              width: '2px',
              height: '30px',
              backgroundColor: '#007acc',
              pointerEvents: 'none'
            }}
          />
        );
      })()}

      {/* Handles */}
      {handles.map((handle, index) => (
        <div
          key={`${handle.anchor}-${index}`}
          style={{
            position: 'absolute',
            left: handle.x - 6,
            top: handle.y - 6,
            width: '12px',
            height: '12px',
            backgroundColor: '#007acc',
            border: '2px solid #ffffff',
            borderRadius: handle.type === 'rotation' ? '50%' : '2px',
            cursor: handle.cursor,
            pointerEvents: 'auto',
            zIndex: 1001,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}
          onMouseDown={(e) => handleMouseDown(e, handle)}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Rotation handle icon */}
          {handle.type === 'rotation' && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '8px',
                color: '#ffffff',
                fontWeight: 'bold'
              }}
            >
              ↻
            </div>
          )}
        </div>
      ))}

      {/* Multi-selection indicator */}
      {(() => {
        const selectedCount = selectedIds.size;
        if (selectedCount <= 1) return null;

        const bounds = getSelectionBounds();
        if (!bounds) return null;

        return (
          <div
            style={{
              position: 'absolute',
              left: bounds.x + bounds.width + 10,
              top: bounds.y - 25,
              backgroundColor: '#007acc',
              color: '#ffffff',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              pointerEvents: 'none',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}
          >
            {selectedCount} selected
          </div>
        );
      })()}
    </div>
  );
}
