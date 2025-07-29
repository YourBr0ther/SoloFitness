'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/auth/AuthForm';
import ParticleBackground from '@/components/ui/ParticleBackground';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showTagline, setShowTagline] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTagline(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-primary-400 text-xl">Loading...</div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background-dark relative overflow-hidden">
      <ParticleBackground />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center mb-12">
          <h1 className="font-heading text-6xl md:text-8xl text-white glow-text mb-6 animate-glow-pulse">
            SoloFitness
          </h1>
          
          {showTagline && (
            <p className="text-xl md:text-2xl text-primary-300 typewriter">
              Click here to change your life
            </p>
          )}
        </div>

        <div className="w-full max-w-md bg-primary-900/50 backdrop-blur-sm border border-primary-700 rounded-lg p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-white mb-2">
              {isLogin ? 'Welcome Back' : 'Begin Your Journey'}
            </h2>
            <p className="text-gray-400 text-sm">
              {isLogin 
                ? 'Continue your solo leveling adventure' 
                : 'Start your transformation today'
              }
            </p>
          </div>

          <AuthForm 
            isLogin={isLogin} 
            onToggle={() => setIsLogin(!isLogin)} 
          />
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Inspired by Solo Leveling • Built for Heroes</p>
        </div>
      </div>
    </div>
  );
}