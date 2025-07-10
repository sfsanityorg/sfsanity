/**
 * Custom hook for search functionality using Fuse.js
 * Provides fuzzy search capabilities across events data
 */

import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Event } from '../lib/supabase';
import { APP_CONFIG } from '../config/app';

interface UseSearchOptions {
  /** Array of events to search through */
  data: Event[];
  /** Keys to search in the event objects */
  searchKeys?: string[];
  /** Fuse.js options for search configuration */
  fuseOptions?: Fuse.IFuseOptions<Event>;
}

/**
 * Hook for implementing search functionality with fuzzy matching
 * @param options - Configuration options for search
 * @returns Object containing search results and search function
 */
export function useSearch({ 
  data, 
  searchKeys = ['event_title', 'location', 'link', 'time_pst', 'date'],
  fuseOptions = {}
}: UseSearchOptions) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  /**
   * Fuse.js instance with configured options
   */
  const fuse = useMemo(() => {
    const defaultOptions: Fuse.IFuseOptions<Event> = {
      keys: searchKeys,
      threshold: 0.3, // Lower = more strict matching
      distance: 100,
      minMatchCharLength: APP_CONFIG.MIN_SEARCH_CHARACTERS,
      includeScore: true,
      includeMatches: true,
      ...fuseOptions
    };

    return new Fuse(data, defaultOptions);
  }, [data, searchKeys, fuseOptions]);

  /**
   * Performs search operation with debouncing
   * @param query - Search query string
   */
  const search = (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);

    // Clear results if query is too short
    if (query.length < APP_CONFIG.MIN_SEARCH_CHARACTERS) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      const results = fuse.search(query, {
        limit: APP_CONFIG.MAX_SEARCH_RESULTS
      });

      // Extract the items from Fuse.js results
      const searchedEvents = results.map(result => result.item);
      setSearchResults(searchedEvents);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Clears search query and results
   */
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  /**
   * Gets highlighted search matches for display
   * @param query - Search query
   * @param text - Text to highlight matches in
   * @returns Text with highlighted matches
   */
  const getHighlightedText = (query: string, text: string): string => {
    if (!query || query.length < APP_CONFIG.MIN_SEARCH_CHARACTERS) {
      return text;
    }

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-accent/20 text-accent">$1</mark>');
  };

  return {
    searchQuery,
    searchResults,
    isSearching,
    hasResults: searchResults.length > 0,
    hasQuery: searchQuery.length >= APP_CONFIG.MIN_SEARCH_CHARACTERS,
    search,
    clearSearch,
    getHighlightedText,
  };
}