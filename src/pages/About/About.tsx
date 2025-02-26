import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Music, Search, RefreshCw, BarChart3, Layers } from "lucide-react";

export default function About() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen w-full bg-[#F5F0E8] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full" style={{
          backgroundImage: `
            repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(139, 92, 246, 0.1) 20px, rgba(139, 92, 246, 0.1) 40px),
            repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(245, 158, 11, 0.1) 20px, rgba(245, 158, 11, 0.1) 40px)
          `
        }}></div>
      </div>
      
      <div className="relative min-h-screen flex items-center justify-center p-2 sm:p-3 py-4 sm:py-6">
        <motion.div
          className={cn(
            "bg-white rounded-2xl sm:rounded-3xl md:rounded-[40px] border-3 sm:border-4 border-black",
            "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
            "p-4 sm:p-5 md:p-7 max-w-[950px] w-full overflow-y-auto max-h-[90vh]"
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-5">
            <button 
              onClick={() => navigate("/")}
              className="bg-yellow-100 rounded-full w-8 h-8 sm:w-10 sm:h-10 border-2 sm:border-3 border-black flex items-center justify-center hover:bg-yellow-200 transition-colors self-start"
            >
              <ArrowLeft size={16} className="sm:hidden" />
              <ArrowLeft size={20} className="hidden sm:block" />
            </button>
            <motion.h1
              className={cn(
                "text-3xl sm:text-4xl md:text-5xl font-black text-center md:text-right",
                "tracking-tighter uppercase leading-tight"
              )}
              style={{
                fontFamily: "Mondwest",
                fontWeight: 900,
              }}
            >
              About Velvet Metal
            </motion.h1>
            <div className="w-8 sm:w-10 hidden md:block"></div> {/* Empty div for centering */}
          </div>
          
          <div className="space-y-4 sm:space-y-5">
            {/* Intro Section */}
            <div className="bg-gradient-to-r from-purple-100 to-purple-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-3 border-black">
              <p className="text-base sm:text-lg font-medium font-title text-center">
                Finally, a music app that doesn't make your streaming services fight for attention. 
                <span className="hidden md:inline"> Velvet Metal brings all your music together under one roof, no family therapy required.</span>
              </p>
            </div>
            
            {/* What's It All About */}
            <div className="bg-yellow-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-3 border-black">
              <h2 className="text-xl sm:text-2xl font-bold mb-2 font-title">What's It All About?</h2>
              <p className="text-sm sm:text-base font-body">
                Think of it as mission control for your musical universe—where Apple Music and Spotify learn to coexist peacefully, 
                and your playlists don't care where they came from. One unified interface that just works, 
                because your music shouldn't come with boundary issues.
              </p>
            </div>
            
            {/* Current Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-orange-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-3 border-black">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-white w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 sm:border-3 border-black flex items-center justify-center">
                    <Search size={18} className="sm:hidden" />
                    <Search size={20} className="hidden sm:block" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold font-title">Smart Exploration</h2>
                </div>
                <ul className="space-y-1 text-sm sm:text-base">
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span className="font-body">All your favorites in one place</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span className="font-body">Platform-agnostic playlists</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span className="font-body">Search that understands what you're looking for</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span className="font-body">Transfer history tracking</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-purple-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-3 border-black">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-white w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 sm:border-3 border-black flex items-center justify-center">
                    <Music size={18} className="sm:hidden" />
                    <Music size={20} className="hidden sm:block" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold font-title">Connected Services</h2>
                </div>
                <ul className="space-y-2 text-sm sm:text-base">
                  <li className="flex items-center gap-2">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.5 4C10.8 4 9.1 4.6 7.9 5.9C6.7 7.2 6 8.9 6 10.8C6 13.1 7.1 15.2 8.9 16.3C9.3 16.6 9.9 16.5 10.2 16.1C10.5 15.7 10.4 15.1 10 14.8C8.7 14 7.8 12.4 7.8 10.8C7.8 9.4 8.3 8.1 9.2 7.1C10.1 6.1 11.3 5.7 12.6 5.7C15.5 5.7 17.8 8.3 17.8 11.2C17.8 12 17.6 12.8 17.2 13.5C17 13.8 16.7 14 16.4 14C16 14 15.8 13.7 15.8 13.3C15.8 13.2 15.8 13.1 15.8 13C15.9 12.7 15.9 12.4 15.9 12C15.9 10.3 14.5 8.8 12.8 8.8C11.1 8.8 9.7 10.2 9.7 12C9.7 13.8 11.1 15.2 12.8 15.2C13.5 15.2 14.2 15 14.7 14.5C15.2 15.2 16 15.6 16.9 15.5C18.3 15.3 19.4 14 19.5 12.5C19.6 8.5 16.4 5 12.5 4Z" fill="white"/>
                        <path d="M12.8 13.4C12.1 13.4 11.5 12.8 11.5 12C11.5 11.2 12.1 10.6 12.8 10.6C13.5 10.6 14.1 11.2 14.1 12C14.1 12.8 13.5 13.4 12.8 13.4Z" fill="white"/>
                      </svg>
                    </div>
                    <span className="font-body font-medium">Apple Music</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4C7.6 4 4 7.6 4 12C4 16.4 7.6 20 12 20C16.4 20 20 16.4 20 12C20 7.6 16.4 4 12 4ZM15.7 15.5C15.5 15.8 15.1 15.9 14.8 15.7C13.1 14.6 11 14.4 8.6 15C8.3 15.1 7.9 14.9 7.8 14.6C7.7 14.3 7.9 13.9 8.2 13.8C10.9 13.2 13.3 13.4 15.2 14.6C15.6 14.8 15.7 15.2 15.5 15.5ZM16.5 13.2C16.3 13.6 15.8 13.7 15.4 13.5C13.5 12.3 10.7 11.8 8 12.5C7.5 12.6 7 12.3 6.9 11.8C6.8 11.3 7.1 10.8 7.6 10.7C10.7 10 13.9 10.5 16.1 11.9C16.6 12.1 16.7 12.6 16.5 13.2ZM16.6 10.8C14.2 9.5 10.2 9.3 7.5 10C6.9 10.2 6.3 9.8 6.1 9.2C5.9 8.6 6.3 8 6.9 7.8C10 7 14.5 7.3 17.3 8.8C17.8 9.1 18 9.7 17.7 10.3C17.4 10.7 16.8 10.9 16.6 10.8Z" fill="white"/>
                      </svg>
                    </div>
                    <span className="font-body font-medium">Spotify</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Coming Soon */}
            <div className="bg-gradient-to-r from-fuchsia-50 to-sky-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-3 border-black">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 font-title">Coming Soon</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-white w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 sm:border-3 border-black flex items-center justify-center">
                      <BarChart3 size={16} className="sm:hidden" />
                      <BarChart3 size={18} className="hidden sm:block" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold font-title">Enhanced Discovery</h3>
                  </div>
                  <ul className="space-y-1 ml-3 text-sm sm:text-base">
                    <li className="flex items-start">
                      <span className="mr-2 font-bold">•</span>
                      <span className="font-body">Genre filtering</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 font-bold">•</span>
                      <span className="font-body">Mood filtering</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 font-bold">•</span>
                      <span className="font-body">Music graph view</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-white w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 sm:border-3 border-black flex items-center justify-center">
                      <Layers size={16} className="sm:hidden" />
                      <Layers size={18} className="hidden sm:block" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold font-title">Expanding the Family</h3>
                  </div>
                  <ul className="space-y-1 ml-3 text-sm sm:text-base">
                    <li className="flex items-start">
                      <span className="mr-2 font-bold">•</span>
                      <span className="font-body">Tidal, Qobuz, Plex</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 font-bold">•</span>
                      <span className="font-body">YouTube Music, Last.fm</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          
          </div>
        </motion.div>
      </div>
    </div>
  );
}