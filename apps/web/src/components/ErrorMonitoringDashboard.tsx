// Error Monitoring Dashboard
// Real-time error tracking and prevention monitoring

import React, { useState, useEffect } from 'react';
import { errorLogger } from '../utils/errorLogger';
import { errorPrevention } from '../utils/errorPrevention';

interface ErrorMonitoringDashboardProps {
  isVisible: boolean;
  onClose: () => void;
}

const ErrorMonitoringDashboard: React.FC<ErrorMonitoringDashboardProps> = ({ isVisible, onClose }) => {
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const [recurringErrors, setRecurringErrors] = useState<any[]>([]);
  const [criticalErrors, setCriticalErrors] = useState<any[]>([]);
  const [preventionReport, setPreventionReport] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (isVisible) {
      loadErrorData();
      
      if (autoRefresh) {
        const interval = setInterval(loadErrorData, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
      }
    }
  }, [isVisible, autoRefresh]);

  const loadErrorData = () => {
    const logs = errorLogger.getRecurringErrors();
    const critical = errorLogger.getCriticalErrors();
    const report = errorPrevention.generatePreventionReport();
    
    setRecurringErrors(logs);
    setCriticalErrors(critical);
    setPreventionReport(report);
  };

  const exportErrorLogs = () => {
    const data = errorLogger.exportLogs();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllLogs = () => {
    if (window.confirm('Are you sure you want to clear all error logs? This action cannot be undone.')) {
      errorLogger.clearLogs();
      loadErrorData();
    }
  };

  const markErrorAsResolved = (errorId: string) => {
    errorLogger.markAsResolved(errorId);
    loadErrorData();
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '60px',
      left: '20px',
      width: '600px',
      maxHeight: '80vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      border: '1px solid #334155',
      borderRadius: '12px',
      padding: '20px',
      color: 'white',
      zIndex: 1003,
      overflowY: 'auto',
      boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Error Monitoring Dashboard</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{ marginRight: '5px' }}
            />
            Auto-refresh
          </label>
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
      </div>

      {/* Critical Errors */}
      {criticalErrors.length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', fontWeight: '600', color: '#ef4444' }}>
            🚨 Critical Errors ({criticalErrors.length})
          </h4>
          {criticalErrors.map((error, index) => (
            <div key={index} style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ fontSize: '12px' }}>{error.errorType}</strong>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {error.frequency} times
                </span>
              </div>
              <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#cbd5e1' }}>
                {error.description}
              </p>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '8px' }}>
                Components: {error.affectedComponents.join(', ')}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => markErrorAsResolved(error.id)}
                  style={{
                    padding: '4px 8px',
                    background: 'rgba(34, 197, 94, 0.2)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '10px',
                    cursor: 'pointer'
                  }}
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recurring Errors */}
      {recurringErrors.length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', fontWeight: '600', color: '#f59e0b' }}>
            🔄 Recurring Errors ({recurringErrors.length})
          </h4>
          {recurringErrors.map((error, index) => (
            <div key={index} style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ fontSize: '12px' }}>{error.errorType}</strong>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {error.frequency} times
                </span>
              </div>
              <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#cbd5e1' }}>
                {error.description}
              </p>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '8px' }}>
                Components: {error.affectedComponents.join(', ')}
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '8px' }}>
                Status: <span style={{ color: error.status === 'resolved' ? '#10b981' : '#f59e0b' }}>
                  {error.status.toUpperCase()}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => markErrorAsResolved(error.id)}
                  style={{
                    padding: '4px 8px',
                    background: 'rgba(34, 197, 94, 0.2)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '10px',
                    cursor: 'pointer'
                  }}
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Prevention Report */}
      <div style={{ marginBottom: '25px' }}>
        <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', fontWeight: '600', color: '#94a3b8' }}>
          📋 Prevention Report
        </h4>
        <div style={{
          background: 'rgba(71, 85, 105, 0.2)',
          border: '1px solid rgba(71, 85, 105, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '11px',
          lineHeight: '1.4',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
            {preventionReport}
          </pre>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button
          onClick={loadErrorData}
          style={{
            padding: '8px 16px',
            background: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '6px',
            color: 'white',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh
        </button>
        <button
          onClick={exportErrorLogs}
          style={{
            padding: '8px 16px',
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '6px',
            color: 'white',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          💾 Export Logs
        </button>
        <button
          onClick={clearAllLogs}
          style={{
            padding: '8px 16px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '6px',
            color: 'white',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          🗑️ Clear All
        </button>
      </div>

      {/* Summary */}
      <div style={{ marginTop: '20px', fontSize: '11px', color: '#94a3b8' }}>
        <div>Total Errors: {recurringErrors.length + criticalErrors.length}</div>
        <div>Critical: {criticalErrors.length}</div>
        <div>Recurring: {recurringErrors.length}</div>
        <div>Resolved: {recurringErrors.filter(e => e.status === 'resolved').length}</div>
      </div>
    </div>
  );
};

export default ErrorMonitoringDashboard;
