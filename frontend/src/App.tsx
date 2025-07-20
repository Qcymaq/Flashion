import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import HelpPage from './pages/HelpPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ContactPage from './pages/ContactPage';
import ReturnsPage from './pages/ReturnsPage';
import ShippingPage from './pages/ShippingPage';
import BuyingGuidePage from './pages/BuyingGuidePage';
import OrdersPage from './pages/OrdersPage';
import StudioPage from './pages/StudioPage';
import ProductsPage from './pages/ProductsPage';
import GuidePage from './pages/GuidePage';
import VirtualMakeupPage from './pages/VirtualMakeupPage';
import PaymentConfirmationPage from './pages/PaymentConfirmationPage';
import UserDetail from './pages/UserDetail';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import BeautyTipsPage from './pages/BeautyTipsPage';
import BeautyTipDetailPage from './pages/BeautyTipDetailPage';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminInventoryPage from './pages/AdminInventoryPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import ConsultationsPage from './pages/admin/ConsultationsPage';
import AdminArchivedOrdersPage from './pages/AdminArchivedOrdersPage';
import AdminBeautyTipsPage from './pages/AdminBeautyTipsPage';
import AdminPasswordResetRequestsPage from './pages/AdminPasswordResetRequestsPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="studio" element={<StudioPage />} />
                <Route path="studio/:productId" element={<StudioPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="products/:id" element={<ProductPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="help" element={<HelpPage />} />
                <Route path="terms" element={<TermsPage />} />
                <Route path="privacy" element={<PrivacyPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="returns" element={<ReturnsPage />} />
                <Route path="shipping" element={<ShippingPage />} />
                <Route path="guide" element={<GuidePage />} />
                <Route path="guide/buying" element={<BuyingGuidePage />} />
                <Route path="virtual-makeup" element={<VirtualMakeupPage />} />
                <Route path="beauty-tips" element={<BeautyTipsPage />} />
                <Route path="beauty-tips/:id" element={<BeautyTipDetailPage />} />
              </Route>

              {/* Protected User Routes */}
              <Route path="/" element={<MainLayout />}>
                <Route path="checkout" element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                } />
                <Route path="payment-confirmation/:orderId" element={
                  <ProtectedRoute>
                    <PaymentConfirmationPage />
                  </ProtectedRoute>
                } />
                <Route path="profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="orders" element={
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                } />
              </Route>

              {/* Auth Routes */}
              <Route path="/" element={<MainLayout />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route path="reset-password" element={<ResetPasswordPage />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={
                <AdminRoute>
                    <AdminLayout />
                </AdminRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="inventory" element={<AdminInventoryPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="users/:userId" element={<UserDetail />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="consultations" element={<ConsultationsPage />} />
                <Route path="orders/archived" element={<AdminArchivedOrdersPage />} />
                <Route path="beauty-tips" element={<AdminBeautyTipsPage />} />
                <Route path="password-reset-requests" element={<AdminPasswordResetRequestsPage />} />
              </Route>
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 