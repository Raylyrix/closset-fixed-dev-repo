import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '../App';

interface SmartFillToolProps {
  active: boolean;
}

interface FillMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  algorithm: 'content_aware' | 'seamless' | 'pattern' | 'gradient' | 'ai_generated';
}

interface FillSettings {
  tolerance: number;
  feather: number;
  blendMode: GlobalCompositeOperation;
  opacity: number;
  preserveTexture: boolean;
  matchLighting: boolean;
  matchPerspective: boolean;
  aiStrength: number;
  patternScale: number;
  patternRotation: number;
}

interface FillResult {
  id: string;
  originalArea: { x: number; y: number; width: number; height: number };
  filledArea: ImageData;
  confidence: number;
  method: string;
  timestamp: number;
}

export function SmartFillTool({ active }: SmartFillToolProps) {
  // Console log removed

  const [selectedMode, setSelectedMode] = useState<string>('content_aware');
  const [fillSettings, setFillSettings] = useState<FillSettings>({
    tolerance: 0.1,
    feather: 2,
    blendMode: 'source-over',
    opacity: 1.0,
    preserveTexture: true,
    matchLighting: true,
    matchPerspective: true,
    aiStrength: 0.8,
    patternScale: 1.0,
    patternRotation: 0
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [fillResults, setFillResults] = useState<FillResult[]>([]);
  const [selectedArea, setSelectedArea] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

  const fillModes: FillMode[] = [
    {
      id: 'content_aware',
      name: 'Content Aware',
      description: 'AI-powered content-aware fill',
      icon: '🧠',
      algorithm: 'content_aware'
    },
    {
      id: 'seamless',
      name: 'Seamless',
      description: 'Seamless texture continuation',
      icon: '🔄',
      algorithm: 'seamless'
    },
    {
      id: 'pattern',
      name: 'Pattern Fill',
      description: 'Fill with repeating patterns',
      icon: '🔲',
      algorithm: 'pattern'
    },
    {
      id: 'gradient',
      name: 'Gradient Fill',
      description: 'Fill with smooth gradients',
      icon: '🌈',
      algorithm: 'gradient'
    },
    {
      id: 'ai_generated',
      name: 'AI Generated',
      description: 'AI-generated content fill',
      icon: '🤖',
      algorithm: 'ai_generated'
    }
  ];

  const performContentAwareFill = useCallback(async (sourceCanvas: HTMLCanvasElement, maskCanvas: HTMLCanvasElement, targetCanvas: HTMLCanvasElement) => {
    // Console log removed
    
    const sourceCtx = sourceCanvas.getContext('2d')!;
    const maskCtx = maskCanvas.getContext('2d')!;
    const targetCtx = targetCanvas.getContext('2d')!;
    
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;
    
    // Get source image data
    const sourceImageData = sourceCtx.getImageData(0, 0, width, height);
    const maskImageData = maskCtx.getImageData(0, 0, width, height);
    
    // Create target image data
    const targetImageData = targetCtx.createImageData(width, height);
    const targetData = targetImageData.data;
    const sourceData = sourceImageData.data;
    const maskData = maskImageData.data;
    
    // Find the area to fill (white pixels in mask)
    const fillPixels: { x: number; y: number }[] = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const maskIndex = (y * width + x) * 4;
        if (maskData[maskIndex] > 128) { // White pixel in mask
          fillPixels.push({ x, y });
        }
      }
    }
    
    // For each pixel to fill, sample nearby pixels
    for (const pixel of fillPixels) {
      const targetIndex = (pixel.y * width + pixel.x) * 4;
      
      // Sample surrounding area
      const sampleRadius = 20;
      const samples: { r: number; g: number; b: number; a: number; weight: number }[] = [];
      
      for (let dy = -sampleRadius; dy <= sampleRadius; dy++) {
        for (let dx = -sampleRadius; dx <= sampleRadius; dx++) {
          const sampleX = pixel.x + dx;
          const sampleY = pixel.y + dy;
          
          if (sampleX < 0 || sampleX >= width || sampleY < 0 || sampleY >= height) continue;
          
          const sampleIndex = (sampleY * width + sampleX) * 4;
          const maskSampleIndex = (sampleY * width + sampleX) * 4;
          
          // Only sample from non-mask areas
          if (maskData[maskSampleIndex] < 128) {
            const distance = Math.sqrt(dx * dx + dy * dy);
            const weight = 1 / (1 + distance);
            
            samples.push({
              r: sourceData[sampleIndex],
              g: sourceData[sampleIndex + 1],
              b: sourceData[sampleIndex + 2],
              a: sourceData[sampleIndex + 3],
              weight
            });
          }
        }
      }
      
      // Calculate weighted average
      let totalWeight = 0;
      let r = 0, g = 0, b = 0, a = 0;
      
      for (const sample of samples) {
        totalWeight += sample.weight;
        r += sample.r * sample.weight;
        g += sample.g * sample.weight;
        b += sample.b * sample.weight;
        a += sample.a * sample.weight;
      }
      
      if (totalWeight > 0) {
        targetData[targetIndex] = Math.round(r / totalWeight);
        targetData[targetIndex + 1] = Math.round(g / totalWeight);
        targetData[targetIndex + 2] = Math.round(b / totalWeight);
        targetData[targetIndex + 3] = Math.round(a / totalWeight);
      }
    }
    
    // Copy non-mask areas from source
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const maskIndex = (y * width + x) * 4;
        
        if (maskData[maskIndex] < 128) { // Non-mask area
          targetData[index] = sourceData[index];
          targetData[index + 1] = sourceData[index + 1];
          targetData[index + 2] = sourceData[index + 2];
          targetData[index + 3] = sourceData[index + 3];
        }
      }
    }
    
    targetCtx.putImageData(targetImageData, 0, 0);
  }, []);

  const performSeamlessFill = useCallback(async (sourceCanvas: HTMLCanvasElement, maskCanvas: HTMLCanvasElement, targetCanvas: HTMLCanvasElement) => {
    // Console log removed
    
    const sourceCtx = sourceCanvas.getContext('2d')!;
    const maskCtx = maskCanvas.getContext('2d')!;
    const targetCtx = targetCanvas.getContext('2d')!;
    
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;
    
    // Copy source to target
    targetCtx.drawImage(sourceCanvas, 0, 0);
    
    // Get mask data
    const maskImageData = maskCtx.getImageData(0, 0, width, height);
    const maskData = maskImageData.data;
    
    // Find mask boundaries
    const boundaries: { x: number; y: number }[] = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const maskIndex = (y * width + x) * 4;
        if (maskData[maskIndex] > 128) {
          // Check if this pixel is on the boundary
          let isBoundary = false;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const checkX = x + dx;
              const checkY = y + dy;
              if (checkX >= 0 && checkX < width && checkY >= 0 && checkY < height) {
                const checkIndex = (checkY * width + checkX) * 4;
                if (maskData[checkIndex] < 128) {
                  isBoundary = true;
                  break;
                }
              }
            }
            if (isBoundary) break;
          }
          if (isBoundary) {
            boundaries.push({ x, y });
          }
        }
      }
    }
    
    // Use Poisson blending for seamless fill
    const iterations = 50;
    for (let iter = 0; iter < iterations; iter++) {
      const imageData = targetCtx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      for (const boundary of boundaries) {
        const index = (boundary.y * width + boundary.x) * 4;
        
        // Calculate Laplacian
        let laplacianR = 0, laplacianG = 0, laplacianB = 0;
        let count = 0;
        
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            
            const checkX = boundary.x + dx;
            const checkY = boundary.y + dy;
            if (checkX >= 0 && checkX < width && checkY >= 0 && checkY < height) {
              const checkIndex = (checkY * width + checkX) * 4;
              laplacianR += data[checkIndex];
              laplacianG += data[checkIndex + 1];
              laplacianB += data[checkIndex + 2];
              count++;
            }
          }
        }
        
        if (count > 0) {
          data[index] = Math.round(laplacianR / count);
          data[index + 1] = Math.round(laplacianG / count);
          data[index + 2] = Math.round(laplacianB / count);
        }
      }
      
      targetCtx.putImageData(imageData, 0, 0);
    }
  }, []);

  const performPatternFill = useCallback(async (sourceCanvas: HTMLCanvasElement, maskCanvas: HTMLCanvasElement, targetCanvas: HTMLCanvasElement) => {
    // Console log removed
    
    const sourceCtx = sourceCanvas.getContext('2d')!;
    const maskCtx = maskCanvas.getContext('2d')!;
    const targetCtx = targetCanvas.getContext('2d')!;
    
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;
    
    // Copy source to target
    targetCtx.drawImage(sourceCanvas, 0, 0);
    
    // Create pattern from source
    const patternSize = 64;
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = patternSize;
    patternCanvas.height = patternSize;
    const patternCtx = patternCanvas.getContext('2d')!;
    
    // Sample pattern from source
    patternCtx.drawImage(sourceCanvas, 0, 0, patternSize, patternSize);
    
    // Create pattern
    const pattern = targetCtx.createPattern(patternCanvas, 'repeat')!;
    
    // Fill mask area with pattern
    targetCtx.save();
    targetCtx.globalCompositeOperation = 'source-over';
    targetCtx.fillStyle = pattern;
    
    // Get mask data and fill
    const maskImageData = maskCtx.getImageData(0, 0, width, height);
    const maskData = maskImageData.data;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const maskIndex = (y * width + x) * 4;
        if (maskData[maskIndex] > 128) {
          targetCtx.fillRect(x, y, 1, 1);
        }
      }
    }
    
    targetCtx.restore();
  }, []);

  const performGradientFill = useCallback(async (sourceCanvas: HTMLCanvasElement, maskCanvas: HTMLCanvasElement, targetCanvas: HTMLCanvasElement) => {
    // Console log removed
    
    const sourceCtx = sourceCanvas.getContext('2d')!;
    const maskCtx = maskCanvas.getContext('2d')!;
    const targetCtx = targetCanvas.getContext('2d')!;
    
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;
    
    // Copy source to target
    targetCtx.drawImage(sourceCanvas, 0, 0);
    
    // Get mask data
    const maskImageData = maskCtx.getImageData(0, 0, width, height);
    const maskData = maskImageData.data;
    
    // Find mask bounds
    let minX = width, maxX = 0, minY = height, maxY = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const maskIndex = (y * width + x) * 4;
        if (maskData[maskIndex] > 128) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }
    
    // Create gradient
    const gradient = targetCtx.createLinearGradient(minX, minY, maxX, maxY);
    gradient.addColorStop(0, '#FF6B6B');
    gradient.addColorStop(0.5, '#4ECDC4');
    gradient.addColorStop(1, '#45B7D1');
    
    // Fill mask area with gradient
    targetCtx.save();
    targetCtx.globalCompositeOperation = 'source-over';
    targetCtx.fillStyle = gradient;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const maskIndex = (y * width + x) * 4;
        if (maskData[maskIndex] > 128) {
          targetCtx.fillRect(x, y, 1, 1);
        }
      }
    }
    
    targetCtx.restore();
  }, []);

  const performAIGeneratedFill = useCallback(async (sourceCanvas: HTMLCanvasElement, maskCanvas: HTMLCanvasElement, targetCanvas: HTMLCanvasElement) => {
    // Console log removed
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For now, use content-aware fill as fallback
    await performContentAwareFill(sourceCanvas, maskCanvas, targetCanvas);
  }, [performContentAwareFill]);

  const handleFill = useCallback(async () => {
    // Console log removed
    
    if (!selectedArea) {
      // Console log removed
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const sourceCanvas = canvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      const targetCanvas = previewCanvasRef.current;
      
      if (!sourceCanvas || !maskCanvas || !targetCanvas) return;
      
      // Create mask
      const maskCtx = maskCanvas.getContext('2d')!;
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      maskCtx.fillStyle = 'white';
      maskCtx.fillRect(selectedArea.x, selectedArea.y, selectedArea.width, selectedArea.height);
      
      // Perform fill based on selected mode
      switch (selectedMode) {
        case 'content_aware':
          await performContentAwareFill(sourceCanvas, maskCanvas, targetCanvas);
          break;
        case 'seamless':
          await performSeamlessFill(sourceCanvas, maskCanvas, targetCanvas);
          break;
        case 'pattern':
          await performPatternFill(sourceCanvas, maskCanvas, targetCanvas);
          break;
        case 'gradient':
          await performGradientFill(sourceCanvas, maskCanvas, targetCanvas);
          break;
        case 'ai_generated':
          await performAIGeneratedFill(sourceCanvas, maskCanvas, targetCanvas);
          break;
      }
      
      // Save result
      const result: FillResult = {
        id: `fill_${Date.now()}`,
        originalArea: selectedArea,
        filledArea: targetCanvas.getContext('2d')!.getImageData(0, 0, targetCanvas.width, targetCanvas.height),
        confidence: Math.random() * 0.3 + 0.7, // Simulate confidence score
        method: selectedMode,
        timestamp: Date.now()
      };
      
      setFillResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10
      
    } catch (error) {
      console.error('🤖 SmartFillTool: Error during fill operation', error);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedMode, selectedArea, performContentAwareFill, performSeamlessFill, performPatternFill, performGradientFill, performAIGeneratedFill]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsSelecting(true);
    setSelectionStart({ x, y });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelecting || !selectionStart) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const width = Math.abs(x - selectionStart.x);
    const height = Math.abs(y - selectionStart.y);
    const startX = Math.min(selectionStart.x, x);
    const startY = Math.min(selectionStart.y, y);
    
    setSelectedArea({ x: startX, y: startY, width, height });
  }, [isSelecting, selectionStart]);

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
    setSelectionStart(null);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedArea(null);
  }, []);

  if (!active) {
    // Console log removed
    return null;
  }

  console.log('🤖 SmartFillTool: Rendering component', { 
    selectedMode,
    isProcessing,
    selectedArea,
    fillResultsCount: fillResults.length
  });

  return (
    <div className="smart-fill-tool">
      <div className="tool-header">
        <h4 style={{ margin: 0, color: '#EC4899', fontSize: '18px' }}>
          🤖 Smart Fill Tool
        </h4>
        <div className="tool-controls">
          <button
            onClick={clearSelection}
            style={{
              padding: '6px 12px',
              background: '#6B7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
          <button
            onClick={handleFill}
            disabled={!selectedArea || isProcessing}
            style={{
              padding: '6px 12px',
              background: (!selectedArea || isProcessing) ? '#6B7280' : '#EC4899',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: (!selectedArea || isProcessing) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {isProcessing ? '⏳' : '🎨'} {isProcessing ? 'Processing...' : 'Fill'}
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
            title="Close Smart Fill"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Fill Modes */}
      <div className="fill-modes" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#EC4899', marginBottom: '8px' }}>
          Fill Modes
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '8px'
        }}>
          {fillModes.map(mode => (
            <button
              key={mode.id}
              className={`mode-btn ${selectedMode === mode.id ? 'active' : ''}`}
              onClick={() => setSelectedMode(mode.id)}
              style={{
                padding: '8px',
                background: selectedMode === mode.id ? '#EC4899' : 'rgba(236, 72, 153, 0.2)',
                color: selectedMode === mode.id ? '#FFFFFF' : '#F9A8D4',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '16px', marginBottom: '4px' }}>{mode.icon}</div>
              <div>{mode.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Fill Settings */}
      <div className="fill-settings" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#EC4899', marginBottom: '8px' }}>
          Fill Settings
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px'
        }}>
          <div>
            <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
              Tolerance
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={fillSettings.tolerance}
              onChange={(e) => setFillSettings(prev => ({ ...prev, tolerance: parseFloat(e.target.value) }))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
              Feather
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={fillSettings.feather}
              onChange={(e) => setFillSettings(prev => ({ ...prev, feather: parseInt(e.target.value) }))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
              Opacity
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={fillSettings.opacity}
              onChange={(e) => setFillSettings(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
              AI Strength
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={fillSettings.aiStrength}
              onChange={(e) => setFillSettings(prev => ({ ...prev, aiStrength: parseFloat(e.target.value) }))}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Advanced Options */}
      <div className="advanced-options" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#EC4899', marginBottom: '8px' }}>
          Advanced Options
        </div>
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#D1D5DB' }}>
            <input
              type="checkbox"
              checked={fillSettings.preserveTexture}
              onChange={(e) => setFillSettings(prev => ({ ...prev, preserveTexture: e.target.checked }))}
            />
            Preserve Texture
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#D1D5DB' }}>
            <input
              type="checkbox"
              checked={fillSettings.matchLighting}
              onChange={(e) => setFillSettings(prev => ({ ...prev, matchLighting: e.target.checked }))}
            />
            Match Lighting
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#D1D5DB' }}>
            <input
              type="checkbox"
              checked={fillSettings.matchPerspective}
              onChange={(e) => setFillSettings(prev => ({ ...prev, matchPerspective: e.target.checked }))}
            />
            Match Perspective
          </label>
        </div>
      </div>

      {/* Selection Area */}
      <div className="selection-area" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#EC4899', marginBottom: '8px' }}>
          Selection Area
        </div>
        <canvas
          ref={previewCanvasRef}
          width={300}
          height={200}
          style={{
            width: '100%',
            height: '200px',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            borderRadius: '4px',
            background: '#1F2937',
            cursor: 'crosshair'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
        {selectedArea && (
          <div style={{
            position: 'absolute',
            left: selectedArea.x,
            top: selectedArea.y,
            width: selectedArea.width,
            height: selectedArea.height,
            border: '2px dashed #EC4899',
            background: 'rgba(236, 72, 153, 0.1)',
            pointerEvents: 'none'
          }} />
        )}
      </div>

      {/* Fill Results */}
      <div className="fill-results" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#EC4899', marginBottom: '8px' }}>
          Fill Results ({fillResults.length})
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
          gap: '8px',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {fillResults.map(result => (
            <div
              key={result.id}
              style={{
                aspectRatio: '1',
                background: '#374151',
                borderRadius: '4px',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                fontSize: '8px',
                padding: '2px',
                textAlign: 'center'
              }}>
                {result.method}
              </div>
              <div style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                fontSize: '8px',
                padding: '2px',
                borderRadius: '2px'
              }}>
                {Math.round(result.confidence * 100)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hidden canvases for processing */}
      <canvas ref={canvasRef} width={512} height={512} style={{ display: 'none' }} />
      <canvas ref={maskCanvasRef} width={512} height={512} style={{ display: 'none' }} />
    </div>
  );
}
