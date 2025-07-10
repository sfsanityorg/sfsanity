import React, { useState, useRef, useEffect } from 'react';
import { Command, Search, Grid3X3, List, ArrowDown, Lightbulb, X, Github, Menu } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { ConnectionStatus } from '../common/ConnectionStatus';
import { SearchBar } from '../common/SearchBar';
import { APP_CONFIG } from '../../config/app';

interface TopNavProps {
  /** Current view mode for events display */
  viewMode?: 'tiles' | 'list';
  /** Callback to toggle view mode */
  onToggleViewMode?: (mode: 'tiles' | 'list') => void;
  /** Callback to jump to bottom of events */
  onJumpToBottom?: () => void;
  /** Whether to show the events controls */
  showEventsControls?: boolean;
  /** Callback to open insights modal */
  onOpenInsights?: () => void;
  /** Whether to show the insights button */
  showInsightsButton?: boolean;
  /** Search functionality props */
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  isSearching?: boolean;
  showSearch?: boolean;
  onToggleSearch?: () => void;
}

/**
 * Top navigation component with command bar and navigation links
 * Features SFSANITY branding and minimal navigation layout
 */
export default function TopNav({ 
  viewMode = 'tiles', 
  onToggleViewMode, 
  onJumpToBottom,
  showEventsControls = false,
  onOpenInsights,
  showInsightsButton = false,
  searchQuery = '',
  onSearchChange,
  isSearching = false,
  showSearch = false,
  onToggleSearch
}: TopNavProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const searchContainerRef = useRef<HTMLDivElement>(null);

  /**
   * Toggles the expanded state of the navigation bar
   */
  const toggleExpand = () => {
    setIsExpanded(prev => !prev);
  };

  /**
   * Handles view mode toggle
   */
  const handleToggleViewMode = () => {
    if (onToggleViewMode) {
      const newMode = viewMode === 'tiles' ? 'list' : 'tiles';
      onToggleViewMode(newMode);
    }
  };

  /**
   * Toggles mobile menu
   */
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  /**
   * Handles clicks outside the search container to close search
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSearch && 
          searchContainerRef.current && 
          !searchContainerRef.current.contains(event.target as Node) &&
          onToggleSearch) {
        onToggleSearch();
      }
    };

    if (showSearch) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearch, onToggleSearch]);

  return (
    <div
      ref={searchContainerRef}
      className={`fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-2 sm:px-4 transition-all duration-300
        bg-graphite-400/80 border border-graphite-300/30 backdrop-blur-md rounded-xl
        ${showSearch ? 'h-20' : 'h-14'}`}
    >
      <div className={`h-full flex ${showSearch ? 'flex-col' : 'items-center'} justify-between`}>
        {/* Main navigation row */}
        <div className={`${showSearch ? 'h-14' : 'h-full'} flex items-center justify-between w-full`}>
        {/* Left section - Mobile menu button on mobile, invisible spacer on desktop */}
        <div className="flex items-center space-x-1 flex-1">
          <button 
            onClick={toggleMobileMenu}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-graphite-300/40 sm:invisible"
          >
            <Menu size={18} className="text-text-secondary" />
          </button>
          <button 
            onClick={toggleExpand}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-graphite-300/40 invisible hidden sm:flex"
          >
            <Command size={18} className="text-text-secondary" />
          </button>
        </div>

        {/* Centered SFSANITY */}
        <div className="flex items-center justify-center flex-1">
          <span className="text-lg sm:text-xl text-text-tertiary tracking-wider font-medium">SFSanity</span>
        </div>

        {/* Right spacer to maintain centering */}
        <div className="flex items-center flex-1 justify-end space-x-1 sm:space-x-2">
          {showEventsControls && (
            <>
              <button 
                onClick={onToggleSearch}
                className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full hover:bg-graphite-300/40 text-text-secondary hover:text-text-primary transition-all duration-200 ${showSearch ? 'order-last' : ''}`}
                title={showSearch ? "Close search" : "Search events"}
              >
                {showSearch ? <X size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Search size={16} className="sm:w-[18px] sm:h-[18px]" />}
              </button>
              
              {!showSearch && onToggleViewMode && (
                <div className="hidden sm:block">
                  <button
                    onClick={handleToggleViewMode}
                    className="flex items-center px-3 py-1.5 bg-graphite-400/30 hover:bg-graphite-300/40 border border-graphite-300/30 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                    title={`Switch to ${viewMode === 'tiles' ? 'list' : 'tiles'} view`}
                  >
                    {viewMode === 'tiles' ? <List size={16} /> : <Grid3X3 size={16} />}
                  </button>
                </div>
              )}
              
              {!showSearch && onJumpToBottom && (
                <div className="hidden sm:block">
                  <button
                    onClick={onJumpToBottom}
                    className="flex items-center px-3 py-1.5 bg-graphite-400/30 hover:bg-graphite-300/40 border border-graphite-300/30 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                    title="Jump to bottom of events"
                  >
                    <ArrowDown size={16} />
                  </button>
                </div>
              )}
            </>
          )}
          {!showSearch && showInsightsButton && onOpenInsights && (
            <div className="hidden sm:block">
              <button 
                onClick={onOpenInsights}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-graphite-300/40 text-text-secondary hover:text-text-primary transition-all duration-200"
                title="View about"
              >
                <Lightbulb size={16} />
              </button>
            </div>
          )}
          {!showSearch && (
            <div className="hidden sm:block">
              <a
                href={APP_CONFIG.GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-graphite-300/40 text-text-secondary hover:text-text-primary transition-all duration-200"
                title={APP_CONFIG.GITHUB_TOOLTIP}
              >
                <Github size={16} />
              </a>
            </div>
          )}
          <ConnectionStatus />
        </div>
        </div>
        
        {/* Search row */}
        {showSearch && (
          <div className="w-full px-1 sm:px-2 pb-3">
            <SearchBar
              value={searchQuery}
              onChange={onSearchChange || (() => {})}
              placeholder="Search events by title, location, date, time, or link..."
              isSearching={isSearching}
              className="w-full"
            />
          </div>
        )}
      </div>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 sm:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="absolute top-16 left-2 right-2 bg-graphite-400/95 border border-graphite-300/30 backdrop-blur-md rounded-xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-3">
              {showEventsControls && onToggleViewMode && (
                <button
                  onClick={() => {
                    handleToggleViewMode();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-graphite-400/30 hover:bg-graphite-300/40 border border-graphite-300/30 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                >
                  <span>Switch to {viewMode === 'tiles' ? 'list' : 'tiles'} view</span>
                  {viewMode === 'tiles' ? <List size={16} /> : <Grid3X3 size={16} />}
                </button>
              )}
              
              {showEventsControls && onJumpToBottom && (
                <button
                  onClick={() => {
                    onJumpToBottom();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-graphite-400/30 hover:bg-graphite-300/40 border border-graphite-300/30 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                >
                  <span>Jump to bottom</span>
                  <ArrowDown size={16} />
                </button>
              )}
              
              {showInsightsButton && onOpenInsights && (
                <button 
                  onClick={() => {
                    onOpenInsights();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-graphite-400/30 hover:bg-graphite-300/40 border border-graphite-300/30 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                >
                  <span>About</span>
                  <Lightbulb size={16} />
                </button>
              )}
              
              <a
                href={APP_CONFIG.GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between px-4 py-3 bg-graphite-400/30 hover:bg-graphite-300/40 border border-graphite-300/30 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>GitHub</span>
                <Github size={16} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}