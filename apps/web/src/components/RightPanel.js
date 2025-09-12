import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { VectorTools } from './VectorTools';
export function RightPanel({ activeToolSidebar }) {
    const color = useApp(s => s.brushColor);
    const setBrushColor = useApp(s => s.setBrushColor);
    const size = useApp(s => s.brushSize);
    const recentColors = useApp(s => s.recentColors || []);
    const shapeMode = useApp(s => s.shapeMode || 'fill');
    const shapeStrokeWidth = useApp(s => s.shapeStrokeWidth || 4);
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
    const textFont = useApp(s => s.textFont || 'Inter, system-ui, sans-serif');
    const textSize = useApp(s => s.textSize || 64);
    const textBold = useApp(s => s.textBold || false);
    const textItalic = useApp(s => s.textItalic || false);
    const textAlign = useApp(s => s.textAlign || 'center');
    return (_jsxs("div", { children: [_jsxs(Section, { title: "Color & Brush", children: [_jsx("div", { className: "label", children: "Color" }), _jsx(HexColorPicker, { color: color, onChange: (v) => setBrushColor ? setBrushColor(v) : useApp.setState({ brushColor: v }) }), recentColors.length > 0 && (_jsx("div", { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }, children: recentColors.map((rc) => (_jsx("button", { className: "btn", style: { padding: 6, background: rc }, title: rc, onClick: () => setBrushColor ? setBrushColor(rc) : useApp.setState({ brushColor: rc }), children: "\u00A0" }, rc))) })), _jsxs("div", { className: "label", style: { marginTop: 10 }, children: ["Brush Size: ", size, "px"] }), _jsx("input", { type: "range", min: 1, max: 256, value: size, onChange: (e) => useApp.setState({ brushSize: Number(e.target.value) }) }), _jsxs("div", { className: "label", children: ["Opacity: ", Math.round(opacity * 100), "%"] }), _jsx("input", { type: "range", min: 0.05, max: 1, step: 0.05, value: opacity, onChange: (e) => useApp.setState({ brushOpacity: Number(e.target.value) }) }), _jsx("div", { className: "label", children: "Shape" }), _jsx(CustomSelect, { value: shape, onChange: (v) => useApp.setState({ brushShape: v }), options: [
                            { value: 'round', label: 'Round' },
                            { value: 'square', label: 'Square' },
                            { value: 'airbrush', label: 'Airbrush' },
                            { value: 'calligraphy', label: 'Calligraphy' },
                        ] })] }), _jsxs(Section, { title: "Dynamics & Stroke", defaultOpen: false, children: [_jsx("div", { className: "label", children: "Shape Mode" }), _jsxs("div", { style: { display: 'flex', gap: 6 }, children: [_jsx("button", { className: `btn ${shapeMode === 'fill' ? 'active' : ''}`, onClick: () => useApp.setState({ shapeMode: 'fill' }), children: "Fill" }), _jsx("button", { className: `btn ${shapeMode === 'stroke' ? 'active' : ''}`, onClick: () => useApp.setState({ shapeMode: 'stroke' }), children: "Stroke" }), _jsx("button", { className: `btn ${shapeMode === 'both' ? 'active' : ''}`, onClick: () => useApp.setState({ shapeMode: 'both' }), children: "Both" })] }), _jsxs("div", { className: "label", children: ["Stroke Width: ", shapeStrokeWidth, "px"] }), _jsx("input", { type: "range", min: 1, max: 64, value: shapeStrokeWidth, onChange: (e) => useApp.setState({ shapeStrokeWidth: Number(e.target.value) }) }), _jsxs("div", { className: "label", children: ["Hardness: ", Math.round(hardness * 100), "%"] }), _jsx("input", { type: "range", min: 0, max: 1, step: 0.05, value: hardness, onChange: (e) => useApp.setState({ brushHardness: Number(e.target.value) }) }), _jsxs("div", { className: "label", children: ["Flow: ", Math.round(flow * 100), "%"] }), _jsx("input", { type: "range", min: 0.05, max: 1, step: 0.05, value: flow, onChange: (e) => useApp.setState({ brushFlow: Number(e.target.value) }) }), _jsxs("div", { className: "label", children: ["Spacing: ", Math.round(spacing * 100), "%"] }), _jsx("input", { type: "range", min: 0.05, max: 1, step: 0.05, value: spacing, onChange: (e) => useApp.setState({ brushSpacing: Number(e.target.value) }) }), _jsxs("div", { className: "label", children: ["Smoothing: ", Math.round(smoothing * 100), "%"] }), _jsx("input", { type: "range", min: 0, max: 1, step: 0.05, value: smoothing, onChange: (e) => useApp.setState({ brushSmoothing: Number(e.target.value) }) }), _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: usePressureSize, onChange: (e) => useApp.setState({ usePressureSize: e.target.checked }) }), " Pressure affects Size"] }), _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: usePressureOpacity, onChange: (e) => useApp.setState({ usePressureOpacity: e.target.checked }) }), " Pressure affects Opacity"] })] }), _jsxs(Section, { title: "Symmetry & Blend", defaultOpen: false, children: [_jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: symmetryX, onChange: (e) => useApp.setState({ symmetryX: e.target.checked }) }), " Symmetry X"] }), _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: symmetryY, onChange: (e) => useApp.setState({ symmetryY: e.target.checked }) }), " Symmetry Y"] }), _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: symmetryZ, onChange: (e) => useApp.setState({ symmetryZ: e.target.checked }) }), " Symmetry Z (UV wrap)"] }), _jsx("div", { className: "label", children: "Blend Mode" }), _jsx(CustomSelect, { value: blendMode, onChange: (v) => useApp.setState({ blendMode: v }), options: [
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
                        ] })] }), _jsx(Section, { title: "Fabric", defaultOpen: false, children: _jsx(CustomSelect, { value: fabric, onChange: (v) => useApp.setState({ fabricPreset: v }), options: [
                        { value: 'cotton', label: 'Cotton' },
                        { value: 'polyester', label: 'Polyester' },
                        { value: 'silk', label: 'Silk' },
                        { value: 'denim', label: 'Denim' },
                        { value: 'wool', label: 'Wool' },
                    ] }) }), _jsxs(Section, { title: "Text", defaultOpen: false, children: [_jsx("div", { className: "label", style: { fontSize: '11px', opacity: 0.7, marginBottom: '8px' }, children: "These settings apply to new text you create with the Text tool." }), _jsx("div", { className: "label", children: "Font" }), _jsx(CustomSelect, { value: textFont, onChange: (v) => useApp.setState({ textFont: v }), options: [
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
                        ] }), _jsx("div", { className: "label", style: { fontSize: '11px', opacity: 0.7, marginTop: '4px' }, children: _jsx("a", { href: "https://fonts.google.com", target: "_blank", rel: "noopener noreferrer", style: { color: 'inherit', textDecoration: 'underline' }, children: "Browse more fonts at Google Fonts" }) }), _jsx("div", { className: "label", style: { marginTop: '8px' }, children: "Custom Font Import" }), _jsx("input", { type: "text", placeholder: "Enter Google Font name (e.g., 'Dancing Script')", style: { fontSize: '11px', padding: '6px 8px' }, onKeyDown: (e) => {
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
                        } }), _jsx("div", { className: "label", style: { fontSize: '10px', opacity: 0.6, marginTop: '4px' }, children: "Type font name and press Enter to add it" }), _jsxs("div", { className: "label", children: ["Size: ", textSize, "px"] }), _jsx("input", { type: "range", min: 8, max: 256, value: textSize, onChange: (e) => useApp.setState({ textSize: Number(e.target.value) }) }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("button", { className: `btn ${textBold ? 'active' : ''}`, onClick: () => useApp.setState({ textBold: !textBold }), children: "Bold" }), _jsx("button", { className: `btn ${textItalic ? 'active' : ''}`, onClick: () => useApp.setState({ textItalic: !textItalic }), children: "Italic" })] }), _jsx("div", { className: "label", children: "Align" }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("button", { className: `btn ${textAlign === 'left' ? 'active' : ''}`, onClick: () => useApp.setState({ textAlign: 'left' }), children: "Left" }), _jsx("button", { className: `btn ${textAlign === 'center' ? 'active' : ''}`, onClick: () => useApp.setState({ textAlign: 'center' }), children: "Center" }), _jsx("button", { className: `btn ${textAlign === 'right' ? 'active' : ''}`, onClick: () => useApp.setState({ textAlign: 'right' }), children: "Right" })] })] }), _jsxs(Section, { title: "Text Editor", defaultOpen: false, children: [_jsx("div", { className: "label", style: { fontSize: '11px', opacity: 0.7, marginBottom: '8px' }, children: "Select text from the model to edit its properties. Use the button below or the \"Select Text\" tool in the toolbar." }), (() => {
                        // Single useApp call to get all needed state
                        const appState = useApp(s => ({
                            textElements: s.textElements,
                            activeTextId: s.activeTextId,
                            activeTool: s.activeTool
                        }));
                        const activeText = appState.textElements.find(t => t.id === appState.activeTextId);
                        return (_jsxs("div", { children: [_jsxs("div", { style: { marginBottom: '12px', padding: '6px', background: 'rgba(0, 255, 0, 0.1)', borderRadius: '4px', border: '1px solid rgba(0, 255, 0, 0.3)' }, children: [_jsx("div", { className: "label", style: { fontSize: '10px', color: '#00aa00', marginBottom: '4px' }, children: "Debug Info:" }), _jsxs("div", { style: { fontSize: '9px', opacity: 0.8 }, children: ["Text Elements: ", appState.textElements.length, _jsx("br", {}), "Active Tool: ", appState.activeTool, _jsx("br", {}), "Active Text ID: ", appState.activeTextId || 'None', _jsx("br", {}), "Text Elements List: ", appState.textElements.map(t => `${t.text}(${t.id})`).join(', ') || 'None'] })] }), !activeText && (_jsxs("div", { children: [_jsx("div", { className: "label", children: "No text selected." }), _jsx("div", { className: "label", style: { fontSize: '11px', opacity: 0.7, marginBottom: '12px' }, children: "Select text from the dropdown below or click on any text on the model." }), _jsxs("div", { style: { marginTop: '12px', padding: '12px', background: 'rgba(0, 150, 255, 0.1)', borderRadius: '6px', border: '1px solid rgba(0, 150, 255, 0.3)' }, children: [_jsx("div", { className: "label", style: { fontSize: '12px', color: '#0066cc', marginBottom: '8px' }, children: "\uD83C\uDFAF Select Text to Edit" }), appState.textElements.length > 0 ? (_jsxs("select", { value: "", onChange: (e) => {
                                                        if (e.target.value) {
                                                            useApp.getState().selectTextElement(e.target.value);
                                                        }
                                                    }, style: {
                                                        width: '100%',
                                                        padding: '8px',
                                                        fontSize: '11px',
                                                        background: '#ffffff',
                                                        border: '1px solid #ccc',
                                                        borderRadius: '4px'
                                                    }, children: [_jsx("option", { value: "", children: "-- Choose text to edit --" }), appState.textElements.map((text, index) => (_jsxs("option", { value: text.id, children: [index + 1, ". \"", text.text, "\" (", text.fontSize, "px, ", text.fontFamily, ")"] }, text.id)))] })) : (_jsx("div", { style: {
                                                        padding: '8px',
                                                        background: 'rgba(255, 255, 255, 0.1)',
                                                        borderRadius: '4px',
                                                        textAlign: 'center',
                                                        fontSize: '10px',
                                                        opacity: 0.7
                                                    }, children: "No text elements in workspace yet." }))] })] })), activeText && (_jsxs("div", { children: [_jsxs("div", { className: "label", children: ["Selected Text: \"", activeText.text, "\""] }), _jsx("input", { type: "text", value: activeText.text || '', onChange: (e) => {
                                                if (appState.activeTextId) {
                                                    useApp.getState().updateTextElement(appState.activeTextId, { text: e.target.value });
                                                }
                                            }, style: { width: '100%', marginBottom: 8 } }), _jsxs("div", { style: { display: 'flex', gap: 8, marginBottom: 8 }, children: [_jsxs("button", { className: `btn ${appState.activeTool === 'moveText' ? 'active' : ''}`, onClick: () => useApp.setState({ activeTool: 'moveText' }), style: { flex: 1, fontSize: '11px' }, children: ["\u270B ", appState.activeTool === 'moveText' ? 'Moving Text' : 'Move Text'] }), _jsx("button", { className: "btn", onClick: () => useApp.getState().selectTextElement(null), style: { flex: 1, fontSize: '11px', background: '#666' }, children: "Clear Selection" })] }), _jsxs("div", { style: { marginBottom: 8 }, children: [_jsx("div", { className: "label", children: "Font Family" }), _jsxs("select", { value: activeText.fontFamily || 'Arial', onChange: (e) => {
                                                        if (appState.activeTextId) {
                                                            useApp.getState().updateTextElement(appState.activeTextId, { fontFamily: e.target.value });
                                                        }
                                                    }, style: { width: '100%', padding: '4px' }, children: [_jsxs("optgroup", { label: "System Fonts", children: [_jsx("option", { value: "Arial", children: "Arial" }), _jsx("option", { value: "Helvetica", children: "Helvetica" }), _jsx("option", { value: "Times New Roman", children: "Times New Roman" }), _jsx("option", { value: "Georgia", children: "Georgia" }), _jsx("option", { value: "Verdana", children: "Verdana" }), _jsx("option", { value: "Courier New", children: "Courier New" }), _jsx("option", { value: "Impact", children: "Impact" }), _jsx("option", { value: "Comic Sans MS", children: "Comic Sans MS" }), _jsx("option", { value: "Tahoma", children: "Tahoma" }), _jsx("option", { value: "Trebuchet MS", children: "Trebuchet MS" }), _jsx("option", { value: "Lucida Console", children: "Lucida Console" }), _jsx("option", { value: "Palatino", children: "Palatino" }), _jsx("option", { value: "Garamond", children: "Garamond" }), _jsx("option", { value: "Bookman", children: "Bookman" }), _jsx("option", { value: "Avant Garde", children: "Avant Garde" }), _jsx("option", { value: "Century Gothic", children: "Century Gothic" }), _jsx("option", { value: "Futura", children: "Futura" }), _jsx("option", { value: "Optima", children: "Optima" }), _jsx("option", { value: "Baskerville", children: "Baskerville" }), _jsx("option", { value: "Didot", children: "Didot" })] }), _jsxs("optgroup", { label: "Google Fonts - Popular", children: [_jsx("option", { value: "'Roboto', sans-serif", children: "Roboto" }), _jsx("option", { value: "'Open Sans', sans-serif", children: "Open Sans" }), _jsx("option", { value: "'Lato', sans-serif", children: "Lato" }), _jsx("option", { value: "'Poppins', sans-serif", children: "Poppins" }), _jsx("option", { value: "'Montserrat', sans-serif", children: "Montserrat" }), _jsx("option", { value: "'Source Sans Pro', sans-serif", children: "Source Sans Pro" }), _jsx("option", { value: "'Ubuntu', sans-serif", children: "Ubuntu" }), _jsx("option", { value: "'Nunito', sans-serif", children: "Nunito" }), _jsx("option", { value: "'Inter', sans-serif", children: "Inter" }), _jsx("option", { value: "'Work Sans', sans-serif", children: "Work Sans" })] }), _jsxs("optgroup", { label: "Google Fonts - Serif", children: [_jsx("option", { value: "'Playfair Display', serif", children: "Playfair Display" }), _jsx("option", { value: "'Merriweather', serif", children: "Merriweather" }), _jsx("option", { value: "'Lora', serif", children: "Lora" }), _jsx("option", { value: "'Source Serif Pro', serif", children: "Source Serif Pro" }), _jsx("option", { value: "'Crimson Text', serif", children: "Crimson Text" }), _jsx("option", { value: "'Libre Baskerville', serif", children: "Libre Baskerville" }), _jsx("option", { value: "'Noto Serif', serif", children: "Noto Serif" }), _jsx("option", { value: "'PT Serif', serif", children: "PT Serif" }), _jsx("option", { value: "'Gentium Book Basic', serif", children: "Gentium Book Basic" }), _jsx("option", { value: "'Alegreya', serif", children: "Alegreya" })] }), _jsxs("optgroup", { label: "Google Fonts - Display", children: [_jsx("option", { value: "'Oswald', sans-serif", children: "Oswald" }), _jsx("option", { value: "'Raleway', sans-serif", children: "Raleway" }), _jsx("option", { value: "'Bebas Neue', sans-serif", children: "Bebas Neue" }), _jsx("option", { value: "'Anton', sans-serif", children: "Anton" }), _jsx("option", { value: "'Righteous', cursive", children: "Righteous" }), _jsx("option", { value: "'Fredoka One', cursive", children: "Fredoka One" }), _jsx("option", { value: "'Bangers', cursive", children: "Bangers" }), _jsx("option", { value: "'Permanent Marker', cursive", children: "Permanent Marker" }), _jsx("option", { value: "'Pacifico', cursive", children: "Pacifico" }), _jsx("option", { value: "'Dancing Script', cursive", children: "Dancing Script" })] }), _jsxs("optgroup", { label: "Google Fonts - Modern", children: [_jsx("option", { value: "'DM Sans', sans-serif", children: "DM Sans" }), _jsx("option", { value: "'Plus Jakarta Sans', sans-serif", children: "Plus Jakarta Sans" }), _jsx("option", { value: "'Figtree', sans-serif", children: "Figtree" }), _jsx("option", { value: "'Albert Sans', sans-serif", children: "Albert Sans" }), _jsx("option", { value: "'Onest', sans-serif", children: "Onest" }), _jsx("option", { value: "'Geist Sans', sans-serif", children: "Geist Sans" }), _jsx("option", { value: "'Cabinet Grotesk', sans-serif", children: "Cabinet Grotesk" }), _jsx("option", { value: "'General Sans', sans-serif", children: "General Sans" }), _jsx("option", { value: "'Clash Display', sans-serif", children: "Clash Display" }), _jsx("option", { value: "'Switzer', sans-serif", children: "Switzer" })] })] }), _jsxs("div", { style: { marginTop: '8px', padding: '8px', background: 'rgba(0, 150, 255, 0.1)', borderRadius: '4px', border: '1px solid rgba(0, 150, 255, 0.3)' }, children: [_jsx("div", { className: "label", style: { fontSize: '10px', color: '#0066cc', marginBottom: '4px' }, children: "\uD83D\uDD0D Search & Import Google Fonts" }), _jsxs("div", { style: { display: 'flex', gap: '4px', marginBottom: '4px' }, children: [_jsx("input", { type: "text", placeholder: "Search fonts (e.g., 'Comic', 'Bold')", style: { flex: 1, padding: '4px', fontSize: '9px' }, onKeyPress: (e) => {
                                                                        if (e.key === 'Enter') {
                                                                            // Search Google Fonts API
                                                                            const query = e.currentTarget.value;
                                                                            if (query.trim()) {
                                                                                window.open(`https://fonts.google.com/?query=${encodeURIComponent(query)}`, '_blank');
                                                                            }
                                                                        }
                                                                    } }), _jsx("button", { className: "btn", onClick: () => {
                                                                        const input = document.querySelector('input[placeholder*="Search fonts"]');
                                                                        const query = input?.value || '';
                                                                        if (query.trim()) {
                                                                            window.open(`https://fonts.google.com/?query=${encodeURIComponent(query)}`, '_blank');
                                                                        }
                                                                        else {
                                                                            window.open('https://fonts.google.com/', '_blank');
                                                                        }
                                                                    }, style: { fontSize: '9px', padding: '4px 6px', background: '#0066cc' }, children: "\uD83D\uDD0D" })] }), _jsx("div", { style: { fontSize: '8px', opacity: 0.7, lineHeight: '1.2', marginBottom: '4px' }, children: "\uD83D\uDCA1 Tip: Search for fonts on Google Fonts, then copy the font name and paste it in the dropdown above" }), _jsxs("div", { style: { display: 'flex', gap: '4px', alignItems: 'center' }, children: [_jsx("input", { type: "text", placeholder: "Custom font (e.g., 'Comic Sans MS')", style: { flex: '1', padding: '4px', fontSize: '9px' }, onKeyPress: (e) => {
                                                                        if (e.key === 'Enter') {
                                                                            const customFont = e.currentTarget.value.trim();
                                                                            if (customFont && appState.activeTextId) {
                                                                                useApp.getState().updateTextElement(appState.activeTextId, { fontFamily: customFont });
                                                                                e.currentTarget.value = '';
                                                                            }
                                                                        }
                                                                    } }), _jsx("button", { className: "btn", onClick: () => {
                                                                        const input = document.querySelector('input[placeholder*="Custom font"]');
                                                                        const customFont = input?.value.trim() || '';
                                                                        if (customFont && appState.activeTextId) {
                                                                            useApp.getState().updateTextElement(appState.activeTextId, { fontFamily: customFont });
                                                                            input.value = '';
                                                                        }
                                                                    }, style: { fontSize: '9px', padding: '4px 6px', background: '#00aa00' }, children: "\u2795" })] })] })] }), _jsxs("div", { style: { marginBottom: '8' }, children: [_jsxs("div", { className: "label", children: ["Font Size: ", activeText.fontSize || 16, "px"] }), _jsx("input", { type: "range", min: "8", max: "300", value: activeText.fontSize || 16, onChange: (e) => {
                                                        if (appState.activeTextId) {
                                                            const newSize = parseInt(e.target.value);
                                                            useApp.getState().updateTextElement(appState.activeTextId, { fontSize: newSize });
                                                        }
                                                    }, style: { width: '100%' } })] }), _jsxs("div", { style: { marginBottom: '8px', padding: '8px', background: 'rgba(0, 0, 0, 0.1)', borderRadius: '4px', border: '1px solid rgba(0, 0, 0, 0.2)' }, children: [_jsx("div", { className: "label", style: { fontSize: '10px', marginBottom: '4px' }, children: "Font Preview" }), _jsx("div", { style: {
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
                                                    }, children: activeText.text || 'Sample Text' })] }), _jsxs("div", { style: { marginBottom: '8px', padding: '8px', background: 'rgba(255, 150, 0, 0.1)', borderRadius: '4px', border: '1px solid rgba(255, 150, 0, 0.3)' }, children: [_jsx("div", { className: "label", style: { fontSize: '10px', color: '#ff6600', marginBottom: '4px' }, children: "Quick Font Presets" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }, children: [_jsx("button", { className: "btn", onClick: () => {
                                                                if (appState.activeTextId) {
                                                                    useApp.getState().updateTextElement(appState.activeTextId, {
                                                                        fontFamily: "'Roboto', sans-serif",
                                                                        fontSize: 18
                                                                    });
                                                                }
                                                            }, style: { fontSize: '8px', padding: '3px', background: '#ff6600' }, children: "Modern" }), _jsx("button", { className: "btn", onClick: () => {
                                                                if (appState.activeTextId) {
                                                                    useApp.getState().updateTextElement(appState.activeTextId, {
                                                                        fontFamily: "'Playfair Display', serif",
                                                                        fontSize: 20
                                                                    });
                                                                }
                                                            }, style: { fontSize: '8px', padding: '3px', background: '#ff6600' }, children: "Elegant" }), _jsx("button", { className: "btn", onClick: () => {
                                                                if (appState.activeTextId) {
                                                                    useApp.getState().updateTextElement(appState.activeTextId, {
                                                                        fontFamily: "'Bebas Neue', sans-serif",
                                                                        fontSize: 24
                                                                    });
                                                                }
                                                            }, style: { fontSize: '8px', padding: '3px', background: '#ff6600' }, children: "Bold" }), _jsx("button", { className: "btn", onClick: () => {
                                                                if (appState.activeTextId) {
                                                                    useApp.getState().updateTextElement(appState.activeTextId, {
                                                                        fontFamily: "'Dancing Script', cursive",
                                                                        fontSize: 22
                                                                    });
                                                                }
                                                            }, style: { fontSize: '8px', padding: '3px', background: '#ff6600' }, children: "Handwriting" })] })] }), _jsxs("div", { style: { marginBottom: 8 }, children: [_jsx("div", { className: "label", children: "Color & Effects" }), _jsxs("div", { style: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }, children: [_jsx("input", { type: "color", value: activeText.color || '#000000', onChange: (e) => {
                                                                if (appState.activeTextId) {
                                                                    useApp.getState().updateTextElement(appState.activeTextId, { color: e.target.value });
                                                                }
                                                            }, style: { flex: 1, height: '30px' } }), _jsx("button", { className: "btn", onClick: () => {
                                                                if (appState.activeTextId) {
                                                                    // Create a simple gradient color
                                                                    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
                                                                    const randomColor = colors[Math.floor(Math.random() * colors.length)];
                                                                    useApp.getState().updateTextElement(appState.activeTextId, { color: randomColor });
                                                                }
                                                            }, style: { fontSize: '10px', padding: '4px 8px' }, children: "\uD83C\uDFA8 Random" })] }), _jsxs("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' }, children: [_jsx("button", { className: `btn ${activeText.textShadow ? 'active' : ''}`, onClick: () => {
                                                                if (appState.activeTextId) {
                                                                    useApp.getState().updateTextElement(appState.activeTextId, { textShadow: !activeText.textShadow });
                                                                }
                                                            }, style: { flex: 1, fontSize: '10px', padding: '4px 8px' }, children: "\uD83C\uDF1F Shadow" }), _jsx("button", { className: `btn ${activeText.gradient ? 'active' : ''}`, onClick: () => {
                                                                if (appState.activeTextId) {
                                                                    const next = activeText.gradient
                                                                        ? undefined
                                                                        : { type: 'linear', colors: [activeText.color || '#ffffff', '#000000'], stops: [0, 1] };
                                                                    useApp.getState().updateTextElement(appState.activeTextId, { gradient: next });
                                                                }
                                                            }, style: { flex: 1, fontSize: '10px', padding: '4px 8px' }, children: "\uD83C\uDF08 Gradient" })] }), activeText.gradient && (_jsxs("div", { style: { marginTop: '8px', padding: '8px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '4px' }, children: [_jsx("div", { className: "label", style: { fontSize: '10px', marginBottom: '6px' }, children: "Gradient Settings" }), _jsxs("div", { style: { display: 'flex', gap: '8px', marginBottom: '6px' }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { className: "label", style: { fontSize: '9px' }, children: "Start Color" }), _jsx("input", { type: "color", value: activeText.gradientStartColor || '#ff0000', onChange: (e) => {
                                                                                if (appState.activeTextId) {
                                                                                    useApp.getState().updateTextElement(appState.activeTextId, { gradientStartColor: e.target.value });
                                                                                }
                                                                            }, style: { width: '100%', height: '20px' } })] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { className: "label", style: { fontSize: '9px' }, children: "End Color" }), _jsx("input", { type: "color", value: activeText.gradientEndColor || '#0000ff', onChange: (e) => {
                                                                                if (appState.activeTextId) {
                                                                                    useApp.getState().updateTextElement(appState.activeTextId, { gradientEndColor: e.target.value });
                                                                                }
                                                                            }, style: { width: '100%', height: '20px' } })] })] }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { className: "label", style: { fontSize: '9px' }, children: ["Direction: ", activeText.gradientDirection || 'horizontal'] }), _jsxs("select", { value: activeText.gradientDirection || 'horizontal', onChange: (e) => {
                                                                                if (appState.activeTextId) {
                                                                                    useApp.getState().updateTextElement(appState.activeTextId, { gradientDirection: e.target.value });
                                                                                }
                                                                            }, style: { width: '100%', padding: '2px', fontSize: '9px' }, children: [_jsx("option", { value: "horizontal", children: "Horizontal" }), _jsx("option", { value: "vertical", children: "Vertical" }), _jsx("option", { value: "diagonal", children: "Diagonal" }), _jsx("option", { value: "radial", children: "Radial" })] })] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { className: "label", style: { fontSize: '9px' }, children: "Mid Color" }), _jsx("input", { type: "color", value: activeText.gradientMidColor || '#00ff00', onChange: (e) => {
                                                                                if (appState.activeTextId) {
                                                                                    useApp.getState().updateTextElement(appState.activeTextId, { gradientMidColor: e.target.value });
                                                                                }
                                                                            }, style: { width: '100%', height: '20px' } })] })] })] })), activeText.textShadow && (_jsxs("div", { style: { marginTop: '8px', padding: '8px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '4px' }, children: [_jsx("div", { className: "label", style: { fontSize: '10px', marginBottom: '6px' }, children: "Shadow Settings" }), _jsxs("div", { style: { display: 'flex', gap: '8px', marginBottom: '6px' }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { className: "label", style: { fontSize: '9px' }, children: ["Blur: ", activeText.shadowBlur || 4, "px"] }), _jsx("input", { type: "range", min: "0", max: "20", value: activeText.shadowBlur || 4, onChange: (e) => {
                                                                                if (appState.activeTextId) {
                                                                                    useApp.getState().updateTextElement(appState.activeTextId, { shadowBlur: parseInt(e.target.value) });
                                                                                }
                                                                            }, style: { width: '100%' } })] }), _jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { className: "label", style: { fontSize: '9px' }, children: ["Offset X: ", activeText.shadowOffsetX || 2, "px"] }), _jsx("input", { type: "range", min: "-20", max: "20", value: activeText.shadowOffsetX || 2, onChange: (e) => {
                                                                                if (appState.activeTextId) {
                                                                                    useApp.getState().updateTextElement(appState.activeTextId, { shadowOffsetX: parseInt(e.target.value) });
                                                                                }
                                                                            }, style: { width: '100%' } })] })] }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { className: "label", style: { fontSize: '9px' }, children: ["Offset Y: ", activeText.shadowOffsetY || 2, "px"] }), _jsx("input", { type: "range", min: "-20", max: "20", value: activeText.shadowOffsetY || 2, onChange: (e) => {
                                                                                if (appState.activeTextId) {
                                                                                    useApp.getState().updateTextElement(appState.activeTextId, { shadowOffsetY: parseInt(e.target.value) });
                                                                                }
                                                                            }, style: { width: '100%' } })] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { className: "label", style: { fontSize: '9px' }, children: "Color" }), _jsx("input", { type: "color", value: activeText.shadowColor || '#000000', onChange: (e) => {
                                                                                if (appState.activeTextId) {
                                                                                    useApp.getState().updateTextElement(appState.activeTextId, { shadowColor: e.target.value });
                                                                                }
                                                                            }, style: { width: '100%', height: '20px' } })] })] })] })), _jsxs("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' }, children: [_jsx("button", { className: `btn ${activeText.outline ? 'active' : ''}`, onClick: () => {
                                                                if (appState.activeTextId) {
                                                                    const next = activeText.outline
                                                                        ? undefined
                                                                        : { width: activeText.outlineWidth || 2, color: activeText.outlineColor || '#000000' };
                                                                    useApp.getState().updateTextElement(appState.activeTextId, { outline: next });
                                                                }
                                                            }, style: { flex: 1, fontSize: '10px', padding: '4px 8px' }, children: "\uD83D\uDD32 Outline" }), _jsx("button", { className: `btn ${activeText.glow ? 'active' : ''}`, onClick: () => {
                                                                if (appState.activeTextId) {
                                                                    const next = activeText.glow
                                                                        ? undefined
                                                                        : { blur: 8, color: activeText.color || '#ffffff' };
                                                                    useApp.getState().updateTextElement(appState.activeTextId, { glow: next });
                                                                }
                                                            }, style: { flex: 1, fontSize: '10px', padding: '4px 8px' }, children: "\u2728 Glow" })] }), activeText.outline && (_jsxs("div", { style: { marginTop: '8px', padding: '8px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '4px' }, children: [_jsx("div", { className: "label", style: { fontSize: '10px', marginBottom: '6px' }, children: "Outline Settings" }), _jsxs("div", { style: { display: 'flex', gap: '8px', marginBottom: '6px' }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { className: "label", style: { fontSize: '9px' }, children: ["Width: ", activeText.outlineWidth || 2, "px"] }), _jsx("input", { type: "range", min: "1", max: "10", value: activeText.outlineWidth || 2, onChange: (e) => {
                                                                                if (appState.activeTextId) {
                                                                                    useApp.getState().updateTextElement(appState.activeTextId, { outlineWidth: parseInt(e.target.value) });
                                                                                }
                                                                            }, style: { width: '100%' } })] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { className: "label", style: { fontSize: '9px' }, children: "Color" }), _jsx("input", { type: "color", value: activeText.outlineColor || '#000000', onChange: (e) => {
                                                                                if (appState.activeTextId) {
                                                                                    useApp.getState().updateTextElement(appState.activeTextId, { outlineColor: e.target.value });
                                                                                }
                                                                            }, style: { width: '100%', height: '20px' } })] })] })] })), activeText.glow && (_jsxs("div", { style: { marginTop: '8px', padding: '8px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '4px' }, children: [_jsx("div", { className: "label", style: { fontSize: '10px', marginBottom: '6px' }, children: "Glow Settings" }), _jsxs("div", { style: { display: 'flex', gap: '8px', marginBottom: '6px' }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { className: "label", style: { fontSize: '9px' }, children: ["Intensity: ", activeText.glowIntensity || 10, "px"] }), _jsx("input", { type: "range", min: "5", max: "30", value: activeText.glowIntensity || 10, onChange: (e) => {
                                                                                if (appState.activeTextId) {
                                                                                    useApp.getState().updateTextElement(appState.activeTextId, { glowIntensity: parseInt(e.target.value) });
                                                                                }
                                                                            }, style: { width: '100%' } })] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { className: "label", style: { fontSize: '9px' }, children: "Color" }), _jsx("input", { type: "color", value: activeText.glowColor || '#ffffff', onChange: (e) => {
                                                                                if (appState.activeTextId) {
                                                                                    useApp.getState().updateTextElement(appState.activeTextId, { glowColor: e.target.value });
                                                                                }
                                                                            }, style: { width: '100%', height: '20px' } })] })] })] }))] }), _jsxs("div", { style: { marginBottom: 8 }, children: [_jsxs("div", { className: "label", children: ["Opacity: ", Math.round((activeText.opacity || 1) * 100), "%"] }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.1", value: activeText.opacity || 1, onChange: (e) => {
                                                        if (appState.activeTextId) {
                                                            const newOpacity = parseFloat(e.target.value);
                                                            useApp.getState().updateTextElement(appState.activeTextId, { opacity: newOpacity });
                                                        }
                                                    }, style: { width: '100%' } })] }), _jsxs("div", { style: { marginBottom: 8 }, children: [_jsxs("div", { className: "label", children: ["Rotation: ", Math.round((activeText.rotation || 0) * 180 / Math.PI), "\u00B0"] }), _jsx("input", { type: "range", min: "-3.14", max: "3.14", step: "0.1", value: activeText.rotation || 0, onChange: (e) => {
                                                        if (appState.activeTextId) {
                                                            const newRotation = parseFloat(e.target.value);
                                                            useApp.getState().updateTextElement(appState.activeTextId, { rotation: newRotation });
                                                        }
                                                    }, style: { width: '100%' } })] }), _jsxs("div", { style: { marginBottom: 8 }, children: [_jsxs("div", { className: "label", children: ["Letter Spacing: ", activeText.letterSpacing || 0, "px"] }), _jsx("input", { type: "range", min: "-10", max: "20", step: "1", value: activeText.letterSpacing || 0, onChange: (e) => {
                                                        if (appState.activeTextId) {
                                                            const newSpacing = parseInt(e.target.value);
                                                            useApp.getState().updateTextElement(appState.activeTextId, { letterSpacing: newSpacing });
                                                        }
                                                    }, style: { width: '100%' } })] }), _jsxs("div", { style: { marginBottom: 8 }, children: [_jsxs("div", { className: "label", children: ["Line Height: ", activeText.lineHeight || 1.2] }), _jsx("input", { type: "range", min: "0.8", max: "3.0", step: "0.1", value: activeText.lineHeight || 1.2, onChange: (e) => {
                                                        if (appState.activeTextId) {
                                                            const newHeight = parseFloat(e.target.value);
                                                            useApp.getState().updateTextElement(appState.activeTextId, { lineHeight: newHeight });
                                                        }
                                                    }, style: { width: '100%' } })] }), _jsxs("div", { style: { marginBottom: 8 }, children: [_jsx("div", { className: "label", children: "Alignment" }), _jsxs("select", { value: activeText.align || 'center', onChange: (e) => {
                                                        if (appState.activeTextId) {
                                                            useApp.getState().updateTextElement(appState.activeTextId, { align: e.target.value });
                                                        }
                                                    }, style: { width: '100%', padding: '4px' }, children: [_jsx("option", { value: "left", children: "Left" }), _jsx("option", { value: "center", children: "Center" }), _jsx("option", { value: "right", children: "Right" })] })] }), _jsxs("div", { style: { marginBottom: 8 }, children: [_jsx("div", { className: "label", children: "Text Effects" }), _jsxs("div", { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' }, children: [_jsx("button", { className: `btn ${activeText.bold ? 'active' : ''}`, onClick: () => {
                                                                if (appState.activeTextId) {
                                                                    useApp.getState().updateTextElement(appState.activeTextId, { bold: !activeText.bold });
                                                                }
                                                            }, style: { fontSize: '10px', padding: '4px 8px' }, children: _jsx("strong", { children: "B" }) }), _jsx("button", { className: `btn ${activeText.italic ? 'active' : ''}`, onClick: () => {
                                                                if (appState.activeTextId) {
                                                                    useApp.getState().updateTextElement(appState.activeTextId, { italic: !activeText.italic });
                                                                }
                                                            }, style: { fontSize: '10px', padding: '4px 8px' }, children: _jsx("em", { children: "I" }) }), _jsx("button", { className: `btn ${activeText.underline ? 'active' : ''}`, onClick: () => {
                                                                if (appState.activeTextId) {
                                                                    useApp.getState().updateTextElement(appState.activeTextId, { underline: !activeText.underline });
                                                                }
                                                            }, style: { fontSize: '10px', padding: '4px 8px' }, children: _jsx("u", { children: "U" }) }), _jsx("button", { className: `btn ${activeText.strikethrough ? 'active' : ''}`, onClick: () => {
                                                                if (appState.activeTextId) {
                                                                    useApp.getState().updateTextElement(appState.activeTextId, { strikethrough: !activeText.strikethrough });
                                                                }
                                                            }, style: { fontSize: '10px', padding: '4px 8px' }, children: _jsx("span", { style: { textDecoration: 'line-through' }, children: "S" }) })] })] }), _jsxs("div", { style: { marginBottom: 8 }, children: [_jsx("div", { className: "label", children: "Text Transform" }), _jsxs("div", { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' }, children: [_jsx("button", { className: `btn ${activeText.uppercase ? 'active' : ''}`, onClick: () => {
                                                                if (appState.activeTextId) {
                                                                    useApp.getState().updateTextElement(appState.activeTextId, { uppercase: !activeText.uppercase });
                                                                }
                                                            }, style: { fontSize: '10px', padding: '4px 8px' }, children: "AA" }), _jsx("button", { className: `btn ${activeText.lowercase ? 'active' : ''}`, onClick: () => {
                                                                if (appState.activeTextId) {
                                                                    useApp.getState().updateTextElement(appState.activeTextId, { lowercase: !activeText.lowercase });
                                                                }
                                                            }, style: { fontSize: '10px', padding: '4px 8px' }, children: "aa" }), _jsx("button", { className: `btn ${activeText.capitalize ? 'active' : ''}`, onClick: () => {
                                                                if (appState.activeTextId) {
                                                                    useApp.getState().updateTextElement(appState.activeTextId, { capitalize: !activeText.capitalize });
                                                                }
                                                            }, style: { fontSize: '10px', padding: '4px 8px' }, children: "Aa" })] })] }), _jsxs("div", { style: { display: 'flex', gap: '8px', marginTop: 8 }, children: [_jsx("button", { className: "btn", onClick: () => {
                                                        if (appState.activeTextId) {
                                                            const textEl = appState.textElements.find(t => t.id === appState.activeTextId);
                                                            if (textEl) {
                                                                // Duplicate the text with slight offset
                                                                const newUV = { u: textEl.u + 0.05, v: textEl.v + 0.05 };
                                                                useApp.getState().addTextElement(textEl.text, newUV, textEl.layerId);
                                                            }
                                                        }
                                                    }, style: { flex: 1, background: '#00aa00' }, children: "\uD83D\uDCCB Duplicate" }), _jsx("button", { className: "btn", onClick: () => {
                                                        if (appState.activeTextId) {
                                                            useApp.getState().removeTextElement(appState.activeTextId);
                                                        }
                                                    }, style: { flex: 1, background: '#ff4444' }, children: "\uD83D\uDDD1\uFE0F Delete" })] })] }))] }));
                    })()] }), activeToolSidebar === 'puffPrint' && (_jsx(PuffPrintTool, { active: true })), activeToolSidebar === 'patternMaker' && (_jsx(PatternMaker, { active: true })), activeToolSidebar === 'advancedSelection' && (_jsx(AdvancedSelection, { active: true })), activeToolSidebar === 'aiAssistant' && (_jsx(AIDesignAssistant, { active: true })), activeToolSidebar === 'printExport' && (_jsx(PrintReadyExport, { active: true })), activeToolSidebar === 'cloudSync' && (_jsx(CloudSync, { active: true })), activeToolSidebar === 'layerEffects' && (_jsx(LayerEffects, { active: true })), activeToolSidebar === 'colorGrading' && (_jsx(ColorGrading, { active: true })), activeToolSidebar === 'animation' && (_jsx(AnimationTools, { active: true })), activeToolSidebar === 'templates' && (_jsx(DesignTemplates, { active: true })), activeToolSidebar === 'batch' && (_jsx(BatchProcessing, { active: true })), activeToolSidebar === 'vectorTools' && (_jsx(VectorTools, { active: true })), !activeToolSidebar && (_jsx(FeatureShowcase, { active: true }))] }));
}
