import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogOut, LayoutDashboard, Users, PieChart } from 'lucide-react';
import { User } from '../types';

interface AdminLayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col fixed h-full z-20">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <Shield className="text-red-500 mr-2" size={24} />
          <span className="font-bold text-lg tracking-wider">ADMIN PANEL</span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2">
            <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Visão Geral
            </div>
            <a href="#/admin" className="flex items-center gap-3 px-3 py-2 bg-gray-800 text-white rounded-lg">
                <LayoutDashboard size={18} />
                Dashboard
            </a>
            
            <div className="px-3 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Gerenciamento
            </div>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-left">
                <Users size={18} />
                Usuários
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-left">
                <PieChart size={18} />
                Relatórios (Breve)
            </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">
                    AD
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{user.first_name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
            </div>
            <button 
                onClick={handleLogout}
                className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
                <LogOut size={16} />
                Sair
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};