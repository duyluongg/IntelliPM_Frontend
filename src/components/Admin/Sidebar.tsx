import {
  Home,
  Users,
  AlertTriangle,
  Rocket,
  LogOut,
  BarChart2,
  Settings,
  UserPlus,
  FolderOpen,
  Bot,
  TrendingUp,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../services/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
}

const menuItems = [
  { icon: <Home className='w-5 h-5' />, label: 'Dashboard', path: '/admin' },
  { icon: <Users className='w-5 h-5' />, label: 'Members', path: '/admin/members' },
  { icon: <Rocket className='w-5 h-5' />, label: 'Projects', path: '/admin/projects' },
  //{ icon: <AlertTriangle className='w-5 h-5' />, label: 'Risks', path: '/admin/risks' },
  { icon: <TrendingUp className='w-5 h-5' />, label: 'Reports', path: '/admin/reports' },
  // { icon: <BarChart2 className='w-5 h-5' />, label: 'Analytics', path: '/admin/analytics' },
  { icon: <UserPlus className='w-5 h-5' />, label: 'Register Member', path: '/admin/register-members' },
  { icon: <Settings className='w-5 h-5' />, label: 'Configurations', path: '/admin/configurations' },
  { icon: <FolderOpen className='w-5 h-5' />, label: 'Categories', path: '/admin/categories' },
  { icon: <Bot className='w-5 h-5' />, label: 'AI Responses', path: '/admin/ai-responses' },
];

export default function Sidebar({ isCollapsed }: SidebarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      initial={{ width: isCollapsed ? 60 : 200 }}
      animate={{ width: isCollapsed ? 60 : 200 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`h-screen border-r bg-gradient-to-b from-white to-gray-50 flex flex-col justify-between fixed top-0 left-0 z-10 shadow-lg ${
        isCollapsed ? 'w-16' : 'w-44'
      }`}
    >
      <div className='pt-4'>
        {menuItems.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
            transition={{ duration: 0.2 }}
          >
            <Link
              to={item.path || '#'}
              className='flex items-center justify-start px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer transition-colors duration-200 no-underline space-x-2'
            >
              {item.icon}
              {!isCollapsed && <span className='font-medium text-sm'>{item.label}</span>}
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
        transition={{ duration: 0.2 }}
        onClick={handleLogout}
        className='text-sm text-gray-600 px-3 py-2 border-t border-gray-200 hover:bg-red-50 cursor-pointer flex items-center space-x-2'
      >
        <LogOut className='w-4 h-4 text-red-500' />
        {!isCollapsed && <span className='font-medium text-sm'>Sign out</span>}
      </motion.div>
    </motion.aside>
  );
}
