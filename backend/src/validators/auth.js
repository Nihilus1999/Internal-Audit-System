import { check } from 'express-validator'
import { validateResult } from '../helpers/handleValidator.js'

export const validateLogin = [
    check('identifier')
        .optional()
        .notEmpty()
        .withMessage('Se requiere el identificador (correo electrónico o nombre de usuario)'),
    check('password')
        .exists()
        .notEmpty()
        .withMessage('Se requiere la contraseña'),
    (req, res, next) => {
        validateResult(req, res, next)
    }
]

export const validateOTP = [
    check('email')
        .exists()
        .notEmpty()
        .withMessage('Se requiere el correo electrónico')
        .isEmail()
        .withMessage('Correo electrónico inválido'),
    check('otp_code')
        .custom((value, { req }) => {
            if (req.originalUrl.includes('/request-reset')) return true
            if (!value) throw new Error('El código OTP es requerido')
            if (typeof value !== 'string') throw new Error('El código OTP debe ser una cadena de texto');
            if (!/^\d{6}$/.test(value)) throw new Error('El código OTP debe tener exactamente 6 dígitos')
            return true
        }),
    (req, res, next) => {
        validateResult(req, res, next)
    }
]