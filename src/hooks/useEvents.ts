/**
 * Custom hook for managing events data from Supabase
 * Provides CRUD operations and real-time subscriptions for events
 */

import { useState, useEffect } from 'react';
import { supabase, type Event } from '../lib/supabase';
import { APP_CONFIG } from '../config/app';
import { DatabaseErrorMessage } from '../components/common/DatabaseErrorMessage';

/**
 * Hook for fetching and managing events data
 * @returns Object containing events data, loading state, and error state
 */
export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  /**
   * Fetches events from the events_dev database table
   * Orders by ID in ascending order (oldest events first) as configured in APP_CONFIG
   * @param loadMore - Whether to append to existing events or replace them
   */
  const fetchEvents = async (loadMore = false) => {
    try {
      if (loadMore) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      setIsRetrying(false);
      
      console.log('🔍 Fetching events from table:', APP_CONFIG.DATABASE_TARGET_TABLE);
      console.log('📊 Load more:', loadMore, 'Current offset:', offset);
      
      // Test connection first
      const connectionTest = await supabase.auth.getSession();
      console.log('🔐 Connection test result:', connectionTest);
      
      // Check if there's already an active session before attempting anonymous auth
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔐 Current session:', session ? 'exists' : 'none');
      
      if (!session) {
        console.log('🔑 Attempting anonymous authentication...');
        // Only sign in anonymously if no session exists
        const { error: authError } = await supabase.auth.signInAnonymously();
        if (authError) {
          console.error('❌ Anonymous auth failed:', authError.message);
          // Handle authentication errors properly
          if (authError.message.includes('over_request_rate_limit') || authError.message.includes('rate limit')) {
            throw new Error('Authentication rate limit reached. Please wait a moment and try again.');
          } else {
            throw new Error(`Authentication failed: ${authError.message}`);
          }
        } else {
          console.log('✅ Anonymous auth successful');
        }
      }
      
      const currentOffset = loadMore ? offset : 0;
      const batchSize = loadMore ? APP_CONFIG.EVENTS_LOAD_MORE_BATCH_SIZE : APP_CONFIG.EVENTS_INITIAL_LOAD_SIZE;
      
      console.log('📋 Query params:', { currentOffset, batchSize, table: APP_CONFIG.DATABASE_TARGET_TABLE });
      
      // First, let's check if the table exists and has data
      console.log('🔍 Checking table existence and data...');
      const { count, error: countError } = await supabase
        .from(APP_CONFIG.DATABASE_TARGET_TABLE)
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('❌ Count query failed:', countError);
        throw new Error(`Table access failed: ${countError.message}`);
      }
      
      console.log('📊 Total records in table:', count);
      
      if (count === 0) {
        console.log('⚠️ Table is empty');
        setEvents([]);
        setHasMore(false);
        setDebugInfo({ tableExists: true, recordCount: 0, query: 'empty table' });
        return;
      }
      
      const { data, error } = await supabase
        .from(APP_CONFIG.DATABASE_TARGET_TABLE)
        .select('*')
        .order('id', { ascending: true }) // Lowest IDs first (oldest events)
        .range(currentOffset, currentOffset + batchSize - 1);

      if (error) {
        console.error('❌ Database query error:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      const eventsData = data || [];
      console.log(`✅ Fetched ${eventsData.length} events successfully`);
      if (eventsData.length > 0) {
        console.log('📄 Sample event data:', eventsData[0]);
        console.log('📄 Event data structure:', Object.keys(eventsData[0]));
      }
      
      setDebugInfo({
        tableExists: true,
        recordCount: count,
        fetchedCount: eventsData.length,
        query: 'successful',
        sampleData: eventsData[0] || null
      });
      
      if (loadMore) {
        setEvents(prev => [...prev, ...eventsData]);
        setOffset(prev => prev + eventsData.length);
      } else {
        setEvents(eventsData);
        setOffset(eventsData.length);
      }
      
      setHasMore(eventsData.length === batchSize);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('❌ Fetch events error:', err);
      
      // Provide more specific error messages based on error type
      if (errorMessage.includes('over_request_rate_limit') || errorMessage.includes('rate limit')) {
        setError('Request rate limit reached. Please wait a moment and try again. This helps ensure the service remains available for everyone.');
      } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        setError('Unable to connect to the database. Please check your internet connection and try again.');
      } else if (errorMessage.includes('JWT') || errorMessage.includes('auth')) {
        setError('Authentication failed. Please refresh the page and try again.');
      } else if (errorMessage.includes('timeout')) {
        setError('Request timed out. The server may be experiencing high load. Please try again.');
      } else if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
        setError(`Database table "${APP_CONFIG.DATABASE_TARGET_TABLE}" does not exist. Please check your database configuration.`);
      } else if (errorMessage.includes('permission denied')) {
        setError('Permission denied. Please check your database access policies.');
      } else {
        setError(`Database error: ${errorMessage}`);
      }
      
      if (!loadMore) {
        setEvents([]);
      }
    } finally {
      if (loadMore) {
        setIsLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  /**
   * Retries the last failed operation
   */
  const retryLastOperation = async () => {
    if (isRetrying) return;
    
    setIsRetrying(true);
    try {
      await fetchEvents();
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  };

  /**
   * Clears the current error state
   */
  const clearError = () => setError(null);

  /**
   * Loads more events by calling fetchEvents with loadMore=true
   * This ensures proper offset tracking and prevents reloading existing events
   */
  const loadMoreEvents = async () => {
    if (!hasMore || loading || isLoadingMore) return;
    await fetchEvents(true);
  };

  /**
   * Searches events by name or description
   * @param query - Search query string
   */
  const searchEvents = async (query: string) => {
    try {
      setLoading(true);
      setOffset(0);
      const { data, error } = await supabase
        .from(APP_CONFIG.DATABASE_TARGET_TABLE)
        .select('*')
        .or(`event_title.ilike.%${query}%,location.ilike.%${query}%`)
        .order('id', { ascending: true }) // Lowest IDs first (oldest events)
        .range(0, APP_CONFIG.EVENTS_INITIAL_LOAD_SIZE - 1);

      if (error) throw error;
      setEvents(data || []);
      setHasMore((data || []).length === APP_CONFIG.EVENTS_INITIAL_LOAD_SIZE);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      if (errorMessage.includes('over_request_rate_limit') || errorMessage.includes('rate limit')) {
        setError('Rate limit reached during search. Please wait a moment before searching again.');
      } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        setError('Unable to search events. Please check your internet connection.');
      } else {
        setError(`Search failed: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filters events by date range (string comparison)
   * @param startDate - Start date string for filtering
   * @param endDate - End date string for filtering
   */
  const filterEventsByDate = async (startDate: string, endDate: string) => {
    try {
      setLoading(true);
      setOffset(0);
      const { data, error } = await supabase
        .from(APP_CONFIG.DATABASE_TARGET_TABLE)
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('id', { ascending: true }) // Lowest IDs first (oldest events)
        .range(0, APP_CONFIG.EVENTS_INITIAL_LOAD_SIZE - 1);

      if (error) throw error;
      setEvents(data || []);
      setHasMore((data || []).length === APP_CONFIG.EVENTS_INITIAL_LOAD_SIZE);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Filter failed';
      if (errorMessage.includes('over_request_rate_limit') || errorMessage.includes('rate limit')) {
        setError('Rate limit reached during filtering. Please wait a moment before trying again.');
      } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        setError('Unable to filter events. Please check your internet connection.');
      } else {
        setError(`Filter failed: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    isLoadingMore,
    error,
    isRetrying,
    hasMore,
    refetch: fetchEvents,
    retryLastOperation,
    clearError,
    loadMoreEvents,
    searchEvents,
    filterEventsByDate,
    debugInfo,
  };
}