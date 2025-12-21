import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { User, PlanType } from '../types';
import { ADMIN_EMAIL } from '../constants';
import { 
    Users, TrendingUp, DollarSign, Search, Filter, Edit2, 
    Eye, MoreHorizontal, Check, X, ShieldAlert 
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';

// --- MOCK DATA GENERATOR FOR ADMIN DEMO ---
const generateMockUsers = (count: number): (User & { created_at: string, last_login: string })[] => {
    const names = ['Bruno Mendes', 'Ana Silva', 'Carlos Oliveira', 'Fernanda Souza', 'João Pereira', 'Mariana Costa', 'Pedro Santos', 'Beatriz Lima', 'Lucas Almeida', 'Juliana Rocha'];
    return Array.from({ length: count }).map((_, i) => {
        const name = names[i % names.length];
        const [first, last] = name.split(' ');
        const plan = Math.random() > 0.7 ? PlanType.PREMIUM : PlanType.FREE;
        return {
            id: `usr-${i}`,
            first_name: first,
            last_name: last,
            email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@email.com`,
            cpf: `123.456.789-${String(i).padStart(2, '0')}`,
            plan: plan,
            is_admin: false,
            created_at: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(), // Random date
            last_login: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString()
        } as User & { created_at: string, last_login: string };
    });
};

const GROWTH_DATA = [
    { name: 'Sem 1', users: 120, revenue: 450 },
    { name: 'Sem 2', users: 150, revenue: 800 },
    { name: 'Sem 3', users: 280, revenue: 1500 },
    { name: 'Sem 4', users: 390, revenue: 2350 },
];

export const AdminDashboard: React.FC = () => {
    // --- State ---
    const [users, setUsers] = useState<(User & { created_at: string, last_login: string })[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [planFilter, setPlanFilter] = useState<'all' | 'free' | 'premium'>('all');
    
    // Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<(User & { created_at: string, last_login: string }) | null>(null);

    // Form Data for Edit
    const [editFormData, setEditFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        cpf: '',
        plan: PlanType.FREE
    });

    // --- Init ---
    useEffect(() => {
        // In a real app, fetch from API. Here, mock or load from localStorage persistence for admin demo.
        const storedAdminDb = localStorage.getItem('financeapp_admin_users_db');
        if (storedAdminDb) {
            setUsers(JSON.parse(storedAdminDb));
        } else {
            const mocks = generateMockUsers(25);
            setUsers(mocks);
            localStorage.setItem('financeapp_admin_users_db', JSON.stringify(mocks));
        }
    }, []);

    // Save to local persistence on change
    useEffect(() => {
        if (users.length > 0) {
            localStorage.setItem('financeapp_admin_users_db', JSON.stringify(users));
        }
    }, [users]);

    // --- Computed Stats ---
    const totalUsers = users.length;
    const premiumUsers = users.filter(u => u.plan === PlanType.PREMIUM).length;
    const freeUsers = totalUsers - premiumUsers;
    const mrr = premiumUsers * 19.90;

    // --- Filtering ---
    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
            `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPlan = planFilter === 'all' || user.plan === planFilter;
        // Explicitly exclude admin email from the list
        const isNotAdmin = user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase();
        
        return matchesSearch && matchesPlan && isNotAdmin;
    });

    // --- Handlers ---
    const handleEditClick = (user: any) => {
        setSelectedUser(user);
        setEditFormData({
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            cpf: user.cpf || '',
            plan: user.plan
        });
        setIsEditModalOpen(true);
    };

    const handleViewClick = (user: any) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
    };

    const handleSaveUser = () => {
        if (!selectedUser) return;
        
        setUsers(prev => prev.map(u => 
            u.id === selectedUser.id 
            ? { ...u, ...editFormData } 
            : u
        ));
        
        setIsEditModalOpen(false);
    };

    const handleTogglePlan = () => {
        setEditFormData(prev => ({
            ...prev,
            plan: prev.plan === PlanType.FREE ? PlanType.PREMIUM : PlanType.FREE
        }));
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>

            {/* --- SECTION 1: STATISTICS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white border-l-4 border-blue-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Total Usuários</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">{totalUsers}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Users size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="bg-white border-l-4 border-green-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Receita Mensal (MRR)</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mrr)}
                            </h3>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                            <DollarSign size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="bg-white border-l-4 border-purple-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Usuários Premium</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">{premiumUsers}</h3>
                            <p className="text-xs text-green-500 mt-1 flex items-center">
                                <TrendingUp size={12} className="mr-1" /> 
                                {((premiumUsers/totalUsers)*100).toFixed(0)}% da base
                            </p>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                            <Users size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="bg-white border-l-4 border-gray-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Usuários Free</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">{freeUsers}</h3>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                            <Users size={24} />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Growth Chart */}
            <Card>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Crescimento (Últimos 30 dias)</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={GROWTH_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <Tooltip />
                            <Area type="monotone" dataKey="users" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorUsers)" name="Usuários" />
                            <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" name="Receita (R$)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* --- SECTION 2: USER MANAGEMENT --- */}
            <Card className="!p-0 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="text-lg font-bold text-gray-900">Gestão de Usuários</h3>
                    
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                placeholder="Buscar email ou nome..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="rounded-md border-gray-300 border p-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                            value={planFilter}
                            onChange={(e) => setPlanFilter(e.target.value as any)}
                        >
                            <option value="all">Todos Planos</option>
                            <option value="free">Free</option>
                            <option value="premium">Premium</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cadastro</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Acesso</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs">
                                                {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.plan === PlanType.PREMIUM ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {user.plan === PlanType.PREMIUM ? 'PREMIUM' : 'FREE'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.last_login).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleViewClick(user)} className="text-gray-400 hover:text-blue-600 mr-3" title="Visualizar">
                                            <Eye size={18} />
                                        </button>
                                        <button onClick={() => handleEditClick(user)} className="text-gray-400 hover:text-primary-600" title="Editar">
                                            <Edit2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                        Nenhum usuário encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-sm text-gray-500">
                    Mostrando {filteredUsers.length} de {totalUsers} usuários
                </div>
            </Card>

            {/* --- EDIT MODAL --- */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Editar Usuário"
                footer={
                    <>
                        <Button onClick={handleSaveUser}>Salvar Alterações</Button>
                        <Button variant="secondary" onClick={() => setIsEditModalOpen(false)} className="mr-3">Cancelar</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nome</label>
                            <input 
                                type="text"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                                value={editFormData.first_name}
                                onChange={(e) => setEditFormData({...editFormData, first_name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Sobrenome</label>
                            <input 
                                type="text"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                                value={editFormData.last_name}
                                onChange={(e) => setEditFormData({...editFormData, last_name: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input 
                            type="email"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                            value={editFormData.email}
                            onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">CPF</label>
                        <input 
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                            value={editFormData.cpf}
                            onChange={(e) => setEditFormData({...editFormData, cpf: e.target.value})}
                        />
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Plano de Assinatura</label>
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div>
                                <span className={`font-bold ${editFormData.plan === PlanType.PREMIUM ? 'text-amber-600' : 'text-gray-700'}`}>
                                    {editFormData.plan === PlanType.PREMIUM ? 'PREMIUM' : 'FREE'}
                                </span>
                                <p className="text-xs text-gray-500">
                                    {editFormData.plan === PlanType.PREMIUM ? 'Acesso total liberado' : 'Acesso limitado'}
                                </p>
                            </div>
                            <Button 
                                size="sm" 
                                variant={editFormData.plan === PlanType.PREMIUM ? 'secondary' : 'primary'}
                                onClick={handleTogglePlan}
                            >
                                {editFormData.plan === PlanType.PREMIUM ? 'Rebaixar para Free' : 'Promover a Premium'}
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* --- VIEW MODAL --- */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Detalhes do Usuário"
                footer={
                    <Button variant="secondary" onClick={() => setIsViewModalOpen(false)} className="w-full">Fechar</Button>
                }
            >
                {selectedUser && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl">
                                {selectedUser.first_name.charAt(0)}{selectedUser.last_name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{selectedUser.first_name} {selectedUser.last_name}</h3>
                                <p className="text-gray-500">{selectedUser.email}</p>
                                <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedUser.plan === PlanType.PREMIUM ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {selectedUser.plan.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-gray-50 p-3 rounded">
                                <p className="text-gray-500 text-xs uppercase">ID</p>
                                <p className="font-mono text-gray-700 truncate">{selectedUser.id}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                                <p className="text-gray-500 text-xs uppercase">CPF</p>
                                <p className="font-mono text-gray-700">{selectedUser.cpf || 'Não informado'}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                                <p className="text-gray-500 text-xs uppercase">Cadastrado em</p>
                                <p className="text-gray-700">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                                <p className="text-gray-500 text-xs uppercase">Último Acesso</p>
                                <p className="text-gray-700">{new Date(selectedUser.last_login).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4 mt-2">
                             <h4 className="font-medium text-gray-900 mb-2">Resumo Financeiro (Mock)</h4>
                             <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="p-2 border rounded">
                                    <p className="text-xs text-gray-500">Contas</p>
                                    <p className="font-bold">2</p>
                                </div>
                                <div className="p-2 border rounded">
                                    <p className="text-xs text-gray-500">Cartões</p>
                                    <p className="font-bold">1</p>
                                </div>
                                <div className="p-2 border rounded">
                                    <p className="text-xs text-gray-500">Metas</p>
                                    <p className="font-bold">3</p>
                                </div>
                             </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};