// components/DocumentOptionCard.tsx
import React from 'react';
import { Check } from 'lucide-react';

// Định nghĩa kiểu dữ liệu cho props
interface DocumentOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  recommended?: boolean;
}

interface DocumentOptionCardProps {
  option: DocumentOption;
  onSelect: (id: string) => void;
}

export const DocumentOptionCard: React.FC<DocumentOptionCardProps> = ({ option, onSelect }) => {
  return (
    <div
      key={option.id}
      className='relative flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-500 transition-all duration-300'
    >
      {/* Recommended Badge */}
      {option.recommended && (
        <div className='absolute top-4 right-4 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full'>
          RECOMMENDED
        </div>
      )}

      {/* Card Body */}
      <div className='p-6 flex-grow'>
        <div className='flex items-center gap-4 mb-4'>
          <div className='flex-shrink-0 bg-gray-100 p-3 rounded-lg'>{option.icon}</div>
          <div>
            <h3 className='text-xl font-bold text-gray-800'>{option.name}</h3>
            <p className='text-sm text-gray-500'>{option.description}</p>
          </div>
        </div>

        {/* Features List */}
        <div className='space-y-3 my-6'>
          {option.features.map((feature, index) => (
            <div key={index} className='flex items-start gap-3'>
              <Check className='w-4 h-4 text-green-500 mt-1 flex-shrink-0' />
              <p className='text-sm text-gray-600'>{feature}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Card Footer with Button */}
      <div className='p-6 pt-0 mt-ư'>
        <button
          onClick={() => onSelect(option.id)}
          className='w-full py-2.5 px-6 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
        >
          {option.name}
        </button>
      </div>
    </div>
  );
};
