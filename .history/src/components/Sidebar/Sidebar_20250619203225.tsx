import {
  UserCircle,
  Clock,
  Star,
  AppWindow,
  LayoutPanelTop,
  Rocket,
  Users,
  MoreHorizontal,
  ChevronRight,
  LogOut,
  Plus,
} from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { icon: <UserCircle className='w-5 h-5' />, label: 'For you' },
  { icon: <Clock className='w-5 h-5' />, label: 'Recent', hasArrow: true },
  { icon: <Star className='w-5 h-5' />, label: 'Starred', hasArrow: true },
  { icon: <AppWindow className='w-5 h-5' />, label: 'Apps' },
  { icon: <LayoutPanelTop className='w-5 h-5' />, label: 'Plans' },
  // Projects sẽ được xử lý riêng ở dưới
  { icon: <Users className='w-5 h-5' />, label: 'Teams' },
  { icon: <MoreHorizontal className='w-5 h-5' />, label: 'More' },
];

const recentProjects = [
  { name: 'My Kanban Project', icon: '🧠' },
  { name: 'SEP_Agile_Scrum', icon: '☁️' },
  { name: 'SEP_Project_Manage', icon: '🖼️' },
];

export default function Sidebar() {
  const [showProjects, setShowProjects] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <aside className='w-64 h-screen border-r bg-white flex flex-col justify-between'>
      <div className='pt-4'>
        {/* Các menu bình thường */}
        {menuItems.map((item, index) => (
          <div
            key={index}
            className='flex items-center justify-between px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer transition-colors'
          >
            <div className='flex items-center space-x-2'>
              {item.icon}
              <span>{item.label}</span>
            </div>
            {item.hasArrow && <ChevronRight className='w-4 h-4 text-gray-400' />}
          </div>
        ))}

        {/* Mục Projects */}
        <div
  className='relative group px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer transition-colors'
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
>
  <div className='flex items-center justify-between'>
    <div
      className='flex items-center space-x-2'
      onClick={() => setShowProjects(!showProjects)}
    >
      {/* 👇 Hiện mũi tên nếu hover hoặc đang mở, còn lại thì hiện icon Rocket */}
      {hovered || showProjects ? (
        <ChevronRight
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 transform ${
            showProjects ? 'rotate-90' : 'rotate-0'
          }`}
        />
      ) : (
        <Rocket className='w-5 h-5 text-gray-700' />
      )}

      <span>Projects</span>
    </div>

    {/* 👇 Nút ➕ và ⋯ sẽ hiển thị khi hover hoặc đang mở */}
    {(hovered || showProjects) && (
      <div className='flex items-center space-x-2'>
        <span title='New project'>
          <Plus className='w-4 h-4 hover:text-blue-500' />
        </span>
        <span title='Manage'>
          <MoreHorizontal className='w-4 h-4 hover:text-blue-500' />
        </span>
      </div>
    )}
  </div>

  {/* 📂 Danh sách project xổ xuống */}
  {showProjects && (
    <div className='mt-2 pl-6'>
      <div className='text-gray-500 text-xs mb-1'>Recent</div>
      {recentProjects.map((proj, i) => (
        <div
          key={i}
          className='flex items-center space-x-2 py-1 px-2 rounded hover:bg-gray-100 text-sm'
        >
          <span className='text-lg'>{proj.icon}</span>
          <span className='truncate'>{proj.name}</span>
        </div>
      ))}
    </div>
  )}
</div>


      {/* Sign out */}
      <div className='text-sm text-gray-600 px-4 py-3 border-t border-gray-200 hover:bg-gray-50 cursor-pointer flex items-center space-x-2'>
        <LogOut className='w-4 h-4 text-red-500' />
        <button>Sign out</button>
      </div>
    </aside>
  );
}
