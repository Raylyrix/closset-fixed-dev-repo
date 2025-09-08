import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../App';
import { embroideryAI, type EmbroideryStitch, type EmbroideryPattern } from '../services/embroideryService';
import { embroideryBackend, type EmbroideryPlan, type GenerateFromPointsRequest } from '../services/embroideryBackendService';
import * as THREE from 'three';

interface EmbroideryToolProps {
  active?: boolean;
}

const EmbroideryTool: React.FC<EmbroideryToolProps> = ({ active = true }) => {
  const {
    embroideryStitches,
    setEmbroideryStitches,
    embroideryPattern,
    setEmbroideryPattern,
    embroideryThreadType,
    setEmbroideryThreadType,
    embroideryThickness,
    setEmbroideryThickness,
    embroideryOpacity,
    setEmbroideryOpacity,
    embroideryColor,
    setEmbroideryColor,
    embroideryStitchType,
    setEmbroideryStitchType,
    embroideryPatternDescription,
    setEmbroideryPatternDescription,
    embroideryAIEnabled,
    setEmbroideryAIEnabled,
    composedCanvas
  } = useApp();

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStitch, setCurrentStitch] = useState<EmbroideryStitch | null>(null);
  const [showPatterns, setShowPatterns] = useState(false);
  const [generatedPatterns, setGeneratedPatterns] = useState<EmbroideryPattern[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [underlayType, setUnderlayType] = useState<'none' | 'center' | 'contour' | 'zigzag'>('center');
  const [threadPalette, setThreadPalette] = useState<string[]>(['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']);
  const [showPatternLibrary, setShowPatternLibrary] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [stitchDirection, setStitchDirection] = useState<'horizontal' | 'vertical' | 'diagonal' | 'radial'>('horizontal');
  const [stitchSpacing, setStitchSpacing] = useState(0.5);
  const [stitchDensity, setStitchDensity] = useState(1.0);
  const [threadTexture, setThreadTexture] = useState('smooth');
  const [lightingDirection, setLightingDirection] = useState('top-left');
  const [fabricType, setFabricType] = useState('cotton');
  
  // Backend integration state
  const [backendConnected, setBackendConnected] = useState(false);
  const [backendHealth, setBackendHealth] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'dst' | 'pes' | 'exp'>('dst');
  const [showExportOptions, setShowExportOptions] = useState(false);
  
  // Revolutionary new features for next-level technology
  const [advancedStitchTypes, setAdvancedStitchTypes] = useState([
    'satin', 'fill', 'outline', 'cross-stitch', 'chain', 'backstitch',
    'french-knot', 'bullion', 'lazy-daisy', 'feather', 'couching', 'appliqué',
    'seed', 'stem', 'split', 'brick', 'long-short', 'fishbone', 'herringbone',
    'satin-ribbon', 'metallic', 'glow-thread', 'variegated', 'gradient'
  ]);
  const [selectedAdvancedStitch, setSelectedAdvancedStitch] = useState('french-knot');
  const [threadLibrary, setThreadLibrary] = useState({
    metallic: ['#FFD700', '#C0C0C0', '#CD7F32', '#B87333', '#E6E6FA'],
    variegated: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
    glow: ['#00FF00', '#FF00FF', '#00FFFF', '#FFFF00', '#FF4500'],
    specialty: ['#8B4513', '#2F4F4F', '#800080', '#FF1493', '#00CED1']
  });
  const [selectedThreadCategory, setSelectedThreadCategory] = useState('metallic');
  const [aiDesignMode, setAiDesignMode] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState<any[]>([]);
  const [fabricPhysics, setFabricPhysics] = useState({
    tension: 0.5,
    stretch: 0.3,
    drape: 0.7,
    thickness: 0.2
  });
  const [realTimeCollaboration, setRealTimeCollaboration] = useState(false);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [arVrMode, setArVrMode] = useState(false);
  const [mlOptimization, setMlOptimization] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [stitchComplexity, setStitchComplexity] = useState('beginner');
  const [designLayers, setDesignLayers] = useState<any[]>([]);
  const [currentLayer, setCurrentLayer] = useState(0);
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [performanceStats, setPerformanceStats] = useState({
    renderTime: 0,
    stitchCount: 0,
    memoryUsage: 0
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Predefined embroidery patterns
  const embroideryPatterns = [
    { id: 'flower', name: 'Flower', type: 'satin', points: [] },
    { id: 'heart', name: 'Heart', type: 'fill', points: [] },
    { id: 'star', name: 'Star', type: 'cross-stitch', points: [] },
    { id: 'leaf', name: 'Leaf', type: 'chain', points: [] },
    { id: 'circle', name: 'Circle', type: 'outline', points: [] },
    { id: 'zigzag', name: 'Zigzag', type: 'backstitch', points: [] }
  ];

  if (!active) {
    return null;
  }

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('⚠️ CANVAS REF NOT FOUND: Cannot initialize canvas');
      return;
    }

    console.log('🎨 INITIALIZING CANVAS with high-quality rendering');

    const ctx = canvas.getContext('2d', { 
      willReadFrequently: true, 
      alpha: true, 
      desynchronized: false 
    });
    if (!ctx) {
      console.error('❌ CANVAS CONTEXT FAILED: Cannot get 2D context');
      return;
    }

    // Set canvas size with high DPI
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 2;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    console.log(`🎨 Canvas initialized: ${rect.width}x${rect.height} (DPR: ${dpr})`);

    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Draw embroidery stitches
  const drawStitches = () => {
    const startTime = performance.now();
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('⚠️ CANVAS NOT FOUND: Cannot draw stitches');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('⚠️ CONTEXT NOT FOUND: Cannot get 2D context');
      return;
    }

    console.log(`🎨 DRAWING ALL STITCHES: ${embroideryStitches.length} stitches + ${currentStitch ? '1 current' : '0 current'}`);

    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw all stitches with error handling
    if (Array.isArray(embroideryStitches)) {
      console.log(`📝 Drawing ${embroideryStitches.length} existing stitches`);
      embroideryStitches.forEach((stitch, index) => {
        try {
          console.log(`📝 Drawing stitch ${index + 1}/${embroideryStitches.length}: ${stitch.type}`);
          drawStitch(ctx, stitch, rect);
        } catch (error) {
          console.error(`❌ Error drawing stitch ${index}:`, error);
        }
      });
    } else {
      console.warn('⚠️ EMBROIDERY STITCHES IS NOT ARRAY:', embroideryStitches);
    }

    // Draw current stitch preview with error handling
    if (currentStitch) {
      try {
        console.log(`👁️ Drawing current stitch preview: ${currentStitch.type} with ${currentStitch.points.length} points`);
        drawStitch(ctx, currentStitch, rect, true);
      } catch (error) {
        console.error('❌ Error drawing current stitch:', error);
      }
    } else {
      console.log('👁️ No current stitch to preview');
    }
    
    // Update performance stats
    const endTime = performance.now();
    setPerformanceStats({
      renderTime: Math.round(endTime - startTime),
      stitchCount: embroideryStitches.length,
      memoryUsage: Math.round((performance as any).memory?.usedJSHeapSize / 1024 / 1024 || 0)
    });
  };

  const drawStitch = (ctx: CanvasRenderingContext2D, stitch: EmbroideryStitch, rect: DOMRect, isPreview = false) => {
    console.log(`🎨 DRAWING STITCH:`, {
      type: stitch.type,
      points: stitch.points.length,
      color: stitch.color,
      thickness: stitch.thickness,
      opacity: stitch.opacity,
      isPreview,
      rect: { width: rect.width, height: rect.height }
    });

    if (stitch.points.length < 2) {
      console.warn(`⚠️ STITCH SKIPPED: Not enough points (${stitch.points.length})`);
      return;
    }

    ctx.save();
    ctx.globalAlpha = isPreview ? 0.5 : stitch.opacity;
    
    // Convert UV coordinates to canvas coordinates
    const points = stitch.points.map(p => ({
      x: p.x * rect.width,
      y: p.y * rect.height
    }));

    // Create hyperrealistic thread appearance based on stitch type
    const baseColor = stitch.color;
    const darkerColor = adjustBrightness(baseColor, -30);
    const lighterColor = adjustBrightness(baseColor, 30);
    const highlightColor = adjustBrightness(baseColor, 50);
    
    // Set up high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Create dynamic gradient based on stitch direction
    const startPoint = points[0];
    const endPoint = points[points.length - 1];
    const gradient = ctx.createLinearGradient(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
    
    gradient.addColorStop(0, lighterColor);
    gradient.addColorStop(0.3, baseColor);
    gradient.addColorStop(0.7, baseColor);
    gradient.addColorStop(1, darkerColor);
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = stitch.thickness;
    
    // Add realistic shadow based on lighting direction
    const shadowIntensity = lightingDirection === 'top' ? 0.2 : lightingDirection === 'bottom' ? 0.4 : 0.3;
    ctx.shadowColor = `rgba(0, 0, 0, ${shadowIntensity})`;
    ctx.shadowBlur = Math.max(2, stitch.thickness * 0.5);
    ctx.shadowOffsetX = lightingDirection === 'left' ? 2 : lightingDirection === 'right' ? -2 : 1;
    ctx.shadowOffsetY = lightingDirection === 'top' ? 2 : lightingDirection === 'bottom' ? -2 : 1;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    console.log(`🔀 SWITCHING TO STITCH TYPE: ${stitch.type}`);
    switch (stitch.type) {
      case 'satin':
        console.log(`🧵 RENDERING SATIN STITCH with ${points.length} points`);
        // Smooth curve for satin stitch with hyperrealistic rendering
        for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1];
          const curr = points[i];
          const next = points[i + 1];
          
          if (next) {
            const cp1x = prev.x + (curr.x - prev.x) / 3;
            const cp1y = prev.y + (curr.y - prev.y) / 3;
            const cp2x = curr.x - (next.x - curr.x) / 3;
            const cp2y = curr.y - (next.y - curr.y) / 3;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
          } else {
            ctx.lineTo(curr.x, curr.y);
          }
        }
        ctx.stroke();
        
        // Add satin-specific highlights for 3D effect
        ctx.strokeStyle = adjustBrightness(stitch.color, 30);
        ctx.lineWidth = stitch.thickness * 0.3;
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
          const curr = points[i];
      const next = points[i + 1];
      
          if (next) {
            const cp1x = prev.x + (curr.x - prev.x) / 3;
            const cp1y = prev.y + (curr.y - prev.y) / 3;
            const cp2x = curr.x - (next.x - curr.x) / 3;
            const cp2y = curr.y - (next.y - curr.y) / 3;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
          } else {
            ctx.lineTo(curr.x, curr.y);
          }
        }
        ctx.stroke();
        break;

      case 'fill':
        console.log(`🟦 RENDERING FILL STITCH with ${points.length} points`);
        // Fill area with parallel lines and alternating direction for realistic fill
        const minY = Math.min(...points.map(p => p.y));
        const maxY = Math.max(...points.map(p => p.y));
        const lineSpacing = stitch.thickness * 1.2;
        console.log(`🟦 Fill bounds: Y=${minY.toFixed(1)} to ${maxY.toFixed(1)}, spacing=${lineSpacing.toFixed(1)}`);
        
        // Create fill pattern with realistic thread texture
        for (let y = minY; y <= maxY; y += lineSpacing) {
          const intersections = getLineIntersections(points, y);
          for (let i = 0; i < intersections.length; i += 2) {
            const startX = intersections[i];
            const endX = intersections[i + 1] || intersections[i];
            
            // Create individual line gradient for each fill line
            const lineGradient = ctx.createLinearGradient(startX, y, endX, y);
            lineGradient.addColorStop(0, adjustBrightness(baseColor, -10));
            lineGradient.addColorStop(0.5, baseColor);
            lineGradient.addColorStop(1, adjustBrightness(baseColor, -10));
            
            ctx.strokeStyle = lineGradient;
            ctx.lineWidth = stitch.thickness * 0.8;
            
            // Alternate line direction for more realistic fill
            if (Math.floor((y - minY) / lineSpacing) % 2 === 0) {
              ctx.beginPath();
              ctx.moveTo(startX, y);
              ctx.lineTo(endX, y);
              ctx.stroke();
            } else {
              ctx.beginPath();
              ctx.moveTo(endX, y);
              ctx.lineTo(startX, y);
              ctx.stroke();
            }
          }
        }
        break;

      case 'cross-stitch':
        console.log(`❌ RENDERING CROSS-STITCH with ${points.length} points`);
        // Draw X pattern with hyperrealistic cross-stitch appearance
        points.forEach((point, i) => {
          if (i % 2 === 0 && points[i + 1]) {
            const next = points[i + 1];
            const size = stitch.thickness * 1.8;
            
            // Create cross-stitch specific gradient
            const crossGradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, size);
            crossGradient.addColorStop(0, highlightColor);
            crossGradient.addColorStop(0.7, baseColor);
            crossGradient.addColorStop(1, darkerColor);
            
            ctx.strokeStyle = crossGradient;
            ctx.lineWidth = stitch.thickness * 0.6;
            ctx.shadowBlur = 1;
            ctx.shadowOffsetX = 0.5;
            ctx.shadowOffsetY = 0.5;
            
            // Draw the X pattern with enhanced rendering
            ctx.beginPath();
            ctx.moveTo(point.x - size, point.y - size);
            ctx.lineTo(point.x + size, point.y + size);
            ctx.moveTo(point.x - size, point.y + size);
            ctx.lineTo(point.x + size, point.y - size);
            ctx.stroke();
            
            // Add realistic corner dots with 3D effect
            ctx.fillStyle = baseColor;
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            const dotSize = stitch.thickness * 0.3;
            ctx.beginPath();
            ctx.arc(point.x - size, point.y - size, dotSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Add highlight to corner dots
            ctx.fillStyle = highlightColor;
            ctx.beginPath();
            ctx.arc(point.x - size - dotSize * 0.3, point.y - size - dotSize * 0.3, dotSize * 0.4, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = baseColor;
            ctx.beginPath();
            ctx.arc(point.x + size, point.y + size, dotSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(point.x - size, point.y + size, dotSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(point.x + size, point.y - size, dotSize, 0, Math.PI * 2);
            ctx.fill();
          }
        });
        break;

      case 'chain':
        console.log(`⛓️ RENDERING CHAIN STITCH with ${points.length} points`);
        // Chain stitch pattern - draw connected oval links with hyperrealistic rendering
        for (let i = 0; i < points.length - 1; i++) {
          const curr = points[i];
          const next = points[i + 1];
          const midX = (curr.x + next.x) / 2;
          const midY = (curr.y + next.y) / 2;
          
          // Calculate link dimensions
          const linkWidth = stitch.thickness * 2.0;
          const linkHeight = stitch.thickness * 1.2;
          
          // Create chain-specific gradient
          const chainGradient = ctx.createRadialGradient(midX, midY, 0, midX, midY, linkWidth/2);
          chainGradient.addColorStop(0, highlightColor);
          chainGradient.addColorStop(0.6, baseColor);
          chainGradient.addColorStop(1, darkerColor);
          
          ctx.strokeStyle = chainGradient;
          ctx.lineWidth = stitch.thickness * 0.8;
          ctx.shadowBlur = 2;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;
          
          // Draw outer chain link with enhanced rendering
          ctx.beginPath();
          ctx.ellipse(midX, midY, linkWidth/2, linkHeight/2, 0, 0, Math.PI * 2);
          ctx.stroke();
          
          // Draw inner oval for chain link hole with darker color
          ctx.strokeStyle = darkerColor;
          ctx.lineWidth = stitch.thickness * 0.4;
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          
          ctx.beginPath();
          ctx.ellipse(midX, midY, linkWidth/3, linkHeight/3, 0, 0, Math.PI * 2);
          ctx.stroke();
          
          // Add connecting lines between chain links
          if (i < points.length - 2) {
            const nextNext = points[i + 2];
            const nextMidX = (next.x + nextNext.x) / 2;
            const nextMidY = (next.y + nextNext.y) / 2;
            
            ctx.strokeStyle = baseColor;
            ctx.lineWidth = stitch.thickness * 0.6;
            ctx.shadowBlur = 1;
            ctx.shadowOffsetX = 0.5;
            ctx.shadowOffsetY = 0.5;
            
            ctx.beginPath();
            ctx.moveTo(midX + linkWidth/2, midY);
            ctx.lineTo(nextMidX - linkWidth/2, nextMidY);
            ctx.stroke();
          }
        }
        break;

      case 'backstitch':
        // Backstitch pattern - draw each segment separately
        for (let i = 0; i < points.length - 1; i++) {
          const curr = points[i];
          const next = points[i + 1];
          ctx.beginPath();
          ctx.moveTo(curr.x, curr.y);
          ctx.lineTo(next.x, next.y);
          ctx.stroke();
        }
        break;

      case 'outline':
        // Simple line drawing for outline
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
        break;

      case 'french-knot':
        // French knot - small circular knots with realistic texture
        points.forEach((point, i) => {
          if (i % 3 === 0) {
            // Main knot body
            ctx.beginPath();
            ctx.arc(point.x, point.y, stitch.thickness * 0.8, 0, Math.PI * 2);
            ctx.fill();
            
            // Add highlight for 3D effect
            const originalFillStyle = ctx.fillStyle;
            ctx.fillStyle = adjustBrightness(stitch.color, 40);
            ctx.beginPath();
            ctx.arc(point.x - stitch.thickness * 0.3, point.y - stitch.thickness * 0.3, stitch.thickness * 0.2, 0, Math.PI * 2);
            ctx.fill();
            
            // Add shadow for depth
            ctx.fillStyle = adjustBrightness(stitch.color, -20);
            ctx.beginPath();
            ctx.arc(point.x + stitch.thickness * 0.2, point.y + stitch.thickness * 0.2, stitch.thickness * 0.1, 0, Math.PI * 2);
            ctx.fill();
            
            // Reset fill style
            ctx.fillStyle = originalFillStyle;
          }
        });
        break;

      case 'bullion':
        // Bullion stitch - twisted rope-like appearance with realistic texture
        for (let i = 0; i < points.length - 1; i++) {
          const start = points[i];
          const end = points[i + 1];
          const distance = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
          const twists = Math.max(3, Math.floor(distance / (stitch.thickness * 1.5)));
          
          // Create gradient for rope effect
          const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
          gradient.addColorStop(0, adjustBrightness(stitch.color, -10));
          gradient.addColorStop(0.5, stitch.color);
          gradient.addColorStop(1, adjustBrightness(stitch.color, 10));
          
          for (let t = 0; t < twists; t++) {
            const progress = t / twists;
            const x = start.x + (end.x - start.x) * progress;
            const y = start.y + (end.y - start.y) * progress;
            const offset = Math.sin(progress * Math.PI * 6) * stitch.thickness * 0.4;
            const perpOffset = Math.cos(progress * Math.PI * 6) * stitch.thickness * 0.2;
            
            // Main rope segment
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x + offset, y + perpOffset, stitch.thickness * 0.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Add highlight for 3D effect
            ctx.fillStyle = adjustBrightness(stitch.color, 30);
            ctx.beginPath();
            ctx.arc(x + offset - stitch.thickness * 0.2, y + perpOffset - stitch.thickness * 0.2, stitch.thickness * 0.15, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;

      case 'lazy-daisy':
        // Lazy daisy - petal-like stitches with realistic appearance
        for (let i = 0; i < points.length - 1; i += 2) {
          const center = points[i];
          const petal = points[i + 1];
          if (petal) {
            const angle = Math.atan2(petal.y - center.y, petal.x - center.x);
            const petalLength = Math.sqrt((petal.x - center.x) ** 2 + (petal.y - center.y) ** 2);
            
            // Create gradient for petal effect
            const gradient = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, petalLength);
            gradient.addColorStop(0, adjustBrightness(stitch.color, 20));
            gradient.addColorStop(0.7, stitch.color);
            gradient.addColorStop(1, adjustBrightness(stitch.color, -10));
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.ellipse(center.x, center.y, petalLength, stitch.thickness * 0.6, angle, 0, Math.PI * 2);
            ctx.fill();
            
            // Add petal outline for definition
            ctx.strokeStyle = adjustBrightness(stitch.color, -30);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(center.x, center.y, petalLength, stitch.thickness * 0.6, angle, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        break;

      case 'feather':
        // Feather stitch - zigzag pattern with realistic appearance
        for (let i = 0; i < points.length - 2; i += 2) {
          const start = points[i];
          const middle = points[i + 1];
          const end = points[i + 2];
          
          if (middle && end) {
            // Create gradient for feather effect
            const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
            gradient.addColorStop(0, adjustBrightness(stitch.color, 10));
            gradient.addColorStop(0.5, stitch.color);
            gradient.addColorStop(1, adjustBrightness(stitch.color, -10));
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = stitch.thickness;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(middle.x, middle.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
            
            // Add small decorative elements
            ctx.fillStyle = stitch.color;
            ctx.beginPath();
            ctx.arc(middle.x, middle.y, stitch.thickness * 0.3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;

      case 'couching':
        // Couching - decorative thread laid down and stitched over
        for (let i = 0; i < points.length - 1; i++) {
          const start = points[i];
          const end = points[i + 1];
          
          // Main thread
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
          
          // Couching stitches perpendicular to main thread
          const midX = (start.x + end.x) / 2;
          const midY = (start.y + end.y) / 2;
          const perpAngle = Math.atan2(end.y - start.y, end.x - start.x) + Math.PI / 2;
          const couchingLength = stitch.thickness * 3;
          
          ctx.beginPath();
          ctx.moveTo(midX + Math.cos(perpAngle) * couchingLength, midY + Math.sin(perpAngle) * couchingLength);
          ctx.lineTo(midX - Math.cos(perpAngle) * couchingLength, midY - Math.sin(perpAngle) * couchingLength);
          ctx.stroke();
        }
        break;

      case 'seed':
        // Seed stitch - small random dots
        points.forEach((point, i) => {
          if (i % 2 === 0) {
            const offsetX = (Math.random() - 0.5) * stitch.thickness;
            const offsetY = (Math.random() - 0.5) * stitch.thickness;
            ctx.beginPath();
            ctx.arc(point.x + offsetX, point.y + offsetY, stitch.thickness * 0.3, 0, Math.PI * 2);
            ctx.fill();
          }
        });
        break;

      case 'stem':
        // Stem stitch - twisted line with overlapping
        for (let i = 0; i < points.length - 1; i++) {
          const start = points[i];
          const end = points[i + 1];
          const midX = (start.x + end.x) / 2;
          const midY = (start.y + end.y) / 2;
          
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.quadraticCurveTo(midX, midY, end.x, end.y);
          ctx.stroke();
        }
        break;

      case 'metallic':
        // Metallic thread with shimmer effect
        const metallicGradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
        metallicGradient.addColorStop(0, '#FFD700');
        metallicGradient.addColorStop(0.3, '#FFA500');
        metallicGradient.addColorStop(0.7, '#FFD700');
        metallicGradient.addColorStop(1, '#B8860B');
        
        ctx.strokeStyle = metallicGradient;
        ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
        ctx.shadowBlur = 4;
        
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        break;

      case 'glow-thread':
        // Glow-in-the-dark thread effect
        ctx.strokeStyle = stitch.color;
        ctx.shadowColor = stitch.color;
        ctx.shadowBlur = 8;
        ctx.lineWidth = stitch.thickness * 1.5;
        
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        break;

      case 'variegated':
        // Variegated thread with color changes
        for (let i = 0; i < points.length - 1; i++) {
          const progress = i / (points.length - 1);
          const hue = (progress * 360) % 360;
          const color = `hsl(${hue}, 70%, 50%)`;
          
          ctx.strokeStyle = color;
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[i + 1].x, points[i + 1].y);
          ctx.stroke();
        }
        break;

      case 'gradient':
        // Gradient thread effect
        const gradient = ctx.createLinearGradient(points[0].x, points[0].y, points[points.length - 1].x, points[points.length - 1].y);
        gradient.addColorStop(0, adjustBrightness(stitch.color, -30));
        gradient.addColorStop(0.5, stitch.color);
        gradient.addColorStop(1, adjustBrightness(stitch.color, 30));
        
        ctx.strokeStyle = gradient;
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        break;

      case 'brick':
        // Brick stitch - offset rectangular pattern
        const brickHeight = stitch.thickness * 2;
        const brickWidth = stitch.thickness * 3;
        
        for (let i = 0; i < points.length - 1; i++) {
          const start = points[i];
          const end = points[i + 1];
          const isEvenRow = Math.floor(i / 2) % 2 === 0;
          const offset = isEvenRow ? 0 : brickWidth / 2;
          
          ctx.fillStyle = stitch.color;
          ctx.fillRect(start.x + offset, start.y, brickWidth, brickHeight);
          
          // Add brick texture
          ctx.strokeStyle = adjustBrightness(stitch.color, -20);
          ctx.lineWidth = 1;
          ctx.strokeRect(start.x + offset, start.y, brickWidth, brickHeight);
        }
        break;

      case 'fishbone':
        // Fishbone stitch - V-shaped pattern
        for (let i = 0; i < points.length - 2; i += 2) {
          const center = points[i];
          const left = points[i + 1];
          const right = points[i + 2];
          
          if (left && right) {
            // Left branch
            ctx.beginPath();
            ctx.moveTo(center.x, center.y);
            ctx.lineTo(left.x, left.y);
            ctx.stroke();
            
            // Right branch
            ctx.beginPath();
            ctx.moveTo(center.x, center.y);
            ctx.lineTo(right.x, right.y);
            ctx.stroke();
            
            // Center line
      ctx.beginPath();
            ctx.moveTo(center.x, center.y);
            ctx.lineTo(center.x, center.y + stitch.thickness * 2);
      ctx.stroke();
    }
        }
        break;

      case 'herringbone':
        // Herringbone stitch - chevron pattern
        for (let i = 0; i < points.length - 3; i += 2) {
          const start = points[i];
          const peak = points[i + 1];
          const end = points[i + 2];
          
          if (peak && end) {
            // Create chevron pattern
      ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(peak.x, peak.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
            
            // Add parallel line for herringbone effect
            const offset = stitch.thickness * 0.5;
            ctx.beginPath();
            ctx.moveTo(start.x + offset, start.y);
            ctx.lineTo(peak.x + offset, peak.y);
            ctx.lineTo(end.x + offset, end.y);
      ctx.stroke();
    }
        }
        break;

      case 'long-short':
        // Long-short stitch - alternating length pattern
        for (let i = 0; i < points.length - 1; i++) {
          const start = points[i];
          const end = points[i + 1];
          const isLong = i % 2 === 0;
          const length = isLong ? stitch.thickness * 3 : stitch.thickness * 1.5;
          
          const angle = Math.atan2(end.y - start.y, end.x - start.x);
          const actualEnd = {
            x: start.x + Math.cos(angle) * length,
            y: start.y + Math.sin(angle) * length
          };
          
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(actualEnd.x, actualEnd.y);
          ctx.stroke();
        }
        break;

      case 'split':
        // Split stitch - overlapping pattern
        for (let i = 0; i < points.length - 1; i++) {
          const start = points[i];
          const end = points[i + 1];
          const midX = (start.x + end.x) / 2;
          const midY = (start.y + end.y) / 2;
          
          // First half
      ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(midX, midY);
          ctx.stroke();
          
          // Second half with slight offset
          const offset = stitch.thickness * 0.3;
          ctx.beginPath();
          ctx.moveTo(midX + offset, midY + offset);
          ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }
        break;

      case 'appliqué':
        // Appliqué stitch - decorative edge stitching
        for (let i = 0; i < points.length - 1; i++) {
          const start = points[i];
          const end = points[i + 1];
          
          // Draw decorative zigzag pattern
          const midX = (start.x + end.x) / 2;
          const midY = (start.y + end.y) / 2;
          const offset = stitch.thickness * 0.5;
          
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(midX + offset, midY - offset);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
          
          // Add decorative dots
          ctx.fillStyle = stitch.color;
          ctx.beginPath();
          ctx.arc(midX + offset, midY - offset, stitch.thickness * 0.2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'satin-ribbon':
        // Satin ribbon stitch - wide satin with ribbon effect
        for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1];
          const curr = points[i];
          const next = points[i + 1];
          
          if (next) {
            const cp1x = prev.x + (curr.x - prev.x) / 3;
            const cp1y = prev.y + (curr.y - prev.y) / 3;
            const cp2x = curr.x - (next.x - curr.x) / 3;
            const cp2y = curr.y - (next.y - curr.y) / 3;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
          } else {
            ctx.lineTo(curr.x, curr.y);
          }
        }
        ctx.stroke();
        
        // Add ribbon-like highlights
        ctx.strokeStyle = adjustBrightness(stitch.color, 40);
        ctx.lineWidth = stitch.thickness * 0.2;
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1];
          const curr = points[i];
          const next = points[i + 1];
          
          if (next) {
            const cp1x = prev.x + (curr.x - prev.x) / 3;
            const cp1y = prev.y + (curr.y - prev.y) / 3;
            const cp2x = curr.x - (next.x - curr.x) / 3;
            const cp2y = curr.y - (next.y - curr.y) / 3;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
          } else {
            ctx.lineTo(curr.x, curr.y);
          }
        }
        ctx.stroke();
        break;

      default:
        console.warn(`⚠️ UNKNOWN STITCH TYPE: ${stitch.type} - Using default line drawing`);
        // Default line drawing for unknown types
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        console.log(`📏 Drawing default line with ${points.length} points`);
        ctx.stroke();
    }

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
    
    console.log(`✅ STITCH RENDERED: ${stitch.type} completed successfully`);
  };

  const getLineIntersections = (points: { x: number; y: number }[], y: number): number[] => {
    const intersections: number[] = [];
    
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      
      if ((p1.y <= y && p2.y >= y) || (p1.y >= y && p2.y <= y)) {
        const x = p1.x + (p2.x - p1.x) * (y - p1.y) / (p2.y - p1.y);
        intersections.push(x);
      }
    }
    
    return intersections.sort((a, b) => a - b);
  };

  // Helper function to adjust color brightness
  const adjustBrightness = (color: string, amount: number): string => {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Backend integration functions
  const checkBackendConnection = async () => {
    try {
      const health = await embroideryBackend.checkHealth();
      const inkStitchHealth = await embroideryBackend.checkInkStitchHealth();
      setBackendConnected(health);
      setBackendHealth(inkStitchHealth);
      console.log('Backend connection status:', health);
      console.log('InkStitch health:', inkStitchHealth);
    } catch (error) {
      console.error('Failed to connect to backend:', error);
      setBackendConnected(false);
      setBackendHealth(null);
    }
  };

  const generateProfessionalStitches = async (stitches: EmbroideryStitch[]) => {
    if (!backendConnected) {
      console.warn('Backend not connected, using local rendering only');
      return;
    }

    try {
      // Convert stitches to backend format
      const backendPoints = embroideryBackend.convertStitchesToBackendFormat(stitches);
      
      // Create request for professional stitch generation
      const request: GenerateFromPointsRequest = {
        points: stitches.flatMap(s => s.points),
        canvas_width: 800,
        canvas_height: 600,
        strategy: 'satin', // Use satin for professional look
        density: stitchDensity,
        width_mm: embroideryThickness * 0.1, // Convert thickness to mm
        passes: 2,
        stitch_len_mm: 2.5,
        mm_per_px: 0.26
      };

      const plan = await embroideryBackend.generateFromPoints(request);
      
      // Convert back to frontend format and update stitches
      const professionalStitches = embroideryBackend.convertBackendToFrontendFormat(plan);
      setEmbroideryStitches(professionalStitches);
      
      console.log('Generated professional stitches:', professionalStitches.length);
    } catch (error) {
      console.error('Failed to generate professional stitches:', error);
    }
  };

  // AI-Powered Design Features
  const generateAIDesign = async (description: string) => {
    if (!aiDesignMode) return;
    
    try {
      const response = await fetch('http://localhost:8000/ai/generate-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          fabricType,
          stitchComplexity,
          threadCategory: selectedThreadCategory
        })
      });
      
      const aiDesign = await response.json();
      setSmartSuggestions(aiDesign.suggestions || []);
      
      // Apply AI-generated stitches
      if (aiDesign.stitches) {
        setEmbroideryStitches(aiDesign.stitches);
      }
    } catch (error) {
      console.error('AI design generation failed:', error);
    }
  };

  const optimizeStitchPath = async () => {
    if (!mlOptimization) return;
    
    try {
      const response = await fetch('http://localhost:8000/ai/optimize-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stitches: embroideryStitches,
          fabricPhysics,
          optimizationType: 'efficiency'
        })
      });
      
      const optimized = await response.json();
      setEmbroideryStitches(optimized.stitches);
    } catch (error) {
      console.error('Path optimization failed:', error);
    }
  };

  const suggestThreadColors = async () => {
    try {
      const response = await fetch('http://localhost:8000/ai/suggest-colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStitches: embroideryStitches,
          fabricType,
          designStyle: 'professional'
        })
      });
      
      const suggestions = await response.json();
      setSmartSuggestions(suggestions.colors || []);
    } catch (error) {
      console.error('Color suggestion failed:', error);
    }
  };

  const enableRealTimeCollaboration = () => {
    setRealTimeCollaboration(true);
    // Initialize WebSocket connection for real-time collaboration
    const ws = new WebSocket('ws://localhost:8000/collaborate');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'stitch_update') {
        setEmbroideryStitches(data.stitches);
      } else if (data.type === 'collaborator_joined') {
        setCollaborators(prev => [...prev, data.collaborator]);
      }
    };
  };

  const enableARVRMode = () => {
    setArVrMode(true);
    // Initialize AR/VR capabilities
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
        if (supported) {
          console.log('VR mode available');
        }
      });
    }
  };

  const addDesignLayer = (layerName: string) => {
    const newLayer = {
      id: Date.now(),
      name: layerName,
      stitches: [],
      visible: true,
      locked: false
    };
    setDesignLayers(prev => [...prev, newLayer]);
  };

  const undoAction = () => {
    if (undoStack.length > 0) {
      const lastState = undoStack[undoStack.length - 1];
      setRedoStack(prev => [...prev, { stitches: embroideryStitches }]);
      setEmbroideryStitches(lastState.stitches);
      setUndoStack(prev => prev.slice(0, -1));
    }
  };

  const redoAction = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      setUndoStack(prev => [...prev, { stitches: embroideryStitches }]);
      setEmbroideryStitches(nextState.stitches);
      setRedoStack(prev => prev.slice(0, -1));
    }
  };

  const enhanceStitchQuality = () => {
    // Enhance stitch quality based on fabric type and thread texture
    const enhancedStitches = embroideryStitches.map(stitch => {
      let enhancedStitch = { ...stitch };
      
      // Adjust thickness based on fabric type
      if (fabricType === 'silk') {
        enhancedStitch.thickness = stitch.thickness * 0.8; // Thinner for silk
      } else if (fabricType === 'denim') {
        enhancedStitch.thickness = stitch.thickness * 1.2; // Thicker for denim
      } else if (fabricType === 'linen') {
        enhancedStitch.thickness = stitch.thickness * 1.1; // Slightly thicker for linen
      }
      
      // Adjust opacity based on thread texture
      if (threadTexture === 'metallic') {
        enhancedStitch.opacity = Math.min(1.0, stitch.opacity * 1.2);
      } else if (threadTexture === 'matte') {
        enhancedStitch.opacity = stitch.opacity * 0.9;
      }
      
      return enhancedStitch;
    });
    
    setEmbroideryStitches(enhancedStitches);
    drawStitches();
  };

  const optimizeForFabric = () => {
    // Optimize stitches for specific fabric characteristics
    const optimizedStitches = embroideryStitches.map(stitch => {
      let optimizedStitch = { ...stitch };
      
      // Adjust stitch density based on fabric
      if (fabricType === 'cotton') {
        // Cotton can handle dense stitching
        optimizedStitch.thickness = stitch.thickness * stitchDensity;
      } else if (fabricType === 'silk') {
        // Silk needs lighter touch
        optimizedStitch.thickness = stitch.thickness * stitchDensity * 0.7;
      } else if (fabricType === 'denim') {
        // Denim can handle heavy stitching
        optimizedStitch.thickness = stitch.thickness * stitchDensity * 1.3;
      }
      
      return optimizedStitch;
    });
    
    setEmbroideryStitches(optimizedStitches);
    drawStitches();
  };

  const exportEmbroideryFile = async () => {
    if (!backendConnected) {
      alert('Backend service not available. Please start the AI service.');
      return;
    }

    if (embroideryStitches.length === 0) {
      alert('No stitches to export. Please create some embroidery first.');
      return;
    }

    setIsExporting(true);
    try {
      const backendPoints = embroideryBackend.convertStitchesToBackendFormat(embroideryStitches);
      const exportData = await embroideryBackend.exportFromPoints(backendPoints, exportFormat);
      embroideryBackend.downloadFile(exportData);
      console.log(`Exported embroidery file: ${exportData.filename}`);
    } catch (error) {
      console.error('Failed to export embroidery file:', error);
      alert('Failed to export embroidery file. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const importEmbroideryFile = async (file: File) => {
    if (!backendConnected) {
      alert('Backend service not available. Please start the AI service.');
      return;
    }

    try {
      const plan = await embroideryBackend.parseMachineFile(file);
      const importedStitches = embroideryBackend.convertBackendToFrontendFormat(plan);
      setEmbroideryStitches(importedStitches);
      console.log('Imported embroidery file:', importedStitches.length, 'stitches');
    } catch (error) {
      console.error('Failed to import embroidery file:', error);
      alert('Failed to import embroidery file. Please check the file format.');
    }
  };

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    console.log(`🖱️ MOUSE DOWN: Starting ${embroideryStitchType} stitch at (${x.toFixed(3)}, ${y.toFixed(3)})`);
    
    setIsDrawing(true);
    setCurrentStitch({
      id: `stitch_${Date.now()}`,
      type: embroideryStitchType,
      points: [{ x, y }],
      color: embroideryColor,
      threadType: embroideryThreadType,
      thickness: embroideryThickness,
      opacity: embroideryOpacity
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !currentStitch || !canvasRef.current) return;

    try {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      // Throttle updates for better performance
      const now = Date.now();
      if (now - (handleMouseMove as any).lastUpdate < 16) return; // ~60fps
      (handleMouseMove as any).lastUpdate = now;

      setCurrentStitch(prev => prev ? {
        ...prev,
        points: [...prev.points, { x, y }]
      } : null);

      // Use requestAnimationFrame for smooth rendering
      requestAnimationFrame(() => {
        if (!canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Enable high-quality rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          // Clear only the preview area and redraw
          const rect = canvas.getBoundingClientRect();
          ctx.clearRect(0, 0, rect.width, rect.height);
          
          // Redraw all stitches
          if (Array.isArray(embroideryStitches)) {
            embroideryStitches.forEach((stitch) => {
              drawStitch(ctx, stitch, rect);
            });
          }
          
          // Draw current stitch preview
          if (currentStitch) {
            drawStitch(ctx, currentStitch, rect, true);
          }
        }
      });
    } catch (error) {
      console.error('Error in handleMouseMove:', error);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentStitch) return;

    console.log(`🖱️ MOUSE UP: Completing ${currentStitch.type} stitch with ${currentStitch.points.length} points`);

    try {
      setIsDrawing(false);
      
      // Add to undo stack before making changes
      setUndoStack(prev => [...prev, { stitches: embroideryStitches }]);
      
      // Add the completed stitch
      setEmbroideryStitches([...embroideryStitches, currentStitch]);
      console.log(`✅ STITCH ADDED: Total stitches now: ${embroideryStitches.length + 1}`);
      
      setCurrentStitch(null);
      
      // Redraw all stitches to make them persistent
      drawStitches();
      
      // Clear redo stack when new action is performed
      setRedoStack([]);
    } catch (error) {
      console.error('Error in handleMouseUp:', error);
      setIsDrawing(false);
      setCurrentStitch(null);
    }
  };

  // Generate pattern with AI
  const generatePattern = async () => {
    if (!embroideryPatternDescription.trim()) {
      console.warn('⚠️ No pattern description provided');
      return;
    }

    console.log('🤖 AI GENERATING PATTERN:', embroideryPatternDescription);
    setIsGenerating(true);
    
    try {
      // Simulate AI pattern generation with realistic stitch patterns
      const patterns = generateAIPattern(embroideryPatternDescription, embroideryStitchType, embroideryColor);
      
      if (patterns && patterns.length > 0) {
        console.log(`✅ AI GENERATED ${patterns.length} stitches`);
        setEmbroideryStitches(patterns);
        drawStitches();
      } else {
        console.warn('⚠️ AI generated no stitches');
      }
    } catch (error) {
      console.error('❌ Error generating pattern:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // AI Pattern Generation Function
  const generateAIPattern = (description: string, stitchType: string, color: string) => {
    console.log('🧠 AI PATTERN GENERATOR:', { description, stitchType, color });
    
    const patterns: EmbroideryStitch[] = [];
    const description_lower = description.toLowerCase();
    
    // Generate patterns based on description keywords
    if (description_lower.includes('flower') || description_lower.includes('rose')) {
      patterns.push(...generateFlowerPattern(stitchType, color));
    } else if (description_lower.includes('heart')) {
      patterns.push(...generateHeartPattern(stitchType, color));
    } else if (description_lower.includes('star')) {
      patterns.push(...generateStarPattern(stitchType, color));
    } else if (description_lower.includes('circle') || description_lower.includes('round')) {
      patterns.push(...generateCirclePattern(stitchType, color));
    } else if (description_lower.includes('square') || description_lower.includes('rectangle')) {
      patterns.push(...generateSquarePattern(stitchType, color));
    } else if (description_lower.includes('line') || description_lower.includes('straight')) {
      patterns.push(...generateLinePattern(stitchType, color));
    } else {
      // Default abstract pattern
      patterns.push(...generateAbstractPattern(stitchType, color));
    }
    
    return patterns;
  };

  // Pattern generation helpers
  const generateFlowerPattern = (stitchType: string, color: string) => {
    const patterns: EmbroideryStitch[] = [];
    const centerX = 0.5;
    const centerY = 0.5;
    const radius = 0.1;
    
    // Center
    patterns.push({
      id: `ai_flower_center_${Date.now()}`,
      type: stitchType as any,
      points: [
        { x: centerX, y: centerY },
        { x: centerX + radius * 0.3, y: centerY + radius * 0.3 }
      ],
      color: color,
      threadType: embroideryThreadType,
      thickness: embroideryThickness,
      opacity: embroideryOpacity
    });
    
    // Petals
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const petalX = centerX + Math.cos(angle) * radius;
      const petalY = centerY + Math.sin(angle) * radius;
      
      patterns.push({
        id: `ai_flower_petal_${i}_${Date.now()}`,
        type: stitchType as any,
        points: [
          { x: centerX, y: centerY },
          { x: petalX, y: petalY }
        ],
        color: color,
        threadType: embroideryThreadType,
        thickness: embroideryThickness * 0.8,
        opacity: embroideryOpacity
      });
    }
    
    return patterns;
  };

  const generateHeartPattern = (stitchType: string, color: string) => {
    const patterns: EmbroideryStitch[] = [];
    const centerX = 0.5;
    const centerY = 0.5;
    const size = 0.15;
    
    // Heart shape points
    const heartPoints = [
      { x: centerX, y: centerY + size * 0.3 },
      { x: centerX - size * 0.5, y: centerY - size * 0.2 },
      { x: centerX - size * 0.2, y: centerY - size * 0.4 },
      { x: centerX, y: centerY - size * 0.3 },
      { x: centerX + size * 0.2, y: centerY - size * 0.4 },
      { x: centerX + size * 0.5, y: centerY - size * 0.2 },
      { x: centerX, y: centerY + size * 0.3 }
    ];
    
    patterns.push({
      id: `ai_heart_${Date.now()}`,
      type: stitchType as any,
      points: heartPoints,
      color: color,
      threadType: embroideryThreadType,
      thickness: embroideryThickness,
      opacity: embroideryOpacity
    });
    
    return patterns;
  };

  const generateStarPattern = (stitchType: string, color: string) => {
    const patterns: EmbroideryStitch[] = [];
    const centerX = 0.5;
    const centerY = 0.5;
    const radius = 0.12;
    
    // 5-pointed star
    const starPoints = [];
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5;
      const r = i % 2 === 0 ? radius : radius * 0.4;
      starPoints.push({
        x: centerX + Math.cos(angle) * r,
        y: centerY + Math.sin(angle) * r
      });
    }
    
    patterns.push({
      id: `ai_star_${Date.now()}`,
      type: stitchType as any,
      points: starPoints,
      color: color,
      threadType: embroideryThreadType,
      thickness: embroideryThickness,
      opacity: embroideryOpacity
    });
    
    return patterns;
  };

  const generateCirclePattern = (stitchType: string, color: string) => {
    const patterns: EmbroideryStitch[] = [];
    const centerX = 0.5;
    const centerY = 0.5;
    const radius = 0.1;
    const points = 16;
    
    const circlePoints = [];
    for (let i = 0; i <= points; i++) {
      const angle = (i * Math.PI * 2) / points;
      circlePoints.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      });
    }
    
    patterns.push({
      id: `ai_circle_${Date.now()}`,
      type: stitchType as any,
      points: circlePoints,
      color: color,
      threadType: embroideryThreadType,
      thickness: embroideryThickness,
      opacity: embroideryOpacity
    });
    
    return patterns;
  };

  const generateSquarePattern = (stitchType: string, color: string) => {
    const patterns: EmbroideryStitch[] = [];
    const centerX = 0.5;
    const centerY = 0.5;
    const size = 0.12;
    
    const squarePoints = [
      { x: centerX - size, y: centerY - size },
      { x: centerX + size, y: centerY - size },
      { x: centerX + size, y: centerY + size },
      { x: centerX - size, y: centerY + size },
      { x: centerX - size, y: centerY - size }
    ];
    
    patterns.push({
      id: `ai_square_${Date.now()}`,
      type: stitchType as any,
      points: squarePoints,
      color: color,
      threadType: embroideryThreadType,
      thickness: embroideryThickness,
      opacity: embroideryOpacity
    });
    
    return patterns;
  };

  const generateLinePattern = (stitchType: string, color: string) => {
    const patterns: EmbroideryStitch[] = [];
    
    patterns.push({
      id: `ai_line_${Date.now()}`,
      type: stitchType as any,
      points: [
        { x: 0.3, y: 0.5 },
        { x: 0.7, y: 0.5 }
      ],
      color: color,
      threadType: embroideryThreadType,
      thickness: embroideryThickness,
      opacity: embroideryOpacity
    });
    
    return patterns;
  };

  const generateAbstractPattern = (stitchType: string, color: string) => {
    const patterns: EmbroideryStitch[] = [];
    const centerX = 0.5;
    const centerY = 0.5;
    
    // Random abstract pattern
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const radius = 0.08 + Math.random() * 0.04;
      const endX = centerX + Math.cos(angle) * radius;
      const endY = centerY + Math.sin(angle) * radius;
      
      patterns.push({
        id: `ai_abstract_${i}_${Date.now()}`,
        type: stitchType as any,
        points: [
          { x: centerX, y: centerY },
          { x: endX, y: endY }
        ],
        color: color,
        threadType: embroideryThreadType,
        thickness: embroideryThickness * (0.8 + Math.random() * 0.4),
        opacity: embroideryOpacity
      });
    }
    
    return patterns;
  };

  // ML Optimization Function
  const optimizeWithML = async () => {
    if (embroideryStitches.length === 0) {
      console.warn('⚠️ No stitches to optimize');
      return;
    }

    console.log('🤖 ML OPTIMIZING STITCHES:', embroideryStitches.length);
    setIsOptimizing(true);
    
    try {
      // Simulate ML optimization
      const optimizedStitches = optimizeStitchPathML(embroideryStitches);
      
      if (optimizedStitches && optimizedStitches.length > 0) {
        console.log(`✅ ML OPTIMIZED ${optimizedStitches.length} stitches`);
        setEmbroideryStitches(optimizedStitches);
        drawStitches();
      } else {
        console.warn('⚠️ ML optimization produced no stitches');
      }
    } catch (error) {
      console.error('❌ Error optimizing with ML:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  // ML Optimization Algorithm
  const optimizeStitchPathML = (stitches: EmbroideryStitch[]) => {
    console.log('🧠 ML OPTIMIZER:', { stitchCount: stitches.length });
    
    // Sort stitches by distance to minimize thread jumps
    const optimized = [...stitches].sort((a, b) => {
      if (a.points.length === 0 || b.points.length === 0) return 0;
      
      const aEnd = a.points[a.points.length - 1];
      const bEnd = b.points[b.points.length - 1];
      
      // Simple distance-based sorting
      const aDistance = Math.sqrt(aEnd.x ** 2 + aEnd.y ** 2);
      const bDistance = Math.sqrt(bEnd.x ** 2 + bEnd.y ** 2);
      
      return aDistance - bDistance;
    });
    
    // Add optimization metadata
    optimized.forEach((stitch, index) => {
      stitch.id = `optimized_${index}_${stitch.id}`;
    });
    
    console.log(`🔧 ML OPTIMIZATION COMPLETE: Reordered ${optimized.length} stitches`);
    return optimized;
  };

  // Analyze pattern with AI
  const analyzePattern = async () => {
    if (embroideryStitches.length === 0) return;

    try {
      const analysis = await embroideryAI.analyzePattern(
        embroideryStitches,
        { width: 400, height: 400 }
      );
      
      setAiAnalysis(analysis);
      setShowAnalysis(true);
    } catch (error) {
      console.error('Error analyzing pattern:', error);
    }
  };

  // Suggest thread colors
  const suggestColors = async () => {
    try {
      const colors = await embroideryAI.suggestThreadColors(embroideryColor);
      // You could show these in a color picker or palette
      // Console log removed
    } catch (error) {
      console.error('Error suggesting colors:', error);
    }
  };

  // Clear all stitches
  const clearStitches = () => {
    setEmbroideryStitches([]);
    setCurrentStitch(null);
    drawStitches();
    
    // Clear the composed canvas as well
    if (composedCanvas) {
      const ctx = composedCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, composedCanvas.width, composedCanvas.height);
      }
    }
  };

  // Draw stitch on 3D model texture
  const drawStitchOnModel = (stitch: EmbroideryStitch) => {
    // Get the composed canvas from the Zustand store
    if (!composedCanvas) {
      console.warn('No composed canvas available for embroidery drawing.');
      return;
    }

    const ctx = composedCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      console.error('Could not get 2D context from composed canvas.');
      return;
    }

    if (stitch.points.length < 2) return;

    // Debug logging (can be removed in production)
    console.log('🧵 Drawing stitch on model:', {
      type: stitch.type,
      points: stitch.points.length,
      color: stitch.color,
      thickness: stitch.thickness,
      opacity: stitch.opacity
    });

    ctx.save();
    ctx.globalAlpha = stitch.opacity;
    
    // Create hyperrealistic gradient for thread texture based on fabric type
    const gradient = ctx.createLinearGradient(0, 0, composedCanvas.width, composedCanvas.height);
    const baseColor = stitch.color;
    const darkerColor = adjustBrightness(baseColor, -30);
    const lighterColor = adjustBrightness(baseColor, 30);
    
    // Adjust gradient based on lighting direction
    let gradientStartX = 0, gradientStartY = 0, gradientEndX = composedCanvas.width, gradientEndY = composedCanvas.height;
    if (lightingDirection === 'top-left') {
      gradientStartX = 0; gradientStartY = 0; gradientEndX = composedCanvas.width; gradientEndY = composedCanvas.height;
    } else if (lightingDirection === 'top-right') {
      gradientStartX = composedCanvas.width; gradientStartY = 0; gradientEndX = 0; gradientEndY = composedCanvas.height;
    } else if (lightingDirection === 'bottom-left') {
      gradientStartX = 0; gradientStartY = composedCanvas.height; gradientEndX = composedCanvas.width; gradientEndY = 0;
    } else if (lightingDirection === 'bottom-right') {
      gradientStartX = composedCanvas.width; gradientStartY = composedCanvas.height; gradientEndX = 0; gradientEndY = 0;
    }
    
    const threadGradient = ctx.createLinearGradient(gradientStartX, gradientStartY, gradientEndX, gradientEndY);
    threadGradient.addColorStop(0, lighterColor);
    threadGradient.addColorStop(0.5, baseColor);
    threadGradient.addColorStop(1, darkerColor);
    
    ctx.strokeStyle = threadGradient;
    ctx.lineWidth = stitch.thickness * stitchDensity;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Add shadow for depth and realism based on fabric type
    const shadowIntensity = fabricType === 'silk' ? 0.2 : fabricType === 'denim' ? 0.4 : 0.3;
    ctx.shadowColor = `rgba(0, 0, 0, ${shadowIntensity})`;
    ctx.shadowBlur = fabricType === 'silk' ? 1 : fabricType === 'denim' ? 3 : 2;
    ctx.shadowOffsetX = lightingDirection.includes('right') ? 1 : -1;
    ctx.shadowOffsetY = lightingDirection.includes('bottom') ? 1 : -1;
    
    // Add fabric-specific effects
    if (fabricType === 'silk') {
      // Silk has subtle shimmer
      ctx.globalCompositeOperation = 'overlay';
    } else if (fabricType === 'denim') {
      // Denim has more texture
      ctx.globalCompositeOperation = 'multiply';
    } else if (fabricType === 'linen') {
      // Linen has natural texture
      ctx.globalCompositeOperation = 'soft-light';
    }

    // Convert UV coordinates to canvas coordinates
    const canvasWidth = composedCanvas.width;
    const canvasHeight = composedCanvas.height;
    const points = stitch.points.map(p => ({
      x: p.x * canvasWidth,
      y: (1 - p.y) * canvasHeight // Flip Y coordinate for 3D model
    }));
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    console.log('🧵 Rendering stitch type:', stitch.type);
    
    switch (stitch.type) {
      case 'satin':
        console.log('🧵 SATIN CASE EXECUTING - drawing bezier curves with', points.length, 'points');
        // Smooth curve for satin stitch
    for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1];
          const curr = points[i];
          const next = points[i + 1];
          
          if (next) {
            const cp1x = prev.x + (curr.x - prev.x) / 3;
            const cp1y = prev.y + (curr.y - prev.y) / 3;
            const cp2x = curr.x - (next.x - curr.x) / 3;
            const cp2y = curr.y - (next.y - curr.y) / 3;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
          } else {
            ctx.lineTo(curr.x, curr.y);
          }
        }
        break;

      case 'fill':
        console.log('🧵 FILL CASE EXECUTING - drawing parallel lines');
        // Fill area with parallel lines and alternating direction for realistic fill
        const minY = Math.min(...points.map(p => p.y));
        const maxY = Math.max(...points.map(p => p.y));
        const lineSpacing = stitch.thickness * 1.5;
        
        for (let y = minY; y <= maxY; y += lineSpacing) {
          const intersections = getLineIntersections(points, y);
          for (let i = 0; i < intersections.length; i += 2) {
            const startX = intersections[i];
            const endX = intersections[i + 1] || intersections[i];
            
            // Alternate line direction for more realistic fill
            if (Math.floor((y - minY) / lineSpacing) % 2 === 0) {
        ctx.beginPath();
              ctx.moveTo(startX, y);
              ctx.lineTo(endX, y);
              ctx.stroke();
            } else {
        ctx.beginPath();
              ctx.moveTo(endX, y);
              ctx.lineTo(startX, y);
              ctx.stroke();
            }
          }
        }
        break;

      case 'cross-stitch':
        console.log('🧵 CROSS-STITCH CASE EXECUTING - drawing X patterns');
        // Draw X pattern with enhanced details
        points.forEach((point, i) => {
          if (i % 2 === 0 && points[i + 1]) {
            const next = points[i + 1];
            const size = stitch.thickness * 1.5;
            
            // Draw the X pattern
    ctx.beginPath();
            ctx.moveTo(point.x - size, point.y - size);
            ctx.lineTo(point.x + size, point.y + size);
            ctx.moveTo(point.x - size, point.y + size);
            ctx.lineTo(point.x + size, point.y - size);
            ctx.stroke();
            
            // Add small dots at the corners for more realistic appearance
            ctx.beginPath();
            ctx.arc(point.x - size, point.y - size, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(point.x + size, point.y + size, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(point.x - size, point.y + size, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(point.x + size, point.y - size, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        });
        break;

      case 'chain':
        console.log('🧵 CHAIN CASE EXECUTING - drawing chain links');
        // Chain stitch pattern - draw connected oval links
    for (let i = 0; i < points.length - 1; i++) {
          const curr = points[i];
      const next = points[i + 1];
          const midX = (curr.x + next.x) / 2;
          const midY = (curr.y + next.y) / 2;
          
          // Calculate link dimensions
          const linkWidth = stitch.thickness * 1.5;
          const linkHeight = stitch.thickness * 0.8;
          
          // Draw oval chain link
      ctx.beginPath();
          ctx.ellipse(midX, midY, linkWidth/2, linkHeight/2, 0, 0, Math.PI * 2);
      ctx.stroke();
      
          // Draw inner oval for chain link hole
      ctx.beginPath();
          ctx.ellipse(midX, midY, linkWidth/3, linkHeight/3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
        break;

      case 'backstitch':
        console.log('🧵 BACKSTITCH CASE EXECUTING - drawing individual segments');
        // Backstitch pattern - draw each segment separately
    for (let i = 0; i < points.length - 1; i++) {
          const curr = points[i];
      const next = points[i + 1];
        ctx.beginPath();
          ctx.moveTo(curr.x, curr.y);
      ctx.lineTo(next.x, next.y);
        ctx.stroke();
      }
        break;

      case 'outline':
        console.log('🧵 OUTLINE CASE EXECUTING - drawing simple lines');
        // Simple line drawing for outline
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
        break;

      case 'french-knot':
        console.log('🧵 FRENCH-KNOT CASE EXECUTING - drawing circular knots');
        points.forEach((point, i) => {
          const size = stitch.thickness * 2;
          ctx.beginPath();
          ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
          ctx.fill();
        });
        break;

      case 'bullion':
        console.log('🧵 BULLION CASE EXECUTING - drawing twisted rope');
    for (let i = 0; i < points.length - 1; i++) {
          const curr = points[i];
      const next = points[i + 1];
          const midX = (curr.x + next.x) / 2;
          const midY = (curr.y + next.y) / 2;
          const length = Math.sqrt((next.x - curr.x) ** 2 + (next.y - curr.y) ** 2);
          const angle = Math.atan2(next.y - curr.y, next.x - curr.x);
          
          ctx.beginPath();
          ctx.ellipse(midX, midY, length / 2, stitch.thickness, angle, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'lazy-daisy':
        console.log('🧵 LAZY-DAISY CASE EXECUTING - drawing petal stitches');
        points.forEach((point, i) => {
          if (i % 2 === 0 && points[i + 1]) {
            const next = points[i + 1];
            const size = stitch.thickness * 1.5;
      ctx.beginPath();
            ctx.ellipse(point.x, point.y, size, size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
          }
        });
        break;

      case 'feather':
        console.log('🧵 FEATHER CASE EXECUTING - drawing zigzag pattern');
        for (let i = 0; i < points.length - 1; i += 2) {
          if (points[i + 1]) {
            const curr = points[i];
            const next = points[i + 1];
      ctx.beginPath();
            ctx.moveTo(curr.x, curr.y);
      ctx.lineTo(next.x, next.y);
      ctx.stroke();
    }
        }
        break;

      case 'couching':
        console.log('🧵 COUCHING CASE EXECUTING - drawing decorative overlay');
    for (let i = 0; i < points.length - 1; i++) {
          const curr = points[i];
      const next = points[i + 1];
      ctx.beginPath();
          ctx.moveTo(curr.x, curr.y);
      ctx.lineTo(next.x, next.y);
      ctx.stroke();
        }
        break;

      case 'seed':
        console.log('🧵 SEED CASE EXECUTING - drawing random dots');
        points.forEach((point, i) => {
          const size = stitch.thickness * 0.5;
          ctx.beginPath();
          ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
          ctx.fill();
        });
        break;

      case 'stem':
        console.log('🧵 STEM CASE EXECUTING - drawing twisted line');
        for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
          const curr = points[i];
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
        ctx.stroke();
      }
        break;

      case 'metallic':
        console.log('🧵 METALLIC CASE EXECUTING - drawing shimmer effect');
        for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1];
          const curr = points[i];
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.stroke();
        }
        break;

      case 'glow-thread':
        console.log('🧵 GLOW-THREAD CASE EXECUTING - drawing glow effect');
        for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1];
          const curr = points[i];
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.stroke();
        }
        break;

      case 'variegated':
        console.log('🧵 VARIEGATED CASE EXECUTING - drawing color changes');
        for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1];
          const curr = points[i];
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.stroke();
        }
        break;

      case 'gradient':
        console.log('🧵 GRADIENT CASE EXECUTING - drawing gradient effect');
        for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1];
          const curr = points[i];
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.stroke();
        }
        break;

      case 'brick':
        console.log('🧵 BRICK CASE EXECUTING - drawing offset rectangles');
        for (let i = 0; i < points.length - 1; i += 2) {
          if (points[i + 1]) {
            const curr = points[i];
            const next = points[i + 1];
            const width = Math.abs(next.x - curr.x);
            const height = stitch.thickness;
            ctx.fillRect(curr.x, curr.y - height / 2, width, height);
          }
        }
        break;

      case 'fishbone':
        console.log('🧵 FISHBONE CASE EXECUTING - drawing V patterns');
        for (let i = 0; i < points.length - 2; i += 3) {
          if (points[i + 1] && points[i + 2]) {
            const curr = points[i];
            const left = points[i + 1];
            const right = points[i + 2];
            ctx.beginPath();
            ctx.moveTo(curr.x, curr.y);
            ctx.lineTo(left.x, left.y);
            ctx.moveTo(curr.x, curr.y);
            ctx.lineTo(right.x, right.y);
            ctx.stroke();
          }
        }
        break;

      case 'herringbone':
        console.log('🧵 HERRINGBONE CASE EXECUTING - drawing chevron pattern');
        for (let i = 0; i < points.length - 1; i++) {
          const curr = points[i];
          const next = points[i + 1];
          ctx.beginPath();
          ctx.moveTo(curr.x, curr.y);
          ctx.lineTo(next.x, next.y);
          ctx.stroke();
        }
        break;

      case 'long-short':
        console.log('🧵 LONG-SHORT CASE EXECUTING - drawing alternating lengths');
        for (let i = 0; i < points.length - 1; i++) {
          const curr = points[i];
          const next = points[i + 1];
          const length = Math.sqrt((next.x - curr.x) ** 2 + (next.y - curr.y) ** 2);
          const isLong = i % 2 === 0;
          const factor = isLong ? 1 : 0.6;
          const endX = curr.x + (next.x - curr.x) * factor;
          const endY = curr.y + (next.y - curr.y) * factor;
          
      ctx.beginPath();
          ctx.moveTo(curr.x, curr.y);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
        break;

      case 'split':
        console.log('🧵 SPLIT CASE EXECUTING - drawing overlapping pattern');
        for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1];
          const curr = points[i];
      ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.stroke();
        }
        break;

      case 'appliqué':
        console.log('🧵 APPLIQUÉ CASE EXECUTING - drawing decorative edge');
        for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1];
          const curr = points[i];
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.stroke();
        }
        break;

      case 'satin-ribbon':
        console.log('🧵 SATIN-RIBBON CASE EXECUTING - drawing wide satin with ribbon effect');
        for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1];
          const curr = points[i];
          const next = points[i + 1];
          
          if (next) {
            const cp1x = prev.x + (curr.x - prev.x) / 3;
            const cp1y = prev.y + (curr.y - prev.y) / 3;
            const cp2x = curr.x - (next.x - curr.x) / 3;
            const cp2y = curr.y - (next.y - curr.y) / 3;
            
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(curr.x, curr.y);
            ctx.stroke();
          }
        }
        break;

      default:
        console.log('🧵 Using DEFAULT case for stitch type:', stitch.type);
        // Default line drawing for unknown types
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
    }
    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
    
    // Dispatch custom event to signal texture update
    const textureUpdateEvent = new CustomEvent('embroideryTextureUpdate');
    window.dispatchEvent(textureUpdateEvent);
  };

  // Listen for embroidery events from 3D canvas
  useEffect(() => {
    const handleEmbroideryStart = (e: CustomEvent) => {
      const { u, v } = e.detail;
      setIsDrawing(true);
      console.log('🧵 Starting embroidery with stitch type:', embroideryStitchType, 'Type of:', typeof embroideryStitchType);
      const newStitch = {
        id: `stitch_${Date.now()}`,
        type: embroideryStitchType,
        points: [{ x: u, y: v }],
        color: embroideryColor,
        threadType: embroideryThreadType,
        thickness: embroideryThickness,
        opacity: embroideryOpacity
      };
      console.log('🧵 Created stitch object:', newStitch);
      setCurrentStitch(newStitch);
    };

    const handleEmbroideryMove = (e: CustomEvent) => {
      if (!isDrawing || !currentStitch) return;
      const { u, v } = e.detail;
      
      const newStitch = {
        ...currentStitch,
        points: [...currentStitch.points, { x: u, y: v }]
      };
      setCurrentStitch(newStitch);
      
      console.log('🧵 Move event - stitch type:', newStitch.type, 'points:', newStitch.points.length);
      
      // Draw the current stitch on the 3D model
      drawStitchOnModel(newStitch);
    };

    const handleEmbroideryEnd = () => {
      if (!isDrawing || !currentStitch) return;
      setIsDrawing(false);
      setEmbroideryStitches([...embroideryStitches, currentStitch]);
      setCurrentStitch(null);
    };

    window.addEventListener('embroideryStart', handleEmbroideryStart as EventListener);
    window.addEventListener('embroideryMove', handleEmbroideryMove as EventListener);
    window.addEventListener('embroideryEnd', handleEmbroideryEnd);

    return () => {
      window.removeEventListener('embroideryStart', handleEmbroideryStart as EventListener);
      window.removeEventListener('embroideryMove', handleEmbroideryMove as EventListener);
      window.removeEventListener('embroideryEnd', handleEmbroideryEnd);
    };
  }, [isDrawing, currentStitch, embroideryStitchType, embroideryColor, embroideryThreadType, embroideryThickness, embroideryOpacity, setEmbroideryStitches, composedCanvas]);


  // Redraw when stitches change
  useEffect(() => {
    drawStitches();
  }, [embroideryStitches, currentStitch]);

  // Debug stitch type changes
  useEffect(() => {
    console.log('🧵 Current stitch type:', embroideryStitchType);
  }, [embroideryStitchType]);

  // Check backend connection on mount
  useEffect(() => {
    checkBackendConnection();
  }, []);

  return (
    <div className="embroidery-sidebar" style={{
      background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
      color: 'white',
      height: '100%',
      overflow: 'auto'
    }}>
      <div className="tool-header" style={{
        background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
        color: 'white',
        padding: '16px',
        textAlign: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>🧵 Embroidery Tool</h3>
        <div className="tool-status" style={{ marginTop: '4px', display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
          <span className={`status-indicator ${isDrawing ? 'drawing' : 'idle'}`} style={{
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            background: isDrawing ? '#10B981' : '#6B7280',
            color: 'white'
          }}>
            {isDrawing ? 'Drawing' : 'Ready'}
          </span>
          <span style={{ fontSize: '11px', opacity: 0.8 }}>
            {embroideryStitches.length} stitches
          </span>
          {embroideryAIEnabled && (
            <span style={{ fontSize: '10px', opacity: 0.7 }}>
              🤖 AI
            </span>
          )}
      </div>

        {/* Quick AI Actions */}
        <div style={{ marginTop: '8px', display: 'flex', gap: '4px', justifyContent: 'center' }}>
          <button
            onClick={generatePattern}
            disabled={isGenerating || !embroideryPatternDescription.trim()}
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              background: isGenerating ? '#6B7280' : '#8B5CF6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              opacity: isGenerating ? 0.6 : 1
            }}
          >
            {isGenerating ? 'Generating...' : '🤖 Generate'}
          </button>
          <button
            onClick={analyzePattern}
            disabled={embroideryStitches.length === 0}
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              background: embroideryStitches.length === 0 ? '#6B7280' : '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: embroideryStitches.length === 0 ? 'not-allowed' : 'pointer',
              opacity: embroideryStitches.length === 0 ? 0.6 : 1
            }}
          >
            🔍 Analyze
          </button>
        </div>
      </div>

      <div className="embroidery-controls" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '16px'
      }}>
        {/* Pattern Description */}
        <div className="control-group" style={{
          background: 'rgba(139, 92, 246, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#E2E8F0'
          }}>Pattern Description</label>
          <textarea
            value={embroideryPatternDescription}
            onChange={(e) => setEmbroideryPatternDescription(e.target.value)}
            placeholder="Describe the embroidery pattern you want to create..."
            rows={3}
          />
          <button 
            onClick={generatePattern}
            disabled={isGenerating || !embroideryPatternDescription.trim()}
            className="generate-btn"
          >
            {isGenerating ? 'Generating...' : 'Generate Pattern'}
          </button>
        </div>

        {/* Stitch Type */}
        <div className="control-group" style={{
          background: 'rgba(139, 92, 246, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#E2E8F0'
          }}>Stitch Type</label>
        <select
            value={embroideryStitchType}
            onChange={(e) => {
              const newType = e.target.value;
              console.log(`🔄 STITCH TYPE CHANGED: ${embroideryStitchType} → ${newType}`);
              setEmbroideryStitchType(newType as any);
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #475569',
              background: '#1E293B',
              color: '#E2E8F0',
              fontSize: '14px'
            }}
          >
            {advancedStitchTypes.map((stitchType) => (
              <option key={stitchType} value={stitchType}>
                {stitchType === 'satin' && '🧵 Satin Stitch'}
                {stitchType === 'fill' && '🟦 Fill Stitch'}
                {stitchType === 'outline' && '📏 Outline Stitch'}
                {stitchType === 'cross-stitch' && '❌ Cross Stitch'}
                {stitchType === 'chain' && '⛓️ Chain Stitch'}
                {stitchType === 'backstitch' && '↩️ Back Stitch'}
                {stitchType === 'french-knot' && '🎯 French Knot'}
                {stitchType === 'bullion' && '🌀 Bullion Stitch'}
                {stitchType === 'lazy-daisy' && '🌸 Lazy Daisy'}
                {stitchType === 'feather' && '🪶 Feather Stitch'}
                {stitchType === 'couching' && '🎀 Couching'}
                {stitchType === 'appliqué' && '🎨 Appliqué'}
                {stitchType === 'seed' && '🌱 Seed Stitch'}
                {stitchType === 'stem' && '🌿 Stem Stitch'}
                {stitchType === 'metallic' && '✨ Metallic Thread'}
                {stitchType === 'glow-thread' && '🌟 Glow Thread'}
                {stitchType === 'variegated' && '🌈 Variegated'}
                {stitchType === 'gradient' && '🎨 Gradient'}
                {!['satin', 'fill', 'outline', 'cross-stitch', 'chain', 'backstitch', 'french-knot', 'bullion', 'lazy-daisy', 'feather', 'couching', 'appliqué', 'seed', 'stem', 'metallic', 'glow-thread', 'variegated', 'gradient'].includes(stitchType) && 
                  `🧵 ${stitchType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
              </option>
            ))}
        </select>
      </div>

        {/* Thread Type */}
        <div className="control-group">
          <label>Thread Type</label>
        <select
            value={embroideryThreadType}
            onChange={(e) => setEmbroideryThreadType(e.target.value as any)}
        >
          <option value="cotton">Cotton</option>
          <option value="polyester">Polyester</option>
          <option value="silk">Silk</option>
          <option value="metallic">Metallic</option>
          <option value="glow">Glow-in-Dark</option>
        </select>
      </div>

        {/* Color */}
        <div className="control-group">
          <label>Thread Color</label>
          <div className="color-input-group">
            <input 
              type="color"
              value={embroideryColor}
              onChange={(e) => setEmbroideryColor(e.target.value)}
            />
            <button onClick={suggestColors} className="suggest-btn">
              Suggest Colors
            </button>
        </div>
        </div>
        
        {/* Thickness */}
        <div className="control-group">
          <label>Thread Thickness: {embroideryThickness}px</label>
            <input 
            type="range" 
            min="1"
            max="10"
            value={embroideryThickness}
            onChange={(e) => setEmbroideryThickness(Number(e.target.value))}
          />
        </div>
        
        {/* Opacity */}
        <div className="control-group" style={{
          background: 'rgba(139, 92, 246, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#E2E8F0'
          }}>Opacity: {Math.round(embroideryOpacity * 100)}%</label>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            value={embroideryOpacity}
            onChange={(e) => setEmbroideryOpacity(Number(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#8B5CF6'
            }}
          />
        </div>
        
        {/* Stitch Density */}
        <div className="control-group" style={{
          background: 'rgba(139, 92, 246, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#E2E8F0'
          }}>Stitch Density: {Math.round(stitchDensity * 100)}%</label>
          <input 
            type="range" 
          min="0.1"
            max="1" 
            step="0.1" 
          value={stitchDensity}
            onChange={(e) => setStitchDensity(Number(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#8B5CF6'
            }}
          />
        </div>

        {/* Underlay Type */}
        <div className="control-group" style={{
          background: 'rgba(139, 92, 246, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#E2E8F0'
          }}>Underlay Type</label>
          <select
            value={underlayType}
            onChange={(e) => setUnderlayType(e.target.value as any)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #475569',
              background: '#1E293B',
              color: '#E2E8F0',
              fontSize: '14px'
            }}
          >
            <option value="none">🚫 None</option>
            <option value="center">🎯 Center</option>
            <option value="contour">🔄 Contour</option>
            <option value="zigzag">⚡ Zigzag</option>
          </select>
      </div>

        {/* Thread Palette */}
        <div className="control-group" style={{
          background: 'rgba(139, 92, 246, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#E2E8F0'
          }}>Thread Palette</label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginBottom: '8px'
          }}>
            {threadPalette.map((color, index) => (
            <button
                key={index}
                onClick={() => setEmbroideryColor(color)}
              style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  border: embroideryColor === color ? '3px solid #8B5CF6' : '2px solid #475569',
                  background: color,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title={`Select ${color}`}
              />
            ))}
          </div>
          <button
            onClick={() => {
              const newColor = prompt('Enter hex color (e.g., #FF0000):');
              if (newColor && /^#[0-9A-F]{6}$/i.test(newColor)) {
                setThreadPalette([...threadPalette, newColor]);
              }
            }}
            style={{
              width: '100%',
                padding: '8px',
              borderRadius: '6px',
              border: '1px solid #475569',
              background: '#1E293B',
              color: '#E2E8F0',
                cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            + Add Color
            </button>
        </div>

        {/* AI Controls */}
        <div className="control-group">
          <label>
        <input
              type="checkbox"
              checked={embroideryAIEnabled}
              onChange={(e) => setEmbroideryAIEnabled(e.target.checked)}
            />
            Enable AI Analysis
          </label>
      </div>

        {/* Stitch Direction */}
        <div className="control-group" style={{
          background: 'rgba(139, 92, 246, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#E2E8F0'
          }}>Stitch Direction</label>
          <select
            value={stitchDirection}
            onChange={(e) => setStitchDirection(e.target.value as any)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #475569',
              background: '#1E293B',
              color: '#E2E8F0',
              fontSize: '14px'
            }}
          >
            <option value="horizontal">↔️ Horizontal</option>
            <option value="vertical">↕️ Vertical</option>
            <option value="diagonal">↗️ Diagonal</option>
            <option value="radial">⚡ Radial</option>
          </select>
        </div>

        {/* Stitch Spacing */}
        <div className="control-group" style={{
          background: 'rgba(139, 92, 246, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#E2E8F0'
          }}>Stitch Spacing: {stitchSpacing}px</label>
        <input
          type="range"
          min="0.1"
            max="2"
          step="0.1"
            value={stitchSpacing}
            onChange={(e) => setStitchSpacing(Number(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#8B5CF6'
            }}
        />
      </div>

        {/* Professional Stitch Controls */}
        <div className="control-group" style={{
          background: 'rgba(34, 197, 94, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          marginBottom: '12px'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#22C55E'
          }}>Professional Controls</label>
          
          {/* Stitch Density */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', color: '#22C55E' }}>Stitch Density: {stitchDensity}x</label>
        <input
          type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={stitchDensity}
              onChange={(e) => setStitchDensity(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#22C55E'
              }}
            />
          </div>
          
          {/* Thread Texture */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', color: '#22C55E' }}>Thread Texture:</label>
            <select
              value={threadTexture}
              onChange={(e) => setThreadTexture(e.target.value)}
              style={{
                width: '100%',
                padding: '4px',
                borderRadius: '4px',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                backgroundColor: 'rgba(34, 197, 94, 0.05)',
                color: '#22C55E'
              }}
            >
              <option value="smooth">Smooth</option>
              <option value="textured">Textured</option>
              <option value="metallic">Metallic</option>
              <option value="matte">Matte</option>
            </select>
          </div>
          
          {/* Lighting Direction */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', color: '#22C55E' }}>Lighting:</label>
            <select
              value={lightingDirection}
              onChange={(e) => setLightingDirection(e.target.value)}
              style={{
                width: '100%',
                padding: '4px',
                borderRadius: '4px',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                backgroundColor: 'rgba(34, 197, 94, 0.05)',
                color: '#22C55E'
              }}
            >
              <option value="top-left">Top Left</option>
              <option value="top-right">Top Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-right">Bottom Right</option>
            </select>
          </div>
          
          {/* Fabric Type */}
          <div>
            <label style={{ fontSize: '12px', color: '#22C55E' }}>Fabric Type:</label>
            <select
              value={fabricType}
              onChange={(e) => setFabricType(e.target.value)}
              style={{
                width: '100%',
                padding: '4px',
                borderRadius: '4px',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                backgroundColor: 'rgba(34, 197, 94, 0.05)',
                color: '#22C55E'
              }}
            >
              <option value="cotton">Cotton</option>
              <option value="silk">Silk</option>
              <option value="denim">Denim</option>
              <option value="linen">Linen</option>
              <option value="polyester">Polyester</option>
            </select>
          </div>
      </div>

      {/* Pattern Library */}
        <div className="control-group" style={{
          background: 'rgba(139, 92, 246, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#E2E8F0'
          }}>Pattern Library</label>
          <button
            onClick={() => setShowPatternLibrary(!showPatternLibrary)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #475569',
              background: '#1E293B',
              color: '#E2E8F0',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {showPatternLibrary ? 'Hide' : 'Show'} Patterns
          </button>
          
          {showPatternLibrary && (
            <div style={{
              marginTop: '8px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px'
            }}>
              {embroideryPatterns.map((pattern) => (
            <button
              key={pattern.id}
                  onClick={() => {
                    setSelectedPattern(pattern.id);
                    setEmbroideryStitchType(pattern.type as any);
                  }}
              style={{
                padding: '8px',
                    borderRadius: '6px',
                    border: selectedPattern === pattern.id ? '2px solid #8B5CF6' : '1px solid #475569',
                    background: selectedPattern === pattern.id ? 'rgba(139, 92, 246, 0.2)' : '#1E293B',
                    color: '#E2E8F0',
                cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {pattern.name}
            </button>
          ))}
        </div>
          )}
      </div>

        {/* Revolutionary Advanced Stitch Types */}
        <div className="control-group" style={{
          background: 'rgba(255, 0, 150, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 0, 150, 0.3)',
          marginBottom: '12px'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#FF0096'
          }}>🚀 Advanced Stitch Types</label>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px',
            marginBottom: '8px'
          }}>
            {advancedStitchTypes.slice(6).map((stitchType) => (
              <button
                key={stitchType}
                onClick={() => {
                  console.log(`🚀 ADVANCED STITCH SELECTED: ${stitchType}`);
                  setSelectedAdvancedStitch(stitchType);
                  setEmbroideryStitchType(stitchType as any);
                }}
                style={{
                  padding: '6px 8px',
                  fontSize: '10px',
                borderRadius: '4px',
                  border: selectedAdvancedStitch === stitchType ? '2px solid #FF0096' : '1px solid #475569',
                  background: selectedAdvancedStitch === stitchType ? 'rgba(255, 0, 150, 0.2)' : '#1E293B',
                  color: '#E2E8F0',
                cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {stitchType.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

        {/* Revolutionary Thread Library */}
        <div className="control-group" style={{
          background: 'rgba(0, 255, 255, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          marginBottom: '12px'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#00FFFF'
          }}>🌈 Revolutionary Thread Library</label>
          
          <div style={{ marginBottom: '8px' }}>
            <select
              value={selectedThreadCategory}
              onChange={(e) => setSelectedThreadCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '6px',
                borderRadius: '4px',
                border: '1px solid rgba(0, 255, 255, 0.3)',
                background: 'rgba(0, 255, 255, 0.05)',
                color: '#00FFFF'
              }}
            >
              <option value="metallic">✨ Metallic Threads</option>
              <option value="variegated">🎨 Variegated Threads</option>
              <option value="glow">🌟 Glow-in-Dark Threads</option>
              <option value="specialty">💎 Specialty Threads</option>
            </select>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '4px'
          }}>
            {threadLibrary[selectedThreadCategory as keyof typeof threadLibrary].map((color, index) => (
              <button
                key={index}
                onClick={() => setEmbroideryColor(color)}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: embroideryColor === color ? '2px solid #00FFFF' : '1px solid #475569',
                  background: color,
                  cursor: 'pointer'
                }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* AI-Powered Design Features */}
        <div className="control-group" style={{
          background: 'rgba(255, 165, 0, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 165, 0, 0.3)',
          marginBottom: '12px'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#FFA500'
          }}>🤖 AI-Powered Features</label>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <button
              onClick={() => setAiDesignMode(!aiDesignMode)}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 165, 0, 0.3)',
                background: aiDesignMode ? 'rgba(255, 165, 0, 0.2)' : '#1E293B',
                color: '#FFA500',
                cursor: 'pointer'
              }}
            >
              {aiDesignMode ? '🤖 AI Mode ON' : '🤖 AI Mode OFF'}
            </button>
            
            <button
              onClick={() => {
                setMlOptimization(!mlOptimization);
                if (!mlOptimization) {
                  optimizeWithML();
                }
              }}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 165, 0, 0.3)',
                background: mlOptimization ? 'rgba(255, 165, 0, 0.2)' : '#1E293B',
                color: '#FFA500',
                cursor: 'pointer'
              }}
            >
              {isOptimizing ? '🧠 Optimizing...' : mlOptimization ? '🧠 ML ON' : '🧠 ML OFF'}
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            <button
              onClick={() => generateAIDesign('Create a beautiful floral pattern')}
                style={{
                  padding: '4px 8px',
                fontSize: '10px',
                  borderRadius: '4px',
                border: '1px solid rgba(255, 165, 0, 0.3)',
                background: '#1E293B',
                color: '#FFA500',
                cursor: 'pointer'
              }}
            >
              🌸 AI Design
            </button>
            
            <button
              onClick={optimizeStitchPath}
              style={{
                padding: '4px 8px',
                  fontSize: '10px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 165, 0, 0.3)',
                background: '#1E293B',
                color: '#FFA500',
                cursor: 'pointer'
              }}
            >
              ⚡ Optimize
            </button>
            
            <button
              onClick={suggestThreadColors}
              style={{
                padding: '4px 8px',
                fontSize: '10px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 165, 0, 0.3)',
                background: '#1E293B',
                color: '#FFA500',
                cursor: 'pointer'
              }}
            >
              🎨 Suggest Colors
            </button>
          </div>
        </div>

        {/* Real-time Collaboration & AR/VR */}
        <div className="control-group" style={{
          background: 'rgba(138, 43, 226, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(138, 43, 226, 0.3)',
          marginBottom: '12px'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#8A2BE2'
          }}>🌐 Next-Gen Features</label>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <button
              onClick={enableRealTimeCollaboration}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                borderRadius: '4px',
                border: '1px solid rgba(138, 43, 226, 0.3)',
                background: realTimeCollaboration ? 'rgba(138, 43, 226, 0.2)' : '#1E293B',
                color: '#8A2BE2',
                cursor: 'pointer'
              }}
            >
              {realTimeCollaboration ? '👥 Collaborating' : '👥 Start Collab'}
            </button>
            
            <button
              onClick={enableARVRMode}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                borderRadius: '4px',
                border: '1px solid rgba(138, 43, 226, 0.3)',
                background: arVrMode ? 'rgba(138, 43, 226, 0.2)' : '#1E293B',
                color: '#8A2BE2',
                cursor: 'pointer'
              }}
            >
              {arVrMode ? '🥽 AR/VR ON' : '🥽 AR/VR OFF'}
            </button>
          </div>
          
          {collaborators.length > 0 && (
            <div style={{ fontSize: '10px', color: '#8A2BE2', marginTop: '4px' }}>
              Collaborators: {collaborators.length}
            </div>
          )}
        </div>

        {/* Layer Management & Undo/Redo */}
        <div className="control-group" style={{
          background: 'rgba(50, 205, 50, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(50, 205, 50, 0.3)',
          marginBottom: '12px'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#32CD32'
          }}>📚 Professional Tools</label>
          
          <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
            <button
              onClick={undoAction}
              disabled={undoStack.length === 0}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                borderRadius: '4px',
                border: '1px solid rgba(50, 205, 50, 0.3)',
                background: undoStack.length === 0 ? '#6B7280' : '#1E293B',
                color: undoStack.length === 0 ? '#9CA3AF' : '#32CD32',
                cursor: undoStack.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              ↶ Undo
            </button>
            
            <button
              onClick={redoAction}
              disabled={redoStack.length === 0}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                borderRadius: '4px',
                border: '1px solid rgba(50, 205, 50, 0.3)',
                background: redoStack.length === 0 ? '#6B7280' : '#1E293B',
                color: redoStack.length === 0 ? '#9CA3AF' : '#32CD32',
                cursor: redoStack.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              ↷ Redo
            </button>
            
            <button
              onClick={() => addDesignLayer(`Layer ${designLayers.length + 1}`)}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                borderRadius: '4px',
                border: '1px solid rgba(50, 205, 50, 0.3)',
                background: '#1E293B',
                color: '#32CD32',
                cursor: 'pointer'
              }}
            >
              ➕ Add Layer
            </button>
            
            <button
              onClick={enhanceStitchQuality}
              disabled={embroideryStitches.length === 0}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                borderRadius: '4px',
                border: '1px solid rgba(50, 205, 50, 0.3)',
                background: embroideryStitches.length === 0 ? '#6B7280' : '#1E293B',
                color: embroideryStitches.length === 0 ? '#9CA3AF' : '#32CD32',
                cursor: embroideryStitches.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              ✨ Enhance Quality
            </button>
            
            <button
              onClick={optimizeForFabric}
              disabled={embroideryStitches.length === 0}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                borderRadius: '4px',
                border: '1px solid rgba(50, 205, 50, 0.3)',
                background: embroideryStitches.length === 0 ? '#6B7280' : '#1E293B',
                color: embroideryStitches.length === 0 ? '#9CA3AF' : '#32CD32',
                cursor: embroideryStitches.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              🎯 Optimize Fabric
            </button>
          </div>
          
          {designLayers.length > 0 && (
            <div style={{ fontSize: '10px', color: '#32CD32' }}>
              Layers: {designLayers.length} | Current: {currentLayer + 1}
            </div>
          )}
        </div>

        {/* Performance Monitoring */}
        <div className="control-group" style={{
          background: 'rgba(255, 140, 0, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 140, 0, 0.3)',
          marginBottom: '12px'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#FF8C00'
          }}>⚡ Performance Monitor</label>
          
          <div style={{ fontSize: '10px', color: '#FF8C00', lineHeight: '1.4' }}>
            <div>Render Time: {performanceStats.renderTime}ms</div>
            <div>Stitch Count: {performanceStats.stitchCount}</div>
            <div>Memory Usage: {performanceStats.memoryUsage}MB</div>
            <div style={{ 
              marginTop: '4px', 
              padding: '2px 4px', 
              background: performanceStats.renderTime > 16 ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 255, 0, 0.2)',
              borderRadius: '3px',
              fontSize: '9px'
            }}>
              {performanceStats.renderTime > 16 ? '⚠️ Slow Rendering' : '✅ Good Performance'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button onClick={analyzePattern} disabled={embroideryStitches.length === 0}>
            Analyze Pattern
          </button>
          <button onClick={clearStitches} className="clear-btn">
            Clear All
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="embroidery-canvas-container" ref={containerRef} style={{
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        border: '2px solid #8B5CF6',
        borderRadius: '12px',
        padding: '16px',
        margin: '8px 0'
      }}>
        <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <div>
            <h4 style={{ margin: 0, color: '#E2E8F0', fontSize: '16px' }}>
              🎨 Design Canvas ({embroideryStitches.length} stitches)
            </h4>
            <p style={{ margin: '4px 0 0 0', color: '#94A3B8', fontSize: '12px' }}>
              Current: {embroideryStitchType} • {embroideryColor} • {embroideryThickness}px
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                // Simulate embroidery by applying stitches to 3D model
                if (embroideryStitches.length > 0) {
                  embroideryStitches.forEach(stitch => {
                    drawStitchOnModel(stitch);
                  });
                  // Trigger texture update
                  window.dispatchEvent(new CustomEvent('embroideryTextureUpdate'));
                }
                console.log('Simulating embroidery...');
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #8B5CF6',
                background: 'rgba(139, 92, 246, 0.2)',
                color: '#8B5CF6',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ▶️ Simulate
            </button>
            <button
              onClick={() => {
                // Export pattern
                if (canvasRef.current) {
                  const link = document.createElement('a');
                  link.download = `embroidery-pattern-${Date.now()}.png`;
                  link.href = canvasRef.current.toDataURL();
                  link.click();
                }
                console.log('Exporting pattern...');
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #10B981',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#10B981',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              💾 Export
            </button>
            <button
              onClick={() => {
                // Clear canvas
                setEmbroideryStitches([]);
                if (canvasRef.current) {
                  const ctx = canvasRef.current.getContext('2d');
                  if (ctx) {
                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                  }
                }
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #EF4444',
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#EF4444',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🗑️ Clear
            </button>
              </div>
          </div>
        <div style={{ position: 'relative' }}>
          <canvas
            ref={canvasRef}
            className="embroidery-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              width: '100%',
              height: '200px',
              border: '1px solid #475569',
              borderRadius: '8px',
              cursor: 'crosshair',
              background: '#0F172A'
            }}
          />
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none'
          }}>
            {embroideryStitchType} • {embroideryColor}
        </div>
        </div>
        <div style={{
          marginTop: '8px',
          fontSize: '12px',
          color: '#94A3B8',
          textAlign: 'center'
        }}>
          Click and drag to draw embroidery stitches
        </div>
      </div>

      {/* Backend Integration Controls */}
      <div className="control-group" style={{
        background: 'rgba(34, 197, 94, 0.1)',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid rgba(34, 197, 94, 0.3)',
        marginBottom: '12px'
      }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: '500',
          color: '#22C55E'
        }}>Backend Integration</label>
        
        {/* Connection Status */}
        <div style={{ marginBottom: '8px', fontSize: '12px' }}>
          <span style={{ color: backendConnected ? '#22C55E' : '#EF4444' }}>
            {backendConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
          {backendHealth && (
            <div style={{ marginTop: '4px', fontSize: '10px', color: '#94A3B8' }}>
              InkStitch: {backendHealth.inkscape?.found ? '✅' : '❌'}
              PyEmbroidery: {backendHealth.pyembroidery ? '✅' : '❌'}
        </div>
      )}
        </div>

        {/* Export Options */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <button
            onClick={() => setShowExportOptions(!showExportOptions)}
            style={{
              flex: 1,
              padding: '6px 8px',
              borderRadius: '4px',
              border: '1px solid #475569',
              background: '#1E293B',
              color: '#E2E8F0',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Export Options
          </button>
          <button
            onClick={checkBackendConnection}
            style={{
              padding: '6px 8px',
              borderRadius: '4px',
              border: '1px solid #475569',
              background: '#1E293B',
              color: '#E2E8F0',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🔄
          </button>
        </div>

        {/* Export Format Selection */}
        {showExportOptions && (
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '4px', display: 'block' }}>
              Format:
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'dst' | 'pes' | 'exp')}
              style={{
                width: '100%',
                padding: '4px 6px',
                borderRadius: '4px',
                border: '1px solid #475569',
                background: '#1E293B',
                color: '#E2E8F0',
                fontSize: '11px'
              }}
            >
              <option value="dst">DST (Tajima)</option>
              <option value="pes">PES (Brother)</option>
              <option value="exp">EXP (Melco)</option>
            </select>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={exportEmbroideryFile}
            disabled={!backendConnected || isExporting || embroideryStitches.length === 0}
            style={{
              flex: 1,
              padding: '6px 8px',
              borderRadius: '4px',
              border: '1px solid #475569',
              background: backendConnected && embroideryStitches.length > 0 ? '#22C55E' : '#374151',
              color: '#FFFFFF',
              cursor: backendConnected && embroideryStitches.length > 0 ? 'pointer' : 'not-allowed',
              fontSize: '11px',
              opacity: backendConnected && embroideryStitches.length > 0 ? 1 : 0.5
            }}
          >
            {isExporting ? 'Exporting...' : 'Export File'}
          </button>
          <button
            onClick={() => generateProfessionalStitches(embroideryStitches)}
            disabled={!backendConnected || embroideryStitches.length === 0}
            style={{
              flex: 1,
              padding: '6px 8px',
              borderRadius: '4px',
              border: '1px solid #475569',
              background: backendConnected && embroideryStitches.length > 0 ? '#3B82F6' : '#374151',
              color: '#FFFFFF',
              cursor: backendConnected && embroideryStitches.length > 0 ? 'pointer' : 'not-allowed',
              fontSize: '11px',
              opacity: backendConnected && embroideryStitches.length > 0 ? 1 : 0.5
            }}
          >
            Optimize
          </button>
      </div>

        {/* File Import */}
        <div style={{ marginTop: '8px' }}>
          <input
            type="file"
            accept=".dst,.pes,.exp,.jef,.vp3"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importEmbroideryFile(file);
            }}
            style={{ display: 'none' }}
            id="import-embroidery"
          />
          <label
            htmlFor="import-embroidery"
            style={{
              display: 'block',
              padding: '6px 8px',
              borderRadius: '4px',
              border: '1px solid #475569',
              background: '#1E293B',
              color: '#E2E8F0',
              cursor: 'pointer',
              fontSize: '11px',
              textAlign: 'center'
            }}
          >
            Import File
          </label>
        </div>
      </div>

      {/* AI Analysis Modal */}
      {showAnalysis && aiAnalysis && (
        <div className="analysis-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>AI Pattern Analysis</h3>
              <button onClick={() => setShowAnalysis(false)}>×</button>
      </div>
            <div className="analysis-content">
              <div className="analysis-section">
                <h4>Density Analysis</h4>
                <p>Level: {aiAnalysis.density?.level}</p>
                <p>Value: {aiAnalysis.density?.value}</p>
              </div>
              <div className="analysis-section">
                <h4>Complexity</h4>
                <p>Overall: {aiAnalysis.complexity?.overall}</p>
                <p>Stitch Variety: {aiAnalysis.complexity?.stitchVariety}</p>
              </div>
              <div className="analysis-section">
                <h4>Thread Analysis</h4>
                <p>Total Threads: {Object.values(aiAnalysis.threadTypes || {}).reduce((sum: number, t: any) => sum + (t.count || 0), 0)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmbroideryTool;
