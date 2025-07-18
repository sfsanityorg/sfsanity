/**
 * Utility functions for date and time formatting
 * Centralized date handling for consistent formatting across the application
 */

/**
 * Formats date string to readable format
 * Handles string dates from VARCHAR database column
 * @param dateString - Date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
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
 * @param timeString - Time string to format
 * @returns Formatted time string
 */
export const formatTime = (timeString: string): string => {
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
 * Gets display month and year from date string
 * Used for month separators in event lists
 * @param dateString - Date string to extract month/year from
 * @returns Formatted month and year string (e.g., "July 2025")
 */
export const getDisplayMonthYear = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return original string if not parseable
    }
    return date.toLocaleDateString('en-US', {
      month: 'long',
      // year: 'numeric',
    });
  } catch {
    return dateString; // Return original string if parsing fails
  }
};

/**
 * Gets relative time (e.g., "2 days ago") from date string
 * Handles string dates from VARCHAR database column
 * @param dateString - Date string to get relative time for
 * @returns Relative time string
 */
export const getRelativeTime = (dateString: string): string => {
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