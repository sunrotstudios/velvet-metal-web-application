import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface MobileLandingProps {
  features: Array<{
    icon: JSX.Element;
    title: string;
    description: string;
    color: string;
  }>;
}

export function MobileLanding({ features }: MobileLandingProps) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Logo and Features Section */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full flex flex-col items-center justify-center p-8 bg-card border-b border-border">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <div className="mb-6">
              <h1 className="font-radlush text-4xl text-foreground mb-4">
                Velvet Metal
              </h1>
              <div className="w-16 h-1 bg-primary mx-auto" />
            </div>
          </motion.div>

          {/* Feature Orbs */}
          <div className="w-full px-4">
            <motion.div
              className="flex gap-2 justify-center"
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
                      p-3 rounded-full bg-gradient-to-br ${feature.color}
                      backdrop-blur-sm border border-primary/20
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
                    onTouchStart={() => setHoveredFeature(index)}
                    onTouchEnd={() => setHoveredFeature(null)}
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      {feature.icon}
                    </div>
                  </motion.div>

                  {hoveredFeature === index && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 bg-card rounded-lg shadow-lg border border-border p-4 w-48 z-50"
                    >
                      <h3 className="font-medium text-sm">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {feature.description}
                      </p>
                    </motion.div>
                  )}
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 flex flex-col items-center justify-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-sm text-center"
          >
            <p className="text-muted-foreground mb-8">
              Your all-in-one solution for seamless playlist management and
              music discovery. Connect your favorite music platforms and take
              control of your music library.
            </p>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button className="w-full" size="lg">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="h-[60vh] focus:outline-none"
              >
                <SheetHeader>
                  <SheetTitle className="sr-only">Create an Account</SheetTitle>
                </SheetHeader>
                <motion.div
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(event, info) => {
                    if (info.offset.y > 100) {
                      setSheetOpen(false);
                    }
                  }}
                  className="h-full"
                >
                  <div className="mt-12 px-2">
                    <Tabs defaultValue="register" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="register">Register</TabsTrigger>
                        <TabsTrigger value="login">Login</TabsTrigger>
                      </TabsList>
                      <TabsContent value="register" className="mt-4">
                        <Card className="p-6">
                          <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="register-email">Email</Label>
                              <Input
                                id="register-email"
                                name="email"
                                type="email"
                                placeholder="enter your email"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="register-password">
                                Password
                              </Label>
                              <Input
                                id="register-password"
                                name="password"
                                type="password"
                                placeholder="choose a password"
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
                                placeholder="confirm your password"
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
                      <TabsContent value="login" className="mt-4">
                        <Card className="p-6">
                          <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="enter your email"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="password">Password</Label>
                              <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="enter your password"
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
                  </div>
                </motion.div>
              </SheetContent>
            </Sheet>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-6 px-4">
        <div className="text-center text-sm text-muted-foreground">
          <div className="mt-2 space-x-4">
            <Link to="/privacy" className="hover:text-primary">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-primary">
              Terms
            </Link>
            <Link to="/terms" className="hover:text-primary">
              Docs
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
