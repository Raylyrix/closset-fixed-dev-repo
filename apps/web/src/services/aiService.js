import { chatOpenRouter } from './openrouterService';
class AIService {
    async makeRequest(prompt, context) {
        console.log('🤖 AIService: Making request to OpenRouter API', { prompt: prompt.substring(0, 100) + '...' });
        try {
            const messages = [
                { role: 'system', content: 'You are a professional design AI assistant specializing in textile design, embroidery, and 3D modeling. Provide helpful, accurate, and creative suggestions.' },
                { role: 'user', content: prompt }
            ];
            const response = await chatOpenRouter({
                messages,
                model: 'openrouter/sonoma-sky-alpha',
                temperature: 0.7,
                max_tokens: 2048
            });
            console.log('🤖 AIService: Received response from OpenRouter API');
            return response;
        }
        catch (error) {
            console.error('🤖 AIService: Error making request to OpenRouter API', error);
            throw error;
        }
    }
    async getDesignSuggestions(currentDesign) {
        console.log('🤖 AIService: Getting design suggestions');
        const prompt = `As a professional design AI assistant, analyze this design and provide 5 specific suggestions for improvement:

Current Design Context:
- Tool: ${currentDesign.tool || 'Unknown'}
- Colors: ${currentDesign.colors?.join(', ') || 'Not specified'}
- Style: ${currentDesign.style || 'Not specified'}
- Elements: ${currentDesign.elements?.join(', ') || 'Not specified'}

Please provide 5 specific, actionable suggestions in this JSON format:
{
  "suggestions": [
    {
      "id": "suggestion_1",
      "type": "color|pattern|style|composition|texture",
      "title": "Brief title",
      "description": "Detailed description of the suggestion",
      "confidence": 0.85,
      "reasoning": "Why this suggestion would improve the design",
      "implementation": "Specific steps to implement this suggestion"
    }
  ]
}

Focus on:
1. Color harmony and palette improvements
2. Composition and layout enhancements
3. Pattern and texture suggestions
4. Style consistency improvements
5. Modern design trends

Return only valid JSON without any additional text.`;
        try {
            const response = await this.makeRequest(prompt);
            const content = response.choices?.[0]?.message?.content;
            if (!content) {
                throw new Error('No content received from OpenRouter API');
            }
            const parsed = JSON.parse(content);
            console.log('🤖 AIService: Successfully parsed design suggestions', { count: parsed.suggestions?.length });
            return parsed.suggestions || [];
        }
        catch (error) {
            console.error('🤖 AIService: Error getting design suggestions', error);
            // Return fallback suggestions
            return this.getFallbackSuggestions();
        }
    }
    async getTrendAnalysis() {
        console.log('🤖 AIService: Getting trend analysis');
        const prompt = `As a design trend analyst, provide current design trends for 2024 in these categories:

1. Color Trends
2. Pattern Trends  
3. Typography Trends
4. Layout Trends
5. Texture Trends

For each category, provide:
- Current popular trends
- Emerging trends
- Forecast for next 6 months
- Specific examples and applications

Return in this JSON format:
{
  "trends": [
    {
      "id": "trend_1",
      "category": "Color Trends",
      "trend": "Trend name",
      "popularity": 0.85,
      "description": "Detailed description",
      "examples": ["example1", "example2"],
      "forecast": "Forecast for next 6 months"
    }
  ]
}

Return only valid JSON without any additional text.`;
        try {
            const response = await this.makeRequest(prompt);
            const content = response.choices?.[0]?.message?.content;
            if (!content) {
                throw new Error('No content received from OpenRouter API');
            }
            const parsed = JSON.parse(content);
            console.log('🤖 AIService: Successfully parsed trend analysis', { count: parsed.trends?.length });
            return parsed.trends || [];
        }
        catch (error) {
            console.error('🤖 AIService: Error getting trend analysis', error);
            return this.getFallbackTrends();
        }
    }
    async getColorHarmony(baseColor) {
        console.log('🤖 AIService: Getting color harmony for', baseColor);
        const prompt = `As a color theory expert, generate 5 different color harmony schemes based on this base color: ${baseColor}

Provide these harmony types:
1. Complementary
2. Analogous  
3. Triadic
4. Tetradic
5. Monochromatic

For each scheme, provide:
- 5-6 harmonious colors (including the base color)
- Brief description of the harmony
- Best use cases

Return in this JSON format:
{
  "colorHarmony": [
    {
      "id": "harmony_1",
      "type": "complementary",
      "colors": ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"],
      "description": "Description of this color harmony",
      "usage": "Best use cases for this harmony"
    }
  ]
}

Return only valid JSON without any additional text.`;
        try {
            const response = await this.makeRequest(prompt);
            const content = response.choices?.[0]?.message?.content;
            if (!content) {
                throw new Error('No content received from OpenRouter API');
            }
            const parsed = JSON.parse(content);
            console.log('🤖 AIService: Successfully parsed color harmony', { count: parsed.colorHarmony?.length });
            return parsed.colorHarmony || [];
        }
        catch (error) {
            console.error('🤖 AIService: Error getting color harmony', error);
            return this.getFallbackColorHarmony(baseColor);
        }
    }
    async generatePatternDescription(patternType, settings) {
        console.log('🤖 AIService: Generating pattern description for', patternType);
        const prompt = `As a pattern design expert, describe this ${patternType} pattern and suggest improvements:

Pattern Settings:
${JSON.stringify(settings, null, 2)}

Provide:
1. A detailed description of the pattern
2. 3 suggestions for improvement
3. Best use cases for this pattern
4. Color recommendations
5. Scale and repetition advice

Keep the response concise but informative (2-3 paragraphs).`;
        try {
            const response = await this.makeRequest(prompt);
            const content = response.choices?.[0]?.message?.content;
            if (!content) {
                throw new Error('No content received from OpenRouter API');
            }
            console.log('🤖 AIService: Successfully generated pattern description');
            return content;
        }
        catch (error) {
            console.error('🤖 AIService: Error generating pattern description', error);
            return `This ${patternType} pattern shows interesting characteristics. Consider adjusting the scale and color palette for better visual impact.`;
        }
    }
    async optimizeDesignForPrint(designData) {
        console.log('🤖 AIService: Optimizing design for print');
        const prompt = `As a print production expert, analyze this design and provide optimization recommendations:

Design Data:
${JSON.stringify(designData, null, 2)}

Provide 5 specific recommendations for print optimization:
1. Color space and profile recommendations
2. Resolution and DPI suggestions
3. Bleed and margin requirements
4. File format and compression settings
5. Paper and finishing recommendations

Return as a simple array of recommendation strings.`;
        try {
            const response = await this.makeRequest(prompt);
            const content = response.choices?.[0]?.message?.content;
            if (!content) {
                throw new Error('No content received from OpenRouter API');
            }
            // Parse the response into an array of recommendations
            const recommendations = content.split('\n').filter(line => line.trim().length > 0);
            console.log('🤖 AIService: Successfully generated print optimization recommendations', { count: recommendations.length });
            return recommendations;
        }
        catch (error) {
            console.error('🤖 AIService: Error optimizing design for print', error);
            return [
                'Use CMYK color space for print',
                'Ensure 300 DPI resolution',
                'Add 0.125" bleed on all sides',
                'Save as high-quality PDF',
                'Consider paper weight and finish'
            ];
        }
    }
    // Fallback methods for when API is unavailable
    getFallbackSuggestions() {
        return [
            {
                id: 'fallback_1',
                type: 'color',
                title: 'Improve Color Contrast',
                description: 'Consider increasing the contrast between foreground and background elements for better readability.',
                confidence: 0.8,
                reasoning: 'Higher contrast improves accessibility and visual impact.',
                implementation: 'Adjust color values to increase contrast ratio to at least 4.5:1.'
            },
            {
                id: 'fallback_2',
                type: 'composition',
                title: 'Apply Rule of Thirds',
                description: 'Position key elements along the rule of thirds grid lines for more balanced composition.',
                confidence: 0.75,
                reasoning: 'Rule of thirds creates more visually appealing and balanced layouts.',
                implementation: 'Divide the canvas into 9 equal parts and align important elements with the grid lines.'
            }
        ];
    }
    getFallbackTrends() {
        return [
            {
                id: 'trend_1',
                category: 'Color Trends',
                trend: 'Neutral Earth Tones',
                popularity: 0.85,
                description: 'Warm, muted earth tones are dominating design in 2024.',
                examples: ['Sage green', 'Terracotta', 'Warm beige'],
                forecast: 'Expected to continue growing through Q3 2024'
            },
            {
                id: 'trend_2',
                category: 'Pattern Trends',
                trend: 'Organic Geometrics',
                popularity: 0.78,
                description: 'Combining geometric shapes with organic, flowing lines.',
                examples: ['Rounded squares', 'Flowing triangles', 'Organic grids'],
                forecast: 'Peak popularity expected in Q2 2024'
            }
        ];
    }
    getFallbackColorHarmony(baseColor) {
        return [
            {
                id: 'harmony_1',
                type: 'complementary',
                colors: [baseColor, '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
                description: 'Complementary colors create strong visual contrast and energy.',
                usage: 'Best for attention-grabbing designs and call-to-action elements.'
            },
            {
                id: 'harmony_2',
                type: 'analogous',
                colors: [baseColor, '#FF8A80', '#FFB74D', '#FFF176', '#C8E6C9'],
                description: 'Analogous colors create harmonious, soothing combinations.',
                usage: 'Perfect for backgrounds and subtle design elements.'
            }
        ];
    }
}
// Export singleton instance
export const aiService = new AIService();
