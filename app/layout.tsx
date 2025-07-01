import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import { EnvironmentCheck } from "@/components/environment-check"
import { logger } from "@/lib/secure-logger"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Supabase Data Dashboard",
  description: "A simple frontend for displaying Supabase database items",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ErrorBoundary
            onError={(error, errorInfo) => {
              // Use secure logger instead of console.error
              logger.error("Application Error Boundary triggered", error, {
                component: "RootLayout",
                errorInfo: errorInfo.componentStack,
              })
            }}
          >
            <EnvironmentCheck>{children}</EnvironmentCheck>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
