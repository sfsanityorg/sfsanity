/**
 * Environment Variable Validation and Management
 *
 * This module provides type-safe environment variable validation using Zod schemas.
 * It separates client-side and server-side environment variables for security,
 * ensuring that sensitive server-only variables are never exposed to the client.
 *
 * Features:
 * - Client/server environment variable separation
 * - Runtime validation with detailed error messages
 * - Type-safe access to environment variables
 * - Development-friendly error reporting
 * - Automatic validation on module import
 *
 * Usage:
 *   ```typescript
 *   import { clientEnv } from '@/lib/env'
 *
 *   // Safe to use on client-side
 *   const supabaseUrl = clientEnv.NEXT_PUBLIC_SUPABASE_URL
 *   ```
 *
 * @module lib/env
 * @version 1.0.0
 * @author Supabase Dashboard Team
 */

import { z } from "zod"

/**
 * Client-side environment variables schema
 *
 * Defines validation rules for environment variables that are safe to expose
 * to the client-side code. Only NEXT_PUBLIC_ prefixed variables should be
 * included here as they are automatically exposed by Next.js.
 *
 * @constant {z.ZodObject} clientEnvSchema - Zod schema for client environment variables
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL")
    .min(1, "NEXT_PUBLIC_SUPABASE_URL is required"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required")
    .regex(/^eyJ/, "NEXT_PUBLIC_SUPABASE_ANON_KEY must be a valid JWT token"),
})

/**
 * Server-side environment variables schema
 *
 * Extends the client schema with server-only variables that should never
 * be exposed to the client. These variables are only available in server-side
 * contexts like API routes and server components.
 *
 * @constant {z.ZodObject} serverEnvSchema - Zod schema for server environment variables
 */
const serverEnvSchema = clientEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .optional()
    .refine((val) => !val || val.startsWith("eyJ"), "SUPABASE_SERVICE_ROLE_KEY must be a valid JWT token if provided"),
})

/**
 * Validate client-side environment variables
 *
 * Performs runtime validation of client-side environment variables using Zod.
 * Provides detailed error messages and setup instructions if validation fails.
 * This function is safe to call on both client and server sides.
 *
 * @function validateClientEnv
 * @returns {ClientEnv} Validated client environment variables
 * @throws {Error} If validation fails with detailed error messages
 *
 * @example
 * ```typescript
 * try {
 *   const env = validateClientEnv()
 *   console.log(env.NEXT_PUBLIC_SUPABASE_URL)
 * } catch (error) {
 *   console.error('Environment validation failed:', error.message)
 * }
 * ```
 */
function validateClientEnv() {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }

  try {
    return clientEnvSchema.parse(env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join("\n")

      console.error("❌ Client Environment Variable Validation Failed:")
      console.error(errorMessages)
      console.error("\n📋 Required Environment Variables:")
      console.error("- NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL")
      console.error("- NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous key")
      console.error("\n💡 Get these from: Supabase Dashboard → Settings → API")

      throw new Error(`Client environment validation failed:\n${errorMessages}`)
    }
    throw error
  }
}

/**
 * Validate server-side environment variables
 *
 * Performs runtime validation of server-side environment variables including
 * sensitive variables that should never be exposed to the client. This function
 * should only be called in server-side contexts.
 *
 * @function validateServerEnv
 * @returns {ServerEnv} Validated server environment variables
 * @throws {Error} If called on client-side or if validation fails
 *
 * @example
 * ```typescript
 * // In an API route or server component
 * try {
 *   const serverEnv = validateServerEnv()
 *   console.log(serverEnv.SUPABASE_SERVICE_ROLE_KEY)
 * } catch (error) {
 *   console.error('Server environment validation failed:', error.message)
 * }
 * ```
 */
function validateServerEnv() {
  // Only run on server-side
  if (typeof window !== "undefined") {
    throw new Error("Server environment validation should only run on the server")
  }

  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  try {
    return serverEnvSchema.parse(env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join("\n")

      console.error("❌ Server Environment Variable Validation Failed:")
      console.error(errorMessages)

      throw new Error(`Server environment validation failed:\n${errorMessages}`)
    }
    throw error
  }
}

/**
 * Validated client environment variables
 *
 * Pre-validated client environment variables that are safe to use throughout
 * the application. These are validated once on module import and cached.
 *
 * @constant {ClientEnv} clientEnv - Validated client environment variables
 */
export const clientEnv = validateClientEnv()

/**
 * Server environment validation function
 *
 * Function to validate server-side environment variables. Should only be
 * called in server-side contexts like API routes and server components.
 *
 * @constant {Function} getServerEnv - Server environment validation function
 */
export const getServerEnv = validateServerEnv

/**
 * Client environment variable type
 *
 * TypeScript type inferred from the client environment schema.
 * Provides type safety for client-side environment variables.
 *
 * @typedef {Object} ClientEnv
 * @property {string} NEXT_PUBLIC_SUPABASE_URL - Supabase project URL
 * @property {string} NEXT_PUBLIC_SUPABASE_ANON_KEY - Supabase anonymous key
 */
export type ClientEnv = z.infer<typeof clientEnvSchema>

/**
 * Server environment variable type
 *
 * TypeScript type inferred from the server environment schema.
 * Provides type safety for server-side environment variables.
 *
 * @typedef {Object} ServerEnv
 * @property {string} NEXT_PUBLIC_SUPABASE_URL - Supabase project URL
 * @property {string} NEXT_PUBLIC_SUPABASE_ANON_KEY - Supabase anonymous key
 * @property {string} [SUPABASE_SERVICE_ROLE_KEY] - Optional service role key
 */
export type ServerEnv = z.infer<typeof serverEnvSchema>

/**
 * Check client environment validity
 *
 * Helper function to check if client environment variables are valid
 * without throwing errors. Useful for conditional logic and error handling.
 *
 * @function checkClientEnvironment
 * @returns {Object} Validation result with success status and error details
 * @returns {boolean} returns.isValid - Whether validation passed
 * @returns {string[]} returns.errors - Array of validation error messages
 *
 * @example
 * ```typescript
 * const { isValid, errors } = checkClientEnvironment()
 * if (!isValid) {
 *   console.error('Environment issues:', errors)
 * }
 * ```
 */
export function checkClientEnvironment(): { isValid: boolean; errors: string[] } {
  try {
    validateClientEnv()
    return { isValid: true, errors: [] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`)
      return { isValid: false, errors }
    }
    return { isValid: false, errors: [error instanceof Error ? error.message : "Unknown validation error"] }
  }
}

/**
 * Log client environment status (development only)
 *
 * Development helper function that logs the current status of client
 * environment variables to the console. Only runs in development mode
 * to avoid exposing configuration details in production.
 *
 * @function logClientEnvironmentStatus
 * @returns {void}
 *
 * @example
 * ```typescript
 * // In development, this will log environment status
 * logClientEnvironmentStatus()
 * ```
 */
export function logClientEnvironmentStatus() {
  const isDev =
    typeof window !== "undefined"
      ? window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      : false

  if (!isDev) return

  console.group("🔧 Client Environment Configuration")

  try {
    const validatedEnv = validateClientEnv()
    console.log("✅ All client environment variables are valid")
    console.log("🔗 Supabase URL:", validatedEnv.NEXT_PUBLIC_SUPABASE_URL)
    console.log("🔑 Anon Key:", validatedEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + "...")
  } catch (error) {
    console.error("❌ Client environment validation failed:", error)
  }

  console.groupEnd()
}
