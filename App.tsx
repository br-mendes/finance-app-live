import React, { useState, useEffect, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/AdminLayout';
import { ToastProvider, useToast } from './components/ui/Toast';
import { User } from './types';
import { Footer } from './components/Footer';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

function lazyImport<T extends React.ComponentType<any>>(factory: () => Promise<{ [name: string]: T }>, name: string): React.LazyExoticComponent<T> {
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

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('financeapp_user');
    if (storedUser) setUser(JSON.parse(storedUser));
    setInitializing(false);
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('financeapp_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('financeapp_user');
  };

  if (initializing) return <PageLoader />;

  return (
    <ToastProvider>
      <Router>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" replace />} />
            <Route path="/register" element={!user ? <Register onLogin={handleLogin} /> : <Navigate to="/" replace />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/payment-success" element={<PaymentSuccess onLogin={handleLogin} />} />
            
            {/* PayPal Routes */}
            <Route path="/payment/paypal-success" element={<PayPalReturnPage />} />
            <Route path="/payment/paypal-cancel" element={<PaymentCancelPage />} />
            
            <Route path="/upgrade" element={user ? <Layout user={user} onLogout={handleLogout}><UpgradePage /></Layout> : <Navigate to="/login" />} />
            
            <Route path="/" element={
              user ? (
                user.is_admin ? <Navigate to="/admin" replace /> :
                <Layout user={user} onLogout={handleLogout}>
                  <Dashboard />
                </Layout>
              ) : <Landing />
            } />

            <Route path="/admin" element={user?.is_admin ? <AdminLayout user={user} onLogout={handleLogout}><AdminDashboard /></AdminLayout> : <Navigate to="/" replace />} />
            
            <Route path="/accounts" element={user && <Layout user={user} onLogout={handleLogout}><Accounts user={user} /></Layout>} />
            <Route path="/cards" element={user && <Layout user={user} onLogout={handleLogout}><Cards user={user} /></Layout>} />
            <Route path="/transactions" element={user && <Layout user={user} onLogout={handleLogout}><Transactions user={user} /></Layout>} />
            <Route path="/goals" element={user && <Layout user={user} onLogout={handleLogout}><Goals user={user} /></Layout>} />
            <Route path="/radar" element={user && <Layout user={user} onLogout={handleLogout}><Radar user={user} /></Layout>} />
            <Route path="/settings" element={user && <Layout user={user} onLogout={handleLogout}><Settings onUpdateUser={handleLogin} onLogout={handleLogout} /></Layout>} />
            <Route path="/plans" element={<Navigate to="/upgrade" replace />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </ToastProvider>
  );
}

export default App;