import { check } from 'express-validator'
import { validateResult } from '../helpers/handleValidator.js'

export const validateTask = [
    check('name')
        .exists()
        .notEmpty()
        .withMessage('Se requiere el nombre de la tarea')
        .isLength({ max: 200 })
        .withMessage('El nombre de la tarea debe tener máximo 200 caracteres'),
    check('status')
        .custom((value, { req }) => {
            if (req.method === 'POST') return true
            if (value===null || value === undefined) throw new Error('Se requiere el estado de la tarea')
            if (typeof value !== 'boolean') throw new Error('El estado debe ser un valor booleano: true o false')
            return true
        }),
    (req, res, next) => {
        validateResult(req, res, next)
    }
]


