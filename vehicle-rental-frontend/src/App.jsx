import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Route, Routes } from 'react-router-dom';
import AppShell from './layouts/AppShell';
import AuthShell from './layouts/AuthShell';
import ProtectedRoute from './components/common/ProtectedRoute';
import { clearSession, fetchCurrentUser, setInitialized, setSession } from './features/auth/authSlice';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import BookingDetailPage from './pages/account/BookingDetailPage';
import CheckoutPage from './pages/account/CheckoutPage';
import CustomerBookingsPage from './pages/account/CustomerBookingsPage';
import ProfilePage from './pages/account/ProfilePage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminVehiclesPage from './pages/admin/AdminVehiclesPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HostBookingsPage from './pages/host/HostBookingsPage';
import HostDashboardPage from './pages/host/HostDashboardPage';
import HostEarningsPage from './pages/host/HostEarningsPage';
import HostVehicleEditorPage from './pages/host/HostVehicleEditorPage';
import HostVehiclesPage from './pages/host/HostVehiclesPage';
import NotFoundPage from './pages/NotFoundPage';
import HomePage from './pages/public/HomePage';
import VehicleDetailPage from './pages/public/VehicleDetailPage';

function SessionBootstrap() {
  const dispatch = useAppDispatch();
  const { accessToken, initialized, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!initialized && accessToken && !user) {
      dispatch(fetchCurrentUser());
      return;
    }

    if (!initialized && !accessToken) {
      dispatch(setInitialized(true));
    }
  }, [accessToken, dispatch, initialized, user]);

  useEffect(() => {
    const handleExpired = () => dispatch(clearSession());
    const handleRefreshed = (event) => dispatch(setSession(event.detail));

    window.addEventListener('auth:expired', handleExpired);
    window.addEventListener('auth:session-refreshed', handleRefreshed);

    return () => {
      window.removeEventListener('auth:expired', handleExpired);
      window.removeEventListener('auth:session-refreshed', handleRefreshed);
    };
  }, [dispatch]);

  return null;
}

export default function App() {
  return (
    <>
      <SessionBootstrap />
      <Toaster
        position="top-right"
        gutter={10}
        toastOptions={{
          duration: 3800,
          style: {
            fontFamily: 'var(--font-body, "DM Sans", sans-serif)',
            fontSize: '0.9rem',
            fontWeight: 500,
            borderRadius: '12px',
            padding: '0',
            margin: '0',
            boxShadow: 'none',
            background: 'transparent',
            color: 'inherit',
            maxWidth: '380px',
          },
          success: {
            style: {
              background: 'linear-gradient(135deg, rgba(5, 46, 22, 0.97) 0%, rgba(6, 55, 25, 0.95) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.35)',
              borderLeft: '4px solid #22c55e',
              color: '#dcfce7',
              borderRadius: '12px',
              padding: '0.85rem 1.1rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(34,197,94,0.1), 0 4px 16px rgba(34,197,94,0.15)',
              backdropFilter: 'blur(16px)',
              fontWeight: 500,
              fontSize: '0.9rem',
              maxWidth: '380px',
            },
            iconTheme: {
              primary: '#22c55e',
              secondary: 'rgba(5, 46, 22, 0.97)',
            },
          },
          error: {
            style: {
              background: 'linear-gradient(135deg, rgba(69, 10, 10, 0.97) 0%, rgba(80, 12, 12, 0.95) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderLeft: '4px solid #ef4444',
              color: '#fee2e2',
              borderRadius: '12px',
              padding: '0.85rem 1.1rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(239,68,68,0.1), 0 4px 16px rgba(239,68,68,0.18)',
              backdropFilter: 'blur(16px)',
              fontWeight: 500,
              fontSize: '0.9rem',
              maxWidth: '380px',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: 'rgba(69, 10, 10, 0.97)',
            },
          },
          loading: {
            style: {
              background: 'linear-gradient(135deg, rgba(8, 15, 29, 0.97) 0%, rgba(15, 23, 42, 0.95) 100%)',
              border: '1px solid rgba(201, 184, 50, 0.3)',
              borderLeft: '4px solid #c9b832',
              color: '#f1f5f9',
              borderRadius: '12px',
              padding: '0.85rem 1.1rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 4px 16px rgba(201,184,50,0.1)',
              backdropFilter: 'blur(16px)',
              fontWeight: 500,
              fontSize: '0.9rem',
              maxWidth: '380px',
            },
            iconTheme: {
              primary: '#c9b832',
              secondary: 'rgba(8, 15, 29, 0.97)',
            },
          },
        }}
      />
      <Routes>
        {/* Auth routes — no navbar/footer */}
        <Route element={<AuthShell />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        {/* Main app routes — with navbar/footer */}
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute roles={['customer']}><CustomerBookingsPage /></ProtectedRoute>} />
          <Route path="/bookings/:id" element={<ProtectedRoute><BookingDetailPage /></ProtectedRoute>} />
          <Route path="/checkout/:bookingId" element={<ProtectedRoute roles={['customer']}><CheckoutPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
          <Route path="/admin/vehicles" element={<ProtectedRoute roles={['admin']}><AdminVehiclesPage /></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute roles={['admin']}><AdminBookingsPage /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute roles={['admin']}><AdminCategoriesPage /></ProtectedRoute>} />
          <Route path="/host" element={<ProtectedRoute roles={['host']}><HostDashboardPage /></ProtectedRoute>} />
          <Route path="/host/vehicles" element={<ProtectedRoute roles={['host']}><HostVehiclesPage /></ProtectedRoute>} />
          <Route path="/host/vehicles/new" element={<ProtectedRoute roles={['host']}><HostVehicleEditorPage /></ProtectedRoute>} />
          <Route path="/host/vehicles/:id/edit" element={<ProtectedRoute roles={['host']}><HostVehicleEditorPage /></ProtectedRoute>} />
          <Route path="/host/bookings" element={<ProtectedRoute roles={['host']}><HostBookingsPage /></ProtectedRoute>} />
          <Route path="/host/earnings" element={<ProtectedRoute roles={['host']}><HostEarningsPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}
