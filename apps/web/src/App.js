import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useRef } from 'react';
import { create } from 'zustand';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, GizmoHelper, GizmoViewport, Grid, Html } from '@react-three/drei';
import localforage from 'localforage';
import LZString from 'lz-string';
import { Shirt } from './three/Shirt';
import { ModelManager } from './components/ModelManager';
import { BackgroundManager } from './components/BackgroundManager';
import { BackgroundScene } from './components/BackgroundScene';
import { CursorOverlay } from './components/CursorOverlay';
import { MainLayout } from './components/MainLayout';
import { ToolRouter } from './components/ToolRouter';
import { handleRenderingError, handleCanvasError } from './utils/CentralizedErrorHandler';
export const useApp = create((set, get) => ({
    // Default state
    activeTool: 'brush',
    setTool: (tool) => set({ activeTool: tool }),
    vectorMode: false,
    setVectorMode: (enabled) => set({ vectorMode: enabled }),
    showAnchorPoints: false,
    setShowAnchorPoints: (enabled) => set({ showAnchorPoints: enabled }),
    brushColor: '#ff3366',
    brushSize: 50,
    brushOpacity: 1,
    brushHardness: 1,
    brushSpacing: 0.05,
    brushShape: 'round',
    brushRotation: 0,
    brushDynamics: false,
    brushSymmetry: false,
    symmetryAngle: 0,
    blendMode: 'source-over',
    cursorAngle: 0,
    brushFlow: 1,
    brushSmoothing: 0.5,
    usePressureSize: false,
    usePressureOpacity: false,
    symmetryX: false,
    symmetryY: false,
    symmetryZ: false,
    fillTolerance: 32,
    fillGrow: 0,
    fillAntiAlias: true,
    fillContiguous: true,
    roughness: 0.8,
    metalness: 0,
    fabric: 'cotton',
    fabricPreset: 'cotton',
    modelUrl: null,
    modelPosition: [0, 0, 0],
    modelRotation: [0, 0, 0],
    modelScale: 1,
    modelChoice: 'tshirt',
    modelType: 'tshirt',
    modelScene: null,
    modelBoundsHeight: 0,
    modelMinDimension: 0,
    shapeMode: 'fill',
    shapeStrokeWidth: 2,
    // Puff Print defaults
    puffBrushSize: 20,
    puffBrushOpacity: 1.0,
    puffHeight: 2.0,
    puffCurvature: 0.8,
    puffShape: 'sphere',
    puffColor: '#ff69b4',
    // Embroidery defaults
    embroideryStitches: [],
    embroideryPattern: null,
    embroideryThreadType: 'cotton',
    embroideryThickness: 3,
    embroideryOpacity: 1.0,
    embroideryColor: '#ff69b4',
    embroideryStitchType: 'satin',
    embroideryPatternDescription: '',
    embroideryAIEnabled: true,
    layers: [],
    activeLayerId: null,
    composedCanvas: null,
    composedVersion: 0,
    baseTexture: null,
    decals: [],
    activeDecalId: null,
    textSize: 24,
    textFont: 'Arial',
    textColor: '#000000',
    textBold: false,
    textItalic: false,
    textAlign: 'left',
    lastText: '',
    layerTransform: null,
    backgroundScene: 'studio',
    backgroundIntensity: 1,
    backgroundRotation: 0,
    textElements: [],
    activeTextId: null,
    hoveredTextId: null,
    leftPanelOpen: true,
    rightPanelOpen: true,
    modelManagerOpen: false,
    backgroundManagerOpen: false,
    // Universal Grid & Scale defaults
    showGrid: true,
    gridSize: 20,
    gridColor: '#333333',
    gridOpacity: 0.3,
    showRulers: true,
    rulerUnits: 'px',
    scale: 1.0,
    showGuides: false,
    guideColor: '#FF0000',
    snapToGrid: true,
    snapDistance: 5,
    showMeasurements: false,
    measurementUnits: 'px',
    controlsEnabled: true,
    controlsTarget: [0, 0, 0],
    controlsDistance: 2,
    // Methods
    setActiveTool: (tool) => set({ activeTool: tool }),
    setBrushColor: (color) => set({ brushColor: color }),
    setBrushSize: (size) => set({ brushSize: size }),
    setBrushOpacity: (opacity) => set({ brushOpacity: opacity }),
    setBrushHardness: (hardness) => set({ brushHardness: hardness }),
    setBrushSpacing: (spacing) => set({ brushSpacing: spacing }),
    setBrushShape: (shape) => set({ brushShape: shape }),
    setBrushRotation: (rotation) => set({ brushRotation: rotation }),
    setBrushDynamics: (dynamics) => set({ brushDynamics: dynamics }),
    setBrushSymmetry: (symmetry) => set({ brushSymmetry: symmetry }),
    setSymmetryAngle: (angle) => set({ symmetryAngle: angle }),
    setBlendMode: (mode) => set({ blendMode: mode }),
    setCursorAngle: (angle) => set({ cursorAngle: angle }),
    setFillTolerance: (tolerance) => set({ fillTolerance: tolerance }),
    setFillGrow: (grow) => set({ fillGrow: grow }),
    setFillAntiAlias: (antiAlias) => set({ fillAntiAlias: antiAlias }),
    setFillContiguous: (contiguous) => set({ fillContiguous: contiguous }),
    setRoughness: (roughness) => set({ roughness: roughness }),
    setMetalness: (metalness) => set({ metalness: metalness }),
    setFabric: (fabric) => set({ fabric: fabric }),
    setModelUrl: (url) => set({ modelUrl: url }),
    setModelPosition: (position) => set({ modelPosition: position }),
    setModelRotation: (rotation) => set({ modelRotation: rotation }),
    setModelScale: (scale) => set({ modelScale: scale }),
    setActiveLayerId: (id) => set({ activeLayerId: id }),
    setActiveDecalId: (id) => set({ activeDecalId: id }),
    setTextSize: (size) => set({ textSize: size }),
    setTextFont: (font) => set({ textFont: font }),
    setTextColor: (color) => set({ textColor: color }),
    setTextBold: (bold) => set({ textBold: bold }),
    setTextItalic: (italic) => set({ textItalic: italic }),
    setTextAlign: (align) => set({ textAlign: align }),
    setLastText: (text) => set({ lastText: text }),
    setBackgroundScene: (scene) => set({ backgroundScene: scene }),
    setBackgroundIntensity: (intensity) => set({ backgroundIntensity: intensity }),
    setBackgroundRotation: (rotation) => set({ backgroundRotation: rotation }),
    setActiveTextId: (id) => set({ activeTextId: id }),
    setLeftPanelOpen: (open) => set({ leftPanelOpen: open }),
    setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
    setModelManagerOpen: (open) => set({ modelManagerOpen: open }),
    openModelManager: () => set({ modelManagerOpen: true }),
    closeModelManager: () => set({ modelManagerOpen: false }),
    setControlsEnabled: (enabled) => set({ controlsEnabled: enabled }),
    setControlsTarget: (target) => set({ controlsTarget: target }),
    setControlsDistance: (distance) => set({ controlsDistance: distance }),
    // Grid & Scale setters
    setShowGrid: (show) => set({ showGrid: show }),
    setGridSize: (size) => set({ gridSize: size }),
    setGridColor: (color) => set({ gridColor: color }),
    setGridOpacity: (opacity) => set({ gridOpacity: opacity }),
    setShowRulers: (show) => set({ showRulers: show }),
    setRulerUnits: (units) => set({ rulerUnits: units }),
    setScale: (scale) => set({ scale: scale }),
    setShowGuides: (show) => set({ showGuides: show }),
    setGuideColor: (color) => set({ guideColor: color }),
    setSnapToGrid: (snap) => set({ snapToGrid: snap }),
    setSnapDistance: (distance) => set({ snapDistance: distance }),
    setShowMeasurements: (show) => set({ showMeasurements: show }),
    setMeasurementUnits: (units) => set({ measurementUnits: units }),
    // Puff Print setters
    setPuffBrushSize: (size) => set({ puffBrushSize: size }),
    setPuffBrushOpacity: (opacity) => set({ puffBrushOpacity: opacity }),
    setPuffHeight: (height) => set({ puffHeight: height }),
    setPuffCurvature: (curvature) => set({ puffCurvature: curvature }),
    setPuffShape: (shape) => set({ puffShape: shape }),
    setPuffColor: (color) => set({ puffColor: color }),
    // Embroidery setters
    setEmbroideryStitches: (stitches) => set({ embroideryStitches: stitches }),
    setEmbroideryPattern: (pattern) => set({ embroideryPattern: pattern }),
    setEmbroideryThreadType: (type) => set({ embroideryThreadType: type }),
    setEmbroideryThickness: (thickness) => set({ embroideryThickness: thickness }),
    setEmbroideryOpacity: (opacity) => set({ embroideryOpacity: opacity }),
    setEmbroideryColor: (color) => {
        // Validate hex color format
        if (color && typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color)) {
            set({ embroideryColor: color });
        }
        else {
            console.warn('Invalid embroidery color provided:', color, 'Using default color');
            set({ embroideryColor: '#ff69b4' });
        }
    },
    setEmbroideryStitchType: (type) => set({ embroideryStitchType: type }),
    setEmbroideryPatternDescription: (description) => set({ embroideryPatternDescription: description }),
    setEmbroideryAIEnabled: (enabled) => set({ embroideryAIEnabled: enabled }),
    undo: () => {
        const layer = get().getActiveLayer();
        if (!layer || layer.history.length === 0)
            return;
        const current = layer.canvas.getContext('2d').getImageData(0, 0, layer.canvas.width, layer.canvas.height);
        layer.future.unshift(current);
        const prev = layer.history.pop();
        layer.canvas.getContext('2d').putImageData(prev, 0, 0);
        get().composeLayers();
    },
    redo: () => {
        const layer = get().getActiveLayer();
        if (!layer || layer.future.length === 0)
            return;
        const current = layer.canvas.getContext('2d').getImageData(0, 0, layer.canvas.width, layer.canvas.height);
        layer.history.push(current);
        const next = layer.future.shift();
        layer.canvas.getContext('2d').putImageData(next, 0, 0);
        get().composeLayers();
    },
    selectLayerForTransform: (layerId) => {
        const layer = get().layers.find(l => l.id === layerId);
        const composed = get().composedCanvas;
        if (!layer || !composed)
            return;
        set({ layerTransform: { x: 100, y: 100, cx: 200, cy: 200, width: 200, height: 200, rotation: 0, scale: 1, skewX: 0, skewY: 0 } });
    },
    updateLayerTransform: (patch) => {
        const current = get().layerTransform;
        if (!current)
            return;
        set({ layerTransform: { ...current, ...patch } });
    },
    applyLayerTransform: () => {
        set({ layerTransform: null });
    },
    cancelLayerTransform: () => {
        set({ layerTransform: null });
    },
    addDecal: (image, name) => {
        const id = Math.random().toString(36).slice(2);
        const composed = get().composedCanvas;
        const w = image.width;
        const h = image.height;
        const scale = composed ? Math.min(composed.width, composed.height) * 0.25 / Math.max(w, h) : 0.25;
        const decal = {
            id, name: name || `Decal ${id.slice(0, 4)}`, image, width: w, height: h,
            u: 0.5, v: 0.5, scale, rotation: 0, opacity: 1, blendMode: 'source-over',
            layerId: get().activeLayerId || undefined
        };
        set(state => ({ decals: [...state.decals, decal] }));
        return id;
    },
    updateDecal: (id, patch) => {
        set(state => ({ decals: state.decals.map(d => d.id === id ? { ...d, ...patch } : d) }));
        get().composeLayers();
    },
    deleteDecal: (id) => {
        set(state => ({ decals: state.decals.filter(d => d.id !== id) }));
        get().composeLayers();
    },
    addTextElement: (text, uv, layerId) => {
        const id = Math.random().toString(36).slice(2);
        const textElement = {
            id, text, x: 0, y: 0, u: uv.u, v: uv.v,
            fontSize: get().textSize, fontFamily: get().textFont,
            bold: get().textBold, italic: get().textItalic,
            underline: false, strikethrough: false,
            align: get().textAlign, color: get().textColor,
            opacity: 1, rotation: 0, letterSpacing: 0, lineHeight: 1.2,
            shadow: { blur: 0, offsetX: 0, offsetY: 0, color: '#000000' },
            textCase: 'none',
            layerId: get().activeLayerId || undefined
        };
        set(state => ({ textElements: [...state.textElements, textElement] }));
        get().composeLayers();
        return id;
    },
    updateTextElement: (id, patch) => {
        set(state => ({ textElements: state.textElements.map(t => t.id === id ? { ...t, ...patch } : t) }));
        get().composeLayers();
    },
    deleteTextElement: (id) => {
        set(state => ({ textElements: state.textElements.filter(t => t.id !== id) }));
        get().composeLayers();
    },
    // Layer management
    addLayer: (name) => {
        const composed = get().composedCanvas;
        const width = composed?.width || 2048;
        const height = composed?.height || 2048;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'transparent';
        ctx.fillRect(0, 0, width, height);
        const id = Math.random().toString(36).slice(2);
        const layer = { id, name: name || `Layer ${id.slice(0, 4)}`, visible: true, canvas, history: [], future: [] };
        set(state => ({ layers: [...state.layers, layer], activeLayerId: id }));
        return id;
    },
    initCanvases: (w, h) => {
        const base = document.createElement('canvas');
        base.width = w;
        base.height = h;
        const composed = document.createElement('canvas');
        composed.width = w;
        composed.height = h;
        const paint = document.createElement('canvas');
        paint.width = w;
        paint.height = h;
        const layers = [
            { id: 'paint', name: 'Paint', visible: true, canvas: paint, history: [], future: [] }
        ];
        console.log('App: Initializing canvases with size:', w, 'x', h);
        set({ layers, activeLayerId: 'paint', composedCanvas: composed });
        console.log('App: composedCanvas set, current store state:', {
            modelScene: !!get().modelScene,
            composedCanvas: !!get().composedCanvas
        });
        get().composeLayers();
    },
    getActiveLayer: () => {
        const { layers, activeLayerId } = get();
        return layers.find(l => l.id === activeLayerId) || null;
    },
    composeLayers: () => {
        try {
            let { layers, composedCanvas, decals, textElements, activeLayerId, baseTexture, activeTool } = get();
            if (!composedCanvas) {
                console.warn('No composed canvas available for layer composition - creating one');
                // Initialize composed canvas if it doesn't exist
                const newComposedCanvas = document.createElement('canvas');
                newComposedCanvas.width = 4096;
                newComposedCanvas.height = 4096;
                useApp.setState({ composedCanvas: newComposedCanvas });
                // Update the local variable to use the new canvas
                composedCanvas = newComposedCanvas;
            }
            console.log('🎨 Composing layers', {
                layersCount: layers.length,
                textElementsCount: textElements.length,
                composedCanvasSize: `${composedCanvas.width}x${composedCanvas.height}`,
                activeTool
            });
            // Early exit if no content to compose
            if (layers.length === 0 && decals.length === 0 && textElements.length === 0 && !baseTexture) {
                return;
            }
            const ctx = composedCanvas.getContext('2d', {
                willReadFrequently: true,
                alpha: true,
                desynchronized: false
            });
            // Enable high-quality rendering
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.clearRect(0, 0, composedCanvas.width, composedCanvas.height);
            // Draw base texture first (bottom layer)
            if (baseTexture) {
                console.log('Drawing base texture to composed canvas');
                ctx.drawImage(baseTexture, 0, 0, composedCanvas.width, composedCanvas.height);
            }
            else {
                console.log('No base texture available');
            }
            // Draw layers and their associated elements
            for (const layer of layers) {
                if (!layer.visible)
                    continue;
                ctx.save();
                ctx.globalAlpha = 1;
                ctx.globalCompositeOperation = 'source-over';
                ctx.drawImage(layer.canvas, 0, 0);
                // Draw decals for this layer
                for (const d of get().decals) {
                    if (d.layerId !== layer.id)
                        continue;
                    const x = Math.round(d.u * composedCanvas.width);
                    const y = Math.round(d.v * composedCanvas.height);
                    const w = Math.round(d.width * d.scale);
                    const h = Math.round(d.height * d.scale);
                    ctx.save();
                    ctx.globalAlpha = d.opacity;
                    ctx.globalCompositeOperation = d.blendMode;
                    ctx.translate(x + w / 2, y + h / 2);
                    ctx.rotate(d.rotation);
                    ctx.drawImage(d.image, -w / 2, -h / 2, w, h);
                    ctx.restore();
                }
                // Draw text elements for this layer
                for (const textEl of textElements) {
                    if (textEl.layerId !== layer.id)
                        continue;
                    try {
                        const x = Math.round(textEl.u * composedCanvas.width);
                        const y = Math.round(textEl.v * composedCanvas.height);
                        ctx.save();
                        // Apply text transformations
                        ctx.translate(x, y);
                        ctx.rotate(textEl.rotation);
                        ctx.globalAlpha = textEl.opacity;
                        // Configure font
                        let font = '';
                        if (textEl.bold)
                            font += 'bold ';
                        if (textEl.italic)
                            font += 'italic ';
                        font += `${textEl.fontSize}px ${textEl.fontFamily}`;
                        ctx.font = font;
                        ctx.textAlign = textEl.align;
                        ctx.textBaseline = 'top';
                        // Apply text case transformation
                        let displayText = textEl.text;
                        switch (textEl.textCase) {
                            case 'uppercase':
                                displayText = displayText.toUpperCase();
                                break;
                            case 'lowercase':
                                displayText = displayText.toLowerCase();
                                break;
                            case 'capitalize':
                                displayText = displayText.replace(/\b\w/g, l => l.toUpperCase());
                                break;
                        }
                        // Draw shadow if enabled
                        if (textEl.shadow && textEl.shadow.blur > 0) {
                            ctx.shadowColor = textEl.shadow.color;
                            ctx.shadowBlur = textEl.shadow.blur;
                            ctx.shadowOffsetX = textEl.shadow.offsetX;
                            ctx.shadowOffsetY = textEl.shadow.offsetY;
                        }
                        // Handle multiline text
                        const lines = displayText.split('\n');
                        const lineHeight = textEl.fontSize * textEl.lineHeight;
                        lines.forEach((line, index) => {
                            const yPos = index * lineHeight;
                            // Draw outline if enabled
                            if (textEl.outline && textEl.outline.width > 0) {
                                ctx.strokeStyle = textEl.outline.color;
                                ctx.lineWidth = textEl.outline.width;
                                ctx.strokeText(line, 0, yPos);
                            }
                            // Draw main text
                            if (textEl.gradient) {
                                // Create gradient
                                const gradient = textEl.gradient.type === 'linear'
                                    ? ctx.createLinearGradient(0, 0, ctx.measureText(line).width, 0)
                                    : ctx.createRadialGradient(0, 0, 0, 0, 0, textEl.fontSize);
                                textEl.gradient.colors.forEach((color, i) => {
                                    const stop = textEl.gradient.stops[i] || (i / (textEl.gradient.colors.length - 1));
                                    gradient.addColorStop(stop, color);
                                });
                                ctx.fillStyle = gradient;
                            }
                            else {
                                ctx.fillStyle = textEl.color;
                            }
                            ctx.fillText(line, 0, yPos);
                            // Draw decorations
                            if (textEl.underline || textEl.strikethrough) {
                                const metrics = ctx.measureText(line);
                                const textWidth = metrics.width;
                                ctx.strokeStyle = textEl.color;
                                ctx.lineWidth = Math.max(1, textEl.fontSize * 0.05);
                                if (textEl.underline) {
                                    const underlineY = yPos + textEl.fontSize * 0.9;
                                    ctx.beginPath();
                                    ctx.moveTo(0, underlineY);
                                    ctx.lineTo(textWidth, underlineY);
                                    ctx.stroke();
                                }
                                if (textEl.strikethrough) {
                                    const strikeY = yPos + textEl.fontSize * 0.5;
                                    ctx.beginPath();
                                    ctx.moveTo(0, strikeY);
                                    ctx.lineTo(textWidth, strikeY);
                                    ctx.stroke();
                                }
                            }
                        });
                        ctx.restore();
                    }
                    catch (error) {
                        console.error('Error drawing text element:', error);
                    }
                }
                ctx.restore();
            }
            // Increment version to trigger re-render
            set(state => ({ composedVersion: state.composedVersion + 1 }));
            console.log('🎨 Layer composition complete', { version: get().composedVersion });
        }
        catch (error) {
            handleCanvasError(error, { component: 'App', function: 'composeLayers' });
        }
    },
    commit: () => {
        const layer = get().getActiveLayer();
        if (!layer)
            return;
        const current = layer.canvas.getContext('2d').getImageData(0, 0, layer.canvas.width, layer.canvas.height);
        layer.history.push(current);
        layer.future = [];
        if (layer.history.length > 50)
            layer.history.shift();
    },
    forceRerender: () => {
        try {
            console.log('Force rerendering...');
            const { composedCanvas } = get();
            if (composedCanvas) {
                get().composeLayers();
            }
        }
        catch (error) {
            handleRenderingError(error, { component: 'App', function: 'forceRerender' });
        }
    },
    setBaseTexture: (texture) => set({ baseTexture: texture }),
    generateBaseLayer: () => {
        const { modelScene, composedCanvas } = get();
        if (!modelScene || !composedCanvas) {
            console.log('Cannot generate base layer: missing modelScene or composedCanvas');
            return;
        }
        console.log('Generating base layer from model...');
    },
    addDecalFromFile: async (file) => {
        const image = await createImageBitmap(file);
        const id = Math.random().toString(36).slice(2);
        const composed = get().composedCanvas;
        const w = image.width;
        const h = image.height;
        const scale = composed ? Math.min(composed.width, composed.height) * 0.25 / Math.max(w, h) : 0.25;
        const decal = {
            id, name: file.name.replace(/\.[^/.]+$/, '') || `Decal ${id.slice(0, 4)}`, image, width: w, height: h,
            u: 0.5, v: 0.5, scale, rotation: 0, opacity: 1, blendMode: 'source-over',
            layerId: get().activeLayerId || undefined
        };
        set(state => ({ decals: [...state.decals, decal] }));
        get().composeLayers();
        return id;
    },
    // Checkpoint system
    saveCheckpoint: async (name) => {
        const state = get();
        const id = Math.random().toString(36).slice(2);
        const checkpoint = {
            id,
            name: name || `Checkpoint ${new Date().toLocaleTimeString()}`,
            timestamp: Date.now(),
            modelUrl: state.modelUrl,
            modelPosition: state.modelPosition,
            modelRotation: state.modelRotation,
            modelScale: state.modelScale,
            backgroundScene: state.backgroundScene,
            backgroundIntensity: state.backgroundIntensity,
            backgroundRotation: state.backgroundRotation,
            textElements: state.textElements,
            decals: []
        };
        const layerEntries = [];
        let totalBytes = 0;
        const canvasToBlob = (canvas) => new Promise((resolve) => canvas.toBlob(b => resolve(b || new Blob()), 'image/png'));
        for (let i = 0; i < state.layers.length; i++) {
            const l = state.layers[i];
            const blob = await canvasToBlob(l.canvas);
            totalBytes += blob.size;
            const key = `checkpoint-${id}-layer-${i}`;
            await localforage.setItem(key, blob);
            layerEntries.push({ id: l.id, name: l.name, visible: l.visible, width: l.canvas.width, height: l.canvas.height, key });
        }
        checkpoint.layers = layerEntries;
        const compressedData = LZString.compress(JSON.stringify(checkpoint));
        await localforage.setItem(`checkpoint-${id}`, compressedData);
        const meta = {
            id,
            name: checkpoint.name,
            timestamp: checkpoint.timestamp,
            size: totalBytes,
            createdAt: checkpoint.timestamp,
            sizeBytes: totalBytes
        };
        return meta;
    },
    loadCheckpoint: async (id) => {
        const compressed = await localforage.getItem(`checkpoint-${id}`);
        if (!compressed)
            throw new Error('Checkpoint not found');
        const data = JSON.parse(LZString.decompress(compressed) || '{}');
        const layers = [];
        for (const lp of data.layers || []) {
            const blob = await localforage.getItem(lp.key);
            if (!blob)
                continue;
            const canvas = document.createElement('canvas');
            canvas.width = lp.width;
            canvas.height = lp.height;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            await new Promise((resolve) => {
                img.onload = resolve;
                img.src = URL.createObjectURL(blob);
            });
            ctx.drawImage(img, 0, 0);
            layers.push({ id: lp.id, name: lp.name, visible: lp.visible, canvas, history: [], future: [] });
        }
        const composedCanvas = document.createElement('canvas');
        const base = layers[0];
        composedCanvas.width = base?.canvas.width || 4096;
        composedCanvas.height = base?.canvas.height || 4096;
        useApp.setState({
            modelUrl: data.modelUrl || null,
            modelPosition: data.modelPosition || [0, 0, 0],
            modelRotation: data.modelRotation || [0, 0, 0],
            modelScale: data.modelScale || 1,
            backgroundScene: data.backgroundScene || 'studio',
            backgroundIntensity: data.backgroundIntensity || 1,
            backgroundRotation: data.backgroundRotation || 0,
            textElements: data.textElements || [],
            layers,
            activeLayerId: layers[0]?.id || null,
            composedCanvas,
            decals: [],
        });
        get().composeLayers();
    },
    listCheckpoints: async () => {
        const keys = await localforage.keys();
        const checkpointKeys = keys.filter(k => k.startsWith('checkpoint-') && !k.includes('-layer-'));
        const metas = [];
        for (const key of checkpointKeys) {
            try {
                const compressed = await localforage.getItem(key);
                if (!compressed)
                    continue;
                const data = JSON.parse(LZString.decompress(compressed) || '{}');
                metas.push({
                    id: data.id,
                    name: data.name,
                    timestamp: data.timestamp,
                    size: 0,
                    createdAt: data.timestamp,
                    sizeBytes: 0
                });
            }
            catch (e) { }
        }
        return metas.sort((a, b) => b.timestamp - a.timestamp);
    },
    deleteCheckpoint: async (id) => {
        await localforage.removeItem(`checkpoint-${id}`);
        const keys = await localforage.keys();
        const layerKeys = keys.filter(k => k.startsWith(`checkpoint-${id}-layer-`));
        for (const key of layerKeys) {
            await localforage.removeItem(key);
        }
    },
    // Additional missing methods
    selectTextElement: (id) => set({ activeTextId: id }),
    removeTextElement: (id) => {
        set(state => ({ textElements: state.textElements.filter(t => t.id !== id) }));
        get().composeLayers();
    },
    setModelChoice: (choice) => set({ modelChoice: choice }),
    setModelType: (type) => set({ modelType: type }),
    setModelBoundsHeight: (height) => set({ modelBoundsHeight: height }),
    setModelMinDimension: (dimension) => set({ modelMinDimension: dimension }),
    setFrame: (target, distance) => {
        set({ controlsTarget: target, controlsDistance: distance });
    },
    resetModelTransform: () => {
        set({
            modelPosition: [0, 0, 0],
            modelRotation: [0, 0, 0],
            modelScale: 1
        });
    },
    setLastHitUV: (uv) => {
        // This would typically store the last hit UV coordinates
        console.log('Last hit UV:', uv);
    },
    setHoveredTextId: (id) => set({ hoveredTextId: id }),
    openBackgroundManager: () => set({ backgroundManagerOpen: true }),
    closeBackgroundManager: () => set({ backgroundManagerOpen: false }),
    snapshot: () => {
        // This would typically take a snapshot of the current state
        console.log('Taking snapshot...');
    }
}));
function App() {
    const composedCanvas = useApp(s => s.composedCanvas);
    const activeTool = useApp(s => s.activeTool);
    const drawingActive = ['brush', 'eraser', 'fill', 'picker', 'smudge', 'blur', 'select', 'transform', 'move', 'puffPrint'].includes(activeTool);
    const wrapRef = useRef(null);
    const controlsTarget = useApp(s => s.controlsTarget);
    const controlsDistance = useApp(s => s.controlsDistance);
    const cameraView = useApp(s => s.cameraView || null);
    const controlsRef = useRef(null);
    const decals = useApp(s => s.decals);
    const activeDecalId = useApp(s => s.activeDecalId);
    // Initialize canvases
    useEffect(() => {
        useApp.getState().initCanvases(2048, 2048);
    }, []);
    // Camera view effect
    useEffect(() => {
        if (!cameraView || !controlsRef.current)
            return;
        const controls = controlsRef.current;
        // Set camera position and target based on view
        switch (cameraView) {
            case 'front':
                controls.object.position.set(0, 0, controlsDistance);
                controls.target.set(...controlsTarget);
                break;
            case 'back':
                controls.object.position.set(0, 0, -controlsDistance);
                controls.target.set(...controlsTarget);
                break;
            case 'left':
                controls.object.position.set(-controlsDistance, 0, 0);
                controls.target.set(...controlsTarget);
                break;
            case 'right':
                controls.object.position.set(controlsDistance, 0, 0);
                controls.target.set(...controlsTarget);
                break;
            case 'top':
                controls.object.position.set(0, controlsDistance, 0);
                controls.target.set(...controlsTarget);
                break;
            case 'bottom':
                controls.object.position.set(0, -controlsDistance, 0);
                controls.target.set(...controlsTarget);
                break;
        }
        controls.update();
        useApp.setState({ cameraView: null });
    }, [cameraView, controlsTarget, controlsDistance]);
    return (_jsxs(_Fragment, { children: [_jsx(MainLayout, { children: _jsxs("div", { ref: wrapRef, className: `canvas-wrap ${drawingActive ? 'drawing' : ''}`, children: [_jsxs(Canvas, { shadows: true, camera: { position: [0.6, 0.9, 1.6], fov: 45 }, dpr: [1, 2], gl: { powerPreference: 'high-performance', antialias: true }, children: [_jsx("color", { attach: "background", args: [0.06, 0.07, 0.09] }), _jsx("group", { position: useApp(s => s.modelPosition), rotation: useApp(s => s.modelRotation), scale: useApp(s => s.modelScale), children: _jsx(Shirt, {}) }), _jsx(Grid, { position: [0, 0, 0], infiniteGrid: false, args: [50, 50], cellSize: 0.1, cellThickness: 0.6, sectionSize: 1, sectionThickness: 1.4, sectionColor: "#64748b", cellColor: "#334155", fadeDistance: 0 }), _jsx("axesHelper", { args: [2] }), _jsx(Html, { position: [0, 0, 0], center: true, style: { pointerEvents: 'none' }, children: _jsx("div", { style: { width: 12, height: 12, borderRadius: 999, background: '#eab308', boxShadow: '0 0 8px rgba(234,179,8,0.9), 0 0 1px #000 inset' } }) }), _jsx(BackgroundScene, { backgroundType: useApp(s => s.backgroundScene), intensity: useApp(s => s.backgroundIntensity), rotation: useApp(s => s.backgroundRotation) }), _jsx(OrbitControls, { ref: controlsRef, enablePan: true, enableZoom: true, zoomToCursor: true, enabled: useApp(s => s.controlsEnabled), minDistance: useApp(s => {
                                        const h = s.modelBoundsHeight || (s.controlsDistance ?? 1);
                                        const scale = s.modelScale || 1;
                                        const minDim = s.modelMinDimension || h * 0.1;
                                        return Math.max(0.001, Math.min(h * scale * 0.001, minDim * scale * 0.01));
                                    }), maxDistance: useApp(s => Math.max(2, (s.controlsDistance ?? 1) * 8)) }), _jsx(GizmoHelper, { alignment: "bottom-right", margin: [60, 60], children: _jsx(GizmoViewport, { axisColors: ["#ef4444", "#22c55e", "#60a5fa"], labelColor: "#e5e7eb" }) })] }), _jsx(CursorManager, { wrapRef: wrapRef, drawingActive: drawingActive }), _jsx(ToolRouter, { active: true })] }) }), _jsx(ModelManager, { isOpen: useApp(s => s.modelManagerOpen), onClose: useApp(s => s.closeModelManager) }), _jsx(BackgroundManager, {})] }));
}
function CursorManager({ wrapRef, drawingActive }) {
    const tool = useApp(s => s.activeTool);
    const size = useApp(s => s.brushSize);
    const shape = useApp(s => s.brushShape);
    const angle = useApp(s => s.cursorAngle);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = wrapRef.current;
        if (!el)
            return;
        const onMove = (e) => {
            const rect = el.getBoundingClientRect();
            setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            setVisible(true);
        };
        const onLeave = () => setVisible(false);
        const onEnter = () => setVisible(drawingActive);
        el.addEventListener('mousemove', onMove);
        el.addEventListener('mouseleave', onLeave);
        el.addEventListener('mouseenter', onEnter);
        return () => {
            el.removeEventListener('mousemove', onMove);
            el.removeEventListener('mouseleave', onLeave);
            el.removeEventListener('mouseenter', onEnter);
        };
    }, [wrapRef, drawingActive, tool]);
    useEffect(() => {
        if (!drawingActive)
            setVisible(false);
    }, [drawingActive]);
    return _jsx(CursorOverlay, { x: pos.x, y: pos.y, visible: visible, tool: tool, size: size, shape: shape, angle: angle });
}
export default App;
