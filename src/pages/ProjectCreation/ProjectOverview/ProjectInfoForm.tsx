import React, { useState, useEffect, useRef } from 'react';
import {
  useUpdateProjectMutation,
  useCheckProjectKeyQuery,
  useCheckProjectNameQuery,
  type CreateProjectRequest,
} from '../../../services/projectApi';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import type { DynamicCategory } from '../../../services/dynamicCategoryApi';

interface TouchedFields {
  name: boolean;
  projectKey: boolean;
  budget: boolean;
  endDate: boolean;
}

interface ProjectInfoFormProps {
  projectId: number;
  initialData: CreateProjectRequest & { status?: string };
  projectKeyOriginal: string;
  projectNameOriginal: string;
  onUpdate: () => void;
}

const ProjectInfoForm: React.FC<ProjectInfoFormProps> = ({
  projectId,
  initialData,
  projectKeyOriginal,
  projectNameOriginal,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<CreateProjectRequest & { status?: string }>(initialData);
  const [touched, setTouched] = useState<TouchedFields>({
    name: false,
    projectKey: false,
    budget: false,
    endDate: false,
  });
  const [debouncedProjectKey, setDebouncedProjectKey] = useState(formData.projectKey);
  const [debouncedProjectName, setDebouncedProjectName] = useState(formData.name);
  const [isKeyFormatValid, setIsKeyFormatValid] = useState<boolean | null>(null);
  const [isKeyUnique, setIsKeyUnique] = useState<boolean | null>(null);
  const [isNameUnique, setIsNameUnique] = useState<boolean | null>(null);
  const [isBudgetValid, setIsBudgetValid] = useState<boolean | null>(null);
  const [isDateValid, setIsDateValid] = useState<boolean | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const projectKeyRegex = /^[A-Z][A-Z]{0,9}$/;
  const { data: keyCheckData, isFetching: isKeyChecking, error: keyCheckError } = useCheckProjectKeyQuery(
    debouncedProjectKey || '',
    { skip: !debouncedProjectKey || !projectKeyRegex.test(debouncedProjectKey) }
  );
  const { data: nameCheckData, isFetching: isNameChecking, error: nameCheckError } = useCheckProjectNameQuery(
    debouncedProjectName || '',
    { skip: !debouncedProjectName || debouncedProjectName.length < 3 }
  );
  const { data: categoryData, isLoading: isCategoryLoading, error: categoryError } = useGetCategoriesByGroupQuery('project_type');
  const [updateProject, { isLoading: isUpdating, error: updateError }] = useUpdateProjectMutation();

  useEffect(() => {
    setFormData(initialData);
    setDebouncedProjectKey(initialData.projectKey);
    setDebouncedProjectName(initialData.name);
  }, [initialData]);

  useEffect(() => {
    const keyHandler = setTimeout(() => setDebouncedProjectKey(formData.projectKey), 500);
    const nameHandler = setTimeout(() => setDebouncedProjectName(formData.name), 500);
    return () => {
      clearTimeout(keyHandler);
      clearTimeout(nameHandler);
    };
  }, [formData.projectKey, formData.name]);

  useEffect(() => {
    if (!formData.projectKey) {
      setIsKeyFormatValid(null);
      setIsKeyUnique(null);
      return;
    }
    const isFormatValid = projectKeyRegex.test(formData.projectKey);
    setIsKeyFormatValid(isFormatValid);
    if (isFormatValid) {
      if (keyCheckData?.data?.exists && formData.projectKey !== projectKeyOriginal) {
        setIsKeyUnique(false);
      } else if (keyCheckData?.data?.exists === false || formData.projectKey === projectKeyOriginal) {
        setIsKeyUnique(true);
      } else if (keyCheckError) {
        setIsKeyUnique(false);
      }
    } else {
      setIsKeyUnique(null);
    }
  }, [formData.projectKey, keyCheckData, keyCheckError, projectKeyOriginal]);

  useEffect(() => {
    if (!formData.name) {
      setIsNameUnique(null);
      return;
    }
    if (nameCheckData?.data?.exists && formData.name !== projectNameOriginal) {
      setIsNameUnique(false);
    } else if (nameCheckData?.data?.exists === false || formData.name === projectNameOriginal) {
      setIsNameUnique(true);
    } else if (nameCheckError) {
      setIsNameUnique(false);
    }
  }, [formData.name, nameCheckData, nameCheckError, projectNameOriginal]);

  useEffect(() => {
    setIsBudgetValid(formData.budget !== undefined && formData.budget > 0);
  }, [formData.budget]);

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        setIsDateValid(false);
        setFormData((prev) => ({ ...prev, endDate: formData.startDate }));
      } else {
        setIsDateValid(true);
      }
    } else {
      setIsDateValid(null);
    }
  }, [formData.startDate, formData.endDate]);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'projectKey'
          ? value.toUpperCase()
          : name === 'budget'
          ? parseFloat(value) || 0
          : value,
    }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (name === 'projectKey') {
      setIsKeyFormatValid(null);
      setIsKeyUnique(null);
    }
    if (name === 'name') {
      setIsNameUnique(null);
    }
  };

  const handleFieldBlur = async (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (!projectId) {
      console.error('Invalid project ID');
      return;
    }
    if (name === 'projectKey' && (!isKeyFormatValid || isKeyUnique === false)) return;
    if (name === 'name' && isNameUnique === false) return;
    if (name === 'budget' && isBudgetValid === false) return;
    if (name === 'endDate' && isDateValid === false) return;
    try {
      const response = await updateProject({
        id: projectId,
        body: {
          name: formData.name,
          projectKey: formData.projectKey,
          description: formData.description,
          budget: Number(formData.budget),
          projectType: formData.projectType,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : new Date().toISOString(),
        },
      }).unwrap();
      console.log('Project updated successfully:', response);
      onUpdate();
    } catch (err) {
      console.error('Error updating project:', err);
    }
  };

  const formatBudget = (value: number | undefined) => {
    if (value === undefined || value === 0) return '';
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        <span className="border-b-2 border-[#1c73fd] pb-1">Project Information</span>
      </h2>
      {updateError && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
          Error updating project: {(updateError as any)?.data?.message || 'Unknown error'}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#f0f6ff] border border-[#d0e3ff] p-6 rounded-2xl shadow-md space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Project Name *</label>
            <input
              ref={nameInputRef}
              name="name"
              type="text"
              value={formData.name}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              required
              placeholder="Enter project name"
              className={`mt-2 block w-full border-2 ${
                touched.name && isNameUnique === false
                  ? 'border-red-500'
                  : touched.name && isNameUnique
                  ? 'border-green-500'
                  : 'border-gray-200'
              } px-6 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] transition-all placeholder-gray-400 text-sm`}
            />
            {touched.name && formData.name && isNameChecking && (
              <p className="mt-1 text-sm text-gray-500">Checking project name...</p>
            )}
            {touched.name && formData.name && isNameUnique === true && (
              <p className="mt-1 text-sm text-green-500">Project name is available.</p>
            )}
            {touched.name && formData.name && isNameUnique === false && (
              <p className="mt-1 text-sm text-red-500">Project name is already taken.</p>
            )}
            {touched.name && !formData.name && (
              <p className="mt-1 text-sm text-red-500">Project name is required.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Project Key *</label>
            <input
              name="projectKey"
              type="text"
              value={formData.projectKey}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              required
              maxLength={10}
              placeholder="E.g., PROJECT"
              className={`mt-2 block w-full border-2 ${
                touched.projectKey && (isKeyFormatValid === false || isKeyUnique === false)
                  ? 'border-red-500'
                  : touched.projectKey && isKeyFormatValid && isKeyUnique !== false
                  ? 'border-green-500'
                  : 'border-gray-200'
              } px-6 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] transition-all placeholder-gray-400 text-sm`}
            />
            {touched.projectKey && formData.projectKey && isKeyChecking && (
              <p className="mt-1 text-sm text-gray-500">Checking project key...</p>
            )}
            {touched.projectKey && formData.projectKey && isKeyFormatValid === false && (
              <p className="mt-1 text-sm text-red-500">
                Project key must start with an uppercase letter, followed by uppercase letters only, max 10 characters.
              </p>
            )}
            {touched.projectKey && formData.projectKey && isKeyFormatValid && isKeyUnique === true && (
              <p className="mt-1 text-sm text-green-500">Project key is available.</p>
            )}
            {touched.projectKey && formData.projectKey && isKeyFormatValid && isKeyUnique === false && (
              <p className="mt-1 text-sm text-red-500">Project key is already taken.</p>
            )}
            {touched.projectKey && !formData.projectKey && (
              <p className="mt-1 text-sm text-red-500">Project key is required.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              rows={4}
              placeholder="Enter project description"
              className="mt-2 block w-full border-2 border-gray-200 px-6 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] transition-all placeholder-gray-400 text-sm"
            />
          </div>
        </div>
        <div className="bg-[#f0f6ff] border border-[#d0e3ff] p-6 rounded-2xl shadow-md space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Budget (VND) *</label>
            <input
              name="budget"
              type="number"
              value={formData.budget === 0 ? '' : formData.budget}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              required
              min={1}
              placeholder="Enter budget in VND"
              className={`mt-2 block w-full border-2 ${
                touched.budget && isBudgetValid === false
                  ? 'border-red-500'
                  : touched.budget && isBudgetValid
                  ? 'border-gray-200'
                  : 'border-gray-200'
              } px-6 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] transition-all placeholder-gray-400 text-sm`}
            />
            {touched.budget && formData.budget !== undefined && formData.budget > 0 && (
              <p className="mt-1 text-sm text-gray-500">{formatBudget(formData.budget)}</p>
            )}
            {touched.budget && formData.budget !== undefined && formData.budget <= 0 && (
              <p className="mt-1 text-sm text-red-500">Budget must be greater than 0 VND.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Project Type</label>
            {isCategoryLoading ? (
              <p className="mt-1 text-sm text-gray-500">Loading project types...</p>
            ) : categoryError ? (
              <p className="mt-1 text-sm text-red-500">Failed to load project types. Please try again.</p>
            ) : (
              <select
                name="projectType"
                value={formData.projectType}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                className="mt-2 block w-full border-2 border-gray-200 px-6 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] transition-all text-sm"
                disabled={isUpdating || !projectId || !categoryData?.isSuccess}
              >
                <option value="">Select Project Type</option>
                {categoryData?.data?.map((category: DynamicCategory) => (
                  <option key={category.id} value={category.name}>
                    {category.label}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              className="mt-2 block w-full border-2 border-gray-200 px-6 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] transition-all text-sm"
              disabled={isUpdating || !projectId}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              min={formData.startDate}
              className={`mt-2 block w-full border-2 ${
                touched.endDate && isDateValid === false ? 'border-red-500' : 'border-gray-200'
              } px-6 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] transition-all text-sm`}
              disabled={isUpdating || !projectId}
            />
            {touched.endDate && formData.startDate && formData.endDate && isDateValid === false && (
              <p className="mt-1 text-sm text-red-500">End date must be after start date.</p>
            )}
          </div>
          <p>
            <strong className="text-[#1c73fd] text-sm">Status:</strong>{' '}
            <span className="text-gray-800 text-sm">{formData.status || 'N/A'}</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProjectInfoForm;