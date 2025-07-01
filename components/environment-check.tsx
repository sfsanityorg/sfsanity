"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Settings } from "lucide-react"
import { checkClientEnvironment } from "@/lib/env"

interface EnvironmentCheckProps {
  children: React.ReactNode
}

export function EnvironmentCheck({ children }: EnvironmentCheckProps) {
  const [envStatus, setEnvStatus] = useState<{ isValid: boolean; errors: string[] } | null>(null)

  useEffect(() => {
    const status = checkClientEnvironment()
    setEnvStatus(status)
  }, [])

  // Show loading while checking
  if (envStatus === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Checking configuration...</p>
        </div>
      </div>
    )
  }

  // Show error if environment is invalid
  if (!envStatus.isValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-6 h-6" />
              Configuration Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-600">
              The application is missing required environment variables. Please configure the following:
            </p>

            <div className="bg-red-100 p-4 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">Missing or Invalid Variables:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {envStatus.errors.map((error, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    {error}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Setup Instructions:</h4>
              <ol className="text-sm text-blue-700 space-y-2">
                <li className="flex gap-2">
                  <span className="font-medium">1.</span>
                  <span>Go to your Supabase project dashboard</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">2.</span>
                  <span>Navigate to Settings → API</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">3.</span>
                  <span>Copy your Project URL and anon/public key</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">4.</span>
                  <span>Add them to your .env.local file or Vercel environment variables</span>
                </li>
              </ol>
            </div>

            <div className="bg-gray-100 p-3 rounded text-sm font-mono">
              <div className="text-gray-600 mb-1"># .env.local (Client-side variables only)</div>
              <div>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</div>
              <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here</div>
            </div>

            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Only NEXT_PUBLIC_ environment variables are accessible in the browser.
                Server-only variables like SUPABASE_SERVICE_ROLE_KEY are handled separately on the server.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Environment is valid, render children
  return <>{children}</>
}
