import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useRef } from 'react';
import { Navigation } from './Navigation';
import { RightPanel } from './RightPanel';
import { LeftPanel } from './LeftPanel';
import { EmbroiderySidebar } from './EmbroiderySidebar';
import { GridOverlay } from './GridOverlay';
import VectorToolbar from './VectorToolbar';
import { useApp } from '../App';
// Grid & Scale Controls for Main Toolbar
const GridToolbarControls = () => {
    const { showGrid, setShowGrid, showRulers, setShowRulers, snapToGrid, setSnapToGrid, scale, setScale, gridSize, setGridSize, gridColor, setGridColor, gridOpacity, setGridOpacity, rulerUnits, setRulerUnits, snapDistance, setSnapDistance } = useApp();
    const [showScaleMenu, setShowScaleMenu] = useState(false);
    const [showGridMenu, setShowGridMenu] = useState(false);
    const scaleRef = useRef(null);
    const gridRef = useRef(null);
    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (scaleRef.current && !scaleRef.current.contains(event.target)) {
                setShowScaleMenu(false);
            }
            if (gridRef.current && !gridRef.current.contains(event.target)) {
                setShowGridMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    return (_jsxs("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' }, children: [_jsxs("button", { onClick: () => setShowGrid(!showGrid), style: {
                    padding: '8px 12px',
                    background: showGrid ? '#10B981' : '#475569',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease'
                }, title: "Toggle Grid", children: [_jsx("span", { children: "\uD83D\uDCD0" }), _jsx("span", { children: "Grid" })] }), _jsxs("button", { onClick: () => setShowRulers(!showRulers), style: {
                    padding: '8px 12px',
                    background: showRulers ? '#10B981' : '#475569',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease'
                }, title: "Toggle Rulers", children: [_jsx("span", { children: "\uD83D\uDCCF" }), _jsx("span", { children: "Rulers" })] }), _jsxs("button", { onClick: () => setSnapToGrid(!snapToGrid), style: {
                    padding: '8px 12px',
                    background: snapToGrid ? '#10B981' : '#475569',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease'
                }, title: "Toggle Snap to Grid", children: [_jsx("span", { children: "\uD83E\uDDF2" }), _jsx("span", { children: "Snap" })] }), _jsxs("div", { ref: scaleRef, style: { position: 'relative', zIndex: 10003 }, children: [_jsxs("button", { onClick: () => setShowScaleMenu(!showScaleMenu), style: {
                            padding: '8px 12px',
                            background: '#475569',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s ease'
                        }, title: "Scale Controls", children: [_jsx("span", { children: "\uD83D\uDD0D" }), _jsxs("span", { children: [Math.round(scale * 100), "%"] })] }), showScaleMenu && (_jsx(_Fragment, { children: _jsx("div", { style: {
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0, 0, 0, 0.7)',
                                zIndex: 99999999998,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }, onClick: () => setShowScaleMenu(false), children: _jsxs("div", { style: {
                                    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                                    border: '1px solid #334155',
                                    borderRadius: '12px',
                                    padding: '24px',
                                    minWidth: '350px',
                                    maxWidth: '90vw',
                                    maxHeight: '90vh',
                                    overflowY: 'auto',
                                    zIndex: 99999999999,
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                                    position: 'relative'
                                }, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }, children: [_jsx("h4", { style: {
                                                    margin: 0,
                                                    fontSize: '18px',
                                                    fontWeight: '600',
                                                    color: '#10B981'
                                                }, children: "Scale Settings" }), _jsx("button", { onClick: () => setShowScaleMenu(false), style: {
                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    color: '#E2E8F0',
                                                    cursor: 'pointer',
                                                    padding: '8px 12px',
                                                    fontSize: '14px',
                                                    transition: 'all 0.2s ease'
                                                }, onMouseEnter: (e) => {
                                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                                                }, onMouseLeave: (e) => {
                                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                                }, children: "\u2715 Close" })] }), _jsxs("label", { style: {
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '500',
                                            color: '#E2E8F0',
                                            fontSize: '12px'
                                        }, children: ["Scale: ", Math.round(scale * 100), "%"] }), _jsx("input", { type: "range", min: "0.1", max: "3", step: "0.1", value: scale, onChange: (e) => setScale(Number(e.target.value)), style: {
                                            width: '100%',
                                            accentColor: '#10B981'
                                        } }), _jsxs("div", { style: {
                                            display: 'flex',
                                            gap: '4px',
                                            marginTop: '8px'
                                        }, children: [_jsx("button", { onClick: () => setScale(0.5), style: {
                                                    flex: 1,
                                                    padding: '4px 8px',
                                                    background: '#6B7280',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '10px'
                                                }, children: "50%" }), _jsx("button", { onClick: () => setScale(1.0), style: {
                                                    flex: 1,
                                                    padding: '4px 8px',
                                                    background: '#10B981',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '10px'
                                                }, children: "100%" }), _jsx("button", { onClick: () => setScale(2.0), style: {
                                                    flex: 1,
                                                    padding: '4px 8px',
                                                    background: '#6B7280',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '10px'
                                                }, children: "200%" })] })] }) }) }))] }), _jsxs("div", { ref: gridRef, style: { position: 'relative', zIndex: 10003 }, children: [_jsxs("button", { onClick: () => setShowGridMenu(!showGridMenu), style: {
                            padding: '8px 12px',
                            background: '#475569',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s ease'
                        }, title: "Grid Settings", children: [_jsx("span", { children: "\u2699\uFE0F" }), _jsx("span", { children: "Settings" })] }), showGridMenu && (_jsx(_Fragment, { children: _jsx("div", { style: {
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0, 0, 0, 0.7)',
                                zIndex: 99999999998,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }, onClick: () => setShowGridMenu(false), children: _jsxs("div", { style: {
                                    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                                    border: '1px solid #334155',
                                    borderRadius: '12px',
                                    padding: '24px',
                                    minWidth: '400px',
                                    maxWidth: '90vw',
                                    maxHeight: '90vh',
                                    overflowY: 'auto',
                                    zIndex: 99999999999,
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                                    position: 'relative'
                                }, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }, children: [_jsx("h4", { style: {
                                                    margin: 0,
                                                    fontSize: '18px',
                                                    fontWeight: '600',
                                                    color: '#10B981'
                                                }, children: "Grid Settings" }), _jsx("button", { onClick: () => setShowGridMenu(false), style: {
                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    color: '#E2E8F0',
                                                    cursor: 'pointer',
                                                    padding: '8px 12px',
                                                    fontSize: '14px',
                                                    transition: 'all 0.2s ease'
                                                }, onMouseEnter: (e) => {
                                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                                                }, onMouseLeave: (e) => {
                                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                                }, children: "\u2715 Close" })] }), _jsxs("div", { style: { marginBottom: '12px' }, children: [_jsxs("label", { style: {
                                                    display: 'block',
                                                    marginBottom: '4px',
                                                    fontWeight: '500',
                                                    color: '#E2E8F0',
                                                    fontSize: '12px'
                                                }, children: ["Grid Size: ", gridSize, "px"] }), _jsx("input", { type: "range", min: "5", max: "50", step: "5", value: gridSize, onChange: (e) => setGridSize(Number(e.target.value)), style: {
                                                    width: '100%',
                                                    accentColor: '#10B981'
                                                } })] }), _jsxs("div", { style: { marginBottom: '12px' }, children: [_jsx("label", { style: {
                                                    display: 'block',
                                                    marginBottom: '4px',
                                                    fontWeight: '500',
                                                    color: '#E2E8F0',
                                                    fontSize: '12px'
                                                }, children: "Grid Color" }), _jsxs("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' }, children: [_jsx("input", { type: "color", value: gridColor, onChange: (e) => setGridColor(e.target.value), style: {
                                                            width: '30px',
                                                            height: '30px',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer'
                                                        } }), _jsx("input", { type: "range", min: "0.1", max: "1", step: "0.1", value: gridOpacity, onChange: (e) => setGridOpacity(Number(e.target.value)), style: {
                                                            flex: 1,
                                                            accentColor: '#10B981'
                                                        } }), _jsxs("span", { style: { fontSize: '10px', color: '#9CA3AF', minWidth: '30px' }, children: [Math.round(gridOpacity * 100), "%"] })] })] }), _jsxs("div", { style: { marginBottom: '12px' }, children: [_jsx("label", { style: {
                                                    display: 'block',
                                                    marginBottom: '4px',
                                                    fontWeight: '500',
                                                    color: '#E2E8F0',
                                                    fontSize: '12px'
                                                }, children: "Units" }), _jsxs("select", { value: rulerUnits, onChange: (e) => setRulerUnits(e.target.value), style: {
                                                    width: '100%',
                                                    padding: '6px',
                                                    borderRadius: '4px',
                                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                                    background: 'rgba(15, 23, 42, 0.8)',
                                                    color: '#E2E8F0',
                                                    fontSize: '12px'
                                                }, children: [_jsx("option", { value: "px", children: "Pixels (px)" }), _jsx("option", { value: "mm", children: "Millimeters (mm)" }), _jsx("option", { value: "in", children: "Inches (in)" })] })] }), _jsxs("div", { style: { marginBottom: '12px' }, children: [_jsxs("label", { style: {
                                                    display: 'block',
                                                    marginBottom: '4px',
                                                    fontWeight: '500',
                                                    color: '#E2E8F0',
                                                    fontSize: '12px'
                                                }, children: ["Snap Distance: ", snapDistance, "px"] }), _jsx("input", { type: "range", min: "1", max: "20", step: "1", value: snapDistance, onChange: (e) => setSnapDistance(Number(e.target.value)), style: {
                                                    width: '100%',
                                                    accentColor: '#10B981'
                                                } })] })] }) }) }))] })] }));
};
export function MainLayout({ children }) {
    // Console log removed
    const [showNavigation, setShowNavigation] = useState(true);
    const [showLeftPanel, setShowLeftPanel] = useState(true);
    const [showRightPanel, setShowRightPanel] = useState(true);
    const [leftWidth, setLeftWidth] = useState(300);
    const [rightWidth, setRightWidth] = useState(320);
    const [activeToolSidebar, setActiveToolSidebar] = useState(null);
    const canvasRef = React.useRef(null);
    const activeTool = useApp(s => s.activeTool);
    const setActiveTool = useApp(s => s.setActiveTool);
    const vectorMode = useApp(s => s.vectorMode);
    const setVectorMode = useApp(s => s.setVectorMode);
    const showAnchorPoints = useApp(s => s.showAnchorPoints);
    const setShowAnchorPoints = useApp(s => s.setShowAnchorPoints);
    // Vector toolbar state
    const [showVectorToolbar, setShowVectorToolbar] = useState(false);
    // Handle tool changes and sidebar switching
    useEffect(() => {
        // When a tool is selected, show its sidebar and hide others
        // Exclude basic tools and embroidery tool (handled separately)
        if (activeTool &&
            activeTool !== 'brush' &&
            activeTool !== 'eraser' &&
            activeTool !== 'fill' &&
            activeTool !== 'picker' &&
            activeTool !== 'embroidery') {
            setActiveToolSidebar(activeTool);
            setShowRightPanel(true);
        }
        else {
            setActiveToolSidebar(null);
        }
    }, [activeTool]);
    const toggleNavigation = () => {
        // Console log removed
        setShowNavigation(prev => !prev);
    };
    const toggleLeftPanel = () => {
        // Console log removed
        setShowLeftPanel(prev => !prev);
    };
    const toggleRightPanel = () => {
        // Console log removed
        setShowRightPanel(prev => !prev);
    };
    const toggleSidebars = () => {
        const next = !(showLeftPanel || showRightPanel);
        setShowLeftPanel(next);
        setShowRightPanel(next);
    };
    console.log('🏗️ MainLayout: Rendering layout', {
        showNavigation,
        showLeftPanel,
        showRightPanel,
        activeTool
    });
    return (_jsxs("div", { className: "main-layout", style: {
            display: 'flex',
            height: '100vh',
            width: '100vw',
            overflow: 'hidden',
            background: '#0F172A'
        }, children: [_jsx(VectorToolbar, { isVisible: showVectorToolbar, onClose: () => {
                    setShowVectorToolbar(false);
                    setVectorMode(false);
                } }), showNavigation && (_jsx("div", { className: "navigation-container", style: {
                    position: 'relative',
                    zIndex: 1000
                }, children: _jsx(Navigation, { active: true }) })), _jsxs("div", { className: "main-content", style: {
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    marginTop: showVectorToolbar ? '60px' : '0px',
                    transition: 'margin-top 0.3s ease'
                }, children: [!vectorMode && (_jsxs("div", { className: "toolbar-container", style: {
                            height: '60px',
                            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                            borderBottom: '1px solid #334155',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 16px',
                            gap: '16px',
                            zIndex: 10000,
                            position: 'relative'
                        }, children: [_jsxs("div", { className: "panel-toggles", style: {
                                    display: 'flex',
                                    gap: '8px',
                                    alignItems: 'center'
                                }, children: [_jsxs("button", { className: "panel-toggle", onClick: toggleSidebars, style: {
                                            padding: '8px 12px',
                                            background: showLeftPanel || showRightPanel ? '#0ea5e9' : '#475569',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            transition: 'all 0.2s ease'
                                        }, children: [_jsx("span", { children: "\uD83E\uDDF0" }), _jsx("span", { children: "Toggle Sidebars" })] }), _jsxs("button", { className: "panel-toggle", onClick: toggleNavigation, style: {
                                            padding: '8px 12px',
                                            background: showNavigation ? '#3B82F6' : '#475569',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            transition: 'all 0.2s ease'
                                        }, children: [_jsx("span", { children: "\uD83E\uDDED" }), _jsx("span", { children: "Nav" })] }), _jsxs("button", { className: "panel-toggle", onClick: toggleLeftPanel, style: {
                                            padding: '8px 12px',
                                            background: showLeftPanel ? '#10B981' : '#475569',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            transition: 'all 0.2s ease'
                                        }, children: [_jsx("span", { children: "\uD83D\uDCC1" }), _jsx("span", { children: "Files" })] }), _jsxs("button", { className: "panel-toggle", onClick: toggleRightPanel, style: {
                                            padding: '8px 12px',
                                            background: showRightPanel ? '#F59E0B' : '#475569',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            transition: 'all 0.2s ease'
                                        }, children: [_jsx("span", { children: "\u2699\uFE0F" }), _jsx("span", { children: "Tools" })] })] }), _jsxs("div", { className: "active-tool-indicator", style: {
                                    padding: '8px 16px',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                    borderRadius: '6px',
                                    color: '#3B82F6',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }, children: [_jsx("span", { children: "\uD83C\uDFAF" }), _jsxs("span", { children: ["Active: ", activeTool] })] }), _jsx(GridToolbarControls, {}), _jsx("div", { style: { flex: 1 } }), _jsxs("div", { className: "sidebar-width-controls", style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    color: '#e2e8f0'
                                }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 6 }, children: [_jsx("span", { style: { fontSize: 12 }, children: "Left" }), _jsx("input", { type: "range", min: 180, max: 600, value: leftWidth, onChange: e => setLeftWidth(parseInt(e.target.value)) }), _jsxs("span", { style: { fontSize: 12, width: 40, textAlign: 'right' }, children: [leftWidth, "px"] })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 6 }, children: [_jsx("span", { style: { fontSize: 12 }, children: "Right" }), _jsx("input", { type: "range", min: 180, max: 600, value: rightWidth, onChange: e => setRightWidth(parseInt(e.target.value)) }), _jsxs("span", { style: { fontSize: 12, width: 40, textAlign: 'right' }, children: [rightWidth, "px"] })] })] }), _jsxs("div", { className: "quick-actions", style: {
                                    display: 'flex',
                                    gap: '8px'
                                }, children: [_jsxs("button", { className: "quick-action", style: {
                                            padding: '8px 12px',
                                            background: '#EF4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            transition: 'all 0.2s ease'
                                        }, children: [_jsx("span", { children: "\u23EA" }), _jsx("span", { children: "Undo" })] }), _jsxs("button", { className: "quick-action", style: {
                                            padding: '8px 12px',
                                            background: '#10B981',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            transition: 'all 0.2s ease'
                                        }, children: [_jsx("span", { children: "\u23E9" }), _jsx("span", { children: "Redo" })] }), _jsxs("button", { className: "quick-action", style: {
                                            padding: '8px 12px',
                                            background: '#8B5CF6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            transition: 'all 0.2s ease'
                                        }, children: [_jsx("span", { children: "\uD83D\uDCBE" }), _jsx("span", { children: "Save" })] })] })] })), _jsxs("div", { style: {
                            position: 'fixed',
                            top: '10px',
                            right: '10px',
                            zIndex: 10001,
                            display: 'flex',
                            gap: '10px',
                            flexDirection: 'column'
                        }, children: [_jsxs("button", { onClick: () => {
                                    console.log('🎨 Vector Tools button clicked - toggling vectorMode');
                                    setShowVectorToolbar(!showVectorToolbar);
                                    setVectorMode(!vectorMode);
                                    console.log('🎨 Vector mode set to:', !vectorMode);
                                }, style: {
                                    background: vectorMode ? 'rgb(139, 92, 246)' : 'rgba(139, 92, 246, 0.1)',
                                    border: '1px solid rgba(139, 92, 246, 0.3)',
                                    borderRadius: '8px',
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                    backdropFilter: 'blur(10px)'
                                }, onMouseEnter: (e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
                                }, onMouseLeave: (e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                                }, title: vectorMode ? "Exit Vector Mode" : "Enter Vector Mode", children: [_jsx("span", { style: { fontSize: '18px' }, children: "\uD83C\uDFA8" }), _jsx("span", { children: vectorMode ? 'Exit Vector' : 'Vector Tools' })] }), _jsxs("button", { onClick: () => {
                                    console.log('🎯 Anchor Points toggle clicked - toggling showAnchorPoints');
                                    setShowAnchorPoints(!showAnchorPoints);
                                    console.log('🎯 Show anchor points set to:', !showAnchorPoints);
                                }, style: {
                                    background: showAnchorPoints ? 'rgb(34, 197, 94)' : 'rgba(34, 197, 94, 0.1)',
                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                    borderRadius: '8px',
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                    backdropFilter: 'blur(10px)'
                                }, onMouseEnter: (e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.4)';
                                }, onMouseLeave: (e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                                }, title: showAnchorPoints ? "Hide Anchor Points" : "Show Anchor Points", children: [_jsx("span", { style: { fontSize: '18px' }, children: "\uD83C\uDFAF" }), _jsx("span", { children: showAnchorPoints ? 'Hide Anchors' : 'Show Anchors' })] })] }), _jsxs("div", { className: "workspace", style: {
                            flex: 1,
                            display: 'flex',
                            minHeight: 0
                        }, children: [showLeftPanel && (_jsx("div", { className: "left-panel-container", style: {
                                    width: `${leftWidth}px`,
                                    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                                    borderRight: '1px solid #334155',
                                    overflowY: 'auto'
                                }, children: _jsx(LeftPanel, {}) })), _jsxs("div", { className: "canvas-area", style: {
                                    flex: 1,
                                    position: 'relative',
                                    background: '#0F172A',
                                    overflow: 'hidden',
                                    zIndex: 0
                                }, children: [children, _jsx(GridOverlay, { canvasRef: canvasRef })] }), showRightPanel && (_jsx("div", { className: "right-panel-container", style: {
                                    width: `${rightWidth}px`,
                                    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                                    borderLeft: '1px solid #334155',
                                    overflowY: 'auto'
                                }, children: _jsx(RightPanel, { activeToolSidebar: activeToolSidebar }) }))] })] }), _jsx(EmbroiderySidebar, { active: activeTool === 'embroidery' })] }));
}
