
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { useToast } from '../ui/Toast';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { 
  Mail, ShieldCheck, ChevronRight, AlertCircle, 
  Loader2, CheckCircle2, ChevronLeft, MapPin, 
  User as UserIcon, CreditCard, Sparkles
} from 'lucide-react';
import { formatCPF, isValidEmail, isValidCPF } from '../../utils/validators';
import { PlanType, CheckoutAddress, User } from '../../types';
import { createPremiumCheckout } from '../../services/mercadoPago';
import { PayPalCheckoutButton } from '../payment/PayPalCheckoutButton';
import { logAction } from '../../services/supabaseClient';
// Fix: Import MOCK_USER from constants to resolve reference error
import { MOCK_USER } from '../../constants';

type Step = 'personal' | 'address' | 'plan' | 'payment';

export const SignupWizard: React.FC<{ onLogin: (user: any) => void }> = ({ onLogin }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<Step>('personal');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tempUserId, setTempUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    cpf: '',
    firstName: '',
    lastName: '',
    password: '',
    plan: PlanType.FREE,
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    } as CheckoutAddress
  });

  // Debounced email check
  useEffect(() => {
    if (!formData.email || !isValidEmail(formData.email)) return;
    
    const checkEmail = async () => {
      setChecking(true);
      try {
        const { data } = await supabase.rpc('check_existing_user', {
          p_email: formData.email,
          p_cpf: ''
        });
        
        if (data?.[0]?.exists_email) {
          setErrors(prev => ({ ...prev, email: 'Este e-mail já está cadastrado' }));
        } else {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.email;
            return newErrors;
          });
        }
      } finally {
        setChecking(false);
      }
    };
    
    const timeoutId = setTimeout(checkEmail, 800);
    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  const handlePersonalNext = () => {
    if (!formData.email || !formData.cpf || !formData.firstName || !formData.lastName || !formData.password) {
      addToast("Preencha todos os campos obrigatórios.", "error");
      return;
    }
    if (Object.keys(errors).length > 0) {
      addToast("Corrija os erros destacados antes de avançar.", "warning");
      return;
    }
    setCurrentStep('address');
  };

  const handleAddressNext = () => {
    const { street, number, neighborhood, city, state, zipCode } = formData.address;
    if (!street || !number || !neighborhood || !city || !state || !zipCode) {
      addToast("Preencha o endereço completo para continuar.", "error");
      return;
    }
    setCurrentStep('plan');
  };

  const handlePlanSelection = async () => {
    if (formData.plan === PlanType.FREE) {
      await handleFinalRegistration();
    } else {
      setCurrentStep('payment');
    }
  };

  const handleFinalRegistration = async () => {
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { 
            first_name: formData.firstName, 
            last_name: formData.lastName, 
            cpf: formData.cpf,
            address: formData.address 
          }
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
      
      onLogin(newUser);
      addToast("Bem-vindo ao FinanceApp! 🎉", "success");
      navigate('/');
      
    } catch (err: any) {
      addToast(err.message || 'Erro ao processar cadastro.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMercadoPagoRedirect = async () => {
    setLoading(true);
    try {
      // Registrar temporariamente para ter um ID
      const userId = `temp_${Date.now()}`;
      const { checkoutUrl } = await createPremiumCheckout({
        userId,
        userEmail: formData.email,
        userName: `${formData.firstName} ${formData.lastName}`,
        userCPF: formData.cpf,
        address: formData.address,
        planType: 'monthly'
      });
      
      // Salvar intenção de cadastro
      localStorage.setItem('pending_signup', JSON.stringify(formData));
      window.location.href = checkoutUrl;
    } catch (error) {
      addToast('Falha ao iniciar Mercado Pago', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <StepIndicator active={currentStep === 'personal'} completed={['address', 'plan', 'payment'].includes(currentStep)} icon={<UserIcon size={18} />} label="Perfil" />
        <div className={`flex-1 h-1 mx-4 rounded-full transition-colors ${['address', 'plan', 'payment'].includes(currentStep) ? 'bg-primary-500' : 'bg-gray-100'}`} />
        <StepIndicator active={currentStep === 'address'} completed={['plan', 'payment'].includes(currentStep)} icon={<MapPin size={18} />} label="Endereço" />
        <div className={`flex-1 h-1 mx-4 rounded-full transition-colors ${['plan', 'payment'].includes(currentStep) ? 'bg-primary-500' : 'bg-gray-100'}`} />
        <StepIndicator active={currentStep === 'plan'} completed={currentStep === 'payment'} icon={<Sparkles size={18} />} label="Plano" />
        <div className={`flex-1 h-1 mx-4 rounded-full transition-colors ${currentStep === 'payment' ? 'bg-primary-500' : 'bg-gray-100'}`} />
        <StepIndicator active={currentStep === 'payment'} completed={false} icon={<CreditCard size={18} />} label="Pagamento" />
      </div>

      <Card className="p-8 md:p-12 rounded-[3rem] border-none shadow-2xl shadow-gray-200/50 bg-white">
        {currentStep === 'personal' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail Profissional</label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? 'text-rose-500' : 'text-gray-400'}`} size={18} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all ${errors.email ? 'border-rose-500 bg-rose-50/50' : 'border-gray-100'}`}
                    placeholder="seu@email.com"
                  />
                  {checking && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-primary-500" size={18} />}
                </div>
                {errors.email && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.email}</p>}
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CPF</label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => setFormData({...formData, cpf: formatCPF(e.target.value)})}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sobrenome</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Senha</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>
            <Button fullWidth size="lg" onClick={handlePersonalNext} className="py-5 shadow-xl shadow-primary-500/20">
              Continuar <ChevronRight className="ml-2" size={18} />
            </Button>
          </div>
        )}

        {currentStep === 'address' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input label="Rua" value={formData.address.street} onChange={(val: string) => setFormData({...formData, address: {...formData.address, street: val}})} />
              </div>
              <Input label="Número" value={formData.address.number} onChange={(val: string) => setFormData({...formData, address: {...formData.address, number: val}})} />
              <Input label="CEP" value={formData.address.zipCode} onChange={(val: string) => setFormData({...formData, address: {...formData.address, zipCode: val}})} />
              <Input label="Bairro" value={formData.address.neighborhood} onChange={(val: string) => setFormData({...formData, address: {...formData.address, neighborhood: val}})} />
              <Input label="Cidade" value={formData.address.city} onChange={(val: string) => setFormData({...formData, address: {...formData.address, city: val}})} />
              <Input label="Estado (UF)" value={formData.address.state} onChange={(val: string) => setFormData({...formData, address: {...formData.address, state: val.toUpperCase()}})} maxLength={2} />
            </div>
            <div className="flex gap-4 pt-4">
              <Button variant="ghost" onClick={() => setCurrentStep('personal')} className="flex-1">Voltar</Button>
              <Button onClick={handleAddressNext} className="flex-[2] py-5 shadow-xl shadow-primary-500/20">Ver Planos</Button>
            </div>
          </div>
        )}

        {currentStep === 'plan' && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <PlanCard 
                title="Plano Essencial"
                price="Grátis"
                active={formData.plan === PlanType.FREE}
                onClick={() => setFormData({...formData, plan: PlanType.FREE})}
              />
              <PlanCard 
                title="Plano Premium"
                price="R$ 19,90"
                active={formData.plan === PlanType.PREMIUM}
                onClick={() => setFormData({...formData, plan: PlanType.PREMIUM})}
                isPro
              />
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" onClick={() => setCurrentStep('address')} className="flex-1">Voltar</Button>
              <Button onClick={handlePlanSelection} loading={loading} className="flex-[2] py-5 shadow-xl shadow-primary-500/20">
                {formData.plan === PlanType.PREMIUM ? 'Prosseguir para Pagamento' : 'Finalizar Cadastro'}
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'payment' && (
          <div className="space-y-8 animate-fade-in-up text-center">
             <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Quase lá! 🚀</h3>
                <p className="text-sm text-gray-500">Escolha o seu método de pagamento preferido para ativar o Premium.</p>
             </div>

             <div className="space-y-6">
                {/* PayPal Option */}
                <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                   <PayPalCheckoutButton 
                      user={{...MOCK_USER, email: formData.email, first_name: formData.firstName} as User} 
                      amount={19.90} 
                   />
                </div>

                <div className="flex items-center gap-4 text-gray-300">
                    <div className="flex-1 h-px bg-gray-100"></div>
                    <span className="text-[10px] font-black uppercase">ou use Mercado Pago</span>
                    <div className="flex-1 h-px bg-gray-100"></div>
                </div>

                <Button 
                  fullWidth 
                  onClick={handleMercadoPagoRedirect} 
                  className="bg-[#009EE3] hover:bg-[#008CC9] border-none py-4 rounded-xl flex items-center justify-center gap-2"
                >
                  Pagar com Mercado Pago
                </Button>
             </div>

             <button onClick={() => setCurrentStep('plan')} className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-primary-600">
                Voltar aos Planos
             </button>
          </div>
        )}
      </Card>
    </div>
  );
};

const PlanCard = ({ title, price, active, onClick, isPro }: any) => (
  <div 
    onClick={onClick}
    className={`p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all relative overflow-hidden ${active ? 'border-primary-500 bg-primary-50 shadow-inner' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
  >
    {isPro && <div className="absolute top-0 right-0 bg-primary-500 text-white text-[8px] font-black px-3 py-1.5 rounded-bl-xl tracking-[0.2em] uppercase">Popular</div>}
    <h4 className={`font-black text-sm uppercase tracking-widest ${active ? 'text-primary-700' : 'text-gray-400'}`}>{title}</h4>
    <p className="text-3xl font-black text-gray-900 mt-2">{price}</p>
    <div className="mt-4 space-y-2">
        <div className="h-1 w-8 bg-gray-100 rounded-full"></div>
        <p className="text-[9px] font-bold text-gray-400 uppercase leading-relaxed">{isPro ? 'IA • Ilimitado • Reports' : '1 Conta • 1 Cartão • Dashboard'}</p>
    </div>
  </div>
);

const StepIndicator = ({ active, completed, icon, label }: any) => (
  <div className="flex flex-col items-center gap-2">
    <div className={`
      w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
      ${completed ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 
        active ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30 ring-4 ring-primary-50' : 
        'bg-gray-100 text-gray-400'}
    `}>
      {completed ? <CheckCircle2 size={22} /> : icon}
    </div>
    <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-primary-600' : 'text-gray-400'}`}>{label}</span>
  </div>
);

const Input = ({ label, value, onChange, placeholder, maxLength }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
    />
  </div>
);
