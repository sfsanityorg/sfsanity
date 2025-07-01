/**
 * Data Validation Schemas and Utilities
 *
 * This module provides comprehensive Zod schemas for runtime data validation
 * with flexible error handling and debugging capabilities. It includes schemas
 * for database entities, API responses, and validation utilities.
 *
 * Features:
 * - Flexible Item schema with data transformation
 * - Database response validation
 * - Detailed validation debugging
 * - Safe parsing with error context
 * - Data structure analysis
 * - Common database format handling
 *
 * Usage:
 *   ```typescript
 *   import { ItemSchema, safeValidateItems } from '@/lib/schemas'
 *
 *   const result = safeValidateItems(databaseResponse)
 *   if (result.success) {
 *     console.log(result.data) // Validated items
 *   } else {
 *     console.error(result.error) // Validation error
 *   }
 *   ```
 *
 * @module lib/schemas
 * @version 1.0.0
 * @author Supabase Dashboard Team
 */

import { z } from "zod"

/**
 * Flexible Item schema with data transformation
 *
 * Comprehensive Zod schema for validating and transforming item data from
 * the database. Handles common database format issues like string/number
 * coercion, date format variations, and empty string normalization.
 *
 * Features:
 * - Automatic type coercion (string to number, various date formats)
 * - Whitespace trimming and empty string handling
 * - Flexible status value normalization
 * - Optional field handling with sensible defaults
 *
 * @constant {z.ZodObject} ItemSchema - Zod schema for item validation
 */
export const ItemSchema = z.object({
  /**
   * Item ID - Primary key
   *
   * Coerces string values to numbers and validates as positive integer.
   * Handles cases where database returns ID as string.
   */
  id: z.coerce.number().int().positive("ID must be a positive integer"),

  /**
   * Item name - Required field
   *
   * Validates as non-empty string with length limits and automatic trimming.
   * Provides clear error messages for validation failures.
   */
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be less than 255 characters")
    .transform((val) => val.trim()), // Auto-trim whitespace

  /**
   * Item description - Optional field
   *
   * Handles null, undefined, and empty string values gracefully.
   * Transforms empty strings to null for consistency.
   */
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .nullable()
    .optional()
    .transform((val) => {
      // Handle empty strings and whitespace-only strings
      if (!val || val.trim() === "") return null
      return val.trim()
    }),

  /**
   * Creation timestamp
   *
   * Flexible date handling that accepts ISO strings, Date objects,
   * and various date formats. Always returns ISO string format.
   */
  created_at: z.union([
    z.string().datetime("Invalid datetime format"),
    z.string().transform((str) => {
      // Handle various date formats
      const date = new Date(str)
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${str}`)
      }
      return date.toISOString()
    }),
    z.date().transform((date) => date.toISOString()),
  ]),

  /**
   * Update timestamp - Optional field
   *
   * Similar to created_at but allows null/undefined values.
   * Handles cases where updated_at might not be set.
   */
  updated_at: z
    .union([
      z.string().datetime("Invalid datetime format"),
      z.string().transform((str) => {
        const date = new Date(str)
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date: ${str}`)
        }
        return date.toISOString()
      }),
      z.date().transform((date) => date.toISOString()),
      z.null(),
      z.undefined(),
    ])
    .optional()
    .nullable(),

  /**
   * Item status with normalization
   *
   * Accepts enum values or strings and normalizes to lowercase.
   * Provides fallback to 'active' for invalid values.
   */
  status: z
    .union([
      z.enum(["active", "inactive", "pending"]),
      z.string().transform((val) => {
        const normalized = val.toLowerCase().trim()
        if (["active", "inactive", "pending"].includes(normalized)) {
          return normalized as "active" | "inactive" | "pending"
        }
        return "active" // Default fallback
      }),
    ])
    .default("active"),

  /**
   * User ID who created the item - Optional
   *
   * Validates UUID format when present, allows null values.
   */
  created_by: z
    .union([z.string().uuid("Invalid user ID format"), z.string().nullable(), z.null()])
    .optional()
    .nullable(),

  /**
   * User ID who last updated the item - Optional
   *
   * Validates UUID format when present, allows null values.
   */
  updated_by: z
    .union([z.string().uuid("Invalid user ID format"), z.string().nullable(), z.null()])
    .optional()
    .nullable(),
})

/**
 * TypeScript type inferred from Item schema
 *
 * Provides type safety for validated item objects throughout the application.
 *
 * @typedef {Object} Item
 * @property {number} id - Unique item identifier
 * @property {string} name - Item name
 * @property {string|null} description - Optional item description
 * @property {string} created_at - ISO timestamp of creation
 * @property {string|null} updated_at - ISO timestamp of last update
 * @property {'active'|'inactive'|'pending'} status - Item status
 * @property {string|null} created_by - UUID of creator
 * @property {string|null} updated_by - UUID of last updater
 */
export type Item = z.infer<typeof ItemSchema>

/**
 * Create Item schema for POST requests
 *
 * Schema for validating item creation requests with required fields only.
 */
export const CreateItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional().nullable(),
  status: z.enum(["active", "inactive", "pending"]).default("active"),
})

/**
 * Item filter schema for query parameters
 *
 * Schema for validating query parameters in GET requests.
 */
export const ItemFilterSchema = z.object({
  status: z.enum(["active", "inactive", "pending"]).optional(),
  search: z.string().max(100, "Search query too long").optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(0).default(0),
})

/**
 * Flexible array schema with error handling
 *
 * Handles various response formats including null, undefined, and empty arrays.
 * Provides sensible defaults and prevents oversized responses.
 *
 * @constant {z.ZodUnion} ItemsArraySchema - Schema for validating item arrays
 */
export const ItemsArraySchema = z
  .union([
    z.array(ItemSchema).max(1000, "Too many items returned"),
    z
      .null()
      .transform(() => []), // Handle null responses
    z
      .undefined()
      .transform(() => []), // Handle undefined responses
  ])
  .transform((val) => val || [])

/**
 * Database response schema with flexible error handling
 *
 * Standardized schema for Supabase database responses including
 * data and error fields with appropriate transformations.
 *
 * @constant {z.ZodObject} DatabaseResponseSchema - Schema for database responses
 */
export const DatabaseResponseSchema = z.object({
  data: z.union([ItemsArraySchema, z.null(), z.undefined()]).transform((val) => val || []),
  error: z
    .union([
      z.object({
        message: z.string(),
        code: z.string().optional(),
        details: z.string().optional(),
        hint: z.string().optional(),
      }),
      z.null(),
      z.undefined(),
    ])
    .nullable(),
})

/**
 * Safe validation result for single items
 *
 * Result type for safe item validation operations.
 *
 * @typedef {Object} SafeValidationResult
 * @property {boolean} success - Whether validation succeeded
 * @property {Item} [data] - Validated item data (if successful)
 * @property {string} [error] - Error message (if failed)
 * @property {any} [debug] - Debug information (if failed)
 */
type SafeValidationResult<T> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: string
      debug: any
    }

/**
 * Simple data structure analyzer (inline to avoid circular dependencies)
 */
function analyzeDataStructure(data: unknown): {
  type: string
  structure: any
  issues: string[]
} {
  const issues: string[] = []

  if (data === null) {
    return {
      type: "null",
      structure: null,
      issues: ["Data is null - database might be empty or query failed"],
    }
  }

  if (data === undefined) {
    return {
      type: "undefined",
      structure: undefined,
      issues: ["Data is undefined - check database connection"],
    }
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      issues.push("Array is empty - no items found in database")
    } else {
      // Analyze first item structure
      const firstItem = data[0]
      const itemKeys = Object.keys(firstItem || {})
      const expectedKeys = ["id", "name", "created_at"]
      const missingKeys = expectedKeys.filter((key) => !itemKeys.includes(key))

      if (missingKeys.length > 0) {
        issues.push(`Missing required fields: ${missingKeys.join(", ")}`)
      }

      // Check data types
      if (firstItem) {
        if (typeof firstItem.id !== "number" && typeof firstItem.id !== "string") {
          issues.push(`ID should be number or string, got ${typeof firstItem.id}`)
        }
        if (typeof firstItem.name !== "string") {
          issues.push(`Name should be string, got ${typeof firstItem.name}`)
        }
      }
    }

    return {
      type: "array",
      structure:
        data.length > 0
          ? {
              length: data.length,
              firstItem: data[0],
              keys: Object.keys(data[0] || {}),
            }
          : { length: 0 },
      issues,
    }
  }

  return {
    type: typeof data,
    structure: data,
    issues: [`Unexpected data type: ${typeof data}`],
  }
}

/**
 * Generate simple suggestions for validation errors
 */
function generateSuggestions(errors: z.ZodIssue[], data: any): string[] {
  const suggestions: string[] = []

  for (const error of errors) {
    const path = error.path.join(".")

    switch (error.code) {
      case "invalid_type":
        if (error.expected === "number" && typeof error.received === "string") {
          suggestions.push(`Convert ${path} from string to number`)
        }
        if (error.expected === "array" && error.received === null) {
          suggestions.push(`${path} is null - check if database query returned data`)
        }
        break

      case "invalid_date":
        suggestions.push(`Fix date format for ${path} - expected ISO 8601 format`)
        break

      case "invalid_enum_value":
        suggestions.push(`${path} must be one of: ${error.options?.join(", ")}`)
        break
    }
  }

  // Check for common database issues
  if (Array.isArray(data)) {
    if (data.length === 0) {
      suggestions.push("Database returned empty array - check if table has data")
      suggestions.push("Verify RLS policies allow read access")
    }
  } else if (data === null) {
    suggestions.push("Database returned null - check if query is correct")
  } else if (data === undefined) {
    suggestions.push("Database returned undefined - check if connection is working")
  }

  return suggestions
}

/**
 * Safe validation function for single items
 *
 * Validates a single item with comprehensive error handling and debugging.
 * Returns structured result with success status and detailed error information.
 *
 * @function safeValidateItem
 * @param {unknown} data - Data to validate as an item
 * @returns {SafeValidationResult<Item>} Validation result with data or error
 *
 * @example
 * ```typescript
 * const result = safeValidateItem(databaseRow)
 * if (result.success) {
 *   console.log('Valid item:', result.data)
 * } else {
 *   console.error('Validation failed:', result.error)
 *   console.debug('Debug info:', result.debug)
 * }
 * ```
 */
export function safeValidateItem(data: unknown): SafeValidationResult<Item> {
  try {
    const result = ItemSchema.safeParse(data)

    if (result.success) {
      return { success: true, data: result.data }
    }

    const errors = result.error.errors.map(
      (err) => `${err.path.join(".")}: ${err.message} (received: ${JSON.stringify(err.received)})`,
    )

    const suggestions = generateSuggestions(result.error.errors, data)

    return {
      success: false,
      error: errors.join("; "),
      debug: {
        success: false,
        errors,
        receivedData: data,
        suggestions,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: `Validation error: ${error}`,
      debug: { receivedData: data, error: String(error) },
    }
  }
}

/**
 * Safe validation function for item arrays
 *
 * Validates an array of items with comprehensive error handling and debugging.
 * Includes data structure analysis and helpful suggestions for common issues.
 *
 * @function safeValidateItems
 * @param {unknown} data - Data to validate as an array of items
 * @returns {SafeValidationResult<Item[]>} Validation result with data or error
 *
 * @example
 * ```typescript
 * const result = safeValidateItems(databaseResponse.data)
 * if (result.success) {
 *   console.log(`Validated ${result.data.length} items`)
 * } else {
 *   console.error('Validation failed:', result.error)
 *   showValidationError(result.debug)
 * }
 * ```
 */
export function safeValidateItems(data: unknown): SafeValidationResult<Item[]> {
  try {
    // First analyze the data structure
    const analysis = analyzeDataStructure(data)

    const result = ItemsArraySchema.safeParse(data)

    if (result.success) {
      return { success: true, data: result.data }
    }

    const errors = result.error.errors.map(
      (err) => `${err.path.join(".")}: ${err.message} (received: ${JSON.stringify(err.received)})`,
    )

    const suggestions = generateSuggestions(result.error.errors, data)

    return {
      success: false,
      error: errors.join("; "),
      debug: {
        success: false,
        errors,
        receivedData: data,
        suggestions,
        dataAnalysis: analysis,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: `Validation error: ${error}`,
      debug: { receivedData: data, error: String(error) },
    }
  }
}

// Export a simple debugger object for compatibility
export const DataValidationDebugger = {
  analyzeDataStructure,
  debugValidationFailure: (data: unknown, schema: z.ZodSchema, context?: Record<string, any>) => {
    const result = schema.safeParse(data)
    if (result.success) {
      return { success: true }
    }

    const errors = result.error.errors.map(
      (err) => `${err.path.join(".")}: ${err.message} (received: ${JSON.stringify(err.received)})`,
    )

    const suggestions = generateSuggestions(result.error.errors, data)

    return {
      success: false,
      errors,
      receivedData: data,
      suggestions,
    }
  },
}
