import { Outlet } from 'react-router-dom';

/**
 * Standalone shell for auth pages — no Navbar, no Footer.
 * Renders the page full-screen.
 */
export default function AuthShell() {
    return <Outlet />;
}
