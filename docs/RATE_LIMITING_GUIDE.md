# Rate Limiting Guide

This guide covers the implementation and configuration of API rate limiting in the Supabase Frontend application.

## Overview

Rate limiting protects your API endpoints from abuse, brute-force attacks, and DDoS attempts by limiting the number of requests a client can make within a specific time window.

## Implementation

### Core Components

1. **RateLimiter Class** (`lib/rate-limiter.ts`)
   - In-memory rate limiting with automatic cleanup
   - Tiered limits based on operation types
   - IP-based tracking with proxy header support

2. **Rate Limit Types**
   - `READ`: Data fetching operations (200 requests/15min)
   - `WRITE`: Data modification operations (20 requests/15min)
   - `AUTH`: Authentication operations (5 requests/15min)
   - `DEFAULT`: General endpoints (100 requests/15min)

### Usage in API Routes

\`\`\`typescript
import { rateLimiter, RateLimitType } from '@/lib/rate-limiter'

export async function GET(request: Request) {
  // Check rate limit
  const rateLimitResult = await rateLimiter.check(request, RateLimitType.READ)
  
  if (!rateLimitResult.allowed) {
    return new Response(JSON.stringify({
      error: 'Rate limit exceeded',
      retryAfter: rateLimitResult.retryAfter
    }), {
      status: 429,
      headers: rateLimiter.getHeaders(rateLimitResult)
    })
  }
  
  // Process request...
  return new Response(data, {
    headers: rateLimiter.getHeaders(rateLimitResult)
  })
}
\`\`\`

## Configuration

### Default Limits

| Operation Type | Requests | Time Window | Use Case |
|---------------|----------|-------------|----------|
| READ | 200 | 15 minutes | Data fetching, queries |
| WRITE | 20 | 15 minutes | POST, PUT, DELETE |
| AUTH | 5 | 15 minutes | Login, signup attempts |
| DEFAULT | 100 | 15 minutes | General endpoints |

### Updating Limits

\`\`\`typescript
import { rateLimiter, RateLimitType } from '@/lib/rate-limiter'

// Update configuration at runtime
rateLimiter.updateConfig(RateLimitType.AUTH, {
  requests: 3,
  windowMs: 10 * 60 * 1000 // 10 minutes
})
\`\`\`

### Environment-Based Configuration

For production environments, consider:

\`\`\`typescript
const isProduction = process.env.NODE_ENV === 'production'

const configs = {
  [RateLimitType.READ]: {
    requests: isProduction ? 100 : 200,
    windowMs: 15 * 60 * 1000
  },
  [RateLimitType.WRITE]: {
    requests: isProduction ? 10 : 20,
    windowMs: 15 * 60 * 1000
  }
}
\`\`\`

## Monitoring

### Health Check Endpoint

The `/api/health` endpoint provides rate limiting statistics:

\`\`\`json
{
  "rateLimiting": {
    "status": "active",
    "stats": {
      "totalEntries": 45,
      "activeEntries": 32,
      "expiredEntries": 13,
      "entriesByType": {
        "read": 20,
        "write": 8,
        "default": 4
      }
    },
    "currentRequest": {
      "allowed": true,
      "remaining": 95,
      "resetTime": "2024-01-15T10:30:00.000Z"
    }
  }
}
\`\`\`

### Rate Limit Headers

All API responses include rate limiting headers:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when window resets
- `Retry-After`: Seconds to wait before retrying (when blocked)

## IP Address Detection

The rate limiter extracts client IPs from various headers:

1. `x-forwarded-for` (primary)
2. `x-real-ip`
3. `x-client-ip`
4. `cf-connecting-ip` (Cloudflare)
5. `x-vercel-forwarded-for` (Vercel)

For `x-forwarded-for` with multiple IPs, the first IP is used.

## Security Features

### PII Protection

Rate limiting logs automatically redact sensitive information:

\`\`\`typescript
// Automatically redacted fields
const sensitiveFields = [
  'email', 'ip', 'password', 'token', 'key', 'secret',
  'phone', 'address', 'ssn', 'credit_card', 'passport'
]
\`\`\`

### Pattern Detection

The system detects potential PII in string values:
- Email addresses
- Phone numbers
- Credit card numbers
- Social Security Numbers
- IP addresses

## Administrative Functions

### Clear Rate Limits

\`\`\`typescript
// Clear all limits for an IP
rateLimiter.clearLimits('192.168.1.1')

// Clear limits for specific endpoint
rateLimiter.clearLimits(undefined, '/api/items')

// Clear specific type of limits
rateLimiter.clearLimits(undefined, undefined, RateLimitType.AUTH)

// Clear all limits
rateLimiter.clearLimits()
\`\`\`

### Statistics

\`\`\`typescript
const stats = rateLimiter.getStats()
console.log(`Active entries: ${stats.activeEntries}`)
console.log(`Entries by type:`, stats.entriesByType)
\`\`\`

## Production Considerations

### Scaling

The current implementation uses in-memory storage, suitable for:
- Single-instance deployments
- Development and testing
- Small to medium applications

For high-traffic production environments, consider:

1. **Redis-based Rate Limiting**
   \`\`\`typescript
   // Example Redis implementation
   import Redis from 'ioredis'
   
   const redis = new Redis(process.env.REDIS_URL)
   
   class RedisRateLimiter {
     async check(key: string, limit: number, window: number) {
       const current = await redis.incr(key)
       if (current === 1) {
         await redis.expire(key, Math.ceil(window / 1000))
       }
       return {
         allowed: current <= limit,
         remaining: Math.max(0, limit - current)
       }
     }
   }
   \`\`\`

2. **Edge Rate Limiting**
   - Cloudflare Rate Limiting
   - Vercel Edge Functions
   - AWS CloudFront

3. **Database-backed Rate Limiting**
   - For persistent rate limiting across restarts
   - Better for compliance and auditing

### Performance Optimization

1. **Memory Management**
   - Automatic cleanup runs every 5 minutes
   - Expired entries are removed automatically
   - Memory usage scales with active users

2. **Response Time**
   -
