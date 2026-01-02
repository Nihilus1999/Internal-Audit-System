'use strict'

const { v4: uuidv4 } = require('uuid')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [companies] = await queryInterface.sequelize.query(
      `SELECT id FROM companies WHERE rif = 'J-401375855'`
    )
    const companyId = companies[0]?.id

    return queryInterface.bulkInsert('processes', [
      {
        id: uuidv4(),
        slug: 'process-1',
        name: 'Atención al Cliente',
        description: 'Asistencia y soporte a las necesidades del cliente',
        objective: 'Garantizar satisfacción del cliente y resolver sus problemas',
        id_company: companyId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        slug: 'process-2',
        name: 'Marketing',
        description: 'Estrategias para promocionar y posicionar los servicios',
        objective: 'Aumentar la visibilidad y atraer clientes potenciales',
        id_company: companyId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        slug: 'process-3',
        name: 'Recursos Humanos',
        description: 'Dedicada a la gestión del personal y recursos humanos',
        objective: 'Administrar el personal de la empresa y su bienestar',
        id_company: companyId,
        created_at: new Date(),
        updated_at: new Date(),
      }
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('processes', null, {})
  }
}
