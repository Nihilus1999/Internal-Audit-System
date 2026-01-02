'use strict'

const { v4: uuidv4 } = require('uuid')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('risks', [
      {
        id: uuidv4(),
        slug: 'risk-1',
        name: 'Atención al cliente insuficiente',
        description: 'Se refere a la posibilidad de que la empresa no brinde un servicio adecuado o efciente a los clientes, lo que puede resultar en insatisfacción, pérdida de clientes, daño a la reputación y desventaja frente a la competencia.',
        risk_source: 'Falta de capacitación del personal',
        origin: 'Interno',
        possible_consequences: 'La falta de retención del talento clave puede generar pérdida de conocimientos valiosos, aumento en los costos de reclutamiento y capacitación, disminución de la productividad, impacto negativo en la moral del equipo y dificultad para alcanzar objetivos estratégicos.',
        probability: 'Alta',
        impact: 'Medio',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        slug: 'risk-2',
        name: 'Demoras en la atención al cliente',
        description: 'La atención al cliente es ineficiente, tarda hasta 2 horas en responderle a un cliente y 4 para solucionar el problema',
        risk_source: 'Alta demanda y poca disponibilidad',
        origin: 'Interno',
        possible_consequences: 'Quejas de los clientes, perdida en la confianza de los clientes',
        probability: 'Alta',
        impact: 'Medio',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        slug: 'risk-3',
        name: 'Comunicación inadecuada con el cliente',
        description: 'El equipo no se logra comunicar con el cliente, las formas de respuesta no son adecuadas',
        risk_source: 'Uso escazo de canales de atención',
        origin: 'Interno',
        possible_consequences: 'Quejas de los clientes, perdida en la confianza de los clientes',
        probability: 'Media',
        impact: 'Medio',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        slug: 'risk-4',
        name: 'Pérdida de engagement con la audiencia',
        description: 'La audiencia no es atraida por los metodos de marketing de la empresa, falta de estrategia en medios de comunicacion',
        risk_source: 'Contenidos poco atractivos en las redes',
        origin: 'Interno',
        possible_consequences: 'Si no se atraen clientes regularmente los ingresos de la empresa bajaran significativamente y no se verá el progreso',
        probability: 'Baja',
        impact: 'Alto',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        slug: 'risk-5',
        name: 'Baja efectividad en campañas',
        description: 'La atracción de clientes no es la esperada debido a la mala segmentación, implementación o estrategia de campañas digitales',
        risk_source: 'Estrategias defcientes y mala segmentación',
        origin: 'Externo',
        possible_consequences: 'Si no se atraen clientes regularmente los ingresos de la empresa bajaran significativamente y no se verá el progreso',
        probability: 'Media',
        impact: 'Alto',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        slug: 'risk-6',
        name: 'Desalineación con tendencias del mercado',
        description: 'No se esta proyectando bien los clientes objetivos de la empresa y los segmentos del mercado',
        risk_source: 'Falta de análisis del mercado y competencia',
        origin: 'Interno',
        possible_consequences: 'Mala implementación de campañas',
        probability: 'Baja',
        impact: 'Alto',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        slug: 'risk-7',
        name: 'Alta Rotación de Personal',
        description: 'El personal persive condiciones inadecuadas o poco favorables para trabajar, lo que causa muchas renuncias y se tenga que recontratar personal',
        risk_source: 'Falta de incetivos y malas condiciones',
        origin: 'Interno',
        possible_consequences: 'Perdida de tiempo y dinero en entrenar al nuevo personal para que se adapte a la empresa, asi como perdida de reputacion',
        probability: 'Baja',
        impact: 'Medio',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        slug: 'risk-8',
        name: 'Bajo compromiso del personal',
        description: 'El personal no atiende las tareas con calidad o no cumple con los tiempos de entrega',
        risk_source: 'Cultura organizacional débil',
        origin: 'Interno',
        possible_consequences: 'Malos trabajos y perdidas de tiempo para el cliente, lo que causa perdida de confiaza y reputación',
        probability: 'Baja',
        impact: 'Alto',
        created_at: new Date(),
        updated_at: new Date(),
      }
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('risks', null, {})
  }
}
