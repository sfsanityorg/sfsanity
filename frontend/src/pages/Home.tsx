import React from 'react';
import { ExternalLink, Loader2, Plus, ArrowUp } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import { APP_CONFIG } from '../config/app';
import { DatabaseErrorMessage } from '../components/common/DatabaseErrorMessage';
import { AppContext } from '../App';
import { getDisplayDomain } from '../utils/linkUtils';
import { formatDate, formatTime, getDisplayMonthYear } from '../utils/dateUtils';

interface HomeProps {
  /** Whether the insights modal is open */
  isInsightsModalOpen?: boolean;
  /** Function to set insights modal state */
  setIsInsightsModalOpen?: (open: boolean) => void;
}

/**
 * Home page component
 * Displays the main dashboard with focus areas and recent events
 */
// FIXME isInsightsModalOpen, setIsInsightsModalOpen unused ?
// export const Home: React.FC<HomeProps> = ({ isInsightsModalOpen, setIsInsightsModalOpen }) => {
export const Home: React.FC<HomeProps> = () => {
  const { 
    viewMode,
    searchQuery,
    searchResults,
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
    loadMoreEvents,
    retryLastOperation,
    debugInfo
  } = useEvents();
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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

  /**
   * Gets events for display on home page
   */
  const recentEvents = hasQuery ? searchResults : events;

  /**
   * Handles loading more events without reloading existing ones
   */
  const handleLoadMore = async () => {
    await loadMoreEvents();
  };

  /**
   * Scrolls to the top of the recent events section
   */
  const jumpToEventsTop = () => {
    const eventsSection = document.querySelector('#recent-events-section');
    if (eventsSection) {
      eventsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  

  return (
    <div className="max-w-4xl mx-auto pt-16 sm:pt-20 pb-12 px-2 sm:px-4">
      <div className="grid grid-cols-1 gap-6">
        {/* Recent Events */}
        <div id="recent-events-section" className="card bg-gradient-to-b from-background-secondary to-background p-4 sm:p-8">
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
            <h2 className="text-lg sm:text-xl font-medium tracking-tight">{ APP_CONFIG.HOME_EVENTS_HEADING }</h2>
            <div className="flex items-center gap-2 sm:gap-3 ml-auto flex-wrap">
              {hasQuery && (
                <span className="bg-accent-subtle px-3 py-1 rounded-full text-xs text-accent">
                  {searchResults.length} results
                </span>
              )}
              <span className="bg-accent-subtle px-3 py-1 rounded-full text-xs text-accent">
                {recentEvents.length} events loaded
              </span>
              <span className="text-text-secondary text-xs sm:text-sm hidden sm:inline">
                {currentDate}
              </span>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-accent mr-3" />
              <span className="text-text-secondary">Loading events...</span>
            </div>
          ) : error ? (
            <>
              {/* Debug information for development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                  <h4 className="text-yellow-200 font-medium mb-2">Debug Information</h4>
                  <div className="text-yellow-200/80 text-sm space-y-1">
                    <p>Database Table: {APP_CONFIG.DATABASE_TARGET_TABLE}</p>
                    <p>Events Loaded: {events.length}</p>
                    <p>Has Query: {hasQuery ? 'Yes' : 'No'}</p>
                    <p>Search Results: {searchResults.length}</p>
                    {debugInfo && (
                      <>
                        <p>Table Exists: {debugInfo.tableExists ? 'Yes' : 'No'}</p>
                        <p>Record Count: {debugInfo.recordCount}</p>
                        <p>Fetched Count: {debugInfo.fetchedCount}</p>
                        <p>Query Status: {debugInfo.query}</p>
                        {debugInfo.sampleData && (
                          <details className="mt-2">
                            <summary className="cursor-pointer">Sample Data</summary>
                            <pre className="mt-1 text-xs bg-black/20 p-2 rounded overflow-auto">
                              {JSON.stringify(debugInfo.sampleData, null, 2)}
                            </pre>
                          </details>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            <div className="py-12">
              <DatabaseErrorMessage
                error={error}
                onRetry={retryLastOperation}
                isRetrying={isRetrying}
                context="Unable to load recent events for your dashboard."
              />
            </div>
            </>
          ) : (
            <>
              {/* Show connection warning if there are cached events but we have an error */}
              {events.length > 0 && error && (
                <div className="bg-background-secondary rounded-lg p-4 border border-yellow-500/20 mb-6">
                  <p className="text-text-secondary text-sm">
                    ⚠️ Showing cached events. Live updates are currently unavailable.
                  </p>
                </div>
              )}
              
            <>
              {viewMode === 'tiles' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {recentEvents.map((event, index) => {
                    const currentMonthYear = getDisplayMonthYear(event.date);
                    const previousMonthYear = index > 0 ? getDisplayMonthYear(recentEvents[index - 1].date) : null;
                    const showSeparator = index > 0 && currentMonthYear !== previousMonthYear;

                    return (
                      <React.Fragment key={event.id}>
                        {showSeparator && (
                          <div className="col-span-full text-center py-4 text-text-secondary font-medium text-sm border-t border-graphite-300/30 mt-4">
                            {currentMonthYear}
                          </div>
                        )}
                        <div className="bg-graphite-400/30 rounded-lg p-3 sm:p-4 hover:bg-graphite-400/40 transition-colors group">
                      <div className="flex justify-between items-start mb-2 sm:mb-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                          {event.location}
                        </span>
                        <span className="text-xs text-text-tertiary whitespace-nowrap ml-2">
                          {formatDate(event.date)} • {formatTime(event.time_pst)}
                        </span>
                      </div>
                      
                      <h3 className="text-sm sm:text-base font-medium mb-2 group-hover:text-accent transition-colors line-clamp-2">
                        {hasQuery ? (
                          <span dangerouslySetInnerHTML={{ 
                            __html: getHighlightedText(searchQuery, event.event_title) 
                          }} />
                        ) : (
                          event.event_title
                        )}
                      </h3>
                      
                      {hasQuery && (
                        <div className="text-xs text-text-secondary mb-2">
                          <span dangerouslySetInnerHTML={{ 
                            __html: getHighlightedText(searchQuery, event.location) 
                          }} /> • <span dangerouslySetInnerHTML={{ 
                            __html: getHighlightedText(searchQuery, formatTime(event.time_pst)) 
                          }} />
                        </div>
                      )}
                      
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
                            <span>
                              {hasQuery ? (
                                <span dangerouslySetInnerHTML={{ 
                                  __html: getHighlightedText(searchQuery, getDisplayDomain(event.link)) 
                                }} />
                              ) : (
                                getDisplayDomain(event.link)
                              )}
                            </span>
                          </a>
                        )}
                      </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {recentEvents.map((event, index) => {
                    const currentMonthYear = getDisplayMonthYear(event.date);
                    const previousMonthYear = index > 0 ? getDisplayMonthYear(recentEvents[index - 1].date) : null;
                    const showSeparator = index > 0 && currentMonthYear !== previousMonthYear;

                    return (
                      <React.Fragment key={event.id}>
                        {showSeparator && (
                          <div className="text-center py-4 text-text-secondary font-medium text-sm border-t border-graphite-300/30 mt-4">
                            {currentMonthYear}
                          </div>
                        )}
                        <div className="bg-graphite-400/30 rounded-lg p-3 sm:p-4 hover:bg-graphite-400/40 transition-colors group">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                                {hasQuery ? (
                                  <span dangerouslySetInnerHTML={{ 
                                    __html: getHighlightedText(searchQuery, event.location) 
                                  }} />
                                ) : (
                                  event.location
                                )}
                              </span>
                              <h3 className="text-sm sm:text-base font-medium group-hover:text-accent transition-colors">
                                {hasQuery ? (
                                  <span dangerouslySetInnerHTML={{ 
                                    __html: getHighlightedText(searchQuery, event.event_title) 
                                  }} />
                                ) : (
                                  event.event_title
                                )}
                              </h3>
                            </div>
                            <span className="text-xs text-text-tertiary whitespace-nowrap self-start sm:self-center">
                              <span dangerouslySetInnerHTML={{ 
                                __html: hasQuery ? getHighlightedText(searchQuery, formatDate(event.date)) : formatDate(event.date) 
                              }} /> • {hasQuery ? (
                                <span dangerouslySetInnerHTML={{ 
                                  __html: getHighlightedText(searchQuery, formatTime(event.time_pst)) 
                                }} />
                              ) : (
                                formatTime(event.time_pst)
                              )}
                            </span>
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
                                <span>
                                  {hasQuery ? (
                                    <span dangerouslySetInnerHTML={{ 
                                      __html: getHighlightedText(searchQuery, getDisplayDomain(event.link)) 
                                    }} />
                                  ) : (
                                    getDisplayDomain(event.link)
                                  )}
                                </span>
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
              
              {/* Load More Button - Always Visible */}
              {hasMore && !hasQuery && (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-6 sm:mt-8">
                <button
                    onClick={handleLoadMore}
                    disabled={loading || isLoadingMore}
                    className="flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-graphite-400/40 hover:bg-graphite-300/40 border border-graphite-300/30 rounded-lg text-text-primary transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                    {isLoadingMore ? (
                      <>
                        <Loader2 size={16} className="sm:w-[18px] sm:h-[18px] animate-spin mr-2" />
                        Loading more events...
                      </>
                    ) : (
                      <>
                        <Plus size={16} className="sm:w-[18px] sm:h-[18px] mr-2" />
                        Load {APP_CONFIG.EVENTS_LOAD_MORE_BATCH_SIZE} more events
                      </>
                    )}
                </button>
                <button
                  onClick={jumpToEventsTop}
                  className="flex items-center px-3 sm:px-4 py-2 sm:py-3 bg-graphite-400/40 hover:bg-graphite-300/40 border border-graphite-300/30 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                  title="Jump to top of events"
                >
                  <ArrowUp size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
                </div>
              )}
            </>
            </>
          )}
          
        </div>
      </div>
    </div>
  );
};