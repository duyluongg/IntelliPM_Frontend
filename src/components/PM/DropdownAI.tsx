import { useState } from 'react';
import Lottie from 'lottie-react';
import AI_Icon from '../../../src/assets/AnimationIcon/AI_Icon.json';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';
import axios from 'axios';
import type { Editor } from '@tiptap/react';

export default function DropdownAI({
  editor,
  onGenerate,
}: {
  editor: Editor;
  onGenerate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [openSummary, setOpenSummary] = useState(false);
  const { id } = useParams();
  const { user } = useAuth();
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryResult, setSummaryResult] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddToDoc = async () => {
    if (!user || !id || !summaryResult) return;

    setSaving(true);
    try {
      // Lấy document hiện tại
      const docRes = await axios.get(`https://localhost:7128/api/documents/${id}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });

      const doc = docRes.data;

      const updatedDoc = {
        ...doc,
        content: doc.content + '\n\n' + summaryResult,
        updatedBy: user.id,
      };

      await axios.put(`https://localhost:7128/api/documents/${id}`, updatedDoc, {
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
    if (!user || !id) return;

    setLoadingSummary(true);
    setOpenSummary(true);
    try {
      const res = await axios.get(
        `https://localhost:7128/api/documents/${id}/summary`,

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
              onGenerate();
              setOpen(false);
            }}
            className='w-full px-4 py-2 text-left hover:bg-gray-100'
          >
            Write with AI
          </button>
          <button
            onClick={() => {
              setOpen(false);
              // setOpenSummary(true);
              handleSummarize();
            }}
            className='w-full px-4 py-2 text-left hover:bg-gray-100'
          >
            Summarize
          </button>
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
