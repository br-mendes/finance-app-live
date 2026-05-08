import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { User, PlanType } from '../types';
import { Sidebar } from './layout/Sidebar';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const isPremium = user?.plan === PlanType.PREMIUM;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed on desktop, slide-in on mobile */}
      <div className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar user={user} onLogout={handleLogout} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content offset by sidebar width on desktop */}
      <div className="flex-1 flex flex-col lg:ml-64 relative min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800 px-4 sm:px-8 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
            aria-label="Abrir menu"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-gray-900 dark:text-white leading-none">
                {user?.first_name} {user?.last_name}
              </p>
              <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${isPremium ? 'text-amber-500' : 'text-gray-400'}`}>
                {isPremium ? '★ Pro' : 'Free'}
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 animate-fade-in-up pb-24">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
};
