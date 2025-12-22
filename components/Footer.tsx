
import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-12 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shadow-sm z-30 transition-all duration-300">
      <div className="container mx-auto h-full px-6">
        <div className="flex items-center justify-between h-full">
          <div className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            © {new Date().getFullYear()} <span className="text-primary-600">FinanceApp</span>. Feito com ❤️
          </div>
          
          <div className="flex items-center space-x-6">
            <FooterLink to="/about" label="Sobre" />
            <FooterLink to="/contact" label="Contato" />
            <FooterLink to="/terms" label="Termos" />
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, label }: { to: string, label: string }) => (
  <Link 
    to={to} 
    className="text-[10px] sm:text-xs font-black text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 uppercase tracking-widest transition-colors"
  >
    {label}
  </Link>
);
