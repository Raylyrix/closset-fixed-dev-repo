/**
 * Event Bus - Central event management system
 * Handles event publishing, subscribing, and routing across microservices
 */
export class EventBus {
    constructor(config = {}) {
        this.subscriptions = new Map();
        this.eventHistory = [];
        this.isProcessing = false;
        this.metrics = {
            eventsPublished: 0,
            eventsProcessed: 0,
            eventsFailed: 0,
            subscriptionsActive: 0,
            averageProcessingTime: 0
        };
        this.config = {
            maxSubscriptions: config.maxSubscriptions || 1000,
            maxEventHistory: config.maxEventHistory || 10000,
            eventTTL: config.eventTTL || 300000, // 5 minutes
            retryAttempts: config.retryAttempts || 3,
            retryDelay: config.retryDelay || 1000,
            enablePersistence: config.enablePersistence || false,
            enableMetrics: config.enableMetrics || true,
            ...config
        };
        // Start cleanup interval
        this.startCleanupInterval();
    }
    // Publish an event
    async publish(eventType, data, options = {}) {
        const event = {
            id: this.generateEventId(),
            type: eventType,
            source: options.source || 'unknown',
            target: options.target,
            data,
            timestamp: Date.now(),
            priority: options.priority || 'medium',
            ttl: options.ttl || this.config.eventTTL
        };
        try {
            // Add to history
            this.addToHistory(event);
            // Process event
            await this.processEvent(event);
            // Update metrics
            this.metrics.eventsPublished++;
            console.log(`📢 Event published: ${eventType} (${event.id})`);
            return event.id;
        }
        catch (error) {
            console.error('❌ Failed to publish event:', error);
            this.metrics.eventsFailed++;
            throw error;
        }
    }
    // Subscribe to events
    subscribe(eventType, handler, options = {}) {
        const subscriptionId = this.generateSubscriptionId();
        const subscription = {
            id: subscriptionId,
            eventType,
            handler,
            filter: options.filter,
            priority: options.priority || 0,
            once: options.once || false
        };
        // Add subscription
        if (!this.subscriptions.has(eventType)) {
            this.subscriptions.set(eventType, []);
        }
        this.subscriptions.get(eventType).push(subscription);
        // Sort by priority (higher priority first)
        this.subscriptions.get(eventType).sort((a, b) => b.priority - a.priority);
        this.metrics.subscriptionsActive = this.getTotalSubscriptions();
        console.log(`📡 Subscribed to: ${eventType} (${subscriptionId})`);
        return subscriptionId;
    }
    // Unsubscribe from events
    unsubscribe(subscriptionId) {
        for (const [eventType, subscriptions] of this.subscriptions.entries()) {
            const index = subscriptions.findIndex(sub => sub.id === subscriptionId);
            if (index !== -1) {
                subscriptions.splice(index, 1);
                this.metrics.subscriptionsActive = this.getTotalSubscriptions();
                console.log(`📡 Unsubscribed: ${subscriptionId}`);
                return true;
            }
        }
        return false;
    }
    // Process event
    async processEvent(event) {
        if (this.isProcessing) {
            // Queue event for later processing
            setTimeout(() => this.processEvent(event), 100);
            return;
        }
        this.isProcessing = true;
        const startTime = performance.now();
        try {
            // Get subscribers for this event type
            const subscribers = this.subscriptions.get(event.type) || [];
            // Process subscribers
            const promises = subscribers.map(async (subscription) => {
                try {
                    // Check filter
                    if (subscription.filter && !subscription.filter(event)) {
                        return;
                    }
                    // Execute handler
                    await subscription.handler(event);
                    // Remove if one-time subscription
                    if (subscription.once) {
                        this.unsubscribe(subscription.id);
                    }
                }
                catch (error) {
                    console.error(`❌ Event handler failed for ${subscription.id}:`, error);
                    this.metrics.eventsFailed++;
                }
            });
            await Promise.allSettled(promises);
            // Update metrics
            this.metrics.eventsProcessed++;
            const processingTime = performance.now() - startTime;
            this.metrics.averageProcessingTime =
                (this.metrics.averageProcessingTime + processingTime) / 2;
        }
        catch (error) {
            console.error('❌ Event processing failed:', error);
            this.metrics.eventsFailed++;
        }
        finally {
            this.isProcessing = false;
        }
    }
    // Add event to history
    addToHistory(event) {
        this.eventHistory.push(event);
        // Limit history size
        if (this.eventHistory.length > this.config.maxEventHistory) {
            this.eventHistory.shift();
        }
    }
    // Start cleanup interval
    startCleanupInterval() {
        setInterval(() => {
            this.cleanupExpiredEvents();
        }, 60000); // Cleanup every minute
    }
    // Cleanup expired events
    cleanupExpiredEvents() {
        const now = Date.now();
        const initialLength = this.eventHistory.length;
        this.eventHistory = this.eventHistory.filter(event => {
            if (event.ttl) {
                return (now - event.timestamp) < event.ttl;
            }
            return true;
        });
        const cleaned = initialLength - this.eventHistory.length;
        if (cleaned > 0) {
            console.log(`🧹 Cleaned up ${cleaned} expired events`);
        }
    }
    // Get event history
    getEventHistory(filter) {
        let events = [...this.eventHistory];
        if (filter) {
            if (filter.eventType) {
                events = events.filter(e => e.type === filter.eventType);
            }
            if (filter.source) {
                events = events.filter(e => e.source === filter.source);
            }
            if (filter.since) {
                events = events.filter(e => e.timestamp >= filter.since);
            }
            if (filter.limit) {
                events = events.slice(-filter.limit);
            }
        }
        return events.sort((a, b) => b.timestamp - a.timestamp);
    }
    // Get metrics
    getMetrics() {
        return { ...this.metrics };
    }
    // Get subscription count
    getSubscriptionCount(eventType) {
        if (eventType) {
            return this.subscriptions.get(eventType)?.length || 0;
        }
        return this.getTotalSubscriptions();
    }
    // Get total subscriptions
    getTotalSubscriptions() {
        let total = 0;
        for (const subscriptions of this.subscriptions.values()) {
            total += subscriptions.length;
        }
        return total;
    }
    // Generate event ID
    generateEventId() {
        return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    // Generate subscription ID
    generateSubscriptionId() {
        return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    // Health check
    async healthCheck() {
        try {
            const health = {
                status: this.metrics.eventsFailed > this.metrics.eventsProcessed * 0.1
                    ? 'degraded' : 'healthy',
                metrics: this.getMetrics(),
                subscriptions: this.getTotalSubscriptions(),
                eventHistory: this.eventHistory.length
            };
            return health;
        }
        catch (error) {
            console.error('❌ Event bus health check failed:', error);
            throw error;
        }
    }
    // Clear all data
    clear() {
        this.subscriptions.clear();
        this.eventHistory = [];
        this.metrics = {
            eventsPublished: 0,
            eventsProcessed: 0,
            eventsFailed: 0,
            subscriptionsActive: 0,
            averageProcessingTime: 0
        };
    }
    // Destroy event bus
    destroy() {
        this.clear();
        this.isProcessing = false;
    }
}
// Singleton instance
export const eventBus = new EventBus();
