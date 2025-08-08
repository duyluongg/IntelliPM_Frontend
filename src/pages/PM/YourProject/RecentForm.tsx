import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, Lock, MoreHorizontal, CheckSquare, Trash2 } from 'lucide-react';
import {
  useGetDocumentsByProjectIdQuery,
  useDeleteDocumentMutation,
} from '../../../services/Document/documentAPI';
import { useEffect, useState } from 'react';
import type { RootState } from '../../../app/store';
import { useSelector } from 'react-redux';

export default function RecentForm() {
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const navigate = useNavigate();
  const projectId = useSelector((state: RootState) => state.project.currentProjectId);

  const {
    data: documents = [],
    isLoading,
    isError,
    refetch,
  } = useGetDocumentsByProjectIdQuery(projectId!, {
    skip: projectId == null, // nếu null thì skip gọi API
  });

  console.log(documents, 'RecentForm documents');

  const [deleteDocument] = useDeleteDocumentMutation();
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey');

  useEffect(() => {
    if (projectId) {
      refetch();
    }
  }, [projectId, refetch]);

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?');
    if (!confirmed) return;

    try {
      await deleteDocument(id).unwrap();
      alert('Xóa thành công');
      refetch(); // refresh lại danh sách
    } catch (err) {
      alert('Xóa thất bại');
    }
  };

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
            className='relative w-full border rounded-lg shadow-sm bg-white p-3 hover:shadow-md transition'
          >
            {/* Click để mở form */}
            <div
              className='cursor-pointer'
              onClick={() => navigate(`/project/projects/form/document/${doc.id}`)}
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
                    <div className='relative'>
                      <MoreHorizontal
                        size={16}
                        className='cursor-pointer'
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === doc.id ? null : doc.id);
                        }}
                      />

                      {/* Dropdown menu */}
                      {activeMenuId === doc.id && (
                        <div className='absolute right-0 mt-1 w-28 bg-white border rounded-md shadow z-50'>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(doc.id);
                              setActiveMenuId(null);
                            }}
                            className='w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-red-100 text-red-600'
                          >
                            <Trash2 size={14} /> Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
