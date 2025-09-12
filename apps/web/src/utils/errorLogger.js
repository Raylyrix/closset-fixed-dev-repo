// Comprehensive Error Logging System
// Tracks recurring mistakes and prevents them from happening again
class ErrorLogger {
    constructor() {
        this.errorLogs = new Map();
        this.errorPatterns = new Map();
        this.maxLogs = 1000;
        this.criticalThreshold = 3; // Mark as critical after 3 occurrences
        this.initializeErrorPatterns();
        this.loadFromStorage();
    }
    static getInstance() {
        if (!ErrorLogger.instance) {
            ErrorLogger.instance = new ErrorLogger();
        }
        return ErrorLogger.instance;
    }
    initializeErrorPatterns() {
        const patterns = [
            {
                pattern: 'anchor_points_not_cleared',
                description: 'Anchor points remain visible after exiting vector tools',
                commonCauses: [
                    'Missing cleanup in useEffect for vectorMode',
                    'renderAnchorPointsAndSelection called outside vector mode',
                    'State not properly reset when exiting vector mode',
                    'Canvas not properly cleared of UI elements'
                ],
                preventionTips: [
                    'Always check vectorMode before rendering anchor points',
                    'Clear all vector-related state when exiting vector mode',
                    'Use conditional rendering for UI elements',
                    'Test vector mode transitions thoroughly'
                ],
                relatedErrors: ['vector_state_cleanup', 'canvas_ui_overlay']
            },
            {
                pattern: 'stitches_disappearing',
                description: 'Stitches disappear when exiting vector tools',
                commonCauses: [
                    'Canvas cleared without re-rendering content',
                    'Vector shapes not properly preserved',
                    'Layer composition not called after state change',
                    'Tool information not stored with shapes'
                ],
                preventionTips: [
                    'Always re-render content after state changes',
                    'Store tool information with vector shapes',
                    'Use proper cleanup and re-rendering sequence',
                    'Test all tool transitions'
                ],
                relatedErrors: ['vector_path_persistence', 'layer_rendering']
            },
            {
                pattern: 'vector_tools_not_working',
                description: 'Vector tools not functioning properly',
                commonCauses: [
                    'Event handlers not properly connected',
                    'State management issues',
                    'Tool detection logic errors',
                    'Missing tool-specific rendering'
                ],
                preventionTips: [
                    'Implement proper event handling',
                    'Use consistent state management',
                    'Add comprehensive tool detection',
                    'Test all tool combinations'
                ],
                relatedErrors: ['event_handling', 'state_management']
            },
            {
                pattern: 'performance_degradation',
                description: 'Performance issues and browser crashes',
                commonCauses: [
                    'Excessive re-rendering',
                    'Memory leaks in event listeners',
                    'Heavy computations in render loops',
                    'Large data structures not cleaned up'
                ],
                preventionTips: [
                    'Implement debouncing for frequent operations',
                    'Clean up event listeners properly',
                    'Use performance monitoring',
                    'Optimize render loops'
                ],
                relatedErrors: ['memory_management', 'render_optimization']
            },
            {
                pattern: 'color_mismatch',
                description: 'Colors not rendering as selected',
                commonCauses: [
                    'Context state not properly saved/restored',
                    'Color values not passed correctly',
                    'Global composite operation conflicts',
                    'Alpha values not handled properly'
                ],
                preventionTips: [
                    'Always save/restore canvas context',
                    'Validate color values before use',
                    'Check global composite operations',
                    'Test color rendering across all tools'
                ],
                relatedErrors: ['canvas_context', 'color_handling']
            }
        ];
        patterns.forEach(pattern => {
            this.errorPatterns.set(pattern.pattern, pattern);
        });
    }
    logError(errorType, description, affectedComponents = [], severity = 'medium') {
        const errorId = this.generateErrorId(errorType, description);
        const now = new Date();
        if (this.errorLogs.has(errorId)) {
            // Update existing error
            const existingError = this.errorLogs.get(errorId);
            existingError.frequency += 1;
            existingError.lastOccurrence = now;
            // Escalate severity if frequency is high
            if (existingError.frequency >= this.criticalThreshold && existingError.severity !== 'critical') {
                existingError.severity = 'critical';
                console.warn(`🚨 CRITICAL ERROR: ${errorType} has occurred ${existingError.frequency} times!`);
            }
            this.errorLogs.set(errorId, existingError);
        }
        else {
            // Create new error log
            const newError = {
                id: errorId,
                errorType,
                description,
                frequency: 1,
                firstOccurrence: now,
                lastOccurrence: now,
                fixes: [],
                status: 'active',
                severity,
                affectedComponents,
                preventionSteps: this.getPreventionSteps(errorType)
            };
            this.errorLogs.set(errorId, newError);
        }
        // Save to storage
        this.saveToStorage();
        // Log to console with appropriate level
        this.logToConsole(errorType, description, severity);
        // Check for patterns and suggest fixes
        this.checkForPatterns(errorType, description);
    }
    addFix(errorId, fixDescription) {
        if (this.errorLogs.has(errorId)) {
            const error = this.errorLogs.get(errorId);
            error.fixes.push(fixDescription);
            error.status = 'resolved';
            this.errorLogs.set(errorId, error);
            this.saveToStorage();
        }
    }
    markAsResolved(errorId) {
        if (this.errorLogs.has(errorId)) {
            const error = this.errorLogs.get(errorId);
            error.status = 'resolved';
            this.errorLogs.set(errorId, error);
            this.saveToStorage();
        }
    }
    getRecurringErrors() {
        return Array.from(this.errorLogs.values())
            .filter(error => error.frequency > 1)
            .sort((a, b) => b.frequency - a.frequency);
    }
    getCriticalErrors() {
        return Array.from(this.errorLogs.values())
            .filter(error => error.severity === 'critical')
            .sort((a, b) => b.frequency - a.frequency);
    }
    getErrorsByComponent(component) {
        return Array.from(this.errorLogs.values())
            .filter(error => error.affectedComponents.includes(component))
            .sort((a, b) => b.frequency - a.frequency);
    }
    getErrorPattern(patternId) {
        return this.errorPatterns.get(patternId);
    }
    getAllErrorPatterns() {
        return Array.from(this.errorPatterns.values());
    }
    generateReport() {
        const recurringErrors = this.getRecurringErrors();
        const criticalErrors = this.getCriticalErrors();
        let report = '# Error Log Report\n\n';
        report += `Generated: ${new Date().toISOString()}\n\n`;
        if (criticalErrors.length > 0) {
            report += '## 🚨 Critical Errors\n\n';
            criticalErrors.forEach(error => {
                report += `### ${error.errorType}\n`;
                report += `- **Frequency**: ${error.frequency} times\n`;
                report += `- **Last Occurrence**: ${error.lastOccurrence.toISOString()}\n`;
                report += `- **Affected Components**: ${error.affectedComponents.join(', ')}\n`;
                report += `- **Description**: ${error.description}\n`;
                if (error.fixes.length > 0) {
                    report += `- **Fixes Applied**: ${error.fixes.join('; ')}\n`;
                }
                report += '\n';
            });
        }
        if (recurringErrors.length > 0) {
            report += '## 🔄 Recurring Errors\n\n';
            recurringErrors.forEach(error => {
                report += `### ${error.errorType}\n`;
                report += `- **Frequency**: ${error.frequency} times\n`;
                report += `- **Status**: ${error.status}\n`;
                report += `- **Affected Components**: ${error.affectedComponents.join(', ')}\n`;
                report += `- **Description**: ${error.description}\n`;
                if (error.fixes.length > 0) {
                    report += `- **Fixes Applied**: ${error.fixes.join('; ')}\n`;
                }
                report += '\n';
            });
        }
        report += '## 📊 Summary\n\n';
        report += `- Total Errors Logged: ${this.errorLogs.size}\n`;
        report += `- Critical Errors: ${criticalErrors.length}\n`;
        report += `- Recurring Errors: ${recurringErrors.length}\n`;
        report += `- Resolved Errors: ${Array.from(this.errorLogs.values()).filter(e => e.status === 'resolved').length}\n`;
        return report;
    }
    exportLogs() {
        return JSON.stringify({
            errorLogs: Array.from(this.errorLogs.entries()),
            errorPatterns: Array.from(this.errorPatterns.entries()),
            exportDate: new Date().toISOString()
        }, null, 2);
    }
    importLogs(data) {
        try {
            const parsed = JSON.parse(data);
            if (parsed.errorLogs) {
                this.errorLogs = new Map(parsed.errorLogs);
            }
            if (parsed.errorPatterns) {
                this.errorPatterns = new Map(parsed.errorPatterns);
            }
            this.saveToStorage();
        }
        catch (error) {
            console.error('Failed to import error logs:', error);
        }
    }
    clearLogs() {
        this.errorLogs.clear();
        this.saveToStorage();
    }
    generateErrorId(errorType, description) {
        return `${errorType}_${description.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
    }
    getPreventionSteps(errorType) {
        const pattern = this.errorPatterns.get(errorType);
        return pattern ? pattern.preventionTips : [];
    }
    checkForPatterns(errorType, description) {
        for (const [patternId, pattern] of this.errorPatterns) {
            if (pattern.pattern === errorType || description.toLowerCase().includes(pattern.pattern)) {
                console.warn(`🔍 Error Pattern Detected: ${pattern.description}`);
                console.warn(`💡 Prevention Tips: ${pattern.preventionTips.join('; ')}`);
                break;
            }
        }
    }
    logToConsole(errorType, description, severity) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${severity.toUpperCase()}: ${errorType} - ${description}`;
        switch (severity) {
            case 'critical':
                console.error(`🚨 ${logMessage}`);
                break;
            case 'high':
                console.warn(`⚠️ ${logMessage}`);
                break;
            case 'medium':
                console.warn(`⚠️ ${logMessage}`);
                break;
            case 'low':
                console.log(`ℹ️ ${logMessage}`);
                break;
        }
    }
    saveToStorage() {
        try {
            const data = this.exportLogs();
            localStorage.setItem('errorLogger', data);
        }
        catch (error) {
            console.error('Failed to save error logs to storage:', error);
        }
    }
    loadFromStorage() {
        try {
            const data = localStorage.getItem('errorLogger');
            if (data) {
                this.importLogs(data);
            }
        }
        catch (error) {
            console.error('Failed to load error logs from storage:', error);
        }
    }
}
export const errorLogger = ErrorLogger.getInstance();
// Helper functions for common error logging
export const logVectorError = (description, affectedComponents = ['vector-tools']) => {
    errorLogger.logError('vector_tools_error', description, affectedComponents, 'high');
};
export const logRenderingError = (description, affectedComponents = ['rendering']) => {
    errorLogger.logError('rendering_error', description, affectedComponents, 'medium');
};
export const logStateError = (description, affectedComponents = ['state-management']) => {
    errorLogger.logError('state_management_error', description, affectedComponents, 'high');
};
export const logPerformanceError = (description, affectedComponents = ['performance']) => {
    errorLogger.logError('performance_error', description, affectedComponents, 'critical');
};
