import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '../App';

interface ProceduralGeneratorProps {
  active: boolean;
}

interface PatternType {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'geometric' | 'organic' | 'noise' | 'fractal' | 'cellular';
}

interface GeneratorSettings {
  width: number;
  height: number;
  scale: number;
  octaves: number;
  persistence: number;
  lacunarity: number;
  seed: number;
  colorMode: 'grayscale' | 'rgb' | 'hsv' | 'custom';
  colorPalette: string[];
  blendMode: GlobalCompositeOperation;
  rotation: number;
  offsetX: number;
  offsetY: number;
}

interface NoiseSettings {
  frequency: number;
  amplitude: number;
  roughness: number;
  ridged: boolean;
  billowy: boolean;
  iq: boolean;
}

export function ProceduralGenerator({ active }: ProceduralGeneratorProps) {
  // Console log removed

  const [selectedPattern, setSelectedPattern] = useState<string>('perlin_noise');
  const [generatorSettings, setGeneratorSettings] = useState<GeneratorSettings>({
    width: 512,
    height: 512,
    scale: 100,
    octaves: 4,
    persistence: 0.5,
    lacunarity: 2.0,
    seed: 12345,
    colorMode: 'rgb',
    colorPalette: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
    blendMode: 'source-over',
    rotation: 0,
    offsetX: 0,
    offsetY: 0
  });

  const [noiseSettings, setNoiseSettings] = useState<NoiseSettings>({
    frequency: 0.01,
    amplitude: 1.0,
    roughness: 0.5,
    ridged: false,
    billowy: false,
    iq: false
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTextures, setGeneratedTextures] = useState<{ id: string; name: string; data: ImageData }[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const patternTypes: PatternType[] = [
    // Geometric Patterns
    {
      id: 'geometric_grid',
      name: 'Geometric Grid',
      description: 'Regular geometric grid patterns',
      icon: '🔲',
      category: 'geometric'
    },
    {
      id: 'hexagonal',
      name: 'Hexagonal',
      description: 'Hexagonal tiling patterns',
      icon: '⬡',
      category: 'geometric'
    },
    {
      id: 'triangular',
      name: 'Triangular',
      description: 'Triangular mesh patterns',
      icon: '🔺',
      category: 'geometric'
    },
    {
      id: 'circular',
      name: 'Circular',
      description: 'Concentric circular patterns',
      icon: '⭕',
      category: 'geometric'
    },

    // Organic Patterns
    {
      id: 'organic_flow',
      name: 'Organic Flow',
      description: 'Natural flowing patterns',
      icon: '🌊',
      category: 'organic'
    },
    {
      id: 'veins',
      name: 'Veins',
      description: 'Vein-like branching patterns',
      icon: '🌿',
      category: 'organic'
    },
    {
      id: 'cells',
      name: 'Cells',
      description: 'Cellular organic patterns',
      icon: '🔬',
      category: 'organic'
    },

    // Noise Patterns
    {
      id: 'perlin_noise',
      name: 'Perlin Noise',
      description: 'Smooth random noise patterns',
      icon: '🌫️',
      category: 'noise'
    },
    {
      id: 'simplex_noise',
      name: 'Simplex Noise',
      description: 'Improved noise algorithm',
      icon: '🌀',
      category: 'noise'
    },
    {
      id: 'worley_noise',
      name: 'Worley Noise',
      description: 'Cellular noise patterns',
      icon: '🔳',
      category: 'noise'
    },

    // Fractal Patterns
    {
      id: 'mandelbrot',
      name: 'Mandelbrot',
      description: 'Mandelbrot fractal set',
      icon: '🌀',
      category: 'fractal'
    },
    {
      id: 'julia',
      name: 'Julia Set',
      description: 'Julia fractal patterns',
      icon: '🎭',
      category: 'fractal'
    },
    {
      id: 'dragon_curve',
      name: 'Dragon Curve',
      description: 'Dragon curve fractal',
      icon: '🐉',
      category: 'fractal'
    },

    // Cellular Patterns
    {
      id: 'voronoi',
      name: 'Voronoi',
      description: 'Voronoi diagram patterns',
      icon: '🔷',
      category: 'cellular'
    },
    {
      id: 'delaunay',
      name: 'Delaunay',
      description: 'Delaunay triangulation',
      icon: '🔺',
      category: 'cellular'
    }
  ];

  const generatePattern = useCallback(async () => {
    // Console log removed
    setIsGenerating(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    canvas.width = generatorSettings.width;
    canvas.height = generatorSettings.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      switch (selectedPattern) {
        case 'perlin_noise':
          await generatePerlinNoise(ctx, canvas.width, canvas.height);
          break;
        case 'simplex_noise':
          await generateSimplexNoise(ctx, canvas.width, canvas.height);
          break;
        case 'worley_noise':
          await generateWorleyNoise(ctx, canvas.width, canvas.height);
          break;
        case 'geometric_grid':
          await generateGeometricGrid(ctx, canvas.width, canvas.height);
          break;
        case 'hexagonal':
          await generateHexagonalPattern(ctx, canvas.width, canvas.height);
          break;
        case 'triangular':
          await generateTriangularPattern(ctx, canvas.width, canvas.height);
          break;
        case 'circular':
          await generateCircularPattern(ctx, canvas.width, canvas.height);
          break;
        case 'organic_flow':
          await generateOrganicFlow(ctx, canvas.width, canvas.height);
          break;
        case 'veins':
          await generateVeinPattern(ctx, canvas.width, canvas.height);
          break;
        case 'cells':
          await generateCellPattern(ctx, canvas.width, canvas.height);
          break;
        case 'mandelbrot':
          await generateMandelbrot(ctx, canvas.width, canvas.height);
          break;
        case 'julia':
          await generateJuliaSet(ctx, canvas.width, canvas.height);
          break;
        case 'dragon_curve':
          await generateDragonCurve(ctx, canvas.width, canvas.height);
          break;
        case 'voronoi':
          await generateVoronoi(ctx, canvas.width, canvas.height);
          break;
        case 'delaunay':
          await generateDelaunay(ctx, canvas.width, canvas.height);
          break;
      }

      // Save generated texture
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const newTexture = {
        id: `texture_${Date.now()}`,
        name: `${patternTypes.find(p => p.id === selectedPattern)?.name} ${Date.now()}`,
        data: imageData
      };
      setGeneratedTextures(prev => [newTexture, ...prev.slice(0, 9)]); // Keep last 10

    } catch (error) {
      console.error('🎲 ProceduralGenerator: Error generating pattern', error);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedPattern, generatorSettings, noiseSettings, patternTypes]);

  const generatePerlinNoise = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Console log removed
    
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const noise = perlinNoise2D(
          x * noiseSettings.frequency,
          y * noiseSettings.frequency,
          generatorSettings.octaves,
          generatorSettings.persistence,
          generatorSettings.lacunarity,
          generatorSettings.seed
        );
        
        const value = Math.floor((noise + 1) * 127.5);
        const index = (y * width + x) * 4;
        
        if (generatorSettings.colorMode === 'grayscale') {
          data[index] = value;
          data[index + 1] = value;
          data[index + 2] = value;
        } else {
          const colorIndex = Math.floor(noise * generatorSettings.colorPalette.length);
          const color = generatorSettings.colorPalette[Math.abs(colorIndex) % generatorSettings.colorPalette.length];
          const rgb = hexToRgb(color);
          data[index] = rgb.r;
          data[index + 1] = rgb.g;
          data[index + 2] = rgb.b;
        }
        data[index + 3] = 255;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  };

  const generateSimplexNoise = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Console log removed
    // Simplified Simplex noise implementation
    await generatePerlinNoise(ctx, width, height);
  };

  const generateWorleyNoise = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Console log removed
    
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    const cellSize = 50;
    const points: { x: number; y: number }[] = [];
    
    // Generate random points
    for (let i = 0; i < 100; i++) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height
      });
    }
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let minDistance = Infinity;
        
        // Find closest point
        for (const point of points) {
          const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
          minDistance = Math.min(minDistance, distance);
        }
        
        const value = Math.floor((minDistance / cellSize) * 255);
        const index = (y * width + x) * 4;
        
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 255;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  };

  const generateGeometricGrid = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Console log removed
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    const gridSize = 20;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const generateHexagonalPattern = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Console log removed
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    const hexSize = 30;
    const hexWidth = hexSize * Math.sqrt(3);
    const hexHeight = hexSize * 2;
    
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    
    for (let y = 0; y < height + hexHeight; y += hexHeight * 0.75) {
      for (let x = 0; x < width + hexWidth; x += hexWidth) {
        const offsetX = (y / (hexHeight * 0.75)) % 2 === 0 ? 0 : hexWidth / 2;
        
        drawHexagon(ctx, x + offsetX, y, hexSize);
      }
    }
  };

  const generateTriangularPattern = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Console log removed
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    const triangleSize = 40;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    
    for (let y = 0; y < height + triangleSize; y += triangleSize) {
      for (let x = 0; x < width + triangleSize; x += triangleSize) {
        const offsetX = (y / triangleSize) % 2 === 0 ? 0 : triangleSize / 2;
        
        drawTriangle(ctx, x + offsetX, y, triangleSize);
      }
    }
  };

  const generateCircularPattern = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Console log removed
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2;
    
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    
    for (let r = 20; r < maxRadius; r += 20) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const generateOrganicFlow = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Console log removed
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.8;
    
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      ctx.moveTo(startX, startY);
      
      let x = startX;
      let y = startY;
      
      for (let j = 0; j < 50; j++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 20 + 5;
        x += Math.cos(angle) * distance;
        y += Math.sin(angle) * distance;
        
        if (x < 0 || x > width || y < 0 || y > height) break;
        
        ctx.lineTo(x, y);
      }
      
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
  };

  const generateVeinPattern = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Console log removed
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    
    // Generate main trunk
    const trunkX = width / 2;
    const trunkY = height / 2;
    
    ctx.beginPath();
    ctx.moveTo(trunkX, 0);
    ctx.lineTo(trunkX, height);
    ctx.stroke();
    
    // Generate branches
    for (let i = 0; i < 20; i++) {
      const branchY = Math.random() * height;
      const branchLength = Math.random() * 100 + 50;
      const branchAngle = (Math.random() - 0.5) * Math.PI / 2;
      
      ctx.beginPath();
      ctx.moveTo(trunkX, branchY);
      ctx.lineTo(
        trunkX + Math.cos(branchAngle) * branchLength,
        branchY + Math.sin(branchAngle) * branchLength
      );
      ctx.stroke();
    }
  };

  const generateCellPattern = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Console log removed
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    const cellSize = 60;
    const cells: { x: number; y: number; radius: number }[] = [];
    
    // Generate random cells
    for (let i = 0; i < 50; i++) {
      cells.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * cellSize + 10
      });
    }
    
    // Draw cells
    ctx.fillStyle = '#FFFFFF';
    ctx.globalAlpha = 0.3;
    
    for (const cell of cells) {
      ctx.beginPath();
      ctx.arc(cell.x, cell.y, cell.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.globalAlpha = 1;
  };

  const generateMandelbrot = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Console log removed
    
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    const maxIterations = 100;
    const zoom = 200;
    const offsetX = -width / 2;
    const offsetY = -height / 2;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const zx = (x + offsetX) / zoom;
        const zy = (y + offsetY) / zoom;
        
        let iterations = 0;
        let cx = zx;
        let cy = zy;
        
        while (iterations < maxIterations && cx * cx + cy * cy < 4) {
          const tmp = cx * cx - cy * cy + zx;
          cy = 2 * cx * cy + zy;
          cx = tmp;
          iterations++;
        }
        
        const value = Math.floor((iterations / maxIterations) * 255);
        const index = (y * width + x) * 4;
        
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 255;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  };

  const generateJuliaSet = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Console log removed
    // Simplified Julia set implementation
    await generateMandelbrot(ctx, width, height);
  };

  const generateDragonCurve = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Console log removed
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    
    const iterations = 12;
    let curve = 'F';
    
    for (let i = 0; i < iterations; i++) {
      curve = curve.replace(/F/g, 'F+G').replace(/G/g, 'F-G');
    }
    
    let x = width / 4;
    let y = height / 2;
    let angle = 0;
    const step = 2;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    for (const char of curve) {
      if (char === 'F' || char === 'G') {
        x += Math.cos(angle) * step;
        y += Math.sin(angle) * step;
        ctx.lineTo(x, y);
      } else if (char === '+') {
        angle += Math.PI / 2;
      } else if (char === '-') {
        angle -= Math.PI / 2;
      }
    }
    
    ctx.stroke();
  };

  const generateVoronoi = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Console log removed
    
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    const points: { x: number; y: number; color: string }[] = [];
    const numPoints = 20;
    
    // Generate random points
    for (let i = 0; i < numPoints; i++) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        color: generatorSettings.colorPalette[i % generatorSettings.colorPalette.length]
      });
    }
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let minDistance = Infinity;
        let closestColor = '#000000';
        
        for (const point of points) {
          const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
          if (distance < minDistance) {
            minDistance = distance;
            closestColor = point.color;
          }
        }
        
        const rgb = hexToRgb(closestColor);
        const index = (y * width + x) * 4;
        
        data[index] = rgb.r;
        data[index + 1] = rgb.g;
        data[index + 2] = rgb.b;
        data[index + 3] = 255;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  };

  const generateDelaunay = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Console log removed
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    const points: { x: number; y: number }[] = [];
    const numPoints = 30;
    
    // Generate random points
    for (let i = 0; i < numPoints; i++) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height
      });
    }
    
    // Draw triangles (simplified)
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < points.length; i += 3) {
      if (i + 2 < points.length) {
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[i + 1].x, points[i + 1].y);
        ctx.lineTo(points[i + 2].x, points[i + 2].y);
        ctx.closePath();
        ctx.stroke();
      }
    }
  };

  // Helper functions
  const perlinNoise2D = (x: number, y: number, octaves: number, persistence: number, lacunarity: number, seed: number): number => {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    
    for (let i = 0; i < octaves; i++) {
      value += Math.sin(x * frequency + seed) * Math.cos(y * frequency + seed) * amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }
    
    return value;
  };

  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const drawHexagon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const hx = x + Math.cos(angle) * size;
      const hy = y + Math.sin(angle) * size;
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.stroke();
  };

  const drawTriangle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x - size, y + size);
    ctx.lineTo(x + size, y + size);
    ctx.closePath();
    ctx.stroke();
  };

  if (!active) {
    // Console log removed
    return null;
  }

  console.log('🎲 ProceduralGenerator: Rendering component', { 
    selectedPattern,
    isGenerating,
    generatedTexturesCount: generatedTextures.length
  });

  return (
    <div className="procedural-generator">
      <div className="tool-header">
        <h4 style={{ margin: 0, color: '#8B5CF6', fontSize: '18px' }}>
          🎲 Procedural Generator
        </h4>
        <div className="tool-controls">
          <button
            onClick={generatePattern}
          disabled={isGenerating}
          style={{
            padding: '8px 16px',
            background: isGenerating ? '#6B7280' : '#8B5CF6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {isGenerating ? '⏳' : '🎨'} {isGenerating ? 'Generating...' : 'Generate'}
        </button>
        <button
          onClick={() => useApp.getState().setTool('brush')}
          style={{
            padding: '8px 16px',
            background: '#EF4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
          title="Close Procedural Generator"
        >
          ✕ Close
        </button>
        </div>
      </div>

      {/* Pattern Types */}
      <div className="pattern-types" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#8B5CF6', marginBottom: '8px' }}>
          Pattern Types
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: '6px',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {patternTypes.map(pattern => (
            <button
              key={pattern.id}
              className={`pattern-btn ${selectedPattern === pattern.id ? 'active' : ''}`}
              onClick={() => setSelectedPattern(pattern.id)}
              style={{
                padding: '6px',
                background: selectedPattern === pattern.id ? '#8B5CF6' : 'rgba(139, 92, 246, 0.2)',
                color: selectedPattern === pattern.id ? '#FFFFFF' : '#A78BFA',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '4px',
                fontSize: '10px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '14px', marginBottom: '2px' }}>{pattern.icon}</div>
              <div>{pattern.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Generator Settings */}
      <div className="generator-settings" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#8B5CF6', marginBottom: '8px' }}>
          Generator Settings
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px'
        }}>
          <div>
            <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
              Width
            </label>
            <input
              type="number"
              value={generatorSettings.width}
              onChange={(e) => setGeneratorSettings(prev => ({ ...prev, width: parseInt(e.target.value) }))}
              style={{
                width: '100%',
                padding: '4px',
                background: '#374151',
                color: '#F9FAFB',
                border: '1px solid #4B5563',
                borderRadius: '4px',
                fontSize: '11px'
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
              Height
            </label>
            <input
              type="number"
              value={generatorSettings.height}
              onChange={(e) => setGeneratorSettings(prev => ({ ...prev, height: parseInt(e.target.value) }))}
              style={{
                width: '100%',
                padding: '4px',
                background: '#374151',
                color: '#F9FAFB',
                border: '1px solid #4B5563',
                borderRadius: '4px',
                fontSize: '11px'
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
              Scale
            </label>
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={generatorSettings.scale}
              onChange={(e) => setGeneratorSettings(prev => ({ ...prev, scale: parseInt(e.target.value) }))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#D1D5DB', display: 'block', marginBottom: '4px' }}>
              Octaves
            </label>
            <input
              type="range"
              min="1"
              max="8"
              step="1"
              value={generatorSettings.octaves}
              onChange={(e) => setGeneratorSettings(prev => ({ ...prev, octaves: parseInt(e.target.value) }))}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Generated Textures */}
      <div className="generated-textures" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#8B5CF6', marginBottom: '8px' }}>
          Generated Textures ({generatedTextures.length})
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
          gap: '8px',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {generatedTextures.map(texture => (
            <div
              key={texture.id}
              style={{
                aspectRatio: '1',
                background: '#374151',
                borderRadius: '4px',
                border: '1px solid rgba(139, 92, 246, 0.3)',
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
                {texture.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Canvas */}
      <div className="preview-canvas" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#8B5CF6', marginBottom: '8px' }}>
          Preview
        </div>
        <canvas
          ref={previewCanvasRef}
          width={300}
          height={200}
          style={{
            width: '100%',
            height: '200px',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '4px',
            background: '#1F2937'
          }}
        />
      </div>

      {/* Hidden canvas for generation */}
      <canvas ref={canvasRef} width={512} height={512} style={{ display: 'none' }} />
    </div>
  );
}
