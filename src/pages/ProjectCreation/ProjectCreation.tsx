import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectDetailsForm from './ProjectDetailsForm/ProjectDetailsForm';
import RequirementsForm from './RequirementsForm/RequirementsForm';
import InviteesForm from './InviteesForm/InviteesForm';

interface ProjectFormData {
  name: string;
  projectKey: string;
  description: string;
  requirements: string[];
  invitees: string[];
}

const steps = [
  'Project Details',
  'Requirements',
  'Invite Members',
];

const ProjectCreation: React.FC = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    projectKey: '',
    description: '',
    requirements: [''],
    invitees: ['']
  });
  const navigate = useNavigate();

  const handleNext = (data: Partial<ProjectFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('https://localhost:7128/api/project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formData.name,
          projectKey: formData.projectKey,
          description: formData.description,
          budget: 0,
          projectType: 'WEB_APPLICATION',
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          status: 'PLANNING'
        })
      });

      const result = await response.json();
      if (result.isSuccess) {
        navigate(`/projects?projectKey=${formData.projectKey}`);
      }
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <ProjectDetailsForm initialData={formData} onNext={handleNext} />;
      case 1:
        return <RequirementsForm initialData={formData} onNext={handleNext} onBack={handleBack} />;
      case 2:
        return <InviteesForm initialData={formData} onNext={handleSubmit} onBack={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto p-6">
        {/* Step indicator */}
        <div className="relative flex justify-between items-center mb-10">
          {steps.map((label, index) => (
            <div key={index} className="flex-1 flex flex-col items-center relative">
              {/* Line connector */}
              {index < steps.length - 1 && (
                <div className="absolute top-4 left-1/2 w-full h-0.5 bg-gray-300 z-0">
                  <div
                    className={`h-0.5 ${index < step ? 'bg-[#1c73fd]' : 'bg-gray-300'}`}
                    style={{ width: '100%' }}
                  ></div>
                </div>
              )}
              {/* Circle step */}
              <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
                ${index <= step ? 'bg-[#1c73fd] text-white' : 'bg-gray-300 text-gray-700'}`}>
                {index + 1}
              </div>
              <p className={`text-sm mt-2 text-center w-24 ${index === step ? 'text-[#1c73fd] font-medium' : 'text-gray-500'}`}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="bg-white rounded shadow p-6">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default ProjectCreation;
