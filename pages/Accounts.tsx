
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { Plus, Building2, Wallet, Trash2, Radio, Sparkles } from 'lucide-react';
import { Account, AccountType, User, PlanType } from '../types';
import { usePersistentData } from '../hooks/usePersistentData';
import { supabase } from '../services/supabaseClient';

interface AccountsProps {
    user: User;
}

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
    [AccountType.CHECKING]: 'Corrente',
    [AccountType.SAVINGS]: 'Poupança',
    [AccountType.PAYMENT]: 'Digital',
    [AccountType.PJ]: 'Empresarial',
};

export const Accounts: React.FC<AccountsProps> = ({ user }) => {
    const { addToast } = useToast();
    const { loadUserData, setupRealtimeSubscriptions } = usePersistentData();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLive, setIsLive] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        institution: '',
        type: AccountType.CHECKING,
        balance: ''
    });

    const fetchData = useCallback(async () => {
        const data = await loadUserData();
        setAccounts(data.accounts);
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
        if (!formData.institution || !formData.balance) return;
        
        try {
            const accData = {
                user_id: user.id,
                institution_name: formData.institution,
                account_type: formData.type,
                balance: parseFloat(formData.balance),
                created_at: new Date().toISOString()
            };

            await supabase.from('accounts').insert([accData]);
            addToast("Conta adicionada com sucesso!", "success");
            setIsFormModalOpen(false);
            setFormData({ institution: '', type: AccountType.CHECKING, balance: '' });
        } catch (error) {
            addToast("Falha ao salvar conta", "error");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Remover conta permanentemente?")) {
            await supabase.from('accounts').update({ deleted_at: new Date().toISOString() }).eq('id', id);
            addToast("Conta removida", "info");
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-24">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Patrimônio</h1>
                        <p className="text-sm text-gray-500 font-medium">Suas fontes de liquidez.</p>
                    </div>
                    {isLive && (
                        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase border border-emerald-100 animate-pulse">
                            <Radio size={12} /> Live Sync
                        </div>
                    )}
                </div>
                <Button onClick={() => setIsFormModalOpen(true)} className="h-12 bg-primary-600 hover:bg-primary-700 shadow-xl shadow-primary-500/20 px-8">
                    <Plus size={20} className="mr-2" /> Adicionar Conta
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map(acc => (
                    <Card key={acc.id} className="group relative bg-white dark:bg-gray-800 border-none shadow-sm hover:shadow-xl transition-all p-8 rounded-[2.5rem] overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
                        
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="w-14 h-14 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center text-primary-600 shadow-inner">
                                <Building2 size={28} />
                            </div>
                            <button onClick={() => handleDelete(acc.id)} className="p-2 text-gray-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">{acc.institution_name}</h3>
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">{ACCOUNT_TYPE_LABELS[acc.account_type]}</span>
                        </div>

                        <div className="mt-10 pt-6 border-t border-gray-50 dark:border-gray-700 relative z-10">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Saldo Disponível</p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acc.balance)}
                            </p>
                        </div>
                    </Card>
                ))}

                {accounts.length === 0 && (
                    <Card className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-200 dark:border-gray-700 bg-transparent rounded-[2.5rem]">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-300">
                            <Wallet size={32} />
                        </div>
                        <h3 className="font-black text-gray-900 dark:text-white">Nenhuma conta ativa</h3>
                        <p className="text-xs text-gray-400 mt-2 max-w-[200px]">Conecte suas instituições para começar o rastreio.</p>
                    </Card>
                )}
            </div>

            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title="Conectar Instituição">
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nome do Banco</label>
                        <input 
                            type="text" 
                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="Ex: Nubank, Itaú..."
                            value={formData.institution}
                            onChange={(e) => setFormData({...formData, institution: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tipo de Conta</label>
                            <select 
                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value as AccountType})}
                            >
                                {Object.entries(ACCOUNT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Saldo Atual</label>
                            <input 
                                type="number" 
                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="0.00"
                                value={formData.balance}
                                onChange={(e) => setFormData({...formData, balance: e.target.value})}
                            />
                        </div>
                    </div>
                    <Button fullWidth size="lg" onClick={handleSave} className="py-4 shadow-xl shadow-primary-500/20">
                        Confirmar Conexão
                    </Button>
                </div>
            </Modal>
        </div>
    );
};
