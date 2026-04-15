import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { Toggle } from './Toggle';
import { Slider } from './Slider';
import { Modal } from './Modal';
import { Dropdown } from './Dropdown';

export const TestComponents: React.FC = () => {
  const [toggleState, setToggleState] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);
  const [modalOpen, setModalOpen] = useState(false);

  const dropdownItems = [
    { id: '1', label: '选项 1', onClick: () => console.log('选项 1 被点击') },
    { id: '2', label: '选项 2', onClick: () => console.log('选项 2 被点击') },
    { id: '3', label: '选项 3', onClick: () => console.log('选项 3 被点击') },
  ];

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold text-center">组件测试</h1>

      <section>
        <h2 className="text-xl font-semibold mb-4">毛玻璃卡片组件</h2>
        <GlassCard className="max-w-md mx-auto">
          <h3 className="text-lg font-medium mb-2">毛玻璃卡片</h3>
          <p className="text-gray-700">这是一个带有毛玻璃效果的卡片组件，支持自定义内边距、圆角和类名。</p>
        </GlassCard>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">按钮组件</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">主要按钮</Button>
          <Button variant="secondary">次要按钮</Button>
          <Button variant="outline">轮廓按钮</Button>
          <Button variant="ghost">幽灵按钮</Button>
          <Button variant="destructive">危险按钮</Button>
          <Button variant="primary" size="sm">小按钮</Button>
          <Button variant="primary" size="md">中按钮</Button>
          <Button variant="primary" size="lg">大按钮</Button>
          <Button variant="primary" disabled>禁用按钮</Button>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">开关组件</h2>
        <div className="flex items-center space-x-4">
          <Toggle checked={toggleState} onChange={setToggleState} />
          <span>状态: {toggleState ? '开启' : '关闭'}</span>
          <Toggle checked={false} onChange={() => {}} disabled />
          <span>禁用状态</span>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">滑块组件</h2>
        <div className="max-w-md">
          <Slider
            value={sliderValue}
            min={0}
            max={100}
            step={1}
            onChange={setSliderValue}
          />
          <p className="mt-2 text-center">值: {sliderValue}</p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">模态框组件</h2>
        <Button variant="primary" onClick={() => setModalOpen(true)}>打开模态框</Button>
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="模态框标题"
          footer={
            <>
              <Button variant="outline" onClick={() => setModalOpen(false)}>取消</Button>
              <Button variant="primary" onClick={() => setModalOpen(false)}>确定</Button>
            </>
          }
        >
          <p>这是模态框的内容，支持自定义标题、内容和底部按钮。</p>
        </Modal>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">下拉菜单组件</h2>
        <Dropdown
          trigger={
            <Button variant="outline">
              下拉菜单
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
          }
          items={dropdownItems}
        />
      </section>
    </div>
  );
};
