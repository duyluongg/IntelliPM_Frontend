import { useNavigate, useParams } from 'react-router-dom';
import ProjectTabs from '../../../components/PM/ProjectTabs';
import { FileText, Zap, Bug, AlertTriangle, Shuffle, SlidersHorizontal } from 'lucide-react';
import FeatureRequestForm from './FeatureRequestForm';
import RecentForm from './RecentForm';
import DocBlank from './DocBlank';

const templates = [
  { id: 'blank', label: 'Blank form', icon: <FileText size={16} /> },
  { id: 'doc', label: 'Documents', icon: <FileText size={16} /> },

  { id: 'feature', label: 'Feature request', icon: <Zap size={16} /> },
  { id: 'bug', label: 'Bug report', icon: <Bug size={16} /> },
  { id: 'incident', label: 'Incident report', icon: <AlertTriangle size={16} /> },
  { id: 'review', label: 'Technical review', icon: <SlidersHorizontal size={16} /> },
  { id: 'change', label: 'Change request', icon: <Shuffle size={16} /> },
];

export default function Form() {
  const { formId } = useParams();
  const navigate = useNavigate();

  const handleSelect = (templateId: string) => {
    navigate(`/projects/form/${templateId}`);
  };

  const handleBack = () => {
    navigate('/projects/form');
  };

  return (
    <div className='min-h-screen bg-white'>
      <ProjectTabs />

      {!formId || formId === 'blank' ? (
        <div className='p-4 space-y-3  '>
          <h2 className='text-lg font-semibold text-gray-800'>Create a new form</h2>

          <div className='flex flex-wrap gap-3 p-4 border rounded-md bg-white shadow-sm'>
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelect(template.id)}
                className={`flex items-center gap-2 px-3 py-2 border rounded-md transition ${
                  template.id === 'blank'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                }`}
              >
                {template.icon}
                <span className='text-sm'>{template.label}</span>
              </button>
            ))}
          </div>

          <RecentForm />
        </div>
      ) : (
        <div className='mt-6 max-w-5xl mx-auto'>
          {formId === 'feature' && <FeatureRequestForm onBack={handleBack} />}
          {formId === 'doc' && <DocBlank  />}

          {/* {formId === 'bug' && <BugReportForm onBack={handleBack} />} */}
          {/* ... */}
        </div>
      )}
    </div>
  );
}
