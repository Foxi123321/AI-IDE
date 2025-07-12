import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, Zap, FileText, MessageSquare, Settings, X } from 'lucide-react';
import { PuterAIService } from '../../services/PuterAIService';

interface CommandPaletteProps {
  query: string;
  aiService: PuterAIService | null;
}

interface Command {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'file' | 'ai' | 'view' | 'settings';
  action: () => void;
  shortcut?: string;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ query, aiService }) => {
  const [searchQuery, setSearchQuery] = useState(query);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    {
      id: 'new-file',
      title: 'New File',
      description: 'Create a new file',
      icon: FileText,
      category: 'file',
      action: () => console.log('New file'),
      shortcut: 'Ctrl+N'
    },
    {
      id: 'open-file',
      title: 'Open File',
      description: 'Open an existing file',
      icon: FileText,
      category: 'file',
      action: () => console.log('Open file'),
      shortcut: 'Ctrl+O'
    },
    {
      id: 'ai-chat',
      title: 'Open AI Chat',
      description: 'Start a conversation with AI',
      icon: MessageSquare,
      category: 'ai',
      action: () => console.log('Open AI chat'),
      shortcut: 'Ctrl+I'
    },
    {
      id: 'ai-completion',
      title: 'Trigger AI Completion',
      description: 'Get AI code suggestions',
      icon: Zap,
      category: 'ai',
      action: () => console.log('AI completion'),
      shortcut: 'Ctrl+K'
    },
    {
      id: 'ai-explain',
      title: 'Explain Code',
      description: 'Ask AI to explain selected code',
      icon: Zap,
      category: 'ai',
      action: () => console.log('Explain code'),
    },
    {
      id: 'ai-refactor',
      title: 'Refactor Code',
      description: 'Ask AI to refactor selected code',
      icon: Zap,
      category: 'ai',
      action: () => console.log('Refactor code'),
    },
    {
      id: 'toggle-sidebar',
      title: 'Toggle Sidebar',
      description: 'Show or hide the sidebar',
      icon: Command,
      category: 'view',
      action: () => console.log('Toggle sidebar'),
      shortcut: 'Ctrl+B'
    },
    {
      id: 'settings',
      title: 'Open Settings',
      description: 'Configure application settings',
      icon: Settings,
      category: 'settings',
      action: () => console.log('Open settings'),
      shortcut: 'Ctrl+,'
    }
  ];

  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    command.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        handleClose();
      }
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  const handleClose = () => {
    // TODO: Close command palette
    console.log('Close command palette');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'file': return 'text-blue-400';
      case 'ai': return 'text-ai-primary';
      case 'view': return 'text-green-400';
      case 'settings': return 'text-yellow-400';
      default: return 'text-editor-text-muted';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="bg-editor-surface border border-editor-border rounded-lg shadow-2xl w-full max-w-lg mx-4 animate-scale-in">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-editor-border">
          <Search className="w-5 h-5 text-editor-text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-editor-text placeholder:text-editor-text-muted focus:outline-none"
          />
          <button
            onClick={handleClose}
            className="p-1 hover:bg-editor-border rounded text-editor-text-muted hover:text-editor-text"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Commands */}
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-editor-text-muted">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No commands found</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="py-2">
              {filteredCommands.map((command, index) => (
                <div
                  key={command.id}
                  className={`command-item ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => {
                    command.action();
                    handleClose();
                  }}
                >
                  <div className="flex items-center gap-3">
                    <command.icon className={`w-4 h-4 ${getCategoryColor(command.category)}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-editor-text">{command.title}</div>
                      <div className="text-sm text-editor-text-muted truncate">{command.description}</div>
                    </div>
                    {command.shortcut && (
                      <div className="text-xs text-editor-text-muted bg-editor-border px-2 py-1 rounded">
                        {command.shortcut}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-editor-border bg-editor-bg text-xs text-editor-text-muted">
          <div className="flex items-center justify-between">
            <span>Use ↑↓ to navigate, Enter to select, Esc to close</span>
            <span>Powered by Puter.js</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;