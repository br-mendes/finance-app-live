import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white py-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-gray-600">
          <Link to="/about" className="hover:text-primary-600 transition-colors">
            Sobre Nós
          </Link>
          <Link to="/plans" className="hover:text-primary-600 transition-colors">
            Planos
          </Link>
          <Link to="/contact" className="hover:text-primary-600 transition-colors">
            Fale Conosco
          </Link>
        </div>
        <div className="text-sm text-gray-400 font-medium">
          <p>Feito com amor. ❤️</p>
        </div>
      </div>
    </footer>
  );
};