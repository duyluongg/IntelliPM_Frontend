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
  const projectId = useSelector(selectProjectId);
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData?.requirements && initialData.requirements.length > 0) {
      setRequirements(
        initialData.requirements.map((req) => ({
          ...req,
          uiId: crypto.randomUUID(),
          expanded: true,
        }))
      );
    } else {
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
        className="bg-white border-2 border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={req.title}
              onChange={(e) => updateRequirement(req.uiId, 'title', e.target.value)}
              placeholder="Requirement title"
              className="flex-1 border-2 border-gray-200 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] pr-10"
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
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-sm border-2 flex items-center justify-center"
                    style={{ borderColor: priority.color || '#1c73fd' }}
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
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-[180px] mt-2 border-2 border-gray-200 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] flex items-center justify-between"
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
                          className="w-5 h-5 mr-2"
                        />
                      )}
                    {prioritiesResponse?.data?.find((p) => p.name === req.priority)?.label ||
                      '- Select priority -'}
                  </span>
                  <ChevronDown className="w-5 h-5" />
                </button>
                {isOpen && (
                  <div className="absolute z-10 w-[180px] mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg">
                    {prioritiesResponse?.data?.map((p) => (
                      <div
                        key={p.name}
                        onClick={() => {
                          updateRequirement(req.uiId, 'priority', p.name);
                          setIsOpen(false);
                        }}
                        className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      >
                        {p.iconLink && (
                          <img
                            src={p.iconLink || undefined}
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
    <div className="max-w-5xl mx-auto p-10 bg-white rounded-2xl shadow-xl border border-gray-100 text-sm">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-5 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] bg-clip-text text-transparent">
        Project Requirements
      </h1>
      <p className="text-gray-600 mb-8 text-base leading-relaxed">
        Define your project's functional and non-functional requirements.
      </p>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-800">Functional Requirements</h2>
          <button
            type="button"
            onClick={() => addRequirement('FUNCTIONAL')}
            className="text-[#1c73fd] hover:text-[#155ac7] hover:underline text-sm"
          >
            + Add functional
          </button>
        </div>
        <div className="space-y-6">{functional.map(renderRequirementInput)}</div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-800">Non-Functional Requirements</h2>
          <button
            type="button"
            onClick={() => addRequirement('NON_FUNCTIONAL')}
            className="text-[#1c73fd] hover:text-[#155ac7] hover:underline text-sm"
          >
            + Add non-functional
          </button>
        </div>
        <div className="space-y-6">{nonFunctional.map(renderRequirementInput)}</div>
      </div>

      <div className="flex justify-between mt-10">
        <button
          onClick={onBack}
          className="px-6 py-3 text-sm text-gray-600 hover:text-gray-800 font-medium underline transition"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="px-8 py-4 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-xl hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all shadow-lg hover:shadow-xl text-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default RequirementsForm;