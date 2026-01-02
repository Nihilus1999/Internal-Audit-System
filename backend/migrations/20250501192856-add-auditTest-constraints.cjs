'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE audit_tests
      ADD CONSTRAINT audit_tests_status_check
      CHECK (status IN ('Por iniciar', 'En progreso', 'Completado', 'Suspendido')),
      ADD CONSTRAINT audit_tests_slug_unique UNIQUE (slug)
    `)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE audit_tests
      DROP CONSTRAINT IF EXISTS audit_tests_status_check,
      DROP CONSTRAINT IF EXISTS audit_tests_slug_unique
    `)
  }
}
