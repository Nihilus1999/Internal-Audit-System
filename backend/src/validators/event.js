import { check } from 'express-validator'
import { validateResult } from '../helpers/handleValidator.js'
import { Risk } from '../models/risk.js'
import { validate as validateUUID } from 'uuid'

export const validateEvent = [
    check('name')
        .exists()
        .notEmpty()
        .withMessage('Se requiere el nombre del evento')
        .isLength({ max: 100 })
        .withMessage('El nombre del evento debe tener máximo 100 caracteres'),
    check('description')
        .exists()
        .notEmpty()
        .withMessage('Se requiere la descripción del evento')
        .isLength({ max: 255 })
        .withMessage('La descripción debe tener máximo 255 caracteres'),
    check('cause')
        .exists()
        .notEmpty()
        .withMessage('Se requiere la causa del evento')
        .isLength({ max: 255 })
        .withMessage('La causa debe tener máximo 255 caracteres'),
    check('consequences')
        .exists()
        .notEmpty()
        .withMessage('Se requiere la consecuencia del evento'),
    check('criticality')
        .exists()
        .notEmpty()
        .withMessage('Se requiere la criticidad del evento')
        .isIn(['Alta', 'Media', 'Baja'])
        .withMessage('La criticidad del evento debe ser Alta, Media o Baja'),
    check('incident_date')
        .exists()
        .notEmpty()
        .withMessage('Se requiere la fecha del incidente del evento')
        .isISO8601()
        .withMessage('La fecha del incidente debe tener el formato YYYY-MM-DD'),
    check('incident_hour')
        .optional({ nullable: true })
        .custom(value => {
            if (value === null || value === undefined) return true
            if (typeof value !== 'string' || value.trim() === '') throw new Error('La hora del incidente debe ser una cadena no vacía en formato HH:mm:ss')
            const regex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/
            if (!regex.test(value)) throw new Error('La hora del incidente debe tener el formato HH:mm:ss')
            return true
        }),
    check('economic_loss')
        .optional({ nullable: true })
        .custom(value => {
            if (value === null || value === undefined) return true
            if (typeof value !== 'number') throw new Error('Debe ser un número')
            if (!Number.isFinite(value)) throw new Error('Número inválido')
            if (value < 0) throw new Error('La pérdida económica no puede ser un número negativo')
            const decimalPlaces = value.toString().split('.')[1]?.length || 0
            if (decimalPlaces > 2) throw new Error('Máximo dos decimales permitidos')
            return true
        }),
    check('status')
        .custom((value, { req }) => {
            if (req.method === 'POST') return true
            if (value===null || value === undefined) throw new Error('Se requiere el estado del evento')
            if (typeof value !== 'string') throw new Error('El estado debe ser un string')
            const allowedStatuses = ['Reportado', 'En resolución', 'Cerrado', 'Anulado']
            if (!allowedStatuses.includes(value)) throw new Error(`El estado debe ser uno de: ${allowedStatuses.join(', ')}`)
            return true
        }),
    check('ids_risk')
        .custom(async (value, { req }) => {
            if (value===null || value === undefined) throw new Error('Los riesgos del evento no puede ser null')
            if (!Array.isArray(value)) throw new Error('El campo ids_risk debe ser un arreglo')
            if (value.length === 0) return true
            if (!value.every(id => validateUUID(id))) throw new Error('El id de los riesgos deben ser del tipo: UUID')
            const risks = await Risk.unscoped().findAll({ where: { id: value } })
            if (risks.length !== value.length) throw new Error('Algunos risgos no existen')
            if (risks.some(r => !r.status)) throw new Error('No se pueden asignar riesgos inactivos a los eventos')
            return true
        }),
    (req, res, next) => {
        validateResult(req, res, next)
    }
]


