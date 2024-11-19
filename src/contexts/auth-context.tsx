import { createContext, useContext, useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import type { AuthModel } from '@/lib/pocketbase';

interface AuthContextType {
  user: AuthModel | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(pb.authStore.model as AuthModel | null);
    setLoading(false);

    pb.authStore.onChange(() => {
      console.log('AuthProvider: Auth state changed');

      setUser(pb.authStore.model as AuthModel | null);
    });
  }, []);

  const login = async (email: string, password: string) => {
    console.log('AuthProvider: Attempting login');

    await pb.collection('users').authWithPassword(email, password);
    console.log('AuthProvider: Login successful');
  };

  const register = async (email: string, password: string, name: string) => {
    console.log('AuthProvider: Attempting registration');

    await pb.collection('users').create({
      email,
      password,
      passwordConfirm: password,
      name,
    });
    console.log('AuthProvider: Registration successful, logging in');

    await login(email, password);
  };

  const logout = () => {
    console.log('AuthProvider: Logging out');

    pb.authStore.clear();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
