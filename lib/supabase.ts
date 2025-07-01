/**
 * Supabase Client Configuration and Management
 *
 * This module provides secure Supabase client configuration with separate
 * client-side and server-side clients. It ensures proper environment variable
 * validation and provides appropriate client instances for different contexts.
 *
 * Features:
 * - Separate client/server Supabase clients
 * - Environment variable validation integration
 * - Connection health checking
 * - Secure client configuration
 * - Server-side admin client support
 *
 * Usage:
 *   ```typescript
 *   // Client-side usage
 *   import { supabase } from '@/lib/supabase'
 *   const { data } = await supabase.from('items').select('*')
 *
 *   // Server-side usage
 *   import { createServerSupabaseClient } from '@/lib/supabase'
 *   const supabase = createServerSupabaseClient()
 *   ```
 *
 * @module lib/supabase
 * @version 1.0.0
 * @author Supabase Dashboard Team
 */

import { createClient } from "@supabase/supabase-js"
import { clientEnv, getServerEnv } from "./env"

/**
 * Client-side Supabase client (safe for browser)
 *
 * Pre-configured Supabase client for client-side usage. Uses validated
 * environment variables and appropriate client-side settings like
 * session persistence and automatic token refresh.
 *
 * This client is safe to use in browser environments and automatically
 * handles authentication state management.
 *
 * @constant {SupabaseClient} supabase - Client-side Supabase client
 *
 * @example
 * ```typescript
 * import { supabase } from '@/lib/supabase'
 *
 * // Fetch data (respects RLS policies)
 * const { data, error } = await supabase
 *   .from('items')
 *   .select('*')
 *   .limit(10)
 *
 * // Authentication
 * const { data: user } = await supabase.auth.getUser()
 * ```
 */
export const supabase = createClient(clientEnv.NEXT_PUBLIC_SUPABASE_URL, clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

/**
 * Server-side Supabase client factory (only for server-side usage)
 *
 * Creates a Supabase client configured for server-side usage. Automatically
 * uses the service role key if available for admin operations, otherwise
 * falls back to the anonymous key.
 *
 * This function should only be called in server-side contexts like API routes,
 * server components, or server actions. It throws an error if called on the client.
 *
 * @function createServerSupabaseClient
 * @returns {SupabaseClient} Server-configured Supabase client
 * @throws {Error} If called on the client-side
 *
 * @example
 * ```typescript
 * // In an API route or server component
 * import { createServerSupabaseClient } from '@/lib/supabase'
 *
 * export async function GET() {
 *   const supabase = createServerSupabaseClient()
 *
 *   // Admin operations (if service role key is configured)
 *   const { data } = await supabase
 *     .from('items')
 *     .select('*')
 *     .limit(100) // Higher limits possible with service role
 *
 *   return Response.json(data)
 * }
 * ```
 */
export function createServerSupabaseClient() {
  // Ensure this only runs on the server
  if (typeof window !== "undefined") {
    throw new Error("Server Supabase client should only be created on the server")
  }

  const serverEnv = getServerEnv()

  // Return admin client if service role key is available
  if (serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    return createClient(serverEnv.NEXT_PUBLIC_SUPABASE_URL, serverEnv.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  // Return regular client if no service role key
  return createClient(serverEnv.NEXT_PUBLIC_SUPABASE_URL, serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Connection health check result interface
 *
 * Standardized result structure for connection health checks.
 *
 * @interface ConnectionHealthResult
 * @property {boolean} connected - Whether the connection is healthy
 * @property {string} [error] - Error message if connection failed
 */
interface ConnectionHealthResult {
  connected: boolean
  error?: string
}

/**
 * Helper function to check Supabase connection (client-side)
 *
 * Performs a lightweight connection test by attempting to query the items table.
 * This function is safe to call from client-side code and respects RLS policies.
 *
 * @async
 * @function checkSupabaseConnection
 * @returns {Promise<ConnectionHealthResult>} Connection status and error details
 *
 * @example
 * ```typescript
 * import { checkSupabaseConnection } from '@/lib/supabase'
 *
 * const { connected, error } = await checkSupabaseConnection()
 * if (!connected) {
 *   console.error('Database connection failed:', error)
 *   showConnectionError(error)
 * }
 * ```
 */
export async function checkSupabaseConnection(): Promise<ConnectionHealthResult> {
  try {
    const { error } = await supabase.from("items").select("count", { count: "exact", head: true })

    if (error) {
      return { connected: false, error: error.message }
    }

    return { connected: true }
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown connection error",
    }
  }
}
