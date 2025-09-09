import { chatOpenRouter, type ChatMessage } from './openrouterService';

export interface EmbroideryStitch {
  id: string;
  type: 'satin' | 'fill' | 'outline' | 'cross-stitch' | 'chain' | 'backstitch' | 
        'french-knot' | 'bullion' | 'lazy-daisy' | 'feather' | 'couching' | 'appliqué' |
        'seed' | 'stem' | 'split' | 'brick' | 'long-short' | 'fishbone' | 'herringbone' |
        'satin-ribbon' | 'metallic' | 'glow-thread' | 'variegated' | 'gradient';
  points: { x: number; y: number }[];
  color: string;
  threadType: 'cotton' | 'polyester' | 'silk' | 'metallic' | 'glow' | 'variegated' | 'specialty';
  thickness: number;
  opacity: number;
  lastMoveTime?: number; // For throttling
  pattern?: string;
}

export interface EmbroideryPattern {
  id: string;
  name: string;
  stitches: EmbroideryStitch[];
  thumbnail: string;
  category: string;
}

export interface EmbroideryAI {
  analyzePattern(stitches: EmbroideryStitch[], canvasSize: { width: number; height: number }): Promise<any>;
  generateStitchPattern(description: string, canvasSize: { width: number; height: number }): Promise<EmbroideryStitch[]>;
  optimizeStitchPlacement(stitches: EmbroideryStitch[], canvasSize: { width: number; height: number }): Promise<EmbroideryStitch[]>;
  suggestThreadColors(baseColor: string): Promise<string[]>;
  generateEmbroideryDescription(stitches: EmbroideryStitch[]): Promise<string>;
}

class EmbroideryAIService implements EmbroideryAI {
  async analyzePattern(stitches: EmbroideryStitch[], canvasSize: { width: number; height: number }): Promise<any> {
    // Validate input parameters
    if (!stitches || !Array.isArray(stitches)) {
      console.warn('🧠 EmbroideryAI: Invalid stitches parameter, using fallback analysis');
      return this.getFallbackAnalysis();
    }
    
    if (stitches.length === 0) {
      console.warn('🧠 EmbroideryAI: No stitches to analyze, using fallback analysis');
      return this.getFallbackAnalysis();
    }
    
    console.log('🧠 EmbroideryAI: Analyzing pattern with', stitches.length, 'stitches');
    
    const prompt = `As an embroidery AI expert, analyze this embroidery pattern and provide detailed analysis:

Pattern Data:
- Stitch Count: ${stitches.length}
- Canvas Size: ${canvasSize.width}x${canvasSize.height}
- Stitch Types: ${[...new Set(stitches.map(s => s.type))].join(', ')}
- Thread Types: ${[...new Set(stitches.map(s => s.threadType))].join(', ')}
- Colors: ${[...new Set(stitches.map(s => s.color))].join(', ')}

Provide analysis in this JSON format:
{
  "density": {
    "value": 0.0-1.0,
    "level": "low|medium|high",
    "affects": {
      "fabricStretch": boolean,
      "shadowDepth": boolean,
      "threadOverlap": boolean
    }
  },
  "complexity": {
    "stitchVariety": number,
    "colorComplexity": number,
    "geometricComplexity": number,
    "overall": number
  },
  "threadTypes": {
    "cotton": { "count": number, "totalThickness": number, "colors": [] },
    "polyester": { "count": number, "totalThickness": number, "colors": [] },
    "silk": { "count": number, "totalThickness": number, "colors": [] },
    "metallic": { "count": number, "totalThickness": number, "colors": [] },
    "glow": { "count": number, "totalThickness": number, "colors": [] }
  },
  "stitchPatterns": {
    "satin": number,
    "fill": number,
    "outline": number,
    "decorative": number,
    "dominantPattern": "string"
  },
  "fabricInteraction": {
    "fabricStretch": number,
    "threadTension": number,
    "fabricDistortion": number,
    "realistic": {
      "puckering": boolean,
      "shadowing": boolean,
      "textureVariation": boolean
    }
  },
  "lightingRequirements": {
    "needsSpecular": boolean,
    "needsEmission": boolean,
    "needsNormalMapping": boolean,
    "needsDisplacement": boolean,
    "lightingIntensity": number
  },
  "materialProperties": {
    "roughness": number,
    "metalness": number,
    "emissive": string,
    "emissiveIntensity": number,
    "normalScale": number,
    "displacementScale": number,
    "side": "DoubleSide"
  }
}

Return only valid JSON without any additional text.`;

    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: 'You are an expert embroidery AI that analyzes patterns and provides detailed technical analysis for 3D rendering.' },
        { role: 'user', content: prompt }
      ];

      const response = await chatOpenRouter({
        messages,
        model: 'openrouter/sonoma-sky-alpha',
        temperature: 0.3,
        max_tokens: 2048
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from OpenRouter API');
      }

      const analysis = JSON.parse(content);
      console.log('🧠 EmbroideryAI: Pattern analysis complete');
      return analysis;
    } catch (error) {
      console.error('🧠 EmbroideryAI: Error analyzing pattern', error);
      return this.getFallbackAnalysis();
    }
  }

  async generateStitchPattern(description: string, canvasSize: { width: number; height: number }): Promise<EmbroideryStitch[]> {
    console.log('🧠 EmbroideryAI: Generating stitch pattern for:', description);
    
    const prompt = `As an embroidery pattern generator, create a detailed embroidery pattern based on this description: "${description}"

Canvas Size: ${canvasSize.width}x${canvasSize.height}

Generate a pattern with 5-15 stitches that represents the description. Use appropriate stitch types:
- satin: for smooth, flowing lines
- fill: for solid areas
- outline: for borders and details
- cross-stitch: for decorative elements
- chain: for textured lines
- backstitch: for fine details

Return in this JSON format:
{
  "stitches": [
    {
      "id": "stitch_1",
      "type": "satin",
      "points": [{"x": 0.1, "y": 0.1}, {"x": 0.3, "y": 0.2}],
      "color": "#FF0000",
      "threadType": "cotton",
      "thickness": 3.0,
      "opacity": 1.0
    }
  ]
}

Use UV coordinates (0-1 range) for points. Choose appropriate colors and thread types.
Return only valid JSON without any additional text.`;

    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: 'You are an expert embroidery pattern generator that creates realistic, well-structured embroidery patterns.' },
        { role: 'user', content: prompt }
      ];

      const response = await chatOpenRouter({
        messages,
        model: 'openrouter/sonoma-sky-alpha',
        temperature: 0.7,
        max_tokens: 2048
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from OpenRouter API');
      }

      const result = JSON.parse(content);
      console.log('🧠 EmbroideryAI: Generated pattern with', result.stitches?.length || 0, 'stitches');
      return result.stitches || [];
    } catch (error) {
      console.error('🧠 EmbroideryAI: Error generating stitch pattern', error);
      return this.getFallbackPattern();
    }
  }

  async optimizeStitchPlacement(stitches: EmbroideryStitch[], canvasSize: { width: number; height: number }): Promise<EmbroideryStitch[]> {
    // Validate input parameters
    if (!stitches || !Array.isArray(stitches) || stitches.length === 0) {
      console.warn('🧠 EmbroideryAI: Invalid stitches parameter for optimization, returning original stitches');
      return stitches || [];
    }
    
    console.log('🧠 EmbroideryAI: Optimizing stitch placement');
    
    const prompt = `As an embroidery optimization expert, optimize these stitches for better visual results:

Current Stitches: ${stitches.length}
Canvas Size: ${canvasSize.width}x${canvasSize.height}

Optimize for:
1. Better thread tension and realistic appearance
2. Improved stitch density and coverage
3. Smoother curves and transitions
4. Better color harmony
5. More efficient stitch paths

Return the optimized stitches in the same JSON format as input.
Return only valid JSON without any additional text.`;

    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: 'You are an expert embroidery optimizer that improves stitch placement, tension, and visual quality.' },
        { role: 'user', content: prompt }
      ];

      const response = await chatOpenRouter({
        messages,
        model: 'openrouter/sonoma-sky-alpha',
        temperature: 0.4,
        max_tokens: 2048
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from OpenRouter API');
      }

      const result = JSON.parse(content);
      console.log('🧠 EmbroideryAI: Optimized stitches');
      return result.stitches || stitches;
    } catch (error) {
      console.error('🧠 EmbroideryAI: Error optimizing stitches', error);
      return stitches;
    }
  }

  async suggestThreadColors(baseColor: string): Promise<string[]> {
    console.log('🧠 EmbroideryAI: Suggesting thread colors for', baseColor);
    
    const prompt = `As a color theory expert for embroidery, suggest 8 complementary thread colors that would work well with this base color: ${baseColor}

Consider:
1. Color harmony (complementary, analogous, triadic)
2. Thread availability and realism
3. Visual contrast and readability
4. Embroidery-specific color considerations

Return as a JSON array of hex colors:
["#FF0000", "#00FF00", "#0000FF", ...]

Return only valid JSON without any additional text.`;

    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: 'You are a color theory expert specializing in embroidery thread color selection and harmony.' },
        { role: 'user', content: prompt }
      ];

      const response = await chatOpenRouter({
        messages,
        model: 'openrouter/sonoma-sky-alpha',
        temperature: 0.6,
        max_tokens: 512
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from OpenRouter API');
      }

      const colors = JSON.parse(content);
      console.log('🧠 EmbroideryAI: Suggested', colors.length, 'thread colors');
      return colors;
    } catch (error) {
      console.error('🧠 EmbroideryAI: Error suggesting thread colors', error);
      return this.getFallbackColors(baseColor);
    }
  }

  async generateEmbroideryDescription(stitches: EmbroideryStitch[]): Promise<string> {
    // Validate input parameters
    if (!stitches || !Array.isArray(stitches) || stitches.length === 0) {
      console.warn('🧠 EmbroideryAI: Invalid stitches parameter for description, using fallback');
      return 'This embroidery pattern contains no stitches to describe.';
    }
    
    console.log('🧠 EmbroideryAI: Generating description for', stitches.length, 'stitches');
    
    const prompt = `As an embroidery expert, provide a detailed description of this embroidery pattern:

Stitch Count: ${stitches.length}
Stitch Types: ${[...new Set(stitches.map(s => s.type))].join(', ')}
Thread Types: ${[...new Set(stitches.map(s => s.threadType))].join(', ')}
Colors: ${[...new Set(stitches.map(s => s.color))].join(', ')}

Provide a 2-3 paragraph description covering:
1. Overall pattern style and appearance
2. Technical characteristics and complexity
3. Best use cases and applications
4. Thread and material recommendations

Keep it professional and informative.`;

    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: 'You are an expert embroidery designer who provides detailed, professional descriptions of embroidery patterns.' },
        { role: 'user', content: prompt }
      ];

      const response = await chatOpenRouter({
        messages,
        model: 'openrouter/sonoma-sky-alpha',
        temperature: 0.7,
        max_tokens: 512
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from OpenRouter API');
      }

      console.log('🧠 EmbroideryAI: Generated description');
      return content;
    } catch (error) {
      console.error('🧠 EmbroideryAI: Error generating description', error);
      return `This embroidery pattern features ${stitches.length} stitches using ${[...new Set(stitches.map(s => s.type))].join(', ')} techniques. The design incorporates multiple thread types and colors for a rich, textured appearance.`;
    }
  }

  // Fallback methods
  private getFallbackAnalysis() {
    return {
      density: { value: 0.3, level: 'medium', affects: { fabricStretch: false, shadowDepth: true, threadOverlap: false } },
      complexity: { stitchVariety: 3, colorComplexity: 2, geometricComplexity: 2, overall: 2.3 },
      threadTypes: { cotton: { count: 5, totalThickness: 15, colors: ['#FF0000', '#00FF00'] } },
      stitchPatterns: { satin: 3, fill: 2, outline: 1, decorative: 0, dominantPattern: 'satin' },
      fabricInteraction: { fabricStretch: 0.1, threadTension: 0.5, fabricDistortion: 0.05, realistic: { puckering: false, shadowing: true, textureVariation: true } },
      lightingRequirements: { needsSpecular: false, needsEmission: false, needsNormalMapping: true, needsDisplacement: false, lightingIntensity: 1.0 },
      materialProperties: { roughness: 0.8, metalness: 0.1, emissive: '#000000', emissiveIntensity: 0, normalScale: 0.5, displacementScale: 0.1, side: 'DoubleSide' }
    };
  }

  private getFallbackPattern(): EmbroideryStitch[] {
    return [
      {
        id: 'fallback_1',
        type: 'satin',
        points: [{ x: 0.3, y: 0.3 }, { x: 0.7, y: 0.3 }, { x: 0.7, y: 0.7 }, { x: 0.3, y: 0.7 }],
        color: '#FF69B4',
        threadType: 'cotton',
        thickness: 3.0,
        opacity: 1.0
      }
    ];
  }

  private getFallbackColors(baseColor: string): string[] {
    return [baseColor, '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF'];
  }
}

// Export singleton instance
export const embroideryAI = new EmbroideryAIService();

