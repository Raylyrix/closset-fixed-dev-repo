// Minimal stubbed AI service to satisfy imports after removing AI feature
// Provides type definitions and no-op implementations.

export interface AISuggestion {
  id: string;
  type: 'color' | 'pattern' | 'style' | 'composition';
  title: string;
  description: string;
  confidence: number;
  reasoning?: string;
  implementation?: any;
}

export interface AITrendAnalysis {
  id: string;
  trend: string;
  description: string;
  popularity: number;
  examples?: string[];
}

export interface ColorHarmony {
  id: string;
  type: string;
  description: string;
  colors: string[];
}

export const aiService = {
  async getTrendAnalysis(): Promise<AITrendAnalysis[]> {
    return [];
  },
  async getDesignSuggestions(_design: any): Promise<AISuggestion[]> {
    return [];
  },
  async getColorHarmony(_baseColor: string): Promise<ColorHarmony[]> {
    return [];
  },
  async optimizeDesignForPrint(_design: any): Promise<string[]> {
    return [];
  }
};
