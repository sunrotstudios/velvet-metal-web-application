import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Github, Twitter, Linkedin } from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image?: string;
  color: string;
  pattern: string;
  socials: {
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export default function Team() {
  const navigate = useNavigate();
  
  const TRANSLATIONS = [
    "Our Team", // English
    "우리 팀", // Korean
    "私たちのチーム", // Japanese
    "我們的團隊", // Chinese (Traditional)
    "Notre Équipe", // French
    "Наша Команда", // Russian
    "Il Nostro Team", // Italian
    "Nuestro Equipo", // Spanish
    "Unser Team", // German
    "فريقنا", // Arabic
  ];
  
  const team: TeamMember[] = [
    {
      name: "Brennan Pollock",
      role: "Founder & Lead Engineer",
      bio: "Music nerd, artist, and software engineer with a passion for music discovery.",
      color: "bg-purple-100",
      pattern: "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(168, 85, 247, 0.1) 5px, rgba(168, 85, 247, 0.1) 10px)",
      socials: {
        github: "https://github.com/brennankapollock",
        twitter: "https://twitter.com/velvetmetalapp",
        linkedin: "https://linkedin.com/in/brennanpollock"
      }
    },
    {
      name: "Sarah Chen",
      role: "Lead Developer",
      bio: "Full-stack developer specialized in music streaming APIs and data synchronization.",
      color: "bg-yellow-100",
      pattern: "repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(245, 158, 11, 0.1) 5px, rgba(245, 158, 11, 0.1) 10px)",
      socials: {
        github: "https://github.com/sarahchen",
        linkedin: "https://linkedin.com/in/sarahchen"
      }
    },
    {
      name: "Marcus Rodriguez",
      role: "Product Designer",
      bio: "UX/UI designer focused on creating intuitive music management experiences.",
      color: "bg-orange-100",
      pattern: "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(249, 115, 22, 0.1) 5px, rgba(249, 115, 22, 0.1) 10px)",
      socials: {
        twitter: "https://twitter.com/marcusrodriguez",
        linkedin: "https://linkedin.com/in/marcusrodriguez"
      }
    },
    {
      name: "Jamie Kim",
      role: "Music Data Specialist",
      bio: "Music metadata expert with a background in library science and digital archiving.",
      color: "bg-green-100",
      pattern: "repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(74, 222, 128, 0.1) 5px, rgba(74, 222, 128, 0.1) 10px)",
      socials: {
        linkedin: "https://linkedin.com/in/jamiekim"
      }
    }
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
                  Our Team
                </motion.h1>
              </div>

              {/* Divider */}
              <div className="relative h-2 md:h-3 my-0.5">
                <svg width="100%" height="100%" viewBox="0 0 1200 24" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                  <path d="M0 0L50 12L100 0L150 12L200 0L250 12L300 0L350 12L400 0L450 12L500 0L550 12L600 0L650 12L700 0L750 12L800 0L850 12L900 0L950 12L1000 0L1050 12L1100 0L1150 12L1200 0" stroke="black" strokeWidth="2" />
                </svg>
              </div>

              {/* Team Intro */}
              <div className="md:col-span-3">
                <div className="bg-gradient-to-r from-purple-100 to-purple-50 p-3 md:p-4 rounded-xl md:rounded-2xl border-3 border-black">
                  <p className="text-sm md:text-base font-medium font-title text-center">
                    Meet the passionate people behind Velvet Metal, working to build the ultimate music management experience.
                  </p>
                </div>
              </div>
              
              {/* Team Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {team.map((member, index) => (
                  <motion.div 
                    key={index} 
                    className={cn(
                      "border-3 border-black rounded-xl md:rounded-2xl overflow-hidden",
                      member.color
                    )}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: index * 0.1 + 0.2 }
                    }}
                    style={{
                      backgroundImage: member.pattern
                    }}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg md:text-xl font-bold">{member.name}</h2>
                        <div className="flex space-x-2">
                          {member.socials.github && (
                            <a 
                              href={member.socials.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-white rounded-full w-8 h-8 border-2 border-black flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                              <Github size={15} />
                            </a>
                          )}
                          {member.socials.twitter && (
                            <a 
                              href={member.socials.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-white rounded-full w-8 h-8 border-2 border-black flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                              <Twitter size={15} />
                            </a>
                          )}
                          {member.socials.linkedin && (
                            <a 
                              href={member.socials.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-white rounded-full w-8 h-8 border-2 border-black flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                              <Linkedin size={15} />
                            </a>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-black text-white inline-block px-2 py-1 rounded-full text-xs font-medium mb-3">
                        {member.role}
                      </div>
                      
                      <p className="text-sm md:text-base">{member.bio}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Call to Action */}
              <div className="bg-purple-600 p-3 md:p-4 rounded-xl md:rounded-2xl text-center relative overflow-hidden border-3 border-black">
                <div className="absolute inset-0" style={{
                  backgroundImage: `
                    repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(255, 255, 255, 0.5) 8px, rgba(255, 255, 255, 0.5) 10px),
                    repeating-linear-gradient(90deg, transparent, transparent 12px, rgba(255, 255, 255, 0.3) 12px, rgba(255, 255, 255, 0.3) 14px)
                  `,
                  mixBlendMode: 'overlay'
                }}></div>

                <div className="relative z-10">
                  <h2 className="text-lg md:text-xl font-bold text-white mb-1">Want to Join Our Team?</h2>
                  <p className="text-xs md:text-sm text-white/90 mb-3">We're always looking for passionate people to help build the future of music.</p>
                  <a 
                    href="mailto:careers@velvetmetal.com"
                    className="inline-block bg-white text-purple-600 px-4 py-2 rounded-lg font-bold text-sm border-2 border-black hover:bg-gray-100 transition-colors"
                  >
                    Get in Touch
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}