import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectProjectId, setProjectId } from '../../components/slices/Project/projectCreationSlice';
import ProjectDetailsForm from './ProjectDetailsForm/ProjectDetailsForm';
import RequirementsForm from './RequirementsForm/RequirementsForm';
import InviteesForm from './InviteesForm/InviteesForm';
import ProjectOverview from './ProjectOverview/ProjectOverview';

interface ProjectFormData {
  name: string;
  projectKey: string;
  description: string;
  requirements: string[];
  invitees: string[];
}

const steps = ['Project Details', 'Requirements', 'Invite Members', 'Project Overview'];

const ProjectCreation: React.FC = () => {
  const dispatch = useDispatch();
  const projectId = useSelector(selectProjectId);
  const [step, setStep] = useState<number>(() => {
    const savedStep = localStorage.getItem('projectCreationStep');
    return savedStep ? parseInt(savedStep, 10) : 0;
  });
  const [formData, setFormData] = useState<ProjectFormData>(() => {
    const savedData = localStorage.getItem('projectFormData');
    try {
      return savedData
        ? JSON.parse(savedData)
        : {
            name: '',
            projectKey: '',
            description: '',
            requirements: [''],
            invitees: [''],
          };
    } catch (e) {
      console.error('Error parsing projectFormData from localStorage:', e);
      return {
        name: '',
        projectKey: '',
        description: '',
        requirements: [''],
        invitees: [''],
      };
    }
  });
  const navigate = useNavigate();

  // Restore projectId from localStorage on mount
  useEffect(() => {
    const savedProjectId = localStorage.getItem('projectCreationId');
    if (savedProjectId && !projectId) {
      dispatch(setProjectId(parseInt(savedProjectId, 10)));
    }
  }, [dispatch, projectId]);

  // Save formData, step, and projectId to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('projectFormData', JSON.stringify(formData));
    localStorage.setItem('projectCreationStep', step.toString());
    if (projectId) {
      localStorage.setItem('projectCreationId', projectId.toString());
    }
  }, [formData, step, projectId]);

  const handleNext = (data?: Partial<ProjectFormData>) => {
    if (data) {
      setFormData((prev) => ({ ...prev, ...data }));
    }
    if (step < steps.length - 1) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    localStorage.removeItem('projectFormData');
    localStorage.removeItem('projectCreationStep');
    localStorage.removeItem('projectCreationId');
    dispatch(setProjectId(0)); 
    navigate(`/project/list`);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <ProjectDetailsForm initialData={formData} onNext={handleNext} />;
      case 1:
        const initialRequirements = formData.requirements.map((title) => ({
          title,
          type: '',
          description: '',
          priority: '',
        }));
        return (
          <RequirementsForm
            initialData={{ requirements: initialRequirements }}
            onNext={(requirements) =>
              handleNext({
                requirements: requirements.map((req) => req.title),
              })
            }
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <InviteesForm
            initialData={formData}
            onNext={async () => handleNext()}
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
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.3); opacity: 0.1; }
            100% { transform: scale(1); opacity: 0.3; }
          }
          @keyframes checkmark {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.2); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .pulse-effect::before {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(28, 115, 253, 0.3), transparent);
            border-radius: 50%;
            animation: pulse 2s infinite;
            z-index: -1;
          }
          .tooltip {
            animation: fadeIn 0.3s ease-in-out;
          }
          .checkmark {
            animation: checkmark 0.4s ease-out;
          }
          .progress-bar {
            border-radius: 9999px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .glow {
            box-shadow: 0 0 8px rgba(28, 115, 253, 0.6), 0 0 16px rgba(28, 115, 253, 0.3);
          }
        `}
      </style>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="relative flex justify-between items-center mb-16">
          {steps.map((label, index) => (
            <div key={index} className="flex-1 flex flex-col items-center relative group">
              {index < steps.length - 1 && (
                <div className="absolute top-5 left-1/2 w-full h-2 bg-gray-200 z-0 progress-bar">
                  <div
                    className="h-2 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] transition-all duration-800 ease-in-out progress-bar"
                    style={{
                      width: index < step ? '100%' : '0%',
                    }}
                  ></div>
                </div>
              )}
              <div
                className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-base font-bold transition-all duration-500 ease-in-out border
                  ${index < step ? 'bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white border-blue-600' : 
                    index === step ? 'bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white border-blue-600 scale-125 glow pulse-effect' : 
                    'bg-gray-200 text-gray-700 border-gray-300'}`}
              >
                {index < step ? (
                  <svg className="w-6 h-6 checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <p
                className={`text-sm mt-4 text-center w-28 transition-colors duration-300 font-medium
                  ${index === step ? 'text-blue-600' : 'text-gray-500'}`}
              >
                {label}
              </p>
              <div className="absolute top-16 hidden group-hover:block bg-gray-900 text-white text-sm rounded-lg py-2 px-4 shadow-xl z-20 tooltip">
                {label}
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            </div>
          ))}
        </div>

        <div>{renderStep()}</div>
      </div>
    </div>
  );
};

export default ProjectCreation;