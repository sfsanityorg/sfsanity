"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Database, Wifi, Shield, AlertCircle } from "lucide-react"
import { type AppError, ErrorType, ErrorHandler } from "@/lib/error-handler"

interface ErrorDisplayProps {
  error: AppError
  onRetry?: () => void
  showDetails?: boolean
}

export function ErrorDisplay({ error, onRetry, showDetails = false }: ErrorDisplayProps) {
  const getErrorIcon = () => {
    switch (error.type) {
      case ErrorType.DATABASE:
        return <Database className="w-5 h-5" />
      case ErrorType.NETWORK:
        return <Wifi className="w-5 h-5" />
      case ErrorType.AUTHENTICATION:
        return <Shield className="w-5 h-5" />
      case ErrorType.VALIDATION:
        return <AlertCircle className="w-5 h-5" />
      default:
        return <AlertTriangle className="w-5 h-5" />
    }
  }

  const getErrorTitle = () => {
    switch (error.type) {
      case ErrorType.DATABASE:
        return "Database Error"
      case ErrorType.NETWORK:
        return "Connection Error"
      case ErrorType.AUTHENTICATION:
        return "Authentication Error"
      case ErrorType.VALIDATION:
        return "Data Validation Error"
      default:
        return "Unexpected Error"
    }
  }

  const getErrorColor = () => {
    switch (error.type) {
      case ErrorType.AUTHENTICATION:
        return "border-yellow-200 bg-yellow-50 text-yellow-700"
      case ErrorType.NETWORK:
        return "border-blue-200 bg-blue-50 text-blue-700"
      default:
        return "border-red-200 bg-red-50 text-red-700"
    }
  }

  return (
    <Card className={getErrorColor()}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getErrorIcon()}
          {getErrorTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>{error.userMessage}</p>

        {error.type === ErrorType.DATABASE && (
          <div className="text-sm space-y-1">
            <div>• Check your internet connection</div>
            <div>• Verify database configuration</div>
            <div>• Try refreshing the page</div>
          </div>
        )}

        {error.type === ErrorType.NETWORK && (
          <div className="text-sm space-y-1">
            <div>• Check your internet connection</div>
            <div>• Try again in a few moments</div>
            <div>• Contact support if the issue persists</div>
          </div>
        )}

        {showDetails && ErrorHandler.isDevelopment() && (
          <details className="text-sm">
            <summary className="cursor-pointer font-medium">Technical Details (Development)</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              Code: {error.code}
              {"\n"}
              Message: {error.message}
              {"\n"}
              Time: {error.timestamp.toISOString()}
              {error.context && "\n"}
              {error.context && `Context: ${JSON.stringify(error.context, null, 2)}`}
            </pre>
          </details>
        )}

        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        )}
      </CardContent>
    </Card>
  )
}
