import { useState, useRef, useEffect } from 'react';
import { Command, Search, Grid3X3, List, ArrowDown, Lightbulb, X, Github, Menu, Settings, Calendar, Palette } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
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
  /** Callback to jump to current month */
  onJumpToCurrentMonth?: () => void;
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
  /** Callback to handle tag clicks */
  onTagClick?: (tag: string) => void;
}

/**
 * Top navigation component with command bar and navigation links
 * Features SFSANITY branding and minimal navigation layout
 */
export default function TopNav({ 
  viewMode = 'tiles', 
  onToggleViewMode, 
  onJumpToBottom,
  onJumpToCurrentMonth,
  showEventsControls = false,
  onOpenInsights,
  showInsightsButton = false,
  searchQuery = '',
  onSearchChange,
  isSearching = false,
  showSearch = false,
  onToggleSearch,
  onTagClick
}: TopNavProps) {
  const [setIsExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

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
   * Handles tag click
   */
  const handleTagClick = (tag: string) => {
    if (onTagClick) {
      onTagClick(tag);
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
      
      if (isThemeDropdownOpen && 
          themeDropdownRef.current && 
          !themeDropdownRef.current.contains(event.target as Node)) {
        setIsThemeDropdownOpen(false);
      }
    };

    if (showSearch || isThemeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearch, onToggleSearch, isThemeDropdownOpen]);

  return (
    <div
      ref={searchContainerRef}
      className={`fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-2 sm:px-4 transition-all duration-300
        bg-graphite-400/80 border border-graphite-300/30 backdrop-blur-md rounded-xl
        ${showSearch ? 'min-h-32 sm:min-h-28' : 'h-14'}`}
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
              
              {!showSearch && onJumpToCurrentMonth && (
                <div className="hidden sm:block">
                  <button
                    onClick={onJumpToCurrentMonth}
                    className="flex items-center px-3 py-1.5 bg-graphite-400/30 hover:bg-graphite-300/40 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                    title="Jump to current month"
                  >
                    <Calendar size={16} />
                  </button>
                </div>
              )}
              
              {!showSearch && onJumpToBottom && (
                <div className="hidden sm:block">
                  <button
                    onClick={onJumpToBottom}
                    className="flex items-center px-3 py-1.5 bg-graphite-400/30 hover:bg-graphite-300/40 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                    title="Jump to bottom of events"
                  >
                    <ArrowDown size={16} />
                  </button>
                </div>
              )}
            </>
          )}
              
              {!showSearch && onToggleViewMode && (
                <div className="hidden sm:block">
                  <button
                    onClick={handleToggleViewMode}
                    className="flex items-center px-3 py-1.5 bg-graphite-400/30 hover:bg-graphite-300/40 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                    title={`Switch to ${viewMode === 'tiles' ? 'list' : 'tiles'} view`}
                  >
                    {viewMode === 'tiles' ? <List size={16} /> : <Grid3X3 size={16} />}
                  </button>
                </div>
              )}
          
          {!showSearch && (
            /* settings, theme selector */
            <div className="hidden sm:block relative" ref={themeDropdownRef}>
              <button 
                onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-graphite-300/40 text-text-secondary hover:text-text-primary transition-all duration-200"
                title="Change theme"
              >
                <Palette size={16} />
              </button>
              
              {isThemeDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-background-secondary border border-graphite-300/30 rounded-lg shadow-lg z-50">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        setTheme('system');
                        setIsThemeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        theme === 'system' 
                          ? 'bg-accent text-white' 
                          : 'text-text-secondary hover:text-text-primary hover:bg-graphite-300/40'
                      }`}
                    >
                      System
                    </button>
                    <button
                      onClick={() => {
                        setTheme('dark-flat');
                        setIsThemeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        theme === 'dark-flat' 
                          ? 'bg-accent text-white' 
                          : 'text-text-secondary hover:text-text-primary hover:bg-graphite-300/40'
                      }`}
                    >
                      Dark Flat
                    </button>
                    <button
                      onClick={() => {
                        setTheme('light-flat');
                        setIsThemeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        theme === 'light-flat' 
                          ? 'bg-accent text-white' 
                          : 'text-text-secondary hover:text-text-primary hover:bg-graphite-300/40'
                      }`}
                    >
                      Light Flat
                    </button>
                  </div>
                </div>
              )}
            </div>
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
          <div className="w-full px-4 sm:px-6 pb-5 space-y-3">
            <SearchBar
              value={searchQuery}
              onChange={onSearchChange || (() => {})}
              placeholder={APP_CONFIG.SEARCH_PLACEHOLDER_TEXT}
              isSearching={isSearching}
              className="w-full"
            />
            
            {/* Search Tags */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 px-2 sm:px-3">
              {APP_CONFIG.SEARCH_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="px-2 py-1 bg-graphite-400/40 hover:bg-accent/20 border border-graphite-300/30 hover:border-accent/30 rounded-md text-xs text-text-secondary hover:text-accent transition-all duration-200 hover:scale-105"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="absolute top-16 left-2 right-2 bg-background-secondary border border-graphite-300/30 rounded-xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-3">
              {showEventsControls && onToggleViewMode && (
                <button
                  onClick={() => {
                    handleToggleViewMode();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-graphite-400/30 hover:bg-graphite-300/40 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                >
                  <span>Switch to {viewMode === 'tiles' ? 'list' : 'tiles'} view</span>
                  {viewMode === 'tiles' ? <List size={16} /> : <Grid3X3 size={16} />}
                </button>
              )}
              
              {showEventsControls && onJumpToCurrentMonth && (
                <button
                  onClick={() => {
                    onJumpToCurrentMonth();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-graphite-400/30 hover:bg-graphite-300/40 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                >
                  <span>Jump to current month</span>
                  <Calendar size={16} />
                </button>
              )}
              
              {showEventsControls && onJumpToBottom && (
                <button
                  onClick={() => {
                    onJumpToBottom();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-graphite-400/30 hover:bg-graphite-300/40 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
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
                  className="w-full flex items-center justify-between px-4 py-3 bg-graphite-400/30 hover:bg-graphite-300/40 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                >
                  <span>About</span>
                  <Lightbulb size={16} />
                </button>
              )}
              
              <div className="space-y-2">
                <button 
                  onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-graphite-400/30 hover:bg-graphite-300/40 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                >
                  <span>Change Theme</span>
                  <Palette size={16} />
                </button>
                
                {isThemeDropdownOpen && (
                  <div className="ml-4 space-y-1">
                    <button
                      onClick={() => {
                        setTheme('system');
                        setIsThemeDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        theme === 'system' 
                          ? 'bg-accent text-white' 
                          : 'text-text-secondary hover:text-text-primary hover:bg-graphite-300/40'
                      }`}
                    >
                      System
                    </button>
                    <button
                      onClick={() => {
                        setTheme('dark-flat');
                        setIsThemeDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        theme === 'dark-flat' 
                          ? 'bg-accent text-white' 
                          : 'text-text-secondary hover:text-text-primary hover:bg-graphite-300/40'
                      }`}
                    >
                      Dark Flat
                    </button>
                    <button
                      onClick={() => {
                        setTheme('light-flat');
                        setIsThemeDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        theme === 'light-flat' 
                          ? 'bg-accent text-white' 
                          : 'text-text-secondary hover:text-text-primary hover:bg-graphite-300/40'
                      }`}
                    >
                      Light Flat
                    </button>
                  </div>
                )}
              </div>
              
              <a
                href={APP_CONFIG.GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between px-4 py-3 bg-graphite-400/30 hover:bg-graphite-300/40 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
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