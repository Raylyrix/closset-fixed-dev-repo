import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Error Monitoring Dashboard
// Real-time error tracking and prevention monitoring
import { useState, useEffect } from 'react';
import { errorLogger } from '../utils/errorLogger';
import { errorPrevention } from '../utils/errorPrevention';
const ErrorMonitoringDashboard = ({ isVisible, onClose }) => {
    const [errorLogs, setErrorLogs] = useState([]);
    const [recurringErrors, setRecurringErrors] = useState([]);
    const [criticalErrors, setCriticalErrors] = useState([]);
    const [preventionReport, setPreventionReport] = useState('');
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
    const markErrorAsResolved = (errorId) => {
        errorLogger.markAsResolved(errorId);
        loadErrorData();
    };
    if (!isVisible)
        return null;
    return (_jsxs("div", { style: {
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
        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }, children: [_jsx("h3", { style: { margin: 0, fontSize: '18px', fontWeight: '600' }, children: "Error Monitoring Dashboard" }), _jsxs("div", { style: { display: 'flex', gap: '10px', alignItems: 'center' }, children: [_jsxs("label", { style: { fontSize: '12px', display: 'flex', alignItems: 'center' }, children: [_jsx("input", { type: "checkbox", checked: autoRefresh, onChange: (e) => setAutoRefresh(e.target.checked), style: { marginRight: '5px' } }), "Auto-refresh"] }), _jsx("button", { onClick: onClose, style: {
                                    background: 'none',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '20px',
                                    cursor: 'pointer',
                                    padding: '5px'
                                }, children: "\u2715" })] })] }), criticalErrors.length > 0 && (_jsxs("div", { style: { marginBottom: '25px' }, children: [_jsxs("h4", { style: { margin: '0 0 15px 0', fontSize: '14px', fontWeight: '600', color: '#ef4444' }, children: ["\uD83D\uDEA8 Critical Errors (", criticalErrors.length, ")"] }), criticalErrors.map((error, index) => (_jsxs("div", { style: {
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '10px'
                        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }, children: [_jsx("strong", { style: { fontSize: '12px' }, children: error.errorType }), _jsxs("span", { style: { fontSize: '11px', color: '#94a3b8' }, children: [error.frequency, " times"] })] }), _jsx("p", { style: { margin: '0 0 8px 0', fontSize: '11px', color: '#cbd5e1' }, children: error.description }), _jsxs("div", { style: { fontSize: '10px', color: '#94a3b8', marginBottom: '8px' }, children: ["Components: ", error.affectedComponents.join(', ')] }), _jsx("div", { style: { display: 'flex', gap: '8px' }, children: _jsx("button", { onClick: () => markErrorAsResolved(error.id), style: {
                                        padding: '4px 8px',
                                        background: 'rgba(34, 197, 94, 0.2)',
                                        border: '1px solid rgba(34, 197, 94, 0.3)',
                                        borderRadius: '4px',
                                        color: 'white',
                                        fontSize: '10px',
                                        cursor: 'pointer'
                                    }, children: "Mark Resolved" }) })] }, index)))] })), recurringErrors.length > 0 && (_jsxs("div", { style: { marginBottom: '25px' }, children: [_jsxs("h4", { style: { margin: '0 0 15px 0', fontSize: '14px', fontWeight: '600', color: '#f59e0b' }, children: ["\uD83D\uDD04 Recurring Errors (", recurringErrors.length, ")"] }), recurringErrors.map((error, index) => (_jsxs("div", { style: {
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '10px'
                        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }, children: [_jsx("strong", { style: { fontSize: '12px' }, children: error.errorType }), _jsxs("span", { style: { fontSize: '11px', color: '#94a3b8' }, children: [error.frequency, " times"] })] }), _jsx("p", { style: { margin: '0 0 8px 0', fontSize: '11px', color: '#cbd5e1' }, children: error.description }), _jsxs("div", { style: { fontSize: '10px', color: '#94a3b8', marginBottom: '8px' }, children: ["Components: ", error.affectedComponents.join(', ')] }), _jsxs("div", { style: { fontSize: '10px', color: '#94a3b8', marginBottom: '8px' }, children: ["Status: ", _jsx("span", { style: { color: error.status === 'resolved' ? '#10b981' : '#f59e0b' }, children: error.status.toUpperCase() })] }), _jsx("div", { style: { display: 'flex', gap: '8px' }, children: _jsx("button", { onClick: () => markErrorAsResolved(error.id), style: {
                                        padding: '4px 8px',
                                        background: 'rgba(34, 197, 94, 0.2)',
                                        border: '1px solid rgba(34, 197, 94, 0.3)',
                                        borderRadius: '4px',
                                        color: 'white',
                                        fontSize: '10px',
                                        cursor: 'pointer'
                                    }, children: "Mark Resolved" }) })] }, index)))] })), _jsxs("div", { style: { marginBottom: '25px' }, children: [_jsx("h4", { style: { margin: '0 0 15px 0', fontSize: '14px', fontWeight: '600', color: '#94a3b8' }, children: "\uD83D\uDCCB Prevention Report" }), _jsx("div", { style: {
                            background: 'rgba(71, 85, 105, 0.2)',
                            border: '1px solid rgba(71, 85, 105, 0.3)',
                            borderRadius: '8px',
                            padding: '12px',
                            fontSize: '11px',
                            lineHeight: '1.4',
                            maxHeight: '200px',
                            overflowY: 'auto'
                        }, children: _jsx("pre", { style: { margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }, children: preventionReport }) })] }), _jsxs("div", { style: { display: 'flex', gap: '10px', marginTop: '20px' }, children: [_jsx("button", { onClick: loadErrorData, style: {
                            padding: '8px 16px',
                            background: 'rgba(59, 130, 246, 0.2)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '12px',
                            cursor: 'pointer'
                        }, children: "\uD83D\uDD04 Refresh" }), _jsx("button", { onClick: exportErrorLogs, style: {
                            padding: '8px 16px',
                            background: 'rgba(16, 185, 129, 0.2)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '12px',
                            cursor: 'pointer'
                        }, children: "\uD83D\uDCBE Export Logs" }), _jsx("button", { onClick: clearAllLogs, style: {
                            padding: '8px 16px',
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '12px',
                            cursor: 'pointer'
                        }, children: "\uD83D\uDDD1\uFE0F Clear All" })] }), _jsxs("div", { style: { marginTop: '20px', fontSize: '11px', color: '#94a3b8' }, children: [_jsxs("div", { children: ["Total Errors: ", recurringErrors.length + criticalErrors.length] }), _jsxs("div", { children: ["Critical: ", criticalErrors.length] }), _jsxs("div", { children: ["Recurring: ", recurringErrors.length] }), _jsxs("div", { children: ["Resolved: ", recurringErrors.filter(e => e.status === 'resolved').length] })] })] }));
};
export default ErrorMonitoringDashboard;
