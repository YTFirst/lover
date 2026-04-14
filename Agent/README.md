# Agent 文件夹结构说明

## 概述

Agent 文件夹包含了电子女友项目的智能体相关代码，采用模块化设计，便于维护和扩展。

## 目录结构

```
Agent/
├── config/          # 智能体配置
│   └── agent-config.js      # 智能体默认配置和风格定义
├── skill/           # 技能相关
│   ├── reminder-skill.js    # 提醒技能
│   └── care-skill.js        # 关怀通知技能
├── memory/          # 记忆相关
│   └── memory-manager.js    # 记忆管理器
└── prompts/         # 提示词
    └── system-prompts.js    # 系统提示词和生成函数
```

## 模块说明

### 1. config/ - 智能体配置

**agent-config.js**
- `DEFAULT_AGENTS`: 默认智能体配置
- `AGENT_STYLES`: 回复风格配置（温暖关怀、专业理性、轻松随意、文艺诗意）

### 2. skill/ - 技能模块

**reminder-skill.js**
- `ReminderSkill` 类：提醒技能管理器
- 支持多种提醒模式：一次性、每日、每周
- 自动解析用户消息中的提醒意图
- 提供通知推送功能

**care-skill.js**
- `CareSkill` 类：关怀通知管理器
- 预设关怀消息模板
- 定时发送早安、午安、晚安消息
- 支持自定义关怀时间和内容

### 3. memory/ - 记忆管理

**memory-manager.js**
- `MemoryManager` 类：记忆管理器
- 记忆的增删改查
- 记忆搜索和过滤
- 记忆格式化用于注入到对话中

### 4. prompts/ - 提示词管理

**system-prompts.js**
- `DEFAULT_SYSTEM_PROMPT`: 默认系统提示词
- `CRISIS_PROMPT`: 危机干预提示词
- `generateAgentSystemPrompt()`: 根据智能体配置生成系统提示词

## 使用方式

这些模块目前作为独立文件存在，展示了代码的模块化设计。在实际运行时，相关代码已集成在 `frontend/app.js` 中。

未来可以考虑：
1. 使用 ES6 模块化导入导出
2. 使用构建工具（如 Webpack、Vite）进行打包
3. 实现按需加载，优化性能

## 注意事项

1. 所有模块都支持 CommonJS 和浏览器环境
2. 使用 `if (typeof module !== 'undefined' && module.exports)` 进行环境检测
3. 类设计遵循单一职责原则，便于测试和维护
