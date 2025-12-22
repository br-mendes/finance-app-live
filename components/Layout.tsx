import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Bell } from 'lucide-react';
import { User, PlanType } from '../types';
import { Sidebar } from './layout/Sidebar';
import { Footer } from './Footer';
import { useToast } from './ui/Toast';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const isPremium = user?.plan === PlanType.PREMIUM;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/60 z-40 lg:hidden backdrop-blur-sm" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar - Desktop Fixo / Mobile Ocultável */}
      <div className={`
        lg:block ${sidebarOpen ? 'block' : 'hidden'}
      `}>
        <Sidebar user={user} onLogout={handleLogout} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col lg:ml-64 relative min-w-0">
        {/* Header Superior */}
        <header className="h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800 px-4 sm:px-8 flex items-center justify-between">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <button className="p-2.5 text-gray-400 hover:text-primary-600 relative">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
            </button>
            <div className="h-8 w-px bg-gray-100 dark:bg-gray-800 mx-2"></div>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-gray-900 dark:text-white leading-none">Olá, {user?.first_name}</p>
              <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${isPremium ? 'text-amber-500' : 'text-gray-400'}`}>
                {isPremium ? '★ Usuário Pro' : 'Free Account'}
              </p>
            </div>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-8 animate-fade-in-up pb-24">
          {children}
        </main>

        {/* Footer SaaS Glassmorphism */}
        <Footer />
      </div>
    </div>
  );
};