// Real-Time Collaboration System
// Multi-user editing with conflict resolution and cloud sync

export interface CollaborationSession {
  id: string;
  name: string;
  description: string;
  
  // Session properties
  type: 'design' | 'review' | 'presentation' | 'workshop';
  status: 'active' | 'paused' | 'ended' | 'archived';
  
  // Participants
  participants: Participant[];
  owner: string;
  moderators: string[];
  
  // Permissions
  permissions: SessionPermissions;
  
  // Content
  design: DesignState;
  history: ActionHistory[];
  comments: Comment[];
  annotations: Annotation[];
  
  // Settings
  settings: CollaborationSettings;
  
  // Metadata
  created: Date;
  modified: Date;
  lastActivity: Date;
  version: string;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'owner' | 'moderator' | 'editor' | 'viewer' | 'guest';
  
  // Status
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: Date;
  
  // Capabilities
  capabilities: ParticipantCapabilities;
  
  // Current activity
  currentTool: string | null;
  currentSelection: string[];
  cursor: CursorPosition;
  
  // Performance
  performance: ParticipantPerformance;
}

export interface ParticipantCapabilities {
  canEdit: boolean;
  canComment: boolean;
  canAnnotate: boolean;
  canModerate: boolean;
  canInvite: boolean;
  canExport: boolean;
  canPresent: boolean;
  
  // Tool permissions
  allowedTools: string[];
  restrictedTools: string[];
  
  // Feature permissions
  features: FeaturePermissions;
}

export interface FeaturePermissions {
  realTimePreview: boolean;
  voiceChat: boolean;
  screenShare: boolean;
  whiteboard: boolean;
  fileUpload: boolean;
  versionControl: boolean;
}

export interface SessionPermissions {
  // General permissions
  allowGuests: boolean;
  requireApproval: boolean;
  allowAnonymous: boolean;
  
  // Editing permissions
  allowSimultaneousEditing: boolean;
  allowToolSwitching: boolean;
  allowUndoRedo: boolean;
  
  // Content permissions
  allowFileUpload: boolean;
  allowFileDownload: boolean;
  allowExport: boolean;
  allowPrint: boolean;
  
  // Communication permissions
  allowChat: boolean;
  allowVoice: boolean;
  allowVideo: boolean;
  allowScreenShare: boolean;
  
  // Moderation permissions
  allowKick: boolean;
  allowMute: boolean;
  allowBan: boolean;
  allowRoleChange: boolean;
}

export interface CollaborationSettings {
  // Real-time settings
  syncInterval: number; // milliseconds
  conflictResolution: 'last-write-wins' | 'operational-transform' | 'manual';
  autoSave: boolean;
  autoSaveInterval: number;
  
  // Quality settings
  previewQuality: 'draft' | 'normal' | 'high' | 'ultra';
  compressionLevel: number;
  maxParticipants: number;
  
  // Security settings
  encryption: boolean;
  authentication: 'none' | 'email' | 'sso' | 'enterprise';
  dataRetention: number; // days
  
  // Notification settings
  notifications: NotificationSettings;
  
  // Integration settings
  integrations: IntegrationSettings;
}

export interface NotificationSettings {
  enabled: boolean;
  types: NotificationType[];
  channels: NotificationChannel[];
  frequency: 'immediate' | 'batched' | 'daily';
}

export interface NotificationType {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
}

export interface NotificationChannel {
  type: 'email' | 'push' | 'in-app' | 'sms';
  enabled: boolean;
  settings: Record<string, any>;
}

export interface IntegrationSettings {
  calendar: boolean;
  fileStorage: boolean;
  versionControl: boolean;
  projectManagement: boolean;
  communication: boolean;
}

export interface ActionHistory {
  id: string;
  type: string;
  timestamp: Date;
  author: string;
  
  // Action data
  action: Action;
  before: any;
  after: any;
  
  // Conflict resolution
  conflicts: Conflict[];
  resolved: boolean;
  resolution: ConflictResolution | null;
  
  // Dependencies
  dependsOn: string[];
  blocks: string[];
}

export interface Conflict {
  id: string;
  type: 'edit' | 'delete' | 'move' | 'rename' | 'permission';
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  // Conflicting actions
  actionA: string;
  actionB: string;
  
  // Conflict data
  element: string;
  property: string;
  valueA: any;
  valueB: any;
  
  // Resolution
  status: 'pending' | 'resolved' | 'ignored';
  resolution: ConflictResolution | null;
  resolvedBy: string | null;
  resolvedAt: Date | null;
}

export interface ConflictResolution {
  type: 'merge' | 'override' | 'manual' | 'skip';
  data: any;
  reasoning: string;
  confidence: number;
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
  
  // Location
  element: string;
  position: Vector2;
  
  // Threading
  parent: string | null;
  replies: string[];
  
  // Status
  status: 'active' | 'resolved' | 'archived';
  resolvedBy: string | null;
  resolvedAt: Date | null;
  
  // Metadata
  mentions: string[];
  attachments: Attachment[];
  reactions: Reaction[];
}

export interface Annotation {
  id: string;
  type: 'highlight' | 'arrow' | 'shape' | 'text' | 'freehand';
  content: string;
  author: string;
  timestamp: Date;
  
  // Geometry
  geometry: AnnotationGeometry;
  
  // Style
  style: AnnotationStyle;
  
  // Visibility
  visible: boolean;
  locked: boolean;
  
  // Threading
  comments: string[];
}

export interface AnnotationGeometry {
  type: 'point' | 'line' | 'rectangle' | 'circle' | 'polygon' | 'path';
  coordinates: number[];
  bounds: BoundingBox;
}

export interface AnnotationStyle {
  color: string;
  opacity: number;
  strokeWidth: number;
  fillColor: string;
  fillOpacity: number;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnail: string | null;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface CursorPosition {
  x: number;
  y: number;
  tool: string | null;
  selection: string[];
  timestamp: Date;
}

export interface ParticipantPerformance {
  latency: number;
  bandwidth: number;
  cpuUsage: number;
  memoryUsage: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface DesignState {
  id: string;
  name: string;
  version: string;
  
  // Content
  elements: DesignElement[];
  layers: Layer[];
  styles: Style[];
  
  // Metadata
  created: Date;
  modified: Date;
  author: string;
  collaborators: string[];
  
  // Settings
  settings: DesignSettings;
  
  // History
  history: ActionHistory[];
  branches: Branch[];
  tags: string[];
}

export interface DesignElement {
  id: string;
  type: string;
  properties: Record<string, any>;
  position: Vector2;
  size: Vector2;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  
  // Collaboration
  createdBy: string;
  modifiedBy: string;
  lastModified: Date;
  version: number;
  
  // Dependencies
  dependsOn: string[];
  blocks: string[];
}

export interface Layer {
  id: string;
  name: string;
  type: 'raster' | 'vector' | 'text' | 'effect' | 'group';
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: string;
  order: number;
  
  // Content
  elements: string[];
  
  // Collaboration
  createdBy: string;
  modifiedBy: string;
  lastModified: Date;
}

export interface Style {
  id: string;
  name: string;
  type: 'color' | 'typography' | 'effect' | 'layout';
  properties: Record<string, any>;
  
  // Usage
  usedBy: string[];
  
  // Collaboration
  createdBy: string;
  modifiedBy: string;
  lastModified: Date;
}

export interface DesignSettings {
  canvas: CanvasSettings;
  grid: GridSettings;
  snap: SnapSettings;
  export: ExportSettings;
}

export interface CanvasSettings {
  width: number;
  height: number;
  dpi: number;
  colorSpace: string;
  backgroundColor: string;
}

export interface GridSettings {
  enabled: boolean;
  size: number;
  color: string;
  opacity: number;
  snapToGrid: boolean;
}

export interface SnapSettings {
  enabled: boolean;
  snapToObjects: boolean;
  snapToGuides: boolean;
  snapToGrid: boolean;
  snapDistance: number;
}

export interface ExportSettings {
  format: string;
  quality: number;
  compression: number;
  includeMetadata: boolean;
  includeLayers: boolean;
}

export interface Branch {
  id: string;
  name: string;
  description: string;
  parent: string | null;
  created: Date;
  author: string;
  status: 'active' | 'merged' | 'abandoned';
}

export interface Action {
  id: string;
  type: string;
  timestamp: Date;
  author: string;
  
  // Action data
  target: string;
  operation: string;
  data: any;
  
  // Dependencies
  dependsOn: string[];
  blocks: string[];
  
  // Conflict resolution
  conflicts: string[];
  resolved: boolean;
}

// Real-Time Collaboration Manager
export class RealTimeCollaboration {
  private static instance: RealTimeCollaboration;
  
  // WebSocket connection
  private socket: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  
  // Current session
  private currentSession: CollaborationSession | null = null;
  private participants: Map<string, Participant> = new Map();
  
  // State management
  private actionQueue: Action[] = [];
  private conflictResolver!: ConflictResolver;
  private operationalTransform!: OperationalTransform;
  
  // Event system
  private eventListeners: Map<string, Function[]> = new Map();
  
  // Performance monitoring
  private performanceMonitor!: CollaborationPerformanceMonitor;
  
  // Security
  private encryption!: EncryptionService;
  private authentication!: AuthenticationService;
  
  private constructor() {
    this.initializeServices();
    this.setupEventHandlers();
  }
  
  public static getInstance(): RealTimeCollaboration {
    if (!RealTimeCollaboration.instance) {
      RealTimeCollaboration.instance = new RealTimeCollaboration();
    }
    return RealTimeCollaboration.instance;
  }
  
  // Session Management
  public async createSession(config: CreateSessionConfig): Promise<CollaborationSession> {
    try {
      const session: CollaborationSession = {
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: config.name,
        description: config.description || '',
        type: config.type || 'design',
        status: 'active',
        participants: [],
        owner: config.owner,
        moderators: config.moderators || [],
        permissions: config.permissions || this.getDefaultPermissions(),
        design: config.design || this.createEmptyDesign(),
        history: [],
        comments: [],
        annotations: [],
        settings: config.settings || this.getDefaultSettings(),
        created: new Date(),
        modified: new Date(),
        lastActivity: new Date(),
        version: '1.0.0'
      };
      
      // Connect to collaboration server
      await this.connectToSession(session.id);
      
      // Join session
      await this.joinSession(session.id, config.owner);
      
      this.currentSession = session;
      
      // Emit event
      this.emit('sessionCreated', { session });
      
      return session;
      
    } catch (error) {
      console.error('Error creating collaboration session:', error);
      throw error;
    }
  }
  
  public async joinSession(sessionId: string, userId: string): Promise<void> {
    try {
      // Send join request
      this.sendMessage({
        type: 'join_session',
        sessionId,
        userId,
        timestamp: new Date()
      });
      
      // Wait for confirmation
      await this.waitForMessage('session_joined');
      
    } catch (error) {
      console.error('Error joining session:', error);
      throw error;
    }
  }
  
  public async leaveSession(): Promise<void> {
    try {
      if (this.currentSession) {
        // Send leave request
        this.sendMessage({
          type: 'leave_session',
          sessionId: this.currentSession.id,
          timestamp: new Date()
        });
        
        // Close connection
        this.disconnect();
        
        // Clear session
        this.currentSession = null;
        this.participants.clear();
        
        // Emit event
        this.emit('sessionLeft', {});
      }
      
    } catch (error) {
      console.error('Error leaving session:', error);
      throw error;
    }
  }
  
  // Real-time Actions
  public async performAction(action: Action): Promise<void> {
    try {
      // Validate action
      const validation = this.validateAction(action);
      if (!validation.valid) {
        throw new Error(`Invalid action: ${validation.errors.join(', ')}`);
      }
      
      // Apply operational transform
      const transformedAction = this.operationalTransform.transform(action, this.actionQueue);
      
      // Add to queue
      this.actionQueue.push(transformedAction);
      
      // Send to server
      this.sendMessage({
        type: 'action',
        action: transformedAction,
        timestamp: new Date()
      });
      
      // Apply locally
      this.applyAction(transformedAction);
      
      // Emit event
      this.emit('actionPerformed', { action: transformedAction });
      
    } catch (error) {
      console.error('Error performing action:', error);
      throw error;
    }
  }
  
  // Conflict Resolution
  public async resolveConflict(conflictId: string, resolution: ConflictResolution): Promise<void> {
    try {
      // Send resolution to server
      this.sendMessage({
        type: 'resolve_conflict',
        conflictId,
        resolution,
        timestamp: new Date()
      });
      
      // Apply resolution locally
      this.conflictResolver.applyResolution(conflictId, resolution);
      
      // Emit event
      this.emit('conflictResolved', { conflictId, resolution });
      
    } catch (error) {
      console.error('Error resolving conflict:', error);
      throw error;
    }
  }
  
  // Comments and Annotations
  public async addComment(comment: Omit<Comment, 'id' | 'timestamp'>): Promise<Comment> {
    try {
      const newComment: Comment = {
        ...comment,
        id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      };
      
      // Send to server
      this.sendMessage({
        type: 'add_comment',
        comment: newComment,
        timestamp: new Date()
      });
      
      // Add to local state
      if (this.currentSession) {
        this.currentSession.comments.push(newComment);
      }
      
      // Emit event
      this.emit('commentAdded', { comment: newComment });
      
      return newComment;
      
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }
  
  public async addAnnotation(annotation: Omit<Annotation, 'id' | 'timestamp'>): Promise<Annotation> {
    try {
      const newAnnotation: Annotation = {
        ...annotation,
        id: `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      };
      
      // Send to server
      this.sendMessage({
        type: 'add_annotation',
        annotation: newAnnotation,
        timestamp: new Date()
      });
      
      // Add to local state
      if (this.currentSession) {
        this.currentSession.annotations.push(newAnnotation);
      }
      
      // Emit event
      this.emit('annotationAdded', { annotation: newAnnotation });
      
      return newAnnotation;
      
    } catch (error) {
      console.error('Error adding annotation:', error);
      throw error;
    }
  }
  
  // Voice and Video
  public async startVoiceChat(): Promise<void> {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Send voice data
      this.sendMessage({
        type: 'start_voice_chat',
        stream: stream,
        timestamp: new Date()
      });
      
      // Emit event
      this.emit('voiceChatStarted', {});
      
    } catch (error) {
      console.error('Error starting voice chat:', error);
      throw error;
    }
  }
  
  public async startVideoChat(): Promise<void> {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      
      // Send video data
      this.sendMessage({
        type: 'start_video_chat',
        stream: stream,
        timestamp: new Date()
      });
      
      // Emit event
      this.emit('videoChatStarted', {});
      
    } catch (error) {
      console.error('Error starting video chat:', error);
      throw error;
    }
  }
  
  // Screen Sharing
  public async startScreenShare(): Promise<void> {
    try {
      // Request screen access
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      
      // Send screen data
      this.sendMessage({
        type: 'start_screen_share',
        stream: stream,
        timestamp: new Date()
      });
      
      // Emit event
      this.emit('screenShareStarted', {});
      
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  }
  
  // Event System
  public on(event: string, listener: Function): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
    
    return () => {
      const listeners = this.eventListeners.get(event) || [];
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }
  
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in collaboration event listener for ${event}:`, error);
      }
    });
  }
  
  // WebSocket Management
  private async connectToSession(sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${process.env.REACT_APP_WS_URL || 'ws://localhost:8080'}/collaboration/${sessionId}`;
        this.socket = new WebSocket(wsUrl);
        
        this.socket.onopen = () => {
          console.log('Connected to collaboration server');
          this.reconnectAttempts = 0;
          resolve();
        };
        
        this.socket.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data));
        };
        
        this.socket.onclose = () => {
          console.log('Disconnected from collaboration server');
          this.handleDisconnect();
        };
        
        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  private disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
  
  private handleDisconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connectToSession(this.currentSession?.id || '');
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      this.emit('connectionLost', {});
    }
  }
  
  private sendMessage(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message queued');
      // Queue message for later
    }
  }
  
  private handleMessage(message: any): void {
    switch (message.type) {
      case 'session_joined':
        this.handleSessionJoined(message);
        break;
      case 'participant_joined':
        this.handleParticipantJoined(message);
        break;
      case 'participant_left':
        this.handleParticipantLeft(message);
        break;
      case 'action':
        this.handleAction(message);
        break;
      case 'conflict':
        this.handleConflict(message);
        break;
      case 'comment':
        this.handleComment(message);
        break;
      case 'annotation':
        this.handleAnnotation(message);
        break;
      case 'voice_data':
        this.handleVoiceData(message);
        break;
      case 'video_data':
        this.handleVideoData(message);
        break;
      case 'screen_data':
        this.handleScreenData(message);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }
  
  private handleSessionJoined(message: any): void {
    this.emit('sessionJoined', message);
  }
  
  private handleParticipantJoined(message: any): void {
    this.participants.set(message.participant.id, message.participant);
    this.emit('participantJoined', message);
  }
  
  private handleParticipantLeft(message: any): void {
    this.participants.delete(message.participantId);
    this.emit('participantLeft', message);
  }
  
  private handleAction(message: any): void {
    this.applyAction(message.action);
    this.emit('actionReceived', message);
  }
  
  private handleConflict(message: any): void {
    this.emit('conflictDetected', message);
  }
  
  private handleComment(message: any): void {
    if (this.currentSession) {
      this.currentSession.comments.push(message.comment);
    }
    this.emit('commentReceived', message);
  }
  
  private handleAnnotation(message: any): void {
    if (this.currentSession) {
      this.currentSession.annotations.push(message.annotation);
    }
    this.emit('annotationReceived', message);
  }
  
  private handleVoiceData(message: any): void {
    this.emit('voiceDataReceived', message);
  }
  
  private handleVideoData(message: any): void {
    this.emit('videoDataReceived', message);
  }
  
  private handleScreenData(message: any): void {
    this.emit('screenDataReceived', message);
  }
  
  // Helper methods
  private initializeServices(): void {
    this.conflictResolver = new ConflictResolver();
    this.operationalTransform = new OperationalTransform();
    this.performanceMonitor = new CollaborationPerformanceMonitor();
    this.encryption = new EncryptionService();
    this.authentication = new AuthenticationService();
  }
  
  private setupEventHandlers(): void {
    // Setup event handlers
  }
  
  private getDefaultPermissions(): SessionPermissions {
    return {
      allowGuests: false,
      requireApproval: false,
      allowAnonymous: false,
      allowSimultaneousEditing: true,
      allowToolSwitching: true,
      allowUndoRedo: true,
      allowFileUpload: true,
      allowFileDownload: true,
      allowExport: true,
      allowPrint: true,
      allowChat: true,
      allowVoice: true,
      allowVideo: true,
      allowScreenShare: true,
      allowKick: true,
      allowMute: true,
      allowBan: true,
      allowRoleChange: true
    };
  }
  
  private getDefaultSettings(): CollaborationSettings {
    return {
      syncInterval: 100,
      conflictResolution: 'operational-transform',
      autoSave: true,
      autoSaveInterval: 5000,
      previewQuality: 'high',
      compressionLevel: 6,
      maxParticipants: 10,
      encryption: true,
      authentication: 'email',
      dataRetention: 365,
      notifications: {
        enabled: true,
        types: [],
        channels: [],
        frequency: 'immediate'
      },
      integrations: {
        calendar: false,
        fileStorage: true,
        versionControl: true,
        projectManagement: false,
        communication: true
      }
    };
  }
  
  private createEmptyDesign(): DesignState {
    return {
      id: `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: 'New Design',
      version: '1.0.0',
      elements: [],
      layers: [],
      styles: [],
      created: new Date(),
      modified: new Date(),
      author: 'System',
      collaborators: [],
      settings: {
        canvas: {
          width: 1920,
          height: 1080,
          dpi: 300,
          colorSpace: 'sRGB',
          backgroundColor: '#ffffff'
        },
        grid: {
          enabled: true,
          size: 20,
          color: '#cccccc',
          opacity: 0.5,
          snapToGrid: true
        },
        snap: {
          enabled: true,
          snapToObjects: true,
          snapToGuides: true,
          snapToGrid: true,
          snapDistance: 10
        },
        export: {
          format: 'png',
          quality: 100,
          compression: 0,
          includeMetadata: true,
          includeLayers: true
        }
      },
      history: [],
      branches: [],
      tags: []
    };
  }
  
  private validateAction(action: Action): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!action.id) errors.push('Action ID is required');
    if (!action.type) errors.push('Action type is required');
    if (!action.timestamp) errors.push('Action timestamp is required');
    if (!action.author) errors.push('Action author is required');
    if (!action.target) errors.push('Action target is required');
    if (!action.operation) errors.push('Action operation is required');
    
    return { valid: errors.length === 0, errors };
  }
  
  private applyAction(action: Action): void {
    // Apply action to local state
    // This would integrate with the main design system
  }
  
  private async waitForMessage(type: string): Promise<any> {
    return new Promise((resolve) => {
      const listener = (message: any) => {
        if (message.type === type) {
          this.socket?.removeEventListener('message', listener);
          resolve(message);
        }
      };
      this.socket?.addEventListener('message', listener);
    });
  }
}

// Supporting classes (simplified implementations)
export class ConflictResolver {
  applyResolution(conflictId: string, resolution: ConflictResolution): void {
    // Implement conflict resolution
  }
}

export class OperationalTransform {
  transform(action: Action, queue: Action[]): Action {
    // Implement operational transform
    return action;
  }
}

export class CollaborationPerformanceMonitor {
  // Implement performance monitoring
}

export class EncryptionService {
  // Implement encryption
}

export class AuthenticationService {
  // Implement authentication
}

// Supporting interfaces
export interface CreateSessionConfig {
  name: string;
  description?: string;
  type?: 'design' | 'review' | 'presentation' | 'workshop';
  owner: string;
  moderators?: string[];
  permissions?: SessionPermissions;
  design?: DesignState;
  settings?: CollaborationSettings;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface BoundingBox {
  min: Vector2;
  max: Vector2;
  width: number;
  height: number;
}
