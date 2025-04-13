'use client';

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = document.cookie.includes('token=');
    if (token) {
      router.push('/journal');
      return;
    }
    setMounted(true);
  }, [router]);

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
      {/* Background animation */}
      <motion.div 
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Add your background animation elements here */}
      </motion.div>

      {/* Main content */}
      <motion.div 
        className="relative z-10 container mx-auto px-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
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
    </div>
  );
}
