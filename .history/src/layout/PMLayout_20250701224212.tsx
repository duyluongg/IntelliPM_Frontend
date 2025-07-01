import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar/Sidebar';

const PMLayout = () => (
  <>
    <Header/>
    <div className='flex h-screen  mt-10'>
      <Sidebar />
      <div className='flex-1 '>
        <Outlet />
      </div>
    </div>
  </>
);

export default PMLayout;
