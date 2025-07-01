// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import ScrumIntroduction from '../ScrumIntroduction';
// import ProjectDetailsForm from './ProjectDetailsForm';
// import RequirementsForm from './RequirementsForm';
// import InviteesForm from './InviteesForm';
// import StepIndicator from './components/StepIndicator';
// import { useCreateProjectMutation } from '../../services/projectApi';
// import './ProjectCreation.css';

// interface ProjectFormData {
//   name: string;
//   key: string;
//   description: string;
//   requirements: string[];
//   invitees: string[];
// }

// const ProjectCreation: React.FC = () => {
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState<ProjectFormData>({
//     name: '',
//     key: '',
//     description: '',
//     requirements: [],
//     invitees: [],
//   });
//   const [createProject, { isLoading, error }] = useCreateProjectMutation();
//   const navigate = useNavigate();

//   const handleNext = (data: Partial<ProjectFormData>) => {
//     setFormData(prev => ({ ...prev, ...data }));
//     setStep(prev => prev + 1);
//   };

//   const handleBack = () => {
//     setStep(prev => prev - 1);
//   };

//   const handleSubmit = async () => {
//     try {
//       await createProject(formData).unwrap();
//       navigate('/projects?projectKey=' + formData.key);
//     } catch (err) {
//       console.error('Failed to create project:', err);
//     }
//   };

//   const steps = [
//     { label: 'Introduction', component: <ScrumIntroduction onNext={() => setStep(2)} /> },
//     { label: 'Project Details', component: <ProjectDetailsForm onNext={handleNext} onBack={handleBack} initialData={formData} /> },
//     { label: 'Requirements', component: <RequirementsForm onNext={handleNext} onBack={handleBack} initialData={formData} /> },
//     { label: 'Invitees', component: <InviteesForm onNext={handleSubmit} onBack={handleBack} initialData={formData} /> },
//   ];

//   return (
//     <div className="project-creation-container">
//       <StepIndicator steps={steps.map(s => s.label)} currentStep={step} />
//       {error && <div className="error-message">Error: {error.toString()}</div>}
//       {isLoading && <div className="loading-spinner">Creating project...</div>}
//       <div className="step-content">{steps[step - 1].component}</div>
//     </div>
//   );
// };

// export default ProjectCreation;