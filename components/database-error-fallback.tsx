"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, RefreshCw, AlertCircle } from "lucide-react"

interface DatabaseErrorFallbackProps {
  error?: Error
  resetError: () => void
}

export function DatabaseErrorFallback({ error, resetError }: DatabaseErrorFallbackProps) {
  const isDatabaseError = error?.message?.includes("supabase") || error?.message?.includes("database")

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          {isDatabaseError ? <Database className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {isDatabaseError ? "Database Connection Error" : "Component Error"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-red-600">
          {isDatabaseError
            ? "Unable to connect to the database. Please check your connection and try again."
            : "This component encountered an error and couldn't render properly."}
        </p>

        {isDatabaseError && (
          <div className="text-sm text-red-600 space-y-1">
            <div>• Check your internet connection</div>
            <div>• Verify Supabase environment variables</div>
            <div>• Ensure database is accessible</div>
          </div>
        )}

        <button
          onClick={resetError}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
      </CardContent>
    </Card>
  )
}
