import React, { useState, useEffect, useRef } from 'react';
import {
  useUpdateProjectMutation,
  useCheckProjectKeyQuery,
  useCheckProjectNameQuery,
  type CreateProjectRequest,
} from '../../../services/projectApi';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import type { DynamicCategory } from '../../../services/dynamicCategoryApi';
import { AlertCircle } from 'lucide-react';

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
    <section className="max-w-7xl mx-auto p-6 bg-white rounded-2xl shadow-sm mb-12">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 border-b-2 pb-2 border-blue-100">
        Project Information
      </h2>
      {updateError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Error updating project: {(updateError as any)?.data?.message || 'Unknown error'}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 flex items-center gap-2">
              <span>Project Name *</span>
            </label>
            <input
              ref={nameInputRef}
              name="name"
              type="text"
              value={formData.name}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              required
              placeholder="Enter project name"
              className={`mt-1 block w-full border border-gray-200 px-4 py-2 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 ${
                touched.name && isNameUnique === false ? 'border-red-300' : touched.name && isNameUnique ? 'border-blue-500' : 'border-gray-200'
              }`}
              aria-describedby="name-error"
            />
            {touched.name && formData.name && isNameChecking && (
              <p className="mt-1.5 text-sm text-gray-500">Checking project name...</p>
            )}
            {touched.name && formData.name && isNameUnique === true && (
              <p className="mt-1.5 text-sm text-green-600">Project name is available.</p>
            )}
            {touched.name && formData.name && isNameUnique === false && (
              <p className="mt-1.5 text-sm text-red-600">Project name is already taken.</p>
            )}
            {touched.name && !formData.name && (
              <p className="mt-1.5 text-sm text-red-600">Project name is required.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 flex items-center gap-2">
              <span>Project Key *</span>
            </label>
            <input
              name="projectKey"
              type="text"
              value={formData.projectKey}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              required
              maxLength={10}
              placeholder="E.g., PROJECT"
              className={`mt-1 block w-full border border-gray-200 px-4 py-2 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 ${
                touched.projectKey && (isKeyFormatValid === false || isKeyUnique === false)
                  ? 'border-red-300'
                  : touched.projectKey && isKeyFormatValid && isKeyUnique !== false
                  ? 'border-blue-500'
                  : 'border-gray-200'
              }`}
              aria-describedby="projectKey-error"
            />
            {touched.projectKey && formData.projectKey && isKeyChecking && (
              <p className="mt-1.5 text-sm text-gray-500">Checking project key...</p>
            )}
            {touched.projectKey && formData.projectKey && isKeyFormatValid === false && (
              <p className="mt-1.5 text-sm text-red-600">
                Project key must start with an uppercase letter, followed by uppercase letters only, max 10 characters.
              </p>
            )}
            {touched.projectKey && formData.projectKey && isKeyFormatValid && isKeyUnique === true && (
              <p className="mt-1.5 text-sm text-green-600">Project key is available.</p>
            )}
            {touched.projectKey && formData.projectKey && isKeyFormatValid && isKeyUnique === false && (
              <p className="mt-1.5 text-sm text-red-600">Project key is already taken.</p>
            )}
            {touched.projectKey && !formData.projectKey && (
              <p className="mt-1.5 text-sm text-red-600">Project key is required.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 flex items-center gap-2">
              <span>Description</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              rows={4}
              placeholder="Enter project description"
              className="mt-1 block w-full border border-gray-200 px-4 py-2 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200"
            />
          </div>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 flex items-center gap-2">
              <span>Budget (VND) *</span>
            </label>
            <input
              name="budget"
              type="number"
              value={formData.budget === 0 ? '' : formData.budget}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              required
              min={1}
              placeholder="Enter budget in VND"
              className={`mt-1 block w-full border border-gray-200 px-4 py-2 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 ${
                touched.budget && isBudgetValid === false ? 'border-red-300' : 'border-gray-200'
              }`}
              aria-describedby="budget-error"
            />
            {touched.budget && formData.budget !== undefined && formData.budget > 0 && (
              <p className="mt-1.5 text-sm text-gray-500">{formatBudget(formData.budget)}</p>
            )}
            {touched.budget && formData.budget !== undefined && formData.budget <= 0 && (
              <p className="mt-1.5 text-sm text-red-600">Budget must be greater than 0 VND.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 flex items-center gap-2">
              <span>Project Type</span>
            </label>
            {isCategoryLoading ? (
              <p className="mt-1.5 text-sm text-gray-500">Loading project types...</p>
            ) : categoryError ? (
              <p className="mt-1.5 text-sm text-red-600">Failed to load project types. Please try again.</p>
            ) : (
              <select
                name="projectType"
                value={formData.projectType}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                className="mt-1 block w-full border border-gray-200 px-4 py-2 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200"
                disabled={isUpdating || !projectId || !categoryData?.isSuccess}
                aria-describedby="projectType-error"
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
            <label className="block text-sm font-medium text-gray-900 flex items-center gap-2">
              <span>Start Date</span>
            </label>
            <input
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              className="mt-1 block w-full border border-gray-200 px-4 py-2 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200"
              disabled={isUpdating || !projectId}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 flex items-center gap-2">
              <span>End Date</span>
            </label>
            <input
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              min={formData.startDate}
              className={`mt-1 block w-full border border-gray-200 px-4 py-2 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 ${
                touched.endDate && isDateValid === false ? 'border-red-300' : 'border-gray-200'
              }`}
              disabled={isUpdating || !projectId}
              aria-describedby="endDate-error"
            />
            {touched.endDate && formData.startDate && formData.endDate && isDateValid === false && (
              <p className="mt-1.5 text-sm text-red-600">End date must be after start date.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectInfoForm;