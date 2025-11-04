import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RedisCacheService } from './redis-cache.service';

describe('RedisCacheService', () => {
  let service: RedisCacheService;
  let mockCacheManager: any;
  let mockRedis: any;

  beforeEach(async () => {
    mockCacheManager = {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    };

    mockRedis = {
      set: jest.fn(),
      get: jest.fn(),
      lpush: jest.fn(),
      expire: jest.fn(),
      lrange: jest.fn(),
      lrem: jest.fn(),
      del: jest.fn(),
      scan: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisCacheService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: 'REAL_REDIS',
          useValue: mockRedis,
        },
      ],
    }).compile();

    service = module.get<RedisCacheService>(RedisCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('set', () => {
    it('should call cacheManager.set with correct parameters', async () => {
      const key = 'test-key';
      const value = 'test-value';
      const ttl = 3600;

      await service.set(key, value, ttl);

      expect(mockCacheManager.set).toHaveBeenCalledWith(key, value, ttl);
    });
  });

  describe('get', () => {
    it('should call cacheManager.get and return value', async () => {
      const key = 'test-key';
      const expectedValue = 'test-value';
      mockCacheManager.get.mockResolvedValue(expectedValue);

      const result = await service.get(key);

      expect(mockCacheManager.get).toHaveBeenCalledWith(key);
      expect(result).toBe(expectedValue);
    });
  });

  describe('del', () => {
    it('should call cacheManager.del with correct key', async () => {
      const key = 'test-key';

      await service.del(key);

      expect(mockCacheManager.del).toHaveBeenCalledWith(key);
    });
  });

  describe('setBuffer', () => {
    it('should encode buffer to base64 and store in Redis', async () => {
      const key = 'test-key';
      const buffer = Buffer.from('test data');
      const ttl = 3600;

      await service.setBuffer(key, buffer, ttl);

      expect(mockRedis.set).toHaveBeenCalledWith(
        key,
        buffer.toString('base64'),
        'EX',
        ttl,
      );
    });
  });

  describe('getBuffer', () => {
    it('should retrieve and decode buffer from Redis', async () => {
      const key = 'test-key';
      const base64Data = Buffer.from('test data').toString('base64');
      mockRedis.get.mockResolvedValue(base64Data);

      const result = await service.getBuffer(key);

      expect(mockRedis.get).toHaveBeenCalledWith(key);
      expect(result).toEqual(Buffer.from('test data'));
    });

    it('should return null when key not found', async () => {
      const key = 'test-key';
      mockRedis.get.mockResolvedValue(null);

      const result = await service.getBuffer(key);

      expect(result).toBeNull();
    });
  });

  describe('lpush', () => {
    it('should call redis.lpush with correct parameters', async () => {
      const key = 'test-list';
      const value = 'test-value';
      mockRedis.lpush.mockResolvedValue(1);

      const result = await service.lpush(key, value);

      expect(mockRedis.lpush).toHaveBeenCalledWith(key, value);
      expect(result).toBe(1);
    });
  });

  describe('expire', () => {
    it('should call redis.expire with correct parameters', async () => {
      const key = 'test-key';
      const ttl = 3600;

      await service.expire(key, ttl);

      expect(mockRedis.expire).toHaveBeenCalledWith(key, ttl);
    });
  });

  describe('lrange', () => {
    it('should call redis.lrange with default parameters', async () => {
      const key = 'test-list';
      const expectedResult = ['item1', 'item2'];
      mockRedis.lrange.mockResolvedValue(expectedResult);

      const result = await service.lrange(key);

      expect(mockRedis.lrange).toHaveBeenCalledWith(key, 0, -1);
      expect(result).toEqual(expectedResult);
    });

    it('should call redis.lrange with custom parameters', async () => {
      const key = 'test-list';
      const start = 1;
      const stop = 5;
      const expectedResult = ['item2', 'item3'];
      mockRedis.lrange.mockResolvedValue(expectedResult);

      const result = await service.lrange(key, start, stop);

      expect(mockRedis.lrange).toHaveBeenCalledWith(key, start, stop);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('lrem', () => {
    it('should call redis.lrem with correct parameters', async () => {
      const key = 'test-list';
      const count = 1;
      const value = 'test-value';
      mockRedis.lrem.mockResolvedValue(1);

      const result = await service.lrem(key, count, value);

      expect(mockRedis.lrem).toHaveBeenCalledWith(key, count, value);
      expect(result).toBe(1);
    });
  });

  describe('ldel', () => {
    it('should call redis.del with correct key', async () => {
      const key = 'test-list';
      mockRedis.del.mockResolvedValue(1);

      const result = await service.ldel(key);

      expect(mockRedis.del).toHaveBeenCalledWith(key);
      expect(result).toBe(1);
    });
  });

  describe('cleanupUserPhotoCache', () => {
    it('should clean up user photo cache successfully', async () => {
      const userId = 123;
      const keys1 = [`photo:${userId}:1`, `photo:${userId}:2`];
      const keys2 = [`filetype:${userId}:1`, `filetype:${userId}:2`];

      mockRedis.scan
        .mockResolvedValueOnce(['0', keys1])
        .mockResolvedValueOnce(['0', keys2])
        .mockResolvedValueOnce(['0', []]);
      mockRedis.del.mockResolvedValue(1);

      const result = await service.cleanupUserPhotoCache(userId);

      expect(result).toBe(5); // 4 keys + 1 list
      expect(mockRedis.del).toHaveBeenCalledWith(`photo:${userId}:list`);
    });
  });

  describe('generateCacheKey', () => {
    it('should generate correct cache key', () => {
      const userId = 9;
      const url = '/chat';
      const expectedKey = 'cache:module:user_9_%2Fchat';

      const result = service.generateCacheKey(userId, url);

      expect(result).toBe(expectedKey);
    });
  });
});
