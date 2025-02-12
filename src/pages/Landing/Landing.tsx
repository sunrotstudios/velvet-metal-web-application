import { Button } from '@/components/ui/button';
import { MobileLanding } from '@/pages/Landing/MobileLanding';
import { ResponsiveContainer } from '@/shared/layouts/ResponsiveContainer';
import { motion } from 'framer-motion';
import { Headphones, Music, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: <Music className="w-4 h-4 text-foreground" />,
    title: 'Music Library',
    description: 'Manage your entire music collection in one place',
    color: 'from-accent-spotify/20 to-accent-spotify/10',
  },
  {
    icon: <Share2 className="w-4 h-4 text-foreground" />,
    title: 'Share Music',
    description: 'Share your favorite tracks and playlists',
    color: 'from-accent-apple/20 to-accent-apple/10',
  },
  {
    icon: <Headphones className="w-4 h-4 text-foreground" />,
    title: 'Cross Platform',
    description: 'Connect with multiple streaming services',
    color: 'from-foreground/20 to-foreground/10',
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
    return <MobileLanding features={features} />;
  }

  const handleLogin = () => {
    navigate('/login', { replace: false });
  };

  const handleRegister = () => {
    navigate('/register', { replace: false });
  };

  return (
    <div className="min-h-screen w-full bg-bg dark:bg-darkBg">
      <ResponsiveContainer>
        <div className="h-screen flex items-center justify-center">
          <div className="max-w-[1200px] w-full mx-auto relative z-10">
            <motion.div
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-radlush text-text dark:text-darkText text-[120px] leading-none mb-8 font-semibold">
                Velvet Metal
              </h1>

              <p className="text-2xl text-text dark:text-darkText max-w-2xl mb-12 font-degular">
                Your all-in-one solution for seamless playlist management and
                music discovery. Connect your favorite music platforms and take
                control of your library.
              </p>

              <div className="flex gap-6 mb-16">
                <Button
                  size="lg"
                  className="bg-main text-text hover:bg-opacity-90 text-lg px-12 py-6 font-radlush shadow-light dark:shadow-dark hover:translate-x-boxShadowX hover:translate-y-boxShadowY active:translate-x-0 active:translate-y-0"
                  onClick={handleRegister}
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  className="bg-transparent text-text dark:text-darkText hover:bg-text hover:text-bg dark:hover:bg-darkText dark:hover:text-darkBg border-2 border-text dark:border-darkText text-lg px-12 py-6 font-radlush transition-colors shadow-light dark:shadow-dark hover:translate-x-boxShadowX hover:translate-y-boxShadowY active:translate-x-0 active:translate-y-0"
                  onClick={handleLogin}
                >
                  Sign In
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </ResponsiveContainer>
    </div>
  );
}

export default Landing;
