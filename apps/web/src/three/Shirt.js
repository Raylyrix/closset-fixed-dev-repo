import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import * as THREE from 'three';
import { useApp } from '../App';
import { Html } from '@react-three/drei';
import { vectorStore } from '../vector/vectorState';
import { renderStitchType } from '../utils/stitchRendering';
import { performanceMonitor } from '../utils/PerformanceMonitor';
import { enhancedVectorTools } from '../vector/EnhancedVectorTools';
import { universalVectorRenderer } from '../core/UniversalVectorRenderer';
import { logRenderingError } from '../utils/errorLogger';
import { errorPrevention } from '../utils/errorPrevention';
import { calculateAutoControlPoints, snapToGrid, snapToPoint } from '../utils/vectorMath';
const DEFAULT_MODEL = '/models/shirt.glb';
const DEFAULT_FALLBACK_URLS = [
    '/models/shirt.glb',
    import.meta.env?.VITE_DEFAULT_MODEL_URL || '',
    'https://raw.githubusercontent.com/pmndrs/drei-assets/master/shirt.glb',
    'https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/tshirt/model.glb'
].filter(Boolean);
export function Shirt() {
    const modelUrl = useApp(s => s.modelUrl);
    const modelChoice = useApp(s => s.modelChoice);
    const modelType = useApp(s => s.modelType);
    const modelScene = useApp(s => s.modelScene);
    const modelScale = useApp(s => s.modelScale);
    const modelPosition = useApp(s => s.modelPosition);
    const modelRotation = useApp(s => s.modelRotation);
    const modelBoundsHeight = useApp(s => s.modelBoundsHeight);
    const composedCanvas = useApp(s => s.composedCanvas);
    const getActiveLayer = useApp(s => s.getActiveLayer);
    const composeLayers = useApp(s => s.composeLayers);
    const brushColor = useApp(s => s.brushColor);
    const brushSize = useApp(s => s.brushSize);
    const brushOpacity = useApp(s => s.brushOpacity);
    const brushShape = useApp(s => s.brushShape);
    const brushSpacing = useApp(s => s.brushSpacing);
    const brushSmoothing = useApp(s => s.brushSmoothing);
    const usePressureSize = useApp(s => s.usePressureSize);
    const usePressureOpacity = useApp(s => s.usePressureOpacity);
    const brushHardness = useApp(s => s.brushHardness);
    const brushFlow = useApp(s => s.brushFlow);
    const blendMode = useApp(s => s.blendMode);
    const symmetryY = useApp(s => s.symmetryY);
    const symmetryZ = useApp(s => s.symmetryZ);
    const activeTool = useApp(s => s.activeTool);
    const vectorMode = useApp(s => s.vectorMode);
    // Debug vector mode changes and cleanup
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('🎨 Vector mode changed to:', vectorMode);
        }
        // Clear anchor points and selection when vector mode is disabled
        if (!vectorMode) {
            setSelectedAnchor(null);
            setDraggingAnchor(null);
            setDraggingControl(null);
            setCurvatureSegment(null);
            setPreviewLine(null);
            // Clear any vector-specific state
            vectorStore.setState({ selected: [] });
            // CRITICAL: Convert vector paths to embroidery stitches before clearing
            convertVectorPathsToEmbroideryStitches();
            // CRITICAL: Clear anchor points from canvas immediately
            const layer = getActiveLayer();
            if (layer) {
                const ctx = layer.canvas.getContext('2d');
                if (ctx) {
                    // Clear the entire canvas to remove all UI elements including anchor points
                    ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
                }
            }
            // Re-render all layers to ensure vector paths are preserved
            // This ensures stitches don't disappear when exiting vector mode
            setTimeout(() => {
                try {
                    console.log('🔄 Starting re-render after vector mode exit...');
                    // CRITICAL: Re-render all vector shapes first
                    renderVectorsToActiveLayer();
                    // Also re-render any existing embroidery stitches
                    const appState = useApp.getState();
                    if (appState.embroideryStitches && Array.isArray(appState.embroideryStitches)) {
                        console.log(`🧵 Re-rendering ${appState.embroideryStitches.length} existing embroidery stitches after vector mode exit`);
                        const layer = getActiveLayer();
                        if (layer) {
                            const ctx = layer.canvas.getContext('2d');
                            if (ctx) {
                                ctx.save();
                                appState.embroideryStitches.forEach((stitch) => {
                                    if (stitch && stitch.points && Array.isArray(stitch.points)) {
                                        // Re-render each embroidery stitch
                                        const stitchConfig = {
                                            type: stitch.stitchType || 'satin',
                                            color: stitch.color || appState.embroideryColor || '#ff69b4',
                                            thickness: stitch.thickness || appState.embroideryThickness || 3,
                                            opacity: stitch.opacity || appState.embroideryOpacity || 1.0
                                        };
                                        try {
                                            renderStitchType(ctx, stitch.points, stitchConfig);
                                        }
                                        catch (error) {
                                            console.error('Error re-rendering embroidery stitch:', error);
                                            logRenderingError(`Failed to re-render embroidery stitch: ${error}`, ['embroidery', 'stitch-rendering']);
                                        }
                                    }
                                });
                                ctx.restore();
                            }
                        }
                    }
                    // Compose all layers to ensure everything is visible
                    composeLayers();
                    console.log('✅ Successfully re-rendered all content after vector mode exit');
                }
                catch (error) {
                    console.error('❌ Error re-rendering content after vector mode exit:', error);
                    logRenderingError(`Failed to re-render content after vector mode exit: ${error}`, ['vector-tools', 'layer-rendering']);
                }
            }, 100); // Increased delay to ensure proper cleanup
        }
    }, [vectorMode]);
    // Cleanup vector store listeners on unmount
    useEffect(() => {
        return () => {
            // Cleanup any vector store listeners if needed
            console.log('🧹 Cleaning up vector tools');
        };
    }, []);
    const snapshot = useApp(s => s.snapshot);
    const commit = useApp(s => s.commit);
    const setState = useApp.setState;
    const setCursorAngle = useApp(s => s.setCursorAngle);
    const composedVersion = useApp(s => s.composedVersion || 0);
    const [geometry, setGeometry] = useState(null);
    const setControlsEnabled = useApp(s => s.setControlsEnabled);
    const [loadingError, setLoadingError] = useState(null);
    const [texture, setTexture] = useState(null);
    const meshRef = useRef(null);
    // Vector editing state
    const [draggingAnchor, setDraggingAnchor] = useState(null);
    const [draggingControl, setDraggingControl] = useState(null);
    const [selectedAnchor, setSelectedAnchor] = useState(null);
    const [curvatureDragging, setCurvatureDragging] = useState(false);
    const [curvatureStartPoint, setCurvatureStartPoint] = useState(null);
    const [curvatureCurrentPoint, setCurvatureCurrentPoint] = useState(null);
    const [curvatureSegment, setCurvatureSegment] = useState(null);
    // Debouncing for pen tool to prevent excessive point creation
    const lastPenPointRef = useRef(null);
    const PEN_DEBOUNCE_DISTANCE = 5; // Minimum distance between points
    const PEN_DEBOUNCE_TIME = 16; // Minimum time between points (60fps)
    // Preview line for pen tool
    const [previewLine, setPreviewLine] = useState(null);
    // Advanced pen tool features
    const [snapToGridEnabled, setSnapToGridEnabled] = useState(false);
    const [gridSize, setGridSize] = useState(10);
    const [snapToPointsEnabled, setSnapToPointsEnabled] = useState(false);
    const [snapDistance, setSnapDistance] = useState(10);
    const [autoSmooth, setAutoSmooth] = useState(true);
    const [smoothTension, setSmoothTension] = useState(0.5);
    // Selection tools state
    const [marqueeSelection, setMarqueeSelection] = useState(null);
    const [lassoSelection, setLassoSelection] = useState([]);
    const [isLassoDrawing, setIsLassoDrawing] = useState(false);
    // Transform tools state
    const [transformHandles, setTransformHandles] = useState([]);
    const [isTransforming, setIsTransforming] = useState(false);
    const [transformCenter, setTransformCenter] = useState(null);
    // Store original materials to restore them when needed
    const originalMaterialsRef = useRef(new Map());
    // Create a custom material that always uses our texture
    const customMaterial = useMemo(() => {
        if (!texture)
            return null;
        return new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.1
        });
    }, [texture]);
    const paintingActiveRef = useRef(false);
    const vectorDragRef = useRef(null);
    const shapeStartRef = useRef(null);
    const shapeBeforeRef = useRef(null);
    const { invalidate, camera, size: viewportSize } = useThree();
    const raycasterRef = useRef(new THREE.Raycaster());
    const decals = useApp((s) => s.decals || []);
    const activeDecalId = useApp((s) => s.activeDecalId || null);
    const updateDecal = useApp.getState().updateDecal;
    const selectDecal = useApp.getState().selectDecal;
    const setActiveLayerId = (id) => useApp.setState({ activeLayerId: id });
    function getOrSelectActiveLayer() {
        const layer = getActiveLayer();
        if (layer)
            return layer;
        const layersList = useApp.getState().layers;
        if (layersList && layersList.length) {
            const firstVisible = layersList.find(l => l.visible !== false) || layersList[0];
            if (firstVisible?.id) {
                setActiveLayerId(firstVisible.id);
                return firstVisible;
            }
        }
        return null;
    }
    useEffect(() => {
        if (!composedCanvas)
            return;
        console.log('Creating texture from composed canvas:', composedCanvas);
        const tex = new THREE.CanvasTexture(composedCanvas);
        tex.flipY = false;
        tex.anisotropy = 16;
        tex.colorSpace = THREE.SRGBColorSpace;
        console.log('Created texture:', tex);
        setTexture(tex);
    }, [composedCanvas]);
    // Store original materials when model scene is loaded
    useEffect(() => {
        if (!modelScene)
            return;
        console.log('Storing original materials for model scene');
        originalMaterialsRef.current.clear();
        modelScene.traverse((child) => {
            if (child.isMesh && child.material) {
                // Store the original material
                originalMaterialsRef.current.set(child, child.material);
                console.log('Stored original material for mesh:', child.name || 'unnamed');
            }
        });
    }, [modelScene]);
    // Apply texture to model materials whenever texture changes
    useEffect(() => {
        if (!texture || !modelScene)
            return;
        console.log('=== TEXTURE APPLICATION DEBUG ===');
        console.log('Texture:', texture);
        console.log('Texture image:', texture.image);
        console.log('Texture needsUpdate:', texture.needsUpdate);
        console.log('Model scene:', modelScene);
        console.log('Composed canvas exists:', !!composedCanvas);
        console.log('Composed canvas size:', composedCanvas ? `${composedCanvas.width}x${composedCanvas.height}` : 'none');
        // Always apply the texture to show the composed result (base + paint)
        // This ensures the model shows both the base layer and any painting
        let appliedCount = 0;
        modelScene.traverse((child) => {
            if (child.isMesh && child.material) {
                // Skip test objects and anchor points - they shouldn't have textures applied
                if (child.userData?.type === 'testAnchor' ||
                    child.userData?.type === 'anchorPoint' ||
                    child.name?.startsWith('testAnchor')) {
                    return;
                }
                console.log('Found mesh:', child.name || 'unnamed', 'with material:', child.material);
                if (Array.isArray(child.material)) {
                    // Handle multiple materials
                    child.material.forEach((mat) => {
                        mat.map = texture;
                        mat.needsUpdate = true;
                        // Ensure proper material properties for texture rendering
                        mat.transparent = false;
                        mat.opacity = 1.0;
                        mat.side = THREE.DoubleSide;
                        appliedCount++;
                        console.log('Applied texture to material in array:', mat);
                    });
                }
                else {
                    // Handle single material
                    child.material.map = texture;
                    child.material.needsUpdate = true;
                    // Ensure proper material properties for texture rendering
                    child.material.transparent = false;
                    child.material.opacity = 1.0;
                    child.material.side = THREE.DoubleSide;
                    appliedCount++;
                    console.log('Applied texture to single material:', child.material);
                }
                console.log('Applied texture to mesh:', child.name || 'unnamed');
            }
        });
        console.log(`Applied texture to ${appliedCount} materials`);
        console.log('=== END TEXTURE APPLICATION DEBUG ===');
        // Force a render update
        invalidate();
    }, [texture, modelScene, invalidate]);
    // Mark texture dirty whenever layers/decals are recomposed
    useEffect(() => {
        if (texture) {
            texture.needsUpdate = true;
            invalidate();
            console.log('Texture updated, needsUpdate set to true');
        }
    }, [composedVersion, texture, invalidate]);
    // Listen for embroidery texture updates
    useEffect(() => {
        const handleEmbroideryTextureUpdate = () => {
            if (texture) {
                texture.needsUpdate = true;
                invalidate();
                console.log('Embroidery texture update: needsUpdate set to true');
            }
        };
        window.addEventListener('embroideryTextureUpdate', handleEmbroideryTextureUpdate);
        return () => {
            window.removeEventListener('embroideryTextureUpdate', handleEmbroideryTextureUpdate);
        };
    }, [texture, invalidate]);
    // Clear text hover state when tool changes
    useEffect(() => {
        if (activeTool !== 'selectText') {
            useApp.getState().setHoveredTextId(null);
            document.body.style.cursor = 'default';
        }
    }, [activeTool]);
    // Clear text hover state when text elements change
    useEffect(() => {
        const textElements = useApp.getState().textElements;
        const hoveredTextId = useApp.getState().hoveredTextId;
        // If the hovered text no longer exists, clear the hover state
        if (hoveredTextId && !textElements.find(t => t.id === hoveredTextId)) {
            useApp.getState().setHoveredTextId(null);
            document.body.style.cursor = 'default';
        }
    }, [useApp.getState().textElements]);
    // Force texture recreation when composed canvas changes significantly
    useEffect(() => {
        if (!composedCanvas)
            return;
        console.log('Recreating texture from updated composed canvas');
        console.log('Canvas dimensions:', composedCanvas.width, 'x', composedCanvas.height);
        // Recreate texture to ensure it's up to date
        const tex = new THREE.CanvasTexture(composedCanvas);
        tex.flipY = false;
        tex.anisotropy = 16;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        console.log('New texture created:', tex);
        setTexture(tex);
    }, [composedVersion, composedCanvas]);
    // We now update texture on-demand after drawing to reduce overhead
    // Vector subtool hotkeys when vectorTools is active
    useEffect(() => {
        const onKey = (ev) => {
            console.log('🎹 Keyboard event:', ev.key, 'activeTool:', useApp.getState().activeTool);
            if (!useApp.getState().vectorMode)
                return;
            if (ev.key.toLowerCase() === 'p')
                vectorStore.setState({ tool: 'pen' });
            if (ev.key.toLowerCase() === 'v')
                vectorStore.setState({ tool: 'pathSelection' });
            if (ev.key.toLowerCase() === 'c')
                vectorStore.setState({ tool: 'convertAnchor' });
            if (ev.key.toLowerCase() === 'u')
                vectorStore.setState({ tool: 'curvature' });
            // Handle Delete key for selected anchor points
            if (ev.key === 'Delete' || ev.key === 'Backspace') {
                console.log('🗑️ Delete key pressed, selectedAnchor:', selectedAnchor);
                if (selectedAnchor) {
                    console.log('🗑️ Deleting selected anchor point:', selectedAnchor);
                    const st = vectorStore.getState();
                    if (selectedAnchor.shapeId === 'current' && st.currentPath && st.currentPath.points.length > 1) {
                        // Delete from current path
                        const newPoints = st.currentPath.points.filter((_, index) => index !== selectedAnchor.pointIndex);
                        const updatedPath = { ...st.currentPath, points: newPoints };
                        vectorStore.setState({ currentPath: updatedPath });
                        // Clear the active layer and redraw everything to remove the deleted line
                        const layer = getActiveLayer();
                        if (layer && layer.canvas) {
                            const ctx = layer.canvas.getContext('2d');
                            if (ctx) {
                                // Clear the active layer completely
                                ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
                                // Redraw the base layer content
                                const appState = useApp.getState();
                                const allLayers = appState.layers;
                                const baseLayer = allLayers.find(l => l.id === 'base');
                                if (baseLayer && baseLayer.canvas) {
                                    ctx.drawImage(baseLayer.canvas, 0, 0);
                                }
                                // Redraw all other layers except the current one and base
                                allLayers.forEach(l => {
                                    if (l.id !== layer.id && l.id !== 'base' && l.canvas) {
                                        ctx.globalCompositeOperation = l.lockTransparent ? 'source-atop' : 'source-over';
                                        ctx.drawImage(l.canvas, 0, 0);
                                    }
                                });
                            }
                        }
                        // Auto-select the last anchor point
                        if (newPoints.length > 0) {
                            const lastIndex = newPoints.length - 1;
                            setSelectedAnchor({ shapeId: 'current', pointIndex: lastIndex });
                            console.log('🎯 Auto-selected last anchor point:', lastIndex);
                        }
                        else {
                            setSelectedAnchor(null);
                        }
                    }
                    else if (selectedAnchor.shapeId !== 'current') {
                        // Delete from existing shape
                        const shapesUpd = st.shapes.map(s => {
                            if (s.id !== selectedAnchor.shapeId)
                                return s;
                            if (s.path.points.length <= 1)
                                return null; // Remove entire shape if only one point
                            const newPoints = s.path.points.filter((_, index) => index !== selectedAnchor.pointIndex);
                            const path = { ...s.path, points: newPoints };
                            return { ...s, path, bounds: boundsFromPoints(newPoints) };
                        }).filter((s) => s !== null);
                        vectorStore.setState({ shapes: shapesUpd });
                        // Clear the active layer and redraw everything to remove the deleted line
                        const layer = getActiveLayer();
                        if (layer && layer.canvas) {
                            const ctx = layer.canvas.getContext('2d');
                            if (ctx) {
                                // Clear the active layer completely
                                ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
                                // Redraw the base layer content
                                const appState = useApp.getState();
                                const allLayers = appState.layers;
                                const baseLayer = allLayers.find(l => l.id === 'base');
                                if (baseLayer && baseLayer.canvas) {
                                    ctx.drawImage(baseLayer.canvas, 0, 0);
                                }
                                // Redraw all other layers except the current one and base
                                allLayers.forEach(l => {
                                    if (l.id !== layer.id && l.id !== 'base' && l.canvas) {
                                        ctx.globalCompositeOperation = l.lockTransparent ? 'source-atop' : 'source-over';
                                        ctx.drawImage(l.canvas, 0, 0);
                                    }
                                });
                            }
                        }
                        // Auto-select the last anchor point of the same shape
                        const updatedShape = shapesUpd.find(s => s?.id === selectedAnchor.shapeId);
                        if (updatedShape && updatedShape.path.points.length > 0) {
                            const lastIndex = updatedShape.path.points.length - 1;
                            setSelectedAnchor({ shapeId: selectedAnchor.shapeId, pointIndex: lastIndex });
                            console.log('🎯 Auto-selected last anchor point:', lastIndex);
                        }
                        else {
                            setSelectedAnchor(null);
                        }
                    }
                    renderVectorsToActiveLayer();
                    composeLayers();
                }
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [selectedAnchor, composeLayers]);
    const onPointerDown = async (e) => {
        // Start performance tracking
        performanceMonitor.startRenderTracking('Shirt.onPointerDown');
        // Track user interaction
        performanceMonitor.trackUserInteraction('pointer_down', 'shirt', {
            activeTool,
            vectorMode,
            button: e.button
        });
        // Reduced logging for performance
        if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
            console.log('Shirt: onPointerDown called with activeTool:', activeTool, 'vectorMode:', vectorMode);
        }
        // If we're already dragging something, don't process new pointer down events
        if (draggingAnchor || draggingControl) {
            console.log('🎯 onPointerDown - Already dragging, ignoring new pointer down');
            return;
        }
        if (vectorMode) {
            const uv = e.uv;
            let layer = getOrSelectActiveLayer();
            if (!uv || !layer)
                return;
            const canvas = layer.canvas;
            // Use precise coordinate conversion with validation for consistent accuracy
            const validatedUV = validateAndCorrectCoordinates(uv, canvas);
            const coords = uvToCanvasCoordinates(validatedUV, canvas);
            const x = coords.x;
            const y = coords.y;
            const st = vectorStore.getState();
            const tool = st.tool;
            // Use enhanced vector tools
            const result = enhancedVectorTools.handleMouseDown(e, { x, y }, st.shapes, st.currentPath);
            if (result.success) {
                console.log('🎯 Vector tool result:', result.message);
                // Handle tool-specific actions
                if (result.data) {
                    switch (result.data.action) {
                        case 'startPath':
                            vectorStore.setState({ currentPath: result.data.path });
                            break;
                        case 'addPoint':
                            vectorStore.setState({ currentPath: result.data.path });
                            break;
                        case 'selectShape':
                            vectorStore.setState({ selected: [result.data.shapeId] });
                            break;
                        case 'addAnchor':
                        case 'removeAnchor':
                        case 'convertAnchor':
                            // Update the shape in the store
                            const updatedShapes = st.shapes.map(s => s.id === result.data.shapeId ? result.data.path : s);
                            vectorStore.setState({ shapes: updatedShapes });
                            break;
                        case 'startCurvature':
                            setCurvatureDragging(true);
                            setCurvatureSegment({
                                shapeId: result.data.shapeId,
                                segmentIndex: result.data.segmentIndex,
                                grabPoint: result.data.startPoint
                            });
                            break;
                        case 'showPathOperations':
                            // Show path operations menu
                            console.log('Path operations for shape:', result.data.shapeId);
                            break;
                        case 'startShapeBuilder':
                            // Start shape builder
                            console.log('Starting shape builder at:', result.data.startPoint);
                            break;
                    }
                }
            }
            else {
                console.warn('🎯 Vector tool error:', result.error);
            }
            // prevent camera controls and other handlers
            e.stopPropagation();
            try {
                e.target?.setPointerCapture?.(e.pointerId);
            }
            catch { }
            setControlsEnabled(false);
            // Pen tool
            if (tool === 'pen') {
                console.log('🎯 Pen tool - Current path points:', st.currentPath?.points?.length || 0, 'buttons:', e.buttons);
                // First check if we're already dragging something - if so, don't add new points
                if (draggingAnchor || draggingControl) {
                    console.log('🎯 Pen tool - Already dragging, skipping new point creation');
                    return;
                }
                // Only start drawing if mouse button is pressed
                if (e.buttons === 1) {
                    // Start continuous drawing mode
                    paintingActiveRef.current = true;
                    console.log('🎯 Pen tool - Started continuous drawing mode, paintingActive:', paintingActiveRef.current);
                }
                else {
                    console.log('🎯 Pen tool - Mouse not pressed, skipping drawing');
                    return;
                }
                // Check if clicking on existing anchor points of current path
                if (st.currentPath && st.currentPath.points.length > 0) {
                    const anchorIndex = await hitPoint({ x, y }, { path: { points: st.currentPath.points } });
                    console.log('🎯 Pen tool - Hit anchor point:', anchorIndex, 'at position:', x, y);
                    console.log('🎯 Pen tool - Current path points:', st.currentPath.points.map((p, i) => `[${i}]: (${p.x}, ${p.y})`));
                    if (anchorIndex !== null) {
                        const isCtrlPressed = e.ctrlKey || e.metaKey;
                        if (isCtrlPressed) {
                            // Ctrl+click: Select anchor point
                            console.log('🎯 Pen tool - Selecting anchor point:', anchorIndex);
                            setSelectedAnchor({ shapeId: 'current', pointIndex: anchorIndex });
                            renderVectorsWithAnchors();
                            return;
                        }
                        else if (selectedAnchor && selectedAnchor.shapeId === 'current' && selectedAnchor.pointIndex === anchorIndex) {
                            // Regular click on selected anchor: Start dragging
                            console.log('🎯 Pen tool - Starting drag for selected anchor point:', anchorIndex);
                            setDraggingAnchor({ shapeId: 'current', pointIndex: anchorIndex });
                            paintingActiveRef.current = true;
                            return;
                        }
                        else {
                            // Regular click on different anchor: Select it (clear any previous selection first)
                            console.log('🎯 Pen tool - Selecting different anchor point:', anchorIndex);
                            setSelectedAnchor({ shapeId: 'current', pointIndex: anchorIndex });
                            renderVectorsWithAnchors();
                            return;
                        }
                    }
                    // Check if clicking on control handles of current path
                    const controlHit = hitControlHandle({ x, y }, { path: { points: st.currentPath.points } });
                    if (controlHit) {
                        console.log('🎯 Pen tool - Starting drag for control handle:', controlHit);
                        setDraggingControl({ shapeId: 'current', pointIndex: controlHit.pointIndex, type: controlHit.type });
                        paintingActiveRef.current = true;
                        return;
                    }
                }
                // Only add new points if we're not already dragging something
                if (!draggingAnchor && !draggingControl) {
                    // Validate coordinates before creating/adding to path
                    if (!isFinite(x) || !isFinite(y) || x < 0 || y < 0 || x > canvas.width || y > canvas.height) {
                        console.warn('🎯 Pen tool - Invalid coordinates for path creation:', { x, y, canvasWidth: canvas.width, canvasHeight: canvas.height });
                        return;
                    }
                    // Check if this is a single click (not part of continuous drawing)
                    const isSingleClick = !paintingActiveRef.current;
                    if (isSingleClick) {
                        console.log('🎯 Pen tool - Single click detected, creating anchor point');
                        // Create a single anchor point for this click
                        createSingleAnchorPoint({ x, y });
                        return;
                    }
                    // Apply snapping
                    let snappedPoint = { x, y };
                    if (snapToGridEnabled) {
                        snappedPoint = snapToGrid(snappedPoint, gridSize);
                    }
                    if (snapToPointsEnabled && st.currentPath && st.currentPath.points.length > 0) {
                        snappedPoint = snapToPoint(snappedPoint, st.currentPath.points, snapDistance);
                    }
                    if (!st.currentPath) {
                        // Start a new path with validation
                        const appState = useApp.getState();
                        const newPath = {
                            id: `path_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            points: [{ x: snappedPoint.x, y: snappedPoint.y, type: 'corner' }],
                            closed: false,
                            fill: true,
                            stroke: true,
                            fillColor: appState.brushColor || '#000000',
                            strokeColor: appState.brushColor || '#000000',
                            strokeWidth: Math.max(1, Math.round(appState.brushSize || 5)),
                            fillOpacity: 1.0,
                            strokeOpacity: 1.0,
                            strokeJoin: 'round',
                            strokeCap: 'round'
                        };
                        try {
                            vectorStore.setState({ currentPath: newPath });
                            // Select the first point
                            setSelectedAnchor({ shapeId: 'current', pointIndex: 0 });
                            // Reset debouncing for new path
                            lastPenPointRef.current = { x: snappedPoint.x, y: snappedPoint.y, time: Date.now() };
                            if (process.env.NODE_ENV === 'development') {
                                console.log('🎯 Pen tool - Started new path with first point');
                            }
                            // Force immediate rendering with throttling
                            throttledRender(() => {
                                renderVectorsWithAnchors();
                                // CRITICAL FIX: Real-time stitch rendering for embroidery tools
                                const appState = useApp.getState();
                                if (isEmbroideryTool(appState.activeTool)) {
                                    const layer = getActiveLayer();
                                    if (layer) {
                                        const ctx = layer.canvas.getContext('2d');
                                        if (ctx) {
                                            const stitchType = appState.embroideryStitchType || appState.activeTool;
                                            renderRealTimeEmbroideryStitches(ctx, newPath, appState, stitchType);
                                        }
                                    }
                                }
                            }, 8); // 8ms for 120fps
                        }
                        catch (error) {
                            console.error('🎯 Pen tool - Error creating new path:', error);
                        }
                    }
                    else {
                        // Add point to existing path with validation and auto-smoothing
                        try {
                            let newPoint = { x: snappedPoint.x, y: snappedPoint.y, type: 'corner' };
                            // Apply auto-smoothing if enabled
                            if (autoSmooth && st.currentPath.points.length >= 2) {
                                const prevPoint = st.currentPath.points[st.currentPath.points.length - 1];
                                const prevPrevPoint = st.currentPath.points[st.currentPath.points.length - 2];
                                // Calculate smooth control points
                                const { controlIn, controlOut } = calculateAutoControlPoints(prevPrevPoint, prevPoint, newPoint, smoothTension);
                                // Update the previous point with smooth control
                                const updatedPoints = [...st.currentPath.points];
                                updatedPoints[updatedPoints.length - 1] = {
                                    ...prevPoint,
                                    type: 'smooth',
                                    controlOut
                                };
                                newPoint = {
                                    ...newPoint,
                                    type: 'smooth',
                                    controlIn
                                };
                                const cp = { ...st.currentPath, points: [...updatedPoints, newPoint] };
                                vectorStore.setState({ currentPath: cp });
                            }
                            else {
                                const cp = { ...st.currentPath, points: [...st.currentPath.points, newPoint] };
                                vectorStore.setState({ currentPath: cp });
                            }
                            // Select the new point
                            setSelectedAnchor({ shapeId: 'current', pointIndex: st.currentPath.points.length });
                            console.log('🎯 Pen tool - Added point to existing path, total points:', st.currentPath.points.length + 1);
                            // Force immediate rendering with throttling
                            throttledRender(() => {
                                renderVectorsWithAnchors();
                                // CRITICAL FIX: Real-time stitch rendering for embroidery tools
                                const appState = useApp.getState();
                                if (isEmbroideryTool(appState.activeTool)) {
                                    const layer = getActiveLayer();
                                    if (layer) {
                                        const ctx = layer.canvas.getContext('2d');
                                        if (ctx) {
                                            const stitchType = appState.embroideryStitchType || appState.activeTool;
                                            const updatedPath = { ...st.currentPath, points: [...st.currentPath.points, newPoint] };
                                            renderRealTimeEmbroideryStitches(ctx, updatedPath, appState, stitchType);
                                        }
                                    }
                                }
                            }, 8); // 8ms for 120fps
                        }
                        catch (error) {
                            console.error('🎯 Pen tool - Error adding point to path:', error);
                        }
                    }
                }
                else {
                    // If we're not adding new points, clear any existing selection
                    setSelectedAnchor(null);
                }
                // Clear selection when clicking on empty space (not on anchor points)
                if (st.currentPath && st.currentPath.points.length > 0) {
                    const anchorIndex = await hitPoint({ x, y }, { path: { points: st.currentPath.points } });
                    if (anchorIndex === null) {
                        // Clicked on empty space, clear selection
                        setSelectedAnchor(null);
                    }
                }
                // Only set painting active and render if we're not dragging
                if (!draggingAnchor && !draggingControl) {
                    paintingActiveRef.current = true;
                    renderVectorsWithAnchors();
                }
                return;
            }
            // Curvature tool - grab anywhere on a line and pull to create curve, or drag control handles
            if (st.tool === 'curvature') {
                console.log('🎯 Curvature tool - Looking for line to grab and curve or control handle to drag');
                // First check if we're already dragging something - if so, don't add new points
                if (draggingAnchor || draggingControl) {
                    console.log('🎯 Curvature tool - Already dragging, skipping new point creation');
                    return;
                }
                // Check if clicking on control handles first
                const controlHit = hitControlHandle({ x, y }, { path: { points: st.currentPath?.points || [] } });
                if (controlHit && st.currentPath) {
                    console.log('🎯 Curvature tool - Starting drag for control handle:', controlHit);
                    setDraggingControl({ shapeId: 'current', pointIndex: controlHit.pointIndex, type: controlHit.type });
                    paintingActiveRef.current = true;
                    return;
                }
                // Check existing shapes for control handles
                for (const shape of st.shapes) {
                    const controlHit = hitControlHandle({ x, y }, shape);
                    if (controlHit) {
                        console.log('🎯 Curvature tool - Starting drag for control handle in shape:', shape.id, controlHit);
                        setDraggingControl({ shapeId: shape.id, pointIndex: controlHit.pointIndex, type: controlHit.type });
                        paintingActiveRef.current = true;
                        return;
                    }
                }
                // Look for existing line segments to grab and curve
                let targetPath = null;
                let targetShapeId = null;
                let segmentIndex = -1;
                let grabPoint = { x, y };
                // Check current path first
                if (st.currentPath && st.currentPath.points.length > 1) {
                    segmentIndex = findPathSegment({ x, y }, st.currentPath.points);
                    if (segmentIndex !== -1) {
                        targetPath = st.currentPath;
                        targetShapeId = 'current';
                        console.log('🎯 Curvature tool - Found segment in current path at index:', segmentIndex);
                    }
                }
                // Check existing shapes if no current path segment found
                if (!targetPath) {
                    for (const shape of st.shapes) {
                        if (shape.path.points.length > 1) {
                            segmentIndex = findPathSegment({ x, y }, shape.path.points);
                            if (segmentIndex !== -1) {
                                targetPath = shape.path;
                                targetShapeId = shape.id;
                                console.log('🎯 Curvature tool - Found segment in shape:', shape.id, 'at index:', segmentIndex);
                                break;
                            }
                        }
                    }
                }
                if (targetPath && segmentIndex !== -1) {
                    // Found a line segment to grab and curve
                    console.log('🎯 Curvature tool - Grabbing line segment for curving');
                    // Set up for curve creation on drag
                    setCurvatureDragging(true);
                    setCurvatureStartPoint(grabPoint);
                    setCurvatureCurrentPoint(grabPoint);
                    // Store which segment we're curving
                    setCurvatureSegment({ shapeId: targetShapeId, segmentIndex, grabPoint });
                    paintingActiveRef.current = true;
                    renderVectorsWithAnchors();
                    return;
                }
                // If no line segment found, do nothing - curvature tool only works on existing lines
                console.log('🎯 Curvature tool - No line segment found to curve');
                return;
            }
            // Selection
            if (tool === 'pathSelection' || tool === 'convertAnchor') {
                const isCtrlPressed = e.ctrlKey || e.metaKey;
                const clicked = [...st.shapes].reverse().find(s => x >= s.bounds.x && x <= s.bounds.x + s.bounds.width && y >= s.bounds.y && y <= s.bounds.y + s.bounds.height);
                if (clicked) {
                    vectorStore.setState({ selected: [clicked.id] });
                    // convert anchor toggles point type on click
                    if (tool === 'convertAnchor') {
                        const idx = await hitPoint({ x, y }, clicked);
                        if (idx !== null) {
                            const shapesUpd = st.shapes.map(s => {
                                if (s.id !== clicked.id)
                                    return s;
                                const pts = [...s.path.points];
                                const cur = pts[idx];
                                const nextType = cur.type === 'corner' ? 'smooth' : cur.type === 'smooth' ? 'symmetric' : 'corner';
                                let controlIn = cur.controlIn;
                                let controlOut = cur.controlOut;
                                if (nextType === 'corner') {
                                    controlIn = undefined;
                                    controlOut = undefined;
                                }
                                if (nextType === 'smooth' || nextType === 'symmetric') {
                                    controlIn = controlIn || { x: -20, y: 0 };
                                    controlOut = controlOut || { x: 20, y: 0 };
                                }
                                pts[idx] = { ...cur, type: nextType, controlIn, controlOut };
                                const path = { ...s.path, points: pts };
                                return { ...s, path, bounds: boundsFromPoints(pts) };
                            });
                            vectorStore.setState({ shapes: shapesUpd });
                        }
                        return;
                    }
                    // Check if clicking on control handles first
                    const controlHit = hitControlHandle({ x, y }, clicked);
                    if (controlHit) {
                        setDraggingControl({ shapeId: clicked.id, pointIndex: controlHit.pointIndex, type: controlHit.type });
                        paintingActiveRef.current = true;
                        return;
                    }
                    // Check if clicking on anchor points
                    const idx = await hitPoint({ x, y }, clicked);
                    if (idx !== null) {
                        if (isCtrlPressed) {
                            // Ctrl+click: Start dragging anchor point immediately
                            setDraggingAnchor({ shapeId: clicked.id, pointIndex: idx });
                            paintingActiveRef.current = true;
                            return;
                        }
                        else {
                            // Regular click: Start dragging anchor point
                            setDraggingAnchor({ shapeId: clicked.id, pointIndex: idx });
                            paintingActiveRef.current = true;
                            return;
                        }
                    }
                    // Otherwise drag bounds
                    vectorDragRef.current = { mode: 'bounds', shapeId: clicked.id, startX: x, startY: y, startBounds: { ...clicked.bounds } };
                    renderVectorsWithAnchors();
                }
                else {
                    vectorStore.setState({ selected: [] });
                }
                paintingActiveRef.current = true;
                return;
            }
        }
        if (activeTool === 'undo') {
            useApp.getState().undo();
            return;
        }
        if (activeTool === 'redo') {
            useApp.getState().redo();
            return;
        }
        if (activeTool === 'picker') {
            sampleColor(e);
            return;
        }
        if (activeTool === 'fill') {
            floodAtEvent(e);
            return;
        }
        if (activeTool === 'smudge') {
            startSmudge(e);
            return;
        }
        if (activeTool === 'blur') {
            startBlur(e);
            return;
        }
        if (activeTool === 'embroidery' && !vectorMode) {
            startEmbroidery(e);
            return;
        }
        // selection system removed
        if ((activeTool === 'transform' || activeTool === 'move') && activeDecalId) {
            startTransformDecal(e);
            return;
        }
        // Text dragging
        if ((activeTool === 'transform' || activeTool === 'move' || activeTool === 'moveText') && useApp.getState().activeTextId) {
            startTransformText(e);
            return;
        }
        // Vector/shape tools: line/rect/ellipse/gradient/text
        if (['line', 'rect', 'ellipse', 'gradient', 'text'].includes(activeTool)) {
            console.log('Shape tool activated:', activeTool);
            const uv = e.uv;
            const layer = getActiveLayer();
            if (!uv || !layer) {
                console.log('Missing UV or layer for shape tool');
                return;
            }
            const canvas = layer.canvas;
            const ctx = canvas.getContext('2d');
            const x = Math.floor(uv.x * canvas.width);
            const y = Math.floor(uv.y * canvas.height);
            console.log('Shape tool coordinates:', { x, y, uv: uv.toArray() });
            snapshot();
            if (activeTool === 'text') {
                const defaultTxt = useApp.getState().lastText || '';
                const txt = window.prompt('Text', defaultTxt);
                if (!txt)
                    return;
                useApp.setState({ lastText: txt });
                try {
                    console.log('Adding text element:', txt);
                    // Use the new text element system instead of drawing directly
                    const textUV = { u: uv.x, v: uv.y }; // Use UV coordinates directly without flipping
                    useApp.getState().addTextElement(txt, textUV, getActiveLayer()?.id);
                    // Force a recomposition to update the model
                    setTimeout(() => {
                        console.log('Forcing recomposition after text placement');
                        useApp.getState().composeLayers();
                        setControlsEnabled(true);
                        console.log('Controls re-enabled after text placement');
                    }, 50);
                }
                catch (error) {
                    console.error('Error adding text element:', error);
                    setControlsEnabled(true);
                }
                return;
            }
            // shapes with drag preview
            console.log('Starting shape drag for:', activeTool);
            shapeStartRef.current = { x, y };
            shapeBeforeRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
            setControlsEnabled(false);
            try {
                e.target?.setPointerCapture?.(e.pointerId);
            }
            catch (err) {
                console.log('Pointer capture failed:', err);
            }
            paintingActiveRef.current = true;
            return;
        }
        if (activeTool !== 'brush' && activeTool !== 'eraser' && activeTool !== 'puffPrint')
            return;
        e.stopPropagation();
        snapshot();
        paintAtEvent(e);
        e.target.setPointerCapture(e.pointerId);
        setControlsEnabled(false);
        paintingActiveRef.current = true;
        console.log('Shirt: Set paintingActiveRef to true for tool:', activeTool);
        // End performance tracking
        performanceMonitor.endRenderTracking('Shirt.onPointerDown');
    };
    const onDoubleClick = (e) => {
        if (activeTool !== 'vectorTools')
            return;
        const uv = e.uv;
        const layer = getActiveLayer();
        if (!uv || !layer)
            return;
        const st = vectorStore.getState();
        if (st.tool === 'pen' && st.currentPath && st.currentPath.points.length >= 3) {
            const path = { ...st.currentPath, closed: true };
            const b = boundsFromPoints(path.points);
            const appState = useApp.getState();
            const shape = {
                id: `shape_${Date.now()}`,
                type: 'path',
                path,
                tool: appState.activeTool, // Store the tool used to create this path
                bounds: b
            };
            vectorStore.setAll({ currentPath: null, shapes: [...st.shapes, shape], selected: [shape.id] });
            renderVectorsWithAnchors();
        }
    };
    function handleSelect(e) {
        if (!composedCanvas) {
            selectDecal && selectDecal(null);
            return;
        }
        const uv = e.uv;
        if (!uv)
            return;
        const u = uv.x, v = uv.y;
        const texW = composedCanvas.width;
        const texH = composedCanvas.height;
        // Check text elements first (top-most)
        const { textElements } = useApp.getState();
        for (let i = textElements.length - 1; i >= 0; i--) {
            const textEl = textElements[i];
            const cx = textEl.u, cy = textEl.v;
            // Estimate text bounds based on font size
            const halfW = (textEl.fontSize * textEl.text.length * 0.6) / texW / 2;
            const halfH = textEl.fontSize / texH / 2;
            const dx = u - cx;
            const dy = v - cy;
            if (Math.abs(dx) <= halfW && Math.abs(dy) <= halfH) {
                console.log('Text selected via click:', textEl.text);
                useApp.getState().selectTextElement(textEl.id);
                selectDecal && selectDecal(null);
                return;
            }
        }
        // Only consider items drawn on the model (decals/layers). Ignore lights, grid, gizmos by limiting to UV hits and alpha > 0.
        // Iterate decals top-most first
        for (let i = (decals?.length || 0) - 1; i >= 0; i--) {
            const d = decals[i];
            const cx = d.u, cy = d.v;
            const halfW = (d.width * d.scale) / texW / 2;
            const halfH = (d.height * d.scale) / texH / 2;
            const dx = u - cx;
            const dy = v - cy;
            const cos = Math.cos(-d.rotation), sin = Math.sin(-d.rotation);
            const lx = dx * cos - dy * sin;
            const ly = dx * sin + dy * cos;
            if (Math.abs(lx) <= halfW && Math.abs(ly) <= halfH) {
                selectDecal && selectDecal(d.id);
                useApp.getState().selectTextElement(null);
                setActiveLayerId(d.layerId);
                return;
            }
        }
        // If no decal, pick the topmost painted layer by alpha at UV
        const layers = useApp.getState().layers;
        const x = Math.floor(u * texW), y = Math.floor(v * texH);
        for (let i = layers.length - 1; i >= 0; i--) {
            const layer = layers[i];
            if (!layer.visible)
                continue;
            const ctx = layer.canvas.getContext('2d');
            const a = ctx.getImageData(x, y, 1, 1).data[3];
            if (a > 0) {
                setActiveLayerId(layer.id);
                selectDecal && selectDecal(null);
                useApp.getState().selectTextElement(null);
                return;
            }
        }
        // Nothing hit
        selectDecal && selectDecal(null);
        useApp.getState().selectTextElement(null);
    }
    const onPointerMove = async (e) => {
        // Reduced logging for performance
        if (process.env.NODE_ENV === 'development' && Math.random() < 0.05) {
            console.log('Shirt: onPointerMove called with activeTool:', activeTool, 'vectorMode:', vectorMode, 'paintingActive:', paintingActiveRef.current, 'buttons:', e.buttons);
        }
        if (vectorMode) {
            // Reduced logging for performance
            if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
                console.log('🎯 Vector tools onPointerMove - buttons:', e.buttons, 'draggingAnchor:', draggingAnchor, 'draggingControl:', draggingControl);
            }
            if (!e.buttons)
                return;
            const uv = e.uv;
            const layer = getActiveLayer();
            if (!uv || !layer)
                return;
            const canvas = layer.canvas;
            // Use precise coordinate conversion with validation for consistent accuracy
            const validatedUV = validateAndCorrectCoordinates(uv, canvas);
            const coords = uvToCanvasCoordinates(validatedUV, canvas);
            const x = coords.x;
            const y = coords.y;
            const st = vectorStore.getState();
            // Use enhanced vector tools for mouse move
            const result = enhancedVectorTools.handleMouseMove(e, { x, y }, st.shapes, st.currentPath);
            if (result.success && result.data) {
                switch (result.data.action) {
                    case 'continuePath':
                        // Handle continuous path drawing
                        if (st.currentPath && e.buttons === 1) {
                            const newPoint = {
                                x: result.data.point.x,
                                y: result.data.point.y,
                                type: 'corner',
                                selected: false
                            };
                            const updatedPath = {
                                ...st.currentPath,
                                points: [...st.currentPath.points, newPoint],
                                bounds: {
                                    x: Math.min(st.currentPath.bounds.x, newPoint.x),
                                    y: Math.min(st.currentPath.bounds.y, newPoint.y),
                                    width: Math.max(st.currentPath.bounds.width, newPoint.x - st.currentPath.bounds.x),
                                    height: Math.max(st.currentPath.bounds.height, newPoint.y - st.currentPath.bounds.y)
                                }
                            };
                            vectorStore.setState({ currentPath: updatedPath });
                        }
                        break;
                    case 'updateSelection':
                        // Handle selection box updates
                        console.log('Updating selection box:', result.data.selectionBox);
                        break;
                    case 'adjustCurvature':
                        // Handle curvature adjustments
                        if (curvatureDragging && curvatureSegment) {
                            // Update curvature based on mouse position
                            console.log('Adjusting curvature:', result.data.point);
                        }
                        break;
                    case 'buildShape':
                        // Handle shape building
                        console.log('Building shape:', result.data.point);
                        break;
                }
            }
            // Pen tool continuous drawing with validation and debouncing
            if (st.tool === 'pen' && paintingActiveRef.current && st.currentPath && e.buttons === 1) {
                console.log('🎯 Pen tool - Continuous drawing active, paintingActive:', paintingActiveRef.current, 'currentPath points:', st.currentPath.points.length, 'buttons:', e.buttons);
                // Validate coordinates
                if (!isFinite(x) || !isFinite(y) || x < 0 || y < 0 || x > canvas.width || y > canvas.height) {
                    if (process.env.NODE_ENV === 'development') {
                        console.warn('🎯 Pen tool - Invalid coordinates:', { x, y, canvasWidth: canvas.width, canvasHeight: canvas.height });
                    }
                    return;
                }
                // Debouncing logic
                const now = Date.now();
                const lastPoint = lastPenPointRef.current;
                if (lastPoint) {
                    const distance = Math.sqrt((x - lastPoint.x) ** 2 + (y - lastPoint.y) ** 2);
                    const timeDiff = now - lastPoint.time;
                    // Skip if too close in space or time
                    if (distance < PEN_DEBOUNCE_DISTANCE || timeDiff < PEN_DEBOUNCE_TIME) {
                        return;
                    }
                }
                // Update last point reference
                lastPenPointRef.current = { x, y, time: now };
                if (process.env.NODE_ENV === 'development') {
                    console.log('🎯 Pen tool - Continuous drawing, adding point at:', x, y);
                }
                try {
                    const cp = { ...st.currentPath, points: [...st.currentPath.points, { x, y, type: 'corner' }] };
                    vectorStore.setState({ currentPath: cp });
                    // Select the new point
                    setSelectedAnchor({ shapeId: 'current', pointIndex: cp.points.length - 1 });
                    // Update preview line to show connection to next point
                    if (cp.points.length > 1) {
                        const lastPoint = cp.points[cp.points.length - 2];
                        setPreviewLine({ start: lastPoint, end: { x, y } });
                    }
                    renderVectorsWithAnchors();
                }
                catch (error) {
                    console.error('🎯 Pen tool - Error adding point:', error);
                }
                return;
            }
            // Check if we're in curvature drag mode - pulling a line segment to create curve
            if (curvatureDragging && curvatureSegment) {
                console.log('🎯 Curvature tool - Pulling line segment to create curve');
                setCurvatureCurrentPoint({ x, y });
                // Calculate how far we've pulled from the original grab point
                const pullX = x - curvatureSegment.grabPoint.x;
                const pullY = y - curvatureSegment.grabPoint.y;
                const pullDistance = Math.sqrt(pullX * pullX + pullY * pullY);
                // Get the line segment we're curving
                let targetPath = null;
                if (curvatureSegment.shapeId === 'current') {
                    targetPath = st.currentPath;
                }
                else {
                    targetPath = st.shapes.find(s => s.id === curvatureSegment.shapeId)?.path;
                }
                if (!targetPath || targetPath.points.length <= curvatureSegment.segmentIndex + 1) {
                    console.warn('Curvature tool: Target path or segment invalid during move.');
                    return;
                }
                // Modify the existing path segment directly instead of adding new points
                if (pullDistance > 3) {
                    const updatedPoints = [...targetPath.points];
                    const p1 = updatedPoints[curvatureSegment.segmentIndex];
                    const p2 = updatedPoints[curvatureSegment.segmentIndex + 1];
                    // Use the new Bezier curve engine for proper control point calculation
                    const BezierCurveEngine = (await import('../vector/BezierCurveEngine')).default;
                    // Calculate control points with proper validation
                    const controlPoints = BezierCurveEngine.calculateControlPoints(updatedPoints[curvatureSegment.segmentIndex - 1] || null, p1, p2, {
                        maxControlLength: 50,
                        minControlLength: 5,
                        smoothness: 0.8,
                        tension: Math.min(pullDistance / 50, 1.0) // Scale tension based on pull distance
                    });
                    if (controlPoints.isValid) {
                        // Convert both points to smooth type if they aren't already
                        p1.type = 'smooth';
                        p2.type = 'smooth';
                        // Apply validated control points
                        p1.controlOut = {
                            x: controlPoints.controlOut.x - p1.x,
                            y: controlPoints.controlOut.y - p1.y
                        };
                        p2.controlIn = {
                            x: controlPoints.controlIn.x - p2.x,
                            y: controlPoints.controlIn.y - p2.y
                        };
                    }
                    else {
                        console.warn('Invalid control points calculated:', controlPoints.warnings);
                        // Fallback to simple calculation
                        const controlMagnitude = Math.min(pullDistance * 0.5, 25);
                        const controlAngle = Math.atan2(pullY, pullX);
                        p1.controlOut = {
                            x: Math.cos(controlAngle) * controlMagnitude,
                            y: Math.sin(controlAngle) * controlMagnitude
                        };
                        p2.controlIn = {
                            x: -Math.cos(controlAngle) * controlMagnitude,
                            y: -Math.sin(controlAngle) * controlMagnitude
                        };
                    }
                    // Update the path in the store
                    if (curvatureSegment.shapeId === 'current') {
                        const updatedPath = { ...targetPath, points: updatedPoints };
                        vectorStore.setState({ currentPath: updatedPath });
                    }
                    else {
                        const updatedPath = { ...targetPath, points: updatedPoints };
                        const updatedShapes = st.shapes.map(s => s.id === curvatureSegment.shapeId
                            ? { ...s, path: updatedPath, bounds: boundsFromPoints(updatedPoints) }
                            : s);
                        vectorStore.setState({ shapes: updatedShapes });
                    }
                    renderVectorsWithAnchors();
                }
                return;
            }
            // Check if we're dragging anchor points or control handles first
            if (draggingAnchor || draggingControl) {
                console.log('🎯 onPointerMove - Dragging detected, preventing other logic');
                // Handle anchor point dragging
                if (draggingAnchor) {
                    console.log('🎯 Dragging anchor point:', draggingAnchor, 'Position:', x, y);
                    if (draggingAnchor.shapeId === 'current' && st.currentPath) {
                        // Drag current path anchor point
                        const pts = [...st.currentPath.points];
                        pts[draggingAnchor.pointIndex] = { ...pts[draggingAnchor.pointIndex], x, y };
                        const updatedPath = { ...st.currentPath, points: pts };
                        vectorStore.setState({ currentPath: updatedPath });
                        console.log('🎯 Updated current path anchor point');
                    }
                    else {
                        // Drag existing shape anchor point
                        const shapesUpd = st.shapes.map(s => {
                            if (s.id !== draggingAnchor.shapeId)
                                return s;
                            const pts = [...s.path.points];
                            pts[draggingAnchor.pointIndex] = { ...pts[draggingAnchor.pointIndex], x, y };
                            const path = { ...s.path, points: pts };
                            return { ...s, path, bounds: boundsFromPoints(pts) };
                        });
                        vectorStore.setState({ shapes: shapesUpd });
                        console.log('🎯 Updated shape anchor point');
                    }
                    renderVectorsWithAnchors();
                    return;
                }
                // Handle control handle dragging
                if (draggingControl) {
                    console.log('🎯 Dragging control handle:', draggingControl, 'Position:', x, y);
                    if (draggingControl.shapeId === 'current' && st.currentPath) {
                        // Drag current path control handle
                        const pts = [...st.currentPath.points];
                        const point = pts[draggingControl.pointIndex];
                        const dx = x - point.x;
                        const dy = y - point.y;
                        if (draggingControl.type === 'in') {
                            pts[draggingControl.pointIndex] = {
                                ...point,
                                controlIn: { x: dx, y: dy }
                            };
                        }
                        else {
                            pts[draggingControl.pointIndex] = {
                                ...point,
                                controlOut: { x: dx, y: dy }
                            };
                        }
                        const updatedPath = { ...st.currentPath, points: pts };
                        vectorStore.setState({ currentPath: updatedPath });
                    }
                    else {
                        // Drag existing shape control handle
                        const shapesUpd = st.shapes.map(s => {
                            if (s.id !== draggingControl.shapeId)
                                return s;
                            const pts = [...s.path.points];
                            const point = pts[draggingControl.pointIndex];
                            const dx = x - point.x;
                            const dy = y - point.y;
                            if (draggingControl.type === 'in') {
                                pts[draggingControl.pointIndex] = {
                                    ...point,
                                    controlIn: { x: dx, y: dy }
                                };
                            }
                            else {
                                pts[draggingControl.pointIndex] = {
                                    ...point,
                                    controlOut: { x: dx, y: dy }
                                };
                            }
                            const path = { ...s.path, points: pts };
                            return { ...s, path, bounds: boundsFromPoints(pts) };
                        });
                        vectorStore.setState({ shapes: shapesUpd });
                    }
                    // Update visual representation for control handle dragging
                    renderVectorsWithAnchors();
                    return;
                }
            }
            else {
                // Handle regular vector drag operations
                const drag = vectorDragRef.current;
                if (!drag)
                    return;
                if (drag.mode === 'point' && drag.shapeId != null && drag.index != null) {
                    const shapesUpd = st.shapes.map(s => {
                        if (s.id !== drag.shapeId)
                            return s;
                        const pts = [...s.path.points];
                        pts[drag.index] = { ...pts[drag.index], x, y };
                        const path = { ...s.path, points: pts };
                        return { ...s, path, bounds: boundsFromPoints(pts) };
                    });
                    vectorStore.setState({ shapes: shapesUpd });
                    renderVectorsWithAnchors();
                }
                else if (drag.mode === 'bounds' && drag.shapeId && drag.startBounds) {
                    const dx = x - (drag.startX || x);
                    const dy = y - (drag.startY || y);
                    const sb = drag.startBounds;
                    const scaleX = (sb.width + dx) / Math.max(1, sb.width);
                    const scaleY = (sb.height + dy) / Math.max(1, sb.height);
                    const cx = sb.x;
                    const cy = sb.y;
                    const shapesUpd = st.shapes.map(s => {
                        if (s.id !== drag.shapeId)
                            return s;
                        const pts = s.path.points.map(p => ({ ...p, x: cx + (p.x - cx) * scaleX, y: cy + (p.y - cy) * scaleY }));
                        const path = { ...s.path, points: pts };
                        return { ...s, path, bounds: boundsFromPoints(pts) };
                    });
                    vectorStore.setState({ shapes: shapesUpd });
                    renderVectorsWithAnchors();
                }
            }
            return;
        }
        const isShapeDrag = paintingActiveRef.current && shapeStartRef.current && ['line', 'rect', 'ellipse', 'gradient'].includes(activeTool);
        if (!isShapeDrag && !e.buttons)
            return;
        // lasso removed
        // Shape preview path
        if (paintingActiveRef.current && shapeStartRef.current && ['line', 'rect', 'ellipse', 'gradient'].includes(activeTool)) {
            const uv = e.uv;
            const layer = getActiveLayer();
            if (!uv || !layer)
                return;
            const canvas = layer.canvas;
            const ctx = canvas.getContext('2d');
            const sx = shapeStartRef.current.x, sy = shapeStartRef.current.y;
            const x = Math.floor(uv.x * canvas.width);
            const y = Math.floor(uv.y * canvas.height);
            if (shapeBeforeRef.current)
                ctx.putImageData(shapeBeforeRef.current, 0, 0);
            ctx.save();
            if (layer.lockTransparent && activeTool !== 'gradient')
                ctx.globalCompositeOperation = 'source-atop';
            ctx.globalAlpha = brushOpacity;
            const shapeMode = useApp.getState().shapeMode || 'fill';
            const strokeW = useApp.getState().shapeStrokeWidth || Math.max(1, brushSize);
            ctx.strokeStyle = brushColor;
            ctx.fillStyle = brushColor;
            ctx.lineWidth = strokeW;
            if (activeTool === 'line') {
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(x, y);
                if (shapeMode !== 'fill')
                    ctx.stroke();
            }
            else if (activeTool === 'rect') {
                ctx.beginPath();
                ctx.rect(Math.min(sx, x), Math.min(sy, y), Math.abs(x - sx), Math.abs(y - sy));
                if (shapeMode !== 'stroke')
                    ctx.fill();
                if (shapeMode !== 'fill')
                    ctx.stroke();
            }
            else if (activeTool === 'ellipse') {
                ctx.beginPath();
                ctx.ellipse((sx + x) / 2, (sy + y) / 2, Math.abs(x - sx) / 2, Math.abs(y - sy) / 2, 0, 0, Math.PI * 2);
                if (shapeMode !== 'stroke')
                    ctx.fill();
                if (shapeMode !== 'fill')
                    ctx.stroke();
            }
            else if (activeTool === 'gradient') {
                const grd = ctx.createLinearGradient(sx, sy, x, y);
                grd.addColorStop(0, brushColor);
                grd.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grd;
                const rx = Math.min(sx, x), ry = Math.min(sy, y), rw = Math.abs(x - sx), rh = Math.abs(y - sy);
                ctx.fillRect(rx, ry, rw, rh);
            }
            else if (activeTool === 'brush' && shapeMode === 'scale') {
                // Scale tool - draws straight horizontal lines
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.beginPath();
                // Draw horizontal line from start to end
                ctx.moveTo(sx, sy);
                ctx.lineTo(x, sy); // Keep Y coordinate same as start point for horizontal line
                if (shapeMode !== 'fill')
                    ctx.stroke();
            }
            ctx.restore();
            composeLayers();
            if (texture) {
                texture.needsUpdate = true;
                invalidate();
            }
            return;
        }
        if (!paintingActiveRef.current)
            return; // do not paint if drag started outside the mesh
        if (activeTool === 'smudge') {
            moveSmudge(e);
            return;
        }
        if (activeTool === 'blur') {
            moveBlur(e);
            return;
        }
        if (activeTool === 'embroidery' && !vectorMode) {
            moveEmbroidery(e);
            return;
        }
        if ((activeTool === 'transform' || activeTool === 'move') && activeDecalId) {
            moveTransformDecal(e);
            return;
        }
        if ((activeTool === 'transform' || activeTool === 'move' || activeTool === 'moveText') && useApp.getState().activeTextId) {
            moveTransformText(e);
            return;
        }
        if (activeTool !== 'brush' && activeTool !== 'eraser' && activeTool !== 'puffPrint')
            return;
        e.stopPropagation();
        paintAtEvent(e);
    };
    const onPointerOver = (e) => {
        const uv = e.uv;
        if (uv)
            useApp.getState().setLastHitUV({ u: uv.x, v: 1 - uv.y });
        if (vectorMode) {
            document.body.style.cursor = 'crosshair';
        }
    };
    const onPointerUp = () => {
        if (shapeStartRef.current) {
            commit();
            shapeStartRef.current = null;
            shapeBeforeRef.current = null;
        }
        if (vectorMode) {
            vectorDragRef.current = null;
            // Commit current path if we were drawing with pen tool
            const st = vectorStore.getState();
            if (st.tool === 'pen' && st.currentPath && st.currentPath.points.length > 1) {
                console.log('🎯 Pen tool - Committing path with', st.currentPath.points.length, 'points');
                // Add the current path to shapes with tool information
                const appState = useApp.getState();
                const newShape = {
                    id: st.currentPath.id,
                    type: 'path',
                    path: st.currentPath,
                    tool: appState.activeTool, // Store the tool used to create this path
                    stitchType: appState.embroideryStitchType, // Store the stitch type used
                    bounds: {
                        x: Math.min(...st.currentPath.points.map(p => p.x)),
                        y: Math.min(...st.currentPath.points.map(p => p.y)),
                        width: Math.max(...st.currentPath.points.map(p => p.x)) - Math.min(...st.currentPath.points.map(p => p.x)),
                        height: Math.max(...st.currentPath.points.map(p => p.y)) - Math.min(...st.currentPath.points.map(p => p.y))
                    }
                };
                // Save the current path before clearing it
                const committedPath = st.currentPath;
                vectorStore.setState({ shapes: [...st.shapes, newShape] });
                vectorStore.setState({ currentPath: null });
                setSelectedAnchor(null);
                setPreviewLine(null); // Clear preview line
                // CRITICAL: If this was an embroidery tool, immediately render the stitch
                if (appState && (appState.activeTool === 'embroidery' || appState.activeTool === 'cross-stitch' ||
                    appState.activeTool === 'satin' || appState.activeTool === 'chain' || appState.activeTool === 'fill')) {
                    console.log(`🧵 Immediately rendering ${appState.activeTool} stitch for committed path`);
                    // Check if committedPath exists before accessing it
                    if (!committedPath || !committedPath.points) {
                        console.warn('⚠️ committedPath is null or has no points, cannot render stitch');
                        return;
                    }
                    // Convert the path to stitch points
                    const stitchPoints = committedPath.points.map((point) => ({
                        x: point.x,
                        y: point.y,
                        u: point.x / (appState.composedCanvas?.width || 2048),
                        v: point.y / (appState.composedCanvas?.height || 2048)
                    }));
                    // Create stitch configuration
                    const stitchType = (appState.activeTool === 'cross-stitch' || appState.activeTool === 'satin' ||
                        appState.activeTool === 'chain' || appState.activeTool === 'fill')
                        ? appState.activeTool
                        : (appState.embroideryStitchType || 'satin');
                    const stitchConfig = {
                        type: stitchType,
                        color: appState.embroideryColor || '#ff69b4',
                        thickness: appState.embroideryThickness || 3,
                        opacity: appState.embroideryOpacity || 1.0
                    };
                    // Render the stitch immediately
                    const layer = getActiveLayer();
                    if (layer) {
                        const ctx = layer.canvas.getContext('2d');
                        if (ctx) {
                            try {
                                renderStitchType(ctx, stitchPoints, stitchConfig);
                                console.log(`✅ Successfully rendered ${stitchType} stitch`);
                            }
                            catch (error) {
                                console.error('Error rendering immediate stitch:', error);
                            }
                        }
                    }
                }
                console.log('✅ Path committed to shapes, total shapes:', st.shapes.length + 1);
            }
            paintingActiveRef.current = false;
            // Stop curvature dragging
            if (curvatureDragging) {
                console.log('🎯 Curvature tool - Ending curve creation');
                setCurvatureDragging(false);
                setCurvatureStartPoint(null);
                setCurvatureCurrentPoint(null);
                setCurvatureSegment(null);
            }
            // Stop dragging anchor points and control handles
            setDraggingAnchor(null);
            setDraggingControl(null);
            // Keep the selected anchor point after dragging
            // (don't clear selectedAnchor here)
            renderVectorsWithAnchors();
            setControlsEnabled(true);
            return;
        }
        // Check if Alt key is pressed for straight line drawing
        const isAltPressed = altKeyPressedRef.current || false;
        if (isAltPressed && altStartX >= 0 && altStartY >= 0 && altEndX >= 0 && altEndY >= 0) {
            // Draw the final straight line from start to end point
            const layer = getActiveLayer();
            if (layer) {
                const canvas = layer.canvas;
                const ctx = canvas.getContext('2d');
                const endX = altEndX;
                const endY = altEndY;
                ctx.save();
                ctx.strokeStyle = brushColor;
                ctx.lineWidth = Math.max(2, brushSize);
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.globalAlpha = brushOpacity;
                ctx.globalCompositeOperation = activeTool === 'eraser' ? 'destination-out' : (getActiveLayer()?.lockTransparent ? 'source-atop' : blendMode);
                ctx.beginPath();
                ctx.moveTo(altStartX, altStartY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
                ctx.restore();
                // Force texture update to show the line immediately
                composeLayers();
            }
        }
        // lasso removed
        if (activeTool === 'brush' || activeTool === 'eraser' || activeTool === 'puffPrint' || activeTool === 'smudge' || activeTool === 'blur' || (activeTool === 'embroidery' && !vectorMode) || activeTool === 'transform' || activeTool === 'move')
            commit();
        // Reset lastX and lastY for straight line drawing
        lastX = -1;
        lastY = -1;
        // Reset Alt start and end points
        altStartX = -1;
        altStartY = -1;
        altEndX = -1;
        altEndY = -1;
        // Dispatch embroidery end event
        if (activeTool === 'embroidery' && !vectorMode) {
            const embroideryEndEvent = new CustomEvent('embroideryEnd');
            window.dispatchEvent(embroideryEndEvent);
        }
        setControlsEnabled(true);
        paintingActiveRef.current = false;
        // Clear text selection if clicking outside
        if (!shapeStartRef.current && !paintingActiveRef.current) {
            useApp.getState().selectTextElement(null);
        }
    };
    const onPointerLeave = () => {
        paintingActiveRef.current = false;
        setControlsEnabled(true);
        document.body.style.cursor = 'default';
    };
    let lastX = -1, lastY = -1;
    const altKeyPressedRef = useRef(false);
    let altStartX = -1, altStartY = -1; // Store the initial Alt+click point
    let altEndX = -1, altEndY = -1; // Store the final Alt+drag point
    // Track Alt key state globally
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Alt' || e.altKey) {
                altKeyPressedRef.current = true;
            }
        };
        const handleKeyUp = (e) => {
            if (e.key === 'Alt' || !e.altKey) {
                altKeyPressedRef.current = false;
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, []);
    // Calculate path bounds for vector shapes
    const calculatePathBounds = (path) => {
        if (path.points.length === 0) {
            return { x: 0, y: 0, width: 0, height: 0 };
        }
        let minX = path.points[0].x;
        let maxX = path.points[0].x;
        let minY = path.points[0].y;
        let maxY = path.points[0].y;
        path.points.forEach((point) => {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
        });
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    };
    // Handle vector erasing
    const handleVectorErase = (uv, e) => {
        // Import vectorStore dynamically to avoid circular dependencies
        import('../vector/vectorState').then(({ vectorStore }) => {
            const state = vectorStore.getState();
            const shapes = state.shapes;
            const brushSize = useApp.getState().brushSize;
            // Convert UV coordinates to canvas coordinates
            const canvasX = uv.x * (composedCanvas?.width || 800);
            const canvasY = uv.y * (composedCanvas?.height || 600);
            const eraserRadius = brushSize / 2;
            // Check if eraser intersects with any vector shapes
            const shapesToRemove = [];
            const shapesToModify = [];
            shapes.forEach(shape => {
                // Check if eraser circle intersects with shape bounds
                const bounds = shape.bounds;
                // Simple bounds intersection check
                const boundsIntersects = !(canvasX + eraserRadius < bounds.x ||
                    canvasX - eraserRadius > bounds.x + bounds.width ||
                    canvasY + eraserRadius < bounds.y ||
                    canvasY - eraserRadius > bounds.y + bounds.height);
                if (boundsIntersects) {
                    const points = shape.path.points;
                    const newPoints = [];
                    let hasIntersectingPoints = false;
                    // Check each point and its control handles
                    for (let i = 0; i < points.length; i++) {
                        const point = points[i];
                        const dx = canvasX - point.x;
                        const dy = canvasY - point.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        // Check if point or its control handles intersect with eraser
                        let pointIntersects = distance <= eraserRadius;
                        // Check control handles
                        if (point.controlIn) {
                            const cpx = point.x + point.controlIn.x;
                            const cpy = point.y + point.controlIn.y;
                            const cdx = canvasX - cpx;
                            const cdy = canvasY - cpy;
                            const cDistance = Math.sqrt(cdx * cdx + cdy * cdy);
                            if (cDistance <= eraserRadius)
                                pointIntersects = true;
                        }
                        if (point.controlOut) {
                            const cpx = point.x + point.controlOut.x;
                            const cpy = point.y + point.controlOut.y;
                            const cdx = canvasX - cpx;
                            const cdy = canvasY - cpy;
                            const cDistance = Math.sqrt(cdx * cdx + cdy * cdy);
                            if (cDistance <= eraserRadius)
                                pointIntersects = true;
                        }
                        if (!pointIntersects) {
                            newPoints.push(point);
                        }
                        else {
                            hasIntersectingPoints = true;
                        }
                    }
                    if (newPoints.length < 3) {
                        // If less than 3 points remain, remove the entire shape
                        shapesToRemove.push(shape.id);
                    }
                    else if (hasIntersectingPoints) {
                        // Modify the shape by removing intersecting points
                        const newPath = { ...shape.path, points: newPoints };
                        shapesToModify.push({ id: shape.id, newPath });
                    }
                }
            });
            // Update the vector store
            if (shapesToRemove.length > 0 || shapesToModify.length > 0) {
                let updatedShapes = shapes.filter(shape => !shapesToRemove.includes(shape.id));
                // Update modified shapes
                updatedShapes = updatedShapes.map(shape => {
                    const modified = shapesToModify.find(m => m.id === shape.id);
                    if (modified) {
                        const newBounds = calculatePathBounds(modified.newPath);
                        return { ...shape, path: modified.newPath, bounds: newBounds };
                    }
                    return shape;
                });
                vectorStore.setState({ shapes: updatedShapes });
                // Also update selected shapes if any were removed
                const currentSelected = vectorStore.getState().selected;
                const updatedSelected = currentSelected.filter(id => !shapesToRemove.includes(id));
                if (updatedSelected.length !== currentSelected.length) {
                    vectorStore.setState({ selected: updatedSelected });
                }
                console.log('Vector erasing completed:', {
                    removedShapes: shapesToRemove.length,
                    modifiedShapes: shapesToModify.length,
                    totalShapes: updatedShapes.length
                });
            }
        });
    };
    const paintAtEvent = (e) => {
        console.log('Shirt: paintAtEvent called with activeTool:', activeTool);
        const uv = e.uv;
        const layer = getActiveLayer();
        if (!uv || !layer) {
            console.log('Shirt: paintAtEvent - missing UV or layer');
            return;
        }
        // Check if Alt key is pressed for straight line drawing
        const isAltPressed = altKeyPressedRef.current || e.altKey || e.originalEvent?.altKey || e.nativeEvent?.altKey || false;
        // Handle straight line drawing when Alt is pressed
        if (isAltPressed && (activeTool === 'brush' || activeTool === 'eraser' || activeTool === 'puffPrint' || (activeTool === 'embroidery' && !vectorMode))) {
            const canvas = layer.canvas;
            const ctx = canvas.getContext('2d');
            const x = Math.floor(uv.x * canvas.width);
            const y = Math.floor(uv.y * canvas.height);
            if (altStartX < 0) {
                // First Alt+click - store the starting point and draw a dot
                altStartX = x;
                altStartY = y;
                ctx.save();
                ctx.fillStyle = brushColor;
                ctx.globalAlpha = brushOpacity;
                ctx.globalCompositeOperation = activeTool === 'eraser' ? 'destination-out' : (getActiveLayer()?.lockTransparent ? 'source-atop' : blendMode);
                ctx.beginPath();
                ctx.arc(x, y, Math.max(3, brushSize / 2), 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            else {
                // Store the current end point during drag
                altEndX = x;
                altEndY = y;
            }
            // Don't draw the line during move - only store the end point for onPointerUp
            return;
        }
        // Handle puff print painting
        if (activeTool === 'puffPrint') {
            console.log('Dispatching puff paint event:', { u: uv.x, v: 1 - uv.y });
            // Dispatch custom event for puff print painting
            const puffPaintEvent = new CustomEvent('puffPaint', {
                detail: {
                    uv: { u: uv.x, v: 1 - uv.y },
                    pressure: e.pressure ?? 1
                }
            });
            document.dispatchEvent(puffPaintEvent);
            return;
        }
        // Handle puff print erasing - always dispatch for eraser tool
        if (activeTool === 'eraser') {
            console.log('Shirt: Dispatching puff erase event:', { u: uv.x, v: 1 - uv.y, pressure: e.pressure ?? 1 });
            // Dispatch custom event for puff print erasing
            const puffEraseEvent = new CustomEvent('puffErase', {
                detail: {
                    uv: { u: uv.x, v: 1 - uv.y },
                    pressure: e.pressure ?? 1
                }
            });
            document.dispatchEvent(puffEraseEvent);
            console.log('Shirt: Puff erase event dispatched');
            // Handle vector erasing
            handleVectorErase(uv, e);
            // Don't return here - let it also handle regular erasing for non-puff areas
        }
        const canvas = layer.canvas;
        const ctx = canvas.getContext('2d');
        const pressure = e.pressure ?? 1;
        const size = Math.max(1, Math.round(brushSize * (usePressureSize ? (0.2 + 0.8 * pressure) : 1)));
        const alpha = brushOpacity * (usePressureOpacity ? (0.2 + 0.8 * pressure) : 1);
        const x = Math.floor(uv.x * canvas.width);
        const y = Math.floor(uv.y * canvas.height);
        ctx.globalCompositeOperation = activeTool === 'eraser' ? 'destination-out' : (getActiveLayer()?.lockTransparent ? 'source-atop' : blendMode);
        ctx.globalAlpha = alpha * brushFlow;
        ctx.fillStyle = brushColor;
        const spacingPx = Math.max(1, Math.round(size * brushSpacing));
        const drawStamp = (px, py, angleRad) => {
            if (brushShape === 'square') {
                ctx.fillRect(px - size / 2, py - size / 2, size, size);
            }
            else if (brushShape === 'airbrush') {
                const radius = size / 2;
                const grd = ctx.createRadialGradient(px, py, 0, px, py, radius);
                grd.addColorStop(0, withAlpha(brushColor, brushHardness));
                grd.addColorStop(1, withAlpha(brushColor, 0));
                const prev = ctx.globalCompositeOperation;
                ctx.globalCompositeOperation = 'source-over';
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.arc(px, py, radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalCompositeOperation = prev;
            }
            else if (brushShape === 'calligraphy') {
                const a = angleRad ?? 0;
                ctx.save();
                ctx.translate(px, py);
                ctx.rotate(a);
                ctx.beginPath();
                ctx.ellipse(0, 0, size * 0.7, size * 0.3, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            else {
                ctx.beginPath();
                ctx.arc(px, py, size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        };
        if (lastX < 0) {
            drawStamp(x, y);
            lastX = x;
            lastY = y;
        }
        else {
            const dx = x - lastX;
            const dy = y - lastY;
            const dist = Math.hypot(dx, dy);
            const angle = Math.atan2(dy, dx);
            setCursorAngle(angle);
            if (dist >= spacingPx) {
                const steps = Math.ceil(dist / spacingPx);
                for (let i = 1; i <= steps; i++) {
                    const t = i / steps;
                    const px = Math.round(lastX + dx * t);
                    const py = Math.round(lastY + dy * t);
                    drawStamp(px, py, angle);
                }
                lastX = x;
                lastY = y;
            }
        }
        // World-plane symmetry using mirrored raycasts only
        const applyMirrored = (normal) => {
            if (!meshRef.current)
                return;
            const ray = new THREE.Ray(e.ray.origin.clone(), e.ray.direction.clone());
            const origin = new THREE.Vector3(0, 0, 0);
            const n = normal.clone().normalize();
            // Mirror origin and direction across plane (origin, n)
            const toOrigin = ray.origin.clone().sub(origin);
            const mirroredOrigin = ray.origin.clone().sub(n.clone().multiplyScalar(2 * toOrigin.dot(n)));
            const d = ray.direction.clone();
            const mirroredDir = d.sub(n.clone().multiplyScalar(2 * d.dot(n))).normalize();
            raycasterRef.current.ray.origin.copy(mirroredOrigin);
            raycasterRef.current.ray.direction.copy(mirroredDir);
            const hits = raycasterRef.current.intersectObject(meshRef.current, false);
            if (hits.length && hits[0].uv) {
                const muv = hits[0].uv;
                const mx = Math.floor(muv.x * canvas.width);
                const my = Math.floor(muv.y * canvas.height);
                drawStamp(mx, my);
            }
        };
        if (useApp.getState().symmetryX)
            applyMirrored(new THREE.Vector3(1, 0, 0));
        if (symmetryY)
            applyMirrored(new THREE.Vector3(0, 1, 0));
        if (useApp.getState().symmetryZ)
            applyMirrored(new THREE.Vector3(0, 0, 1));
        composeLayers();
        if (texture) {
            texture.needsUpdate = true;
            invalidate();
        }
    };
    // Smudge tool: simple neighborhood average move
    function startSmudge(e) {
        paintingActiveRef.current = true;
        snapshot();
        moveSmudge(e);
    }
    function moveSmudge(e) {
        const uv = e.uv;
        const layer = getActiveLayer();
        if (!uv || !layer)
            return;
        const canvas = layer.canvas;
        const ctx = canvas.getContext('2d');
        const x = Math.floor(uv.x * canvas.width);
        const y = Math.floor(uv.y * canvas.height);
        const r = Math.max(2, Math.round(brushSize / 2));
        const img = ctx.getImageData(x - r, y - r, r * 2, r * 2);
        const d = img.data;
        let ar = 0, ag = 0, ab = 0, aa = 0, n = 0;
        for (let i = 0; i < d.length; i += 4) {
            ar += d[i];
            ag += d[i + 1];
            ab += d[i + 2];
            aa += d[i + 3];
            n++;
        }
        const mr = ar / n, mg = ag / n, mb = ab / n, ma = aa / n;
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = `rgba(${mr},${mg},${mb},${ma / 255})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        composeLayers();
        if (texture) {
            texture.needsUpdate = true;
            invalidate();
        }
    }
    // Blur tool: stack blur small kernel
    function startBlur(e) { paintingActiveRef.current = true; snapshot(); moveBlur(e); }
    function moveBlur(e) {
        const uv = e.uv;
        const layer = getActiveLayer();
        if (!uv || !layer)
            return;
        const canvas = layer.canvas;
        const ctx = canvas.getContext('2d');
        const x = Math.floor(uv.x * canvas.width);
        const y = Math.floor(uv.y * canvas.height);
        const r = Math.max(2, Math.round(brushSize / 2));
        const w = r * 2, h = r * 2;
        const img = ctx.getImageData(x - r, y - r, w, h);
        const d = img.data;
        const kernel = [1, 2, 1, 2, 4, 2, 1, 2, 1];
        const out = new Uint8ClampedArray(d.length);
        for (let yy = 1; yy < h - 1; yy++) {
            for (let xx = 1; xx < w - 1; xx++) {
                let sr = 0, sg = 0, sb = 0, sa = 0, si = 0;
                let ki = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const i = ((yy + ky) * w + (xx + kx)) * 4;
                        const k = kernel[ki++];
                        sr += d[i] * k;
                        sg += d[i + 1] * k;
                        sb += d[i + 2] * k;
                        sa += d[i + 3] * k;
                        si += k;
                    }
                }
                const oi = (yy * w + xx) * 4;
                out[oi] = sr / si;
                out[oi + 1] = sg / si;
                out[oi + 2] = sb / si;
                out[oi + 3] = sa / si;
            }
        }
        for (let i = 0; i < d.length; i++)
            d[i] = out[i] || d[i];
        ctx.putImageData(img, x - r, y - r);
        composeLayers();
        if (texture) {
            texture.needsUpdate = true;
            invalidate();
        }
    }
    // Transform Decal: drag to move, shift drag to scale, alt drag to rotate
    function startTransformDecal(e) { paintingActiveRef.current = true; snapshot(); moveTransformDecal(e); }
    function moveTransformDecal(e) {
        if (!activeDecalId)
            return;
        const uv = e.uv;
        if (!uv)
            return;
        const d = decals.find((x) => x.id === activeDecalId);
        if (!d)
            return;
        const isShift = e.shiftKey;
        const isAlt = e.altKey;
        if (isAlt) {
            const angle = Math.atan2(e.movementY || 0, e.movementX || 1);
            updateDecal(activeDecalId, { rotation: d.rotation + angle });
        }
        else if (isShift) {
            const delta = (e.movementX || 0) * 0.005;
            updateDecal(activeDecalId, { scale: Math.max(0.05, d.scale + delta) });
        }
        else {
            updateDecal(activeDecalId, { u: uv.x, v: 1 - uv.y });
        }
        composeLayers();
        if (texture) {
            texture.needsUpdate = true;
            invalidate();
        }
    }
    // Transform Text: drag to move, shift drag to scale font size, alt drag to rotate
    function startTransformText(e) { paintingActiveRef.current = true; snapshot(); moveTransformText(e); }
    function moveTransformText(e) {
        const activeTextId = useApp.getState().activeTextId;
        if (!activeTextId)
            return;
        const uv = e.uv;
        if (!uv)
            return;
        const { textElements } = useApp.getState();
        const textEl = textElements.find((x) => x.id === activeTextId);
        if (!textEl)
            return;
        const isShift = e.shiftKey;
        const isAlt = e.altKey;
        if (isAlt) {
            const angle = Math.atan2(e.movementY || 0, e.movementX || 1);
            useApp.getState().updateTextElement(activeTextId, { rotation: textEl.rotation + angle });
        }
        else if (isShift) {
            const delta = (e.movementX || 0) * 2;
            const newSize = Math.max(8, Math.min(256, textEl.fontSize + delta));
            useApp.getState().updateTextElement(activeTextId, { fontSize: newSize });
        }
        else {
            useApp.getState().updateTextElement(activeTextId, { u: uv.x, v: 1 - uv.y });
        }
        composeLayers();
        if (texture) {
            texture.needsUpdate = true;
            invalidate();
        }
    }
    function withAlpha(hex, a) {
        const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!m)
            return `rgba(255,255,255,${a})`;
        const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16);
        return `rgba(${r},${g},${b},${a})`;
    }
    // Lasso selection writes to selectionMask
    // lasso and wand removed per request
    const sampleColor = (e) => {
        const uv = e.uv;
        if (!uv || !composedCanvas)
            return;
        const canvas = composedCanvas;
        const ctx = canvas.getContext('2d');
        const x = Math.floor(uv.x * canvas.width);
        const y = Math.floor(uv.y * canvas.height);
        const data = ctx.getImageData(x, y, 1, 1).data;
        // Ensure valid RGB values and create proper hex color
        const r = Math.max(0, Math.min(255, Math.round(data[0])));
        const g = Math.max(0, Math.min(255, Math.round(data[1])));
        const b = Math.max(0, Math.min(255, Math.round(data[2])));
        // Create hex color with proper padding
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        // Validate the hex color before setting it
        if (hex.length === 7 && /^#[0-9a-f]{6}$/i.test(hex)) {
            setState({ brushColor: hex, activeTool: 'brush' });
        }
        else {
            console.warn('Invalid color sampled from canvas:', hex);
            setState({ brushColor: '#ff69b4', activeTool: 'brush' });
        }
    };
    const floodAtEvent = (e) => {
        const uv = e.uv;
        const layer = getActiveLayer();
        if (!uv || !layer)
            return;
        const canvas = layer.canvas;
        const ctx = canvas.getContext('2d');
        const x = Math.floor(uv.x * canvas.width);
        const y = Math.floor(uv.y * canvas.height);
        snapshot();
        floodFill(ctx, x, y, brushColor, 24);
        composeLayers();
        if (texture) {
            texture.needsUpdate = true;
            invalidate();
        }
        commit();
    };
    function floodFill(ctx, sx, sy, fillStyle, tol) {
        const { width, height } = ctx.canvas;
        const img = ctx.getImageData(0, 0, width, height);
        const data = img.data;
        const idx = (x, y) => (y * width + x) * 4;
        const start = idx(sx, sy);
        const sr = data[start], sg = data[start + 1], sb = data[start + 2], sa = data[start + 3];
        const stack = [sx, sy];
        const visited = new Uint8Array(width * height);
        const [fr, fg, fb, fa] = hexToRgba(fillStyle, Math.round(brushOpacity * 255));
        while (stack.length) {
            const y = stack.pop();
            const x = stack.pop();
            if (x < 0 || y < 0 || x >= width || y >= height)
                continue;
            const i = idx(x, y);
            if (visited[(y * width + x)])
                continue;
            visited[(y * width + x)] = 1;
            const dr = data[i] - sr;
            const dg = data[i + 1] - sg;
            const db = data[i + 2] - sb;
            const da = data[i + 3] - sa;
            if (Math.abs(dr) + Math.abs(dg) + Math.abs(db) + Math.abs(da) > tol)
                continue;
            data[i] = fr;
            data[i + 1] = fg;
            data[i + 2] = fb;
            data[i + 3] = fa;
            stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
        }
        ctx.putImageData(img, 0, 0);
    }
    function hexToRgba(hex, alpha) {
        const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16), alpha];
    }
    // ===== Vector helper functions (3D editing) =====
    function adjustBrightness(color, amount) {
        // Validate input
        if (!color || typeof color !== 'string') {
            console.warn('Invalid color input in Shirt.tsx adjustBrightness:', color);
            return '#ff69b4'; // Default fallback
        }
        // Ensure color starts with #
        const cleanColor = color.startsWith('#') ? color : `#${color}`;
        // Validate hex format (must be 6 characters after #)
        if (cleanColor.length !== 7) {
            console.warn('Invalid hex color format in Shirt.tsx adjustBrightness:', cleanColor);
            return '#ff69b4'; // Default fallback
        }
        // Convert hex to RGB
        const hex = cleanColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        // Validate parsed values
        if (isNaN(r) || isNaN(g) || isNaN(b)) {
            console.warn('Failed to parse hex color in Shirt.tsx adjustBrightness:', cleanColor);
            return '#ff69b4'; // Default fallback
        }
        // CRITICAL FIX: Round all RGB values to integers before hex conversion
        const newR = Math.round(Math.max(0, Math.min(255, r + amount)));
        const newG = Math.round(Math.max(0, Math.min(255, g + amount)));
        const newB = Math.round(Math.max(0, Math.min(255, b + amount)));
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
    function drawBezier2D(ctx, points) {
        if (points.length < 2)
            return;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            const current = points[i];
            const previous = points[i - 1];
            if (current.controlIn || previous.controlOut) {
                const cp1x = previous.controlOut ? previous.x + previous.controlOut.x : previous.x;
                const cp1y = previous.controlOut ? previous.y + previous.controlOut.y : previous.y;
                const cp2x = current.controlIn ? current.x + current.controlIn.x : current.x;
                const cp2y = current.controlIn ? current.y + current.controlIn.y : current.y;
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, current.x, current.y);
            }
            else {
                ctx.lineTo(current.x, current.y);
            }
        }
    }
    // Advanced Bezier curve drawing with multiple curve types
    function drawAdvancedBezier2D(ctx, points) {
        if (points.length < 2)
            return;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const next = points[i + 1];
            // Handle different point types
            switch (curr.type) {
                case 'smooth':
                    if (curr.controlIn && curr.controlOut) {
                        // Smooth point with both control handles
                        ctx.bezierCurveTo(prev.controlOut?.x || prev.x, prev.controlOut?.y || prev.y, curr.controlIn.x, curr.controlIn.y, curr.x, curr.y);
                    }
                    else {
                        // Auto-calculate smooth control points
                        const { controlIn, controlOut } = calculateAutoControlPoints(i > 1 ? points[i - 2] : null, prev, next, 0.5);
                        ctx.bezierCurveTo(controlOut.x, controlOut.y, controlIn.x, controlIn.y, curr.x, curr.y);
                    }
                    break;
                case 'symmetric':
                    if (curr.controlIn && curr.controlOut) {
                        // Symmetric point
                        ctx.bezierCurveTo(prev.controlOut?.x || prev.x, prev.controlOut?.y || prev.y, curr.controlIn.x, curr.controlIn.y, curr.x, curr.y);
                    }
                    break;
                case 'corner':
                default:
                    if (curr.controlOut) {
                        // Quadratic curve
                        ctx.quadraticCurveTo(curr.controlOut.x, curr.controlOut.y, curr.x, curr.y);
                    }
                    else {
                        // Straight line
                        ctx.lineTo(curr.x, curr.y);
                    }
                    break;
            }
        }
    }
    function drawSelectionIndicators(ctx, points, shapeId) {
        console.log(`🎯 drawSelectionIndicators called with ${points.length} points for shape ${shapeId}`);
        ctx.save();
        ctx.globalAlpha = 1.0;
        // Draw anchor points
        points.forEach((point, index) => {
            const isSelected = selectedAnchor &&
                selectedAnchor.shapeId === shapeId &&
                selectedAnchor.pointIndex === index;
            if (isSelected) {
                // Selected anchor point - larger, red color with precise center
                ctx.fillStyle = '#FF3B30'; // Red for selected
                ctx.strokeStyle = '#FFFFFF'; // White border
                ctx.lineWidth = 2;
                const size = 14;
                // Draw main square
                ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
                ctx.strokeRect(point.x - size / 2, point.y - size / 2, size, size);
                // Draw precise center cross
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(point.x - 3, point.y);
                ctx.lineTo(point.x + 3, point.y);
                ctx.moveTo(point.x, point.y - 3);
                ctx.lineTo(point.x, point.y + 3);
                ctx.stroke();
            }
            else {
                // Regular anchor point - blue square with better visibility
                ctx.fillStyle = '#0078FF'; // Blue color like Photoshop
                ctx.strokeStyle = '#FFFFFF'; // White border
                ctx.lineWidth = 2; // Thicker border for better visibility
                const size = 10; // Slightly larger for better visibility
                ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
                ctx.strokeRect(point.x - size / 2, point.y - size / 2, size, size);
                // Add precise center dot for better accuracy
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(point.x, point.y, 1.5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
            }
            // Draw control handles for smooth/symmetric points
            if (point.controlIn) {
                // Control in handle
                ctx.strokeStyle = '#00FF00'; // Green for control in
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(point.x, point.y);
                ctx.lineTo(point.x + point.controlIn.x, point.y + point.controlIn.y);
                ctx.stroke();
                // Control in handle point
                ctx.fillStyle = '#00FF00';
                ctx.beginPath();
                ctx.arc(point.x + point.controlIn.x, point.y + point.controlIn.y, 4, 0, 2 * Math.PI);
                ctx.fill();
            }
            if (point.controlOut) {
                // Control out handle
                ctx.strokeStyle = '#FF0000'; // Red for control out
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(point.x, point.y);
                ctx.lineTo(point.x + point.controlOut.x, point.y + point.controlOut.y);
                ctx.stroke();
                // Control out handle point
                ctx.fillStyle = '#FF0000';
                ctx.beginPath();
                ctx.arc(point.x + point.controlOut.x, point.y + point.controlOut.y, 4, 0, 2 * Math.PI);
                ctx.fill();
            }
        });
        ctx.restore();
    }
    function renderVectorPathWithTool(ctx, path, tool, appState) {
        ctx.save();
        // Use the tool parameter passed to the function, not the appState.activeTool
        // This allows vector tools to render with the correct tool effects
        const currentTool = tool || appState.activeTool;
        console.log(`🎨 renderVectorPathWithTool: tool=${tool}, currentTool=${currentTool}, activeTool=${appState.activeTool}`);
        // Convert vector path points to UV coordinates for tool rendering
        const canvas = ctx.canvas;
        const points = path.points.map((p) => {
            // Validate input coordinates
            const x = typeof p.x === 'number' && isFinite(p.x) ? p.x : 0;
            const y = typeof p.y === 'number' && isFinite(p.y) ? p.y : 0;
            return {
                u: x / canvas.width,
                v: y / canvas.height,
                x: x, // Keep original coordinates for drawing
                y: y
            };
        }).filter((p) => isFinite(p.u) && isFinite(p.v)); // Filter out invalid points
        // Apply the current tool's effects to the path
        // If the tool is embroidery (either current active tool or stored tool), use embroidery rendering
        if (currentTool === 'embroidery' || currentTool === 'cross-stitch' || currentTool === 'satin' || currentTool === 'chain' || currentTool === 'fill') {
            // Embroidery tool - render actual stitch types based on embroideryStitchType
            const stitchThickness = appState.embroideryThickness || 3;
            const stitchColor = appState.embroideryColor || '#ff69b4';
            const stitchOpacity = appState.embroideryOpacity || 1.0;
            // Use the specific tool type if it's a stitch type, otherwise use embroideryStitchType
            const stitchType = (currentTool === 'cross-stitch' || currentTool === 'satin' || currentTool === 'chain' || currentTool === 'fill')
                ? currentTool
                : (appState.embroideryStitchType || 'satin');
            // Validate stitch parameters early
            if (!isFinite(stitchThickness) || stitchThickness <= 0 ||
                !stitchColor || stitchColor === 'transparent') {
                console.warn('Invalid embroidery parameters:', { stitchThickness, stitchColor });
                ctx.restore();
                return;
            }
            console.log(`🧵 VECTOR EMBROIDERY: Rendering ${stitchType} stitch with ${path.points.length} points`);
            console.log('Path points:', path.points);
            console.log('Stitch config:', { stitchType, stitchColor, stitchThickness, stitchOpacity });
            console.log('App state embroidery color:', appState.embroideryColor);
            console.log('App state embroidery stitch type:', appState.embroideryStitchType);
            // Create stitch configuration
            const stitchConfig = {
                type: stitchType,
                color: stitchColor,
                thickness: stitchThickness,
                opacity: stitchOpacity
            };
            // Debug canvas context before stitch rendering
            if (process.env.NODE_ENV === 'development') {
                console.log('🎨 Canvas context before stitch rendering:', {
                    strokeStyle: ctx.strokeStyle,
                    fillStyle: ctx.fillStyle,
                    globalCompositeOperation: ctx.globalCompositeOperation,
                    globalAlpha: ctx.globalAlpha,
                    lineWidth: ctx.lineWidth
                });
            }
            // Render the specific stitch type using existing stitch renderer
            try {
                console.log(`🧵 Rendering ${stitchType} stitch with ${path.points.length} points`);
                console.log('Stitch config:', stitchConfig);
                // Use the existing renderStitchType function
                renderStitchType(ctx, path.points, stitchConfig);
                console.log('✅ Stitch rendering completed successfully');
            }
            catch (error) {
                console.error('❌ Error in stitch rendering:', error);
                console.log('Falling back to basic line rendering...');
                // Fallback to basic line rendering
                ctx.lineWidth = stitchThickness;
                ctx.strokeStyle = stitchColor;
                ctx.globalAlpha = stitchOpacity;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.beginPath();
                if (path.points.length >= 2) {
                    ctx.moveTo(path.points[0].x, path.points[0].y);
                    for (let i = 1; i < path.points.length; i++) {
                        ctx.lineTo(path.points[i].x, path.points[i].y);
                    }
                }
                ctx.stroke();
                console.log('✅ Fallback line rendering completed');
            }
            ctx.restore();
            return;
        }
        switch (currentTool) {
            case 'brush':
                // Brush tool - apply brush texture and effects
                ctx.lineWidth = appState.brushSize || 5;
                ctx.strokeStyle = appState.brushColor || '#000';
                ctx.globalAlpha = appState.brushOpacity || 1.0;
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                ctx.shadowColor = 'rgba(0,0,0,0.3)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                // Draw the path with brush effects
                ctx.beginPath();
                drawAdvancedBezier2D(ctx, path.points);
                ctx.stroke();
                break;
            case 'puffPrint':
                // Puff tool - create actual puff effects with optimized performance
                const puffSize = appState.puffBrushSize || 20;
                const puffColor = appState.puffColor || '#ff69b4';
                const puffOpacity = appState.puffBrushOpacity || 1.0;
                // Validate parameters early
                if (!isFinite(puffSize) || puffSize <= 0 ||
                    !puffColor || puffColor === 'transparent') {
                    console.warn('Invalid puff parameters:', { puffSize, puffColor });
                    break;
                }
                // Optimize rendering settings
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                ctx.globalAlpha = puffOpacity;
                // Parse color once for performance
                const r = parseInt(puffColor.slice(1, 3), 16) || 255;
                const g = parseInt(puffColor.slice(3, 5), 16) || 0;
                const b = parseInt(puffColor.slice(5, 7), 16) || 255;
                // Create puff texture along the path with optimized sampling
                const stepSize = Math.max(1, Math.floor(puffSize / 4)); // Reduce sampling for performance
                for (let i = 0; i < points.length; i += stepSize) {
                    const point = points[i];
                    // Use validated coordinates
                    const x = point.x;
                    const y = point.y;
                    if (!isFinite(x) || !isFinite(y)) {
                        continue; // Skip invalid points silently for performance
                    }
                    // Create optimized radial gradient for puff effect
                    const gradient = ctx.createRadialGradient(x, y, 0, x, y, puffSize / 2);
                    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${puffOpacity})`);
                    gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${puffOpacity * 0.6})`);
                    gradient.addColorStop(0.8, `rgba(${r}, ${g}, ${b}, ${puffOpacity * 0.2})`);
                    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(x, y, puffSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
            case 'print':
                // Print tool - crisp, clean lines
                ctx.lineWidth = Math.max(1, (appState.brushSize || 5) * 0.8);
                ctx.strokeStyle = appState.brushColor || '#000';
                ctx.globalAlpha = appState.brushOpacity || 1.0;
                ctx.lineJoin = 'miter';
                ctx.lineCap = 'square';
                ctx.shadowColor = 'rgba(0,0,0,0.1)';
                ctx.shadowBlur = 1;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                // Draw the path with print effects
                ctx.beginPath();
                drawAdvancedBezier2D(ctx, path.points);
                ctx.stroke();
                break;
            case 'vector':
                // Vector mode fallback - render with current active tool effects
                console.log(`🎨 VECTOR MODE: Rendering with ${appState.activeTool} tool effects`);
                // Apply the current active tool's effects
                // Note: Embroidery is handled at the top of the function for vector mode
                // Default vector rendering
                ctx.lineWidth = appState.brushSize || 5;
                ctx.strokeStyle = appState.brushColor || '#000';
                ctx.globalAlpha = appState.brushOpacity || 1.0;
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                ctx.beginPath();
                drawAdvancedBezier2D(ctx, path.points);
                ctx.stroke();
                break;
            default:
                // Default brush-like rendering
                ctx.lineWidth = appState.brushSize || 5;
                ctx.strokeStyle = appState.brushColor || '#000';
                ctx.globalAlpha = appState.brushOpacity || 1.0;
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                // Draw the path
                ctx.beginPath();
                drawAdvancedBezier2D(ctx, path.points);
                ctx.stroke();
                break;
        }
        ctx.restore();
    }
    // CRITICAL: Convert vector paths to embroidery stitches
    function convertVectorPathsToEmbroideryStitches() {
        const st = vectorStore.getState();
        const appState = useApp.getState();
        console.log(`🔄 Converting ${st.shapes.length} vector shapes to embroidery stitches`);
        if (st.shapes.length === 0) {
            console.log('No vector shapes to convert');
            return;
        }
        const newStitches = [];
        st.shapes.forEach((shape) => {
            if (!shape || !shape.path || !shape.path.points || shape.path.points.length < 2) {
                console.warn('Invalid shape for conversion:', shape);
                return;
            }
            // Get the tool used to create this shape (stored when shape was created)
            const toolUsed = shape.tool || appState.activeTool;
            // Only convert if it was created with an embroidery tool
            if (isEmbroideryTool(toolUsed)) {
                console.log(`Converting shape ${shape.id} created with tool: ${toolUsed}`);
                // Convert vector points to stitch points
                const stitchPoints = shape.path.points.map((point) => ({
                    x: point.x,
                    y: point.y,
                    u: point.x / (appState.composedCanvas?.width || 2048),
                    v: point.y / (appState.composedCanvas?.height || 2048)
                }));
                // Determine the correct stitch type
                // Use the tool that was actually used to create the shape
                let stitchType = 'satin'; // default
                if (toolUsed === 'embroidery') {
                    // For generic embroidery tool, check if we have stitch type info stored
                    stitchType = shape.stitchType || appState.embroideryStitchType || 'satin';
                }
                else if (isEmbroideryTool(toolUsed)) {
                    // If the tool itself is a stitch type, use it
                    stitchType = toolUsed;
                }
                console.log(`🔧 Converting shape ${shape.id}: toolUsed=${toolUsed}, stitchType=${stitchType}`);
                // Create embroidery stitch
                const newStitch = {
                    id: `stitch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    type: stitchType,
                    points: stitchPoints,
                    color: appState.embroideryColor || '#ff69b4',
                    threadType: appState.embroideryThreadType || 'cotton',
                    thickness: appState.embroideryThickness || 3,
                    opacity: appState.embroideryOpacity || 1.0,
                    pattern: shape.path.closed ? 'closed' : 'open',
                    createdFromVector: true,
                    originalShapeId: shape.id
                };
                newStitches.push(newStitch);
                console.log(`Created stitch ${newStitch.id} with ${stitchPoints.length} points`);
            }
        });
        if (newStitches.length > 0) {
            // Add new stitches to the embroidery stitches array
            const currentStitches = appState.embroideryStitches || [];
            const updatedStitches = [...currentStitches, ...newStitches];
            // Update the app state
            useApp.setState({ embroideryStitches: updatedStitches });
            console.log(`✅ Successfully converted ${newStitches.length} vector shapes to embroidery stitches`);
            // Clear the vector shapes after conversion
            vectorStore.setState({ shapes: [] });
            vectorStore.setState({ currentPath: null });
            // Trigger re-render
            composeLayers();
        }
        else {
            console.log('No embroidery-compatible vector shapes found for conversion');
        }
    }
    // Performance optimization: Throttle rendering
    let renderThrottleTimeout = null;
    function throttledRender(callback, delay = 16) {
        if (renderThrottleTimeout) {
            clearTimeout(renderThrottleTimeout);
        }
        renderThrottleTimeout = setTimeout(() => {
            callback();
            renderThrottleTimeout = null;
        }, delay);
    }
    // Helper functions for real-time rendering
    function isEmbroideryTool(tool) {
        return [
            'embroidery',
            'cross-stitch',
            'crossstitch',
            'satin',
            'chain',
            'fill',
            'back-stitch',
            'backstitch',
            'french-knot',
            'running-stitch',
            'runningstitch',
            'blanket-stitch',
            'blanketstitch',
            'feather-stitch',
            'herringbone-stitch',
            'herringbonestitch',
            'bullion',
            'feather',
            'lazy-daisy',
            'couching',
            'appliqué',
            'seed',
            'stem',
            'split',
            'brick',
            'long-short',
            'fishbone',
            'satin-ribbon',
            'metallic',
            'glow-thread',
            'variegated',
            'gradient'
        ].includes(tool);
    }
    function renderRealTimeEmbroideryStitches(ctx, path, appState, stitchType) {
        if (!ctx || !path.points || path.points.length < 2)
            return;
        try {
            // Use the provided stitch type or get it from config
            const stitchConfig = stitchType ? {
                type: stitchType,
                color: appState.embroideryColor || '#ff69b4',
                thickness: appState.embroideryThickness || 3,
                opacity: appState.embroideryOpacity || 1.0
            } : getStitchConfig(appState.activeTool, appState);
            
            const stitchPoints = path.points.map((p) => ({ x: p.x, y: p.y }));
            
            // Reduced logging for performance
            if (process.env.NODE_ENV === 'development' && Math.random() < 0.05) {
                console.log(`🧵 REAL-TIME STITCHES: ${stitchConfig.type} with ${stitchPoints.length} points`);
            }
            
            // IMPROVED: Ensure all points are connected with proper stitch rendering
            // Don't limit points for better accuracy in vector mode
            const maxPoints = appState.vectorMode ? 500 : 100; // Allow more points in vector mode
            const optimizedPoints = stitchPoints.length > maxPoints
                ? stitchPoints.filter((_, index) => index % Math.ceil(stitchPoints.length / maxPoints) === 0)
                : stitchPoints;
            
            // Ensure we have at least 2 points for rendering
            if (optimizedPoints.length < 2) {
                console.warn('🧵 Not enough points for stitch rendering');
                return;
            }
            
            // Use universal renderer for better stitch type detection
            const success = universalVectorRenderer.render(ctx, optimizedPoints, stitchType || appState.activeTool, stitchConfig, { 
                realTime: true, 
                quality: appState.vectorMode ? 'high' : 'medium',
                connectAllPoints: true // Ensure all points are connected
            });
            
            // Fallback to old renderer if universal renderer fails
            if (!success) {
                console.log(`🔄 Falling back to legacy renderer for ${stitchConfig.type}`);
                renderStitchType(ctx, optimizedPoints, stitchConfig);
            }
            
            // ADDITIONAL: Render connecting lines between all anchor points for better visibility
            if (appState.vectorMode && optimizedPoints.length > 2) {
                ctx.save();
                ctx.strokeStyle = stitchConfig.color;
                ctx.lineWidth = Math.max(1, stitchConfig.thickness * 0.3);
                ctx.globalAlpha = stitchConfig.opacity * 0.5;
                ctx.setLineDash([2, 2]);
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                
                ctx.beginPath();
                ctx.moveTo(optimizedPoints[0].x, optimizedPoints[0].y);
                for (let i = 1; i < optimizedPoints.length; i++) {
                    ctx.lineTo(optimizedPoints[i].x, optimizedPoints[i].y);
                }
                ctx.stroke();
                ctx.restore();
            }
        }
        catch (error) {
            console.error('Error rendering real-time embroidery stitches:', error);
            renderFallbackLine(ctx, path.points);
        }
    }
    function renderEmbroideryStitches(ctx, path, tool, appState, storedStitchType) {
        if (!ctx || !path.points || path.points.length < 2)
            return;
        try {
            const stitchConfig = getStitchConfig(tool, appState, storedStitchType);
            console.log(`🧵 renderEmbroideryStitches: tool="${tool}", storedStitchType="${storedStitchType}", stitchConfig.type="${stitchConfig.type}", stitchConfig.color="${stitchConfig.color}"`);
            const stitchPoints = path.points.map((p) => ({ x: p.x, y: p.y }));
            // Use universal renderer for better stitch type detection
            const success = universalVectorRenderer.render(ctx, stitchPoints, tool, stitchConfig, { realTime: false, quality: 'high' });
            // Fallback to old renderer if universal renderer fails
            if (!success) {
                console.log(`🔄 Falling back to legacy renderer for ${stitchConfig.type}`);
                renderStitchType(ctx, stitchPoints, stitchConfig);
            }
        }
        catch (error) {
            console.error('Error rendering embroidery stitches:', error);
            renderFallbackLine(ctx, path.points);
        }
    }
    function renderStandardVectorPath(ctx, path, appState) {
        if (!ctx || !path.points || path.points.length < 2)
            return;
        ctx.save();
        ctx.strokeStyle = appState.brushColor || '#000000';
        ctx.lineWidth = appState.brushSize || 5;
        ctx.globalAlpha = appState.brushOpacity || 1.0;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(path.points[0].x, path.points[0].y);
        for (let i = 1; i < path.points.length; i++) {
            ctx.lineTo(path.points[i].x, path.points[i].y);
        }
        ctx.stroke();
        ctx.restore();
    }
    function getStitchConfig(tool, appState, storedStitchType) {
        // CRITICAL FIX: For existing shapes, prioritize stored stitch type
        let stitchType = 'satin'; // default
        // If we have a stored stitch type (for existing shapes), use it first
        if (storedStitchType && isEmbroideryTool(storedStitchType)) {
            stitchType = storedStitchType;
            console.log(`🔧 getStitchConfig: Using stored stitch type: ${storedStitchType}`);
        }
        // For new shapes, check app state first
        else if (appState.embroideryStitchType && isEmbroideryTool(appState.embroideryStitchType)) {
            stitchType = appState.embroideryStitchType;
            console.log(`🔧 getStitchConfig: Using app state stitch type: ${appState.embroideryStitchType}`);
        }
        // Then check if the tool itself is a stitch type
        else if (isEmbroideryTool(tool)) {
            stitchType = tool;
            console.log(`🔧 getStitchConfig: Using tool as stitch type: ${tool}`);
        }
        // Finally check if active tool is a stitch type
        else if (appState.activeTool && isEmbroideryTool(appState.activeTool)) {
            stitchType = appState.activeTool;
            console.log(`🔧 getStitchConfig: Using active tool as stitch type: ${appState.activeTool}`);
        }
        console.log(`🔧 getStitchConfig: tool=${tool}, storedStitchType=${storedStitchType}, appState.embroideryStitchType=${appState.embroideryStitchType}, appState.activeTool=${appState.activeTool}, finalStitchType=${stitchType}`);
        const finalColor = appState.embroideryColor || '#ff69b4';
        console.log(`🎨 getStitchConfig color debug: appState.embroideryColor="${appState.embroideryColor}", finalColor="${finalColor}"`);
        // Validate the color before returning
        if (finalColor && typeof finalColor === 'string' && /^#[0-9a-f]{6}$/i.test(finalColor)) {
            console.log(`✅ getStitchConfig color is valid: ${finalColor}`);
        }
        else {
            console.error(`❌ getStitchConfig color is INVALID: ${finalColor}`);
        }
        return {
            type: stitchType,
            color: finalColor,
            thickness: appState.embroideryThickness || 3,
            opacity: appState.embroideryOpacity || 1.0
        };
    }
    function renderFallbackLine(ctx, points) {
        if (!ctx || points.length < 2)
            return;
        ctx.save();
        ctx.strokeStyle = '#ff69b4';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 1.0;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
        ctx.restore();
    }
    function renderVectorsToActiveLayer() {
        const layer = getActiveLayer();
        if (!errorPrevention.validateLayer(layer)) {
            return;
        }
        const canvas = layer.canvas;
        const ctx = canvas.getContext('2d');
        if (!errorPrevention.validateCanvasContext(ctx)) {
            return;
        }
        const st = vectorStore.getState();
        const appState = useApp.getState();
        // Always clear canvas to ensure fresh rendering
        // This prevents fading and ensures all stitches are properly rendered
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        console.log('🧹 Canvas cleared for fresh rendering');
        ctx.save();
        ctx.globalCompositeOperation = layer.lockTransparent ? 'source-atop' : 'source-over';
        // CRITICAL FIX: Re-render all existing embroidery stitches when in vector mode
        // This ensures existing designs are visible when vector mode is enabled
        if (appState.vectorMode && (appState.embroideryStitches || []).length > 0) {
            console.log('🔄 Re-rendering existing embroidery stitches in vector mode');
            const existingStitches = appState.embroideryStitches || [];
            existingStitches.forEach((stitch, index) => {
                if (stitch && stitch.points && stitch.points.length > 0) {
                    console.log(`🔄 Re-rendering existing stitch ${index + 1}/${existingStitches.length}: ${stitch.type}`);
                    // Convert stitch points back to canvas coordinates
                    const canvasPoints = stitch.points.map((point) => ({
                        x: point.x || (point.u * (appState.composedCanvas?.width || 2048)),
                        y: point.y || (point.v * (appState.composedCanvas?.height || 2048))
                    }));
                    // Render the existing stitch
                    const stitchConfig = {
                        type: stitch.type,
                        color: stitch.color || '#ff69b4',
                        thickness: stitch.thickness || 3,
                        opacity: stitch.opacity || 1.0
                    };
                    // Use the universal renderer to render the existing stitch
                    universalVectorRenderer.render(ctx, canvasPoints, stitchConfig.type, stitchConfig);
                }
            });
        }
        // CRITICAL FIX: Real-time rendering for current path (only in vector mode)
        if (st.currentPath && st.currentPath.points.length >= 2 && appState.vectorMode) {
            // Reduced logging for performance
            if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
                console.log(`🎨 REAL-TIME RENDERING: ${st.currentPath.points.length} points, tool: ${appState.activeTool}`);
            }
            
            // Check if this is an embroidery tool
            if (isEmbroideryTool(appState.activeTool)) {
                // Pass the specific stitch type instead of generic "embroidery"
                const stitchType = appState.embroideryStitchType || appState.activeTool;
                renderRealTimeEmbroideryStitches(ctx, st.currentPath, appState, stitchType);
            }
            else {
                renderStandardVectorPath(ctx, st.currentPath, appState);
            }
        }
        
        // CRITICAL FIX: Render stitches between all anchor points in vector mode
        if (appState.vectorMode && st.shapes.length > 0) {
            st.shapes.forEach((shape) => {
                if (shape.path && shape.path.points && shape.path.points.length >= 2) {
                    // Check if this shape should have stitches rendered between points
                    if (isEmbroideryTool(shape.tool) || isEmbroideryTool(appState.activeTool)) {
                        const stitchType = shape.stitchType || appState.embroideryStitchType || appState.activeTool;
                        console.log(`🧵 RENDERING STITCHES BETWEEN ANCHOR POINTS: shape=${shape.id}, stitchType=${stitchType}, points=${shape.path.points.length}`);
                        renderRealTimeEmbroideryStitches(ctx, shape.path, appState, stitchType);
                    }
                }
            });
        }
        // Draw existing shapes with tool-specific rendering
        st.shapes.forEach((shape) => {
            if (!errorPrevention.validateVectorShape(shape)) {
                return;
            }
            const p = shape.path;
            // Use the tool stored with the shape, not the current active tool
            const toolToUse = shape.tool || 'brush'; // Default to brush if no tool stored
            const storedStitchType = shape.stitchType || shape.tool;
            console.log(`🔧 Rendering existing shape: id=${shape.id}, tool="${shape.tool}", stitchType="${shape.stitchType}", toolToUse="${toolToUse}"`);
            if (isEmbroideryTool(toolToUse)) {
                // Pass the stored stitch type to preserve the original stitch type
                renderEmbroideryStitches(ctx, p, toolToUse, appState, storedStitchType);
            }
            else {
                renderStandardVectorPath(ctx, p, appState);
            }
        });
        // Render existing embroidery stitches
        if (appState.embroideryStitches && Array.isArray(appState.embroideryStitches)) {
            appState.embroideryStitches.forEach((stitch) => {
                if (stitch && stitch.points && Array.isArray(stitch.points)) {
                    const stitchConfig = {
                        type: stitch.stitchType || 'satin',
                        color: stitch.color || appState.embroideryColor || '#ff69b4',
                        thickness: stitch.thickness || appState.embroideryThickness || 3,
                        opacity: stitch.opacity || appState.embroideryOpacity || 1.0
                    };
                    renderStitchType(ctx, stitch.points, stitchConfig);
                }
            });
        }
        // IMPORTANT: Also render existing embroidery stitches when in vector mode
        // This ensures that existing embroidery doesn't disappear when vector mode is enabled
        if (appState.vectorMode && appState.embroideryStitches && Array.isArray(appState.embroideryStitches)) {
            console.log(`🧵 VECTOR MODE: Rendering ${appState.embroideryStitches.length} existing embroidery stitches`);
            appState.embroideryStitches.forEach((stitch) => {
                if (stitch && stitch.points && Array.isArray(stitch.points)) {
                    // Convert stitch to vector path format for rendering
                    const stitchPath = {
                        points: stitch.points.map((p) => ({
                            x: p.x || p.u * canvas.width,
                            y: p.y || p.v * canvas.height
                        }))
                    };
                    // Render the stitch using the stitch rendering system
                    const stitchConfig = {
                        type: stitch.type || 'satin',
                        color: stitch.color || '#ff69b4',
                        thickness: stitch.thickness || 3,
                        opacity: stitch.opacity || 1.0
                    };
                    try {
                        renderStitchType(ctx, stitchPath.points, stitchConfig);
                    }
                    catch (error) {
                        console.error('Error rendering embroidery stitch in vector mode:', error);
                        logRenderingError(`Embroidery stitch rendering failed in vector mode: ${error}`, ['embroidery', 'vector-mode']);
                    }
                }
            });
        }
        ctx.restore();
        composeLayers();
        console.log(`✅ renderVectorsToActiveLayer: Completed rendering ${st.shapes.length} shapes`);
        // Only call invalidate after all rendering is complete
        if (texture) {
            texture.needsUpdate = true;
            invalidate();
        }
        // Render anchor points as 3D objects (debounced)
        debouncedRenderAnchorPoints();
    }
    // Separate function to render anchor points and selection indicators
    function renderAnchorPointsAndSelection() {
        // CRITICAL: Only render anchor points when showAnchorPoints is true
        const appState = useApp.getState();
        if (!appState.showAnchorPoints) {
            console.log('🎯 Anchor points NOT rendered: showAnchorPoints is false');
            return; // Don't render anchor points when not enabled
        }
        console.log('🎯 Anchor points should render: showAnchorPoints is true');
        const st = vectorStore.getState();
        console.log(`🎯 Rendering anchor points: shapes=${st.shapes.length}, currentPath=${st.currentPath ? st.currentPath.points.length : 'none'}`);
        // Only clear and recreate if we actually need to
        const needsUpdate = shouldUpdateAnchorPoints(st);
        if (!needsUpdate) {
            console.log('🎯 Anchor points are up to date, skipping recreation');
            return;
        }
        // Clear existing anchor points
        clearAnchorPointObjects();
        // Draw anchor points for ALL existing shapes when showAnchorPoints is enabled
        st.shapes.forEach((shape) => {
            if (!shape?.path)
                return;
            const p = shape.path;
            console.log(`🎯 Shape ${shape.id}: points=${p.points.length}`);
            createAnchorPointObjects(p.points, shape.id);
        });
        // ALWAYS draw anchor points for current path when in vector mode
        if (st.currentPath && st.currentPath.points.length > 0) {
            console.log(`🎯 Drawing anchor points for current path: ${st.currentPath.points.length} points`);
            createAnchorPointObjects(st.currentPath.points, 'current');
        }
        else {
            console.log(`🎯 No current path to draw anchor points for`);
        }
    }
    // Helper function to determine if anchor points need updating
    function shouldUpdateAnchorPoints(st) {
        // Check if we have any anchor points currently
        if (anchorPointObjects.current.length === 0) {
            console.log('🎯 No existing anchor points, need to create');
            return true;
        }
        // Check if current path has changed
        const currentPathPoints = st.currentPath ? st.currentPath.points.length : 0;
        const existingCurrentPathPoints = anchorPointObjects.current.filter(obj => obj.userData?.shapeId === 'current').length;
        if (currentPathPoints !== existingCurrentPathPoints) {
            console.log(`🎯 Current path points changed: ${existingCurrentPathPoints} -> ${currentPathPoints}`);
            return true;
        }
        // Check if total shapes have changed (since we now show all shapes)
        const totalShapes = st.shapes.length;
        const existingShapePoints = anchorPointObjects.current.filter(obj => obj.userData?.shapeId !== 'current').length;
        if (totalShapes !== existingShapePoints) {
            console.log(`🎯 Total shapes changed: ${existingShapePoints} -> ${totalShapes}`);
            return true;
        }
        console.log('🎯 Anchor points are up to date');
        return false;
    }
    // Store for anchor point objects
    const anchorPointObjects = useRef([]);
    // Function to clear existing anchor point objects
    function clearAnchorPointObjects() {
        console.log(`🎯 Clearing ${anchorPointObjects.current.length} anchor point objects`);
        // Clear all anchor point objects
        anchorPointObjects.current.forEach(obj => {
            if (obj.parent) {
                obj.parent.remove(obj);
                console.log(`🎯 Removed anchor point object: ${obj.userData?.type || 'unknown'}`);
            }
        });
        anchorPointObjects.current = [];
        // Also clear any test objects that might be lingering
        if (modelScene) {
            const objectsToRemove = [];
            modelScene.traverse((child) => {
                if (child.userData?.type === 'anchorPoint' || child.userData?.type === 'testAnchor' || child.name?.startsWith('testAnchor')) {
                    objectsToRemove.push(child);
                }
            });
            objectsToRemove.forEach(obj => {
                if (obj.parent) {
                    obj.parent.remove(obj);
                    console.log(`🎯 Removed lingering object: ${obj.name || obj.userData?.type || 'unknown'}`);
                }
            });
        }
    }
    // Function to create a single anchor point from a click
    function createSingleAnchorPoint(point) {
        if (!modelScene)
            return;
        // Convert 2D canvas coordinates to 3D world coordinates
        const uv = new THREE.Vector2(point.x / 2048, point.y / 2048);
        console.log(`🎯 Creating single anchor point: canvas(${point.x}, ${point.y}) -> UV(${uv.x.toFixed(3)}, ${uv.y.toFixed(3)})`);
        const worldPos = uvToWorldPosition(uv);
        if (!worldPos) {
            console.log(`🎯 Failed to convert UV to world position for single anchor point`);
            return;
        }
        // Create anchor point geometry
        const geometry = new THREE.SphereGeometry(0.15, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: '#FF0000',
            transparent: true,
            opacity: 0.9
        });
        const anchorPoint = new THREE.Mesh(geometry, material);
        // Add a glow effect
        const glowGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: '#FF0000',
            transparent: true,
            opacity: 0.3
        });
        const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
        anchorPoint.add(glowSphere);
        // Position the anchor point using the same inverse transform logic
        const modelPosition = useApp.getState().modelPosition;
        const modelRotation = useApp.getState().modelRotation;
        const modelScale = useApp.getState().modelScale;
        // Create the inverse transformation matrix
        const inverseMatrix = new THREE.Matrix4();
        // Apply inverse scale
        const inverseScale = 1 / modelScale;
        inverseMatrix.scale(new THREE.Vector3(inverseScale, inverseScale, inverseScale));
        // Apply inverse rotation
        const inverseRotation = new THREE.Euler(-modelRotation[0], -modelRotation[1], -modelRotation[2]);
        const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(inverseRotation);
        inverseMatrix.premultiply(rotationMatrix);
        // Apply inverse translation
        const inverseTranslation = new THREE.Vector3(-modelPosition[0], -modelPosition[1], -modelPosition[2]);
        const translationMatrix = new THREE.Matrix4().makeTranslation(inverseTranslation.x, inverseTranslation.y, inverseTranslation.z);
        inverseMatrix.premultiply(translationMatrix);
        // Apply the inverse transformation to get local position
        const localPos = worldPos.clone();
        localPos.applyMatrix4(inverseMatrix);
        anchorPoint.position.copy(localPos);
        anchorPoint.userData = {
            type: 'anchorPoint',
            shapeId: 'single',
            pointIndex: anchorPointObjects.current.length,
            originalPoint: point
        };
        // Add to the model scene
        modelScene.add(anchorPoint);
        anchorPointObjects.current.push(anchorPoint);
        console.log(`🎯 Created single anchor point at position:`, worldPos);
        console.log(`🎯 Total anchor points: ${anchorPointObjects.current.length}`);
    }
    // Function to create anchor point objects in 3D space
    function createAnchorPointObjects(points, shapeId) {
        if (!modelScene)
            return;
        points.forEach((point, index) => {
            // Convert 2D canvas coordinates to 3D world coordinates using precise conversion
            const layer = getActiveLayer();
            if (!layer) return;
            
            const uv = canvasToUVCoordinates(point.x, point.y, layer.canvas);
            console.log(`🎯 Converting point ${index}: canvas(${point.x}, ${point.y}) -> UV(${uv.x.toFixed(3)}, ${uv.y.toFixed(3)})`);
            const worldPos = uvToWorldPosition(uv);
            if (!worldPos) {
                console.log(`🎯 Failed to convert UV to world position for point ${index}`);
                return;
            }
            // Create anchor point geometry - make it larger and more visible
            const geometry = new THREE.SphereGeometry(0.15, 16, 16);
            const material = new THREE.MeshBasicMaterial({
                color: '#FF0000', // Bright red for visibility
                transparent: true,
                opacity: 0.9
            });
            const anchorPoint = new THREE.Mesh(geometry, material);
            // Add a glow effect by creating a larger, semi-transparent sphere
            const glowGeometry = new THREE.SphereGeometry(0.25, 16, 16);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: '#FF0000',
                transparent: true,
                opacity: 0.3
            });
            const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
            anchorPoint.add(glowSphere);
            // Since the Shirt component is wrapped in a transformed group in App.tsx,
            // we need to position the anchor point in the local space of that group
            // The worldPos is already transformed by the mesh's matrixWorld, so we need
            // to convert it back to the local space of the parent group
            const modelPosition = useApp.getState().modelPosition;
            const modelRotation = useApp.getState().modelRotation;
            const modelScale = useApp.getState().modelScale;
            // Create the inverse transformation matrix
            const inverseMatrix = new THREE.Matrix4();
            // Apply inverse scale
            const inverseScale = 1 / modelScale;
            inverseMatrix.scale(new THREE.Vector3(inverseScale, inverseScale, inverseScale));
            // Apply inverse rotation
            const inverseRotation = new THREE.Euler(-modelRotation[0], -modelRotation[1], -modelRotation[2]);
            const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(inverseRotation);
            inverseMatrix.premultiply(rotationMatrix);
            // Apply inverse translation
            const inverseTranslation = new THREE.Vector3(-modelPosition[0], -modelPosition[1], -modelPosition[2]);
            const translationMatrix = new THREE.Matrix4().makeTranslation(inverseTranslation.x, inverseTranslation.y, inverseTranslation.z);
            inverseMatrix.premultiply(translationMatrix);
            // Apply the inverse transformation to get local position
            const localPos = worldPos.clone();
            localPos.applyMatrix4(inverseMatrix);
            anchorPoint.position.copy(localPos);
            console.log(`🎯 Original world position: (${worldPos.x.toFixed(3)}, ${worldPos.y.toFixed(3)}, ${worldPos.z.toFixed(3)})`);
            console.log(`🎯 Model transforms - Position: [${modelPosition.join(', ')}], Rotation: [${modelRotation.join(', ')}], Scale: ${modelScale}`);
            console.log(`🎯 Local position after inverse transforms: (${localPos.x.toFixed(3)}, ${localPos.y.toFixed(3)}, ${localPos.z.toFixed(3)})`);
            anchorPoint.userData = {
                type: 'anchorPoint',
                shapeId,
                pointIndex: index,
                originalPoint: point
            };
            // Add to the model scene (which will be transformed by the parent group)
            modelScene.add(anchorPoint);
            anchorPointObjects.current.push(anchorPoint);
            console.log(`🎯 Created anchor point ${index} for shape ${shapeId} at position:`, worldPos);
            console.log(`🎯 Anchor point added to scene. Total anchor points: ${anchorPointObjects.current.length}`);
            console.log(`🎯 Model scene children count: ${modelScene.children.length}`);
        });
    }
    // Precise coordinate conversion functions
    function uvToCanvasCoordinates(uv, canvas) {
        // Ensure UV coordinates are in [0,1] range
        const clampedUV = new THREE.Vector2(
            Math.max(0, Math.min(1, uv.x)),
            Math.max(0, Math.min(1, uv.y))
        );
        
        // Convert to canvas coordinates with sub-pixel precision
        const x = clampedUV.x * canvas.width;
        const y = clampedUV.y * canvas.height;
        
        // Round to nearest pixel for consistency
        return {
            x: Math.round(x),
            y: Math.round(y),
            preciseX: x,
            preciseY: y
        };
    }
    
    function canvasToUVCoordinates(x, y, canvas) {
        // Convert canvas coordinates back to UV coordinates
        const u = x / canvas.width;
        const v = y / canvas.height;
        
        // Clamp to [0,1] range
        return new THREE.Vector2(
            Math.max(0, Math.min(1, u)),
            Math.max(0, Math.min(1, v))
        );
    }
    
    // UV coordinate correction cache for performance
    const uvCorrectionCache = new Map();
    const MAX_CACHE_SIZE = 1000;
    
    // UV coordinate correction system for ray intersection accuracy
    function correctUVCoordinates(uv, canvas) {
        // Create cache key
        const cacheKey = `${uv.x.toFixed(4)}_${uv.y.toFixed(4)}_${canvas.width}_${canvas.height}`;
        
        // Check cache first
        if (uvCorrectionCache.has(cacheKey)) {
            return uvCorrectionCache.get(cacheKey);
        }
        if (!uv || !isFinite(uv.x) || !isFinite(uv.y)) {
            console.warn('🎯 Invalid UV coordinates:', uv);
            return new THREE.Vector2(0.5, 0.5);
        }
        
        // Get the actual mesh to validate UV coordinates
        const shirtMesh = modelScene?.getObjectByName('AM_102_035_003_AM_102_035_002_0');
        if (!shirtMesh || !shirtMesh.geometry) {
            console.warn('🎯 No mesh available for UV correction');
            return new THREE.Vector2(
                Math.max(0, Math.min(1, uv.x)),
                Math.max(0, Math.min(1, uv.y))
            );
        }
        
        const geometry = shirtMesh.geometry;
        const uvAttribute = geometry.getAttribute('uv');
        if (!uvAttribute) {
            console.warn('🎯 No UV attribute available for correction');
            return new THREE.Vector2(
                Math.max(0, Math.min(1, uv.x)),
                Math.max(0, Math.min(1, uv.y))
            );
        }
        
        // Find the closest actual UV coordinate in the mesh using a more sophisticated approach
        let closestUV = new THREE.Vector2(uv.x, uv.y);
        let minDistance = Infinity;
        let bestVertices = [];
        
        // Search through all UV coordinates to find the closest matches
        for (let i = 0; i < uvAttribute.count; i++) {
            const meshU = uvAttribute.getX(i);
            const meshV = uvAttribute.getY(i);
            const distance = Math.sqrt((meshU - uv.x) ** 2 + (meshV - uv.y) ** 2);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestUV = new THREE.Vector2(meshU, meshV);
            }
            
            // Collect nearby vertices for interpolation
            if (distance < 0.05) { // Within 5% of UV space
                bestVertices.push({
                    index: i,
                    distance: distance,
                    u: meshU,
                    v: meshV
                });
            }
        }
        
        // Enhanced interpolation for sub-pixel accuracy
        if (bestVertices.length > 0) {
            bestVertices.sort((a, b) => a.distance - b.distance);
            
            if (bestVertices.length === 1) {
                closestUV = new THREE.Vector2(bestVertices[0].u, bestVertices[0].v);
            } else if (bestVertices.length >= 2) {
                // Use inverse distance weighting for better accuracy
                let totalWeight = 0;
                let weightedU = 0;
                let weightedV = 0;
                
                // Use more vertices for better interpolation (up to 5)
                bestVertices.slice(0, 5).forEach(vertex => {
                    // Use squared inverse distance for better weighting
                    const weight = 1 / (vertex.distance * vertex.distance + 0.0001);
                    weightedU += vertex.u * weight;
                    weightedV += vertex.v * weight;
                    totalWeight += weight;
                });
                
                if (totalWeight > 0) {
                    closestUV = new THREE.Vector2(weightedU / totalWeight, weightedV / totalWeight);
                }
            }
        }
        
        // Additional sub-pixel correction based on canvas dimensions
        if (canvas && canvas.width && canvas.height) {
            // Convert to canvas coordinates for sub-pixel precision
            const canvasX = closestUV.x * canvas.width;
            const canvasY = closestUV.y * canvas.height;
            
            // Apply sub-pixel correction
            const correctedCanvasX = Math.round(canvasX);
            const correctedCanvasY = Math.round(canvasY);
            
            // Convert back to UV with sub-pixel precision
            const correctedUV = new THREE.Vector2(
                correctedCanvasX / canvas.width,
                correctedCanvasY / canvas.height
            );
            
            // Use the corrected UV if it's closer to the original
            const originalDistance = Math.sqrt((uv.x - closestUV.x) ** 2 + (uv.y - closestUV.y) ** 2);
            const correctedDistance = Math.sqrt((uv.x - correctedUV.x) ** 2 + (uv.y - correctedUV.y) ** 2);
            
            if (correctedDistance < originalDistance) {
                closestUV = correctedUV;
            }
        }
        
        // If the distance is too large, the UV might be from a different part of the mesh
        if (minDistance > 0.1) {
            console.warn('🎯 UV coordinates seem to be from wrong mesh area:', {
                original: uv,
                closest: closestUV,
                distance: minDistance
            });
            
            // Try to find a better match by searching in a different way
            let fallbackUV = new THREE.Vector2(uv.x, uv.y);
            let fallbackDistance = Infinity;
            
            // Search for UV coordinates that are close in at least one dimension
            for (let i = 0; i < uvAttribute.count; i++) {
                const meshU = uvAttribute.getX(i);
                const meshV = uvAttribute.getY(i);
                const uDistance = Math.abs(meshU - uv.x);
                const vDistance = Math.abs(meshV - uv.y);
                
                // If either U or V is close, consider this vertex
                if (uDistance < 0.05 || vDistance < 0.05) {
                    const distance = Math.sqrt(uDistance ** 2 + vDistance ** 2);
                    if (distance < fallbackDistance) {
                        fallbackDistance = distance;
                        fallbackUV = new THREE.Vector2(meshU, meshV);
                    }
                }
            }
            
            if (fallbackDistance < 0.2) {
                closestUV = fallbackUV;
                console.log('🎯 Using fallback UV correction:', fallbackUV);
            } else {
                // Last resort: use the original UV but clamp it
                closestUV = new THREE.Vector2(
                    Math.max(0, Math.min(1, uv.x)),
                    Math.max(0, Math.min(1, uv.y))
                );
                console.log('🎯 Using clamped original UV as last resort');
            }
        }
        
        // Apply additional correction based on canvas dimensions
        const correctedUV = new THREE.Vector2(
            Math.max(0, Math.min(1, closestUV.x)),
            Math.max(0, Math.min(1, closestUV.y))
        );
        
        // Debug logging
        if (process.env.NODE_ENV === 'development') {
            console.log('🎯 UV Correction:', {
                original: uv,
                closest: closestUV,
                corrected: correctedUV,
                distance: minDistance,
                canvas: { width: canvas.width, height: canvas.height }
            });
        }
        
        // Cache the result
        if (uvCorrectionCache.size >= MAX_CACHE_SIZE) {
            // Clear oldest entries (simple FIFO)
            const firstKey = uvCorrectionCache.keys().next().value;
            uvCorrectionCache.delete(firstKey);
        }
        uvCorrectionCache.set(cacheKey, correctedUV);
        
        return correctedUV;
    }

    // Coordinate validation and correction system
    function validateAndCorrectCoordinates(uv, canvas) {
        // First apply UV correction
        const correctedUV = correctUVCoordinates(uv, canvas);
        
        // Then validate the corrected coordinates
        const clampedUV = new THREE.Vector2(
            Math.max(0, Math.min(1, correctedUV.x)),
            Math.max(0, Math.min(1, correctedUV.y))
        );
        
        // Convert to canvas coordinates and back to check consistency
        const canvasCoords = uvToCanvasCoordinates(clampedUV, canvas);
        const backToUV = canvasToUVCoordinates(canvasCoords.x, canvasCoords.y, canvas);
        
        // Check if the round-trip conversion is consistent
        const tolerance = 0.001;
        const isConsistent = Math.abs(clampedUV.x - backToUV.x) < tolerance && 
                           Math.abs(clampedUV.y - backToUV.y) < tolerance;
        
        if (!isConsistent) {
            console.warn('🎯 Coordinate conversion inconsistency detected:', {
                original: uv,
                corrected: clampedUV,
                roundTrip: backToUV,
                canvas: { width: canvas.width, height: canvas.height }
            });
        }
        
        return clampedUV;
    }

    // Function to convert UV coordinates to world position with improved accuracy
    function uvToWorldPosition(uv) {
        if (!modelScene)
            return null;
        // Get the shirt mesh
        const shirtMesh = modelScene.getObjectByName('AM_102_035_003_AM_102_035_002_0');
        if (!shirtMesh || !shirtMesh.geometry)
            return null;
        const geometry = shirtMesh.geometry;
        const positionAttribute = geometry.getAttribute('position');
        const uvAttribute = geometry.getAttribute('uv');
        const normalAttribute = geometry.getAttribute('normal');
        if (!positionAttribute || !uvAttribute) {
            console.log('🎯 ERROR: Missing position or UV attributes');
            return null;
        }
        
        // Get active layer for canvas-based correction
        const layer = getActiveLayer();
        const canvas = layer?.canvas;
        
        // Apply UV correction for maximum accuracy
        const correctedUV = canvas ? correctUVCoordinates(uv, canvas) : new THREE.Vector2(
            Math.max(0, Math.min(1, uv.x)),
            Math.max(0, Math.min(1, uv.y))
        );
        
        console.log(`🎯 UV Input: (${uv.x.toFixed(4)}, ${uv.y.toFixed(4)}) -> Corrected: (${correctedUV.x.toFixed(4)}, ${correctedUV.y.toFixed(4)})`);
        console.log(`🎯 Geometry has ${positionAttribute.count} vertices and ${uvAttribute.count} UV coordinates`);
        
        // Debug coordinate accuracy
        if (process.env.NODE_ENV === 'development' && canvas) {
            const canvasCoords = uvToCanvasCoordinates(correctedUV, canvas);
            const backToUV = canvasToUVCoordinates(canvasCoords.x, canvasCoords.y, canvas);
            console.log(`🎯 Coordinate accuracy check: UV(${correctedUV.x.toFixed(4)}, ${correctedUV.y.toFixed(4)}) -> Canvas(${canvasCoords.x}, ${canvasCoords.y}) -> UV(${backToUV.x.toFixed(4)}, ${backToUV.y.toFixed(4)})`);
        }
        
        // IMPROVED: Use barycentric interpolation for more accurate positioning
        let bestVertices = [];
        let minDistance = Infinity;
        const searchRadius = 0.01; // Further reduced search radius for maximum accuracy
        
        // Find multiple nearby vertices for interpolation using corrected UV
        for (let i = 0; i < uvAttribute.count; i++) {
            const u = uvAttribute.getX(i);
            const v = uvAttribute.getY(i);
            const distance = Math.sqrt((u - correctedUV.x) ** 2 + (v - correctedUV.y) ** 2);
            
            if (distance < searchRadius) {
                bestVertices.push({
                    index: i,
                    distance: distance,
                    u: u,
                    v: v,
                    position: new THREE.Vector3(positionAttribute.getX(i), positionAttribute.getY(i), positionAttribute.getZ(i)),
                    normal: normalAttribute ? new THREE.Vector3(normalAttribute.getX(i), normalAttribute.getY(i), normalAttribute.getZ(i)) : null
                });
            }
        }
        
        // Sort by distance and take the closest ones
        bestVertices.sort((a, b) => a.distance - b.distance);
        bestVertices = bestVertices.slice(0, 3); // Take top 3 for interpolation
        
        if (bestVertices.length === 0) {
            console.log('🎯 No nearby vertices found, using closest vertex fallback');
            // Fallback to closest vertex using normalized UV
            for (let i = 0; i < uvAttribute.count; i++) {
                const u = uvAttribute.getX(i);
                const v = uvAttribute.getY(i);
                const distance = Math.sqrt((u - normalizedUV.x) ** 2 + (v - normalizedUV.y) ** 2);
                if (distance < minDistance) {
                    minDistance = distance;
                    bestVertices = [{
                        index: i,
                        distance: distance,
                        u: u,
                        v: v,
                        position: new THREE.Vector3(positionAttribute.getX(i), positionAttribute.getY(i), positionAttribute.getZ(i)),
                        normal: normalAttribute ? new THREE.Vector3(normalAttribute.getX(i), normalAttribute.getY(i), normalAttribute.getZ(i)) : null
                    }];
                }
            }
        }
        
        if (bestVertices.length === 0) {
            console.log('🎯 ERROR: No vertices found');
            return null;
        }
        
        // Interpolate position using barycentric coordinates
        let interpolatedPosition = new THREE.Vector3();
        let interpolatedNormal = new THREE.Vector3();
        let totalWeight = 0;
        
        if (bestVertices.length === 1) {
            // Single vertex
            interpolatedPosition.copy(bestVertices[0].position);
            if (bestVertices[0].normal) {
                interpolatedNormal.copy(bestVertices[0].normal);
            }
        } else if (bestVertices.length === 2) {
            // Linear interpolation between two vertices
            const v1 = bestVertices[0];
            const v2 = bestVertices[1];
            const t = v1.distance / (v1.distance + v2.distance);
            interpolatedPosition.lerpVectors(v1.position, v2.position, t);
            if (v1.normal && v2.normal) {
                interpolatedNormal.lerpVectors(v1.normal, v2.normal, t).normalize();
            }
        } else {
            // Barycentric interpolation with three vertices
            const v1 = bestVertices[0];
            const v2 = bestVertices[1];
            const v3 = bestVertices[2];
            
            // Calculate barycentric coordinates using corrected UV
            const denom = (v2.v - v3.v) * (v1.u - v3.u) + (v3.u - v2.u) * (v1.v - v3.v);
            if (Math.abs(denom) > 1e-10) {
                const a = ((v2.v - v3.v) * (correctedUV.x - v3.u) + (v3.u - v2.u) * (correctedUV.y - v3.v)) / denom;
                const b = ((v3.v - v1.v) * (correctedUV.x - v3.u) + (v1.u - v3.u) * (correctedUV.y - v3.v)) / denom;
                const c = 1 - a - b;
                
                // Clamp to valid range
                const clampedA = Math.max(0, Math.min(1, a));
                const clampedB = Math.max(0, Math.min(1, b));
                const clampedC = Math.max(0, Math.min(1, c));
                
                // Normalize weights
                const sum = clampedA + clampedB + clampedC;
                const weightA = clampedA / sum;
                const weightB = clampedB / sum;
                const weightC = clampedC / sum;
                
                interpolatedPosition
                    .copy(v1.position).multiplyScalar(weightA)
                    .add(v2.position.clone().multiplyScalar(weightB))
                    .add(v3.position.clone().multiplyScalar(weightC));
                    
                if (v1.normal && v2.normal && v3.normal) {
                    interpolatedNormal
                        .copy(v1.normal).multiplyScalar(weightA)
                        .add(v2.normal.clone().multiplyScalar(weightB))
                        .add(v3.normal.clone().multiplyScalar(weightC))
                        .normalize();
                }
            } else {
                // Fallback to distance-weighted average
                bestVertices.forEach(vertex => {
                    const weight = 1 / (vertex.distance + 1e-6);
                    interpolatedPosition.add(vertex.position.clone().multiplyScalar(weight));
                    if (vertex.normal) {
                        interpolatedNormal.add(vertex.normal.clone().multiplyScalar(weight));
                    }
                    totalWeight += weight;
                });
                interpolatedPosition.divideScalar(totalWeight);
                if (totalWeight > 0) {
                    interpolatedNormal.divideScalar(totalWeight).normalize();
                }
            }
        }
        
        console.log(`🎯 Interpolated local position: (${interpolatedPosition.x.toFixed(3)}, ${interpolatedPosition.y.toFixed(3)}, ${interpolatedPosition.z.toFixed(3)})`);
        
        // Transform to world space
        const worldPos = interpolatedPosition.clone();
        worldPos.applyMatrix4(shirtMesh.matrixWorld);
        
        // Add small offset along normal for better visibility
        if (interpolatedNormal.length() > 0) {
            worldPos.add(interpolatedNormal.multiplyScalar(0.001));
        }
        console.log(`🎯 World position after matrixWorld: (${worldPos.x.toFixed(3)}, ${worldPos.y.toFixed(3)}, ${worldPos.z.toFixed(3)})`);
        
        // Use interpolated normal or calculate fallback
        let normal = interpolatedNormal;
        if (normal.length() < 0.1) {
            // Fallback: calculate normal from nearby vertices
            const nearbyVertices = [];
            const maxSearchDistance = 0.1;
            for (let i = 0; i < Math.min(uvAttribute.count, 1000); i++) {
                const u = uvAttribute.getX(i);
                const v = uvAttribute.getY(i);
                const distance = Math.sqrt((u - uv.x) ** 2 + (v - uv.y) ** 2);
                if (distance < maxSearchDistance) {
                    const vertex = new THREE.Vector3(positionAttribute.getX(i), positionAttribute.getY(i), positionAttribute.getZ(i));
                    vertex.applyMatrix4(shirtMesh.matrixWorld);
                    nearbyVertices.push(vertex);
                    if (nearbyVertices.length >= 6) break;
                }
            }
            
            if (nearbyVertices.length >= 3) {
                const normals = [];
                for (let i = 0; i < nearbyVertices.length - 2; i++) {
                    const v1 = nearbyVertices[i];
                    const v2 = nearbyVertices[i + 1];
                    const v3 = nearbyVertices[i + 2];
                    const edge1 = v2.clone().sub(v1);
                    const edge2 = v3.clone().sub(v1);
                    const triangleNormal = new THREE.Vector3();
                    triangleNormal.crossVectors(edge1, edge2);
                    if (triangleNormal.length() > 0.001) {
                        triangleNormal.normalize();
                        normals.push(triangleNormal);
                    }
                }
                if (normals.length > 0) {
                    normals.forEach(n => normal.add(n));
                    normal.divideScalar(normals.length).normalize();
                }
            }
            
            if (normal.length() < 0.1) {
                // Final fallback
                if (camera) {
                    const cameraDirection = new THREE.Vector3();
                    camera.getWorldDirection(cameraDirection);
                    normal.copy(cameraDirection);
                } else {
                    normal.set(0, 0, 1);
                }
            }
        } else {
            // Transform the interpolated normal to world space
            normal.transformDirection(shirtMesh.matrixWorld);
            normal.normalize();
        }
        
        // Offset along the surface normal for better visibility
        const offsetDistance = 0.05; // Reduced offset for better accuracy
        worldPos.add(normal.multiplyScalar(offsetDistance));
        console.log(`🎯 Final world position: (${worldPos.x.toFixed(3)}, ${worldPos.y.toFixed(3)}, ${worldPos.z.toFixed(3)})`);
        return worldPos;
    }
    // Debounced rendering to prevent excessive re-renders
    const renderTimeoutRef = useRef(null);
    const anchorPointRenderTimeoutRef = useRef(null);
    // Debounced anchor point rendering to prevent excessive calls
    function debouncedRenderAnchorPoints() {
        if (anchorPointRenderTimeoutRef.current) {
            clearTimeout(anchorPointRenderTimeoutRef.current);
        }
        anchorPointRenderTimeoutRef.current = setTimeout(() => {
            renderAnchorPointsAndSelection();
        }, 100); // 100ms debounce
    }
    // Effect to handle anchor points visibility changes
    useEffect(() => {
        const appState = useApp.getState();
        if (appState.showAnchorPoints) {
            console.log('🎯 Show anchor points enabled - rendering anchor points');
            // Use debounced rendering to prevent excessive calls
            debouncedRenderAnchorPoints();
        }
        else {
            console.log('🎯 Show anchor points disabled - clearing anchor points');
            clearAnchorPointObjects();
            // Also clear the test cube
            if (modelScene) {
                const testCube = modelScene.getObjectByName('testAnchor');
                if (testCube) {
                    modelScene.remove(testCube);
                    console.log('🎯 TEST: Removed test anchor point');
                }
            }
        }
    }, [useApp(s => s.showAnchorPoints)]);
    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (anchorPointRenderTimeoutRef.current) {
                clearTimeout(anchorPointRenderTimeoutRef.current);
            }
        };
    }, []);
    // Helper function to render both vectors and anchor points
    function renderVectorsWithAnchors() {
        // Clear any pending render
        if (renderTimeoutRef.current) {
            clearTimeout(renderTimeoutRef.current);
        }
        // Debounce rendering to prevent excessive calls
        renderTimeoutRef.current = setTimeout(() => {
            // First render vectors
            renderVectorsToActiveLayer();
            // Render preview line for pen tool (only in vector mode)
            if (previewLine && vectorMode) {
                const layer = getActiveLayer();
                if (layer) {
                    const ctx = layer.canvas.getContext('2d');
                    if (ctx) {
                        ctx.save();
                        ctx.strokeStyle = '#00ff00';
                        ctx.lineWidth = 2;
                        ctx.setLineDash([5, 5]);
                        ctx.globalAlpha = 0.7;
                        ctx.beginPath();
                        ctx.moveTo(previewLine.start.x, previewLine.start.y);
                        ctx.lineTo(previewLine.end.x, previewLine.end.y);
                        ctx.stroke();
                        ctx.restore();
                    }
                }
            }
        }, 8); // Faster rendering for better responsiveness
    }
    async function hitPoint(pt, s) {
        // Use the new advanced hit detector for better accuracy
        const AdvancedHitDetector = (await import('../vector/AdvancedHitDetector')).default;
        const hitDetector = AdvancedHitDetector.getInstance();
        const hitResult = hitDetector.detectHit(pt, [s], {
            tolerance: 10,
            zoom: 1,
            showHitAreas: false,
            multiSelect: false,
            priority: 'anchor'
        });
        if (hitResult.type === 'anchor' && hitResult.target.pointIndex !== undefined) {
            return hitResult.target.pointIndex;
        }
        return null;
    }
    function hitControlHandle(pt, s) {
        for (let i = 0; i < s.path.points.length; i++) {
            const p = s.path.points[i];
            // Check control in handle
            if (p.controlIn) {
                const cx = p.x + p.controlIn.x;
                const cy = p.y + p.controlIn.y;
                const dx = pt.x - cx;
                const dy = pt.y - cy;
                if (dx * dx + dy * dy < 6 * 6)
                    return { pointIndex: i, type: 'in' };
            }
            // Check control out handle
            if (p.controlOut) {
                const cx = p.x + p.controlOut.x;
                const cy = p.y + p.controlOut.y;
                const dx = pt.x - cx;
                const dy = pt.y - cy;
                if (dx * dx + dy * dy < 6 * 6)
                    return { pointIndex: i, type: 'out' };
            }
        }
        return null;
    }
    function findPathSegment(pt, points) {
        if (points.length < 2)
            return -1;
        const threshold = 20; // Distance threshold for hitting a path segment
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            // Calculate distance from point to line segment
            const A = pt.x - p1.x;
            const B = pt.y - p1.y;
            const C = p2.x - p1.x;
            const D = p2.y - p1.y;
            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            if (lenSq === 0)
                continue; // Skip zero-length segments
            const param = dot / lenSq;
            let xx, yy;
            if (param < 0) {
                xx = p1.x;
                yy = p1.y;
            }
            else if (param > 1) {
                xx = p2.x;
                yy = p2.y;
            }
            else {
                xx = p1.x + param * C;
                yy = p1.y + param * D;
            }
            const dx = pt.x - xx;
            const dy = pt.y - yy;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= threshold) {
                return i; // Return the index of the first point of the segment
            }
        }
        return -1; // No segment found
    }
    function boundsFromPoints(pts) {
        if (!pts.length)
            return { x: 0, y: 0, width: 0, height: 0 };
        let minX = pts[0].x, minY = pts[0].y, maxX = pts[0].x, maxY = pts[0].y;
        for (const p of pts) {
            minX = Math.min(minX, p.x);
            minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x);
            maxY = Math.max(maxY, p.y);
        }
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }
    // Enhanced model loading with support for multiple formats
    useEffect(() => {
        let cancelled = false;
        setLoadingError(null);
        console.log('Model loading effect triggered:', { modelChoice, modelUrl, modelType });
        // Clear model scene when switching models
        useApp.setState({ modelScene: null });
        const loadModel = async () => {
            try {
                // Handle different model choices
                if (modelChoice === 'sphere') {
                    console.log('Loading sphere model');
                    setGeometry(new THREE.SphereGeometry(0.8, 64, 64));
                    // Clear model scene for basic shapes
                    useApp.setState({ modelScene: null });
                    return;
                }
                if (modelChoice === 'tshirt') {
                    console.log('Loading t-shirt model');
                    // Load default t-shirt
                    const urls = [DEFAULT_MODEL, ...DEFAULT_FALLBACK_URLS.filter(u => u !== DEFAULT_MODEL)];
                    await loadGLTFModel(urls);
                    return;
                }
                // Load custom model from URL
                if (modelChoice === 'custom' && modelUrl) {
                    console.log('Loading custom model:', { modelUrl, modelType });
                    if (modelType) {
                        const ext = modelType.toLowerCase();
                        console.log('Using modelType:', ext);
                        if (ext === '.glb' || ext === '.gltf') {
                            await loadGLTFModel([modelUrl]);
                        }
                        else if (ext === '.obj') {
                            await loadOBJModel(modelUrl);
                        }
                        else if (ext === '.fbx') {
                            await loadFBXModel(modelUrl);
                        }
                        else if (ext === '.dae') {
                            await loadColladaModel(modelUrl);
                        }
                        else if (ext === '.ply') {
                            await loadPLYModel(modelUrl);
                        }
                        else {
                            throw new Error(`Unsupported file format: ${ext}`);
                        }
                    }
                    else {
                        // Fallback: try to extract extension from URL
                        const ext = modelUrl.split('.').pop()?.toLowerCase();
                        console.log('Extracted extension from URL:', ext);
                        if (ext === 'glb' || ext === 'gltf') {
                            await loadGLTFModel([modelUrl]);
                        }
                        else if (ext === 'obj') {
                            await loadOBJModel(modelUrl);
                        }
                        else if (ext === 'fbx') {
                            await loadFBXModel(modelUrl);
                        }
                        else if (ext === 'dae') {
                            await loadColladaModel(modelUrl);
                        }
                        else if (ext === 'ply') {
                            await loadPLYModel(modelUrl);
                        }
                        else {
                            throw new Error(`Unsupported file format: ${ext}`);
                        }
                    }
                }
                else {
                    console.log('No custom model specified, loading default t-shirt');
                    // Fallback to default t-shirt if no model specified
                    const urls = [DEFAULT_MODEL, ...DEFAULT_FALLBACK_URLS.filter(u => u !== DEFAULT_MODEL)];
                    await loadGLTFModel(urls);
                }
            }
            catch (error) {
                console.error('Model loading error:', error);
                setLoadingError(error instanceof Error ? error.message : 'Failed to load model');
                // Fallback to sphere
                setGeometry(new THREE.SphereGeometry(0.8, 64, 64));
            }
        };
        loadModel();
        return () => {
            cancelled = true;
        };
    }, [modelUrl, modelChoice, modelType]);
    // GLTF/GLB loader
    const loadGLTFModel = async (urls) => {
        console.log('Loading GLTF model from URLs:', urls);
        const loader = new GLTFLoader();
        loader.setCrossOrigin('anonymous');
        for (const url of urls) {
            try {
                console.log('Attempting to load:', url);
                const gltf = await new Promise((resolve, reject) => {
                    loader.load(url, resolve, undefined, reject);
                });
                console.log('GLTF loaded successfully:', gltf);
                let foundGeom = null;
                gltf.scene.traverse((child) => {
                    if (!foundGeom && child.isMesh && child.geometry) {
                        foundGeom = child.geometry;
                        console.log('Found geometry:', foundGeom);
                    }
                });
                if (foundGeom) {
                    console.log('Setting geometry:', foundGeom);
                    setGeometry(foundGeom);
                    // Store the complete GLTF scene for proper rendering
                    // This preserves all materials, textures, normal maps, etc.
                    console.log('Shirt: Setting modelScene in store:', !!gltf.scene);
                    useApp.setState({
                        modelScene: gltf.scene
                    });
                    console.log('Shirt: modelScene set, current store state:', {
                        modelScene: !!useApp.getState().modelScene,
                        composedCanvas: !!useApp.getState().composedCanvas
                    });
                    // Auto-generate base layer for custom models
                    if (modelChoice === 'custom') {
                        // Wait for the scene to be fully set up and canvas to be initialized
                        setTimeout(() => {
                            const { composedCanvas } = useApp.getState();
                            if (composedCanvas) {
                                useApp.getState().generateBaseLayer();
                            }
                            else {
                                // If canvas not ready, wait a bit more
                                setTimeout(() => {
                                    useApp.getState().generateBaseLayer();
                                }, 500);
                            }
                        }, 200);
                    }
                    computeModelBounds(gltf.scene);
                    // Auto-scale the model if it's too small or too large
                    const box = new THREE.Box3().setFromObject(gltf.scene);
                    const size = box.getSize(new THREE.Vector3());
                    const maxDimension = Math.max(size.x, size.y, size.z);
                    const minDimension = Math.min(size.x, size.y, size.z);
                    console.log('Model dimensions:', size, 'max dimension:', maxDimension, 'min dimension:', minDimension);
                    // If model is smaller than 0.5 units or larger than 5 units, auto-scale it
                    if (maxDimension < 0.5) {
                        const scale = 0.5 / maxDimension;
                        console.log('Model too small, scaling by:', scale);
                        useApp.getState().setModelScale(scale);
                    }
                    else if (maxDimension > 5) {
                        const scale = 5 / maxDimension;
                        console.log('Model too large, scaling by:', scale);
                        useApp.getState().setModelScale(scale);
                    }
                    else {
                        console.log('Model size is reasonable, setting scale to 1');
                        useApp.getState().setModelScale(1);
                    }
                    // Store the minimum dimension for better zoom control
                    useApp.setState({ modelMinDimension: minDimension });
                    return;
                }
                else {
                    console.warn('No geometry found in GLTF');
                }
            }
            catch (error) {
                console.warn(`Failed to load ${url}:`, error);
                continue;
            }
        }
        throw new Error('All GLTF URLs failed to load');
    };
    // OBJ loader
    const loadOBJModel = async (url) => {
        const loader = new OBJLoader();
        const object = await new Promise((resolve, reject) => {
            loader.load(url, resolve, undefined, reject);
        });
        // Find the first geometry and texture in the object
        let foundGeom = null;
        let modelTexture = null;
        object.traverse((child) => {
            if (!foundGeom && child.isMesh && child.geometry) {
                foundGeom = child.geometry;
            }
            if (!modelTexture && child.isMesh && child.material) {
                if (child.material.map) {
                    modelTexture = child.material.map;
                }
            }
        });
        if (foundGeom) {
            setGeometry(foundGeom);
            // Store the complete OBJ object for proper rendering
            // This preserves all materials, textures, normal maps, etc.
            console.log('Shirt: Setting modelScene (OBJ) in store:', !!object);
            useApp.setState({
                modelScene: object
            });
            console.log('Shirt: modelScene (OBJ) set, current store state:', {
                modelScene: !!useApp.getState().modelScene,
                composedCanvas: !!useApp.getState().composedCanvas
            });
            computeModelBounds(object);
        }
        else {
            throw new Error('No geometry found in OBJ file');
        }
    };
    // FBX loader
    const loadFBXModel = async (url) => {
        const loader = new FBXLoader();
        const object = await new Promise((resolve, reject) => {
            loader.load(url, resolve, undefined, reject);
        });
        let foundGeom = null;
        let modelTexture = null;
        object.traverse((child) => {
            if (!foundGeom && child.isMesh && child.geometry) {
                foundGeom = child.geometry;
            }
            if (!modelTexture && child.isMesh && child.material) {
                if (child.material.map) {
                    modelTexture = child.material.map;
                }
            }
        });
        if (foundGeom) {
            setGeometry(foundGeom);
            // Store the complete FBX object for proper rendering
            // This preserves all materials, textures, normal maps, etc.
            useApp.setState({
                modelScene: object
            });
            computeModelBounds(object);
        }
        else {
            throw new Error('No geometry found in FBX file');
        }
    };
    // Collada loader
    const loadColladaModel = async (url) => {
        const loader = new ColladaLoader();
        const collada = await new Promise((resolve, reject) => {
            loader.load(url, resolve, undefined, reject);
        });
        let foundGeom = null;
        let modelTexture = null;
        collada.scene.traverse((child) => {
            if (!foundGeom && child.isMesh && child.geometry) {
                foundGeom = child.geometry;
            }
            if (!modelTexture && child.isMesh && child.material) {
                if (child.material.map) {
                    modelTexture = child.material.map;
                }
            }
        });
        if (foundGeom) {
            setGeometry(foundGeom);
            // Store the complete Collada scene for proper rendering
            // This preserves all materials, textures, normal maps, etc.
            useApp.setState({
                modelScene: collada.scene
            });
            computeModelBounds(collada.scene);
        }
        else {
            throw new Error('No geometry found in Collada file');
        }
    };
    // PLY loader
    const loadPLYModel = async (url) => {
        const loader = new PLYLoader();
        const geometry = await new Promise((resolve, reject) => {
            loader.load(url, resolve, undefined, reject);
        });
        if (geometry) {
            setGeometry(geometry);
            // For PLY, we need to create a temporary object to compute bounds
            const tempMesh = new THREE.Mesh(geometry);
            computeModelBounds(tempMesh);
            // Note: PLY files typically don't contain textures, so we'll use the fallback
        }
        else {
            throw new Error('Failed to load PLY geometry');
        }
    };
    // Compute model bounds and set camera framing
    const computeModelBounds = (object) => {
        console.log('Computing bounds for object:', object);
        const box = new THREE.Box3().setFromObject(object);
        const center = new THREE.Vector3();
        box.getCenter(center);
        const size = box.getSize(new THREE.Vector3());
        const sphere = new THREE.Sphere();
        box.getBoundingSphere(sphere);
        console.log('Model bounds:', {
            box: { min: box.min, max: box.max },
            center: center,
            size: size,
            sphere: { center: sphere.center, radius: sphere.radius }
        });
        const height = size.y;
        const target = [center.x, center.y, center.z];
        // Compute consistent camera distance based on FOV and aspect
        const persp = camera;
        const aspect = persp?.aspect || (viewportSize.width / viewportSize.height);
        const fovY = (persp?.fov || 45) * Math.PI / 180;
        const fovX = 2 * Math.atan(Math.tan(fovY / 2) * aspect);
        const distanceY = (size.y * 0.5) / Math.tan(Math.max(0.001, fovY / 2));
        const distanceX = (size.x * 0.5) / Math.tan(Math.max(0.001, fovX / 2));
        const distance = Math.max(distanceX, distanceY) + sphere.radius * 0.6;
        console.log('Camera framing:', { target, distance, height });
        useApp.getState().setFrame(target, distance);
        useApp.getState().setModelBoundsHeight(height);
        // Also reset model transform to center it
        useApp.getState().resetModelTransform();
    };
    const fabricPreset = useApp(s => s.fabricPreset);
    const material = useMemo(() => new THREE.MeshPhysicalMaterial({
        metalness: 0.0,
        roughness: 0.5,
        clearcoat: 0.1,
        sheen: 0.8,
        sheenRoughness: 0.4,
        // Ensure textures are always visible
        transparent: false,
        opacity: 1.0,
        // Better lighting response
        envMapIntensity: 1.5,
        reflectivity: 0.8,
        // Proper material properties for clothing
        side: THREE.DoubleSide,
        // Better environment response
        envMap: null, // Will be set by Environment component
        // Ensure proper color space
        color: new THREE.Color(0xffffff)
    }), []);
    // Material will get its texture from the useEffect that applies texture to modelScene
    // This ensures the composed texture (base + paint) is always applied
    // Adjust for fabric preset with better lighting
    if (fabricPreset === 'silk') {
        material.roughness = 0.2;
        material.sheenRoughness = 0.15;
        material.metalness = 0.0;
        material.clearcoat = 0.3;
    }
    if (fabricPreset === 'cotton') {
        material.roughness = 0.6;
        material.sheenRoughness = 0.4;
        material.clearcoat = 0.1;
    }
    if (fabricPreset === 'polyester') {
        material.roughness = 0.4;
        material.sheenRoughness = 0.2;
        material.clearcoat = 0.2;
    }
    if (fabricPreset === 'denim') {
        material.roughness = 0.8;
        material.sheenRoughness = 0.6;
        material.clearcoat = 0.0;
    }
    if (fabricPreset === 'wool') {
        material.roughness = 0.85;
        material.sheenRoughness = 0.7;
        material.clearcoat = 0.0;
    }
    // Listen for vector settings changes
    useEffect(() => {
        const handleVectorSettingsChanged = () => {
            renderVectorsWithAnchors();
            composeLayers(); // Redraw the entire composed canvas
        };
        const handleClearActiveLayer = () => {
            console.log('🧹 Clearing active layer...');
            // First, clear the vector store completely
            vectorStore.setAll({
                shapes: [],
                selected: [],
                currentPath: null
            });
            // Then clear the active layer and redraw everything
            const layer = getActiveLayer();
            if (layer && layer.canvas) {
                const ctx = layer.canvas.getContext('2d');
                if (ctx) {
                    // Clear the active layer completely
                    ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
                    // Get layers from app state
                    const appState = useApp.getState();
                    const allLayers = appState.layers;
                    // Redraw the base layer content to the active layer
                    const baseLayer = allLayers.find(l => l.id === 'base');
                    if (baseLayer && baseLayer.canvas) {
                        ctx.drawImage(baseLayer.canvas, 0, 0);
                    }
                    // Redraw all other layers except the current one and base
                    allLayers.forEach(l => {
                        if (l.id !== layer.id && l.id !== 'base' && l.canvas) {
                            ctx.globalCompositeOperation = l.lockTransparent ? 'source-atop' : 'source-over';
                            ctx.drawImage(l.canvas, 0, 0);
                        }
                    });
                    console.log('🧹 Active layer cleared and redrawn');
                    composeLayers();
                }
            }
        };
        window.addEventListener('vectorSettingsChanged', handleVectorSettingsChanged);
        window.addEventListener('clearActiveLayer', handleClearActiveLayer);
        return () => {
            window.removeEventListener('vectorSettingsChanged', handleVectorSettingsChanged);
            window.removeEventListener('clearActiveLayer', handleClearActiveLayer);
        };
    }, [composeLayers]);
    if (!geometry)
        return null;
    // Debug logging (reduced to prevent spam)
    if (!geometry || !material) {
        console.log('Rendering mesh with:', {
            geometry: geometry ? 'loaded' : 'null',
            material: material ? 'loaded' : 'null'
        });
    }
    return (_jsxs(_Fragment, { children: [modelScene ? (_jsx("group", { onPointerDown: onPointerDown, onPointerMove: onPointerMove, onPointerOver: onPointerOver, onPointerUp: onPointerUp, onPointerLeave: onPointerLeave, children: _jsx("primitive", { object: modelScene, castShadow: true, receiveShadow: true }) })) : (
            /* Fallback to geometry-based rendering for basic shapes */
            _jsx("mesh", { ref: meshRef, geometry: geometry, material: material, castShadow: true, receiveShadow: true, onPointerDown: onPointerDown, onPointerMove: onPointerMove, onPointerOver: onPointerOver, onPointerUp: onPointerUp, onPointerLeave: onPointerLeave })), loadingError && (_jsx(Html, { position: [0, 0, 0], center: true, children: _jsxs("div", { style: {
                        background: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        padding: '10px',
                        borderRadius: '5px',
                        fontSize: '12px',
                        maxWidth: '200px',
                        textAlign: 'center'
                    }, children: ["Model loading error: ", loadingError] }) }))] }));
    // Embroidery functions
    function startEmbroidery(e) {
        const uv = e.uv;
        if (!uv)
            return;
        e.stopPropagation(); // Prevent model rotation
        setControlsEnabled(false); // Disable camera controls
        console.log('Starting embroidery at UV:', uv.x, uv.y);
        // Dispatch custom event for embroidery start
        const embroideryStartEvent = new CustomEvent('embroideryStart', {
            detail: { u: uv.x, v: 1 - uv.y }
        });
        window.dispatchEvent(embroideryStartEvent);
        paintingActiveRef.current = true;
    }
    function moveEmbroidery(e) {
        if (!paintingActiveRef.current)
            return;
        const uv = e.uv;
        if (!uv)
            return;
        e.stopPropagation(); // Prevent model rotation
        console.log('Moving embroidery at UV:', uv.x, uv.y);
        // Dispatch custom event for embroidery move
        const embroideryMoveEvent = new CustomEvent('embroideryMove', {
            detail: { u: uv.x, v: 1 - uv.y }
        });
        window.dispatchEvent(embroideryMoveEvent);
    }
}
