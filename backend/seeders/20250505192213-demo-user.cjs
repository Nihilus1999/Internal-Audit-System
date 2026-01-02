'use strict'

const { v4: uuidv4 } = require('uuid')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE name = 'Administrador'`
    )
    const roleId = roles[0]?.id

    const [companies] = await queryInterface.sequelize.query(
      `SELECT id FROM companies WHERE rif = 'J-401375855'`
    )
    const companyId = companies[0]?.id

    return queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        username: 'aasencio11',
        first_name: 'Asdrúbal',
        last_name: 'Asencio',
        email: 'asdrubal.asencio1@gmail.com',
        password: '$2a$12$n0zmmkDoAwct9oj50GdFXe12HZazoxb7dogQ9OYDaGxdhJuwKMaG.',
        phone: '4123919712',
        id_role: roleId,
        id_company: companyId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        username: 'jelasmar24',
        first_name: 'José',
        last_name: 'El Asmar',
        email: 'jose-elasmar1999@outlook.com',
        password: '$2a$12$n0zmmkDoAwct9oj50GdFXe12HZazoxb7dogQ9OYDaGxdhJuwKMaG.',
        phone: '4127350103',
        id_role: roleId,
        id_company: companyId,
        created_at: new Date(),
        updated_at: new Date(),
      }
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', null, {})
  }
}
