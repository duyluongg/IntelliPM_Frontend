import { useEffect } from "react";

interface HelpCirclePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpCirclePopup({ isOpen, onClose }: HelpCirclePopupProps) {
  // Đóng popup khi bấm phím ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[500px] p-6 rounded-2xl shadow-xl relative">
        {/* Header */}
        <h2 className="text-xl font-bold mb-3">🌟 About IntelliPM</h2>

        {/* Nội dung */}
        <p className="text-gray-700 text-sm leading-relaxed">
          <strong>IntelliPM</strong> is an intelligent project management system
          designed to help teams collaborate more effectively. The platform provides
          tools for task management, workload distribution, progress tracking, and
          visual reporting.
          <br />
          <br />
          The goal of IntelliPM is to empower{" "}
          <span className="font-semibold">businesses and teams</span> to increase
          productivity, reduce risks, and achieve results faster through a modern
          and user-friendly working environment.
        </p>

        {/* Liên hệ */}
        <div className="mt-5 p-3 bg-gray-50 border rounded-lg text-sm text-gray-700">
          📩 <span className="font-semibold">Contact us:</span>{" "}
          <a
            href="mailto:intellipm.official@gmail.com"
            className="text-blue-600 hover:underline"
          >
            intellipm.official@gmail.com
          </a>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
