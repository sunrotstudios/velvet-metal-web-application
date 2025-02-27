import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";

export default function Contact() {
  const navigate = useNavigate();
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would handle form submission here
    setFormSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormSubmitted(false);
      // Reset form fields here if needed
      const form = e.target as HTMLFormElement;
      form.reset();
    }, 3000);
  };
  
  const TRANSLATIONS = [
    "Contact Us", // English
    "연락처", // Korean
    "お問い合わせ", // Japanese
    "聯繫我們", // Chinese (Traditional)
    "Contactez-nous", // French
    "Свяжитесь с нами", // Russian
    "Contattaci", // Italian
    "Contáctanos", // Spanish
    "Kontaktiere uns", // German
    "اتصل بنا", // Arabic
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
                  Contact Us
                </motion.h1>
              </div>

              {/* Divider */}
              <div className="relative h-2 md:h-3 my-0.5">
                <svg width="100%" height="100%" viewBox="0 0 1200 24" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                  <path d="M0 0L50 12L100 0L150 12L200 0L250 12L300 0L350 12L400 0L450 12L500 0L550 12L600 0L650 12L700 0L750 12L800 0L850 12L900 0L950 12L1000 0L1050 12L1100 0L1150 12L1200 0" stroke="black" strokeWidth="2" />
                </svg>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                {/* Contact Intro */}
                <div className="md:col-span-3">
                  <div className="bg-gradient-to-r from-purple-100 to-purple-50 p-3 md:p-4 rounded-xl md:rounded-2xl border-3 border-black">
                    <p className="text-sm md:text-base font-medium font-title text-center">
                      Got questions? We'd love to hear from you! Send a message or reach out directly.
                    </p>
                  </div>
                </div>
                
                {/* Contact Info Section */}
                <div className="md:col-span-1 space-y-3">
                  {/* Email */}
                  <div className="bg-purple-100 p-3 rounded-xl md:rounded-2xl border-3 border-black"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(168, 85, 247, 0.1) 5px, rgba(168, 85, 247, 0.1) 10px)'
                    }}>
                    <div className="flex items-center space-x-3">
                      <div className="bg-white rounded-full w-10 h-10 border-3 border-black flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm md:text-base">Email Us</h3>
                        <p className="text-xs md:text-sm">contact@velvetmetal.com</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Phone */}
                  <div className="bg-yellow-100 p-3 rounded-xl md:rounded-2xl border-3 border-black"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(245, 158, 11, 0.1) 5px, rgba(245, 158, 11, 0.1) 10px)'
                    }}>
                    <div className="flex items-center space-x-3">
                      <div className="bg-white rounded-full w-10 h-10 border-3 border-black flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm md:text-base">Call Us</h3>
                        <p className="text-xs md:text-sm">(615) 414-9554</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Location */}
                  <div className="bg-orange-100 p-3 rounded-xl md:rounded-2xl border-3 border-black"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(249, 115, 22, 0.1) 5px, rgba(249, 115, 22, 0.1) 10px)'
                    }}>
                    <div className="flex items-center space-x-3">
                      <div className="bg-white rounded-full w-10 h-10 border-3 border-black flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm md:text-base">Location</h3>
                        <p className="text-xs md:text-sm">Venice, CA</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Contact Form Section */}
                <div className="md:col-span-2">
                  <div className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border-3 border-black h-full relative overflow-hidden"
                    style={{
                      backgroundImage: `
                        radial-gradient(circle at 90% 10%, rgba(168, 85, 247, 0.08) 0%, transparent 60%),
                        radial-gradient(circle at 10% 90%, rgba(245, 158, 11, 0.08) 0%, transparent 60%)
                      `
                    }}>
                    
                    {formSubmitted ? (
                      <motion.div 
                        className="flex flex-col items-center justify-center h-full py-6 md:py-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="bg-green-100 rounded-full w-14 h-14 border-3 border-black flex items-center justify-center mb-3">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold mb-1 font-title">Message Sent!</h2>
                        <p className="text-center text-sm">We'll get back to you soon.</p>
                      </motion.div>
                    ) : (
                      <form className="space-y-3" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="name" className="block text-xs font-bold mb-1 uppercase">
                              Name
                            </label>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              required
                              className="w-full p-2 border-2 border-black rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
                              placeholder="Your name"
                            />
                          </div>
                          <div>
                            <label htmlFor="email" className="block text-xs font-bold mb-1 uppercase">
                              Email
                            </label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              required
                              className="w-full p-2 border-2 border-black rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
                              placeholder="your.email@example.com"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="message" className="block text-xs font-bold mb-1 uppercase">
                            Message
                          </label>
                          <textarea
                            id="message"
                            name="message"
                            rows={3}
                            required
                            className="w-full p-2 border-2 border-black rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
                            placeholder="How can we help you?"
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className={cn(
                              "bg-purple-600 text-white p-2 md:p-3 rounded-lg font-bold text-sm",
                              "border-2 border-black hover:bg-purple-700 transition-colors",
                              "flex items-center justify-center space-x-2 px-5 md:px-6"
                            )}
                          >
                            <span>SEND MESSAGE</span>
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Decorative Elements */}
                        <div className="absolute -left-10 -top-10 w-20 h-20 bg-yellow-100/20 rounded-full border-2 border-black/10"></div>
                        <div className="absolute -right-8 -bottom-8 w-16 h-16 bg-purple-100/20 rounded-full border-2 border-black/10"></div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}