/**
 * API Gateway - Service orchestration and routing
 * Handles service discovery, load balancing, and request routing
 */
export class APIGateway {
    constructor(config = {}) {
        this.services = new Map();
        this.serviceIndex = new Map();
        this.cache = new Map();
        this.metrics = {
            requestsTotal: 0,
            requestsSuccess: 0,
            requestsFailed: 0,
            averageResponseTime: 0,
            servicesHealthy: 0,
            servicesUnhealthy: 0
        };
        this.config = {
            serviceTimeout: config.serviceTimeout || 5000,
            maxRetries: config.maxRetries || 3,
            healthCheckInterval: config.healthCheckInterval || 30000,
            loadBalancingStrategy: config.loadBalancingStrategy || 'round-robin',
            enableCaching: config.enableCaching || true,
            cacheTTL: config.cacheTTL || 300000, // 5 minutes
            enableMetrics: config.enableMetrics || true,
            ...config
        };
        this.initializeServices();
        this.startHealthChecks();
    }
    // Initialize built-in services
    initializeServices() {
        // Pattern Service
        this.registerService('pattern', {
            id: 'pattern-local',
            name: 'Pattern Service',
            url: '/api/patterns',
            health: 'healthy',
            lastCheck: Date.now(),
            responseTime: 0,
            load: 0,
            version: '1.0.0',
            capabilities: ['create', 'read', 'update', 'delete', 'search', 'export', 'import']
        });
        // Rendering Service
        this.registerService('rendering', {
            id: 'rendering-local',
            name: 'Rendering Service',
            url: '/api/rendering',
            health: 'healthy',
            lastCheck: Date.now(),
            responseTime: 0,
            load: 0,
            version: '1.0.0',
            capabilities: ['render', 'export', 'preview']
        });
        // AI Service
        this.registerService('ai', {
            id: 'ai-local',
            name: 'AI Service',
            url: '/api/ai',
            health: 'healthy',
            lastCheck: Date.now(),
            responseTime: 0,
            load: 0,
            version: '1.0.0',
            capabilities: ['generate', 'analyze', 'optimize', 'style-transfer']
        });
        // Quality Service
        this.registerService('quality', {
            id: 'quality-local',
            name: 'Quality Service',
            url: '/api/quality',
            health: 'healthy',
            lastCheck: Date.now(),
            responseTime: 0,
            load: 0,
            version: '1.0.0',
            capabilities: ['analyze', 'suggest', 'monitor']
        });
    }
    // Register service endpoint
    registerService(serviceName, endpoint) {
        if (!this.services.has(serviceName)) {
            this.services.set(serviceName, []);
            this.serviceIndex.set(serviceName, 0);
        }
        this.services.get(serviceName).push(endpoint);
        console.log(`📡 Service registered: ${serviceName} (${endpoint.id})`);
    }
    // Unregister service endpoint
    unregisterService(serviceName, endpointId) {
        const endpoints = this.services.get(serviceName);
        if (!endpoints)
            return false;
        const index = endpoints.findIndex(ep => ep.id === endpointId);
        if (index === -1)
            return false;
        endpoints.splice(index, 1);
        console.log(`📡 Service unregistered: ${serviceName} (${endpointId})`);
        return true;
    }
    // Make service request
    async request(request) {
        const startTime = performance.now();
        this.metrics.requestsTotal++;
        try {
            // Check cache first
            if (this.config.enableCaching && request.method === 'GET') {
                const cached = this.getCachedResponse(request);
                if (cached) {
                    return {
                        success: true,
                        data: cached,
                        statusCode: 200,
                        responseTime: performance.now() - startTime,
                        service: request.service,
                        version: 'cached'
                    };
                }
            }
            // Get service endpoint
            const endpoint = this.selectServiceEndpoint(request.service);
            if (!endpoint) {
                throw new Error(`Service ${request.service} not available`);
            }
            // Make request
            const response = await this.makeServiceRequest(endpoint, request);
            // Cache response if applicable
            if (this.config.enableCaching && request.method === 'GET' && response.success) {
                this.cacheResponse(request, response.data);
            }
            // Update metrics
            this.metrics.requestsSuccess++;
            const responseTime = performance.now() - startTime;
            this.updateResponseTime(responseTime);
            return {
                ...response,
                responseTime,
                service: request.service,
                version: endpoint.version
            };
        }
        catch (error) {
            this.metrics.requestsFailed++;
            const responseTime = performance.now() - startTime;
            return {
                success: false,
                error: error.message,
                statusCode: 500,
                responseTime,
                service: request.service,
                version: 'unknown'
            };
        }
    }
    // Select service endpoint using load balancing
    selectServiceEndpoint(serviceName) {
        const endpoints = this.services.get(serviceName);
        if (!endpoints || endpoints.length === 0)
            return null;
        // Filter healthy endpoints
        const healthyEndpoints = endpoints.filter(ep => ep.health === 'healthy');
        if (healthyEndpoints.length === 0)
            return null;
        switch (this.config.loadBalancingStrategy) {
            case 'round-robin':
                return this.selectRoundRobin(serviceName, healthyEndpoints);
            case 'least-connections':
                return this.selectLeastConnections(healthyEndpoints);
            case 'random':
                return this.selectRandom(healthyEndpoints);
            case 'weighted':
                return this.selectWeighted(healthyEndpoints);
            default:
                return healthyEndpoints[0];
        }
    }
    // Round-robin selection
    selectRoundRobin(serviceName, endpoints) {
        const index = this.serviceIndex.get(serviceName) || 0;
        const selected = endpoints[index % endpoints.length];
        this.serviceIndex.set(serviceName, (index + 1) % endpoints.length);
        return selected;
    }
    // Least connections selection
    selectLeastConnections(endpoints) {
        return endpoints.reduce((min, current) => current.load < min.load ? current : min);
    }
    // Random selection
    selectRandom(endpoints) {
        return endpoints[Math.floor(Math.random() * endpoints.length)];
    }
    // Weighted selection
    selectWeighted(endpoints) {
        // Simple weighted selection based on response time
        const weights = endpoints.map(ep => 1 / (ep.responseTime + 1));
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        for (let i = 0; i < endpoints.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return endpoints[i];
            }
        }
        return endpoints[endpoints.length - 1];
    }
    // Make actual service request
    async makeServiceRequest(endpoint, request) {
        const url = `${endpoint.url}${request.path}`;
        const options = {
            method: request.method,
            headers: {
                'Content-Type': 'application/json',
                'X-Service-Version': endpoint.version,
                ...request.headers
            }
        };
        if (request.data && request.method !== 'GET') {
            options.body = JSON.stringify(request.data);
        }
        const timeout = request.timeout || this.config.serviceTimeout;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            const data = await response.json();
            return {
                success: response.ok,
                data: response.ok ? data : undefined,
                statusCode: response.status
            };
        }
        catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
    // Cache management
    getCachedResponse(request) {
        const key = this.generateCacheKey(request);
        const cached = this.cache.get(key);
        if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
            return cached.data;
        }
        if (cached) {
            this.cache.delete(key);
        }
        return null;
    }
    cacheResponse(request, data) {
        const key = this.generateCacheKey(request);
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: this.config.cacheTTL
        });
    }
    generateCacheKey(request) {
        return `${request.service}:${request.method}:${request.path}:${JSON.stringify(request.data || {})}`;
    }
    // Health checks
    startHealthChecks() {
        setInterval(() => {
            this.performHealthChecks();
        }, this.config.healthCheckInterval);
    }
    async performHealthChecks() {
        for (const [serviceName, endpoints] of this.services.entries()) {
            for (const endpoint of endpoints) {
                try {
                    const startTime = performance.now();
                    const response = await fetch(`${endpoint.url}/health`, {
                        method: 'GET',
                        signal: AbortSignal.timeout(5000)
                    });
                    const responseTime = performance.now() - startTime;
                    endpoint.health = response.ok ? 'healthy' : 'degraded';
                    endpoint.lastCheck = Date.now();
                    endpoint.responseTime = responseTime;
                    if (response.ok) {
                        const healthData = await response.json();
                        endpoint.load = healthData.load || 0;
                    }
                }
                catch (error) {
                    endpoint.health = 'unhealthy';
                    endpoint.lastCheck = Date.now();
                    endpoint.responseTime = -1;
                }
            }
        }
        this.updateHealthMetrics();
    }
    updateHealthMetrics() {
        let healthy = 0;
        let unhealthy = 0;
        for (const endpoints of this.services.values()) {
            for (const endpoint of endpoints) {
                if (endpoint.health === 'healthy') {
                    healthy++;
                }
                else {
                    unhealthy++;
                }
            }
        }
        this.metrics.servicesHealthy = healthy;
        this.metrics.servicesUnhealthy = unhealthy;
    }
    updateResponseTime(responseTime) {
        this.metrics.averageResponseTime =
            (this.metrics.averageResponseTime + responseTime) / 2;
    }
    // Get service status
    getServiceStatus(serviceName) {
        if (serviceName) {
            return this.services.get(serviceName) || [];
        }
        const status = {};
        for (const [name, endpoints] of this.services.entries()) {
            status[name] = endpoints;
        }
        return status;
    }
    // Get metrics
    getMetrics() {
        return { ...this.metrics };
    }
    // Health check
    async healthCheck() {
        try {
            const health = {
                status: this.metrics.servicesUnhealthy > this.metrics.servicesHealthy * 0.5
                    ? 'unhealthy' : this.metrics.servicesUnhealthy > 0
                    ? 'degraded' : 'healthy',
                services: this.services.size,
                healthy: this.metrics.servicesHealthy,
                unhealthy: this.metrics.servicesUnhealthy,
                metrics: this.getMetrics()
            };
            return health;
        }
        catch (error) {
            console.error('❌ API Gateway health check failed:', error);
            throw error;
        }
    }
    // Clear cache
    clearCache() {
        this.cache.clear();
    }
    // Cleanup
    destroy() {
        this.services.clear();
        this.serviceIndex.clear();
        this.cache.clear();
    }
}
// Singleton instance
export const apiGateway = new APIGateway();
