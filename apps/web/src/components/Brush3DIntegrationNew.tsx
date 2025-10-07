import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Import new architecture components
import { useModelStore, useToolStore } from '../stores/domainStores';
import { useBrushEngine } from '../hooks/useBrushEngine';

// Import types
import { UVPoint, BrushPoint, PointerEvent } from '../types/app';

interface Brush3DIntegrationProps {
  enabled?: boolean;
}

/**
 * Brush3DIntegration - 3D painting system using new architecture
 * Integrates 2D brush strokes with 3D UV mapping for real-time painting
 */
export function Brush3DIntegration({ enabled = true }: Brush3DIntegrationProps) {
  const { camera, raycaster, scene } = useThree();
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  // Get domain store state
  const { modelScene } = useModelStore();
  const {
    activeTool,
    isDrawing,
    currentStroke,
    brushSettings,
    brushColor
  } = useToolStore(state => ({
    activeTool: state.activeTool,
    isDrawing: state.isDrawing,
    currentStroke: state.currentStroke,
    brushSettings: state.brushSettings,
    brushColor: state.brushColor
  }));

  // Get brush engine
  const brushEngine = useBrushEngine(canvas || undefined);

  // Only activate when brush tool is selected and enabled
  const isActive = enabled && activeTool === 'brush' && modelScene;

  // Handle pointer events for 3D brush painting
  useEffect(() => {
    if (!isActive) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return; // Only left mouse button

      // Convert screen coordinates to normalized device coordinates
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Raycast to find intersection with 3D model
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const intersects = raycaster.intersectObject(modelScene, true);

      if (intersects.length > 0) {
        const intersection = intersects[0];
        const worldPoint = intersection.point;

        // Convert world position to UV coordinates
        const uv = intersection.uv;
        if (uv) {
          const brushPoint: BrushPoint = {
            x: event.clientX,
            y: event.clientY,
            pressure: event.pressure || 1,
            tiltX: 0, // TODO: Get from pointer events if available
            tiltY: 0,
            velocity: 0,
            timestamp: Date.now(),
            distance: 0,
            uv: { x: uv.x, y: uv.y },
            worldPosition: worldPoint.clone() // Use clone() to create THREE.Vector3
          };

          // Start drawing
          useToolStore.getState().startStroke(brushPoint);
        }
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDrawing || currentStroke.length === 0) return;

      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const intersects = raycaster.intersectObject(modelScene, true);

      if (intersects.length > 0) {
        const intersection = intersects[0];
        const worldPoint = intersection.point;
        const uv = intersection.uv;

        if (uv) {
          // Calculate velocity based on previous point
          const lastPoint = currentStroke[currentStroke.length - 1];
          const timeDelta = Date.now() - lastPoint.timestamp;
          const dx = worldPoint.x - (lastPoint.worldPosition?.x || 0);
          const dy = worldPoint.y - (lastPoint.worldPosition?.y || 0);
          const dz = worldPoint.z - (lastPoint.worldPosition?.z || 0);
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const velocity = timeDelta > 0 ? distance / timeDelta : 0;

          const brushPoint: BrushPoint = {
            x: event.clientX,
            y: event.clientY,
            pressure: event.pressure || 1,
            tiltX: 0,
            tiltY: 0,
            velocity,
            timestamp: Date.now(),
            distance,
            uv: { x: uv.x, y: uv.y },
            worldPosition: worldPoint.clone() // Use clone() to create THREE.Vector3
          };

          // Add point to stroke
          useToolStore.getState().addToStroke(brushPoint);

          // Render brush stroke in real-time
          renderBrushToUV(brushPoint);
        }
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (isDrawing) {
        // End the stroke
        useToolStore.getState().endStroke();

        // Final render of complete stroke
        renderCompleteStroke();
      }
    };

    // Add event listeners to canvas
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('pointerdown', handlePointerDown as any);
      canvas.addEventListener('pointermove', handlePointerMove as any);
      canvas.addEventListener('pointerup', handlePointerUp as any);

      return () => {
        canvas.removeEventListener('pointerdown', handlePointerDown as any);
        canvas.removeEventListener('pointermove', handlePointerMove as any);
        canvas.removeEventListener('pointerup', handlePointerUp as any);
      };
    }
  }, [isActive, camera, raycaster, modelScene, isDrawing, currentStroke]);

  /**
   * Render brush stroke to UV coordinates in real-time
   */
  const renderBrushToUV = useCallback((point: BrushPoint) => {
    if (!point.uv || !canvas) return;

    // Create a small canvas for this brush stamp
    const stampCanvas = document.createElement('canvas');
    stampCanvas.width = stampCanvas.height = Math.ceil(brushSettings.size * 2);

    const ctx = stampCanvas.getContext('2d')!;
    ctx.fillStyle = brushColor;
    ctx.globalAlpha = brushSettings.opacity * (point.pressure || 1);

    // Draw brush stamp
    const centerX = stampCanvas.width / 2;
    const centerY = stampCanvas.height / 2;
    const radius = brushSettings.size / 2;

    // Create radial gradient for brush falloff
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, brushColor);
    gradient.addColorStop(brushSettings.hardness, brushColor);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Composite onto main canvas at UV position
    const mainCtx = canvas.getContext('2d')!;
    const uvX = point.uv.x * canvas.width;
    const uvY = (1 - point.uv.y) * canvas.height; // Flip Y for UV coordinates

    mainCtx.globalCompositeOperation = brushSettings.blendMode;
    mainCtx.drawImage(
      stampCanvas,
      uvX - stampCanvas.width / 2,
      uvY - stampCanvas.height / 2
    );
    mainCtx.globalCompositeOperation = 'source-over';
  }, [brushSettings, brushColor, canvas]);

  /**
   * Render complete stroke using brush engine
   */
  const renderCompleteStroke = useCallback(() => {
    if (currentStroke.length === 0 || !canvas) return;

    // Use brush engine for advanced stroke rendering
    brushEngine.renderBrushStroke(currentStroke, brushSettings, canvas.getContext('2d')!);
  }, [currentStroke, brushSettings, brushEngine, canvas]);

  // Create canvas for UV painting
  useEffect(() => {
    if (!enabled) return;

    // Create a canvas for UV texture painting
    const newCanvas = document.createElement('canvas');
    newCanvas.width = 2048;
    newCanvas.height = 2048;
    setCanvas(newCanvas);

    // Initialize with transparent background
    const ctx = newCanvas.getContext('2d')!;
    ctx.clearRect(0, 0, newCanvas.width, newCanvas.height);

    return () => {
      setCanvas(null);
    };
  }, [enabled]);

  // Apply painted texture to 3D model
  useEffect(() => {
    if (!modelScene || !canvas) return;

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    // Apply to all meshes in the model
    modelScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial) {
              mat.map = texture;
              mat.needsUpdate = true;
            }
          });
        } else if (child.material instanceof THREE.MeshStandardMaterial) {
          child.material.map = texture;
          child.material.needsUpdate = true;
        }
      }
    });

    return () => {
      texture.dispose();
    };
  }, [modelScene, currentStroke, canvas]);

  // This component doesn't render anything visible - it handles 3D painting logic
  return null;
}

export default Brush3DIntegration;
