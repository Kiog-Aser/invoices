import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory store for rate limiting
const store = new Map<string, { count: number; timestamp: number }>()

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS = 100 // Maximum requests per window

export async function middleware(request: NextRequest) {
  console.log("⚡️ Stripe webhook middleware triggered");
  
  // Get Stripe signature from headers
  const sig = request.headers.get('stripe-signature')
  if (!sig) {
    console.error("❌ Missing stripe signature in middleware");
    return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 })
  }

  // Use the signature as the rate limit key
  const now = Date.now()
  const record = store.get(sig)

  if (!record) {
    // First request from this signature
    store.set(sig, { count: 1, timestamp: now })
  } else {
    if (now - record.timestamp > RATE_LIMIT_WINDOW) {
      // Window has passed, reset counter
      store.set(sig, { count: 1, timestamp: now })
    } else if (record.count >= MAX_REQUESTS) {
      // Too many requests
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    } else {
      // Increment counter
      record.count++
      store.set(sig, record)
    }
  }

  // Clean up old records every hour
  if (now % (60 * 60 * 1000) < 1000) {
    for (const [key, value] of store.entries()) {
      if (now - value.timestamp > RATE_LIMIT_WINDOW) {
        store.delete(key)
      }
    }
  }

  return NextResponse.next()
}