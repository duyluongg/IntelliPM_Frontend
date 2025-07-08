import { useState } from 'react';
import Lottie from 'lottie-react';
import AI_Icon from '../../../src/assets/AnimationIcon/AI_Icon.json';
import { useAuth } from '../../services/AuthContext';
import axios from 'axios';
import type { Editor } from '@tiptap/react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';

export default function DropdownAI({
  editor,
  onGenerate,
}: {
  editor: Editor;
  onGenerate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [openSummary, setOpenSummary] = useState(false);
  const { user } = useAuth();
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryResult, setSummaryResult] = useState('');
  const [saving, setSaving] = useState(false);
  const docId = useSelector((state: RootState) => state.doc.id);
  const [openPrompt, setOpenPrompt] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);

  const handleAddToDoc = async () => {
    if (!user || !docId || !summaryResult) return;

    setSaving(true);
    try {
      // Lấy document hiện tại
      const docRes = await axios.get(`https://localhost:7128/api/documents/${docId}/summary`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });

      const doc = docRes.data;

      const updatedDoc = {
        ...doc,
        content: doc.content + '\n\n' + summaryResult,
        updatedBy: user.id,
      };

      await axios.put(`https://localhost:7128/api/documents/${docId}`, updatedDoc, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      alert('Summary added and document saved!');
      setOpenSummary(false);

      editor.commands.setContent(doc.content + '<p>' + summaryResult + '</p>');
    } catch (err) {
      console.error('Failed to save document:', err);
      alert('Failed to add summary to document.');
    } finally {
      setSaving(false);
    }
  };

  const handleSummarize = async () => {
    if (!user || !docId) return;

    setLoadingSummary(true);
    setOpenSummary(true);
    try {
      const res = await axios.get(
        `https://localhost:7128/api/documents/${docId}/summary`,

        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        }
      );
      setSummaryResult(res.data?.summary || 'No summary available.');
    } catch (err) {
      console.error('Failed to summarize document:', err);
      setSummaryResult('Failed to summarize document.');
    } finally {
      setLoadingSummary(false);
    }
  };

  const generateWithAI = async () => {
    if (!user || typeof promptText !== 'string' || !promptText.trim()) return;

    try {
      setLoadingAI(true);
      setOriginalPrompt(promptText);
      const res = await axios.post(
        `https://localhost:7128/api/documents/ask-ai`,
        JSON.stringify(promptText),
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const content = res.data?.content || res.data;

      if (typeof content === 'string') {
        setPromptText(content);
        setIsAIGenerated(true);
      } else {
        alert('⚠️ AI không trả về nội dung.');
      }
    } catch (err) {
      console.error('❌ AI request failed:', err);
      alert('❌ Failed to generate AI content.');
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className='relative inline-block text-left'>
      <button
        onClick={() => setOpen(!open)}
        className='flex items-center gap-2 bg-blue-400 text-white px-3 py-1 rounded hover:bg-blue-500 transition text-sm'
      >
        <Lottie animationData={AI_Icon} loop autoplay style={{ width: 20, height: 20 }} />
        AI Assistant
      </button>

      {open && (
        <div className='absolute z-10 mt-2 w-48 bg-white border rounded shadow-lg'>
          <button
            onClick={() => {
              setOpen(false);
              setOpenPrompt(true);
            }}
            className='w-full px-4 py-2 text-left hover:bg-gray-100'
          >
            Write with AI
          </button>
          <button
            onClick={() => {
              setOpen(false);
              setOpenSummary(true);
              handleSummarize();
            }}
            className='w-full px-4 py-2 text-left hover:bg-gray-100'
          >
            Summarize
          </button>
        </div>
      )}

      {openPrompt && (
        <div className='absolute z-20 mt-2 w-96 bg-white border rounded shadow-lg p-4'>
          {/* Header */}
          <div className='flex justify-between items-center mb-3'>
            <h3 className='font-semibold text-gray-800 flex items-center gap-2'>
              <span>✨</span> Write with AI
            </h3>
            <button
              onClick={() => {
                setOpenPrompt(false);
                setIsAIGenerated(false);
                setOriginalPrompt('');
              }}
              className='text-gray-500 hover:text-gray-700 text-sm'
            >
              ✕
            </button>
          </div>

          {/* Textarea */}
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder='Describe what you want AI to write...'
            className='w-full h-24 border rounded px-3 py-2 text-sm text-gray-800 focus:outline-none resize-none'
          />

          {/* + Add to Doc */}
          {isAIGenerated && (
            <div className='mt-3 flex justify-end'>
              <button
                onClick={() => {
                  editor.commands.insertContent(`<p>${promptText}</p>`);
                  setOpenPrompt(false);
                  setIsAIGenerated(false);
                  setOriginalPrompt('');
                }}
                className='text-sm px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700'
              >
                + Add to Doc
              </button>
            </div>
          )}

          {/* Footer buttons */}
          <div className='flex justify-between items-center mt-4'>
            {/* Copy */}
            <button
              onClick={() => navigator.clipboard.writeText(promptText)}
              className='text-gray-600 text-sm hover:text-gray-800 px-2 py-1 border border-gray-300 rounded'
            >
              📋 Copy
            </button>

            {/* Actions */}
            <div className='flex gap-2'>
              {isAIGenerated ? (
                <button
                  onClick={() => {
                    setPromptText(originalPrompt);
                    setIsAIGenerated(false);
                  }}
                  className='px-3 py-1 text-sm border rounded hover:bg-gray-100'
                >
                  ← Back
                </button>
              ) : (
                <button
                  onClick={() => {
                    setOpenPrompt(false);
                    setIsAIGenerated(false);
                    setOriginalPrompt('');
                  }}
                  className='px-3 py-1 text-sm border rounded hover:bg-gray-100'
                >
                  Cancel
                </button>
              )}

              {/* Generate */}
              <button
                onClick={() => {
                  if (typeof promptText !== 'string' || !promptText.trim()) return;
                  onGenerate?.();
                  generateWithAI();
                }}
                disabled={loadingAI || !promptText.trim()}
                className={`px-4 py-1 rounded text-sm flex items-center gap-2 ${
                  !promptText.trim() || loadingAI
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loadingAI && (
                  <span className='animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full' />
                )}
                {loadingAI ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>

          <p className='text-xs text-gray-400 mt-2'>
            You can use natural language to describe the document content.
          </p>
        </div>
      )}

      {openSummary && (
        <div className='absolute z-20 mt-2 w-96 bg-white border rounded shadow-lg p-4'>
          <div className='flex justify-between items-center mb-3'>
            <h3 className='font-semibold text-gray-800 flex items-center gap-2'>
              <span>📄</span> Summarize
            </h3>
            <button
              onClick={() => setOpenSummary(false)}
              className='text-gray-500 hover:text-gray-700 text-sm'
            >
              ✕
            </button>
          </div>

          {/* <div className='border rounded px-3 py-2 bg-white text-gray-700 whitespace-pre-line min-h-[100px]'>
            Input did not contain enough meaningful information to summarize.
          </div> */}
          <div className='border rounded px-3 py-2 bg-white text-gray-700 whitespace-pre-line min-h-[100px]'>
            {loadingSummary
              ? 'Summarizing...'
              : summaryResult ||
                'Input did not contain enough meaningful information to summarize.'}
          </div>

          <div className='flex justify-between items-center mt-4'>
            <button
              onClick={() =>
                navigator.clipboard.writeText(
                  'Input did not contain enough meaningful information to summarize.'
                )
              }
              className='text-gray-600 text-sm hover:text-gray-800 px-2 py-1 border border-gray-300 rounded'
            >
              📋 Copy
            </button>
            <div className='flex gap-2'>
              <button
                onClick={() => setOpenSummary(false)}
                className='px-3 py-1 text-sm border rounded hover:bg-gray-100'
              >
                Cancel
              </button>
              <button
                onClick={handleAddToDoc}
                disabled={!summaryResult || saving}
                className={`px-4 py-1 rounded text-sm ${
                  !summaryResult || saving
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {saving ? 'Saving...' : '+ Add to doc'}
              </button>
            </div>
          </div>

          <p className='text-xs text-gray-400 mt-2'>
            AI generated content may be inaccurate, make sure to review it
          </p>
        </div>
      )}
    </div>
  );
}
