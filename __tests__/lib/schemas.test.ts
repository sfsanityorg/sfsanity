import { ItemSchema, safeValidateItems, safeValidateItem } from "@/lib/schemas"

describe("Schema Validation", () => {
  describe("ItemSchema", () => {
    it("should validate correct item data", () => {
      const validItem = {
        id: 1,
        name: "Test Item",
        description: "Test description",
        created_at: "2023-01-01T00:00:00.000Z",
        updated_at: "2023-01-01T00:00:00.000Z",
        status: "active",
        created_by: null,
        updated_by: null,
      }

      const result = ItemSchema.safeParse(validItem)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe(1)
        expect(result.data.name).toBe("Test Item")
        expect(result.data.status).toBe("active")
      }
    })

    it("should coerce string ID to number", () => {
      const itemWithStringId = {
        id: "123",
        name: "Test Item",
        created_at: "2023-01-01T00:00:00.000Z",
        status: "active",
      }

      const result = ItemSchema.safeParse(itemWithStringId)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe(123)
        expect(typeof result.data.id).toBe("number")
      }
    })

    it("should transform empty description to null", () => {
      const itemWithEmptyDescription = {
        id: 1,
        name: "Test",
        description: "   ",
        created_at: "2023-01-01T00:00:00.000Z",
        status: "active",
      }

      const result = ItemSchema.safeParse(itemWithEmptyDescription)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.description).toBe(null)
      }
    })

    it("should normalize status values", () => {
      const itemWithUppercaseStatus = {
        id: 1,
        name: "Test",
        created_at: "2023-01-01T00:00:00.000Z",
        status: "ACTIVE",
      }

      const result = ItemSchema.safeParse(itemWithUppercaseStatus)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe("active")
      }
    })

    it("should handle invalid data", () => {
      const invalidItem = {
        id: "not-a-number",
        name: "",
        created_at: "invalid-date",
        status: "invalid-status",
      }

      const result = ItemSchema.safeParse(invalidItem)
      expect(result.success).toBe(false)
    })
  })

  describe("safeValidateItem", () => {
    it("should return success for valid item", () => {
      const validItem = {
        id: 1,
        name: "Test Item",
        created_at: "2023-01-01T00:00:00.000Z",
        status: "active",
      }

      const result = safeValidateItem(validItem)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe("Test Item")
      }
    })

    it("should return error for invalid item", () => {
      const invalidItem = {
        id: "invalid",
        name: "",
      }

      const result = safeValidateItem(invalidItem)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("validation")
        expect(result.debug).toBeDefined()
      }
    })
  })

  describe("safeValidateItems", () => {
    it("should validate array of items", () => {
      const validItems = [
        {
          id: 1,
          name: "Item 1",
          created_at: "2023-01-01T00:00:00.000Z",
          status: "active",
        },
        {
          id: 2,
          name: "Item 2",
          created_at: "2023-01-01T00:00:00.000Z",
          status: "inactive",
        },
      ]

      const result = safeValidateItems(validItems)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(2)
        expect(result.data[0].name).toBe("Item 1")
      }
    })

    it("should handle null data", () => {
      const result = safeValidateItems(null)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual([])
      }
    })

    it("should handle undefined data", () => {
      const result = safeValidateItems(undefined)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual([])
      }
    })

    it("should provide debug information for invalid data", () => {
      const invalidData = [{ id: "invalid", name: "" }]

      const result = safeValidateItems(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.debug.suggestions).toContain("Convert id from string to number")
      }
    })
  })
})
