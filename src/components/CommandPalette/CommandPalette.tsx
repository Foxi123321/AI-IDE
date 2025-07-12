import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, FileText, MessageSquare, Settings, Zap } from 'lucide-react';
import { useAppStore } from '../../stores/AppStore';
import { PuterAIService } from '../../services/PuterAIService';

interface CommandPaletteProps {
  query: string;
  aiService: PuterAIService | null;
}

interface CommandItem {
  id: string;
  title: string;
  description: string;
  action: () => void;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  keywords: string[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ query, aiService }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredCommands, setFilteredCommands] = useState<CommandItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  
  const { 
    closeCommandPalette, 
    setCommandPaletteQuery, 
    setSidebarTab,
    toggleSidebar,
    togglePreview,
    createChatSession,
    setActiveChatSession,
    addFile,
    openFile,
    workspace,
    addNotification
  } = useAppStore();

  const commands: CommandItem[] = [
    {
      id: 'toggle-sidebar',
      title: 'Toggle Sidebar',
      description: 'Show or hide the sidebar',
      action: toggleSidebar,
      icon: FileText,
      category: 'View',
      keywords: ['sidebar', 'panel', 'toggle']
    },
    {
      id: 'toggle-preview',
      title: 'Toggle Preview',
      description: 'Show or hide the preview panel',
      action: togglePreview,
      icon: MessageSquare,
      category: 'View',
      keywords: ['preview', 'panel', 'toggle']
    },
    {
      id: 'open-files',
      title: 'Go to Files',
      description: 'Open the files tab',
      action: () => setSidebarTab('files'),
      icon: FileText,
      category: 'Navigation',
      keywords: ['files', 'explorer', 'navigation']
    },
    {
      id: 'open-chat',
      title: 'Go to Chat',
      description: 'Open the AI chat tab',
      action: () => setSidebarTab('chat'),
      icon: MessageSquare,
      category: 'Navigation',
      keywords: ['chat', 'ai', 'assistant']
    },
    {
      id: 'open-rules',
      title: 'Go to Rules',
      description: 'Open the rules tab',
      action: () => setSidebarTab('rules'),
      icon: Settings,
      category: 'Navigation',
      keywords: ['rules', 'settings', 'configuration']
    },
    {
      id: 'new-chat',
      title: 'New Chat Session',
      description: 'Create a new AI chat session',
      action: () => {
        const sessionId = createChatSession();
        setActiveChatSession(sessionId);
        setSidebarTab('chat');
      },
      icon: MessageSquare,
      category: 'AI',
      keywords: ['chat', 'new', 'ai', 'conversation']
    },
    {
      id: 'new-file',
      title: 'New File',
      description: 'Create a new file',
      action: () => {
        const fileName = prompt('Enter file name:') || 'untitled.txt';
        addFile({
          path: fileName,
          name: fileName,
          type: 'file',
          size: 0,
          lastModified: new Date(),
          content: '',
          language: getLanguageFromFilename(fileName)
        });
        openFile(fileName);
      },
      icon: FileText,
      category: 'File',
      keywords: ['file', 'new', 'create']
    },
    {
      id: 'ai-complete',
      title: 'AI Code Completion',
      description: 'Trigger AI code completion',
      action: () => {
        addNotification({
          id: 'ai-complete',
          type: 'info',
          title: 'AI Completion',
          message: 'Press Ctrl+K in the editor to trigger AI completion',
          timestamp: new Date(),
          isRead: false
        });
      },
      icon: Zap,
      category: 'AI',
      keywords: ['ai', 'completion', 'code', 'help']
    },
    {
      id: 'ai-explain',
      title: 'Explain Code',
      description: 'Ask AI to explain the current code',
      action: () => {
        if (workspace.activeFile) {
          const sessionId = createChatSession('Code Explanation');
          setActiveChatSession(sessionId);
          setSidebarTab('chat');
        }
      },
      icon: MessageSquare,
      category: 'AI',
      keywords: ['explain', 'code', 'ai', 'help']
    },
    {
      id: 'ai-debug',
      title: 'Debug Code',
      description: 'Ask AI to help debug the current code',
      action: () => {
        if (workspace.activeFile) {
          const sessionId = createChatSession('Debug Session');
          setActiveChatSession(sessionId);
          setSidebarTab('chat');
        }
      },
      icon: MessageSquare,
      category: 'AI',
      keywords: ['debug', 'error', 'ai', 'help']
    }
  ];

  // Filter commands based on query
  useEffect(() => {
    if (!query.trim()) {
      setFilteredCommands(commands);
    } else {
      const filtered = commands.filter(cmd => 
        cmd.title.toLowerCase().includes(query.toLowerCase()) ||
        cmd.description.toLowerCase().includes(query.toLowerCase()) ||
        cmd.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredCommands(filtered);
    }
    setSelectedIndex(0);
  }, [query]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          closeCommandPalette();
        }
      } else if (e.key === 'Escape') {
        closeCommandPalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCommands, selectedIndex, closeCommandPalette]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="bg-editor-surface border border-editor-border rounded-lg shadow-2xl w-full max-w-2xl mx-4 animate-scale-in">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-editor-border">
          <Command className="w-5 h-5 text-ai-primary" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setCommandPaletteQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-editor-text placeholder:text-editor-text-muted outline-none text-lg"
          />
          <kbd className="px-2 py-1 bg-editor-bg border border-editor-border rounded text-xs text-editor-text-muted">
            ESC
          </kbd>
        </div>

        {/* Commands List */}
        <div ref={listRef} className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-editor-text-muted">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p>No commands found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="p-2">
              {filteredCommands.map((cmd, index) => (
                <div
                  key={cmd.id}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors
                    ${index === selectedIndex 
                      ? 'bg-ai-primary/20 text-ai-primary' 
                      : 'text-editor-text hover:bg-editor-border/50'
                    }
                  `}
                  onClick={() => {
                    cmd.action();
                    closeCommandPalette();
                  }}
                >
                  <cmd.icon className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{cmd.title}</div>
                    <div className="text-xs text-editor-text-muted">{cmd.description}</div>
                  </div>
                  <div className="text-xs text-editor-text-muted bg-editor-bg px-2 py-1 rounded">
                    {cmd.category}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-editor-border text-xs text-editor-text-muted">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-editor-bg border border-editor-border rounded">↑</kbd>
              <kbd className="px-1 py-0.5 bg-editor-bg border border-editor-border rounded">↓</kbd>
              <span>navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-editor-bg border border-editor-border rounded">↵</kbd>
              <span>select</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span>Powered by</span>
            <span className="text-ai-primary">Puter.js</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function getLanguageFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin',
    'scala': 'scala',
    'sh': 'shell',
    'bash': 'shell',
    'json': 'json',
    'xml': 'xml',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'md': 'markdown',
    'yml': 'yaml',
    'yaml': 'yaml',
    'sql': 'sql',
  };
  return languageMap[ext || ''] || 'plaintext';
}

export default CommandPalette;