import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { User, PlanType } from '../types';
import { paymentService } from '../services/paymentService';
import { useAvatar } from '../hooks/useAvatar';
import { ADMIN_EMAIL } from '../constants';
import { 
    User as UserIcon, Shield, CreditCard, AlertTriangle, Save, 
    Eye, EyeOff, Crown, Star, Camera, Loader2
} from 'lucide-react';

interface SettingsProps {
    onUpdateUser: (user: User) => void;
    onLogout: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onUpdateUser, onLogout }) => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [user, setUser] = useState<User | null>(null);

    // Form State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [address, setAddress] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);

    // Avatar Hook
    const { avatarUrl, uploadAvatar, isUploading } = useAvatar(user?.id);

    // Modals
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isDeleteDataModalOpen, setIsDeleteDataModalOpen] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('financeapp_user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setFirstName(parsedUser.first_name || '');
            setLastName(parsedUser.last_name || '');
            setAddress(typeof parsedUser.address === 'string' ? parsedUser.address : '');
        }
    }, []);

    if (!user) return null;

    const isPremium = user.plan === PlanType.PREMIUM;
    const isAdmin = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        try {
            const newUrl = await uploadAvatar(file);
            if (newUrl) {
                const updated = { ...user, avatar_url: newUrl };
                onUpdateUser(updated);
                addToast("Avatar atualizado!", "success");
            }
        } catch (error) {
            addToast("Falha no upload da imagem.", "error");
        }
    };

    const handleSaveProfile = async () => {
        setSaveLoading(true);
        try {
            const updatedUser: User = {
                ...user,
                first_name: firstName,
                last_name: lastName,
                address: address,
                updated_at: new Date().toISOString()
            };

            // Em app real: call supabase.from('users').update(...)
            localStorage.setItem('financeapp_user', JSON.stringify(updatedUser));
            onUpdateUser(updatedUser);
            setUser(updatedUser);
            addToast("Perfil atualizado com sucesso!", "success");
        } finally {
            setSaveLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-12">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Configurações</h1>
                    <p className="text-sm text-gray-500">Gerencie sua identidade e assinatura</p>
                </div>
            </div>

            {/* Perfil */}
            <Card className="rounded-[2.5rem] p-10 border-none shadow-xl shadow-gray-200/50 dark:bg-gray-800 dark:shadow-none">
                <div className="flex items-center gap-3 mb-10 pb-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-primary-600">
                        <UserIcon size={20} />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Dados Pessoais</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    {/* Avatar Upload */}
                    <div className="md:col-span-4 flex flex-col items-center gap-6">
                        <div className="relative group">
                            <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-gray-700 shadow-2xl relative">
                                {isUploading ? (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                                        <Loader2 className="animate-spin text-white" size={32} />
                                    </div>
                                ) : null}
                                <img 
                                    src={avatarUrl || `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=0ea5e9&color=fff`} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                />
                            </div>
                            <label className="absolute -bottom-2 -right-2 bg-primary-600 text-white p-3 rounded-2xl cursor-pointer hover:bg-primary-700 shadow-xl transition-all hover:scale-110 border-4 border-white dark:border-gray-800">
                                <Camera size={20} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
                            </label>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Foto de Perfil</p>
                            <p className="text-[9px] text-gray-500 mt-1">JPG ou PNG até 2MB</p>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="md:col-span-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Nome" value={firstName} onChange={setFirstName} />
                            <Input label="Sobrenome" value={lastName} onChange={setLastName} />
                        </div>
                        <Input label="Endereço Completo" value={address} onChange={setAddress} placeholder="Rua, Número, Cidade - UF" />
                        
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email Principal</label>
                            <input 
                                type="email" 
                                value={user.email} 
                                disabled 
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-4 text-sm text-gray-400 cursor-not-allowed" 
                            />
                        </div>

                        <div className="pt-6">
                            <Button fullWidth onClick={handleSaveProfile} loading={saveLoading} size="lg" className="rounded-2xl shadow-lg shadow-primary-500/20 py-5">
                                <Save size={18} className="mr-2" /> Salvar Alterações
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Assinatura */}
            <Card className="rounded-[2.5rem] p-10 border-none shadow-xl shadow-gray-200/50 dark:bg-gray-800">
                <div className="flex items-center gap-3 mb-8">
                    <CreditCard size={20} className="text-primary-600" />
                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Assinatura</h2>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isPremium ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                            {isPremium ? <Crown size={32} /> : <UserIcon size={32} />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-black text-gray-900 dark:text-white">{isPremium ? 'PREMIUM' : 'FREE'}</span>
                                {isPremium && <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-md font-black uppercase tracking-widest">PRO</span>}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{isPremium ? 'Acesso ilimitado à inteligência financeira.' : 'Recursos básicos habilitados.'}</p>
                        </div>
                    </div>
                    {isPremium ? (
                        <Button variant="outline" className="text-red-500 border-red-100 hover:bg-red-50" onClick={() => setIsCancelModalOpen(true)}>
                            Cancelar Plano
                        </Button>
                    ) : (
                        <Button onClick={() => navigate('/plans')} className="bg-gradient-to-r from-amber-500 to-yellow-600 border-none shadow-lg shadow-amber-500/20">
                            Fazer Upgrade
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
};

const Input = ({ label, value, onChange, placeholder, type = 'text' }: any) => (
    <div>
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
        <input 
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all dark:text-white" 
        />
    </div>
);