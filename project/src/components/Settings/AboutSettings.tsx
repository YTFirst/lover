const AboutSettings: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">关于</h2>
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* 应用信息 */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">💖</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">心伴 HeartMate</h3>
          <p className="text-gray-500 mb-2">AI 虚拟女友助手</p>
          <p className="text-sm text-gray-400">版本 1.0.0</p>
        </div>

        {/* 功能介绍 */}
        <div className="mb-8">
          <h4 className="text-sm font-medium text-gray-700 mb-3">功能介绍</h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              <span className="text-sm text-gray-600">智能对话与情感交流</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              <span className="text-sm text-gray-600">个性化角色设定</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              <span className="text-sm text-gray-600">记忆与上下文理解</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              <span className="text-sm text-gray-600">多模型支持</span>
            </li>
          </ul>
        </div>

        {/* 联系与支持 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">联系我们</span>
            <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
              发送邮件
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">隐私政策</span>
            <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
              查看
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">用户协议</span>
            <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
              查看
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSettings;