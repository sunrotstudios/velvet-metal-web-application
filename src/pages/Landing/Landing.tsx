import { Button } from '@/components/ui/button';
import { MobileLanding } from '@/pages/Landing/MobileLanding';
import { ResponsiveContainer } from '@/shared/layouts/ResponsiveContainer';
import { motion } from 'framer-motion';
import { Heart, Music, Share2, Shuffle, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: <Music className="w-5 h-5" />,
    title: 'Smart Playlists',
  },
  {
    icon: <Share2 className="w-5 h-5" />,
    title: 'Cross-Platform',
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: 'Discovery',
  },
  {
    icon: <Shuffle className="w-5 h-5" />,
    title: 'Smart Shuffle',
  },
  {
    icon: <Heart className="w-5 h-5" />,
    title: 'Collection',
  },
];

function Landing() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return <MobileLanding />;
  }

  const handleLogin = () => {
    navigate('/login', { replace: false });
  };

  const handleRegister = () => {
    navigate('/register', { replace: false });
  };

  return (
    <div className="h-screen bg-black text-white overflow-hidden relative">
      <ResponsiveContainer>
        <div className="h-screen flex items-center justify-center">
          <div className="max-w-[1200px] w-full mx-auto relative z-10">
            <motion.div
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-radlush text-[120px] leading-none mb-8 font-extrabold">
                Velvet
                <br />
                <span className="text-gray-500">Metal</span>
              </h1>

              <p className="text-2xl text-gray-400 max-w-2xl mb-12">
                Your all-in-one solution for seamless playlist management and
                music discovery. Connect your favorite music platforms and take
                control of your library.
              </p>

              <div className="flex gap-6 mb-16">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-gray-200 text-lg px-12 py-6 font-radlush"
                  onClick={handleRegister}
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  className="bg-transparent text-white hover:bg-white hover:text-black border-2 border-white text-lg px-12 py-6 font-radlush transition-colors"
                  onClick={handleLogin}
                >
                  Sign In
                </Button>
              </div>

              <div className="flex gap-16 justify-center">
                <motion.div
                  className="flex items-center gap-3"
                  whileHover={{ scale: 1.05 }}
                >
                  <Music className="w-5 h-5" />
                  <span className="text-lg">Smart Playlists</span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-3"
                  whileHover={{ scale: 1.05 }}
                >
                  <Share2 className="w-5 h-5" />
                  <span className="text-lg">Cross-Platform</span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-3"
                  whileHover={{ scale: 1.05 }}
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="text-lg">Discovery</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </ResponsiveContainer>

      {/* Background Elements */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-gray-900 to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-gray-900 to-transparent" />
      </div>
    </div>
  );
}

export default Landing;
