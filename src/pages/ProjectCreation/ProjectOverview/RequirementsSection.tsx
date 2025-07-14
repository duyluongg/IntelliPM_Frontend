import React, { useState, useEffect, useRef } from 'react';
import {
  useCreateRequirementMutation,
  useUpdateRequirementMutation,
  useDeleteRequirementMutation,
  type RequirementRequest,
} from '../../../services/requirementApi';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import type { ProjectRequirement } from '../../../services/projectApi';
import { FileText, ChevronDown, X } from 'lucide-react';

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
    <div className="relative flex flex-col gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
      <button
        onClick={handleDelete}
        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-full p-1.5 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300"
        disabled={isUpdating}
        title={`Delete requirement ${req.title}`}
        aria-label={`Delete requirement ${req.title}`}
      >
        <X className="w-4 h-4" />
      </button>
      {isUpdating && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-2xl">
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" /> Title *
          </label>
          <input
            name="title"
            type="text"
            value={editedData.title}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            required
            placeholder="Enter title"
            className={`mt-1 block w-full border border-gray-200 px-4 py-2 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 ${
              (touched[req.id]?.title && !editedData.title) || titleError ? 'border-red-300' : 'border-gray-200'
            }`}
            aria-invalid={(touched[req.id]?.title && !editedData.title) || titleError ? 'true' : 'false'}
            aria-describedby={`title-error-${req.id}`}
          />
          {(touched[req.id]?.title && !editedData.title && (
            <p id={`title-error-${req.id}`} className="text-red-600 text-xs mt-1.5">Title required</p>
          )) || (titleError && (
            <p id={`title-error-${req.id}`} className="text-red-600 text-xs mt-1.5">{titleError}</p>
          ))}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" /> Priority *
          </label>
          <div className="relative mt-1" ref={priorityRef}>
            <button
              type="button"
              onClick={() => setIsPriorityOpen(!isPriorityOpen)}
              className={`w-full border border-gray-200 px-4 py-2 rounded-xl text-sm text-gray-900 text-left flex items-center justify-between bg-white ${
                (touched[req.id]?.priority && !editedData.priority) ? 'border-red-300' : 'border-gray-200'
              } ${isPrioritiesLoading ? 'opacity-50 cursor-not-allowed' : 'focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500'}`}
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
              <ul className="absolute z-50 w-full bg-white border border-gray-100 rounded-xl mt-2 shadow-lg max-h-60 overflow-auto">
                {priorities?.data.map((priority) => (
                  <li
                    key={priority.id}
                    onClick={() => handlePrioritySelect(priority.name)}
                    className={`px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer flex items-center gap-2 text-gray-900 transition-colors duration-200 ${
                      editedData.priority === priority.name ? 'bg-blue-50' : ''
                    } focus:outline-none focus:bg-blue-50`}
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
              <p id={`priority-error-${req.id}`} className="text-red-600 text-xs mt-1.5">Priority required</p>
            )}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" /> Description
          </label>
          <textarea
            name="description"
            value={editedData.description}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            rows={4}
            className="mt-1 block w-full border border-gray-200 px-4 py-2 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
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
        <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-blue-500 pl-4">
          {title} ({reqs.length})
        </h3>
        <button
          onClick={() => setIsCreatePopupOpen({ type })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <FileText className="w-4 h-4" />
          Add
        </button>
      </div>
      {reqs.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No {type.toLowerCase()} requirements. Click Add to create one.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
    <section className="max-w-7xl mx-auto p-6 bg-white rounded-2xl shadow-sm mb-12">
      {(createError || updateError || deleteError) && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Error: {getErrorMessage(createError || updateError || deleteError)}
        </div>
      )}
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 border-b-2 pb-2 border-blue-100">
        Project Requirements ({requirements.length})
      </h2>
      {renderRequirements('Functional Requirements', functionalReqs, 'FUNCTIONAL')}
      {renderRequirements('Non-Functional Requirements', nonFunctionalReqs, 'NON_FUNCTIONAL')}

      {isCreatePopupOpen.type && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-xl w-full max-w-md relative">
            {isCreating && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-2xl">
                <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            )}
            <h3 className="text-xl font-semibold text-gray-900 mb-4 border-l-4 border-blue-500 pl-4">
              Add {isCreatePopupOpen.type === 'FUNCTIONAL' ? 'Functional' : 'Non-Functional'} Requirement
            </h3>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" /> Title *
                </label>
                <input
                  ref={titleInputRef}
                  type="text"
                  placeholder="Enter title"
                  value={newRequirement.title}
                  onChange={handleTitleChange}
                  className={`mt-1 block w-full border border-gray-200 px-4 py-2 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 ${
                    (!newRequirement.title && touched[0]?.title) || titleError ? 'border-red-300' : 'border-gray-200'
                  }`}
                  onBlur={() => setTouched((prev) => ({ ...prev, 0: { ...prev[0], title: true } }))}
                  aria-invalid={(!newRequirement.title && touched[0]?.title) || titleError ? 'true' : 'false'}
                  aria-describedby="create-title-error"
                />
                {((!newRequirement.title && touched[0]?.title) && (
                  <p id="create-title-error" className="text-red-600 text-xs mt-1.5">Title required</p>
                )) || (titleError && (
                  <p id="create-title-error" className="text-red-600 text-xs mt-1.5">{titleError}</p>
                ))}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" /> Priority *
                </label>
                <div className="relative mt-1" ref={priorityRef}>
                  <button
                    type="button"
                    onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                    className={`w-full border border-gray-200 px-4 py-2 rounded-xl text-sm text-gray-900 text-left flex items-center justify-between bg-white ${
                      (touched[0]?.priority && !newRequirement.priority) ? 'border-red-300' : 'border-gray-200'
                    } ${isPrioritiesLoading ? 'opacity-50 cursor-not-allowed' : 'focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500'}`}
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
                    <ul className="absolute z-50 w-full bg-white border border-gray-100 rounded-xl mt-2 shadow-lg max-h-60 overflow-auto">
                      {priorities?.data.map((priority) => (
                        <li
                          key={priority.id}
                          onClick={() => handlePrioritySelect(priority.name)}
                          className={`px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer flex items-center gap-2 text-gray-900 transition-colors duration-200 ${
                            newRequirement.priority === priority.name ? 'bg-blue-50' : ''
                          } focus:outline-none focus:bg-blue-50`}
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
                    <p id="create-priority-error" className="text-red-600 text-xs mt-1.5">Priority required</p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" /> Description
                </label>
                <textarea
                  placeholder="Enter description"
                  value={newRequirement.description}
                  onChange={(e) => setNewRequirement({ ...newRequirement, description: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full border border-gray-200 px-4 py-2 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsCreatePopupOpen({ type: null });
                  setTouched((prev) => ({ ...prev, 0: { title: false, description: false, priority: false } }));
                  setTitleError(null);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-300"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-300"
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