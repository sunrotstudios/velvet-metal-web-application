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
              Contact Us
            </motion.h1>
            <div className="w-10"></div> {/* Empty div for centering */}
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-purple-100 p-6 rounded-3xl border-4 border-black">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-white rounded-full w-12 h-12 border-3 border-black flex items-center justify-center">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">Email Us</h3>
                    <p>hello@velvetmetal.com</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-100 p-6 rounded-3xl border-4 border-black">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-white rounded-full w-12 h-12 border-3 border-black flex items-center justify-center">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">Call Us</h3>
                    <p>(123) 456-7890</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-100 p-6 rounded-3xl border-4 border-black">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-white rounded-full w-12 h-12 border-3 border-black flex items-center justify-center">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">Location</h3>
                    <p>123 Music Street, San Francisco, CA</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="bg-white p-6 rounded-3xl border-4 border-black">
              {formSubmitted ? (
                <motion.div 
                  className="flex flex-col items-center justify-center h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="bg-green-100 rounded-full w-16 h-16 border-3 border-black flex items-center justify-center mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
                  <p className="text-center">We'll get back to you soon.</p>
                </motion.div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="name" className="block text-sm font-bold mb-2 uppercase">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full p-3 border-3 border-black rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold mb-2 uppercase">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full p-3 border-3 border-black rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-bold mb-2 uppercase">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      required
                      className="w-full p-3 border-3 border-black rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      placeholder="How can we help you?"
                    />
                  </div>
                  <button
                    type="submit"
                    className={cn(
                      "w-full bg-purple-600 text-white p-4 rounded-xl font-bold text-lg mt-2",
                      "border-4 border-black hover:bg-purple-700 transition-colors",
                      "flex items-center justify-center space-x-2"
                    )}
                  >
                    <span>SEND MESSAGE</span>
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}