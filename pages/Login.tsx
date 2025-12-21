import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { User, PlanType } from '../types';
import { ADMIN_EMAIL, PERMANENT_PREMIUM_EMAIL, MOCK_USER } from '../constants';
import { useToast } from '../components/ui/Toast';

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

            // 1. Admin Logic
            if (normalizedEmail === ADMIN_EMAIL) {
                isAdmin = true;
                plan = PlanType.PREMIUM; // Admins get full access
            }

            // 2. Permanent Premium Logic
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
            
            if (isAdmin) {
                navigate('/admin');
            } else {
                if (isPermanentPremium) {
                    addToast("Você é usuário Premium permanente! 🎉", "success");
                } else {
                    addToast("Login realizado com sucesso!", "success");
                }
                navigate('/');
            }
        } else {
            setError('Por favor, insira um email válido.');
            setLoading(false);
        }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
            <Link to="/">
                <img 
                  src="https://i.ibb.co/9mt6zRFj/generated-image-removebg-preview.png" 
                  alt="FinanceAPP Logo" 
                  className="h-20 w-auto hover:opacity-90 transition-opacity"
                />
            </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Entrar no FinanceAPP
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ou{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
            crie sua conta gratuitamente
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Lembrar de mim
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            <div>
              <Button type="submit" fullWidth loading={loading}>
                Entrar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};