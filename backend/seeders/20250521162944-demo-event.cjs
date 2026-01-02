'use strict'

const { v4: uuidv4 } = require('uuid')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('events', [
      {
        id: uuidv4(),
        slug: 'event-1',
        name: 'Pérdida de competitividad frente al mercado',
        description: 'La empresa perdió participación frente a competidores que se estan posicionando en el mercado, con mejores precio',
        cause: 'Falta de análisis del mercado y desconocimiento del panorama actual de las empresas',
        consequences: 'Disminución de ventas, pérdida de posicionamiento y deterioro de la marca',
        criticality: 'Alta',
        incident_date: '2025-04-24',
        incident_hour: '15:00:00',
        economic_loss: '40000',
        status: 'Reportado',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        slug: 'event-2',
        name: 'Disminución en la satisfacción del cliente',
        description: 'El cliente muestra insatisfacción con el servicio prestado',
        cause: 'Errores en el trabajo, mala estrategia para el cliente, etc.',
        consequences: 'Disminución de ventas, pérdida de posicionamiento y deterioro de la marca',
        criticality: 'Alta',
        incident_date: '2025-03-15',
        incident_hour: null,
        economic_loss: '2150',
        status: 'Reportado',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        slug: 'event-3',
        name: 'Incremento en el número de renuncias en períodos cortos',
        description: 'Los empleados de Consultores J.D.G estan renunciando más de lo normal',
        cause: 'Insatisfacción sobre el ambiente laboral, mala compensación económica y falta de capacitación',
        consequences: 'Falta de personal en procesos clave de la empresa',
        criticality: 'Media',
        incident_date: '2025-03-12',
        incident_hour: null,
        economic_loss: '500',
        status: 'Reportado',
        created_at: new Date(),
        updated_at: new Date(),
      }
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('events', null, {})
  }
}
