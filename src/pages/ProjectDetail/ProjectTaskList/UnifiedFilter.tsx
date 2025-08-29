
import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';

interface FilterOption {
  value: string;
  label: string;
  icon?: string;
}

interface UnifiedFilterProps {
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
  selectedType: string;
  setSelectedType: (value: string) => void;
  selectedLabel: string;
  setSelectedLabel: (value: string) => void;
  selectedPriority: string;
  setSelectedPriority: (value: string) => void;
  selectedStartDate: string;
  setSelectedStartDate: (value: string) => void;
  selectedDueDate: string;
  setSelectedDueDate: (value: string) => void;
  typeOptions: FilterOption[];
  labels: FilterOption[];
}

const UnifiedFilter: React.FC<UnifiedFilterProps> = ({
  selectedStatus,
  setSelectedStatus,
  selectedType,
  setSelectedType,
  selectedLabel,
  setSelectedLabel,
  selectedPriority,
  setSelectedPriority,
  selectedStartDate,
  setSelectedStartDate,
  selectedDueDate,
  setSelectedDueDate,
  typeOptions,
  labels,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>('Status');
  const [priorityOptions, setPriorityOptions] = useState<FilterOption[]>([
    { value: '', label: 'All Priorities' },
  ]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Status options
  const statusOptions: FilterOption[] = [
    { value: '', label: 'All Statuses' },
    { value: 'to_do', label: 'TO DO' },
    { value: 'in_progress', label: 'IN PROGRESS' },
    { value: 'done', label: 'DONE' },
  ];

  // Fetch priority options using RTK Query
  const { data: priorityData, isError, isLoading } = useGetCategoriesByGroupQuery('work_item_priority');

  useEffect(() => {
    if (priorityData?.isSuccess) {
      const priorities = priorityData.data.map((item) => ({
        value: item.name,
        label: item.label,
        icon: item.iconLink || undefined,
      }));
      setPriorityOptions([{ value: '', label: 'All Priorities' }, ...priorities]);
    }
    if (isError) {
      console.error('Error fetching priorities');
    }
  }, [priorityData, isError]);

  // Format date to YYYY-MM-DD
  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Parse string to Date for DatePicker
  const parseDate = (dateString: string): Date | null => {
    return dateString ? new Date(dateString) : null;
  };

  // Determine the display text for the button
  const getButtonText = () => {
    const activeFilters = [];
    if (selectedStatus)
      activeFilters.push(
        `Status: ${statusOptions.find((opt) => opt.value === selectedStatus)?.label || 'Unknown'}`
      );
    if (selectedType)
      activeFilters.push(`Type: ${typeOptions.find((opt) => opt.value === selectedType)?.label || 'Unknown'}`);
    if (selectedLabel)
      activeFilters.push(`Label: ${labels.find((opt) => opt.value === selectedLabel)?.label || 'Unknown'}`);
    if (selectedPriority)
      activeFilters.push(
        `Priority: ${priorityOptions.find((opt) => opt.value === selectedPriority)?.label || 'Unknown'}`
      );
    if (selectedStartDate || selectedDueDate)
      activeFilters.push(
        `Created: ${selectedStartDate || 'Any'} to ${selectedDueDate || 'Any'}`.trim()
      );
    return activeFilters.length > 0 ? activeFilters.join(', ') : 'All Filters';
  };

  // Handle filter selection
  const handleSelect = (category: string, value: string, isStart?: boolean) => {
    if (category === 'Status') {
      setSelectedStatus(value === selectedStatus ? '' : value);
    } else if (category === 'Type') {
      setSelectedType(value === selectedType ? '' : value);
    } else if (category === 'Label') {
      setSelectedLabel(value === selectedLabel ? '' : value);
    } else if (category === 'Priority') {
      setSelectedPriority(value === selectedPriority ? '' : value);
    } else if (category === 'Created') {
      if (isStart) {
        setSelectedStartDate(value);
      } else {
        setSelectedDueDate(value);
      }
    }
  };

  // Toggle section visibility
  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Filter Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center justify-between px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
        style={{ minWidth: '120px', whiteSpace: 'normal', overflow: 'visible' }}
      >
        <span className="break-words">{getButtonText()}</span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute z-10 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg">
          {/* Status Section */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('Status')}
              className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100"
            >
              <span>Status</span>
              <svg
                className={`w-4 h-4 transition-transform ${openSection === 'Status' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSection === 'Status' && (
              <div className="px-2 pb-2">
                {statusOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleSelect('Status', option.value)}
                    className={`flex items-center gap-2 px-2 py-1 text-sm text-gray-700 rounded hover:bg-blue-50 cursor-pointer ${
                      selectedStatus === option.value ? 'bg-blue-100 font-medium' : ''
                    }`}
                  >
                    <span>{option.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Type Section */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('Type')}
              className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100"
            >
              <span>Type</span>
              <svg
                className={`w-4 h-4 transition-transform ${openSection === 'Type' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSection === 'Type' && (
              <div className="px-2 pb-2">
                {typeOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleSelect('Type', option.value)}
                    className={`flex items-center gap-2 px-2 py-1 text-sm text-gray-700 rounded hover:bg-blue-50 cursor-pointer ${
                      selectedType === option.value ? 'bg-blue-100 font-medium' : ''
                    }`}
                  >
                    {option.icon && <img src={option.icon} alt={option.label} className="w-5 h-5 rounded" />}
                    <span>{option.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Label Section */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('Label')}
              className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100"
            >
              <span>Label</span>
              <svg
                className={`w-4 h-4 transition-transform ${openSection === 'Label' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSection === 'Label' && (
              <div className="px-2 pb-2">
                {labels.map((option) => (
                  <div
                    key={option.value || 'all-labels'}
                    onClick={() => handleSelect('Label', option.value)}
                    className={`flex items-center gap-2 px-2 py-1 text-sm text-gray-700 rounded hover:bg-blue-50 cursor-pointer ${
                      selectedLabel === option.value ? 'bg-blue-100 font-medium' : ''
                    }`}
                  >
                    <span>{option.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Priority Section */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('Priority')}
              className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100"
            >
              <span>Priority</span>
              <svg
                className={`w-4 h-4 transition-transform ${openSection === 'Priority' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSection === 'Priority' && (
              <div className="px-2 pb-2">
                {isLoading ? (
                  <div className="px-2 py-1 text-sm text-gray-500">Loading priorities...</div>
                ) : (
                  priorityOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => handleSelect('Priority', option.value)}
                      className={`flex items-center gap-2 px-2 py-1 text-sm text-gray-700 rounded hover:bg-blue-50 cursor-pointer ${
                        selectedPriority === option.value ? 'bg-blue-100 font-medium' : ''
                      }`}
                    >
                      {option.icon && <img src={option.icon} alt={option.label} className="w-5 h-5 rounded" />}
                      <span>{option.label}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Created Date Range Section */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('Created')}
              className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100"
            >
              <span>Created</span>
              <svg
                className={`w-4 h-4 transition-transform ${openSection === 'Created' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSection === 'Created' && (
              <div className="px-2 pb-2">
                <div className="flex gap-2 mb-2">
                  <DatePicker
                    selected={parseDate(selectedStartDate)}
                    onChange={(date: Date | null) => handleSelect('Created', formatDate(date), true)}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Start Date"
                    className="w-full px-2 py-1 text-sm text-gray-700 border border-gray-300 rounded hover:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    popperPlacement="bottom-start"
                    popperModifiers={[
                      {
                        name: 'preventOverflow',
                        options: { boundary: document.body },
                        fn: (state) => ({ ...state }),
                      },
                      {
                        name: 'flip',
                        options: { fallbackPlacements: ['bottom'] },
                        fn: (state) => ({ ...state }),
                      },
                    ]}
                    popperClassName="z-20"
                  />
                  <DatePicker
                    selected={parseDate(selectedDueDate)}
                    onChange={(date: Date | null) => handleSelect('Created', formatDate(date), false)}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Due Date"
                    className="w-full px-2 py-1 text-sm text-gray-700 border border-gray-300 rounded hover:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    popperPlacement="bottom-start"
                    popperModifiers={[
                      {
                        name: 'preventOverflow',
                        options: { boundary: document.body },
                        fn: (state) => ({ ...state }),
                      },
                      {
                        name: 'flip',
                        options: { fallbackPlacements: ['bottom'] },
                        fn: (state) => ({ ...state }),
                      },
                    ]}
                    popperClassName="z-20"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Clear Filter Button */}
          <div className="p-2 border-t border-gray-200">
            <button
              onClick={() => {
                setSelectedStatus('');
                setSelectedType('');
                setSelectedLabel('');
                setSelectedPriority('');
                setSelectedStartDate('');
                setSelectedDueDate('');
                setIsDropdownOpen(false);
              }}
              className="w-full px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
            >
              Clear Filter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedFilter;
