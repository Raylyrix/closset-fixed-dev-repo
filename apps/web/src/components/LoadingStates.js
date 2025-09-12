import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
import { useState, useEffect } from 'react';
export const LoadingOverlay = ({ isVisible, message = 'Loading...', progress, onCancel, showProgress = false, type = 'default' }) => {
    const [dots, setDots] = useState('');
    useEffect(() => {
        if (!isVisible)
            return;
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);
        return () => clearInterval(interval);
    }, [isVisible]);
    if (!isVisible)
        return null;
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
    return (_jsxs("div", { style: {
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
        }, children: [_jsxs("div", { style: {
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '2rem',
                    minWidth: '300px',
                    maxWidth: '500px',
                    textAlign: 'center',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }, children: [_jsx("div", { style: {
                            fontSize: '3rem',
                            marginBottom: '1rem',
                            animation: 'pulse 2s infinite'
                        }, children: getIcon() }), _jsxs("h3", { style: {
                            margin: '0 0 1rem 0',
                            color: '#1f2937',
                            fontSize: '1.25rem',
                            fontWeight: '600'
                        }, children: [message, dots] }), showProgress && progress !== undefined && (_jsx("div", { style: {
                            width: '100%',
                            backgroundColor: '#e5e7eb',
                            borderRadius: '8px',
                            height: '8px',
                            marginBottom: '1rem',
                            overflow: 'hidden'
                        }, children: _jsx("div", { style: {
                                width: `${Math.min(100, Math.max(0, progress))}%`,
                                height: '100%',
                                backgroundColor: '#3b82f6',
                                borderRadius: '8px',
                                transition: 'width 0.3s ease',
                                background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)'
                            } }) })), showProgress && progress !== undefined && (_jsxs("div", { style: {
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            marginBottom: '1rem'
                        }, children: [Math.round(progress), "%"] })), onCancel && (_jsx("button", { onClick: onCancel, style: {
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                        }, children: "Cancel" }))] }), _jsx("style", { jsx: true, children: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      ` })] }));
};
export const SkeletonLoader = ({ width = '100%', height = '20px', borderRadius = '4px', className = '', count = 1, animation = 'pulse' }) => {
    const skeletons = Array.from({ length: count }, (_, index) => (_jsx("div", { className: `skeleton-loader ${className}`, style: {
            width,
            height,
            borderRadius,
            backgroundColor: '#e5e7eb',
            marginBottom: index < count - 1 ? '0.5rem' : '0',
            animation: animation === 'none' ? 'none' : `skeleton-${animation} 1.5s ease-in-out infinite`
        } }, index)));
    return (_jsxs(_Fragment, { children: [skeletons, _jsx("style", { jsx: true, children: `
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
      ` })] }));
};
export const ProgressBar = ({ progress, total = 100, showPercentage = true, showLabel = false, label, color = '#3b82f6', size = 'md', animated = true }) => {
    const percentage = Math.min(100, Math.max(0, (progress / total) * 100));
    const sizeStyles = {
        sm: { height: '4px', fontSize: '0.75rem' },
        md: { height: '8px', fontSize: '0.875rem' },
        lg: { height: '12px', fontSize: '1rem' }
    };
    return (_jsxs("div", { style: { width: '100%' }, children: [showLabel && (_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                    fontSize: sizeStyles[size].fontSize,
                    color: '#6b7280'
                }, children: [_jsx("span", { children: label || 'Progress' }), showPercentage && _jsxs("span", { children: [Math.round(percentage), "%"] })] })), _jsx("div", { style: {
                    width: '100%',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px',
                    height: sizeStyles[size].height,
                    overflow: 'hidden'
                }, children: _jsx("div", { style: {
                        width: `${percentage}%`,
                        height: '100%',
                        backgroundColor: color,
                        borderRadius: '4px',
                        transition: animated ? 'width 0.3s ease' : 'none',
                        background: animated
                            ? `linear-gradient(90deg, ${color}, ${color}dd)`
                            : color
                    } }) })] }));
};
export const StatusIndicator = ({ status, message, size = 'md', showMessage = true }) => {
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
    return (_jsxs("div", { style: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: config.bgColor,
            color: config.color,
            padding: sizeStyles[size].padding,
            borderRadius: '6px',
            fontSize: sizeStyles[size].fontSize,
            fontWeight: '500'
        }, children: [_jsx("span", { children: config.icon }), showMessage && message && _jsx("span", { children: message })] }));
};
// Hook for managing loading states
export const useLoadingState = (initialState = { isLoading: false }) => {
    const [state, setState] = useState(initialState);
    const setLoading = (isLoading, message) => {
        setState(prev => ({ ...prev, isLoading, message }));
    };
    const setProgress = (progress, message) => {
        setState(prev => ({ ...prev, progress, message }));
    };
    const setError = (error) => {
        setState(prev => ({ ...prev, isLoading: false, error, success: false }));
    };
    const setSuccess = (message) => {
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
