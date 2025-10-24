'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('notes', 'encrypted_key_for_admin', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'noteKey encrypted with admin RSA public key for admin decryption',
      after: 'content', // Add after content column
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('notes', 'encrypted_key_for_admin');
  }
};

