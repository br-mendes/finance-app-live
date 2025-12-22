import { supabase } from '../supabaseClient';

export const updateUserAvatar = async (userId: string, file: File) => {
  try {
    // 1. Upload para Storage do Supabase (Bucket 'avatars')
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) throw uploadError;
    
    // 2. Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    // 3. Atualizar no banco de dados
    const { error: dbError } = await supabase
      .from('users')
      .update({ 
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (dbError) throw dbError;
    
    return publicUrl;
    
  } catch (error) {
    console.error('Error updating avatar:', error);
    throw error;
  }
};