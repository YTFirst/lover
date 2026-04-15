import { LLMClient, PromptEngine, type ChatMessage } from './llmClient';

// 示例 1: 基本使用
async function basicExample() {
  console.log('=== 基本使用示例 ===');
  
  // 初始化 LLM 客户端
  const client = new LLMClient({
    apiKey: 'your-api-key-here',
    baseURL: 'https://api.openai.com/v1', // 可以替换为其他兼容 OpenAI API 的服务
    model: 'gpt-3.5-turbo',
  });

  // 基本消息
  const messages: ChatMessage[] = [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Tell me a short joke.' },
  ];

  // 流式响应
  await client.stream(
    { messages },
    {
      onData: (data) => {
        const content = data.choices[0]?.delta?.content;
        if (content) {
          process.stdout.write(content);
        }
      },
      onEnd: () => {
        console.log('\n=== 响应结束 ===');
      },
      onError: (error) => {
        console.error('Error:', error);
      }
    }
  );
}

// 示例 2: 使用 Prompt 引擎和变量替换
async function promptEngineExample() {
  console.log('\n=== Prompt 引擎示例 ===');
  
  // 初始化 LLM 客户端
  const client = new LLMClient({
    apiKey: 'your-api-key-here',
    model: 'gpt-3.5-turbo',
  });

  // 带有变量的模板消息
  const templateMessages: ChatMessage[] = [
    { 
      role: 'system', 
      content: 'You are a {{role}}. Respond in {{language}}.' 
    },
    { 
      role: 'user', 
      content: 'Tell me about {{topic}}.' 
    },
  ];

  // 变量值
  const variables = {
    role: 'technology expert',
    language: 'Chinese',
    topic: 'artificial intelligence',
  };

  // 使用 Prompt 引擎组装消息
  const assembledMessages = PromptEngine.assembleMessages(templateMessages, variables);
  console.log('组装后的消息:', assembledMessages);

  // 流式响应
  let response = '';
  await client.stream(
    { messages: assembledMessages },
    {
      onData: (data) => {
        const content = data.choices[0]?.delta?.content;
        if (content) {
          response += content;
          process.stdout.write(content);
        }
      },
      onEnd: () => {
        console.log('\n=== 响应结束 ===');
      },
      onError: (error) => {
        console.error('Error:', error);
      }
    }
  );
}

// 示例 3: 非流式响应
async function nonStreamExample() {
  console.log('\n=== 非流式响应示例 ===');
  
  // 初始化 LLM 客户端
  const client = new LLMClient({
    apiKey: 'your-api-key-here',
    model: 'gpt-3.5-turbo',
  });

  // 消息
  const messages: ChatMessage[] = [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is the capital of France?' },
  ];

  try {
    const result = await client.completions({ messages });
    console.log('完整响应:', result);
    console.log('助手回复:', result.choices[0]?.message?.content);
  } catch (error) {
    console.error('Error:', error);
  }
}

// 运行示例
async function runExamples() {
  try {
    await basicExample();
    await promptEngineExample();
    await nonStreamExample();
  } catch (error) {
    console.error('Example error:', error);
  }
}

// 导出示例函数
export { runExamples, basicExample, promptEngineExample, nonStreamExample };
