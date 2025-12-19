'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, BarChart2, Trophy, Settings } from 'lucide-react';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/stats', icon: BarChart2, label: 'Stats' },
  { href: '/achievements', icon: Trophy, label: 'Awards' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background-dark/95 backdrop-blur-lg border-t border-primary-400/20 pb-safe z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-16 h-16 touch-target"
            >
              {isActive && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute inset-x-2 top-0 h-0.5 bg-gradient-to-r from-primary-400 to-accent-cyan rounded-full"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  color: isActive ? '#00e5ff' : '#90caf9',
                }}
                transition={{ duration: 0.2 }}
              >
                <Icon size={24} />
              </motion.div>
              <span
                className={`text-xs mt-1 ${
                  isActive ? 'text-accent-cyan font-medium' : 'text-primary-300/60'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
