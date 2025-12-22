import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Landmark, 
  CreditCard, 
  ArrowLeftRight, 
  Target, 
  Newspaper, 
  Settings,
  LogOut,
  ChevronRight,
  Crown
} from 'lucide-react';
import { User, PlanType } from '../../types';
import { useAvatar } from '../../hooks/useAvatar';

interface SidebarProps {
  user: User | null;
  onLogout: () => void;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, onClose }) => {
  const location = useLocation();
  const { avatarUrl } = useAvatar(user?.id);
  const isPremium = user?.plan === PlanType.PREMIUM;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'accounts', label: 'Contas', icon: Landmark, path: '/accounts' },
    { id: 'cards', label: 'Cartões', icon: CreditCard, path: '/cards' },
    { id: 'transactions', label: 'Transações', icon: ArrowLeftRight, path: '/transactions' },
    { id: 'goals', label: 'Metas', icon: Target, path: '/goals' },
    { id: 'radar', label: 'Radar IA', icon: Newspaper, path: '/radar', premiumOnly: true },
    { id: 'settings', label: 'Configurações', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 shadow-lg z-40 flex flex-col">
      {/* Logo */}
      <div className="p-6 h-20 flex items-center border-b border-gray-50 dark:border-gray-700">
        <Link to="/" onClick={onClose} className="flex items-center">
          <img src="https://i.ibb.co/9mt6zRFj/generated-image-removebg-preview.png" alt="FinanceApp" className="h-8" />
        </Link>
      </div>
      
      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="px-4 py-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2">Menu Principal</p>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isLocked = item.premiumOnly && !isPremium;
            
            return (
              <li key={item.id}>
                <Link 
                  to={isLocked ? '#' : item.path} 
                  onClick={() => !isLocked && onClose?.()}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all
                    ${isActive 
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600'}
                    ${isLocked ? 'opacity-50 cursor-not-allowed grayscale' : ''}
                  `}
                >
                  <item.icon size={20} className={isActive ? 'text-white' : ''} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight size={14} className="opacity-50" />}
                  {isLocked && <Crown size={14} className="text-amber-500" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* User Info at Bottom */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600">
          <img 
            src={avatarUrl || `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=0ea5e9&color=fff`} 
            alt="User" 
            className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-500" 
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-gray-900 dark:text-white truncate">{user?.first_name}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{user?.plan}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 mt-3 px-4 py-2 text-[10px] font-black uppercase text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
        >
          <LogOut size={14} /> Sair
        </button>
      </div>
    </div>
  );
};