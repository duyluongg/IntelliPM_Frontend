// import React from 'react';
// import { Link, useNavigate, useSearchParams } from 'react-router-dom';
// import { Lock, Globe, Share2 } from 'lucide-react';
// import { DocumentOptionCard } from './DocumentOptionCard';

// const DocumentTypeSelector: React.FC = () => {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const projectKey = searchParams.get('projectKey');

//   const documentOptions = [
//     {
//       id: 'MAIN',
//       name: 'Main Document',
//       icon: <Globe className='w-7 h-7 text-blue-600' />,
//       description: 'Visible to all project members. Use this for public documents within the team.',
//       features: ['Everyone in the project can view', 'No invitation required'],
//     },
//     {
//       id: 'PRIVATE',
//       name: 'Private Document',
//       icon: <Lock className='w-7 h-7 text-red-600' />,
//       description: 'Only visible to you and invited members.',
//       features: ['Restricted visibility', 'Great for drafts or sensitive info'],
//     },
//     {
//       id: 'SHAREABLE',
//       name: 'Shareable Document',
//       icon: <Share2 className='w-7 h-7 text-green-600' />,
//       description: 'You can invite clients or external users to view.',
//       features: ['Invite-only access', 'Suitable for client-facing documents'],
//     },
//   ];
//   const handleSelectType = (typeId: string) => {
//     if (!projectKey) {
//       alert('Missing project key. Please go back and select a project.');
//       return;
//     }

//     if (typeId !== 'recent_form') {
//       navigate(`/project/projects/form/${typeId}/new?projectKey=${projectKey}`);
//     } else {
//       navigate(`/project/projects/form/recent_form`);
//     }
//   };

//   return (
//     <div className='bg-gray-50 min-h-screen py-6 px-4 sm:px-6 lg:px-8'>
//       <div className='max-w-7xl mx-auto'>
//         {/* Header Section */}
//         <div className='text-center mb-12'>
//           <h1 className='text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight'>
//             Create a New Document
//           </h1>
//           <p className='mt-4 max-w-2xl mx-auto text-lg text-gray-600'>
//             Choose a template to get started. Each one is tailored for a specific purpose.
//           </p>

//           <button
//             className='mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors'
//             onClick={() => navigate(`/project/projects/form/recent_form?projectKey=${projectKey}`)}
//           >
//             Recent Form
//           </button>
//         </div>

//         {/* Grid of Options */}
//         <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
//           {documentOptions.map((option) => (
//             <DocumentOptionCard key={option.id} option={option} onSelect={handleSelectType} />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DocumentTypeSelector;
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Globe, Share2 } from 'lucide-react';
import { DocumentOptionCard } from './DocumentOptionCard';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useCreateDocumentMutation } from '../../../services/Document/documentAPI';
import { useSelector } from 'react-redux';

const DocumentTypeSelector: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey');
  const projectId = useSelector((state: RootState) => state.project.currentProjectId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [title, setTitle] = useState('');

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
    setSelectedType(typeId);
    setIsModalOpen(true);
  };

  const [createDocument] = useCreateDocumentMutation();

  const handleConfirm = async () => {
    if (!title.trim()) return alert('Vui lòng nhập tiêu đề');
    if (!projectKey || !selectedType) return alert('Thiếu thông tin');

    const payload = {
      projectId: projectId, // ép kiểu từ query string
      // taskId: '',
      // epicId: '',
      // subTaskId: '',
      title: title,
      template: '',
      content: '',
      visibility: selectedType,
    };

    try {
      const res = await createDocument(payload).unwrap();
      navigate(`/project/projects/form/document/${res.data.id}`);
    } catch (err) {
      console.error('Error creating document:', err);
      alert('Tạo document thất bại');
    } finally {
      setIsModalOpen(false);
      setTitle('');
    }
  };

  return (
    <div className='bg-gray-50 min-h-screen py-6 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-12'>
          <h1 className='text-4xl md:text-5xl font-extrabold text-gray-900'>
            Create a New Document
          </h1>
          <p className='mt-4 max-w-2xl mx-auto text-lg text-gray-600'>
            Choose a template to get started. Each one is tailored for a specific purpose.
          </p>
          <button
            className='mt-4 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700'
            onClick={() => navigate(`/project/projects/form/recent_form`)}
          >
            Recent Form
          </button>
        </div>

        {/* Grid */}
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {documentOptions.map((option) => (
            <DocumentOptionCard key={option.id} option={option} onSelect={handleSelectType} />
          ))}
        </div>
      </div>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className='fixed z-50 inset-0 overflow-y-auto'
      >
        <div className='flex items-center justify-center min-h-screen px-4'>
          <div className='fixed inset-0 bg-black/40' aria-hidden='true' />

          <DialogPanel className='relative z-10 bg-white p-6 rounded-lg shadow-lg w-full max-w-md'>
            <DialogTitle className='text-lg font-bold'>Enter Document Title</DialogTitle>
            <input
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Enter title...'
              className='mt-4 w-full border border-gray-300 rounded-md p-2'
            />
            <div className='mt-6 flex justify-end gap-2'>
              <button
                onClick={() => setIsModalOpen(false)}
                className='px-4 py-2 bg-gray-200 rounded-md'
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className='px-4 py-2 bg-blue-600 text-white rounded-md'
              >
                Confirm
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
};

export default DocumentTypeSelector;
