import { Sparkles, X, RotateCcw, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useAskAIMutation } from '../../../services/Document/documentAPI';
import type { Editor } from '@tiptap/react';
import SimpleEditor from '../RichTextEditor/SimpleEditor';

type Props = {
  editor: Editor;
  onClose: () => void;
};

export default function WriteWithAIModal({ editor, onClose }: Props) {
  const [prompt, setPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [mode, setMode] = useState<'prompt' | 'result'>('prompt');

  const [askAi, { isLoading }] = useAskAIMutation();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      const result = await askAi(prompt).unwrap();
      setAiResponse(result.content);
      setMode('result');
    } catch (error) {
      console.error('❌ Error calling ask-ai:', error);
    }
  };

  const handleInsert = () => {
    if (!aiResponse.trim()) return;
    editor.chain().focus().insertContent(`<p>${aiResponse}</p>`).run();
    setPrompt('');
    setAiResponse('');
    setMode('prompt');
    onClose();
  };

  const handleBack = () => {
    setMode('prompt');
    setAiResponse('');
  };

  const handleSuggestion = (text: string) => {
    setPrompt(text);
    setAiResponse('');
    setMode('prompt');
  };

  return (
    <div className='absolute top-full mt-2 right-0 w-[420px] z-50'>
      <div className='bg-white rounded-xl shadow-xl p-4 border'>
        <div className='flex items-center justify-between pb-2 border-b'>
          <div className='flex items-center gap-2 text-gray-700 font-semibold text-sm'>
            <Sparkles className='w-4 h-4 text-purple-500' />
            Write with AI
          </div>
          <button onClick={onClose} className='text-gray-500 hover:text-gray-700'>
            <X className='w-4 h-4' />
          </button>
        </div>

        {mode === 'prompt' ? (
          <>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className='w-full mt-3 h-32 p-3 border border-gray-200 rounded-lg resize-none text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300'
              placeholder='Write me something like: "Give me steps to write a project plan"'
              disabled={isLoading}
            />

            <div className='flex gap-2 mt-3 flex-wrap'>
              <button
                onClick={() => handleSuggestion('Steps to achieve project success')}
                className='px-3 py-1 bg-gray-100 text-sm rounded-lg hover:bg-gray-200'
              >
                Steps to achieve...
              </button>
              <button
                onClick={() => handleSuggestion('Pros and cons of using AI in project management')}
                className='px-3 py-1 bg-gray-100 text-sm rounded-lg hover:bg-gray-200'
              >
                Pros and cons of...
              </button>
            </div>
          </>
        ) : (
          <>
            <div className='mt-3'>
              <SimpleEditor content={aiResponse} onChange={(html) => setAiResponse(html)} />
            </div>
          </>
        )}

        {/* Action buttons */}
        <div className='flex justify-between items-center gap-3 mt-4'>
          {mode === 'prompt' ? (
            <button
              className='flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800'
              onClick={() => {
                setPrompt('');
                setAiResponse('');
              }}
              disabled={isLoading}
            >
              <RotateCcw className='w-4 h-4' />
              Cancel
            </button>
          ) : (
            <button
              onClick={handleBack}
              className='flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800'
            >
              <ArrowLeft className='w-4 h-4' />
              Back
            </button>
          )}

          {mode === 'result' ? (
            <button
              onClick={handleInsert}
              className='px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600'
            >
              Insert to Editor
            </button>
          ) : (
            <button
              disabled={!prompt.trim() || isLoading}
              onClick={handleGenerate}
              className='px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed'
            >
              {isLoading ? 'Generating...' : 'Generate'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
