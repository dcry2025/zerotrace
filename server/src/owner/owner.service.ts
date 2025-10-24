// src/owner/owner.service.ts

// Nest js
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

// Models
import { Owner } from './models/owner-model';

@Injectable()
export class OwnerService {
  private readonly logger = new Logger(OwnerService.name);

  constructor(
    @InjectModel(Owner)
    private ownerModel: typeof Owner,
  ) {}

  /**
   * Find or create Owner by Telegram chat ID
   * @param telegramChatId - Telegram chat ID
   * @param telegramUsername - Optional Telegram username
   * @returns Promise<Owner> - Found or created Owner
   */
  async findOrCreateByTelegramChatId(
    telegramChatId: string,
    telegramUsername?: string,
  ): Promise<Owner> {
    // Try to find existing owner
    let owner = await this.ownerModel.findOne({
      where: { telegramChatId },
    });

    if (owner) {
      this.logger.log(
        `Found existing Owner ${owner.id} for chat_id ${telegramChatId}`,
      );

      // Update username if provided and different
      if (telegramUsername && owner.telegramUsername !== telegramUsername) {
        owner.telegramUsername = telegramUsername;
        await owner.save();
        this.logger.log(
          `Updated username for Owner ${owner.id} to @${telegramUsername}`,
        );
      }

      return owner;
    }

    // Create new owner
    owner = await this.ownerModel.create({
      telegramChatId,
      telegramUsername: telegramUsername || null,
    });

    this.logger.log(
      `✅ Created new Owner ${owner.id} for chat_id ${telegramChatId}${telegramUsername ? ` (@${telegramUsername})` : ''}`,
    );

    return owner;
  }

  /**
   * Find Owner by ID
   * @param id - Owner ID
   * @returns Promise<Owner> - Found Owner
   * @throws NotFoundException if Owner not found
   */
  async findById(id: number): Promise<Owner> {
    const owner = await this.ownerModel.findByPk(id);

    if (!owner) {
      throw new NotFoundException(`Owner with ID ${id} not found`);
    }

    return owner;
  }

  /**
   * Find Owner by Telegram chat ID
   * @param telegramChatId - Telegram chat ID
   * @returns Promise<Owner | null> - Found Owner or null
   */
  async findByChatId(telegramChatId: string): Promise<Owner | null> {
    return await this.ownerModel.findOne({
      where: { telegramChatId },
    });
  }

  /**
   * Update Telegram username for Owner
   * @param id - Owner ID
   * @param telegramUsername - New Telegram username
   * @returns Promise<Owner> - Updated Owner
   */
  async updateUsername(
    id: number,
    telegramUsername: string,
  ): Promise<Owner> {
    const owner = await this.findById(id);
    owner.telegramUsername = telegramUsername;
    await owner.save();

    this.logger.log(
      `Updated username for Owner ${id} to @${telegramUsername}`,
    );

    return owner;
  }

  /**
   * Get all owners (for admin purposes)
   * @param limit - Number of records to return
   * @param offset - Number of records to skip
   */
  async getAll(limit: number = 100, offset: number = 0) {
    const safeLimit = Math.min(Math.max(limit, 1), 500);
    const safeOffset = Math.max(offset, 0);

    const result = await this.ownerModel.findAndCountAll({
      limit: safeLimit,
      offset: safeOffset,
      order: [['createdAt', 'DESC']],
    });

    return {
      total: result.count,
      limit: safeLimit,
      offset: safeOffset,
      hasMore: result.count > safeOffset + safeLimit,
      owners: result.rows,
    };
  }
}

