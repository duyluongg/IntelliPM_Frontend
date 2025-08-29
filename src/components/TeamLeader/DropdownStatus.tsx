// import { useState } from 'react';
// import {
//   //   Link,
//   FileText,
//   Calendar,
//   User,
//   Tag,
//   Filter,
//   CheckCircle,
//   XCircle,
//   Clock,
//   Search,
//   Grid,
//   List,
//   Eye,
//   //   Download,
// } from 'lucide-react';
// import {
//   useApproveDocumentMutation,
//   useDocumentStatusQuery,
// } from '../../services/Document/documentAPI';
// import type { DocumentType } from '../../types/DocumentType';
// import { useSelector } from 'react-redux';
// import type { RootState } from '../../app/store';

// type DocProps = {
//   doc: DocumentType;
// };

// const STATUS_OPTIONS = [
//   { label: 'Tất cả', value: '', color: 'bg-gray-100 text-gray-800' },
//   { label: 'Chờ duyệt', value: 'PendingApproval', color: 'bg-amber-100 text-amber-800' },
//   { label: 'Đã duyệt', value: 'Approved', color: 'bg-green-100 text-green-800' },
//   { label: 'Đã từ chối', value: 'REJECTED', color: 'bg-red-100 text-red-800' },
// ];

// const formatDate = (date: string | number | Date): string => {
//   return new Date(date).toLocaleString('vi-VN', {
//     year: 'numeric',
//     month: '2-digit',
//     day: '2-digit',
//     hour: '2-digit',
//     minute: '2-digit',
//   });
// };

// const getStatusInfo = (status: string) => {
//   const statusMap = {
//     PendingApproval: {
//       label: 'Chờ duyệt',
//       color: 'bg-amber-100 text-amber-800 border-amber-200',
//       icon: Clock,
//     },
//     Approved: {
//       label: 'Đã duyệt',
//       color: 'bg-green-100 text-green-800 border-green-200',
//       icon: CheckCircle,
//     },
//     REJECTED: {
//       label: 'Đã từ chối',
//       color: 'bg-red-100 text-red-800 border-red-200',
//       icon: XCircle,
//     },
//   };

//   if (status in statusMap) {
//     return statusMap[status as keyof typeof statusMap];
//   }

//   return {
//     label: status,
//     color: 'bg-gray-100 text-gray-800',
//     icon: Clock,
//   };
// };

// export default function DropdownStatus() {
//   const [status, setStatus] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [viewMode, setViewMode] = useState('grid');

//   const projectId = useSelector((state: RootState) => state.project.currentProjectId);

//   const {
//     data: documents = [],
//     isLoading,
//     error,
//     refetch,
//   } = useDocumentStatusQuery({
//     projectId: projectId ?? 0,
//     status,
//   });
//   const [approveDocument] = useApproveDocumentMutation();

//   const filteredDocuments = documents.filter((doc) => {
//     const matchesSearch =
//       doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       doc.content.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesSearch;
//   });

//   const handleApprove = async (documentId: number) => {
//     try {
//       await approveDocument({
//         documentId,
//         status: 'Approved',
//         comment: 'Tài liệu đã được phê duyệt',
//       }).unwrap();
//       refetch();
//     } catch (err) {
//       console.error('Lỗi khi phê duyệt:', err);
//       alert('❌ Lỗi khi phê duyệt');
//     }
//   };

//   const handleReject = async (documentId: number) => {
//     try {
//       await approveDocument({
//         documentId,
//         status: 'REJECTED',
//         comment: 'Tài liệu không được phê duyệt',
//       }).unwrap();
//       refetch();
//     } catch (err) {
//       console.error('Lỗi khi từ chối:', err);
//       alert('❌ Lỗi khi từ chối');
//     }
//   };

//   const DocumentCard = ({ doc }: DocProps) => {
//     const statusInfo = getStatusInfo(doc.status);
//     const StatusIcon = statusInfo.icon;

//     return (
//       <div className='bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1'>
//         <div className='p-6'>
//           <div className='flex items-start justify-between mb-4'>
//             <div className='flex-1'>
//               <h3 className='text-xl font-bold text-gray-900 mb-2 leading-tight'>{doc.title}</h3>
//               <div className='flex items-center gap-2 mb-3'>
//                 <span
//                   className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}
//                 >
//                   <StatusIcon className='w-3 h-3' />
//                   {statusInfo.label}
//                 </span>
//                 <span className='inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-blue-50 text-blue-700 border border-blue-200'>
//                   <Tag className='w-3 h-3' />
//                   {doc.type}
//                 </span>
//               </div>
//             </div>
//             <div className='flex items-center gap-2'>
//               <button
//                 // onClick={() => openModal(doc)}
//                 className='p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
//                 title='Xem chi tiết'
//               >
//                 <Eye className='w-5 h-5' />
//               </button>
//               {/* {doc.fileUrl && (
//                 <a
//                   href={doc.fileUrl}
//                   className='p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors'
//                   title='Tải file'
//                 >
//                   <Download className='w-5 h-5' />
//                 </a>
//               )} */}
//             </div>
//           </div>

//           <div className='mb-4'>
//             <p className='text-gray-600 text-sm line-clamp-3 leading-relaxed'>{doc.content}</p>
//           </div>

//           <div className='grid grid-cols-2 gap-3 mb-4 text-xs'>
//             <div className='flex items-center gap-2 text-gray-500'>
//               <FileText className='w-4 h-4' />
//               <span>ID: {doc.id}</span>
//             </div>
//             <div className='flex items-center gap-2 text-gray-500'>
//               <Tag className='w-4 h-4' />
//               <span>Project: {doc.projectId}</span>
//             </div>
//             <div className='flex items-center gap-2 text-gray-500'>
//               <User className='w-4 h-4' />
//               <span>Tạo bởi: User {doc.createdBy}</span>
//             </div>
//             <div className='flex items-center gap-2 text-gray-500'>
//               <Calendar className='w-4 h-4' />
//               <span>{formatDate(doc.createdAt)}</span>
//             </div>
//           </div>

//           <div className='pt-4 border-t border-gray-100'>
//             <div className='flex items-center justify-between'>
//               <div className='flex items-center gap-2'>
//                 <div
//                   className={`w-2 h-2 rounded-full ${
//                     doc.isActive ? 'bg-green-500' : 'bg-gray-400'
//                   }`}
//                 ></div>
//                 <span className='text-xs text-gray-500'>
//                   {doc.isActive ? 'Hoạt động' : 'Không hoạt động'}
//                 </span>
//               </div>
//               <div className='text-xs text-gray-400'>Template: {doc.template}</div>
//             </div>
//           </div>
//           {status === 'PendingApproval' && (
//             <div className='space-x-2 mt-4 flex justify-end'>
//               <button
//                 onClick={() => handleApprove(doc.id)}
//                 className='bg-green-400 text-white p-2 rounded-md'
//               >
//                 {' '}
//                 Accept
//               </button>
//               <button
//                 onClick={() => handleReject(doc.id)}
//                 className='bg-red-400 text-white p-2 rounded-md'
//               >
//                 {' '}
//                 Reject
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50'>
//       <div className='max-w-7xl mx-auto px-4 py-8'>
//         <div className='mb-8'>
//           <div className='flex items-center justify-between mb-4'>
//             <div>
//               <h1 className='text-3xl font-bold text-gray-900 mb-2'>Quản lý tài liệu</h1>
//               <p className='text-gray-600'>Xem và quản lý trạng thái các tài liệu trong hệ thống</p>
//             </div>
//             <div className='flex items-center gap-2'>
//               <button
//                 onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
//                 className='p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors'
//               >
//                 {viewMode === 'grid' ? <List className='w-5 h-5' /> : <Grid className='w-5 h-5' />}
//               </button>
//             </div>
//           </div>

//           <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
//             <div className='flex flex-col sm:flex-row gap-4'>
//               <div className='flex-1 relative'>
//                 <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
//                 <input
//                   type='text'
//                   placeholder='Tìm kiếm theo tên, loại, nội dung...'
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
//                 />
//               </div>

//               <div className='flex items-center gap-2'>
//                 <Filter className='w-5 h-5 text-gray-400' />
//                 <select
//                   value={status}
//                   onChange={(e) => setStatus(e.target.value)}
//                   className='px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
//                 >
//                   {STATUS_OPTIONS.map((opt) => (
//                     <option key={opt.value} value={opt.value}>
//                       {opt.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>
//         </div>

//         {isLoading && (
//           <div className='text-center py-12'>
//             <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
//             <p className='text-gray-500 mt-4'>Đang tải dữ liệu...</p>
//           </div>
//         )}

//         {error && (
//           <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-center'>
//             <p className='text-red-600'>Lỗi tải dữ liệu. Vui lòng thử lại.</p>
//           </div>
//         )}

//         {!isLoading && !error && (
//           <div
//             className={`grid gap-6 ${
//               viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
//             }`}
//           >
//             {filteredDocuments.map((doc) => (
//               <DocumentCard key={doc.id} doc={doc} />
//             ))}
//           </div>
//         )}

//         {!isLoading && !error && filteredDocuments.length === 0 && (
//           <div className='text-center py-12'>
//             <FileText className='w-12 h-12 text-gray-400 mx-auto mb-4' />
//             <p className='text-gray-500'>Không tìm thấy tài liệu nào phù hợp.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
import React from 'react'

export default function DropdownStatus() {
  return (
    <div>DropdownStatus</div>
  )
}
