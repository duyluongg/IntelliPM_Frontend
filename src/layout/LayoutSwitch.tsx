import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import PMLayout from './PMLayout';

const LayoutSwitch = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'CLIENT') {
    return <Outlet />; // CLIENT không có layout
  }

  return (
    <PMLayout>
      <Outlet />
    </PMLayout>
  );
};

export default LayoutSwitch;

