import { NavLink } from 'react-router-dom';

const links = [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/vehicles', label: 'Vehicles' },
    { to: '/admin/bookings', label: 'Bookings' },
    { to: '/admin/categories', label: 'Categories' },
];

export default function AdminSectionNav() {
    return (<div className = "admin-subnav card"
        style = {
            { padding: '0.875rem', marginBottom: '1.25rem' }
        }><div className = "admin-subnav__links"> {
            links.map((link) => (<NavLink key = { link.to }
                end = { link.end }
                to = { link.to }
                className = {
                    ({ isActive }) =>
                    `button ${isActive ? 'button--secondary' : 'button--ghost'} admin-subnav__link`
                }
                style = {
                    { fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap' }
                }> { link.label } </NavLink>
            ))
        } </div></div>
    );
}