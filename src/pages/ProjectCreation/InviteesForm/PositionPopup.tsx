import React from 'react';
import { X, BriefcaseBusiness } from 'lucide-react';

interface Invitee {
  email: string;
  role: string;
  positions: string[];
}

interface Position {
  id: number;
  name: string;
  label: string;
}

interface PositionPopupProps {
  invitee: Invitee;
  positionData?: Position[];
  isPositionLoading: boolean;
  newPosition: string;
  setNewPosition: (position: string) => void;
  handleAddPosition: (email: string, position: string) => void;
  handleRemovePosition: (email: string, position: string) => void;
  getFullnameFromEmail: (email: string) => string;
  onClose: () => void;
}

const PositionPopup: React.FC<PositionPopupProps> = ({
  invitee,
  positionData,
  isPositionLoading,
  newPosition,
  setNewPosition,
  handleAddPosition,
  handleRemovePosition,
  getFullnameFromEmail,
  onClose,
}) => {
  // Function to format position strings: remove underscores and capitalize first letter of each word
  const formatPosition = (position: string) => {
    return position
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close position popup"
        >
          <X size={24} />
        </button>
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-[#1c73fd]">
            Manage Positions for {getFullnameFromEmail(invitee.email)}
          </h4>
          <div className="space-y-4">
            <div className="flex gap-4">
              <select
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c73fd]/30 focus:border-[#1c73fd] transition-all text-sm"
              >
                <option value="">Select a position</option>
                {positionData?.map((pos) => (
                  <option key={pos.id} value={pos.name}>
                    {formatPosition(pos.label)}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleAddPosition(invitee.email, newPosition)}
                className="px-4 py-2.5 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-lg hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all shadow-md text-sm"
                disabled={!newPosition || isPositionLoading}
              >
                {isPositionLoading ? 'Loading...' : 'Add'}
              </button>
            </div>
            <div className="space-y-2">
              {invitee.positions.map((position) => (
                <div
                  key={position}
                  className="flex items-center justify-between bg-[#e6f0fd] px-4 py-2 rounded-lg hover:bg-[#d1e0f8] transition"
                >
                  <span className="text-[#1c73fd] text-sm">{formatPosition(position)}</span>
                  <button
                    onClick={() => handleRemovePosition(invitee.email, position)}
                    className="text-[#1c73fd] hover:text-[#155ac7] text-sm transition"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionPopup;
