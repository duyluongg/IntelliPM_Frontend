import React, { useEffect, useState, useRef } from 'react';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import { useCreateRequirementsBulkMutation } from '../../../services/requirementApi';
import type {
  RequirementRequest,
  CreateRequirementsBulkResponse,
} from '../../../services/requirementApi';
import { useSelector } from 'react-redux';
import { selectProjectId } from '../../../components/slices/Project/projectCreationSlice';
import RequirementInput from './RequirementInput';

interface LocalRequirement extends RequirementRequest {
  uiId: string;
  expanded?: boolean;
  titleError?: string;
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
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { data: prioritiesResponse } = useGetCategoriesByGroupQuery('requirement_priority');
  const [createRequirementsBulk] = useCreateRequirementsBulkMutation();
  const projectId = useSelector(selectProjectId);
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>({});
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (initialData?.requirements && initialData.requirements.length > 0) {
      setRequirements(
        initialData.requirements.map((req) => ({
          ...req,
          uiId: crypto.randomUUID(),
          expanded: true,
          titleError: '',
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
          titleError: '',
        },
        {
          uiId: crypto.randomUUID(),
          title: '',
          type: 'NON_FUNCTIONAL',
          description: '',
          priority: '',
          expanded: true,
          titleError: '',
        },
      ]);
    }

    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(dropdownRefs.current).forEach((uiId) => {
        if (
          dropdownRefs.current[uiId] &&
          !dropdownRefs.current[uiId]!.contains(event.target as Node)
        ) {
          setDropdownOpen((prev) => ({ ...prev, [uiId]: false }));
        }
      });
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
        titleError: '',
      },
    ]);
    setErrorMessage('');
  };

  const updateRequirement = (id: string, field: keyof RequirementRequest, value: string) => {
    setRequirements((prev) =>
      prev.map((r) => {
        if (r.uiId === id) {
          const updated = { ...r, [field]: value };
          if (field === 'title') {
            const trimmedTitle = value.trim().toLowerCase();
            const duplicates = prev
              .filter((req) => req.uiId !== id && req.title.trim().toLowerCase() === trimmedTitle)
              .map((req) => req.title.trim());
            updated.titleError =
              duplicates.length > 0
                ? `Title must be unique (duplicates: ${duplicates.join(', ')})`
                : '';
          }
          return updated;
        }
        return r;
      })
    );
    setErrorMessage('');
  };

  const toggleExpand = (id: string) => {
    setRequirements((prev) => {
      return prev.map((r) => {
        if (r.uiId === id) {
          return { ...r, expanded: !r.expanded };
        }
        return r;
      });
    });
  };

  const removeRequirement = (id: string) => {
    setRequirements((prev) => {
      const updated = prev.filter((r) => r.uiId !== id);
      return updated.map((r) => {
        const trimmedTitle = r.title.trim().toLowerCase();
        const duplicates = updated
          .filter((req) => req.uiId !== r.uiId && req.title.trim().toLowerCase() === trimmedTitle)
          .map((req) => req.title.trim());
        return {
          ...r,
          titleError:
            duplicates.length > 0
              ? `Title must be unique (duplicates: ${duplicates.join(', ')})`
              : '',
        };
      });
    });
    setErrorMessage('');
  };

  const handleSubmit = async () => {
    const cleaned = requirements
      .map(({ uiId, expanded, titleError, ...req }) => req)
      .filter((req) => req.title.trim().length > 0);

    if (cleaned.length === 0) {
      setErrorMessage('No valid requirements detected to submit. Please add at least one requirement.');
      return;
    }

    if (!projectId) {
      setErrorMessage('Project ID is not set.');
      return;
    }

    const titles = cleaned.map((req) => req.title.trim().toLowerCase());
    const duplicates = titles.filter((title, index) => titles.indexOf(title) !== index);
    if (duplicates.length > 0) {
      setErrorMessage(
        `Duplicate requirement titles found: ${duplicates.join(', ')}. Titles must be unique.`
      );
      return;
    }

    const validRequirements = cleaned.filter(
      (req) => req.title.trim() && req.type && req.description.trim() && req.priority
    );
    if (validRequirements.length !== cleaned.length) {
      setErrorMessage(
        'Some requirements are incomplete. Ensure all fields (title, type, description, priority) are filled.'
      );
      return;
    }

    try {
      const result = await createRequirementsBulk({ projectId, requirements: cleaned }).unwrap();
      setErrorMessage('');
      onNext(cleaned);
    } catch (err) {
      console.error('Failed to create requirements:', err);
      if (err && typeof err === 'object' && 'data' in err) {
        const errorData = err as { data?: CreateRequirementsBulkResponse };
        if (errorData.data) {
          setErrorMessage(
            `Server error: ${errorData.data.message || 'Failed to create requirements.'}`
          );
        } else {
          setErrorMessage('Failed to create requirements due to an unknown server error.');
        }
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
    }
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

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
          {errorMessage}
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">Functional Requirements</h2>
        <div className="space-y-6">
          {functional.map((req) => (
            <RequirementInput
              key={req.uiId}
              req={req}
              prioritiesResponse={prioritiesResponse}
              dropdownOpen={dropdownOpen[req.uiId] || false}
              setDropdownOpen={setDropdownOpen}
              dropdownRefs={dropdownRefs}
              updateRequirement={updateRequirement}
              toggleExpand={toggleExpand}
              removeRequirement={removeRequirement}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => addRequirement('FUNCTIONAL')}
          className="mt-4 text-[#1c73fd] hover:text-[#155ac7] hover:underline text-sm"
        >
          + Add functional
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">Non-Functional Requirements</h2>
        <div className="space-y-6">
          {nonFunctional.map((req) => (
            <RequirementInput
              key={req.uiId}
              req={req}
              prioritiesResponse={prioritiesResponse}
              dropdownOpen={dropdownOpen[req.uiId] || false}
              setDropdownOpen={setDropdownOpen}
              dropdownRefs={dropdownRefs}
              updateRequirement={updateRequirement}
              toggleExpand={toggleExpand}
              removeRequirement={removeRequirement}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => addRequirement('NON_FUNCTIONAL')}
          className="mt-4 text-[#1c73fd] hover:text-[#155ac7] hover:underline text-sm"
        >
          + Add non-functional
        </button>
      </div>

      <div className="flex justify-end mt-10">
      
        <button
          type="button"
          onClick={handleSubmit}
          className="px-16 py-4 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-xl hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all shadow-lg hover:shadow-xl text-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default RequirementsForm;