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
import TaskSetupPM from './TaskSetup/PM/TaskSetupPM';
import ProjectOverviewPM from './ProjectOverview/ProjectOverviewPM';
import {
  useGetProjectDetailsByIdQuery,
  useCreateProjectMutation,
  useSendInvitationsMutation,
} from '../../services/projectApi';
import { useGetEpicsByProjectIdQuery } from '../../services/epicApi';
import type { ProjectDetailsById } from '../../services/projectApi';
import type { EpicResponseDTO } from '../../services/epicApi';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

// Extend EpicResponseDTO to include tasks
interface ExtendedEpicResponseDTO extends EpicResponseDTO {
  tasks?: Array<{
    id?: number | string;
    taskId?: string;
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    suggestedRole?: string;
    assignedMembers?: Array<{
      accountId: number;
      fullName?: string;
      picture?: string;
    }>;
  }>;
}

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

interface ProjectDetailsFormProps {
  initialData: ProjectFormData;
  serverData: ProjectFormData;
  onNext: (data?: Partial<ProjectFormData>) => Promise<void>;
}

interface RequirementsFormProps {
  initialData: { requirements: ProjectFormData['requirements'] };
  serverData: ProjectFormData['requirements'];
  onNext: (requirements: ProjectFormData['requirements']) => Promise<void>;
  onBack: () => Promise<void>;
}

interface InviteesFormProps {
  initialData: { invitees: string[] } & Pick<ProjectFormData, 'id' | 'projectKey'>;
  serverData: Array<
    ProjectDetailsById['projectMembers'][number] & { accountName: string }
  >;
  onNext: (data?: Partial<ProjectFormData>) => Promise<void>;
  onBack: () => Promise<void>;
}

interface TaskSetupProps {
  projectId: number | undefined;
  projectKey: string;
  handleNext: (data?: Partial<ProjectFormData>) => Promise<void>; // Updated signature
}

interface ProjectOverviewProps {
  formData: ProjectFormData;
  onBack: () => Promise<void>;
  onNotifyMembers: () => Promise<void>;
}

const steps = [
  'Project Details',
  'Requirements',
  'Invite Members',
  'Task Setup',
  'Overview',
];

const ProjectCreationPM: React.FC = () => {
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

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
          startDate: parsed.startDate || '2025-08-13',
          endDate: parsed.endDate || '2025-08-13',
          requirements: Array.isArray(parsed.requirements) ? parsed.requirements : [],
          invitees: Array.isArray(parsed.invitees) ? parsed.invitees : [],
          epics: Array.isArray(parsed.epics) ? parsed.epics : [],
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
      startDate: '2025-08-13',
      endDate: '2025-08-13',
      requirements: [],
      invitees: [],
      epics: [],
    };
  });

  const { data: serverData, refetch: refetchServer, error: fetchError } = useGetProjectDetailsByIdQuery(
    projectId || 0,
    { skip: !projectId }
  );

  const { data: epicsData, error: epicsError } = useGetEpicsByProjectIdQuery(
    projectId || 0,
    { skip: !projectId }
  );

  const [createProject, { isLoading: isCreatingProject, error: createProjectError }] = useCreateProjectMutation();
  const [sendInvitations, { isLoading: isSendingInvitations, error: sendInvitationsError }] = useSendInvitationsMutation();

  // Restore projectId from localStorage
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
        startDate: serverData.data.startDate || '2025-08-13',
        endDate: serverData.data.endDate || '2025-08-13',
        requirements: serverData.data.requirements || [],
        invitees:
          serverData.data.projectMembers?.map((member) => ({
            email: member.email || '',
            role: member.status === 'PENDING' ? 'Team Member' : member.status || 'Team Member',
            positions: member.projectPositions?.map((pos) => pos.position) || [],
            accountId: member.accountId,
          })) || [],
        epics: (epicsData as ExtendedEpicResponseDTO[] | undefined)?.map((epic) => ({
          epicId: epic.id?.toString() || crypto.randomUUID(),
          title: epic.name || 'Untitled Epic',
          description: epic.description || 'No description',
          startDate: epic.startDate || '2025-08-13',
          endDate: epic.endDate || '2025-08-13',
          backendEpicId: epic.id?.toString(),
          tasks: epic.tasks?.map((task) => ({
            id: task.id?.toString() || crypto.randomUUID(),
            taskId: task.id?.toString(),
            title: task.title || 'Untitled Task',
            description: task.description || 'No description',
            startDate: task.startDate || '2025-08-13',
            endDate: task.endDate || '2025-08-13',
            suggestedRole: task.suggestedRole || 'Developer',
            assignedMembers: task.assignedMembers?.map((member) => ({
              accountId: member.accountId,
              fullName: member.fullName || 'Unknown Member',
              picture: member.picture || 'https://i.pravatar.cc/40',
            })) || [],
          })) || [],
        })) || [],
      };
      setLocalFormData(updatedData);
      dispatch(setReduxFormData(updatedData));
      localStorage.setItem('projectFormData', JSON.stringify(updatedData));
    }
    if (fetchError) {
      const errorMessage = (fetchError as FetchBaseQueryError)?.data
        ? ((fetchError as FetchBaseQueryError).data as { message: string }).message
        : 'Failed to fetch project details.';
      setErrorMessage(errorMessage);
    }
    if (epicsError) {
      const errorMessage = (epicsError as FetchBaseQueryError)?.data
        ? ((epicsError as FetchBaseQueryError).data as { message: string }).message
        : 'Failed to fetch epics.';
      setErrorMessage(errorMessage);
    }
  }, [serverData, epicsData, fetchError, epicsError, dispatch]);

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

  // Handle errors from API calls
  useEffect(() => {
    if (createProjectError) {
      const errorMessage = (createProjectError as FetchBaseQueryError)?.data
        ? ((createProjectError as FetchBaseQueryError).data as { message: string }).message
        : 'Failed to create project.';
      setErrorMessage(errorMessage);
    }
    if (sendInvitationsError) {
      const errorMessage = (sendInvitationsError as FetchBaseQueryError)?.data
        ? ((sendInvitationsError as FetchBaseQueryError).data as { message: string }).message
        : 'Failed to send invitations.';
      setErrorMessage(errorMessage);
    }
  }, [createProjectError, sendInvitationsError]);

  const handleNext = async (data?: Partial<ProjectFormData>): Promise<void> => {
    if (data) {
      const newFormData = { ...localFormData, ...data };
      setLocalFormData(newFormData);
      dispatch(setReduxFormData(newFormData));
      // Create project in step 0 if not exists
      if (step === 0 && !projectId) {
        try {
          const projectData = {
            name: newFormData.name,
            projectKey: newFormData.projectKey,
            description: newFormData.description,
            budget: newFormData.budget,
            projectType: newFormData.projectType,
            startDate: newFormData.startDate,
            endDate: newFormData.endDate,
          };
          const response = await createProject(projectData).unwrap();
          if (response.isSuccess && response.data.id) {
            dispatch(setProjectId(response.data.id));
            setLocalFormData((prev) => ({ ...prev, id: response.data.id }));
            localStorage.setItem('projectCreationId', response.data.id.toString());
          } else {
            setErrorMessage(response.message || 'Failed to create project.');
            return;
          }
        } catch (error) {
          const errorMessage = (error as FetchBaseQueryError)?.data
            ? ((error as FetchBaseQueryError).data as { message: string }).message
            : 'An error occurred while creating the project.';
          setErrorMessage(errorMessage);
          return;
        }
      }
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

  const handleNotifyMembers = async () => {
    if (!projectId) {
      setErrorMessage('Project ID is not available.');
      return;
    }
    if (!localFormData.invitees.length) {
      setErrorMessage('No members to notify. Please add members in the Invite Members step.');
      return;
    }
    try {
      const response = await sendInvitations(projectId).unwrap();
      if (response.isSuccess) {
        localStorage.removeItem('projectFormData');
        localStorage.removeItem('projectCreationStep');
        localStorage.removeItem('projectCreationMaxStep');
        localStorage.removeItem('projectCreationId');
        dispatch(setProjectId(0));
        navigate('/project/list');
      } else {
        setErrorMessage(response.message || 'Failed to send invitations.');
      }
    } catch (error) {
      const errorMessage = (error as FetchBaseQueryError)?.data
        ? ((error as FetchBaseQueryError).data as { message: string }).message
        : 'An error occurred while sending invitations.';
      setErrorMessage(errorMessage);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <ProjectDetailsForm
            initialData={localFormData}
            serverData={localFormData}
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
        return (
          <TaskSetupPM
            projectId={projectId}
            projectKey={localFormData.projectKey}
            handleNext={handleNext}
          />
        );
      case 4:
        return (
          <ProjectOverviewPM
            formData={{
              ...localFormData,
              requirements: localFormData.requirements.map((req) => ({
            ...req,
            projectId: localFormData.id ?? 0,
            createdAt: (req as any).createdAt ?? undefined,
            updatedAt: (req as any).updatedAt ?? undefined,
              })),
            }}
            onBack={handleBack}
            onNotifyMembers={handleNotifyMembers}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {errorMessage}
            <button
              onClick={() => setErrorMessage(null)}
              className="ml-4 text-red-900 hover:text-red-700"
            >
              Close
            </button>
          </div>
        )}
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
                    viewBox="0 24 24"
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

export default ProjectCreationPM;
