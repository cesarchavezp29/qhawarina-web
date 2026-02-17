/**
 * API Middleware - Rate Limiting & Authentication
 */

import { NextRequest, NextResponse } from "next/server";

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// API key store (use database in production)
const API_KEYS = new Map<string, { name: string; tier: "free" | "pro" | "enterprise"; limit: number }>([
  ["demo_free_key_12345", { name: "Demo Free", tier: "free", limit: 100 }],
  ["demo_pro_key_67890", { name: "Demo Pro", tier: "pro", limit: 1000 }],
  ["demo_enterprise_key_abcdef", { name: "Demo Enterprise", tier: "enterprise", limit: 10000 }],
]);

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  free: { windowMs: 60 * 60 * 1000, maxRequests: 100 }, // 100/hour
  pro: { windowMs: 60 * 60 * 1000, maxRequests: 1000 }, // 1000/hour
  enterprise: { windowMs: 60 * 60 * 1000, maxRequests: 10000 }, // 10000/hour
  anonymous: { windowMs: 60 * 60 * 1000, maxRequests: 20 }, // 20/hour for no key
};

/**
 * Check rate limit for a client
 */
export function checkRateLimit(
  identifier: string,
  tier: "free" | "pro" | "enterprise" | "anonymous"
): { allowed: boolean; limit: number; remaining: number; resetAt: number } {
  const now = Date.now();
  const config = RATE_LIMITS[tier];

  let record = rateLimitStore.get(identifier);

  // Reset if window expired
  if (!record || now > record.resetAt) {
    record = {
      count: 0,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(identifier, record);
  }

  // Increment count
  record.count++;

  const allowed = record.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - record.count);

  return {
    allowed,
    limit: config.maxRequests,
    remaining,
    resetAt: record.resetAt,
  };
}

/**
 * Validate API key and return tier
 */
export function validateApiKey(apiKey: string | null): {
  valid: boolean;
  tier: "free" | "pro" | "enterprise" | "anonymous";
  name?: string;
} {
  if (!apiKey) {
    return { valid: true, tier: "anonymous" };
  }

  const keyInfo = API_KEYS.get(apiKey);
  if (!keyInfo) {
    return { valid: false, tier: "anonymous" };
  }

  return { valid: true, tier: keyInfo.tier, name: keyInfo.name };
}

/**
 * API middleware wrapper
 */
export function withApiMiddleware(
  handler: (req: NextRequest, context: { tier: string; apiKey?: string }) => Promise<Response>
) {
  return async (req: NextRequest) => {
    // CORS headers
    const headers = new Headers({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
      "Content-Type": "application/json",
    });

    // Handle preflight
    if (req.method === "OPTIONS") {
      return new NextResponse(null, { status: 200, headers });
    }

    // Extract API key
    const apiKey = req.headers.get("X-API-Key") || req.nextUrl.searchParams.get("api_key");

    // Validate API key
    const auth = validateApiKey(apiKey);
    if (!auth.valid) {
      return NextResponse.json(
        { error: "Invalid API key", code: "INVALID_API_KEY" },
        { status: 401, headers }
      );
    }

    // Check rate limit
    const identifier = apiKey || req.ip || "anonymous";
    const rateLimit = checkRateLimit(identifier, auth.tier);

    // Add rate limit headers
    headers.set("X-RateLimit-Limit", rateLimit.limit.toString());
    headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString());
    headers.set("X-RateLimit-Reset", new Date(rateLimit.resetAt).toISOString());

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          code: "RATE_LIMIT_EXCEEDED",
          limit: rateLimit.limit,
          resetAt: new Date(rateLimit.resetAt).toISOString(),
        },
        { status: 429, headers }
      );
    }

    // Call handler
    try {
      const response = await handler(req, { tier: auth.tier, apiKey: apiKey || undefined });

      // Add headers to response
      const responseHeaders = new Headers(response.headers);
      headers.forEach((value, key) => {
        responseHeaders.set(key, value);
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (error: any) {
      console.error("API Error:", error);
      return NextResponse.json(
        {
          error: "Internal server error",
          code: "INTERNAL_ERROR",
          message: error.message,
        },
        { status: 500, headers }
      );
    }
  };
}

/**
 * Standard error response
 */
export function errorResponse(
  message: string,
  code: string,
  status: number = 400
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      code,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Standard success response
 */
export function successResponse(data: any, meta?: any): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  });
}
