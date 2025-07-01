/**
 * Structured Error Handling System
 *
 * This module provides a comprehensive error handling system with categorization,
 * sanitization, and user-friendly error messages. It prevents sensitive data
 * leakage while providing detailed debugging information in development.
 *
 * Features:
 * - Error categorization (Database, Network, Validation, etc.)
 * - Automatic sensitive data sanitization
 * - Environment-aware logging (development vs production)
 * - User-friendly error messages
 * - Structured error context
 * - Supabase error code mapping
 *
 * Usage:
 *   ```typescript
 *   import { handleError } from '@/lib/error-handler'
 *
 *   try {
 *     // Some operation
 *   } catch (error) {
 *     const appError = handleError(error, { operation: 'fetchData' })
 *     // Handle appError safely
 *   }
 *   ```
 *
 * @module lib/error-handler
 * @version 1.0.0
 * @author Supabase Dashboard Team
 */

/**
 * Error type enumeration
 *
 * Categorizes different types of errors for better handling and user messaging.
 * Each type has specific handling logic and user-friendly messages.
 *
 * @enum {string} ErrorType
 */
export enum ErrorType {
  /** Database-related errors (connection, query, permissions) */
  DATABASE = "DATABASE",
  /** Data validation errors (schema, type, format) */
  VALIDATION = "VALIDATION",
  /** Network connectivity errors (timeout, connection refused) */
  NETWORK = "NETWORK",
  /** Authentication and authorization errors */
  AUTHENTICATION = "AUTHENTICATION",
  /** Unclassified or unexpected errors */
  UNKNOWN = "UNKNOWN",
}

/**
 * Structured application error interface
 *
 * Standardized error structure used throughout the application.
 * Provides both technical details for debugging and user-friendly messages.
 *
 * @interface AppError
 * @property {ErrorType} type - Error category for handling logic
 * @property {string} code - Specific error code for identification
 * @property {string} message - Technical error message (development only)
 * @property {string} userMessage - User-friendly error message
 * @property {Date} timestamp - When the error occurred
 * @property {Record<string, any>} [context] - Additional error context (sanitized)
 */
export interface AppError {
  type: ErrorType
  code: string
  message: string
  userMessage: string
  timestamp: Date
  context?: Record<string, any>
}

/**
 * Supabase error code mappings
 *
 * Maps specific Supabase/PostgreSQL error codes to error types and
 * user-friendly messages. Helps provide contextual error information.
 *
 * @constant {Record<string, Object>} SUPABASE_ERROR_CODES
 */
const SUPABASE_ERROR_CODES: Record<string, { type: ErrorType; userMessage: string }> = {
  "42P01": {
    type: ErrorType.DATABASE,
    userMessage: "The requested data table doesn't exist. Please contact support.",
  },
  "42501": {
    type: ErrorType.AUTHENTICATION,
    userMessage: "You don't have permission to access this data.",
  },
  "23505": {
    type: ErrorType.DATABASE,
    userMessage: "This item already exists.",
  },
  "23503": {
    type: ErrorType.DATABASE,
    userMessage: "Cannot complete this action due to data dependencies.",
  },
  "08006": {
    type: ErrorType.NETWORK,
    userMessage: "Unable to connect to the database. Please check your connection.",
  },
  "08001": {
    type: ErrorType.NETWORK,
    userMessage: "Database connection failed. Please try again later.",
  },
}

/**
 * Generic error messages by type
 *
 * Fallback user-friendly messages for each error type when specific
 * error codes don't have custom messages.
 *
 * @constant {Record<ErrorType, string>} GENERIC_ERROR_MESSAGES
 */
const GENERIC_ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.DATABASE]: "A database error occurred. Please try again or contact support.",
  [ErrorType.VALIDATION]: "The data provided is invalid. Please check your input.",
  [ErrorType.NETWORK]: "Network connection failed. Please check your internet connection.",
  [ErrorType.AUTHENTICATION]: "Authentication failed. Please log in again.",
  [ErrorType.UNKNOWN]: "An unexpected error occurred. Please try again.",
}

/**
 * Client-safe development mode detection
 *
 * Determines if the application is running in development mode without
 * relying on NODE_ENV which may not be available on the client side.
 *
 * @constant {boolean} isDevelopment
 */
const isDevelopment =
  typeof window !== "undefined"
    ? window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    : false

/**
 * Error Handler Class
 *
 * Main class containing static methods for error processing, categorization,
 * and sanitization. Provides a centralized approach to error handling.
 *
 * @class ErrorHandler
 */
export class ErrorHandler {
  /**
   * Process and sanitize errors for safe logging and user display
   *
   * Main entry point for error handling. Takes any error object and converts
   * it to a structured AppError with appropriate categorization and sanitization.
   *
   * @static
   * @method handleError
   * @param {unknown} error - The error to process (can be any type)
   * @param {Record<string, any>} [context] - Additional context for debugging
   * @returns {AppError} Structured and sanitized error object
   *
   * @example
   * ```typescript
   * try {
   *   await supabase.from('items').select('*')
   * } catch (error) {
   *   const appError = ErrorHandler.handleError(error, {
   *     operation: 'fetchItems',
   *     table: 'items'
   *   })
   *   console.log(appError.userMessage) // Safe for users
   * }
   * ```
   */
  static handleError(error: unknown, context?: Record<string, any>): AppError {
    const timestamp = new Date()
    let appError: AppError

    if (this.isSupabaseError(error)) {
      appError = this.handleSupabaseError(error, context, timestamp)
    } else if (this.isValidationError(error)) {
      appError = this.handleValidationError(error, context, timestamp)
    } else if (this.isNetworkError(error)) {
      appError = this.handleNetworkError(error, context, timestamp)
    } else {
      appError = this.handleGenericError(error, context, timestamp)
    }

    // Log error safely
    this.logError(appError)

    return appError
  }

  /**
   * Check if error is from Supabase
   *
   * Identifies Supabase-specific errors by checking for characteristic
   * properties like error codes or Supabase-specific messages.
   *
   * @private
   * @static
   * @method isSupabaseError
   * @param {any} error - Error object to check
   * @returns {boolean} True if error is from Supabase
   */
  private static isSupabaseError(error: any): boolean {
    return error && (error.code || error.message?.includes("supabase") || error.details)
  }

  /**
   * Check if error is a validation error (Zod)
   *
   * Identifies validation errors from Zod schema validation by checking
   * the error name and structure.
   *
   * @private
   * @static
   * @method isValidationError
   * @param {any} error - Error object to check
   * @returns {boolean} True if error is a validation error
   */
  private static isValidationError(error: any): boolean {
    return error && error.name === "ZodError"
  }

  /**
   * Check if error is network-related
   *
   * Identifies network connectivity errors by checking error names,
   * messages, and codes commonly associated with network issues.
   *
   * @private
   * @static
   * @method isNetworkError
   * @param {any} error - Error object to check
   * @returns {boolean} True if error is network-related
   */
  private static isNetworkError(error: any): boolean {
    return (
      error &&
      (error.name === "NetworkError" ||
        error.message?.includes("fetch") ||
        error.message?.includes("network") ||
        error.code === "NETWORK_ERROR")
    )
  }

  /**
   * Handle Supabase-specific errors
   *
   * Processes Supabase/PostgreSQL errors using the error code mapping
   * to provide appropriate categorization and user messages.
   *
   * @private
   * @static
   * @method handleSupabaseError
   * @param {any} error - Supabase error object
   * @param {Record<string, any>} context - Additional context
   * @param {Date} timestamp - Error timestamp
   * @returns {AppError} Processed Supabase error
   */
  private static handleSupabaseError(error: any, context: Record<string, any> = {}, timestamp: Date): AppError {
    const code = error.code || "SUPABASE_UNKNOWN"
    const errorMapping = SUPABASE_ERROR_CODES[code]

    return {
      type: errorMapping?.type || ErrorType.DATABASE,
      code,
      message: isDevelopment ? error.message : "Database error occurred",
      userMessage: errorMapping?.userMessage || GENERIC_ERROR_MESSAGES[ErrorType.DATABASE],
      timestamp,
      context: this.sanitizeContext(context),
    }
  }

  /**
   * Handle validation errors (Zod)
   *
   * Processes Zod validation errors by extracting field-specific error
   * messages and providing user-friendly feedback.
   *
   * @private
   * @static
   * @method handleValidationError
   * @param {any} error - Zod validation error
   * @param {Record<string, any>} context - Additional context
   * @param {Date} timestamp - Error timestamp
   * @returns {AppError} Processed validation error
   */
  private static handleValidationError(error: any, context: Record<string, any> = {}, timestamp: Date): AppError {
    const issues = error.issues || []
    const fieldErrors = issues.map((issue: any) => `${issue.path.join(".")}: ${issue.message}`).join(", ")

    return {
      type: ErrorType.VALIDATION,
      code: "VALIDATION_ERROR",
      message: isDevelopment ? fieldErrors : "Validation error occurred",
      userMessage: "The data format is invalid. Please refresh the page and try again.",
      timestamp,
      context: this.sanitizeContext(context),
    }
  }

  /**
   * Handle network errors
   *
   * Processes network connectivity errors with appropriate user messaging
   * and categorization.
   *
   * @private
   * @static
   * @method handleNetworkError
   * @param {any} error - Network error object
   * @param {Record<string, any>} context - Additional context
   * @param {Date} timestamp - Error timestamp
   * @returns {AppError} Processed network error
   */
  private static handleNetworkError(error: any, context: Record<string, any> = {}, timestamp: Date): AppError {
    return {
      type: ErrorType.NETWORK,
      code: "NETWORK_ERROR",
      message: isDevelopment ? error.message : "Network error occurred",
      userMessage: GENERIC_ERROR_MESSAGES[ErrorType.NETWORK],
      timestamp,
      context: this.sanitizeContext(context),
    }
  }

  /**
   * Handle generic/unknown errors
   *
   * Fallback handler for errors that don't match specific categories.
   * Provides safe error handling for unexpected error types.
   *
   * @private
   * @static
   * @method handleGenericError
   * @param {any} error - Generic error object
   * @param {Record<string, any>} context - Additional context
   * @param {Date} timestamp - Error timestamp
   * @returns {AppError} Processed generic error
   */
  private static handleGenericError(error: any, context: Record<string, any> = {}, timestamp: Date): AppError {
    return {
      type: ErrorType.UNKNOWN,
      code: "UNKNOWN_ERROR",
      message: isDevelopment ? error?.message || String(error) : "Unknown error occurred",
      userMessage: GENERIC_ERROR_MESSAGES[ErrorType.UNKNOWN],
      timestamp,
      context: this.sanitizeContext(context),
    }
  }

  /**
   * Sanitize context to remove sensitive information
   *
   * Recursively processes context objects to remove or redact sensitive
   * information like passwords, tokens, and API keys before logging.
   *
   * @private
   * @static
   * @method sanitizeContext
   * @param {Record<string, any>} context - Context object to sanitize
   * @returns {Record<string, any>} Sanitized context object
   */
  private static sanitizeContext(context: Record<string, any>): Record<string, any> {
    const sensitiveKeys = ["password", "token", "key", "secret", "auth", "credential"]
    const sanitized: Record<string, any> = {}

    for (const [key, value] of Object.entries(context)) {
      if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = "[REDACTED]"
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = this.sanitizeContext(value)
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }

  /**
   * Log error safely (can be extended to send to external services)
   *
   * Handles error logging with environment-appropriate detail levels.
   * Development mode shows full details, production mode uses structured logging.
   *
   * @private
   * @static
   * @method logError
   * @param {AppError} appError - Structured error to log
   * @returns {void}
   */
  private static logError(appError: AppError): void {
    if (isDevelopment) {
      console.group(`🚨 ${appError.type} Error`)
      console.error("Code:", appError.code)
      console.error("Message:", appError.message)
      console.error("User Message:", appError.userMessage)
      console.error("Context:", appError.context)
      console.error("Timestamp:", appError.timestamp.toISOString())
      console.groupEnd()
    } else {
      // In production, use structured logging without sensitive details
      const safeLogData = {
        type: appError.type,
        code: appError.code,
        timestamp: appError.timestamp.toISOString(),
        // Never log technical messages or context in production
      }

      // Use structured logging instead of console.error
      this.logToService(safeLogData)
    }
  }

  /**
   * Safe logging method for production
   *
   * Sends error data to external logging services in production while
   * ensuring no sensitive data is included in the logs.
   *
   * @private
   * @static
   * @method logToService
   * @param {any} logData - Sanitized log data to send
   * @returns {void}
   */
  private static logToService(logData: any): void {
    // Send to external logging service instead of console
    // This prevents sensitive data from appearing in server logs
    try {
      // TODO: Replace with your logging service (DataDog, New Relic, etc.)
      // logService.info('Application Error', logData)

      // For now, we'll use a minimal console log with no sensitive data
      if (typeof window === "undefined") {
        // Server-side: Use structured logging
        process.stdout.write(
          JSON.stringify({
            level: "error",
            message: "Application Error",
            ...logData,
          }) + "\n",
        )
      }
      // Client-side: Don't log to console in production
    } catch {
      // Fail silently - don't let logging break the app
    }
  }

  /**
   * Get user-friendly error message
   *
   * Extracts the user-safe error message from an AppError object.
   * This message is safe to display to end users.
   *
   * @static
   * @method getUserMessage
   * @param {AppError} error - Structured error object
   * @returns {string} User-friendly error message
   *
   * @example
   * ```typescript
   * const appError = handleError(someError)
   * const userMessage = ErrorHandler.getUserMessage(appError)
   * showToast(userMessage) // Safe to show to user
   * ```
   */
  static getUserMessage(error: AppError): string {
    return error.userMessage
  }

  /**
   * Check if error should be retryable
   *
   * Determines if an error represents a temporary condition that might
   * succeed on retry, such as network issues or temporary database problems.
   *
   * @static
   * @method isRetryable
   * @param {AppError} error - Structured error object
   * @returns {boolean} True if the operation should be retryable
   *
   * @example
   * ```typescript
   * const appError = handleError(someError)
   * if (ErrorHandler.isRetryable(appError)) {
   *   showRetryButton()
   * }
   * ```
   */
  static isRetryable(error: AppError): boolean {
    return [ErrorType.NETWORK, ErrorType.DATABASE].includes(error.type) && !["42P01", "42501"].includes(error.code)
  }

  /**
   * Check if we're in development mode (client-safe)
   *
   * Returns whether the application is running in development mode.
   * Uses client-safe detection methods that work in both browser and server contexts.
   *
   * @static
   * @method isDevelopment
   * @returns {boolean} True if in development mode
   */
  static isDevelopment(): boolean {
    return isDevelopment
  }
}

/**
 * Utility function for easy error handling
 *
 * Convenience function that wraps ErrorHandler.handleError for simpler usage.
 * Provides the same functionality with a more concise API.
 *
 * @function handleError
 * @param {unknown} error - The error to process
 * @param {Record<string, any>} [context] - Additional context for debugging
 * @returns {AppError} Structured and sanitized error object
 *
 * @example
 * ```typescript
 * import { handleError } from '@/lib/error-handler'
 *
 * try {
 *   // Some operation
 * } catch (error) {
 *   const appError = handleError(error, { operation: 'fetchData' })
 *   setError(appError)
 * }
 * ```
 */
export function handleError(error: unknown, context?: Record<string, any>): AppError {
  return ErrorHandler.handleError(error, context)
}
