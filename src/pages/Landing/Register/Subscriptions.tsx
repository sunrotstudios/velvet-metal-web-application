"use client";

import { Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SubscriptionTier {
  id: string;
  name: string;
  tier: "free" | "pro" | "enterprise";
  price: number;
  features: Record<string, string | number | boolean>;
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
      className={cn(
        "w-full max-w-[600px] bg-white",
        "rounded-xl sm:rounded-[32px] border-2 sm:border-4 border-black",
        "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
        "p-3 sm:p-6 md:p-8"
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      {/* Subscription Tiers Container */}
      <div className="bg-white  p-5 mb-6">
        <div className="space-y-5">
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
                    "relative p-4 md:p-5",
                    "border-3 border-black rounded-lg",
                    "transition-all duration-200",
                    selectedTier === tier.id
                      ? "bg-purple-100 -translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      : "bg-white hover:-translate-y-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  )}
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-3">
                    <div className="md:w-[140px] shrink-0">
                      <h3 className="text-lg md:text-xl font-black">
                        {tier.name}
                      </h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl md:text-3xl font-black">
                          ${tier.price}
                        </span>
                        <span className="text-sm text-black/60">/ mo</span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                        {Object.entries(tier.features).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <div
                              className={cn(
                                "w-4 h-4 rounded-full border-2 border-black",
                                "flex items-center justify-center",
                                "bg-white shrink-0"
                              )}
                            >
                              <Check className="w-2 h-2" />
                            </div>
                            <span className="text-sm font-medium truncate">
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
                        "w-6 h-6 rounded-full border-3 border-black shrink-0",
                        "transition-all duration-200",
                        selectedTier === tier.id
                          ? "bg-black"
                          : "bg-white group-hover:bg-gray-100"
                      )}
                    />
                  </div>

                  {tier.tier === "pro" && (
                    <div className="absolute top-3 right-3 md:bottom-3 md:right-3 md:top-auto">
                      <div
                        className={cn(
                          "px-3 py-1.5",
                          "bg-yellow-300 border-2 border-black rounded-full",
                          "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                          "flex items-center gap-1"
                        )}
                      >
                        <Sparkles className="w-4 h-4" />
                        <span className="font-bold text-xs">POPULAR</span>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <button
        onClick={onContinue}
        disabled={!selectedTier}
        className={cn(
          "w-full h-11 md:h-14 text-base md:text-xl font-black",
          "border-3 border-black rounded-lg",
          "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
          "transition-all",
          selectedTier
            ? "bg-purple-500 text-white hover:-translate-y-1 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
            : "bg-gray-100 opacity-50 cursor-not-allowed"
        )}
      >
        CONTINUE
      </button>
    </motion.div>
  );
}
