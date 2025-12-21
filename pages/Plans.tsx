import React from 'react';
import { Check, X, Crown, HelpCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

export const Plans: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900">Escolha o plano ideal para você</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Desbloqueie todo o potencial das suas finanças com recursos exclusivos ou comece com o essencial gratuitamente.
        </p>
      </div>

      {/* Cards Section */}
      <div className="grid md:grid-cols-2 gap-8 items-start mb-16">
        {/* FREE PLAN */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900">Plano Free</h3>
                <p className="text-gray-500 text-sm mt-1">Ideal para quem está começando</p>
                <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-extrabold text-gray-900">R$ 0</span>
                    <span className="ml-1 text-xl text-gray-500">/mês</span>
                </div>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
                <Feature included={true} text="1 Conta Bancária" />
                <Feature included={true} text="1 Cartão de Crédito" />
                <Feature included={true} text="1 Meta Financeira" />
                <Feature included={true} text="Transações Manuais Ilimitadas" />
                <Feature included={true} text="Dashboard Básico" />
                <Feature included={false} text="Radar do Mercado (IA)" />
            </ul>

            <Link to="/register" className="block w-full">
                <Button variant="outline" fullWidth size="lg">Escolher Free</Button>
            </Link>
        </div>

        {/* PREMIUM PLAN */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-primary-500 p-8 flex flex-col h-full relative overflow-hidden transform md:-translate-y-2">
            <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                RECOMENDADO
            </div>
            
            <div className="mb-6">
                <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-primary-700">Plano Premium</h3>
                    <Crown size={18} className="text-yellow-500 fill-yellow-500" />
                </div>
                <p className="text-gray-500 text-sm mt-1">Para quem quer controle total</p>
                <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-extrabold text-gray-900">R$ 19,90</span>
                    <span className="ml-1 text-xl text-gray-500">/mês</span>
                </div>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
                <Feature included={true} text="Contas Bancárias Ilimitadas" strong />
                <Feature included={true} text="Cartões de Crédito Ilimitados" strong />
                <Feature included={true} text="Metas Financeiras Ilimitadas" strong />
                <Feature included={true} text="Radar do Mercado (IA)" strong />
                <Feature included={true} text="Exportação em PDF e CSV" />
            </ul>

            <Link to="/register" className="block w-full">
                <Button variant="primary" fullWidth size="lg" className="shadow-lg shadow-primary-500/30">
                    Fazer Upgrade Agora
                </Button>
            </Link>
            
            <p className="text-center text-xs text-gray-400 mt-4">
                Cancele a qualquer momento. Sem fidelidade.
            </p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-12">
          <div className="p-6 bg-gray-50 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 text-center">Comparativo Detalhado</h3>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                  <thead>
                      <tr className="bg-white border-b border-gray-100">
                          <th className="py-4 px-6 font-semibold text-gray-900 w-1/3">Recurso</th>
                          <th className="py-4 px-6 font-semibold text-gray-900 text-center w-1/3">Free</th>
                          <th className="py-4 px-6 font-semibold text-primary-600 text-center w-1/3 bg-primary-50">Premium</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      <TableRow feature="Contas Bancárias" free="1 Conta" premium="Ilimitadas" />
                      <TableRow feature="Cartões de Crédito" free="1 Cartão" premium="Ilimitados" />
                      <TableRow feature="Metas Financeiras" free="1 Meta" premium="Ilimitadas" />
                      <TableRow feature="Transações" free="Ilimitadas" premium="Ilimitadas" />
                      <TableRow feature="Categorias Personalizadas" free={<Check size={18} className="mx-auto text-green-500"/>} premium={<Check size={18} className="mx-auto text-green-500"/>} />
                      <TableRow feature="Dashboard Financeiro" free="Básico" premium="Avançado" />
                      <TableRow feature="Radar do Mercado (IA)" free={<X size={18} className="mx-auto text-gray-300"/>} premium={<div className="flex justify-center items-center gap-1 text-primary-700 font-bold"><Crown size={14}/> Incluso</div>} />
                      <TableRow feature="Exportação (PDF/CSV)" free={<X size={18} className="mx-auto text-gray-300"/>} premium={<Check size={18} className="mx-auto text-green-500"/>} />
                      <TableRow feature="Suporte" free="Email" freeSub="Prazo de 48h" premium="Prioritário" premiumSub="Prazo de 24h" />
                      <TableRow feature="Sem Anúncios" free={<Check size={18} className="mx-auto text-green-500"/>} premium={<Check size={18} className="mx-auto text-green-500"/>} />
                  </tbody>
              </table>
          </div>
      </div>

      {/* Guarantee */}
      <div className="mt-16 text-center bg-blue-50 rounded-xl p-8 border border-blue-100">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Garantia de Satisfação</h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
            Teste o plano Premium sem riscos. Se você não amar a experiência nos primeiros 7 dias, nós devolvemos o seu dinheiro. Sem perguntas.
        </p>
      </div>
    </div>
  );
};

const Feature = ({ included, text, strong }: { included: boolean; text: string; strong?: boolean }) => (
  <li className="flex items-start">
    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${included ? 'bg-green-100' : 'bg-gray-100'}`}>
        {included ? <Check size={12} className="text-green-600" /> : <X size={12} className="text-gray-400" />}
    </div>
    <span className={`ml-3 text-sm ${included ? 'text-gray-700' : 'text-gray-400'} ${strong ? 'font-bold' : ''}`}>
        {text}
    </span>
  </li>
);

const TableRow = ({ feature, free, premium, freeSub, premiumSub }: { feature: string, free: React.ReactNode, premium: React.ReactNode, freeSub?: string, premiumSub?: string }) => (
    <tr className="hover:bg-gray-50 transition-colors">
        <td className="py-4 px-6 text-gray-700 font-medium">
            {feature}
        </td>
        <td className="py-4 px-6 text-center text-gray-600">
            {free}
            {freeSub && <div className="text-xs text-gray-400 mt-1">{freeSub}</div>}
        </td>
        <td className="py-4 px-6 text-center font-semibold text-gray-900 bg-primary-50/30">
            {premium}
            {premiumSub && <div className="text-xs text-primary-600 mt-1">{premiumSub}</div>}
        </td>
    </tr>
);
