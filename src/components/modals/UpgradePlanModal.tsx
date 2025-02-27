import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { Check, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UpgradePlanModalProps {
  open: boolean;
  onClose: () => void;
}

type PlanType = 'free' | 'pro' | 'enterprise';

interface Plan {
  id: PlanType;
  name: string;
  price: string;
  features: string[];
  icon: React.ElementType;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0/month',
    icon: Check,
    features: [
      'Basic music syncing',
      'Limited to 2 services',
      'Standard quality streaming',
      'Basic playlist management'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9.99/month',
    icon: Zap,
    features: [
      'Advanced music syncing',
      'Up to 5 services',
      'High quality streaming',
      'Advanced playlist management',
      'Priority support'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$19.99/month',
    icon: Sparkles,
    features: [
      'Unlimited music syncing',
      'Unlimited services',
      'Ultra high quality streaming',
      'Advanced playlist management',
      'Priority support',
      'Early access to new features'
    ]
  }
];

export function UpgradePlanModal({ open, onClose }: UpgradePlanModalProps) {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(
    (user?.user_metadata?.plan_type as PlanType) || 'free'
  );
  const [updating, setUpdating] = useState(false);

  const handleUpgrade = async () => {
    if (!user || updating) return;
    
    setUpdating(true);
    try {
      // Update user metadata
      const { error: userError } = await supabase.auth.updateUser({
        data: {
          plan_type: selectedPlan
        }
      });

      if (userError) throw userError;

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ subscription_tier: selectedPlan })
        .eq('id', user.id);

      if (profileError) throw profileError;

      onClose();
    } catch (error) {
      console.error('Error updating plan:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-zinc-900 text-white">
        <DialogHeader>
          <DialogTitle>Choose Your Plan</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            
            return (
              <div
                key={plan.id}
                className={cn(
                  "p-4 rounded-lg border-2 cursor-pointer transition-all",
                  isSelected 
                    ? "border-white/80 bg-white/10" 
                    : "border-white/10 hover:border-white/20 bg-white/5"
                )}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-5 w-5" />
                  <h3 className="font-medium">{plan.name}</h3>
                </div>
                <p className="text-lg font-semibold mb-4">{plan.price}</p>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-sm text-white/80 flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpgrade}
            disabled={updating || selectedPlan === user?.user_metadata?.plan_type}
            className="bg-white/10 text-white hover:bg-white/20"
          >
            {updating ? 'Updating...' : 'Confirm Plan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
