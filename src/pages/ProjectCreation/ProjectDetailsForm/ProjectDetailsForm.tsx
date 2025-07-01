import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import scrumIcon from '../../../assets/CreateProject/scrum.svg';
import companyIcon from '../../../assets/CreateProject/AiIntro.png';

const ProjectDetailsForm: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [shareSettings, setShareSettings] = useState(false);

  const handleNext = () => {
    if (name && key) {
      navigate('/create-project/invitees-form');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Back navigation */}
      <button
        onClick={() => navigate('/create-project/project-introduction')}
        className="text-sm text-blue-600 mb-6 hover:underline flex items-center gap-1"
      >
        ← Back to project types
      </button>

      {/* Header */}
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Add project details</h1>
      <p className="text-sm text-gray-600 mb-1">
        Explore what's possible when you collaborate with your team. Edit project details anytime in project settings.
      </p>
      <p className="text-sm text-red-500 mb-6">
        Required fields are marked with an asterisk <span className="text-red-500">*</span>
      </p>

      {/* Form Body */}
      <div className="grid md:grid-cols-2 gap-10">
        {/* Left: Inputs */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Try a team name, project goal, milestone..."
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="share"
              checked={shareSettings}
              onChange={() => setShareSettings(!shareSettings)}
              className="h-4 w-4 text-blue-600"
            />
            <label htmlFor="share" className="text-sm text-gray-700">
              Share settings with an existing project
            </label>
          </div>
        </div>

        {/* Right: Template and Type */}
        <div className="space-y-8">
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm text-gray-600 font-medium">Template</p>
              <button className="text-sm text-blue-600 hover:underline">Change template</button>
            </div>
            <div className="border rounded flex items-center p-4 gap-4 bg-gray-50">
              <img src={scrumIcon} alt="Scrum" className="w-10 h-10 object-contain" />
              <div>
                <p className="font-semibold text-sm text-gray-900">Scrum</p>
                <p className="text-sm text-gray-600">
                  Sprint toward your project goals with a board, backlog, and timeline.
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm text-gray-600 font-medium">Type</p>
              <button className="text-sm text-blue-600 hover:underline">Change type</button>
            </div>
            <div className="border rounded flex items-center p-4 gap-4 bg-gray-50">
              <img src={companyIcon} alt="Company Managed" className="w-10 h-10 object-contain" />
              <div>
                <p className="font-semibold text-sm text-blue-700">Company-managed</p>
                <p className="text-sm text-gray-600">
                  Work with other teams across many projects in a standard way.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end mt-10 gap-4">
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 text-sm border rounded hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleNext}
          disabled={!name || !key}
          className={`px-4 py-2 text-sm rounded transition ${
            !name || !key
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProjectDetailsForm;
