import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
  updated_at: string;
}

export const useFolders = () => {
  const { user } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(false);

  // Load folders
  const loadFolders = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setFolders(data);
    }
    setLoading(false);
  };

  // Create new folder
  const createFolder = async (name: string, description?: string, color?: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('folders')
      .insert([
        {
          user_id: user.id,
          name,
          description: description || null,
          color: color || '#3b82f6',
        },
      ])
      .select()
      .single();

    if (!error && data) {
      await loadFolders();
      toast.success('Dossier créé avec succès');
      return data;
    } else {
      toast.error('Erreur lors de la création du dossier');
    }
    return null;
  };

  // Update folder
  const updateFolder = async (id: string, updates: Partial<Folder>) => {
    const { error } = await supabase
      .from('folders')
      .update(updates)
      .eq('id', id);

    if (!error) {
      await loadFolders();
      toast.success('Dossier mis à jour');
    } else {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Delete folder
  const deleteFolder = async (id: string) => {
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id);

    if (!error) {
      await loadFolders();
      toast.success('Dossier supprimé');
    } else {
      toast.error('Erreur lors de la suppression');
    }
  };

  useEffect(() => {
    if (user) {
      loadFolders();
    }
  }, [user]);

  return {
    folders,
    loading,
    createFolder,
    updateFolder,
    deleteFolder,
    loadFolders,
  };
};
