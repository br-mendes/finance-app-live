
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { sendPasswordResetEmail } from '../services/mailerLite';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Lock, Mail, Key, CheckCircle, ChevronLeft, ShieldCheck } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  
  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Detectar rota de reset ou parâmetros de recuperação do Supabase
  useEffect(() => {
    const isResetRoute = location.pathname.includes('/reset-password') || searchParams.get('type') === 'recovery';
    if (isResetRoute || searchParams.get('step') === 'reset') {
      setStep('reset');
    } else if (searchParams.get('step') === 'verify') {
      setStep('verify');
    }
  }, [location.pathname, searchParams]);

  const handleRequestReset = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      addToast('Por favor, insira um e-mail válido', 'error');
      return;
    }

    setLoading(true);
    try {
      // 1. Verificar se o usuário existe na base
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, first_name, email')
        .eq('email', email)
        .is('deleted_at', null)
        .single();

      if (userError || !userData) {
        addToast('E-mail não encontrado em nossa base', 'error');
        setLoading(false);
        return;
      }

      // 2. Gerar token via RPC
      const { data: tokenData, error: rpcError } = await supabase
        .rpc('generate_password_reset_token', {
          p_user_email: email
        });

      if (rpcError) throw rpcError;

      if (!tokenData.success) {
        addToast(tokenData.message, 'error');
        return;
      }

      // 3. Enviar e-mail transacional
      await sendPasswordResetEmail({
        to: email,
        name: userData.first_name,
        resetToken: tokenData.token,
        resetLink: `${window.location.origin}/#/reset-password?token=${tokenData.token}&email=${encodeURIComponent(email)}`,
        expiresAt: new Date(tokenData.expires_at).toLocaleString('pt-BR')
      });

      setStep('verify');
      setMessage(`Enviamos um código para ${email}. O código expira em 1 hora.`);
      addToast('E-mail de recuperação enviado!', 'success');
      
    } catch (error: any) {
      addToast(error.message || 'Erro ao solicitar recuperação', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToken = async () => {
    if (!token || token.length < 6) {
      addToast('Token inválido. Verifique o código enviado.', 'error');
      return;
    }

    setLoading(true);
    try {
      const { data: validation, error } = await supabase
        .rpc('validate_password_reset_token', {
          p: token,
          p_user_email: email
        });

      if (error) throw error;

      if (!validation.valid) {
        addToast(validation.message, 'error');
        return;
      }

      setStep('reset');
      addToast('Token validado! Defina sua nova senha.', 'success');
    } catch (error: any) {
      addToast('Token inválido ou expirado', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      addToast('As senhas não coincidem', 'error');
      return;
    }

    if (newPassword.length < 8) {
      addToast('A senha deve ter pelo menos 8 caracteres', 'error');
      return;
    }

    setLoading(true);
    try {
      // No fluxo do Supabase Auth, se estivermos logados com o token de recuperação, usamos updateUser
      const { error: resetError } = await supabase.auth.updateUser({ 
        password: newPassword 
      });

      if (resetError) throw resetError;

      addToast('Senha redefinida com sucesso!', 'success');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      addToast(error.message || 'Erro ao redefinir senha', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-8">
            <Link to="/">
                <img src="https://i.ibb.co/9mt6zRFj/generated-image-removebg-preview.png" alt="FinanceAPP" className="h-16 w-auto" />
            </Link>
        </div>

        <Card className="rounded-[2.5rem] p-10 border-none shadow-2xl shadow-gray-200/50">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-50 rounded-[2rem] mb-6 text-primary-600">
                    <Lock size={36} />
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-3">
                    {step === 'request' && 'Recuperar Senha'}
                    {step === 'verify' && 'Verificar Código'}
                    {step === 'reset' && 'Nova Senha'}
                </h1>
                <p className="text-sm text-gray-500 font-medium px-4">
                    {step === 'request' && 'Digite seu e-mail para receber as instruções de recuperação.'}
                    {step === 'verify' && 'Insira o código enviado por e-mail para validar seu acesso.'}
                    {step === 'reset' && 'Crie uma nova senha forte para sua conta.'}
                </p>
            </div>

            {step === 'request' && (
                <div className="space-y-6 animate-fade-in-up">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail Cadastrado</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="seu@email.com"
                            />
                        </div>
                    </div>
                    <Button fullWidth size="lg" onClick={handleRequestReset} loading={loading} className="py-5 shadow-xl shadow-primary-500/20">
                        Enviar Código
                    </Button>
                    <button onClick={() => navigate('/login')} className="w-full text-center text-xs font-black text-gray-400 uppercase tracking-widest hover:text-primary-600 transition-colors flex items-center justify-center gap-2">
                        <ChevronLeft size={14} /> Voltar ao Login
                    </button>
                </div>
            )}

            {step === 'verify' && (
                <div className="space-y-6 animate-fade-in-up text-center">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Código de 6 Dígitos</label>
                        <input 
                            type="text"
                            value={token}
                            onChange={(e) => setToken(e.target.value.toUpperCase())}
                            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="******"
                            maxLength={64}
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setStep('request')} className="flex-1">Voltar</Button>
                        <Button onClick={handleVerifyToken} loading={loading} className="flex-[2]">Verificar</Button>
                    </div>
                    {message && <p className="text-xs text-gray-500">{message}</p>}
                </div>
            )}

            {step === 'reset' && (
                <div className="space-y-6 animate-fade-in-up">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nova Senha</label>
                            <input 
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="Mínimo 8 caracteres"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirmar Senha</label>
                            <input 
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="Repita a nova senha"
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100">
                        <div className="flex items-center gap-2 text-primary-700 font-black text-[10px] uppercase tracking-widest mb-2">
                            <ShieldCheck size={14} /> Dica de Segurança
                        </div>
                        <p className="text-[11px] text-primary-600 font-medium">Use pelo menos 8 caracteres com letras e números.</p>
                    </div>

                    <Button fullWidth size="lg" onClick={handleResetPassword} loading={loading} className="py-5 shadow-xl shadow-primary-500/20">
                        Alterar Senha
                    </Button>
                </div>
            )}
        </Card>
      </div>
    </div>
  );
};
