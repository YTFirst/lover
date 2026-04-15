# 心伴 HeartMate - The Implementation Plan (Decomposed and Prioritized Task List)

## [ ] Task 1: 项目初始化与基础框架搭建
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 初始化 Electron + React + TypeScript 项目
  - 配置 Tailwind CSS、Zustand、better-sqlite3 等依赖
  - 创建项目目录结构
- **Acceptance Criteria Addressed**: [AC-5]
- **Test Requirements**:
  - `programmatic` TR-1.1: 项目可以成功安装依赖
  - `programmatic` TR-1.2: 项目可以成功启动
  - `human-judgement` TR-1.3: 目录结构符合规划
- **Notes**: 使用 Vite + Electron 模板

## [ ] Task 2: 主窗口与自定义标题栏
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 创建自定义标题栏
  - 实现窗口最小化、最大化、关闭功能
  - 实现无边框窗口
- **Acceptance Criteria Addressed**: [AC-5]
- **Test Requirements**:
  - `programmatic` TR-2.1: 窗口可以正常显示
  - `human-judgement` TR-2.2: 自定义标题栏功能正常
- **Notes**: 参考 ui_designs/01_main_window.jpg

## [ ] Task 3: 沉浸式渐变背景与侧边栏
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 实现沉浸式渐变背景（薰衣草紫→樱花粉）
  - 创建侧边栏导航组件
  - 实现路由系统（/setup, /, /settings）
- **Acceptance Criteria Addressed**: [AC-5]
- **Test Requirements**:
  - `human-judgement` TR-3.1: 渐变背景样式正确
  - `human-judgement` TR-3.2: 侧边栏导航可以切换页面
- **Notes**:

## [ ] Task 4: 基础组件库
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 创建毛玻璃卡片组件 (GlassCard)
  - 创建通用组件：Button、Toggle、Slider、Modal、Dropdown
- **Acceptance Criteria Addressed**: [AC-5]
- **Test Requirements**:
  - `human-judgement` TR-4.1: 组件样式符合设计规范
  - `human-judgement` TR-4.2: 组件交互正常
- **Notes**: 遵循设计规范中的色彩和圆角

## [ ] Task 5: SQLite 数据库初始化
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 初始化 better-sqlite3 数据库
  - 创建所需表结构（settings、character、conversations、messages）
  - 实现数据库服务
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `programmatic` TR-5.1: 数据库表创建成功
  - `programmatic` TR-5.2: 可以读写数据库
- **Notes**: 参考开发需求文档中的表结构

## [ ] Task 6: 首次设置向导 - Step 1
- **Priority**: P0
- **Depends On**: Task 3, Task 4, Task 5
- **Description**: 
  - 创建 StepBasicInfo 组件
  - 实现角色名字、头像、立绘选择
  - 实现预设图片选择和自定义上传
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `human-judgement` TR-6.1: 设置页面样式正确
  - `programmatic` TR-6.2: 可以输入角色名字
  - `programmatic` TR-6.3: 可以选择头像和立绘
- **Notes**:

## [ ] Task 7: 首次设置向导 - Step 2
- **Priority**: P0
- **Depends On**: Task 6
- **Description**: 
  - 创建 StepPrompt 组件
  - 实现 System Prompt 编辑器
  - 提供默认模板
  - 支持导入功能
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `human-judgement` TR-7.1: System Prompt 编辑器功能正常
  - `programmatic` TR-7.2: 默认模板正确加载
  - `programmatic` TR-7.3: 角色保存成功
- **Notes**:

## [ ] Task 8: LLM API 客户端
- **Priority**: P0
- **Depends On**: Task 5
- **Description**: 
  - 创建 LLM 客户端服务
  - 实现流式响应处理
  - 实现 Prompt 组装引擎
- **Acceptance Criteria Addressed**: [AC-2]
- **Test Requirements**:
  - `programmatic` TR-8.1: 可以发送 API 请求
  - `programmatic` TR-8.2: 可以接收流式响应
  - `programmatic` TR-8.3: 变量替换正确
- **Notes**: 支持 OpenAI 兼容 API

## [ ] Task 9: 沉浸式对话界面
- **Priority**: P0
- **Depends On**: Task 3, Task 4
- **Description**: 
  - 创建 ChatView 组件（角色立绘背景）
  - 创建 ChatPanel 组件（毛玻璃聊天面板）
  - 创建 MessageBubble 组件
  - 创建 MessageInput 组件
- **Acceptance Criteria Addressed**: [AC-2, AC-5]
- **Test Requirements**:
  - `human-judgement` TR-9.1: 对话界面样式正确
  - `human-judgement` TR-9.2: 毛玻璃效果正常
- **Notes**: 参考 ui_designs/08_chat_main.jpg

## [ ] Task 10: 对话历史与流式输出
- **Priority**: P0
- **Depends On**: Task 8, Task 9
- **Description**: 
  - 实现对话历史加载
  - 实现打字机效果
  - 实现消息发送与接收
- **Acceptance Criteria Addressed**: [AC-2]
- **Test Requirements**:
  - `programmatic` TR-10.1: 可以发送消息
  - `programmatic` TR-10.2: 可以接收流式输出
  - `programmatic` TR-10.3: 打字机效果正常
- **Notes**:

## [ ] Task 11: 记忆系统 - 文件管理
- **Priority**: P0
- **Depends On**: Task 5
- **Description**: 
  - 创建记忆文件管理服务
  - 实现每日记忆文件读写
  - 实现每周提炼文件读写
- **Acceptance Criteria Addressed**: [AC-3]
- **Test Requirements**:
  - `programmatic` TR-11.1: 可以创建记忆文件
  - `programmatic` TR-11.2: 可以读写记忆文件内容
- **Notes**: Markdown 格式存储

## [ ] Task 12: 记忆系统 - 自动生成
- **Priority**: P0
- **Depends On**: Task 8, Task 11
- **Description**: 
  - 实现每日记忆自动生成
  - 实现每周提炼生成
  - 实现记忆提取 Prompt
- **Acceptance Criteria Addressed**: [AC-3]
- **Test Requirements**:
  - `programmatic` TR-12.1: 可以生成每日记忆
  - `programmatic` TR-12.2: 可以生成每周提炼
- **Notes**: 使用 LLM 提取记忆

## [ ] Task 13: 记忆注入与管理 UI
- **Priority**: P1
- **Depends On**: Task 11, Task 12
- **Description**: 
  - 实现记忆注入到 Prompt
  - 创建记忆管理 UI（查看/编辑/删除）
  - 实现 Markdown 预览
- **Acceptance Criteria Addressed**: [AC-3, AC-4]
- **Test Requirements**:
  - `programmatic` TR-13.1: 记忆正确注入到对话
  - `human-judgement` TR-13.2: 记忆管理 UI 功能正常
- **Notes**: 参考 ui_designs/10_settings_memory.jpg

## [ ] Task 14: 设置系统
- **Priority**: P0
- **Depends On**: Task 3, Task 4, Task 5
- **Description**: 
  - 创建设置页面
  - 实现对话设置（API 配置、模型参数）
  - 实现角色设定编辑
  - 实现隐私与数据
  - 实现关于页面
- **Acceptance Criteria Addressed**: [AC-4]
- **Test Requirements**:
  - `human-judgement` TR-14.1: 设置页面功能正常
  - `programmatic` TR-14.2: 设置保存成功
- **Notes**: 参考 ui_designs/09_settings_chat.jpg 等

## [ ] Task 15: 系统托盘与最小化
- **Priority**: P1
- **Depends On**: Task 2
- **Description**: 
  - 实现系统托盘
  - 实现最小化到托盘
  - 实现托盘菜单
- **Acceptance Criteria Addressed**: []
- **Test Requirements**:
  - `human-judgement` TR-15.1: 托盘功能正常
- **Notes**:

## [ ] Task 16: 打磨与优化
- **Priority**: P1
- **Depends On**: Task 1-15
- **Description**: 
  - 实现深色主题
  - 完善动效
  - 异常处理
  - 错误提示
- **Acceptance Criteria Addressed**: [AC-5]
- **Test Requirements**:
  - `human-judgement` TR-16.1: 动效流畅
  - `human-judgement` TR-16.2: 错误提示友好
- **Notes**:
