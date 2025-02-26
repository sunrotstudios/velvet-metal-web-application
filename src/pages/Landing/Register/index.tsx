import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { storage } from "@/lib/services/storage";
import { useConnectedServices } from "@/lib/hooks/useConnectedServices";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ProfileCreation, ProfileFormData } from "./ProfileCreation";
import { Subscriptions } from "./Subscriptions";
import { ServiceConnections } from "./ServiceConnections";
import { cn } from "@/lib/utils";

type Step = "account" | "subscription" | "services";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>(() => {
    const stepParam = searchParams.get("step");
    if (
      stepParam &&
      ["account", "subscription", "services"].includes(stepParam)
    ) {
      return stepParam as Step;
    }
    return "account";
  });
  const [selectedTier, setSelectedTier] = useState("");

  // Update URL when step changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("step", currentStep);
    navigate(`?${newParams.toString()}`, { replace: true });
  }, [currentStep, navigate, searchParams]);

  // Fetch subscription tiers
  const { data: subscriptionTiers } = useQuery({
    queryKey: ["subscription-tiers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_tiers")
        .select("*")
        .order("price");

      if (error) throw error;
      return data;
    },
  });

  const { data: connectedServices } = useConnectedServices();

  // Query sync status for all services
  const { data: syncStatuses } = useQuery({
    queryKey: ["syncStatuses", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("user_services")
        .select("service, last_library_sync")
        .eq("user_id", user.id);
      return data;
    },
    enabled: !!user?.id,
    refetchInterval: connectedServices?.length ? 2000 : false,
  });

  const isAnySyncing = syncStatuses?.some(
    (status) => status.last_library_sync === null
  );

  const handleProfileSubmit = async (formData: ProfileFormData) => {
    setLoading(true);
    try {
      await register(formData.email, formData.password, formData.display_name);
      const {
        data: { user: newUser },
      } = await supabase.auth.getUser();

      if (newUser && formData.avatar) {
        const avatarUrl = await uploadAvatar(newUser.id, formData.avatar);
        if (avatarUrl) {
          await supabase
            .from("profiles")
            .update({ avatar_url: avatarUrl })
            .eq("id", newUser.id);
        }
      }
      setCurrentStep("subscription");
    } catch (error: any) {
      toast.error(error.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (userId: string, avatar: File) => {
    try {
      const fileExt = avatar.name.split(".").pop();
      const fileName = `${userId}/${Math.random()}.${fileExt}`;
      const publicUrl = await storage.uploadFile("avatars", fileName, avatar);
      return publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "account":
        return "Create Your\nAccount";
      case "subscription":
        return "Choose Your\nPlan";
      case "services":
        return "Connect Your\nServices";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case "account":
        return "you know what to do here...";
      case "subscription":
        return "if you want to give us money...";
      case "services":
        return "the grand finale of registration...";
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "account":
        return (
          <ProfileCreation onSubmit={handleProfileSubmit} loading={loading} />
        );
      case "subscription":
        return (
          <Subscriptions
            subscriptionTiers={subscriptionTiers}
            selectedTier={selectedTier}
            onSelectTier={setSelectedTier}
            onContinue={() => setCurrentStep("services")}
          />
        );
      case "services":
        return (
          <ServiceConnections
            connectedServices={connectedServices || []}
            isAnySyncing={isAnySyncing || false}
            onFinish={() => navigate("/home")}
          />
        );
    }
  };

  const TRANSLATIONS = [
    "Velvet Metal", // English
    "벨벳 메탈", // Korean
    "ベルベットメタル", // Japanese
    "絲絨金屬", // Chinese (Traditional)
    "Métal Velours", // French
    "Бархатный металл", // Russian
    "Metallo Velluto", // Italian
    "Terciopelo Metálico", // Spanish
    "Samt Metall", // German
    "معدن المخمل", // Arabic
    "Fluwelen Metaal", // Dutch
    "Aksamitowy Metal", // Polish
    "Sammet Metall", // Swedish
    "Металевий оксамит", // Ukrainian
    "Kadife Metal", // Turkish
  ];

  return (
    <div className="min-h-[100dvh] md:min-h-screen w-full bg-[#F5F0E8] relative overflow-hidden">
      {/* Background Design Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-300 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-yellow-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10 min-h-[100dvh] md:min-h-screen flex flex-col">
        {/* Marquee Navigation */}
        <div className="sticky top-0 z-50 bg-black py-4 border-b-4 border-black overflow-hidden">
          <div className="flex whitespace-nowrap">
            <div className="animate-marquee flex items-center">
              {TRANSLATIONS.map((text, i) => (
                <span key={i} className="text-2xl font-black text-white px-8">
                  {text}
                </span>
              ))}
            </div>
            <div
              className="animate-marquee flex items-center"
              aria-hidden="true"
            >
              {TRANSLATIONS.map((text, i) => (
                <span key={i} className="text-2xl font-black text-white px-8">
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Main Content */}
        <main className="hidden md:flex flex-1 items-center justify-center px-8 pt-16">
          <div className="w-full max-w-[1000px] mx-auto grid grid-cols-[1fr_1.5fr] gap-24 items-center">
            {/* Left Side - Title and Progress */}
            <div className="space-y-12">
              <div className="space-y-4">
                <motion.h1
                  className="text-6xl lg:text-7xl font-black tracking-tight leading-[0.9] whitespace-pre-line"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {getStepTitle()}
                </motion.h1>
                <motion.p
                  className="text-xl text-black/70"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {getStepDescription()}
                </motion.p>
              </div>

              {/* Step Indicator - Desktop */}
              <div className="space-y-6">
                {["account", "subscription", "services"].map((step, index) => {
                  const isActive =
                    index <=
                    ["account", "subscription", "services"].indexOf(
                      currentStep
                    );
                  const isCurrentStep = step === currentStep;

                  return (
                    <div key={step} className="relative">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={cn(
                            "h-8 w-8 flex items-center justify-center",
                            "border-4 border-black rounded-lg",
                            "font-black text-sm",
                            "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                            "transition-all duration-200",
                            isActive
                              ? "bg-yellow-300 -translate-y-1 -translate-x-1"
                              : "bg-gray-200"
                          )}
                        >
                          {index + 1}
                        </div>
                        <span className="text-base font-bold uppercase">
                          {step.charAt(0).toUpperCase() + step.slice(1)}
                        </span>
                      </div>

                      <div
                        className={cn(
                          "h-3 w-full relative",
                          "border-4 border-black rounded-md",
                          "transition-all duration-200",
                          isActive ? "bg-purple-100" : "bg-gray-100"
                        )}
                      >
                        {isActive && (
                          <div
                            className={cn(
                              "h-full bg-black",
                              isCurrentStep ? "animate-pulse" : "",
                              step === "account"
                                ? isCurrentStep
                                  ? "w-full rounded-l-sm"
                                  : "w-full rounded-l-sm"
                                : step === "subscription"
                                  ? isCurrentStep
                                    ? "w-1/2 rounded-l-sm"
                                    : "w-full rounded-l-sm"
                                  : "w-full rounded-l-sm"
                            )}
                          />
                        )}
                      </div>

                      {index < 2 && (
                        <div
                          className={cn(
                            "absolute h-5 w-5 bottom-[calc(1.5rem-10px)] right-0 z-10",
                            "border-4 border-black rounded-full",
                            "transition-all",
                            isActive &&
                              index <
                              ["account", "subscription", "services"].indexOf(
                                currentStep
                              )
                              ? "bg-black"
                              : "bg-white"
                          )}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side - Form Container - Desktop */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center"
            >
              {renderStep()}
            </motion.div>
          </div>
        </main>

        {/* Mobile Main Content - Full Neo-brutalist Approach */}
        <main className="md:hidden flex flex-col min-h-[calc(100vh-3.5rem)] overflow-auto">
          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-4 py-8">
            {/* Step Counter Box - Larger and More Prominent */}
            <div className="w-full mb-8">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-6">
                  <div
                    className={cn(
                      "flex items-center justify-center",
                      "w-20 h-20 border-4 border-black rounded-2xl",
                      "font-black text-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
                      "bg-yellow-300"
                    )}
                  >
                    {["account", "subscription", "services"].indexOf(currentStep) + 1}
                  </div>
                  <div>
                    <h2 className="font-black text-3xl uppercase leading-tight">
                      {currentStep.charAt(0).toUpperCase() + currentStep.slice(1)}
                    </h2>
                    <p className="text-base text-black/70 mt-1">
                      {getStepDescription()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  {["account", "subscription", "services"].map((step, index) => {
                    const isActive = index <= ["account", "subscription", "services"].indexOf(currentStep);
                    return (
                      <div
                        key={step}
                        className={cn(
                          "flex-1 h-5 border-3 border-black rounded-md",
                          isActive ? "bg-black" : "bg-gray-100"
                        )}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Form Container */}
            <div className="w-full">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                {renderStep()}
              </motion.div>
              
              {/* Quote Section */}
              <div className="w-full pt-8">
                <div
                  className={cn(
                    "border-3 border-black rounded-lg p-5",
                    "bg-purple-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                    "text-sm italic"
                  )}
                >
                  <p className="mb-3 text-base">"{currentStep === "account"
                    ? "Music is the universal language of mankind."
                    : currentStep === "subscription"
                      ? "Without music, life would be a mistake."
                      : "Music gives a soul to the universe, wings to the mind, and life to everything."}"</p>
                  <p className="text-right font-bold">
                    — {currentStep === "account"
                      ? "Henry Wadsworth Longfellow"
                      : currentStep === "subscription"
                        ? "Friedrich Nietzsche"
                        : "Plato"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}