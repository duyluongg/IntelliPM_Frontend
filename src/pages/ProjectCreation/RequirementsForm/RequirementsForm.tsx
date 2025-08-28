import React, { useState, useEffect, useRef } from 'react';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import {
  useCreateRequirementMutation,
  useUpdateRequirementMutation,
  useDeleteRequirementMutation,
} from '../../../services/requirementApi';
import type {
  RequirementRequest,
  ApiResponse,
  RequirementResponse,
} from '../../../services/requirementApi';
import { useSelector } from 'react-redux';
import { selectProjectId } from '../../../components/slices/Project/projectCreationSlice';
import RequirementInput from './RequirementInput';

interface LocalRequirement extends RequirementRequest {
  uiId: string;
  id?: number;
  expanded?: boolean;
  titleError?: string;
}

interface RequirementsFormProps {
  initialData?: { requirements: Array<RequirementRequest & { id?: number }> };
  serverData?: RequirementResponse[];
  onNext: (data: RequirementRequest[]) => Promise<void>;
  onBack: () => void;
}

const RequirementsForm: React.FC<RequirementsFormProps> = ({ initialData, serverData, onNext, onBack }) => {
  const [requirements, setRequirements] = useState<LocalRequirement[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { data: prioritiesResponse } = useGetCategoriesByGroupQuery('requirement_priority');
  const [createRequirement] = useCreateRequirementMutation();
  const [updateRequirementMutation] = useUpdateRequirementMutation();
  const [deleteRequirement] = useDeleteRequirementMutation();
  const projectId = useSelector(selectProjectId);
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>({});
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (serverData && serverData.length > 0) {
      setRequirements(
        serverData.map((req) => ({
          id: req.id,
          uiId: req.id.toString(),
          title: req.title,
          type: req.type,
          description: req.description,
          priority: req.priority,
          expanded: true,
          titleError: '',
        }))
      );
    } else if (initialData?.requirements && initialData.requirements.length > 0) {
      setRequirements(
        initialData.requirements.map((req) => ({
          id: req.id,
          uiId: req.id ? req.id.toString() : crypto.randomUUID(),
          title: req.title || '',
          type: req.type || 'FUNCTIONAL',
          description: req.description || '',
          priority: req.priority || 'MEDIUM',
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
          priority: 'MEDIUM',
          expanded: true,
          titleError: '',
        },
        {
          uiId: crypto.randomUUID(),
          title: '',
          type: 'NON_FUNCTIONAL',
          description: '',
          priority: 'MEDIUM',
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
  }, [initialData, serverData]);

  const addRequirement = (type: 'FUNCTIONAL' | 'NON_FUNCTIONAL') => {
    setRequirements((prev) => [
      ...prev,
      {
        uiId: crypto.randomUUID(),
        title: '',
        type,
        description: '',
        priority: 'MEDIUM',
        expanded: true,
        titleError: '',
      },
    ]);
    setErrorMessage('');
  };

  const updateLocalRequirement = (id: string, field: keyof RequirementRequest, value: string) => {
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
    setRequirements((prev) =>
      prev.map((r) => (r.uiId === id ? { ...r, expanded: !r.expanded } : r))
    );
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

  // Hàm này chỉ để lưu dữ liệu, không submit form
  const handleSaveData = async () => {
    // Chỉ validate và lưu dữ liệu local, không gọi onNext
    const cleaned = requirements
      .filter((req) => req.title.trim().length > 0)
      .map(({ uiId, expanded, titleError, ...req }) => req);

    // Có thể thêm validation ở đây nếu cần
    setErrorMessage('');
    return true;
  };

  // Hàm này để submit form và chuyển sang bước tiếp theo
  const handleSubmitAndNext = async () => {
    const cleaned = requirements
      .filter((req) => req.title.trim().length > 0)
      .map(({ uiId, expanded, titleError, ...req }) => req);

    if (cleaned.length === 0) {
      setErrorMessage('Please add at least one valid requirement.');
      return false;
    }

    if (!projectId) {
      setErrorMessage('Project ID is not set.');
      return false;
    }

    const titles = cleaned.map((req) => req.title.trim().toLowerCase());
    const duplicates = titles.filter((title, index) => titles.indexOf(title) !== index);
    if (duplicates.length > 0) {
      setErrorMessage(
        `Duplicate requirement titles found: ${duplicates.join(', ')}. Titles must be unique.`
      );
      return false;
    }

    const validRequirements = cleaned.filter(
      (req) => req.title.trim() && req.type && req.description.trim() && req.priority
    );
    if (validRequirements.length !== cleaned.length) {
      setErrorMessage('All fields (title, type, description, priority) are required.');
      return false;
    }

    try {
      const initialReqs = serverData || [];
      const newReqs = cleaned.filter((req) => !req.id);
      const updatedReqs = cleaned.filter((req) =>
        req.id &&
        initialReqs.find(
          (init) =>
            init.id === req.id &&
            (init.title !== req.title ||
             init.type !== req.type ||
             init.description !== req.description ||
             init.priority !== req.priority)
        )
      );
      const deletedIds = initialReqs
        .filter((init) => !cleaned.some((req) => req.id === init.id))
        .map((init) => init.id);

      for (const req of newReqs) {
        await createRequirement({ projectId, requirement: req }).unwrap();
      }
      for (const req of updatedReqs) {
        if (req.id) {
          await updateRequirementMutation({ projectId, id: req.id, requirement: req }).unwrap();
        }
      }
      for (const id of deletedIds) {
        await deleteRequirement({ projectId, id }).unwrap();
      }

      setErrorMessage('');
      await onNext(cleaned);
      return true;
    } catch (err) {
      console.error('Failed to process requirements:', err);
      setErrorMessage('Failed to process requirements. Please try again.');
      return false;
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
              updateRequirement={updateLocalRequirement}
              toggleExpand={toggleExpand}
              removeRequirement={removeRequirement}
              onSave={handleSaveData} // Chỉ lưu dữ liệu, không submit
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
              updateRequirement={updateLocalRequirement}
              toggleExpand={toggleExpand}
              removeRequirement={removeRequirement}
              onSave={handleSaveData} // Chỉ lưu dữ liệu, không submit
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
          onClick={onBack}
          className="mr-4 px-16 py-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all shadow-lg hover:shadow-xl text-sm"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmitAndNext} // Chỉ khi bấm Next mới submit
          className="px-16 py-4 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-xl hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all shadow-lg hover:shadow-xl text-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default RequirementsForm;