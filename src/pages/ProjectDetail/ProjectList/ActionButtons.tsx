import React from 'react';
import { Loader2 } from 'lucide-react';

interface ActionButtonsProps {
  memberStatus: string | undefined;
  isUpdating: boolean;
  isUpdateError: boolean;
  hasMemberId: boolean;
  onAcceptInvite: () => void;
  onClick: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  memberStatus,
  isUpdating,
  isUpdateError,
  hasMemberId,
  onAcceptInvite,
  onClick,
}) => {
  return (
    <div className="flex items-center gap-2">
      {memberStatus === 'INVITED' && (
        <div className="flex flex-col gap-2">
          <button
            onClick={onAcceptInvite}
            disabled={isUpdating || !hasMemberId}
            className={`px-4 py-2 rounded-xl text-sm transition-all duration-300 ${
              isUpdating || !hasMemberId
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isUpdating ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin w-4 h-4" /> Accepting...
              </span>
            ) : (
              'Accept Invite'
            )}
          </button>
          {isUpdateError && <p className="text-xs text-red-500">Failed to accept invite</p>}
        </div>
      )}
      <button
        onClick={onClick}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm transition-all duration-300"
      >
        Detail
      </button>
    </div>
  );
};

export default ActionButtons;
