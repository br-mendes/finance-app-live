import React, { Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/AdminLayout';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

function lazyImport<T extends React.ComponentType<React.ComponentProps<T>>>(
  factory: () => Promise<{ [name: string]: T }>,
  name: string
): React.LazyExoticComponent<T> {
  return React.lazy(() => factory().then((module) => ({ default: module[name] })));
}

const Login = lazyImport(() => import('./pages/Login'), 'Login');
const Register = lazyImport(() => import('./pages/Register'), 'Register');
const ForgotPasswordPage = lazyImport(() => import('./pages/ForgotPassword'), 'ForgotPassword');
const Landing = lazyImport(() => import('./pages/Landing'), 'Landing');
const PaymentSuccess = lazyImport(() => import('./pages/PaymentSuccess'), 'PaymentSuccess');
const Dashboard = lazyImport(() => import('./pages/Dashboard'), 'Dashboard');
const AdminDashboard = lazyImport(() => import('./pages/AdminDashboard'), 'AdminDashboard');
const Accounts = lazyImport(() => import('./pages/Accounts'), 'Accounts');
const Cards = lazyImport(() => import('./pages/Cards'), 'Cards');
const Transactions = lazyImport(() => import('./pages/Transactions'), 'Transactions');
const Goals = lazyImport(() => import('./pages/Goals'), 'Goals');
const Radar = lazyImport(() => import('./pages/Radar'), 'Radar');
const Settings = lazyImport(() => import('./pages/Settings'), 'Settings');
const About = lazyImport(() => import('./pages/About'), 'About');
const UpgradePage = lazyImport(() => import('./pages/UpgradePage'), 'default');
const Contact = lazyImport(() => import('./pages/Contact'), 'Contact');
const PayPalReturnPage = lazyImport(() => import('./pages/PayPalReturnPage'), 'default');
const PaymentCancelPage = lazyImport(() => import('./pages/PaymentCancelPage'), 'default');

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <span className="text-gray-500 text-sm animate-pulse">Iniciando ambiente...</span>
    </div>
  </div>
);

function AppRoutes() {
  const { user, loading, login, logout } = useAuth();

  if (loading) return <PageLoader />;

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={!user ? <Login onLogin={login} /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!user ? <Register onLogin={login} /> : <Navigate to="/" replace />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/payment-success" element={<PaymentSuccess onLogin={login} />} />
          <Route path="/payment/paypal-success" element={<PayPalReturnPage />} />
          <Route path="/payment/paypal-cancel" element={<PaymentCancelPage />} />

          <Route path="/upgrade" element={
            user
              ? <Layout user={user} onLogout={logout}><UpgradePage /></Layout>
              : <Navigate to="/login" />
          } />

          <Route path="/" element={
            user
              ? user.is_admin
                ? <Navigate to="/admin" replace />
                : <Layout user={user} onLogout={logout}><Dashboard /></Layout>
              : <Landing />
          } />

          <Route path="/admin" element={
            user?.is_admin
              ? <AdminLayout user={user} onLogout={logout}><AdminDashboard /></AdminLayout>
              : <Navigate to="/" replace />
          } />

          <Route path="/accounts" element={
            user ? <Layout user={user} onLogout={logout}><Accounts /></Layout> : <Navigate to="/login" />
          } />
          <Route path="/cards" element={
            user ? <Layout user={user} onLogout={logout}><Cards /></Layout> : <Navigate to="/login" />
          } />
          <Route path="/transactions" element={
            user ? <Layout user={user} onLogout={logout}><Transactions /></Layout> : <Navigate to="/login" />
          } />
          <Route path="/goals" element={
            user ? <Layout user={user} onLogout={logout}><Goals /></Layout> : <Navigate to="/login" />
          } />
          <Route path="/radar" element={
            user ? <Layout user={user} onLogout={logout}><Radar /></Layout> : <Navigate to="/login" />
          } />
          <Route path="/settings" element={
            user ? <Layout user={user} onLogout={logout}><Settings /></Layout> : <Navigate to="/login" />
          } />
          <Route path="/plans" element={<Navigate to="/upgrade" replace />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}
