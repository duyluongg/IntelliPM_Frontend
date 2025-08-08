// components/RequestFormModal.tsx
import React, { useState } from 'react';
import { useCreateDocumentRequestMeetingMutation } from '../../../../services/ProjectManagement/MeetingServices/documentRequestMeetingApi'
import { useAuth } from '../../../../services/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  feedbackId: number;
  projectManagerId: number;
}

const RequestFormModal: React.FC<Props> = ({ isOpen, onClose, feedbackId, projectManagerId }) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [reason, setReason] = useState('');
  const [createRequest, { isLoading }] = useCreateDocumentRequestMeetingMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !reason) return alert('Vui lòng điền đầy đủ');

    try {
      await createRequest({
        file,
        reason,
        status: 'PENDING',
        teamLeaderId: user?.id!,
        projectManagerId,
        feedbackId,
      }).unwrap();
      alert('Gửi yêu cầu thành công');
      onClose();
    } catch (error) {
      alert('Gửi thất bại');
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-lg space-y-4"
      >
        <h2 className="text-xl font-bold">Tạo yêu cầu gửi tài liệu</h2>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Nhập lý do"
          className="w-full border p-2 rounded"
          required
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? 'Đang gửi...' : 'Gửi'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestFormModal;
