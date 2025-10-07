/**
 * Unified Layer Integration Component
 * 
 * This component demonstrates how to integrate the new unified layer system
 * with the existing ShirtRefactored component. It provides a bridge between
 * the old and new systems while maintaining backward compatibility.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useUnifiedLayers, UseUnifiedLayersOptions } from '../hooks/useUnifiedLayers';
import { useApp } from '../App';
import { ToolType } from '../core/types/UnifiedLayerTypes';

interface UnifiedLayerIntegrationProps {
  children?: React.ReactNode;
  options?: UseUnifiedLayersOptions;
  onLayerChange?: (layers: any[]) => void;
  onActiveLayerChange?: (layer: any) => void;
}

export function UnifiedLayerIntegration({ 
  children, 
  options = {},
  onLayerChange,
  onActiveLayerChange 
}: UnifiedLayerIntegrationProps) {
  
  // Get the unified layer system
  const unifiedLayers = useUnifiedLayers({
    canvasWidth: 4096,
    canvasHeight: 4096,
    autoCompose: true,
    autoUpdateDisplacement: true,
    ...options
  });
  
  // Get the existing App state
  const appState = useApp();
  
  // Refs for tracking integration state
  const isInitializedRef = useRef(false);
  const lastMigrationRef = useRef<any>(null);
  
  /**
   * Initialize the unified layer system with existing data
   */
  const initializeUnifiedSystem = useCallback(() => {
    if (isInitializedRef.current) return;
    
    console.log('🎨 UnifiedLayerIntegration: Initializing unified layer system');
    
    // Create migration data from existing App state
    const migrationData = {
      appLayers: appState.layers || [],
      layerSystemLayers: new Map(), // Empty for now
      domainLayers: [], // Empty for now
      activeLayerId: appState.activeLayerId,
      layerOrder: appState.layers?.map((l: any) => l.id) || []
    };
    
    // Migrate existing layers
    unifiedLayers.migrateFromExistingSystem(migrationData);
    
    isInitializedRef.current = true;
    lastMigrationRef.current = migrationData;
    
    console.log('🎨 UnifiedLayerIntegration: Unified layer system initialized');
  }, [appState, unifiedLayers]);
  
  /**
   * Sync unified layer changes back to App state
   */
  const syncToAppState = useCallback(() => {
    if (!isInitializedRef.current) return;
    
    // Convert unified layers back to App layer format
    const appLayers = unifiedLayers.layers.map((layer, index) => ({
      id: layer.id,
      name: layer.name,
      visible: layer.visible,
      canvas: layer.canvas,
      history: [], // Will be populated by existing system
      future: [],
      lockTransparent: layer.locked || false,
      mask: layer.mask,
      order: index
    }));
    
    // Update App state
    appState.setLayers(appLayers);
    if (unifiedLayers.activeLayer) {
      appState.setActiveLayerId(unifiedLayers.activeLayer.id);
    }
    
    // Update composed canvas
    appState.setComposedCanvas(unifiedLayers.getComposedCanvas());
    
    console.log('🎨 UnifiedLayerIntegration: Synced unified layers to App state');
  }, [unifiedLayers, appState]);
  
  /**
   * Handle tool drawing operations
   */
  const handleToolDrawing = useCallback((toolType: ToolType, drawingData: any) => {
    if (!isInitializedRef.current) return;
    
    console.log(`🎨 UnifiedLayerIntegration: Handling ${toolType} drawing operation`);
    
    // Get or create appropriate layer
    const targetLayer = unifiedLayers.getOrCreateToolLayer(toolType);
    
    // Perform drawing operation based on tool type
    switch (toolType) {
      case 'brush':
        unifiedLayers.drawBrushStroke(toolType, drawingData);
        break;
      case 'embroidery':
        unifiedLayers.drawEmbroideryStitch(toolType, drawingData);
        break;
      case 'puffPrint':
        unifiedLayers.drawPuffPrint(toolType, drawingData);
        break;
      case 'vector':
        unifiedLayers.drawVectorPath(toolType, drawingData);
        break;
      case 'eraser':
        unifiedLayers.eraseFromLayer(toolType, drawingData.x, drawingData.y, drawingData.size);
        break;
      case 'fill':
        unifiedLayers.fillLayerArea(toolType, drawingData.x, drawingData.y, drawingData.color);
        break;
      default:
        console.warn(`🎨 UnifiedLayerIntegration: Unknown tool type: ${toolType}`);
    }
    
    // Sync changes back to App state
    syncToAppState();
  }, [unifiedLayers, syncToAppState]);
  
  /**
   * Handle layer operations
   */
  const handleLayerOperation = useCallback((operation: string, ...args: any[]) => {
    if (!isInitializedRef.current) return;
    
    console.log(`🎨 UnifiedLayerIntegration: Handling layer operation: ${operation}`);
    
    switch (operation) {
      case 'create':
        const [type, name, toolType] = args;
        unifiedLayers.createLayer(type, name, toolType);
        break;
      case 'delete':
        const [layerId] = args;
        unifiedLayers.deleteLayer(layerId);
        break;
      case 'duplicate':
        const [duplicateId] = args;
        unifiedLayers.duplicateLayer(duplicateId);
        break;
      case 'setActive':
        const [activeId] = args;
        unifiedLayers.setActiveLayer(activeId);
        break;
      case 'setVisible':
        const [visibleId, visible] = args;
        unifiedLayers.setLayerVisible(visibleId, visible);
        break;
      case 'setOpacity':
        const [opacityId, opacity] = args;
        unifiedLayers.setLayerOpacity(opacityId, opacity);
        break;
      default:
        console.warn(`🎨 UnifiedLayerIntegration: Unknown layer operation: ${operation}`);
    }
    
    // Sync changes back to App state
    syncToAppState();
  }, [unifiedLayers, syncToAppState]);
  
  // Initialize on mount
  useEffect(() => {
    initializeUnifiedSystem();
  }, [initializeUnifiedSystem]);
  
  // Sync changes when unified layers change
  useEffect(() => {
    if (isInitializedRef.current) {
      syncToAppState();
      
      // Notify parent components
      if (onLayerChange) {
        onLayerChange(unifiedLayers.layers);
      }
      if (onActiveLayerChange && unifiedLayers.activeLayer) {
        onActiveLayerChange(unifiedLayers.activeLayer);
      }
    }
  }, [unifiedLayers.layers, unifiedLayers.activeLayer, syncToAppState, onLayerChange, onActiveLayerChange]);
  
  // Expose unified layer functions to parent components via ref
  const exposeUnifiedLayers = useCallback(() => {
    return {
      // Layer management
      createLayer: unifiedLayers.createLayer,
      deleteLayer: unifiedLayers.deleteLayer,
      duplicateLayer: unifiedLayers.duplicateLayer,
      setActiveLayer: unifiedLayers.setActiveLayer,
      setLayerVisible: unifiedLayers.setLayerVisible,
      setLayerOpacity: unifiedLayers.setLayerOpacity,
      
      // Tool operations
      getOrCreateToolLayer: unifiedLayers.getOrCreateToolLayer,
      drawBrushStroke: unifiedLayers.drawBrushStroke,
      drawEmbroideryStitch: unifiedLayers.drawEmbroideryStitch,
      drawPuffPrint: unifiedLayers.drawPuffPrint,
      eraseFromLayer: unifiedLayers.eraseFromLayer,
      
      // Composition
      composeLayers: unifiedLayers.composeLayers,
      updateDisplacementMaps: unifiedLayers.updateDisplacementMaps,
      
      // State
      layers: unifiedLayers.layers,
      activeLayer: unifiedLayers.activeLayer,
      needsComposition: unifiedLayers.needsComposition,
      stats: unifiedLayers.stats
    };
  }, [unifiedLayers]);
  
  // Make unified layer functions available globally for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__unifiedLayers = exposeUnifiedLayers();
    }
  }, [exposeUnifiedLayers]);
  
  return (
    <div className="unified-layer-integration">
      {/* Render children components */}
      {children}
      
      {/* Debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          top: 10,
          right: 10,
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 9999,
          maxWidth: '300px'
        }}>
          <h4>Unified Layer System</h4>
          <p>Layers: {unifiedLayers.layerCount}</p>
          <p>Active: {unifiedLayers.activeLayer?.name || 'None'}</p>
          <p>Needs Composition: {unifiedLayers.needsComposition ? 'Yes' : 'No'}</p>
          <p>Canvas Pool: {unifiedLayers.stats.pooledCanvases}</p>
          <p>Memory: {(unifiedLayers.stats.totalMemory / 1024 / 1024).toFixed(1)} MB</p>
          
          <details>
            <summary>Layer Details</summary>
            <ul style={{ fontSize: '10px', margin: '5px 0' }}>
              {unifiedLayers.layers.map(layer => (
                <li key={layer.id}>
                  {layer.name} ({layer.toolType || 'general'})
                  {layer.id === unifiedLayers.activeLayer?.id && ' [ACTIVE]'}
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}
    </div>
  );
}

// Export the hook for direct use in components
export { useUnifiedLayers };

// Export types
export type { UseUnifiedLayersOptions, UseUnifiedLayersReturn } from '../hooks/useUnifiedLayers';

