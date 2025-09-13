/**
 * Shared Utility Functions
 * Common utilities used across the application
 */
import { centralizedErrorHandler, ErrorCategory, ErrorSeverity } from './CentralizedErrorHandler';
import { performanceMonitor } from './PerformanceMonitor';
/**
 * Safe wrapper for async operations with error handling
 */
export async function safeAsync(operation, context, fallback) {
    try {
        const startTime = performance.now();
        const result = await operation();
        const duration = performance.now() - startTime;
        performanceMonitor.trackMetric('async_operation', duration, 'ms', 'performance', context);
        return result;
    }
    catch (error) {
        centralizedErrorHandler.handleError(error, { component: context }, ErrorSeverity.MEDIUM, ErrorCategory.UNKNOWN);
        return fallback;
    }
}
/**
 * Safe wrapper for synchronous operations with error handling
 */
export function safeSync(operation, context, fallback) {
    try {
        const startTime = performance.now();
        const result = operation();
        const duration = performance.now() - startTime;
        performanceMonitor.trackMetric('sync_operation', duration, 'ms', 'performance', context);
        return result;
    }
    catch (error) {
        centralizedErrorHandler.handleError(error, { component: context }, ErrorSeverity.MEDIUM, ErrorCategory.UNKNOWN);
        return fallback;
    }
}
/**
 * Debounce function for performance optimization
 */
export function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
/**
 * Throttle function for performance optimization
 */
export function throttle(func, limit) {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
/**
 * Deep clone utility
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object')
        return obj;
    if (obj instanceof Date)
        return new Date(obj.getTime());
    if (obj instanceof Array)
        return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
    return obj;
}
/**
 * Check if two objects are deeply equal
 */
export function deepEqual(obj1, obj2) {
    if (obj1 === obj2)
        return true;
    if (obj1 == null || obj2 == null)
        return false;
    if (typeof obj1 !== typeof obj2)
        return false;
    if (typeof obj1 === 'object') {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length)
            return false;
        for (const key of keys1) {
            if (!keys2.includes(key))
                return false;
            if (!deepEqual(obj1[key], obj2[key]))
                return false;
        }
        return true;
    }
    return false;
}
/**
 * Generate unique ID
 */
export function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
/**
 * Format milliseconds to human readable string
 */
export function formatDuration(ms) {
    if (ms < 1000)
        return `${Math.round(ms)}ms`;
    if (ms < 60000)
        return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000)
        return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
}
/**
 * Clamp value between min and max
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
/**
 * Linear interpolation
 */
export function lerp(start, end, factor) {
    return start + (end - start) * factor;
}
/**
 * Check if value is within range
 */
export function isInRange(value, min, max) {
    return value >= min && value <= max;
}
/**
 * Round to specified decimal places
 */
export function roundTo(value, decimals) {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
/**
 * Sleep utility for async operations
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Retry utility for failed operations
 */
export async function retry(operation, maxAttempts = 3, delay = 1000) {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error;
            if (attempt < maxAttempts) {
                await sleep(delay * attempt);
            }
        }
    }
    throw lastError;
}
/**
 * Validate email format
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * Validate URL format
 */
export function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Sanitize string for safe display
 */
export function sanitizeString(str) {
    return str
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .trim();
}
/**
 * Generate random color
 */
export function generateRandomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}
/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
/**
 * Convert RGB to hex color
 */
export function rgbToHex(r, g, b) {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
/**
 * Calculate distance between two points
 */
export function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}
/**
 * Calculate angle between two points
 */
export function calculateAngle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}
/**
 * Check if point is inside rectangle
 */
export function isPointInRect(pointX, pointY, rectX, rectY, rectWidth, rectHeight) {
    return pointX >= rectX &&
        pointX <= rectX + rectWidth &&
        pointY >= rectY &&
        pointY <= rectY + rectHeight;
}
/**
 * Check if point is inside circle
 */
export function isPointInCircle(pointX, pointY, circleX, circleY, radius) {
    return calculateDistance(pointX, pointY, circleX, circleY) <= radius;
}
/**
 * Performance-optimized array operations
 */
export const ArrayUtils = {
    /**
     * Remove duplicates from array
     */
    unique(array) {
        return [...new Set(array)];
    },
    /**
     * Group array by key function
     */
    groupBy(array, keyFn) {
        const groups = new Map();
        for (const item of array) {
            const key = keyFn(item);
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key).push(item);
        }
        return groups;
    },
    /**
     * Chunk array into smaller arrays
     */
    chunk(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    },
    /**
     * Shuffle array randomly
     */
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
};
/**
 * Object utilities
 */
export const ObjectUtils = {
    /**
     * Pick specific keys from object
     */
    pick(obj, keys) {
        const result = {};
        for (const key of keys) {
            if (key in obj) {
                result[key] = obj[key];
            }
        }
        return result;
    },
    /**
     * Omit specific keys from object
     */
    omit(obj, keys) {
        const result = { ...obj };
        for (const key of keys) {
            delete result[key];
        }
        return result;
    },
    /**
     * Check if object is empty
     */
    isEmpty(obj) {
        return Object.keys(obj).length === 0;
    }
};
export default {
    safeAsync,
    safeSync,
    debounce,
    throttle,
    deepClone,
    deepEqual,
    generateId,
    formatBytes,
    formatDuration,
    clamp,
    lerp,
    isInRange,
    roundTo,
    sleep,
    retry,
    isValidEmail,
    isValidUrl,
    sanitizeString,
    generateRandomColor,
    hexToRgb,
    rgbToHex,
    calculateDistance,
    calculateAngle,
    isPointInRect,
    isPointInCircle,
    ArrayUtils,
    ObjectUtils
};
