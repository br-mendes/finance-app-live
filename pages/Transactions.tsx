import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { 
    Plus, Search, Filter, ArrowDownCircle, ArrowUpCircle, 
    DollarSign, Download, CreditCard, Trash2, Edit2, 
    ChevronLeft, ChevronRight, Lock, Calendar, Wallet 
} from 'lucide-react';
import { Transaction, TransactionType, User, PlanType, Account, CreditCard as CreditCardType } from '../types';
import { CATEGORIES } from '../constants';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { transactionSchema } from '../utils/schemas';

interface TransactionsProps {
    user: User;
}

// Initial Mock Data
const INITIAL_TRANSACTIONS: Transaction[] = [
    {
        id: '1',
        date: new Date().toISOString(),
        description: 'Bônus Anual',
        category: 'Salário',
        type: TransactionType.RECEIVE,
        amount: 2500.00,
        account_id: '1'
    }
];

const ITEMS_PER_PAGE = 50;

export const Transactions: React.FC<TransactionsProps> = ({ user }) => {
    const { addToast } = useToast();
    
    // --- Data State ---
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [cards, setCards] = useState<CreditCardType[]>([]);

    // --- Filter State ---
    const [filters, setFilters] = useState({
        searchTerm: '',
        type: 'all',
        category: 'all',
        period: '30', // days
        minAmount: '',
        maxAmount: ''
    });

    // --- Pagination State ---
    const [currentPage, setCurrentPage] = useState(1);

    // --- Modal & Form State ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        type: TransactionType.DEBIT as TransactionType,
        date: new Date().toISOString().split('T')[0],
        amount: '',
        description: '',
        category: 'Outros créditos',
        accountId: '',
        cardId: '',
        isInstallment: false,
        installmentsCount: 2
    });

    // --- Load Data on Mount ---
    useEffect(() => {
        const storedTrans = localStorage.getItem('financeapp_transactions');
        if (storedTrans) {
            setTransactions(JSON.parse(storedTrans));
        } else {
            setTransactions(INITIAL_TRANSACTIONS);
        }

        const storedAccounts = localStorage.getItem('financeapp_accounts'); 
        if (storedAccounts) {
            setAccounts(JSON.parse(storedAccounts));
        } else {
             const mockAccounts: Account[] = [{id: '1', user_id: user.id, account_type: 'checking' as any, institution_name: 'Conta Principal', balance: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString()}];
             setAccounts(mockAccounts);
             localStorage.setItem('financeapp_accounts', JSON.stringify(mockAccounts));
        }

        const storedCards = localStorage.getItem('financeapp_cards'); 
        if (storedCards) {
            setCards(JSON.parse(storedCards));
        }
    }, [user.id]);

    useEffect(() => {
        localStorage.setItem('financeapp_transactions', JSON.stringify(transactions));
    }, [transactions]);

    // --- Filter Logic ---
    const filteredTransactions = transactions.filter(t => {
        if (filters.searchTerm && !t.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
        if (filters.type !== 'all' && t.type !== filters.type) return false;
        if (filters.category !== 'all' && t.category !== filters.category) return false;

        const transDate = new Date(t.date);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - transDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if (filters.period !== 'all' && diffDays > parseInt(filters.period)) return false;

        if (filters.minAmount && t.amount < parseFloat(filters.minAmount)) return false;
        if (filters.maxAmount && t.amount > parseFloat(filters.maxAmount)) return false;

        return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // --- Pagination Logic ---
    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
    const paginatedData = filteredTransactions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE, 
        currentPage * ITEMS_PER_PAGE
    );

    // --- Form Handlers ---

    const handleOpenModal = (trans?: Transaction) => {
        if (trans) {
            setEditingId(trans.id);
            setFormData({
                type: trans.type,
                date: trans.date.split('T')[0],
                amount: trans.amount.toString(),
                description: trans.description,
                category: trans.category,
                accountId: trans.account_id || '',
                cardId: trans.credit_card_id || '',
                isInstallment: !!trans.total_installments,
                installmentsCount: trans.total_installments || 2
            });
        } else {
            setEditingId(null);
            setFormData({
                type: TransactionType.DEBIT,
                date: new Date().toISOString().split('T')[0],
                amount: '',
                description: '',
                category: 'Outros créditos',
                accountId: accounts[0]?.id || '',
                cardId: cards[0]?.id || '',
                isInstallment: false,
                installmentsCount: 2
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = () => {
        const amountVal = parseFloat(formData.amount.replace(',', '.'));

        // Prepare data for Zod validation
        const dataToValidate = {
            ...formData,
            amount: amountVal,
            // Only send relevant ID based on type for checking, 
            // though schema handles optionality.
            accountId: formData.accountId || undefined,
            cardId: formData.cardId || undefined
        };

        const validation = transactionSchema.safeParse(dataToValidate);

        if (!validation.success) {
            const firstError = validation.error.issues[0].message;
            addToast(firstError, "error");
            return;
        }

        const newTransactions: Transaction[] = [];
        
        const baseTrans: Transaction = {
            id: editingId || Date.now().toString(),
            description: formData.description,
            amount: amountVal,
            type: formData.type,
            category: formData.category,
            date: formData.date,
        };

        if (formData.type === TransactionType.DEBIT) {
            baseTrans.account_id = formData.accountId;

            if (!editingId) { 
                const updatedAccounts = accounts.map(acc => {
                    if (acc.id === formData.accountId) {
                        return { ...acc, balance: acc.balance - amountVal };
                    }
                    return acc;
                });
                setAccounts(updatedAccounts);
                localStorage.setItem('financeapp_accounts', JSON.stringify(updatedAccounts));
            }
            newTransactions.push(baseTrans);

        } else if (formData.type === TransactionType.RECEIVE) {
            baseTrans.account_id = formData.accountId;

            if (!editingId) {
                const updatedAccounts = accounts.map(acc => {
                    if (acc.id === formData.accountId) {
                        return { ...acc, balance: acc.balance + amountVal };
                    }
                    return acc;
                });
                setAccounts(updatedAccounts);
                localStorage.setItem('financeapp_accounts', JSON.stringify(updatedAccounts));
            }
            newTransactions.push(baseTrans);

        } else if (formData.type === TransactionType.CREDIT) {
            baseTrans.credit_card_id = formData.cardId;

            if (!editingId) {
                const updatedCards = cards.map(c => {
                    if (c.id === formData.cardId) {
                        return { ...c, limit_amount: c.limit_amount - amountVal };
                    }
                    return c;
                });
                setCards(updatedCards);
                localStorage.setItem('financeapp_cards', JSON.stringify(updatedCards));
            }

            if (formData.isInstallment && !editingId) {
                const count = formData.installmentsCount;
                const installmentValue = amountVal / count;
                const baseDate = new Date(formData.date);

                for (let i = 0; i < count; i++) {
                    const nextDate = new Date(baseDate);
                    nextDate.setMonth(baseDate.getMonth() + i); 
                    
                    newTransactions.push({
                        ...baseTrans,
                        id: `${Date.now()}-${i}`,
                        date: nextDate.toISOString(),
                        description: `${formData.description} (${i+1}/${count})`,
                        amount: parseFloat(installmentValue.toFixed(2)),
                        total_installments: count,
                        installment_number: i + 1
                    });
                }
            } else {
                newTransactions.push(baseTrans);
            }
        }

        if (editingId) {
            setTransactions(prev => prev.map(t => t.id === editingId ? { ...baseTrans, date: new Date(formData.date).toISOString() } : t));
            addToast("Transação atualizada com sucesso!", "success");
        } else {
            const finalTrans = newTransactions.map(t => ({...t, date: new Date(t.date).toISOString() }));
            setTransactions(prev => [...finalTrans, ...prev]);
            addToast("Transação criada com sucesso!", "success");
        }

        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Deseja realmente excluir?")) {
            setTransactions(prev => prev.filter(t => t.id !== id));
            addToast("Transação excluída.", "info");
        }
    };

    const handleClearFilters = () => {
        setFilters({
            searchTerm: '',
            type: 'all',
            category: 'all',
            period: '30',
            minAmount: '',
            maxAmount: ''
        });
    };

    const handleExport = (format: 'csv' | 'pdf') => {
        if (user.plan === PlanType.FREE) {
            setIsPremiumModalOpen(true);
            return;
        }

        if (format === 'csv') {
            const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'];
            const csvContent = "data:text/csv;charset=utf-8," 
                + headers.join(",") + "\n"
                + filteredTransactions.map(t => {
                    return `${new Date(t.date).toLocaleDateString()},"${t.description}",${t.category},${t.type},${t.amount}`;
                }).join("\n");
            
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "transacoes_financeapp.csv");
            document.body.appendChild(link);
            link.click();
        } else {
             const doc = new jsPDF();
             doc.text("Relatório de Transações - FinanceAPP", 14, 20);
             doc.setFontSize(10);
             doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 26);
             
             const tableColumn = ["Data", "Descrição", "Categoria", "Tipo", "Valor"];
             const tableRows: any[] = [];
     
             filteredTransactions.forEach(t => {
                 const ticketData = [
                     new Date(t.date).toLocaleDateString(),
                     t.description,
                     t.category,
                     t.type === 'receive' ? 'Receita' : t.type === 'debit' ? 'Débito' : 'Crédito',
                     `R$ ${t.amount.toFixed(2)}`
                 ];
                 tableRows.push(ticketData);
             });
     
             // @ts-ignore
             autoTable(doc, {
                 head: [tableColumn],
                 body: tableRows,
                 startY: 30,
             });
     
             doc.save("transacoes_financeapp.pdf");
        }
        addToast("Download iniciado.", "success");
    };

    return (
        <div className="space-y-6">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Transações</h1>
                    <p className="text-sm text-gray-500">Histórico completo de movimentações</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative group">
                        <Button variant="outline" className={user.plan === PlanType.FREE ? 'opacity-70' : ''}>
                            <Download size={18} className="mr-2" />
                            Exportar
                            {user.plan === PlanType.FREE && <Lock size={12} className="ml-2" />}
                        </Button>
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-20 border border-gray-100">
                            <button onClick={() => handleExport('csv')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">CSV</button>
                            <button onClick={() => handleExport('pdf')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">PDF</button>
                        </div>
                    </div>
                    <Button onClick={() => handleOpenModal()}>
                        <Plus size={18} className="mr-2" />
                        Nova Transação
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="!p-4">
                <div className="space-y-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                            <label htmlFor="search" className="sr-only">Buscar transações</label>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="search"
                                type="text"
                                className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                placeholder="Buscar por descrição..."
                                value={filters.searchTerm}
                                onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <select 
                                aria-label="Filtrar por período"
                                className="rounded-md border-gray-300 border p-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                                value={filters.period}
                                onChange={(e) => setFilters({...filters, period: e.target.value})}
                            >
                                <option value="all">Todo período</option>
                                <option value="7">7 dias</option>
                                <option value="15">15 dias</option>
                                <option value="30">30 dias</option>
                                <option value="90">90 dias</option>
                                <option value="180">6 meses</option>
                            </select>
                            <select 
                                aria-label="Filtrar por tipo"
                                className="rounded-md border-gray-300 border p-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                                value={filters.type}
                                onChange={(e) => setFilters({...filters, type: e.target.value})}
                            >
                                <option value="all">Todos os tipos</option>
                                <option value={TransactionType.DEBIT}>Débito</option>
                                <option value={TransactionType.CREDIT}>Crédito</option>
                                <option value={TransactionType.RECEIVE}>Receita</option>
                            </select>
                            <select 
                                aria-label="Filtrar por categoria"
                                className="rounded-md border-gray-300 border p-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                                value={filters.category}
                                onChange={(e) => setFilters({...filters, category: e.target.value})}
                            >
                                <option value="all">Todas categorias</option>
                                {CATEGORIES.map(c => (
                                    <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                             <input 
                                aria-label="Valor mínimo"
                                type="number" 
                                placeholder="Min R$" 
                                className="w-24 border rounded p-1"
                                value={filters.minAmount}
                                onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
                             />
                             <span>até</span>
                             <input 
                                aria-label="Valor máximo"
                                type="number" 
                                placeholder="Max R$" 
                                className="w-24 border rounded p-1"
                                value={filters.maxAmount}
                                onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
                             />
                        </div>
                        <button onClick={handleClearFilters} className="text-primary-600 hover:text-primary-800 font-medium">
                            Limpar Filtros
                        </button>
                    </div>
                </div>
            </Card>

            {/* Transactions List */}
            <Card className="overflow-hidden !p-0">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedData.map((t) => {
                                const isReceive = t.type === TransactionType.RECEIVE;
                                const isCredit = t.type === TransactionType.CREDIT;
                                const categoryIcon = CATEGORIES.find(c => c.name === t.category)?.icon || '📦';
                                
                                return (
                                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(t.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {t.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {categoryIcon} {t.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {isReceive ? (
                                                <span className="text-green-600 flex items-center gap-1"><ArrowUpCircle size={14}/> Receita</span>
                                            ) : isCredit ? (
                                                <span className="text-orange-600 flex items-center gap-1"><CreditCard size={14}/> Crédito</span>
                                            ) : (
                                                <span className="text-red-600 flex items-center gap-1"><ArrowDownCircle size={14}/> Débito</span>
                                            )}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${isReceive ? 'text-green-600' : 'text-red-600'}`}>
                                            {isReceive ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleOpenModal(t)} className="text-primary-600 hover:text-primary-900 mr-3" aria-label="Editar transação">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:text-red-900" aria-label="Excluir transação">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                             {paginatedData.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Nenhuma transação encontrada com os filtros atuais.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 flex justify-between items-center">
                        <div className="text-sm text-gray-700">
                            Página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{totalPages}</span>
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                aria-label="Página anterior"
                            >
                                <ChevronLeft size={16} />
                            </Button>
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                                aria-label="Próxima página"
                            >
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? "Editar Transação" : "Nova Transação"}
                footer={
                    <>
                        <Button onClick={handleSave}>Salvar</Button>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="mr-3">Cancelar</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    {/* Step 1: Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Transação</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: TransactionType.DEBIT, label: 'Débito', icon: ArrowDownCircle, color: 'text-red-600', bg: 'bg-red-50 ring-red-500' },
                                { id: TransactionType.RECEIVE, label: 'Receita', icon: ArrowUpCircle, color: 'text-green-600', bg: 'bg-green-50 ring-green-500' },
                                { id: TransactionType.CREDIT, label: 'Crédito', icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-50 ring-orange-500' },
                            ].map((opt) => (
                                <div 
                                    key={opt.id}
                                    onClick={() => setFormData({...formData, type: opt.id})}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Selecionar tipo ${opt.label}`}
                                    className={`
                                        cursor-pointer rounded-lg border p-3 flex flex-col items-center justify-center gap-2 transition-all
                                        ${formData.type === opt.id ? `border-transparent ring-2 ${opt.bg}` : 'border-gray-200 hover:bg-gray-50'}
                                    `}
                                >
                                    <opt.icon size={20} className={opt.color} />
                                    <span className={`text-xs font-bold ${opt.color}`}>{opt.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step 2: Basic Data */}
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="trans-date" className="block text-sm font-medium text-gray-700">Data</label>
                            <input 
                                id="trans-date"
                                type="date" 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label htmlFor="trans-amount" className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                            <input 
                                id="trans-amount"
                                type="number" 
                                step="0.01"
                                placeholder="0,00"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                value={formData.amount}
                                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="trans-desc" className="block text-sm font-medium text-gray-700">Descrição</label>
                        <input 
                            id="trans-desc"
                            type="text" 
                            maxLength={200}
                            placeholder="Ex: Supermercado"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div>
                        <label htmlFor="trans-category" className="block text-sm font-medium text-gray-700">Categoria</label>
                        <select 
                            id="trans-category"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                        >
                            {CATEGORIES.map(c => (
                                <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Step 3: Conditional Logic */}
                    {(formData.type === TransactionType.DEBIT || formData.type === TransactionType.RECEIVE) && (
                         <div>
                            <label htmlFor="trans-account" className="block text-sm font-medium text-gray-700">Conta Bancária</label>
                            {accounts.length > 0 ? (
                                <select 
                                    id="trans-account"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                    value={formData.accountId}
                                    onChange={(e) => setFormData({...formData, accountId: e.target.value})}
                                >
                                    <option value="" disabled>Selecione...</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.institution_name} (R$ {acc.balance.toFixed(2)})</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="text-sm text-red-500 mt-1 flex items-center gap-1">
                                    <Wallet size={14}/> Nenhuma conta cadastrada. Cadastre em "Minhas Contas".
                                </div>
                            )}
                        </div>
                    )}

                    {formData.type === TransactionType.CREDIT && (
                        <>
                             <div>
                                <label htmlFor="trans-card" className="block text-sm font-medium text-gray-700">Cartão de Crédito</label>
                                {cards.length > 0 ? (
                                    <select 
                                        id="trans-card"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                        value={formData.cardId}
                                        onChange={(e) => setFormData({...formData, cardId: e.target.value})}
                                    >
                                        <option value="" disabled>Selecione...</option>
                                        {cards.map(c => (
                                            <option key={c.id} value={c.id}>{c.issuer_bank} (Final {c.last_four_digits})</option>
                                        ))}
                                    </select>
                                ) : (
                                     <div className="text-sm text-red-500 mt-1 flex items-center gap-1">
                                        <CreditCard size={14}/> Nenhum cartão cadastrado.
                                    </div>
                                )}
                            </div>

                            {!editingId && ( // Only show installment options on Create
                                <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <input 
                                            type="checkbox" 
                                            id="installments"
                                            checked={formData.isInstallment}
                                            onChange={(e) => setFormData({...formData, isInstallment: e.target.checked})}
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="installments" className="text-sm font-medium text-gray-700">Compra Parcelada?</label>
                                    </div>

                                    {formData.isInstallment && (
                                        <div>
                                            <label htmlFor="trans-installments" className="block text-xs font-medium text-gray-500">Número de Parcelas</label>
                                            <select 
                                                id="trans-installments"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                                value={formData.installmentsCount}
                                                onChange={(e) => setFormData({...formData, installmentsCount: parseInt(e.target.value)})}
                                            >
                                                {[2,3,4,5,6,7,8,9,10,11,12].map(n => (
                                                    <option key={n} value={n}>{n}x</option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Serão geradas {formData.installmentsCount} transações futuras automaticamente. O limite total será descontado agora.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Modal>

            {/* Premium Modal */}
            <Modal
                isOpen={isPremiumModalOpen}
                onClose={() => setIsPremiumModalOpen(false)}
                title="Funcionalidade Premium"
                footer={
                     <Button variant="secondary" onClick={() => setIsPremiumModalOpen(false)} className="w-full">
                        Entendi
                    </Button>
                }
            >
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 mb-4">
                        <Lock className="h-6 w-6 text-amber-600" />
                    </div>
                    <p className="text-gray-600">A exportação de dados é exclusiva para assinantes Premium. Faça o upgrade para desbloquear.</p>
                </div>
            </Modal>
        </div>
    );
};