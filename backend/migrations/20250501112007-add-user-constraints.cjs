'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE users
      ADD CONSTRAINT users_username_unique UNIQUE (username),
      ADD CONSTRAINT users_email_unique UNIQUE (email)
    `)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE users
      DROP CONSTRAINT IF EXISTS users_username_unique,
      DROP CONSTRAINT IF EXISTS users_email_unique
    `)
  }
}