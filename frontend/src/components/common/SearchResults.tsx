/**
 * Search results display component
 * Shows search results with highlighting and empty states
 */

import React from 'react';
import { Calendar, ExternalLink, Search } from 'lucide-react';
import { Event } from '../../lib/supabase';
import { getDisplayDomain } from '../../utils/linkUtils';
import { formatDate, formatTime, getDisplayMonthYear } from '../../utils/dateUtils';

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {results.map((event, index) => {
            const currentMonthYear = getDisplayMonthYear(event.date);
            const previousMonthYear = index > 0 ? getDisplayMonthYear(results[index - 1].date) : null;
            const showSeparator = index > 0 && currentMonthYear !== previousMonthYear;

            return (
              <React.Fragment key={event.id}>
                {showSeparator && (
                  <div className="col-span-full text-center py-4 text-text-secondary font-medium text-sm border-t border-graphite-300/30 mt-4">
                    {currentMonthYear}
                  </div>
                )}
                <div className="card hover:translate-y-[-2px] sm:hover:translate-y-[-4px] group transition-all duration-300 ease-out cursor-pointer border-l-2 border-accent p-4 sm:p-6">
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                  {event.location}
                </span>
                <span className="text-xs text-text-tertiary whitespace-nowrap ml-2">
                  {formatDate(event.date)} • {formatTime(event.time_pst)}
                </span>
              </div>
              
              <h3 
                className="text-lg sm:text-xl font-medium mb-2 group-hover:text-accent transition-colors line-clamp-2"
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
                    className="flex items-center text-accent text-xs sm:text-sm hover:underline group-hover:translate-x-1 transition-transform"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="mr-1" dangerouslySetInnerHTML={{ 
                      __html: getHighlightedText(query, getDisplayDomain(event.link)) 
                    }} />
                    <ExternalLink size={12} className="sm:w-[14px] sm:h-[14px]" />
                  </a>
                )}
              </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((event, index) => {
            const currentMonthYear = getDisplayMonthYear(event.date);
            const previousMonthYear = index > 0 ? getDisplayMonthYear(results[index - 1].date) : null;
            const showSeparator = index > 0 && currentMonthYear !== previousMonthYear;

            return (
              <React.Fragment key={event.id}>
                {showSeparator && (
                  <div className="text-center py-4 text-text-secondary font-medium text-sm border-t border-graphite-300/30 mt-4">
                    {currentMonthYear}
                  </div>
                )}
                <div className="card hover:translate-x-1 group transition-all duration-300 ease-out cursor-pointer border-l-2 border-accent p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                        <span dangerouslySetInnerHTML={{ 
                          __html: getHighlightedText(query, event.location) 
                        }} />
                      </span>
                      <h3 
                        className="text-base sm:text-lg font-medium group-hover:text-accent transition-colors"
                      >
                        <span dangerouslySetInnerHTML={{ 
                          __html: getHighlightedText(query, event.event_title) 
                        }} />
                      </h3>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-text-tertiary whitespace-nowrap self-start sm:self-center">
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
                        className="inline-flex items-center text-accent text-xs sm:text-sm hover:underline group-hover:translate-x-1 transition-transform"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="mr-1" dangerouslySetInnerHTML={{ 
                          __html: getHighlightedText(query, getDisplayDomain(event.link)) 
                        }} />
                        <ExternalLink size={12} className="sm:w-[14px] sm:h-[14px]" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};