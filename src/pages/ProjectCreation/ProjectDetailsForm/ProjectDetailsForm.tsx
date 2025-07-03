import React, { useState, useEffect, useRef } from 'react';
import { useCreateProjectMutation } from '../../../services/projectApi';
import type { CreateProjectRequest, CreateProjectResponse } from '../../../services/projectApi';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
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
  const [form, setForm] = useState<Partial<ProjectFormData>>({
    name: initialData.name || '',
    projectKey: initialData.projectKey || '',
    description: initialData.description || '',
    budget: initialData.budget || 0,
    projectType: initialData.projectType || 'WEB_APPLICATION',
    startDate: initialData.startDate || new Date().toISOString().split('T')[0],
    endDate: initialData.endDate || new Date().toISOString().split('T')[0],
  });

  const [createProject, { isLoading, isError, error, isSuccess }] = useCreateProjectMutation();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const dispatch = useDispatch();
  const nameInputRef = useRef<HTMLInputElement>(null); // Tham chiếu đến input Name

  useEffect(() => {
    // Tự động focus vào trường Name khi component mount
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }

    if (isError && error) {
      setNotificationMessage(getErrorMessage());
      setShowNotification(true);
      const timer = setTimeout(() => setShowNotification(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isError, error]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'budget' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      const response = await createProject(requestData).unwrap() as CreateProjectResponse;
      dispatch(setProjectId(response.data.id)); // Lưu projectId vào Redux
      onNext(form); // Chuyển sang bước tiếp theo
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const getErrorMessage = (): string => {
    if (isError && error && 'data' in error) {
      const baseError = error as FetchBaseQueryError;
      const errorData = baseError.data as { message?: string };
      return errorData?.message || 'Failed to create project';
    }
    return 'Failed to create project';
  };

  return (
    <div className="relative max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {showNotification && (
        <div
          className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded shadow-lg z-50 animate-slide-in"
          style={{ animation: 'slideIn 0.3s ease-out' }}
        >
          {notificationMessage}
        </div>
      )}

      <style>
        {`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .animate-slide-in { animation: slideIn 0.3s ease-out forwards; }
        `}
      </style>

      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Project Details</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700">Project Name *</label>
          <input
            ref={nameInputRef} // Tự động focus vào trường này
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Enter project name"
            className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Project Key *</label>
          <input
            name="projectKey"
            type="text"
            value={form.projectKey}
            onChange={handleChange}
            required
            placeholder="Enter unique project key"
            className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Enter project description"
            className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Budget</label>
          <input
            name="budget"
            type="number"
            value={form.budget}
            onChange={handleChange}
            placeholder="Enter budget (optional)"
            className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Project Type</label>
          <select
            name="projectType"
            value={form.projectType}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="WEB_APPLICATION">Web Application</option>
            <option value="MOBILE_APP">Mobile App</option>
            <option value="RESEARCH">Research</option>
          </select>
        </div>

        {isLoading && <div className="text-gray-500 text-sm">Creating project...</div>}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition disabled:bg-blue-300 text-sm"
          >
            {isLoading ? 'Creating...' : 'Next'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectDetailsForm;