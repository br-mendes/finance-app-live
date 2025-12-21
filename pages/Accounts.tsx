import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Plus, Edit2, Trash2, Building2, Wallet, Lock, Crown } from 'lucide-react';
import { Account, AccountType, User, PlanType } from '../types';

interface AccountsProps {
    user: User;
}

// Initial Mock Data
const INITIAL_ACCOUNTS: Account[] = [
    {
        id: '1',
        user_id: '123',
        account_type: AccountType.CHECKING,
        institution_name: 'Nubank',
        balance: 1250.50,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
    }
];

const BANK_SUGGESTIONS = [
    "Nubank", "Itaú", "Bradesco", "Banco do Brasil", "Caixa", "Santander", 
    "Inter", "C6 Bank", "BTG Pactual", "XP Investimentos", "Banco Original", 
    "Neon", "Next", "Sicoob", "Sicredi", "Mercado Pago", "PicPay"
];

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
    [AccountType.CHECKING]: 'Conta Corrente',
    [AccountType.SAVINGS]: 'Conta Poupança',
    [AccountType.PAYMENT]: 'Conta de Pagamentos',
    [AccountType.PJ]: 'Conta PJ',
};

export const Accounts: React.FC<AccountsProps> = ({ user }) => {
    const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
    
    // Modal States
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
    
    // Form States
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [formData, setFormData] = useState({
        institution_name: '',
        account_type: AccountType.CHECKING,
        balance: '',
        updated_at: new Date().toISOString().split('T')[0]
    });

    const isFreePlan = user.plan === PlanType.FREE;

    // Helper: Reset Form
    const resetForm = () => {
        setFormData({
            institution_name: '',
            account_type: AccountType.CHECKING,
            balance: '',
            updated_at: new Date().toISOString().split('T')[0]
        });
        setEditingAccount(null);
    };

    // Helper: Open Form (Check Limits)
    const handleOpenForm = (accountToEdit?: Account) => {
        if (!accountToEdit && isFreePlan && accounts.length >= 1) {
            setIsPremiumModalOpen(true);
            return;
        }

        if (accountToEdit) {
            setEditingAccount(accountToEdit);
            setFormData({
                institution_name: accountToEdit.institution_name,
                account_type: accountToEdit.account_type,
                balance: accountToEdit.balance.toString(),
                updated_at: new Date(accountToEdit.updated_at).toISOString().split('T')[0]
            });
        } else {
            resetForm();
        }
        setIsFormModalOpen(true);
    };

    // Helper: Save Form
    const handleSave = () => {
        if (!formData.institution_name || !formData.balance) return; // Simple validation

        const balanceNum = parseFloat(formData.balance.replace(',', '.'));
        
        if (editingAccount) {
            // Update existing
            setAccounts(prev => prev.map(acc => 
                acc.id === editingAccount.id 
                ? { 
                    ...acc, 
                    institution_name: formData.institution_name, 
                    account_type: formData.account_type, 
                    balance: balanceNum, 
                    updated_at: new Date(formData.updated_at).toISOString() 
                  } 
                : acc
            ));
        } else {
            // Create new
            const newAccount: Account = {
                id: Date.now().toString(),
                user_id: user.id,
                institution_name: formData.institution_name,
                account_type: formData.account_type,
                balance: balanceNum,
                updated_at: new Date(formData.updated_at).toISOString(),
                created_at: new Date().toISOString()
            };
            setAccounts(prev => [...prev, newAccount]);
        }

        setIsFormModalOpen(false);
        resetForm();
    };

    // Helper: Delete
    const handleDelete = (id: string) => {
        if (window.confirm("Tem certeza que deseja remover esta conta?")) {
            setAccounts(prev => prev.filter(a => a.id !== id));
        }
    };

    // Helper: Bank Styling
    const getBankStyle = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('nubank')) return 'bg-purple-600 text-white';
        if (n.includes('itaú') || n.includes('itau')) return 'bg-orange-600 text-white';
        if (n.includes('bradesco')) return 'bg-red-600 text-white';
        if (n.includes('brasil')) return 'bg-yellow-400 text-blue-900';
        if (n.includes('caixa')) return 'bg-blue-600 text-white';
        if (n.includes('santander')) return 'bg-red-700 text-white';
        if (n.includes('inter')) return 'bg-orange-400 text-white';
        if (n.includes('c6')) return 'bg-gray-900 text-white';
        return 'bg-gray-100 text-gray-600';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Minhas Contas</h1>
                    <p className="text-sm text-gray-500">Gerencie seus saldos bancários</p>
                </div>
                <Button onClick={() => handleOpenForm()}>
                    <Plus size={18} className="mr-2" />
                    Nova Conta
                </Button>
            </div>

            {/* Plan Usage Banner (Visible only for Free users) */}
            {isFreePlan && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r flex items-center justify-between">
                    <div className="flex items-center">
                         <div className="flex-shrink-0">
                            <Wallet className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                Plano Free: <span className="font-bold">{accounts.length}</span>/1 conta utilizada.
                            </p>
                        </div>
                    </div>
                    {accounts.length >= 1 && (
                         <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">Limite Atingido</span>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {accounts.map((account) => (
                    <Card key={account.id} className="relative group hover:shadow-md transition-shadow">
                        <div className="absolute top-4 right-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex gap-2">
                             <button 
                                onClick={() => handleOpenForm(account)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Editar"
                             >
                                <Edit2 size={16} />
                             </button>
                             <button 
                                onClick={() => handleDelete(account.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Deletar"
                             >
                                <Trash2 size={16} />
                             </button>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${getBankStyle(account.institution_name)}`}>
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 line-clamp-1">{account.institution_name}</h3>
                                <p className="text-sm text-gray-500">{ACCOUNT_TYPE_LABELS[account.account_type]}</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Saldo Atual</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(account.balance)}
                            </p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                            <span>Atualizado em: {new Date(account.updated_at).toLocaleDateString()}</span>
                        </div>
                    </Card>
                ))}

                {/* Add New Card Placeholder (if list is empty) */}
                {accounts.length === 0 && (
                    <button 
                        onClick={() => handleOpenForm()}
                        className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                            <Plus size={24} className="text-gray-400 group-hover:text-primary-600" />
                        </div>
                        <p className="font-medium text-gray-500 group-hover:text-primary-700">Adicionar primeira conta</p>
                    </button>
                )}
            </div>

            {/* Account Form Modal */}
            <Modal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                title={editingAccount ? "Editar Conta" : "Nova Conta"}
                footer={
                    <>
                        <Button onClick={handleSave}>Salvar</Button>
                        <Button variant="secondary" onClick={() => setIsFormModalOpen(false)} className="mr-3">Cancelar</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Conta</label>
                        <select 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                            value={formData.account_type}
                            onChange={(e) => setFormData({...formData, account_type: e.target.value as AccountType})}
                        >
                            <option value={AccountType.CHECKING}>Corrente</option>
                            <option value={AccountType.SAVINGS}>Poupança</option>
                            <option value={AccountType.PAYMENT}>Pagamento</option>
                            <option value={AccountType.PJ}>Pessoa Jurídica (PJ)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Instituição Financeira</label>
                        <input 
                            list="banks" 
                            type="text" 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                            placeholder="Busque ou digite..."
                            value={formData.institution_name}
                            onChange={(e) => setFormData({...formData, institution_name: e.target.value})}
                        />
                        <datalist id="banks">
                            {BANK_SUGGESTIONS.map(bank => <option key={bank} value={bank} />)}
                        </datalist>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Saldo Atual (R$)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                placeholder="0,00"
                                value={formData.balance}
                                onChange={(e) => setFormData({...formData, balance: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Data do Saldo</label>
                            <input 
                                type="date" 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                value={formData.updated_at}
                                onChange={(e) => setFormData({...formData, updated_at: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Premium Limit Modal */}
            <Modal
                isOpen={isPremiumModalOpen}
                onClose={() => setIsPremiumModalOpen(false)}
                title="Limite Atingido 🔒"
                footer={
                    <div className="w-full flex flex-col sm:flex-row gap-2">
                        <Button className="w-full sm:w-auto flex-1 bg-gradient-to-r from-amber-400 to-yellow-600 border-none">
                            <Crown size={16} className="mr-2" />
                            Quero ser Premium
                        </Button>
                        <Button variant="secondary" onClick={() => setIsPremiumModalOpen(false)} className="w-full sm:w-auto">
                            Fechar
                        </Button>
                    </div>
                }
            >
                <div className="text-center py-4">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-4">
                        <Lock className="h-8 w-8 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Desbloqueie Contas Ilimitadas</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        No plano Free, você pode gerenciar apenas 1 conta bancária. 
                        Faça o upgrade para Premium e cadastre quantas contas quiser, além de desbloquear gráficos avançados.
                    </p>
                </div>
            </Modal>
        </div>
    );
};