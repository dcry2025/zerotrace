// src/metrics/metrics.controller.ts

/**
 * Metrics Controller
 *
 * Provides system metrics endpoint
 * Protected by API key authentication
 *
 * Usage:
 * GET /api/v1/metrics
 * Headers: X-API-Key: <your-api-key>
 */

import { Controller, Get, UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { ApiKeyGuard } from './guards/api-key.guard';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('metrics')
@UseGuards(ApiKeyGuard)
@SkipThrottle() // Skip rate limiting for metrics endpoint
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  /**
   * Get system metrics
   *
   * @returns Comprehensive system statistics
   */
  @Get()
  async getMetrics() {
    return this.metricsService.getMetrics();
  }
}
