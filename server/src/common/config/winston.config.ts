// src/common/config/winston.config.ts

// Nest js
import { ConfigService } from '@nestjs/config';

// Other packages
import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

/**
 * Winston Logger Configuration
 */
export async function createWinstonConfig(
  configService: ConfigService,
): Promise<WinstonModuleOptions> {
  const logLevel = configService.get<string>('LOG_LEVEL', 'info');

  // Common JSON format for file logs (easier to parse, search, and analyze)
  const jsonFileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.metadata({
      fillExcept: ['message', 'level', 'timestamp', 'context'],
    }),
    winston.format.json(),
  );

  // Human-readable format for console
  const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp, context, ...meta }) => {
      let log = `${timestamp} [${context || 'Application'}] ${level}: ${message}`;

      // Add metadata if present
      const metaKeys = Object.keys(meta).filter(key => key !== 'metadata');
      if (metaKeys.length > 0) {
        log += ` ${JSON.stringify(meta)}`;
      }

      return log;
    }),
  );

  const transports: winston.transport[] = [
    // Console transport - always enabled
    new winston.transports.Console({
      format: consoleFormat,
      level: logLevel,
    }),

    // Combined logs (info and above) - JSON format for easy parsing
    new winston.transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d', // Keep for 30 days
      level: 'info',
      format: jsonFileFormat,
    }),

    // Error logs only - keep longer for debugging
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '90d', // Keep errors for 90 days
      level: 'error',
      format: jsonFileFormat,
    }),

    // Debug logs - only when explicitly enabled via LOG_LEVEL=debug
    ...(logLevel === 'debug'
      ? [
          new winston.transports.DailyRotateFile({
            filename: 'logs/debug-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '10m',
            maxFiles: '7d', // Debug logs kept for 7 days only
            level: 'debug',
            format: jsonFileFormat,
          }),
        ]
      : []),
  ];

  return {
    level: logLevel,
    transports,
    // Exit on error: false (continue logging even if transport fails)
    exitOnError: false,
  };
}
