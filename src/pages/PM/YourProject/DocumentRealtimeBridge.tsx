// src/components/realtime/DocumentRealtimeBridge.tsx
import { useEffect, useRef } from 'react';
import type { HubConnection } from '@microsoft/signalr';
import { getDocumentHub } from '../../../services/SignalR/signalRViewEdit';

type Props = {
  documentId: number;
  onPermissionChanged?: (payload: { documentId: number }) => void;
  onDocumentUpdated?: (payload: { documentId: number }) => void;
};

export default function DocumentRealtimeBridge({
  documentId,
  onPermissionChanged,
  onDocumentUpdated,
}: Props) {
  const connRef = useRef<HubConnection | null>(null);
  const docGroup = `document-${documentId}`;

  useEffect(() => {
    const connection = getDocumentHub();
    connRef.current = connection;

    let stopped = false;

    async function start() {
      try {
        if (connection.state === 'Disconnected') {
          await connection.start();
        }
        await connection.invoke('JoinDocumentGroup', documentId);

        // Lắng nghe sự kiện cập nhật quyền
        connection.on('PermissionChanged', (changedDocId: number) => {
          if (changedDocId === documentId) {
            onPermissionChanged?.({ documentId: changedDocId });
          }
        });

        // (tuỳ chọn) Lắng nghe cập nhật nội dung
        connection.on(
          'DocumentUpdated',
          (payload: { documentId: number; updatedAt?: string; updatedBy?: number }) => {
            if (payload.documentId !== documentId) return;
            // Bỏ qua nếu là chính mình
            // (giả sử user?.id là id hiện tại)
            if (payload.updatedBy && payload.updatedBy === (window as any).__currentUserId) return;

            onDocumentUpdated?.({ documentId: payload.documentId });
          }
        );
      } catch (err) {
        // Auto-retry thô sơ nếu start lỗi (network, server chưa sẵn sàng)
        if (!stopped) setTimeout(start, 1500);
        // eslint-disable-next-line no-console
        console.error('[SignalR] start error:', err);
      }
    }

    start();

    return () => {
      stopped = true;
      // Gỡ listener để tránh đăng ký trùng
      connection.off('PermissionChanged');
      connection.off('DocumentUpdated');

      // Rời group (không bắt buộc, nhưng nên làm)
      connection.invoke('LeaveDocumentGroup', documentId).catch(() => {
        /* ignore */
      });
      // Không stop hẳn connection để tái dùng socket giữa các màn
      // Nếu muốn stop hoàn toàn, dùng: connection.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docGroup]); // thay đổi khi documentId đổi

  return null; // Component "cầu nối" không render UI
}
