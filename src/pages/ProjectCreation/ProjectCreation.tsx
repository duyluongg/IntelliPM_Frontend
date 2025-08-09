import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectProjectId,
  setProjectId,
  setFormData as setReduxFormData,
} from '../../components/slices/Project/projectCreationSlice';
import ProjectDetailsForm from './ProjectDetailsForm/ProjectDetailsForm';
import RequirementsForm from './RequirementsForm/RequirementsForm';
import InviteesForm from './InviteesForm/InviteesForm';
import ProjectOverview from './ProjectOverview/ProjectOverview';
import { useGetProjectDetailsByIdQuery } from '../../services/projectApi';
import type { ProjectDetailsById } from '../../services/projectApi';

export interface ProjectFormData {
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
    title: string;
    type: string;
    description: string;
    priority: string;
  }>;
  invitees: Array<{
    email: string;
    role: string;
    positions: string[];
    accountId?: number;
  }>;
}

const steps = ['Project Details', 'Requirements', 'Invite Members', 'Project Overview'];

const ProjectCreation: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const projectId = useSelector(selectProjectId);

  const [step, setStep] = useState<number>(() => {
    const savedStep = localStorage.getItem('projectCreationStep');
    return savedStep ? parseInt(savedStep, 10) : 0;
  });

  const [maxStepReached, setMaxStepReached] = useState<number>(() => {
    const savedMaxStep = localStorage.getItem('projectCreationMaxStep');
    return savedMaxStep ? parseInt(savedMaxStep, 10) : 0;
  });

  const [localFormData, setLocalFormData] = useState<ProjectFormData>(() => {
    const savedData = localStorage.getItem('projectFormData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        return {
          id: parsed.id,
          name: parsed.name || '',
          projectKey: parsed.projectKey || '',
          description: parsed.description || '',
          budget: parsed.budget || 0,
          projectType: parsed.projectType || '',
          startDate: parsed.startDate || '',
          endDate: parsed.endDate || '',
          requirements: Array.isArray(parsed.requirements) ? parsed.requirements : [],
          invitees: Array.isArray(parsed.invitees) ? parsed.invitees : [],
        };
      } catch (e) {
        console.error('Error parsing projectFormData from localStorage:', e);
      }
    }
    return {
      name: '',
      projectKey: '',
      description: '',
      budget: 0,
      projectType: '',
      startDate: '',
      endDate: '',
      requirements: [],
      invitees: [],
    };
  });

  const { data: serverData, refetch: refetchServer } = useGetProjectDetailsByIdQuery(
    projectId || 0,
    { skip: !projectId }
  );

  // Restore projectId and maxStepReached from localStorage
  useEffect(() => {
    const savedProjectId = localStorage.getItem('projectCreationId');
    if (savedProjectId && !projectId) {
      dispatch(setProjectId(parseInt(savedProjectId, 10)));
    }
  }, [dispatch, projectId]);

  // Sync server data → local + redux
  useEffect(() => {
    if (serverData?.isSuccess && serverData.data) {
      const updatedData: ProjectFormData = {
        id: serverData.data.id,
        name: serverData.data.name || '',
        projectKey: serverData.data.projectKey || '',
        description: serverData.data.description || '',
        budget: serverData.data.budget || 0,
        projectType: serverData.data.projectType || '',
        startDate: serverData.data.startDate || '',
        endDate: serverData.data.endDate || '',
        requirements: serverData.data.requirements || [],
        invitees:
          serverData.data.projectMembers?.map((member) => ({
            email: member.email || '',
            role: member.status === 'PENDING' ? 'Team Member' : member.status || 'Team Member',
            positions: member.projectPositions?.map((pos) => pos.position) || [],
            accountId: member.accountId,
          })) || [],
      };
      setLocalFormData(updatedData);
      dispatch(setReduxFormData(updatedData));
      localStorage.setItem('projectFormData', JSON.stringify(updatedData));
    }
  }, [serverData, dispatch]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('projectFormData', JSON.stringify(localFormData));
    localStorage.setItem('projectCreationStep', step.toString());
    localStorage.setItem('projectCreationMaxStep', maxStepReached.toString());
    if (projectId) {
      localStorage.setItem('projectCreationId', projectId.toString());
    }
  }, [localFormData, step, maxStepReached, projectId]);

  // Update maxStepReached when step changes
  useEffect(() => {
    if (step > maxStepReached) {
      setMaxStepReached(step);
    }
  }, [step, maxStepReached]);

  const handleNext = async (data?: Partial<ProjectFormData>): Promise<void> => {
    if (data) {
      const newFormData = { ...localFormData, ...data };
      setLocalFormData(newFormData);
      dispatch(setReduxFormData(newFormData));
    }
    if (step < steps.length - 1) {
      setStep((prev) => prev + 1);
    }
    await refetchServer();
  };

  const handleBack = async () => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
    await refetchServer();
  };

  const handleStepClick = async (index: number) => {
    if (index <= maxStepReached) {
      setStep(index);
      await refetchServer();
    }
  };

  const handleSubmit = () => {
    localStorage.removeItem('projectFormData');
    localStorage.removeItem('projectCreationStep');
    localStorage.removeItem('projectCreationMaxStep');
    localStorage.removeItem('projectCreationId');
    dispatch(setProjectId(0));
    navigate('/project/list');
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <ProjectDetailsForm
            initialData={localFormData}
            serverData={localFormData} // Sửa ở đây: dùng localFormData thay vì serverData?.data
            onNext={handleNext}
          />
        );
      case 1:
        return (
          <RequirementsForm
            initialData={{
              requirements: serverData?.data?.requirements || localFormData.requirements,
            }}
            serverData={serverData?.data?.requirements || []}
            onNext={(requirements) => handleNext({ requirements })}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <InviteesForm
            initialData={{
              ...localFormData,
              invitees: localFormData.invitees.map((inv) => inv.email),
            }}
            serverData={
              serverData?.data?.projectMembers?.map((member) => ({
                ...member,
                accountName: member.email?.split('@')[0] || `User${member.accountId || 'Unknown'}`,
              })) || []
            }
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return <ProjectOverview />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="relative flex justify-between items-center mb-16">
          {steps.map((label, index) => (
            <div key={index} className="flex-1 flex flex-col items-center relative group">
              {index < steps.length - 1 && (
                <div className="absolute top-5 left-1/2 w-full h-2 bg-gray-200 z-0 progress-bar">
                  <div
                    className="h-2 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] transition-all duration-800 ease-in-out progress-bar"
                    style={{ width: index < maxStepReached ? '100%' : '0%' }}
                  ></div>
                </div>
              )}
              <button
                onClick={() => handleStepClick(index)}
                className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-base font-bold transition-all duration-500 ease-in-out border
                  ${
                    index <= maxStepReached
                      ? 'bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white border-blue-600 cursor-pointer hover:opacity-80'
                      : 'bg-gray-200 text-gray-700 border-gray-300 cursor-not-allowed'
                  } ${index === step ? 'scale-125 glow' : ''}`}
                disabled={index > maxStepReached}
                aria-label={`Go to step ${label}`}
              >
                {index < maxStepReached ? (
                  <svg
                    className="w-6 h-6 checkmark"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </button>
              <p
                className={`text-sm mt-4 text-center w-28 transition-colors duration-300 font-medium
                  ${index === step ? 'text-blue-600' : 'text-gray-500'}`}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
        <div>{renderStep()}</div>
      </div>
    </div>
  );
};

export default ProjectCreation;