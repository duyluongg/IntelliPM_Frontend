import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import {
  useGetRecipientNotificationsByAccountIdQuery,
  useMarkAsReadMutation,
} from '../services/recipientNotificationApi';
import { useGetAllNotificationsQuery } from '../services/notificationApi';
import { connection } from '../services/SignalR/signalRConnection';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useParams } from 'react-router-dom';

interface NotificationBellProps {
  accountId: number;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ accountId }) => {
  const [searchParams] = useSearchParams();
  // const { projectKey: paramProjectKey } = useParams();
  // const queryProjectKey = searchParams.get('projectKey');
  // const projectKey = paramProjectKey || queryProjectKey || 'NotFound';

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data: recipientNotis, refetch } = useGetRecipientNotificationsByAccountIdQuery(accountId);
  const { data: allNotis, refetch: refetchNotis } = useGetAllNotificationsQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const unreadCount = recipientNotis?.filter((n) => !n.isRead).length || 0;
  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const handleMarkAsRead = async (notificationId: number) => {
    await markAsRead({ accountId, notificationId });
    refetch();
  };

  const handleNotificationClick = async (recipientId: number, message: string) => {
    await handleMarkAsRead(recipientId);
    console.log('Notification message:', message);

    const projectMatch = message.match(/project (\w+)/i);
    const taskMatch = message.match(/task (\w+-\d+)/i);
    const subtaskMatch = message.match(/subtask (\w+-\d+)/i);
    const epicMatch = message.match(/epic (\w+-\d+)/i);
    const riskMatch = message.match(/risk\s+([A-Z0-9]+-[A-Z0-9]+)/i);

    const projectKey = projectMatch?.[1];
    console.log('✅ projectKey:', projectKey);
    console.log('Parsed matches:');
    console.log('Task:', taskMatch?.[1]);
    console.log('Subtask:', subtaskMatch?.[1]);
    console.log('Epic:', epicMatch?.[1]);
    console.log('Risk:', riskMatch?.[1]);

    console.log('Final navigation link:', `/project/${projectKey}/risk/${riskMatch?.[1]}`);
    console.log('Params:', { projectKey, riskKey: riskMatch?.[1] });

    if (subtaskMatch?.[1]) {
      navigate(`/project/${projectKey}/child-work/${subtaskMatch[1]}`);
    } else if (epicMatch?.[1]) {
      navigate(`/project/epic/${epicMatch[1]}`);
    } else if (taskMatch?.[1]) {
      navigate(`/project/${projectKey}/work-item-detail?taskId=${taskMatch[1]}`);
    } else if (riskMatch?.[1]) {
      navigate(`/project/${projectKey}/risk/${riskMatch[1]}`);
    }
  };

  useEffect(() => {
    if (!accountId) return;

    if (connection.state === 'Disconnected') {
      connection
        .start()
        .then(() => {
          console.log('✅ SignalR connected (Bell)');
          return connection.invoke('JoinNotificationGroup', accountId.toString());
        })
        .then(() => {
          console.log('📡 Joined notification group:', accountId);
        })
        .catch((err) => console.error('❌ SignalR connection error (Bell):', err));
    }

    connection.on('ReceiveNotification', (message) => {
      console.log('🔔 Realtime notification received:', message);
      refetch();
      refetchNotis();
    });

    return () => {
      connection.off('ReceiveNotification');
      connection.stop();
    };
  }, [accountId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className='relative p-2 hover:bg-gray-100 rounded-full transition duration-150'
      >
        <Bell className='w-5 h-5 text-gray-700' />
        {unreadCount > 0 && (
          <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center shadow'>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className='absolute right-0 mt-2 w-96 bg-white shadow-xl rounded-xl border z-50 max-h-96 overflow-auto animate-fade-in'>
          <div className='p-4 text-lg font-semibold border-b border-gray-200 bg-gray-50 text-gray-800'>
            🔔 Notification
          </div>

          {recipientNotis?.length === 0 ? (
            <div className='p-4 text-gray-500 text-sm'>Không có thông báo nào.</div>
          ) : (
            recipientNotis?.map((recipient) => {
              const notification = allNotis?.find((n) => n.id === recipient.notificationId);
              const isUnread = !recipient.isRead;

              return (
                <div
                  key={recipient.notificationId}
                  onClick={async () => {
                    await handleMarkAsRead(recipient.notificationId);
                    handleNotificationClick(recipient.notificationId, notification?.message ?? '');
                  }}
                  className={`px-4 py-3 cursor-pointer border-b border-gray-100 transition duration-200 ${
                    isUnread ? 'bg-gray-100 hover:bg-gray-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`text-sm ${
                      isUnread ? 'font-semibold text-gray-800' : 'text-gray-700'
                    }`}
                  >
                    {notification?.createdByName}:
                    <span className='ml-1'>{notification?.message ?? 'New notification'}</span>
                  </div>
                  <div className='text-xs text-gray-400 mt-1'>
                    {new Date(recipient.createdAt).toLocaleString()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
