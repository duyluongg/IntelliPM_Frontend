import React, { useState, useEffect, useRef } from 'react';
import {
  useCreateProjectMutation,
  useCheckProjectKeyQuery,
  useLazyCheckProjectKeyQuery,
  useCheckProjectNameQuery,
} from '../../../services/projectApi';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import type { CreateProjectRequest, CreateProjectResponse } from '../../../services/projectApi';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { DynamicCategory } from '../../../services/dynamicCategoryApi';
import { useDispatch } from 'react-redux';
import { setProjectId } from '../../../components/slices/Project/projectCreationSlice';

interface ProjectFormData {
  name: string;
  projectKey: string;
  description: string;
  budget: number;
  projectType: string;
  startDate: string;
  endDate: string;
}

interface Props {
  initialData: Partial<ProjectFormData>;
  onNext: (data: Partial<ProjectFormData>) => void;
}

const ProjectDetailsForm: React.FC<Props> = ({ initialData, onNext }) => {
  const today = new Date();
  const defaultStartDate = initialData.startDate || today.toISOString().split('T')[0];
  const defaultEndDate =
    initialData.endDate ||
    new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [form, setForm] = useState<Partial<ProjectFormData>>({
    name: initialData.name || '',
    projectKey: initialData.projectKey || '',
    description: initialData.description || '',
    budget: initialData.budget || 0,
    projectType: initialData.projectType || 'WEB_APPLICATION',
    startDate: defaultStartDate,
    endDate: defaultEndDate,
  });
  const [touched, setTouched] = useState({
    name: false,
    projectKey: false,
    budget: false,
    endDate: false,
  });
  const [debouncedProjectKey, setDebouncedProjectKey] = useState<string>(form.projectKey || '');
  const [debouncedProjectName, setDebouncedProjectName] = useState<string>(form.name || '');
  const [isKeyFormatValid, setIsKeyFormatValid] = useState<boolean | null>(null);
  const [isKeyUnique, setIsKeyUnique] = useState<boolean | null>(null);
  const [isNameUnique, setIsNameUnique] = useState<boolean | null>(null);
  const [isBudgetValid, setIsBudgetValid] = useState<boolean | null>(null);
  const [isDateValid, setIsDateValid] = useState<boolean | null>(null);
  const [createProject, { isLoading, isError, error, isSuccess }] = useCreateProjectMutation();
  const [checkProjectKey] = useLazyCheckProjectKeyQuery();
  const dispatch = useDispatch();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const { data: categoryData, isLoading: isCategoryLoading, error: categoryError } =
    useGetCategoriesByGroupQuery('project_type');

  const projectKeyRegex = /^[A-Z][A-Z]{0,9}$/;

  const { data: keyCheckData, isFetching: isKeyChecking, error: keyCheckError } =
    useCheckProjectKeyQuery(debouncedProjectKey, {
      skip: !debouncedProjectKey || !projectKeyRegex.test(debouncedProjectKey),
    });

  const { data: nameCheckData, isFetching: isNameChecking, error: nameCheckError } =
    useCheckProjectNameQuery(debouncedProjectName, {
      skip: !debouncedProjectName || debouncedProjectName.length < 3,
    });

  // Generate projectKey from projectName
  const generateProjectKey = (name: string): string => {
    if (!name.trim()) return '';
    // Loại bỏ ký tự đặc biệt, chỉ giữ chữ cái và số
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
    if (!form.name || touched.projectKey) return;

    const checkAndGenerateUniqueKey = async () => {
      let generatedKey = generateProjectKey(form.name as string);
      let attempts = 0;
      const maxAttempts = 8;

      while (generatedKey && attempts < maxAttempts) {
        if (projectKeyRegex.test(generatedKey)) {
          try {
            const response = await checkProjectKey(generatedKey).unwrap();
            if (!response?.data?.exists) {
              setForm((prev) => ({ ...prev, projectKey: generatedKey }));
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
        setForm((prev) => ({ ...prev, projectKey: '' }));
        setDebouncedProjectKey('');
        setIsKeyUnique(null);
        setIsKeyFormatValid(null);
      }
    };

    checkAndGenerateUniqueKey();
  }, [form.name, checkProjectKey]);

  // Debounce projectKey and projectName inputs
  useEffect(() => {
    const keyHandler = setTimeout(() => {
      setDebouncedProjectKey(form.projectKey || '');
    }, 500);
    const nameHandler = setTimeout(() => {
      setDebouncedProjectName(form.name || '');
    }, 500);
    return () => {
      clearTimeout(keyHandler);
      clearTimeout(nameHandler);
    };
  }, [form.projectKey, form.name]);

  // Validate project key format and uniqueness
  useEffect(() => {
    if (!form.projectKey) {
      setIsKeyFormatValid(null);
      setIsKeyUnique(null);
      return;
    }

    const isFormatValid = projectKeyRegex.test(form.projectKey);
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
  }, [form.projectKey, keyCheckData, keyCheckError]);

  // Validate project name uniqueness
  useEffect(() => {
    if (!form.name) {
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
    if (form.budget === undefined || form.budget <= 0) {
      setIsBudgetValid(false);
    } else {
      setIsBudgetValid(true);
    }
  }, [form.budget]);

  // Validate dates and reset endDate if invalid
  useEffect(() => {
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      if (end <= start) {
        setIsDateValid(false);
        setForm((prev) => ({
          ...prev,
          endDate: form.startDate || new Date().toISOString().split('T')[0],
        }));
      } else {
        setIsDateValid(true);
      }
    } else {
      setIsDateValid(null);
    }
  }, [form.startDate, form.endDate]);

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
    setForm((prev) => ({
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
      ...(name === 'name' && { projectKey: false }), // Reset touched.projectKey khi tên thay đổi
    }));
    if (name === 'projectKey') {
      setIsKeyFormatValid(null);
      setIsKeyUnique(null);
    }
    if (name === 'name') {
      setIsNameUnique(null);
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const getErrorMessage = (): string => {
    if (isError && error && 'data' in error) {
      const baseError = error as FetchBaseQueryError;
      const errorData = baseError.data as { message?: string };
      return errorData?.message || 'Failed to create project';
    }
    return 'Failed to create project';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.projectKey) {
      return;
    }

    if (!isKeyFormatValid || !isKeyUnique) {
      return;
    }

    if (!isNameUnique) {
      return;
    }

    if (!isBudgetValid) {
      return;
    }

    if (form.startDate && form.endDate && new Date(form.endDate) <= new Date(form.startDate)) {
      return;
    }

    const requestData: CreateProjectRequest = {
      name: form.name || '',
      projectKey: form.projectKey || '',
      description: form.description || '',
      budget: form.budget || 0,
      projectType: form.projectType || 'WEB_APPLICATION',
      startDate: form.startDate ? new Date(form.startDate).toISOString() : new Date().toISOString(),
      endDate: form.endDate ? new Date(form.endDate).toISOString() : new Date().toISOString(),
    };

    try {
      const response = (await createProject(requestData).unwrap()) as CreateProjectResponse;
      dispatch(setProjectId(response.data.id));
      localStorage.setItem('projectCreationId', response.data.id.toString());
      onNext(form);
    } catch (err) {
      console.error('Failed to create project:', err);
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
          Define the core details of your project to get started.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700">Project Name *</label>
          <input
            ref={nameInputRef}
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            onBlur={handleBlur}
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
          {touched.name && form.name && isNameChecking && (
            <p className="mt-1 text-sm text-gray-500">Checking project name...</p>
          )}
          {touched.name && form.name && isNameUnique === true && (
            <p className="mt-1 text-sm text-green-500">Project name is available.</p>
          )}
          {touched.name && form.name && isNameUnique === false && (
            <p className="mt-1 text-sm text-red-500">Project name is already taken.</p>
          )}
          {touched.name && !form.name && (
            <p className="mt-1 text-sm text-red-500">Project name is required.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Project Key *</label>
          <input
            name="projectKey"
            type="text"
            value={form.projectKey}
            onChange={handleChange}
            onBlur={handleBlur}
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
          {touched.projectKey && form.projectKey && isKeyChecking && (
            <p className="mt-1 text-sm text-gray-500">Checking project key...</p>
          )}
          {touched.projectKey && form.projectKey && isKeyFormatValid === false && (
            <p className="mt-1 text-sm text-red-500">
              Project key must start with an uppercase letter, followed by uppercase letters only,
              max 10 characters.
            </p>
          )}
          {touched.projectKey && form.projectKey && isKeyFormatValid && isKeyUnique === true && (
            <p className="mt-1 text-sm text-green-500">Project key is available.</p>
          )}
          {touched.projectKey && form.projectKey && isKeyFormatValid && isKeyUnique === false && (
            <p className="mt-1 text-sm text-red-500">Project key is already taken.</p>
          )}
          {touched.projectKey && !form.projectKey && (
            <p className="mt-1 text-sm text-red-500">Project key is required.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            onBlur={handleBlur}
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
                value={form.projectType}
                onChange={handleChange}
                onBlur={handleBlur}
                className="mt-2 block w-full border-2 border-gray-200 px-6 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] transition-all"
              >
                {categoryData?.data?.map((category: DynamicCategory) => (
                  <option key={category.id} value={category.name}>
                    {category.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Budget (VND) *</label>
            <input
              name="budget"
              type="number"
              value={form.budget === 0 ? '' : form.budget}
              onChange={handleChange}
              onBlur={handleBlur}
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
            {touched.budget && form.budget !== undefined && form.budget > 0 && (
              <p className="mt-1 text-sm text-gray-500">{formatBudget(form.budget)}</p>
            )}
            {touched.budget && form.budget !== undefined && form.budget <= 0 && (
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
              value={form.startDate}
              onChange={handleChange}
              onBlur={handleBlur}
              className="mt-2 block w-full border-2 border-gray-200 px-6 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleChange}
              onBlur={handleBlur}
              min={form.startDate}
              className={`mt-2 block w-full border-2 ${
                touched.endDate && isDateValid === false ? 'border-red-500' : 'border-gray-200'
              } px-6 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] transition-all`}
            />
            {touched.endDate && form.startDate && form.endDate && isDateValid === false && (
              <p className="mt-1 text-sm text-red-500">End date must be after start date.</p>
            )}
          </div>
        </div>

        {isError && <div className="text-red-500 text-sm">{getErrorMessage()}</div>}
        {isLoading && <div className="text-gray-600 text-sm">Creating project...</div>}

        <div className="pt-6 flex justify-end">
          <button
            type="submit"
            disabled={
              isLoading ||
              isKeyFormatValid === false ||
              isKeyUnique === false ||
              isNameUnique === false ||
              isBudgetValid === false ||
              isDateValid === false ||
              !form.projectKey ||
              !form.name ||
              isCategoryLoading ||
              !!categoryError
            }
            className={`px-16 py-4 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-xl hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all shadow-lg hover:shadow-xl disabled:bg-gray-300 disabled:opacity-50 text-sm`}
          >
            {isLoading ? 'Creating...' : 'Next'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectDetailsForm;