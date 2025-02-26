import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

export default function FAQ() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const faqs: FaqItem[] = [
    {
      question: "What streaming services do you support?",
      answer: "We currently support Spotify and Apple Music, with more services coming soon including Tidal, Qobuz, Plex, and YouTube Music."
    },
    {
      question: "How does the sync feature work?",
      answer: "Our sync feature automatically keeps your libraries in sync across different streaming platforms, ensuring your music collection stays consistent no matter which service you're using."
    },
    {
      question: "Is my music data secure?",
      answer: "Yes, we use industry-standard encryption and security practices to protect your data and streaming service connections."
    },
    {
      question: "Can I create playlists that work across services?",
      answer: "Absolutely! That's one of our core features. Create a playlist once and listen to it on any of your connected streaming services."
    },
    {
      question: "What happens if a song isn't available on all services?",
      answer: "Velvet Metal will try to find the closest match on each service. If a song isn't available on a particular service, we'll let you know and suggest alternatives."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F0E8] relative overflow-hidden">
      <div className="relative min-h-screen flex items-center justify-center p-4 py-8">
        <motion.div
          className={cn(
            "bg-white rounded-[48px] border-6 border-black",
            "shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]",
            "p-8 md:p-10 max-w-[1000px] w-full"
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center mb-8">
            <button 
              onClick={() => navigate("/")}
              className="bg-yellow-100 rounded-full w-10 h-10 border-3 border-black flex items-center justify-center hover:bg-yellow-200 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <motion.h1
              className={cn(
                "text-4xl md:text-6xl font-black",
                "tracking-tighter uppercase"
              )}
              style={{
                fontFamily: "PP Mondwest",
                fontStretch: "condensed",
              }}
            >
              FAQ
            </motion.h1>
            <div className="w-10"></div> {/* Empty div for centering */}
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={cn(
                  "border-4 border-black rounded-3xl overflow-hidden transition-all",
                  index % 3 === 0 ? "bg-purple-100" : 
                  index % 3 === 1 ? "bg-yellow-100" : "bg-orange-100"
                )}
              >
                <button
                  className="w-full p-6 flex justify-between items-center font-bold text-xl text-left"
                  onClick={() => toggleFaq(index)}
                >
                  <span>{faq.question}</span>
                  <div className="bg-white rounded-full w-8 h-8 border-3 border-black flex items-center justify-center">
                    {openIndex === index ? <Minus size={18} /> : <Plus size={18} />}
                  </div>
                </button>
                
                {openIndex === index && (
                  <motion.div 
                    className="px-6 pb-6 border-t-2 border-black"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="pt-4 text-lg">{faq.answer}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}