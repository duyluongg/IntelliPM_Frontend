import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SearchInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export default function SearchInput({ value, onChange, placeholder }: SearchInputProps) {
  return (
    <div className='relative w-full max-w-sm'>
      {/* Input */}
      <input
        type='text'
        name='search'
        id='search'
        className='
          block w-full rounded-md border border-gray-300 bg-white 
          py-1.5 pl-8 pr-2 text-sm text-gray-900
          placeholder:text-gray-400
          focus:border-blue-500 focus:ring-1 focus:ring-blue-500
          transition duration-150 ease-in-out
        '
        placeholder={placeholder || 'Search by title...'}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
