import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { useApp } from '../App';
import { useLayerManager } from '../stores/LayerManager';
import { layerIntegration } from '../services/LayerIntegration';

interface RightPanelCompactProps {
  activeToolSidebar?: string | null;
}

export function RightPanelCompact({ activeToolSidebar }: RightPanelCompactProps) {
  const {
    brushColor,
    brushSize,
    brushOpacity,
    brushHardness,
    brushFlow,
    brushShape,
    brushSpacing,
    blendMode,
    symmetryX,
    symmetryY,
    symmetryZ,
    activeTool,
    setBrushColor,
    setBrushSize,
    setBrushOpacity,
    setBrushHardness,
    setBrushShape,
    setBrushSpacing,
    setBlendMode,
    setBrushSymmetry,
    setSymmetryX,
    setSymmetryY,
    setSymmetryZ,
    // Embroidery settings
    embroideryStitchType,
    embroideryThreadColor,
    embroideryThreadThickness,
    embroiderySpacing,
    embroideryDensity,
    embroideryPattern,
    setEmbroideryStitchType,
    setEmbroideryThreadColor,
    setEmbroideryThreadThickness,
    setEmbroiderySpacing,
    setEmbroideryDensity,
    setEmbroideryPattern,
    // Puff print settings
    puffHeight,
    puffSoftness,
    puffOpacity,
    puffColor,
    setPuffHeight,
    setPuffSoftness,
    setPuffOpacity,
    setPuffColor,
    // Text settings
    textSize,
    textFont,
    textColor,
    textBold,
    textItalic,
    textAlign,
    setTextSize,
    setTextFont,
    setTextColor,
    setTextBold,
    setTextItalic,
    setTextAlign,
    // Shape settings
    shapeElements,
    activeShapeId,
    setActiveShapeId,
    updateShapeElement,
    deleteShapeElement,
    duplicateShapeElement,
    // Image settings
    importedImages,
    selectedImageId,
    setSelectedImageId,
    updateImportedImage,
    removeImportedImage
  } = useApp();

  const [activeTab, setActiveTab] = React.useState('brush');
  const [userSelectedTab, setUserSelectedTab] = React.useState(false); // Track if user manually selected a tab
  const [fontUpdateTrigger, setFontUpdateTrigger] = React.useState(0); // Trigger re-render when fonts are loaded
  
  // Color/Gradient mode states for each tool
  const [brushColorMode, setBrushColorMode] = React.useState<'solid' | 'gradient'>('solid');
  const [puffColorMode, setPuffColorMode] = React.useState<'solid' | 'gradient'>('solid');
  const [embroideryColorMode, setEmbroideryColorMode] = React.useState<'solid' | 'gradient'>('solid');
  const [textColorMode, setTextColorMode] = React.useState<'solid' | 'gradient'>('solid');
  const [shapesColorMode, setShapesColorMode] = React.useState<'solid' | 'gradient'>('solid');

  // State to force re-render when Google Fonts are loaded
  const [googleFontsLoaded, setGoogleFontsLoaded] = React.useState(0);

  // Get active shape for editing
  const activeShape = activeShapeId ? shapeElements.find(s => s.id === activeShapeId) : null;

  // Listen for Google Font loaded events
  React.useEffect(() => {
    const handleGoogleFontLoaded = () => {
      setGoogleFontsLoaded(prev => prev + 1);
    };
    
    window.addEventListener('googleFontLoaded', handleGoogleFontLoaded);
    return () => window.removeEventListener('googleFontLoaded', handleGoogleFontLoaded);
  }, []);

  // Function to analyze font characteristics from text content
  const analyzeFontFromText = (text: string) => {
    if (!text || text.trim().length === 0) return {};
    
    const cleanText = text.trim();
    const hasUpperCase = /[A-Z]/.test(cleanText);
    const hasNumbers = /\d/.test(cleanText);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(cleanText);
    const hasPunctuation = /[.,!?;:]/.test(cleanText);
    
    // Estimate font size based on text length and characteristics
    let estimatedFontSize = 24; // Default
    
    if (cleanText.length <= 5) {
      estimatedFontSize = 48; // Large for short text (likely titles)
    } else if (cleanText.length <= 20) {
      estimatedFontSize = 36; // Medium-large for medium text
    } else if (cleanText.length <= 50) {
      estimatedFontSize = 24; // Normal for regular text
    } else {
      estimatedFontSize = 18; // Smaller for long text
    }
    
    // Estimate font family based on character patterns
    let estimatedFontFamily = 'Arial'; // Default
    
    if (hasNumbers && hasSpecialChars) {
      estimatedFontFamily = 'Courier New'; // Monospace for technical/code text
    } else if (hasUpperCase && !hasNumbers && cleanText.length < 20) {
      estimatedFontFamily = 'Impact'; // Bold display font for short uppercase text
    } else if (hasPunctuation && cleanText.length > 30) {
      estimatedFontFamily = 'Times New Roman'; // Serif for formal/long text
    } else if (cleanText.length > 50) {
      estimatedFontFamily = 'Georgia'; // Serif for very long text
    } else if (cleanText.length <= 10) {
      estimatedFontFamily = 'Helvetica'; // Clean sans-serif for short text
    } else {
      estimatedFontFamily = 'Arial'; // Default sans-serif
    }
    
    // Estimate bold based on text characteristics
    const isBold = cleanText.length <= 15 && hasUpperCase && !hasNumbers;
    
    // Estimate italic based on text patterns
    const isItalic = cleanText.includes('i') && cleanText.length < 20;
    
    // Estimate color based on content
    let estimatedColor = '#000000'; // Default black
    if (hasNumbers && hasSpecialChars) {
      estimatedColor = '#0066CC'; // Blue for technical text
    } else if (cleanText.length <= 10) {
      estimatedColor = '#CC0000'; // Red for short/important text
    }
    
    // Estimate alignment
    let textAlign = 'left';
    if (cleanText.length <= 15) {
      textAlign = 'center'; // Center short text
    }
    
    return {
      fontFamily: estimatedFontFamily,
      fontSize: estimatedFontSize,
      bold: isBold,
      italic: isItalic,
      color: estimatedColor,
      textAlign: textAlign
    };
  };

  // Gradient states for each tool
  type ColorStop = { color: string; position: number; id: string };
  
  const [brushGradient, setBrushGradient] = React.useState({
    type: 'linear' as 'linear' | 'radial' | 'angular' | 'diamond',
    angle: 45,
    stops: [
      { id: '1', color: '#ff0000', position: 0 },
      { id: '2', color: '#0000ff', position: 100 }
    ] as ColorStop[]
  });

  const [puffGradient, setPuffGradient] = React.useState({
    type: 'linear' as 'linear' | 'radial' | 'angular' | 'diamond',
    angle: 90,
    stops: [
      { id: '1', color: '#ffffff', position: 0 },
      { id: '2', color: '#ff69b4', position: 100 }
    ] as ColorStop[]
  });

  const [embroideryGradient, setEmbroideryGradient] = React.useState({
    type: 'linear' as 'linear' | 'radial' | 'angular' | 'diamond',
    angle: 135,
    stops: [
      { id: '1', color: '#ffd700', position: 0 },
      { id: '2', color: '#ff4500', position: 100 }
    ] as ColorStop[]
  });

  const [textGradient, setTextGradient] = React.useState({
    type: 'linear' as 'linear' | 'radial' | 'angular' | 'diamond',
    angle: 0,
    stops: [
      { id: '1', color: '#ff6b6b', position: 0 },
      { id: '2', color: '#4ecdc4', position: 100 }
    ] as ColorStop[]
  });

  const [shapesGradient, setShapesGradient] = React.useState({
    type: 'linear' as 'linear' | 'radial' | 'angular' | 'diamond',
    angle: 45,
    stops: [
      { id: '1', color: '#00ff00', position: 0 },
      { id: '2', color: '#ff00ff', position: 100 }
    ] as ColorStop[]
  });

  // Helper function to generate gradient CSS
  const getGradientCSS = (gradient: typeof brushGradient) => {
    const sortedStops = [...gradient.stops].sort((a, b) => a.position - b.position);
    const stopsStr = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ');
    
    if (gradient.type === 'linear') {
      return `linear-gradient(${gradient.angle}deg, ${stopsStr})`;
    } else if (gradient.type === 'radial') {
      return `radial-gradient(circle, ${stopsStr})`;
    }
    return `linear-gradient(${gradient.angle}deg, ${stopsStr})`;
  };

  // Listen for Google Font loaded events
  React.useEffect(() => {
    const handleFontLoaded = () => {
      setFontUpdateTrigger(prev => prev + 1);
    };
    window.addEventListener('googleFontLoaded', handleFontLoaded);
    return () => window.removeEventListener('googleFontLoaded', handleFontLoaded);
  }, []);

  // Expose gradient data globally for painting logic
  React.useEffect(() => {
    (window as any).getGradientSettings = () => ({
      brush: { mode: brushColorMode, ...brushGradient },
      puff: { mode: puffColorMode, ...puffGradient },
      embroidery: { mode: embroideryColorMode, ...embroideryGradient },
      text: { mode: textColorMode, ...textGradient },
      shapes: { mode: shapesColorMode, ...shapesGradient },
      getGradientCSS
    });
  }, [brushColorMode, brushGradient, puffColorMode, puffGradient, embroideryColorMode, embroideryGradient, textColorMode, textGradient, shapesColorMode, shapesGradient]);

  const tabs = [
    { id: 'brush', label: 'Brush', icon: '🖌️' },
    { id: 'puff', label: 'Puff', icon: '☁️' },
    { id: 'embroidery', label: 'Embroidery', icon: '🧵' },
    { id: 'text', label: 'Text', icon: '📝' },
    { id: 'shapes', label: 'Shapes', icon: '🔷' },
    { id: 'image', label: 'Image', icon: '📷' },
    { id: 'picker', label: 'Picker', icon: '🎯' },
    { id: 'symmetry', label: 'Symmetry', icon: '🔄' },
    { id: 'layers', label: 'Layers', icon: '🎨' }
  ];

  // Auto-activate tool settings when tool changes (only if user hasn't manually selected)
  React.useEffect(() => {
    if (activeTool && !userSelectedTab) {
      // Map tools to their corresponding tab IDs
      const toolToTabMap: { [key: string]: string } = {
        'brush': 'brush',
        'eraser': 'brush',
        'fill': 'brush',
        'picker': 'picker',
        'puffPrint': 'puff',
        'embroidery': 'embroidery',
        'text': 'text',
        'shapes': 'shapes',
        'image': 'image',
        'symmetry': 'symmetry',
        'layers': 'layers'
      };
      
      const correspondingTab = toolToTabMap[activeTool];
      if (correspondingTab && tabs.find(tab => tab.id === correspondingTab)) {
        setActiveTab(correspondingTab);
        console.log('🎯 Auto-activated tab:', correspondingTab, 'for tool:', activeTool);
      }
    }
  }, [activeTool, tabs, userSelectedTab]);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#000000',
      borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      fontSize: '11px',
      boxShadow: '-2px 0 20px rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(10px)'
    }}>

      {/* Tab Content */}
      <div style={{
        flex: 1,
        padding: '12px',
        overflowY: 'auto',
        background: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Brush Settings */}
        {activeTab === 'brush' && (
          <div onClick={(e) => e.stopPropagation()}>
            <div style={{
              fontSize: '11px',
              color: '#a0aec0',
              fontWeight: '700',
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
            }}>
              🖌️ Brush Settings
            </div>
            
            {/* Color/Gradient Mode Tabs */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                fontSize: '9px',
                color: '#CCC',
                marginBottom: '6px'
              }}>
                Color Mode
              </div>
              
              {/* Tab Buttons */}
              <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                <button
                  onClick={() => setBrushColorMode('solid')}
                  style={{
                    flex: 1,
                    padding: '6px',
                    fontSize: '9px',
                    background: brushColorMode === 'solid' ? '#0066CC' : 'rgba(255,255,255,0.1)',
                    color: brushColorMode === 'solid' ? '#FFFFFF' : '#CCC',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  🎨 Solid Color
                </button>
                <button
                  onClick={() => setBrushColorMode('gradient')}
                  style={{
                    flex: 1,
                    padding: '6px',
                    fontSize: '9px',
                    background: brushColorMode === 'gradient' ? '#BA55D3' : 'rgba(255,255,255,0.1)',
                    color: brushColorMode === 'gradient' ? '#FFFFFF' : '#CCC',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  🌈 Gradient
                </button>
              </div>

              {/* Solid Color Content */}
              {brushColorMode === 'solid' && (
                      <div>
              <div style={{
                width: '100%',
                height: '200px',
                borderRadius: '4px',
                overflow: 'hidden',
                border: '1px solid #333'
              }}>
                <HexColorPicker
                  color={brushColor}
                  onChange={setBrushColor}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              
              {/* Color Code Input */}
              <div style={{
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  fontSize: '8px',
                  color: '#999',
                  minWidth: '30px'
                }}>
                  Code:
                </div>
                <input
                  type="text"
                  value={brushColor}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#[0-9A-Fa-f]{6}$/.test(value) || /^#[0-9A-Fa-f]{3}$/.test(value)) {
                      setBrushColor(value);
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    fontSize: '8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '3px',
                    color: '#fff',
                    fontFamily: 'monospace'
                  }}
                  placeholder="#000000"
                />
                <div style={{
                  width: '20px',
                  height: '16px',
                  background: brushColor,
                  borderRadius: '2px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  flexShrink: 0
                }} />
              </div>
                      </div>
                    )}

              {/* Gradient Content */}
              {brushColorMode === 'gradient' && (
                <div style={{ padding: '8px', background: 'rgba(138,43,226,0.05)', borderRadius: '4px', border: '1px solid rgba(138,43,226,0.3)' }}>
                  {/* Gradient Type */}
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '4px' }}>Type</div>
                    <select
                      value={brushGradient.type}
                      onChange={(e) => setBrushGradient({ ...brushGradient, type: e.target.value as any })}
                      style={{
                        width: '100%',
                        padding: '4px',
                        background: '#000000',
                        color: '#FFFFFF',
                        border: '1px solid rgba(138,43,226,0.3)',
                        borderRadius: '3px',
                        fontSize: '8px'
                      }}
                    >
                      <option value="linear">Linear</option>
                      <option value="radial">Radial</option>
                      <option value="angular">Angular</option>
                      <option value="diamond">Diamond</option>
                    </select>
                  </div>

                  {/* Gradient Angle */}
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Angle</span>
                      <span style={{ color: '#999' }}>{brushGradient.angle}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={brushGradient.angle}
                      onChange={(e) => setBrushGradient({ ...brushGradient, angle: parseInt(e.target.value) })}
                      style={{ width: '100%', accentColor: '#BA55D3' }}
                    />
                  </div>

                  {/* Gradient Colors */}
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '4px' }}>Color Stops</div>
                    
                    {brushGradient.stops.map((stop, index) => (
                      <div key={stop.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <input
                          type="color"
                          value={stop.color}
                          onChange={(e) => {
                            const newStops = [...brushGradient.stops];
                            newStops[index] = { ...stop, color: e.target.value };
                            setBrushGradient({ ...brushGradient, stops: newStops });
                          }}
                          style={{
                            width: '24px',
                            height: '24px',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '3px'
                          }}
                        />
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={stop.position}
                          onChange={(e) => {
                            const newStops = [...brushGradient.stops];
                            newStops[index] = { ...stop, position: parseInt(e.target.value) };
                            setBrushGradient({ ...brushGradient, stops: newStops });
                          }}
                          style={{ flex: 1, accentColor: '#BA55D3' }}
                        />
                        <span style={{ fontSize: '7px', color: '#999', minWidth: '24px' }}>{stop.position}%</span>
                        <button
                          onClick={() => {
                            if (brushGradient.stops.length > 2) {
                              const newStops = brushGradient.stops.filter((_, i) => i !== index);
                              setBrushGradient({ ...brushGradient, stops: newStops });
                            } else {
                              alert('Gradient must have at least 2 color stops');
                            }
                          }}
                          disabled={brushGradient.stops.length <= 2}
                          style={{
                            padding: '2px 6px',
                            fontSize: '7px',
                            background: brushGradient.stops.length <= 2 ? 'rgba(100,100,100,0.2)' : 'rgba(220,53,69,0.2)',
                            color: brushGradient.stops.length <= 2 ? '#666' : '#dc3545',
                            border: '1px solid rgba(220,53,69,0.3)',
                            borderRadius: '2px',
                            cursor: brushGradient.stops.length <= 2 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {/* Add Color Stop Button */}
                    <button
                      onClick={() => {
                        const newStop = {
                          id: Date.now().toString(),
                          color: '#888888',
                          position: 50
                        };
                        setBrushGradient({ ...brushGradient, stops: [...brushGradient.stops, newStop] });
                      }}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '8px',
                        background: 'rgba(138,43,226,0.2)',
                        color: '#BA55D3',
                        border: '1px solid rgba(138,43,226,0.3)',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        marginTop: '2px'
                      }}
                    >
                      + Add Color Stop
                    </button>
                  </div>

                  {/* Gradient Preview */}
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '4px' }}>Preview</div>
                    <div style={{
                      width: '100%',
                      height: '30px',
                      background: getGradientCSS(brushGradient),
                      borderRadius: '3px',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }} />
                  </div>
                </div>
              )}
            </div>

            {/* Brush Size */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{
                fontSize: '9px',
                color: '#CCC',
                marginBottom: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>Size</span>
                <span style={{ fontSize: '8px', color: '#999' }}>{brushSize}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="1000"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#0066CC'
                }}
              />
            </div>

            {/* Opacity */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{
                fontSize: '9px',
                color: '#CCC',
                marginBottom: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>Opacity</span>
                <span style={{ fontSize: '8px', color: '#999' }}>{Math.round(brushOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={brushOpacity}
                onChange={(e) => setBrushOpacity(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#0066CC'
                }}
              />
            </div>

            {/* Hardness */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{
                fontSize: '9px',
                color: '#CCC',
                marginBottom: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>Hardness</span>
                <span style={{ fontSize: '8px', color: '#999' }}>{Math.round(brushHardness * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={brushHardness}
                onChange={(e) => setBrushHardness(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#0066CC'
                }}
              />
            </div>

            {/* Brush Type */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{
                fontSize: '9px',
                color: '#CCC',
                marginBottom: '4px'
              }}>
                Brush Type
              </div>
              <select
                value={brushShape}
                onChange={(e) => setBrushShape(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '4px 6px',
                  background: '#000000',
                  color: '#CCC',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '2px',
                  fontSize: '9px'
                }}
              >
                {/* Basic Shapes */}
                <optgroup label="Basic Shapes">
                  <option value="round">🟢 Round</option>
                  <option value="square">⬜ Square</option>
                  <option value="diamond">💎 Diamond</option>
                  <option value="triangle">🔺 Triangle</option>
                </optgroup>
                
                {/* Digital Brushes */}
                <optgroup label="Digital Brushes">
                  <option value="airbrush">🎨 Airbrush</option>
                  <option value="spray">💨 Spray</option>
                  <option value="texture">🖼️ Texture</option>
                  <option value="stencil">📐 Stencil</option>
                  <option value="stamp">🏷️ Stamp</option>
                </optgroup>
                
                {/* Traditional Media */}
                <optgroup label="Traditional Media">
                  <option value="watercolor">🎨 Watercolor</option>
                  <option value="oil">🖌️ Oil</option>
                  <option value="acrylic">🎭 Acrylic</option>
                  <option value="gouache">🎪 Gouache</option>
                  <option value="ink">🖋️ Ink</option>
                </optgroup>
                
                {/* Drawing Tools */}
                <optgroup label="Drawing Tools">
                  <option value="pencil">✏️ Pencil</option>
                  <option value="charcoal">🖤 Charcoal</option>
                  <option value="pastel">🌈 Pastel</option>
                  <option value="chalk">🖍️ Chalk</option>
                  <option value="marker">🖍️ Marker</option>
                </optgroup>
                
                {/* Special Effects */}
                <optgroup label="Special Effects">
                  <option value="calligraphy">✍️ Calligraphy</option>
                  <option value="highlighter">🖍️ Highlighter</option>
                  <option value="blur">🌀 Blur</option>
                  <option value="smudge">👆 Smudge</option>
                </optgroup>
              </select>
            </div>
          </div>
        )}

        {/* Puff Print Settings */}
        {activeTab === 'puff' && (
          <div onClick={(e) => e.stopPropagation()}>
            <div style={{
              fontSize: '10px',
              color: '#999',
              fontWeight: '600',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Puff Print Settings
            </div>

            {/* Puff Height */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{
                fontSize: '9px',
                color: '#CCC',
                marginBottom: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>Height</span>
                <span style={{ fontSize: '8px', color: '#999' }}>{puffHeight}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={puffHeight}
                onChange={(e) => setPuffHeight(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#0066CC'
                }}
              />
            </div>

            {/* Puff Softness */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{
                fontSize: '9px',
                color: '#CCC',
                marginBottom: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>Softness</span>
                <span style={{ fontSize: '8px', color: '#999' }}>{Math.round(puffSoftness * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={puffSoftness}
                onChange={(e) => setPuffSoftness(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#0066CC'
                }}
              />
            </div>

            {/* Puff Opacity */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{
                fontSize: '9px',
                color: '#CCC',
                marginBottom: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>Opacity</span>
                <span style={{ fontSize: '8px', color: '#999' }}>{Math.round(puffOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={puffOpacity}
                onChange={(e) => setPuffOpacity(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#0066CC'
                }}
              />
            </div>

            {/* Puff Color/Gradient Mode */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                fontSize: '9px',
                color: '#CCC',
                marginBottom: '6px'
              }}>
                Color Mode
              </div>
              
              {/* Tab Buttons */}
              <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                <button
                  onClick={() => setPuffColorMode('solid')}
                  style={{
                    flex: 1,
                    padding: '6px',
                    fontSize: '9px',
                    background: puffColorMode === 'solid' ? '#0066CC' : 'rgba(255,255,255,0.1)',
                    color: puffColorMode === 'solid' ? '#FFFFFF' : '#CCC',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  🎨 Solid Color
                </button>
                <button
                  onClick={() => setPuffColorMode('gradient')}
                  style={{
                    flex: 1,
                    padding: '6px',
                    fontSize: '9px',
                    background: puffColorMode === 'gradient' ? '#BA55D3' : 'rgba(255,255,255,0.1)',
                    color: puffColorMode === 'gradient' ? '#FFFFFF' : '#CCC',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  🌈 Gradient
                </button>
              </div>

              {/* Solid Color Content */}
              {puffColorMode === 'solid' && (
                <div>
              <div style={{
                width: '100%',
                height: '200px',
                borderRadius: '4px',
                overflow: 'hidden',
                border: '1px solid #333'
              }}>
                <HexColorPicker
                  color={puffColor}
                  onChange={setPuffColor}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              
              {/* Color Code Input */}
              <div style={{
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  fontSize: '8px',
                  color: '#999',
                  minWidth: '30px'
                }}>
                  Code:
                </div>
                <input
                  type="text"
                  value={puffColor}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#[0-9A-Fa-f]{6}$/.test(value) || /^#[0-9A-Fa-f]{3}$/.test(value)) {
                      setPuffColor(value);
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    fontSize: '8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '3px',
                    color: '#fff',
                    fontFamily: 'monospace'
                  }}
                  placeholder="#000000"
                />
                <div style={{
                  width: '20px',
                  height: '16px',
                  background: puffColor,
                  borderRadius: '2px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  flexShrink: 0
                }} />
              </div>
                </div>
              )}

              {/* Gradient Content */}
              {puffColorMode === 'gradient' && (
                <div style={{ padding: '8px', background: 'rgba(138,43,226,0.05)', borderRadius: '4px', border: '1px solid rgba(138,43,226,0.3)' }}>
                  {/* Gradient Type */}
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '4px' }}>Type</div>
                    <select
                      value={puffGradient.type}
                      onChange={(e) => setPuffGradient({ ...puffGradient, type: e.target.value as any })}
                      style={{
                        width: '100%',
                        padding: '4px',
                        background: '#000000',
                        color: '#FFFFFF',
                        border: '1px solid rgba(138,43,226,0.3)',
                        borderRadius: '3px',
                        fontSize: '8px'
                      }}
                    >
                      <option value="linear">Linear</option>
                      <option value="radial">Radial</option>
                      <option value="angular">Angular</option>
                      <option value="diamond">Diamond</option>
                    </select>
                  </div>

                  {/* Gradient Angle */}
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Angle</span>
                      <span style={{ color: '#999' }}>{puffGradient.angle}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={puffGradient.angle}
                      onChange={(e) => setPuffGradient({ ...puffGradient, angle: parseInt(e.target.value) })}
                      style={{ width: '100%', accentColor: '#BA55D3' }}
                    />
                  </div>

                  {/* Color Stops */}
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '4px' }}>Color Stops</div>
                    
                    {puffGradient.stops.map((stop, index) => (
                      <div key={stop.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <input
                          type="color"
                          value={stop.color}
                          onChange={(e) => {
                            const newStops = [...puffGradient.stops];
                            newStops[index] = { ...stop, color: e.target.value };
                            setPuffGradient({ ...puffGradient, stops: newStops });
                          }}
                          style={{
                            width: '24px',
                            height: '24px',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '3px'
                          }}
                        />
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={stop.position}
                          onChange={(e) => {
                            const newStops = [...puffGradient.stops];
                            newStops[index] = { ...stop, position: parseInt(e.target.value) };
                            setPuffGradient({ ...puffGradient, stops: newStops });
                          }}
                          style={{ flex: 1, accentColor: '#BA55D3' }}
                        />
                        <span style={{ fontSize: '7px', color: '#999', minWidth: '24px' }}>{stop.position}%</span>
                        <button
                          onClick={() => {
                            if (puffGradient.stops.length > 2) {
                              const newStops = puffGradient.stops.filter((_, i) => i !== index);
                              setPuffGradient({ ...puffGradient, stops: newStops });
                            }
                          }}
                          disabled={puffGradient.stops.length <= 2}
                          style={{
                            padding: '2px 6px',
                            fontSize: '7px',
                            background: puffGradient.stops.length <= 2 ? 'rgba(100,100,100,0.2)' : 'rgba(220,53,69,0.2)',
                            color: puffGradient.stops.length <= 2 ? '#666' : '#dc3545',
                            border: '1px solid rgba(220,53,69,0.3)',
                            borderRadius: '2px',
                            cursor: puffGradient.stops.length <= 2 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {/* Add Color Stop Button */}
                    <button
                      onClick={() => {
                        const newStop = {
                          id: Date.now().toString(),
                          color: '#888888',
                          position: 50
                        };
                        setPuffGradient({ ...puffGradient, stops: [...puffGradient.stops, newStop] });
                      }}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '8px',
                        background: 'rgba(138,43,226,0.2)',
                        color: '#BA55D3',
                        border: '1px solid rgba(138,43,226,0.3)',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        marginTop: '2px'
                      }}
                    >
                      + Add Color Stop
                    </button>
                  </div>

                  {/* Preview */}
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '4px' }}>Preview</div>
                    <div style={{
                      width: '100%',
                      height: '30px',
                      background: getGradientCSS(puffGradient),
                      borderRadius: '3px',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Embroidery Settings */}
        {activeTab === 'embroidery' && (
          <div onClick={(e) => e.stopPropagation()}>
            <div style={{
              fontSize: '10px',
              color: '#999',
              fontWeight: '600',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Embroidery Settings
            </div>

            {/* Thread Color/Gradient Mode */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                fontSize: '9px',
                color: '#CCC',
                marginBottom: '6px'
              }}>
                Color Mode
              </div>
              
              {/* Tab Buttons */}
              <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                <button
                  onClick={() => setEmbroideryColorMode('solid')}
                  style={{
                    flex: 1,
                    padding: '6px',
                    fontSize: '9px',
                    background: embroideryColorMode === 'solid' ? '#0066CC' : 'rgba(255,255,255,0.1)',
                    color: embroideryColorMode === 'solid' ? '#FFFFFF' : '#CCC',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  🎨 Solid Color
                </button>
                <button
                  onClick={() => setEmbroideryColorMode('gradient')}
                  style={{
                    flex: 1,
                    padding: '6px',
                    fontSize: '9px',
                    background: embroideryColorMode === 'gradient' ? '#BA55D3' : 'rgba(255,255,255,0.1)',
                    color: embroideryColorMode === 'gradient' ? '#FFFFFF' : '#CCC',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  🌈 Gradient
                </button>
              </div>

              {/* Solid Color Content */}
              {embroideryColorMode === 'solid' && (
                <div>
              <div style={{
                width: '100%',
                height: '200px',
                borderRadius: '4px',
                overflow: 'hidden',
                border: '1px solid #333'
              }}>
                <HexColorPicker
                  color={embroideryThreadColor}
                  onChange={setEmbroideryThreadColor}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              
              {/* Color Code Input */}
              <div style={{
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  fontSize: '8px',
                  color: '#999',
                  minWidth: '30px'
                }}>
                  Code:
                </div>
                <input
                  type="text"
                  value={embroideryThreadColor}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#[0-9A-Fa-f]{6}$/.test(value) || /^#[0-9A-Fa-f]{3}$/.test(value)) {
                      setEmbroideryThreadColor(value);
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    fontSize: '8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '3px',
                    color: '#fff',
                    fontFamily: 'monospace'
                  }}
                  placeholder="#000000"
                />
                <div style={{
                  width: '20px',
                  height: '16px',
                  background: embroideryThreadColor,
                  borderRadius: '2px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  flexShrink: 0
                }} />
              </div>
                </div>
              )}

              {/* Gradient Content */}
              {embroideryColorMode === 'gradient' && (
                <div style={{ padding: '8px', background: 'rgba(138,43,226,0.05)', borderRadius: '4px', border: '1px solid rgba(138,43,226,0.3)' }}>
                  {/* Gradient Type */}
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '4px' }}>Type</div>
                    <select
                      value={embroideryGradient.type}
                      onChange={(e) => setEmbroideryGradient({ ...embroideryGradient, type: e.target.value as any })}
                      style={{
                        width: '100%',
                        padding: '4px',
                        background: '#000000',
                        color: '#FFFFFF',
                        border: '1px solid rgba(138,43,226,0.3)',
                        borderRadius: '3px',
                        fontSize: '8px'
                      }}
                    >
                      <option value="linear">Linear</option>
                      <option value="radial">Radial</option>
                      <option value="angular">Angular</option>
                      <option value="diamond">Diamond</option>
                    </select>
                  </div>

                  {/* Gradient Angle */}
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Angle</span>
                      <span style={{ color: '#999' }}>{embroideryGradient.angle}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={embroideryGradient.angle}
                      onChange={(e) => setEmbroideryGradient({ ...embroideryGradient, angle: parseInt(e.target.value) })}
                      style={{ width: '100%', accentColor: '#BA55D3' }}
                    />
                  </div>

                  {/* Color Stops */}
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '4px' }}>Color Stops</div>
                    
                    {embroideryGradient.stops.map((stop, index) => (
                      <div key={stop.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <input
                          type="color"
                          value={stop.color}
                          onChange={(e) => {
                            const newStops = [...embroideryGradient.stops];
                            newStops[index] = { ...stop, color: e.target.value };
                            setEmbroideryGradient({ ...embroideryGradient, stops: newStops });
                          }}
                          style={{ width: '24px', height: '24px', border: 'none', cursor: 'pointer', borderRadius: '3px' }}
                        />
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={stop.position}
                          onChange={(e) => {
                            const newStops = [...embroideryGradient.stops];
                            newStops[index] = { ...stop, position: parseInt(e.target.value) };
                            setEmbroideryGradient({ ...embroideryGradient, stops: newStops });
                          }}
                          style={{ flex: 1, accentColor: '#BA55D3' }}
                        />
                        <span style={{ fontSize: '7px', color: '#999', minWidth: '24px' }}>{stop.position}%</span>
                        <button
                          onClick={() => {
                            if (embroideryGradient.stops.length > 2) {
                              const newStops = embroideryGradient.stops.filter((_, i) => i !== index);
                              setEmbroideryGradient({ ...embroideryGradient, stops: newStops });
                            }
                          }}
                          disabled={embroideryGradient.stops.length <= 2}
                          style={{
                            padding: '2px 6px',
                            fontSize: '7px',
                            background: embroideryGradient.stops.length <= 2 ? 'rgba(100,100,100,0.2)' : 'rgba(220,53,69,0.2)',
                            color: embroideryGradient.stops.length <= 2 ? '#666' : '#dc3545',
                            border: '1px solid rgba(220,53,69,0.3)',
                            borderRadius: '2px',
                            cursor: embroideryGradient.stops.length <= 2 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {/* Add Color Stop Button */}
                    <button
                      onClick={() => {
                        const newStop = { id: Date.now().toString(), color: '#888888', position: 50 };
                        setEmbroideryGradient({ ...embroideryGradient, stops: [...embroideryGradient.stops, newStop] });
                      }}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '8px',
                        background: 'rgba(138,43,226,0.2)',
                        color: '#BA55D3',
                        border: '1px solid rgba(138,43,226,0.3)',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        marginTop: '2px'
                      }}
                    >
                      + Add Color Stop
                    </button>
                  </div>

                  {/* Preview */}
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '4px' }}>Preview</div>
                    <div style={{
                      width: '100%',
                      height: '30px',
                      background: getGradientCSS(embroideryGradient),
                      borderRadius: '3px',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }} />
                  </div>
                </div>
              )}
            </div>

            {/* Thread Thickness */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{
                fontSize: '9px',
                color: '#CCC',
                marginBottom: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>Thickness</span>
                <span style={{ fontSize: '8px', color: '#999' }}>{embroideryThreadThickness}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={embroideryThreadThickness}
                onChange={(e) => setEmbroideryThreadThickness(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#0066CC'
                }}
              />
            </div>

            {/* Stitch Type */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{
                fontSize: '9px',
                color: '#CCC',
                marginBottom: '4px'
              }}>
                Stitch Type
              </div>
              <select
                value={embroideryStitchType}
                onChange={(e) => setEmbroideryStitchType(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '4px 6px',
                  background: '#000000',
                  color: '#CCC',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '2px',
                  fontSize: '9px'
                }}
              >
                <option value="straight">Straight</option>
                <option value="zigzag">Zigzag</option>
                <option value="satin">Satin</option>
                <option value="fill">Fill</option>
              </select>
            </div>

            {/* Spacing */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{
                fontSize: '9px',
                color: '#CCC',
                marginBottom: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>Spacing</span>
                <span style={{ fontSize: '8px', color: '#999' }}>{embroiderySpacing}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={embroiderySpacing}
                onChange={(e) => setEmbroiderySpacing(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#0066CC'
                }}
              />
            </div>
          </div>
        )}

        {/* Text Settings */}
        {activeTab === 'text' && (
          <div onClick={(e) => e.stopPropagation()}>
            <div style={{
              fontSize: '10px',
              color: '#999',
              fontWeight: '600',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              📝 Text Tools
            </div>

            {/* Text Selection */}
            {(() => {
              const { textElements, activeTextId, selectTextElement } = useApp.getState();
              return (
            <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '9px', color: '#CCC', marginBottom: '4px' }}>
                    Select Text to Edit
                  </div>
                  <select
                    value={activeTextId || ''}
                    onChange={(e) => selectTextElement(e.target.value || null)}
                    style={{
                      width: '100%',
                      padding: '4px',
                      background: '#000000',
                      color: '#FFFFFF',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '4px',
                      fontSize: '9px'
                    }}
                  >
                    <option value="">-- Select text to edit --</option>
                    {textElements.map((text, index) => (
                      <option key={text.id} value={text.id}>
                        {index + 1}. "{text.text}" ({text.fontSize}px)
                      </option>
                    ))}
                  </select>
                </div>
              );
            })()}

            {/* Google Fonts Loader */}
            <div style={{ marginBottom: '8px', padding: '6px', background: 'rgba(76,175,80,0.1)', borderRadius: '4px', border: '1px solid rgba(76,175,80,0.3)' }}>
              <div style={{ fontSize: '8px', color: '#81C784', fontWeight: '600', marginBottom: '4px' }}>
                🌐 Load Google Font
              </div>
              <input
                type="text"
                placeholder="Paste Google Fonts URL or HTML"
                onKeyPress={async (e) => {
                  if (e.key === 'Enter') {
                    const input = e.currentTarget.value.trim();
                    if (input) {
                      try {
                        // Extract font URL from various formats
                        let fontUrl = '';
                        
                        // Check if it's a direct Google Fonts CSS URL
                        if (input.includes('fonts.googleapis.com/css')) {
                          const match = input.match(/href=["']([^"']+)["']/);
                          fontUrl = match ? match[1] : input;
                        } else if (input.startsWith('http')) {
                          fontUrl = input;
                        }
                        
                        if (fontUrl) {
                          console.log('Loading Google Font from:', fontUrl);
                          
                          // Fetch the CSS to get font family name
                          const response = await fetch(fontUrl);
                          const cssText = await response.text();
                          
                          // Extract font family name from CSS
                          const familyMatch = cssText.match(/font-family:\s*['"]([^'"]+)['"]/);
                          const fontFamily = familyMatch ? familyMatch[1] : '';
                          
                          if (fontFamily) {
                            // Create and inject the font stylesheet
                            const link = document.createElement('link');
                            link.rel = 'stylesheet';
                            link.href = fontUrl;
                            document.head.appendChild(link);
                            
                            // Wait for font to load
                            await document.fonts.ready;
                            
                            // Store loaded font in session storage for persistence
                            const loadedFonts = JSON.parse(sessionStorage.getItem('loadedGoogleFonts') || '[]');
                            if (!loadedFonts.includes(fontFamily)) {
                              loadedFonts.push(fontFamily);
                              sessionStorage.setItem('loadedGoogleFonts', JSON.stringify(loadedFonts));
                            }
                            
                            console.log('Google Font loaded:', fontFamily);
                            alert(`✅ Font loaded: ${fontFamily}\n\nYou can now select it from the Font Family dropdown!`);
                            
                            // Clear input and trigger re-render
                            e.currentTarget.value = '';
                            
                            // Force component update to show new font in dropdown
                            window.dispatchEvent(new CustomEvent('googleFontLoaded', { detail: { fontFamily } }));
                            
                            // Also trigger state update directly
                            setGoogleFontsLoaded(prev => prev + 1);
                          } else {
                            alert('❌ Could not extract font name from the URL.');
                          }
                        } else {
                          alert('❌ Invalid Google Fonts URL or HTML.\n\nPlease paste:\n- Google Fonts CSS URL\n- Or the complete <link> tag');
                        }
                      } catch (error) {
                        console.error('Error loading Google Font:', error);
                        alert('❌ Error loading Google Font. Please check the URL.');
                      }
                    }
                  }
                }}
                style={{
                  width: '100%',
                  padding: '3px 4px',
                  fontSize: '7px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(76,175,80,0.3)',
                  borderRadius: '2px',
                  color: '#fff'
                }}
              />
              <div style={{ fontSize: '6px', color: '#81C784', marginTop: '1px' }}>
                Paste Google Fonts link tag or CSS URL, press Enter
              </div>
            </div>

            {/* Active Text Editing */}
            {(() => {
              const { textElements, activeTextId, updateTextElement, deleteTextElement, addTextElement } = useApp.getState();
              if (!activeTextId) return null;
              
              const activeText = textElements.find(t => t.id === activeTextId);
              if (!activeText) return null;

              return (
                <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(0,150,255,0.1)', borderRadius: '4px', border: '1px solid rgba(0,150,255,0.3)' }}>
                  <div style={{ fontSize: '9px', fontWeight: '600', marginBottom: '6px', color: '#66B3FF' }}>
                    Editing: "{activeText.text}"
                  </div>
                  
                  {/* Text Content */}
                  <div style={{ marginBottom: '6px' }}>
                    <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '2px' }}>Text Content</div>
                    <textarea
                      value={activeText.text}
                      onChange={(e) => {
                        updateTextElement(activeTextId, { text: e.target.value });
                        
                        // Trigger live texture update (same as font size)
                        setTimeout(() => {
                          const { composeLayers } = useApp.getState();
                          composeLayers();
                          if ((window as any).updateModelTexture) {
                            (window as any).updateModelTexture(true, true);
                          }
                        }, 10);
                      }}
                      style={{ 
                        width: '100%', 
                        padding: '4px',
                        borderRadius: '3px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.05)',
                        color: '#ffffff',
                        resize: 'vertical',
                        minHeight: '40px',
                        fontSize: '8px'
                      }}
                      placeholder="Enter your text here..."
              />
            </div>

            {/* Font Family */}
                  <div style={{ marginBottom: '6px' }}>
                    <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '2px' }}>Font Family</div>
              <select
                      value={activeText.fontFamily}
                      onChange={(e) => {
                        console.log('🎨 Font family changed to:', e.target.value);
                        updateTextElement(activeTextId, { fontFamily: e.target.value });
                        
                        // Direct texture update without delays (same as font size)
                        setTimeout(() => {
                          console.log('🎨 Direct texture update for font family');
                          // Force recomposition first
                          const { composeLayers } = useApp.getState();
                          composeLayers();
                          
                          // Then update texture directly
                          if ((window as any).updateModelTexture) {
                            (window as any).updateModelTexture(true, true);
                          }
                        }, 10);
                      }}
                style={{
                  width: '100%',
                  padding: '4px',
                  background: '#000000',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '3px',
                        fontSize: '8px'
                }}
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
                <option value="Courier New">Courier New</option>
                      <option value="Impact">Impact</option>
                      <option value="Comic Sans MS">Comic Sans MS</option>
                      <option value="Trebuchet MS">Trebuchet MS</option>
                      <option value="Palatino">Palatino</option>
                      <option value="Garamond">Garamond</option>
                      <option value="Bookman">Bookman</option>
                      <option value="Avant Garde">Avant Garde</option>
                      <option value="Helvetica Neue">Helvetica Neue</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Source Sans Pro">Source Sans Pro</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Nunito">Nunito</option>
                      <option value="Raleway">Raleway</option>
                      <option value="Ubuntu">Ubuntu</option>
                      <option value="Playfair Display">Playfair Display</option>
                      <option value="Merriweather">Merriweather</option>
                      <option value="PT Serif">PT Serif</option>
                      <option value="PT Sans">PT Sans</option>
                      <option value="Droid Sans">Droid Sans</option>
                      <option value="Droid Serif">Droid Serif</option>
                      {/* Dynamically loaded Google Fonts */}
                      {(() => {
                        try {
                          // Use googleFontsLoaded state to force re-render
                          const loadedFonts = JSON.parse(sessionStorage.getItem('loadedGoogleFonts') || '[]');
                          console.log('🎨 Rendering Google Fonts dropdown, loaded fonts:', loadedFonts, 'state:', googleFontsLoaded);
                          return loadedFonts.map((font: string) => (
                            <option key={`${font}-${googleFontsLoaded}`} value={font} style={{ color: '#81C784', fontWeight: 'bold' }}>
                              🌐 {font}
                            </option>
                          ));
                        } catch (error) {
                          console.error('Error loading Google Fonts from sessionStorage:', error);
                          return null;
                        }
                      })()}
              </select>
            </div>

                  {/* Font Size */}
                  <div style={{ marginBottom: '6px' }}>
                    <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '2px' }}>
                      Font Size: {activeText.fontSize}px
                    </div>
              <input
                      type="range"
                      min="8"
                      max="1000"
                      value={activeText.fontSize}
                      onChange={(e) => {
                        updateTextElement(activeTextId, { fontSize: parseInt(e.target.value) });
                        setTimeout(() => {
                          const { composeLayers } = useApp.getState();
                          composeLayers();
                          if ((window as any).updateModelTexture) {
                            (window as any).updateModelTexture(true, true);
                          }
                        }, 10);
                      }}
                      style={{ width: '100%', accentColor: '#0066CC' }}
                    />
                  </div>

                  {/* Text Color/Gradient Mode */}
                  <div style={{ marginBottom: '6px' }}>
                    <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '4px' }}>Color Mode</div>
                    
                    {/* Tab Buttons */}
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                      <button
                        onClick={() => setTextColorMode('solid')}
                        style={{
                          flex: 1,
                          padding: '4px',
                  fontSize: '8px',
                          background: textColorMode === 'solid' ? '#0066CC' : 'rgba(255,255,255,0.1)',
                          color: textColorMode === 'solid' ? '#FFFFFF' : '#CCC',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        🎨 Solid
                      </button>
                      <button
                        onClick={() => setTextColorMode('gradient')}
                        style={{
                          flex: 1,
                          padding: '4px',
                          fontSize: '8px',
                          background: textColorMode === 'gradient' ? '#BA55D3' : 'rgba(255,255,255,0.1)',
                          color: textColorMode === 'gradient' ? '#FFFFFF' : '#CCC',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        🌈 Gradient
                      </button>
                </div>

                    {/* Solid Color Content */}
                    {textColorMode === 'solid' && (
                <input
                        type="color"
                        value={activeText.color}
                  onChange={(e) => {
                          updateTextElement(activeTextId, { color: e.target.value });
                          setTimeout(() => {
                            const { composeLayers } = useApp.getState();
                            composeLayers();
                            if ((window as any).updateModelTexture) {
                              (window as any).updateModelTexture(true, true);
                            }
                          }, 10);
                        }}
                        style={{ width: '100%', height: '30px', border: 'none', cursor: 'pointer', borderRadius: '3px' }}
                      />
                    )}

                    {/* Gradient Content */}
                    {textColorMode === 'gradient' && (
                      <div style={{ padding: '6px', background: 'rgba(138,43,226,0.05)', borderRadius: '4px', border: '1px solid rgba(138,43,226,0.3)' }}>
                        {/* Gradient Type */}
                        <div style={{ marginBottom: '6px' }}>
                          <div style={{ fontSize: '7px', color: '#CCC', marginBottom: '2px' }}>Type</div>
                          <select
                            value={textGradient.type}
                            onChange={(e) => setTextGradient({ ...textGradient, type: e.target.value as any })}
                  style={{
                              width: '100%',
                              padding: '3px',
                              background: '#000000',
                              color: '#FFFFFF',
                              border: '1px solid rgba(138,43,226,0.3)',
                              borderRadius: '2px',
                              fontSize: '7px'
                            }}
                          >
                            <option value="linear">Linear</option>
                            <option value="radial">Radial</option>
                            <option value="angular">Angular</option>
                            <option value="diamond">Diamond</option>
                          </select>
                        </div>

                        {/* Gradient Angle */}
                        <div style={{ marginBottom: '6px' }}>
                          <div style={{ fontSize: '7px', color: '#CCC', marginBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Angle</span>
                            <span style={{ color: '#999' }}>{textGradient.angle}°</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={textGradient.angle}
                            onChange={(e) => setTextGradient({ ...textGradient, angle: parseInt(e.target.value) })}
                            style={{ width: '100%', accentColor: '#BA55D3', height: '3px' }}
                          />
                        </div>

                        {/* Color Stops */}
                        <div style={{ marginBottom: '6px' }}>
                          <div style={{ fontSize: '7px', color: '#CCC', marginBottom: '3px' }}>Color Stops</div>
                          
                          {textGradient.stops.map((stop, index) => (
                            <div key={stop.id} style={{ display: 'flex', alignItems: 'center', gap: '2px', marginBottom: '3px' }}>
                              <input
                                type="color"
                                value={stop.color}
                                onChange={(e) => {
                                  const newStops = [...textGradient.stops];
                                  newStops[index] = { ...stop, color: e.target.value };
                                  setTextGradient({ ...textGradient, stops: newStops });
                                }}
                                style={{ width: '20px', height: '20px', border: 'none', cursor: 'pointer', borderRadius: '2px' }}
                              />
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={stop.position}
                                onChange={(e) => {
                                  const newStops = [...textGradient.stops];
                                  newStops[index] = { ...stop, position: parseInt(e.target.value) };
                                  setTextGradient({ ...textGradient, stops: newStops });
                                }}
                                style={{ flex: 1, accentColor: '#BA55D3', height: '3px' }}
                              />
                              <span style={{ fontSize: '6px', color: '#999', minWidth: '20px' }}>{stop.position}%</span>
                              <button
                                onClick={() => {
                                  if (textGradient.stops.length > 2) {
                                    const newStops = textGradient.stops.filter((_, i) => i !== index);
                                    setTextGradient({ ...textGradient, stops: newStops });
                                  }
                                }}
                                disabled={textGradient.stops.length <= 2}
                                style={{
                                  padding: '1px 4px',
                                  fontSize: '6px',
                                  background: textGradient.stops.length <= 2 ? 'rgba(100,100,100,0.2)' : 'rgba(220,53,69,0.2)',
                                  color: textGradient.stops.length <= 2 ? '#666' : '#dc3545',
                                  border: '1px solid rgba(220,53,69,0.3)',
                                  borderRadius: '2px',
                                  cursor: textGradient.stops.length <= 2 ? 'not-allowed' : 'pointer'
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}

                          <button
                            onClick={() => {
                              const newStop = { id: Date.now().toString(), color: '#888888', position: 50 };
                              setTextGradient({ ...textGradient, stops: [...textGradient.stops, newStop] });
                            }}
                            style={{
                              width: '100%',
                              padding: '3px',
                              fontSize: '7px',
                              background: 'rgba(138,43,226,0.2)',
                              color: '#BA55D3',
                              border: '1px solid rgba(138,43,226,0.3)',
                              borderRadius: '2px',
                              cursor: 'pointer',
                              marginTop: '2px'
                            }}
                          >
                            + Add Color Stop
                          </button>
                        </div>

                        {/* Preview */}
                        <div style={{ marginTop: '6px' }}>
                          <div style={{ fontSize: '7px', color: '#CCC', marginBottom: '2px' }}>Preview</div>
                <div style={{
                            width: '100%',
                            height: '24px',
                            background: getGradientCSS(textGradient),
                  borderRadius: '2px',
                            border: '1px solid rgba(255,255,255,0.2)'
                }} />
              </div>
                      </div>
                    )}
            </div>

            {/* Text Style */}
                  <div style={{ marginBottom: '6px' }}>
                    <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '2px' }}>Style</div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                <button
                        onClick={() => {
                          updateTextElement(activeTextId, { bold: !activeText.bold });
                          setTimeout(() => {
                            const { composeLayers } = useApp.getState();
                            composeLayers();
                            if ((window as any).updateModelTexture) {
                              (window as any).updateModelTexture(true, true);
                            }
                          }, 10);
                        }}
                  style={{
                          flex: 1, 
                          padding: '4px', 
                          fontSize: '8px',
                          background: activeText.bold ? '#0066CC' : 'rgba(255,255,255,0.1)',
                          color: activeText.bold ? '#FFFFFF' : '#CCC',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '3px',
                          fontWeight: activeText.bold ? 'bold' : 'normal',
                    cursor: 'pointer'
                  }}
                >
                  Bold
                </button>
                <button
                        onClick={() => {
                          updateTextElement(activeTextId, { italic: !activeText.italic });
                          setTimeout(() => {
                            if ((window as any).updateModelTexture) {
                              (window as any).updateModelTexture();
                            }
                          }, 50);
                        }}
                  style={{
                          flex: 1, 
                          padding: '4px', 
                          fontSize: '8px',
                          background: activeText.italic ? '#0066CC' : 'rgba(255,255,255,0.1)',
                          color: activeText.italic ? '#FFFFFF' : '#CCC',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '3px',
                          fontStyle: activeText.italic ? 'italic' : 'normal',
                    cursor: 'pointer'
                  }}
                >
                  Italic
                </button>
                      <button
                        onClick={() => {
                          updateTextElement(activeTextId, { underline: !activeText.underline });
                          setTimeout(() => {
                            if ((window as any).updateModelTexture) {
                              (window as any).updateModelTexture();
                            }
                          }, 50);
                        }}
                        style={{ 
                          flex: 1, 
                          padding: '4px', 
                          fontSize: '8px',
                          background: activeText.underline ? '#0066CC' : 'rgba(255,255,255,0.1)',
                          color: activeText.underline ? '#FFFFFF' : '#CCC',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '3px',
                          textDecoration: activeText.underline ? 'underline' : 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Underline
                      </button>
              </div>
            </div>

            {/* Text Alignment */}
                  <div style={{ marginBottom: '6px' }}>
                    <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '2px' }}>Alignment</div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      <button
                        onClick={() => updateTextElement(activeTextId, { align: 'left' })}
                        style={{ 
                          flex: 1, 
                          padding: '4px', 
                          fontSize: '10px',
                          background: activeText.align === 'left' ? '#0066CC' : 'rgba(255,255,255,0.1)',
                          color: activeText.align === 'left' ? '#FFFFFF' : '#CCC',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        ⬅️
                      </button>
                      <button
                        onClick={() => updateTextElement(activeTextId, { align: 'center' })}
                        style={{ 
                          flex: 1, 
                          padding: '4px', 
                          fontSize: '10px',
                          background: activeText.align === 'center' ? '#0066CC' : 'rgba(255,255,255,0.1)',
                          color: activeText.align === 'center' ? '#FFFFFF' : '#CCC',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        ↔️
                      </button>
                      <button
                        onClick={() => updateTextElement(activeTextId, { align: 'right' })}
                        style={{ 
                          flex: 1, 
                          padding: '4px', 
                          fontSize: '10px',
                          background: activeText.align === 'right' ? '#0066CC' : 'rgba(255,255,255,0.1)',
                          color: activeText.align === 'right' ? '#FFFFFF' : '#CCC',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        ➡️
                      </button>
                    </div>
                  </div>

                  {/* Text Case */}
                  <div style={{ marginBottom: '6px' }}>
                    <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '2px' }}>Text Case</div>
              <select
                      value={activeText.textCase || 'none'}
                      onChange={(e) => updateTextElement(activeTextId, { textCase: e.target.value as any })}
                style={{
                  width: '100%',
                  padding: '4px',
                  background: '#000000',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '3px',
                        fontSize: '8px'
                      }}
                    >
                      <option value="none">Normal Case</option>
                      <option value="uppercase">UPPERCASE</option>
                      <option value="lowercase">lowercase</option>
                      <option value="capitalize">Capitalize</option>
              </select>
                  </div>

                  {/* Letter Spacing */}
                  <div style={{ marginBottom: '6px' }}>
                    <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '2px' }}>
                      Letter Spacing: {activeText.letterSpacing || 0}px
                    </div>
                    <input
                      type="range"
                      min="-5"
                      max="20"
                      step="0.5"
                      value={activeText.letterSpacing || 0}
                      onChange={(e) => updateTextElement(activeTextId, { letterSpacing: parseFloat(e.target.value) })}
                      style={{ width: '100%', accentColor: '#0066CC' }}
                    />
                  </div>

                  {/* Line Height */}
                  <div style={{ marginBottom: '6px' }}>
                    <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '2px' }}>
                      Line Height: {(activeText.lineHeight || 1.2).toFixed(1)}
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="3"
                      step="0.1"
                      value={activeText.lineHeight || 1.2}
                      onChange={(e) => updateTextElement(activeTextId, { lineHeight: parseFloat(e.target.value) })}
                      style={{ width: '100%', accentColor: '#0066CC' }}
                    />
                  </div>

                  {/* Rotation */}
                  <div style={{ marginBottom: '6px' }}>
                    <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '2px' }}>
                      Rotation: {Math.round((activeText.rotation || 0) * 180 / Math.PI)}°
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={Math.round((activeText.rotation || 0) * 180 / Math.PI)}
                      onChange={(e) => updateTextElement(activeTextId, { rotation: parseInt(e.target.value) * Math.PI / 180 })}
                      style={{ width: '100%', accentColor: '#0066CC' }}
                    />
                  </div>

                  {/* Opacity */}
                  <div style={{ marginBottom: '6px' }}>
                    <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '2px' }}>
                      Opacity: {Math.round((activeText.opacity || 1) * 100)}%
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={activeText.opacity || 1}
                      onChange={(e) => updateTextElement(activeTextId, { opacity: parseFloat(e.target.value) })}
                      style={{ width: '100%', accentColor: '#0066CC' }}
                    />
                  </div>

                  {/* Text Shadow */}
                  <div style={{ marginBottom: '6px', padding: '6px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '6px', fontWeight: '600' }}>🌑 Text Shadow</div>
                    
                    {/* Shadow Color */}
                    <div style={{ marginBottom: '4px' }}>
                      <div style={{ fontSize: '7px', color: '#CCC', marginBottom: '2px' }}>Color</div>
                      <input
                        type="color"
                        value={activeText.shadow?.color || '#000000'}
                        onChange={(e) => {
                          updateTextElement(activeTextId, { 
                            shadow: { 
                              blur: activeText.shadow?.blur || 0,
                              offsetX: activeText.shadow?.offsetX || 0,
                              offsetY: activeText.shadow?.offsetY || 0,
                              color: e.target.value 
                            } 
                          });
                          setTimeout(() => {
                            const { composeLayers } = useApp.getState();
                            composeLayers();
                            if ((window as any).updateModelTexture) {
                              (window as any).updateModelTexture(true, true);
                            }
                          }, 10);
                        }}
                        style={{ width: '100%', height: '24px', border: 'none', cursor: 'pointer', borderRadius: '3px' }}
                      />
                    </div>

                    {/* Shadow Blur */}
                    <div style={{ marginBottom: '4px' }}>
                      <div style={{ fontSize: '7px', color: '#CCC', marginBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Blur</span>
                        <span style={{ color: '#999' }}>{activeText.shadow?.blur || 0}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={activeText.shadow?.blur || 0}
                        onChange={(e) => {
                          updateTextElement(activeTextId, { 
                            shadow: { 
                              blur: parseInt(e.target.value),
                              offsetX: activeText.shadow?.offsetX || 0,
                              offsetY: activeText.shadow?.offsetY || 0,
                              color: activeText.shadow?.color || '#000000'
                            } 
                          });
                          setTimeout(() => {
                            const { composeLayers } = useApp.getState();
                            composeLayers();
                            if ((window as any).updateModelTexture) {
                              (window as any).updateModelTexture(true, true);
                            }
                          }, 10);
                        }}
                        style={{ width: '100%', accentColor: '#0066CC' }}
                      />
                    </div>

                    {/* Shadow Angle */}
                    <div style={{ marginBottom: '4px' }}>
                      <div style={{ fontSize: '7px', color: '#CCC', marginBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Angle</span>
                        <span style={{ color: '#999' }}>
                          {(() => {
                            const offsetX = activeText.shadow?.offsetX || 0;
                            const offsetY = activeText.shadow?.offsetY || 0;
                            const angle = Math.round(Math.atan2(offsetY, offsetX) * 180 / Math.PI);
                            return angle >= 0 ? angle : 360 + angle;
                          })()}°
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={(() => {
                          const offsetX = activeText.shadow?.offsetX || 0;
                          const offsetY = activeText.shadow?.offsetY || 0;
                          const angle = Math.round(Math.atan2(offsetY, offsetX) * 180 / Math.PI);
                          return angle >= 0 ? angle : 360 + angle;
                        })()}
                        onChange={(e) => {
                          const angle = parseInt(e.target.value);
                          const distance = Math.sqrt(
                            Math.pow(activeText.shadow?.offsetX || 0, 2) + 
                            Math.pow(activeText.shadow?.offsetY || 0, 2)
                          );
                          const angleRad = (angle * Math.PI) / 180;
                          updateTextElement(activeTextId, { 
                            shadow: { 
                              blur: activeText.shadow?.blur || 0,
                              offsetX: Math.cos(angleRad) * distance,
                              offsetY: Math.sin(angleRad) * distance,
                              color: activeText.shadow?.color || '#000000'
                            } 
                          });
                          setTimeout(() => {
                            const { composeLayers } = useApp.getState();
                            composeLayers();
                            if ((window as any).updateModelTexture) {
                              (window as any).updateModelTexture(true, true);
                            }
                          }, 10);
                        }}
                        style={{ width: '100%', accentColor: '#0066CC' }}
                      />
                    </div>

                    {/* Shadow Distance */}
                    <div style={{ marginBottom: '4px' }}>
                      <div style={{ fontSize: '7px', color: '#CCC', marginBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Distance</span>
                        <span style={{ color: '#999' }}>
                          {Math.round(Math.sqrt(
                            Math.pow(activeText.shadow?.offsetX || 0, 2) + 
                            Math.pow(activeText.shadow?.offsetY || 0, 2)
                          ))}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={Math.round(Math.sqrt(
                          Math.pow(activeText.shadow?.offsetX || 0, 2) + 
                          Math.pow(activeText.shadow?.offsetY || 0, 2)
                        ))}
                        onChange={(e) => {
                          const distance = parseInt(e.target.value);
                          const offsetX = activeText.shadow?.offsetX || 0;
                          const offsetY = activeText.shadow?.offsetY || 0;
                          const currentAngle = Math.atan2(offsetY, offsetX);
                          updateTextElement(activeTextId, { 
                            shadow: { 
                              blur: activeText.shadow?.blur || 0,
                              offsetX: Math.cos(currentAngle) * distance,
                              offsetY: Math.sin(currentAngle) * distance,
                              color: activeText.shadow?.color || '#000000'
                            } 
                          });
                          setTimeout(() => {
                            const { composeLayers } = useApp.getState();
                            composeLayers();
                            if ((window as any).updateModelTexture) {
                              (window as any).updateModelTexture(true, true);
                            }
                          }, 10);
                        }}
                        style={{ width: '100%', accentColor: '#0066CC' }}
                      />
                    </div>

                    {/* Shadow Opacity */}
                    <div style={{ marginBottom: '4px' }}>
                      <div style={{ fontSize: '7px', color: '#CCC', marginBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Shadow Opacity</span>
                        <span style={{ color: '#999' }}>100%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        defaultValue="1"
                        style={{ width: '100%', accentColor: '#0066CC' }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this text?')) {
                          deleteTextElement(activeTextId);
                        }
                      }}
                      style={{ 
                        flex: 1, 
                        padding: '4px', 
                        background: '#dc3545',
                        color: '#ffffff',
                        fontSize: '8px',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      🗑️ Delete
                    </button>
                    <button
                      onClick={() => {
                        addTextElement(activeText.text, { u: activeText.u + 0.05, v: activeText.v + 0.05 });
                      }}
                      style={{ 
                        flex: 1, 
                        padding: '4px', 
                        background: '#28a745',
                        color: '#ffffff',
                        fontSize: '8px',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      📋 Duplicate
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Text Import Features */}
            <div style={{ marginTop: '8px', padding: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '8px', color: '#CCC', fontWeight: '600', marginBottom: '4px' }}>
                🔗 Import Text
              </div>
              
              {/* Import from URL */}
              <div style={{ marginBottom: '4px' }}>
                <input
                  type="text"
                  placeholder="Enter URL to extract text"
                  onKeyPress={async (e) => {
                    if (e.key === 'Enter') {
                      const url = e.currentTarget.value.trim();
                      if (url) {
                        try {
                          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
                          const response = await fetch(proxyUrl);
                          const data = await response.json();
                          
                          if (data.contents) {
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(data.contents, 'text/html');
                            const text = doc.body.textContent || doc.body.innerText || '';
                            
                            if (text.trim()) {
                              console.log('Text extracted from URL:', text.substring(0, 100));
                              
                              // Update the active text element with extracted text
                              const { activeTextId, updateTextElement } = useApp.getState();
                              if (activeTextId) {
                                updateTextElement(activeTextId, { text: text.trim() });
                                
                                // Trigger live texture update
                                setTimeout(() => {
                                  const { composeLayers } = useApp.getState();
                                  composeLayers();
                                  if ((window as any).updateModelTexture) {
                                    (window as any).updateModelTexture(true, true);
                                  }
                                }, 10);
                                
                                alert(`✅ Text extracted and applied!\n\nExtracted text: "${text.substring(0, 200)}${text.length > 200 ? '...' : ''}"`);
                              } else {
                                alert(`Text extracted but no text element selected!\n\nExtracted text: "${text.substring(0, 200)}${text.length > 200 ? '...' : ''}"\n\nPlease select a text element first.`);
                              }
                            } else {
                              alert('No text content found in the URL.');
                            }
                          } else {
                            alert('Failed to fetch content from URL.');
                          }
                        } catch (error) {
                          console.error('Error extracting text from URL:', error);
                          alert('Error extracting text from URL.');
                        }
                      }
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '3px 4px',
                    fontSize: '7px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '2px',
                    color: '#fff'
                  }}
                />
                <div style={{ fontSize: '6px', color: '#999', marginTop: '1px' }}>
                  Press Enter to extract text
                </div>
              </div>

              {/* Import from File */}
              <div style={{ marginBottom: '4px' }}>
                <input
                  type="file"
                  accept=".txt,.md,.doc,.docx,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const text = event.target?.result as string;
                        if (text) {
                          console.log('Text loaded from file:', text.substring(0, 100));
                          
                          // Update the active text element with file text
                          const { activeTextId, updateTextElement } = useApp.getState();
                          if (activeTextId) {
                            updateTextElement(activeTextId, { text: text.trim() });
                            
                            // Trigger live texture update
                            setTimeout(() => {
                              const { composeLayers } = useApp.getState();
                              composeLayers();
                              if ((window as any).updateModelTexture) {
                                (window as any).updateModelTexture(true, true);
                              }
                            }, 10);
                            
                            alert(`✅ Text loaded and applied!\n\nFile text: "${text.substring(0, 200)}${text.length > 200 ? '...' : ''}"`);
                          } else {
                            alert(`Text loaded but no text element selected!\n\nFile text: "${text.substring(0, 200)}${text.length > 200 ? '...' : ''}"\n\nPlease select a text element first.`);
                          }
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '3px 4px',
                    fontSize: '7px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '2px',
                    color: '#fff'
                  }}
                />
                <div style={{ fontSize: '6px', color: '#999', marginTop: '1px' }}>
                  TXT, MD, DOC, DOCX, PDF
                </div>
              </div>

              {/* AI Text Detection from Image */}
              <div>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.bmp,.webp"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        alert('Processing image for text detection... This may take a few seconds.');
                        
                        const img = new Image();
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        img.onload = async () => {
                          canvas.width = img.width;
                          canvas.height = img.height;
                          ctx?.drawImage(img, 0, 0);
                          
                          try {
                            const { createWorker } = await import('tesseract.js');
                            const worker = await createWorker();
                            
                            const result = await worker.recognize(canvas);
                            await worker.terminate();
                            
                            const { text } = result.data;
                            
                            if (text.trim()) {
                              console.log('Text detected from image:', text.substring(0, 100));
                              
                              // Analyze font characteristics from text content
                              const fontAnalysis = analyzeFontFromText(text);
                              console.log('Font analysis:', fontAnalysis);
                              
                              // Apply detected font style to existing text (don't change text content)
                              const { activeTextId, updateTextElement } = useApp.getState();
                              if (activeTextId) {
                                updateTextElement(activeTextId, { 
                                  ...fontAnalysis // Apply ONLY detected font characteristics, keep existing text
                                });
                                
                                // Trigger live texture update
                                setTimeout(() => {
                                  const { composeLayers } = useApp.getState();
                                  composeLayers();
                                  if ((window as any).updateModelTexture) {
                                    (window as any).updateModelTexture(true, true);
                                  }
                                }, 10);
                                
                                alert(`✅ Font style detected and applied!\n\nDetected text in image: "${text.substring(0, 200)}${text.length > 200 ? '...' : ''}"\n\nApplied font style to your text: ${fontAnalysis.fontFamily || 'Default'}, ${fontAnalysis.fontSize || 'Auto'}px, ${fontAnalysis.bold ? 'Bold' : 'Normal'}`);
                              } else {
                                alert(`Font style detected but no text element selected!\n\nDetected text in image: "${text.substring(0, 200)}${text.length > 200 ? '...' : ''}"\n\nPlease select a text element first to apply the font style.`);
                              }
                            } else {
                              alert('No text detected in the image.');
                            }
                          } catch (ocrError) {
                            console.error('OCR Error:', ocrError);
                            alert('Error processing image for text detection.');
                          }
                        };
                        
                        img.onerror = () => {
                          alert('Error loading image.');
                        };
                        
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          img.src = event.target?.result as string;
                        };
                        reader.readAsDataURL(file);
                        
                      } catch (error) {
                        console.error('Error processing image:', error);
                        alert('Error processing image.');
                      }
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '3px 4px',
                    fontSize: '7px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '2px',
                    color: '#fff'
                  }}
                />
                <div style={{ fontSize: '6px', color: '#999', marginTop: '1px' }}>
                  AI/OCR text detection
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Settings */}
        {activeTab === 'image' && (
          <div onClick={(e) => e.stopPropagation()}>
            <div style={{
              fontSize: '11px',
              color: '#a0aec0',
              fontWeight: '700',
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
            }}>
              📷 Image Settings
            </div>
            
            {/* Image Import Section */}
            <div style={{
              padding: '12px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              marginBottom: '12px',
              borderRadius: '6px'
            }}>
              <div style={{
                fontSize: '10px',
                color: '#a0aec0',
                fontWeight: '600',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                📷 Import Images
              </div>
              
              {/* Hidden file input */}
              <input
                type="file"
                id="image-import-right-panel"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  files.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      if (event.target?.result) {
                        // Create image with UV coordinates (center of texture)
                        useApp.getState().addImportedImage({
                          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                          name: file.name,
                          dataUrl: event.target.result as string,
                          // UV coordinates (center of texture = 0.5, 0.5)
                          u: 0.5,           // Center horizontally
                          v: 0.5,           // Center vertically  
                          uWidth: 0.25,     // 25% of texture width
                          uHeight: 0.25,    // 25% of texture height
                          // Legacy pixel coords for migration
                          x: 512,
                          y: 512,
                          width: 512,
                          height: 512,
                          visible: true,
                          opacity: 1.0,
                          rotation: 0,
                          locked: false,
                          // Size linking and flip properties
                          sizeLinked: true,
                          horizontalFlip: false,
                          verticalFlip: false,
                          // Blending properties
                          blendMode: 'source-over'
                        });
                      }
                    };
                    reader.readAsDataURL(file);
                  });
                  e.target.value = ''; // Reset input
                }}
              />
              
              {/* Import button */}
              <button 
                onClick={() => document.getElementById('image-import-right-panel')?.click()}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '10px',
                  fontWeight: '600',
                  background: '#000000',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  marginBottom: '8px'
                }}
              >
                📷 Import Images
              </button>
              
              {/* Imported Images List */}
              {importedImages.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{
                    fontSize: '9px',
                    color: '#a0aec0',
                    fontWeight: '600',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Images ({importedImages.length})
                  </div>
                  <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {importedImages.map((img: any) => (
                      <div
                        key={img.id}
                        onClick={() => useApp.getState().setSelectedImageId(img.id)}
                        style={{
                          padding: '6px 8px',
                          fontSize: '9px',
                          background: selectedImageId === img.id 
                            ? 'rgba(0, 150, 255, 0.3)' 
                            : 'rgba(255, 255, 255, 0.05)',
                          border: selectedImageId === img.id
                            ? '1px solid rgba(0, 150, 255, 0.5)'
                            : '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          color: '#FFFFFF'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedImageId !== img.id) {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedImageId !== img.id) {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          }
                        }}
                      >
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {img.visible ? '👁️' : '👁️‍🗨️'} {img.locked ? '🔒' : ''} {img.name}
                        </span>
                        <span style={{ fontSize: '8px', color: '#a0aec0', marginLeft: '8px' }}>
                          {((img.uWidth || 0.25) * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {selectedImageId ? (
              <div style={{ marginTop: '8px', padding: '12px', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}>
                {(() => {
                  const selectedImage = importedImages.find(img => img.id === selectedImageId);
                  if (!selectedImage) return null;
                  
                  const { setActiveTool } = useApp.getState();
                  
                  return (
                    <>
                      {/* Move Tool Button */}
                      <button
                        onClick={() => {
                          setActiveTool('image' as any);
                          console.log('📷 Switched to Image Move Tool');
                        }}
                        style={{
                          width: '100%',
                          padding: '10px',
                          fontSize: '11px',
                          fontWeight: '700',
                          background: (activeTool as string) === 'image' ? 'rgba(0,150,255,0.4)' : 'rgba(102,126,234,0.2)',
                          color: (activeTool as string) === 'image' ? '#FFF' : '#667eea',
                          border: (activeTool as string) === 'image' ? '2px solid rgba(0,150,255,0.6)' : '1px solid rgba(102,126,234,0.3)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          marginBottom: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '1px'
                        }}
                      >
                        ✋ ENABLE MOVE TOOL
                      </button>

                      {/* Image File Name */}
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '9px', color: '#CCC', marginBottom: '4px' }}>Image File</div>
                        <input
                          type="text"
                          value={selectedImage.name}
                          readOnly
                          style={{
                            width: '100%',
                            padding: '6px',
                            fontSize: '10px',
                            background: 'rgba(255,255,255,0.1)',
                            color: '#FFF',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '4px',
                            fontFamily: 'monospace'
                          }}
                        />
                      </div>

                      {/* Position (UV) */}
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '9px', color: '#CCC', marginBottom: '6px' }}>Position (UV)</div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '8px', color: '#999', marginBottom: '2px' }}>U: {Math.round((selectedImage.u || 0.5) * 100)}%</div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={(selectedImage.u || 0.5) * 100}
                              onChange={(e) => updateImportedImage(selectedImageId, { u: parseFloat(e.target.value) / 100 })}
                              style={{ width: '100%' }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '8px', color: '#999', marginBottom: '2px' }}>V: {Math.round((selectedImage.v || 0.5) * 100)}%</div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={(selectedImage.v || 0.5) * 100}
                              onChange={(e) => updateImportedImage(selectedImageId, { v: parseFloat(e.target.value) / 100 })}
                              style={{ width: '100%' }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Size (UV) */}
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '9px', color: '#CCC', marginBottom: '6px' }}>Size (UV)</div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '8px', color: '#999', marginBottom: '2px' }}>Width: {Math.round((selectedImage.uWidth || 0.25) * 100)}%</div>
                            <input
                              type="range"
                              min="1"
                              max="100"
                              value={(selectedImage.uWidth || 0.25) * 100}
                              onChange={(e) => {
                                const newWidth = parseFloat(e.target.value) / 100;
                                const updates: any = { uWidth: newWidth };
                                if (selectedImage.sizeLinked) {
                                  updates.uHeight = newWidth;
                                }
                                updateImportedImage(selectedImageId, updates);
                              }}
                              style={{ width: '100%' }}
                            />
                          </div>
                          <button
                            onClick={() => updateImportedImage(selectedImageId, { sizeLinked: !selectedImage.sizeLinked })}
                            style={{
                              padding: '4px 8px',
                              fontSize: '8px',
                              background: selectedImage.sizeLinked ? 'rgba(0,255,0,0.2)' : 'rgba(255,255,255,0.1)',
                              color: selectedImage.sizeLinked ? '#0F0' : '#CCC',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            🔗 {selectedImage.sizeLinked ? 'Linked' : 'Unlinked'}
                          </button>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '8px', color: '#999', marginBottom: '2px' }}>Height: {Math.round((selectedImage.uHeight || 0.25) * 100)}%</div>
                            <input
                              type="range"
                              min="1"
                              max="100"
                              value={(selectedImage.uHeight || 0.25) * 100}
                              onChange={(e) => {
                                const newHeight = parseFloat(e.target.value) / 100;
                                const updates: any = { uHeight: newHeight };
                                if (selectedImage.sizeLinked) {
                                  updates.uWidth = newHeight;
                                }
                                updateImportedImage(selectedImageId, updates);
                              }}
                              style={{ width: '100%' }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Rotation & Transform */}
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '9px', color: '#CCC', marginBottom: '6px' }}>Rotation & Transform</div>
                        <div style={{ fontSize: '8px', color: '#999', marginBottom: '4px' }}>Angle: {selectedImage.rotation || 0}°</div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={selectedImage.rotation || 0}
                          onChange={(e) => updateImportedImage(selectedImageId, { rotation: parseInt(e.target.value) })}
                          style={{ width: '100%', marginBottom: '8px' }}
                        />
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                          <button
                            onClick={() => updateImportedImage(selectedImageId, { rotation: 90 })}
                            style={{
                              flex: 1,
                              padding: '6px',
                              fontSize: '9px',
                              background: 'rgba(255,255,255,0.1)',
                              color: '#CCC',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            90°
                          </button>
                          <button
                            onClick={() => updateImportedImage(selectedImageId, { rotation: 180 })}
                            style={{
                              flex: 1,
                              padding: '6px',
                              fontSize: '9px',
                              background: 'rgba(255,255,255,0.1)',
                              color: '#CCC',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            180°
                          </button>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => updateImportedImage(selectedImageId, { horizontalFlip: !selectedImage.horizontalFlip })}
                            style={{
                              flex: 1,
                              padding: '6px',
                              fontSize: '9px',
                              background: selectedImage.horizontalFlip ? 'rgba(0,150,255,0.3)' : 'rgba(255,255,255,0.1)',
                              color: selectedImage.horizontalFlip ? '#FFF' : '#CCC',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                          >
                            ↔️ H-Flip
                          </button>
                          <button
                            onClick={() => updateImportedImage(selectedImageId, { verticalFlip: !selectedImage.verticalFlip })}
                            style={{
                              flex: 1,
                              padding: '6px',
                              fontSize: '9px',
                              background: selectedImage.verticalFlip ? 'rgba(0,150,255,0.3)' : 'rgba(255,255,255,0.1)',
                              color: selectedImage.verticalFlip ? '#FFF' : '#CCC',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                          >
                            ↕️ V-Flip
                          </button>
                        </div>
                      </div>

                      {/* Opacity */}
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '9px', color: '#CCC', marginBottom: '4px' }}>Opacity: {Math.round((selectedImage.opacity || 1) * 100)}%</div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={(selectedImage.opacity || 1) * 100}
                          onChange={(e) => updateImportedImage(selectedImageId, { opacity: parseInt(e.target.value) / 100 })}
                          style={{ width: '100%' }}
                        />
                      </div>

                      {/* Blend Mode */}
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '9px', color: '#CCC', marginBottom: '4px' }}>Blend Mode</div>
                        <select
                          value={selectedImage.blendMode || 'source-over'}
                          onChange={(e) => updateImportedImage(selectedImageId, { blendMode: e.target.value as GlobalCompositeOperation })}
                          style={{
                            width: '100%',
                            padding: '6px',
                            fontSize: '10px',
                            background: 'rgba(255,255,255,0.1)',
                            color: '#FFF',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '4px'
                          }}
                        >
                          <option value="source-over">Normal</option>
                          <option value="multiply">Multiply</option>
                          <option value="screen">Screen</option>
                          <option value="overlay">Overlay</option>
                          <option value="soft-light">Soft Light</option>
                          <option value="hard-light">Hard Light</option>
                          <option value="color-dodge">Color Dodge</option>
                          <option value="color-burn">Color Burn</option>
                          <option value="darken">Darken</option>
                          <option value="lighten">Lighten</option>
                          <option value="difference">Difference</option>
                          <option value="exclusion">Exclusion</option>
                        </select>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                        <button
                          onClick={() => updateImportedImage(selectedImageId, { visible: !selectedImage.visible })}
                          style={{
                            flex: 1,
                            padding: '8px',
                            fontSize: '10px',
                            background: selectedImage.visible ? 'rgba(0,255,0,0.2)' : 'rgba(255,0,0,0.2)',
                            color: selectedImage.visible ? '#0F0' : '#F00',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          {selectedImage.visible ? '👁️' : '🙈'} {selectedImage.visible ? 'Visible' : 'Hidden'}
                        </button>
                        <button
                          onClick={() => updateImportedImage(selectedImageId, { locked: !selectedImage.locked })}
                          style={{
                            flex: 1,
                            padding: '8px',
                            fontSize: '10px',
                            background: selectedImage.locked ? 'rgba(255,165,0,0.2)' : 'rgba(255,255,255,0.1)',
                            color: selectedImage.locked ? '#FFA500' : '#CCC',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          {selectedImage.locked ? '🔒' : '🔓'} {selectedImage.locked ? 'Locked' : 'Unlocked'}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this image?')) {
                              removeImportedImage(selectedImageId);
                            }
                          }}
                          style={{
                            flex: 1,
                            padding: '8px',
                            fontSize: '10px',
                            background: 'rgba(255,0,0,0.2)',
                            color: '#F00',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>

                      {/* Utility Buttons */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => {
                            updateImportedImage(selectedImageId, { 
                              u: 0.5, 
                              v: 0.5 
                            });
                          }}
                          style={{
                            flex: 1,
                            padding: '8px',
                            fontSize: '10px',
                            background: 'rgba(0,150,255,0.2)',
                            color: '#0096FF',
                            border: '1px solid rgba(0,150,255,0.3)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          🎯 Center
                        </button>
                        <button
                          onClick={() => {
                            updateImportedImage(selectedImageId, {
                              uWidth: 0.25,
                              uHeight: 0.25
                            });
                          }}
                          style={{
                            flex: 1,
                            padding: '8px',
                            fontSize: '10px',
                            background: 'rgba(255,165,0,0.2)',
                            color: '#FFA500',
                            border: '1px solid rgba(255,165,0,0.3)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          🔄 Reset Size
                        </button>
                      </div>

                      {/* Keyboard Shortcuts Info */}
                      <div style={{ 
                        marginTop: '12px', 
                        padding: '8px', 
                        background: 'rgba(0,0,0,0.3)', 
                        borderRadius: '4px',
                        fontSize: '8px',
                        color: '#999',
                        lineHeight: '1.4'
                      }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px', color: '#CCC' }}>Keyboard Shortcuts:</div>
                        <div>• Click and drag to move image</div>
                        <div>• Hold Shift while dragging for precise movement</div>
                        <div>• Use mouse wheel to resize (when move tool active)</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div style={{ 
                padding: '20px', 
                textAlign: 'center', 
                color: '#666',
                fontSize: '11px'
              }}>
                No image selected. Import an image from the left panel to edit it here.
              </div>
            )}
          </div>
        )}

        {/* Picker Settings */}
        {activeTab === 'picker' && (
          <div onClick={(e) => e.stopPropagation()}>
            <div style={{
              fontSize: '10px',
              color: '#999',
              fontWeight: '600',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Color Picker Settings
            </div>

            {/* Current Color Display */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                fontSize: '9px',
                color: '#CCC',
                marginBottom: '8px'
              }}>
                Selected Color
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  width: '40px',
                  height: '30px',
                  background: brushColor,
                  borderRadius: '4px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                }} />
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div style={{
                    fontSize: '10px',
                    color: '#fff',
                    fontFamily: 'monospace',
                    fontWeight: '600'
                  }}>
                    {brushColor}
                  </div>
                  <div style={{
                    fontSize: '8px',
                    color: '#999'
                  }}>
                    Click on model to pick color
                  </div>
                </div>
              </div>
            </div>

            {/* Color Code Input */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                fontSize: '9px',
                color: '#CCC',
                marginBottom: '6px'
              }}>
                Color Code
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <input
                  type="text"
                  value={brushColor}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#[0-9A-Fa-f]{6}$/.test(value) || /^#[0-9A-Fa-f]{3}$/.test(value)) {
                      setBrushColor(value);
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    fontSize: '9px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '4px',
                    color: '#fff',
                    fontFamily: 'monospace'
                  }}
                  placeholder="#000000"
                />
                <button
                  onClick={() => {
                    // Copy color to clipboard
                    navigator.clipboard.writeText(brushColor);
                    console.log('🎨 Color copied to clipboard:', brushColor);
                  }}
                  style={{
                    padding: '6px 8px',
                    background: '#0066CC',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div style={{
              padding: '8px',
              background: 'rgba(0, 102, 204, 0.1)',
              borderRadius: '6px',
              border: '1px solid rgba(0, 102, 204, 0.3)'
            }}>
              <div style={{
                fontSize: '8px',
                color: '#66B3FF',
                lineHeight: '1.4'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>How to use:</div>
                <div>1. Click on any color in the model</div>
                <div>2. The color will be picked and displayed here</div>
                <div>3. You can manually edit the color code above</div>
                <div>4. The picked color will be applied to your brush</div>
              </div>
            </div>
          </div>
        )}

        {/* Symmetry Settings */}
        {activeTab === 'symmetry' && (
          <div onClick={(e) => e.stopPropagation()}>
            <div style={{
              fontSize: '10px',
              color: '#999',
              fontWeight: '600',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Symmetry
            </div>

            {/* X Symmetry */}
            <div style={{ marginBottom: '8px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '9px',
                color: '#CCC',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={symmetryX}
                  onChange={(e) => setSymmetryX(e.target.checked)}
                  style={{ accentColor: '#0066CC' }}
                />
                <span>X-Axis</span>
              </label>
            </div>

            {/* Y Symmetry */}
            <div style={{ marginBottom: '8px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '9px',
                color: '#CCC',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={symmetryY}
                  onChange={(e) => setSymmetryY(e.target.checked)}
                  style={{ accentColor: '#0066CC' }}
                />
                <span>Y-Axis</span>
              </label>
            </div>

            {/* Z Symmetry */}
            <div style={{ marginBottom: '8px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '9px',
                color: '#CCC',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={symmetryZ}
                  onChange={(e) => setSymmetryZ(e.target.checked)}
                  style={{ accentColor: '#0066CC' }}
                />
                <span>Z-Axis</span>
              </label>
            </div>
          </div>
        )}

        {/* Layer Settings */}
        {activeTab === 'layers' && (
          <div onClick={(e) => e.stopPropagation()}>
            <div style={{
              fontSize: '11px',
              color: '#a0aec0',
              fontWeight: '700',
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
            }}>
              🎨 Layer Settings
            </div>
            
            {/* Active Layer Info */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                fontSize: '9px',
                color: '#CCC',
                marginBottom: '4px'
              }}>
                Active Layer
              </div>
              <div style={{
                padding: '6px 8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                fontSize: '10px',
                color: '#a0aec0'
              }}>
                {(() => {
                  const { activeLayerId, layers } = useLayerManager.getState();
                  const activeLayer = activeLayerId ? layers.get(activeLayerId) : null;
                  return activeLayer ? `${activeLayer.name} (${activeLayer.type})` : 'No active layer';
                })()}
              </div>
            </div>

            {/* Layer Actions */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                fontSize: '9px',
                color: '#CCC',
                marginBottom: '6px'
              }}>
                Quick Actions
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    const { createLayer } = useLayerManager.getState();
                    createLayer('raster', 'New Paint Layer');
                  }}
                  style={{
                    padding: '4px 8px',
                    fontSize: '9px',
                    background: '#000000',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  + Paint
                </button>
                <button
                  onClick={() => {
                    const { createLayer } = useLayerManager.getState();
                    createLayer('puff', 'New Puff Layer');
                  }}
                  style={{
                    padding: '4px 8px',
                    fontSize: '9px',
                    background: '#000000',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  + Puff
                </button>
                <button
                  onClick={() => {
                    const { createLayer } = useLayerManager.getState();
                    createLayer('vector', 'New Vector Layer');
                  }}
                  style={{
                    padding: '4px 8px',
                    fontSize: '9px',
                    background: '#000000',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  + Vector
                </button>
                <button
                  onClick={() => {
                    const { createLayer } = useLayerManager.getState();
                    createLayer('embroidery', 'New Embroidery Layer');
                  }}
                  style={{
                    padding: '4px 8px',
                    fontSize: '9px',
                    background: '#000000',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  + Embroidery
                </button>
              </div>
            </div>

            {/* Layer Statistics */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                fontSize: '9px',
                color: '#CCC',
                marginBottom: '6px'
              }}>
                Layer Statistics
              </div>
              <div style={{
                padding: '6px 8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                fontSize: '9px',
                color: '#a0aec0'
              }}>
                {(() => {
                  const { layers, layerOrder } = useLayerManager.getState();
                  const totalLayers = layerOrder.length;
                  const visibleLayers = layerOrder.filter(id => {
                    const layer = layers.get(id);
                    return layer && layer.visible;
                  }).length;
                  const lockedLayers = layerOrder.filter(id => {
                    const layer = layers.get(id);
                    return layer && layer.locked;
                  }).length;
                  
                  return (
                    <div>
                      <div>Total: {totalLayers}</div>
                      <div>Visible: {visibleLayers}</div>
                      <div>Locked: {lockedLayers}</div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Layer Composition */}
            <div>
              <div style={{
                fontSize: '9px',
                color: '#CCC',
                marginBottom: '6px'
              }}>
                Composition
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => {
                    const { composeLayers } = useLayerManager.getState();
                    composeLayers();
                  }}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    fontSize: '9px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  🔄 Compose
                </button>
                <button
                  onClick={() => {
                    const { invalidateComposition } = useLayerManager.getState();
                    invalidateComposition();
                  }}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    fontSize: '9px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ⚡ Refresh
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Shapes Settings */}
        {activeTab === 'shapes' && (
          <div onClick={(e) => e.stopPropagation()}>
            <div style={{
              fontSize: '10px',
              color: '#999',
              fontWeight: '600',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              🔷 Shape Tools
            </div>

            {/* Shape Type Selection */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '9px', color: '#CCC', marginBottom: '4px' }}>Shape Type</div>
              <select
                value={useApp.getState().shapeType || 'rectangle'}
                onChange={(e) => useApp.setState({ shapeType: e.target.value })}
                style={{
                  width: '100%',
                  padding: '4px',
                  fontSize: '8px',
                  background: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '3px',
                  color: '#ffffff'
                }}
              >
                <option value="rectangle">Rectangle</option>
                <option value="circle">Circle</option>
                <option value="triangle">Triangle</option>
                <option value="star">Star</option>
                <option value="heart">Heart</option>
                <option value="diamond">Diamond</option>
              </select>
            </div>

            {/* Shape Size */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '9px', color: '#CCC', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Size</span>
                <span style={{ fontSize: '8px', color: '#999' }}>{useApp.getState().shapeSize || 50}px</span>
              </div>
              <input
                type="range"
                min="10"
                max="1000"
                value={useApp.getState().shapeSize || 50}
                onChange={(e) => useApp.setState({ shapeSize: Number(e.target.value) })}
                style={{ width: '100%', accentColor: '#0066CC' }}
              />
            </div>

            {/* Shape Opacity */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '9px', color: '#CCC', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Opacity</span>
                <span style={{ fontSize: '8px', color: '#999' }}>{Math.round((useApp.getState().shapeOpacity || 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={useApp.getState().shapeOpacity || 1}
                onChange={(e) => useApp.setState({ shapeOpacity: Number(e.target.value) })}
                style={{ width: '100%', accentColor: '#0066CC' }}
              />
            </div>

            {/* Shape Color Mode Tabs */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '9px', color: '#CCC', marginBottom: '4px' }}>Color Mode</div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                <button
                  onClick={() => setShapesColorMode('solid')}
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    fontSize: '8px',
                    background: shapesColorMode === 'solid' ? '#0066CC' : 'rgba(255,255,255,0.1)',
                    color: shapesColorMode === 'solid' ? '#FFFFFF' : '#CCC',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  🎨 Solid
                </button>
                <button
                  onClick={() => setShapesColorMode('gradient')}
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    fontSize: '8px',
                    background: shapesColorMode === 'gradient' ? '#0066CC' : 'rgba(255,255,255,0.1)',
                    color: shapesColorMode === 'gradient' ? '#FFFFFF' : '#CCC',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  🌈 Gradient
                </button>
              </div>

              {/* Solid Color */}
              {shapesColorMode === 'solid' && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '4px' }}>Color</div>
                  <HexColorPicker
                    color={useApp.getState().shapeColor || '#ff69b4'}
                    onChange={(color) => {
                      useApp.setState({ shapeColor: color });
                      setTimeout(() => {
                        const { composeLayers } = useApp.getState();
                        composeLayers();
                        if ((window as any).updateModelTexture) {
                          (window as any).updateModelTexture(true, true);
                        }
                      }, 10);
                    }}
                    style={{ width: '100%', height: '60px' }}
                  />
                </div>
              )}

              {/* Gradient Controls */}
              {shapesColorMode === 'gradient' && (
                <div style={{ marginBottom: '8px', padding: '6px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '6px', fontWeight: '600' }}>🌈 Gradient Settings</div>
                  
                  {/* Gradient Type */}
                  <div style={{ marginBottom: '6px' }}>
                    <div style={{ fontSize: '7px', color: '#CCC', marginBottom: '2px' }}>Type</div>
                    <select
                      value={shapesGradient.type}
                      onChange={(e) => setShapesGradient({ ...shapesGradient, type: e.target.value as any })}
                      style={{ width: '100%', padding: '2px 4px', fontSize: '7px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '2px', color: '#fff' }}
                    >
                      <option value="linear">Linear</option>
                      <option value="radial">Radial</option>
                      <option value="angular">Angular</option>
                      <option value="diamond">Diamond</option>
                    </select>
                  </div>

                  {/* Gradient Angle */}
                  <div style={{ marginBottom: '6px' }}>
                    <div style={{ fontSize: '7px', color: '#CCC', marginBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Angle</span>
                      <span style={{ color: '#999' }}>{shapesGradient.angle}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={shapesGradient.angle}
                      onChange={(e) => setShapesGradient({ ...shapesGradient, angle: parseInt(e.target.value) })}
                      style={{ width: '100%', accentColor: '#BA55D3' }}
                    />
                  </div>

                  {/* Gradient Preview */}
                  <div style={{ marginBottom: '6px' }}>
                    <div style={{ fontSize: '7px', color: '#CCC', marginBottom: '2px' }}>Preview</div>
                    <div
                      style={{
                        width: '100%',
                        height: '20px',
                        background: getGradientCSS(shapesGradient),
                        borderRadius: '3px',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}
                    />
                  </div>

                  {/* Color Stops */}
                  <div style={{ marginBottom: '6px' }}>
                    <div style={{ fontSize: '7px', color: '#CCC', marginBottom: '4px' }}>Color Stops</div>
                    
                    {shapesGradient.stops.map((stop, index) => (
                      <div key={stop.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <input
                          type="color"
                          value={stop.color}
                          onChange={(e) => {
                            const newStops = [...shapesGradient.stops];
                            newStops[index] = { ...stop, color: e.target.value };
                            setShapesGradient({ ...shapesGradient, stops: newStops });
                          }}
                          style={{ width: '20px', height: '20px', border: 'none', cursor: 'pointer', borderRadius: '2px' }}
                        />
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={stop.position}
                          onChange={(e) => {
                            const newStops = [...shapesGradient.stops];
                            newStops[index] = { ...stop, position: parseInt(e.target.value) };
                            setShapesGradient({ ...shapesGradient, stops: newStops });
                          }}
                          style={{ flex: 1, accentColor: '#BA55D3' }}
                        />
                        <span style={{ fontSize: '6px', color: '#999', minWidth: '25px' }}>{stop.position}%</span>
                        {shapesGradient.stops.length > 2 && (
                          <button
                            onClick={() => {
                              const newStops = shapesGradient.stops.filter((_, i) => i !== index);
                              setShapesGradient({ ...shapesGradient, stops: newStops });
                            }}
                            style={{ background: 'rgba(255,0,0,0.3)', border: 'none', color: '#fff', borderRadius: '2px', padding: '2px 4px', fontSize: '6px', cursor: 'pointer' }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    
                    <button
                      onClick={() => {
                        const newStop = {
                          id: Date.now().toString(),
                          color: '#ffffff',
                          position: 50
                        };
                        setShapesGradient({ ...shapesGradient, stops: [...shapesGradient.stops, newStop] });
                      }}
                      style={{ width: '100%', padding: '4px', fontSize: '7px', background: 'rgba(0,255,0,0.2)', border: '1px solid rgba(0,255,0,0.3)', borderRadius: '2px', color: '#fff', cursor: 'pointer' }}
                    >
                      + Add Color Stop
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Shape Rotation */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '9px', color: '#CCC', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Rotation</span>
                <span style={{ fontSize: '8px', color: '#999' }}>{useApp.getState().shapeRotation || 0}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={useApp.getState().shapeRotation || 0}
                onChange={(e) => useApp.setState({ shapeRotation: Number(e.target.value) })}
                style={{ width: '100%', accentColor: '#0066CC' }}
              />
            </div>

            {/* Shape Position */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '9px', color: '#CCC', marginBottom: '4px' }}>Position</div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '7px', color: '#CCC', marginBottom: '2px' }}>X</div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={useApp.getState().shapePositionX || 50}
                    onChange={(e) => useApp.setState({ shapePositionX: Number(e.target.value) })}
                    style={{ width: '100%', accentColor: '#0066CC' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '7px', color: '#CCC', marginBottom: '2px' }}>Y</div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={useApp.getState().shapePositionY || 50}
                    onChange={(e) => useApp.setState({ shapePositionY: Number(e.target.value) })}
                    style={{ width: '100%', accentColor: '#0066CC' }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
              <button
                onClick={() => {
                  // Add shape to the model
                  const { addShapeElement } = useApp.getState();
                  if (addShapeElement) {
                    addShapeElement({
                      type: useApp.getState().shapeType || 'rectangle',
                      size: useApp.getState().shapeSize || 50,
                      opacity: useApp.getState().shapeOpacity || 1,
                      color: useApp.getState().shapeColor || '#ff69b4',
                      rotation: useApp.getState().shapeRotation || 0,
                      positionX: useApp.getState().shapePositionX || 50,
                      positionY: useApp.getState().shapePositionY || 50,
                      gradient: shapesColorMode === 'gradient' ? shapesGradient : null
                    });
                  }
                }}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  fontSize: '9px',
                  background: 'rgba(0, 150, 255, 0.2)',
                  color: '#66B3FF',
                  border: '1px solid rgba(0, 150, 255, 0.3)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                ➕ Add Shape
              </button>
              <button
                onClick={() => {
                  // Clear all shapes
                  const { clearShapes } = useApp.getState();
                  if (clearShapes) {
                    clearShapes();
                  }
                }}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  fontSize: '9px',
                  background: 'rgba(255, 0, 0, 0.2)',
                  color: '#FF6666',
                  border: '1px solid rgba(255, 0, 0, 0.3)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                🗑️ Clear All
              </button>
            </div>
          </div>
        )}

        {/* Shapes Panel */}
        {(activeTool === 'shapes' || activeTool === 'move') && (
          <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '9px', fontWeight: '600', marginBottom: '8px', color: '#FFF' }}>
              🔷 Shapes
            </div>
            
            {/* Shape List */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '4px' }}>Shape List</div>
              <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                {shapeElements.map((shape) => (
                  <div
                    key={shape.id}
                    onClick={() => setActiveShapeId(shape.id)}
                    style={{
                      padding: '6px 8px',
                      fontSize: '8px',
                      background: activeShapeId === shape.id ? 'rgba(0,150,255,0.3)' : 'transparent',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '10px' }}>
                        {shape.type === 'rectangle' ? '⬜' : 
                         shape.type === 'circle' ? '⭕' : 
                         shape.type === 'triangle' ? '🔺' : 
                         shape.type === 'star' ? '⭐' : 
                         shape.type === 'heart' ? '❤️' : 
                         shape.type === 'diamond' ? '💎' : '⬜'}
                      </span>
                      <span style={{ color: activeShapeId === shape.id ? '#66B3FF' : '#FFF' }}>
                        {shape.name || `Shape ${shape.id.slice(0, 4)}`}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newName = window.prompt('Rename shape:', shape.name || 'Shape');
                          if (newName && newName.trim()) {
                            updateShapeElement(shape.id, { name: newName.trim() });
                          }
                        }}
                        style={{
                          padding: '2px 4px',
                          fontSize: '7px',
                          background: 'rgba(255,255,255,0.1)',
                          color: '#FFF',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '2px',
                          cursor: 'pointer'
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateShapeElement(shape.id);
                          
                          // Trigger live texture update
                          setTimeout(() => {
                            if ((window as any).updateModelTexture) {
                              (window as any).updateModelTexture(true, true);
                            }
                          }, 10);
                        }}
                        style={{
                          padding: '2px 4px',
                          fontSize: '7px',
                          background: 'rgba(0,255,0,0.1)',
                          color: '#66FF66',
                          border: '1px solid rgba(0,255,0,0.3)',
                          borderRadius: '2px',
                          cursor: 'pointer'
                        }}
                      >
                        📋
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Delete this shape?')) {
                            deleteShapeElement(shape.id);
                            
                            // Trigger live texture update
                            setTimeout(() => {
                              const { composeLayers } = useApp.getState();
                              composeLayers();
                              if ((window as any).updateModelTexture) {
                                (window as any).updateModelTexture(true, true);
                              }
                            }, 10);
                          }
                        }}
                        style={{
                          padding: '2px 4px',
                          fontSize: '7px',
                          background: 'rgba(255,0,0,0.1)',
                          color: '#FF6666',
                          border: '1px solid rgba(255,0,0,0.3)',
                          borderRadius: '2px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
                {shapeElements.length === 0 && (
                  <div style={{ padding: '12px', textAlign: 'center', fontSize: '8px', color: '#666' }}>
                    No shapes created yet
                  </div>
                )}
              </div>
            </div>

            {/* Active Shape Controls */}
            {activeShapeId && activeShape && (
              <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(0,150,255,0.1)', borderRadius: '4px', border: '1px solid rgba(0,150,255,0.3)' }}>
                <div style={{ fontSize: '9px', fontWeight: '600', marginBottom: '6px', color: '#66B3FF' }}>
                  Editing: "{activeShape.name}"
                </div>
                
                {/* Shape Type */}
                <div style={{ marginBottom: '6px' }}>
                  <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '2px' }}>Shape Type</div>
                  <select
                    value={activeShape.type}
                    onChange={(e) => {
                      updateShapeElement(activeShapeId, { type: e.target.value });
                      setTimeout(() => {
                        if ((window as any).updateModelTexture) {
                          (window as any).updateModelTexture(true, true);
                        }
                      }, 10);
                    }}
                    style={{
                      width: '100%',
                      padding: '4px 6px',
                      fontSize: '8px',
                      background: 'rgba(0,0,0,0.8)',
                      color: '#FFF',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="rectangle">Rectangle</option>
                    <option value="circle">Circle</option>
                    <option value="triangle">Triangle</option>
                    <option value="star">Star</option>
                    <option value="heart">Heart</option>
                    <option value="diamond">Diamond</option>
                  </select>
                </div>

                {/* Shape Size */}
                <div style={{ marginBottom: '6px' }}>
                  <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '2px' }}>Size: {activeShape.size}px</div>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    value={activeShape.size}
                    onChange={(e) => {
                      updateShapeElement(activeShapeId, { size: parseInt(e.target.value) });
                      setTimeout(() => {
                        if ((window as any).updateModelTexture) {
                          (window as any).updateModelTexture(true, true);
                        }
                      }, 10);
                    }}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Shape Rotation */}
                <div style={{ marginBottom: '6px' }}>
                  <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '2px' }}>Rotation: {activeShape.rotation}°</div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={activeShape.rotation}
                    onChange={(e) => {
                      updateShapeElement(activeShapeId, { rotation: parseInt(e.target.value) });
                      setTimeout(() => {
                        if ((window as any).updateModelTexture) {
                          (window as any).updateModelTexture(true, true);
                        }
                      }, 10);
                    }}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Shape Opacity */}
                <div style={{ marginBottom: '6px' }}>
                  <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '2px' }}>Opacity: {Math.round(activeShape.opacity * 100)}%</div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={activeShape.opacity}
                    onChange={(e) => {
                      updateShapeElement(activeShapeId, { opacity: parseFloat(e.target.value) });
                      setTimeout(() => {
                        if ((window as any).updateModelTexture) {
                          (window as any).updateModelTexture(true, true);
                        }
                      }, 10);
                    }}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Shape Color */}
                <div style={{ marginBottom: '6px' }}>
                  <div style={{ fontSize: '8px', color: '#CCC', marginBottom: '2px' }}>Color</div>
                  
                  {/* Color Mode Tabs */}
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                    <button
                      onClick={() => {
                        // Update the active shape to use solid color mode
                        updateShapeElement(activeShapeId, { gradient: null });
                        setTimeout(() => {
                          if ((window as any).updateModelTexture) {
                            (window as any).updateModelTexture(true, true);
                          }
                        }, 10);
                      }}
                      style={{
                        flex: 1,
                        padding: '4px 6px',
                        fontSize: '8px',
                        background: !activeShape.gradient ? '#0066CC' : 'rgba(255,255,255,0.1)',
                        color: !activeShape.gradient ? '#FFFFFF' : '#CCC',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      🎨 Solid
                    </button>
                    <button
                      onClick={() => {
                        // Update the active shape to use gradient mode
                        updateShapeElement(activeShapeId, { gradient: shapesGradient });
                        setTimeout(() => {
                          if ((window as any).updateModelTexture) {
                            (window as any).updateModelTexture(true, true);
                          }
                        }, 10);
                      }}
                      style={{
                        flex: 1,
                        padding: '4px 6px',
                        fontSize: '8px',
                        background: activeShape.gradient ? '#0066CC' : 'rgba(255,255,255,0.1)',
                        color: activeShape.gradient ? '#FFFFFF' : '#CCC',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      🌈 Gradient
                    </button>
                  </div>

                  {/* Solid Color */}
                  {!activeShape.gradient && (
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={activeShape.color}
                        onChange={(e) => {
                          updateShapeElement(activeShapeId, { color: e.target.value });
                          setTimeout(() => {
                            if ((window as any).updateModelTexture) {
                              (window as any).updateModelTexture(true, true);
                            }
                          }, 10);
                        }}
                        style={{
                          width: '24px',
                          height: '20px',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      />
                      <input
                        type="text"
                        value={activeShape.color}
                        onChange={(e) => {
                          updateShapeElement(activeShapeId, { color: e.target.value });
                          setTimeout(() => {
                            if ((window as any).updateModelTexture) {
                              (window as any).updateModelTexture(true, true);
                            }
                          }, 10);
                        }}
                        style={{
                          flex: 1,
                          padding: '4px 6px',
                          fontSize: '8px',
                          background: 'rgba(0,0,0,0.5)',
                          color: '#FFF',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  )}

                  {/* Gradient Controls */}
                  {activeShape.gradient && (
                    <div>
                      {/* Gradient Type */}
                      <div style={{ marginBottom: '6px' }}>
                        <div style={{ fontSize: '7px', color: '#CCC', marginBottom: '2px' }}>Type</div>
                        <select
                          value={activeShape.gradient.type}
                          onChange={(e) => {
                            const newGradient = { ...activeShape.gradient, type: e.target.value };
                            updateShapeElement(activeShapeId, { gradient: newGradient });
                            setTimeout(() => {
                              if ((window as any).updateModelTexture) {
                                (window as any).updateModelTexture(true, true);
                              }
                            }, 10);
                          }}
                          style={{ width: '100%', padding: '2px 4px', fontSize: '7px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '2px', color: '#fff' }}
                        >
                          <option value="linear">Linear</option>
                          <option value="radial">Radial</option>
                          <option value="angular">Angular</option>
                          <option value="diamond">Diamond</option>
                        </select>
                      </div>

                      {/* Gradient Angle */}
                      <div style={{ marginBottom: '6px' }}>
                        <div style={{ fontSize: '7px', color: '#CCC', marginBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Angle</span>
                          <span style={{ color: '#999' }}>{activeShape.gradient.angle}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={activeShape.gradient.angle}
                          onChange={(e) => {
                            const newGradient = { ...activeShape.gradient, angle: parseInt(e.target.value) };
                            updateShapeElement(activeShapeId, { gradient: newGradient });
                            setTimeout(() => {
                              if ((window as any).updateModelTexture) {
                                (window as any).updateModelTexture(true, true);
                              }
                            }, 10);
                          }}
                          style={{ width: '100%', accentColor: '#BA55D3' }}
                        />
                      </div>

                      {/* Gradient Preview */}
                      <div style={{ marginBottom: '6px' }}>
                        <div style={{ fontSize: '7px', color: '#CCC', marginBottom: '2px' }}>Preview</div>
                        <div
                          style={{
                            width: '100%',
                            height: '20px',
                            background: getGradientCSS(activeShape.gradient),
                            borderRadius: '3px',
                            border: '1px solid rgba(255,255,255,0.2)'
                          }}
                        />
                      </div>

                      {/* Color Stops */}
                      <div style={{ marginBottom: '6px' }}>
                        <div style={{ fontSize: '7px', color: '#CCC', marginBottom: '4px' }}>Color Stops</div>
                        
                        {activeShape.gradient.stops.map((stop: any, index: number) => (
                          <div key={stop.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                            <input
                              type="color"
                              value={stop.color}
                              onChange={(e) => {
                                const newStops = [...activeShape.gradient.stops];
                                newStops[index] = { ...stop, color: e.target.value };
                                const newGradient = { ...activeShape.gradient, stops: newStops };
                                updateShapeElement(activeShapeId, { gradient: newGradient });
                                setTimeout(() => {
                                  if ((window as any).updateModelTexture) {
                                    (window as any).updateModelTexture(true, true);
                                  }
                                }, 10);
                              }}
                              style={{ width: '20px', height: '20px', border: 'none', cursor: 'pointer', borderRadius: '2px' }}
                            />
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={stop.position}
                              onChange={(e) => {
                                const newStops = [...activeShape.gradient.stops];
                                newStops[index] = { ...stop, position: parseInt(e.target.value) };
                                const newGradient = { ...activeShape.gradient, stops: newStops };
                                updateShapeElement(activeShapeId, { gradient: newGradient });
                                setTimeout(() => {
                                  if ((window as any).updateModelTexture) {
                                    (window as any).updateModelTexture(true, true);
                                  }
                                }, 10);
                              }}
                              style={{ flex: 1, accentColor: '#BA55D3' }}
                            />
                            <span style={{ fontSize: '6px', color: '#999', minWidth: '25px' }}>{stop.position}%</span>
                            {activeShape.gradient.stops.length > 2 && (
                              <button
                                onClick={() => {
                                  const newStops = activeShape.gradient.stops.filter((_: any, i: number) => i !== index);
                                  const newGradient = { ...activeShape.gradient, stops: newStops };
                                  updateShapeElement(activeShapeId, { gradient: newGradient });
                                  setTimeout(() => {
                                    if ((window as any).updateModelTexture) {
                                      (window as any).updateModelTexture(true, true);
                                    }
                                  }, 10);
                                }}
                                style={{ background: 'rgba(255,0,0,0.3)', border: 'none', color: '#fff', borderRadius: '2px', padding: '2px 4px', fontSize: '6px', cursor: 'pointer' }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                        
                        <button
                          onClick={() => {
                            const newStop = {
                              id: Date.now().toString(),
                              color: '#ffffff',
                              position: 50
                            };
                            const newGradient = { ...activeShape.gradient, stops: [...activeShape.gradient.stops, newStop] };
                            updateShapeElement(activeShapeId, { gradient: newGradient });
                            setTimeout(() => {
                              if ((window as any).updateModelTexture) {
                                (window as any).updateModelTexture(true, true);
                              }
                            }, 10);
                          }}
                          style={{ width: '100%', padding: '4px', fontSize: '7px', background: 'rgba(0,255,0,0.2)', border: '1px solid rgba(0,255,0,0.3)', borderRadius: '2px', color: '#fff', cursor: 'pointer' }}
                        >
                          + Add Color Stop
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this shape?')) {
                        deleteShapeElement(activeShapeId);
                        setActiveShapeId(null);
                        
                        // Trigger live texture update
                        setTimeout(() => {
                          const { composeLayers } = useApp.getState();
                          composeLayers();
                          if ((window as any).updateModelTexture) {
                            (window as any).updateModelTexture(true, true);
                          }
                        }, 10);
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      fontSize: '9px',
                      background: 'rgba(255, 0, 0, 0.2)',
                      color: '#FF6666',
                      border: '1px solid rgba(255, 0, 0, 0.3)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    🗑️ Delete
                  </button>
                  <button
                    onClick={() => {
                      duplicateShapeElement(activeShapeId);
                      
                      // Trigger live texture update
                      setTimeout(() => {
                        if ((window as any).updateModelTexture) {
                          (window as any).updateModelTexture(true, true);
                        }
                      }, 10);
                    }}
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      fontSize: '9px',
                      background: 'rgba(0, 255, 0, 0.2)',
                      color: '#66FF66',
                      border: '1px solid rgba(0, 255, 0, 0.3)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    📋 Duplicate
                  </button>
                </div>

                {/* Move Tool Button */}
                <div style={{ marginTop: '8px' }}>
                  <button
                    onClick={() => {
                      // Switch to move tool
                      const { setActiveTool } = useApp.getState();
                      setActiveTool('move');
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '10px',
                      fontWeight: '600',
                      background: 'rgba(0, 150, 255, 0.3)',
                      color: '#66B3FF',
                      border: '2px solid rgba(0, 150, 255, 0.5)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    ✋ Move Tool
                    <span style={{ fontSize: '8px', opacity: 0.8 }}>
                      (Click on model to move shape)
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Clear All Shapes */}
            <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
              <button
                onClick={() => {
                  // Clear all shapes
                  const { clearShapes } = useApp.getState();
                  if (clearShapes) {
                    clearShapes();
                  }
                }}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  fontSize: '9px',
                  background: 'rgba(255, 0, 0, 0.2)',
                  color: '#FF6666',
                  border: '1px solid rgba(255, 0, 0, 0.3)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                🗑️ Clear All Shapes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


