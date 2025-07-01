import type { z } from "zod"
import { handleError } from "./error-handler"
import { logger } from "./secure-logger"

/**
 * Safely validate data with detailed error handling
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: Record<string, any>,
): { success: true; data: T } | { success: false; error: any } {
  try {
    const result = schema.safeParse(data)

    if (result.success) {
      logger.debug("Validation successful", {
        operation: "validation",
        dataType: schema._def.typeName,
        ...context,
      })
      return { success: true, data: result.data }
    } else {
      logger.warn("Validation failed", {
        operation: "validation",
        errors: result.error.errors,
        receivedData: data,
        ...context,
      })

      const appError = handleError(result.error, {
        operation: "validation",
        schema: schema._def.typeName,
        ...context,
      })

      return { success: false, error: appError }
    }
  } catch (unexpectedError) {
    logger.error("Unexpected validation error", unexpectedError, {
      operation: "validation",
      schema: schema._def.typeName,
      ...context,
    })

    const appError = handleError(unexpectedError, {
      operation: "validation",
      phase: "unexpected",
      ...context,
    })

    return { success: false, error: appError }
  }
}

/**
 * Validate request body in API routes
 */
export async function validateRequestBody<T>(
  schema: z.ZodSchema<T>,
  request: Request,
): Promise<{ success: true; data: T } | { success: false; error: any }> {
  try {
    const body = await request.json()
    return validateWithSchema(schema, body, {
      operation: "requestBodyValidation",
      url: request.url,
      method: request.method,
    })
  } catch (parseError) {
    logger.error("Failed to parse request body", parseError, {
      operation: "requestBodyValidation",
      url: request.url,
      method: request.method,
    })

    const appError = handleError(parseError, {
      operation: "requestBodyValidation",
      phase: "json_parse",
    })

    return { success: false, error: appError }
  }
}

/**
 * Validate query parameters
 */
export function validateQueryParams<T>(
  schema: z.ZodSchema<T>,
  searchParams: URLSearchParams,
): { success: true; data: T } | { success: false; error: any } {
  const params = Object.fromEntries(searchParams.entries())
  return validateWithSchema(schema, params, {
    operation: "queryParamValidation",
    params,
  })
}

/**
 * Type-safe database response handler
 */
export function handleDatabaseResponse<T>(
  schema: z.ZodSchema<T>,
  response: { data: any; error: any },
  context?: Record<string, any>,
): { success: true; data: T } | { success: false; error: any } {
  if (response.error) {
    const appError = handleError(response.error, {
      operation: "databaseQuery",
      ...context,
    })
    return { success: false, error: appError }
  }

  return validateWithSchema(schema, response.data, {
    operation: "databaseResponseValidation",
    ...context,
  })
}
