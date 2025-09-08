import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../App';

interface LayerEffectsProps {
  active: boolean;
}

interface EffectSettings {
  id: string;
  name: string;
  enabled: boolean;
  opacity: number;
  blendMode: GlobalCompositeOperation;
  parameters: Record<string, any>;
}

interface ShadowEffect {
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
}

interface GlowEffect {
  color: string;
  size: number;
  opacity: number;
  quality: number;
}

interface BevelEffect {
  depth: number;
  size: number;
  soften: number;
  angle: number;
  altitude: number;
  highlightColor: string;
  shadowColor: string;
  highlightOpacity: number;
  shadowOpacity: number;
}

interface EmbossEffect {
  depth: number;
  size: number;
  soften: number;
  angle: number;
  altitude: number;
  highlightColor: string;
  shadowColor: string;
  highlightOpacity: number;
  shadowOpacity: number;
}

interface GradientEffect {
  type: 'linear' | 'radial' | 'conic';
  angle: number;
  stops: Array<{ color: string; position: number }>;
  opacity: number;
}

export function LayerEffects({ active }: LayerEffectsProps) {
  // Console log removed

  const {
    composedCanvas,
    activeTool,
    brushColor,
    brushSize,
    layers,
    activeLayerId,
    commit
  } = useApp();

  // Effects state
  const [effects, setEffects] = useState<EffectSettings[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewCanvas, setPreviewCanvas] = useState<HTMLCanvasElement | null>(null);
  const [originalCanvas, setOriginalCanvas] = useState<HTMLCanvasElement | null>(null);

  // Shadow effect state
  const [shadowEffect, setShadowEffect] = useState<ShadowEffect>({
    offsetX: 5,
    offsetY: 5,
    blur: 10,
    spread: 0,
    color: '#000000',
    opacity: 0.5
  });

  // Glow effect state
  const [glowEffect, setGlowEffect] = useState<GlowEffect>({
    color: '#FFFFFF',
    size: 20,
    opacity: 0.8,
    quality: 3
  });

  // Bevel effect state
  const [bevelEffect, setBevelEffect] = useState<BevelEffect>({
    depth: 100,
    size: 5,
    soften: 0,
    angle: 135,
    altitude: 30,
    highlightColor: '#FFFFFF',
    shadowColor: '#000000',
    highlightOpacity: 0.75,
    shadowOpacity: 0.75
  });

  // Emboss effect state
  const [embossEffect, setEmbossEffect] = useState<EmbossEffect>({
    depth: 100,
    size: 5,
    soften: 0,
    angle: 135,
    altitude: 30,
    highlightColor: '#FFFFFF',
    shadowColor: '#000000',
    highlightOpacity: 0.75,
    shadowOpacity: 0.75
  });

  // Gradient effect state
  const [gradientEffect, setGradientEffect] = useState<GradientEffect>({
    type: 'linear',
    angle: 0,
    stops: [
      { color: '#FF0000', position: 0 },
      { color: '#0000FF', position: 1 }
    ],
    opacity: 1
  });

  // Refs
  const effectsCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize effects canvas
  useEffect(() => {
    if (!active || !composedCanvas) {
      // Console log removed
      return;
    }

    console.log('✨ LayerEffects: Initializing effects canvas', {
      composedCanvasSize: `${composedCanvas.width}x${composedCanvas.height}`
    });

    // Create effects canvas
    const effectsCanvas = document.createElement('canvas');
    effectsCanvas.width = composedCanvas.width;
    effectsCanvas.height = composedCanvas.height;
    effectsCanvasRef.current = effectsCanvas;

    // Create preview canvas
    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = composedCanvas.width;
    previewCanvas.height = composedCanvas.height;
    setPreviewCanvas(previewCanvas);

    // Store original canvas
    const originalCanvas = document.createElement('canvas');
    originalCanvas.width = composedCanvas.width;
    originalCanvas.height = composedCanvas.height;
    const originalCtx = originalCanvas.getContext('2d')!;
    originalCtx.drawImage(composedCanvas, 0, 0);
    setOriginalCanvas(originalCanvas);

    // Console log removed
  }, [active, composedCanvas]);

  // Apply shadow effect
  const applyShadowEffect = useCallback((canvas: HTMLCanvasElement, settings: ShadowEffect) => {
    // Console log removed

    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const shadowData = ctx.createImageData(canvas.width, canvas.height);

    // Create shadow by offsetting and blurring the original image
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const shadowX = x + settings.offsetX;
        const shadowY = y + settings.offsetY;

        if (shadowX >= 0 && shadowX < canvas.width && shadowY >= 0 && shadowY < canvas.height) {
          const originalIndex = (y * canvas.width + x) * 4;
          const shadowIndex = (shadowY * canvas.width + shadowX) * 4;

          // Copy alpha channel to shadow
          shadowData.data[shadowIndex] = 0; // R
          shadowData.data[shadowIndex + 1] = 0; // G
          shadowData.data[shadowIndex + 2] = 0; // B
          shadowData.data[shadowIndex + 3] = imageData.data[originalIndex + 3] * settings.opacity; // A
        }
      }
    }

    // Apply blur to shadow
    if (settings.blur > 0) {
      applyBlur(shadowData, settings.blur);
    }

    // Apply shadow color
    const shadowColor = hexToRgb(settings.color);
    for (let i = 0; i < shadowData.data.length; i += 4) {
      if (shadowData.data[i + 3] > 0) {
        shadowData.data[i] = shadowColor.r;
        shadowData.data[i + 1] = shadowColor.g;
        shadowData.data[i + 2] = shadowColor.b;
      }
    }

    return shadowData;
  }, []);

  // Apply glow effect
  const applyGlowEffect = useCallback((canvas: HTMLCanvasElement, settings: GlowEffect) => {
    // Console log removed

    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const glowData = ctx.createImageData(canvas.width, canvas.height);

    // Create glow by blurring the alpha channel
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const index = (y * canvas.width + x) * 4;
        glowData.data[index] = 0; // R
        glowData.data[index + 1] = 0; // G
        glowData.data[index + 2] = 0; // B
        glowData.data[index + 3] = imageData.data[index + 3]; // A
      }
    }

    // Apply blur to create glow
    if (settings.size > 0) {
      applyBlur(glowData, settings.size);
    }

    // Apply glow color
    const glowColor = hexToRgb(settings.color);
    for (let i = 0; i < glowData.data.length; i += 4) {
      if (glowData.data[i + 3] > 0) {
        glowData.data[i] = glowColor.r;
        glowData.data[i + 1] = glowColor.g;
        glowData.data[i + 2] = glowColor.b;
        glowData.data[i + 3] *= settings.opacity;
      }
    }

    return glowData;
  }, []);

  // Apply bevel effect
  const applyBevelEffect = useCallback((canvas: HTMLCanvasElement, settings: BevelEffect) => {
    // Console log removed

    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const bevelData = ctx.createImageData(canvas.width, canvas.height);

    // Calculate light direction
    const lightX = Math.cos(settings.angle * Math.PI / 180);
    const lightY = Math.sin(settings.angle * Math.PI / 180);
    const lightZ = Math.sin(settings.altitude * Math.PI / 180);

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const index = (y * canvas.width + x) * 4;
        
        if (imageData.data[index + 3] > 0) {
          // Calculate normal vector (simplified)
          const normalX = (x / canvas.width) * 2 - 1;
          const normalY = (y / canvas.height) * 2 - 1;
          const normalZ = Math.sqrt(1 - normalX * normalX - normalY * normalY);

          // Calculate lighting
          const dotProduct = normalX * lightX + normalY * lightY + normalZ * lightZ;
          const intensity = Math.max(0, dotProduct);

          // Apply highlight or shadow
          if (intensity > 0.5) {
            // Highlight
            const highlightColor = hexToRgb(settings.highlightColor);
            bevelData.data[index] = highlightColor.r;
            bevelData.data[index + 1] = highlightColor.g;
            bevelData.data[index + 2] = highlightColor.b;
            bevelData.data[index + 3] = settings.highlightOpacity * 255;
          } else {
            // Shadow
            const shadowColor = hexToRgb(settings.shadowColor);
            bevelData.data[index] = shadowColor.r;
            bevelData.data[index + 1] = shadowColor.g;
            bevelData.data[index + 2] = shadowColor.b;
            bevelData.data[index + 3] = settings.shadowOpacity * 255;
          }
        }
      }
    }

    return bevelData;
  }, []);

  // Apply emboss effect
  const applyEmbossEffect = useCallback((canvas: HTMLCanvasElement, settings: EmbossEffect) => {
    // Console log removed

    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const embossData = ctx.createImageData(canvas.width, canvas.height);

    // Apply emboss filter (simplified)
    for (let y = 1; y < canvas.height - 1; y++) {
      for (let x = 1; x < canvas.width - 1; x++) {
        const index = (y * canvas.width + x) * 4;
        
        if (imageData.data[index + 3] > 0) {
          // Get surrounding pixels
          const topLeft = (y - 1) * canvas.width + (x - 1);
          const topRight = (y - 1) * canvas.width + (x + 1);
          const bottomLeft = (y + 1) * canvas.width + (x - 1);
          const bottomRight = (y + 1) * canvas.width + (x + 1);

          // Calculate emboss value
          const embossValue = 
            imageData.data[topLeft * 4] - imageData.data[bottomRight * 4] +
            imageData.data[topRight * 4] - imageData.data[bottomLeft * 4];

          // Apply emboss
          const value = Math.max(0, Math.min(255, 128 + embossValue));
          embossData.data[index] = value;
          embossData.data[index + 1] = value;
          embossData.data[index + 2] = value;
          embossData.data[index + 3] = imageData.data[index + 3];
        }
      }
    }

    return embossData;
  }, []);

  // Apply gradient effect
  const applyGradientEffect = useCallback((canvas: HTMLCanvasElement, settings: GradientEffect) => {
    // Console log removed

    const ctx = canvas.getContext('2d')!;
    const gradientData = ctx.createImageData(canvas.width, canvas.height);

    // Create gradient
    let gradient: CanvasGradient;
    
    if (settings.type === 'linear') {
      const angleRad = settings.angle * Math.PI / 180;
      const x1 = canvas.width / 2 - Math.cos(angleRad) * canvas.width / 2;
      const y1 = canvas.height / 2 - Math.sin(angleRad) * canvas.height / 2;
      const x2 = canvas.width / 2 + Math.cos(angleRad) * canvas.width / 2;
      const y2 = canvas.height / 2 + Math.sin(angleRad) * canvas.height / 2;
      
      gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    } else if (settings.type === 'radial') {
      gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
      );
    } else {
      gradient = ctx.createConicGradient(settings.angle * Math.PI / 180, canvas.width / 2, canvas.height / 2);
    }

    // Add gradient stops
    settings.stops.forEach(stop => {
      gradient.addColorStop(stop.position, stop.color);
    });

    // Apply gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Apply opacity
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i + 3] *= settings.opacity;
    }

    return imageData;
  }, []);

  // Apply blur effect
  const applyBlur = useCallback((imageData: ImageData, radius: number) => {
    // Console log removed

    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const tempData = new Uint8ClampedArray(data);

    // Box blur implementation
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0, count = 0;

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const index = (ny * width + nx) * 4;
              r += tempData[index];
              g += tempData[index + 1];
              b += tempData[index + 2];
              a += tempData[index + 3];
              count++;
            }
          }
        }

        const index = (y * width + x) * 4;
        data[index] = r / count;
        data[index + 1] = g / count;
        data[index + 2] = b / count;
        data[index + 3] = a / count;
      }
    }
  }, []);

  // Convert hex to RGB
  const hexToRgb = useCallback((hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }, []);

  // Render effects preview
  const renderEffectsPreview = useCallback(() => {
    if (!previewCanvas || !originalCanvas || !effectsCanvasRef.current) {
      // Console log removed
      return;
    }

    // Console log removed

    const previewCtx = previewCanvas.getContext('2d')!;
    const effectsCtx = effectsCanvasRef.current.getContext('2d')!;

    // Clear canvases
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    effectsCtx.clearRect(0, 0, effectsCanvasRef.current.width, effectsCanvasRef.current.height);

    // Draw original image
    effectsCtx.drawImage(originalCanvas, 0, 0);

    // Apply effects in order
    effects.forEach(effect => {
      if (!effect.enabled) return;

      // Console log removed

      switch (effect.name) {
        case 'shadow':
          const shadowData = applyShadowEffect(effectsCanvasRef.current, shadowEffect);
          effectsCtx.putImageData(shadowData, 0, 0);
          break;
        case 'glow':
          const glowData = applyGlowEffect(effectsCanvasRef.current, glowEffect);
          effectsCtx.putImageData(glowData, 0, 0);
          break;
        case 'bevel':
          const bevelData = applyBevelEffect(effectsCanvasRef.current, bevelEffect);
          effectsCtx.putImageData(bevelData, 0, 0);
          break;
        case 'emboss':
          const embossData = applyEmbossEffect(effectsCanvasRef.current, embossEffect);
          effectsCtx.putImageData(embossData, 0, 0);
          break;
        case 'gradient':
          const gradientData = applyGradientEffect(effectsCanvasRef.current, gradientEffect);
          effectsCtx.putImageData(gradientData, 0, 0);
          break;
      }
    });

    // Draw final result to preview
    previewCtx.drawImage(effectsCanvasRef.current, 0, 0);

    // Console log removed
  }, [previewCanvas, originalCanvas, effects, shadowEffect, glowEffect, bevelEffect, embossEffect, gradientEffect, applyShadowEffect, applyGlowEffect, applyBevelEffect, applyEmbossEffect, applyGradientEffect]);

  // Add effect
  const addEffect = useCallback((effectName: string) => {
    // Console log removed

    const newEffect: EffectSettings = {
      id: `effect_${Date.now()}`,
      name: effectName,
      enabled: true,
      opacity: 1,
      blendMode: 'normal',
      parameters: {}
    };

    setEffects(prev => [...prev, newEffect]);
    // Console log removed
  }, []);

  // Remove effect
  const removeEffect = useCallback((effectId: string) => {
    // Console log removed

    setEffects(prev => prev.filter(e => e.id !== effectId));
    // Console log removed
  }, []);

  // Toggle effect
  const toggleEffect = useCallback((effectId: string) => {
    // Console log removed

    setEffects(prev => prev.map(e => 
      e.id === effectId ? { ...e, enabled: !e.enabled } : e
    ));
    // Console log removed
  }, []);

  // Apply effects to design
  const applyEffectsToDesign = useCallback(() => {
    if (!previewCanvas || !composedCanvas || !commit) {
      // Console log removed
      return;
    }

    // Console log removed

    // Draw effects to composed canvas
    const composedCtx = composedCanvas.getContext('2d')!;
    composedCtx.clearRect(0, 0, composedCanvas.width, composedCanvas.height);
    composedCtx.drawImage(previewCanvas, 0, 0);

    // Commit changes
    commit();

    // Console log removed
  }, [previewCanvas, composedCanvas, commit]);

  // Render effects when they change
  useEffect(() => {
    if (isPreviewMode) {
      renderEffectsPreview();
    }
  }, [isPreviewMode, renderEffectsPreview, effects, shadowEffect, glowEffect, bevelEffect, embossEffect, gradientEffect]);

  if (!active) {
    // Console log removed
    return null;
  }

  console.log('✨ LayerEffects: Rendering component', { 
    effectsCount: effects.length,
    isPreviewMode
  });

  return (
    <div className="layer-effects" style={{
      border: '2px solid #EC4899',
      borderRadius: '8px',
      padding: '12px',
      background: 'rgba(236, 72, 153, 0.1)',
      boxShadow: '0 0 10px rgba(236, 72, 153, 0.3)',
      marginTop: '12px'
    }}>
      <div className="effects-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <h4 style={{ margin: 0, color: '#EC4899', fontSize: '16px' }}>
          ✨ Layer Effects
        </h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            style={{
              background: isPreviewMode ? '#EC4899' : '#6B7280',
              color: 'white',
              fontSize: '12px',
              padding: '6px 12px'
            }}
          >
            {isPreviewMode ? 'Exit Preview' : 'Preview'}
          </button>
          <button
            className="btn"
            onClick={applyEffectsToDesign}
            disabled={effects.length === 0}
            style={{
              background: effects.length > 0 ? '#10B981' : '#6B7280',
              color: 'white',
              fontSize: '12px',
              padding: '6px 12px'
            }}
          >
            Apply
          </button>
          <button
            className="btn"
            onClick={() => useApp.getState().setTool('brush')}
            style={{
              background: '#6B7280',
              color: 'white',
              fontSize: '12px',
              padding: '6px 12px'
            }}
            title="Close Layer Effects"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Effects List */}
      <div className="effects-list" style={{
        marginBottom: '12px'
      }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#EC4899', marginBottom: '8px' }}>
          Active Effects ({effects.length})
        </div>
        {effects.map(effect => (
          <div
            key={effect.id}
            style={{
              padding: '8px',
              marginBottom: '4px',
              background: 'rgba(236, 72, 153, 0.1)',
              borderRadius: '4px',
              border: '1px solid rgba(236, 72, 153, 0.3)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={effect.enabled}
                onChange={() => toggleEffect(effect.id)}
              />
              <span style={{ fontSize: '11px', color: '#EC4899', textTransform: 'capitalize' }}>
                {effect.name}
              </span>
            </div>
            <button
              className="btn"
              onClick={() => removeEffect(effect.id)}
              style={{
                background: '#EF4444',
                color: 'white',
                fontSize: '10px',
                padding: '2px 6px'
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Add Effects */}
      <div className="add-effects" style={{
        marginBottom: '12px'
      }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#EC4899', marginBottom: '8px' }}>
          Add Effects
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px'
        }}>
          {[
            { name: 'shadow', label: 'Drop Shadow', icon: '🌑' },
            { name: 'glow', label: 'Glow', icon: '💫' },
            { name: 'bevel', label: 'Bevel', icon: '🔲' },
            { name: 'emboss', label: 'Emboss', icon: '🔳' },
            { name: 'gradient', label: 'Gradient', icon: '🌈' }
          ].map(effect => (
            <button
              key={effect.name}
              className="btn"
              onClick={() => addEffect(effect.name)}
              style={{
                fontSize: '10px',
                padding: '8px 4px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span style={{ fontSize: '16px' }}>{effect.icon}</span>
              <span>{effect.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Shadow Settings */}
      {effects.some(e => e.name === 'shadow') && (
        <div className="shadow-settings" style={{
          marginBottom: '12px',
          padding: '8px',
          background: 'rgba(236, 72, 153, 0.1)',
          borderRadius: '4px'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#EC4899', marginBottom: '8px' }}>
            Shadow Settings
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px'
          }}>
            <div>
              <label style={{ fontSize: '10px', color: '#EC4899' }}>
                Offset X: {shadowEffect.offsetX}px
              </label>
              <input
                type="range"
                min="-50"
                max="50"
                value={shadowEffect.offsetX}
                onChange={(e) => setShadowEffect(prev => ({ ...prev, offsetX: parseInt(e.target.value) }))}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#EC4899' }}>
                Offset Y: {shadowEffect.offsetY}px
              </label>
              <input
                type="range"
                min="-50"
                max="50"
                value={shadowEffect.offsetY}
                onChange={(e) => setShadowEffect(prev => ({ ...prev, offsetY: parseInt(e.target.value) }))}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#EC4899' }}>
                Blur: {shadowEffect.blur}px
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={shadowEffect.blur}
                onChange={(e) => setShadowEffect(prev => ({ ...prev, blur: parseInt(e.target.value) }))}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#EC4899' }}>
                Opacity: {Math.round(shadowEffect.opacity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={shadowEffect.opacity}
                onChange={(e) => setShadowEffect(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#EC4899' }}>
                Color
              </label>
              <input
                type="color"
                value={shadowEffect.color}
                onChange={(e) => setShadowEffect(prev => ({ ...prev, color: e.target.value }))}
                style={{ width: '100%', height: '24px' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Glow Settings */}
      {effects.some(e => e.name === 'glow') && (
        <div className="glow-settings" style={{
          marginBottom: '12px',
          padding: '8px',
          background: 'rgba(236, 72, 153, 0.1)',
          borderRadius: '4px'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#EC4899', marginBottom: '8px' }}>
            Glow Settings
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px'
          }}>
            <div>
              <label style={{ fontSize: '10px', color: '#EC4899' }}>
                Size: {glowEffect.size}px
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={glowEffect.size}
                onChange={(e) => setGlowEffect(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#EC4899' }}>
                Opacity: {Math.round(glowEffect.opacity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={glowEffect.opacity}
                onChange={(e) => setGlowEffect(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#EC4899' }}>
                Color
              </label>
              <input
                type="color"
                value={glowEffect.color}
                onChange={(e) => setGlowEffect(prev => ({ ...prev, color: e.target.value }))}
                style={{ width: '100%', height: '24px' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Effects Preview */}
      {isPreviewMode && previewCanvas && (
        <div className="effects-preview" style={{
          border: '1px solid #EC4899',
          borderRadius: '4px',
          padding: '8px',
          background: 'white',
          marginBottom: '12px'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#EC4899', marginBottom: '8px' }}>
            Effects Preview
          </div>
          <canvas
            ref={previewCanvasRef}
            width={previewCanvas.width}
            height={previewCanvas.height}
            style={{
              width: '100%',
              height: 'auto',
              maxWidth: '300px',
              border: '1px solid #E5E7EB'
            }}
          />
        </div>
      )}

      {/* Instructions */}
      <div style={{ fontSize: '12px', color: '#6B7280', textAlign: 'center' }}>
        Add professional effects to enhance your designs
      </div>
    </div>
  );
}

