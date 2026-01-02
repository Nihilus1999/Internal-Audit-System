'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE audit_process_controls
      ADD CONSTRAINT fk_audit_process_control
      FOREIGN KEY (id_process, id_control)
      REFERENCES process_controls (id_process, id_control)
      ON UPDATE RESTRICT
      ON DELETE RESTRICT
    `)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE audit_process_controls
      DROP CONSTRAINT IF EXISTS fk_audit_process_control
    `)
  }
}