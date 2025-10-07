import * as THREE from 'three';

export interface MeshResolution {
  vertices: THREE.Vector3[];
  normals: THREE.Vector3[];
  uvs: THREE.Vector2[];
  indices: number[];
  bounds: { min: THREE.Vector3; max: THREE.Vector3 };
}

export interface MaterialResolution {
  originalMaterial: THREE.Material | THREE.Material[];
  puffMaterial: THREE.MeshStandardMaterial;
  displacementMap: THREE.CanvasTexture | null;
  normalMap: THREE.CanvasTexture | null;
  roughnessMap: THREE.CanvasTexture | null;
  metallicMap: THREE.CanvasTexture | null;
  aoMap: THREE.CanvasTexture | null;
}

export interface TextureResolution {
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
  width: number;
  height: number;
  format: THREE.PixelFormat;
  type: THREE.TextureDataType;
}

export class AdvancedPuff3DSystem {
  private meshCache = new Map<string, MeshResolution>();
  private materialCache = new Map<string, MaterialResolution>();
  private textureCache = new Map<string, TextureResolution>();

  // Analyze and resolve 3D mesh structure
  public resolveMesh(mesh: THREE.Mesh): MeshResolution {
    const key = mesh.uuid;

    if (this.meshCache.has(key)) {
      return this.meshCache.get(key)!;
    }

    const geometry = mesh.geometry;
    const positionAttribute = geometry.getAttribute('position');
    const normalAttribute = geometry.getAttribute('normal');
    const uvAttribute = geometry.getAttribute('uv');
    const indexAttribute = geometry.getIndex();

    if (!positionAttribute || !normalAttribute || !uvAttribute) {
      throw new Error('Mesh missing required attributes (position, normal, uv)');
    }

    const positions = positionAttribute.array as Float32Array;
    const normals = normalAttribute.array as Float32Array;
    const uvs = uvAttribute.array as Float32Array;
    const indices = indexAttribute ? indexAttribute.array as Uint16Array | Uint32Array : null;

    const vertices: THREE.Vector3[] = [];
    const vertexNormals: THREE.Vector3[] = [];
    const vertexUVs: THREE.Vector2[] = [];
    const vertexIndices: number[] = [];

    // Extract vertex data
    for (let i = 0; i < positions.length; i += 3) {
      vertices.push(new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]));
    }

    for (let i = 0; i < normals.length; i += 3) {
      vertexNormals.push(new THREE.Vector3(normals[i], normals[i + 1], normals[i + 2]));
    }

    for (let i = 0; i < uvs.length; i += 2) {
      vertexUVs.push(new THREE.Vector2(uvs[i], uvs[i + 1]));
    }

    if (indices) {
      for (let i = 0; i < indices.length; i++) {
        vertexIndices.push(indices[i]);
      }
    }

    // Calculate bounds
    const bounds = this.calculateBounds(vertices);

    const resolution: MeshResolution = {
      vertices,
      normals: vertexNormals,
      uvs: vertexUVs,
      indices: vertexIndices,
      bounds
    };

    this.meshCache.set(key, resolution);
    return resolution;
  }

  // Calculate bounding box for mesh
  private calculateBounds(vertices: THREE.Vector3[]): { min: THREE.Vector3; max: THREE.Vector3 } {
    const min = new THREE.Vector3(Infinity, Infinity, Infinity);
    const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);

    vertices.forEach(vertex => {
      min.min(vertex);
      max.max(vertex);
    });

    return { min, max };
  }

  // Create optimized material for puff effects
  public resolveMaterial(mesh: THREE.Mesh, puffCanvas: HTMLCanvasElement): MaterialResolution {
    const key = `${mesh.uuid}-${puffCanvas.width}-${puffCanvas.height}`;

    if (this.materialCache.has(key)) {
      return this.materialCache.get(key)!;
    }

    const originalMaterial = Array.isArray(mesh.material)
      ? mesh.material.map(mat => mat.clone())
      : (mesh.material as THREE.Material).clone();

    // Create displacement texture from canvas
    const displacementTexture = new THREE.CanvasTexture(puffCanvas);
    displacementTexture.wrapS = THREE.RepeatWrapping;
    displacementTexture.wrapT = THREE.RepeatWrapping;
    displacementTexture.minFilter = THREE.LinearFilter;
    displacementTexture.magFilter = THREE.LinearFilter;
    displacementTexture.format = THREE.RedFormat;

    // Create normal map from displacement
    const normalMap = this.generateNormalMap(puffCanvas);
    const normalTexture = new THREE.CanvasTexture(normalMap);
    normalTexture.wrapS = THREE.RepeatWrapping;
    normalTexture.wrapT = THREE.RepeatWrapping;
    normalTexture.minFilter = THREE.LinearFilter;
    normalTexture.magFilter = THREE.LinearFilter;

    // Create roughness map
    const roughnessMap = this.generateRoughnessMap(puffCanvas);
    const roughnessTexture = new THREE.CanvasTexture(roughnessMap);
    roughnessTexture.wrapS = THREE.RepeatWrapping;
    roughnessTexture.wrapT = THREE.RepeatWrapping;
    roughnessTexture.minFilter = THREE.LinearFilter;
    roughnessTexture.magFilter = THREE.LinearFilter;
    roughnessTexture.format = THREE.RedFormat;

    // Create metallic map (mostly 0 for fabric)
    const metallicMap = this.generateMetallicMap(puffCanvas);
    const metallicTexture = new THREE.CanvasTexture(metallicMap);
    metallicTexture.wrapS = THREE.RepeatWrapping;
    metallicTexture.wrapT = THREE.RepeatWrapping;
    metallicTexture.minFilter = THREE.LinearFilter;
    metallicTexture.magFilter = THREE.LinearFilter;
    metallicTexture.format = THREE.RedFormat;

    // Create ambient occlusion map
    const aoMap = this.generateAOMap(puffCanvas);
    const aoTexture = new THREE.CanvasTexture(aoMap);
    aoTexture.wrapS = THREE.RepeatWrapping;
    aoTexture.wrapT = THREE.RepeatWrapping;
    aoTexture.minFilter = THREE.LinearFilter;
    aoTexture.magFilter = THREE.LinearFilter;
    aoTexture.format = THREE.RedFormat;

    // Create puff material
    const puffMaterial = new THREE.MeshStandardMaterial({
      map: displacementTexture,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(0.5, 0.5),
      roughnessMap: roughnessTexture,
      roughness: 0.8,
      metalnessMap: metallicTexture,
      metalness: 0.0,
      aoMap: aoTexture,
      displacementMap: displacementTexture,
      displacementScale: 0.1,
      displacementBias: 0,
      transparent: true,
      side: THREE.DoubleSide
    });

    const resolution: MaterialResolution = {
      originalMaterial,
      puffMaterial,
      displacementMap: displacementTexture,
      normalMap: normalTexture,
      roughnessMap: roughnessTexture,
      metallicMap: metallicTexture,
      aoMap: aoTexture
    };

    this.materialCache.set(key, resolution);
    return resolution;
  }

  // Generate normal map from height/displacement data
  private generateNormalMap(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const width = canvas.width;
    const height = canvas.height;
    const normalCanvas = document.createElement('canvas');
    normalCanvas.width = width;
    normalCanvas.height = height;

    const ctx = canvas.getContext('2d')!;
    const normalCtx = normalCanvas.getContext('2d')!;

    const imageData = ctx.getImageData(0, 0, width, height);
    const normalData = normalCtx.createImageData(width, height);

    const strength = 2.0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        // Get height values from neighbors
        const height = imageData.data[idx] / 255.0;
        const heightRight = x < width - 1 ? imageData.data[(y * width + (x + 1)) * 4] / 255.0 : height;
        const heightBottom = y < height - 1 ? imageData.data[((y + 1) * width + x) * 4] / 255.0 : height;

        // Calculate normal vector
        const dx = (heightRight - height) * strength;
        const dy = (heightBottom - height) * strength;
        const dz = 1.0;

        const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const nx = dx / length;
        const ny = dy / length;
        const nz = dz / length;

        // Convert to RGB (normal maps are typically in tangent space)
        normalData.data[idx] = Math.floor((nx * 0.5 + 0.5) * 255);     // R
        normalData.data[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255); // G
        normalData.data[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255); // B
        normalData.data[idx + 3] = 255; // A
      }
    }

    normalCtx.putImageData(normalData, 0, 0);
    return normalCanvas;
  }

  // Generate roughness map
  private generateRoughnessMap(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const width = canvas.width;
    const height = canvas.height;
    const roughnessCanvas = document.createElement('canvas');
    roughnessCanvas.width = width;
    roughnessCanvas.height = height;

    const ctx = canvas.getContext('2d')!;
    const roughnessCtx = roughnessCanvas.getContext('2d')!;

    const imageData = ctx.getImageData(0, 0, width, height);
    const roughnessData = roughnessCtx.createImageData(width, height);

    for (let i = 0; i < imageData.data.length; i += 4) {
      const height = imageData.data[i] / 255.0;
      const roughness = Math.max(0.1, 1.0 - height * 0.5); // Higher areas are smoother

      roughnessData.data[i] = Math.floor(roughness * 255);     // R
      roughnessData.data[i + 1] = Math.floor(roughness * 255); // G
      roughnessData.data[i + 2] = Math.floor(roughness * 255); // B
      roughnessData.data[i + 3] = 255; // A
    }

    roughnessCtx.putImageData(roughnessData, 0, 0);
    return roughnessCanvas;
  }

  // Generate metallic map (mostly 0 for fabric)
  private generateMetallicMap(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const width = canvas.width;
    const height = canvas.height;
    const metallicCanvas = document.createElement('canvas');
    metallicCanvas.width = width;
    metallicCanvas.height = height;

    const metallicCtx = metallicCanvas.getContext('2d')!;
    metallicCtx.fillStyle = 'rgb(0, 0, 0)'; // No metallic by default
    metallicCtx.fillRect(0, 0, width, height);

    return metallicCanvas;
  }

  // Generate ambient occlusion map
  private generateAOMap(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const width = canvas.width;
    const height = canvas.height;
    const aoCanvas = document.createElement('canvas');
    aoCanvas.width = width;
    aoCanvas.height = height;

    const ctx = canvas.getContext('2d')!;
    const aoCtx = aoCanvas.getContext('2d')!;

    const imageData = ctx.getImageData(0, 0, width, height);
    const aoData = aoCtx.createImageData(width, height);

    const aoStrength = 0.3;
    const aoDistance = 10;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const height = imageData.data[idx] / 255.0;

        let occlusion = 0;
        let samples = 0;

        // Sample surrounding pixels for AO
        for (let dy = -aoDistance; dy <= aoDistance; dy += 2) {
          for (let dx = -aoDistance; dx <= aoDistance; dx += 2) {
            if (dx === 0 && dy === 0) continue;

            const sx = x + dx;
            const sy = y + dy;

            if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
              const sIdx = (sy * width + sx) * 4;
              const sHeight = imageData.data[sIdx] / 255.0;

              const distance = Math.sqrt(dx * dx + dy * dy);
              const heightDiff = Math.abs(height - sHeight);

              occlusion += (sHeight < height ? 1 : 0) * (1 - distance / aoDistance) * (1 - heightDiff);
              samples++;
            }
          }
        }

        const ao = samples > 0 ? Math.min(1, occlusion / samples * aoStrength) : 0;
        const aoValue = Math.max(0.2, 1 - ao); // Ensure minimum brightness

        aoData.data[idx] = Math.floor(aoValue * 255);     // R
        aoData.data[idx + 1] = Math.floor(aoValue * 255); // G
        aoData.data[idx + 2] = Math.floor(aoValue * 255); // B
        aoData.data[idx + 3] = 255; // A
      }
    }

    aoCtx.putImageData(aoData, 0, 0);
    return aoCanvas;
  }

  // Apply puff effects to mesh with subdivision for smooth results
  public applyPuffToMesh(
    mesh: THREE.Mesh,
    displacementCanvas: HTMLCanvasElement,
    height: number,
    curvature: number
  ): void {
    const meshResolution = this.resolveMesh(mesh);
    const materialResolution = this.resolveMaterial(mesh, displacementCanvas);

    // Apply material to mesh
    mesh.material = materialResolution.puffMaterial;

    // Update displacement scale based on height
    materialResolution.puffMaterial.displacementScale = height * 0.1;
    materialResolution.puffMaterial.displacementBias = 0;

    // Update normal scale based on curvature
    const normalScale = Math.max(0.1, curvature * 0.5);
    materialResolution.puffMaterial.normalScale.set(normalScale, normalScale);

    // Mark textures for update
    if (materialResolution.displacementMap) {
      materialResolution.displacementMap.needsUpdate = true;
    }
    if (materialResolution.normalMap) {
      materialResolution.normalMap.needsUpdate = true;
    }
    if (materialResolution.roughnessMap) {
      materialResolution.roughnessMap.needsUpdate = true;
    }
    if (materialResolution.metallicMap) {
      materialResolution.metallicMap.needsUpdate = true;
    }
    if (materialResolution.aoMap) {
      materialResolution.aoMap.needsUpdate = true;
    }

    materialResolution.puffMaterial.needsUpdate = true;
  }

  // Clear puff effects and restore original materials
  public clearPuffEffects(mesh: THREE.Mesh): void {
    const key = mesh.uuid;

    if (this.materialCache.has(key)) {
      const materialResolution = this.materialCache.get(key)!;
      mesh.material = materialResolution.originalMaterial;
      materialResolution.puffMaterial.dispose();
    }
  }

  // Dispose of resources
  public dispose(): void {
    this.meshCache.clear();
    this.materialCache.forEach(resolution => {
      resolution.puffMaterial.dispose();
      if (resolution.displacementMap) resolution.displacementMap.dispose();
      if (resolution.normalMap) resolution.normalMap.dispose();
      if (resolution.roughnessMap) resolution.roughnessMap.dispose();
      if (resolution.metallicMap) resolution.metallicMap.dispose();
      if (resolution.aoMap) resolution.aoMap.dispose();
    });
    this.materialCache.clear();
    this.textureCache.clear();
  }
}
