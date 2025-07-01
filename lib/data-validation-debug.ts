/**
 * Data Validation Debugging System
 *
 * This module provides comprehensive debugging tools for data validation failures.
 * It analyzes validation errors, data structures, and provides helpful suggestions
 * for resolving common data validation issues.
 *
 * Features:
 * - Detailed validation failure analysis
 * - Data structure inspection and reporting
 * - Contextual error suggestions
 * - Common database issue detection
 * - Development-friendly error reporting
 *
 * Usage:
 *   \`\`\`typescript
 *   import { DataValidationDebugger } from '@/lib/data-validation-debug'
 *
 *   const debugInfo = DataValidationDebugger.debugValidationFailure(
 *     data, schema, { operation: 'fetchItems' }
 *   )
 *   \`\`\`
 *
 * @module lib/data-validation-debug
 * @version 1.0.0
 * @author Supabase Dashboard Team
 */

import { logger } from "./secure-logger"
import type { z } from "zod"

/**
 * Validation debug information interface
 *
 * Standardized structure for validation debugging information including
 * error details, suggestions, and data analysis.
 *
 * @interface ValidationDebugInfo
 * @property {boolean} success - Whether validation succeeded
 * @property {string[]} [errors] - Array of validation error messages
 * @property {any} [receivedData] - The data that failed validation
 * @property {any} [expectedFormat] - Expected data format (if available)
 * @property {string[]} [suggestions] - Helpful suggestions for fixing errors
 */
export interface ValidationDebugInfo {
  success: boolean
  errors?: string[]
  receivedData?: any
  expectedFormat?: any
  suggestions?: string[]
}

/**
 * Data structure analysis result interface
 *
 * Result of analyzing the structure and characteristics of data.
 *
 * @interface DataStructureAnalysis
 * @property {string} type - The type of data (array, object, null, etc.)
 * @property {any} structure - Detailed structure information
 * @property {string[]} issues - Array of identified structural issues
 */
export interface DataStructureAnalysis {
  type: string
  structure: any
  issues: string[]
}

/**
 * Data Validation Debugger Class
 *
 * Main class containing static methods for debugging validation failures
 * and analyzing data structures. Provides comprehensive error analysis.
 *
 * @class DataValidationDebugger
 */
export class DataValidationDebugger {
  /**
   * Debug validation failures with detailed information
   *
   * Analyzes validation failures and provides detailed debugging information
   * including error messages, suggestions, and data analysis.
   *
   * @static
   * @method debugValidationFailure
   * @param {unknown} data - The data that failed validation
   * @param {z.ZodSchema} schema - The Zod schema used for validation
   * @param {Record<string, any>} [context] - Additional context for debugging
   * @returns {ValidationDebugInfo} Comprehensive debugging information
   *
   * @example
   * \`\`\`typescript
   * const debugInfo = DataValidationDebugger.debugValidationFailure(
   *   invalidData,
   *   ItemSchema,
   *   { operation: 'fetchItems', table: 'items' }
   * )
   *
   * if (!debugInfo.success) {
   *   console.error('Validation errors:', debugInfo.errors)
   *   console.log('Suggestions:', debugInfo.suggestions)
   * }
   * \`\`\`
   */
  static debugValidationFailure(
    data: unknown,
    schema: z.ZodSchema,
    context?: Record<string, any>,
  ): ValidationDebugInfo {
    try {
      const result = schema.safeParse(data)

      if (result.success) {
        return { success: true }
      }

      const errors = result.error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message} (received: ${JSON.stringify(err.received)})`,
      )

      const suggestions = this.generateSuggestions(result.error.errors, data)

      logger.error("Data validation failed", result.error, {
        operation: "dataValidation",
        receivedData: data,
        errors: errors,
        suggestions: suggestions,
        ...context,
      })

      return {
        success: false,
        errors,
        receivedData: data,
        suggestions,
      }
    } catch (debugError) {
      logger.error("Error during validation debugging", debugError, {
        operation: "validationDebugging",
        originalData: data,
        ...context,
      })

      return {
        success: false,
        errors: [`Debug error: ${debugError instanceof Error ? debugError.message : String(debugError)}`],
        receivedData: data,
        suggestions: ["Unable to generate suggestions due to debug error"],
      }
    }
  }

  /**
   * Generate helpful suggestions based on validation errors
   *
   * Analyzes Zod validation errors and generates contextual suggestions
   * for resolving common validation issues.
   *
   * @private
   * @static
   * @method generateSuggestions
   * @param {z.ZodIssue[]} errors - Array of Zod validation errors
   * @param {any} data - The data that failed validation
   * @returns {string[]} Array of helpful suggestions
   */
  private static generateSuggestions(errors: z.ZodIssue[], data: any): string[] {
    const suggestions: string[] = []

    try {
      for (const error of errors) {
        const path = error.path.join(".")

        switch (error.code) {
          case "invalid_type":
            if (error.expected === "number" && typeof error.received === "string") {
              suggestions.push(`Convert ${path} from string to number`)
            }
            if (error.expected === "string" && typeof error.received === "number") {
              suggestions.push(`Convert ${path} from number to string`)
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

          case "too_small":
            suggestions.push(`${path} is too short - minimum length: ${error.minimum}`)
            break

          case "too_big":
            suggestions.push(`${path} is too long - maximum length: ${error.maximum}`)
            break

          case "invalid_string":
            if (error.validation === "uuid") {
              suggestions.push(`${path} must be a valid UUID format`)
            }
            if (error.validation === "url") {
              suggestions.push(`${path} must be a valid URL`)
            }
            break
        }
      }

      // Check for common database issues
      if (Array.isArray(data)) {
        if (data.length === 0) {
          suggestions.push("Database returned empty array - check if table has data")
          suggestions.push("Verify RLS policies allow read access")
          suggestions.push("Check if the table exists in the database")
        }
      } else if (data === null) {
        suggestions.push("Database returned null - check if query is correct")
        suggestions.push("Verify table name and column names in query")
        suggestions.push("Check database connection and permissions")
      } else if (data === undefined) {
        suggestions.push("Database returned undefined - check if connection is working")
        suggestions.push("Verify environment variables are set correctly")
        suggestions.push("Check Supabase client initialization")
      }

      // Add general suggestions if no specific ones were generated
      if (suggestions.length === 0) {
        suggestions.push("Check data format matches expected schema")
        suggestions.push("Verify database table structure")
        suggestions.push("Review RLS policies and permissions")
      }
    } catch (suggestionError) {
      logger.error("Error generating suggestions", suggestionError, {
        operation: "generateSuggestions",
        errors: errors,
      })
      suggestions.push("Unable to generate specific suggestions")
    }

    return suggestions
  }

  /**
   * Analyze database response structure
   *
   * Performs comprehensive analysis of data structure to identify common
   * issues and provide insights into data format problems.
   *
   * @static
   * @method analyzeDataStructure
   * @param {unknown} data - Data to analyze
   * @returns {DataStructureAnalysis} Detailed structure analysis
   *
   * @example
   * \`\`\`typescript
   * const analysis = DataValidationDebugger.analyzeDataStructure(databaseResponse)
   * console.log('Data type:', analysis.type)
   * console.log('Issues found:', analysis.issues)
   * \`\`\`
   */
  static analyzeDataStructure(data: unknown): DataStructureAnalysis {
    const issues: string[] = []

    try {
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
            if (firstItem.created_at && !this.isValidDate(firstItem.created_at)) {
              issues.push(`created_at should be valid date, got ${typeof firstItem.created_at}`)
            }
          }

          // Check for consistency across items
          if (data.length > 1) {
            const inconsistentFields = this.findInconsistentFields(data)
            if (inconsistentFields.length > 0) {
              issues.push(`Inconsistent field types: ${inconsistentFields.join(", ")}`)
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
                  sampleItems: data.slice(0, 3), // First 3 items for analysis
                }
              : { length: 0 },
          issues,
        }
      }

      if (typeof data === "object" && data !== null) {
        const keys = Object.keys(data)
        if (keys.length === 0) {
          issues.push("Object is empty")
        }

        return {
          type: "object",
          structure: {
            keys: keys,
            values: data,
          },
          issues,
        }
      }

      return {
        type: typeof data,
        structure: data,
        issues: [`Unexpected data type: ${typeof data}`],
      }
    } catch (analysisError) {
      logger.error("Error during data structure analysis", analysisError, {
        operation: "analyzeDataStructure",
        dataType: typeof data,
      })

      return {
        type: "error",
        structure: null,
        issues: [`Analysis error: ${analysisError instanceof Error ? analysisError.message : String(analysisError)}`],
      }
    }
  }

  /**
   * Check if a value represents a valid date
   *
   * Validates whether a value can be parsed as a valid date.
   *
   * @private
   * @static
   * @method isValidDate
   * @param {any} value - Value to check
   * @returns {boolean} True if value represents a valid date
   */
  private static isValidDate(value: any): boolean {
    try {
      if (value instanceof Date) {
        return !isNaN(value.getTime())
      }
      if (typeof value === "string") {
        const date = new Date(value)
        return !isNaN(date.getTime())
      }
      return false
    } catch {
      return false
    }
  }

  /**
   * Find fields with inconsistent types across array items
   *
   * Analyzes an array of objects to find fields that have different
   * types across different items, which can cause validation issues.
   *
   * @private
   * @static
   * @method findInconsistentFields
   * @param {any[]} items - Array of items to analyze
   * @returns {string[]} Array of field names with inconsistent types
   */
  private static findInconsistentFields(items: any[]): string[] {
    try {
      const inconsistentFields: string[] = []
      const fieldTypes: Record<string, Set<string>> = {}

      // Collect all field types
      for (const item of items) {
        if (typeof item === "object" && item !== null) {
          for (const [key, value] of Object.entries(item)) {
            if (!fieldTypes[key]) {
              fieldTypes[key] = new Set()
            }
            fieldTypes[key].add(typeof value)
          }
        }
      }

      // Find fields with multiple types
      for (const [field, types] of Object.entries(fieldTypes)) {
        if (types.size > 1) {
          inconsistentFields.push(`${field} (${Array.from(types).join(", ")})`)
        }
      }

      return inconsistentFields
    } catch {
      return []
    }
  }
}
