/**
 * Search results display component
 * Shows search results with highlighting and empty states
 */

import React from 'react';
import { Calendar, ExternalLink, Search } from 'lucide-react';
import { Event } from '../../lib/supabase';
import { getDisplayDomain } from '../../utils/linkUtils';

interface SearchResultsProps {
  /** Search results to display */
  results: Event[];
  /** Current search query */
  query: string;
  /** Whether search is in progress */
  isSearching: boolean;
  /** Whether user has entered a search query */
  hasQuery: boolean;
  /** Function to get highlighted text */
  getHighlightedText: (query: string, text: string) => string;
  /** View mode for results display */
  viewMode?: 'tiles' | 'list';
}

/**
 * Component for displaying search results with highlighting
 */
export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  query,
  isSearching,
  hasQuery,
  getHighlightedText,
  viewMode = 'tiles',
}) => {
  /**
   * Formats date string to readable format
   * Handles string dates from VARCHAR database column
   */
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return original string if not parseable
      }
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString; // Return original string if parsing fails
    }
  };

  /**
   * Formats time string for display
   * Handles string times from VARCHAR database column
   */
  const formatTime = (timeString: string): string => {
    try {
      // If it already contains AM/PM, return as is
      if (timeString.includes('AM') || timeString.includes('PM')) {
        return timeString;
      }
      
      // Try to parse HH:MM format
      const [hours, minutes] = timeString.split(':');
      if (hours && minutes) {
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm} PST`;
      }
      
      return timeString; // Return original if can't parse
    } catch {
      return timeString; // Return original string if parsing fails
    }
  };

  // Loading state
  if (isSearching) {
    return (
      <div className="flex items-center justify-center py-12">
        <Search size={24} className="animate-pulse text-accent mr-3" />
        <span className="text-text-secondary">Searching events...</span>
      </div>
    );
  }

  // Empty state when no query
  if (!hasQuery) {
    return (
      <div className="text-center py-12">
        <Search size={48} className="mx-auto mb-4 text-text-tertiary" />
        <h3 className="text-xl font-medium mb-2">Search Events</h3>
        <p className="text-text-secondary">
          Enter at least 2 characters to search through events
        </p>
      </div>
    );
  }

  // No results state
  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <Search size={48} className="mx-auto mb-4 text-text-tertiary" />
        <h3 className="text-xl font-medium mb-2">No results found</h3>
        <p className="text-text-secondary">
          No events match your search for "{query}". Try different keywords.
        </p>
      </div>
    );
  }

  // Results display
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <p className="text-text-secondary">
          Found {results.length} event{results.length !== 1 ? 's' : ''} for "{query}"
        </p>
      </div>

      {viewMode === 'tiles' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((event) => (
            <div
              key={event.id}
              className="card hover:translate-y-[-4px] group transition-all duration-300 ease-out cursor-pointer border-l-2 border-accent"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                  {event.location}
                </span>
                <span className="text-xs text-text-tertiary whitespace-nowrap">
                  {formatDate(event.date)} • {formatTime(event.time_pst)}
                </span>
              </div>
              
              <h3 
                className="text-xl font-medium mb-2 group-hover:text-accent transition-colors"
              >
                <span dangerouslySetInnerHTML={{ 
                  __html: getHighlightedText(query, event.event_title) 
                }} />
              </h3>
              
              <div className="text-sm text-text-secondary mb-2">
                <span dangerouslySetInnerHTML={{ 
                  __html: getHighlightedText(query, event.location) 
                }} />
              </div>
              
              <div className="text-xs text-text-tertiary mb-4">
                <span dangerouslySetInnerHTML={{ 
                  __html: getHighlightedText(query, event.time_pst) 
                }} />
              </div>
              
              <div className="flex items-center justify-start mt-auto">
                {event.link && (
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-accent text-sm hover:underline group-hover:translate-x-1 transition-transform"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="mr-1" dangerouslySetInnerHTML={{ 
                      __html: getHighlightedText(query, getDisplayDomain(event.link)) 
                    }} />
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((event) => (
            <div
              key={event.id}
              className="card hover:translate-x-1 group transition-all duration-300 ease-out cursor-pointer border-l-2 border-accent"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                        <span dangerouslySetInnerHTML={{ 
                          __html: getHighlightedText(query, event.location) 
                        }} />
                      </span>
                      <h3 
                        className="text-lg font-medium group-hover:text-accent transition-colors"
                      >
                        <span dangerouslySetInnerHTML={{ 
                          __html: getHighlightedText(query, event.event_title) 
                        }} />
                      </h3>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-text-tertiary whitespace-nowrap">
                        <span dangerouslySetInnerHTML={{ 
                          __html: getHighlightedText(query, formatDate(event.date)) 
                        }} /> • <span dangerouslySetInnerHTML={{ 
                          __html: getHighlightedText(query, formatTime(event.time_pst)) 
                        }} />
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    {event.link && (
                      <a
                        href={event.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-accent text-sm hover:underline group-hover:translate-x-1 transition-transform"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="mr-1" dangerouslySetInnerHTML={{ 
                          __html: getHighlightedText(query, getDisplayDomain(event.link)) 
                        }} />
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};