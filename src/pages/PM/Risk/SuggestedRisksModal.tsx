import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './SuggestedRisksModal.css';
import {
  useGetAiSuggestedRisksQuery,
  useLazyGetAiSuggestedRisksQuery,
} from '../../../services/riskApi';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';

interface SuggestedRisk {
  id: number;
  title: string;
  description: string;
  impactLevel: 'Low' | 'Medium' | 'High';
  probability: 'Low' | 'Medium' | 'High';
  type: string;
  mitigationPlan: string;
  contingencyPlan: string;
  approved?: boolean;
}

interface Props {
  onClose: () => void;
  onApprove: (risk: any) => void;
  // onApprove: (risk: SuggestedRisk) => void;
}

const SuggestedRisksModal: React.FC<Props> = ({ onClose, onApprove }) => {
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';

  const [isReloading, setIsReloading] = useState(false);

  // const { data, isLoading } = useGetAiSuggestedRisksQuery(projectKey);
  const [trigger, { data, isLoading }] = useLazyGetAiSuggestedRisksQuery();
  const [suggestedRisks, setSuggestedRisks] = useState<SuggestedRisk[]>([]);
  const { data: categoryData, isLoading: isCategoryLoading } =
    useGetCategoriesByGroupQuery('risk_type');
  const riskTypes = categoryData?.data || [];

  useEffect(() => {
    trigger(projectKey);
  }, [projectKey]);

  const handleReload = async () => {
    setIsReloading(true);
    await trigger(projectKey).unwrap();
    setIsReloading(false);
  };

  useEffect(() => {
    if (data?.data) {
      const mapped = data.data.map((item, idx) => ({
        id: idx + 1,
        title: item.title,
        description: item.description,
        impactLevel: item.impactLevel as 'Low' | 'Medium' | 'High',
        probability: item.probability as 'Low' | 'Medium' | 'High',
        type: item.type,
        mitigationPlan: item.mitigationPlan,
        contingencyPlan: item.contingencyPlan,
      }));
      setSuggestedRisks(mapped);
    }
  }, [data]);

  const handleUpdateField = <K extends keyof SuggestedRisk>(
    index: number,
    field: K,
    value: SuggestedRisk[K]
  ) => {
    const updated = [...suggestedRisks];
    updated[index][field] = value;
    setSuggestedRisks(updated);
  };

  // const handleApprove = (risk: any) => {
  //   onApprove({
  //     title: risk.title,
  //     description: risk.description,
  //     impactLevel: risk.impactLevel,
  //     probability: risk.probability,
  //     type: risk.type,
  //     mitigationPlan: risk.mitigationPlan,
  //     contingencyPlan: risk.contingencyPlan,
  //   });
  // };

  const handleApprove = (risk: SuggestedRisk, index: number) => {
    onApprove({
      title: risk.title,
      description: risk.description,
      impactLevel: risk.impactLevel,
      probability: risk.probability,
      type: risk.type,
      mitigationPlan: risk.mitigationPlan,
      contingencyPlan: risk.contingencyPlan,
    });

    const updated = [...suggestedRisks];
    updated[index].approved = true; // ✅ đánh dấu đã approved
    setSuggestedRisks(updated);
  };

  if (isLoading || isReloading) {
    return (
      <div className='suggested-modal-overlay'>
        <div className='suggested-modal'>
          <h2 className='modal-title'>AI Suggested Risks</h2>
          <div className='loading-container'>
            <div className='spinner' />
            <p>Loading AI suggestions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='suggested-modal-overlay'>
      <div className='suggested-modal'>
        <div className='modal-header'>
          <h2 className='modal-title'>AI Suggested Risks</h2>
          <button className='refresh-btn' onClick={handleReload} disabled={isReloading}>
            ↻ Gọi lại AI
          </button>
        </div>
        <div className='suggested-risk-list'>
          {suggestedRisks.map((risk, index) => (
            <div key={risk.id} className='suggested-risk-card'>
              <div>
                <label>Title</label>
                <input
                  className='modal-input'
                  value={risk.title}
                  onChange={(e) => handleUpdateField(index, 'title', e.target.value)}
                />
              </div>
              <div>
                <label>Description</label>
                <textarea
                  className='modal-textarea'
                  value={risk.description}
                  onChange={(e) => handleUpdateField(index, 'description', e.target.value)}
                />
              </div>

              <div className='grid-2'>
                <div>
                  <label>Impact</label>
                  <select
                    value={risk.impactLevel}
                    onChange={(e) =>
                      handleUpdateField(
                        index,
                        'impactLevel',
                        e.target.value as SuggestedRisk['impactLevel']
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
                        e.target.value as SuggestedRisk['probability']
                      )
                    }
                  >
                    <option value='Low'>Low</option>
                    <option value='Medium'>Medium</option>
                    <option value='High'>High</option>
                  </select>
                </div>
              </div>

              <div>
                <label>Type</label>
                {/* <input
                  className='modal-input'
                  value={risk.type}
                  onChange={(e) => handleUpdateField(index, 'type', e.target.value)}
                /> */}
                <select
                  className='modal-input'
                  value={risk.type}
                  style={{ cursor: 'pointer' }}
                  onChange={(e) => handleUpdateField(index, 'type', e.target.value)}
                >
                  {riskTypes.map((type: any) => (
                    <option key={type.id} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Mitigation Plan</label>
                <textarea
                  className='modal-textarea'
                  value={risk.mitigationPlan}
                  onChange={(e) => handleUpdateField(index, 'mitigationPlan', e.target.value)}
                />
              </div>
              <div>
                <label>Contingency Plan</label>
                <textarea
                  className='modal-textarea'
                  value={risk.contingencyPlan}
                  onChange={(e) => handleUpdateField(index, 'contingencyPlan', e.target.value)}
                />
              </div>

              <div className='approve-btn-wrapper'>
                {/* <button className='approve-btn' onClick={() => handleApprove(risk)}>
                  ✅ Approve
                </button> */}
                <button
                  className='approve-btn'
                  onClick={() => handleApprove(risk, index)}
                  disabled={risk.approved}
                >
                  {risk.approved ? '✔ Approved' : '✅ Approve'}
                </button>
                
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
