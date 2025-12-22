import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Linkedin, Github, ShieldCheck, Mail, ArrowRight, Smartphone, Lock, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand & Social */}
          <div className="space-y-8">
            <Link to="/" className="inline-block transition-transform hover:scale-105">
              <img src="https://i.ibb.co/9mt6zRFj/generated-image-removebg-preview.png" alt="FinanceApp" className="h-12 w-auto" />
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Tecnologia brasileira focada em empoderar pessoas através da clareza financeira e investimentos inteligentes.
            </p>
            <div className="flex gap-4">
              <SocialLink icon={<Instagram size={18} />} href="#" />
              <SocialLink icon={<Twitter size={18} />} href="#" />
              <SocialLink icon={<Linkedin size={18} />} href="#" />
              <SocialLink icon={<Github size={18} />} href="#" />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-2">
            <div>
              <h4 className="text-gray-900 font-bold mb-8 uppercase text-xs tracking-widest">Produto</h4>
              <ul className="space-y-4">
                <FooterLink to="/" label="Dashboard" />
                <FooterLink to="/accounts" label="Minhas Contas" />
                <FooterLink to="/cards" label="Cartões & Faturas" />
                <FooterLink to="/radar" label="Radar IA" />
                <FooterLink to="/plans" label="Preços" />
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-bold mb-8 uppercase text-xs tracking-widest">Empresa</h4>
              <ul className="space-y-4">
                <FooterLink to="/about" label="Sobre Nós" />
                <FooterLink to="/contact" label="Contato" />
                <FooterLink to="/about" label="Segurança" />
                <FooterLink to="/about" label="Privacidade" />
              </ul>
            </div>
          </div>

          {/* Newsletter / App */}
          <div className="space-y-8">
            <div>
                <h4 className="text-gray-900 font-bold mb-6 flex items-center gap-2">
                    <Mail size={16} className="text-primary-600" /> Newsletter
                </h4>
                <div className="relative group">
                    <input 
                        type="email" 
                        placeholder="seu@email.com" 
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all group-hover:bg-white"
                    />
                    <button className="absolute right-2 top-2 bg-primary-600 text-white p-2 rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20">
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200">
                            <img src={`https://i.pravatar.cc/100?img=${i+10}`} className="rounded-full" alt="User" />
                        </div>
                    ))}
                </div>
                <span className="text-xs text-gray-500 font-medium">+15k usuários ativos</span>
            </div>
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-400 font-medium">
            <span className="flex items-center gap-1.5"><Lock size={14} className="text-green-500" /> SSL 256-bit</span>
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-blue-500" /> LGPD Compliant</span>
            <span className="flex items-center gap-1.5"><Award size={14} className="text-amber-500" /> Melhores Apps 2024</span>
          </div>
          <div className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} FinanceApp S.A. CNPJ 00.000.000/0001-00. Feito com ❤️ no Brasil.
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialLink = ({ icon, href }: { icon: React.ReactNode, href: string }) => (
  <a href={href} className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition-all border border-transparent hover:border-primary-100">
    {icon}
  </a>
);

const FooterLink = ({ to, label }: { to: string, label: string }) => (
  <li>
    <Link to={to} className="text-gray-500 text-sm font-medium hover:text-primary-600 transition-colors flex items-center group">
      <span className="w-0 group-hover:w-2 h-0.5 bg-primary-500 mr-0 group-hover:mr-2 transition-all"></span>
      {label}
    </Link>
  </li>
);