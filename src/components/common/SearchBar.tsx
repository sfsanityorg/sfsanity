import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  /** Current search value */
  value: string;
  /** Callback when search value changes */
  onChange: (value: string) => void;
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Whether search is in progress */
  isSearching?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show clear button */
  showClearButton?: boolean;
}

/**
 * Reusable search bar component with search icon and optional clear functionality
 * Provides consistent search UI across the application
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search events by title, location, date, time, or link...",
  isSearching = false,
  className = "",
  showClearButton = true,
}) => {
  /**
   * Handles input change events
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  /**
   * Clears the search input
   */
  const handleClear = () => {
    onChange('');
  };

  /**
   * Handles key press events for search functionality
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search 
          size={16} 
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
            isSearching ? 'text-accent animate-pulse' : 'text-text-tertiary'
          }`} 
        />
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          className="w-full bg-graphite-400/40 border border-graphite-300/30 rounded-lg py-2 pl-10 pr-10 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all duration-200"
          disabled={isSearching}
        />
        {showClearButton && value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
            title="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};