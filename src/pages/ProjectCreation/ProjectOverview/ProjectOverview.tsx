import React from 'react';
import { useSelector } from 'react-redux';
import { selectProjectId } from '../../../components/slices/Project/projectCreationSlice';
import { useGetProjectDetailsByIdQuery } from '../../../services/projectApi';
import { type DynamicCategory, useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import ProjectInfoForm from './ProjectInfoForm';
import RequirementsSection from './RequirementsSection';
import MembersSection from './MembersSection';
import ActionButtons from './ActionButtons';

const ProjectOverview: React.FC = () => {
  const projectId = useSelector(selectProjectId);
  const { data, isLoading, error, refetch } = useGetProjectDetailsByIdQuery(projectId || 0, {
    skip: !projectId,
  });
  const { data: categoryData, isLoading: isCategoryLoading, error: categoryError } = useGetCategoriesByGroupQuery('project_type');

  if (isLoading || isCategoryLoading) return <div className="text-center py-10 text-gray-600">Loading...</div>;
  if (error || !data?.isSuccess || categoryError) return <div className="text-center py-10 text-red-500">Error loading project details or categories.</div>;
  if (!data.data) return <div className="text-center py-10 text-gray-600">No project data available.</div>;

  const { name, projectKey, description, budget, projectType, startDate, endDate, status, requirements, projectMembers } = data.data;

  return (
    <div className="max-w-5xl mx-auto p-10 bg-white rounded-2xl shadow-xl border border-gray-100 text-sm">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-5 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] bg-clip-text text-transparent">
        Project Overview
      </h1>
      <p className="text-gray-600 mb-8 text-base leading-relaxed">
        Ensure everything looks perfect before starting.<br />
        Project Members ({projectMembers.length}) | Requirements ({requirements.length})
      </p>

      <ProjectInfoForm
        initialData={{ name, projectKey, description, budget, projectType, startDate, endDate, status }}
        projectId={projectId!}
        projectKeyOriginal={projectKey}
        projectNameOriginal={name}
        onUpdate={refetch}
      />

      <RequirementsSection
        requirements={requirements}
        projectId={projectId!}
        refetch={refetch}
      />

      <MembersSection
        projectMembers={projectMembers}
        projectId={projectId!}
        refetch={refetch}
      />

      <ActionButtons projectKey={projectKey} isFormValid={!!projectId && !!name && !!projectKey} />
    </div>
  );
};

export default ProjectOverview;