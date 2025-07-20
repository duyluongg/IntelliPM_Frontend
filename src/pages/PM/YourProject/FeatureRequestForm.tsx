// import { useEffect, useState } from 'react';
// import { Lock, Share2, Expand, MoreHorizontal, Check, GripVertical, ArrowLeft } from 'lucide-react';
// import axios from 'axios';
// import { useAuth } from '../../../services/AuthContext';
// import type { DocumentType } from '../../../types/DocumentType';
// // import { useNavigate } from 'react-router-dom';

// type FeatureRequestFormProps = {
//   doc: DocumentType;
//   onBack: () => void;
// };

// const FeatureRequestForm = ({ doc, onBack }: FeatureRequestFormProps) => {
//   const isNewForm = !doc?.id;
//   const isEditMode = !!doc?.id;

//   const [formData, setFormData] = useState({
//     summary: '',
//     description: '',
//   });

//   const [editingSummary, setEditingSummary] = useState(false);
//   const [editingDescription, setEditingDescription] = useState(false);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };
//   const { user } = useAuth();

//   const handleSubmit = async () => {
//     if (!user) {
//       alert('Bạn chưa đăng nhập!');
//       return;
//     }

//     const payload = {
//       projectId: 1,
//       taskId:  'PROJA-3',
//       title: formData.summary,
//       type: 'FEATURE_REQUEST',
//       template: 'default',
//       content: formData.description,
//       fileUrl: '',
//       createdBy: user.id,
//       ...(isEditMode && { updatedBy: user.id }),
//     };

//     try {
//       if (isEditMode) {
//         // GỌI API SỬA
//         await axios.put(`https://localhost:7128/api/documents/${doc.id}`, payload, {
//           headers: {
//             Authorization: `Bearer ${user.accessToken}`,
//           },
//         });
//         alert('Document updated successfully!');
//       } else {
//         // GỌI API TẠO MỚI
//         await axios.post('https://localhost:7128/api/documents', payload, {
//           headers: {
//             Authorization: `Bearer ${user.accessToken}`,
//           },
//         });
//         alert('Document created successfully!');
//       }
//     } catch (err) {
//       console.error('Error submitting document:', err);
//       alert('Something went wrong. Please try again.');
//     }
//   };

//   useEffect(() => {
//     if (doc) {
//       setFormData({
//         summary: doc.title || '',
//         description: doc.content || '',
//       });
//     }
//   }, [doc]);

//   return (
//     <div className='max-w-4xl mx-auto p-6 space-y-6'>
//       <button
//         onClick={onBack}
//         className='inline-flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition'
//       >
//         <ArrowLeft size={16} /> Back
//       </button>

//       <div className='border rounded-md shadow-sm bg-white'>
//         <div className='h-2 rounded-t bg-red-400' />

//         <div className='p-6 flex justify-between items-start'>
//           <div>
//             <div className='flex items-center gap-2 text-sm mb-1'>
//               <span className='flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded border border-blue-300'>
//                 <input type='checkbox' checked readOnly className='accent-blue-500' />
//                 Story
//               </span>
//               <span className='flex items-center text-green-600 gap-1'>
//                 <Check size={16} /> All changes saved
//               </span>
//             </div>
//             <h1 className='text-2xl font-semibold'>Feature request</h1>
//             <p className='text-gray-600 text-sm'>
//               Use this form to request new features or changes. Include the feature's purpose,
//               benefits, and any impact on current workflows.
//             </p>
//           </div>

//           <div className='flex items-center gap-2'>
//             <button className='p-2 border rounded hover:bg-gray-100'>
//               <Lock size={18} />
//             </button>
//             <button className='p-2 border rounded hover:bg-gray-100'>
//               <Share2 size={18} />
//             </button>
//             <button className='p-2 border rounded hover:bg-gray-100'>
//               <Expand size={18} />
//             </button>
//             <button className='p-2 border rounded hover:bg-gray-100'>
//               <MoreHorizontal size={18} />
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className='space-y-4 '>
//         <div className='border rounded p-4 bg-white'>
//           <div className='flex items-start gap-2'>
//             <GripVertical className='mt-1 text-gray-400' size={18} />
//             <div className='flex-1'>
//               <h2 className='font-semibold mb-1'>
//                 Feature Title &middot; <span className='text-gray-400'>Summary*</span>
//               </h2>
//               {!editingSummary ? (
//                 <p
//                   className='text-sm text-gray-500 mb-2 cursor-pointer hover:bg-gray-200 transition-colors'
//                   onClick={() => setEditingSummary(true)}
//                 >
//                   {isNewForm
//                     ? 'Enter the name of the feature.'
//                     : formData.summary || 'No summary provided'}
//                 </p>
//               ) : (
//                 <input
//                   type='text'
//                   name='summary'
//                   value={formData.summary}
//                   onChange={handleChange}
//                   className='w-full border rounded px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring focus:ring-blue-200 mb-2'
//                   placeholder='Enter the name of the feature.'
//                   onBlur={() => setEditingSummary(false)}
//                   autoFocus
//                 />
//               )}

//               <input
//                 type='text'
//                 name='summary'
//                 // value={formData.summary}
//                 onChange={handleChange}
//                 className='w-full border rounded px-3 py-2 text-sm bg-gray-200 text-gray-500  cursor-not-allowed'
//                 placeholder='Answer will be written here'
//                 onBlur={() => setEditingSummary(false)}
//                 autoFocus
//               />
//             </div>
//           </div>
//         </div>

//         <div className='border rounded p-4 bg-white'>
//           <div className='flex items-start gap-2'>
//             <GripVertical className='mt-1 text-gray-400' size={18} />
//             <div className='flex-1'>
//               <h2 className='font-semibold mb-1'>
//                 Feature Title &middot; <span className='text-gray-400'>Description*</span>
//               </h2>
//               {!editingDescription ? (
//                 <p
//                   className='text-sm text-gray-500 mb-2 cursor-pointer hover:bg-gray-200 transition-colors'
//                   onClick={() => setEditingDescription(true)}
//                 >
//                   {isNewForm
//                     ? 'Enter the description of the feature.'
//                     : formData.description || 'No description provided'}
//                 </p>
//               ) : (
//                 <textarea
//                   name='description'
//                   value={formData.description}
//                   onChange={handleChange}
//                   rows={5}
//                   className='w-full border rounded px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring focus:ring-blue-200 mb-2'
//                   placeholder='Enter the description of the feature.'
//                   onBlur={() => setEditingDescription(false)}
//                   autoFocus
//                 />
//               )}

//               <textarea
//                 name='description'
//                 // value={formData.description}
//                 onChange={handleChange}
//                 rows={5}
//                 className='w-full border rounded px-3 py-2 text-sm bg-gray-200 text-gray-500  cursor-not-allowed'
//                 placeholder='Answer will be written here'
//                 disabled
//               ></textarea>
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className='text-right'>
//         <button
//           onClick={handleSubmit}
//           className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition'
//         >
//           {isEditMode ? 'Update' : 'Submit'}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default FeatureRequestForm;

import { useSearchParams } from 'react-router-dom';
import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
import { useCreateDocumentRequestMutation } from '../../../services/Document/documentAPI';
import { useState } from 'react';
import { Check, CheckSquare, Loader2, Send } from 'lucide-react';

export default function FeatureRequestForm() {
  
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') ?? '';
  const { data: projectDetails } = useGetProjectDetailsByKeyQuery(projectKey);
  const projectId = projectDetails?.data?.id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);

  const [createDocument] = useCreateDocumentRequestMutation();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!projectId) {
      return;
    }
      setIsSubmitting(true);
    try {
      await createDocument({
        projectId,
        taskId: undefined,
        epicId: undefined,
        subTaskId: undefined,
        title: title || 'New Feature Request',
        type: 'FEATURE_REQUEST',
        template: 'FEATURE_REQUEST',
        content: description || '',
      }).unwrap();
    } catch (error) {
      console.error('❌ Tạo tài liệu thất bại:', error);
    }finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='max-w-4xl mx-auto my-8'>
      <div className='h-1 bg-yellow-400 rounded-t-md' />

      <div className='bg-white border border-gray-200 rounded-b-md shadow '>
        {/* Header */}
        <div className='flex items-start justify-between p-5 border-b'>
          <div className='space-y-2'>
            <div className='flex items-center gap-3 text-sm'>
              <span className='flex items-center gap-1 px-2 py-[2px] border border-blue-500 bg-blue-50 text-blue-600 rounded'>
                <CheckSquare className='w-4 h-4' />
                Story
              </span>
              <span className='flex items-center text-green-600 gap-1'>
                <Check size={16} /> All changes saved
              </span>
            </div>
            <h1 className='text-xl font-semibold'>Feature request</h1>
            <p className='text-sm text-gray-600'>
              Use this form to request new features or changes. Include the feature's purpose,
              benefits, and any impact on current workflows.
            </p>
          </div>
        </div>

        <div className='border-t px-6 py-5 bg-white'>
          <div className='text-sm font-semibold mb-1'>
            Feature Title · <span className='text-gray-500'>Title*</span>
          </div>
          {!editingTitle ? (
            <p
              className='text-sm text-gray-500 mb-2 bg-gray-50 p-2 rounded cursor-pointer hover:bg-gray-100'
              onClick={() => setEditingTitle(true)}
            >
              {title ? title : 'Enter the name of the feature.'}
            </p>
          ) : (
            <input
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              autoFocus
              className='w-full border rounded-md px-3 py-2 text-sm bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none'
              placeholder='Enter the name of the feature.'
            />
          )}
          <input
            type='text'
            placeholder='Answer will be written here'
            // value={title}
            readOnly
            className='w-full border rounded-md px-3 py-2 text-sm bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none cursor-default'
          />
        </div>

        <div className='border-t px-6 py-5 bg-white'>
          <div className='text-sm font-semibold mb-1'>
            Description · <span className='text-gray-500'>Description*</span>
          </div>
          {!editingDescription ? (
            <p
              className='text-sm text-gray-500 mb-2 bg-gray-50 p-2 rounded cursor-pointer hover:bg-gray-100'
              onClick={() => setEditingDescription(true)}
            >
              {description ? description : 'Enter the description of the feature.'}
            </p>
          ) : (
            <input
              type='text'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => setEditingDescription(false)}
              autoFocus
              className='w-full border rounded-md px-3 py-2 text-sm bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none'
              placeholder='Enter the name of the feature.'
            />
          )}
          <input
            type='text'
            placeholder='Answer will be written here'
            // value={descriiption}
            onChange={(e) => setDescription(e.target.value)}
            className='w-full border rounded-md px-3 py-2 text-sm bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none cursor-default'
          />
        </div>
      </div>

      <div className='text-right mt-6'>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`inline-flex items-center gap-2 px-5 py-2 rounded-md text-white font-medium transition
      ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
    `}
        >
          {isSubmitting ? (
            <>
              <Loader2 className='animate-spin w-4 h-4' />
              Loading...
            </>
          ) : (
            <>
              <Send className='w-4 h-4' />
              Send Request
            </>
          )}
        </button>
      </div>
    </div>
  );
}
