'use client';

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Check if account is locked
    const storedLockoutTime = localStorage.getItem('lockoutTime');
    if (storedLockoutTime) {
      const timeLeft = parseInt(storedLockoutTime) - Date.now();
      if (timeLeft > 0) {
        setIsLocked(true);
        setLockoutTime(timeLeft);
        const timer = setInterval(() => {
          setLockoutTime(prev => {
            if (prev <= 1000) {
              clearInterval(timer);
              setIsLocked(false);
              localStorage.removeItem('lockoutTime');
              return 0;
            }
            return prev - 1000;
          });
        }, 1000);
        return () => clearInterval(timer);
      } else {
        localStorage.removeItem('lockoutTime');
      }
    }
  }, []);

  const validateForm = () => {
    const newErrors: {
      email?: string;
      password?: string;
      general?: string;
    } = {};
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) return;
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call
      const response = await new Promise<{ success: boolean }>((resolve) => {
        setTimeout(() => {
          resolve({ success: false }); // Simulating failed login
        }, 1500);
      });

      if (!response.success) {
        const newFailedAttempts = failedAttempts + 1;
        setFailedAttempts(newFailedAttempts);
        
        if (newFailedAttempts >= 5) {
          const lockoutDuration = 5 * 60 * 1000; // 5 minutes
          setIsLocked(true);
          setLockoutTime(lockoutDuration);
          localStorage.setItem('lockoutTime', (Date.now() + lockoutDuration).toString());
          
          setErrors({
            general: `Too many failed attempts. Please try again in ${Math.ceil(lockoutDuration / 1000 / 60)} minutes.`
          });
        } else {
          setErrors({
            general: "Invalid email or password. Please try again."
          });
        }
      } else {
        // Successful login
        router.push('/coach');
      }
    } catch (error) {
      setErrors({
        general: "An error occurred. Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#001a33] to-black opacity-90" />
      
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
      <motion.div 
        className="relative z-10 w-full max-w-md p-8 bg-black/50 backdrop-blur-sm rounded-xl border border-[#00A8FF]/20 shadow-[0_0_30px_rgba(0,168,255,0.1)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-center mb-8">
          <span className="text-[#00A8FF]">Login</span> to Your Journey
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-500 text-sm"
            >
              {errors.general}
            </motion.div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, email: e.target.value }));
                if (errors.email) {
                  setErrors(prev => ({ ...prev, email: undefined }));
                }
              }}
              className={`w-full px-4 py-3 bg-black/50 border rounded-lg focus:outline-none focus:ring-1 text-white placeholder-gray-500
                ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#00A8FF]/30 focus:border-[#00A8FF] focus:ring-[#00A8FF]'}`}
              placeholder="hunter@solofitness.com"
              required
              disabled={isLocked}
            />
            {errors.email && (
              <motion.p 
                className="text-red-500 text-sm mt-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.email}
              </motion.p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="text-sm text-[#00A8FF] hover:text-[#00B8FF] font-medium"
              >
                Forgot Password?
              </button>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, password: e.target.value }));
                if (errors.password) {
                  setErrors(prev => ({ ...prev, password: undefined }));
                }
              }}
              className={`w-full px-4 py-3 bg-black/50 border rounded-lg focus:outline-none focus:ring-1 text-white placeholder-gray-500
                ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#00A8FF]/30 focus:border-[#00A8FF] focus:ring-[#00A8FF]'}`}
              placeholder="••••••••"
              required
              disabled={isLocked}
            />
            {errors.password && (
              <motion.p 
                className="text-red-500 text-sm mt-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.password}
              </motion.p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || isLocked}
            className="w-full py-3 bg-[#00A8FF] text-black font-bold rounded-lg
                     hover:bg-[#00B8FF] transform hover:scale-[1.02] transition-all duration-300
                     shadow-[0_0_20px_rgba(0,168,255,0.5)] hover:shadow-[0_0_30px_rgba(0,168,255,0.7)]
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                Logging in...
              </div>
            ) : isLocked ? (
              `Try again in ${Math.ceil(lockoutTime / 1000)} seconds`
            ) : (
              "Login"
            )}
          </button>

          <div className="text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => router.push('/register')}
              className="text-[#00A8FF] hover:text-[#00B8FF] font-medium"
            >
              Register
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
} 