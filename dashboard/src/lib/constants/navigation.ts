import { 
  GitBranch, 
  Plug, 
  FileText, 
  Calendar,
  BarChart3,
  FolderOpen,
  User
} from "lucide-react";

/**
 * Navigation Configuration
 * 
 * This file contains the configuration for the side navigation menu.
 * To add, update, or delete menu items, simply modify the navigationItems array below.
 * 
 * NOTE: Dashboard and User Profile navigation items are hard-coded in the SideNav component
 * and should not be included in this configuration.
 */

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Main Navigation Items
 * 
 * These items appear in the middle section of the side navigation.
 * Each item requires:
 * - name: Display name for the menu item
 * - href: URL path for the page (should match the route in src/app/)
 * - icon: Lucide React icon component
 * 
 * To add a new page:
 * 1. Create the page component in src/app/[page-name]/page.tsx
 * 2. Import the desired icon from 'lucide-react' at the top of this file
 * 3. Add a new item to this array with the page details
 */
export const navigationItems: NavItem[] = [
  { 
    name: "Workflows", 
    href: "/sample-page-1", 
    icon: GitBranch 
  },
  { 
    name: "Integrations", 
    href: "/sample-page-2", 
    icon: Plug 
  },
  { 
    name: "Generate Posts", 
    href: "/generate-posts", 
    icon: FileText 
  },
  { 
    name: "Calendar", 
    href: "/sample-page-3", 
    icon: Calendar 
  },
  { 
    name: "Analytics", 
    href: "/sample-page-4", 
    icon: BarChart3 
  },
  { 
    name: "Files", 
    href: "/sample-page-5", 
    icon: FolderOpen 
  },
    {
    name: "User",
    href: "/user-management",
    icon: User
  }
];
