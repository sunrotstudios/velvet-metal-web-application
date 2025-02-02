import type { AuthUser } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, display_name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user as AuthUser);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user as AuthUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Get user profile after login
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profileError) throw profileError;

      // Update user metadata
      if (profile) {
        await supabase.auth.updateUser({
          data: {
            display_name: profile.display_name,
            avatar: profile.avatar_url,
          },
        });
      }

      navigate('/home');
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, display_name: string) => {
    try {
      // Sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Wait for Supabase's auth trigger to create the profile
      if (signUpData.user) {
        // Wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update the profile with additional data
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            display_name,
            email,
          })
          .eq('id', signUpData.user.id);

        if (profileError) {
          throw profileError;
        }

        setUser(signUpData.user);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any local storage items
      localStorage.removeItem('velvet-metal-auth');
      
      navigate('/');
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
