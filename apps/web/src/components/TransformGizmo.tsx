/**
 * 🔧 Transform Gizmo Component
 * 
 * Provides visual handles for transforming selected elements
 * Supports move, scale, rotate, and skew operations
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';

interface TransformGizmoProps {
  selectedElements: any[];
  onTransform: (transform: { x?: number; y?: number; scaleX?: number; scaleY?: number; rotation?: number; skewX?: number; skewY?: number }) => void;
  visible: boolean;
}

interface TransformState {
  isDragging: boolean;
  dragType: 'move' | 'scale' | 'rotate' | 'skew' | null;
  startX: number;
  startY: number;
  startTransform: any;
  centerX: number;
  centerY: number;
}

export function TransformGizmo({ selectedElements, onTransform, visible }: TransformGizmoProps) {
  const gizmoRef = useRef<HTMLDivElement>(null);
  const [transformState, setTransformState] = useState<TransformState>({
    isDragging: false,
    dragType: null,
    startX: 0,
    startY: 0,
    startTransform: null,
    centerX: 0,
    centerY: 0
  });

  // Calculate bounding box for selected elements
  const getBoundingBox = useCallback(() => {
    if (selectedElements.length === 0) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    selectedElements.forEach(element => {
      const bounds = element.bounds;
      minX = Math.min(minX, bounds.x);
      minY = Math.min(minY, bounds.y);
      maxX = Math.max(maxX, bounds.x + bounds.width);
      maxY = Math.max(maxY, bounds.y + bounds.height);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      centerX: minX + (maxX - minX) / 2,
      centerY: minY + (maxY - minY) / 2
    };
  }, [selectedElements]);

  const boundingBox = getBoundingBox();

  // Handle mouse down on gizmo handles
  const handleMouseDown = useCallback((e: React.MouseEvent, dragType: TransformState['dragType']) => {
    e.preventDefault();
    e.stopPropagation();

    if (!boundingBox) return;

    setTransformState({
      isDragging: true,
      dragType,
      startX: e.clientX,
      startY: e.clientY,
      startTransform: { ...boundingBox },
      centerX: boundingBox.centerX,
      centerY: boundingBox.centerY
    });
  }, [boundingBox]);

  // Handle mouse move during drag
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!transformState.isDragging || !transformState.dragType || !boundingBox) return;

    const deltaX = e.clientX - transformState.startX;
    const deltaY = e.clientY - transformState.startY;

    switch (transformState.dragType) {
      case 'move':
        onTransform({ x: deltaX, y: deltaY });
        break;
      
      case 'scale':
        const scaleX = 1 + (deltaX / transformState.startTransform.width);
        const scaleY = 1 + (deltaY / transformState.startTransform.height);
        onTransform({ scaleX: Math.max(0.1, scaleX), scaleY: Math.max(0.1, scaleY) });
        break;
      
      case 'rotate':
        const angle = Math.atan2(
          e.clientY - transformState.centerY,
          e.clientX - transformState.centerX
        ) - Math.atan2(
          transformState.startY - transformState.centerY,
          transformState.startX - transformState.centerX
        );
        onTransform({ rotation: angle });
        break;
      
      case 'skew':
        const skewX = deltaX / transformState.startTransform.height;
        const skewY = deltaY / transformState.startTransform.width;
        onTransform({ skewX, skewY });
        break;
    }
  }, [transformState, boundingBox, onTransform]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setTransformState(prev => ({
      ...prev,
      isDragging: false,
      dragType: null
    }));
  }, []);

  // Add global mouse event listeners
  useEffect(() => {
    if (transformState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [transformState.isDragging, handleMouseMove, handleMouseUp]);

  if (!visible || !boundingBox || selectedElements.length === 0) {
    return null;
  }

  const handleSize = 8;
  const handleOffset = 4;

  return (
    <div
      ref={gizmoRef}
      style={{
        position: 'absolute',
        left: boundingBox.x - handleOffset,
        top: boundingBox.y - handleOffset,
        width: boundingBox.width + (handleOffset * 2),
        height: boundingBox.height + (handleOffset * 2),
        pointerEvents: 'none',
        zIndex: 1003
      }}
    >
      {/* Selection outline */}
      <div
        style={{
          position: 'absolute',
          left: handleOffset,
          top: handleOffset,
          width: boundingBox.width,
          height: boundingBox.height,
          border: '2px solid #007acc',
          backgroundColor: 'rgba(0, 122, 204, 0.1)',
          borderRadius: '2px'
        }}
      />

      {/* Corner handles for scaling */}
      <div
        style={{
          position: 'absolute',
          left: -handleSize / 2,
          top: -handleSize / 2,
          width: handleSize,
          height: handleSize,
          backgroundColor: '#007acc',
          border: '2px solid #ffffff',
          borderRadius: '50%',
          cursor: 'nw-resize',
          pointerEvents: 'auto'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'scale')}
      />
      <div
        style={{
          position: 'absolute',
          right: -handleSize / 2,
          top: -handleSize / 2,
          width: handleSize,
          height: handleSize,
          backgroundColor: '#007acc',
          border: '2px solid #ffffff',
          borderRadius: '50%',
          cursor: 'ne-resize',
          pointerEvents: 'auto'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'scale')}
      />
      <div
        style={{
          position: 'absolute',
          left: -handleSize / 2,
          bottom: -handleSize / 2,
          width: handleSize,
          height: handleSize,
          backgroundColor: '#007acc',
          border: '2px solid #ffffff',
          borderRadius: '50%',
          cursor: 'sw-resize',
          pointerEvents: 'auto'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'scale')}
      />
      <div
        style={{
          position: 'absolute',
          right: -handleSize / 2,
          bottom: -handleSize / 2,
          width: handleSize,
          height: handleSize,
          backgroundColor: '#007acc',
          border: '2px solid #ffffff',
          borderRadius: '50%',
          cursor: 'se-resize',
          pointerEvents: 'auto'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'scale')}
      />

      {/* Edge handles for scaling */}
      <div
        style={{
          position: 'absolute',
          left: boundingBox.width / 2 - handleSize / 2,
          top: -handleSize / 2,
          width: handleSize,
          height: handleSize,
          backgroundColor: '#007acc',
          border: '2px solid #ffffff',
          borderRadius: '50%',
          cursor: 'n-resize',
          pointerEvents: 'auto'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'scale')}
      />
      <div
        style={{
          position: 'absolute',
          left: boundingBox.width / 2 - handleSize / 2,
          bottom: -handleSize / 2,
          width: handleSize,
          height: handleSize,
          backgroundColor: '#007acc',
          border: '2px solid #ffffff',
          borderRadius: '50%',
          cursor: 's-resize',
          pointerEvents: 'auto'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'scale')}
      />
      <div
        style={{
          position: 'absolute',
          left: -handleSize / 2,
          top: boundingBox.height / 2 - handleSize / 2,
          width: handleSize,
          height: handleSize,
          backgroundColor: '#007acc',
          border: '2px solid #ffffff',
          borderRadius: '50%',
          cursor: 'w-resize',
          pointerEvents: 'auto'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'scale')}
      />
      <div
        style={{
          position: 'absolute',
          right: -handleSize / 2,
          top: boundingBox.height / 2 - handleSize / 2,
          width: handleSize,
          height: handleSize,
          backgroundColor: '#007acc',
          border: '2px solid #ffffff',
          borderRadius: '50%',
          cursor: 'e-resize',
          pointerEvents: 'auto'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'scale')}
      />

      {/* Center handle for moving */}
      <div
        style={{
          position: 'absolute',
          left: boundingBox.width / 2 - handleSize / 2,
          top: boundingBox.height / 2 - handleSize / 2,
          width: handleSize,
          height: handleSize,
          backgroundColor: '#ffffff',
          border: '2px solid #007acc',
          borderRadius: '50%',
          cursor: 'move',
          pointerEvents: 'auto'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'move')}
      />

      {/* Rotation handle */}
      <div
        style={{
          position: 'absolute',
          left: boundingBox.width / 2 - 2,
          top: -20,
          width: 4,
          height: 16,
          backgroundColor: '#007acc',
          border: '1px solid #ffffff',
          borderRadius: '2px',
          cursor: 'grab',
          pointerEvents: 'auto'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'rotate')}
      />

      {/* Rotation indicator line */}
      <div
        style={{
          position: 'absolute',
          left: boundingBox.width / 2,
          top: 0,
          width: 2,
          height: 20,
          backgroundColor: '#007acc',
          pointerEvents: 'none'
        }}
      />

      {/* Transform info */}
      <div
        style={{
          position: 'absolute',
          top: -30,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: '10px',
          color: '#ffffff',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '2px 4px',
          borderRadius: '2px',
          pointerEvents: 'none'
        }}
      >
        {selectedElements.length} element{selectedElements.length !== 1 ? 's' : ''} selected
      </div>
    </div>
  );
}

export default TransformGizmo;