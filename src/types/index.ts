// Core AI Models available through Puter.js
export type AIModel = 
  | 'gpt-4o-mini'
  | 'gpt-4o'
  | 'o1'
  | 'o1-mini'
  | 'o1-pro'
  | 'o3'
  | 'o3-mini'
  | 'o4-mini'
  | 'gpt-4.1'
  | 'gpt-4.1-mini'
  | 'gpt-4.1-nano'
  | 'gpt-4.5-preview'
  | 'claude-sonnet-4'
  | 'claude-opus-4'
  | 'claude-3-7-sonnet'
  | 'claude-3-5-sonnet'
  | 'deepseek-chat'
  | 'deepseek-reasoner'
  | 'gemini-2.0-flash'
  | 'gemini-1.5-flash'
  | 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo'
  | 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo'
  | 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo'
  | 'mistral-large-latest'
  | 'pixtral-large-latest'
  | 'codestral-latest'
  | 'google/gemma-2-27b-it'
  | 'grok-beta';

// AI Interaction Modes
export type AIMode = 'ask' | 'chat' | 'compose' | 'agent' | 'inline' | 'preview';

// File System Types
export interface FileItem {
  path: string;
  name: string;
  type: 'file' | 'directory';
  content?: string;
  lastModified?: Date;
  size?: number;
  extension?: string;
}

export interface WorkspaceState {
  rootPath: string;
  files: FileItem[];
  openFiles: string[];
  activeFile: string | null;
  isIndexing: boolean;
  indexProgress: number;
}

// Editor Types
export interface EditorState {
  content: string;
  language: string;
  filePath: string;
  cursorPosition: { line: number; column: number };
  selections: Array<{ startLine: number; startColumn: number; endLine: number; endColumn: number }>;
  isModified: boolean;
}

export interface CompletionRequest {
  prompt: string;
  context: string;
  filePath: string;
  cursorPosition: { line: number; column: number };
  model: AIModel;
  mode: AIMode;
  includeProjectContext?: boolean;
}

export interface CompletionSuggestion {
  id: string;
  text: string;
  type: 'inline' | 'multiline' | 'replace';
  startPosition: { line: number; column: number };
  endPosition: { line: number; column: number };
  confidence: number;
  model: AIModel;
  timestamp: Date;
}

// Chat System
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: AIModel;
  metadata?: {
    filePath?: string;
    action?: string;
    error?: boolean;
  };
}

export interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastActivity: Date;
  workspace?: string;
}

// Tool System for Puter.js
export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required: string[];
    };
    strict?: boolean;
  };
}

export interface ToolCall {
  id: string;
  function: {
    name: string;
    arguments: string;
  };
}

export interface ToolResponse {
  tool_call_id: string;
  content: string;
}

// Rules and Configuration
export interface CursorRule {
  id: string;
  name: string;
  content: string;
  scope: 'global' | 'project' | 'file';
  filePath?: string;
  isActive: boolean;
  priority: number;
  lastModified: Date;
}

export interface ProjectConfig {
  name: string;
  rootPath: string;
  defaultModel: AIModel;
  rules: CursorRule[];
  excludePatterns: string[];
  includePatterns: string[];
  autoIndex: boolean;
  framework?: string;
  language?: string;
}

// UI State
export interface UIState {
  sidebar: {
    isOpen: boolean;
    activeTab: 'files' | 'chat' | 'history' | 'rules';
  };
  commandPalette: {
    isOpen: boolean;
    query: string;
  };
  notifications: Notification[];
  theme: 'dark' | 'light';
  layout: {
    panelSizes: number[];
    showPreview: boolean;
    showDiff: boolean;
  };
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

// Diff and Preview
export interface DiffChange {
  type: 'add' | 'remove' | 'modify';
  startLine: number;
  endLine: number;
  content: string;
  originalContent?: string;
}

export interface PreviewState {
  isVisible: boolean;
  changes: DiffChange[];
  originalContent: string;
  modifiedContent: string;
  filePath: string;
}

// Search and Indexing
export interface SearchResult {
  filePath: string;
  fileName: string;
  content: string;
  lineNumber: number;
  columnNumber: number;
  score: number;
  context: string;
}

export interface IndexedSymbol {
  name: string;
  type: 'function' | 'class' | 'variable' | 'interface' | 'type';
  filePath: string;
  line: number;
  column: number;
  scope: string;
  description?: string;
}

// Git Integration
export interface GitStatus {
  branch: string;
  hasUncommittedChanges: boolean;
  unstagedFiles: string[];
  stagedFiles: string[];
  commits: GitCommit[];
}

export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: Date;
  files: string[];
}

// Performance Monitoring
export interface PerformanceMetrics {
  aiResponseTime: number;
  fileIndexingTime: number;
  editorLatency: number;
  memoryUsage: number;
  totalRequests: number;
  successfulRequests: number;
  errors: number;
}

// Event System
export type AppEvent = 
  | { type: 'file:opened'; payload: { filePath: string } }
  | { type: 'file:saved'; payload: { filePath: string; content: string } }
  | { type: 'ai:completion:requested'; payload: CompletionRequest }
  | { type: 'ai:completion:received'; payload: CompletionSuggestion }
  | { type: 'chat:message:sent'; payload: { message: string; sessionId: string } }
  | { type: 'workspace:indexed'; payload: { fileCount: number; symbolCount: number } }
  | { type: 'error'; payload: { error: Error; context: string } };

// Settings
export interface AppSettings {
  general: {
    defaultModel: AIModel;
    autoSave: boolean;
    autoComplete: boolean;
    theme: 'dark' | 'light';
  };
  ai: {
    streamResponses: boolean;
    includeProjectContext: boolean;
    maxTokens: number;
    temperature: number;
    showConfidence: boolean;
  };
  editor: {
    fontSize: number;
    fontFamily: string;
    tabSize: number;
    wordWrap: boolean;
    minimap: boolean;
    lineNumbers: boolean;
  };
  workspace: {
    autoIndex: boolean;
    excludePatterns: string[];
    maxFileSize: number;
    maxFiles: number;
  };
}

// Puter.js Integration Types
declare global {
  interface Window {
    puter: {
      ai: {
        chat: (
          prompt: string | Array<{ role: string; content: string | Array<{ type: string; text?: string; puter_path?: string }> }>,
          options?: {
            model?: string;
            stream?: boolean;
            max_tokens?: number;
            temperature?: number;
            tools?: ToolDefinition[];
          }
        ) => Promise<any>;
        txt2img: (prompt: string, testMode?: boolean) => Promise<HTMLImageElement>;
        img2txt: (imageUrl: string, prompt?: string) => Promise<string>;
        txt2speech: (text: string, options?: any) => Promise<any>;
      };
      fs: {
        write: (path: string, content: string | Blob) => Promise<{ path: string }>;
        read: (path: string) => Promise<Blob>;
        mkdir: (path: string) => Promise<{ path: string }>;
        readdir: (path: string) => Promise<any[]>;
        rename: (oldPath: string, newPath: string) => Promise<void>;
        copy: (srcPath: string, destPath: string) => Promise<void>;
        move: (srcPath: string, destPath: string) => Promise<void>;
        stat: (path: string) => Promise<any>;
        delete: (path: string) => Promise<void>;
        upload: (file: File, path?: string) => Promise<{ path: string }>;
      };
      auth: {
        signIn: () => Promise<any>;
        signOut: () => Promise<void>;
        isSignedIn: () => boolean;
        getUser: () => Promise<any>;
      };
      kv: {
        set: (key: string, value: any) => Promise<void>;
        get: (key: string) => Promise<any>;
        del: (key: string) => Promise<void>;
        list: () => Promise<string[]>;
        flush: () => Promise<void>;
      };
      print: (message: string) => void;
      randName: () => string;
    };
  }
}