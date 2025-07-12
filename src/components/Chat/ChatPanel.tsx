import React, { useState, useEffect } from 'react';
import { Send, Bot, User, Zap, Trash2, Plus } from 'lucide-react';
import { WorkspaceState, ChatMessage } from '../../types';
import { PuterAIService } from '../../services/PuterAIService';
import { useAppStore } from '../../stores/AppStore';

interface ChatPanelProps {
  aiService: PuterAIService | null;
  workspace: WorkspaceState;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ aiService, workspace }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    chatSessions, 
    activeChatSession, 
    createChatSession, 
    addChatMessage, 
    deleteChatSession,
    setActiveChatSession
  } = useAppStore();

  const currentSession = chatSessions.find(s => s.id === activeChatSession);

  // Create initial chat session if none exists
  useEffect(() => {
    if (chatSessions.length === 0) {
      createChatSession('New Chat');
    }
  }, [chatSessions.length, createChatSession]);

  const handleSendMessage = async () => {
    if (!message.trim() || !aiService || !activeChatSession) return;

    // Add user message
    addChatMessage(activeChatSession, {
      role: 'user',
      content: message,
      metadata: { 
        filePath: workspace.activeFile || undefined 
      }
    });

    const userMessage = message;
    setMessage('');
    setIsLoading(true);

    try {
      // Get context from current file if available
      const currentFile = workspace.files.find(f => f.path === workspace.activeFile);
      const context = currentFile?.content || '';
      
      // Build context with file info
      const contextMessage = currentFile ? 
        `Current file: ${currentFile.name}\n\`\`\`\n${context}\n\`\`\`\n\nUser question: ${userMessage}` : 
        userMessage;

      // Get AI response
      const aiResponse = await aiService.askQuestion(contextMessage, context, 'gpt-4o-mini');
      
      // Add AI response
      addChatMessage(activeChatSession, {
        role: 'assistant',
        content: aiResponse,
        model: 'gpt-4o-mini',
        metadata: { 
          filePath: workspace.activeFile || undefined 
        }
      });

    } catch (error) {
      console.error('Chat error:', error);
      // Add error message
      addChatMessage(activeChatSession, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        metadata: { 
          error: true,
          filePath: workspace.activeFile || undefined 
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    const sessionId = createChatSession();
    setActiveChatSession(sessionId);
  };

  const handleDeleteChat = () => {
    if (activeChatSession) {
      deleteChatSession(activeChatSession);
    }
  };

  return (
    <div className="h-full flex flex-col bg-editor-surface">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-editor-border">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-ai-primary" />
          <h2 className="font-semibold text-editor-text">
            {currentSession?.name || 'AI Assistant'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNewChat}
            className="p-1 hover:bg-editor-border rounded text-editor-text-muted hover:text-editor-text"
            title="New Chat"
          >
            <Plus className="w-4 h-4" />
          </button>
          {currentSession && (
            <button
              onClick={handleDeleteChat}
              className="p-1 hover:bg-editor-border rounded text-editor-text-muted hover:text-red-400"
              title="Delete Chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center gap-1 text-xs text-editor-text-muted">
            <Zap className="w-3 h-3" />
            <span>Puter.js</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!currentSession || currentSession.messages.length === 0 ? (
          <div className="text-center text-editor-text-muted py-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-ai-primary opacity-50" />
            <h3 className="font-medium mb-2">Start a conversation</h3>
            <p className="text-sm">Ask me anything about your code!</p>
            <div className="mt-4 space-y-2 text-xs">
              <div className="bg-editor-bg rounded p-2">
                💡 "Explain this function"
              </div>
              <div className="bg-editor-bg rounded p-2">
                🐛 "Help me debug this error"
              </div>
              <div className="bg-editor-bg rounded p-2">
                ⚡ "Refactor this component"
              </div>
            </div>
          </div>
        ) : (
          currentSession.messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.role}`}>
              <div className="flex items-start gap-3">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                  ${msg.role === 'user' 
                    ? 'bg-editor-accent text-white' 
                    : 'bg-ai-primary text-white'
                  }
                `}>
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {msg.role === 'user' ? 'You' : 'AI Assistant'}
                    </span>
                    <span className="text-xs text-editor-text-muted">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                    {msg.model && (
                      <span className="text-xs text-ai-accent">
                        {msg.model}
                      </span>
                    )}
                  </div>
                  <div className="prose prose-sm max-w-none text-editor-text">
                    {msg.content.split('\n').map((line, i) => (
                      <div key={i} className="mb-1">
                        {line.startsWith('•') ? (
                          <div className="flex items-start gap-2">
                            <span className="text-ai-accent">•</span>
                            <span>{line.substring(1).trim()}</span>
                          </div>
                        ) : line.startsWith('```') ? (
                          <div className="bg-editor-bg rounded p-2 font-mono text-sm">
                            {line.replace(/```/g, '')}
                          </div>
                        ) : (
                          line
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="chat-message assistant">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-ai-primary flex items-center justify-center">
                <Bot className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="text-editor-text-muted text-sm">
                  <span className="animate-pulse">AI is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-editor-border">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your code..."
              className="
                w-full resize-none border border-editor-border rounded-lg px-3 py-2 
                bg-editor-bg text-editor-text placeholder:text-editor-text-muted
                focus:outline-none focus:ring-1 focus:ring-ai-primary focus:border-ai-primary
                text-sm max-h-32
              "
              rows={1}
              style={{ 
                minHeight: '36px',
                height: Math.min(Math.max(36, message.split('\n').length * 20), 128) + 'px'
              }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            className="
              px-3 py-2 bg-ai-primary hover:bg-ai-secondary text-white rounded-lg
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200 flex-shrink-0
            "
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-editor-text-muted">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>
            {workspace.activeFile && (
              <span className="text-ai-accent">Context: {workspace.activeFile}</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;