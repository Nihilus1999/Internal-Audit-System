'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE audit_finding_controls
      ADD CONSTRAINT fk_audit_finding_controls
      FOREIGN KEY (id_audit_test, id_audit_program, id_process, id_control)
      REFERENCES audit_test_controls (id_audit_test, id_audit_program, id_process, id_control)
      ON UPDATE RESTRICT
      ON DELETE RESTRICT
    `)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE audit_finding_controls
      DROP CONSTRAINT IF EXISTS fk_audit_finding_controls
    `)
  }
}