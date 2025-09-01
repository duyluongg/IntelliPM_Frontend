import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetProjectDetailsByKeyQuery,
  useUpdateProjectMutation,
  useCheckProjectNameQuery,
  useUploadIconMutation,
  type CreateProjectRequest,
} from '../../../services/projectApi';
import { Loader2, AlertCircle, CheckCircle, Camera, Briefcase, ArrowLeft, X, Upload } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [successMessage, setSuccessMessage] = useState<{ project?: string; icon?: string }>({});

  // Update mutation
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  // Icon upload mutation
  const [uploadIcon, { isLoading: isUploadingIcon }] = useUploadIconMutation();

  // Check project name uniqueness
  const { data: nameCheck, isFetching: isNameChecking } = useCheckProjectNameQuery(
    { projectName: formState.name, projectId: project?.id },
    {
      skip: !formState.name || formState.name === project?.name || !project?.id,
    }
  );

  // Initialize form with project data
  useEffect(() => {
    if (project) {
      setFormState({
        name: project.name,
        startDate: project.startDate.split('T')[0],
        endDate: project.endDate.split('T')[0],
        iconFile: null,
        iconPreview: project.iconUrl,
      });
    }
  }, [project]);

  // Handle icon click to open file picker
  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === 'iconFile' && files?.[0]) {
      const file = files[0];
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, iconFile: 'Only PNG, JPEG, and SVG images are allowed' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, iconFile: 'File size must be less than 5MB' }));
        return;
      }
      setFormState((prev) => ({
        ...prev,
        iconFile: file,
        iconPreview: URL.createObjectURL(file),
      }));
      setErrors((prev) => ({ ...prev, iconFile: '' }));
    } else {
      setFormState((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setSuccessMessage({});
  };

  // Clean up object URL
  useEffect(() => {
    return () => {
      if (formState.iconPreview && formState.iconFile) {
        URL.revokeObjectURL(formState.iconPreview);
      }
    };
  }, [formState.iconPreview, formState.iconFile]);

  // Validate form
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formState.name.trim()) newErrors.name = 'Project name is required';
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

  // Handle icon upload
  const handleIconUpload = async () => {
    if (!project || !formState.iconFile) {
      setErrors((prev) => ({ ...prev, iconFile: 'Please select an icon to upload' }));
      return;
    }

    try {
      console.log('Uploading icon:', {
        fileName: formState.iconFile.name,
        fileType: formState.iconFile.type,
        projectId: project.id.toString(),
      });
      const uploadResponse = await uploadIcon({
        file: formState.iconFile,
        projectId: project.id.toString(),
      }).unwrap();

      if (uploadResponse.isSuccess) {
        console.log('Upload successful:', uploadResponse);
        setSuccessMessage((prev) => ({ ...prev, icon: 'Icon uploaded successfully!' }));
        setFormState((prev) => ({
          ...prev,
          iconFile: null,
          iconPreview: uploadResponse.data.fileUrl,
        }));
        setTimeout(() => setSuccessMessage((prev) => ({ ...prev, icon: '' })), 3000);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setErrors((prev) => ({
        ...prev,
        iconFile: err?.data?.message || 'Failed to upload icon. Please try again.',
      }));
    }
  };

  // Remove selected icon
  const handleRemoveIcon = () => {
    if (formState.iconPreview && formState.iconFile) {
      URL.revokeObjectURL(formState.iconPreview);
    }
    setFormState((prev) => ({
      ...prev,
      iconFile: null,
      iconPreview: project?.iconUrl || null,
    }));
    setErrors((prev) => ({ ...prev, iconFile: '' }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !validateForm()) return;

    // Convert dates to UTC ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
    const toUTCString = (dateStr: string): string => {
      const date = new Date(dateStr);
      return new Date(
        Date.UTC(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          0, // Midnight UTC
          0,
          0
        )
      ).toISOString();
    };

    const payload: CreateProjectRequest = {
      name: formState.name.trim(),
      projectKey: project.projectKey,
      description: project.description || '',
      budget: project.budget || 0,
      projectType: project.projectType || 'DEFAULT',
      startDate: toUTCString(formState.startDate),
      endDate: toUTCString(formState.endDate),
    };

    try {
      console.log('Submitting payload:', payload); // Debug payload
      const response = await updateProject({ id: project.id, body: payload }).unwrap();
      if (response.isSuccess) {
        setSuccessMessage((prev) => ({ ...prev, project: 'Project updated successfully!' }));
        setTimeout(() => navigate('/project/manage'), 2000);
      }
    } catch (err: any) {
      console.error('Update error:', err);
      setErrors((prev) => ({
        ...prev,
        submit: err?.data?.message || 'Failed to update project. Please try again.',
      }));
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/project/manage');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-slate-600 font-medium">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl border border-red-100 p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Project Not Found</h3>
          <p className="text-slate-600 mb-6">
            {error ? (error as any)?.data?.message || 'An error occurred' : 'The project you are looking for does not exist.'}
          </p>
          <button
            onClick={handleBack}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Update Project</h1>
          <p className="text-slate-600 mt-1">Modify your project details and settings</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="p-8">
            {/* Project Icon Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Icon</h3>
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="relative group">
                  <div
                    className="w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer group-hover:border-blue-400 group-hover:bg-gradient-to-br group-hover:from-blue-50 group-hover:to-blue-100 transition-all duration-300 overflow-hidden"
                    onClick={handleIconClick}
                  >
                    {formState.iconPreview ? (
                      <img
                        src={formState.iconPreview}
                        alt="Project icon"
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <Briefcase className="text-slate-400 group-hover:text-blue-500 transition-colors" size={32} />
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl">
                      <Camera className="text-white" size={20} />
                    </div>
                  </div>
                  {formState.iconFile && (
                    <button
                      type="button"
                      onClick={handleRemoveIcon}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap gap-3 mb-3">
                    <button
                      type="button"
                      onClick={handleIconClick}
                      disabled={isUploadingIcon}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
                    >
                      <Camera className="w-4 h-4" />
                      {formState.iconPreview ? 'Change Icon' : 'Select Icon'}
                    </button>
                    {formState.iconFile && (
                      <button
                        type="button"
                        onClick={handleIconUpload}
                        disabled={isUploadingIcon}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
                      >
                        {isUploadingIcon ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Upload Icon
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {formState.iconFile && (
                    <p className="text-sm text-slate-600 mb-2">
                      Selected: {formState.iconFile.name} ({(formState.iconFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}

                  <p className="text-xs text-slate-500">
                    Supported formats: PNG, JPEG, SVG • Max size: 5MB
                  </p>

                  {errors.iconFile && (
                    <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.iconFile}
                    </div>
                  )}
                  {successMessage.icon && (
                    <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
                      <CheckCircle className="w-4 h-4" />
                      {successMessage.icon}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              name="iconFile"
              accept="image/png,image/jpeg,image/jpg,image/svg+xml"
              onChange={handleInputChange}
              className="hidden"
              disabled={isUploadingIcon}
            />

            <div className="grid gap-6">
              {/* Project Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-3">
                  Project Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formState.name}
                    onChange={handleInputChange}
                    className={`block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.name ? 'border-red-300 bg-red-50' : ''
                    }`}
                    placeholder="Enter your project name"
                    disabled={isNameChecking}
                  />
                  {isNameChecking && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    </div>
                  )}
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
                {isNameChecking && (
                  <p className="mt-2 text-sm text-blue-600 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Checking availability...
                  </p>
                )}
              </div>

              {/* Date Fields */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-semibold text-slate-700 mb-3">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    value={formState.startDate}
                    onChange={handleInputChange}
                    className={`block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.startDate ? 'border-red-300 bg-red-50' : ''
                    }`}
                  />
                  {errors.startDate && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.startDate}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-semibold text-slate-700 mb-3">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    value={formState.endDate}
                    onChange={handleInputChange}
                    className={`block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.endDate ? 'border-red-300 bg-red-50' : ''
                    }`}
                  />
                  {errors.endDate && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            {errors.submit && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Error</span>
                </div>
                <p className="text-red-600 text-sm mt-1">{errors.submit}</p>
              </div>
            )}
            
            {successMessage.project && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Success</span>
                </div>
                <p className="text-green-600 text-sm mt-1">{successMessage.project}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating || isNameChecking}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default UpdateProjectPage;