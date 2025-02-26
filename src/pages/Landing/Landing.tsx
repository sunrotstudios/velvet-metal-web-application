import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Search, Menu, X } from "lucide-react";
import { WeirdDesigns } from "@/styles/abstract-designs";
import "@/styles/fonts.css";
import { useState } from "react";

interface Album {
  name: string;
  artist_name: string;
}

const parseAlbumsFromCSV = async (): Promise<Album[]> => {
  try {
    const response = await fetch("/data/marquee-albums.csv");
    const csvText = await response.text();
    const lines = csvText.split("\n").slice(1);

    return lines
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const columns = line.split(",");
        return {
          name: columns[4]?.replace(/"/g, "").trim() || "",
          artist_name: columns[5]?.replace(/"/g, "").trim() || "",
        };
      })
      .filter((album) => album.name && album.artist_name);
  } catch (error) {
    console.error("Error parsing albums:", error);
    return [];
  }
};

const getRandomAlbums = (albums: Album[], count: number): Album[] => {
  const shuffled = [...albums].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export default function Landing() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: albums = [] } = useQuery<Album[]>({
    queryKey: ["albums"],
    queryFn: parseAlbumsFromCSV,
  });

  const marqueeLines = [...Array(20)].map(() => getRandomAlbums(albums, 15));

  return (
    <div className="min-h-screen w-full bg-[#F5F0E8] relative overflow-x-hidden">
      {/* Background Marquee */}
      <div className="fixed inset-0 opacity-20 overflow-hidden">
        {marqueeLines.map((albumsInLine, i) => (
          <div
            key={i}
            className={cn(
              "whitespace-nowrap text-4xl font-black",
              "animate-marquee-straight",
              i % 2 === 0 ? "text-purple-600" : "text-yellow-600",
              "relative"
            )}
            style={{
              position: "absolute",
              top: `${i * 5}%`,
              width: "200%",
              left: 0,
              animation: `marquee-straight ${25 + i * 0.5}s linear infinite`,
              willChange: "transform",
            }}
          >
            <span className="inline-block">
              {albumsInLine.map((album, index) => (
                <span key={`${i}-${index}`} className="mx-8">
                  {album.name} - {album.artist_name}
                </span>
              ))}
            </span>
            <span className="inline-block">
              {albumsInLine.map((album, index) => (
                <span key={`${i}-${index}-duplicate`} className="mx-8">
                  {album.name} - {album.artist_name}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative min-h-screen flex items-center justify-center p-4 py-8">
        <motion.div
          className={cn(
            "bg-white rounded-[32px] md:rounded-[48px] border-4 md:border-6 border-black",
            "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]",
            "p-5 md:p-8 lg:p-10 max-w-[1200px] w-full overflow-y-auto scrollbar-hide"
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
          <div className="space-y-5 md:space-y-6">
        
            {/* Header Section with Title Moved to Right */}
            <div className="flex items-center justify-between gap-2 md:gap-4">
              {/* Music-Themed Elements on Left - Now visible on mobile too */}
              <div className="flex items-center w-1/3 md:w-1/2">
                {/* Mobile & Desktop Designs */}
                <div className="w-full">
                  <div className="hidden md:block">
                    <WeirdDesigns />
                  </div>
                  <div className="md:hidden">
                    <MobileWeirdDesigns />
                  </div>
                </div>
              </div>
              
              {/* Title Moved to Right */}
              <motion.h1
                className={cn(
                  "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-right w-2/3 md:w-1/2",
                  "tracking-tighter uppercase leading-none"
                )}
                style={{
                  fontFamily: "Mondwest",
                  fontWeight: 700,
                  textShadow: "2px 2px 0px rgba(168, 85, 247, 0.3)",
                }}
              >
                Velvet Metal
              </motion.h1>
            </div>

            {/* Navigation Menu - Mobile Optimized (with buttons in the bar) */}
            <div className="border-2 border-black rounded-full bg-white overflow-hidden">
              <div className="flex items-center justify-between flex-wrap">
                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center pl-4">
                  <button 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                    className="p-2 focus:outline-none"
                    aria-label="Toggle menu"
                  >
                    {mobileMenuOpen ? (
                      <X className="h-5 w-5" />
                    ) : (
                      <Menu className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex space-x-4 px-4 overflow-x-auto">
                  <Link
                    to="/about"
                    className="py-2 font-medium hover:underline whitespace-nowrap font-body"
                  >
                    ABOUT
                  </Link>
                  <Link
                    to="/faq"
                    className="py-2 font-medium hover:underline whitespace-nowrap font-body"
                  >
                    FAQ
                  </Link>
                  <Link
                    to="/team"
                    className="py-2 font-medium hover:underline whitespace-nowrap font-body"
                  >
                    TEAM
                  </Link>
                  <Link
                    to="/contact"
                    className="py-2 font-medium hover:underline whitespace-nowrap font-body"
                  >
                    CONTACT
                  </Link>
                </div>

                {/* Mobile Buttons (Replaced Search) */}
                <div className="md:hidden flex items-center gap-2 py-2 pr-3 pl-3 ml-auto">
                  <button
                    onClick={() => navigate("/register")}
                    className="px-3 py-1.5 bg-purple-100 border-2 border-black rounded-full font-bold text-xs"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(168, 85, 247, 0.1) 3px, rgba(168, 85, 247, 0.1) 6px)'
                    }}
                  >
                    Join
                  </button>
                  <button
                    onClick={() => navigate("/login")}
                    className="px-3 py-1.5 bg-yellow-100 border-2 border-black rounded-full font-bold text-xs"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(245, 158, 11, 0.1) 3px, rgba(245, 158, 11, 0.1) 6px)'
                    }}
                  >
                    Sign In
                  </button>
                </div>
                
                {/* Search Bar - Desktop only now */}
                <div className="hidden md:flex relative items-center pl-2 pr-3 py-2 ml-auto">
                  <div className="flex items-center bg-white border-2 border-black rounded-full overflow-hidden">
                    <Search className="ml-2 h-4 w-4 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="SEARCH"
                      className="py-1 px-2 outline-none w-40 text-sm font-body"
                    />
                  </div>
                </div>
              </div>
            </div>
              
            {/* Mobile Navigation Menu - Fixed animation stutter */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div 
                  className="md:hidden bg-white border-2 border-black rounded-xl shadow-md overflow-hidden z-10 w-full"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    mass: 0.8
                  }}
                >
                  <motion.div 
                    className="flex flex-col py-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Link
                      to="/about"
                      className="py-3 px-6 font-medium hover:bg-gray-100 font-body border-b border-gray-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      ABOUT
                    </Link>
                    <Link
                      to="/faq"
                      className="py-3 px-6 font-medium hover:bg-gray-100 font-body border-b border-gray-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      FAQ
                    </Link>
                    <Link
                      to="/team"
                      className="py-3 px-6 font-medium hover:bg-gray-100 font-body border-b border-gray-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      TEAM
                    </Link>
                    <Link
                      to="/contact"
                      className="py-3 px-6 font-medium hover:bg-gray-100 font-body"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      CONTACT
                    </Link>
                    
                    {/* Search field in mobile menu */}
                    <div className="px-6 py-3 border-t border-gray-200">
                      <div className="flex items-center bg-gray-100 border border-gray-300 rounded-lg overflow-hidden">
                        <Search className="ml-2 h-4 w-4 flex-shrink-0 text-gray-500" />
                        <input
                          type="text"
                          placeholder="SEARCH"
                          className="w-full py-2 px-2 outline-none bg-transparent text-sm font-body"
                        />
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Remove old mobile sign-in/sign-up buttons that were at the top */}

            {/* Random Zigzag Texture Divider */}
            <div className="relative h-3 md:h-4 my-1">
              <svg width="100%" height="100%" viewBox="0 0 1200 24" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <path d="M0 0L50 12L100 0L150 12L200 0L250 12L300 0L350 12L400 0L450 12L500 0L550 12L600 0L650 12L700 0L750 12L800 0L850 12L900 0L950 12L1000 0L1050 12L1100 0L1150 12L1200 0" stroke="black" strokeWidth="2" />
              </svg>
            </div>

            {/* Featured Content Section - Mobile Responsive */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="md:col-span-2">
                <div className="overflow-hidden rounded-2xl md:rounded-3xl border-3 md:border-4 border-black relative h-56 md:h-64">
                  <div className="absolute top-3 md:top-4 left-3 md:left-4 bg-white rounded-full py-1 px-3 md:px-4 border-2 border-black font-medium text-xs md:text-sm">
                    SONG OF THE WEEK
                  </div>
                  <img
                    src="/images/visions-of-you.jpeg"
                    alt="Song cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-white px-4 md:px-6 py-3 md:py-4 border-t-3 md:border-t-4 border-black flex items-center justify-between">
                    <div>
                      <h2 className="text-lg md:text-xl font-bold leading-tight font-title">VISIONS OF YOU</h2>
                      <p className="text-sm md:text-base font-body">By isa Ma</p>
                    </div>
                    <div className="bg-orange-400 rounded-full w-10 h-10 md:w-14 md:h-14 border-3 md:border-4 border-black flex items-center justify-center cursor-pointer transform rotate-45 hover:bg-orange-500 transition-colors flex-shrink-0">
                      <div className="transform -rotate-45 text-lg md:text-xl">→</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-1">
                <div className="border-3 md:border-4 border-black rounded-2xl md:rounded-3xl p-3 md:p-4 bg-purple-100 h-auto md:h-64" style={{
                  backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(168, 85, 247, 0.1) 5px, rgba(168, 85, 247, 0.1) 10px)'
                }}>
                  <div className="flex items-center mb-2">
                    <div className="w-7 h-7 md:w-8 md:h-8 mr-2">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9 19C4.58172 19 1 15.4183 1 11C1 6.58172 4.58172 3 9 3C13.4183 3 17 6.58172 17 11C17 15.4183 13.4183 19 9 19Z"
                          stroke="black"
                          strokeWidth="2"
                          fill="#FCD34D"
                        />
                        <path d="M15 15L23 23" stroke="black" strokeWidth="2" />
                      </svg>
                    </div>
                    <h2 className="text-base md:text-lg font-bold font-title">
                      SUBMIT SONG OF THE WEEK
                    </h2>
                  </div>
                  <div className="border-t-2 border-black pt-2">
                    <p className="mb-3 md:mb-4 text-sm md:text-base font-body text-center">
                      HAVE A NEW SONG YOU'RE PROUD OF? SUBMIT YOUR SONG 
                      RECOMMENDATION AND IT MIGHT BE FEATURED AS OUR SONG OF 
                      THE WEEK!
                    </p>
                    <div className="flex justify-center mt-2 md:mt-3">
                      <button className="bg-yellow-300 border-3 md:border-4 border-black rounded-lg py-1.5 md:py-2 px-3 md:px-4 font-title font-bold text-sm md:text-base hover:bg-yellow-400 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-none active:translate-x-0 active:translate-y-0 transition-all">
                        SUBMIT A SONG
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action with Enhanced Texture */}
            <div 
              className="bg-purple-600 py-4 md:py-5 px-4 md:px-6 rounded-xl md:rounded-2xl text-center relative overflow-hidden border-3 md:border-4 border-black"
              style={{
                boxShadow: "inset 0 0 20px rgba(0,0,0,0.3)"
              }}
            >
              {/* Enhanced Overlay Pattern */}
              <div className="absolute inset-0" 
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(255, 255, 255, 0.5) 8px, rgba(255, 255, 255, 0.5) 10px),
                    repeating-linear-gradient(90deg, transparent, transparent 12px, rgba(255, 255, 255, 0.3) 12px, rgba(255, 255, 255, 0.3) 14px),
                    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 50%),
                    radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.4) 0%, transparent 50%)
                  `,
                  mixBlendMode: 'overlay'
                }}>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tighter font-title">
                  All Great Music Collections Begin When You Find Yourself In
                  Someone Else
                </h2>
                <div className="mt-3 md:mt-4 flex justify-center">
                  <button
                    onClick={() => navigate("/register")}
                    className="bg-black text-white px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-bold text-base md:text-lg border-2 md:border-3 border-white
                      hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)]
                      hover:translate-x-[-2px] hover:translate-y-[-2px]
                      active:shadow-none active:translate-x-0 active:translate-y-0
                      transition-all"
                  >
                    JOIN COMMUNITY
                  </button>
                </div>
              </div>
            </div>

            {/* Sign-in/Sign-up Buttons - Desktop only (hidden on mobile) */}
            <div className="hidden md:flex md:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/register")}
                className={cn(
                  "px-8 py-4 bg-purple-100 border-4 border-black rounded-xl font-bold transition-all w-auto font-body",
                  "hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                  "hover:translate-x-[-2px] hover:translate-y-[-2px]",
                  "active:shadow-none active:translate-x-0 active:translate-y-0",
                  "text-xl"
                )}
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(168, 85, 247, 0.1) 5px, rgba(168, 85, 247, 0.1) 10px)'
                }}
              >
                Get Started
              </button>
              <button
                onClick={() => navigate("/login")}
                className={cn(
                  "px-8 py-4 bg-yellow-100 border-4 border-black rounded-xl font-bold transition-all w-auto font-body",
                  "hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                  "hover:translate-x-[-2px] hover:translate-y-[-2px]",
                  "active:shadow-none active:translate-x-0 active:translate-y-0",
                  "text-xl"
                )}
                style={{
                  backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(245, 158, 11, 0.1) 5px, rgba(245, 158, 11, 0.1) 10px)'
                }}
              >
                Sign In
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Mobile version of the WeirdDesigns component
const MobileWeirdDesigns = () => {
  return (
    <div className="w-full flex items-center justify-center">
      <svg width="100%" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        {/* Design 1: Concentric circles with dots - Simplified for mobile */}
        <g transform="translate(5, 0) scale(0.5)">
          <circle cx="40" cy="40" r="30" stroke="black" strokeWidth="2.5" fill="#f0e9d6" />
          <circle cx="40" cy="40" r="20" stroke="black" strokeWidth="2" fill="#ead193" />
          <circle cx="40" cy="40" r="10" stroke="black" strokeWidth="1.75" fill="black" />
          <circle cx="40" cy="40" r="4" fill="white" />
        </g>
        
        {/* Design 2: Musical symbol - Simplified for mobile */}
        <g transform="translate(60, 0) scale(0.5)">
          <circle cx="40" cy="40" r="30" stroke="black" strokeWidth="2.5" fill="#c084fc" />
          <line x1="40" y1="10" x2="40" y2="70" stroke="black" strokeWidth="3" />
          <line x1="10" y1="40" x2="70" y2="40" stroke="black" strokeWidth="3" />
        </g>
      </svg>
    </div>
  );
};