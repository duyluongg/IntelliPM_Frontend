// File: src/pages/ProjectCreation/ProjectCreation.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectDetailsForm from './ProjectDetailsForm/ProjectDetailsForm';
import RequirementsForm from './RequirementsForm/RequirementsForm';
import InviteesForm from './InviteesForm/InviteesForm';

const steps = [
  'Project Details',
  'Requirements',
  'Invite Members',
];

const ProjectCreation: React.FC = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    projectKey: '',
    description: '',
    requirements: [''],
    invitees: ['']
  });
  const navigate = useNavigate();

  const handleNext = (data: any) => {
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
    <div className="max-w-5xl mx-auto p-6">
      {/* Step indicator */}
      <div className="flex justify-between items-center mb-6">
        {steps.map((label, index) => (
          <div key={index} className="flex-1 text-center">
            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold ${index <= step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'}`}>{index + 1}</div>
            <p className={`text-sm mt-2 ${index === step ? 'font-semibold text-blue-700' : 'text-gray-500'}`}>{label}</p>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white rounded shadow p-6">
        {renderStep()}
      </div>
    </div>
  );
};

export default ProjectCreation;
