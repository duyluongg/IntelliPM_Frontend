import React from 'react';
import { useNavigate } from 'react-router-dom';

const getUserNameById = (id: number) => `${id}`;

interface Document {
  id: number;
  title: string;
  content: string;
  createdBy: number;
  createdAt: string;
}

interface DocumentCardProps {
  doc: Document;
}

export default function DocumentCard({ doc }: DocumentCardProps) {
  const navigate = useNavigate();

  const formattedDate = new Date(doc.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

   const handleView = () => {
    navigate(`/project/projects/form/document/${doc.id}`);
  };

  return (
    <li className='bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col'>
      <div className='p-5 flex-grow'>
        <div className='text-blue-500 mb-3'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-8 w-8'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={2}
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
            />
          </svg>
        </div>
        <h3 className='text-lg font-bold text-slate-800 mb-2 truncate' title={doc.title}>
          {doc.title}
        </h3>
        <p className='text-sm text-slate-500'>
          Created by: <strong>{getUserNameById(doc.createdBy)}</strong>
        </p>
        <p className='text-sm text-slate-500'>Date: {formattedDate}</p>
      </div>
      <div className='bg-slate-50 p-4 border-t border-slate-200 rounded-b-lg'>
        <button
          onClick={handleView}
          className='w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300'
        >
          View Details
        </button>
      </div>
    </li>
  );
}
