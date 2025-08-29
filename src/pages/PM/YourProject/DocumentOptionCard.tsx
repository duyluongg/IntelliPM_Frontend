// src/components/DocumentOptionCard.tsx
import React from 'react';
import { Check } from 'lucide-react';
import type { DocumentVisibility } from '../../../types/DocumentType';

interface DocumentOption {
  id: DocumentVisibility;
  name: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  recommended?: boolean;
}

interface DocumentOptionCardProps {
  option: DocumentOption;
  onSelect: (id: DocumentVisibility) => void;
}

export const DocumentOptionCard: React.FC<DocumentOptionCardProps> = ({ option, onSelect }) => {
  return (
    <button
      onClick={() => onSelect(option.id)}
      className='group relative flex w-full flex-col text-left bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-500 hover:-translate-y-1 transition-all duration-300 ease-in-out'
    >
      {/* Recommended Badge */}
      {option.recommended && (
        <div className='absolute top-4 right-4 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full'>
          RECOMMENDED
        </div>
      )}

      <div className='p-6 flex-grow flex flex-col'>
        <div className='flex items-center gap-4 mb-4'>
          <div className='flex-shrink-0 bg-slate-100 dark:bg-slate-700 p-3 rounded-lg'>
            {option.icon}
          </div>
          <div>
            <h3 className='text-xl font-bold text-slate-800 dark:text-white'>{option.name}</h3>
          </div>
        </div>
        <p className='text-sm text-slate-500 dark:text-slate-400 mb-6'>{option.description}</p>

        <div className='space-y-3 mt-auto'>
          {option.features.map((feature, index) => (
            <div key={index} className='flex items-start gap-3'>
              <Check className='w-4 h-4 text-blue-500 mt-1 flex-shrink-0' />
              <p className='text-sm text-slate-600 dark:text-slate-300'>{feature}</p>
            </div>
          ))}
        </div>
      </div>

      <div className='absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-blue-600 dark:text-blue-400 font-semibold text-sm'>
        Select &rarr;
      </div>
    </button>
  );
};
