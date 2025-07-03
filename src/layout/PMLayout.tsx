// import { Outlet } from 'react-router-dom';
// import Header from '../components/Header';
// import Sidebar from '../components/Sidebar/Sidebar';

// const PMLayout = () => (
//   <>
//     <Header/>
//     <div className='flex h-screen  mt-10'>
//       <Sidebar />
//       <div className='flex-1 ml-56 '>
//         <Outlet />
//       </div>
//     </div>
//   </>
// );

// export default PMLayout;
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar/Sidebar';

const PMLayout = () => (
  <>
    <Header />
    <div className='flex flex-col h-screen'>
      <div className='flex flex-1 overflow-hidden'>
        <div className='hidden md:block w-56'>
          <Sidebar />
        </div>
        <main className='flex-1 mt-4 sm:mt-6 md:mt-10 lg:mt-12 overflow-auto'>
          <Outlet />
        </main>
      </div>
    </div>
  </>
);

export default PMLayout;
