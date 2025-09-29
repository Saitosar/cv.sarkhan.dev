// src/components/ui/Tabs.tsx
"use client";

import React from 'react';

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200
        ${
          isActive
            ? 'bg-white/10 text-white shadow-inner' // Стиль для активной вкладки
            : 'text-white/60 hover:bg-white/5'   // Стиль для неактивной
        }
      `}
    >
      {label}
    </button>
  );
};


interface TabsProps<T extends string> {
  activeTab: T;
  onTabChange: (tab: T) => void;
  tabs: { id: T; label: string }[];
  children: React.ReactNode;
}

export function Tabs<T extends string>({ activeTab, onTabChange, tabs, children }: TabsProps<T>) {
  // --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
  // Мы явно проверяем, что child является валидным React элементом, 
  // а затем безопасно обращаемся к его props.
  const activeChild = React.Children.toArray(children).find(child => 
    React.isValidElement(child) && (child.props as { id: string }).id === activeTab
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-center p-2 bg-black/20 rounded-lg mb-4">
        <div className="flex items-center space-x-2 bg-white/5 p-1 rounded-lg">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              label={tab.label}
              isActive={activeTab === tab.id}
              onClick={() => onTabChange(tab.id)}
            />
          ))}
        </div>
      </div>
      <div className="flex-grow overflow-y-auto">
        {activeChild}
      </div>
    </div>
  );
}

// Компонент-обертка для контента вкладки
export const TabContent = ({ id, children }: { id: string, children: React.ReactNode }) => {
  return <div id={id}>{children}</div>;
};