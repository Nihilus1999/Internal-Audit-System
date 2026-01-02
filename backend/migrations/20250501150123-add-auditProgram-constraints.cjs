'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE audit_programs
      ADD CONSTRAINT audit_programs_status_check
      CHECK (status IN ('Por iniciar', 'En planificación', 'En ejecución', 'En reporte', 'Completado', 'Suspendido')),
      ADD CONSTRAINT audit_programs_planning_status_check
      CHECK (planning_status IN ('Por iniciar', 'En progreso', 'Completado')),
      ADD CONSTRAINT audit_programs_execution_status_check
      CHECK (execution_status IN ('Por iniciar', 'En progreso', 'Completado')),
      ADD CONSTRAINT audit_programs_reporting_status_check
      CHECK (reporting_status IN ('Por iniciar', 'En progreso', 'Completado')),
      ADD CONSTRAINT audit_programs_slug_unique UNIQUE (slug)
    `)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE audit_programs
      DROP CONSTRAINT IF EXISTS audit_programs_status_check,
      DROP CONSTRAINT IF EXISTS audit_programs_planning_status_check,
      DROP CONSTRAINT IF EXISTS audit_programs_execution_status_check,
      DROP CONSTRAINT IF EXISTS audit_programs_reporting_status_check,
      DROP CONSTRAINT IF EXISTS audit_programs_slug_unique
    `)
  }
}
