/**
 * 🚀 Performance Monitor Component
 * 
 * Shows real-time performance metrics in the corner of the screen
 */

import React, { useState, useEffect } from 'react';
import { unifiedPerformanceManager } from '../utils/UnifiedPerformanceManager';

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState(unifiedPerformanceManager.getPerformanceMetrics());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(unifiedPerformanceManager.getPerformanceMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (fps: number) => {
    if (fps >= 55) return '#22c55e'; // Green
    if (fps >= 45) return '#84cc16'; // Yellow-green
    if (fps >= 30) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const getStatusText = (fps: number) => {
    if (fps >= 55) return 'Excellent';
    if (fps >= 45) return 'Good';
    if (fps >= 30) return 'Fair';
    return 'Poor';
  };

  const statusColor = getStatusColor(metrics.averageFPS);
  const statusText = getStatusText(metrics.averageFPS);

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: '#ffffff',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontFamily: 'monospace',
        border: `1px solid ${statusColor}`,
        cursor: 'pointer',
        userSelect: 'none',
        minWidth: '120px'
      }}
      onClick={() => setIsVisible(!isVisible)}
      title="Click to toggle detailed view"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: statusColor
          }}
        />
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {Math.round(metrics.averageFPS)} FPS
          </div>
          <div style={{ color: '#888888', fontSize: '10px' }}>
            {statusText}
          </div>
        </div>
      </div>

      {isVisible && (
        <div
          style={{
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid #333333',
            fontSize: '10px'
          }}
        >
          <div>Current: {Math.round(metrics.currentFPS)} FPS</div>
          <div>Frame Drops: {metrics.frameDrops}</div>
          <div>Preset: {unifiedPerformanceManager.getPresetName()}</div>
        </div>
      )}
    </div>
  );
}