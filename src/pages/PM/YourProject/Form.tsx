// import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
// import { FileText, Zap, Bug, AlertTriangle, Shuffle, SlidersHorizontal } from 'lucide-react';
// import FeatureRequestForm from './FeatureRequestForm';
// import RecentForm from './RecentForm';
// import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
// import DocWrapper from './DocWrapper';
// import { useAuth } from '../../../services/AuthContext';
// import { setCurrentProjectId } from '../../../components/slices/Project/projectCurrentSlice';
// import { useDispatch } from 'react-redux';

import { FaRegCalendar } from 'react-icons/fa';

// const templates = [
//   { id: 'blank', label: 'Blank form', icon: <FileText size={16} /> },
//   { id: 'doc', label: 'Documents', icon: <FileText size={16} /> },

//   { id: 'feature', label: 'Feature request', icon: <Zap size={16} /> },
//   { id: 'bug', label: 'Bug report', icon: <Bug size={16} /> },
//   // { id: 'incident', label: 'Incident report', icon: <AlertTriangle size={16} /> },
//   // { id: 'review', label: 'Technical review', icon: <SlidersHorizontal size={16} /> },
//   { id: 'change', label: 'Change request', icon: <Shuffle size={16} /> },
// ];

// export default function Form() {
//   const { formId } = useParams();
//   const [searchParams] = useSearchParams();
//   const projectKey = searchParams.get('projectKey') || '';

//   const { data: projectData, error, isLoading } = useGetProjectDetailsByKeyQuery(projectKey);
//   const projectId = projectData?.data?.id || 0;
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const handleSelect = (templateId: string) => {
//     console.log(`Selected template: ${templateId}`);
//     sessionStorage.removeItem(`createdDoc-${templateId}`);
//     sessionStorage.removeItem(`docId-${templateId}`);
//     if (templateId === 'doc') {
//       navigate(`/project/projects/form/default/new?projectKey=${projectId}`);
//     } else {
//       navigate(`/project/projects/form/${templateId}?projectKey=${projectKey}`);
//     }
//   };

//   const handleSelectFormRQ = (projectId: number) => {
//   dispatch(setCurrentProjectId(projectId));
//   navigate('/team-leader/all-request-form');
// };

//   // const handleBack = () => {
//   //   navigate('/projects/form');
//   // };
//   const { user } = useAuth();
//   const userRole = user?.role;
//   console.log(userRole, 'userRole');

//   return (
//     <div className='min-h-screen bg-white'>
//       {/* <ProjectTabs /> */}

//       {/* {userRole === 'TEAM_LEADER' && (
//         <button
//           onClick={() =>handleSelectFormRQ(projectId) }
//           className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-indigo-700 transition duration-200'
//         >
//           All Request Form
//         </button>
//       )} */}

//       {!formId || formId === 'blank' ? (
//         <div className='p-4 space-y-3  '>
//           <h2 className='text-lg font-semibold text-gray-800'>Create a new form</h2>

//           <div className='flex flex-wrap gap-3 p-4 border rounded-md bg-white shadow-sm'>
//             {templates.map((template) => (
//               <button
//                 key={template.id}
//                 onClick={() => handleSelect( template.id)}
//                 className={`flex items-center gap-2 px-3 py-2 border rounded-md transition ${
//                   template.id === 'blank'
//                     ? 'bg-blue-600 text-white border-blue-600'
//                     : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
//                 }`}
//               >
//                 {template.icon}
//                 <span className='text-sm'>{template.label}</span>
//               </button>
//             ))}
//           </div>

//           <RecentForm />
//         </div>
//       ) : (
//         <div className='mt-6 max-w-5xl mx-auto'>
//           {formId === 'feature' && <FeatureRequestForm />}
//           {formId === 'doc' && <DocWrapper />}
//         </div>
//       )}
//     </div>
//   );
// }
// DocumentTypeSelector.tsx
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Globe, Share2 } from 'lucide-react';
import { DocumentOptionCard } from './DocumentOptionCard'; 

const DocumentTypeSelector: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey');


 
  const documentOptions = [
    {
      id: 'MAIN',
      name: 'Main Document',
      icon: <Globe className='w-7 h-7 text-blue-600' />,
      description: 'Visible to all project members. Use this for public documents within the team.',
      features: ['Everyone in the project can view', 'No invitation required'],
    },
    {
      id: 'PRIVATE',
      name: 'Private Document',
      icon: <Lock className='w-7 h-7 text-red-600' />,
      description: 'Only visible to you and invited members.',
      features: ['Restricted visibility', 'Great for drafts or sensitive info'],
    },
    {
      id: 'SHAREABLE',
      name: 'Shareable Document',
      icon: <Share2 className='w-7 h-7 text-green-600' />,
      description: 'You can invite clients or external users to view.',
      features: ['Invite-only access', 'Suitable for client-facing documents'],
    },
  ];
  const handleSelectType = (typeId: string) => {
    if (!projectKey) {
      alert('Missing project key. Please go back and select a project.');
      return;
    }

    if (typeId !== 'recent_form') {
      navigate(`/project/projects/form/${typeId}/new?projectKey=${projectKey}`);
    } else {
      navigate(`/project/projects/form/recent_form`);
    }
  };

  return (
    <div className='bg-gray-50 min-h-screen py-6 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header Section */}
        <div className='text-center mb-12'>
          <h1 className='text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight'>
            Create a New Document
          </h1>
          <p className='mt-4 max-w-2xl mx-auto text-lg text-gray-600'>
            Choose a template to get started. Each one is tailored for a specific purpose.
          </p>
        </div>

        {/* Grid of Options */}
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {documentOptions.map((option) => (
            <DocumentOptionCard key={option.id} option={option} onSelect={handleSelectType} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentTypeSelector;
