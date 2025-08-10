// src/components/DocumentTypeSelector.tsx

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Globe } from 'lucide-react';
import { DocumentOptionCard } from './DocumentOptionCard';
import { Dialog, DialogPanel, DialogTitle, Transition } from '@headlessui/react';
import { useCreateDocumentMutation } from '../../../services/Document/documentAPI';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const DocumentTypeSelector: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = useSelector((state: RootState) => state.project.currentProjectId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [title, setTitle] = useState('');

  const [createDocument, { isLoading }] = useCreateDocumentMutation();

  const documentOptions = [
    {
      id: 'MAIN',
      name: 'Main Document',
      icon: <Globe className='w-7 h-7 text-blue-600' />,
      description: 'Visible to all project members. Use this for public documents within the team.',
      features: ['Everyone in the project can view', 'No invitation required'],
      recommended: true,
    },
    {
      id: 'PRIVATE',
      name: 'Private Document',
      icon: <Lock className='w-7 h-7 text-red-600' />,
      description: 'Only visible to you and invited members.',
      features: ['Restricted visibility', 'Great for drafts or sensitive info'],
    },
  ];

  const handleSelectType = (typeId: string) => {
    if (!projectId) {
      toast.error('Project not found. Please select a project first.');
      return;
    }
    setSelectedType(typeId);
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title for the document.');
      return;
    }
    if (!projectId || !selectedType) return;

    const payload = {
      projectId: projectId,
      title: title,
      content: '', // Start with empty content
      visibility: selectedType,
    };

    const promise = createDocument(payload).unwrap();

    toast.promise(promise, {
      loading: 'Creating document...',
      success: (res) => {
        navigate(`/project/projects/form/document/${res.data.id}`);
        return 'Document created successfully! 🎉';
      },
      error: 'Failed to create document. Please try again.',
    });

    // Close modal after initiating
    setIsModalOpen(false);
    setTitle('');
  };

  return (
    <div className='bg-slate-50 dark:bg-slate-900 min-h-screen py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight'>
            Create a New Document
          </h1>
          <p className='mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300'>
            Choose a starting point. Each template is designed for a specific collaboration style.
          </p>
          <button
            className='mt-6 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-lg font-semibold shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors'
            onClick={() => navigate(`/project/projects/form/recent_form`)}
          >
            Or, start from a recent form
          </button>
        </div>

        {/* Grid */}
        <div className='grid md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
          {documentOptions.map((option) => (
            <DocumentOptionCard key={option.id} option={option} onSelect={handleSelectType} />
          ))}
        </div>
      </div>

      {/* --- MODAL ĐÃ ĐƯỢC NÂNG CẤP --- */}
      <Transition appear show={isModalOpen} as={React.Fragment}>
        <Dialog as='div' className='relative z-50' onClose={() => setIsModalOpen(false)}>
          <Transition.Child
            as={React.Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black/50 backdrop-blur-sm' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <Transition.Child
                as={React.Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <DialogPanel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 text-left align-middle shadow-xl transition-all'>
                  <DialogTitle
                    as='h3'
                    className='text-lg font-bold leading-6 text-slate-900 dark:text-white'
                  >
                    Name Your Document
                  </DialogTitle>
                  <div className='mt-4'>
                    <p className='text-sm text-slate-500 dark:text-slate-400'>
                      You can always change this later.
                    </p>
                    <input
                      type='text'
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                      placeholder='e.g., "Q1 Marketing Plan"'
                      className='mt-2 w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
                      autoFocus
                    />
                  </div>
                  <div className='mt-6 flex justify-end gap-3'>
                    <button
                      type='button'
                      onClick={() => setIsModalOpen(false)}
                      className='px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors'
                    >
                      Cancel
                    </button>
                    <button
                      type='button'
                      onClick={handleConfirm}
                      disabled={isLoading || !title.trim()}
                      className='px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-500 disabled:cursor-not-allowed transition-colors'
                    >
                      {isLoading ? 'Creating...' : 'Create Document'}
                    </button>
                  </div>
                </DialogPanel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default DocumentTypeSelector;
