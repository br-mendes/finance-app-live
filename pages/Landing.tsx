import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { TrendingUp, Shield, Smartphone, ArrowRight, Heart, BrainCircuit, Star, Zap } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Header */}
      <header className="py-4 px-6 border-b border-gray-100 flex justify-between items-center fixed w-full bg-white/95 backdrop-blur-md z-50">
        <div className="flex items-center gap-8">
            <Link to="/" className="hover:opacity-80 transition-opacity">
                <img 
                  src="https://i.ibb.co/9mt6zRFj/generated-image-removebg-preview.png" 
                  alt="FinanceApp" 
                  className="h-10 w-auto object-contain"
                />
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
                <Link to="/about" className="hover:text-primary-600 transition-colors">Sobre</Link>
                <Link to="/plans" className="hover:text-primary-600 transition-colors">Planos</Link>
                <Link to="/contact" className="hover:text-primary-600 transition-colors">Contato</Link>
            </nav>
        </div>
        <Link to="/login">
            <Button variant="outline" className="border-primary-600 text-primary-600 px-6">Entrar</Button>
        </Link>
      </header>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 text-center max-w-5xl mx-auto flex-shrink-0">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider mb-8 animate-pulse-scale border border-primary-100">
            <SparkleIcon />
            A inteligência que seu bolso merece
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight">
          Assuma o controle da sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-500">liberdade financeira</span>
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
          Gerencie contas, cartões e metas em um único lugar com o app que entende o seu momento de vida.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full text-lg px-10 py-5 h-auto shadow-2xl shadow-primary-500/30 hover:shadow-primary-500/50 transition-all transform hover:-translate-y-1">
                    Começar Agora — Grátis
                </Button>
            </Link>
            <Link to="/about" className="w-full sm:w-auto">
                <Button variant="ghost" size="lg" className="w-full text-lg px-10 py-5 h-auto text-gray-600 hover:text-primary-600 group">
                    Conheça o App <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </Button>
            </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-gray-50 py-24 px-6 flex-shrink-0">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard 
                icon={<TrendingUp size={28} />}
                title="Controle Total"
                desc="Monitore todas as suas transações e saldos com gráficos intuitivos e organizados por inteligência artificial."
                color="bg-blue-100 text-blue-600"
            />
            <FeatureCard 
                icon={<Shield size={28} />}
                title="Segurança Máxima"
                desc="Seus dados financeiros são blindados por criptografia de ponta a ponta e auditorias constantes."
                color="bg-green-100 text-green-600"
            />
            <FeatureCard 
                icon={<BrainCircuit size={28} />}
                title="Radar do Mercado"
                desc="Insights em tempo real gerados por IA para você antecipar oportunidades e proteger seu patrimônio."
                color="bg-purple-100 text-purple-600"
            />
        </div>
      </section>

      {/* Mission Teaser (Institutional Bridge) */}
      <section className="py-24 px-6 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-20">
            <div className="flex-1 space-y-8">
                <div className="inline-flex items-center gap-2 text-primary-600 font-black tracking-widest text-[10px] uppercase bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
                    Nossa Missão
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                    Não somos apenas um app. Somos sua bússola econômica.
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed font-medium">
                    Acreditamos que a gestão financeira não deve ser um peso. Criamos o FinanceApp para que você gaste menos tempo organizando e mais tempo realizando.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                    <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <Heart size={24} />
                        </div>
                        <span className="font-bold text-gray-700">Foco Total no Usuário</span>
                    </div>
                    <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                            <Star size={24} />
                        </div>
                        <span className="font-bold text-gray-700">Qualidade Premium</span>
                    </div>
                </div>
                <div className="pt-8">
                    <Link to="/about">
                        <Button variant="outline" className="group border-gray-200 text-gray-700 hover:border-primary-600 hover:text-primary-600 px-8 py-4 h-auto font-bold">
                            Nossa História Completa
                            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="flex-1 relative">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary-100 rounded-full blur-[100px] opacity-40"></div>
                <div className="relative bg-gray-900 p-10 rounded-[2.5rem] border border-gray-800 shadow-3xl transform rotate-2 hover:rotate-0 transition-all duration-500">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="h-4 w-24 bg-gray-700 rounded-full"></div>
                            <Zap size={20} className="text-amber-500" />
                        </div>
                        <div className="h-40 w-full bg-gradient-to-br from-primary-500/20 to-transparent rounded-3xl flex items-center justify-center border border-white/5">
                            <TrendingUp size={64} className="text-primary-400 opacity-50" />
                        </div>
                        <div className="space-y-3">
                            <div className="h-4 w-full bg-gray-800 rounded-full"></div>
                            <div className="h-4 w-4/5 bg-gray-800 rounded-full"></div>
                            <div className="h-4 w-2/3 bg-gray-800 rounded-full"></div>
                        </div>
                        <div className="pt-4">
                            <div className="h-12 w-full bg-primary-600 rounded-2xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Trust Badge Bar */}
      <section className="py-12 bg-gray-50 border-y border-gray-100 flex justify-center overflow-hidden">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all">
              <span className="font-bold text-xl text-gray-400 uppercase tracking-tighter">Segurança Máxima</span>
              <span className="font-bold text-xl text-gray-400 uppercase tracking-tighter">IA Integrada</span>
              <span className="font-bold text-xl text-gray-400 uppercase tracking-tighter">Controle Total</span>
              <span className="font-bold text-xl text-gray-400 uppercase tracking-tighter">FinanceApp</span>
          </div>
      </section>

      {/* Footer is already in App.tsx wrapper */}
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) => (
    <div className="bg-white p-10 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:-translate-y-2 group">
        <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <h3 className="text-2xl font-bold mb-4 text-gray-900">{title}</h3>
        <p className="text-gray-500 leading-relaxed font-medium">
            {desc}
        </p>
    </div>
);

const SparkleIcon = () => (
    <svg className="w-4 h-4 text-primary-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12,2L14.4,9.6L22,12L14.4,14.4L12,22L9.6,14.4L2,12L9.6,9.6L12,2Z" />
    </svg>
);