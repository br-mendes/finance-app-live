
import { PlanType } from './types';

export const APP_NAME = 'FinanceAPP';

// Supabase Configuration
// Prioritize Environment Variables (Vercel) -> Fallback to Hardcoded (Local/Demo)
export const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'https://rfbupauusvlcvnxtphhx.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_MAQmI9q0ukW976lWKo1MWQ_Tz459gnA';

// Special Users
export const ADMIN_EMAIL = 'financeappbr@gmail.com';
export const PERMANENT_PREMIUM_EMAIL = 'brunoafonso.mendes@gmail.com';

// Mock Data for Initial Setup (Simulating DB responses)
export const MOCK_USER = {
  id: 'user-123',
  email: 'usuario@exemplo.com',
  first_name: 'Bruno',
  last_name: 'Mendes',
  cpf: '000.000.000-00', // Added required field
  plan: PlanType.FREE,
  is_admin: false,
  avatar_url: 'https://i.pravatar.cc/150?img=11'
};

export const CATEGORIES = [
  { name: 'Água', icon: '💧' },
  { name: 'Aluguel', icon: '🍽️' },
  { name: 'Assinaturas', icon: '🧾' },
  { name: 'Compras online', icon: '🛒' },
  { name: 'Condomínio', icon: '🏢' },
  { name: 'Delivery', icon: '🍔' },
  { name: 'Educação', icon: '📚' },
  { name: 'Energia elétrica', icon: '💡' },
  { name: 'Emergências', icon: '🆘' },
  { name: 'Fatura cartão', icon: '💳' },
  { name: 'Jogos / Entret.', icon: '🎮' },
  { name: 'Internet / Tel', icon: '📶' },
  { name: 'Metas', icon: '🎯' },
  { name: 'Música', icon: '🎵' },
  { name: 'Outros créditos', icon: '💸' },
  { name: 'Pets', icon: '🐾' },
  { name: 'Presentes', icon: '🎉' },
  { name: 'Restaurantes', icon: '🍽️' },
  { name: 'Roupas', icon: '👕' },
  { name: 'Salário', icon: '💰' },
  { name: 'Saúde', icon: '💊' },
  { name: 'Streaming', icon: '🎬' },
  { name: 'Transporte', icon: '🚗' },
  { name: 'Trabalho / Cursos', icon: '💼' },
  { name: 'Viagem / Lazer', icon: '🌴' },
];