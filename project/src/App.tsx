import { useState } from 'react'
import './App.css'
import { TestComponents } from './components/TestComponents'
import { StepBasicInfo } from './components/StepBasicInfo'
import ChatPage from './components/ChatPage'
import Settings from './components/Settings'
import { useThemeStore } from './store/themeStore'

function App() {
  const [isMaximized, setIsMaximized] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')

  const handleMinimize = () => {
    window.electron.minimize()
  }

  const handleMaximize = () => {
    window.electron.maximize()
    setIsMaximized(!isMaximized)
  }

  const handleClose = () => {
    window.electron.close()
  }

  const { isDark, toggleTheme } = useThemeStore()

  return (
    <div className={`w-full h-full flex flex-col ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} rounded-lg overflow-hidden shadow-lg transition-colors duration-300`}>
      {/* 自定义标题栏 */}
      <div 
        className="h-12 bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-between px-4 select-none"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="text-white font-semibold">心伴 HeartMate</div>
        <div className="flex gap-2" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <button 
            onClick={toggleTheme} 
            className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full"
          >
            <span className="text-white text-xl">{isDark ? '☀️' : '🌙'}</span>
          </button>
          <button 
            onClick={handleMinimize} 
            className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full"
          >
            <span className="text-white text-xl">−</span>
          </button>
          <button 
            onClick={handleMaximize} 
            className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full"
          >
            <span className="text-white text-xl">{isMaximized ? '⊟' : '⊞'}</span>
          </button>
          <button 
            onClick={handleClose} 
            className="w-8 h-8 flex items-center justify-center hover:bg-red-500 rounded-full"
          >
            <span className="text-white text-xl">×</span>
          </button>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex flex-1">
        {/* 左侧导航栏 */}
        <div className={`w-64 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-r p-4 transition-colors duration-300`}>
          <div className="mb-8">
            <h2 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-500'} mb-4`}>心伴 HeartMate</h2>
          </div>
          <nav className="space-y-2">
            <div 
              className={`p-3 rounded-lg font-medium flex items-center gap-3 cursor-pointer transition-colors duration-200 ${
                activeTab === 'chat' ? (isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700') : (isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
              }`}
              onClick={() => setActiveTab('chat')}
            >
              <span className="text-xl">💬</span>
              <span>对话</span>
            </div>
            <div 
              className={`p-3 rounded-lg font-medium flex items-center gap-3 cursor-pointer transition-colors duration-200 ${
                activeTab === 'character' ? (isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700') : (isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
              }`}
              onClick={() => setActiveTab('character')}
            >
              <span className="text-xl">👤</span>
              <span>角色</span>
            </div>
            <div 
              className={`p-3 rounded-lg font-medium flex items-center gap-3 cursor-pointer transition-colors duration-200 ${
                activeTab === 'settings' ? (isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700') : (isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
              }`}
              onClick={() => setActiveTab('settings')}
            >
              <span className="text-xl">⚙️</span>
              <span>设置</span>
            </div>
            <div 
              className={`p-3 rounded-lg font-medium flex items-center gap-3 cursor-pointer transition-colors duration-200 ${
                activeTab === 'communicate' ? (isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700') : (isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
              }`}
              onClick={() => setActiveTab('communicate')}
            >
              <span className="text-xl">📞</span>
              <span>沟通</span>
            </div>
            <div 
              className={`p-3 rounded-lg font-medium flex items-center gap-3 cursor-pointer transition-colors duration-200 ${
                activeTab === 'components' ? (isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700') : (isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
              }`}
              onClick={() => setActiveTab('components')}
            >
              <span className="text-xl">🧩</span>
              <span>组件</span>
            </div>
            <div 
              className={`p-3 rounded-lg font-medium flex items-center gap-3 cursor-pointer transition-colors duration-200 ${
                activeTab === 'setup' ? (isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700') : (isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
              }`}
              onClick={() => setActiveTab('setup')}
            >
              <span className="text-xl">🛠️</span>
              <span>设置向导</span>
            </div>
          </nav>
        </div>

        {/* 右侧主内容 */}
        <div className="flex-1">
          {activeTab === 'chat' && (
            <ChatPage />
          )}

          {activeTab === 'components' && (
            <TestComponents />
          )}

          {activeTab === 'setup' && (
            <StepBasicInfo 
              onNext={() => console.log('Next step')}
              onBack={() => console.log('Back step')}
            />
          )}

          {activeTab === 'settings' && (
            <Settings />
          )}

          {activeTab !== 'chat' && activeTab !== 'components' && activeTab !== 'setup' && activeTab !== 'settings' && (
            <div className={`h-full flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'} transition-colors duration-300`}>
              <div className="text-center">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{activeTab === 'character' ? '角色' : activeTab === 'communicate' ? '沟通' : activeTab} 页面</h2>
                <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>此页面正在开发中...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App