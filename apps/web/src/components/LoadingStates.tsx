// @ts-nocheck
/**
 * 🔄 Loading States - Production UX Components
 * 
 * Provides comprehensive loading states for better user experience:
 * - Skeleton loaders
 * - Progress indicators
 * - Loading overlays
 * - Error states
 * - Success states
 */

import React, { useState, useEffect } from 'react';

export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
  error?: string;
  success?: boolean;
}

export interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  progress?: number;
  onCancel?: () => void;
  showProgress?: boolean;
  type?: 'default' | 'processing' | 'saving' | 'loading';
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Loading...',
  progress,
  onCancel,
  showProgress = false,
  type = 'default'
}) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'processing':
        return '⚙️';
      case 'saving':
        return '💾';
      case 'loading':
        return '📥';
      default:
        return '⏳';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        minWidth: '300px',
        maxWidth: '500px',
        textAlign: 'center',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '1rem',
          animation: 'pulse 2s infinite'
        }}>
          {getIcon()}
        </div>
        
        <h3 style={{
          margin: '0 0 1rem 0',
          color: '#1f2937',
          fontSize: '1.25rem',
          fontWeight: '600'
        }}>
          {message}{dots}
        </h3>

        {showProgress && progress !== undefined && (
          <div style={{
            width: '100%',
            backgroundColor: '#e5e7eb',
            borderRadius: '8px',
            height: '8px',
            marginBottom: '1rem',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(100, Math.max(0, progress))}%`,
              height: '100%',
              backgroundColor: '#3b82f6',
              borderRadius: '8px',
              transition: 'width 0.3s ease',
              background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)'
            }} />
          </div>
        )}

        {showProgress && progress !== undefined && (
          <div style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            marginBottom: '1rem'
          }}>
            {Math.round(progress)}%
          </div>
        )}

        {onCancel && (
          <button
            onClick={onCancel}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Cancel
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  count?: number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  className = '',
  count = 1,
  animation = 'pulse'
}) => {
  const skeletons = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={`skeleton-loader ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: '#e5e7eb',
        marginBottom: index < count - 1 ? '0.5rem' : '0',
        animation: animation === 'none' ? 'none' : `skeleton-${animation} 1.5s ease-in-out infinite`
      }}
    />
  ));

  return (
    <>
      {skeletons}
      <style jsx>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes skeleton-wave {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .skeleton-loader {
          position: relative;
          overflow: hidden;
        }
        
        .skeleton-loader::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          animation: skeleton-wave 1.5s infinite;
        }
      `}</style>
    </>
  );
};

export interface ProgressBarProps {
  progress: number;
  total?: number;
  showPercentage?: boolean;
  showLabel?: boolean;
  label?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  total = 100,
  showPercentage = true,
  showLabel = false,
  label,
  color = '#3b82f6',
  size = 'md',
  animated = true
}) => {
  const percentage = Math.min(100, Math.max(0, (progress / total) * 100));
  
  const sizeStyles = {
    sm: { height: '4px', fontSize: '0.75rem' },
    md: { height: '8px', fontSize: '0.875rem' },
    lg: { height: '12px', fontSize: '1rem' }
  };

  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.5rem',
          fontSize: sizeStyles[size].fontSize,
          color: '#6b7280'
        }}>
          <span>{label || 'Progress'}</span>
          {showPercentage && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
      
      <div style={{
        width: '100%',
        backgroundColor: '#e5e7eb',
        borderRadius: '4px',
        height: sizeStyles[size].height,
        overflow: 'hidden'
      }}>
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: '4px',
            transition: animated ? 'width 0.3s ease' : 'none',
            background: animated 
              ? `linear-gradient(90deg, ${color}, ${color}dd)` 
              : color
          }}
        />
      </div>
    </div>
  );
};

export interface StatusIndicatorProps {
  status: 'loading' | 'success' | 'error' | 'warning' | 'info';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  showMessage?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  message,
  size = 'md',
  showMessage = true
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'loading':
        return { icon: '⏳', color: '#3b82f6', bgColor: '#dbeafe' };
      case 'success':
        return { icon: '✅', color: '#10b981', bgColor: '#d1fae5' };
      case 'error':
        return { icon: '❌', color: '#ef4444', bgColor: '#fee2e2' };
      case 'warning':
        return { icon: '⚠️', color: '#f59e0b', bgColor: '#fef3c7' };
      case 'info':
        return { icon: 'ℹ️', color: '#6366f1', bgColor: '#e0e7ff' };
      default:
        return { icon: '❓', color: '#6b7280', bgColor: '#f3f4f6' };
    }
  };

  const config = getStatusConfig();
  const sizeStyles = {
    sm: { fontSize: '0.75rem', padding: '0.25rem 0.5rem' },
    md: { fontSize: '0.875rem', padding: '0.5rem 0.75rem' },
    lg: { fontSize: '1rem', padding: '0.75rem 1rem' }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      backgroundColor: config.bgColor,
      color: config.color,
      padding: sizeStyles[size].padding,
      borderRadius: '6px',
      fontSize: sizeStyles[size].fontSize,
      fontWeight: '500'
    }}>
      <span>{config.icon}</span>
      {showMessage && message && <span>{message}</span>}
    </div>
  );
};

// Hook for managing loading states
export const useLoadingState = (initialState: LoadingState = { isLoading: false }) => {
  const [state, setState] = useState<LoadingState>(initialState);

  const setLoading = (isLoading: boolean, message?: string) => {
    setState(prev => ({ ...prev, isLoading, message }));
  };

  const setProgress = (progress: number, message?: string) => {
    setState(prev => ({ ...prev, progress, message }));
  };

  const setError = (error: string) => {
    setState(prev => ({ ...prev, isLoading: false, error, success: false }));
  };

  const setSuccess = (message?: string) => {
    setState(prev => ({ ...prev, isLoading: false, success: true, message, error: undefined }));
  };

  const reset = () => {
    setState({ isLoading: false });
  };

  return {
    ...state,
    setLoading,
    setProgress,
    setError,
    setSuccess,
    reset
  };
};

export default LoadingOverlay;

