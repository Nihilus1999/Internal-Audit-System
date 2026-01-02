import { check } from 'express-validator'
import { validateResult } from '../helpers/handleValidator.js'
import { AuditProgram } from '../models/auditProgram.js'
import { AuditTest } from '../models/auditTest.js'
import { Control } from '../models/control.js'
import { User } from '../models/user.js'
import { AuditProcessControl } from '../models/auditProcessControl.js'
import { AuditUser } from '../models/auditUser.js'
import { validate as validateUUID } from 'uuid'

export const validatePlanningAuditTest = [
    check('title')
        .exists()
        .notEmpty()
        .withMessage('Se requiere el título de la prueba de auditoría')
        .isLength({ max: 100 })
        .withMessage('El título de la prueba de auditoría debe tener máximo 100 caracteres'),
    check('objective')
        .exists()
        .notEmpty()
        .withMessage('Se requiere el objetivo de la prueba de auditoría')
        .isLength({ max: 255 })
        .withMessage('El objetivo de la prueba de auditoría debe tener máximo 255 caracteres'),
    check('scope')
        .exists()
        .notEmpty()
        .withMessage('Se requiere el alcance de la prueba de auditoría')
        .isLength({ max: 255 })
        .withMessage('El alcance de la prueba de auditoría debe tener máximo 255 caracteres'),
    check('procedure')
        .exists()
        .notEmpty()
        .withMessage('Se requiere el procedimiento de la prueba de auditoría'),
    check('evaluation_criteria')
        .exists()
        .notEmpty()
        .withMessage('Se requieren los criterios de evaluación de la prueba de auditoría')
        .isLength({ max: 255 })
        .withMessage('Los criterios de evaluación de la prueba de auditoría deben tener máximo 255 caracteres'),
    check('estimated_hours')
        .exists()
        .withMessage('Las horas estimadas de ejecución de la prueba es requerido')
        .isInt({ min: 1, max: 32767 })
        .withMessage('Las horas estimadas de ejecución de la prueba debe ser un número entero mayor a 0'),
    check('start_date')
        .exists()
        .notEmpty()
        .withMessage('Se requiere la fecha de inicio de la prueba de auditoría')
        .isISO8601()
        .withMessage('La fecha de inicio de la prueba de auditoría debe tener el formato YYYY-MM-DD')
        .custom(async (value, { req }) => {
            const id = req.params.id
            let condition = validateUUID(id) ? { id } : { slug: id }
            if (req.method === 'PUT') {
                const auditTest = await AuditTest.unscoped().findOne({ where: condition })
                if (!auditTest) return true
                condition = { id: auditTest.id_audit_program }
            }
            const auditProgram = await AuditProgram.unscoped().findOne({ where: condition })
            if (!auditProgram) return true
            if (new Date(auditProgram.start_date) >= new Date(value)) {
                throw new Error('La fecha de inicio de la prueba debe ser posterior a la fecha de inicio del programa auditoría')
            }
            if (new Date(value) >= new Date(auditProgram.end_date)) {
                throw new Error('La fecha de inicio de la prueba debe ser anterior a la fecha de fin del programa auditoría')
            }
            return true
        }),
    check('status')
        .custom((value, { req }) => {
            if (req.method === 'POST') return true
            if (value===null || value === undefined) throw new Error('Se requiere el estado de la prueba')
            if (typeof value !== 'string') throw new Error('El estado debe ser un string')
            const allowedStatuses = ['Por iniciar', 'Suspendido']
            if (!allowedStatuses.includes(value)) throw new Error(`En la fase de planificación, el estado de la prueba debe ser uno de: ${allowedStatuses.join(', ')}`)
            return true
        }),
    check('ids_control')
        .exists()
        .isArray({ min: 1 })
        .withMessage('La prueba de auditoría debe tener controles asociados')
        .custom(async (value, { req }) => {
            if(value === null || value === undefined) throw new Error('Ids de control inválidos')
            if (!value.every(id => validateUUID(id))) throw new Error('El id de los controles deben ser del tipo: UUID')
            const id = req.params.id
            let condition = validateUUID(id) ? { id } : { slug: id }
            if (req.method === 'PUT') {
                const auditTest = await AuditTest.unscoped().findOne({ where: condition })
                condition = { id: auditTest.id_audit_program }
            }
            const auditProgram = await AuditProgram.unscoped().findOne({ where: condition })
            const validControls = await AuditProcessControl.findAll({
                where: {
                    id_audit_program: auditProgram.id,
                    id_control: value
                },
                attributes: ['id_control'],
            })
            const validControlIds = validControls.map(c => c.id_control)
            const controls = await Control.unscoped().findAll({ where: { id: validControlIds } })
            if (controls.length !== value.length) throw new Error('Algunos controles no estan asignados al programa de auditoría o no existen')
            if (controls.some(c => !c.status)) throw new Error('No se pueden asignar controles inactivos a las pruebas de auditoría')
            return true
        }),
    check('ids_user')
        .exists()
        .isArray({ min: 1 })
        .withMessage('La prueba de auditoría debe tener usuarios asociados')
        .custom(async (value, { req }) => {
            if(value === null || value === undefined) throw new Error('Ids de usuario inválidos')
            if (!value.every(id => validateUUID(id))) throw new Error('El id de los usuarios deben ser del tipo: UUID')
            const id = req.params.id
            let condition = validateUUID(id) ? { id } : { slug: id }
            if (req.method === 'PUT') {
                const auditTest = await AuditTest.unscoped().findOne({ where: condition })
                condition = { id: auditTest.id_audit_program }
            }
            const auditProgram = await AuditProgram.unscoped().findOne({ where: condition })
            const validUsers = await AuditUser.findAll({
                where: {
                    id_audit_program: auditProgram.id,
                    id_user: value
                },
                attributes: ['id_user'],
            })
            const validUserIds = validUsers.map(u => u.id_user)
            const users = await User.unscoped().findAll({ where: { id: validUserIds } })
            if (users.length !== value.length) throw new Error('Algunos usuarios no estan asignados al programa de auditoría o no existen')
            if (users.some(u => !u.status)) throw new Error('No se pueden asignar usuarios inactivos a las pruebas de auditoría')
            return true
        }),
    (req, res, next) => {
        validateResult(req, res, next)
    }
]

export const validateConclusionsAuditTest = [
    check('conclusion')
        .exists()
        .withMessage('Se requiere la conclusión de la prueba'),
    check('recommendations')
        .exists()
        .withMessage('Se requiere las recomendaciones de la prueba'),
    check('status')
        .exists()
        .notEmpty()
        .withMessage('Se requiere el estado de la prueba')
        .isIn(['Por iniciar', 'En progreso', 'Completado'])
        .withMessage('El estado de la prueba debe ser: Por iniciar, En progreso o Completado'),
    (req, res, next) => {
        validateResult(req, res, next)
    }
]
