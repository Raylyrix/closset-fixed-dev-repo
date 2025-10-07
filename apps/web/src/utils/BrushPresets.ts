import { BrushSettings, BrushDynamics, BrushShape, BrushTexture } from './BrushEngine';

export interface BrushPreset {
  id: string;
  name: string;
  category: 'basic' | 'artistic' | 'digital' | 'natural' | 'specialty' | 'custom';
  description: string;
  settings: BrushSettings;
  tags: string[];
  author?: string;
  createdAt: number;
  modifiedAt: number;
  thumbnail?: string;
}

export class BrushPresetManager {
  private presets = new Map<string, BrushPreset>();
  private categories = new Map<string, string[]>();

  constructor() {
    this.initializeDefaultPresets();
  }

  private initializeDefaultPresets(): void {
    // Basic brushes
    this.addPreset({
      id: 'hard_round',
      name: 'Hard Round',
      category: 'basic',
      description: 'Classic hard-edged round brush',
      settings: {
        dynamics: {
          size: {
            base: 20,
            variation: 0,
            pressureCurve: [0, 1],
            velocityCurve: [1, 1],
            tiltCurve: [1, 1]
          },
          opacity: {
            base: 1,
            variation: 0,
            pressureCurve: [1, 1],
            velocityCurve: [1, 1],
            tiltCurve: [1, 1]
          },
          flow: {
            base: 1,
            variation: 0,
            pressureCurve: [1, 1],
            velocityCurve: [1, 1]
          },
          angle: {
            base: 0,
            variation: 0,
            followVelocity: false,
            followTilt: false,
            random: false
          },
          spacing: {
            base: 0.1,
            variation: 0,
            pressureCurve: [1, 1],
            velocityCurve: [1, 1]
          },
          scattering: {
            amount: 0,
            count: 1
          }
        },
        shape: {
          type: 'circle',
          hardness: 1,
          roundness: 1,
          angle: 0,
          scale: 1,
          aspectRatio: 1
        },
        texture: {
          pattern: 'solid',
          scale: 1,
          rotation: 0,
          opacity: 1,
          blendMode: 'source-over',
          noise: {
            type: 'perlin',
            frequency: 1,
            octaves: 1,
            persistence: 0.5,
            lacunarity: 2
          }
        },
        color: {
          primary: '#000000'
        },
        blendMode: 'source-over',
        stabilization: {
          enabled: false,
          delay: 5,
          quality: 0.5
        },
        wetMedia: {
          enabled: false,
          flow: 0.5,
          drying: 0.1,
          blending: 0.3,
          absorption: 0.2
        }
      },
      tags: ['basic', 'round', 'hard'],
      createdAt: Date.now(),
      modifiedAt: Date.now()
    });

    // Artistic brushes
    this.addPreset({
      id: 'watercolor_flat',
      name: 'Watercolor Flat',
      category: 'artistic',
      description: 'Soft watercolor brush with edge variation',
      settings: {
        dynamics: {
          size: {
            base: 30,
            variation: 0.3,
            pressureCurve: [0.2, 0.8],
            velocityCurve: [1.2, 0.8],
            tiltCurve: [1, 1]
          },
          opacity: {
            base: 0.6,
            variation: 0.4,
            pressureCurve: [0.1, 0.9],
            velocityCurve: [1.5, 0.7],
            tiltCurve: [1, 1]
          },
          flow: {
            base: 0.8,
            variation: 0.2,
            pressureCurve: [0.5, 1],
            velocityCurve: [1, 1]
          },
          angle: {
            base: 0,
            variation: 0.1,
            followVelocity: true,
            followTilt: false,
            random: true
          },
          spacing: {
            base: 0.05,
            variation: 0.1,
            pressureCurve: [1.2, 0.8],
            velocityCurve: [0.8, 1.2]
          },
          scattering: {
            amount: 2,
            count: 3
          }
        },
        shape: {
          type: 'circle',
          hardness: 0.3,
          roundness: 0.8,
          angle: 0,
          scale: 1,
          aspectRatio: 1
        },
        texture: {
          pattern: 'watercolor',
          scale: 1.2,
          rotation: 0,
          opacity: 0.7,
          blendMode: 'soft-light',
          noise: {
            type: 'perlin',
            frequency: 0.5,
            octaves: 3,
            persistence: 0.6,
            lacunarity: 2.1
          }
        },
        color: {
          primary: '#4A90E2'
        },
        blendMode: 'multiply',
        stabilization: {
          enabled: true,
          delay: 3,
          quality: 0.7
        },
        wetMedia: {
          enabled: true,
          flow: 0.8,
          drying: 0.05,
          blending: 0.6,
          absorption: 0.4
        }
      },
      tags: ['artistic', 'watercolor', 'soft', 'natural'],
      createdAt: Date.now(),
      modifiedAt: Date.now()
    });

    // Digital brushes
    this.addPreset({
      id: 'pixel_brush',
      name: 'Pixel Brush',
      category: 'digital',
      description: 'Precise pixel art brush',
      settings: {
        dynamics: {
          size: {
            base: 1,
            variation: 0,
            pressureCurve: [1, 1],
            velocityCurve: [1, 1],
            tiltCurve: [1, 1]
          },
          opacity: {
            base: 1,
            variation: 0,
            pressureCurve: [1, 1],
            velocityCurve: [1, 1],
            tiltCurve: [1, 1]
          },
          flow: {
            base: 1,
            variation: 0,
            pressureCurve: [1, 1],
            velocityCurve: [1, 1]
          },
          angle: {
            base: 0,
            variation: 0,
            followVelocity: false,
            followTilt: false,
            random: false
          },
          spacing: {
            base: 1,
            variation: 0,
            pressureCurve: [1, 1],
            velocityCurve: [1, 1]
          },
          scattering: {
            amount: 0,
            count: 1
          }
        },
        shape: {
          type: 'square',
          hardness: 1,
          roundness: 0,
          angle: 0,
          scale: 1,
          aspectRatio: 1
        },
        texture: {
          pattern: 'solid',
          scale: 1,
          rotation: 0,
          opacity: 1,
          blendMode: 'source-over',
          noise: {
            type: 'value',
            frequency: 1,
            octaves: 1,
            persistence: 0,
            lacunarity: 2
          }
        },
        color: {
          primary: '#000000'
        },
        blendMode: 'source-over',
        stabilization: {
          enabled: false,
          delay: 0,
          quality: 1
        },
        wetMedia: {
          enabled: false,
          flow: 0,
          drying: 0,
          blending: 0,
          absorption: 0
        }
      },
      tags: ['digital', 'pixel', 'precise'],
      createdAt: Date.now(),
      modifiedAt: Date.now()
    });

    // Natural brushes
    this.addPreset({
      id: 'charcoal_soft',
      name: 'Soft Charcoal',
      category: 'natural',
      description: 'Soft charcoal pencil with natural texture',
      settings: {
        dynamics: {
          size: {
            base: 25,
            variation: 0.2,
            pressureCurve: [0.3, 1],
            velocityCurve: [1.1, 0.9],
            tiltCurve: [1, 1]
          },
          opacity: {
            base: 0.7,
            variation: 0.3,
            pressureCurve: [0.2, 1],
            velocityCurve: [1.3, 0.8],
            tiltCurve: [1, 1]
          },
          flow: {
            base: 0.9,
            variation: 0.1,
            pressureCurve: [0.8, 1],
            velocityCurve: [1, 1]
          },
          angle: {
            base: 0,
            variation: 0.05,
            followVelocity: true,
            followTilt: true,
            random: false
          },
          spacing: {
            base: 0.02,
            variation: 0.05,
            pressureCurve: [1.5, 0.8],
            velocityCurve: [0.7, 1.1]
          },
          scattering: {
            amount: 1,
            count: 2
          }
        },
        shape: {
          type: 'circle',
          hardness: 0.1,
          roundness: 0.9,
          angle: 0,
          scale: 1,
          aspectRatio: 1
        },
        texture: {
          pattern: 'paper',
          scale: 0.8,
          rotation: 0,
          opacity: 0.8,
          blendMode: 'multiply',
          noise: {
            type: 'perlin',
            frequency: 0.3,
            octaves: 4,
            persistence: 0.7,
            lacunarity: 2.2
          }
        },
        color: {
          primary: '#2C2C2C'
        },
        blendMode: 'multiply',
        stabilization: {
          enabled: true,
          delay: 4,
          quality: 0.6
        },
        wetMedia: {
          enabled: false,
          flow: 0,
          drying: 0,
          blending: 0,
          absorption: 0
        }
      },
      tags: ['natural', 'charcoal', 'pencil', 'soft'],
      createdAt: Date.now(),
      modifiedAt: Date.now()
    });

    // Specialty brushes
    this.addPreset({
      id: 'bristle_oil',
      name: 'Bristle Oil',
      category: 'specialty',
      description: 'Oil painting brush with bristle texture',
      settings: {
        dynamics: {
          size: {
            base: 35,
            variation: 0.15,
            pressureCurve: [0.4, 1.1],
            velocityCurve: [1, 1],
            tiltCurve: [0.8, 1.2]
          },
          opacity: {
            base: 0.9,
            variation: 0.1,
            pressureCurve: [0.6, 1],
            velocityCurve: [1, 1],
            tiltCurve: [1, 1]
          },
          flow: {
            base: 1,
            variation: 0.05,
            pressureCurve: [0.9, 1],
            velocityCurve: [1, 1]
          },
          angle: {
            base: 0,
            variation: 0,
            followVelocity: false,
            followTilt: true,
            random: false
          },
          spacing: {
            base: 0.03,
            variation: 0.02,
            pressureCurve: [1.1, 0.9],
            velocityCurve: [0.9, 1.1]
          },
          scattering: {
            amount: 0,
            count: 1
          }
        },
        shape: {
          type: 'circle',
          hardness: 0.8,
          roundness: 0.95,
          angle: 0,
          scale: 1,
          aspectRatio: 1
        },
        texture: {
          pattern: 'bristles',
          scale: 1,
          rotation: 0,
          opacity: 1,
          blendMode: 'source-over',
          noise: {
            type: 'perlin',
            frequency: 1,
            octaves: 2,
            persistence: 0.5,
            lacunarity: 2
          },
          bristles: {
            count: 12,
            length: 8,
            thickness: 2,
            randomness: 0.3
          }
        },
        color: {
          primary: '#8B4513'
        },
        blendMode: 'source-over',
        stabilization: {
          enabled: false,
          delay: 2,
          quality: 0.8
        },
        wetMedia: {
          enabled: true,
          flow: 0.6,
          drying: 0.02,
          blending: 0.4,
          absorption: 0.1
        }
      },
      tags: ['specialty', 'oil', 'bristle', 'painting'],
      createdAt: Date.now(),
      modifiedAt: Date.now()
    });
  }

  public addPreset(preset: BrushPreset): void {
    this.presets.set(preset.id, { ...preset, modifiedAt: Date.now() });

    // Update category index
    if (!this.categories.has(preset.category)) {
      this.categories.set(preset.category, []);
    }
    const categoryPresets = this.categories.get(preset.category)!;
    if (!categoryPresets.includes(preset.id)) {
      categoryPresets.push(preset.id);
    }
  }

  public getPreset(id: string): BrushPreset | null {
    return this.presets.get(id) || null;
  }

  public getPresetsByCategory(category: string): BrushPreset[] {
    const presetIds = this.categories.get(category) || [];
    return presetIds.map(id => this.presets.get(id)!).filter(Boolean);
  }

  public getAllPresets(): BrushPreset[] {
    return Array.from(this.presets.values());
  }

  public searchPresets(query: string, tags?: string[]): BrushPreset[] {
    let results = Array.from(this.presets.values());

    // Filter by search query
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(preset =>
        preset.name.toLowerCase().includes(lowerQuery) ||
        preset.description.toLowerCase().includes(lowerQuery) ||
        preset.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      results = results.filter(preset =>
        tags.every(tag => preset.tags.includes(tag))
      );
    }

    return results;
  }

  public updatePreset(id: string, updates: Partial<BrushPreset>): BrushPreset | null {
    const preset = this.presets.get(id);
    if (!preset) return null;

    const updatedPreset = {
      ...preset,
      ...updates,
      modifiedAt: Date.now()
    };

    this.presets.set(id, updatedPreset);
    return updatedPreset;
  }

  public deletePreset(id: string): boolean {
    const preset = this.presets.get(id);
    if (!preset) return false;

    this.presets.delete(id);

    // Remove from category index
    const categoryPresets = this.categories.get(preset.category);
    if (categoryPresets) {
      const index = categoryPresets.indexOf(id);
      if (index > -1) {
        categoryPresets.splice(index, 1);
      }
    }

    return true;
  }

  public duplicatePreset(id: string, newName?: string): BrushPreset | null {
    const original = this.presets.get(id);
    if (!original) return null;

    const duplicate: BrushPreset = {
      ...original,
      id: `duplicate-${Date.now()}`,
      name: newName || `${original.name} Copy`,
      createdAt: Date.now(),
      modifiedAt: Date.now()
    };

    this.addPreset(duplicate);
    return duplicate;
  }

  public exportPreset(id: string): string | null {
    const preset = this.presets.get(id);
    if (!preset) return null;

    return JSON.stringify(preset, null, 2);
  }

  public importPreset(jsonString: string): BrushPreset | null {
    try {
      const preset = JSON.parse(jsonString) as BrushPreset;

      // Validate required fields
      if (!preset.id || !preset.name || !preset.settings) {
        throw new Error('Invalid preset format');
      }

      // Ensure unique ID
      if (this.presets.has(preset.id)) {
        preset.id = `${preset.id}-imported-${Date.now()}`;
      }

      preset.createdAt = Date.now();
      preset.modifiedAt = Date.now();

      this.addPreset(preset);
      return preset;
    } catch (error) {
      console.error('Failed to import preset:', error);
      return null;
    }
  }

  public exportAllPresets(): string {
    const presets = this.getAllPresets();
    return JSON.stringify({
      version: '1.0',
      exportedAt: Date.now(),
      presets
    }, null, 2);
  }

  public importPresets(jsonString: string): number {
    try {
      const data = JSON.parse(jsonString);
      const presets = data.presets || [];

      let importedCount = 0;
      presets.forEach((preset: BrushPreset) => {
        if (this.importPreset(JSON.stringify(preset))) {
          importedCount++;
        }
      });

      return importedCount;
    } catch (error) {
      console.error('Failed to import presets:', error);
      return 0;
    }
  }

  public getCategories(): string[] {
    return Array.from(this.categories.keys());
  }

  public getPresetCount(): number {
    return this.presets.size;
  }

  public clearAllPresets(): void {
    this.presets.clear();
    this.categories.clear();
    this.initializeDefaultPresets();
  }

  public saveToLocalStorage(): void {
    try {
      const presets = this.getAllPresets();
      localStorage.setItem('brushPresets', JSON.stringify(presets));
    } catch (error) {
      console.error('Failed to save presets to localStorage:', error);
    }
  }

  public loadFromLocalStorage(): number {
    try {
      const stored = localStorage.getItem('brushPresets');
      if (stored) {
        const presets = JSON.parse(stored);
        presets.forEach((preset: BrushPreset) => {
          this.addPreset(preset);
        });
        return presets.length;
      }
    } catch (error) {
      console.error('Failed to load presets from localStorage:', error);
    }
    return 0;
  }
}

// Global instance
export const brushPresetManager = new BrushPresetManager();
