// import React, { useState } from 'react';
// import { Sparkles } from 'lucide-react';
// import { useGenerateAIContentMutation } from '../../../services/Document/documentAPI';

// type Props = {
//   docId: number;
//   onGenerated?: (content: string) => void;
// };

// const StartWithAI: React.FC<Props> = ({ docId, onGenerated }) => {
//   const [prompt, setPrompt] = useState('');
//   const [generateAIContent, { isLoading }] = useGenerateAIContentMutation();
//   const [isDone, setIsDone] = useState(false);

//   const handleGenerate = async () => {
//     if (!prompt.trim()) return;

//     try {
//       const response = await generateAIContent({
//         id: docId,
//         prompt: prompt.trim(),
//       }).unwrap();

//       if (onGenerated) onGenerated(response);

//       // Bắt đầu hiệu ứng ẩn
//       setIsDone(true);

//       // Sau 500ms, ẩn luôn component nếu muốn (option)
//       // setTimeout(() => setVisible(false), 500);
//     } catch (err) {
//       console.error('AI generate failed:', err);
//     }
//   };

//   return (
//     <div
//       className={`mx-auto px-2 py-2 max-w-md transition-all duration-500 ${
//         isDone ? 'opacity-0 translate-y-12 pointer-events-none' : 'opacity-100'
//       }`}
//     >
//       <div
//         className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm relative transition-all duration-300 ${
//           isLoading ? 'opacity-60' : 'opacity-100'
//         }`}
//       >
//         {isLoading && (
//           <div className='absolute inset-0 bg-white/30 backdrop-blur-sm rounded-lg flex items-center justify-center animate-pulse'>
//             <div className='flex items-center gap-2 text-gray-600 text-xs'>
//               <div className='animate-spin'>
//                 <Sparkles className='w-4 h-4 text-blue-500' />
//               </div>
//               <span className='font-medium'>Generating AI content...</span>
//             </div>
//           </div>
//         )}

//         <div className='flex items-center gap-2 mb-3'>
//           <div className='flex items-center justify-center w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-md'>
//             <Sparkles className='w-4 h-4 text-white' />
//           </div>
//           <h2 className='text-sm font-semibold text-gray-800'>Start with AI</h2>
//         </div>

//         <div className='space-y-3'>
//           <div className='space-y-1'>
//             <label className='text-xs font-medium text-gray-700'>Describe the document</label>
//             <textarea
//               value={prompt}
//               onChange={(e) => setPrompt(e.target.value)}
//               disabled={isLoading}
//               className='w-full min-h-[80px] p-2 border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-blue-300 text-xs placeholder-gray-400 disabled:cursor-not-allowed'
//               placeholder='e.g. Weekly meeting summary...'
//             />
//           </div>

//           <div className='flex justify-end'>
//             <button
//               onClick={handleGenerate}
//               disabled={isLoading || !prompt.trim()}
//               className='inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
//             >
//               <Sparkles className='w-3.5 h-3.5' />
//               {isLoading ? 'Generating...' : 'Generate'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StartWithAI;
import React from 'react'

export default function StartWithAI() {
  return (
    <div>StartWithAI</div>
  )
}
