import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from 'react';
export const CursorOverlay = memo(function CursorOverlay({ x, y, visible, tool, size, shape = 'round', angle = 0 }) {
    if (!visible)
        return null;
    const drawing = ['brush', 'eraser', 'fill', 'picker', 'smudge', 'blur', 'select', 'transform', 'move', 'puffPrint', 'line', 'rect', 'ellipse', 'gradient', 'embroidery'].includes(tool);
    if (!drawing)
        return null;
    const diameter = Math.max(6, Math.min(256, size));
    const isCircle = (tool === 'brush' || tool === 'eraser' || tool === 'smudge' || tool === 'blur' || tool === 'puffPrint' || tool === 'line' || tool === 'rect' || tool === 'ellipse' || tool === 'gradient' || tool === 'embroidery') && shape !== 'square';
    const border = (tool === 'eraser' ? '1px dashed rgba(255,255,255,0.95)'
        : tool === 'smudge' ? '2px double rgba(147,197,253,0.9)'
            : tool === 'blur' ? '1px dotted rgba(250,204,21,0.9)'
                : tool === 'puffPrint' ? '2px solid rgba(255,182,193,0.95)'
                    : tool === 'embroidery' ? '2px solid rgba(255,105,180,0.95)'
                        : '1px solid rgba(103,232,249,0.95)');
    const icon = (() => {
        const common = { position: 'absolute', left: 0, top: 0, transform: `translate(${x}px, ${y}px)`, pointerEvents: 'none' };
        const sizePx = 18;
        switch (tool) {
            case 'picker':
                return (_jsxs("svg", { className: "cursor-svg", style: { ...common, marginLeft: 8, marginTop: -28 }, width: "20", height: "20", viewBox: "0 0 24 24", children: [_jsx("path", { d: "M3 21l6-6 6-6 3 3-12 12H3v-3z", fill: "none", stroke: "#a78bfa", strokeWidth: "1.5" }), _jsx("path", { d: "M15 3l6 6", stroke: "#a78bfa", strokeWidth: "1.5" })] }));
            case 'fill':
                return (_jsxs("svg", { className: "cursor-svg", style: { ...common, marginLeft: 10, marginTop: -30 }, width: "20", height: "20", viewBox: "0 0 24 24", children: [_jsx("path", { d: "M7 3l6 6-6 6L1 9 7 3z", fill: "none", stroke: "#34d399", strokeWidth: "1.5" }), _jsx("path", { d: "M13 9l5 5", stroke: "#34d399", strokeWidth: "1.5" }), _jsx("path", { d: "M19 17c0 1.657-1.343 3-3 3s-3-1.343 3-3z", fill: "#34d399" })] }));
            case 'select':
                return (_jsx("div", { className: "cursor-marquee", style: { ...common, width: 20, height: 20, marginLeft: -10, marginTop: -10 } }));
            case 'transform':
                return (_jsxs("svg", { className: "cursor-svg", style: { ...common, marginLeft: -10, marginTop: -10 }, width: "24", height: "24", viewBox: "0 0 24 24", children: [_jsx("path", { d: "M12 2v20M2 12h20", stroke: "#67e8f9", strokeWidth: "1.5" }), _jsx("path", { d: "M12 2l3 3-3-3-3 3 3-3M12 22l3-3-3 3-3-3 3 3M2 12l3 3-3-3 3-3-3 3M22 12l-3 3 3-3-3-3 3 3", stroke: "#67e8f9", strokeWidth: "1.2" })] }));
            case 'move':
                return (_jsx("svg", { className: "cursor-svg", style: { ...common, marginLeft: -10, marginTop: -10 }, width: "22", height: "22", viewBox: "0 0 24 24", children: _jsx("path", { d: "M12 2l3 3h-2v4h-2V5H9l3-3zm0 20l-3-3h2v-4h2v4h2l-3 3zM2 12l3-3v2h4v2H5v2l-3-3zm20 0l-3 3v-2h-4v-2h4V9l3 3z", fill: "#e5e7eb" }) }));
            case 'smudge':
                return (_jsxs("svg", { className: "cursor-svg", style: { ...common, marginLeft: -6, marginTop: -26 }, width: "20", height: "20", viewBox: "0 0 24 24", children: [_jsx("path", { d: "M4 16c4-2 6 2 10 0", stroke: "#93c5fd", strokeWidth: "1.5", fill: "none" }), _jsx("path", { d: "M6 12c3-1 5 1 8 0", stroke: "#93c5fd", strokeWidth: "1.2", fill: "none" })] }));
            case 'blur':
                return (_jsxs("svg", { className: "cursor-svg", style: { ...common, marginLeft: -8, marginTop: -26 }, width: "20", height: "20", viewBox: "0 0 24 24", children: [_jsx("circle", { cx: "8", cy: "12", r: "1", fill: "#facc15" }), _jsx("circle", { cx: "12", cy: "12", r: "1.4", fill: "#facc15", opacity: "0.8" }), _jsx("circle", { cx: "16", cy: "12", r: "1.8", fill: "#facc15", opacity: "0.6" })] }));
            case 'embroidery':
                return (_jsxs("svg", { className: "cursor-svg", style: { ...common, marginLeft: -8, marginTop: -26 }, width: "20", height: "20", viewBox: "0 0 24 24", children: [_jsx("path", { d: "M3 12h18M12 3v18M8 8l8 8M16 8l-8 8", stroke: "#ff69b4", strokeWidth: "1.5", fill: "none" }), _jsx("circle", { cx: "12", cy: "12", r: "2", fill: "#ff69b4", opacity: "0.6" })] }));
            default:
                return null;
        }
    })();
    return (_jsxs("div", { className: "cursor-overlay", style: { left: 0, top: 0 }, children: [isCircle ? (_jsx("div", { className: "cursor-circle", style: {
                    width: diameter,
                    height: diameter,
                    transform: `translate(${x - diameter / 2}px, ${y - diameter / 2}px)`,
                    border
                } })) : (tool === 'select' || tool === 'transform' || shape === 'square' || shape === 'calligraphy' ? (_jsx("div", { className: "cursor-circle", style: {
                    width: diameter,
                    height: diameter,
                    transform: `translate(${x - diameter / 2}px, ${y - diameter / 2}px) rotate(${angle}rad)`,
                    border
                } })) : (_jsxs("div", { className: "cursor-crosshair", style: { transform: `translate(${x}px, ${y}px)` }, children: [_jsx("div", { className: "ch h" }), _jsx("div", { className: "ch v" })] }))), icon] }));
});
