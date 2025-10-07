import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { useApp } from '../App';

interface PuffPrintToolProps {
  active: boolean;
  onError?: (error: Error) => void;
}

interface UVPoint {
  u: number;
  v: number;
  x: number;
  y: number;
  worldPosition: THREE.Vector3;
  normal: THREE.Vector3;
}

interface PuffLayer {
  id: string;
  name: string;
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture | null;
  material: THREE.MeshStandardMaterial | null;
  visible: boolean;
  opacity: number;
  blendMode: 'normal' | 'multiply' | 'overlay' | 'screen';
  height: number;
  curvature: number;
  color: string;
}

interface PuffBrush {
  size: number;
  opacity: number;
  hardness: number;
  shape: 'round' | 'square' | 'diamond' | 'triangle' | 'airbrush';
  flow: number;
  spacing: number;
  rotation: number;
  pattern: string | null;
  patternScale: number;
  patternRotation: number;
}

export function AdvancedPuffPrintTool({ active, onError }: PuffPrintToolProps) {
  const { modelScene, composedCanvas } = useApp();

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const lastPaintTimeRef = useRef<number>(0);
  const isPaintingRef = useRef<boolean>(false);
  const originalMaterialCache = useRef<Map<string, THREE.Material | THREE.Material[]>>(new Map());

  // State
  const [layers, setLayers] = useState<PuffLayer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [brush, setBrush] = useState<PuffBrush>({
    size: 50,
    opacity: 1.0,
    hardness: 0.8,
    shape: 'round',
    flow: 1.0,
    spacing: 0.1,
    rotation: 0,
    pattern: null,
    patternScale: 1.0,
    patternRotation: 0
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UV coordinate system
  const uvMappingRef = useRef<Map<string, UVPoint[]>>(new Map());
  const modelBoundsRef = useRef<{ min: THREE.Vector3; max: THREE.Vector3 } | null>(null);

  // Initialize the tool
  useEffect(() => {
    if (!active || !modelScene || !composedCanvas) return;

    try {
      initializePuffSystem();
      setIsInitialized(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to initialize puff print system: ${errorMessage}`);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  }, [active, modelScene, composedCanvas]);

  // Initialize the puff print system
  const initializePuffSystem = useCallback(() => {
    if (!modelScene || !composedCanvas) return;

    // Create UV mapping for all meshes
    createUVMappings();

    // Create initial layer
    createNewLayer('Puff Layer 1');

    // Set up canvas for 2D operations
    setupCanvases();

    // Initialize 3D materials
    initializeMaterials();
  }, [modelScene, composedCanvas]);

  const generateUVCoordinates = useCallback((geometry: THREE.BufferGeometry) => {
    const positionAttribute = geometry.attributes.position;
    if (!positionAttribute) return;

    const positions = positionAttribute.array as Float32Array;
    const uvArray = new Float32Array(positions.length * 2 / 3);

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      // Simple spherical UV mapping as fallback
      const phi = Math.atan2(z, x);
      const theta = Math.acos(y / Math.sqrt(x * x + y * y + z * z));

      const u = (phi + Math.PI) / (2 * Math.PI);
      const v = theta / Math.PI;

      const uvIndex = (i / 3) * 2;
      uvArray[uvIndex] = u;
      uvArray[uvIndex + 1] = v;
    }

    geometry.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2));
    geometry.attributes.uv.needsUpdate = true;
  }, []);

  // Generate normals for meshes that don't have them
  const generateNormals = useCallback((geometry: THREE.BufferGeometry) => {
    const positionAttribute = geometry.attributes.position;
    if (!positionAttribute) return null;

    // Compute vertex normals
    geometry.computeVertexNormals();

    const normalAttribute = geometry.attributes.normal;
    if (!normalAttribute) {
      // Fallback: create flat normals
      const positions = positionAttribute.array as Float32Array;
      const normals = new Float32Array(positions.length);

      for (let i = 0; i < positions.length; i += 9) {
        // Get three vertices of a triangle
        const v1 = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
        const v2 = new THREE.Vector3(positions[i + 3], positions[i + 4], positions[i + 5]);
        const v3 = new THREE.Vector3(positions[i + 6], positions[i + 7], positions[i + 8]);

        // Calculate normal
        const normal = new THREE.Vector3();
        const v2v1 = v2.clone().sub(v1);
        const v3v1 = v3.clone().sub(v1);
        normal.crossVectors(v2v1, v3v1).normalize();

        // Apply to all three vertices
        for (let j = 0; j < 3; j++) {
          const idx = i + j * 3;
          normals[idx] = normal.x;
          normals[idx + 1] = normal.y;
          normals[idx + 2] = normal.z;
        }
      }

      geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    }

    return geometry.attributes.normal;
  }, []);

  // Create UV coordinate mappings for all meshes
  const createUVMappings = useCallback(() => {
    if (!modelScene || !composedCanvas) return;

    const uvMappings = new Map<string, UVPoint[]>();
    const bounds = { min: new THREE.Vector3(Infinity, Infinity, Infinity), max: new THREE.Vector3(-Infinity, -Infinity, -Infinity) };

    modelScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry && child.material) {
        const mesh = child as THREE.Mesh;
        const geometry = mesh.geometry;

        try {
          // Clone geometry to avoid modifying the original
          const clonedGeometry = geometry.clone();

          // Ensure geometry has UV coordinates
          if (!clonedGeometry.attributes.uv) {
            generateUVCoordinates(clonedGeometry);
          }

          const positionAttribute = clonedGeometry.attributes.position;
          const uvAttribute = clonedGeometry.attributes.uv;
          const normalAttribute = clonedGeometry.attributes.normal || generateNormals(clonedGeometry);

          if (positionAttribute && uvAttribute && normalAttribute) {
            const positions = positionAttribute.array as Float32Array;
            const uvs = uvAttribute.array as Float32Array;
            const normals = normalAttribute.array as Float32Array;

            const meshUVPoints: UVPoint[] = [];

            for (let i = 0; i < uvs.length; i += 2) {
              const u = uvs[i];
              const v = uvs[i + 1];

              // Convert UV coordinates to screen coordinates
              const canvasX = u * composedCanvas!.width;
              const canvasY = (1 - v) * composedCanvas!.height;

              // Get world position
              const vertexIndex = Math.floor(i / 2) * 3;
              const worldPosition = new THREE.Vector3(
                positions[vertexIndex],
                positions[vertexIndex + 1],
                positions[vertexIndex + 2]
              ).applyMatrix4(mesh.matrixWorld);

              // Get normal
              const normal = new THREE.Vector3(
                normals[vertexIndex],
                normals[vertexIndex + 1],
                normals[vertexIndex + 2]
              ).applyMatrix4(mesh.matrixWorld).normalize();

              const uvPoint: UVPoint = {
                u,
                v,
                x: canvasX,
                y: canvasY,
                worldPosition,
                normal
              };

              meshUVPoints.push(uvPoint);

              // Update bounds
              bounds.min.min(worldPosition);
              bounds.max.max(worldPosition);
            }

            uvMappings.set(mesh.uuid, meshUVPoints);
          }
        } catch (error) {
          console.warn(`Failed to create UV mapping for mesh ${mesh.uuid}:`, error);
          // Continue with other meshes
        }
      }
    });

    uvMappingRef.current = uvMappings;
    modelBoundsRef.current = bounds;
  }, [modelScene, composedCanvas, generateUVCoordinates, generateNormals]);
  const setupCanvases = useCallback(() => {
    if (!composedCanvas) return;

    const canvas = document.createElement('canvas');
    canvas.width = composedCanvas.width;
    canvas.height = composedCanvas.height;
    (canvasRef as React.MutableRefObject<HTMLCanvasElement>).current = canvas;

    const overlayCanvas = document.createElement('canvas');
    overlayCanvas.width = composedCanvas.width;
    overlayCanvas.height = composedCanvas.height;
    (overlayCanvasRef as React.MutableRefObject<HTMLCanvasElement>).current = overlayCanvas;
  }, [composedCanvas]);

  // Initialize 3D materials
  const initializeMaterials = useCallback(() => {
    if (!modelScene) return;

    modelScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mesh = child as THREE.Mesh;

        // Store original material
        if (!originalMaterialCache.current.has(mesh.uuid)) {
          if (Array.isArray(mesh.material)) {
            // Handle array of materials
            const clonedMaterials = mesh.material.map(mat => mat.clone());
            originalMaterialCache.current.set(mesh.uuid, clonedMaterials);
          } else {
            // Handle single material
            originalMaterialCache.current.set(mesh.uuid, mesh.material.clone());
          }
        }

        // Create puff material
        const puffMaterial = new THREE.MeshStandardMaterial({
          map: null,
          normalMap: null,
          roughnessMap: null,
          metalnessMap: null,
          aoMap: null,
          displacementMap: null,
          transparent: true,
          side: THREE.DoubleSide
        });

        mesh.material = puffMaterial;
      }
    });
  }, [modelScene]);

  // Create a new puff layer
  const createNewLayer = useCallback((name: string) => {
    if (!composedCanvas) return;

    const canvas = document.createElement('canvas');
    canvas.width = composedCanvas.width;
    canvas.height = composedCanvas.height;

    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const layer: PuffLayer = {
      id: `puff-layer-${Date.now()}`,
      name,
      canvas,
      texture,
      material: null,
      visible: true,
      opacity: 1.0,
      blendMode: 'normal',
      height: 1.0,
      curvature: 0.5,
      color: '#ffffff'
    };

    setLayers(prev => [...prev, layer]);
    setActiveLayerId(layer.id);
  }, [composedCanvas]);

  // Convert screen coordinates to UV coordinates
  const screenToUV = useCallback((screenX: number, screenY: number): UVPoint | null => {
    if (!composedCanvas || !modelScene) return null;

    // Normalize screen coordinates
    const normalizedX = screenX / composedCanvas.width;
    const normalizedY = 1 - (screenY / composedCanvas.height); // Flip Y axis

    // Find the closest UV point
    let closestUVPoint: UVPoint | null = null;
    let minDistance = Infinity;

    for (const [meshId, uvPoints] of uvMappingRef.current) {
      for (const uvPoint of uvPoints) {
        const distance = Math.sqrt(
          Math.pow(uvPoint.u - normalizedX, 2) +
          Math.pow(uvPoint.v - normalizedY, 2)
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestUVPoint = uvPoint;
        }
      }
    }

    return closestUVPoint;
  }, [composedCanvas, modelScene]);

  // Paint puff effect at UV coordinates
  const paintPuffAtUV = useCallback((uvPoint: UVPoint, size: number, opacity: number) => {
    if (!activeLayerId || !layers.length) return;

    const activeLayer = layers.find(l => l.id === activeLayerId);
    if (!activeLayer) return;

    const ctx = activeLayer.canvas.getContext('2d')!;
    const centerX = uvPoint.u * activeLayer.canvas.width;
    const centerY = (1 - uvPoint.v) * activeLayer.canvas.height;

    // Use source-over blending to prevent washing out
    ctx.globalCompositeOperation = 'source-over'; // Standard blending to prevent washing out

    // Create gradient for smooth falloff
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
    gradient.addColorStop(0.6, `rgba(255, 255, 255, ${opacity * 0.7})`);
    gradient.addColorStop(0.8, `rgba(255, 255, 255, ${opacity * 0.3})`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    // Draw puff with smooth edges
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
    ctx.fill();

    // Add subtle gaussian blur to smooth out edges and reduce spikes
    ctx.filter = 'blur(1px)';
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, size * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.filter = 'none';

    // Update texture
    if (activeLayer.texture) {
      activeLayer.texture.needsUpdate = true;
    }

    // Update material
    updatePuffMaterial(activeLayer);
  }, [activeLayerId, layers]);

  // Update puff material with new texture
  const updatePuffMaterial = useCallback((layer: PuffLayer) => {
    if (!modelScene) return;

    modelScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mesh = child as THREE.Mesh;
        const material = mesh.material as THREE.MeshStandardMaterial;

        if (material && layer.texture) {
          // Set displacement map for 3D puff effect
          material.displacementMap = layer.texture;

          // Reduce displacement scale to prevent excessive spikes
          // Clamp the maximum displacement to reasonable values
          const maxDisplacement = Math.min(layer.height * 0.05, 0.2);
          material.displacementScale = maxDisplacement;
          material.displacementBias = 0;

          // Set normal map for surface detail
          material.normalMap = layer.texture;
          material.normalScale.set(0.3, 0.3); // Reduce normal intensity

          // Set roughness based on puff properties - higher areas are smoother
          const baseRoughness = Math.max(0.1, 1 - layer.curvature * 0.5);
          material.roughness = baseRoughness;
          material.metalness = 0;

          // Enable vertex displacement for smoother geometry
          material.vertexColors = false;

          material.needsUpdate = true;
        }
      }
    });
  }, [modelScene]);

  // Handle mouse/touch events
  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    if (!active || !isInitialized) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const uvPoint = screenToUV(x, y);
    if (uvPoint) {
      isPaintingRef.current = true;
      paintPuffAtUV(uvPoint, brush.size, brush.opacity);
    }
  }, [active, isInitialized, brush, screenToUV, paintPuffAtUV]);

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    if (!active || !isInitialized || !isPaintingRef.current) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const uvPoint = screenToUV(x, y);
    if (uvPoint) {
      const now = Date.now();
      if (now - lastPaintTimeRef.current > brush.spacing * 1000) {
        paintPuffAtUV(uvPoint, brush.size, brush.opacity);
        lastPaintTimeRef.current = now;
      }
    }
  }, [active, isInitialized, brush, screenToUV, paintPuffAtUV]);

  const handlePointerUp = useCallback(() => {
    isPaintingRef.current = false;
  }, []);

  // Update brush settings
  const updateBrush = useCallback((newBrush: Partial<PuffBrush>) => {
    setBrush(prev => ({ ...prev, ...newBrush }));
  }, []);

  return (
    <div className="puff-print-tool" style={{ display: active ? 'block' : 'none' }}>
      {error && (
        <div className="error-message" style={{ color: 'red', padding: '10px', background: 'rgba(255,0,0,0.1)' }}>
          {error}
        </div>
      )}

      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          cursor: 'crosshair',
          zIndex: 1000,
          pointerEvents: active ? 'auto' : 'none',
          opacity: active ? 1 : 0
        }}
      />

      <div className="puff-controls" style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.8)',
        padding: '10px',
        borderRadius: '5px',
        display: active ? 'block' : 'none'
      }}>
        <div>Brush Size: {brush.size}</div>
        <div>Opacity: {brush.opacity}</div>
        <div>Shape: {brush.shape}</div>
        <button onClick={() => createNewLayer(`Puff Layer ${layers.length + 1}`)}>
          New Layer
        </button>
      </div>
    </div>
  );
}
