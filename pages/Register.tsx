import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Eye, EyeOff, Lock, Mail, Check } from 'lucide-react';
import { User, PlanType } from '../types';
import { formatCPF } from '../utils/validators';
import { registerSchema } from '../utils/schemas';
import { supabase } from '../services/supabaseClient';
import { paymentService } from '../services/paymentService';
import { emailService } from '../services/emailService';
import { useToast } from '../components/ui/Toast';

interface RegisterProps {
  onLogin: (user: User) => void;
}

export const Register: React.FC<RegisterProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    cpf: '',
    address: '',
    plan: PlanType.FREE
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'cpf') {
        setFormData(prev => ({ ...prev, [name]: formatCPF(value) }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePlanSelect = (plan: PlanType) => {
      setFormData(prev => ({ ...prev, plan }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Zod Validation
    const validation = registerSchema.safeParse(formData);

    if (!validation.success) {
        const firstError = validation.error.issues[0].message;
        setError(firstError);
        setLoading(false);
        return;
    }

    try {
        // Supabase Auth SignUp
        const { data, error: authError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    cpf: formData.cpf,
                    initial_plan: PlanType.FREE 
                }
            }
        });

        if (authError) {
            throw authError;
        }

        // Construct User object
        const newUser: User = {
            id: data.user?.id || `user-${Date.now()}`,
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            cpf: formData.cpf,
            address: formData.address,
            plan: PlanType.FREE, // Starts free
            is_admin: false,
            avatar_url: `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=0ea5e9&color=fff`
        };

        // Send Welcome Email (Non-blocking)
        emailService.sendWelcomeEmail(newUser).catch(console.error);

        if (formData.plan === PlanType.PREMIUM) {
            // Initiate Mercado Pago Checkout
            const response = await paymentService.createCheckoutSession(newUser);
            window.location.hash = response.init_point.replace('#/', ''); 
        } else {
            // Free plan direct login
            onLogin(newUser);
            addToast("Conta criada com sucesso! Verifique seu email.", "success");
            navigate('/');
        }

    } catch (err: any) {
        console.error("Registration Error:", err);
        setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="flex justify-center mb-6">
            <Link to="/">
                <img 
                src="https://i.ibb.co/9mt6zRFj/generated-image-removebg-preview.png" 
                alt="FinanceAPP Logo" 
                className="h-16 w-auto"
                />
            </Link>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Crie sua conta no FinanceAPP
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Já tem uma conta?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Fazer login
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Dados Pessoais</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nome</label>
                            <input
                                name="firstName"
                                type="text"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border p-2"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Sobrenome</label>
                            <input
                                name="lastName"
                                type="text"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border p-2"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">CPF</label>
                        <input
                            name="cpf"
                            type="text"
                            placeholder="000.000.000-00"
                            maxLength={14}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border p-2"
                            value={formData.cpf}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Endereço Completo</label>
                        <input
                            name="address"
                            type="text"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border p-2"
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                            name="email"
                            type="email"
                            className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                            placeholder="seu@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Senha</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
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
                </div>

                {/* Plan Selection */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Selecione seu Plano</h3>
                    
                    <div 
                        className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${formData.plan === PlanType.FREE ? 'border-gray-500 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => handlePlanSelect(PlanType.FREE)}
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.plan === PlanType.FREE ? 'border-gray-600 bg-gray-600' : 'border-gray-300'}`}>
                                    {formData.plan === PlanType.FREE && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                                </div>
                                <span className="font-bold text-gray-900">Plano Free</span>
                            </div>
                            <span className="font-bold text-gray-900">R$ 0,00<span className="text-xs font-normal text-gray-500">/mês</span></span>
                        </div>
                        <div className="mt-3 text-sm text-gray-600 ml-8">
                            <ul className="list-disc pl-4 space-y-1">
                                <li>1 Conta bancária</li>
                                <li>1 Cartão de crédito</li>
                                <li>Controle de despesas básico</li>
                            </ul>
                        </div>
                    </div>

                    <div 
                        className={`cursor-pointer rounded-lg border-2 p-4 transition-all relative ${formData.plan === PlanType.PREMIUM ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-200'}`}
                        onClick={() => handlePlanSelect(PlanType.PREMIUM)}
                    >
                        {formData.plan === PlanType.PREMIUM && (
                             <div className="absolute -top-3 -right-3 bg-primary-600 text-white p-1 rounded-full shadow-md">
                                 <Check size={16} />
                             </div>
                        )}
                        <div className="flex justify-between items-center">
                             <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.plan === PlanType.PREMIUM ? 'border-primary-600 bg-primary-600' : 'border-gray-300'}`}>
                                    {formData.plan === PlanType.PREMIUM && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                                </div>
                                <span className="font-bold text-primary-900">Plano Premium</span>
                            </div>
                            <span className="font-bold text-primary-900">R$ 19,90<span className="text-xs font-normal text-primary-700">/mês</span></span>
                        </div>
                        <div className="mt-3 text-sm text-gray-600 ml-8">
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>Contas ilimitadas</strong></li>
                                <li><strong>Cartões ilimitados</strong></li>
                                <li>Metas financeiras</li>
                                <li>Radar de Mercado (IA)</li>
                                <li>Gráficos avançados</li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button type="submit" fullWidth size="lg" loading={loading}>
                            {formData.plan === PlanType.FREE ? 'Finalizar Cadastro Grátis' : 'Ir para Pagamento'}
                        </Button>
                        <p className="text-xs text-center text-gray-500 mt-4">
                            Ao criar uma conta, você concorda com nossos Termos de Serviço e Política de Privacidade.
                        </p>
                    </div>
                </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};