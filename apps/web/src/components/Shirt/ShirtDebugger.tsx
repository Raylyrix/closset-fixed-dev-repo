/**
 * 🎯 Shirt Debugger Component
 * 
 * Provides debugging information for the shirt component
 * Only shown in development mode
 */

import React, { useState } from 'react';
import { Html } from '@react-three/drei';

interface ShirtDebuggerProps {
  stateSummary: {
    vectorShapes: number;
    selectedShapes: number;
    currentPath: string;
    anchorPoints: number;
    isLoading: boolean;
    error: string | null;
    performanceMetrics: {
      renderTime: number;
      frameRate: number;
      memoryUsage: number;
      lastUpdate: number;
    };
  };
  performanceMetrics: {
    renderTime: number;
    frameRate: number;
    memoryUsage: number;
    lastUpdate: number;
  };
  vectorShapes: any[];
  selectedShapes: string[];
}

export const ShirtDebugger: React.FC<ShirtDebuggerProps> = ({
  stateSummary,
  performanceMetrics,
  vectorShapes,
  selectedShapes
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'state' | 'performance' | 'shapes'>('state');

  const debuggerStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '10px',
    left: '10px',
    background: 'rgba(0, 0, 0, 0.9)',
    color: 'white',
    padding: '10px',
    borderRadius: '5px',
    fontSize: '11px',
    minWidth: '300px',
    maxHeight: '400px',
    overflow: 'auto'
  };

  const tabStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: 'white',
    padding: '5px 10px',
    margin: '2px',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '10px'
  };

  const activeTabStyle: React.CSSProperties = {
    ...tabStyle,
    background: 'rgba(0, 255, 0, 0.3)',
    border: '1px solid rgba(0, 255, 0, 0.5)'
  };

  const formatMemory = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (!isExpanded) {
    return (
      <Html>
        <div style={debuggerStyle}>
          <button
            style={tabStyle}
            onClick={() => setIsExpanded(true)}
          >
            🔧 Debug ({stateSummary.vectorShapes} shapes, {performanceMetrics.frameRate.toFixed(1)}fps)
          </button>
        </div>
      </Html>
    );
  }

  return (
    <Html>
      <div style={debuggerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h4 style={{ margin: 0, fontSize: '12px' }}>Shirt Debugger</h4>
          <button
            style={tabStyle}
            onClick={() => setIsExpanded(false)}
          >
            ✕
          </button>
        </div>
        
        {/* Tabs */}
        <div style={{ display: 'flex', marginBottom: '10px' }}>
          <button
            style={activeTab === 'state' ? activeTabStyle : tabStyle}
            onClick={() => setActiveTab('state')}
          >
            State
          </button>
          <button
            style={activeTab === 'performance' ? activeTabStyle : tabStyle}
            onClick={() => setActiveTab('performance')}
          >
            Performance
          </button>
          <button
            style={activeTab === 'shapes' ? activeTabStyle : tabStyle}
            onClick={() => setActiveTab('shapes')}
          >
            Shapes
          </button>
        </div>
        
        {/* State Tab */}
        {activeTab === 'state' && (
          <div>
            <h5 style={{ margin: '0 0 5px 0', fontSize: '11px' }}>State Summary</h5>
            <div style={{ fontSize: '10px', lineHeight: '1.4' }}>
              <div>Vector Shapes: {stateSummary.vectorShapes}</div>
              <div>Selected Shapes: {stateSummary.selectedShapes}</div>
              <div>Current Path: {stateSummary.currentPath}</div>
              <div>Anchor Points: {stateSummary.anchorPoints}</div>
              <div>Loading: {stateSummary.isLoading ? 'Yes' : 'No'}</div>
              <div>Error: {stateSummary.error || 'None'}</div>
            </div>
          </div>
        )}
        
        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div>
            <h5 style={{ margin: '0 0 5px 0', fontSize: '11px' }}>Performance Metrics</h5>
            <div style={{ fontSize: '10px', lineHeight: '1.4' }}>
              <div>Frame Rate: {performanceMetrics.frameRate.toFixed(1)} fps</div>
              <div>Render Time: {performanceMetrics.renderTime.toFixed(2)} ms</div>
              <div>Memory Usage: {formatMemory(performanceMetrics.memoryUsage)}</div>
              <div>Last Update: {formatTime(performanceMetrics.lastUpdate)}</div>
            </div>
            
            <h5 style={{ margin: '10px 0 5px 0', fontSize: '11px' }}>Performance Status</h5>
            <div style={{ fontSize: '10px', lineHeight: '1.4' }}>
              <div style={{ color: performanceMetrics.frameRate > 30 ? '#00ff00' : '#ff0000' }}>
                FPS: {performanceMetrics.frameRate > 30 ? 'Good' : 'Poor'}
              </div>
              <div style={{ color: performanceMetrics.renderTime < 16 ? '#00ff00' : '#ff0000' }}>
                Render: {performanceMetrics.renderTime < 16 ? 'Good' : 'Slow'}
              </div>
              <div style={{ color: performanceMetrics.memoryUsage < 100 * 1024 * 1024 ? '#00ff00' : '#ff0000' }}>
                Memory: {performanceMetrics.memoryUsage < 100 * 1024 * 1024 ? 'Good' : 'High'}
              </div>
            </div>
          </div>
        )}
        
        {/* Shapes Tab */}
        {activeTab === 'shapes' && (
          <div>
            <h5 style={{ margin: '0 0 5px 0', fontSize: '11px' }}>Vector Shapes ({vectorShapes.length})</h5>
            <div style={{ maxHeight: '200px', overflow: 'auto' }}>
              {vectorShapes.map((shape, index) => (
                <div
                  key={shape.id || index}
                  style={{
                    fontSize: '10px',
                    padding: '5px',
                    margin: '2px 0',
                    background: selectedShapes.includes(shape.id) ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '3px',
                    border: selectedShapes.includes(shape.id) ? '1px solid rgba(0, 255, 0, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <div><strong>ID:</strong> {shape.id}</div>
                  <div><strong>Type:</strong> {shape.type}</div>
                  <div><strong>Tool:</strong> {shape.tool || 'unknown'}</div>
                  <div><strong>Points:</strong> {shape.path?.points?.length || 0}</div>
                  <div><strong>Selected:</strong> {selectedShapes.includes(shape.id) ? 'Yes' : 'No'}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Html>
  );
};

export default ShirtDebugger;
