import { HexColorPicker } from 'react-colorful';
import { useApp } from '../App';
import { Section } from './Section';
import { CustomSelect } from './CustomSelect';
import { PuffPrintTool } from './PuffPrintTool';
import { PatternMaker } from './PatternMaker';
import { AdvancedSelection } from './AdvancedSelection';
import { AIDesignAssistant } from './AIDesignAssistant';
import { PrintReadyExport } from './PrintReadyExport';
import { CloudSync } from './CloudSync';
import { LayerEffects } from './LayerEffects';
import { ColorGrading } from './ColorGrading';
import { AnimationTools } from './AnimationTools';
import { DesignTemplates } from './DesignTemplates';
import { BatchProcessing } from './BatchProcessing';
import { FeatureShowcase } from './FeatureShowcase';

interface RightPanelProps {
  activeToolSidebar?: string | null;
}

export function RightPanel({ activeToolSidebar }: RightPanelProps) {

  const color = useApp(s => s.brushColor);
  const setBrushColor = useApp(s => (s as any).setBrushColor);
  const size = useApp(s => s.brushSize);
  const recentColors = useApp(s => (s as any).recentColors || []);
  const shapeMode = useApp(s => (s as any).shapeMode || 'fill');
  const shapeStrokeWidth = useApp(s => (s as any).shapeStrokeWidth || 4);
  const opacity = useApp(s => s.brushOpacity);
  const shape = useApp(s => s.brushShape);
  const spacing = useApp(s => s.brushSpacing);
  const smoothing = useApp(s => s.brushSmoothing);
  const usePressureSize = useApp(s => s.usePressureSize);
  const usePressureOpacity = useApp(s => s.usePressureOpacity);
  const hardness = useApp(s => s.brushHardness);
  const flow = useApp(s => s.brushFlow);
  const symmetryX = useApp(s => s.symmetryX);
  const symmetryY = useApp(s => s.symmetryY);
  const symmetryZ = useApp(s => s.symmetryZ);
  const blendMode = useApp(s => s.blendMode);
  const fabric = useApp(s => s.fabricPreset);
  const textFont = useApp(s => (s as any).textFont || 'Inter, system-ui, sans-serif');
  const textSize = useApp(s => (s as any).textSize || 64);
  const textBold = useApp(s => (s as any).textBold || false);
  const textItalic = useApp(s => (s as any).textItalic || false);
  const textAlign = useApp(s => (s as any).textAlign || 'center');
  return (
    <div>
      <Section title="Color & Brush">
        <div className="label">Color</div>
        <HexColorPicker color={color} onChange={(v) => setBrushColor ? setBrushColor(v) : useApp.setState({ brushColor: v })} />
        {recentColors.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
            {recentColors.map((rc: string) => (
              <button key={rc} className="btn" style={{ padding: 6, background: rc }} title={rc}
                onClick={()=> setBrushColor ? setBrushColor(rc) : useApp.setState({ brushColor: rc })}>
                &nbsp;
              </button>
            ))}
          </div>
        )}
        <div className="label" style={{ marginTop: 10 }}>Brush Size: {size}px</div>
        <input type="range" min={1} max={256} value={size} onChange={(e) => useApp.setState({ brushSize: Number(e.target.value) })} />
        <div className="label">Opacity: {Math.round(opacity * 100)}%</div>
        <input type="range" min={0.05} max={1} step={0.05} value={opacity} onChange={(e) => useApp.setState({ brushOpacity: Number(e.target.value) })} />
        <div className="label">Shape</div>
        <CustomSelect
          value={shape}
          onChange={(v)=> useApp.setState({ brushShape: v as any })}
          options={[
            { value: 'round', label: 'Round' },
            { value: 'square', label: 'Square' },
            { value: 'airbrush', label: 'Airbrush' },
            { value: 'calligraphy', label: 'Calligraphy' },
          ]}
        />
      </Section>

      <Section title="Dynamics & Stroke" defaultOpen={false}>
        <div className="label">Shape Mode</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className={`btn ${shapeMode==='fill'?'active':''}`} onClick={()=> useApp.setState({ shapeMode: 'fill' })}>Fill</button>
          <button className={`btn ${shapeMode==='stroke'?'active':''}`} onClick={()=> useApp.setState({ shapeMode: 'stroke' })}>Stroke</button>
          <button className={`btn ${shapeMode==='both'?'active':''}`} onClick={()=> useApp.setState({ shapeMode: 'both' })}>Both</button>
        </div>
        <div className="label">Stroke Width: {shapeStrokeWidth}px</div>
        <input type="range" min={1} max={64} value={shapeStrokeWidth} onChange={(e)=> useApp.setState({ shapeStrokeWidth: Number(e.target.value) })} />
        <div className="label">Hardness: {Math.round(hardness * 100)}%</div>
        <input type="range" min={0} max={1} step={0.05} value={hardness} onChange={(e) => useApp.setState({ brushHardness: Number(e.target.value) })} />
        <div className="label">Flow: {Math.round(flow * 100)}%</div>
        <input type="range" min={0.05} max={1} step={0.05} value={flow} onChange={(e) => useApp.setState({ brushFlow: Number(e.target.value) })} />
        <div className="label">Spacing: {Math.round(spacing * 100)}%</div>
        <input type="range" min={0.05} max={1} step={0.05} value={spacing} onChange={(e) => useApp.setState({ brushSpacing: Number(e.target.value) })} />
        <div className="label">Smoothing: {Math.round(smoothing * 100)}%</div>
        <input type="range" min={0} max={1} step={0.05} value={smoothing} onChange={(e) => useApp.setState({ brushSmoothing: Number(e.target.value) })} />
        <label><input type="checkbox" checked={usePressureSize} onChange={(e) => useApp.setState({ usePressureSize: e.target.checked })} /> Pressure affects Size</label>
        <label><input type="checkbox" checked={usePressureOpacity} onChange={(e) => useApp.setState({ usePressureOpacity: e.target.checked })} /> Pressure affects Opacity</label>
      </Section>

      <Section title="Symmetry & Blend" defaultOpen={false}>
        <label><input type="checkbox" checked={symmetryX} onChange={(e) => useApp.setState({ symmetryX: e.target.checked })} /> Symmetry X</label>
        <label><input type="checkbox" checked={symmetryY} onChange={(e) => useApp.setState({ symmetryY: e.target.checked })} /> Symmetry Y</label>
        <label><input type="checkbox" checked={symmetryZ} onChange={(e) => useApp.setState({ symmetryZ: e.target.checked })} /> Symmetry Z (UV wrap)</label>
        <div className="label">Blend Mode</div>
        <CustomSelect
          value={blendMode}
          onChange={(v)=> useApp.setState({ blendMode: v as any })}
          options={[
            { value: 'source-over', label: 'source-over' },
            { value: 'multiply', label: 'multiply' },
            { value: 'screen', label: 'screen' },
            { value: 'overlay', label: 'overlay' },
            { value: 'darken', label: 'darken' },
            { value: 'lighten', label: 'lighten' },
            { value: 'color-dodge', label: 'color-dodge' },
            { value: 'color-burn', label: 'color-burn' },
            { value: 'hard-light', label: 'hard-light' },
            { value: 'soft-light', label: 'soft-light' },
            { value: 'difference', label: 'difference' },
            { value: 'exclusion', label: 'exclusion' },
            { value: 'hue', label: 'hue' },
            { value: 'saturation', label: 'saturation' },
            { value: 'color', label: 'color' },
            { value: 'luminosity', label: 'luminosity' },
          ]}
        />
      </Section>

      <Section title="Fabric" defaultOpen={false}>
        <CustomSelect
          value={fabric}
          onChange={(v)=> useApp.setState({ fabricPreset: v as any })}
          options={[
            { value: 'cotton', label: 'Cotton' },
            { value: 'polyester', label: 'Polyester' },
            { value: 'silk', label: 'Silk' },
            { value: 'denim', label: 'Denim' },
            { value: 'wool', label: 'Wool' },
          ]}
        />
      </Section>

      <Section title="Text" defaultOpen={false}>
        <div className="label" style={{ fontSize: '11px', opacity: 0.7, marginBottom: '8px' }}>
          These settings apply to new text you create with the Text tool.
        </div>
        <div className="label">Font</div>
        <CustomSelect
          value={textFont}
          onChange={(v)=> useApp.setState({ textFont: v })}
          options={[
            { value: 'Inter, system-ui, sans-serif', label: 'Inter' },
            { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
            { value: 'Roboto, Arial, sans-serif', label: 'Roboto' },
            { value: 'Georgia, serif', label: 'Georgia' },
            { value: 'Times New Roman, Times, serif', label: 'Times New Roman' },
            { value: 'Courier New, monospace', label: 'Courier New' },
            { value: 'Comic Sans MS, cursive, sans-serif', label: 'Comic Sans MS' },
            { value: 'Poppins, sans-serif', label: 'Poppins' },
            { value: 'Open Sans, sans-serif', label: 'Open Sans' },
            { value: 'Lato, sans-serif', label: 'Lato' },
            { value: 'Montserrat, sans-serif', label: 'Montserrat' },
            { value: 'Playfair Display, serif', label: 'Playfair Display' },
            { value: 'Source Code Pro, monospace', label: 'Source Code Pro' },
          ]}
        />
        <div className="label" style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
          <a href="https://fonts.google.com" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
            Browse more fonts at Google Fonts
          </a>
        </div>
        <div className="label" style={{ marginTop: '8px' }}>Custom Font Import</div>
        <input 
          type="text" 
          placeholder="Enter Google Font name (e.g., 'Dancing Script')"
          style={{ fontSize: '11px', padding: '6px 8px' }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const fontName = e.currentTarget.value.trim();
              if (fontName) {
                // Dynamically load the Google Font
                const link = document.createElement('link');
                link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;500;600;700&display=swap`;
                link.rel = 'stylesheet';
                document.head.appendChild(link);
                
                // Add the custom font to the list
                const newFontValue = `${fontName}, sans-serif`;
                useApp.setState({ textFont: newFontValue });
                // Console log removed
                e.currentTarget.value = '';
              }
            }
          }}
        />
        <div className="label" style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px' }}>
          Type font name and press Enter to add it
        </div>
        <div className="label">Size: {textSize}px</div>
        <input type="range" min={8} max={256} value={textSize} onChange={(e)=> useApp.setState({ textSize: Number(e.target.value) })} />
        <div style={{ display:'flex', gap: 8 }}>
          <button className={`btn ${textBold?'active':''}`} onClick={()=> useApp.setState({ textBold: !textBold })}>Bold</button>
          <button className={`btn ${textItalic?'active':''}`} onClick={()=> useApp.setState({ textItalic: !textItalic })}>Italic</button>
        </div>
        <div className="label">Align</div>
        <div style={{ display:'flex', gap: 8 }}>
          <button className={`btn ${textAlign==='left'?'active':''}`} onClick={()=> useApp.setState({ textAlign: 'left' })}>Left</button>
          <button className={`btn ${textAlign==='center'?'active':''}`} onClick={()=> useApp.setState({ textAlign: 'center' })}>Center</button>
          <button className={`btn ${textAlign==='right'?'active':''}`} onClick={()=> useApp.setState({ textAlign: 'right' })}>Right</button>
        </div>
      </Section>

      <Section title="Text Editor" defaultOpen={false}>
        <div className="label" style={{ fontSize: '11px', opacity: 0.7, marginBottom: '8px' }}>
          Select text from the model to edit its properties. Use the button below or the "Select Text" tool in the toolbar.
        </div>
                {/* Text Editor Section - Single useApp call to avoid hooks order issues */}
        {(() => {
          // Single useApp call to get all needed state
          const appState = useApp(s => ({
            textElements: s.textElements,
            activeTextId: s.activeTextId,
            activeTool: s.activeTool
          }));
          
          const activeText = appState.textElements.find(t => t.id === appState.activeTextId);
          
          return (
            <div>
              {/* Debug Info - Always visible */}
              <div style={{ marginBottom: '12px', padding: '6px', background: 'rgba(0, 255, 0, 0.1)', borderRadius: '4px', border: '1px solid rgba(0, 255, 0, 0.3)' }}>
                <div className="label" style={{ fontSize: '10px', color: '#00aa00', marginBottom: '4px' }}>
                  Debug Info:
                </div>
                <div style={{ fontSize: '9px', opacity: 0.8 }}>
                  Text Elements: {appState.textElements.length}<br/>  
                  Active Tool: {appState.activeTool}<br/>
                  Active Text ID: {appState.activeTextId || 'None'}<br/>
                  Text Elements List: {appState.textElements.map(t => `${t.text}(${t.id})`).join(', ') || 'None'}
                </div>
              </div>

              {/* No Text Selected State */}
              {!activeText && (
                <div>
                  <div className="label">No text selected.</div>
                  <div className="label" style={{ fontSize: '11px', opacity: 0.7, marginBottom: '12px' }}>
                    Select text from the dropdown below or click on any text on the model.
                  </div>
                  
                  {/* Text Selection Dropdown */}
                  <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(0, 150, 255, 0.1)', borderRadius: '6px', border: '1px solid rgba(0, 150, 255, 0.3)' }}>
                    <div className="label" style={{ fontSize: '12px', color: '#0066cc', marginBottom: '8px' }}>
                      🎯 Select Text to Edit
                    </div>
                    
                    {appState.textElements.length > 0 ? (
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            useApp.getState().selectTextElement(e.target.value);
                          }
                        }}
                        style={{ 
                          width: '100%', 
                          padding: '8px', 
                          fontSize: '11px',
                          background: '#ffffff',
                          border: '1px solid #ccc',
                          borderRadius: '4px'
                        }}
                      >
                        <option value="">-- Choose text to edit --</option>
                        {appState.textElements.map((text, index) => (
                          <option key={text.id} value={text.id}>
                            {index + 1}. "{text.text}" ({text.fontSize}px, {text.fontFamily})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div style={{ 
                        padding: '8px', 
                        background: 'rgba(255, 255, 255, 0.1)', 
                        borderRadius: '4px',
                        textAlign: 'center',
                        fontSize: '10px',
                        opacity: 0.7
                      }}>
                        No text elements in workspace yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Text Selected State */}
              {activeText && (
                <div>
                  <div className="label">Selected Text: "{activeText.text}"</div>
                  <input 
                    type="text" 
                    value={activeText.text || ''} 
                    onChange={(e) => {
                      if (appState.activeTextId) {
                        useApp.getState().updateTextElement(appState.activeTextId, { text: e.target.value });
                      }
                    }}
                    style={{ width: '100%', marginBottom: 8 }}
                  />
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <button 
                      className={`btn ${appState.activeTool === 'moveText' ? 'active' : ''}`}
                      onClick={() => useApp.setState({ activeTool: 'moveText' })}
                      style={{ flex: 1, fontSize: '11px' }}
                    >
                      ✋ {appState.activeTool === 'moveText' ? 'Moving Text' : 'Move Text'}
                    </button>
                    <button 
                      className="btn" 
                      onClick={() => useApp.getState().selectTextElement(null)}
                      style={{ flex: 1, fontSize: '11px', background: '#666' }}
                    >
                      Clear Selection
                    </button>
                  </div>
                
                  {/* Text Properties */}
                  <div style={{ marginBottom: 8 }}>
                    <div className="label">Font Family</div>
                    <select
                      value={activeText.fontFamily || 'Arial'}
                      onChange={(e) => {
                        if (appState.activeTextId) {
                          useApp.getState().updateTextElement(appState.activeTextId, { fontFamily: e.target.value });
                        }
                      }}
                      style={{ width: '100%', padding: '4px' }}
                    >
                      {/* System Fonts */}
                      <optgroup label="System Fonts">
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Impact">Impact</option>
                        <option value="Comic Sans MS">Comic Sans MS</option>
                        <option value="Tahoma">Tahoma</option>
                        <option value="Trebuchet MS">Trebuchet MS</option>
                        <option value="Lucida Console">Lucida Console</option>
                        <option value="Palatino">Palatino</option>
                        <option value="Garamond">Garamond</option>
                        <option value="Bookman">Bookman</option>
                        <option value="Avant Garde">Avant Garde</option>
                        <option value="Century Gothic">Century Gothic</option>
                        <option value="Futura">Futura</option>
                        <option value="Optima">Optima</option>
                        <option value="Baskerville">Baskerville</option>
                        <option value="Didot">Didot</option>
                      </optgroup>
                      
                      {/* Google Fonts - Popular */}
                      <optgroup label="Google Fonts - Popular">
                        <option value="'Roboto', sans-serif">Roboto</option>
                        <option value="'Open Sans', sans-serif">Open Sans</option>
                        <option value="'Lato', sans-serif">Lato</option>
                        <option value="'Poppins', sans-serif">Poppins</option>
                        <option value="'Montserrat', sans-serif">Montserrat</option>
                        <option value="'Source Sans Pro', sans-serif">Source Sans Pro</option>
                        <option value="'Ubuntu', sans-serif">Ubuntu</option>
                        <option value="'Nunito', sans-serif">Nunito</option>
                        <option value="'Inter', sans-serif">Inter</option>
                        <option value="'Work Sans', sans-serif">Work Sans</option>
                      </optgroup>
                      
                      {/* Google Fonts - Serif */}
                      <optgroup label="Google Fonts - Serif">
                        <option value="'Playfair Display', serif">Playfair Display</option>
                        <option value="'Merriweather', serif">Merriweather</option>
                        <option value="'Lora', serif">Lora</option>
                        <option value="'Source Serif Pro', serif">Source Serif Pro</option>
                        <option value="'Crimson Text', serif">Crimson Text</option>
                        <option value="'Libre Baskerville', serif">Libre Baskerville</option>
                        <option value="'Noto Serif', serif">Noto Serif</option>
                        <option value="'PT Serif', serif">PT Serif</option>
                        <option value="'Gentium Book Basic', serif">Gentium Book Basic</option>
                        <option value="'Alegreya', serif">Alegreya</option>
                      </optgroup>
                      
                      {/* Google Fonts - Display */}
                      <optgroup label="Google Fonts - Display">
                        <option value="'Oswald', sans-serif">Oswald</option>
                        <option value="'Raleway', sans-serif">Raleway</option>
                        <option value="'Bebas Neue', sans-serif">Bebas Neue</option>
                        <option value="'Anton', sans-serif">Anton</option>
                        <option value="'Righteous', cursive">Righteous</option>
                        <option value="'Fredoka One', cursive">Fredoka One</option>
                        <option value="'Bangers', cursive">Bangers</option>
                        <option value="'Permanent Marker', cursive">Permanent Marker</option>
                        <option value="'Pacifico', cursive">Pacifico</option>
                        <option value="'Dancing Script', cursive">Dancing Script</option>
                      </optgroup>
                      
                      {/* Google Fonts - Modern */}
                      <optgroup label="Google Fonts - Modern">
                        <option value="'DM Sans', sans-serif">DM Sans</option>
                        <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans</option>
                        <option value="'Figtree', sans-serif">Figtree</option>
                        <option value="'Albert Sans', sans-serif">Albert Sans</option>
                        <option value="'Onest', sans-serif">Onest</option>
                        <option value="'Geist Sans', sans-serif">Geist Sans</option>
                        <option value="'Cabinet Grotesk', sans-serif">Cabinet Grotesk</option>
                        <option value="'General Sans', sans-serif">General Sans</option>
                        <option value="'Clash Display', sans-serif">Clash Display</option>
                        <option value="'Switzer', sans-serif">Switzer</option>
                      </optgroup>
                    </select>
                    
                    {/* Google Fonts Search & Import */}
                    <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(0, 150, 255, 0.1)', borderRadius: '4px', border: '1px solid rgba(0, 150, 255, 0.3)' }}>
                      <div className="label" style={{ fontSize: '10px', color: '#0066cc', marginBottom: '4px' }}>
                        🔍 Search & Import Google Fonts
                      </div>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                        <input
                          type="text"
                          placeholder="Search fonts (e.g., 'Comic', 'Bold')"
                          style={{ flex: 1, padding: '4px', fontSize: '9px' }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              // Search Google Fonts API
                              const query = e.currentTarget.value;
                              if (query.trim()) {
                                window.open(`https://fonts.google.com/?query=${encodeURIComponent(query)}`, '_blank');
                              }
                            }
                          }}
                        />
                        <button
                          className="btn"
                          onClick={() => {
                            const input = document.querySelector('input[placeholder*="Search fonts"]') as HTMLInputElement;
                            const query = input?.value || '';
                            if (query.trim()) {
                              window.open(`https://fonts.google.com/?query=${encodeURIComponent(query)}`, '_blank');
                            } else {
                              window.open('https://fonts.google.com/', '_blank');
                            }
                          }}
                          style={{ fontSize: '9px', padding: '4px 6px', background: '#0066cc' }}
                        >
                          🔍
                        </button>
                      </div>
                      <div style={{ fontSize: '8px', opacity: 0.7, lineHeight: '1.2', marginBottom: '4px' }}>
                        💡 Tip: Search for fonts on Google Fonts, then copy the font name and paste it in the dropdown above
                      </div>
                      
                      {/* Custom Font Input */}
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder="Custom font (e.g., 'Comic Sans MS')"
                          style={{ flex: '1', padding: '4px', fontSize: '9px' }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const customFont = e.currentTarget.value.trim();
                              if (customFont && appState.activeTextId) {
                                useApp.getState().updateTextElement(appState.activeTextId, { fontFamily: customFont });
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                        <button
                          className="btn"
                          onClick={() => {
                            const input = document.querySelector('input[placeholder*="Custom font"]') as HTMLInputElement;
                            const customFont = input?.value.trim() || '';
                            if (customFont && appState.activeTextId) {
                              useApp.getState().updateTextElement(appState.activeTextId, { fontFamily: customFont });
                              input.value = '';
                            }
                          }}
                          style={{ fontSize: '9px', padding: '4px 6px', background: '#00aa00' }}
                        >
                          ➕
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '8' }}>
                    <div className="label">Font Size: {activeText.fontSize || 16}px</div>
                    <input
                      type="range"
                      min="8" max="300" value={activeText.fontSize || 16}
                      onChange={(e) => {
                        if (appState.activeTextId) {
                          const newSize = parseInt(e.target.value);
                          useApp.getState().updateTextElement(appState.activeTextId, { fontSize: newSize });
                        }
                      }}
                      style={{ width: '100%' }}
                    />
                  </div>
                  
                  {/* Font Preview */}
                  <div style={{ marginBottom: '8px', padding: '8px', background: 'rgba(0, 0, 0, 0.1)', borderRadius: '4px', border: '1px solid rgba(0, 0, 0, 0.2)' }}>
                    <div className="label" style={{ fontSize: '10px', marginBottom: '4px' }}>Font Preview</div>
                    <div 
                      style={{ 
                        fontFamily: activeText.fontFamily || 'Arial',
                        fontSize: `${activeText.fontSize || 16}px`,
                        fontWeight: activeText.bold ? 'bold' : 'normal',
                        fontStyle: activeText.italic ? 'italic' : 'normal',
                        color: activeText.color || '#000000',
                        textAlign: activeText.align || 'left',
                        padding: '4px',
                        background: 'white',
                        borderRadius: '2px',
                        minHeight: '20px',
                        border: '1px solid #ccc'
                      }}
                    >
                      {activeText.text || 'Sample Text'}
                    </div>
                  </div>
                  
                  {/* Quick Font Presets */}
                  <div style={{ marginBottom: '8px', padding: '8px', background: 'rgba(255, 150, 0, 0.1)', borderRadius: '4px', border: '1px solid rgba(255, 150, 0, 0.3)' }}>
                    <div className="label" style={{ fontSize: '10px', color: '#ff6600', marginBottom: '4px' }}>Quick Font Presets</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                      <button
                        className="btn"
                        onClick={() => {
                          if (appState.activeTextId) {
                            useApp.getState().updateTextElement(appState.activeTextId, { 
                              fontFamily: "'Roboto', sans-serif",
                              fontSize: 18
                            });
                          }
                        }}
                        style={{ fontSize: '8px', padding: '3px', background: '#ff6600' }}
                      >
                        Modern
                      </button>
                      <button
                        className="btn"
                        onClick={() => {
                          if (appState.activeTextId) {
                            useApp.getState().updateTextElement(appState.activeTextId, { 
                              fontFamily: "'Playfair Display', serif",
                              fontSize: 20
                            });
                          }
                        }}
                        style={{ fontSize: '8px', padding: '3px', background: '#ff6600' }}
                      >
                        Elegant
                      </button>
                      <button
                        className="btn"
                        onClick={() => {
                          if (appState.activeTextId) {
                            useApp.getState().updateTextElement(appState.activeTextId, { 
                              fontFamily: "'Bebas Neue', sans-serif",
                              fontSize: 24
                            });
                          }
                        }}
                        style={{ fontSize: '8px', padding: '3px', background: '#ff6600' }}
                      >
                        Bold
                      </button>
                      <button
                        className="btn"
                        onClick={() => {
                          if (appState.activeTextId) {
                            useApp.getState().updateTextElement(appState.activeTextId, { 
                              fontFamily: "'Dancing Script', cursive",
                              fontSize: 22
                            });
                          }
                        }}
                        style={{ fontSize: '8px', padding: '3px', background: '#ff6600' }}
                      >
                        Handwriting
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: 8 }}>
                    <div className="label">Color & Effects</div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                      <input
                        type="color"
                        value={activeText.color || '#000000'}
                        onChange={(e) => {
                          if (appState.activeTextId) {
                            useApp.getState().updateTextElement(appState.activeTextId, { color: e.target.value });
                          }
                        }}
                        style={{ flex: 1, height: '30px' }}
                      />
                      <button
                        className="btn"
                        onClick={() => {
                          if (appState.activeTextId) {
                            // Create a simple gradient color
                            const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
                            const randomColor = colors[Math.floor(Math.random() * colors.length)];
                            useApp.getState().updateTextElement(appState.activeTextId, { color: randomColor });
                          }
                        }}
                        style={{ fontSize: '10px', padding: '4px 8px' }}
                      >
                        🎨 Random
                      </button>
                    </div>
                    
                    {/* Text Shadow Controls */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        className={`btn ${activeText.textShadow ? 'active' : ''}`}
                        onClick={() => {
                          if (appState.activeTextId) {
                            useApp.getState().updateTextElement(appState.activeTextId, { textShadow: !activeText.textShadow });
                          }
                        }}
                        style={{ flex: 1, fontSize: '10px', padding: '4px 8px' }}
                      >
                        🌟 Shadow
                      </button>
                      <button
                        className={`btn ${activeText.gradient ? 'active' : ''}`}
                        onClick={() => {
                          if (appState.activeTextId) {
                            const next = activeText.gradient
                              ? undefined
                              : { type: 'linear' as const, colors: [activeText.color || '#ffffff', '#000000'], stops: [0, 1] };
                            useApp.getState().updateTextElement(appState.activeTextId, { gradient: next });
                          }
                        }}
                        style={{ flex: 1, fontSize: '10px', padding: '4px 8px' }}
                      >
                        🌈 Gradient
                      </button>
                    </div>
                    
                    {/* Detailed Gradient Controls */}
                    {activeText.gradient && (
                      <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '4px' }}>
                        <div className="label" style={{ fontSize: '10px', marginBottom: '6px' }}>Gradient Settings</div>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                          <div style={{ flex: 1 }}>
                            <div className="label" style={{ fontSize: '9px' }}>Start Color</div>
                            <input
                              type="color"
                              value={activeText.gradientStartColor || '#ff0000'}
                              onChange={(e) => {
                                if (appState.activeTextId) {
                                  useApp.getState().updateTextElement(appState.activeTextId, { gradientStartColor: e.target.value });
                                }
                              }}
                              style={{ width: '100%', height: '20px' }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className="label" style={{ fontSize: '9px' }}>End Color</div>
                            <input
                              type="color"
                              value={activeText.gradientEndColor || '#0000ff'}
                              onChange={(e) => {
                                if (appState.activeTextId) {
                                  useApp.getState().updateTextElement(appState.activeTextId, { gradientEndColor: e.target.value });
                                }
                              }}
                              style={{ width: '100%', height: '20px' }}
                            />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <div className="label" style={{ fontSize: '9px' }}>Direction: {activeText.gradientDirection || 'horizontal'}</div>
                            <select
                              value={activeText.gradientDirection || 'horizontal'}
                              onChange={(e) => {
                                if (appState.activeTextId) {
                                  useApp.getState().updateTextElement(appState.activeTextId, { gradientDirection: e.target.value });
                                }
                              }}
                              style={{ width: '100%', padding: '2px', fontSize: '9px' }}
                            >
                              <option value="horizontal">Horizontal</option>
                              <option value="vertical">Vertical</option>
                              <option value="diagonal">Diagonal</option>
                              <option value="radial">Radial</option>
                            </select>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className="label" style={{ fontSize: '9px' }}>Mid Color</div>
                            <input
                              type="color"
                              value={activeText.gradientMidColor || '#00ff00'}
                              onChange={(e) => {
                                if (appState.activeTextId) {
                                  useApp.getState().updateTextElement(appState.activeTextId, { gradientMidColor: e.target.value });
                                }
                              }}
                              style={{ width: '100%', height: '20px' }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Detailed Shadow Controls */}
                    {activeText.textShadow && (
                      <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '4px' }}>
                        <div className="label" style={{ fontSize: '10px', marginBottom: '6px' }}>Shadow Settings</div>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                          <div style={{ flex: 1 }}>
                            <div className="label" style={{ fontSize: '9px' }}>Blur: {activeText.shadowBlur || 4}px</div>
                            <input
                              type="range"
                              min="0" max="20" value={activeText.shadowBlur || 4}
                              onChange={(e) => {
                                if (appState.activeTextId) {
                                  useApp.getState().updateTextElement(appState.activeTextId, { shadowBlur: parseInt(e.target.value) });
                                }
                              }}
                              style={{ width: '100%' }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className="label" style={{ fontSize: '9px' }}>Offset X: {activeText.shadowOffsetX || 2}px</div>
                            <input
                              type="range"
                              min="-20" max="20" value={activeText.shadowOffsetX || 2}
                              onChange={(e) => {
                                if (appState.activeTextId) {
                                  useApp.getState().updateTextElement(appState.activeTextId, { shadowOffsetX: parseInt(e.target.value) });
                                }
                              }}
                              style={{ width: '100%' }}
                            />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <div className="label" style={{ fontSize: '9px' }}>Offset Y: {activeText.shadowOffsetY || 2}px</div>
                            <input
                              type="range"
                              min="-20" max="20" value={activeText.shadowOffsetY || 2}
                              onChange={(e) => {
                                if (appState.activeTextId) {
                                  useApp.getState().updateTextElement(appState.activeTextId, { shadowOffsetY: parseInt(e.target.value) });
                                }
                              }}
                              style={{ width: '100%' }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className="label" style={{ fontSize: '9px' }}>Color</div>
                            <input
                              type="color"
                              value={activeText.shadowColor || '#000000'}
                              onChange={(e) => {
                                if (appState.activeTextId) {
                                  useApp.getState().updateTextElement(appState.activeTextId, { shadowColor: e.target.value });
                                }
                              }}
                              style={{ width: '100%', height: '20px' }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Advanced Text Effects */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        className={`btn ${activeText.outline ? 'active' : ''}`}
                        onClick={() => {
                          if (appState.activeTextId) {
                            const next = activeText.outline
                              ? undefined
                              : { width: activeText.outlineWidth || 2, color: activeText.outlineColor || '#000000' };
                            useApp.getState().updateTextElement(appState.activeTextId, { outline: next });
                          }
                        }}
                        style={{ flex: 1, fontSize: '10px', padding: '4px 8px' }}
                      >
                        🔲 Outline
                      </button>
                      <button
                        className={`btn ${activeText.glow ? 'active' : ''}`}
                        onClick={() => {
                          if (appState.activeTextId) {
                            const next = activeText.glow
                              ? undefined
                              : { blur: 8, color: activeText.color || '#ffffff' };
                            useApp.getState().updateTextElement(appState.activeTextId, { glow: next });
                          }
                        }}
                        style={{ flex: 1, fontSize: '10px', padding: '4px 8px' }}
                      >
                        ✨ Glow
                      </button>
                    </div>
                    
                    {/* Detailed Outline Controls */}
                    {activeText.outline && (
                      <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '4px' }}>
                        <div className="label" style={{ fontSize: '10px', marginBottom: '6px' }}>Outline Settings</div>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                          <div style={{ flex: 1 }}>
                            <div className="label" style={{ fontSize: '9px' }}>Width: {activeText.outlineWidth || 2}px</div>
                            <input
                              type="range"
                              min="1" max="10" value={activeText.outlineWidth || 2}
                              onChange={(e) => {
                                if (appState.activeTextId) {
                                  useApp.getState().updateTextElement(appState.activeTextId, { outlineWidth: parseInt(e.target.value) });
                                }
                              }}
                              style={{ width: '100%' }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className="label" style={{ fontSize: '9px' }}>Color</div>
                            <input
                              type="color"
                              value={activeText.outlineColor || '#000000'}
                              onChange={(e) => {
                                if (appState.activeTextId) {
                                  useApp.getState().updateTextElement(appState.activeTextId, { outlineColor: e.target.value });
                                }
                              }}
                              style={{ width: '100%', height: '20px' }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Detailed Glow Controls */}
                    {activeText.glow && (
                      <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '4px' }}>
                        <div className="label" style={{ fontSize: '10px', marginBottom: '6px' }}>Glow Settings</div>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                          <div style={{ flex: 1 }}>
                            <div className="label" style={{ fontSize: '9px' }}>Intensity: {activeText.glowIntensity || 10}px</div>
                            <input
                              type="range"
                              min="5" max="30" value={activeText.glowIntensity || 10}
                              onChange={(e) => {
                                if (appState.activeTextId) {
                                  useApp.getState().updateTextElement(appState.activeTextId, { glowIntensity: parseInt(e.target.value) });
                                }
                              }}
                              style={{ width: '100%' }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className="label" style={{ fontSize: '9px' }}>Color</div>
                            <input
                              type="color"
                              value={activeText.glowColor || '#ffffff'}
                              onChange={(e) => {
                                if (appState.activeTextId) {
                                  useApp.getState().updateTextElement(appState.activeTextId, { glowColor: e.target.value });
                                }
                              }}
                              style={{ width: '100%', height: '20px' }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ marginBottom: 8 }}>
                    <div className="label">Opacity: {Math.round((activeText.opacity || 1) * 100)}%</div>
                    <input
                      type="range"
                      min="0" max="1" step="0.1" value={activeText.opacity || 1}
                      onChange={(e) => {
                        if (appState.activeTextId) {
                          const newOpacity = parseFloat(e.target.value);
                          useApp.getState().updateTextElement(appState.activeTextId, { opacity: newOpacity });
                        }
                      }}
                      style={{ width: '100%' }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: 8 }}>
                    <div className="label">Rotation: {Math.round((activeText.rotation || 0) * 180 / Math.PI)}°</div>
                    <input
                      type="range"
                      min="-3.14" max="3.14" step="0.1" value={activeText.rotation || 0}
                      onChange={(e) => {
                        if (appState.activeTextId) {
                          const newRotation = parseFloat(e.target.value);
                          useApp.getState().updateTextElement(appState.activeTextId, { rotation: newRotation });
                        }
                      }}
                      style={{ width: '100%' }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: 8 }}>
                    <div className="label">Letter Spacing: {activeText.letterSpacing || 0}px</div>
                    <input
                      type="range"
                      min="-10" max="20" step="1" value={activeText.letterSpacing || 0}
                      onChange={(e) => {
                        if (appState.activeTextId) {
                          const newSpacing = parseInt(e.target.value);
                          useApp.getState().updateTextElement(appState.activeTextId, { letterSpacing: newSpacing });
                        }
                      }}
                      style={{ width: '100%' }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: 8 }}>
                    <div className="label">Line Height: {activeText.lineHeight || 1.2}</div>
                    <input
                      type="range"
                      min="0.8" max="3.0" step="0.1" value={activeText.lineHeight || 1.2}
                      onChange={(e) => {
                        if (appState.activeTextId) {
                          const newHeight = parseFloat(e.target.value);
                          useApp.getState().updateTextElement(appState.activeTextId, { lineHeight: newHeight });
                        }
                      }}
                      style={{ width: '100%' }}
                    />
                  </div>
                  

                  
                  <div style={{ marginBottom: 8 }}>
                    <div className="label">Alignment</div>
                    <select
                      value={activeText.align || 'center'}
                      onChange={(e) => {
                        if (appState.activeTextId) {
                          useApp.getState().updateTextElement(appState.activeTextId, { align: e.target.value as CanvasTextAlign });
                        }
                      }}
                      style={{ width: '100%', padding: '4px' }}
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                  
                  <div style={{ marginBottom: 8 }}>
                    <div className="label">Text Effects</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        className={`btn ${activeText.bold ? 'active' : ''}`}
                        onClick={() => {
                          if (appState.activeTextId) {
                            useApp.getState().updateTextElement(appState.activeTextId, { bold: !activeText.bold });
                          }
                        }}
                        style={{ fontSize: '10px', padding: '4px 8px' }}
                      >
                        <strong>B</strong>
                      </button>
                      <button
                        className={`btn ${activeText.italic ? 'active' : ''}`}
                        onClick={() => {
                          if (appState.activeTextId) {
                            useApp.getState().updateTextElement(appState.activeTextId, { italic: !activeText.italic });
                          }
                        }}
                        style={{ fontSize: '10px', padding: '4px 8px' }}
                      >
                        <em>I</em>
                      </button>
                      <button
                        className={`btn ${activeText.underline ? 'active' : ''}`}
                        onClick={() => {
                          if (appState.activeTextId) {
                            useApp.getState().updateTextElement(appState.activeTextId, { underline: !activeText.underline });
                          }
                        }}
                        style={{ fontSize: '10px', padding: '4px 8px' }}
                      >
                        <u>U</u>
                      </button>
                      <button
                        className={`btn ${activeText.strikethrough ? 'active' : ''}`}
                        onClick={() => {
                          if (appState.activeTextId) {
                            useApp.getState().updateTextElement(appState.activeTextId, { strikethrough: !activeText.strikethrough });
                          }
                        }}
                        style={{ fontSize: '10px', padding: '4px 8px' }}
                      >
                        <span style={{ textDecoration: 'line-through' }}>S</span>
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: 8 }}>
                    <div className="label">Text Transform</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        className={`btn ${activeText.uppercase ? 'active' : ''}`}
                        onClick={() => {
                          if (appState.activeTextId) {
                            useApp.getState().updateTextElement(appState.activeTextId, { uppercase: !activeText.uppercase });
                          }
                        }}
                        style={{ fontSize: '10px', padding: '4px 8px' }}
                      >
                        AA
                      </button>
                      <button
                        className={`btn ${activeText.lowercase ? 'active' : ''}`}
                        onClick={() => {
                          if (appState.activeTextId) {
                            useApp.getState().updateTextElement(appState.activeTextId, { lowercase: !activeText.lowercase });
                          }
                        }}
                        style={{ fontSize: '10px', padding: '4px 8px' }}
                      >
                        aa
                      </button>
                      <button
                        className={`btn ${activeText.capitalize ? 'active' : ''}`}
                        onClick={() => {
                          if (appState.activeTextId) {
                            useApp.getState().updateTextElement(appState.activeTextId, { capitalize: !activeText.capitalize });
                          }
                        }}
                        style={{ fontSize: '10px', padding: '4px 8px' }}
                      >
                        Aa
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', marginTop: 8 }}>
                    <button 
                      className="btn" 
                      onClick={() => {
                        if (appState.activeTextId) {
                          const textEl = appState.textElements.find(t => t.id === appState.activeTextId);
                          if (textEl) {
                            // Duplicate the text with slight offset
                            const newUV = { u: textEl.u + 0.05, v: textEl.v + 0.05 };
                            useApp.getState().addTextElement(textEl.text, newUV, textEl.layerId);
                          }
                        }
                      }}
                      style={{ flex: 1, background: '#00aa00' }}
                    >
                      📋 Duplicate
                    </button>
                    <button 
                      className="btn" 
                      onClick={() => {
                        if (appState.activeTextId) {
                          useApp.getState().removeTextElement(appState.activeTextId);
                        }
                      }}
                      style={{ flex: 1, background: '#ff4444' }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </Section>

      {/* Puff Print Tool */}
      {activeToolSidebar === 'puffPrint' && (
        <PuffPrintTool active={true} />
      )}

      {/* Pattern Maker Tool */}
      {activeToolSidebar === 'patternMaker' && (
        <PatternMaker active={true} />
      )}


      {/* Advanced Selection Tool */}
      {activeToolSidebar === 'advancedSelection' && (
        <AdvancedSelection active={true} />
      )}

      {/* AI Design Assistant */}
      {activeToolSidebar === 'aiAssistant' && (
        <AIDesignAssistant active={true} />
      )}

      {/* Print-Ready Export */}
      {activeToolSidebar === 'printExport' && (
        <PrintReadyExport active={true} />
      )}

      {/* Cloud Sync & Projects */}
      {activeToolSidebar === 'cloudSync' && (
        <CloudSync active={true} />
      )}

      {/* Layer Effects */}
      {activeToolSidebar === 'layerEffects' && (
        <LayerEffects active={true} />
      )}

      {/* Color Grading */}
      {activeToolSidebar === 'colorGrading' && (
        <ColorGrading active={true} />
      )}

      {/* Animation Tools */}
      {activeToolSidebar === 'animation' && (
        <AnimationTools active={true} />
      )}

      {/* Design Templates & Assets */}
      {activeToolSidebar === 'templates' && (
        <DesignTemplates active={true} />
      )}

      {/* Batch Processing & Automation */}
      {activeToolSidebar === 'batch' && (
        <BatchProcessing active={true} />
      )}

      {/* Feature Showcase - Always show when no specific tool is active */}
      {!activeToolSidebar && (
        <FeatureShowcase active={true} />
      )}
    </div>
  );
}


