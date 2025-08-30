
import React, { useState } from 'react';
import { FaFileExport } from 'react-icons/fa';

interface ExportDropdownProps {
  onExportExcel: () => void;
  onExportPDF: () => void;
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({ onExportExcel, onExportPDF }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleExport = (type: 'excel' | 'pdf') => {
    if (type === 'excel') {
      onExportExcel();
    } else {
      onExportPDF();
    }
    setIsDropdownOpen(false); 
  };

  return (
    <div className="relative">
      {/* Export Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center justify-between w-30 px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <div className="flex items-center gap-2">
          <FaFileExport className="w-4 h-4 text-gray-500" />
          <span>Export</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute z-20 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg">
          <div
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-green-50 cursor-pointer"
          >
            <FaFileExport className="w-4 h-4 text-green-500" />
            <span>Export to Excel</span>
          </div>
          <div
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-red-50 cursor-pointer"
          >
            <FaFileExport className="w-4 h-4 text-red-500" />
            <span>Export to PDF</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;
