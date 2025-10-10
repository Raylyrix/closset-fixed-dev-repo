import * as THREE from 'three';
import { UVPoint } from './AdvancedUVSystem';

export interface PuffParameters {
  height: number;
  curvature: number;
  shape: 'round' | 'square' | 'diamond' | 'triangle' | 'airbrush' | 'calligraphy' | 'spray' | 'texture' | 'watercolor' | 'oil' | 'charcoal' | 'pencil' | 'marker' | 'highlighter' | 'chalk' | 'ink' | 'pastel' | 'acrylic' | 'gouache' | 'stencil' | 'stamp' | 'blur' | 'smudge';
  size: number;
  opacity: number;
  hardness: number;
  flow: number;
  spacing: number;
  rotation: number;
  pattern: string | null;
  patternScale: number;
  patternRotation: number;
  symmetry: {
    enabled: boolean;
    axis: 'x' | 'y' | 'z';
    count: number;
  };
}

export interface PuffEffect {
  id: string;
  centerUV: UVPoint;
  parameters: PuffParameters;
  vertices: THREE.Vector3[];
  triangles: number[];
  textureCoords: number[];
  displacementMap: Float32Array;
  normalMap: Float32Array;
  roughnessMap: Float32Array;
  metallicMap: Float32Array;
  aoMap: Float32Array;
  timestamp: number;
}

export class AdvancedPuffGenerator {
  private puffEffects = new Map<string, PuffEffect>();
  private vertexCache = new Map<string, THREE.Vector3[]>();
  private textureCache = new Map<string, Float32Array>();

  // Generate puff effect at UV coordinates
  public generatePuff(
    centerUV: UVPoint,
    parameters: PuffParameters,
    modelBounds: { min: THREE.Vector3; max: THREE.Vector3 }
  ): PuffEffect {
    const puffId = `puff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Generate base geometry
    const { vertices, triangles, textureCoords } = this.generatePuffGeometry(centerUV, parameters);

    // Generate texture maps
    const displacementMap = this.generateDisplacementMap(centerUV, parameters);
    const normalMap = this.generateNormalMap(displacementMap, parameters);
    const roughnessMap = this.generateRoughnessMap(displacementMap, parameters);
    const metallicMap = this.generateMetallicMap(parameters);
    const aoMap = this.generateAOMap(displacementMap, parameters);

    const puffEffect: PuffEffect = {
      id: puffId,
      centerUV,
      parameters,
      vertices,
      triangles,
      textureCoords,
      displacementMap,
      normalMap,
      roughnessMap,
      metallicMap,
      aoMap,
      timestamp: Date.now()
    };

    this.puffEffects.set(puffId, puffEffect);
    return puffEffect;
  }

  // Generate 3D geometry for puff effect
  private generatePuffGeometry(centerUV: UVPoint, parameters: PuffParameters): {
    vertices: THREE.Vector3[];
    triangles: number[];
    textureCoords: number[];
  } {
    const vertices: THREE.Vector3[] = [];
    const triangles: number[] = [];
    const textureCoords: number[] = [];

    const segments = Math.max(8, Math.floor(parameters.size / 10)); // Adaptive detail based on size
    const radius = parameters.size * 0.5;
    const height = parameters.height;

    // Generate base circle
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = 0; // Base height

      // Apply shape modification
      const { modifiedX, modifiedZ } = this.applyShapeModification(
        x,
        z,
        radius,
        parameters.shape,
        parameters.curvature,
        parameters.rotation
      );

      vertices.push(new THREE.Vector3(
        centerUV.worldPosition.x + modifiedX,
        centerUV.worldPosition.y + y,
        centerUV.worldPosition.z + modifiedZ
      ));

      // Texture coordinates (radial)
      const u = 0.5 + (modifiedX / radius) * 0.5;
      const v = 0.5 + (modifiedZ / radius) * 0.5;
      textureCoords.push(u, v);
    }

    // Generate top circle (puffed up)
    const topStartIndex = vertices.length;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = height * (1 - parameters.curvature * 0.5); // Adjust height based on curvature

      const { modifiedX, modifiedZ } = this.applyShapeModification(
        x,
        z,
        radius,
        parameters.shape,
        parameters.curvature,
        parameters.rotation
      );

      vertices.push(new THREE.Vector3(
        centerUV.worldPosition.x + modifiedX,
        centerUV.worldPosition.y + y,
        centerUV.worldPosition.z + modifiedZ
      ));

      // Same texture coordinates as base
      const u = 0.5 + (modifiedX / radius) * 0.5;
      const v = 0.5 + (modifiedZ / radius) * 0.5;
      textureCoords.push(u, v);
    }

    // Generate triangles for sides
    for (let i = 0; i < segments; i++) {
      const base1 = i;
      const base2 = (i + 1) % segments;
      const top1 = topStartIndex + i;
      const top2 = topStartIndex + (i + 1) % segments;

      // Side triangles
      triangles.push(base1, base2, top1);
      triangles.push(base2, top2, top1);

      // Top triangle (if not the last segment)
      if (i < segments - 1) {
        triangles.push(top1, top2, topStartIndex + segments);
      }
    }

    // Add bottom center point and triangles
    const bottomCenter = vertices.length;
    vertices.push(new THREE.Vector3(
      centerUV.worldPosition.x,
      centerUV.worldPosition.y,
      centerUV.worldPosition.z
    ));
    textureCoords.push(0.5, 0.5);

    for (let i = 0; i < segments; i++) {
      const base1 = i;
      const base2 = (i + 1) % segments;
    }

    return { vertices, triangles, textureCoords };
  }

  // Calculate falloff based on brush shape and hardness
  private calculateFalloff(distance: number, shape: string, hardness: number): number {
    const normalizedDistance = distance * 2; // 0 to 1

    switch (shape) {
      case 'square':
        return normalizedDistance <= 1 ? 1 : 0;
      case 'diamond':
        return normalizedDistance <= 1 ? (1 - normalizedDistance) : 0;
      case 'triangle':
        return normalizedDistance <= 1 ? (1 - normalizedDistance * 1.5) : 0;
      case 'airbrush':
        // Soft falloff with some randomness
        const randomFalloff = 0.8 + Math.random() * 0.4;
        return Math.exp(-normalizedDistance * normalizedDistance * randomFalloff);
      case 'calligraphy':
        // Sharp center, gradual falloff
        return normalizedDistance <= 0.3 ? 1 : Math.exp(-Math.pow(normalizedDistance - 0.3, 2) * 4);
      default: // round
        const hardnessFactor = 1 - hardness;
        return Math.exp(-normalizedDistance * normalizedDistance / (hardnessFactor * 0.5 + 0.1));
    }
  }

  // Apply pattern to displacement
  private applyPattern(x: number, y: number, size: number, patternId: string, scale: number, rotationDegrees: number): number {
    const rotation = THREE.MathUtils.degToRad(rotationDegrees || 0);
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    // Rotate coordinates so pattern rotation matches brush orientation
    const centeredX = x - size / 2;
    const centeredY = y - size / 2;
    const rotatedX = centeredX * cos - centeredY * sin + size / 2;
    const rotatedY = centeredX * sin + centeredY * cos + size / 2;

    switch (patternId) {
      case 'stripes':
        return Math.sin((rotatedX * scale + rotatedY) * 0.02) * 0.5 + 0.5;
      case 'polka':
        return Math.sin((rotatedX * scale + rotatedY * scale) * 0.02) * 0.5 + 0.5;
      case 'grid':
        return (
          Math.sin(rotatedX * scale * 0.02) * Math.sin(rotatedY * scale * 0.02)
        ) * 0.5 + 0.5;
      default:
        return 1;
    }
  }

  private smoothstep(edge0: number, edge1: number, x: number): number {
    const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  private hashNoise2D(x: number, y: number): number {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return s - Math.floor(s);
  }

  private fractalNoise(
    x: number,
    y: number,
    octaves = 4,
    persistence = 0.5,
    lacunarity = 2
  ): number {
    let amplitude = 1;
    let frequency = 1;
    let value = 0;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      value += this.hashNoise2D(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return maxValue > 0 ? value / maxValue : 0;
  }

  private computeGradientMagnitude(map: Float32Array, size: number, index: number): number {
    const x = index % size;
    const y = Math.floor(index / size);

    const getHeight = (nx: number, ny: number) => {
      const clampedX = THREE.MathUtils.clamp(nx, 0, size - 1);
      const clampedY = THREE.MathUtils.clamp(ny, 0, size - 1);
      return map[clampedY * size + clampedX];
    };

    const dx = getHeight(x + 1, y) - getHeight(x - 1, y);
    const dy = getHeight(x, y + 1) - getHeight(x, y - 1);
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getTextureResolution(parameters: PuffParameters): number {
    const base = Math.max(64, Math.round(parameters.size * 4));
    const clamped = Math.min(1024, base);
    return Math.pow(2, Math.ceil(Math.log2(clamped)));
  }

  private rotatePoint(x: number, z: number, angle: number): { x: number; z: number } {
    if (angle === 0) {
      return { x, z };
    }

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: x * cos - z * sin,
      z: x * sin + z * cos
    };
  }

  private applyShapeModification(
    x: number,
    z: number,
    radius: number,
    shape: PuffParameters['shape'],
    curvature: number,
    rotationDegrees: number
  ): { modifiedX: number; modifiedZ: number } {
    const rotation = THREE.MathUtils.degToRad(rotationDegrees || 0);
    const rotated = this.rotatePoint(x, z, rotation);
    let adjustedX = rotated.x;
    let adjustedZ = rotated.z;

    const normalizedX = Math.abs(rotated.x) / (radius || 1);
    const normalizedZ = Math.abs(rotated.z) / (radius || 1);
    const normalizedMax = Math.max(normalizedX, normalizedZ);

    switch (shape) {
      case 'square': {
        const scale = normalizedMax > 0 ? Math.min(1, normalizedMax) / (normalizedMax || 1) : 1;
        adjustedX = rotated.x / scale;
        adjustedZ = rotated.z / scale;
        break;
      }
      case 'diamond': {
        const rotated45 = this.rotatePoint(rotated.x, rotated.z, Math.PI / 4);
        const maxComponent = Math.max(Math.abs(rotated45.x), Math.abs(rotated45.z));
        const limited = maxComponent > radius ? radius / maxComponent : 1;
        const corrected = {
          x: rotated45.x * limited,
          z: rotated45.z * limited
        };
        const reverted = this.rotatePoint(corrected.x, corrected.z, -Math.PI / 4);
        adjustedX = reverted.x;
        adjustedZ = reverted.z;
        break;
      }
      case 'triangle': {
        const angle = Math.atan2(rotated.z, rotated.x);
        const segment = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * 3);
        const baseAngle = segment * (Math.PI * 2 / 3);
        const relativeAngle = angle - baseAngle;
        const limit = Math.PI / 3;
        const clampedAngle = Math.max(-limit / 2, Math.min(limit / 2, relativeAngle));
        const targetAngle = baseAngle + clampedAngle;
        const distance = Math.min(radius, Math.sqrt(rotated.x ** 2 + rotated.z ** 2));
        adjustedX = Math.cos(targetAngle) * distance;
        adjustedZ = Math.sin(targetAngle) * distance;
        break;
      }
      case 'airbrush': {
        const smoothScale = Math.max(0.4, 1 - curvature * 0.4);
        adjustedX = rotated.x * smoothScale;
        adjustedZ = rotated.z * smoothScale;
        break;
      }
      case 'calligraphy': {
        const stretch = 0.6 + curvature * 0.4;
        adjustedX = rotated.x;
        adjustedZ = rotated.z * stretch;
        break;
      }
      default:
        break;
    }

    // Ensure we stay within radius
    const distance = Math.sqrt(adjustedX ** 2 + adjustedZ ** 2);
    if (distance > radius) {
      const clampScale = radius / distance;
      adjustedX *= clampScale;
      adjustedZ *= clampScale;
    }

    const reverted = this.rotatePoint(adjustedX, adjustedZ, -rotation);
    return { modifiedX: reverted.x, modifiedZ: reverted.z };
  }

  private generateDisplacementMap(centerUV: UVPoint, parameters: PuffParameters): Float32Array {
    const size = this.getTextureResolution(parameters);
    const displacementData = new Float32Array(size * size);
    const halfSize = size / 2;
    const radius = parameters.size * 0.5 || 1;
    const opacity = Math.max(0, Math.min(1, parameters.opacity));
    const flow = THREE.MathUtils.clamp(parameters.flow, 0, 1.5);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const localX = ((x - halfSize) / halfSize) * radius;
        const localZ = ((y - halfSize) / halfSize) * radius;

        const { modifiedX, modifiedZ } = this.applyShapeModification(
          localX,
          localZ,
          radius,
          parameters.shape,
          parameters.curvature,
          parameters.rotation
        );

        const normalizedDistance = Math.min(
          1,
          Math.sqrt(modifiedX ** 2 + modifiedZ ** 2) / radius
        );

        let falloff = this.calculateFalloff(normalizedDistance, parameters.shape, parameters.hardness);
        falloff *= flow;

        if (parameters.pattern) {
          falloff *= this.applyPattern(x, y, size, parameters.pattern, parameters.patternScale, parameters.patternRotation);
        }

        const smoothDome = Math.pow(Math.max(0, Math.cos(normalizedDistance * Math.PI * 0.5)), 1 + parameters.curvature * 1.5);
        const softProfile = Math.pow(Math.max(0, 1 - Math.pow(normalizedDistance, 1.35)), 1 + parameters.curvature);
        const edgeSoftening = this.smoothstep(0.7, 1, normalizedDistance);

        let heightValue = falloff * (0.6 * softProfile + 0.4 * smoothDome);
        heightValue *= 1 - edgeSoftening * 0.6;

        const centerHighlight = this.smoothstep(0.0, 0.35, 1 - normalizedDistance) * 0.12;
        heightValue += centerHighlight;

        const macroNoise = (this.fractalNoise(x * 0.018, y * 0.018, 3, 0.65, 2.1) - 0.5) * 0.08;
        const microNoise = (this.fractalNoise(x * 0.055, y * 0.055, 2, 0.7, 2.3) - 0.5) * 0.04;
        heightValue += macroNoise + microNoise;

        heightValue = THREE.MathUtils.clamp(heightValue, 0, 1) * opacity;
        displacementData[y * size + x] = heightValue;
      }
    }

    return displacementData;
  }

  // Generate normal map from displacement
  private generateNormalMap(displacementMap: Float32Array, parameters: PuffParameters): Float32Array {
    const size = Math.sqrt(displacementMap.length);
    const normalData = new Float32Array(size * size * 3);
    const strength = Math.max(0.1, parameters.curvature * 2);

    const getHeight = (x: number, y: number) => {
      const clampedX = Math.max(0, Math.min(size - 1, x));
      const clampedY = Math.max(0, Math.min(size - 1, y));
      return displacementMap[clampedY * size + clampedX];
    };

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const heightLeft = getHeight(x - 1, y);
        const heightRight = getHeight(x + 1, y);
        const heightTop = getHeight(x, y - 1);
        const heightBottom = getHeight(x, y + 1);

        const dx = (heightRight - heightLeft) * strength;
        const dy = (heightBottom - heightTop) * strength;
        const dz = 1.0;

        const length = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
        const nx = -dx / length;
        const ny = -dy / length;
        const nz = dz / length;

        const pixelIdx = (y * size + x) * 3;
        normalData[pixelIdx] = nx * 0.5 + 0.5;
        normalData[pixelIdx + 1] = ny * 0.5 + 0.5;
        normalData[pixelIdx + 2] = nz * 0.5 + 0.5;
      }
    }

    return normalData;
  }

  // Generate roughness map
  private generateRoughnessMap(displacementMap: Float32Array, parameters: PuffParameters): Float32Array {
    const roughnessData = new Float32Array(displacementMap.length);
    const size = Math.sqrt(displacementMap.length);
    const smoothnessFactor = Math.max(0.35, 1 - parameters.curvature * 0.4);

    for (let i = 0; i < displacementMap.length; i++) {
      const height = displacementMap[i];
      const gradient = this.computeGradientMagnitude(displacementMap, size, i);
      let roughness = 0.35 + gradient * 0.9 + (1 - height) * smoothnessFactor;
      roughness -= this.smoothstep(0.55, 1.0, height) * 0.25;
      roughnessData[i] = THREE.MathUtils.clamp(roughness, 0.2, 0.9);
    }

    return roughnessData;
  }

  // Generate metallic map (fabric is typically non-metallic)
  private generateMetallicMap(parameters: PuffParameters): Float32Array {
    const size = this.getTextureResolution(parameters);
    const metallicData = new Float32Array(size * size);
    metallicData.fill(0);
    return metallicData;
  }

  // Generate ambient occlusion map
  private generateAOMap(displacementMap: Float32Array, parameters: PuffParameters): Float32Array {
    const size = Math.sqrt(displacementMap.length);
    const aoData = new Float32Array(size * size);
    const aoRadius = Math.max(2, Math.round(size * 0.05));
    const aoStrength = 0.3 + parameters.curvature * 0.2;

    const getHeight = (x: number, y: number) => {
      const clampedX = Math.max(0, Math.min(size - 1, x));
      const clampedY = Math.max(0, Math.min(size - 1, y));
      return displacementMap[clampedY * size + clampedX];
    };

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const centerHeight = getHeight(x, y);
        let occlusion = 0;
        let samples = 0;

        for (let dy = -aoRadius; dy <= aoRadius; dy += 2) {
          for (let dx = -aoRadius; dx <= aoRadius; dx += 2) {
            if (dx === 0 && dy === 0) continue;
            const sampleHeight = getHeight(x + dx, y + dy);
            if (sampleHeight > centerHeight) {
              const distance = Math.sqrt(dx * dx + dy * dy);
              const weight = Math.max(0, 1 - distance / (aoRadius + 1));
              occlusion += (sampleHeight - centerHeight) * weight;
            }
            samples++;
          }
        }

        const idx = y * size + x;
        const gradient = this.computeGradientMagnitude(displacementMap, size, idx);
        const normalizedOcclusion = samples > 0 ? Math.min(1, (occlusion / samples) * aoStrength) : 0;
        const rimDarkening = this.smoothstep(0.12, 0.45, gradient) * 0.3;
        const centerLift = this.smoothstep(0.65, 1.0, centerHeight) * 0.12;

        let aoValue = 1 - normalizedOcclusion - rimDarkening + centerLift;
        aoData[idx] = THREE.MathUtils.clamp(aoValue, 0.2, 1);
      }
    }

    return aoData;
  }

  // Apply symmetry to puff effect
  public applySymmetry(puffEffect: PuffEffect, symmetry: PuffParameters['symmetry']): PuffEffect[] {
    if (!symmetry.enabled) return [puffEffect];

    const effects: PuffEffect[] = [puffEffect];
    const center = puffEffect.centerUV.worldPosition;

    for (let i = 1; i < symmetry.count; i++) {
      const angle = (Math.PI * 2 * i) / symmetry.count;

      const newCenterUV = { ...puffEffect.centerUV };
      newCenterUV.worldPosition = this.applySymmetryTransformation(
        puffEffect.centerUV.worldPosition,
        center,
        symmetry.axis,
        angle
      );

      const newEffect = {
        ...puffEffect,
        id: `${puffEffect.id}-symmetry-${i}`,
        centerUV: newCenterUV
      };

      effects.push(newEffect);
    }

    return effects;
  }

  // Apply symmetry transformation
  private applySymmetryTransformation(
    point: THREE.Vector3,
    center: THREE.Vector3,
    axis: string,
    angle: number
  ): THREE.Vector3 {
    const relative = point.clone().sub(center);

    switch (axis) {
      case 'x':
        relative.applyAxisAngle(new THREE.Vector3(1, 0, 0), angle);
        break;
      case 'y':
        relative.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        break;
      case 'z':
        relative.applyAxisAngle(new THREE.Vector3(0, 0, 1), angle);
        break;
    }

    return relative.add(center);
  }

  // Get all puff effects
  public getPuffEffects(): PuffEffect[] {
    return Array.from(this.puffEffects.values());
  }

  // Get puff effect by ID
  public getPuffEffect(id: string): PuffEffect | null {
    return this.puffEffects.get(id) || null;
  }

  // Remove puff effect
  public removePuffEffect(id: string): void {
    this.puffEffects.delete(id);
  }

  // Clear all puff effects
  public clearPuffEffects(): void {
    this.puffEffects.clear();
    this.vertexCache.clear();
    this.textureCache.clear();
  }

  // Dispose of resources
  public dispose(): void {
    this.puffEffects.clear();
    this.vertexCache.clear();
    this.textureCache.clear();
  }
}
