import React, { useState, useEffect } from 'react';
//import { useNavigate } from 'react-router-dom';

interface InviteesFormProps {
  initialData: {
    name: string;
    projectKey: string;
    description: string;
    requirements: string[];
    invitees: string[];
  };
  onNext: () => Promise<void>; // Matches the handleSubmit type in ProjectCreation
  onBack: () => void;
}

const InviteesForm: React.FC<InviteesFormProps> = ({ initialData, onNext, onBack }) => {
  //const navigate = useNavigate();

  const [invitees, setInvitees] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [role, setRole] = useState('Administrators');

  // Initialize invitees from initialData when the component mounts
  useEffect(() => {
    if (initialData.invitees && initialData.invitees.length > 0) {
      setInvitees([...initialData.invitees]);
    }
  }, [initialData.invitees]);

  const handleAddInvitee = () => {
    if (inputValue.trim() && !invitees.includes(inputValue)) {
      setInvitees([...invitees, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleRemoveInvitee = (name: string) => {
    setInvitees(invitees.filter((inv) => inv !== name));
  };

  const handleContinue = async () => {
    // You can pass the updated invitees back if needed, but for now, just call onNext
    await onNext();
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Bring the team with you</h1>
      <p className="text-gray-600 mb-8">
        Invite these teammates to your project, and create work together.
      </p>

      {/* Invitation Box */}
      <div className="bg-gray-100 p-6 rounded-lg shadow-inner">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span>👥</span> Recommended teammates
        </h2>

        {/* Input */}
        <div className="flex flex-wrap gap-2 mb-4">
          {invitees.map((name) => (
            <span
              key={name}
              className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center gap-2"
            >
              {name}
              <button onClick={() => handleRemoveInvitee(name)} className="text-sm font-bold">
                ×
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={inputValue}
            placeholder="Enter name or email"
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddInvitee()}
            className="flex-1 px-4 py-2 border rounded shadow-sm"
          />
          <button
            onClick={handleAddInvitee}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Add
          </button>
        </div>

        {/* Role dropdown */}
        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-4 py-2 border rounded shadow-sm"
        >
          <option>Administrators</option>
          <option>Project Manager</option>
          <option>Developer</option>
          <option>Viewer</option>
        </select>
      </div>

      {/* Footer actions */}
      <div className="mt-10 flex justify-between items-center text-sm text-gray-500">
        <span>Step 2 of 2</span>
        <div className="flex gap-4">
          <button onClick={onBack} className="text-gray-500 hover:underline">
            Back
          </button>
          <button
            onClick={handleContinue}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
          >
            Invite and Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteesForm;