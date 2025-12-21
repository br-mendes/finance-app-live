import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Plus, Edit2, Trash2, CreditCard as CardIcon, Calendar, FileText, Download, Lock, Crown, AlertCircle } from 'lucide-react';
import { CreditCard, CardBrand, User, PlanType, Transaction, TransactionType } from '../types';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

interface CardsProps {
    user: User;
}

// Mock Data for Initial Setup
const INITIAL_CARDS: CreditCard[] = [
    {
        id: '1',
        user_id: '123',
        last_four_digits: '8842',
        card_brand: CardBrand.MASTERCARD,
        issuer_bank: 'Nubank',
        limit_amount: 5000.00,
        limit_date: new Date().toISOString(),
        due_day: 10,
        closing_day: 3, // Calculated from offset usually
        closing_offset: 7, 
        created_at: new Date().toISOString()
    }
];

const MOCK_INVOICE_TRANSACTIONS: Transaction[] = [
    { id: 't1', credit_card_id: '1', date: '2023-10-05', description: 'Netflix', category: 'Assinaturas', amount: 55.90, type: TransactionType.CREDIT },
    { id: 't2', credit_card_id: '1', date: '2023-10-08', description: 'Uber Trip', category: 'Transporte', amount: 24.90, type: TransactionType.CREDIT },
    { id: 't3', credit_card_id: '1', date: '2023-10-09', description: 'Restaurante', category: 'Alimentação', amount: 120.00, type: TransactionType.CREDIT },
    { id: 't4', credit_card_id: '2', date: '2023-10-15', description: 'Amazon', category: 'Compras', amount: 250.00, type: TransactionType.CREDIT },
];

const BANK_SUGGESTIONS = ["Nubank", "Itaú", "Bradesco", "Banco do Brasil", "Caixa", "Santander", "Inter", "C6 Bank", "XP", "BTG"];

export const Cards: React.FC<CardsProps> = ({ user }) => {
    const [cards, setCards] = useState<CreditCard[]>(INITIAL_CARDS);
    const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || '');
    
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
        limit_date: new Date().toISOString().split('T')[0]
    });

    const isFreePlan = user.plan === PlanType.FREE;

    // Ensure selected card is valid when cards change
    useEffect(() => {
        if (cards.length > 0 && !cards.find(c => c.id === selectedCardId)) {
            setSelectedCardId(cards[0].id);
        }
    }, [cards, selectedCardId]);

    // --- Helpers ---

    const getBrandColor = (brand: CardBrand) => {
        switch (brand) {
            case CardBrand.VISA: return 'bg-gradient-to-r from-blue-700 to-blue-900';
            case CardBrand.MASTERCARD: return 'bg-gradient-to-r from-orange-600 to-red-700';
            case CardBrand.ELO: return 'bg-gradient-to-r from-yellow-500 to-red-500';
            case CardBrand.AMEX: return 'bg-gradient-to-r from-slate-500 to-slate-700';
            default: return 'bg-gradient-to-r from-gray-700 to-gray-900';
        }
    };

    const resetForm = () => {
        setFormData({
            issuer_bank: '',
            last_four_digits: '',
            card_brand: CardBrand.MASTERCARD,
            limit_amount: '',
            due_day: '10',
            closing_offset: '7',
            limit_date: new Date().toISOString().split('T')[0]
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
                limit_date: cardToEdit.limit_date ? new Date(cardToEdit.limit_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
            });
        } else {
            resetForm();
        }
        setIsFormModalOpen(true);
    };

    const handleSave = () => {
        // Validation
        if (formData.last_four_digits.length !== 4 || isNaN(Number(formData.last_four_digits))) {
            alert("Os últimos 4 dígitos devem ser numéricos e ter 4 caracteres.");
            return;
        }
        if (!formData.limit_amount || isNaN(parseFloat(formData.limit_amount))) {
            alert("O limite deve ser um número válido.");
            return;
        }

        const limitNum = parseFloat(formData.limit_amount.replace(',', '.'));
        const closingOffsetNum = parseInt(formData.closing_offset);
        const dueDayNum = parseInt(formData.due_day);

        // Simple calculation for closing day just for storage
        let closingDayCalc = dueDayNum - closingOffsetNum;
        if (closingDayCalc <= 0) closingDayCalc += 30; // Approximation

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
            limit_date: new Date(formData.limit_date).toISOString(),
            created_at: editingCard ? editingCard.created_at : new Date().toISOString()
        };

        if (editingCard) {
            setCards(prev => prev.map(c => c.id === editingCard.id ? newCardData : c));
        } else {
            setCards(prev => [...prev, newCardData]);
            if (cards.length === 0) setSelectedCardId(newCardData.id);
        }

        setIsFormModalOpen(false);
        resetForm();
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Tem certeza que deseja deletar este cartão?")) {
            setCards(prev => prev.filter(c => c.id !== id));
            if (selectedCardId === id) setSelectedCardId('');
        }
    };

    // --- Invoice Logic ---

    const selectedCard = cards.find(c => c.id === selectedCardId);
    
    // Filter transactions for the selected card
    const invoiceTransactions = MOCK_INVOICE_TRANSACTIONS.filter(t => t.credit_card_id === selectedCardId);
    
    // Calculate Invoice Total
    const invoiceTotal = invoiceTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Calculate dates for display
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    let invoiceStartDateStr = "---";
    let invoiceEndDateStr = "---";

    if (selectedCard) {
        // Example logic: Invoice closes 'offset' days before 'due_day'
        // We show the "Current" invoice
        const dueDay = selectedCard.due_day;
        const offset = selectedCard.closing_offset;
        
        // Closing date of this month
        const closingDateThisMonth = new Date(currentYear, currentMonth, dueDay - offset);
        
        let targetClosingDate: Date;
        let prevClosingDate: Date;

        if (today > closingDateThisMonth) {
             // We are past closing, looking at next month's invoice (Open)
             targetClosingDate = new Date(currentYear, currentMonth + 1, dueDay - offset);
             prevClosingDate = closingDateThisMonth;
        } else {
             // We are before closing, looking at this month's invoice (Open)
             targetClosingDate = closingDateThisMonth;
             prevClosingDate = new Date(currentYear, currentMonth - 1, dueDay - offset);
        }
        
        invoiceEndDateStr = targetClosingDate.toLocaleDateString();
        // Start date is roughly day after previous closing
        const startDate = new Date(prevClosingDate);
        startDate.setDate(startDate.getDate() + 1);
        invoiceStartDateStr = startDate.toLocaleDateString();
    }

    // --- PDF Export ---

    const handleExportPDF = () => {
        if (isFreePlan) {
            setIsPremiumModalOpen(true);
            return;
        }

        if (!selectedCard) return;

        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.setTextColor(14, 165, 233); // Primary color
        doc.text("FinanceAPP", 14, 22);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Relatório de Fatura do Cartão de Crédito", 14, 28);

        // Disclaimer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("AVISO: Os valores podem não refletir a realidade bancária exata devido a parcelamentos antigos, taxas de juros ou transações ainda não processadas pelo sistema.", 14, 35, { maxWidth: 180 });

        // Card Info
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Cartão: ${selectedCard.issuer_bank} (${selectedCard.card_brand.toUpperCase()})`, 14, 45);
        doc.text(`Final: ${selectedCard.last_four_digits}`, 14, 50);
        doc.text(`Período: ${invoiceStartDateStr} a ${invoiceEndDateStr}`, 14, 55);

        // Table
        const tableColumn = ["Data", "Descrição", "Categoria", "Valor (R$)"];
        const tableRows: any[] = [];

        invoiceTransactions.forEach(t => {
            const ticketData = [
                new Date(t.date).toLocaleDateString(),
                t.description,
                t.category,
                t.amount.toFixed(2)
            ];
            tableRows.push(ticketData);
        });

        // @ts-ignore
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 65,
            theme: 'striped',
            headStyles: { fillColor: [14, 165, 233] },
            styles: { fontSize: 10 }
        });

        // Total
        // @ts-ignore
        const finalY = doc.lastAutoTable.finalY || 100;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`TOTAL DA FATURA: R$ ${invoiceTotal.toFixed(2)}`, 14, finalY + 15);

        doc.save(`fatura_${selectedCard.issuer_bank}_${selectedCard.last_four_digits}.pdf`);
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
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r flex items-center justify-between">
                    <div className="flex items-center">
                         <div className="flex-shrink-0">
                            <CardIcon className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                Plano Free: <span className="font-bold">{cards.length}</span>/1 cartão utilizado.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {cards.map((card) => (
                    <div key={card.id} className={`relative rounded-xl shadow-lg p-6 text-white ${getBrandColor(card.card_brand)} overflow-hidden group transition-all hover:scale-[1.02]`}>
                        {/* Decorative Circles */}
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
                                    <p className="text-xl font-bold">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(card.limit_amount)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] opacity-75 uppercase font-semibold">Vencimento</p>
                                    <p className="font-medium">Dia {card.due_day}</p>
                                </div>
                            </div>
                        </div>

                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                                onClick={() => handleOpenForm(card)}
                                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"
                             >
                                <Edit2 size={16} />
                             </button>
                             <button 
                                onClick={() => handleDelete(card.id)}
                                className="p-2 bg-white/20 rounded-full hover:bg-red-500/50 transition-colors backdrop-blur-sm"
                             >
                                <Trash2 size={16} />
                             </button>
                        </div>
                    </div>
                ))}

                 {cards.length === 0 && (
                    <button 
                        onClick={() => handleOpenForm()}
                        className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                            <Plus size={24} className="text-gray-400 group-hover:text-primary-600" />
                        </div>
                        <p className="font-medium text-gray-500 group-hover:text-primary-700">Adicionar cartão</p>
                    </button>
                )}
            </div>

            {/* Invoices Section */}
            {cards.length > 0 && (
                <div className="border-t border-gray-200 pt-8 animate-fade-in-up">
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <FileText size={20} className="text-primary-600" />
                            Fatura Aberta
                        </h2>
                        
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <select 
                                value={selectedCardId}
                                onChange={(e) => setSelectedCardId(e.target.value)}
                                className="block w-full sm:w-64 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                            >
                                {cards.map(card => (
                                    <option key={card.id} value={card.id}>
                                        {card.issuer_bank} •••• {card.last_four_digits}
                                    </option>
                                ))}
                            </select>

                            <Button variant="outline" onClick={handleExportPDF} title="Exportar PDF (Premium)">
                                <Download size={18} className={`mr-2 ${isFreePlan ? 'text-gray-400' : 'text-primary-600'}`} />
                                <span className={isFreePlan ? 'text-gray-500' : ''}>Exportar</span>
                                {isFreePlan && <Lock size={12} className="ml-1 text-gray-400" />}
                            </Button>
                        </div>
                    </div>

                    <Card>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-100 pb-4">
                            <div>
                                <p className="text-sm text-gray-500">Período da Fatura</p>
                                <p className="font-medium text-gray-900">{invoiceStartDateStr} — {invoiceEndDateStr}</p>
                            </div>
                            <div className="mt-4 md:mt-0 text-right">
                                <p className="text-sm text-gray-500">Total da Fatura</p>
                                <p className="text-2xl font-bold text-primary-600">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoiceTotal)}
                                </p>
                            </div>
                        </div>

                        {invoiceTransactions.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {invoiceTransactions.map((t) => (
                                            <tr key={t.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(t.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {t.description}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        {t.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                             <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <Calendar size={32} className="text-gray-400" />
                                </div>
                                <h3 className="text-gray-900 font-medium">Nenhum lançamento</h3>
                                <p className="text-gray-500 text-sm mt-1 max-w-sm">
                                    Não há transações registradas para este período.
                                </p>
                            </div>
                        )}
                        
                         <div className="mt-4 bg-yellow-50 p-3 rounded-md flex items-start">
                            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-yellow-700">
                                Os valores da fatura são estimados com base nos lançamentos manuais. Juros, multas ou IOF cobrados diretamente pelo banco podem não aparecer aqui.
                            </p>
                        </div>
                    </Card>
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal 
                isOpen={isFormModalOpen} 
                onClose={() => setIsFormModalOpen(false)}
                title={editingCard ? "Editar Cartão" : "Novo Cartão"}
                footer={
                    <>
                        <Button onClick={handleSave}>Salvar</Button>
                        <Button variant="secondary" onClick={() => setIsFormModalOpen(false)} className="mr-3">Cancelar</Button>
                    </>
                }
            >
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Últimos 4 Dígitos</label>
                        <input 
                            type="text" 
                            maxLength={4} 
                            placeholder="Ex: 8842"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                            value={formData.last_four_digits}
                            onChange={(e) => setFormData({...formData, last_four_digits: e.target.value.replace(/\D/g, '')})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Bandeira</label>
                            <select 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                value={formData.card_brand}
                                onChange={(e) => setFormData({...formData, card_brand: e.target.value as CardBrand})}
                            >
                                <option value={CardBrand.MASTERCARD}>Mastercard</option>
                                <option value={CardBrand.VISA}>Visa</option>
                                <option value={CardBrand.ELO}>Elo</option>
                                <option value={CardBrand.AMEX}>Amex</option>
                                <option value={CardBrand.OTHER}>Outros</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Instituição</label>
                             <input 
                                list="banks" 
                                type="text" 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                placeholder="Busque..."
                                value={formData.issuer_bank}
                                onChange={(e) => setFormData({...formData, issuer_bank: e.target.value})}
                            />
                            <datalist id="banks">
                                {BANK_SUGGESTIONS.map(bank => <option key={bank} value={bank} />)}
                            </datalist>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Dia Vencimento</label>
                            <input 
                                type="number" 
                                min="1" 
                                max="31" 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                value={formData.due_day}
                                onChange={(e) => setFormData({...formData, due_day: e.target.value})}
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Fecha antes (dias)</label>
                            <select 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                value={formData.closing_offset}
                                onChange={(e) => setFormData({...formData, closing_offset: e.target.value})}
                            >
                                <option value="3">3 dias antes</option>
                                <option value="5">5 dias antes</option>
                                <option value="8">8 dias antes</option>
                                <option value="10">10 dias antes</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Limite Total (R$)</label>
                            <input 
                                type="number" 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                placeholder="0,00"
                                value={formData.limit_amount}
                                onChange={(e) => setFormData({...formData, limit_amount: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Data do Limite</label>
                            <input 
                                type="date" 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                value={formData.limit_date}
                                onChange={(e) => setFormData({...formData, limit_date: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Premium Limit Modal */}
            <Modal
                isOpen={isPremiumModalOpen}
                onClose={() => setIsPremiumModalOpen(false)}
                title="Recurso Premium 🔒"
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
                    <h3 className="text-lg font-medium text-gray-900">Desbloqueie Todo o Potencial</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        Assine o plano Premium para cadastrar cartões ilimitados e exportar relatórios de faturas em PDF.
                    </p>
                </div>
            </Modal>
        </div>
    );
};