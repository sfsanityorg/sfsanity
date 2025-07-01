import { render, screen, waitFor } from "@testing-library/react"
import { DatabaseStatus } from "@/components/database-status"
import jest from "jest" // Declare the jest variable

// Mock Supabase
const mockSupabaseFrom = jest.fn()
const mockSelect = jest.fn()

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: mockSupabaseFrom,
  },
}))

describe("DatabaseStatus", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSupabaseFrom.mockReturnValue({
      select: mockSelect,
    })
  })

  it("should show checking status initially", () => {
    mockSelect.mockReturnValue(new Promise(() => {})) // Never resolves

    render(<DatabaseStatus />)
    expect(screen.getByText("Checking...")).toBeInTheDocument()
  })

  it("should show connected status on successful connection", async () => {
    mockSelect.mockResolvedValue({ data: null, error: null })

    render(<DatabaseStatus />)

    await waitFor(() => {
      expect(screen.getByText("Connected")).toBeInTheDocument()
    })
  })

  it("should show error status on connection failure", async () => {
    mockSelect.mockResolvedValue({
      data: null,
      error: { message: "Connection failed" },
    })

    render(<DatabaseStatus />)

    await waitFor(() => {
      expect(screen.getByText("Error")).toBeInTheDocument()
    })
  })

  it("should handle unexpected errors", async () => {
    mockSelect.mockRejectedValue(new Error("Unexpected error"))

    render(<DatabaseStatus />)

    await waitFor(() => {
      expect(screen.getByText("Error")).toBeInTheDocument()
    })
  })
})
