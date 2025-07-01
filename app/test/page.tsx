"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database } from "lucide-react"

/**
 * Simple Test Page
 *
 * Basic page to test if the app is working without complex dependencies
 */
export default function TestPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    console.log("Test page mounted successfully")
  }, [])

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600" />
            Test Page
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">This is a simple test page to verify the app is working.</p>
            <div className="bg-green-50 p-3 rounded border border-green-200">
              <p className="text-green-700 font-medium">✅ App is working!</p>
              <p className="text-green-600 text-sm mt-1">
                React components, Tailwind CSS, and basic functionality are all working correctly.
              </p>
            </div>
            <div className="text-sm text-gray-500">
              <div>Timestamp: {new Date().toISOString()}</div>
              <div>Environment: {typeof window !== "undefined" ? "Client" : "Server"}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
