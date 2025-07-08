import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const signInAnonymously = async () => {
    // For demo purposes, create a temporary user identifier
    const tempUser = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: `demo_${Date.now()}@example.com`,
      created_at: new Date().toISOString(),
    } as User;
    
    setUser(tempUser);
    localStorage.setItem('temp_user', JSON.stringify(tempUser));
    return { data: { user: tempUser }, error: null };
  };

  return {
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    signInAnonymously,
    isAuthenticated: !!user,
    isTemporary: user?.email?.startsWith('demo_') || false,
  };
};