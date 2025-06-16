import { useState } from 'react';
import ProjectTabs from '../../../components/PM/ProjectTabs';
import { FileText, Zap, Bug, AlertTriangle, Shuffle, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

const templates = [
  { id: 'blank', label: 'Blank form', icon: <FileText size={16} /> },
  { id: 'feature', label: 'Feature request', icon: <Zap size={16} />, path: 'feature' },
  { id: 'bug', label: 'Bug report', icon: <Bug size={16} /> },
  { id: 'incident', label: 'Incident report', icon: <AlertTriangle size={16} /> },
  { id: 'review', label: 'Technical review', icon: <SlidersHorizontal size={16} /> },
  { id: 'change', label: 'Change request', icon: <Shuffle size={16} /> },
];

export default function Form() {
  const [selected, setSelected] = useState('blank');
  return (
    <div>
      <ProjectTabs />
      <div className='p-4 space-y-3'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-gray-800'>Create a new form</h2>
        </div>

        <div className='flex flex-wrap gap-6 p-4 border rounded-md bg-white'>
          {templates.map((template) => (
            <Link to={`/projects/form/${template.path || template.id}`} key={template.id}>
            <button
              key={template.id}
              onClick={() => setSelected(template.id)}
              className={`flex items-center gap-2 px-3 py-1 border rounded-md transition ${
                selected === template.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
              }`}
            >
              {template.icon}
              <span className='text-sm'>{template.label}</span>
            </button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
