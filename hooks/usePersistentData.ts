
import { supabase } from '../services/supabaseClient';
import { useAuth } from './useAuth';

export const usePersistentData = () => {
  const { user } = useAuth();
  
  const loadUserData = async () => {
    if (!user?.id) return { accounts: [], transactions: [], goals: [], cards: [] };
    
    // Carregar tudo do banco de dados respeitando o soft-delete (.is('deleted_at', null))
    const [accounts, transactions, goals, cards] = await Promise.all([
      supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false }),
      
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('date', { ascending: false })
        .limit(100),
      
      supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false }),

      supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
    ]);
    
    return {
      accounts: accounts.data || [],
      transactions: transactions.data || [],
      goals: goals.data || [],
      cards: cards.data || []
    };
  };
  
  // Configurar real-time subscriptions para atualizações automáticas (Broadcast)
  const setupRealtimeSubscriptions = (onUpdate: (payload: any) => void) => {
    if (!user?.id) return () => {};
    
    const channel = supabase
      .channel('finance-realtime')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.debug('DB Change Received:', payload.table, payload.eventType);
          onUpdate(payload);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  };
  
  return { loadUserData, setupRealtimeSubscriptions };
};
