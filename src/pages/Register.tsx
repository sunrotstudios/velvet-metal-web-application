import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const display_name = formData.get('display_name') as string;

    try {
      await register(email, password, display_name);
      toast.success('Account created successfully');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-accent/10 p-4">
      <div className="w-full max-w-[400px] space-y-8">
        <Logo className="mx-auto" size="lg" />
        <Card className="border-2">
          <CardHeader className="space-y-1 text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your details to get started
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="display_name" className="text-sm font-medium">
                  Display Name
                </label>
                <Input
                  id="display_name"
                  name="display_name"
                  type="text"
                  placeholder="Your display name"
                  required
                  autoComplete="name"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Button
                  variant="link"
                  className="p-0 font-normal"
                  onClick={() => navigate('/login')}
                >
                  Sign in
                </Button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
