import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { TrendingUp, Shield, Smartphone } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Header */}
      <header className="py-4 px-6 border-b border-gray-100 flex justify-between items-center fixed w-full bg-white/90 backdrop-blur-sm z-50">
        <div className="flex items-center gap-2">
            <Link to="/" className="hover:opacity-80 transition-opacity">
                <img 
                  src="https://i.ibb.co/9mt6zRFj/generated-image-removebg-preview.png" 
                  alt="FinanceAPP" 
                  className="h-10 w-auto object-contain"
                />
            </Link>
        </div>
        <Link to="/login">
            <Button variant="outline">Entrar</Button>
        </Link>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center max-w-5xl mx-auto flex-shrink-0">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-6 animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-primary-600 mr-2"></span>
            Gestão financeira inteligente
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight">
          Assuma o controle da sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-500">liberdade financeira</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Gerencie contas, cartões, metas e despesas em um único lugar. Inteligente, simples e seguro. Comece hoje mesmo.
        </p>
        <Link to="/login">
            <Button size="lg" className="text-lg px-8 py-4 h-auto shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40 transition-all transform hover:-translate-y-1">
                Iniciar Agora
            </Button>
        </Link>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-24 px-6 flex-shrink-0">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mb-6">
                    <TrendingUp size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Controle Total</h3>
                <p className="text-gray-600 leading-relaxed">Monitore todas as suas transações, saldos e faturas em tempo real com gráficos intuitivos.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                    <Shield size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Segurança Garantida</h3>
                <p className="text-gray-600 leading-relaxed">Seus dados são criptografados de ponta a ponta e armazenados com os mais altos padrões de segurança.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                    <Smartphone size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Acesso em Qualquer Lugar</h3>
                <p className="text-gray-600 leading-relaxed">Acesse suas finanças pelo computador, tablet ou celular a qualquer momento, onde estiver.</p>
            </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-24 px-6 bg-white flex-shrink-0">
          <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Planos que cabem no seu bolso</h2>
              <p className="text-gray-600 mb-12">Comece gratuitamente ou desbloqueie todo o potencial com o plano Premium.</p>
              
              <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="p-8 border border-gray-200 rounded-2xl">
                      <h3 className="text-xl font-semibold text-gray-900">Free</h3>
                      <div className="text-4xl font-bold text-gray-900 my-4">R$ 0<span className="text-lg font-normal text-gray-500">/mês</span></div>
                      <ul className="text-left space-y-3 mb-8 text-gray-600">
                          <li className="flex items-center"><span className="mr-2 text-green-500">✓</span> 1 Conta</li>
                          <li className="flex items-center"><span className="mr-2 text-green-500">✓</span> 1 Cartão</li>
                          <li className="flex items-center"><span className="mr-2 text-green-500">✓</span> Controle básico</li>
                      </ul>
                      <Link to="/register">
                        <Button variant="outline" fullWidth>Começar Grátis</Button>
                      </Link>
                  </div>
                  <div className="p-8 border border-primary-200 bg-primary-50 rounded-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">MAIS POPULAR</div>
                      <h3 className="text-xl font-semibold text-primary-900">Premium</h3>
                      <div className="text-4xl font-bold text-gray-900 my-4">R$ 19,90<span className="text-lg font-normal text-gray-500">/mês</span></div>
                      <ul className="text-left space-y-3 mb-8 text-gray-700">
                          <li className="flex items-center"><span className="mr-2 text-primary-600">✓</span> Contas Ilimitadas</li>
                          <li className="flex items-center"><span className="mr-2 text-primary-600">✓</span> Cartões Ilimitados</li>
                          <li className="flex items-center"><span className="mr-2 text-primary-600">✓</span> Metas & Relatórios</li>
                          <li className="flex items-center"><span className="mr-2 text-primary-600">✓</span> Radar do Mercado</li>
                      </ul>
                       <Link to="/register">
                        <Button fullWidth>Assinar Agora</Button>
                      </Link>
                  </div>
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 px-6 text-center text-gray-400 text-sm mt-auto">
        <div className="flex justify-center items-center gap-2 mb-8">
             <Link to="/" className="hover:opacity-80 transition-opacity">
                <img 
                  src="https://i.ibb.co/9mt6zRFj/generated-image-removebg-preview.png" 
                  alt="FinanceAPP" 
                  className="h-10 w-auto object-contain opacity-75 grayscale hover:grayscale-0 transition-all"
                />
             </Link>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 mb-8 text-gray-300">
             <Link to="/about" className="hover:text-white transition-colors">Sobre Nós</Link>
             <Link to="/plans" className="hover:text-white transition-colors">Planos</Link>
             <Link to="/contact" className="hover:text-white transition-colors">Fale Conosco</Link>
        </div>

        <p>&copy; {new Date().getFullYear()} FinanceAPP. Feito com amor. ❤️</p>
      </footer>
    </div>
  );
};