import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { ServiceConnection } from '@/shared/services/ServiceConnection';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

type Step = 'account' | 'subscription' | 'services';

interface SubscriptionTier {
  id: string;
  name: string;
  tier: string;
  price: number;
  features: Record<string, any>;
}

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>(() => {
    // If we have a step in the URL, use that
    const stepParam = searchParams.get('step');
    if (stepParam && ['account', 'subscription', 'services'].includes(stepParam)) {
      return stepParam as Step;
    }
    return 'account';
  });
  const [formData, setFormData] = useState({
    email: '',
    display_name: '',
    password: '',
    confirmPassword: '',
    selectedTier: '',
  });

  // Update URL when step changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('step', currentStep);
    navigate(`?${newParams.toString()}`, { replace: true });
  }, [currentStep, navigate, searchParams]);

  // Clear any saved step when first loading the page
  useEffect(() => {
    sessionStorage.removeItem('register_step');
  }, []);

  // Fetch subscription tiers
  const { data: subscriptionTiers } = useQuery<SubscriptionTier[]>({
    queryKey: ['subscription-tiers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .order('price');

      if (error) throw error;
      return data;
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectTier = (tierId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedTier: tierId,
    }));
  };

  const handleAccountSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      toast.success('Account created successfully!');
      setCurrentStep('subscription');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'account':
        return 'Create Your\nAccount';
      case 'subscription':
        return 'Choose Your\nPlan';
      case 'services':
        return 'Connect Your\nServices';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'account':
        return 'Start managing your music library';
      case 'subscription':
        return 'Select a plan that fits your needs';
      case 'services':
        return 'Connect your favorite streaming services';
    }
  };

  const handleFinish = () => {
    navigate('/home');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'account':
        return (
          <motion.form
            className="space-y-6"
            onSubmit={handleAccountSubmit}
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
                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-white/20 focus:ring-white/20"
                  autoComplete="email"
                />
              </div>
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
                <span>Continue</span>
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
        );

      case 'subscription':
        return (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="space-y-4">
              {subscriptionTiers?.map((tier) => (
                <Card
                  key={tier.id}
                  className={`relative p-6 transition-all duration-300 bg-white/[0.03] border-white/10 hover:bg-white/[0.06] cursor-pointer ${
                    formData.selectedTier === tier.id ? 'ring-2 ring-white' : ''
                  }`}
                  onClick={() => handleSelectTier(tier.id)}
                >
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1 text-white">
                        {tier.name}
                      </h3>
                      <p className="text-3xl font-bold flex items-baseline text-white">
                        ${tier.price.toFixed(2)}
                        <span className="text-sm font-normal text-gray-400 ml-2">
                          /mo
                        </span>
                      </p>
                    </div>
                    <div className="flex-1">
                      <ul className="space-y-2">
                        {Object.entries(tier.features).map(([key, value]) => (
                          <li
                            key={key}
                            className="flex items-center text-sm text-gray-300"
                          >
                            <Check className="w-4 h-4 mr-3 text-white/60 flex-shrink-0" />
                            <span className="capitalize">
                              {key === 'max_playlists' ? (
                                <>
                                  {value === -1 ? 'Unlimited' : value} playlists
                                </>
                              ) : key === 'sync_interval' ? (
                                <>{value} sync</>
                              ) : key === 'priority_support' ? (
                                'Priority support'
                              ) : key === 'custom_features' ? (
                                'Custom features'
                              ) : (
                                key.split('_').join(' ')
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <Button
                onClick={() => setCurrentStep('services')}
                disabled={!formData.selectedTier}
                className="w-full h-12 bg-white hover:bg-gray-100 text-black font-medium text-lg"
              >
                Continue
              </Button>
            </div>
          </motion.div>
        );

      case 'services':
        return (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="space-y-4">
              {[
                {
                  name: 'Spotify',
                  description:
                    'Connect your Spotify account to sync your playlists and library',
                  service: 'spotify' as const,
                  icon: '🎵',
                },
                {
                  name: 'Apple Music',
                  description: 'Sync your Apple Music library and playlists',
                  service: 'apple-music' as const,
                  icon: '🎵',
                },
                {
                  name: 'Tidal',
                  description: 'Coming soon - Connect your Tidal account',
                  service: 'tidal' as const,
                  icon: '🎵',
                  disabled: true,
                },
              ].map((service) => (
                <Card
                  key={service.name}
                  className={`relative p-6 transition-all duration-300 bg-white/[0.03] border-white/10 hover:bg-white/[0.06] ${
                    service.disabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}
                  onClick={() => {
                    if (!service.disabled) {
                      // Save current URL with step parameter
                      sessionStorage.setItem('auth_callback_url', `/register?step=services`);
                    }
                  }}
                >
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{service.icon}</span>
                        <div>
                          <h3 className="text-xl font-semibold text-white">
                            {service.name}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {service.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {!service.disabled ? (
                        <ServiceConnection service={service.service} />
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white/10 text-white hover:bg-white/20 border-0 opacity-50 cursor-not-allowed"
                          disabled
                        >
                          Coming Soon
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <Button
                onClick={handleFinish}
                className="w-full h-12 bg-white hover:bg-gray-100 text-black font-medium text-lg"
              >
                Go to App
              </Button>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-50" />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {currentStep !== 'account' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (currentStep === 'services')
                    setCurrentStep('subscription');
                  if (currentStep === 'subscription') setCurrentStep('account');
                }}
                className="text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <h1 className="text-xl font-semibold">Create Account</h1>
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
                {getStepTitle()}
              </motion.h1>
              <motion.p
                className="text-gray-400 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {getStepDescription()}
              </motion.p>
            </div>

            {/* Step Indicator */}
            <div className="flex justify-between items-center space-x-2">
              {['account', 'subscription', 'services'].map((step, index) => (
                <div key={step} className="flex-1">
                  <div
                    className={`h-2 rounded-full transition-colors ${
                      index <=
                      ['account', 'subscription', 'services'].indexOf(
                        currentStep
                      )
                        ? 'bg-white'
                        : 'bg-white/10'
                    }`}
                  />
                </div>
              ))}
            </div>

            {renderStep()}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
