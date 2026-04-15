import { useState } from 'react';

const PrivacySettings: React.FC = () => {
  const [dataCollection, setDataCollection] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [personalization, setPersonalization] = useState(true);

  const handleClearData = () => {
    // 这里实现清除数据的逻辑
    console.log('Clearing data...');
  };

  const handleExportData = () => {
    // 这里实现导出数据的逻辑
    console.log('Exporting data...');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">隐私与数据</h2>
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* 数据收集 */}
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-gray-700">数据收集</h3>
              <p className="text-xs text-gray-500 mt-1">允许收集使用数据以改进服务</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={dataCollection} 
                onChange={() => setDataCollection(!dataCollection)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>
        </div>

        {/* 分析 */}
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-gray-700">分析</h3>
              <p className="text-xs text-gray-500 mt-1">允许收集使用分析以优化体验</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={analytics} 
                onChange={() => setAnalytics(!analytics)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>
        </div>

        {/* 个性化 */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-gray-700">个性化</h3>
              <p className="text-xs text-gray-500 mt-1">根据使用习惯提供个性化内容</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={personalization} 
                onChange={() => setPersonalization(!personalization)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>
        </div>

        {/* 数据管理按钮 */}
        <div className="space-y-4">
          <button 
            onClick={handleClearData}
            className="w-full py-3 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg flex items-center justify-center gap-2"
          >
            <span>清除数据</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button 
            onClick={handleExportData}
            className="w-full py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-lg flex items-center justify-center gap-2"
          >
            <span>导出数据</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;