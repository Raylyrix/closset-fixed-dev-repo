/**
 * ADAPTIVE PERFORMANCE MANAGER
 * 
 * Manages performance settings based on environment detection and user preferences
 * Automatically adjusts quality settings to maintain smooth performance
 */

import { environmentDetector, PerformancePreset, SystemInfo } from './EnvironmentDetector';

interface AdaptiveSettings {
  // Current active preset
  activePreset: string;
  
  // User overrides
  userOverrides: Partial<PerformancePreset>;
  
  // Dynamic adjustments
  dynamicAdjustments: {
    fpsTarget: number;
    canvasResolution: number;
    textureQuality: 'low' | 'medium' | 'high' | 'ultra';
    enableAdvancedFeatures: boolean;
  };
  
  // Performance monitoring
  performanceMetrics: {
    currentFPS: number;
    averageFPS: number;
    frameDrops: number;
    lastUpdateTime: number;
  };
  
  // Auto-adjustment settings
  autoAdjustment: {
    enabled: boolean;
    sensitivity: number; // 0-1, how aggressively to adjust
    minFPSThreshold: number;
    maxFPSThreshold: number;
  };
}

class AdaptivePerformanceManager {
  private settings: AdaptiveSettings;
  private performanceHistory: number[] = [];
  private lastAdjustmentTime = 0;
  private adjustmentCooldown = 5000; // 5 seconds between adjustments

  constructor() {
    this.settings = {
      activePreset: 'balanced',
      userOverrides: {},
      dynamicAdjustments: {
        fpsTarget: 60,
        canvasResolution: 1024,
        textureQuality: 'medium',
        enableAdvancedFeatures: true
      },
      performanceMetrics: {
        currentFPS: 60,
        averageFPS: 60,
        frameDrops: 0,
        lastUpdateTime: Date.now()
      },
      autoAdjustment: {
        enabled: true,
        sensitivity: 0.7,
        minFPSThreshold: 30,
        maxFPSThreshold: 55
      }
    };

    this.initializeFromEnvironment();
    console.log('🚀 AdaptivePerformanceManager initialized');
  }

  private async initializeFromEnvironment(): Promise<void> {
    try {
      // Wait for environment detection to complete
      const systemInfo = await environmentDetector.waitForDetection();
      
      // Set initial preset based on detected environment
      const recommendedPreset = environmentDetector.getRecommendedPreset();
      if (recommendedPreset) {
        this.settings.activePreset = environmentDetector.getSystemInfo()?.recommendedQuality || 'balanced';
        this.applyPreset(this.settings.activePreset);
      }

      console.log('🎯 AdaptivePerformanceManager: Initialized with', {
        deviceTier: systemInfo.deviceTier,
        recommendedPreset: this.settings.activePreset,
        performanceScore: environmentDetector.getPerformanceScore()
      });

    } catch (error) {
      console.error('❌ AdaptivePerformanceManager: Failed to initialize from environment', error);
      // Fallback to balanced preset
      this.applyPreset('balanced');
    }
  }

  public updatePerformanceMetrics(fps: number): void {
    const now = Date.now();
    this.settings.performanceMetrics.currentFPS = fps;
    this.settings.performanceMetrics.lastUpdateTime = now;

    // Update performance history
    this.performanceHistory.push(fps);
    if (this.performanceHistory.length > 60) { // Keep last 60 frames
      this.performanceHistory.shift();
    }

    // Calculate average FPS
    const sum = this.performanceHistory.reduce((a, b) => a + b, 0);
    this.settings.performanceMetrics.averageFPS = sum / this.performanceHistory.length;

    // Count frame drops (FPS below threshold)
    if (fps < this.settings.autoAdjustment.minFPSThreshold) {
      this.settings.performanceMetrics.frameDrops++;
    }

    // Auto-adjust if enabled and cooldown has passed
    if (this.settings.autoAdjustment.enabled && 
        now - this.lastAdjustmentTime > this.adjustmentCooldown) {
      this.performAutoAdjustment();
    }
  }

  private performAutoAdjustment(): void {
    const { averageFPS, frameDrops } = this.settings.performanceMetrics;
    const { minFPSThreshold, maxFPSThreshold, sensitivity } = this.settings.autoAdjustment;

    // If performance is consistently poor, downgrade quality
    if (averageFPS < minFPSThreshold || frameDrops > 10) {
      this.downgradeQuality(sensitivity);
      this.lastAdjustmentTime = Date.now();
      console.log('📉 AdaptivePerformanceManager: Downgrading quality due to poor performance', {
        averageFPS,
        frameDrops,
        newPreset: this.settings.activePreset
      });
    }
    // If performance is consistently good, consider upgrading quality
    else if (averageFPS > maxFPSThreshold && frameDrops < 2) {
      this.upgradeQuality(sensitivity);
      this.lastAdjustmentTime = Date.now();
      console.log('📈 AdaptivePerformanceManager: Upgrading quality due to good performance', {
        averageFPS,
        frameDrops,
        newPreset: this.settings.activePreset
      });
    }
  }

  private downgradeQuality(sensitivity: number): void {
    const presets = ['ultra', 'quality', 'balanced', 'performance'];
    const currentIndex = presets.indexOf(this.settings.activePreset);
    
    if (currentIndex < presets.length - 1) {
      const newIndex = Math.min(
        presets.length - 1,
        currentIndex + Math.ceil(sensitivity * 2) // More aggressive downgrade
      );
      this.applyPreset(presets[newIndex]);
    }
  }

  private upgradeQuality(sensitivity: number): void {
    const presets = ['ultra', 'quality', 'balanced', 'performance'];
    const currentIndex = presets.indexOf(this.settings.activePreset);
    
    if (currentIndex > 0) {
      const newIndex = Math.max(
        0,
        currentIndex - Math.ceil(sensitivity) // Conservative upgrade
      );
      this.applyPreset(presets[newIndex]);
    }
  }

  public applyPreset(presetName: string): void {
    const preset = environmentDetector.getPreset(presetName);
    if (!preset) {
      console.warn('⚠️ AdaptivePerformanceManager: Unknown preset', presetName);
      return;
    }

    this.settings.activePreset = presetName;
    
    // Apply preset settings
    this.settings.dynamicAdjustments = {
      fpsTarget: preset.maxFPS,
      canvasResolution: preset.canvasResolution,
      textureQuality: preset.textureQuality,
      enableAdvancedFeatures: preset.enableAdvancedFeatures
    };

    // Apply user overrides
    this.applyUserOverrides();

    console.log('🎯 AdaptivePerformanceManager: Applied preset', {
      preset: presetName,
      settings: this.settings.dynamicAdjustments
    });

    // Notify other systems of the change
    this.notifySettingsChange();
  }

  private applyUserOverrides(): void {
    const overrides = this.settings.userOverrides;
    
    if (overrides.canvasResolution) {
      this.settings.dynamicAdjustments.canvasResolution = overrides.canvasResolution;
    }
    if (overrides.textureQuality) {
      this.settings.dynamicAdjustments.textureQuality = overrides.textureQuality;
    }
    if (overrides.enableAdvancedFeatures !== undefined) {
      this.settings.dynamicAdjustments.enableAdvancedFeatures = overrides.enableAdvancedFeatures;
    }
    if (overrides.maxFPS) {
      this.settings.dynamicAdjustments.fpsTarget = overrides.maxFPS;
    }
  }

  private notifySettingsChange(): void {
    // Dispatch custom event for other systems to listen to
    const event = new CustomEvent('performanceSettingsChanged', {
      detail: {
        settings: this.getCurrentSettings(),
        preset: this.getCurrentPreset()
      }
    });
    window.dispatchEvent(event);
  }

  // Public API methods
  public getCurrentPreset(): PerformancePreset | null {
    return environmentDetector.getPreset(this.settings.activePreset);
  }

  public getCurrentSettings(): AdaptiveSettings {
    return { ...this.settings };
  }

  public getEffectiveSettings(): PerformancePreset {
    const preset = this.getCurrentPreset();
    if (!preset) {
      throw new Error('No active preset found');
    }

    // Merge preset with user overrides and dynamic adjustments
    return {
      ...preset,
      ...this.settings.userOverrides,
      canvasResolution: this.settings.dynamicAdjustments.canvasResolution,
      textureQuality: this.settings.dynamicAdjustments.textureQuality,
      enableAdvancedFeatures: this.settings.dynamicAdjustments.enableAdvancedFeatures,
      maxFPS: this.settings.dynamicAdjustments.fpsTarget
    };
  }

  public setUserOverride(override: Partial<PerformancePreset>): void {
    this.settings.userOverrides = { ...this.settings.userOverrides, ...override };
    this.applyUserOverrides();
    this.notifySettingsChange();
    
    console.log('🎯 AdaptivePerformanceManager: User override applied', override);
  }

  public clearUserOverrides(): void {
    this.settings.userOverrides = {};
    this.applyPreset(this.settings.activePreset);
    console.log('🎯 AdaptivePerformanceManager: User overrides cleared');
  }

  public setAutoAdjustment(enabled: boolean, sensitivity?: number): void {
    this.settings.autoAdjustment.enabled = enabled;
    if (sensitivity !== undefined) {
      this.settings.autoAdjustment.sensitivity = Math.max(0, Math.min(1, sensitivity));
    }
    
    console.log('🎯 AdaptivePerformanceManager: Auto-adjustment', {
      enabled,
      sensitivity: this.settings.autoAdjustment.sensitivity
    });
  }

  public getPerformanceMetrics() {
    return { ...this.settings.performanceMetrics };
  }

  public getPerformanceHistory(): number[] {
    return [...this.performanceHistory];
  }

  public resetPerformanceMetrics(): void {
    this.settings.performanceMetrics = {
      currentFPS: 60,
      averageFPS: 60,
      frameDrops: 0,
      lastUpdateTime: Date.now()
    };
    this.performanceHistory = [];
    console.log('🎯 AdaptivePerformanceManager: Performance metrics reset');
  }

  public getAvailablePresets(): PerformancePreset[] {
    return environmentDetector.getAllPresets();
  }

  public getSystemInfo(): SystemInfo | null {
    return environmentDetector.getSystemInfo();
  }

  public getPerformanceScore(): number {
    return environmentDetector.getPerformanceScore();
  }

  // Utility methods for other systems
  public shouldEnableFeature(feature: keyof PerformancePreset): boolean {
    const settings = this.getEffectiveSettings();
    return Boolean(settings[feature]);
  }

  public getOptimalCanvasSize(): { width: number; height: number } {
    const resolution = this.settings.dynamicAdjustments.canvasResolution;
    return { width: resolution, height: resolution };
  }

  public getMaxElements(type: 'layers' | 'text' | 'shapes'): number {
    const settings = this.getEffectiveSettings();
    switch (type) {
      case 'layers': return settings.maxLayers;
      case 'text': return settings.maxTextElements;
      case 'shapes': return settings.maxShapeElements;
      default: return 50;
    }
  }

  public isPerformanceMode(): boolean {
    return this.settings.activePreset === 'performance';
  }

  public isQualityMode(): boolean {
    return this.settings.activePreset === 'quality' || this.settings.activePreset === 'ultra';
  }
}

// Export singleton instance
export const adaptivePerformanceManager = new AdaptivePerformanceManager();

// Export types
export type { AdaptiveSettings };
export default adaptivePerformanceManager;


