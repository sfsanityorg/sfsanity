import React, { useState, useRef, useEffect } from 'react';
import { Command, Search, Grid3X3, List, ArrowDown, Lightbulb, X, Github } from 'lucide-react';
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
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 transition-all duration-300
        bg-graphite-400/80 border border-graphite-300/30 backdrop-blur-md rounded-xl
        ${showSearch ? 'h-20' : `h-${APP_CONFIG.TOP_NAV_HEIGHT_COLLAPSED}`}`}
    >
      <div className={`h-full flex ${showSearch ? 'flex-col' : 'items-center'} justify-between`}>
        {/* Main navigation row */}
        <div className={`${showSearch ? 'h-14' : 'h-full'} flex items-center justify-between w-full`}>
        <div className="flex items-center space-x-1 flex-1">
          <button 
            onClick={toggleExpand}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-graphite-300/40 invisible"
          >
            <Command size={18} className="text-text-secondary" />
          </button>
        </div>

        {/* Centered SFSANITY */}
        <div className="flex items-center justify-center flex-1">
          <span className="text-xl text-text-tertiary tracking-wider font-medium">SFSanity </span>
        </div>

        {/* Right spacer to maintain centering */}
        <div className="flex items-center flex-1 justify-end space-x-2">
          {showEventsControls && (
            <>
              <button 
                onClick={onToggleSearch}
                className={`w-9 h-9 flex items-center justify-center rounded-full hover:bg-graphite-300/40 text-text-secondary hover:text-text-primary transition-all duration-200 ${showSearch ? 'order-last' : ''}`}
                title={showSearch ? "Close search" : "Search events"}
              >
                {showSearch ? <X size={18} /> : <Search size={18} />}
              </button>
              
              {!showSearch && onToggleViewMode && (
                <button
                  onClick={handleToggleViewMode}
                  className="flex items-center px-3 py-1.5 bg-graphite-400/30 hover:bg-graphite-300/40 border border-graphite-300/30 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                  title={`Switch to ${viewMode === 'tiles' ? 'list' : 'tiles'} view`}
                >
                  {viewMode === 'tiles' ? <List size={16} /> : <Grid3X3 size={16} />}
                </button>
              )}
              
              {!showSearch && onJumpToBottom && (
                <button
                  onClick={onJumpToBottom}
                  className="flex items-center px-3 py-1.5 bg-graphite-400/30 hover:bg-graphite-300/40 border border-graphite-300/30 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                  title="Jump to bottom of events"
                >
                  <ArrowDown size={16} />
                </button>
              )}
            </>
          )}
          {!showSearch && showInsightsButton && onOpenInsights && (
            <button 
              onClick={onOpenInsights}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-graphite-300/40 text-text-secondary hover:text-text-primary transition-all duration-200"
              title="View insights"
            >
              <Lightbulb size={16} />
            </button>
          )}
          {!showSearch && (
            <a
              href={APP_CONFIG.GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-graphite-300/40 text-text-secondary hover:text-text-primary transition-all duration-200"
              title={APP_CONFIG.GITHUB_TOOLTIP}
            >
              <Github size={16} />
            </a>
          )}
          <ConnectionStatus />
        </div>
        </div>
        
        {/* Search row */}
        {showSearch && (
          <div className="w-full px-2 pb-3">
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
    </div>
  );
}