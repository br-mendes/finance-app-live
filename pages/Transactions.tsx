import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../hooks/useAuth';
import { usePersistentData } from '../hooks/usePersistentData';
import { supabase } from '../services/supabaseClient';
import {
  Plus, Search, ArrowDownCircle, ArrowUpCircle,
  CreditCard, Trash, Radio,
} from 'lucide-react';
import { Transaction, TransactionType, Account, CreditCard as CreditCardType } from '../types';
import { CATEGORIES } from '../constants';

const ITEMS_PER_PAGE = 20;

type Filters = { searchTerm: string; type: string; category: string };

const DEFAULT_FORM = {
  type: TransactionType.DEBIT,
  date: new Date().toISOString().split('T')[0],
  amount: '',
  description: '',
  category: CATEGORIES[0].name,
  accountId: '',
  cardId: '',
};

export const Transactions: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { loadUserData, setupRealtimeSubscriptions } = usePersistentData();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cards, setCards] = useState<CreditCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [saving, setSaving] = useState(false);

  const [filters, setFilters] = useState<Filters>({ searchTerm: '', type: 'all', category: 'all' });
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);

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

  const resetForm = () => {
    setFormData({
      ...DEFAULT_FORM,
      date: new Date().toISOString().split('T')[0],
      accountId: accounts[0]?.id || '',
      cardId: cards[0]?.id || '',
    });
    setEditingId(null);
  };

  const handleOpenModal = (t?: Transaction) => {
    if (t) {
      setEditingId(t.id);
      setFormData({
        type: t.type,
        date: t.date.split('T')[0],
        amount: t.amount.toString(),
        description: t.description,
        category: t.category,
        accountId: t.account_id || accounts[0]?.id || '',
        cardId: t.credit_card_id || cards[0]?.id || '',
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.description.trim() || !formData.amount) {
      addToast('Preencha os campos obrigatórios.', 'error');
      return;
    }
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      addToast('Valor inválido.', 'error');
      return;
    }
    if (!user?.id) return;

    const isCredit = formData.type === TransactionType.CREDIT;
    const transData = {
      user_id: user.id,
      description: formData.description.trim(),
      amount,
      type: formData.type,
      category: formData.category,
      date: new Date(formData.date + 'T12:00:00').toISOString(),
      account_id: !isCredit ? (formData.accountId || null) : null,
      credit_card_id: isCredit ? (formData.cardId || null) : null,
      updated_at: new Date().toISOString(),
    };

    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase.from('transactions').update(transData).eq('id', editingId);
        if (error) throw error;
        addToast('Transação atualizada!', 'success');
      } else {
        const { error } = await supabase.from('transactions').insert([{
          ...transData,
          created_at: new Date().toISOString(),
        }]);
        if (error) throw error;
        addToast('Transação criada!', 'success');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch {
      addToast('Erro ao salvar transação.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta transação?')) return;
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      addToast('Transação excluída.', 'info');
      fetchData();
    } catch {
      addToast('Erro ao excluir.', 'error');
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

  const isCredit = formData.type === TransactionType.CREDIT;
  const needsCard = isCredit;
  const needsAccount = !isCredit;

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
              <Radio size={12} /> Live
            </div>
          )}
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="h-11 bg-primary-600 hover:bg-primary-700 shadow-xl shadow-primary-500/20"
        >
          <Plus size={18} className="mr-2" /> Nova
        </Button>
      </div>

      {/* Filtros */}
      <Card className="!p-4 border-none shadow-sm dark:bg-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar transação..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
              value={filters.searchTerm}
              onChange={(e) => { setFilters({ ...filters, searchTerm: e.target.value }); setCurrentPage(1); }}
            />
          </div>
          <select
            className="bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            value={filters.type}
            onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setCurrentPage(1); }}
          >
            <option value="all">Todos os Tipos</option>
            <option value="receive">Receita</option>
            <option value="debit">Débito</option>
            <option value="credit">Crédito</option>
          </select>
          <select
            className="bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            value={filters.category}
            onChange={(e) => { setFilters({ ...filters, category: e.target.value }); setCurrentPage(1); }}
          >
            <option value="all">Todas as Categorias</option>
            {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        </div>
      </Card>

      {/* Tabela */}
      <Card className="!p-0 border-none shadow-sm overflow-hidden dark:bg-gray-800">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />)}
          </div>
        ) : (
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
                  const isIncome = t.type === TransactionType.RECEIVE;
                  return (
                    <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(t.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          {t.type === TransactionType.CREDIT && <CreditCard size={14} className="text-primary-500" />}
                          {t.description}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 tracking-wider">
                          {CATEGORIES.find(c => c.name === t.category)?.icon || '💰'} {t.category}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right text-sm font-black ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isIncome ? '+' : '-'}{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-gray-400 text-sm italic">
                      {loading ? 'Carregando...' : 'Nenhuma transação encontrada.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs text-gray-500">{filteredTransactions.length} resultados</span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Anterior
              </button>
              <span className="px-3 py-1 text-xs text-gray-600 dark:text-gray-300">{currentPage}/{totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal: Nova Transação */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }} title={editingId ? 'Editar Transação' : 'Nova Movimentação'}>
        <div className="space-y-5">
          {/* Tipo */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: TransactionType.DEBIT, label: 'Débito', icon: ArrowDownCircle, color: 'text-rose-500' },
              { id: TransactionType.RECEIVE, label: 'Receita', icon: ArrowUpCircle, color: 'text-emerald-500' },
              { id: TransactionType.CREDIT, label: 'Crédito', icon: CreditCard, color: 'text-primary-500' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setFormData({ ...formData, type: opt.id })}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${formData.type === opt.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-100 dark:border-gray-700 hover:border-gray-200'}`}
              >
                <opt.icon size={24} className={opt.color} />
                <span className="text-[10px] font-black uppercase tracking-widest">{opt.label}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Valor (R$)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Data</label>
              <input
                type="date"
                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Descrição</label>
            <input
              type="text"
              className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Onde foi gasto?"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Categoria</label>
            <select
              className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
            </select>
          </div>

          {needsCard && cards.length > 0 && (
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cartão de Crédito</label>
              <select
                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                value={formData.cardId}
                onChange={(e) => setFormData({ ...formData, cardId: e.target.value })}
              >
                <option value="">Selecione...</option>
                {cards.map(c => <option key={c.id} value={c.id}>{c.issuer_bank} •••• {c.last_four_digits}</option>)}
              </select>
            </div>
          )}

          {needsAccount && accounts.length > 0 && (
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Conta</label>
              <select
                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              >
                <option value="">Selecione...</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.institution_name}</option>)}
              </select>
            </div>
          )}

          <Button fullWidth size="lg" onClick={handleSave} loading={saving} className="py-4 shadow-xl shadow-primary-500/20">
            {editingId ? 'Salvar Alterações' : 'Registrar Transação'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
