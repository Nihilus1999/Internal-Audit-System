'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE roles
      ADD CONSTRAINT roles_name_unique UNIQUE (name)
    `)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE roles
      DROP CONSTRAINT IF EXISTS roles_name_unique
    `)
  }
}