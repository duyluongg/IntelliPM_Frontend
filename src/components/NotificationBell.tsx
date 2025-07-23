import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import {
  useGetRecipientNotificationsByAccountIdQuery,
  useMarkAsReadMutation,
} from '../services/recipientNotificationApi';
import { useGetAllNotificationsQuery } from '../services/notificationApi';

interface NotificationBellProps {
  accountId: number;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ accountId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: recipientNotis, refetch } = useGetRecipientNotificationsByAccountIdQuery(accountId);
  const { data: allNotis, refetch: refetchNotis } = useGetAllNotificationsQuery();
  const [markAsRead] = useMarkAsReadMutation();

  const unreadCount = recipientNotis?.filter(n => !n.isRead).length || 0;

  const toggleDropdown = () => setIsOpen(prev => !prev);

  const handleMarkAsRead = async (notificationId: number) => {
    await markAsRead({ accountId, notificationId });
    refetch();
  };

  // Đóng dropdown khi click ra ngoài
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
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative p-2 hover:bg-gray-100 rounded-full transition duration-150"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center shadow">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white shadow-xl rounded-xl border z-50 max-h-96 overflow-auto animate-fade-in">
          <div className="p-4 text-lg font-semibold border-b border-gray-200 bg-gray-50 text-gray-800">
            🔔 Notification
          </div>

          {recipientNotis?.length === 0 ? (
            <div className="p-4 text-gray-500 text-sm">Không có thông báo nào.</div>
          ) : (
            recipientNotis?.map((recipient) => {
              const notification = allNotis?.find(n => n.id === recipient.notificationId);
              const isUnread = !recipient.isRead;

              return (
                <div
                  key={recipient.notificationId}
                  onClick={() => handleMarkAsRead(recipient.notificationId)}
                  className={`px-4 py-3 cursor-pointer border-b border-gray-100 transition duration-200 ${
                    isUnread ? 'bg-gray-100 hover:bg-gray-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`text-sm ${isUnread ? 'font-semibold text-gray-800' : 'text-gray-700'}`}>
                    {notification?.createdByName}:
                    <span className="ml-1">{notification?.message ?? 'New notification'}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
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
