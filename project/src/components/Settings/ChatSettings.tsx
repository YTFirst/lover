import React, { useState } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { Slider } from '../Slider';

const ChatSettings: React.FC = () => {
  const { 
    model, setModel,
    apiUrl, setApiUrl,
    apiKey, setApiKey,
    maxTokens, setMaxTokens,
    temperature, setTemperature,
    messagePercentage, setMessagePercentage
  } = useSettingsStore();
  const [showApiKey, setShowApiKey] = useState(false);

  const handleTestConnection = () => {
    // 这里实现测试连接的逻辑
    console.log('Testing connection...');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">对话设置</h2>
          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 服务商选择 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">服务商</label>
          <div className="relative">
            <select 
              value={model} 
              onChange={(e) => {
                setModel(e.target.value);
                // 根据选择的服务商自动设置API URL
                const provider = e.target.value;
                let apiUrlValue = 'https://api.openai.com/v1';
                
                switch(provider) {
                  case 'openai':
                    apiUrlValue = 'https://api.openai.com/v1';
                    break;
                  case 'qwen':
                    apiUrlValue = 'https://ark.cn-beijing.volces.com/api/v3';
                    break;
                  case 'doubao':
                    apiUrlValue = 'https://ark.cn-beijing.volces.com/api/v3';
                    break;
                  case 'deepseek':
                    apiUrlValue = 'https://api.deepseek.com/v1';
                    break;
                  case 'glm':
                    apiUrlValue = 'https://open.bigmodel.cn/api/misc/v1';
                    break;
                  case 'gemini':
                    apiUrlValue = 'https://generativelanguage.googleapis.com/v1';
                    break;
                  default:
                    apiUrlValue = 'https://api.openai.com/v1';
                }
                
                setApiUrl(apiUrlValue);
              }}
              className="w-full p-3 bg-purple-50 border border-purple-200 rounded-lg text-purple-700 font-medium"
            >
              <option value="openai">OpenAI (GPT系列)</option>
              <option value="qwen">通义千问</option>
              <option value="doubao">豆包</option>
              <option value="deepseek">深度求索</option>
              <option value="glm">智谱 GLM</option>
              <option value="gemini">Google Gemini</option>
            </select>
          </div>
        </div>

        {/* API地址 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">API地址</label>
          <input 
            type="text" 
            value={apiUrl} 
            onChange={(e) => setApiUrl(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* API Key */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
          <div className="relative">
            <input 
              type={showApiKey ? 'text' : 'password'} 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-10"
            />
            <button 
              type="button" 
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showApiKey ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878 3.869 3.869m-3.869-3.869l3.869 3.869M3 3l6.878 6.878" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Max Tokens 和 Temperature */}
        <div className="space-y-6 mb-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">最大 Token 数</label>
              <span className="text-sm font-medium text-purple-700">{maxTokens}</span>
            </div>
            <Slider 
              value={maxTokens} 
              min={128} 
              max={4096} 
              step={128}
              onChange={setMaxTokens}
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">温度系数</label>
              <span className="text-sm font-medium text-purple-700">{temperature}</span>
            </div>
            <Slider 
              value={temperature} 
              min={0} 
              max={2} 
              step={0.1}
              onChange={setTemperature}
            />
          </div>
        </div>

        {/* 上下文消息数 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">上下文消息数</label>
            <span className="text-sm font-medium text-purple-700">{messagePercentage}%</span>
          </div>
          <Slider 
            value={messagePercentage} 
            min={0} 
            max={100} 
            step={5}
            onChange={setMessagePercentage}
          />
        </div>

        {/* 尝试连接按钮 */}
        <button 
          onClick={handleTestConnection}
          className="w-full py-3 bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <span>尝试连接</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatSettings;