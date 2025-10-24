// src/common/http-cache.service.ts

// Nest js
import { Injectable } from '@nestjs/common';

// Other packages
import * as crypto from 'crypto';
import { FastifyReply, FastifyRequest } from 'fastify';

@Injectable()
export class HttpCacheService {
  setCacheHeaders(
    req: FastifyRequest,
    res: FastifyReply,
    data: any,
    maxAgeSeconds: number,
  ): boolean {
    const etag = this.generateETag(data);
    const clientETag = req.headers['if-none-match'];

    if (clientETag === etag) {
      res.status(304).send(); // Not Modified
      return true;
    }

    res.header('Cache-Control', `public, max-age=${maxAgeSeconds}`);
    res.header('ETag', etag);
    return false;
  }

  private generateETag(data: any): string {
    return `"${crypto.createHash('md5').update(JSON.stringify(data)).digest('hex')}"`;
  }
}
