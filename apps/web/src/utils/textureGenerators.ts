/**
 * Utility functions for generating textures needed for the puff print system
 */

// Generate a normal map from a height map (puff map)
export function generateNormalMap(heightMap: HTMLCanvasElement, strength: number = 1.0): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = heightMap.width;
  canvas.height = heightMap.height;
  
  const ctx = canvas.getContext('2d')!;
  const heightCtx = heightMap.getContext('2d')!;
  
  const imageData = heightCtx.getImageData(0, 0, heightMap.width, heightMap.height);
  const normalData = ctx.createImageData(heightMap.width, heightMap.height);
  
  const width = heightMap.width;
  const height = heightMap.height;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      // Sample neighboring heights
      const left = x > 0 ? imageData.data[((y * width + (x - 1)) * 4)] / 255 : 0;
      const right = x < width - 1 ? imageData.data[((y * width + (x + 1)) * 4)] / 255 : 0;
      const top = y > 0 ? imageData.data[(((y - 1) * width + x) * 4)] / 255 : 0;
      const bottom = y < height - 1 ? imageData.data[(((y + 1) * width + x) * 4)] / 255 : 0;
      
      // Calculate normal from height differences
      const dx = (right - left) * strength;
      const dy = (bottom - top) * strength;
      const dz = 1.0;
      
      // Normalize the normal vector
      const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const nx = (dx / length + 1) * 0.5; // Convert from [-1,1] to [0,1]
      const ny = (dy / length + 1) * 0.5;
      const nz = (dz / length + 1) * 0.5;
      
      // Set RGBA values (normal maps use RGB for XYZ)
      normalData.data[idx] = nx * 255;     // R = X
      normalData.data[idx + 1] = ny * 255; // G = Y
      normalData.data[idx + 2] = nz * 255; // B = Z
      normalData.data[idx + 3] = 255;      // A
    }
  }
  
  ctx.putImageData(normalData, 0, 0);
  return canvas;
}

// Generate a roughness map from a height map
export function generateRoughnessMap(heightMap: HTMLCanvasElement, baseRoughness: number = 0.8): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = heightMap.width;
  canvas.height = heightMap.height;
  
  const ctx = canvas.getContext('2d')!;
  const heightCtx = heightMap.getContext('2d')!;
  
  const imageData = heightCtx.getImageData(0, 0, heightMap.width, heightMap.height);
  const roughnessData = ctx.createImageData(heightMap.width, heightMap.height);
  
  const width = heightMap.width;
  const height = heightMap.height;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const heightValue = imageData.data[idx] / 255;
      
      // Higher areas are more rough (less smooth)
      const roughness = baseRoughness + (heightValue * 0.2);
      const clampedRoughness = Math.max(0, Math.min(1, roughness));
      
      roughnessData.data[idx] = clampedRoughness * 255;     // R
      roughnessData.data[idx + 1] = clampedRoughness * 255; // G
      roughnessData.data[idx + 2] = clampedRoughness * 255; // B
      roughnessData.data[idx + 3] = 255;                    // A
    }
  }
  
  ctx.putImageData(roughnessData, 0, 0);
  return canvas;
}

// Generate a metallic map (usually 0 for fabric/puff prints)
export function generateMetallicMap(width: number, height: number, metallicValue: number = 0.0): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(width, height);
  
  for (let i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i] = metallicValue * 255;     // R
    imageData.data[i + 1] = metallicValue * 255; // G
    imageData.data[i + 2] = metallicValue * 255; // B
    imageData.data[i + 3] = 255;                 // A
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

// Generate an ambient occlusion map from height map
export function generateAmbientOcclusionMap(heightMap: HTMLCanvasElement, radius: number = 4): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = heightMap.width;
  canvas.height = heightMap.height;
  
  const ctx = canvas.getContext('2d')!;
  const heightCtx = heightMap.getContext('2d')!;
  
  const imageData = heightCtx.getImageData(0, 0, heightMap.width, heightMap.height);
  const aoData = ctx.createImageData(heightMap.width, heightMap.height);
  
  const width = heightMap.width;
  const height = heightMap.height;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const centerHeight = imageData.data[idx] / 255;
      
      let occlusion = 0;
      let sampleCount = 0;
      
      // Sample in a radius around the current pixel
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const sampleX = x + dx;
          const sampleY = y + dy;
          
          if (sampleX >= 0 && sampleX < width && sampleY >= 0 && sampleY < height) {
            const sampleIdx = (sampleY * width + sampleX) * 4;
            const sampleHeight = imageData.data[sampleIdx] / 255;
            
            // Calculate distance and height difference
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 0 && distance <= radius) {
              const heightDiff = Math.max(0, sampleHeight - centerHeight);
              const weight = 1.0 - (distance / radius);
              occlusion += heightDiff * weight;
              sampleCount++;
            }
          }
        }
      }
      
      // Normalize occlusion
      const ao = sampleCount > 0 ? Math.min(1, occlusion / sampleCount) : 0;
      const aoValue = Math.max(0, Math.min(1, 1 - ao));
      
      aoData.data[idx] = aoValue * 255;     // R
      aoData.data[idx + 1] = aoValue * 255; // G
      aoData.data[idx + 2] = aoValue * 255; // B
      aoData.data[idx + 3] = 255;           // A
    }
  }
  
  ctx.putImageData(aoData, 0, 0);
  return canvas;
}

// Apply a blur filter to smooth out textures
export function applyBlur(canvas: HTMLCanvasElement, radius: number = 2): HTMLCanvasElement {
  const blurredCanvas = document.createElement('canvas');
  blurredCanvas.width = canvas.width;
  blurredCanvas.height = canvas.height;
  
  const ctx = blurredCanvas.getContext('2d')!;
  const sourceCtx = canvas.getContext('2d')!;
  
  // Apply box blur
  ctx.filter = `blur(${radius}px)`;
  ctx.drawImage(canvas, 0, 0);
  
  return blurredCanvas;
}

// Create a seamless texture by tiling and blending edges
export function makeSeamless(canvas: HTMLCanvasElement, blendSize: number = 32): HTMLCanvasElement {
  const seamlessCanvas = document.createElement('canvas');
  seamlessCanvas.width = canvas.width;
  seamlessCanvas.height = canvas.height;
  
  const ctx = seamlessCanvas.getContext('2d')!;
  const sourceCtx = canvas.getContext('2d')!;
  
  // Draw the original texture
  ctx.drawImage(canvas, 0, 0);
  
  // Create a gradient mask for blending
  const gradient = ctx.createLinearGradient(0, 0, blendSize, 0);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,1)');
  
  // Blend left edge
  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, blendSize, canvas.height);
  
  // Blend right edge
  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = gradient;
  ctx.save();
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.fillRect(0, 0, blendSize, canvas.height);
  ctx.restore();
  
  // Blend top edge
  const verticalGradient = ctx.createLinearGradient(0, 0, 0, blendSize);
  verticalGradient.addColorStop(0, 'rgba(0,0,0,0)');
  verticalGradient.addColorStop(1, 'rgba(0,0,0,1)');
  
  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = verticalGradient;
  ctx.fillRect(0, 0, canvas.width, blendSize);
  
  // Blend bottom edge
  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = verticalGradient;
  ctx.save();
  ctx.translate(0, canvas.height);
  ctx.scale(1, -1);
  ctx.fillRect(0, 0, canvas.width, blendSize);
  ctx.restore();
  
  return seamlessCanvas;
}
