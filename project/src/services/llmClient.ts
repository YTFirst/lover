

interface LLMClientOptions {
  apiKey: string;
  baseURL?: string;
  model?: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface StreamOptions {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stop?: string[];
  tools?: any[];
  tool_choice?: any;
  user?: string;
  [key: string]: any;
}

interface StreamResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta?: {
      role?: 'assistant';
      content?: string;
      tool_calls?: Array<{
        id: string;
        type: string;
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
    message?: {
      role: 'assistant';
      content: string;
      tool_calls?: Array<{
        id: string;
        type: string;
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class LLMClient {
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor(options: LLMClientOptions) {
    this.apiKey = options.apiKey;
    this.baseURL = options.baseURL || 'https://api.openai.com/v1';
    this.model = options.model || 'gpt-3.5-turbo';
  }

  async stream(options: StreamOptions, callbacks: {
    onData: (data: StreamResponse) => void;
    onEnd: () => void;
    onError: (error: Error) => void;
  }): Promise<void> {
    const { messages, ...rest } = options;

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          stream: true,
          ...rest,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              callbacks.onEnd();
              return;
            }

            try {
              const json: StreamResponse = JSON.parse(data);
              callbacks.onData(json);
            } catch (error) {
              console.error('Error parsing stream data:', error);
            }
          }
        }
      }
    } catch (error) {
      callbacks.onError(error as Error);
    }
  }

  async completions(options: StreamOptions): Promise<StreamResponse> {
    const { messages, ...rest } = options;

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: false,
        ...rest,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

class PromptEngine {
  static assemble(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const value = variables[key.trim()];
      return value !== undefined ? value : match;
    });
  }

  static assembleMessages(templates: ChatMessage[], variables: Record<string, any>): ChatMessage[] {
    return templates.map(message => ({
      ...message,
      content: this.assemble(message.content, variables),
    }));
  }
}

export { LLMClient, PromptEngine, type LLMClientOptions, type ChatMessage, type StreamOptions, type StreamResponse };
