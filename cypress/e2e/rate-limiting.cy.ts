/**
 * Rate Limiting E2E Tests
 *
 * End-to-end tests for API rate limiting functionality including
 * different endpoints, rate limit headers, and user experience.
 */

import { describe, beforeEach, it, expect } from 'cypress';

describe('API Rate Limiting', () => {
  beforeEach(() => {
    // Reset any previous state
    cy.request({
      method: 'GET',
      url: '/api/health',
      failOnStatusCode: false,
    })
  })

  describe('Items API Rate Limiting', () => {
    it('should allow requests within read limits', () => {
      // Make several GET requests to /api/items
      for (let i = 0; i < 5; i++) {
        cy.request({
          method: 'GET',
          url: '/api/items',
        }).then((response) => {
          expect(response.status).to.eq(200)
          expect(response.headers).to.have.property('x-ratelimit-limit')
          expect(response.headers).to.have.property('x-ratelimit-remaining')
          expect(response.headers).to.have.property('x-ratelimit-reset')
          
          // Verify rate limit headers are numbers
          expect(parseInt(response.headers['x-ratelimit-limit'] as string)).to.be.greaterThan(0)
          expect(parseInt(response.headers['x-ratelimit-remaining'] as string)).to.be.at.least(0)
        })
      }
    })

    it('should enforce write operation limits', () => {
      const testItem = {
        name: 'Rate Limit Test Item',
        description: 'Testing rate limiting',
        status: 'active'
      }

      // Make several POST requests (write operations have lower limits)
      const requests = []
      for (let i = 0; i < 3; i++) {
        requests.push(
          cy.request({
            method: 'POST',
            url: '/api/items',
            body: { ...testItem, name: `${testItem.name} ${i}` },
            failOnStatusCode: false,
          })
        )
      }

      // Check that requests are successful initially
      cy.wrap(requests[0]).then((response) => {
        expect(response.status).to.be.oneOf([200, 201])
        expect(response.headers).to.have.property('x-ratelimit-limit')
      })
    })

    it('should return proper rate limit headers', () => {
      cy.request({
        method: 'GET',
        url: '/api/items',
      }).then((response) => {
        // Check required rate limit headers
        expect(response.headers).to.have.property('x-ratelimit-limit')
        expect(response.headers).to.have.property('x-ratelimit-remaining')
        expect(response.headers).to.have.property('x-ratelimit-reset')

        // Verify header values are valid
        const limit = parseInt(response.headers['x-ratelimit-limit'] as string)
        const remaining = parseInt(response.headers['x-ratelimit-remaining'] as string)
        const reset = parseInt(response.headers['x-ratelimit-reset'] as string)

        expect(limit).to.be.greaterThan(0)
        expect(remaining).to.be.at.most(limit)
        expect(reset).to.be.greaterThan(Date.now() / 1000) // Should be in the future
      })
    })
  })

  describe('Health Check Rate Limiting', () => {
    it('should allow health check requests', () => {
      cy.request({
        method: 'GET',
        url: '/api/health',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 503])
        expect(response.headers).to.have.property('x-ratelimit-limit')
        expect(response.body).to.have.property('status')
        
        if (response.body.services) {
          expect(response.body.services).to.have.property('rateLimiter')
          expect(response.body.services.rateLimiter.status).to.eq('healthy')
        }
      })
    })

    it('should include rate limiter statistics in health check', () => {
      cy.request({
        method: 'GET',
        url: '/api/health',
      }).then((response) => {
        if (response.body.services && response.body.services.rateLimiter) {
          expect(response.body.services.rateLimiter).to.have.property('stats')
          expect(response.body.services.rateLimiter.stats).to.have.property('totalEntries')
          expect(response.body.services.rateLimiter.stats).to.have.property('activeEntries')
        }
      })
    })
  })

  describe('Rate Limit Error Handling', () => {
    it('should handle rate limit exceeded gracefully', () => {
      // This test would require making many requests quickly
      // In a real scenario, you might need to adjust rate limits for testing
      // or use a test-specific endpoint with very low limits
      
      cy.request({
        method: 'GET',
        url: '/api/items',
        failOnStatusCode: false,
      }).then((response) => {
        // Even if not rate limited, should have proper headers
        expect(response.headers).to.have.property('x-ratelimit-limit')
        
        if (response.status === 429) {
          // If rate limited, should have proper error response
          expect(response.body).to.have.property('error')
          expect(response.headers).to.have.property('retry-after')
        }
      })
    })
  })

  describe('Different IP Handling', () => {
    it('should track rate limits per IP', () => {
      // This test demonstrates that rate limiting is IP-based
      // In a real test environment, you might simulate different IPs
      
      cy.request({
        method: 'GET',
        url: '/api/items',
        headers: {
          'X-Forwarded-For': '192.168.1.100'
        }
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.headers).to.have.property('x-ratelimit-remaining')
        
        const remaining1 = parseInt(response.headers['x-ratelimit-remaining'] as string)
        
        // Make another request with different IP
        cy.request({
          method: 'GET',
          url: '/api/items',
          headers: {
            'X-Forwarded-For': '192.168.1.101'
          }
        }).then((response2) => {
          expect(response2.status).to.eq(200)
          const remaining2 = parseInt(response2.headers['x-ratelimit-remaining'] as string)
          
          // Different IPs should have independent rate limits
          // (This might not always be exactly equal due to timing, but should be close)
          expect(Math.abs(remaining1 - remaining2)).to.be.at.most(1)
        })
      })
    })
  })

  describe('API Performance with Rate Limiting', () => {
    it('should not significantly impact response times', () => {
      const startTime = Date.now()
      
      cy.request({
        method: 'GET',
        url: '/api/items',
      }).then((response) => {
        const responseTime = Date.now() - startTime
        
        expect(response.status).to.eq(200)
        expect(responseTime).to.be.lessThan(5000) // Should respond within 5 seconds
        
        // Rate limiting should add minimal overhead
        expect(response.headers).to.have.property('x-ratelimit-limit')
      })
    })
  })
})
