import React, { useState, useEffect, useRef } from 'react';
import {
  useCreateRequirementMutation,
  useUpdateRequirementMutation,
  useDeleteRequirementMutation,
  type RequirementRequest,
} from '../../../services/requirementApi';
import type { ProjectRequirement } from '../../../services/projectApi';
import { Trash2, FileText, Tag } from 'lucide-react';

interface RequirementsSectionProps {
  requirements: ProjectRequirement[];
  projectId: number;
  refetch: () => void; // Simplified refetch type
}

interface FetchBaseQueryError {
  status: number;
  data?: { message?: string };
}

const isFetchBaseQueryError = (error: unknown): error is FetchBaseQueryError =>
  typeof error === 'object' && error != null && 'status' in error && 'data' in error;

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
  const titleInputRef = useRef<HTMLInputElement>(null);

  const functionalReqs = requirements.filter((r) => r.type === 'FUNCTIONAL');
  const nonFunctionalReqs = requirements.filter((r) => r.type === 'NON_FUNCTIONAL');

  useEffect(() => {
    if (isCreatePopupOpen.type && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isCreatePopupOpen]);

  const getErrorMessage = (error: unknown): string => {
    if (isFetchBaseQueryError(error)) {
      return error.data?.message || 'An error occurred.';
    }
    return 'An error occurred.';
  };

  const handleCreate = async () => {
    if (!newRequirement.title || !newRequirement.priority) {
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
      refetch();
    } catch (error) {
      console.error('Failed to create requirement:', error);
    }
  };

  const renderRequirements = (title: string, reqs: ProjectRequirement[], type: 'FUNCTIONAL' | 'NON_FUNCTIONAL') => (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] bg-clip-text text-transparent border-l-4 border-[#1c73fd] pl-3">
          {title} ({reqs.length})
        </h3>
        <button
          onClick={() => setIsCreatePopupOpen({ type })}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-lg hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium"
        >
          <FileText className="w-4 h-4" />
          Add {type === 'FUNCTIONAL' ? 'Functional' : 'Non-Functional'} Requirement
        </button>
      </div>
      {reqs.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No {type.toLowerCase()} requirements available. Click the button above to add one.</p>
      ) : (
        <div className="space-y-6">
          {reqs.map((req) => {
            const [editedData, setEditedData] = useState<RequirementRequest>({
              title: req.title,
              type: req.type,
              description: req.description,
              priority: req.priority,
            });

            const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
              const { name, value } = e.target;
              setEditedData((prev) => ({ ...prev, [name]: value }));
              setTouched((prev) => ({
                ...prev,
                [req.id]: { ...prev[req.id], [name]: true },
              }));
            };

            const handleFieldBlur = async () => {
              if (!editedData.title || !editedData.priority) {
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

            return (
              <div
                key={req.id}
                className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex justify-end mb-4">
                  <button
                    onClick={handleDelete}
                    className="text-red-500 hover:text-red-600 transition-transform duration-200 hover:scale-110"
                    disabled={isDeleting}
                    title="Delete requirement"
                    aria-label={`Delete requirement ${req.title}`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                {isUpdating && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded-lg">
                    <svg className="animate-spin h-5 w-5 text-[#1c73fd]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" /> Title *
                    </label>
                    <input
                      name="title"
                      type="text"
                      value={editedData.title}
                      onChange={handleFieldChange}
                      onBlur={handleFieldBlur}
                      required
                      placeholder="Enter requirement title"
                      className={`mt-1 block w-full border border-gray-300 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1c73fd]/30 focus:border-[#1c73fd] transition-all duration-200 ${
                        touched[req.id]?.title && !editedData.title ? 'border-red-400' : 'border-gray-300'
                      }`}
                      aria-invalid={touched[req.id]?.title && !editedData.title ? 'true' : 'false'}
                      aria-describedby={`title-error-${req.id}`}
                    />
                    {touched[req.id]?.title && !editedData.title && (
                      <p id={`title-error-${req.id}`} className="text-red-600 text-xs mt-1">
                        Title is required.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-500" /> Priority *
                    </label>
                    <select
                      name="priority"
                      value={editedData.priority}
                      onChange={handleFieldChange}
                      onBlur={handleFieldBlur}
                      required
                      className={`mt-1 block w-full border border-gray-300 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1c73fd]/30 focus:border-[#1c73fd] transition-all duration-200 ${
                        touched[req.id]?.priority && !editedData.priority ? 'border-red-400' : 'border-gray-300'
                      }`}
                      aria-invalid={touched[req.id]?.priority && !editedData.priority ? 'true' : 'false'}
                      aria-describedby={`priority-error-${req.id}`}
                    >
                      <option value="">Select Priority</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                    {touched[req.id]?.priority && !editedData.priority && (
                      <p id={`priority-error-${req.id}`} className="text-red-600 text-xs mt-1">
                        Priority is required.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" /> Description
                    </label>
                    <textarea
                      name="description"
                      value={editedData.description}
                      onChange={handleFieldChange}
                      onBlur={handleFieldBlur}
                      rows={4}
                      className="mt-1 block w-full border border-gray-300 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1c73fd]/30 focus:border-[#1c73fd] transition-all duration-200"
                      placeholder="Enter description"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <section className="max-w-5xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      {(createError || updateError || deleteError) && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          Error: {getErrorMessage(createError || updateError || deleteError)}
        </div>
      )}
      {renderRequirements('Functional Requirements', functionalReqs, 'FUNCTIONAL')}
      {renderRequirements('Non-Functional Requirements', nonFunctionalReqs, 'NON_FUNCTIONAL')}

      {isCreatePopupOpen.type && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 scale-100 hover:scale-[1.02]">
            {isCreating && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded-2xl">
                <svg className="animate-spin h-5 w-5 text-[#1c73fd]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
            <h3 className="text-lg font-semibold text-gray-800 mb-5 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] bg-clip-text text-transparent">
              Add New {isCreatePopupOpen.type === 'FUNCTIONAL' ? 'Functional' : 'Non-Functional'} Requirement
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" /> Title *
                </label>
                <input
                  ref={titleInputRef}
                  type="text"
                  placeholder="Enter title"
                  value={newRequirement.title}
                  onChange={(e) => setNewRequirement({ ...newRequirement, title: e.target.value })}
                  className={`mt-1 block w-full border border-gray-300 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1c73fd]/30 focus:border-[#1c73fd] transition-all duration-200 ${
                    !newRequirement.title && touched[0]?.title ? 'border-red-400' : 'border-gray-300'
                  }`}
                  onBlur={() => setTouched((prev) => ({ ...prev, 0: { ...prev[0], title: true } }))}
                  aria-invalid={!newRequirement.title && touched[0]?.title ? 'true' : 'false'}
                  aria-describedby="create-title-error"
                />
                {!newRequirement.title && touched[0]?.title && (
                  <p id="create-title-error" className="text-red-600 text-xs mt-1">
                    Title is required.
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-500" /> Priority *
                </label>
                <select
                  value={newRequirement.priority}
                  onChange={(e) => setNewRequirement({ ...newRequirement, priority: e.target.value })}
                  className={`mt-1 block w-full border border-gray-300 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1c73fd]/30 focus:border-[#1c73fd] transition-all duration-200 ${
                    !newRequirement.priority && touched[0]?.priority ? 'border-red-400' : 'border-gray-300'
                  }`}
                  onBlur={() => setTouched((prev) => ({ ...prev, 0: { ...prev[0], priority: true } }))}
                  aria-invalid={!newRequirement.priority && touched[0]?.priority ? 'true' : 'false'}
                  aria-describedby="create-priority-error"
                >
                  <option value="">Select Priority</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
                {!newRequirement.priority && touched[0]?.priority && (
                  <p id="create-priority-error" className="text-red-600 text-xs mt-1">
                    Priority is required.
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" /> Description
                </label>
                <textarea
                  placeholder="Enter description"
                  value={newRequirement.description}
                  onChange={(e) => setNewRequirement({ ...newRequirement, description: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1c73fd]/30 focus:border-[#1c73fd] transition-all duration-200"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsCreatePopupOpen({ type: null });
                  setTouched((prev) => ({ ...prev, 0: { title: false, description: false, priority: false } }));
                }}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 text-sm font-medium"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-5 py-2 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-lg hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all duration-200 text-sm font-medium"
                disabled={isCreating || !newRequirement.title || !newRequirement.priority}
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