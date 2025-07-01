import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { logger } from '@/lib/secure-logger'
import { RateLimiter, withRateLimit } from '@/lib/rate-limiter'

/**
 * GET /api/health - Health check endpoint with comprehensive status
 */
export async function GET(request: NextRequest) {
  // Apply light rate limiting for health checks
  const rateLimitResult = await withRateLimit(request, 'read')
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: rateLimitResult.error },
      { 
        status: 429,
        headers: rateLimitResult.headers
      }
    )
  }

  const startTime = Date.now()

  try {
    // Check database connection
    const supabase = createClient()
    const { data: dbTest, error: dbError } = await supabase
      .from('items')
      .select('count')
      .limit(1)

    const dbStatus = dbError ? 'error' : 'healthy'
    const dbResponseTime = Date.now() - startTime

    // Check environment variables
    const envStatus = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV,
    }

    // Get rate limiter statistics
    const rateLimiterStats = RateLimiter.getStats()

    // Overall health status
    const isHealthy = dbStatus === 'healthy' && envStatus.supabaseUrl && envStatus.supabaseAnonKey
    const status = isHealthy ? 'healthy' : 'unhealthy'

    const healthData = {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: {
          status: dbStatus,
          responseTime: `${dbResponseTime}ms`,
          error: dbError?.message || null,
        },
        environment: {
          status: envStatus.supabaseUrl && envStatus.supabaseAnonKey ? 'healthy' : 'error',
          variables: {
            supabaseConfigured: envStatus.supabaseUrl && envStatus.supabaseAnonKey,
            nodeEnv: envStatus.nodeEnv,
          },
        },
        rateLimiter: {
          status: 'healthy',
          stats: rateLimiterStats,
        },
      },
      performance: {
        responseTime: `${Date.now() - startTime}ms`,
        memoryUsage: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: 'MB',
        },
      },
    }

    // Log health check
    logger.info('Health check completed', {
      operation: 'healthCheck',
      status,
      dbStatus,
      responseTime: healthData.performance.responseTime,
    })

    return NextResponse.json(
      healthData,
      { 
        status: isHealthy ? 200 : 503,
        headers: {
          ...rateLimitResult.headers,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      }
    )

  } catch (error) {
    logger.error('Health check failed', error, {
      operation: 'healthCheck',
    })

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        performance: {
          responseTime: `${Date.now() - startTime}ms`,
        },
      },
      { 
        status: 500,
        headers: {
          ...rateLimitResult.headers,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      }
    )
  }
}
