// src/pages/ProjectCreation/ProjectDetailsForm/ProjectDetailsForm.tsx
import React, { useState } from 'react';

interface ProjectFormData {
  name: string;
  projectKey: string;
  description: string;
  budget: number;
  projectType: string;
  startDate: string;
  endDate: string;
  status: string;
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
    startDate: initialData.startDate || new Date().toISOString().slice(0, 10),
    endDate: initialData.endDate || new Date().toISOString().slice(0, 10),
    status: initialData.status || 'PLANNING',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Project Details</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">Name *</label>
        <input
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full border px-3 py-2 rounded shadow-sm focus:ring focus:ring-blue-500"
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
          className="mt-1 block w-full border px-3 py-2 rounded shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full border px-3 py-2 rounded shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Budget</label>
        <input
          name="budget"
          type="number"
          value={form.budget}
          onChange={handleChange}
          className="mt-1 block w-full border px-3 py-2 rounded shadow-sm"
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
            className="mt-1 block w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={handleChange}
            className="mt-1 block w-full border px-3 py-2 rounded"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Project Type</label>
        <select
          name="projectType"
          value={form.projectType}
          onChange={handleChange}
          className="mt-1 block w-full border px-3 py-2 rounded"
        >
          <option value="WEB_APPLICATION">Web Application</option>
          <option value="MOBILE_APP">Mobile App</option>
          <option value="RESEARCH">Research</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="mt-1 block w-full border px-3 py-2 rounded"
        >
          <option value="PLANNING">Planning</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default ProjectDetailsForm;
