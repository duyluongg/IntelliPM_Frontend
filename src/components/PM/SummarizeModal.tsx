
import { Clipboard, X } from 'lucide-react';

export default function SummarizeModal({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-md shadow-lg p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <span className="text-sm">📝</span>
            <span className="text-sm">Summarize</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Message */}
        <div className="bg-gray-100 p-3 rounded text-sm text-gray-700">
          {message}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => navigator.clipboard.writeText(message)}
            className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 flex items-center gap-1"
          >
            <Clipboard size={14} /> Copy
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="text-sm text-gray-600 hover:underline"
            >
              Cancelllllll
            </button>
            <button
              disabled
              className="text-sm bg-gray-200 text-gray-400 px-3 py-1 rounded cursor-not-allowed"
            >
              + Add to doc
            </button>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-xs text-gray-500 mt-4">
          AI generated content may be inaccurate, make sure to review it
        </div>
      </div>
    </div>
  );
}
