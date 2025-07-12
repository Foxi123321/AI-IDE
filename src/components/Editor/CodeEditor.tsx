import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { WorkspaceState } from '../../types';
import { PuterAIService } from '../../services/PuterAIService';
import { useAppStore } from '../../stores/AppStore';
import { FileText, Plus, X } from 'lucide-react';

interface CodeEditorProps {
  workspace: WorkspaceState;
  aiService: PuterAIService | null;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ workspace, aiService }) => {
  const [editorContent, setEditorContent] = useState('');
  const editorRef = useRef<any>(null);
  const { setActiveFile, closeFile, addFile, updateFile, updateEditorContent } = useAppStore();
  
  const currentFile = workspace.files.find(f => f.path === workspace.activeFile);
  
  useEffect(() => {
    if (currentFile?.content) {
      setEditorContent(currentFile.content);
    } else {
      setEditorContent(getWelcomeContent());
    }
  }, [currentFile]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Configure Monaco for dark theme
    monaco.editor.defineTheme('cursor-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#e6edf3',
        'editorLineNumber.foreground': '#7d8590',
        'editor.selectionBackground': '#58a6ff30',
        'editor.inactiveSelectionBackground': '#58a6ff20',
      }
    });
    
    monaco.editor.setTheme('cursor-dark');
    
    // Add AI completion keybindings
    editor.addCommand(monaco.KeyMod.Ctrl | monaco.KeyCode.KeyK, () => {
      handleAICompletion();
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    const content = value || '';
    setEditorContent(content);
    updateEditorContent(content);
    
    // Update file content in workspace
    if (currentFile) {
      updateFile(currentFile.path, { content });
    }
  };

  const handleAICompletion = async () => {
    if (!aiService || !editorRef.current) return;
    
    try {
      const editor = editorRef.current;
      const model = editor.getModel();
      const position = editor.getPosition();
      const fullContent = model.getValue();
      const textBeforeCursor = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      });
      
      // Get AI completion
      const completion = await aiService.getInlineCompletion({
        prompt: textBeforeCursor,
        context: fullContent,
        filePath: currentFile?.path || 'untitled.ts',
        cursorPosition: { line: position.lineNumber - 1, column: position.column - 1 },
        model: 'gpt-4o-mini',
        mode: 'inline'
      });
      
      if (completion) {
        // Insert the completion
        const range = {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        };
        
        editor.executeEdits('ai-completion', [{
          range: range,
          text: completion.text
        }]);
      }
    } catch (error) {
      console.error('AI completion failed:', error);
    }
  };

  const handleTabClick = (filePath: string) => {
    setActiveFile(filePath);
  };

  const handleTabClose = (filePath: string, event: React.MouseEvent) => {
    event.stopPropagation();
    closeFile(filePath);
  };

  const handleCreateNewFile = () => {
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
    setActiveFile(fileName);
  };

  const getLanguageFromFilename = (filename: string): string => {
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
  };

  return (
    <div className="h-full flex flex-col bg-editor-bg">
      {/* Tab Bar */}
      <div className="flex border-b border-editor-border bg-editor-surface">
        {workspace.openFiles.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-2">
            <span className="text-editor-text-muted text-sm">No files open</span>
          </div>
        ) : (
          <div className="flex flex-1 overflow-x-auto">
            {workspace.openFiles.map((filePath) => {
              const file = workspace.files.find(f => f.path === filePath);
              const isActive = workspace.activeFile === filePath;
              
              return (
                <div
                  key={filePath}
                  className={`
                    flex items-center px-4 py-2 border-r border-editor-border cursor-pointer
                    ${isActive 
                      ? 'bg-editor-bg text-editor-text' 
                      : 'bg-editor-surface text-editor-text-muted hover:text-editor-text'
                    }
                  `}
                  onClick={() => handleTabClick(filePath)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  <span className="text-sm">{file?.name || filePath}</span>
                  <button 
                    className="ml-2 p-1 hover:bg-editor-border rounded"
                    onClick={(e) => handleTabClose(filePath, e)}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
        
        {/* New File Button */}
        <button 
          className="p-2 hover:bg-editor-border text-editor-text-muted hover:text-editor-text"
          onClick={handleCreateNewFile}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={currentFile ? getLanguageFromFilename(currentFile.name) : 'typescript'}
          value={editorContent}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            fontFamily: 'JetBrains Mono, Monaco, Cascadia Code, Roboto Mono, Consolas, monospace',
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            minimap: { enabled: true },
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            contextmenu: true,
            mouseWheelZoom: true,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            renderLineHighlight: 'all',
            selectOnLineNumbers: true,
            glyphMargin: true,
            folding: true,
            foldingStrategy: 'indentation',
            showFoldingControls: 'mouseover',
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true,
            },
            suggest: {
              showMethods: true,
              showFunctions: true,
              showConstructors: true,
              showFields: true,
              showVariables: true,
              showClasses: true,
              showStructs: true,
              showInterfaces: true,
              showModules: true,
              showProperties: true,
              showEvents: true,
              showOperators: true,
              showUnits: true,
              showValues: true,
              showConstants: true,
              showEnums: true,
              showEnumMembers: true,
              showKeywords: true,
              showWords: true,
              showColors: true,
              showFiles: true,
              showReferences: true,
              showFolders: true,
              showTypeParameters: true,
              showSnippets: true,
            },
          }}
        />
      </div>

      {/* AI Suggestion Overlay */}
      <AIGhostText visible={false} text="" />
    </div>
  );
};

interface AIGhostTextProps {
  visible: boolean;
  text: string;
}

const AIGhostText: React.FC<AIGhostTextProps> = ({ visible, text }) => {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="ghost-text">
        {text}
      </div>
    </div>
  );
};

const getWelcomeContent = () => `// Welcome to Cursor AI Clone - Powered by Puter.js!
// 
// This is a complete Cursor AI implementation using Puter.js as the AI backend.
// 
// Key Features:
// - 20+ AI Models (GPT-4o, Claude, Llama, DeepSeek, Gemini, etc.)
// - Inline Code Completion (Press Ctrl+K)
// - AI Chat Assistant (Press Ctrl+I)
// - Agent Mode for autonomous tasks
// - Cloud storage and sync with Puter.js
// - No API keys required - users pay for their own usage
//
// Quick Start:
// 1. Press Ctrl+Shift+P to open command palette
// 2. Press Ctrl+B to toggle sidebar
// 3. Press Ctrl+K for AI code completion
// 4. Press Ctrl+I to chat with AI
// 5. Press Tab to accept AI suggestions
//
// This editor supports all major programming languages with:
// - Syntax highlighting
// - IntelliSense
// - Code folding
// - Bracket matching
// - Multi-cursor editing
// - And much more!

function welcomeMessage() {
  console.log("Welcome to the future of AI-powered coding!");
  
  // Try typing some code and see AI suggestions appear
  const features = [
    "Real-time AI assistance",
    "Multiple model support", 
    "Cloud synchronization",
    "Zero infrastructure costs"
  ];
  
  return features.map(feature => \`✅ \${feature}\`);
}

welcomeMessage();

// Start coding and experience the power of Puter.js!
`;

export default CodeEditor;