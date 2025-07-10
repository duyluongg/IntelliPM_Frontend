import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    projectKey: '',
    description: '',
    requirements: [''],
    invitees: [''],
  });
  const navigate = useNavigate();

  const handleNext = async () => {
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
    navigate(`/project/${formData.projectKey}/dashboard`);
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
        return <RequirementsForm initialData={{ requirements: initialRequirements }} onNext={handleNext} onBack={handleBack} />;
      case 2:
        return <InviteesForm initialData={formData} onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <ProjectOverview />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex justify-between items-center mb-10">
          {steps.map((label, index) => (
            <div key={index} className="flex-1 flex flex-col items-center relative">
              {index < steps.length - 1 && (
                <div className="absolute top-4 left-1/2 w-full h-0.5 bg-gray-300 z-0">
                  <div
                    className={`h-0.5 ${index < step ? 'bg-blue-600' : 'bg-gray-300'}`}
                    style={{ width: '100%' }}
                  ></div>
                </div>
              )}
              <div
                className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
                ${index <= step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'}`}
              >
                {index + 1}
              </div>
              <p
                className={`text-sm mt-2 text-center w-24 ${
                  index === step ? 'text-blue-600 font-medium' : 'text-gray-500'
                }`}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white">{renderStep()}</div>
      </div>
    </div>
  );
};

export default ProjectCreation;