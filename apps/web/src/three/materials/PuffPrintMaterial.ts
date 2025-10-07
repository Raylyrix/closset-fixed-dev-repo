import * as THREE from 'three';
import { puffPrintVertexShader } from '../shaders/PuffPrintVertex';
import { puffPrintFragmentShader } from '../shaders/PuffPrintFragment';

export interface PuffPrintMaterialOptions {
  baseMap?: THREE.Texture;
  puffMap?: THREE.Texture;
  puffColor?: THREE.Color;
  puffOpacity?: number;
  puffIntensity?: number;
  debugPuff?: boolean;
  normalStrength?: number;
  edgeSoftness?: number;
}

export class PuffPrintMaterial extends THREE.ShaderMaterial {
  private _puffIntensity: number = 1.0;
  private _puffColor: THREE.Color = new THREE.Color(0xffffff);
  private _puffOpacity: number = 1.0;

  constructor(options: PuffPrintMaterialOptions = {}) {
    super({
      vertexShader: puffPrintVertexShader,
      fragmentShader: puffPrintFragmentShader,
      uniforms: {
        baseMap: { value: options.baseMap || null },
        puffMap: { value: options.puffMap || null },
        puffColor: { value: options.puffColor || new THREE.Color(0xffffff) },
        puffOpacity: { value: options.puffOpacity || 1.0 },
        puffIntensity: { value: options.puffIntensity || 1.0 },
        debugPuff: { value: options.debugPuff ?? false },
        normalStrength: { value: options.normalStrength ?? 1.0 },
        edgeSoftness: { value: options.edgeSoftness ?? 0.02 },
        texelSize: { value: new THREE.Vector2(1, 1) }
      },
      // Render as translucent overlay using alpha from the fragment shader
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    // Set properties
    if (options.puffIntensity !== undefined) this.puffIntensity = options.puffIntensity;
    if (options.puffColor !== undefined) this.puffColor = options.puffColor;
    if (options.puffOpacity !== undefined) this.puffOpacity = options.puffOpacity;
    if (options.debugPuff !== undefined) this.debugPuff = options.debugPuff;
    if (options.normalStrength !== undefined) this.normalStrength = options.normalStrength;
  }

  // Getters and setters for uniforms
  get puffIntensity(): number {
    return this._puffIntensity;
  }

  set puffIntensity(value: number) {
    this._puffIntensity = value;
    this.uniforms.puffIntensity.value = value;
  }



  get puffColor(): THREE.Color {
    return this._puffColor;
  }

  set puffColor(value: THREE.Color) {
    this._puffColor = value;
    this.uniforms.puffColor.value = value;
  }

  get puffOpacity(): number {
    return this._puffOpacity;
  }

  set puffOpacity(value: number) {
    this._puffOpacity = value;
    this.uniforms.puffOpacity.value = value;
  }

  // Texture setters
  setBaseMap(texture: THREE.Texture | null) {
    this.uniforms.baseMap.value = texture;
  }

  setPuffMap(texture: THREE.Texture | null) {
    this.uniforms.puffMap.value = texture;
    if (texture) {
      try {
        // Ensure height/normal source is in linear space and has mipmaps/filters for smoother derivatives
        // @ts-ignore colorSpace exists on modern three
        (texture as any).colorSpace = (THREE as any).LinearSRGBColorSpace || (THREE as any).NoColorSpace || (texture as any).colorSpace;
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.needsUpdate = true;
        // Update texel size uniform when dimensions are known
        const img: any = (texture as any).image;
        const w = img?.width || 1024;
        const h = img?.height || 1024;
        this.uniforms.texelSize.value.set(1 / w, 1 / h);
      } catch {}
    }
  }

  get debugPuff(): boolean {
    return !!this.uniforms.debugPuff.value;
  }

  set debugPuff(v: boolean) {
    this.uniforms.debugPuff.value = v;
  }

  get normalStrength(): number {
    return this.uniforms.normalStrength.value as number;
  }

  set normalStrength(v: number) {
    this.uniforms.normalStrength.value = v;
  }

  // Clone method aligned with THREE.Material API
  clone(): this {
    const cloned = super.clone() as this;
    // ensure custom fields are copied
    cloned.puffIntensity = this.puffIntensity;
    cloned.puffColor = this.puffColor.clone();
    cloned.puffOpacity = this.puffOpacity;
    cloned.uniforms.baseMap.value = this.uniforms.baseMap.value;
    cloned.uniforms.puffMap.value = this.uniforms.puffMap.value;
    return cloned;
  }
}
