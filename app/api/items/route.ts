import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { safeValidateItems } from "@/lib/schemas"
import { CreateItemSchema, ItemFilterSchema } from "@/lib/schemas"
import { logger } from "@/lib/secure-logger"
import { withRateLimit } from "@/lib/rate-limiter"

/**
 * GET /api/items - Fetch items with filtering and pagination
 */
export async function GET(request: NextRequest) {
  // Apply rate limiting for read operations
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

  try {
    const { searchParams } = new URL(request.url)
    
    // Validate query parameters
    const filterResult = ItemFilterSchema.safeParse({
      status: searchParams.get('status'),
      search: searchParams.get('search'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    })

    if (!filterResult.success) {
      logger.warn('Invalid query parameters', filterResult.error, {
        operation: 'getItems',
        searchParams: Object.fromEntries(searchParams),
      })

      return NextResponse.json(
        { error: 'Invalid query parameters', details: filterResult.error.errors },
        { 
          status: 400,
          headers: rateLimitResult.headers
        }
      )
    }

    const { status, search, limit, offset } = filterResult.data

    // Create Supabase client
    const supabase = createClient()

    // Build query
    let query = supabase
      .from('items')
      .select('*')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Execute query
    const { data, error } = await query

    if (error) {
      logger.error('Database query failed', error, {
        operation: 'getItems',
        filters: { status, search, limit, offset },
      })

      return NextResponse.json(
        { error: 'Failed to fetch items' },
        { 
          status: 500,
          headers: rateLimitResult.headers
        }
      )
    }

    // Validate response data
    const validationResult = safeValidateItems(data)

    if (!validationResult.success) {
      logger.error('Data validation failed', validationResult.debug, {
        operation: 'getItems',
        dataLength: Array.isArray(data) ? data.length : 'not-array',
      })

      return NextResponse.json(
        { error: 'Data validation failed', debug: validationResult.debug },
        { 
          status: 500,
          headers: rateLimitResult.headers
        }
      )
    }

    logger.info('Items fetched successfully', {
      operation: 'getItems',
      count: validationResult.data.length,
      filters: { status, search, limit, offset },
    })

    return NextResponse.json(
      { 
        data: validationResult.data,
        pagination: {
          limit,
          offset,
          count: validationResult.data.length,
        }
      },
      { 
        status: 200,
        headers: rateLimitResult.headers
      }
    )

  } catch (error) {
    logger.error('Unexpected error in GET /api/items', error, {
      operation: 'getItems',
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: rateLimitResult.headers
      }
    )
  }
}

/**
 * POST /api/items - Create a new item
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting for write operations
  const rateLimitResult = await withRateLimit(request, 'write')
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: rateLimitResult.error },
      { 
        status: 429,
        headers: rateLimitResult.headers
      }
    )
  }

  try {
    // Parse request body
    const body = await request.json()

    // Validate request data
    const validationResult = CreateItemSchema.safeParse(body)

    if (!validationResult.success) {
      logger.warn('Invalid request data for item creation', validationResult.error, {
        operation: 'createItem',
        receivedData: body,
      })

      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { 
          status: 400,
          headers: rateLimitResult.headers
        }
      )
    }

    const { name, description, status } = validationResult.data

    // Create Supabase client
    const supabase = createClient()

    // Insert new item
    const { data, error } = await supabase
      .from('items')
      .insert([
        {
          name,
          description,
          status,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create item', error, {
        operation: 'createItem',
        itemData: { name, description, status },
      })

      return NextResponse.json(
        { error: 'Failed to create item' },
        { 
          status: 500,
          headers: rateLimitResult.headers
        }
      )
    }

    logger.info('Item created successfully', {
      operation: 'createItem',
      itemId: data.id,
      itemName: name,
    })

    return NextResponse.json(
      { data, message: 'Item created successfully' },
      { 
        status: 201,
        headers: rateLimitResult.headers
      }
    )

  } catch (error) {
    logger.error('Unexpected error in POST /api/items', error, {
      operation: 'createItem',
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: rateLimitResult.headers
      }
    )
  }
}
