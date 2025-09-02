import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import PMLayout from './PMLayout';
import AdminLayout from './AdminLayout';

const LayoutSwitch = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'CLIENT') {
    return (
      <PMLayout>
        <Outlet />
      </PMLayout>
    );
  }
  if (user.role === 'ADMIN') {
    return (
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    );
  }

  return (
    <PMLayout>
      <Outlet />
    </PMLayout>
  );
};

export default LayoutSwitch;

