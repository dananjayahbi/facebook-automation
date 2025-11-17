"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

interface FloatingSearchButtonProps {
  onSearch: (query: string) => void;
  onClear: () => void;
}

export default function FloatingSearchButton({
  onSearch,
  onClear,
}: FloatingSearchButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [expandDirection, setExpandDirection] = useState<'left' | 'right'>('left');
  const buttonRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize position after component mounts (client-side only)
  useEffect(() => {
    setPosition({
      x: window.innerWidth - 100,
      y: window.innerHeight - 100,
    });
  }, []);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  // Determine expansion direction based on position and adjust position if needed
  useEffect(() => {
    if (isExpanded) {
      // When expanded, check if it overflows and adjust position
      const expandedWidth = 350; // Approximate expanded width
      const buttonHeight = 60; // Approximate button height
      
      let newX = position.x;
      let newY = position.y;
      
      // Check right overflow
      if (position.x + expandedWidth > window.innerWidth) {
        newX = window.innerWidth - expandedWidth - 20;
      }
      
      // Check left overflow
      if (newX < 20) {
        newX = 20;
      }
      
      // Check bottom overflow
      if (position.y + buttonHeight > window.innerHeight) {
        newY = window.innerHeight - buttonHeight - 20;
      }
      
      // Check top overflow
      if (newY < 20) {
        newY = 20;
      }
      
      // Update position if needed
      if (newX !== position.x || newY !== position.y) {
        setPosition({ x: newX, y: newY });
      }
      
      // Determine direction
      if (position.x > window.innerWidth / 2) {
        setExpandDirection('left');
      } else {
        setExpandDirection('right');
      }
    }
  }, [isExpanded]);

  // Update expand direction when position changes (while not expanded)
  useEffect(() => {
    if (!isExpanded) {
      if (position.x > window.innerWidth / 2) {
        setExpandDirection('left');
      } else {
        setExpandDirection('right');
      }
    }
  }, [position.x, isExpanded]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Allow dragging from anywhere on the button
    if (buttonRef.current) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
      e.preventDefault(); // Prevent text selection
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Get button dimensions
      const buttonWidth = buttonRef.current?.offsetWidth || 60;
      const buttonHeight = buttonRef.current?.offsetHeight || 60;
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - buttonWidth;
      const maxY = window.innerHeight - buttonHeight;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      // Disable text selection during drag
      document.body.style.userSelect = 'none';
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragStart]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    onClear();
    setIsExpanded(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      handleClear();
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging) {
      if (isExpanded) {
        // When collapsing, adjust position to align with the search icon
        // and ensure it doesn't overflow
        const collapsedWidth = 60; // Button size when collapsed
        const expandedWidth = 350; // Approximate expanded width
        
        let newX = position.x;
        
        if (expandDirection === 'left') {
          // Search icon is on the right side
          newX = position.x + (expandedWidth - collapsedWidth);
        }
        // If expandDirection is 'right', position stays the same
        
        // Ensure collapsed button doesn't overflow
        const maxX = window.innerWidth - collapsedWidth - 20;
        if (newX > maxX) {
          newX = maxX;
        }
        if (newX < 20) {
          newX = 20;
        }
        
        setPosition({
          x: newX,
          y: position.y,
        });
        
        handleClear();
      } else {
        setIsExpanded(true);
      }
    }
  };

  return (
    <div
      ref={buttonRef}
      className={`fixed z-40 ${isDragging ? 'cursor-grabbing' : (isExpanded ? 'cursor-move' : 'cursor-pointer')}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: isDragging ? 'none' : 'all 0.3s ease-out',
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className={`flex items-center rounded-full shadow-2xl transition-all duration-300 ${
          isExpanded ? "gap-2 px-4 py-2 bg-linear-to-r from-purple-600 to-blue-600" : "p-4 hover:scale-110 bg-linear-to-r from-purple-600 to-blue-600"
        } text-white`}
        style={{
          flexDirection: expandDirection === 'left' ? 'row-reverse' : 'row',
        }}
      >
        {isExpanded ? (
          <>
            {expandDirection === 'left' && (
              <button
                onClick={handleToggle}
                className="hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all shrink-0 group"
                title="Close"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <X className="w-5 h-5 group-hover:text-gray-800 transition-colors" />
              </button>
            )}
            {expandDirection === 'right' && (
              <button
                onClick={handleToggle}
                className="hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all shrink-0"
                title="Search"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Search className="w-5 h-5" />
              </button>
            )}
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Search by tags..."
              className="bg-transparent outline-none text-white placeholder-white placeholder-opacity-70 w-48"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
            {searchQuery && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery("");
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="hover:bg-white text-white hover:text-black hover:bg-opacity-20 rounded-full p-1 transition-colors shrink-0"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSearch();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              disabled={!searchQuery.trim()}
              className="bg-white text-black cursor-pointer bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              title="Search"
            >
              Go
            </button>
            {expandDirection === 'right' && (
              <button
                onClick={handleToggle}
                className="hover:bg-white text-white hover:text-black hover:bg-opacity-20 rounded-full p-2 transition-all shrink-0 group"
                title="Close"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <X className="w-5 h-5 group-hover:text-gray-800 transition-colors" />
              </button>
            )}
          </>
        ) : (
          <button
            onClick={handleToggle}
            onMouseDown={(e) => e.stopPropagation()}
            className="focus:outline-none"
            title="Search images by tags"
          >
            <Search className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}
