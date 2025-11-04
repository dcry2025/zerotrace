// src/metrics/guards/api-key.guard.ts

/**
 * API Key Guard
 *
 * Protects endpoints with API key authentication
 * API key should be passed in X-API-Key header
 * and match METRICS_API_KEY from .env
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Support both header and query parameter for API key
    // Header: X-API-Key (more secure)
    // Query: ?key=xxx (convenient for browser, but less secure)
    const apiKey = request.headers['x-api-key'] || request.query?.key;

    if (!apiKey) {
      throw new UnauthorizedException(
        'API key is missing. Provide via X-API-Key header or ?key= query parameter',
      );
    }

    const validApiKey = this.configService.get<string>('METRICS_API_KEY');

    if (!validApiKey) {
      throw new UnauthorizedException('API key is not configured on server');
    }

    if (apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}
