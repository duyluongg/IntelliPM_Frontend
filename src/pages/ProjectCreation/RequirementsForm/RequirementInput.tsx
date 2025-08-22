import React, { useState, useEffect } from 'react';
import { ChevronDown, Trash2, FileText, Tag } from 'lucide-react';
import type { RequirementRequest } from '../../../services/requirementApi';
import type { DynamicCategoryResponse } from '../../../services/dynamicCategoryApi';
import { useGetByConfigKeyQuery } from '../../../services/systemConfigurationApi';
import { useSelector } from 'react-redux';
import { selectProjectId } from '../../../components/slices/Project/projectCreationSlice';

interface LocalRequirement extends RequirementRequest {
  uiId: string;
  id?: number;
  expanded?: boolean;
  titleError?: string;
  descriptionError?: string;
}

interface RequirementInputProps {
  req: LocalRequirement;
  prioritiesResponse: DynamicCategoryResponse | undefined;
  dropdownOpen: boolean;
  setDropdownOpen: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  dropdownRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
  updateRequirement: (id: string, field: keyof RequirementRequest, value: string) => void;
  toggleExpand: (id: string) => void;
  removeRequirement: (id: string) => void;
  onSave: () => Promise<boolean>;
}

const RequirementInput: React.FC<RequirementInputProps> = ({
  req,
  prioritiesResponse,
  dropdownOpen,
  setDropdownOpen,
  dropdownRefs,
  updateRequirement,
  toggleExpand,
  removeRequirement,
  onSave,
}) => {
  const projectId = useSelector(selectProjectId);
  const { data: titleLengthConfig, isLoading: isTitleLengthLoading } = useGetByConfigKeyQuery('title_length');
  const { data: descriptionLengthConfig, isLoading: isDescriptionLengthLoading } = useGetByConfigKeyQuery('description_length');
  const [touched, setTouched] = useState(false); // Track if the title input has been blurred
  const [showValidMessage, setShowValidMessage] = useState(false); // Track visibility of "Title is valid" message

  const selectedPriority = prioritiesResponse?.data?.find((p) => p.name === req.priority);

  const isTitleValid = !req.titleError && req.title.trim().length > 0;
  const isDescriptionValid = !req.descriptionError;

  // Handle showing and hiding the "Title is valid" message
  useEffect(() => {
    if (!req.titleError && req.title && isTitleValid) {
      setShowValidMessage(true);
      const timer = setTimeout(() => {
        setShowValidMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShowValidMessage(false);
    }
  }, [req.title, req.titleError, isTitleValid]);

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await onSave();
    }
  };

  return (
    <div className="bg-white border-2 border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          {/* Wrap input and validation messages in a container */}
          <div className="relative min-h-[60px]">
            <input
              type="text"
              value={req.title}
              onChange={(e) => updateRequirement(req.uiId, 'title', e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => setTouched(true)}
              placeholder="Requirement title"
              maxLength={Number(titleLengthConfig?.data?.maxValue || 255)}
              className={`flex-1 border-2 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] pr-10 ${
                (req.titleError || (touched && !isTitleValid)) ? 'border-red-400' : 'border-gray-200'
              }`}
              required
            />
            {/* Priority icon shifted upward */}
            {!req.expanded && req.priority && selectedPriority?.iconLink && (
              <div
                className="absolute right-3 top-2 w-6 h-6 rounded-sm border-2 flex items-center justify-center"
                style={{ borderColor: selectedPriority.color || '#1c73fd' }}
              >
                <img
                  src={selectedPriority.iconLink}
                  alt={`${selectedPriority.label} icon`}
                  className="w-4 h-4"
                />
              </div>
            )}
            {/* Validation messages in a separate div */}
            <div className="mt-1">
              {isTitleLengthLoading && <p className="text-gray-500 text-xs">Loading title constraints...</p>}
              {req.titleError && <p className="text-red-600 text-xs">{req.titleError}</p>}
              {!req.titleError && touched && !req.title && <p className="text-red-600 text-xs">Title is required.</p>}
              {showValidMessage && (
                <p className="text-green-600 text-xs">Title is valid.</p>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => toggleExpand(req.uiId)}
          type="button"
          className="text-[#1c73fd] hover:text-[#155ac7] transition"
          title="Toggle details"
        >
          <ChevronDown
            className={`w-6 h-6 transform transition ${req.expanded ? 'rotate-180' : ''}`}
          />
        </button>
        <button
          onClick={() => removeRequirement(req.uiId)}
          type="button"
          className="text-[#1c73fd] hover:text-[#155ac7] transition"
          title="Delete"
        >
          <Trash2 className="w-6 h-6" />
        </button>
      </div>

      {req.expanded && (
        <div className="grid grid-cols-4 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Tag className="w-5 h-5" /> Priority
            </label>
            <div
              className="relative"
              ref={(el) => {
                dropdownRefs.current[req.uiId] = el;
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setDropdownOpen((prev) => ({ ...prev, [req.uiId]: !prev[req.uiId] }))
                }
                onKeyDown={handleKeyDown}
                className="w-[180px] mt-2 border-2 border-gray-200 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] flex items-center justify-between"
              >
                <span className="flex items-center">
                  {selectedPriority?.iconLink && (
                    <img
                      src={selectedPriority.iconLink}
                      alt={`${selectedPriority.label} icon`}
                      className="w-5 h-5 mr-2"
                    />
                  )}
                  {selectedPriority?.label || '- Select priority -'}
                </span>
                <ChevronDown className="w-5 h-5" />
              </button>
              {dropdownOpen && (
                <div className="absolute z-10 w-[180px] mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg">
                  {prioritiesResponse?.data?.map((p) => (
                    <div
                      key={p.name}
                      onClick={() => {
                        updateRequirement(req.uiId, 'priority', p.name);
                        setDropdownOpen((prev) => ({ ...prev, [req.uiId]: false }));
                        onSave();
                      }}
                      className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {p.iconLink && (
                        <img
                          src={p.iconLink}
                          alt={`${p.label} icon`}
                          className="w-5 h-5 mr-2"
                        />
                      )}
                      {p.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="col-span-3">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Description
            </label>
            <textarea
              value={req.description}
              onChange={(e) => updateRequirement(req.uiId, 'description', e.target.value)}
              onKeyDown={handleKeyDown}
              rows={5}
              maxLength={Number(descriptionLengthConfig?.data?.maxValue || 1000)}
              className={`w-full mt-2 border-2 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] ${
                req.descriptionError ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {isDescriptionLengthLoading && <p className="text-gray-500 text-xs mt-1">Loading description constraints...</p>}
            {req.descriptionError && <p className="text-red-600 text-xs mt-1">{req.descriptionError}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default RequirementInput;