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

const DEFAULT_MODEL = '/models/shirt.glb';
const DEFAULT_FALLBACK_URLS = [
  '/models/shirt.glb',
  (import.meta as any).env?.VITE_DEFAULT_MODEL_URL || '',
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
  const snapshot = useApp(s => s.snapshot);
  const commit = useApp(s => s.commit);
  const setState = useApp.setState;
  const setCursorAngle = useApp(s => s.setCursorAngle);
  const composedVersion = useApp(s => (s as any).composedVersion || 0);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const setControlsEnabled = useApp(s => s.setControlsEnabled);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Store original materials to restore them when needed
  const originalMaterialsRef = useRef<Map<THREE.Mesh, THREE.Material | THREE.Material[]>>(new Map());
  
  // Create a custom material that always uses our texture
  const customMaterial = useMemo(() => {
    if (!texture) return null;
    return new THREE.MeshStandardMaterial({ 
      map: texture, 
      transparent: true,
      alphaTest: 0.1
    });
  }, [texture]);
  const paintingActiveRef = useRef(false);
  const vectorDragRef = useRef<{ mode: 'point'|'bounds'|null; shapeId?: string; index?: number; startX?: number; startY?: number; startBounds?: {x:number;y:number;width:number;height:number} } | null>(null);
  const shapeStartRef = useRef<{x:number;y:number}|null>(null);
  const shapeBeforeRef = useRef<ImageData|null>(null);
  const { invalidate, camera, size: viewportSize } = useThree();
  const raycasterRef = useRef(new THREE.Raycaster());
  const decals = useApp((s:any)=> s.decals || []);
  const activeDecalId = useApp((s:any)=> s.activeDecalId || null);
  const updateDecal = (useApp.getState() as any).updateDecal;
  const selectDecal = (useApp.getState() as any).selectDecal;
  const setActiveLayerId = (id: string | null) => useApp.setState({ activeLayerId: id as any });
  function getOrSelectActiveLayer() {
    const layer = getActiveLayer();
    if (layer) return layer;
    const layersList = useApp.getState().layers as any[];
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
    if (!composedCanvas) return;
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
    if (!modelScene) return;
    
    console.log('Storing original materials for model scene');
    originalMaterialsRef.current.clear();
    
    modelScene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        // Store the original material
        originalMaterialsRef.current.set(child, child.material);
        console.log('Stored original material for mesh:', child.name || 'unnamed');
      }
    });
  }, [modelScene]);

  // Apply texture to model materials whenever texture changes
  useEffect(() => {
    if (!texture || !modelScene) return;

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
    modelScene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        console.log('Found mesh:', child.name || 'unnamed', 'with material:', child.material);
        if (Array.isArray(child.material)) {
          // Handle multiple materials
          child.material.forEach((mat: any) => {
            mat.map = texture;
            mat.needsUpdate = true;
            // Ensure proper material properties for texture rendering
            mat.transparent = false;
            mat.opacity = 1.0;
            mat.side = THREE.DoubleSide;
            appliedCount++;
            console.log('Applied texture to material in array:', mat);
          });
        } else {
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
      (useApp.getState() as any).setHoveredTextId(null);
      document.body.style.cursor = 'default';
    }
  }, [activeTool]);

  // Clear text hover state when text elements change
  useEffect(() => {
    const textElements = useApp.getState().textElements;
    const hoveredTextId = useApp.getState().hoveredTextId;
    
    // If the hovered text no longer exists, clear the hover state
    if (hoveredTextId && !textElements.find(t => t.id === hoveredTextId)) {
      (useApp.getState() as any).setHoveredTextId(null);
      document.body.style.cursor = 'default';
    }
  }, [useApp.getState().textElements]);

  // Force texture recreation when composed canvas changes significantly
  useEffect(() => {
    if (!composedCanvas) return;
    
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
    const onKey = (ev: KeyboardEvent) => {
      if (useApp.getState().activeTool !== 'vectorTools') return;
      if (ev.key.toLowerCase() === 'p') (vectorStore as any).set('tool', 'pen');
      if (ev.key.toLowerCase() === 'v') (vectorStore as any).set('tool', 'pathSelection');
      if (ev.key.toLowerCase() === 'c') (vectorStore as any).set('tool', 'convertAnchor');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onPointerDown = (e: any) => {
    console.log('Shirt: onPointerDown called with activeTool:', activeTool);
    if (activeTool === 'vectorTools') {
      const uv = e.uv as THREE.Vector2 | undefined; 
      let layer = getOrSelectActiveLayer();
      if (!uv || !layer) return;
      const canvas = layer.canvas;
      const x = Math.floor(uv.x * canvas.width); 
      const y = Math.floor(uv.y * canvas.height);
      const st = vectorStore.getState();
      const tool = st.tool;
      // prevent camera controls and other handlers
      e.stopPropagation();
      try { (e.target as any)?.setPointerCapture?.(e.pointerId); } catch {}
      setControlsEnabled(false);
      // Pen tool
      if (tool === 'pen') {
        if (!st.currentPath) {
          const newPath = { id: `path_${Date.now()}`, points: [{ x, y, type: 'corner' as const }], closed: false, fill: true, stroke: true, fillColor: useApp.getState().brushColor, strokeColor: useApp.getState().brushColor, strokeWidth: Math.max(1, Math.round(useApp.getState().brushSize)) };
          vectorStore.set('currentPath', newPath);
        } else {
          const cp = { ...st.currentPath, points: [...st.currentPath.points, { x, y, type: 'corner' as const }] };
          vectorStore.set('currentPath', cp);
        }
        paintingActiveRef.current = true;
        renderVectorsToActiveLayer();
        return;
      }
      // Selection
      if (tool === 'pathSelection' || tool === 'convertAnchor') {
        const clicked = [...st.shapes].reverse().find(s => x>=s.bounds.x && x<=s.bounds.x+s.bounds.width && y>=s.bounds.y && y<=s.bounds.y+s.bounds.height);
        if (clicked) {
          vectorStore.set('selected', [clicked.id]);
          // convert anchor toggles point type on click
          if (tool === 'convertAnchor') {
            const idx = hitPoint({x,y}, clicked);
            if (idx !== null) {
              const shapesUpd = st.shapes.map(s => {
                if (s.id !== clicked.id) return s;
                const pts = [...s.path.points];
                const cur = pts[idx];
                const nextType = cur.type === 'corner' ? 'smooth' : cur.type === 'smooth' ? 'symmetric' : 'corner';
                let controlIn = cur.controlIn; let controlOut = cur.controlOut;
                if (nextType === 'corner') { controlIn = undefined; controlOut = undefined; }
                if (nextType === 'smooth' || nextType === 'symmetric') {
                  controlIn = controlIn || { x: -20, y: 0 }; controlOut = controlOut || { x: 20, y: 0 };
                }
                pts[idx] = { ...cur, type: nextType, controlIn, controlOut } as any;
                const path = { ...s.path, points: pts };
                return { ...s, path, bounds: boundsFromPoints(pts) } as any;
              });
              vectorStore.set('shapes', shapesUpd);
            }
            return;
          }
          // selection drag: point or bounds
          const idx = hitPoint({x,y}, clicked);
          if (idx !== null) {
            vectorDragRef.current = { mode: 'point', shapeId: clicked.id, index: idx };
          } else {
            vectorDragRef.current = { mode: 'bounds', shapeId: clicked.id, startX: x, startY: y, startBounds: { ...clicked.bounds } };
          }
          renderVectorsToActiveLayer();
        } else {
          vectorStore.set('selected', []);
        }
        paintingActiveRef.current = true;
        return;
      }
    }
    if (activeTool === 'undo') { useApp.getState().undo(); return; }
    if (activeTool === 'redo') { useApp.getState().redo(); return; }
    if (activeTool === 'picker') { sampleColor(e); return; }
    if (activeTool === 'fill') { floodAtEvent(e); return; }
    if (activeTool === 'smudge') { startSmudge(e); return; }
    if (activeTool === 'blur') { startBlur(e); return; }
    if (activeTool === 'embroidery') { startEmbroidery(e); return; }
    // selection system removed
    if ((activeTool === 'transform' || activeTool === 'move') && activeDecalId) { startTransformDecal(e); return; }
    // Text dragging
    if ((activeTool === 'transform' || activeTool === 'move' || activeTool === 'moveText') && (useApp.getState() as any).activeTextId) { 
      startTransformText(e); 
      return; 
    }
    

    
    // Vector/shape tools: line/rect/ellipse/gradient/text
    if (['line','rect','ellipse','gradient','text'].includes(activeTool as any)) {
      console.log('Shape tool activated:', activeTool);
      const uv = e.uv as THREE.Vector2 | undefined; 
      const layer = getActiveLayer();
      if (!uv || !layer) {
        console.log('Missing UV or layer for shape tool');
        return;
      }
      const canvas = layer.canvas; 
      const ctx = canvas.getContext('2d')!;
      const x = Math.floor(uv.x * canvas.width); 
      const y = Math.floor(uv.y * canvas.height);
      
      console.log('Shape tool coordinates:', { x, y, uv: uv.toArray() });
      
      snapshot();
              if (activeTool === 'text') {
          const defaultTxt = (useApp.getState() as any).lastText || '';
          const txt = window.prompt('Text', defaultTxt);
          if (!txt) return;
          (useApp.setState as any)({ lastText: txt });
          
          try {
            console.log('Adding text element:', txt);
            // Use the new text element system instead of drawing directly
            const textUV = { u: uv.x, v: uv.y }; // Use UV coordinates directly without flipping
            (useApp.getState() as any).addTextElement(txt, textUV, getActiveLayer()?.id);
            
            // Force a recomposition to update the model
            setTimeout(() => {
              console.log('Forcing recomposition after text placement');
              (useApp.getState() as any).composeLayers();
              setControlsEnabled(true);
              console.log('Controls re-enabled after text placement');
            }, 50);
          } catch (error) {
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
        (e.target as any)?.setPointerCapture?.(e.pointerId); 
      } catch (err) {
        console.log('Pointer capture failed:', err);
      }
      paintingActiveRef.current = true;
      return;
    }
    if (activeTool !== 'brush' && activeTool !== 'eraser' && activeTool !== 'puffPrint') return;
    e.stopPropagation();
    snapshot();
    paintAtEvent(e);
    e.target.setPointerCapture(e.pointerId);
    setControlsEnabled(false);
    paintingActiveRef.current = true;
    console.log('Shirt: Set paintingActiveRef to true for tool:', activeTool);
  };
  const onDoubleClick = (e:any) => {
    if (activeTool !== 'vectorTools') return;
    const uv = e.uv as THREE.Vector2 | undefined; const layer = getActiveLayer(); if (!uv || !layer) return;
    const st = vectorStore.getState();
    if (st.tool === 'pen' && st.currentPath && st.currentPath.points.length >= 3) {
      const path = { ...st.currentPath, closed: true } as any;
      const b = boundsFromPoints(path.points as any);
      const shape = { id: `shape_${Date.now()}`, type: 'path' as const, path, bounds: b };
      vectorStore.setAll({ currentPath: null, shapes: [...st.shapes, shape], selected: [shape.id] });
      renderVectorsToActiveLayer();
    }
  };



  function handleSelect(e:any){
    if (!composedCanvas) { selectDecal && selectDecal(null); return; }
    const uv = e.uv as THREE.Vector2 | undefined; if (!uv) return;
    const u = uv.x, v = uv.y;
    const texW = composedCanvas.width; const texH = composedCanvas.height;
    
    // Check text elements first (top-most)
    const { textElements } = useApp.getState();
    for (let i = textElements.length - 1; i >= 0; i--) {
      const textEl = textElements[i];
      const cx = textEl.u, cy = textEl.v;
      // Estimate text bounds based on font size
      const halfW = (textEl.fontSize * textEl.text.length * 0.6) / texW / 2;
      const halfH = textEl.fontSize / texH / 2;
      const dx = u - cx; const dy = v - cy;
      if (Math.abs(dx) <= halfW && Math.abs(dy) <= halfH) {
        console.log('Text selected via click:', textEl.text);
        (useApp.getState() as any).selectTextElement(textEl.id);
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
      const dx = u - cx; const dy = v - cy;
      const cos = Math.cos(-d.rotation), sin = Math.sin(-d.rotation);
      const lx = dx * cos - dy * sin;
      const ly = dx * sin + dy * cos;
      if (Math.abs(lx) <= halfW && Math.abs(ly) <= halfH) {
        selectDecal && selectDecal(d.id);
        (useApp.getState() as any).selectTextElement(null);
        setActiveLayerId(d.layerId);
        return;
      }
    }
    // If no decal, pick the topmost painted layer by alpha at UV
    const layers = useApp.getState().layers;
    const x = Math.floor(u * texW), y = Math.floor(v * texH);
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i]; if (!layer.visible) continue;
      const ctx = layer.canvas.getContext('2d')!;
      const a = ctx.getImageData(x, y, 1, 1).data[3];
      if (a > 0) { setActiveLayerId(layer.id); selectDecal && selectDecal(null); (useApp.getState() as any).selectTextElement(null); return; }
    }
    // Nothing hit
    selectDecal && selectDecal(null);
    (useApp.getState() as any).selectTextElement(null);
  }
  const onPointerMove = (e: any) => {
    console.log('Shirt: onPointerMove called with activeTool:', activeTool, 'paintingActive:', paintingActiveRef.current, 'buttons:', e.buttons);
    if (activeTool === 'vectorTools') {
      if (!e.buttons) return;
      const uv = e.uv as THREE.Vector2 | undefined; const layer = getActiveLayer();
      if (!uv || !layer) return;
      const canvas = layer.canvas; const x = Math.floor(uv.x * canvas.width); const y = Math.floor(uv.y * canvas.height);
      const drag = vectorDragRef.current; if (!drag) return;
      const st = vectorStore.getState();
      if (drag.mode === 'point' && drag.shapeId != null && drag.index != null) {
        const shapesUpd = st.shapes.map(s => {
          if (s.id !== drag.shapeId) return s;
          const pts = [...s.path.points]; pts[drag.index!] = { ...pts[drag.index!], x, y } as any;
          const path = { ...s.path, points: pts };
          return { ...s, path, bounds: boundsFromPoints(pts) } as any;
        });
        vectorStore.set('shapes', shapesUpd);
        renderVectorsToActiveLayer();
      } else if (drag.mode === 'bounds' && drag.shapeId && drag.startBounds) {
        const dx = x - (drag.startX || x); const dy = y - (drag.startY || y);
        const sb = drag.startBounds;
        const scaleX = (sb.width + dx) / Math.max(1, sb.width);
        const scaleY = (sb.height + dy) / Math.max(1, sb.height);
        const cx = sb.x; const cy = sb.y;
        const shapesUpd = st.shapes.map(s => {
          if (s.id !== drag.shapeId) return s;
          const pts = s.path.points.map(p => ({ ...p, x: cx + (p.x - cx) * scaleX, y: cy + (p.y - cy) * scaleY }));
          const path = { ...s.path, points: pts };
          return { ...s, path, bounds: boundsFromPoints(pts) } as any;
        });
        vectorStore.set('shapes', shapesUpd);
        renderVectorsToActiveLayer();
      }
      return;
    }
    const isShapeDrag = paintingActiveRef.current && shapeStartRef.current && ['line','rect','ellipse','gradient'].includes(activeTool as any);
    if (!isShapeDrag && !e.buttons) return;
    // lasso removed
    // Shape preview path
    if (paintingActiveRef.current && shapeStartRef.current && ['line','rect','ellipse','gradient'].includes(activeTool as any)) {
      const uv = e.uv as THREE.Vector2 | undefined; const layer = getActiveLayer();
      if (!uv || !layer) return;
      const canvas = layer.canvas; const ctx = canvas.getContext('2d')!;
      const sx = shapeStartRef.current.x, sy = shapeStartRef.current.y;
      const x = Math.floor(uv.x * canvas.width); const y = Math.floor(uv.y * canvas.height);
      if (shapeBeforeRef.current) ctx.putImageData(shapeBeforeRef.current, 0, 0);
      ctx.save();
      if (layer.lockTransparent && activeTool !== 'gradient') ctx.globalCompositeOperation = 'source-atop';
      ctx.globalAlpha = brushOpacity;
      const shapeMode = (useApp.getState() as any).shapeMode || 'fill';
      const strokeW = (useApp.getState() as any).shapeStrokeWidth || Math.max(1, brushSize);
      ctx.strokeStyle = brushColor; ctx.fillStyle = brushColor; ctx.lineWidth = strokeW;
      if (activeTool === 'line') {
        ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(x, y);
        if (shapeMode !== 'fill') ctx.stroke();
      } else if (activeTool === 'rect') {
        ctx.beginPath(); ctx.rect(Math.min(sx,x), Math.min(sy,y), Math.abs(x-sx), Math.abs(y-sy));
        if (shapeMode !== 'stroke') ctx.fill();
        if (shapeMode !== 'fill') ctx.stroke();
      } else if (activeTool === 'ellipse') {
        ctx.beginPath();
        ctx.ellipse((sx+x)/2, (sy+y)/2, Math.abs(x-sx)/2, Math.abs(y-sy)/2, 0, 0, Math.PI*2);
        if (shapeMode !== 'stroke') ctx.fill();
        if (shapeMode !== 'fill') ctx.stroke();
      } else if (activeTool === 'gradient') {
        const grd = ctx.createLinearGradient(sx, sy, x, y);
        grd.addColorStop(0, brushColor);
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        const rx = Math.min(sx,x), ry = Math.min(sy,y), rw = Math.abs(x-sx), rh = Math.abs(y-sy);
        ctx.fillRect(rx, ry, rw, rh);
      }
      ctx.restore();
      composeLayers(); if (texture) { texture.needsUpdate = true; invalidate(); }
      return;
    }
    if (!paintingActiveRef.current) return; // do not paint if drag started outside the mesh
    if (activeTool === 'smudge') { moveSmudge(e); return; }
    if (activeTool === 'blur') { moveBlur(e); return; }
    if (activeTool === 'embroidery') { moveEmbroidery(e); return; }
    if ((activeTool === 'transform' || activeTool === 'move') && activeDecalId) { moveTransformDecal(e); return; }
    if ((activeTool === 'transform' || activeTool === 'move' || activeTool === 'moveText') && (useApp.getState() as any).activeTextId) { moveTransformText(e); return; }
    if (activeTool !== 'brush' && activeTool !== 'eraser' && activeTool !== 'puffPrint') return;
    e.stopPropagation();
    paintAtEvent(e);
  };
  const onPointerOver = (e: any) => {
    const uv = e.uv as THREE.Vector2 | undefined;
    if (uv) useApp.getState().setLastHitUV({ u: uv.x, v: 1 - uv.y });
    if (activeTool === 'vectorTools') {
      document.body.style.cursor = 'crosshair';
    }
  };
  const onPointerUp = () => {
    if (shapeStartRef.current) {
      commit();
      shapeStartRef.current = null; shapeBeforeRef.current = null;
    }
    if (activeTool === 'vectorTools') {
      vectorDragRef.current = null;
      paintingActiveRef.current = false;
      renderVectorsToActiveLayer();
      setControlsEnabled(true);
      return;
    }
    // lasso removed
    if (activeTool === 'brush' || activeTool === 'eraser' || activeTool === 'puffPrint' || activeTool === 'smudge' || activeTool === 'blur' || activeTool === 'embroidery' || activeTool === 'transform' || activeTool === 'move') commit();
    
    // Dispatch embroidery end event
    if (activeTool === 'embroidery') {
      const embroideryEndEvent = new CustomEvent('embroideryEnd');
      window.dispatchEvent(embroideryEndEvent);
    }
    
    setControlsEnabled(true);
    paintingActiveRef.current = false;
    
    // Clear text selection if clicking outside
    if (!shapeStartRef.current && !paintingActiveRef.current) {
      (useApp.getState() as any).selectTextElement(null);
    }
  };
  const onPointerLeave = () => { 
    paintingActiveRef.current = false; 
    setControlsEnabled(true);
    document.body.style.cursor = 'default';
  };

  let lastX = -1, lastY = -1;
  const paintAtEvent = (e: any) => {
    console.log('Shirt: paintAtEvent called with activeTool:', activeTool);
    const uv = e.uv as THREE.Vector2 | undefined;
    const layer = getActiveLayer();
    if (!uv || !layer) {
      console.log('Shirt: paintAtEvent - missing UV or layer');
      return;
    }
    
    // Handle puff print painting
    if (activeTool === 'puffPrint') {
      console.log('Dispatching puff paint event:', { u: uv.x, v: 1 - uv.y });
      // Dispatch custom event for puff print painting
      const puffPaintEvent = new CustomEvent('puffPaint', {
        detail: {
          uv: { u: uv.x, v: 1 - uv.y },
          pressure: (e as PointerEvent).pressure ?? 1
        }
      });
      document.dispatchEvent(puffPaintEvent);
      return;
    }

    
    // Handle puff print erasing - always dispatch for eraser tool
    if (activeTool === 'eraser') {
      console.log('Shirt: Dispatching puff erase event:', { u: uv.x, v: 1 - uv.y, pressure: (e as PointerEvent).pressure ?? 1 });
      // Dispatch custom event for puff print erasing
      const puffEraseEvent = new CustomEvent('puffErase', {
        detail: {
          uv: { u: uv.x, v: 1 - uv.y },
          pressure: (e as PointerEvent).pressure ?? 1
        }
      });
      document.dispatchEvent(puffEraseEvent);
      console.log('Shirt: Puff erase event dispatched');
      // Don't return here - let it also handle regular erasing for non-puff areas
    }
    
    const canvas = layer.canvas;
    const ctx = canvas.getContext('2d')!;
    const pressure = (e as PointerEvent).pressure ?? 1;
    const size = Math.max(1, Math.round(brushSize * (usePressureSize ? (0.2 + 0.8 * pressure) : 1)));
    const alpha = brushOpacity * (usePressureOpacity ? (0.2 + 0.8 * pressure) : 1);
    const x = Math.floor(uv.x * canvas.width);
    const y = Math.floor(uv.y * canvas.height);

    ctx.globalCompositeOperation = activeTool === 'eraser' ? 'destination-out' : (getActiveLayer()?.lockTransparent ? 'source-atop' : blendMode);
    ctx.globalAlpha = alpha * brushFlow;
    ctx.fillStyle = brushColor;

    const spacingPx = Math.max(1, Math.round(size * brushSpacing));
    const drawStamp = (px: number, py: number, angleRad?: number) => {
      if (brushShape === 'square') {
        ctx.fillRect(px - size / 2, py - size / 2, size, size);
      } else if (brushShape === 'airbrush') {
        const radius = size / 2;
        const grd = ctx.createRadialGradient(px, py, 0, px, py, radius);
        grd.addColorStop(0, withAlpha(brushColor, brushHardness));
        grd.addColorStop(1, withAlpha(brushColor, 0));
        const prev = ctx.globalCompositeOperation;
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(px, py, radius, 0, Math.PI * 2); ctx.fill();
        ctx.globalCompositeOperation = prev;
      } else if (brushShape === 'calligraphy') {
        const a = angleRad ?? 0;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(a);
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.7, size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.beginPath(); ctx.arc(px, py, size / 2, 0, Math.PI * 2); ctx.fill();
      }
    };

    if (lastX < 0) {
      drawStamp(x, y);
      lastX = x; lastY = y;
    } else {
      const dx = x - lastX; const dy = y - lastY;
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
        lastX = x; lastY = y;
      }
    }

    // World-plane symmetry using mirrored raycasts only
    const applyMirrored = (normal: THREE.Vector3) => {
      if (!meshRef.current) return;
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
        const muv = hits[0].uv as THREE.Vector2;
        const mx = Math.floor(muv.x * canvas.width);
        const my = Math.floor(muv.y * canvas.height);
        drawStamp(mx, my);
      }
    };

    if (useApp.getState().symmetryX) applyMirrored(new THREE.Vector3(1, 0, 0));
    if (symmetryY) applyMirrored(new THREE.Vector3(0, 1, 0));
    if (useApp.getState().symmetryZ) applyMirrored(new THREE.Vector3(0, 0, 1));
    composeLayers();
    if (texture) { texture.needsUpdate = true; invalidate(); }
  };

  // Smudge tool: simple neighborhood average move
  function startSmudge(e: any) {
    paintingActiveRef.current = true;
    snapshot();
    moveSmudge(e);
  }
  function moveSmudge(e: any) {
    const uv = e.uv as THREE.Vector2 | undefined;
    const layer = getActiveLayer();
    if (!uv || !layer) return;
    const canvas = layer.canvas; const ctx = canvas.getContext('2d')!;
    const x = Math.floor(uv.x * canvas.width); const y = Math.floor(uv.y * canvas.height);
    const r = Math.max(2, Math.round(brushSize / 2));
    const img = ctx.getImageData(x - r, y - r, r * 2, r * 2);
    const d = img.data; let ar=0,ag=0,ab=0,aa=0, n=0;
    for (let i=0;i<d.length;i+=4){ar+=d[i];ag+=d[i+1];ab+=d[i+2];aa+=d[i+3];n++;}
    const mr=ar/n, mg=ag/n, mb=ab/n, ma=aa/n;
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = `rgba(${mr},${mg},${mb},${ma/255})`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
    composeLayers(); if (texture) { texture.needsUpdate = true; invalidate(); }
  }

  // Blur tool: stack blur small kernel
  function startBlur(e: any) { paintingActiveRef.current = true; snapshot(); moveBlur(e); }
  function moveBlur(e: any) {
    const uv = e.uv as THREE.Vector2 | undefined;
    const layer = getActiveLayer();
    if (!uv || !layer) return;
    const canvas = layer.canvas; const ctx = canvas.getContext('2d')!;
    const x = Math.floor(uv.x * canvas.width); const y = Math.floor(uv.y * canvas.height);
    const r = Math.max(2, Math.round(brushSize / 2));
    const w = r*2, h = r*2;
    const img = ctx.getImageData(x - r, y - r, w, h);
    const d = img.data; const kernel = [1,2,1,2,4,2,1,2,1];
    const out = new Uint8ClampedArray(d.length);
    for (let yy=1; yy<h-1; yy++){
      for (let xx=1; xx<w-1; xx++){
        let sr=0,sg=0,sb=0,sa=0, si=0;
        let ki=0;
        for (let ky=-1; ky<=1; ky++){
          for (let kx=-1; kx<=1; kx++){
            const i = ((yy+ky)*w + (xx+kx))*4;
            const k = kernel[ki++];
            sr += d[i]*k; sg += d[i+1]*k; sb += d[i+2]*k; sa += d[i+3]*k;
            si += k;
          }
        }
        const oi = (yy*w + xx)*4;
        out[oi]=sr/si; out[oi+1]=sg/si; out[oi+2]=sb/si; out[oi+3]=sa/si;
      }
    }
    for (let i=0;i<d.length;i++) d[i]=out[i]||d[i];
    ctx.putImageData(img, x - r, y - r);
    composeLayers(); if (texture) { texture.needsUpdate = true; invalidate(); }
  }

  // Transform Decal: drag to move, shift drag to scale, alt drag to rotate
  function startTransformDecal(e:any){ paintingActiveRef.current = true; snapshot(); moveTransformDecal(e); }
  function moveTransformDecal(e:any){
    if (!activeDecalId) return;
    const uv = e.uv as THREE.Vector2 | undefined; if (!uv) return;
    const d = decals.find((x:any)=> x.id===activeDecalId); if (!d) return;
    const isShift = (e as PointerEvent).shiftKey; const isAlt = (e as PointerEvent).altKey;
    if (isAlt) {
      const angle = Math.atan2((e as any).movementY||0, (e as any).movementX||1);
      updateDecal(activeDecalId, { rotation: d.rotation + angle });
    } else if (isShift) {
      const delta = ((e as any).movementX || 0) * 0.005;
      updateDecal(activeDecalId, { scale: Math.max(0.05, d.scale + delta) });
    } else {
      updateDecal(activeDecalId, { u: uv.x, v: 1-uv.y });
    }
    composeLayers(); if (texture) { texture.needsUpdate = true; invalidate(); }
  }

  // Transform Text: drag to move, shift drag to scale font size, alt drag to rotate
  function startTransformText(e:any){ paintingActiveRef.current = true; snapshot(); moveTransformText(e); }
  function moveTransformText(e:any){
    const activeTextId = (useApp.getState() as any).activeTextId;
    if (!activeTextId) return;
    const uv = e.uv as THREE.Vector2 | undefined; if (!uv) return;
    const { textElements } = useApp.getState();
    const textEl = textElements.find((x:any)=> x.id===activeTextId); 
    if (!textEl) return;
    
    const isShift = (e as PointerEvent).shiftKey; 
    const isAlt = (e as PointerEvent).altKey;
    
    if (isAlt) {
      const angle = Math.atan2((e as any).movementY||0, (e as any).movementX||1);
      (useApp.getState() as any).updateTextElement(activeTextId, { rotation: textEl.rotation + angle });
    } else if (isShift) {
      const delta = ((e as any).movementX || 0) * 2;
      const newSize = Math.max(8, Math.min(256, textEl.fontSize + delta));
      (useApp.getState() as any).updateTextElement(activeTextId, { fontSize: newSize });
    } else {
      (useApp.getState() as any).updateTextElement(activeTextId, { u: uv.x, v: 1-uv.y });
    }
    composeLayers(); 
    if (texture) { texture.needsUpdate = true; invalidate(); }
  }

  function withAlpha(hex: string, a: number) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return `rgba(255,255,255,${a})`;
    const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  // Lasso selection writes to selectionMask
  // lasso and wand removed per request

  const sampleColor = (e: any) => {
    const uv = e.uv as THREE.Vector2 | undefined;
    if (!uv || !composedCanvas) return;
    const canvas = composedCanvas;
    const ctx = canvas.getContext('2d')!;
    const x = Math.floor(uv.x * canvas.width);
    const y = Math.floor(uv.y * canvas.height);
    const data = ctx.getImageData(x, y, 1, 1).data;
    const hex = `#${[data[0], data[1], data[2]].map(v => v.toString(16).padStart(2, '0')).join('')}`;
    setState({ brushColor: hex, activeTool: 'brush' });
  };

  const floodAtEvent = (e: any) => {
    const uv = e.uv as THREE.Vector2 | undefined;
    const layer = getActiveLayer();
    if (!uv || !layer) return;
    const canvas = layer.canvas;
    const ctx = canvas.getContext('2d')!;
    const x = Math.floor(uv.x * canvas.width);
    const y = Math.floor(uv.y * canvas.height);
    snapshot();
    floodFill(ctx, x, y, brushColor, 24);
    composeLayers();
    if (texture) { texture.needsUpdate = true; invalidate(); }
    commit();
  };

  function floodFill(ctx: CanvasRenderingContext2D, sx: number, sy: number, fillStyle: string, tol: number) {
    const { width, height } = ctx.canvas;
    const img = ctx.getImageData(0, 0, width, height);
    const data = img.data;
    const idx = (x: number, y: number) => (y * width + x) * 4;
    const start = idx(sx, sy);
    const sr = data[start], sg = data[start + 1], sb = data[start + 2], sa = data[start + 3];
    const stack: number[] = [sx, sy];
    const visited = new Uint8Array(width * height);
    const [fr, fg, fb, fa] = hexToRgba(fillStyle, Math.round(brushOpacity * 255));
    while (stack.length) {
      const y = stack.pop()!; const x = stack.pop()!;
      if (x < 0 || y < 0 || x >= width || y >= height) continue;
      const i = idx(x, y);
      if (visited[(y * width + x)]) continue; visited[(y * width + x)] = 1;
      const dr = data[i] - sr; const dg = data[i + 1] - sg; const db = data[i + 2] - sb; const da = data[i + 3] - sa;
      if (Math.abs(dr) + Math.abs(dg) + Math.abs(db) + Math.abs(da) > tol) continue;
      data[i] = fr; data[i + 1] = fg; data[i + 2] = fb; data[i + 3] = fa;
      stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
    }
    ctx.putImageData(img, 0, 0);
  }

  function hexToRgba(hex: string, alpha: number): [number, number, number, number] {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)!;
    return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16), alpha];
  }

  // ===== Vector helper functions (3D editing) =====
  function drawBezier2D(ctx: CanvasRenderingContext2D, points: any[]) {
    if (points.length < 2) return;
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
      } else {
        ctx.lineTo(current.x, current.y);
      }
    }
  }

  function renderVectorsToActiveLayer() {
    const layer = getActiveLayer();
    if (!layer) return;
    const canvas = layer.canvas; const ctx = canvas.getContext('2d')!;
    const st = vectorStore.getState();
    // For now we draw vectors as committed strokes/fills directly to the active layer
    // Future: draw to a dedicated vector layer for non-destructive editing
    ctx.save();
    ctx.globalCompositeOperation = layer.lockTransparent ? 'source-atop' : 'source-over';
    // Draw existing shapes
    st.shapes.forEach((shape:any) => {
      if (!shape?.path) return;
      const p = shape.path;
      ctx.lineWidth = p.strokeWidth || 1;
      ctx.strokeStyle = p.strokeColor || '#000';
      ctx.fillStyle = p.fillColor || '#000';
      drawBezier2D(ctx, p.points);
      if (p.fill) ctx.fill();
      if (p.stroke) ctx.stroke();
    });
    // Draw current path as preview/commit
    if (st.currentPath && st.currentPath.points.length) {
      const p = st.currentPath;
      ctx.lineWidth = p.strokeWidth || 1;
      ctx.strokeStyle = p.strokeColor || '#000';
      ctx.fillStyle = p.fillColor || '#000';
      drawBezier2D(ctx, p.points);
      if (p.fill) ctx.fill();
      if (p.stroke) ctx.stroke();
    }
    ctx.restore();
    composeLayers();
    if (texture) { texture.needsUpdate = true; invalidate(); }
  }
  function hitPoint(pt: { x: number; y: number }, s: any): number | null {
    for (let i = 0; i < s.path.points.length; i++) {
      const p = s.path.points[i];
      const dx = pt.x - p.x;
      const dy = pt.y - p.y;
      if (dx * dx + dy * dy < 8 * 8) return i;
    }
    return null;
  }

  function boundsFromPoints(pts: { x: number; y: number }[]) {
    if (!pts.length) return { x: 0, y: 0, width: 0, height: 0 };
    let minX = pts[0].x, minY = pts[0].y, maxX = pts[0].x, maxY = pts[0].y;
    for (const p of pts) {
      minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
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
            } else if (ext === '.obj') {
              await loadOBJModel(modelUrl);
            } else if (ext === '.fbx') {
              await loadFBXModel(modelUrl);
            } else if (ext === '.dae') {
              await loadColladaModel(modelUrl);
            } else if (ext === '.ply') {
              await loadPLYModel(modelUrl);
            } else {
              throw new Error(`Unsupported file format: ${ext}`);
            }
          } else {
            // Fallback: try to extract extension from URL
            const ext = modelUrl.split('.').pop()?.toLowerCase();
            console.log('Extracted extension from URL:', ext);
            
            if (ext === 'glb' || ext === 'gltf') {
              await loadGLTFModel([modelUrl]);
            } else if (ext === 'obj') {
              await loadOBJModel(modelUrl);
            } else if (ext === 'fbx') {
              await loadFBXModel(modelUrl);
            } else if (ext === 'dae') {
              await loadColladaModel(modelUrl);
            } else if (ext === 'ply') {
              await loadPLYModel(modelUrl);
            } else {
              throw new Error(`Unsupported file format: ${ext}`);
            }
          }
        } else {
          console.log('No custom model specified, loading default t-shirt');
          // Fallback to default t-shirt if no model specified
          const urls = [DEFAULT_MODEL, ...DEFAULT_FALLBACK_URLS.filter(u => u !== DEFAULT_MODEL)];
          await loadGLTFModel(urls);
        }
      } catch (error) {
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
  const loadGLTFModel = async (urls: string[]) => {
    console.log('Loading GLTF model from URLs:', urls);
    const loader = new GLTFLoader();
    loader.setCrossOrigin('anonymous');
    
    for (const url of urls) {
      try {
        console.log('Attempting to load:', url);
        const gltf = await new Promise<any>((resolve, reject) => {
          loader.load(url, resolve, undefined, reject);
        });
        
        console.log('GLTF loaded successfully:', gltf);
        let foundGeom: THREE.BufferGeometry | null = null;
        gltf.scene.traverse((child: any) => {
          if (!foundGeom && child.isMesh && child.geometry) {
            foundGeom = child.geometry as THREE.BufferGeometry;
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
              } else {
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
          } else if (maxDimension > 5) {
            const scale = 5 / maxDimension;
            console.log('Model too large, scaling by:', scale);
            useApp.getState().setModelScale(scale);
          } else {
            console.log('Model size is reasonable, setting scale to 1');
            useApp.getState().setModelScale(1);
          }
          
          // Store the minimum dimension for better zoom control
          useApp.setState({ modelMinDimension: minDimension });
          
          return;
        } else {
          console.warn('No geometry found in GLTF');
        }
      } catch (error) {
        console.warn(`Failed to load ${url}:`, error);
        continue;
      }
    }
    
    throw new Error('All GLTF URLs failed to load');
  };

  // OBJ loader
  const loadOBJModel = async (url: string) => {
    const loader = new OBJLoader();
    const object = await new Promise<any>((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
    
    // Find the first geometry and texture in the object
    let foundGeom: THREE.BufferGeometry | null = null;
    let modelTexture: THREE.Texture | null = null;
    
    object.traverse((child: any) => {
      if (!foundGeom && child.isMesh && child.geometry) {
        foundGeom = child.geometry as THREE.BufferGeometry;
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
    } else {
      throw new Error('No geometry found in OBJ file');
    }
  };

  // FBX loader
  const loadFBXModel = async (url: string) => {
    const loader = new FBXLoader();
    const object = await new Promise<any>((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
    
    let foundGeom: THREE.BufferGeometry | null = null;
    let modelTexture: THREE.Texture | null = null;
    
    object.traverse((child: any) => {
      if (!foundGeom && child.isMesh && child.geometry) {
        foundGeom = child.geometry as THREE.BufferGeometry;
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
    } else {
      throw new Error('No geometry found in FBX file');
    }
  };

  // Collada loader
  const loadColladaModel = async (url: string) => {
    const loader = new ColladaLoader();
    const collada = await new Promise<any>((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
    
    let foundGeom: THREE.BufferGeometry | null = null;
    let modelTexture: THREE.Texture | null = null;
    
    collada.scene.traverse((child: any) => {
      if (!foundGeom && child.isMesh && child.geometry) {
        foundGeom = child.geometry as THREE.BufferGeometry;
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
    } else {
      throw new Error('No geometry found in Collada file');
    }
  };

  // PLY loader
  const loadPLYModel = async (url: string) => {
    const loader = new PLYLoader();
    const geometry = await new Promise<THREE.BufferGeometry>((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
    
    if (geometry) {
      setGeometry(geometry);
      // For PLY, we need to create a temporary object to compute bounds
      const tempMesh = new THREE.Mesh(geometry);
      computeModelBounds(tempMesh);
      
      // Note: PLY files typically don't contain textures, so we'll use the fallback
    } else {
      throw new Error('Failed to load PLY geometry');
    }
  };

  // Compute model bounds and set camera framing
  const computeModelBounds = (object: THREE.Object3D) => {
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
    const target: [number, number, number] = [center.x, center.y, center.z];
    
    // Compute consistent camera distance based on FOV and aspect
    const persp = camera as any;
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
    (material as any).sheenRoughness = 0.15; 
    material.metalness = 0.0; 
    material.clearcoat = 0.3;
  }
  if (fabricPreset === 'cotton') { 
    material.roughness = 0.6; 
    (material as any).sheenRoughness = 0.4; 
    material.clearcoat = 0.1;
  }
  if (fabricPreset === 'polyester') { 
    material.roughness = 0.4; 
    (material as any).sheenRoughness = 0.2; 
    material.clearcoat = 0.2;
  }
  if (fabricPreset === 'denim') { 
    material.roughness = 0.8; 
    (material as any).sheenRoughness = 0.6; 
    material.clearcoat = 0.0;
  }
  if (fabricPreset === 'wool') { 
    material.roughness = 0.85; 
    (material as any).sheenRoughness = 0.7; 
    material.clearcoat = 0.0;
  }
  
  if (!geometry) return null;

  // Debug logging (reduced to prevent spam)
  if (!geometry || !material) {
    console.log('Rendering mesh with:', {
      geometry: geometry ? 'loaded' : 'null',
      material: material ? 'loaded' : 'null'
    });
  }

  return (
    <>
      {/* Render the complete model scene if available */}
      {modelScene ? (
        <group
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerOver={onPointerOver}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerLeave}
          >
          <primitive 
            object={modelScene} 
            castShadow 
            receiveShadow
          />
        </group>
      ) : (
        /* Fallback to geometry-based rendering for basic shapes */
        <mesh ref={meshRef} geometry={geometry} material={material} castShadow receiveShadow
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerOver={onPointerOver}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerLeave}
        />
      )}
      
      {loadingError && (
        <Html position={[0, 0, 0]} center>
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            maxWidth: '200px',
            textAlign: 'center'
          }}>
            Model loading error: {loadingError}
          </div>
        </Html>
      )}
    </>
  );

  // Embroidery functions
  function startEmbroidery(e: any) {
    const uv = e.uv as THREE.Vector2 | undefined;
    if (!uv) return;
    
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

  function moveEmbroidery(e: any) {
    if (!paintingActiveRef.current) return;
    
    const uv = e.uv as THREE.Vector2 | undefined;
    if (!uv) return;
    
    e.stopPropagation(); // Prevent model rotation
    
    console.log('Moving embroidery at UV:', uv.x, uv.y);
    
    // Dispatch custom event for embroidery move
    const embroideryMoveEvent = new CustomEvent('embroideryMove', {
      detail: { u: uv.x, v: 1 - uv.y }
    });
    window.dispatchEvent(embroideryMoveEvent);
  }
}


