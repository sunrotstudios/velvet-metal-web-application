import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
  color: string;
  pattern: string;
}

export default function FAQ() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  
  const TRANSLATIONS = [
    "Frequently Asked Questions", // English
    "자주 묻는 질문", // Korean
    "よくある質問", // Japanese
    "常見問題", // Chinese (Traditional)
    "Questions Fréquentes", // French
    "Часто Задаваемые Вопросы", // Russian
    "Domande Frequenti", // Italian
    "Preguntas Frecuentes", // Spanish
    "Häufig Gestellte Fragen", // German
    "الأسئلة المتكررة", // Arabic
  ];

  const faqItems: FAQItem[] = [
    {
      question: "What is Velvet Metal?",
      answer: "Velvet Metal is a music management platform that brings all your music services together in one place. It allows you to manage and explore your music library across different streaming services like Spotify and Apple Music.",
      color: "bg-purple-100",
      pattern: "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(168, 85, 247, 0.1) 5px, rgba(168, 85, 247, 0.1) 10px)",
    },
    {
      question: "Which music services are supported?",
      answer: "We currently support Spotify and Apple Music, with plans to add Tidal, Qobuz, YouTube Music, and more in the near future.",
      color: "bg-yellow-100",
      pattern: "repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(245, 158, 11, 0.1) 5px, rgba(245, 158, 11, 0.1) 10px)",
    },
    {
      question: "Do I need premium subscriptions to the music services?",
      answer: "Yes, you'll need a premium subscription to any service you want to connect with Velvet Metal. Free accounts have limited API access that doesn't allow for the full experience.",
      color: "bg-orange-100",
      pattern: "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(249, 115, 22, 0.1) 5px, rgba(249, 115, 22, 0.1) 10px)",
    },
    {
      question: "Can I transfer playlists between services?",
      answer: "Absolutely! One of our core features is the ability to transfer playlists between services with just a few clicks. The transfer preserves all your careful curation.",
      color: "bg-green-100",
      pattern: "repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(74, 222, 128, 0.1) 5px, rgba(74, 222, 128, 0.1) 10px)",
    },
    {
      question: "Is there a free version available?",
      answer: "We offer a free tier with limited features, allowing you to connect up to two services and manage a limited number of playlists. Our premium tiers unlock the full potential of Velvet Metal.",
      color: "bg-blue-100",
      pattern: "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(59, 130, 246, 0.1) 5px, rgba(59, 130, 246, 0.1) 10px)",
    },
    {
      question: "How often does Velvet Metal sync with my music services?",
      answer: "The sync frequency depends on your subscription tier. Free accounts sync once daily, while premium accounts sync every few hours or in real-time, ensuring your library is always up to date.",
      color: "bg-pink-100",
      pattern: "repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(236, 72, 153, 0.1) 5px, rgba(236, 72, 153, 0.1) 10px)",
    },
  ];

  return (
    <div className="min-h-[100dvh] w-full bg-[#F5F0E8] relative overflow-hidden">
      {/* Background Design Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-300 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-yellow-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10 min-h-[100dvh] flex flex-col">
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

        {/* Main Content */}
        <div className="relative flex-1 flex items-center justify-center p-4 pt-6 md:pt-8 lg:p-8">
          <motion.div
            className={cn(
              "bg-white rounded-[24px] md:rounded-[48px] border-3 md:border-6 border-black",
              "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]",
              "p-5 md:p-6 max-w-[1100px] w-[96%] md:w-[90%] mx-auto my-auto relative"
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              backgroundImage: `
                radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 20% 80%, rgba(245, 158, 11, 0.1) 0%, transparent 50%),
                linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
              `,
              backgroundSize: "100% 100%, 100% 100%, 20px 20px, 20px 20px",
            }}
          >
            <div className="space-y-3 md:space-y-4">
              {/* Header Section */}
              <div className="flex items-center justify-between gap-2">
                <button 
                  onClick={() => navigate("/")}
                  className="bg-yellow-100 rounded-full w-10 h-10 md:w-12 md:h-12 border-2 md:border-4 border-black flex items-center justify-center hover:bg-yellow-200 transition-colors"
                >
                  <ArrowLeft size={20} className="md:hidden" />
                  <ArrowLeft size={24} className="hidden md:block" />
                </button>

                <motion.h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-right w-4/5"
                  style={{
                    fontFamily: "Mondwest",
                    textShadow: "3px 3px 0px rgba(168, 85, 247, 0.3)",
                  }}
                >
                  FAQ
                </motion.h1>
              </div>

              {/* Divider */}
              <div className="relative h-2 md:h-3 my-0.5">
                <svg width="100%" height="100%" viewBox="0 0 1200 24" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                  <path d="M0 0L50 12L100 0L150 12L200 0L250 12L300 0L350 12L400 0L450 12L500 0L550 12L600 0L650 12L700 0L750 12L800 0L850 12L900 0L950 12L1000 0L1050 12L1100 0L1150 12L1200 0" stroke="black" strokeWidth="2" />
                </svg>
              </div>

              {/* FAQ Intro */}
              <div>
                <div className="bg-gradient-to-r from-purple-100 to-purple-50 p-3 md:p-4 rounded-xl md:rounded-2xl border-3 border-black">
                  <p className="text-sm md:text-base font-medium font-title text-center">
                    Got questions about Velvet Metal? We've got answers! Here are some of the most common questions we receive.
                  </p>
                </div>
              </div>
              
              {/* FAQ Accordion */}
              <div className="space-y-3 md:space-y-4">
                {faqItems.map((item, index) => (
                  <motion.div
                    key={index}
                    className={cn(
                      "border-3 border-black rounded-xl md:rounded-2xl overflow-hidden",
                      item.color
                    )}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: index * 0.1 + 0.2 }
                    }}
                    style={{
                      backgroundImage: item.pattern
                    }}
                  >
                    <button
                      className="w-full text-left p-4 flex justify-between items-center"
                      onClick={() => toggleQuestion(index)}
                    >
                      <h3 className="font-bold text-base md:text-lg pr-4">{item.question}</h3>
                      <div className="bg-white rounded-full w-8 h-8 border-2 border-black flex items-center justify-center shrink-0">
                        {openIndex === index ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </button>
                    
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-4 pb-4"
                      >
                        <div className="bg-white/50 p-3 rounded-lg border-2 border-black">
                          <p className="text-sm md:text-base">{item.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
              
              {/* Still Have Questions */}
              <div className="bg-purple-600 p-3 md:p-4 rounded-xl md:rounded-2xl text-center relative overflow-hidden border-3 border-black">
                <div className="absolute inset-0" style={{
                  backgroundImage: `
                    repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(255, 255, 255, 0.5) 8px, rgba(255, 255, 255, 0.5) 10px),
                    repeating-linear-gradient(90deg, transparent, transparent 12px, rgba(255, 255, 255, 0.3) 12px, rgba(255, 255, 255, 0.3) 14px)
                  `,
                  mixBlendMode: 'overlay'
                }}></div>

                <div className="relative z-10">
                  <h2 className="text-lg md:text-xl font-bold text-white mb-1">Still Have Questions?</h2>
                  <p className="text-xs md:text-sm text-white/90 mb-3">Can't find what you're looking for? Contact our support team.</p>
                  <button
                    onClick={() => navigate("/contact")}
                    className="inline-block bg-white text-purple-600 px-4 py-2 rounded-lg font-bold text-sm border-2 border-black hover:bg-gray-100 transition-colors"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}