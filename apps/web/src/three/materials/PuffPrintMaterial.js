import * as THREE from 'three';
import { puffPrintVertexShader } from '../shaders/PuffPrintVertex';
import { puffPrintFragmentShader } from '../shaders/PuffPrintFragment';
export class PuffPrintMaterial extends THREE.ShaderMaterial {
    constructor(options = {}) {
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
        this._puffIntensity = 1.0;
        this._puffColor = new THREE.Color(0xffffff);
        this._puffOpacity = 1.0;
        // Set properties
        if (options.puffIntensity !== undefined)
            this.puffIntensity = options.puffIntensity;
        if (options.puffColor !== undefined)
            this.puffColor = options.puffColor;
        if (options.puffOpacity !== undefined)
            this.puffOpacity = options.puffOpacity;
    }
    // Getters and setters for uniforms
    get puffIntensity() {
        return this._puffIntensity;
    }
    set puffIntensity(value) {
        this._puffIntensity = value;
        this.uniforms.puffIntensity.value = value;
    }
    get puffColor() {
        return this._puffColor;
    }
    set puffColor(value) {
        this._puffColor = value;
        this.uniforms.puffColor.value = value;
    }
    get puffOpacity() {
        return this._puffOpacity;
    }
    set puffOpacity(value) {
        this._puffOpacity = value;
        this.uniforms.puffOpacity.value = value;
    }
    // Texture setters
    setBaseMap(texture) {
        this.uniforms.baseMap.value = texture;
    }
    setPuffMap(texture) {
        this.uniforms.puffMap.value = texture;
    }
    // Clone method aligned with THREE.Material API
    clone() {
        const cloned = super.clone();
        // ensure custom fields are copied
        cloned.puffIntensity = this.puffIntensity;
        cloned.puffColor = this.puffColor.clone();
        cloned.puffOpacity = this.puffOpacity;
        cloned.uniforms.baseMap.value = this.uniforms.baseMap.value;
        cloned.uniforms.puffMap.value = this.uniforms.puffMap.value;
        return cloned;
    }
}
