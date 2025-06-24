import { useState } from 'react';
import axios from 'axios';
import { Sparkles, FileText, Table, BarChart2, LayoutList, KanbanSquare } from 'lucide-react';
import { useAuth } from '../../../services/AuthContext';
import TiptapEditor from '../../../components/PM/TiptapEditor';
// import TiptapEditor from '../../../components/PM/TiptapEditor';

function extractBodyContent(html: string): string {
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1] : html;
}

export default function DocBlank() {
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [aiInput, setAiInput] = useState('');
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!user) {
      alert('Bạn chưa đăng nhập!');
      return;
    }

    const payload = {
      projectId: 1,
      taskId: 'PROJA-3',
      title: formData.title,
      type: 'BLANK',
      template: 'blank',
      content: formData.content,
      fileUrl: '',
      createdBy: user.id,
      prompt: aiInput,
    };

    try {
      const res = await axios.post('https://localhost:7128/api/documents', payload, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      alert('Document created successfully!');
      console.log(res.data.content);

      setFormData({
        title: res.data.title || '',
        content: res.data.content || '',
      });

      setAiInput('');
    } catch (err) {
      console.error('Error creating document:', err);
      alert('Tạo tài liệu thất bại.');
    }
  };

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

      {/* <div
        className='prose max-w-none'
        dangerouslySetInnerHTML={{ __html: extractBodyContent(formData.content) }}
      /> */}

      <div className='space-y-2'>
        <BlockButton icon={<Sparkles size={16} />} label='Start with AI' />
        <BlockButton icon={<FileText size={16} />} label='Templates' />
        <BlockButton icon={<Table size={16} />} label='Table' />
        <BlockButton icon={<BarChart2 size={16} />} label='Chart' />
        <BlockButton icon={<LayoutList size={16} />} label='Board values' />
        <BlockButton icon={<KanbanSquare size={16} />} label='Board' />
      </div>

      <div className='p-[2px] rounded-xl bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500'>
        <div className='p-4 rounded-xl bg-white shadow-md flex flex-col space-y-2 hover:shadow-lg transition'>
          <div className='flex items-center gap-2 text-blue-600 font-medium'>
            <Sparkles size={18} />
            Start with AI
          </div>
          <textarea
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder='Describe the document you want to create'
            className='w-full border-none focus:outline-none resize-none text-sm text-gray-800 bg-transparent placeholder-gray-500'
            rows={2}
          />
        </div>
      </div>

      <div className='text-right'>
        <button
          onClick={handleSubmit}
          className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition'
        >
          Tạo tài liệu
        </button>
      </div>
    </div>
  );
}

const BlockButton = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <button className='flex items-center gap-2 px-3 py-2 text-sm border rounded-md bg-white hover:bg-gray-50 shadow-sm transition'>
    <span>{icon}</span>
    <span>{label}</span>
  </button>
);
