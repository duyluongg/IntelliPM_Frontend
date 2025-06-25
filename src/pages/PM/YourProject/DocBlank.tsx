import { useRef, useState } from 'react';
import axios from 'axios';
import { Sparkles, FileText, Table, BarChart2, LayoutList, KanbanSquare } from 'lucide-react';
import { useAuth } from '../../../services/AuthContext';
import TiptapEditor from '../../../components/PM/TiptapEditor';
import { useDebouncedEffect } from '../../../components/hook/useDebouncedEffect';
import type { DocumentType } from '../../../types/DocumentType';
import { useParams } from 'react-router-dom';

type Props = {
  doc?: DocumentType;
};

function extractBodyContent(html: string): string {
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1] : html;
}

export default function DocBlank({ doc }: Props) {
  const [formData, setFormData] = useState({
    title: doc?.title || '',
    content: doc?.content || '',
  });
  const [aiInput, setAiInput] = useState('');
  const { user } = useAuth();
  const { formId } = useParams<{ formId?: string }>();
  const [loading, setLoading] = useState(false);
  const [docId, setDocId] = useState<number | null>(doc?.id ?? null);
  const [isNewDoc, setIsNewDoc] = useState(!doc?.id);

  const isCreatingRef = useRef(false);
  const skipAutosaveRef = useRef(false);

  const submitDocument = async () => {
    if (!user || !formData.content.trim()) return;

    const payload = {
      projectId: doc?.projectId ?? 1,
      taskId: doc?.taskId ?? 'PROJA-3',
      title: formData.title || 'Untitled Document',
      type: formId,
      template: 'blank',
      content: formData.content,
      fileUrl: '',
      createdBy: user.id,
      ...(docId && { updatedBy: user.id }),
    };

    try {
      setLoading(true);

      if (isNewDoc) {
        if (isCreatingRef.current) return;
        isCreatingRef.current = true;

        const res = await axios.post('https://localhost:7128/api/documents', payload, {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });
        console.log('Này là api nhập tay tạo');

        if (res.data?.id) {
          setDocId(res.data.id);
          setIsNewDoc(false);
        }
      } else {
        await axios.put(`https://localhost:7128/api/documents/${docId}`, payload, {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });
      }
    } catch (err) {
      console.error('[AutoSave] Error ❌', err);
    } finally {
      setLoading(false);
      isCreatingRef.current = false;
    }
  };

  const handleGenerateFromAI = async () => {
    if (!user || !aiInput.trim()) return;

    const payload = {
      projectId: 1,
      taskId: 'PROJA-3',
      title: formData.title || 'Untitled Document',
      type: formId,
      template: 'blank',
      content: '',
      fileUrl: '',
      createdBy: user.id,
      prompt: aiInput,
    };

    try {
      setLoading(true);
      const res = await axios.post('https://localhost:7128/api/documents', payload, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      if (res.data?.id) {
        setDocId(res.data.id);
        setIsNewDoc(false);
      }

      skipAutosaveRef.current = true;

      setFormData({
        title: res.data.title || '',
        content: res.data.content || '',
      });

      setAiInput('');
      console.log('[AI] Content generated and loaded ✅');
    } catch (err) {
      console.error('[AI] Failed to generate content ❌', err);
      alert('Tạo nội dung bằng AI thất bại.');
    } finally {
      setLoading(false);
    }
  };

  useDebouncedEffect(
    () => {
      if (skipAutosaveRef.current) {
        skipAutosaveRef.current = false;
        return;
      }

      if (!aiInput.trim()) {
        submitDocument();
      }
    },
    [formData.title, formData.content],
    500
  );

  return (
    <div className='max-w-4xl mx-auto p-8 space-y-8 bg-white'>
      <input
        type='text'
        name='title'
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className='w-full text-4xl font-bold outline-none bg-transparent placeholder-gray-400'
        placeholder='New Doc'
      />

      <div className='text-sm text-gray-500 space-x-3'>
        <span>
          👤 Creator <strong>{user?.username || 'Unknown'}</strong>
        </span>
        <span>🌟 Created {new Date().toLocaleString()}</span>
        <span>🕒 Last updated {new Date().toLocaleString()}</span>
      </div>

      <TiptapEditor
        content={extractBodyContent(formData.content)}
        onChange={(value) => setFormData({ ...formData, content: value })}
      />

      <div className='space-y-2'>
        <BlockButton icon={<Sparkles size={16} />} label='Start with AI' />
        <BlockButton icon={<FileText size={16} />} label='Templates' />
        <BlockButton icon={<Table size={16} />} label='Table' />
        <BlockButton icon={<BarChart2 size={16} />} label='Chart' />
        <BlockButton icon={<LayoutList size={16} />} label='Board values' />
        <BlockButton icon={<KanbanSquare size={16} />} label='Board' />
      </div>

      {loading ? (
        <div className='p-[2px] rounded-xl bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500'>
          <div className='p-4 rounded-xl bg-white shadow-md flex flex-col space-y-2 hover:shadow-lg transition'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2 text-blue-600 font-medium'>
                <Sparkles size={18} />
                Start with AI
              </div>
            </div>

            <div className='font-semibold text-gray-800 mb-2'>Generate ...</div>
          </div>
        </div>
      ) : (
        <div className='p-[2px] rounded-xl bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500'>
          <div className='p-4 rounded-xl bg-white shadow-md flex flex-col space-y-2 hover:shadow-lg transition'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2 text-blue-600 font-medium'>
                <Sparkles size={18} />
                Start with AI
              </div>
            </div>

            <textarea
              value={aiInput}
              onChange={(e) => {
                setAiInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              placeholder='Describe the document you want to create...'
              className='w-full border-none focus:outline-none resize-none text-sm text-gray-800 bg-transparent placeholder-gray-500 overflow-hidden'
              rows={1}
            />

            <div className='flex justify-end mt-2'>
              <button
                onClick={handleGenerateFromAI}
                className='px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-end'
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const BlockButton = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <button className='flex items-center gap-2 px-3 py-2 text-sm border rounded-md bg-white hover:bg-gray-50 shadow-sm transition'>
    <span>{icon}</span>
    <span>{label}</span>
  </button>
);
