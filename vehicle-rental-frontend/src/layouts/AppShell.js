import { Outlet } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';
import PendingHostBanner from '../components/layout/PendingHostBanner';

export default function AppShell() {
  return (
    <div
      className="app-shell"
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <Navbar />
      <PendingHostBanner />
      <main className="app-shell__main" style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}