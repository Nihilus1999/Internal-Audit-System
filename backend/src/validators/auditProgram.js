import { check } from 'express-validator'
import { validateResult } from '../helpers/handleValidator.js'
import { User } from '../models/user.js'
import { Process } from '../models/process.js'
import { Control } from '../models/control.js'
import { validate as validateUUID } from 'uuid'

export const validateAuditProgram = [
    check('name')
        .exists()
        .notEmpty()
        .withMessage('Se requiere el nombre del programa de auditoría')
        .isLength({ max: 100 })
        .withMessage('El nombre del programa de auditoría debe tener máximo 100 caracteres'),
    check('objectives')
        .exists()
        .notEmpty()
        .withMessage('Se requiere los objetivos del programa de auditoría'),
    check('scope')
        .exists()
        .notEmpty()
        .withMessage('Se requiere el alcance del programa de auditoría'),
    check('evaluation_criteria')
        .exists()
        .notEmpty()
        .withMessage('Se requieren los criterios de evaluación del programa de auditoría'),
    check('audited_period_start_date')
        .exists()
        .notEmpty()
        .withMessage('Se requiere la fecha de inicio del período auditado')
        .isISO8601()
        .withMessage('La fecha de inicio del período auditado debe tener el formato YYYY-MM-DD'),
    check('audited_period_end_date')
        .exists()
        .notEmpty()
        .withMessage('Se requiere la fecha de fin del período auditado')
        .isISO8601()
        .withMessage('La fecha de fin del período auditado debe tener el formato YYYY-MM-DD')
        .custom((value, { req }) => {
            const audited_period_start_date = req.body.audited_period_start_date
            if (audited_period_start_date && new Date(audited_period_start_date) > new Date(value)) {
                throw new Error('La fecha de fin del período auditado debe ser posterior o igual a la fecha de inicio del período auditado')
            }
            return true
        }),
    check('start_date')
        .exists()
        .notEmpty()
        .withMessage('Se requiere la fecha de inicio de la auditoría')
        .isISO8601()
        .withMessage('La fecha de inicio de de la auditoría debe tener el formato YYYY-MM-DD')
        .custom((value, { req }) => {
            const audited_period_end_date = req.body.audited_period_end_date
            if (audited_period_end_date && new Date(audited_period_end_date) >= new Date(value)) {
                throw new Error('La fecha de inicio de la auditoría debe ser posterior a la fecha de fin del período auditado')
            }
            return true
        }),
    check('end_date')
        .exists()
        .notEmpty()
        .withMessage('Se requiere la fecha de fin de la auditoría')
        .isISO8601()
        .withMessage('La fecha de fin de la auditoría debe tener el formato YYYY-MM-DD')
        .custom((value, { req }) => {
            const start_date = req.body.start_date
            if (start_date && new Date(start_date) > new Date(value)) {
                throw new Error('La fecha de fin de la auditoría debe ser posterior o igual a la fecha de inicio')
            }
            return true
        }),
    check('ids_process')
        .custom(async (value, { req }) => {
            if (req.method === 'PUT') return true
            if(!Array.isArray(value) || value.length === 0) throw new Error('El programa de auditoría debe tener procesos asociados')
            if (!value.every(id => validateUUID(id))) throw new Error('El id de los procesos deben ser del tipo: UUID')
            const processes = await Process.unscoped().findAll({ where: { id: value } })
            if (processes.length !== value.length) throw new Error('Algunos procesos no existen')
            if (processes.some(p => !p.status)) throw new Error('No se pueden asignar procesos inactivos a los programas de auditoría')
            return true
        }),
    check('ids_user')
        .custom(async (value, { req }) => {
            if (req.method === 'PUT') return true
            if(!Array.isArray(value) || value.length === 0) throw new Error('El programa de auditoría debe tener participantes asociados')
            if (!value.every(id => validateUUID(id))) throw new Error('El id de los usuarios deben ser del tipo: UUID')
            const users = await User.unscoped().findAll({ where: { id: value } })
            if (users.length !== value.length) throw new Error('Algunos usuarios no existen')
            if (users.some(u => !u.status)) throw new Error('No se pueden asignar usuarios inactivos a los programas de auditoría')
            return true
        }),
    (req, res, next) => {
        validateResult(req, res, next)
    }
]

export const validateAuditStatus = [
    check('status')
        .exists()
        .notEmpty()
        .withMessage('Se requiere el estado del programa de auditoría')
        .isIn(['Por iniciar', 'En progreso', 'Completado'])
        .withMessage('El estado debe ser Por iniciar, En progreso o Completado'),
    (req, res, next) => {
        validateResult(req, res, next)
    }
]

export const validatePlanningProcesses = [
    check('ids_process')
        .exists()
        .isArray({ min: 1 })
        .withMessage('El programa de auditoría debe tener procesos asociados')
        .custom(async (value, { req }) => {
            if(value === null || value === undefined) throw new Error('Ids de procesos inválidos')
            if (!value.every(id => validateUUID(id))) throw new Error('El id de los procesos deben ser del tipo: UUID')
            const processes = await Process.unscoped().findAll({ where: { id: value } })
            if (processes.length !== value.length) throw new Error('Algunos procesos no existen')
            if (processes.some(p => !p.status)) throw new Error('No se pueden asignar procesos inactivos a los programas de auditoría')
            return true
        }),
    (req, res, next) => {
        validateResult(req, res, next)
    }
]


export const validatePlanningControls = [
    check('ids_control')
        .exists()
        .isArray({ min: 1 })
        .withMessage('El programa de auditoría debe tener controles asociados')
        .custom(async (value, { req }) => {
            if(value === null || value === undefined) throw new Error('Ids de controles inválidos')
            if (!value.every(id => validateUUID(id))) throw new Error('El id de los controles deben ser del tipo: UUID')
            const controls = await Control.unscoped().findAll({ where: { id: value } })
            if (controls.length !== value.length) throw new Error('Algunos controles no existen')
            if (controls.some(c => !c.status)) throw new Error('No se pueden asignar controles inactivos a los programas de auditoría')
            return true
        }),
    (req, res, next) => {
        validateResult(req, res, next)
    }
]

export const validatePlanningUsers = [
    check('ids_user')
        .exists()
        .isArray({ min: 1 })
        .withMessage('El programa de auditoría debe tener participantes asociados')
        .custom(async (value, { req }) => {
            if(value === null || value === undefined) throw new Error('Ids de usuarios inválidos')
            if (!value.every(id => validateUUID(id))) throw new Error('El id de los usuarios deben ser del tipo: UUID')
            const users = await User.unscoped().findAll({ where: { id: value } })
            if (users.length !== value.length) throw new Error('Algunos usuarios no existen')
            if (users.some(u => !u.status)) throw new Error('No se pueden asignar usuarios inactivos a los programas de auditoría')
            return true
        }),
    (req, res, next) => {
        validateResult(req, res, next)
    }
]

export const validatePlanningHours = [
    check('planning_requirements_hours')
        .exists()
        .withMessage('Las horas de planificación son requeridas')
        .isInt({ min: 0, max: 32767 })
        .withMessage('Las horas de planificación deben ser un número entero mayor o igual a 0'),
    check('test_execution_hours')
        .exists()
        .withMessage('Las horas de ejecución de pruebas son requeridas')
        .isInt({ min: 0, max: 32767 })
        .withMessage('Las horas de ejecución de pruebas deben ser un número entero mayor o igual a 0'),
    check('document_evidence_hours')
        .exists()
        .withMessage('Las horas de documentación de evidencia son requeridas')
        .isInt({ min: 0, max: 32767 })
        .withMessage('Las horas de documentación de evidencia deben ser un número entero mayor o igual a 0'),
    check('document_findings_hours')
        .exists()
        .withMessage('Las horas de documentación de hallazgos son requeridas')
        .isInt({ min: 0, max: 32767 })
        .withMessage('Las horas de documentación de hallazgos deben ser un número entero mayor o igual a 0'),
    check('report_preparation_hours')
        .exists()
        .withMessage('Las horas de preparación del informe son requeridas')
        .isInt({ min: 0, max: 32767 })
        .withMessage('Las horas de preparación del informe deben ser un número entero mayor o igual a 0'),
    check('report_revision_hours')
        .exists()
        .withMessage('Las horas de revisión del informe son requeridas')
        .isInt({ min: 0, max: 32767 })
        .withMessage('Las horas de revisión del informe deben ser un número entero mayor o igual a 0'),
    (req, res, next) => {
        validateResult(req, res, next)
    }
]

export const validateResultsReport = [
    check('report_title')
        .exists()
        .notEmpty()
        .withMessage('Se requiere el título del informe de resultados del programa de auditoría')
        .isLength({ max: 120 })
        .withMessage('El título del informe de resultados debe tener máximo 120 caracteres'),
    check('report_introduction')
        .exists()
        .notEmpty()
        .withMessage('Se requiere la introducción del informe de resultados del programa de auditoría'),
    check('report_audit_summary')
        .exists()
        .notEmpty()
        .withMessage('Se requiere el resumen del informe de resultados del programa de auditoría'),
    check('report_auditor_opinion')
        .exists()
        .notEmpty()
        .withMessage('Se requiere la opinión del auditor del informe de resultados del programa de auditoría'),
    check('report_conclusion')
        .exists()
        .notEmpty()
        .withMessage('Se requiere la conclusión del informe de resultados del programa de auditoría'),
    (req, res, next) => {
        validateResult(req, res, next)
    }
]