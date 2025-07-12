import { 
  AIModel, 
  CompletionRequest, 
  CompletionSuggestion, 
  ChatMessage, 
  ToolDefinition, 
  ToolCall,
  ToolResponse
} from '../types';

export class PuterAIService {
  private static instance: PuterAIService;
  private defaultModel: AIModel = 'gpt-4.1-nano';
  private isInitialized = false;

  static getInstance(): PuterAIService {
    if (!PuterAIService.instance) {
      PuterAIService.instance = new PuterAIService();
    }
    return PuterAIService.instance;
  }

  private constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Wait for Puter.js to be available
      while (!window.puter) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      this.isInitialized = true;
      console.log('🤖 PuterAIService initialized');
    } catch (error) {
      console.error('Failed to initialize PuterAIService:', error);
      throw error;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  // Feature 1: Inline Code Completion
  async getInlineCompletion(request: CompletionRequest): Promise<CompletionSuggestion> {
    await this.ensureInitialized();
    
    const prompt = this.buildCompletionPrompt(request);
    
    try {
      const response = await window.puter.ai.chat(prompt, {
        model: request.model,
        max_tokens: 150,
        temperature: 0.3,
        stream: false
      });

      return {
        id: this.generateId(),
        text: response.toString(),
        type: 'inline',
        startPosition: request.cursorPosition,
        endPosition: request.cursorPosition,
        confidence: 0.8,
        model: request.model,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Inline completion failed:', error);
      throw error;
    }
  }

  // Feature 2: Multi-line Completion
  async getMultilineCompletion(request: CompletionRequest): Promise<CompletionSuggestion> {
    await this.ensureInitialized();
    
    const prompt = this.buildMultilinePrompt(request);
    
    try {
      const response = await window.puter.ai.chat(prompt, {
        model: request.model,
        max_tokens: 500,
        temperature: 0.4,
        stream: false
      });

      return {
        id: this.generateId(),
        text: response.toString(),
        type: 'multiline',
        startPosition: request.cursorPosition,
        endPosition: {
          line: request.cursorPosition.line + response.toString().split('\n').length - 1,
          column: response.toString().split('\n').pop()?.length || 0
        },
        confidence: 0.75,
        model: request.model,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Multiline completion failed:', error);
      throw error;
    }
  }

  // Feature 4: Ask Mode - Natural Language Queries
  async askQuestion(question: string, context?: string, model?: AIModel): Promise<string> {
    await this.ensureInitialized();
    
    const selectedModel = model || this.defaultModel;
    const prompt = context 
      ? `Context: ${context}\n\nQuestion: ${question}`
      : question;

    try {
      const response = await window.puter.ai.chat(prompt, {
        model: selectedModel,
        temperature: 0.7,
        stream: false
      });

      return response.toString();
    } catch (error) {
      console.error('Ask mode failed:', error);
      throw error;
    }
  }

  // Feature 5: Agent Mode - Autonomous Task Execution
  async executeAgentTask(
    task: string, 
    context: string[], 
    tools: ToolDefinition[],
    model?: AIModel
  ): Promise<{ result: string; toolCalls: ToolCall[] }> {
    await this.ensureInitialized();
    
    const selectedModel = model || 'claude-3-5-sonnet';
    
    const systemPrompt = `You are an autonomous AI agent working in a code editor. Your goal is to complete the given task efficiently and accurately. You have access to various tools to read, write, and analyze code.

Available context:
${context.join('\n')}

Task: ${task}

Use the available tools to complete this task. Think step by step and explain your reasoning.`;

    try {
      const response = await window.puter.ai.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: task }
      ], {
        model: selectedModel,
        tools,
        temperature: 0.5
      });

      // Handle tool calls if present
      const toolCalls: ToolCall[] = response.message?.tool_calls || [];
      
      return {
        result: response.toString(),
        toolCalls
      };
    } catch (error) {
      console.error('Agent task execution failed:', error);
      throw error;
    }
  }

  // Feature 34: Streaming Responses
  async getStreamingResponse(
    prompt: string, 
    model?: AIModel
  ): Promise<AsyncIterable<string>> {
    await this.ensureInitialized();
    
    const selectedModel = model || this.defaultModel;
    
    try {
      const response = await window.puter.ai.chat(prompt, {
        model: selectedModel,
        stream: true,
        temperature: 0.7
      });

      return this.createAsyncGenerator(response);
    } catch (error) {
      console.error('Streaming response failed:', error);
      throw error;
    }
  }

  // Feature 14: Multi-model Support
  async switchModel(model: AIModel): Promise<void> {
    this.defaultModel = model;
    console.log(`🔄 Switched to model: ${model}`);
  }

  getAvailableModels(): AIModel[] {
    return [
      'gpt-4o-mini',
      'gpt-4o',
      'o1',
      'o1-mini',
      'claude-3-5-sonnet',
      'claude-sonnet-4',
      'deepseek-chat',
      'gemini-2.0-flash',
      'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      'mistral-large-latest',
      'codestral-latest'
    ];
  }

  // Feature 58: Error Analysis
  async analyzeError(
    errorMessage: string, 
    codeContext: string, 
    filePath: string
  ): Promise<string> {
    await this.ensureInitialized();
    
    const prompt = `Please analyze this error and provide a solution:

Error: ${errorMessage}
File: ${filePath}
Code Context:
\`\`\`
${codeContext}
\`\`\`

Please provide:
1. What caused the error
2. How to fix it
3. Code example of the fix if applicable`;

    try {
      const response = await window.puter.ai.chat(prompt, {
        model: 'claude-3-5-sonnet',
        temperature: 0.3
      });

      return response.toString();
    } catch (error) {
      console.error('Error analysis failed:', error);
      throw error;
    }
  }

  // Feature 21: Test Generation
  async generateTests(
    codeSnippet: string, 
    language: string, 
    filePath: string
  ): Promise<string> {
    await this.ensureInitialized();
    
    const prompt = `Generate comprehensive unit tests for this ${language} code:

File: ${filePath}
Code:
\`\`\`${language}
${codeSnippet}
\`\`\`

Please generate:
1. Unit tests covering main functionality
2. Edge cases
3. Error scenarios
4. Use appropriate testing framework for ${language}`;

    try {
      const response = await window.puter.ai.chat(prompt, {
        model: 'claude-3-5-sonnet',
        temperature: 0.4
      });

      return response.toString();
    } catch (error) {
      console.error('Test generation failed:', error);
      throw error;
    }
  }

  // Feature 27: Project-wide Refactoring
  async suggestRefactoring(
    codeFiles: Array<{ path: string; content: string }>,
    refactoringType: string
  ): Promise<Array<{ file: string; changes: string }>> {
    await this.ensureInitialized();
    
    const filesContext = codeFiles.map(file => 
      `File: ${file.path}\n\`\`\`\n${file.content}\n\`\`\``
    ).join('\n\n');

    const prompt = `Analyze these files and suggest ${refactoringType} refactoring:

${filesContext}

Please provide specific refactoring suggestions for each file that needs changes.`;

    try {
      const response = await window.puter.ai.chat(prompt, {
        model: 'claude-3-5-sonnet',
        temperature: 0.5,
        max_tokens: 2000
      });

      // Parse the response to extract file-specific changes
      // This is a simplified version - would need more sophisticated parsing
      return [{
        file: 'multiple',
        changes: response.toString()
      }];
    } catch (error) {
      console.error('Refactoring suggestion failed:', error);
      throw error;
    }
  }

  // Chat functionality
  async sendChatMessage(
    messages: ChatMessage[], 
    model?: AIModel,
    includeProjectContext?: boolean
  ): Promise<string> {
    await this.ensureInitialized();
    
    const selectedModel = model || this.defaultModel;
    
    // Convert ChatMessage[] to Puter.js format
    const puterMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    try {
      const response = await window.puter.ai.chat(puterMessages, {
        model: selectedModel,
        temperature: 0.7
      });

      return response.toString();
    } catch (error) {
      console.error('Chat message failed:', error);
      throw error;
    }
  }

  // File analysis with Puter.js
  async analyzeFile(filePath: string, analysisType: string): Promise<string> {
    await this.ensureInitialized();
    
    try {
      // Read file using Puter.js
      const fileBlob = await window.puter.fs.read(filePath);
      const content = await fileBlob.text();
      
      const prompt = `Analyze this file for ${analysisType}:

File: ${filePath}
Content:
\`\`\`
${content}
\`\`\`

Please provide a comprehensive analysis.`;

      const response = await window.puter.ai.chat([
        {
          role: 'user',
          content: [
            {
              type: 'file',
              puter_path: filePath
            },
            {
              type: 'text',
              text: `Please analyze this file for ${analysisType}.`
            }
          ]
        }
      ], {
        model: 'claude-3-5-sonnet'
      });

      return response.toString();
    } catch (error) {
      console.error('File analysis failed:', error);
      // Fallback to regular text analysis
      return this.askQuestion(`Analyze the code in ${filePath} for ${analysisType}`);
    }
  }

  // Private helper methods
  private buildCompletionPrompt(request: CompletionRequest): string {
    const beforeCursor = request.context.split('\n')
      .slice(0, request.cursorPosition.line)
      .join('\n') + request.context.split('\n')[request.cursorPosition.line]?.slice(0, request.cursorPosition.column) || '';
    
    const afterCursor = (request.context.split('\n')[request.cursorPosition.line]?.slice(request.cursorPosition.column) || '') +
      request.context.split('\n').slice(request.cursorPosition.line + 1).join('\n');

    return `Complete the code at the cursor position. Only return the completion, no explanations.

File: ${request.filePath}
Code before cursor:
\`\`\`
${beforeCursor}
\`\`\`

Code after cursor:
\`\`\`
${afterCursor}
\`\`\`

Complete the code at the cursor position:`;
  }

  private buildMultilinePrompt(request: CompletionRequest): string {
    return `Generate a multi-line code completion for this context:

File: ${request.filePath}
Current code:
\`\`\`
${request.context}
\`\`\`

Cursor position: Line ${request.cursorPosition.line}, Column ${request.cursorPosition.column}

Generate appropriate code continuation (multiple lines if needed):`;
  }

  private async *createAsyncGenerator(response: any): AsyncIterable<string> {
    try {
      for await (const part of response) {
        if (part?.text) {
          yield part.text;
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      throw error;
    }
  }

  private generateId(): string {
    return `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Tool definitions for agent mode
  getDefaultTools(): ToolDefinition[] {
    return [
      {
        type: 'function',
        function: {
          name: 'read_file',
          description: 'Read the contents of a file',
          parameters: {
            type: 'object',
            properties: {
              file_path: {
                type: 'string',
                description: 'The path to the file to read'
              }
            },
            required: ['file_path']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'write_file',
          description: 'Write content to a file',
          parameters: {
            type: 'object',
            properties: {
              file_path: {
                type: 'string',
                description: 'The path to the file to write'
              },
              content: {
                type: 'string',
                description: 'The content to write to the file'
              }
            },
            required: ['file_path', 'content']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'search_code',
          description: 'Search for code patterns in the project',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'The search query'
              },
              file_pattern: {
                type: 'string',
                description: 'File pattern to search in (optional)'
              }
            },
            required: ['query']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'run_command',
          description: 'Execute a terminal command',
          parameters: {
            type: 'object',
            properties: {
              command: {
                type: 'string',
                description: 'The command to execute'
              }
            },
            required: ['command']
          }
        }
      }
    ];
  }
}