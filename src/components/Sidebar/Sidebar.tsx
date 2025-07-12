import React from 'react';
import { FileText, MessageSquare, History, Settings } from 'lucide-react';
import { WorkspaceState } from '../../types';
import { PuterAIService } from '../../services/PuterAIService';

interface SidebarProps {
  activeTab: 'files' | 'chat' | 'history' | 'rules';
  workspace: WorkspaceState;
  aiService: PuterAIService | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, workspace, aiService }) => {
  return (
    <div className="h-full flex flex-col bg-editor-surface">
      {/* Tab Navigation */}
      <div className="flex border-b border-editor-border">
        <TabButton 
          icon={FileText} 
          label="Files" 
          isActive={activeTab === 'files'} 
          onClick={() => {}} 
        />
        <TabButton 
          icon={MessageSquare} 
          label="Chat" 
          isActive={activeTab === 'chat'} 
          onClick={() => {}} 
        />
        <TabButton 
          icon={History} 
          label="History" 
          isActive={activeTab === 'history'} 
          onClick={() => {}} 
        />
        <TabButton 
          icon={Settings} 
          label="Rules" 
          isActive={activeTab === 'rules'} 
          onClick={() => {}} 
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
  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-editor-text mb-3">Files</h3>
      {workspace.files.length === 0 ? (
        <div className="text-center text-editor-text-muted py-8">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No files yet</p>
          <p className="text-xs mt-1">Upload files or create new ones to get started</p>
        </div>
      ) : (
        <div className="space-y-1">
          {workspace.files.map((file) => (
            <div key={file.path} className="file-tree-item">
              <FileText className="w-4 h-4" />
              <span className="ml-2 text-sm">{file.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ChatTab: React.FC = () => {
  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-editor-text mb-3">AI Chat</h3>
      <div className="text-center text-editor-text-muted py-8">
        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Start a conversation</p>
        <p className="text-xs mt-1">Ask questions about your code</p>
      </div>
    </div>
  );
};

const HistoryTab: React.FC = () => {
  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-editor-text mb-3">History</h3>
      <div className="text-center text-editor-text-muted py-8">
        <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No history yet</p>
        <p className="text-xs mt-1">Your AI interactions will appear here</p>
      </div>
    </div>
  );
};

const RulesTab: React.FC = () => {
  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-editor-text mb-3">AI Rules</h3>
      <div className="text-center text-editor-text-muted py-8">
        <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No rules configured</p>
        <p className="text-xs mt-1">Create .cursorrules to customize AI behavior</p>
      </div>
    </div>
  );
};

export default Sidebar;