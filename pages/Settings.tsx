import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { User, PlanType } from '../types';
import { paymentService } from '../services/paymentService';
import { ADMIN_EMAIL, PERMANENT_PREMIUM_EMAIL } from '../constants';
import { 
    User as UserIcon, Shield, CreditCard, AlertTriangle, Save, 
    Upload, Eye, EyeOff, Check, X, Smartphone, BarChart3, Newspaper, 
    Download, Crown, Star, Camera
} from 'lucide-react';

interface SettingsProps {
    onUpdateUser: (user: User) => void;
    onLogout: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onUpdateUser, onLogout }) => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [user, setUser] = useState<User | null>(null);

    // --- Profile Form State ---
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [address, setAddress] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);

    // --- Danger Zone State ---
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isDeleteDataModalOpen, setIsDeleteDataModalOpen] = useState(false);
    const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isProcessingUpgrade, setIsProcessingUpgrade] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('financeapp_user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setFirstName(parsedUser.first_name || '');
            setLastName(parsedUser.last_name || '');
            setAddress(parsedUser.address || '');
            setAvatarPreview(parsedUser.avatar_url || '');
        }
    }, []);

    if (!user) return null;

    const isPremium = user.plan === PlanType.PREMIUM;
    const isAdmin = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const isPermanent = user.is_permanent_premium;
    
    // Protected account check for Account Deletion (Admin and Permanent cannot delete account)
    const isProtectedAccount = isAdmin || isPermanent;

    // --- Image Handling ---
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            addToast("A imagem deve ter no máximo 5MB.", "error");
            return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            addToast("Formato inválido. Use JPG, PNG ou WebP.", "error");
            return;
        }

        const reader = new FileReader();
        reader.onload = (readerEvent) => {
            const image = new Image();
            image.onload = () => {
                // Resize logic for square 1:1
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const size = Math.min(image.width, image.height);
                canvas.width = 300;
                canvas.height = 300;
                if (ctx) {
                    ctx.drawImage(image, (image.width - size) / 2, (image.height - size) / 2, size, size, 0, 0, 300, 300);
                    const resizedDataUrl = canvas.toDataURL(file.type);
                    setAvatarPreview(resizedDataUrl);
                }
            };
            if (readerEvent.target?.result) {
                image.src = readerEvent.target.result as string;
            }
        };
        reader.readAsDataURL(file);
    };

    // --- Profile Save ---
    const handleSaveProfile = () => {
        // Password Validation
        if (password) {
            const hasUpperCase = /[A-Z]/.test(password);
            const hasNumber = /[0-9]/.test(password);
            if (password.length < 8 || !hasUpperCase || !hasNumber) {
                setPasswordError("A senha deve ter min. 8 caracteres, 1 maiúscula e 1 número.");
                return;
            }
        }
        setPasswordError('');

        const updatedUser = {
            ...user,
            first_name: firstName,
            last_name: lastName,
            address: address,
            avatar_url: avatarPreview,
        };

        localStorage.setItem('financeapp_user', JSON.stringify(updatedUser));
        onUpdateUser(updatedUser);
        setUser(updatedUser);
        
        setSaveSuccess(true);
        addToast("Perfil atualizado com sucesso!", "success");
        setTimeout(() => setSaveSuccess(false), 3000);
        setPassword(''); 
    };

    // --- Subscription Actions ---
    const handleUpgrade = async () => {
        setIsProcessingUpgrade(true);
        try {
            const response = await paymentService.createCheckoutSession(user);
            window.location.hash = response.init_point.replace('#/', '');
        } catch (error) {
            console.error("Erro ao criar checkout:", error);
            addToast("Erro ao iniciar pagamento. Tente novamente.", "error");
        } finally {
            setIsProcessingUpgrade(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!user) return;
        try {
            await paymentService.cancelSubscription(user.id);
            addToast("Sua assinatura foi cancelada.", "info");
            navigate('/cancellation-success');
        } catch (error) {
            addToast('Erro ao cancelar assinatura. Tente novamente.', 'error');
        }
    };

    // --- Danger Zone Actions ---
    const handleDeleteData = () => {
        if (!confirmPassword) {
            addToast("Digite sua senha para confirmar.", "warning");
            return;
        }
        localStorage.removeItem('financeapp_transactions');
        localStorage.removeItem('financeapp_accounts');
        localStorage.removeItem('financeapp_cards');
        localStorage.removeItem('financeapp_goals');
        localStorage.removeItem('financeapp_radar_news');
        
        addToast("Todos os dados financeiros foram excluídos.", "info");
        setIsDeleteDataModalOpen(false);
        setConfirmPassword('');
        setTimeout(() => window.location.reload(), 1000);
    };

    const handleDeleteAccount = () => {
         if (!confirmPassword) {
            addToast("Digite sua senha para confirmar.", "warning");
            return;
        }
        // Wipe everything
        localStorage.clear();
        addToast("Sua conta foi excluída com sucesso.", "info");
        setTimeout(() => {
            onLogout();
            navigate('/login');
        }, 500);
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-12">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
                <p className="text-sm text-gray-500">Gerencie seu perfil e assinatura</p>
            </div>

            {/* --- SEÇÃO 1: PERFIL --- */}
            <Card>
                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                    <UserIcon size={20} className="text-primary-600" />
                    <h2 className="text-lg font-bold text-gray-900">Edição de Perfil</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative group">
                            <img 
                                src={avatarPreview || `https://ui-avatars.com/api/?name=${firstName}+${lastName}`} 
                                alt="Profile" 
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md bg-gray-100 aspect-square"
                            />
                            <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 shadow-sm transition-transform hover:scale-110">
                                <Camera size={16} />
                                <input type="file" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handleImageUpload} />
                            </label>
                        </div>
                        <span className="text-xs text-gray-500 text-center">
                            JPG, PNG ou WebP<br/>Max 5MB (1:1 format)
                        </span>
                    </div>

                    {/* Fields */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nome</label>
                                <input 
                                    type="text" 
                                    value={firstName} 
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Sobrenome</label>
                                <input 
                                    type="text" 
                                    value={lastName} 
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2" 
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                             <input 
                                type="text" 
                                value={user.email} 
                                disabled={isAdmin}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2 ${isAdmin ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`} 
                            />
                            {isAdmin && <p className="text-xs text-amber-600 mt-1">O email do administrador não pode ser alterado.</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Endereço</label>
                            <input 
                                type="text" 
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2" 
                                placeholder="Seu endereço completo" 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
                            <div className="relative mt-1">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border p-2 ${passwordError ? 'border-red-300' : 'border-gray-300'}`}
                                    placeholder="Deixe em branco para manter a atual" 
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {passwordError && <p className="text-xs text-red-500 mt-1">{passwordError}</p>}
                            <p className="text-xs text-gray-500 mt-1">Min. 8 caracteres, 1 maiúscula, 1 número.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <Button onClick={handleSaveProfile}>
                        <Save size={18} className="mr-2" />
                        Salvar Alterações
                    </Button>
                </div>
            </Card>

            {/* --- SEÇÃO 2: ASSINATURA --- */}
            <Card>
                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                    <CreditCard size={20} className="text-primary-600" />
                    <h2 className="text-lg font-bold text-gray-900">Gestão de Assinatura</h2>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                        <div>
                            <p className="text-sm text-gray-500 uppercase font-semibold">Plano Atual</p>
                            <div className="flex items-center gap-2 mt-1">
                                {isPremium ? (
                                    <>
                                        <span className="text-3xl font-bold text-primary-900">PREMIUM</span>
                                        <span className="bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold flex items-center">
                                            <Crown size={12} className="mr-1" /> PRO
                                        </span>
                                        {isPermanent && (
                                            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-bold flex items-center">
                                                <Star size={12} className="mr-1" /> VITALÍCIO
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <span className="text-3xl font-bold text-gray-700">FREE</span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                {isPermanent 
                                    ? "Assinatura Permanente - Sem data de expiração" 
                                    : isPremium 
                                        ? "Renovação automática mensal" 
                                        : "Acesso limitado aos recursos básicos"}
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0 text-right">
                            <span className="block text-2xl font-bold text-gray-900">
                                {isPremium ? "R$ 19,90" : "R$ 0,00"}
                                <span className="text-sm font-normal text-gray-500">{isPermanent ? "/único" : "/mês"}</span>
                            </span>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                        {isPremium ? (
                            isPermanent ? (
                                <div className="text-purple-600 font-bold flex items-center bg-purple-50 px-4 py-2 rounded-lg border border-purple-100">
                                    🎉 Você é usuário Premium permanente!
                                </div>
                            ) : (
                                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300" onClick={() => setIsCancelModalOpen(true)}>
                                    Cancelar Assinatura
                                </Button>
                            )
                        ) : (
                            <Button 
                                className="bg-gradient-to-r from-primary-600 to-primary-800 border-none shadow-lg hover:shadow-xl w-full sm:w-auto" 
                                onClick={handleUpgrade}
                                loading={isProcessingUpgrade}
                            >
                                <Crown size={18} className="mr-2" />
                                Fazer Upgrade para Premium
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            {/* --- SEÇÃO 3: DANGER ZONE --- */}
            <Card className="border-red-100 bg-red-50/30">
                <div className="flex items-center gap-2 mb-6 border-b border-red-100 pb-4">
                    <AlertTriangle size={20} className="text-red-600" />
                    <h2 className="text-lg font-bold text-red-600">Zona de Perigo</h2>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-100">
                        <div>
                            <h4 className="text-sm font-bold text-gray-900">Deletar todos os dados</h4>
                            <p className="text-sm text-gray-500">Remove transações, contas e metas.</p>
                        </div>
                        {isAdmin ? (
                            <div className="ml-4 px-3 py-2 bg-gray-100 text-gray-500 text-xs rounded border border-gray-200 cursor-not-allowed">
                                Desabilitado (Admin)
                            </div>
                        ) : (
                            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 ml-4" onClick={() => setIsDeleteDataModalOpen(true)}>
                                Deletar Dados
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-100">
                         <div>
                            <h4 className="text-sm font-bold text-gray-900">Excluir Conta Definitivamente</h4>
                            <p className="text-sm text-gray-500">Ação irreversível.</p>
                        </div>
                         {isProtectedAccount ? (
                            <div className="ml-4 px-3 py-2 bg-gray-100 text-gray-500 text-xs rounded border border-gray-200 cursor-not-allowed">
                                Desabilitado
                            </div>
                        ) : (
                            <Button variant="danger" className="ml-4" onClick={() => setIsDeleteAccountModalOpen(true)}>
                                Excluir Minha Conta
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            {/* MODALS */}
            <Modal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                title="Cancelar Assinatura?"
                footer={
                    <>
                        <Button variant="danger" onClick={handleCancelSubscription}>Confirmar</Button>
                        <Button variant="secondary" onClick={() => setIsCancelModalOpen(false)} className="mr-3">Voltar</Button>
                    </>
                }
            >
                <p className="text-gray-600">Tem certeza que deseja cancelar? Você perderá os recursos PRO.</p>
            </Modal>

            <Modal
                isOpen={isDeleteDataModalOpen}
                onClose={() => setIsDeleteDataModalOpen(false)}
                title="Deletar Todos os Dados"
                footer={
                    <>
                        <Button variant="danger" onClick={handleDeleteData}>Deletar Tudo</Button>
                        <Button variant="secondary" onClick={() => setIsDeleteDataModalOpen(false)} className="mr-3">Cancelar</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">Digite sua senha para confirmar a limpeza dos dados.</p>
                    <input 
                        type="password" 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
            </Modal>

             <Modal
                isOpen={isDeleteAccountModalOpen}
                onClose={() => setIsDeleteAccountModalOpen(false)}
                title="Excluir Conta"
                footer={
                    <>
                        <Button variant="danger" onClick={handleDeleteAccount}>Excluir Agora</Button>
                        <Button variant="secondary" onClick={() => setIsDeleteAccountModalOpen(false)} className="mr-3">Cancelar</Button>
                    </>
                }
            >
                <div className="space-y-4">
                     <div className="bg-red-50 p-4 rounded border border-red-200 text-red-800 text-sm font-bold">ATENÇÃO: Sua conta e todos os dados serão apagados permanentemente.</div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Digite sua senha para confirmar</label>
                        <input 
                            type="password" 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

const FeatureItem = ({ text, active, premium }: { text: string, active: boolean, premium?: boolean }) => (
    <div className={`flex items-center gap-2 text-sm ${active ? 'text-gray-700' : 'text-gray-400'}`}>
        {active ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-gray-400" />}
        <span className={premium && !active ? 'line-through' : ''}>{text}</span>
        {premium && <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 rounded font-bold">PRO</span>}
    </div>
);