
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Eye, EyeOff, Lock, Mail, ChevronRight, AlertCircle } from 'lucide-react';
import { User, PlanType } from '../types';
import { ADMIN_EMAIL, PERMANENT_PREMIUM_EMAIL, MOCK_USER } from '../constants';
import { useToast } from '../components/ui/Toast';
import { Card } from '../components/ui/Card';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulation of Auth Logic
    setTimeout(() => {
        if (email) {
            const normalizedEmail = email.toLowerCase().trim();
            let plan = PlanType.FREE;
            let isAdmin = false;
            let isPermanentPremium = false;

            if (normalizedEmail === ADMIN_EMAIL) {
                isAdmin = true;
                plan = PlanType.PREMIUM;
            }

            if (normalizedEmail === PERMANENT_PREMIUM_EMAIL) {
                plan = PlanType.PREMIUM;
                isPermanentPremium = true;
            }

            const user: User = {
                ...MOCK_USER,
                id: isAdmin ? 'admin-123' : (isPermanentPremium ? 'permanent-user-1' : 'user-123'),
                email: normalizedEmail,
                plan,
                is_admin: isAdmin,
                is_permanent_premium: isPermanentPremium,
                first_name: isAdmin ? 'Administrador' : (isPermanentPremium ? 'Bruno' : normalizedEmail.split('@')[0]),
                last_name: isPermanentPremium ? 'Mendes' : ''
            };
            
            onLogin(user);
            setLoading(false);
            
            if (isAdmin) navigate('/admin');
            else navigate('/');
        } else {
            setError('Dados inválidos. Verifique seu e-mail e senha.');
            setLoading(false);
        }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-8">
            <Link to="/">
                <img src="https://i.ibb.co/9mt6zRFj/generated-image-removebg-preview.png" alt="FinanceAPP" className="h-16 w-auto" />
            </Link>
        </div>
        
        <Card className="rounded-[2.5rem] p-10 border-none shadow-2xl shadow-gray-200/50 bg-white">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Bem-vindo</h1>
            <p className="text-sm text-gray-500 font-medium mt-2">Acesse sua inteligência financeira.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
                <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-100 flex items-center gap-2">
                    <AlertCircle size={14} /> {error}
                </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading} className="py-5 shadow-xl shadow-primary-500/20">
              Acessar Painel <ChevronRight className="ml-2" size={18} />
            </Button>
          </form>

          {/* Nova Seção de Links */}
          <div className="mt-8 border-t border-gray-50 pt-6">
            <div className="text-center">
              <button
                onClick={() => navigate('/forgot-password')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              >
                Esqueceu sua senha?
              </button>
            </div>
            
            <div className="mt-4 text-center text-sm text-gray-600">
              Não tem uma conta?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-blue-600 hover:text-blue-800 font-bold transition-colors"
              >
                Cadastre-se
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
