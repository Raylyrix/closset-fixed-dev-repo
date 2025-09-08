export const puffPrintFragmentShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform sampler2D baseMap;
uniform sampler2D puffMap;
uniform vec3 puffColor;
uniform float puffOpacity;
uniform float puffIntensity;

void main() {
    // Sample textures
    vec4 baseColor = texture2D(baseMap, vUv);
    vec4 puffSample = texture2D(puffMap, vUv);
    
    // Calculate puff effect
    float puffValue = puffSample.r;
    float puffMask = puffValue * puffIntensity;
    
    // Blend base color with puff color
    vec3 finalColor = mix(baseColor.rgb, puffColor, puffMask * puffOpacity);
    
    // Simple lighting
    vec3 N = normalize(vNormal);
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float diff = max(dot(N, lightDir), 0.0);
    vec3 ambient = vec3(0.3);
    vec3 diffuse = vec3(0.7) * diff;
    
    finalColor = finalColor * (ambient + diffuse);
    
    gl_FragColor = vec4(finalColor, baseColor.a);
}
`;
