'use strict'

const { v4: uuidv4 } = require('uuid')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('audit_programs', [
      {
        id: uuidv4(),
        slug: 'auditoría-de-marketing-FY2024',
        name: 'Auditoría de Marketing',
        objectives: 'Analizar la efectividad de las estrategias de marketing implementadas, evaluar el retorno de inversión (ROI) de las campañas, y verificar la alineación de las acciones de marketing con los objetivos estratégicos de la organización.',
        scope: 'La auditoría abarcará los procesos relacionados con la planificación, ejecución y seguimiento de campañas de marketing digital y tradicional, análisis de mercado, gestión de marca y comunicación. No incluirá funciones administrativas ni procesos financieros.',
        evaluation_criteria: 'Se evaluará la coherencia de las campañas con el plan estratégico de marketing, la eficiencia en la gestión de recursos, la calidad de los análisis de mercado, el cumplimiento de indicadores clave (KPIs) y la documentación y trazabilidad de las acciones realizadas',
        fiscal_year: 2024,
        audited_period_start_date: '2024-05-07',
        audited_period_end_date: '2025-03-14',
        start_date: '2025-04-15',
        end_date: '2025-05-22',
        report_title: null,
        report_introduction: null,
        report_audit_summary: null,
        report_auditor_opinion: null,
        report_conclusion: null,
        status: 'En ejecución',
        planning_status: 'Completado',
        execution_status: 'En progreso',
        execution_status: 'Por iniciar',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        slug: 'auditoría-de-atención-al-cliente-FY2022',
        name: 'Auditoría de Atención al Cliente',
        objectives: 'Evaluar la calidad y eficacia del servicio al cliente, analizar la satisfacción y fidelización de los clientes, identificar áreas de mejora en los procesos de atención y verificar la alineación de la gestión del servicio con los estándares de la organización.',
        scope: 'La auditoría abarcará los procesos relacionados con la recepción, gestión y resolución de consultas, quejas y reclamos de clientes, la capacitación y desempeño del personal de atención, así como los canales de comunicación disponibles. No incluirá áreas administrativas ni procesos financieros.',
        evaluation_criteria: 'Se evaluará la capacidad de respuesta y resolución de problemas, la satisfacción del cliente basada en encuestas y feedback, la eficiencia y consistencia de los procesos de atención, el cumplimiento de tiempos de respuesta establecidos y la documentación y seguimiento de casos.',
        fiscal_year: 2022,
        audited_period_start_date: '2022-05-07',
        audited_period_end_date: '2023-03-14',
        start_date: '2024-03-15',
        end_date: '2024-04-14',
        report_title: null,
        report_introduction: null,
        report_audit_summary: null,
        report_auditor_opinion: null,
        report_conclusion: null,
        status: 'Por iniciar',
        planning_status: 'Por iniciar',
        execution_status: 'Por iniciar',
        execution_status: 'Por iniciar',
        created_at: new Date(),
        updated_at: new Date(),
      }
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('audit_programs', null, {})
  }
}
