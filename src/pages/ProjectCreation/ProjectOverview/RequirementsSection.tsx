import React, { useState, useEffect, useRef } from 'react';
import {
  useCreateRequirementMutation,
  useUpdateRequirementMutation,
  useDeleteRequirementMutation,
  type RequirementRequest,
} from '../../../services/requirementApi';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import type { ProjectRequirement } from '../../../services/projectApi';
import { Trash2, FileText, ChevronDown } from 'lucide-react';

interface RequirementsSectionProps {
  requirements: ProjectRequirement[];
  projectId: number;
  refetch: () => void;
}

interface FetchBaseQueryError {
  status: number;
  data?: { message?: string };
}

interface RequirementItemProps {
  req: ProjectRequirement;
  projectId: number;
  refetch: () => void;
  isUpdating: boolean;
  touched: { [key: string]: { title: boolean; description: boolean; priority: boolean } };
  setTouched: React.Dispatch<React.SetStateAction<{ [key: string]: { title: boolean; description: boolean; priority: boolean } }>>;
  requirements: ProjectRequirement[];
}

const isFetchBaseQueryError = (error: unknown): error is FetchBaseQueryError =>
  typeof error === 'object' && error != null && 'status' in error && 'data' in error;

const RequirementItem: React.FC<RequirementItemProps> = ({ req, projectId, refetch, isUpdating, touched, setTouched, requirements }) => {
  const [updateRequirement] = useUpdateRequirementMutation();
  const [deleteRequirement] = useDeleteRequirementMutation();
  const [editedData, setEditedData] = useState<RequirementRequest>({
    title: req.title,
    type: req.type,
    description: req.description,
    priority: req.priority,
  });
  const { data: priorities, isLoading: isPrioritiesLoading } = useGetCategoriesByGroupQuery('requirement_priority');
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const priorityRef = useRef<HTMLDivElement>(null);

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({
      ...prev,
      [req.id]: { ...prev[req.id], [name]: true },
    }));
    if (name === 'title') {
      const isDuplicate = requirements.some((r) => r.title.trim().toLowerCase() === value.trim().toLowerCase() && r.id !== req.id);
      setTitleError(isDuplicate ? 'Title must be unique' : null);
    }
  };

  const handlePrioritySelect = (value: string) => {
    setEditedData((prev) => ({ ...prev, priority: value }));
    setTouched((prev) => ({
      ...prev,
      [req.id]: { ...prev[req.id], priority: true },
    }));
    setIsPriorityOpen(false);
  };

  const handleFieldBlur = async () => {
    if (!editedData.title || !editedData.priority || titleError) {
      setTouched((prev) => ({
        ...prev,
        [req.id]: { ...prev[req.id], title: true, priority: true },
      }));
      return;
    }
    if (
      editedData.title === req.title &&
      editedData.description === req.description &&
      editedData.priority === req.priority
    ) {
      return;
    }
    try {
      await updateRequirement({
        projectId,
        id: req.id,
        requirement: { ...editedData, type: req.type },
      }).unwrap();
      setTouched((prev) => ({ ...prev, [req.id]: { title: false, description: false, priority: false } }));
      refetch();
    } catch (error) {
      console.error('Failed to update requirement:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this requirement?')) {
      try {
        await deleteRequirement({ projectId, id: req.id }).unwrap();
        refetch();
      } catch (error) {
        console.error('Failed to delete requirement:', error);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (priorityRef.current && !priorityRef.current.contains(event.target as Node)) {
        setIsPriorityOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedPriority = priorities?.data.find((p) => p.name === editedData.priority);

  return (
    <div className="flex flex-col gap-4 p-4 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow hover:shadow-lg transition-all">
      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 text-red-500 hover:text-red-600 transition-transform duration-200 hover:scale-110"
        disabled={isUpdating}
        title="Delete requirement"
        aria-label={`Delete requirement ${req.title}`}
      >
        <Trash2 className="w-4 h-4" />
      </button>
      {isUpdating && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded-2xl">
          <svg className="animate-spin h-4 w-4 text-[#1c73fd]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#1c73fd]" /> Title *
          </label>
          <input
            name="title"
            type="text"
            value={editedData.title}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            required
            placeholder="Enter title"
            className={`mt-1 block w-full border border-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1c73fd]/30 focus:border-[#1c73fd] ${
              (touched[req.id]?.title && !editedData.title) || titleError ? 'border-red-400' : 'border-gray-200'
            }`}
            aria-invalid={(touched[req.id]?.title && !editedData.title) || titleError ? 'true' : 'false'}
            aria-describedby={`title-error-${req.id}`}
          />
          {(touched[req.id]?.title && !editedData.title && (
            <p id={`title-error-${req.id}`} className="text-red-600 text-xs mt-1">Title required</p>
          )) || (titleError && (
            <p id={`title-error-${req.id}`} className="text-red-600 text-xs mt-1">{titleError}</p>
          ))}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#1c73fd]" /> Priority *
          </label>
          <div className="relative mt-1" ref={priorityRef}>
            <button
              type="button"
              onClick={() => setIsPriorityOpen(!isPriorityOpen)}
              className={`w-full border border-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-900 text-left flex items-center justify-between bg-white ${
                (touched[req.id]?.priority && !editedData.priority) ? 'border-red-400' : 'border-gray-200'
              } ${isPrioritiesLoading ? 'opacity-50 cursor-not-allowed' : 'focus:outline-none focus:ring-2 focus:ring-[#1c73fd]/30 focus:border-[#1c73fd]'}`}
              disabled={isPrioritiesLoading}
              aria-expanded={isPriorityOpen}
              aria-haspopup="listbox"
            >
              <span className="flex items-center gap-2">
                {selectedPriority?.iconLink && <img src={selectedPriority.iconLink} alt="" className="w-4 h-4" />}
                {selectedPriority?.label || 'Select Priority'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            {isPriorityOpen && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-60 overflow-auto">
                {priorities?.data.map((priority) => (
                  <li
                    key={priority.id}
                    onClick={() => handlePrioritySelect(priority.name)}
                    className="px-3 py-1.5 text-sm hover:bg-[#1c73fd]/10 cursor-pointer flex items-center gap-2 text-gray-900"
                    role="option"
                    aria-selected={editedData.priority === priority.name}
                  >
                    {priority.iconLink && <img src={priority.iconLink} alt="" className="w-4 h-4" />}
                    {priority.label}
                  </li>
                ))}
              </ul>
            )}
            {touched[req.id]?.priority && !editedData.priority && (
              <p id={`priority-error-${req.id}`} className="text-red-600 text-xs mt-1">Priority required</p>
            )}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#1c73fd]" /> Description
          </label>
          <textarea
            name="description"
            value={editedData.description}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            rows={4}
            className="mt-1 block w-full border border-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1c73fd]/30 focus:border-[#1c73fd]"
            placeholder="Enter description"
          />
        </div>
      </div>
    </div>
  );
};

const RequirementsSection: React.FC<RequirementsSectionProps> = ({ requirements, projectId, refetch }) => {
  const [createRequirement, { isLoading: isCreating, error: createError }] = useCreateRequirementMutation();
  const [updateRequirement, { isLoading: isUpdating, error: updateError }] = useUpdateRequirementMutation();
  const [deleteRequirement, { isLoading: isDeleting, error: deleteError }] = useDeleteRequirementMutation();
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState<{ type: 'FUNCTIONAL' | 'NON_FUNCTIONAL' | null }>({ type: null });
  const [newRequirement, setNewRequirement] = useState<RequirementRequest>({
    title: '',
    type: 'FUNCTIONAL',
    description: '',
    priority: '',
  });
  const [touched, setTouched] = useState<{ [key: string]: { title: boolean; description: boolean; priority: boolean } }>({});
  const [titleError, setTitleError] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const { data: priorities, isLoading: isPrioritiesLoading } = useGetCategoriesByGroupQuery('requirement_priority');
  const priorityRef = useRef<HTMLDivElement>(null);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);

  const functionalReqs = requirements.filter((r) => r.type === 'FUNCTIONAL');
  const nonFunctionalReqs = requirements.filter((r) => r.type === 'NON_FUNCTIONAL');

  useEffect(() => {
    if (isCreatePopupOpen.type && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isCreatePopupOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (priorityRef.current && !priorityRef.current.contains(event.target as Node)) {
        setIsPriorityOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getErrorMessage = (error: unknown): string => {
    if (isFetchBaseQueryError(error)) {
      return error.data?.message || 'An error occurred.';
    }
    return 'An error occurred.';
  };

  const handleCreate = async () => {
    if (!newRequirement.title || !newRequirement.priority || titleError) {
      setTouched((prev) => ({ ...prev, 0: { ...prev[0], title: true, priority: true } }));
      return;
    }
    try {
      await createRequirement({
        projectId,
        requirement: { ...newRequirement, type: isCreatePopupOpen.type || 'FUNCTIONAL' },
      }).unwrap();
      setNewRequirement({ title: '', type: isCreatePopupOpen.type || 'FUNCTIONAL', description: '', priority: '' });
      setIsCreatePopupOpen({ type: null });
      setTouched((prev) => ({ ...prev, 0: { title: false, description: false, priority: false } }));
      setTitleError(null);
      refetch();
    } catch (error) {
      console.error('Failed to create requirement:', error);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewRequirement((prev) => ({ ...prev, title: value }));
    setTouched((prev) => ({ ...prev, 0: { ...prev[0], title: true } }));
    const isDuplicate = requirements.some((r) => r.title.trim().toLowerCase() === value.trim().toLowerCase());
    setTitleError(isDuplicate ? 'Title must be unique' : null);
  };

  const handlePrioritySelect = (value: string) => {
    setNewRequirement((prev) => ({ ...prev, priority: value }));
    setTouched((prev) => ({ ...prev, 0: { ...prev[0], priority: true } }));
    setIsPriorityOpen(false);
  };

  const selectedPriority = priorities?.data.find((p) => p.name === newRequirement.priority);

  const renderRequirements = (title: string, reqs: ProjectRequirement[], type: 'FUNCTIONAL' | 'NON_FUNCTIONAL') => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-[#1c73fd] border-l-4 border-[#1c73fd] pl-3">
          {title} ({reqs.length})
        </h3>
        <button
          onClick={() => setIsCreatePopupOpen({ type })}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-lg hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all duration-200 text-sm font-medium"
        >
          <FileText className="w-4 h-4" />
          Add
        </button>
      </div>
      {reqs.length === 0 ? (
        <p className="text-sm text-gray-600 italic">No {type.toLowerCase()} requirements. Click Add to create one.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {reqs.map((req) => (
            <RequirementItem
              key={req.id}
              req={req}
              projectId={projectId}
              refetch={refetch}
              isUpdating={isUpdating}
              touched={touched}
              setTouched={setTouched}
              requirements={requirements}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <section className="max-w-6xl mx-auto p-6 bg-white rounded-lg  mb-12">
      {(createError || updateError || deleteError) && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          Error: {getErrorMessage(createError || updateError || deleteError)}
        </div>
      )}
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2 border-[#1c73fd]/30">
        Project Requirements ({requirements.length})
      </h2>
      {renderRequirements('Functional Requirements', functionalReqs, 'FUNCTIONAL')}
      {renderRequirements('Non-Functional Requirements', nonFunctionalReqs, 'NON_FUNCTIONAL')}

      {isCreatePopupOpen.type && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 p-6 rounded-2xl shadow-md w-full max-w-md">
            {isCreating && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded-2xl">
                <svg className="animate-spin h-4 w-4 text-[#1c73fd]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            )}
            <h3 className="text-xl font-semibold text-[#1c73fd] mb-4 border-l-4 border-[#1c73fd] pl-3">
              Add {isCreatePopupOpen.type === 'FUNCTIONAL' ? 'Functional' : 'Non-Functional'} Requirement
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#1c73fd]" /> Title *
                </label>
                <input
                  ref={titleInputRef}
                  type="text"
                  placeholder="Enter title"
                  value={newRequirement.title}
                  onChange={handleTitleChange}
                  className={`mt-1 block w-full border border-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1c73fd]/30 focus:border-[#1c73fd] ${
                    (!newRequirement.title && touched[0]?.title) || titleError ? 'border-red-400' : 'border-gray-200'
                  }`}
                  onBlur={() => setTouched((prev) => ({ ...prev, 0: { ...prev[0], title: true } }))}
                  aria-invalid={(!newRequirement.title && touched[0]?.title) || titleError ? 'true' : 'false'}
                  aria-describedby="create-title-error"
                />
                {((!newRequirement.title && touched[0]?.title) && (
                  <p id="create-title-error" className="text-red-600 text-xs mt-1">Title required</p>
                )) || (titleError && (
                  <p id="create-title-error" className="text-red-600 text-xs mt-1">{titleError}</p>
                ))}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#1c73fd]" /> Priority *
                </label>
                <div className="relative mt-1" ref={priorityRef}>
                  <button
                    type="button"
                    onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                    className={`w-full border border-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-900 text-left flex items-center justify-between bg-white ${
                      (touched[0]?.priority && !newRequirement.priority) ? 'border-red-400' : 'border-gray-200'
                    } ${isPrioritiesLoading ? 'opacity-50 cursor-not-allowed' : 'focus:outline-none focus:ring-2 focus:ring-[#1c73fd]/30 focus:border-[#1c73fd]'}`}
                    disabled={isPrioritiesLoading}
                    aria-expanded={isPriorityOpen}
                    aria-haspopup="listbox"
                  >
                    <span className="flex items-center gap-2">
                      {selectedPriority?.iconLink && <img src={selectedPriority.iconLink} alt="" className="w-4 h-4" />}
                      {selectedPriority?.label || 'Select Priority'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>
                  {isPriorityOpen && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-60 overflow-auto">
                      {priorities?.data.map((priority) => (
                        <li
                          key={priority.id}
                          onClick={() => handlePrioritySelect(priority.name)}
                          className="px-3 py-1.5 text-sm hover:bg-[#1c73fd]/10 cursor-pointer flex items-center gap-2 text-gray-900"
                          role="option"
                          aria-selected={newRequirement.priority === priority.name}
                        >
                          {priority.iconLink && <img src={priority.iconLink} alt="" className="w-4 h-4" />}
                          {priority.label}
                        </li>
                      ))}
                    </ul>
                  )}
                  {touched[0]?.priority && !newRequirement.priority && (
                    <p id="create-priority-error" className="text-red-600 text-xs mt-1">Priority required</p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#1c73fd]" /> Description
                </label>
                <textarea
                  placeholder="Enter description"
                  value={newRequirement.description}
                  onChange={(e) => setNewRequirement({ ...newRequirement, description: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full border border-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1c73fd]/30 focus:border-[#1c73fd]"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsCreatePopupOpen({ type: null });
                  setTouched((prev) => ({ ...prev, 0: { title: false, description: false, priority: false } }));
                  setTitleError(null);
                }}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 text-sm font-medium"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-3 py-1.5 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-lg hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all duration-200 text-sm font-medium"
                disabled={isCreating || !newRequirement.title || !newRequirement.priority || !!titleError}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default RequirementsSection;