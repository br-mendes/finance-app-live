import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Landmark, 
  CreditCard, 
  ArrowLeftRight, 
  Target, 
  Newspaper, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  Camera,
  User as UserIcon,
  Save
} from 'lucide-react';
import { PlanType, User } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Footer } from './Footer';
import { useToast } from './ui/Toast';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const { addToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  
  const [editFirstName, setEditFirstName] = useState(user?.first_name || '');
  const [editLastName, setEditLastName] = useState(user?.last_name || '');
  const [editAvatarUrl, setEditAvatarUrl] = useState(user?.avatar_url || '');

  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard, path: '/' },
    { id: 'accounts', label: 'Minhas Contas', icon: Landmark, path: '/accounts' },
    { id: 'cards', label: 'Cartões & Faturas', icon: CreditCard, path: '/cards' },
    { id: 'transactions', label: 'Transações', icon: ArrowLeftRight, path: '/transactions' },
    { id: 'goals', label: 'Metas', icon: Target, path: '/goals' },
    { id: 'radar', label: 'Radar do Mercado', icon: Newspaper, path: '/radar', premiumOnly: true },
    { id: 'settings', label: 'Configurações', icon: Settings, path: '/settings' },
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleProfileSave = () => {
    const updatedUser = { ...user, first_name: editFirstName, last_name: editLastName, avatar_url: editAvatarUrl } as User;
    localStorage.setItem('financeapp_user', JSON.stringify(updatedUser));
    addToast("Perfil atualizado com sucesso!", "success");
    setTimeout(() => window.location.reload(), 1000);
    setProfileModalOpen(false);
  };

  const isPremium = user?.plan === PlanType.PREMIUM;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Link to="/" className="flex items-center justify-start w-full hover:opacity-90 transition-opacity">
            <img src="https://i.ibb.co/9mt6zRFj/generated-image-removebg-preview.png" alt="FinanceApp" className="h-10 w-auto object-contain" />
          </Link>
          <button onClick={toggleSidebar} className="ml-auto lg:hidden text-gray-500"><X size={24} /></button>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="mb-6 px-2">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Menu Principal</p>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const isLocked = item.premiumOnly && !isPremium;
              return (
                <Link key={item.id} to={isLocked ? '#' : item.path} onClick={() => !isLocked && setSidebarOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 mb-1 ${isActive ? 'bg-primary-50 text-primary-700 font-bold shadow-sm' : 'font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900'} ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}>
                  <item.icon size={20} className={isActive ? 'text-primary-600' : 'text-gray-400'} />
                  <span className="flex-1">{item.label}</span>
                  {isLocked && <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">PRO</span>}
                </Link>
              );
            })}
          </div>
          <div className="px-2 pt-4 border-t border-gray-100">
            <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"><LogOut size={20} /><span>Sair do Sistema</span></button>
          </div>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
          <button onClick={toggleSidebar} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><Menu size={24} /></button>
          <div className="flex items-center gap-4 ml-auto">
            <button className="p-2 text-gray-400 hover:text-gray-600 relative"><Bell size={20} /><span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span></button>
            <div className="h-8 w-px bg-gray-200 mx-1"></div>
            <div className="flex items-center gap-3 pl-2 cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-colors" onClick={() => setProfileModalOpen(true)}>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">Olá, {user?.first_name}</p>
                <div className="flex items-center justify-end gap-1"><span className={`text-xs px-1.5 py-0.5 rounded font-bold tracking-wide ${isPremium ? 'bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900' : 'bg-gray-200 text-gray-600'}`}>{user?.plan === PlanType.PREMIUM ? 'PREMIUM' : 'FREE'}</span></div>
              </div>
              <img src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}`} alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover aspect-square" />
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 lg:p-8 flex flex-col"><div className="flex-1">{children}</div><Footer /></div>
      </main>
      <Modal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} title="Editar Perfil" footer={<><Button onClick={handleProfileSave}><Save size={16} className="mr-2" />Salvar</Button><Button variant="secondary" onClick={() => setProfileModalOpen(false)} className="mr-3">Cancelar</Button></>}>
        <div className="space-y-6">
            <div className="flex justify-center"><div className="relative"><img src={editAvatarUrl || `https://ui-avatars.com/api/?name=${editFirstName}+${editLastName}`} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg aspect-square" /><div className="absolute bottom-0 right-0 bg-primary-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-primary-700"><Camera size={16} /></div></div></div>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700">Nome</label><input type="text" value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Sobrenome</label><input type="text" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" /></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700">URL do Avatar</label><input type="text" value={editAvatarUrl} onChange={(e) => setEditAvatarUrl(e.target.value)} placeholder="https://..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" /></div>
            </div>
        </div>
      </Modal>
    </div>
  );
};