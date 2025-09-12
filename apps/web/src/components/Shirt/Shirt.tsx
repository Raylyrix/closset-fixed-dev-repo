/**
 * 🎯 Refactored Shirt Component
 * 
 * Main shirt component that orchestrates all functionality
 * Replaces the massive 4,300+ line Shirt.js file
 */

import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useApp } from '../../App';

// Hooks
import { useShirtRendering } from './hooks/useShirtRendering';
import { useShirtEvents } from './hooks/useShirtEvents';
import { useShirtState } from './hooks/useShirtState';

// Components
import { ShirtRenderer } from './ShirtRenderer';
import { ShirtControls } from './ShirtControls';
import { ShirtOverlay } from './ShirtOverlay';
import { ShirtDebugger } from './ShirtDebugger';

interface ShirtProps {
  onModelLoaded?: (model: THREE.Group) => void;
  onModelError?: (error: Error) => void;
}

export const Shirt: React.FC<ShirtProps> = ({
  onModelLoaded,
  onModelError
}) => {
  const { scene, camera, raycaster, mouse } = useThree();
  
  // App state
  const modelUrl = useApp(s => s.modelUrl);
  const modelChoice = useApp(s => s.modelChoice);
  const modelType = useApp(s => s.modelType);
  const modelScale = useApp(s => s.modelScale);
  const modelPosition = useApp(s => s.modelPosition);
  const modelRotation = useApp(s => s.modelRotation);
  const composedCanvas = useApp(s => s.composedCanvas);
  const activeTool = useApp(s => s.activeTool);
  const vectorMode = useApp(s => s.vectorMode);
  
  // Custom hooks
  const {
    renderVectorsToActiveLayer,
    renderAnchorPoints,
    clearCanvas,
    updateTexture,
    throttledRender
  } = useShirtRendering();
  
  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isPainting,
    currentPath,
    selectedAnchor,
    setSelectedAnchor,
    draggingAnchor,
    setDraggingAnchor,
    draggingControl,
    setDraggingControl
  } = useShirtEvents();
  
  const {
    isLoading,
    error,
    selectedDecal,
    activeLayerId,
    showAnchorPoints,
    showGrid,
    showGuides,
    snapToGrid,
    snapToPoints,
    vectorShapes,
    selectedShapes,
    anchorPoints,
    toolSettings,
    performanceMetrics,
    setError,
    clearError,
    setSelectedDecal,
    setActiveLayerId,
    setShowAnchorPoints,
    setShowGrid,
    setShowGuides,
    setSnapToGrid,
    setSnapToPoints,
    updateVectorShapes,
    addVectorShape,
    removeVectorShape,
    updateVectorShape,
    selectShapes,
    clearSelection,
    updateToolSettings,
    updatePerformanceMetrics,
    resetState,
    convertVectorPathsToEmbroideryStitches,
    getSelectedShapes,
    getShapeById,
    isShapeSelected,
    getStateSummary
  } = useShirtState();
  
  // Refs
  const meshRef = useRef<THREE.Mesh>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  
  // Initialize texture
  useEffect(() => {
    if (composedCanvas && !textureRef.current) {
      const texture = new THREE.CanvasTexture(composedCanvas);
      texture.flipY = false;
      textureRef.current = texture;
      
      // Apply texture to mesh
      if (meshRef.current) {
        meshRef.current.material.map = texture;
        meshRef.current.material.needsUpdate = true;
      }
    }
  }, [composedCanvas]);
  
  // Update texture when canvas changes
  useEffect(() => {
    if (textureRef.current && composedCanvas) {
      updateTexture(textureRef.current);
    }
  }, [composedCanvas, updateTexture]);
  
  // Handle vector mode changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🎨 Vector mode changed to:', vectorMode);
    }
    
    if (!vectorMode) {
      // Clear vector state when exiting vector mode
      setSelectedAnchor(null);
      setDraggingAnchor(null);
      setDraggingControl(null);
      clearSelection();
      
      // Convert vector paths to embroidery stitches
      convertVectorPathsToEmbroideryStitches();
      
      // Clear anchor points from canvas
      const layer = useApp.getState().getActiveLayer();
      if (layer) {
        const ctx = layer.canvas.getContext('2d');
        if (ctx) {
          clearCanvas(ctx, layer.canvas.width, layer.canvas.height);
        }
      }
      
      // Re-render after cleanup
      setTimeout(() => {
        renderVectorsToActiveLayer();
      }, 100);
    }
  }, [vectorMode, setSelectedAnchor, setDraggingAnchor, setDraggingControl, clearSelection, convertVectorPathsToEmbroideryStitches, clearCanvas, renderVectorsToActiveLayer]);
  
  // Handle mouse events
  const onPointerDown = (event: any) => {
    try {
      handleMouseDown(event);
    } catch (error) {
      setError(`Mouse down error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  const onPointerMove = (event: any) => {
    try {
      handleMouseMove(event);
    } catch (error) {
      setError(`Mouse move error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  const onPointerUp = (event: any) => {
    try {
      handleMouseUp(event);
    } catch (error) {
      setError(`Mouse up error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Render anchor points
  useEffect(() => {
    if (showAnchorPoints && vectorMode) {
      const layer = useApp.getState().getActiveLayer();
      if (layer) {
        const ctx = layer.canvas.getContext('2d');
        if (ctx) {
          renderAnchorPoints(ctx, vectorShapes);
        }
      }
    }
  }, [showAnchorPoints, vectorMode, vectorShapes, renderAnchorPoints]);
  
  // Performance monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      const now = performance.now();
      const deltaTime = now - lastUpdateTimeRef.current;
      const frameRate = deltaTime > 0 ? 1000 / deltaTime : 0;
      
      updatePerformanceMetrics({
        frameRate,
        renderTime: deltaTime,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
      });
      
      lastUpdateTimeRef.current = now;
    }, 1000);
    
    return () => clearInterval(interval);
  }, [updatePerformanceMetrics]);
  
  // Error boundary
  if (error) {
    return (
      <Html>
        <div style={{ 
          color: 'red', 
          background: 'rgba(0,0,0,0.8)', 
          padding: '10px',
          borderRadius: '5px'
        }}>
          <h3>Shirt Component Error</h3>
          <p>{error}</p>
          <button onClick={clearError}>Dismiss</button>
        </div>
      </Html>
    );
  }
  
  return (
    <group>
      {/* 3D Model Renderer */}
      <ShirtRenderer
        modelUrl={modelUrl}
        modelChoice={modelChoice}
        modelType={modelType}
        modelScale={modelScale}
        modelPosition={modelPosition}
        modelRotation={modelRotation}
        onModelLoaded={onModelLoaded}
        onModelError={onModelError}
      />
      
      {/* Shirt Mesh */}
      <mesh
        ref={meshRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          map={textureRef.current}
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Controls Overlay */}
      <ShirtControls
        showAnchorPoints={showAnchorPoints}
        showGrid={showGrid}
        showGuides={showGuides}
        snapToGrid={snapToGrid}
        snapToPoints={snapToPoints}
        toolSettings={toolSettings}
        onToggleAnchorPoints={setShowAnchorPoints}
        onToggleGrid={setShowGrid}
        onToggleGuides={setShowGuides}
        onToggleSnapToGrid={setSnapToGrid}
        onToggleSnapToPoints={setSnapToPoints}
        onUpdateToolSettings={updateToolSettings}
      />
      
      {/* Debug Overlay */}
      {process.env.NODE_ENV === 'development' && (
        <ShirtDebugger
          stateSummary={getStateSummary()}
          performanceMetrics={performanceMetrics}
          vectorShapes={vectorShapes}
          selectedShapes={selectedShapes}
        />
      )}
      
      {/* Loading Indicator */}
      {isLoading && (
        <Html>
          <div style={{ 
            color: 'white', 
            background: 'rgba(0,0,0,0.8)', 
            padding: '10px',
            borderRadius: '5px'
          }}>
            Loading...
          </div>
        </Html>
      )}
    </group>
  );
};

export default Shirt;
