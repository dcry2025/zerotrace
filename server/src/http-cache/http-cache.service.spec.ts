import { Test, TestingModule } from '@nestjs/testing';
import { HttpCacheService } from './http-cache.service';

describe('HttpCacheService', () => {
  let service: HttpCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpCacheService],
    }).compile();

    service = module.get<HttpCacheService>(HttpCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
