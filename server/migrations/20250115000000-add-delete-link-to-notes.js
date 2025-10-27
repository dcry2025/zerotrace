'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add delete_link column to notes table (allow null initially)
    await queryInterface.addColumn('notes', 'delete_link', {
      type: Sequelize.STRING(64),
      allowNull: true, // Allow null initially for existing records
      unique: true,
      comment: 'Unique delete link identifier for destroying the note',
    });

    // Update existing records to have delete links
    const { v4: uuidv4 } = require('uuid');
    const notes = await queryInterface.sequelize.query(
      'SELECT id FROM notes WHERE delete_link IS NULL',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    for (const note of notes) {
      const deleteLink = 'del_' + uuidv4().replace(/-/g, '');
      await queryInterface.sequelize.query(
        'UPDATE notes SET delete_link = :deleteLink WHERE id = :id',
        {
          replacements: { deleteLink, id: note.id },
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }

    // Now make the column NOT NULL
    await queryInterface.changeColumn('notes', 'delete_link', {
      type: Sequelize.STRING(64),
      allowNull: false,
      unique: true,
      comment: 'Unique delete link identifier for destroying the note',
    });

    // Add index on delete_link for faster lookups
    await queryInterface.addIndex('notes', ['delete_link'], {
      name: 'idx_notes_delete_link',
      unique: true,
    });

    // Add composite index for deleteLink + deletedAt (for delete link queries)
    await queryInterface.addIndex('notes', ['delete_link', 'deleted_at'], {
      name: 'idx_notes_delete_link_deleted_at',
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes first
    await queryInterface.removeIndex('notes', 'idx_notes_delete_link_deleted_at');
    await queryInterface.removeIndex('notes', 'idx_notes_delete_link');
    
    // Remove column
    await queryInterface.removeColumn('notes', 'delete_link');
  }
};
