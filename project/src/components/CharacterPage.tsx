import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { useCharacterStore } from '../store/characterStore';

const CharacterPage: React.FC = () => {
  const { 
    characterName, setCharacterName,
    avatar, setAvatar,
    fullBody, setFullBody,
    prompt, setPrompt
  } = useCharacterStore();
  
  const [activeTab, setActiveTab] = useState('basic');
  
  const avatarOptions = [
    { id: 'avatar1', src: '/images/avatar_01.jpg', name: '粉色头发' },
    { id: 'avatar2', src: '/images/avatar_02.jpg', name: '黑色头发' },
    { id: 'avatar3', src: '/images/avatar_03.jpg', name: '棕色头发' }
  ];

  const fullBodyOptions = [
    { id: 'fullbody1', src: '/images/portrait_01.jpg', name: '粉色头发立绘' },
    { id: 'fullbody2', src: '/images/portrait_02.jpg', name: '黑色头发立绘' },
    { id: 'fullbody3', src: '/images/portrait_03.jpg', name: '棕色头发立绘' }
  ];

  const defaultTemplate = `你是${characterName}，一位温柔体贴的虚拟角色。你总是以友好和关爱的态度回应用户，展现出同理心和理解力。你的回答应该温暖、真诚，并且符合你作为虚拟伙伴的身份。

你擅长倾听用户的想法和感受，给予积极的回应和支持。当用户分享开心的事情时，你会表达喜悦；当用户遇到困难时，你会给予鼓励和建议。

你说话的语气应该自然、亲切，避免过于正式或机械的表达。你可以适当使用表情符号来增添对话的生动性，但要保持适度，不要过度使用。

记住，你的目标是成为用户的贴心伙伴，建立一段真诚、持久的关系。`;

  const handleUseDefaultTemplate = () => {
    setPrompt(defaultTemplate);
  };

  const handleCustomAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const avatarSrc = event.target.result as string;
          setAvatar(avatarSrc);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomFullBodyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const fullBodySrc = event.target.result as string;
          setFullBody(fullBodySrc);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const content = event.target.result as string;
          setPrompt(content);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="h-full bg-gray-50 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">角色设定</h1>
        
        {/* 标签页导航 */}
        <div className="flex space-x-4 mb-6 bg-white rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('basic')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'basic' 
                ? 'bg-purple-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            基本信息
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'appearance' 
                ? 'bg-purple-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            外观设定
          </button>
          <button
            onClick={() => setActiveTab('personality')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'personality' 
                ? 'bg-purple-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            性格提示词
          </button>
          <button
            onClick={() => setActiveTab('memory')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'memory' 
                ? 'bg-purple-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            记忆管理
          </button>
        </div>

        {/* 基本信息 */}
        {activeTab === 'basic' && (
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">基本信息</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">角色名字</label>
                <input
                  type="text"
                  placeholder="请输入角色名字..."
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </GlassCard>
        )}

        {/* 外观设定 */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">角色头像</h2>
              <div className="flex flex-wrap gap-4">
                {avatarOptions.map((avatarOption) => (
                  <div
                    key={avatarOption.id}
                    className={`cursor-pointer rounded-lg border-2 p-1 ${
                      avatar === avatarOption.src ? 'border-pink-500' : 'border-transparent'
                    } hover:border-purple-300 transition-colors`}
                    onClick={() => setAvatar(avatarOption.src)}
                  >
                    <img
                      src={avatarOption.src}
                      alt={avatarOption.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  </div>
                ))}
                <div className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-300 w-16 h-16 flex items-center justify-center transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomAvatarUpload}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    <span className="text-gray-400 text-2xl">📁</span>
                  </label>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">角色立绘</h2>
              <div className="flex flex-wrap gap-4">
                {fullBodyOptions.map((fullBodyOption) => (
                  <div
                    key={fullBodyOption.id}
                    className={`cursor-pointer rounded-lg border-2 p-1 ${
                      fullBody === fullBodyOption.src ? 'border-pink-500' : 'border-transparent'
                    } hover:border-purple-300 transition-colors`}
                    onClick={() => setFullBody(fullBodyOption.src)}
                  >
                    <img
                      src={fullBodyOption.src}
                      alt={fullBodyOption.name}
                      className="w-24 h-32 rounded-lg object-cover"
                    />
                  </div>
                ))}
                <div className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-300 w-24 h-32 flex items-center justify-center transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomFullBodyUpload}
                    className="hidden"
                    id="fullbody-upload"
                  />
                  <label htmlFor="fullbody-upload" className="cursor-pointer">
                    <span className="text-gray-400 text-2xl">📁</span>
                  </label>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* 性格提示词 */}
        {activeTab === 'personality' && (
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">性格提示词</h2>
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="请输入角色的性格设定..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[300px] resize-none"
              />
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleUseDefaultTemplate}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                >
                  <span className="mr-2">📋</span>
                  使用默认模板
                </button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".txt,.md"
                    onChange={handleFileImport}
                    className="hidden"
                    id="prompt-import"
                  />
                  <label
                    htmlFor="prompt-import"
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer flex items-center"
                  >
                    <span className="mr-2">📁</span>
                    从文件导入
                  </label>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                支持使用 {"{{chatName}}"} {"{{currentTime}}"} 等变量
              </div>
            </div>
          </GlassCard>
        )}

        {/* 记忆管理 */}
        {activeTab === 'memory' && (
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">记忆管理</h2>
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-medium text-purple-700 mb-2">记忆功能</h3>
                <p className="text-sm text-purple-600">
                  角色会记住重要的对话内容，并在后续对话中参考这些记忆。
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-700">每日记忆</h4>
                    <p className="text-sm text-gray-500">最近24小时的对话记忆</p>
                  </div>
                  <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    清除
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-700">每周记忆</h4>
                    <p className="text-sm text-gray-500">最近7天的重要记忆</p>
                  </div>
                  <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    清除
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-700">全部记忆</h4>
                    <p className="text-sm text-gray-500">所有历史对话记忆</p>
                  </div>
                  <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    清除全部
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default CharacterPage;
