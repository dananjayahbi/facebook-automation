"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

interface FacebookPage {
  id: string;
  name: string;
  description: string | null;
  pageId: string | null;
  isActive: boolean;
}

interface FacebookPageContextType {
  activePage: FacebookPage | null;
  availablePages: FacebookPage[];
  loading: boolean;
  switching: boolean;
  setActivePage: (page: FacebookPage) => Promise<void>;
  refreshPages: () => Promise<void>;
}

const FacebookPageContext = createContext<FacebookPageContextType | undefined>(undefined);

const STORAGE_KEY = 'active-facebook-page-id';

export function FacebookPageProvider({ children }: { children: ReactNode }) {
  const [activePage, setActivePageState] = useState<FacebookPage | null>(null);
  const [availablePages, setAvailablePages] = useState<FacebookPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  // Fetch available pages
  const fetchPages = async () => {
    try {
      const response = await fetch('/api/facebook-pages');
      if (response.ok) {
        const pages = await response.json();
        setAvailablePages(pages);
        return pages;
      } else {
        console.error('Failed to fetch Facebook pages');
        return [];
      }
    } catch (error) {
      console.error('Error fetching Facebook pages:', error);
      return [];
    }
  };

  // Fetch user's active page from server
  const fetchActivePage = async () => {
    try {
      const response = await fetch('/api/user-active-page');
      if (response.ok) {
        const data = await response.json();
        return data.facebookPage || null;
      } else {
        console.error('Failed to fetch active page');
        return null;
      }
    } catch (error) {
      console.error('Error fetching active page:', error);
      return null;
    }
  };

  // Set active page (persist to server and localStorage)
  const setActivePage = async (page: FacebookPage) => {
    setSwitching(true);
    try {
      const response = await fetch('/api/user-active-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facebookPageId: page.id }),
      });

      if (response.ok) {
        setActivePageState(page);
        localStorage.setItem(STORAGE_KEY, page.id);
        toast.success(`Switched to ${page.name}`);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to switch Facebook page');
      }
    } catch (error) {
      console.error('Error setting active page:', error);
      toast.error('An error occurred while switching pages');
    } finally {
      setSwitching(false);
    }
  };

  // Refresh pages list
  const refreshPages = async () => {
    const pages = await fetchPages();
    
    // If current active page is no longer in the list, switch to first available
    if (activePage && !pages.find((p: FacebookPage) => p.id === activePage.id)) {
      if (pages.length > 0) {
        await setActivePage(pages[0]);
      } else {
        setActivePageState(null);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  };

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      
      // Fetch available pages
      const pages = await fetchPages();
      
      if (pages.length === 0) {
        setLoading(false);
        return;
      }

      // Try to get active page from server
      let active = await fetchActivePage();

      // If no active page from server, check localStorage
      if (!active) {
        const storedId = localStorage.getItem(STORAGE_KEY);
        if (storedId) {
          active = pages.find((p: FacebookPage) => p.id === storedId) || null;
        }
      }

      // If still no active page, use first available
      if (!active && pages.length > 0) {
        active = pages[0];
        // Persist to server
        try {
          await fetch('/api/user-active-page', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ facebookPageId: active.id }),
          });
        } catch (error) {
          console.error('Error persisting initial active page:', error);
        }
      }

      if (active) {
        setActivePageState(active);
        localStorage.setItem(STORAGE_KEY, active.id);
      }

      setLoading(false);
    };

    initialize();
  }, []);

  return (
    <FacebookPageContext.Provider
      value={{
        activePage,
        availablePages,
        loading,
        switching,
        setActivePage,
        refreshPages,
      }}
    >
      {children}
    </FacebookPageContext.Provider>
  );
}

// Custom hook to use the context
export function useFacebookPage() {
  const context = useContext(FacebookPageContext);
  if (context === undefined) {
    throw new Error('useFacebookPage must be used within a FacebookPageProvider');
  }
  return context;
}
