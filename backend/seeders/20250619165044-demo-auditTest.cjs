'use strict'

const { v4: uuidv4 } = require('uuid')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [auditPrograms] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM audit_programs WHERE slug IN 
      ('auditoría-de-marketing-FY2024')`
    )
    const auditProgramMap = {}
    for (const ap of auditPrograms) {
      auditProgramMap[ap.slug] = ap.id
    }
    return queryInterface.bulkInsert('audit_tests', [
      {
        id: uuidv4(),
        slug: 'revisión-del-análisis-de-tendencias-del-mercado-FY2024',
        title: 'Revisión del Análisis de Tendencias del Mercado',
        objective: 'Evaluar cómo las tendencias actuales del mercado impactan en la atención al cliente y en la estrategia comercial',
        scope: 'Análisis de reportes de mercado, estudios sectoriales y datos de comportamiento del consumidor',
        procedure: 'Revisar y analizar los informes de tendencias del mercado relevantes para identificar oportunidades y riesgos relacionados con la atención al cliente',
        evaluation_criteria: 'Identificación de tendencias clave, comparación con desempeño actual y recomendaciones para alinear estrategias comerciales',
        estimated_hours: 13,
        start_date: '2025-05-03',
        conclusion: null,
        recommendations: null,
        status: 'Por iniciar',
        id_audit_program: auditProgramMap['auditoría-de-marketing-FY2024'],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        slug: 'evaluación-del-kpi-cr-(tasa-de-conversión)-en-campañas-de-marketing-digital-FY2024',
        title: 'Evaluación del KPI CR (Tasa de Conversión) en campañas de marketing digital',
        objective: 'Verificar que la tasa de conversión obtenida en campañas digitales esta correctamente calculada y se alinea con los objetivos establecidos e históricos internos.',
        scope: 'Campañas digitales a traves de Ads de Google y Meta ejecutadas entre mayo 2024 y marzo 2025, enfocadas en formularios de contacto, suscripciones y compras directas.',
        procedure: 'Obtener el número de conversiones y visitas desde los reportes de Google Analytics y Meta. Calcular manualmente la tasa de conversión y compararla con la tasa reportada. Validar que los eventos de conversión están bien configurados. Revisar si se documentaron acciones correctivas o ajustes según los resultados. Verificar si los resultados obtenidos cumplen con los objetivos del negocio',
        evaluation_criteria: 'El cálculo de la tasa de conversión es correcto (conversiones /visitasx100). La fuente de datos es confiable y trazable. Se utilizaron los resultados para ajustar campañas o estrategias.',
        estimated_hours: 2,
        start_date: '2025-04-26',
        conclusion: null,
        recommendations: null,
        status: 'En progreso',
        id_audit_program: auditProgramMap['auditoría-de-marketing-FY2024'],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        slug: 'evaluación-del-roi-(return-on-investment)-en-campañas-digitales-FY2024',
        title: 'Evaluación del ROI (Return on Investment) en campañas digitales',
        objective: 'Verificar que el retorno de inversión se ha calculado correctamente y refleja adecuadamente el desempeño económico de las campañas.',
        scope: 'Campañas digitales a traves de Ads de Google y Meta ejecutadas entre mayo 2024 y marzo 2025, enfocadas en formularios de contacto, suscripciones y compras directas.',
        procedure: 'Obtener el costo total de las campañas (inversión). Verificar ingresos generados atribuibles a las campañas. Calcular ROI = [(Ingresos - Costos) / Costos] × 100. Comparar con el ROI reportado.',
        evaluation_criteria: 'Datos financieros respaldados. El cálculo de ROI es correcto y trazable ([(Ingresos-Costos)/Costos]×100). ROI es utilizado en análisis posteriores y optimización.',
        estimated_hours: 3,
        start_date: '2025-05-10',
        conclusion: null,
        recommendations: null,
        status: 'En progreso',
        id_audit_program: auditProgramMap['auditoría-de-marketing-FY2024'],
        created_at: new Date(),
        updated_at: new Date(),
      }
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('audit_tests', null, {})
  }
}
