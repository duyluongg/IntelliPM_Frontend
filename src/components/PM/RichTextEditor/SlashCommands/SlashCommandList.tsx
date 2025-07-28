// components/Editor/SlashCommands/SlashCommandList.tsx

import React, { useState, useEffect, useCallback } from 'react';

type SlashCommandListProps = {
  items: { title: string; icon: React.FC<any>; command: (props: any) => void }[];
  command: (item: any) => void;
};

export const SlashCommandList = React.forwardRef<HTMLDivElement, SlashCommandListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index];
        if (item) {
          command(item);
        }
      },
      [command, items]
    );

    useEffect(() => {
      const navigationKeys = ['ArrowUp', 'ArrowDown', 'Enter'];
      const onKeyDown = (e: KeyboardEvent) => {
        if (navigationKeys.includes(e.key)) {
          e.preventDefault();
          if (e.key === 'ArrowUp') {
            setSelectedIndex((prevIndex) => (prevIndex + items.length - 1) % items.length);
            return true;
          }
          if (e.key === 'ArrowDown') {
            setSelectedIndex((prevIndex) => (prevIndex + 1) % items.length);
            return true;
          }
          if (e.key === 'Enter') {
            selectItem(selectedIndex);
            return true;
          }
        }
        return false;
      };

      document.addEventListener('keydown', onKeyDown, true); // Use capture phase
      return () => {
        document.removeEventListener('keydown', onKeyDown, true);
      };
    }, [items, selectedIndex, selectItem]);

    if (items.length === 0) {
      return null;
    }

    return (
      <div
        ref={ref}
        className='z-50 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-2 overflow-hidden'
      >
        {items.map((item, index) => (
          <button
            key={item.title}
            className={`w-full flex items-center gap-3 p-2 text-left text-sm rounded-md transition-colors ${
              index === selectedIndex ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => selectItem(index)}
          >
            <item.icon className='w-5 h-5 text-gray-500' />
            <span>{item.title}</span>
          </button>
        ))}
      </div>
    );
  }
);

SlashCommandList.displayName = 'SlashCommandList';