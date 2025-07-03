import React, { useEffect, useState, useRef } from 'react';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import { useCreateRequirementsBulkMutation } from '../../../services/requirementApi';
import type {
  RequirementRequest,
  CreateRequirementsBulkResponse,
} from '../../../services/requirementApi';
import { ChevronDown, Trash2, FileText, Tag } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectProjectId } from '../../../components/slices/Project/projectCreationSlice';

interface LocalRequirement extends RequirementRequest {
  uiId: string;
  expanded?: boolean;
}

interface DynamicCategory {
  id: number;
  categoryGroup: string;
  name: string;
  label: string;
  description: string;
  isActive: boolean;
  orderIndex: number;
  iconLink: string | null;
  color: string | null;
  createdAt: string;
}

interface DynamicCategoryResponse {
  isSuccess: boolean;
  code: number;
  data: DynamicCategory[];
  message: string;
}

interface RequirementsFormProps {
  initialData?: {
    requirements: RequirementRequest[];
  };
  onNext: (data: RequirementRequest[]) => void;
  onBack: () => void;
}

const RequirementsForm: React.FC<RequirementsFormProps> = ({ initialData, onNext, onBack }) => {
  const [requirements, setRequirements] = useState<LocalRequirement[]>([]);
  const { data: prioritiesResponse } = useGetCategoriesByGroupQuery('requirement_priority');
  const [createRequirementsBulk, { error }] = useCreateRequirementsBulkMutation();
  const projectId = useSelector(selectProjectId); // number | undefined
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hiển thị form rỗng của Functional và Non-Functional ngay khi vào trang
    if (initialData?.requirements && initialData.requirements.length > 0) {
      setRequirements(
        initialData.requirements.map((req) => ({
          ...req,
          uiId: crypto.randomUUID(),
          expanded: true,
        }))
      );
    } else {
      // Luôn hiển thị 1 Functional và 1 Non-Functional rỗng ngay từ đầu
      setRequirements([
        {
          uiId: crypto.randomUUID(),
          title: '',
          type: 'FUNCTIONAL',
          description: '',
          priority: '',
          expanded: true,
        },
        {
          uiId: crypto.randomUUID(),
          title: '',
          type: 'NON_FUNCTIONAL',
          description: '',
          priority: '',
          expanded: true,
        },
      ]);
    }

    // Đóng dropdown khi click ra ngoài
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [initialData]);

  const addRequirement = (type: 'FUNCTIONAL' | 'NON_FUNCTIONAL') => {
    setRequirements((prev) => [
      ...prev,
      {
        uiId: crypto.randomUUID(),
        title: '',
        type,
        description: '',
        priority: '',
        expanded: true,
      },
    ]);
  };

  const updateRequirement = (id: string, field: keyof RequirementRequest, value: string) => {
    setRequirements((prev) => prev.map((r) => (r.uiId === id ? { ...r, [field]: value } : r)));
  };

  const toggleExpand = (id: string) => {
    setRequirements((prev) =>
      prev.map((r) => (r.uiId === id ? { ...r, expanded: !r.expanded } : r))
    );
  };

  const removeRequirement = (id: string) => {
    setRequirements((prev) => prev.filter((r) => r.uiId !== id));
  };

  const handleSubmit = async () => {
    const cleaned = requirements
      .map(({ uiId, expanded, ...req }) => req)
      .filter((req) => req.title.trim().length > 0);
    if (cleaned.length === 0) {
      console.error('No valid requirements to submit');
      return;
    }

    if (!projectId) {
      console.error('Project ID is not set:', projectId);
      return;
    }

    const validRequirements = cleaned.filter((req) => {
      return req.title.trim() && req.type && req.description.trim() && req.priority;
    });
    if (validRequirements.length !== cleaned.length) {
      console.error(
        'Some requirements are incomplete. Ensure all fields (title, type, description, priority) are filled.'
      );
      return;
    }

    console.log('Sending payload:', { projectId, requirements: cleaned });
    try {
      const result = await createRequirementsBulk({ projectId, requirements: cleaned }).unwrap();
      console.log('API Response:', result);
      onNext(cleaned);
    } catch (err) {
      console.error('Failed to create requirements:', err);
      if (err && typeof err === 'object' && 'data' in err) {
        const errorData = err as { data?: CreateRequirementsBulkResponse };
        if (errorData.data) {
          console.error('Server error details:', errorData.data);
        } else {
          console.error('No data in error response:', err);
        }
      } else {
        console.error('Unknown error structure:', err);
      }
    }
  };

  const renderRequirementInput = (req: LocalRequirement) => {
    const selectedPriorityData = req.priority
      ? prioritiesResponse?.data?.find((p) => p.name === req.priority)
      : null;

    return (
      <div
        key={req.uiId}
        className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition space-y-3"
      >
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={req.title}
              onChange={(e) => updateRequirement(req.uiId, 'title', e.target.value)}
              placeholder="Requirement title"
              className="flex-1 border px-3 py-2 rounded text-sm focus:ring-blue-500 focus:border-blue-500 pr-10"
              required
            />
            {!req.expanded &&
              req.priority &&
              prioritiesResponse?.data &&
              (() => {
                const priority = prioritiesResponse.data.find((p) => p.name === req.priority);
                if (!priority?.iconLink) return null;

                return (
                  <div
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-sm border-2 flex items-center justify-center"
                    style={{
                      borderColor: priority.color || 'gray',
                    }}
                  >
                    <img
                      src={priority.iconLink}
                      alt={`${priority.label} icon`}
                      className="w-4 h-4"
                    />
                  </div>
                );
              })()}
          </div>
          <button
            onClick={() => toggleExpand(req.uiId)}
            type="button"
            className="text-gray-600 hover:text-blue-600"
            title="Toggle details"
          >
            <ChevronDown
              className={`w-5 h-5 transform transition ${req.expanded ? 'rotate-180' : ''}`}
            />
          </button>
          <button
            onClick={() => removeRequirement(req.uiId)}
            type="button"
            className="text-red-500 hover:text-red-700"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {req.expanded && (
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Tag className="w-4 h-4" /> Priority
              </label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-[180px] mt-1 border px-3 py-1 rounded text-sm focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                >
                  <span className="flex items-center">
                    {req.priority &&
                      prioritiesResponse?.data?.find((p) => p.name === req.priority)?.iconLink && (
                        <img
                          src={
                            prioritiesResponse.data.find((p) => p.name === req.priority)
                              ?.iconLink || undefined
                          }
                          alt={`${
                            prioritiesResponse.data.find((p) => p.name === req.priority)?.label
                          } icon`}
                          className="w-4 h-4 mr-1"
                        />
                      )}
                    {prioritiesResponse?.data?.find((p) => p.name === req.priority)?.label ||
                      '-- Select priority --'}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {isOpen && (
                  <div className="absolute z-10 w-[180px] mt-1 bg-white border border-gray-200 rounded shadow-lg">
                    {prioritiesResponse?.data?.map((p) => (
                      <div
                        key={p.name}
                        onClick={() => {
                          updateRequirement(req.uiId, 'priority', p.name);
                          setIsOpen(false);
                        }}
                        className="flex items-center px-3 py-1 hover:bg-gray-100 cursor-pointer"
                      >
                        {p.iconLink && (
                          <img
                            src={p.iconLink || undefined}
                            alt={`${p.label} icon`}
                            className="w-4 h-4 mr-2"
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
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <FileText className="w-4 h-4" /> Description
              </label>
              <textarea
                value={req.description}
                onChange={(e) => updateRequirement(req.uiId, 'description', e.target.value)}
                rows={4}
                className="w-full mt-1 border px-3 py-2 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                required
              ></textarea>
            </div>
          </div>
        )}
      </div>
    );
  };

  const functional = requirements.filter((r) => r.type === 'FUNCTIONAL');
  const nonFunctional = requirements.filter((r) => r.type === 'NON_FUNCTIONAL');

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Project Requirements</h1>
      <p className="text-gray-600 mb-6 text-sm">
        Define your project's functional and non-functional requirements.
      </p>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Functional Requirements</h2>
          <button
            type="button"
            onClick={() => addRequirement('FUNCTIONAL')}
            className="text-blue-600 hover:underline text-sm"
          >
            + Add functional
          </button>
        </div>
        <div className="space-y-4">{functional.map(renderRequirementInput)}</div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Non-Functional Requirements</h2>
          <button
            type="button"
            onClick={() => addRequirement('NON_FUNCTIONAL')}
            className="text-blue-600 hover:underline text-sm"
          >
            + Add non-functional
          </button>
        </div>
        <div className="space-y-4">{nonFunctional.map(renderRequirementInput)}</div>
      </div>

      <div className="flex justify-between mt-10">
        <button onClick={onBack} className="px-4 py-2 text-sm border rounded hover:bg-gray-100">
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default RequirementsForm; 