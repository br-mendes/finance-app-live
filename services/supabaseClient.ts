import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'FinanceApp'
    }
  }
});

// Helper para logar ações do usuário
export const logAction = async (
  userId: string, 
  action: string, 
  metadata?: Record<string, any>
) => {
  try {
    const ip = await getClientIP();
    await supabase.from('user_logs').insert({
      user_id: userId,
      action,
      ip_address: ip,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  } catch (error) {
    console.error('Failed to log action:', error);
  }
};

// Função auxiliar para obter IP
const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
};

export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) throw error;
    return true;
  } catch (error) {
    return false;
  }
};