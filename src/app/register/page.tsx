'use client';

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    message: string;
  }>({ score: 0, message: "" });
  const router = useRouter();

  const validatePassword = (password: string) => {
    const requirements = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const score = Object.values(requirements).filter(Boolean).length;
    let message = "";

    if (score === 5) message = "Strong password";
    else if (score >= 4) message = "Good password";
    else if (score >= 3) message = "Fair password";
    else message = "Weak password";

    return { score, message };
  };

  const validateForm = () => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    
    if (!formData.name) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const strength = validatePassword(formData.password);
      if (strength.score < 3) {
        newErrors.password = "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character";
      }
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === "password") {
      setPasswordStrength(validatePassword(value));
    }

    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // TODO: Replace with actual API call
    setTimeout(() => {
      setIsLoading(false);
      router.push('/coach');
    }, 1500);
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
          <span className="text-[#00A8FF]">Register</span> Your Journey
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-black/50 border rounded-lg focus:outline-none focus:ring-1 text-white placeholder-gray-500
                ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#00A8FF]/30 focus:border-[#00A8FF] focus:ring-[#00A8FF]'}`}
              placeholder="Your name"
              required
            />
            {errors.name && (
              <motion.p 
                className="text-red-500 text-sm mt-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.name}
              </motion.p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
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

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-black/50 border rounded-lg focus:outline-none focus:ring-1 text-white placeholder-gray-500
                ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#00A8FF]/30 focus:border-[#00A8FF] focus:ring-[#00A8FF]'}`}
              placeholder="••••••••"
              required
            />
            {formData.password && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        passwordStrength.score === 5
                          ? "bg-green-500"
                          : passwordStrength.score === 4
                          ? "bg-blue-500"
                          : passwordStrength.score === 3
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs ${
                    passwordStrength.score === 5
                      ? "text-green-500"
                      : passwordStrength.score === 4
                      ? "text-blue-500"
                      : passwordStrength.score === 3
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}>
                    {passwordStrength.message}
                  </span>
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  Password must contain:
                  <ul className="list-disc list-inside">
                    <li className={formData.password.length >= 8 ? "text-green-500" : "text-gray-400"}>At least 8 characters</li>
                    <li className={/[A-Z]/.test(formData.password) ? "text-green-500" : "text-gray-400"}>One uppercase letter</li>
                    <li className={/[a-z]/.test(formData.password) ? "text-green-500" : "text-gray-400"}>One lowercase letter</li>
                    <li className={/[0-9]/.test(formData.password) ? "text-green-500" : "text-gray-400"}>One number</li>
                    <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? "text-green-500" : "text-gray-400"}>One special character</li>
                  </ul>
                </div>
              </motion.div>
            )}
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

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-black/50 border rounded-lg focus:outline-none focus:ring-1 text-white placeholder-gray-500
                ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#00A8FF]/30 focus:border-[#00A8FF] focus:ring-[#00A8FF]'}`}
              placeholder="••••••••"
              required
            />
            {errors.confirmPassword && (
              <motion.p 
                className="text-red-500 text-sm mt-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.confirmPassword}
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
                Creating account...
              </div>
            ) : (
              "Register"
            )}
          </button>

          <div className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-[#00A8FF] hover:text-[#00B8FF] font-medium"
            >
              Login
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
} 