import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';

const dashboardPathByRole = {
  buyer: '/buyer/dashboard',
  seller: '/seller/dashboard',
  admin: '/admin/dashboard',
  support: '/support/dashboard',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { unreadCount } = useNotifications();

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="navbar">

      <div className="navbar-inner">

        {/* ================= LOGO ================= */}

        <Link to="/" className="navbar-brand">
          Flip<span>My</span>Cart
        </Link>


        {/* ================= MAIN NAVIGATION ================= */}

        <nav className="navbar-links">

          <Link
            to="/products"
            className={isActive('/products') ? 'active' : ''}
          >
            Browse
          </Link>

          {user && (
            <Link
              to={dashboardPathByRole[user.role]}
              className={
                isActive(dashboardPathByRole[user.role])
                  ? 'active'
                  : ''
              }
            >
              Dashboard
            </Link>
          )}

        </nav>


        {/* ================= RIGHT ACTIONS ================= */}

        <div className="navbar-actions">

          {user ? (
            <>

              {/* ================= CART ================= */}

              {user.role === 'buyer' && (

                <Link
                  to="/buyer/cart"
                  className="navbar-icon-link nav-cart"
                  title="My Cart"
                >

                  <span className="nav-icon">
                    🛒
                  </span>

                  <span className="nav-action-text">
                    Cart
                  </span>

                  {count > 0 && (
                    <span className="badge-pill">
                      {count}
                    </span>
                  )}

                </Link>

              )}


              {/* ================= NOTIFICATIONS ================= */}

              {(user.role === 'buyer' ||
                user.role === 'seller') && (

                <Link
                  to={`/${user.role}/notifications`}
                  className="navbar-icon-link nav-notifications"
                  title="Notifications"
                >

                  <span className="nav-icon">
                    🔔
                  </span>

                  <span className="nav-action-text">
                    Notifications
                  </span>

                  {unreadCount > 0 && (
                    <span className="badge-pill notification-badge">
                      {unreadCount}
                    </span>
                  )}

                </Link>

              )}


              {/* ================= DIVIDER ================= */}

              <div className="navbar-divider"></div>


              {/* ================= USER ================= */}

              <div className="navbar-user-section">

                <div className="navbar-avatar">

                  {user.name?.charAt(0).toUpperCase()}

                </div>

                <span className="navbar-user">

                  Hi, {user.name.split(' ')[0]}

                </span>

              </div>


              {/* ================= LOGOUT ================= */}

              <button
                className="navbar-logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>

            </>
          ) : (

            <>

              <Link
                to="/login"
                className="navbar-login-btn"
              >
                Login
              </Link>


              <Link
                to="/register"
                className="navbar-signup-btn"
              >
                Sign up
              </Link>

            </>

          )}

        </div>

      </div>

    </header>
  );
}