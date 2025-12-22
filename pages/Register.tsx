import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Eye, EyeOff, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { User, PlanType } from '../types';
import { formatCPF } from '../utils/validators';
import { registerSchema } from '../utils/schemas';
import { supabase, logAction } from '../services/supabaseClient';
import { createPremiumCheckout } from '../services/mercadoPago';
import { sendWelcomeEmail } from '../services/mailerLite';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [name]: name === 'cpf' ? formatCPF(value) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const validation = registerSchema.safeParse(formData);
    if (!validation.success) {
        setError(validation.error.issues[0].message);
        setLoading(false);
        return;
    }

    try {
        // 1. Criar Auth no Supabase
        const { data, error: authError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: { first_name: formData.firstName, last_name: formData.lastName, cpf: formData.cpf }
            }
        });

        if (authError) throw authError;

        const userId = data.user?.id || `user-${Date.now()}`;
        const newUser: User = {
            id: userId,
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            cpf: formData.cpf,
            address: formData.address,
            plan: formData.plan,
            is_admin: false,
            avatar_url: `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=0ea5e9&color=fff`
        };

        // 2. Audit Log
        await logAction(userId, 'USER_REGISTERED', { plan: formData.plan, email: formData.email });

        // 3. E-mail de Boas-vindas (MailerLite Real)
        await sendWelcomeEmail({
            email: newUser.email,
            name: newUser.first_name,
            plan: formData.plan
        });

        if (formData.plan === PlanType.PREMIUM) {
            // 4. Iniciar Checkout Mercado Pago
            const { checkoutUrl } = await createPremiumCheckout({
                userId,
                userEmail: formData.email,
                userName: `${formData.firstName} ${formData.lastName}`,
                userCPF: formData.cpf,
                planType: 'monthly'
            });
            window.location.href = checkoutUrl;
        } else {
            onLogin(newUser);
            addToast("Conta criada com sucesso! Verifique seu e-mail.", "success");
            navigate('/');
        }

    } catch (err: any) {
        setError(err.message || 'Erro ao processar cadastro.');
        addToast(err.message, "error");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="flex justify-center mb-8">
            <Link to="/">
                <img src="https://i.ibb.co/9mt6zRFj/generated-image-removebg-preview.png" alt="FinanceAPP" className="h-14 w-auto" />
            </Link>
        </div>
        <h2 className="text-center text-3xl font-black text-gray-900 tracking-tight">Comece sua jornada hoje</h2>
        <p className="mt-2 text-center text-sm text-gray-500 font-medium">
          Escolha o plano que melhor se adapta às suas necessidades.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="bg-white py-10 px-6 shadow-2xl rounded-[2rem] border border-gray-100 sm:px-12">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg text-red-700 text-sm font-bold">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-5">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <ShieldCheck className="text-primary-600" size={20} /> Seus Dados
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Nome" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="João" />
                        <Input label="Sobrenome" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Silva" />
                    </div>
                    <Input label="CPF" name="cpf" value={formData.cpf} onChange={handleChange} placeholder="000.000.000-00" maxLength={14} />
                    <Input label="E-mail" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="seu@email.com" />
                    <div className="relative">
                        <Input label="Senha" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} placeholder="••••••••" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="space-y-5">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Mail className="text-primary-600" size={20} /> Escolha o Plano
                    </h3>
                    <div 
                        className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${formData.plan === PlanType.FREE ? 'border-primary-600 bg-primary-50 shadow-lg' : 'border-gray-100 hover:border-primary-200'}`}
                        onClick={() => setFormData({...formData, plan: PlanType.FREE})}
                    >
                        <div className="flex justify-between items-center font-bold text-gray-900">
                            <span>Plano Free</span>
                            <span>Grátis</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">1 Conta, 1 Cartão, Metas Limitadas.</p>
                    </div>

                    <div 
                        className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${formData.plan === PlanType.PREMIUM ? 'border-amber-500 bg-amber-50 shadow-lg' : 'border-gray-100 hover:border-amber-200'}`}
                        onClick={() => setFormData({...formData, plan: PlanType.PREMIUM})}
                    >
                        <div className="absolute top-0 right-0 bg-amber-500 text-white text-[8px] font-black px-2 py-1 uppercase">Recomendado</div>
                        <div className="flex justify-between items-center font-bold text-amber-900">
                            <span>Plano Premium</span>
                            <span>R$ 19,90/mês</span>
                        </div>
                        <p className="text-xs text-amber-700/70 mt-2">Tudo Ilimitado + Radar IA + PDF Export.</p>
                    </div>

                    <div className="pt-6">
                        <Button type="submit" fullWidth size="lg" loading={loading} className="py-4 text-lg shadow-xl shadow-primary-500/20">
                            {formData.plan === PlanType.FREE ? 'Finalizar Cadastro' : 'Ir para Pagamento'}
                            <ArrowRight className="ml-2" size={20} />
                        </Button>
                    </div>
                </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, ...props }: any) => (
    <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
        <input {...props} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all focus:bg-white" />
    </div>
);