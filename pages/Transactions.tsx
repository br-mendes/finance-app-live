
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { 
    Plus, Search, Filter, ArrowDownCircle, ArrowUpCircle, 
    Download, CreditCard, Trash2, Edit2, 
    ChevronLeft, ChevronRight, Lock, Radio, Trash
} from 'lucide-react';
import { Transaction, TransactionType, User, PlanType, Account, CreditCard as CreditCardType } from '../types';
import { CATEGORIES } from '../constants';
import { usePersistentData } from '../hooks/usePersistentData';
import { supabase } from '../services/supabaseClient';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

interface TransactionsProps {
    user: User;
}

const ITEMS_PER_PAGE = 20;

export const Transactions: React.FC<TransactionsProps> = ({ user }) => {
    const { addToast } = useToast();
    const { loadUserData, setupRealtimeSubscriptions } = usePersistentData();
    
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [cards, setCards] = useState<CreditCardType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLive, setIsLive] = useState(false);

    // Filters
    const [filters, setFilters] = useState({
        searchTerm: '',
        type: 'all',
        category: 'all',
        period: '30'
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        type: TransactionType.DEBIT,
        date: new Date().toISOString().split('T')[0],
        amount: '',
        description: '',
        category: 'Outros créditos',
        accountId: '',
        cardId: ''
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        const data = await loadUserData();
        setTransactions(data.transactions);
        setAccounts(data.accounts);
        setCards(data.cards);
        setLoading(false);
    }, [loadUserData]);

    useEffect(() => {
        fetchData();
        const cleanup = setupRealtimeSubscriptions(() => {
            setIsLive(true);
            fetchData();
            setTimeout(() => setIsLive(false), 2000);
        });
        return cleanup;
    }, [fetchData, setupRealtimeSubscriptions]);

    const handleSave = async () => {
        if (!formData.description || !formData.amount) {
            addToast("Preencha os campos obrigatórios", "error");
            return;
        }

        const transData = {
            user_id: user.id,
            description: formData.description,
            amount: parseFloat(formData.amount),
            type: formData.type,
            category: formData.category,
            date: new Date(formData.date).toISOString(),
            account_id: formData.type !== TransactionType.CREDIT ? formData.accountId : null,
            credit_card_id: formData.type === TransactionType.CREDIT ? formData.cardId : null,
        };

        try {
            if (editingId) {
                await supabase.from('transactions').update(transData).eq('id', editingId);
                addToast("Transação atualizada!", "success");
            } else {
                await supabase.from('transactions').insert([transData]);
                addToast("Transação criada!", "success");
            }
            setIsModalOpen(false);
        } catch (error) {
            addToast("Erro ao salvar transação", "error");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Deseja realmente excluir esta transação?")) {
            try {
                // Soft delete
                await supabase.from('transactions').update({ deleted_at: new Date().toISOString() }).eq('id', id);
                addToast("Transação excluída", "info");
            } catch (error) {
                addToast("Erro ao excluir", "error");
            }
        }
    };

    const filteredTransactions = transactions.filter(t => {
        if (filters.searchTerm && !t.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
        if (filters.type !== 'all' && t.type !== filters.type) return false;
        if (filters.category !== 'all' && t.category !== filters.category) return false;
        return true;
    });

    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
    const paginatedData = filteredTransactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Transações</h1>
                        <p className="text-sm text-gray-500 font-medium">Controle granular do seu fluxo.</p>
                    </div>
                    {isLive && (
                        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase border border-emerald-100 animate-pulse">
                            <Radio size={12} /> Live Sync
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => addToast("Em breve: Importação Bancária", "info")} className="h-11">
                        <Download size={18} className="mr-2" /> Exportar
                    </Button>
                    <Button onClick={() => { setEditingId(null); setIsModalOpen(true); }} className="h-11 bg-primary-600 hover:bg-primary-700 shadow-xl shadow-primary-500/20">
                        <Plus size={18} className="mr-2" /> Nova
                    </Button>
                </div>
            </div>

            {/* Filtros SaaS */}
            <Card className="!p-4 border-none shadow-sm dark:bg-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar transação..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
                            value={filters.searchTerm}
                            onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                        />
                    </div>
                    <select 
                        className="bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                        value={filters.type}
                        onChange={(e) => setFilters({...filters, type: e.target.value})}
                    >
                        <option value="all">Todos Tipos</option>
                        <option value="receive">Receita</option>
                        <option value="debit">Débito</option>
                        <option value="credit">Crédito</option>
                    </select>
                    <select 
                        className="bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                        value={filters.category}
                        onChange={(e) => setFilters({...filters, category: e.target.value})}
                    >
                        <option value="all">Categorias</option>
                        {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
            </Card>

            {/* Tabela de Transações */}
            <Card className="!p-0 border-none shadow-sm overflow-hidden dark:bg-gray-800">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Data</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Descrição</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoria</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {paginatedData.map(t => {
                                const isIncome = t.type === 'receive';
                                return (
                                    <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(t.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                                            <div className="flex items-center gap-2">
                                                {t.type === 'credit' ? <CreditCard size={14} className="text-primary-500" /> : null}
                                                {t.description}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 tracking-wider">
                                                {CATEGORIES.find(c => c.name === t.category)?.icon || '💰'} {t.category}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-right text-sm font-black ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {isIncome ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleDelete(t.id)} className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal de Transação */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Movimentação">
                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: TransactionType.DEBIT, label: 'Débito', icon: ArrowDownCircle, color: 'text-rose-500' },
                            { id: TransactionType.RECEIVE, label: 'Receita', icon: ArrowUpCircle, color: 'text-emerald-500' },
                            { id: TransactionType.CREDIT, label: 'Crédito', icon: CreditCard, color: 'text-primary-500' },
                        ].map(opt => (
                            <button 
                                key={opt.id} 
                                onClick={() => setFormData({...formData, type: opt.id})}
                                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${formData.type === opt.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-100 dark:border-gray-700 hover:border-gray-200'}`}
                            >
                                <opt.icon size={24} className={opt.color} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{opt.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Valor</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Data</label>
                                <input 
                                    type="date" 
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                    value={formData.date}
                                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Descrição</label>
                            <input 
                                type="text" 
                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="Onde foi gasto?"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Categoria</label>
                            <select 
                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                            >
                                {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <Button fullWidth size="lg" onClick={handleSave} className="py-4 shadow-xl shadow-primary-500/20">
                        Finalizar Registro
                    </Button>
                </div>
            </Modal>
        </div>
    );
};
