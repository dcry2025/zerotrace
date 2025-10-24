// src/common/decorators/skip-throttle.decorator.ts

import { SkipThrottle as NestSkipThrottle } from '@nestjs/throttler';

/**
 * Decorator to skip rate limiting on specific routes
 * Usage: @SkipThrottle() - on controller or method level
 */
export const SkipThrottle = NestSkipThrottle;
