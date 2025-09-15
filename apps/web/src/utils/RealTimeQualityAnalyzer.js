/**
 * Real-time Quality Analysis System
 * AI-powered analysis of stitch quality and suggestions
 */
export class RealTimeQualityAnalyzer {
    constructor() {
        this.isAnalyzing = false;
        this.analysisInterval = null;
        this.currentStitches = [];
        this.analysisResults = new Map();
        this.qualityCallbacks = [];
        this.issueCallbacks = [];
        this.suggestionCallbacks = [];
        this.startRealTimeAnalysis();
    }
    // Start real-time analysis
    startRealTimeAnalysis(intervalMs = 2000) {
        if (this.isAnalyzing)
            return;
        this.isAnalyzing = true;
        this.analysisInterval = setInterval(() => {
            this.performAnalysis();
        }, intervalMs);
        console.log('🔍 Real-time quality analysis started');
    }
    // Stop real-time analysis
    stopRealTimeAnalysis() {
        if (!this.isAnalyzing)
            return;
        this.isAnalyzing = false;
        if (this.analysisInterval) {
            clearInterval(this.analysisInterval);
            this.analysisInterval = null;
        }
        console.log('🔍 Real-time quality analysis stopped');
    }
    // Update stitches for analysis
    updateStitches(stitches) {
        this.currentStitches = [...stitches];
    }
    // Perform quality analysis
    async performAnalysis() {
        if (this.currentStitches.length === 0)
            return;
        try {
            for (const stitch of this.currentStitches) {
                const analysis = await this.analyzeStitch(stitch);
                this.analysisResults.set(stitch.id, analysis);
                // Notify callbacks
                this.qualityCallbacks.forEach(callback => {
                    try {
                        callback(analysis);
                    }
                    catch (error) {
                        console.error('Error in quality callback:', error);
                    }
                });
                // Notify about issues
                analysis.issues.forEach(issue => {
                    this.issueCallbacks.forEach(callback => {
                        try {
                            callback(issue);
                        }
                        catch (error) {
                            console.error('Error in issue callback:', error);
                        }
                    });
                });
                // Notify about suggestions
                analysis.suggestions.forEach(suggestion => {
                    this.suggestionCallbacks.forEach(callback => {
                        try {
                            callback(suggestion);
                        }
                        catch (error) {
                            console.error('Error in suggestion callback:', error);
                        }
                    });
                });
            }
        }
        catch (error) {
            console.error('Error in quality analysis:', error);
        }
    }
    // Analyze individual stitch
    async analyzeStitch(stitch) {
        const issues = [];
        const suggestions = [];
        // Analyze stitch quality
        const stitchQuality = this.analyzeStitchQuality(stitch, issues, suggestions);
        // Analyze color harmony
        const colorHarmony = this.analyzeColorHarmony(stitch, issues, suggestions);
        // Analyze pattern balance
        const patternBalance = this.analyzePatternBalance(stitch, issues, suggestions);
        // Analyze technical accuracy
        const technicalAccuracy = this.analyzeTechnicalAccuracy(stitch, issues, suggestions);
        // Analyze aesthetic appeal
        const aestheticAppeal = this.analyzeAestheticAppeal(stitch, issues, suggestions);
        const overall = (stitchQuality + colorHarmony + patternBalance + technicalAccuracy + aestheticAppeal) / 5;
        return {
            id: stitch.id,
            type: stitch.type,
            quality: overall,
            issues,
            suggestions,
            metrics: {
                tension: this.calculateTension(stitch),
                density: this.calculateDensity(stitch),
                angle: this.calculateAngle(stitch),
                spacing: this.calculateSpacing(stitch),
                consistency: this.calculateConsistency(stitch)
            }
        };
    }
    // Analyze stitch quality
    analyzeStitchQuality(stitch, issues, suggestions) {
        let quality = 1.0;
        // Check stitch density
        const density = this.calculateDensity(stitch);
        if (density < 0.3) {
            issues.push({
                id: `density_${stitch.id}`,
                type: 'stitch',
                severity: 'high',
                description: 'Stitch density is too low',
                suggestion: 'Increase stitch density for better coverage',
                confidence: 0.9
            });
            quality -= 0.3;
        }
        else if (density > 2.0) {
            issues.push({
                id: `density_${stitch.id}`,
                type: 'stitch',
                severity: 'medium',
                description: 'Stitch density is too high',
                suggestion: 'Reduce stitch density to prevent puckering',
                confidence: 0.8
            });
            quality -= 0.2;
        }
        // Check stitch consistency
        const consistency = this.calculateConsistency(stitch);
        if (consistency < 0.7) {
            issues.push({
                id: `consistency_${stitch.id}`,
                type: 'stitch',
                severity: 'medium',
                description: 'Stitch consistency is poor',
                suggestion: 'Maintain consistent stitch length and spacing',
                confidence: 0.8
            });
            quality -= 0.2;
        }
        // Add suggestions
        if (quality < 0.8) {
            suggestions.push({
                id: `improve_stitch_${stitch.id}`,
                type: 'improvement',
                priority: 'medium',
                title: 'Improve Stitch Quality',
                description: 'Adjust stitch parameters for better quality',
                impact: 0.7,
                effort: 'medium'
            });
        }
        return Math.max(0, Math.min(1, quality));
    }
    // Analyze color harmony
    analyzeColorHarmony(stitch, issues, suggestions) {
        let quality = 1.0;
        // Check color contrast
        const contrast = this.calculateColorContrast(stitch);
        if (contrast < 0.3) {
            issues.push({
                id: `contrast_${stitch.id}`,
                type: 'color',
                severity: 'medium',
                description: 'Low color contrast',
                suggestion: 'Use colors with better contrast for visibility',
                confidence: 0.8
            });
            quality -= 0.2;
        }
        // Check color saturation
        const saturation = this.calculateColorSaturation(stitch);
        if (saturation > 0.9) {
            issues.push({
                id: `saturation_${stitch.id}`,
                type: 'color',
                severity: 'low',
                description: 'Color saturation is very high',
                suggestion: 'Consider using more muted colors for better harmony',
                confidence: 0.6
            });
            quality -= 0.1;
        }
        return Math.max(0, Math.min(1, quality));
    }
    // Analyze pattern balance
    analyzePatternBalance(stitch, issues, suggestions) {
        let quality = 1.0;
        // Check stitch distribution
        const distribution = this.calculateStitchDistribution(stitch);
        if (distribution < 0.6) {
            issues.push({
                id: `distribution_${stitch.id}`,
                type: 'pattern',
                severity: 'medium',
                description: 'Uneven stitch distribution',
                suggestion: 'Distribute stitches more evenly across the pattern',
                confidence: 0.7
            });
            quality -= 0.3;
        }
        return Math.max(0, Math.min(1, quality));
    }
    // Analyze technical accuracy
    analyzeTechnicalAccuracy(stitch, issues, suggestions) {
        let quality = 1.0;
        // Check for overlapping stitches
        const overlaps = this.detectOverlappingStitches(stitch);
        if (overlaps > 0) {
            issues.push({
                id: `overlaps_${stitch.id}`,
                type: 'technical',
                severity: 'high',
                description: `${overlaps} overlapping stitches detected`,
                suggestion: 'Adjust stitch positioning to avoid overlaps',
                confidence: 0.9
            });
            quality -= 0.4;
        }
        // Check stitch angles
        const angleConsistency = this.calculateAngleConsistency(stitch);
        if (angleConsistency < 0.7) {
            issues.push({
                id: `angles_${stitch.id}`,
                type: 'technical',
                severity: 'medium',
                description: 'Inconsistent stitch angles',
                suggestion: 'Maintain consistent stitch angles for better appearance',
                confidence: 0.8
            });
            quality -= 0.2;
        }
        return Math.max(0, Math.min(1, quality));
    }
    // Analyze aesthetic appeal
    analyzeAestheticAppeal(stitch, issues, suggestions) {
        let quality = 1.0;
        // Check visual interest
        const visualInterest = this.calculateVisualInterest(stitch);
        if (visualInterest < 0.5) {
            issues.push({
                id: `interest_${stitch.id}`,
                type: 'aesthetic',
                severity: 'low',
                description: 'Low visual interest',
                suggestion: 'Add more variation or detail to increase visual appeal',
                confidence: 0.6
            });
            quality -= 0.2;
        }
        // Check symmetry
        const symmetry = this.calculateSymmetry(stitch);
        if (symmetry < 0.6) {
            issues.push({
                id: `symmetry_${stitch.id}`,
                type: 'aesthetic',
                severity: 'low',
                description: 'Pattern lacks symmetry',
                suggestion: 'Consider adding symmetrical elements for better balance',
                confidence: 0.5
            });
            quality -= 0.1;
        }
        return Math.max(0, Math.min(1, quality));
    }
    // Calculation methods
    calculateDensity(stitch) {
        // Simulate density calculation
        return Math.random() * 2;
    }
    calculateConsistency(stitch) {
        // Simulate consistency calculation
        return Math.random();
    }
    calculateColorContrast(stitch) {
        // Simulate color contrast calculation
        return Math.random();
    }
    calculateColorSaturation(stitch) {
        // Simulate color saturation calculation
        return Math.random();
    }
    calculateStitchDistribution(stitch) {
        // Simulate distribution calculation
        return Math.random();
    }
    detectOverlappingStitches(stitch) {
        // Simulate overlap detection
        return Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0;
    }
    calculateAngleConsistency(stitch) {
        // Simulate angle consistency calculation
        return Math.random();
    }
    calculateVisualInterest(stitch) {
        // Simulate visual interest calculation
        return Math.random();
    }
    calculateSymmetry(stitch) {
        // Simulate symmetry calculation
        return Math.random();
    }
    calculateTension(stitch) {
        // Simulate tension calculation
        return Math.random();
    }
    calculateAngle(stitch) {
        // Simulate angle calculation
        return Math.random() * 360;
    }
    calculateSpacing(stitch) {
        // Simulate spacing calculation
        return Math.random() * 5;
    }
    // Subscribe to quality updates
    onQualityUpdate(callback) {
        this.qualityCallbacks.push(callback);
        return () => {
            const index = this.qualityCallbacks.indexOf(callback);
            if (index > -1) {
                this.qualityCallbacks.splice(index, 1);
            }
        };
    }
    // Subscribe to issue updates
    onIssueDetected(callback) {
        this.issueCallbacks.push(callback);
        return () => {
            const index = this.issueCallbacks.indexOf(callback);
            if (index > -1) {
                this.issueCallbacks.splice(index, 1);
            }
        };
    }
    // Subscribe to suggestion updates
    onSuggestionGenerated(callback) {
        this.suggestionCallbacks.push(callback);
        return () => {
            const index = this.suggestionCallbacks.indexOf(callback);
            if (index > -1) {
                this.suggestionCallbacks.splice(index, 1);
            }
        };
    }
    // Get analysis results
    getAnalysisResults() {
        return new Map(this.analysisResults);
    }
    // Get quality summary
    getQualitySummary() {
        const analyses = Array.from(this.analysisResults.values());
        if (analyses.length === 0) {
            return {
                averageQuality: 0,
                totalIssues: 0,
                criticalIssues: 0,
                totalSuggestions: 0
            };
        }
        const averageQuality = analyses.reduce((sum, analysis) => sum + analysis.quality, 0) / analyses.length;
        const totalIssues = analyses.reduce((sum, analysis) => sum + analysis.issues.length, 0);
        const criticalIssues = analyses.reduce((sum, analysis) => sum + analysis.issues.filter(issue => issue.severity === 'critical').length, 0);
        const totalSuggestions = analyses.reduce((sum, analysis) => sum + analysis.suggestions.length, 0);
        return {
            averageQuality: Math.round(averageQuality * 100) / 100,
            totalIssues,
            criticalIssues,
            totalSuggestions
        };
    }
    // Cleanup
    destroy() {
        this.stopRealTimeAnalysis();
        this.qualityCallbacks = [];
        this.issueCallbacks = [];
        this.suggestionCallbacks = [];
        this.analysisResults.clear();
    }
}
// Singleton instance
export const realTimeQualityAnalyzer = new RealTimeQualityAnalyzer();
