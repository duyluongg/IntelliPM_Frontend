import { useNavigate } from 'react-router-dom';
import { FileText, Lock, MoreHorizontal, CheckSquare } from 'lucide-react';
import { useGetMyDocumentsQuery } from '../../../services/Document/documentAPI';
import { useEffect } from 'react';

export default function RecentForm() {
  const navigate = useNavigate();
  const { data: documents = [], isLoading, isError, refetch } = useGetMyDocumentsQuery();
  useEffect(() => {
    refetch();
  }, []);
  if (isLoading) {
    return <p className='text-sm text-gray-500 p-4'>Loading recent forms...</p>;
  }

  if (isError || documents.length === 0) {
    return <p className='text-sm text-gray-500 p-4'>No recent forms found.</p>;
  }

  return (
    <div>
      <h2 className='text-lg font-semibold text-gray-800'>Recent form</h2>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mt-4'>
        {documents.map((doc) => (
          <div
            key={doc.id}
            className='w-full border rounded-lg shadow-sm bg-white p-3 cursor-pointer hover:shadow-md transition'
            onClick={() => navigate(`/project/projects/form/${doc.type.toLowerCase()}/${doc.id}`)}
          >
            <div className='bg-purple-400 h-32 rounded-lg flex items-center justify-center'>
              <FileText size={48} className='text-white' />
            </div>

            <div className='p-2 space-y-2'>
              <h3 className='font-semibold text-gray-800'>{doc.title}</h3>
              <p className='text-xs text-gray-500'>
                Last edited {new Date(doc.updatedAt).toLocaleString()}
              </p>

              <div className='flex items-center justify-between mt-2'>
                <span className='inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200'>
                  <CheckSquare size={12} />
                  {doc.type}
                </span>
                <div className='flex items-center gap-2 text-gray-500'>
                  <Lock size={14} />
                  <MoreHorizontal size={16} className='cursor-pointer' />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
