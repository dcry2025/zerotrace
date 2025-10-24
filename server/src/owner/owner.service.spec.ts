// src/owner/owner.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { OwnerService } from './owner.service';
import { getModelToken } from '@nestjs/sequelize';
import { Owner } from './models/owner-model';

describe('OwnerService', () => {
  let service: OwnerService;

  const mockOwnerModel = {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    findAndCountAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OwnerService,
        {
          provide: getModelToken(Owner),
          useValue: mockOwnerModel,
        },
      ],
    }).compile();

    service = module.get<OwnerService>(OwnerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOrCreateByTelegramChatId', () => {
    it('should find existing owner', async () => {
      const mockOwner = {
        id: 1,
        telegramChatId: '123456789',
        telegramUsername: 'testuser',
        save: jest.fn(),
      };
      mockOwnerModel.findOne.mockResolvedValue(mockOwner);

      const result = await service.findOrCreateByTelegramChatId('123456789');

      expect(result).toEqual(mockOwner);
      expect(mockOwnerModel.findOne).toHaveBeenCalledWith({
        where: { telegramChatId: '123456789' },
      });
    });

    it('should create new owner if not found', async () => {
      const mockNewOwner = {
        id: 2,
        telegramChatId: '987654321',
        telegramUsername: 'newuser',
      };
      mockOwnerModel.findOne.mockResolvedValue(null);
      mockOwnerModel.create.mockResolvedValue(mockNewOwner);

      const result = await service.findOrCreateByTelegramChatId(
        '987654321',
        'newuser',
      );

      expect(result).toEqual(mockNewOwner);
      expect(mockOwnerModel.create).toHaveBeenCalledWith({
        telegramChatId: '987654321',
        telegramUsername: 'newuser',
      });
    });
  });

  describe('findById', () => {
    it('should return owner when found', async () => {
      const mockOwner = {
        id: 1,
        telegramChatId: '123456789',
      };
      mockOwnerModel.findByPk.mockResolvedValue(mockOwner);

      const result = await service.findById(1);

      expect(result).toEqual(mockOwner);
      expect(mockOwnerModel.findByPk).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when owner not found', async () => {
      mockOwnerModel.findByPk.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(
        'Owner with ID 999 not found',
      );
    });
  });
});

