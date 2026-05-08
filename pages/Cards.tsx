import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabaseClient';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Plus, Edit2, Trash2, CreditCard as CardIcon,
  FileText, Download, Lock, Crown,
} from 'lucide-react';
import { CreditCard, CardBrand, PlanType, Transaction } from '../types';

const CARD_GRADIENTS = [
  { id: 'blue', class: 'bg-gradient-to-r from-blue-700 to-blue-900', label: 'Azul Noite' },
  { id: 'purple', class: 'bg-gradient-to-r from-purple-600 to-indigo-800', label: 'Roxo Nubank' },
  { id: 'orange', class: 'bg-gradient-to-r from-orange-500 to-red-600', label: 'Laranja Itau' },
  { id: 'green', class: 'bg-gradient-to-r from-emerald-600 to-teal-800', label: 'Verde Safra' },
  { id: 'dark', class: 'bg-gradient-to-r from-gray-800 to-black', label: 'Black' },
  { id: 'gold', class: 'bg-gradient-to-r from-yellow-400 to-amber-600', label: 'Gold' },
];

const BANK_SUGGESTIONS = ['Nubank', 'Itaú', 'Bradesco', 'Banco do Brasil', 'Caixa', 'Santander', 'Inter', 'C6 Bank', 'XP', 'BTG'];

type FormData = {
  issuer_bank: string;
  last_four_digits: string;
  card_brand: CardBrand;
  limit_amount: string;
  due_day: string;
  closing_offset: string;
  background_gradient: string;
};

const DEFAULT_FORM: FormData = {
  issuer_bank: '',
  last_four_digits: '',
  card_brand: CardBrand.MASTERCARD,
  limit_amount: '',
  due_day: '10',
  closing_offset: '7',
  background_gradient: 'bg-gradient-to-r from-blue-700 to-blue-900',
};

export const Cards: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [cards, setCards] = useState<CreditCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [invoiceTransactions, setInvoiceTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  const isFreePlan = user?.plan === PlanType.FREE;

  const fetchCards = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('credit_cards')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    const list: CreditCard[] = data || [];
    setCards(list);
    if (list.length > 0 && !list.find(c => c.id === selectedCardId)) {
      setSelectedCardId(list[0].id);
    }
    setLoading(false);
  }, [user?.id, selectedCardId]);

  const fetchInvoice = useCallback(async () => {
    if (!selectedCardId || !user?.id) {
      setInvoiceTransactions([]);
      return;
    }
    const card = cards.find(c => c.id === selectedCardId);
    if (!card) return;

    const today = new Date();
    const dueDay = card.due_day;
    const offset = card.closing_offset;

    const closingThisMonth = new Date(today.getFullYear(), today.getMonth(), dueDay - offset);
    const targetClosing = today > closingThisMonth
      ? new Date(today.getFullYear(), today.getMonth() + 1, dueDay - offset)
      : closingThisMonth;
    const prevClosing = new Date(targetClosing.getFullYear(), targetClosing.getMonth() - 1, dueDay - offset);
    const startDate = new Date(prevClosing);
    startDate.setDate(startDate.getDate() + 1);

    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('credit_card_id', selectedCardId)
      .is('deleted_at', null)
      .gte('date', startDate.toISOString())
      .lte('date', targetClosing.toISOString())
      .order('date', { ascending: false });

    setInvoiceTransactions(data || []);
  }, [selectedCardId, cards, user?.id]);

  useEffect(() => { fetchCards(); }, [user?.id]);
  useEffect(() => { fetchInvoice(); }, [selectedCardId, cards]);

  const resetForm = () => { setFormData(DEFAULT_FORM); setEditingCard(null); };

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
        background_gradient: cardToEdit.background_gradient || DEFAULT_FORM.background_gradient,
      });
    } else {
      resetForm();
    }
    setIsFormModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.issuer_bank) { addToast('Informe a Instituição Financeira.', 'error'); return; }
    if (formData.last_four_digits.length !== 4 || isNaN(Number(formData.last_four_digits))) {
      addToast('Os últimos 4 dígitos devem ser numéricos.', 'error'); return;
    }
    const limit = parseFloat(formData.limit_amount.replace(',', '.'));
    if (!formData.limit_amount || isNaN(limit)) { addToast('Insira um limite válido.', 'error'); return; }
    if (!user?.id) return;

    setSaving(true);
    const dueDay = parseInt(formData.due_day);
    const offset = parseInt(formData.closing_offset);
    let closingDay = dueDay - offset;
    if (closingDay <= 0) closingDay += 30;

    const cardData = {
      user_id: user.id,
      issuer_bank: formData.issuer_bank,
      last_four_digits: formData.last_four_digits,
      card_brand: formData.card_brand,
      limit_amount: limit,
      due_day: dueDay,
      closing_offset: offset,
      closing_day: closingDay,
      background_gradient: formData.background_gradient,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingCard) {
        const { error } = await supabase.from('credit_cards').update(cardData).eq('id', editingCard.id);
        if (error) throw error;
        addToast('Cartão atualizado!', 'success');
      } else {
        const { error } = await supabase.from('credit_cards').insert([{
          ...cardData,
          created_at: new Date().toISOString(),
        }]);
        if (error) throw error;
        addToast('Cartão cadastrado!', 'success');
      }
      setIsFormModalOpen(false);
      resetForm();
      fetchCards();
    } catch {
      addToast('Erro ao salvar cartão.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este cartão?')) return;
    const { error } = await supabase
      .from('credit_cards')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) {
      addToast('Cartão removido.', 'info');
      fetchCards();
    }
  };

  const selectedCard = cards.find(c => c.id === selectedCardId);
  const invoiceTotal = invoiceTransactions.reduce((sum, t) => sum + t.amount, 0);

  const getInvoicePeriod = () => {
    if (!selectedCard) return { start: '---', end: '---' };
    const today = new Date();
    const dueDay = selectedCard.due_day;
    const offset = selectedCard.closing_offset;
    const closingThisMonth = new Date(today.getFullYear(), today.getMonth(), dueDay - offset);
    const targetClosing = today > closingThisMonth
      ? new Date(today.getFullYear(), today.getMonth() + 1, dueDay - offset)
      : closingThisMonth;
    const prevClosing = new Date(targetClosing.getFullYear(), targetClosing.getMonth() - 1, dueDay - offset);
    const startDate = new Date(prevClosing);
    startDate.setDate(startDate.getDate() + 1);
    return { start: startDate.toLocaleDateString('pt-BR'), end: targetClosing.toLocaleDateString('pt-BR') };
  };

  const handleExportPDF = () => {
    if (isFreePlan) { setIsPremiumModalOpen(true); return; }
    if (!selectedCard) { addToast('Selecione um cartão.', 'warning'); return; }
    try {
      const { start, end } = getInvoicePeriod();
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(14, 165, 233);
      doc.text('FinanceApp', 14, 22);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Relatório de Fatura', 14, 28);
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Cartão: ${selectedCard.issuer_bank} (${selectedCard.card_brand.toUpperCase()})`, 14, 45);
      doc.text(`Final: ${selectedCard.last_four_digits}`, 14, 50);
      doc.text(`Período: ${start} a ${end}`, 14, 55);
      autoTable(doc, {
        head: [['Data', 'Descrição', 'Categoria', 'Valor (R$)']],
        body: invoiceTransactions.map(t => [
          new Date(t.date).toLocaleDateString('pt-BR'),
          t.description,
          t.category,
          t.amount.toFixed(2),
        ]),
        startY: 65,
        theme: 'striped',
        headStyles: { fillColor: [14, 165, 233] },
      });
      const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 100;
      doc.setFontSize(14);
      doc.text(`TOTAL DA FATURA: R$ ${invoiceTotal.toFixed(2)}`, 14, finalY + 15);
      doc.save(`fatura_${selectedCard.issuer_bank}.pdf`);
      addToast('Fatura exportada!', 'success');
    } catch {
      addToast('Erro ao gerar PDF.', 'error');
    }
  };

  const { start: invoiceStart, end: invoiceEnd } = getInvoicePeriod();

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(2)].map((_, i) => <div key={i} className="h-44 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Cartões & Faturas</h1>
          <p className="text-sm text-gray-500 font-medium">Gerencie seus cartões de crédito</p>
        </div>
        <Button onClick={() => handleOpenForm()} className="h-11 bg-primary-600 hover:bg-primary-700 shadow-xl shadow-primary-500/20">
          <Plus size={18} className="mr-2" /> Novo Cartão
        </Button>
      </div>

      {isFreePlan && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r flex items-center gap-3 shadow-sm">
          <CardIcon className="h-5 w-5 text-blue-400 shrink-0" />
          <p className="text-sm text-blue-700">Plano Free: <span className="font-bold">{cards.length}</span>/1 cartão.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => setSelectedCardId(card.id)}
            className={`relative rounded-xl shadow-lg p-6 text-white ${card.background_gradient || 'bg-gray-800'} overflow-hidden group transition-all hover:scale-[1.02] cursor-pointer ${selectedCardId === card.id ? 'ring-4 ring-primary-500 ring-offset-2' : ''}`}
          >
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-white opacity-10 blur-2xl" />
            <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 rounded-full bg-white opacity-10 blur-2xl" />

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
                  <p className="text-[10px] opacity-75 uppercase font-semibold">Limite Total</p>
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
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-primary-100 transition-colors">
              <Plus size={24} className="text-gray-400 group-hover:text-primary-600" />
            </div>
            <p className="font-medium text-gray-500 group-hover:text-primary-700">Adicionar cartão</p>
          </button>
        )}
      </div>

      {cards.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText size={20} className="text-primary-600" /> Fatura Aberta
            </h2>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={selectedCardId}
                onChange={(e) => setSelectedCardId(e.target.value)}
                className="block w-full sm:w-64 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
              >
                {cards.map(card => (
                  <option key={card.id} value={card.id}>{card.issuer_bank} •••• {card.last_four_digits}</option>
                ))}
              </select>
              <Button variant="outline" onClick={handleExportPDF}><Download size={18} className="mr-2" /> PDF</Button>
            </div>
          </div>

          <Card className="dark:bg-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
              <div>
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Período</p>
                <p className="font-bold text-gray-900 dark:text-white">{invoiceStart} — {invoiceEnd}</p>
              </div>
              <div className="text-right mt-4 md:mt-0">
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Total Acumulado</p>
                <p className="text-2xl font-bold text-primary-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoiceTotal)}
                </p>
              </div>
            </div>

            {invoiceTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {invoiceTransactions.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{t.description}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{t.category}</td>
                        <td className="px-6 py-4 text-sm text-right font-bold text-rose-600">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 italic">Nenhum lançamento neste período.</div>
            )}
          </Card>
        </div>
      )}

      {/* Modal: Form */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingCard ? 'Editar Cartão' : 'Novo Cartão'}
        footer={
          <>
            <Button onClick={handleSave} loading={saving}>Salvar Cartão</Button>
            <Button variant="secondary" onClick={() => setIsFormModalOpen(false)} className="mr-3">Cancelar</Button>
          </>
        }
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">Aparência</label>
            <div className="grid grid-cols-3 gap-3">
              {CARD_GRADIENTS.map(g => (
                <button
                  key={g.id}
                  onClick={() => setFormData({ ...formData, background_gradient: g.class })}
                  className={`h-12 rounded-xl border-4 transition-all ${g.class} ${formData.background_gradient === g.class ? 'border-primary-500 scale-105 shadow-lg' : 'border-transparent hover:scale-105'}`}
                  title={g.label}
                  type="button"
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Bandeira</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                value={formData.card_brand}
                onChange={(e) => setFormData({ ...formData, card_brand: e.target.value as CardBrand })}
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
                onChange={(e) => setFormData({ ...formData, issuer_bank: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, last_four_digits: e.target.value.replace(/\D/g, '') })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Limite Total (R$)</label>
              <input
                type="number"
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="0,00"
                value={formData.limit_amount}
                onChange={(e) => setFormData({ ...formData, limit_amount: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, due_day: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha antes (dias)</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                value={formData.closing_offset}
                onChange={(e) => setFormData({ ...formData, closing_offset: e.target.value })}
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

      {/* Modal: Premium */}
      <Modal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        title="Limite Atingido 🔒"
        footer={
          <div className="w-full flex flex-col sm:flex-row gap-2">
            <Button className="w-full sm:w-auto flex-1 bg-gradient-to-r from-amber-400 to-yellow-600 border-none hover:shadow-lg transition-all">
              <Crown size={16} className="mr-2" /> Quero ser Premium
            </Button>
            <Button variant="secondary" onClick={() => setIsPremiumModalOpen(false)} className="w-full sm:w-auto">Fechar</Button>
          </div>
        }
      >
        <div className="text-center py-6">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-amber-50 mb-4 ring-8 ring-amber-50/50">
            <Lock className="h-10 w-10 text-amber-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Desbloqueie Cartões Ilimitados</h3>
          <p className="text-gray-500 px-4">
            No plano Free, você pode cadastrar apenas 1 cartão. Faça upgrade para gerenciar todos.
          </p>
        </div>
      </Modal>
    </div>
  );
};
