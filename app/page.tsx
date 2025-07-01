"use client"

import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, AlertTriangle, RefreshCw } from "lucide-react"
import { DatabaseStatus } from "@/components/database-status"
import { Checkbox } from "@/components/ui/checkbox"
import { ErrorBoundary } from "@/components/error-boundary"
import { ErrorDisplay } from "@/components/error-display"
import { useState, useEffect } from "react"
import { type Item, safeValidateItems } from "@/lib/schemas"
import { handleError, type AppError, ErrorHandler } from "@/lib/error-handler"
import { logClientEnvironmentStatus } from "@/lib/env"
import { logger } from "@/lib/secure-logger"

/**
 * Home Page Component
 *
 * Main dashboard page that displays items from the Supabase database.
 * Includes comprehensive error handling, data validation, and debugging capabilities.
 *
 * Features:
 * - Real-time database connection monitoring
 * - Comprehensive data validation with debugging
 * - User-friendly error display with retry functionality
 * - Responsive grid layout for items
 * - Environment validation and status reporting
 *
 * @component HomePage
 * @returns {JSX.Element} The main dashboard page
 */
export default function HomePage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AppError | null>(null)
  const [validationDebug, setValidationDebug] = useState<any>(null)
  const [infiniteScrollEnabled, setInfiniteScrollEnabled] = useState(false)

  /**
   * Fetch initial items from database
   *
   * Performs the main data fetching operation with comprehensive error handling,
   * validation, and debugging. Includes detailed logging for troubleshooting.
   *
   * @async
   * @function fetchInitialItems
   * @returns {Promise<void>}
   */
  const fetchInitialItems = async () => {
    try {
      setError(null)
      setValidationDebug(null)
      setLoading(true)

      logger.debug("Starting initial items fetch", {
        operation: "fetchInitialItems",
        limit: 25,
        timestamp: new Date().toISOString(),
      })

      // Check if supabase client is properly initialized
      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }

      logger.debug("Supabase client initialized, executing query", {
        operation: "fetchInitialItems",
        supabaseUrl: supabase.supabaseUrl,
      })

      const { data, error: supabaseError } = await supabase
        .from("items")
        .select("*")
        .limit(25)
        .order("id", { ascending: true })

      // Log raw response for debugging
      logger.debug("Raw database response received", {
        operation: "fetchInitialItems",
        hasData: !!data,
        dataType: typeof data,
        dataLength: Array.isArray(data) ? data.length : "not array",
        hasError: !!supabaseError,
        errorMessage: supabaseError?.message,
        errorCode: supabaseError?.code,
        errorDetails: supabaseError?.details,
      })

      if (supabaseError) {
        logger.error("Supabase query error", supabaseError, {
          operation: "fetchInitialItems",
          table: "items",
          limit: 25,
          errorCode: supabaseError.code,
          errorMessage: supabaseError.message,
        })

        const appError = handleError(supabaseError, {
          operation: "fetchInitialItems",
          table: "items",
          limit: 25,
        })
        setError(appError)
        return
      }

      // Validate and parse items data with detailed debugging
      logger.debug("Starting data validation", {
        operation: "fetchInitialItems",
        dataToValidate: data,
      })

      const itemsValidation = safeValidateItems(data || [])

      if (!itemsValidation.success) {
        logger.error("Item validation failed", undefined, {
          operation: "itemValidation",
          validationError: itemsValidation.error,
          debugInfo: itemsValidation.debug,
          receivedData: data,
        })

        // Store debug info for display
        setValidationDebug(itemsValidation.debug)

        const appError = handleError(new Error(itemsValidation.error), {
          operation: "dataValidation",
          phase: "item_validation",
          validationError: itemsValidation.error,
          debugInfo: itemsValidation.debug,
        })
        setError(appError)
        return
      }

      const validatedItems = itemsValidation.data

      logger.info("Successfully fetched and validated items", {
        operation: "fetchInitialItems",
        itemCount: validatedItems.length,
        itemIds: validatedItems.slice(0, 5).map((item) => item.id), // Log first 5 IDs
        validationStatus: "success",
        message: `Data Validation Successful - All ${validatedItems.length} items have been validated and are displaying correctly`,
      })

      // Also log to console in development for visibility
      if (
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ) {
        console.log(
          `✅ Data Validation Successful - All ${validatedItems.length} items validated and displaying correctly`,
        )
      }

      setItems(validatedItems)
    } catch (unexpectedError) {
      logger.error("Unexpected error during item fetch", unexpectedError, {
        operation: "fetchInitialItems",
        phase: "unexpected",
        errorType: typeof unexpectedError,
        errorMessage: unexpectedError instanceof Error ? unexpectedError.message : String(unexpectedError),
        errorStack: unexpectedError instanceof Error ? unexpectedError.stack : undefined,
      })

      const appError = handleError(unexpectedError, {
        operation: "fetchInitialItems",
        phase: "unexpected",
      })
      setError(appError)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Component initialization effect
   *
   * Runs on component mount to initialize environment logging and fetch data.
   */
  useEffect(() => {
    try {
      logger.debug("HomePage component mounting", {
        operation: "componentMount",
        timestamp: new Date().toISOString(),
      })

      // Log client environment status in development
      logClientEnvironmentStatus()

      // Start data fetching
      fetchInitialItems()
    } catch (initError) {
      logger.error("Error during component initialization", initError, {
        operation: "componentMount",
        phase: "initialization",
      })

      const appError = handleError(initError, {
        operation: "componentMount",
        phase: "initialization",
      })
      setError(appError)
      setLoading(false)
    }
  }, [])

  /**
   * Handle infinite scroll toggle
   *
   * Updates the infinite scroll setting and logs the change.
   *
   * @function handleInfiniteScrollToggle
   * @param {boolean} checked - New toggle state
   */
  const handleInfiniteScrollToggle = (checked: boolean) => {
    try {
      setInfiniteScrollEnabled(checked)
      logger.debug("Infinite scroll toggled", {
        enabled: checked,
        operation: "toggleInfiniteScroll",
      })
    } catch (toggleError) {
      logger.error("Error toggling infinite scroll", toggleError, {
        operation: "toggleInfiniteScroll",
        checked,
      })
    }
  }

  /**
   * Handle retry operation
   *
   * Retries the data fetching operation and logs the attempt.
   *
   * @function handleRetry
   */
  const handleRetry = () => {
    try {
      logger.info("Retrying data fetch", {
        operation: "retry",
        previousError: error?.code,
        timestamp: new Date().toISOString(),
      })
      fetchInitialItems()
    } catch (retryError) {
      logger.error("Error during retry", retryError, {
        operation: "retry",
      })
    }
  }

  /**
   * Render individual item with validation
   *
   * Safely renders an item with additional runtime validation and error boundaries.
   *
   * @function renderItem
   * @param {Item} item - Validated item to render
   * @returns {JSX.Element|null} Rendered item card or null if invalid
   */
  const renderItem = (item: Item) => {
    try {
      // Additional runtime validation for critical rendering
      if (!item.id || !item.name) {
        logger.warn("Invalid item data detected during render", {
          itemId: item.id,
          itemName: item.name,
          operation: "renderItem",
        })
        return null
      }

      return (
        <ErrorBoundary key={item.id}>
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-1">{item.name}</CardTitle>
                {item.status && (
                  <Badge variant={item.status === "active" ? "default" : "secondary"} className="ml-2">
                    {item.status}
                  </Badge>
                )}
              </div>
              {item.description && <CardDescription className="line-clamp-2">{item.description}</CardDescription>}
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500">ID: {item.id}</div>
              <div className="text-sm text-gray-500 mt-1">
                Created: {new Date(item.created_at).toLocaleDateString()}
              </div>
              {item.updated_at && (
                <div className="text-sm text-gray-500 mt-1">
                  Updated: {new Date(item.updated_at).toLocaleDateString()}
                </div>
              )}
            </CardContent>
          </Card>
        </ErrorBoundary>
      )
    } catch (renderError) {
      logger.error("Error rendering item", renderError, {
        operation: "renderItem",
        itemId: item?.id,
        itemName: item?.name,
      })
      return null
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Database className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading items...</p>
          <p className="text-sm text-gray-500 mt-2">Connecting to database...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-4">
          <ErrorDisplay error={error} onRetry={ErrorHandler.isRetryable(error) ? handleRetry : undefined} showDetails />

          {/* Enhanced Validation Debug Information */}
          {validationDebug && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700">
                  <AlertTriangle className="w-5 h-5" />
                  Data Validation Debug Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">Validation Errors:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {validationDebug.errors?.map((error: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-yellow-500 mt-0.5">•</span>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>

                {validationDebug.suggestions && validationDebug.suggestions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-2">Suggestions:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {validationDebug.suggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-500 mt-0.5">→</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Common Solutions:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Check if the database table exists and has the correct schema</li>
                    <li>• Verify that RLS policies allow read access</li>
                    <li>• Ensure environment variables are correctly configured</li>
                    <li>• Run the SQL setup scripts if you haven't already</li>
                    <li>• Check browser console for additional error details</li>
                  </ul>
                </div>

                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              </CardContent>
            </Card>
          )}

          {/* Additional Debug Information */}
          <Card className="border-gray-200 bg-gray-50">
            <CardHeader>
              <CardTitle className="text-gray-700">Debug Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <div>Error Type: {error.type}</div>
              <div>Error Code: {error.code}</div>
              <div>Timestamp: {error.timestamp.toISOString()}</div>
              {error.context && (
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium">Error Context</summary>
                  <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(error.context, null, 2)}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Success state
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Database className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Data Dashboard</h1>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">Displaying items from your Supabase database</p>
          </div>

          {/* Stats */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1">{/* Empty space for left alignment */}</div>
            <div className="flex gap-4">
              <Card className="min-w-[200px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{items.length}</div>
                  <div className="text-xs text-gray-500 mt-1">Validated items</div>
                </CardContent>
              </Card>

              <ErrorBoundary>
                <Card className="min-w-[200px]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DatabaseStatus />
                  </CardContent>
                </Card>
              </ErrorBoundary>

              <Card className="min-w-[200px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="infinite-scroll"
                      checked={infiniteScrollEnabled}
                      onCheckedChange={handleInfiniteScrollToggle}
                    />
                    <label
                      htmlFor="infinite-scroll"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Infinite Scroll
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Items Grid */}
          <ErrorBoundary>
            {items.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map(renderItem).filter(Boolean)}
                </div>

                {/* Success message - only show in development or when there were previous errors */}
                {(error ||
                  (typeof window !== "undefined" &&
                    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"))) && (
                  <Card className="mt-8 bg-green-50 border-green-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 text-green-700">
                        <Database className="w-4 h-4" />
                        <span className="font-medium">Data Validation Successful</span>
                      </div>
                      <div className="mt-2 text-sm text-green-600">
                        All {items.length} items have been validated and are displaying correctly
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
                  <p className="text-gray-600 mb-4">{"The 'items' table might not exist yet or contains no data."}</p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <div>1. Run the SQL script in your Supabase SQL Editor</div>
                    <div>2. Make sure your environment variables are configured</div>
                    <div>3. Check that RLS policies allow read access</div>
                    <div>4. Check browser console for additional details</div>
                  </div>
                  <button
                    onClick={handleRetry}
                    className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                  </button>
                </CardContent>
              </Card>
            )}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}
