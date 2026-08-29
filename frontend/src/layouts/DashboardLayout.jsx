import { NavLink, Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const navByRole = {
  buyer: [
    { to: '/buyer/dashboard', label: 'Overview' },
    { to: '/buyer/profile', label: 'Profile' },
    { to: '/buyer/orders', label: 'Orders' },
    { to: '/buyer/cart', label: 'Cart' },
    { to: '/buyer/wishlist', label: 'Wishlist' },
    { to: '/buyer/messages', label: 'Messages' },
    { to: '/buyer/notifications', label: 'Notifications' },
    { to: '/buyer/support', label: 'Support' },
  ],
  seller: [
    { to: '/seller/dashboard', label: 'Overview' },
    { to: '/seller/onboarding', label: 'Onboarding' },
    { to: '/seller/products', label: 'Products' },
    { to: '/seller/products/new', label: 'Add Product' },
    { to: '/seller/orders', label: 'Orders' },
    { to: '/seller/analytics', label: 'Sales Analytics' },
    { to: '/seller/messages', label: 'Messages' },
    { to: '/seller/notifications', label: 'Notifications' },
    { to: '/seller/profile', label: 'Profile' },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Overview' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/sellers', label: 'Sellers' },
    { to: '/admin/products', label: 'Products' },
    { to: '/admin/categories', label: 'Categories' },
    { to: '/admin/analytics', label: 'Analytics' },
  ],
  support: [
    { to: '/support/dashboard', label: 'Overview' },
    { to: '/support/tickets', label: 'All Tickets' },
  ],
};

export default function DashboardLayout() {
  const { user } = useAuth();
  const links = navByRole[user?.role] || [];

  return (
    <div className="app-shell">
      <Navbar />
      <div className="dashboard-shell">
        <aside className="dashboard-sidebar">
          <nav>
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')} end>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
