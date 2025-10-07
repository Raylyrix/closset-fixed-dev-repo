/**
 * PERFORMANCE MONITOR COMPONENT
 * 
 * Displays real-time performance metrics for debugging
 * Only shown in development mode
 */

import React, { useState, useEffect } from 'react';
import { performanceOptimizer } from '../utils/PerformanceOptimizer';

interface PerformanceMetrics {
  fps: number;
  deviceTier: 'low' | 'medium' | 'high';
  textureUpdatesPerSecond: number;
  canvasRedrawsPerSecond: number;
  memoryUsage?: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    deviceTier: 'medium',
    textureUpdatesPerSecond: 4,
    canvasRedrawsPerSecond: 4
  });

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const updateMetrics = () => {
      const config = performanceOptimizer.getConfig();
      setMetrics({
        fps: (performanceOptimizer as any).currentFPS || 60,
        deviceTier: config.deviceTier,
        textureUpdatesPerSecond: config.maxTextureUpdatesPerSecond,
        canvasRedrawsPerSecond: config.maxCanvasRedrawsPerSecond,
        memoryUsage: (performance as any).memory?.usedJSHeapSize
      });
    };

    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return '#4ade80'; // green
    if (fps >= 30) return '#fbbf24'; // yellow
    return '#ef4444'; // red
  };

  const formatMemory = (bytes?: number) => {
    if (!bytes) return 'N/A';
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: '#fff',
      padding: '10px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 1000,
      minWidth: '200px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#60a5fa' }}>
        🚀 Performance Monitor
      </div>
      
      <div style={{ marginBottom: '4px' }}>
        FPS: <span style={{ color: getFPSColor(metrics.fps) }}>{metrics.fps}</span>
      </div>
      
      <div style={{ marginBottom: '4px' }}>
        Device: <span style={{ color: '#fbbf24' }}>{metrics.deviceTier}</span>
      </div>
      
      <div style={{ marginBottom: '4px' }}>
        Texture Updates: {metrics.textureUpdatesPerSecond}/s
      </div>
      
      <div style={{ marginBottom: '4px' }}>
        Canvas Redraws: {metrics.canvasRedrawsPerSecond}/s
      </div>
      
      <div style={{ marginBottom: '4px' }}>
        Memory: {formatMemory(metrics.memoryUsage)}
      </div>
      
      <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '8px' }}>
        Dev Mode Only
      </div>
    </div>
  );
};

export default PerformanceMonitor;

