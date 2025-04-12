'use client';

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBeginJourney = () => {
    setIsTransitioning(true);
    // Create a glowing effect
    const button = document.querySelector('button');
    if (button) {
      button.style.boxShadow = '0 0 40px rgba(0, 168, 255, 0.8)';
    }
    
    // Wait for the glow effect
    setTimeout(() => {
      router.push('/login');
    }, 500);
  };

  if (!mounted) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {!isTransitioning ? (
        <motion.div 
          className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Background gradient */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-b from-black via-[#001a33] to-black opacity-90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
          
          {/* Glowing particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-[#00A8FF] rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 2 + Math.random() * 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 text-center space-y-8">
            {/* App Name */}
            <motion.h1 
              className="text-6xl md:text-8xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-[#00A8FF]">Solo</span>Fitness
            </motion.h1>

            {/* Tagline */}
            <motion.p 
              className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Level up your fitness journey with the power of a hunter
            </motion.p>

            {/* Begin Button */}
            <motion.button
              className="px-12 py-4 bg-[#00A8FF] text-black font-bold text-xl rounded-lg
                       hover:bg-[#00B8FF] transform hover:scale-105 transition-all duration-300
                       shadow-[0_0_20px_rgba(0,168,255,0.5)] hover:shadow-[0_0_30px_rgba(0,168,255,0.7)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBeginJourney}
            >
              Begin Your Journey
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="min-h-screen bg-black flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-[#00A8FF] border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
