import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to sign in');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-bg dark:bg-darkBg">
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="p-6">
          <h1 className="text-xl font-semibold text-text dark:text-darkText">
            Velvet Metal
          </h1>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <motion.div
            className="w-full max-w-md space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="text-center">
              <motion.h1
                className="text-6xl font-bold tracking-tighter mb-2 text-text dark:text-darkText"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Welcome
                <br />
                Back
              </motion.h1>
              <motion.p
                className="text-lg text-text/60 dark:text-darkText/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Sign in to continue your journey
              </motion.p>
            </div>

            {/* Form */}
            <motion.form
              className="space-y-6 mt-8"
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="space-y-4">
                <div>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                    className="h-12 bg-transparent border-2 border-text dark:border-darkText text-text dark:text-darkText placeholder:text-text/50 dark:placeholder:text-darkText/50 shadow-light dark:shadow-dark hover:translate-x-boxShadowX hover:translate-y-boxShadowY focus:translate-x-boxShadowX focus:translate-y-boxShadowY transition-transform"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    className="h-12 bg-transparent border-2 border-text dark:border-darkText text-text dark:text-darkText placeholder:text-text/50 dark:placeholder:text-darkText/50 shadow-light dark:shadow-dark hover:translate-x-boxShadowX hover:translate-y-boxShadowY focus:translate-x-boxShadowX focus:translate-y-boxShadowY transition-transform"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-main text-text hover:bg-opacity-90 text-lg px-12 py-6 font-medium shadow-light dark:shadow-dark hover:translate-x-boxShadowX hover:translate-y-boxShadowY active:translate-x-0 active:translate-y-0 transition-transform"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span>Sign In</span>
                )}
              </Button>

              <div className="text-center">
                <p className="text-text/60 dark:text-darkText/60">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="text-text dark:text-darkText hover:underline focus:outline-none"
                  >
                    Create one
                  </button>
                </p>
              </div>
            </motion.form>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
