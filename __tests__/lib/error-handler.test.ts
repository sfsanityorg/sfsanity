import { handleError, ErrorType, ErrorHandler } from "@/lib/error-handler"
import jest from "jest"

describe("Error Handler", () => {
  beforeEach(() => {
    // Clear any previous console mocks
    jest.clearAllMocks()
  })

  describe("handleError", () => {
    it("should handle Supabase errors correctly", () => {
      const supabaseError = {
        code: "42P01",
        message: 'relation "items" does not exist',
      }

      const result = handleError(supabaseError, { operation: "test" })

      expect(result.type).toBe(ErrorType.DATABASE)
      expect(result.code).toBe("42P01")
      expect(result.userMessage).toContain("table doesn't exist")
      expect(result.context).toEqual({ operation: "test" })
    })

    it("should handle validation errors", () => {
      const validationError = {
        name: "ZodError",
        issues: [
          {
            path: ["name"],
            message: "Required",
            code: "invalid_type",
          },
        ],
      }

      const result = handleError(validationError)

      expect(result.type).toBe(ErrorType.VALIDATION)
      expect(result.code).toBe("VALIDATION_ERROR")
      expect(result.userMessage).toContain("data format is invalid")
    })

    it("should handle network errors", () => {
      const networkError = {
        name: "NetworkError",
        message: "Failed to fetch",
      }

      const result = handleError(networkError)

      expect(result.type).toBe(ErrorType.NETWORK)
      expect(result.code).toBe("NETWORK_ERROR")
      expect(result.userMessage).toContain("Network connection failed")
    })

    it("should handle generic errors", () => {
      const genericError = new Error("Something went wrong")

      const result = handleError(genericError)

      expect(result.type).toBe(ErrorType.UNKNOWN)
      expect(result.code).toBe("UNKNOWN_ERROR")
      expect(result.userMessage).toContain("unexpected error occurred")
    })

    it("should sanitize sensitive context data", () => {
      const error = new Error("Test error")
      const sensitiveContext = {
        password: "secret123",
        apiKey: "key_123",
        token: "bearer_token",
        normalData: "safe",
      }

      const result = handleError(error, sensitiveContext)

      expect(result.context?.password).toBe("[REDACTED]")
      expect(result.context?.apiKey).toBe("[REDACTED]")
      expect(result.context?.token).toBe("[REDACTED]")
      expect(result.context?.normalData).toBe("safe")
    })
  })

  describe("ErrorHandler static methods", () => {
    it("should identify retryable errors", () => {
      const networkError = handleError({ name: "NetworkError" })
      const databaseError = handleError({ code: "08006" })
      const permissionError = handleError({ code: "42501" })

      expect(ErrorHandler.isRetryable(networkError)).toBe(true)
      expect(ErrorHandler.isRetryable(databaseError)).toBe(true)
      expect(ErrorHandler.isRetryable(permissionError)).toBe(false)
    })

    it("should get user-friendly messages", () => {
      const error = handleError(new Error("Technical error"))
      const userMessage = ErrorHandler.getUserMessage(error)

      expect(userMessage).toBe(error.userMessage)
      expect(userMessage).not.toContain("Technical error")
    })
  })
})
