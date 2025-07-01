"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { handleError, type AppError } from "@/lib/error-handler"
import { logger } from "@/lib/secure-logger"

export function DatabaseStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "error">("checking")
  const [error, setError] = useState<AppError | null>(null)

  useEffect(() => {
    async function checkConnection() {
      try {
        const { data, error: supabaseError } = await supabase
          .from("items")
          .select("count", { count: "exact", head: true })

        if (supabaseError) {
          const appError = handleError(supabaseError, {
            operation: "databaseStatusCheck",
            table: "items",
          })
          setError(appError)
          setStatus("error")
        } else {
          setStatus("connected")
          setError(null)
        }
      } catch (unexpectedError) {
        const appError = handleError(unexpectedError, {
          operation: "databaseStatusCheck",
          phase: "unexpected",
        })
        setError(appError)
        setStatus("error")
        logger.error("Database status check failed", unexpectedError, { operation: "databaseStatusCheck" })
      }
    }

    checkConnection()
  }, [])

  const getStatusBadge = () => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        )
      case "error":
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="w-3 h-3 mr-1" />
            Checking...
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-1">
      {getStatusBadge()}
      {error && <div className="text-xs text-red-600">{error.userMessage}</div>}
    </div>
  )
}
