import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Html } from '@react-three/drei';
export const ShirtControls = ({ showAnchorPoints, showGrid, showGuides, snapToGrid, snapToPoints, toolSettings, onToggleAnchorPoints, onToggleGrid, onToggleGuides, onToggleSnapToGrid, onToggleSnapToPoints, onUpdateToolSettings }) => {
    const controlStyle = {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        minWidth: '200px'
    };
    const buttonStyle = {
        background: 'rgba(255, 255, 255, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        color: 'white',
        padding: '5px 10px',
        margin: '2px',
        borderRadius: '3px',
        cursor: 'pointer',
        fontSize: '11px'
    };
    const activeButtonStyle = {
        ...buttonStyle,
        background: 'rgba(0, 255, 0, 0.3)',
        border: '1px solid rgba(0, 255, 0, 0.5)'
    };
    return (_jsx(Html, { children: _jsxs("div", { style: controlStyle, children: [_jsx("h4", { style: { margin: '0 0 10px 0', fontSize: '14px' }, children: "Shirt Controls" }), _jsxs("div", { style: { marginBottom: '10px' }, children: [_jsx("h5", { style: { margin: '0 0 5px 0', fontSize: '12px' }, children: "Display" }), _jsxs("button", { style: showAnchorPoints ? activeButtonStyle : buttonStyle, onClick: () => onToggleAnchorPoints(!showAnchorPoints), children: [showAnchorPoints ? '✓' : '○', " Anchor Points"] }), _jsxs("button", { style: showGrid ? activeButtonStyle : buttonStyle, onClick: () => onToggleGrid(!showGrid), children: [showGrid ? '✓' : '○', " Grid"] }), _jsxs("button", { style: showGuides ? activeButtonStyle : buttonStyle, onClick: () => onToggleGuides(!showGuides), children: [showGuides ? '✓' : '○', " Guides"] })] }), _jsxs("div", { style: { marginBottom: '10px' }, children: [_jsx("h5", { style: { margin: '0 0 5px 0', fontSize: '12px' }, children: "Snapping" }), _jsxs("button", { style: snapToGrid ? activeButtonStyle : buttonStyle, onClick: () => onToggleSnapToGrid(!snapToGrid), children: [snapToGrid ? '✓' : '○', " Snap to Grid"] }), _jsxs("button", { style: snapToPoints ? activeButtonStyle : buttonStyle, onClick: () => onToggleSnapToPoints(!snapToPoints), children: [snapToPoints ? '✓' : '○', " Snap to Points"] })] }), _jsxs("div", { style: { marginBottom: '10px' }, children: [_jsx("h5", { style: { margin: '0 0 5px 0', fontSize: '12px' }, children: "Tool Settings" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '5px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '5px' }, children: [_jsx("label", { style: { fontSize: '10px', minWidth: '60px' }, children: "Precision:" }), _jsx("input", { type: "number", value: toolSettings.precision, onChange: (e) => onUpdateToolSettings({ precision: parseFloat(e.target.value) }), style: {
                                                width: '60px',
                                                padding: '2px',
                                                fontSize: '10px',
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                                color: 'white',
                                                borderRadius: '2px'
                                            }, step: "0.1", min: "0.01", max: "1" })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '5px' }, children: [_jsx("label", { style: { fontSize: '10px', minWidth: '60px' }, children: "Grid Size:" }), _jsx("input", { type: "number", value: toolSettings.gridSize, onChange: (e) => onUpdateToolSettings({ gridSize: parseInt(e.target.value) }), style: {
                                                width: '60px',
                                                padding: '2px',
                                                fontSize: '10px',
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                                color: 'white',
                                                borderRadius: '2px'
                                            }, min: "5", max: "100" })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '5px' }, children: [_jsx("label", { style: { fontSize: '10px', minWidth: '60px' }, children: "Tolerance:" }), _jsx("input", { type: "number", value: toolSettings.snapTolerance, onChange: (e) => onUpdateToolSettings({ snapTolerance: parseInt(e.target.value) }), style: {
                                                width: '60px',
                                                padding: '2px',
                                                fontSize: '10px',
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                                color: 'white',
                                                borderRadius: '2px'
                                            }, min: "1", max: "50" })] })] })] }), _jsxs("div", { style: { fontSize: '10px', color: 'rgba(255, 255, 255, 0.7)' }, children: [_jsxs("div", { children: ["Grid: ", showGrid ? 'ON' : 'OFF'] }), _jsxs("div", { children: ["Guides: ", showGuides ? 'ON' : 'OFF'] }), _jsxs("div", { children: ["Snap: ", snapToGrid ? 'Grid' : snapToPoints ? 'Points' : 'OFF'] })] })] }) }));
};
export default ShirtControls;
