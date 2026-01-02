'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [auditPrograms] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM audit_programs WHERE slug IN 
      ('auditoría-de-marketing-FY2024', 'auditoría-de-atención-al-cliente-FY2022')`
    )
    const [processes] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM processes WHERE slug IN ('process-1', 'process-2')`
    )
    const [controls] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM controls WHERE slug IN 
      ('control-1', 'control-2', 'control-3', 'control-4')`
    )
    const auditProgramMap = {}
    for (const ap of auditPrograms) {
      auditProgramMap[ap.slug] = ap.id
    }
    const processMap = {}
    for (const p of processes) {
      processMap[p.slug] = p.id
    }
    const controlMap = {}
    for (const c of controls) {
      controlMap[c.slug] = c.id
    }
    const records = []
    records.push({
      id_audit_program: auditProgramMap['auditoría-de-atención-al-cliente-FY2022'],
      id_process: processMap['process-1'],
      id_control: controlMap['control-1'],
      created_at: new Date(),
      updated_at: new Date()
    })
    records.push({
      id_audit_program: auditProgramMap['auditoría-de-atención-al-cliente-FY2022'],
      id_process: processMap['process-1'],
      id_control: controlMap['control-2'],
      created_at: new Date(),
      updated_at: new Date()
    })
    records.push({
      id_audit_program: auditProgramMap['auditoría-de-marketing-FY2024'],
      id_process: processMap['process-2'],
      id_control: controlMap['control-3'],
      created_at: new Date(),
      updated_at: new Date()
    })
    records.push({
      id_audit_program: auditProgramMap['auditoría-de-marketing-FY2024'],
      id_process: processMap['process-2'],
      id_control: controlMap['control-4'],
      created_at: new Date(),
      updated_at: new Date()
    })
    return queryInterface.bulkInsert('audit_process_controls', records)
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('audit_process_controls', null, {})
  }
}
