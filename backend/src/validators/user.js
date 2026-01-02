import { User } from '../models/user.js'
import { Role } from '../models/role.js'
import { check } from 'express-validator'
import { validateResult } from '../helpers/handleValidator.js'
import { validate as validateUUID } from 'uuid'

export const validateUser = [
    check('first_name')
        .exists()
        .notEmpty()
        .withMessage('Se requiere el primer nombre')
        .isLength({ max: 50 })
        .withMessage('El primer nombre debe tener máximo 50 caracteres'),
    check('last_name')
        .exists()
        .notEmpty()
        .withMessage('Se requiere el primer apellido')
        .isLength({ max: 50 })
        .withMessage('El primer apellido debe tener máximo 50 caracteres'),
    check('email')
        .exists()
        .isEmail()
        .withMessage('Correo electrónico inválido')
        .isLength({ max: 255 })
        .withMessage('El correo electrónico debe tener máximo 255 caracteres')
        .custom(async (value, { req }) => {
            if(value === null || value === undefined) throw new Error('Se requiere el correo electrónico del usuario')
            if (req.method === 'POST') { //Si estoy creando el usuario, verifico que no haya un usuario con ese correo electrónico
                const existingUser = await User.unscoped().findOne({ where: { email: value }, paranoid: false })
                if (existingUser) {
                    throw new Error('Ya existe un usuario con este correo electrónico')
                }
            } else if (req.method === 'PUT') { //Si estoy actualizando el usuario, verifico que no haya otro usuario con ese correo electrónico
                let id_user
                if (req.originalUrl.includes('/profile')) {
                    id_user = req.user.id
                } else {
                    id_user = req.params.id
                }          
                const existingUser = await User.unscoped().findOne({ where: { email: value }, paranoid: false })
                if (existingUser && existingUser.id !== id_user) {
                    throw new Error('Otro usuario ya utiliza este correo electrónico')
                }
            }
            return true
        }),
    check('phone') 
        .exists()
        .isMobilePhone()
        .withMessage('Número de teléfono invalido'),
    check('status')
        .custom((value, { req }) => {
            if (req.method === 'POST' || (req.method === 'PUT' && req.originalUrl.includes('/profile'))) return true
            if (value===null || value === undefined) throw new Error('Se requiere el estado del usuario')
            if (typeof value !== 'boolean') throw new Error('El estado debe ser un valor booleano: true o false')
            return true
        }),
    check('id_role')
        .custom(async (value, { req }) => {
            if(req.method === 'PUT' && req.originalUrl.includes('/profile')) return true
            if (value===null || value === undefined) throw new Error('Se requiere el rol del usuario')
            if (!validateUUID(value)) throw new Error('El id del rol debe ser del tipo: UUID')
            const role = await Role.unscoped().findByPk(value)
            if (!role) throw new Error('El rol especificado no existe')
            if (!role.status) throw new Error('No se puede asignar un rol deshabilitado')
            return true
        }),
    (req, res, next) => {
        validateResult(req, res, next)
    }  
]

