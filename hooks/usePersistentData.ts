
import { supabase } from '../services/supabaseClient';
import { useAuth } from './useAuth';

export const usePersistentData = () => {
  const { user } = useAuth();
  
  const loadUserData = async () => {
    // Adicionado 'cards' ao retorno padrão para evitar erros de propriedade inexistente
    if (!user?.id) return { accounts: [], transactions: [], goals: [], cards: [] };
    
    // Carregar tudo do banco de dados respeitando o soft-delete
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

      // Busca os cartões de crédito do usuário que não foram excluídos
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
  
  // Configurar real-time subscriptions para atualizações automáticas em toda a aplicação
  const setupRealtimeSubscriptions = (onUpdate: (payload: any) => void) => {
    if (!user?.id) return () => {};
    
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('Real-time sync:', payload.table, payload.eventType);
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
