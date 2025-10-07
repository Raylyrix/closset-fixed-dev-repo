// Phase 3: Color separations pipeline for professional printing
// Supports spot colors, CMYK separations, and halftone generation

export interface SpotColor {
  name: string;
  color: string; // hex
  opacity: number;
  angle: number; // halftone angle in degrees
  frequency: number; // lines per inch
}

export interface CMYKSeparation {
  cyan: ImageData;
  magenta: ImageData;
  yellow: ImageData;
  black: ImageData;
}

export interface SeparationOptions {
  mode: 'spot' | 'cmyk' | 'both';
  spotColors: SpotColor[];
  halftoneEnabled: boolean;
  resolution: number; // DPI
  underbase: boolean; // white underbase for dark garments
  choke: number; // trap/choke in points
}

export class SeparationsEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  // Convert RGB to CMYK values
  private rgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    
    const k = 1 - Math.max(rNorm, gNorm, bNorm);
    const c = k === 1 ? 0 : (1 - rNorm - k) / (1 - k);
    const m = k === 1 ? 0 : (1 - gNorm - k) / (1 - k);
    const y = k === 1 ? 0 : (1 - bNorm - k) / (1 - k);
    
    return [c, m, y, k];
  }

  // Generate halftone pattern for a separation
  private generateHalftone(
    imageData: ImageData, 
    angle: number, 
    frequency: number
  ): ImageData {
    const { width, height, data } = imageData;
    const result = new ImageData(width, height);
    
    const angleRad = (angle * Math.PI) / 180;
    const cellSize = 72 / frequency; // Convert LPI to pixels at 72 DPI
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const gray = data[i]; // Assume grayscale input
        
        // Rotate coordinates
        const rotX = x * Math.cos(angleRad) - y * Math.sin(angleRad);
        const rotY = x * Math.sin(angleRad) + y * Math.cos(angleRad);
        
        // Calculate dot size based on gray value
        const dotSize = (gray / 255) * cellSize;
        
        // Distance from cell center
        const cellX = rotX % cellSize;
        const cellY = rotY % cellSize;
        const centerX = cellSize / 2;
        const centerY = cellSize / 2;
        const distance = Math.sqrt(
          Math.pow(cellX - centerX, 2) + Math.pow(cellY - centerY, 2)
        );
        
        // Determine if pixel should be black or white
        const isInDot = distance <= dotSize / 2;
        const value = isInDot ? 0 : 255;
        
        result.data[i] = value;     // R
        result.data[i + 1] = value; // G
        result.data[i + 2] = value; // B
        result.data[i + 3] = 255;   // A
      }
    }
    
    return result;
  }

  // Generate CMYK separations from composed canvas
  generateCMYKSeparations(
    sourceCanvas: HTMLCanvasElement,
    options: SeparationOptions
  ): CMYKSeparation {
    this.canvas.width = sourceCanvas.width;
    this.canvas.height = sourceCanvas.height;
    this.ctx.drawImage(sourceCanvas, 0, 0);
    
    const sourceData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const { width, height } = sourceData;
    
    // Create separate channels
    const cyan = new ImageData(width, height);
    const magenta = new ImageData(width, height);
    const yellow = new ImageData(width, height);
    const black = new ImageData(width, height);
    
    // Process each pixel
    for (let i = 0; i < sourceData.data.length; i += 4) {
      const r = sourceData.data[i];
      const g = sourceData.data[i + 1];
      const b = sourceData.data[i + 2];
      const a = sourceData.data[i + 3];
      
      if (a === 0) continue; // Skip transparent pixels
      
      const [c, m, y, k] = this.rgbToCmyk(r, g, b);
      
      // Convert to grayscale values (0-255)
      const cGray = Math.round((1 - c) * 255);
      const mGray = Math.round((1 - m) * 255);
      const yGray = Math.round((1 - y) * 255);
      const kGray = Math.round((1 - k) * 255);
      
      // Set channel values
      cyan.data[i] = cGray;
      cyan.data[i + 1] = cGray;
      cyan.data[i + 2] = cGray;
      cyan.data[i + 3] = 255;
      
      magenta.data[i] = mGray;
      magenta.data[i + 1] = mGray;
      magenta.data[i + 2] = mGray;
      magenta.data[i + 3] = 255;
      
      yellow.data[i] = yGray;
      yellow.data[i + 1] = yGray;
      yellow.data[i + 2] = yGray;
      yellow.data[i + 3] = 255;
      
      black.data[i] = kGray;
      black.data[i + 1] = kGray;
      black.data[i + 2] = kGray;
      black.data[i + 3] = 255;
    }
    
    // Apply halftones if enabled
    const result: CMYKSeparation = {
      cyan: options.halftoneEnabled ? this.generateHalftone(cyan, 15, options.resolution / 10) : cyan,
      magenta: options.halftoneEnabled ? this.generateHalftone(magenta, 75, options.resolution / 10) : magenta,
      yellow: options.halftoneEnabled ? this.generateHalftone(yellow, 0, options.resolution / 10) : yellow,
      black: options.halftoneEnabled ? this.generateHalftone(black, 45, options.resolution / 10) : black
    };
    
    return result;
  }

  // Generate spot color separations
  generateSpotSeparations(
    sourceCanvas: HTMLCanvasElement,
    spotColors: SpotColor[]
  ): Map<string, ImageData> {
    const separations = new Map<string, ImageData>();
    
    this.canvas.width = sourceCanvas.width;
    this.canvas.height = sourceCanvas.height;
    
    for (const spot of spotColors) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Create a mask for this spot color
      // This is a simplified version - in practice, you'd analyze the source
      // and extract areas that match the spot color
      this.ctx.fillStyle = spot.color;
      this.ctx.globalAlpha = spot.opacity;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      const spotData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      separations.set(spot.name, spotData);
    }
    
    return separations;
  }

  // Export separations as downloadable files
  exportSeparations(
    separations: CMYKSeparation | Map<string, ImageData>,
    filename: string
  ): void {
    const JSZipCtor = (window as any).JSZip;
    const zip = JSZipCtor ? new JSZipCtor() : null;
    if (!zip) {
      console.warn('JSZip not available for separation export');
      return;
    }
    
    if ('cyan' in separations) {
      // CMYK export
      ['cyan', 'magenta', 'yellow', 'black'].forEach(channel => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const data = separations[channel as keyof CMYKSeparation];
        
        canvas.width = data.width;
        canvas.height = data.height;
        ctx.putImageData(data, 0, 0);
        
        canvas.toBlob(blob => {
          if (blob) zip.file(`${filename}_${channel}.png`, blob);
        });
      });
    } else {
      // Spot color export
      separations.forEach((data, name) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        canvas.width = data.width;
        canvas.height = data.height;
        ctx.putImageData(data, 0, 0);
        
        canvas.toBlob(blob => {
          if (blob) zip.file(`${filename}_${name}.png`, blob);
        });
      });
    }
    
    // Download zip file
    setTimeout(() => {
      zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_separations.zip`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }, 1000);
  }
}

// Default separation presets
export const SEPARATION_PRESETS = {
  standardCMYK: {
    mode: 'cmyk' as const,
    spotColors: [],
    halftoneEnabled: true,
    resolution: 300,
    underbase: false,
    choke: 0
  },
  
  spotColors2: {
    mode: 'spot' as const,
    spotColors: [
      { name: 'White', color: '#ffffff', opacity: 1, angle: 22.5, frequency: 55 },
      { name: 'Black', color: '#000000', opacity: 1, angle: 45, frequency: 55 }
    ],
    halftoneEnabled: true,
    resolution: 300,
    underbase: true,
    choke: 0.5
  },
  
  spotColors3: {
    mode: 'spot' as const,
    spotColors: [
      { name: 'White', color: '#ffffff', opacity: 1, angle: 22.5, frequency: 55 },
      { name: 'Red', color: '#ff0000', opacity: 1, angle: 75, frequency: 55 },
      { name: 'Black', color: '#000000', opacity: 1, angle: 45, frequency: 55 }
    ],
    halftoneEnabled: true,
    resolution: 300,
    underbase: true,
    choke: 0.5
  }
};

export const separationsEngine = new SeparationsEngine();
