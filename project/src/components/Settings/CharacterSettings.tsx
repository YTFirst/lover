import { useState } from 'react';

const CharacterSettings: React.FC = () => {
  const [characterName, setCharacterName] = useState('心伴');
  const [characterAge, setCharacterAge] = useState('18');
  const [characterPersonality, setCharacterPersonality] = useState('温柔、善解人意、聪明伶俐');
  const [characterBackground, setCharacterBackground] = useState('你是一个AI虚拟女友，致力于为用户提供情感支持和陪伴。');
  const [characterAppearance, setCharacterAppearance] = useState('长发披肩，眼睛明亮，笑容甜美');

  const handleSave = () => {
    // 这里实现保存角色设定的逻辑
    console.log('Saving character settings...');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">角色设定</h2>
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* 角色名称 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">角色名称</label>
          <input 
            type="text" 
            value={characterName} 
            onChange={(e) => setCharacterName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* 角色年龄 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">角色年龄</label>
          <input 
            type="text" 
            value={characterAge} 
            onChange={(e) => setCharacterAge(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* 性格特点 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">性格特点</label>
          <input 
            type="text" 
            value={characterPersonality} 
            onChange={(e) => setCharacterPersonality(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* 背景故事 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">背景故事</label>
          <textarea 
            value={characterBackground} 
            onChange={(e) => setCharacterBackground(e.target.value)}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* 外貌描述 */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">外貌描述</label>
          <input 
            type="text" 
            value={characterAppearance} 
            onChange={(e) => setCharacterAppearance(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* 保存按钮 */}
        <button 
          onClick={handleSave}
          className="w-full py-3 bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium rounded-lg flex items-center justify-center gap-2"
        >
          <span>保存设定</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CharacterSettings;