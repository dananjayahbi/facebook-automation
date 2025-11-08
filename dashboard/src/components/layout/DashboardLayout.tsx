"use client";

import SideNav from "./SideNav";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Compact Side Navigation */}
      <SideNav />
      
      {/* Main Content Area - Full width */}
      <main className="min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
