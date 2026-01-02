'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [auditPrograms] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM audit_programs WHERE slug IN ('auditoría-de-marketing-FY2024', 'auditoría-de-atención-al-cliente-FY2022')`
    )

    const [users] = await queryInterface.sequelize.query(
      `SELECT id, username FROM users WHERE username IN ('aasencio11', 'jelasmar24')`
    )
    
    const usersMap = {}
    for (const u of users) {
      usersMap[u.username] = u.id
    }
    const records = auditPrograms.map((auditProgram) => {
      let userId = null
      if (['auditoría-de-marketing-FY2024'].includes(auditProgram.slug)) {
        userId = usersMap['aasencio11']
      } else if (['auditoría-de-atención-al-cliente-FY2022'].includes(auditProgram.slug)) {
        userId = usersMap['jelasmar24']
      }
      return {
        id_audit_program: auditProgram.id,
        id_user: userId,
        planning_requirements_hours: 0,
        test_execution_hours: 0,
        document_evidence_hours: 0,
        document_findings_hours: 0,
        report_preparation_hours: 0,
        report_revision_hours: 0,
        created_at: new Date(),
        updated_at: new Date(),
      }
    })
    return queryInterface.bulkInsert('audit_participants', records)
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('audit_participants', null, {})
  }
}
