import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Heart,
  Music,
  Share2,
  Shuffle,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
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
  const [email, setEmail] = useState('');
  const { signInWithEmail } = useAuth();

  const handleSignIn = async () => {
    try {
      await signInWithEmail(email);
      toast.success('Check your email for the login link!');
    } catch (error) {
      toast.error('Failed to send login link. Please try again.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col px-4 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Your Music, Unified
          </h1>
          <p className="text-muted-foreground text-lg">
            Seamlessly manage and transfer your music between platforms
          </p>
        </motion.div>

        {/* Sign In Form */}
        <div className="w-full max-w-sm mx-auto space-y-4 mb-12">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            onClick={handleSignIn}
            disabled={!email}
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            No account needed - just enter your email
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-4 px-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div
                className={`p-6 rounded-2xl bg-gradient-to-br ${feature.color}`}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0">{feature.icon}</div>
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-6 px-4">
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2024 Velvet Metal. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link to="/privacy" className="hover:text-primary">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-primary">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
