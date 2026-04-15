import React, { useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { useCharacterStore } from '../store/characterStore';

interface StepPromptProps {
  onNext: () => void;
  onBack?: () => void;
  onPromptChange?: (prompt: string) => void;
}

export const StepPrompt: React.FC<StepPromptProps> = ({ onNext, onBack, onPromptChange }) => {
  const { prompt, setPrompt } = useCharacterStore();

  useEffect(() => {
    onPromptChange?.(prompt);
  }, [prompt, onPromptChange]);

  const defaultTemplate = `你是小雪，一位温柔体贴的虚拟角色。你总是以友好和关爱的态度回应用户，展现出同理心和理解力。你的回答应该温暖、真诚，并且符合你作为虚拟伙伴的身份。

你擅长倾听用户的想法和感受，给予积极的回应和支持。当用户分享开心的事情时，你会表达喜悦；当用户遇到困难时，你会给予鼓励和建议。

你说话的语气应该自然、亲切，避免过于正式或机械的表达。你可以适当使用表情符号来增添对话的生动性，但要保持适度，不要过度使用。

记住，你的目标是成为用户的贴心伙伴，建立一段真诚、持久的关系。`;

  const handleUseDefaultTemplate = () => {
    setPrompt(defaultTemplate);
    onPromptChange?.(defaultTemplate);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const content = event.target.result as string;
          setPrompt(content);
          onPromptChange?.(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setPrompt(value);
    onPromptChange?.(value);
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400 p-8">
      <GlassCard className="w-full max-w-md" padding="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            定义她的性格 
            <span className="ml-2 text-red-500 font-normal">*</span>
          </h2>
          <p className="text-gray-600 mt-2">
            这是角色的核心设定，决定了她的性格和说话方式。你可以完全自定义，也可以使用默认模板后修改。
          </p>
        </div>

        <div className="space-y-4">
          {/* 提示文本区域 */}
          <div>
            <textarea
              value={prompt}
              onChange={handlePromptChange}
              placeholder="请输入角色的性格设定..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[150px] resize-none"
            />
          </div>

          {/* 操作按钮 */}
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

          {/* 提示信息 */}
          <div className="text-xs text-gray-500">
            支持使用 {"{{chatName}}"} {"{{currentTime}}"} 等变量
          </div>

          {/* 底部按钮 */}
          <div className="flex justify-between mt-8">
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                上一步
              </button>
            )}
            <button
              onClick={onNext}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              开始聊天！
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};