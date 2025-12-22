import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Eye, EyeOff, ShieldCheck, Mail, ArrowRight, MapPin, Check, ChevronLeft } from 'lucide-react';
import { User, PlanType, CheckoutAddress } from '../types';
import { formatCPF } from '../utils/validators';
import { registerSchema } from '../utils/schemas';
import { supabase, logAction } from '../services/supabaseClient';
import { createPremiumCheckout } from '../services/mercadoPago';
import { useToast } from '../components/ui/Toast';

interface RegisterProps {
  onLogin: (user: User) => void;
}

type Step = 'account' | 'address' | 'plan';

export const Register: React.FC<RegisterProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('account');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    cpf: '',
    address: {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: ''
    } as CheckoutAddress,
    plan: PlanType.FREE
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('address.')) {
        const field = name.split('.')[1];
        setFormData(prev => ({
            ...prev,
            address: { ...prev.address, [field]: value }
        }));
    } else {
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'cpf' ? formatCPF(value) : value 
        }));
    }
  };

  const handleNextStep = (next: Step) => {
      setError(null);
      if (currentStep === 'account') {
          if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || formData.cpf.length < 14) {
              setError("Preencha todos os dados da conta corretamente.");
              return;
          }
      }
      if (currentStep === 'address') {
          const addr = formData.address;
          if (!addr.street || !addr.number || !addr.neighborhood || !addr.city || !addr.state || !addr.zipCode) {
              setError("Todos os campos de endereço com * são obrigatórios.");
              return;
          }
      }
      setCurrentStep(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: { first_name: formData.firstName, last_name: formData.lastName, cpf: formData.cpf }
            }
        });

        if (authError) throw authError;

        const userId = authData.user?.id || `user-${Date.now()}`;

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

        await logAction(userId, 'USER_REGISTERED', { plan: formData.plan });

        if (formData.plan === PlanType.PREMIUM) {
            const { checkoutUrl } = await createPremiumCheckout({
                userId,
                userEmail: formData.email,
                userName: `${formData.firstName} ${formData.lastName}`,
                userCPF: formData.cpf,
                address: formData.address,
                planType: 'monthly'
            });
            // Persistir localmente antes do redirect
            localStorage.setItem('financeapp_user', JSON.stringify(newUser));
            window.location.href = checkoutUrl;
        } else {
            onLogin(newUser);
            addToast("Conta criada com sucesso!", "success");
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
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="flex justify-center mb-6">
            <Link to="/">
                <img src="https://i.ibb.co/9mt6zRFj/generated-image-removebg-preview.png" alt="FinanceAPP" className="h-12 w-auto" />
            </Link>
        </div>
        
        <div className="flex items-center justify-between mb-8 max-w-md mx-auto">
            <ProgressStep active={currentStep === 'account'} completed={currentStep !== 'account'} icon={<ShieldCheck size={18} />} label="Perfil" />
            <div className={`flex-1 h-1 mx-2 rounded ${currentStep !== 'account' ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
            <ProgressStep active={currentStep === 'address'} completed={currentStep === 'plan'} icon={<MapPin size={18} />} label="Endereço" />
            <div className={`flex-1 h-1 mx-2 rounded ${currentStep === 'plan' ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
            <ProgressStep active={currentStep === 'plan'} completed={false} icon={<Mail size={18} />} label="Plano" />
        </div>

        <h2 className="text-center text-3xl font-black text-gray-900 tracking-tight">
            {currentStep === 'account' && 'Dados Pessoais'}
            {currentStep === 'address' && 'Endereço de Cobrança'}
            {currentStep === 'plan' && 'Escolha seu Plano'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-10 px-6 shadow-xl rounded-[2.5rem] border border-gray-100 sm:px-12">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-bold border-l-4 border-red-500">{error}</div>}

            {currentStep === 'account' && (
                <div className="space-y-4 animate-fade-in-up">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Nome" name="firstName" value={formData.firstName} onChange={handleChange} />
                        <Input label="Sobrenome" name="lastName" value={formData.lastName} onChange={handleChange} />
                    </div>
                    <Input label="CPF" name="cpf" value={formData.cpf} onChange={handleChange} placeholder="000.000.000-00" maxLength={14} />
                    <Input label="E-mail" name="email" type="email" value={formData.email} onChange={handleChange} />
                    <div className="relative">
                        <Input label="Senha" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <Button type="button" fullWidth size="lg" onClick={() => handleNextStep('address')} className="mt-4">
                        Próxima Etapa <ArrowRight size={18} className="ml-2" />
                    </Button>
                </div>
            )}

            {currentStep === 'address' && (
                <div className="space-y-4 animate-fade-in-up">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                             <Input label="Rua/Avenida *" name="address.street" value={formData.address.street} onChange={handleChange} />
                        </div>
                        <Input label="Número *" name="address.number" value={formData.address.number} onChange={handleChange} />
                        <Input label="Complemento" name="address.complement" value={formData.address.complement} onChange={handleChange} />
                        <Input label="Bairro *" name="address.neighborhood" value={formData.address.neighborhood} onChange={handleChange} />
                        <Input label="CEP *" name="address.zipCode" value={formData.address.zipCode} onChange={handleChange} placeholder="00000-000" />
                        <Input label="Cidade *" name="address.city" value={formData.address.city} onChange={handleChange} />
                        <Input label="Estado *" name="address.state" value={formData.address.state} onChange={handleChange} placeholder="UF" maxLength={2} />
                    </div>
                    <div className="flex gap-4">
                        <Button type="button" variant="outline" size="lg" onClick={() => setCurrentStep('account')} className="flex-1">Voltar</Button>
                        <Button type="button" fullWidth size="lg" onClick={() => handleNextStep('plan')} className="flex-[2]">Continuar</Button>
                    </div>
                </div>
            )}

            {currentStep === 'plan' && (
                <div className="space-y-4 animate-fade-in-up">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <PlanCard 
                            active={formData.plan === PlanType.FREE} 
                            onClick={() => setFormData({...formData, plan: PlanType.FREE})}
                            title="Plano Free" 
                            price="R$ 0" 
                            desc="Essencial para começar"
                        />
                        <PlanCard 
                            active={formData.plan === PlanType.PREMIUM} 
                            onClick={() => setFormData({...formData, plan: PlanType.PREMIUM})}
                            title="Plano Premium" 
                            price="R$ 19,90" 
                            desc="Tudo liberado com IA"
                        />
                    </div>
                    <div className="flex gap-4">
                        <Button type="button" variant="outline" size="lg" onClick={() => setCurrentStep('address')} className="flex-1">Voltar</Button>
                        <Button type="submit" fullWidth size="lg" loading={loading} className="flex-[2]">
                            {formData.plan === PlanType.PREMIUM ? 'Ir para Pagamento' : 'Finalizar Cadastro'}
                        </Button>
                    </div>
                </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

const ProgressStep = ({ active, completed, icon, label }: any) => (
    <div className="flex flex-col items-center gap-1">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${completed ? 'bg-primary-500 text-white' : active ? 'bg-primary-100 text-primary-600 ring-2 ring-primary-500' : 'bg-gray-100 text-gray-400'}`}>
            {completed ? <Check size={18} /> : icon}
        </div>
        <span className={`text-[10px] font-bold uppercase ${active ? 'text-primary-600' : 'text-gray-400'}`}>{label}</span>
    </div>
);

const Input = ({ label, ...props }: any) => (
    <div>
        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
        <input {...props} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all" />
    </div>
);

const PlanCard = ({ active, onClick, title, price, desc }: any) => (
    <div 
        onClick={onClick}
        className={`p-6 rounded-3xl border-2 cursor-pointer transition-all ${active ? 'border-primary-600 bg-primary-50 shadow-lg scale-105' : 'border-gray-100 hover:border-primary-200'}`}
    >
        <div className="font-black text-gray-900">{title}</div>
        <div className="text-2xl font-black text-primary-600 my-2">{price}<span className="text-xs text-gray-400">/mês</span></div>
        <div className="text-[10px] text-gray-500 font-medium">{desc}</div>
    </div>
);