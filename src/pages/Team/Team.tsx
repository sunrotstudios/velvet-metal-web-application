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
  socials: {
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export default function Team() {
  const navigate = useNavigate();
  
  const team: TeamMember[] = [
    {
      name: "Alex Johnson",
      role: "Founder & CEO",
      bio: "Music enthusiast and tech innovator with 10+ years in software development.",
      color: "bg-purple-100",
      socials: {
        github: "https://github.com/alexjohnson",
        twitter: "https://twitter.com/alexjohnson",
        linkedin: "https://linkedin.com/in/alexjohnson"
      }
    },
    {
      name: "Sarah Chen",
      role: "Lead Developer",
      bio: "Full-stack developer specialized in music streaming APIs and data synchronization.",
      color: "bg-yellow-100",
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
      socials: {
        linkedin: "https://linkedin.com/in/jamiekim"
      }
    }
  ];

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
              Our Team
            </motion.h1>
            <div className="w-10"></div> {/* Empty div for centering */}
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {team.map((member, index) => (
              <motion.div 
                key={index} 
                className={cn(
                  "border-4 border-black rounded-3xl overflow-hidden",
                  member.color
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: index * 0.1 }
                }}
              >
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-1">{member.name}</h2>
                  <div className="bg-black text-white inline-block px-3 py-1 rounded-full text-sm font-medium mb-4">
                    {member.role}
                  </div>
                  <p className="text-lg mb-4">{member.bio}</p>
                  
                  <div className="flex space-x-3 mt-2">
                    {member.socials.github && (
                      <a 
                        href={member.socials.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white rounded-full w-8 h-8 border-2 border-black flex items-center justify-center hover:bg-gray-100"
                      >
                        <Github size={16} />
                      </a>
                    )}
                    {member.socials.twitter && (
                      <a 
                        href={member.socials.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white rounded-full w-8 h-8 border-2 border-black flex items-center justify-center hover:bg-gray-100"
                      >
                        <Twitter size={16} />
                      </a>
                    )}
                    {member.socials.linkedin && (
                      <a 
                        href={member.socials.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white rounded-full w-8 h-8 border-2 border-black flex items-center justify-center hover:bg-gray-100"
                      >
                        <Linkedin size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}