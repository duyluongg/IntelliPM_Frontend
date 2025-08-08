import React from 'react';
import './SprintInfoPopup.css'; 

interface SprintInfoPopupProps {
  sprintId: number;
  sprintName: string;
  sprintGoal: string;
  startDate?: string;
  endDate?: string;
  sprintStatus: string;
  onClose: () => void;
}

const SprintInfoPopup: React.FC<SprintInfoPopupProps> = ({
  sprintId,
  sprintName,
  sprintGoal,
  startDate,
  endDate,
  sprintStatus,
  onClose,
}) => {
  return (
    <div className="modal-overlay">
      <div className="sprint-info-popup" onClick={(e) => e.stopPropagation()}>
        <h3>Sprint Information</h3>
        <div className="sprint-details">
          <p><strong>Sprint ID:</strong> {sprintId}</p>
          <p><strong>Name:</strong> {sprintName}</p>
          <p><strong>Goal:</strong> {sprintGoal || 'Not provided'}</p>
          <p><strong>Start Date:</strong> {startDate ? new Date(startDate).toLocaleDateString('en-GB') : 'Not provided'}</p>
          <p><strong>End Date:</strong> {endDate ? new Date(endDate).toLocaleDateString('en-GB') : 'Not provided'}</p>
          <p><strong>Status:</strong> {sprintStatus || 'Not provided'}</p>
        </div>
        <div className="button-group">
          <button onClick={onClose} className="btn-close">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SprintInfoPopup;