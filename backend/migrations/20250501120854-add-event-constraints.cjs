'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE events
      ADD CONSTRAINT events_criticality_check
      CHECK (criticality IN ('Alta', 'Media', 'Baja')),
      ADD CONSTRAINT events_status_check
      CHECK (status IN ('Reportado', 'En resolución', 'Cerrado', 'Anulado')),
      ADD CONSTRAINT events_slug_unique UNIQUE (slug)
    `)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE events
      DROP CONSTRAINT IF EXISTS events_criticality_check,
      DROP CONSTRAINT IF EXISTS events_status_check,
      DROP CONSTRAINT IF EXISTS events_slug_unique
    `)
  }
}
