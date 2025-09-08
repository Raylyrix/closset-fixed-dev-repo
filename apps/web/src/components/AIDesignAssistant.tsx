import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../App';
import { aiService, AISuggestion, AITrendAnalysis, ColorHarmony } from '../services/aiService';

interface AIDesignAssistantProps {
  active: boolean;
}

export function AIDesignAssistant({ active }: AIDesignAssistantProps) {
  // Console log removed

  const {
    composedCanvas,
    activeTool,
    brushColor,
    brushSize,
    layers,
    activeLayerId,
    textElements,
    decals,
    commit
  } = useApp();

  // AI state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [currentTrends, setCurrentTrends] = useState<AITrendAnalysis[]>([]);
  const [colorHarmony, setColorHarmony] = useState<ColorHarmony[]>([]);
  const [aiMode, setAiMode] = useState<'suggest' | 'analyze' | 'generate' | 'optimize'>('suggest');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // AI settings
  const [aiEnabled, setAiEnabled] = useState(true);
  const [suggestionLevel, setSuggestionLevel] = useState<'basic' | 'advanced' | 'expert'>('advanced');
  const [autoSuggest, setAutoSuggest] = useState(true);
  const [trendAnalysis, setTrendAnalysis] = useState(true);
  const [styleConsistency, setStyleConsistency] = useState(true);

  // Refs
  const analysisCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Real API integration functions
  const loadTrends = useCallback(async () => {
    if (!aiEnabled) return;
    
    try {
      setIsAnalyzing(true);
      setError(null);
      const trends = await aiService.getTrendAnalysis();
      setCurrentTrends(trends);
      // Console log removed
    } catch (err) {
      console.error('🤖 AIDesignAssistant: Error loading trends', err);
      setError('Failed to load trend analysis. Using fallback data.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [aiEnabled]);

  const loadSuggestions = useCallback(async () => {
    if (!aiEnabled) return;
    
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
    } catch (err) {
      console.error('🤖 AIDesignAssistant: Error loading suggestions', err);
      setError('Failed to load design suggestions. Using fallback data.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [aiEnabled, activeTool, brushColor, layers]);

  const loadColorHarmony = useCallback(async () => {
    if (!aiEnabled || !brushColor) return;
    
    try {
      setIsAnalyzing(true);
      setError(null);
      const harmony = await aiService.getColorHarmony(brushColor);
      setColorHarmony(harmony);
      // Console log removed
    } catch (err) {
      console.error('🤖 AIDesignAssistant: Error loading color harmony', err);
      setError('Failed to load color harmony. Using fallback data.');
    } finally {
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

  const handleSuggestionApply = useCallback((suggestion: AISuggestion) => {
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

  const handleTrendApply = useCallback((trend: AITrendAnalysis) => {
    // Console log removed
    
    // Apply trend colors
    if (trend.examples && trend.examples.length > 0) {
      // Console log removed
    }
  }, []);

  const handleColorHarmonyApply = useCallback((harmony: ColorHarmony) => {
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
      
    } catch (err) {
      console.error('🤖 AIDesignAssistant: Error analyzing design', err);
      setError('Failed to analyze design. Please try again.');
    } finally {
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
      
    } catch (err) {
      console.error('🤖 AIDesignAssistant: Error generating design', err);
      setError('Failed to generate design. Please try again.');
    } finally {
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
      
    } catch (err) {
      console.error('🤖 AIDesignAssistant: Error optimizing for print', err);
      setError('Failed to optimize for print. Please try again.');
    } finally {
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

  return (
    <div className="ai-design-assistant">
      <div className="assistant-header">
        <h4 style={{ margin: 0, color: '#06B6D4', fontSize: '18px' }}>
          🤖 AI Design Assistant
        </h4>
        <div className="tool-controls">
          <button
            onClick={analyzeDesign}
            disabled={isAnalyzing}
            style={{
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
            }}
          >
            {isAnalyzing ? '⏳' : '🔍'} {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </button>
          <button
            onClick={generateDesign}
            disabled={isAnalyzing}
            style={{
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
            }}
          >
            {isAnalyzing ? '⏳' : '✨'} {isAnalyzing ? 'Generating...' : 'Generate'}
          </button>
          <button
            onClick={() => useApp.getState().setTool('brush')}
            style={{
              padding: '6px 12px',
              background: '#EF4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
            title="Close AI Assistant"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          padding: '8px 12px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '6px',
          color: '#FCA5A5',
          fontSize: '12px',
          marginBottom: '16px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* AI Mode Selection */}
      <div className="ai-modes" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#06B6D4', marginBottom: '8px' }}>
          AI Mode
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '6px'
        }}>
          {[
            { id: 'suggest', name: 'Suggest', icon: '💡' },
            { id: 'analyze', name: 'Analyze', icon: '🔍' },
            { id: 'generate', name: 'Generate', icon: '✨' },
            { id: 'optimize', name: 'Optimize', icon: '⚡' }
          ].map(mode => (
            <button
              key={mode.id}
              className={`mode-btn ${aiMode === mode.id ? 'active' : ''}`}
              onClick={() => setAiMode(mode.id as any)}
              style={{
                padding: '6px',
                background: aiMode === mode.id ? '#06B6D4' : 'rgba(6, 182, 212, 0.2)',
                color: aiMode === mode.id ? '#FFFFFF' : '#67E8F9',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                borderRadius: '4px',
                fontSize: '10px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '14px', marginBottom: '2px' }}>{mode.icon}</div>
              <div>{mode.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* AI Settings */}
      <div className="ai-settings" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#06B6D4', marginBottom: '8px' }}>
          AI Settings
        </div>
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#D1D5DB' }}>
            <input
              type="checkbox"
              checked={aiEnabled}
              onChange={(e) => setAiEnabled(e.target.checked)}
            />
            AI Enabled
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#D1D5DB' }}>
            <input
              type="checkbox"
              checked={autoSuggest}
              onChange={(e) => setAutoSuggest(e.target.checked)}
            />
            Auto Suggest
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#D1D5DB' }}>
            <input
              type="checkbox"
              checked={trendAnalysis}
              onChange={(e) => setTrendAnalysis(e.target.checked)}
            />
            Trend Analysis
          </label>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="suggestions" style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#06B6D4', marginBottom: '8px' }}>
            AI Suggestions ({suggestions.length})
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {suggestions.map(suggestion => (
              <div
                key={suggestion.id}
                style={{
                  padding: '8px',
                  background: 'rgba(6, 182, 212, 0.1)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => handleSuggestionApply(suggestion)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(6, 182, 212, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)';
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '4px'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#06B6D4' }}>
                    {suggestion.title}
                  </div>
                  <div style={{ fontSize: '10px', color: '#67E8F9' }}>
                    {Math.round(suggestion.confidence * 100)}%
                  </div>
                </div>
                <div style={{ fontSize: '10px', color: '#D1D5DB', marginBottom: '4px' }}>
                  {suggestion.description}
                </div>
                {suggestion.reasoning && (
                  <div style={{ fontSize: '9px', color: '#9CA3AF', fontStyle: 'italic' }}>
                    {suggestion.reasoning}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trends */}
      {currentTrends.length > 0 && trendAnalysis && (
        <div className="trends" style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#06B6D4', marginBottom: '8px' }}>
            Current Trends ({currentTrends.length})
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            maxHeight: '150px',
            overflowY: 'auto'
          }}>
            {currentTrends.map(trend => (
              <div
                key={trend.id}
                style={{
                  padding: '6px',
                  background: 'rgba(6, 182, 212, 0.1)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => handleTrendApply(trend)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(6, 182, 212, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)';
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '2px'
                }}>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#06B6D4' }}>
                    {trend.trend}
                  </div>
                  <div style={{ fontSize: '9px', color: '#67E8F9' }}>
                    {Math.round(trend.popularity * 100)}%
                  </div>
                </div>
                <div style={{ fontSize: '9px', color: '#D1D5DB' }}>
                  {trend.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Color Harmony */}
      {colorHarmony.length > 0 && (
        <div className="color-harmony" style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#06B6D4', marginBottom: '8px' }}>
            Color Harmony ({colorHarmony.length})
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            maxHeight: '150px',
            overflowY: 'auto'
          }}>
            {colorHarmony.map(harmony => (
              <div
                key={harmony.id}
                style={{
                  padding: '6px',
                  background: 'rgba(6, 182, 212, 0.1)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => handleColorHarmonyApply(harmony)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(6, 182, 212, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)';
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '4px'
                }}>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#06B6D4' }}>
                    {harmony.type.charAt(0).toUpperCase() + harmony.type.slice(1)}
                  </div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {harmony.colors.slice(0, 5).map((color, index) => (
                      <div
                        key={index}
                        style={{
                          width: '12px',
                          height: '12px',
                          background: color,
                          borderRadius: '2px',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: '9px', color: '#D1D5DB' }}>
                  {harmony.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Result */}
      {analysisResult && (
        <div className="analysis-result" style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#06B6D4', marginBottom: '8px' }}>
            Analysis Result
          </div>
          <div style={{
            padding: '8px',
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: '6px',
            fontSize: '11px',
            color: '#D1D5DB'
          }}>
            {analysisResult.type === 'print_optimization' ? (
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Print Optimization:</div>
                <ul style={{ margin: 0, paddingLeft: '16px' }}>
                  {analysisResult.recommendations.map((rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div>Analysis completed. Check suggestions above for recommendations.</div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#06B6D4', marginBottom: '8px' }}>
          Quick Actions
        </div>
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={loadSuggestions}
            disabled={isAnalyzing}
            style={{
              padding: '6px 12px',
              background: isAnalyzing ? '#6B7280' : '#8B5CF6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '10px',
              cursor: isAnalyzing ? 'not-allowed' : 'pointer'
            }}
          >
            🔄 Refresh
          </button>
          <button
            onClick={optimizeForPrint}
            disabled={isAnalyzing}
            style={{
              padding: '6px 12px',
              background: isAnalyzing ? '#6B7280' : '#F59E0B',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '10px',
              cursor: isAnalyzing ? 'not-allowed' : 'pointer'
            }}
          >
            🖨️ Print
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="status" style={{
        fontSize: '10px',
        color: '#6B7280',
        textAlign: 'center',
        padding: '8px',
        background: 'rgba(6, 182, 212, 0.05)',
        borderRadius: '4px'
      }}>
        {isAnalyzing ? 'AI is analyzing your design...' : 
         error ? 'AI service temporarily unavailable' :
         'AI Assistant ready - Powered by Gemini Flash'}
      </div>
    </div>
  );
}
