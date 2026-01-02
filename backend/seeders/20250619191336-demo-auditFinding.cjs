'use strict'

const { v4: uuidv4 } = require('uuid')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [auditTests] = await queryInterface.sequelize.query(
      `SELECT id, slug, id_audit_program FROM audit_tests WHERE slug IN ('revisión-del-análisis-de-tendencias-del-mercado-FY2024', 'evaluación-del-kpi-cr-(tasa-de-conversión)-en-campañas-de-marketing-digital-FY2024', 'evaluación-del-roi-(return-on-investment)-en-campañas-digitales-FY2024')`
    )
    const auditTestMap = {}
    for (const at of auditTests) {
      auditTestMap[at.slug] = at.id
    }
    return queryInterface.bulkInsert('audit_findings', [
      {
        id: uuidv4(),
        slug: 'análisis-de-tendencias-alineado-con-estrategia-comercial-con-mejoras-FY2024',
        title: 'Análisis de tendencias alineado con estrategia comercial con mejoras',
        observations: 'El informe de tendencias se encuentra actualizado, con análisis relevantes y bien documentados. Se sugiere seguir buscando clientes en otros tipos de mercado',
        classification: 'Menor',
        root_cause: 'Adecuado proceso de análisis de datos y contextualización del mercado, con capacidad para explorar otros',
        possible_consequences: 'Es importante seguir mejorando el análisis de las tendencias del mercado para evitar temporadas bajas de clientes',
        finding_type: 'Conforme',
        recommendations: 'Continuar con el enfoque proactivo del análisis. Considerar escenarios de riesgo asociados a cambios drásticos del mercado.',
        id_audit_test: auditTestMap['revisión-del-análisis-de-tendencias-del-mercado-FY2024'],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        slug: 'cálculo-incorrecto-de-la-tasa-de-conversión-en-campañas-digitales-FY2024',
        title: 'Cálculo incorrecto de la tasa de conversión en campañas digitales',
        observations: 'Se identificó una discrepancia entre el cálculo manual de la tasa de conversión y la tasa reportada por los dashboards.',
        classification: 'Importante',
        root_cause: 'Configuración incorrecta de eventos en herramientas analíticas',
        possible_consequences: "Desviaciones en la toma de decisiones estratégicas debido a información inexacta",
        finding_type: 'No conforme',
        recommendations: 'Revisar la configuración de eventos en Google Analytics y Meta. Implementar un proceso de verificación de datos previo al reporte.',
        id_audit_test: auditTestMap['evaluación-del-kpi-cr-(tasa-de-conversión)-en-campañas-de-marketing-digital-FY2024'],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        slug: 'falta-de-trazabilidad-en-el-cálculo-del-roi-FY2024',
        title: 'Falta de trazabilidad en el cálculo del ROI',
        observations: 'No se encontraron respaldos financieros suficientes que justifiquen los ingresos atribuibles al ROI reportado.',
        classification: 'Crítico',
        root_cause: 'Falta de integración entre plataformas publicitarias y registros contables',
        possible_consequences: "Riesgo de decisiones erróneas sobre inversión publicitaria y presupuestos",
        finding_type: 'No conforme',
        recommendations: 'Establecer un sistema de conciliación mensual entre datos publicitarios y registros financieros. Implementar un control documental.',
        id_audit_test: auditTestMap['evaluación-del-roi-(return-on-investment)-en-campañas-digitales-FY2024'],
        created_at: new Date(),
        updated_at: new Date(),
      }
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('audit_findings', null, {})
  }
}
