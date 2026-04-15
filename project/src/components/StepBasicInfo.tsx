import React, { useState } from 'react';
import { GlassCard } from './GlassCard';

interface StepBasicInfoProps {
  onNext: () => void;
  onBack?: () => void;
}

interface CharacterImage {
  id: string;
  src: string;
  name: string;
}

export const StepBasicInfo: React.FC<StepBasicInfoProps> = ({ onNext, onBack }) => {
  const [characterName, setCharacterName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [selectedFullBody, setSelectedFullBody] = useState<string>('');

  const avatarOptions: CharacterImage[] = [
    {
      id: 'avatar1',
      src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTAgMjBDMzAgMjAgMTAgNDAgMTAgNjBDMTAgODAgMzAgMTAwIDUwIDEwMEM3MCAxMDAgOTAgODAgOTAgNjBDOTAgNDAgNzAgMjAgNTAgMjBaIiBmaWxsPSIjZmQ3YzRlIi8+PHN2ZyB4PSI1MCIgeT0iNTAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCI+PHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZmZmIi8+PC9zdmc+PC9zdmc+',
      name: '粉色头发'
    },
    {
      id: 'avatar2',
      src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTAgMjBDMzAgMjAgMTAgNDAgMTAgNjBDMTAgODAgMzAgMTAwIDUwIDEwMEM3MCAxMDAgOTAgODAgOTAgNjBDOTAgNDAgNzAgMjAgNTAgMjBaIiBmaWxsPSIjZmQ3YzRlIi8+PHN2ZyB4PSI1MCIgeT0iNTAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCI+PHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjMjIyIi8+PC9zdmc+PC9zdmc+',
      name: '黑色头发'
    },
    {
      id: 'avatar3',
      src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTAgMjBDMzAgMjAgMTAgNDAgMTAgNjBDMTAgODAgMzAgMTAwIDUwIDEwMEM3MCAxMDAgOTAgODAgOTAgNjBDOTAgNDAgNzAgMjAgNTAgMjBaIiBmaWxsPSIjZmQ3YzRlIi8+PHN2ZyB4PSI1MCIgeT0iNTAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCI+PHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZTFjMGJjIi8+PC9zdmc+PC9zdmc+',
      name: '棕色头发'
    }
  ];

  const fullBodyOptions: CharacterImage[] = [
    {
      id: 'fullbody1',
      src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTAgMTBDMzAgMTAgMTAgMzAgMTAgNTBDMTAgOTAgNTAgMTQwIDkwIDkwQzkwIDMwIDcwIDEwIDUwIDEwWiIgZmlsbD0iI2ZkN2M0ZSIvPjwvc3ZnPg==',
      name: '粉色头发立绘'
    },
    {
      id: 'fullbody2',
      src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTAgMTBDMzAgMTAgMTAgMzAgMTAgNTBDMTAgOTAgNTAgMTQwIDkwIDkwQzkwIDMwIDcwIDEwIDUwIDEwWiIgZmlsbD0iI2Y3N2M3NyIvPjwvc3ZnPg==',
      name: '黑色头发立绘'
    },
    {
      id: 'fullbody3',
      src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTAgMTBDMzAgMTAgMTAgMzAgMTAgNTBDMTAgOTAgNTAgMTQwIDkwIDkwQzkwIDMwIDcwIDEwIDUwIDEwWiIgZmlsbD0iI2Q5ODI2NiIvPjwvc3ZnPg==',
      name: '棕色头发立绘'
    }
  ];

  const handleAvatarChange = (avatarSrc: string) => {
    setSelectedAvatar(avatarSrc);
  };

  const handleFullBodyChange = (fullBodySrc: string) => {
    setSelectedFullBody(fullBodySrc);
  };

  const handleCustomAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedAvatar(event.target.result as string);
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
          setSelectedFullBody(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400 p-8">
      <GlassCard className="w-full max-w-md" padding="p-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-pink-200 flex items-center justify-center relative">
              {selectedAvatar ? (
                <img 
                  src={selectedAvatar} 
                  alt="Selected Avatar" 
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <img 
                  src={avatarOptions[0].src} 
                  alt="Default Avatar" 
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div className="absolute inset-0 rounded-full border-2 border-pink-400 animate-pulse"></div>
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-800">创建你的专属伙伴 💖</h2>
          <p className="text-gray-600 mt-2">给你的AI伙伴起个名字，选择她/他的样子</p>
        </div>

        <div className="space-y-6">
          {/* 角色名字输入 */}
          <div>
            <input
              type="text"
              placeholder="请输入角色名字..."
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* 角色头像选择 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">角色头像</h3>
            <div className="flex flex-wrap gap-3">
              {avatarOptions.map((avatar) => (
                <div
                  key={avatar.id}
                  className={`cursor-pointer rounded-lg border-2 ${selectedAvatar === avatar.src ? 'border-pink-500' : 'border-transparent'} hover:border-purple-300`}
                  onClick={() => handleAvatarChange(avatar.src)}
                >
                  <img
                    src={avatar.src}
                    alt={avatar.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                </div>
              ))}
              <div className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-300 w-12 h-12 flex items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomAvatarUpload}
                  className="hidden"
                  id="avatar-upload"
                />
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <span className="text-gray-400">📁</span>
                </label>
              </div>
            </div>
          </div>

          {/* 角色立绘选择 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">角色立绘</h3>
            <div className="flex flex-wrap gap-3">
              {fullBodyOptions.map((fullBody) => (
                <div
                  key={fullBody.id}
                  className={`cursor-pointer rounded-lg border-2 ${selectedFullBody === fullBody.src ? 'border-pink-500' : 'border-transparent'} hover:border-purple-300`}
                  onClick={() => handleFullBodyChange(fullBody.src)}
                >
                  <img
                    src={fullBody.src}
                    alt={fullBody.name}
                    className="w-20 h-28 rounded-lg object-cover"
                  />
                </div>
              ))}
              <div className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-300 w-20 h-28 flex items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomFullBodyUpload}
                  className="hidden"
                  id="fullbody-upload"
                />
                <label htmlFor="fullbody-upload" className="cursor-pointer">
                  <span className="text-gray-400">📁</span>
                </label>
              </div>
            </div>
          </div>

          {/* 下一步按钮 */}
          <div className="flex justify-end mt-8">
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 mr-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                上一步
              </button>
            )}
            <button
              onClick={onNext}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              下一步 →
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};