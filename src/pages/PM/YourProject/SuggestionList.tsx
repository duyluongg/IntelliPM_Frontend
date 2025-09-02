// SuggestionList.tsx
import React from 'react';
import { type SuggestionProps } from '@tiptap/suggestion';
import { User } from 'lucide-react';

interface MentionItem {
  id: string | number;
  label: string;
  name?: string;
  avatarUrl?: string;
}
type Props = SuggestionProps<MentionItem> & { selectedIndex?: number };

export default function SuggestionList({ items, command, selectedIndex }: Props) {
  return (
    <div className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800'>
      <div className='relative max-h-56 w-64 overflow-y-auto p-2'>
        {items.length === 0 ? (
          <div className='p-2 text-sm text-gray-500 dark:text-gray-400'>No users found.</div>
        ) : (
          items.map((item, index) => (
            <button
              key={item.id}
              className={`flex w-full items-center gap-3 rounded-md p-2 text-left text-sm transition-colors duration-150 ease-in-out
                ${
                  index === selectedIndex
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' // 👈 Style khi được chọn
                    : 'text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700/50' // 👈 Style mặc định và khi hover
                }
              `}
              onClick={() => command(item)}
            >
              {item.avatarUrl ? (
                <img
                  src={item.avatarUrl}
                  alt={item.name || item.label}
                  className='h-8 w-8 rounded-full object-cover'
                />
              ) : (
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700'>
                  <User className='h-5 w-5 text-gray-500 dark:text-gray-400' />
                </div>
              )}
              <span className='font-medium'>{item.name || item.label}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
