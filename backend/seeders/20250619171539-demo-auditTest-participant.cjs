'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [auditTests] = await queryInterface.sequelize.query(
      `SELECT id, slug, id_audit_program FROM audit_tests WHERE slug IN ('revisión-del-análisis-de-tendencias-del-mercado-FY2024', 'evaluación-del-kpi-cr-(tasa-de-conversión)-en-campañas-de-marketing-digital-FY2024', 'evaluación-del-roi-(return-on-investment)-en-campañas-digitales-FY2024')`
    )
    const [users] = await queryInterface.sequelize.query(
      `SELECT id, username FROM users WHERE username IN ('aasencio11')`
    )
    const auditProgramId = auditTests[0]?.id_audit_program
    console.log(auditProgramId )
    const userId = users[0]?.id
    const auditTestMap = {}
    for (const at of auditTests) {
      auditTestMap[at.slug] = at.id
    }
    const records = []
    records.push({
      id_audit_test: auditTestMap['revisión-del-análisis-de-tendencias-del-mercado-FY2024'],
      id_audit_program: auditProgramId,
      id_user: userId,
      created_at: new Date(),
      updated_at: new Date()
    })
    records.push({
      id_audit_test: auditTestMap['evaluación-del-kpi-cr-(tasa-de-conversión)-en-campañas-de-marketing-digital-FY2024'],
      id_audit_program: auditProgramId,
      id_user: userId,
      created_at: new Date(),
      updated_at: new Date()
    })
    records.push({
      id_audit_test: auditTestMap['evaluación-del-roi-(return-on-investment)-en-campañas-digitales-FY2024'],
      id_audit_program: auditProgramId,
      id_user: userId,
      created_at: new Date(),
      updated_at: new Date()
    })
    return queryInterface.bulkInsert('audit_test_participants', records)
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('audit_test_participants', null, {})
  }
}
