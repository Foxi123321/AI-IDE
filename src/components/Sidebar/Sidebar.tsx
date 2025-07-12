import React from 'react';
import { FileText, MessageSquare, History, Settings, Upload, Plus, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import { WorkspaceState } from '../../types';
import { PuterAIService } from '../../services/PuterAIService';
import { useAppStore } from '../../stores/AppStore';

interface SidebarProps {
  activeTab: 'files' | 'chat' | 'history' | 'rules';
  workspace: WorkspaceState;
  aiService: PuterAIService | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, workspace, aiService }) => {
  const { setSidebarTab } = useAppStore();

  return (
    <div className="h-full flex flex-col bg-editor-surface">
      {/* Tab Navigation */}
      <div className="flex border-b border-editor-border">
        <TabButton 
          icon={FileText} 
          label="Files" 
          isActive={activeTab === 'files'} 
          onClick={() => setSidebarTab('files')} 
        />
        <TabButton 
          icon={MessageSquare} 
          label="Chat" 
          isActive={activeTab === 'chat'} 
          onClick={() => setSidebarTab('chat')} 
        />
        <TabButton 
          icon={History} 
          label="History" 
          isActive={activeTab === 'history'} 
          onClick={() => setSidebarTab('history')} 
        />
        <TabButton 
          icon={Settings} 
          label="Rules" 
          isActive={activeTab === 'rules'} 
          onClick={() => setSidebarTab('rules')} 
        />
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'files' && <FilesTab workspace={workspace} />}
        {activeTab === 'chat' && <ChatTab />}
        {activeTab === 'history' && <HistoryTab />}
        {activeTab === 'rules' && <RulesTab />}
      </div>
    </div>
  );
};

interface TabButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ icon: Icon, label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 p-3 flex flex-col items-center gap-1 text-xs
        ${isActive 
          ? 'bg-editor-accent/10 text-editor-accent border-b-2 border-editor-accent' 
          : 'text-editor-text-muted hover:text-editor-text hover:bg-editor-border/50'
        }
        transition-colors duration-200
      `}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
};

const FilesTab: React.FC<{ workspace: WorkspaceState }> = ({ workspace }) => {
  const { openFile, addFile, setWorkspaceRoot } = useAppStore();
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const content = await file.text();
      
      addFile({
        path: file.name,
        name: file.name,
        type: 'file',
        size: file.size,
        lastModified: new Date(file.lastModified),
        content: content,
        language: getLanguageFromFilename(file.name)
      });
    }
  };

  const handleCreateNewFile = () => {
    const fileName = prompt('Enter file name:');
    if (fileName) {
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
    }
  };

  const handleOpenFolder = async () => {
    try {
      if (window.puter && window.puter.fs) {
        // Use browser's directory picker as fallback
        if ('showDirectoryPicker' in window) {
          const dirHandle = await (window as any).showDirectoryPicker();
          if (dirHandle) {
            setWorkspaceRoot(dirHandle.name);
          }
        } else {
          // Fallback to simple alert
          alert('Please drag and drop files or use the file upload button');
        }
      }
    } catch (error) {
      console.error('Failed to open folder:', error);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-editor-text">Files</h3>
        <div className="flex gap-2">
          <button
            onClick={handleCreateNewFile}
            className="p-1 hover:bg-editor-border rounded text-editor-text-muted hover:text-editor-text"
            title="New File"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenFolder}
            className="p-1 hover:bg-editor-border rounded text-editor-text-muted hover:text-editor-text"
            title="Open Folder"
          >
            <Folder className="w-4 h-4" />
          </button>
          <label
            className="p-1 hover:bg-editor-border rounded text-editor-text-muted hover:text-editor-text cursor-pointer"
            title="Upload Files"
          >
            <Upload className="w-4 h-4" />
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {workspace.files.length === 0 ? (
        <div className="text-center text-editor-text-muted py-8">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No files yet</p>
          <p className="text-xs mt-1">Upload files or create new ones to get started</p>
        </div>
      ) : (
        <div className="space-y-1">
          {workspace.files.map((file) => (
            <div 
              key={file.path} 
              className={`
                flex items-center p-2 rounded hover:bg-editor-border cursor-pointer
                ${workspace.activeFile === file.path ? 'bg-editor-accent/20 text-editor-accent' : 'text-editor-text'}
              `}
              onClick={() => openFile(file.path)}
            >
              <FileText className="w-4 h-4 mr-2" />
              <span className="text-sm flex-1">{file.name}</span>
              <span className="text-xs text-editor-text-muted">
                {file.size ? (file.size < 1024 ? `${file.size}B` : `${Math.round(file.size / 1024)}KB`) : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ChatTab: React.FC = () => {
  const { chatSessions, createChatSession, setActiveChatSession, activeChatSession } = useAppStore();

  const handleCreateNewChat = () => {
    const sessionId = createChatSession();
    setActiveChatSession(sessionId);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-editor-text">AI Chat</h3>
        <button
          onClick={handleCreateNewChat}
          className="p-1 hover:bg-editor-border rounded text-editor-text-muted hover:text-editor-text"
          title="New Chat"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {chatSessions.length === 0 ? (
        <div className="text-center text-editor-text-muted py-8">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Start a conversation</p>
          <p className="text-xs mt-1">Ask questions about your code</p>
        </div>
      ) : (
        <div className="space-y-2">
          {chatSessions.map((session) => (
            <div
              key={session.id}
              className={`
                p-3 rounded border cursor-pointer transition-colors
                ${activeChatSession === session.id 
                  ? 'bg-editor-accent/20 border-editor-accent text-editor-accent' 
                  : 'border-editor-border hover:bg-editor-border/50 text-editor-text'
                }
              `}
              onClick={() => setActiveChatSession(session.id)}
            >
              <div className="font-medium text-sm">{session.name}</div>
              <div className="text-xs text-editor-text-muted mt-1">
                {session.messages.length} messages
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const HistoryTab: React.FC = () => {
  const { chatSessions } = useAppStore();

  const allMessages = chatSessions.flatMap(session => 
    session.messages.map(msg => ({ ...msg, sessionName: session.name }))
  ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-editor-text mb-3">History</h3>
      {allMessages.length === 0 ? (
        <div className="text-center text-editor-text-muted py-8">
          <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No history yet</p>
          <p className="text-xs mt-1">Your AI interactions will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allMessages.slice(0, 10).map((message) => (
            <div key={message.id} className="border-l-2 border-editor-border pl-3">
              <div className="text-xs text-editor-text-muted mb-1">
                {message.sessionName} • {message.timestamp.toLocaleTimeString()}
              </div>
              <div className="text-sm text-editor-text line-clamp-3">
                {message.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RulesTab: React.FC = () => {
  const { rules, addRule, toggleRule, deleteRule } = useAppStore();

  const handleCreateRule = () => {
    const name = prompt('Enter rule name:');
    if (name) {
      const content = prompt('Enter rule content:');
      if (content) {
        addRule({
          name,
          content,
          isActive: true,
          priority: 1,
          scope: 'global'
        });
      }
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-editor-text">AI Rules</h3>
        <button
          onClick={handleCreateRule}
          className="p-1 hover:bg-editor-border rounded text-editor-text-muted hover:text-editor-text"
          title="New Rule"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="text-center text-editor-text-muted py-8">
          <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No rules configured</p>
          <p className="text-xs mt-1">Create .cursorrules to customize AI behavior</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="p-3 rounded border border-editor-border"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-sm text-editor-text">{rule.name}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`
                      text-xs px-2 py-1 rounded
                      ${rule.isActive 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                      }
                    `}
                  >
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="text-xs text-editor-text-muted line-clamp-2">
                {rule.content}
              </div>
            </div>
          ))}
        </div>
      )}
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

export default Sidebar;