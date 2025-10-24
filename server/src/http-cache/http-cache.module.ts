// src/http-cache/http-cache.module.ts

// Nest js
import { Module } from '@nestjs/common';

// Services
import { HttpCacheService } from './http-cache.service';

@Module({
  imports: [],
  providers: [HttpCacheService],
  exports: [HttpCacheService],
})
export class HttpCacheModule {}
