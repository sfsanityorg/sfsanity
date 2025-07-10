/**
 * Application configuration constants
 * Centralized configuration for app-wide settings
 */

export const APP_CONFIG = {
  /** Database Configuration */
  /** Target database table for events data */
  DATABASE_TARGET_TABLE: 'events_dev' as const,
  
  /** Event ordering configuration */
  /** Order events by ID in ascending order (lowest/oldest first) */
  EVENTS_ORDER_BY_ID_ASC: true,
  
  /** UI and Display Settings */
  /** Default view mode for events display */
  DEFAULT_EVENTS_VIEW_MODE: 'list' as 'tiles' | 'list',
  
  /** Data Loading Settings */
  /** Number of events to load per batch when clicking "Load More" */
  EVENTS_LOAD_MORE_BATCH_SIZE: 25,
  /** Initial number of events to load on page load */
  EVENTS_INITIAL_LOAD_SIZE: 25,
  
  /** Connection and Retry Settings */
  /** Interval for automatic connection checks (in milliseconds) */
  CONNECTION_CHECK_INTERVAL: 30000,
  /** Timeout for database operations (in milliseconds) */
  DATABASE_TIMEOUT: 10000,
  /** Number of retry attempts for failed operations */
  MAX_RETRY_ATTEMPTS: 3,
  /** Delay between retry attempts (in milliseconds) */
  RETRY_DELAY: 2000,
  
  /** Rate Limiting Settings */
  /** Suggested wait time for rate limit errors (in seconds) */
  RATE_LIMIT_WAIT_TIME: 60,
  /** General error wait time (in seconds) */
  GENERAL_ERROR_WAIT_TIME: 5,
  
  /** Animation and Transition Settings */
  /** Page transition duration (in seconds) */
  PAGE_TRANSITION_DURATION: 0.4,
  /** Page transition easing curve */
  PAGE_TRANSITION_EASING: [0.43, 0.13, 0.23, 0.96] as const,
  
  /** Layout Settings */
  /** Top navigation height when expanded (in rem) */
  TOP_NAV_HEIGHT_EXPANDED: 16,
  /** Top navigation height when collapsed (in rem) */
  TOP_NAV_HEIGHT_COLLAPSED: 14,
  /** Container padding for pages (in rem) */
  PAGE_CONTAINER_PADDING: 4,
  /** Top padding for page content (in rem) */
  PAGE_TOP_PADDING: 32,
  /** Bottom padding for page content (in rem) */
  PAGE_BOTTOM_PADDING: 12,
  
  /** Search and Filter Settings */
  /** Minimum characters required for search */
  MIN_SEARCH_CHARACTERS: 2,
  /** Search debounce delay (in milliseconds) */
  SEARCH_DEBOUNCE_DELAY: 300,
  /** Maximum number of search results to display */
  MAX_SEARCH_RESULTS: 50,
  
  /** Cache Settings */
  /** How long to cache events data (in milliseconds) */
  EVENTS_CACHE_DURATION: 300000, // 5 minutes
  /** Maximum number of events to keep in cache */
  MAX_CACHED_EVENTS: 1000,
  
  /** Error Display Settings */
  /** Whether to show technical error details to users */
  SHOW_TECHNICAL_ERROR_DETAILS: true,
  /** Maximum length of error messages to display */
  MAX_ERROR_MESSAGE_LENGTH: 200,
  
  /** External Links */
  GITHUB_URL: 'https://github.com/sfsanityorg/sfsanity/issues' as const,
  GITHUB_TOOLTIP: 'Raise issues and feature requests on Github' as const,
  
  /** Insights Settings */
  /** Default expanded state for Insights section */
  INSIGHTS_DEFAULT_EXPANDED: false,
} as const;