/**
 * Simple In-Memory Rate Limiter
 *
 * Provides basic rate limiting functionality for API endpoints using an in-memory store.
 * Suitable for single-instance deployments and development environments.
 *
 * Features:
 * - IP-based rate limiting with configurable windows
 * - Tiered limits for different endpoint types
 * - Automatic cleanup of expired entries
 * - Rate limit headers for client feedback
 * - Comprehensive logging and monitoring
 *
 * Production Note: For distributed systems, consider Redis-based solutions.
 *
 * @module lib/rate-limiter
 * @version 1.0.0
 * @author Supabase Dashboard Team
 */

import { logger } from './secure-logger'

/**
 * Rate limit configuration interface
 */
interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string // Custom error message
}

/**
 * Rate limit entry for tracking requests
 */
interface RateLimitEntry {
  count: number
  resetTime: number
  firstRequest: number
}

/**
 * Rate limit result interface
 */
export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetTime: number
  retryAfter?: number
}

/**
 * Rate limiter class with in-memory storage
 */
export class RateLimiter {
  private static store = new Map<string, RateLimitEntry>()
  private static cleanupInterval: NodeJS.Timeout | null = null

  /**
   * Predefined rate limit configurations for different endpoint types
   */
  private static readonly CONFIGS: Record<string, RateLimitConfig> = {
    // Read operations - more permissive
    read: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 200,
      message: 'Too many read requests. Please try again later.',
    },
    
    // Write operations - more restrictive
    write: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 20,
      message: 'Too many write requests. Please try again later.',
    },
    
    // Authentication - very restrictive
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
      message: 'Too many authentication attempts. Please try again later.',
    },
    
    // Default for general endpoints
    default: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,
      message: 'Too many requests. Please try again later.',
    },
  }

  /**
   * Initialize the rate limiter with cleanup
   */
  static initialize() {
    if (!this.cleanupInterval) {
      // Clean up expired entries every 5 minutes
      this.cleanupInterval = setInterval(() => {
        this.cleanup()
      }, 5 * 60 * 1000)

      logger.info('Rate limiter initialized with cleanup interval')
    }
  }

  /**
   * Check if a request should be rate limited
   */
  static checkLimit(
    identifier: string,
    configType: keyof typeof RateLimiter.CONFIGS = 'default'
  ): RateLimitResult {
    const config = this.CONFIGS[configType]
    const now = Date.now()
    const key = `${configType}:${identifier}`

    // Get or create entry
    let entry = this.store.get(key)
    
    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired one
      entry = {
        count: 1,
        resetTime: now + config.windowMs,
        firstRequest: now,
      }
      this.store.set(key, entry)

      logger.debug('Rate limit entry created/reset', {
        operation: 'rateLimitCheck',
        key,
        configType,
        resetTime: new Date(entry.resetTime).toISOString(),
      })

      return {
        allowed: true,
        limit: config.maxRequests,
        remaining: config.maxRequests - 1,
        resetTime: entry.resetTime,
      }
    }

    // Increment counter
    entry.count++

    const remaining = Math.max(0, config.maxRequests - entry.count)
    const allowed = entry.count <= config.maxRequests

    if (!allowed) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
      
      logger.warn('Rate limit exceeded', {
        operation: 'rateLimitExceeded',
        identifier: identifier.substring(0, 8) + '...', // Partial IP for privacy
        configType,
        count: entry.count,
        limit: config.maxRequests,
        retryAfter,
      })

      return {
        allowed: false,
        limit: config.maxRequests,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter,
      }
    }

    logger.debug('Rate limit check passed', {
      operation: 'rateLimitCheck',
      configType,
      count: entry.count,
      remaining,
    })

    return {
      allowed: true,
      limit: config.maxRequests,
      remaining,
      resetTime: entry.resetTime,
    }
  }

  /**
   * Get rate limit headers for HTTP responses
   */
  static getHeaders(result: RateLimitResult): Record<string, string> {
    const headers: Record<string, string> = {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
    }

    if (result.retryAfter) {
      headers['Retry-After'] = result.retryAfter.toString()
    }

    return headers
  }

  /**
   * Clean up expired entries from the store
   */
  private static cleanup() {
    const now = Date.now()
    let cleanedCount = 0

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      logger.debug('Rate limiter cleanup completed', {
        operation: 'rateLimiterCleanup',
        cleanedEntries: cleanedCount,
        remainingEntries: this.store.size,
      })
    }
  }

  /**
   * Get current statistics for monitoring
   */
  static getStats() {
    const now = Date.now()
    const stats = {
      totalEntries: this.store.size,
      activeEntries: 0,
      expiredEntries: 0,
      configTypes: {} as Record<string, number>,
    }

    for (const [key, entry] of this.store.entries()) {
      const configType = key.split(':')[0]
      stats.configTypes[configType] = (stats.configTypes[configType] || 0) + 1

      if (now > entry.resetTime) {
        stats.expiredEntries++
      } else {
        stats.activeEntries++
      }
    }

    return stats
  }

  /**
   * Reset rate limits for a specific identifier (for testing)
   */
  static reset(identifier?: string) {
    if (identifier) {
      // Reset specific identifier across all config types
      for (const configType of Object.keys(this.CONFIGS)) {
        const key = `${configType}:${identifier}`
        this.store.delete(key)
      }
      logger.debug('Rate limits reset for identifier', { identifier })
    } else {
      // Reset all
      this.store.clear()
      logger.debug('All rate limits reset')
    }
  }

  /**
   * Shutdown the rate limiter and cleanup
   */
  static shutdown() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.store.clear()
    logger.info('Rate limiter shutdown completed')
  }
}

/**
 * Middleware function for Next.js API routes
 */
export async function withRateLimit(
  request: Request,
  configType: keyof typeof RateLimiter.CONFIGS = 'default'
): Promise<{ allowed: boolean; headers: Record<string, string>; error?: string }> {
  try {
    // Initialize if not already done
    RateLimiter.initialize()

    // Get client IP from various headers
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const clientIp = forwarded?.split(',')[0] || realIp || 'unknown'

    // Check rate limit
    const result = RateLimiter.checkLimit(clientIp, configType)
    const headers = RateLimiter.getHeaders(result)

    if (!result.allowed) {
      return {
        allowed: false,
        headers,
        error: RateLimiter['CONFIGS'][configType].message || 'Rate limit exceeded',
      }
    }

    return {
      allowed: true,
      headers,
    }
  } catch (error) {
    logger.error('Rate limiting error', error, {
      operation: 'rateLimitMiddleware',
      configType,
    })

    // Fail open - allow request if rate limiting fails
    return {
      allowed: true,
      headers: {},
    }
  }
}

/**
 * Helper function to get client IP from request
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const clientIp = forwarded?.split(',')[0] || realIp || 'unknown'
  
  return clientIp
}
