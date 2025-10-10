/**
 * 🎯 Shirt Renderer Component
 *
 * Handles the core rendering logic for the 3D shirt model
 * Extracted from the massive Shirt.js file for better maintainability
 * Updated to use domain-driven state management and memory leak fixes
 */

import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
// Force rebuild - GLTFLoader import verification
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { useApp } from '../../App';
import { geometryManager } from '../../utils/GeometryManager';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { ModelData, Vector3D, Bounds } from '../../types/app';

interface ShirtRendererProps {
  onModelLoaded?: (modelData: ModelData) => void;
  onModelError?: (error: string) => void;
  wireframe?: boolean;
  showNormals?: boolean;
  onPointerDown?: (event: any) => void;
  onPointerMove?: (event: any) => void;
  onPointerUp?: (event: any) => void;
  onPointerLeave?: (event: any) => void;
}

export const ShirtRenderer: React.FC<ShirtRendererProps> = ({
  onModelLoaded,
  onModelError,
  wireframe = false,
  showNormals = false,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerLeave
}) => {
  console.log('🎯 ShirtRenderer component mounted/rendered');
  const { scene } = useThree();
  const modelRef = useRef<THREE.Group>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use main app state instead of separate model store to avoid synchronization issues
  const modelUrl = useApp(s => s.modelUrl);
  const modelScene = useApp(s => s.modelScene);
  const modelScale = useApp(s => s.modelScale);
  const modelPosition = useApp(s => s.modelPosition);
  const modelRotation = useApp(s => s.modelRotation);
  const modelType = useApp(s => s.modelType);

  // Model loading logic with memory leak fixes
  useEffect(() => {
    console.log('🎯 ShirtRenderer useEffect triggered:', { modelUrl, modelType });
    if (!modelUrl) {
      console.log('🎯 No modelUrl provided, skipping model loading');
      return;
    }

    const loadModel = async () => {
      try {
        console.log('🔄 Loading 3D model:', modelUrl);
        setIsLoading(true);
        setError(null);

        let loader: any;
        let scene: THREE.Group;

        // Normalize model type by removing leading dot
        const normalizedModelType = modelType?.startsWith('.') ? modelType.slice(1) : modelType;
        console.log('🎯 Normalized model type:', normalizedModelType, 'from original:', modelType);

        switch (normalizedModelType) {
          case 'gltf':
          case 'glb':
            console.log('🎯 Using GLTFLoader for model type:', normalizedModelType);
            loader = new GLTFLoader();
            const gltfResult = await new Promise((resolve, reject) => {
              loader.load(modelUrl, resolve, undefined, reject);
            }) as any;
            scene = gltfResult.scene.clone();
            break;

          case 'obj':
            loader = new OBJLoader();
            scene = await new Promise((resolve, reject) => {
              loader.load(modelUrl, resolve, undefined, reject);
            });
            break;

          case 'fbx':
            loader = new FBXLoader();
            scene = await new Promise((resolve, reject) => {
              loader.load(modelUrl, resolve, undefined, reject);
            });
            break;

          case 'dae':
          case 'collada':
            loader = new ColladaLoader();
            const colladaResult = await new Promise((resolve, reject) => {
              loader.load(modelUrl, resolve, undefined, reject);
            }) as any;
            scene = colladaResult.scene.clone();
            break;

          case 'ply':
            loader = new PLYLoader();
            scene = await new Promise((resolve, reject) => {
              loader.load(modelUrl, resolve, undefined, reject);
            });
            break;

          default:
            throw new Error(`Unsupported model type: ${modelType}`);
        }

        // Process and optimize the loaded model
        const modelData = processModelData(scene, modelUrl, modelType || 'gltf');
        
        // Apply transformations (scale is handled by React Three Fiber group)
        scene.position.set(...modelPosition);
        scene.rotation.set(...modelRotation);
        // CRITICAL FIX: Don't scale the scene directly - let React Three Fiber handle it
        // scene.scale.setScalar(modelScale); // REMOVED: Causes double scaling

        // Set up the model in the main app state
        useApp.setState({ modelScene: scene });
        console.log('🎯 ModelScene set in main store:', !!scene);
        
        // Generate base layer from the model texture
        setTimeout(() => {
          console.log('🎨 Generating base layer from loaded model...');
          useApp.getState().generateBaseLayer();
        }, 100);
        
        onModelLoaded?.(modelData);
        setIsLoading(false);

        console.log('✅ Model loaded successfully');

      } catch (error) {
        console.error('❌ Load failed for:', modelUrl, 'error:', error);
        // Fallback to a simple cube model using GeometryManager (memory leak fix)
        console.log('🔄 Using fallback pink cube due to error');
        const fallbackScene = geometryManager.getMesh(
          { type: 'box', width: 1, height: 1, depth: 1 },
          'standard',
          0xff3366
        );
        useApp.setState({ modelScene: fallbackScene as any });
        onModelError?.(error instanceof Error ? error.message : 'Unknown error');
        setIsLoading(false);
      }
    };

    loadModel();
  }, [modelUrl, modelType, onModelLoaded, onModelError]);

  // Process loaded model data with memory optimization
  const processModelData = useCallback((scene: THREE.Object3D, url: string, type: string): ModelData => {
    const meshes: THREE.Mesh[] = [];
    const bounds = {
      min: new THREE.Vector3(Infinity, Infinity, Infinity),
      max: new THREE.Vector3(-Infinity, -Infinity, -Infinity)
    };

    // Traverse and collect meshes
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        meshes.push(child);
        
        // Calculate bounds
        const geometry = child.geometry;
        if (geometry.boundingBox === null) {
          geometry.computeBoundingBox();
        }
        
        const box = geometry.boundingBox!;
        bounds.min.min(box.min);
        bounds.max.max(box.max);
      }
    });

    const size = bounds.max.clone().sub(bounds.min);
    const center = bounds.min.clone().add(bounds.max).multiplyScalar(0.5);

    return {
      url,
      scene,
      type: type as 'gltf' | 'obj' | 'fbx' | 'dae' | 'ply',
      meshes,
      geometry: {
        vertices: [],
        normals: [],
        uvs: [],
        indices: [],
        bounds: {
          min: { x: bounds.min.x, y: bounds.min.y, z: bounds.min.z },
          max: { x: bounds.max.x, y: bounds.max.y, z: bounds.max.z }
        }
      },
      uvMap: [],
      bounds: {
        min: { x: bounds.min.x, y: bounds.min.y, z: bounds.min.z },
        max: { x: bounds.max.x, y: bounds.max.y, z: bounds.max.z }
      },
      scale: 1,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      loaded: true
    };
  }, []);

  // Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      console.log('🧠 ShirtRenderer: Cleaning up on unmount');
      // Cleanup will be handled by the managers
    };
  }, []);

  // Render the model with proper event handling
  const renderModel = useMemo(() => {
    if (!modelScene) return null;

    return (
      <group
        ref={modelRef}
        position={modelPosition}
        rotation={modelRotation}
        scale={modelScale}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
      >
        <primitive object={modelScene} />
        {wireframe && (
          <primitive 
            object={modelScene.clone()} 
            material={new THREE.MeshBasicMaterial({ 
              wireframe: true, 
              color: 0x00ff00,
              transparent: true,
              opacity: 0.3
            })} 
          />
        )}
        {showNormals && (
          <primitive 
            object={modelScene.clone()} 
            material={new THREE.MeshNormalMaterial()} 
          />
        )}
      </group>
    );
  }, [modelScene, modelPosition, modelRotation, modelScale, wireframe, showNormals, onPointerDown, onPointerMove, onPointerUp, onPointerLeave]);

  return (
    <>
      {renderModel}
      
      {/* Loading indicator */}
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

      {/* Error display */}
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
};

// Removed default export to avoid import conflicts - using named export only
