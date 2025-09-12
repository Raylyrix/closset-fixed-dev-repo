import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * 🛡️ Error Boundary - Production Error Handling
 *
 * Provides comprehensive error handling for production stability:
 * - Catches JavaScript errors anywhere in the component tree
 * - Logs errors for monitoring
 * - Displays fallback UI
 * - Prevents entire app crashes
 */
import React, { Component } from 'react';
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.retryCount = 0;
        this.maxRetries = 3;
        this.logErrorToService = (error, errorInfo) => {
            try {
                // In a real app, you would send this to your error monitoring service
                // Example: Sentry, LogRocket, Bugsnag, etc.
                const errorData = {
                    message: error.message,
                    stack: error.stack,
                    componentStack: errorInfo.componentStack,
                    errorId: this.state.errorId,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    retryCount: this.retryCount
                };
                // Simulate sending to error service
                console.log('📊 Error logged to monitoring service:', errorData);
                // In production, you would actually send this:
                // fetch('/api/errors', {
                //   method: 'POST',
                //   headers: { 'Content-Type': 'application/json' },
                //   body: JSON.stringify(errorData)
                // });
            }
            catch (loggingError) {
                console.error('Failed to log error to service:', loggingError);
            }
        };
        this.handleRetry = () => {
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                this.setState({
                    hasError: false,
                    error: null,
                    errorInfo: null,
                    errorId: ''
                });
            }
            else {
                // Max retries reached, reload the page
                window.location.reload();
            }
        };
        this.handleReload = () => {
            window.location.reload();
        };
        this.handleReportBug = () => {
            const errorDetails = {
                error: this.state.error?.message,
                stack: this.state.error?.stack,
                componentStack: this.state.errorInfo?.componentStack,
                errorId: this.state.errorId,
                timestamp: new Date().toISOString()
            };
            // Create a mailto link with error details
            const subject = `Bug Report - Error ID: ${this.state.errorId}`;
            const body = `Error Details:\n\n${JSON.stringify(errorDetails, null, 2)}`;
            const mailtoLink = `mailto:support@yourapp.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.open(mailtoLink);
        };
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: ''
        };
    }
    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error,
            errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
    }
    componentDidCatch(error, errorInfo) {
        // Log error details
        console.error('🚨 Error Boundary caught an error:', error);
        console.error('🚨 Error Info:', errorInfo);
        // Update state with error info
        this.setState({
            error,
            errorInfo
        });
        // Call custom error handler
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
        // Log to external service in production
        if (process.env.NODE_ENV === 'production') {
            this.logErrorToService(error, errorInfo);
        }
    }
    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }
            // Default fallback UI
            return (_jsxs("div", { style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px',
                    padding: '2rem',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    margin: '1rem',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }, children: [_jsx("div", { style: {
                            fontSize: '3rem',
                            marginBottom: '1rem'
                        }, children: "\uD83D\uDEA8" }), _jsx("h2", { style: {
                            color: '#dc3545',
                            marginBottom: '1rem',
                            textAlign: 'center'
                        }, children: "Something went wrong" }), _jsx("p", { style: {
                            color: '#6c757d',
                            textAlign: 'center',
                            marginBottom: '2rem',
                            maxWidth: '500px'
                        }, children: "We're sorry, but something unexpected happened. Our team has been notified and is working to fix this issue." }), _jsxs("div", { style: {
                            display: 'flex',
                            gap: '1rem',
                            flexWrap: 'wrap',
                            justifyContent: 'center'
                        }, children: [_jsx("button", { onClick: this.handleRetry, style: {
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: '500'
                                }, children: this.retryCount < this.maxRetries ? 'Try Again' : 'Reload Page' }), _jsx("button", { onClick: this.handleReload, style: {
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: '500'
                                }, children: "Reload Page" }), _jsx("button", { onClick: this.handleReportBug, style: {
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: '500'
                                }, children: "Report Bug" })] }), this.props.showDetails && this.state.error && (_jsxs("details", { style: {
                            marginTop: '2rem',
                            width: '100%',
                            maxWidth: '800px'
                        }, children: [_jsx("summary", { style: {
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    backgroundColor: '#e9ecef',
                                    borderRadius: '4px',
                                    marginBottom: '0.5rem'
                                }, children: "Error Details (Click to expand)" }), _jsxs("div", { style: {
                                    backgroundColor: '#f8f9fa',
                                    padding: '1rem',
                                    borderRadius: '4px',
                                    fontFamily: 'monospace',
                                    fontSize: '0.875rem',
                                    overflow: 'auto',
                                    maxHeight: '300px'
                                }, children: [_jsxs("div", { children: [_jsx("strong", { children: "Error ID:" }), " ", this.state.errorId] }), _jsxs("div", { children: [_jsx("strong", { children: "Message:" }), " ", this.state.error.message] }), _jsx("div", { children: _jsx("strong", { children: "Stack:" }) }), _jsx("pre", { style: { whiteSpace: 'pre-wrap', margin: '0.5rem 0' }, children: this.state.error.stack }), this.state.errorInfo && (_jsxs(_Fragment, { children: [_jsx("div", { children: _jsx("strong", { children: "Component Stack:" }) }), _jsx("pre", { style: { whiteSpace: 'pre-wrap', margin: '0.5rem 0' }, children: this.state.errorInfo.componentStack })] }))] })] })), _jsxs("div", { style: {
                            marginTop: '2rem',
                            fontSize: '0.875rem',
                            color: '#6c757d',
                            textAlign: 'center'
                        }, children: ["Error ID: ", this.state.errorId] })] }));
        }
        return this.props.children;
    }
}
// Hook version for functional components
export const useErrorHandler = () => {
    const [error, setError] = React.useState(null);
    const resetError = React.useCallback(() => {
        setError(null);
    }, []);
    const captureError = React.useCallback((error) => {
        setError(error);
    }, []);
    React.useEffect(() => {
        if (error) {
            throw error;
        }
    }, [error]);
    return { captureError, resetError };
};
// Higher-order component for easy wrapping
export const withErrorBoundary = (Component, errorBoundaryProps) => {
    const WrappedComponent = (props) => (_jsx(ErrorBoundary, { ...errorBoundaryProps, children: _jsx(Component, { ...props }) }));
    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
    return WrappedComponent;
};
export default ErrorBoundary;
