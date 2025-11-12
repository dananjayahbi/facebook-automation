"use client";

import { User, LogOut, ChevronDown, Facebook } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFacebookPage } from "@/contexts/FacebookPageContext";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showPageDropdown, setShowPageDropdown] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const pageDropdownRef = useRef<HTMLDivElement>(null);
  
  const { activePage, availablePages, loading, setActivePage } = useFacebookPage();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (pageDropdownRef.current && !pageDropdownRef.current.contains(event.target as Node)) {
        setShowPageDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const handlePageChange = async (page: any) => {
    await setActivePage(page);
    setShowPageDropdown(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/50 backdrop-blur-lg z-40">
      <div className="h-full px-8 flex items-center justify-between border-b border-gray-200">
        {/* Left: Facebook Page Selector */}
        <div className="relative" ref={pageDropdownRef}>
          {loading ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
              <Facebook className="w-5 h-5 text-gray-400 animate-pulse" />
              <span className="text-sm text-gray-500">Loading...</span>
            </div>
          ) : activePage ? (
            <button
              onClick={() => setShowPageDropdown(!showPageDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <Facebook className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">{activePage.name}</span>
              <ChevronDown className="w-4 h-4 text-purple-600" />
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
              <Facebook className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500">No page selected</span>
            </div>
          )}

          {/* Page Dropdown */}
          {showPageDropdown && (
            <div className="absolute left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 max-h-80 overflow-y-auto">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase">Select Facebook Page</p>
              </div>
              {availablePages.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No pages available
                </div>
              ) : (
                availablePages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => handlePageChange(page)}
                    className={`w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors ${
                      activePage?.id === page.id ? 'bg-purple-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{page.name}</p>
                        {page.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{page.description}</p>
                        )}
                      </div>
                      {activePage?.id === page.id && (
                        <span className="ml-2 w-2 h-2 bg-purple-600 rounded-full" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right: User Profile Dropdown */}
        <div className="relative" ref={userDropdownRef}>
          <button 
            className="w-10 h-10 rounded-full bg-[#5B50E8] flex items-center justify-center hover:bg-[#4A3FD7] transition-colors duration-200 shadow-md"
            aria-label="User profile"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
          >
            <User className="w-5 h-5 text-white" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
              {session?.user && (
                <>
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{session.user.name}</p>
                    <p className="text-xs text-gray-600">{session.user.email}</p>
                    <span className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                      {session.user.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
