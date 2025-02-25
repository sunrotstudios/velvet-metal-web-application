import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { WeirdDesigns } from "@/styles/abstract-designs";
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
    <div className="min-h-screen w-full bg-[#F5F0E8] relative overflow-hidden">
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
            "bg-white rounded-[48px] border-6 border-black",
            "shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]",
            "p-8 md:p-10 max-w-[1200px] w-full overflow-y-auto"
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
          <div className="space-y-6">
        
            {/* Header Section with Title Moved to Right */}
            <div className="flex items-center justify-between gap-4">
              {/* Music-Themed Elements on Left */}
              <div className="flex items-center w-1/2">
                {/* Speaker/Waveform */}
                <div className="hidden md:block md:w-full">
                  <WeirdDesigns />
                </div>
              </div>
              
              {/* Title Moved to Right */}
              <motion.h1
                className={cn(
                  "text-4xl sm:text-5xl md:text-6xl font-black text-right w-1/2",
                  "tracking-tighter uppercase leading-none"
                )}
                style={{
                  fontFamily: "Mondwest",
                  fontWeight: 700,
                  textShadow: "4px 4px 0px rgba(168, 85, 247, 0.3)",
                }}
              >
                Velvet Metal
              </motion.h1>
            </div>

            {/* Navigation Menu - Similar to Storyteller Design */}
            <div className="border-2 border-black rounded-full overflow-hidden">
              <div className="flex items-center justify-between flex-wrap">
                <div className="flex space-x-4 px-4 overflow-x-auto">
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
                <div className="relative flex items-center pr-4 py-2">
                  <div className="flex items-center bg-white border-2 border-black rounded-full overflow-hidden">
                    <Search className="ml-2 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="SEARCH FOR MUSIC"
                      className="py-1 px-2 outline-none w-40 text-sm font-body"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Random Zigzag Texture Divider */}
            <div className="relative h-4 my-1">
              <svg width="100%" height="100%" viewBox="0 0 1200 24" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <path d="M0 0L50 12L100 0L150 12L200 0L250 12L300 0L350 12L400 0L450 12L500 0L550 12L600 0L650 12L700 0L750 12L800 0L850 12L900 0L950 12L1000 0L1050 12L1100 0L1150 12L1200 0" stroke="black" strokeWidth="2" />
              </svg>
            </div>

            {/* Featured Content Section - Reduced Heights */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="overflow-hidden rounded-3xl border-4 border-black relative h-64">
                  <div className="absolute top-4 left-4 bg-white rounded-full py-1 px-4 border-2 border-black font-medium text-sm">
                    SONG OF THE WEEK
                  </div>
                  <img
                    src="/images/visions-of-you.jpeg"
                    alt="Song cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-white px-6 py-4 border-t-4 border-black flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold leading-tight font-title">VISIONS OF YOU</h2>
                      <p className="text-base font-body">By isa Ma</p>
                    </div>
                    <div className="bg-orange-400 rounded-full w-14 h-14 border-4 border-black flex items-center justify-center cursor-pointer transform rotate-45 hover:bg-orange-500 transition-colors flex-shrink-0">
                      <div className="transform -rotate-45 text-xl">→</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-1">
                <div className="border-4 border-black rounded-3xl p-4 bg-purple-100 h-64" style={{
                  backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(168, 85, 247, 0.1) 5px, rgba(168, 85, 247, 0.1) 10px)'
                }}>
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 mr-2">
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
                    <h2 className="text-lg font-bold font-title">
                      SUBMIT SONG OF THE WEEK
                    </h2>
                  </div>
                  <div className="border-t-2 border-black pt-2">
                    <p className="mb-4 text-base font-body text-center">
                      THINK YOU'VE FOUND THE NEXT BIG HIT? SUBMIT YOUR SONG 
                      RECOMMENDATION AND IT MIGHT BE FEATURED AS OUR SONG OF 
                      THE WEEK!
                    </p>
                    <div className="flex justify-center mt-3">
                      <button className="bg-yellow-300 border-4 border-black rounded-lg py-2 px-4 font-title font-bold text-base hover:bg-yellow-400 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-none active:translate-x-0 active:translate-y-0 transition-all">
                        SUBMIT A SONG
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action with Enhanced Texture */}
            <div 
              className="bg-purple-600 py-5 px-6 rounded-2xl text-center relative overflow-hidden border-4 border-black"
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
                <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter font-title">
                  All Great Music Collections Begin When You Find Yourself In
                  Someone Else
                </h2>
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => navigate("/register")}
                    className="bg-black text-white px-6 py-3 rounded-xl font-bold text-lg border-3 border-white
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

            {/* Sign-in/Sign-up Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/register")}
                className={cn(
                  "px-8 py-4 bg-purple-100 border-4 border-black rounded-xl font-bold transition-all w-full sm:w-auto font-body",
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
                  "px-8 py-4 bg-yellow-100 border-4 border-black rounded-xl font-bold transition-all w-full sm:w-auto font-body",
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