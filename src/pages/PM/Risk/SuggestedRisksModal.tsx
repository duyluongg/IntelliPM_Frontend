import { useState } from 'react';
import './SuggestedRisksModal.css';

interface SuggestedRisk {
  id: number;
  title: string;
  description: string;
  impactLevel: 'Low' | 'Medium' | 'High';
  probability: 'Low' | 'Medium' | 'High';
  type: string;
  responsibleUserName: string;
  dueDate: string;
}

interface Props {
  onClose: () => void;
  onApprove: (risk: SuggestedRisk) => void;
}

const sampleSuggestedRisks: SuggestedRisk[] = [
  {
    id: 1,
    title: 'Vendor delay in API delivery',
    description: 'External API from third-party vendor may be delayed due to contract issues.',
    impactLevel: 'High',
    probability: 'Medium',
    type: 'Schedule Risk',
    responsibleUserName: 'vendor_team',
    dueDate: '2025-07-15',
  },
  {
    id: 2,
    title: 'Lack of testing coverage',
    description: 'Current test coverage is below 50%, which could lead to production bugs.',
    impactLevel: 'Medium',
    probability: 'High',
    type: 'Quality Risk',
    responsibleUserName: 'qa_lead',
    dueDate: '2025-07-20',
  },
  {
    id: 3,
    title: 'Team member availability during holidays',
    description: 'Reduced team capacity expected in August due to planned vacations.',
    impactLevel: 'Medium',
    probability: 'Medium',
    type: 'Resource Risk',
    responsibleUserName: 'hr_manager',
    dueDate: '2025-08-01',
  },
];

const SuggestedRisksModal: React.FC<Props> = ({ onClose, onApprove }) => {
  const [suggestedRisks, setSuggestedRisks] = useState(sampleSuggestedRisks);

  const handleUpdateField = <K extends keyof SuggestedRisk>(
    index: number,
    field: K,
    value: SuggestedRisk[K]
  ) => {
    const updated = [...suggestedRisks];
    updated[index][field] = value;
    setSuggestedRisks(updated);
  };

  return (
    <div className='suggested-modal-overlay'>
      <div className='suggested-modal'>
        <h2 className='modal-title'>AI Suggested Risks</h2>
        <div className='suggested-risk-list'>
          {suggestedRisks.map((risk, index) => (
            <div key={risk.id} className='suggested-risk-card'>
              <input
                className='modal-input'
                value={risk.title}
                onChange={(e) => handleUpdateField(index, 'title', e.target.value)}
              />
              <textarea
                className='modal-textarea'
                value={risk.description}
                onChange={(e) => handleUpdateField(index, 'description', e.target.value)}
              />

              <div className='grid-2'>
                <div>
                  <label>Impact</label>
                  <select
                    value={risk.impactLevel}
                    onChange={(e) =>
                      handleUpdateField(
                        index,
                        'impactLevel',
                        e.target.value as 'Low' | 'Medium' | 'High'
                      )
                    }
                  >
                    <option value='Low'>Low</option>
                    <option value='Medium'>Medium</option>
                    <option value='High'>High</option>
                  </select>
                </div>
                <div>
                  <label>Likelihood</label>
                  <select
                    value={risk.probability}
                    onChange={(e) =>
                      handleUpdateField(
                        index,
                        'probability',
                        e.target.value as 'Low' | 'Medium' | 'High'
                      )
                    }
                  >
                    <option value='Low'>Low</option>
                    <option value='Medium'>Medium</option>
                    <option value='High'>High</option>
                  </select>
                </div>
              </div>

              <div className='grid-2'>
                <div>
                  <label>Type</label>
                  <input
                    value={risk.type}
                    onChange={(e) => handleUpdateField(index, 'type', e.target.value)}
                  />
                </div>
                <div>
                  <label>Responsible</label>
                  <input
                    value={risk.responsibleUserName}
                    onChange={(e) =>
                      handleUpdateField(index, 'responsibleUserName', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className='grid-2'>
                <div>
                  <label>Due Date</label>
                  <input
                    type='date'
                    value={risk.dueDate}
                    onChange={(e) => handleUpdateField(index, 'dueDate', e.target.value)}
                  />
                </div>
                <div className='approve-btn-wrapper'>
                  <button className='approve-btn' onClick={() => onApprove(risk)}>
                    ✅ Approve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='modal-actions'>
          <button className='btn btn-secondary' onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuggestedRisksModal;
