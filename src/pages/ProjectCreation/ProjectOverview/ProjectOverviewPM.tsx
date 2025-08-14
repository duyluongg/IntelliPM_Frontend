import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGetProjectDetailsByKeyQuery, useGetProjectDetailsByIdQuery } from '../../../services/projectApi';
import { type DynamicCategory, useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import ProjectInfoForm from './ProjectInfoForm';
import RequirementsSection from './RequirementsSection';
import MembersSection from './MembersSection';
import TasksAndEpicsTable from './TasksAndEpicsTable';
import ActionButtonsPMSend from './ActionButtonsPMSend';

interface ProjectFormData {
  id?: number;
  name: string;
  projectKey: string;
  description: string;
  budget: number;
  projectType: string;
  startDate: string;
  endDate: string;
  requirements: Array<{
    id?: number;
    projectId: number;
    title: string;
    type: string;
    description: string;
    priority: string;
    createdAt?: string;
    updatedAt?: string;
  }>;
  invitees: Array<{
    email: string;
    role: string;
    positions: string[];
    accountId?: number;
  }>;
  epics: Array<{
    epicId: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    backendEpicId?: string;
    tasks?: Array<{
      id: string;
      taskId?: string;
      title: string;
      description: string;
      startDate: string;
      endDate: string;
      suggestedRole: string;
      assignedMembers: Array<{
        accountId: number;
        fullName: string;
        picture: string;
      }>;
    }>;
  }>;
}

interface ActionButtonsProps {
  projectKey: string;
  projectId: number;
  isFormValid: boolean;
  onBack: () => Promise<void>;
  onNotifyMembers: () => Promise<void>;
}

interface ProjectOverviewProps {
  formData: ProjectFormData;
  onBack: () => Promise<void>;
  onNotifyMembers: () => Promise<void>;
}

const ProjectOverviewPM: React.FC<ProjectOverviewProps> = ({ formData, onBack, onNotifyMembers }) => {
  const { projectKey: urlProjectKey } = useParams<{ projectKey: string }>();

  // Retrieve projectFormData from localStorage and parse it
  let storedProjectKey = '';
  try {
    const storedData = localStorage.getItem('projectFormData');
    if (storedData) {
      const parsedData: ProjectFormData = JSON.parse(storedData);
      storedProjectKey = parsedData.projectKey || '';
    }
  } catch (e) {
    console.error('Error parsing projectFormData from localStorage:', e);
  }

  // Use URL projectKey, then localStorage, then formData as fallback
  const projectKey = urlProjectKey || storedProjectKey || formData.projectKey || '';

  // Save projectKey to localStorage
  useEffect(() => {
    if (projectKey) {
      // Update projectFormData in localStorage with the current projectKey
      const updatedFormData = { ...formData, projectKey };
      localStorage.setItem('projectFormData', JSON.stringify(updatedFormData));
    }
  }, [projectKey, formData]);

  // Fetch projectId using projectKey
  const { data: keyData, isLoading: isKeyLoading, error: keyError } = useGetProjectDetailsByKeyQuery(projectKey, {
    skip: !projectKey,
  });

  // Extract projectId from keyData or formData
  const projectId = keyData?.isSuccess && keyData.data ? keyData.data.id : formData.id || 0;

  // Fetch full project details using projectId
  const { data, isLoading: isDetailsLoading, error: detailsError, refetch } = useGetProjectDetailsByIdQuery(projectId, {
    skip: !projectId,
  });

  const { data: categoryData, isLoading: isCategoryLoading, error: categoryError } = useGetCategoriesByGroupQuery('project_type', {
    skip: !projectId,
  });

  if (isKeyLoading || isDetailsLoading || isCategoryLoading) {
    return <div className="text-center py-10 text-gray-600">Loading...</div>;
  }

  if (keyError || !keyData?.isSuccess) {
    console.error('Error fetching project key:', keyError);
    return <div className="text-center py-10 text-red-500">Error loading project key.</div>;
  }

  if (detailsError || !data?.isSuccess || categoryError) {
    console.error('Error details:', { projectError: detailsError, categoryError });
    return <div className="text-center py-10 text-red-500">Error loading project details or categories.</div>;
  }

  if (!data.data) {
    return <div className="text-center py-10 text-gray-600">No project data available.</div>;
  }

  const { name, projectKey: key, description, budget, projectType, startDate, endDate, status, requirements, projectMembers } = data.data;

  return (
    <div className="max-w-5xl mx-auto p-10 bg-white rounded-2xl shadow-xl border border-gray-100 text-sm">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-5 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] bg-clip-text text-transparent">
        Project Overview (PM)
      </h1>
      <p className="text-gray-600 mb-8 text-base leading-relaxed">
        Review the project details and decide to send to team members.<br />
        Project Members ({projectMembers.length}) | Requirements ({requirements.length})
      </p>

      <ProjectInfoForm
        initialData={{
          name: name || formData.name || 'Unnamed Project',
          projectKey: key || formData.projectKey || 'N/A',
          description: description || formData.description || 'No description',
          budget: budget || formData.budget || 0,
          projectType: projectType || formData.projectType || 'N/A',
          startDate: startDate || formData.startDate || '2025-08-13',
          endDate: endDate || formData.endDate || '2025-08-13',
          status: status || 'DRAFT',
        }}
        projectId={projectId}
        projectKeyOriginal={key || formData.projectKey}
        projectNameOriginal={name || formData.name}
        onUpdate={refetch}
      />

      <RequirementsSection
        requirements={requirements}
        projectId={projectId}
        refetch={refetch}
      />

      <MembersSection
        projectMembers={projectMembers}
        projectId={projectId}
        refetch={refetch}
      />

      <TasksAndEpicsTable projectId={projectId} />

      <ActionButtonsPMSend
        projectKey={key || formData.projectKey}
        projectId={projectId}
        isFormValid={!!projectId && !!name && !!key}
        onBack={onBack}
        onNotifyMembers={onNotifyMembers}
      />
    </div>
  );
};

export default ProjectOverviewPM;