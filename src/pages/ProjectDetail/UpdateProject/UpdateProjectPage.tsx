import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetProjectDetailsByKeyQuery, useUpdateProjectMutation, useCheckProjectNameQuery, type CreateProjectRequest } from '../../../services/projectApi';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface FormState {
  name: string;
  startDate: string;
  endDate: string;
  iconFile: File | null;
  iconPreview: string | null;
}

const UpdateProjectPage: React.FC = () => {
  const { projectKey } = useParams<{ projectKey: string }>();
  const navigate = useNavigate();

  // Fetch project details
  const { data: projectResponse, isLoading, isError, error } = useGetProjectDetailsByKeyQuery(projectKey || '', {
    skip: !projectKey,
  });

  const project = projectResponse?.isSuccess ? projectResponse.data : null;

  // State for form fields
  const [formState, setFormState] = useState<FormState>({
    name: '',
    startDate: '',
    endDate: '',
    iconFile: null,
    iconPreview: null,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Update mutation
  const [updateProject, { isLoading: isUpdating, isError: isUpdateError, error: updateError }] = useUpdateProjectMutation();

  // Check project name uniqueness
  const { data: nameCheck, isFetching: isNameChecking } = useCheckProjectNameQuery(formState.name, {
    skip: !formState.name || formState.name === project?.name,
  });

  // Initialize form with project data
  useEffect(() => {
    if (project) {
      setFormState({
        name: project.name,
        startDate: project.startDate.split('T')[0], // Convert to YYYY-MM-DD
        endDate: project.endDate.split('T')[0],
        iconFile: null,
        iconPreview: project.iconUrl,
      });
    }
  }, [project]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === 'iconFile' && files?.[0]) {
      setFormState((prev) => ({
        ...prev,
        iconFile: files[0],
        iconPreview: URL.createObjectURL(files[0]),
      }));
    } else {
      setFormState((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setSuccessMessage(null);
  };

  // Validate form
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formState.name) newErrors.name = 'Project name is required';
    if (nameCheck?.data.exists && formState.name !== project?.name) {
      newErrors.name = 'Project name already exists';
    }
    if (!formState.startDate) newErrors.startDate = 'Start date is required';
    if (!formState.endDate) newErrors.endDate = 'End date is required';
    if (formState.startDate && formState.endDate && formState.startDate > formState.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !validateForm()) return;

    const payload: CreateProjectRequest = {
      name: formState.name,
      projectKey: project.projectKey, // Non-editable
      description: project.description || '', // Default if null
      budget: project.budget || 0, // Default if null
      projectType: project.projectType || 'DEFAULT', // Default if null
      startDate: formState.startDate,
      endDate: formState.endDate,
    };

    try {
      const response = await updateProject({ id: project.id, body: payload }).unwrap();
      if (response.isSuccess) {
        setSuccessMessage('Project updated successfully!');
        setTimeout(() => navigate('/project/manage'), 2000); // Redirect after 2s
      }
    } catch (err) {
      setErrors({ submit: 'Failed to update project. Please try again.' });
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/project/manage');
  };

  // Handle back
  const handleBack = () => {
    navigate('/project/manage');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="animate-spin w-6 h-6" /> Loading project...
        </div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="flex items-center justify-center gap-2 text-red-600 font-semibold mb-4">
            <AlertCircle className="w-6 h-6" /> Failed to load project.
          </div>
          <p className="text-gray-600 text-sm">
            {error ? (error as any)?.data?.message || 'An error occurred' : 'Project not found.'}
          </p>
          <button
            onClick={() => navigate('/project/manage')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition-all duration-300 text-sm"
          >
            Back to Project Management
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full mx-auto bg-white p-8 rounded-2xl shadow-xl"
      >
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Update Project</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Project Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formState.name}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50 sm:text-sm"
              placeholder="Enter project name"
              disabled={isNameChecking}
              aria-label="Project name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              id="startDate"
              value={formState.startDate}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50 sm:text-sm"
              aria-label="Project start date"
            />
            {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              id="endDate"
              value={formState.endDate}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50 sm:text-sm"
              aria-label="Project end date"
            />
            {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
          </div>

          {/* Icon Upload */}
          <div>
            <label htmlFor="iconFile" className="block text-sm font-medium text-gray-700">
              Project Icon
            </label>
            <input
              type="file"
              name="iconFile"
              id="iconFile"
              accept="image/*"
              onChange={handleInputChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
              aria-label="Upload project icon"
            />
            {formState.iconPreview && (
              <img
                src={formState.iconPreview}
                alt="Project icon preview"
                className="mt-2 w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              />
            )}
            <p className="mt-1 text-xs text-gray-500">Note: Icon upload requires backend support to save the image.</p>
          </div>

          {/* Error and Success Messages */}
          {errors.submit && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-5 h-5" /> {errors.submit}
            </div>
          )}
          {successMessage && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="w-5 h-5" /> {successMessage}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all duration-300 text-sm"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all duration-300 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating || isNameChecking}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 text-sm disabled:opacity-50"
            >
              {isUpdating ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-5 h-5" /> Saving...
                </span>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default UpdateProjectPage;