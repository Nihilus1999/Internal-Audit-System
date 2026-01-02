'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE action_plans
      ADD CONSTRAINT action_plans_type_check
      CHECK (plan_type IN ('Evento', 'Hallazgo')),
      ADD CONSTRAINT action_plans_status_check
      CHECK (status IN ('Pendiente', 'En progreso', 'Completado', 'Suspendido')),
      ADD CONSTRAINT action_plans_slug_unique UNIQUE (slug)
    `)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE action_plans
      DROP CONSTRAINT IF EXISTS action_plans_type_check,
      DROP CONSTRAINT IF EXISTS action_plans_status_check,
      DROP CONSTRAINT IF EXISTS action_plans_slug_unique
    `)
  }
}
