"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: 'student' | 'admin' | 'superadmin';
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function getUserAndProfile() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          if (mounted) {
            setUser(null);
            setProfile(null);
            setIsLoading(false);
          }
          return;
        }

        const currentUser = session.user;
        if (mounted) setUser(currentUser);

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else if (mounted) {
          setProfile(profileData as Profile);
        }
      } catch (error) {
        console.error("Unexpected error in useAuth:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    getUserAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          if (mounted) setUser(session.user);
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (mounted) setProfile(profileData as Profile);
        } else {
          if (mounted) {
            setUser(null);
            setProfile(null);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (!error && profileData) {
      setProfile(profileData as Profile);
    }
  };

  return {
    user,
    profile,
    isLoading,
    refreshProfile,
    isAdmin: profile?.role === 'admin' || profile?.role === 'superadmin',
    isSuperAdmin: profile?.role === 'superadmin',
  };
}
