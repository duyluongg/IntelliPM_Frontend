import React from 'react';
import { FaSearch, FaChartBar } from 'react-icons/fa';
import {
  ChevronDown,
  LineChart,
  SlidersHorizontal,
  MoreHorizontal,
} from 'lucide-react'; // dùng Lucide cho icon đẹp

interface BacklogHeaderProps {
  members: { id: number; name: string; avatar?: string }[];
  onSearch: (query: string) => void;
}

const BacklogHeader: React.FC<BacklogHeaderProps> = ({ members, onSearch }) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b bg-white">
      {/* Left: Search + Members + Dropdowns */}
      <div className="flex items-center gap-4">
        {/* Search input */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search backlog..."
            className="pl-10 pr-4 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Members (hiển thị 1 + số lượng) */}
        <div className="flex items-center">
          <div className="relative w-8 h-8">
            <img
              src={members[0]?.avatar}
              alt={members[0]?.name}
              className="w-8 h-8 rounded-full object-cover border"
            />
            {members.length > 1 && (
              <div className="absolute -right-3 -bottom-1 bg-gray-100 border text-xs text-gray-700 px-1 rounded-full">
                +{members.length - 1}
              </div>
            )}
          </div>
        </div>

        {/* Dropdown: Epic */}
        <button className="flex items-center border border-gray-300 px-3 py-1.5 rounded text-sm hover:bg-gray-50">
          Epic <ChevronDown className="w-4 h-4 ml-1" />
        </button>

        {/* Dropdown: Type */}
        <button className="flex items-center border border-gray-300 px-3 py-1.5 rounded text-sm hover:bg-gray-50">
          Type <ChevronDown className="w-4 h-4 ml-1" />
        </button>
      </div>

      {/* Right: Icon Buttons */}
      <div className="flex items-center gap-2">
        <button className="p-2 rounded hover:bg-gray-100">
          <LineChart className="w-5 h-5 text-gray-700" />
        </button>
        <button className="p-2 rounded hover:bg-gray-100">
          <SlidersHorizontal className="w-5 h-5 text-gray-700" />
        </button>
        <button className="p-2 rounded hover:bg-gray-100">
          <MoreHorizontal className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default BacklogHeader;
