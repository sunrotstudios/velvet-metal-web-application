import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    display_name: z
      .string()
      .min(2, 'Display name must be at least 2 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

interface ProfileCreationProps {
  onComplete: (data: {
    email: string;
    password: string;
    display_name: string;
    avatar?: File | null;
  }) => Promise<void>;
  loading?: boolean;
}

export const ProfileCreation = ({
  onComplete,
  loading = false,
}: ProfileCreationProps) => {
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      display_name: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await onComplete({
        email: values.email,
        password: values.password,
        display_name: values.display_name,
        avatar: null,
      });
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during registration');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Email"
                    {...field}
                    type="email"
                    className="h-12 bg-transparent border-2 border-text dark:border-darkText text-text dark:text-darkText placeholder:text-text/50 dark:placeholder:text-darkText/50 shadow-light dark:shadow-dark hover:translate-x-boxShadowX hover:translate-y-boxShadowY focus:translate-x-boxShadowX focus:translate-y-boxShadowY transition-transform"
                    autoComplete="email"
                  />
                </FormControl>
                <FormMessage className="text-text/60 dark:text-darkText/60" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="display_name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Display Name"
                    {...field}
                    className="h-12 bg-transparent border-2 border-text dark:border-darkText text-text dark:text-darkText placeholder:text-text/50 dark:placeholder:text-darkText/50 shadow-light dark:shadow-dark hover:translate-x-boxShadowX hover:translate-y-boxShadowY focus:translate-x-boxShadowX focus:translate-y-boxShadowY transition-transform"
                    autoComplete="name"
                  />
                </FormControl>
                <FormMessage className="text-text/60 dark:text-darkText/60" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Password"
                    {...field}
                    type="password"
                    className="h-12 bg-transparent border-2 border-text dark:border-darkText text-text dark:text-darkText placeholder:text-text/50 dark:placeholder:text-darkText/50 shadow-light dark:shadow-dark hover:translate-x-boxShadowX hover:translate-y-boxShadowY focus:translate-x-boxShadowX focus:translate-y-boxShadowY transition-transform"
                    autoComplete="new-password"
                  />
                </FormControl>
                <FormMessage className="text-text/60 dark:text-darkText/60" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Confirm Password"
                    {...field}
                    type="password"
                    className="h-12 bg-transparent border-2 border-text dark:border-darkText text-text dark:text-darkText placeholder:text-text/50 dark:placeholder:text-darkText/50 shadow-light dark:shadow-dark hover:translate-x-boxShadowX hover:translate-y-boxShadowY focus:translate-x-boxShadowX focus:translate-y-boxShadowY transition-transform"
                    autoComplete="new-password"
                  />
                </FormControl>
                <FormMessage className="text-text/60 dark:text-darkText/60" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-main text-text hover:bg-opacity-90 text-lg px-12 py-6 font-medium shadow-light dark:shadow-dark hover:translate-x-boxShadowX hover:translate-y-boxShadowY active:translate-x-0 active:translate-y-0 transition-transform"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>Continue</span>
            )}
          </Button>

          <div className="text-center">
            <p className="text-text/60 dark:text-darkText/60">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-text dark:text-darkText hover:underline focus:outline-none"
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      </Form>
    </motion.div>
  );
};
