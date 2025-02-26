import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Music } from "lucide-react";
import { WeirdDesigns, MobileIcon } from "@/styles/abstract-designs";
import "@/styles/fonts.css";

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



  const { data: albums = [] } = useQuery<Album[]>({
    queryKey: ["albums"],
    queryFn: parseAlbumsFromCSV,
  });

  const marqueeLines = [...Array(20)].map(() => getRandomAlbums(albums, 15));

  return (
    <div className="min-h-[100dvh] w-full relative overflow-hidden">

      {/* Background Marquee - Reduced opacity and size for mobile */}
      <div className="fixed inset-0 opacity-10 md:opacity-20 overflow-hidden pointer-events-none">
        {marqueeLines.map((albumsInLine, i) => (
          <div
            key={i}
            className={cn(
              "whitespace-nowrap text-2xl md:text-4xl font-black",
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

      {/* Main Content - Adjusted padding and centering for mobile */}
      <div className="relative z-10 min-h-[100dvh] flex flex-col">
        <motion.div
          className={cn(
            "bg-white rounded-[24px] md:rounded-[48px] border-3 md:border-6 border-black",
            "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]",
            "p-4 md:p-8 lg:p-10 max-w-[1200px] w-[92%] md:w-[90%] mx-auto my-auto relative",
            
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
          <div className="space-y-3 md:space-y-6">
            {/* Header Section - Compact for mobile */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center w-1/3 md:w-1/2">
                <div className="w-full">
                  <div className="hidden md:block">
                    <WeirdDesigns />
                  </div>
                  <div className="flex md:hidden items-center justify-start">
                    <div className="w-full h-12 flex items-center px-2">
                      <MobileIcon />
                    </div>
                  </div>
                </div>
              </div>

              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-right w-2/3 md:w-1/2"
                style={{
                  fontFamily: "Mondwest",
                  textShadow: "3px 3px 0px rgba(168, 85, 247, 0.3)",
                }}
              >
                Velvet Metal
              </motion.h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
              {/* Navigation Bar - Hidden on mobile, visible on desktop */}
              <div className="hidden md:block md:col-span-2">
                <div className="border-2 border-black rounded-full bg-white overflow-hidden">
                  <div className="flex items-center justify-between h-12 w-full px-8">
                    <div className="flex items-center justify-start gap-0">
                      <Link to="/about" className="py-2 text-base font-medium font-body mr-10 relative group hover:line-through decoration-2">
                        ABOUT
                      </Link>
                      <Link to="/faq" className="py-2 text-base font-medium font-body mr-10 relative group hover:line-through decoration-2">
                        FAQ
                      </Link>
                      <Link to="/team" className="py-2 text-base font-medium font-body mr-10 relative group hover:line-through decoration-2">
                        TEAM
                      </Link>
                      <Link to="/contact" className="py-2 text-base font-medium font-body relative group hover:line-through decoration-2">
                        CONTACT
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Action Buttons - Aligned with title width */}
              <div className="hidden md:flex items-center justify-center gap-4">
                <button
                  onClick={() => navigate("/register")}
                  className="w-40 px-6 py-3 bg-purple-100 border-4 border-black rounded-lg font-bold text-base transition-all font-body shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-3px] hover:translate-y-[-3px] whitespace-nowrap"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(168, 85, 247, 0.1) 5px, rgba(168, 85, 247, 0.1) 10px)'
                  }}
                >
                  GET STARTED
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="w-40 px-6 py-3 bg-yellow-100 border-4 border-black rounded-lg font-bold text-base transition-all font-body shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-3px] hover:translate-y-[-3px] whitespace-nowrap"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(245, 158, 11, 0.1) 5px, rgba(245, 158, 11, 0.1) 10px)'
                  }}
                >
                  SIGN IN
                </button>
              </div>
            </div>


            {/* Mobile navigation now directly in the pill above */}

            {/* Mobile Action Buttons - Moved to top of content */}
            <div className="md:hidden grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate("/register")}
                className="px-3 py-2 bg-purple-100 border-4 border-black rounded-lg font-bold text-sm transition-all font-body shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(168, 85, 247, 0.1) 5px, rgba(168, 85, 247, 0.1) 10px)'
                }}
              >
                GET STARTED
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-3 py-2 bg-yellow-100 border-4 border-black rounded-lg font-bold text-sm transition-all font-body shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                style={{
                  backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(245, 158, 11, 0.1) 5px, rgba(245, 158, 11, 0.1) 10px)'
                }}
              >
                SIGN IN
              </button>
            </div>

            {/* Divider - Reduced height for mobile */}
            <div className="relative h-2 md:h-4 my-1">
              <svg width="100%" height="100%" viewBox="0 0 1200 24" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <path d="M0 0L50 12L100 0L150 12L200 0L250 12L300 0L350 12L400 0L450 12L500 0L550 12L600 0L650 12L700 0L750 12L800 0L850 12L900 0L950 12L1000 0L1050 12L1100 0L1150 12L1200 0" stroke="black" strokeWidth="2" />
              </svg>
            </div>

           {/* Featured Content Section - Optimized for mobile */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6">
  <div className="md:col-span-2">
    <div className="overflow-hidden rounded-xl md:rounded-3xl border-2 md:border-4 border-black relative h-40 md:h-64">
      <div className="absolute top-1 md:top-4 left-1 md:left-4 bg-white rounded-full py-0.5 px-2 md:py-1 md:px-3 border-2 md:border-4 border-black font-medium text-[10px] md:text-xs z-10">
        SONG OF THE WEEK
      </div>
      <img
        src="/images/visions-of-you.jpeg"
        alt="Song cover"
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-white px-2 md:px-6 py-1.5 md:py-4 border-t-2 md:border-t-4 border-black flex items-center justify-between">
        <div>
          <h2 className="text-sm md:text-xl font-bold leading-tight font-title">VISIONS OF YOU</h2>
          <p className="text-xs md:text-base font-body">By Isa Ma</p>
        </div>
        <div className="bg-orange-400 rounded-full w-8 h-8 md:w-14 md:h-14 border-2 md:border-4 border-black flex items-center justify-center cursor-pointer transform rotate-45 hover:bg-orange-500 transition-colors">
          <div className="transform -rotate-45 text-base md:text-xl">→</div>
        </div>
      </div>
    </div>
  </div>

  <div className="md:col-span-1">
    <div className="border-2 md:border-4 border-black rounded-xl md:rounded-3xl p-2 md:p-4 bg-purple-100 h-auto min-h-[160px] md:h-64 relative" style={{
      backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(168, 85, 247, 0.1) 5px, rgba(168, 85, 247, 0.1) 10px)'
    }}>
      <div className="flex items-center mb-1 md:mb-2">
        <div className="w-5 h-5 md:w-8 md:h-8 mr-1 md:mr-2">
          <Music className="w-full h-full" />
        </div>
        <h2 className="text-xs md:text-lg font-bold font-title">
          SUBMIT YOUR SONG
        </h2>
      </div>
      <div className="border-t-2 border-black pt-1 md:pt-2">
        {/* Mobile version with compact bullet list */}
        <div className="md:hidden mb-2">
         
          <ul className="space-y-1 text-left pl-1.5">
            {[
              "Original music",
              "MP3/WAV format",
              "Weekly selection"
            ].map((item, index) => (
              <li key={index} className="flex items-start">
                <div className="w-3 h-3 mt-0.5 mr-1.5 bg-black border-1.5 border-black rounded-sm flex-shrink-0"></div>
                <span className="text-[12px] font-bold">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Desktop version with bullet list */}
        <div className="hidden md:block mb-3">
          <ul className="space-y-1.5 text-left pl-2">
            {[
              "Original music only",
              "MP3 or WAV format",
              "Include your artist bio",
              "Selected weekly by our team"
            ].map((item, index) => (
              <li key={index} className="flex items-start">
                <div className="w-4 h-4 mt-0.5 mr-2 bg-black border-2 border-black rounded-sm flex-shrink-0"></div>
                <span className="text-sm font-bold">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="md:absolute md:bottom-4 md:left-4 md:right-4">
          <button className="w-full bg-yellow-300 border-2 md:border-4 border-black rounded-lg py-1 md:py-2 px-2 md:px-3 font-title font-bold text-xs md:text-base shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] md:hover:translate-x-[-2px] md:hover:translate-y-[-2px] transition-all">
            LET'S HEAR IT
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

{/* Call to Action - More compact for mobile */}
<div className="bg-purple-600 py-3.5 md:py-5 px-2 md:px-6 rounded-lg md:rounded-2xl text-center relative overflow-hidden border-2 md:border-4 border-black">
  <div className="absolute inset-0" style={{
    backgroundImage: `
      repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(255, 255, 255, 0.5) 8px, rgba(255, 255, 255, 0.5) 10px),
      repeating-linear-gradient(90deg, transparent, transparent 12px, rgba(255, 255, 255, 0.3) 12px, rgba(255, 255, 255, 0.3) 14px)
    `,
    mixBlendMode: 'overlay'
  }}></div>
  
  <div className="relative z-10">
    <h2 className="text-base sm:text-xl md:text-4xl font-black text-white uppercase tracking-tighter font-title leading-tight mb-3 md:mb-4">
      All Great Music Collections Begin When You Hear Yourself In Another
    </h2>
    <button
      className="bg-black text-white px-4 md:px-6 py-2 md:py-3 rounded-md md:rounded-xl font-bold text-xs md:text-lg border-2 md:border-4 border-white hover:opacity-90 transition-opacity"
    >
      JOIN COMMUNITY
    </button>
  </div>
</div>

            {/* Desktop Action Buttons - Already moved to header */}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// // Simplified Mobile WeirdDesigns
// const MobileWeirdDesigns = () => {
//   return (
//     <div className="w-full flex items-center">
//       <svg width="100%" height="32" viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg">
//         <g transform="translate(5, 2) scale(0.6)">
//           <rect x="18" y="5" width="4" height="35" rx="1" fill="black" />
//           <ellipse cx="20" cy="40" rx="10" ry="7" fill="black" />
//           <circle cx="28" cy="10" r="8" stroke="black" strokeWidth="3" fill="#f0e9d6" />
//         </g>
//         <g transform="translate(45, 2) scale(0.6)">
//           <circle cx="25" cy="25" r="20" stroke="black" strokeWidth="2" fill="#c084fc" />
//           <circle cx="25" cy="25" r="10" stroke="black" strokeWidth="1.5" fill="black" />
//           <circle cx="25" cy="25" r="3" fill="white" />
//         </g>
//       </svg>
//     </div>
//   );
// };