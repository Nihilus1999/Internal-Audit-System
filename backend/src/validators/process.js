import { check } from 'express-validator'
import { validateResult } from '../helpers/handleValidator.js'
import { Process } from '../models/process.js'
import { User } from '../models/user.js'
import { validate as validateUUID } from 'uuid'

export const validateProcess = [
    check('name')
        .exists()
        .notEmpty()
        .withMessage('Se requiere el nombre del proceso')
        .isLength({ max: 100 })
        .withMessage('El nombre del proceso debe tener máximo 100 caracteres')
        .custom(async (value, { req }) => {
            if(value === null || value === undefined) throw new Error('Nombre inválido')
            const existingProcess = await Process.unscoped().findOne({ where: { name: value }, paranoid: false })
            if (req.method === 'POST') {
                if (existingProcess) throw new Error('Ya existe un proceso con este nombre')
            } else if (req.method === 'PUT') {       
                if (existingProcess) {
                    const id  = req.params.id
                    let processId = validateUUID(id) ? existingProcess.id : existingProcess.slug
                    if ((processId !== id)) throw new Error('Otro proceso ya utiliza este nombre')
                }
            }
            return true
        }),
    check('description')
        .exists()
        .notEmpty()
        .withMessage('Se requiere la descripción del proceso')
        .isLength({ max: 255 })
        .withMessage('La descripción debe tener máximo 255 caracteres'),
    check('objective')
        .exists()
        .notEmpty()
        .withMessage('Se requiere el objetivo del proceso')
        .isLength({ max: 255 })
        .withMessage('El objetivo debe tener máximo 255 caracteres'),
    check('status')
        .custom((value, { req }) => {
            if (req.method === 'POST') return true
            if (value===null || value === undefined) throw new Error('Se requiere el estado del rol')
            if (typeof value !== 'boolean') throw new Error('El estado debe ser un valor booleano: true o false')
            return true
        }),
    check('ids_user')
        .exists()
        .isArray({ min: 1 })
        .withMessage('El proceso debe tener responsables asociados')
        .custom(async (value, { req }) => {
            if(value === null || value === undefined) throw new Error('Ids de usuario inválidos')
            if (!value.every(id => validateUUID(id))) throw new Error('El id de los usuarios deben ser del tipo: UUID')
            const users = await User.unscoped().findAll({ where: { id: value } })
            if (users.length !== value.length) throw new Error('Algunos usuarios no existen')
            if (users.some(u => !u.status)) throw new Error('No se pueden asignar usuarios inactivos a los procesos')
            return true
        }),
    (req, res, next) => {
        validateResult(req, res, next)
    }
]


