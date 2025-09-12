import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../App';
import { aiService } from '../services/aiService';
export function AIDesignAssistant({ active }) {
    // Console log removed
    const { composedCanvas, activeTool, brushColor, brushSize, layers, activeLayerId, textElements, decals, commit } = useApp();
    // AI state
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [currentTrends, setCurrentTrends] = useState([]);
    const [colorHarmony, setColorHarmony] = useState([]);
    const [aiMode, setAiMode] = useState('suggest');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState(null);
    // AI settings
    const [aiEnabled, setAiEnabled] = useState(true);
    const [suggestionLevel, setSuggestionLevel] = useState('advanced');
    const [autoSuggest, setAutoSuggest] = useState(true);
    const [trendAnalysis, setTrendAnalysis] = useState(true);
    const [styleConsistency, setStyleConsistency] = useState(true);
    // Refs
    const analysisCanvasRef = useRef(null);
    const previewCanvasRef = useRef(null);
    // Real API integration functions
    const loadTrends = useCallback(async () => {
        if (!aiEnabled)
            return;
        try {
            setIsAnalyzing(true);
            setError(null);
            const trends = await aiService.getTrendAnalysis();
            setCurrentTrends(trends);
            // Console log removed
        }
        catch (err) {
            console.error('🤖 AIDesignAssistant: Error loading trends', err);
            setError('Failed to load trend analysis. Using fallback data.');
        }
        finally {
            setIsAnalyzing(false);
        }
    }, [aiEnabled]);
    const loadSuggestions = useCallback(async () => {
        if (!aiEnabled)
            return;
        try {
            setIsAnalyzing(true);
            setError(null);
            const currentDesign = {
                tool: activeTool,
                colors: [brushColor],
                style: 'modern',
                elements: layers.map(l => l.name)
            };
            const suggestions = await aiService.getDesignSuggestions(currentDesign);
            setSuggestions(suggestions);
            // Console log removed
        }
        catch (err) {
            console.error('🤖 AIDesignAssistant: Error loading suggestions', err);
            setError('Failed to load design suggestions. Using fallback data.');
        }
        finally {
            setIsAnalyzing(false);
        }
    }, [aiEnabled, activeTool, brushColor, layers]);
    const loadColorHarmony = useCallback(async () => {
        if (!aiEnabled || !brushColor)
            return;
        try {
            setIsAnalyzing(true);
            setError(null);
            const harmony = await aiService.getColorHarmony(brushColor);
            setColorHarmony(harmony);
            // Console log removed
        }
        catch (err) {
            console.error('🤖 AIDesignAssistant: Error loading color harmony', err);
            setError('Failed to load color harmony. Using fallback data.');
        }
        finally {
            setIsAnalyzing(false);
        }
    }, [aiEnabled, brushColor]);
    // Initialize AI data
    useEffect(() => {
        if (active && aiEnabled) {
            // Console log removed
            loadTrends();
            loadSuggestions();
            loadColorHarmony();
        }
    }, [active, aiEnabled, loadTrends, loadSuggestions, loadColorHarmony]);
    // Auto-suggest when design changes
    useEffect(() => {
        if (autoSuggest && aiEnabled) {
            const timeoutId = setTimeout(() => {
                loadSuggestions();
                loadColorHarmony();
            }, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [autoSuggest, aiEnabled, activeTool, brushColor, layers, loadSuggestions, loadColorHarmony]);
    const handleSuggestionApply = useCallback((suggestion) => {
        // Console log removed
        switch (suggestion.type) {
            case 'color':
                // Apply color suggestion
                if (suggestion.implementation) {
                    // Console log removed
                }
                break;
            case 'pattern':
                // Apply pattern suggestion
                // Console log removed
                break;
            case 'style':
                // Apply style suggestion
                // Console log removed
                break;
            case 'composition':
                // Apply composition suggestion
                // Console log removed
                break;
        }
    }, []);
    const handleTrendApply = useCallback((trend) => {
        // Console log removed
        // Apply trend colors
        if (trend.examples && trend.examples.length > 0) {
            // Console log removed
        }
    }, []);
    const handleColorHarmonyApply = useCallback((harmony) => {
        // Console log removed
        // Apply color harmony
        if (harmony.colors && harmony.colors.length > 0) {
            // Console log removed
        }
    }, []);
    const analyzeDesign = useCallback(async () => {
        // Console log removed
        try {
            setIsAnalyzing(true);
            setError(null);
            // Get current design data
            const designData = {
                tool: activeTool,
                colors: [brushColor],
                layers: layers.length,
                textElements: textElements.length,
                decals: decals.length,
                timestamp: Date.now()
            };
            // Analyze design
            const analysis = await aiService.getDesignSuggestions(designData);
            setAnalysisResult(analysis);
        }
        catch (err) {
            console.error('🤖 AIDesignAssistant: Error analyzing design', err);
            setError('Failed to analyze design. Please try again.');
        }
        finally {
            setIsAnalyzing(false);
        }
    }, [activeTool, brushColor, layers, textElements, decals]);
    const generateDesign = useCallback(async () => {
        // Console log removed
        try {
            setIsAnalyzing(true);
            setError(null);
            // Generate new design based on current context
            const designData = {
                tool: activeTool,
                colors: [brushColor],
                style: 'modern',
                elements: layers.map(l => l.name)
            };
            const suggestions = await aiService.getDesignSuggestions(designData);
            setSuggestions(suggestions);
        }
        catch (err) {
            console.error('🤖 AIDesignAssistant: Error generating design', err);
            setError('Failed to generate design. Please try again.');
        }
        finally {
            setIsAnalyzing(false);
        }
    }, [activeTool, brushColor, layers]);
    const optimizeForPrint = useCallback(async () => {
        // Console log removed
        try {
            setIsAnalyzing(true);
            setError(null);
            const designData = {
                tool: activeTool,
                colors: [brushColor],
                layers: layers.length,
                resolution: 300,
                format: 'print'
            };
            const optimization = await aiService.optimizeDesignForPrint(designData);
            setAnalysisResult({ type: 'print_optimization', recommendations: optimization });
        }
        catch (err) {
            console.error('🤖 AIDesignAssistant: Error optimizing for print', err);
            setError('Failed to optimize for print. Please try again.');
        }
        finally {
            setIsAnalyzing(false);
        }
    }, [activeTool, brushColor, layers]);
    if (!active) {
        // Console log removed
        return null;
    }
    console.log('🤖 AIDesignAssistant: Rendering component', {
        aiMode,
        isAnalyzing,
        suggestionsCount: suggestions.length,
        trendsCount: currentTrends.length,
        colorHarmonyCount: colorHarmony.length,
        error
    });
    return (_jsxs("div", { className: "ai-design-assistant", children: [_jsxs("div", { className: "assistant-header", children: [_jsx("h4", { style: { margin: 0, color: '#06B6D4', fontSize: '18px' }, children: "\uD83E\uDD16 AI Design Assistant" }), _jsxs("div", { className: "tool-controls", children: [_jsxs("button", { onClick: analyzeDesign, disabled: isAnalyzing, style: {
                                    padding: '6px 12px',
                                    background: isAnalyzing ? '#6B7280' : '#06B6D4',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }, children: [isAnalyzing ? '⏳' : '🔍', " ", isAnalyzing ? 'Analyzing...' : 'Analyze'] }), _jsxs("button", { onClick: generateDesign, disabled: isAnalyzing, style: {
                                    padding: '6px 12px',
                                    background: isAnalyzing ? '#6B7280' : '#10B981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }, children: [isAnalyzing ? '⏳' : '✨', " ", isAnalyzing ? 'Generating...' : 'Generate'] }), _jsx("button", { onClick: () => useApp.getState().setTool('brush'), style: {
                                    padding: '6px 12px',
                                    background: '#EF4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                }, title: "Close AI Assistant", children: "\u2715 Close" })] })] }), error && (_jsxs("div", { style: {
                    padding: '8px 12px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '6px',
                    color: '#FCA5A5',
                    fontSize: '12px',
                    marginBottom: '16px'
                }, children: ["\u26A0\uFE0F ", error] })), _jsxs("div", { className: "ai-modes", style: { marginBottom: '16px' }, children: [_jsx("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#06B6D4', marginBottom: '8px' }, children: "AI Mode" }), _jsx("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '6px'
                        }, children: [
                            { id: 'suggest', name: 'Suggest', icon: '💡' },
                            { id: 'analyze', name: 'Analyze', icon: '🔍' },
                            { id: 'generate', name: 'Generate', icon: '✨' },
                            { id: 'optimize', name: 'Optimize', icon: '⚡' }
                        ].map(mode => (_jsxs("button", { className: `mode-btn ${aiMode === mode.id ? 'active' : ''}`, onClick: () => setAiMode(mode.id), style: {
                                padding: '6px',
                                background: aiMode === mode.id ? '#06B6D4' : 'rgba(6, 182, 212, 0.2)',
                                color: aiMode === mode.id ? '#FFFFFF' : '#67E8F9',
                                border: '1px solid rgba(6, 182, 212, 0.3)',
                                borderRadius: '4px',
                                fontSize: '10px',
                                cursor: 'pointer',
                                textAlign: 'center',
                                transition: 'all 0.2s ease'
                            }, children: [_jsx("div", { style: { fontSize: '14px', marginBottom: '2px' }, children: mode.icon }), _jsx("div", { children: mode.name })] }, mode.id))) })] }), _jsxs("div", { className: "ai-settings", style: { marginBottom: '16px' }, children: [_jsx("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#06B6D4', marginBottom: '8px' }, children: "AI Settings" }), _jsxs("div", { style: {
                            display: 'flex',
                            gap: '12px',
                            flexWrap: 'wrap'
                        }, children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#D1D5DB' }, children: [_jsx("input", { type: "checkbox", checked: aiEnabled, onChange: (e) => setAiEnabled(e.target.checked) }), "AI Enabled"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#D1D5DB' }, children: [_jsx("input", { type: "checkbox", checked: autoSuggest, onChange: (e) => setAutoSuggest(e.target.checked) }), "Auto Suggest"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#D1D5DB' }, children: [_jsx("input", { type: "checkbox", checked: trendAnalysis, onChange: (e) => setTrendAnalysis(e.target.checked) }), "Trend Analysis"] })] })] }), suggestions.length > 0 && (_jsxs("div", { className: "suggestions", style: { marginBottom: '16px' }, children: [_jsxs("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#06B6D4', marginBottom: '8px' }, children: ["AI Suggestions (", suggestions.length, ")"] }), _jsx("div", { style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            maxHeight: '200px',
                            overflowY: 'auto'
                        }, children: suggestions.map(suggestion => (_jsxs("div", { style: {
                                padding: '8px',
                                background: 'rgba(6, 182, 212, 0.1)',
                                border: '1px solid rgba(6, 182, 212, 0.3)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }, onClick: () => handleSuggestionApply(suggestion), onMouseEnter: (e) => {
                                e.currentTarget.style.background = 'rgba(6, 182, 212, 0.2)';
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)';
                            }, children: [_jsxs("div", { style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '4px'
                                    }, children: [_jsx("div", { style: { fontSize: '11px', fontWeight: 'bold', color: '#06B6D4' }, children: suggestion.title }), _jsxs("div", { style: { fontSize: '10px', color: '#67E8F9' }, children: [Math.round(suggestion.confidence * 100), "%"] })] }), _jsx("div", { style: { fontSize: '10px', color: '#D1D5DB', marginBottom: '4px' }, children: suggestion.description }), suggestion.reasoning && (_jsx("div", { style: { fontSize: '9px', color: '#9CA3AF', fontStyle: 'italic' }, children: suggestion.reasoning }))] }, suggestion.id))) })] })), currentTrends.length > 0 && trendAnalysis && (_jsxs("div", { className: "trends", style: { marginBottom: '16px' }, children: [_jsxs("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#06B6D4', marginBottom: '8px' }, children: ["Current Trends (", currentTrends.length, ")"] }), _jsx("div", { style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            maxHeight: '150px',
                            overflowY: 'auto'
                        }, children: currentTrends.map(trend => (_jsxs("div", { style: {
                                padding: '6px',
                                background: 'rgba(6, 182, 212, 0.1)',
                                border: '1px solid rgba(6, 182, 212, 0.3)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }, onClick: () => handleTrendApply(trend), onMouseEnter: (e) => {
                                e.currentTarget.style.background = 'rgba(6, 182, 212, 0.2)';
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)';
                            }, children: [_jsxs("div", { style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '2px'
                                    }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold', color: '#06B6D4' }, children: trend.trend }), _jsxs("div", { style: { fontSize: '9px', color: '#67E8F9' }, children: [Math.round(trend.popularity * 100), "%"] })] }), _jsx("div", { style: { fontSize: '9px', color: '#D1D5DB' }, children: trend.description })] }, trend.id))) })] })), colorHarmony.length > 0 && (_jsxs("div", { className: "color-harmony", style: { marginBottom: '16px' }, children: [_jsxs("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#06B6D4', marginBottom: '8px' }, children: ["Color Harmony (", colorHarmony.length, ")"] }), _jsx("div", { style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            maxHeight: '150px',
                            overflowY: 'auto'
                        }, children: colorHarmony.map(harmony => (_jsxs("div", { style: {
                                padding: '6px',
                                background: 'rgba(6, 182, 212, 0.1)',
                                border: '1px solid rgba(6, 182, 212, 0.3)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }, onClick: () => handleColorHarmonyApply(harmony), onMouseEnter: (e) => {
                                e.currentTarget.style.background = 'rgba(6, 182, 212, 0.2)';
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)';
                            }, children: [_jsxs("div", { style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '4px'
                                    }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold', color: '#06B6D4' }, children: harmony.type.charAt(0).toUpperCase() + harmony.type.slice(1) }), _jsx("div", { style: { display: 'flex', gap: '2px' }, children: harmony.colors.slice(0, 5).map((color, index) => (_jsx("div", { style: {
                                                    width: '12px',
                                                    height: '12px',
                                                    background: color,
                                                    borderRadius: '2px',
                                                    border: '1px solid rgba(255, 255, 255, 0.3)'
                                                } }, index))) })] }), _jsx("div", { style: { fontSize: '9px', color: '#D1D5DB' }, children: harmony.description })] }, harmony.id))) })] })), analysisResult && (_jsxs("div", { className: "analysis-result", style: { marginBottom: '16px' }, children: [_jsx("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#06B6D4', marginBottom: '8px' }, children: "Analysis Result" }), _jsx("div", { style: {
                            padding: '8px',
                            background: 'rgba(6, 182, 212, 0.1)',
                            border: '1px solid rgba(6, 182, 212, 0.3)',
                            borderRadius: '6px',
                            fontSize: '11px',
                            color: '#D1D5DB'
                        }, children: analysisResult.type === 'print_optimization' ? (_jsxs("div", { children: [_jsx("div", { style: { fontWeight: 'bold', marginBottom: '4px' }, children: "Print Optimization:" }), _jsx("ul", { style: { margin: 0, paddingLeft: '16px' }, children: analysisResult.recommendations.map((rec, index) => (_jsx("li", { children: rec }, index))) })] })) : (_jsx("div", { children: "Analysis completed. Check suggestions above for recommendations." })) })] })), _jsxs("div", { className: "quick-actions", style: { marginBottom: '16px' }, children: [_jsx("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#06B6D4', marginBottom: '8px' }, children: "Quick Actions" }), _jsxs("div", { style: {
                            display: 'flex',
                            gap: '8px',
                            flexWrap: 'wrap'
                        }, children: [_jsx("button", { onClick: loadSuggestions, disabled: isAnalyzing, style: {
                                    padding: '6px 12px',
                                    background: isAnalyzing ? '#6B7280' : '#8B5CF6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    cursor: isAnalyzing ? 'not-allowed' : 'pointer'
                                }, children: "\uD83D\uDD04 Refresh" }), _jsx("button", { onClick: optimizeForPrint, disabled: isAnalyzing, style: {
                                    padding: '6px 12px',
                                    background: isAnalyzing ? '#6B7280' : '#F59E0B',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    cursor: isAnalyzing ? 'not-allowed' : 'pointer'
                                }, children: "\uD83D\uDDA8\uFE0F Print" })] })] }), _jsx("div", { className: "status", style: {
                    fontSize: '10px',
                    color: '#6B7280',
                    textAlign: 'center',
                    padding: '8px',
                    background: 'rgba(6, 182, 212, 0.05)',
                    borderRadius: '4px'
                }, children: isAnalyzing ? 'AI is analyzing your design...' :
                    error ? 'AI service temporarily unavailable' :
                        'AI Assistant ready - Powered by Gemini Flash' })] }));
}
