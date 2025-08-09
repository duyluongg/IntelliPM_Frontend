import React, { useState, useEffect } from 'react';
import { useCreateProjectMutation, useUpdateProjectMutation } from '../../../services/projectApi';
import type { ProjectFormData } from '../ProjectCreation';

interface ProjectDetailsFormProps {
  initialData: ProjectFormData;
  serverData?: ProjectFormData;
  onNext: (data: Partial<ProjectFormData>) => Promise<void>;
}

const ProjectDetailsForm: React.FC<ProjectDetailsFormProps> = ({ initialData, serverData, onNext }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    projectKey: initialData.projectKey || '',
    description: initialData.description || '',
    budget: initialData.budget || 0,
    projectType: initialData.projectType || '',
    startDate: initialData.startDate || '',
    endDate: initialData.endDate || '',
  });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [createProject] = useCreateProjectMutation();
  const [updateProject] = useUpdateProjectMutation();

  useEffect(() => {
    if (serverData) {
      setFormData({
        name: serverData.name || '',
        projectKey: serverData.projectKey || '',
        description: serverData.description || '',
        budget: serverData.budget || 0,
        projectType: serverData.projectType || '',
        startDate: serverData.startDate || '',
        endDate: serverData.endDate || '',
      });
    }
  }, [serverData]);

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMessage('');
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

    // Validate dates
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (start >= end) {
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
        startDate: formData.startDate,
        endDate: formData.endDate,
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
      }

      await onNext({ ...formData, id: projectId });
      setErrorMessage('');
      return true;
    } catch (err) {
      console.error('Failed to save project details:', err);
      setErrorMessage('Failed to save project details. Please try again.');
      return false;
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handleSave();
    }
  };

  const handleSubmit = async () => {
    if (await handleSave()) {
      await onNext(formData);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-10 bg-white rounded-2xl shadow-xl border border-gray-100 text-sm">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-5 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] bg-clip-text text-transparent">
        Project Details
      </h1>
      <p className="text-gray-600 mb-8 text-base leading-relaxed">
        Provide the basic details for your project.
      </p>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
          {errorMessage}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-700">Project Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter project name"
            className="w-full mt-2 border-2 border-gray-200 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd]"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Project Key</label>
          <input
            type="text"
            value={formData.projectKey}
            onChange={(e) => handleChange('projectKey', e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter project key"
            className="w-full mt-2 border-2 border-gray-200 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd]"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            onKeyDown={handleKeyDown}
            rows={5}
            placeholder="Enter project description"
            className="w-full mt-2 border-2 border-gray-200 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd]"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Budget</label>
          <input
            type="number"
            value={formData.budget}
            onChange={(e) => handleChange('budget', parseFloat(e.target.value))}
            onKeyDown={handleKeyDown}
            placeholder="Enter budget"
            className="w-full mt-2 border-2 border-gray-200 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd]"
            required
            min="0"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Project Type</label>
          <select
            value={formData.projectType}
            onChange={(e) => handleChange('projectType', e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full mt-2 border-2 border-gray-200 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd]"
            required
          >
            <option value="">Select project type</option>
            <option value="SOFTWARE">Software</option>
            <option value="HARDWARE">Hardware</option>
            <option value="SERVICE">Service</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full mt-2 border-2 border-gray-200 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd]"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full mt-2 border-2 border-gray-200 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd]"
            required
          />
        </div>
      </div>

      <div className="flex justify-end mt-10">
        <button
          type="button"
          onClick={handleSubmit}
          className="px-16 py-4 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-xl hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all shadow-lg hover:shadow-xl text-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProjectDetailsForm;