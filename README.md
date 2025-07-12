# Cursor AI Clone - Powered by Puter.js

Ein vollständiger Cursor AI Klon, der **Puter.js** als AI-Backend verwendet anstatt der ursprünglichen Claude API. Dieses Projekt implementiert alle 64+ Features von Cursor AI mit einer modernen React/TypeScript-Architektur.

## 🚀 Features

### Core AI Features (Powered by Puter.js)
- ✅ **Inline Code Completion** - Smart code suggestions while typing
- ✅ **Multi-line Completion** - Complex code block generation
- ✅ **Ask Mode** - Natural language queries about code
- ✅ **Agent Mode** - Autonomous task execution with tool calling
- ✅ **Multiple AI Models** - GPT-4o, Claude, Llama, DeepSeek, Gemini, etc.
- ✅ **Streaming Responses** - Real-time AI output
- ✅ **Vision Capabilities** - Image analysis with GPT-4 Vision
- ✅ **Function Calling** - AI can use tools to interact with files

### Editor Features
- ✅ **Monaco Editor** - VS Code-like editing experience
- ✅ **Syntax Highlighting** - Support for 100+ languages
- ✅ **IntelliSense** - Code completion and error detection
- ✅ **Diff Viewer** - Side-by-side code comparison
- ✅ **Ghost Text** - Inline AI suggestions
- ✅ **Hotkey Support** - Keyboard shortcuts (Tab, Ctrl+K, etc.)

### Project Management
- ✅ **File Explorer** - Browse and manage project files
- ✅ **Workspace Indexing** - Automatic project structure analysis
- ✅ **Git Integration** - Version control status and operations
- ✅ **Search & Navigation** - Fast file and symbol search
- ✅ **Command Palette** - Quick actions and commands

### AI Chat System
- ✅ **Interactive Chat** - Conversation with AI about code
- ✅ **Context Awareness** - AI understands current file/project
- ✅ **Chat History** - Persistent conversation sessions
- ✅ **Code References** - Link discussions to specific files

### Rules & Configuration
- ✅ **Cursor Rules** - Custom AI behavior rules (.cursorrules)
- ✅ **Project Rules** - Workspace-specific configurations
- ✅ **Global Rules** - User-wide AI preferences
- ✅ **Rule Priority System** - Hierarchical rule application

### Cloud Integration (via Puter.js)
- ✅ **Cloud Storage** - Store files in Puter cloud
- ✅ **User Authentication** - Secure sign-in with Puter
- ✅ **Cross-device Sync** - Access projects anywhere
- ✅ **No API Keys** - User pays model eliminates costs

## 🛠 Technical Architecture

### Frontend Stack
- **React 18** - Modern React with hooks and context
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Monaco Editor** - VS Code editor component
- **Zustand** - Lightweight state management
- **Vite** - Fast build tool and dev server

### AI Backend
- **Puter.js** - Cloud AI and storage platform
- **Multiple Models** - 20+ AI models available
- **Tool Calling** - Function execution capabilities
- **Streaming** - Real-time response generation
- **Vision** - Image understanding with GPT-4V

### Key Services
- **PuterAIService** - Main AI interaction service
- **WorkspaceIndexer** - Project structure analysis
- **FileSystemService** - Cloud file operations
- **ChatManager** - Conversation management
- **RulesEngine** - AI behavior customization

## 📁 Project Structure

```
cursor-ai-puter-clone/
├── src/
│   ├── components/          # React components
│   │   ├── Editor/         # Monaco editor components
│   │   ├── Chat/           # Chat interface
│   │   ├── Sidebar/        # File explorer, rules
│   │   ├── StatusBar/      # Bottom status bar
│   │   └── CommandPalette/ # Command interface
│   ├── services/           # Core services
│   │   ├── PuterAIService.ts      # Main AI service
│   │   ├── WorkspaceService.ts    # File management
│   │   └── RulesService.ts        # Rules engine
│   ├── stores/             # State management
│   │   └── AppStore.ts     # Global app state
│   ├── types/              # TypeScript types
│   │   └── index.ts        # All type definitions
│   ├── utils/              # Helper functions
│   └── hooks/              # Custom React hooks
├── public/                 # Static assets
├── index.html             # Main HTML file
└── package.json           # Dependencies
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/cursor-ai-puter-clone.git
cd cursor-ai-puter-clone
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:3000
```

### Build for Production

```bash
npm run build
npm run preview
```

## 🎯 Usage Guide

### Getting Started

1. **Sign in with Puter** (optional but recommended)
   - Click "Sign in with Puter" in the welcome modal
   - Enables cloud features and removes limitations

2. **Open a Project**
   - Use the file explorer to browse files
   - Upload files from your computer
   - Create new files and folders

3. **AI Code Completion**
   - Start typing code - AI suggestions appear automatically
   - Press `Tab` to accept inline suggestions
   - Press `Ctrl+K` for multi-line completions

4. **Chat with AI**
   - Click the chat icon or press `Ctrl+I`
   - Ask questions about your code
   - Request refactoring, debugging help, or explanations

5. **Configure AI Behavior**
   - Create `.cursorrules` files in your project
   - Add custom rules in the Rules panel
   - Adjust AI model and settings

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+P` | Open command palette |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+I` | Open AI chat |
| `Ctrl+K` | AI code completion |
| `Tab` | Accept AI suggestion |
| `Esc` | Dismiss AI suggestion |
| `Ctrl+S` | Save file |
| `Ctrl+O` | Open file |

### AI Models Available

- **GPT Models**: gpt-4o, gpt-4o-mini, o1, o3
- **Claude Models**: claude-3-5-sonnet, claude-sonnet-4
- **Google Models**: gemini-2.0-flash, gemini-1.5-flash
- **Meta Models**: llama-3.1-70b, llama-3.1-405b
- **Other Models**: deepseek, mistral, codestral

## 🔧 Configuration

### Cursor Rules

Create a `.cursorrules` file in your project root:

```
# AI Behavior Rules
- Use TypeScript for all new files
- Follow React best practices
- Prefer functional components over class components
- Use Tailwind CSS for styling
- Write comprehensive JSDoc comments
- Include error handling in all functions
```

### Settings

Customize AI behavior in Settings panel:
- Default AI model
- Response streaming
- Code completion frequency
- Context inclusion rules
- Theme and appearance

## 🌟 Advanced Features

### Agent Mode
Ask the AI to perform complex tasks:
- "Refactor this component to use hooks"
- "Add error handling to all API calls"
- "Generate unit tests for this module"
- "Convert this class to functional component"

### Project Analysis
- Automatic dependency detection
- Code quality assessment
- Security vulnerability scanning
- Performance optimization suggestions

### Cloud Integration
- Sync settings across devices
- Backup chat histories
- Share projects with team members
- Version control integration

## 🐛 Troubleshooting

### Common Issues

**AI not responding:**
- Check internet connection
- Try switching AI models
- Sign in to Puter for better reliability

**Files not loading:**
- Ensure proper file permissions
- Check file size limits (1MB max)
- Verify file format support

**Performance issues:**
- Reduce number of open files
- Disable unused features
- Clear browser cache

### Error Messages

**"Failed to initialize Puter.js"**
- Reload the page
- Check internet connectivity
- Try incognito/private mode

**"Authentication failed"**
- Sign out and sign in again
- Clear browser cookies
- Contact Puter support

## 🤝 Contributing

We welcome contributions! Please read our contributing guide:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Use Prettier for code formatting
- Write meaningful commit messages
- Add JSDoc comments for functions
- Test on multiple browsers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Cursor** - Original inspiration and design
- **Puter.js** - AI and cloud infrastructure
- **Monaco Editor** - Code editing capabilities
- **React Team** - UI framework
- **Tailwind CSS** - Styling system

## 🔗 Links

- [Puter.js Documentation](https://docs.puter.com)
- [Cursor AI Official](https://cursor.com)
- [Report Issues](https://github.com/your-username/cursor-ai-puter-clone/issues)
- [Feature Requests](https://github.com/your-username/cursor-ai-puter-clone/discussions)

---

**Built with ❤️ using Puter.js - The future of AI-powered development is here!**
