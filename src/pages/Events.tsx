/**
 * Events page component
 * Displays a list of events from the Supabase database with search and filter functionality
 */

import React, { useState } from 'react';
import { Calendar, Clock, Filter, Loader2, Grid3X3, List, Plus, ExternalLink } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import { APP_CONFIG } from '../config/app';
import { DatabaseErrorMessage } from '../components/common/DatabaseErrorMessage';
import { SearchResults } from '../components/common/SearchResults';
import { AppContext } from '../App';
import { getDisplayDomain } from '../utils/linkUtils';

export const Events: React.FC = () => {
  const {
    searchQuery,
    searchResults,
    isSearching,
    hasQuery,
    getHighlightedText,
  } = React.useContext(AppContext);
  
  const { 
    events, 
    loading, 
    isLoadingMore,
    error, 
    isRetrying,
    hasMore,
    retryLastOperation,
    loadMoreEvents 
  } = useEvents();
  
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'tiles' | 'list'>('tiles');

  /**
   * Handles loading more events without reloading existing ones
   */
  const handleLoadMore = async () => {
    await loadMoreEvents();
  };
  
  /**
   * Gets relative time (e.g., "2 days ago") from date string
   * Handles string dates from VARCHAR database column
   */
  const getRelativeTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return original string if not parseable
      }
      
      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) {
        return 'Today';
      } else if (diffInDays === 1) {
        return 'Yesterday';
      } else if (diffInDays < 7) {
        return `${diffInDays}d ago`;
      } else {
        return `${Math.floor(diffInDays / 7)}w ago`;
      }
    } catch {
      return dateString; // Return original string if parsing fails
    }
  };
  
  if (error) {
    return (
      <div className="container mx-auto px-4 pt-32 pb-12">
        <div className="mb-8">
          <h1 className="text-title mb-3 tracking-tight">Events</h1>
          <p className="text-text-secondary text-subtitle max-w-lg">
            Discover upcoming tech events, conferences, and meetups
          </p>
        </div>
        
        <DatabaseErrorMessage
          error={error}
          onRetry={retryLastOperation}
          isRetrying={isRetrying}
          context="We're having trouble connecting to load the events. This might be due to high traffic or a temporary connection issue."
        />
        
        {/* Show cached events if available */}
        {events.length > 0 && (
          <div className="mt-8">
            <div className="bg-background-secondary rounded-lg p-4 border border-graphite-300/30 mb-6">
              <p className="text-text-secondary text-sm">
                Showing {events.length} previously loaded events. Some data may be outdated.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
              {events.slice(0, 6).map((event) => (
                <div
                  key={event.id}
                  className="card border-l-2 border-graphite-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-graphite-300/20 text-text-secondary">
                      {event.location}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      {getRelativeTime(event.date)}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-medium mb-2 text-text-secondary">
                    {event.event_title}
                  </h3>
                  <div className="text-text-tertiary text-sm mb-6">
                    <p className="mb-2">
                      <span className="font-medium">Time:</span> {event.time_pst} PST
                    </p>
                    <p>
                      <span className="font-medium">Location:</span> {event.location}
                    </p>
                  </div>
                
                  <div className="flex items-center justify-start">
                    {event.link && (
                      <a
                        href={event.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-accent text-xs hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={12} className="mr-1" />
                        <span>{getDisplayDomain(event.link)}</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 pt-20 sm:pt-32 pb-12">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 sm:gap-8 mb-12 sm:mb-16">
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-title mb-3 tracking-tight">Events</h1>
          <p className="text-text-secondary text-base sm:text-subtitle max-w-lg">
            Discover upcoming tech events, conferences, and meetups
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 lg:gap-6 text-text-tertiary text-xs sm:text-sm mt-4 sm:mt-6">
            <div className="flex items-center bg-graphite-400/30 px-3 py-1.5 rounded-lg">
              <Calendar size={16} className="mr-2" />
              <span>{events.length} Events</span>
            </div>
            <div className="flex items-center bg-graphite-400/30 px-3 py-1.5 rounded-lg">
              <Clock size={16} className="mr-2" />
              <span>Live Updates</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-graphite-400/30 rounded-lg p-1 border border-graphite-300/30">
            <button 
              className={`px-2 sm:px-3 py-2 rounded text-sm transition-colors flex items-center ${viewMode === 'tiles' ? 'bg-graphite-300 text-white' : 'text-text-secondary hover:text-text-primary'}`}
              onClick={() => setViewMode('tiles')}
              title="Tiles view"
            >
              <Grid3X3 size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
            <button 
              className={`px-2 sm:px-3 py-2 rounded text-sm transition-colors flex items-center ${viewMode === 'list' ? 'bg-graphite-300 text-white' : 'text-text-secondary hover:text-text-primary'}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <List size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="cmd-btn text-xs sm:text-sm"
          >
            <Filter size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="ml-1 text-sm">Filter</span>
          </button>
        </div>
      </div>

      {/* Search Results or Events Display */}
      {hasQuery ? (
        <SearchResults
          results={searchResults}
          query={searchQuery}
          isSearching={isSearching}
          hasQuery={hasQuery}
          getHighlightedText={getHighlightedText}
          viewMode={viewMode}
        />
      ) : (
        <>
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-accent mr-3" />
              <span className="text-text-secondary">Loading events...</span>
            </div>
          )}

          {/* Events Display */}
          {!loading && (
            <SearchResults
              results={events}
              query=""
              isSearching={false}
              hasQuery={false}
              getHighlightedText={() => ''}
              viewMode={viewMode}
            />
          )}

          {/* Load More Button */}
          {!loading && hasMore && events.length > 0 && (
            <div className="flex justify-center mt-8 sm:mt-12">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-graphite-400/40 hover:bg-graphite-300/40 border-2 border-red-500 rounded-lg text-text-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-lg text-sm sm:text-base"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 size={16} className="sm:w-[18px] sm:h-[18px] animate-spin mr-2" />
                    Loading {APP_CONFIG.EVENTS_LOAD_MORE_BATCH_SIZE} more events...
                  </>
                ) : (
                  <>
                    <Plus size={16} className="sm:w-[18px] sm:h-[18px] mr-2" />
                    Load {APP_CONFIG.EVENTS_LOAD_MORE_BATCH_SIZE} more events
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};