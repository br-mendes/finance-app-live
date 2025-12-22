import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { Plus, Edit2, Trash2, CreditCard as CardIcon, Calendar, FileText, Download, Lock, Crown, AlertCircle, Palette } from 'lucide-react';
import { CreditCard, CardBrand, User, PlanType, Transaction, TransactionType } from '../types';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { dataManager } from '../utils/dataManager';

interface CardsProps {
    user: User;
}

const CARD_GRADIENTS = [
    { id: 'blue', class: 'bg-gradient-to-r from-blue-700 to-blue-900', label: 'Azul Noite' },
    { id: 'purple', class: 'bg-gradient-to-r from-purple-600 to-indigo-800', label: 'Roxo Nubank' },
    { id: 'orange', class: 'bg-gradient-to-r from-orange-500 to-red-600', label: 'Laranja Itau' },
    { id: 'green', class: 'bg-gradient-to-r from-emerald-600 to-teal-800', label: 'Verde Safra' },
    { id: 'dark', class: 'bg-gradient-to-r from-gray-800 to-black', label: 'Black' },
    { id: 'gold', class: 'bg-gradient-to-r from-yellow-400 to-amber-600', label: 'Gold' },
];

const BANK_SUGGESTIONS = ["Nubank", "Itaú", "Bradesco", "Banco do Brasil", "Caixa", "Santander", "Inter", "C6 Bank", "XP", "BTG"];

export const Cards: React.FC<CardsProps> = ({ user }) => {
    const { addToast } = useToast();
    const [cards, setCards] = useState<CreditCard[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string>('');
    
    // Modal States
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

    // Form State
    const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
    const [formData, setFormData] = useState({
        issuer_bank: '',
        last_four_digits: '',
        card_brand: CardBrand.MASTERCARD,
        limit_amount: '',
        due_day: '10',
        closing_offset: '7',
        limit_date: new Date().toISOString().split('T')[0],
        background_gradient: 'bg-gradient-to-r from-blue-700 to-blue-900'
    });

    const isFreePlan = user.plan === PlanType.FREE;

    const loadCards = () => {
        const storedCards = dataManager.getCards();
        setCards(storedCards);
        if (storedCards.length > 0 && !selectedCardId) {
            setSelectedCardId(storedCards[0].id);
        }
    };

    useEffect(() => {
        loadCards();
    }, []);

    useEffect(() => {
        if (cards.length > 0 && !cards.find(c => c.id === selectedCardId)) {
            setSelectedCardId(cards[0].id);
        }
    }, [cards, selectedCardId]);

    const resetForm = () => {
        setFormData({
            issuer_bank: '',
            last_four_digits: '',
            card_brand: CardBrand.MASTERCARD,
            limit_amount: '',
            due_day: '10',
            closing_offset: '7',
            limit_date: new Date().toISOString().split('T')[0],
            background_gradient: 'bg-gradient-to-r from-blue-700 to-blue-900'
        });
        setEditingCard(null);
    };

    const handleOpenForm = (cardToEdit?: CreditCard) => {
        if (!cardToEdit && isFreePlan && cards.length >= 1) {
            setIsPremiumModalOpen(true);
            return;
        }

        if (cardToEdit) {
            setEditingCard(cardToEdit);
            setFormData({
                issuer_bank: cardToEdit.issuer_bank,
                last_four_digits: cardToEdit.last_four_digits,
                card_brand: cardToEdit.card_brand,
                limit_amount: cardToEdit.limit_amount.toString(),
                due_day: cardToEdit.due_day.toString(),
                closing_offset: cardToEdit.closing_offset.toString(),
                limit_date: cardToEdit.limit_date ? new Date(cardToEdit.limit_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                background_gradient: cardToEdit.background_gradient || 'bg-gradient-to-r from-blue-700 to-blue-900'
            });
        } else {
            resetForm();
        }
        setIsFormModalOpen(true);
    };

    const handleSave = () => {
        if (!formData.issuer_bank) {
            addToast("Informe a Instituição Financeira.", "error");
            return;
        }
        if (formData.last_four_digits.length !== 4 || isNaN(Number(formData.last_four_digits))) {
            addToast("Os últimos 4 dígitos devem ser numéricos.", "error");
            return;
        }
        if (!formData.limit_amount || isNaN(parseFloat(formData.limit_amount))) {
            addToast("Insira um limite válido.", "error");
            return;
        }

        const limitNum = parseFloat(formData.limit_amount.replace(',', '.'));
        const closingOffsetNum = parseInt(formData.closing_offset);
        const dueDayNum = parseInt(formData.due_day);

        let closingDayCalc = dueDayNum - closingOffsetNum;
        if (closingDayCalc <= 0) closingDayCalc += 30;

        const newCardData: CreditCard = {
            id: editingCard ? editingCard.id : Date.now().toString(),
            user_id: user.id,
            issuer_bank: formData.issuer_bank,
            last_four_digits: formData.last_four_digits,
            card_brand: formData.card_brand,
            limit_amount: limitNum,
            due_day: dueDayNum,
            closing_offset: closingOffsetNum,
            closing_day: closingDayCalc,
            background_gradient: formData.background_gradient,
            limit_date: new Date(formData.limit_date).toISOString(),
            created_at: editingCard ? editingCard.created_at : new Date().toISOString()
        };

        const currentCards = dataManager.getCards();
        let updatedCards;
        if (editingCard) {
            updatedCards = currentCards.map(c => c.id === editingCard.id ? newCardData : c);
            addToast("Cartão atualizado!", "success");
        } else {
            updatedCards = [...currentCards, newCardData];
            addToast("Cartão cadastrado com sucesso!", "success");
        }
        
        localStorage.setItem('financeapp_cards', JSON.stringify(updatedCards));
        setCards(updatedCards);
        setIsFormModalOpen(false);
        resetForm();
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Tem certeza que deseja deletar este cartão?")) {
            const updated = cards.filter(c => c.id !== id);
            localStorage.setItem('financeapp_cards', JSON.stringify(updated));
            setCards(updated);
            addToast("Cartão removido.", "info");
        }
    };

    const selectedCard = cards.find(c => c.id === selectedCardId);
    const invoiceTransactions = dataManager.getTransactions().filter(t => t.credit_card_id === selectedCardId);
    const invoiceTotal = invoiceTransactions.reduce((sum, t) => sum + t.amount, 0);

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    let invoiceStartDateStr = "---";
    let invoiceEndDateStr = "---";

    if (selectedCard) {
        const dueDay = selectedCard.due_day;
        const offset = selectedCard.closing_offset;
        const closingDateThisMonth = new Date(currentYear, currentMonth, dueDay - offset);
        let targetClosingDate = today > closingDateThisMonth ? new Date(currentYear, currentMonth + 1, dueDay - offset) : closingDateThisMonth;
        let prevClosingDate = new Date(targetClosingDate);
        prevClosingDate.setMonth(prevClosingDate.getMonth() - 1);
        
        invoiceEndDateStr = targetClosingDate.toLocaleDateString();
        const startDate = new Date(prevClosingDate);
        startDate.setDate(startDate.getDate() + 1);
        invoiceStartDateStr = startDate.toLocaleDateString();
    }

    const handleExportPDF = () => {
        if (isFreePlan) {
            setIsPremiumModalOpen(true);
            return;
        }
        if (!selectedCard) {
            addToast("Selecione um cartão para exportar.", "warning");
            return;
        }

        try {
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.setTextColor(14, 165, 233);
            doc.text("FinanceApp", 14, 22);
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text("Relatório de Fatura", 14, 28);
            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text(`Cartão: ${selectedCard.issuer_bank} (${selectedCard.card_brand.toUpperCase()})`, 14, 45);
            doc.text(`Final: ${selectedCard.last_four_digits}`, 14, 50);
            doc.text(`Período: ${invoiceStartDateStr} a ${invoiceEndDateStr}`, 14, 55);

            const tableColumn = ["Data", "Descrição", "Categoria", "Valor (R$)"];
            const tableRows = invoiceTransactions.map(t => [new Date(t.date).toLocaleDateString(), t.description, t.category, t.amount.toFixed(2)]);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 65,
                theme: 'striped',
                headStyles: { fillColor: [14, 165, 233] },
            });

            const finalY = (doc as any).lastAutoTable.finalY || 100;
            doc.setFontSize(14);
            doc.text(`TOTAL DA FATURA: R$ ${invoiceTotal.toFixed(2)}`, 14, finalY + 15);
            doc.save(`fatura_${selectedCard.issuer_bank}.pdf`);
            addToast("Fatura exportada com sucesso!", "success");
        } catch (error) {
            addToast("Erro ao gerar PDF.", "error");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Cartões & Faturas</h1>
                    <p className="text-sm text-gray-500">Gerencie seus cartões de crédito</p>
                </div>
                <Button onClick={() => handleOpenForm()}>
                    <Plus size={18} className="mr-2" />
                    Novo Cartão
                </Button>
            </div>

            {isFreePlan && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r flex items-center justify-between shadow-sm">
                    <div className="flex items-center">
                        <CardIcon className="h-5 w-5 text-blue-400 mr-3" />
                        <p className="text-sm text-blue-700">Plano Free: <span className="font-bold">{cards.length}</span>/1 cartão.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {cards.map((card) => (
                    <div 
                        key={card.id} 
                        onClick={() => setSelectedCardId(card.id)}
                        className={`relative rounded-xl shadow-lg p-6 text-white ${card.background_gradient || 'bg-gray-800'} overflow-hidden group transition-all hover:scale-[1.02] cursor-pointer ${selectedCardId === card.id ? 'ring-4 ring-primary-500 ring-offset-2' : ''}`}
                    >
                        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-white opacity-10 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 rounded-full bg-white opacity-10 blur-2xl"></div>

                        <div className="relative z-10 flex flex-col h-full justify-between min-h-[180px]">
                            <div className="flex justify-between items-start">
                                <span className="font-bold tracking-wider opacity-90 text-lg">{card.issuer_bank}</span>
                                <span className="font-bold italic opacity-90">{card.card_brand.toUpperCase()}</span>
                            </div>
                            <div className="my-6">
                                <div className="flex items-center gap-2 text-2xl font-mono tracking-widest">
                                    <span className="opacity-70">•••• •••• ••••</span>
                                    <span className="font-bold">{card.last_four_digits}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] opacity-75 uppercase font-semibold">Limite Disponível</p>
                                    <p className="text-xl font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(card.limit_amount)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] opacity-75 uppercase font-semibold">Vencimento</p>
                                    <p className="font-medium">Dia {card.due_day}</p>
                                </div>
                            </div>
                        </div>

                        <div className="absolute top-4 right-4 flex gap-2 z-20">
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleOpenForm(card); }} 
                                className="p-2 bg-white/20 rounded-full hover:bg-white/40 transition-colors backdrop-blur-sm shadow-sm"
                                title="Editar"
                             >
                                <Edit2 size={16} />
                             </button>
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleDelete(card.id); }} 
                                className="p-2 bg-white/20 rounded-full hover:bg-red-500/50 transition-colors backdrop-blur-sm shadow-sm"
                                title="Deletar"
                             >
                                <Trash2 size={16} />
                             </button>
                        </div>
                    </div>
                ))}

                {cards.length === 0 && (
                    <button 
                        onClick={() => handleOpenForm()}
                        className="flex flex-col items-center justify-center h-[180px] border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group bg-white"
                    >
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                            <Plus size={24} className="text-gray-400 group-hover:text-primary-600" />
                        </div>
                        <p className="font-medium text-gray-500 group-hover:text-primary-700">Adicionar cartão</p>
                    </button>
                )}
            </div>

            {cards.length > 0 && (
                <div className="border-t border-gray-200 pt-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <FileText size={20} className="text-primary-600" /> Fatura Aberta
                        </h2>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <select 
                                value={selectedCardId} 
                                onChange={(e) => setSelectedCardId(e.target.value)} 
                                className="block w-full sm:w-64 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                aria-label="Selecionar cartão para ver fatura"
                            >
                                {cards.map(card => <option key={card.id} value={card.id}>{card.issuer_bank} •••• {card.last_four_digits}</option>)}
                            </select>
                            <Button variant="outline" onClick={handleExportPDF}><Download size={18} className="mr-2" /> Exportar</Button>
                        </div>
                    </div>
                    <Card>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-100 pb-4">
                            <div><p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Período</p><p className="font-bold text-gray-900">{invoiceStartDateStr} — {invoiceEndDateStr}</p></div>
                            <div className="text-right mt-4 md:mt-0"><p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Total Acumulado</p><p className="text-2xl font-bold text-primary-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoiceTotal)}</p></div>
                        </div>
                        {invoiceTransactions.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {invoiceTransactions.map(t => (
                                            <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-600">{new Date(t.date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.description}</td>
                                                <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <div className="py-12 text-center text-gray-500 italic">Nenhum lançamento para este período.</div>}
                    </Card>
                </div>
            )}

            <Modal 
                isOpen={isFormModalOpen} 
                onClose={() => setIsFormModalOpen(false)} 
                title={editingCard ? "Editar Cartão" : "Novo Cartão"} 
                footer={
                    <>
                        <Button onClick={handleSave}>Salvar Cartão</Button>
                        <Button variant="secondary" onClick={() => setIsFormModalOpen(false)} className="mr-3">Cancelar</Button>
                    </>
                }
            >
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">Personalizar Aparência</label>
                        <div className="grid grid-cols-3 gap-3">
                            {CARD_GRADIENTS.map(g => (
                                <button 
                                    key={g.id} 
                                    onClick={() => setFormData({...formData, background_gradient: g.class})} 
                                    className={`h-12 rounded-xl border-4 transition-all ${g.class} ${formData.background_gradient === g.class ? 'border-primary-500 scale-105 shadow-lg' : 'border-transparent hover:scale-105'}`} 
                                    title={g.label}
                                    type="button"
                                ></button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Bandeira</label>
                            <select 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm focus:ring-primary-500 focus:border-primary-500" 
                                value={formData.card_brand} 
                                onChange={(e) => setFormData({...formData, card_brand: e.target.value as CardBrand})}
                            >
                                <option value={CardBrand.MASTERCARD}>Mastercard</option>
                                <option value={CardBrand.VISA}>Visa</option>
                                <option value={CardBrand.ELO}>Elo</option>
                                <option value={CardBrand.AMEX}>Amex</option>
                                <option value={CardBrand.OTHER}>Outra</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Instituição</label>
                            <input 
                                list="banks" 
                                type="text" 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm focus:ring-primary-500 focus:border-primary-500" 
                                placeholder="Ex: Nubank"
                                value={formData.issuer_bank} 
                                onChange={(e) => setFormData({...formData, issuer_bank: e.target.value})} 
                            />
                            <datalist id="banks">{BANK_SUGGESTIONS.map(b => <option key={b} value={b} />)}</datalist>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">4 últimos dígitos</label>
                            <input 
                                type="text" 
                                maxLength={4} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm focus:ring-primary-500 focus:border-primary-500" 
                                placeholder="0000"
                                value={formData.last_four_digits} 
                                onChange={(e) => setFormData({...formData, last_four_digits: e.target.value.replace(/\D/g, '')})} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Limite Disponível (R$)</label>
                            <input 
                                type="number" 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm focus:ring-primary-500 focus:border-primary-500" 
                                placeholder="0,00"
                                value={formData.limit_amount} 
                                onChange={(e) => setFormData({...formData, limit_amount: e.target.value})} 
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Dia Vencimento</label>
                            <input 
                                type="number" 
                                min="1" 
                                max="31" 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm focus:ring-primary-500 focus:border-primary-500" 
                                value={formData.due_day} 
                                onChange={(e) => setFormData({...formData, due_day: e.target.value})} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fecha antes (dias)</label>
                            <select 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm focus:ring-primary-500 focus:border-primary-500" 
                                value={formData.closing_offset} 
                                onChange={(e) => setFormData({...formData, closing_offset: e.target.value})}
                            >
                                <option value="3">3 dias</option>
                                <option value="5">5 dias</option>
                                <option value="7">7 dias</option>
                                <option value="10">10 dias</option>
                            </select>
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
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Desbloqueie Cartões Ilimitados</h3>
                    <p className="text-gray-500 px-4">
                        No plano Free, você pode cadastrar apenas 1 cartão. Faça o upgrade para Premium e gerencie todos os seus cartões e faturas em um único lugar.
                    </p>
                </div>
            </Modal>
        </div>
    );
};