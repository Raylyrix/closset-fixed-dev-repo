import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const ShirtOverlay = ({ showGrid, showGuides, gridSize, canvasWidth, canvasHeight }) => {
    if (!showGrid && !showGuides) {
        return null;
    }
    const overlayStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
    };
    const gridStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: showGrid ? `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)` : 'none',
        backgroundSize: `${gridSize}px ${gridSize}px`,
        pointerEvents: 'none'
    };
    const guideStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
    };
    const centerLineStyle = {
        position: 'absolute',
        top: '50%',
        left: 0,
        width: '100%',
        height: '1px',
        background: 'rgba(255, 0, 0, 0.5)',
        transform: 'translateY(-50%)'
    };
    const verticalCenterLineStyle = {
        position: 'absolute',
        top: 0,
        left: '50%',
        width: '1px',
        height: '100%',
        background: 'rgba(255, 0, 0, 0.5)',
        transform: 'translateX(-50%)'
    };
    return (_jsxs("div", { style: overlayStyle, children: [showGrid && (_jsx("div", { style: gridStyle })), showGuides && (_jsxs("div", { style: guideStyle, children: [_jsx("div", { style: centerLineStyle }), _jsx("div", { style: verticalCenterLineStyle })] }))] }));
};
export default ShirtOverlay;
