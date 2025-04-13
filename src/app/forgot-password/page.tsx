'use client';

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const validateForm = () => {
    const newErrors: { email?: string } = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // TODO: Replace with actual API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#001a33] to-black opacity-90" />
      
      {/* Glowing particles */}
      <div className="absolute inset-0 overflow-hidden">
        {typeof window !== 'undefined' && [...Array(20)].map((_, i) => {
          // Use a consistent seed based on index
          const leftPos = ((i * 17) % 100);
          const topPos = ((i * 23) % 100);
          
          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[#00A8FF] rounded-full"
              style={{
                left: `${leftPos}%`,
                top: `${topPos}%`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 2 + (i % 3),
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          );
        })}
      </div>

      {/* Content */}
      <motion.div 
        className="relative z-10 w-full max-w-md p-8 bg-black/50 backdrop-blur-sm rounded-xl border border-[#00A8FF]/20 shadow-[0_0_30px_rgba(0,168,255,0.1)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-center mb-8">
          <span className="text-[#00A8FF]">Reset</span> Your Password
        </h1>

        {success ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="text-[#00A8FF] text-5xl mb-4">✓</div>
            <h2 className="text-xl font-semibold">Password Reset Email Sent</h2>
            <p className="text-gray-400">
              We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="mt-6 text-[#00A8FF] hover:text-[#00B8FF] font-medium"
            >
              Return to Login
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors({ ...errors, email: undefined });
                  }
                }}
                className={`w-full px-4 py-3 bg-black/50 border rounded-lg focus:outline-none focus:ring-1 text-white placeholder-gray-500
                  ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#00A8FF]/30 focus:border-[#00A8FF] focus:ring-[#00A8FF]'}`}
                placeholder="hunter@solofitness.com"
                required
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#00A8FF] text-black font-bold rounded-lg
                       hover:bg-[#00B8FF] transform hover:scale-[1.02] transition-all duration-300
                       shadow-[0_0_20px_rgba(0,168,255,0.5)] hover:shadow-[0_0_30px_rgba(0,168,255,0.7)]
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                  Sending reset link...
                </div>
              ) : (
                "Send Reset Link"
              )}
            </button>

            <div className="text-center text-sm text-gray-400">
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-[#00A8FF] hover:text-[#00B8FF] font-medium"
              >
                Login
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
} 