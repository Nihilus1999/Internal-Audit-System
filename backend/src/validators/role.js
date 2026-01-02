import { check } from 'express-validator'
import { validateResult } from '../helpers/handleValidator.js'
import { Role } from '../models/role.js'
import { Permission } from '../models/permission.js'
import { validate as validateUUID } from 'uuid'

export const validateRole = [
    check('name')
        .exists()
        .notEmpty()
        .withMessage('Se requiere el nombre del rol')
        .isLength({ max: 50 })
        .withMessage('El nombre del rol debe tener máximo 50 caracteres')
        .custom(async (value, { req }) => {
            if(value === null || value === undefined) throw new Error('Nombre inválido')
            if (req.method === 'POST') {
                const existingRole = await Role.unscoped().findOne({ where: { name: value }, paranoid: false })
                if (existingRole) throw new Error('Ya existe un rol con este nombre')
            } else if (req.method === 'PUT') {       
                const existingRole = await Role.unscoped().findOne({ where: { name: value }, paranoid: false })
                if (existingRole && existingRole.id !== req.params.id) throw new Error('Otro rol ya utiliza este nombre')
            }
            return true
        }),
    check('status')
        .custom((value, { req }) => {
            if (req.method === 'POST') return true
            if (value===null || value === undefined) throw new Error('Se requiere el estado del rol')
            if (typeof value !== 'boolean') throw new Error('El estado debe ser un valor booleano: true o false')
            return true
        }),
    check('ids_permission')
        .exists()
        .isArray({ min: 1 })
        .withMessage('El rol debe tener permisos asociados')
        .custom(async (value, { req }) => {
            if(value === null || value === undefined) throw new Error('Ids de permisos inválidos')
            if (!value.every(id => validateUUID(id))) throw new Error('El id de los permisos deben ser del tipo: UUID')
            const permissions = await Permission.unscoped().findAll({
                where: { id: value }
            })
            if (permissions.length !== value.length) throw new Error('Algunos permisos no existen')
            if (permissions.some(p => !p.status)) throw new Error('No se pueden asignar permisos inactivos a los roles')
            return true
        }),
    (req, res, next) => {
        validateResult(req, res, next)
    }
]


