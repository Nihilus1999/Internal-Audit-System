'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE processes
      ADD CONSTRAINT processes_slug_unique UNIQUE (slug),
      ADD CONSTRAINT processes_name_unique UNIQUE (name)
    `)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE processes
      DROP CONSTRAINT IF EXISTS processes_slug_unique,
      DROP CONSTRAINT IF EXISTS processes_name_unique
    `)
  }
}