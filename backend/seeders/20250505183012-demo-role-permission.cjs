'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id, name FROM roles WHERE name IN ('Administrador', 'Gerente de Auditoría')`
    )
    const adminRole = roles.find(r => r.name === 'Administrador')
    const managerRole = roles.find(r => r.name === 'Gerente de Auditoría')
    const adminPermissionKeys = [
      'get.user', 'create.user', 'update.user',
      'get.role', 'create.role', 'update.role',
      'get.company', 'update.company',
      'get.process', 'create.process', 'update.process',
    ]
    const managerPermissionKeys = [
      'get.risk', 'create.risk', 'update.risk',
      'get.event', 'create.event', 'update.event',
      'get.control', 'create.control', 'update.control',
      'get.audit_program', 'get.all.audit_program', 'create.audit_program', 'update.audit_program',
      'update.status.audit_program', 'update.planning.audit_program', 'update.execution.audit_program',
      'manage.all.tests.audit_program', 'update.report.audit_program',
      'get.action_plan', 'create.action_plan', 'update.action_plan', 'get.user', 'get.process'
    ]
    const permissions = await queryInterface.sequelize.query(
      `SELECT id, key FROM permissions WHERE key IN (:keys)`,
      { replacements: { keys: [...adminPermissionKeys, ...managerPermissionKeys] }, type: Sequelize.QueryTypes.SELECT }
    )
    const permissionMap = {}
    for (const p of permissions) {
      permissionMap[p.key] = p.id
    }
    // Preparar inserciones para rol administrador
    const adminRecords = adminPermissionKeys
      .filter(key => permissionMap[key])
      .map(key => ({
        id_role: adminRole.id,
        id_permission: permissionMap[key],
        created_at: new Date(),
        updated_at: new Date(),
      }))
    // Preparar inserciones para rol gerente de auditoría
    const managerRecords = managerPermissionKeys
      .filter(key => permissionMap[key])
      .map(key => ({
        id_role: managerRole.id,
        id_permission: permissionMap[key],
        created_at: new Date(),
        updated_at: new Date(),
      }))
    // Insertar en tabla intermedia
    return queryInterface.bulkInsert('role_permissions', [...adminRecords, ...managerRecords])
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('role_permissions', null, {})
  }
}
