import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

import Home from '../pages/public/Home';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import ProductList from '../pages/public/ProductList';
import ProductDetails from '../pages/public/ProductDetails';
import NotFound from '../pages/public/NotFound';

import BuyerDashboard from '../pages/buyer/BuyerDashboard';
import Profile from '../pages/buyer/Profile';
import Cart from '../pages/buyer/Cart';
import Wishlist from '../pages/buyer/Wishlist';
import Orders from '../pages/buyer/Orders';
import OrderDetails from '../pages/buyer/OrderDetails';
import Support from '../pages/buyer/Support';

import SellerDashboard from '../pages/seller/SellerDashboard';
import Onboarding from '../pages/seller/Onboarding';
import Products from '../pages/seller/Products';
import ProductForm from '../pages/seller/ProductForm';
import SellerOrders from '../pages/seller/SellerOrders';
import SalesAnalytics from '../pages/seller/SalesAnalytics';
import SellerProfile from '../pages/seller/SellerProfile';

import AdminDashboard from '../pages/admin/AdminDashboard';
import Users from '../pages/admin/Users';
import Sellers from '../pages/admin/Sellers';
import AdminProducts from '../pages/admin/AdminProducts';
import Categories from '../pages/admin/Categories';
import Analytics from '../pages/admin/Analytics';

import SupportDashboard from '../pages/support/SupportDashboard';
import SupportTickets from '../pages/support/SupportTickets';

import Notifications from '../pages/shared/Notifications';
import Messages from '../pages/shared/Messages';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetails />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <RoleRoute roles={['buyer']}>
              <DashboardLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
        <Route path="/buyer/profile" element={<Profile />} />
        <Route path="/buyer/cart" element={<Cart />} />
        <Route path="/buyer/wishlist" element={<Wishlist />} />
        <Route path="/buyer/orders" element={<Orders />} />
        <Route path="/buyer/orders/:id" element={<OrderDetails />} />
        <Route path="/buyer/messages" element={<Messages />} />
        <Route path="/buyer/notifications" element={<Notifications />} />
        <Route path="/buyer/support" element={<Support />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <RoleRoute roles={['seller']}>
              <DashboardLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/seller/onboarding" element={<Onboarding />} />
        <Route path="/seller/products" element={<Products />} />
        <Route path="/seller/products/new" element={<ProductForm />} />
        <Route path="/seller/products/:id/edit" element={<ProductForm />} />
        <Route path="/seller/orders" element={<SellerOrders />} />
        <Route path="/seller/analytics" element={<SalesAnalytics />} />
        <Route path="/seller/messages" element={<Messages />} />
        <Route path="/seller/notifications" element={<Notifications />} />
        <Route path="/seller/profile" element={<SellerProfile />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <RoleRoute roles={['admin']}>
              <DashboardLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/sellers" element={<Sellers />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/categories" element={<Categories />} />
        <Route path="/admin/analytics" element={<Analytics />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <RoleRoute roles={['support']}>
              <DashboardLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="/support/dashboard" element={<SupportDashboard />} />
        <Route path="/support/tickets" element={<SupportTickets />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
