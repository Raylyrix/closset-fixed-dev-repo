export const puffPrintFragmentShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform sampler2D baseMap;
uniform sampler2D puffMap;
uniform vec3 puffColor;
uniform float puffOpacity;
uniform float puffIntensity;
uniform bool debugPuff;
uniform float normalStrength;
uniform float edgeSoftness;
uniform vec2 texelSize;

void main() {
    // Debug: force a visible overlay to verify pipeline when enabled
    // Do this before any texture sampling to avoid dependency on bound textures
    if (debugPuff) {
        gl_FragColor = vec4(0.1, 1.0, 0.1, 1.0);
        return;
    }
    // Sample textures
    vec4 baseColor = texture2D(baseMap, vUv);
    vec4 puffSample = texture2D(puffMap, vUv);
    
    // Height from red channel in linear space
    float h = puffSample.r;
    // Edge smoothing to avoid hard aliasing
    float edge = smoothstep(0.0, edgeSoftness, h);
    float puffMask = edge * puffIntensity;

    // Derive normal from smoothed height using Sobel-like kernel
    // 3x3 taps
    float hL = texture2D(puffMap, vUv - vec2(texelSize.x, 0.0)).r;
    float hR = texture2D(puffMap, vUv + vec2(texelSize.x, 0.0)).r;
    float hD = texture2D(puffMap, vUv - vec2(0.0, texelSize.y)).r;
    float hU = texture2D(puffMap, vUv + vec2(0.0, texelSize.y)).r;
    // Central differences
    vec3 Np = normalize(vec3((hL - hR), (hD - hU), 2.0 / max(texelSize.x, texelSize.y)));
    // Blend with geometry normal
    vec3 Ng = normalize(vNormal);
    vec3 N = normalize(mix(Ng, Np, clamp(normalStrength * puffMask, 0.0, 1.0)));
    
    // Blend base color with puff color, or show debug overlay
    vec3 blendColor = mix(baseColor.rgb, puffColor, puffMask * puffOpacity * 0.8); // Reduce intensity to prevent washing out
    vec3 debugColor = mix(baseColor.rgb, vec3(0.1, 1.0, 0.1), clamp(puffMask, 0.0, 1.0));
    vec3 finalColor = blendColor;
    
    // Simple lighting with derived normal - reduced intensity
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float diff = max(dot(N, lightDir), 0.0);
    vec3 ambient = vec3(0.4); // Increased ambient to prevent darkening
    vec3 diffuse = vec3(0.6) * diff; // Reduced diffuse to prevent over-brightening
    
    finalColor = finalColor * (ambient + diffuse);
    
    // Output alpha only where puff exists so overlay is visible only on the mask
    float alpha = clamp(puffMask * puffOpacity, 0.0, 1.0);
    gl_FragColor = vec4(finalColor, alpha);
}
`;
