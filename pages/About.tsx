import React from 'react';
import { Shield, TrendingUp, Users, Heart, BrainCircuit, Target, Lock, CheckCircle2, Award, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const About: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-about" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-about)" />
          </svg>
        </div>
        
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold uppercase tracking-widest mb-4">
            Nossa Jornada
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Nascemos para simplificar sua <span className="text-primary-600">liberdade</span>.
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            O FinanceApp não é apenas código e planilhas. É o resultado da nossa obsessão em transformar a complexidade do mercado financeiro em clareza para o seu dia a dia.
          </p>
        </div>
      </section>

      {/* Metrics Section - Social Proof */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <MetricItem value="25k+" label="Usuários Ativos" />
            <MetricItem value="R$ 45M+" label="Transacionados" />
            <MetricItem value="4.9/5" label="Avaliação Média" />
            <MetricItem value="100%" label="Seguro & Criptografado" />
          </div>
        </div>
      </section>

      {/* Security Deep Dive */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 relative">
            <div className="absolute -inset-4 bg-primary-100 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
            <img 
              src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800" 
              alt="Segurança Bancária" 
              className="relative rounded-3xl shadow-2xl border border-gray-100 transform hover:scale-[1.01] transition-transform"
            />
          </div>
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 text-primary-600 font-bold text-sm uppercase tracking-wider">
                <Shield size={20} /> Segurança em Primeiro Lugar
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">Seus dados protegidos por tecnologia militar.</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Utilizamos os mesmos padrões de criptografia dos maiores bancos do mundo. O FinanceApp nunca armazena suas senhas bancárias e opera em um ambiente isolado e auditado.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SecurityPoint text="Criptografia AES-256" />
              <SecurityPoint text="Conformidade LGPD" />
              <SecurityPoint text="Backup Redundante" />
              <SecurityPoint text="Autenticação 2FA" />
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold text-gray-900">O que nos move diariamente</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Valores que guiam cada linha de código e cada nova funcionalidade do nosso ecossistema.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <ValueCard 
                icon={<TrendingUp className="text-blue-600" size={28} />}
                bg="bg-blue-50"
                title="Crescimento Constante"
                desc="Não paramos. Estamos sempre evoluindo nossas ferramentas para que você evolua seu patrimônio."
            />
            <ValueCard 
                icon={<BrainCircuit className="text-purple-600" size={28} />}
                bg="bg-purple-50"
                title="Inteligência Aplicada"
                desc="Usamos IA não porque é moda, mas para filtrar o que realmente importa para sua saúde financeira."
            />
            <ValueCard 
                icon={<Heart className="text-red-600" size={28} />}
                bg="bg-red-50"
                title="Foco no Ser Humano"
                desc="Atrás de cada conta existe um sonho. Nosso design é pensado para reduzir sua ansiedade financeira."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-600/10 blur-[120px] rounded-full"></div>
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">Pronto para escrever o próximo capítulo da sua história financeira?</h2>
          <p className="text-xl text-gray-400 leading-relaxed">
            Junte-se a milhares de brasileiros que já descobriram que gerenciar dinheiro pode ser leve, inteligente e até prazeroso.
          </p>
          <div className="pt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="px-10 py-5 text-lg shadow-xl shadow-primary-500/20">Criar Conta Grátis</Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-900 px-10 py-5 text-lg">
                Falar com Consultor
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const MetricItem = ({ value, label }: { value: string, label: string }) => (
  <div className="text-center group">
    <div className="text-4xl font-black text-primary-600 mb-2 group-hover:scale-110 transition-transform duration-300">{value}</div>
    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</div>
  </div>
);

const ValueCard = ({ icon, bg, title, desc }: { icon: React.ReactNode, bg: string, title: string, desc: string }) => (
    <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
        <div className={`w-16 h-16 ${bg} rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:rotate-6 transition-transform`}>
            {icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 leading-relaxed">
            {desc}
        </p>
    </div>
);

const SecurityPoint = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3">
    <CheckCircle2 className="text-green-500 shrink-0" size={20} />
    <span className="font-semibold text-gray-700">{text}</span>
  </div>
);