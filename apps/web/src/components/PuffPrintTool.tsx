import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../App';
import * as THREE from 'three';

interface PuffPrintToolProps {
  active: boolean;
}

export function PuffPrintTool({ active }: PuffPrintToolProps) {
  const {
    modelScene,
    composedCanvas,
    activeTool,
    brushColor,
    brushSize,
    brushOpacity,
    brushShape,
    usePressureSize,
    usePressureOpacity,
    symmetryY,
    symmetryZ,
    commit,
    puffBrushSize,
    puffBrushOpacity,
    puffHeight: globalPuffHeight,
    puffCurvature: globalPuffCurvature,
    puffShape: globalPuffShape,
    puffColor: globalPuffColor,
    setPuffBrushSize,
    setPuffBrushOpacity,
    setPuffHeight,
    setPuffCurvature,
    setPuffShape,
    setPuffColor
  } = useApp();

  const [puffCanvas, setPuffCanvas] = useState<HTMLCanvasElement | null>(null);
  const [displacementCanvas, setDisplacementCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isPainting, setIsPainting] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  // Puff print specific settings - use global state
  const puffHeight = globalPuffHeight;
  const puffCurvature = globalPuffCurvature;
  const puffShape = globalPuffShape;
  const puffColor = globalPuffColor;
  
  // Subdivision and smoothing settings
  const [subdivisionLevel, setSubdivisionLevel] = useState(2); // Conservative subdivision to avoid mesh patterns
  const [autoSmooth, setAutoSmooth] = useState(true);
  const [smoothingLevel, setSmoothingLevel] = useState(2); // Moderate smoothing for better results
  
  // Advanced puff print features
  const [puffLayers, setPuffLayers] = useState<Array<{
    id: string;
    name: string;
    visible: boolean;
    opacity: number;
    blendMode: string;
    canvas: HTMLCanvasElement;
  }>>([]);
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [puffPatterns, setPuffPatterns] = useState<Array<{
    id: string;
    name: string;
    preview: string;
    pattern: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => void;
  }>>([]);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [isPatternMode, setIsPatternMode] = useState(false);
  const [patternScale, setPatternScale] = useState(1.0);
  const [patternRotation, setPatternRotation] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const [snapToGrid, setSnapToGrid] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const displacementCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const materialCacheRef = useRef<Map<string, THREE.MeshStandardMaterial>>(new Map());
  const originalGeometryCache = useRef<Map<string, THREE.BufferGeometry>>(new Map());
  const modifiedGeometryCache = useRef<Map<string, THREE.BufferGeometry>>(new Map());
  const originalMaterialCache = useRef<Map<string, THREE.Material>>(new Map());
  const originalModelState = useRef<Map<string, { material: THREE.Material | THREE.Material[], geometry: THREE.BufferGeometry }>>(new Map());

  // Function to safely subdivide geometry for smoother puff effects
  const subdivideGeometry = (geometry: THREE.BufferGeometry, subdivisions: number): THREE.BufferGeometry => {
    // Console log removed
    
    try {
      let currentGeometry = geometry.clone();
      
      if (subdivisions > 1) {
        // Apply conservative subdivision to avoid mesh patterns
        // Limit to maximum 2 levels to prevent excessive geometry
        const maxLevels = Math.min(subdivisions - 1, 2);
        for (let level = 0; level < maxLevels; level++) {
          const positionAttribute = currentGeometry.getAttribute('position');
          const normalAttribute = currentGeometry.getAttribute('normal');
          const uvAttribute = currentGeometry.getAttribute('uv');
          const indexAttribute = currentGeometry.index;
          
          if (!positionAttribute) {
            console.warn('PuffPrintTool: No position attribute found, skipping subdivision');
            break;
          }
          
          const positions = positionAttribute.array;
          const indices = indexAttribute ? indexAttribute.array : [];
          
          // Create new arrays for subdivided geometry
          const newPositions: number[] = [];
          const newNormals: number[] = [];
          const newUVs: number[] = [];
          const newIndices: number[] = [];
          
          // Add original vertices
          for (let i = 0; i < positions.length; i++) {
            newPositions.push(positions[i]);
          }
          
          if (normalAttribute) {
            for (let i = 0; i < normalAttribute.array.length; i++) {
              newNormals.push(normalAttribute.array[i]);
            }
          }
          
          if (uvAttribute) {
            for (let i = 0; i < uvAttribute.array.length; i++) {
              newUVs.push(uvAttribute.array[i]);
            }
          }
          
          // Subdivide triangles
          for (let i = 0; i < indices.length; i += 3) {
            const i1 = indices[i];
            const i2 = indices[i + 1];
            const i3 = indices[i + 2];
            
            // Get vertex positions
            const p1 = new THREE.Vector3(positions[i1 * 3], positions[i1 * 3 + 1], positions[i1 * 3 + 2]);
            const p2 = new THREE.Vector3(positions[i2 * 3], positions[i2 * 3 + 1], positions[i2 * 3 + 2]);
            const p3 = new THREE.Vector3(positions[i3 * 3], positions[i3 * 3 + 1], positions[i3 * 3 + 2]);
            
            // Calculate edge midpoints
            const m12 = p1.clone().add(p2).multiplyScalar(0.5);
            const m23 = p2.clone().add(p3).multiplyScalar(0.5);
            const m31 = p3.clone().add(p1).multiplyScalar(0.5);
            
            // Add new vertices
            const baseIndex = newPositions.length / 3;
            newPositions.push(m12.x, m12.y, m12.z);
            newPositions.push(m23.x, m23.y, m23.z);
            newPositions.push(m31.x, m31.y, m31.z);
            
            // Add normals for new vertices
            if (normalAttribute) {
              const n1 = new THREE.Vector3(normalAttribute.array[i1 * 3], normalAttribute.array[i1 * 3 + 1], normalAttribute.array[i1 * 3 + 2]);
              const n2 = new THREE.Vector3(normalAttribute.array[i2 * 3], normalAttribute.array[i2 * 3 + 1], normalAttribute.array[i2 * 3 + 2]);
              const n3 = new THREE.Vector3(normalAttribute.array[i3 * 3], normalAttribute.array[i3 * 3 + 1], normalAttribute.array[i3 * 3 + 2]);
              
              const n12 = n1.clone().add(n2).normalize();
              const n23 = n2.clone().add(n3).normalize();
              const n31 = n3.clone().add(n1).normalize();
              
              newNormals.push(n12.x, n12.y, n12.z);
              newNormals.push(n23.x, n23.y, n23.z);
              newNormals.push(n31.x, n31.y, n31.z);
            }
            
            // Add UVs for new vertices
            if (uvAttribute) {
              const uv1 = new THREE.Vector2(uvAttribute.array[i1 * 2], uvAttribute.array[i1 * 2 + 1]);
              const uv2 = new THREE.Vector2(uvAttribute.array[i2 * 2], uvAttribute.array[i2 * 2 + 1]);
              const uv3 = new THREE.Vector2(uvAttribute.array[i3 * 2], uvAttribute.array[i3 * 2 + 1]);
              
              const uv12 = uv1.clone().add(uv2).multiplyScalar(0.5);
              const uv23 = uv2.clone().add(uv3).multiplyScalar(0.5);
              const uv31 = uv3.clone().add(uv1).multiplyScalar(0.5);
              
              newUVs.push(uv12.x, uv12.y);
              newUVs.push(uv23.x, uv23.y);
              newUVs.push(uv31.x, uv31.y);
            }
            
            // Create new triangles
            newIndices.push(i1, baseIndex, baseIndex + 2);
            newIndices.push(baseIndex, i2, baseIndex + 1);
            newIndices.push(baseIndex + 1, i3, baseIndex + 2);
            newIndices.push(baseIndex, baseIndex + 1, baseIndex + 2);
          }
          
          // Create new geometry with subdivided data
          const subdividedGeometry = new THREE.BufferGeometry();
          subdividedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
          
          if (newNormals.length > 0) {
            subdividedGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(newNormals, 3));
          }
          
          if (newUVs.length > 0) {
            subdividedGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(newUVs, 2));
          }
          
          subdividedGeometry.setIndex(newIndices);
          
          // Compute normals if not provided
          if (newNormals.length === 0) {
            subdividedGeometry.computeVertexNormals();
          }
          
          currentGeometry = subdividedGeometry;
        }
      }
      
      // Console log removed
      return currentGeometry;
      
    } catch (error) {
      console.warn('PuffPrintTool: Subdivision failed, using original geometry:', error);
      return geometry;
    }
  };

  // Function to safely smooth geometry using Laplacian smoothing
  const smoothGeometry = (geometry: THREE.BufferGeometry, smoothingIterations: number): THREE.BufferGeometry => {
    // Console log removed
    
    try {
      const smoothedGeometry = geometry.clone();
      const positionAttribute = smoothedGeometry.getAttribute('position');
      const indexAttribute = smoothedGeometry.index;
      
      if (!positionAttribute) {
        console.warn('PuffPrintTool: No position attribute found, skipping smoothing');
        return geometry;
      }
      
      const positions = positionAttribute.array;
      const indices = indexAttribute ? indexAttribute.array : [];
      const newPositions = new Float32Array(positions);
      
      // Build adjacency map for better smoothing
      const adjacencyMap = new Map<number, Set<number>>();
      
      // Initialize adjacency map
      for (let i = 0; i < positions.length / 3; i++) {
        adjacencyMap.set(i, new Set());
      }
      
      // Build adjacency from triangles
      for (let i = 0; i < indices.length; i += 3) {
        const i1 = indices[i];
        const i2 = indices[i + 1];
        const i3 = indices[i + 2];
        
        // Add adjacency relationships
        adjacencyMap.get(i1)!.add(i2);
        adjacencyMap.get(i1)!.add(i3);
        adjacencyMap.get(i2)!.add(i1);
        adjacencyMap.get(i2)!.add(i3);
        adjacencyMap.get(i3)!.add(i1);
        adjacencyMap.get(i3)!.add(i2);
      }
      
      // Apply Laplacian smoothing
      for (let iteration = 0; iteration < smoothingIterations; iteration++) {
        const tempPositions = new Float32Array(newPositions);
        
        for (let vertexIndex = 0; vertexIndex < positions.length / 3; vertexIndex++) {
          const neighbors = adjacencyMap.get(vertexIndex);
          if (!neighbors || neighbors.size === 0) continue;
          
          // Calculate Laplacian (average of neighbors)
          let sumX = 0, sumY = 0, sumZ = 0;
          let neighborCount = 0;
          
          for (const neighborIndex of neighbors) {
            sumX += tempPositions[neighborIndex * 3];
            sumY += tempPositions[neighborIndex * 3 + 1];
            sumZ += tempPositions[neighborIndex * 3 + 2];
            neighborCount++;
          }
          
          if (neighborCount > 0) {
            // Apply smoothing with conservative factor
            const smoothingFactor = 0.1; // Conservative smoothing to avoid mesh patterns
            const avgX = sumX / neighborCount;
            const avgY = sumY / neighborCount;
            const avgZ = sumZ / neighborCount;
            
            // Blend original position with smoothed position
            newPositions[vertexIndex * 3] = tempPositions[vertexIndex * 3] * (1 - smoothingFactor) + avgX * smoothingFactor;
            newPositions[vertexIndex * 3 + 1] = tempPositions[vertexIndex * 3 + 1] * (1 - smoothingFactor) + avgY * smoothingFactor;
            newPositions[vertexIndex * 3 + 2] = tempPositions[vertexIndex * 3 + 2] * (1 - smoothingFactor) + avgZ * smoothingFactor;
          }
        }
      }
      
      // Update the geometry with smoothed positions
      smoothedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
      smoothedGeometry.computeVertexNormals();
      
      // Console log removed
      return smoothedGeometry;
      
    } catch (error) {
      console.warn('PuffPrintTool: Smoothing failed, using original geometry:', error);
      return geometry;
    }
  };

  // Function to get or create modified geometry for a mesh
  const getModifiedGeometry = (mesh: THREE.Mesh, meshId: string): THREE.BufferGeometry => {
    // Check if we already have a modified geometry for this mesh
    let modifiedGeometry = modifiedGeometryCache.current.get(meshId);
    
    if (!modifiedGeometry) {
      // Store original geometry if not already stored
      if (!originalGeometryCache.current.has(meshId)) {
        originalGeometryCache.current.set(meshId, mesh.geometry.clone());
      }
      
      try {
        // Create modified geometry with subdivision and smoothing
        let processedGeometry = mesh.geometry.clone();
        
        // Apply subdivision only if level > 1
        if (subdivisionLevel > 1) {
          processedGeometry = subdivideGeometry(processedGeometry, subdivisionLevel);
        }
        
        // Apply smoothing if enabled
        if (autoSmooth && smoothingLevel > 0) {
          processedGeometry = smoothGeometry(processedGeometry, smoothingLevel);
        }
        
        modifiedGeometry = processedGeometry;
        modifiedGeometryCache.current.set(meshId, modifiedGeometry);
        
        // Console log removed
      } catch (error) {
        console.warn(`PuffPrintTool: Failed to create modified geometry for ${meshId}, using original:`, error);
        // Fallback to original geometry if subdivision fails
        modifiedGeometry = originalGeometryCache.current.get(meshId) || mesh.geometry;
      }
    }
    
    return modifiedGeometry;
  };

  // Store original model state before any puff effects
  const storeOriginalModelState = () => {
    if (!modelScene) return;
    
    // Console log removed
    
    modelScene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        const meshId = child.uuid || child.name || 'unknown';
        
        // Store original material and geometry
        const originalMaterial = Array.isArray(child.material) 
          ? child.material.map((mat: THREE.Material) => mat.clone())
          : child.material.clone();
        const originalGeometry = child.geometry.clone();
        
        originalModelState.current.set(meshId, {
          material: originalMaterial,
          geometry: originalGeometry
        });
        
        // Console log removed
      }
    });
  };

  // Restore original model state
  const restoreOriginalModelState = () => {
    if (!modelScene) return;
    
    // Console log removed
    
    modelScene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        const meshId = child.uuid || child.name || 'unknown';
        const originalState = originalModelState.current.get(meshId);
        
        if (originalState) {
          // Restore original material and geometry
          child.material = originalState.material;
          child.geometry = originalState.geometry;
          
          // Console log removed
        }
      }
    });
  };

  // Initialize pattern library
  useEffect(() => {
    const patterns = [
      {
        id: 'polka-dots',
        name: 'Polka Dots',
        preview: '⚫⚪⚫',
        pattern: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
          const dotSize = size * 0.3;
          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      },
      {
        id: 'stripes',
        name: 'Stripes',
        preview: '▬▬▬',
        pattern: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
          ctx.fillRect(x - size/2, y - size/4, size, size/2);
        }
      },
      {
        id: 'diamonds',
        name: 'Diamonds',
        preview: '◆◆◆',
        pattern: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
          const halfSize = size / 2;
          ctx.beginPath();
          ctx.moveTo(x, y - halfSize);
          ctx.lineTo(x + halfSize, y);
          ctx.lineTo(x, y + halfSize);
          ctx.lineTo(x - halfSize, y);
          ctx.closePath();
          ctx.fill();
        }
      },
      {
        id: 'hearts',
        name: 'Hearts',
        preview: '♥♥♥',
        pattern: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
          const scale = size / 20;
          ctx.save();
          ctx.translate(x, y);
          ctx.scale(scale, scale);
          ctx.beginPath();
          ctx.moveTo(0, 5);
          ctx.bezierCurveTo(-5, -5, -15, -5, -15, 5);
          ctx.bezierCurveTo(-15, 15, 0, 25, 0, 35);
          ctx.bezierCurveTo(0, 25, 15, 15, 15, 5);
          ctx.bezierCurveTo(15, -5, 5, -5, 0, 5);
          ctx.fill();
          ctx.restore();
        }
      },
      {
        id: 'stars',
        name: 'Stars',
        preview: '★★★',
        pattern: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
          const scale = size / 20;
          ctx.save();
          ctx.translate(x, y);
          ctx.scale(scale, scale);
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5;
            const radius = i % 2 === 0 ? 10 : 4;
            const px = Math.cos(angle) * radius;
            const py = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }
    ];
    setPuffPatterns(patterns);
  }, []);

  // Initialize puff and displacement canvases
  useEffect(() => {
    if (!composedCanvas) return;

    // Console log removed

    // Store original model state before any puff effects
    storeOriginalModelState();

    // Create puff canvas for color/texture
    const puffCanvas = document.createElement('canvas');
    puffCanvas.width = composedCanvas.width;
    puffCanvas.height = composedCanvas.height;
    
    const puffCtx = puffCanvas.getContext('2d', { willReadFrequently: true })!;
    puffCtx.fillStyle = 'rgba(0, 0, 0, 0)';
    puffCtx.fillRect(0, 0, puffCanvas.width, puffCanvas.height);
    
    setPuffCanvas(puffCanvas);
    ctxRef.current = puffCtx;

    // Create displacement canvas for height/bump mapping
    const displacementCanvas = document.createElement('canvas');
    displacementCanvas.width = composedCanvas.width;
    displacementCanvas.height = composedCanvas.height;
    
    const displacementCtx = displacementCanvas.getContext('2d', { willReadFrequently: true })!;
    displacementCtx.fillStyle = 'rgba(0, 0, 0, 0)';
    displacementCtx.fillRect(0, 0, displacementCanvas.width, displacementCanvas.height);
    
    setDisplacementCanvas(displacementCanvas);
    displacementCtxRef.current = displacementCtx;

    // Create initial layer
    const initialLayer = {
      id: 'layer-1',
      name: 'Base Layer',
      visible: true,
      opacity: 1.0,
      blendMode: 'normal',
      canvas: puffCanvas
    };
    setPuffLayers([initialLayer]);
    setActiveLayer('layer-1');

    // Console log removed
  }, [composedCanvas]);

  // Apply puff effects to the model with displacement mapping (optimized to prevent context loss)
  const applyPuffToModel = () => {
    if (!puffCanvas || !displacementCanvas || !composedCanvas || !modelScene) {
      console.log('PuffPrintTool: Missing required data for applyPuffToModel', {
        puffCanvas: !!puffCanvas,
        displacementCanvas: !!displacementCanvas,
        composedCanvas: !!composedCanvas,
        modelScene: !!modelScene
      });
      return;
    }

    // Console log removed

    // Create a temporary canvas to blend the puff effects
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = composedCanvas.width;
    tempCanvas.height = composedCanvas.height;
    const tempCtx = tempCanvas.getContext('2d')!;

    // Draw the base composed canvas
    tempCtx.drawImage(composedCanvas, 0, 0);

    // Blend the puff effects on top with a more realistic puff appearance
    tempCtx.globalCompositeOperation = 'multiply';
    tempCtx.drawImage(puffCanvas, 0, 0);

    // Create displacement texture
    const displacementTexture = new THREE.CanvasTexture(displacementCanvas);
    displacementTexture.needsUpdate = true;
    
    // Check if there's any displacement data (non-transparent pixels)
    const displacementData = displacementCtxRef.current?.getImageData(0, 0, displacementCanvas.width, displacementCanvas.height);
    let hasDisplacement = false;
    
    if (displacementData) {
      // Check for any non-transparent pixels in the displacement map
      // Only consider pixels with alpha > 0 as valid displacement data
      for (let i = 0; i < displacementData.data.length; i += 4) {
        const a = displacementData.data[i + 3];
        
        // Only check alpha channel - if alpha is 0, the pixel is transparent (erased)
        if (a > 0) {
          hasDisplacement = true;
          break;
        }
      }
    }
    
    // Console log removed

    // If no displacement data, restore original model state
    if (!hasDisplacement) {
      // Console log removed
      restoreOriginalModelState();
      return;
    }

    // Apply the blended result to the model with subdivision and smoothing
    let meshCount = 0;
    modelScene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        meshCount++;
        const meshId = child.uuid || child.name || 'unknown';

        // Disable geometry modifications to prevent holes and broken vertices
        // Use only displacement maps for smooth puff effects
        // Keep original geometry intact to avoid mesh issues

        if (Array.isArray(child.material)) {
          child.material.forEach((mat: any, index: number) => {
            const materialId = `${meshId}_${index}`;
            
            // Check if we have a cached material for this mesh
            let cachedMaterial = materialCacheRef.current.get(materialId);
            
            if (!cachedMaterial) {
              // Create new material only if not cached
              cachedMaterial = new THREE.MeshStandardMaterial({
                map: new THREE.CanvasTexture(tempCanvas),
                displacementMap: hasDisplacement ? displacementTexture : null,
                displacementScale: hasDisplacement ? puffHeight * 2.0 : 0, // Only apply displacement if there's data
                displacementBias: 0,
                roughness: puffCurvature,
                metalness: 0.2,
                side: THREE.DoubleSide
              });
              materialCacheRef.current.set(materialId, cachedMaterial);
              // Console log removed
            } else {
              // Update existing cached material
              cachedMaterial.map = new THREE.CanvasTexture(tempCanvas);
              cachedMaterial.displacementMap = hasDisplacement ? displacementTexture : null;
              cachedMaterial.displacementScale = hasDisplacement ? puffHeight * 2.0 : 0;
              cachedMaterial.roughness = puffCurvature;
              cachedMaterial.needsUpdate = true;
              // Console log removed
            }

            // Replace the material
            child.material[index] = cachedMaterial;
          });
        } else {
          // Check if we have a cached material for this mesh
          let cachedMaterial = materialCacheRef.current.get(meshId);
          
          if (!cachedMaterial) {
            // Create new material only if not cached
            cachedMaterial = new THREE.MeshStandardMaterial({
              map: new THREE.CanvasTexture(tempCanvas),
              displacementMap: hasDisplacement ? displacementTexture : null,
              displacementScale: hasDisplacement ? puffHeight * 2.0 : 0, // Only apply displacement if there's data
              displacementBias: 0,
              roughness: puffCurvature,
              metalness: 0.2,
              side: THREE.DoubleSide
            });
            materialCacheRef.current.set(meshId, cachedMaterial);
            // Console log removed
          } else {
            // Update existing cached material
            cachedMaterial.map = new THREE.CanvasTexture(tempCanvas);
            cachedMaterial.displacementMap = hasDisplacement ? displacementTexture : null;
            cachedMaterial.displacementScale = hasDisplacement ? puffHeight * 2.0 : 0;
            cachedMaterial.roughness = puffCurvature;
            cachedMaterial.needsUpdate = true;
            // Console log removed
          }

          // Replace the material
          child.material = cachedMaterial;
        }
      }
    });

    // Console log removed

    // Commit the changes to the main canvas
    if (commit) {
      // Console log removed
      commit();
    }
  };

  // Create puff texture with shape-based appearance
  const createPuffTexture = (x: number, y: number, size: number, opacity: number) => {
    if (!ctxRef.current) {
      // Console log removed
      return;
    }

    const ctx = ctxRef.current;
    const puffSize = size * 2;

    // Console log removed

    // Use the puff color instead of brush color
    const color = new THREE.Color(puffColor);
    const r = Math.floor(color.r * 255);
    const g = Math.floor(color.g * 255);
    const b = Math.floor(color.b * 255);
    
    // Console log removed
    
    // Create shape-based puff texture
    switch (puffShape) {
      case 'cube':
        // Square shape with sharp edges
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.fillRect(x - puffSize / 2, y - puffSize / 2, puffSize, puffSize);
        break;
        
      case 'sphere':
        // Circular shape with radial gradient
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, puffSize / 2);
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity})`);
        gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${opacity * 0.8})`);
        gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${opacity * 0.5})`);
        gradient.addColorStop(0.8, `rgba(${r}, ${g}, ${b}, ${opacity * 0.3})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, puffSize / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'cylinder':
        // Elliptical shape for cylinder effect
        const cylinderGradient = ctx.createRadialGradient(x, y, 0, x, y, puffSize / 2);
        cylinderGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity})`);
        cylinderGradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${opacity * 0.6})`);
        cylinderGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        
        ctx.fillStyle = cylinderGradient;
        ctx.beginPath();
        ctx.ellipse(x, y, puffSize / 2, puffSize / 3, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'pipe':
        // Ring shape for pipe effect
        const pipeGradient = ctx.createRadialGradient(x, y, puffSize / 4, x, y, puffSize / 2);
        pipeGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
        pipeGradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${opacity * 0.8})`);
        pipeGradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${opacity * 0.8})`);
        pipeGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        
        ctx.fillStyle = pipeGradient;
        ctx.beginPath();
        ctx.arc(x, y, puffSize / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    // Console log removed
  };

  // Create displacement map for height effect with shape-based top surface
  const createDisplacementMap = (x: number, y: number, size: number, opacity: number) => {
    if (!displacementCtxRef.current) {
      // Console log removed
      return;
    }

    const ctx = displacementCtxRef.current;
    const puffSize = size * 2;

    // Console log removed

    // Use shape-based displacement to create proper top surface
    const maxHeight = Math.floor(opacity * 255);
    
    // Create shape-based displacement maps for realistic top surfaces
    switch (puffShape) {
      case 'cube':
        // Square shape with flat top surface
        ctx.fillStyle = `rgba(${maxHeight}, ${maxHeight}, ${maxHeight}, ${opacity})`;
        ctx.fillRect(x - puffSize / 2, y - puffSize / 2, puffSize, puffSize);
        break;
        
      case 'sphere':
        // Spherical shape with curved top surface
        const sphereGradient = ctx.createRadialGradient(x, y, 0, x, y, puffSize / 2);
        sphereGradient.addColorStop(0, `rgba(${maxHeight}, ${maxHeight}, ${maxHeight}, ${opacity})`);
        sphereGradient.addColorStop(0.3, `rgba(${Math.floor(maxHeight * 0.95)}, ${Math.floor(maxHeight * 0.95)}, ${Math.floor(maxHeight * 0.95)}, ${opacity * 0.95})`);
        sphereGradient.addColorStop(0.6, `rgba(${Math.floor(maxHeight * 0.8)}, ${Math.floor(maxHeight * 0.8)}, ${Math.floor(maxHeight * 0.8)}, ${opacity * 0.8})`);
        sphereGradient.addColorStop(0.8, `rgba(${Math.floor(maxHeight * 0.5)}, ${Math.floor(maxHeight * 0.5)}, ${Math.floor(maxHeight * 0.5)}, ${opacity * 0.5})`);
        sphereGradient.addColorStop(1, `rgba(0, 0, 0, 0)`);
        
        ctx.fillStyle = sphereGradient;
        ctx.beginPath();
        ctx.arc(x, y, puffSize / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'cylinder':
        // Cylindrical shape with flat top and curved sides
        const cylinderGradient = ctx.createRadialGradient(x, y, 0, x, y, puffSize / 2);
        cylinderGradient.addColorStop(0, `rgba(${maxHeight}, ${maxHeight}, ${maxHeight}, ${opacity})`);
        cylinderGradient.addColorStop(0.2, `rgba(${maxHeight}, ${maxHeight}, ${maxHeight}, ${opacity})`);
        cylinderGradient.addColorStop(0.4, `rgba(${Math.floor(maxHeight * 0.9)}, ${Math.floor(maxHeight * 0.9)}, ${Math.floor(maxHeight * 0.9)}, ${opacity * 0.9})`);
        cylinderGradient.addColorStop(0.7, `rgba(${Math.floor(maxHeight * 0.6)}, ${Math.floor(maxHeight * 0.6)}, ${Math.floor(maxHeight * 0.6)}, ${opacity * 0.6})`);
        cylinderGradient.addColorStop(1, `rgba(0, 0, 0, 0)`);
        
        ctx.fillStyle = cylinderGradient;
        ctx.beginPath();
        ctx.ellipse(x, y, puffSize / 2, puffSize / 3, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'pipe':
        // Ring shape with flat top and curved edges
        const pipeGradient = ctx.createRadialGradient(x, y, puffSize / 4, x, y, puffSize / 2);
        pipeGradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
        pipeGradient.addColorStop(0.1, `rgba(${Math.floor(maxHeight * 0.3)}, ${Math.floor(maxHeight * 0.3)}, ${Math.floor(maxHeight * 0.3)}, ${opacity * 0.3})`);
        pipeGradient.addColorStop(0.3, `rgba(${maxHeight}, ${maxHeight}, ${maxHeight}, ${opacity})`);
        pipeGradient.addColorStop(0.7, `rgba(${maxHeight}, ${maxHeight}, ${maxHeight}, ${opacity})`);
        pipeGradient.addColorStop(0.9, `rgba(${Math.floor(maxHeight * 0.3)}, ${Math.floor(maxHeight * 0.3)}, ${Math.floor(maxHeight * 0.3)}, ${opacity * 0.3})`);
        pipeGradient.addColorStop(1, `rgba(0, 0, 0, 0)`);
        
        ctx.fillStyle = pipeGradient;
        ctx.beginPath();
        ctx.arc(x, y, puffSize / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    // Console log removed
  };

  // Handle painting on puff canvas
  const handlePaint = (uv: { u: number; v: number }, pressure: number = 1.0) => {
    if (!puffCanvas || !displacementCanvas) {
      // Console log removed
      return;
    }

    const x = Math.round(uv.u * puffCanvas.width);
    const y = Math.round(uv.v * puffCanvas.height);
    
    const size = usePressureSize ? puffBrushSize * pressure : puffBrushSize;
    const opacity = usePressureOpacity ? puffBrushOpacity * pressure : puffBrushOpacity;

    // Console log removed

    // Create puff texture with current puff settings
    createPuffTexture(x, y, size, opacity);
    
    // Create displacement map with current height setting
    createDisplacementMap(x, y, size, opacity);

    // Apply symmetry
    if (symmetryY) {
      const symX = puffCanvas.width - x;
      // Console log removed
      createPuffTexture(symX, y, size, opacity);
      createDisplacementMap(symX, y, size, opacity);
    }

    if (symmetryZ) {
      const symY = puffCanvas.height - y;
      // Console log removed
      createPuffTexture(x, symY, size, opacity);
      createDisplacementMap(x, symY, size, opacity);
    }

    // Apply the puff effects to the model immediately with current settings
    // Console log removed
    applyPuffToModel();

    // Update last point for line drawing
    setLastPoint({ x, y });
  };

  // Handle line drawing between points
  const drawLine = (start: { x: number; y: number }, end: { x: number; y: number }, pressure: number = 1.0) => {
    if (!puffCanvas || !displacementCanvas) return;

    const size = usePressureSize ? puffBrushSize * pressure : puffBrushSize;
    const opacity = usePressureOpacity ? puffBrushOpacity * pressure : puffBrushOpacity;

    // Console log removed

    // Draw line on both canvases using current puff settings
    if (ctxRef.current) {
      const ctx = ctxRef.current;
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = puffColor; // Use puff color instead of brush color
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.restore();
    }

    if (displacementCtxRef.current) {
      const ctx = displacementCtxRef.current;
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.globalCompositeOperation = 'source-over';
      
      // Use shape-based height for line drawing
      const maxHeight = Math.floor(opacity * 255);
      
      // Create shape-based line drawing
      switch (puffShape) {
        case 'cube':
          // Flat line for cube shape
          ctx.strokeStyle = `rgba(${maxHeight}, ${maxHeight}, ${maxHeight}, ${opacity})`;
          break;
        case 'sphere':
          // Curved line for sphere shape
          ctx.strokeStyle = `rgba(${maxHeight}, ${maxHeight}, ${maxHeight}, ${opacity})`;
          break;
        case 'cylinder':
          // Flat line for cylinder shape
          ctx.strokeStyle = `rgba(${maxHeight}, ${maxHeight}, ${maxHeight}, ${opacity})`;
          break;
        case 'pipe':
          // Flat line for pipe shape
          ctx.strokeStyle = `rgba(${maxHeight}, ${maxHeight}, ${maxHeight}, ${opacity})`;
          break;
      }
      
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.restore();
    }

    // Apply the puff effects to the model immediately with current settings
    applyPuffToModel();
  };

  // Handle erasing on puff canvas
  const handleErase = (uv: { u: number; v: number }, pressure: number = 1.0) => {
    if (!puffCanvas || !displacementCanvas) {
      // Console log removed
      return;
    }

    const x = Math.round(uv.u * puffCanvas.width);
    const y = Math.round(uv.v * puffCanvas.height);
    
    const size = usePressureSize ? puffBrushSize * pressure : puffBrushSize;
    const opacity = usePressureOpacity ? puffBrushOpacity * pressure : puffBrushOpacity;

    // Console log removed
    
    // Check displacement canvas before erasing
    const beforeData = displacementCtxRef.current?.getImageData(0, 0, displacementCanvas.width, displacementCanvas.height);
    let beforeHasData = false;
    if (beforeData) {
      for (let i = 0; i < beforeData.data.length; i += 4) {
        const a = beforeData.data[i + 3];
        if (a > 0) {
          beforeHasData = true;
          break;
        }
      }
    }
    // Console log removed

    // Erase from puff canvas
    if (ctxRef.current) {
      const ctx = ctxRef.current;
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out'; // Erase mode
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Erase from displacement canvas
    if (displacementCtxRef.current) {
      const ctx = displacementCtxRef.current;
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out'; // Erase mode
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Apply symmetry for erasing
    if (symmetryY) {
      const symX = puffCanvas.width - x;
      // Console log removed
      
      if (ctxRef.current) {
        const ctx = ctxRef.current;
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(symX, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (displacementCtxRef.current) {
        const ctx = displacementCtxRef.current;
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(symX, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    if (symmetryZ) {
      const symY = puffCanvas.height - y;
      // Console log removed
      
      if (ctxRef.current) {
        const ctx = ctxRef.current;
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(x, symY, size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (displacementCtxRef.current) {
        const ctx = displacementCtxRef.current;
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(x, symY, size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Check displacement canvas after erasing
    const afterData = displacementCtxRef.current?.getImageData(0, 0, displacementCanvas.width, displacementCanvas.height);
    let afterHasData = false;
    if (afterData) {
      for (let i = 0; i < afterData.data.length; i += 4) {
        const a = afterData.data[i + 3];
        if (a > 0) {
          afterHasData = true;
          break;
        }
      }
    }
    // Console log removed

    // Apply the changes to the model immediately
    // Console log removed
    applyPuffToModel();
  };

  // Listen for painting events from the main system
  useEffect(() => {
    if (!puffCanvas) return;

    // Console log removed

    // Create a custom event listener for puff print painting
    const handlePuffPaint = (e: CustomEvent) => {
      const { uv, pressure = 1.0 } = e.detail;
      if (uv && activeTool === 'puffPrint') {
        // Console log removed
        handlePaint(uv, pressure);
      }
    };

    // Create a custom event listener for erasing
    const handlePuffErase = (e: CustomEvent) => {
      const { uv, pressure = 1.0 } = e.detail;
      // Console log removed
      if (uv && activeTool === 'eraser') {
        // Console log removed
        handleErase(uv, pressure);
      } else {
        // Console log removed
      }
    };

    // Listen for both paint and erase events
    document.addEventListener('puffPaint', handlePuffPaint as EventListener);
    document.addEventListener('puffErase', handlePuffErase as EventListener);

    return () => {
      document.removeEventListener('puffPaint', handlePuffPaint as EventListener);
      document.removeEventListener('puffErase', handlePuffErase as EventListener);
    };
  }, [activeTool, puffCanvas, puffColor, puffHeight, puffCurvature, puffShape, subdivisionLevel, autoSmooth, smoothingLevel]);

  // Restore original model state only when switching to tools that don't interact with puff prints
  useEffect(() => {
    if (!active && modelScene && activeTool !== 'eraser' && activeTool !== 'puffPrint') {
      // Console log removed
      restoreOriginalModelState();
    }
  }, [active, modelScene, activeTool]);

  // Keep puff effects visible when eraser is active
  useEffect(() => {
    if (activeTool === 'eraser' && modelScene && puffCanvas && displacementCanvas) {
      // Console log removed
      // Reapply puff effects to keep them visible during erasing
      applyPuffToModel();
    }
  }, [activeTool, modelScene, puffCanvas, displacementCanvas]);

  // Clear puff canvas
  const clearPuffCanvas = () => {
    if (!puffCanvas || !displacementCanvas) return;

    // Console log removed

    if (ctxRef.current) {
      const ctx = ctxRef.current;
      ctx.clearRect(0, 0, puffCanvas.width, puffCanvas.height);
    }

    if (displacementCtxRef.current) {
      const ctx = displacementCtxRef.current;
      ctx.clearRect(0, 0, displacementCanvas.width, displacementCanvas.height);
    }
    
    // Clear material cache to prevent memory leaks
    materialCacheRef.current.clear();
    
    // No need to restore geometries since we're not modifying them
    
    // Apply the cleared canvas to the model
    applyPuffToModel();
  };

  // Layer management functions
  const addLayer = () => {
    if (!composedCanvas) return;
    
    const newLayer = {
      id: `layer-${Date.now()}`,
      name: `Layer ${puffLayers.length + 1}`,
      visible: true,
      opacity: 1.0,
      blendMode: 'normal',
      canvas: document.createElement('canvas')
    };
    newLayer.canvas.width = composedCanvas.width;
    newLayer.canvas.height = composedCanvas.height;
    
    setPuffLayers(prev => [...prev, newLayer]);
    setActiveLayer(newLayer.id);
  };

  const deleteLayer = (layerId: string) => {
    if (puffLayers.length <= 1) return; // Don't delete the last layer
    
    setPuffLayers(prev => prev.filter(layer => layer.id !== layerId));
    if (activeLayer === layerId) {
      const remainingLayers = puffLayers.filter(layer => layer.id !== layerId);
      setActiveLayer(remainingLayers[0]?.id || null);
    }
  };

  const updateLayer = (layerId: string, updates: Partial<typeof puffLayers[0]>) => {
    setPuffLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, ...updates } : layer
    ));
  };

  // Pattern painting function
  const paintPattern = (uv: { u: number; v: number }, pressure: number = 1.0) => {
    if (!puffCanvas || !selectedPattern) return;

    const pattern = puffPatterns.find(p => p.id === selectedPattern);
    if (!pattern) return;

    const x = Math.round(uv.u * puffCanvas.width);
    const y = Math.round(uv.v * puffCanvas.height);
    const size = usePressureSize ? puffBrushSize * pressure : puffBrushSize;
    const opacity = usePressureOpacity ? puffBrushOpacity * pressure : puffBrushOpacity;

    // Apply rotation and scaling
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = puffColor;
    ctx.translate(x, y);
    ctx.rotate((patternRotation * Math.PI) / 180);
    ctx.scale(patternScale, patternScale);
    
    pattern.pattern(ctx, 0, 0, size);
    ctx.restore();

    // Apply to displacement canvas
    if (displacementCtxRef.current) {
      const dispCtx = displacementCtxRef.current;
      dispCtx.save();
      dispCtx.globalAlpha = opacity;
      dispCtx.fillStyle = `rgba(${Math.round(puffHeight * 255)}, 0, 0, 1)`;
      dispCtx.translate(x, y);
      dispCtx.rotate((patternRotation * Math.PI) / 180);
      dispCtx.scale(patternScale, patternScale);
      
      pattern.pattern(dispCtx, 0, 0, size);
      dispCtx.restore();
    }

    applyPuffToModel();
  };

  // Export puff map
  const exportPuffMap = () => {
    if (!puffCanvas) return;

    const link = document.createElement('a');
    link.download = 'puff-map.png';
    link.href = puffCanvas.toDataURL();
    link.click();
  };

  // Show the tool when it's active OR when eraser is active (for erasing puff prints)
  if (!active && activeTool !== 'eraser') return null;

  return (
    <div className="puff-print-tool" style={{ 
      border: '2px solid #ff69b4', 
      borderRadius: '8px', 
      padding: '8px',
      background: 'rgba(255, 105, 180, 0.1)',
      boxShadow: '0 0 10px rgba(255, 105, 180, 0.3)',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: '-8px',
        right: '-8px',
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        background: '#ff69b4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        color: 'white',
        fontWeight: 'bold'
      }}>
        ✓
      </div>
      <div className="tool-header">
        <h4>🎨 Puff Print Tool {activeTool === 'eraser' && '(Eraser Mode)'}</h4>
        <div className="tool-controls">
          <button className="btn" onClick={clearPuffCanvas} title="Clear Puff Map">
            🗑
          </button>
          <button className="btn" onClick={exportPuffMap} title="Export Puff Map">
            💾
          </button>
          <button 
            className="btn" 
            onClick={() => useApp.getState().setTool('brush')} 
            title="Close Puff Print Tool"
            style={{ background: '#EF4444', color: 'white' }}
          >
            ✕ Close
          </button>
        </div>
      </div>
      
      {/* Puff Print Controls */}
      <div className="puff-controls" style={{ marginTop: '12px' }}>
        <div className="control-group">
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#ff69b4' }}>Puff Color:</label>
          <input
            type="color"
            value={puffColor}
            onChange={(e) => setPuffColor(e.target.value)}
            style={{ width: '100%', height: '30px', border: '1px solid #ff69b4', borderRadius: '4px' }}
          />
        </div>
        
        <div className="control-group" style={{ marginTop: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#ff69b4' }}>Brush Size: {puffBrushSize}</label>
          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={puffBrushSize}
            onChange={(e) => setPuffBrushSize(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div className="control-group" style={{ marginTop: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#ff69b4' }}>Brush Opacity: {Math.round(puffBrushOpacity * 100)}%</label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            value={puffBrushOpacity}
            onChange={(e) => setPuffBrushOpacity(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div className="control-group" style={{ marginTop: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#ff69b4' }}>Height: {puffHeight}</label>
          <input
            type="range"
            min="0.1"
            max="5.0"
            step="0.1"
            value={puffHeight}
            onChange={(e) => setPuffHeight(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div className="control-group" style={{ marginTop: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#ff69b4' }}>Curvature: {puffCurvature}</label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            value={puffCurvature}
            onChange={(e) => setPuffCurvature(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
                 <div className="control-group" style={{ marginTop: '8px' }}>
           <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#ff69b4' }}>Shape:</label>
           <select
             value={puffShape}
             onChange={(e) => setPuffShape(e.target.value as any)}
             style={{ width: '100%', padding: '4px', border: '1px solid #ff69b4', borderRadius: '4px' }}
           >
             <option value="sphere">🌐 Sphere</option>
             <option value="cube">⬜ Cube</option>
             <option value="cylinder">🔲 Cylinder</option>
             <option value="pipe">⭕ Pipe</option>
           </select>
         </div>
         
         {/* Displacement Map Quality Controls */}
         <div style={{ marginTop: '16px', padding: '8px', background: 'rgba(255, 105, 180, 0.05)', borderRadius: '4px', border: '1px solid rgba(255, 105, 180, 0.2)' }}>
           <h5 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 'bold', color: '#ff69b4' }}>🎨 Displacement Quality</h5>
           
           <div style={{ fontSize: '10px', color: '#67e8f9', marginTop: '4px', padding: '6px', background: 'rgba(103, 232, 249, 0.1)', borderRadius: '4px' }}>
             ✅ <strong>Safe Mode:</strong> Using displacement maps only - no mesh modification to prevent holes and broken vertices
           </div>
           
           <div className="control-group" style={{ marginTop: '8px' }}>
             <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#ff69b4' }}>Displacement Quality: {subdivisionLevel}</label>
             <input
               type="range"
               min="1"
               max="4"
               step="1"
               value={subdivisionLevel}
               onChange={(e) => setSubdivisionLevel(parseInt(e.target.value))}
               style={{ width: '100%' }}
             />
             <div style={{ fontSize: '10px', color: '#ff69b4', marginTop: '2px' }}>
               {subdivisionLevel === 1 && 'Basic - Standard displacement quality'}
               {subdivisionLevel === 2 && 'Enhanced - Better displacement detail'}
               {subdivisionLevel === 3 && 'High - High-quality displacement'}
               {subdivisionLevel === 4 && 'Ultra - Maximum displacement quality'}
             </div>
           </div>
           
           <div className="control-group" style={{ marginTop: '8px' }}>
             <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#ff69b4', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <input
                 type="checkbox"
                 checked={autoSmooth}
                 onChange={(e) => setAutoSmooth(e.target.checked)}
                 style={{ transform: 'scale(1.2)' }}
               />
               Displacement Smoothing
             </label>
             <div style={{ fontSize: '10px', color: '#ff69b4', marginTop: '2px' }}>
               {autoSmooth ? '✅ Smooth displacement gradients enabled' : '❌ Sharp displacement edges'}
             </div>
           </div>
           
           {autoSmooth && (
             <div className="control-group" style={{ marginTop: '8px' }}>
               <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#ff69b4' }}>Smoothing Level: {smoothingLevel}</label>
               <input
                 type="range"
                 min="1"
                 max="5"
                 step="1"
                 value={smoothingLevel}
                 onChange={(e) => setSmoothingLevel(parseInt(e.target.value))}
                 style={{ width: '100%' }}
               />
               <div style={{ fontSize: '10px', color: '#ff69b4', marginTop: '2px' }}>
                 {smoothingLevel === 1 && 'Light (Sharp edges)'}
                 {smoothingLevel === 2 && 'Medium (Smooth edges)'}
                 {smoothingLevel === 3 && 'High (Very smooth)'}
                 {smoothingLevel === 4 && 'Very High (Ultra smooth)'}
                 {smoothingLevel === 5 && 'Maximum (Perfect smooth)'}
               </div>
             </div>
           )}
         </div>
       </div>

       {/* Advanced Features */}
       <div style={{ marginTop: '16px', padding: '8px', background: 'rgba(255, 105, 180, 0.05)', borderRadius: '4px', border: '1px solid rgba(255, 105, 180, 0.2)' }}>
         <h5 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 'bold', color: '#ff69b4' }}>🎨 Advanced Features</h5>
         
         {/* Pattern Library */}
         <div className="control-group" style={{ marginTop: '8px' }}>
           <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#ff69b4' }}>Pattern Library:</label>
           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
             {puffPatterns.map(pattern => (
               <button
                 key={pattern.id}
                 onClick={() => {
                   setSelectedPattern(pattern.id);
                   setIsPatternMode(true);
                 }}
                 style={{
                   padding: '4px 8px',
                   fontSize: '10px',
                   border: selectedPattern === pattern.id ? '2px solid #ff69b4' : '1px solid #ccc',
                   borderRadius: '4px',
                   background: selectedPattern === pattern.id ? '#ff69b4' : 'white',
                   color: selectedPattern === pattern.id ? 'white' : '#333',
                   cursor: 'pointer'
                 }}
                 title={pattern.name}
               >
                 {pattern.preview} {pattern.name}
               </button>
             ))}
           </div>
         </div>

         {/* Pattern Controls */}
         {isPatternMode && selectedPattern && (
           <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(255, 105, 180, 0.1)', borderRadius: '4px' }}>
             <div className="control-group">
               <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#ff69b4' }}>Pattern Scale: {patternScale.toFixed(1)}x</label>
               <input
                 type="range"
                 min="0.5"
                 max="3.0"
                 step="0.1"
                 value={patternScale}
                 onChange={(e) => setPatternScale(parseFloat(e.target.value))}
                 style={{ width: '100%' }}
               />
             </div>
             
             <div className="control-group" style={{ marginTop: '8px' }}>
               <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#ff69b4' }}>Pattern Rotation: {patternRotation}°</label>
               <input
                 type="range"
                 min="0"
                 max="360"
                 step="15"
                 value={patternRotation}
                 onChange={(e) => setPatternRotation(parseInt(e.target.value))}
                 style={{ width: '100%' }}
               />
             </div>
             
             <button
               onClick={() => setIsPatternMode(false)}
               style={{
                 marginTop: '8px',
                 padding: '4px 8px',
                 fontSize: '10px',
                 background: '#EF4444',
                 color: 'white',
                 border: 'none',
                 borderRadius: '4px',
                 cursor: 'pointer'
               }}
             >
               Exit Pattern Mode
             </button>
           </div>
         )}

         {/* Layer Management */}
         <div className="control-group" style={{ marginTop: '8px' }}>
           <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#ff69b4' }}>Layers:</label>
           <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
             <button
               onClick={addLayer}
               style={{
                 padding: '4px 8px',
                 fontSize: '10px',
                 background: '#10B981',
                 color: 'white',
                 border: 'none',
                 borderRadius: '4px',
                 cursor: 'pointer'
               }}
             >
               + Add Layer
             </button>
           </div>
           
           <div style={{ marginTop: '8px', maxHeight: '120px', overflowY: 'auto' }}>
             {puffLayers.map(layer => (
               <div key={layer.id} style={{
                 display: 'flex',
                 alignItems: 'center',
                 gap: '8px',
                 padding: '4px',
                 background: activeLayer === layer.id ? 'rgba(255, 105, 180, 0.2)' : 'transparent',
                 borderRadius: '4px',
                 marginBottom: '2px'
               }}>
                 <input
                   type="checkbox"
                   checked={layer.visible}
                   onChange={(e) => updateLayer(layer.id, { visible: e.target.checked })}
                   style={{ transform: 'scale(0.8)' }}
                 />
                 <span style={{ fontSize: '10px', flex: 1 }}>{layer.name}</span>
                 <input
                   type="range"
                   min="0"
                   max="1"
                   step="0.1"
                   value={layer.opacity}
                   onChange={(e) => updateLayer(layer.id, { opacity: parseFloat(e.target.value) })}
                   style={{ width: '60px' }}
                 />
                 <button
                   onClick={() => setActiveLayer(layer.id)}
                   style={{
                     padding: '2px 6px',
                     fontSize: '8px',
                     background: activeLayer === layer.id ? '#ff69b4' : '#ccc',
                     color: 'white',
                     border: 'none',
                     borderRadius: '2px',
                     cursor: 'pointer'
                   }}
                 >
                   {activeLayer === layer.id ? 'Active' : 'Select'}
                 </button>
                 {puffLayers.length > 1 && (
                   <button
                     onClick={() => deleteLayer(layer.id)}
                     style={{
                       padding: '2px 6px',
                       fontSize: '8px',
                       background: '#EF4444',
                       color: 'white',
                       border: 'none',
                       borderRadius: '2px',
                       cursor: 'pointer'
                     }}
                   >
                     ×
                   </button>
                 )}
               </div>
             ))}
           </div>
         </div>

         {/* Grid Controls */}
         <div className="control-group" style={{ marginTop: '8px' }}>
           <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#ff69b4', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <input
               type="checkbox"
               checked={showGrid}
               onChange={(e) => setShowGrid(e.target.checked)}
               style={{ transform: 'scale(1.2)' }}
             />
             Show Grid
           </label>
           
           {showGrid && (
             <div style={{ marginTop: '4px' }}>
               <label style={{ fontSize: '10px', color: '#ff69b4' }}>Grid Size: {gridSize}px</label>
               <input
                 type="range"
                 min="10"
                 max="50"
                 step="5"
                 value={gridSize}
                 onChange={(e) => setGridSize(parseInt(e.target.value))}
                 style={{ width: '100%' }}
               />
               <label style={{ fontSize: '10px', color: '#ff69b4', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                 <input
                   type="checkbox"
                   checked={snapToGrid}
                   onChange={(e) => setSnapToGrid(e.target.checked)}
                   style={{ transform: 'scale(0.8)' }}
                 />
                 Snap to Grid
               </label>
             </div>
           )}
         </div>
       </div>
      
             <div className="tool-info" style={{ marginTop: '12px' }}>
         <p>✅ <strong>Active!</strong> Paint on the model to create realistic puff print effects.</p>
         <p>Use the controls above to adjust puff properties.</p>
         <p>Current brush: {brushShape} | Size: {puffBrushSize} | Opacity: {Math.round(puffBrushOpacity * 100)}%</p>
         {activeTool === 'eraser' && (
           <p style={{ color: '#ff6b6b', fontSize: '12px', fontWeight: 'bold' }}>
             🧽 <strong>Eraser Mode:</strong> Erasing puff print effects - click and drag to remove puff effects
           </p>
         )}
         {isPatternMode && selectedPattern && (
           <p style={{ color: '#10B981', fontSize: '12px', fontWeight: 'bold' }}>
             🎨 <strong>Pattern Mode:</strong> {puffPatterns.find(p => p.id === selectedPattern)?.name} - Click to place patterns
           </p>
         )}
         <p style={{ color: '#67e8f9', fontSize: '12px' }}>
           🎨 <strong>Displacement Quality:</strong> Controls the smoothness of puff effects without modifying mesh geometry
         </p>
         <p style={{ color: '#67e8f9', fontSize: '12px' }}>
           🔧 <strong>Displacement Smoothing:</strong> Creates smooth gradients for professional puff effects
         </p>
         <p style={{ color: '#4ade80', fontSize: '12px' }}>
           ✅ <strong>Safe Mode:</strong> No mesh modification - prevents holes and broken vertices
         </p>
         <p style={{ color: '#F59E0B', fontSize: '12px' }}>
           🎭 <strong>Pattern Library:</strong> Choose from predefined patterns for consistent designs
         </p>
         <p style={{ color: '#F59E0B', fontSize: '12px' }}>
           📚 <strong>Layer System:</strong> Create complex designs with multiple puff layers
         </p>
         <p style={{ color: '#F59E0B', fontSize: '12px' }}>
           📐 <strong>Grid Tools:</strong> Enable grid for precise alignment and measurements
         </p>
         {puffCanvas && (
           <p style={{ color: '#67e8f9', fontSize: '12px' }}>
             💡 Tip: Click and drag on the model to create raised puff effects
           </p>
         )}
       </div>
    </div>
  );
}
