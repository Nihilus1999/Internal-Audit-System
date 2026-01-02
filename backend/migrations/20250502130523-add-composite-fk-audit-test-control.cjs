'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE audit_test_controls
      ADD CONSTRAINT fk_audit_test_controls
      FOREIGN KEY (id_audit_program, id_process, id_control)
      REFERENCES audit_process_controls (id_audit_program, id_process, id_control)
      ON UPDATE RESTRICT
      ON DELETE RESTRICT
    `)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE audit_test_controls
      DROP CONSTRAINT IF EXISTS fk_audit_test_controls
    `)
  }
}