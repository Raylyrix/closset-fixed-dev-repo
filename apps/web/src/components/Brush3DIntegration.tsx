import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useToolStore, useProjectStore } from '../stores/domainStores';
import { BrushEngine, BrushSettings, BrushPoint } from '../utils/BrushEngine';
import { brushPresetManager } from '../utils/BrushPresets';

interface Brush3DIntegrationProps {
  modelMesh: THREE.Mesh;
  modelId: string;
  activeBrush: BrushSettings;
  onBrushStroke?: (points: BrushPoint[], settings: BrushSettings) => void;
}

export function Brush3DIntegration({
  modelMesh,
  modelId,
  activeBrush,
  onBrushStroke
}: Brush3DIntegrationProps) {
  const { camera, raycaster, scene } = useThree();
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<BrushPoint[]>([]);
  const lastWorldPointRef = useRef<THREE.Vector3 | null>(null);

  // Create UV brush integration
  useEffect(() => {
    // TODO: Implement UV brush integration
  }, [modelId, modelMesh, activeBrush]);

  // Handle pointer events for 3D brush strokes
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return; // Only left mouse button

      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      const intersects = raycaster.intersectObject(modelMesh, true);
      if (intersects.length > 0) {
        const intersection = intersects[0];
        const worldPoint = intersection.point;

        const point: BrushPoint = {
          x: event.clientX,
          y: event.clientY,
          pressure: event.pressure || 1,
          tiltX: 0, // TODO: Get from pointer events
          tiltY: 0,
          velocity: 0,
          timestamp: Date.now(),
          distance: 0
        };

        setIsDrawing(true);
        setCurrentStroke([point]);
        lastWorldPointRef.current = worldPoint;

        // Apply brush to UV coordinates
        // TODO: Implement UV brush application
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDrawing || currentStroke.length === 0) return;

      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      const intersects = raycaster.intersectObject(modelMesh, true);
      if (intersects.length > 0) {
        const intersection = intersects[0];
        const worldPoint = intersection.point;

        if (lastWorldPointRef.current) {
          const dx = worldPoint.x - lastWorldPointRef.current.x;
          const dy = worldPoint.y - lastWorldPointRef.current.y;
          const dz = worldPoint.z - lastWorldPointRef.current.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          const timeDelta = Date.now() - currentStroke[currentStroke.length - 1].timestamp;
          const velocity = timeDelta > 0 ? distance / timeDelta : 0;

          const point: BrushPoint = {
            x: event.clientX,
            y: event.clientY,
            pressure: event.pressure || 1,
            tiltX: 0, // TODO: Get from pointer events
            tiltY: 0,
            velocity,
            timestamp: Date.now(),
            distance
          };

          setCurrentStroke(prev => [...prev, point]);

          // Apply brush to UV coordinates
          // uvBrushIntegrator.applyBrushToUV(
          //   uvBrushIntegrator.getIntegrations().get(modelId)!,
          //   worldPoint,
          //   activeBrush,
          //   point.pressure
          // );

          lastWorldPointRef.current = worldPoint;
        }
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (isDrawing) {
        setIsDrawing(false);
        onBrushStroke?.(currentStroke, activeBrush);
        setCurrentStroke([]);
        lastWorldPointRef.current = null;
      }
    };

    // Add event listeners
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('pointerdown', handlePointerDown);
      canvas.addEventListener('pointermove', handlePointerMove);
      canvas.addEventListener('pointerup', handlePointerUp);

      return () => {
        canvas.removeEventListener('pointerdown', handlePointerDown);
        canvas.removeEventListener('pointermove', handlePointerMove);
        canvas.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [camera, raycaster, modelMesh, modelId, activeBrush, isDrawing, currentStroke, onBrushStroke]);

  // Render brush cursor indicator
  useEffect(() => {
    if (!isDrawing) return;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      const intersects = raycaster.intersectObject(modelMesh, true);
      if (intersects.length > 0) {
        const intersection = intersects[0];
        // TODO: Show brush cursor indicator at intersection point
      }
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('pointermove', handlePointerMove);
      return () => canvas.removeEventListener('pointermove', handlePointerMove);
    }
  }, [camera, raycaster, modelMesh, isDrawing]);

  return null; // This component doesn't render anything visible
}
