import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { handleError } from "@/lib/utils"

// Example API route showing server-side Supabase usage
export async function GET() {
  try {
    // Create server-side Supabase client (has access to service role key)
    const supabase = createServerSupabaseClient()

    // Example: Get items count (server-side operation)
    const { count, error } = await supabase.from("items").select("*", { count: "exact", head: true })

    if (error) {
      // Use structured error handler
      const appError = handleError(error, {
        operation: "serverApiExample",
        endpoint: "/api/example",
        method: "GET",
      })

      return NextResponse.json(
        {
          error: appError.userMessage, // Safe user message
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ count })
  } catch (error) {
    // Use structured error handler instead of direct console.error
    const appError = handleError(error, {
      operation: "serverApiExample",
      endpoint: "/api/example",
      phase: "unexpected",
    })

    return NextResponse.json(
      {
        error: appError.userMessage, // Safe user message
      },
      { status: 500 },
    )
  }
}
