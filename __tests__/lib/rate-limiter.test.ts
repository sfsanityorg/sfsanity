/**
 * Rate Limiter Tests
 *
 * Comprehensive test suite for the rate limiting functionality including
 * basic limits, different configurations, cleanup, and edge cases.
 */

import { RateLimiter, withRateLimit } from '@/lib/rate-limiter'
import jest from 'jest'

// Mock the logger to avoid console output during tests
jest.mock('@/lib/secure-logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}))

describe('RateLimiter', () => {
  beforeEach(() => {
    // Reset rate limiter state before each test
    RateLimiter.reset()
    jest.clearAllMocks()
  })

  afterAll(() => {
    // Clean shutdown
    RateLimiter.shutdown()
  })

  describe('Basic Rate Limiting', () => {
    it('should allow requests within limit', () => {
      const identifier = 'test-ip-1'
      
      // First request should be allowed
      const result1 = RateLimiter.checkLimit(identifier, 'default')
      expect(result1.allowed).toBe(true)
      expect(result1.remaining).toBe(99) // 100 - 1
      expect(result1.limit).toBe(100)

      // Second request should also be allowed
      const result2 = RateLimiter.checkLimit(identifier, 'default')
      expect(result2.allowed).toBe(true)
      expect(result2.remaining).toBe(98) // 100 - 2
    })

    it('should block requests when limit exceeded', () => {
      const identifier = 'test-ip-2'
      
      // Make requests up to the limit (5 for auth config)
      for (let i = 0; i < 5; i++) {
        const result = RateLimiter.checkLimit(identifier, 'auth')
        expect(result.allowed).toBe(true)
      }

      // Next request should be blocked
      const blockedResult = RateLimiter.checkLimit(identifier, 'auth')
      expect(blockedResult.allowed).toBe(false)
      expect(blockedResult.remaining).toBe(0)
      expect(blockedResult.retryAfter).toBeGreaterThan(0)
    })

    it('should reset limits after time window', async () => {
      const identifier = 'test-ip-3'
      
      // Mock a short time window for testing
      const originalConfigs = (RateLimiter as any).CONFIGS
      ;(RateLimiter as any).CONFIGS = {
        ...originalConfigs,
        test: {
          windowMs: 100, // 100ms window
          maxRequests: 2,
          message: 'Test limit exceeded',
        },
      }

      // Use up the limit
      const result1 = RateLimiter.checkLimit(identifier, 'test' as any)
      const result2 = RateLimiter.checkLimit(identifier, 'test' as any)
      const result3 = RateLimiter.checkLimit(identifier, 'test' as any)

      expect(result1.allowed).toBe(true)
      expect(result2.allowed).toBe(true)
      expect(result3.allowed).toBe(false)

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150))

      // Should be allowed again
      const result4 = RateLimiter.checkLimit(identifier, 'test' as any)
      expect(result4.allowed).toBe(true)

      // Restore original configs
      ;(RateLimiter as any).CONFIGS = originalConfigs
    })
  })

  describe('Different Configuration Types', () => {
    it('should apply different limits for different config types', () => {
      const identifier = 'test-ip-4'

      // Read config allows 200 requests
      const readResult = RateLimiter.checkLimit(identifier, 'read')
      expect(readResult.limit).toBe(200)

      // Write config allows 20 requests
      const writeResult = RateLimiter.checkLimit(identifier, 'write')
      expect(writeResult.limit).toBe(20)

      // Auth config allows 5 requests
      const authResult = RateLimiter.checkLimit(identifier, 'auth')
      expect(authResult.limit).toBe(5)
    })

    it('should track limits separately for different config types', () => {
      const identifier = 'test-ip-5'

      // Use up auth limit
      for (let i = 0; i < 5; i++) {
        RateLimiter.checkLimit(identifier, 'auth')
      }

      // Auth should be blocked
      const authResult = RateLimiter.checkLimit(identifier, 'auth')
      expect(authResult.allowed).toBe(false)

      // But read should still be allowed
      const readResult = RateLimiter.checkLimit(identifier, 'read')
      expect(readResult.allowed).toBe(true)
    })
  })

  describe('Rate Limit Headers', () => {
    it('should generate correct headers for allowed requests', () => {
      const result = RateLimiter.checkLimit('test-ip-6', 'default')
      const headers = RateLimiter.getHeaders(result)

      expect(headers['X-RateLimit-Limit']).toBe('100')
      expect(headers['X-RateLimit-Remaining']).toBe('99')
      expect(headers['X-RateLimit-Reset']).toBeDefined()
      expect(headers['Retry-After']).toBeUndefined()
    })

    it('should include Retry-After header for blocked requests', () => {
      const identifier = 'test-ip-7'

      // Use up the limit
      for (let i = 0; i < 5; i++) {
        RateLimiter.checkLimit(identifier, 'auth')
      }

      // Get blocked result
      const blockedResult = RateLimiter.checkLimit(identifier, 'auth')
      const headers = RateLimiter.getHeaders(blockedResult)

      expect(headers['X-RateLimit-Remaining']).toBe('0')
      expect(headers['Retry-After']).toBeDefined()
      expect(parseInt(headers['Retry-After'])).toBeGreaterThan(0)
    })
  })

  describe('Statistics and Monitoring', () => {
    it('should provide accurate statistics', () => {
      // Create some entries
      RateLimiter.checkLimit('ip1', 'read')
      RateLimiter.checkLimit('ip2', 'write')
      RateLimiter.checkLimit('ip3', 'auth')

      const stats = RateLimiter.getStats()
      
      expect(stats.totalEntries).toBe(3)
      expect(stats.activeEntries).toBe(3)
      expect(stats.expiredEntries).toBe(0)
      expect(stats.configTypes.read).toBe(1)
      expect(stats.configTypes.write).toBe(1)
      expect(stats.configTypes.auth).toBe(1)
    })
  })

  describe('Cleanup Functionality', () => {
    it('should clean up expired entries', async () => {
      const identifier = 'test-ip-8'
      
      // Mock short expiry
      const originalConfigs = (RateLimiter as any).CONFIGS
      ;(RateLimiter as any).CONFIGS = {
        ...originalConfigs,
        test: {
          windowMs: 50, // 50ms window
          maxRequests: 1,
          message: 'Test limit exceeded',
        },
      }

      // Create an entry
      RateLimiter.checkLimit(identifier, 'test' as any)
      
      let stats = RateLimiter.getStats()
      expect(stats.totalEntries).toBe(1)

      // Wait for expiry
      await new Promise(resolve => setTimeout(resolve, 100))

      // Trigger cleanup by calling private method
      ;(RateLimiter as any).cleanup()

      stats = RateLimiter.getStats()
      expect(stats.totalEntries).toBe(0)

      // Restore original configs
      ;(RateLimiter as any).CONFIGS = originalConfigs
    })
  })
})

describe('withRateLimit Middleware', () => {
  beforeEach(() => {
    RateLimiter.reset()
  })

  it('should allow requests within limit', async () => {
    const mockRequest = new Request('http://localhost:3000/api/test', {
      headers: {
        'x-forwarded-for': '192.168.1.1',
      },
    })

    const result = await withRateLimit(mockRequest, 'default')
    
    expect(result.allowed).toBe(true)
    expect(result.headers['X-RateLimit-Limit']).toBe('100')
    expect(result.headers['X-RateLimit-Remaining']).toBe('99')
    expect(result.error).toBeUndefined()
  })

  it('should block requests when limit exceeded', async () => {
    const mockRequest = new Request('http://localhost:3000/api/test', {
      headers: {
        'x-forwarded-for': '192.168.1.2',
      },
    })

    // Use up the auth limit (5 requests)
    for (let i = 0; i < 5; i++) {
      await withRateLimit(mockRequest, 'auth')
    }

    // Next request should be blocked
    const result = await withRateLimit(mockRequest, 'auth')
    
    expect(result.allowed).toBe(false)
    expect(result.error).toBeDefined()
    expect(result.headers['Retry-After']).toBeDefined()
  })

  it('should handle missing IP headers gracefully', async () => {
    const mockRequest = new Request('http://localhost:3000/api/test')

    const result = await withRateLimit(mockRequest, 'default')
    
    expect(result.allowed).toBe(true)
    // Should use 'unknown' as identifier
  })

  it('should fail open on errors', async () => {
    // Mock RateLimiter to throw an error
    const originalCheckLimit = RateLimiter.checkLimit
    RateLimiter.checkLimit = jest.fn().mockImplementation(() => {
      throw new Error('Test error')
    })

    const mockRequest = new Request('http://localhost:3000/api/test')
    const result = await withRateLimit(mockRequest, 'default')
    
    expect(result.allowed).toBe(true) // Should fail open
    expect(result.headers).toEqual({})

    // Restore original method
    RateLimiter.checkLimit = originalCheckLimit
  })
})
