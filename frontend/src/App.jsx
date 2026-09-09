import React from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import AdminLayout from './components/admin/AdminLayout';
import AccountLayout from './components/account/AccountLayout';
import PageTransition from './components/ui/PageTransition';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Categories from './pages/Categories';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import NotFound from './pages/NotFound';

import AccountOverview from './pages/account/AccountOverview';
import AccountOrders from './pages/account/AccountOrders';
import AccountOrderDetails from './pages/account/AccountOrderDetails';
import AccountOrderInvoice from './pages/account/AccountOrderInvoice';
import AccountWishlist from './pages/account/AccountWishlist';
import AccountAddresses from './pages/account/AccountAddresses';
import AccountPaymentMethods from './pages/account/AccountPaymentMethods';
import AccountProfile from './pages/account/AccountProfile';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminPayments from './pages/admin/AdminPayments';
import AdminInventory from './pages/admin/AdminInventory';
import AdminUsers from './pages/admin/AdminUsers';

function RedirectToAccountOrder() {
  const { id } = useParams();
  return <Navigate to={`/account/orders/${id}`} replace />;
}

function AccountRoute({ children }) {
  return (
    <ProtectedRoute>
      <AccountLayout>{children}</AccountLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  // Invoices open in their own tab as a clean, printable document — no site
  // chrome (header/footer/account sidebar) to strip out via print CSS.
  const isInvoiceRoute = /^\/account\/orders\/[^/]+\/invoice$/.test(location.pathname);

  // `location` is passed explicitly (rather than letting Routes read it from
  // context) so the outgoing page keeps rendering against its own URL while
  // AnimatePresence plays its exit animation, instead of instantly swapping
  // to the new route's content.
  const routes = (
    <AnimatePresence mode="wait" initial={false}>
      <PageTransition key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/cart" element={<CartPage />} />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          {/* Legacy routes from before the account dashboard existed. */}
          <Route path="/profile" element={<Navigate to="/account/profile" replace />} />
          <Route path="/orders" element={<Navigate to="/account/orders" replace />} />
          <Route path="/orders/:id" element={<RedirectToAccountOrder />} />
          <Route path="/status" element={<Navigate to="/account/orders" replace />} />

          <Route
            path="/account"
            element={
              <AccountRoute>
                <AccountOverview />
              </AccountRoute>
            }
          />
          <Route
            path="/account/orders"
            element={
              <AccountRoute>
                <AccountOrders />
              </AccountRoute>
            }
          />
          <Route
            path="/account/orders/:id"
            element={
              <AccountRoute>
                <AccountOrderDetails />
              </AccountRoute>
            }
          />
          <Route
            path="/account/orders/:id/invoice"
            element={
              <ProtectedRoute>
                <AccountOrderInvoice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/wishlist"
            element={
              <AccountRoute>
                <AccountWishlist />
              </AccountRoute>
            }
          />
          <Route
            path="/account/addresses"
            element={
              <AccountRoute>
                <AccountAddresses />
              </AccountRoute>
            }
          />
          <Route
            path="/account/payment-methods"
            element={
              <AccountRoute>
                <AccountPaymentMethods />
              </AccountRoute>
            }
          />
          <Route
            path="/account/profile"
            element={
              <AccountRoute>
                <AccountProfile />
              </AccountRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <AdminProducts />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <AdminRoute>
                <AdminCategories />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminOrders />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <AdminRoute>
                <AdminPayments />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/inventory"
            element={
              <AdminRoute>
                <AdminInventory />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageTransition>
    </AnimatePresence>
  );

  return (
    <div className="app-shell">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-elevated"
      >
        Skip to content
      </a>
      {isInvoiceRoute ? (
        <main id="main-content">{routes}</main>
      ) : isAdminRoute ? (
        <AdminLayout>{routes}</AdminLayout>
      ) : (
        <>
          <Header />
          <main id="main-content" className="app-content pb-16 md:pb-0">
            {routes}
          </main>
          <Footer />
          <BottomNav />
        </>
      )}
    </div>
  );
}
