# 心伴 HeartMate - Product Requirement Document

## Overview
- **Summary**: 心伴 HeartMate 是一款 Windows 桌面端 AI 虚拟伴侣应用，用户可以自定义角色的名字、性格、外观和 System Prompt，通过文字对话与角色建立情感连接
- **Purpose**: 提供沉浸式的 AI 陪伴体验，让用户拥有完全定义一切，应用采用沉浸式设计，对话页面以角色立绘为背景，营造"和角色面对面聊天"的感觉
- **Target Users**: 想要 AI 虚拟陪伴的用户，希望拥有个性化 AI 角色的用户

## Goals
- 用户可以在首次使用时完整设定角色信息（名字、性格、外观、System Prompt）
- 提供流畅的 AI 文字对话体验，支持流式输出和打字机效果
- 实现 OpenClaw 模式的记忆系统，让角色能"记住"用户的一切
- 提供完整的设置系统，支持 API 配置、记忆管理、角色编辑等功能

## Non-Goals (Out of Scope)
- 语音通话 / TTS 语音合成
- Live2D 实时动画（使用静态立绘）
- 好感度/心情/状态系统
- 桌面宠物模式
- 多个角色管理
- UGC 社区/角色分享
- 付费系统

## Background & Context
- 技术栈：Electron + React + TypeScript + Tailwind CSS + better-sqlite3 + Zustand
- UI 风格：二次元动漫风，沉浸式渐变背景（薰衣草紫→樱花粉）
- 参考文档：development_requirements.md、prd_electronic_girlfriend.docx

## Functional Requirements
- **FR-1**: 首次启动与角色设定
  - 用户首次启动时显示设置向导
  - 支持角色名字、头像、立绘、System Prompt 设定
  - 提供默认 System Prompt 模板
- **FR-2**: AI 对话引擎
  - 支持与 AI 文字对话
  - 流式输出，打字机效果
  - 角色立绘背景的沉浸式对话界面
- **FR-3**: 记忆系统
  - OpenClaw 模式：每日记忆 + 每周提炼
  - Markdown 文件存储记忆，用户可编辑
  - 记忆自动注入对话
- **FR-4**: 设置系统
  - 对话设置（API 配置、模型参数）
  - 记忆管理（查看/编辑/删除记忆）
  - 角色设定编辑
  - 隐私与数据管理

## Non-Functional Requirements
- **NFR-1**: 流畅的用户体验，动效自然流畅
- **NFR-2**: 数据本地存储，保护用户隐私
- **NFR-3**: 代码结构清晰，易于维护

## Constraints
- **Technical**: Windows 10/11，Electron 33+，React 18
- **Business**: MVP 版本，聚焦核心功能
- **Dependencies**: OpenAI 兼容 API

## Assumptions
- 用户拥有有效的 OpenAI 或兼容 API Key
- 本地有足够的存储空间

## Acceptance Criteria

### AC-1: 首次设置向导
- **Given**: 用户首次启动应用
- **When**: 用户完成两步设置向导
- **Then**: 角色信息保存成功，进入对话主页
- **Verification**: `programmatic`

### AC-2: AI 对话
- **Given**: 用户已完成角色设定
- **When**: 用户发送消息
- **Then**: AI 以角色身份回复，支持流式输出
- **Verification**: `programmatic`

### AC-3: 记忆生成
- **Given**: 用户与角色对话
- **When**: 对话结束
- **Then**: 系统生成当日记忆文件
- **Verification**: `programmatic`

### AC-4: 设置系统
- **Given**: 用户打开设置页
- **When**: 用户修改设置
- **Then**: 设置保存并生效
- **Verification**: `programmatic`

### AC-5: UI 风格
- **Given**: 用户使用应用
- **When**: 浏览各个页面
- **Then**: UI 符合二次元动漫风格，沉浸式渐变背景
- **Verification**: `human-judgment`

## Open Questions
- 无
