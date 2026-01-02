'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE files
      ADD CONSTRAINT test_files_type_check
      CHECK (test_file_type IN ('Fuente', 'Evidencia'))
    `)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE files
      DROP CONSTRAINT IF EXISTS test_files_type_check
    `)
  }
}
