/**
 * 🚀 Performance Settings Component
 * 
 * Allows users to view and adjust performance settings
 * Shows real-time performance metrics and device capabilities
 */

import React, { useState, useEffect } from 'react';
import { unifiedPerformanceManager } from '../utils/UnifiedPerformanceManager';

interface PerformanceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PerformanceSettings({ isOpen, onClose }: PerformanceSettingsProps) {
  const [currentPreset, setCurrentPreset] = useState(unifiedPerformanceManager.getPresetName());
  const [performanceMetrics, setPerformanceMetrics] = useState(unifiedPerformanceManager.getPerformanceMetrics());
  const [deviceCapabilities, setDeviceCapabilities] = useState(unifiedPerformanceManager.getDeviceCapabilities());
  const [autoAdjustment, setAutoAdjustment] = useState(true);

  // Update metrics every second
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setPerformanceMetrics(unifiedPerformanceManager.getPerformanceMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const presets = [
    { id: 'ultra-low', name: 'Ultra Low', description: 'Maximum compatibility' },
    { id: 'low', name: 'Low', description: 'Smooth on budget devices' },
    { id: 'balanced', name: 'Balanced', description: 'Good balance' },
    { id: 'high', name: 'High', description: 'High quality' },
    { id: 'ultra', name: 'Ultra', description: 'Maximum quality' }
  ];

  const handlePresetChange = (presetId: string) => {
    unifiedPerformanceManager.setPreset(presetId);
    setCurrentPreset(presetId);
  };

  const handleAutoAdjustmentToggle = (enabled: boolean) => {
    unifiedPerformanceManager.enableAutoAdjustment(enabled);
    setAutoAdjustment(enabled);
  };

  const getDeviceTier = () => {
    const { isLowEnd, isMidRange, isHighEnd } = deviceCapabilities;
    if (isLowEnd) return 'Low-End';
    if (isMidRange) return 'Mid-Range';
    if (isHighEnd) return 'High-End';
    return 'Unknown';
  };

  const getPerformanceStatus = () => {
    const { averageFPS } = performanceMetrics;
    if (averageFPS >= 55) return { status: 'Excellent', color: '#22c55e' };
    if (averageFPS >= 45) return { status: 'Good', color: '#84cc16' };
    if (averageFPS >= 30) return { status: 'Fair', color: '#f59e0b' };
    return { status: 'Poor', color: '#ef4444' };
  };

  if (!isOpen) return null;

  const performanceStatus = getPerformanceStatus();
  const preset = unifiedPerformanceManager.getCurrentPreset();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#1e1e1e',
          border: '1px solid #3c3c3c',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#ffffff', fontSize: '20px', fontWeight: 'bold' }}>
            🚀 Performance Settings
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#888888',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        {/* Device Information */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#ffffff', fontSize: '16px', marginBottom: '12px' }}>
            Device Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
            <div>
              <div style={{ color: '#888888' }}>Device Tier</div>
              <div style={{ color: '#ffffff', fontWeight: 'bold' }}>{getDeviceTier()}</div>
            </div>
            <div>
              <div style={{ color: '#888888' }}>CPU Cores</div>
              <div style={{ color: '#ffffff', fontWeight: 'bold' }}>{deviceCapabilities.cpuCores}</div>
            </div>
            <div>
              <div style={{ color: '#888888' }}>Device Memory</div>
              <div style={{ color: '#ffffff', fontWeight: 'bold' }}>{deviceCapabilities.deviceMemory} GB</div>
            </div>
            <div>
              <div style={{ color: '#888888' }}>WebGL Version</div>
              <div style={{ color: '#ffffff', fontWeight: 'bold' }}>{deviceCapabilities.webglVersion}</div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#ffffff', fontSize: '16px', marginBottom: '12px' }}>
            Performance Metrics
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '14px' }}>
            <div>
              <div style={{ color: '#888888' }}>Current FPS</div>
              <div style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '18px' }}>
                {Math.round(performanceMetrics.currentFPS)}
              </div>
            </div>
            <div>
              <div style={{ color: '#888888' }}>Average FPS</div>
              <div style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '18px' }}>
                {Math.round(performanceMetrics.averageFPS)}
              </div>
            </div>
            <div>
              <div style={{ color: '#888888' }}>Status</div>
              <div style={{ color: performanceStatus.color, fontWeight: 'bold', fontSize: '18px' }}>
                {performanceStatus.status}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Presets */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#ffffff', fontSize: '16px', marginBottom: '12px' }}>
            Performance Preset
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {presets.map((preset) => (
              <label
                key={preset.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: currentPreset === preset.id ? '#007acc' : '#2a2a2a',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: currentPreset === preset.id ? '2px solid #007acc' : '2px solid transparent'
                }}
              >
                <input
                  type="radio"
                  name="preset"
                  value={preset.id}
                  checked={currentPreset === preset.id}
                  onChange={() => handlePresetChange(preset.id)}
                  style={{ marginRight: '12px' }}
                />
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 'bold' }}>{preset.name}</div>
                  <div style={{ color: '#888888', fontSize: '12px' }}>{preset.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Current Settings */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#ffffff', fontSize: '16px', marginBottom: '12px' }}>
            Current Settings
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
            <div>
              <div style={{ color: '#888888' }}>Canvas Resolution</div>
              <div style={{ color: '#ffffff', fontWeight: 'bold' }}>
                {preset.canvasResolution} × {preset.canvasResolution}
              </div>
            </div>
            <div>
              <div style={{ color: '#888888' }}>Texture Quality</div>
              <div style={{ color: '#ffffff', fontWeight: 'bold' }}>{preset.textureQuality}</div>
            </div>
            <div>
              <div style={{ color: '#888888' }}>Max Text Elements</div>
              <div style={{ color: '#ffffff', fontWeight: 'bold' }}>{preset.maxTextElements}</div>
            </div>
            <div>
              <div style={{ color: '#888888' }}>Max Shape Elements</div>
              <div style={{ color: '#ffffff', fontWeight: 'bold' }}>{preset.maxShapeElements}</div>
            </div>
            <div>
              <div style={{ color: '#888888' }}>Shadows</div>
              <div style={{ color: '#ffffff', fontWeight: 'bold' }}>
                {preset.enableShadows ? 'Enabled' : 'Disabled'}
              </div>
            </div>
            <div>
              <div style={{ color: '#888888' }}>Advanced Features</div>
              <div style={{ color: '#ffffff', fontWeight: 'bold' }}>
                {preset.enableAdvancedFeatures ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </div>
        </div>

        {/* Auto-Adjustment */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#ffffff', fontSize: '16px', marginBottom: '12px' }}>
            Auto-Adjustment
          </h3>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoAdjustment}
              onChange={(e) => handleAutoAdjustmentToggle(e.target.checked)}
              style={{ marginRight: '12px' }}
            />
            <div>
              <div style={{ color: '#ffffff', fontWeight: 'bold' }}>Enable Auto-Adjustment</div>
              <div style={{ color: '#888888', fontSize: '12px' }}>
                Automatically adjust performance based on device capabilities
              </div>
            </div>
          </label>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={() => unifiedPerformanceManager.setPreset('balanced')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3c3c3c',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Reset to Balanced
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007acc',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
