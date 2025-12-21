import React from 'react';
import { Shield, TrendingUp, Users, Heart, BrainCircuit, Target, Smartphone, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const About: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-16 py-12 px-4">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">Sobre o FinanceAPP</h1>
        <p className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
          Nascemos com a missão de simplificar a vida financeira dos brasileiros através de tecnologia, inteligência artificial e design intuitivo.
        </p>
      </div>

      {/* Our Values */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ValueCard 
            icon={<TrendingUp className="text-blue-600" size={24} />}
            bg="bg-blue-100"
            title="Controle Total"
            desc="Unificamos contas, cartões e despesas em um único lugar para que você nunca mais precise de planilhas complexas."
        />
        <ValueCard 
            icon={<BrainCircuit className="text-purple-600" size={24} />}
            bg="bg-purple-100"
            title="Inteligência Artificial"
            desc="Utilizamos IA (Google Gemini) no Radar do Mercado para trazer resumos financeiros relevantes e personalizados."
        />
         <ValueCard 
            icon={<Target className="text-red-600" size={24} />}
            bg="bg-red-100"
            title="Foco em Metas"
            desc="Acreditamos que dinheiro é um meio para realizar sonhos. Nosso sistema de Metas ajuda você a poupar com propósito."
        />
        <ValueCard 
            icon={<Shield className="text-green-600" size={24} />}
            bg="bg-green-100"
            title="Segurança"
            desc="Seus dados são criptografados e protegidos. Privacidade não é negociável em nossa plataforma."
        />
         <ValueCard 
            icon={<Smartphone className="text-orange-600" size={24} />}
            bg="bg-orange-100"
            title="Acessibilidade"
            desc="Um sistema leve, rápido e responsivo que funciona em qualquer dispositivo, do celular ao desktop."
        />
         <ValueCard 
            icon={<Lock className="text-gray-600" size={24} />}
            bg="bg-gray-100"
            title="Transparência"
            desc="Sem taxas ocultas. Nosso modelo Freemium é claro: recursos essenciais grátis para sempre, poder extra no Premium."
        />
      </div>

      {/* Story Section */}
      <div className="bg-gradient-to-br from-primary-50 to-white rounded-3xl p-8 md:p-12 border border-primary-100">
        <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Nossa História</h2>
            <p className="text-gray-700 leading-relaxed text-lg">
                O FinanceAPP foi desenvolvido para resolver um problema comum: a desconexão entre o que ganhamos, o que gastamos e o que acontece no mercado financeiro.
            </p>
            <p className="text-gray-700 leading-relaxed text-lg">
                Lançado como uma plataforma robusta de gestão, integramos funcionalidades avançadas como o <strong>Radar do Mercado</strong>, que usa inteligência artificial para ler e resumir notícias econômicas, e um sistema de <strong>Metas</strong> gamificado para incentivar a poupança.
            </p>
            <div className="pt-4">
                <Link to="/contact">
                    <Button size="lg" className="shadow-lg">Entre em Contato</Button>
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

const ValueCard = ({ icon, bg, title, desc }: { icon: React.ReactNode, bg: string, title: string, desc: string }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1">
        <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}>
            {icon}
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 leading-relaxed text-sm">
            {desc}
        </p>
    </div>
);
