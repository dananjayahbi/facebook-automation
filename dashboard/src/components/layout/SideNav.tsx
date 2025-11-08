"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  GitBranch, 
  Plug, 
  FileText, 
  Calendar,
  BarChart3,
  FolderOpen,
  Bell,
  User
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Workflows", href: "/sample-page-1", icon: GitBranch },
  { name: "Integrations", href: "/sample-page-2", icon: Plug },
  { name: "Generate Posts", href: "/generate-posts", icon: FileText },
  { name: "Calendar", href: "/sample-page-3", icon: Calendar },
  { name: "Analytics", href: "/sample-page-4", icon: BarChart3 },
  { name: "Files", href: "/sample-page-5", icon: FolderOpen },
  { name: "Notifications", href: "/notifications", icon: Bell },
];

export default function SideNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <aside className="fixed left-6 top-1/2 -translate-y-1/2 z-50">
      {/* Compact Modern Side Navigation */}
      <div className="bg-[#5B50E8] rounded-[28px] p-2 shadow-2xl">
        {/* Logo/Brand at top */}
        <div className="mb-3 flex items-center justify-center">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center hover:bg-white/30 transition-all cursor-pointer">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Navigation Icons */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group relative w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300
                  ${active 
                    ? "bg-white shadow-lg" 
                    : "hover:bg-white/20"
                  }
                `}
                title={item.name}
              >
                <Icon className={`w-5 h-5 transition-colors ${active ? "text-[#5B50E8]" : "text-white"}`} />
                
                {/* Tooltip on hover */}
                <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                  {item.name}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-900"></div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Profile at bottom */}
        <div className="mt-3 pt-3 border-t border-white/20">
          <Link
            href="/profile"
            className="group relative w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-white/20 transition-all"
            title="Profile"
          >
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            
            {/* Tooltip */}
            <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
              Profile
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-900"></div>
            </div>
          </Link>
        </div>
      </div>
    </aside>
  );
}
