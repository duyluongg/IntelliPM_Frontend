import { XMarkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonClass?: string;
  cancelButtonClass?: string;
  onConfirm: () => void;
  onClose: () => void;
  additionalActions?: {
    label: string;
    className?: string;
    onClick: () => void;
  }[];
}

export default function ConfirmModal({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  icon = <ExclamationTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />,
  confirmButtonText = "OK",
  cancelButtonText = "Cancel",
  confirmButtonClass = "px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 transition",
  cancelButtonClass = "px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition",
  onConfirm,
  onClose,
  additionalActions = [],
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-60 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal box */}
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md p-6 z-10 transform -translate-y-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3">
          {icon}
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-gray-600 text-sm">{message}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          {additionalActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={action.className || "px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"}
            >
              {action.label}
            </button>
          ))}
          <button
            onClick={onClose}
            className={cancelButtonClass}
          >
            {cancelButtonText}
          </button>
          <button
            onClick={onConfirm}
            className={confirmButtonClass}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}