"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, BookOpen, User } from "lucide-react";
import { useEffect, useState } from "react";

const BottomNav = () => {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if token exists in cookies
    const token = document.cookie.includes('token=');
    setIsLoggedIn(token);
  }, [pathname]); // Re-check when pathname changes

  const navItems = [
    {
      name: "Coach",
      href: "/coach",
      icon: MessageSquare,
    },
    {
      name: "Journal",
      href: "/journal",
      icon: BookOpen,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
    },
  ];

  // Don't render navigation if user is not logged in
  if (!isLoggedIn) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-gray-800 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full relative group ${
                isActive ? "text-[#00A8FF]" : "text-gray-400"
              } hover:text-[#00A8FF] transition-all duration-200`}
            >
              <div className="relative">
                <item.icon className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
                {isActive && (
                  <div className="absolute -bottom-2 left-1/4 right-1/4 h-0.5 bg-[#00A8FF] rounded-full transform -translate-y-1 group-hover:scale-110 transition-transform duration-200" />
                )}
              </div>
              <span className="text-xs mt-1.5 transition-transform duration-200 group-hover:scale-105">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav; 