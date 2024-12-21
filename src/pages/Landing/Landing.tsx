import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import { MobileLanding } from '@/pages/Landing/MobileLanding';
import { ResponsiveContainer } from '@/shared/layouts/ResponsiveContainer';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Heart,
  Music,
  Share2,
  Shuffle,
  Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const features = [
  {
    icon: <Music className="w-6 h-6" />,
    title: 'Playlist Management',
    description: 'Organize your music collection effortlessly',
    color: 'from-blue-500/20 to-purple-500/20',
  },
  {
    icon: <Share2 className="w-6 h-6" />,
    title: 'Cross-Platform Sync',
    description: 'Transfer playlists between services',
    color: 'from-emerald-500/20 to-teal-500/20',
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: 'Smart Discovery',
    description: "Find new music you'll love",
    color: 'from-orange-500/20 to-red-500/20',
  },
  {
    icon: <Shuffle className="w-6 h-6" />,
    title: 'Smart Shuffle',
    description: 'Intelligent playlist shuffling based on your taste',
    color: 'from-pink-500/20 to-rose-500/20',
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: 'Favorites',
    description: 'Keep track of your most loved tracks',
    color: 'from-violet-500/20 to-indigo-500/20',
  },
];

export default function Landing() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await login(email, password);
      toast.success('Logged in successfully');
      navigate('/home');
    } catch (error: any) {
      toast.error(error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm-password') as string;

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await register(email, password, email.split('@')[0]); // Using email prefix as display name
      toast.success('Account created successfully');
      navigate('/home');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const [showInitialHint, setShowInitialHint] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialHint(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ResponsiveContainer mobileContent={<MobileLanding features={features} />}>
      {/* Desktop Layout */}
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1 flex flex-col md:flex-row">
          {/* Left Side - Logo */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 md:p-16 bg-card border-r border-border">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center md:text-left mb-16"
            >
              <div className="mb-8">
                <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
                  Velvet Metal
                </h1>
                <div className="w-16 h-1 bg-primary mx-auto md:mx-0" />
              </div>
            </motion.div>

            {/* Feature Orbs */}
            <motion.div
              className="flex flex-wrap justify-center md:justify-between gap-8 relative"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.2,
                  },
                },
              }}
            >
              {features.map((feature, index) => (
                <div key={index} className="relative">
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, scale: 0.8 },
                      visible: { opacity: 1, scale: 1 },
                    }}
                    className={`
                      p-2 md:p-4 rounded-full bg-gradient-to-br ${feature.color}
                      backdrop-blur-sm border border-primary/20 cursor-pointer
                      hover:border-primary/40 transition-colors relative
                      group
                    `}
                    animate={{
                      scale: [1, 1.05, 1],
                      transition: {
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        repeatDelay: 0.5,
                      },
                    }}
                    onHoverStart={() => setHoveredFeature(index)}
                    onHoverEnd={() => setHoveredFeature(null)}
                  >
                    <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                      {feature.icon}
                    </div>

                    <div className="absolute inset-0 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>

                  {hoveredFeature === index && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 bg-card rounded-lg shadow-lg border border-border p-3 md:p-4 w-40 md:w-48 z-50"
                    >
                      <h3 className="font-medium text-xs md:text-sm">
                        {feature.title}
                      </h3>
                      <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                        {feature.description}
                      </p>
                    </motion.div>
                  )}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="w-full md:w-1/2 p-8 md:p-16 flex items-center">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-md mx-auto w-full"
            >
              <div className="mb-8">
                <p className="text-muted-foreground text-center">
                  Your all-in-one solution for seamless playlist management and
                  music discovery. Connect your favorite music platforms and
                  take control of your music library.
                </p>
              </div>

              <Tabs defaultValue="register" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="register">Register</TabsTrigger>
                  <TabsTrigger value="login">Login</TabsTrigger>
                </TabsList>
                <TabsContent value="register">
                  <Card className="p-6 border-border">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <Input
                          id="register-email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Password</Label>
                        <Input
                          id="register-password"
                          name="password"
                          type="password"
                          placeholder="Choose a password"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">
                          Confirm Password
                        </Label>
                        <Input
                          id="confirm-password"
                          name="confirm-password"
                          type="password"
                          placeholder="Confirm your password"
                          required
                        />
                      </div>
                      <Button
                        className="w-full"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? 'Creating account...' : 'Register'}{' '}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </Card>
                </TabsContent>
                <TabsContent value="login">
                  <Card className="p-6 border-border">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="Enter your password"
                          required
                        />
                      </div>
                      <Button
                        className="w-full"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? 'Signing in...' : 'Login'}{' '}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-6 bg-card">
          <div className="container mx-auto px-4">
            <div className="flex justify-center gap-8">
              <Link
                to="/faq"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                FAQ
              </Link>
              <Link
                to="/terms"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/privacy"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/contact"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Contact
              </Link>
            </div>
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                {new Date().getFullYear()} Lush Rust Studios
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ResponsiveContainer>
  );
}
