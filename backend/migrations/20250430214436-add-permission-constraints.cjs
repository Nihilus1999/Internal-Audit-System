'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE permissions
      ADD CONSTRAINT permissions_name_unique UNIQUE (name),
      ADD CONSTRAINT permissions_key_unique UNIQUE (key)
    `)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE permissions
      DROP CONSTRAINT IF EXISTS permissions_name_unique,
      DROP CONSTRAINT IF EXISTS permissions_key_unique
    `)
  }
}