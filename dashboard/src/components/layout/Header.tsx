"use client";

import { User } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-transparent z-40">
      <div className="h-full px-8 flex items-center justify-end border-b border-gray-200">
        {/* User Profile Icon */}
        <button 
          className="w-10 h-10 rounded-full bg-[#5B50E8] flex items-center justify-center hover:bg-[#4A3FD7] transition-colors duration-200 shadow-md"
          aria-label="User profile"
        >
          <User className="w-5 h-5 text-white" />
        </button>
      </div>
    </header>
  );
}
