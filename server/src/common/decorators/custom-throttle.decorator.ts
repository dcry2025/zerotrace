// src/common/decorators/custom-throttle.decorator.ts

/**
 * Custom throttle decorator for specific rate limits
 * Usage examples:
 *
 * // More strict for sensitive endpoints
 * @CustomThrottle({ short: { limit: 3, ttl: 1000 } })  // 3 requests per second
 *
 * // More lenient for public endpoints
 * @CustomThrottle({ short: { limit: 20, ttl: 1000 } }) // 20 requests per second
 */
export { Throttle as CustomThrottle } from '@nestjs/throttler';
