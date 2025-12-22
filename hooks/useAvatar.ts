import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { updateUserAvatar } from '../services/supabase/profile';

export const useAvatar = (userId: string | undefined) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const loadAvatar = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('users')
      .select('avatar_url')
      .eq('id', userId)
      .single();
    
    setAvatarUrl(data?.avatar_url || null);
  };
  
  const uploadAvatar = async (file: File) => {
    if (!userId) return;
    setIsUploading(true);
    try {
      const url = await updateUserAvatar(userId, file);
      setAvatarUrl(url);
      return url;
    } finally {
      setIsUploading(false);
    }
  };
  
  useEffect(() => {
    if (userId) loadAvatar();
  }, [userId]);
  
  return { avatarUrl, uploadAvatar, loadAvatar, isUploading };
};