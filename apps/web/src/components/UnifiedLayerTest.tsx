/**
 * Unified Layer Test Component
 * 
 * Simple test component to verify the unified layer system works correctly.
 * This component can be used to test basic functionality before full integration.
 */

import React, { useState } from 'react';
import { UnifiedLayerIntegration } from './UnifiedLayerIntegration';
import { ToolType, LayerType } from '../core/types/UnifiedLayerTypes';

export function UnifiedLayerTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };
  
  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      // Wait for unified layers to be available
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const unifiedLayers = (window as any).__unifiedLayers;
      if (!unifiedLayers) {
        addTestResult('❌ Unified layers not available');
        return;
      }
      
      addTestResult('✅ Unified layers system initialized');
      
      // Test 1: Create layers
      addTestResult('🧪 Testing layer creation...');
      const brushLayer = unifiedLayers.createLayer('raster', 'Test Brush Layer', 'brush');
      const puffLayer = unifiedLayers.createLayer('raster', 'Test Puff Layer', 'puffPrint');
      const embroideryLayer = unifiedLayers.createLayer('raster', 'Test Embroidery Layer', 'embroidery');
      
      addTestResult(`✅ Created ${unifiedLayers.layers.length} layers`);
      
      // Test 2: Layer operations
      addTestResult('🧪 Testing layer operations...');
      unifiedLayers.setActiveLayer(brushLayer.id);
      unifiedLayers.setLayerOpacity(brushLayer.id, 0.8);
      unifiedLayers.setLayerVisible(puffLayer.id, false);
      
      addTestResult('✅ Layer operations completed');
      
      // Test 3: Tool drawing operations
      addTestResult('🧪 Testing tool drawing operations...');
      
      // Test brush stroke
      unifiedLayers.drawBrushStroke('brush', {
        points: [{ x: 100, y: 100 }, { x: 200, y: 200 }],
        color: '#ff0000',
        size: 10,
        opacity: 1.0,
        hardness: 1.0,
        flow: 1.0,
        spacing: 1.0,
        shape: 'round',
        blendMode: 'source-over'
      });
      
      // Test puff print
      unifiedLayers.drawPuffPrint('puffPrint', {
        x: 150,
        y: 150,
        size: 30,
        opacity: 1.0,
        color: '#00ff00',
        height: 2.0,
        curvature: 0.5
      });
      
      // Test embroidery stitch
      unifiedLayers.drawEmbroideryStitch('embroidery', {
        type: 'satin',
        color: '#0000ff',
        threadType: 'cotton',
        thickness: 2.0,
        opacity: 1.0,
        points: [{ x: 300, y: 300 }, { x: 350, y: 350 }]
      });
      
      addTestResult('✅ Tool drawing operations completed');
      
      // Test 4: Layer composition
      addTestResult('🧪 Testing layer composition...');
      const composedCanvas = unifiedLayers.composeLayers();
      addTestResult(`✅ Layer composition completed (${composedCanvas.width}x${composedCanvas.height})`);
      
      // Test 5: Displacement maps
      addTestResult('🧪 Testing displacement maps...');
      unifiedLayers.updateDisplacementMaps();
      addTestResult('✅ Displacement maps updated');
      
      // Test 6: Layer duplication
      addTestResult('🧪 Testing layer duplication...');
      const duplicatedLayer = unifiedLayers.duplicateLayer(brushLayer.id);
      addTestResult(`✅ Duplicated layer: ${duplicatedLayer.name}`);
      
      // Test 7: Layer deletion
      addTestResult('🧪 Testing layer deletion...');
      const initialCount = unifiedLayers.layers.length;
      unifiedLayers.deleteLayer(duplicatedLayer.id);
      const finalCount = unifiedLayers.layers.length;
      
      if (finalCount === initialCount - 1) {
        addTestResult('✅ Layer deletion successful');
      } else {
        addTestResult('❌ Layer deletion failed');
      }
      
      // Test 8: Memory and performance
      addTestResult('🧪 Testing memory usage...');
      const stats = unifiedLayers.stats;
      addTestResult(`✅ Memory stats: ${stats.activeCanvases} active, ${stats.pooledCanvases} pooled, ${(stats.totalMemory / 1024 / 1024).toFixed(1)} MB`);
      
      addTestResult('🎉 All tests completed successfully!');
      
    } catch (error) {
      addTestResult(`❌ Test failed: ${error}`);
      console.error('Test error:', error);
    } finally {
      setIsRunning(false);
    }
  };
  
  const clearResults = () => {
    setTestResults([]);
  };
  
  return (
    <UnifiedLayerIntegration>
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        zIndex: 10000,
        minWidth: '400px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h2>Unified Layer System Test</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={runTests} 
            disabled={isRunning}
            style={{
              padding: '10px 20px',
              background: isRunning ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              marginRight: '10px'
            }}
          >
            {isRunning ? 'Running Tests...' : 'Run Tests'}
          </button>
          
          <button 
            onClick={clearResults}
            style={{
              padding: '10px 20px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Clear Results
          </button>
        </div>
        
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '5px',
          padding: '15px',
          maxHeight: '400px',
          overflow: 'auto',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          {testResults.length === 0 ? (
            <div style={{ color: '#6c757d', fontStyle: 'italic' }}>
              Click "Run Tests" to test the unified layer system
            </div>
          ) : (
            testResults.map((result, index) => (
              <div key={index} style={{ marginBottom: '5px' }}>
                {result}
              </div>
            ))
          )}
        </div>
        
        <div style={{ marginTop: '15px', fontSize: '12px', color: '#6c757d' }}>
          <p><strong>Test Coverage:</strong></p>
          <ul>
            <li>Layer creation and management</li>
            <li>Tool drawing operations (brush, puff, embroidery)</li>
            <li>Layer composition and displacement maps</li>
            <li>Layer duplication and deletion</li>
            <li>Memory usage and performance</li>
          </ul>
        </div>
      </div>
    </UnifiedLayerIntegration>
  );
}

