import { Outlet } from 'react-router-dom';
import SidebarPM from '../components/PM/sildebarPM';
import Header from '../components/Header';

const PMLayout = () => (
  <>
    <Header/>
    <div className='flex h-screen  mt-10'>
      <SidebarPM />
      <div className='flex-1 overflow-auto'>
        <Outlet />
      </div>
    </div>
  </>
);

export default PMLayout;
