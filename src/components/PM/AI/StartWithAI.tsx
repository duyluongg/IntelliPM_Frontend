import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useGenerateAIContentMutation } from '../../../services/Document/documentAPI';

type Props = {
  docId: number;
  onGenerated?: (content: string) => void;
};

const StartWithAI: React.FC<Props> = ({ docId, onGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [generateAIContent, { isLoading }] = useGenerateAIContentMutation();
  const [isDone, setIsDone] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      const response = await generateAIContent({
        id: docId,
        prompt: prompt.trim(),
      }).unwrap();

      if (onGenerated) onGenerated(response);

      // Bắt đầu hiệu ứng ẩn
      setIsDone(true);

      // Sau 500ms, ẩn luôn component nếu muốn (option)
      // setTimeout(() => setVisible(false), 500);
    } catch (err) {
      console.error('AI generate failed:', err);
    }
  };

  return (
    <div
      className={`max-w-2xl mx-auto p-6 transition-all duration-500 ${
        isDone ? 'opacity-0 translate-y-12 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div
        className={`bg-gradient-to-r from-orange-50 to-purple-50 border border-orange-200 rounded-xl p-6 shadow-sm relative transition-all duration-300 ${
          isLoading ? 'opacity-60' : 'opacity-100'
        }`}
      >
        {isLoading && (
          <div className='absolute inset-0 bg-white/30 backdrop-blur-[2px] rounded-xl flex items-center justify-center animate-pulse'>
            <div className='flex items-center gap-3 text-gray-600'>
              <div className='animate-spin'>
                <Sparkles className='w-5 h-5 text-orange-500' />
              </div>
              <span className='text-sm font-medium'>Generating AI content...</span>
            </div>
          </div>
        )}

        <div className='flex items-center gap-3 mb-4'>
          <div className='flex items-center justify-center w-8 h-8 bg-gradient-to-r from-orange-400 to-purple-400 rounded-lg'>
            <Sparkles className='w-5 h-5 text-white' />
          </div>
          <h2 className='text-lg font-semibold text-gray-800'>Start with AI</h2>
        </div>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <label className='text-sm font-medium text-gray-700'>
              Describe the document you want to create
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              className='w-full min-h-[100px] p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-gray-600 placeholder-gray-400 disabled:cursor-not-allowed'
              placeholder='Enter your description here...'
            />
          </div>

          <div className='flex justify-end'>
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className='inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-purple-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <Sparkles className='w-4 h-4' />
              {isLoading ? 'Generating...' : 'Generate AI'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartWithAI;
