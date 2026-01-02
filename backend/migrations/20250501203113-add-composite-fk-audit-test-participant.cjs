'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE audit_test_participants
      ADD CONSTRAINT fk_audit_test_users
      FOREIGN KEY (id_audit_program, id_user)
      REFERENCES audit_participants (id_audit_program, id_user)
      ON UPDATE RESTRICT
      ON DELETE RESTRICT
    `)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE audit_test_participants
      DROP CONSTRAINT IF EXISTS fk_audit_test_users
    `)
  }
}