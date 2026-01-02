'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [auditFindings] = await queryInterface.sequelize.query(
      `SELECT id, slug, id_audit_test FROM audit_findings WHERE slug IN ('análisis-de-tendencias-alineado-con-estrategia-comercial-con-mejoras-FY2024', 'cálculo-incorrecto-de-la-tasa-de-conversión-en-campañas-digitales-FY2024', 'falta-de-trazabilidad-en-el-cálculo-del-roi-FY2024')`
    )
    const [auditTests] = await queryInterface.sequelize.query(
      `SELECT id, slug, id_audit_program FROM audit_tests WHERE slug IN ('revisión-del-análisis-de-tendencias-del-mercado-FY2024', 'evaluación-del-kpi-cr-(tasa-de-conversión)-en-campañas-de-marketing-digital-FY2024', 'evaluación-del-roi-(return-on-investment)-en-campañas-digitales-FY2024')`
    )
    const [processes] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM processes WHERE slug IN ('process-2')`
    )
    const [controls] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM controls WHERE slug IN 
      ('control-3', 'control-4')`
    )
    const auditProgramId = auditTests[0]?.id_audit_program
    const processId = processes[0]?.id
    const auditFindingsMap = {}
    for (const af of auditFindings) {
      auditFindingsMap[af.slug] = af.id
    }
    const auditTestsMap = {}
    for (const at of auditTests) {
      auditTestsMap[at.slug] = at.id
    }
    const controlMap = {}
    for (const c of controls) {
      controlMap[c.slug] = c.id
    }
    const records = []
    records.push({
      id_audit_finding: auditFindingsMap['análisis-de-tendencias-alineado-con-estrategia-comercial-con-mejoras-FY2024'],
      id_audit_test: auditTestsMap['revisión-del-análisis-de-tendencias-del-mercado-FY2024'],
      id_audit_program: auditProgramId,
      id_process: processId,
      id_control: controlMap['control-3'],
      created_at: new Date(),
      updated_at: new Date()
    })
    records.push({
      id_audit_finding: auditFindingsMap['cálculo-incorrecto-de-la-tasa-de-conversión-en-campañas-digitales-FY2024'],
      id_audit_test: auditTestsMap['evaluación-del-kpi-cr-(tasa-de-conversión)-en-campañas-de-marketing-digital-FY2024'],
      id_audit_program: auditProgramId,
      id_process: processId,
      id_control: controlMap['control-4'],
      created_at: new Date(),
      updated_at: new Date()
    })
    records.push({
      id_audit_finding: auditFindingsMap['falta-de-trazabilidad-en-el-cálculo-del-roi-FY2024'],
      id_audit_test: auditTestsMap['evaluación-del-roi-(return-on-investment)-en-campañas-digitales-FY2024'],
      id_audit_program: auditProgramId,
      id_process: processId,
      id_control: controlMap['control-4'],
      created_at: new Date(),
      updated_at: new Date()
    })
    return queryInterface.bulkInsert('audit_finding_controls', records)
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('audit_finding_controls', null, {})
  }
}
