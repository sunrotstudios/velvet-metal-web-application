import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    display_name: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await register(formData.email, formData.password, formData.display_name);
      toast.success('Welcome to Velvet Metal!');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to create account');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-50" />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="p-6 flex justify-between items-center">
          <Button
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-white/10"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-xl tracking-tighter font-bold">
            VELVET<span className="text-gray-500">METAL</span>
          </div>
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
                className="text-6xl font-bold tracking-tighter mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Create Your<br />Account
              </motion.h1>
              <motion.p
                className="text-gray-400 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Start managing your music library
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
                    type="text"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleChange}
                    placeholder="Display Name"
                    required
                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-white/20 focus:ring-white/20"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-white/20 focus:ring-white/20"
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
                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-white/20 focus:ring-white/20"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    required
                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-white/20 focus:ring-white/20"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-white hover:bg-gray-100 text-black font-medium text-lg relative overflow-hidden group"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span>Create Account</span>
                )}
              </Button>

              <div className="text-center">
                <p className="text-gray-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-white hover:underline focus:outline-none"
                  >
                    Sign in
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
