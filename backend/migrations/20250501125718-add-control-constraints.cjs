'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE controls
      ADD CONSTRAINT controls_type_check
      CHECK (control_type IN ('Preventivo', 'Detectivo', 'Correctivo')),
      ADD CONSTRAINT controls_management_type_check
      CHECK (management_type IN ('Automático', 'Manual', 'Combinado')),
      ADD CONSTRAINT controls_teoric_effectiveness_check
      CHECK (teoric_effectiveness IN ('Óptimo', 'Aceptable', 'Deficiente')),
      ADD CONSTRAINT controls_application_frequency_check
      CHECK (application_frequency IN ('Cuando sea requerido', 'Anual', 'Mensual', 'Quincenal', 'Semanal', 'Diario', 'Por Hora', 'Tiempo Real')),
      ADD CONSTRAINT controls_slug_unique UNIQUE (slug),
      ADD CONSTRAINT controls_name_unique UNIQUE (name)
    `)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE controls
      DROP CONSTRAINT IF EXISTS controls_type_check,
      DROP CONSTRAINT IF EXISTS controls_management_type_check,
      DROP CONSTRAINT IF EXISTS controls_teoric_effectiveness_check,
      DROP CONSTRAINT IF EXISTS controls_application_frequency_check,
      DROP CONSTRAINT IF EXISTS controls_slug_unique,
      DROP CONSTRAINT IF EXISTS controls_name_unique
    `)
  }
}
