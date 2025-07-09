/**
 * Utility functions for link processing and display
 */

/**
 * Extracts and formats domain name from a URL for display
 * @param url - The full URL to extract domain from
 * @returns Formatted domain name or fallback text
 */
export const getDisplayDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    let domain = urlObj.hostname;
    
    // Remove 'www.' prefix if present
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }
    
    return domain;
  } catch (error) {
    // If URL parsing fails, try to extract domain manually
    const match = url.match(/^https?:\/\/(?:www\.)?([^\/]+)/);
    if (match && match[1]) {
      return match[1];
    }
    
    // Fallback to "Visit" if domain extraction fails
    return 'Visit';
  }
};

/**
 * Validates if a string is a valid URL
 * @param url - String to validate
 * @returns True if valid URL, false otherwise
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};