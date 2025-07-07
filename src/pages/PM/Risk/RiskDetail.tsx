import React from 'react';
import './RiskDetail.css';
import { Check } from 'lucide-react';

interface Risk {
  id: number;
  title: string;
  description?: string;
  impactLevel?: 'Low' | 'Medium' | 'High';
  probability?: 'Low' | 'Medium' | 'High';
  severityLevel?: 'Low' | 'Medium' | 'High';
  status?: string;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
  responsibleFullName?: string;
  responsibleUserName?: string;
  responsiblePicture?: string;
  resolution?: string;
}

interface RiskDetailProps {
  risk: Risk;
  onClose: () => void;
}

function calculateSeverityLevel(risk: any): string {
  const levels: Record<'Low' | 'Medium' | 'High', number> = { Low: 1, Medium: 2, High: 3 };

  const i = levels[risk.impactLevel as 'Low' | 'Medium' | 'High'] || 0;
  const p = levels[risk.probability as 'Low' | 'Medium' | 'High'] || 0;

  const score = i * p;

  if (score >= 6) return 'High';
  if (score >= 3) return 'Medium';
  return 'Low';
}

function calculateSeverityColor(risk: any): string {
  const level = calculateSeverityLevel(risk);
  switch (level) {
    case 'High':
      return 'high';
    case 'Medium':
      return 'medium';
    case 'Low':
    default:
      return 'low';
  }
}

const RiskDetail: React.FC<RiskDetailProps> = ({ risk, onClose }) => {
  return (
    <div className='risk-detail-container'>
      <div className='risk-detail-panel'>
        <div className='detail-header'>
          <div className='detail-title-section'>
            <div className='risk-path'>
              IT Project Plan / <span className='risk-code'>I-{risk.id}</span>
            </div>
            <div className='title-and-status'>
              <h2 className='risk-title'>{risk.title}</h2>
              <div className='status-checkbox'>
                <div className={`checkbox-icon ${risk.status === 'CLOSED' ? 'checked' : ''}`}>
                  {risk.status === 'CLOSED' && <Check size={14} strokeWidth={3} />}
                </div>
                <span className='status-label'>{risk.status === 'CLOSED' ? 'Closed' : 'Open'}</span>
              </div>
            </div>
          </div>
          <button className='close-btn' onClick={onClose}>
            ×
          </button>
        </div>

        <div className='detail-section-no-border'>
          <div className='section-label'>DESCRIPTION</div>
          <p className={`section-text ${!risk.description ? 'text-placeholder' : ''}`}>
            {risk.description || 'Add a description'}
          </p>
        </div>

        <div className='detail-section'>
          <div className='section-label'>TAGS</div>
          <button className='tag-add-btn'>+</button>
        </div>

        <div className='detail-section'>
          <div className='section-label'>RESOLUTION</div>
          <p className='section-text'>{risk.resolution || 'None'}</p>
        </div>

        <div className='detail-section triple-grid'>
          <div className='impactLikelihoodWrapper'>
            <div className='section-label'>IMPACT</div>
            <ul className='radio-button-list'>
              {['Low', 'Medium', 'High'].map((lvl) => (
                <li key={lvl}>
                  <label className={`radio-label ${risk.impactLevel === lvl ? 'checked' : ''}`}>
                    <input
                      type='radio'
                      name='impact'
                      value={lvl}
                      checked={risk.impactLevel === lvl}
                      readOnly
                    />
                    <span className='radio-icon'></span>
                    <span className='radio-value'>{lvl}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className='impactLikelihoodWrapper'>
            <div className='section-label'>LIKELIHOOD</div>
            <ul className='radio-button-list'>
              {['Low', 'Medium', 'High'].map((lvl) => (
                <li key={lvl}>
                  <label className={`radio-label ${risk.probability === lvl ? 'checked' : ''}`}>
                    <input
                      type='radio'
                      name='likelihood'
                      value={lvl}
                      checked={risk.probability === lvl}
                      readOnly
                    />
                    <span className='radio-icon'></span>
                    <span className='radio-value'>{lvl}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className='levelWrapper'>
            <div className='section-label'>LEVEL</div>
            <div className={`semi-gauge ${calculateSeverityColor(risk)}`}>
              <div className='gauge-text'>{calculateSeverityLevel(risk)}</div>
            </div>
          </div>
        </div>

        <div className='detail-section-no-border'>
          <div className='section-label'>Attachments</div>
          <div className='attachment-upload'>
            <div className='upload-box'>
              <div className='plus-icon'>＋</div>
              <div className='upload-text'>
                Drag and
                <br />
                drop or
                <br />
                <span className='upload-browse'>browse</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='risk-comments-panel'>
        <div className='comments-header'>COMMENTS</div>
        <div className='comments-body'>
          {/* {risk.comments && risk.comments.length > 0 ? (
            risk.comments.map((comment, idx) => (
              <div key={idx} className='comment-item'>
                <p>{comment}</p>
              </div>
            ))
          ) : (
            <p className='no-comments'>No comments</p>
          )} */}
        </div>
        <div className='comment-input'>
          <input type='text' placeholder='Add a comment' />
        </div>
      </div>
    </div>
  );
};

export default RiskDetail;
