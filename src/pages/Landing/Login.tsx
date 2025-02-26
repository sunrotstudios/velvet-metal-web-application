import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const TRANSLATIONS = [
    "Velvet Metal", // English
    "벨벳 메탈", // Korean
    "ベルベットメタル", // Japanese
    "絲絨金屬", // Chinese (Traditional)
    "Métal Velours", // French
    "Бархатный металл", // Russian
    "Metallo Velluto", // Italian
    "Terciopelo Metálico", // Spanish
    "Samt Metall", // German
    "معدن المخمل", // Arabic
    "Fluwelen Metaal", // Dutch
    "Aksamitowy Metal", // Polish
    "Sammet Metall", // Swedish
    "Металевий оксамит", // Ukrainian
    "Kadife Metal", // Turkish
  ];

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
    <div className="min-h-[100dvh] w-full bg-[#F5F0E8] relative overflow-hidden">
      {/* Background Design Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-300 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-yellow-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10 min-h-[100dvh] flex flex-col">
        {/* Marquee Navigation */}
        <div className="sticky top-0 z-50 bg-black py-4 border-b-4 border-black overflow-hidden">
          <div className="flex whitespace-nowrap">
            <div className="animate-marquee flex items-center">
              {TRANSLATIONS.map((text, i) => (
                <span key={i} className="text-2xl font-black text-white px-8">
                  {text}
                </span>
              ))}
            </div>
            <div
              className="animate-marquee flex items-center"
              aria-hidden="true"
            >
              {TRANSLATIONS.map((text, i) => (
                <span key={i} className="text-2xl font-black text-white px-8">
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Main Content */}
        <main className="hidden md:flex flex-1 items-center justify-center px-8 pt-16">
          <div className="w-full max-w-[1000px] mx-auto grid grid-cols-[1fr_1.5fr] gap-24 items-center">
            {/* Left Side - Title and Description */}
            <div className="space-y-12">
              <div className="space-y-4">
                <motion.h1
                  className="text-6xl lg:text-7xl font-black tracking-tight whitespace-nowrap"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Welcome Back
                </motion.h1>
                <motion.p
                  className="text-xl text-black/70 text-center underline"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  it's good to see you again
                </motion.p>
              </div>

            </div>

            {/* Right Side - Login Form - Desktop */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center"
            >
              <motion.div
                className={cn(
                  "w-full max-w-[600px] bg-white",
                  "rounded-xl sm:rounded-[32px] border-2 sm:border-4 border-black",
                  "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
                  "p-3 sm:p-6 md:p-8"
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <form onSubmit={handleSubmit} className="hidden md:block space-y-6">
                  <div className="space-y-4">
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={cn(
                        "h-14 bg-white text-lg",
                        "border-4 border-black rounded-xl",
                        "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                        "hover:translate-x-[-2px] hover:translate-y-[-2px]",
                        "focus:translate-x-[-2px] focus:translate-y-[-2px]",
                        "transition-all placeholder:text-black/50"
                      )}
                    />
                    <Input
                      name="password"
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className={cn(
                        "h-14 bg-white text-lg",
                        "border-4 border-black rounded-xl",
                        "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                        "hover:translate-x-[-2px] hover:translate-y-[-2px]",
                        "focus:translate-x-[-2px] focus:translate-y-[-2px]",
                        "transition-all placeholder:text-black/50"
                      )}
                    />
                  </div>

                  {/* Desktop Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className={cn(
                      "w-full h-14 bg-yellow-300 text-xl font-bold",
                      "border-4 border-black rounded-xl",
                      "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                      "hover:translate-x-[-2px] hover:translate-y-[-2px]",
                      "active:shadow-none active:translate-x-0 active:translate-y-0",
                      "transition-all"
                    )}
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Sign In"}
                  </Button>

                  {/* Desktop Sign Up Link */}
                  <div className="text-center">
                    <p className="text-lg">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/register")}
                        className="font-bold hover:underline"
                      >
                        Create one
                      </button>
                    </p>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </div>
        </main>

        {/* Mobile Main Content */}
        <main className="md:hidden flex flex-col min-h-[calc(100dvh-3.5rem)] overflow-auto">
          <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full px-4">
            {/* Mobile Header */}
            <div className="w-full mb-8">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-6">
                  <div
                    className={cn(
                      "flex items-center justify-center",
                      "w-20 h-20 border-4 border-black rounded-2xl",
                      "font-black text-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
                      "bg-yellow-300"
                    )}
                  >
                    🪵
                  </div>
                  <div>
                    <h2 className="font-black text-3xl uppercase leading-tight">
                      Welcome Back
                    </h2>
                    <p className="text-base text-black/70 mt-1">
                      it's good to see you again
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Form Container */}
            <div className="w-full">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                <div className={cn(
                  "w-full bg-white",
                  "rounded-xl border-3 border-black",
                  "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                  "p-4"
                )}>
                  <form onSubmit={handleSubmit} className="md:hidden space-y-4">
                    <div className="space-y-3">
                      <Input
                        name="email"
                        type="email"
                        placeholder="EMAIL"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={cn(
                          "h-10 bg-white text-sm",
                          "border-3 border-black rounded-lg",
                          "shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
                          "placeholder:text-black/60 px-2",
                          "font-bold"
                        )}
                      />
                      <Input
                        name="password"
                        type="password"
                        placeholder="PASSWORD"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className={cn(
                          "h-10 bg-white text-sm",
                          "border-3 border-black rounded-lg",
                          "shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
                          "placeholder:text-black/60 px-2",
                          "font-bold"
                        )}
                      />
                    </div>

                    {/* Mobile Submit Button */}
                    <Button
                      type="submit"
                      disabled={loading}
                      className={cn(
                        "w-full h-11 bg-yellow-400 text-black text-base font-black",
                        "border-3 border-black rounded-lg",
                        "shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
                        "transition-all"
                      )}
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "SIGN IN"}
                    </Button>

                    {/* Mobile Sign Up Link */}
                    <div className="text-center">
                      <p className="text-sm">
                        Don't have an account?{" "}
                        <button
                          type="button"
                          onClick={() => navigate("/register")}
                          className="font-bold hover:underline"
                        >
                          Create one
                        </button>
                      </p>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
