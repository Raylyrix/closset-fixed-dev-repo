// Advanced Vector Settings Panel
// Provides comprehensive control over vector tool features and stitch rendering

import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { vectorToolManager } from '../utils/vectorToolManager';
import { enhancedStitchRenderer } from '../utils/enhancedStitchRendering';

interface VectorSettingsPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

const VectorSettingsPanel: React.FC<VectorSettingsPanelProps> = ({ isVisible, onClose }) => {
  const { embroideryStitchType, embroideryColor, embroideryThickness, embroideryOpacity } = useApp();
  
  // Enhanced stitch settings
  const [threadType, setThreadType] = useState<'cotton' | 'silk' | 'wool' | 'synthetic'>('cotton');
  const [tension, setTension] = useState(0.5);
  const [density, setDensity] = useState(0.7);
  const [direction, setDirection] = useState(0);
  const [pattern, setPattern] = useState<'regular' | 'random' | 'organic'>('regular');
  const [quality, setQuality] = useState<'draft' | 'normal' | 'high' | 'ultra'>('high');
  
  // Performance settings
  const [enableCaching, setEnableCaching] = useState(true);
  const [enableOptimization, setEnableOptimization] = useState(true);
  const [maxCacheSize, setMaxCacheSize] = useState(100);
  
  // AI/ML settings
  const [enableAI, setEnableAI] = useState(true);
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [smartSpacing, setSmartSpacing] = useState(true);
  
  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState<Map<string, number[]>>(new Map());
  
  useEffect(() => {
    if (isVisible) {
      // Load performance metrics
      const metrics = vectorToolManager.getPerformanceMetrics();
      setPerformanceMetrics(metrics as Map<string, number[]>);
    }
  }, [isVisible]);

  const handleThreadTypeChange = (type: 'cotton' | 'silk' | 'wool' | 'synthetic') => {
    setThreadType(type);
    // Update global settings if needed
  };

  const handleTensionChange = (value: number) => {
    setTension(value);
  };

  const handleDensityChange = (value: number) => {
    setDensity(value);
  };

  const handleDirectionChange = (value: number) => {
    setDirection(value);
  };

  const handleQualityChange = (value: 'draft' | 'normal' | 'high' | 'ultra') => {
    setQuality(value);
  };

  const clearCache = () => {
    vectorToolManager.clearCache();
    console.log('Vector tool cache cleared');
  };

  const clearPerformanceMetrics = () => {
    vectorToolManager.clearPerformanceMetrics();
    setPerformanceMetrics(new Map());
    console.log('Performance metrics cleared');
  };

  const getAveragePerformance = (tool: string): number => {
    const metrics = performanceMetrics.get(tool) || [];
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, time) => sum + time, 0) / metrics.length;
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '60px',
      right: '20px',
      width: '350px',
      maxHeight: '80vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      border: '1px solid #334155',
      borderRadius: '12px',
      padding: '20px',
      color: 'white',
      zIndex: 1002,
      overflowY: 'auto',
      boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Vector Settings</h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          ✕
        </button>
      </div>

      {/* Thread Properties */}
      <div style={{ marginBottom: '25px' }}>
        <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', fontWeight: '600', color: '#94a3b8' }}>
          Thread Properties
        </h4>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Thread Type</label>
          <select
            value={threadType}
            onChange={(e) => handleThreadTypeChange(e.target.value as any)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #475569',
              background: '#1e293b',
              color: 'white',
              fontSize: '12px'
            }}
          >
            <option value="cotton">Cotton</option>
            <option value="silk">Silk</option>
            <option value="wool">Wool</option>
            <option value="synthetic">Synthetic</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
            Tension: {tension.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={tension}
            onChange={(e) => handleTensionChange(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
            Density: {density.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={density}
            onChange={(e) => handleDensityChange(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
            Direction: {direction}°
          </label>
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={direction}
            onChange={(e) => handleDirectionChange(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Rendering Quality */}
      <div style={{ marginBottom: '25px' }}>
        <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', fontWeight: '600', color: '#94a3b8' }}>
          Rendering Quality
        </h4>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Quality Level</label>
          <select
            value={quality}
            onChange={(e) => handleQualityChange(e.target.value as any)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #475569',
              background: '#1e293b',
              color: 'white',
              fontSize: '12px'
            }}
          >
            <option value="draft">Draft (Fast)</option>
            <option value="normal">Normal</option>
            <option value="high">High Quality</option>
            <option value="ultra">Ultra (Slow)</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={enableCaching}
              onChange={(e) => setEnableCaching(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Enable Rendering Cache
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={enableOptimization}
              onChange={(e) => setEnableOptimization(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Enable Performance Optimization
          </label>
        </div>
      </div>

      {/* AI/ML Features */}
      <div style={{ marginBottom: '25px' }}>
        <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', fontWeight: '600', color: '#94a3b8' }}>
          AI/ML Features
        </h4>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={enableAI}
              onChange={(e) => setEnableAI(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Enable AI-Powered Rendering
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={autoOptimize}
              onChange={(e) => setAutoOptimize(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Auto-Optimize Paths
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={smartSpacing}
              onChange={(e) => setSmartSpacing(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Smart Stitch Spacing
          </label>
        </div>
      </div>

      {/* Performance Metrics */}
      <div style={{ marginBottom: '25px' }}>
        <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', fontWeight: '600', color: '#94a3b8' }}>
          Performance Metrics
        </h4>
        
        {Array.from(performanceMetrics.entries()).map(([tool, metrics]) => (
          <div key={tool} style={{ marginBottom: '10px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ textTransform: 'capitalize' }}>{tool}:</span>
              <span>{getAveragePerformance(tool).toFixed(2)}ms avg</span>
            </div>
          </div>
        ))}
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button
            onClick={clearCache}
            style={{
              padding: '6px 12px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              color: 'white',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Clear Cache
          </button>
          <button
            onClick={clearPerformanceMetrics}
            style={{
              padding: '6px 12px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '6px',
              color: 'white',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Clear Metrics
          </button>
        </div>
      </div>

      {/* Current Settings Summary */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', fontWeight: '600', color: '#94a3b8' }}>
          Current Settings
        </h4>
        <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
          <div>Thread: {threadType}</div>
          <div>Tension: {(tension * 100).toFixed(0)}%</div>
          <div>Density: {(density * 100).toFixed(0)}%</div>
          <div>Direction: {direction}°</div>
          <div>Quality: {quality}</div>
          <div>AI: {enableAI ? 'ON' : 'OFF'}</div>
        </div>
      </div>
    </div>
  );
};

export default VectorSettingsPanel;
