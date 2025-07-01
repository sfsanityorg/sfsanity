import { type NextRequest, NextResponse } from "next/server"
import { handleError } from "@/lib/error-handler"

// Optional API endpoint for collecting client-side errors
export async function POST(request: NextRequest) {
  try {
    const errorData = await request.json()

    // Validate and sanitize the error data
    const sanitizedError = {
      type: errorData.type,
      code: errorData.code,
      userMessage: errorData.userMessage, // Never log technical messages from client
      timestamp: errorData.timestamp,
      url: errorData.url,
      userAgent: errorData.userAgent,
      // Don't include context or technical details from client
    }

    // Log server-side (this could be sent to external service)
    console.error("Client Error Report:", sanitizedError)

    // TODO: Send to external error reporting service
    // await externalErrorService.report(sanitizedError)

    return NextResponse.json({ success: true })
  } catch (error) {
    // Handle error reporting errors
    const appError = handleError(error, {
      operation: "errorReporting",
      endpoint: "/api/errors",
    })

    return NextResponse.json(
      {
        error: appError.userMessage,
      },
      { status: 500 },
    )
  }
}
