import React, { useState } from 'react';
import { useGenerateAIContentMutation } from '../../../services/Document/documentAPI';
import { Editor } from '@tiptap/react';
import '../../../pages/PM/YourProject/editor.scss';
// SVG gradient icon
const GradientSparklesIcon = () => (
  <svg
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className='flex-shrink-0'
  >
    <defs>
      <linearGradient id='icon-gradient' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stopColor='#A78BFA' />
        <stop offset='100%' stopColor='#EC4899' />
      </linearGradient>
    </defs>
    <path
      d='M12 2L14.053 7.947L20 10L14.053 12.053L12 18L9.947 12.053L4 10L9.947 7.947L12 2Z'
      fill='url(#icon-gradient)'
    />
    <path
      d='M12 12L12.758 14.5L15 15.258L12.758 16L12 18.5L11.242 16L9 15.258L11.242 14.5L12 12Z'
      fill='url(#icon-gradient)'
      opacity='0.7'
    />
  </svg>
);

interface NewStartWithAIProps {
  documentId: number;
  editor: Editor | null;
  onAfterInsertAI?: (html: string) => void;
}

function stripMarkdownCodeBlock(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/^```html\s*/, '') // bỏ ```html ở đầu
    .replace(/```$/, '') // bỏ ``` ở cuối
    .trim();
}

const NewStartWithAI: React.FC<NewStartWithAIProps> = ({ documentId, editor, onAfterInsertAI }) => {
  const [description, setDescription] = useState('');
  const [generateAIContent, { isLoading }] = useGenerateAIContentMutation();
  const [error, setError] = useState('');

  // const handleGenerate = async () => {
  //   if (!description.trim() || !editor) return;

  //   try {
  //     const response = await generateAIContent({
  //       id: documentId,
  //       prompt: description.trim(),
  //     }).unwrap();
  //     const aiRawContent = response?.content || response;
  //     const aiContent = stripMarkdownCodeBlock(aiRawContent);
  //     console.log(aiContent);

  //     editor.chain().focus().setContent(aiContent).run();

  //     if (onAfterInsertAI) {
  //       onAfterInsertAI(editor.getHTML());
  //     }

  //     setDescription('');
  //     setError('');
  //   } catch (err) {
  //     console.error('AI generate failed:', err);
  //     setError('⚠️ Failed to generate content.');
  //   }
  // };

  const handleGenerate = async () => {
    if (!description.trim() || !editor) return;

    try {
      const res = await generateAIContent({
        id: documentId,
        prompt: description.trim(),
      }).unwrap(); // res: { content: string }

      const aiContent = stripMarkdownCodeBlock(res.content);
      editor.chain().focus().setContent(aiContent).run();

      onAfterInsertAI?.(editor.getHTML());
      setDescription('');
      setError('');
    } catch (err) {
      console.error('AI generate failed:', err);
      setError('⚠️ Failed to generate content.');
    }
  };

  return (
    <div className='mt-6 rounded-xl bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-500 p-px shadow-lg transition-shadow hover:shadow-2xl'>
      <div className='flex items-start gap-4 rounded-[11px] bg-white p-4 dark:bg-slate-900'>
        <GradientSparklesIcon />
        <div className='flex-1'>
          <div className='text-base font-semibold text-slate-800 dark:text-slate-100'>
            Start with AI
          </div>

          <textarea
            className='mt-1 w-full resize-none border-none bg-transparent p-0 text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-slate-300 dark:placeholder:text-slate-500'
            placeholder='Describe the document you want to create'
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
          />

          <div className='mt-2 flex items-center justify-between'>
            {error && <span className='text-xs text-red-500'>{error}</span>}

            <button
              onClick={handleGenerate}
              disabled={isLoading || !description.trim()}
              className='inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewStartWithAI;
