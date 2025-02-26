import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SubscriptionTier {
  id: string;
  name: string;
  tier: string;
  price: number;
  features: Record<string, any>;
}

interface SubscriptionsProps {
  subscriptionTiers: SubscriptionTier[] | undefined;
  selectedTier: string;
  onSelectTier: (tierId: string) => void;
  onContinue: () => void;
}

export function Subscriptions({
  subscriptionTiers,
  selectedTier,
  onSelectTier,
  onContinue,
}: SubscriptionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <div className="space-y-2">
        {subscriptionTiers?.map((tier, index) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <button
              onClick={() => onSelectTier(tier.id)}
              className="w-full text-left"
            >
              <div
                className={cn(
                  "relative p-3",
                  "border-3 border-black rounded-lg",
                  "transition-all duration-200",
                  selectedTier === tier.id
                    ? "bg-purple-100 -translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-white hover:-translate-y-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-[120px] flex-shrink-0">
                    <h3 className="text-base font-black">{tier.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black">
                        ${tier.price}
                      </span>
                      <span className="text-sm text-black/60">/ mo</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      {Object.entries(tier.features).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-1.5">
                          <div
                            className={cn(
                              "w-3 h-3 rounded-full border-2 border-black",
                              "flex items-center justify-center",
                              "bg-white flex-shrink-0"
                            )}
                          >
                            <Check className="w-1.5 h-1.5" />
                          </div>
                          <span className="text-[11px] font-medium truncate">
                            {key === "max_playlists"
                              ? `${value === -1 ? "Unlimited" : value} playlists`
                              : key === "sync_interval"
                                ? `${value} sync`
                                : key === "priority_support"
                                  ? "Priority support"
                                  : key === "custom_features"
                                    ? "Custom features"
                                    : key.split("_").join(" ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border-2 border-black flex-shrink-0",
                      "transition-all duration-200",
                      selectedTier === tier.id
                        ? "bg-black"
                        : "bg-white group-hover:bg-gray-100"
                    )}
                  />
                </div>

                {tier.tier === "pro" && (
                  <div className="absolute bottom-2 right-2">
                    <div
                      className={cn(
                        "px-2 py-1",
                        "bg-yellow-300 border-2 border-black rounded-full",
                        "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                        "flex items-center gap-1"
                      )}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span className="font-bold text-[10px]">POPULAR</span>
                    </div>
                  </div>
                )}
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      <Button
        onClick={onContinue}
        disabled={!selectedTier}
        className={cn(
          "w-full h-11 text-base font-black mt-3",
          "border-3 border-black rounded-lg",
          "shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
          "transition-all",
          selectedTier
            ? "bg-purple-500 text-white"
            : "bg-gray-100 opacity-50 cursor-not-allowed"
        )}
      >
        CONTINUE
      </Button>
    </motion.div>
  );
}
