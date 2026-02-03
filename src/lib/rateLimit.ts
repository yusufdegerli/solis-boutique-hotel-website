/**
 * Simple in-memory rate limiter
 * Limits requests per IP address within a time window
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

// In-memory store (will reset on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5; // Maximum requests per window

/**
 * Check if a request should be rate limited
 * @param identifier - Usually IP address or user ID
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(identifier: string): {
    allowed: boolean;
    remaining: number;
    resetIn: number;
} {
    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    // Clean up expired entries periodically
    if (rateLimitStore.size > 1000) {
        cleanupExpiredEntries();
    }

    // No existing entry or expired entry
    if (!entry || now > entry.resetTime) {
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime: now + WINDOW_MS
        });
        return {
            allowed: true,
            remaining: MAX_REQUESTS - 1,
            resetIn: WINDOW_MS
        };
    }

    // Check if limit exceeded
    if (entry.count >= MAX_REQUESTS) {
        return {
            allowed: false,
            remaining: 0,
            resetIn: entry.resetTime - now
        };
    }

    // Increment count
    entry.count++;
    rateLimitStore.set(identifier, entry);

    return {
        allowed: true,
        remaining: MAX_REQUESTS - entry.count,
        resetIn: entry.resetTime - now
    };
}

/**
 * Clean up expired entries to prevent memory leaks
 */
function cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}

/**
 * Get rate limit info without incrementing
 */
export function getRateLimitInfo(identifier: string): {
    remaining: number;
    resetIn: number;
} {
    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    if (!entry || now > entry.resetTime) {
        return { remaining: MAX_REQUESTS, resetIn: 0 };
    }

    return {
        remaining: Math.max(0, MAX_REQUESTS - entry.count),
        resetIn: entry.resetTime - now
    };
}
