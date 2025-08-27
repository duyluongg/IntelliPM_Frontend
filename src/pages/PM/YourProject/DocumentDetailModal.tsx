import React, { useEffect } from 'react';

interface Document {
  id: number;
  title: string;
  content: string; // Thêm 'content' vì component này sử dụng nó
  createdBy: number;
  createdAt: string;
}

interface DocumentDetailModalProps {
  doc: Document;
  onClose: () => void; // onClose là một hàm không nhận tham số và không trả về gì
}

export default function DocumentDetailModal({ doc, onClose }: DocumentDetailModalProps) {
  // Xử lý đóng modal khi nhấn phím Escape
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Ngăn việc click vào nội dung modal làm đóng modal
  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fade-in'
      onClick={onClose} // Đóng modal khi click vào nền mờ
    >
      <div
        className='bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col'
        onClick={handleModalContentClick}
      >
        {/* Header của Modal */}
        <div className='flex justify-between items-center p-5 border-b border-slate-200'>
          <h2 className='text-xl font-bold text-slate-800'>{doc.title}</h2>
          <button onClick={onClose} className='text-slate-500 hover:text-slate-800'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* Nội dung chi tiết */}
        <div className='p-6 overflow-y-auto'>
          <div
            className='prose prose-slate max-w-none'
            dangerouslySetInnerHTML={{ __html: doc.content }}
          />
        </div>
      </div>
    </div>
  );
}
