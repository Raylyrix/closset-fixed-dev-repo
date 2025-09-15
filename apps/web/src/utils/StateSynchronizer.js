/**
 * State Synchronizer
 * Fixes critical state synchronization issues between enhanced manager and global state
 */
export class StateSynchronizer {
    constructor() {
        this.snapshots = [];
        this.operations = [];
        this.conflicts = [];
        this.isProcessing = false;
        this.syncQueue = [];
        this.maxSnapshots = 50;
        this.maxOperations = 1000;
        this.conflictThreshold = 1000; // 1 second
        this.version = 0;
    }
    // Create state snapshot
    createSnapshot(stitches, layers) {
        const snapshot = {
            id: `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            stitches: this.deepClone(stitches),
            layers: this.deepClone(layers),
            version: ++this.version
        };
        this.snapshots.push(snapshot);
        // Keep only recent snapshots
        if (this.snapshots.length > this.maxSnapshots) {
            this.snapshots.shift();
        }
        return snapshot.id;
    }
    // Add sync operation
    addOperation(operation) {
        const syncOp = {
            ...operation,
            id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now()
        };
        this.operations.push(syncOp);
        this.syncQueue.push(syncOp);
        // Keep only recent operations
        if (this.operations.length > this.maxOperations) {
            this.operations.shift();
        }
        // Process sync queue
        this.processSyncQueue();
        return syncOp.id;
    }
    // Process sync queue
    async processSyncQueue() {
        if (this.isProcessing || this.syncQueue.length === 0)
            return;
        this.isProcessing = true;
        try {
            while (this.syncQueue.length > 0) {
                const operation = this.syncQueue.shift();
                if (operation) {
                    await this.processOperation(operation);
                }
            }
        }
        finally {
            this.isProcessing = false;
        }
    }
    // Process individual operation
    async processOperation(operation) {
        try {
            // Check for conflicts
            const conflicts = this.detectConflicts(operation);
            if (conflicts.length > 0) {
                await this.resolveConflicts(operation, conflicts);
            }
            else {
                await this.applyOperation(operation);
            }
        }
        catch (error) {
            console.error('Error processing sync operation:', error);
            this.recordConflict(operation, 'REJECT', 'Processing error');
        }
    }
    // Detect conflicts with recent operations
    detectConflicts(operation) {
        const recentOperations = this.operations.filter(op => Math.abs(op.timestamp - operation.timestamp) < this.conflictThreshold &&
            op.id !== operation.id);
        return recentOperations.filter(op => {
            // Check for data conflicts
            if (op.type === 'UPDATE' && operation.type === 'UPDATE') {
                return this.hasDataConflict(op.data, operation.data);
            }
            if (op.type === 'DELETE' && operation.type === 'UPDATE') {
                return this.hasDeleteUpdateConflict(op.data, operation.data);
            }
            return false;
        });
    }
    // Check for data conflicts
    hasDataConflict(data1, data2) {
        // Check if both operations modify the same stitch
        if (data1.id && data2.id && data1.id === data2.id) {
            return true;
        }
        // Check for overlapping layer modifications
        if (data1.layerId && data2.layerId && data1.layerId === data2.layerId) {
            return true;
        }
        return false;
    }
    // Check for delete-update conflicts
    hasDeleteUpdateConflict(deleteData, updateData) {
        return deleteData.id === updateData.id;
    }
    // Resolve conflicts
    async resolveConflicts(operation, conflicts) {
        console.log(`🔄 Resolving conflicts for operation ${operation.id}`);
        for (const conflict of conflicts) {
            const resolution = this.determineConflictResolution(operation, conflict);
            switch (resolution) {
                case 'ACCEPT':
                    await this.applyOperation(operation);
                    this.recordConflict(operation, 'ACCEPT', 'Operation accepted');
                    break;
                case 'REJECT':
                    this.recordConflict(operation, 'REJECT', 'Operation rejected due to conflict');
                    break;
                case 'MERGE':
                    await this.mergeOperations(operation, conflict);
                    this.recordConflict(operation, 'MERGE', 'Operations merged');
                    break;
                case 'MANUAL':
                    // Queue for manual resolution
                    this.recordConflict(operation, 'MANUAL', 'Requires manual resolution');
                    break;
            }
        }
    }
    // Determine conflict resolution strategy
    determineConflictResolution(operation, conflict) {
        // Priority: ENHANCED_MANAGER > GLOBAL_STATE > EXTERNAL
        const priority = {
            'ENHANCED_MANAGER': 3,
            'GLOBAL_STATE': 2,
            'EXTERNAL': 1
        };
        if (priority[operation.source] > priority[conflict.source]) {
            return 'ACCEPT';
        }
        if (priority[operation.source] < priority[conflict.source]) {
            return 'REJECT';
        }
        // Same priority - use timestamp
        if (operation.timestamp > conflict.timestamp) {
            return 'ACCEPT';
        }
        // Complex conflict - require manual resolution
        return 'MANUAL';
    }
    // Merge operations
    async mergeOperations(operation1, operation2) {
        console.log(`🔀 Merging operations ${operation1.id} and ${operation2.id}`);
        // Create merged operation
        const mergedOperation = {
            id: `merged_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'UPDATE',
            data: this.mergeData(operation1.data, operation2.data),
            timestamp: Math.max(operation1.timestamp, operation2.timestamp),
            source: operation1.source
        };
        await this.applyOperation(mergedOperation);
    }
    // Merge data from two operations
    mergeData(data1, data2) {
        // Simple merge strategy - combine properties
        return {
            ...data1,
            ...data2,
            merged: true,
            mergeTimestamp: Date.now()
        };
    }
    // Apply operation
    async applyOperation(operation) {
        console.log(`✅ Applying operation ${operation.id} of type ${operation.type}`);
        // This would be implemented by the specific state manager
        // For now, just log the operation
        console.log('Operation data:', operation.data);
    }
    // Record conflict resolution
    recordConflict(operation, resolution, reason) {
        const conflict = {
            operation,
            resolution,
            reason,
            timestamp: Date.now()
        };
        this.conflicts.push(conflict);
    }
    // Get state history
    getStateHistory(limit = 10) {
        return this.snapshots.slice(-limit);
    }
    // Get operation history
    getOperationHistory(limit = 50) {
        return this.operations.slice(-limit);
    }
    // Get conflict history
    getConflictHistory(limit = 20) {
        return this.conflicts.slice(-limit);
    }
    // Get current state
    getCurrentState() {
        return this.snapshots[this.snapshots.length - 1] || null;
    }
    // Rollback to specific snapshot
    rollbackToSnapshot(snapshotId) {
        const snapshot = this.snapshots.find(s => s.id === snapshotId);
        if (!snapshot)
            return false;
        // Remove snapshots after the target
        const targetIndex = this.snapshots.findIndex(s => s.id === snapshotId);
        this.snapshots = this.snapshots.slice(0, targetIndex + 1);
        // Clear operations after the snapshot
        this.operations = this.operations.filter(op => op.timestamp <= snapshot.timestamp);
        console.log(`🔄 Rolled back to snapshot ${snapshotId}`);
        return true;
    }
    // Validate state consistency
    validateState(stitches, layers) {
        const errors = [];
        // Check for duplicate stitch IDs
        const stitchIds = stitches.map(s => s.id);
        const duplicateIds = stitchIds.filter((id, index) => stitchIds.indexOf(id) !== index);
        if (duplicateIds.length > 0) {
            errors.push(`Duplicate stitch IDs found: ${duplicateIds.join(', ')}`);
        }
        // Check for orphaned stitches (stitches referencing non-existent layers)
        const layerIds = layers.map(l => l.id);
        const orphanedStitches = stitches.filter(s => s.layer && !layerIds.includes(s.layer));
        if (orphanedStitches.length > 0) {
            errors.push(`Orphaned stitches found: ${orphanedStitches.length} stitches reference non-existent layers`);
        }
        // Check for layer consistency
        for (const layer of layers) {
            const layerStitches = stitches.filter(s => s.layer === layer.id);
            if (layerStitches.length !== layer.stitches.length) {
                errors.push(`Layer ${layer.id} stitch count mismatch: expected ${layer.stitches.length}, found ${layerStitches.length}`);
            }
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    // Deep clone utility
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object')
            return obj;
        if (obj instanceof Date)
            return new Date(obj.getTime());
        if (obj instanceof Array)
            return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const cloned = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = this.deepClone(obj[key]);
                }
            }
            return cloned;
        }
        return obj;
    }
    // Cleanup
    destroy() {
        this.snapshots = [];
        this.operations = [];
        this.conflicts = [];
        this.syncQueue = [];
    }
}
// Singleton instance
export const stateSynchronizer = new StateSynchronizer();
