// src/telegram/telegram.controller.ts

// Nest js
import {
  Controller,
  Post,
  Body,
  Logger,
  HttpCode,
  HttpStatus,
  Get,
  Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Service
import { TelegramService } from './telegram.service';

// Decorators
import { CustomThrottle, SkipThrottle } from '../common/decorators';

@Controller('telegram')
export class TelegramController {
  private readonly logger = new Logger(TelegramController.name);

  constructor(
    private readonly telegramService: TelegramService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Webhook endpoint for Telegram updates
   * Telegram will send updates to this endpoint
   * Skip throttle for Telegram's webhook calls
   */
  @SkipThrottle()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() body: any): Promise<{ ok: boolean }> {
    try {
      if (!this.telegramService.isReady()) {
        this.logger.warn('Telegram bot not ready, ignoring webhook');
        return { ok: false };
      }

      const bot = this.telegramService.getBot();

      // Handle the update directly
      await bot.handleUpdate(body);

      return { ok: true };
    } catch (error) {
      this.logger.error('Error processing webhook:', error);
      return { ok: false };
    }
  }

  /**
   * Health check endpoint
   */
  @Get('health')
  async healthCheck(): Promise<{
    status: string;
    botReady: boolean;
    message: string;
  }> {
    const isReady = this.telegramService.isReady();
    return {
      status: isReady ? 'ok' : 'not_initialized',
      botReady: isReady,
      message: isReady
        ? 'Telegram bot is ready'
        : 'Telegram bot is not initialized. Check TELEGRAM_BOT_TOKEN in environment variables.',
    };
  }

  /**
   * Get bot information (username and deep link)
   * Query param: username - telegram username to include in deep link
   */
  @Get('bot-info')
  async getBotInfo(@Query('username') username?: string): Promise<{
    username: string | null;
    link: string | null;
    ready: boolean;
  }> {
    const botInfo = await this.telegramService.getBotInfo(username);
    return {
      username: botInfo?.username || null,
      link: botInfo?.link || null,
      ready: this.telegramService.isReady(),
    };
  }

  /**
   * Setup webhook (call this endpoint to configure webhook URL)
   * Only accessible in development or with proper authentication
   * Strict rate limit: 3 requests per hour
   */
  @CustomThrottle({ long: { limit: 3, ttl: 3600000 } })
  @Post('setup-webhook')
  async setupWebhook(): Promise<{
    success: boolean;
    webhookUrl?: string;
    message: string;
  }> {
    try {
      const domain = this.configService.get<string>('APP_DOMAIN');
      const webhookPath = this.configService.get<string>(
        'TELEGRAM_WEBHOOK_PATH',
        '/telegram/webhook',
      );

      if (!domain) {
        return {
          success: false,
          message: 'APP_DOMAIN not configured in environment variables',
        };
      }

      const webhookUrl = `${domain}${webhookPath}`;
      const success = await this.telegramService.setWebhook(webhookUrl);

      return {
        success,
        webhookUrl: success ? webhookUrl : undefined,
        message: success
          ? 'Webhook configured successfully'
          : 'Failed to configure webhook',
      };
    } catch (error) {
      this.logger.error('Error setting up webhook:', error);
      return {
        success: false,
        message: `Error: ${error.message}`,
      };
    }
  }
}
