import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { 
  UIState, 
  WorkspaceState, 
  EditorState, 
  ChatSession, 
  ChatMessage, 
  Notification, 
  CursorRule, 
  ProjectConfig, 
  AppSettings,
  AIModel,
  FileItem
} from '../types';

interface AppState {
  // UI State
  ui: UIState;
  
  // Workspace State
  workspace: WorkspaceState;
  
  // Editor State
  editor: EditorState | null;
  
  // Chat State
  chatSessions: ChatSession[];
  activeChatSession: string | null;
  
  // Rules and Configuration
  rules: CursorRule[];
  projectConfig: ProjectConfig | null;
  
  // Settings
  settings: AppSettings;
  
  // Performance and Metrics
  lastAIResponse: number;
  requestsCount: number;
  
  // Actions for UI
  toggleSidebar: () => void;
  setSidebarTab: (tab: 'files' | 'chat' | 'history' | 'rules') => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  setCommandPaletteQuery: (query: string) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  togglePreview: () => void;
  toggleDiff: () => void;
  
  // Actions for Workspace
  setWorkspaceRoot: (path: string) => void;
  addFile: (file: FileItem) => void;
  removeFile: (path: string) => void;
  updateFile: (path: string, updates: Partial<FileItem>) => void;
  openFile: (path: string) => void;
  closeFile: (path: string) => void;
  setActiveFile: (path: string | null) => void;
  setIndexingStatus: (isIndexing: boolean, progress?: number) => void;
  
  // Actions for Editor
  setEditorState: (state: EditorState) => void;
  updateEditorContent: (content: string) => void;
  markFileModified: (filePath: string, isModified: boolean) => void;
  
  // Actions for Chat
  createChatSession: (name?: string) => string;
  setActiveChatSession: (sessionId: string | null) => void;
  addChatMessage: (sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateChatSession: (sessionId: string, updates: Partial<ChatSession>) => void;
  deleteChatSession: (sessionId: string) => void;
  
  // Actions for Rules
  addRule: (rule: Omit<CursorRule, 'id' | 'lastModified'>) => void;
  updateRule: (id: string, updates: Partial<CursorRule>) => void;
  deleteRule: (id: string) => void;
  toggleRule: (id: string) => void;
  
  // Actions for Settings
  updateSettings: (updates: Partial<AppSettings>) => void;
  setDefaultModel: (model: AIModel) => void;
  
  // Actions for Performance
  recordAIResponse: (responseTime: number) => void;
  incrementRequestCount: () => void;
}

const defaultSettings: AppSettings = {
  general: {
    defaultModel: 'gpt-4.1-nano',
    autoSave: true,
    autoComplete: true,
    theme: 'dark'
  },
  ai: {
    streamResponses: true,
    includeProjectContext: true,
    maxTokens: 2000,
    temperature: 0.7,
    showConfidence: true
  },
  editor: {
    fontSize: 14,
    fontFamily: 'JetBrains Mono',
    tabSize: 2,
    wordWrap: true,
    minimap: true,
    lineNumbers: true
  },
  workspace: {
    autoIndex: true,
    excludePatterns: ['node_modules', '.git', 'dist', 'build'],
    maxFileSize: 1024 * 1024, // 1MB
    maxFiles: 10000
  }
};

const defaultUI: UIState = {
  sidebar: {
    isOpen: true,
    activeTab: 'files'
  },
  commandPalette: {
    isOpen: false,
    query: ''
  },
  notifications: [],
  theme: 'dark',
  layout: {
    panelSizes: [60, 40],
    showPreview: false,
    showDiff: false
  }
};

const defaultWorkspace: WorkspaceState = {
  rootPath: '',
  files: [],
  openFiles: [],
  activeFile: null,
  isIndexing: false,
  indexProgress: 0
};

export const useAppStore = create<AppState>()(
  immer((set, get) => ({
    // Initial state
    ui: defaultUI,
    workspace: defaultWorkspace,
    editor: null,
    chatSessions: [],
    activeChatSession: null,
    rules: [],
    projectConfig: null,
    settings: defaultSettings,
    lastAIResponse: 0,
    requestsCount: 0,

    // UI Actions
    toggleSidebar: () => set((state) => {
      state.ui.sidebar.isOpen = !state.ui.sidebar.isOpen;
    }),

    setSidebarTab: (tab) => set((state) => {
      state.ui.sidebar.activeTab = tab;
      if (!state.ui.sidebar.isOpen) {
        state.ui.sidebar.isOpen = true;
      }
    }),

    openCommandPalette: () => set((state) => {
      state.ui.commandPalette.isOpen = true;
      state.ui.commandPalette.query = '';
    }),

    closeCommandPalette: () => set((state) => {
      state.ui.commandPalette.isOpen = false;
      state.ui.commandPalette.query = '';
    }),

    setCommandPaletteQuery: (query) => set((state) => {
      state.ui.commandPalette.query = query;
    }),

    addNotification: (notification) => set((state) => {
      state.ui.notifications.unshift(notification);
      // Keep only last 50 notifications
      if (state.ui.notifications.length > 50) {
        state.ui.notifications = state.ui.notifications.slice(0, 50);
      }
    }),

    removeNotification: (id) => set((state) => {
      state.ui.notifications = state.ui.notifications.filter(n => n.id !== id);
    }),

    markNotificationRead: (id) => set((state) => {
      const notification = state.ui.notifications.find(n => n.id === id);
      if (notification) {
        notification.isRead = true;
      }
    }),

    togglePreview: () => set((state) => {
      state.ui.layout.showPreview = !state.ui.layout.showPreview;
    }),

    toggleDiff: () => set((state) => {
      state.ui.layout.showDiff = !state.ui.layout.showDiff;
    }),

    // Workspace Actions
    setWorkspaceRoot: (path) => set((state) => {
      state.workspace.rootPath = path;
      state.workspace.files = [];
      state.workspace.openFiles = [];
      state.workspace.activeFile = null;
    }),

    addFile: (file) => set((state) => {
      const existingIndex = state.workspace.files.findIndex(f => f.path === file.path);
      if (existingIndex >= 0) {
        state.workspace.files[existingIndex] = file;
      } else {
        state.workspace.files.push(file);
      }
    }),

    removeFile: (path) => set((state) => {
      state.workspace.files = state.workspace.files.filter(f => f.path !== path);
      state.workspace.openFiles = state.workspace.openFiles.filter(p => p !== path);
      if (state.workspace.activeFile === path) {
        state.workspace.activeFile = state.workspace.openFiles[0] || null;
      }
    }),

    updateFile: (path, updates) => set((state) => {
      const file = state.workspace.files.find(f => f.path === path);
      if (file) {
        Object.assign(file, updates);
      }
    }),

    openFile: (path) => set((state) => {
      if (!state.workspace.openFiles.includes(path)) {
        state.workspace.openFiles.push(path);
      }
      state.workspace.activeFile = path;
    }),

    closeFile: (path) => set((state) => {
      state.workspace.openFiles = state.workspace.openFiles.filter(p => p !== path);
      if (state.workspace.activeFile === path) {
        state.workspace.activeFile = state.workspace.openFiles[0] || null;
      }
    }),

    setActiveFile: (path) => set((state) => {
      state.workspace.activeFile = path;
    }),

    setIndexingStatus: (isIndexing, progress = 0) => set((state) => {
      state.workspace.isIndexing = isIndexing;
      state.workspace.indexProgress = progress;
    }),

    // Editor Actions
    setEditorState: (editorState) => set((state) => {
      state.editor = editorState;
    }),

    updateEditorContent: (content) => set((state) => {
      if (state.editor) {
        state.editor.content = content;
        state.editor.isModified = true;
      }
    }),

    markFileModified: (filePath, isModified) => set((state) => {
      const file = state.workspace.files.find(f => f.path === filePath);
      if (file) {
        // You could add a modified flag to FileItem type if needed
      }
      if (state.editor && state.editor.filePath === filePath) {
        state.editor.isModified = isModified;
      }
    }),

    // Chat Actions
    createChatSession: (name) => {
      const id = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const session: ChatSession = {
        id,
        name: name || `Chat ${get().chatSessions.length + 1}`,
        messages: [],
        createdAt: new Date(),
        lastActivity: new Date(),
        workspace: get().workspace.rootPath
      };

      set((state) => {
        state.chatSessions.push(session);
        state.activeChatSession = id;
      });

      return id;
    },

    setActiveChatSession: (sessionId) => set((state) => {
      state.activeChatSession = sessionId;
    }),

    addChatMessage: (sessionId, messageData) => set((state) => {
      const session = state.chatSessions.find(s => s.id === sessionId);
      if (session) {
        const message: ChatMessage = {
          ...messageData,
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date()
        };
        session.messages.push(message);
        session.lastActivity = new Date();
      }
    }),

    updateChatSession: (sessionId, updates) => set((state) => {
      const session = state.chatSessions.find(s => s.id === sessionId);
      if (session) {
        Object.assign(session, updates);
      }
    }),

    deleteChatSession: (sessionId) => set((state) => {
      state.chatSessions = state.chatSessions.filter(s => s.id !== sessionId);
      if (state.activeChatSession === sessionId) {
        state.activeChatSession = state.chatSessions[0]?.id || null;
      }
    }),

    // Rules Actions
    addRule: (ruleData) => set((state) => {
      const rule: CursorRule = {
        ...ruleData,
        id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        lastModified: new Date()
      };
      state.rules.push(rule);
    }),

    updateRule: (id, updates) => set((state) => {
      const rule = state.rules.find(r => r.id === id);
      if (rule) {
        Object.assign(rule, updates);
        rule.lastModified = new Date();
      }
    }),

    deleteRule: (id) => set((state) => {
      state.rules = state.rules.filter(r => r.id !== id);
    }),

    toggleRule: (id) => set((state) => {
      const rule = state.rules.find(r => r.id === id);
      if (rule) {
        rule.isActive = !rule.isActive;
        rule.lastModified = new Date();
      }
    }),

    // Settings Actions
    updateSettings: (updates) => set((state) => {
      // Deep merge settings
      const mergeDeep = (target: any, source: any) => {
        for (const key in source) {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (!target[key]) target[key] = {};
            mergeDeep(target[key], source[key]);
          } else {
            target[key] = source[key];
          }
        }
      };
      mergeDeep(state.settings, updates);
    }),

    setDefaultModel: (model) => set((state) => {
      state.settings.general.defaultModel = model;
    }),

    // Performance Actions
    recordAIResponse: (responseTime) => set((state) => {
      state.lastAIResponse = responseTime;
    }),

    incrementRequestCount: () => set((state) => {
      state.requestsCount += 1;
    })
  }))
);

// Persist settings to localStorage
useAppStore.subscribe(
  (state) => state.settings,
  (settings) => {
    try {
      localStorage.setItem('cursor-ai-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }
);

// Load settings from localStorage on initialization
const loadPersistedSettings = () => {
  try {
    const saved = localStorage.getItem('cursor-ai-settings');
    if (saved) {
      const parsedSettings = JSON.parse(saved);
      useAppStore.getState().updateSettings(parsedSettings);
    }
  } catch (error) {
    console.error('Failed to load persisted settings:', error);
  }
};

// Load settings when module is imported
loadPersistedSettings();