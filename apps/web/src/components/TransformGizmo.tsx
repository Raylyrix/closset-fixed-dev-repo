import React, { useRef, useEffect, useState } from 'react';
import { useApp } from '../App';

interface TransformGizmoProps {
  layerId: string;
  onTransformChange: (transform: { x?: number; y?: number; scaleX?: number; scaleY?: number; rotation?: number }) => void;
}

export function TransformGizmo({ layerId, onTransformChange }: TransformGizmoProps) {
  const project = useApp(s => s.project);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'move' | 'scale' | 'rotate' | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startTransform, setStartTransform] = useState({ x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 });

  if (!project || !project.layers[layerId]) return null;

  const layer = project.layers[layerId] as any;
  const transform = layer.transform || { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1 };

  const handleMouseDown = (e: React.MouseEvent, type: 'move' | 'scale' | 'rotate') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragType(type);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartTransform({ ...transform });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dragType) return;

    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;

    switch (dragType) {
      case 'move':
        onTransformChange({
          x: startTransform.x + deltaX,
          y: startTransform.y + deltaY
        });
        break;
      case 'scale':
        const scaleFactor = 1 + deltaX * 0.01;
        const constrainProportions = e.shiftKey;
        if (constrainProportions) {
          onTransformChange({
            scaleX: Math.max(0.1, startTransform.scaleX * scaleFactor),
            scaleY: Math.max(0.1, startTransform.scaleY * scaleFactor)
          });
        } else {
          onTransformChange({
            scaleX: Math.max(0.1, startTransform.scaleX * scaleFactor),
            scaleY: Math.max(0.1, startTransform.scaleY * (1 + deltaY * 0.01))
          });
        }
        break;
      case 'rotate':
        const rotationDelta = deltaX * 0.02;
        onTransformChange({
          rotation: startTransform.rotation + rotationDelta
        });
        break;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragType(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragType, startPos, startTransform]);

  const gizmoStyle: React.CSSProperties = {
    position: 'absolute',
    left: transform.x + 200,
    top: transform.y + 200,
    width: 100,
    height: 100,
    border: '2px dashed #00ff00',
    borderRadius: '4px',
    pointerEvents: 'auto',
    zIndex: 1000,
    background: 'rgba(0, 255, 0, 0.1)'
  };

  return (
    <div style={gizmoStyle}>
      {/* Move handle (center) */}
      <div
        onMouseDown={(e) => handleMouseDown(e, 'move')}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 12,
          height: 12,
          background: '#00ff00',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          cursor: 'move'
        }}
      />
      
      {/* Scale handle (bottom-right) */}
      <div
        onMouseDown={(e) => handleMouseDown(e, 'scale')}
        style={{
          position: 'absolute',
          right: -6,
          bottom: -6,
          width: 12,
          height: 12,
          background: '#0088ff',
          borderRadius: '2px',
          cursor: 'nw-resize'
        }}
      />
      
      {/* Rotate handle (top-right) */}
      <div
        onMouseDown={(e) => handleMouseDown(e, 'rotate')}
        style={{
          position: 'absolute',
          right: -6,
          top: -6,
          width: 12,
          height: 12,
          background: '#ff8800',
          borderRadius: '50%',
          cursor: 'grab'
        }}
      />
      
      {/* Transform info */}
      <div style={{
        position: 'absolute',
        top: -30,
        left: 0,
        fontSize: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '2px 6px',
        borderRadius: '3px',
        whiteSpace: 'nowrap'
      }}>
        {layer.name} | x:{Math.round(transform.x)} y:{Math.round(transform.y)} | 
        s:{transform.scaleX?.toFixed(2)}x{transform.scaleY?.toFixed(2)} | 
        r:{(transform.rotation * 180 / Math.PI).toFixed(1)}°
      </div>
    </div>
  );
}
