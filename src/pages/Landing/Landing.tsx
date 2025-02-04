import { Button } from '@/components/ui/button';
import { MobileLanding } from '@/pages/Landing/MobileLanding';
import { ResponsiveContainer } from '@/shared/layouts/ResponsiveContainer';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url("/images/background.jpg")',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fallback color
        backgroundBlendMode: 'overlay', // This will help text remain readable
      }}
    >
      <ResponsiveContainer>
        <div className="h-screen flex items-center justify-center">
          <div className="max-w-[1200px] w-full mx-auto relative z-10">
            <motion.div
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-radlush text-white text-[120px] leading-none mb-8 font-semibold">
                Velvet Metal
              </h1>

              <p className="text-2xl text-gray-400 max-w-2xl mb-12 font-degular">
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
