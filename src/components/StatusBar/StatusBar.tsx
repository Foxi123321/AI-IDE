import React from 'react';
import { GitBranch, Zap, Cpu, Wifi, Check } from 'lucide-react';
import { WorkspaceState } from '../../types';
import { PuterAIService } from '../../services/PuterAIService';

interface StatusBarProps {
  workspace: WorkspaceState;
  aiService: PuterAIService | null;
}

const StatusBar: React.FC<StatusBarProps> = ({ workspace, aiService }) => {
  const isConnected = window.puter?.auth.isSignedIn() || false;
  const hasActiveFile = !!workspace.activeFile;
  const fileCount = workspace.files.length;

  return (
    <div className="status-bar">
      {/* Left side - File info */}
      <div className="flex items-center gap-4">
        <div className="status-item">
          <span>
            {hasActiveFile 
              ? `${workspace.files.find(f => f.path === workspace.activeFile)?.name || 'Unknown'}`
              : 'No file selected'
            }
          </span>
        </div>
        
        {workspace.isIndexing && (
          <div className="status-item">
            <div className="animate-spin w-3 h-3 border border-editor-accent border-t-transparent rounded-full" />
            <span>Indexing... {Math.round(workspace.indexProgress)}%</span>
          </div>
        )}

        <div className="status-item">
          <span>{fileCount} files</span>
        </div>
      </div>

      {/* Right side - System status */}
      <div className="flex items-center gap-4">
        {/* Git status */}
        <div className="status-item">
          <GitBranch className="w-3 h-3" />
          <span>main</span>
        </div>

        {/* AI Status */}
        <div className="status-item">
          <Zap className="w-3 h-3 text-ai-primary" />
          <span>AI Ready</span>
          <div className={`w-2 h-2 rounded-full ml-1 ${aiService ? 'bg-editor-success' : 'bg-editor-error'}`} />
        </div>

        {/* Connection Status */}
        <div className="status-item">
          <Wifi className="w-3 h-3" />
          <span>{isConnected ? 'Connected' : 'Guest'}</span>
          <div className={`w-2 h-2 rounded-full ml-1 ${isConnected ? 'bg-editor-success' : 'bg-editor-warning'}`} />
        </div>

        {/* Performance */}
        <div className="status-item">
          <Cpu className="w-3 h-3" />
          <span>Normal</span>
        </div>

        {/* Selection info */}
        {hasActiveFile && (
          <div className="status-item">
            <span>Ln 1, Col 1</span>
          </div>
        )}

        {/* Language */}
        {hasActiveFile && (
          <div className="status-item">
            <span>TypeScript</span>
          </div>
        )}

        {/* Encoding */}
        <div className="status-item">
          <span>UTF-8</span>
        </div>

        {/* Auto Save */}
        <div className="status-item">
          <Check className="w-3 h-3 text-editor-success" />
          <span>Auto Save</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;