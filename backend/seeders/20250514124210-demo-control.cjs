'use strict'

const { v4: uuidv4 } = require('uuid')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('controls', [
      {
        id: uuidv4(),
        slug: 'control-1',
        name: 'Asistencia virtual y presencial para clientes',
        description: 'Servicio de atención híbrido que combina canales virtuales (chat, videollamadas, correo) con puntos de atención presencial, brindando mayor accesibilidad y cobertura para resolver consultas',
        control_type: 'Preventivo',
        management_type: 'Manual',
        teoric_effectiveness: 'Aceptable',
        application_frequency: 'Cuando sea requerido',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        slug: 'control-2',
        name: 'Manual de comunicación y protocolos de respuesta',
        description: 'Guía que establece lineamientos claros sobre el tono, lenguaje y tiempos de respuesta para brindar atención coherente y profesional en todos los canales',
        control_type: 'Preventivo',
        management_type: 'Combinado',
        teoric_effectiveness: 'Óptimo',
        application_frequency: 'Tiempo Real',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        slug: 'control-3',
        name: 'Análisis de tendencias del mercado',
        description: 'Cuanles son las tendecias de las empresas actualmente',
        control_type: 'Detectivo',
        management_type: 'Combinado',
        teoric_effectiveness: 'Aceptable',
        application_frequency: 'Semanal',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        slug: 'control-4',
        name: 'Optimización de campañas publicitarias',
        description: 'Las campañas publicitarias deben estar estrategicamente diseñadas para atraer clientes',
        control_type: 'Detectivo',
        management_type: 'Manual',
        teoric_effectiveness: 'Óptimo',
        application_frequency: 'Semanal',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        slug: 'control-5',
        name: 'Programas de capacitación continua',
        description: 'Los empleados deben estar debidamente preparados para el trabajo y mejorar su aprendizaje',
        control_type: 'Preventivo',
        management_type: 'Manual',
        teoric_effectiveness: 'Deficiente',
        application_frequency: 'Anual',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        slug: 'control-6',
        name: 'Compensación salarial competitiva',
        description: 'Los empleados deben ser debidamente compensados por su trabajo',
        control_type: 'Preventivo',
        management_type: 'Manual',
        teoric_effectiveness: 'Óptimo',
        application_frequency: 'Mensual',
        created_at: new Date(),
        updated_at: new Date(),
      }
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('controls', null, {})
  }
}
