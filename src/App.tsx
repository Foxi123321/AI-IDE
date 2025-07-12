import React, { useEffect, useState } from 'react';
import { Panels, PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { 
  FileText, 
  MessageSquare, 
  Settings, 
  Bot, 
  Search,
  Command,
  GitBranch,
  AlertCircle
} from 'lucide-react';

// Import components (will be created next)
import Sidebar from './components/Sidebar/Sidebar';
import CodeEditor from './components/Editor/CodeEditor';
import ChatPanel from './components/Chat/ChatPanel';
import StatusBar from './components/StatusBar/StatusBar';
import CommandPalette from './components/CommandPalette/CommandPalette';
import NotificationCenter from './components/Notifications/NotificationCenter';

// Import stores and services
import { useAppStore } from './stores/AppStore';
import { PuterAIService } from './services/PuterAIService';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiService, setAiService] = useState<PuterAIService | null>(null);

  const {
    ui,
    workspace,
    toggleSidebar,
    openCommandPalette,
    addNotification
  } = useAppStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize Puter AI Service
        const service = PuterAIService.getInstance();
        setAiService(service);

        // Check authentication
        if (window.puter?.auth.isSignedIn()) {
          addNotification({
            id: 'auth-success',
            type: 'success',
            title: 'Authenticated',
            message: 'Connected to Puter.js successfully',
            timestamp: new Date(),
            isRead: false
          });
        } else {
          addNotification({
            id: 'auth-warning',
            type: 'warning',
            title: 'Not Authenticated',
            message: 'Some features may be limited without authentication',
            timestamp: new Date(),
            isRead: false
          });
        }

        setIsLoading(false);
      } catch (err) {
        console.error('App initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [addNotification]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboardShortcuts = (e: KeyboardEvent) => {
      // Command palette: Cmd+Shift+P or Ctrl+Shift+P
      if (e.key === 'P' && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        openCommandPalette();
      }

      // Toggle sidebar: Cmd+B or Ctrl+B
      if (e.key === 'b' && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        e.preventDefault();
        toggleSidebar();
      }

      // Quick AI chat: Cmd+I or Ctrl+I
      if (e.key === 'i' && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        e.preventDefault();
        // Will implement quick AI chat
      }
    };

    document.addEventListener('keydown', handleKeyboardShortcuts);
    return () => document.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [openCommandPalette, toggleSidebar]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-editor-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ai-primary mx-auto mb-4"></div>
          <p className="text-editor-text-muted">Initializing Cursor AI Clone...</p>
          <p className="text-xs text-editor-text-muted mt-2">Powered by Puter.js</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-editor-bg">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-editor-error mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-editor-text mb-2">
            Initialization Failed
          </h2>
          <p className="text-editor-text-muted mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-editor-bg text-editor-text overflow-hidden">
      {/* Main Layout */}
      <div className="flex h-full">
        {/* Sidebar */}
        <div className={`
          transition-all duration-300 ease-in-out
          ${ui.sidebar.isOpen ? 'w-80' : 'w-0'}
          border-r border-editor-border
          bg-editor-surface
        `}>
          {ui.sidebar.isOpen && (
            <Sidebar 
              activeTab={ui.sidebar.activeTab}
              workspace={workspace}
              aiService={aiService}
            />
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Editor and Chat Panels */}
          <div className="flex-1 overflow-hidden">
            <PanelGroup direction="horizontal">
              {/* Code Editor Panel */}
              <Panel defaultSize={ui.layout.showPreview ? 60 : 100} minSize={30}>
                <CodeEditor 
                  workspace={workspace}
                  aiService={aiService}
                />
              </Panel>

              {/* Resize Handle */}
              {ui.layout.showPreview && (
                <PanelResizeHandle className="w-1 bg-editor-border hover:bg-editor-accent transition-colors" />
              )}

              {/* Chat/Preview Panel */}
              {ui.layout.showPreview && (
                <Panel defaultSize={40} minSize={25}>
                  <div className="h-full bg-editor-surface border-l border-editor-border">
                    <ChatPanel 
                      aiService={aiService}
                      workspace={workspace}
                    />
                  </div>
                </Panel>
              )}
            </PanelGroup>
          </div>

          {/* Status Bar */}
          <StatusBar 
            workspace={workspace}
            aiService={aiService}
          />
        </div>
      </div>

      {/* Command Palette */}
      {ui.commandPalette.isOpen && (
        <CommandPalette 
          query={ui.commandPalette.query}
          aiService={aiService}
        />
      )}

      {/* Notification Center */}
      <NotificationCenter notifications={ui.notifications} />

      {/* Welcome Modal for new users */}
      <WelcomeModal />
    </div>
  );
};

// Welcome Modal Component
const WelcomeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(!window.puter?.auth.isSignedIn());

  const handleSignIn = async () => {
    try {
      await window.puter.auth.signIn();
      setIsOpen(false);
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const handleContinueGuest = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-editor-surface border border-editor-border rounded-lg shadow-2xl max-w-md w-full mx-4 animate-scale-in">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-ai-primary to-ai-secondary rounded-full flex items-center justify-center">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gradient mb-2">
              Welcome to Cursor AI Clone
            </h2>
            <p className="text-editor-text-muted">
              Powered by Puter.js - Experience AI-assisted coding like never before
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-ai-primary rounded-full"></div>
              <span>AI-powered code completion with multiple models</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-ai-primary rounded-full"></div>
              <span>Intelligent chat assistant for coding help</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-ai-primary rounded-full"></div>
              <span>Project-wide analysis and refactoring</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-ai-primary rounded-full"></div>
              <span>Cloud storage and sync with Puter.js</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSignIn}
              className="w-full btn-primary py-3 text-base font-medium"
            >
              Sign in with Puter
            </button>
            <button
              onClick={handleContinueGuest}
              className="w-full btn-secondary py-3 text-base"
            >
              Continue as Guest
            </button>
          </div>

          <p className="text-xs text-editor-text-muted text-center mt-4">
            Signing in enables cloud features and removes limitations
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;