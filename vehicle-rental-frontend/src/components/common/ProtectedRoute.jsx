import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import Spinner from './Spinner';

export default function ProtectedRoute({ children, roles = [] }) {
  const location = useLocation();
  const { initialized, isAuthenticated, user, status } = useAppSelector((state) => state.auth);

  if (!initialized || status === 'loading') {
    return <Spinner fullScreen label="Restoring your session..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles.length> 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
