'use strict'

const { v4: uuidv4 } = require('uuid')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [events] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM events WHERE slug IN ('event-1', 'event-2', 'event-3')`
    )
    const eventMap = {}
    for (const e of events) {
      eventMap[e.slug] = e.id
    }
    return queryInterface.bulkInsert('action_plans', [
      {
        id: uuidv4(),
        slug: 'actionPlan-1',
        name: 'Mejora integral de la experiencia del cliente',
        description: 'Plan enfocado en identificar los principales puntos de fricción en la atención al cliente y mejorar la experiencia mediante formación y herramientas de seguimiento.',
        plan_type: 'Evento',
        start_date: '2025-05-30',
        end_date: '2025-06-28',
        status: 'Pendiente',
        id_event: eventMap['event-2'],
        id_finding: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        slug: 'actionPlan-2',
        name: 'Mejorar la retención del personal clave',
        description: 'Plan orientado a mejorar las condiciones laborales y el compromiso del personal, mediante acciones enfocadas en bienestar y oportunidades de desarrollo',
        plan_type: 'Evento',
        start_date: '2025-06-05',
        end_date: '2025-07-10',
        status: 'Pendiente',
        id_event: eventMap['event-3'],
        id_finding: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        slug: 'actionPlan-3',
        name: 'Rediseño de Estrategia Digital Basada en Datos',
        description: 'Se necesita una reestructuración de las estrategias digitales de la empresa con base en los datos obtenidos y las proyecciones para atraer clientes; redes sociales, campañas digitales y pagina web',
        plan_type: 'Evento',
        start_date: '2025-06-16',
        end_date: '2025-07-20',
        status: 'Pendiente',
        id_event: eventMap['event-1'],
        id_finding: null,
        created_at: new Date(),
        updated_at: new Date(),
      }
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('action_plans', null, {})
  }
}
