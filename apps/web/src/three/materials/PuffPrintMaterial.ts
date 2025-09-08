import * as THREE from 'three';
import { puffPrintVertexShader } from '../shaders/PuffPrintVertex';
import { puffPrintFragmentShader } from '../shaders/PuffPrintFragment';

export interface PuffPrintMaterialOptions {
  baseMap?: THREE.Texture;
  puffMap?: THREE.Texture;
  puffColor?: THREE.Color;
  puffOpacity?: number;
  puffIntensity?: number;
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
        puffIntensity: { value: options.puffIntensity || 1.0 }
      },
      transparent: true,
      side: THREE.DoubleSide
    });

    // Set properties
    if (options.puffIntensity !== undefined) this.puffIntensity = options.puffIntensity;
    if (options.puffColor !== undefined) this.puffColor = options.puffColor;
    if (options.puffOpacity !== undefined) this.puffOpacity = options.puffOpacity;
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
  }

  // Clone method
  clone(): PuffPrintMaterial {
    const cloned = new PuffPrintMaterial({
      baseMap: this.uniforms.baseMap.value,
      puffMap: this.uniforms.puffMap.value,
      puffColor: this.puffColor.clone(),
      puffOpacity: this.puffOpacity,
      puffIntensity: this.puffIntensity
    });

    return cloned;
  }
}
