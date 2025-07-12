import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetProjectDetailsByKeyQuery, useGetProjectDetailsByIdQuery } from '../../../services/projectApi';
import { type DynamicCategory, useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import ProjectInfoForm from './ProjectInfoForm';
import RequirementsSection from './RequirementsSection';
import MembersSection from './MembersSection';
import ActionButtonsPM from './ActionButtonsPM';

const ProjectReviewPM: React.FC = () => {
  const { projectKey } = useParams<{ projectKey: string }>();

  // Fetch projectId using projectKey
  const { data: keyData, isLoading: isKeyLoading, error: keyError } = useGetProjectDetailsByKeyQuery(projectKey || '', {
    skip: !projectKey,
  });

  // Extract projectId from keyData
  const projectId = keyData?.isSuccess && keyData.data ? keyData.data.id : 0;

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
        Project Review (PM)
      </h1>
      <p className="text-gray-600 mb-8 text-base leading-relaxed">
        Review the project details and decide to accept or reject the project.<br />
        Project Members ({projectMembers.length}) | Requirements ({requirements.length})
      </p>

      <ProjectInfoForm
        initialData={{ name, projectKey: key, description, budget, projectType, startDate, endDate, status }}
        projectId={projectId}
        projectKeyOriginal={key}
        projectNameOriginal={name}
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

      <ActionButtonsPM projectKey={key} projectId={projectId} isFormValid={!!projectId && !!name && !!key} />
    </div>
  );
};

export default ProjectReviewPM;