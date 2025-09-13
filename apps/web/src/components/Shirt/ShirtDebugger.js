import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
/**
 * 🎯 Shirt Debugger Component
 *
 * Provides debugging information for the shirt component
 * Only shown in development mode
 */
import { useState } from 'react';
import { Html } from '@react-three/drei';
export const ShirtDebugger = ({ stateSummary, performanceMetrics, vectorShapes, selectedShapes }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState('state');
    const debuggerStyle = {
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '11px',
        minWidth: '300px',
        maxHeight: '400px',
        overflow: 'auto'
    };
    const tabStyle = {
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        color: 'white',
        padding: '5px 10px',
        margin: '2px',
        borderRadius: '3px',
        cursor: 'pointer',
        fontSize: '10px'
    };
    const activeTabStyle = {
        ...tabStyle,
        background: 'rgba(0, 255, 0, 0.3)',
        border: '1px solid rgba(0, 255, 0, 0.5)'
    };
    const formatMemory = (bytes) => {
        if (bytes === 0)
            return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString();
    };
    if (!isExpanded) {
        return (_jsx(Html, { children: _jsx("div", { style: debuggerStyle, children: _jsxs("button", { style: tabStyle, onClick: () => setIsExpanded(true), children: ["\uD83D\uDD27 Debug (", stateSummary.vectorShapes, " shapes, ", performanceMetrics.frameRate.toFixed(1), "fps)"] }) }) }));
    }
    return (_jsx(Html, { children: _jsxs("div", { style: debuggerStyle, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }, children: [_jsx("h4", { style: { margin: 0, fontSize: '12px' }, children: "Shirt Debugger" }), _jsx("button", { style: tabStyle, onClick: () => setIsExpanded(false), children: "\u2715" })] }), _jsxs("div", { style: { display: 'flex', marginBottom: '10px' }, children: [_jsx("button", { style: activeTab === 'state' ? activeTabStyle : tabStyle, onClick: () => setActiveTab('state'), children: "State" }), _jsx("button", { style: activeTab === 'performance' ? activeTabStyle : tabStyle, onClick: () => setActiveTab('performance'), children: "Performance" }), _jsx("button", { style: activeTab === 'shapes' ? activeTabStyle : tabStyle, onClick: () => setActiveTab('shapes'), children: "Shapes" })] }), activeTab === 'state' && (_jsxs("div", { children: [_jsx("h5", { style: { margin: '0 0 5px 0', fontSize: '11px' }, children: "State Summary" }), _jsxs("div", { style: { fontSize: '10px', lineHeight: '1.4' }, children: [_jsxs("div", { children: ["Vector Shapes: ", stateSummary.vectorShapes] }), _jsxs("div", { children: ["Selected Shapes: ", stateSummary.selectedShapes] }), _jsxs("div", { children: ["Current Path: ", stateSummary.currentPath] }), _jsxs("div", { children: ["Anchor Points: ", stateSummary.anchorPoints] }), _jsxs("div", { children: ["Loading: ", stateSummary.isLoading ? 'Yes' : 'No'] }), _jsxs("div", { children: ["Error: ", stateSummary.error || 'None'] })] })] })), activeTab === 'performance' && (_jsxs("div", { children: [_jsx("h5", { style: { margin: '0 0 5px 0', fontSize: '11px' }, children: "Performance Metrics" }), _jsxs("div", { style: { fontSize: '10px', lineHeight: '1.4' }, children: [_jsxs("div", { children: ["Frame Rate: ", performanceMetrics.frameRate.toFixed(1), " fps"] }), _jsxs("div", { children: ["Render Time: ", performanceMetrics.renderTime.toFixed(2), " ms"] }), _jsxs("div", { children: ["Memory Usage: ", formatMemory(performanceMetrics.memoryUsage)] }), _jsxs("div", { children: ["Last Update: ", formatTime(performanceMetrics.lastUpdate)] })] }), _jsx("h5", { style: { margin: '10px 0 5px 0', fontSize: '11px' }, children: "Performance Status" }), _jsxs("div", { style: { fontSize: '10px', lineHeight: '1.4' }, children: [_jsxs("div", { style: { color: performanceMetrics.frameRate > 30 ? '#00ff00' : '#ff0000' }, children: ["FPS: ", performanceMetrics.frameRate > 30 ? 'Good' : 'Poor'] }), _jsxs("div", { style: { color: performanceMetrics.renderTime < 16 ? '#00ff00' : '#ff0000' }, children: ["Render: ", performanceMetrics.renderTime < 16 ? 'Good' : 'Slow'] }), _jsxs("div", { style: { color: performanceMetrics.memoryUsage < 100 * 1024 * 1024 ? '#00ff00' : '#ff0000' }, children: ["Memory: ", performanceMetrics.memoryUsage < 100 * 1024 * 1024 ? 'Good' : 'High'] })] })] })), activeTab === 'shapes' && (_jsxs("div", { children: [_jsxs("h5", { style: { margin: '0 0 5px 0', fontSize: '11px' }, children: ["Vector Shapes (", vectorShapes.length, ")"] }), _jsx("div", { style: { maxHeight: '200px', overflow: 'auto' }, children: vectorShapes.map((shape, index) => (_jsxs("div", { style: {
                                    fontSize: '10px',
                                    padding: '5px',
                                    margin: '2px 0',
                                    background: selectedShapes.includes(shape.id) ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '3px',
                                    border: selectedShapes.includes(shape.id) ? '1px solid rgba(0, 255, 0, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)'
                                }, children: [_jsxs("div", { children: [_jsx("strong", { children: "ID:" }), " ", shape.id] }), _jsxs("div", { children: [_jsx("strong", { children: "Type:" }), " ", shape.type] }), _jsxs("div", { children: [_jsx("strong", { children: "Tool:" }), " ", shape.tool || 'unknown'] }), _jsxs("div", { children: [_jsx("strong", { children: "Points:" }), " ", shape.path?.points?.length || 0] }), _jsxs("div", { children: [_jsx("strong", { children: "Selected:" }), " ", selectedShapes.includes(shape.id) ? 'Yes' : 'No'] })] }, shape.id || index))) })] }))] }) }));
};
export default ShirtDebugger;
