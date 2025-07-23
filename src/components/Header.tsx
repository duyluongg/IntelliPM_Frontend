import {
  Search, Plus, Bell, HelpCircle, Settings, AppWindow, PanelLeftClose,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { connection } from '../services/SignalR/signalRConnection';
import logo from '../assets/Logo_IntelliPM/Logo_NoText_NoBackgroud.png';
import textLogo from '../assets/Logo_IntelliPM/Text_IntelliPM_NoBackground.png';
import { useLazyGetNotificationsQuery } from '../services/Notification/notificationApi';

type Notification = {
  message: string;
  isRead: boolean;
  time: string;
};

export default function Header() {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsList, setNotifications] = useState<Notification[]>([]);
  const [fetchNotifications, { isLoading: isFetchingServer }] = useLazyGetNotificationsQuery();

  const notificationsRef = useRef(null);
  const isConnectedRef = useRef(false);

  const handleBellClick = async () => {
    setShowNotifications((prev) => !prev);

    if (!showNotifications) {
      try {
        const result = await fetchNotifications().unwrap();
        const formatted = result.map((n) => ({
          message: n.message,
          isRead: n.isRead,
          time: new Date(n.createdAt).toLocaleString(),
        }));
        setNotifications(formatted);
      } catch (error) {
        console.error('❌ Lỗi khi lấy thông báo từ server:', error);
      }
    }
  };

  useEffect(() => {
    if (!isConnectedRef.current && connection.state === 'Disconnected') {
      connection
        .start()
        .then(() => {
          isConnectedRef.current = true;
          if (user?.id) {
            connection.invoke('JoinNotificationGroup', user.id.toString()).catch(() => {});
          }

          connection.on('ReceiveNotification', (data: any) => {
            const newNoti: Notification = {
              message: data?.message || data?.Message || '📩 Bạn có thông báo mới',
              isRead: false,
              time: new Date().toLocaleString(),
            };
            setNotifications((prev) => [newNoti, ...prev]);
          });
        })
        .catch(() => {});
    }

    return () => {
      connection.off('ReceiveNotification');
      connection.stop();
      isConnectedRef.current = false;
    };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !(notificationsRef.current as any).contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const unreadCount = notificationsList.filter((n) => !n.isRead).length;

  return (
    <header className='w-full flex items-center justify-between p-1 bg-white border-b shadow-sm fixed top-0 left-0 right-0 z-40'>
      <div className='flex items-center space-x-2'>
        <button className='p-1 rounded hover:bg-gray-200'>
          <PanelLeftClose className='w-5 h-5 text-gray-700' />
        </button>
        <button className='p-1 rounded hover:bg-gray-200'>
          <AppWindow className='w-5 h-5 text-gray-700' />
        </button>
        <Link to='/' className='flex items-center gap-0 hover:opacity-80'>
          <img src={logo} className='h-10 w-auto scale-[1.2]' style={{ marginRight: '-8px' }} />
          <img src={textLogo} className='h-9 w-auto scale-[0.36]' />
        </Link>
      </div>

      <div className='flex-1 mx-4 flex items-center justify-center space-x-2'>
        <div className='relative flex-1 max-w-xs'>
          <Search className='absolute left-3 top-2.5 w-4 h-4 text-gray-500' />
          <input
            type='text'
            placeholder='Search'
            className='w-full pl-10 pr-4 py-1.5 border rounded-md border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>
        <button className='bg-blue-500 text-white flex items-center px-3 py-1.5 rounded-md text-sm hover:bg-blue-600'>
          <Plus className='w-4 h-4 mr-1' />
          <span className='hidden sm:inline'>Create</span>
        </button>
      </div>

      <div className='flex items-center space-x-2'>
        <button className='hidden md:flex border px-3 py-1.5 rounded-md text-sm items-center hover:bg-gray-100'>
          <span className='mr-1'>💬</span> Chat
        </button>

        <div className='relative' ref={notificationsRef}>
          <button
            onClick={handleBellClick}
            className='p-2 hover:bg-gray-100 rounded-full relative'
          >
            <Bell className='w-5 h-5 text-gray-700' />
            {unreadCount > 0 && (
              <span className='absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center'>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className='absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-xl overflow-hidden animate-fade-in'>
              <div className='flex justify-between items-center px-4 py-3 border-b bg-gray-50'>
                <h3 className='font-semibold text-gray-800'>Notifications</h3>
                <button
                  className='text-sm text-blue-600 hover:text-blue-800'
                  onClick={() =>
                    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
                  }
                >
                  Mark all as read
                </button>
              </div>
              <div className='max-h-80 overflow-y-auto'>
                {isFetchingServer ? (
                  <div className='p-4 text-center text-gray-500'>Đang tải thông báo...</div>
                ) : notificationsList.length === 0 ? (
                  <div className='p-4 text-center text-gray-500'>Không có thông báo nào.</div>
                ) : (
                  notificationsList.map((notification, idx) => (
                    <div
                      key={idx}
                      className={`px-4 py-3 border-b cursor-pointer ${
                        notification.isRead
                          ? 'bg-gray-50 text-gray-500'
                          : 'bg-white hover:bg-blue-50'
                      }`}
                    >
                      <p
                        className={`text-sm ${
                          notification.isRead ? 'text-gray-500' : 'font-medium text-gray-800'
                        }`}
                      >
                        {notification.message}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          notification.isRead ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {notification.time}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className='border-t p-2'>
                <Link
                  to='/notifications'
                  className='block w-full text-blue-600 text-sm py-2 text-center hover:bg-blue-50 rounded-md'
                >
                  View All Notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        <button className='p-2 hover:bg-gray-100 rounded-full'>
          <HelpCircle className='w-5 h-5 text-gray-700' />
        </button>
        <button className='p-2 hover:bg-gray-100 rounded-full'>
          <Settings className='w-5 h-5 text-gray-700' />
        </button>

        {user ? (
          <button className='w-8 h-8 bg-orange-500 text-white font-bold flex items-center justify-center rounded-full'>
            {user.username.slice(0, 2).toUpperCase()}
          </button>
        ) : (
          <Link to='/login'>
            <button className='px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700'>
              Login
            </button>
          </Link>
        )}
      </div>
    </header>
  );
}
