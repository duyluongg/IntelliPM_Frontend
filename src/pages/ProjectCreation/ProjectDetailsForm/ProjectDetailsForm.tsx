import React, { useState, useEffect, useRef } from 'react';
import {
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useCheckProjectKeyQuery,
  useLazyCheckProjectKeyQuery,
  useCheckProjectNameQuery,
} from '../../../services/projectApi';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import type { ProjectFormData } from '../ProjectCreation';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { DynamicCategory } from '../../../services/dynamicCategoryApi';
import { useDispatch } from 'react-redux';
import { setProjectId } from '../../../components/slices/Project/projectCreationSlice';

interface ProjectDetailsFormProps {
  initialData: ProjectFormData;
  serverData?: ProjectFormData;
  onNext: (data: Partial<ProjectFormData>) => Promise<void>;
}

const ProjectDetailsForm: React.FC<ProjectDetailsFormProps> = ({ initialData, serverData, onNext }) => {
  const today = new Date();
  const defaultStartDate = today.toISOString().split('T')[0];
  const defaultEndDate = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Utility function to normalize date to YYYY-MM-DD format
  const normalizeDateString = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const { data: categoryData, isLoading: isCategoryLoading, error: categoryError } =
    useGetCategoriesByGroupQuery('project_type');

  const [formData, setFormData] = useState({
    name: initialData.name || '',
    projectKey: initialData.projectKey || '',
    description: initialData.description || '',
    budget: initialData.budget || 0,
    projectType: initialData.projectType || (categoryData?.data?.[0]?.name || ''),
    startDate: normalizeDateString(initialData.startDate) || defaultStartDate,
    endDate: normalizeDateString(initialData.endDate) || defaultEndDate,
  });
  const [touched, setTouched] = useState({
    name: false,
    projectKey: false,
    budget: false,
    projectType: false,
    startDate: false,
    endDate: false,
  });
  const [debouncedProjectKey, setDebouncedProjectKey] = useState<string>(formData.projectKey || '');
  const [debouncedProjectName, setDebouncedProjectName] = useState<string>(formData.name || '');
  const [isKeyFormatValid, setIsKeyFormatValid] = useState<boolean | null>(null);
  const [isKeyUnique, setIsKeyUnique] = useState<boolean | null>(null);
  const [isNameUnique, setIsNameUnique] = useState<boolean | null>(null);
  const [isBudgetValid, setIsBudgetValid] = useState<boolean | null>(null);
  const [isDateValid, setIsDateValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const [checkProjectKey] = useLazyCheckProjectKeyQuery();
  const dispatch = useDispatch();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const projectKeyRegex = /^[A-Z][A-Z]{0,9}$/;

  const { data: keyCheckData, isFetching: isKeyChecking, error: keyCheckError } =
    useCheckProjectKeyQuery(debouncedProjectKey, {
      skip: !debouncedProjectKey || !projectKeyRegex.test(debouncedProjectKey),
    });

  const { data: nameCheckData, isFetching: isNameChecking, error: nameCheckError } =
    useCheckProjectNameQuery(debouncedProjectName, {
      skip: !debouncedProjectName || debouncedProjectName.length < 3,
    });

  // Convert date to UTC ISO string for API (e.g., "2025-08-10T00:00:00.000Z")
  const toUTCDateString = (dateString: string): string => {
    if (!dateString) return new Date().toISOString();
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return new Date().toISOString();
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString();
  };

  // Generate projectKey from projectName
  const generateProjectKey = (name: string): string => {
    if (!name.trim()) return '';
    const cleanName = name.replace(/[^a-zA-Z0-9\s]/g, '');
    const words = cleanName.trim().split(/\s+/);
    let key = words
      .map((word) => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 10);
    return key.match(projectKeyRegex) ? key : '';
  };

  // Handle projectKey suggestion and uniqueness
  useEffect(() => {
    if (!formData.name || touched.projectKey) return;

    const checkAndGenerateUniqueKey = async () => {
      let generatedKey = generateProjectKey(formData.name as string);
      let attempts = 0;
      const maxAttempts = 8;

      while (generatedKey && attempts < maxAttempts) {
        if (projectKeyRegex.test(generatedKey)) {
          try {
            const response = await checkProjectKey(generatedKey).unwrap();
            if (!response?.data?.exists) {
              setFormData((prev) => ({ ...prev, projectKey: generatedKey }));
              setDebouncedProjectKey(generatedKey);
              setIsKeyUnique(true);
              setIsKeyFormatValid(true);
              return;
            }
          } catch (err) {
            console.error('Error checking project key:', err);
          }
        }
        const lastChar = generatedKey.slice(-1);
        generatedKey = generatedKey + lastChar;
        if (generatedKey.length > 10) {
          generatedKey = generatedKey.slice(0, 10);
          break;
        }
        attempts++;
      }
      if (attempts >= maxAttempts || !projectKeyRegex.test(generatedKey)) {
        setFormData((prev) => ({ ...prev, projectKey: '' }));
        setDebouncedProjectKey('');
        setIsKeyUnique(null);
        setIsKeyFormatValid(null);
      }
    };

    checkAndGenerateUniqueKey();
  }, [formData.name, checkProjectKey]);

  // Debounce projectKey and projectName inputs
  useEffect(() => {
    const keyHandler = setTimeout(() => {
      setDebouncedProjectKey(formData.projectKey || '');
    }, 500);
    const nameHandler = setTimeout(() => {
      setDebouncedProjectName(formData.name || '');
    }, 500);
    return () => {
      clearTimeout(keyHandler);
      clearTimeout(nameHandler);
    };
  }, [formData.projectKey, formData.name]);

  // Validate project key format and uniqueness
  useEffect(() => {
    if (!formData.projectKey) {
      setIsKeyFormatValid(null);
      setIsKeyUnique(null);
      return;
    }

    const isFormatValid = projectKeyRegex.test(formData.projectKey);
    setIsKeyFormatValid(isFormatValid);

    if (isFormatValid) {
      if (keyCheckData?.data?.exists) {
        setIsKeyUnique(false);
      } else if (keyCheckData?.data?.exists === false) {
        setIsKeyUnique(true);
      } else if (keyCheckError) {
        setIsKeyUnique(false);
      }
    } else {
      setIsKeyUnique(null);
    }
  }, [formData.projectKey, keyCheckData, keyCheckError]);

  // Validate project name uniqueness
  useEffect(() => {
    if (!formData.name) {
      setIsNameUnique(null);
      return;
    }

    if (nameCheckData?.data?.exists) {
      setIsNameUnique(false);
    } else if (nameCheckData?.data?.exists === false) {
      setIsNameUnique(true);
    } else if (nameCheckError) {
      setIsNameUnique(false);
    }
  }, [nameCheckData, nameCheckError]);

  // Validate budget
  useEffect(() => {
    if (formData.budget === undefined || formData.budget <= 0) {
      setIsBudgetValid(false);
    } else {
      setIsBudgetValid(true);
    }
  }, [formData.budget]);

  // Validate dates
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        setIsDateValid(false);
      } else {
        setIsDateValid(true);
      }
    } else {
      setIsDateValid(null);
    }
  }, [formData.startDate, formData.endDate]);

  // Load serverData
  useEffect(() => {
    if (serverData) {
      setFormData({
        name: serverData.name || '',
        projectKey: serverData.projectKey || '',
        description: serverData.description || '',
        budget: serverData.budget || 0,
        projectType: serverData.projectType || (categoryData?.data?.[0]?.name || ''),
        startDate: normalizeDateString(serverData.startDate) || defaultStartDate,
        endDate: normalizeDateString(serverData.endDate) || defaultEndDate,
      });
      setTouched({
        name: !!serverData.name,
        projectKey: !!serverData.projectKey,
        budget: !!serverData.budget,
        projectType: !!serverData.projectType,
        startDate: !!serverData.startDate,
        endDate: !!serverData.endDate,
      });
    }
  }, [serverData, categoryData, defaultStartDate, defaultEndDate]);

  // Set default projectType when categoryData loads
  useEffect(() => {
    if (!formData.projectType && categoryData?.data?.[0]?.name) {
      setFormData((prev) => ({
        ...prev,
        projectType: categoryData.data[0].name,
      }));
      setTouched((prev) => ({
        ...prev,
        projectType: true,
      }));
    }
  }, [categoryData, formData.projectType]);

  // Focus on name input on mount
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  const handleChange = (
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
    setTouched((prev) => ({
      ...prev,
      [name]: true,
      ...(name === 'name' && { projectKey: false }),
    }));
    if (name === 'projectKey') {
      setIsKeyFormatValid(null);
      setIsKeyUnique(null);
    }
    if (name === 'name') {
      setIsNameUnique(null);
    }
    setErrorMessage('');
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handleSave();
    }
  };

  const handleSave = async () => {
    if (
      !formData.name.trim() ||
      !formData.projectKey.trim() ||
      !formData.description.trim() ||
      formData.budget <= 0 ||
      !formData.projectType ||
      !formData.startDate ||
      !formData.endDate
    ) {
      setErrorMessage('All fields are required, and budget must be greater than 0.');
      return false;
    }

    if (!isKeyFormatValid || !isKeyUnique) {
      setErrorMessage('Project key must be valid and unique.');
      return false;
    }

    if (!isNameUnique) {
      setErrorMessage('Project name must be unique.');
      return false;
    }

    if (!isBudgetValid) {
      setErrorMessage('Budget must be greater than 0.');
      return false;
    }

    if (!isDateValid) {
      setErrorMessage('End date must be after start date.');
      return false;
    }

    try {
      let projectId: number;
      const projectData = {
        name: formData.name,
        projectKey: formData.projectKey,
        description: formData.description,
        budget: formData.budget,
        projectType: formData.projectType,
        startDate: toUTCDateString(formData.startDate),
        endDate: toUTCDateString(formData.endDate),
      };

      if (serverData?.id) {
        await updateProject({
          id: serverData.id,
          body: projectData,
        }).unwrap();
        projectId = serverData.id;
      } else {
        const response = await createProject(projectData).unwrap();
        projectId = response.data.id;
        dispatch(setProjectId(projectId));
        localStorage.setItem('projectCreationId', projectId.toString());
      }

      await onNext({ ...formData, id: projectId });
      setErrorMessage('');
      return true;
    } catch (err: any) {
      console.error('Failed to save project details:', err);
      const errorMsg =
        err.data?.message?.includes('timestamp with time zone')
          ? 'Invalid date format. Please ensure dates are valid and try again.'
          : err.data?.message || 'Failed to save project details. Please try again.';
      setErrorMessage(errorMsg);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await handleSave()) {
      await onNext(formData);
    }
  };

  const formatBudget = (value: number | undefined) => {
    if (value === undefined || value === 0) return '';
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  return (
    <div className="max-w-5xl mx-auto p-10 bg-white rounded-2xl shadow-xl border border-gray-100 text-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-5 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] bg-clip-text text-transparent">
          Project Details
        </h2>
        <p className="text-gray-600 mb-8 text-base leading-relaxed">
          Provide the basic details for your project.
        </p>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
            {errorMessage}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Project Name *</label>
          <input
            ref={nameInputRef}
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            required
            placeholder="Enter project name"
            className={`mt-2 block w-full border-2 ${
              touched.name && isNameUnique === false
                ? 'border-red-500'
                : touched.name && isNameUnique
                ? 'border-green-500'
                : 'border-gray-200'
            } px-6 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] transition-all placeholder-gray-400`}
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
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            required
            maxLength={10}
            placeholder="E.g., TD"
            className={`mt-2 block w-full border-2 ${
              touched.projectKey && (isKeyFormatValid === false || isKeyUnique === false)
                ? 'border-red-500'
                : touched.projectKey && isKeyFormatValid && isKeyUnique
                ? 'border-green-500'
                : 'border-gray-200'
            } px-6 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] transition-all placeholder-gray-400`}
          />
          {touched.projectKey && formData.projectKey && isKeyChecking && (
            <p className="mt-1 text-sm text-gray-500">Checking project key...</p>
          )}
          {touched.projectKey && formData.projectKey && isKeyFormatValid === false && (
            <p className="mt-1 text-sm text-red-500">
              Project key must start with an uppercase letter, followed by uppercase letters only,
              max 10 characters.
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
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            rows={4}
            placeholder="Enter project description"
            className="mt-2 block w-full border-2 border-gray-200 px-6 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] transition-all placeholder-gray-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Project Type</label>
            {isCategoryLoading ? (
              <p className="mt-1 text-sm text-gray-500">Loading project types...</p>
            ) : categoryError ? (
              <p className="mt-1 text-sm text-red-500">
                Failed to load project types. Please try again.
              </p>
            ) : (
              <select
                name="projectType"
                value={formData.projectType}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                required
                className={`mt-2 block w-full border-2 ${
                  touched.projectType && !formData.projectType ? 'border-red-500' : 'border-gray-200'
                } px-6 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] transition-all`}
              >
                {categoryData?.data?.map((category: DynamicCategory) => (
                  <option key={category.id} value={category.name}>
                    {category.label}
                  </option>
                ))}
              </select>
            )}
            {touched.projectType && !formData.projectType && (
              <p className="mt-1 text-sm text-red-500">Project type is required.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Budget (VND) *</label>
            <input
              name="budget"
              type="number"
              value={formData.budget === 0 ? '' : formData.budget}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              required
              min={1}
              placeholder="Enter budget in VND"
              className={`mt-2 block w-full border-2 ${
                touched.budget && isBudgetValid === false
                  ? 'border-red-500'
                  : touched.budget && isBudgetValid
                  ? 'border-gray-200'
                  : 'border-gray-200'
              } px-6 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] transition-all placeholder-gray-400`}
            />
            {touched.budget && formData.budget !== undefined && formData.budget > 0 && (
              <p className="mt-1 text-sm text-gray-500">{formatBudget(formData.budget)}</p>
            )}
            {touched.budget && formData.budget !== undefined && formData.budget <= 0 && (
              <p className="mt-1 text-sm text-red-500">Budget must be greater than 0 VND.</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              required
              className="mt-2 block w-full border-2 border-gray-200 px-6 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] transition-all"
            />
            {touched.startDate && !formData.startDate && (
              <p className="mt-1 text-sm text-red-500">Start date is required.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              min={formData.startDate}
              required
              className={`mt-2 block w-full border-2 ${
                touched.endDate && isDateValid === false ? 'border-red-500' : 'border-gray-200'
              } px-6 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] transition-all`}
            />
            {touched.endDate && !formData.endDate && (
              <p className="mt-1 text-sm text-red-500">End date is required.</p>
            )}
            {touched.endDate && formData.startDate && formData.endDate && isDateValid === false && (
              <p className="mt-1 text-sm text-red-500">End date must be after start date.</p>
            )}
          </div>
        </div>

        {(isCreating || isUpdating) && (
          <div className="text-gray-600 text-sm">Saving project...</div>
        )}

        <div className="pt-6 flex justify-end">
          <button
            type="submit"
            disabled={
              isCreating ||
              isUpdating ||
              isKeyFormatValid === false ||
              isKeyUnique === false ||
              isNameUnique === false ||
              isBudgetValid === false ||
              isDateValid === false ||
              !formData.projectKey ||
              !formData.name ||
              !formData.description ||
              !formData.projectType ||
              !formData.startDate ||
              !formData.endDate ||
              isCategoryLoading ||
              !!categoryError
            }
            className={`px-16 py-4 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-xl hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all shadow-lg hover:shadow-xl disabled:bg-gray-300 disabled:opacity-50 text-sm`}
          >
            {isCreating || isUpdating ? 'Saving...' : 'Next'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectDetailsForm;