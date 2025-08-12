// src/pages/RecentForm.tsx

import { Link } from 'react-router-dom';
import { FileText, Lock, MoreHorizontal, CheckSquare, Trash2, Search } from 'lucide-react';
import {
  useGetDocumentsByProjectIdQuery,
  useDeleteDocumentMutation,
} from '../../../services/Document/documentAPI';
import { useEffect, useState, useMemo, Fragment } from 'react';
import type { RootState } from '../../../app/store';
import { useSelector } from 'react-redux';
import { Menu, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';
import { ConfirmationModal } from '../../../components/Modal/ConfirmationModal';

// Component Card mới, được tách ra để dễ quản lý
const DocumentCard = ({ doc, onDelete }: { doc: any; onDelete: (id: number) => void }) => {
  return (
    <div className='relative group flex flex-col bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200'>
      <Link to={`/project/projects/form/document/${doc.id}`} className='flex-grow p-4 pb-0'>
        <div className='relative h-28 rounded-md overflow-hidden mb-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center'>
          <FileText className='w-12 h-12 text-slate-300 dark:text-slate-600' />
        </div>
        <h3 className='font-bold text-slate-800 dark:text-white truncate' title={doc.title}>
          {doc.title}
        </h3>
        <p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>
          Edited {new Date(doc.updatedAt).toLocaleDateString()}
        </p>
      </Link>
      <div className='p-4 pt-2 flex items-center justify-between'>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
            doc.visibility === 'MAIN'
              ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
              : 'bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-300'
          }`}
        >
          {doc.visibility === 'PRIVATE' ? <Lock size={12} /> : <CheckSquare size={12} />}
          {doc.visibility}
        </span>
        <Menu as='div' className='relative'>
          <Menu.Button
            onClick={(e) => e.stopPropagation()}
            className='p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
          >
            <MoreHorizontal size={16} />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter='transition ease-out duration-100'
            enterFrom='transform opacity-0 scale-95'
            enterTo='transform opacity-100 scale-100'
            leave='transition ease-in duration-75'
            leaveFrom='transform opacity-100 scale-100'
            leaveTo='transform opacity-0 scale-95'
          >
            <Menu.Items className='absolute right-0 mt-2 w-32 origin-top-right divide-y divide-slate-100 dark:divide-slate-700 rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black/5 focus:outline-none z-10'>
              <div className='px-1 py-1'>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(doc.id);
                      }}
                      className={`${
                        active ? 'bg-red-500 text-white' : 'text-red-600'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm gap-2`}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
};

export default function RecentForm() {
  const [searchTerm, setSearchTerm] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('ALL');
  // --- THÊM STATE CHO MODAL ---
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<number | null>(null);

  const projectId = useSelector((state: RootState) => state.project.currentProjectId);

  const {
    data: documents = [],
    isLoading,
    isError,
    refetch,
  } = useGetDocumentsByProjectIdQuery(projectId!, {
    skip: projectId == null,
  });

  const [deleteDocument, { isLoading: isDeleting }] = useDeleteDocumentMutation();

  useEffect(() => {
    if (projectId) refetch();
  }, [projectId, refetch]);

  // --- THAY ĐỔI LUỒNG XỬ LÝ ---

  const handleOpenConfirmModal = (id: number) => {
    setDocToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!docToDelete) return;

    const promise = deleteDocument(docToDelete).unwrap();

    toast.promise(promise, {
      loading: 'Deleting document...',
      success: () => {
        closeModal();

        return 'Document deleted successfully!';
      },
      error: (err) => {
        closeModal();
        return 'Failed to delete document.';
      },
    });
  };

  const closeModal = () => {
    setIsConfirmModalOpen(false);
    setDocToDelete(null);
  };

  // filteredDocuments giữ nguyên
  const filteredDocuments = useMemo(() => {
    return documents
      .filter((doc: any) => {
        if (visibilityFilter === 'ALL') return true;
        return doc.visibility === visibilityFilter;
      })
      .filter((doc: any) => {
        return doc.title.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [documents, searchTerm, visibilityFilter]);

  return (
    <>
      <div className='p-6 bg-slate-50 dark:bg-slate-900 min-h-full'>
        {/* Header và Controls (giữ nguyên) */}
        <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-6'>
          <h1 className='text-2xl font-bold text-slate-900 dark:text-white'>Recent Documents</h1>
          <div className='flex items-center gap-4 mt-4 md:mt-0'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400' />
              <input
                type='text'
                placeholder='Search documents...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 pr-4 py-2 w-48 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
              />
            </div>
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className='py-2 px-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
            >
              <option value='ALL'>All Visibilities</option>
              <option value='MAIN'>Main</option>
              <option value='PRIVATE'>Private</option>
            </select>
          </div>
        </div>

        {/* Grid hoặc thông báo (giữ nguyên) */}
        {isLoading ? (
          <p className='text-center text-slate-500 py-10'>Loading documents...</p>
        ) : isError ? (
          <p className='text-center text-red-500 py-10'>Error loading documents.</p>
        ) : filteredDocuments.length === 0 ? (
          <div className='text-center py-10 px-4 rounded-lg bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700'>
            <h3 className='text-lg font-semibold text-slate-700 dark:text-slate-200'>
              No Documents Found
            </h3>
            <p className='text-sm text-slate-500 dark:text-slate-400 mt-2'>
              No documents match your current filters. Try adjusting your search.
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {filteredDocuments.map((doc: any) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                // --- TRUYỀN HÀM MỞ MODAL VÀO CARD ---
                onDelete={handleOpenConfirmModal}
              />
            ))}
          </div>
        )}
      </div>

      {/* --- RENDER MODAL XÁC NHẬN --- */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={closeModal}
        onConfirm={handleConfirmDelete}
        title='Delete Document'
        message='Are you sure you want to permanently delete this document? This action cannot be undone.'
        confirmButtonText='Delete'
        isLoading={isDeleting}
      />
    </>
  );
}
