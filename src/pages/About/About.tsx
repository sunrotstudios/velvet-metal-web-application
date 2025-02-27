import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Music, Search, RefreshCw, BarChart3, Layers } from "lucide-react";

export default function About() {
  const navigate = useNavigate();
  
  const TRANSLATIONS = [
    "About Velvet Metal", // English
    "벨벳 메탈 소개", // Korean
    "ベルベットメタルについて", // Japanese
    "關於絲絨金屬", // Chinese (Traditional)
    "À propos de Métal Velours", // French
    "О Бархатном металле", // Russian
    "Informazioni su Metallo Velluto", // Italian
    "Acerca de Terciopelo Metálico", // Spanish
    "Über Samt Metall", // German
    "حول معدن المخمل", // Arabic
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
              "p-5 md:p-8 max-w-[1400px] w-[96%] md:w-[94%] mx-auto my-auto relative"
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
            <div className="space-y-4 md:space-y-6">
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
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-right w-4/5"
                  style={{
                    fontFamily: "Mondwest",
                    textShadow: "3px 3px 0px rgba(168, 85, 247, 0.3)",
                  }}
                >
                  About Velvet Metal
                </motion.h1>
              </div>

              {/* Divider */}
              <div className="relative h-2 md:h-3 my-0.5">
                <svg width="100%" height="100%" viewBox="0 0 1200 24" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                  <path d="M0 0L50 12L100 0L150 12L200 0L250 12L300 0L350 12L400 0L450 12L500 0L550 12L600 0L650 12L700 0L750 12L800 0L850 12L900 0L950 12L1000 0L1050 12L1100 0L1150 12L1200 0" stroke="black" strokeWidth="2" />
                </svg>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
                {/* Intro Section */}
                <div className="lg:col-span-3 bg-gradient-to-r from-purple-100 to-purple-50 p-3 md:p-5 rounded-xl md:rounded-3xl border-3 md:border-4 border-black">
                  <p className="text-base md:text-xl font-medium font-title text-center px-2 md:px-4">
                    Finally, a music app that doesn't make your streaming services fight for attention. 
                    Velvet Metal brings all your music together under one roof, no family therapy required.
                  </p>
                </div>
                
                {/* What's It All About */}
                <div className="lg:col-span-1 bg-yellow-100 p-3 md:p-5 rounded-xl md:rounded-3xl border-3 md:border-4 border-black h-full"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(245, 158, 11, 0.1) 5px, rgba(245, 158, 11, 0.1) 10px)'
                  }}>
                  <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-3 font-title">What's It All About?</h2>
                  <p className="text-sm md:text-base font-body">
                    Think of it as mission control for your musical universe—where Apple Music and Spotify learn to coexist peacefully, 
                    and your playlists don't care where they came from. One unified interface that just works, 
                    because your music shouldn't come with boundary issues.
                  </p>
                </div>
                
                {/* Features Grid - 2 columns in layout */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  {/* Smart Exploration */}
                  <div className="bg-purple-100 p-3 md:p-5 rounded-xl md:rounded-3xl border-3 md:border-4 border-black h-full"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(168, 85, 247, 0.1) 5px, rgba(168, 85, 247, 0.1) 10px)'
                    }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-white w-10 h-10 rounded-full border-3 border-black flex items-center justify-center">
                        <Search size={18} />
                      </div>
                      <h2 className="text-base md:text-lg font-bold font-title">Smart Exploration</h2>
                    </div>
                    <ul className="space-y-1 pl-2">
                      {[
                        "All your favorites in one place",
                        "Platform-agnostic playlists",
                        "Search that understands what you're looking for",
                        "Transfer history that keeps the receipts"
                      ].map((item, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-3 h-3 mt-1 mr-2 bg-black rounded-sm flex-shrink-0"></div>
                          <span className="text-sm md:text-base font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Connected Services */}
                  <div className="bg-orange-100 p-3 md:p-5 rounded-xl md:rounded-3xl border-3 md:border-4 border-black h-full"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(249, 115, 22, 0.1) 5px, rgba(249, 115, 22, 0.1) 10px)'
                    }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-white w-10 h-10 rounded-full border-3 border-black flex items-center justify-center">
                        <Music size={18} />
                      </div>
                      <h2 className="text-base md:text-lg font-bold font-title">Connected Services</h2>
                    </div>
                    <ul className="space-y-2 pl-1">
                      <li className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.5 4C10.8 4 9.1 4.6 7.9 5.9C6.7 7.2 6 8.9 6 10.8C6 13.1 7.1 15.2 8.9 16.3C9.3 16.6 9.9 16.5 10.2 16.1C10.5 15.7 10.4 15.1 10 14.8C8.7 14 7.8 12.4 7.8 10.8C7.8 9.4 8.3 8.1 9.2 7.1C10.1 6.1 11.3 5.7 12.6 5.7C15.5 5.7 17.8 8.3 17.8 11.2C17.8 12 17.6 12.8 17.2 13.5C17 13.8 16.7 14 16.4 14C16 14 15.8 13.7 15.8 13.3C15.8 13.2 15.8 13.1 15.8 13C15.9 12.7 15.9 12.4 15.9 12C15.9 10.3 14.5 8.8 12.8 8.8C11.1 8.8 9.7 10.2 9.7 12C9.7 13.8 11.1 15.2 12.8 15.2C13.5 15.2 14.2 15 14.7 14.5C15.2 15.2 16 15.6 16.9 15.5C18.3 15.3 19.4 14 19.5 12.5C19.6 8.5 16.4 5 12.5 4Z" fill="white"/>
                            <path d="M12.8 13.4C12.1 13.4 11.5 12.8 11.5 12C11.5 11.2 12.1 10.6 12.8 10.6C13.5 10.6 14.1 11.2 14.1 12C14.1 12.8 13.5 13.4 12.8 13.4Z" fill="white"/>
                          </svg>
                        </div>
                        <span className="text-sm md:text-base font-medium">Apple Music</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4C7.6 4 4 7.6 4 12C4 16.4 7.6 20 12 20C16.4 20 20 16.4 20 12C20 7.6 16.4 4 12 4ZM15.7 15.5C15.5 15.8 15.1 15.9 14.8 15.7C13.1 14.6 11 14.4 8.6 15C8.3 15.1 7.9 14.9 7.8 14.6C7.7 14.3 7.9 13.9 8.2 13.8C10.9 13.2 13.3 13.4 15.2 14.6C15.6 14.8 15.7 15.2 15.5 15.5ZM16.5 13.2C16.3 13.6 15.8 13.7 15.4 13.5C13.5 12.3 10.7 11.8 8 12.5C7.5 12.6 7 12.3 6.9 11.8C6.8 11.3 7.1 10.8 7.6 10.7C10.7 10 13.9 10.5 16.1 11.9C16.6 12.1 16.7 12.6 16.5 13.2ZM16.6 10.8C14.2 9.5 10.2 9.3 7.5 10C6.9 10.2 6.3 9.8 6.1 9.2C5.9 8.6 6.3 8 6.9 7.8C10 7 14.5 7.3 17.3 8.8C17.8 9.1 18 9.7 17.7 10.3C17.4 10.7 16.8 10.9 16.6 10.8Z" fill="white"/>
                          </svg>
                        </div>
                        <span className="text-sm md:text-base font-medium">Spotify</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Coming Soon */}
              <div className="bg-purple-600 py-3 md:py-4 px-3 md:px-6 rounded-xl md:rounded-3xl text-center relative overflow-hidden border-3 md:border-4 border-black">
                <div className="absolute inset-0" style={{
                  backgroundImage: `
                    repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(255, 255, 255, 0.5) 8px, rgba(255, 255, 255, 0.5) 10px),
                    repeating-linear-gradient(90deg, transparent, transparent 12px, rgba(255, 255, 255, 0.3) 12px, rgba(255, 255, 255, 0.3) 14px)
                  `,
                  mixBlendMode: 'overlay'
                }}></div>

                <div className="relative z-10">
                  <h2 className="text-lg md:text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter font-title leading-tight mb-3 md:mb-4">
                    Coming Soon
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-3 md:gap-4 text-white">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-white/20 w-8 h-8 rounded-full border-2 border-white/70 flex items-center justify-center">
                          <BarChart3 size={16} className="text-white" />
                        </div>
                        <h3 className="text-base md:text-lg font-bold font-title">Enhanced Discovery</h3>
                      </div>
                      <ul className="space-y-1 pl-2">
                        {[
                          "Genre filtering",
                          "Mood filtering",
                          "Music graph view"
                        ].map((item, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-2.5 h-2.5 mt-1 mr-2 bg-white/70 rounded-sm flex-shrink-0"></div>
                            <span className="text-xs md:text-sm font-medium">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-white/20 w-8 h-8 rounded-full border-2 border-white/70 flex items-center justify-center">
                          <Layers size={16} className="text-white" />
                        </div>
                        <h3 className="text-base md:text-lg font-bold font-title">Expanding the Family</h3>
                      </div>
                      <ul className="space-y-1 pl-2">
                        {[
                          "Tidal, Qobuz, Plex",
                          "YouTube Music, Last.fm"
                        ].map((item, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-2.5 h-2.5 mt-1 mr-2 bg-white/70 rounded-sm flex-shrink-0"></div>
                            <span className="text-xs md:text-sm font-medium">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
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