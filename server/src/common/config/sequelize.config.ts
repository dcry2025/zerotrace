// src/common/config/sequelize.config.ts

// Nest js
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModuleOptions } from '@nestjs/sequelize';

/**
 * Sequelize Configuration
 *
 * Universal configuration for both development and production environments.
 * All environment-specific settings are controlled via environment variables.
 *
 * Models are automatically loaded via autoLoadModels: true
 * Each module registers its models using SequelizeModule.forFeature([Model])
 */
export const SequelizeConfig = {
  isGlobal: true,
  imports: [ConfigModule],
  useFactory: async (
    configService: ConfigService,
  ): Promise<SequelizeModuleOptions> => {
    const mysqlHost = configService.get<string>('MYSQL_HOST', 'localhost');
    const mysqlPort = parseInt(
      configService.get<string>('MYSQL_PORT', '3306'),
      10,
    );
    const mysqlUsername = configService.get<string>('MYSQL_USERNAME');
    const mysqlPassword = configService.get<string>('MYSQL_PASSWORD');
    const mysqlName = configService.get<string>('MYSQL_NAME');
    const dbLogging = configService.get<string>('DB_LOGGING');

    console.log('🔍 Sequelize Config Debug:');
    console.log('  MYSQL_HOST:', mysqlHost);
    console.log('  MYSQL_PORT:', mysqlPort);
    console.log('  MYSQL_USERNAME:', mysqlUsername);
    console.log('  MYSQL_PASSWORD:', mysqlPassword);
    console.log('  MYSQL_NAME:', mysqlName);
    console.log('  DB_LOGGING:', dbLogging);

    return {
      dialect: 'mysql',
      host: configService.get<string>('MYSQL_HOST', '127.0.0.1'),
      port: parseInt(configService.get<string>('MYSQL_PORT', '3306'), 10),
      username: configService.get<string>('MYSQL_USERNAME'),
      password: configService.get<string>('MYSQL_PASSWORD'),
      database: configService.get<string>('MYSQL_NAME'),

      // Database behavior
      autoLoadModels: true,
      synchronize: false, // Always false - use migrations for both dev and prod

      // Logging - can be controlled via env variable
      logging:
        configService.get<string>('DB_LOGGING') === 'true'
          ? console.log
          : false,

      // Model defaults
      define: {
        underscored: true,
        timestamps: true,
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
      },

      // Dialect-specific options
      dialectOptions: {
        charset: 'utf8mb4',
        // SSL/TLS can be enabled via environment variable if needed
        ...(configService.get<string>('DB_SSL') === 'true' && {
          ssl: {
            require: true,
            rejectUnauthorized:
              configService.get<string>(
                'DB_SSL_REJECT_UNAUTHORIZED',
                'true',
              ) === 'true',
          },
        }),
      },

      // Connection pool settings - same for both environments
      pool: {
        max: parseInt(configService.get<string>('DB_POOL_MAX', '50'), 10),
        min: parseInt(configService.get<string>('DB_POOL_MIN', '10'), 10),
        acquire: parseInt(
          configService.get<string>('DB_POOL_ACQUIRE', '30000'),
          10,
        ),
        idle: parseInt(configService.get<string>('DB_POOL_IDLE', '10000'), 10),
      },

      // Retry settings
      retry: {
        max: parseInt(configService.get<string>('DB_RETRY_MAX', '3'), 10),
      },
    };
  },
  inject: [ConfigService],
};
