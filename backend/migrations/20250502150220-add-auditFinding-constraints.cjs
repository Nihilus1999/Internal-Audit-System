'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE audit_findings
      ADD CONSTRAINT audit_findings_classification_check
      CHECK (classification IN ('Menor', 'Moderado', 'Importante', 'Crítico')),
      ADD CONSTRAINT audit_findings_type_check
      CHECK (finding_type IN ('Conforme', 'No conforme')),
      ADD CONSTRAINT audit_findings_slug_unique UNIQUE (slug)
    `)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE audit_findings
      DROP CONSTRAINT IF EXISTS audit_findings_classification_check,
      DROP CONSTRAINT IF EXISTS audit_findings_type_check,
      DROP CONSTRAINT IF EXISTS audit_findings_slug_unique
    `)
  }
}
