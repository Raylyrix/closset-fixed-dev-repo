/**
 * Ultra-Realistic Satin Stitch WebGL Shaders
 * Provides advanced shaders for rendering hyper-realistic satin stitches
 */

export class SatinStitchShaders {
  /**
   * Vertex shader for satin stitch rendering
   */
  static getVertexShader(): string {
    return `
      #version 300 es
      precision highp float;
      
      in vec3 position;
      in vec3 normal;
      in vec2 uv;
      in vec3 color;
      in float height;
      in float sheen;
      in float roughness;
      in float metallic;
      in float glowIntensity;
      
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      uniform mat4 normalMatrix;
      uniform vec3 lightDirection;
      uniform vec3 lightColor;
      uniform float lightIntensity;
      uniform vec3 ambientColor;
      uniform float ambientIntensity;
      uniform vec3 cameraPosition;
      uniform float time;
      
      out vec3 fragPosition;
      out vec3 fragNormal;
      out vec2 fragUV;
      out vec3 fragColor;
      out float fragHeight;
      out float fragSheen;
      out float fragRoughness;
      out float fragMetallic;
      out float fragGlowIntensity;
      out vec3 fragLightDirection;
      out vec3 fragLightColor;
      out float fragLightIntensity;
      out vec3 fragAmbientColor;
      out float fragAmbientIntensity;
      out vec3 fragCameraPosition;
      out float fragTime;
      
      // Thread twist calculation
      float calculateThreadTwist(vec2 uv, float twistRate, float time) {
        float twist = sin(uv.x * 10.0 + time * 0.5) * twistRate;
        return twist;
      }
      
      // Satin stitch height variation
      float calculateSatinHeight(vec2 uv, float baseHeight) {
        // Create subtle height variations for realistic satin texture
        float heightVariation = sin(uv.x * 20.0) * cos(uv.y * 15.0) * 0.1;
        return baseHeight + heightVariation;
      }
      
      void main() {
        // Calculate thread twist effect
        float twist = calculateThreadTwist(uv, 0.5, time);
        
        // Apply twist to position
        vec3 twistedPosition = position;
        twistedPosition.x += cos(twist) * 0.01;
        twistedPosition.y += sin(twist) * 0.01;
        
        // Calculate satin height
        float satinHeight = calculateSatinHeight(uv, height);
        twistedPosition.z += satinHeight;
        
        // Transform position
        vec4 worldPosition = modelViewMatrix * vec4(twistedPosition, 1.0);
        fragPosition = worldPosition.xyz;
        
        // Transform normal
        fragNormal = normalize((normalMatrix * vec4(normal, 0.0)).xyz);
        
        // Pass through other attributes
        fragUV = uv;
        fragColor = color;
        fragHeight = satinHeight;
        fragSheen = sheen;
        fragRoughness = roughness;
        fragMetallic = metallic;
        fragGlowIntensity = glowIntensity;
        fragLightDirection = lightDirection;
        fragLightColor = lightColor;
        fragLightIntensity = lightIntensity;
        fragAmbientColor = ambientColor;
        fragAmbientIntensity = ambientIntensity;
        fragCameraPosition = cameraPosition;
        fragTime = time;
        
        gl_Position = projectionMatrix * worldPosition;
      }
    `;
  }

  /**
   * Fragment shader for satin stitch rendering
   */
  static getFragmentShader(): string {
    return `
      #version 300 es
      precision highp float;
      
      in vec3 fragPosition;
      in vec3 fragNormal;
      in vec2 fragUV;
      in vec3 fragColor;
      in float fragHeight;
      in float fragSheen;
      in float fragRoughness;
      in float fragMetallic;
      in float fragGlowIntensity;
      in vec3 fragLightDirection;
      in vec3 fragLightColor;
      in float fragLightIntensity;
      in vec3 fragAmbientColor;
      in float fragAmbientIntensity;
      in vec3 fragCameraPosition;
      in float fragTime;
      
      out vec4 fragColorOut;
      
      // PBR (Physically Based Rendering) functions
      float distributionGGX(vec3 N, vec3 H, float roughness) {
        float a = roughness * roughness;
        float a2 = a * a;
        float NdotH = max(dot(N, H), 0.0);
        float NdotH2 = NdotH * NdotH;
        
        float num = a2;
        float denom = (NdotH2 * (a2 - 1.0) + 1.0);
        denom = 3.14159265359 * denom * denom;
        
        return num / denom;
      }
      
      float geometrySchlickGGX(float NdotV, float roughness) {
        float r = (roughness + 1.0);
        float k = (r * r) / 8.0;
        
        float num = NdotV;
        float denom = NdotV * (1.0 - k) + k;
        
        return num / denom;
      }
      
      float geometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
        float NdotV = max(dot(N, V), 0.0);
        float NdotL = max(dot(N, L), 0.0);
        float ggx2 = geometrySchlickGGX(NdotV, roughness);
        float ggx1 = geometrySchlickGGX(NdotL, roughness);
        
        return ggx1 * ggx2;
      }
      
      vec3 fresnelSchlick(float cosTheta, vec3 F0) {
        return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
      }
      
      // Thread texture simulation
      vec3 calculateThreadTexture(vec2 uv, vec3 baseColor, float time) {
        // Simulate thread twist and texture
        float twist = sin(uv.x * 15.0 + time * 0.3) * 0.1;
        float threadPattern = sin(uv.x * 30.0 + twist) * 0.05;
        
        // Add subtle color variation
        vec3 colorVariation = vec3(
          sin(uv.x * 20.0 + time * 0.2) * 0.1,
          cos(uv.y * 25.0 + time * 0.15) * 0.1,
          sin(uv.x * 35.0 + uv.y * 20.0 + time * 0.25) * 0.1
        );
        
        return baseColor + colorVariation + threadPattern;
      }
      
      // Satin sheen calculation
      float calculateSatinSheen(vec3 normal, vec3 viewDir, vec3 lightDir, float sheen) {
        vec3 reflectDir = reflect(-lightDir, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
        return spec * sheen;
      }
      
      // Glow effect
      vec3 calculateGlow(vec3 baseColor, float glowIntensity, float time) {
        float glow = sin(time * 2.0) * 0.5 + 0.5;
        return baseColor + baseColor * glow * glowIntensity;
      }
      
      // Variegation pattern
      vec3 applyVariegation(vec3 baseColor, vec2 uv, float time) {
        float variegation = sin(uv.x * 8.0 + time * 0.1) * cos(uv.y * 6.0 + time * 0.08);
        return baseColor + baseColor * variegation * 0.2;
      }
      
      void main() {
        // Normalize vectors
        vec3 N = normalize(fragNormal);
        vec3 V = normalize(fragCameraPosition - fragPosition);
        vec3 L = normalize(fragLightDirection);
        vec3 H = normalize(V + L);
        
        // Calculate thread texture
        vec3 threadColor = calculateThreadTexture(fragUV, fragColor, fragTime);
        
        // Apply variegation
        threadColor = applyVariegation(threadColor, fragUV, fragTime);
        
        // Calculate PBR properties
        vec3 F0 = mix(vec3(0.04), threadColor, fragMetallic);
        
        // Calculate BRDF
        float NdotL = max(dot(N, L), 0.0);
        float NdotV = max(dot(N, V), 0.0);
        
        // Diffuse
        vec3 diffuse = threadColor / 3.14159265359;
        
        // Specular
        float D = distributionGGX(N, H, fragRoughness);
        float G = geometrySmith(N, V, L, fragRoughness);
        vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);
        
        vec3 specular = (D * G * F) / (4.0 * NdotV * NdotL + 0.0001);
        
        // Satin sheen
        float satinSheen = calculateSatinSheen(N, V, L, fragSheen);
        specular += satinSheen * fragLightColor;
        
        // Combine lighting
        vec3 radiance = fragLightColor * fragLightIntensity;
        vec3 ambient = fragAmbientColor * fragAmbientIntensity;
        
        vec3 color = ambient + (diffuse + specular) * radiance * NdotL;
        
        // Apply glow effect
        if (fragGlowIntensity > 0.0) {
          color += calculateGlow(threadColor, fragGlowIntensity, fragTime);
        }
        
        // Add subtle height-based shading
        float heightShading = 1.0 + fragHeight * 0.5;
        color *= heightShading;
        
        // Gamma correction
        color = pow(color, vec3(1.0 / 2.2));
        
        fragColorOut = vec4(color, 1.0);
      }
    `;
  }

  /**
   * Compute shader for satin stitch generation
   */
  static getComputeShader(): string {
    return `
      #version 310 es
      
      layout(local_size_x = 8, local_size_y = 8, local_size_z = 1) in;
      
      layout(rgba32f, binding = 0) uniform image2D stitchTexture;
      layout(rgba32f, binding = 1) uniform image2D normalTexture;
      layout(rgba32f, binding = 2) uniform image2D heightTexture;
      
      uniform float time;
      uniform vec2 resolution;
      uniform float stitchDensity;
      uniform float stitchWidth;
      uniform float stitchHeight;
      uniform float zigzagAmplitude;
      uniform float zigzagFrequency;
      
      // Generate satin stitch pattern
      void generateSatinPattern(vec2 uv, float time) {
        ivec2 coord = ivec2(uv * resolution);
        
        // Calculate zigzag pattern
        float zigzag = sin(uv.x * zigzagFrequency * 3.14159 * 2.0) * zigzagAmplitude;
        
        // Calculate stitch density
        float density = sin(uv.y * stitchDensity * 3.14159 * 2.0) * 0.5 + 0.5;
        
        // Generate stitch texture
        vec4 stitchColor = vec4(1.0, 0.4, 0.7, 1.0); // Pink satin color
        stitchColor.rgb += zigzag * 0.1;
        stitchColor.a = density;
        
        // Generate normal map
        vec3 normal = vec3(0.0, 0.0, 1.0);
        normal.xy += vec2(zigzag * 0.1, 0.0);
        normal = normalize(normal);
        
        // Generate height map
        float height = stitchHeight + zigzag * 0.05;
        
        // Write to textures
        imageStore(stitchTexture, coord, stitchColor);
        imageStore(normalTexture, coord, vec4(normal, 1.0));
        imageStore(heightTexture, coord, vec4(height, height, height, 1.0));
      }
      
      void main() {
        vec2 uv = vec2(gl_GlobalInvocationID.xy) / resolution;
        generateSatinPattern(uv, time);
      }
    `;
  }

  /**
   * Get shader program configuration
   */
  static getShaderConfig(): any {
    return {
      vertexShader: this.getVertexShader(),
      fragmentShader: this.getFragmentShader(),
      computeShader: this.getComputeShader(),
      attributes: [
        'position',
        'normal',
        'uv',
        'color',
        'height',
        'sheen',
        'roughness',
        'metallic',
        'glowIntensity'
      ],
      uniforms: [
        'modelViewMatrix',
        'projectionMatrix',
        'normalMatrix',
        'lightDirection',
        'lightColor',
        'lightIntensity',
        'ambientColor',
        'ambientIntensity',
        'cameraPosition',
        'time'
      ],
      textures: [
        'stitchTexture',
        'normalTexture',
        'heightTexture'
      ]
    };
  }
}

export default SatinStitchShaders;


























