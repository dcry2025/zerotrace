// database.js
// Configuration for sequelize-cli (migrations)
// This file is used by sequelize-cli for running migrations

require('dotenv').config(); // Load environment variables

module.exports = {
  development: {
    dialect: 'mysql',
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_NAME,
    
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
    },
    
    // Logging
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  },
  
  production: {
    dialect: 'mysql',
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    username: process.env.MYSQL_USERNAME || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_NAME || 'privnote',
    
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
      ...(process.env.DB_SSL === 'true' && {
        ssl: {
          require: true,
          rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
        },
      }),
    },
    
    // Connection pool settings
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '50', 10),
      min: parseInt(process.env.DB_POOL_MIN || '10', 10),
      acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000', 10),
      idle: parseInt(process.env.DB_POOL_IDLE || '10000', 10),
    },
    
    // Logging - typically disabled in production
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  },
};


