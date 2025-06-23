import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';

const menuItems = [
  { icon: <UserCircle className='w-5 h-5' />, label: 'For you' },
  { icon: <Clock className='w-5 h-5' />, label: 'Recent', hasArrow: true },
  { icon: <Star className='w-5 h-5' />, label: 'Starred', hasArrow: true },
  { icon: <AppWindow className='w-5 h-5' />, label: 'Apps' },
  { icon: <LayoutPanelTop className='w-5 h-5' />, label: 'Plans' },
  // { icon: <Rocket className='w-5 h-5' />, label: 'Projects' },
  {
    icon: <Rocket className='w-5 h-5' />,
    label: 'Projects',
    hasArrow: true,
    children: [
      { label: 'Project 1', route: '/gantt-chart' },
      { label: 'Project 2' },
      { label: 'Project 3' },
    ],
  },
  { icon: <Users className='w-5 h-5' />, label: 'Teams' },
  { icon: <MoreHorizontal className='w-5 h-5' />, label: 'More' },
];

export default function Sidebar() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  const toggleSubmenu = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // return (
  //   <aside className='w-56 h-screen border-r bg-white flex flex-col justify-between'>
  //     <div className='pt-4'>
  //       {menuItems.map((item, index) => (
  //         <div
  //           key={index}
  //           className='flex items-center justify-between px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer transition-colors'
  //         >
  //           <div className='flex items-center space-x-2'>
  //             {item.icon}
  //             <span>{item.label}</span>
  //           </div>
  //           {item.hasArrow && <ChevronRight className='w-4 h-4 text-gray-400' />}
  //         </div>
  //       ))}
  //     </div>

  //     <div className='text-sm text-gray-600 px-4 py-3 border-t border-gray-200 hover:bg-gray-50 cursor-pointer flex items-center space-x-2'>
  //       <LogOut className='w-4 h-4 text-red-500' />
  //       <button>Sign out</button>
  //     </div>
  //   </aside>
  // );

  return (
    <aside className='w-56 h-screen border-r bg-white flex flex-col justify-between'>
      <div className='pt-4'>
        {menuItems.map((item, index) => (
          <div key={index}>
            <div
              className='flex items-center justify-between px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer transition-colors'
              onClick={() => item.children ? toggleSubmenu(index) : null}
            >
              <div className='flex items-center space-x-2'>
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.hasArrow && (
                <ChevronRight
                  className={`w-4 h-4 text-gray-400 transform transition-transform ${
                    openIndex === index ? 'rotate-90' : ''
                  }`}
                />
              )}
            </div>

            {/* Submenu */}
            {item.children && openIndex === index && (
              <div className='ml-8 space-y-1 text-gray-600 text-sm'>
                {item.children.map((child, childIdx) => (
                  <div
                    key={childIdx}
                    className='py-1 cursor-pointer hover:text-black'
                    onClick={() => {
                      if (child.route) {
                        navigate(child.route);
                      }
                    }}
                  >
                    {child.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className='text-sm text-gray-600 px-4 py-3 border-t border-gray-200 hover:bg-gray-50 cursor-pointer flex items-center space-x-2'>
        <LogOut className='w-4 h-4 text-red-500' />
        <button>Sign out</button>
      </div>
    </aside>
  );
}
