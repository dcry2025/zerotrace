'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('owners', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      telegram_chat_id: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
        comment: 'Telegram chat ID (unique per user)',
      },
      telegram_username: {
        type: Sequelize.STRING(32),
        allowNull: true,
        comment: 'Telegram username (optional)',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });

    // Add unique index on telegram_chat_id for faster lookups
    await queryInterface.addIndex('owners', ['telegram_chat_id'], {
      name: 'idx_owners_telegram_chat_id',
      unique: true,
    });

    // Add index on telegram_username for optional lookups
    await queryInterface.addIndex('owners', ['telegram_username'], {
      name: 'idx_owners_telegram_username',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('owners');
  }
};

