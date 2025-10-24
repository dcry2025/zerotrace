'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notes', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Note content (plain text - not encrypted)',
      },
      unique_link: {
        type: Sequelize.STRING(64),
        allowNull: false,
        unique: true,
        comment: 'Unique link identifier for accessing the note',
      },
      password_hash: {
        type: Sequelize.STRING(128),
        allowNull: true,
        comment: 'Hashed password for protected notes (argon2)',
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Expiration timestamp for the note',
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
        comment: 'IP address of note creator',
      },
      notify_on_read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether to notify when note is read',
      },
      owner_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Reference to owner (for Telegram notifications)',
        references: {
          model: 'owners',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      read_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Timestamp when note was read',
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
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Soft delete timestamp',
      },
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });

    // Add index on unique_link for faster lookups
    await queryInterface.addIndex('notes', ['unique_link'], {
      name: 'idx_notes_unique_link',
      unique: true,
    });

    // Add index on expires_at for cleanup jobs
    await queryInterface.addIndex('notes', ['expires_at'], {
      name: 'idx_notes_expires_at',
    });

    // Add index on read_at for queries (NULL = unread, NOT NULL = read)
    await queryInterface.addIndex('notes', ['read_at'], {
      name: 'idx_notes_read_at',
    });

    // Add composite index for uniqueLink + deletedAt (most common query pattern)
    await queryInterface.addIndex('notes', ['unique_link', 'deleted_at'], {
      name: 'idx_notes_unique_link_deleted_at',
    });

    // Add composite index for readAt + expiresAt (for statistics queries)
    await queryInterface.addIndex('notes', ['read_at', 'expires_at'], {
      name: 'idx_notes_read_at_expires_at',
    });

    // Add composite index for createdAt + readAt (for admin queries with filters)
    await queryInterface.addIndex('notes', ['created_at', 'read_at'], {
      name: 'idx_notes_created_at_read_at',
    });

    // Add index on owner_id for foreign key lookups
    await queryInterface.addIndex('notes', ['owner_id'], {
      name: 'idx_notes_owner_id',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('notes');
  }
};

