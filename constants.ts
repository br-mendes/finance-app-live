
import { PlanType } from './types';

export const APP_NAME = 'FinanceApp';

// Supabase Configuration
export const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://rfbupauusvlcvnxtphhx.supabase.co';
export const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_MAQmI9q0ukW976lWKo1MWQ_Tz459gnA';

// PayPal Configuration (apenas o client id, que é público; o secret vive
// somente nos endpoints serverless em api/)
export const PAYPAL_CLIENT_ID = process.env.VITE_PAYPAL_CLIENT_ID || 'ASWKvSJFWVfA6Ozq0fEHh-IOxASMglLgDCEQohznbJrtwUwVbfpIiQLiTyuQy9d8w0TjT-2wn-W_qNKR';

// Special Users
export const ADMIN_EMAIL = 'financeappbr@gmail.com';
export const PERMANENT_PREMIUM_EMAIL = 'brunoafonso.mendes@gmail.com';

// Mock Data for Initial Setup
export const MOCK_USER = {
  id: 'user-123',
  email: 'usuario@exemplo.com',
  first_name: 'Bruno',
  last_name: 'Mendes',
  cpf: '000.000.000-00',
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
