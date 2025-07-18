import React from 'react';
import { ChevronDown, Trash2, FileText, Tag } from 'lucide-react';
import type { RequirementRequest } from '../../../services/requirementApi';
import type { DynamicCategoryResponse } from '../../../services/dynamicCategoryApi';

interface LocalRequirement extends RequirementRequest {
  uiId: string;
  expanded?: boolean;
  titleError?: string;
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
}) => {
  const selectedPriority = prioritiesResponse?.data?.find((p) => p.name === req.priority);

  return (
    <div className="bg-white border-2 border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={req.title}
            onChange={(e) => updateRequirement(req.uiId, 'title', e.target.value)}
            placeholder="Requirement title"
            className={`flex-1 border-2 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] pr-10 ${
              req.titleError ? 'border-red-400' : 'border-gray-200'
            }`}
            required
          />
          {req.titleError && <p className="text-red-600 text-xs mt-1">{req.titleError}</p>}
          {!req.expanded && req.priority && selectedPriority?.iconLink && (
            <div
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-sm border-2 flex items-center justify-center"
              style={{ borderColor: selectedPriority.color || '#1c73fd' }}
            >
              <img
                src={selectedPriority.iconLink}
                alt={`${selectedPriority.label} icon`}
                className="w-4 h-4"
              />
            </div>
          )}
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
              rows={5}
              className="w-full mt-2 border-2 border-gray-200 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd]"
              required
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RequirementInput;