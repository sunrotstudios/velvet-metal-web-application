import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function About() {
  const navigate = useNavigate();
  
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
          <div className="flex justify-between items-center mb-6">
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
              About Velvet Metal
            </motion.h1>
            <div className="w-10"></div> {/* Empty div for centering */}
          </div>
          
          <div className="space-y-6">
            <div className="bg-purple-100 p-6 rounded-3xl border-4 border-black">
              <p className="text-lg font-medium">
                Velvet Metal is your ultimate music library management platform, designed to seamlessly sync and manage your music across different streaming services.
              </p>
            </div>
            
            <div className="bg-yellow-100 p-6 rounded-3xl border-4 border-black">
              <p className="text-lg font-medium">
                Our mission is to provide music enthusiasts with a powerful tool to organize, discover, and share their favorite music, regardless of their preferred streaming platform.
              </p>
            </div>
            
            <div className="bg-orange-100 p-6 rounded-3xl border-4 border-black">
              <h2 className="text-2xl font-bold mb-3">Why Choose Velvet Metal?</h2>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="mr-2 font-bold">•</span>
                  <span>Universal library that syncs across all your music services</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-bold">•</span>
                  <span>Powerful playlist management tools</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-bold">•</span>
                  <span>Advanced music discovery features</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}