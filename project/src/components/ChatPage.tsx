import { useState, useEffect, useRef } from 'react';
import { LLMClient, type ChatMessage } from '../services/llmClient';
import { useThemeStore } from '../store/themeStore';
import { useCharacterStore } from '../store/characterStore';
import { useSettingsStore } from '../store/settingsStore';
import { Toast, useToast } from './Toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isDark } = useThemeStore();
  const { toasts, addToast, removeToast } = useToast();
  const { characterName, fullBody, avatar } = useCharacterStore();
  const { apiKey, apiUrl, model, maxTokens, temperature } = useSettingsStore();
  
  // LLM client
  const llmClient = new LLMClient({ 
    apiKey: apiKey || 'demo-key',
    baseURL: apiUrl,
    model: model
  });
  
  // 加载对话历史
  useEffect(() => {
    const loadHistory = async () => {
      // 模拟从数据库加载历史消息
      const mockHistory: Message[] = [
        {
          id: '1',
          role: 'assistant',
          content: `你好！我是${characterName}，你的虚拟女友。有什么我可以帮助你的吗？`,
          timestamp: new Date(Date.now() - 3600000)
        }
      ];
      setMessages(mockHistory);
    };

    loadHistory();
  }, [characterName]);

  // 滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, streamingContent]);

  // 输入框自动聚焦
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!isTyping) {
      inputRef.current?.focus();
    }
  }, [isTyping]);

  // 发送消息
  const handleSend = async () => {
    if (!input.trim()) return;

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setIsStreaming(true);
    setStreamingContent('');

    // 准备发送给LLM的消息
    const chatMessages: ChatMessage[] = [
      {
        role: 'system',
        content: `你是${characterName}，一个温柔、体贴的虚拟女友。你总是以友好和关爱的态度回应用户，提供情感支持和陪伴。\n\n当你需要发送多条独立消息时，请使用隐藏分割符 [SEPARATOR] 来分隔它们。每条消息将被单独显示。例如：\n消息1内容 [SEPARATOR] 消息2内容 [SEPARATOR] 消息3内容`
      },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      } as ChatMessage))
    ];

    // 发送请求到LLM API
    try {
      await llmClient.stream(
        {
          messages: chatMessages,
          temperature: temperature,
          maxTokens: maxTokens
        },
        {
          onData: (data) => {
            const delta = data.choices[0]?.delta;
            if (delta?.content) {
              setStreamingContent(prev => prev + delta.content);
            }
          },
          onEnd: () => {
            // 检查是否包含分割符
            const messagesArray = streamingContent.split('[SEPARATOR]').map(msg => msg.trim()).filter(msg => msg);
            
            if (messagesArray.length > 0) {
              // 依次添加消息，实现多消息依次显示效果
              let currentIndex = 0;
              
              const addNextMessage = () => {
                if (currentIndex < messagesArray.length) {
                  const assistantMessage: Message = {
                    id: (Date.now() + currentIndex).toString(),
                    role: 'assistant',
                    content: messagesArray[currentIndex],
                    timestamp: new Date()
                  };
                  
                  setMessages(prev => [...prev, assistantMessage]);
                  currentIndex++;
                  
                  // 延迟添加下一条消息，实现依次显示效果
                  setTimeout(addNextMessage, 500);
                } else {
                  setIsTyping(false);
                  setIsStreaming(false);
                  setStreamingContent('');
                }
              };
              
              addNextMessage();
            } else {
              // 如果没有分割符，添加单条消息
              const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: streamingContent,
                timestamp: new Date()
              };

              setMessages(prev => [...prev, assistantMessage]);
              setIsTyping(false);
              setIsStreaming(false);
              setStreamingContent('');
            }
          },
          onError: (error) => {
            console.error('LLM API error:', error);
            addToast({ message: 'API 错误，请稍后重试', type: 'error' });
            setIsTyping(false);
            setIsStreaming(false);
            setStreamingContent('');
          }
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
      addToast({ message: '发送消息失败，请稍后重试', type: 'error' });
      setIsTyping(false);
      setIsStreaming(false);
      setStreamingContent('');
    }
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative h-full">
      <div className={`h-full flex flex-col ${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-purple-400 to-pink-400'} p-4 transition-colors duration-300 relative overflow-hidden`}>
        {/* 角色立绘背景 */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none z-0">
          <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <img 
              src={fullBody} 
              alt={`${characterName}立绘`} 
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </div>
        {/* 聊天消息区域 */}
        <div className="flex-1 overflow-y-auto mb-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4 items-start`}
            >
              {message.role === 'assistant' && (
                <img 
                  src={avatar} 
                  alt={characterName} 
                  className="w-8 h-8 rounded-full mr-2 object-cover"
                />
              )}
              <div
                className={`max-w-[80%] p-4 rounded-lg ${message.role === 'user' ? (isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-800') : (isDark ? 'bg-purple-900/60 text-purple-200' : 'bg-purple-100 text-purple-800')} transition-colors duration-200`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'} text-right`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
              {message.role === 'user' && (
                <img 
                  src="/images/avatar_01.jpg" 
                  alt="用户" 
                  className="w-8 h-8 rounded-full ml-2 object-cover"
                />
              )}
            </div>
          ))}

          {/* 打字中状态 */}
          {isTyping && (
            <div className="flex justify-start mb-4 items-start">
              <img 
                src={avatar} 
                alt={characterName} 
                className="w-8 h-8 rounded-full mr-2 object-cover"
              />
              <div className={`${isDark ? 'bg-purple-900/60 text-purple-200' : 'bg-purple-100 text-purple-800'} p-4 rounded-lg max-w-[80%] transition-colors duration-200`}>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </div>
          )}

          {/* 流式输出 */}
          {isStreaming && streamingContent && (
            <div className="flex justify-start mb-4 items-start">
              <img 
                src={avatar} 
                alt={characterName} 
                className="w-8 h-8 rounded-full mr-2 object-cover"
              />
              <div className={`${isDark ? 'bg-purple-900/60 text-purple-200' : 'bg-purple-100 text-purple-800'} p-4 rounded-lg max-w-[80%] transition-colors duration-200`}>
                <p className="whitespace-pre-wrap">{streamingContent}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className={`${isDark ? 'bg-gray-700' : 'bg-white'} rounded-full p-2 flex items-center gap-2 shadow-lg transition-colors duration-300`}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="和小雪聊聊吧..."
            className={`flex-1 px-4 py-3 rounded-full focus:outline-none ${isDark ? 'bg-gray-600 text-white placeholder-gray-400' : 'placeholder-gray-400'} transition-colors duration-200`}
            disabled={isTyping}
          />
          <button
            className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white hover:bg-purple-600 transition-colors shadow-lg active:scale-95 transition-all duration-200"
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
          >
            <span className="text-lg">➤</span>
          </button>
        </div>
      </div>
      
      {/* Toast messages */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ChatPage;