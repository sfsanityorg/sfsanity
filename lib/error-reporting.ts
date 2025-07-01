import type { AppError } from "./error-handler"

// Error reporting service for production environments
export class ErrorReportingService {
  private static instance: ErrorReportingService
  private isProduction: boolean

  constructor() {
    this.isProduction =
      typeof window !== "undefined"
        ? !["localhost", "127.0.0.1"].includes(window.location.hostname)
        : process.env.NODE_ENV === "production"
  }

  static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService()
    }
    return ErrorReportingService.instance
  }

  /**
   * Report error to external service (Sentry, LogRocket, etc.)
   */
  async reportError(error: AppError, additionalContext?: Record<string, any>): Promise<void> {
    if (!this.isProduction) {
      return // Don't report in development
    }

    try {
      // Prepare sanitized error data for external service
      const errorData = {
        type: error.type,
        code: error.code,
        message: error.message, // Technical message for debugging
        userMessage: error.userMessage,
        timestamp: error.timestamp.toISOString(),
        context: error.context,
        additionalContext,

        // Environment info (safe to include)
        userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
        url: typeof window !== "undefined" ? window.location.href : undefined,

        // Never include sensitive data
        sanitized: true,
      }

      // TODO: Replace with your error reporting service
      // Examples:
      // - Sentry.captureException(errorData)
      // - LogRocket.captureException(errorData)
      // - Custom API endpoint

      // For now, we'll use a placeholder
      await this.sendToErrorService(errorData)
    } catch (reportingError) {
      // Fail silently - don't let error reporting break the app
      if (!this.isProduction) {
        console.warn("Error reporting failed:", reportingError)
      }
    }
  }

  /**
   * Send error to external service
   */
  private async sendToErrorService(errorData: any): Promise<void> {
    // Placeholder implementation
    // Replace with actual error reporting service integration

    if (typeof window !== "undefined" && window.fetch) {
      try {
        // Example: Send to custom error endpoint
        await fetch("/api/errors", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(errorData),
        })
      } catch {
        // Fail silently
      }
    }
  }

  /**
   * Report user feedback along with error
   */
  async reportWithUserFeedback(error: AppError, feedback: string): Promise<void> {
    await this.reportError(error, {
      userFeedback: feedback,
      reportType: "user_reported",
    })
  }

  /**
   * Report performance issues
   */
  async reportPerformanceIssue(metric: string, value: number, context?: Record<string, any>): Promise<void> {
    if (!this.isProduction) return

    const performanceData = {
      type: "PERFORMANCE",
      metric,
      value,
      timestamp: new Date().toISOString(),
      context,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    }

    await this.sendToErrorService(performanceData)
  }
}

// Singleton instance
export const errorReporting = ErrorReportingService.getInstance()

// Helper functions for easy usage
export function reportError(error: AppError, context?: Record<string, any>): void {
  errorReporting.reportError(error, context).catch(() => {
    // Fail silently
  })
}

export function reportUserFeedback(error: AppError, feedback: string): void {
  errorReporting.reportWithUserFeedback(error, feedback).catch(() => {
    // Fail silently
  })
}
