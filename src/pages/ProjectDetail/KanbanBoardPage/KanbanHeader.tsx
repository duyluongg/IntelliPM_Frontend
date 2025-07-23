import React, { useState } from 'react';
import { ChevronDown, LineChart, SlidersHorizontal, MoreHorizontal } from 'lucide-react';

const KanbanHeader: React.FC<{ projectKey: string }> = ({ projectKey }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Thêm logic tìm kiếm
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white mb-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center border border-gray-300 rounded-md w-64 px-2 py-1">
          <svg className="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.098zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search issues..."
            className="flex-1 bg-white border-none outline-none text-sm text-gray-700"
          />
        </div>
        <button className="flex items-center border border-gray-300 px-3 py-1.5 rounded text-sm hover:bg-gray-50">
          Filter <ChevronDown className="w-4 h-4 ml-1" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 rounded hover:bg-gray-100"><LineChart className="w-5 h-5 text-gray-700" /></button>
        <button className="p-2 rounded hover:bg-gray-100"><SlidersHorizontal className="w-5 h-5 text-gray-700" /></button>
        <button className="p-2 rounded hover:bg-gray-100"><MoreHorizontal className="w-5 h-5 text-gray-700" /></button>
      </div>
    </div>
  );
};

export default KanbanHeader;