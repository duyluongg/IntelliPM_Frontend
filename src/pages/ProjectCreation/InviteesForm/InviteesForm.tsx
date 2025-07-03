import React, { useState, useEffect } from 'react';

interface InviteesFormProps {
  initialData: {
    name: string;
    projectKey: string;
    description: string;
    requirements: string[];
    invitees: string[];
  };
  onNext: () => Promise<void>;
  onBack: () => void;
}

const InviteesForm: React.FC<InviteesFormProps> = ({ initialData, onNext, onBack }) => {
  const [invitees, setInvitees] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [role, setRole] = useState('Administrators');
  const [showTable, setShowTable] = useState(false);

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
    await onNext();
  };

  // Extract fullname from email (simple assumption: before @)
  const getFullnameFromEmail = (email: string) => {
    return email.split('@')[0] || email;
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

        {/* Show Table Button */}
        <button
          onClick={() => setShowTable(!showTable)}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          {showTable ? 'Hide Table' : 'Show Table'}
        </button>

        {/* Table Display */}
        {showTable && (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
              <thead>
                <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                  <th className="px-4 py-2 border-b">Địa chỉ email</th>
                  <th className="px-4 py-2 border-b">Fullname</th>
                  <th className="px-4 py-2 border-b">Vị trí role trong công ty</th>
                </tr>
              </thead>
              <tbody>
                {invitees.map((email) => (
                  <tr key={email} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">{email}</td>
                    <td className="px-4 py-2 border-b">{getFullnameFromEmail(email)}</td>
                    <td className="px-4 py-2 border-b">{role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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