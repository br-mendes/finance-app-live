import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { Plus, Edit2, Trash2, CheckCircle, Calendar, Lock, Crown, Lightbulb, Target } from 'lucide-react';
import { Goal, User, PlanType, Transaction, TransactionType } from '../types';

interface GoalsProps {
    user: User;
}

const EMOJI_OPTIONS = ['🏡', '🚗', '✈️', '💻', '🎓', '💪', '💍', '👶', '🎮', '📚', '🎵', '🐕', '⭐'];

export const Goals: React.FC<GoalsProps> = ({ user }) => {
    const { addToast } = useToast();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [totalSavings, setTotalSavings] = useState(0);

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        target_amount: '',
        deadline: '',
        icon: '🏡'
    });

    const isFreePlan = user.plan === PlanType.FREE;

    // Load Data
    useEffect(() => {
        // Load Goals from LocalStorage
        const storedGoals = localStorage.getItem('financeapp_goals');
        if (storedGoals) {
            setGoals(JSON.parse(storedGoals));
        } else {
             // Initial seed if empty
             const seed: Goal[] = [{
                 id: '1', user_id: user.id, name: 'Minha Primeira Meta', 
                 target_amount: 5000, current_amount: 0, icon: '🏡', created_at: new Date().toISOString()
             }];
             setGoals(seed);
             localStorage.setItem('financeapp_goals', JSON.stringify(seed));
        }

        // Calculate Savings from Transactions
        const storedTransactions = localStorage.getItem('financeapp_transactions');
        if (storedTransactions) {
            const transactions: Transaction[] = JSON.parse(storedTransactions);
            
            const savings = transactions
                .filter(t => 
                    (t.category === 'Metas' || t.category.includes('Metas')) && 
                    t.type === TransactionType.RECEIVE
                )
                .reduce((sum, t) => sum + t.amount, 0);
            
            setTotalSavings(savings);
        }
    }, [user.id]);

    // Save Goals - Fixed to persist even if goals array is empty
    const saveGoals = (updatedGoals: Goal[]) => {
        setGoals(updatedGoals);
        localStorage.setItem('financeapp_goals', JSON.stringify(updatedGoals));
    };

    // Helpers
    const resetForm = () => {
        setFormData({ name: '', target_amount: '', deadline: '', icon: '🏡' });
        setEditingId(null);
    };

    const handleOpenModal = (goal?: Goal) => {
        if (!goal && isFreePlan && goals.length >= 1) {
            setIsPremiumModalOpen(true);
            return;
        }

        if (goal) {
            setEditingId(goal.id);
            setFormData({
                name: goal.name,
                target_amount: goal.target_amount.toString(),
                deadline: goal.deadline || '',
                icon: goal.icon || '🏡'
            });
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!formData.name || !formData.target_amount) {
            addToast("Nome e Valor Alvo são obrigatórios.", "error");
            return;
        }

        const newGoal: Goal = {
            id: editingId || Date.now().toString(),
            user_id: user.id,
            name: formData.name,
            target_amount: parseFloat(formData.target_amount.replace(',', '.')),
            current_amount: 0, 
            deadline: formData.deadline || undefined,
            icon: formData.icon,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        let updatedGoals;
        if (editingId) {
            updatedGoals = goals.map(g => g.id === editingId ? { ...newGoal, created_at: g.created_at } : g);
            addToast("Meta atualizada!", "success");
        } else {
            updatedGoals = [...goals, newGoal];
            addToast("Meta criada com sucesso!", "success");
        }

        saveGoals(updatedGoals);
        setIsModalOpen(false);
        resetForm();
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Deseja remover esta meta?")) {
            const updatedGoals = goals.filter(g => g.id !== id);
            saveGoals(updatedGoals);
            addToast("Meta removida.", "info");
        }
    };

    const getDeadlineText = (deadline?: string) => {
        if (!deadline) return null;
        const today = new Date();
        today.setHours(0,0,0,0);
        const d = new Date(deadline);
        d.setHours(0,0,0,0);
        
        const diffTime = d.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return <span className="text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded text-xs">Atrasada há {Math.abs(diffDays)} dias</span>;
        if (diffDays === 0) return <span className="text-orange-500 font-bold bg-orange-50 px-2 py-0.5 rounded text-xs">Vence hoje!</span>;
        return <span className="text-gray-500 text-xs">Vence em {diffDays} dias</span>;
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Metas Financeiras</h1>
                    <p className="text-sm text-gray-500">Planeje e realize seus sonhos</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus size={18} className="mr-2" />
                    Nova Meta
                </Button>
            </div>

            {isFreePlan && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r flex items-center justify-between shadow-sm">
                    <div className="flex items-center">
                         <div className="flex-shrink-0">
                            <Target className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-800">
                                Plano Free: <span className="font-bold">{goals.length}</span>/1 meta utilizada.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-start gap-3 text-sm text-amber-800 shadow-sm">
                <Lightbulb size={20} className="flex-shrink-0 mt-0.5 text-amber-600" />
                <p>
                    <strong>Como funciona:</strong> O valor "Economizado" abaixo é a soma de todos os seus lançamentos de Receita categorizados como 
                    <span className="inline-block mx-1 bg-amber-100 border border-amber-200 px-1.5 rounded font-bold text-xs">🎯 Metas</span>.
                    Para aumentar este valor, vá em Transações e adicione uma nova Receita nesta categoria.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map((goal) => {
                    const currentAmount = totalSavings; 
                    const percentage = Math.min(100, Math.round((currentAmount / goal.target_amount) * 100));
                    const isCompleted = percentage >= 100;

                    return (
                        <Card key={goal.id} className={`relative flex flex-col h-full border-t-4 ${isCompleted ? 'border-t-green-500' : 'border-t-primary-500'} hover:shadow-lg transition-all`}>
                            <div className="absolute top-4 right-4 flex gap-2 z-10">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleOpenModal(goal); }}
                                    className="text-gray-400 hover:text-primary-600 p-1.5 bg-white/50 hover:bg-white rounded-full transition-all border border-transparent hover:border-gray-200 shadow-sm backdrop-blur-sm"
                                    title="Editar"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDelete(goal.id); }}
                                    className="text-gray-400 hover:text-red-600 p-1.5 bg-white/50 hover:bg-white rounded-full transition-all border border-transparent hover:border-gray-200 shadow-sm backdrop-blur-sm"
                                    title="Excluir"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="flex items-start gap-4 mb-6">
                                <div className="text-4xl bg-gray-50 p-4 rounded-2xl shadow-inner border border-gray-100">
                                    {goal.icon}
                                </div>
                                <div className="flex-1 min-w-0 pt-1">
                                    <h3 className="font-bold text-gray-900 text-lg truncate" title={goal.name}>{goal.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        {isCompleted ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700">
                                                <CheckCircle size={12} className="mr-1" /> Concluída
                                            </span>
                                        ) : (
                                            goal.deadline && (
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <Calendar size={12} className="mr-1" />
                                                    {getDeadlineText(goal.deadline)}
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto space-y-4">
                                <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Economizado</p>
                                        <span className={`text-2xl font-bold ${isCompleted ? 'text-green-600' : 'text-gray-900'}`}>
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(currentAmount)}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Alvo</p>
                                        <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(goal.target_amount)}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex mb-1.5 items-center justify-between">
                                        <span className="text-xs font-medium text-gray-500">Progresso</span>
                                        <span className={`text-xs font-bold ${isCompleted ? 'text-green-600' : 'text-primary-600'}`}>
                                            {percentage}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                        <div 
                                            style={{ width: `${percentage}%` }} 
                                            className={`h-2.5 rounded-full transition-all duration-700 ease-out ${isCompleted ? 'bg-green-500' : 'bg-primary-500'}`}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}

                {goals.length === 0 && (
                     <button 
                        onClick={() => handleOpenModal()}
                        className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-2xl hover:border-primary-500 hover:bg-primary-50 transition-all group bg-white"
                    >
                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-white group-hover:shadow-md transition-all">
                            <Plus size={32} className="text-gray-400 group-hover:text-primary-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">Criar Primeira Meta</h3>
                        <p className="text-sm text-gray-500 mt-1 max-w-xs text-center px-4">
                            Defina um objetivo financeiro e comece a acompanhar seu progresso hoje.
                        </p>
                    </button>
                )}
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title={editingId ? "Editar Meta" : "Nova Meta"}
                footer={
                    <>
                        <Button onClick={handleSave}>Salvar Meta</Button>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="mr-3">Cancelar</Button>
                    </>
                }
            >
                <div className="space-y-5">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Nome da Meta <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            maxLength={50}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2.5" 
                            placeholder="Ex: Reserva de Emergência, Carro Novo..."
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                        <div className="flex justify-end mt-1">
                            <span className="text-xs text-gray-400">{formData.name.length}/50</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Valor Alvo (R$) <span className="text-red-500">*</span></label>
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">R$</span>
                                </div>
                                <input 
                                    type="number" 
                                    className="block w-full pl-9 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2.5" 
                                    placeholder="0,00" 
                                    value={formData.target_amount}
                                    onChange={(e) => setFormData({...formData, target_amount: e.target.value})}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Data Limite <span className="text-gray-400 font-normal">(Opcional)</span></label>
                            <input 
                                type="date" 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2.5" 
                                value={formData.deadline}
                                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-3">Escolha um Ícone</label>
                         <div className="grid grid-cols-6 sm:grid-cols-7 gap-2">
                            {EMOJI_OPTIONS.map(icon => (
                                <button 
                                    key={icon} 
                                    onClick={() => setFormData({...formData, icon})}
                                    type="button"
                                    className={`
                                        text-2xl h-10 w-10 flex items-center justify-center rounded-lg transition-all focus:outline-none
                                        ${formData.icon === icon 
                                            ? 'bg-primary-100 ring-2 ring-primary-500 shadow-sm transform scale-110' 
                                            : 'hover:bg-gray-100 grayscale hover:grayscale-0'}
                                    `}
                                >
                                    {icon}
                                </button>
                            ))}
                         </div>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={isPremiumModalOpen}
                onClose={() => setIsPremiumModalOpen(false)}
                title="Limite Atingido 🔒"
                footer={
                    <div className="w-full flex flex-col sm:flex-row gap-2">
                        <Button className="w-full sm:w-auto flex-1 bg-gradient-to-r from-amber-400 to-yellow-600 border-none hover:shadow-lg transition-all">
                            <Crown size={16} className="mr-2" />
                            Quero ser Premium
                        </Button>
                        <Button variant="secondary" onClick={() => setIsPremiumModalOpen(false)} className="w-full sm:w-auto">
                            Fechar
                        </Button>
                    </div>
                }
            >
                <div className="text-center py-6">
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-amber-50 mb-4 ring-8 ring-amber-50/50">
                        <Lock className="h-10 w-10 text-amber-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Desbloqueie Metas Ilimitadas</h3>
                    <p className="text-gray-500 px-4">
                        No plano Free, você pode criar apenas 1 meta. Faça o upgrade para Premium e planeje todos os seus sonhos sem limites.
                    </p>
                </div>
            </Modal>
        </div>
    );
};