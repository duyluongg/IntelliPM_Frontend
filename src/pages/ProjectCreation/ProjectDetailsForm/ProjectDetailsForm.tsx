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
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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
      dispatch(setProjectId(response.data.id));
      onNext(form);
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
    <div className="max-w-2xl mx-auto p-10 bg-white rounded-2xl shadow-xl border border-gray-100 text-sm">
      {showNotification && (
        <div
          className="fixed top-4 right-4 bg-[#1c73fd] text-white p-4 rounded-xl shadow-lg z-50 animate-slide-in"
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
        <h2 className="text-3xl font-extrabold text-gray-900 mb-5 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] bg-clip-text text-transparent">
          Project Details
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700">Project Name *</label>
          <input
            ref={nameInputRef}
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Enter project name"
            className="mt-2 block w-full border-2 border-gray-200 px-6 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] transition-all placeholder-gray-400"
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
            className="mt-2 block w-full border-2 border-gray-200 px-6 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] transition-all placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Enter project description"
            className="mt-2 block w-full border-2 border-gray-200 px-6 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] transition-all placeholder-gray-400"
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
            className="mt-2 block w-full border-2 border-gray-200 px-6 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] transition-all placeholder-gray-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
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
              className="mt-2 block w-full border-2 border-gray-200 px-6 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Project Type</label>
          <select
            name="projectType"
            value={form.projectType}
            onChange={handleChange}
            className="mt-2 block w-full border-2 border-gray-200 px-6 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] transition-all"
          >
            <option value="WEB_APPLICATION">Web Application</option>
            <option value="MOBILE_APP">Mobile App</option>
            <option value="RESEARCH">Research</option>
          </select>
        </div>

        {isLoading && <div className="text-gray-600 text-sm">Creating project...</div>}

        <div className="pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white px-8 py-4 rounded-xl hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all shadow-lg hover:shadow-xl disabled:bg-gray-300 text-sm"
          >
            {isLoading ? 'Creating...' : 'Next'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectDetailsForm;