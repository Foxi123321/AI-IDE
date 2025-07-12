import React, { useState } from 'react';
import { Send, Bot, User, Zap } from 'lucide-react';
import { WorkspaceState } from '../../types';
import { PuterAIService } from '../../services/PuterAIService';

interface ChatPanelProps {
  aiService: PuterAIService | null;
  workspace: WorkspaceState;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ aiService, workspace }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim() || !aiService) return;

    const userMessage = {
      id: `msg_${Date.now()}`,
      role: 'user' as const,
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // For now, just simulate an AI response
      // TODO: Use aiService.askQuestion() when the service is properly initialized
      const aiResponse = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant' as const,
        content: `I understand you want to "${message}". I'm powered by Puter.js and can help you with:

• Code completion and suggestions
• Debugging and error analysis  
• Refactoring and optimization
• Generating tests and documentation
• Explaining complex code patterns

Try asking me about your code or request specific programming help!`,
        timestamp: new Date()
      };

      // Simulate typing delay
      setTimeout(() => {
        setMessages(prev => [...prev, aiResponse]);
        setIsLoading(false);
      }, 1000);

    } catch (error) {
      console.error('Chat error:', error);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-editor-surface">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-editor-border">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-ai-primary" />
          <h2 className="font-semibold text-editor-text">AI Assistant</h2>
        </div>
        <div className="flex items-center gap-1 text-xs text-editor-text-muted">
          <Zap className="w-3 h-3" />
          <span>Powered by Puter.js</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
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
        )}

        {messages.map((msg) => (
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
                </div>
                <div className="prose prose-sm max-w-none text-editor-text">
                  {msg.content.split('\n').map((line, i) => (
                    <div key={i} className="mb-1">
                      {line.startsWith('•') ? (
                        <div className="flex items-start gap-2">
                          <span className="text-ai-accent">•</span>
                          <span>{line.substring(1).trim()}</span>
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
        ))}

        {isLoading && (
          <div className="chat-message assistant">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-ai-primary flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="ai-thinking">Thinking</div>
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
          <span>Powered by Puter.js AI</span>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;