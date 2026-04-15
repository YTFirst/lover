import { useState } from 'react';
import ChatSettings from './Settings/ChatSettings';
import CharacterSettings from './Settings/CharacterSettings';
import PrivacySettings from './Settings/PrivacySettings';
import AboutSettings from './Settings/AboutSettings';

interface SettingsProps {
  // No props needed
}

const Settings: React.FC<SettingsProps> = () => {
  const [settingsTab, setSettingsTab] = useState('chat');

  return (
    <div className="h-full flex bg-gray-50">
      {/* 左侧设置导航 */}
      <div className="w-64 bg-white border-r border-gray-200">
        <nav className="py-4">
          <div 
            className={`px-4 py-3 font-medium flex items-center gap-3 cursor-pointer ${settingsTab === 'chat' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'}`}
            onClick={() => setSettingsTab('chat')}
          >
            <span className="text-xl">💬</span>
            <span>对话设置</span>
          </div>
          <div 
            className={`px-4 py-3 font-medium flex items-center gap-3 cursor-pointer ${settingsTab === 'character' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'}`}
            onClick={() => setSettingsTab('character')}
          >
            <span className="text-xl">👤</span>
            <span>角色设定</span>
          </div>
          <div 
            className={`px-4 py-3 font-medium flex items-center gap-3 cursor-pointer ${settingsTab === 'privacy' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'}`}
            onClick={() => setSettingsTab('privacy')}
          >
            <span className="text-xl">🔒</span>
            <span>隐私与数据</span>
          </div>
          <div 
            className={`px-4 py-3 font-medium flex items-center gap-3 cursor-pointer ${settingsTab === 'about' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'}`}
            onClick={() => setSettingsTab('about')}
          >
            <span className="text-xl">ℹ️</span>
            <span>关于</span>
          </div>
        </nav>
      </div>

      {/* 右侧设置内容 */}
      <div className="flex-1 p-6">
        {settingsTab === 'chat' && <ChatSettings />}
        {settingsTab === 'character' && <CharacterSettings />}
        {settingsTab === 'privacy' && <PrivacySettings />}
        {settingsTab === 'about' && <AboutSettings />}
      </div>
    </div>
  );
};

export default Settings;