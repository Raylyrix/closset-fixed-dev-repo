import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Test Runner Component
 * UI component for running and viewing test results
 */
import { useState, useEffect } from 'react';
import { testFramework } from '../utils/TestFramework';
const TestRunner = ({ onTestComplete }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [currentTest, setCurrentTest] = useState(null);
    const [results, setResults] = useState([]);
    const [report, setReport] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    useEffect(() => {
        // Monitor test progress
        const interval = setInterval(() => {
            if (testFramework.isTestRunning()) {
                const current = testFramework.getCurrentTest();
                setCurrentTest(current?.name || null);
                setResults(testFramework.getResults());
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);
    const runAllTests = async () => {
        setIsRunning(true);
        setCurrentTest(null);
        setResults([]);
        setReport(null);
        try {
            const testReport = await testFramework.runAllTests();
            setReport(testReport);
            setResults(testReport.results);
            onTestComplete?.(testReport);
        }
        catch (error) {
            console.error('Test execution failed:', error);
        }
        finally {
            setIsRunning(false);
            setCurrentTest(null);
        }
    };
    const runTestSuite = async (suiteId) => {
        setIsRunning(true);
        setCurrentTest(null);
        setResults([]);
        setReport(null);
        try {
            const testReport = await testFramework.runTestSuite(suiteId);
            setReport(testReport);
            setResults(testReport.results);
            onTestComplete?.(testReport);
        }
        catch (error) {
            console.error('Test suite execution failed:', error);
        }
        finally {
            setIsRunning(false);
            setCurrentTest(null);
        }
    };
    const getStatusColor = (passed) => {
        return passed ? '#10b981' : '#ef4444';
    };
    const getStatusIcon = (passed) => {
        return passed ? '✅' : '❌';
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical': return '#dc2626';
            case 'high': return '#ea580c';
            case 'medium': return '#d97706';
            case 'low': return '#65a30d';
            default: return '#6b7280';
        }
    };
    return (_jsxs("div", { style: {
            padding: '16px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            margin: '16px 0'
        }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                }, children: [_jsx("h3", { style: { margin: 0, color: '#1f2937' }, children: "Test Runner" }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx("button", { onClick: runAllTests, disabled: isRunning, style: {
                                    padding: '8px 16px',
                                    backgroundColor: isRunning ? '#9ca3af' : '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: isRunning ? 'not-allowed' : 'pointer',
                                    fontSize: '14px'
                                }, children: isRunning ? 'Running...' : 'Run All Tests' }), _jsx("button", { onClick: () => setShowDetails(!showDetails), style: {
                                    padding: '8px 16px',
                                    backgroundColor: '#6b7280',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }, children: showDetails ? 'Hide Details' : 'Show Details' })] })] }), isRunning && currentTest && (_jsx("div", { style: {
                    padding: '12px',
                    backgroundColor: '#dbeafe',
                    border: '1px solid #3b82f6',
                    borderRadius: '4px',
                    marginBottom: '16px'
                }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("div", { className: "spinner", style: {
                                width: '16px',
                                height: '16px',
                                border: '2px solid #3b82f6',
                                borderTop: '2px solid transparent',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            } }), _jsxs("span", { style: { color: '#1e40af', fontWeight: '500' }, children: ["Running: ", currentTest] })] }) })), _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("h4", { style: { margin: '0 0 8px 0', color: '#374151' }, children: "Test Suites" }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }, children: testFramework.getTestSuites().map(suite => (_jsxs("button", { onClick: () => runTestSuite(suite.id), disabled: isRunning, style: {
                                padding: '12px',
                                backgroundColor: isRunning ? '#f3f4f6' : '#ffffff',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                cursor: isRunning ? 'not-allowed' : 'pointer',
                                textAlign: 'left',
                                fontSize: '14px'
                            }, children: [_jsx("div", { style: { fontWeight: '500', marginBottom: '4px' }, children: suite.name }), _jsx("div", { style: { fontSize: '12px', color: '#6b7280' }, children: suite.description })] }, suite.id))) })] }), report && (_jsxs("div", { style: {
                    padding: '16px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    marginBottom: '16px'
                }, children: [_jsx("h4", { style: { margin: '0 0 12px 0', color: '#374151' }, children: "Test Results Summary" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }, children: [_jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }, children: report.total }), _jsx("div", { style: { fontSize: '12px', color: '#6b7280' }, children: "Total" })] }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: '24px', fontWeight: 'bold', color: '#10b981' }, children: report.passed }), _jsx("div", { style: { fontSize: '12px', color: '#6b7280' }, children: "Passed" })] }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }, children: report.failed }), _jsx("div", { style: { fontSize: '12px', color: '#6b7280' }, children: "Failed" })] }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsxs("div", { style: { fontSize: '24px', fontWeight: 'bold', color: '#6b7280' }, children: [Math.round(report.duration), "ms"] }), _jsx("div", { style: { fontSize: '12px', color: '#6b7280' }, children: "Duration" })] })] })] })), showDetails && results.length > 0 && (_jsxs("div", { style: {
                    backgroundColor: '#ffffff',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    overflow: 'hidden'
                }, children: [_jsx("div", { style: {
                            padding: '12px 16px',
                            backgroundColor: '#f9fafb',
                            borderBottom: '1px solid #d1d5db',
                            fontWeight: '500'
                        }, children: "Test Results Details" }), _jsx("div", { style: { maxHeight: '400px', overflowY: 'auto' }, children: results.map((result, index) => (_jsxs("div", { style: {
                                padding: '12px 16px',
                                borderBottom: index < results.length - 1 ? '1px solid #f3f4f6' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }, children: [_jsx("div", { style: { fontSize: '16px' }, children: getStatusIcon(result.passed) }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: {
                                                fontWeight: '500',
                                                marginBottom: '4px',
                                                color: getStatusColor(result.passed)
                                            }, children: result.name }), result.error && (_jsx("div", { style: {
                                                fontSize: '12px',
                                                color: '#ef4444',
                                                fontFamily: 'monospace',
                                                backgroundColor: '#fef2f2',
                                                padding: '4px 8px',
                                                borderRadius: '2px',
                                                marginTop: '4px'
                                            }, children: result.error })), result.details && (_jsxs("div", { style: {
                                                fontSize: '11px',
                                                color: '#6b7280',
                                                marginTop: '4px'
                                            }, children: ["Duration: ", result.duration, "ms"] }))] })] }, result.id))) })] })), _jsx("style", { jsx: true, children: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      ` })] }));
};
export default TestRunner;
