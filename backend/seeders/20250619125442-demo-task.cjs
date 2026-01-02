'use strict'

const { v4: uuidv4 } = require('uuid')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [actionPlans] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM action_plans WHERE slug IN ('actionPlan-1', 'actionPlan-2', 'actionPlan-3')`
    )
    const actionPlanMap = {}
    for (const a of actionPlans) {
      actionPlanMap[a.slug] = a.id
    }
    return queryInterface.bulkInsert('tasks', [
      {
        id: uuidv4(),
        name: 'Formación del personal en atención al cliente y protocolos de respuesta',
        id_action_plan: actionPlanMap['actionPlan-1'],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Identificar los puntos debiles o fricción en el proceso de atención al cliente',
        id_action_plan: actionPlanMap['actionPlan-1'],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Implementar herramientas de seguimiento al cliente para mejora la satisfacción',
        id_action_plan: actionPlanMap['actionPlan-1'],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Mejorar el salario del personal de Consultores J.D.G.',
        id_action_plan: actionPlanMap['actionPlan-2'],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Brindar cursos de formación al personal de la empresa',
        id_action_plan: actionPlanMap['actionPlan-2'],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Relizar eventos especiales de compartir entre los empleados',
        id_action_plan: actionPlanMap['actionPlan-2'],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Análisis de Datos y Segmentación de Audiencia',
        id_action_plan: actionPlanMap['actionPlan-3'],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Ajuste de Campañas Digitales según Insights',
        id_action_plan: actionPlanMap['actionPlan-3'],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Rediseño Web y Mejora de Estrategia en Redes Sociales',
        id_action_plan: actionPlanMap['actionPlan-3'],
        created_at: new Date(),
        updated_at: new Date(),
      }
    ], {})
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('tasks', null, {})
  }
}
