import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useBrushEngine } from '../hooks/useBrushEngine';
import { useFrame } from '@react-three/fiber';
import { Html, Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { textureManager } from '../utils/TextureManager';
import { useUndoRedo } from '../hooks/useUndoRedo';
import { canvasPool } from '../utils/CanvasPool';
import { geometryManager } from '../utils/GeometryManager';
import { performanceOptimizer } from '../utils/PerformanceOptimizer';
import { adaptivePerformanceManager } from '../utils/AdaptivePerformanceManager';

// Import new modular components
import { ShirtRenderer } from './Shirt/ShirtRenderer';
// import { UVMapper } from './Shirt/UVMapper'; // TEMPORARILY DISABLED TO DEBUG
import { useLayerManager } from '../stores/LayerManager';
import { useAdvancedLayerStore } from '../core/AdvancedLayerSystem';
import { layerBridge } from '../core/LayerSystemBridge';
import { LAYER_SYSTEM_CONFIG } from '../config/LayerConfig';
import { layerPersistenceManager } from '../core/LayerPersistenceManager';
// import { Brush3DIntegration } from './Brush3DIntegrationNew'; // Using existing useApp painting system instead

// Import domain stores
import { useModelStore } from '../stores/domainStores';

// Import legacy store for model sync
import { useApp } from '../App';

// Import types
import { ModelData } from '../types/app';

// Helper function to convert hex color to RGB
const hexToRgb = (hex: string): {r: number, g: number, b: number} | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

interface ShirtRefactoredProps {
  showDebugInfo?: boolean;
  enableBrushPainting?: boolean;
}

/**
 * ShirtRefactored - 3D scene content only
 * This component provides the 3D scene elements that go inside a Canvas
 * It does NOT contain the Canvas wrapper - that's handled by the parent
 */
export function ShirtRefactored({
  showDebugInfo = false,
  enableBrushPainting = true
}: ShirtRefactoredProps) {
  // Initialize undo/redo system
  useUndoRedo();
  
  // Initialize brush engine for realistic brush effects
  const brushEngine = useBrushEngine();
  
  // Reduced logging frequency to prevent console spam
  if (Math.random() < 0.01) { // Only log 1% of the time
    console.log('🎯 ShirtRefactored component mounting with props:', { showDebugInfo, enableBrushPainting });
  }
  
  const [modelData, setModelData] = useState<ModelData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // PERFORMANCE: Enhanced FPS tracking and adaptive optimization
  useFrame(() => {
    // Update performance metrics for adaptive manager
    const config = performanceOptimizer.getConfig(); // Get current config dynamically
    const fps = config.targetFPS; // Use target FPS as approximation
    adaptivePerformanceManager.updatePerformanceMetrics(fps);
    
    // PERFORMANCE: Adaptive optimization based on actual performance
    if (performanceOptimizer.shouldUseAggressiveOptimizations()) {
      performanceOptimizer.forceGarbageCollection();
      
      // PERFORMANCE: Use adaptive settings for quality adjustments
      const settings = adaptivePerformanceManager.getEffectiveSettings();
      if (settings.textureQuality === 'low') {
        // Reduce texture resolution dynamically
        const optimalSize = adaptivePerformanceManager.getOptimalCanvasSize();
        // This could be used to dynamically resize canvases if needed
      }
    }
  });

  // Cleanup textures on component unmount to prevent memory leaks
  useEffect(() => {
    console.log('🎯 ShirtRefactored: Component mounted, setting up cleanup');
    return () => {
      console.log('🧠 ShirtRefactored: Cleaning up textures on unmount');
      // Note: We don't dispose all textures here as other components might be using them
      // Only dispose the specific texture we created
      textureManager.disposeTexture('model-texture');
    };
  }, []);

  // Get current tool state for conditional rendering
  const activeTool = useApp(state => state.activeTool);
  const vectorPaths = useApp(state => state.vectorPaths || []);
  const vectorMode = useApp(state => state.vectorMode);
  
  // Brush tool state management
  const paintingActiveRef = useRef(false);
  const lastTextureUpdateRef = useRef(0);
  const lastPuffUpdateRef = useRef(0);
  const isDraggingAnchorRef = useRef(false);
  const dragStartPosRef = useRef<{x: number, y: number} | null>(null);
  const textPromptActiveRef = useRef(false); // Prevent double text prompts
  const lastTextPromptTimeRef = useRef(0); // Track last prompt time
  const userManuallyEnabledControlsRef = useRef(false); // Track when user manually enables controls
  const setControlsEnabled = useApp(s => s.setControlsEnabled);
  console.log('🎯 ShirtRefactored: Brush tool state set up');
  
  // Get brush settings from useApp store
  console.log('🎯 ShirtRefactored: Getting brush settings...');
  const brushColor = useApp(s => s.brushColor);
  const brushSize = useApp(s => s.brushSize);
  const brushOpacity = useApp(s => s.brushOpacity);
  console.log('🎯 ShirtRefactored: Brush settings obtained:', { brushColor, brushSize, brushOpacity });
  const brushHardness = useApp(s => s.brushHardness);
  const brushFlow = useApp(s => s.brushFlow);
  const brushShape = useApp(s => s.brushShape);
  const brushSpacing = useApp(s => s.brushSpacing);
  const blendMode = useApp(s => s.blendMode);
  console.log('🎯 ShirtRefactored: Additional brush settings obtained');
  const getActiveLayer = useApp(s => s.getActiveLayer);
  // Use advanced layer system through bridge
  const modelScene = useApp(s => s.modelScene);
  const modelScale = useModelStore(s => s.modelScale);
  console.log('🎯 ShirtRefactored: Layer and model scene obtained:', { hasActiveLayer: !!getActiveLayer, hasModelScene: !!modelScene, modelScale });

  // Create displacement map for puff print 3D effects
  console.log('🎯 ShirtRefactored: About to define createDisplacementMap function...');
  const createDisplacementMap = useCallback((canvas: HTMLCanvasElement) => {
    // Use CanvasPool to prevent memory leaks
    const displacementCanvas = canvasPool.createTemporaryCanvas({ 
      width: canvas.width, 
      height: canvas.height 
    });
    const dispCtx = displacementCanvas.getContext('2d');
    
    if (!dispCtx) return null;

    // Create displacement map based on painted areas
    const imageData = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height);
    if (!imageData) return null;

    const dispImageData = dispCtx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    const dispData = dispImageData.data;

    // Get puff settings for enhanced displacement
    const puffSettings = useApp.getState();
    const puffHeight = puffSettings.puffHeight || 1.0;
    const puffCurvature = puffSettings.puffCurvature || 0.5;

    // Convert painted areas to height values for displacement
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha > 0) {
        // Create height based on alpha and puff settings with enhanced scaling for embroidery
        const baseHeight = (alpha / 255) * puffHeight;
        
        // Apply curvature-based height variation for more realistic 3D effect
        const curvatureFactor = THREE.MathUtils.lerp(0.3, 1.0, puffCurvature);
        
        // Enhanced displacement scaling for embroidery - much stronger 3D effect
        const displacementMultiplier = 1.5; // Increased from 0.3 to 1.5 for stronger effect
        const height = baseHeight * curvatureFactor * displacementMultiplier;
        
        // CRITICAL FIX: Ensure displacement is always outward (128+ = outward, <128 = inward)
        // Convert height to displacement map format where 128 = neutral, 255 = max outward
        // Use larger displacement range for embroidery to create more pronounced 3D effect
        const displacementRange = 100; // Increased from 63 to 100 for stronger displacement
        const displacementValue = Math.floor(THREE.MathUtils.clamp(128 + (height * displacementRange), 128, 228));
        
        dispData[i] = displacementValue;     // R
        dispData[i + 1] = displacementValue; // G
        dispData[i + 2] = displacementValue; // B
        dispData[i + 3] = 255;              // A
        
        console.log('🎨 Displacement value:', displacementValue, 'height:', height, 'alpha:', alpha);
      } else {
        // No displacement for transparent areas (neutral gray = 128)
        dispData[i] = 128;     // R (neutral)
        dispData[i + 1] = 128; // G (neutral)
        dispData[i + 2] = 128; // B (neutral)
        dispData[i + 3] = 255; // A
      }
    }

    dispCtx.putImageData(dispImageData, 0, 0);
    return displacementCanvas;
  }, []);

  console.log('🎯 ShirtRefactored: createDisplacementMap function defined successfully');

  // Create normal map for puff print 3D effects
  console.log('🎯 ShirtRefactored: About to define createNormalMap function...');
  const createNormalMap = useCallback((canvas: HTMLCanvasElement) => {
    const normalCanvas = document.createElement('canvas');
    normalCanvas.width = canvas.width;
    normalCanvas.height = canvas.height;
    const normalCtx = normalCanvas.getContext('2d');
    
    if (!normalCtx) return null;

    // Create normal map based on painted areas
    const imageData = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height);
    if (!imageData) return null;

    const normalImageData = normalCtx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    const normalData = normalImageData.data;

    // Generate normal vectors for 3D lighting
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const idx = (y * canvas.width + x) * 4;
        const alpha = data[idx + 3];
        
        if (alpha > 0) {
          // Calculate normal vector based on surrounding pixels
          const left = x > 0 ? data[((y * canvas.width + (x - 1)) * 4) + 3] : 0;
          const right = x < canvas.width - 1 ? data[((y * canvas.width + (x + 1)) * 4) + 3] : 0;
          const up = y > 0 ? data[(((y - 1) * canvas.width + x) * 4) + 3] : 0;
          const down = y < canvas.height - 1 ? data[(((y + 1) * canvas.width + x) * 4) + 3] : 0;
          
          // Calculate gradient
          const dx = (right - left) / 255;
          const dy = (down - up) / 255;
          const dz = Math.sqrt(1 - dx * dx - dy * dy);
          
          // Convert to normal map format (0-255 range)
          normalData[idx] = Math.floor((dx + 1) * 127.5);     // R (X component)
          normalData[idx + 1] = Math.floor((dy + 1) * 127.5); // G (Y component)
          normalData[idx + 2] = Math.floor((dz + 1) * 127.5); // B (Z component)
          normalData[idx + 3] = 255;                          // A
        } else {
          // Default normal (pointing up)
          normalData[idx] = 128;     // R
          normalData[idx + 1] = 128; // G
          normalData[idx + 2] = 255; // B
          normalData[idx + 3] = 255; // A
        }
      }
    }

    normalCtx.putImageData(normalImageData, 0, 0);
    return normalCanvas;
  }, []);

  console.log('🎯 ShirtRefactored: createNormalMap function defined successfully');

  // Helper function to subdivide geometry for better displacement
  console.log('🎯 ShirtRefactored: About to define subdivideGeometry function...');
  const subdivideGeometry = useCallback((geometry: THREE.BufferGeometry, subdivisions: number): THREE.BufferGeometry => {
    const positions = geometry.attributes.position.array;
    const normals = geometry.attributes.normal?.array;
    const uvs = geometry.attributes.uv?.array;
    const index = geometry.index?.array;

    if (!index) return geometry; // Can't subdivide without index

    const newPositions: number[] = [];
    const newNormals: number[] = [];
    const newUvs: number[] = [];
    const newIndices: number[] = [];

    // Simple subdivision by adding midpoints
    for (let i = 0; i < index.length; i += 3) {
      const a = index[i] * 3;
      const b = index[i + 1] * 3;
      const c = index[i + 2] * 3;

      // Get vertices
      const vA = new THREE.Vector3(positions[a], positions[a + 1], positions[a + 2]);
      const vB = new THREE.Vector3(positions[b], positions[b + 1], positions[b + 2]);
      const vC = new THREE.Vector3(positions[c], positions[c + 1], positions[c + 2]);

      // Create midpoints
      const midAB = new THREE.Vector3().addVectors(vA, vB).multiplyScalar(0.5);
      const midBC = new THREE.Vector3().addVectors(vB, vC).multiplyScalar(0.5);
      const midCA = new THREE.Vector3().addVectors(vC, vA).multiplyScalar(0.5);

      // Add vertices
      const baseIndex = newPositions.length / 3;
      newPositions.push(vA.x, vA.y, vA.z);
      newPositions.push(vB.x, vB.y, vB.z);
      newPositions.push(vC.x, vC.y, vC.z);
      newPositions.push(midAB.x, midAB.y, midAB.z);
      newPositions.push(midBC.x, midBC.y, midBC.z);
      newPositions.push(midCA.x, midCA.y, midCA.z);

      // Add normals if available
      if (normals) {
        const nA = new THREE.Vector3(normals[a], normals[a + 1], normals[a + 2]);
        const nB = new THREE.Vector3(normals[b], normals[b + 1], normals[b + 2]);
        const nC = new THREE.Vector3(normals[c], normals[c + 1], normals[c + 2]);
        
        const midN_AB = new THREE.Vector3().addVectors(nA, nB).multiplyScalar(0.5).normalize();
        const midN_BC = new THREE.Vector3().addVectors(nB, nC).multiplyScalar(0.5).normalize();
        const midN_CA = new THREE.Vector3().addVectors(nC, nA).multiplyScalar(0.5).normalize();

        newNormals.push(nA.x, nA.y, nA.z);
        newNormals.push(nB.x, nB.y, nB.z);
        newNormals.push(nC.x, nC.y, nC.z);
        newNormals.push(midN_AB.x, midN_AB.y, midN_AB.z);
        newNormals.push(midN_BC.x, midN_BC.y, midN_BC.z);
        newNormals.push(midN_CA.x, midN_CA.y, midN_CA.z);
      }

      // Add UVs if available
      if (uvs) {
        const uvA = new THREE.Vector2(uvs[a * 2], uvs[a * 2 + 1]);
        const uvB = new THREE.Vector2(uvs[b * 2], uvs[b * 2 + 1]);
        const uvC = new THREE.Vector2(uvs[c * 2], uvs[c * 2 + 1]);
        
        const midUV_AB = new THREE.Vector2().addVectors(uvA, uvB).multiplyScalar(0.5);
        const midUV_BC = new THREE.Vector2().addVectors(uvB, uvC).multiplyScalar(0.5);
        const midUV_CA = new THREE.Vector2().addVectors(uvC, uvA).multiplyScalar(0.5);

        newUvs.push(uvA.x, uvA.y);
        newUvs.push(uvB.x, uvB.y);
        newUvs.push(uvC.x, uvC.y);
        newUvs.push(midUV_AB.x, midUV_AB.y);
        newUvs.push(midUV_BC.x, midUV_BC.y);
        newUvs.push(midUV_CA.x, midUV_CA.y);
      }

      // Create new triangles
      newIndices.push(baseIndex, baseIndex + 3, baseIndex + 5); // A, midAB, midCA
      newIndices.push(baseIndex + 3, baseIndex + 1, baseIndex + 4); // midAB, B, midBC
      newIndices.push(baseIndex + 5, baseIndex + 4, baseIndex + 2); // midCA, midBC, C
      newIndices.push(baseIndex + 3, baseIndex + 4, baseIndex + 5); // midAB, midBC, midCA
    }

    // Create new geometry
    const newGeometry = new THREE.BufferGeometry();
    newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
    if (newNormals.length > 0) {
      newGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(newNormals, 3));
    }
    if (newUvs.length > 0) {
      newGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(newUvs, 2));
    }
    newGeometry.setIndex(newIndices);

    return newGeometry;
  }, []);

  console.log('🎯 ShirtRefactored: subdivideGeometry function defined successfully');

  // Create separate puff print displacement and normal maps (optimized to reuse canvases)
  console.log('🎯 ShirtRefactored: About to define createPuffDisplacementMap function...');
  const createPuffDisplacementMap = useCallback(() => {
    if (!modelScene) return null;
    
    // Use the new layered displacement system
    const composedDisplacementCanvas = useApp.getState().composeDisplacementMaps();
    if (composedDisplacementCanvas) {
      console.log('🎨 Using layered displacement maps from composeDisplacementMaps()');
      return composedDisplacementCanvas;
    }
    
    // Fallback to old single puffCanvas system for backward compatibility
    console.log('🎨 Using fallback single puffCanvas system');
    
    // Get or create displacement canvas (reuse if exists)
    let displacementCanvas = useApp.getState().displacementCanvas;
    if (!displacementCanvas) {
      displacementCanvas = document.createElement('canvas');
      displacementCanvas.width = 2048;
      displacementCanvas.height = 2048;
      useApp.setState({ displacementCanvas });
    }
    
    const dispCtx = displacementCanvas.getContext('2d');
    if (!dispCtx) return null;

    // CRITICAL FIX: Use BLACK (0,0,0) as base for NO displacement, then use WHITE (255) for puff areas
    // This way, with bias 0, black = 0 displacement, white = max displacement
    dispCtx.clearRect(0, 0, 2048, 2048);
    dispCtx.fillStyle = 'rgb(0, 0, 0)'; // Black = no displacement
    dispCtx.fillRect(0, 0, 2048, 2048);
    console.log('🎨 Displacement canvas filled with black (0) - represents zero displacement');

    // Get puff print data from a separate puff canvas
    const puffCanvas = useApp.getState().puffCanvas;
    if (puffCanvas) {
      // Get puff settings for displacement calculation
      const puffSettings = useApp.getState();
      const puffHeight = puffSettings.puffHeight || 1.0;
      const puffCurvature = puffSettings.puffCurvature || 0.5;
      
      // Convert puff canvas to proper displacement map by drawing only where there's puff
      const puffImageData = puffCanvas.getContext('2d')?.getImageData(0, 0, puffCanvas.width, puffCanvas.height);
      if (puffImageData) {
        const data = puffImageData.data;
        
        // CRITICAL FIX: Only draw displacement for pixels that have puff content
        // Use white (255) for maximum displacement, scaled by alpha and settings
        for (let y = 0; y < puffCanvas.height; y++) {
          for (let x = 0; x < puffCanvas.width; x++) {
            const i = (y * puffCanvas.width + x) * 4;
            const alpha = data[i + 3];
            
            if (alpha > 10) { // Threshold to avoid noise
              // Create height based on alpha and puff settings
              const baseHeight = (alpha / 255) * puffHeight;
              const curvatureFactor = THREE.MathUtils.lerp(0.3, 1.0, puffCurvature);
              const height = baseHeight * curvatureFactor;
              
              // Calculate displacement value (0-255, where 0 = no displacement, 255 = max)
              const displacementValue = Math.floor(THREE.MathUtils.clamp(height * 255, 0, 255));
              
              // Draw this single pixel with the displacement value
              dispCtx.fillStyle = `rgb(${displacementValue}, ${displacementValue}, ${displacementValue})`;
              dispCtx.fillRect(x, y, 1, 1);
            }
            // If alpha <= 10, leave it as black (0) - no displacement
          }
        }
        console.log('🎨 Displacement map created from puff canvas - black = no displacement, white = max puff');
      }
    }

    return displacementCanvas;
  }, [modelScene]);

  console.log('🎯 ShirtRefactored: createPuffDisplacementMap function defined successfully');

  // Helper function to check if canvas has actual content
  const checkIfCanvasHasContent = useCallback((canvas: HTMLCanvasElement): boolean => {
    if (!canvas) return false;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return false;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // FIXED: Check for displacement content, not just alpha
    // For displacement maps, we need to check if any pixel deviates from neutral gray (128, 128, 128)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      // Check if pixel has alpha > 0 AND is not neutral black (0, 0, 0)
      // CRITICAL FIX: We use black (0) as base, not gray (128)
      // Allow tolerance for rounding errors
      const isNeutral = Math.abs(r - 0) < 10 && Math.abs(g - 0) < 10 && Math.abs(b - 0) < 10;
      
      if (a > 0 && !isNeutral) {
        console.log('🎨 Canvas has displacement content - found pixel:', { r, g, b, a, isNeutral });
        return true;
      }
    }
    
    console.log('🎨 Canvas is empty - no displacement content found');
    return false;
  }, []);

  console.log('🎯 ShirtRefactored: About to define createPuffNormalMap function...');
  const createPuffNormalMap = useCallback(() => {
    if (!modelScene) return null;
    
    // Get or create normal canvas (reuse if exists)
    let normalCanvas = useApp.getState().normalCanvas;
    if (!normalCanvas) {
      normalCanvas = document.createElement('canvas');
      normalCanvas.width = 2048;
      normalCanvas.height = 2048;
      useApp.setState({ normalCanvas });
    }
    
    const normalCtx = normalCanvas.getContext('2d');
    if (!normalCtx) return null;

    // Clear and fill with default normal (pointing up)
    normalCtx.clearRect(0, 0, 2048, 2048);
    normalCtx.fillStyle = 'rgb(128, 128, 255)';
    normalCtx.fillRect(0, 0, 2048, 2048);

    // Get puff print data from a separate puff canvas
    const puffCanvas = useApp.getState().puffCanvas;
    if (puffCanvas) {
      // Generate normal map from puff print data
      const imageData = puffCanvas.getContext('2d')?.getImageData(0, 0, puffCanvas.width, puffCanvas.height);
      if (imageData) {
        const normalImageData = normalCtx.createImageData(2048, 2048);
        const data = imageData.data;
        const normalData = normalImageData.data;

        // Generate normal vectors for 3D lighting
        for (let y = 0; y < 2048; y++) {
          for (let x = 0; x < 2048; x++) {
            const idx = (y * 2048 + x) * 4;
            const alpha = data[idx + 3];
            
            if (alpha > 0) {
              // Calculate normal vector based on surrounding pixels
              const left = x > 0 ? data[((y * 2048 + (x - 1)) * 4) + 3] : 0;
              const right = x < 2047 ? data[((y * 2048 + (x + 1)) * 4) + 3] : 0;
              const up = y > 0 ? data[(((y - 1) * 2048 + x) * 4) + 3] : 0;
              const down = y < 2047 ? data[(((y + 1) * 2048 + x) * 4) + 3] : 0;
              
              // Calculate gradient
              const dx = (right - left) / 255;
              const dy = (down - up) / 255;
              const dz = Math.sqrt(1 - dx * dx - dy * dy);
              
              // Convert to normal map format (0-255 range)
              normalData[idx] = Math.floor((dx + 1) * 127.5);     // R (X component)
              normalData[idx + 1] = Math.floor((dy + 1) * 127.5); // G (Y component)
              normalData[idx + 2] = Math.floor((dz + 1) * 127.5); // B (Z component)
              normalData[idx + 3] = 255;                          // A
            } else {
              // Default normal (pointing up)
              normalData[idx] = 128;     // R
              normalData[idx + 1] = 128; // G
              normalData[idx + 2] = 255; // B
              normalData[idx + 3] = 255; // A
            }
          }
        }

        normalCtx.putImageData(normalImageData, 0, 0);
      }
    }

    return normalCanvas;
  }, [modelScene]);

  console.log('🎯 ShirtRefactored: createPuffNormalMap function defined successfully');

  // Update model with puff displacement and normal maps
  const updateModelWithPuffMaps = useCallback((puffDisplacementCanvas: HTMLCanvasElement, puffNormalCanvas: HTMLCanvasElement) => {
    if (!modelScene) return;
    
    // FIXED: Don't override PuffPrintTool's displacement maps when it's active
    const appState = useApp.getState();
    if (appState.activeTool === 'puffPrint') {
      console.log('🎨 PuffPrintTool is active - skipping displacement map override');
      return;
    }
    
    console.log('🎨 Updating model with puff displacement and normal maps');
    
    // Create textures from canvases
    const displacementTexture = new THREE.CanvasTexture(puffDisplacementCanvas);
    displacementTexture.flipY = false;
    displacementTexture.needsUpdate = true;
    displacementTexture.wrapS = THREE.ClampToEdgeWrapping;
    displacementTexture.wrapT = THREE.ClampToEdgeWrapping;
    displacementTexture.repeat.set(1, 1);
    
    const normalTexture = new THREE.CanvasTexture(puffNormalCanvas);
    normalTexture.flipY = false;
    normalTexture.needsUpdate = true;
    normalTexture.wrapS = THREE.ClampToEdgeWrapping;
    normalTexture.wrapT = THREE.ClampToEdgeWrapping;
    normalTexture.repeat.set(1, 1);
    
    // CRITICAL: Get the current composed texture (includes all layers)
    const composedCanvas = useApp.getState().composedCanvas;
    if (!composedCanvas) {
      console.log('🎨 No composed canvas found, skipping puff map update');
      return;
    }
    
    const colorTexture = new THREE.CanvasTexture(composedCanvas);
    colorTexture.flipY = false;
    colorTexture.needsUpdate = true;
    colorTexture.wrapS = THREE.ClampToEdgeWrapping;
    colorTexture.wrapT = THREE.ClampToEdgeWrapping;
    colorTexture.repeat.set(1, 1);
    
    // Get puff settings
    const puffSettings = useApp.getState();
    const puffHeight = puffSettings.puffHeight || 1.0;
    const puffCurvature = puffSettings.puffCurvature || 0.5;
    
    // Check if there's actual puff content
    const puffCanvas = useApp.getState().puffCanvas;
    const hasPuffContent = puffCanvas ? checkIfCanvasHasContent(puffCanvas) : false;
    
    // Apply textures and maps to model
    modelScene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat: any) => {
            if (mat.isMeshStandardMaterial) {
              // ALWAYS apply the color texture (this is critical for tool input)
              mat.map = colorTexture;
              mat.map.needsUpdate = true;
              
              // CRITICAL: Ensure material settings don't cause white model
              mat.transparent = true;
              mat.opacity = 1.0;
              mat.alphaTest = 0.0;
              mat.emissive.setHex(0x000000); // Reset emissive to prevent washing out
              
              if (hasPuffContent) {
                // Apply displacement and normal maps only when there's puff content
                mat.displacementMap = displacementTexture;
                mat.displacementScale = puffHeight * 1; // Increased scale for better visibility
                mat.displacementBias = 0;
                
                mat.normalMap = normalTexture;
                mat.normalScale = new THREE.Vector2(puffCurvature * 0.5, puffCurvature * 0.5);
                
                mat.displacementMap.needsUpdate = true;
                mat.normalMap.needsUpdate = true;
                
                console.log('🎨 Applied puff displacement maps to material - scale:', mat.displacementScale);
              } else {
                // Remove displacement and normal maps if no content
                mat.displacementMap = null;
                mat.displacementScale = 0;
                mat.displacementBias = 0;
                mat.normalMap = null;
                mat.normalScale = new THREE.Vector2(1, 1);
              }
              
              mat.needsUpdate = true;
            }
          });
        } else if (child.material.isMeshStandardMaterial) {
          // ALWAYS apply the color texture (this is critical for tool input)
          child.material.map = colorTexture;
          child.material.map.needsUpdate = true;
          
          // CRITICAL: Ensure material settings don't cause white model
          child.material.transparent = true;
          child.material.opacity = 1.0;
          child.material.alphaTest = 0.0;
          child.material.emissive.setHex(0x000000); // Reset emissive to prevent washing out
          
          if (hasPuffContent) {
            // Apply displacement and normal maps only when there's puff content
            child.material.displacementMap = displacementTexture;
            child.material.displacementScale = puffHeight * 0.5; // Increased scale for better visibility
            child.material.displacementBias = 0;
            
            child.material.normalMap = normalTexture;
            child.material.normalScale = new THREE.Vector2(puffCurvature * 0.5, puffCurvature * 0.5);
            
            child.material.displacementMap.needsUpdate = true;
            child.material.normalMap.needsUpdate = true;
            
            console.log('🎨 Applied puff displacement maps to single material - scale:', child.material.displacementScale);
          } else {
            // Remove displacement and normal maps if no content
            child.material.displacementMap = null;
            child.material.displacementScale = 0;
            child.material.displacementBias = 0;
            child.material.normalMap = null;
            child.material.normalScale = new THREE.Vector2(1, 1);
          }
          
          child.material.needsUpdate = true;
        }
      }
    });
    
    console.log('🎨 Model updated with color texture and puff displacement maps');
  }, [modelScene, checkIfCanvasHasContent, createPuffDisplacementMap, createPuffNormalMap]);

  // PERFORMANCE: Smart texture update system - only update what's needed
  const updateModelTexture = useCallback((forceUpdate = false, updateDisplacement = false) => {
    console.log('🎨 updateModelTexture called with:', { forceUpdate, updateDisplacement });
    
    // PERFORMANCE: Early exit checks without logging
    if (!modelScene) {
      console.log('🎨 Early exit: no modelScene');
      return;
    }
    
    // CRITICAL FIX: Create a proper layered texture instead of using composedCanvas
    // This preserves the original model texture while adding tool effects
    const { baseTexture, layers, composedCanvas } = useApp.getState();
    
    // Create a temporary canvas for proper layering
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = composedCanvas?.width || 2048;
    tempCanvas.height = composedCanvas?.height || 2048;
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    
    if (!tempCtx) {
      console.log('🎨 Failed to create temporary canvas context');
      return;
    }
    
    // CRITICAL FIX: Prioritize composedCanvas (which includes images) over baseTexture
    if (composedCanvas) {
      console.log('🎨 Using composedCanvas as base layer (includes images):', {
        width: composedCanvas.width,
        height: composedCanvas.height
      });
      tempCtx.globalAlpha = 1;
      tempCtx.globalCompositeOperation = 'source-over';
      tempCtx.drawImage(composedCanvas, 0, 0);
      console.log('🎨 Composed canvas (with images) drawn to temp canvas');
    } else if (baseTexture) {
      console.log('🎨 No composedCanvas, falling back to base texture:', {
        width: baseTexture.width,
        height: baseTexture.height,
        type: baseTexture.constructor.name
      });
      const centerX = (tempCanvas.width - baseTexture.width) / 2;
      const centerY = (tempCanvas.height - baseTexture.height) / 2;
      tempCtx.globalAlpha = 1;
      tempCtx.globalCompositeOperation = 'source-over';
      tempCtx.drawImage(baseTexture, centerX, centerY, baseTexture.width, baseTexture.height);
      console.log('🎨 Base texture drawn to temp canvas');
    } else {
      console.log('🎨 No base texture available, using white background');
      tempCtx.fillStyle = '#ffffff';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    }
    
    // CRITICAL FIX: Layer tool effects on top using proper blend modes
    const activeLayer = layers.find(layer => layer.id === useApp.getState().activeLayerId);
    if (activeLayer && activeLayer.canvas) {
      console.log('🎨 Adding tool layer on top of base texture');
      
      // DEBUG: Check what's actually in the layer canvas
      const layerImageData = activeLayer.canvas.getContext('2d')?.getImageData(0, 0, activeLayer.canvas.width, activeLayer.canvas.height);
      if (layerImageData) {
        const samplePixel = layerImageData.data.slice(0, 4); // First pixel RGBA
        console.log('🎨 Layer canvas content sample:', `rgba(${samplePixel[0]}, ${samplePixel[1]}, ${samplePixel[2]}, ${samplePixel[3]})`);
        
        // Check if canvas has any non-transparent content
        let hasContent = false;
        for (let i = 3; i < layerImageData.data.length; i += 4) {
          if (layerImageData.data[i] > 0) { // Alpha > 0
            hasContent = true;
            break;
          }
        }
        console.log('🎨 Layer canvas has content:', hasContent);
      }
      
      // FIXED: Use source-over blend mode with full opacity for proper rendering
      // This ensures brush strokes appear correctly without transparency issues
      tempCtx.globalCompositeOperation = 'source-over';
      tempCtx.globalAlpha = 1.0; // Full opacity for proper tool rendering
      tempCtx.drawImage(activeLayer.canvas, 0, 0);
      
      console.log('🎨 Tool layer composited with source-over blend mode');
    }
    
    // NOTE: Images are now rendered in composeLayers() in App.tsx (same as text)
    // This ensures live updates without creating new texture maps
    // Keeping this comment for reference - images should NOT be drawn here
    
    // Create fresh texture from the properly layered canvas
    const texture = new THREE.CanvasTexture(tempCanvas);
    texture.flipY = false;
    texture.needsUpdate = true;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.name = `layered-texture-${Date.now()}`;
    
    // CRITICAL FIX: Set proper texture wrap settings to prevent stretching/distortion
    // This ensures texture maps correctly regardless of model scale
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(1, 1); // Ensure 1:1 mapping without tiling
    
    console.log('🎨 Created layered texture with proper wrap settings:', texture.name);
    
    // PERFORMANCE FIX: Batch material updates to reduce GPU calls
    const materialUpdates: { mesh: any; material: any }[] = [];
    
    // Collect all mesh updates first
    modelScene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((mat: any) => {
          if (mat.isMeshStandardMaterial && texture) {
            // Apply adaptive texture quality settings
            const settings = adaptivePerformanceManager.getEffectiveSettings();
            
            // Set texture properties based on quality settings
            if (settings.textureQuality === 'low') {
              texture.generateMipmaps = false;
              texture.anisotropy = 1;
              texture.minFilter = THREE.LinearFilter;
              texture.magFilter = THREE.LinearFilter;
            } else if (settings.textureQuality === 'medium') {
              texture.generateMipmaps = true;
              texture.anisotropy = 4;
              texture.minFilter = THREE.LinearMipmapLinearFilter;
              texture.magFilter = THREE.LinearFilter;
            } else if (settings.textureQuality === 'high') {
              texture.generateMipmaps = true;
              texture.anisotropy = 8;
              texture.minFilter = THREE.LinearMipmapLinearFilter;
              texture.magFilter = THREE.LinearFilter;
            } else { // ultra
              texture.generateMipmaps = true;
              texture.anisotropy = 16;
              texture.minFilter = THREE.LinearMipmapLinearFilter;
              texture.magFilter = THREE.LinearFilter;
            }
            
            // Always update texture to ensure changes are applied
            mat.map = texture;
            mat.needsUpdate = true;
            mat.map.needsUpdate = true;
            
            // Apply adaptive material properties
            mat.transparent = false;
            mat.opacity = 1.0;
            mat.alphaTest = 0.0;
            mat.roughness = settings.enableHighQualityRendering ? 0.3 : 0.5;
            mat.sheen = settings.enableHighQualityRendering ? 0.1 : 0.05;
            
            // CRITICAL: Reset emissive to prevent washing out
            mat.emissive.setHex(0x000000);
            mat.emissiveIntensity = 0;
            mat.emissiveMap = null;
            
            // ULTRA-REALISTIC: Material properties for natural cotton fabric appearance
            mat.roughness = 0.5;
            mat.metalness = 0.0;
            mat.normalScale = new THREE.Vector2(1, 1);
            
            // Subtle fabric sheen (much less than before for realism)
            mat.sheen = 0.05;
            mat.sheenRoughness = 0.9;
            mat.sheenColor = new THREE.Color(0xffffff);
            
            // Optimized color space for accurate fabric colors
            mat.toneMapped = true;
            mat.colorSpace = THREE.SRGBColorSpace;
            mat.outputColorSpace = THREE.SRGBColorSpace;
            
            // Natural fabric lighting properties
            mat.envMapIntensity = 0.4;
            mat.reflectivity = 0.05;
            
            mat.needsUpdate = true;
            materialUpdates.push({ mesh: child, material: mat });
          }
        });
      }
    });
    
    // PERFORMANCE: Apply updates in batches to reduce GPU pressure
    if (materialUpdates.length > 0) {
      console.log(`🎨 Applying ${materialUpdates.length} batched material updates`);
      requestAnimationFrame(() => {
        materialUpdates.forEach(({ material }) => {
          if (material && material.needsUpdate !== undefined) {
            material.needsUpdate = true;
            console.log('🎨 Material updated:', material);
          }
        });
      });
    } else {
      console.log('🎨 No material updates needed');
    }
    
    // Only update displacement maps if specifically requested
    if (updateDisplacement || forceUpdate) {
      const puffCanvas = useApp.getState().puffCanvas;
      if (puffCanvas && modelScene) {
        console.log('🎨 Updating displacement maps (requested)');
        const puffDisplacementCanvas = createPuffDisplacementMap();
        const puffNormalCanvas = createPuffNormalMap();
        
        if (puffDisplacementCanvas && puffNormalCanvas) {
          updateModelWithPuffMaps(puffDisplacementCanvas, puffNormalCanvas);
        }
      }
    }
    
    console.log('🎨 Model texture updated');
  }, [modelScene, createPuffDisplacementMap, createPuffNormalMap, updateModelWithPuffMaps]);

  console.log('🎯 ShirtRefactored: updateModelTexture function defined successfully');

  // PERFORMANCE FIX: Re-enabled puff displacement system for proper 3D effects
  const updateModelWithPuffDisplacement = useCallback(() => {
    if (!modelScene) return;

    // Check if there's any puff data before applying displacement maps
    const puffCanvas = useApp.getState().puffCanvas;
    const appDisplacementCanvas = useApp.getState().displacementCanvas;
    
    if (!puffCanvas || !appDisplacementCanvas) {
      console.log('🎨 No puff or displacement canvas found, skipping displacement update');
      return;
    }

    // Check if puff canvas has any actual content (non-transparent pixels)
    const puffCtx = puffCanvas.getContext('2d', { willReadFrequently: true });
    if (!puffCtx) return;
    
    const puffImageData = puffCtx.getImageData(0, 0, puffCanvas.width, puffCanvas.height);
    const puffData = puffImageData.data;
    let hasPuffData = false;
    
    // Check if there are any non-black pixels in puff canvas (since we use solid colors now)
    for (let i = 0; i < puffData.length; i += 4) {
      const r = puffData[i];
      const g = puffData[i + 1];
      const b = puffData[i + 2];
      const a = puffData[i + 3];
      
      // Check if pixel is not black (0,0,0) - means there's puff content
      if (r > 0 || g > 0 || b > 0 || a > 0) {
        hasPuffData = true;
        break;
      }
    }
    
    // Check if displacement canvas has any non-neutral pixels
    const dispCtx = appDisplacementCanvas.getContext('2d', { willReadFrequently: true });
    if (!dispCtx) return;
    
    const dispImageData = dispCtx.getImageData(0, 0, appDisplacementCanvas.width, appDisplacementCanvas.height);
    const dispData = dispImageData.data;
    let hasDisplacement = false;
    
    // Check if any pixel is NOT neutral gray (128, 128, 128)
    for (let i = 0; i < dispData.length; i += 4) {
      const r = dispData[i];
      const g = dispData[i + 1];
      const b = dispData[i + 2];
      const a = dispData[i + 3];
      
      // Only consider it displacement if alpha > 0 AND the color is not neutral black (0)
      // CRITICAL FIX: We use black (0) as base, not gray (128)
      const isNeutral = Math.abs(r - 0) < 5 && Math.abs(g - 0) < 5 && Math.abs(b - 0) < 5;
      
      if (a > 0 && !isNeutral) {
        hasDisplacement = true;
        break;
      }
    }
    
    if (!hasPuffData || !hasDisplacement) {
      console.log('🎨 No puff data or displacement found, removing displacement from model');
      console.log('🎨 Puff data check:', { hasPuffData, hasDisplacement });
      
      // Remove displacement from all materials
      modelScene.traverse((child: any) => {
        if (!child.isMesh || !child.material) return;

        const updateMaterial = (mat: any) => {
          if (mat) {
            mat.displacementMap = null;
            mat.displacementScale = 0;
            mat.normalMap = null;
            mat.needsUpdate = true;
            console.log('🎨 Removed displacement and normal maps from material');
          }
          return mat;
        };

        if (Array.isArray(child.material)) {
          child.material = child.material.map(updateMaterial);
        } else {
          child.material = updateMaterial(child.material);
        }
      });
      
      return;
    }

    console.log('🎨 Puff data and displacement found, applying displacement maps');

    // Create separate puff displacement and normal maps
    const puffDisplacementCanvas = createPuffDisplacementMap();
    const normalCanvas = createPuffNormalMap();

    if (!puffDisplacementCanvas || !normalCanvas) return;

    // Create composite canvas combining base texture and layer canvas (not puffCanvas)
    const composedCanvas = useApp.getState().composedCanvas;
    if (!composedCanvas) return;
    
    // Get the active layer canvas which contains the actual puff color
    const activeLayerId = useApp.getState().activeLayerId;
    const layers = useApp.getState().layers;
    const activeLayer = layers.find((l: any) => l.id === activeLayerId);
    
    if (!activeLayer || !activeLayer.canvas) {
      console.log('🎨 No active layer canvas found for puff texture');
      return;
    }
    
    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = composedCanvas.width;
    compositeCanvas.height = composedCanvas.height;
    const compositeCtx = compositeCanvas.getContext('2d', { willReadFrequently: true });
    if (!compositeCtx) return;
    
    // Draw base texture first
    compositeCtx.drawImage(composedCanvas, 0, 0);
    
    // Draw layer canvas (which contains puff color) on top
    compositeCtx.globalCompositeOperation = 'source-over';
    compositeCtx.globalAlpha = 1.0; // Full opacity for proper puff color
    compositeCtx.drawImage(activeLayer.canvas, 0, 0);

    // Create textures
    const colorTexture = new THREE.CanvasTexture(compositeCanvas);
    colorTexture.flipY = false;
    colorTexture.needsUpdate = true;
    colorTexture.wrapS = THREE.ClampToEdgeWrapping;
    colorTexture.wrapT = THREE.ClampToEdgeWrapping;
    colorTexture.repeat.set(1, 1);
    
    const displacementTexture = new THREE.CanvasTexture(puffDisplacementCanvas);
    displacementTexture.flipY = false;
    displacementTexture.needsUpdate = true;
    displacementTexture.wrapS = THREE.ClampToEdgeWrapping;
    displacementTexture.wrapT = THREE.ClampToEdgeWrapping;
    displacementTexture.repeat.set(1, 1);

    const normalTexture = new THREE.CanvasTexture(normalCanvas);
    normalTexture.flipY = false;
    normalTexture.needsUpdate = true;
    normalTexture.wrapS = THREE.ClampToEdgeWrapping;
    normalTexture.wrapT = THREE.ClampToEdgeWrapping;
    normalTexture.repeat.set(1, 1);

    // Get puff settings for dynamic displacement scaling
    const puffSettings = useApp.getState();
    const puffHeight = puffSettings.puffHeight || 1.0;
    const puffCurvature = puffSettings.puffCurvature || 0.5;

    // Check if there's actual puff content before applying displacement maps
    const hasPuffContent = checkIfCanvasHasContent(puffCanvas);
    
    // Apply color texture, displacement and normal maps
    modelScene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        // CRITICAL FIX: Ensure geometry has enough vertices for displacement
        // Displacement mapping requires subdivided geometry to create visible 3D effects
        if (child.geometry && hasPuffContent) {
          const vertexCount = child.geometry.attributes.position?.count || 0;
          console.log('🎨 Mesh vertex count:', vertexCount);
          
          // If geometry has too few vertices, subdivide it for better displacement
          if (vertexCount < 5000) {
            console.log('🎨 Subdividing geometry for better displacement (current vertices:', vertexCount, ')');
            const subdivisionLevel = vertexCount < 1000 ? 3 : 2; // More subdivision for low-poly models
            child.geometry = subdivideGeometry(child.geometry, subdivisionLevel);
            console.log('🎨 Geometry subdivided to', child.geometry.attributes.position.count, 'vertices');
          }
        }
        
        if (Array.isArray(child.material)) {
          child.material.forEach((mat: any) => {
            if (mat.isMeshStandardMaterial) {
              // Always apply color texture
              mat.map = colorTexture;
              
              // Only apply displacement and normal maps if there's actual puff content
              if (hasPuffContent) {
                // Apply displacement map with proper scale for visible 3D puff effect
                mat.displacementMap = displacementTexture;
                mat.displacementScale = puffHeight * 1.0; // Increased scale for visible 3D puffs
                mat.displacementBias = 0; // CRITICAL: With black (0) base, bias 0 means black = no displacement
                
                // Apply normal map for surface detail
                mat.normalMap = normalTexture;
                mat.normalScale = new THREE.Vector2(puffCurvature * 2.0, puffCurvature * 2.0); // Increased normal scale for better detail
                
                console.log('🎨 Applied displacement maps - scale:', mat.displacementScale, 'normal scale:', mat.normalScale);
              } else {
                // Remove displacement and normal maps if no puff content
                mat.displacementMap = null;
                mat.displacementScale = 0;
                mat.displacementBias = 0;
                mat.normalMap = null;
                mat.normalScale = new THREE.Vector2(1, 1); // Reset to default
                
                console.log('🎨 Removed displacement maps - no puff content detected');
              }
              
              // Update material
              mat.map.needsUpdate = true;
              if (hasPuffContent) {
                mat.displacementMap.needsUpdate = true;
                mat.normalMap.needsUpdate = true;
              }
              mat.needsUpdate = true;
            }
          });
        } else if (child.material.isMeshStandardMaterial) {
          // Always apply color texture
          child.material.map = colorTexture;
          
          // Only apply displacement and normal maps if there's actual puff content
          if (hasPuffContent) {
            // Apply displacement map with proper scale for visible 3D puff effect
            child.material.displacementMap = displacementTexture;
            child.material.displacementScale = puffHeight * 1.0; // Increased scale for visible 3D puffs
            child.material.displacementBias = 0; // CRITICAL: With black (0) base, bias 0 means black = no displacement
            
            // Apply normal map for surface detail
            child.material.normalMap = normalTexture;
            child.material.normalScale = new THREE.Vector2(puffCurvature * 2.0, puffCurvature * 2.0); // Increased normal scale for better detail
            
            console.log('🎨 Applied displacement maps (single material) - scale:', child.material.displacementScale, 'normal scale:', child.material.normalScale);
          } else {
            // Remove displacement and normal maps if no puff content
            child.material.displacementMap = null;
            child.material.displacementScale = 0;
            child.material.displacementBias = 0;
            child.material.normalMap = null;
            child.material.normalScale = new THREE.Vector2(1, 1); // Reset to default
            
            console.log('🎨 Removed displacement maps (single material) - no puff content detected');
          }
          
          // Update material
          child.material.map.needsUpdate = true;
          if (hasPuffContent) {
            child.material.displacementMap.needsUpdate = true;
            child.material.normalMap.needsUpdate = true;
          }
          child.material.needsUpdate = true;
        }
      }
    });

    console.log('🎨 Model updated with puff print displacement and normal maps (preserving original texture)');
  }, [modelScene, createPuffDisplacementMap, createPuffNormalMap]);

  // Make updateModelTexture available globally for direct calls
  useEffect(() => {
    (window as any).updateModelTexture = updateModelTexture;
    (window as any).updateModelWithPuffDisplacement = updateModelWithPuffDisplacement;
    return () => {
      delete (window as any).updateModelTexture;
      delete (window as any).updateModelWithPuffDisplacement;
    };
  }, [updateModelTexture, updateModelWithPuffDisplacement]);

  // Clear puff displacement maps (only for explicit clearing, not automatic tool switching)
  const clearPuffDisplacement = useCallback(() => {
    if (!modelScene) return;

    console.log('🎨 Clearing puff displacement maps (explicit clear operation)');

    modelScene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat: any) => {
            if (mat.isMeshStandardMaterial) {
              // Remove displacement and normal maps
              mat.displacementMap = null;
              mat.normalMap = null;
              mat.displacementScale = 0;
              mat.displacementBias = 0;
              mat.needsUpdate = true;
            }
          });
        } else if (child.material.isMeshStandardMaterial) {
          // Remove displacement and normal maps
          child.material.displacementMap = null;
          child.material.normalMap = null;
          child.material.displacementScale = 0;
          child.material.displacementBias = 0;
          child.material.needsUpdate = true;
        }
      }
    });
  }, [modelScene]);

   // Expose clear function for external use (e.g., clear button in UI)
   React.useEffect(() => {
     (window as any).clearPuffDisplacement = clearPuffDisplacement;
   }, [clearPuffDisplacement]);

   // Apply Tool Integration - Handle all texture system events
  useEffect(() => {
     console.log('🎨 Setting up Apply Tool event listeners for all texture systems');

    // Handle puff effects application
    const handleApplyPuffEffects = () => {
      console.log('🎨 Apply Tool: Applying puff effects to unified texture system');
      if (modelScene) {
        updateModelTexture(false, true); // Update displacement maps for puff
      }
    };

     // Handle embroidery effects application
     const handleApplyEmbroideryEffects = () => {
       console.log('🎨 Apply Tool: Applying embroidery effects to texture maps');
       const appState = useApp.getState();
       if (appState.embroideryCanvas && modelScene) {
         // Update model texture to include embroidery effects
         updateModelTexture(false, false); // No displacement maps needed for embroidery
       }
     };

     // Handle brush effects application
     const handleApplyBrushEffects = () => {
       console.log('🎨 Apply Tool: Applying brush effects to all texture layers');
       const appState = useApp.getState();
       if (appState.composedCanvas && modelScene) {
         // Update model texture to include brush effects
         updateModelTexture(false, false); // No displacement maps needed for brush
       }
     };

    // Handle displacement maps update
    const handleUpdateDisplacementMaps = () => {
      console.log('🎨 Apply Tool: Updating displacement maps only');
      if (modelScene) {
        updateModelTexture(false, true); // Only update displacement maps
      }
    };

    // Handle force model texture update
    const handleForceModelTextureUpdate = () => {
      console.log('🎨 Apply Tool: Forcing 3D model texture update with unified system');
      if (modelScene) {
        // Update main texture with unified system
        updateModelTexture(true, true); // Force update with displacement maps
      }
    };

     // Add event listeners
     document.addEventListener('applyPuffEffects', handleApplyPuffEffects);
     document.addEventListener('applyEmbroideryEffects', handleApplyEmbroideryEffects);
     document.addEventListener('applyBrushEffects', handleApplyBrushEffects);
     document.addEventListener('updateDisplacementMaps', handleUpdateDisplacementMaps);
     document.addEventListener('forceModelTextureUpdate', handleForceModelTextureUpdate);

     // Cleanup
     return () => {
       document.removeEventListener('applyPuffEffects', handleApplyPuffEffects);
       document.removeEventListener('applyEmbroideryEffects', handleApplyEmbroideryEffects);
       document.removeEventListener('applyBrushEffects', handleApplyBrushEffects);
       document.removeEventListener('updateDisplacementMaps', handleUpdateDisplacementMaps);
       document.removeEventListener('forceModelTextureUpdate', handleForceModelTextureUpdate);
     };
   }, [modelScene, updateModelTexture]);

  // PERFORMANCE FIX: Removed separate puff displacement handling
  // Puff print effects are now integrated into the unified texture system
  // No special handling needed when switching tools
  
  // Render vector paths when they change - render on COMPOSED canvas for visibility
  const showAnchorPoints = useApp(s => s.showAnchorPoints);
  
  useEffect(() => {
    // Always render vector paths when in vector mode, regardless of showAnchorPoints
    if (!vectorMode || vectorPaths.length === 0) return;
    
    const composedCanvas = useApp.getState().composedCanvas;
    if (!composedCanvas) return;
    
    const ctx = composedCanvas.getContext('2d');
    if (!ctx) return;
    
    console.log('🎨 Rendering vector paths on composed canvas:', vectorPaths.length, 'paths');
    
    // Render vector paths directly - they'll show on the texture
    vectorPaths.forEach((path: any) => {
      if (path.points.length === 0) return;
      
      ctx.save();
      
      // Draw path lines with maximum visibility
      ctx.strokeStyle = '#FF00FF'; // Bright magenta
      ctx.lineWidth = 6; // Thicker for visibility
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([12, 6]); // Longer dashes
      ctx.globalAlpha = 1.0;
      ctx.shadowColor = '#FF00FF';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      
      path.points.forEach((point: any, index: number) => {
        const px = Math.floor(point.u * composedCanvas.width);
        const py = Math.floor(point.v * composedCanvas.height);
        
        if (index === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      });
      
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
      
      // Draw anchors with maximum visibility
      path.points.forEach((point: any, index: number) => {
        const px = Math.floor(point.u * composedCanvas.width);
        const py = Math.floor(point.v * composedCanvas.height);
        
        // Large outer glow
        ctx.shadowColor = index === 0 ? '#00FF00' : '#FFFF00';
        ctx.shadowBlur = 20;
        
        // Large anchor point
        ctx.fillStyle = index === 0 ? '#00FF00' : '#FFFF00';
        ctx.beginPath();
        ctx.arc(px, py, 12, 0, Math.PI * 2); // Larger radius
        ctx.fill();
        
        // Thick black outline
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.stroke();
      });
      
      ctx.restore();
    });
    
    // Update the texture to show vector paths on model
    updateModelTexture();
  }, [vectorPaths, vectorMode, showAnchorPoints, updateModelTexture]);
  
  // PERFORMANCE OPTIMIZATION: Aggressively optimized painting function
  const paintAtEvent = useCallback((e: any) => {
    // PERFORMANCE: Disable all console logging in hot path for maximum performance
    // Only log critical errors
    if (process.env.NODE_ENV === 'development' && Math.random() < 0.01) {
      console.log('🎨 paintAtEvent:', activeTool);
    }
    
    // Handle picker tool first - optimized for performance
    if (activeTool === 'picker') {
      const uv = e.uv as THREE.Vector2 | undefined;
      if (!uv || !modelScene) return;
      
      // PERFORMANCE: Use cached composed canvas for faster color sampling
      const composedCanvas = useApp.getState().composedCanvas;
      if (!composedCanvas) return;
      
      const ctx = composedCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      
      const x = Math.floor(uv.x * composedCanvas.width);
      const y = Math.floor(uv.y * composedCanvas.height);
      const data = ctx.getImageData(x, y, 1, 1).data;
      const sampledColor = `#${[data[0], data[1], data[2]].map(v => v.toString(16).padStart(2, '0')).join('')}`;
      
      // PERFORMANCE: Batch state updates
      useApp.setState({ 
        brushColor: sampledColor, 
        activeTool: 'brush' 
      });
      
      return;
    }
    
    const uv = e.uv as THREE.Vector2 | undefined;
    const point = e.point as THREE.Vector3 | undefined; // World coordinates
    
    // DEBUG: Add detailed logging to understand the issue
    if (!uv) {
      console.log('🎨 ShirtRefactored: paintAtEvent - missing UV coordinates');
      return;
    }
    
    if (!point) {
      console.log('🎨 ShirtRefactored: paintAtEvent - missing world coordinates');
      return;
    }
    
    // Enhanced layer management - get or create active layer for current tool
    let layer;
    if (LAYER_SYSTEM_CONFIG.USE_ADVANCED_LAYERS) {
      try {
        layer = layerBridge.getOrCreateActiveLayer(activeTool);
      } catch (error) {
        console.warn('🎨 Advanced layer system failed, using fallback:', error);
        // Fallback to original system
        const getOrCreateActiveLayer = useApp.getState().getOrCreateActiveLayer;
        layer = getOrCreateActiveLayer ? getOrCreateActiveLayer(activeTool) : null;
      }
    } else {
      // Use original system
      const getOrCreateActiveLayer = useApp.getState().getOrCreateActiveLayer;
      layer = getOrCreateActiveLayer ? getOrCreateActiveLayer(activeTool) : null;
    }
    
    if (!layer) {
      console.log('🎨 ShirtRefactored: paintAtEvent - failed to get/create layer for tool:', activeTool);
      return;
    }
    
    console.log('🎨 Using layer for tool:', { tool: activeTool, layerId: layer.id, layerName: layer.name });

    // Get symmetry settings
    const symmetryX = useApp.getState().symmetryX;
    const symmetryY = useApp.getState().symmetryY;
    const symmetryZ = useApp.getState().symmetryZ;
    
    // DEBUG: Check if symmetry is causing inverted puffs
    if (activeTool === 'puffPrint' && (symmetryX || symmetryY || symmetryZ)) {
      console.log('🎨 WARNING: Symmetry enabled for puff print - this may cause inverted puffs!', { symmetryX, symmetryY, symmetryZ });
    }
    
    // Debug: Check if any symmetry is enabled
    if (symmetryX || symmetryY || symmetryZ) {
      console.log('🔄 Symmetry settings detected:', { symmetryX, symmetryY, symmetryZ });
    } else {
      console.log('🔄 No symmetry enabled');
    }
    
    // Helper function to draw at multiple positions based on symmetry
     const drawWithSymmetry = (drawFn: (x: number, y: number) => void) => {
       const canvas = layer.canvas;
      // Convert UV to canvas coordinates (NO V flipping - model UVs are correct as-is)
      const x = Math.floor(uv.x * canvas.width);
      const y = Math.floor(uv.y * canvas.height);
      
      // Calculate all possible mirror positions
      const positions = new Set<string>();
      
      // Always draw at original position
      positions.add(`${x},${y}`);
      drawFn(x, y);
      
      // PERFORMANCE: Skip symmetry calculations if no symmetry is enabled
      if (!symmetryX && !symmetryY && !symmetryZ) {
        return;
      }
      
      // Fallback: Simple UV-based symmetry when world position conversion fails
      const useFallbackSymmetry = () => {
        console.log('🔄 Using fallback UV-based symmetry');
        
        // X-axis symmetry: Mirror across center of UV space
        if (symmetryX) {
          const mirrorX = canvas.width - x;
          const mirrorY = y;
          if (mirrorX >= 0 && mirrorX < canvas.width) {
            const pos = `${mirrorX},${mirrorY}`;
            if (!positions.has(pos)) {
              positions.add(pos);
              drawFn(mirrorX, mirrorY);
            }
          }
        }
        
        // Y-axis symmetry: Mirror across center of UV space
        if (symmetryY) {
          const mirrorX = x;
          const mirrorY = canvas.height - y;
          if (mirrorY >= 0 && mirrorY < canvas.height) {
            const pos = `${mirrorX},${mirrorY}`;
            if (!positions.has(pos)) {
              positions.add(pos);
              drawFn(mirrorX, mirrorY);
            }
          }
        }
        
        // Z-axis symmetry: Mirror both X and Y (diagonal symmetry)
        if (symmetryZ) {
          const mirrorX = canvas.width - x;
          const mirrorY = canvas.height - y;
          if (mirrorX >= 0 && mirrorX < canvas.width && mirrorY >= 0 && mirrorY < canvas.height) {
            const pos = `${mirrorX},${mirrorY}`;
            if (!positions.has(pos)) {
              positions.add(pos);
              drawFn(mirrorX, mirrorY);
            }
          }
        }
      };
      
      // Use simplified UV-based symmetry to avoid world position conversion issues
      console.log('🔄 Using simplified UV-based symmetry');
      useFallbackSymmetry();
      
      // PERFORMANCE: Reduce debug logging frequency
      if (Math.random() < 0.05) {
        console.log('🔄 Symmetry Debug:', {
          original: { x, y },
          canvasSize: { width: canvas.width, height: canvas.height },
          enabled: { symmetryX, symmetryY, symmetryZ },
          positions: Array.from(positions),
          totalPositions: positions.size
        });
      }
    };

    // In vector mode, brush/puff/embroidery create vector paths instead of painting
    const vectorMode = useApp.getState().vectorMode;
    if (vectorMode && (activeTool === 'brush' || activeTool === 'embroidery' || activeTool === 'puffPrint')) {
      console.log('🎨 Vector mode active - treating', activeTool, 'as vector path creator');
      
      // Get vector paths from store
      const vectorPaths = useApp.getState().vectorPaths || [];
      const activePathId = useApp.getState().activePathId;
      
       // Convert UV to canvas coordinates for vector path creation
       const canvas = layer.canvas;
       const x = Math.floor(uv.x * canvas.width);
       const y = Math.floor(uv.y * canvas.height);
      
      console.log('🎨 Vector path point at canvas:', { x, y }, 'UV:', { u: uv.x, v: uv.y });
      
      // Create or append to vector path
      if (!activePathId) {
        // Start new path with proper VectorAnchor format
        const newPath: any = {
          id: `path-${Date.now()}`,
          points: [{
            u: uv.x,
            v: uv.y,
            inHandle: null,
            outHandle: null
          }],
          closed: false,
          tool: activeTool // Store which tool this path is for
        };
        useApp.setState({ 
          vectorPaths: [...vectorPaths, newPath],
          activePathId: newPath.id
        });
        console.log('🎨 Created new vector path:', newPath.id);
      } else {
        // Add point to existing path with proper VectorAnchor format
        const pathIndex = vectorPaths.findIndex(p => p.id === activePathId);
        if (pathIndex >= 0) {
          const updatedPaths = [...vectorPaths];
          const newPoint: any = {
            u: uv.x,
            v: uv.y,
            inHandle: null,
            outHandle: null
          };
          updatedPaths[pathIndex] = {
            ...updatedPaths[pathIndex],
            points: [...updatedPaths[pathIndex].points, newPoint]
          };
          useApp.setState({ vectorPaths: updatedPaths });
          console.log('🎨 Added point to path:', activePathId);
        }
      }
      
      // Don't paint, just create the path
      // The useEffect will handle rendering vector paths
      return;
    }

    const canvas = layer.canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Convert UV coordinates to canvas coordinates
     const x = Math.floor(uv.x * canvas.width);
     const y = Math.floor(uv.y * canvas.height);

    // DEBUG: Log UV to canvas conversion for brush tool
    if (activeTool === 'brush') {
      console.log('🖌️ UV TO CANVAS CONVERSION:', { 
        originalUV: { x: uv.x, y: uv.y },
        canvasCoords: { x, y },
        canvasSize: { width: canvas.width, height: canvas.height }
      });
    }
    // PERFORMANCE FIX: Reduced debug logging
    if (Date.now() % 3000 < 100) { // Only log every 3 seconds
      console.log('🎨 Brush settings:', { 
        color: brushColor, 
        size: brushSize, 
        opacity: brushOpacity, 
        hardness: brushHardness,
        flow: brushFlow,
        shape: brushShape,
        spacing: brushSpacing,
        blendMode: blendMode,
        activeTool: activeTool 
      });
    }
    
    // PERFORMANCE FIX: Removed excessive color debugging logs
    const currentBrushColor = useApp.getState().brushColor;

      // PERFORMANCE: Optimized canvas operations
      ctx.save();
      
      // PERFORMANCE: Pre-configure context for optimal drawing
      ctx.imageSmoothingEnabled = false; // Faster for pixel art
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    if (activeTool === 'brush') {
      // Apply brush flow to opacity (flow controls how much paint is applied per stroke)
      const effectiveOpacity = brushOpacity * brushFlow;
      ctx.globalAlpha = effectiveOpacity;
      ctx.globalCompositeOperation = blendMode;
      
      // Use the current brush color from the store (force real-time updates)
      const actualBrushColor = useApp.getState().brushColor;
      
      // Check if gradient mode is active
      const gradientSettings = (window as any).getGradientSettings ? (window as any).getGradientSettings() : null;
      const isGradientMode = gradientSettings && gradientSettings.brush && gradientSettings.brush.mode === 'gradient';
      
      ctx.fillStyle = actualBrushColor;
      
      // Define brush drawing function for symmetry
      const drawBrushAt = (x: number, y: number) => {
        // FIXED: Always get current brush size from store to avoid stale closures
        const currentBrushSize = useApp.getState().brushSize;
        console.log('🖌️ BRUSH DEBUG - drawBrushAt:', { 
          canvasPos: { x, y }, 
          brushSize: currentBrushSize, 
          canvasSize: { width: canvas.width, height: canvas.height },
          uvEstimate: { u: x / canvas.width, v: y / canvas.height },
          brushColor: currentBrushColor,
          ctxGlobalAlpha: ctx.globalAlpha,
          ctxFillStyle: ctx.fillStyle
        });
        
        // Apply brush hardness (hardness affects edge softness)
        if (isGradientMode && gradientSettings) {
          // Create canvas gradient from gradient settings
          const grad = gradientSettings.brush;
          let canvasGradient;
          
          if (grad.type === 'linear') {
            const angleRad = (grad.angle * Math.PI) / 180;
            const x1 = x - Math.cos(angleRad) * currentBrushSize;
            const y1 = y - Math.sin(angleRad) * currentBrushSize;
            const x2 = x + Math.cos(angleRad) * currentBrushSize;
            const y2 = y + Math.sin(angleRad) * currentBrushSize;
            canvasGradient = ctx.createLinearGradient(x1, y1, x2, y2);
          } else {
            // Radial gradient
            canvasGradient = ctx.createRadialGradient(x, y, 0, x, y, currentBrushSize / 2);
          }
          
          // Add color stops
          grad.stops.forEach((stop: any) => {
            canvasGradient.addColorStop(stop.position / 100, stop.color);
          });
          
          ctx.fillStyle = canvasGradient;
        } else if (brushHardness < 1) {
          // Create gradient for soft edges when hardness < 1
          const gradientRadius = currentBrushSize / 2;
          console.log('🎨 Creating soft gradient with radius:', gradientRadius, 'brushSize:', currentBrushSize);
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, gradientRadius);
          gradient.addColorStop(0, actualBrushColor);
          gradient.addColorStop(brushHardness, actualBrushColor);
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = actualBrushColor;
        }
        
        // Use the brush engine to create realistic brush stamp
        try {
          // Import brush engine dynamically to avoid circular dependencies
          const brushEngine = (window as any).__brushEngine;
          if (!brushEngine) {
            console.warn('🖌️ Brush engine not available, falling back to basic shapes');
            // Fallback to basic shape
            ctx.beginPath();
            ctx.arc(x, y, currentBrushSize / 2, 0, Math.PI * 2);
            ctx.fill();
            return;
          }
          
          // Create brush settings for the engine
          const brushSettings = {
            size: currentBrushSize,
            shape: brushShape,
            opacity: brushOpacity,
            hardness: brushHardness,
            color: actualBrushColor,
            flow: brushFlow,
            angle: 0, // Could be made dynamic later
            texture: { enabled: false, pattern: null }
          };
          
          // Create the brush stamp
          const brushStamp = brushEngine.createBrushStamp(brushSettings);
          
          // Apply the stamp to canvas
          const stampSize = brushStamp.width;
          const halfStampSize = stampSize / 2;
          
          ctx.save();
          ctx.globalCompositeOperation = blendMode;
          ctx.globalAlpha = effectiveOpacity;
          
          // Draw the brush stamp centered at the brush position
          ctx.drawImage(
            brushStamp,
            x - halfStampSize,
            y - halfStampSize,
            stampSize,
            stampSize
          );
          
          ctx.restore();
          
          console.log('🖌️ Applied brush stamp:', {
            stampSize,
            brushShape: brushShape,
            position: { x, y }
          });
          
        } catch (error) {
          console.warn('🖌️ Error using brush engine, falling back to basic shape:', error);
          // Fallback to basic shape
          ctx.beginPath();
          ctx.arc(x, y, currentBrushSize / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // DEBUG: Check if brush content was actually drawn
        const imageData = ctx.getImageData(x, y, 1, 1);
        const pixel = imageData.data;
        console.log('🖌️ DEBUG: Brush pixel after drawing:', `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3]})`);
      };
      
      // Draw with symmetry
      drawWithSymmetry(drawBrushAt);
      
      // Track brush stroke for layer management
      let currentLayer;
      if (LAYER_SYSTEM_CONFIG.USE_ADVANCED_LAYERS) {
        try {
          currentLayer = layerBridge.getOrCreateActiveLayer(activeTool);
        } catch (error) {
          console.warn('🎨 Advanced layer system failed, using fallback:', error);
          const getOrCreateActiveLayer = useApp.getState().getOrCreateActiveLayer;
          currentLayer = getOrCreateActiveLayer ? getOrCreateActiveLayer(activeTool) : null;
        }
      } else {
        const getOrCreateActiveLayer = useApp.getState().getOrCreateActiveLayer;
        currentLayer = getOrCreateActiveLayer ? getOrCreateActiveLayer(activeTool) : null;
      }
      if (currentLayer) {
        const newStroke = {
          id: `stroke-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          layerId: currentLayer.id,
           points: [{ x: Math.floor(uv.x * layer.canvas.width), y: Math.floor(uv.y * layer.canvas.height) }],
          color: actualBrushColor,
          size: brushSize,
          opacity: effectiveOpacity,
          timestamp: Date.now()
        };
        
        // Add to brush strokes array
        const currentStrokes = useApp.getState().brushStrokes || [];
        useApp.setState({ brushStrokes: [...currentStrokes, newStroke] });
        
        console.log('🎨 Brush stroke tracked and linked to layer:', currentLayer.id, newStroke);
      }
      
      // PERFORMANCE FIX: Reduced debug logging
      if (Date.now() % 5000 < 100) { // Only log every 5 seconds
        console.log('🎨 Applied brush paint with color:', actualBrushColor, 'symmetry:', { symmetryX, symmetryY, symmetryZ });
      }
      
    } else if (activeTool === 'fill') {
      // Fill tool - flood fill algorithm
      console.log('🪣 Fill: Starting flood fill at position:', { x, y });
      
      const fillColor = useApp.getState().brushColor;
      const fillTolerance = useApp.getState().fillTolerance;
      const fillGrow = useApp.getState().fillGrow;
      const fillAntiAlias = useApp.getState().fillAntiAlias;
      const fillContiguous = useApp.getState().fillContiguous;
      
      console.log('🪣 Fill settings:', { fillColor, fillTolerance, fillGrow, fillAntiAlias, fillContiguous });
      
      // Get the current pixel color at the click position
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixelIndex = (y * canvas.width + x) * 4;
      const targetR = imageData.data[pixelIndex];
      const targetG = imageData.data[pixelIndex + 1];
      const targetB = imageData.data[pixelIndex + 2];
      const targetA = imageData.data[pixelIndex + 3];
      
      console.log('🪣 Target pixel color:', { r: targetR, g: targetG, b: targetB, a: targetA });
      
      // Convert fill color to RGB
      const fillRgb = hexToRgb(fillColor);
      if (!fillRgb) {
        console.error('🪣 Invalid fill color:', fillColor);
        ctx.restore();
        return;
      }
      
      console.log('🪣 Fill color RGB:', fillRgb);
      
      // Flood fill algorithm
      const visited = new Set<string>();
      const stack: Array<{x: number, y: number}> = [{x, y}];
      const pixelsToFill: Array<{x: number, y: number}> = [];
      
      while (stack.length > 0) {
        const {x: currentX, y: currentY} = stack.pop()!;
        const key = `${currentX},${currentY}`;
        
        if (visited.has(key) || currentX < 0 || currentX >= canvas.width || currentY < 0 || currentY >= canvas.height) {
          continue;
        }
        
        visited.add(key);
        
        const currentPixelIndex = (currentY * canvas.width + currentX) * 4;
        const currentR = imageData.data[currentPixelIndex];
        const currentG = imageData.data[currentPixelIndex + 1];
        const currentB = imageData.data[currentPixelIndex + 2];
        const currentA = imageData.data[currentPixelIndex + 3];
        
        // Check if pixel matches target color within tolerance
        const colorDistance = Math.sqrt(
          Math.pow(currentR - targetR, 2) +
          Math.pow(currentG - targetG, 2) +
          Math.pow(currentB - targetB, 2) +
          Math.pow(currentA - targetA, 2)
        );
        
        if (colorDistance <= fillTolerance) {
          pixelsToFill.push({x: currentX, y: currentY});
          
          // Add neighboring pixels to stack
          if (fillContiguous) {
            stack.push({x: currentX + 1, y: currentY});
            stack.push({x: currentX - 1, y: currentY});
            stack.push({x: currentX, y: currentY + 1});
            stack.push({x: currentX, y: currentY - 1});
          }
        }
      }
      
      console.log('🪣 Pixels to fill:', pixelsToFill.length);
      
      // Apply fill color to all matching pixels
      ctx.fillStyle = fillColor;
      ctx.globalAlpha = brushOpacity;
      ctx.globalCompositeOperation = 'source-over';
      
      // Draw filled pixels
      pixelsToFill.forEach(({x: pixelX, y: pixelY}) => {
        ctx.fillRect(pixelX, pixelY, 1, 1);
      });
      
      console.log('🪣 Fill completed with', pixelsToFill.length, 'pixels filled');
      
    } else if (activeTool === 'eraser') {
      // Eraser tool - erase from ALL texture layers and displacement layers
      console.log('🧽 Eraser: Erasing from all texture layers and displacement layers at position:', { x, y });
      
      // FIXED: Get current brush size from store to avoid stale closures
      const currentBrushSize = useApp.getState().brushSize;
      const halfSize = currentBrushSize / 2;
      const appState = useApp.getState();
      
      // Helper function to erase from any canvas
      const eraseFromCanvas = (canvas: HTMLCanvasElement | null, canvasName: string, isDisplacement = false, isNormal = false) => {
        if (!canvas) return;
        
        const canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) return;
        
        canvasCtx.save();
        // FIXED: Use full opacity (1.0) for eraser to completely remove pixels, not just make them transparent
        canvasCtx.globalAlpha = 1.0;
        
        if (isDisplacement) {
          // CRITICAL FIX: For displacement maps, set to black (0) for no displacement
          canvasCtx.globalCompositeOperation = 'source-over';
          canvasCtx.fillStyle = '#000000'; // Black (0) for no displacement
          console.log(`🧽 Setting ${canvasName} to black (no displacement)`);
        } else if (isNormal) {
          // For normal maps, set to default normal (pointing up)
          canvasCtx.globalCompositeOperation = 'source-over';
          canvasCtx.fillStyle = '#8080FF'; // Default normal (128, 128, 255) pointing up
          console.log(`🧽 Setting ${canvasName} to default normal values`);
        } else {
          // For regular canvases, use destination-out to erase
          canvasCtx.globalCompositeOperation = 'destination-out';
          canvasCtx.fillStyle = '#000000';
          console.log(`🧽 Erasing from ${canvasName} canvas`);
        }
        
        canvasCtx.beginPath();
        switch (brushShape) {
          case 'round':
            canvasCtx.arc(x, y, halfSize, 0, Math.PI * 2);
          break;
          case 'square':
            canvasCtx.rect(x - halfSize, y - halfSize, currentBrushSize, currentBrushSize);
            break;
          default:
            canvasCtx.arc(x, y, halfSize, 0, Math.PI * 2);
        }
        
        canvasCtx.fill();
        canvasCtx.restore();
      };
      
      // FIXED: DON'T erase from composedCanvas - it contains the base model texture!
      // Only erase from individual layer canvases, then composeLayers() will regenerate composedCanvas
      // eraseFromCanvas(canvas, 'main composed'); // ❌ REMOVED - this was fading the model texture
      
      // 1. Erase from all individual layer canvases
      const { layers } = useApp.getState();
      layers.forEach(layer => {
        if (layer.canvas && layer.visible) {
          eraseFromCanvas(layer.canvas, `layer: ${layer.name}`);
        }
      });
      
      // 3. Erase from all texture layer canvases
      const textureCanvases = [
        { canvas: appState.puffCanvas, name: 'puff', isDisplacement: false, isNormal: false },
        { canvas: appState.displacementCanvas, name: 'displacement', isDisplacement: true, isNormal: false },
        { canvas: appState.normalCanvas, name: 'normal', isDisplacement: false, isNormal: true },
        { canvas: appState.embroideryCanvas, name: 'embroidery', isDisplacement: false, isNormal: false }
      ];
      
      textureCanvases.forEach(({ canvas, name, isDisplacement, isNormal }) => {
        eraseFromCanvas(canvas, name, isDisplacement, isNormal);
      });
      
      // 4. Erase text and shape elements that intersect with eraser area
      const composedCanvas = appState.composedCanvas;
      if (composedCanvas) {
        const uv = { u: x / composedCanvas.width, v: y / composedCanvas.height };
        
        // Erase text elements (partial erasing by modifying text content)
        const { textElements, updateTextElement } = appState;
        const eraserRadius = currentBrushSize / 2;
        const eraserX = x;
        const eraserY = y;
        
        textElements.forEach(textEl => {
          // Convert text UV coordinates to canvas coordinates
          const textX = Math.round(textEl.u * composedCanvas.width);
          const textY = Math.round((1 - textEl.v) * composedCanvas.height);
          
          // Calculate text bounds (approximate)
          const textWidth = textEl.text.length * textEl.fontSize * 0.6; // Approximate width
          const textHeight = textEl.fontSize;
          
          // Check if eraser intersects with text bounds
          const intersects = (
            eraserX + eraserRadius >= textX - textWidth/2 &&
            eraserX - eraserRadius <= textX + textWidth/2 &&
            eraserY + eraserRadius >= textY &&
            eraserY - eraserRadius <= textY + textHeight
          );
          
          if (intersects) {
            // Calculate which characters are within eraser radius
            const charWidth = textEl.fontSize * 0.6;
            const startX = textX - textWidth/2;
            
            let newText = '';
            for (let i = 0; i < textEl.text.length; i++) {
              const charX = startX + (i * charWidth) + charWidth/2;
              const charY = textY + textHeight/2;
              
              const distance = Math.sqrt((eraserX - charX) ** 2 + (eraserY - charY) ** 2);
              
              if (distance > eraserRadius) {
                newText += textEl.text[i];
              }
            }
            
            if (newText !== textEl.text) {
              console.log('🧽 Partially erasing text:', textEl.text, '->', newText);
              updateTextElement(textEl.id, { text: newText });
            }
          }
        });
        
        // Erase shape elements (partial erasing by reducing opacity)
        const { shapeElements, updateShapeElement } = appState;
        shapeElements.forEach(shapeEl => {
          // Convert shape position percentages to canvas coordinates
          const shapeX = Math.round((shapeEl.positionX / 100) * composedCanvas.width);
          const shapeY = Math.round((shapeEl.positionY / 100) * composedCanvas.height);
          
          // Calculate shape bounds
          const shapeRadius = shapeEl.size / 2;
          
          // Check if eraser intersects with shape bounds
          const distance = Math.sqrt((eraserX - shapeX) ** 2 + (eraserY - shapeY) ** 2);
          const intersects = distance <= (eraserRadius + shapeRadius);
          
          if (intersects) {
            // Calculate how much of the shape is within eraser radius
            const overlapRadius = Math.min(eraserRadius, shapeRadius);
            const overlapArea = Math.PI * overlapRadius * overlapRadius;
            const totalArea = Math.PI * shapeRadius * shapeRadius;
            const overlapPercentage = overlapArea / totalArea;
            
            // Reduce opacity based on overlap percentage
            const opacityReduction = overlapPercentage * brushOpacity;
            const newOpacity = Math.max(0, shapeEl.opacity - opacityReduction);
            
            if (newOpacity !== shapeEl.opacity) {
              console.log('🧽 Partially erasing shape:', shapeEl.type, 'opacity:', shapeEl.opacity, '->', newOpacity);
              updateShapeElement(shapeEl.id, { opacity: newOpacity });
            }
          }
        });
        
        // Dispatch puff erase event
        if (appState.puffCanvas) {
          const puffEraseEvent = new CustomEvent('puffErase', {
            detail: { uv, pressure: 1.0 }
          });
          document.dispatchEvent(puffEraseEvent);
          console.log('🧽 Dispatched puff erase event');
        }
        
        // Dispatch embroidery erase event
        if (appState.embroideryCanvas) {
          const embroideryEraseEvent = new CustomEvent('embroideryErase', {
            detail: { uv, pressure: 1.0 }
          });
          document.dispatchEvent(embroideryEraseEvent);
          console.log('🧽 Dispatched embroidery erase event');
        }
        
        // Dispatch general texture erase event for any other tools
        const textureEraseEvent = new CustomEvent('textureErase', {
          detail: { uv, pressure: 1.0, brushSize, brushOpacity, brushShape }
        });
        document.dispatchEvent(textureEraseEvent);
        console.log('🧽 Dispatched general texture erase event');
        
        // CRITICAL FIX: Don't call composeLayers - it clears the original model texture!
        // Instead, update texture directly from layer canvases
        setTimeout(() => {
          if ((window as any).updateModelTexture) {
            (window as any).updateModelTexture(true, true);
          }
        }, 10);
      }
      
      // CRITICAL FIX: Don't call composeLayers - it clears the original model texture!
      // Instead, update texture directly from layer canvases
      console.log('🧽 Skipping composeLayers to preserve original model texture');
      
      // 7. Force texture updates on the 3D model with a slight delay to ensure composition is complete
      setTimeout(() => {
        try {
          // Only update displacement maps if puff data exists
          const puffCanvas = useApp.getState().puffCanvas;
          const needsDisplacementUpdate = !!(puffCanvas && modelScene);
          
          updateModelTexture(false, needsDisplacementUpdate);
          console.log('🧽 Updated 3D model texture after erasure');
          
          if (needsDisplacementUpdate) {
            console.log('🧽 Updated puff displacement maps after erasure');
          }
          
          // Trigger any texture update callbacks
          const textureUpdateEvent = new CustomEvent('textureUpdate', {
            detail: { type: 'erase', position: { x, y }, brushSize, brushOpacity }
          });
          document.dispatchEvent(textureUpdateEvent);
          console.log('🧽 Dispatched texture update event');
        } catch (error) {
          console.log('Texture update event failed:', error);
        }
      }, 50); // Small delay to ensure composition is complete
      
      console.log('🧽 Eraser applied to ALL texture layers and displacement layers at position:', { x, y });
      
    } else if (activeTool === 'embroidery') {
      // Handle embroidery tool - draw continuous stitch patterns
      console.log('🎨 Embroidery: Drawing stitch with symmetry');

      // Get embroidery settings from store
      const embroiderySettings = useApp.getState();
      const embroideryThreadColor = embroiderySettings.embroideryThreadColor || '#ff0000';
      const embroideryThreadThickness = embroiderySettings.embroideryThreadThickness || 0.5;
      const embroideryStitchType = embroiderySettings.embroideryStitchType || 'satin';
      const lastPoint = embroiderySettings.lastEmbroideryPoint;

      // Define embroidery drawing function for symmetry
      const drawEmbroideryAt = (x: number, y: number) => {

      // Setup canvas for realistic embroidery thread drawing
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;
      
      const threadSize = embroideryThreadThickness * 3;
      
      // Create realistic thread texture with multiple layers
      const drawThreadStitch = (startX: number, startY: number, endX: number, endY: number) => {
        const dx = endX - startX;
        const dy = endY - startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Create thread with realistic texture
        ctx.save();
        ctx.translate(startX, startY);
        ctx.rotate(angle);
        
        // Draw main thread body with gradient for 3D effect
        const gradient = ctx.createLinearGradient(0, -threadSize/2, 0, threadSize/2);
        const baseColor = embroideryThreadColor;
        
        // Create thread color variations for realistic appearance
        const darken = (color: string, factor: number) => {
          const hex = color.replace('#', '');
          const r = Math.floor(parseInt(hex.substr(0, 2), 16) * factor);
          const g = Math.floor(parseInt(hex.substr(2, 2), 16) * factor);
          const b = Math.floor(parseInt(hex.substr(4, 2), 16) * factor);
          return `rgb(${r}, ${g}, ${b})`;
        };
        
        gradient.addColorStop(0, darken(baseColor, 0.7)); // Darker edge
        gradient.addColorStop(0.3, darken(baseColor, 0.9)); // Medium
        gradient.addColorStop(0.5, baseColor); // Main color
        gradient.addColorStop(0.7, darken(baseColor, 0.9)); // Medium
        gradient.addColorStop(1, darken(baseColor, 0.7)); // Darker edge
        
        ctx.fillStyle = gradient;
        ctx.strokeStyle = darken(baseColor, 0.5);
        ctx.lineWidth = 2;
        
        // Draw thread body
        ctx.beginPath();
        ctx.ellipse(length/2, 0, length/2, threadSize/2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Add thread texture with small lines
        ctx.strokeStyle = darken(baseColor, 0.8);
        ctx.lineWidth = 1;
        for (let i = 0; i < length; i += threadSize * 0.5) {
          ctx.beginPath();
          ctx.moveTo(i, -threadSize/4);
          ctx.lineTo(i + threadSize * 0.3, threadSize/4);
          ctx.stroke();
        }
        
        // Add highlight for 3D effect
        ctx.strokeStyle = darken(baseColor, 1.3);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(threadSize * 0.1, -threadSize/3);
        ctx.lineTo(length - threadSize * 0.1, -threadSize/3);
        ctx.stroke();
        
        // Add shadow for depth
        ctx.strokeStyle = darken(baseColor, 0.4);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(threadSize * 0.1, threadSize/3);
        ctx.lineTo(length - threadSize * 0.1, threadSize/3);
        ctx.stroke();
        
        ctx.restore();
      };
      
      // Draw continuous patterns between last point and current point
      if (lastPoint) {
        const dx = x - lastPoint.x;
        const dy = y - lastPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        switch (embroideryStitchType) {
          case 'cross-stitch':
          case 'cross':
            // Draw realistic cross stitch with thread texture
            const crossSpacing = threadSize * 2;
            for (let d = 0; d < distance; d += crossSpacing) {
              const px = lastPoint.x + (dx / distance) * d;
              const py = lastPoint.y + (dy / distance) * d;
              const halfSize = threadSize * 1.2;
              
              // Draw diagonal thread stitches to form X
              drawThreadStitch(px - halfSize, py - halfSize, px + halfSize, py + halfSize);
              drawThreadStitch(px + halfSize, py - halfSize, px - halfSize, py + halfSize);
            }
          break;
          
          case 'chain':
            // Draw realistic chain stitch with thread loops
            const chainSpacing = threadSize * 1.5;
            for (let d = 0; d < distance; d += chainSpacing) {
              const px = lastPoint.x + (dx / distance) * d;
              const py = lastPoint.y + (dy / distance) * d;
              
              // Draw chain loop with thread texture
              ctx.save();
              ctx.translate(px, py);
              
              // Draw loop as curved thread
              const loopRadius = threadSize * 0.8;
              ctx.beginPath();
              ctx.arc(0, 0, loopRadius, 0, Math.PI * 2);
              ctx.strokeStyle = embroideryThreadColor;
              ctx.lineWidth = threadSize * 0.3;
              ctx.stroke();
              
              // Add thread texture to loop
              ctx.strokeStyle = embroideryThreadColor;
              ctx.lineWidth = 1;
              for (let i = 0; i < Math.PI * 2; i += 0.3) {
                ctx.beginPath();
                ctx.moveTo(Math.cos(i) * (loopRadius - threadSize/4), Math.sin(i) * (loopRadius - threadSize/4));
                ctx.lineTo(Math.cos(i) * (loopRadius + threadSize/4), Math.sin(i) * (loopRadius + threadSize/4));
                ctx.stroke();
              }
              
              ctx.restore();
              
              if (d > 0) {
                // Connect loops with thread
                const prevPx = lastPoint.x + (dx / distance) * (d - chainSpacing);
                const prevPy = lastPoint.y + (dy / distance) * (d - chainSpacing);
                drawThreadStitch(prevPx, prevPy, px, py);
              }
            }
            break;

          case 'french-knot':
          case 'french_knot':
            // Draw realistic French knots with thread texture
            const knotSpacing = threadSize * 3;
            for (let d = 0; d < distance; d += knotSpacing) {
              const px = lastPoint.x + (dx / distance) * d;
              const py = lastPoint.y + (dy / distance) * d;
              
              // Draw French knot as coiled thread
              ctx.save();
              ctx.translate(px, py);
              
              // Create knot with multiple thread wraps
              const knotRadius = threadSize * 1.5;
              for (let wrap = 0; wrap < 3; wrap++) {
                const radius = knotRadius - (wrap * threadSize * 0.2);
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.strokeStyle = embroideryThreadColor;
                ctx.lineWidth = threadSize * 0.4;
                ctx.stroke();
                
                // Add thread texture to each wrap
                for (let i = 0; i < Math.PI * 2; i += 0.5) {
                  ctx.beginPath();
                  ctx.moveTo(Math.cos(i) * (radius - threadSize/6), Math.sin(i) * (radius - threadSize/6));
                  ctx.lineTo(Math.cos(i) * (radius + threadSize/6), Math.sin(i) * (radius + threadSize/6));
                  ctx.stroke();
                }
              }
              
              // Add highlight to knot
              ctx.strokeStyle = embroideryThreadColor;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.arc(-knotRadius * 0.3, -knotRadius * 0.3, knotRadius * 0.4, 0, Math.PI * 2);
              ctx.stroke();
              
              ctx.restore();
            }
          break;
          
          case 'seed':
            // Draw realistic seed stitches with thread texture
            const seedSpacing = threadSize * 2;
            for (let d = 0; d < distance; d += seedSpacing) {
              const px = lastPoint.x + (dx / distance) * d;
              const py = lastPoint.y + (dy / distance) * d;
              
              // Draw random seed stitch as small thread segment
              const seedLength = threadSize * 0.8;
              const seedAngle = Math.random() * Math.PI;
              
              ctx.save();
              ctx.translate(px, py);
              ctx.rotate(seedAngle);
              
              // Draw seed as small thread with texture
              const seedGradient = ctx.createLinearGradient(-seedLength/2, 0, seedLength/2, 0);
              seedGradient.addColorStop(0, embroideryThreadColor);
              seedGradient.addColorStop(0.5, embroideryThreadColor);
              seedGradient.addColorStop(1, embroideryThreadColor);
              
              ctx.fillStyle = seedGradient;
              ctx.beginPath();
              ctx.ellipse(0, 0, seedLength/2, threadSize/4, 0, 0, Math.PI * 2);
              ctx.fill();
              
              // Add thread texture
              ctx.strokeStyle = embroideryThreadColor;
              ctx.lineWidth = 1;
              for (let i = -seedLength/2; i < seedLength/2; i += threadSize * 0.2) {
                ctx.beginPath();
                ctx.moveTo(i, -threadSize/6);
                ctx.lineTo(i + threadSize * 0.1, threadSize/6);
                ctx.stroke();
              }
              
              ctx.restore();
            }
          break;
          
          case 'feather':
            // Draw feather stitch with alternating branches
            const featherSpacing = threadSize * 2;
          ctx.beginPath();
            ctx.moveTo(lastPoint.x, lastPoint.y);
            ctx.lineTo(x, y);
            ctx.stroke();
            
            for (let d = featherSpacing; d < distance; d += featherSpacing) {
              const px = lastPoint.x + (dx / distance) * d;
              const py = lastPoint.y + (dy / distance) * d;
              const side = (Math.floor(d / featherSpacing) % 2) * 2 - 1; // Alternate sides
              const perpAngle = angle + Math.PI / 2;
              const branchLength = threadSize * 1.5;
              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(
                px + Math.cos(perpAngle) * branchLength * side,
                py + Math.sin(perpAngle) * branchLength * side
              );
              ctx.stroke();
            }
          break;
          
          case 'bullion':
            // Draw wrapped coil stitches
            const bullionSpacing = threadSize * 2.5;
            for (let d = 0; d < distance; d += bullionSpacing) {
              const px = lastPoint.x + (dx / distance) * d;
              const py = lastPoint.y + (dy / distance) * d;
      ctx.save();
              ctx.translate(px, py);
              ctx.rotate(angle);
              // Draw coiled effect
              for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(i * threadSize * 0.3, 0, threadSize * 0.8, 0, Math.PI * 2);
                ctx.stroke();
              }
              ctx.restore();
            }
            break;

          case 'running-stitch':
          case 'running':
            // Draw dashed running stitch
      ctx.save();
            ctx.setLineDash([threadSize * 1.5, threadSize * 1.5]);
          ctx.beginPath();
            ctx.moveTo(lastPoint.x, lastPoint.y);
            ctx.lineTo(x, y);
            ctx.stroke();
      ctx.restore();
          break;
          
          case 'zigzag':
            // Draw continuous zigzag pattern
            const zigzagSpacing = threadSize * 1.5;
            const zigzagHeight = threadSize;
            ctx.beginPath();
            ctx.moveTo(lastPoint.x, lastPoint.y);
            const perpAngle = angle + Math.PI / 2;
            for (let d = 0; d < distance; d += zigzagSpacing) {
              const px = lastPoint.x + (dx / distance) * d;
              const py = lastPoint.y + (dy / distance) * d;
              const side = (Math.floor(d / zigzagSpacing) % 2) * 2 - 1;
              ctx.lineTo(
                px + Math.cos(perpAngle) * zigzagHeight * side,
                py + Math.sin(perpAngle) * zigzagHeight * side
              );
            }
            ctx.stroke();
          break;
          
          case 'blanket':
            // Draw blanket stitch with perpendicular loops
            const blanketSpacing = threadSize * 2;
          ctx.beginPath();
            ctx.moveTo(lastPoint.x, lastPoint.y);
            ctx.lineTo(x, y);
            ctx.stroke();
            
            const perpBlanket = angle + Math.PI / 2;
            for (let d = blanketSpacing; d < distance; d += blanketSpacing) {
              const px = lastPoint.x + (dx / distance) * d;
              const py = lastPoint.y + (dy / distance) * d;
          ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(
                px + Math.cos(perpBlanket) * threadSize * 1.5,
                py + Math.sin(perpBlanket) * threadSize * 1.5
              );
              ctx.stroke();
            }
          break;
          
          case 'herringbone':
            // Draw herringbone with crossed stitches
            const herringSpacing = threadSize * 1.5;
            const perpHerring = angle + Math.PI / 2;
            for (let d = 0; d < distance; d += herringSpacing) {
              const px = lastPoint.x + (dx / distance) * d;
              const py = lastPoint.y + (dy / distance) * d;
              const side = (Math.floor(d / herringSpacing) % 2) * 2 - 1;
              
          ctx.beginPath();
              ctx.moveTo(
                px + Math.cos(perpHerring) * threadSize * side,
                py + Math.sin(perpHerring) * threadSize * side
              );
              ctx.lineTo(
                px + Math.cos(angle) * threadSize * 1.5 - Math.cos(perpHerring) * threadSize * side,
                py + Math.sin(angle) * threadSize * 1.5 - Math.sin(perpHerring) * threadSize * side
              );
              ctx.stroke();
            }
          break;
          
          case 'backstitch':
          case 'outline':
            // Draw solid continuous line
            ctx.beginPath();
            ctx.moveTo(lastPoint.x, lastPoint.y);
            ctx.lineTo(x, y);
            ctx.stroke();
            break;

          case 'satin':
          case 'fill':
          case 'long_short_satin':
          case 'fill_tatami':
          default:
            // Default satin stitch - draw smooth continuous thread
            drawThreadStitch(lastPoint.x, lastPoint.y, x, y);
            
            // Add highlight along the line for sheen effect
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 0.2;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = threadSize * 0.6;
            ctx.beginPath();
            ctx.moveTo(lastPoint.x, lastPoint.y);
            ctx.lineTo(x, y);
            ctx.stroke();
          break;
        }
      } else {
        // First point - just draw a dot
        ctx.beginPath();
        ctx.arc(x, y, threadSize, 0, Math.PI * 2);
      ctx.fill();
      }

        // Create embroidery stitch record with layer ID
        let currentLayer;
        if (LAYER_SYSTEM_CONFIG.USE_ADVANCED_LAYERS) {
          try {
            currentLayer = layerBridge.getOrCreateActiveLayer(activeTool);
          } catch (error) {
            console.warn('🎨 Advanced layer system failed, using fallback:', error);
            const getOrCreateActiveLayer = useApp.getState().getOrCreateActiveLayer;
            currentLayer = getOrCreateActiveLayer ? getOrCreateActiveLayer(activeTool) : null;
          }
        } else {
          const getOrCreateActiveLayer = useApp.getState().getOrCreateActiveLayer;
          currentLayer = getOrCreateActiveLayer ? getOrCreateActiveLayer(activeTool) : null;
        }
        if (currentLayer) {
          const newStitch = {
            id: `stitch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            layerId: currentLayer.id,
            type: embroideryStitchType,
            color: embroideryThreadColor,
            threadType: 'cotton',
            thickness: embroideryThreadThickness,
            opacity: 1.0,
            points: lastPoint ? [{ x: lastPoint.x, y: lastPoint.y }, { x, y }] : [{ x, y }],
            timestamp: Date.now()
          };
          
          // Add to embroidery stitches array
          const currentStitches = useApp.getState().embroideryStitches || [];
          useApp.setState({ 
            embroideryStitches: [...currentStitches, newStitch as any],
            lastEmbroideryPoint: { x, y }
          });
          
          console.log('🎨 Embroidery stitch created and linked to layer:', currentLayer.id, newStitch);
        } else {
          // Fallback: just update last point
          useApp.setState({ lastEmbroideryPoint: { x, y } });
        }

        console.log('🎨 Embroidery stitch drawn:', embroideryStitchType, 'at position:', { x, y });
      };

      // Draw with symmetry
      drawWithSymmetry(drawEmbroideryAt);

    } else if (activeTool === 'vector') {
      // Handle vector tool with different edit modes
      const vectorState = useApp.getState();
      const { vectorEditMode, selectedAnchor, vectorPaths } = vectorState;
      
      console.log('🎨 Vector: Mode:', vectorEditMode, 'at UV:', { u: uv.x, v: uv.y });

      if (vectorEditMode === 'pen') {
        // Smart pen mode - check if clicking near existing anchor first
        let nearestAnchor: { pathId: string; anchorIndex: number; distance: number } | null = null;
        let minDistance = 20; // 20 pixel threshold for anchor detection

        console.log('🎨 Vector: Checking for nearby anchors at click position:', { x, y });

        vectorPaths.forEach(path => {
          path.points.forEach((point, index) => {
            const anchorX = Math.floor(point.u * canvas.width);
            const anchorY = Math.floor(point.v * canvas.height);
            const distance = Math.sqrt((anchorX - x) ** 2 + (anchorY - y) ** 2);
            
            console.log('🎨 Vector: Checking anchor:', { 
              pathId: path.id, 
              index, 
              anchorPos: { x: anchorX, y: anchorY }, 
              clickPos: { x, y }, 
              distance 
            });
            
            if (distance < minDistance) {
              nearestAnchor = { pathId: path.id, anchorIndex: index, distance };
              minDistance = distance;
              console.log('🎨 Vector: Found closer anchor:', nearestAnchor);
            }
          });
        });

        if (nearestAnchor) {
          // Clicked near existing anchor - select it and start dragging
          const anchor = nearestAnchor as { pathId: string; anchorIndex: number; distance: number };
          console.log('🎨 Vector: Selecting anchor:', anchor);
          
          // Clear any previous selection and select only this anchor
          useApp.setState({ 
            selectedAnchor: { 
              pathId: anchor.pathId, 
              anchorIndex: anchor.anchorIndex 
            }
          });
          
          isDraggingAnchorRef.current = true;
          dragStartPosRef.current = { x, y };
          
          console.log('🎨 Vector: Selected existing anchor and started dragging:', nearestAnchor);
          console.log('🎨 Vector: Updated state - selectedAnchor:', useApp.getState().selectedAnchor);
          return; // Don't create new anchor, just select existing one
        } else {
          // No nearby anchor - clear any existing selection and create new anchor
          const activePathId = vectorState.activePathId;
          
          // Clear any existing selection first
          useApp.setState({ selectedAnchor: null });
          
          // Create VectorAnchor with proper UV coordinates and bezier handles
          const anchor = {
            u: uv.x,  // UV coordinate (0-1 range)
            v: uv.y,  // UV coordinate (0-1 range)
            inHandle: null,   // Bezier control handle (in)
            outHandle: null,  // Bezier control handle (out)
            curveControl: false
          };

          // Check if we have an active path
          const activePath = vectorPaths.find(p => p.id === activePathId);

          if (!activePath) {
            // Start new vector path
            const newPath = {
              id: `vpath-${Date.now()}`,
              points: [anchor],
              closed: false
            };
            
            // Add to vector paths and set as active, clear previous selection
            useApp.setState({ 
              vectorPaths: [...vectorPaths, newPath],
              activePathId: newPath.id,
              selectedAnchor: { 
                pathId: newPath.id, 
                anchorIndex: 0 
              }
            });
            console.log('🎨 Vector: Started new path at UV:', { u: uv.x, v: uv.y });
          } else {
            // Add anchor to existing path
            const updatedPaths = vectorPaths.map(p => 
              p.id === activePathId 
                ? { ...p, points: [...p.points, anchor] }
                : p
            );
            
            // Select the newly created anchor
            const newAnchorIndex = activePath.points.length;
            useApp.setState({ 
              vectorPaths: updatedPaths,
              selectedAnchor: { 
                pathId: activePathId!, 
                anchorIndex: newAnchorIndex 
              }
            });
            console.log('🎨 Vector: Added anchor, total:', newAnchorIndex + 1);
          }
        }

      // Draw all vector paths with visual feedback
      const renderVectorPaths = () => {
        const vectorState = useApp.getState();
        const { vectorPaths, selectedAnchor, vectorEditMode } = vectorState;
        
        vectorPaths.forEach(path => {
          if (path.points.length === 0) return;
          
          ctx.save();
          
          // Ensure crisp rendering for vector paths
          ctx.imageSmoothingEnabled = false;
          ctx.imageSmoothingQuality = 'high';
          
          // Draw path lines
          ctx.strokeStyle = vectorState.vectorStrokeColor || '#000000';
          ctx.lineWidth = vectorState.vectorStrokeWidth || 2;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
      ctx.beginPath();
          
          path.points.forEach((point, index) => {
            const x = Math.floor(point.u * canvas.width);
            const y = Math.floor(point.v * canvas.height);
            
            if (index === 0) {
              ctx.moveTo(x, y);
            } else {
              // Draw bezier curve if handles exist
              const prevPoint = path.points[index - 1];
              if (prevPoint.outHandle || point.inHandle) {
                const prevX = Math.floor(prevPoint.u * canvas.width);
                const prevY = Math.floor(prevPoint.v * canvas.height);
                const cp1X = prevPoint.outHandle ? Math.floor(prevPoint.outHandle.u * canvas.width) : prevX;
                const cp1Y = prevPoint.outHandle ? Math.floor(prevPoint.outHandle.v * canvas.height) : prevY;
                const cp2X = point.inHandle ? Math.floor(point.inHandle.u * canvas.width) : x;
                const cp2Y = point.inHandle ? Math.floor(point.inHandle.v * canvas.height) : y;
                
                ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }
          });
          
          if (path.closed && path.points.length > 2) {
            ctx.closePath();
          }
          
          ctx.stroke();
          
          // Draw anchors
          path.points.forEach((point, index) => {
            const x = Math.floor(point.u * canvas.width);
            const y = Math.floor(point.v * canvas.height);
            const isSelected = selectedAnchor && 
              selectedAnchor.pathId === path.id && 
              selectedAnchor.anchorIndex === index;
            
            // Anchor point with black outline for selected
            ctx.fillStyle = isSelected ? '#FFFFFF' : '#3B82F6';
            ctx.beginPath();
            ctx.arc(x, y, isSelected ? 7 : 5, 0, Math.PI * 2);
      ctx.fill();
            
            // White outline
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Black outline for selected anchors
            if (isSelected) {
              ctx.strokeStyle = '#000000';
              ctx.lineWidth = 3;
              ctx.stroke();
            }
            
            // Draw curve handles
            if (vectorEditMode === 'curve' && isSelected) {
              // Out handle
              if (point.outHandle) {
                const handleX = Math.floor(point.outHandle.u * canvas.width);
                const handleY = Math.floor(point.outHandle.v * canvas.height);
                
                ctx.strokeStyle = '#ff6b6b';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(handleX, handleY);
                ctx.stroke();
                
                ctx.fillStyle = '#ff6b6b';
                ctx.beginPath();
                ctx.arc(handleX, handleY, 3, 0, Math.PI * 2);
                ctx.fill();
              }
              
              // In handle
              if (point.inHandle) {
                const handleX = Math.floor(point.inHandle.u * canvas.width);
                const handleY = Math.floor(point.inHandle.v * canvas.height);
                
                ctx.strokeStyle = '#4ecdc4';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(handleX, handleY);
                ctx.stroke();
                
                ctx.fillStyle = '#4ecdc4';
                ctx.beginPath();
                ctx.arc(handleX, handleY, 3, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          });
    
    ctx.restore();
        });
      };
      
      // Call render function
      renderVectorPaths();

      } else if (vectorEditMode === 'select') {
        // Select mode - find and select nearest anchor
        let nearestAnchor: { pathId: string; anchorIndex: number; distance: number } | null = null;
        let minDistance = 20; // 20 pixel threshold

        vectorPaths.forEach(path => {
          path.points.forEach((point, index) => {
            const anchorX = Math.floor(point.u * canvas.width);
            const anchorY = Math.floor(point.v * canvas.height);
            const distance = Math.sqrt((anchorX - x) ** 2 + (anchorY - y) ** 2);
            
            if (distance < minDistance) {
              nearestAnchor = { pathId: path.id, anchorIndex: index, distance };
              minDistance = distance;
            }
          });
        });

        if (nearestAnchor) {
          const anchor = nearestAnchor as { pathId: string; anchorIndex: number; distance: number };
          useApp.setState({ 
            selectedAnchor: { 
              pathId: anchor.pathId, 
              anchorIndex: anchor.anchorIndex 
            }
          });
          console.log('🎨 Vector: Selected anchor:', nearestAnchor);
        } else {
          useApp.setState({ selectedAnchor: null });
          console.log('🎨 Vector: No anchor selected');
        }

      } else if (vectorEditMode === 'curve' && selectedAnchor) {
        // Curve mode - add curve handle to selected anchor
        const { pathId, anchorIndex } = selectedAnchor;
        const handleType = 'out'; // Default to out handle
        useApp.getState().addCurveHandle(pathId, anchorIndex, handleType, uv.x, uv.y);
        console.log('🎨 Vector: Added curve handle to anchor');
      }

    } else if (activeTool === 'puffPrint') {
      console.log('🎨 Puff Print Tool Active - Starting Drawing Process');
      
      // Draw puff print using global state settings
      const puffBrushSize = useApp.getState().puffBrushSize;
      const puffBrushOpacity = useApp.getState().puffBrushOpacity;
      const puffColor = useApp.getState().puffColor;
      const puffHeight = useApp.getState().puffHeight;
      const puffSoftness = useApp.getState().puffSoftness;
      
      console.log('🎨 Drawing puff print:', { 
        puffBrushSize, 
        puffBrushOpacity, 
        puffColor, 
        puffHeight, 
        puffSoftness, 
        x, y,
        canvasContext: !!ctx,
        canvasSize: { width: canvas.width, height: canvas.height }
      });
      
      // Create smooth puff stroke instead of dots
      const puffSize = puffBrushSize / 2; // Use radius instead of diameter
      
      // Apply softness to gradient stops
      const centerStop = 0;
      const edgeStop = puffSoftness;
      
      // DEBUG: Check if canvas context is valid
      if (!ctx) {
        console.error('🎨 ERROR: Canvas context is null! Cannot draw puff print.');
        return;
      }
      
      // DEBUG: Check canvas context state BEFORE drawing
      console.log('🎨 Canvas context state BEFORE drawing:', {
        globalAlpha: ctx.globalAlpha,
        globalCompositeOperation: ctx.globalCompositeOperation,
        fillStyle: ctx.fillStyle,
        strokeStyle: ctx.strokeStyle,
        lineWidth: ctx.lineWidth
      });
      
      // Draw puff color to layer canvas (like brush tool) for visible texture
      // Apply softness to gradient stops
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, puffSize);
      
      // Use completely solid puff color - no transparency to prevent texture corruption
      gradient.addColorStop(centerStop, puffColor);
      gradient.addColorStop(edgeStop, puffColor);
      gradient.addColorStop(1, puffColor); // CRITICAL FIX: Solid edge, no transparency
      
      // FIXED: Draw puff print to layer canvas like brush tool does
      // This ensures updateModelTexture can see and composite the puff print content
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0; // Full opacity for solid puff color
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, puffSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      
      console.log('🎨 FIXED: Drew puff to layer canvas like brush tool:', { x, y, puffSize, puffColor });
      
      // DEBUG: Check layer canvas content immediately after drawing
      const layerImageDataImmediate = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const samplePixelImmediate = layerImageDataImmediate.data.slice(0, 4);
      console.log('🎨 Layer canvas content IMMEDIATELY after drawing:', `rgba(${samplePixelImmediate[0]}, ${samplePixelImmediate[1]}, ${samplePixelImmediate[2]}, ${samplePixelImmediate[3]})`);
      
      // DEBUG: Check if the drawing actually happened by sampling the exact pixel we drew
      const drawnPixelData = ctx.getImageData(x, y, 1, 1);
      const drawnPixel = drawnPixelData.data.slice(0, 4);
      console.log('🎨 Drawn pixel at exact coordinates:', `rgba(${drawnPixel[0]}, ${drawnPixel[1]}, ${drawnPixel[2]}, ${drawnPixel[3]})`);
      
      // DEBUG: Check canvas size and coordinates
      console.log('🎨 Canvas debug info:', {
        canvasSize: { width: canvas.width, height: canvas.height },
        drawCoords: { x, y },
        puffSize,
        puffColor,
        centerStop,
        edgeStop
      });
      
      // FIXED: Also draw to puffCanvas for displacement detection (but with different approach)
      // The updateModelWithPuffDisplacement function needs puffCanvas content to apply 3D effects
      let puffCanvas = useApp.getState().puffCanvas;
      if (!puffCanvas) {
        puffCanvas = document.createElement('canvas');
        puffCanvas.width = 2048;
        puffCanvas.height = 2048;
        useApp.setState({ puffCanvas });
        console.log('🎨 Created puff canvas for displacement detection');
      }
      
      const puffCtx = puffCanvas.getContext('2d', { willReadFrequently: true });
      if (puffCtx) {
        // Draw a simple solid puff color to puffCanvas for displacement detection
        // This is only used by updateModelWithPuffDisplacement to detect puff content
        puffCtx.save();
        puffCtx.globalCompositeOperation = 'source-over';
        puffCtx.globalAlpha = 1.0;
        puffCtx.fillStyle = puffColor; // Use solid color for detection
        puffCtx.beginPath();
        puffCtx.arc(x, y, puffSize, 0, Math.PI * 2);
        puffCtx.fill();
        puffCtx.restore();
        
        console.log('🎨 Drew puff to puffCanvas for displacement detection:', { x, y, puffSize, puffColor });
      }
      
      // Create displacement map for 3D effect
      let displacementCanvas = useApp.getState().displacementCanvas;
      if (!displacementCanvas) {
        // Create displacement canvas if it doesn't exist
        displacementCanvas = document.createElement('canvas');
        displacementCanvas.width = 2048;
        displacementCanvas.height = 2048;
        useApp.setState({ displacementCanvas });
        console.log('🎨 Created displacement canvas for puff print');
      }
      
      const dispCtx = displacementCanvas.getContext('2d', { willReadFrequently: true });
      if (dispCtx) {
        // Displacement maps: 0-255, where 128 is neutral (no displacement)
        // Values > 128 push vertices outward, values < 128 pull vertices inward
        const baseDisplacement = 128; // Neutral gray
        const displacementRange = puffHeight * 50; // Scale height to displacement range
        const maxDisplacement = Math.min(255, baseDisplacement + displacementRange);
        const minDisplacement = Math.max(0, baseDisplacement - displacementRange * 0.1);
        
        // Create gradient for displacement
        const dispGradient = dispCtx.createRadialGradient(
          x, y, 0,
          x, y, puffSize
        );
        
        dispGradient.addColorStop(centerStop, `rgb(${maxDisplacement}, ${maxDisplacement}, ${maxDisplacement})`);
        dispGradient.addColorStop(edgeStop, `rgb(${minDisplacement}, ${minDisplacement}, ${minDisplacement})`);
        dispGradient.addColorStop(1, `rgb(${baseDisplacement}, ${baseDisplacement}, ${baseDisplacement})`);
        
        dispCtx.fillStyle = dispGradient;
        dispCtx.beginPath();
        dispCtx.arc(x, y, puffSize, 0, Math.PI * 2);
        dispCtx.fill();
        
        console.log('🎨 Displacement map updated for puff print');
        
        // CRITICAL FIX: Also update the layer's displacementCanvas property
        // This is what composeDisplacementMaps() uses!
        const layer = useApp.getState().layers.find(l => l.id === useApp.getState().activeLayerId);
        if (layer && layer.displacementCanvas) {
          const layerDispCtx = layer.displacementCanvas.getContext('2d');
          if (layerDispCtx) {
            // Draw the same grayscale displacement to the layer's displacement canvas
            layerDispCtx.globalCompositeOperation = 'source-over';
            layerDispCtx.fillStyle = dispGradient;
            layerDispCtx.beginPath();
            layerDispCtx.arc(x, y, puffSize, 0, Math.PI * 2);
            layerDispCtx.fill();
            console.log('🎨 Updated layer displacementCanvas with grayscale displacement');
          }
        }
      }
      
      console.log('🎨 Puff print drawn successfully');
      
      // DEBUG: Check layer canvas content after drawing
      const layerImageDataAfter = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const samplePixelAfter = layerImageDataAfter.data.slice(0, 4);
      console.log('🎨 Layer canvas content AFTER drawing:', `rgba(${samplePixelAfter[0]}, ${samplePixelAfter[1]}, ${samplePixelAfter[2]}, ${samplePixelAfter[3]})`);
      
      // DEBUG: Check if canvas context state is preserved
      console.log('🎨 Canvas context state:', {
        globalAlpha: ctx.globalAlpha,
        globalCompositeOperation: ctx.globalCompositeOperation,
        fillStyle: ctx.fillStyle,
        strokeStyle: ctx.strokeStyle
      });
      
      // CRITICAL FIX: Update texture immediately after drawing is complete
      // This prevents race conditions and ensures texture is updated with the drawn puff
      setTimeout(() => {
        updateModelTexture(false, true); // Update texture AND displacement
        updateModelWithPuffDisplacement();
        console.log('🎨 Applied texture and displacement to model for puff effect');
      }, 50); // Reduced delay for faster response
    }
    
    // Restore canvas state after drawing
    ctx.restore();
    // PERFORMANCE: Minimal logging
    if (Math.random() < 0.001) { // Only log 0.1% of the time
      console.log('🎨 Canvas state restored after drawing');
    }
    
    // CRITICAL FIX: Don't call composeLayers immediately - it clears the canvas!
    // Instead, update the model texture directly from the layer canvas
    
    // Throttle texture updates to improve performance
    if (performanceOptimizer.canUpdateTexture()) {
      const now = performance.now();
      const lastUpdate = (window as any).lastTextureUpdate || 0;
      const updateInterval = 100; // 100ms between texture updates
      
      if (now - lastUpdate > updateInterval) {
        // Update model texture directly from the active layer
        // This preserves the original model texture while adding tool effects
        updateModelTexture(false, false); // Don't force update, don't update displacement
        
        // Track last update time
        (window as any).lastTextureUpdate = now;
      }
    }
  }, [activeTool, brushColor, brushSize, brushOpacity, brushHardness, brushFlow, brushShape, brushSpacing, blendMode, getActiveLayer, updateModelTexture]);
  
  // Smart control management - only disable rotation/pan for tools that need it, but keep zoom enabled
  const shouldDisableControls = useCallback((tool: string) => {
    // Only disable controls for tools that need continuous drawing and would conflict with camera movement
    const continuousDrawingTools = ['brush', 'eraser', 'puffPrint', 'embroidery', 'fill'];
    return continuousDrawingTools.includes(tool);
  }, []);
  
  const manageControls = useCallback((tool: string, shouldDisable: boolean) => {
    const currentState = useApp.getState().controlsEnabled;
    console.log(`🎮 manageControls called: tool=${tool}, shouldDisable=${shouldDisable}, shouldDisableControls=${shouldDisableControls(tool)}, currentState=${currentState}`);
    if (shouldDisableControls(tool)) {
      // Only disable rotation and pan, but keep zoom enabled
      setControlsEnabled(!shouldDisable);
      if (process.env.NODE_ENV === 'development') {
        console.log(`🎮 Controls ${!shouldDisable ? 'enabled' : 'disabled'} for tool: ${tool} (was: ${currentState})`);
        console.log(`🎮 Note: Zoom controls remain always enabled`);
      }
    } else {
      console.log(`🎮 Tool ${tool} does not require control management`);
    }
  }, [shouldDisableControls, setControlsEnabled]);

  // Listen for manual control enabling from Canvas clicks
  useEffect(() => {
    const handleUserManuallyEnabledControls = (event: CustomEvent) => {
      const { tool, enabled } = event.detail;
      console.log(`🎮 Received manual control enable signal for tool: ${tool}, enabled: ${enabled}`);
      userManuallyEnabledControlsRef.current = enabled;
    };

    window.addEventListener('userManuallyEnabledControls', handleUserManuallyEnabledControls as EventListener);
    
    return () => {
      window.removeEventListener('userManuallyEnabledControls', handleUserManuallyEnabledControls as EventListener);
    };
  }, []);

  // PERFORMANCE: Optimized controls management with minimal logging
  useEffect(() => {
    // PERFORMANCE: Early exit if user manually enabled controls
    if (userManuallyEnabledControlsRef.current && shouldDisableControls(activeTool)) {
      return;
    }
    
    const shouldDisable = shouldDisableControls(activeTool);
    setControlsEnabled(!shouldDisable);
    
    if (!shouldDisable) {
      userManuallyEnabledControlsRef.current = false; // Reset manual flag
    }
  }, [activeTool, setControlsEnabled, shouldDisableControls]);

  // Texture Layer Management System
  const textureLayerManager = useCallback(() => {
    console.log('🎨 ===== TEXTURE LAYER MANAGER INITIALIZATION =====');
    
    // Define the proper layer order and tool assignments
    const textureLayers = {
      base: {
        name: 'Base/Diffuse Layer',
        purpose: 'Original model texture',
        toolTarget: 'none',
        priority: 0
      },
      brush: {
        name: 'Brush/Paint Layer',
        purpose: 'Brush strokes and paint',
        toolTarget: 'brush',
        priority: 1,
        maps: ['map', 'roughnessMap', 'metalnessMap', 'aoMap', 'alphaMap']
      },
      puffPrint: {
        name: 'Puff Print Layer',
        purpose: 'Raised print effects',
        toolTarget: 'puffPrint',
        priority: 2,
        maps: ['normalMap', 'bumpMap', 'displacementMap']
      },
      embroidery: {
        name: 'Embroidery Layer',
        purpose: 'Stitched patterns',
        toolTarget: 'embroidery',
        priority: 3,
        maps: ['normalMap', 'bumpMap', 'displacementMap', 'map']
      },
      effects: {
        name: 'Effects Layer',
        purpose: 'Post-processing effects',
        toolTarget: 'none',
        priority: 4,
        maps: ['emissiveMap', 'specularMap', 'envMap']
      }
    };
    
    console.log('🎨 Texture Layer Configuration:', textureLayers);
    console.log('🎨 ===== END TEXTURE LAYER MANAGER =====');
    
    return textureLayers;
  }, []);
  
  // Initialize texture layer manager
  useEffect(() => {
    textureLayerManager();
  }, [textureLayerManager]);

  // Initialize layer persistence and layer system
  useEffect(() => {
    const initializeLayerSystem = async () => {
      console.log('🎨 ShirtRefactored: Initializing layer system...');
      
      // First, ensure layers are loaded from storage
      await layerPersistenceManager.initialize();
      
      // Then initialize the appropriate layer system
      if (LAYER_SYSTEM_CONFIG.USE_ADVANCED_LAYERS) {
        try {
          layerBridge.initialize();
          console.log('🎨 Advanced layer system initialized');
        } catch (error) {
          console.warn('🎨 Layer bridge initialization failed, using fallback:', error);
        }
      } else {
        console.log('🎨 Using original layer system');
        
        // Check if layers were loaded
        const persistence = await layerPersistenceManager.checkPersistence();
        console.log('🎨 Layer persistence status:', persistence);
      }
    };
    
    initializeLayerSystem();
  }, []);

  // PROACTIVE CONTROL MANAGEMENT: Disable controls when a drawing tool is selected
  useEffect(() => {
    const continuousDrawingTools = ['brush', 'eraser', 'puffPrint', 'embroidery', 'fill'];
    
    console.log(`🎮 Tool changed to: ${activeTool}, shouldDisable: ${continuousDrawingTools.includes(activeTool)}, userManuallyEnabled: ${userManuallyEnabledControlsRef.current}`);
    
    // Respect user's manual control enabling
    if (userManuallyEnabledControlsRef.current && continuousDrawingTools.includes(activeTool)) {
      console.log(`🎮 User manually enabled controls - not overriding for tool: ${activeTool}`);
      return;
    }
    
    // Proactively disable controls for drawing tools
    if (continuousDrawingTools.includes(activeTool)) {
      console.log(`🎮 PROACTIVELY disabling controls for drawing tool: ${activeTool}`);
      setControlsEnabled(false);
      useApp.setState({ controlsEnabled: false }); // Force immediate update
    } else {
      console.log(`🎮 PROACTIVELY enabling controls for non-drawing tool: ${activeTool}`);
      setControlsEnabled(true);
      useApp.setState({ controlsEnabled: true }); // Force immediate update
      userManuallyEnabledControlsRef.current = false;
    }
  }, [activeTool, setControlsEnabled]);

  // Add event listeners for undo/redo restoration
  useEffect(() => {
    const handleDisplacementMapUpdate = (event: CustomEvent) => {
      console.log('🔄 Received displacement map update event:', event.detail);
      const puffCanvas = useApp.getState().puffCanvas;
      if (puffCanvas) {
        // Only update displacement maps, not the main texture
        updateModelTexture(false, true);
      }
    };

    const handleEmbroideryUpdate = (event: CustomEvent) => {
      console.log('🔄 Received embroidery update event:', event.detail);
      // Force embroidery path re-rendering if needed
      // This will be handled by the existing embroidery system
    };

    const handleTextureUpdate = (event: CustomEvent) => {
      console.log('🔄 Received forced texture update event:', event.detail);
      
      // Check if this is a layer operation that affects both texture and displacement
      const source = event.detail?.source;
      const layerOperations = ['layer-reorder', 'layer-visibility', 'layer-opacity', 'layer-blendmode'];
      const needsDisplacementUpdate = layerOperations.includes(source);
      
      if (needsDisplacementUpdate) {
        // For layer operations, update both texture AND displacement maps
        console.log('🔄 Layer operation detected - updating both texture and displacement maps:', source);
        updateModelTexture(true, true); // Force update both texture and displacement
      } else {
        // For other events, only update main texture
        console.log('🔄 Calling updateModelTexture(true, true) for general texture and displacement update');
        updateModelTexture(true, true);
      }
      console.log('🔄 updateModelTexture completed');
    };

    window.addEventListener('updateDisplacementMaps', handleDisplacementMapUpdate as EventListener);
    window.addEventListener('updateEmbroideryPaths', handleEmbroideryUpdate as EventListener);
    window.addEventListener('forceTextureUpdate', handleTextureUpdate as EventListener);

    return () => {
      window.removeEventListener('updateDisplacementMaps', handleDisplacementMapUpdate as EventListener);
      window.removeEventListener('updateEmbroideryPaths', handleEmbroideryUpdate as EventListener);
      window.removeEventListener('forceTextureUpdate', handleTextureUpdate as EventListener);
    };
  }, [createPuffDisplacementMap, createPuffNormalMap, updateModelWithPuffMaps, updateModelTexture]);

  // Brush tool event handlers with smart behavior
  const onPointerDown = useCallback((e: any) => {
    console.log('🎨 🎨 🎨 onPointerDown FIRED - activeTool:', activeTool, 'timestamp:', Date.now());
    console.log('🎨 ShirtRefactored: onPointerDown called with activeTool:', activeTool);
    console.log('🎨 Event details:', { 
      intersections: e.intersections?.length || 0, 
      uv: e.uv ? { x: e.uv.x, y: e.uv.y } : 'none',
      clientX: e.clientX,
      clientY: e.clientY
    });
    
    // For continuous drawing tools, we need to detect if click is on model or outside
    if (['brush', 'eraser', 'puffPrint', 'embroidery', 'fill'].includes(activeTool)) {
      console.log('🎨 Continuous drawing tool detected:', activeTool);
      
      // Controls should already be disabled by useEffect when tool was selected
      console.log('🎨 Controls should already be disabled for continuous drawing tool:', activeTool);
      
      // Check if the click is on the model (has intersection)
      const isOnModel = e.intersections && e.intersections.length > 0;
      console.log('🎨 Click on model:', isOnModel, 'intersections:', e.intersections?.length || 0);
      console.log('🎨 Intersections array:', e.intersections);
      
      if (isOnModel) {
        // Click is on model - start drawing
        console.log('🎨 Click on model - starting drawing');
        
        // Save state before drawing starts (for undo)
        const { saveState } = useApp.getState();
        const actionName = activeTool === 'brush' ? 'Brush Stroke' :
                          activeTool === 'eraser' ? 'Erase' :
                          activeTool === 'puffPrint' ? 'Puff Print' :
                          activeTool === 'embroidery' ? 'Embroidery Stitch' :
                          activeTool === 'fill' ? 'Fill' :
                          'Drawing Operation';
        saveState(`Before ${actionName}`);
        console.log('💾 State saved before drawing:', actionName);
        
        // CRITICAL: Stop event propagation and prevent default to completely block OrbitControls
        if (e.stopPropagation) {
          e.stopPropagation();
          console.log('🎨 Stopped event propagation to prevent rotation');
        }
        // Note: preventDefault may not work on passive listeners, that's OK
        if (e.preventDefault) {
          try {
            e.preventDefault();
            console.log('🎨 Prevented default behavior');
          } catch (err) {
            // Ignore preventDefault errors on passive listeners
            console.log('🎨 preventDefault failed (passive listener)');
          }
        }
        if (e.nativeEvent) {
          e.nativeEvent.stopPropagation();
          console.log('🎨 Stopped native event propagation');
        }
        
        // Disable controls immediately and forcefully when starting to draw on model
        console.log('🎨 Disabling controls for drawing on model with tool:', activeTool);
        console.log('🎨 Current controlsEnabled state before disabling:', useApp.getState().controlsEnabled);
        setControlsEnabled(false);
        useApp.setState({ controlsEnabled: false }); // Force immediate state update
        userManuallyEnabledControlsRef.current = false; // Reset manual flag since we're now drawing
        console.log('🎨 Controls forcefully disabled, new state:', useApp.getState().controlsEnabled);
        
        // Only set paintingActiveRef for continuous drawing tools, not for vector tool
        if (activeTool !== 'vector') {
        paintingActiveRef.current = true;
          console.log('🎨 Set paintingActiveRef to true for tool:', activeTool);
        }
        
        // Call the actual painting function from useApp store
        const vectorMode = useApp.getState().vectorMode;
        
        // In vector mode, brush/puff/embroidery create vector paths instead of painting
        if (vectorMode && ['brush', 'puffPrint', 'embroidery'].includes(activeTool)) {
          console.log('🎨 Vector mode active - treating', activeTool, 'as vector path creator');
          // Treat as vector tool - paintAtEvent will handle vector path creation
          paintAtEvent(e);
        } else if (['brush', 'eraser', 'puffPrint', 'embroidery', 'fill'].includes(activeTool)) {
          console.log('🎨 Calling paintAtEvent for tool:', activeTool);
          paintAtEvent(e);
        } else if (activeTool === 'vector') {
          // For vector tool, only handle anchor selection on initial click
          // Don't call paintAtEvent if we're already dragging an anchor
          if (!isDraggingAnchorRef.current) {
            console.log('🎨 Vector: Handling anchor selection on click');
            paintAtEvent(e);
          } else {
            console.log('🎨 Vector: Skipping onPointerDown - already dragging anchor');
          }
        }
      } else {
        // Click is outside model - enable controls for camera movement
        console.log('🎨 Click outside model - enabling controls for camera movement with tool:', activeTool);
        console.log('🎨 Current controlsEnabled state before enabling:', useApp.getState().controlsEnabled);
        setControlsEnabled(true);
        userManuallyEnabledControlsRef.current = true; // Mark as manually enabled
        console.log('🎨 Controls enabled, new state:', useApp.getState().controlsEnabled);
        paintingActiveRef.current = false;
      }
    } else if (['vector', 'text', 'shapes', 'move'].includes(activeTool) || (activeTool as string) === 'image') {
      // For vector, text, shapes, move, and image tools, allow camera movement but handle clicks on model
      console.log('🎨 Vector/Text/Shapes/Move/Image tool detected:', activeTool);
      
      // Check if the click is on the model (has intersection)
      const isOnModel = e.intersections && e.intersections.length > 0;
      console.log('🎨 Click on model:', isOnModel, 'intersections:', e.intersections?.length || 0);
      
      if (isOnModel) {
        // Click is on model - handle tool-specific logic
        console.log('🎨 Click on model - handling', activeTool, 'tool');
        
        if (activeTool === 'vector') {
          // For vector tool, only handle anchor selection on initial click
          if (!isDraggingAnchorRef.current) {
            console.log('🎨 Vector: Handling anchor selection on click');
            paintAtEvent(e);
          } else {
            console.log('🎨 Vector: Skipping onPointerDown - already dragging anchor');
          }
        } else if (activeTool === 'text') {
          // CRITICAL: Prevent double prompts with timestamp check
          const now = Date.now();
          if (now - lastTextPromptTimeRef.current < 500) {
            console.log('🎨 Text tool: Skipping - prompt triggered too soon (within 500ms)');
            return;
          }
          
          // CRITICAL: Stop all event propagation to prevent double triggers
          if (e.stopPropagation) e.stopPropagation();
          if (e.stopImmediatePropagation) e.stopImmediatePropagation();
          if (e.nativeEvent?.stopPropagation) e.nativeEvent.stopPropagation();
          if (e.nativeEvent?.stopImmediatePropagation) e.nativeEvent.stopImmediatePropagation();
          
          // Prevent double prompts with flag
          if (textPromptActiveRef.current) {
            console.log('🎨 Text tool: Skipping - prompt already active');
            return;
          }
          
          // Handle text tool - prompt for text input and add text element
          console.log('🎨 Text tool: Handling text placement');
          textPromptActiveRef.current = true;
          lastTextPromptTimeRef.current = now;
          
          const defaultText = useApp.getState().lastText || '';
          const userText = window.prompt('Enter text:', defaultText);
          
          // Reset flag after prompt with a small delay to prevent rapid re-triggers
          setTimeout(() => {
            textPromptActiveRef.current = false;
          }, 100);
          
          if (userText) {
            // Save the text for next time
            useApp.setState({ lastText: userText });
            
            // Get UV coordinates from the event (same as other tools)
            const uv = e.uv as THREE.Vector2 | undefined;
            if (uv) {
              try {
                console.log('🎨 Adding text element:', userText);
                console.log('🎨 UV coordinates:', uv.x, uv.y);
                console.log('🎨 Active layer ID:', useApp.getState().activeLayerId);
                
                // Temporarily disable controls during text placement
                setControlsEnabled(false);
                
                // Add text element using the existing addTextElement function
                const appState = useApp.getState();
                if (appState.addTextElement) {
                  appState.addTextElement(userText, { u: uv.x, v: 1 - uv.y });
                  
                  console.log('🎨 Text element added successfully');
                  
                  // CRITICAL FIX: Don't call composeLayers - it clears the original model texture!
                  // Instead, update texture directly from layer canvases
                  setTimeout(() => {
                    if ((window as any).updateModelTexture) {
                      (window as any).updateModelTexture();
                    }
                  }, 100);
                } else {
                  console.error('🎨 addTextElement function not available');
                }
              } catch (error) {
                console.error('🎨 Error adding text element:', error);
              }
            } else {
              console.log('🎨 No UV coordinates available for text placement');
            }
            
            // IMPORTANT: Re-enable controls after text placement
            console.log('🎨 Text tool: Re-enabling controls after text placement');
            setControlsEnabled(true);
          }
        } else if ((activeTool as string) === 'image') {
          // Image tool - select or place images
          const uv = e.uv as THREE.Vector2 | undefined;
          if (uv) {
            const clickU = uv.x;
            const clickV = 1 - uv.y; // Flip V for texture space
            
            console.log('🎨 Image tool: Click at UV:', { u: clickU, v: clickV });
            
            // Check if click is on any image
            const { importedImages, setSelectedImageId } = useApp.getState();
            let clickedImage: any = null;
            
            for (const img of importedImages) {
              if (!img.visible) continue;
              
              // Check if click is within image bounds
              const halfWidth = (img.uWidth || 0.25) / 2;
              const halfHeight = (img.uHeight || 0.25) / 2;
              const imgU = img.u || 0.5;
              const imgV = img.v || 0.5;
              
              if (
                clickU >= imgU - halfWidth &&
                clickU <= imgU + halfWidth &&
                clickV >= imgV - halfHeight &&
                clickV <= imgV + halfHeight
              ) {
                clickedImage = img;
                break;
              }
            }
            
            if (clickedImage) {
              console.log('🎨 Image tool: Clicked on image:', clickedImage.name);
              setSelectedImageId(clickedImage.id);
              
              if (!clickedImage.locked) {
                // Check if click is on a resize anchor
                // INCREASED HITBOX: 0.04 (4% of texture) for easier clicking
                const anchorSize = 0.04; // Doubled from 0.02 for easier interaction
                const halfWidth = (clickedImage.uWidth || 0.25) / 2;
                const halfHeight = (clickedImage.uHeight || 0.25) / 2;
                const imgU = clickedImage.u || 0.5;
                const imgV = clickedImage.v || 0.5;
                
                // Calculate anchor positions for corners and edges
                const anchors = {
                  // Corner anchors
                  topLeft: { u: imgU - halfWidth - anchorSize/2, v: imgV - halfHeight - anchorSize/2 },
                  topRight: { u: imgU + halfWidth - anchorSize/2, v: imgV - halfHeight - anchorSize/2 },
                  bottomLeft: { u: imgU - halfWidth - anchorSize/2, v: imgV + halfHeight - anchorSize/2 },
                  bottomRight: { u: imgU + halfWidth - anchorSize/2, v: imgV + halfHeight - anchorSize/2 },
                  // Edge anchors
                  top: { u: imgU - anchorSize/2, v: imgV - halfHeight - anchorSize/2 },
                  bottom: { u: imgU - anchorSize/2, v: imgV + halfHeight - anchorSize/2 },
                  left: { u: imgU - halfWidth - anchorSize/2, v: imgV - anchorSize/2 },
                  right: { u: imgU + halfWidth - anchorSize/2, v: imgV - anchorSize/2 }
                };
                
                // Check which anchor was clicked (corners first, then edges)
                let clickedAnchor: string | null = null;
                for (const [anchorName, anchorPos] of Object.entries(anchors)) {
                  if (
                    clickU >= anchorPos.u &&
                    clickU <= anchorPos.u + anchorSize &&
                    clickV >= anchorPos.v &&
                    clickV <= anchorPos.v + anchorSize
                  ) {
                    clickedAnchor = anchorName;
                    break;
                  }
                }
                
                if (clickedAnchor) {
                  console.log('🎨 Image tool: Clicked on resize anchor:', clickedAnchor);
                  // Start resizing the image
                  (window as any).__imageResizing = true;
                  (window as any).__imageResizeStart = { 
                    u: clickU, 
                    v: clickV, 
                    imgU: clickedImage.u, 
                    imgV: clickedImage.v,
                    imgWidth: clickedImage.uWidth || 0.25,
                    imgHeight: clickedImage.uHeight || 0.25,
                    imageId: clickedImage.id,
                    anchor: clickedAnchor
                  };
                } else {
                  // Start dragging the image
                  console.log('🎨 Image tool: Started dragging image');
                  (window as any).__imageDragging = true;
                  (window as any).__imageDragStart = { 
                    u: clickU, 
                    v: clickV, 
                    imgU: clickedImage.u, 
                    imgV: clickedImage.v,
                    imageId: clickedImage.id
                  };
                }
                
                // Disable controls during drag/resize
                setControlsEnabled(false);
              } else {
                console.log('🎨 Image tool: Image is locked, cannot drag');
              }
            } else {
              console.log('🎨 Image tool: No image clicked, deselecting');
              setSelectedImageId(null);
            }
          }
        } else if (activeTool === 'shapes') {
          // CRITICAL: Prevent double shape creation with timestamp check
          const now = Date.now();
          if (now - lastTextPromptTimeRef.current < 500) {
            console.log('🎨 Shapes tool: Skipping - shape creation triggered too soon (within 500ms)');
            return;
          }
          
          // CRITICAL: Stop all event propagation to prevent double triggers
          if (e.stopPropagation) e.stopPropagation();
          if (e.stopImmediatePropagation) e.stopImmediatePropagation();
          if (e.nativeEvent?.stopPropagation) e.nativeEvent.stopPropagation();
          if (e.nativeEvent?.stopImmediatePropagation) e.nativeEvent.stopImmediatePropagation();
          
          // Prevent double shape creation with flag
          if (textPromptActiveRef.current) {
            console.log('🎨 Shapes tool: Skipping - shape creation already active');
            return;
          }
          
          // Handle shapes tool - draw shape at click position
          console.log('🎨 Shapes tool: Handling shape placement');
          textPromptActiveRef.current = true;
          lastTextPromptTimeRef.current = now;
          
          // Get UV coordinates from the event
          const uv = e.uv as THREE.Vector2 | undefined;
          if (uv) {
            try {
              console.log('🎨 Adding shape element at UV:', uv.x, uv.y);
              
              // Get shape settings from store
              const appState = useApp.getState();
              const shapeSettings = {
                type: appState.shapeType || 'rectangle',
                size: appState.shapeSize || 50,
                opacity: appState.shapeOpacity || 1,
                color: appState.shapeColor || '#ff69b4',
                rotation: appState.shapeRotation || 0,
                positionX: uv.x * 100, // Convert UV to percentage
                positionY: uv.y * 100, // Convert UV to percentage
                gradient: null // Will be set based on color mode
              };
              
              // Check if gradient mode is active for shapes
              const gradientSettings = (window as any).getGradientSettings ? (window as any).getGradientSettings() : null;
              const isShapesGradientMode = gradientSettings && gradientSettings.shapes && gradientSettings.shapes.mode === 'gradient';
              
              if (isShapesGradientMode && gradientSettings) {
                shapeSettings.gradient = gradientSettings.shapes;
              }
              
              // Add shape element using the existing addShapeElement function
              if (appState.addShapeElement) {
                appState.addShapeElement(shapeSettings);
                console.log('🎨 Shape element added successfully');
                
                // Trigger texture update
                setTimeout(() => {
                  if ((window as any).updateModelTexture) {
                    (window as any).updateModelTexture(true, true);
                  }
                }, 10);
              } else {
                console.error('🎨 addShapeElement function not found');
              }
            } catch (error) {
              console.error('🎨 Error adding shape element:', error);
            }
          } else {
            console.log('🎨 Shapes tool: No UV coordinates available');
          }
          
          // Reset flag after shape creation with a small delay to prevent rapid re-triggers
          setTimeout(() => {
            textPromptActiveRef.current = false;
          }, 100);
        } else if (activeTool === 'move') {
          // Handle move tool - move selected shape to click position
          console.log('🎨 Move tool: Handling shape movement');
          
          const appState = useApp.getState();
          const activeShapeId = appState.activeShapeId;
          
          if (!activeShapeId) {
            console.log('🎨 Move tool: No active shape selected');
            return;
          }
          
          // Get UV coordinates from the event
          const uv = e.uv as THREE.Vector2 | undefined;
          if (uv) {
            try {
              console.log('🎨 Moving shape to UV:', uv.x, uv.y);
              
              // Update shape position
              if (appState.updateShapeElement) {
                appState.updateShapeElement(activeShapeId, {
                  positionX: uv.x * 100, // Convert UV to percentage
                  positionY: uv.y * 100   // Convert UV to percentage
                });
                
                console.log('🎨 Shape moved successfully');
                
                // Trigger texture update
                setTimeout(() => {
                  if ((window as any).updateModelTexture) {
                    (window as any).updateModelTexture(true, true);
                  }
                }, 10);
              } else {
                console.error('🎨 updateShapeElement function not found');
              }
            } catch (error) {
              console.error('🎨 Error moving shape:', error);
            }
          } else {
            console.log('🎨 Move tool: No UV coordinates available');
          }
        }
      } else {
        // Click is outside model - allow camera movement for vector/text/shapes/move tools
        console.log('🎨 Click outside model - allowing camera movement for', activeTool, 'tool');
      }
    }
  }, [activeTool, setControlsEnabled]);

  // PERFORMANCE: Throttled pointer move handler
  const onPointerMove = useCallback((() => {
    let lastMoveTime = 0;
    
    return (e: any) => {
      const now = Date.now();
      // Get current config dynamically for reactive performance settings
      const moveThrottle = performanceOptimizer.getConfig().deviceTier === 'low' ? 50 : 16; // 20fps or 60fps
      if (now - lastMoveTime < moveThrottle) return; // Throttle moves
      lastMoveTime = now;
      
      // Update cursor for image tool when hovering over anchors
      if ((activeTool as string) === 'image' && !(window as any).__imageDragging && !(window as any).__imageResizing) {
        const uv = e.uv as THREE.Vector2 | undefined;
        if (uv) {
          const hoverU = uv.x;
          const hoverV = 1 - uv.y; // Flip V for texture space
          
          const { importedImages, selectedImageId } = useApp.getState();
          const selectedImage = importedImages.find((img: any) => img.id === selectedImageId);
          
          if (selectedImage && selectedImage.visible) {
            const anchorSize = 0.04; // INCREASED HITBOX: Same as in onPointerDown
            const halfWidth = (selectedImage.uWidth || 0.25) / 2;
            const halfHeight = (selectedImage.uHeight || 0.25) / 2;
            const imgU = selectedImage.u || 0.5;
            const imgV = selectedImage.v || 0.5;
            
            // Calculate anchor positions for corners and edges
            const anchors = {
              // Corner anchors
              topLeft: { u: imgU - halfWidth - anchorSize/2, v: imgV - halfHeight - anchorSize/2, cursor: 'nw-resize' },
              topRight: { u: imgU + halfWidth - anchorSize/2, v: imgV - halfHeight - anchorSize/2, cursor: 'ne-resize' },
              bottomLeft: { u: imgU - halfWidth - anchorSize/2, v: imgV + halfHeight - anchorSize/2, cursor: 'sw-resize' },
              bottomRight: { u: imgU + halfWidth - anchorSize/2, v: imgV + halfHeight - anchorSize/2, cursor: 'se-resize' },
              // Edge anchors
              top: { u: imgU - anchorSize/2, v: imgV - halfHeight - anchorSize/2, cursor: 'n-resize' },
              bottom: { u: imgU - anchorSize/2, v: imgV + halfHeight - anchorSize/2, cursor: 's-resize' },
              left: { u: imgU - halfWidth - anchorSize/2, v: imgV - anchorSize/2, cursor: 'w-resize' },
              right: { u: imgU + halfWidth - anchorSize/2, v: imgV - anchorSize/2, cursor: 'e-resize' }
            };
            
            // Check if hovering over any anchor
            let overAnchor = false;
            for (const [anchorName, anchorData] of Object.entries(anchors)) {
              if (
                hoverU >= anchorData.u &&
                hoverU <= anchorData.u + anchorSize &&
                hoverV >= anchorData.v &&
                hoverV <= anchorData.v + anchorSize
              ) {
                document.body.style.cursor = anchorData.cursor;
                overAnchor = true;
                break;
              }
            }
            
            // If not over anchor but over image, show move cursor
            if (!overAnchor) {
              const isOverImage = 
                hoverU >= imgU - halfWidth &&
                hoverU <= imgU + halfWidth &&
                hoverV >= imgV - halfHeight &&
                hoverV <= imgV + halfHeight;
              
              if (isOverImage) {
                document.body.style.cursor = 'move';
              } else {
                document.body.style.cursor = 'default';
              }
            }
          } else {
            document.body.style.cursor = 'default';
          }
        }
      }
      
      // Handle image resizing (separate from dragging)
      if ((activeTool as string) === 'image' && (window as any).__imageResizing && (window as any).__imageResizeStart) {
        const uv = e.uv as THREE.Vector2 | undefined;
        if (uv) {
          const currentU = uv.x;
          const currentV = 1 - uv.y; // Flip V for texture space
          
          const resizeStart = (window as any).__imageResizeStart;
          const deltaU = currentU - resizeStart.u;
          const deltaV = currentV - resizeStart.v;
          
          // Calculate new size and position based on anchor (Photoshop-style scaling from anchor)
          let newWidth = resizeStart.imgWidth;
          let newHeight = resizeStart.imgHeight;
          let newU = resizeStart.imgU;
          let newV = resizeStart.imgV;
          
          // Calculate half widths/heights for the original image
          const halfWidth = resizeStart.imgWidth / 2;
          const halfHeight = resizeStart.imgHeight / 2;
          
          switch (resizeStart.anchor) {
            // Corner anchors - resize both width and height
            case 'topLeft':
              // Scale from bottom-right corner (opposite anchor stays fixed)
              newWidth = resizeStart.imgWidth - deltaU * 2;
              newHeight = resizeStart.imgHeight - deltaV * 2;
              // Keep bottom-right corner fixed, so center moves
              newU = resizeStart.imgU + deltaU;
              newV = resizeStart.imgV + deltaV;
              break;
            case 'topRight':
              // Scale from bottom-left corner
              newWidth = resizeStart.imgWidth + deltaU * 2;
              newHeight = resizeStart.imgHeight - deltaV * 2;
              // Keep bottom-left corner fixed
              newU = resizeStart.imgU + deltaU;
              newV = resizeStart.imgV + deltaV;
              break;
            case 'bottomLeft':
              // Scale from top-right corner
              newWidth = resizeStart.imgWidth - deltaU * 2;
              newHeight = resizeStart.imgHeight + deltaV * 2;
              // Keep top-right corner fixed
              newU = resizeStart.imgU + deltaU;
              newV = resizeStart.imgV + deltaV;
              break;
            case 'bottomRight':
              // Scale from top-left corner
              newWidth = resizeStart.imgWidth + deltaU * 2;
              newHeight = resizeStart.imgHeight + deltaV * 2;
              // Keep top-left corner fixed
              newU = resizeStart.imgU + deltaU;
              newV = resizeStart.imgV + deltaV;
              break;
            
            // Edge anchors - resize only one dimension
            case 'top':
              // Scale height from bottom edge (top edge moves)
              newHeight = resizeStart.imgHeight - deltaV * 2;
              newV = resizeStart.imgV + deltaV;
              break;
            case 'bottom':
              // Scale height from top edge (bottom edge moves)
              newHeight = resizeStart.imgHeight + deltaV * 2;
              newV = resizeStart.imgV + deltaV;
              break;
            case 'left':
              // Scale width from right edge (left edge moves)
              newWidth = resizeStart.imgWidth - deltaU * 2;
              newU = resizeStart.imgU + deltaU;
              break;
            case 'right':
              // Scale width from left edge (right edge moves)
              newWidth = resizeStart.imgWidth + deltaU * 2;
              newU = resizeStart.imgU + deltaU;
              break;
          }
          
          // Clamp size to reasonable limits
          const minSize = 0.05; // 5% of texture size
          const maxSize = 0.8; // 80% of texture size
          newWidth = Math.max(minSize, Math.min(maxSize, newWidth));
          newHeight = Math.max(minSize, Math.min(maxSize, newHeight));
          
          // Update image size and position
          const { updateImportedImage } = useApp.getState();
          if (resizeStart.imageId) {
            updateImportedImage(resizeStart.imageId, {
              uWidth: newWidth,
              uHeight: newHeight,
              u: Math.max(0, Math.min(1, newU)),
              v: Math.max(0, Math.min(1, newV))
            });
          }
        }
        return;
      }
      
      // Handle image dragging (separate from resizing)
      if ((activeTool as string) === 'image' && (window as any).__imageDragging && (window as any).__imageDragStart) {
        const uv = e.uv as THREE.Vector2 | undefined;
        if (uv) {
          const currentU = uv.x;
          const currentV = 1 - uv.y; // Flip V for texture space
          
          const dragStart = (window as any).__imageDragStart;
          const deltaU = currentU - dragStart.u;
          const deltaV = currentV - dragStart.v;
          
          const newU = dragStart.imgU + deltaU;
          const newV = dragStart.imgV + deltaV;
          
          // Update image position
          const { updateImportedImage } = useApp.getState();
          if (dragStart.imageId) {
            updateImportedImage(dragStart.imageId, {
              u: Math.max(0, Math.min(1, newU)),
              v: Math.max(0, Math.min(1, newV))
            });
          }
        }
        return;
      }
      
      // PERFORMANCE: Early exit for non-drawing tools
      if (!['brush', 'eraser', 'puffPrint', 'embroidery', 'fill'].includes(activeTool)) return;
      
      // PERFORMANCE: Only paint if actively drawing
      if (paintingActiveRef.current) {
        paintAtEvent(e);
      }
    };
  })(), [activeTool, paintAtEvent]);

  const onPointerUp = useCallback((e: any) => {
    if (paintingActiveRef.current) {
      console.log('🎨 ShirtRefactored: onPointerUp - ending painting');
      paintingActiveRef.current = false;
    }
    
    // Handle image tool resize end
    if ((activeTool as string) === 'image' && (window as any).__imageResizing) {
      console.log('🎨 Image tool: Ended resizing');
      (window as any).__imageResizing = false;
      delete (window as any).__imageResizeStart;
      setControlsEnabled(true);
    }
    
    // Handle image tool drag end
    if ((activeTool as string) === 'image' && (window as any).__imageDragging) {
      console.log('🎨 Image tool: Ended dragging');
      (window as any).__imageDragging = false;
      delete (window as any).__imageDragStart;
      setControlsEnabled(true);
    }
    
    // Handle vector tool mouse release
    if (activeTool === 'vector') {
      console.log('🎨 Vector: onPointerUp - checking drag state');
    }

    // Clear last embroidery point when mouse released
    if (activeTool === 'embroidery') {
      useApp.setState({ lastEmbroideryPoint: null });
    }

    // Stop dragging anchor when mouse released
    if (activeTool === 'vector' && isDraggingAnchorRef.current) {
      console.log('🎨 Vector: Stopped dragging anchor');
      isDraggingAnchorRef.current = false;
      dragStartPosRef.current = null;
    }
    
    // Keep controls disabled for continuous drawing tools (they're managed by useEffect)
    if (['brush', 'eraser', 'puffPrint', 'embroidery', 'fill'].includes(activeTool)) {
      // PERFORMANCE: Reduced logging
      if (Math.random() < 0.01) {
        console.log('🎨 Mouse released - keeping controls disabled for continuous drawing tool:', activeTool);
      }
      
      // CRITICAL FIX: Don't call composeLayers for eraser - it clears the original model texture!
      // The eraser should only affect the layer canvas, not the composed canvas
      console.log('🧽 Skipping composeLayers for eraser to preserve original model texture');
      
      // Final texture update when painting ends
      updateModelTexture(false, false);
      
      // Update displacement maps for puff print
      if (activeTool === 'puffPrint') {
        console.log('🎨 Puff print - updating displacement maps');
        const { composeDisplacementMaps } = useApp.getState();
        composeDisplacementMaps();
      }
      
      // Complete embroidery path when drawing ends
      if (activeTool === 'embroidery') {
        completeEmbroideryPath();
      }
      
      // Save state for undo/redo after drawing operation completes
      const { saveState } = useApp.getState();
      const actionName = activeTool === 'brush' ? 'Brush Stroke' :
                        activeTool === 'eraser' ? 'Erase' :
                        activeTool === 'puffPrint' ? 'Puff Print' :
                        activeTool === 'embroidery' ? 'Embroidery Stitch' :
                        activeTool === 'fill' ? 'Fill' :
                        'Drawing Operation';
      saveState(actionName);
    }
  }, [activeTool, updateModelTexture]);

  // Complete embroidery path - clear current path
  const completeEmbroideryPath = useCallback(() => {
    console.log('🎨 Embroidery: Completing path - clearing current path');
    useApp.setState({ currentEmbroideryPath: [] });
  }, []);

  const onPointerLeave = useCallback((e: any) => {
    if (paintingActiveRef.current) {
      console.log('🎨 ShirtRefactored: onPointerLeave - ending painting');
      paintingActiveRef.current = false;
    }
    
    // Keep controls disabled for continuous drawing tools (they're managed by useEffect)
    if (['brush', 'eraser', 'puffPrint', 'embroidery', 'fill'].includes(activeTool)) {
      console.log('🎨 Mouse left - keeping controls disabled for continuous drawing tool:', activeTool);
      
      // Complete embroidery path if mouse leaves during embroidery
      if (activeTool === 'embroidery') {
        completeEmbroideryPath();
    }
    }
  }, [activeTool, completeEmbroideryPath]);

  // Get model data from main app state (no need for synchronization)
  const modelUrl = useApp(state => state.modelUrl);
  const modelType = useApp(state => state.modelType);

  // Handle model loading
  const handleModelLoaded = useCallback((data: ModelData) => {
    setModelData(data);
    setIsLoading(false);
    console.log('✅ Model loaded:', data.url);
    
    // Initialize puff print maps when model loads
    initializePuffMaps();
  }, []);

  // Embroidery tool now draws simple lines like brush tool with thread effects

  // Helper function to get 3D world position from UV coordinates
  const getWorldPositionFromUV = useCallback((uv: THREE.Vector2): THREE.Vector3 | null => {
    if (!modelScene) return null;

    // Find the closest vertex on the model surface
    let closestVertex: THREE.Vector3 | null = null;
    let minDistance = Infinity;

    modelScene.traverse((child: any) => {
      if (child.isMesh && child.geometry && child.geometry.attributes.position) {
        const positions = child.geometry.attributes.position;
        const uvs = child.geometry.attributes.uv;

        if (uvs) {
          // Find the UV coordinate that matches our target UV
          for (let i = 0; i < uvs.count; i++) {
            const u = uvs.getX(i);
            const v = uvs.getY(i);

            const distance = Math.sqrt((u - uv.x) ** 2 + (v - uv.y) ** 2);
            if (distance < minDistance) {
              minDistance = distance;
              closestVertex = new THREE.Vector3(
                positions.getX(i),
                positions.getY(i),
                positions.getZ(i)
              );
            }
          }
        }
      }
    });

    return closestVertex;
  }, [modelScene]);

  // PERFORMANCE: Cache for world-to-UV conversion to avoid expensive searches
  const worldToUVCache = useRef(new Map<string, THREE.Vector2>());
  const CACHE_SIZE_LIMIT = 1000; // Limit cache size to prevent memory leaks

  // Helper function to get UV coordinates from 3D world position
  const getUVFromWorldPosition = useCallback((worldPos: THREE.Vector3): THREE.Vector2 | null => {
    if (!modelScene) return null;

    // PERFORMANCE: Check cache first
    const cacheKey = `${worldPos.x.toFixed(3)},${worldPos.y.toFixed(3)},${worldPos.z.toFixed(3)}`;
    if (worldToUVCache.current.has(cacheKey)) {
      return worldToUVCache.current.get(cacheKey)!;
    }

    // PERFORMANCE: Use a more efficient search with early termination
    let closestUV: THREE.Vector2 | null = null;
    let minDistance = Infinity;
    const searchThreshold = 0.1; // Early termination threshold

    modelScene.traverse((child: any) => {
      if (child.isMesh && child.geometry && child.geometry.attributes.position) {
        const positions = child.geometry.attributes.position;
        const uvs = child.geometry.attributes.uv;

        if (uvs) {
          // PERFORMANCE: Sample every 4th vertex to reduce search time
          for (let i = 0; i < positions.count; i += 4) {
            const vertexPos = new THREE.Vector3(
              positions.getX(i),
              positions.getY(i),
              positions.getZ(i)
            );

            const distance = worldPos.distanceTo(vertexPos);
            if (distance < minDistance) {
              minDistance = distance;
              closestUV = new THREE.Vector2(
                uvs.getX(i),
                uvs.getY(i)
              );
              
              // PERFORMANCE: Early termination if we find a very close match
              if (distance < searchThreshold) {
                break;
              }
            }
          }
        }
      }
    });

    // PERFORMANCE: Cache the result
    if (closestUV && worldToUVCache.current.size < CACHE_SIZE_LIMIT) {
      worldToUVCache.current.set(cacheKey, closestUV);
    }

    return closestUV;
  }, [modelScene]);

  // Create realistic thread geometry with memory leak fix
  const createThreadGeometry = useCallback((
    stitchGroup: THREE.Group,
    worldStart: THREE.Vector3,
    worldEnd: THREE.Vector3,
    stitch: any
  ) => {
    // Calculate thread properties
    const threadLength = worldStart.distanceTo(worldEnd);
    const threadRadius = (stitch.thickness || 0.02) / 2;
    const threadSegments = Math.max(8, Math.floor(threadLength * 20)); // More segments for longer threads

    // Create twisted thread geometry using multiple cylinders
    const twistAmount = 2; // Number of twists per unit length
    const twistSegments = Math.max(4, Math.floor(threadLength * twistAmount));

    // Store geometries and materials for cleanup
    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const materialsToDispose: THREE.Material[] = [];

    for (let twist = 0; twist < twistSegments; twist++) {
      const t = twist / twistSegments;
      const segmentStart = worldStart.clone().lerp(worldEnd, t);
      const segmentEnd = worldStart.clone().lerp(worldEnd, (twist + 1) / twistSegments);

      const segmentLength = segmentStart.distanceTo(segmentEnd);

      if (segmentLength < 0.001) continue;

      // Create thread segment geometry
      // Note: We can't use GeometryManager here because each cylinder has unique parameters
      const threadGeometry = new THREE.CylinderGeometry(
        threadRadius * (0.8 + Math.sin(t * Math.PI * 4) * 0.2), // Slight variation in radius
        threadRadius * (0.8 + Math.sin((t + 0.5) * Math.PI * 4) * 0.2),
        segmentLength,
        8,
        2,
        false
      );

      // Position and rotate the thread segment
      const direction = segmentEnd.clone().sub(segmentStart).normalize();
      const midpoint = segmentStart.clone().add(segmentEnd).multiplyScalar(0.5);

      const up = new THREE.Vector3(0, 0, 1);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);

      threadGeometry.applyQuaternion(quaternion);
      threadGeometry.translate(midpoint.x, midpoint.y, midpoint.z);

      // Add twist rotation
      threadGeometry.rotateZ(t * Math.PI * 2);

      // Create realistic thread material with subtle texture
      const threadMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(stitch.color || '#ff69b4'),
        roughness: 0.4 + Math.random() * 0.2, // Slight variation for realism
        metalness: 0.05,
        emissive: new THREE.Color(stitch.color || '#ff69b4').multiplyScalar(0.1),
        transparent: true,
        opacity: 0.95,
        // Add subtle normal map for thread texture
        normalScale: new THREE.Vector2(0.1, 0.1)
      });

      const threadMesh = new THREE.Mesh(threadGeometry, threadMaterial);
      threadMesh.castShadow = true;
      threadMesh.receiveShadow = true;

      // Add slight random offset for more realistic thread appearance
      threadMesh.position.add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.002,
        (Math.random() - 0.5) * 0.002,
        (Math.random() - 0.5) * 0.002
      ));

      // Track for cleanup
      geometriesToDispose.push(threadGeometry);
      materialsToDispose.push(threadMaterial);

      stitchGroup.add(threadMesh);
    }

    // Add cleanup function to the stitch group
    (stitchGroup as any)._disposeThreadResources = () => {
      geometriesToDispose.forEach(geom => geom.dispose());
      materialsToDispose.forEach(mat => mat.dispose());
      console.log('🧠 Disposed', geometriesToDispose.length, 'thread geometries and materials');
    };
  }, []);


  // Initialize puff print maps at model load time for better performance
  const initializePuffMaps = useCallback(() => {
    console.log('🎨 Initializing puff print maps at model load...');
    
    // Create puff canvas if it doesn't exist
    let puffCanvas = useApp.getState().puffCanvas;
    if (!puffCanvas) {
      puffCanvas = document.createElement('canvas');
      puffCanvas.width = 2048;
      puffCanvas.height = 2048;
      useApp.setState({ puffCanvas });
      console.log('🎨 Created puff canvas:', puffCanvas.width, 'x', puffCanvas.height);
    }
    
    // Pre-create displacement and normal map canvases
    const displacementCanvas = document.createElement('canvas');
    displacementCanvas.width = 2048;
    displacementCanvas.height = 2048;
    const dispCtx = displacementCanvas.getContext('2d');
    if (dispCtx) {
      // CRITICAL FIX: Fill with black (0) for no displacement on initial load
      dispCtx.clearRect(0, 0, 2048, 2048);
      dispCtx.fillStyle = 'rgb(0, 0, 0)';
      dispCtx.fillRect(0, 0, 2048, 2048);
      console.log('🎨 Pre-created black displacement map canvas (no displacement)');
    }
    
    const normalCanvas = document.createElement('canvas');
    normalCanvas.width = 2048;
    normalCanvas.height = 2048;
    const normalCtx = normalCanvas.getContext('2d');
    if (normalCtx) {
      // Fill with default normal (pointing up)
      normalCtx.fillStyle = 'rgb(128, 128, 255)';
      normalCtx.fillRect(0, 0, 2048, 2048);
      console.log('🎨 Pre-created normal map canvas');
    }
    
    // Store canvases in global state for reuse
    useApp.setState({ 
      displacementCanvas, 
      normalCanvas 
    });
    
    // CRITICAL: Clear all displacement maps from model materials on initialization
    if (modelScene) {
      console.log('🎨 Clearing all displacement maps from model materials on initialization');
      modelScene.traverse((child: any) => {
        if (child.isMesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat: any) => {
              if (mat.isMeshStandardMaterial) {
                mat.displacementMap = null;
                mat.displacementScale = 0;
                mat.displacementBias = 0;
                mat.normalMap = null;
                mat.normalScale = new THREE.Vector2(1, 1);
                mat.needsUpdate = true;
              }
            });
          } else if (child.material.isMeshStandardMaterial) {
            child.material.displacementMap = null;
            child.material.displacementScale = 0;
            child.material.displacementBias = 0;
            child.material.normalMap = null;
            child.material.normalScale = new THREE.Vector2(1, 1);
            child.material.needsUpdate = true;
          }
        }
      });
      console.log('🎨 All displacement maps cleared from model materials');
    }
    
    console.log('🎨 Puff print maps initialized successfully');
  }, [modelScene]);

  // Embroidery tool draws directly on canvas - no 3D geometry needed

  // Handle UV mapping callbacks
  console.log('🎯 ShirtRefactored: About to define handleUVPointFound function...');
  const handleUVPointFound = useCallback((uvPoint: any) => {
    console.log('🎯 UV Point found:', uvPoint);
  }, []);
  console.log('🎯 ShirtRefactored: handleUVPointFound function defined successfully');


  // Handle model loading errors
  console.log('🎯 ShirtRefactored: About to define handleModelError function...');
  const handleModelError = useCallback((errorMsg: string) => {
    setError(errorMsg);
    setIsLoading(false);
    console.error('❌ Model loading error:', errorMsg);
  }, []);
  console.log('🎯 ShirtRefactored: handleModelError function defined successfully');

  console.log('🎯 ShirtRefactored: About to return JSX');
  
  return (
    <>
      {/* Enhanced Lighting - Optimized for vibrant fabric materials */}
      {/* <Environment 
        preset="studio" 
        background={false}
        environmentIntensity={1.2}
      /> */}
      
      {/* DEBUG: Check if we reach here */}
      {console.log('🎯 ShirtRefactored: Environment component rendered')}
      
      {/* Additional directional light for highlights and vibrancy */}
      {/* <directionalLight 
        position={[5, 5, 5]} 
        intensity={0.6} 
        color="#ffffff"
        castShadow={false}
      /> */}
      
      {/* Fill light for even illumination */}
      {/* <directionalLight 
        position={[-3, 2, -3]} 
        intensity={0.3} 
        color="#ffffff"
        castShadow={false}
      /> */}

      {/* 3D Model Renderer */}
      {(() => {
        console.log('🎯 ShirtRefactored: About to render ShirtRenderer component');
        console.log('🎯 ShirtRefactored: Props being passed:', {
          onModelLoaded: !!handleModelLoaded,
          onModelError: !!handleModelError,
          wireframe: false,
          showNormals: showDebugInfo
        });
        return (
          <ShirtRenderer
            onModelLoaded={handleModelLoaded}
            onModelError={handleModelError}
            wireframe={false}
            showNormals={showDebugInfo}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerLeave}
          />
        );
      })()}

      {/* UV Coordinate Mapper - TEMPORARILY DISABLED TO DEBUG */}
      {/* <UVMapper
        onUVPointFound={handleUVPointFound}
        onUVError={(error) => console.warn('UV Mapping error:', error)}
      /> */}

      {/* Using existing useApp painting system instead of Brush3DIntegration */}
      {/* Brush painting is now handled through paintAtEvent calls in pointer handlers */}


      {/* Debug Helpers */}
      {showDebugInfo && (
        <axesHelper args={[5]} />
      )}

      {/* Loading indicator inside 3D scene */}
      {isLoading && (
        <Html center>
          <div style={{
            color: '#fff',
            background: 'rgba(0,0,0,0.8)',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #fff',
              borderTop: '3px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 10px'
            }} />
            Loading 3D model...
          </div>
        </Html>
      )}

      {/* Error display inside 3D scene */}
      {error && (
        <Html center>
          <div style={{
            color: '#fff',
            background: 'rgba(255,0,0,0.9)',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            maxWidth: '400px'
          }}>
            <div style={{ fontSize: '2em', marginBottom: '10px' }}>⚠️</div>
            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Model Loading Error</div>
            <div style={{ fontSize: '0.9em', marginBottom: '15px' }}>{error}</div>
            <button
              onClick={() => setError(null)}
              style={{
                background: '#fff',
                color: '#000',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Dismiss
            </button>
          </div>
        </Html>
      )}

    </>
  );
}

export default ShirtRefactored;
