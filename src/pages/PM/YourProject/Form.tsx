import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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

          <button
            className='mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors'
            onClick={() => navigate(`/project/projects/form/recent_form?projectKey=${projectKey}`)}
          >
            Recent Form
          </button>
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
