import React, { useState } from 'react';
import { useGenerateEpicsMutation, type EpicPreviewDTO } from '../../../services/aiApi';
import aiIcon from '../../../assets/icon/ai.png';
import galaxyaiIcon from '../../../assets/galaxyai.gif';
import AiResponseEvaluationPopup from '../../../components/AiResponse/AiResponseEvaluationPopup';

interface GenerateEpicsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  projectKey: string;
  existingEpicTitles: string[];
  onEpicsGenerated: (epics: EpicPreviewDTO[]) => void;
}

const GenerateEpicsPopup: React.FC<GenerateEpicsPopupProps> = ({
  isOpen,
  onClose,
  projectId,
  projectKey,
  existingEpicTitles,
  onEpicsGenerated,
}) => {
  const [epics, setEpics] = useState<EpicPreviewDTO[]>([]);
  const [selectedEpics, setSelectedEpics] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingEpicId, setEditingEpicId] = useState<string | null>(null);
  const [epicTitle, setEpicTitle] = useState<string>('');
  const [epicDescription, setEpicDescription] = useState<string>('');
  const [epicStartDate, setEpicStartDate] = useState<string>('');
  const [epicEndDate, setEpicEndDate] = useState<string>('');
  const [isEvaluationPopupOpen, setIsEvaluationPopupOpen] = useState(false);
  const [evaluationPayload, setEvaluationPayload] = useState<string>('');

  const [generateEpics, { isLoading: isGenerateEpicsLoading }] = useGenerateEpicsMutation();

  const handleGenerateEpics = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await generateEpics({
        projectId,
        body: { existingEpicTitles },
      }).unwrap();
      
      console.log('Generated epics response:', response);
      
      if (!response.isSuccess) {
        throw new Error(response.message || 'Failed to generate epics');
      }
      
      setEpics(response.data);
      setSelectedEpics(response.data.map((_, index) => `epic-${index}`));
    } catch (err: any) {
      console.error('Epic generation error:', err);
      setError(err?.data?.message || err.message || 'Failed to generate epics');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEpicCheckboxChange = (epicId: string) => {
    setSelectedEpics((prev) =>
      prev.includes(epicId) ? prev.filter((id) => id !== epicId) : [...prev, epicId]
    );
  };

  const handleStartEpicEdit = (
    epicId: string,
    currentTitle: string,
    currentDescription: string,
    currentStartDate: string,
    currentEndDate: string
  ) => {
    setEditingEpicId(epicId);
    setEpicTitle(currentTitle);
    setEpicDescription(currentDescription);
    setEpicStartDate(currentStartDate ? new Date(currentStartDate).toISOString().split('T')[0] : '');
    setEpicEndDate(currentEndDate ? new Date(currentEndDate).toISOString().split('T')[0] : '');
  };

  const handleSaveEpicEdit = (epicId: string) => {
    if (!epicTitle.trim()) {
      setError('Epic title is required.');
      return;
    }
    
    if (epicStartDate && epicEndDate && new Date(epicEndDate) < new Date(epicStartDate)) {
      setError('End date must be on or after start date.');
      return;
    }

    setEpics((prev) =>
      prev.map((epic, index) =>
        `epic-${index}` === epicId
          ? {
              ...epic,
              title: epicTitle.trim(),
              description: epicDescription.trim() || epic.description,
              startDate: epicStartDate || epic.startDate,
              endDate: epicEndDate || epic.endDate,
            }
          : epic
      )
    );
    setEditingEpicId(null);
    setEpicTitle('');
    setEpicDescription('');
    setEpicStartDate('');
    setEpicEndDate('');
    setError(null);
  };

  const handleCancelEpicEdit = () => {
    setEditingEpicId(null);
    setEpicTitle('');
    setEpicDescription('');
    setEpicStartDate('');
    setEpicEndDate('');
    setError(null);
  };

  const handleSubmit = async () => {
    if (selectedEpics.length === 0) {
      setError('Please select at least one epic.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const selectedEpicsData = epics.filter((_, index) => selectedEpics.includes(`epic-${index}`));
      
      // Validate all selected epics
      for (const epic of selectedEpicsData) {
        if (!epic.title.trim()) {
          throw new Error('All epics must have a title.');
        }
        if (epic.startDate && epic.endDate && new Date(epic.endDate) < new Date(epic.startDate)) {
          throw new Error(`Epic "${epic.title}" has invalid dates: End date must be on or after start date.`);
        }
      }

      setEvaluationPayload(JSON.stringify({ epics: selectedEpicsData }));
      setIsEvaluationPopupOpen(true);
      onEpicsGenerated(selectedEpicsData);
    } catch (err: any) {
      console.error('Submit epics error:', err);
      setError(err.message || 'Failed to process epics');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEvaluationPopupClose = () => {
    setIsEvaluationPopupOpen(false);
    setEvaluationPayload('');
    onClose();
  };

  const handleEvaluationSubmitSuccess = (aiResponseId: number) => {
    console.log('AI response evaluation submitted with ID:', aiResponseId);
    setIsEvaluationPopupOpen(false);
    setEvaluationPayload('');
    onClose();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60'>
        <style>
          {`
            @keyframes gradientLoading {
              0% { background-position: 200% 50%; }
              100% { background-position: 0% 50%; }
            }
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
          `}
        </style>
        <div className='bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8 max-h-[85vh] overflow-y-auto'>
          <h2 className='text-2xl font-bold text-[#1c73fd] mb-6 flex items-center gap-3'>
            <img src={aiIcon} alt='AI Icon' className='w-8 h-8' />
            Generate Epics for Project
          </h2>
          
          <div className='mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl'>
            <p className='text-blue-800 text-sm'>
              <strong>Project:</strong> {projectKey} • <strong>Existing Epics:</strong> {existingEpicTitles.length}
            </p>
            {existingEpicTitles.length > 0 && (
              <div className='mt-2'>
                <p className='text-blue-700 text-xs mb-1'>Current epics:</p>
                <div className='flex flex-wrap gap-2'>
                  {existingEpicTitles.slice(0, 5).map((title, index) => (
                    <span key={index} className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full'>
                      {title}
                    </span>
                  ))}
                  {existingEpicTitles.length > 5 && (
                    <span className='text-xs text-blue-600'>+{existingEpicTitles.length - 5} more</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className='bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl mb-6'>
              <div className='flex items-start gap-2'>
                <svg className='w-5 h-5 text-red-500 mt-0.5 flex-shrink-0' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                </svg>
                {error}
              </div>
            </div>
          )}

          {isGenerating || isGenerateEpicsLoading ? (
            <div className="flex justify-center items-center py-12 bg-white rounded-2xl shadow-md">

              <div className='flex flex-col items-center gap-4'>
                <img src={galaxyaiIcon} alt='AI Processing' className='w-12 h-12 animate-pulse' />
                <span
                  style={{
                    background: 'linear-gradient(90deg, #1c73fd, #00d4ff, #4a90e2, #1c73fd)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'gradientLoading 1.8s ease-in-out infinite',
                  }}
                  className='text-xl font-semibold'
                >
                  Generating Epic Ideas...
                </span>
                <p className='text-gray-600 text-sm text-center max-w-md'>
                  AI is analyzing your project requirements and creating meaningful epics for better organization.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className='mb-6'>
                <button
                  onClick={handleGenerateEpics}
                  className={`w-full py-4 text-white font-semibold rounded-xl flex items-center justify-center gap-3 transition-all duration-300 ${
                    isGenerating || isSubmitting
                      ? 'bg-gray-400 opacity-70 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 hover:shadow-xl hover:scale-[1.02] shadow-lg'
                  }`}
                  disabled={isGenerating || isSubmitting}
                >
                  <img src={aiIcon} alt='AI Icon' className='w-6 h-6 object-contain' />
                  <span className='text-lg'>
                    {isGenerating ? 'Generating Epics...' : 'Generate Epic Suggestions'}
                  </span>
                </button>
              </div>

              {epics.length > 0 && (
                <div className='border border-gray-200 rounded-xl p-6 max-h-[50vh] overflow-y-auto bg-gray-50'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-semibold text-gray-800'>Generated Epics ({epics.length})</h3>
                    <div className='text-sm text-gray-600'>
                      {selectedEpics.length} of {epics.length} selected
                    </div>
                  </div>
                  
                  <div className='space-y-4'>
                    {epics.map((epic, index) => (
                      <div
                        key={`epic-${index}`}
                        className='bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100'
                      >
                        <div className='flex items-start gap-4'>
                          <input
                            type='checkbox'
                            checked={selectedEpics.includes(`epic-${index}`)}
                            onChange={() => handleEpicCheckboxChange(`epic-${index}`)}
                            className='h-5 w-5 text-[#1c73fd] focus:ring-[#1c73fd] border-gray-300 rounded mt-1'
                            disabled={isSubmitting}
                          />
                          <div className='flex-1'>
                            <div className='flex items-center justify-between mb-2'>
                              <h4 className='font-semibold text-gray-800 text-lg'>{epic.title}</h4>
                              <div className='flex items-center gap-2'>
                                {epic.aiGenerated && (
                                  <span className='text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium'>
                                    AI Generated
                                  </span>
                                )}
                                <button
                                  onClick={() =>
                                    handleStartEpicEdit(
                                      `epic-${index}`,
                                      epic.title,
                                      epic.description,
                                      epic.startDate,
                                      epic.endDate
                                    )
                                  }
                                  className='text-sm text-[#1c73fd] hover:text-[#155ac7] transition-colors duration-200 font-medium'
                                  disabled={isSubmitting}
                                >
                                  Edit Details
                                </button>
                              </div>
                            </div>
                            
                            <p className='text-gray-600 mb-3 leading-relaxed'>{epic.description}</p>
                            
                            <div className='flex items-center gap-4 text-sm text-gray-500'>
                              <div className='flex items-center gap-1'>
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                </svg>
                                <span>Start: {formatDate(epic.startDate)}</span>
                              </div>
                              <div className='flex items-center gap-1'>
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                </svg>
                                <span>End: {formatDate(epic.endDate)}</span>
                              </div>
                            </div>

                            {editingEpicId === `epic-${index}` && (
                              <div className='mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                  <div className='md:col-span-2'>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                      Epic Title *
                                    </label>
                                    <input
                                      type='text'
                                      value={epicTitle}
                                      onChange={(e) => setEpicTitle(e.target.value)}
                                      className='w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd]'
                                      placeholder='Enter epic title'
                                    />
                                  </div>
                                  <div className='md:col-span-2'>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                      Description
                                    </label>
                                    <textarea
                                      value={epicDescription}
                                      onChange={(e) => setEpicDescription(e.target.value)}
                                      rows={3}
                                      className='w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] resize-none'
                                      placeholder='Enter epic description'
                                    />
                                  </div>
                                  <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                      Start Date
                                    </label>
                                    <input
                                      type='date'
                                      value={epicStartDate}
                                      onChange={(e) => setEpicStartDate(e.target.value)}
                                      className='w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd]'
                                    />
                                  </div>
                                  <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                      End Date
                                    </label>
                                    <input
                                      type='date'
                                      value={epicEndDate}
                                      onChange={(e) => setEpicEndDate(e.target.value)}
                                      className='w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd]'
                                    />
                                  </div>
                                </div>
                                <div className='flex justify-end gap-2 mt-4'>
                                  <button
                                    onClick={handleCancelEpicEdit}
                                    className='px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200'
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSaveEpicEdit(`epic-${index}`)}
                                    className='px-4 py-2 text-sm bg-[#1c73fd] text-white rounded-lg hover:bg-[#155ac7] transition-colors duration-200'
                                  >
                                    Save Changes
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className='flex justify-end gap-4 mt-8'>
                <button
                  onClick={onClose}
                  className='px-6 py-3 text-sm font-semibold text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-100 transition-all duration-200'
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className={`px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all duration-300 ${
                    isSubmitting || epics.length === 0
                      ? 'bg-gray-500 opacity-70 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] hover:from-[#155ac7] hover:to-[#3e7ed1] hover:shadow-lg'
                  }`}
                  disabled={isSubmitting || epics.length === 0}
                >
                  {isSubmitting ? 'Adding Epics...' : `Add Selected Epics (${selectedEpics.length})`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      <AiResponseEvaluationPopup
        isOpen={isEvaluationPopupOpen}
        onClose={handleEvaluationPopupClose}
        aiResponseJson={evaluationPayload}
        projectId={projectId}
        aiFeature='EPIC_GENERATION'
        onSubmitSuccess={handleEvaluationSubmitSuccess}
      />
    </>
  );
};

export default GenerateEpicsPopup;