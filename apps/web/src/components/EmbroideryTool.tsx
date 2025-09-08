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
  const [stitchDensity, setStitchDensity] = useState(0.5);
  const [underlayType, setUnderlayType] = useState<'none' | 'center' | 'contour' | 'zigzag'>('center');
  const [threadPalette, setThreadPalette] = useState<string[]>(['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']);
  const [showPatternLibrary, setShowPatternLibrary] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [stitchDirection, setStitchDirection] = useState<'horizontal' | 'vertical' | 'diagonal' | 'radial'>('horizontal');
  const [stitchSpacing, setStitchSpacing] = useState(0.5);
  
  // Backend integration state
  const [backendConnected, setBackendConnected] = useState(false);
  const [backendHealth, setBackendHealth] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'dst' | 'pes' | 'exp'>('dst');
  const [showExportOptions, setShowExportOptions] = useState(false);

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
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { 
      willReadFrequently: true, 
      alpha: true, 
      desynchronized: false 
    });
    if (!ctx) return;

    // Set canvas size with high DPI
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 2;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

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
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (Array.isArray(embroideryStitches)) {
      embroideryStitches.forEach((stitch) => {
        drawStitch(ctx, stitch, rect);
      });
    }

    if (currentStitch) {
      drawStitch(ctx, currentStitch, rect, true);
    }
  };

  const drawStitch = (ctx: CanvasRenderingContext2D, stitch: EmbroideryStitch, rect: DOMRect, isPreview = false) => {
    if (stitch.points.length < 2) return;

    ctx.save();
    ctx.globalAlpha = isPreview ? 0.5 : stitch.opacity;
    
    // Create gradient for more realistic thread appearance
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    const baseColor = stitch.color;
    const darkerColor = adjustBrightness(baseColor, -20);
    const lighterColor = adjustBrightness(baseColor, 20);
    
    gradient.addColorStop(0, lighterColor);
    gradient.addColorStop(0.5, baseColor);
    gradient.addColorStop(1, darkerColor);
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = stitch.thickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Add shadow for depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    // Convert UV coordinates to canvas coordinates
    const points = stitch.points.map(p => ({
      x: p.x * rect.width,
      y: p.y * rect.height
    }));

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    switch (stitch.type) {
      case 'satin':
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
        // Draw X pattern with proper cross-stitch appearance
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
        // Chain stitch pattern - draw connected oval links
        for (let i = 0; i < points.length - 1; i++) {
          const curr = points[i];
          const next = points[i + 1];
          const midX = (curr.x + next.x) / 2;
          const midY = (curr.y + next.y) / 2;
          
          // Calculate link dimensions
          const linkWidth = stitch.thickness * 1.5;
          const linkHeight = stitch.thickness * 0.8;
          
          // Draw outer chain link with gradient
          ctx.beginPath();
          ctx.ellipse(midX, midY, linkWidth/2, linkHeight/2, 0, 0, Math.PI * 2);
          ctx.stroke();
          
          // Draw inner oval for chain link hole
          ctx.beginPath();
          ctx.ellipse(midX, midY, linkWidth/3, linkHeight/3, 0, 0, Math.PI * 2);
          ctx.stroke();
          
          // Add connecting lines between chain links
          if (i < points.length - 2) {
            const nextNext = points[i + 2];
            const nextMidX = (next.x + nextNext.x) / 2;
            const nextMidY = (next.y + nextNext.y) / 2;
            
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
        break;

      default:
        // Default line drawing for unknown types
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
    }

    ctx.stroke();
    ctx.restore();
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

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setCurrentStitch(prev => prev ? {
      ...prev,
      points: [...prev.points, { x, y }]
    } : null);

    // Only redraw the current stitch, don't clear the canvas
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
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentStitch) return;

    setIsDrawing(false);
    setEmbroideryStitches([...embroideryStitches, currentStitch]);
    setCurrentStitch(null);
    
    // Redraw all stitches to make them persistent
    drawStitches();
  };

  // Generate pattern with AI
  const generatePattern = async () => {
    if (!embroideryPatternDescription.trim()) return;

    setIsGenerating(true);
    try {
      const stitches = await embroideryAI.generateStitchPattern(
        embroideryPatternDescription,
        { width: 400, height: 400 }
      );
      
      setEmbroideryStitches(stitches);
      drawStitches();
    } catch (error) {
      console.error('Error generating pattern:', error);
    } finally {
      setIsGenerating(false);
    }
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
    ctx.strokeStyle = stitch.color;
    ctx.lineWidth = stitch.thickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

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
        // Fill area with parallel lines
        const minY = Math.min(...points.map(p => p.y));
        const maxY = Math.max(...points.map(p => p.y));
        const lineSpacing = stitch.thickness * 2;
        
        for (let y = minY; y <= maxY; y += lineSpacing) {
          const intersections = getLineIntersections(points, y);
          for (let i = 0; i < intersections.length; i += 2) {
            ctx.beginPath();
            ctx.moveTo(intersections[i], y);
            ctx.lineTo(intersections[i + 1] || intersections[i], y);
            ctx.stroke();
          }
        }
        break;

      case 'cross-stitch':
        console.log('🧵 CROSS-STITCH CASE EXECUTING - drawing X patterns');
        // Draw X pattern
        points.forEach((point, i) => {
          if (i % 2 === 0 && points[i + 1]) {
            const next = points[i + 1];
            const size = stitch.thickness;
            ctx.beginPath();
            ctx.moveTo(point.x - size, point.y - size);
            ctx.lineTo(point.x + size, point.y + size);
            ctx.moveTo(point.x - size, point.y + size);
            ctx.lineTo(point.x + size, point.y - size);
            ctx.stroke();
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
        break;

      default:
        console.log('🧵 Using DEFAULT case for stitch type:', stitch.type);
        // Default line drawing for unknown types
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
    }

    ctx.stroke();
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
              console.log('🧵 Stitch type changed to:', e.target.value);
              setEmbroideryStitchType(e.target.value as any);
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
            <option value="satin">🧵 Satin Stitch</option>
            <option value="fill">🟦 Fill Stitch</option>
            <option value="outline">📏 Outline Stitch</option>
            <option value="cross-stitch">❌ Cross Stitch</option>
            <option value="chain">⛓️ Chain Stitch</option>
            <option value="backstitch">↩️ Back Stitch</option>
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
