import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';

const PLANS = [
  {
    name: 'Free',
    description: 'Perfect for getting started',
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: [
      'Up to 3 playlists',
      'Basic music analysis',
      'Standard audio quality',
      'Web access only',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    description: 'For serious music enthusiasts',
    price: {
      monthly: 9.99,
      yearly: 99.99,
    },
    features: [
      'Unlimited playlists',
      'Advanced music analysis',
      'High-quality audio',
      'Cross-platform access',
      'Priority support',
      'Offline mode',
      'Custom recommendations',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For professional creators',
    price: {
      monthly: 19.99,
      yearly: 199.99,
    },
    features: [
      'Everything in Pro',
      'Studio quality audio',
      'API access',
      'Custom integrations',
      'Dedicated support',
      'Advanced analytics',
      'White-label option',
    ],
  },
];

interface PricingSectionDemoProps {
  onContinue: () => void;
}

export function PricingSectionDemo({ onContinue }: PricingSectionDemoProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    'monthly'
  );
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <Tabs
        defaultValue="monthly"
        className="w-full"
        onValueChange={(value) =>
          setBillingCycle(value as 'monthly' | 'yearly')
        }
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>

        <div className="space-y-4">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                'relative w-full cursor-pointer transition-all hover:border-primary/50',
                selectedPlan === plan.name &&
                  'border-primary ring-2 ring-primary',
                plan.popular && 'shadow-lg'
              )}
              onClick={() => setSelectedPlan(plan.name)}
            >
              {plan.popular && (
                <div className="absolute right-4 top-4 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Popular
                </div>
              )}
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={selectedPlan === plan.name}
                      onCheckedChange={() => setSelectedPlan(plan.name)}
                    />
                    <div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">
                          $
                          {billingCycle === 'monthly'
                            ? plan.price.monthly
                            : plan.price.yearly}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /{billingCycle === 'monthly' ? 'month' : 'year'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </Tabs>

      <Button
        className="w-full mt-6 h-12 text-lg"
        disabled={!selectedPlan}
        onClick={onContinue}
      >
        Continue
      </Button>
    </motion.div>
  );
}
