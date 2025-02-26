import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
      className="space-y-4" // Reduced from space-y-8
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <div className="space-y-3">
        {" "}
        {/* Reduced from space-y-6 */}
        {subscriptionTiers?.map((tier, index) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <button
              onClick={() => onSelectTier(tier.id)}
              className={cn(
                "w-full text-left",
                "transition-all duration-200",
                "group"
              )}
            >
              <div
                className={cn(
                  "relative p-4", // Reduced from p-8
                  "border-4 border-black rounded-[20px]", // Reduced from 24px
                  "transition-all duration-200",
                  selectedTier === tier.id
                    ? "bg-purple-100 -translate-y-1"
                    : "bg-white hover:-translate-y-1",
                  selectedTier === tier.id
                    ? "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]" // Reduced from 8px
                    : "shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]" // Reduced from 4px/8px
                )}
              >
                {/* Popular Tag */}
                {tier.tier === "pro" && (
                  <div className="absolute -top-3 -right-3">
                    <div
                      className={cn(
                        "px-3 py-1", // Reduced from px-4
                        "bg-yellow-300 border-3 border-black rounded-full", // Reduced from border-4
                        "shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]", // Reduced from 4px
                        "flex items-center gap-1" // Reduced from gap-2
                      )}
                    >
                      <Sparkles className="w-3 h-3" />{" "}
                      {/* Reduced from w-4 h-4 */}
                      <span className="font-bold text-xs">POPULAR</span>{" "}
                      {/* Reduced from text-sm */}
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between gap-4">
                  {" "}
                  {/* Reduced from gap-8 */}
                  <div className="space-y-3">
                    {" "}
                    {/* Reduced from space-y-4 */}
                    <div>
                      <h3 className="text-xl font-black">{tier.name}</h3>{" "}
                      {/* Reduced from text-2xl */}
                      <div className="flex items-baseline gap-1 mt-1">
                        {" "}
                        {/* Reduced from gap-2 */}
                        <span className="text-3xl font-black">
                          {" "}
                          {/* Reduced from text-4xl */}${tier.price}
                        </span>
                        <span className="text-base text-black/60">/ month</span>{" "}
                        {/* Reduced from text-lg */}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {" "}
                      {/* Reduced from space-y-3 */}
                      {Object.entries(tier.features).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          {" "}
                          {/* Reduced from gap-3 */}
                          <div
                            className={cn(
                              "w-4 h-4 rounded-full border-2 border-black", // Reduced from w-5 h-5
                              "flex items-center justify-center",
                              "bg-white"
                            )}
                          >
                            <Check className="w-2 h-2" />{" "}
                            {/* Reduced from w-3 h-3 */}
                          </div>
                          <span className="text-sm font-medium">
                            {" "}
                            {/* Added text-sm */}
                            {key === "max_playlists"
                              ? `${
                                  value === -1 ? "Unlimited" : value
                                } playlists`
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
                      "w-5 h-5 rounded-full border-3 border-black flex-shrink-0", // Reduced from w-6 h-6 and border-4
                      "transition-all duration-200",
                      selectedTier === tier.id
                        ? "bg-black"
                        : "bg-white group-hover:bg-gray-100"
                    )}
                  />
                </div>
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      <Button
        onClick={onContinue}
        disabled={!selectedTier}
        className={cn(
          "w-full h-14 bg-purple-100 text-xl font-bold",
          "border-4 border-black rounded-xl",
          "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
          "hover:translate-x-[-2px] hover:translate-y-[-2px]",
          "active:shadow-none active:translate-x-0 active:translate-y-0",
          "transition-all",
          selectedTier
            ? "bg-purple-100 hover:bg-purple-200"
            : "bg-gray-100 opacity-50 cursor-not-allowed"
        )}
      >
        Continue
      </Button>
    </motion.div>
  );
}
