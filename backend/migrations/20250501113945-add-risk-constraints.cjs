'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE risks
      ADD CONSTRAINT risks_origin_check
      CHECK (origin IN ('Interno', 'Externo')),
      ADD CONSTRAINT risks_probability_check
      CHECK (probability IN ('Alta', 'Media', 'Baja')),
      ADD CONSTRAINT risks_impact_check
      CHECK (impact IN ('Alto', 'Medio', 'Bajo')),
      ADD CONSTRAINT risks_slug_unique UNIQUE (slug),
      ADD CONSTRAINT risks_name_unique UNIQUE (name)
    `)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE risks
      DROP CONSTRAINT IF EXISTS risks_origin_check,
      DROP CONSTRAINT IF EXISTS risks_probability_check,
      DROP CONSTRAINT IF EXISTS risks_impact_check,
      DROP CONSTRAINT IF EXISTS risks_slug_unique,
      DROP CONSTRAINT IF EXISTS risks_name_unique
    `)
  }
}
