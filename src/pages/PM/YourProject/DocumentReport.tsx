import React, { useState, useMemo } from 'react';
import { useGetDocumentsSharedToMeInProjectQuery } from '../../../services/Document/documentAPI';
import { useSearchParams } from 'react-router-dom';
import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
import { skipToken } from '@reduxjs/toolkit/query';

// Import các component mới
import DocumentDetailModal from './DocumentDetailModal';
import DocumentCard from './DocumentCard';
import SearchInput from './SearchInput';
import Pagination from './Pagination';

interface Document {
  id: number;
  title: string;
  content: string;
  createdBy: number;
  createdAt: string;
}

const ITEMS_PER_PAGE = 8;

export default function DocumentReport() {
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';
  const { data: projectDetails } = useGetProjectDetailsByKeyQuery(projectKey);
  const projectId = projectDetails?.data?.id;

  const { data, isLoading, error } = useGetDocumentsSharedToMeInProjectQuery(
    projectId ? projectId : skipToken
  );

  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredDocuments = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter((doc) => doc.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [data?.data, searchTerm]);

  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);

  // --- HANDLERS ---
  const handleViewDocument = (doc: Document) => setSelectedDoc(doc);
  const handleCloseModal = () => setSelectedDoc(null);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return <div className='p-6'>Loading...</div>;
  }

  if (error || !data?.isSuccess) {
    return <div className='p-6'>Error loading documents.</div>;
  }

  return (
    <div className=' min-h-screen p-4 sm:p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header: Title và ô tìm kiếm */}
        <div className='flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-4 mb-6'>
          <SearchInput
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder='Search by title...'
          />
        </div>

        {filteredDocuments.length > 0 ? (
          <>
            <ul className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {paginatedDocuments.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </ul>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        ) : (
          <p className='text-center text-slate-500 py-10'>
            {searchTerm
              ? `No documents found matching "${searchTerm}".`
              : 'No documents shared with you in this project.'}
          </p>
        )}
      </div>

      {selectedDoc && <DocumentDetailModal doc={selectedDoc} onClose={handleCloseModal} />}
    </div>
  );
}
