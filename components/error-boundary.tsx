/**
 * React Error Boundary Components
 *
 * This module provides React Error Boundary components for catching and handling
 * JavaScript errors in component trees. It includes both a class-based error
 * boundary and a functional wrapper component.
 *
 * Features:
 * - Catches JavaScript errors in component tree
 * - Provides fallback UI for error states
 * - Logs errors securely without exposing sensitive data
 * - Supports custom fallback components
 * - Development-friendly error details
 * - Error recovery functionality
 *
 * Usage:
 *   ```typescript
 *   <ErrorBoundary onError={handleError}>
 *     <MyComponent />
 *   </ErrorBoundary>
 *   ```
 *
 * @module components/error-boundary
 * @version 1.0.0
 * @author Supabase Dashboard Team
 */

"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"

/**
 * Error boundary state interface
 *
 * Defines the state structure for the error boundary component.
 *
 * @interface ErrorBoundaryState
 * @property {boolean} hasError - Whether an error has been caught
 * @property {Error} [error] - The caught error object
 * @property {React.ErrorInfo} [errorInfo] - React error information
 */
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

/**
 * Error boundary props interface
 *
 * Defines the props accepted by the error boundary component.
 *
 * @interface ErrorBoundaryProps
 * @property {React.ReactNode} children - Child components to wrap
 * @property {React.ComponentType} [fallback] - Custom fallback component
 * @property {Function} [onError] - Error handler callback
 */
interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

/**
 * Error Boundary Class Component
 *
 * Class-based React component that implements error boundary functionality.
 * Catches JavaScript errors in child components and provides fallback UI.
 *
 * @class ErrorBoundaryClass
 * @extends {React.Component<ErrorBoundaryProps, ErrorBoundaryState>}
 */
class ErrorBoundaryClass extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  /**
   * Constructor
   *
   * Initializes the error boundary with default state.
   *
   * @constructor
   * @param {ErrorBoundaryProps} props - Component props
   */
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  /**
   * Get derived state from error
   *
   * Static method called when an error is caught. Updates component state
   * to indicate an error has occurred.
   *
   * @static
   * @method getDerivedStateFromError
   * @param {Error} error - The caught error
   * @returns {ErrorBoundaryState} New state with error information
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  /**
   * Component did catch error
   *
   * Lifecycle method called after an error is caught. Handles error logging
   * and calls the optional error handler prop.
   *
   * @method componentDidCatch
   * @param {Error} error - The caught error
   * @param {React.ErrorInfo} errorInfo - React error information
   * @returns {void}
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo })

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.group("🚨 Error Boundary Caught Error")
      console.error("Error:", error)
      console.error("Error Info:", errorInfo)
      console.error("Component Stack:", errorInfo.componentStack)
      console.groupEnd()
    }

    // Call optional error handler
    try {
      this.props.onError?.(error, errorInfo)
    } catch (handlerError) {
      console.error("Error in error handler:", handlerError)
    }
  }

  /**
   * Reset error state
   *
   * Resets the error boundary state to allow recovery from errors.
   * Can be called by user interaction or programmatically.
   *
   * @method resetError
   * @returns {void}
   */
  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  /**
   * Render method
   *
   * Renders either the fallback UI (if error occurred) or the children.
   * Supports custom fallback components or provides a default error UI.
   *
   * @method render
   * @returns {React.ReactNode} Rendered component
   */
  render() {
    if (this.state.hasError) {
      // Use custom fallback component if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      // Default error UI
      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-600">
              An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="text-sm">
                <summary className="cursor-pointer text-red-700 font-medium">Error Details (Development)</summary>
                <div className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto space-y-2">
                  <div>
                    <strong>Error:</strong>
                    <pre className="mt-1 whitespace-pre-wrap">{this.state.error.toString()}</pre>
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack Trace:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">{this.state.error.stack}</pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <button
              onClick={this.resetError}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

/**
 * Error Boundary Wrapper Component
 *
 * Functional wrapper component that provides a simpler interface for using
 * the error boundary functionality.
 *
 * @function ErrorBoundary
 * @param {ErrorBoundaryProps} props - Component props
 * @returns {JSX.Element} Error boundary component
 *
 * @example
 * ```typescript
 * <ErrorBoundary onError={(error, info) => logError(error, info)}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export function ErrorBoundary({ children, fallback, onError }: ErrorBoundaryProps) {
  return (
    <ErrorBoundaryClass fallback={fallback} onError={onError}>
      {children}
    </ErrorBoundaryClass>
  )
}
