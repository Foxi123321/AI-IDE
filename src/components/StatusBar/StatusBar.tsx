import React from 'react';
import { 
  GitBranch, 
  Database, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Bot,
  FileText,
  Clock
} from 'lucide-react';
import { WorkspaceState } from '../../types';
import { PuterAIService } from '../../services/PuterAIService';
import { useAppStore } from '../../stores/AppStore';

interface StatusBarProps {
  workspace: WorkspaceState;
  aiService: PuterAIService | null;
}

const StatusBar: React.FC<StatusBarProps> = ({ workspace, aiService }) => {
  const { settings, lastAIResponse, requestsCount } = useAppStore();

  const getAIStatus = () => {
    if (!aiService) return 'disconnected';
    if (window.puter?.auth?.isSignedIn()) return 'connected';
    return 'guest';
  };

  const aiStatus = getAIStatus();
  const hasActiveFile = workspace.activeFile !== null;
  const currentFile = workspace.files.find(f => f.path === workspace.activeFile);

  return (
    <div className="h-6 bg-editor-surface border-t border-editor-border flex items-center justify-between px-4 text-xs">
      {/* Left Side - Workspace Info */}
      <div className="flex items-center gap-4">
        {/* Workspace Root */}
        <div className="flex items-center gap-1 text-editor-text-muted">
          <Database className="w-3 h-3" />
          <span>{workspace.rootPath || 'No workspace'}</span>
        </div>

        {/* File Count */}
        <div className="flex items-center gap-1 text-editor-text-muted">
          <FileText className="w-3 h-3" />
          <span>{workspace.files.length} files</span>
        </div>

        {/* Current File Info */}
        {hasActiveFile && currentFile && (
          <div className="flex items-center gap-1 text-editor-text">
            <span>•</span>
            <span>{currentFile.name}</span>
            {currentFile.extension && (
              <span className="text-editor-text-muted">
                ({currentFile.extension})
              </span>
            )}
          </div>
        )}

        {/* Indexing Status */}
        {workspace.isIndexing && (
          <div className="flex items-center gap-1 text-ai-primary">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Indexing {Math.round(workspace.indexProgress)}%</span>
          </div>
        )}
      </div>

      {/* Right Side - AI & System Status */}
      <div className="flex items-center gap-4">
        {/* AI Performance Stats */}
        <div className="flex items-center gap-3 text-editor-text-muted">
          <div className="flex items-center gap-1">
            <Bot className="w-3 h-3" />
            <span>{requestsCount} requests</span>
          </div>
          {lastAIResponse > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{lastAIResponse}ms</span>
            </div>
          )}
        </div>

        {/* AI Model */}
        <div className="flex items-center gap-1 text-editor-text-muted">
          <Zap className="w-3 h-3" />
          <span>{settings.general.defaultModel}</span>
        </div>

        {/* Git Status (placeholder) */}
        <div className="flex items-center gap-1 text-editor-text-muted">
          <GitBranch className="w-3 h-3" />
          <span>main</span>
        </div>

        {/* AI Connection Status */}
        <div className="flex items-center gap-1">
          {aiStatus === 'connected' ? (
            <>
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span className="text-green-400">Connected</span>
            </>
          ) : aiStatus === 'guest' ? (
            <>
              <AlertCircle className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-400">Guest Mode</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3 text-red-400" />
              <span className="text-red-400">Disconnected</span>
            </>
          )}
        </div>

        {/* Puter.js Badge */}
        <div className="flex items-center gap-1 text-ai-primary">
          <div className="w-2 h-2 bg-ai-primary rounded-full"></div>
          <span>Puter.js</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;