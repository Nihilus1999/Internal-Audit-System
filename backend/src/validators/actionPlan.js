import { check } from 'express-validator'
import { validateResult } from '../helpers/handleValidator.js'
import { User } from '../models/user.js'
import { Event } from '../models/event.js'
import { AuditFinding } from '../models/auditFinding.js'
import { validate as validateUUID } from 'uuid'

export const validateActionPlan = [
    check('name')
        .exists()
        .notEmpty()
        .withMessage('Se requiere el nombre del plan de acción')
        .isLength({ max: 100 })
        .withMessage('El nombre del plan de acción debe tener máximo 100 caracteres'),
    check('description')
        .exists()
        .notEmpty()
        .withMessage('Se requiere la descripción del evento'),
    check('plan_type')
        .exists()
        .notEmpty()
        .withMessage('Se requiere el tipo de plan de acción')
        .isIn(['Evento', 'Hallazgo'])
        .withMessage('El tipo de evento debe ser Evento o Hallazgo'),
    check('start_date')
        .exists()
        .notEmpty()
        .withMessage('Se requiere la fecha de inicio del plan de acción')
        .isISO8601()
        .withMessage('La fecha de inicio debe tener el formato YYYY-MM-DD'),
    check('end_date')
        .exists()
        .notEmpty()
        .withMessage('Se requiere la fecha de fin del plan de acción')
        .isISO8601()
        .withMessage('La fecha de fin debe tener el formato YYYY-MM-DD')
        .custom((value, { req }) => {
            const start_date = req.body.start_date
            if (start_date && new Date(start_date) > new Date(value)) {
                throw new Error('La fecha de fin debe ser posterior o igual a la fecha de inicio')
            }
            return true
        }),
    check('status')
        .custom((value, { req }) => {
            if (req.method === 'POST') return true
            if (value===null || value === undefined) throw new Error('Se requiere el estado del plan de acción')
            if (typeof value !== 'string') throw new Error('El estado debe ser un string')
            const allowedStatuses = ['Pendiente', 'En progreso', 'Completado', 'Suspendido']
            if (!allowedStatuses.includes(value)) throw new Error(`El estado debe ser uno de: ${allowedStatuses.join(', ')}`)
            return true
        }),
    check('id_event')
        .custom(async (value, { req }) => {
            if (req.body.plan_type === 'Hallazgo') return true
            if (req.body.id_finding !== null) throw new Error('No se debe asignar un hallazgo cuando el plan de acción es de tipo Evento')
            if (!value || typeof value !== 'string' || value.trim() === '') throw new Error('Se requiere el ID del evento')
            if (!validateUUID(value)) throw new Error('El id del evento debe ser del tipo: UUID')
            const event = await Event.unscoped().findByPk(value)
            if (!event) throw new Error('El evento especificado no existe')
            if (event.status == 'Anulado') throw new Error('El evento se encuentra anulado y no se puede asignar al plan de acción')
            return true
        }),
    check('id_finding')
        .custom(async (value, { req }) => {
            if (req.body.plan_type === 'Evento') return true
            if (req.body.id_event !== null) throw new Error('No se debe asignar un evento cuando el plan de acción es de tipo Hallazgo')
            if (!value || typeof value !== 'string' || value.trim() === '') throw new Error('Se requiere el ID del hallazgo')
            if (!validateUUID(value)) throw new Error('El id del hallazgo debe ser del tipo: UUID')
            const auditFinding = await AuditFinding.unscoped().findByPk(value)
            if (!auditFinding) throw new Error('El hallazgo especificado no existe')
            if (!auditFinding.status) throw new Error('El hallazgo se encuentra inactivo y no se puede asignar al plan de acción')
            return true
        }),
    check('ids_user')
        .exists()
        .isArray({ min: 1 })
        .withMessage('El plan de accion debe tener responsables asociados')
        .custom(async (value, { req }) => {
            if(value === null || value === undefined) throw new Error('Ids de usuario inválidos')
            if (!value.every(id => validateUUID(id))) throw new Error('El id de los usuarios deben ser del tipo: UUID')
            const users = await User.unscoped().findAll({ where: { id: value } })
            if (users.length !== value.length) throw new Error('Algunos usuarios no existen')
            if (users.some(u => !u.status)) throw new Error('No se pueden asignar usuarios inactivos a los planes de acción')
            return true
        }),
    (req, res, next) => {
        validateResult(req, res, next)
    }
]


