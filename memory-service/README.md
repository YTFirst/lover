# 记忆文件管理服务

一个简单的 Node.js 服务，用于管理每日记忆和每周提炼文件，使用 Markdown 格式存储。

## 功能特性

- 每日记忆文件的读写操作
- 每周提炼文件的读写操作
- 自动创建目录结构
- 生成记忆模板
- 获取所有记忆文件列表
- 删除记忆文件

## 目录结构

```
memory-service/
├── config.js          # 配置文件
├── utils.js           # 工具类
├── MemoryService.js   # 核心服务类
├── example.js         # 示例代码
├── package.json       # 项目配置
└── memories/          # 存储记忆文件的目录
    ├── daily/         # 每日记忆目录
    └── weekly/        # 每周提炼目录
```

## 安装

1. 克隆或下载项目到本地
2. 进入项目目录
3. 安装依赖：

```bash
npm install
```

## 依赖

- Node.js
- dayjs (用于日期处理)

## 使用示例

### 基本用法

```javascript
const MemoryService = require('./MemoryService');

// 创建记忆服务实例
const memoryService = new MemoryService();

// 初始化服务（创建必要的目录结构）
memoryService.init();

// 创建今日的每日记忆模板
memoryService.createDailyMemoryTemplate();

// 读取今日的每日记忆
const dailyMemory = memoryService.readDailyMemory();

// 更新今日的每日记忆
memoryService.writeDailyMemory('记忆内容');

// 创建本周的每周提炼模板
memoryService.createWeeklyRefinementTemplate();

// 读取本周的每周提炼
const weeklyRefinement = memoryService.readWeeklyRefinement();

// 更新本周的每周提炼
memoryService.writeWeeklyRefinement('提炼内容');

// 获取所有每日记忆文件
const dailyFiles = memoryService.getAllDailyMemories();

// 获取所有每周提炼文件
const weeklyFiles = memoryService.getAllWeeklyRefinements();

// 删除今日的每日记忆
memoryService.deleteDailyMemory();

// 删除本周的每周提炼
memoryService.deleteWeeklyRefinement();
```

### 运行示例

```bash
node example.js
```

## 配置

可以在 `config.js` 文件中修改配置：

- `memoryRoot`: 记忆文件存储根目录
- `dailyDir`: 每日记忆目录
- `weeklyDir`: 每周提炼目录
- `dateFormat`: 日期格式
- `weekFormat`: 周格式

## 模板格式

### 每日记忆模板

```markdown
# YYYY-MM-DD 每日记忆

## 今日要事

## 学习收获

## 工作进展

## 生活感悟

## 明日计划
```

### 每周提炼模板

```markdown
# YYYY-W01 每周提炼

## 本周总结

## 学习成果

## 工作成就

## 生活反思

## 下周计划
```

## 注意事项

- 服务会自动创建必要的目录结构
- 所有文件以 Markdown 格式存储
- 日期格式为 YYYY-MM-DD
- 周格式为 YYYY-W01（ISO 周编号）
