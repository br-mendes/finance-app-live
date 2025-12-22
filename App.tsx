
import React, { useState, useEffect, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/AdminLayout';
import { ToastProvider, useToast } from './components/ui/Toast';
import { User } from './types';
import { Footer } from './components/Footer';

// Helper para garantir que a página role para o topo ao navegar
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Helper for lazy loading named exports
function lazyImport<T extends React.ComponentType<any>>(factory: () => Promise<{ [name: string]: T }>, name: string): React.LazyExoticComponent<T> {
  return React.lazy(() => factory().then((module) => ({ default: module[name] })));
}

// Lazy Load Pages
const Login = lazyImport(() => import('./pages/Login'), 'Login');
const Register = lazyImport(() => import('./pages/Register'), 'Register');
const ForgotPassword = lazyImport(() => import('./pages/ForgotPassword'), 'ForgotPassword');
const Landing = lazyImport(() => import('./pages/Landing'), 'Landing');
const PaymentSuccess = lazyImport(() => import('./pages/PaymentSuccess'), 'PaymentSuccess');
const CancellationSuccess = lazyImport(() => import('./pages/CancellationSuccess'), 'CancellationSuccess');
const Dashboard = lazyImport(() => import('./pages/Dashboard'), 'Dashboard');
const AdminDashboard = lazyImport(() => import('./pages/AdminDashboard'), 'AdminDashboard');
const Accounts = lazyImport(() => import('./pages/Accounts'), 'Accounts');
const Cards = lazyImport(() => import('./pages/Cards'), 'Cards');
const Transactions = lazyImport(() => import('./pages/Transactions'), 'Transactions');
const Goals = lazyImport(() => import('./pages/Goals'), 'Goals');
const Radar = lazyImport(() => import('./pages/Radar'), 'Radar');
const Settings = lazyImport(() => import('./pages/Settings'), 'Settings');
const About = lazyImport(() => import('./pages/About'), 'About');
const Plans = lazyImport(() => import('./pages/Plans'), 'Plans');
const Contact = lazyImport(() => import('./pages/Contact'), 'Contact');
const MockCheckout = lazyImport(() => import('./pages/MockCheckout'), 'MockCheckout');

// Loading Fallback
const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <span className="text-gray-500 text-sm animate-pulse">Carregando...</span>
        </div>
    </div>
);

// Offline Monitor Component
const OfflineMonitor = () => {
    const { addToast } = useToast();

    useEffect(() => {
        const handleOnline = () => addToast('Conexão restabelecida. Você está online.', 'success');
        const handleOffline = () => addToast('Sem conexão com a internet. Modo offline ativado.', 'warning');

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [addToast]);

    return null;
};

// Public Wrapper for pages when guest
const PublicPageWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen flex flex-col bg-white">
        <header className="py-4 px-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-md z-50">
            <div className="flex items-center gap-8">
                <Link to="/">
                    <img src="https://i.ibb.co/9mt6zRFj/generated-image-removebg-preview.png" alt="FinanceAPP" className="h-10 w-auto hover:opacity-90 transition-opacity" />
                </Link>
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
                    <Link to="/about" className="hover:text-primary-600 transition-colors">Sobre</Link>
                    <Link to="/plans" className="hover:text-primary-600 transition-colors">Planos</Link>
                    <Link to="/contact" className="hover:text-primary-600 transition-colors">Contato</Link>
                </nav>
            </div>
            <Link to="/login" className="bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 active:scale-95">Entrar</Link>
        </header>
        <div className="flex-1">{children}</div>
        <Footer />
    </div>
);

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('financeapp_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
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

  if (initializing) {
    return <PageLoader />;
  }

  return (
    <ToastProvider>
      <OfflineMonitor />
      <Router>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={
                !user ? <Login onLogin={handleLogin} /> : (user.is_admin ? <Navigate to="/admin" replace /> : <Navigate to="/" replace />)
            } />
            
            <Route path="/register" element={
                !user ? <Register onLogin={handleLogin} /> : <Navigate to="/" replace />
            } />
            
            <Route path="/signup" element={
                !user ? <Register onLogin={handleLogin} /> : <Navigate to="/" replace />
            } />

            <Route path="/forgot-password" element={
                <ForgotPassword />
            } />
            
            <Route path="/reset-password" element={
                <ForgotPassword />
            } />

            <Route path="/payment-success" element={
                <PaymentSuccess onLogin={handleLogin} />
            } />

            <Route path="/cancellation-success" element={
                user ? <CancellationSuccess onUpdateUser={handleLogin} /> : <Navigate to="/login" />
            } />

            <Route path="/mock-checkout" element={
                <MockCheckout />
            } />

            {/* Public Footer Pages */}
            <Route path="/about" element={
                 user ? (
                    <Layout user={user} onLogout={handleLogout}>
                        <About />
                    </Layout>
                 ) : (
                    <PublicPageWrapper>
                        <About />
                    </PublicPageWrapper>
                 )
            } />

            <Route path="/plans" element={
                user ? (
                    <Layout user={user} onLogout={handleLogout}>
                        <Plans />
                    </Layout>
                ) : (
                    <PublicPageWrapper>
                        <Plans />
                    </PublicPageWrapper>
                )
            } />

             <Route path="/contact" element={
                user ? (
                    <Layout user={user} onLogout={handleLogout}>
                        <Contact />
                    </Layout>
                ) : (
                    <PublicPageWrapper>
                        <Contact />
                    </PublicPageWrapper>
                )
            } />
            
            {/* Protected Routes */}
            <Route path="/" element={
              user ? (
                user.is_admin ? <Navigate to="/admin" replace /> :
                <Layout user={user} onLogout={handleLogout}>
                  <Dashboard />
                </Layout>
              ) : (
                 <Landing />
              )
            } />

            <Route path="/admin" element={
                user && user.is_admin ? (
                    <AdminLayout user={user} onLogout={handleLogout}>
                        <AdminDashboard />
                    </AdminLayout>
                ) : (
                    <Navigate to="/" replace />
                )
            } />
            
            <Route path="/accounts" element={
              user && !user.is_admin ? (
                <Layout user={user} onLogout={handleLogout}>
                  <Accounts user={user} />
                </Layout>
              ) : (
                 <Navigate to="/" replace />
              )
            } />

            <Route path="/cards" element={
              user && !user.is_admin ? (
                <Layout user={user} onLogout={handleLogout}>
                  <Cards user={user} />
                </Layout>
              ) : (
                 <Navigate to="/" replace />
              )
            } />

            <Route path="/transactions" element={
              user && !user.is_admin ? (
                <Layout user={user} onLogout={handleLogout}>
                  <Transactions user={user} />
                </Layout>
              ) : (
                 <Navigate to="/" replace />
              )
            } />

            <Route path="/goals" element={
              user && !user.is_admin ? (
                <Layout user={user} onLogout={handleLogout}>
                  <Goals user={user} />
                </Layout>
              ) : (
                 <Navigate to="/" replace />
              )
            } />

            <Route path="/radar" element={
              user && !user.is_admin ? (
                <Layout user={user} onLogout={handleLogout}>
                  <Radar user={user} />
                </Layout>
              ) : (
                 <Navigate to="/" replace />
              )
            } />

            <Route path="/settings" element={
              user && !user.is_admin ? (
                <Layout user={user} onLogout={handleLogout}>
                  <Settings onUpdateUser={handleLogin} onLogout={handleLogout} />
                </Layout>
              ) : (
                 <Navigate to="/" replace />
              )
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </ToastProvider>
  );
}

export default App;
