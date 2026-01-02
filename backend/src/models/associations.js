import { Role } from './role.js'
import { Permission } from './permission.js'
import { RolePermission } from './rolePermission.js'
import { Company } from './company.js'
import { Process } from './process.js'
import { User } from './user.js'
import { ProcessUser } from './processUser.js'
import { Risk } from './risk.js'
import { RiskProcess } from './riskProcess.js'
import { Event } from './event.js'
import { EventRisk } from './eventRisk.js'
import { Control } from './control.js'
import { ProcessControl } from './processControl.js'
import { ControlRisk } from './controlRisk.js'
import { AuditProgram } from './auditProgram.js'
import { AuditProcessControl } from './auditProcessControl.js'
import { AuditUser } from './auditUser.js'
import { AuditTest } from './auditTest.js'
import { AuditTestUser } from './auditTestUser.js'
import { AuditTestControl } from './auditTestControl.js'
import { AuditFinding } from './auditFinding.js'
import { AuditFindingControl } from './auditFindingControl.js'
import { ActionPlan } from './actionPlan.js'
import { ActionPlanUser } from './actionPlanUser.js'
import { Task } from './task.js'
import { File } from './file.js'
import { PasswordReset } from './passwordReset.js'

//ROLES Y PERMISOS
Role.belongsToMany(Permission, {
    through: RolePermission,
    foreignKey: 'id_role',
    otherKey: 'id_permission',
})
  
Permission.belongsToMany(Role, {
    through: RolePermission,
    foreignKey: 'id_permission',
    otherKey: 'id_role',
})

//ROL CON USUARIO
Role.hasMany(User, {foreignKey: 'id_role'})
User.belongsTo(Role, {foreignKey: 'id_role'})

//USUARIO CON PASSWORD RESET
User.hasMany(PasswordReset, { foreignKey: 'id_user'})
PasswordReset.belongsTo(User, { foreignKey: 'id_user'})

//COMPAÑIA CON USUARIOS Y PROCESOS
Company.hasMany(Process, {foreignKey: 'id_company'})
Company.hasMany(User, {foreignKey: 'id_company'})
User.belongsTo(Company, {foreignKey: 'id_company'})
Process.belongsTo(Company, {foreignKey: 'id_company'})

//PROCESOS Y RESPONSABLES
Process.belongsToMany(User, {
    through: ProcessUser,
    foreignKey: 'id_process',
    otherKey: 'id_user',
})
  
User.belongsToMany(Process, {
    through: ProcessUser,
    foreignKey: 'id_user',
    otherKey: 'id_process',
})

//PROCESOS Y CONTROLES
Process.belongsToMany(Control, {
    through: ProcessControl,
    foreignKey: 'id_process',
    otherKey: 'id_control',
})
  
Control.belongsToMany(Process, {
    through: ProcessControl,
    foreignKey: 'id_control',
    otherKey: 'id_process',
})

//RIESGOS Y PROCESOS
Risk.belongsToMany(Process, {
    through: RiskProcess,
    foreignKey: 'id_risk',
    otherKey: 'id_process',
})

Process.belongsToMany(Risk, {
    through: RiskProcess,
    foreignKey: 'id_process',
    otherKey: 'id_risk',
})

//EVENTOS Y RIESGOS
Event.belongsToMany(Risk, {
    through: EventRisk,
    foreignKey: 'id_event',
    otherKey: 'id_risk',
})

Risk.belongsToMany(Event, {
    through: EventRisk,
    foreignKey: 'id_risk',
    otherKey: 'id_event',
})

//CONTROLES Y RIESGOS
Control.belongsToMany(Risk, {
    through: ControlRisk,
    foreignKey: 'id_control',
    otherKey: 'id_risk',
})

Risk.belongsToMany(Control, {
    through: ControlRisk,
    foreignKey: 'id_risk',
    otherKey: 'id_control',
})

//PROGRAMA DE AUDITORIA Y PROCESOS CON CONTROLES
AuditProgram.hasMany(AuditProcessControl, {
    foreignKey: 'id_audit_program',
})
AuditProcessControl.belongsTo(AuditProgram, {
    foreignKey: 'id_audit_program',
})

Process.hasMany(AuditProcessControl, {
    foreignKey: 'id_process',
})
AuditProcessControl.belongsTo(Process, {
    foreignKey: 'id_process',
})

Control.hasMany(AuditProcessControl, {
    foreignKey: 'id_control',
})
AuditProcessControl.belongsTo(Control, {
    foreignKey: 'id_control',
})

//PROGRAMA DE AUDITORIA Y PARTICIPANTES
AuditProgram.belongsToMany(User, {
    through: AuditUser,
    foreignKey: 'id_audit_program',
    otherKey: 'id_user',
})

User.belongsToMany(AuditProgram, {
    through: AuditUser,
    foreignKey: 'id_user',
    otherKey: 'id_audit_program',
})

//PROGRAMA DE AUDITORIA CON PRUEBAS DE AUDITORIA
AuditProgram.hasMany(AuditTest, {foreignKey: 'id_audit_program'})
AuditTest.belongsTo(AuditProgram, {foreignKey: 'id_audit_program'})

//PRUEBA DE AUDITORIA Y PARTICIPANTES
AuditTest.hasMany(AuditTestUser, {
    foreignKey: 'id_audit_test',
})
AuditTestUser.belongsTo(AuditTest, {
    foreignKey: 'id_audit_test',
})

AuditProgram.hasMany(AuditTestUser, {
    foreignKey: 'id_audit_program',
})
AuditTestUser.belongsTo(AuditProgram, {
    foreignKey: 'id_audit_program',
})

User.hasMany(AuditTestUser, {
    foreignKey: 'id_user',
})
AuditTestUser.belongsTo(User, {
    foreignKey: 'id_user',
})

//PRUEBA DE AUDITORIA Y CONTROLES
AuditTest.hasMany(AuditTestControl, {
    foreignKey: 'id_audit_test',
})
AuditTestControl.belongsTo(AuditTest, {
    foreignKey: 'id_audit_test',
})

AuditProgram.hasMany(AuditTestControl, {
    foreignKey: 'id_audit_program',
})
AuditTestControl.belongsTo(AuditProgram, {
    foreignKey: 'id_audit_program',
})

Process.hasMany(AuditTestControl, {
    foreignKey: 'id_process',
})
AuditTestControl.belongsTo(Process, {
    foreignKey: 'id_process',
})

Control.hasMany(AuditTestControl, {
    foreignKey: 'id_control',
})
AuditTestControl.belongsTo(Control, {
    foreignKey: 'id_control',
})

//PRUEBA DE AUDITORIA Y HALLAZGOS
AuditTest.hasMany(AuditFinding, {foreignKey: 'id_audit_test'})
AuditFinding.belongsTo(AuditTest, {foreignKey: 'id_audit_test'})

//HALLAZGOS Y CONTROLES
AuditFinding.hasMany(AuditFindingControl, {
    foreignKey: 'id_audit_finding',
})
AuditFindingControl.belongsTo(AuditFinding, {
    foreignKey: 'id_audit_finding',
})

AuditTest.hasMany(AuditFindingControl, {
    foreignKey: 'id_audit_test',
})
AuditFindingControl.belongsTo(AuditTest, {
    foreignKey: 'id_audit_test',
})

AuditProgram.hasMany(AuditFindingControl, {
    foreignKey: 'id_audit_program',
})
AuditFindingControl.belongsTo(AuditProgram, {
    foreignKey: 'id_audit_program',
})

Process.hasMany(AuditFindingControl, {
    foreignKey: 'id_process',
})
AuditFindingControl.belongsTo(Process, {
    foreignKey: 'id_process',
})

Control.hasMany(AuditFindingControl, {
    foreignKey: 'id_control',
})
AuditFindingControl.belongsTo(Control, {
    foreignKey: 'id_control',
})

//PLAN DE ACCION CON HALLAZGO O EVENTO
Event.hasMany(ActionPlan, {foreignKey: 'id_event'})
ActionPlan.belongsTo(Event, {foreignKey: 'id_event'})

AuditFinding.hasMany(ActionPlan, {foreignKey: 'id_finding'})
ActionPlan.belongsTo(AuditFinding, {foreignKey: 'id_finding'})

//PLAN DE ACCION CON TAREAS
ActionPlan.hasMany(Task, {foreignKey: 'id_action_plan'})
Task.belongsTo(ActionPlan, {foreignKey: 'id_action_plan'})

//PLAN DE ACCION Y RESPONSABLES
ActionPlan.belongsToMany(User, {
    through: ActionPlanUser,
    foreignKey: 'id_action_plan',
    otherKey: 'id_user',
})

User.belongsToMany(ActionPlan, {
    through: ActionPlanUser,
    foreignKey: 'id_user',
    otherKey: 'id_action_plan',
})

//ARCHIVO CON PRUEBA DE AUDITORIA O EVENTO
AuditTest.hasMany(File, {foreignKey: 'id_audit_test'})
File.belongsTo(AuditTest, {foreignKey: 'id_audit_test'})

Event.hasMany(File, {foreignKey: 'id_event'})
File.belongsTo(Event, {foreignKey: 'id_event'})
