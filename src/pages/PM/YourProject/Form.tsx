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
import React, { useState } from 'react';
import { Check, FileText, Users, Briefcase } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface DocumentOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  recommended?: boolean;
}

const DocumentTypeSelector: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey');

  const documentOptions: DocumentOption[] = [
    {
      id: 'PERSONAL_DOCUMENT',
      name: 'Personal',
      icon: <Briefcase className='w-8 h-8 text-purple-600' />,
      description: 'Best for project proposals and contracts',
      features: [
        'Structured sections with clear objectives',
        'Timeline and budget breakdown',
        'Professional legal formatting',
      ],
    },

    {
      id: 'PROJECT_SUMMARY',
      name: 'Project',
      icon: <Users className='w-8 h-8 text-green-600' />,
      description: 'Ideal for meetings and presentations',
      features: [
        'Slide-based format with visual elements',
        'Speaker notes and animation support',
        'Interactive elements for engagement',
      ],
      recommended: true,
    },
    {
      id: 'recent_form',
      name: 'Recent Form',
      icon: <FileText className='w-8 h-8 text-blue-600' />,
      description: 'Perfect for business reports and analysis',
      features: [
        'Professional formatting with charts and tables',
        'Executive summary and detailed sections',
        'Data visualization support',
      ],
    },
  ];

  const handleSelectType = (typeId: string) => {
    if (!projectKey) {
      alert('Missing projectKey');
      return;
    }

    setSelectedType(typeId);
    if (typeId !== 'recent_form') {
      navigate(`/project/projects/form/${typeId}/new?projectKey=${projectKey}`);
    } else {
      navigate(`/project/projects/form/recent_form`);
    }
  };

  return (
    <div className=' bg-gradient-to-br from-slate-100 to-slate-200 py-12 px-4'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-12'>
          <p className='text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2'>
            CREATE DOCUMENT
          </p>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>Document Type Options</h1>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Choose the type of document you want to create to get started with the perfect template
          </p>
        </div>

        <div className='grid md:grid-cols-3 gap-8 mb-8'>
          {documentOptions.map((option) => (
            <div
              key={option.id}
              className={`relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
                selectedType === option.id
                  ? 'ring-2 ring-blue-500 transform scale-105'
                  : 'hover:transform hover:scale-102'
              }`}
            >
              {option.recommended && (
                <div className='absolute top-4 right-4 bg-gradient-to-r from-green-400 to-green-600 text-white text-xs font-bold px-3 py-1 rounded-full'>
                  RECOMMENDED
                </div>
              )}

              <div className='p-8'>
                <div className='flex items-center justify-center mb-6'>
                  <div className='bg-gray-50 p-4 rounded-full'>{option.icon}</div>
                </div>

                <h3 className='text-2xl font-bold text-gray-900 text-center mb-2'>{option.name}</h3>

                <p className='text-gray-600 text-center mb-6 leading-relaxed'>
                  {option.description}
                </p>

                <div className='space-y-3 mb-8'>
                  {option.features.map((feature, index) => (
                    <div key={index} className='flex items-start space-x-3'>
                      <div className='flex-shrink-0 mt-1'>
                        <Check className='w-4 h-4 text-green-500' />
                      </div>
                      <p className='text-sm text-gray-700 leading-relaxed'>{feature}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSelectType(option.id)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                    selectedType === option.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                  }`}
                >
                  {selectedType === option.id ? 'SELECTED' : 'SELECT THIS TYPE'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedType && (
          <div className='text-center'>
            <div className='bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto'>
              <p className='text-gray-700 mb-4'>
                Ready to create your{' '}
                <span className='font-semibold text-blue-600'>
                  {documentOptions.find((opt) => opt.id === selectedType)?.name}
                </span>
                ?
              </p>
              <div className='flex gap-3 justify-center'>
                <button
                  onClick={() => setSelectedType('')}
                  className='px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
                >
                  Change Selection
                </button>
                <button
                  onClick={() => alert(`Creating ${selectedType} document...`)}
                  className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold'
                >
                  Create Document
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentTypeSelector;
