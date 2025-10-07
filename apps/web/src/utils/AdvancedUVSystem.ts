import * as THREE from 'three';

export interface UVPoint {
  u: number;
  v: number;
  x: number;
  y: number;
  worldPosition: THREE.Vector3;
  normal: THREE.Vector3;
  meshId: string;
  faceIndex: number;
  barycentricCoords: THREE.Vector3;
}

export interface UVMapping {
  meshId: string;
  uvPoints: UVPoint[];
  bounds: { min: THREE.Vector2; max: THREE.Vector2 };
  resolution: { width: number; height: number };
  density: number; // UV points per unit area
  coverage: number; // Percentage of UV space covered
}

export interface UVValidationResult {
  isValid: boolean;
  issues: string[];
  warnings: string[];
  suggestions: string[];
  coverage: number;
  density: number;
  resolution: { width: number; height: number };
}

export class AdvancedUVSystem {
  private uvMappings = new Map<string, UVMapping>();
  private screenToUVCache = new Map<string, UVPoint | null>();
  private uvToScreenCache = new Map<string, { x: number; y: number }>();

  // Create UV mapping for a mesh
  public createUVMappings(modelScene: THREE.Group): Map<string, UVMapping> {
    const mappings = new Map<string, UVMapping>();

    modelScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry && child.material) {
        const mesh = child as THREE.Mesh;
        const mapping = this.createUVMapping(mesh);
        if (mapping) {
          mappings.set(mesh.uuid, mapping);
        }
      }
    });

    this.uvMappings = mappings;
    return mappings;
  }

  // Create UV mapping for a single mesh
  private createUVMapping(mesh: THREE.Mesh): UVMapping | null {
    const geometry = mesh.geometry;
    const positionAttribute = geometry.getAttribute('position');
    const uvAttribute = geometry.getAttribute('uv');
    const normalAttribute = geometry.getAttribute('normal');
    const indexAttribute = geometry.getIndex();

    if (!positionAttribute || !uvAttribute || !normalAttribute) {
      return null;
    }

    const positions = positionAttribute.array as Float32Array;
    const uvs = uvAttribute.array as Float32Array;
    const normals = normalAttribute.array as Float32Array;
    const indices = indexAttribute ? indexAttribute.array as Uint16Array | Uint32Array : null;

    const uvPoints: UVPoint[] = [];
    const uvBounds = { min: new THREE.Vector2(Infinity, Infinity), max: new THREE.Vector2(-Infinity, -Infinity) };

    // Process each vertex
    for (let i = 0; i < uvs.length; i += 2) {
      const u = uvs[i];
      const v = uvs[i + 1];

      // Get corresponding vertex position and normal
      const vertexIndex = Math.floor(i / 2) * 3;
      const worldPosition = new THREE.Vector3(
        positions[vertexIndex],
        positions[vertexIndex + 1],
        positions[vertexIndex + 2]
      ).applyMatrix4(mesh.matrixWorld);

      const normal = new THREE.Vector3(
        normals[vertexIndex],
        normals[vertexIndex + 1],
        normals[vertexIndex + 2]
      ).applyMatrix4(mesh.matrixWorld).normalize();

      // Convert UV to screen coordinates (assuming 1024x1024 texture)
      const screenX = u * 1024;
      const screenY = (1 - v) * 1024;

      // Calculate face index and barycentric coordinates
      let faceIndex = -1;
      let barycentricCoords = new THREE.Vector3(0, 0, 0);

      if (indices) {
        faceIndex = Math.floor((Math.floor(i / 2) * 3) / 3);
        const faceStart = faceIndex * 3;
        const a = indices[faceStart];
        const b = indices[faceStart + 1];
        const c = indices[faceStart + 2];

        if (Math.floor(i / 2) === a || Math.floor(i / 2) === b || Math.floor(i / 2) === c) {
          // Calculate barycentric coordinates
          const vertexIndexInFace = Math.floor(i / 2) === a ? 0 : Math.floor(i / 2) === b ? 1 : 2;
          barycentricCoords = this.calculateBarycentricCoordinates(vertexIndexInFace);
        }
      }

      const uvPoint: UVPoint = {
        u,
        v,
        x: screenX,
        y: screenY,
        worldPosition,
        normal,
        meshId: mesh.uuid,
        faceIndex,
        barycentricCoords
      };

      uvPoints.push(uvPoint);

      // Update UV bounds
      uvBounds.min.min(new THREE.Vector2(u, v));
      uvBounds.max.max(new THREE.Vector2(u, v));
    }

    // Calculate mapping properties
    const uvWidth = uvBounds.max.x - uvBounds.min.x;
    const uvHeight = uvBounds.max.y - uvBounds.min.y;
    const uvArea = uvWidth * uvHeight;
    const density = uvPoints.length / uvArea;
    const coverage = uvArea / (uvWidth * uvHeight); // Percentage of UV space used

    return {
      meshId: mesh.uuid,
      uvPoints,
      bounds: uvBounds,
      resolution: { width: 1024, height: 1024 },
      density,
      coverage
    };
  }

  // Calculate barycentric coordinates for a vertex in a triangle
  private calculateBarycentricCoordinates(vertexIndex: number): THREE.Vector3 {
    switch (vertexIndex) {
      case 0: return new THREE.Vector3(1, 0, 0); // Vertex A
      case 1: return new THREE.Vector3(0, 1, 0); // Vertex B
      case 2: return new THREE.Vector3(0, 0, 1); // Vertex C
      default: return new THREE.Vector3(1, 0, 0);
    }
  }

  // Convert screen coordinates to UV coordinates
  public screenToUV(screenX: number, screenY: number, canvasWidth: number, canvasHeight: number): UVPoint | null {
    const cacheKey = `${screenX}-${screenY}-${canvasWidth}-${canvasHeight}`;

    if (this.screenToUVCache.has(cacheKey)) {
      return this.screenToUVCache.get(cacheKey)!;
    }

    // Normalize screen coordinates to UV space
    const normalizedX = screenX / canvasWidth;
    const normalizedY = 1 - (screenY / canvasHeight); // Flip Y axis

    let closestUVPoint: UVPoint | null = null;
    let minDistance = Infinity;

    // Find the closest UV point
    for (const mapping of this.uvMappings.values()) {
      for (const uvPoint of mapping.uvPoints) {
        const distance = Math.sqrt(
          Math.pow(uvPoint.u - normalizedX, 2) +
          Math.pow(uvPoint.v - normalizedY, 2)
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestUVPoint = uvPoint;
        }
      }
    }

    // Cache the result
    this.screenToUVCache.set(cacheKey, closestUVPoint);
    return closestUVPoint;
  }

  // Convert UV coordinates to screen coordinates
  public uvToScreen(u: number, v: number, canvasWidth: number, canvasHeight: number): { x: number; y: number } {
    const cacheKey = `${u}-${v}-${canvasWidth}-${canvasHeight}`;

    if (this.uvToScreenCache.has(cacheKey)) {
      return this.uvToScreenCache.get(cacheKey)!;
    }

    const screenX = u * canvasWidth;
    const screenY = (1 - v) * canvasHeight;

    const result = { x: screenX, y: screenY };
    this.uvToScreenCache.set(cacheKey, result);
    return result;
  }

  // Validate UV mapping quality
  public validateUVMappings(): UVValidationResult {
    const issues: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    let totalCoverage = 0;
    let totalDensity = 0;
    let validMappings = 0;
    let totalResolution = { width: 0, height: 0 };

    for (const [meshId, mapping] of this.uvMappings) {
      // Check UV bounds
      if (mapping.bounds.min.x < 0 || mapping.bounds.min.y < 0 ||
          mapping.bounds.max.x > 1 || mapping.bounds.max.y > 1) {
        issues.push(`Mesh ${meshId}: UV coordinates outside [0,1] range`);
      }

      // Check for overlapping UVs
      const overlappingUVs = this.findOverlappingUVs(mapping.uvPoints);
      if (overlappingUVs.length > 0) {
        warnings.push(`Mesh ${meshId}: ${overlappingUVs.length} overlapping UV coordinates detected`);
      }

      // Check density
      if (mapping.density < 100) {
        warnings.push(`Mesh ${meshId}: Low UV density (${mapping.density.toFixed(2)} points per unit)`);
      }

      // Check coverage
      if (mapping.coverage < 0.8) {
        warnings.push(`Mesh ${meshId}: Low UV space utilization (${(mapping.coverage * 100).toFixed(1)}%)`);
      }

      // Check for seams or gaps
      const seams = this.detectUVSeams(mapping.uvPoints);
      if (seams.length > 0) {
        warnings.push(`Mesh ${meshId}: ${seams.length} UV seams detected`);
      }

      totalCoverage += mapping.coverage;
      totalDensity += mapping.density;
      validMappings++;

      // Use the highest resolution as reference
      if (mapping.resolution.width * mapping.resolution.height > totalResolution.width * totalResolution.height) {
        totalResolution = mapping.resolution;
      }
    }

    // Generate suggestions
    if (totalCoverage / validMappings < 0.9) {
      suggestions.push('Consider optimizing UV layout for better texture utilization');
    }

    if (totalDensity / validMappings < 200) {
      suggestions.push('Consider increasing UV density for better puff detail');
    }

    if (issues.length === 0 && warnings.length === 0) {
      suggestions.push('UV mapping looks good! Ready for puff printing.');
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings,
      suggestions,
      coverage: totalCoverage / validMappings,
      density: totalDensity / validMappings,
      resolution: totalResolution
    };
  }

  // Find overlapping UV coordinates
  private findOverlappingUVs(uvPoints: UVPoint[]): UVPoint[] {
    const overlapping: UVPoint[] = [];
    const seen = new Set<string>();

    for (const point of uvPoints) {
      const key = `${point.u.toFixed(4)}-${point.v.toFixed(4)}`;

      if (seen.has(key)) {
        overlapping.push(point);
      } else {
        seen.add(key);
      }
    }

    return overlapping;
  }

  // Detect UV seams (edges where UV coordinates don't match)
  private detectUVSeams(uvPoints: UVPoint[]): { point1: UVPoint; point2: UVPoint; distance: number }[] {
    const seams: { point1: UVPoint; point2: UVPoint; distance: number }[] = [];

    for (let i = 0; i < uvPoints.length; i++) {
      for (let j = i + 1; j < uvPoints.length; j++) {
        const p1 = uvPoints[i];
        const p2 = uvPoints[j];

        // Check if points are close in 3D space but far in UV space (indicating a seam)
        const worldDistance = p1.worldPosition.distanceTo(p2.worldPosition);
        const uvDistance = Math.sqrt(Math.pow(p1.u - p2.u, 2) + Math.pow(p1.v - p2.v, 2));

        if (worldDistance < 0.01 && uvDistance > 0.1) {
          seams.push({ point1: p1, point2: p2, distance: uvDistance });
        }
      }
    }

    return seams;
  }

  // Generate optimized UV layout
  public generateOptimizedUVLayout(mesh: THREE.Mesh): UVMapping | null {
    // This would implement advanced UV unwrapping algorithms
    // For now, return the existing mapping
    return this.uvMappings.get(mesh.uuid) || null;
  }

  // Get UV mapping for a specific mesh
  public getUVMappings(meshId: string): UVMapping | null {
    return this.uvMappings.get(meshId) || null;
  }

  // Get all UV mappings
  public getAllUVMappings(): Map<string, UVMapping> {
    return this.uvMappings;
  }

  // Clear caches
  public clearCaches(): void {
    this.screenToUVCache.clear();
    this.uvToScreenCache.clear();
  }

  // Dispose of resources
  public dispose(): void {
    this.uvMappings.clear();
    this.screenToUVCache.clear();
    this.uvToScreenCache.clear();
  }
}
