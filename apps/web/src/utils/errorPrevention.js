// Error Prevention System
// Proactive measures to prevent common mistakes
import { errorLogger } from './errorLogger';
import { useApp } from '../App';
export class ErrorPrevention {
    constructor() {
        this.preventionRules = new Map();
        this.initializePreventionRules();
    }
    static getInstance() {
        if (!ErrorPrevention.instance) {
            ErrorPrevention.instance = new ErrorPrevention();
        }
        return ErrorPrevention.instance;
    }
    initializePreventionRules() {
        // Rule: Always check vector mode before rendering anchor points
        this.preventionRules.set('anchor_points_vector_mode', () => {
            const appState = useApp.getState();
            if (!appState.vectorMode) {
                errorLogger.logError('anchor_points_vector_mode_violation', 'Attempted to render anchor points outside vector mode', ['vector-tools', 'anchor-points'], 'high');
                return false;
            }
            return true;
        });
        // Rule: Always save/restore canvas context
        this.preventionRules.set('canvas_context_save_restore', () => {
            // This will be checked by the calling code
            return true;
        });
        // Rule: Always validate tool information before rendering
        this.preventionRules.set('tool_validation', () => {
            return true; // Will be implemented by calling code
        });
        // Rule: Always check for null/undefined before accessing properties
        this.preventionRules.set('null_undefined_check', () => {
            return true; // Will be implemented by calling code
        });
    }
    checkAnchorPointsRendering() {
        return this.preventionRules.get('anchor_points_vector_mode')?.() || false;
    }
    validateCanvasContext(ctx) {
        if (!ctx) {
            errorLogger.logError('canvas_context_null', 'Canvas context is null when trying to render', ['canvas', 'rendering'], 'critical');
            return false;
        }
        return true;
    }
    validateVectorShape(shape) {
        if (!shape) {
            errorLogger.logError('vector_shape_null', 'Vector shape is null or undefined', ['vector-tools', 'shape-rendering'], 'high');
            return false;
        }
        if (!shape.path) {
            errorLogger.logError('vector_shape_no_path', 'Vector shape has no path property', ['vector-tools', 'shape-rendering'], 'high');
            return false;
        }
        if (!shape.path.points || !Array.isArray(shape.path.points)) {
            errorLogger.logError('vector_shape_invalid_points', 'Vector shape has invalid points array', ['vector-tools', 'shape-rendering'], 'high');
            return false;
        }
        return true;
    }
    validateStitchConfig(config) {
        if (!config) {
            errorLogger.logError('stitch_config_null', 'Stitch configuration is null or undefined', ['stitch-rendering', 'configuration'], 'high');
            return false;
        }
        if (!config.type) {
            errorLogger.logError('stitch_config_no_type', 'Stitch configuration has no type property', ['stitch-rendering', 'configuration'], 'high');
            return false;
        }
        if (!config.color) {
            errorLogger.logError('stitch_config_no_color', 'Stitch configuration has no color property', ['stitch-rendering', 'configuration'], 'medium');
            return false;
        }
        return true;
    }
    validateLayer(layer) {
        if (!layer) {
            errorLogger.logError('layer_null', 'Layer is null or undefined', ['layer-management', 'rendering'], 'critical');
            return false;
        }
        if (!layer.canvas) {
            errorLogger.logError('layer_no_canvas', 'Layer has no canvas property', ['layer-management', 'rendering'], 'critical');
            return false;
        }
        return true;
    }
    validateToolTransition(fromTool, toTool) {
        // Log tool transitions for debugging
        console.log(`🔧 Tool transition: ${fromTool} -> ${toTool}`);
        // Check for problematic transitions
        if (fromTool === 'vector' && toTool !== 'vector') {
            // Ensure vector mode is properly cleaned up
            const appState = useApp.getState();
            if (appState.vectorMode) {
                errorLogger.logError('vector_mode_not_cleaned', 'Vector mode not properly cleaned up during tool transition', ['vector-tools', 'tool-transition'], 'high');
                return false;
            }
        }
        return true;
    }
    checkPerformanceImpact(operation, startTime) {
        const duration = performance.now() - startTime;
        if (duration > 100) {
            errorLogger.logError('performance_impact_high', `Operation '${operation}' took ${duration.toFixed(2)}ms`, ['performance', 'optimization'], 'medium');
        }
    }
    validateStateConsistency() {
        const appState = useApp.getState();
        // Check for state inconsistencies
        if (appState.vectorMode && !appState.activeTool) {
            errorLogger.logError('state_inconsistency', 'Vector mode is active but no active tool is set', ['state-management', 'vector-tools'], 'high');
            return false;
        }
        return true;
    }
    preventMemoryLeaks() {
        // Check for potential memory leaks
        const errorLogs = errorLogger.getRecurringErrors();
        if (errorLogs.length > 10) {
            errorLogger.logError('potential_memory_leak', 'High number of recurring errors detected', ['memory-management', 'error-handling'], 'critical');
        }
    }
    generatePreventionReport() {
        const recurringErrors = errorLogger.getRecurringErrors();
        const criticalErrors = errorLogger.getCriticalErrors();
        let report = '# Error Prevention Report\n\n';
        report += `Generated: ${new Date().toISOString()}\n\n`;
        if (criticalErrors.length > 0) {
            report += '## 🚨 Critical Issues Requiring Immediate Attention\n\n';
            criticalErrors.forEach(error => {
                report += `### ${error.errorType}\n`;
                report += `- **Frequency**: ${error.frequency} times\n`;
                report += `- **Affected Components**: ${error.affectedComponents.join(', ')}\n`;
                report += `- **Prevention Steps**: ${error.preventionSteps.join('; ')}\n\n`;
            });
        }
        if (recurringErrors.length > 0) {
            report += '## 🔄 Recurring Issues\n\n';
            recurringErrors.forEach(error => {
                report += `### ${error.errorType}\n`;
                report += `- **Frequency**: ${error.frequency} times\n`;
                report += `- **Status**: ${error.status}\n`;
                report += `- **Prevention Steps**: ${error.preventionSteps.join('; ')}\n\n`;
            });
        }
        report += '## 📋 Prevention Checklist\n\n';
        report += '- [ ] All anchor points are cleared when exiting vector mode\n';
        report += '- [ ] Canvas context is properly saved/restored\n';
        report += '- [ ] Vector shapes are validated before rendering\n';
        report += '- [ ] Stitch configurations are validated\n';
        report += '- [ ] Layers are validated before access\n';
        report += '- [ ] Tool transitions are properly handled\n';
        report += '- [ ] Performance impact is monitored\n';
        report += '- [ ] State consistency is maintained\n';
        report += '- [ ] Memory leaks are prevented\n\n';
        return report;
    }
}
export const errorPrevention = ErrorPrevention.getInstance();
// useApp is now imported from '../App'
