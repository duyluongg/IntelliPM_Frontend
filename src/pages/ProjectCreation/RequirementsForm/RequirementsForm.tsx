import React, { useState } from 'react';

interface RequirementsFormProps {
  initialData?: {
    requirements: string[];
  };
  onNext: (data: { requirements: string[] }) => void;
  onBack: () => void;
}

const RequirementsForm: React.FC<RequirementsFormProps> = ({ initialData, onNext, onBack }) => {
  const [requirements, setRequirements] = useState<string[]>(initialData?.requirements || ['']);

  const handleChange = (index: number, value: string) => {
    const updated = [...requirements];
    updated[index] = value;
    setRequirements(updated);
  };

  const addRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const removeRequirement = (index: number) => {
    const updated = requirements.filter((_, i) => i !== index);
    setRequirements(updated);
  };

  const handleSubmit = () => {
    const trimmed = requirements.map(req => req.trim()).filter(req => req.length > 0);
    onNext({ requirements: trimmed });
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Add project requirements</h1>
      <p className="text-sm text-gray-600 mb-6">
        Define key features or technical expectations for your project. This helps everyone stay aligned.
      </p>

      <div className="space-y-4">
        {requirements.map((requirement, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={requirement}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={`Requirement ${index + 1}`}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {requirements.length > 1 && (
              <button
                onClick={() => removeRequirement(index)}
                className="text-red-500 text-sm hover:underline"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addRequirement}
          className="text-blue-600 text-sm mt-2 hover:underline"
        >
          + Add another requirement
        </button>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-10">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm border rounded hover:bg-gray-100 transition"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 text-sm bg-[#0052CC] text-white rounded hover:bg-[#003087]"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default RequirementsForm;
 