class EmbroideryBackendService {
    constructor(config = {
        baseUrl: 'http://localhost:8000',
        timeout: 30000
    }) {
        this.config = config;
    }
    async makeRequest(endpoint, options = {}) {
        const url = `${this.config.baseUrl}${endpoint}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            // Check if response is binary (file download)
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/octet-stream')) {
                return response.arrayBuffer();
            }
            return await response.json();
        }
        catch (error) {
            clearTimeout(timeoutId);
            console.error('Embroidery backend request failed:', error);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('Request timeout - backend service may be unavailable');
            }
            throw error;
        }
    }
    /**
     * Check if the backend service is healthy
     */
    async checkHealth() {
        try {
            const response = await this.makeRequest('/health');
            return response.ok;
        }
        catch (error) {
            console.error('Backend health check failed:', error);
            return false;
        }
    }
    /**
     * Check InkStitch/letink availability
     */
    async checkInkStitchHealth() {
        try {
            return await this.makeRequest('/embroidery/inkstitch/health');
        }
        catch (err) {
            console.warn('InkStitch health unavailable, returning stub status');
            return {
                inkscape: { found: false },
                pyembroidery: false,
                message: 'Backend not running (stubbed)'
            };
        }
    }
    /**
     * Generate embroidery plan from freehand points
     */
    async generateFromPoints(request) {
        return this.makeRequest('/embroidery/generate_from_points', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }
    /**
     * Export embroidery file from stitch points
     */
    async exportFromPoints(points, format = 'dst') {
        const data = await this.makeRequest('/embroidery/export_from_points', {
            method: 'POST',
            body: JSON.stringify({
                points,
                format,
            }),
        });
        return {
            data,
            filename: `embroidery.${format}`,
            mimeType: 'application/octet-stream',
        };
    }
    /**
     * Generate embroidery plan from SVG
     */
    async generateFromSVG(svgFile, options = {}) {
        const formData = new FormData();
        formData.append('svg_file', svgFile);
        const params = new URLSearchParams();
        if (options.mm_per_px !== undefined)
            params.append('mm_per_px', options.mm_per_px.toString());
        if (options.stitch_len_mm !== undefined)
            params.append('stitch_len_mm', options.stitch_len_mm.toString());
        if (options.strategy)
            params.append('strategy', options.strategy);
        if (options.density !== undefined)
            params.append('density', options.density.toString());
        if (options.return_dst !== undefined)
            params.append('return_dst', options.return_dst.toString());
        const endpoint = `/embroidery/generate?${params.toString()}`;
        if (options.return_dst) {
            const data = await this.makeRequest(endpoint, {
                method: 'POST',
                body: formData,
                headers: {
                // Don't set Content-Type for FormData, let browser set it
                },
            });
            return data;
        }
        else {
            return this.makeRequest(endpoint, {
                method: 'POST',
                body: formData,
                headers: {
                // Don't set Content-Type for FormData, let browser set it
                },
            });
        }
    }
    /**
     * Parse machine embroidery file to stitch plan
     */
    async parseMachineFile(file, format = 'dst') {
        const formData = new FormData();
        formData.append('machine_file', file);
        return this.makeRequest(`/embroidery/plan?format=${format}`, {
            method: 'POST',
            body: formData,
            headers: {
            // Don't set Content-Type for FormData, let browser set it
            },
        });
    }
    /**
     * Convert frontend stitches to backend format
     */
    convertStitchesToBackendFormat(stitches) {
        const points = [];
        for (const stitch of stitches) {
            // Add color change at the beginning of each stitch
            if (stitch.points.length > 0) {
                points.push({
                    x: stitch.points[0].x,
                    y: stitch.points[0].y,
                    type: 'color_change',
                    color: stitch.color,
                });
            }
            // Add stitch points
            for (const point of stitch.points) {
                points.push({
                    x: point.x,
                    y: point.y,
                    type: 'stitch',
                });
            }
        }
        return points;
    }
    /**
     * Convert backend stitch plan to frontend format
     */
    convertBackendToFrontendFormat(plan) {
        const stitches = [];
        let currentStitch = null;
        let currentColor = '#000000';
        for (const point of plan.points) {
            if (point.type === 'color_change' && point.color) {
                // Start new stitch group
                if (currentStitch) {
                    stitches.push(currentStitch);
                }
                currentColor = point.color;
                currentStitch = {
                    id: `stitch_${stitches.length + 1}`,
                    type: 'satin', // Default type, could be enhanced to detect from pattern
                    points: [],
                    color: currentColor,
                    threadType: 'cotton',
                    thickness: 3.0,
                    opacity: 1.0,
                };
            }
            else if (point.type === 'stitch' && currentStitch) {
                currentStitch.points.push({
                    x: point.x,
                    y: point.y,
                });
            }
        }
        // Add the last stitch
        if (currentStitch && currentStitch.points.length > 0) {
            stitches.push(currentStitch);
        }
        return stitches;
    }
    /**
     * Download file to user's device
     */
    downloadFile(exportData) {
        const blob = new Blob([exportData.data], { type: exportData.mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = exportData.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}
// Export singleton instance
export const embroideryBackend = new EmbroideryBackendService();
// Types are already exported above via interfaces; no need to re-export here
